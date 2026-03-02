# Guia de Referência — Arquitetura

## Diagramas C4

### Nível 1 — Context
- Mostra: sistema, atores (personas), sistemas externos
- Pergunta: "Quem usa? Com o que integra?"
- Formato: boxes com setas rotuladas

### Nível 2 — Container
- Mostra: frontend, backend, banco, serviços
- Pergunta: "Quais são os containers de deploy?"
- Inclui: tecnologia e porta de cada container

### Nível 3 — Component (opcional para MVP)
- Mostra: módulos internos de cada container
- Pergunta: "Como o backend é organizado internamente?"

## Architecture Decision Records (ADRs)

### Formato obrigatório
1. **Contexto** — Por que essa decisão é necessária?
2. **Decisão** — O que foi decidido?
3. **Alternativas** — O que foi considerado e rejeitado? (com motivo)
4. **Consequências** — Prós e contras da decisão

### ADRs mínimos para qualquer projeto
- ADR-001: Monolito vs Microserviços
- ADR-002: Escolha do banco de dados
- ADR-003: Estratégia de autenticação

## Stack Selection — Critérios

| Critério | Peso | Pergunta |
|----------|------|----------|
| **Time** | Alto | O time já domina? Curva de aprendizado? |
| **Ecossistema** | Alto | Tem libs/ferramentas maduras? |
| **Custo** | Médio | Free tier? Custo em escala? |
| **Performance** | Médio | Atende os NFRs definidos? |
| **Comunidade** | Baixo | Docs boas? Stack Overflow ativo? |

### Stacks recomendadas por tipo de projeto

| Tipo | Frontend | Backend | Banco |
|------|----------|---------|-------|
| **SaaS Web** | Next.js + Tailwind + shadcn | Node.js/Express ou NestJS | PostgreSQL |
| **E-commerce** | Next.js + Tailwind | Node.js ou Python/Django | PostgreSQL |
| **API-first** | — | Express/Fastify ou FastAPI | PostgreSQL/MongoDB |
| **Real-time** | Next.js + Socket.io | Node.js + Socket.io | PostgreSQL + Redis |
| **Mobile** | React Native ou Flutter | Node.js/Express | PostgreSQL + Firebase |

## Modelo de Dados — Checklist

- [ ] Todas as entidades do domínio listadas com atributos e tipos
- [ ] Relacionamentos com cardinalidade (1:1, 1:N, N:N)
- [ ] Tabelas intermediárias para N:N explícitas
- [ ] PKs definidas (UUID recomendado sobre autoincrement)
- [ ] created_at e updated_at em TODAS as tabelas
- [ ] Soft delete (deleted_at) quando necessário
- [ ] Índices para: login (email), FKs mais usadas, filtros frequentes

## Segurança — OWASP Top 10 Resumo

| # | Vulnerabilidade | Mitigação padrão |
|---|----------------|-----------------|
| 1 | Injection | ORM com queries parametrizadas (Prisma, TypeORM) |
| 2 | Broken Auth | JWT com refresh rotation, rate limiting, bcrypt |
| 3 | Sensitive Data | HTTPS, criptografia em repouso, nunca logar PII |
| 4 | XXE | Não processar XML externo |
| 5 | Broken Access | RBAC middleware em cada rota |
| 6 | Misconfiguration | Headers de segurança (helmet), CSP, HSTS |
| 7 | XSS | React escapa por padrão, CSP, sanitize inputs |
| 8 | Deserialization | Validar com Zod antes de deserializar |
| 9 | Known Vulns | npm audit, Dependabot, updates regulares |
| 10 | Logging | Log de acesso, erros com Sentry, nunca logar senhas |

## Anti-patterns de Arquitetura

| Anti-pattern | Por que é ruim | Correção |
|-------------|----------------|----------|
| Stack da moda sem justificativa | Time não domina → produtividade cai | ADR com contexto do time |
| Microserviços para MVP | Overhead de infra para 1-2 devs | Monolito modular |
| Sem schema de banco | Prisma/Migrations falham sem schema definido | Definir TODAS as tabelas |
| ADRs genéricos | "Escolhemos React" sem contexto | Sempre: contexto + alternativas + consequências |
| NFRs vagos | "Deve ser rápido" | Números: p95 < 200ms, 99.5% uptime |
| Ignorar segurança no MVP | Vazamento de dados no launch | OWASP Top 5 no mínimo |
