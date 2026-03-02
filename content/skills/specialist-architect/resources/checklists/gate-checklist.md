# Gate Checklist — Arquitetura

> **Score mínimo para aprovação:** 70/100  
> **Itens críticos:** Devem TODOS estar ✅ para aprovar

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Stack tecnológica justificada** | 15 | Cada tecnologia com justificativa técnica, não apenas preferência |
| 2 | **Diagrama C4 nível 1 e 2** | 15 | Context diagram (sistema + atores + externos) e Container diagram (frontend, backend, banco) |
| 3 | **Modelo de dados com entidades e relacionamentos** | 15 | Entidades com atributos, tipos, cardinalidade (1:N, N:N) |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Schema de banco com PKs/FKs e índices** | 10 | Tabelas com tipos reais do banco, constraints, índices planejados |
| 5 | **Autenticação e autorização definidas** | 10 | Método (JWT/OAuth/session), fluxo, roles/permissões |
| 6 | **NFRs mensuráveis** | 10 | Performance (p95), disponibilidade (%), escalabilidade (usuários) com números |
| 7 | **Mínimo 2 ADRs documentados** | 10 | Cada ADR com contexto, decisão, alternativas rejeitadas e consequências |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **OWASP Top 10 mitigado** | 5 | Pelo menos 5 vulnerabilidades com mitigação definida |
| 9 | **Estratégia de deploy com ambientes** | 5 | Dev/staging/prod com CI/CD pipeline descrito |
| 10 | **Migrations e seeds planejados** | 5 | Ferramenta, estratégia de rollback, dados de teste |

## Scoring

- **≥ 70:** Aprovado automaticamente
- **50-69:** Aprovação manual — revisar modelo de dados ou ADRs
- **< 50:** Bloqueado — stack sem justificativa ou sem modelo de dados

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Stack sem justificativa | Para cada tech: "Escolhi X porque Y. Alternativa era Z, rejeitada por W" |
| Sem C4 | Nível 1: sistema + atores + externos. Nível 2: containers (FE, BE, DB) com setas |
| Modelo incompleto | Listar TODAS entidades do domínio com atributos e tipos. Mapear relacionamentos |
| Sem ADRs | Documentar 2+ decisões: stack principal + banco. Formato: contexto → decisão → consequências |
| NFRs vagos | Substituir adjetivos por números: "rápido" → "p95 < 200ms" |
