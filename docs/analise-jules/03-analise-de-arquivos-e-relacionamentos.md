# 03 - Análise de Arquivos e Relacionamentos no Maestro (v6.0)

A estrutura de código do servidor Maestro MCP é organizada majoritariamente dentro da pasta `src/src/`, abrangendo desde os pontos de entrada até camadas complexas de middleware, roteamento, estado, regras de negócio e integrações especializadas. Abaixo encontra-se uma análise profunda do propósito de cada arquivo crítico e suas inter-relações.

## Raiz de Inicialização e Transporte

O ponto de partida do ciclo de vida da aplicação pode variar de acordo com o protocolo escolhido para a conexão MCP.

-   **`src/src/server.ts`**
    -   *Propósito*: Este é o "Fábrica Central" (Factory) do servidor Maestro. Contém a configuração de alto nível e inicialização da instância do SDK MCP (`@modelcontextprotocol/sdk/server/index.js`).
    -   *Relacionamentos*:
        -   Consome handlers em `src/src/handlers/` para registrar as capacidades de "Resources" (recursos passivos lidos pelas IDEs) e "Prompts" (templates interativos).
        -   Delega toda a interface de chamadas ativas (`tools/call`) para o roteador unificado no `router.ts`.
        -   Inicia a captura das capacidades do cliente através de `services/client-capabilities.service.js`.

-   **`src/src/stdio.ts`**
    -   *Propósito*: Implementa o transporte de I/O padrão (STDIO), usado tipicamente por IDEs como Windsurf, Cursor e Cline, onde o servidor é um processo filho invocado pelo próprio host.
    -   *Relacionamentos*: Invoca `createMaestroServer()` do `server.ts` e conecta ao `StdioServerTransport` do SDK do MCP. O arquivo é leve, servindo apenas para injetar o transporte correto e tratar a saída `console.error` (usada como log, já que `stdout` está reservado para o MCP).

-   **`src/src/index.ts`** (Descontinuado ou Legado em V6)
    -   *Propósito*: Um fallback HTTP e SSE (Server-Sent Events) desenhado para ambientes em nuvem ou como cliente proxy. Ele reimplementa de forma não oficial o suporte JSON-RPC, pois as abstrações de Streamable HTTP SDK do MCP ainda estão imaturas para as necessidades do projeto.
    -   *Relacionamentos*: Utiliza Express para mapear as rotas HTTP (`/mcp`, `/health`) e delega o conteúdo da requisição JSON-RPC (`tools/call`, `resources/read`) de forma análoga a `server.ts`, invocando `router.ts` e handlers compartilhados.

## Roteamento Unificado e Definições de Ferramentas

As ferramentas expostas à IA no contexto são gerenciadas por um roteador central e implementações consolidadas para reduzir a carga cognitiva (tokens) no LLM.

-   **`src/src/router.ts`**
    -   *Propósito*: É o cérebro das invocações JSON-RPC de "tools". O router abriga a definição pública e oficial das *5 Core Tools*: `maestro`, `executar`, `validar`, `analisar`, e `contexto`. Qualquer requisição feita pelo LLM (por exemplo, "maestro({ acao: 'setup_inicial' })") mapeia obrigatoriamente neste arquivo.
    -   *Relacionamentos*:
        -   Importa o envoltorio `applyOrchestrationPipeline` de `src/middleware/index.js` e o aplica ao redor de cada handler das *core tools*.
        -   Importa as implementações consolidadas de `src/tools/consolidated/` e as clássicas (agora delegadas, como `contexto` e `maestroTool`).
        -   Inclui "Backward Compatibility" através de `legacy-tools.ts`. Ferramentas antigas da versão 4 e 5 são interceptadas por mapeamento e repassadas com avisos de deprecamento aos novos endpoints consolidados.

## Implementações de Ferramentas (The 5 Core Tools)

Estas são as invocações de domínio que operam as mutações no projeto do desenvolvedor:

-   **`src/src/tools/maestro-tool.ts`** (`maestro`)
    -   *Propósito*: É o portal de criação e inicialização. Se nenhum projeto existe (pasta local `.maestro/`), esta ferramenta lida com o *Onboarding* (qual IDE, qual tipo de inteligência e escopo). Se já existe um projeto, ela age como um dashboard, informando ao LLM o resumo do projeto, progresso global e qual é o próximo passo aguardando execução.
    -   *Relacionamentos*: Depende de `src/state/` para buscar e inicializar o estado local (`estado.json`). Dispara funções em `tools/iniciar-projeto.js` internamente para transições de setup.

-   **`src/src/tools/consolidated/executar.ts`** (`executar`)
    -   *Propósito*: Ferramenta principal ("canivete suíço") para transições de estado, escrita de conteúdo e manipulação de *checkpoints*. Ela aglutina as lógicas legadas de `avancar`, `salvar` e `checkpoint`, direcionando pela propriedade `acao` fornecida pela IA.
    -   *Relacionamentos*: Chama `avancar.js` (quando o desenvolvedor conclui um entregável e quer subir para a próxima fase metodológica), `salvar.js` (quando se faz um rascunho sem finalizar a etapa atual), e `checkpoint-tool.ts` (para salvar pontos de restauração ou reverter estados no `estado.json` via Git ou rollback interno).

-   **`src/src/tools/consolidated/validar.ts`** (`validar`)
    -   *Propósito*: Acionado explicitamente se houver validações manuais rigorosas como análise de complacência de conformidade (LGPD, HIPAA) ou avaliação manual do entregável (Gate).
    -   *Relacionamentos*: Envolve os serviços de `core/validation/ValidationPipeline.ts` para inferir a integridade do conteúdo enviado através do `entregavel` fornecido ou verificações de compliance.

-   **`src/src/tools/consolidated/analisar.ts`** (`analisar`)
    -   *Propósito*: Substitui todas as antigas ferramentas individuais de linting e segurança em uma única requisição. Com base no parâmetro `tipo`, realiza o *check* estático do código.
    -   *Relacionamentos*: Redireciona para handlers de análise técnica na pasta `tools/analise/` (como `seguranca.js`, `qualidade.js`, `performance.js`). Faz chamadas cruzadas com `fase1/validation.tools.js` se for checagem de dependência ou *sampling*.

-   **`src/src/tools/contexto.ts`** (`contexto`)
    -   *Propósito*: Fornece contexto hiperfocado e compacto para as janelas de chat da IA. Exibe as Decisões Arquiteturais Históricas (ADRs), padrões do codebase e *skills* (conhecimento do especialista daquela fase).
    -   *Relacionamentos*: Utiliza as classes em `core/knowledge/KnowledgeBase.js` para iterar nos metadados de `.maestro/adrs/`. Consome os pacotes de orientações localizados em `services/skill-loader.service.js`.

## Pipeline de Orquestração e Intervenção de Middlewares

Em `src/src/middleware/`, a arquitetura unificada de orquestração encapsula as rotas em um formato tipo "Cebola" (Onion pattern).

-   **`orchestration-pipeline.middleware.ts`**: Coordena a ordem obrigatória da camada de rede. É a espinha dorsal de execução de uma requisição MCP no Maestro.
-   **`validation.middleware.ts`**: Age como um cão de guarda. Se a IA cometer falhas reiteradas na API do Maestro (e.g. formatar de forma incorreta o entregável), este middleware a coloca em `estado_compulsorio`. Nessa condição, a IA é proibida de avançar o projeto, sendo forçada a chamar as ferramentas de autocorreção ("TDD Invertido").
-   **`state-loader.middleware.ts`**: Responsável por ler do disco o arquivo `./.maestro/estado.json` (que armazena todo o ciclo de vida do projeto local do usuário), desserializá-lo e passá-lo ao manipulador final.
-   **`flow-engine.middleware.ts`**: Injeta a próxima ação ("Next Action") no retorno do LLM para guiá-lo logicamente com o menor atrito. Faz interface direta com o `flow-engine.ts`.
-   **`persistence.middleware.ts`**: Operador de *Side-effect*. Salva no disco qualquer alteração que as funções no `tools/` tenham realizado na memória do estado do projeto.
-   **`skill-injection.middleware.ts`**: Busca dentro de `content/` (ex: `specialists/`) os *prompts* formatados para a próxima fase — "Agora você é um arquiteto backend, faça isto e assado" — garantindo que a IDE incorpore o papel exigido pelo projeto.

## O Motor do Maestro (Flow Engine e Watcher)

Esses arquivos em `src/src/services/` abstraem o que antes era dependente de APIs externas:

-   **`flow-engine.ts`**: Determina em qual momento do "Ciclo de Vida do Software" o usuário se encontra. Trabalha como uma máquina de estados finitos que reage ao contexto de Onboarding vs Desenvolvimento e responde com o "Próximo Passo", incluindo restrições baseadas na escolha de modelo (Economy, Balanced, Quality).
-   **`watcher.service.ts`**: Representa a automação de *Smart Auto-Flow*. Usa bibliotecas de S.O. como `chokidar` ou `fs.watch` nativo para observar salvamentos em tempo real no disco.
    -   *Relacionamento*: Instancia o `ValidationPipeline` toda vez que o arquivo editado pela IDE é salvo localmente. Assim a IA não precisa explicitamente chamar `validar()`. O próprio servidor nota a alteração, executa TDD invertido e, caso as pontuações sejam altas, efetua a transição invisível de fase.

## Camada de Validação Robusta (Inverted TDD)

O coração técnico avaliativo vive no `src/src/core/validation/`.

-   **`ValidationPipeline.ts`**: A orquestradora central das checagens do código. Ela inicializa um conjunto hierárquico de camadas para testar o conteúdo recém-gerado, que atuam em cadeia (`Sintática -> Semântica -> Qualidade -> Arquitetura -> Segurança`).
    -   Se o projeto estiver numa fase funcional e não numa fase de código (ex: Escrevendo UX/UI, Requisitos em Markdown), invoca o `DeliverableValidator` para validar semânticas de Markdown e presenças de seções baseadas num `gate_checklist`.
    -   *Relacionamento*: A pontuação final é escrita num arquivo JSON de log em `.maestro/validation/reports/` e retonada ou ao middleware de validação para forçar o *Rollback*, ou aprovando silenciosamente para a próxima fase.
-   **`DependencyValidator.ts` & `SecurityValidator.ts`**: Implementações parciais (na pipeline) específicas para testar compatibilidade de versões no `package.json`/`pom.xml`/etc. e aderência a vulnerabilidades básicas do modelo OWASP.