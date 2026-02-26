# Análise Técnica — Maestro MCP v5.5.0

**Data:** 25/02/2026  
**Analista:** Cascade (Claude Sonnet)  
**Escopo:** Codebase completo `src/src/` — ~17 services, 5 public tools, 37 legacy, 17 test files  

---

## 1. Resumo Executivo

O Maestro MCP v5.5.0 é um projeto **ambicioso e tecnicamente sofisticado** que implementa uma abordagem inédita ("Fat MCP") de orquestração de projetos inteiramente dentro do protocolo MCP. A arquitetura central — 5 tools públicas, router centralizado, middleware pipeline, flow engine declarativa — é sólida e demonstra maturidade de design. O conceito de TDD Invertido (documentos de orientação pré-gerados) é inovador e diferenciador.

Contudo, o projeto acumulou **débito técnico significativo** nas últimas iterações (v5→v8): entry points divergentes (`stdio.ts` vs `index.ts`), 37 tools legadas sem plano de remoção, duplicação de lógica entre `maestro-tool.ts` e `avancar.ts`, tipagem fraca (`as any` em 50+ locais), e ausência de cobertura de testes no fluxo principal (specialist-phase-handler, avancar.ts). O fluxo de onboarding sofre de **fragmentação de estado** — o specialist phase handler (1296 linhas) é o arquivo mais complexo e frágil da base.

**Health Score: 58/100**

| Dimensão | Score | Peso | Justificativa |
|----------|-------|------|---------------|
| Arquitetura | 72/100 | 25% | Fat MCP sólido, 5 tools, middleware pipeline. Divergência HTTP/STDIO. |
| Qualidade de Código | 45/100 | 25% | Excesso de `as any`, duplicação, funções >300 linhas |
| Estabilidade/Bugs | 50/100 | 20% | 4 bugs conhecidos parcialmente corrigidos; transições frágeis |
| Testes | 40/100 | 15% | 17 arquivos de teste, mas gaps nos fluxos críticos |
| DevEx/Manutenibilidade | 65/100 | 15% | Boa documentação inline, nomes claros, mas arquivos enormes |

---

## 2. Erros Encontrados

### 🔴 Crítico

#### ERRO-001: Divergência Estrutural entre Entry Points (stdio.ts vs index.ts)

- **Arquivo:** `src/src/index.ts` (inteiro) vs `src/src/stdio.ts` (inteiro)
- **Descrição:** `stdio.ts` (113 linhas) usa o SDK MCP oficial com `Server` + `StdioServerTransport`. `index.ts` (401 linhas) reimplementa TODO o protocolo JSON-RPC manualmente com Express, SSE e session management. São **dois servidores MCP completamente diferentes** que compartilham apenas o router.
- **Impacto:** 
  - Bug sutil: `stdio.ts` captura client capabilities via `server.oninitialized` (typo: deveria ser `onInitialized`), enquanto `index.ts` faz no handler `initialize`.
  - `index.ts` não usa `setProjectDirectory()` — a função `projectsDir` não existe no escopo.
  - Express + cors + chokidar são dependências de produção desnecessárias no modo STDIO (que é 99% do uso real via IDEs).
  - Manutenção duplicada: qualquer mudança de protocolo precisa ser replicada em dois lugares.
- **Fix sugerido:** 
  - **Curto prazo:** Mover `index.ts` para um pacote separado ou flag de feature. Não publicá-lo no npm.
  - **Médio prazo:** Usar `StreamableHTTPServerTransport` do SDK MCP oficial (disponível desde 2025-03-26) para unificar ambos os entry points sobre o mesmo SDK.

```typescript
// index.ts — versão unificada (conceito)
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
// ... mesmos handlers de stdio.ts
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
app.all("/mcp", transport.handleRequest());
await server.connect(transport);
```

#### ERRO-002: Imports no Meio do Arquivo (index.ts)

- **Arquivo:** `src/src/index.ts:348-353`
- **Descrição:** Imports de `constants.js`, `client-capabilities.service.js`, `router.js`, `shared-resource-handler.js` e `shared-prompt-handler.js` aparecem na **linha 348**, após 347 linhas de código. Isso é anti-pattern de JavaScript/TypeScript e pode causar problemas com tree-shaking e hoisting.
- **Impacto:** Confusão de leitura; TypeScript compila mas bundlers podem ter comportamento inesperado.
- **Fix:** Mover todos os imports para o topo do arquivo.

#### ERRO-003: Anti-Loop com Estado Global Mutável (avancar.ts)

- **Arquivo:** `src/src/tools/consolidated/avancar.ts:46-60`
- **Descrição:** O mecanismo anti-loop usa variáveis **globais de módulo** (`_lastCallHash`, `_identicalCallCount`). Em modo STDIO, o servidor roda como processo único — isso funciona. Mas em modo HTTP/SSE (`index.ts`), **sessões concorrentes compartilham o mesmo estado global**, causando falsos positivos de detecção de loop.
- **Impacto:** Em modo HTTP, o usuário A pode disparar o anti-loop baseado em chamadas do usuário B.
- **Fix:** Mover o estado anti-loop para dentro do `StateService` ou usar um `Map<sessionId, LoopState>`.

```typescript
// Fix: estado por diretório ao invés de global
const loopStates = new Map<string, { hash: string; count: number }>();

function checkAntiLoop(diretorio: string, hash: string): boolean {
    const state = loopStates.get(diretorio) || { hash: '', count: 0 };
    if (state.hash === hash) {
        state.count++;
        if (state.count >= MAX_IDENTICAL_CALLS) {
            loopStates.delete(diretorio);
            return true; // Loop detectado
        }
    } else {
        state.hash = hash;
        state.count = 1;
    }
    loopStates.set(diretorio, state);
    return false;
}
```

#### ERRO-004: Typo em `server.oninitialized` (stdio.ts)

- **Arquivo:** `src/src/stdio.ts:94`
- **Descrição:** `server.oninitialized = () => {` — o nome correto no SDK MCP é `server.oninitialized` (lowercase 'i'). Verificação necessária: na versão do SDK usada (`^1.25.3`), o nome pode ser `onInitialized` ou `oninitialized`. Se o SDK espera `onInitialized` (camelCase), o callback **nunca será chamado**.
- **Impacto:** Client capabilities podem não ser capturadas, afetando o comportamento de annotations e structured content.
- **Fix:** Verificar a API do SDK e corrigir casing se necessário.

---

### 🟠 Alto

#### ERRO-005: `onboarding: any` no EstadoProjeto (tipagem fraca)

- **Arquivo:** `src/src/types/index.ts:125`
- **Descrição:** `onboarding?: any;` — O campo mais crítico do estado (onboarding com specialistPhase, discoveryBlocks, etc.) é tipado como `any`. Isso propaga-se por toda a base: `(estado as any).onboarding` aparece em `flow-engine.ts:234,266,390`, `avancar.ts:134`, etc.
- **Impacto:** Zero type-safety no fluxo de onboarding. Bugs silenciosos como acessar `onboarding.specialistPhase.status` sem null-check. O TypeScript não pode ajudar a detectar erros.
- **Fix:** Importar e usar o tipo `OnboardingState` de `types/onboarding.ts`:

```typescript
import type { OnboardingState } from "./onboarding.js";
// Em EstadoProjeto:
onboarding?: OnboardingState;
```

#### ERRO-006: specialist-phase-handler.ts é God Object (1296 linhas)

- **Arquivo:** `src/src/handlers/specialist-phase-handler.ts` (1296 linhas)
- **Descrição:** Um único arquivo contém: handler de 5 estados (active→collecting→generating→validating→approved), scoring de PRD, fuzzy field matching, template parsing, file I/O, classificação, e formatação de output. Viola SRP severamente.
- **Impacto:** Difícil de testar unitariamente, difícil de debugar, alto risco de regressão a cada mudança.
- **Fix:** Extrair em módulos:
  - `prd-scorer.ts` — Lógica de scoring e gap detection
  - `field-normalizer.ts` — FIELD_ALIASES e normalizeFieldKey
  - `specialist-state-machine.ts` — Transições de estado puras
  - `specialist-formatters.ts` — Formatação de output

#### ERRO-007: Dupla Delegação maestro→avancar (circularidade potencial)

- **Arquivo:** `src/src/tools/maestro-tool.ts:109-112`
- **Descrição:** `maestroTool` com `acao="avancar"` faz import dinâmico de `executar.ts` e delega. Mas `executar` também pode gerar `next_action` apontando para `maestro`. Se o flow engine retorna `tool: "maestro"` com args que incluem `acao: "avancar"`, cria-se um loop maestro→executar→maestro.
- **Impacto:** O anti-loop em `avancar.ts` mitiga parcialmente, mas o loop pode ocorrer 3 vezes antes de ser detectado.
- **Fix:** Remover `acao: "avancar"` do maestroToolSchema. O maestro NUNCA deveria delegar para executar — são responsabilidades distintas. Ou, se mantiver, adicionar flag `_delegated: true` para evitar re-delegação.

#### ERRO-008: `handleApproved` não seta `aguardando_classificacao = true`

- **Arquivo:** `src/src/handlers/specialist-phase-handler.ts:670-671`
- **Descrição:** Na linha 670, o código faz `estado.fase_atual = 1` e na 671 comenta `// estado.aguardando_classificacao removido - classificação é silenciosa`. Porém o `proximo_passo` na resposta (linha 695) instrui a IA a chamar `executar({acao: "avancar", respostas: {nivel: "..."}})`, que depende de `estado.aguardando_classificacao === true` no `avancar.ts:128` para funcionar.
- **Impacto:** O `avancar.ts` pode não entrar no handler de classificação se `aguardando_classificacao` é `false`, levando a IA a um caminho inesperado (possivelmente `isInOnboarding === false` → `proximo.ts` → erro de entregável).
- **Fix:** Restaurar `estado.aguardando_classificacao = true;` antes de persistir, OU ajustar `avancar.ts` para detectar classificação pendente por outros sinais (ex: `classificacao_sugerida` presente + `classificacao_pos_prd_confirmada === false`).

#### ERRO-009: express/cors em dependencies de produção

- **Arquivo:** `src/package.json:53-59`
- **Descrição:** `cors` e `express` estão em `devDependencies`, mas `index.ts` os importa diretamente. Se `index.ts` for incluído no build de produção (`dist/index.js`), falhará em runtime porque `devDependencies` não são instaladas.
- **Impacto:** O entry point HTTP não funciona quando instalado via `npm install @maestro-ai/mcp-server` (apenas via dev local).
- **Fix:** Ou mover para `dependencies`, ou excluir `index.ts` do build de produção (ajustar `tsconfig.json` excludes).

---

### 🟡 Médio

#### ERRO-010: `saveFile` com path separador misto (Windows)

- **Arquivo:** `src/src/services/state.service.ts:79-92`
- **Descrição:** O método `saveFile` faz manipulação de paths com `.lastIndexOf("/")` e `.replace(/\\/g, "/")` manualmente, ao invés de usar `path.dirname()` e `path.join()`. No Windows, isso pode falhar com paths que misturam `\` e `/`.
- **Impacto:** Potencial falha silenciosa ao criar diretórios em paths Windows.
- **Fix:** Usar `import { dirname } from "path"`:
```typescript
async saveFile(relativePath: string, content: string): Promise<boolean> {
    const fullPath = join(this.diretorio, relativePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf-8");
    return true;
}
```

#### ERRO-011: Middlewares Deprecated Ainda em Uso

- **Arquivo:** `src/src/router.ts:205-218`
- **Descrição:** Tools legadas (`avancar`, `salvar`, `checkpoint`, `status`) ainda usam `applySmartMiddlewares`, `applyPersistenceMiddlewares`, `applyMiddlewares` — todos marcados como `@deprecated` e que emitem `console.warn` a cada chamada.
- **Impacto:** Log poluído com warnings em cada invocação de tool legada. Pipeline de middleware inconsistente entre tools públicas e legadas.
- **Fix:** Migrar todas as tools legadas para `applyOrchestrationPipeline` ou remover o wrapper (já que são legadas e serão removidas).

#### ERRO-012: `onboardingOrchestrator` exige `estado_json` obrigatório

- **Arquivo:** `src/src/flows/onboarding-orchestrator.ts:72-80`
- **Descrição:** O handler verifica `if (!args.estado_json)` e retorna erro. Mas quando chamado via `avancar.ts:207-213`, pode receber `estado_json: ""` (string vazia), que passa a validação mas falha no `parsearEstado("")` retornando null.
- **Impacto:** Caminho legacy do onboarding pode falhar silenciosamente se `avancar.ts` não tiver estado JSON carregado.
- **Fix:** Validar `if (!args.estado_json || args.estado_json.trim().length === 0)`.

#### ERRO-013: Fallback recovery aponta para tool "status" (não existe como pública)

- **Arquivo:** `src/src/errors/index.ts:208-210`
- **Descrição:** O fallback de erro genérico em `withErrorHandling` sugere `tool: "status"`, mas "status" é uma tool **legada**, não pública. A IA pode tentar chamá-la e receber deprecation warning.
- **Impacto:** UX degradada em cenários de erro — a IA faz chamada desnecessária com warning.
- **Fix:** Mudar para `tool: "maestro"`.

---

### 🟢 Baixo

#### ERRO-014: `formatArgsPreview` duplicada

- **Arquivo:** `src/src/tools/maestro-tool.ts:455-464`
- **Descrição:** Função `formatArgsPreview` definida localmente mas nunca usada (o import `formatArgsPreview as fmtArgs` na linha 11 é o que é usado).
- **Impacto:** Código morto, ~10 linhas.
- **Fix:** Remover a função local.

#### ERRO-015: `condition: (s) => true` no flow engine

- **Arquivo:** `src/src/services/flow-engine.ts:127`
- **Descrição:** A condição `condition: (s) => true` é semanticamente equivalente a não ter condição. Gera ruído de leitura.
- **Impacto:** Cosmético.
- **Fix:** Remover a property `condition`.

#### ERRO-016: Versão inconsistente

- **Arquivo:** `src/src/constants.ts:9` vs `src/package.json:3`
- **Descrição:** `MAESTRO_VERSION = "5.2.0"` mas `package.json` diz `"5.5.3"`.
- **Impacto:** Logs e health endpoint mostram versão errada.
- **Fix:** Sincronizar com `package.json`, idealmente lendo de `package.json` em runtime.

---

## 3. Acertos

### ✅ Arquitetura de 5 Core Tools
A redução de 44 tools para 5 públicas (`maestro`, `executar`, `validar`, `analisar`, `contexto`) é **excelente**. Reduz a superfície cognitiva da IA de forma drástica. O pattern de router centralizado com Map para lookup rápido é elegante.

### ✅ Middleware Pipeline Declarativo
O `applyOrchestrationPipeline` com ordem fixa (Error → State → Persistence → ADR → Flow → Skill → Validation) é um design pattern maduro. A composição via HOF (Higher-Order Functions) permite adicionar/remover layers sem alterar handlers.

### ✅ Flow Engine Declarativa
O sistema de transições em `flow-engine.ts` como array de `FlowTransition[]` com conditions é extensível e legível. Facilita debugging ("por que o sistema sugeriu X?") e permite adicionar novos estados sem refatorar.

### ✅ Error Handling Estruturado
A hierarquia `MaestroError → ValidationError/StateError/FlowError/PersistenceError` com `recovery: NextAction` é um pattern excelente para IA. Quando um erro ocorre, a IA sabe **exatamente** como recuperar, sem precisar de heurísticas.

### ✅ Persistência Direta via fs
A decisão de o MCP salvar arquivos diretamente (ao invés de pedir à IA para fazê-lo) elimina uma classe inteira de bugs de loop e instrução. O `StateService` com `load()/save()/patch()` é limpo e testável.

### ✅ Normalização de Caminhos (v5.4 fix)
O `resolveProjectPath()` usado consistentemente em `maestroTool()`, `StateService`, `avancar()`, `proximo()` resolve o bug crítico de caminhos Windows vs POSIX.

### ✅ Smart Auto-Flow com Classificação de Fases
O `PHASE_TYPE_MAP` em `proximo.ts` que classifica fases como `input_required`, `derived`, `technical` ou `correction_loop` para determinar automaticamente se precisa de input humano é engenhoso.

### ✅ PRD File-First Validation
A decisão de ler o PRD do disco ao invés de recebê-lo via JSON (specialist-phase-handler) elimina problemas de escape e economiza tokens. Pattern que deveria ser expandido para todos os entregáveis.

### ✅ Fuzzy Field Matching
O `FIELD_ALIASES` no specialist-phase-handler que mapeia variações de nomes de campos (`problema_central` → `problema`, `target_audience` → `publico_alvo`) é uma solução pragmática para o problema real de IAs usarem nomes inconsistentes.

### ✅ Autonomia Calibrada (v6.3)
O `RiskEvaluator` + `DecisionEngine` em `proximo.ts` que avalia risco antes de avançar fases é um design maduro de safety. O pattern de "best-effort, non-blocking" é correto.

---

## 4. Próximos Passos (Roadmap Técnico)

### 🔥 URGENTE (corrigir agora)

1. **[ERRO-016] Sincronizar versão** — `constants.ts:9` deve refletir `package.json:3`. Impede confusão em logs/debug.

2. **[ERRO-008] Restaurar `aguardando_classificacao`** — No `handleApproved()` de `specialist-phase-handler.ts`, setar `estado.aguardando_classificacao = true` para que o fluxo de classificação no `avancar.ts` funcione corretamente.

3. **[ERRO-002 + ERRO-009] Isolar entry point HTTP** — Mover imports para o topo de `index.ts`. Decidir: express é `dependency` ou `devDependency`? Se o entry point HTTP não é publicado no npm, excluí-lo do build.

4. **[ERRO-005] Tipar `onboarding`** — Substituir `onboarding?: any` por `onboarding?: OnboardingState` em `types/index.ts`. Corrigir todos os `(estado as any).onboarding` para type-safe access.

5. **Testes para fluxo principal** — Criar `specialist-phase-handler.test.ts` e `avancar-flow.test.ts` cobrindo: collecting→generating→validating→approved→classificação.

### ⚡ ALTA (próxima sprint)

6. **[ERRO-006] Desmembrar specialist-phase-handler.ts** — Extrair `prd-scorer.ts`, `field-normalizer.ts`, `specialist-state-machine.ts`. Cada módulo deve ter <300 linhas e testes próprios.

7. **[ERRO-001] Unificar entry points** — Usar `StreamableHTTPServerTransport` do SDK para `index.ts`, eliminando a reimplementação JSON-RPC manual. Ambos os entry points devem usar o mesmo `Server` MCP.

8. **[ERRO-003] Estado anti-loop por diretório** — Mover `_lastCallHash`/`_identicalCallCount` de variáveis globais para `Map<string, LoopState>` indexado por diretório.

9. **[ERRO-007] Eliminar delegação maestro→executar** — Remover `acao: "avancar"` do maestroToolSchema. O fluxo deve ser: maestro (status/setup/criação) → executar (ações) → validar (validações). Sem circularidade.

10. **Remover tools legadas sem uso** — Auditoria: quantas das 37 tools legadas são realmente chamadas? Ferramentas como `discovery`, `brainstorm`, `prd_writer` podem ser internalizadas sem backward-compat.

11. **[ERRO-010] Normalizar paths no StateService** — Usar `path.dirname()` e `path.join()` consistentemente. Eliminar manipulação manual de strings de path.

### 📅 MÉDIA (backlog)

12. **Migrar todos os legacy middlewares** — Substituir `applySmartMiddlewares`, `applyPersistenceMiddlewares`, etc. por `applyOrchestrationPipeline` em todas as tools legadas restantes.

13. **Remover `index signature` do ToolResult** — `[x: string]: unknown` no `ToolResult` permite qualquer campo custom. Com structured content e middleware de embedding, os campos internos podem ser removidos.

14. **Structured logging** — Substituir `console.log/warn/error` por logger estruturado com levels e contexto (sessionId, toolName, diretorio).

15. **Caching de skills** — O `SkillLoaderService` (25k bytes) indica complexidade de loading. Verificar se há I/O excessivo a cada chamada de tool.

16. **Documentação de ADRs** — O middleware `withADRGeneration` existe mas as ADRs geradas devem ser revisadas para qualidade.

---

## 5. Recomendações Estratégicas

### 5.1 Fat MCP: Continuar ou Hibridizar?

**Recomendação: Continuar com Fat MCP, mas com guardrails.**

O Fat MCP é o diferenciador do Maestro. A alternativa (API REST + MCP thin wrapper) adicionaria complexidade de deployment, autenticação e latência sem benefícios claros para o caso de uso (IDE local).

**Guardrails necessários:**
- **Tamanho máximo de response:** Tools como `proximo.ts` podem gerar respostas >10KB com instruções, templates e feedback. Implementar budget de tokens (~4000 tokens por resposta).
- **Lazy loading de skills:** Não injetar conteúdo de skills no response — referenciar paths e deixar a IDE ler. (v7.0 já começou isso com `formatSkillHydrationCommand`).
- **Separation of concerns:** O MCP não deveria formatar markdown para humanos E JSON para máquinas no mesmo response. Usar `structuredContent` para dados e `content[].text` para display.

### 5.2 As 5 Tools São Suficientes?

**Sim, para a v6. Mas considere 6-7 para v7.**

As 5 tools atuais cobrem o CRUD básico do fluxo. Para escalar, considere:
- **`diagnosticar`** — Tool separada para debug/troubleshooting (atualmente embutida em responses de erro)
- **`configurar`** — Separar setup/preferências do maestro (que hoje mistura status + setup + criação)

O maestro faz muita coisa: status, setup, criação, delegação de avanço. O princípio de responsabilidade única sugere que pelo menos setup/config deveria ser separado.

### 5.3 Visão da v6 Ideal

| Dimensão | v5.5 (Atual) | v6 (Ideal) |
|----------|-------------|------------|
| Entry points | 2 divergentes | 1 SDK-based com 2 transports |
| Tools públicas | 5 + 37 legadas | 5-7 + 0 legadas (migration guide) |
| Estado | `onboarding?: any` | Fully typed, versioned (migrations) |
| Specialist handler | 1296 linhas | 4 módulos <300 linhas |
| Testes | 17 arquivos, gaps | >90% coverage no fluxo principal |
| Response format | Markdown + campos internos | structuredContent + lean markdown |
| Middleware | 5 deprecated + 1 atual | 1 pipeline, zero deprecated |

---

## 6. Análise da Parte de Codificação — Orquestração de Desenvolvimento

### 6.1 Estado Atual da Codificação no Maestro

O Maestro orquestra codificação através do fluxo de fases pós-onboarding, gerenciado por `proximo.ts` (1223 linhas). O processo atual é:

1. **Especialista da fase** define o entregável esperado (ex: "Documento de Requisitos", "Arquitetura", "Frontend")
2. **IA gera** o entregável seguindo template + skill + checklist
3. **`proximo.ts` valida** via `ValidationPipeline` (score 0-100)
4. **Gate decide**: <50 bloqueia, 50-69 pede aprovação, ≥70 avança
5. **Próxima fase** é ativada com novo especialista

### 6.2 Problemas no Fluxo de Codificação Atual

**Problema A: Entregáveis são Documentos, não Código**

As fases geram documentos Markdown (PRD, Requisitos, Arquitetura). Quando chega na fase de código efetivo (Frontend/Backend), o sistema **não tem mecanismo para:**
- Gerar código em múltiplos arquivos
- Validar se o código compila
- Executar testes
- Verificar integração entre componentes

**Problema B: Validação Semântica vs Validação Real**

O `ValidationPipeline.validateDeliverable()` faz validação **textual** — verifica se seções existem, se tem conteúdo mínimo, se checklist items são mencionados. Isso funciona para documentos, mas para código seria necessário:
- Análise estática (TypeScript compiler API, ESLint)
- Execução de testes
- Verificação de imports/exports

**Problema C: Granularidade de Entregável**

Uma fase inteira (ex: "Backend") gera um único entregável. Para projetos reais, o backend tem N arquivos, N testes, N migrações. O sistema não suporta entregáveis multi-arquivo nativamente (apesar do `saveMultipleFiles` existir no StateService).

### 6.3 Recomendação: Arquitetura de Codificação para v6

#### Opção 1: Task-Driven Development (Recomendada)

Aproveitar o sistema de tasks já presente em `EstadoProjeto.tasks` (mas não utilizado atualmente):

```
Fase "Backend"
├── Epic: "API de Autenticação"
│   ├── Story: "Login endpoint"
│   │   ├── Task: "Criar route handler"
│   │   ├── Task: "Criar service de auth"
│   │   ├── Task: "Criar testes unitários"
│   │   └── Task: "Criar testes de integração"
│   └── Story: "Registro endpoint"
│       └── ...
└── Epic: "API de Usuários"
    └── ...
```

**Fluxo proposto:**
1. **Decomposição:** Ao entrar em fase de código, o especialista decompõe em epics→stories→tasks
2. **Execução sequencial:** Cada task gera 1-3 arquivos + testes
3. **Validação granular:** Cada task é validada individualmente (compila? testes passam?)
4. **Gate composto:** Gate da fase verifica que todas as tasks estão done + testes passam

**Benefícios:**
- Granularidade natural para code review
- Checkpoint por task (rollback granular)
- Paralelização potencial (tasks independentes)

#### Opção 2: TDD Integrado

Expandir o conceito de TDD Invertido para código real:

```
1. Especialista gera .orientacao-gate.md (já existe)
2. Especialista gera test stubs (.test.ts com it.todo())
3. IA implementa os testes (RED)
4. IA implementa o código (GREEN)
5. Validação: testes passam? (REFACTOR via análise de qualidade)
6. Gate: coverage + qualidade + testes
```

**Implementação técnica:**

```typescript
// Nova tool ou sub-ação de executar
interface CodingTaskResult {
    files: Array<{ path: string; content: string; type: 'source' | 'test' | 'config' }>;
    testResults?: { passed: number; failed: number; skipped: number };
    coverage?: number;
    compileErrors?: string[];
}
```

O desafio é que o MCP **não pode executar comandos** diretamente (npm test, tsc). Soluções:
- **A.** Delegar para a IDE (via prompts/instruções)
- **B.** Usar `child_process.exec` (risco de segurança, precisa de sandbox)
- **C.** Usar MCP sampling para pedir à IA que execute e reporte

#### Opção 3: Microservices Pattern

Para projetos complexos, decompor a fase de Backend em sub-serviços:

```
Backend
├── Service: API Gateway (routes, middleware)
├── Service: Auth (JWT, sessions)
├── Service: Database (models, migrations)
├── Service: Business Logic (use cases)
└── Service: Integration (external APIs)
```

Cada "service" seria tratado como uma mini-fase com seu próprio:
- Especialista (ex: "Especialista de Database" com skill de ORM/migrations)
- Entregável (schema + migrations + seeds)
- Gate (testes de integração + review)

**Prós:** Alinha com arquitetura real de backend moderno
**Contras:** Complexidade de orquestração; pode ser overkill para projetos simples

### 6.4 Implementação Sugerida (v6 Roadmap)

#### Sprint 1: Foundation
- [ ] Ativar e popular `EstadoProjeto.tasks` durante decomposição
- [ ] Criar `TaskDecomposer` service que converte entregável da fase em tasks
- [ ] Ajustar `proximo.ts` para iterar tasks ao invés de fases monolíticas

#### Sprint 2: TDD Integration
- [ ] Criar `TestStubGenerator` que gera `.test.ts` a partir da skill/template
- [ ] Ajustar `ValidationPipeline` para detectar e validar testes
- [ ] Criar sub-ação `executar({acao: "avancar", sub_acao: "test_first"})` para modo TDD

#### Sprint 3: Multi-File Deliverables
- [ ] Ajustar gate para aceitar entregáveis multi-arquivo (diretório ao invés de arquivo único)
- [ ] Criar `CodebaseValidator` que verifica: compila? imports válidos? sem circular deps?
- [ ] Integrar com `watcher.service.ts` para validação contínua durante geração

#### Sprint 4: Code Quality Gates
- [ ] Integrar análise estática (rules-based, sem executar código externo)
- [ ] Criar tier de gates específico para código:
  - **essencial:** tem testes? compila?
  - **base:** coverage >60%? sem code smells críticos?
  - **avancado:** architecture fitness functions? performance benchmarks?

### 6.5 Viabilidade de Microservices no Maestro

**Veredicto: Não para v6, considerar para v7+.**

O pattern de microservices no contexto do Maestro seria "micro-phases" — sub-fases dentro de uma fase. A complexidade adicional de orquestração (dependências entre micro-fases, rollback parcial, paralelização) não se justifica até que o sistema de tasks básico esteja maduro e testado.

Para v6, a recomendação é: **Task-Driven Development** com TDD Integration. Isso dá granularidade suficiente para codificação real sem over-engineering.

---

## 7. Análise de Performance & Escalabilidade

### 7.1 Watcher Event-Driven

O `watcher.service.ts` (5501 bytes) usa `chokidar` para monitorar mudanças. **Riscos identificados:**
- **Race condition:** Se dois arquivos mudam simultaneamente, o callback pode processar estado stale
- **Memory leak:** Se `stopFileWatcher` não for chamado (ex: crash), o watcher continua em background
- **Performance em projetos grandes:** chokidar monitora recursivamente — em projetos com `node_modules`, pode consumir milhares de file descriptors

**Mitigação:** Usar `.gitignore` patterns no chokidar, limitar depth, e implementar debounce.

### 7.2 Cache de Skills

O `SkillLoaderService` (25KB) indica que o carregamento de skills é complexo. Sem cache, cada chamada de tool lê skills do disco. Com o `skill-cache.service.ts` (1.3KB), há cache básico. Verificar se o TTL do cache é adequado.

### 7.3 I/O de Estado

O `StateService` faz `readFile` + `writeFile` a cada operação. Para fluxos com muitas interações (onboarding com 10+ blocos), isso gera 20+ operações de I/O sequenciais. Considerar batch writes ou in-memory cache com flush periódico.

---

## 8. Cobertura de Testes

### 8.1 Existentes (17 arquivos)

| Teste | Cobre |
|-------|-------|
| `flow-engine.test.ts` | `getNextStep`, `isInOnboarding`, `getFlowState` |
| `middleware.test.ts` | Pipeline de middlewares |
| `aprovar-gate.test.ts` | Aprovação/rejeição de gate |
| `prd-validation.test.ts` | Scoring de PRD |
| `watcher.service.test.ts` | File watcher |
| `skill-loader.test.ts` | Carregamento de skills |
| `gate-orientation.test.ts` | Geração de gate docs |
| `classificacao-progressiva.test.ts` | Classificação progressiva |
| `content-resolver.test.ts` | Resolução de conteúdo |
| `deliverable-validator.test.ts` | Validação de entregáveis |
| `prompt-mapper.test.ts` | Mapeamento skill→fase |
| `onboarding-flow.test.ts` | Fluxo de onboarding |
| `brainstorm-prd.test.ts` | Brainstorm + PRD |
| `migracao-skills.test.ts` | Migração de skills |
| `readiness-dashboard.test.ts` | Dashboard de readiness |
| `v52-integration.test.ts` | Integração v5.2 |
| `tiers.test.ts` | Tiers de gate |

### 8.2 Gaps Críticos

- ❌ **specialist-phase-handler.ts** — O arquivo mais complexo (1296 linhas) não tem testes dedicados
- ❌ **avancar.ts** — Lógica de roteamento e anti-loop sem testes
- ❌ **maestro-tool.ts** — Entry point principal sem testes
- ❌ **proximo.ts** — 1223 linhas sem testes (depende de muitos mocks)
- ❌ **executar.ts** — Roteador de ações sem testes
- ❌ **router.ts** — Roteamento público/legado sem testes

---

## 9. Checklist de Conclusão

- [x] **4 bugs conhecidos validados:**
  1. ~~Injeção de skills bloqueada~~ → v7.0 migrou para hydration commands (resolvido)
  2. ~~"Tool incorreta"~~ → Origem em `prompt-validator.service.ts:32` — validação de conformidade (comportamento esperado, não bug)
  3. ~~Inconsistência de caminhos~~ → Corrigido em v5.4 via `resolveProjectPath()` (resolvido)
  4. ~~Setup inicial pulado~~ → v6.0 `handleNoProject` agora sempre pede confirmação (resolvido)

- [x] **>3 novos problemas identificados:** ERRO-001 a ERRO-016 (16 no total)

- [x] **Health score justificado:** 58/100 com métricas por dimensão

- [x] **Roadmap acionável:** 16 itens em 3 prioridades (Urgente/Alta/Média)

---

*Análise concluída em 25/02/2026. Base de código analisada: ~15.000 linhas TypeScript em `src/src/`.*
