# Diagnóstico: Fases de Desenvolvimento de Código no Maestro (v2)

> **Data:** 2026-02-26  
> **Versão:** v7.2 → v8.0 (proposta)  
> **Escopo:** Fases 14 (Frontend), 15 (Backend), 16 (Integração), 17 (Deploy Final)  
> **Revisão:** v2 — Análise profunda com entregáveis reais do projeto "teste"

---

## 1. Análise Profunda — Entregáveis Reais do Projeto "teste"

### 1.1 O Que as Fases de Engenharia Já Produziram

Analisei cada entregável real do projeto `c:\Users\gamam\...\teste`:

| Fase | Entregável Real | Conteúdo Relevante para Código |
|------|----------------|-------------------------------|
| 1. PRD | `docs/01-produto/PRD.md` | MVP, funcionalidades, personas |
| 2. Requisitos | `docs/02-requisitos/requisitos.md` + critérios + matriz | RFs com IDs, NFRs, critérios Gherkin |
| 3. UX Design | `docs/03-ux-design/design-doc.md` + wireframes + jornadas | Wireframes, fluxos, componentes UI, design system |
| 4. Modelo Domínio | `docs/fase-04-modelo-de-dominio/modelo-dominio.md` (601 linhas) | **Entidades com atributos tipados**, regras de negócio, comportamentos |
| 5. Banco de Dados | `docs/fase-05-banco/design-banco.md` (753 linhas) | **Schema SQL completo** (CREATE TABLE), índices, constraints, migrações Prisma |
| 6. Arquitetura | `docs/06-arquitetura/arquitetura.md` (1007 linhas) | **Stack definida:** Next.js 14 + Express + TypeScript + Prisma + PostgreSQL + Redis. ADRs. Diagramas C4. Exemplos de código reais |
| 7. Arq. Avançada | `docs/07-arquitetura-avancada/arquitetura-avancada.md` | Bounded Contexts, CQRS, Event Sourcing |
| 8-11 | Segurança/Performance/Observabilidade/Testes | OWASP, SLAs (<200ms), Pirâmide testes, Winston+ELK |
| **12. Backlog** | `docs/12-backlog/backlog.md` (183 linhas) | **8 épicos, 18 features, 10 user stories com IDs (US-001..US-090)**, sprints planejadas, DoD por tipo |
| **13. Contrato API** | `docs/13-api/openapi.yaml` (754 linhas) | **OpenAPI 3.0 REAL** com schemas tipados, endpoints, exemplos, error responses |

### 1.2 Dados Cruciais Já Definidos nas Fases Anteriores

A análise da Arquitetura (fase 6) mostra que **TUDO** sobre stack já está decidido:

- **Frontend:** Next.js 14+ App Router, TypeScript 5.0+, Tailwind + shadcn/ui, Zustand + React Query, Jest + RTL + Playwright
- **Backend:** Node.js 20 LTS, Express + TypeScript, Prisma 5.x, JWT + bcrypt + RBAC
- **Banco:** PostgreSQL 15+ (RDS), Redis 7+ (ElastiCache)
- **Infra:** AWS, Docker, GitHub Actions, CloudWatch + DataDog
- **Módulos:** Auth, Products, Stock, Sales, Reports, Analytics (com APIs REST + GraphQL)

O Backlog (fase 12) já define **a ordem de implementação**:
```
Contrato-first → FE contra mocks → BE contra contrato → Integração
S0: Setup + CI
S1: OpenAPI + mocks
S2: Produtos + Estoque (US-020, US-030)
S3: Alertas + Dashboard (US-040, US-050)
S4: Pagamentos + Offline (US-060, US-070)
```

E o OpenAPI (fase 13) tem **754 linhas de YAML real** com:
- 8 tags (Auth, Produtos, Estoque, Alertas, Pagamentos, Relatórios, Previsões, Offline)
- Schemas tipados completos (Product, StockSnapshot, Alert, PaymentReconciliation...)
- Error responses padronizados

### 1.3 Tasks Existentes no estado.json — Evidência do Bug

O `estado.tasks` contém **~60 tasks**, mas todas foram geradas da **Observabilidade** (fase 10), não do Backlog:
- `"Implementar: 1.1. Objetivos"` → headers H3 do doc de observabilidade
- `"Implementar: 2.1. Arquitetura de Observabilidade"` → idem
- `"Implementar: 3.1. Requisitos"` → são requisitos de LOGS, não do produto

**Nenhuma task** referencia: `US-020 Produtos`, `US-030 Estoque`, `US-050 Dashboard`, etc.

O `decomposeArchitectureToTasks()` foi chamado na transição fase 10→11 (Observabilidade→Testes), usando o conteúdo do doc de observabilidade como input. Tasks foram geradas para a fase 11 (Testes). Para a fase 14 (Frontend), **0 tasks foram geradas** porque o trigger acontece na transição 13→14 usando o YAML do OpenAPI, que não tem H2/H3 markdown.

---

## 2. Problemas Identificados (Revisados)

### 🔴 P1 — CRÍTICO: TaskDecomposer usa documento ERRADO e formato ERRADO

**Antes (minha análise v1):** "Tasks são 0/0"  
**Realidade:** Tasks existem (~60), mas foram geradas do doc de **Observabilidade**, não do **Backlog**. E para a fase 14, são 0/0 porque o OpenAPI é YAML.

**Causa raiz dupla:**
1. `decomposeArchitectureToTasks()` é chamado com o entregável da **fase anterior** (qualquer que seja), não com o Backlog
2. A função só parseia Markdown H2/H3 — YAML, SQL ou outro formato gera zero tasks
3. O Backlog (fase 12) tem 10 user stories com IDs, épicos e sprints — mas **nunca é lido** pelo TaskDecomposer

### 🔴 P2 — CRÍTICO: Fases de código usam fluxo de documentos

`avancar.ts` → `proximo.ts` trata **todas** as fases igual:
- Espera um "entregável" textual (markdown) de pelo menos 200 chars
- Valida com `ValidationPipeline.validateDeliverable()` (busca keywords)
- Salva em `docs/fase-14-frontend/frontend-code` — path sem sentido para código

Na realidade, o código é espalhado: `frontend/src/components/`, `frontend/src/pages/`, etc. (como evidenciado pela pasta `frontend/` que já existe no projeto teste).

### 🔴 P3 — CRÍTICO: Nenhuma ponte Backlog → Implementação

O backlog do projeto teste define claramente:
```
US-020: CRUD Produtos → FE+BE → 8pts
US-030: Estoque real-time → FE+BE → 8pts
US-050: Dashboard KPIs → FE → 5pts
```

Mas o sistema **nunca referencia** essas user stories. O especialista de Frontend recebe apenas:
- Menções genéricas aos entregáveis anteriores (via `formatarContextoComoMencoes`)
- `getSpecialistQuestions()` retorna `''` — nenhuma pergunta
- Tasks mostram `0/0 (0%)`

### 🟠 P4 — ALTO: `getSpecialistQuestions` — Não precisa perguntar stack

**Correção da v1:** O plano anterior propunha perguntas sobre stack/framework. Isso é **desnecessário** — a Arquitetura (fase 6) já definiu tudo: Next.js, Express, Prisma, Tailwind, Zustand, etc.

O que o especialista de código REALMENTE precisa perguntar:
- **Frontend:** "Qual é a prioridade? Começar pelo fluxo de Login (US-020) ou Dashboard (US-050)?"
- **Backend:** "O banco já está rodando? Seeds estão prontos? Prisma schema existe?"
- **Integração:** "Frontend e Backend estão no mesmo repo ou separados? URL base da API?"

São perguntas **operacionais**, não de design.

### 🟠 P5 — ALTO: Contexto disperso — Especialista não sabe por onde começar

Ao entrar na fase 14, o especialista recebe:
1. Instrução genérica: "Sou o Especialista Frontend, meu foco é..."
2. Menção a 13 entregáveis anteriores (via `formatarContextoComoMencoes`)
3. Gate checklist de 3 itens vagos

**Não recebe:**
- As user stories relevantes para Frontend
- O Sprint Planning (S1→S2→S3→...)
- Os endpoints que deve consumir (extraídos do OpenAPI)
- A estrutura de diretórios esperada
- O DoD específico para Frontend (definido no backlog)

### 🟡 P6 — MÉDIO: `entregavel_esperado: "frontend-code"` — Conceito incompatível

Para fases de documentos, o entregável é 1 arquivo markdown. Para código, o entregável são N arquivos em diretórios variados. O conceito precisa mudar para um **manifest** ou **relatório de progresso**.

### 🟡 P7 — MÉDIO: Tasks não iteram — fluxo é "tudo de uma vez"

O fluxo atual pede UM entregável completo por fase. Mas implementar TODA a fase Frontend de uma vez é irreal. O fluxo deveria ser:
1. Implementar US-020 (CRUD Produtos)
2. Validar → Marcar done
3. Implementar US-030 (Estoque real-time)
4. Validar → Marcar done
5. ... até todas as US do Frontend estarem done

### 🟡 P8 — MÉDIO: Validação por keywords — inadequada para código

O `proximo.ts` valida entregáveis buscando keywords do gate_checklist no texto. Para código, deveria verificar:
- Arquivos existem no disco
- Estrutura de diretórios está correta
- (Opcional futuro: lint, testes)

---

## 3. Cadeia de Dados: Engenharia → Desenvolvimento

### O Que Já Funciona Bem

```
Fase 1-11: Produzem documentos de alta qualidade ✅
  → PRD robusto (95/100 score)
  → Requisitos com IDs e Gherkin
  → Modelo de Domínio com entidades tipadas
  → Schema SQL completo com Prisma
  → Arquitetura com stack DEFINIDA e exemplos de código
  → NFRs detalhados (segurança, performance, observabilidade, testes)

Fase 12 (Backlog): Excelente planejamento ✅
  → 8 épicos, 18 features, 10 US priorizadas
  → Sprints planejados com capacidade e buffer
  → DoD por tipo (Frontend, Backend, Integração)
  → Fluxo contrato-first explícito

Fase 13 (Contrato API): OpenAPI REAL e completo ✅
  → 754 linhas de YAML válido
  → Schemas tipados (Product, Stock, Alert...)
  → Exemplos de request/response
  → Error handling padronizado
```

### O Que Está Quebrado na Transição 13 → 14

```
Fase 13 → Fase 14: QUEBRA TOTAL ❌
  → TaskDecomposer lê OpenAPI YAML → 0 tasks (não é markdown)
  → Backlog com 10 US → NUNCA LIDO pelo sistema
  → Especialista recebe: menções genéricas + 0 tasks + 0 perguntas
  → Resultado: IA não sabe por onde começar, pergunta coisas já definidas
```

### Fluxo Ideal (Que o Sistema Deveria Fazer)

```
Ao entrar na Fase 14 (Frontend):

1. LER BACKLOG → Extrair US relevantes para Frontend:
   - US-020: CRUD Produtos (FE+BE) → Frontend: UI de cadastro
   - US-030: Estoque real-time (FE+BE) → Frontend: Dashboard estoque
   - US-050: Dashboard KPIs (FE) → Frontend: Tela principal
   - US-070: Offline (FE+BE) → Frontend: PWA + IndexedDB

2. LER OPENAPI → Extrair endpoints que o Frontend vai consumir:
   - POST /auth/login, POST /auth/refresh
   - GET/POST/PUT/DELETE /products, /products/{id}
   - GET /stock, GET /stock/{id}/movements
   - GET /alerts
   - GET /reports/sales
   - POST /offline/sync

3. LER ARQUITETURA → Stack já definida:
   - Next.js 14 + TypeScript + Tailwind + shadcn/ui + Zustand + React Query

4. GERAR TASKS ordenadas por Sprint do Backlog:
   Sprint S1: Setup + Mocks (configurar MSW com tipos do OpenAPI)
   Sprint S2: US-020 (CRUD Produtos) + US-030 (Estoque)
   Sprint S3: US-050 (Dashboard) + US-040 (Alertas UI)
   Sprint S4: US-070 (Offline PWA)

5. APRESENTAR primeira task com contexto:
   "Task 1/12: Setup do projeto Next.js
    → npx create-next-app@latest frontend --typescript --tailwind
    → Instalar: @tanstack/react-query, zustand, msw
    → Configurar MSW com mocks baseados no OpenAPI
    → Estrutura: src/components/, src/pages/, src/hooks/, src/lib/api/"

6. ITERAR task-by-task:
   → IA implementa
   → Sistema valida (arquivos existem)
   → Marca done
   → Próxima task
```

---

## 4. Plano de Melhorias Revisado — Sprint v8.0

### Princípios do Plano Revisado

1. **Não perguntar o que já foi decidido** — Stack, framework, ORM, DB estão na Arquitetura
2. **Backlog é o driver** — As tasks vêm das User Stories, não dos headers H2/H3
3. **Contrato API é o contrato de interface** — Frontend consome, Backend implementa
4. **Menções > injeção** — Continuar usando `#path` para forçar leitura (filosofia v7.2)
5. **Iterativo, não monolítico** — Implementar US por US, não "toda a fase de uma vez"

### Task 8.1 — Code Phase Handler (CRÍTICO)

**Arquivo:** `src/src/handlers/code-phase-handler.ts` (NOVO)

Handler dedicado que intercepta fases de código em `avancar.ts`:

**Responsabilidades:**
1. Detectar que é fase de código (Frontend/Backend/Integração/Deploy)
2. Ler do disco: backlog, OpenAPI, arquitetura, design-doc (via menções)
3. Se `estado.tasks` está vazio para a fase atual → chamar `decomposeBacklogToTasks()`
4. Se já tem tasks → apresentar a PRÓXIMA task via `getNextTask()`
5. Se task concluída (IA indica) → marcar como `done`, avançar
6. Se TODAS as tasks done → gerar manifest, validar gate, chamar `proximo()`

**Integração com `avancar.ts` (linha ~251):**
```typescript
// Antes de "delegar para proximo"
const faseInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
const isCodePhase = ['Frontend', 'Backend', 'Integração', 'Deploy Final']
    .some(k => faseInfo?.nome?.includes(k));

if (isCodePhase) {
    const { handleCodePhase } = await import("../../handlers/code-phase-handler.js");
    return handleCodePhase({ estado, diretorio, respostas: args.respostas, entregavel: args.entregavel });
}
```

**Output do handler (1ª chamada — setup da fase):**
```markdown
# 🚀 Fase 14: Frontend — Setup

## Stack Definida (Arquitetura fase 6)
- Next.js 14 + TypeScript + Tailwind + shadcn/ui
- State: Zustand + React Query
- Testes: Jest + RTL + Playwright

## 📋 User Stories para esta Fase
1. **US-020** CRUD Produtos (8pts) — Sprint S2
2. **US-030** Estoque real-time (8pts) — Sprint S2
3. **US-050** Dashboard KPIs (5pts) — Sprint S3
4. **US-070** Offline PWA (13pts) — Sprint S4

## 📎 Leia antes de começar
#docs/03-ux-design/design-doc.md
#docs/06-arquitetura/arquitetura.md
#docs/12-backlog/backlog.md
#docs/13-api/openapi.yaml

## ⚡ Task Atual: 1/N — Setup do Projeto
Crie a estrutura do projeto Next.js com as dependências definidas.
```

**Output (chamadas subsequentes — task por task):**
```markdown
# ✅ Task 1 Concluída → Task 2/12

## 📌 Task Atual: Implementar US-020 (CRUD Produtos)
### Contexto
- Endpoints: GET/POST/PUT/DELETE /products (ver OpenAPI)
- UI: Lista paginada, form de cadastro, upload imagem
- Schema: Product { id, name, sku, minStock, maxStock, costPrice, salePrice }

### Arquivos Esperados
- `src/components/products/ProductList.tsx`
- `src/components/products/ProductForm.tsx`
- `src/hooks/useProducts.ts` (React Query + API)
- `src/pages/products/index.tsx`
- `src/pages/products/new.tsx`

### DoD (do Backlog)
- [x] CRUD completo + testes
- [x] Responsivo + WCAG 2.1 AA
- [x] Loading/empty/error states
```

### Task 8.2 — TaskDecomposer v2: Baseado no Backlog (CRÍTICO)

**Arquivo:** `src/src/services/task-decomposer.service.ts` (ADICIONAR nova função)

**Nova função `decomposeBacklogToTasks()`:**

```typescript
export function decomposeBacklogToTasks(
    backlogContent: string,
    openApiContent: string | null,
    faseNumero: number,
    faseNome: string  // 'Frontend', 'Backend', 'Integração'
): TaskItem[] {
    // 1. Extrair user stories do backlog
    const stories = extractUserStories(backlogContent);
    
    // 2. Filtrar por tipo relevante à fase
    const relevantStories = stories.filter(s => 
        isRelevantForPhase(s, faseNome)
    );
    
    // 3. Para cada story, gerar sub-tasks baseadas no tipo da fase
    // Frontend: Component → Hook → Page → Tests
    // Backend: DTO → Entity → Repo → Service → Controller → E2E
    // Integração: Replace mocks → Connect → E2E
    
    // 4. Se tem OpenAPI, enriquecer tasks com endpoints relevantes
    
    // 5. Adicionar task de Setup como primeira task
    
    return tasks;
}
```

**Lógica de extração de User Stories:**
```
Parsear o backlog procurando:
- Padrão: | US-XXX | descrição | Tipo | ... |
- Filtrar por tipo:
  - Frontend: tipo contém "FE" ou "FE+BE"
  - Backend: tipo contém "BE" ou "FE+BE"
  - Integração: tipo contém "Integração" ou "Infra"
```

**Manter `decomposeArchitectureToTasks()` existente** (para compatibilidade), mas chamar a nova função quando o Backlog existir.

### Task 8.3 — Contexto Inteligente por Fase de Código (ALTO)

**Arquivo:** `src/src/handlers/code-phase-handler.ts`

Em vez de perguntas sobre stack (já definida), montar contexto automático lendo dos entregáveis:

**Para Frontend (fase 14):**
- Ler `arquitetura.md` → Extrair seção "3.1 Frontend" (stack + libs)
- Ler `openapi.yaml` → Listar endpoints disponíveis para consumo
- Ler `design-doc.md` → Extrair componentes de UI descritos
- Ler `backlog.md` → Extrair US com tipo FE
- Gerar instrução: "Sua stack é X. Seus endpoints são Y. Implemente US-020 primeiro."

**Para Backend (fase 15):**
- Ler `arquitetura.md` → Seção "3.2 Backend" (Express + Prisma)
- Ler `openapi.yaml` → Endpoints que deve IMPLEMENTAR
- Ler `design-banco.md` → Schema SQL / Prisma schema
- Ler `modelo-dominio.md` → Entidades e regras de negócio
- Ler `backlog.md` → US com tipo BE

**Para Integração (fase 16):**
- Listar mocks usados no Frontend (MSW)
- Listar endpoints implementados no Backend
- Gerar checklist: "Substituir mock de /products → http://localhost:3333/api/v1/products"

### Task 8.4 — Specialist Questions Operacionais (ALTO)

**Arquivo:** `src/src/handlers/specialist-formatters.ts`

Substituir perguntas de stack por perguntas **operacionais**:

**Frontend:**
```markdown
## 🎨 Desenvolvimento Frontend — Setup

A stack já está definida na Arquitetura: **Next.js 14 + TypeScript + Tailwind + shadcn/ui + Zustand + React Query**

Preciso confirmar alguns pontos operacionais:
1. O projeto Next.js já foi inicializado? (Detectei pasta `frontend/`)
2. Qual User Story quer priorizar? (Recomendo: US-020 CRUD Produtos)
3. Onde está o mock server? (MSW já configurado ou precisa setup?)
4. Estrutura monorepo ou repos separados?

> Após suas respostas, vou gerar o setup e começar pela primeira US.
```

**Backend:**
```markdown
## ⚙️ Desenvolvimento Backend — Setup

Stack definida: **Node.js 20 + Express + TypeScript + Prisma + PostgreSQL + Redis**

Preciso confirmar:
1. O banco PostgreSQL está rodando? (local ou Docker?)
2. O Prisma schema já existe ou devo criar do `design-banco.md`?
3. Seeds iniciais necessários? (dados de teste)
4. Estrutura de pastas preferida? (Clean Architecture já definida na Arquitetura)

> Após suas respostas, vou criar a estrutura e começar pela primeira US.
```

**Integração:**
```markdown
## 🔗 Integração — Conexão Frontend ↔ Backend

1. URLs: Frontend em qual porta? Backend em qual porta?
2. CORS já configurado?
3. Variáveis de ambiente (.env) definidas?
4. Quer manter mock como fallback ou remover totalmente?
```

### Task 8.5 — Entregável Manifest para Fases de Código (ALTO)

**Arquivos:** `src/src/handlers/code-phase-handler.ts`, `src/src/types/code-manifest.ts`

O "entregável" de uma fase de código é um **manifest** JSON gerado automaticamente:

```typescript
interface CodeManifest {
    fase: number;
    nome: string;
    stack: { framework: string; language: string; };
    user_stories: {
        id: string;      // US-020
        titulo: string;   
        status: 'done' | 'in_progress' | 'todo';
        arquivos: string[];  // paths criados
    }[];
    tasks_total: number;
    tasks_done: number;
    arquivos_criados: string[];
    timestamp: string;
}
```

Ao completar todas as tasks, o handler:
1. Gera o manifest em `docs/fase-14-frontend/manifest.json`
2. Gera um resumo markdown em `docs/fase-14-frontend/frontend-summary.md`
3. Registra como entregável no `estado.entregaveis`
4. Delega para `proximo()` para validar o gate e avançar

### Task 8.6 — Gate Checklist Expandido (MÉDIO)

**Arquivo:** `src/src/flows/types.ts`

Atualizar gate_checklist com critérios **mensuráveis e baseados no Backlog**:

**Frontend (fase 14):**
```typescript
gate_checklist: [
    "Componentes implementados conforme design doc e user stories",
    "Pages com rotas configuradas para cada fluxo do backlog",
    "State management conectado (Zustand/React Query)",
    "Integração com mocks do contrato API (MSW ou similar)",
    "Testes unitários para componentes críticos",
    "Responsivo mobile-first",
    "Loading, empty e error states em todas as telas",
],
```

**Backend (fase 15):**
```typescript
gate_checklist: [
    "Endpoints implementados conforme OpenAPI (contrato API)",
    "DTOs com validação de input para cada endpoint",
    "Services com regras de negócio do modelo de domínio",
    "Testes unitários para services e controllers",
    "Migrações de banco executáveis (Prisma migrate)",
    "Error handling padronizado conforme schema ErrorResponse",
    "Autenticação JWT implementada conforme ADR-004",
],
```

**Integração (fase 16):**
```typescript
gate_checklist: [
    "Frontend conectado ao Backend real (mocks removidos)",
    "Todos os endpoints do OpenAPI funcionando end-to-end",
    "Testes E2E para fluxos críticos (login, CRUD, dashboard)",
    "CORS e variáveis de ambiente configurados",
    "Pipeline CI/CD verde com testes automatizados",
],
```

### Task 8.7 — Validação de Código por Existência de Arquivos (MÉDIO)

**Arquivo:** `src/src/gates/code-validator.ts` (NOVO)

Quando o gate de uma fase de código é validado, em vez de buscar keywords em texto:

1. Ler o manifest da fase
2. Para cada arquivo listado: `existsSync(path)` → ✅ ou ❌
3. Verificar se tasks do backlog estão cobertas
4. Score:
   - 50% — Arquivos do manifest existem no disco
   - 30% — User Stories marcadas como done
   - 20% — Resumo/manifest gerado corretamente

### Task 8.8 — Loop Task-by-Task no Code Phase Handler (MÉDIO)

**Arquivo:** `src/src/handlers/code-phase-handler.ts`

O handler implementa um **state machine** por chamada:

```
Estado 1: SETUP (1ª vez na fase)
  → Ler backlog + openapi + arquitetura
  → Gerar tasks se não existem
  → Apresentar visão geral + primeira task
  → Salvar estado

Estado 2: WORKING (chamadas subsequentes)
  → Se respostas indica task concluída → marcar done
  → Apresentar próxima task via getNextTask()
  → Mostrar progresso: "Task 5/12 (42%)"

Estado 3: GATE (todas tasks done)
  → Gerar manifest
  → Validar gate com code-validator
  → Se score >= threshold → delegar para proximo() para avançar
  → Se não → feedback com itens pendentes
```

A IA chama `executar({acao: "avancar"})` a cada task concluída. O handler detecta progresso e apresenta a próxima.

---

## 5. Priorização e Estimativa (Revisada)

| # | Task | Prioridade | ~Horas | Deps |
|---|------|-----------|--------|------|
| **8.1** | Code Phase Handler | 🔴 CRÍTICO | 3h | - |
| **8.2** | TaskDecomposer v2 (Backlog) | 🔴 CRÍTICO | 2h | - |
| **8.3** | Contexto Inteligente por Fase | 🟠 ALTO | 1.5h | 8.1 |
| **8.4** | Specialist Questions Operacionais | 🟠 ALTO | 0.5h | - |
| **8.5** | Entregável Manifest | 🟠 ALTO | 1.5h | 8.1 |
| **8.6** | Gate Checklist Expandido | 🟡 MÉDIO | 0.5h | - |
| **8.7** | Validação por Existência de Arquivos | 🟡 MÉDIO | 1.5h | 8.5 |
| **8.8** | Loop Task-by-Task | 🟡 MÉDIO | 2h | 8.1, 8.2 |

**Total estimado:** ~12.5h

### Ordem de Execução

```
Sprint A (Core — ~6h):
  8.2 TaskDecomposer v2     ← Nova função decomposeBacklogToTasks()
  8.1 Code Phase Handler    ← Handler principal, integra com avancar.ts
  8.4 Specialist Questions  ← Perguntas operacionais (não de stack)
  8.6 Gate Checklist         ← Critérios mensuráveis

Sprint B (Fluxo Iterativo — ~5h):
  8.3 Contexto Inteligente   ← Lê entregáveis e monta contexto
  8.5 Entregável Manifest    ← Registro multi-arquivo
  8.8 Loop Task-by-Task      ← State machine de implementação

Sprint C (Validação — ~1.5h):
  8.7 Code Validator          ← Verifica existência real de arquivos
```

---

## 6. Arquivos a Criar/Modificar

### Novos:
- `src/src/handlers/code-phase-handler.ts` — Handler principal (~300 linhas)
- `src/src/gates/code-validator.ts` — Validação de código (~100 linhas)
- `src/src/types/code-manifest.ts` — Tipagem do manifest (~30 linhas)
- `src/src/tests/code-phase-handler.test.ts` — Testes
- `src/src/tests/code-validator.test.ts` — Testes

### Modificados:
- `src/src/tools/consolidated/avancar.ts` — Detectar fase de código e delegar (5 linhas)
- `src/src/services/task-decomposer.service.ts` — Adicionar `decomposeBacklogToTasks()` (~120 linhas)
- `src/src/handlers/specialist-formatters.ts` — Perguntas operacionais (~80 linhas)
- `src/src/flows/types.ts` — Gate checklists expandidos (~30 linhas)
- `src/src/tools/proximo.ts` — Ajustar trigger do TaskDecomposer para usar Backlog (~10 linhas)
- `src/src/constants.ts` — Versão 7.2.0 → 8.0.0

---

## 7. Critérios de Aceitação

### Build
- `npx tsc --noEmit` → exit code 0
- `npm test` → 0 failures, novos testes passando

### Funcional — Cenário Completo
Ao entrar na fase 14 (Frontend) do projeto "teste":

1. ✅ Sistema detecta fase de código → delega para `code-phase-handler`
2. ✅ Handler lê backlog.md → extrai US-020, US-030, US-050, US-070
3. ✅ Handler lê openapi.yaml → extrai endpoints relevantes
4. ✅ Handler lê arquitetura.md → extrai stack definida
5. ✅ Gera tasks baseadas nas User Stories do backlog
6. ✅ Apresenta contexto completo + primeira task + perguntas operacionais
7. ✅ A cada `executar({acao: "avancar"})`, apresenta próxima task
8. ✅ Ao completar todas tasks → gera manifest → valida gate → avança para fase 15

### Compatibilidade
- Fases de documento (1-13) continuam usando `proximo.ts` sem alteração
- `decomposeArchitectureToTasks()` permanece como fallback se backlog não existir

### Rollback
- Se `code-phase-handler` falhar, o `avancar.ts` faz fallback para `proximo.ts` (comportamento atual)
