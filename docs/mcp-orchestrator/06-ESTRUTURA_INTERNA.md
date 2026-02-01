# 📂 06. Estrutura Interna do Projeto

Este documento detalha a organização de código do próprio **Orquestrador MCP** (o projeto `software-orchestrator`), que é o software que rodará na máquina do desenvolvedor.

## Estrutura de Diretórios Recomendada

```text
software-orchestrator/
├── package.json                    # Dependências e Scripts
├── mcp-config.json                 # Configuração do servidor
│
├── src/
│   ├── index.ts                    # Entry point do servidor
│   │
│   ├── server/                     # Núcleo do servidor MCP
│   │   ├── mcp-server.ts           # Implementação do protocolo
│   │   └── tool-registry.ts        # Registro de ferramentas
│   │
│   ├── orchestrator/               # Motor de Orquestração
│   │   ├── orchestration-engine.ts # Coordenador principal
│   │   ├── state-manager.ts        # Gestão de .maestro/
│   │   ├── decision-engine.ts      # Lógica de decisão
│   │   └── learning-system.ts      # Aprendizado de padrões
│   │
│   ├── analyzers/                  # Ferramentas de Análise
│   │   ├── project-scanner.ts      # Varredura de arquivos
│   │   └── architecture-analyzer.ts# Detecção de padrões
│   │
│   ├── planners/                   # Ferramentas de Planejamento
│   │   ├── strategic-planner.ts    # Criação de Roadmaps
│   │   └── task-decomposer.ts      # Quebra de tarefas
│   │
│   ├── executors/                  # Ferramentas de Execução
│   │   ├── code-executor.ts        # Geração de código
│   │   └── file-manager.ts         # Manipulação de arquivos
│   │
│   ├── validators/                 # Ferramentas de Validação
│   │   ├── syntax-validator.ts     # Linting/Compilação
│   │   └── quality-validator.ts    # Métricas e Testes
│   │
│   └── tools/                      # Definição das MCP Tools
│       ├── analysis-tools.ts       # Ex: analyze_project
│       ├── planning-tools.ts       # Ex: design_architecture
│       ├── execution-tools.ts      # Ex: execute_plan
│       └── validation-tools.ts     # Ex: validate_implementation
│
├── templates/                      # Templates de código (Scaffolding)
│   ├── architectures/              # Clean Arch, Hexagonal...
│   └── patterns/                   # Repository, CQRS, Singleton...
│
└── tests/                          # Testes do próprio orquestrador
```

## Configuração (`mcp-config.json`)

O arquivo que define o comportamento do orquestrador.

```json
{
  "name": "software-orchestrator",
  "version": "1.0.0",
  "capabilities": {
    "analysis": {
      "enabled": true,
      "auto_analyze_on_start": true,
      "scan_depth": "deep"
    },
    "execution": {
      "auto_fix": true,
      "create_checkpoints": true,
      "checkpoint_frequency": "per_phase"
    },
    "validation": {
      "levels": ["syntax", "semantic", "quality", "architecture"],
      "fail_on_architecture_violation": true
    }
  },
  "rules": {
    "quality": {
      "min_test_coverage": 80,
      "max_function_complexity": 15
    }
  }
}
```

## Tools Expostas (API do MCP)

Estas são as ferramentas que a IA (Claude) "enxerga" e pode chamar.

1.  **`analyze_project_context`**: Retorna um JSON com a estrutura, padrões e qualidade atual.
2.  **`analyze_business_requirements`**: Processa um pedido do usuário e retorna requisitos técnicos.
3.  **`design_architecture`**: Gera decisões arquiteturais (ADRs) e estratégia.
4.  **`create_execution_plan`**: Transforma arquitetura em tarefas passo-a-passo.
5.  **`execute_plan_phase`**: Executa um conjunto de tarefas com validação e rollback.
6.  **`validate_implementation`**: Roda a bateria de testes e linters sob demanda.
7.  **`record_decision`**: Salva um novo ADR na base de conhecimento.
