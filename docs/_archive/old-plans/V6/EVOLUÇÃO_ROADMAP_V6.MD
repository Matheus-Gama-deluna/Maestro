# Roadmap v6.0 — Evolução Estratégica do Maestro MCP

> **Data:** 2026-02-07  
> **Versão alvo:** 6.0.0  
> **Referências:** Auditoria v5.1, Roadmap v5.2, Diagnóstico MCP, spec MCP 2025-11-25  
> **Pré-requisito:** Conclusão da v5.2

---

## 1. Resumo Executivo

### Linha do Tempo

```
v1.0 ─── 44 tools, sem organização
v3.0 ─── Router centralizado
v4.0 ─── 8 tools públicas, middleware pipeline
v5.0 ─── Onboarding v2, flow engine, prompts MCP
v5.1 ─── Infraestrutura de adaptação (12 módulos, 7 órfãos)
v5.2 ─── [EM ANDAMENTO] Wiring, cleanup, testes
v6.0 ─── [ESTE DOCUMENTO] Salto arquitetural completo
```

A v6 transforma o Maestro de "toolkit com router" em **plataforma de orquestração** compliant com MCP 2025-11-25.

### Pilares

| Pilar | Descrição |
|-------|-----------|
| **Protocol-first** | Compliance total com MCP 2025-11-25 (Tasks, Elicitation, Sampling with Tools) |
| **Breaking clean** | Remoção de 37 tools legadas, ToolResult strict, zero backward compat v4 |
| **Platform mindset** | MCP Apps, Registry, extensões oficiais |
| **Intelligence** | Adaptação por client, sampling delegada, análise com LLM separada |
| **DX excellence** | 5 tools, onboarding em 2 interações, zero-config |

---

## 2. Gap Analysis: Maestro v5.x vs MCP 2025-11-25

| Feature MCP | Spec 2025-11-25 | Maestro v5.x | Gap |
|-------------|-----------------|--------------|-----|
| **Tasks** (async) | ✅ Experimental | ❌ | 🔴 Crítico |
| **Elicitation URL mode** | ✅ Estável | ❌ Fallback MD | 🟡 Médio |
| **Sampling with Tools** | ✅ tools+toolChoice | ❌ | 🔴 Crítico |
| **Icons** tools/resources | ✅ SEP-973 | ❌ | 🟢 Baixo |
| **outputSchema** | ✅ Estável | ⚠️ Órfão | 🟡 Médio |
| **structuredContent** | ✅ Estável | ⚠️ Órfão | 🟡 Médio |
| **Annotations** | ✅ Estável | ⚠️ Órfão | 🟡 Médio |
| **resource_link** | ✅ Estável | ❌ | 🟡 Médio |
| **MCP Apps** (HTML) | ✅ Extension | ❌ | 🟡 Médio |
| **MCP Registry** | ✅ Preview→GA | ❌ | 🟡 Médio |
| **Streamable HTTP** | ✅ Estável | ⚠️ Express manual | 🟡 Médio |
| **Tool name format** | ✅ SEP-986 | ⚠️ Nomes pt-BR | 🟡 Médio |
| **Input valid→Tool Error** | ✅ SEP-1303 | ❌ Protocol error | 🟡 Médio |
| **Protocol version** | 2025-11-25 | 2025-03-26 | 🟡 2 versões atrás |

### Problemas Estruturais Herdados

| Problema | Severidade |
|----------|-----------|
| 37 tools legadas no allToolsMap | 🔴 Alta |
| ToolResult com `[x: string]: unknown` | 🔴 Alta |
| Duplicação stdio.ts ↔ index.ts | 🔴 Alta |
| 7 módulos órfãos | 🟡 Média |
| Zero testes unitários | 🔴 Alta |
| Capability detection falha em STDIO | 🔴 Alta |
| tools/index.ts (411 linhas) morto | 🟡 Média |
| 19 diretórios, muitos com código legado | 🟡 Média |

### Roadmap Oficial MCP (próximo release)

1. **Asynchronous Operations** — Tasks como primitiva de primeira classe
2. **Statelessness and Scalability** — Servidores horizontalmente escaláveis
3. **Server Identity** — `.well-known` URLs para discovery
4. **Official Extensions** — Padrões para domínios específicos
5. **SDK Standardization** — Tiering de SDKs
6. **MCP Registry GA** — Catálogo público de servidores

---

## 3. Visão v6: De Orquestrador para Plataforma

### Mudança de Paradigma

```
v5.x: IA decide → chama tool → Maestro retorna texto → IA interpreta → IA decide

v6.0: Usuário fala → IA chama maestro → Maestro retorna contrato tipado
      + next_action + task async + UI interativa → IA executa contrato
```

### Princípios Arquiteturais

1. **Protocol-first** — Usar primitivas MCP nativas antes de soluções custom
2. **Zero legacy** — Nenhuma tool legada aceita
3. **Typed contracts** — outputSchema + structuredContent em todas as tools
4. **Adaptive by default** — Comportamento muda por client automaticamente
5. **Async-ready** — Operações longas usam Tasks com polling
6. **Content-rich** — Annotations, resource_links, icons em todos os retornos
7. **Testable** — 90%+ cobertura; testes de conformidade MCP

### Arquitetura-Alvo v6

```
┌─────────────────────────────────────────────────────────┐
│                  Maestro MCP v6.0                        │
├─────────────────────────────────────────────────────────┤
│  Unified Transport Layer                                 │
│  ┌──────────┐  ┌──────────────────┐                     │
│  │  STDIO   │  │  Streamable HTTP │                     │
│  │  (IDEs)  │  │  (Web/Remote)    │                     │
│  └────┬─────┘  └────────┬─────────┘                     │
│       └────────┬────────┘                                │
│                ↓                                         │
│  Capability-Aware Handler Layer                          │
│  (detecta client, adapta output)                         │
│                ↓                                         │
│  Tool Router (5 tools)                                   │
│  ┌────────┐┌────────┐┌───────┐┌────────┐┌──────┐       │
│  │maestro ││executar││validar││analisar││ctx   │       │
│  │(entry) ││(ações) ││(gates)││(código)││(kb)  │       │
│  └────────┘└────────┘└───────┘└────────┘└──────┘       │
│                ↓                                         │
│  Middleware Pipeline v2                                  │
│  error → caps → state → flow → persist → skill          │
│                ↓                                         │
│  Response Builder v2                                     │
│  Markdown + structuredContent + Annotations              │
│  + resource_links + outputSchema + Icons                 │
│                ↓                                         │
│  Services Layer                                          │
│  ┌──────────┐┌──────────┐┌──────────┐                   │
│  │State     ││Flow      ││Skill     │                   │
│  │Machine   ││Engine    ││Loader    │                   │
│  └──────────┘└──────────┘└──────────┘                   │
│  ┌──────────┐┌──────────┐┌──────────┐                   │
│  │Task      ││Elicita-  ││Sampling  │                   │
│  │Manager   ││tion Svc  ││Delegator │                   │
│  └──────────┘└──────────┘└──────────┘                   │
│  ┌──────────┐┌──────────┐┌──────────┐                   │
│  │Client    ││System    ││Analytics │                   │
│  │Caps      ││Prompt    ││Telemetry │                   │
│  └──────────┘└──────────┘└──────────┘                   │
│                ↓                                         │
│  Persistence  │ Content Library │ MCP Apps (HTML)        │
│  .maestro/    │ 374 skills      │ Dashboard, Forms       │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Eixo 1 — Breaking Changes e Limpeza Estrutural

> **Objetivo:** Eliminar toda a dívida técnica acumulada desde v1.0  
> **Impacto:** 🔴 Breaking — Incompatível com v5.x

### 4.1. Remoção de Tools Legadas

**Estado atual:** 8 públicas + 37 legadas = 45 tools aceitas pelo router.

**Ação v6:** Remover completamente `legacyTools` do `router.ts`. Chamadas a tools removidas retornam erro claro com migration guide.

**37 tools removidas:**
```
setup_inicial, iniciar_projeto, confirmar_projeto, confirmar_stitch,
carregar_projeto, proximo, validar_gate, aprovar_gate, classificar,
confirmar_classificacao, implementar_historia, nova_feature, corrigir_bug,
refatorar, analisar_seguranca, analisar_qualidade, analisar_performance,
gerar_relatorio, atualizar_codebase, avaliar_entregavel, injetar_conteudo,
discovery, onboarding_orchestrator, brainstorm, prd_writer,
next_steps_dashboard, record_adr, record_pattern, get_context,
search_knowledge, create_checkpoint, rollback_total, rollback_partial,
list_checkpoints, validate_dependencies, validate_security, check_compliance,
evaluate_risk, auto_fix, discover_codebase
```

**Impacto:** ~300 linhas removidas do router.ts, ~20 arquivos de tools removíveis.

### 4.2. ToolResult Strict

**Estado atual (permissivo):**
```typescript
export interface ToolResult {
    [x: string]: unknown;  // ← Permite QUALQUER campo
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
    files?: Array<{ path: string; content: string }>;
    estado_atualizado?: string;
    next_action?: NextAction;
    specialist_persona?: SpecialistPersona;
    progress?: FlowProgress;
}
```

**v6 (strict, MCP-compliant):**
```typescript
export interface ToolResult {
    content: Array<ContentBlock>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
}

type ContentBlock =
    | { type: "text"; text: string; annotations?: Annotations }
    | { type: "image"; data: string; mimeType: string; annotations?: Annotations }
    | { type: "resource_link"; uri: string; name: string; 
        description?: string; mimeType?: string; annotations?: Annotations }
    | { type: "resource"; resource: EmbeddedResource };

interface Annotations {
    audience?: ("user" | "assistant")[];
    priority?: number;  // 0.0 a 1.0
    lastModified?: string;
}
```

**Onde vão os metadados removidos:**
- `next_action` → seção Markdown no content + campo em structuredContent
- `specialist_persona` → bloco com `annotations: { audience: ["assistant"] }`
- `progress` → content + structuredContent
- `files` → servidor grava diretamente (persistência ativa)
- `estado_atualizado` → servidor grava diretamente

### 4.3. Consolidação de Tools: 8 → 5

| Tool v6 | Descrição | Subsume de v5 |
|---------|-----------|---------------|
| `maestro` | Entry point. Sem ação = status. Detecta contexto. | `maestro` + `status` |
| `executar` | Ações: avancar, salvar, checkpoint, rollback. | `avancar` + `salvar` + `checkpoint` |
| `validar` | Gate, entregável, compliance. | (mantém) |
| `analisar` | Segurança, qualidade, performance. Tasks para análises longas. | (mantém) |
| `contexto` | Knowledge base: ADRs, padrões, busca. | (mantém) |

**Internacionalização (SEP-986):**

| Atual (pt-BR) | Alias (en) | Decisão |
|----------------|------------|---------|
| `maestro` | `maestro` | Nome próprio, universal |
| `executar` | `execute` | Aceitar alias |
| `validar` | `validate` | Aceitar alias |
| `analisar` | `analyze` | Aceitar alias |
| `contexto` | `context` | Aceitar alias |

> **Recomendação:** Manter pt-BR como identidade, aceitar aliases em inglês via router.

### 4.4. Remoção de Código Morto

| Arquivo/Diretório | Ação |
|-------------------|------|
| `src/src/tools/index.ts` (411 linhas) | Remover — substituído por router.ts |
| `src/src/frontend-first/` | Avaliar — mover para plugin ou remover |
| `src/src/optimization/` | Avaliar — mover para plugin ou remover |
| `src/src/tasks/` | Renomear — conflita com MCP Tasks |
| Imports não utilizados | Limpar em todos os arquivos |

### 4.5. Reestruturação de Diretórios

**Proposta v6:**
```
src/
├── transports/     # stdio.ts, streamable-http.ts
├── router/         # router.ts, tool-definitions.ts
├── tools/          # 5 tools (maestro, executar, validar, analisar, contexto)
├── middleware/      # pipeline v2
├── services/       # state, flow, skill, cache, caps, task, elicitation, sampling
├── handlers/       # shared (resources, prompts, tools)
├── content/        # skill loader, content resolver, resource builder
├── types/          # interfaces MCP-compliant
├── utils/          # response-formatter, config, files
├── apps/           # MCP Apps (HTML dashboards)
└── tests/          # unitários e integração
```

---

## 5. Eixo 2 — Protocol Compliance (2025-11-25)

> **Objetivo:** Alinhar 100% com a spec MCP mais recente

### 5.1. Atualizar Protocol Version

- Atualizar `SUPPORTED_PROTOCOL_VERSION` para `"2025-11-25"`
- Atualizar SDK `@modelcontextprotocol/sdk` para versão compatível
- Testar handshake com Windsurf, Cursor, VS Code, Claude Code

**Mudanças no protocol 2025-11-25 vs 2025-03-26:**
- Tasks (experimental) — SEP-1686
- Elicitation URL mode + defaults — SEP-1036, SEP-1034
- Sampling with Tools — SEP-1577
- Icons em tools/resources/prompts — SEP-973
- Tool name format — SEP-986
- Input validation → Tool Error — SEP-1303
- JSON Schema 2020-12 — SEP-1613
- SSE polling via server disconnect — SEP-1699

### 5.2. MCP Tasks — Operações Assíncronas

**Problema:** Análises de código e validações complexas bloqueiam a resposta.

**Solução:**
```typescript
async function analisar(args: AnalisarArgs): Promise<ToolResult> {
    if (estimateComplexity(args) > THRESHOLD) {
        const taskId = generateTaskId();
        taskManager.startTask(taskId, async () => {
            return await runFullAnalysis(args);
        });
        return {
            content: [{
                type: "text",
                text: "Análise iniciada. Acompanhe via task.",
                annotations: { audience: ["user"], priority: 1.0 }
            }],
        };
    }
    return runQuickAnalysis(args);  // Síncronas continuam normais
}
```

**Tasks a implementar:**
- `analisar(tipo: "completo")` — análise full
- `validar(tipo: "compliance")` — validação completa
- Qualquer operação > 10 segundos

### 5.3. Elicitation Nativa — Discovery Interativo

**Problema:** Discovery coleta dados via texto livre. IA interpreta mal.

**Solução (form mode):**
```typescript
async function coletarDadosDiscovery(): Promise<ElicitationRequest> {
    return {
        method: "elicitation/create",
        params: {
            message: "Configuração do projeto",
            requestedSchema: {
                type: "object",
                properties: {
                    nome: { type: "string", title: "Nome do projeto", default: "" },
                    problema: { type: "string", title: "Problema que resolve" },
                    complexidade: { 
                        type: "string", 
                        enum: ["simples", "medio", "complexo"],
                        default: "medio"
                    },
                    tipo: { 
                        type: "string", 
                        enum: ["poc", "script", "internal", "product"],
                        default: "internal"
                    },
                },
                required: ["nome", "problema"]
            }
        }
    };
}
```

**Fallback (clients sem Elicitation):** Markdown estruturado com opções claras + perguntas em blocos (máx 2 interações).

### 5.4. Sampling with Tools — Análise com LLM Dedicada

**Problema:** Análise de código consome tokens do contexto principal, qualidade inconsistente.

**Solução:**
```typescript
async function analisarComSampling(codigo: string, tipo: string) {
    return {
        method: "sampling/createMessage",
        params: {
            messages: [{
                role: "user",
                content: { type: "text", text: `Analise: ${tipo}` }
            }, {
                role: "user",
                content: { type: "text", text: `\`\`\`\n${codigo}\n\`\`\`` }
            }],
            tools: [{
                name: "report_analysis",
                inputSchema: {
                    type: "object",
                    properties: {
                        score: { type: "number", minimum: 0, maximum: 100 },
                        issues: { type: "array", items: { type: "object" } }
                    },
                    required: ["score", "issues"]
                }
            }],
            toolChoice: { type: "tool", name: "report_analysis" },
            maxTokens: 2000,
            modelPreferences: {
                hints: [{ name: "claude-sonnet" }],
                intelligencePriority: 0.9
            }
        }
    };
}
```

**Benefício:** Análise em contexto limpo. LLM usa tools durante sampling para retornar dados estruturados.

### 5.5. Annotations em Todos os Retornos

| Tipo de conteúdo | Annotations |
|-------------------|------------|
| Resumo para usuário | `{ audience: ["user"], priority: 1.0 }` |
| Instruções para IA | `{ audience: ["assistant"], priority: 0.9 }` |
| Templates/checklists | `{ audience: ["assistant"], priority: 0.7 }` |
| Metadados de progresso | `{ audience: ["user", "assistant"], priority: 0.5 }` |

### 5.6. Streamable HTTP (substituir Express manual)

Migrar `index.ts` para transport oficial do SDK:

```typescript
import { StreamableHTTPServerTransport } from 
    "@modelcontextprotocol/sdk/server/streamableHttp.js";

const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
});
await server.connect(transport);
```

**Benefícios:** Resumability, session management, polling SSE, elimina ~200 linhas manuais.

### 5.7. Input Validation como Tool Error (SEP-1303)

```typescript
// ANTES (protocol error — LLM não se corrige)
throw new Error("Parâmetro 'diretorio' obrigatório");

// DEPOIS (tool error — LLM pode tentar novamente)
return {
    content: [{ type: "text", text: "Erro: 'diretorio' obrigatório" }],
    isError: true,
};
```

---

## 6. Eixo 3 — Arquitetura de Nova Geração

### 6.1. State Machine Formal

**Problema:** Flow engine usa transições como objetos JS simples. Sem visualização, sem validação formal, estado pode ficar inconsistente.

**Proposta:** State machine formal (XState ou implementação leve):

```typescript
const onboardingMachine = createMachine({
    id: "onboarding",
    initial: "init",
    context: { projectName: "", mode: "balanced" },
    states: {
        init: {
            on: {
                HAS_CONFIG: "discovery_block_1",
                NO_CONFIG: "setup",
            }
        },
        setup: { on: { SETUP_COMPLETE: "discovery_block_1" } },
        discovery_block_1: {
            on: { 
                BLOCK_ANSWERED: "discovery_block_2",
                WANTS_BRAINSTORM: "brainstorm",
            }
        },
        discovery_block_2: { on: { BLOCK_ANSWERED: "prd_generation" } },
        brainstorm: { on: { COMPLETE: "prd_generation", SKIP: "prd_generation" } },
        prd_generation: { on: { PRD_READY: "prd_validation" } },
        prd_validation: {
            on: { SCORE_OK: "phase_1", SCORE_LOW: "prd_refinement" }
        },
        prd_refinement: { on: { REFINED: "prd_validation" } },
        phase_1: { /* fases de desenvolvimento */ },
        completed: { type: "final" }
    }
});
```

**Benefícios:**
- Transições validadas em compile-time
- Visualização automática (XState Visualizer)
- Impossível chegar em estado inválido
- Serialização nativa para persistência
- Eventos tipados (TypeScript)

### 6.2. Persistência Ativa

**Problema:** Maestro retorna `files[]` e `estado_atualizado` esperando que a IA salve. Se a IA não salvar, estado se perde.

**Ação v6:** Servidor grava diretamente no filesystem:

```typescript
class ActivePersistenceService {
    constructor(private projectDir: string) {}
    
    async saveState(state: ProjectState): Promise<void> {
        const dir = join(this.projectDir, ".maestro");
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, "estado.json"), JSON.stringify(state, null, 2));
    }
    
    async saveDeliverable(phase: number, content: string, filename: string): Promise<string> {
        const dir = join(this.projectDir, ".maestro", "deliverables", `phase-${phase}`);
        await mkdir(dir, { recursive: true });
        const path = join(dir, filename);
        await writeFile(path, content);
        return path;
    }
    
    async createCheckpoint(description: string): Promise<string> {
        const id = `cp-${Date.now()}`;
        const state = await this.loadState();
        const cpDir = join(this.projectDir, ".maestro", "checkpoints", id);
        await mkdir(cpDir, { recursive: true });
        await writeFile(join(cpDir, "estado.json"), JSON.stringify(state));
        await writeFile(join(cpDir, "meta.json"), JSON.stringify({ id, description }));
        return id;
    }
}
```

**Impacto:** Elimina a classe inteira de bugs "estado perdido porque a IA não salvou".

### 6.3. Plugin Architecture para Analyzers

**Problema:** Analyzers hardcoded. Adicionar novo tipo requer modificar core.

```typescript
interface AnalyzerPlugin {
    name: string;
    description: string;
    supportedLanguages: string[];
    analyze(code: string, options: AnalyzerOptions): Promise<AnalysisResult>;
    getChecklist(): ChecklistItem[];
}

class AnalyzerRegistry {
    private plugins = new Map<string, AnalyzerPlugin>();
    register(plugin: AnalyzerPlugin): void { this.plugins.set(plugin.name, plugin); }
    async analyze(type: string, code: string, opts: AnalyzerOptions): Promise<AnalysisResult> {
        const plugin = this.plugins.get(type);
        if (!plugin) throw new Error(`Analyzer '${type}' not found`);
        return plugin.analyze(code, opts);
    }
}
```

**Plugins built-in:** security, quality, performance, accessibility, i18n  
**Plugins futuros:** OWASP, LGPD compliance, WCAG, custom rules

### 6.4. Event System para Extensibilidade

```typescript
class MaestroEventBus {
    private listeners = new Map<string, Set<EventHandler>>();
    on(event: MaestroEvent, handler: EventHandler): void { /* ... */ }
    emit(event: MaestroEvent, data: unknown): void { /* ... */ }
}

type MaestroEvent = 
    | "project:created" | "phase:advanced" | "phase:completed"
    | "gate:passed" | "gate:failed" | "checkpoint:created"
    | "analysis:started" | "analysis:completed" | "deliverable:saved";
```

---

## 7. Eixo 4 — Experiência do Desenvolvedor (DX)

### 7.1. Onboarding em 2 Interações

**Fluxo atual:** 5-10+ interações para configurar projeto.

**Fluxo v6:**
```
Interação 1: Usuário descreve projeto em texto livre
  → Maestro extrai dados (NLP ou Elicitation form)
  → Retorna resumo para confirmação

Interação 2: Usuário confirma/ajusta
  → Maestro cria projeto com discovery preenchido
  → Retorna primeiro passo de desenvolvimento
```

**Implementação:**
- **Smart extraction:** Extrair problema, público, plataforma de texto livre
- **Template matching:** Descrição match com template → pré-preencher 80%
- **Confidence scoring:** Pedir confirmação apenas para baixa confiança

### 7.2. Project Templates

```typescript
const PROJECT_TEMPLATES = {
    "saas-b2b": {
        complexity: "complexo", type: "product",
        defaults: { platforms: ["web"], compliance: ["LGPD"] },
        phases: 12,
    },
    "api-rest": {
        complexity: "medio", type: "internal",
        defaults: { platforms: ["api"] },
        phases: 8,
    },
    "landing-page": {
        complexity: "simples", type: "poc",
        defaults: { platforms: ["web"] },
        phases: 5,
    },
    "mobile-app": { /* ... */ },
    "cli-tool": { /* ... */ },
    "chrome-extension": { /* ... */ },
};
```

### 7.3. MCP Apps — Dashboard Visual

MCP Apps permitem retornar HTML interativo que renderiza no chat da IDE.

**Aplicações no Maestro:**
1. **Dashboard de Progresso** — Gráfico de fases, progresso %, timeline
2. **Formulário de Discovery** — Formulário HTML interativo
3. **Relatório de Análise** — Gráficos de score, heatmap de issues
4. **Kanban de Entregáveis** — Board visual com status por fase

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    if (req.params.uri === "maestro://apps/dashboard") {
        const state = await loadState(projectDir);
        return {
            contents: [{
                uri: req.params.uri,
                mimeType: "text/html",
                text: generateDashboardHTML(state),
            }]
        };
    }
});
```

> **Nota:** MCP Apps tem suporte limitado em IDEs. Implementar como feature opt-in.

### 7.4. Zero-Config para Projetos Simples

```
Usuário: "crie um script Python para converter CSV para JSON"
  → Maestro detecta: tipo=script, complexidade=simples
  → Pula discovery, brainstorm, PRD
  → Vai direto para implementação
  → Retorna template + checklist mínimo
```

### 7.5. Multi-Project Support

```typescript
// ~/.maestro/workspace.json
interface MaestroWorkspace {
    projects: Array<{
        name: string;
        directory: string;
        lastAccessed: string;
        phase: number;
        totalPhases: number;
    }>;
    activeProject?: string;
}
```

Detecção automática do projeto pelo diretório atual (via Roots quando disponível).

---

## 8. Eixo 5 — Inteligência e Adaptação Avançada

### 8.1. Client Capability Detection v2

**Problema v5.x:** Detection funciona apenas em HTTP, não em STDIO.

**Solução multi-camada:**

```typescript
class ClientCapabilitiesV2 {
    // Camada 1: Params do initialize (HTTP)
    captureFromInitialize(params: InitializeParams): void { /* ... */ }
    
    // Camada 2: Server SDK events (STDIO com SDK recente)
    captureFromServerEvents(server: Server): void {
        const clientCaps = server.getClientCapabilities?.();
        if (clientCaps) this.caps = this.parseCapabilities(clientCaps);
    }
    
    // Camada 3: Environment detection (fallback)
    captureFromEnvironment(): void {
        this.caps.clientName = this.detectClientFromEnv(process.env);
        Object.assign(this.caps, this.getKnownCapabilities(this.caps.clientName));
    }
    
    // Camada 4: Static knowledge base (último recurso)
    private getKnownCapabilities(client: string): Partial<ClientCapabilities> {
        const KNOWN = {
            "windsurf": { hasElicitation: false, hasSampling: false, hasTasks: false },
            "cursor":   { hasElicitation: true,  hasSampling: false, hasTasks: false },
            "vscode":   { hasElicitation: true,  hasSampling: true,  hasTasks: true  },
            "claude-code": { hasElicitation: false, hasSampling: false, hasTasks: false },
        };
        return KNOWN[client] || {};
    }
}
```

### 8.2. Adaptive Response Builder

Respostas que se adaptam automaticamente ao client:

```typescript
class AdaptiveResponseBuilder {
    constructor(private caps: ClientCapabilities) {}
    
    build(opts: ResponseOptions): ToolResult {
        const content: ContentBlock[] = [];
        
        // Resumo para usuário
        content.push({
            type: "text",
            text: this.buildSummary(opts),
            ...(this.caps.hasAnnotations && {
                annotations: { audience: ["user"], priority: 1.0 }
            }),
        });
        
        // Instruções para IA
        if (opts.instructions) {
            content.push({
                type: "text",
                text: this.buildInstructions(opts),
                ...(this.caps.hasAnnotations && {
                    annotations: { audience: ["assistant"], priority: 0.9 }
                }),
            });
        }
        
        // Resource links ou texto inline
        if (opts.relatedResources) {
            for (const res of opts.relatedResources) {
                content.push({
                    type: "resource_link",
                    uri: res.uri, name: res.name,
                    description: res.description, mimeType: "text/markdown",
                });
            }
        }
        
        return {
            content,
            structuredContent: this.caps.hasStructuredContent 
                ? opts.structuredData : undefined,
        };
    }
}
```

### 8.3. Analytics e Telemetria (Opt-in)

```typescript
interface MaestroAnalytics {
    sessionDuration: number;
    toolCallCount: Record<string, number>;
    phasesCompleted: number;
    gatePassRate: number;
    averageDeliverableScore: number;
    rollbackCount: number;
    discoveryInteractionCount: number;
    templateUsageRate: number;
}
```

**Privacidade:** Opt-in explícito, dados anonimizados, armazenamento local em `~/.maestro/analytics/`.

---

## 9. Eixo 6 — Ecossistema e Distribuição

### 9.1. Publicação no MCP Registry

```json
{
    "name": "@maestro/mcp-server",
    "description": "AI-powered software development orchestrator",
    "version": "6.0.0",
    "tools": ["maestro", "executar", "validar", "analisar", "contexto"],
    "transports": ["stdio", "streamable-http"],
    "protocolVersion": "2025-11-25"
}
```

### 9.2. Docker Image Oficial

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
COPY content/ ./content/
EXPOSE 3000
CMD ["node", "dist/transports/streamable-http.js"]
```

### 9.3. NPX Quick Start

```bash
npx @maestro/mcp-server                          # zero-config
npx @maestro/mcp-server --dir ./meu-projeto       # diretório específico
npx @maestro/mcp-server --transport http --port 3000  # modo HTTP
```

### 9.4. GitHub Actions Integration

```yaml
name: Maestro Gate Validation
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: maestro/validate-action@v1
        with:
          project-dir: .
          gate-type: "entregavel"
```

---

## 10. Plano de Execução em Fases

### Visão Geral (~9-10 semanas)

```
FASE A — Foundation (2 sem)    Breaking changes, cleanup, reestruturação
FASE B — Protocol (2 sem)      MCP 2025-11-25, Tasks, Elicitation, Sampling
FASE C — Architecture (2 sem)  State machine, persistência ativa, plugins
FASE D — DX & Intel (2 sem)    Onboarding v3, templates, adaptive responses
FASE E — Ecosystem (1 sem)     Registry, Docker, NPX, documentação
```

### Fase A — Foundation (Semanas 1-2)

| # | Task | Esforço | Prio |
|---|------|---------|------|
| A.1 | Remover `legacyTools` do router.ts | 1 dia | P0 |
| A.2 | Criar tool `executar.ts` (unifica avancar+salvar+checkpoint) | 2 dias | P0 |
| A.3 | `maestro` subsume `status` (sem ação = status) | 1 dia | P0 |
| A.4 | Reescrever `ToolResult` interface (strict, MCP-compliant) | 1 dia | P0 |
| A.5 | Migrar todas as 5 tools para novo ToolResult | 3 dias | P0 |
| A.6 | Remover código morto (tools/index.ts, server.ts, etc.) | 1 dia | P1 |
| A.7 | Reestruturar diretórios (nova estrutura limpa) | 1 dia | P1 |
| A.8 | Criar `MIGRATION_GUIDE_v5_to_v6.md` | 0.5 dia | P1 |

### Fase B — Protocol Compliance (Semanas 3-4)

| # | Task | Esforço | Prio |
|---|------|---------|------|
| B.1 | Atualizar SDK e protocol version para 2025-11-25 | 1 dia | P0 |
| B.2 | Implementar Task Manager para operações async | 3 dias | P0 |
| B.3 | Integrar Elicitation nativa no discovery | 2 dias | P1 |
| B.4 | Implementar Sampling with Tools para análise | 2 dias | P1 |
| B.5 | Adicionar Annotations em todos os retornos | 1 dia | P1 |
| B.6 | Migrar index.ts para Streamable HTTP transport | 2 dias | P1 |
| B.7 | Adicionar Icons em tools/resources/prompts | 0.5 dia | P2 |
| B.8 | Input validation → Tool Execution Error | 0.5 dia | P2 |

### Fase C — Architecture (Semanas 5-6)

| # | Task | Esforço | Prio |
|---|------|---------|------|
| C.1 | Implementar State Machine formal (flow engine v2) | 3 dias | P0 |
| C.2 | Implementar Persistência Ativa (servidor grava direto) | 2 dias | P0 |
| C.3 | Client Capabilities Detection v2 (multi-camada) | 1 dia | P0 |
| C.4 | Adaptive Response Builder | 2 dias | P1 |
| C.5 | Plugin Architecture para Analyzers | 2 dias | P2 |
| C.6 | Event System para extensibilidade | 1 dia | P2 |

### Fase D — DX & Intelligence (Semanas 7-8)

| # | Task | Esforço | Prio |
|---|------|---------|------|
| D.1 | Onboarding v3 (2 interações, smart extraction) | 3 dias | P0 |
| D.2 | Project Templates (6 templates pré-configurados) | 2 dias | P1 |
| D.3 | Zero-config para projetos simples | 1 dia | P1 |
| D.4 | Modo "Conversa Livre" aprimorado | 2 dias | P2 |
| D.5 | MCP Apps — Dashboard de progresso (prototype) | 2 dias | P2 |
| D.6 | Multi-project support | 1 dia | P2 |

### Fase E — Ecosystem (Semana 9)

| # | Task | Esforço | Prio |
|---|------|---------|------|
| E.1 | Publicar no MCP Registry | 1 dia | P1 |
| E.2 | Docker image oficial | 0.5 dia | P1 |
| E.3 | NPX quick start | 0.5 dia | P1 |
| E.4 | Testes de conformidade MCP | 2 dias | P0 |
| E.5 | Documentação completa (API reference, guides) | 2 dias | P1 |

### Dependências entre Fases

```
A.4 (ToolResult strict) ──→ A.5 (migrar tools) ──→ B.5 (annotations)
A.1 (remover legacy) ──→ A.2 (criar executar)
B.1 (SDK update) ──→ B.2 (Tasks) ──→ B.4 (Sampling)
B.1 (SDK update) ──→ B.3 (Elicitation) ──→ D.1 (Onboarding v3)
B.1 (SDK update) ──→ B.6 (Streamable HTTP)
C.1 (State Machine) ──→ C.2 (Persistência) ──→ D.1 (Onboarding)
C.3 (Caps Detection) ──→ C.4 (Adaptive Builder) ──→ B.5 (Annotations)
```

---

## 11. Matriz de Risco e Mitigação

| # | Risco | Prob. | Impacto | Mitigação |
|---|-------|-------|---------|-----------|
| R1 | SDK não suporta Tasks em STDIO | Média | Alto | Polling manual; Tasks só via HTTP inicialmente |
| R2 | Windsurf não atualiza para 2025-11-25 | Alta | Médio | Fallbacks para todas as features novas |
| R3 | Breaking changes afastam usuários | Média | Alto | Migration guide; v5.2 mantida em paralelo |
| R4 | State machine formal adiciona complexidade | Baixa | Médio | Implementação leve; XState opcional |
| R5 | MCP Apps não suportado em Windsurf | Alta | Baixo | Feature opt-in; funciona sem apps |
| R6 | Sampling rejeitado pelo client | Média | Médio | Fallback para checklists inline |
| R7 | Elicitation URL mode bloqueado | Média | Baixo | Usar apenas form mode |
| R8 | Performance com 5 tools fazendo mais | Baixa | Médio | Profiling; cache; Tasks para ops pesadas |
| R9 | Reestruturação quebra imports | Média | Alto | Commit atômico; testar build imediatamente |
| R10 | MCP Registry muda API antes de GA | Média | Baixo | Publicação é aditiva; adaptar quando necessário |

### Estratégia de Rollback

- **Fase A:** Branch v5.2 como fallback
- **Fase B:** Features de protocol são aditivas (fallbacks garantem funcionamento)
- **Fase C:** State machine pode coexistir com flow engine atual
- **Fase D:** Features de DX são independentes
- **Fase E:** Publicação é reversível

---

## 12. Métricas de Sucesso

### Quantitativas

| Métrica | v5.2 (baseline) | v6.0 (alvo) | Melhoria |
|---------|-----------------|-------------|----------|
| Tools públicas | 8 | 5 | -37% superfície |
| Tools totais aceitas | 45 | 5 | -89% (zero legacy) |
| Protocol version | 2025-03-26 | 2025-11-25 | +2 versões |
| Content blocks/resposta | 1-2 | 3-5 | +150% granularidade |
| Interações até 1º código | 5-10 | 2 | -70% fricção |
| Cobertura de testes | ~0% | 90%+ | Novo baseline |
| Módulos órfãos | 7 | 0 | -100% |
| Código morto (linhas) | ~1500 | 0 | -100% |
| Features MCP suportadas | 6/16 | 14/16 | +133% compliance |
| Operações async (Tasks) | 0 | 3+ | Novo capability |

### Qualitativas

| Aspecto | v5.2 | v6.0 |
|---------|------|------|
| Adaptação por IDE | HTTP only | STDIO + HTTP (4+ IDEs) |
| Análise de código | Inline (polui contexto) | Sampling dedicada |
| Discovery | Texto livre (erros) | Elicitation nativa (tipado) |
| Persistência | Depende da IA salvar | Servidor grava direto |
| Distribuição | Manual (git clone) | NPX + Registry + Docker |
| Extensibilidade | Hardcoded | Plugin system + Events |
| Visualização | Texto apenas | MCP Apps (HTML interativo) |

---

## 13. Visão de Longo Prazo (v7+)

### v7.0 — Multi-Agent Orchestration

- **Agent-to-Agent:** Maestro delega sub-tarefas para outros MCP servers
- **Maestro como Hub:** Orquestra múltiplos agents (code, test, deploy)
- **Shared Context:** Contexto compartilhado via MCP Resources

### v8.0 — AI-Native Development Platform

- **Code Generation:** Maestro gera código diretamente
- **Continuous Validation:** Análise em tempo real
- **Learning System:** Aprende padrões do desenvolvedor
- **Team Collaboration:** Múltiplos devs, roles diferentes

### Tendências a Monitorar

| Tendência | Impacto | Timeline |
|-----------|---------|----------|
| MCP Roots universal | Elimina `diretorio` como parâmetro | 2026 H1 |
| MCP Tasks estável | Todas as operações async | 2026 H1 |
| MCP Apps em Windsurf | Dashboards visuais para todos | 2026 H2 |
| Multi-agent protocols | Maestro como orquestrador de agents | 2026-2027 |
| Elicitation universal | Discovery perfeito em todas as IDEs | 2026 H1 |
| Server Identity (.well-known) | Auto-discovery do Maestro | 2026 H2 |
| MCP Extensions oficiais | Maestro como extension de "dev orchestration" | 2027 |

---

## Apêndice A — Checklist de Validação v6.0

### Funcional
- [ ] 5 tools públicas funcionando (maestro, executar, validar, analisar, contexto)
- [ ] Zero tools legadas aceitas (retorna erro com migration guide)
- [ ] Protocol version 2025-11-25 no handshake
- [ ] Tasks funcionando para análises longas
- [ ] Elicitation form mode no discovery (quando suportado)
- [ ] Sampling with Tools para análise (quando suportado)
- [ ] Annotations em todos os retornos
- [ ] structuredContent em todas as tools
- [ ] outputSchema definido em todas as tools
- [ ] resource_links nos retornos que referenciam skills
- [ ] Icons em tools, resources e prompts
- [ ] Streamable HTTP transport funcional
- [ ] Persistência ativa (servidor grava direto)
- [ ] State machine formal para fluxos

### Qualidade
- [ ] `npm run build` compila sem erros nem warnings
- [ ] `npm test` passa 100% com cobertura ≥90%
- [ ] Zero módulos órfãos
- [ ] Zero código morto
- [ ] ToolResult strict (sem index signature)
- [ ] Testes de conformidade MCP passam

### Compatibilidade
- [ ] Funciona em Windsurf (STDIO) com fallbacks
- [ ] Funciona em Cursor (STDIO) com Elicitation
- [ ] Funciona em VS Code (STDIO) com features completas
- [ ] Funciona em Claude Code (STDIO) com fallbacks
- [ ] Funciona via Streamable HTTP (web clients)

### Documentação
- [ ] MIGRATION_GUIDE_v5_to_v6.md publicado
- [ ] API reference atualizado
- [ ] README.md atualizado com novas instruções
- [ ] CHANGELOG.md com todas as breaking changes
- [ ] server.json para MCP Registry

---

## Apêndice B — Glossário

| Termo | Definição |
|-------|-----------|
| **MCP Tasks** | Primitiva do protocol para operações assíncronas com polling (SEP-1686) |
| **Elicitation** | Mecanismo para servidor solicitar dados do usuário via formulário tipado |
| **Sampling** | Mecanismo para servidor solicitar chamada LLM ao client |
| **Annotations** | Metadados em content blocks indicando audiência e prioridade |
| **structuredContent** | Retorno JSON tipado em tool results (além do texto) |
| **outputSchema** | Schema JSON que define a estrutura esperada do retorno de uma tool |
| **resource_link** | Referência a um Resource MCP retornada em tool results |
| **MCP Apps** | Extension oficial para retornar HTML interativo no chat |
| **Streamable HTTP** | Transport MCP com suporte a SSE, sessions e resumability |
| **Icons** | Metadados visuais para tools, resources e prompts (SEP-973) |
| **Strangler Fig** | Padrão de migração gradual de arquitetura legada |

---

> **Próximo passo:** Após revisão deste documento, iniciar implementação da Fase A (Foundation) com a conclusão da v5.2 como pré-requisito.
