# Plano de Melhorias Maestro v9.0 — Roadmap de Evolução

> **Data:** 2026-02-27
> **Versão Atual:** package.json=5.6.5 | constants.ts=8.0.0 | README=5.5.0 | CHANGELOG=5.5.0
> **Base Git:** 216fd26 (HEAD main, 2026-02-27)
> **Escopo:** 6 Sprints + Governança de Versão
> **Autor:** Análise automatizada sobre recomendações de especialista

---

## 0. Diagnóstico do Estado Atual

### 0.1 Inconsistências de Versão (URGENTE)

| Artefato | Versão | Local |
|----------|--------|-------|
| `package.json` | 5.6.5 | `src/package.json:3` |
| `constants.ts` | 8.0.0 | `src/src/constants.ts:9` |
| `constants.test.ts` | valida 8.0.0 | `src/src/tests/constants.test.ts:7` |
| `README.md` (raiz) | 5.5.0 | `README.md:1` |
| `CHANGELOG.md` | último=5.5.0 | `src/CHANGELOG.md:9` |
| `docs/README.md` | "06/02/2026" | `docs/README.md:3` |

**Impacto:** npm publica 5.6.5 mas o server reporta 8.0.0. Usuários não sabem qual é a versão real. Teste valida 8.0.0 mas npm registry mostra 5.6.5.

### 0.2 Listas de Fases Técnicas — Divergências Encontradas

| Arquivo | Lista de Fases de Código | Observação |
|---------|--------------------------|------------|
| `code-phase-handler.ts:40` | `['Frontend', 'Backend', 'Integração', 'Deploy Final']` | Constante local `CODE_PHASE_NAMES` |
| `avancar.ts:253-254` | `['Frontend', 'Backend', 'Integração', 'Deploy Final']` | Lista inline hardcoded (DUPLICADA) |
| `proximo.ts:1171-1172` | `['Backend', 'Frontend', 'Integração', 'Testes']` | **DIVERGENTE** — inclui `Testes`, exclui `Deploy Final` |
| `proximo.ts:982-1004` | `PHASE_TYPE_MAP` (17 entradas) | Mapa completo, mas local a proximo.ts |

**Impacto:** `proximo.ts` gera tasks para "Testes" (que é fase de documento, não de código) e **não gera** tasks para "Deploy Final" (que é fase de código real). Roteamento inconsistente.

### 0.3 Validação de Fases de Código

O fluxo atual para fases de código é:

```
avancar.ts → detecta isCodePhase → code-phase-handler.ts → SETUP/WORKING/GATE
                                                                    ↓
                                                         delegateToProximo()
                                                                    ↓
                                                            proximo.ts (textual)
```

**Problema:** `delegateToProximo()` (code-phase-handler.ts:664) converte o manifest em texto markdown e delega para `proximo.ts`, que valida com `ValidationPipeline.validateDeliverable()` — um validador de **keywords em texto**, não de artefatos de código. O manifest.json é ignorado.

### 0.4 Rastreabilidade

- `CodeManifest.user_stories` existe no tipo (`code-manifest.ts:20`) mas é populado como array vazio em `createEmptyManifest()` (`code-phase-handler.ts:618`)
- `CodeManifest.stack` é `{ framework: '', language: 'TypeScript' }` — nunca preenchido da arquitetura
- Nenhum resumo por fase liga US → arquivos → status

### 0.5 Cobertura de Testes

| Área | Testes Existentes | Cobertura |
|------|-------------------|-----------|
| `task-decomposer` | 8 testes (só `decomposeArchitectureToTasks`) | ❌ `decomposeBacklogToTasks` sem teste |
| `code-phase-handler` | 0 testes | ❌ Nenhum |
| Listas de fases técnicas | 0 testes | ❌ Nenhum |
| State machine (setup→working→gate) | 0 testes | ❌ Nenhum |

### 0.6 Entry Point HTTP Legado

- `src/src/index.ts` — Express HTTP/SSE, marcado como `@deprecated`
- `src/src/stdio.ts` — STDIO principal, usa `createMaestroServer()` de `server.ts`
- HTTP não incluído no build padrão (`npm run build` usa `tsconfig.stdio.json`)
- Funciona via `npm run build:all` / `npm run dev:http`

### 0.7 Modularização do proximo.ts

`proximo.ts` tem **1451 linhas** com responsabilidades misturadas:
- Validação de entregáveis (score, keywords, sinônimos)
- Bloqueio/aprovação de gate
- Classificação progressiva
- Geração de tasks (chamada ao TaskDecomposer)
- Transição de fase
- Watcher lifecycle
- Menções e contexto

---

## 1. Arquitetura das Sprints

### Dependências entre Sprints

```
Sprint 0 (Governança) ──────────────────────────────> independente
Sprint 1 (Paridade Fases) ──────┐
Sprint 3 (Validação Artefatos) ─┼──> Sprint 4 (Rastreabilidade)
Sprint 5 (Testes) ──────────────┘
Sprint 6 (Modularização + HTTP) ──────────────────────> independente
```

### Visão Geral

| Sprint | Nome | Prioridade | Estimativa | Arquivos Afetados |
|--------|------|-----------|------------|-------------------|
| **0** | Governança de Versão | P0 | 1h | 6 arquivos |
| **1** | Paridade e Consistência de Fases | P0 | 2-3h | 5 arquivos |
| **3** | Validação Orientada a Artefatos | P1 | 4-5h | 4 arquivos |
| **4** | Rastreabilidade Ponta-a-Ponta | P1 | 3-4h | 3 arquivos |
| **5** | Testes e Robustez Operacional | P0 | 4-5h | 4 arquivos novos |
| **6** | Modularização + Limpeza | P2 | 3-4h | 5 arquivos |

**Total estimado:** ~18-22h

---

## Sprint 0 — Governança de Versão e Documentação (P0)

### Objetivo
Alinhar TODOS os artefatos para uma versão única e oficial. Eliminar confusão entre npm registry e runtime.

### Decisão Arquitetural
**Versão canônica: `5.7.0`** — Incremento major justificado pelas mudanças v8.0 (code-phase-handler, task-decomposer v2, manifest) e este plano v9.0.

### Tarefas

| # | Tarefa | Arquivo | Mudança |
|---|--------|---------|---------|
| 0.1 | Alinhar package.json | `src/package.json:3` | `"version": "5.6.5"` → `"5.7.0"` |
| 0.2 | Alinhar constants.ts | `src/src/constants.ts:9` | `"8.0.0"` → `"5.7.0"` |
| 0.3 | Alinhar teste | `src/src/tests/constants.test.ts:7` | `"8.0.0"` → `"5.7.0"` |
| 0.4 | Atualizar README raiz | `README.md:1,8` | `v5.5.0` → `v5.7.0` |
| 0.5 | Adicionar bloco ao CHANGELOG | `src/CHANGELOG.md` | Novo bloco `[5.7.0]` com todas as mudanças |
| 0.6 | Atualizar docs/README | `docs/README.md:3` | Data e versão atualizadas |

### Critérios de Aceite
- [ ] `grep -r "5\.5\.0\|5\.6\.5\|8\.0\.0" src/` retorna 0 hits (exceto CHANGELOG histórico)
- [ ] `npm run test` passa com versão 5.7.0
- [ ] `npm run build` gera build limpo

---

## Sprint 1 — Paridade e Consistência de Fases (P0)

### Objetivo
Eliminar divergências de comportamento entre Frontend/Backend/Integração/Deploy. Uma única fonte de verdade.

### Análise do Problema

Atualmente existem **4 definições diferentes** de "fases de código":

```typescript
// code-phase-handler.ts:40
const CODE_PHASE_NAMES = ['Frontend', 'Backend', 'Integração', 'Deploy Final'];

// avancar.ts:253-254 (inline)
['Frontend', 'Backend', 'Integração', 'Deploy Final'].some(k => faseAtualInfo.nome.includes(k));

// proximo.ts:1171-1172 (inline) — DIVERGENTE!
['Backend', 'Frontend', 'Integração', 'Testes'].some(k => proximaFaseInfo2.nome.includes(k));

// proximo.ts:982-1004 (PHASE_TYPE_MAP) — todas as fases mapeadas, mas local
```

### Tarefas

| # | Tarefa | Arquivo | Detalhes |
|---|--------|---------|----------|
| 1.1 | Criar constante compartilhada | `src/src/flows/types.ts` | Exportar `CODE_PHASE_NAMES` e `PHASE_TYPE_MAP` como constantes do módulo de fluxos |
| 1.2 | Criar helper `isCodePhase()` centralizado | `src/src/flows/types.ts` | Função exportada que verifica se nome de fase é de código |
| 1.3 | Substituir em code-phase-handler.ts | `src/src/handlers/code-phase-handler.ts` | Importar `CODE_PHASE_NAMES` e `isCodePhase` de flows/types |
| 1.4 | Substituir em avancar.ts | `src/src/tools/consolidated/avancar.ts` | Substituir lista inline por import de `isCodePhase` |
| 1.5 | Corrigir proximo.ts | `src/src/tools/proximo.ts` | Trocar `['Backend', 'Frontend', 'Integração', 'Testes']` por import de `CODE_PHASE_NAMES` |
| 1.6 | Mover PHASE_TYPE_MAP | `src/src/tools/proximo.ts` → `src/src/flows/types.ts` | Exportar como constante compartilhada |
| 1.7 | Decidir "Deploy Final" vs "Testes" | N/A | **Decisão:** `Testes` é fase de DOCUMENTO (plano-testes.md), não de código. `Deploy Final` é fase de código (release.md + CI/CD). Manter `CODE_PHASE_NAMES = ['Frontend', 'Backend', 'Integração', 'Deploy Final']` |

### Implementação Proposta

```typescript
// src/src/flows/types.ts (ADICIONAR)

/** Nomes canônicos das fases de desenvolvimento de código */
export const CODE_PHASE_NAMES = ['Frontend', 'Backend', 'Integração', 'Deploy Final'] as const;

/** Verifica se uma fase é de código (desenvolvimento) */
export function isCodePhase(faseNome: string | undefined): boolean {
    if (!faseNome) return false;
    return CODE_PHASE_NAMES.some(k => faseNome.includes(k));
}

/** Classificação de tipo de fase para Smart Auto-Flow */
export const PHASE_TYPE_MAP: Record<string, 'input_required' | 'derived' | 'technical'> = {
    'Produto': 'input_required',
    'Requisitos': 'derived',
    'UX Design': 'derived',
    // ... (mover de proximo.ts)
};
```

### Critérios de Aceite
- [ ] Uma única fonte de verdade em `flows/types.ts`
- [ ] Zero listas hardcoded em `avancar.ts`, `proximo.ts`, `code-phase-handler.ts`
- [ ] `grep -rn "Frontend.*Backend.*Integração" src/src/` mostra apenas `flows/types.ts`
- [ ] `Testes` não aparece em `CODE_PHASE_NAMES`
- [ ] `Deploy Final` aparece em `CODE_PHASE_NAMES`
- [ ] Build OK: `npx tsc --noEmit`

---

## Sprint 3 — Validação Orientada a Artefatos (P1)

### Objetivo
Elevar confiabilidade dos gates de código. Validar por existência de artefatos reais, não keywords em texto.

### Análise do Problema Atual

```
code-phase-handler.ts:handleGate()
  → gera manifest.json
  → gera summary markdown
  → delegateToProximo()
    → converte manifest para texto markdown
    → proximo.ts valida com ValidationPipeline.validateDeliverable()
      → busca keywords no texto
      → score baseado em matchRatio de keywords
```

O manifest.json (que lista arquivos reais, tasks, user stories) é **completamente ignorado** na validação. O gate aprova/reprova baseado em se o texto do summary contém palavras como "componentes", "testes", "endpoints".

### Tarefas

| # | Tarefa | Arquivo | Detalhes |
|---|--------|---------|----------|
| 3.1 | Criar CodeValidator | `src/src/gates/code-validator.ts` (NOVO) | Valida fase de código por manifest + arquivos no disco |
| 3.2 | Integrar no handleGate | `src/src/handlers/code-phase-handler.ts` | handleGate usa CodeValidator em vez de delegateToProximo |
| 3.3 | Fallback textual | `src/src/gates/code-validator.ts` | Se manifest não existe, cair no fluxo textual existente |
| 3.4 | Ajustar DeliverableValidator | `src/src/core/validation/` | Tratar entregáveis com tipo `*-code` como fases técnicas |

### Implementação Proposta — CodeValidator

```typescript
// src/src/gates/code-validator.ts

interface CodeValidationResult {
    score: number;           // 0-100
    approved: boolean;       // score >= 70
    breakdown: {
        arquivos: number;    // 50% — arquivos do manifest existem no disco
        tasks: number;       // 30% — tasks do backlog marcadas done
        manifest: number;    // 20% — manifest gerado corretamente
    };
    details: {
        arquivos_encontrados: string[];
        arquivos_faltando: string[];
        tasks_done: number;
        tasks_total: number;
        user_stories_cobertas: string[];
    };
}

export function validateCodePhase(
    manifest: CodeManifest,
    diretorio: string,
    tasks: TaskItem[],
    faseNumero: number
): CodeValidationResult {
    // 1. Verificar existência de arquivos (50%)
    // 2. Verificar progresso de tasks por user story (30%)
    // 3. Verificar manifest gerado corretamente (20%)
    // 4. Fallback textual como contingência
}
```

### Fluxo Novo no handleGate

```
handleGate()
  → gera manifest
  → chama validateCodePhase(manifest, dir, tasks, fase)
  → se score >= 70 → avança fase
  → se score 50-69 → aguarda aprovação do usuário
  → se score < 50 → bloqueia com instruções
```

### Critérios de Aceite
- [ ] Gate reprova quando artefato obrigatório (ex: `src/` ou `components/`) está ausente, mesmo com texto "bonito" no summary
- [ ] Gate aprova quando arquivos existem + tasks done + manifest consistente
- [ ] Fallback para validação textual quando manifest não existe
- [ ] Build OK

---

## Sprint 4 — Rastreabilidade Ponta-a-Ponta (P1)

### Objetivo
Ligar backlog → implementação → evidência de entrega. Cada US deve ser rastreável até os arquivos que a implementam.

### Análise do Estado Atual

- `CodeManifest.user_stories`: definido no tipo mas **sempre vazio** (`createEmptyManifest`)
- `CodeManifest.stack`: `{ framework: '', language: 'TypeScript' }` — nunca preenchido
- Nenhuma conexão entre tasks done e US do backlog
- Nenhum resumo mostrando "US-020 → arquivos X, Y, Z → status done"

### Tarefas

| # | Tarefa | Arquivo | Detalhes |
|---|--------|---------|----------|
| 4.1 | Popular manifest.user_stories | `src/src/handlers/code-phase-handler.ts` | No handleGate, mapear tasks done → US pai → popular user_stories com status |
| 4.2 | Popular manifest.stack | `src/src/handlers/code-phase-handler.ts` | No handleSetup, ler arquitetura e extrair stack via `extractStackInfo` já existente |
| 4.3 | Gerar resumo rastreável | `src/src/handlers/code-phase-handler.ts` | `generateSummaryMarkdown` mostra: `US-020 → [file1, file2] → done` |
| 4.4 | Expor no output do handler | `src/src/handlers/code-phase-handler.ts` | Output inclui tabela de rastreabilidade |
| 4.5 | Expor no contexto da próxima fase | `src/src/tools/proximo.ts` | Ao avançar para Integração, mostrar quais US do Frontend e Backend foram concluídas |

### Formato do Resumo Rastreável

```markdown
# Frontend — Resumo de Implementação

## Rastreabilidade US → Código

| US | Título | Status | Arquivos |
|----|--------|--------|----------|
| US-020 | CRUD Produtos | ✅ done | `components/ProductList.tsx`, `hooks/useProducts.ts`, `pages/products/index.tsx` |
| US-030 | Estoque real-time | ✅ done | `components/StockDashboard.tsx`, `hooks/useStock.ts` |
| US-050 | Dashboard KPIs | ⏳ in_progress | `pages/dashboard/index.tsx` |

## Stack
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Extras:** Tailwind, Zustand, React Query

## Progresso
- **Tasks:** 8/12 (67%)
- **US Concluídas:** 2/4
```

### Critérios de Aceite
- [ ] Cada fase de código mostra quais US foram concluídas
- [ ] Resumo final deixa explícito "US X → arquivos Y → status Z"
- [ ] manifest.stack preenchido da arquitetura
- [ ] manifest.user_stories populado com status real
- [ ] Build OK

---

## Sprint 5 — Testes e Robustez Operacional (P0)

### Objetivo
Reduzir regressões. Cobertura mínima dos fluxos novos + testes de consistência.

### Análise de Gap de Testes

**Existente (24 arquivos de teste):**
- `task-decomposer.test.ts` — 8 testes, só `decomposeArchitectureToTasks`
- `constants.test.ts` — 2 testes (versão)
- `flow-engine.test.ts`, `prd-validation.test.ts`, etc. — fases de documento

**Faltando:**
- `decomposeBacklogToTasks` — 0 testes (função nova em v8.0)
- `code-phase-handler` — 0 testes (handler novo em v8.0)
- Consistência de listas de fases — 0 testes
- State machine (setup→working→gate→completed) — 0 testes
- CodeValidator — 0 testes (será criado na Sprint 3)

### Tarefas

| # | Tarefa | Arquivo | Detalhes |
|---|--------|---------|----------|
| 5.1 | Testes decomposeBacklogToTasks | `src/src/tests/task-decomposer-backlog.test.ts` (NOVO) | Filtro por Frontend/Backend/Integração/Deploy; parsing de tabela; fallback |
| 5.2 | Testes code-phase-handler | `src/src/tests/code-phase-handler.test.ts` (NOVO) | State machine: setup→working→gate→completed; task marking; manifest generation |
| 5.3 | Testes consistência fases | `src/src/tests/phase-consistency.test.ts` (NOVO) | Verifica que CODE_PHASE_NAMES é a única fonte; verifica que proximo.ts e avancar.ts importam de flows/types |
| 5.4 | Testes CodeValidator | `src/src/tests/code-validator.test.ts` (NOVO) | Validação por artefatos; scoring; fallback textual |
| 5.5 | Testes integração avancar | `src/src/tests/avancar-code-phase.test.ts` (NOVO) | Cenário completo: avancar em fase de código com/sem backlog/OpenAPI |

### Cenários Obrigatórios

**5.1 — decomposeBacklogToTasks:**
```
✅ Filtra US por Frontend (tipo FE, FE+BE)
✅ Filtra US por Backend (tipo BE, FE+BE)
✅ Filtra US por Integração (tipo Integração)
✅ Filtra US por Deploy (tipo Infra, Deploy)
✅ Fallback para decomposeArchitectureToTasks quando backlog vazio
✅ Parsing correto de tabela markdown com | US-XXX | ... |
✅ Enriquecimento com endpoints do OpenAPI
```

**5.2 — code-phase-handler state machine:**
```
✅ setup → detecta backlog → gera tasks → transiciona para working
✅ working → marca task done → apresenta próxima
✅ working → todas tasks done → transiciona para gate
✅ gate → gera manifest → delega validação
✅ completed → delega para proximo.ts
✅ setup sem backlog → estado funciona (sem tasks)
```

**5.3 — consistência:**
```
✅ CODE_PHASE_NAMES contém exatamente: Frontend, Backend, Integração, Deploy Final
✅ CODE_PHASE_NAMES NÃO contém: Testes, Segurança, Performance, Observabilidade
✅ isCodePhase('Frontend') → true
✅ isCodePhase('Testes') → false
✅ PHASE_TYPE_MAP tem entrada para toda fase em FLUXO_SIMPLES + FLUXO_MEDIO + FLUXO_COMPLEXO
```

### Critérios de Aceite
- [ ] Cobertura mínima dos fluxos novos (>= 30 testes novos)
- [ ] Regressão "Frontend melhorou, outras fases quebraram" bloqueada por teste
- [ ] `npm run test` → 0 failures
- [ ] Build OK

---

## Sprint 6 — Modularização proximo.ts + Limpeza HTTP (P2)

### Objetivo
Reduzir complexidade do proximo.ts e planejar substituição do HTTP legado.

### 6A — Modularização proximo.ts

O `proximo.ts` (1451 linhas) concentra muita responsabilidade. Proposta de extração:

| Responsabilidade | Destino Proposto | ~Linhas |
|-----------------|-----------------|---------|
| Validação de entregáveis | `src/src/services/deliverable-gate.service.ts` | ~200 |
| Bloqueio/aprovação de gate | `src/src/services/gate-approval.service.ts` | ~150 |
| Classificação progressiva | já em `classificacao-progressiva.service.ts` | mover chamadas |
| Geração de tasks | já em `task-decomposer.service.ts` | mover chamadas |
| Transição de fase | `src/src/services/phase-transition.service.ts` | ~100 |
| Watcher lifecycle | já em `watcher.service.ts` | mover chamadas |
| Menções e contexto | já em `ide-paths.ts` | simplificar |

**Meta:** proximo.ts reduzido de ~1451 para ~400-500 linhas (orquestrador fino).

### 6B — Estratégia HTTP Legado

| Ação | Detalhes |
|------|----------|
| **Manter** `index.ts` como está | Já está marcado `@deprecated`, não incluído no build padrão |
| **Adicionar** aviso no dev:http | Log de warning ao iniciar: "HTTP transport is deprecated. Use STDIO." |
| **Planejar** substituição | Quando SDK suportar `StreamableHTTPServerTransport` → migrar para server.ts |
| **Não** remover agora | Pode haver usuários usando via Docker/Gemini |

### 6C — Métricas Operacionais (futuro)

Indicadores propostos para implementação futura:
- Taxa de aprovação por fase (% gate pass na 1ª tentativa)
- Iterações médias por gate
- Tempo médio por fase
- Taxa de fallback (quantas vezes validação textual é usada vs artefatos)
- Loops evitados (counter do anti-loop)

**Nota:** Sprint 6 é P2 e pode ser executada incrementalmente após as demais.

### Critérios de Aceite
- [ ] proximo.ts < 600 linhas
- [ ] Nenhuma funcionalidade perdida
- [ ] Todos os testes existentes passando
- [ ] Build OK

---

## Ordem de Execução Recomendada

```
Semana 1 (P0):
  Sprint 0  — Governança de versão         (~1h)
  Sprint 1  — Paridade de fases            (~2-3h)
  Sprint 5  — Testes (parcial: 5.1, 5.3)   (~2h)

Semana 2 (P1):
  Sprint 3  — Validação por artefatos       (~4-5h)
  Sprint 4  — Rastreabilidade               (~3-4h)
  Sprint 5  — Testes (restante: 5.2, 5.4, 5.5) (~3h)

Semana 3 (P2):
  Sprint 6  — Modularização + limpeza        (~3-4h)
```

---

## Mapa de Arquivos Afetados

### Novos
| Arquivo | Sprint | Descrição |
|---------|--------|-----------|
| `src/src/gates/code-validator.ts` | 3 | Validador de fase de código por artefatos |
| `src/src/tests/task-decomposer-backlog.test.ts` | 5 | Testes do decomposeBacklogToTasks |
| `src/src/tests/code-phase-handler.test.ts` | 5 | Testes do state machine |
| `src/src/tests/phase-consistency.test.ts` | 5 | Testes de consistência de listas |
| `src/src/tests/code-validator.test.ts` | 5 | Testes do CodeValidator |
| `src/src/tests/avancar-code-phase.test.ts` | 5 | Testes de integração |

### Modificados
| Arquivo | Sprint(s) | Mudanças |
|---------|----------|----------|
| `src/src/flows/types.ts` | 1 | + `CODE_PHASE_NAMES`, `isCodePhase()`, `PHASE_TYPE_MAP` |
| `src/src/handlers/code-phase-handler.ts` | 1, 3, 4 | Import centralizado; validação por artefatos; rastreabilidade |
| `src/src/tools/consolidated/avancar.ts` | 1 | Import centralizado de `isCodePhase` |
| `src/src/tools/proximo.ts` | 1, 6 | Corrigir lista divergente; modularizar |
| `src/src/constants.ts` | 0 | Versão → 5.7.0 |
| `src/package.json` | 0 | Versão → 5.7.0 |
| `src/src/tests/constants.test.ts` | 0 | Versão → 5.7.0 |
| `README.md` | 0 | Versão → 5.7.0 |
| `src/CHANGELOG.md` | 0 | Bloco 5.7.0 |
| `docs/README.md` | 0 | Data e versão |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Regressão em fases de documento | Média | Alto | Sprint 5 com testes de consistência; fallback textual mantido |
| CodeValidator muito restritivo | Baixa | Médio | Threshold configurável; fallback textual como contingência |
| Modularização quebra imports | Média | Alto | Sprint 6 por último; testes E2E antes |
| Versão 5.7.0 quebra npm cache | Baixa | Baixo | Major bump é semver-correto para breaking changes |

---

## Critérios de Aceite Globais

1. **Build limpo:** `npx tsc --noEmit` → exit 0 (cwd: src/)
2. **Testes passando:** `npm run test` → 0 failures
3. **Versão unificada:** grep retorna 5.7.0 em todos os artefatos
4. **Zero divergência:** uma única lista de fases técnicas
5. **Fases de documento inalteradas:** fases 1-13 continuam com o fluxo textual existente
6. **Backward compatible:** se code-phase-handler falhar, fallback para proximo.ts funciona

---

## Referências

- Diagnóstico base: `docs/roadmap/DIAGNOSTICO_FASES_DESENVOLVIMENTO_v8.md`
- Histórico git: `216fd26` (v5.6.5, 2026-02-27)
- Testes existentes: 24 arquivos em `src/src/tests/`
- Code-phase-handler: 682 linhas, state machine SETUP→WORKING→GATE→COMPLETED
- TaskDecomposer v2: 639 linhas, `decomposeBacklogToTasks` + `decomposeArchitectureToTasks`
- Fluxos: SIMPLES (7 fases), MEDIO (13), COMPLEXO (17) + Stitch opcional
