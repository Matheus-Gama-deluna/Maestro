# Arquitetura — [NOME DO PROJETO]

> **Fase:** 3 · Arquitetura  
> **Data:** [DATA]  
> **Autor:** Especialista de Arquitetura + Usuário  
> **Status:** Draft | Em Revisão | Aprovado  
> **Base:** Discovery (`docs/01-discovery/discovery.md`), Design (`docs/02-design/design-doc.md`)

---

## 1. Sumário Executivo

<!-- Visão arquitetural em 1 parágrafo: tipo de sistema, stack principal, decisões-chave -->

[PREENCHER — Ex: "Sistema web SaaS monolítico usando Next.js (frontend) + Node.js/Express (backend) + PostgreSQL, hospedado na Vercel + Railway. Autenticação via JWT com refresh tokens. Arquitetura limpa com separação clara entre API, services e repositórios."]

---

## 2. Stack Tecnológica

<!-- Cada tecnologia deve ter justificativa. Se há alternativa considerada, documente como ADR. -->

### 2.1 Frontend

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| [Ex: Next.js] | [Ex: 14.x] | [Ex: SSR para SEO, App Router, React Server Components] |
| [Ex: TypeScript] | [Ex: 5.x] | [Ex: Type-safety, melhor DX, catch bugs em compile-time] |
| [Ex: Tailwind CSS] | [Ex: 3.x] | [Ex: Utility-first, sem CSS custom, design system integrado] |
| [Ex: shadcn/ui] | [Ex: latest] | [Ex: Componentes acessíveis, customizáveis, sem lock-in] |
| [Ex: Zustand] | [Ex: 4.x] | [Ex: State management simples, sem boilerplate] |

### 2.2 Backend

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| [Ex: Node.js] | [Ex: 20 LTS] | [Ex: Mesmo ecossistema do frontend, async I/O] |
| [Ex: Express] | [Ex: 4.x] | [Ex: Maduro, extensível, time já domina] |
| [Ex: Prisma] | [Ex: 5.x] | [Ex: Type-safe ORM, migrations automáticas, studio] |
| [Ex: Zod] | [Ex: 3.x] | [Ex: Validação de input type-safe, runtime + compiletime] |

### 2.3 Banco de Dados

| Tecnologia | Justificativa |
|-----------|---------------|
| [Ex: PostgreSQL 16] | [Ex: ACID, extensões ricas, performance, gratuito] |
| [Ex: Redis (opcional)] | [Ex: Cache de sessões, rate limiting] |

### 2.4 Infraestrutura

| Componente | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| **Hosting Frontend** | [Ex: Vercel] | [Ex: Deploy automático, CDN, free tier generoso] |
| **Hosting Backend** | [Ex: Railway] | [Ex: Deploy simples, PostgreSQL incluso, $5/mês] |
| **CI/CD** | [Ex: GitHub Actions] | [Ex: Integrado ao repo, gratuito para público] |
| **Monitoramento** | [Ex: Vercel Analytics + Sentry] | [Ex: Erros + performance] |

---

## 3. Diagrama C4

### 3.1 Nível 1 — Contexto do Sistema

<!-- Visão macro: sistema, usuários, sistemas externos -->

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIOS                            │
│  [Persona 1]              [Persona 2]                    │
│       │                        │                         │
│       ▼                        ▼                         │
│  ┌─────────────────────────────────┐                    │
│  │      [NOME DO SISTEMA]          │                    │
│  │    Web Application (SaaS)       │                    │
│  └──────────┬──────────────────────┘                    │
│             │                                            │
│    ┌────────┼────────────┐                              │
│    ▼        ▼            ▼                              │
│ [Email]  [Pagamento]  [Auth Provider]                    │
│ SendGrid   Stripe     Google OAuth                       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Nível 2 — Containers

<!-- Componentes de deploy: frontend app, backend API, banco, serviços -->

```
┌──────────────────────────────────────────────────────┐
│                    CONTAINERS                         │
│                                                      │
│  ┌─────────────┐    ┌─────────────┐                 │
│  │  Frontend    │───▶│  Backend    │                 │
│  │  (Next.js)   │    │  (Express)  │                 │
│  │  Vercel      │    │  Railway    │                 │
│  └─────────────┘    └──────┬──────┘                 │
│                            │                         │
│                     ┌──────┴──────┐                  │
│                     │ PostgreSQL  │                   │
│                     │  Railway    │                   │
│                     └─────────────┘                   │
└──────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Dados

### 4.1 Entidades Principais

<!-- Liste TODAS as entidades do domínio com seus atributos -->

#### Entidade: [NOME]

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | Identificador único |
| [PREENCHER] | [PREENCHER] | ✅/❌ | [PREENCHER] |
| created_at | DateTime | ✅ | Data de criação |
| updated_at | DateTime | ✅ | Última atualização |

#### Entidade: [NOME]

[PREENCHER — repetir formato acima]

### 4.2 Relacionamentos

| Entidade A | Relação | Entidade B | Descrição |
|-----------|---------|-----------|-----------|
| [Ex: User] | 1:N | [Ex: Task] | [Ex: Um usuário tem muitas tarefas] |
| [Ex: Task] | N:1 | [Ex: Project] | [Ex: Muitas tarefas pertencem a um projeto] |
| [Ex: User] | N:N | [Ex: Project] | [Ex: Muitos usuários em muitos projetos (via ProjectMember)] |

### 4.3 Diagrama ER (simplificado)

```
[User] 1──N [Task] N──1 [Project]
  │                        │
  └──N [ProjectMember] N───┘
```

---

## 5. Schema de Banco

### 5.1 Tabelas

<!-- Schema físico — tipos reais do banco, constraints, defaults -->

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- [PREENCHER — Adicionar todas as tabelas]
```

### 5.2 Índices Planejados

| Tabela | Índice | Colunas | Tipo | Justificativa |
|--------|--------|---------|------|---------------|
| users | idx_users_email | email | UNIQUE | Login lookup |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] |

### 5.3 Estratégia de Migrations

| Ferramenta | Estratégia |
|-----------|-----------|
| [Ex: Prisma Migrate] | [Ex: Migrations versionadas, aplicadas em deploy via CI/CD] |
| **Rollback** | [Ex: Cada migration tem down, testado em staging antes de prod] |
| **Seeds** | [Ex: Script de seed para dados de desenvolvimento e testes] |

---

## 6. Architecture Decision Records (ADRs)

### ADR-001: [TÍTULO DA DECISÃO]

| Campo | Valor |
|-------|-------|
| **Status** | Aceito |
| **Data** | [DATA] |
| **Contexto** | [Ex: Precisamos escolher entre monolito e microserviços para o MVP] |
| **Decisão** | [Ex: Monolito com separação por módulos] |
| **Alternativas** | [Ex: 1) Microserviços — rejeitado por complexidade para time de 2 devs. 2) Serverless — rejeitado por cold starts e complexidade de debug] |
| **Consequências** | [Ex: (+) Deploy simples, DX melhor. (-) Escala vertical, refactor futuro se crescer muito] |

### ADR-002: [TÍTULO DA DECISÃO]

[PREENCHER — Mínimo 2 ADRs]

---

## 7. Segurança

### 7.1 Autenticação

| Aspecto | Implementação |
|---------|---------------|
| **Método** | [Ex: JWT (access + refresh token)] |
| **Access Token** | [Ex: 15 min expiry, em memory/cookie HttpOnly] |
| **Refresh Token** | [Ex: 7 dias, rotação, em cookie HttpOnly Secure] |
| **OAuth** | [Ex: Google, GitHub via next-auth] |
| **Senhas** | [Ex: bcrypt, mín 8 chars, sem requisitos complexos] |

### 7.2 Autorização

| Modelo | Implementação |
|--------|---------------|
| [Ex: RBAC] | [Ex: Roles: admin, member, viewer. Middleware em cada rota] |

### 7.3 OWASP Top 10

| Vulnerabilidade | Mitigação |
|----------------|-----------|
| Injection (SQL/NoSQL) | [Ex: Prisma ORM com parameterized queries] |
| Broken Authentication | [Ex: JWT com refresh rotation, rate limiting em login] |
| XSS | [Ex: React escapa por padrão, CSP headers] |
| CSRF | [Ex: SameSite cookies, tokens CSRF em forms] |
| SSRF | [Ex: Whitelist de URLs externas] |

### 7.4 Dados Sensíveis

| Dado | Classificação | Proteção |
|------|--------------|----------|
| [Ex: Senhas] | Crítico | [Ex: bcrypt hash, nunca em log] |
| [Ex: Email] | PII | [Ex: Criptografado em repouso, LGPD compliant] |

---

## 8. Requisitos Não-Funcionais

| ID | Categoria | Requisito | Meta | Como Medir |
|----|-----------|-----------|------|------------|
| NFR-001 | Performance | Tempo de resposta da API | p95 < 200ms | [Ex: APM + load test] |
| NFR-002 | Disponibilidade | Uptime mensal | 99.5% | [Ex: Health check + uptime monitor] |
| NFR-003 | Escalabilidade | Usuários simultâneos | 500+ | [Ex: Load test com k6] |
| NFR-004 | Observabilidade | Error tracking | 100% erros capturados | [Ex: Sentry] |

---

## 9. Estratégia de Deploy

### 9.1 Ambientes

| Ambiente | URL | Branch | Deploy |
|----------|-----|--------|--------|
| Development | localhost | feature/* | Manual |
| Staging | [Ex: staging.app.com] | develop | Automático (CI/CD) |
| Production | [Ex: app.com] | main | Automático com approval |

### 9.2 CI/CD Pipeline

```
Push → Lint → Type Check → Test → Build → Deploy
                                          │
                                   ┌──────┴──────┐
                                   │  staging    │ (auto)
                                   │  production │ (manual approval)
                                   └─────────────┘
```

---

## Checklist de Completude

- [ ] Stack tecnológica justificada com ADRs
- [ ] Diagrama C4 nível 1 e 2 presentes
- [ ] Modelo de dados com entidades e relacionamentos
- [ ] Schema de banco com tabelas, PKs/FKs e índices
- [ ] Autenticação e autorização definidas
- [ ] OWASP Top 10 mitigado
- [ ] NFRs mensuráveis definidos
- [ ] Mínimo 2 ADRs documentados
- [ ] Estratégia de deploy com ambientes
