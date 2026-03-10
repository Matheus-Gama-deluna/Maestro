# 08 - Pipeline de Validação (Inverted TDD - v6.0)

A filosofia do **Test-Driven Development Invertido** do Maestro MCP é materializada principalmente através do sistema de validação contínua localizado em `src/src/core/validation/`. Em vez de a IA escrever o código livremente e depois criar os testes, o Maestro impõe métricas e heurísticas *antes* e *durante* a geração do código/documento, reprovando o avanço de fase caso não atinja um limite mínimo (`Score`).

## A Classe `ValidationPipeline`

O coração dessa mecânica é a classe `ValidationPipeline`. Ela orquestra um conjunto de "Camadas" (`layers/`) que avaliam sequencialmente o que a IA produziu.

Existem dois modos principais de operação dentro deste motor:

### 1. Modo "Deliverable" (Entregáveis de Documentação/Fase)
Usado para fases descritivas (Produto, UX, Arquitetura, Requisitos).
-   **Método**: `validateDeliverable(content, nomeFase, tier, gateChecklist)`
-   **Como Funciona**: Invoca a classe `DeliverableValidator`.
    -   *Estrutural*: Checa se as seções obrigatórias para aquela fase (ex: "Contexto", "Problema", "Personas" no PRD) estão presentes no Markdown.
    -   *Completude*: Compara o conteúdo gerado com os itens do `gate_checklist` (uma lista de requisitos para avançar de fase no modelo do Maestro).
    -   *Tamanho*: Aplica heurísticas semânticas para ver se o conteúdo tem um tamanho razoável e a qualidade esperada de um documento técnico.

### 2. Modo "Code" (Entregáveis Técnicos / Código TypeScript)
Usado quando a IA gera código fonte (Frontend, Backend).
-   **Método**: `validate(code, tier, context)`
-   **Como Funciona**: Executa 5 camadas de validadores técnicos de forma estrita. Cada camada pode parar a execução (`stopOnFailure = true`) se for crítica, ou apenas reduzir a pontuação se for um *warning* (ex: qualidade).
    1.  **Sintática (Mínimo: 80% / Crítica)**: Verifica se o código é sintaticamente válido. (No caso do TypeScript, tenta compilar ou fazer parse na AST). Se houver erro de sintaxe ou erro fatal, interrompe imediatamente a pipeline.
    2.  **Semântica (Mínimo: 70%)**: Avalia se os tipos estão consistentes, se as interfaces importadas fazem sentido e se há coerência no escopo.
    3.  **Qualidade (Mínimo: 70%)**: Aplica regras de estilo (similares a um linter leve), *code smells* (funções muito grandes, alta complexidade ciclomática) e indícios de testabilidade prejudicada.
    4.  **Arquitetura (Mínimo: 80%)**: Checa o acoplamento. Verifica se a camada gerada está chamando coisas que não deveria (ex: O Controller chamando a base de dados diretamente no modelo MVC). Utiliza *Fitness Functions* de arquitetura limpa.
    5.  **Segurança (Mínimo: 90% / Crítica)**: Por fim, a classe `SecurityValidatorWrapper` faz uma varredura contra os maiores vetores da OWASP (injeção de SQL, XSS, tokens *hardcoded*).

## O Motor Orientado a Eventos (Watcher Service)

Na versão 6, o fluxo do *Inverted TDD* se tornou **Zero-Pause** em fases de código, impulsionado pelo `src/src/services/watcher.service.ts`.

-   A IA é instruída a salvar o arquivo técnico em sua ferramenta nativa (`edit_file`).
-   O Maestro (através do `chokidar`) nota a modificação (`watcher.on('change')`).
-   O Maestro *automaticamente* despacha o código alterado para a `ValidationPipeline`.
-   **TDD Invertido na Prática**:
    -   Se o código atinge os escores mínimos (configurados via tier: `essencial`, `base`, `avancado`), o *Smart Auto-Flow* engata, declarando o gate aprovado e o próximo passo liberado.
    -   Se reprova em uma camada crítica (ex: Erro de sintaxe na camada 1), o Maestro retorna *imediata e proativamente* uma instrução para a IA corrigir os erros através do estado `em_estado_compulsorio` (como visto no Middleware de Validação). Isso poupa um ciclo de pergunta/resposta e impõe a autocorreção com precisão cirúrgica.