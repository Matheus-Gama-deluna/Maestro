# 02 - Arquitetura e Funcionamento do Maestro (v6.0)

O **Maestro MCP** possui uma arquitetura cliente-servidor nativa do Model Context Protocol (MCP), oferecendo dois *transports* principais para comunicação com as IDEs.

Abaixo, descrevemos o fluxo principal de requisição, as camadas de middleware e como o fluxo de execução é direcionado pela ferramenta de roteamento e serviços especializados.

## Topologia Cliente-Servidor e Transporte MCP

O servidor Maestro se comunica com clientes (IDEs como Windsurf, Cursor, Cline, etc.) implementando o protocolo MCP em JSON-RPC. Essa comunicação se dá de duas formas principais, dependendo do ambiente em que o servidor é instanciado:

1.  **Transporte via Standard I/O (stdio.ts)**:
    É o modo mais comum quando a IDE executa o processo diretamente. O servidor escuta comandos JSON-RPC em `stdin` e responde em `stdout`. Isso é inicializado via `@modelcontextprotocol/sdk/server/stdio.js` e consumido por IDEs que chamam o executável Node.js localmente.
2.  **Transporte via HTTP/SSE (index.ts / server.ts)**:
    Para compatibilidade com outros ambientes que requerem comunicação em rede (ex. Gemini e modelos hospedados), o Maestro oferece endpoints HTTP (ex: `POST /mcp`) e Server-Sent Events (SSE via `GET /mcp`). O SSE mantém a sessão ativa enquanto os comandos JSON-RPC são trafegados bidirecionalmente.

Independente do meio de transporte, todas as requisições se originam no roteador centralizado.

## Roteamento e Superfície de Ferramentas (The 5 Core Tools)

Ao invés de expor dezenas de ferramentas ao LLM — o que causa fadiga cognitiva ao modelo —, o Maestro expõe publicamente 5 ferramentas. O arquivo `src/router.ts` e `src/server.ts` interceptam essas chamadas e roteiam para o provedor adequado:

1.  `maestro`: Entry point. Lida com a criação e o status do projeto. O roteador invoca `tools/maestro-tool.ts`.
2.  `executar`: A ferramenta principal para avançar fases (`acao='avancar'`), salvar conteúdos e gerenciar *checkpoints*. Invoca `tools/consolidated/executar.ts`.
3.  `validar`: Focada na inspeção explícita de gates, entregáveis ou compliance de código. Invoca `tools/consolidated/validar.ts`.
4.  `analisar`: Direcionada à análise estática de código (segurança, dependências e performance). Invoca `tools/consolidated/analisar.ts`.
5.  `contexto`: Uma janela para a "memória de longo prazo" do Maestro, retornando registros de decisões (ADRs) e dados históricos estruturados. Invoca `tools/contexto.ts`.

Essas ferramentas delegam boa parte do seu trabalho a outros serviços (`src/services/`) e fluxos legados sob a interface unificada.

## A Pipeline de Orquestração (Middlewares)

Um dos avanços da v6 é a **Pipeline Unificada de Orquestração** (`applyOrchestrationPipeline` em `src/middleware/orchestration-pipeline.middleware.ts`), implementada como uma cadeia de *middlewares* no padrão *Decorator / Wrapper*.

Quando a IDE chama uma ferramenta através do roteador, a requisição passa rigorosamente por este pipeline de fora para dentro:

1.  **State Guard (`withCompulsoryStateGuard`)**: Intercepta a requisição e verifica se o sistema está aguardando explicitamente uma correção (quando `em_estado_compulsorio = true`). Impede oLLM de evadir erros e pular passos.
2.  **Error Handling (`withErrorHandling`)**: Captura exceções não tratadas durante a execução, transformando-as em mensagens amigáveis ao invés de quebrar o processo JSON-RPC.
3.  **State Loader (`withStateLoad`)**: O Maestro funciona em estado semi-stateless (por questões de MCP). Esse *middleware* auto-carrega o JSON de estado do diretório do projeto localmente em `.maestro/estado.json`, permitindo que a IA não precise repassar esse JSON gigantesco a cada *prompt*.
4.  **[Tool Handler]**: A lógica específica da ferramenta (por exemplo, `executar`) ocorre aqui no núcleo. Ela recebe as interações do LLM (nome do arquivo, conteúdo alterado).
5.  **Persistence (`withPersistence`)**: Automaticamente persiste qualquer alteração feita no estado da aplicação de volta para o disco, no arquivo `.maestro/estado.json`.
6.  **ADR Generation (`withADRGeneration`)**: Lê o contexto atual best-effort para deduzir se uma Decisão Arquitetural ocorreu. Se sim, salva um registro em `.maestro/adrs/`.
7.  **Flow Engine (`withFlowEngine`)**: Calcula o **próximo passo lógico** da aplicação, decidindo em qual fase o projeto está agora e empacotando o prompt de "next_action" a ser retornado ao LLM.
8.  **Skill Injection (`withSkillInjection`)**: Injeta na resposta da ferramenta informações específicas ("skills") que instruem a IA sobre a próxima fase, contendo templates ou instruções metodológicas do especialista requerido (ex: *Backend Architect*, *Frontend Dev*).
9.  **Prompt Validation (`withPromptValidation`)**: Uma verificação de sanidade para garantir que as ferramentas corretas sejam usadas nos cenários apropriados.

## Flow Engine e Fases do Projeto

O Maestro baseia-se num sistema de Fases de Desenvolvimento. O estado dessas fases reside localmente no projeto (`.maestro/estado.json`).

Em `src/services/flow-engine.ts`, a máquina de estados avalia em qual fase do ciclo de vida o projeto se encontra. As transições são catalogadas em duas categorias:
-   **Onboarding / Setup**: Onde se define a complexidade (economy, balanced, quality), a stack e o modo.
-   **Development / Active Phase**: Onde ocorrem as fases do SDLC (PRD, Arquitetura, Frontend, Backend).

Para cada avanço, o Flow Engine indica ao LLM a ferramenta recomendada a seguir e instrui qual será a "persona" que ele deve adotar.

## Watcher Nativo Orientado a Eventos (Sprint 5)

Uma introdução significativa da versão 6.0 é a mudança para um modelo assíncrono para testes e avaliações.

Em `src/services/watcher.service.ts`, o sistema não exige mais que o LLM chame ativamente a ferramenta `validar` após criar um código. O Maestro ativa o `chokidar` (ou `fs.watch` nativo) para monitorar as pastas ou arquivos específicos do entregável atual.

1.  A IA salva o documento ou código localmente no disco (por meio das capacidades nativas do provedor como o *edit_file* do Cline/Cursor).
2.  O `watcher.service.ts` detecta a modificação (evento `change`).
3.  Um `debounce` de 500ms é aplicado para otimizar gravações sucessivas.
4.  A `ValidationPipeline` (`src/core/validation/ValidationPipeline.ts`) é acionada em segundo plano.
5.  A *Pipeline* realiza cinco camadas sequenciais de análise estática e heurística: Sintática, Semântica, Qualidade, Arquitetura e Segurança.
6.  Se o código falhar (`stopOnFailure`), o fluxo aciona o TDD Invertido, reportando o problema para auto-correção. Se passar, ocorre o *Smart Auto-Flow*, onde o Maestro avança a fase independentemente da intervenção da IDE.
