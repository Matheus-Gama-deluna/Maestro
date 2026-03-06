# Roadmap de Evolução — Maestro MCP v6

**Data:** 25/02/2026  
**Baseado em:** ANALISE_TECNICA_V55.md + ANALISE_EXPLORATORIA_20_PERGUNTAS.md  
**Objetivo:** Plano acionável para evolução do Maestro de v5.5 para v6+  

---

## Princípios Norteadores

1. **Simplificar antes de adicionar** — Remover legado e complexidade antes de criar features novas
2. **Type-safety como fundação** — Eliminar `any` antes de expandir funcionalidades
3. **Testabilidade como requisito** — Nenhum módulo novo sem testes; módulos refatorados ganham testes
4. **Compatibilidade pragmática** — Migration guides para breaking changes, não backward-compat infinito

---

## Visão de Entregas

```
v5.6 — Stabilization    (2-3 semanas)  → Bugs críticos, tipagem, testes
v6.0 — Simplification   (3-4 semanas)  → Entry point único, remoção de legado, decomposição
v6.5 — Code Generation  (4-6 semanas)  → Task-Driven Development, validação de código
v7.0 — Platform         (8-12 semanas) → Multi-agent, marketplace de skills, dashboard
```

---

## Sprint 1: Stabilization (v5.6)

**Duração:** 2-3 semanas  
**Objetivo:** Corrigir bugs críticos, tipar o estado, criar testes de fluxo principal  
**Resultado:** Build estável com cobertura nos fluxos mais usados

### Task 1.1 — Sincronizar Versão [ERRO-016]
- **Arquivo:** `src/src/constants.ts:9`
- **Ação:** Mudar `MAESTRO_VERSION = "5.2.0"` para ler de `package.json` ou sincronizar manualmente para `"5.5.3"`
- **Complexidade:** Trivial (1 linha)
- **Critério:** `constants.ts` e `package.json` com mesma versão

### Task 1.2 — Tipar `onboarding` [ERRO-005]
- **Arquivo:** `src/src/types/index.ts:125`
- **Ação:** Substituir `onboarding?: any` por `onboarding?: OnboardingState`
- **Dependência:** Verificar/criar tipo `OnboardingState` em `types/onboarding.ts`
- **Impacto:** Corrigir todos os `(estado as any).onboarding` em:
  - `flow-engine.ts:234,266,390`
  - `avancar.ts:134`
  - `specialist-phase-handler.ts` (múltiplos)
- **Complexidade:** Média (precisa validar que o tipo cobre todos os campos usados)
- **Critério:** Zero `as any` para onboarding no codebase. `tsc --noEmit` passa.

### Task 1.3 — Restaurar `aguardando_classificacao` [ERRO-008]
- **Arquivo:** `src/src/handlers/specialist-phase-handler.ts:670-671`
- **Ação:** No `handleApproved()`, adicionar `estado.aguardando_classificacao = true` antes de persistir
- **Complexidade:** Trivial (1 linha)
- **Critério:** Fluxo specialist_approved → classificação funciona sem loop

### Task 1.4 — Anti-loop por Diretório [ERRO-003]
- **Arquivo:** `src/src/tools/consolidated/avancar.ts:46-60`
- **Ação:** Substituir variáveis globais `_lastCallHash`/`_identicalCallCount` por `Map<string, LoopState>`
- **Complexidade:** Baixa

```typescript
// De:
let _lastCallHash = '';
let _identicalCallCount = 0;

// Para:
const loopStates = new Map<string, { hash: string; count: number }>();

function checkAntiLoop(diretorio: string, hash: string): boolean {
    const state = loopStates.get(diretorio) || { hash: '', count: 0 };
    if (state.hash === hash) {
        state.count++;
        if (state.count >= MAX_IDENTICAL_CALLS) {
            loopStates.delete(diretorio);
            return true;
        }
    } else {
        state.hash = hash;
        state.count = 1;
    }
    loopStates.set(diretorio, state);
    return false;
}
```

- **Critério:** Em modo HTTP, sessões concorrentes não interferem entre si

### Task 1.5 — Normalizar Paths no StateService [ERRO-010]
- **Arquivo:** `src/src/services/state.service.ts:79-92`
- **Ação:** Substituir manipulação manual de strings por `path.dirname()` e `path.join()`

```typescript
// De:
const dir = fullPath.substring(0, fullPath.lastIndexOf("/")).replace(/\\/g, "/");

// Para:
import { dirname } from "path";
await mkdir(dirname(fullPath), { recursive: true });
```

- **Critério:** `saveFile` funciona corretamente no Windows com paths mistos

### Task 1.6 — Testes de Fluxo Principal
- **Novos arquivos:**
  - `src/src/__tests__/maestro-tool.test.ts` — handleNoProject, setup, criar_projeto
  - `src/src/__tests__/avancar-flow.test.ts` — specialist_approved → classificação → fase_ativa
  - `src/src/__tests__/proximo-integration.test.ts` — leitura de disco → scoring → gate
- **Complexidade:** Alta (requer setup de filesystem temporário e mocks de skills)
- **Critério:** ≥80% coverage nos 3 fluxos testados. CI green.

### Task 1.7 — Remover Código Morto
- **Ações:**
  - Remover `formatArgsPreview` local em `maestro-tool.ts:455-464` (duplicada)
  - Remover `condition: (s) => true` em `flow-engine.ts:127`
  - Atualizar fallback de erro para apontar para `maestro` ao invés de `status` em `errors/index.ts:208-210`
- **Complexidade:** Trivial
- **Critério:** Sem código morto detectado por linter

---

## Sprint 2: Simplification (v6.0)

**Duração:** 3-4 semanas  
**Objetivo:** Unificar entry points, remover legado, decompor god files  
**Resultado:** Codebase 40% menor, zero tools legadas, módulos <300 linhas

### Task 2.1 — Unificar Entry Points [ERRO-001]
- **Ação:**
  1. Criar `src/src/server.ts` — factory function `createMaestroServer()` com todos os handlers
  2. Refatorar `stdio.ts` para apenas: criar server → conectar `StdioServerTransport`
  3. Refatorar `index.ts` para usar `StreamableHTTPServerTransport` do SDK MCP
  4. Ambos importam handlers de `server.ts`
- **Dependência:** SDK MCP `^1.25.3` (já tem `StreamableHTTPServerTransport`)
- **Complexidade:** Alta
- **Critério:** Um único `server.ts` com handlers. `stdio.ts` e `index.ts` com <20 linhas cada.

```typescript
// server.ts (novo)
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { routeToolCall, getRegisteredTools } from "./router.js";
import { listPrompts, getPrompt } from "./handlers/shared-prompt-handler.js";
import { listResources, readResource } from "./handlers/shared-resource-handler.js";
import { MAESTRO_NAME, MAESTRO_VERSION } from "./constants.js";

export function createMaestroServer() {
    const server = new Server(
        { name: MAESTRO_NAME, version: MAESTRO_VERSION },
        { capabilities: { resources: {}, tools: {}, prompts: {} } }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getRegisteredTools(),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return await routeToolCall(name, (args as Record<string, unknown>) || {});
    });

    // ... resources, prompts handlers

    return server;
}
```

### Task 2.2 — Mover imports de `index.ts` para o topo [ERRO-002]
- **Nota:** Se Task 2.1 for completada, este erro é automaticamente resolvido
- **Alternativa (se 2.1 demorar):** Mover imports nas linhas 348-353 para o topo do arquivo

### Task 2.3 — Isolar Express como dependência opcional [ERRO-009]
- **Ação:**
  - Mover `express` e `cors` para `dependencies` OU
  - Excluir `index.ts` do build de produção (`tsconfig.json` → `exclude: ["src/index.ts"]`)
- **Recomendação:** Excluir do build. O uso via npx/STDIO é 99% do uso real.
- **Critério:** `npm install @maestro-ai/mcp-server` funciona sem express

### Task 2.4 — Decompor specialist-phase-handler.ts [ERRO-006]
- **Arquivo original:** 1296 linhas
- **Novos módulos:**

| Módulo | Responsabilidade | Linhas estimadas |
|--------|-----------------|-----------------|
| `prd-scorer.ts` | Scoring de PRD, gap detection, quality metrics | ~200 |
| `field-normalizer.ts` | FIELD_ALIASES, normalizeFieldKey, fuzzy matching | ~150 |
| `specialist-state-machine.ts` | Transições: active→collecting→generating→validating→approved | ~250 |
| `specialist-formatters.ts` | Formatação de output, prompts, instruções | ~200 |
| `specialist-phase-handler.ts` | Orquestrador fino que delega para os módulos acima | ~200 |

- **Complexidade:** Alta (precisa manter todos os fluxos funcionando)
- **Critério:** Cada módulo <300 linhas. Todos os testes existentes passam. Novos testes para cada módulo.

### Task 2.5 — Remover Delegação maestro→executar [ERRO-007]
- **Arquivo:** `src/src/tools/maestro-tool.ts:109-112`
- **Ação:** Remover `acao: "avancar"` do `maestroToolSchema.properties.acao.enum`
- **Impacto:** A IA nunca mais chama `maestro({acao: "avancar"})`. Usa `executar({acao: "avancar"})` diretamente.
- **Critério:** `maestroToolSchema` não tem "avancar" como opção. Zero loop maestro↔executar.

### Task 2.6 — Remover Tools Legadas
- **Ação em fases:**
  1. **Audit:** Verificar quais das 37 tools legadas são realmente chamadas (grep nos logs/testes)
  2. **Migration Guide:** Criar `MIGRATION_V5_TO_V6.md` com tabela de equivalência
  3. **Remover definições** de `router.ts:199-493`
  4. **Mover handlers** internos usados (como `proximo`) para `tools/internal/`
- **Critério:** `router.ts` < 200 linhas. `getRegisteredTools()` retorna apenas 5 tools.

### Task 2.7 — Migrar Middlewares Deprecated [ERRO-011]
- **Ação:** Substituir `applySmartMiddlewares`, `applyPersistenceMiddlewares`, `applyMiddlewares`, `applyLightMiddlewares` por `applyOrchestrationPipeline` em todas as tools restantes
- **Depois:** Remover as funções deprecated de `middleware/index.ts`
- **Critério:** Zero `console.warn` de deprecation nos logs

### Task 2.8 — Validar `estado_json` Vazio [ERRO-012]
- **Arquivo:** `src/src/flows/onboarding-orchestrator.ts:72-80`
- **Ação:** Mudar `if (!args.estado_json)` para `if (!args.estado_json || args.estado_json.trim().length === 0)`
- **Complexidade:** Trivial

---

## Sprint 3: Code Generation (v6.5)

**Duração:** 4-6 semanas  
**Objetivo:** Suportar geração de código real com validação granular  
**Resultado:** Task-Driven Development para fases de código

### Task 3.1 — Ativar `EstadoProjeto.tasks`
- **Contexto:** O tipo `tasks` já existe em `types/index.ts:100-122` mas nunca é usado
- **Ação:**
  1. Criar `TaskDecomposer` service que converte entregável da fase em epics→stories→tasks
  2. Popular `estado.tasks` durante a fase de Arquitetura (a fase que define a estrutura do código)
  3. Ajustar `proximo.ts` para iterar tasks dentro de fases de código
- **Complexidade:** Alta
- **Critério:** Estado persiste tasks. `maestro()` mostra progresso por task.

### Task 3.2 — Entregáveis Multi-Arquivo
- **Contexto:** `saveMultipleFiles` existe em `StateService` mas fases geram 1 entregável
- **Ação:**
  1. Ajustar gate para aceitar diretório ao invés de arquivo único
  2. Criar `CodebaseValidator` que verifica: compila? imports válidos? sem circular deps?
  3. Cada task gera 1-3 arquivos + testes
- **Complexidade:** Alta
- **Critério:** Uma fase de Backend pode gerar N arquivos, validados individualmente.

### Task 3.3 — TDD Integrado
- **Ação:**
  1. Criar `TestStubGenerator` que gera `.test.ts` a partir da skill/template
  2. Ajustar `ValidationPipeline` para detectar e validar presença de testes
  3. Criar sub-ação `executar({acao: "avancar", sub_acao: "test_first"})` para modo TDD
- **Complexidade:** Média
- **Critério:** Especialista gera test stubs antes do código. Gate verifica existência de testes.

### Task 3.4 — Scoring Contextual por Tipo de Fase
- **Ação:** Expandir `calcularQualityScore` para pesos diferentes por tipo de fase:

```typescript
const SCORE_WEIGHTS = {
    documento:  { estrutura: 0.20, checklist: 0.40, qualidade: 0.40, threshold: 65 },
    design:     { estrutura: 0.30, checklist: 0.30, qualidade: 0.40, threshold: 70 },
    codigo:     { estrutura: 0.10, checklist: 0.30, qualidade: 0.60, threshold: 75 },
};
```

- **Critério:** Gates de código são mais rigorosos que gates de documento.

### Task 3.5 — Validação Estática de Código
- **Ação:**
  1. Parse AST via `ts.createSourceFile` (sem executar tsc completo)
  2. Verificar: exports existem, imports resolvem, zero `any` em código gerado
  3. Integrar como step adicional no `ValidationPipeline`
- **Complexidade:** Alta
- **Critério:** Gate de código detecta erros de tipo sem executar `tsc`.

---

## Sprint 4: Platform Foundation (v7.0)

**Duração:** 8-12 semanas  
**Objetivo:** Preparar o Maestro para ser uma plataforma extensível  
**Resultado:** CLI standalone, structured logging, marketplace de skills

### Task 4.1 — Tool `diagnosticar`
- **Ação:** Nova tool pública (6ª tool) para debug e troubleshooting
- **Retorno:** Estado resumido, flags ativas, inconsistências, último erro, sugestão de ação
- **Critério:** `diagnosticar({diretorio: "..."})` retorna diagnóstico completo em JSON estruturado

### Task 4.2 — Structured Logging
- **Ação:** Substituir `console.log/warn/error` por logger estruturado
- **Campos:** `{ timestamp, level, tool, diretorio, fase, message, context }`
- **Output:** STDERR (para STDIO) ou arquivo `.maestro/logs/maestro.log`
- **Critério:** Logs filtráveis por tool, diretório, nível. Zero `console.log` direto.

### Task 4.3 — CLI Standalone
- **Ação:** Criar CLI básico:
  - `maestro init` — cria projeto (equivale a `maestro({acao: "criar_projeto"})`)
  - `maestro status` — mostra status (equivale a `maestro()`)
  - `maestro validate` — valida fase atual (equivale a `validar()`)
  - `maestro diagnose` — diagnóstico (equivale a `diagnosticar()`)
- **Critério:** `npx @maestro-ai/mcp-server status` funciona no terminal

### Task 4.4 — Estado Particionado
- **Ação:** Separar `estado.json` em:
  - `estado-core.json` — metadados do projeto (~1KB)
  - `estado-tasks.json` — tasks e progresso (~5KB para projetos grandes)
  - `estado-entregaveis.json` — referências a entregáveis (~2KB)
- **Critério:** Carregamento parcial possível. `maestro()` carrega apenas core.

### Task 4.5 — Marketplace de Skills (Foundation)
- **Ação:**
  1. Padronizar formato de skill: `skill.manifest.json` com metadados
  2. Criar `skill install <nome>` no CLI
  3. Registry inicial: skills builtin do Maestro
- **Critério:** `maestro skill list` mostra skills disponíveis. `maestro skill install react-frontend` adiciona skill.

### Task 4.6 — Remover `[x: string]: unknown` do ToolResult
- **Arquivo:** `src/src/types/index.ts:211`
- **Ação:** Remover index signature. Campos internos (`files`, `estado_atualizado`, `next_action`, etc.) são tipados explicitamente.
- **Dependência:** Verificar que SDK MCP aceita o tipo sem index signature
- **Critério:** Zero campos custom não-tipados no ToolResult.

---

## Matriz de Dependências

```
Task 1.2 (tipar onboarding) ← Task 2.4 (decompor specialist)
Task 1.6 (testes)           ← Task 1.1-1.5 (bugs corrigidos)
Task 2.1 (entry point)      ← independente
Task 2.4 (decompor)         ← Task 1.2 (tipos corretos)
Task 2.5 (remover delegação)← independente
Task 2.6 (remover legadas)  ← Task 2.7 (migrar middlewares)
Task 3.1 (tasks)            ← Task 2.4 (specialist decomposto)
Task 3.2 (multi-file)       ← Task 3.1 (tasks ativadas)
Task 3.4 (scoring)          ← independente
Task 4.1 (diagnosticar)     ← Task 1.6 (testes como modelo)
Task 4.2 (logging)          ← independente (pode ser feito a qualquer momento)
```

---

## Métricas de Sucesso

### v5.6 (Stabilization)
- [ ] Zero `as any` para onboarding
- [ ] ≥80% coverage nos 3 fluxos principais
- [ ] Build compila sem warnings
- [ ] Versão sincronizada code↔package.json

### v6.0 (Simplification)
- [ ] 1 entry point com 2 transports (STDIO + HTTP)
- [ ] 0 tools legadas no router
- [ ] 0 middlewares deprecated
- [ ] Nenhum arquivo >300 linhas (exceto testes)
- [ ] `router.ts` < 200 linhas

### v6.5 (Code Generation)
- [ ] `tasks` populado e persistido durante fases de código
- [ ] Gate de código verifica presença de testes
- [ ] Scoring diferenciado por tipo de fase
- [ ] Validação estática sem executar compilador externo

### v7.0 (Platform)
- [ ] CLI funcional com 4+ comandos
- [ ] Structured logging com filtros
- [ ] Estado particionado (carregamento parcial)
- [ ] Tool `diagnosticar` operacional

---

## Estimativa de Esforço

| Sprint | Duração | Tasks | Complexidade Geral | Risco |
|--------|---------|-------|-------------------|-------|
| Sprint 1 (v5.6) | 2-3 semanas | 7 tasks | Média | Baixo — são bug fixes e testes |
| Sprint 2 (v6.0) | 3-4 semanas | 8 tasks | Alta | Médio — refatoração estrutural |
| Sprint 3 (v6.5) | 4-6 semanas | 5 tasks | Alta | Alto — feature nova com muitos edge cases |
| Sprint 4 (v7.0) | 8-12 semanas | 6 tasks | Muito Alta | Alto — mudança de paradigma |

**Recomendação de execução:** Sprints 1 e 2 em paralelo onde possível (bugs + unificação de entry point são independentes). Sprint 3 só após Sprint 2 concluída. Sprint 4 é iterativa e pode se sobrepor com Sprint 3.

---

## Quick Wins (podem ser feitos hoje)

Ações de impacto imediato que não requerem refatoração:

1. **Sincronizar versão** — `constants.ts:9` → `"5.5.3"` (1 minuto)
2. **Remover `formatArgsPreview` duplicada** — `maestro-tool.ts:455-464` (1 minuto)
3. **Remover `condition: (s) => true`** — `flow-engine.ts:127` (1 minuto)
4. **Corrigir fallback de erro** — `errors/index.ts:208-210` → `tool: "maestro"` (1 minuto)
5. **Validar estado_json vazio** — `onboarding-orchestrator.ts:72-80` (2 minutos)
6. **Restaurar `aguardando_classificacao`** — `specialist-phase-handler.ts:670` (1 minuto)

**Total:** ~7 minutos para 6 fixes que eliminam 4 erros da análise técnica.

---

*Roadmap criado em 25/02/2026.*  
*Próxima revisão: após conclusão do Sprint 1.*
