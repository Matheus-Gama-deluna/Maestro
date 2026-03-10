# 06 - Motor de Fluxo e Onboarding (Flow Engine - v6.0)

O **Maestro MCP** trata a vida do software como uma Máquina de Estados Finitos (FSM). Em vez de a IA ser instruída através de *prompts* sobre o que fazer, o servidor local deduz ativamente onde o projeto está através do estado e impõe a próxima ação metodológica. O maestro por trás disso é o serviço `src/services/flow-engine.ts`.

## Flow Engine (A Bússola Metodológica)

O Flow Engine consolida as transições de estado do projeto. Ele opera inspecionando o arquivo de estado e consultando duas tabelas-verdade (ou matrizes de transição): o *Onboarding Flow* e o *Development Flow*.

### 1. Determinação de Fase (`determineCurrentPhase`)
A função principal do motor avalia em que contexto o projeto se encontra. A árvore de decisão avalia:

1.  *Existem bloqueios?* (ex: `estado.aguardando_aprovacao` ou `estado.aguardando_classificacao`). Se sim, o motor para e diz: "Fase Aguardando Aprovação Humana".
2.  *Estamos no Setup/Onboarding?* (A versão 6.0 refatorou isso, criando os "Specialist Phases": coleta, geração, validação, aprovação do produto/PRD). O motor navega pelo objeto `estado.onboarding`.
3.  *Estamos em Desenvolvimento?* (As fases de 1 ao máximo, ex: Frontend, Banco de Dados, Backend).
4.  *O Projeto Acabou?* (Todas as fases concluídas e validadas).

### 2. O Próximo Passo (`getNextStep`)
Uma vez que a "fase atual" é descoberta, o Flow Engine consulta a matriz de transições. As transições definem:
-   **From / To**: De qual estado, para qual estado.
-   **Tool**: Qual ferramenta (`executar`, `maestro`, `validar`) o LLM deve invocar para completar a transição.
-   **Condições**: (Ex: Pula "brainstorm" se `estado.config.modo` for `economy`).
-   **User Prompt / Auto Execute**: Se `requires_user_input` é `true`, o motor pede à IDE para pausar e perguntar ao humano "O PRD gerado está bom?". Se `false` (ou se for o Smart Auto-Flow em fases técnicas), `auto_execute` vira `true` e a IA avança sozinha.

### 3. Smart Auto-Flow (Fases Técnicas)
Uma modificação crítica da V6 é o *Smart Auto-Flow*. Fases do tipo *technical* (onde se escreve código fonte) ou *derived* (desdobramentos lógicos) não exigem aprovação humana manual.
No meio de `getNextStep`, o motor sobrescreve a interrupção de *prompt* caso verifique que a classificação do projeto permita (ex: pontuação acima de 80 na `ValidationPipeline` do Watcher).

## Onboarding Service

O início de qualquer projeto ocorre em `src/services/onboarding.service.ts`. Antes de começar a codificar, o Maestro molda o escopo.

### O Fluxo "Product Manager"
O Onboarding é desenhado como um diálogo entre o usuário e o *Specialist* de Produto.
Ele tem seu próprio mini-motor de estados:

1.  **Status: `collecting`**
    -   A IA atua como um PM, fazendo perguntas ativamente ao usuário ("Qual a funcionalidade principal?", "Quem é o público?").
2.  **Status: `generating`**
    -   Quando as informações são julgadas suficientes pelo LLM, a IDE consolida e tenta gerar um `PRD.md` (Product Requirements Document).
3.  **Status: `validating`**
    -   A `ValidationPipeline` (modo Deliverable) lê o `PRD.md`. Confere se tem métricas, personas, MVP definido.
4.  **Status: `approved`**
    -   Se reprovar, ocorre TDD Invertido. Se aprovar (Score > 70%), o PM apresenta o escopo ao humano.

### Auto-Classificação de Complexidade
No fim do onboarding, quando o PRD é aprovado, o Maestro executa a ferramenta de `classificar`. Baseado na quantidade de épicos, funcionalidades ou tamanho do arquivo do PRD, o sistema reclassifica o projeto em `simples` (ex: script de CLI), `medio` (SaaS básico, CRUD), ou `complexo` (microserviços).

Essa reclassificação decide se o *Development Flow* terá 7, 10 ou 17 fases ativas. Após o PRD ser confirmado pelo humano, o estado `onboarding` é marcado como *completed*, e o Flow Engine transita o controle principal para a `fase_1` do *Development Flow*.