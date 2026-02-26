# Sprint 4: Platform Foundation (v7.0) — Guia de Implementação Detalhado

**Objetivo:** Remover legado, implementar multi-projeto, plugin system e métricas  
**Duração estimada:** 4-6 semanas  
**Pré-requisito:** Sprint 3 concluído (tasks ativas, scoring contextual, TDD integrado)  
**Resultado esperado:** Zero tools legadas, suporte multi-projeto, arquitetura extensível

---

## REGRAS PARA A IA EXECUTORA

1. **Execute uma task por vez**, na ordem listada
2. **Após cada task**, rode `npx tsc --noEmit` e `npm test`
3. **Este sprint contém BREAKING CHANGES** — seguir migration guide rigorosamente
4. **Cada arquivo novo deve ter <300 linhas** e testes próprios
5. **Backup automático:** antes de remover qualquer código legado, criar branch ou commit

---

## Visão Geral — O que muda na v7.0

```
v6.5 (atual após Sprint 3):
  - 5 tools públicas + 37 legadas (backward compat)
  - Middlewares deprecated exportados
  - 1 projeto por diretório
  - Sem métricas de uso

v7.0 (alvo):
  - 5 tools públicas APENAS (legadas removidas)
  - Pipeline de middleware limpo
  - Multi-projeto com workspace manager
  - Plugin system para extensão de fases
  - Telemetria local (opt-in) para métricas de uso
```

---

## Task 4.1 — Remoção Completa de Tools Legadas

### Contexto

No Sprint 2, as tools legadas foram movidas para `legacy-tools.ts`. Agora é hora de removê-las completamente. Antes de remover, verificar que nenhum teste ou módulo as importa diretamente.

### Passo 1: Verificar referências às tools legadas

```bash
cd src

# Buscar referências diretas a tools legadas fora de legacy-tools.ts e router.ts
grep -rn "import.*from.*tools/proximo" src/ --include="*.ts" | grep -v legacy | grep -v __tests__ | grep -v ".d.ts"
grep -rn "import.*from.*tools/status" src/ --include="*.ts" | grep -v legacy | grep -v __tests__ | grep -v ".d.ts"
grep -rn "import.*from.*tools/discovery" src/ --include="*.ts" | grep -v legacy | grep -v __tests__ | grep -v ".d.ts"
grep -rn "import.*from.*tools/brainstorm" src/ --include="*.ts" | grep -v legacy | grep -v __tests__ | grep -v ".d.ts"

# Se alguma referência for encontrada: NÃO remover aquela tool ainda
# Apenas remover tools que são referenciadas EXCLUSIVAMENTE por legacy-tools.ts
```

### Passo 2: Listar tools seguras para remoção

Tools que são **apenas** chamadas via `legacy-tools.ts` ou via `avancar.ts` (que já usa o módulo diretamente, não via router):

| Tool | Arquivo | Segura para remover? |
|------|---------|---------------------|
| `status` | `tools/status.ts` | ⚠️ Verificar — pode ser usada por maestro-tool |
| `classificar` | `tools/classificar.ts` | ✅ Se não referenciada |
| `implementar_historia` | `tools/implementar-historia.ts` | ✅ Se não referenciada |
| `nova_feature` | `tools/fluxos-alternativos.ts` | ✅ Se não referenciada |
| `corrigir_bug` | `tools/fluxos-alternativos.ts` | ✅ Se não referenciada |
| `refatorar` | `tools/fluxos-alternativos.ts` | ✅ Se não referenciada |
| `atualizar_codebase` | `tools/atualizar-codebase.ts` | ✅ Se não referenciada |
| `injetar_conteudo` | `tools/injetar-conteudo.ts` | ✅ Se não referenciada |

**IMPORTANTE:** NÃO remover arquivos que são importados por tools consolidadas:
- `proximo.ts` — importado por `avancar.ts`
- `brainstorm.ts` — importado por `avancar.ts`
- `onboarding-orchestrator.ts` — importado por `avancar.ts`
- `prd-writer.ts` — pode ser importado por `specialist-phase-handler.ts`

### Passo 3: Remover `legacy-tools.ts`

**Arquivo a REMOVER:** `src/src/legacy-tools.ts`

### Passo 4: Limpar `router.ts`

**Arquivo:** `src/src/router.ts`

Remover:
1. Import de `legacyTools` e `legacyRedirects` de `legacy-tools.ts`
2. Referência a `legacyTools` no `allToolsMap`
3. O bloco de deprecation warning no `routeToolCall`
4. O objeto `legacyRedirects` (se não já removido)
5. A função `getTotalToolCount()` (não mais útil)
6. A função `getAllTools()` (não mais útil)

**Router.ts DEPOIS (estrutura simplificada):**

```typescript
/**
 * Router Centralizado do Maestro MCP v7
 * 
 * Ponto ÚNICO de roteamento para as 5 tools públicas.
 * Zero tools legadas — versões anteriores devem atualizar.
 */

import type { ToolResult } from "./types/index.js";
import { applyOrchestrationPipeline } from "./middleware/index.js";

// Imports de tools públicas
import { maestroTool, maestroToolSchema } from "./tools/maestro-tool.js";
import { executar, executarSchema } from "./tools/consolidated/executar.js";
import { validar, validarSchema } from "./tools/consolidated/validar.js";
import { analisar, analisarSchema } from "./tools/consolidated/analisar.js";
import { contexto, contextoSchema } from "./tools/contexto.js";

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

const publicTools: ToolDefinition[] = [
    // ... (manter as 5 definições existentes de publicTools, sem alterações)
];

const toolsMap = new Map<string, ToolDefinition>();
for (const tool of publicTools) toolsMap.set(tool.name, tool);

export async function routeToolCall(name: string, rawArgs: Record<string, unknown>): Promise<ToolResult> {
    const tool = toolsMap.get(name);
    if (!tool) {
        return {
            content: [{ type: "text", text: `❌ Tool não encontrada: ${name}\n\nTools disponíveis: ${publicTools.map(t => t.name).join(", ")}\n\n> ℹ️ Se você usava uma tool legada, consulte o Migration Guide v5→v7.` }],
            isError: true,
        };
    }

    try {
        return await tool.handler(rawArgs);
    } catch (error) {
        return {
            content: [{ type: "text", text: `❌ Erro ao executar ${name}: ${String(error)}` }],
            isError: true,
        };
    }
}

export function getRegisteredTools(): Array<{ name: string; description: string; inputSchema: Record<string, unknown>; outputSchema?: Record<string, unknown> }> {
    return publicTools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}),
    }));
}

export function getToolCount(): number {
    return publicTools.length;
}
```

### Passo 5: Remover middlewares deprecated

**Arquivo:** `src/src/middleware/index.ts`

Remover exports de:
- `applyMiddlewares`
- `applySmartMiddlewares`
- `applyLightMiddlewares`
- `applyPersistenceMiddlewares`

Manter apenas:
- `applyOrchestrationPipeline`
- Middlewares individuais (withStateLoad, withPersistence, etc.)

### Passo 6: Remover imports não utilizados no router.ts

Após remoção das tools legadas, muitos imports no topo de `router.ts` ficam órfãos. Remover todos os que não são mais usados:

```bash
cd src
# O compilador TypeScript vai reportar imports não usados se noUnusedLocals estiver ativo
npx tsc --noEmit --noUnusedLocals 2>&1 | grep "is declared but"
```

### Teste de verificação

```bash
cd src
npx tsc --noEmit
npm test

# Verificar que legacyTools não existe mais
grep -rn "legacyTools\|legacy-tools\|legacyRedirects" src/ --include="*.ts" | grep -v __tests__ | grep -v ".d.ts"
# Esperado: 0 resultados

# Verificar contagem de tools
node -e "const r = require('./dist/router.js'); console.log('Tools:', r.getToolCount())"
# Esperado: 5
```

### Teste unitário

```typescript
// Atualizar src/src/__tests__/router.test.ts
import { describe, it, expect } from 'vitest';
import { getRegisteredTools, routeToolCall, getToolCount } from '../router.js';

describe('Router v7', () => {
    it('retorna exatamente 5 tools públicas', () => {
        const tools = getRegisteredTools();
        expect(tools.length).toBe(5);
    });

    it('rejeita tools legadas com mensagem informativa', async () => {
        const result = await routeToolCall('avancar', { diretorio: '/tmp' });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Tool não encontrada');
        expect(result.content[0].text).toContain('Migration Guide');
    });

    it('getToolCount retorna 5', () => {
        expect(getToolCount()).toBe(5);
    });
});
```

### Rollback
1. Restaurar `legacy-tools.ts` e seus imports
2. Restaurar `router.ts` com o bloco de tools legadas
3. Restaurar `middleware/index.ts` com exports deprecated

---

## Task 4.2 — Workspace Manager (Multi-Projeto)

### Contexto

Atualmente, o Maestro opera 1 projeto por diretório. O `maestro-tool.ts` recebe `diretorio` e carrega `estado.json` dali. Para suportar múltiplos projetos (ex: monorepo com frontend + backend), precisamos de um workspace manager.

### Passo 1: Criar `src/src/services/workspace.service.ts`

```typescript
/**
 * WorkspaceManager — Gerencia múltiplos projetos em um workspace
 * 
 * Um workspace é um diretório raiz que pode conter subprojetos.
 * Cada subprojeto tem seu próprio `.maestro/estado.json`.
 * 
 * O workspace mantém um índice em `.maestro/workspace.json` na raiz.
 * 
 * @since v7.0
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname, relative, resolve } from "path";
import { createStateService } from "./state.service.js";
import type { EstadoProjeto } from "../types/index.js";

export interface WorkspaceProject {
    id: string;
    name: string;
    path: string;          // Path relativo ao workspace root
    absolutePath: string;   // Path absoluto
    status: 'active' | 'paused' | 'completed';
    lastAccess: string;
    createdAt: string;
}

export interface WorkspaceConfig {
    version: string;
    rootPath: string;
    projects: WorkspaceProject[];
    activeProjectId?: string;
    createdAt: string;
    updatedAt: string;
}

export class WorkspaceManager {
    private configPath: string;
    private maestroDir: string;

    constructor(private rootPath: string) {
        this.rootPath = resolve(rootPath);
        this.maestroDir = join(this.rootPath, ".maestro");
        this.configPath = join(this.maestroDir, "workspace.json");
    }

    /**
     * Inicializa ou carrega workspace.
     */
    async load(): Promise<WorkspaceConfig> {
        if (existsSync(this.configPath)) {
            const raw = await readFile(this.configPath, "utf-8");
            return JSON.parse(raw);
        }

        // Criar workspace novo
        const config: WorkspaceConfig = {
            version: "1.0",
            rootPath: this.rootPath,
            projects: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await this.save(config);
        return config;
    }

    /**
     * Salva configuração do workspace.
     */
    async save(config: WorkspaceConfig): Promise<void> {
        await mkdir(this.maestroDir, { recursive: true });
        config.updatedAt = new Date().toISOString();
        await writeFile(this.configPath, JSON.stringify(config, null, 2), "utf-8");
    }

    /**
     * Registra um subprojeto no workspace.
     */
    async registerProject(name: string, projectPath: string): Promise<WorkspaceProject> {
        const config = await this.load();
        const absPath = resolve(projectPath);
        const relPath = relative(this.rootPath, absPath);

        // Verificar se já existe
        const existing = config.projects.find(p => p.absolutePath === absPath);
        if (existing) return existing;

        const project: WorkspaceProject = {
            id: `proj-${Date.now().toString(36)}`,
            name,
            path: relPath,
            absolutePath: absPath,
            status: 'active',
            lastAccess: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        config.projects.push(project);
        config.activeProjectId = project.id;
        await this.save(config);

        return project;
    }

    /**
     * Lista todos os projetos do workspace.
     */
    async listProjects(): Promise<WorkspaceProject[]> {
        const config = await this.load();
        return config.projects;
    }

    /**
     * Obtém o projeto ativo ou o primeiro disponível.
     */
    async getActiveProject(): Promise<WorkspaceProject | null> {
        const config = await this.load();
        if (config.activeProjectId) {
            return config.projects.find(p => p.id === config.activeProjectId) || null;
        }
        return config.projects[0] || null;
    }

    /**
     * Troca o projeto ativo.
     */
    async setActiveProject(projectId: string): Promise<boolean> {
        const config = await this.load();
        const project = config.projects.find(p => p.id === projectId);
        if (!project) return false;

        config.activeProjectId = projectId;
        project.lastAccess = new Date().toISOString();
        await this.save(config);
        return true;
    }

    /**
     * Detecta subprojetos automaticamente (diretórios com .maestro/estado.json).
     */
    async discoverProjects(): Promise<string[]> {
        const discovered: string[] = [];
        // Buscar em subdiretórios de primeiro nível
        const { readdir } = await import("fs/promises");
        try {
            const entries = await readdir(this.rootPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== '.maestro' && entry.name !== 'node_modules') {
                    const estadoPath = join(this.rootPath, entry.name, '.maestro', 'estado.json');
                    if (existsSync(estadoPath)) {
                        discovered.push(join(this.rootPath, entry.name));
                    }
                }
            }
        } catch {
            // Diretório não legível
        }
        return discovered;
    }

    /**
     * Verifica se o diretório é um workspace (tem workspace.json).
     */
    isWorkspace(): boolean {
        return existsSync(this.configPath);
    }
}

/**
 * Factory function.
 */
export function createWorkspaceManager(rootPath: string): WorkspaceManager {
    return new WorkspaceManager(rootPath);
}
```

### Passo 2: Integrar no `maestro-tool.ts`

Quando o `maestroTool` recebe um diretório que é workspace (tem `workspace.json`), mostrar lista de projetos ao invés de iniciar projeto novo.

**Adicionar no `maestro-tool.ts`, após verificar se não tem projeto:**

```typescript
// v7.0: Verificar se é workspace multi-projeto
const { createWorkspaceManager } = await import("../services/workspace.service.js");
const workspace = createWorkspaceManager(diretorio);
if (workspace.isWorkspace()) {
    const projects = await workspace.listProjects();
    if (projects.length > 0) {
        const active = await workspace.getActiveProject();
        // Formatar lista de projetos e retornar
        // ...
    }
}
```

**ATENÇÃO:** A integração completa com o maestro-tool é complexa. Implementar em 2 etapas:
1. Primeiro, criar o WorkspaceManager como serviço standalone
2. Depois, integrar no maestro-tool com UI de seleção

### Teste de verificação

```bash
cd src
npx tsc --noEmit
npm test
```

### Testes unitários

```typescript
// src/src/__tests__/workspace.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createWorkspaceManager } from '../services/workspace.service.js';

describe('WorkspaceManager', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'maestro-ws-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('cria workspace novo ao carregar pela primeira vez', async () => {
        const ws = createWorkspaceManager(tempDir);
        const config = await ws.load();
        expect(config.version).toBe('1.0');
        expect(config.projects).toHaveLength(0);
    });

    it('registra e lista projetos', async () => {
        const ws = createWorkspaceManager(tempDir);
        const projPath = join(tempDir, 'frontend');
        await mkdir(projPath, { recursive: true });

        const project = await ws.registerProject('Frontend App', projPath);
        expect(project.name).toBe('Frontend App');

        const projects = await ws.listProjects();
        expect(projects).toHaveLength(1);
        expect(projects[0].name).toBe('Frontend App');
    });

    it('não duplica projeto com mesmo path', async () => {
        const ws = createWorkspaceManager(tempDir);
        const projPath = join(tempDir, 'api');
        await mkdir(projPath, { recursive: true });

        await ws.registerProject('API', projPath);
        await ws.registerProject('API', projPath); // Duplicata

        const projects = await ws.listProjects();
        expect(projects).toHaveLength(1);
    });

    it('troca projeto ativo', async () => {
        const ws = createWorkspaceManager(tempDir);
        const p1 = join(tempDir, 'p1');
        const p2 = join(tempDir, 'p2');
        await mkdir(p1, { recursive: true });
        await mkdir(p2, { recursive: true });

        const proj1 = await ws.registerProject('P1', p1);
        const proj2 = await ws.registerProject('P2', p2);

        await ws.setActiveProject(proj2.id);
        const active = await ws.getActiveProject();
        expect(active?.id).toBe(proj2.id);
    });

    it('descobre subprojetos com estado.json', async () => {
        const ws = createWorkspaceManager(tempDir);

        // Criar subprojeto com estado
        const subDir = join(tempDir, 'sub-project', '.maestro');
        await mkdir(subDir, { recursive: true });
        await writeFile(join(subDir, 'estado.json'), '{}', 'utf-8');

        // Criar diretório sem estado
        await mkdir(join(tempDir, 'just-a-folder'), { recursive: true });

        const discovered = await ws.discoverProjects();
        expect(discovered).toHaveLength(1);
        expect(discovered[0]).toContain('sub-project');
    });

    it('isWorkspace retorna false antes do load', () => {
        const ws = createWorkspaceManager(tempDir);
        expect(ws.isWorkspace()).toBe(false);
    });

    it('isWorkspace retorna true após load', async () => {
        const ws = createWorkspaceManager(tempDir);
        await ws.load(); // Cria workspace.json
        expect(ws.isWorkspace()).toBe(true);
    });
});
```

### Rollback
Remover `workspace.service.ts`, seus testes, e as alterações no `maestro-tool.ts`.

---

## Task 4.3 — Plugin System para Fases Customizáveis

### Contexto

Atualmente as fases são fixas em `flows/types.ts`. Para tornar o Maestro extensível, cada fase deve poder ser um "plugin" com: nome, especialista, template de entregável, checklist, e scoring config.

### Passo 1: Definir a interface de Plugin

**Arquivo NOVO:** `src/src/types/plugin.ts`

```typescript
/**
 * Interface de Plugin para fases do Maestro
 * 
 * Cada fase pode ser definida como um plugin com configuração declarativa.
 * Plugins built-in são registrados automaticamente.
 * Plugins externos podem ser carregados de `.maestro/plugins/`.
 * 
 * @since v7.0
 */

import type { ScoreWeights, PhaseCategory } from "../services/scoring-config.js";

/**
 * Definição de um plugin de fase.
 */
export interface PhasePlugin {
    /** Identificador único do plugin */
    id: string;

    /** Nome display da fase (ex: "Backend API") */
    name: string;

    /** Versão do plugin (semver) */
    version: string;

    /** Especialista padrão para esta fase */
    specialist: {
        name: string;
        role: string;
        systemPrompt?: string;
    };

    /** Categoria para scoring contextual */
    category: PhaseCategory;

    /** Checklist de gate de saída */
    gateChecklist: string[];

    /** Entregável esperado (descrição) */
    expectedDeliverable: string;

    /** Template de entregável (path relativo ao content/) */
    templatePath?: string;

    /** Pesos de scoring customizados (override do padrão da categoria) */
    scoreWeights?: Partial<ScoreWeights>;

    /** Dependências de plugins (ids de fases anteriores obrigatórias) */
    dependencies?: string[];

    /** Hooks para extensão */
    hooks?: {
        /** Executado antes de iniciar a fase */
        onStart?: (estado: Record<string, unknown>) => Promise<void>;
        /** Executado após gate aprovado */
        onComplete?: (estado: Record<string, unknown>) => Promise<void>;
        /** Validação customizada do entregável */
        onValidate?: (entregavel: string) => Promise<{ valid: boolean; errors: string[] }>;
    };
}

/**
 * Registro de plugins.
 */
export interface PluginRegistry {
    /** Registra um plugin de fase */
    register(plugin: PhasePlugin): void;

    /** Obtém plugin pelo id */
    get(id: string): PhasePlugin | undefined;

    /** Lista todos os plugins registrados */
    list(): PhasePlugin[];

    /** Obtém plugins ordenados por dependências (topological sort) */
    getOrdered(): PhasePlugin[];
}
```

### Passo 2: Criar `src/src/services/plugin-registry.service.ts`

```typescript
/**
 * PluginRegistry — Gerencia plugins de fases
 * 
 * Registro em memória de plugins. Plugins built-in são registrados no startup.
 * Plugins externos podem ser carregados de disco.
 * 
 * @since v7.0
 */

import type { PhasePlugin, PluginRegistry } from "../types/plugin.js";

class PluginRegistryImpl implements PluginRegistry {
    private plugins = new Map<string, PhasePlugin>();

    register(plugin: PhasePlugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`[PluginRegistry] Plugin '${plugin.id}' already registered, overwriting.`);
        }
        this.plugins.set(plugin.id, plugin);
    }

    get(id: string): PhasePlugin | undefined {
        return this.plugins.get(id);
    }

    list(): PhasePlugin[] {
        return Array.from(this.plugins.values());
    }

    getOrdered(): PhasePlugin[] {
        const plugins = this.list();
        const result: PhasePlugin[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (plugin: PhasePlugin) => {
            if (visited.has(plugin.id)) return;
            if (visiting.has(plugin.id)) {
                console.warn(`[PluginRegistry] Circular dependency detected for '${plugin.id}'`);
                return;
            }

            visiting.add(plugin.id);

            for (const depId of plugin.dependencies || []) {
                const dep = this.plugins.get(depId);
                if (dep) visit(dep);
            }

            visiting.delete(plugin.id);
            visited.add(plugin.id);
            result.push(plugin);
        };

        for (const plugin of plugins) {
            visit(plugin);
        }

        return result;
    }

    /**
     * Carrega plugins de um diretório.
     * Cada plugin é um arquivo .json com a interface PhasePlugin.
     */
    async loadFromDirectory(dirPath: string): Promise<number> {
        let loaded = 0;
        try {
            const { readdir, readFile } = await import("fs/promises");
            const { existsSync } = await import("fs");
            const { join } = await import("path");

            const pluginDir = join(dirPath, ".maestro", "plugins");
            if (!existsSync(pluginDir)) return 0;

            const files = await readdir(pluginDir);
            for (const file of files) {
                if (!file.endsWith('.json')) continue;
                try {
                    const content = await readFile(join(pluginDir, file), "utf-8");
                    const plugin = JSON.parse(content) as PhasePlugin;
                    if (plugin.id && plugin.name) {
                        this.register(plugin);
                        loaded++;
                    }
                } catch (err) {
                    console.warn(`[PluginRegistry] Failed to load plugin ${file}:`, err);
                }
            }
        } catch {
            // Diretório não legível
        }
        return loaded;
    }
}

// Singleton
let _registry: PluginRegistryImpl | null = null;

export function getPluginRegistry(): PluginRegistry {
    if (!_registry) {
        _registry = new PluginRegistryImpl();
    }
    return _registry;
}

/**
 * Registra plugins built-in (chamado no startup).
 */
export function registerBuiltinPlugins(): void {
    const registry = getPluginRegistry();

    // Exemplo de plugin built-in para fase de Produto/PRD
    registry.register({
        id: 'phase-produto',
        name: 'Produto (PRD)',
        version: '1.0.0',
        specialist: {
            name: 'Especialista em Gestão de Produto',
            role: 'Product Manager',
        },
        category: 'documento',
        gateChecklist: [
            'Problema claramente definido',
            'Público-alvo identificado',
            'MVP com funcionalidades priorizadas',
            'Métricas de sucesso definidas',
        ],
        expectedDeliverable: 'Documento PRD (Product Requirements Document)',
        templatePath: 'content/skills/architecture/templates/prd-template.md',
    });

    registry.register({
        id: 'phase-requisitos',
        name: 'Requisitos Técnicos',
        version: '1.0.0',
        specialist: {
            name: 'Especialista em Requisitos',
            role: 'Business Analyst',
        },
        category: 'documento',
        gateChecklist: [
            'Requisitos funcionais documentados',
            'Requisitos não-funcionais documentados',
            'Critérios de aceite definidos',
        ],
        expectedDeliverable: 'Documento de Requisitos Técnicos',
        dependencies: ['phase-produto'],
    });

    // Adicionar mais plugins built-in conforme necessário
}
```

### Testes unitários

```typescript
// src/src/__tests__/plugin-registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

// Criar instância fresh para cada teste (não usar singleton)
describe('PluginRegistry', () => {
    // Importar a classe diretamente ou mockar o singleton
    // Para testes, vamos testar a lógica via o singleton resetado

    it('registra e recupera plugins', async () => {
        const { getPluginRegistry } = await import('../services/plugin-registry.service.js');
        const registry = getPluginRegistry();

        registry.register({
            id: 'test-plugin',
            name: 'Test Phase',
            version: '1.0.0',
            specialist: { name: 'Test Specialist', role: 'Tester' },
            category: 'documento',
            gateChecklist: ['Check 1', 'Check 2'],
            expectedDeliverable: 'Test doc',
        });

        const plugin = registry.get('test-plugin');
        expect(plugin).toBeDefined();
        expect(plugin?.name).toBe('Test Phase');
    });

    it('lista todos os plugins', async () => {
        const { getPluginRegistry } = await import('../services/plugin-registry.service.js');
        const registry = getPluginRegistry();
        const list = registry.list();
        expect(list.length).toBeGreaterThanOrEqual(0);
    });

    it('ordena plugins por dependências', async () => {
        const { getPluginRegistry } = await import('../services/plugin-registry.service.js');
        const registry = getPluginRegistry();

        registry.register({
            id: 'phase-b',
            name: 'Phase B',
            version: '1.0.0',
            specialist: { name: 'B', role: 'B' },
            category: 'codigo',
            gateChecklist: [],
            expectedDeliverable: 'B',
            dependencies: ['phase-a'],
        });

        registry.register({
            id: 'phase-a',
            name: 'Phase A',
            version: '1.0.0',
            specialist: { name: 'A', role: 'A' },
            category: 'documento',
            gateChecklist: [],
            expectedDeliverable: 'A',
        });

        const ordered = registry.getOrdered();
        const aIndex = ordered.findIndex(p => p.id === 'phase-a');
        const bIndex = ordered.findIndex(p => p.id === 'phase-b');
        expect(aIndex).toBeLessThan(bIndex); // A vem antes de B
    });
});
```

### Rollback
Remover `types/plugin.ts`, `plugin-registry.service.ts` e seus testes.

---

## Task 4.4 — Telemetria Local (Opt-in)

### Contexto

Atualmente não há métricas de uso. Para melhorar o produto, é útil saber:
- Quantas fases são concluídas
- Quais fases causam mais rejeições de gate
- Tempo médio por fase
- Quais erros são mais frequentes

**IMPORTANTE:** Telemetria é LOCAL (salva no filesystem), opt-in, e NUNCA envia dados para fora.

### Passo 1: Criar `src/src/services/telemetry.service.ts`

```typescript
/**
 * TelemetryService — Métricas locais de uso (opt-in)
 * 
 * Salva eventos de uso em `.maestro/telemetry.jsonl` (JSON Lines format).
 * Nunca envia dados para servidores externos.
 * Opt-in: só coleta se `config.telemetry.enabled === true`.
 * 
 * @since v7.0
 */

import { appendFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";

export interface TelemetryEvent {
    timestamp: string;
    event: string;
    tool: string;
    phase?: string;
    phaseNumber?: number;
    duration_ms?: number;
    success: boolean;
    metadata?: Record<string, unknown>;
}

export class TelemetryService {
    private filePath: string;
    private enabled: boolean;

    constructor(projectDir: string, enabled: boolean = false) {
        this.filePath = join(projectDir, ".maestro", "telemetry.jsonl");
        this.enabled = enabled;
    }

    /**
     * Registra um evento de telemetria.
     * No-op se telemetria estiver desativada.
     */
    async track(event: Omit<TelemetryEvent, 'timestamp'>): Promise<void> {
        if (!this.enabled) return;

        const entry: TelemetryEvent = {
            ...event,
            timestamp: new Date().toISOString(),
        };

        try {
            const dir = dirname(this.filePath);
            await mkdir(dir, { recursive: true });
            await appendFile(this.filePath, JSON.stringify(entry) + '\n', "utf-8");
        } catch {
            // Silencioso — telemetria nunca deve causar erros
        }
    }

    /**
     * Lê todos os eventos de telemetria.
     */
    async getEvents(): Promise<TelemetryEvent[]> {
        if (!existsSync(this.filePath)) return [];

        try {
            const raw = await readFile(this.filePath, "utf-8");
            return raw.trim().split('\n')
                .filter(line => line.length > 0)
                .map(line => JSON.parse(line));
        } catch {
            return [];
        }
    }

    /**
     * Gera resumo estatístico dos eventos.
     */
    async getSummary(): Promise<{
        totalEvents: number;
        toolUsage: Record<string, number>;
        phaseCompletions: number;
        gateRejections: number;
        averagePhaseDuration_ms: number;
        errorRate: number;
    }> {
        const events = await this.getEvents();

        const toolUsage: Record<string, number> = {};
        let phaseCompletions = 0;
        let gateRejections = 0;
        let totalDuration = 0;
        let durationCount = 0;
        let errorCount = 0;

        for (const e of events) {
            toolUsage[e.tool] = (toolUsage[e.tool] || 0) + 1;
            if (e.event === 'phase_completed') phaseCompletions++;
            if (e.event === 'gate_rejected') gateRejections++;
            if (e.duration_ms) { totalDuration += e.duration_ms; durationCount++; }
            if (!e.success) errorCount++;
        }

        return {
            totalEvents: events.length,
            toolUsage,
            phaseCompletions,
            gateRejections,
            averagePhaseDuration_ms: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
            errorRate: events.length > 0 ? errorCount / events.length : 0,
        };
    }
}

/**
 * Factory function.
 */
export function createTelemetry(projectDir: string, enabled: boolean = false): TelemetryService {
    return new TelemetryService(projectDir, enabled);
}
```

### Passo 2: Integrar telemetria no middleware pipeline

**Arquivo:** `src/src/middleware/orchestration-pipeline.middleware.ts`

Adicionar um wrapper de telemetria que registra cada chamada de tool:

```typescript
import { createTelemetry } from "../services/telemetry.service.js";

// Dentro de applyOrchestrationPipeline, após o handler executar:
// const startTime = Date.now();
// const result = await handler(args);
// const duration = Date.now() - startTime;
//
// if (args.diretorio) {
//     const telemetry = createTelemetry(args.diretorio as string, true);
//     await telemetry.track({
//         event: 'tool_call',
//         tool: toolName,
//         duration_ms: duration,
//         success: !result.isError,
//     });
// }
```

**ATENÇÃO:** A integração exata depende da estrutura do pipeline. Implementar como middleware separado se possível:

```typescript
// src/src/middleware/telemetry.middleware.ts
export function withTelemetry(handler: ToolHandler): ToolHandler {
    return async (args) => {
        const start = Date.now();
        const result = await handler(args);
        const duration = Date.now() - start;

        const diretorio = args.diretorio as string;
        if (diretorio) {
            const { createTelemetry } = await import("../services/telemetry.service.js");
            const telemetry = createTelemetry(diretorio, true); // TODO: ler config
            await telemetry.track({
                event: 'tool_call',
                tool: 'unknown', // Passado pelo pipeline
                duration_ms: duration,
                success: !result.isError,
            }).catch(() => {}); // Nunca falhar por telemetria
        }

        return result;
    };
}
```

### Testes unitários

```typescript
// src/src/__tests__/telemetry.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';
import { createTelemetry } from '../services/telemetry.service.js';

describe('TelemetryService', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'maestro-telemetry-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('não grava quando desativada', async () => {
        const telemetry = createTelemetry(tempDir, false);
        await telemetry.track({ event: 'test', tool: 'maestro', success: true });

        const filePath = join(tempDir, '.maestro', 'telemetry.jsonl');
        expect(existsSync(filePath)).toBe(false);
    });

    it('grava eventos quando ativada', async () => {
        const telemetry = createTelemetry(tempDir, true);
        await telemetry.track({ event: 'tool_call', tool: 'maestro', success: true, duration_ms: 150 });
        await telemetry.track({ event: 'gate_rejected', tool: 'validar', success: false });

        const events = await telemetry.getEvents();
        expect(events.length).toBe(2);
        expect(events[0].event).toBe('tool_call');
        expect(events[0].duration_ms).toBe(150);
        expect(events[1].success).toBe(false);
    });

    it('gera summary corretamente', async () => {
        const telemetry = createTelemetry(tempDir, true);
        await telemetry.track({ event: 'tool_call', tool: 'maestro', success: true, duration_ms: 100 });
        await telemetry.track({ event: 'tool_call', tool: 'executar', success: true, duration_ms: 200 });
        await telemetry.track({ event: 'phase_completed', tool: 'executar', success: true });
        await telemetry.track({ event: 'gate_rejected', tool: 'validar', success: false });

        const summary = await telemetry.getSummary();
        expect(summary.totalEvents).toBe(4);
        expect(summary.toolUsage['maestro']).toBe(1);
        expect(summary.toolUsage['executar']).toBe(2);
        expect(summary.phaseCompletions).toBe(1);
        expect(summary.gateRejections).toBe(1);
        expect(summary.averagePhaseDuration_ms).toBe(150); // (100+200)/2
        expect(summary.errorRate).toBe(0.25); // 1/4
    });

    it('retorna array vazio quando arquivo não existe', async () => {
        const telemetry = createTelemetry(tempDir, true);
        const events = await telemetry.getEvents();
        expect(events).toHaveLength(0);
    });
});
```

### Rollback
Remover `telemetry.service.ts`, `telemetry.middleware.ts` e seus testes.

---

## Task 4.5 — Migration Guide Final v5→v7

### Arquivo a ATUALIZAR: `docs/MIGRATION_V5_TO_V6.md` → renomear para `docs/MIGRATION_GUIDE.md`

```markdown
# Guia de Migração — Maestro MCP

## v5.x → v6.0

### Breaking Changes
- `maestro` não aceita mais `acao: "avancar"` → Use `executar({ acao: "avancar" })`
- Entry point HTTP é dev-only (não incluído no build)
- `onboarding` é tipado como `OnboardingState` (não mais `any`)

### Mapeamento de Tools
| Tool Legada | Equivalente v6 |
|------------|---------------|
| `avancar` | `executar({ acao: "avancar" })` |
| `salvar` | `executar({ acao: "salvar" })` |
| `checkpoint` | `executar({ acao: "checkpoint" })` |
| `status` | `maestro()` (sem ação) |
| `proximo` | `executar({ acao: "avancar" })` |

## v6.x → v7.0

### Breaking Changes
- **Todas as tools legadas foram REMOVIDAS**. Apenas 5 tools públicas:
  - `maestro` — Entry point, status, setup, criar projeto
  - `executar` — Avançar, salvar, checkpoint
  - `validar` — Gates, entregáveis, compliance
  - `analisar` — Segurança, qualidade, performance
  - `contexto` — ADRs, padrões, knowledge base

- **Middlewares deprecated removidos:**
  - `applyMiddlewares`, `applySmartMiddlewares`, `applyLightMiddlewares`, `applyPersistenceMiddlewares`
  - Use apenas `applyOrchestrationPipeline`

### Novas Funcionalidades
- **Multi-projeto:** Workspace manager com `workspace.json`
- **Plugin system:** Fases customizáveis via plugins JSON em `.maestro/plugins/`
- **Telemetria local:** Opt-in, arquivo `.maestro/telemetry.jsonl`
- **Task-Driven Development:** Tasks granulares para fases de código
- **Scoring contextual:** Pesos diferentes para documento vs design vs código
```

---

## Checklist de Conclusão do Sprint 4

```bash
cd src

# 1. Build compila
npx tsc --noEmit

# 2. Testes passam
npm test

# 3. Verificar que não há tools legadas
node -e "const r = require('./dist/router.js'); console.log('Tools:', r.getToolCount())"
# Esperado: 5

# 4. Verificar que não há imports deprecated
grep -rn "applyMiddlewares\b\|applySmartMiddlewares\|applyLightMiddlewares\|applyPersistenceMiddlewares" src/ --include="*.ts" | grep -v __tests__ | grep -v ".d.ts" | grep -v "deprecated"
# Esperado: 0 resultados (ou apenas comentários/docs)

# 5. Novos serviços existem
ls src/services/workspace.service.ts
ls src/services/plugin-registry.service.ts
ls src/services/telemetry.service.ts
ls src/types/plugin.ts

# 6. Testes dos novos serviços existem
ls src/__tests__/workspace.test.ts
ls src/__tests__/plugin-registry.test.ts
ls src/__tests__/telemetry.test.ts
```

### Métricas de sucesso
- [ ] Zero tools legadas no router
- [ ] Zero middlewares deprecated exportados
- [ ] WorkspaceManager funcional (cria, lista, troca, descobre projetos)
- [ ] PluginRegistry funcional (registra, ordena por deps, carrega de disco)
- [ ] TelemetryService funcional (opt-in, grava, lê, gera summary)
- [ ] Migration Guide v5→v7 completo
- [ ] `router.ts` < 150 linhas
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm test` sem falhas

---

## Ordem de Execução Recomendada

```
4.1 (remover legadas)      → 120 min — BREAKING, fazer primeiro com cuidado
4.2 (workspace manager)    → 120 min — novo serviço standalone
4.3 (plugin system)        → 90 min  — novo serviço standalone
4.4 (telemetria)           → 60 min  — novo serviço standalone
4.5 (migration guide)      → 30 min  — documentação final
```

**Total estimado:** ~7 horas de implementação + verificação

---

## Resumo dos 4 Sprints

| Sprint | Versão | Foco | Tasks | Tempo |
|--------|--------|------|-------|-------|
| 1 — Stabilization | v5.6 | Bugs, tipagem, testes | 8 | ~3h |
| 2 — Simplification | v6.0 | Entry points, legado, decomposição | 9 | ~8h |
| 3 — Code Generation | v6.5 | Tasks, scoring, TDD | 4 | ~6h |
| 4 — Platform | v7.0 | Remoção, multi-projeto, plugins | 5 | ~7h |
| **TOTAL** | | | **26 tasks** | **~24h** |

---

*Sprint 4 detalhado em 25/02/2026.*
*Roadmap completo: v5.6 → v6.0 → v6.5 → v7.0.*
