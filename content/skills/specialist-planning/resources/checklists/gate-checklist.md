# Gate Checklist — Planejamento

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Épicos mapeiam funcionalidades do MVP** | 15 | 1 épico por funcionalidade, com descrição e objetivo |
| 2 | **User Stories com IDs, tipo FE/BE e pontos** | 20 | US-001... com título, tipo (FE/BE/Full), story points |
| 3 | **Top 10 US com critérios de aceite** | 15 | Critérios verificáveis para as US mais importantes |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Endpoints de API derivados do modelo de dados** | 10 | Tabela: método, URL, descrição, request/response |
| 5 | **Sprints planejados com objetivo** | 10 | Sprint 1, 2, 3... com US incluídas e meta do sprint |
| 6 | **Estratégia de testes com ferramentas** | 10 | Pirâmide (unitário/integração/E2E), ferramentas, cobertura |
| 7 | **Definition of Done** | 5 | Critérios claros para considerar uma US "Done" |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Dependências entre US** | 5 | FE depende de BE quando aplicável |
| 9 | **Estimativa total em sprints** | 5 | Número de sprints para completar MVP |
| 10 | **Cobertura de testes mínima** | 5 | % alvo definido (ex: 70% services) |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Épicos vagos | Cada épico = 1 feature do MVP com objetivo mensurável |
| US sem tipo | Marcar cada US como FE, BE ou Full. Dividir Full em FE+BE se possível |
| Sem endpoints | Derivar do modelo de dados: cada entidade → CRUD (GET, POST, PATCH, DELETE) |
| Sem sprints | Agrupar US por dependência e prioridade em sprints de 1-2 semanas, 15-25 pts |
| Sem DoD | Definir: código revisado, testes passando, sem erros de tipo, documentado |
