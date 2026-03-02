# Gate Checklist — Design Técnico

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Modelo de domínio com entidades e relacionamentos** | 15 | Todas entidades com atributos, tipos e cardinalidade |
| 2 | **Schema de banco com PKs/FKs e índices** | 15 | Tabelas com tipos reais, constraints, índices para queries frequentes |
| 3 | **Stack justificada com mínimo 3 ADRs** | 15 | Cada ADR: contexto, decisão, alternativas rejeitadas, consequências |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Diagrama C4 nível 1 e 2** | 10 | Context + Container diagrams presentes |
| 5 | **Autenticação e autorização definidas** | 10 | Método, fluxo, roles/permissões documentados |
| 6 | **NFRs mensuráveis** | 10 | Performance, disponibilidade, escala com números concretos |
| 7 | **OWASP Top 5 mitigado** | 10 | Pelo menos 5 vulnerabilidades com mitigação |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Estratégia de deploy com ambientes** | 5 | Dev/staging/prod, CI/CD descrito |
| 9 | **Migrations e seeds planejados** | 5 | Ferramenta, rollback, dados de teste |
| 10 | **Dados sensíveis mapeados (LGPD)** | 5 | Classificação por tipo + proteção |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Entidades incompletas | Listar TODAS as entidades do domínio com atributos e tipos reais |
| Schema sem índices | Identificar queries mais frequentes → criar índices correspondentes |
| ADRs genéricos | Formato: "Escolhi X porque Y. Rejeitei Z por W. Consequência: +A, -B" |
| NFRs vagos | Substituir "rápido" por "p95 < 200ms", "disponível" por "99.5% uptime" |
| Sem segurança | Mapear OWASP Top 5: Injection, Broken Auth, XSS, CSRF, SSRF |
