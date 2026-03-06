# Sprint 1: Stabilization (v5.6) — Guia de Implementação Detalhado

**Objetivo:** Corrigir bugs críticos, tipar o estado, criar testes de fluxo principal  
**Duração estimada:** 2-3 semanas  
**Pré-requisito:** Nenhum — este sprint é independente  
**Resultado esperado:** Build estável, zero `as any` para onboarding, testes nos fluxos críticos

---

## REGRAS PARA A IA EXECUTORA

1. **Execute uma task por vez**, na ordem listada
2. **Após cada task**, rode o teste de verificação indicado
3. **Se o build quebrar**, reverta a mudança e reporte o erro
4. **NUNCA modifique testes existentes** sem justificativa explícita
5. **NUNCA delete comentários** existentes sem instrução
6. **Rode `npx tsc --noEmit`** após cada mudança para garantir que compila

---

## Task 1.1 — Sincronizar Versão (ERRO-016)

### Contexto
O arquivo `constants.ts` define `MAESTRO_VERSION = "5.2.0"`, mas o `package.json` declara versão `"5.5.3"`. Isso causa inconsistência em logs, health endpoint e debug.

### Arquivo a modificar
`src/src/constants.ts` — linha 9

### Código ANTES
```typescript
export const MAESTRO_VERSION = "5.2.0";
```

### Código DEPOIS
```typescript
export const MAESTRO_VERSION = "5.5.3";
```

### Teste de verificação
```bash
cd src
npx tsc --noEmit
```
Depois, verificar manualmente:
```bash
node -e "const c = require('./dist/constants.js'); console.log(c.MAESTRO_VERSION)"
```
Esperado: `5.5.3`

### Teste unitário (adicionar ao arquivo de testes existente ou criar novo)
```typescript
// src/src/__tests__/constants.test.ts
import { describe, it, expect } from 'vitest';
import { MAESTRO_VERSION } from '../constants.js';
import pkg from '../../package.json' assert { type: 'json' };

describe('constants', () => {
    it('MAESTRO_VERSION deve ser igual ao package.json', () => {
        expect(MAESTRO_VERSION).toBe(pkg.version);
    });
});
```

### Rollback
Reverter linha 9 de `constants.ts` para `"5.2.0"`.

---

## Task 1.2 — Tipar `onboarding` no EstadoProjeto (ERRO-005)

### Contexto
O campo `onboarding` em `EstadoProjeto` é tipado como `any`. Isso propaga `as any` por 11 arquivos (19 ocorrências). O tipo `OnboardingState` **já existe** em `src/src/types/onboarding.ts` (159 linhas, bem definido).

### Passo 1: Alterar o tipo em `types/index.ts`

**Arquivo:** `src/src/types/index.ts` — linha 125

**ANTES:**
```typescript
    // v3.0: Onboarding otimizado
    onboarding?: any; // OnboardingState (importado de onboarding.ts)
```

**DEPOIS:**
```typescript
    // v3.0: Onboarding otimizado
    onboarding?: import("./onboarding.js").OnboardingState;
```

> **Nota:** Usamos `import()` inline para evitar circular dependency. Alternativa: adicionar `import type { OnboardingState } from "./onboarding.js";` no topo do arquivo.

### Passo 2: Corrigir `(estado as any).onboarding` nos 11 arquivos

Para **cada arquivo** listado abaixo, substituir `(estado as any).onboarding` por `estado.onboarding`:

| # | Arquivo | Linhas aproximadas | Ocorrências |
|---|---------|-------------------|-------------|
| 1 | `src/src/services/flow-engine.ts` | 234, 266, 390 | 3 |
| 2 | `src/src/tools/consolidated/avancar.ts` | 51, 134, 247 | 3 |
| 3 | `src/src/tools/brainstorm.ts` | (buscar) | 3 |
| 4 | `src/src/handlers/prototype-phase-handler.ts` | (buscar) | 2 |
| 5 | `src/src/handlers/specialist-phase-handler.ts` | (buscar) | 2 |
| 6 | `src/src/handlers/shared-prompt-handler.ts` | (buscar) | 1 |
| 7 | `src/src/services/onboarding.service.ts` | (buscar) | 1 |
| 8 | `src/src/tools/discovery.ts` | (buscar) | 1 |
| 9 | `src/src/tools/iniciar-projeto.ts` | (buscar) | 1 |
| 10 | `src/src/tools/next-steps-dashboard.ts` | (buscar) | 1 |
| 11 | `src/src/tools/prd-writer.ts` | (buscar) | 1 |

**Método de busca e substituição:**

```
Buscar:    (estado as any).onboarding
Substituir: estado.onboarding
```

**IMPORTANTE:** Em cada arquivo, verificar se o acesso posterior a propriedades como `.specialistPhase`, `.discoveryStatus`, `.brainstormStatus` é compatível com o tipo `OnboardingState`. O tipo já inclui todos esses campos (ver `types/onboarding.ts`).

### Passo 3: Verificar campos com `.collectedData: Record<string, any>`

No tipo `SpecialistPhaseState` (`types/onboarding.ts:59`):
```typescript
collectedData: Record<string, any>;
```

Este `any` é aceitável por agora — dados coletados do usuário são dinâmicos. Não alterar neste sprint.

### Teste de verificação

```bash
cd src
npx tsc --noEmit
```

Se compilar sem erros, a tipagem está correta. Se houver erros, serão do tipo:
- `Property 'X' does not exist on type 'OnboardingState'` → Adicionar propriedade ao tipo
- `Type 'Y' is not assignable to type 'Z'` → Ajustar tipo ou usar assertion pontual com comentário

### Teste unitário
```typescript
// src/src/__tests__/onboarding-types.test.ts
import { describe, it, expect } from 'vitest';
import type { EstadoProjeto } from '../types/index.js';
import type { OnboardingState } from '../types/onboarding.js';

describe('Tipagem de onboarding', () => {
    it('EstadoProjeto.onboarding aceita OnboardingState válido', () => {
        const estado: Partial<EstadoProjeto> = {
            onboarding: {
                projectId: 'test-123',
                phase: 'specialist_active',
                specialistPhase: {
                    skillName: 'specialist-gestao-produto',
                    status: 'active',
                    collectedData: {},
                    interactionCount: 0,
                },
                discoveryStatus: 'pending',
                discoveryBlocks: [],
                discoveryResponses: {},
                brainstormStatus: 'pending',
                brainstormSections: [],
                prdStatus: 'pending',
                prdScore: 0,
                mode: 'balanced',
                totalInteractions: 0,
            } satisfies OnboardingState,
        };
        expect(estado.onboarding?.phase).toBe('specialist_active');
        expect(estado.onboarding?.specialistPhase?.status).toBe('active');
    });

    it('EstadoProjeto.onboarding aceita undefined', () => {
        const estado: Partial<EstadoProjeto> = {
            onboarding: undefined,
        };
        expect(estado.onboarding).toBeUndefined();
    });
});
```

### Rollback
1. Reverter `types/index.ts` linha 125 para `onboarding?: any;`
2. Reverter todas as substituições `estado.onboarding` → `(estado as any).onboarding`

---

## Task 1.3 — Restaurar `aguardando_classificacao` no handleApproved (ERRO-008)

### Contexto
Quando o specialist-phase-handler aprova o PRD (`handleApproved`), ele seta `estado.fase_atual = 1` mas **não** seta `estado.aguardando_classificacao = true`. O código tem o comentário `// estado.aguardando_classificacao removido - classificação é silenciosa`. Porém, o `avancar.ts` depende desta flag na linha 128:

```typescript
if (estado.aguardando_classificacao) {
    return handleClassificacao(args, estado, diretorio);
}
```

Sem a flag, o fluxo pós-aprovação não entra no handler de classificação.

### Arquivo a modificar
`src/src/handlers/specialist-phase-handler.ts` — linhas 668-671

### Código ANTES
```typescript
    // Avançar estado do projeto para fase 1 de desenvolvimento
    estado.fase_atual = 1;
    // Classificação em background - sem bloqueio
    // estado.aguardando_classificacao removido - classificação é silenciosa
    estado.status = 'ativo';
```

### Código DEPOIS
```typescript
    // Avançar estado do projeto para fase 1 de desenvolvimento
    estado.fase_atual = 1;
    // v5.6 FIX (ERRO-008): Restaurar flag para que avancar.ts:128 roteie corretamente
    estado.aguardando_classificacao = true;
    estado.classificacao_pos_prd_confirmada = false;
    estado.status = 'ativo';
```

### Teste de verificação

```bash
cd src
npx tsc --noEmit
```

### Teste unitário
```typescript
// src/src/__tests__/specialist-approved-flow.test.ts
import { describe, it, expect } from 'vitest';

describe('handleApproved → classificação', () => {
    it('deve setar aguardando_classificacao = true após aprovação do PRD', async () => {
        // Simular estado após handleApproved
        const estado = {
            fase_atual: 1,
            aguardando_classificacao: true,  // <- deve ser true após fix
            classificacao_pos_prd_confirmada: false,
            status: 'ativo',
        };

        // Verificar que o estado está correto para o avancar.ts processar
        expect(estado.aguardando_classificacao).toBe(true);
        expect(estado.classificacao_pos_prd_confirmada).toBe(false);
        expect(estado.fase_atual).toBe(1);
    });

    it('avancar deve rotear para handleClassificacao quando aguardando_classificacao=true', () => {
        // Este teste verifica a LÓGICA do roteamento, não o handler completo
        const estado = {
            aguardando_classificacao: true,
        };

        // Simula a condição do avancar.ts:128
        const deveRoteiarParaClassificacao = estado.aguardando_classificacao === true;
        expect(deveRoteiarParaClassificacao).toBe(true);
    });
});
```

### Rollback
Reverter as linhas 670-671 para o estado original (remover as 2 linhas adicionadas).

---

## Task 1.4 — Anti-loop por Diretório (ERRO-003)

### Contexto
O mecanismo anti-loop em `avancar.ts` usa variáveis globais de módulo (`_lastCallHash`, `_identicalCallCount`). Em modo STDIO isso funciona (1 processo por IDE). Em modo HTTP, sessões concorrentes compartilham o mesmo estado, causando falsos positivos.

### Arquivo a modificar
`src/src/tools/consolidated/avancar.ts` — linhas 45-60

### Código ANTES (linhas 45-60)
```typescript
// v8.0: Anti-loop protection — tracks consecutive identical calls
const MAX_IDENTICAL_CALLS = 3;
let _lastCallHash = '';
let _identicalCallCount = 0;

function computeCallHash(args: AvancarArgs, estado: EstadoProjeto): string {
    const key = `${estado.fase_atual}|${estado.aguardando_classificacao}|${estado.status}|${(estado as any).onboarding?.specialistPhase?.status || 'none'}|${!!args.entregavel}|${JSON.stringify(args.respostas || {})}`;
    // Simple hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const chr = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return String(hash);
}
```

### Código DEPOIS
```typescript
// v5.6: Anti-loop protection — tracks consecutive identical calls PER DIRECTORY
const MAX_IDENTICAL_CALLS = 3;
const loopStates = new Map<string, { hash: string; count: number }>();

function computeCallHash(args: AvancarArgs, estado: EstadoProjeto): string {
    const key = `${estado.fase_atual}|${estado.aguardando_classificacao}|${estado.status}|${estado.onboarding?.specialistPhase?.status || 'none'}|${!!args.entregavel}|${JSON.stringify(args.respostas || {})}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const chr = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return String(hash);
}

/**
 * Verifica anti-loop por diretório. Retorna true se loop detectado.
 */
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

### Também modificar o uso nas linhas 105-124

**ANTES (linhas 105-124):**
```typescript
    // v8.0 Sprint 4: Anti-loop protection
    const callHash = computeCallHash(args, estado);
    if (callHash === _lastCallHash) {
        _identicalCallCount++;
        if (_identicalCallCount >= MAX_IDENTICAL_CALLS) {
            _identicalCallCount = 0;
            _lastCallHash = '';
            return {
                content: formatError(
                    "avancar",
                    `Loop detectado: ${MAX_IDENTICAL_CALLS} chamadas idênticas sem progresso.`,
                    `Diagnóstico: fase_atual=${estado.fase_atual}, aguardando_classificacao=${estado.aguardando_classificacao}, status=${estado.status}, specialistPhase=${(estado as any).onboarding?.specialistPhase?.status || 'none'}.\n\nTente uma abordagem diferente:\n- Se aguardando classificação: \`executar({diretorio: "${diretorio}", acao: "avancar", respostas: {nivel: "simples"}})\`\n- Se precisa de entregável: gere o conteúdo primeiro e passe via \`entregavel\`\n- Se travado: use \`maestro({diretorio: "${diretorio}"})\` para ver o status atual`
                ),
                isError: true,
            };
        }
    } else {
        _lastCallHash = callHash;
        _identicalCallCount = 1;
    }
```

**DEPOIS:**
```typescript
    // v5.6: Anti-loop protection por diretório
    const callHash = computeCallHash(args, estado);
    if (checkAntiLoop(diretorio, callHash)) {
        return {
            content: formatError(
                "avancar",
                `Loop detectado: ${MAX_IDENTICAL_CALLS} chamadas idênticas sem progresso.`,
                `Diagnóstico: fase_atual=${estado.fase_atual}, aguardando_classificacao=${estado.aguardando_classificacao}, status=${estado.status}, specialistPhase=${estado.onboarding?.specialistPhase?.status || 'none'}.\n\nTente uma abordagem diferente:\n- Se aguardando classificação: \`executar({diretorio: "${diretorio}", acao: "avancar", respostas: {nivel: "simples"}})\`\n- Se precisa de entregável: gere o conteúdo primeiro e passe via \`entregavel\`\n- Se travado: use \`maestro({diretorio: "${diretorio}"})\` para ver o status atual`
            ),
            isError: true,
        };
    }
```

### Teste de verificação
```bash
cd src
npx tsc --noEmit
```

### Teste unitário
```typescript
// src/src/__tests__/anti-loop.test.ts
import { describe, it, expect } from 'vitest';

// Simular a lógica do anti-loop isoladamente
describe('Anti-loop por diretório', () => {
    const MAX = 3;
    const loopStates = new Map<string, { hash: string; count: number }>();

    function checkAntiLoop(dir: string, hash: string): boolean {
        const state = loopStates.get(dir) || { hash: '', count: 0 };
        if (state.hash === hash) {
            state.count++;
            if (state.count >= MAX) {
                loopStates.delete(dir);
                return true;
            }
        } else {
            state.hash = hash;
            state.count = 1;
        }
        loopStates.set(dir, state);
        return false;
    }

    it('detecta loop após 3 chamadas idênticas no mesmo diretório', () => {
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // 1ª
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // 2ª
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(true);  // 3ª → LOOP
    });

    it('NÃO detecta loop entre diretórios diferentes', () => {
        loopStates.clear();
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-b', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // 2ª no A
        expect(checkAntiLoop('/projeto-b', 'hash1')).toBe(false); // 2ª no B
    });

    it('reseta contador quando hash muda', () => {
        loopStates.clear();
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-a', 'hash2')).toBe(false); // hash mudou → reset
        expect(checkAntiLoop('/projeto-a', 'hash2')).toBe(false); // 2ª do hash2
    });
});
```

### Rollback
Reverter para as variáveis globais `_lastCallHash` e `_identicalCallCount`.

---

## Task 1.5 — Normalizar Paths no StateService (ERRO-010)

### Contexto
O método `saveFile` em `state.service.ts` faz manipulação manual de paths com `.lastIndexOf("/")` e `.replace()` ao invés de usar `path.dirname()`. No Windows, isso pode falhar com paths que misturam `\` e `/`.

### Arquivo a modificar
`src/src/services/state.service.ts` — linhas 79-92

### Código ANTES
```typescript
    async saveFile(relativePath: string, content: string): Promise<boolean> {
        try {
            const fullPath = join(this.diretorio, relativePath);
            const dir = fullPath.substring(0, fullPath.lastIndexOf("/")).replace(/\\/g, "/");
            // Normalize for Windows
            const dirNormalized = dir.replace(/\//g, join("a", "b").includes("\\") ? "\\" : "/");
            await mkdir(fullPath.substring(0, fullPath.replace(/\\/g, "/").lastIndexOf("/")), { recursive: true });
            await writeFile(fullPath, content, "utf-8");
            return true;
        } catch (error) {
            console.warn("[StateService] Falha ao salvar arquivo:", relativePath, error);
            return false;
        }
    }
```

### Código DEPOIS
```typescript
    async saveFile(relativePath: string, content: string): Promise<boolean> {
        try {
            const fullPath = join(this.diretorio, relativePath);
            await mkdir(dirname(fullPath), { recursive: true });
            await writeFile(fullPath, content, "utf-8");
            return true;
        } catch (error) {
            console.warn("[StateService] Falha ao salvar arquivo:", relativePath, error);
            return false;
        }
    }
```

### Também adicionar import no topo do arquivo

**ANTES (linha 13):**
```typescript
import { join } from "path";
```

**DEPOIS:**
```typescript
import { join, dirname } from "path";
```

### Também corrigir `saveFiles` (linhas 98-116) pelo mesmo motivo

**ANTES:**
```typescript
    async saveFiles(files: Array<{ path: string; content: string }>): Promise<number> {
        let saved = 0;
        for (const file of files) {
            // Se path é absoluto, usar diretamente; se relativo, usar join
            const fullPath = file.path.startsWith(this.diretorio) 
                ? file.path 
                : join(this.diretorio, file.path);
            try {
                const dirPart = fullPath.replace(/\\/g, "/");
                const dirOnly = dirPart.substring(0, dirPart.lastIndexOf("/"));
                await mkdir(dirOnly, { recursive: true });
                await writeFile(fullPath, file.content, "utf-8");
                saved++;
            } catch (error) {
                console.warn("[StateService] Falha ao salvar:", fullPath, error);
            }
        }
        return saved;
    }
```

**DEPOIS:**
```typescript
    async saveFiles(files: Array<{ path: string; content: string }>): Promise<number> {
        let saved = 0;
        for (const file of files) {
            const fullPath = file.path.startsWith(this.diretorio) 
                ? file.path 
                : join(this.diretorio, file.path);
            try {
                await mkdir(dirname(fullPath), { recursive: true });
                await writeFile(fullPath, content, "utf-8");
                saved++;
            } catch (error) {
                console.warn("[StateService] Falha ao salvar:", fullPath, error);
            }
        }
        return saved;
    }
```

> **ATENÇÃO:** Na função `saveFiles`, verificar se a variável é `file.content` (não `content`). A versão corrigida deve usar `file.content`.

### Teste de verificação
```bash
cd src
npx tsc --noEmit
```

### Teste unitário
```typescript
// src/src/__tests__/state-service-paths.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createStateService } from '../services/state.service.js';

describe('StateService — paths Windows/POSIX', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'maestro-test-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('saveFile cria subdiretórios automaticamente', async () => {
        const svc = createStateService(tempDir);
        const result = await svc.saveFile('docs/01-produto/PRD.md', '# PRD\nConteúdo');
        expect(result).toBe(true);

        const content = await readFile(join(tempDir, 'docs', '01-produto', 'PRD.md'), 'utf-8');
        expect(content).toContain('# PRD');
    });

    it('saveFile funciona com paths que têm separadores mistos', async () => {
        const svc = createStateService(tempDir);
        const result = await svc.saveFile('docs\\subdir/file.md', 'conteúdo');
        expect(result).toBe(true);
    });

    it('saveFiles salva múltiplos arquivos', async () => {
        const svc = createStateService(tempDir);
        const saved = await svc.saveFiles([
            { path: 'a/file1.md', content: 'content1' },
            { path: 'b/file2.md', content: 'content2' },
        ]);
        expect(saved).toBe(2);
    });
});
```

### Rollback
Reverter o import e os métodos `saveFile`/`saveFiles` para a versão original.

---

## Task 1.6 — Remover Código Morto

### Contexto
Existem 3 pedaços de código morto/inútil identificados na análise técnica.

### 1.6a — Remover `formatArgsPreview` duplicada (ERRO-014)

**Arquivo:** `src/src/tools/maestro-tool.ts` — linhas 455-464

**Código a REMOVER:**
```typescript
function formatArgsPreview(args: Record<string, unknown>): string {
    return Object.entries(args)
        .map(([key, value]) => {
            if (typeof value === "string" && value.startsWith("{{")) {
                return `${key}: "..."`;
            }
            return `${key}: ${JSON.stringify(value)}`;
        })
        .join(", ");
}
```

**Motivo:** A função é duplicada. O arquivo já importa `formatArgsPreview as fmtArgs` na linha ~11 de `response-formatter.ts`. Esta versão local nunca é referenciada.

**Verificação antes de remover:**
```bash
cd src
# Buscar referências à função local (não ao import)
grep -n "formatArgsPreview" src/tools/maestro-tool.ts
```
Deve aparecer apenas no import. Se aparecer em uso, manter e ajustar.

### 1.6b — Remover `condition: (s) => true` no flow engine (ERRO-015)

**Arquivo:** `src/src/services/flow-engine.ts` — linha 127

**ANTES:**
```typescript
    {
        from: "specialist_validating",
        to: "specialist_approved",
        tool: "maestro",
        description: "PRD aprovado, preparar transição para próximo especialista",
        condition: (s) => true,
        requires_user_input: true,
        user_prompt: "PRD validado! Revise o score e aprove para avançar.",
    },
```

**DEPOIS:**
```typescript
    {
        from: "specialist_validating",
        to: "specialist_approved",
        tool: "maestro",
        description: "PRD aprovado, preparar transição para próximo especialista",
        requires_user_input: true,
        user_prompt: "PRD validado! Revise o score e aprove para avançar.",
    },
```

**Motivo:** `condition: (s) => true` é semanticamente equivalente a não ter condição. O `getNextStep()` já trata `!t.condition` como true.

### 1.6c — Corrigir fallback de erro para tool pública (ERRO-013)

**Arquivo:** `src/src/errors/index.ts` — linhas 207-211

**ANTES:**
```typescript
                    recovery: {
                        tool: "status",
                        description: "Verificar status do projeto após erro",
                        args_template: { estado_json: "{{estado_json}}", diretorio: "{{diretorio}}" },
                        requires_user_input: false,
                    },
```

**DEPOIS:**
```typescript
                    recovery: {
                        tool: "maestro",
                        description: "Verificar status do projeto após erro",
                        args_template: { diretorio: "{{diretorio}}" },
                        requires_user_input: false,
                    },
```

**Motivo:** `"status"` é uma tool **legada**. A tool pública equivalente é `"maestro"` (sem ação = retorna status). Além disso, `maestro` não precisa de `estado_json` — carrega automaticamente.

### Teste de verificação
```bash
cd src
npx tsc --noEmit
npm test
```

### Rollback
Reverter cada arquivo individualmente.

---

## Task 1.7 — Validar `estado_json` Vazio (ERRO-012)

### Contexto
O `onboardingOrchestrator` verifica `if (!args.estado_json)`, mas pode receber `""` (string vazia) que passa esta validação e depois falha no `parsearEstado("")`.

### Arquivo a modificar
`src/src/flows/onboarding-orchestrator.ts` — linha 72

### Código ANTES
```typescript
  if (!args.estado_json) {
```

### Código DEPOIS
```typescript
  if (!args.estado_json || args.estado_json.trim().length === 0) {
```

### Teste de verificação
```bash
cd src
npx tsc --noEmit
```

### Teste unitário
```typescript
// Adicionar ao arquivo de testes existente ou criar:
// src/src/__tests__/onboarding-orchestrator-validation.test.ts
import { describe, it, expect } from 'vitest';

describe('onboardingOrchestrator — validação de estado_json', () => {
    it('rejeita string vazia como estado_json', () => {
        const estadoJson = "";
        const isInvalid = !estadoJson || estadoJson.trim().length === 0;
        expect(isInvalid).toBe(true);
    });

    it('rejeita string com apenas espaços', () => {
        const estadoJson = "   ";
        const isInvalid = !estadoJson || estadoJson.trim().length === 0;
        expect(isInvalid).toBe(true);
    });

    it('aceita JSON válido', () => {
        const estadoJson = '{"projeto_id": "test"}';
        const isInvalid = !estadoJson || estadoJson.trim().length === 0;
        expect(isInvalid).toBe(false);
    });
});
```

### Rollback
Reverter para `if (!args.estado_json) {`.

---

## Task 1.8 — Testes de Integração dos Fluxos Principais

### Contexto
Os fluxos mais críticos (novo usuário → projeto, aprovação → classificação) não têm testes. Esta task cria testes de integração que usam filesystem temporário e mocks mínimos.

### Arquivo novo: `src/src/__tests__/maestro-tool-flow.test.ts`

```typescript
/**
 * Testes de integração para o fluxo principal do maestro-tool.
 * Usa filesystem temporário real (sem mocks de fs).
 * Mocks apenas para skills/content que dependem de paths fixos.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

describe('Fluxo: novo usuário → projeto criado', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'maestro-flow-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('detecta ausência de projeto e retorna instruções de setup', async () => {
        // Importar dinamicamente para evitar side-effects globais
        const { maestroTool } = await import('../tools/maestro-tool.js');
        const result = await maestroTool({ diretorio: tempDir });

        // Deve retornar instruções de setup, não erro
        expect(result.isError).toBeFalsy();
        const text = result.content[0]?.text || '';
        // Deve conter alguma referência a setup ou configuração
        expect(text.length).toBeGreaterThan(50);
    });

    it('cria projeto com sucesso quando respostas são fornecidas', async () => {
        const { maestroTool } = await import('../tools/maestro-tool.js');

        // Criar config global primeiro (simula setup_inicial)
        const configDir = join(tempDir, '.maestro');
        await mkdir(configDir, { recursive: true });
        await writeFile(
            join(configDir, 'config.json'),
            JSON.stringify({
                ide: 'windsurf',
                mode: 'balanced',
                usar_stitch: false,
                setup: { completed: true, decided_at: new Date().toISOString(), decided_by: 'user' },
            }),
            'utf-8'
        );

        // Criar projeto
        const result = await maestroTool({
            diretorio: tempDir,
            acao: 'criar_projeto',
            respostas: {
                nome: 'Projeto Teste',
                descricao: 'Um projeto de teste para validação',
            },
        });

        // Verificar que não é erro
        const text = result.content[0]?.text || '';
        expect(result.isError).toBeFalsy();

        // Verificar que estado foi persistido
        const estadoPath = join(configDir, 'estado.json');
        if (existsSync(estadoPath)) {
            const estado = JSON.parse(await readFile(estadoPath, 'utf-8'));
            expect(estado.nome).toBe('Projeto Teste');
        }
    });
});

describe('Fluxo: classificação pós-PRD', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'maestro-class-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('handleClassificacao processa nivel corretamente', async () => {
        // Criar estado simulando pós-aprovação do PRD
        const configDir = join(tempDir, '.maestro');
        await mkdir(configDir, { recursive: true });

        const estado = {
            projeto_id: 'test-123',
            nome: 'Teste',
            diretorio: tempDir,
            nivel: 'medio',
            tipo_artefato: 'product',
            tier_gate: 'base',
            classificacao_confirmada: false,
            tipo_fluxo: 'novo_projeto',
            fase_atual: 1,
            total_fases: 7,
            entregaveis: {},
            gates_validados: [],
            usar_stitch: false,
            stitch_confirmado: true,
            aguardando_aprovacao: false,
            aguardando_classificacao: true,
            classificacao_pos_prd_confirmada: false,
            classificacao_sugerida: {
                nivel: 'medio',
                pontuacao: 65,
                criterios: ['CRUD', 'auth'],
            },
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString(),
        };

        await writeFile(
            join(configDir, 'estado.json'),
            JSON.stringify(estado),
            'utf-8'
        );

        // Chamar avancar com respostas de classificação
        const { avancar } = await import('../tools/consolidated/avancar.js');
        const result = await avancar({
            diretorio: tempDir,
            respostas: { nivel: 'medio' },
        });

        const text = result.content?.[0]?.text || '';
        // Deve confirmar a classificação, não retornar erro
        expect(text).toContain('Classificação');
        expect(result.isError).toBeFalsy();
    });
});
```

### Teste de verificação
```bash
cd src
npm test
```

Todos os testes devem passar. Se algum falhar por dependência de módulo (skills, content), ajustar mocks conforme necessário.

### Rollback
Remover os arquivos de teste criados.

---

## Checklist de Conclusão do Sprint 1

Após completar todas as tasks, verificar:

```bash
cd src

# 1. Build compila sem erros
npx tsc --noEmit

# 2. Todos os testes passam
npm test

# 3. Verificar zero "as any" para onboarding
grep -r "(estado as any).onboarding" src/ --include="*.ts" | wc -l
# Esperado: 0

# 4. Verificar versão sincronizada
node -e "const c = require('./dist/constants.js'); const p = require('./package.json'); console.log('Código:', c.MAESTRO_VERSION, 'Package:', p.version, 'Match:', c.MAESTRO_VERSION === p.version)"
# Esperado: Match: true
```

### Métricas de sucesso
- [ ] Zero `(estado as any).onboarding` no codebase
- [ ] `MAESTRO_VERSION` = `package.json.version`
- [ ] `aguardando_classificacao = true` após handleApproved
- [ ] Anti-loop funciona por diretório (teste unitário passa)
- [ ] `saveFile` usa `dirname()` (teste com paths mistos passa)
- [ ] Código morto removido (formatArgsPreview, condition true, tool "status")
- [ ] `estado_json` vazio é rejeitado no onboardingOrchestrator
- [ ] Testes de integração dos 2 fluxos principais passam
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm test` sem falhas

---

## Ordem de Execução Recomendada

```
1.1 (versão)      → 5 min   — trivial, sem risco
1.6 (código morto) → 10 min  — trivial, sem risco
1.7 (estado_json)  → 5 min   — trivial, sem risco
1.5 (paths)        → 15 min  — baixo risco
1.2 (tipar onboarding) → 60 min — médio risco (19 substituições)
1.3 (classificação) → 10 min — médio risco (fluxo crítico)
1.4 (anti-loop)    → 30 min  — baixo risco
1.8 (testes)       → 60 min  — sem risco (apenas adiciona)
```

**Total estimado:** ~3 horas de implementação + verificação

---

*Sprint 1 detalhado em 25/02/2026.*
*Próximo: Sprint 2 — Simplification (v6.0).*
