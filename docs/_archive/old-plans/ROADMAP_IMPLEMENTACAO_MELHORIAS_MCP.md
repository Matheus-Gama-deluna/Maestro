# Roadmap de Implementação — Melhorias MCP do Maestro

> **Versão:** 1.0.0  
> **Data:** 2026-02-07  
> **Referência:** [DIAGNOSTICO_MCP_E_PLANO_MELHORIAS.md](./DIAGNOSTICO_MCP_E_PLANO_MELHORIAS.md)  
> **Estimativa Total:** 6-8 semanas (4 sprints de ~2 semanas)  
> **Pré-requisito:** Codebase atual do Maestro MCP v5 (`src/src/`)

---

## Índice

1. [Visão Geral das Fases](#1-visao-geral)
2. [Fase 1 — Fundação (Sprint 1)](#2-fase-1)
3. [Fase 2 — Adaptação Inteligente (Sprint 2)](#3-fase-2)
4. [Fase 3 — Refinamento e Fallbacks (Sprint 3)](#4-fase-3)
5. [Fase 4 — Futuro-proofing (Sprint 4)](#5-fase-4)
6. [Dependências entre Tasks](#6-dependencias)
7. [Checklist de Validação por Fase](#7-checklist)
8. [Riscos e Mitigações](#8-riscos)
9. [Guia de Testes](#9-testes)
10. [Notas de Migração](#10-migracao)

---

## 1. Visão Geral das Fases

```
FASE 1 — Fundação          ████████████░░░░░░░░░░░░  Sprint 1 (2 semanas)
  Fixes críticos, Markdown nos retornos, unificação de entry points

FASE 2 — Adaptação         ░░░░░░░░░░░░████████████  Sprint 2 (2 semanas)
  Capability detection, consolidação de tools, skill injection universal

FASE 3 — Refinamento       ░░░░░░░░░░░░░░░░░░░░░░░░  Sprint 3 (2 semanas)
  Fallbacks (elicitation, sampling), annotations, prompt sessão

FASE 4 — Futuro-proofing   ░░░░░░░░░░░░░░░░░░░░░░░░  Sprint 4 (1-2 semanas)
  Structured content, deprecation path, cleanup, type safety
```

### Princípios de Implementação

1. **Backward compatible** — Nenhuma mudança quebra clients existentes
2. **Incremental** — Cada task gera valor independente
3. **Testável** — Cada task tem critério de aceitação verificável
4. **Fallback-first** — Toda feature nova tem fallback para clients antigos

---

## 2. Fase 1 — Fundação (Sprint 1)

> **Objetivo:** Corrigir problemas críticos, padronizar retornos, unificar entry points  
> **Duração:** 2 semanas  
> **Impacto esperado:** Redução imediata de erros de parsing e inconsistências

### Task 1.1 — Fixes de Versão e Protocol

**Arquivos:** `src/src/index.ts`, `src/src/stdio.ts`, `src/src/server.ts`  
**Esforço:** 0.5 dia  
**Prioridade:** P0 (Crítica)

**Ações:**

1. Criar constante de versão compartilhada:
```typescript
// Novo: src/src/constants.ts
export const MAESTRO_VERSION = "5.0.0";
export const MAESTRO_NAME = "mcp-maestro";
export const SUPPORTED_PROTOCOL_VERSION = "2025-03-26";
```

2. Atualizar `index.ts` handler de `initialize`:
```typescript
// Linha 296-300 de index.ts — ANTES:
result = {
    protocolVersion: "2024-11-05",
    serverInfo: { name: "mcp-maestro", version: "4.0.0" },
    capabilities: { resources: {}, tools: {}, prompts: {} },
};

// DEPOIS:
result = {
    protocolVersion: SUPPORTED_PROTOCOL_VERSION,
    serverInfo: { name: MAESTRO_NAME, version: MAESTRO_VERSION },
    capabilities: { resources: {}, tools: {}, prompts: {} },
};
```

3. Atualizar `server.ts` linhas 11-13:
```typescript
{
    name: MAESTRO_NAME,
    version: MAESTRO_VERSION,
}
```

4. Atualizar `stdio.ts` linhas 47-48:
```typescript
{
    name: MAESTRO_NAME,
    version: MAESTRO_VERSION,
}
```

5. Atualizar `index.ts` health e info endpoints (linhas 39, 50):
```typescript
version: MAESTRO_VERSION,
```

**Critério de aceitação:**
- [ ] Apenas 1 lugar define versão (constants.ts)
- [ ] Protocol version é `2025-03-26` em todos os handlers
- [ ] Server version é `5.0.0` em todos os endpoints

---

### Task 1.2 — Utilitário de Formatação de Resposta

**Arquivos:** Novo `src/src/utils/response-formatter.ts`  
**Esforço:** 1 dia  
**Prioridade:** P0 (Crítica)  
**Dependência:** Nenhuma

**Ações:**

1. Criar `src/src/utils/response-formatter.ts` com helpers:

```typescript
/**
 * Utilitários de formatação de resposta para tools MCP.
 * 
 * Princípio: LLMs processam Markdown melhor que JSON.
 * Todas as tools devem usar estes helpers para gerar retornos.
 */

interface ResponseBlock {
    type: "text";
    text: string;
}

interface ToolResponseOptions {
    /** Título principal (H1) */
    titulo: string;
    /** Resumo curto para o usuário (1-2 linhas) */
    resumo: string;
    /** Tabela de dados chave-valor */
    dados?: Record<string, string | number>;
    /** Instruções para a IA (seção separada) */
    instrucoes?: string;
    /** Template do entregável */
    template?: string;
    /** Próximo passo recomendado */
    proximo_passo?: {
        tool: string;
        descricao: string;
        args?: string;
        requer_input_usuario?: boolean;
        prompt_usuario?: string;
    };
    /** Barra de progresso */
    progresso?: { atual: number; total: number; percentual: number };
    /** Lista de itens (pendências, checklist, etc.) */
    lista?: { titulo: string; itens: string[] };
    /** Alertas/warnings */
    alertas?: string[];
}

/**
 * Gera resposta formatada em Markdown estruturado.
 * Retorna array de content blocks separados por propósito.
 */
export function formatResponse(opts: ToolResponseOptions): ResponseBlock[] {
    const blocks: ResponseBlock[] = [];
    
    // Bloco 1: Resumo para o usuário (sempre presente)
    let resumoBlock = `# ${opts.titulo}\n\n${opts.resumo}`;
    
    if (opts.dados) {
        resumoBlock += `\n\n| Campo | Valor |\n|-------|-------|\n`;
        for (const [k, v] of Object.entries(opts.dados)) {
            resumoBlock += `| **${k}** | ${v} |\n`;
        }
    }
    
    if (opts.progresso) {
        const filled = Math.floor(opts.progresso.percentual / 10);
        const empty = 10 - filled;
        resumoBlock += `\n**Progresso:** ${"█".repeat(filled)}${"░".repeat(empty)} ${opts.progresso.percentual}% (${opts.progresso.atual}/${opts.progresso.total})`;
    }
    
    if (opts.alertas && opts.alertas.length > 0) {
        resumoBlock += `\n\n${opts.alertas.map(a => `> ⚠️ ${a}`).join("\n")}`;
    }
    
    blocks.push({ type: "text", text: resumoBlock });
    
    // Bloco 2: Instruções para a IA (se houver)
    if (opts.instrucoes) {
        blocks.push({
            type: "text",
            text: `## 🤖 Instruções\n\n${opts.instrucoes}`,
        });
    }
    
    // Bloco 3: Template (se houver)
    if (opts.template) {
        blocks.push({
            type: "text",
            text: `## 📝 Template do Entregável\n\n${opts.template}`,
        });
    }
    
    // Bloco 4: Lista (se houver)
    if (opts.lista) {
        blocks.push({
            type: "text",
            text: `## ${opts.lista.titulo}\n\n${opts.lista.itens.map(i => `- ${i}`).join("\n")}`,
        });
    }
    
    // Bloco 5: Próximo passo (sempre no final, se houver)
    if (opts.proximo_passo) {
        let nextBlock = `## ▶️ Próximo Passo\n\n**${opts.proximo_passo.descricao}**\n`;
        nextBlock += `\n\`\`\`\n${opts.proximo_passo.tool}(${opts.proximo_passo.args || ""})\n\`\`\``;
        
        if (opts.proximo_passo.requer_input_usuario) {
            nextBlock += `\n\n> 👤 ${opts.proximo_passo.prompt_usuario || "Aguardando input do usuário."}`;
        } else {
            nextBlock += `\n\n> 🤖 Esta ação pode ser executada automaticamente.`;
        }
        
        blocks.push({ type: "text", text: nextBlock });
    }
    
    return blocks;
}

/**
 * Embute metadados de next_action no content (para clients que ignoram campos custom).
 */
export function embedNextAction(
    content: ResponseBlock[],
    nextAction?: { tool: string; description: string; requires_user_input?: boolean; user_prompt?: string }
): ResponseBlock[] {
    if (!nextAction) return content;
    
    const metaBlock = `\n---\n\n**Próxima ação:** \`${nextAction.tool}\` — ${nextAction.description}${
        nextAction.requires_user_input ? `\n> 👤 ${nextAction.user_prompt}` : ""
    }`;
    
    return [...content, { type: "text", text: metaBlock }];
}

/**
 * Formata erro de tool de forma consistente.
 */
export function formatError(toolName: string, message: string, suggestion?: string): ResponseBlock[] {
    let text = `# ❌ Erro em \`${toolName}\`\n\n${message}`;
    if (suggestion) {
        text += `\n\n**Sugestão:** ${suggestion}`;
    }
    return [{ type: "text", text }];
}
```

**Critério de aceitação:**
- [ ] Helper `formatResponse` gera Markdown válido com múltiplos blocos
- [ ] Helper `embedNextAction` adiciona metadados como texto
- [ ] Helper `formatError` padroniza erros
- [ ] Testes unitários para cada helper

---

### Task 1.3 — Migrar Tools Públicas para Markdown Estruturado

**Arquivos:** Todas as 8 tools públicas  
**Esforço:** 2-3 dias  
**Prioridade:** P0 (Crítica)  
**Dependência:** Task 1.2

**Ações — Migrar progressivamente cada tool:**

#### 1.3.1 — `maestro-tool.ts`
- Já retorna Markdown parcial (bom ponto de partida)
- Migrar para usar `formatResponse()` 
- Embutir `next_action` no content com `embedNextAction()`
- Remover campos custom do retorno que são ignorados

**Antes (linhas 114-153):**
```typescript
return {
    content: [{ type: "text", text: resposta }],
    estado_atualizado: args.estado_json,      // ← ignorado pelo client
    next_action: flowStepToNextAction(nextStep), // ← ignorado pelo client
    specialist_persona: specialist || undefined,  // ← ignorado pelo client
    progress,                                     // ← ignorado pelo client
};
```

**Depois:**
```typescript
const content = formatResponse({
    titulo: `${statusEmoji} Maestro — ${estado.nome}`,
    resumo: `Fase ${phaseLabel} — ${faseInfo?.nome || "N/A"}`,
    dados: {
        "Projeto": estado.nome,
        "Nível": estado.nivel.toUpperCase(),
        "Fase": `${phaseLabel} — ${faseInfo?.nome || "N/A"}`,
        ...(specialist ? { "Especialista": specialist.name } : {}),
    },
    progresso: { atual: estado.fase_atual, total: estado.total_fases, percentual: progress.percentage },
    instrucoes: specialistContext || undefined,
    proximo_passo: {
        tool: nextStep.tool,
        descricao: nextStep.description,
        args: formatArgsPreview(nextStep.args_template),
        requer_input_usuario: !nextStep.auto_execute,
        prompt_usuario: nextStep.user_prompt,
    },
});

return { content };
```

#### 1.3.2 — `consolidated/avancar.ts`
- Migrar mensagem de erro para `formatError()`
- Migrar mensagem de "entregável necessário" para `formatResponse()`

#### 1.3.3 — `status.ts`
- Retornar Markdown com tabela de estado e progresso
- Embutir próximo passo

#### 1.3.4 — `consolidated/validar.ts`
- Retornar checklist Markdown com ✅/❌ por item
- Incluir score e recomendação

#### 1.3.5 — `contexto.ts`
- Retornar contexto em seções Markdown (ADRs, padrões, decisões)

#### 1.3.6 — `salvar.ts`
- Confirmação em Markdown com nome do arquivo e tipo salvo

#### 1.3.7 — `consolidated/checkpoint-tool.ts`
- Lista de checkpoints em tabela Markdown

#### 1.3.8 — `consolidated/analisar.ts`
- Relatório em Markdown com scores e recomendações

**Critério de aceitação por tool:**
- [ ] Retorno usa `formatResponse()` ou padrão equivalente
- [ ] Múltiplos content blocks (min 2: resumo + instruções)
- [ ] Zero campos custom no retorno (tudo embutido no content)
- [ ] Markdown bem formado verificado visualmente

---

### Task 1.4 — Corrigir Resources do index.ts

**Arquivo:** `src/src/index.ts`  
**Esforço:** 1 dia  
**Prioridade:** P0 (Crítica)  
**Dependência:** Nenhuma

**Problema atual:** `getResourcesList()` (linhas 357-369) retorna tools como resources em vez de especialistas/templates/skills.

**Ações:**

1. Refatorar `getResourcesList()` para alinhar com `stdio.ts`:

```typescript
async function getResourcesList() {
    const especialistas = await listarEspecialistas();
    const templates = await listarTemplates();
    const guias = await listarGuias();
    
    return {
        resources: [
            ...especialistas.map((e) => ({
                uri: `maestro://especialista/${encodeURIComponent(e)}`,
                name: `Especialista: ${e}`,
                mimeType: "text/markdown",
                description: `Especialista em ${e}`,
            })),
            ...templates.map((t) => ({
                uri: `maestro://template/${encodeURIComponent(t)}`,
                name: `Template: ${t}`,
                mimeType: "text/markdown",
                description: `Template de ${t}`,
            })),
            ...guias.map((g) => ({
                uri: `maestro://guia/${encodeURIComponent(g)}`,
                name: `Guia: ${g}`,
                mimeType: "text/markdown",
                description: `Guia de ${g}`,
            })),
            {
                uri: "maestro://system-prompt",
                name: "System Prompt",
                mimeType: "text/markdown",
                description: "Instruções de comportamento para a IA",
            },
        ],
    };
}
```

2. Atualizar `getResourceContent()` para tratar URIs de skills (como `stdio.ts`)

3. Adicionar handler de prompts no `index.ts` (atualmente ausente):

```typescript
// No handleMcpRequest, adicionar cases:
case "prompts/list": {
    result = await getPromptsList();
    break;
}
case "prompts/get": {
    const { name, arguments: promptArgs } = params as any;
    result = await getPrompt(name, promptArgs);
    break;
}
```

**Critério de aceitação:**
- [ ] `GET /resources` retorna especialistas, templates e guias (não tools)
- [ ] `POST /mcp` com `prompts/list` retorna os 3 prompts
- [ ] `POST /mcp` com `prompts/get` retorna conteúdo do prompt
- [ ] Paridade funcional entre `index.ts` e `stdio.ts`

---

### Task 1.5 — Extrair Handlers Compartilhados

**Arquivos:** Novo `src/src/handlers/`, refatorar `stdio.ts` e `index.ts`  
**Esforço:** 2-3 dias  
**Prioridade:** P1 (Alta)  
**Dependência:** Tasks 1.1, 1.4

**Ações:**

1. Criar diretório `src/src/handlers/`

2. Extrair `src/src/handlers/resources.handler.ts`:
```typescript
export async function listResources(projectDir: string) { /* lógica unificada */ }
export async function readResource(uri: string, projectDir: string) { /* lógica unificada */ }
```

3. Extrair `src/src/handlers/prompts.handler.ts`:
```typescript
export async function listPrompts() { /* lógica unificada */ }
export async function getPrompt(name: string, args: any, projectDir: string) { /* lógica unificada */ }
```

4. Refatorar `stdio.ts` e `index.ts` para importar dos handlers:
```typescript
// stdio.ts
import { listResources, readResource } from "./handlers/resources.handler.js";
import { listPrompts, getPrompt } from "./handlers/prompts.handler.js";

server.setRequestHandler(ListResourcesRequestSchema, async () => listResources(projectsDir));
server.setRequestHandler(ReadResourceRequestSchema, async (req) => readResource(req.params.uri, projectsDir));
server.setRequestHandler(ListPromptsRequestSchema, async () => listPrompts());
server.setRequestHandler(GetPromptRequestSchema, async (req) => getPrompt(req.params.name, req.params.arguments, projectsDir));
```

**Critério de aceitação:**
- [ ] Zero duplicação de lógica entre `stdio.ts` e `index.ts`
- [ ] Testes de integração passam em ambos entry points
- [ ] `server.ts` também usa handlers compartilhados (se ainda usado)

---

### Entregável da Fase 1

Ao final do Sprint 1:
- ✅ Versões e protocol unificados
- ✅ Retornos de todas as 8 tools em Markdown estruturado com múltiplos blocos
- ✅ Resources e prompts funcionando em ambos entry points
- ✅ Zero duplicação de handlers
- ✅ Helper de formatação de resposta testado

---

## 3. Fase 2 — Adaptação Inteligente (Sprint 2)

> **Objetivo:** Detectar capabilities do client, consolidar tools, universalizar skill injection  
> **Duração:** 2 semanas  
> **Dependência:** Fase 1 completa

### Task 2.1 — Client Capability Detection Service

**Arquivos:** Novo `src/src/services/client-capabilities.service.ts`, integração em entry points  
**Esforço:** 2 dias  
**Prioridade:** P0 (Crítica para Fase 2)

**Ações:**

1. Criar `src/src/services/client-capabilities.service.ts`:

```typescript
/**
 * Serviço de detecção de capabilities do client MCP.
 * Captura no handshake initialize e expõe para todas as tools.
 */

export interface ClientCapabilities {
    hasElicitation: boolean;
    hasSampling: boolean;
    hasRoots: boolean;
    hasTasks: boolean;
    hasAnnotations: boolean;
    hasStructuredContent: boolean;
    hasListChanged: boolean;
    clientName: string;
    protocolVersion: string;
}

const DEFAULT_CAPABILITIES: ClientCapabilities = {
    hasElicitation: false,
    hasSampling: false,
    hasRoots: false,
    hasTasks: false,
    hasAnnotations: false,
    hasStructuredContent: false,
    hasListChanged: false,
    clientName: "unknown",
    protocolVersion: "2024-11-05",
};

let currentCapabilities: ClientCapabilities = { ...DEFAULT_CAPABILITIES };

export function captureClientCapabilities(initializeParams: any): void {
    const caps = initializeParams?.capabilities || {};
    const proto = initializeParams?.protocolVersion || "2024-11-05";
    
    currentCapabilities = {
        hasElicitation: !!caps.elicitation,
        hasSampling: !!caps.sampling,
        hasRoots: !!caps.roots,
        hasTasks: !!caps.experimental?.tasks, // Tasks pode ser experimental
        hasAnnotations: proto >= "2025-06-18",
        hasStructuredContent: proto >= "2025-06-18",
        hasListChanged: !!caps.tools?.listChanged,
        clientName: initializeParams?.clientInfo?.name || "unknown",
        protocolVersion: proto,
    };
    
    console.error(`[Capabilities] Client: ${currentCapabilities.clientName}, Protocol: ${proto}`);
    console.error(`[Capabilities] Elicitation: ${currentCapabilities.hasElicitation}, Sampling: ${currentCapabilities.hasSampling}`);
}

export function getClientCapabilities(): Readonly<ClientCapabilities> {
    return currentCapabilities;
}

export function clientSupports(feature: keyof ClientCapabilities): boolean {
    return !!currentCapabilities[feature];
}

/** Identifica o tipo de client para adaptações específicas */
export function getClientType(): "windsurf" | "cursor" | "vscode" | "claude" | "cline" | "unknown" {
    const name = currentCapabilities.clientName.toLowerCase();
    if (name.includes("windsurf")) return "windsurf";
    if (name.includes("cursor")) return "cursor";
    if (name.includes("visual studio code") || name.includes("copilot")) return "vscode";
    if (name.includes("claude")) return "claude";
    if (name.includes("cline")) return "cline";
    return "unknown";
}
```

2. Integrar em `stdio.ts`:
```typescript
import { captureClientCapabilities } from "./services/client-capabilities.service.js";

// O SDK do MCP permite interceptar o initialize via server events
// ou podemos usar o onInitialize callback
server.oninitialized = () => {
    // Nota: O SDK pode não expor params diretamente.
    // Alternativa: interceptar via custom transport ou
    // usar o pacote mcp-client-capabilities como fallback estático.
};
```

3. Integrar em `index.ts`:
```typescript
case "initialize": {
    captureClientCapabilities(params);
    result = { /* ... */ };
    break;
}
```

**Critério de aceitação:**
- [ ] Capabilities capturadas no handshake e logadas
- [ ] `getClientCapabilities()` retorna dados corretos
- [ ] `getClientType()` identifica Windsurf, Cursor, VS Code

---

### Task 2.2 — Consolidação de Tools (8 → 5)

**Arquivos:** Novo `src/src/tools/consolidated/executar.ts`, refatorar `router.ts`  
**Esforço:** 3-4 dias  
**Prioridade:** P1 (Alta)

**Ações:**

1. Criar `src/src/tools/consolidated/executar.ts`:

```typescript
/**
 * Tool consolidada: executar
 * 
 * Unifica: avancar + salvar + checkpoint
 * Parâmetro "acao" determina operação.
 * Default: avancar (quando "acao" não fornecido)
 */

interface ExecutarArgs {
    diretorio: string;
    acao?: "avancar" | "salvar" | "checkpoint" | "rollback" | "listar_checkpoints";
    // Args de avancar
    entregavel?: string;
    estado_json?: string;
    respostas?: Record<string, unknown>;
    resumo_json?: string;
    nome_arquivo?: string;
    auto_flow?: boolean;
    // Args de salvar
    conteudo?: string;
    tipo?: "rascunho" | "anexo" | "entregavel";
    // Args de checkpoint
    descricao?: string;
    checkpoint_id?: string;
    campos?: string[];
}

export async function executar(args: ExecutarArgs): Promise<ToolResult> {
    const acao = args.acao || "avancar";
    
    switch (acao) {
        case "avancar":
            return avancar({ /* map args */ });
        case "salvar":
            return salvar({ /* map args */ });
        case "checkpoint":
            return checkpoint({ acao: "criar", /* map args */ });
        case "rollback":
            return checkpoint({ acao: "rollback", /* map args */ });
        case "listar_checkpoints":
            return checkpoint({ acao: "listar", /* map args */ });
        default:
            return { content: formatError("executar", `Ação desconhecida: ${acao}`) };
    }
}
```

2. Atualizar `router.ts` — novas tools públicas:

```typescript
const publicTools: ToolDefinition[] = [
    // 1. Entry point
    { name: "maestro", /* ... */ },
    // 2. Execução unificada (avancar + salvar + checkpoint)
    { name: "executar", /* ... */ },
    // 3. Validação
    { name: "validar", /* ... */ },
    // 4. Análise
    { name: "analisar", /* ... */ },
    // 5. Contexto
    { name: "contexto", /* ... */ },
];
```

3. Mover `status`, `avancar`, `salvar`, `checkpoint` para legacyTools (backward compatible)

4. Atualizar `maestro-tool.ts` para referenciar novas tools nos `next_action`

**Critério de aceitação:**
- [ ] `getRegisteredTools()` retorna 5 tools
- [ ] `routeToolCall("avancar", args)` ainda funciona (legacy)
- [ ] `routeToolCall("salvar", args)` ainda funciona (legacy)
- [ ] `routeToolCall("checkpoint", args)` ainda funciona (legacy)
- [ ] `executar(acao: "avancar")` equivale a `avancar()`
- [ ] `maestro()` subsume funcionalidade de `status()` quando sem ação

---

### Task 2.3 — Skill Injection Universal

**Arquivos:** `src/src/middleware/index.ts`, `src/src/middleware/skill-injection.middleware.ts`  
**Esforço:** 1 dia  
**Prioridade:** P1 (Alta)

**Ações:**

1. Criar variante `applySmartMiddlewares` que inclui skill injection leve:

```typescript
/**
 * Middleware inteligente: inclui skill injection apenas quando o
 * estado indica que estamos em fase de desenvolvimento (não onboarding).
 */
export function applySmartMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    return withErrorHandling(
        toolName,
        withStateLoad(
            withConditionalSkillInjection(handler)
        )
    );
}
```

2. Criar `withConditionalSkillInjection`:
```typescript
function withConditionalSkillInjection(handler: ToolHandler): ToolHandler {
    return async (args) => {
        const result = await handler(args);
        
        // Só injeta se tem estado e não está em onboarding
        const estado = args.__loaded_state as EstadoProjeto | undefined;
        if (estado && !isInOnboarding(estado)) {
            return injectSkillContext(result, estado);
        }
        
        return result;
    };
}
```

3. Aplicar `applySmartMiddlewares` em `maestro` e `avancar` (atualmente usam Light)

**Critério de aceitação:**
- [ ] `maestro` recebe skill injection em fases de desenvolvimento
- [ ] `avancar` recebe skill injection em fases de desenvolvimento
- [ ] Onboarding NÃO recebe skill injection desnecessária
- [ ] 100% das tools públicas com skill injection quando aplicável

---

### Task 2.4 — Cache de Skills em Memória

**Arquivos:** Novo `src/src/services/skill-cache.service.ts`, integrar em `SkillLoaderService`  
**Esforço:** 1 dia  
**Prioridade:** P2 (Média)

**Ações:**

1. Criar `src/src/services/skill-cache.service.ts`:

```typescript
interface CacheEntry {
    content: string;
    loadedAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 60 * 60 * 1000; // 1 hora

export function getCached(key: string): string | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.loadedAt > TTL) {
        cache.delete(key);
        return null;
    }
    return entry.content;
}

export function setCache(key: string, content: string): void {
    cache.set(key, { content, loadedAt: Date.now() });
}

export function invalidateCache(pattern?: string): void {
    if (!pattern) { cache.clear(); return; }
    for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
    }
}

export function getCacheStats(): { size: number; keys: string[] } {
    return { size: cache.size, keys: [...cache.keys()] };
}
```

2. Integrar no `SkillLoaderService.loadForPhase()`:
```typescript
const cacheKey = `skill:${skillName}:${mode}`;
const cached = getCached(cacheKey);
if (cached) return JSON.parse(cached);
// ... load from disk ...
setCache(cacheKey, JSON.stringify(result));
```

**Critério de aceitação:**
- [ ] Segunda chamada à mesma skill não lê do filesystem
- [ ] Cache expira após 1h
- [ ] `invalidateCache()` limpa tudo

---

### Task 2.5 — System Prompt Dinâmico

**Arquivos:** `src/src/handlers/resources.handler.ts` (ou stdio/index)  
**Esforço:** 1 dia  
**Prioridade:** P2 (Média)

**Ações:**

1. O resource `maestro://system-prompt` passa a ser contextual:
   - Sem projeto → instruções de início
   - Com projeto → instruções da fase atual + tools relevantes
   - Com capabilities → instruções adaptadas ao client

```typescript
async function gerarSystemPromptDinamico(projectDir: string): Promise<string> {
    const caps = getClientCapabilities();
    const stateService = createStateService(projectDir);
    const estado = await stateService.load();
    
    let prompt = `# Maestro v5 — Instruções para IA\n\n`;
    prompt += `**Client:** ${caps.clientName} | **Protocol:** ${caps.protocolVersion}\n\n`;
    
    if (!estado) {
        prompt += `## Início\nNenhum projeto ativo. Use \`maestro(diretorio)\` para começar.\n`;
    } else {
        const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
        prompt += `## Projeto: ${estado.nome}\n`;
        prompt += `**Fase:** ${estado.fase_atual}/${estado.total_fases} — ${faseInfo?.nome}\n\n`;
        prompt += `## Tools Disponíveis\n`;
        prompt += getRegisteredTools().map(t => `- \`${t.name}\` — ${t.description}`).join("\n");
    }
    
    return prompt;
}
```

**Critério de aceitação:**
- [ ] System prompt muda baseado no estado do projeto
- [ ] Inclui informação do client detectado

---

### Entregável da Fase 2

Ao final do Sprint 2:
- ✅ Client capabilities detectadas e utilizadas
- ✅ 5 tools públicas (redução de 37%)
- ✅ Skill injection em 100% das tools relevantes
- ✅ Cache de skills funcional
- ✅ System prompt contextual

---

## 4. Fase 3 — Refinamento e Fallbacks (Sprint 3)

> **Objetivo:** Implementar fallbacks inteligentes e preparar features avançadas  
> **Duração:** 2 semanas  
> **Dependência:** Task 2.1 (capability detection)

### Task 3.1 — Fallback de Elicitation para Discovery

**Arquivos:** `src/src/tools/discovery.ts`, `src/src/flows/onboarding-orchestrator.ts`  
**Esforço:** 2-3 dias  
**Prioridade:** P1 (Alta)

**Ações:**

1. Criar `src/src/utils/elicitation-fallback.ts`:
```typescript
import { clientSupports } from "../services/client-capabilities.service.js";

export interface DiscoveryQuestion {
    key: string;
    label: string;
    type: "text" | "select" | "multiselect";
    options?: string[];
    required: boolean;
    defaultValue?: string;
}

export function buildDiscoveryContent(questions: DiscoveryQuestion[]): ResponseBlock[] {
    if (clientSupports("hasElicitation")) {
        // Para clients com elicitation, retornar schema JSON
        // (o server pode solicitar requestElicitation se o SDK suportar)
        return [{
            type: "text",
            text: `## 📋 Discovery\n\nO formulário de perguntas será exibido automaticamente.`,
        }];
    }
    
    // Fallback Markdown para Windsurf e outros
    let md = `## 📋 Discovery — Informações do Projeto\n\n`;
    md += `Responda as perguntas abaixo para configurar seu projeto:\n\n`;
    
    for (const q of questions) {
        md += `### ${q.label}${q.required ? " *" : ""}\n`;
        
        if (q.type === "select" && q.options) {
            for (const opt of q.options) {
                md += `- \`${opt}\`\n`;
            }
            if (q.defaultValue) md += `\n> Padrão: \`${q.defaultValue}\`\n`;
        } else if (q.type === "text") {
            md += `> _[sua resposta aqui]_\n`;
        }
        md += `\n`;
    }
    
    md += `---\n\n> Após responder, chame \`executar(acao: "avancar", respostas: { ... })\` com os dados.`;
    
    return [{ type: "text", text: md }];
}
```

2. Integrar no fluxo de discovery e onboarding

**Critério de aceitação:**
- [ ] VS Code com Elicitation → formulário nativo (quando SDK suportar)
- [ ] Windsurf → Markdown estruturado com opções claras
- [ ] Respostas parseadas corretamente em ambos os caminhos

---

### Task 3.2 — Fallback de Sampling para Análise

**Arquivos:** `src/src/tools/consolidated/analisar.ts`  
**Esforço:** 2 dias  
**Prioridade:** P2 (Média)

**Ações:**

1. Criar checklists inline para cada tipo de análise (segurança, qualidade, performance)
2. Quando `clientSupports("hasSampling")` → delegar análise
3. Quando não → retornar checklist para IA avaliar inline

```typescript
const CHECKLISTS = {
    seguranca: [
        "Injection (SQL, NoSQL, OS, LDAP)",
        "Broken Authentication",
        "Sensitive Data Exposure",
        "XML External Entities (XXE)",
        "Broken Access Control",
        "Security Misconfiguration",
        "Cross-Site Scripting (XSS)",
        "Insecure Deserialization",
        "Using Components with Known Vulnerabilities",
        "Insufficient Logging & Monitoring",
    ],
    qualidade: [
        "Complexidade ciclomática < 10 por função",
        "Funções com < 50 linhas",
        "Nomes descritivos (variáveis, funções, classes)",
        "Sem código duplicado (DRY)",
        "Single Responsibility Principle",
        "Tratamento de erros adequado",
        "Tipos/interfaces bem definidos",
        "Sem magic numbers/strings",
    ],
    performance: [
        "Sem N+1 queries",
        "Índices de banco adequados",
        "Sem loops desnecessários",
        "Lazy loading onde aplicável",
        "Cache utilizado corretamente",
        "Sem memory leaks (listeners, timers)",
        "Bundle size otimizado",
        "Sem blocking no event loop",
    ],
};
```

**Critério de aceitação:**
- [ ] Checklists são retornados como Markdown para Windsurf
- [ ] Cada item do checklist tem instrução clara para avaliação
- [ ] IA consegue avaliar e dar score usando o checklist

---

### Task 3.3 — Annotations com Fallback

**Arquivos:** `src/src/utils/response-formatter.ts`  
**Esforço:** 2 dias  
**Prioridade:** P2 (Média)  
**Dependência:** Task 2.1

**Ações:**

1. Estender `formatResponse()` para aceitar opção `withAnnotations`:

```typescript
interface AnnotatedBlock {
    type: "text";
    text: string;
    annotations?: {
        audience?: ("user" | "assistant")[];
        priority?: number;
    };
}

export function formatAnnotatedResponse(
    opts: ToolResponseOptions,
    caps: ClientCapabilities
): AnnotatedBlock[] {
    const blocks = formatResponse(opts);
    
    if (!caps.hasAnnotations) {
        // Retornar sem annotations (fallback)
        return blocks;
    }
    
    // Adicionar annotations de audience
    return blocks.map((block, i) => {
        if (block.text.includes("## 🤖 Instruções")) {
            return { ...block, annotations: { audience: ["assistant"], priority: 0.9 } };
        }
        if (block.text.includes("## 📝 Template")) {
            return { ...block, annotations: { audience: ["assistant"], priority: 0.8 } };
        }
        // Blocos de resumo são para o usuário
        if (i === 0) {
            return { ...block, annotations: { audience: ["user"], priority: 1.0 } };
        }
        return block;
    });
}
```

**Critério de aceitação:**
- [ ] Clients com protocol ≥2025-06-18 recebem annotations
- [ ] Clients com protocol antigo recebem content sem annotations
- [ ] Ambos os caminhos geram respostas válidas

---

### Task 3.4 — Prompt de Sessão Completa

**Arquivos:** `src/src/handlers/prompts.handler.ts`  
**Esforço:** 1 dia  
**Prioridade:** P2 (Média)

**Ações:**

1. Adicionar prompt `maestro-sessao`:

```typescript
{
    name: "maestro-sessao",
    description: "Contexto completo para sessão de trabalho (specialist + context + template + tools)",
    arguments: [
        { name: "diretorio", description: "Diretório do projeto", required: true },
    ],
}
```

2. Handler combina: specialist + context + template + lista de tools:

```typescript
async function buildSessionPrompt(diretorio: string) {
    const [specialist, context, template] = await Promise.all([
        buildSpecialistPrompt(diretorio),
        buildContextPrompt(diretorio),
        buildTemplatePrompt(diretorio),
    ]);
    
    const tools = getRegisteredTools();
    const toolsList = tools.map(t => `- \`${t.name}\` — ${t.description}`).join("\n");
    
    return {
        description: `Sessão de trabalho — ${context.description}`,
        messages: [
            ...specialist.messages,
            ...context.messages,
            ...template.messages,
            {
                role: "user" as const,
                content: {
                    type: "text" as const,
                    text: `## Tools Disponíveis\n\n${toolsList}`,
                },
            },
        ],
    };
}
```

**Critério de aceitação:**
- [ ] `maestro-sessao` retorna contexto completo em 1 chamada
- [ ] Combina specialist + context + template + tools

---

### Task 3.5 — Deprecation Warnings para Tools Legadas

**Arquivo:** `src/src/router.ts`  
**Esforço:** 0.5 dia  
**Prioridade:** P3 (Baixa)

**Ações:**

1. No `routeToolCall`, se tool é legacy, adicionar warning:

```typescript
export async function routeToolCall(name: string, rawArgs: Record<string, unknown>): Promise<ToolResult> {
    const tool = allToolsMap.get(name);
    if (!tool) { /* ... */ }
    
    const isLegacy = !publicTools.some(t => t.name === name);
    
    try {
        const result = await tool.handler(rawArgs);
        
        if (isLegacy) {
            const redirect = getToolRedirect(name);
            result.content.push({
                type: "text" as const,
                text: `\n---\n> ⚠️ **Deprecation:** \`${name}\` será removida na v6. Use \`${redirect}\` como alternativa.`,
            });
        }
        
        return result;
    } catch (error) { /* ... */ }
}

function getToolRedirect(legacyName: string): string {
    const redirects: Record<string, string> = {
        "proximo": "executar(acao: 'avancar')",
        "salvar": "executar(acao: 'salvar')",
        "status": "maestro",
        "validar_gate": "validar(tipo: 'gate')",
        "analisar_seguranca": "analisar(tipo: 'seguranca')",
        "analisar_qualidade": "analisar(tipo: 'qualidade')",
        "analisar_performance": "analisar(tipo: 'performance')",
        "create_checkpoint": "executar(acao: 'checkpoint')",
        "rollback_total": "executar(acao: 'rollback')",
        // ... etc
    };
    return redirects[legacyName] || "maestro";
}
```

**Critério de aceitação:**
- [ ] Chamada a tool legada funciona normalmente (backward compatible)
- [ ] Warning de deprecation aparece no retorno
- [ ] Mapa de redirecionamento completo

---

### Entregável da Fase 3

Ao final do Sprint 3:
- ✅ Fallback de elicitation funcional
- ✅ Fallback de sampling com checklists
- ✅ Annotations preparadas com fallback
- ✅ Prompt de sessão completa
- ✅ Deprecation path para legadas

---

## 5. Fase 4 — Futuro-proofing (Sprint 4)

> **Objetivo:** Preparar para protocol ≥2025-06-18, cleanup, type safety  
> **Duração:** 1-2 semanas  
> **Dependência:** Fases 1-3 completas

### Task 4.1 — Structured Content com Fallback

**Arquivos:** Todas as tools públicas  
**Esforço:** 3-4 dias  
**Prioridade:** P2 (Média)

**Ações:**

1. Definir `outputSchema` nas tools que retornam dados estruturados:

```typescript
// No router.ts, para tool "maestro":
{
    name: "maestro",
    description: "...",
    inputSchema: maestroToolSchema,
    outputSchema: {
        type: "object",
        properties: {
            projeto: { type: "string" },
            fase: { type: "number" },
            total_fases: { type: "number" },
            percentual: { type: "number" },
            proximo_tool: { type: "string" },
            proximo_descricao: { type: "string" },
        },
    },
}
```

2. Retornar `structuredContent` + `content` simultaneamente:

```typescript
return {
    content: [/* Markdown para clients antigos */],
    structuredContent: {
        projeto: estado.nome,
        fase: estado.fase_atual,
        total_fases: estado.total_fases,
        percentual: progress.percentage,
        proximo_tool: nextStep.tool,
        proximo_descricao: nextStep.description,
    },
};
```

3. Clients antigos ignoram `structuredContent` e usam `content`  
4. Clients novos (VS Code) podem processar `structuredContent`

**Critério de aceitação:**
- [ ] `outputSchema` definido para todas as tools com dados estruturados
- [ ] `structuredContent` retornado junto com `content`
- [ ] Client antigo (Windsurf) não quebra
- [ ] Client novo pode ler `structuredContent`

---

### Task 4.2 — Cleanup e Type Safety

**Arquivos:** `src/src/types/index.ts`, `src/src/tools/index.ts`  
**Esforço:** 2 dias  
**Prioridade:** P3 (Baixa)

**Ações:**

1. Remover `[x: string]: unknown` do `ToolResult`:
```typescript
// ANTES
export interface ToolResult {
    [x: string]: unknown;
    content: Array<{ type: "text"; text: string }>;
    // ...
}

// DEPOIS
export interface ToolResult {
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
    structuredContent?: Record<string, unknown>;  // Novo: protocol ≥2025-06-18
}
```

2. Remover campos custom (`files`, `estado_atualizado`, `next_action`, `specialist_persona`, `progress`) — já embutidos no content pela Fase 1

3. Verificar se `src/src/tools/index.ts` ainda é importado. Se não, marcar para remoção (substituído por `router.ts`)

4. Verificar se `src/src/server.ts` ainda é usado. Se não, marcar para remoção

**Critério de aceitação:**
- [ ] `ToolResult` sem index signature
- [ ] Zero campos custom não-standard
- [ ] Nenhum arquivo morto no codebase

---

### Task 4.3 — Padronizar Error Handling

**Arquivos:** Todas as tools  
**Esforço:** 1-2 dias  
**Prioridade:** P3 (Baixa)

**Ações:**

1. Regra: tools NUNCA lançam exceções — sempre retornam `ToolResult`
2. `withErrorHandling` middleware é a rede de segurança
3. Usar `formatError()` do response-formatter para erros

```typescript
// Padrão para todas as tools
export async function minhaTool(args: Args): Promise<ToolResult> {
    if (!args.diretorio) {
        return { content: formatError("minhaTool", "Parâmetro `diretorio` é obrigatório") };
    }
    
    // Lógica...
    // Se algo falhar, o middleware captura
    
    return { content: formatResponse({ /* ... */ }) };
}
```

**Critério de aceitação:**
- [ ] Nenhuma tool lança exceção diretamente
- [ ] Todos os erros usam `formatError()`
- [ ] `withErrorHandling` captura tudo como rede de segurança

---

### Task 4.4 — Documentação de API MCP

**Arquivos:** Novo `docs/MCP_API_REFERENCE.md`  
**Esforço:** 1 dia  
**Prioridade:** P3 (Baixa)

**Ações:**

1. Gerar documentação completa das 5 tools públicas:
   - Input schema
   - Output format (Markdown blocks)
   - Exemplos de chamada e retorno
   - Comportamento por IDE

2. Documentar resources disponíveis e URIs

3. Documentar prompts e seus argumentos

**Critério de aceitação:**
- [ ] Cada tool tem exemplo de chamada e retorno
- [ ] Resources documentados com URIs completos
- [ ] Prompts documentados com argumentos

---

### Entregável da Fase 4

Ao final do Sprint 4:
- ✅ Structured content preparado com fallback
- ✅ Types limpos sem campos custom
- ✅ Error handling padronizado
- ✅ Documentação de API completa

---

## 6. Dependências entre Tasks

```
Task 1.1 (Fixes versão) ─────────────────────────────────┐
Task 1.2 (Response formatter) ──────┐                     │
                                     ├── Task 1.3 (Migrar tools) ──── Task 2.2 (Consolidar)
Task 1.4 (Fix resources) ──────────┤                                         │
                                     └── Task 1.5 (Handlers compartilhados) ─┘
                                                                               
Task 2.1 (Capability detection) ──┬── Task 2.3 (Skill injection)
                                   ├── Task 2.5 (System prompt dinâmico)
                                   ├── Task 3.1 (Fallback elicitation)
                                   ├── Task 3.2 (Fallback sampling)
                                   └── Task 3.3 (Annotations fallback)

Task 2.4 (Cache skills) ─── independente

Task 3.4 (Prompt sessão) ─── depende de Task 1.5 (Handlers compartilhados)

Task 3.5 (Deprecation) ─── depende de Task 2.2 (Consolidar tools)

Task 4.1 (Structured content) ─── depende de Task 1.2 e Task 2.1
Task 4.2 (Cleanup types) ─── depende de Task 1.3 (Migrar tools)
Task 4.3 (Error handling) ─── depende de Task 1.2 (Response formatter)
```

### Ordem Crítica de Execução

1. **Paralelo:** 1.1 + 1.2 + 1.4 (sem dependências entre si)
2. **Sequencial:** 1.3 (depende de 1.2)
3. **Paralelo:** 1.5 + 2.1 + 2.4 (sem dependências entre si)
4. **Sequencial:** 2.2 (depende de 1.3)
5. **Paralelo:** 2.3 + 2.5 + 3.1 + 3.2 + 3.3 (dependem de 2.1)
6. **Paralelo:** 3.4 + 3.5 (dependem de 1.5 e 2.2 respectivamente)
7. **Paralelo:** 4.1 + 4.2 + 4.3 + 4.4 (final)

---

## 7. Checklist de Validação por Fase

### Fase 1 — Fundação
- [ ] `npm run build` compila sem erros
- [ ] `npm test` passa todos os testes
- [ ] Windsurf conecta via stdio e lista 8 tools (ainda não consolidadas)
- [ ] HTTP endpoint `/mcp` responde a `initialize` com protocol `2025-03-26`
- [ ] HTTP endpoint `/resources` retorna especialistas/templates (não tools)
- [ ] HTTP endpoint `/mcp` com `prompts/list` retorna 3 prompts
- [ ] Retornos de tools são Markdown bem formado (verificar visual)
- [ ] Múltiplos content blocks por resposta (min 2)

### Fase 2 — Adaptação
- [ ] Log no startup mostra capabilities detectadas
- [ ] `getRegisteredTools()` retorna 5 tools
- [ ] Chamadas a tools legadas funcionam (backward compatible)
- [ ] Skill injection funciona em `maestro` e `executar`
- [ ] Cache de skills evita re-leitura do filesystem
- [ ] System prompt muda baseado no estado do projeto

### Fase 3 — Refinamento
- [ ] Discovery retorna Markdown estruturado no Windsurf
- [ ] Análise retorna checklists no Windsurf
- [ ] Prompts incluem `maestro-sessao`
- [ ] Tools legadas retornam warning de deprecation

### Fase 4 — Futuro-proofing
- [ ] `outputSchema` definido nas tools relevantes
- [ ] `structuredContent` retornado (clients antigos não quebram)
- [ ] `ToolResult` sem index signature
- [ ] Documentação de API completa
- [ ] Zero arquivos mortos no codebase

---

## 8. Riscos e Mitigações

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| R1 | SDK do MCP não expõe `initialize` params em stdio | Média | Alto | Usar fallback estático via `mcp-client-capabilities` ou detectar via `clientInfo.name` |
| R2 | Windsurf não processa múltiplos content blocks | Baixa | Médio | Testar com Windsurf real; se não funcionar, concatenar em 1 bloco |
| R3 | Consolidação 8→5 confunde IA que "lembrava" tools antigas | Média | Médio | Manter legadas aceitas com redirect; description clara na nova tool |
| R4 | `structuredContent` causa erro em clients antigos | Baixa | Alto | Retornar `structuredContent` somente se `caps.hasStructuredContent` |
| R5 | Cache de skills serve conteúdo stale | Baixa | Baixo | TTL de 1h; `invalidateCache()` chamado quando conteúdo muda |
| R6 | Annotations ignoradas por SDK versão antiga | Média | Baixo | Annotations são opcionais no protocol; sem annotations = funciona normalmente |
| R7 | Mudança no `ToolResult` quebra tools existentes | Média | Alto | Migrar tools ANTES de mudar interface; fazer em etapas |

### Estratégia de Rollback

Cada fase tem independência suficiente para ser revertida:
- **Fase 1:** Revert dos commits de formatação (sem impacto funcional)
- **Fase 2:** Revert da consolidação + restaurar `publicTools` original
- **Fase 3:** Fallbacks são adições, não modificações — basta remover
- **Fase 4:** `structuredContent` e `outputSchema` são aditivos

---

## 9. Guia de Testes

### 9.1. Testes Unitários (vitest)

```typescript
// tests/utils/response-formatter.test.ts
import { describe, it, expect } from "vitest";
import { formatResponse, embedNextAction, formatError } from "../../src/utils/response-formatter.js";

describe("formatResponse", () => {
    it("gera Markdown com título e resumo", () => {
        const blocks = formatResponse({ titulo: "Teste", resumo: "Resumo" });
        expect(blocks[0].text).toContain("# Teste");
        expect(blocks[0].text).toContain("Resumo");
    });
    
    it("gera múltiplos blocks quando tem instruções e template", () => {
        const blocks = formatResponse({
            titulo: "Teste",
            resumo: "Resumo",
            instrucoes: "Faça X",
            template: "# Template Y",
        });
        expect(blocks.length).toBeGreaterThanOrEqual(3);
    });
    
    it("inclui tabela quando tem dados", () => {
        const blocks = formatResponse({
            titulo: "T",
            resumo: "R",
            dados: { "Fase": "4", "Nível": "COMPLEXO" },
        });
        expect(blocks[0].text).toContain("| **Fase** | 4 |");
    });
});

describe("embedNextAction", () => {
    it("adiciona bloco de próxima ação", () => {
        const content = [{ type: "text" as const, text: "original" }];
        const result = embedNextAction(content, {
            tool: "avancar",
            description: "Avançar fase",
        });
        expect(result.length).toBe(2);
        expect(result[1].text).toContain("`avancar`");
    });
});
```

### 9.2. Testes de Integração

```typescript
// tests/integration/entry-points.test.ts
describe("Paridade stdio ↔ HTTP", () => {
    it("ambos retornam mesmos resources", async () => {
        const stdioResources = await getStdioResources();
        const httpResources = await getHttpResources();
        expect(stdioResources.length).toBe(httpResources.length);
    });
    
    it("ambos retornam mesmos prompts", async () => {
        const stdioPrompts = await getStdioPrompts();
        const httpPrompts = await getHttpPrompts();
        expect(stdioPrompts.length).toBe(httpPrompts.length);
    });
});
```

### 9.3. Testes Manuais (Windsurf)

Para cada fase, testar manualmente no Windsurf:

1. **Conectar MCP:** Verificar que tools aparecem no seletor
2. **Chamar `maestro`:** Verificar Markdown bem formado
3. **Chamar `executar(acao: "avancar")`:** Verificar fluxo
4. **Chamar tool legada:** Verificar backward compatibility + warning
5. **Verificar resources:** `list_resources` → `read_resource` de skills

---

## 10. Notas de Migração

### Para Usuários

**Nenhuma breaking change.** Todas as tools legadas continuam funcionando.

- Tools novas: `executar` substitui `avancar` + `salvar` + `checkpoint`
- Tool `status` subsumida pelo `maestro` (sem ação)
- Retornos agora em Markdown (melhor legibilidade)

### Para Desenvolvedores do Maestro

1. **Imports:** Usar `formatResponse()` de `utils/response-formatter.ts` em vez de montar `content` manualmente
2. **ToolResult:** Não adicionar campos custom — embutir no `content`
3. **Handlers:** Importar de `handlers/` (não duplicar em entry points)
4. **Capabilities:** Usar `clientSupports()` para adaptação condicional
5. **Cache:** Skills são cacheadas — chamar `invalidateCache()` se conteúdo mudar

### Versioning

| Release | Conteúdo | Versão |
|---------|----------|--------|
| v5.1.0 | Fase 1 — Fundação | Patch: fixes + formatação |
| v5.2.0 | Fase 2 — Adaptação | Minor: capability detection + consolidação |
| v5.3.0 | Fase 3 — Refinamento | Minor: fallbacks + annotations |
| v6.0.0 | Fase 4 — Breaking changes | Major: remoção de legadas + novo ToolResult |

> **Nota:** A remoção efetiva de tools legadas só acontece na v6.0.0, dando tempo para migração.

---

## Resumo de Impacto Esperado

| Métrica | Antes (v5.0) | Depois (v5.3/v6.0) | Melhoria |
|---------|-------------|-------------------|----------|
| Tools públicas | 8 | 5 | -37% superfície |
| Tools totais aceitas | 45 | 45 → 5 (v6) | -89% na v6 |
| Content blocks/resposta | 1 | 3-4 | +300% granularidade |
| Skills com injection | ~60% | 100% | +40% cobertura |
| Paridade stdio↔HTTP | ~50% | 100% | Eliminação de bugs |
| Adaptation por IDE | 0% | Sim (3+ IDEs) | Novo capability |
| Protocol version | 2024-11-05 | 2025-03-26 | +2 versões |
| Preparação 2025-06-18 | 0% | ~80% (annotations, structured) | Futuro-proof |

---

> **Início recomendado:** Tasks 1.1, 1.2 e 1.4 podem ser iniciadas em paralelo imediatamente.
