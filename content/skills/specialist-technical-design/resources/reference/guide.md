# Guia de Referência — Design Técnico

## Documento Consolidado: 5 Seções

O Design Técnico é um documento ÚNICO que cobre:

1. **Modelo de Domínio** — Entidades, relacionamentos, regras de negócio
2. **Schema de Banco** — Tabelas, tipos, PKs/FKs, índices, migrations
3. **Arquitetura** — C4, stack justificada, ADRs
4. **Segurança** — Autenticação, OWASP, dados sensíveis
5. **NFRs** — Performance, disponibilidade, escalabilidade

## Modelo de Domínio — Checklist Rápido

- [ ] Todas as entidades do domínio listadas
- [ ] Cada entidade com atributos e tipos
- [ ] Relacionamentos com cardinalidade (1:1, 1:N, N:N)
- [ ] Tabelas intermediárias para N:N
- [ ] `id` (UUID), `created_at`, `updated_at` em todas
- [ ] Regras de negócio vinculadas às entidades

## Schema de Banco — Tipos Comuns

| Conceito | PostgreSQL | MySQL |
|----------|-----------|-------|
| ID | UUID + gen_random_uuid() | CHAR(36) ou BINARY(16) |
| String curta | VARCHAR(N) | VARCHAR(N) |
| String longa | TEXT | TEXT |
| Inteiro | INTEGER | INT |
| Decimal | DECIMAL(10,2) | DECIMAL(10,2) |
| Boolean | BOOLEAN | TINYINT(1) |
| Data | DATE | DATE |
| Timestamp | TIMESTAMP | DATETIME |
| Enum | ENUM type ou VARCHAR | ENUM |
| JSON | JSONB | JSON |

## Índices — Quando Criar

| Cenário | Tipo de Índice |
|---------|---------------|
| Login por email | UNIQUE em email |
| FK mais consultada | INDEX simples |
| Filtro combinado (projeto + status) | INDEX composto |
| Busca textual | GIN (PostgreSQL) ou FULLTEXT |
| Dados únicos (email, slug) | UNIQUE |

## ADR — Template Mínimo

```markdown
### ADR-NNN: [Título]
- **Status:** Aceito
- **Contexto:** [Por que essa decisão é necessária?]
- **Decisão:** [O que decidimos?]
- **Alternativas:** [O que rejeitamos e por quê?]
- **Consequências:** (+) benefícios (-) trade-offs
```

## Segurança — OWASP Top 5 Essencial

| # | Vulnerabilidade | Mitigação Padrão |
|---|----------------|-----------------|
| 1 | **Injection** | ORM com queries parametrizadas |
| 2 | **Broken Auth** | JWT + refresh rotation + bcrypt + rate limit |
| 3 | **XSS** | React escapa por padrão + CSP headers |
| 4 | **CSRF** | SameSite cookies + CSRF tokens |
| 5 | **Broken Access** | RBAC middleware em cada rota |

## NFRs — Referência de Valores Realistas

| Métrica | MVP | Escala Média | Enterprise |
|---------|-----|-------------|-----------|
| API p95 | < 500ms | < 200ms | < 100ms |
| Uptime | 99% | 99.5% | 99.9% |
| Concurrent users | 100 | 1.000 | 10.000+ |
| Deploy frequency | Semanal | Diário | Múltiplas/dia |
| Recovery time | < 4h | < 1h | < 15min |

## Anti-patterns

| Anti-pattern | Correção |
|-------------|----------|
| Schema sem tipos reais | Definir tipo exato do banco (VARCHAR(255), não "string") |
| ADR genérico "Escolhemos React" | Contexto + alternativas + consequências |
| Microserviços para time de 2 | Monolito modular, extrair serviços quando dados justificarem |
| NFRs aspiracionais (99.99%) | Números realistas para o MVP e orçamento |
| Segurança "depois do launch" | OWASP Top 5 no mínimo desde o início |
