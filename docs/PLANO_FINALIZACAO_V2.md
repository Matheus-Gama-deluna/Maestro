# Plano de Finalização - Maestro v2.0

**Data:** 02/02/2026  
**Objetivo:** Completar 100% da implementação e garantir integração completa

---

## 📋 Checklist de Finalização

### Fase 1: Ajustes de Tipos e Interfaces (CRÍTICO)

**Tempo Estimado:** 30-45 minutos

#### 1.1 Atualizar `src/src/types/index.ts`

**Mudanças Necessárias:**

```typescript
// ADICIONAR ao EstadoProjeto
export interface EstadoProjeto {
    // ... campos existentes
    
    // NOVOS CAMPOS v2.0
    config?: {
        mode: 'economy' | 'balanced' | 'quality';
        flow: 'principal' | 'feature' | 'bugfix' | 'refactor';
        optimization: {
            batch_questions: boolean;
            context_caching: boolean;
            template_compression: boolean;
            smart_validation: boolean;
            one_shot_generation: boolean;
            differential_updates: boolean;
        };
        frontend_first: boolean;
        auto_checkpoint: boolean;
        auto_fix: boolean;
    };
    
    tasks?: Array<{
        id: string;
        type: 'epic' | 'feature' | 'story' | 'task' | 'subtask';
        title: string;
        description: string;
        status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done';
        priority: 'critical' | 'high' | 'medium' | 'low';
        parent_id?: string;
        children_ids: string[];
        dependencies: string[];
        phase?: number;
        estimate_hours?: number;
        actual_hours?: number;
        created_at: string;
        updated_at: string;
        tags: string[];
    }>;
}

// ADICIONAR novos EventTypes
export const EventTypes = {
    // ... eventos existentes
    PROJECT_INIT: "project_init",
    PROJECT_CONFIRMED: "project_confirmed",
    PHASE_TRANSITION: "phase_transition",
    GATE_VALIDATED: "gate_validated",
    GATE_APPROVED: "gate_approved",
    DELIVERABLE_SAVED: "deliverable_saved",
    FEATURE_STARTED: "feature_started",
    REFACTOR_STARTED: "refactor_started",
    
    // NOVOS EVENTOS v2.0
    CONFIG_CHANGED: "config_changed",
    MODE_CHANGED: "mode_changed",
    TASK_CREATED: "task_created",
    TASK_UPDATED: "task_updated",
    TASK_COMPLETED: "task_completed",
    CHECKPOINT_CREATED: "checkpoint_created",
    AUTO_FIX_ATTEMPTED: "auto_fix_attempted",
    CONTRACT_GENERATED: "contract_generated",
    MOCKS_GENERATED: "mocks_generated",
    OPTIMIZATION_APPLIED: "optimization_applied",
} as const;
```

#### 1.2 Atualizar `src/src/utils/history.ts`

**Mudanças Necessárias:**

```typescript
// Atualizar assinatura de logEvent para aceitar metadata opcional
export async function logEvent(
    diretorio: string,
    tipo: string,
    metadata?: Record<string, any>  // ADICIONAR parâmetro opcional
): Promise<void> {
    // ... implementação existente
    
    const evento = {
        timestamp: new Date().toISOString(),
        tipo,
        metadata: metadata || {},  // ADICIONAR metadata
    };
    
    // ... resto da implementação
}
```

---

### Fase 2: Tools MCP Restantes (IMPORTANTE)

**Tempo Estimado:** 1-2 horas

#### 2.1 Criar `src/src/tools/listar-tarefas.ts`

```typescript
import type { ToolResult } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { globalTaskManager } from "../tasks/task-manager.js";
import type { TaskFilter } from "../types/tasks.js";

interface ListarTarefasArgs {
    filter?: {
        type?: string[];
        status?: string[];
        priority?: string[];
        phase?: number[];
        parent_id?: string;
        tags?: string[];
    };
    estado_json: string;
    diretorio: string;
}

export async function listarTarefas(args: ListarTarefasArgs): Promise<ToolResult> {
    // Implementação completa
}
```

#### 2.2 Criar `src/src/tools/atualizar-tarefa.ts`

```typescript
import type { ToolResult } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { globalTaskManager } from "../tasks/task-manager.js";
import type { TaskUpdate } from "../types/tasks.js";

interface AtualizarTarefaArgs {
    task_id: string;
    update: {
        status?: string;
        priority?: string;
        description?: string;
        estimate_hours?: number;
        actual_hours?: number;
        tags?: string[];
    };
    estado_json: string;
    diretorio: string;
}

export async function atualizarTarefa(args: AtualizarTarefaArgs): Promise<ToolResult> {
    // Implementação completa
}
```

---

### Fase 3: Registro no Servidor MCP (CRÍTICO)

**Tempo Estimado:** 30-45 minutos

#### 3.1 Atualizar `src/src/index.ts` ou `src/src/server.ts`

**Localizar e Modificar:**

```typescript
// Importar novas tools
import { configurarModo } from "./tools/configurar-modo.js";
import { gerarContratoAPI } from "./tools/gerar-contrato-api.js";
import { criarTarefa } from "./tools/criar-tarefa.js";
import { listarTarefas } from "./tools/listar-tarefas.js";
import { atualizarTarefa } from "./tools/atualizar-tarefa.js";

// Adicionar ao ListToolsRequestSchema
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        // ... tools existentes
        
        // NOVAS TOOLS v2.0
        {
            name: "configurar_modo",
            description: "Configura modo de operação (economy/balanced/quality) para otimizar uso de prompts",
            inputSchema: {
                type: "object",
                properties: {
                    mode: {
                        type: "string",
                        enum: ["economy", "balanced", "quality"],
                        description: "Modo de operação"
                    },
                    estado_json: { type: "string" },
                    diretorio: { type: "string" }
                },
                required: ["mode", "estado_json", "diretorio"]
            }
        },
        {
            name: "gerar_contrato_api",
            description: "Gera contrato de API completo com OpenAPI, schemas TypeScript/Zod, mocks MSW e cliente",
            inputSchema: {
                type: "object",
                properties: {
                    endpoints: {
                        type: "array",
                        items: { type: "object" },
                        description: "Lista de endpoints da API"
                    },
                    schemas: {
                        type: "object",
                        description: "Schemas dos modelos"
                    },
                    base_url: { type: "string" },
                    generate_mocks: { type: "boolean", default: true },
                    mock_count: { type: "number", default: 20 },
                    estado_json: { type: "string" },
                    diretorio: { type: "string" }
                },
                required: ["endpoints", "schemas", "estado_json", "diretorio"]
            }
        },
        {
            name: "criar_tarefa",
            description: "Cria tarefa no sistema de gerenciamento hierárquico",
            inputSchema: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["epic", "feature", "story", "task", "subtask"]
                    },
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: {
                        type: "string",
                        enum: ["critical", "high", "medium", "low"],
                        default: "medium"
                    },
                    parent_id: { type: "string" },
                    phase: { type: "number" },
                    estimate_hours: { type: "number" },
                    tags: { type: "array", items: { type: "string" } },
                    estado_json: { type: "string" },
                    diretorio: { type: "string" }
                },
                required: ["type", "title", "description", "estado_json", "diretorio"]
            }
        },
        {
            name: "listar_tarefas",
            description: "Lista tarefas com filtros opcionais",
            inputSchema: {
                type: "object",
                properties: {
                    filter: {
                        type: "object",
                        properties: {
                            type: { type: "array", items: { type: "string" } },
                            status: { type: "array", items: { type: "string" } },
                            priority: { type: "array", items: { type: "string" } },
                            phase: { type: "array", items: { type: "number" } },
                            parent_id: { type: "string" },
                            tags: { type: "array", items: { type: "string" } }
                        }
                    },
                    estado_json: { type: "string" },
                    diretorio: { type: "string" }
                },
                required: ["estado_json", "diretorio"]
            }
        },
        {
            name: "atualizar_tarefa",
            description: "Atualiza status e informações de uma tarefa",
            inputSchema: {
                type: "object",
                properties: {
                    task_id: { type: "string" },
                    update: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            priority: { type: "string" },
                            description: { type: "string" },
                            estimate_hours: { type: "number" },
                            actual_hours: { type: "number" },
                            tags: { type: "array", items: { type: "string" } }
                        }
                    },
                    estado_json: { type: "string" },
                    diretorio: { type: "string" }
                },
                required: ["task_id", "update", "estado_json", "diretorio"]
            }
        }
    ]
}));

// Adicionar ao CallToolRequestSchema
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
        switch (name) {
            // ... cases existentes
            
            // NOVOS CASES v2.0
            case "configurar_modo":
                return await configurarModo(args as any);
            
            case "gerar_contrato_api":
                return await gerarContratoAPI(args as any);
            
            case "criar_tarefa":
                return await criarTarefa(args as any);
            
            case "listar_tarefas":
                return await listarTarefas(args as any);
            
            case "atualizar_tarefa":
                return await atualizarTarefa(args as any);
            
            default:
                throw new Error(`Tool desconhecida: ${name}`);
        }
    } catch (error) {
        // ... error handling
    }
});
```

---

### Fase 4: Atualização de Fluxos (IMPORTANTE)

**Tempo Estimado:** 1-2 horas

#### 4.1 Atualizar `src/src/flows/types.ts`

**Adicionar ferramentas obrigatórias por fase:**

```typescript
export interface FaseConfig {
    numero: number;
    nome: string;
    especialista: string;
    template: string;
    entregavel: string;
    
    // ADICIONAR
    required_tools?: string[];  // Tools obrigatórias
    optional_tools?: string[];  // Tools opcionais
    auto_checkpoint?: boolean;  // Checkpoint automático
    frontend_first?: boolean;   // Usar frontend-first
}

// Atualizar fases com ferramentas obrigatórias
export const FASES_PRINCIPAL: FaseConfig[] = [
    {
        numero: 1,
        nome: "Produto",
        especialista: "Gestão de Produto",
        template: "PRD",
        entregavel: "PRD.md",
        required_tools: ["validar_gate"],
        optional_tools: ["batch_questions"],
    },
    // ... outras fases
    {
        numero: 10,
        nome: "Contrato de API",
        especialista: "API Designer",
        template: "API Contract",
        entregavel: "api-contract/",
        required_tools: ["gerar_contrato_api", "validar_gate"],
        auto_checkpoint: true,
        frontend_first: true,
    },
    {
        numero: 11,
        nome: "Frontend",
        especialista: "Frontend Developer",
        template: "Frontend Implementation",
        entregavel: "frontend-impl.md",
        required_tools: ["discovery_codebase", "validar_gate"],
        frontend_first: true,
    },
    {
        numero: 12,
        nome: "Backend",
        especialista: "Backend Developer",
        template: "Backend Implementation",
        entregavel: "backend-impl.md",
        required_tools: ["discovery_codebase", "validar_seguranca", "validar_gate"],
        frontend_first: true,
    },
    // ... resto das fases
];
```

---

### Fase 5: Atualização de Workflows (IMPORTANTE)

**Tempo Estimado:** 1 hora

#### 5.1 Atualizar `content/workflows/mcp-start.md`

**Adicionar seleção de modo:**

```markdown
### Passo 1.5: Selecionar Modo de Operação

**Perguntar ao usuário:**

```
🎯 **Modo de Operação**

Qual modo deseja usar?

1. 💰 Economy (-70% prompts, ideal para POCs)
2. ⚖️ Balanced (-45% prompts, ideal para projetos internos) [PADRÃO]
3. ⭐ Quality (0% economia, máxima qualidade)

Escolha (1/2/3):
```

**Configurar modo:**

```typescript
await configurar_modo({
  mode: modoEscolhido,
  estado_json: estadoJson,
  diretorio: process.cwd()
});
```
```

#### 5.2 Atualizar `content/workflows/mcp-next.md`

**Adicionar verificação de ferramentas obrigatórias:**

```markdown
### Passo 1.5: Verificar Ferramentas Obrigatórias

**Antes de avançar, verificar se ferramentas obrigatórias foram executadas:**

```typescript
const fase = estado.fases[estado.fase_atual - 1];

if (fase.required_tools) {
  const toolsExecutadas = verificarToolsExecutadas(fase.required_tools);
  
  if (!toolsExecutadas.todas) {
    return `⚠️ **Ferramentas Obrigatórias Pendentes**
    
    As seguintes ferramentas devem ser executadas antes de avançar:
    ${toolsExecutadas.pendentes.map(t => `- ${t}`).join('\n')}
    `;
  }
}
```
```

---

### Fase 6: Testes de Integração (CRÍTICO)

**Tempo Estimado:** 1-2 horas

#### 6.1 Teste Completo: Fluxo Principal

**Cenário:**
1. Iniciar projeto em modo Economy
2. Configurar modo
3. Avançar até Fase 10
4. Gerar contrato de API
5. Criar tarefas
6. Verificar economia de prompts

**Script de Teste:**

```bash
# 1. Iniciar projeto
/mcp-start

# 2. Configurar modo Economy
await configurar_modo({ mode: "economy", ... })

# 3. Avançar fases (1-9)
# ... executar fases normalmente

# 4. Fase 10: Gerar contrato
await gerar_contrato_api({
  endpoints: [...],
  schemas: {...},
  ...
})

# 5. Criar tarefas
await criar_tarefa({
  type: "epic",
  title: "Implementação",
  ...
})

# 6. Verificar estatísticas
await status({ ... })
```

#### 6.2 Teste: Frontend-First

**Cenário:**
1. Gerar contrato com mocks
2. Verificar arquivos gerados
3. Testar MSW handlers
4. Validar schemas Zod

---

### Fase 7: Atualização de Documentação (IMPORTANTE)

**Tempo Estimado:** 1 hora

#### 7.1 Atualizar `package.json`

```json
{
  "name": "@maestro/mcp-server",
  "version": "2.0.0",
  "description": "MCP Server para desenvolvimento guiado com IA - v2.0 com otimizações e frontend-first",
  "keywords": [
    "mcp",
    "ai",
    "development",
    "optimization",
    "frontend-first",
    "task-management"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@vudovn/ag-kit": "^2.0.0",
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

#### 7.2 Atualizar `README.md`

**Adicionar seção de novidades v2.0:**

```markdown
## 🆕 Novidades v2.0

### Modos de Operação
- **Economy:** -70% prompts, ideal para POCs
- **Balanced:** -45% prompts, ideal para projetos internos
- **Quality:** Máxima qualidade

### Frontend-First Architecture
- Geração automática de contratos de API (OpenAPI 3.0)
- Mocks realistas com MSW e Faker.js
- Desenvolvimento paralelo Frontend + Backend

### Sistema de Tarefas
- Hierarquia completa (Epic → Feature → Story → Task)
- Dependências e tracking
- Estatísticas em tempo real

### Otimizações
- 6 estratégias de economia de prompts
- Cache inteligente de contexto
- Validação incremental

[Ver CHANGELOG completo](./CHANGELOG_V2.md)
```

#### 7.3 Criar `docs/MIGRACAO_V1_V2.md`

```markdown
# Guia de Migração v1.0 → v2.0

## Compatibilidade

✅ **Projetos v1.0 continuam funcionando**
- Campos novos são opcionais
- Modo padrão é "balanced"
- Sem breaking changes

## Migração Manual

### 1. Atualizar Servidor

```bash
cd src
npm install
npm run build
```

### 2. Configurar Modo (Opcional)

```typescript
await configurar_modo({
  mode: "balanced",
  estado_json: estadoJson,
  diretorio: "./"
});
```

### 3. Usar Novas Funcionalidades

- Frontend-first na Fase 10
- Sistema de tarefas
- Otimizações automáticas

## Novos Campos em estado.json

```json
{
  "config": {
    "mode": "balanced",
    "flow": "principal",
    "frontend_first": true
  },
  "tasks": []
}
```
```

---

## 📊 Cronograma de Execução

### Sessão 1 (2-3 horas)
- ✅ Fase 1: Ajustes de Tipos (45min)
- ✅ Fase 2: Tools Restantes (1-2h)
- ✅ Fase 3: Registro no Servidor (45min)

### Sessão 2 (2-3 horas)
- ✅ Fase 4: Atualização de Fluxos (1-2h)
- ✅ Fase 5: Atualização de Workflows (1h)

### Sessão 3 (2-3 horas)
- ✅ Fase 6: Testes de Integração (1-2h)
- ✅ Fase 7: Documentação (1h)

**Total:** 6-9 horas

---

## ✅ Checklist Final

### Código
- [ ] Tipos atualizados (EstadoProjeto, EventTypes)
- [ ] logEvent aceita metadata
- [ ] listar-tarefas.ts criado
- [ ] atualizar-tarefa.ts criado
- [ ] Tools registradas no servidor
- [ ] Fluxos atualizados com ferramentas obrigatórias
- [ ] Workflows atualizados

### Testes
- [ ] Teste: Iniciar projeto + configurar modo
- [ ] Teste: Gerar contrato de API
- [ ] Teste: Criar e listar tarefas
- [ ] Teste: Fluxo completo Economy
- [ ] Teste: Frontend-first

### Documentação
- [ ] package.json → v2.0.0
- [ ] README.md atualizado
- [ ] MIGRACAO_V1_V2.md criado
- [ ] Todos os guias revisados

### Validação
- [ ] Compilação sem erros
- [ ] MCP Inspector mostra novas tools
- [ ] Projeto teste funciona end-to-end
- [ ] Economia de prompts validada

---

## 🎯 Critérios de Sucesso

### Funcional
- ✅ Todas as tools funcionam
- ✅ Fluxos integrados com ferramentas
- ✅ Frontend-first operacional
- ✅ Sistema de tarefas funcional

### Performance
- ✅ Economia de 45-70% em prompts
- ✅ Cache funcionando
- ✅ Validação incremental ativa

### Qualidade
- ✅ Sem erros de compilação
- ✅ Tipos corretos
- ✅ Documentação completa
- ✅ Testes passando

---

**Próxima Ação:** Iniciar Fase 1 - Atualizar tipos base
