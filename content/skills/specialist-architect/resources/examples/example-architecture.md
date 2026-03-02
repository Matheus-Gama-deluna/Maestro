# Arquitetura — TaskFlow

> **Fase:** 3 · Arquitetura  
> **Data:** 2026-03-01  
> **Status:** Aprovado  
> **Base:** Discovery + Design Doc

---

## 1. Sumário Executivo

TaskFlow é um SaaS monolítico usando Next.js 14 (frontend SSR) + Node.js/Express (API REST) + PostgreSQL 16, hospedado na Vercel (frontend) + Railway (backend + banco). Autenticação via JWT com refresh tokens + Google OAuth. Arquitetura limpa com separação API → Services → Repositories. Decisão por monolito justificada pelo tamanho do time (1-2 devs) e escopo do MVP.

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| Next.js | 14.x | App Router, Server Components para SEO, ISR para performance |
| TypeScript | 5.x | Type-safety end-to-end com Prisma + Zod |
| Tailwind CSS | 3.x | Utility-first, consistente com design system, sem CSS custom |
| shadcn/ui | latest | Componentes acessíveis (Radix), customizáveis, sem vendor lock-in |
| Zustand | 4.x | State management simples — 1 store por domínio, sem boilerplate |
| React Query | 5.x | Cache de dados do servidor, refetch automático, optimistic updates |

### 2.2 Backend

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| Node.js | 20 LTS | Mesmo ecossistema do frontend, async I/O nativo, LTS até 2026 |
| Express | 4.x | Maduro, extensível, middleware ecosystem rico |
| Prisma | 5.x | Type-safe ORM, auto-generated types, migrations versionadas, Prisma Studio |
| Zod | 3.x | Validação de input runtime + compile-time, integra com TypeScript |
| jsonwebtoken | 9.x | JWT padrão da indústria, refresh token rotation |
| bcryptjs | 2.x | Hash de senhas, cost factor 12 |

### 2.3 Banco de Dados

| Tecnologia | Justificativa |
|-----------|---------------|
| PostgreSQL 16 | ACID compliance, extensões ricas, performance, free tier Railway |

### 2.4 Infraestrutura

| Componente | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| Frontend hosting | Vercel | Deploy automático do Next.js, CDN global, free tier generoso |
| Backend hosting | Railway | Deploy via Dockerfile, PostgreSQL incluso, $5/mês starter |
| CI/CD | GitHub Actions | Integrado ao repositório, lint → test → build → deploy |
| Monitoramento | Sentry | Error tracking, performance monitoring, free tier 5k events |
| Analytics | Vercel Analytics | Web Vitals, page views, zero config |

---

## 3. Diagrama C4

### 3.1 Nível 1 — Contexto

```
                    ┌──────────────┐
                    │   Usuários   │
                    │  (Marina,    │
                    │   Carlos)    │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
                    ┌──────────────┐
                    │  TaskFlow    │
                    │  Web App     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Google   │ │ SendGrid │ │ Sentry   │
        │ OAuth    │ │ (Email)  │ │ (Errors) │
        └──────────┘ └──────────┘ └──────────┘
```

### 3.2 Nível 2 — Containers

```
        ┌───────────────────────────────────────────┐
        │              TaskFlow System               │
        │                                           │
        │  ┌─────────────────┐  ┌────────────────┐ │
        │  │   Frontend      │  │   Backend API  │ │
        │  │   (Next.js)     │─▶│   (Express)    │ │
        │  │   Vercel        │  │   Railway      │ │
        │  │   Port: 443     │  │   Port: 3001   │ │
        │  └─────────────────┘  └───────┬────────┘ │
        │                               │          │
        │                        ┌──────┴───────┐  │
        │                        │ PostgreSQL   │  │
        │                        │ Railway      │  │
        │                        │ Port: 5432   │  │
        │                        └──────────────┘  │
        └───────────────────────────────────────────┘
```

---

## 4. Modelo de Dados

### 4.1 Entidades Principais

#### User

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK, gen_random_uuid() |
| email | VARCHAR(255) | ✅ | Unique, usado para login |
| name | VARCHAR(100) | ✅ | Nome de exibição |
| password_hash | VARCHAR(255) | ❌ | Null se OAuth-only |
| avatar_url | TEXT | ❌ | URL do avatar (Google ou upload) |
| google_id | VARCHAR(255) | ❌ | ID do Google OAuth, unique |
| created_at | TIMESTAMP | ✅ | Default NOW() |
| updated_at | TIMESTAMP | ✅ | Default NOW() |

#### Project

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK |
| name | VARCHAR(100) | ✅ | Nome do projeto |
| description | TEXT | ❌ | Descrição opcional |
| owner_id | UUID | ✅ | FK → User.id |
| status | ENUM | ✅ | 'active', 'archived' |
| created_at | TIMESTAMP | ✅ | Default NOW() |
| updated_at | TIMESTAMP | ✅ | Default NOW() |

#### ProjectMember

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK |
| project_id | UUID | ✅ | FK → Project.id |
| user_id | UUID | ✅ | FK → User.id |
| role | ENUM | ✅ | 'admin', 'member', 'viewer' |
| joined_at | TIMESTAMP | ✅ | Default NOW() |

#### Task

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK |
| project_id | UUID | ✅ | FK → Project.id |
| title | VARCHAR(200) | ✅ | Título da tarefa |
| description | TEXT | ❌ | Descrição em markdown |
| status | ENUM | ✅ | 'todo', 'doing', 'review', 'done' |
| priority | ENUM | ✅ | 'p1', 'p2', 'p3', 'p4'. Default 'p3' |
| assignee_id | UUID | ❌ | FK → User.id |
| due_date | DATE | ❌ | Prazo |
| position | INTEGER | ✅ | Ordem no kanban (para drag-and-drop) |
| created_by | UUID | ✅ | FK → User.id |
| created_at | TIMESTAMP | ✅ | Default NOW() |
| updated_at | TIMESTAMP | ✅ | Default NOW() |

#### Subtask

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK |
| task_id | UUID | ✅ | FK → Task.id, CASCADE delete |
| title | VARCHAR(200) | ✅ | Título da subtarefa |
| completed | BOOLEAN | ✅ | Default false |
| position | INTEGER | ✅ | Ordem na lista |

#### Comment

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK |
| task_id | UUID | ✅ | FK → Task.id, CASCADE delete |
| author_id | UUID | ✅ | FK → User.id |
| content | TEXT | ✅ | Conteúdo em markdown |
| created_at | TIMESTAMP | ✅ | Default NOW() |

#### Label

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| id | UUID | ✅ | PK |
| project_id | UUID | ✅ | FK → Project.id |
| name | VARCHAR(50) | ✅ | Nome do label |
| color | VARCHAR(7) | ✅ | Hex color (#FF5733) |

#### TaskLabel (N:N)

| Atributo | Tipo | Obrigatório | Descrição |
|----------|------|:-----------:|-----------|
| task_id | UUID | ✅ | FK → Task.id |
| label_id | UUID | ✅ | FK → Label.id |
| PK composta | (task_id, label_id) | ✅ | |

### 4.2 Relacionamentos

| Entidade A | Relação | Entidade B | Descrição |
|-----------|---------|-----------|-----------|
| User | 1:N | Project | Um usuário é dono de muitos projetos |
| User | N:N | Project | Muitos membros em muitos projetos (via ProjectMember) |
| Project | 1:N | Task | Um projeto tem muitas tarefas |
| Task | 1:N | Subtask | Uma tarefa tem muitas subtarefas |
| Task | 1:N | Comment | Uma tarefa tem muitos comentários |
| Task | N:N | Label | Muitas tarefas com muitos labels (via TaskLabel) |
| User | 1:N | Task (assignee) | Um usuário é responsável por muitas tarefas |
| User | 1:N | Comment | Um usuário é autor de muitos comentários |

---

## 5. Schema de Banco

### 5.1 Índices Planejados

| Tabela | Índice | Colunas | Tipo | Justificativa |
|--------|--------|---------|------|---------------|
| users | idx_users_email | email | UNIQUE | Login lookup — query mais frequente |
| users | idx_users_google_id | google_id | UNIQUE | OAuth lookup |
| project_members | idx_pm_project_user | (project_id, user_id) | UNIQUE | Evitar membro duplicado, query de autorização |
| tasks | idx_tasks_project_status | (project_id, status) | INDEX | Kanban: filtrar tarefas por projeto e status |
| tasks | idx_tasks_assignee | assignee_id | INDEX | "Minhas tarefas": filtrar por responsável |
| tasks | idx_tasks_due_date | due_date | INDEX | Dashboard: tarefas atrasadas (WHERE due_date < NOW()) |
| comments | idx_comments_task | task_id | INDEX | Carregar comentários de uma tarefa |

### 5.2 Migrations

| Ferramenta | Prisma Migrate |
|-----------|---------------|
| **Estratégia** | Migrations versionadas em `prisma/migrations/`, aplicadas via `prisma migrate deploy` no CI/CD |
| **Rollback** | Cada migration documentada. Em emergência: `prisma migrate resolve` + script SQL manual |
| **Seeds** | `prisma/seed.ts` com dados de desenvolvimento (2 users, 2 projects, 10 tasks) |

---

## 6. ADRs

### ADR-001: Monolito vs Microserviços

| Campo | Valor |
|-------|-------|
| **Status** | Aceito |
| **Contexto** | MVP com 1-2 devs, escopo de 6 features, 500 usuários no target. Precisa de velocidade de entrega. |
| **Decisão** | Monolito com separação por módulos (users/, projects/, tasks/). Frontend e backend em repos separados. |
| **Alternativas** | 1) Microserviços — rejeitado: overhead de infra (service mesh, API gateway) desproporcional para 1-2 devs. 2) Serverless (Lambda) — rejeitado: cold starts prejudicam UX do kanban drag-and-drop. |
| **Consequências** | (+) Deploy simples, DX melhor, debug fácil. (-) Escala vertical apenas, eventual refactor se crescer >10k users. |

### ADR-002: PostgreSQL vs MongoDB

| Campo | Valor |
|-------|-------|
| **Status** | Aceito |
| **Contexto** | Dados relacionais fortes (User → Project → Task → Subtask/Comment). Precisa de transações ACID para mover tarefas. |
| **Decisão** | PostgreSQL 16 via Railway (managed). |
| **Alternativas** | 1) MongoDB — rejeitado: dados altamente relacionais, joins complexos para dashboard. 2) SQLite — rejeitado: sem suporte a conexões concorrentes em produção. |
| **Consequências** | (+) ACID, queries complexas eficientes, Prisma excelente com Postgres. (-) Requer managed service (Railway $5/mês). |

### ADR-003: JWT vs Sessions

| Campo | Valor |
|-------|-------|
| **Status** | Aceito |
| **Contexto** | Frontend SPA (Next.js client components) precisa de autenticação stateless para API. |
| **Decisão** | JWT com access token (15min) + refresh token (7 dias) com rotação. Tokens em cookies HttpOnly Secure SameSite=Strict. |
| **Alternativas** | 1) Sessions server-side — rejeitado: requer Redis para scaling horizontal, overhead para MVP. 2) NextAuth sessions — rejeitado: lock-in no Next.js, dificulta API mobile futura. |
| **Consequências** | (+) Stateless, escala horizontal fácil no futuro, compatível com mobile. (-) Complexidade de refresh token rotation. |

---

## 7. Segurança

### 7.1 Autenticação

| Aspecto | Implementação |
|---------|---------------|
| **Email/senha** | bcrypt cost 12, mín 8 chars. Rate limit: 5 tentativas/15min por IP |
| **Google OAuth** | via passport-google-oauth20, scopes: profile + email |
| **Access Token** | JWT, 15min expiry, payload: {userId, email, role} |
| **Refresh Token** | UUID opaco, 7 dias, armazenado em DB, rotação a cada uso |
| **Cookies** | HttpOnly, Secure, SameSite=Strict, path=/ |

### 7.2 Autorização

| Recurso | Admin | Member | Viewer |
|---------|:-----:|:------:|:------:|
| Ver projetos | ✅ | ✅ | ✅ |
| Criar/editar tarefas | ✅ | ✅ | ❌ |
| Convidar membros | ✅ | ❌ | ❌ |
| Deletar projeto | ✅ | ❌ | ❌ |
| Editar settings | ✅ | ❌ | ❌ |

### 7.3 OWASP Top 10

| Vulnerabilidade | Mitigação |
|----------------|-----------|
| SQL Injection | Prisma ORM — queries parametrizadas por padrão |
| XSS | React escapa por padrão, CSP headers via Vercel |
| Broken Auth | JWT com refresh rotation, rate limiting, bcrypt |
| CSRF | SameSite=Strict cookies, Double Submit Cookie pattern |
| SSRF | Sem fetch de URLs externas no MVP |
| Mass Assignment | Zod schemas validam EXATAMENTE os campos permitidos |

### 7.4 LGPD

| Dado | Classificação | Proteção |
|------|--------------|----------|
| Email | PII | Criptografado em repouso (PostgreSQL encryption), acesso logado |
| Nome | PII | Exibido apenas para membros do mesmo projeto |
| Senha | Crítico | bcrypt hash, nunca armazenada em texto claro, nunca em logs |

---

## 8. Requisitos Não-Funcionais

| ID | Categoria | Requisito | Meta | Como Medir |
|----|-----------|-----------|------|------------|
| NFR-001 | Performance | API response time | p95 < 300ms | Sentry Performance |
| NFR-002 | Performance | First Contentful Paint | < 1.5s | Vercel Analytics |
| NFR-003 | Disponibilidade | Uptime mensal | 99.5% | Better Uptime (free) |
| NFR-004 | Escalabilidade | Concurrent users | 500 | k6 load test |
| NFR-005 | Observabilidade | Error tracking | 100% de erros | Sentry |

---

## 9. Estratégia de Deploy

### 9.1 Ambientes

| Ambiente | URL | Branch | Deploy |
|----------|-----|--------|--------|
| Development | localhost:3000 / :3001 | feature/* | Manual |
| Preview | *.vercel.app | PR branches | Automático (Vercel) |
| Production | taskflow.app | main | Automático com checks verdes |

### 9.2 CI/CD Pipeline (GitHub Actions)

```
Push to PR:
  → Lint (ESLint) → Type Check (tsc) → Test (Vitest) → Build → Vercel Preview

Merge to main:
  → Lint → Type Check → Test → Build → Prisma Migrate → Deploy Prod
```
