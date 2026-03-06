# Sprint 2: Simplification (v6.0) — Guia de Implementação Detalhado

**Objetivo:** Unificar entry points, remover legado, decompor god files  
**Duração estimada:** 3-4 semanas  
**Pré-requisito:** Sprint 1 concluído (tipagem de onboarding, bugs corrigidos)  
**Resultado esperado:** Codebase 40% menor, zero tools legadas, módulos <300 linhas

---

## REGRAS PARA A IA EXECUTORA

1. **Execute uma task por vez**, na ordem listada
2. **Após cada task**, rode `npx tsc --noEmit` e `npm test`
3. **Se o build quebrar**, reverta a mudança e reporte o erro
4. **NUNCA delete código sem antes verificar** que não é referenciado em outro lugar
5. **Crie migration guide** para cada breaking change
6. **Cada arquivo novo deve ter <300 linhas**

---

## Task 2.1 — Criar `server.ts` (Entry Point Unificado) [ERRO-001]

### Contexto
Existem 2 entry points divergentes:
- `src/src/stdio.ts` (113 linhas) — usa SDK MCP oficial com `Server` + `StdioServerTransport`
- `src/src/index.ts` (401 linhas) — reimplementa JSON-RPC manualmente com Express + SSE

O objetivo é extrair toda a lógica compartilhada (handlers de resources, tools, prompts) para um `server.ts` factory, e manter os entry points como meros conectores de transporte (~15 linhas cada).

### Passo 1: Criar `src/src/server.ts`

**Arquivo NOVO:** `src/src/server.ts`

```typescript
/**
 * Factory de servidor MCP do Maestro
 * 
 * Cria e configura um Server MCP com todos os handlers registrados.
 * Usado por stdio.ts e http.ts como entry points de transporte.
 * 
 * @since v6.0 — Unificação de entry points
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { routeToolCall, getRegisteredTools, getToolCount } from "./router.js";
import { MAESTRO_NAME, MAESTRO_VERSION } from "./constants.js";
import { captureClientCapabilities } from "./services/client-capabilities.service.js";
import { listPrompts, getPrompt } from "./handlers/shared-prompt-handler.js";
import { listResources, readResource } from "./handlers/shared-resource-handler.js";
import { setProjectDirectory } from "./utils/files.js";

/**
 * Cria e configura um servidor MCP do Maestro com todos os handlers.
 * 
 * @param projectDir - Diretório base do projeto (de argv ou cwd)
 * @returns Server MCP configurado, pronto para conectar a um transport
 */
export function createMaestroServer(projectDir: string): Server {
    // Configurar diretório padrão para as tools
    setProjectDirectory(projectDir);

    const server = new Server(
        { name: MAESTRO_NAME, version: MAESTRO_VERSION },
        { capabilities: { resources: {}, tools: {}, prompts: {} } }
    );

    // === RESOURCES ===
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return await listResources({ projectDir, includeSkills: true });
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        return await readResource(uri, { projectDir });
    });

    // === PROMPTS ===
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return listPrompts();
    });

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: promptArgs } = request.params;
        const diretorio = (promptArgs as Record<string, unknown>)?.diretorio as string || projectDir;
        return await getPrompt(name, diretorio);
    });

    // === TOOLS ===
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getRegisteredTools(),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const rawArgs = (args as Record<string, unknown>) || {};
        return await routeToolCall(name, rawArgs);
    });

    // === CLIENT CAPABILITIES ===
    server.oninitialized = () => {
        const clientCaps = server.getClientCapabilities();
        const clientVersion = server.getClientVersion();
        captureClientCapabilities({
            capabilities: clientCaps || {},
            clientInfo: clientVersion || {},
            protocolVersion: "2025-03-26",
        });
        console.error(`[MCP] Client detectado: ${clientVersion?.name || "unknown"} v${clientVersion?.version || "?"}`);
    };

    return server;
}

/**
 * Retorna informações de inicialização para logging.
 */
export function getStartupInfo(projectDir: string): string {
    return `MCP Maestro v${MAESTRO_VERSION} — ${getToolCount()} tools públicas | Dir: ${projectDir}`;
}
```

### Passo 2: Refatorar `stdio.ts` para usar `server.ts`

**Arquivo:** `src/src/stdio.ts`

**Conteúdo NOVO completo (substitui todo o arquivo):**

```typescript
#!/usr/bin/env node
/**
 * Entry point STDIO — usado por IDEs (Windsurf, Cursor, etc.)
 * 
 * Usa o factory createMaestroServer() e conecta via StdioServerTransport.
 * Toda lógica de handlers está em server.ts.
 * 
 * @since v6.0 — Unificado com server.ts
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMaestroServer, getStartupInfo } from "./server.js";

const projectsDir = process.argv[2] || process.cwd();
const server = createMaestroServer(projectsDir);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[STDIO] ${getStartupInfo(projectsDir)}`);
}

main().catch(console.error);
```

### Passo 3: NÃO modificar `index.ts` agora

O `index.ts` (HTTP/SSE) será refatorado na Task 2.3. Por agora, ele continua funcionando como está. A unificação é incremental.

### Teste de verificação

```bash
cd src
npx tsc --noEmit

# Teste funcional: verificar que o STDIO ainda inicia
node dist/stdio.js --help 2>&1 | head -5
# Deve iniciar sem erros (e travar esperando STDIO — isso é normal)
# Cancelar com Ctrl+C
```

### Teste unitário

```typescript
// src/src/__tests__/server-factory.test.ts
import { describe, it, expect } from 'vitest';
import { createMaestroServer, getStartupInfo } from '../server.js';

describe('createMaestroServer', () => {
    it('retorna um Server MCP válido', () => {
        const server = createMaestroServer('/tmp/test');
        expect(server).toBeDefined();
        // Server do SDK MCP tem método connect
        expect(typeof server.connect).toBe('function');
    });

    it('getStartupInfo inclui versão e contagem de tools', () => {
        const info = getStartupInfo('/tmp/test');
        expect(info).toContain('Maestro');
        expect(info).toContain('tools públicas');
    });
});
```

### Rollback
1. Remover `src/src/server.ts`
2. Restaurar `src/src/stdio.ts` original (git checkout)

---

## Task 2.2 — Isolar Express como Opcional [ERRO-009]

### Contexto
`express` e `cors` estão em `devDependencies`, mas `index.ts` os importa. Se o build incluir `index.ts`, falha em produção. A solução é excluir `index.ts` do build principal.

### Passo 1: Criar `tsconfig.stdio.json` (build de produção)

**Arquivo NOVO:** `src/tsconfig.stdio.json`

```json
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "outDir": "./dist"
    },
    "exclude": [
        "src/index.ts",
        "src/**/*.test.ts",
        "src/**/__tests__/**"
    ]
}
```

### Passo 2: Atualizar scripts no `package.json`

**Arquivo:** `src/package.json` — seção `scripts`

**ANTES:**
```json
"scripts": {
    "build": "tsc",
    "dev": "tsx watch src/stdio.ts",
    "dev:http": "tsx watch src/index.ts",
    "start": "node dist/stdio.js",
    "start:http": "node dist/index.js",
```

**DEPOIS:**
```json
"scripts": {
    "build": "tsc -p tsconfig.stdio.json",
    "build:all": "tsc",
    "dev": "tsx watch src/stdio.ts",
    "dev:http": "tsx watch src/index.ts",
    "start": "node dist/stdio.js",
    "start:http": "node dist/index.js",
```

Assim, `npm run build` gera apenas o entry point STDIO (sem express), e `npm run build:all` gera tudo (para desenvolvimento local).

### Teste de verificação

```bash
cd src
npm run build
# Deve compilar sem erros e sem dist/index.js

ls dist/index.js 2>/dev/null && echo "FALHA: index.js não deveria existir" || echo "OK: index.js excluído"
ls dist/stdio.js && echo "OK: stdio.js existe"
```

### Rollback
1. Remover `tsconfig.stdio.json`
2. Reverter `package.json` scripts

---

## Task 2.3 — Refatorar `index.ts` para usar SDK MCP [ERRO-001 parte 2]

### Contexto
O `index.ts` reimplementa JSON-RPC manualmente (401 linhas). O SDK MCP oferece `StreamableHTTPServerTransport` que faz isso automaticamente. Esta task substitui toda a implementação manual pelo transport do SDK.

### ATENÇÃO — Verificar antes de implementar
```bash
cd src
# Verificar se StreamableHTTPServerTransport existe no SDK instalado
node -e "const m = require('@modelcontextprotocol/sdk/server/streamableHttp.js'); console.log(Object.keys(m))"
```

Se o import falhar, o SDK `^1.25.3` pode não ter esse transport. Nesse caso:
- **Alternativa A:** Atualizar SDK para versão que inclua
- **Alternativa B:** Manter `index.ts` como está e marcar como "dev-only"

### Se StreamableHTTPServerTransport EXISTIR:

**Arquivo:** `src/src/index.ts` — SUBSTITUIR conteúdo completo:

```typescript
#!/usr/bin/env node
/**
 * Entry point HTTP/SSE — usado para testes e clients não-STDIO
 * 
 * NÃO incluído no build de produção (npm run build).
 * Apenas para desenvolvimento local (npm run dev:http).
 * 
 * @since v6.0 — Unificado com server.ts + StreamableHTTPServerTransport
 */
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMaestroServer, getStartupInfo } from "./server.js";
import { MAESTRO_VERSION } from "./constants.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const projectsDir = process.argv[2] || process.cwd();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", server: "mcp-maestro", version: MAESTRO_VERSION });
});

// Info
app.get("/", (req, res) => {
    res.json({
        name: "MCP Maestro",
        version: MAESTRO_VERSION,
        description: "MCP server for Maestro development guide",
        transport: "streamable-http",
        endpoint: "/mcp",
    });
});

// MCP endpoint via StreamableHTTPServerTransport
const server = createMaestroServer(projectsDir);
const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
});

// Conectar transport ao servidor
app.all("/mcp", transport.handleRequest());

async function main() {
    await server.connect(transport);
    app.listen(PORT, () => {
        console.log(`[HTTP] ${getStartupInfo(projectsDir)}`);
        console.log(`[HTTP] Listening on http://localhost:${PORT}`);
    });
}

main().catch(console.error);
```

**Resultado:** De 401 linhas para ~50 linhas. Zero implementação JSON-RPC manual.

### Se StreamableHTTPServerTransport NÃO EXISTIR:

Não alterar `index.ts`. Apenas adicionar comentário no topo:

```typescript
/**
 * ⚠️ DEPRECATED — Entry point HTTP/SSE legado
 * 
 * Este arquivo reimplementa JSON-RPC manualmente.
 * Será substituído por StreamableHTTPServerTransport quando o SDK for atualizado.
 * NÃO incluído no build de produção (npm run build).
 */
```

### Teste de verificação

```bash
cd src
npm run build:all
# Deve compilar sem erros

# Teste funcional (se HTTP funciona):
timeout 5 node dist/index.js &
sleep 2
curl http://localhost:3000/health
# Esperado: {"status":"ok","server":"mcp-maestro","version":"5.5.3"}
kill %1
```

### Rollback
Restaurar `index.ts` original (git checkout).

---

## Task 2.4 — Remover Delegação maestro→executar [ERRO-007]

### Contexto
O `maestroToolSchema` inclui `"avancar"` como ação válida. Isso cria loop circular: maestro→executar→maestro. A IA deveria usar `executar` diretamente para avançar.

### Arquivo a modificar
`src/src/tools/maestro-tool.ts` — linhas 480-484

### Código ANTES
```typescript
        acao: {
            type: "string",
            description: "Ação específica a executar (opcional)",
            enum: ["setup_inicial", "criar_projeto", "avancar"],
        },
```

### Código DEPOIS
```typescript
        acao: {
            type: "string",
            description: "Ação específica a executar (opcional)",
            enum: ["setup_inicial", "criar_projeto"],
        },
```

### Também remover o handler de "avancar" no corpo da função

Buscar no `maestro-tool.ts` o bloco que lida com `acao === "avancar"` e removê-lo ou transformá-lo em erro informativo:

**Buscar:** trecho que importa `executar` e delega quando `acao === "avancar"`

**Substituir por:**
```typescript
    if (args.acao === "avancar") {
        return {
            content: [{
                type: "text",
                text: `# ❌ Ação Incorreta

\`maestro\` não aceita mais \`acao: "avancar"\`.

Use \`executar\` diretamente:
\`\`\`json
executar({ "diretorio": "${diretorio}", "acao": "avancar" })
\`\`\`
`,
            }],
            isError: true,
        };
    }
```

### Teste de verificação

```bash
cd src
npx tsc --noEmit
npm test
```

### Teste unitário

```typescript
// Adicionar em src/src/__tests__/maestro-tool-flow.test.ts
it('rejeita acao=avancar com mensagem de redirect', async () => {
    const { maestroTool } = await import('../tools/maestro-tool.js');
    const result = await maestroTool({ diretorio: '/tmp/test', acao: 'avancar' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('executar');
});
```

### Rollback
Restaurar `"avancar"` no enum e o handler de delegação.

---

## Task 2.5 — Mover Tools Legadas para Arquivo Separado

### Contexto
O `router.ts` tem 614 linhas. 294 linhas (linhas 199-493) são definições de 37 tools legadas. Movê-las para `legacy-tools.ts` reduz o router para ~320 linhas.

### Passo 1: Criar `src/src/legacy-tools.ts`

**Arquivo NOVO:** `src/src/legacy-tools.ts`

Copiar:
1. Os imports de tools legadas de `router.ts` (linhas 26-99, apenas os usados por legacyTools)
2. O array `legacyTools` inteiro (linhas 199-493)
3. O objeto `legacyRedirects` (linhas 508-538)
4. Exportar tudo

```typescript
/**
 * Tools Legadas do Maestro MCP
 * 
 * Estas tools são aceitas pelo router para backward compatibility,
 * mas NÃO são listadas para a IA. Cada chamada adiciona deprecation warning.
 * 
 * Serão removidas completamente na v7.0.
 * 
 * @deprecated v6.0 — Use as 5 tools públicas (maestro, executar, validar, analisar, contexto)
 */

import type { ToolResult } from "./types/index.js";
import {
    applyMiddlewares,
    applySmartMiddlewares,
    applyPersistenceMiddlewares
} from "./middleware/index.js";

// ... (copiar imports necessários de router.ts)

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

// Copiar o array legacyTools completo de router.ts linhas 199-493
export const legacyTools: ToolDefinition[] = [
    // ... (colar conteúdo de router.ts linhas 199-493)
];

// Copiar o objeto legacyRedirects de router.ts linhas 508-538
export const legacyRedirects: Record<string, string> = {
    // ... (colar conteúdo de router.ts linhas 508-538)
};
```

### Passo 2: Refatorar `router.ts` para importar de `legacy-tools.ts`

**No `router.ts`:**

1. **Remover** todos os imports usados apenas por tools legadas (linhas 26-99, verificar individualmente)
2. **Remover** o array `legacyTools` (linhas 199-493)
3. **Remover** o objeto `legacyRedirects` (linhas 508-538)
4. **Adicionar** import:

```typescript
import { legacyTools, legacyRedirects } from "./legacy-tools.js";
```

5. **Manter** o `allToolsMap`, `routeToolCall`, `getRegisteredTools` etc. sem mudanças

### Resultado esperado
- `router.ts`: ~200 linhas (imports + 5 public tools + API pública)
- `legacy-tools.ts`: ~350 linhas (imports + 37 legacy tools + redirects)

### Teste de verificação

```bash
cd src
npx tsc --noEmit
npm test

# Verificar que routing ainda funciona para tools legadas:
# (teste manual ou unitário)
```

### Teste unitário

```typescript
// src/src/__tests__/router.test.ts
import { describe, it, expect } from 'vitest';
import { getRegisteredTools, getTotalToolCount } from '../router.js';

describe('Router', () => {
    it('retorna apenas 5 tools públicas', () => {
        const tools = getRegisteredTools();
        expect(tools.length).toBe(5);
        const names = tools.map(t => t.name);
        expect(names).toContain('maestro');
        expect(names).toContain('executar');
        expect(names).toContain('validar');
        expect(names).toContain('analisar');
        expect(names).toContain('contexto');
    });

    it('total de tools inclui legadas', () => {
        const total = getTotalToolCount();
        expect(total).toBeGreaterThan(5); // 5 públicas + N legadas
    });
});
```

### Rollback
1. Remover `legacy-tools.ts`
2. Restaurar `router.ts` original (git checkout)

---

## Task 2.6 — Migrar Middlewares Deprecated [ERRO-011]

### Contexto
4 funções de middleware estão deprecated em `middleware/index.ts`:
- `applyMiddlewares` (usada por tool `status`)
- `applySmartMiddlewares` (usada por tool `avancar`)
- `applyPersistenceMiddlewares` (usada por tools `salvar`, `checkpoint`)
- `applyLightMiddlewares` (não encontrada em uso)

Cada uma emite `console.warn` a cada chamada, poluindo os logs.

### Passo 1: No `legacy-tools.ts`, substituir middlewares

**Buscar e substituir em `legacy-tools.ts`:**

| Buscar | Substituir por |
|--------|---------------|
| `applySmartMiddlewares("avancar",` | `applyOrchestrationPipeline("avancar",` |
| `applyPersistenceMiddlewares("salvar",` | `applyOrchestrationPipeline("salvar",` |
| `applyPersistenceMiddlewares("checkpoint",` | `applyOrchestrationPipeline("checkpoint",` |
| `applyMiddlewares("status",` | `applyOrchestrationPipeline("status",` |

**Atualizar import em `legacy-tools.ts`:**

```typescript
// ANTES:
import {
    applyMiddlewares,
    applySmartMiddlewares,
    applyPersistenceMiddlewares
} from "./middleware/index.js";

// DEPOIS:
import { applyOrchestrationPipeline } from "./middleware/index.js";
```

### Passo 2: Remover imports deprecated de `router.ts`

Se após Task 2.5 o `router.ts` ainda importar middlewares deprecated, remover:

```typescript
// REMOVER do router.ts:
import {
    applyMiddlewares,
    applySmartMiddlewares,
    applyLightMiddlewares,
    applyPersistenceMiddlewares
} from "./middleware/index.js";
```

Manter apenas:
```typescript
import { applyOrchestrationPipeline } from "./middleware/index.js";
```

### Passo 3: Marcar funções deprecated para remoção futura

No `middleware/index.ts`, NÃO remover as funções ainda (tools legadas em outros projetos podem usar). Apenas manter com `@deprecated`.

### Teste de verificação

```bash
cd src
npx tsc --noEmit
npm test

# Verificar que não há mais warnings de deprecation:
node -e "
const { routeToolCall } = require('./dist/router.js');
routeToolCall('avancar', { diretorio: '/tmp' }).then(r => console.log('OK')).catch(e => console.log(e.message));
" 2>&1 | grep -i "deprecated" && echo "FALHA: Ainda há warnings" || echo "OK: Sem warnings"
```

### Rollback
Reverter substituições de middleware no `legacy-tools.ts`.

---

## Task 2.7 — Validar `estado_json` Vazio no Onboarding [ERRO-012]

> **NOTA:** Esta task pode já ter sido completada no Sprint 1 (Task 1.7). Verificar antes de executar:
```bash
grep -n "trim().length" src/flows/onboarding-orchestrator.ts
```
Se já existir, **pular esta task**.

Se não existir, seguir instruções do Sprint 1, Task 1.7.

---

## Task 2.8 — Decompor specialist-phase-handler.ts [ERRO-006]

### Contexto
O `specialist-phase-handler.ts` tem 1296 linhas. É o arquivo mais complexo e frágil. Precisa ser decomposto em módulos menores.

### ATENÇÃO — Task de Alto Risco
Esta é a task mais complexa do Sprint 2. Requer:
1. Ler o arquivo inteiro primeiro
2. Mapear todas as funções e suas dependências
3. Extrair módulos um de cada vez, rodando testes após cada extração

### Plano de decomposição (4 módulos)

#### Módulo A: `src/src/handlers/prd-scorer.ts` (~200 linhas)

Extrair as funções relacionadas a scoring de PRD:
- `scorePRDContent()` ou equivalente
- `detectGaps()`
- `calculateQualityMetrics()`
- Constantes de thresholds

**Como identificar no código:** Buscar funções que calculam scores, avaliam qualidade do PRD, detectam seções faltantes.

```bash
grep -n "score\|Score\|gap\|Gap\|quality\|Quality" src/handlers/specialist-phase-handler.ts
```

#### Módulo B: `src/src/handlers/field-normalizer.ts` (~150 linhas)

Extrair a lógica de normalização de campos:
- `FIELD_ALIASES` (mapa de variações de nomes)
- `normalizeFieldKey()`
- Fuzzy matching de campos

**Como identificar:**
```bash
grep -n "FIELD_ALIASES\|normalizeField\|fuzzy\|alias" src/handlers/specialist-phase-handler.ts
```

#### Módulo C: `src/src/handlers/specialist-state-machine.ts` (~250 linhas)

Extrair as transições de estado:
- `handleActive()`
- `handleCollecting()`
- `handleGenerating()`
- `handleValidating()`
- `handleApproved()`

Cada handler recebe `(estado, onboarding, diretorio, args)` e retorna `ToolResult`.

#### Módulo D: `src/src/handlers/specialist-formatters.ts` (~200 linhas)

Extrair formatação de output:
- Geração de prompts para o especialista
- Formatação de relatórios de validação
- `extractTemplateSkeleton()`
- Mensagens de classificação

### Procedimento de extração (para cada módulo)

1. **Ler** o arquivo completo do specialist-phase-handler.ts
2. **Identificar** as funções que pertencem ao módulo
3. **Criar** o novo arquivo com as funções extraídas
4. **Exportar** as funções
5. **Importar** no specialist-phase-handler.ts (substituindo as funções locais)
6. **Rodar** `npx tsc --noEmit` e `npm test`
7. **Se falhar**, reverter e ajustar

### Teste de verificação FINAL

```bash
cd src
npx tsc --noEmit
npm test

# Verificar tamanho dos arquivos:
wc -l src/handlers/specialist-phase-handler.ts
# Esperado: < 300 linhas

wc -l src/handlers/prd-scorer.ts src/handlers/field-normalizer.ts src/handlers/specialist-state-machine.ts src/handlers/specialist-formatters.ts
# Esperado: cada um < 300 linhas
```

### Teste unitário (um por módulo extraído)

```typescript
// src/src/__tests__/field-normalizer.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeFieldKey } from '../handlers/field-normalizer.js';

describe('field-normalizer', () => {
    it('normaliza variações de nomes de campo', () => {
        expect(normalizeFieldKey('problema_central')).toBe('problema');
        expect(normalizeFieldKey('target_audience')).toBe('publico_alvo');
    });

    it('retorna key original se não encontrar alias', () => {
        expect(normalizeFieldKey('campo_desconhecido')).toBe('campo_desconhecido');
    });
});
```

```typescript
// src/src/__tests__/prd-scorer.test.ts
import { describe, it, expect } from 'vitest';
// Importar funções do módulo extraído

describe('prd-scorer', () => {
    it('retorna score > 0 para PRD com conteúdo', () => {
        // Testar com conteúdo de PRD simulado
    });

    it('detecta gaps quando seções obrigatórias faltam', () => {
        // Testar detecção de gaps
    });
});
```

### Rollback
Restaurar `specialist-phase-handler.ts` original e remover os 4 novos módulos.

---

## Task 2.9 — Criar Migration Guide

### Arquivo NOVO: `docs/MIGRATION_V5_TO_V6.md`

```markdown
# Guia de Migração v5.x → v6.0

## Breaking Changes

### 1. `maestro` não aceita mais `acao: "avancar"`
**Antes:** `maestro({ diretorio: "...", acao: "avancar" })`
**Depois:** `executar({ diretorio: "...", acao: "avancar" })`

### 2. Tools legadas emitem warnings (serão removidas na v7)
Se você usa tools como `avancar`, `salvar`, `status`, `proximo` diretamente:

| Tool Legada | Equivalente v6 |
|------------|---------------|
| `avancar` | `executar({ acao: "avancar" })` |
| `salvar` | `executar({ acao: "salvar" })` |
| `checkpoint` | `executar({ acao: "checkpoint" })` |
| `status` | `maestro()` (sem ação) |
| `proximo` | `executar({ acao: "avancar" })` |
| `validar_gate` | `validar({ tipo: "gate" })` |
| `analisar_seguranca` | `analisar({ tipo: "seguranca" })` |

### 3. Entry point HTTP é dev-only
O `npm run build` agora gera apenas o entry point STDIO.
Para HTTP: `npm run build:all` + `npm run start:http`.

### 4. `onboarding` é tipado
`estado.onboarding` agora é `OnboardingState | undefined` (não mais `any`).
Se você acessa `(estado as any).onboarding`, remova o `as any`.
```

### Teste de verificação
Nenhum — é documentação.

---

## Checklist de Conclusão do Sprint 2

```bash
cd src

# 1. Build compila
npx tsc --noEmit

# 2. Testes passam
npm test

# 3. Verificar tamanho do router
wc -l src/router.ts
# Esperado: < 250 linhas

# 4. Verificar tamanho do specialist-phase-handler
wc -l src/handlers/specialist-phase-handler.ts
# Esperado: < 300 linhas

# 5. Verificar que stdio.ts é simples
wc -l src/stdio.ts
# Esperado: < 25 linhas

# 6. Zero warnings de deprecation (opcional)
node dist/stdio.js 2>&1 | grep -i "deprecated" | head -5
```

### Métricas de sucesso
- [ ] `server.ts` factory criado e funcional
- [ ] `stdio.ts` < 25 linhas, usando `createMaestroServer()`
- [ ] `index.ts` excluído do build de produção (ou refatorado)
- [ ] `router.ts` < 250 linhas (legadas movidas para `legacy-tools.ts`)
- [ ] `specialist-phase-handler.ts` < 300 linhas (decomposto em 4 módulos)
- [ ] `maestroToolSchema` sem `"avancar"` no enum
- [ ] Zero middlewares deprecated em tools públicas
- [ ] Migration guide v5→v6 criado
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm test` sem falhas

---

## Ordem de Execução Recomendada

```
2.1 (server.ts)           → 90 min  — fundação, sem breaking changes
2.2 (isolar express)       → 20 min  — trivial, tsconfig
2.4 (remover avancar)      → 30 min  — breaking change controlada
2.5 (mover legadas)        → 60 min  — refatoração mecânica
2.6 (migrar middlewares)   → 30 min  — substituição direta
2.7 (estado_json vazio)    → 5 min   — pode já estar feito
2.3 (refatorar index.ts)   → 45 min  — depende de verificação do SDK
2.8 (decompor specialist)  → 180 min — task mais complexa, fazer por último
2.9 (migration guide)      → 20 min  — documentação
```

**Total estimado:** ~8 horas de implementação + verificação

---

*Sprint 2 detalhado em 25/02/2026.*
*Próximo: Sprint 3 — Code Generation (v6.5).*
