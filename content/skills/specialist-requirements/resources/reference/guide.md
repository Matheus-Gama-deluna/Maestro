# Guia de Referência — Requisitos

## Formato de Requisito Funcional

```
RF-001: [Título curto]
Descrição: [O que o sistema deve fazer]
Prioridade: Alta | Média | Baixa
Origem: [Feature do PRD que originou]
Critério de Aceite: Given/When/Then
```

## Gherkin (BDD) — Formato

```gherkin
Feature: [Nome da funcionalidade]

  Scenario: [Caminho feliz]
    Given [contexto inicial]
    When [ação do usuário]
    Then [resultado esperado]
    And [validação adicional]

  Scenario: [Caminho de erro]
    Given [contexto]
    When [ação inválida]
    Then [mensagem de erro esperada]
```

## Classificação SMART

| Critério | Pergunta | Exemplo ruim → bom |
|----------|----------|---------------------|
| **Specific** | É claro e sem ambiguidade? | "Ser rápido" → "API responde em < 200ms p95" |
| **Measurable** | Posso verificar objetivamente? | "Fácil de usar" → "Onboarding completo em < 3 min" |
| **Achievable** | É factível com os recursos? | "100% uptime" → "99.5% uptime mensal" |
| **Relevant** | Conecta a um objetivo de negócio? | "Suportar IE6" → "Suportar Chrome/Safari/Firefox últimas 2 versões" |
| **Temporal** | Tem prazo ou cadência? | "Eventualmente" → "Disponível no MVP (8 semanas)" |

## Categorias de RNF

| Categoria | Exemplos de Métricas |
|-----------|---------------------|
| **Performance** | p50, p95, p99 de latência; throughput (req/s) |
| **Disponibilidade** | Uptime % mensal; RTO (Recovery Time Objective) |
| **Escalabilidade** | Concurrent users; data volume growth |
| **Segurança** | OWASP Top 10; criptografia; autenticação |
| **Usabilidade** | WCAG level; task completion rate; error rate |
| **Manutenibilidade** | Test coverage; cyclomatic complexity; deploy frequency |

## Matriz de Rastreabilidade

| RF | Feature (PRD) | Persona | Critério de Aceite | Teste |
|----|---------------|---------|---------------------|-------|
| RF-001 | F1: Login | Marina | Gherkin: login com Google | TC-001 |
| RF-002 | F2: Criar tarefa | Carlos | Gherkin: criar tarefa com título | TC-002 |

## Anti-patterns

| Anti-pattern | Correção |
|-------------|----------|
| "O sistema deve ser intuitivo" | Definir tarefa + tempo máximo de conclusão |
| RF sem ID | Numerar: RF-001, RF-002... |
| Gherkin genérico | Dados concretos: "Given um usuário com email 'test@test.com'" |
| RNF sem número | Substituir adjetivos por métricas mensuráveis |
| Todos os RF são "Alta" prioridade | Forçar distribuição: ~30% Alta, ~40% Média, ~30% Baixa |
