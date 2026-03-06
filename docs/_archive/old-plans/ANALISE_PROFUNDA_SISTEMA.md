# Análise Profunda do Sistema Maestro MCP v5.1.0

> **Data da Análise:** 2026-02-08  
> **Versão Analisada:** 5.1.0  
> **Objetivo:** Compreender profundamente o sistema, seu propósito, funcionamento atual e oportunidades de evolução

---

## 1. O Que é o Maestro MCP

### Propósito Central

O **Maestro MCP** é um **orquestrador de desenvolvimento de software assistido por IA**, implementado como um servidor MCP (Model Context Protocol). Ele transforma o desenvolvimento de software em um processo **estruturado, guiado e validado**, onde a IA atua como um **squad de especialistas** em vez de um assistente genérico.

### Proposta de Valor Única

```
Sem Maestro:                    Com Maestro:
─────────────                   ─────────────
IA genérica                     Especialistas de fase
Prompts ad-hoc                  Fluxo estruturado
Qualidade inconsistente         Gates de validação
Contexto perdido                Knowledge base persistente
Navegação confusa               Next action programático
```

### Casos de Uso Principais

1. **Startup MVP** — Discovery → Brainstorm → PRD → Arquitetura → Código → Deploy
2. **Feature Enterprise** — Com compliance, ADRs, approval gates
3. **Refatoração Guiada** — Análise → Checkpoints → Execução → Validação
4. **Code Review Automatizado** — Análise de segurança, qualidade, performance

---

## 2. Arquitetura do Sistema

### Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         IDE (Windsurf/Cursor/VS Code)          │
│                              ↕ MCP Protocol                      │
├─────────────────────────────────────────────────────────────────┤
│                     Maestro MCP Server v5.1                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Entry Points (Transport Layer)              │    │
│  │   ┌─────────┐        ┌─────────┐        ┌─────────┐     │    │
│  │   │stdio.ts │        │index.ts │        │server.ts│     │    │
│  │   │(STDIO)  │        │(HTTP)   │        │(Legacy) │     │    │
│  │   └────┬────┘        └────┬────┘        └─────────┘     │    │
│  │        └──────────────────┼────────────────────────────  │    │
│  │                           ↓                             │    │
│  │              ┌─────────────────────┐                    │    │
│  │              │   Router Centralizado│                    │    │
│  │              │    (router.ts)       │                    │    │
│  │              └──────────┬──────────┘                    │    │
│  └─────────────────────────┼───────────────────────────────┘    │
│                            ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Middleware Pipeline                         │    │
│  │   error → state → flow → persistence → skill          │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Tools Layer                                 │    │
│  │   ┌─────┐ ┌──────┐ ┌───────┐ ┌───────┐ ┌───────┐       │    │
│  │   │mae- │ │avan- │ │validar│ │context│ │salvar │       │    │
│  │   │stro │ │car   │ │       │ │o      │ │       │       │    │
│  │   └─────┘ └──────┘ └───────┘ └───────┘ └───────┘       │    │
│  │   ┌───────┐ ┌────────┐ ┌─────────┐                      │    │
│  │   │check- │ │analisar│ │37 legadas│                     │    │
│  │   │point │ │        │ │         │                      │    │
│  │   └───────┘ └────────┘ └─────────┘                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Services Layer                              │    │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐                 │    │
│  │   │State     │ │Flow      │ │Skill     │                 │    │
│  │   │Service   │ │Engine    │ │Loader    │                 │    │
│  │   └──────────┘ └──────────┘ └──────────┘                 │    │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐                 │    │
│  │   │Content   │ │Specialist│ │ClientCaps│ ← (HTTP only)  │    │
│  │   │Resolver  │ │Service   │ │Service   │                 │    │
│  │   └──────────┘ └──────────┘ └──────────┘                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Resources & Prompts                         │    │
│  │   Skills, Templates, Checklists, Especialistas, Guias   │    │
│  │   Prompts: maestro-specialist, context, template       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Componentes em Detalhe

### 3.1 Entry Points

#### `stdio.ts` — Modo IDE (STDIO)

**Propósito:** Entry point para IDEs que se comunicam via Standard I/O (Windsurf, Cursor, VS Code, Claude Code).

**Funcionalidades:**
- Registra 4 prompts MCP (`maestro-specialist`, `maestro-context`, `maestro-template`, `maestro-sessao`)
- Expor resources de skills, especialistas, templates, guias
- Handler de tools via `router.ts`
- **Problema:** `captureClientCapabilities` é importado mas **NUNCA chamado**

```typescript
// Linha 29: importado mas não usado
import { captureClientCapabilities } from "./services/client-capabilities.service.js";

// Deveria ser chamado no onInitialize do server, mas não há hook exposto pelo SDK
```

#### `index.ts` — Modo HTTP/SSE

**Propósito:** Entry point para web clients via HTTP + Server-Sent Events.

**Funcionalidades:**
- Express + JSON-RPC manual + SSE sessions
- Protocol version: `2025-03-26` (atualizado na v5.1)
- **Integração correta:** `captureClientCapabilities` é chamado no handler `initialize`
- Usa `shared-resource-handler.ts` (handler compartilhado)

#### `server.ts` — Legado

**Problema:** Ainda importa `tools/index.ts` (411 linhas, código morto). Deveria usar `router.ts`.

### 3.2 Router Centralizado (`router.ts`)

**Propósito:** Ponto ÚNICO de roteamento para todas as tools.

**Arquitetura:**

```typescript
// 8 Tools Públicas (superfície reduzida)
const publicTools = [
    { name: "maestro",     /* entry point inteligente */ },
    { name: "avancar",    /* avança fase */ },
    { name: "status",     /* status completo */ },
    { name: "validar",    /* gates, entregáveis, compliance */ },
    { name: "contexto",   /* ADRs, padrões, knowledge */ },
    { name: "salvar",     /* salva sem avançar */ },
    { name: "checkpoint", /* checkpoints e rollbacks */ },
    { name: "analisar",   /* análise de código */ },
];

// 37 Tools Legadas (backward compatible)
const legacyTools = [
    { name: "setup_inicial", /* etc... */ },
    // ... 36 mais
];
```

**Features:**
- Middlewares aplicados automaticamente por tipo de tool
- Deprecation warnings para tools legadas
- Mapa de redirecionamento (`legacyRedirects`)

### 3.3 Middleware Pipeline (`middleware/index.ts`)

**Pipeline Completo:**
```
withErrorHandling(
    withStateLoad(
        withFlowEngine(
            withPersistence(
                withSkillInjection(handler)
            )
        )
    )
)
```

**Tipos de Middleware:**

| Função | Aplica | Descrição |
|--------|--------|-----------|
| `applyMiddlewares` | status, validar, contexto, analisar | Pipeline completo |
| `applyLightMiddlewares` | proximo (legacy) | Apenas error + state |
| `applySmartMiddlewares` | maestro, avancar | error + state + skill injection |
| `applyPersistenceMiddlewares` | salvar, checkpoint | error + state + persistence |

**Problema:** `maestro` e `avancar` usam `applySmartMiddlewares` que **não inclui persistence**, então elas precisam salvar estado manualmente.

### 3.4 Tools Consolidadas (8 Públicas)

#### `maestro` — Entry Point Inteligente

**Propósito:** Detecta contexto automaticamente e guia o próximo passo.

**Lógica:**
1. Se sem `diretorio` → retorna instruções de uso
2. Se sem projeto → `handleNoProject()` (inicia setup)
3. Com projeto → carrega estado, detecta fase, retorna próximo passo

**Injeção Ativa v5:**
- Carrega skill da fase atual (modo "economy" para resumir tokens)
- Injeta contexto do especialista na resposta

**Problema:** Não usa `formatResponse` completo (usa parcialmente)

#### `avancar` — Avança no Fluxo

**Propósito:** Avança fase ou processa próximo bloco de onboarding.

**Lógica:**
- Detecta se está em onboarding via `isInOnboarding(estado)`
- Onboarding: delega para `onboardingOrchestrator`
- Desenvolvimento: submete entregável, valida gate, avança fase

#### `status`, `validar`, `contexto`, `salvar`, `checkpoint`, `analisar`

**Status:**
- `validar`, `checkpoint`, `analisar` → Usam `formatError` mas retornos de sucesso delegam para sub-tools legadas
- `status`, `contexto`, `salvar` → **NÃO migradas**, retornam formato legado (JSON serializado)

### 3.5 Services Layer

#### `SkillLoaderService`

**Propósito:** Carrega skills (contexto especializado) para cada fase.

**Modos de Token Budget:**
```typescript
const TOKEN_BUDGETS = {
    economy:  { skill: 2000, template: 1000, checklist: 500 },  // ~3500 tokens
    balanced: { skill: 4000, template: 2000, checklist: 1000 }, // ~7000 tokens
    quality:  { skill: 8000, template: 4000, checklist: 2000 }, // ~14000 tokens
};
```

**Processamento de Skills:**
1. Trunca seções de referência (documentação completa, exemplos) em modos economy/balanced
2. Mantém seções obrigatórias (sempre presentes)
3. Inclui checklist completo (sempre)

**Cache v5.2 (PARCIALMENTE INTEGRADO):**
```typescript
// Linha 103: Usa getCached() e setCache() — MAS skill-cache.service.ts é importado aqui?
// Verificando: Não, o cache está implementado inline no SkillLoaderService
// O skill-cache.service.ts existe como módulo órfão
const cached = getCached(cacheKey);
if (cached) return JSON.parse(cached);
// ...
setCache(cacheKey, JSON.stringify(result));
```

#### `ContentResolverService`

**Propósito:** Resolução unificada de conteúdo.

**Estratégia de Resolução:**
1. Projeto local (`.maestro/content/`) — prioridade
2. Servidor (`content/`) — fallback

**Cache em memória:** 5 minutos TTL

#### `FlowEngine`

**Propósito:** Calcula próximo passo e progresso do fluxo.

**Funções principais:**
- `getNextStep(estado, diretorio)` → retorna próxima ação recomendada
- `getFlowProgress(estado)` → retorna porcentagem de progresso
- `flowStepToNextAction(step)` → converte para formato `NextAction`

#### `StateService`

**Propósito:** Persistência de estado do projeto.

**Formato:**
```typescript
interface EstadoProjeto {
    nome: string;
    nivel: "simples" | "medio" | "complexo";
    fase_atual: number;
    total_fases: number;
    gates_validados: string[];
    entregaveis: Record<string, string>;
    discovery_respostas?: Record<string, any>;
    usar_stitch?: boolean;
    config?: { mode: "economy" | "balanced" | "quality" };
}
```

### 3.6 Módulos Órfãos (Não Integrados)

| Módulo | Status | Impacto |
|--------|--------|---------|
| `shared-resource-handler.ts` | ✅ **INTEGRADO** v5.2 | Usado por stdio.ts e index.ts |
| `skill-cache.service.ts` | ⚠️ **PARCIAL** | Cache implementado inline em SkillLoaderService, serviço não importado |
| `system-prompt.service.ts` | ❌ **ÓRFÃO** | Prompt continua estático |
| `elicitation-fallback.service.ts` | ❌ **ÓRFÃO** | Discovery via texto livre |
| `sampling-fallback.service.ts` | ❌ **ÓRFÃO** | Análise sem checklists de fallback |
| `annotations-fallback.service.ts` | ❌ **ÓRFÃO** | Sem separação IA/usuário |
| `structured-content.service.ts` | ❌ **ÓRFÃO** | Sem structured content |
| `response-formatter.ts` | ✅ **INTEGRADO** | Usado por 5 tools |
| `client-capabilities.service.ts` | ⚠️ **PARCIAL** | Funciona em HTTP, não em STDIO |

---

## 4. Fluxo de Dados — Exemplo Completo

### Cenário: Usuário chama `maestro(diretorio: "/projeto")`

```
1. Usuário → IDE Windsurf
   "maestro(diretorio: '/projeto')"

2. IDE → MCP Server (stdio.ts)
   CallToolRequest { name: "maestro", arguments: { diretorio: "/projeto" } }

3. stdio.ts → router.ts
   routeToolCall("maestro", { diretorio: "/projeto" })

4. router.ts → Middleware Pipeline
   applySmartMiddlewares("maestro", maestroTool)

5. Middleware (ordem de execução):
   
   a. withErrorHandling (envolve tudo, captura erros)
      ↓
   b. withStateLoad (carrega estado do filesystem se não fornecido)
      ↓
   c. withSkillInjection (após execução, injeta skill se necessário)
      ↓
   d. maestroTool (executa)
      
      - Verifica se projeto existe
      - Carrega estado
      - Detecta fase atual
      - Consulta FlowEngine para próximo passo
      - Carrega skill da fase (SkillLoaderService, modo "economy")
      - Formata resposta (formatResponse)
      - Retorna ToolResult

6. Retorno ao usuário:
   {
     content: [
       {
         type: "text",
         text: "# 📍 Maestro — MeuProjeto\n\nFase 3/8 — Arquitetura\n\n..."
       }
     ],
     // Campos custom (ignorados pelo client MCP):
     next_action: { tool: "avancar", ... },
     estado_atualizado: "{...}",
     specialist_persona: { name: "Arquiteto", ... }
   }
```

---

## 5. Problemas Críticos Identificados

### 5.1 Arquiteturais

| Problema | Severidade | Descrição |
|----------|------------|-----------|
| **Capability Detection Falha em STDIO** | 🔴 Alta | `captureClientCapabilities` importado mas nunca chamado em stdio.ts. IDEs sempre reportam capabilities como `false`. |
| **ToolResult Permissivo** | 🔴 Alta | `[x: string]: unknown` permite campos arbitrários. Metadados (`next_action`, `progress`, etc.) são ignorados pelo client MCP. |
| **Persistência Passiva** | 🔴 Alta | Servidor retorna `files[]` e `estado_atualizado` esperando que a IA salve. Se a IA não salvar, estado se perde. |
| **Fluxos Implícitos** | 🟡 Média | Fases são conceituais. IA precisa "saber" a sequência. Sem state machine formal. |
| **Duplicação de Lógica** | 🟡 Média | `maestro` e `avancar` precisam salvar estado manualmente porque `applySmartMiddlewares` não inclui persistence. |

### 5.2 Implementação

| Problema | Severidade | Descrição |
|----------|------------|-----------|
| **7 Módulos Órfãos** | 🔴 Alta | Código criado mas não integrado (cache, fallbacks, annotations, structured content). |
| **3 Tools Não Migradas** | 🟡 Média | `status.ts`, `contexto.ts`, `salvar.ts` retornam formato legado (JSON bruto). |
| **Código Morto** | 🟢 Baixa | `tools/index.ts` (411 linhas) ainda importado por `server.ts`. |
| **Zero Testes** | 🔴 Alta | Nenhum teste unitário para os 12 módulos novos. |

### 5.3 Protocolo MCP

| Problema | Severidade | Descrição |
|----------|------------|-----------|
| **Resources Passivos** | 🟡 Média | Windsurf não injeta resources automaticamente. IA precisa decidir chamar `read_resource`. |
| **Sem Annotations** | 🟡 Média | Retornos não separam conteúdo para usuário vs instruções para IA. |
| **Sem Structured Content** | 🟡 Média | `outputSchema` e `structuredContent` não usados. |
| **Protocol Version** | 🟢 Baixa | HTTP usa `2025-03-26` (OK), mas STDIO não declara version. |

---

## 6. Oportunidades de Evolução para v6

### 6.1 Paradigma: De Toolkit para Orquestrador Autônomo

```
v5.x: Reativo
  Usuário → IDE → IA decide → chama tool → Maestro retorna texto → 
  IA interpreta → decide próximo → repete

v6.0: Autônomo
  Usuário → IDE → Maestro detecta contexto → State Machine decide → 
  Orquestra agents → Persiste estado → Retorna contrato tipado + 
  next_action determinística
```

### 6.2 Mudanças Estruturais Prioritárias

#### 1. **Persistência Ativa** (P0)

**Problema:** Estado depende da IA salvar.

**Solução:** Servidor grava diretamente no filesystem.

```typescript
// NOVO: ActivePersistenceService
class ActivePersistenceService {
    async saveState(state: ProjectState): Promise<void> {
        await writeFile(
            join(this.projectDir, ".maestro/state.json"),
            JSON.stringify(state, null, 2)
        );
    }
    
    async saveArtifact(path: string, content: string): Promise<void> {
        await writeFile(join(this.projectDir, path), content);
    }
}
```

**Impacto:** Elimina classe inteira de bugs "estado perdido".

#### 2. **State Machine Formal** (P0)

**Problema:** Fluxos implícitos, IA decide sequência.

**Solução:** XState para transições determinísticas.

```typescript
const projectMachine = createMachine({
    id: "project",
    initial: "discovery",
    states: {
        discovery: { on: { COMPLETE: "brainstorm" } },
        brainstorm: { on: { COMPLETE: "prd", SKIP: "prd" } },
        prd: { on: { VALIDATED: "architecture" } },
        architecture: { on: { COMPLETE: "implementation" } },
        // ... fases
    }
});
```

**Impacto:** Rollback determinístico, compliance auditável.

#### 3. **Multi-Agent Architecture** (P1)

**Problema:** Especialistas são "personas textuais", não separação real.

**Solução:** Squad de agents com contexto isolado.

```typescript
abstract class MaestroAgent {
    protected context: AgentContext; // Isolado
    protected skill: SkillDefinition;
    abstract execute(input: AgentInput): Promise<AgentOutput>;
}

class DiscoveryAgent extends MaestroAgent { ... }
class ArchitectureAgent extends MaestroAgent { ... }
class SecurityAgent extends MaestroAgent { ... }
```

**Impacto:** Especialistas verdadeiramente isolados, memória separada.

#### 4. **Protocol Compliance 2025-11-25** (P1)

**Features a implementar:**
- **Tasks** — Operações assíncronas com polling
- **Elicitation** — Formulários tipados para discovery
- **Sampling with Tools** — Análise LLM dedicada
- **Annotations** — Separar conteúdo user/assistant
- **Structured Content** — JSON tipado além de texto
- **MCP Apps** — Dashboards HTML interativos

#### 5. **ToolResult Strict** (P0)

**Mudança:**
```typescript
// ANTES (v5.x)
export interface ToolResult {
    [x: string]: unknown;  // ← Permite QUALQUER campo
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
    files?: Array<...>;              // Ignorado pelo client
    estado_atualizado?: string;      // Ignorado pelo client
    next_action?: NextAction;        // Ignorado pelo client
}

// DEPOIS (v6.0)
export interface ToolResult {
    content: Array<ContentBlock>;    // Com annotations
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
}

type ContentBlock =
    | { type: "text"; text: string; annotations?: Annotations }
    | { type: "resource_link"; uri: string; name: string; ... }
    | { type: "image"; ... };
```

#### 6. **Consolidação 8→5 Tools** (P1)

| v5 | v6 | Racional |
|----|-----|----------|
| `maestro` | `maestro` | Entry point (mantém) |
| `avancar` | `executar` | Unifica avançar + salvar + checkpoint |
| `salvar` | → `executar` | Via parâmetro `acao: "salvar"` |
| `checkpoint` | → `executar` | Via parâmetro `acao: "checkpoint"` |
| `status` | → `maestro` | Sem ação = retorna status |
| `validar` | `validar` | Mantém (diferentes tipos) |
| `contexto` | `contexto` | Mantém (knowledge base) |
| `analisar` | `analisar` | Mantém (diferentes tipos) |

### 6.3 Roadmap de Evolução Resumido

```
v5.2 (4 semanas)
├── Integrar 7 módulos órfãos
├── Corrigir capability detection STDIO
├── Migrar 3 tools para formatResponse
├── Limpar ToolResult
└── Testes >80%

v6.0-alpha (8 semanas)
├── Breaking: Remover 37 tools legadas
├── Breaking: ToolResult strict
├── Multi-Agent base
├── State Machine (XState)
└── Active Persistence

v6.0-beta (8 semanas)
├── MCP 2025-11-25 compliance
├── Tasks, Elicitation, Sampling
├── Annotations, Structured Content
└── MCP Apps (dashboards)

v6.0-stable (4 semanas)
├── Enterprise features
├── Compliance automation
├── Multi-project support
└── Documentation & Polish
```

---

## 7. Métricas de Sucesso Propostas

### Quantitativas

| Métrica | v5.1 (atual) | v6.0 (alvo) |
|---------|--------------|-------------|
| Tools públicas | 8 | **5** (-37%) |
| Tools totais aceitas | 45 | **5** (-89%) |
| Módulos órfãos | 7 | **0** (-100%) |
| Interações até 1º código | 5-10 | **2** (-70%) |
| Cobertura de testes | ~0% | **90%+** |
| Capabilities detectadas (STDIO) | 0% | **100%** |

### Qualitativas

| Aspecto | v5.1 | v6.0 |
|---------|------|------|
| Persistência | Passiva (depende IA) | **Ativa (servidor grava)** |
| Fluxos | Implícitos (IA decide) | **Determinísticos (state machine)** |
| Especialistas | Personas textuais | **Agents isolados** |
| Análise | Inline (polui contexto) | **Sampling dedicada** |
| Discovery | Texto livre | **Elicitation tipado** |
| Rollback | Manual/git | **Determinístico (checkpoints)** |

---

## 8. Conclusão

### O Maestro Hoje

O Maestro v5.1 é um **sistema maduro com arquitetura sólida** mas **integração incompleta**. A fundação está lá:
- Router centralizado funciona bem
- Middleware pipeline é elegante
- Skills como resources é inteligente
- 8 tools consolidadas reduzem superfície cognitiva

Mas **7 dos 12 módulos criados na v5.1 nunca foram integrados**, e **capability detection falha no modo principal (STDIO)**.

### O Maestro na v6

A v6 transforma o Maestro de **orquestrador passivo** para **agente autônomo**:
- **State machine formal** garante fluxos determinísticos
- **Persistência ativa** elimina dependência da IA
- **Multi-agent** permite especialização real
- **Protocol compliance** habilita features avançadas (Tasks, Elicitation, Sampling)

### Recomendação Imediata

**Prioridade 0:** Iniciar **v5.2** — integrar módulos órfãos, corrigir STDIO capability detection, criar testes. Isso estabiliza a base antes dos breaking changes da v6.

---

*Análise baseada no código-fonte em `src/src/` e documentação em `docs/roadmap/`*
