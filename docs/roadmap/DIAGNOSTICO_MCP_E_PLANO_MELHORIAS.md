# Diagnóstico Completo do Maestro MCP — Limitações de IDEs e Plano de Melhorias

> **Versão:** 1.0.0  
> **Data:** 2026-02-07  
> **Escopo:** Análise profunda do Maestro MCP v5 frente às limitações reais das IDEs, com estratégias concretas de melhoria  
> **Baseado em:** Código-fonte atual (`src/src/`), dados do `apify/mcp-client-capabilities`, documentação MCP oficial

---

## Índice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Estado Atual do Maestro MCP v5](#2-estado-atual-do-maestro-mcp-v5)
3. [Matriz de Capabilities — IDEs vs MCP](#3-matriz-de-capabilities)
4. [Diagnóstico Detalhado — Problemas Identificados](#4-diagnostico-detalhado)
5. [Plano de Melhorias — 4 Níveis](#5-plano-de-melhorias)
6. [Melhorias Adicionais Identificadas na Análise de Código](#6-melhorias-adicionais)
7. [Matriz de Priorização Final](#7-matriz-de-priorizacao)
8. [Métricas de Sucesso](#8-metricas-de-sucesso)

---

## 1. Resumo Executivo

O Maestro MCP v5 é um servidor MCP maduro com **8 tools públicas**, **37+ tools legadas**, **resources dinâmicos** (skills, especialistas, templates, guias) e **3 prompts MCP**. Opera via dois entry points: **stdio** (IDEs) e **HTTP/SSE** (web).

### Pontos Fortes Atuais
- Arquitetura de router centralizado (`router.ts`) com separação public/legacy
- Pipeline de middlewares composável (error → state → flow → persistence → skill injection)
- Entry point inteligente `maestro` que detecta contexto automaticamente
- Skills como MCP Resources com carregamento dinâmico
- 3 prompts MCP para injeção contextual (specialist, context, template)

### Problemas Críticos Identificados
- **Retornos em JSON bruto** — Tools retornam `ToolResult` com JSON serializado, gerando erros de parsing pela IA
- **Protocolo desatualizado** — `index.ts` declara `protocolVersion: "2024-11-05"` (2 versões atrás da atual)
- **Resources passivos** — Windsurf não injeta resources automaticamente; IA precisa chamar `read_resource` explicitamente
- **Prompts sub-utilizados** — Windsurf não tem slash commands para prompts MCP
- **Sem detecção de capabilities** — Servidor não adapta comportamento baseado no client
- **45+ tools no total** — Risco de estourar limite de 100 tools do Windsurf quando combinado com outros MCPs
- **Duplicação de lógica** — `index.ts` (HTTP) e `stdio.ts` têm implementações divergentes de resources/prompts
- **Sem annotations** — Retornos não separam conteúdo para IA vs usuário
- **ToolResult genérico** — `[x: string]: unknown` permite campos arbitrários que clients não processam

---

## 2. Estado Atual do Maestro MCP v5

### 2.1. Arquitetura de Entry Points

```
┌─────────────────────────────────────────────────┐
│                  Maestro MCP v5                  │
├─────────────┬───────────────────────────────────┤
│  stdio.ts   │          index.ts                 │
│  (IDEs)     │   (HTTP + SSE / Web)              │
│             │                                   │
│ Server SDK  │   Express + JSON-RPC manual       │
│ + Transport │   + SSE sessions                  │
├─────────────┴───────────────────────────────────┤
│              router.ts (centralizado)            │
│  8 public tools + 37 legacy tools               │
│  routeToolCall() + getRegisteredTools()          │
├─────────────────────────────────────────────────┤
│           middleware/ pipeline                    │
│  error → state → flow → persistence → skill     │
├─────────────────────────────────────────────────┤
│  tools/    resources/   services/   flows/       │
│  core/     adapters/    analyzers/  types/       │
└─────────────────────────────────────────────────┘
```

### 2.2. Tools Públicas (v5)

| # | Tool | Middleware | Função |
|---|------|-----------|--------|
| 1 | `maestro` | Light | Entry point inteligente — detecta contexto |
| 2 | `avancar` | Light | Avança fase (onboarding ou desenvolvimento) |
| 3 | `status` | Full | Status completo do projeto |
| 4 | `validar` | Full | Validação (gate, entregável, compliance) |
| 5 | `contexto` | Full | Contexto acumulado (ADRs, padrões) |
| 6 | `salvar` | Persistence | Salva rascunhos/anexos |
| 7 | `checkpoint` | Persistence | Gerencia checkpoints/rollbacks |
| 8 | `analisar` | Full | Análise de código |

### 2.3. Resources (stdio.ts)

| URI Pattern | Tipo | Quantidade |
|-------------|------|-----------|
| `maestro://skills/{name}/SKILL.md` | Skill principal | ~30 skills |
| `maestro://skills/{name}/templates/{file}` | Templates de skill | variável |
| `maestro://skills/{name}/checklists/{file}` | Checklists de skill | variável |
| `maestro://especialista/{nome}` | Legacy: especialistas | ~15 |
| `maestro://template/{nome}` | Legacy: templates | ~10 |
| `maestro://guia/{nome}` | Legacy: guias | ~5 |
| `maestro://system-prompt` | System prompt | 1 |

### 2.4. Prompts MCP

| Prompt | Argumentos | Função |
|--------|------------|--------|
| `maestro-specialist` | `diretorio` | Persona + instruções do especialista da fase atual |
| `maestro-context` | `diretorio` | Contexto completo do projeto |
| `maestro-template` | `diretorio` | Template do entregável da fase |

### 2.5. Capabilities Declaradas

```typescript
// stdio.ts (v5)
capabilities: {
    resources: {},
    tools: {},
    prompts: {},
}

// index.ts (HTTP) — protocolVersion desatualizado
protocolVersion: "2024-11-05"
```

**Problema:** Nenhum dos entry points declara `listChanged`, `subscribe`, ou outras sub-capabilities.

---

## 3. Matriz de Capabilities — IDEs vs MCP

### 3.1. Dados Reais (fonte: apify/mcp-client-capabilities)

| Primitiva MCP | Windsurf | Cursor | VS Code (Copilot) | Claude Code | Cline |
|---------------|----------|--------|-------------------|-------------|-------|
| **Tools** | ✅ (listChanged) | ✅ (listChanged) | ✅ (listChanged) | ✅ | ✅ (listChanged) |
| **Resources** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Prompts** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Sampling** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Elicitation** | ❌ | ✅ | ✅ (form + url) | ❌ | ❌ |
| **Roots** | ❌ | ✅ | ✅ (listChanged) | ✅ | ❌ |
| **Tasks** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Discovery** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Protocol** | 2025-03-26 | 2025-06-18 | 2025-06-18 | 2025-06-18 | 2025-06-18 |

### 3.2. Impacto no Maestro

| Feature Ausente no Windsurf | Impacto no Maestro |
|---|---|
| **Sampling** | Servidor não pode pedir análises LLM separadas (ex: análise de código em contexto limpo) |
| **Elicitation** | Discovery depende de texto livre → erros de interpretação constantes |
| **Roots** | Servidor não sabe diretórios do workspace → precisa de `diretorio` como parâmetro obrigatório |
| **Tasks** | Sem execução assíncrona → injeção de conteúdo bloqueia até completar |
| **Protocol antigo** | Sem annotations, structuredContent, outputSchema |

---

## 4. Diagnóstico Detalhado — Problemas Identificados

### 4.1. CRÍTICO — Retornos não otimizados para LLMs

**Localização:** Todas as tools em `src/src/tools/`

**Problema:** A interface `ToolResult` retorna blocos `{ type: "text", text: string }` com conteúdo frequentemente sendo JSON serializado ou texto não estruturado. LLMs processam Markdown significativamente melhor que JSON.

```typescript
// Padrão atual em muitas tools (ex: status.ts, contexto.ts)
return {
    content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }],
    // Campos extras que clients MCP IGNORAM:
    estado_atualizado: estadoJson,
    next_action: nextAction,
    specialist_persona: specialist,
    progress: flowProgress,
};
```

**Problemas:**
1. `estado_atualizado`, `next_action`, `specialist_persona`, `progress` são campos **custom** na interface `ToolResult` que **nenhum client MCP padrão processa** — são simplesmente descartados
2. JSON serializado como texto gera erros de parsing pela IA
3. Sem separação entre conteúdo para o **usuário** vs instruções para a **IA**

**Impacto:** 🔴 Alto — Cada chamada de tool perde metadados e força a IA a parsear JSON mentalmente

### 4.2. CRÍTICO — Divergência entre entry points

**Localização:** `src/src/index.ts` vs `src/src/stdio.ts`

**Problema:** Os dois entry points têm implementações completamente diferentes:

| Aspecto | `stdio.ts` | `index.ts` |
|---------|-----------|-----------|
| Resources | Skills + especialistas + templates + guias | Apenas tools como resources (!) |
| Prompts | 3 prompts MCP registrados | Nenhum prompt MCP |
| Tools | Via `router.ts` | Via `router.ts` (OK) |
| Protocol version | Não declarado (SDK default) | `"2024-11-05"` (desatualizado) |
| State service | Carrega via filesystem | Sem state service |

**O `index.ts` expõe tools como resources** em vez de especialistas/templates. Isso é uma regressão significativa.

**Impacto:** 🔴 Alto — Experiência completamente diferente dependendo do transport

### 4.3. ALTO — ToolResult com campos custom ignorados

**Localização:** `src/src/types/index.ts` linhas 175-196

```typescript
export interface ToolResult {
    [x: string]: unknown;  // ← Permite QUALQUER campo
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
    files?: Array<{ path: string; content: string; encoding?: string }>;
    estado_atualizado?: string;
    next_action?: NextAction;
    specialist_persona?: SpecialistPersona;
    progress?: FlowProgress;
}
```

**Problema:** O protocolo MCP define que `tools/call` retorna apenas `content`, `isError` e `structuredContent` (no protocol ≥2025-06-18). Todos os outros campos (`files`, `estado_atualizado`, `next_action`, `specialist_persona`, `progress`) são **silenciosamente descartados** pelo client.

**Impacto:** 🔴 Alto — Metadados valiosos são perdidos em 100% das chamadas

### 4.4. ALTO — Resources passivos no Windsurf

**Problema:** O Windsurf expõe `list_resources` e `read_resource` como tools internas do Cascade, mas **não injeta resources automaticamente** no contexto da conversa. A IA precisa "decidir" chamar `read_resource`, o que raramente acontece espontaneamente.

**Evidência no código:** O `maestro-tool.ts` (linhas 99-112) já tenta mitigar isso com "injeção ativa" — carrega o skill context inline na resposta da tool `maestro`. Mas isso só funciona para a tool `maestro`, não para `status`, `avancar`, etc.

**O middleware `withSkillInjection` é a solução parcial**, mas só é aplicado em tools com `applyMiddlewares` (status, validar, contexto, analisar). As tools `maestro` e `avancar` usam `applyLightMiddlewares` que **não inclui skill injection**.

**Impacto:** 🟡 Médio-Alto — Especialistas e templates são lidos inconsistentemente

### 4.5. MÉDIO — Prompts sub-utilizados

**Problema:** Os 3 prompts MCP (`maestro-specialist`, `maestro-context`, `maestro-template`) estão bem implementados em `stdio.ts`, mas:

1. **Windsurf não tem slash commands** para prompts MCP (VS Code tem `/mcp.maestro.maestro-specialist`)
2. O uso depende da IA "decidir" invocar o prompt, o que é imprevisível
3. **`index.ts` não registra prompts** — clientes HTTP não têm acesso

**Impacto:** 🟡 Médio — Funcionalidade bem construída mas sub-utilizada

### 4.6. MÉDIO — Limite de tools e superfície cognitiva

**Estado atual:** 8 tools públicas + 37 tools legadas = **45 tools no `allToolsMap`**.

Mesmo listando apenas 8, o router aceita chamadas para todas as 45. Se a IA "descobrir" tools legadas via erro ou documentação, pode usar ferramentas não otimizadas.

Combinado com outros MCPs do usuário (filesystem, playwright, memory, snyk = ~50+ tools), o total fica perto do **limite de 100 do Windsurf**.

**Impacto:** 🟡 Médio — Risco de confusão e estouro de limite

### 4.7. MÉDIO — Sem detecção de capabilities do client

**Problema:** O servidor não captura nem adapta comportamento baseado nas capabilities do client. Mesmo o SDK permitindo acessar `params.capabilities` no handshake `initialize`, isso não é feito.

**Impacto:** 🟡 Médio — Comportamento idêntico para todos os clients, perdendo oportunidades de otimização

### 4.8. BAIXO — Content type limitado a texto

**Problema:** Todos os retornos usam `{ type: "text" }`. O MCP suporta:
- `type: "text"` — texto plano
- `type: "image"` — imagens
- `type: "resource"` — referência a resource (resource_link)
- `type: "audio"` — áudio (protocol ≥2025-06-18)

Os `resource_link` seriam particularmente úteis para referenciar especialistas/templates sem incluir o conteúdo completo inline.

**Impacto:** 🟢 Baixo — Funciona, mas não é ótimo

---

## 5. Plano de Melhorias — 4 Níveis

### Nível 1: Funciona AGORA no Windsurf (sem depender de features ausentes)

#### M1.1 — Markdown Estruturado nos Retornos de Tools

**Problema resolvido:** IA parseia JSON bruto com erros → Markdown processado naturalmente

**Implementação:**
- Criar helper `formatToolResponse()` que gera Markdown estruturado
- Migrar progressivamente todas as tools para usar o helper
- Separar dados, instruções e templates em seções Markdown claras

```typescript
// Novo: src/src/utils/response-formatter.ts
export function formatToolResponse(opts: {
    titulo: string;
    resumo: string;
    dados?: Record<string, string>;
    instrucoes?: string;
    template?: string;
    proximo_passo?: { tool: string; descricao: string; args?: string };
}): string {
    let md = `# ${opts.titulo}\n\n${opts.resumo}\n`;
    
    if (opts.dados) {
        md += `\n## Estado\n\n| Campo | Valor |\n|-------|-------|\n`;
        for (const [k, v] of Object.entries(opts.dados)) {
            md += `| **${k}** | ${v} |\n`;
        }
    }
    
    if (opts.instrucoes) {
        md += `\n## Instruções para a IA\n\n${opts.instrucoes}\n`;
    }
    
    if (opts.template) {
        md += `\n## Template do Entregável\n\n${opts.template}\n`;
    }
    
    if (opts.proximo_passo) {
        md += `\n## Próximo Passo\n\n**${opts.proximo_passo.descricao}**\n`;
        md += `\`\`\`\n${opts.proximo_passo.tool}(${opts.proximo_passo.args || ""})\n\`\`\`\n`;
    }
    
    return md;
}
```

**Escopo:** Todas as tools que retornam JSON serializado  
**Esforço:** 🟢 Baixo (2-3 dias)  
**Impacto:** 🔴 Alto

---

#### M1.2 — Múltiplos Content Blocks nos Retornos

**Problema resolvido:** Bloco monolítico dificulta parsing → Blocos separados processados melhor

**Implementação:**
- Cada retorno de tool usa múltiplos blocos `{ type: "text" }` com propósitos diferentes
- Bloco 1: Resumo para o usuário (curto)
- Bloco 2: Dados estruturados (JSON mínimo, se necessário)
- Bloco 3: Instruções para a IA (Markdown)
- Bloco 4: Template/checklist (se aplicável)

```typescript
// Padrão proposto para retornos
return {
    content: [
        // Bloco 1: Resumo para o usuário
        { type: "text", text: "✅ Projeto avançou para fase 4 — Arquitetura" },
        
        // Bloco 2: Instruções para a IA (Markdown rico)
        { type: "text", text: `## Instruções\n\nVocê agora é o **Especialista em Arquitetura**.\n${instrucoes}` },
        
        // Bloco 3: Template do entregável
        { type: "text", text: `## Template\n\n${template}` },
    ],
};
```

**Escopo:** Todas as tools públicas  
**Esforço:** 🟢 Baixo (1-2 dias)  
**Impacto:** 🔴 Alto

---

#### M1.3 — Embutir Metadados no Content (Compensar Campos Custom Ignorados)

**Problema resolvido:** `next_action`, `specialist_persona`, `progress` descartados pelo client

**Implementação:**
- Serializar metadados críticos como seção Markdown dentro do `content`
- Manter campos custom para eventual uso por clients que processem
- Padrão: "Metadata Block" no final da resposta

```typescript
function embedMetadata(content: Array<{type: "text", text: string}>, metadata: {
    next_action?: NextAction;
    progress?: FlowProgress;
}): Array<{type: "text", text: string}> {
    if (!metadata.next_action && !metadata.progress) return content;
    
    let metaBlock = "\n---\n\n## 🤖 Próxima Ação Recomendada\n\n";
    
    if (metadata.next_action) {
        metaBlock += `**Tool:** \`${metadata.next_action.tool}\`\n`;
        metaBlock += `**Descrição:** ${metadata.next_action.description}\n`;
        if (metadata.next_action.requires_user_input) {
            metaBlock += `\n> 👤 ${metadata.next_action.user_prompt}\n`;
        }
    }
    
    if (metadata.progress) {
        metaBlock += `\n**Progresso:** ${metadata.progress.percentage}%\n`;
    }
    
    return [...content, { type: "text", text: metaBlock }];
}
```

**Escopo:** `ToolResult` e todas as tools que usam `next_action`  
**Esforço:** 🟢 Baixo (1 dia)  
**Impacto:** 🟡 Médio-Alto

---

#### M1.4 — Resource Links nos Retornos de Tools

**Problema resolvido:** Resources passivos → referência explícita nos retornos

**Implementação:**
- Onde uma tool referencia especialista/template, incluir `resource_link` no content
- Isso "sugere" ao client/IA que leia o resource

```typescript
// Usar type "resource" (MCP SDK suporta)
return {
    content: [
        { type: "text", text: "## Fase 4: Arquitetura\n\nLeia os recursos abaixo:" },
        {
            type: "resource",
            resource: {
                uri: "maestro://skills/architecture/SKILL.md",
                text: await lerSkill("architecture"),
                mimeType: "text/markdown",
            }
        },
    ],
};
```

**Nota:** Se o client não suportar `type: "resource"`, fallback para texto inline. Verificar suporte no protocol version.

**Escopo:** Tools que referenciam especialistas/templates  
**Esforço:** 🟡 Médio (2-3 dias)  
**Impacto:** 🟡 Médio

---

#### M1.5 — Unificar Entry Points (Eliminar Divergência)

**Problema resolvido:** `index.ts` e `stdio.ts` com comportamentos diferentes

**Implementação:**
- Extrair lógica compartilhada de resources, prompts e tools para módulos reutilizáveis
- `stdio.ts` e `index.ts` importam do mesmo módulo
- Garantir que HTTP expõe mesmos resources/prompts que stdio

```
src/src/
├── handlers/
│   ├── resources.handler.ts   ← Lógica unificada de resources
│   ├── prompts.handler.ts     ← Lógica unificada de prompts
│   └── tools.handler.ts       ← Já existe no router.ts
├── stdio.ts                   ← Usa handlers/
├── index.ts                   ← Usa handlers/
└── router.ts                  ← Mantém
```

**Escopo:** Refatoração de `index.ts` e `stdio.ts`  
**Esforço:** 🟡 Médio (3-4 dias)  
**Impacto:** 🔴 Alto

---

#### M1.6 — Otimização do System Prompt via Resource

**Problema resolvido:** System prompt estático → dinâmico baseado no estado do projeto

**Implementação:**
- O resource `maestro://system-prompt` já existe mas é estático
- Torná-lo dinâmico: detectar se tem projeto, qual fase, e adaptar instruções
- Incluir mapa de tools atualizado e fluxo obrigatório contextualizado

**Escopo:** `resources/index.ts` e `stdio.ts`  
**Esforço:** 🟢 Baixo (1 dia)  
**Impacto:** 🟡 Médio

---

### Nível 2: Detecção de Capabilities (adapta por IDE)

#### M2.1 — Client Capability Detection

**Problema resolvido:** Comportamento idêntico para todos os clients

**Implementação:**

```typescript
// Novo: src/src/services/client-capabilities.service.ts

interface ClientCapabilities {
    hasElicitation: boolean;
    hasSampling: boolean;
    hasRoots: boolean;
    hasTasks: boolean;
    hasAnnotations: boolean;  // protocol >= 2025-06-18
    hasStructuredContent: boolean;
    clientName: string;
    protocolVersion: string;
}

let currentCapabilities: ClientCapabilities = {
    hasElicitation: false,
    hasSampling: false,
    hasRoots: false,
    hasTasks: false,
    hasAnnotations: false,
    hasStructuredContent: false,
    clientName: "unknown",
    protocolVersion: "2024-11-05",
};

export function captureClientCapabilities(params: any): void {
    currentCapabilities = {
        hasElicitation: !!params.capabilities?.elicitation,
        hasSampling: !!params.capabilities?.sampling,
        hasRoots: !!params.capabilities?.roots,
        hasTasks: !!params.capabilities?.tasks,
        hasAnnotations: params.protocolVersion >= "2025-06-18",
        hasStructuredContent: params.protocolVersion >= "2025-06-18",
        clientName: params.clientInfo?.name || "unknown",
        protocolVersion: params.protocolVersion || "2024-11-05",
    };
}

export function getClientCapabilities(): ClientCapabilities {
    return currentCapabilities;
}

export function clientSupports(feature: keyof ClientCapabilities): boolean {
    return !!currentCapabilities[feature];
}
```

**Integração:** Hook no Server SDK `onInitialize` ou no handler `initialize` do `index.ts`.

**Escopo:** Novo serviço + integração nos entry points  
**Esforço:** 🟡 Médio (2 dias)  
**Impacto:** 🔴 Alto (habilita toda a adaptação condicional)

---

#### M2.2 — Fallback Inteligente para Elicitation

**Problema resolvido:** Discovery coleta dados via texto livre → erros de interpretação

**Implementação:**
- Se client suporta Elicitation → formulário nativo (schema JSON)
- Se não → retornar perguntas estruturadas em Markdown com opções claras
- Validar respostas do Markdown com regex pattern matching

```typescript
async function coletarDadosProjeto(args: any): Promise<ToolResult> {
    const caps = getClientCapabilities();
    
    if (caps.hasElicitation) {
        // VS Code / Cursor: formulário nativo
        return requestElicitation({
            message: "Configuração do projeto",
            schema: {
                type: "object",
                properties: {
                    nome: { type: "string", title: "Nome do projeto" },
                    complexidade: { type: "string", enum: ["simples", "medio", "complexo"] },
                    tipo: { type: "string", enum: ["poc", "script", "internal", "product"] },
                },
                required: ["nome"],
            },
        });
    }
    
    // Windsurf: Markdown estruturado com opções claras
    return {
        content: [{
            type: "text",
            text: `## 📋 Discovery — Informações do Projeto

Responda as perguntas abaixo (copie e preencha):

**1. Nome do projeto:**
> _[digite aqui]_

**2. Complexidade:** (escolha uma)
- \`simples\` — Script ou POC, < 5 arquivos
- \`medio\` — App com 5-20 arquivos, 2-3 módulos
- \`complexo\` — Sistema com 20+ arquivos, múltiplos módulos

**3. Tipo de artefato:** (escolha um)
- \`poc\` — Prova de conceito
- \`script\` — Automação/utilitário
- \`internal\` — Ferramenta interna
- \`product\` — Produto para usuários finais

> Após responder, chame \`maestro\` com os dados coletados.`,
        }],
    };
}
```

**Escopo:** Tools de discovery e onboarding  
**Esforço:** 🟡 Médio (2-3 dias)  
**Impacto:** 🟡 Médio

---

#### M2.3 — Fallback Inteligente para Sampling

**Problema resolvido:** Sem chamadas LLM separadas para análise

**Implementação:**
- Se client suporta Sampling → delegação LLM com contexto limpo
- Se não → retornar checklists estruturados para a IA avaliar inline

```typescript
async function analisarCodigoAdaptivo(codigo: string, tipo: string): Promise<ToolResult> {
    const caps = getClientCapabilities();
    
    if (caps.hasSampling) {
        // VS Code: chamada LLM separada
        const analise = await requestSampling({
            messages: [{
                role: "user",
                content: `Analise este código focando em ${tipo}:\n\`\`\`\n${codigo}\n\`\`\``,
            }],
            maxTokens: 2000,
            modelPreferences: { intelligencePriority: 0.9 },
        });
        return { content: [{ type: "text", text: analise.content }] };
    }
    
    // Windsurf: checklist inline
    return {
        content: [{
            type: "text",
            text: `## 🔍 Análise de ${tipo}

Avalie o código abaixo usando esta checklist:

${getChecklistPorTipo(tipo)}

### Código para análise:
\`\`\`
${codigo.substring(0, 3000)}
\`\`\`

> Avalie cada item e forneça score de 0-10.`,
        }],
    };
}
```

**Escopo:** Tools de análise (`analisar_seguranca`, `analisar_qualidade`, etc.)  
**Esforço:** 🟡 Médio (2 dias)  
**Impacto:** 🟡 Médio

---

#### M2.4 — Annotations com Fallback

**Problema resolvido:** Retornos não separam conteúdo IA vs usuário

**Implementação:**
- Se protocol ≥ 2025-06-18 → usar annotations com `audience` e `priority`
- Se protocol antigo → usar convenções Markdown (seções separadas)

```typescript
function buildAnnotatedContent(
    userContent: string,
    aiInstructions: string,
    caps: ClientCapabilities
): Array<{type: "text", text: string, annotations?: any}> {
    if (caps.hasAnnotations) {
        return [
            { 
                type: "text", 
                text: userContent,
                annotations: { audience: ["user"], priority: 1 },
            },
            {
                type: "text",
                text: aiInstructions,
                annotations: { audience: ["assistant"], priority: 0.8 },
            },
        ];
    }
    
    // Fallback: seções Markdown separadas
    return [
        { type: "text", text: userContent },
        { type: "text", text: `\n---\n\n## 🤖 Instruções Internas\n\n${aiInstructions}` },
    ];
}
```

**Escopo:** Todos os retornos de tools  
**Esforço:** 🟡 Médio (2 dias)  
**Impacto:** 🔴 Alto (quando IDEs atualizarem)

---

### Nível 3: Melhorias Adicionais (Identificadas na Análise de Código)

#### M3.1 — Consolidação Agressiva de Tools (8 → 5)

**Problema resolvido:** 8 tools ainda é muito para o orquestrador. Reduzir superfície cognitiva.

**Proposta:**

```
ATUAL (8 tools):
  maestro, avancar, status, validar, contexto, salvar, checkpoint, analisar

PROPOSTA (5 tools + resources):
  maestro      → Entry point (subsume status quando chamado sem ação)
  executar     → Unifica: avancar + salvar + checkpoint (via parâmetro "acao")
  validar      → Mantém (gate, entregável, compliance)
  analisar     → Mantém (segurança, qualidade, performance)
  contexto     → Mantém (ADRs, padrões, knowledge base)
  
  + Resources para: status detalhado, templates, especialistas
  + Prompts para: sessão de trabalho
```

**Lógica do `executar`:**
```typescript
switch (args.acao) {
    case "avancar":    return avancar(args);
    case "salvar":     return salvar(args);
    case "checkpoint": return checkpoint(args);
    case "rollback":   return checkpoint({...args, acao: "rollback"});
    default:           return avancar(args); // default: avançar
}
```

**Escopo:** Refatoração do router + nova tool consolidada  
**Esforço:** 🟡 Médio (3-4 dias)  
**Impacto:** 🔴 Alto

---

#### M3.2 — Injeção Ativa de Skills em TODAS as Tools

**Problema resolvido:** Apenas tools com `applyMiddlewares` recebem skill injection

**Implementação:**
- `avancar` e `maestro` usam `applyLightMiddlewares` (sem skill injection)
- Criar `applySmartMiddlewares` que injeta skill apenas quando relevante
- Ou: mover skill injection para dentro das tools `maestro` e `avancar` com lógica customizada

**Escopo:** Middleware pipeline  
**Esforço:** 🟢 Baixo (1 dia)  
**Impacto:** 🟡 Médio-Alto

---

#### M3.3 — Cache de Skills/Resources em Memória

**Problema resolvido:** Cada chamada de tool que precisa de skill re-lê do filesystem

**Implementação:**
```typescript
// Novo: src/src/services/skill-cache.service.ts
const skillCache = new Map<string, { content: string; loadedAt: number }>();
const TTL = 60 * 60 * 1000; // 1h

export function getCachedSkill(key: string): string | null {
    const cached = skillCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.loadedAt > TTL) {
        skillCache.delete(key);
        return null;
    }
    return cached.content;
}
```

**Escopo:** `SkillLoaderService` e `ContentResolverService`  
**Esforço:** 🟢 Baixo (1 dia)  
**Impacto:** 🟡 Médio (performance)

---

#### M3.4 — Prompt MCP para Sessão Completa

**Problema resolvido:** Prompts atuais são fragmentados (specialist, context, template separados)

**Implementação:**
- Novo prompt `maestro-sessao` que combina specialist + context + template + tools disponíveis
- Gera system prompt completo para uma sessão de trabalho

```typescript
{
    name: "maestro-sessao",
    description: "Contexto completo para sessão de trabalho (specialist + context + template + tools)",
    arguments: [{ name: "diretorio", required: true }],
}
```

**Escopo:** Novo prompt em `stdio.ts`  
**Esforço:** 🟢 Baixo (1 dia)  
**Impacto:** 🟡 Médio

---

#### M3.5 — Deprecation Path para Tools Legadas

**Problema resolvido:** 37 tools legadas aceitam chamadas mas sem otimização

**Implementação:**
- Adicionar log de warning quando legacy tool é chamada
- Retornar dica de redirecionamento na resposta
- Roadmap: remover legadas na v6

```typescript
// No routeToolCall, se tool for legacy:
if (legacyToolNames.has(name)) {
    console.warn(`[DEPRECATED] Tool '${name}' é legada. Redirecionamento recomendado.`);
    const result = await tool.handler(rawArgs);
    // Adicionar nota de deprecation no retorno
    result.content.push({
        type: "text",
        text: `\n> ⚠️ **Nota:** A tool \`${name}\` é legada. Use \`${getRedirect(name)}\` como alternativa consolidada.`,
    });
    return result;
}
```

**Escopo:** `router.ts`  
**Esforço:** 🟢 Baixo (0.5 dia)  
**Impacto:** 🟢 Baixo (qualidade de manutenção)

---

#### M3.6 — Structured Content com Fallback

**Problema resolvido:** Preparar para `outputSchema` e `structuredContent` (protocol ≥2025-06-18)

**Implementação:**
- Definir `outputSchema` nas tools que retornam dados estruturados
- Retornar `structuredContent` + `content` (texto) simultaneamente
- Clients antigos usam `content`, novos usam `structuredContent`

```typescript
// Tool com outputSchema
{
    name: "status",
    description: "Status completo do projeto",
    inputSchema: statusSchema,
    outputSchema: {
        type: "object",
        properties: {
            projeto: { type: "string" },
            fase_atual: { type: "number" },
            total_fases: { type: "number" },
            progresso_percentual: { type: "number" },
            proximo_passo: { type: "string" },
        },
    },
}

// Retorno dual
return {
    content: [{ type: "text", text: markdownFormatted }],
    structuredContent: {
        projeto: estado.nome,
        fase_atual: estado.fase_atual,
        total_fases: estado.total_fases,
        progresso_percentual: progress.percentage,
        proximo_passo: nextStep.description,
    },
};
```

**Escopo:** Todas as tools com dados estruturados  
**Esforço:** 🟡 Médio (3-4 dias)  
**Impacto:** 🔴 Alto (futuro)

---

### Nível 4: Melhorias Futuras (Quando IDEs Atualizarem)

#### M4.1 — MCP Tasks para Operações Longas

**Quando:** Windsurf suportar Tasks  
**O que muda:** Injeção de conteúdo e análises pesadas podem ser assíncronas com polling de progresso

#### M4.2 — Roots para Auto-detecção de Diretório

**Quando:** Windsurf suportar Roots  
**O que muda:** Elimina parâmetro `diretorio` obrigatório — servidor recebe diretórios do workspace automaticamente

#### M4.3 — MCP Apps para UI Interativa

**Quando:** VS Code MCP Apps se estabilizar  
**O que muda:** Dashboard visual, formulários de discovery, gráficos de progresso direto no chat

#### M4.4 — Elicitation Nativa

**Quando:** Windsurf suportar Elicitation  
**O que muda:** Discovery via formulário nativo, eliminando erros de interpretação de texto livre

---

## 6. Melhorias Adicionais Identificadas na Análise de Código

### 6.1. Protocol Version Mismatch

**Arquivo:** `src/src/index.ts` linha 297  
**Problema:** `protocolVersion: "2024-11-05"` — muito desatualizado  
**Fix:** Atualizar para `"2025-03-26"` (compatível com Windsurf) ou `"2025-06-18"` (mais recente)

### 6.2. Server Version Mismatch

**Arquivos:** `index.ts` (linhas 39, 50, 298) e `stdio.ts` (linha 48)  
**Problema:** Múltiplas versões declaradas: `"3.0.0"`, `"4.0.0"`, `"5.0.0"`  
**Fix:** Unificar para `"5.0.0"` e extrair para constante

### 6.3. Index.ts Resources Incorretos

**Arquivo:** `src/src/index.ts` linhas 357-369  
**Problema:** `getResourcesList()` expõe tools como resources em vez de especialistas/templates  
**Fix:** Alinhar com `stdio.ts` — expor skills, especialistas, templates, guias

### 6.4. Limpeza de Imports Não Usados

**Arquivo:** `src/src/tools/index.ts`  
**Problema:** Este arquivo é uma versão anterior do router, com 411 linhas duplicando lógica do `router.ts`  
**Fix:** Verificar se ainda é usado. Se `server.ts` usa, migrar para usar `router.ts`

### 6.5. Tipo ToolResult Permissivo

**Arquivo:** `src/src/types/index.ts` linha 176  
**Problema:** `[x: string]: unknown` permite qualquer campo, sem type safety  
**Fix:** Remover index signature e usar tipos explícitos

### 6.6. Error Handling Inconsistente

**Problema:** Algumas tools retornam `isError: true`, outras lançam exceções capturadas pelo middleware  
**Fix:** Padronizar — todas as tools retornam `ToolResult` (nunca lançam); middleware `withErrorHandling` é a rede de segurança

---

## 7. Matriz de Priorização Final

| # | Melhoria | Windsurf? | Impacto | Esforço | Sprint |
|---|----------|-----------|---------|---------|--------|
| M1.1 | Markdown estruturado | ✅ | 🔴 Alto | 🟢 Baixo | 1 |
| M1.2 | Múltiplos content blocks | ✅ | 🔴 Alto | 🟢 Baixo | 1 |
| M1.3 | Embutir metadados no content | ✅ | 🟡 Médio | 🟢 Baixo | 1 |
| M1.5 | Unificar entry points | ✅ | 🔴 Alto | 🟡 Médio | 1-2 |
| 6.1 | Fix protocol version | ✅ | 🟡 Médio | 🟢 Mínimo | 1 |
| 6.2 | Fix server version | ✅ | 🟢 Baixo | 🟢 Mínimo | 1 |
| 6.3 | Fix resources do index.ts | ✅ | 🔴 Alto | 🟢 Baixo | 1 |
| M2.1 | Client capability detection | ✅ | 🔴 Alto | 🟡 Médio | 2 |
| M3.1 | Consolidar 8→5 tools | ✅ | 🔴 Alto | 🟡 Médio | 2 |
| M3.2 | Skill injection em todas tools | ✅ | 🟡 Médio | 🟢 Baixo | 2 |
| M3.3 | Cache de skills | ✅ | 🟡 Médio | 🟢 Baixo | 2 |
| M1.4 | Resource links nos retornos | ✅ | 🟡 Médio | 🟡 Médio | 2 |
| M2.2 | Fallback elicitation | ✅ | 🟡 Médio | 🟡 Médio | 3 |
| M2.3 | Fallback sampling | ✅ | 🟡 Médio | 🟡 Médio | 3 |
| M2.4 | Annotations com fallback | ✅ (prep) | 🔴 Alto | 🟡 Médio | 3 |
| M3.4 | Prompt sessão completa | ✅ | 🟡 Médio | 🟢 Baixo | 3 |
| M3.5 | Deprecation path legadas | ✅ | 🟢 Baixo | 🟢 Baixo | 3 |
| M3.6 | Structured content + fallback | ✅ (prep) | 🔴 Alto | 🟡 Médio | 4 |
| M1.6 | System prompt dinâmico | ✅ | 🟡 Médio | 🟢 Baixo | 2 |
| 6.4 | Limpeza tools/index.ts | ✅ | 🟢 Baixo | 🟢 Baixo | 4 |
| 6.5 | Fix tipo ToolResult | ✅ | 🟢 Baixo | 🟢 Baixo | 4 |
| 6.6 | Padronizar error handling | ✅ | 🟡 Médio | 🟡 Médio | 4 |

---

## 8. Métricas de Sucesso

### Quantitativas
- **Redução de tools públicas:** 8 → 5 (37% menos superfície)
- **Redução de tools totais expostas:** 8 → 5 (legacy aceitas mas não listadas)
- **Cobertura de skill injection:** 100% das tools públicas (atual: ~60%)
- **Content blocks por resposta:** avg 3-4 (atual: 1)

### Qualitativas
- **Consistência cross-IDE:** Mesmo comportamento em stdio e HTTP
- **Adaptação por client:** Respostas otimizadas para Windsurf, Cursor e VS Code
- **Preparação futura:** Annotations e structuredContent prontos com fallback
- **Manutenibilidade:** Path claro de deprecation para legacy tools

### Mensuráveis
- **Erro de parsing da IA:** Reduzir ocorrências de "JSON malformado" em respostas
- **Leituras de resources:** Aumentar taxa de leitura de especialistas/templates via resource_link
- **Tempo médio de sessão:** Reduzir número de chamadas de tool necessárias por fase

---

> **Próximo passo:** Ver [ROADMAP_IMPLEMENTACAO_MELHORIAS_MCP.md](./ROADMAP_IMPLEMENTACAO_MELHORIAS_MCP.md) para o plano de execução detalhado com fases, tasks e critérios de aceitação.
