# 07 - Core Tools Detalhado (The 5 Tools - v6.0)

A consolidação de 17 ferramentas esparsas em apenas **5 Ferramentas Principais (Core Tools)** foi uma das mudanças arquiteturais mais impactantes da versão 6.0. O propósito é diminuir a confusão do LLM ("fadiga de tokens"), criando interfaces no formato "Canivete Suíço". A IA chama uma ferramenta, e os parâmetros determinam qual ação interna deve ser tomada.

Abaixo, detalhamos o funcionamento interno de cada uma, localizadas majoritariamente em `src/src/tools/consolidated/` (com exceção de `maestro` e `contexto`).

## 1. `maestro` (`tools/maestro-tool.ts`)
**O Ponto de Entrada e Dashboard.**

-   **Objetivo**: Inicializar o projeto ou exibir o status geral.
-   **Ações Internas (`acao`)**:
    -   *Vazio (undefined)*: Age como um dashboard de status. Lê o `estado.json` e gera uma "barra de progresso" visual em Markdown para a IA e para o usuário verem em que fase estão.
    -   `setup_inicial`: Fase de captura de intenções globais. Pergunta ao usuário sua IDE preferida (para path mappings), o rigor metodológico (Economy, Balanced, Quality) e o uso do Stitch (plugin Google) para UI.
    -   `criar_projeto`: Executa efetivamente a criação física da estrutura local do Maestro no diretório, combinando o `setup_inicial` se necessário e bypassando prompts desnecessários.
-   **Características**: Se a IA chamar o `maestro` sem informações, a ferramenta retorna instruções imperativas de "Pergunte ao usuário X e Y".

## 2. `executar` (`tools/consolidated/executar.ts`)
**O Motor de Mutações.**

-   **Objetivo**: Realizar alterações de estado que afetem o andamento do projeto.
-   **Ações Internas (`acao`)**:
    -   `avancar` (Padrão): A mais usada. Significa "terminei meu trabalho na fase atual, receba o entregável (parâmetro `entregavel`) e vamos para a próxima fase". Desvia o processamento para `tools/consolidated/avancar.ts`. Lá, se for uma fase técnica, pode chamar o watcher.
    -   `salvar`: Significa "estou salvando um rascunho de entregável, mas ainda não acabei a fase". Desvia para `tools/salvar.ts`. Grava no estado que um arquivo provisório existe.
    -   `checkpoint`: Sistema de versionamento/segurança interno do Maestro. Permite a criação de *snapshots* manuais do código ou reversões pontuais caso a IA tenha estragado algum arquivo (`tools/consolidated/checkpoint-tool.ts`).

## 3. `validar` (`tools/consolidated/validar.ts`)
**O Inquisidor Manual.**

-   **Objetivo**: Testar artefatos sem avançar de fase obrigatoriamente (útil para checagens intermediárias ou compliance rigoroso).
-   **Tipos Internos (`tipo`)**:
    -   `gate` (Padrão): Invocado automaticamente por `executar(acao: "avancar")` em alguns fluxos legados, ou manualmente para testar se um entregável atende aos requisitos de fim de fase (o Checklist de Saída). Repassa para `tools/validar-gate.ts`.
    -   `entregavel`: Validação da qualidade (texto e forma) de um documento Markdown ou protótipo, não necessariamente atrelado a mudar de fase.
    -   `compliance`: Verifica um bloco de código (fornecido no parâmetro `code`) contra normas como LGPD, PCI-DSS ou HIPAA, chamando `tools/fase1/validation.tools.js`.

## 4. `analisar` (`tools/consolidated/analisar.ts`)
**O Auditor Estático.**

-   **Objetivo**: Fornecer feedback técnico profundo para o TDD Invertido sem necessariamente passar pela `ValidationPipeline` global do motor de eventos.
-   **Tipos Internos (`tipo`)**:
    -   `completo` (Padrão): Roda heurísticas contra todos os arquivos principais do projeto (retornando um relatorio agregado).
    -   `seguranca`, `qualidade`, `performance`: Redirecionam para verificações heurísticas em `tools/analise/`.
    -   `dependencias`: Checa se há "alucinações" de bibliotecas que a IA importou mas não instalou no `package.json`/`pom.xml`, ou *version mismatch*.

## 5. `contexto` (`tools/contexto.ts`)
**A Memória de Longo Prazo.**

-   **Objetivo**: Responder à pergunta da IA: *"Aonde estou, o que já foi decidido e como devo me comportar agora?"*.
-   **Como Funciona**:
    1. Lê a "Memória de Curto Prazo" (`estado.json`) e constrói o resumo atual.
    2. Consulta o módulo `KnowledgeBase` para puxar os ADRs mais recentes e relevantes.
    3. Importa o módulo `ContentResolverService` para puxar os dados do Especialista (Skill) que domina a fase atual (ex: um prompt formatado dizendo "Você é o QA Architect...").
    4. Concatena tudo de forma limpa, estruturada, sem consumir um número excessivo de tokens.