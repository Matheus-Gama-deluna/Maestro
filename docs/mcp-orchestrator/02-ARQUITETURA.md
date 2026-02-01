# 🏗️ 02. Arquitetura do Sistema

## Visão Geral da Arquitetura

O **Sistema de Orquestração** é construído sobre uma arquitetura modular em camadas, projetada para separar responsabilidades de decisão, execução e persistência.

```mermaid
graph TD
    User[Desenvolvedor (IDE)] <--> MCP[Servidor MCP]
    MCP <--> AI[Modelo de IA (Claude/Gemini)]
    
    subgraph "Orquestrador MCP"
        Engine[Motor de Orquestração]
        State[Gerenciador de Estado]
        Decision[Motor de Decisão]
        
        subgraph "Camadas"
            Understanding[Entendimento]
            Planning[Planejamento]
            Execution[Execução]
            Validation[Validação]
            Learning[Aprendizado]
        end
        
        Engine --> Camadas
        Engine --> Decision
        Camadas --> State
    end
    
    subgraph "Sistema de Arquivos"
        Project[Código do Projeto]
        MaestroDir[.maestro/ (Estado)]
    end
    
    Execution --> Project
    State --> MaestroDir
```

## Componentes Principais

### 1. Servidor MCP (`src/server/`)
O ponto de entrada que implementa o protocolo Model Context Protocol via Stdio ou SSE.
- **Responsabilidade:** Registrar ferramentas (tools), gerenciar conexões e expor recursos.
- **Tools Expostas:** `analyze_project`, `design_architecture`, `execute_plan`, `validate_implementation`, etc.

### 2. Motor de Orquestração (`src/orchestrator/`)
O "cérebro" executivo.
- Coordena o fluxo entre as camadas de Entendimento, Planejamento e Execução.
- Gerencia o ciclo de vida das tarefas.

### 3. Gerenciador de Estado (`src/orchestrator/state-manager.ts`)
Responsável pela persistência e coerência dos dados. O estado não reside na memória volátil da IA, mas sim no sistema de arquivos.
- **Fonte da Verdade:** O diretório `.maestro/`.
- **Estado do Projeto (`.maestro/estado.json`):** Rastreia fase atual, tarefas pendentes e contexto.
- **Base de Conhecimento (`.maestro/knowledge/`):** Armazena ADRs, padrões aprendidos e lições.

### 4. Motor de Decisão (`src/orchestrator/decision-engine.ts`)
Avalia situações complexas para decidir o próximo passo.
- **Lógica:** Determina se uma falha pode ser auto-corrigida ou requer intervenção humana.
- **Critérios:** Score de confiança, risco da operação, severidade do erro.

## Estrutura de Estado (`.maestro/`)

O sistema mantém sua "memória" na pasta oculta `.maestro/` na raiz do projeto:

```text
.maestro/
├── estado.json          # Estado atual do projeto e execução
├── resumo.json          # Cache de contexto para a IA
├── content/             # Templates, prompts e guias injetados
├── rascunhos/           # Arquivos temporários antes do commit
└── knowledge/
    ├── decisions.json   # Registro de todas as decisões (ADRs)
    ├── patterns.json    # Padrões arquiteturais aprendidos
    └── metrics.json     # Histórico de métricas de qualidade
```

## Stack Tecnológica Recomendada

Para a construção do próprio orquestrador (e como stack padrão para projetos robustos que ele gerencia):

- **Linguagem:** TypeScript 5+ (Tipagem estrita)
- **Runtime:** Node.js 20 LTS
- **Framework Backend:** NestJS 10 (Arquitetura modular e injeção de dependência)
- **Banco de Dados (Estado):** Sistema de Arquivos (JSON) + SQLite (opcional para buscas complexas)
- **Validação:** Zod (Schemas) + ESLint
- **Testes:** Vitest + Jest
