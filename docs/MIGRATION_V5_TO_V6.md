# Migration Guide: Maestro MCP v5 → v6

> Sprint 2 — Simplificação e Refatoração

## Visão Geral

O Sprint 2 simplificou a arquitetura do Maestro MCP sem quebrar compatibilidade retroativa. As mudanças são todas internas ao servidor — nenhuma interface pública de tool foi removida.

---

## O que Mudou

### 1. Entry Point Unificado (`server.ts`)

**Antes (v5):** `stdio.ts` criava o servidor MCP inline com toda a lógica de setup.

**Depois (v6):** `server.ts` exporta um factory `createMaestroServer()` reutilizável. `stdio.ts` usa o factory.

```typescript
// v6 — stdio.ts simplificado
import { createMaestroServer } from "./server.js";
const server = createMaestroServer();
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2. Express Isolado (`tsconfig.stdio.json`)

**Antes:** O build incluía Express e dependências HTTP mesmo para modo STDIO.

**Depois:** `tsconfig.stdio.json` exclui `index.ts` do build padrão. Express fica isolado.

```bash
# Build STDIO (padrão — sem Express)
npm run build

# Build completo (inclui index.ts com Express)
npm run build:all
```

### 3. `index.ts` Marcado como Legado

O `index.ts` (HTTP/SSE) foi marcado como `@deprecated`. O SDK `@modelcontextprotocol/sdk` v1.25.3 não disponibiliza `StreamableHTTPServerTransport`. Quando disponível, será implementado em `server.ts` como segundo transport.

### 4. Remoção de `acao='avancar'` do `maestro`

**Antes (v5):** `maestro({ acao: 'avancar', ... })` delegava para `executar`.

**Depois (v6):** `maestro` não aceita mais `acao='avancar'`. Use `executar` diretamente.

```typescript
// ❌ v5 (deprecated)
maestro({ acao: 'avancar', diretorio: '...', estado_json: '...' })

// ✅ v6
executar({ acao: 'avancar', diretorio: '...', estado_json: '...' })
```

### 5. Tools Legadas em `legacy-tools.ts`

**Antes:** As 37 tools legadas estavam inline em `router.ts` (~400 linhas).

**Depois:** Movidas para `src/legacy-tools.ts`. `router.ts` importa de lá.

```typescript
// router.ts v6
import { legacyTools, legacyRedirects } from "./legacy-tools.js";
```

Nenhuma tool foi removida — tudo continua funcionando com warnings de deprecação.

### 6. `specialist-phase-handler.ts` Decomposto

**Antes:** 1297 linhas em um único arquivo.

**Depois:** 4 módulos menores em `src/handlers/`:

| Módulo | Responsabilidade | Linhas |
|--------|-----------------|--------|
| `specialist-phase-handler.ts` | Entry point + handlers de estado | ~715 |
| `field-normalizer.ts` | FIELD_ALIASES, normalizeFieldKey, getRequiredFields | ~90 |
| `prd-scorer.ts` | calculatePrdScore, SECTION_CHECKS, identifyPrdGaps | ~160 |
| `specialist-formatters.ts` | formatMissingFieldsByBlock, buildCollectionPrompt, getSpecialistQuestions | ~220 |

---

## Compatibilidade Retroativa

Todas as 37 tools legadas continuam funcionando. Elas retornam um aviso de deprecação no final da resposta:

```
> ⚠️ Deprecation: `avancar` será removida na v6. Use `executar(acao: 'avancar')` como alternativa.
```

---

## Tools Afetadas por Deprecação

| Tool Legada | Substituta v6 |
|-------------|---------------|
| `avancar` | `executar(acao: 'avancar')` |
| `salvar` | `executar(acao: 'salvar')` |
| `checkpoint` | `executar(acao: 'checkpoint')` |
| `status` | `maestro` |
| `proximo` | `executar(acao: 'avancar')` |
| `validar_gate` | `validar(tipo: 'gate')` |
| `avaliar_entregavel` | `validar(tipo: 'entregavel')` |
| `check_compliance` | `validar(tipo: 'compliance')` |
| `analisar_seguranca` | `analisar(tipo: 'seguranca')` |
| `analisar_qualidade` | `analisar(tipo: 'qualidade')` |
| `analisar_performance` | `analisar(tipo: 'performance')` |
| `gerar_relatorio` | `analisar(tipo: 'completo')` |
| `get_context` | `contexto` |
| `onboarding_orchestrator` | `executar(acao: 'avancar')` |
| `brainstorm` | `executar(acao: 'avancar')` |
| `prd_writer` | `executar(acao: 'avancar')` |
| `next_steps_dashboard` | `maestro` |

---

## Arquivos Novos / Modificados

### Novos
- `src/src/server.ts` — Factory `createMaestroServer()`
- `src/src/legacy-tools.ts` — Tools e redirects legados
- `src/src/handlers/field-normalizer.ts` — Normalização de campos PRD
- `src/src/handlers/prd-scorer.ts` — Scoring e validação do PRD
- `src/src/handlers/specialist-formatters.ts` — Formatação de output do especialista
- `src/tsconfig.stdio.json` — tsconfig sem Express

### Modificados
- `src/src/stdio.ts` — Usa `createMaestroServer()`
- `src/src/index.ts` — Marcado `@deprecated`
- `src/src/router.ts` — Importa legacyTools de `legacy-tools.ts`
- `src/src/tools/maestro-tool.ts` — Removido `acao='avancar'`
- `src/src/handlers/specialist-phase-handler.ts` — Decomposto (715 linhas)
- `src/package.json` — Scripts `build` e `build:all` atualizados

---

## Próximos Passos (Sprint 3+)

- **Sprint 3:** Ativar `estado.tasks` com TaskDecomposer, scoring contextual por fase
- **Sprint 4:** Remover tools legadas completamente, workspace manager multi-projeto
