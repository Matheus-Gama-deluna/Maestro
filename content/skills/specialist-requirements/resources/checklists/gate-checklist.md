# Gate Checklist — Requisitos

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **RFs com IDs únicos e descrição clara** | 20 | RF-001, RF-002... com descrição, prioridade e feature de origem |
| 2 | **Critérios de aceite em Gherkin** | 15 | Given/When/Then para cada RF de prioridade Alta |
| 3 | **RNFs mensuráveis** | 15 | Performance, segurança, disponibilidade com NÚMEROS |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Regras de negócio documentadas** | 10 | RN-001... com condições e ações |
| 5 | **Matriz de rastreabilidade** | 10 | RF ↔ Feature do PRD mapeada |
| 6 | **Edge cases identificados** | 10 | Pelo menos 3 cenários de exceção |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 7 | **Prioridade em cada RF** | 7 | Alta/Média/Baixa definida |
| 8 | **Dependências entre requisitos** | 7 | Quando RF-X depende de RF-Y |
| 9 | **Sumário com escopo** | 6 | Referência ao PRD, escopo do documento |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| RFs sem ID | Numerar sequencialmente: RF-001, RF-002... |
| Sem Gherkin | Para cada RF Alta: "Given [contexto] When [ação] Then [resultado]" |
| RNFs vagos | Substituir adjetivos: "rápido" → "p95 < 200ms", "seguro" → "OWASP Top 10" |
| Sem rastreabilidade | Adicionar coluna "Feature origem" na tabela de RFs |
