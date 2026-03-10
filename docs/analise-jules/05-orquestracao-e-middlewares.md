# 05 - Orquestração e Middlewares (v6.0)

A arquitetura do Maestro MCP baseia-se em um modelo de **Pipeline Unificada de Orquestração** (`applyOrchestrationPipeline`). Esta abordagem adota o padrão *Decorator/Wrapper* (Cebola), assegurando que todas as requisições que modificam ou consultam o estado do projeto passem por um funil rigoroso de validação, formatação e injeção de contexto.

Este pipeline substitui as múltiplas variações de middlewares (light, smart, persistence) que existiam até a versão 5.2. O pipeline unificado é aplicado no roteador (`src/src/router.ts`) para todas as 5 ferramentas centrais.

## Ordem Rigorosa de Execução

A chamada de uma ferramenta via JSON-RPC atravessa os middlewares na seguinte ordem (de fora para dentro e vice-versa no retorno):

1.  **`withCompulsoryStateGuard` (Validation Middleware)**
    -   *Propósito*: Cão de guarda do **TDD Invertido**.
    -   *Como Funciona*: Antes de qualquer parsing, ele lê o arquivo `estado.json` (através de `fs`). Se a flag `em_estado_compulsorio` estiver `true` (significando que a IA acabou de reprovar num teste e precisa corrigir o código), este middleware verifica se a ferramenta solicitada está na whitelist (`tools_permitidas_no_compulsorio`, geralmente só `executar`, `validar`, `contexto`).
    -   *Impacto*: Se a IA tentar "fugir" do erro chamando a ferramenta `maestro` ou tentar pular de fase, a requisição é interceptada imediatamente com um erro severo instruindo a correção do problema atual.

2.  **`withErrorHandling` (Error Middleware)**
    -   *Propósito*: Previne que o servidor crashe ou quebre o túnel JSON-RPC/SSE da IDE.
    -   *Como Funciona*: Envolve os próximos middlewares em um `try/catch`. Captura exceções não tratadas e as transforma num array `content` com formato amigável em Markdown, garantindo que o LLM entenda o erro no terminal.

3.  **`withStateLoad` (State Loader Middleware)**
    -   *Propósito*: Economiza tokens e resolve o problema *stateless* do protocolo MCP.
    -   *Como Funciona*: Extrai o argumento obrigatório `diretorio` da chamada. Se a IA não forneceu o `estado_json` na requisição (o que seria custoso de enviar em toda chamada), este middleware lê ativamente o arquivo `.maestro/estado.json` do disco e o injeta nos argumentos da ferramenta (`args.estado_json`).

4.  **`withPersistence` (Persistence Middleware)**
    -   *Propósito*: Garantir a durabilidade atômica do estado.
    -   *Como Funciona*: Executa o handler da ferramenta. Ao retornar, verifica a propriedade `estado_atualizado` na resposta (`ToolResult`). Se existir, ele grava (sobrescreve) esse JSON no disco antes de passar o controle adiante. Assim, se a máquina desligar no meio de uma resposta para o LLM, o disco já está atualizado.

5.  **`withADRGeneration` (ADR Middleware)**
    -   *Propósito*: Extrator *Best-Effort* de memórias arquiteturais.
    -   *Como Funciona*: Pega o texto do entregável que foi passado nos argumentos da ferramenta (se for uma chamada de `executar`). Utilizando RegEx de PNL em português (ex: "decidimos utilizar", "escolhemos por"), tenta deduzir se alguma Decisão de Arquitetura foi tomada.
    -   *Impacto*: Se encontrar, ele salva fisicamente um novo arquivo Markdown em `.maestro/adrs/` e chama o `KnowledgeBase` para indexar a decisão. Adiciona uma nota visível ao LLM dizendo "X ADRs foram gerados automaticamente".

6.  **`withFlowEngine` (Flow Engine Middleware)**
    -   *Propósito*: Motor de inferência de próximos passos.
    -   *Como Funciona*: Ao retornar a resposta para o LLM, ele lê o estado e chama o `FlowEngine` (ver seção 06) para descobrir: "Dado que estamos na fase 3, qual a fase 4? Quais ferramentas o LLM precisa chamar a seguir?".
    -   *Impacto*: Injeta o objeto `next_action` (com a sugestão da próxima ferramenta, exemplo de args e prompt) nos metadados da requisição.

7.  **`withSkillInjection` (Skill Middleware)**
    -   *Propósito*: Concede uma persona metodológica à IA.
    -   *Como Funciona*: Analisa o estado retornado e descobre qual é a próxima fase do software (ex: "Fase 5 - Backend"). Procura em `content/specialists/` as instruções (Regras, Template e Checklist) do papel requerido (ex: *Arquiteto Backend*).
    -   *Impacto*: Injeta a string `specialist` e as heurísticas no prompt da resposta, mudando o comportamento do LLM na sua próxima inferência.

8.  **`withPromptValidation` (Prompt Validator Middleware)**
    -   *Propósito*: Sanidade da intenção.
    -   *Como Funciona*: Uma verificação final que garante que a resposta formou os metadados em conformidade com o que as IDEs MCP modernas esperam ver (embora seja uma função majoritariamente delegada à infraestrutura MCP nativa hoje em dia).

## O Handler Principal
No "miolo" dessa cebola está o handler real da ferramenta. Ele apenas executa a regra de negócios (ex: alterar o arquivo de código no sistema, avançar a flag `fase_atual`), desconhecendo toda a complexidade de persistência, carregamento e inferência acima descritas. Isso garante um *Separation of Concerns* limpo na arquitetura Maestro.