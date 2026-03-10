# 03 - Análise de Arquivos e Relacionamentos no Maestro (v6.0) - Detalhado

A estrutura de código do servidor Maestro MCP está localizada em `src/src/`, operando através de uma arquitetura modular em camadas bem definida. Este documento detalha exaustivamente a topologia da aplicação.

## 1. Raiz e Transporte (Entry Points)
Onde a IDE se conecta com o servidor local.

-   **`src/src/server.ts`**
    -   *Propósito*: Instanciador da classe `Server` do SDK oficial `@modelcontextprotocol/sdk`. Mapeia os schemas JSON-RPC (Tools, Prompts, Resources) para suas respectivas implementações.
    -   *Relacionamento*: Único arquivo que "conhece" a especificação MCP bruta. Delega a lógica de Tools para `router.ts`.
-   **`src/src/stdio.ts`**
    -   *Propósito*: Conecta a instância do `server.ts` a um canal `stdin/stdout`, que é o protocolo padrão para Windsurf e Cursor.
-   **`src/src/index.ts`** (Bypass Legado)
    -   *Propósito*: Servidor HTTP/Express que simula JSON-RPC. Usado quando a IDE não tem suporte nativo a STDIO e precisa fazer requests HTTP POST.

## 2. A Camada de Roteamento
O maestro que mapeia as intenções do LLM para a infraestrutura interna.

-   **`src/src/router.ts`**
    -   *Propósito*: Ponto único de exposição. Registra as 5 Core Tools (`maestro`, `executar`, `validar`, `analisar`, `contexto`) e as emcapsula em `applyOrchestrationPipeline`.
    -   *Relacionamento*: Impede que a IA acesse tools legadas (definidas em `legacy-tools.ts`) sem exibir um *warning* de depreciação.
-   **`src/src/legacy-tools.ts`**
    -   *Propósito*: Mantém compatibilidade retroativa com antigas instruções de prompt que os usuários (ou LLMs teimosos) possam usar (ex: `salvar()`, `avancar()`), redirecionando-as para a tool unificada `executar(acao: 'salvar')`.

## 3. Orquestração e Interceptadores (Middlewares)
A espinha dorsal que trata as requisições antes e depois de elas chegarem na função principal (Detalhado em `05-orquestracao-e-middlewares.md`).

-   **`src/src/middleware/orchestration-pipeline.middleware.ts`**: Coordena a ordem dos wrappers.
-   **`src/src/middleware/validation.middleware.ts`**: (State Guard e Prompt Validator) Bloqueia o LLM de desviar de tarefas corretivas.
-   **`src/src/middleware/state-loader.middleware.ts`**: Abre o JSON do projeto e o anexa aos `args`.
-   **`src/src/middleware/adr-generation.middleware.ts`**: Aplica regex de PNL sobre o Markdown para gerar Decisões Arquiteturais no formato ADR.
-   **`src/src/middleware/persistence.middleware.ts`**: Salva o `estado.json` de volta no disco.
-   **`src/src/middleware/flow-engine.middleware.ts`**: Chama o `flow-engine.ts` para embutir as sugestões do "Próximo Passo".
-   **`src/src/middleware/skill-injection.middleware.ts`**: Embute as *personas* e templates lidos de `content/` na resposta final.

## 4. Camada de Domínio / Serviços Internos (`services/`)
Contém a inteligência não-dependente do protocolo MCP.

-   **`src/src/services/flow-engine.ts`**: A Máquina de Estados (FSM) que dita se o projeto está no Setup, no Produto, no Frontend ou Concluído.
-   **`src/src/services/onboarding.service.ts`**: O fluxo de PM. Define as transições da fase 0 do projeto (coleta de requisitos, geração do PRD).
-   **`src/src/services/watcher.service.ts`**: O módulo de Eventos. Escuta mudanças nos arquivos (`chokidar`) para rodar validações assíncronas (Zero-Pause TDD).
-   **`src/src/services/content-resolver.service.ts`** e **`skill-loader.service.ts`**: Trabalham juntos para ler arquivos Markdown nas pastas `content/specialists`, resolvendo a hierarquia de path entre o NPM local vs global.
-   **`src/src/services/client-capabilities.service.ts`**: Lê quais "features" a IDE suporta (Ex: suporta renderizar HTML? Suporta imagens?) para adaptar as respostas do Maestro.

## 5. Implementação de Ferramentas (`tools/`)
As regras de negócios chamadas diretamente pelas intenções do LLM.

-   **`src/src/tools/consolidated/executar.ts`**: Delega requisições para `avancar.js` (passar de fase), `salvar.js` (gravar rascunho temporário), ou `checkpoint-tool.ts` (salvar versão do estado).
-   **`src/src/tools/consolidated/analisar.ts`**: Roteia requests para a pasta `tools/analise/` (`seguranca.ts`, `qualidade.ts`, `performance.ts`) ou valida dependências.
-   **`src/src/tools/consolidated/validar.ts`**: Aciona fluxos de `validar-gate.ts`, `avaliar-entregavel.ts`, dependendo se o arquivo for texto livre ou bloco de código.
-   **`src/src/tools/maestro-tool.ts`**: O assistente de setup interativo (lida com as escolhas iniciais do usuário).
-   **`src/src/tools/contexto.ts`**: Função agregadora que puxa o Estado + ADRs + Skills e concatena uma *System Message* enxuta.

## 6. Motor Técnico de TDD Invertido (`core/validation/`)
Módulo puro de heurísticas estáticas (Detalhado em `08-validation-pipeline.md`).

-   **`src/src/core/validation/ValidationPipeline.ts`**: Executa o processo de teste em cadeia. Pode ser invocado síncronamente por uma Tool ou de forma orientada a evento pelo Watcher.
-   **Camadas Específicas (`layers/`)**: As implementações de cada passo da validação:
    -   `SyntacticValidator`: Usa regex e heurísticas para garantir integridade do arquivo.
    -   `SemanticValidator`, `QualityValidator`, `ArchitectureValidator`, `SecurityValidatorWrapper`: Camadas focadas no código TypeScript/Node (detectam problemas OWASP, checam injeção).
-   **`DeliverableValidator`**: Especializado em avaliar Markdown não-funcional (Documentos de Arquitetura, PRDs). Verifica presença de subseções através do Checklists da Fase.

## 7. Persistência de Estado e Memória (`state/` e `core/knowledge/`)
A interface de banco de dados baseado em sistema de arquivos. (Detalhado em `04-estado-e-memoria.md`).

-   **`src/src/state/storage.ts`**: Gerencia I/O síncrono/assíncrono do arquivo `.maestro/estado.json`. Único arquivo permitido a mudar o estado do objeto global `EstadoProjeto`.
-   **`src/src/state/memory.ts` e `context.ts`**: Funções auxiliares para sumarizar logs e decisões no formato Markdown (`resumo.md`, `codebase.md`).
-   **`src/src/core/knowledge/KnowledgeBase.ts`**: Sistema de indexação dos ADRs, Patterns e Decisões Históricas (armazenados em `.maestro/knowledge/`). Provê funções de busca textual e filtragem temporal/relevância para a ferramenta `contexto`.