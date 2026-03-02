# Roadmap de Refatoração do Sistema — Maestro v6.0.0

> **Data:** 2026-03-02  
> **Versão:** 6.0.0  
> **Pré-requisito:** Skills criadas, `flows/types.ts` reescrito com fluxos enxutos  
> **Escopo:** 3 sprints de refatoração de código + 1 sprint de deploy/migração  
> **Risco:** ALTO — toca em arquivos core do sistema

---

## Visão Geral

| Sprint | Foco | Esforço | Risco | Arquivos Afetados |
|--------|------|---------|-------|-------------------|
| **Sprint 1** | Atualizar `prompt-mapper.ts` + Readiness Gate | ~6h | Médio | 3 arquivos |
| **Sprint 2** | Generalizar Specialist Handler para todas as fases | ~12h | Alto | 4 arquivos |
| **Sprint 3** | Refatorar `proximo.ts` + Fix delegação duplicada | ~10h | Alto | 5 arquivos |
| **Sprint 4** | Deploy de skills + Migração + Testes | ~8h | Médio | 3 arquivos + scripts |
| **TOTAL** | | **~36h** | | |

---

## Sprint 8 — Prompt Mapper + Readiness Gate (~6h)

### Objetivo
Atualizar o mapeamento fase→skill e criar o Readiness Gate que valida se os artefatos necessários existem antes de entrar em fases de código.

### 8.1 Task: Atualizar `prompt-mapper.ts` (FASE_SKILL_MAP)

**Arquivo:** `src/src/utils/prompt-mapper.ts`  
**Situação atual (linhas 17-61):**

```typescript
// Mapeamento ANTIGO — nomes de fases v9
export const FASE_SKILL_MAP: Record<string, string> = {
    "Produto": "specialist-gestao-produto",
    "Requisitos": "specialist-engenharia-requisitos-ia",
    "UX Design": "specialist-ux-design",
    "Arquitetura": "specialist-arquitetura-software",
    "Backlog": "specialist-plano-execucao-ia",
    "Frontend": "specialist-desenvolvimento-frontend",
    "Backend": "specialist-desenvolvimento-backend",
    "Modelo de Domínio": "specialist-modelagem-dominio",
    "Banco de Dados": "specialist-banco-dados",
    "Segurança": "specialist-seguranca-informacao",
    "Testes": "specialist-analise-testes",
    "Contrato API": "specialist-contrato-api",
    "Integração": "specialist-devops-infra",
    "Arquitetura Avançada": "specialist-arquitetura-avancada",
    "Performance": "specialist-performance-escalabilidade",
    "Observabilidade": "specialist-observabilidade",
    "Prototipagem": "specialist-prototipagem-stitch",
    // Complementares...
};
```

**Mudança necessária:**

```typescript
// Mapeamento NOVO — nomes de fases v10
export const FASE_SKILL_MAP: Record<string, string> = {
    // FLUXO SIMPLES (5 fases)
    "Discovery": "specialist-discovery",
    "Design": "specialist-design",
    "Arquitetura": "specialist-architect",
    "Frontend": "specialist-frontend",
    "Backend": "specialist-backend",
    
    // FLUXO MÉDIO (8 fases) — adiciona:
    "Produto": "specialist-product",
    "Requisitos": "specialist-requirements",
    "Design Técnico": "specialist-technical-design",
    "Planejamento": "specialist-planning",
    "Integração & Deploy": "specialist-devops",
    
    // FLUXO COMPLEXO (11 fases) — adiciona:
    "Modelo de Domínio": "specialist-domain",
    "Contrato API": "specialist-api-contract",
    "Integração": "specialist-devops",        // Reutiliza devops
    "Deploy & Operação": "specialist-operations",
    
    // OPCIONAL
    "Prototipagem": "specialist-prototipagem-stitch",
};
```

**Impacto:** `getSkillParaFase()` e `temSkillParaFase()` continuam funcionando — só mudam os dados do mapa.

**Arquivos que importam `getSkillParaFase`:**
- `src/src/tools/proximo.ts` (linha 15)
- `src/src/services/skill-loader.service.ts` (linha 98)
- `src/src/handlers/specialist-phase-handler.ts` (indireto via specialist-formatters)

**Testes afetados:** `src/src/utils/__tests__/prompt-mapper.test.ts` — atualizar nomes de fases nos expects.

**Esforço:** ~1h

---

### 8.2 Task: Criar `gates/readiness-gate.ts`

**Arquivo NOVO:** `src/src/gates/readiness-gate.ts`  
**Propósito:** Checkpoint consolidado que verifica se o conjunto de artefatos está coerente antes de entrar em fases de código.

**Por que é necessário (diagnóstico da análise V9 de orquestração):**
> "Cada fase anterior teve seu gate individual, mas ninguém verifica se o CONJUNTO de artefatos está coerente."

**Especificação:**

```typescript
interface ReadinessResult {
    score: number;           // 0-100
    approved: boolean;       // score >= threshold
    breakdown: {
        prd: { exists: boolean; score: number; weight: number };
        requisitos: { exists: boolean; score: number; weight: number };
        design: { exists: boolean; score: number; weight: number };
        arquitetura: { exists: boolean; score: number; weight: number };
        backlog: { exists: boolean; score: number; weight: number };
        api: { exists: boolean; score: number; weight: number };
    };
    gaps: string[];          // Artefatos faltantes
    recommendation: string;  // Instrução de correção
}

/**
 * Verifica existência REAL de artefatos no disco antes de entrar em código.
 * Score ponderado baseado na importância de cada artefato.
 */
export function readinessCheck(
    estado: EstadoProjeto,
    diretorio: string,
    nivel: NivelComplexidade
): ReadinessResult;
```

**Pesos por artefato:**

| Artefato | Peso | Verificação |
|----------|------|-------------|
| PRD / Discovery | 25 | `docs/01-*/discovery.md` ou `docs/01-*/PRD.md` existe com >600 chars |
| Requisitos | 15 | `docs/02-*/requisitos.md` existe com >400 chars (se fluxo médio+) |
| Design | 15 | `docs/*/design-doc.md` existe com >400 chars |
| Arquitetura / Design Técnico | 25 | `docs/*/arquitetura.md` ou `docs/*/technical-design.md` com >600 chars |
| Backlog / Planejamento | 15 | `docs/*/backlog.md` existe, contém "US-" ou tabela de stories |
| Contrato API | 5 | `docs/*/openapi.yaml` existe (se fluxo complexo) |

**Thresholds:**
- `>= 80` → Auto-approve (prossegue para código)
- `60-79` → Aprovação manual necessária
- `< 60` → Bloqueio total — artefatos críticos faltando

**Integração no `avancar.ts`:**

```typescript
// Em avancar.ts, ANTES de delegar para code-phase-handler:
if (isCodePhaseDetected) {
    // Verificar se é PRIMEIRA vez entrando em código
    const isFirstCodePhase = !estado.gates_validados?.some(g => {
        const faseInfo = getFaseComStitch(estado.nivel, g, estado.usar_stitch);
        return isCodePhaseName(faseInfo?.nome);
    });
    
    if (isFirstCodePhase && !estado.readiness_approved) {
        const readiness = readinessCheck(estado, diretorio, estado.nivel);
        if (readiness.score < 60) {
            return formatReadinessBlock(readiness, diretorio);
        }
        if (readiness.score < 80) {
            estado.readiness_score = readiness.score;
            return formatReadinessApproval(readiness, diretorio);
        }
        // >= 80: auto-approve
        estado.readiness_approved = true;
        estado.readiness_score = readiness.score;
    }
    // ... delegar para code-phase-handler
}
```

**Tipo `EstadoProjeto`:** Adicionar `readiness_score?: number` e `readiness_approved?: boolean`.

**Esforço:** ~3h (150 linhas de código + integração em avancar.ts + tipo)

---

### 8.3 Task: Atualizar `scoring-config.ts`

**Arquivo:** `src/src/services/scoring-config.ts`  
**Mudança:** Atualizar `getPhaseCategory()` com nomes de fases consolidadas.

```typescript
// Antes: categorias baseadas em nomes v9
// Depois: adicionar novos nomes
function getPhaseCategory(faseName: string): PhaseCategory {
    const nome = faseName.toLowerCase();
    if (nome.includes('discovery') || nome.includes('produto')) return 'product';
    if (nome.includes('requisito')) return 'requirements';
    if (nome.includes('design') && !nome.includes('técnico')) return 'design';
    if (nome.includes('técnico') || nome.includes('arquitetura') || nome.includes('domínio')) return 'architecture';
    if (nome.includes('planejamento') || nome.includes('backlog')) return 'planning';
    if (nome.includes('contrato') || nome.includes('api')) return 'api';
    if (nome.includes('frontend') || nome.includes('backend')) return 'code';
    if (nome.includes('integração') || nome.includes('deploy') || nome.includes('operação')) return 'devops';
    return 'document'; // fallback
}
```

**Esforço:** ~1h

---

### 8.4 Task: Atualizar testes do `prompt-mapper.test.ts`

**Arquivo:** `src/src/utils/__tests__/prompt-mapper.test.ts`  
**Mudança:** Atualizar expects com novos nomes de fases e skills.

```typescript
// Antes:
expect(getSkillParaFase('Produto')).toBe('specialist-gestao-produto');
expect(getSkillParaFase('UX Design')).toBe('specialist-ux-design');

// Depois:
expect(getSkillParaFase('Produto')).toBe('specialist-product');
expect(getSkillParaFase('Discovery')).toBe('specialist-discovery');
expect(getSkillParaFase('Design')).toBe('specialist-design');
expect(getSkillParaFase('Design Técnico')).toBe('specialist-technical-design');
```

**Esforço:** ~1h

---

## Sprint 9 — Generalizar Specialist Handler (~12h)

### Objetivo
Fazer o ciclo `collecting → generating → validating → approved` funcionar para TODAS as fases de documento, não apenas para a Fase 1 (PRD). Esta é a mudança mais complexa e de maior impacto.

### Diagnóstico do Problema Atual

**`specialist-phase-handler.ts` (715 linhas)** é EXCLUSIVO para PRD:

| Componente | Hardcoded para PRD | Precisa generalizar |
|-----------|:------------------:|:-------------------:|
| `PRD_OUTPUT_PATHS` | ✅ `docs/01-produto/PRD.md` | Path dinâmico por fase |
| `handleCollecting` → `getRequiredFields(mode)` | ✅ Retorna campos do PRD | Campos dinâmicos da skill |
| `handleGenerating` → `formatSkillHydrationCommand` | ✅ `sp.skillName` (funciona) | OK — já usa skill do estado |
| `handleValidating` → `calculatePrdScore` | ✅ Score específico do PRD | Score genérico do gate |
| `handleApproved` → `classificacaoProgressiva` | ✅ Classificação pós-PRD | Classificação genérica pós-fase |
| Persona → `"Gestão de Produto"` | ✅ 7 ocorrências hardcoded | Persona dinâmica da skill |

**`specialist-formatters.ts` (403 linhas):**

| Componente | Hardcoded | Precisa generalizar |
|-----------|:---------:|:-------------------:|
| `getRequiredFields(mode)` | ✅ Campos do PRD apenas | Campos por fase |
| `formatMissingFieldsByBlock` | ✅ Blocos do PRD (problema/solução/planejamento) | Blocos dinâmicos |
| `buildCollectionPrompt` | ✅ Título "Gestão de Produto" | Título dinâmico |
| `getSpecialistQuestions(fase, faseNome)` | ✅ If/else por nome de fase | Ler da skill |

### 9.1 Task: Criar interface `PhaseConfig` para configuração dinâmica

**Arquivo NOVO:** `src/src/types/phase-config.ts`

```typescript
/**
 * Configuração dinâmica de uma fase de documento.
 * Carregada da SKILL.md do especialista em runtime.
 */
export interface PhaseConfig {
    /** Nome da fase (ex: "Discovery", "Requisitos") */
    faseName: string;
    /** Nome do especialista para exibição */
    specialistName: string;
    /** Campos de coleta conversacional (extraídos da seção "Coleta Conversacional" da skill) */
    collectFields: CollectField[];
    /** Path do entregável esperado (relativo ao projeto) */
    outputPath: string;
    /** Nome do template (para formatSkillHydrationCommand) */
    skillName: string;
    /** Gate checklist items (do flows/types.ts) */
    gateChecklist: string[];
}

export interface CollectField {
    id: string;        // ex: "problema", "stack_preferida"
    label: string;     // ex: "Qual problema o produto resolve?"
    block: string;     // ex: "problema", "solucao", "contexto"
    hint: string;      // Dica curta
    required: boolean; // Obrigatório para avançar?
}
```

**Esforço:** ~1h

---

### 9.2 Task: Criar `loadPhaseConfig()` — carrega config da skill

**Arquivo:** `src/src/services/phase-config-loader.ts`

```typescript
/**
 * Carrega PhaseConfig a partir da SKILL.md do especialista.
 * Parseia seções "Coleta Conversacional" e "Seções Obrigatórias" do markdown.
 */
export async function loadPhaseConfig(
    diretorio: string,
    faseNome: string,
    skillName: string,
    gateChecklist: string[],
    especialista: string
): Promise<PhaseConfig>;
```

**Lógica:**
1. Ler SKILL.md da skill correspondente à fase
2. Extrair seção "## Coleta Conversacional" → parsear blocos e perguntas
3. Extrair seção "## Entregável" → determinar outputPath
4. Montar `PhaseConfig` com dados extraídos + dados do `flows/types.ts`

**Fallback:** Se SKILL.md não existir ou parsing falhar, retornar config mínima com `collectFields: []` (comportamento atual — pula coleta, vai direto para validação).

**Esforço:** ~3h

---

### 9.3 Task: Refatorar `specialist-phase-handler.ts` para aceitar `PhaseConfig`

**Arquivo:** `src/src/handlers/specialist-phase-handler.ts` (715 → ~500 linhas)

**Mudanças:**

1. **Remover `PRD_OUTPUT_PATHS`** → usar `PhaseConfig.outputPath`
2. **`handleCollecting`** → usar `config.collectFields` em vez de `getRequiredFields(mode)`
3. **`handleGenerating`** → usar `config.skillName` (já funciona parcialmente)
4. **`handleValidating`** → usar gate checklist do `config.gateChecklist` para scoring
5. **`handleApproved`** → generalizar transição (não apenas classificação pós-PRD)
6. **Remover 7 ocorrências de "Gestão de Produto"** → usar `config.specialistName`
7. **Remover `calculatePrdScore`** → usar `calcularScoreContextual` com gate checklist

**Impacto em `field-normalizer.ts` e `prd-scorer.ts`:**
- `getRequiredFields(mode)` fica como **fallback** para Fase 1 se PhaseConfig falhar
- `calculatePrdScore` fica como **fallback** para Fase 1
- Nenhum código é DELETADO — apenas deixa de ser o caminho principal

**Esforço:** ~4h

---

### 9.4 Task: Atualizar `avancar.ts` para usar specialist handler em TODAS as fases

**Arquivo:** `src/src/tools/consolidated/avancar.ts`

**Situação atual (linhas 171-227):**
- Specialist handler só é chamado quando `onboarding?.specialistPhase` existe
- `specialistPhase` só é criado na Fase 1 pelo `iniciar-projeto.ts`
- Fases 2+ nunca entram no specialist handler

**Mudança:**
```typescript
// ANTES: specialist handler apenas para onboarding com specialistPhase
if (inOnboarding && onboarding?.specialistPhase) {
    return handleSpecialistPhase(...)
}

// DEPOIS: specialist handler para TODAS as fases de DOCUMENTO
const faseAtualInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
const isDocPhase = !isCodePhaseName(faseAtualInfo?.nome);

if (isDocPhase) {
    // Inicializar specialistPhase se não existir para esta fase
    if (!estado.specialist_phase_state || estado.specialist_phase_state.fase !== estado.fase_atual) {
        estado.specialist_phase_state = createSpecialistPhaseForFase(estado, faseAtualInfo);
    }
    
    const config = await loadPhaseConfig(diretorio, faseAtualInfo.nome, ...);
    return handleSpecialistPhase({ estado, diretorio, config, respostas, entregavel });
}
```

**Nota:** Esta mudança requer que o `specialist-phase-handler.ts` já esteja refatorado (Sprint 9.3).

**Esforço:** ~2h

---

### 9.5 Task: Atualizar `specialist-formatters.ts`

**Arquivo:** `src/src/handlers/specialist-formatters.ts` (403 linhas)

**Mudanças:**
- `getSpecialistQuestions()` → **deprecate** (perguntas agora vêm da skill via PhaseConfig)
- `buildCollectionPrompt()` → receber `PhaseConfig` em vez de hardcoded
- `formatMissingFieldsByBlock()` → aceitar blocos dinâmicos
- Remover referências hardcoded a "Gestão de Produto"

**Esforço:** ~2h

---

## Sprint 10 — Refatorar proximo.ts + Fix Gaps (~10h)

### Objetivo
Quebrar o monolito `proximo.ts` (1328 linhas) em módulos menores, corrigir a delegação duplicada para fases de código, e gerar doc automático de fases.

### Diagnóstico do Problema Atual

`proximo.ts` é uma única função de 1100+ linhas que faz 13 coisas diferentes:

```
proximo() {
    1. Validar parâmetros (linhas 206-253)
    2. Ler entregável do disco (linhas 267-375)
    3. Classificação de PRD (linhas 541-601)        → Extrair
    4. Verificação de classificação pendente (606-657) → Extrair
    5. Verificar skill carregada (670-694)
    6. Validar gate (697-784)
    7. Score < 50: bloquear (741-784)
    8. Score 50-69: aprovação manual (787-855)
    9. Score >= 70: avançar (857-1093)               → Extrair
    10. Classificação progressiva (912-1044)          → Extrair
    11. Gerar tasks para código (1046-1095)
    12. Gate orientation + watcher (1160-1198)
    13. Persistência + response (1200-1293)
}
```

### 10.1 Task: Extrair `phase-transition.ts`

**Arquivo NOVO:** `src/src/services/phase-transition.ts` (~250 linhas)

**Extrair de `proximo.ts` linhas 857-1198:**
- Salvar entregável no disco
- Atualizar estado com entregável registrado
- Atualizar resumo do projeto
- Classificação progressiva (registrar sinais, recalcular, verificar expansão)
- Gerar tasks para próxima fase de código
- logEvent + gerarSystemMd
- Gate orientation doc
- File watcher lifecycle
- Persistir estado e resumo

**Interface:**
```typescript
export async function transitionToNextPhase(
    estado: EstadoProjeto,
    diretorio: string,
    entregavel: string,
    faseAtual: Fase,
    args: { resumo_json?: string; nome_arquivo?: string; auto_flow?: boolean }
): Promise<{
    estadoFile: { path: string; content: string };
    filesToSave: Array<{ path: string; content: string }>;
    classificacaoInfo: string;
    proximaFase: Fase | undefined;
}>;
```

**Esforço:** ~3h

---

### 10.2 Task: Extrair `classification-handler.ts`

**Arquivo NOVO:** `src/src/services/classification-handler.ts` (~150 linhas)

**Extrair de `proximo.ts` linhas 541-657:**
- Fluxo PRD-first: classificar PRD e mostrar prompt de confirmação
- Verificação de `aguardando_classificacao`: mostrar prompt ou auto-confirmar
- Inferência contextual balanceada

**Interface:**
```typescript
export async function handleClassificationIfNeeded(
    estado: EstadoProjeto,
    diretorio: string,
    entregavel: string,
    autoFlow: boolean
): Promise<ToolResult | null>;  // null = prosseguir, ToolResult = retornar ao usuário
```

**Esforço:** ~2h

---

### 10.3 Task: Simplificar `proximo.ts` para orquestrador

**Arquivo:** `src/src/tools/proximo.ts` (1328 → ~350 linhas)

**Estrutura simplificada:**
```typescript
export async function proximo(args: ProximoArgs): Promise<ToolResult> {
    // 1. Validar parâmetros (30 linhas)
    // 2. Ler entregável do disco (50 linhas)
    // 3. Classificação (se necessário) — delega para classification-handler
    // 4. Autonomia check (10 linhas)
    // 5. Verificar aprovação pendente (30 linhas)
    // 6. Verificar skill carregada (20 linhas)
    // 7. Validar gate via deliverable-gate.service (20 linhas)
    // 8. Score < 50: bloquear (30 linhas)
    // 9. Score 50-69: aprovação manual (30 linhas)
    // 10. Score >= 70: delegar para phase-transition.ts (20 linhas)
    // 11. Montar resposta final (30 linhas)
}
```

**Esforço:** ~3h

---

### 10.4 Task: Fix delegação duplicada (code-phase → proximo)

**Arquivo:** `src/src/handlers/code-phase-handler.ts`

**Problema (diagnóstico da análise V9 de orquestração):**
> "code-validator.ts faz validação séria (arquivos no disco). Depois, delegateToProximo() converte tudo para markdown e valida por keywords — potencialmente contradizendo o score."

**Fix (15 linhas):**
```typescript
// Em handleGate(), quando score >= 70:
async function delegateToProximo(args: CodePhaseArgs): Promise<ToolResult> {
    // ANTES: chamava proximo() que re-validava por keywords
    // DEPOIS: chama proximo() com flag skip_validation
    return proximo({
        ...args,
        estado_json: serializarEstado(args.estado).content,
        diretorio: args.diretorio,
        skip_validation: true,  // NOVO: pula validateDeliverableForGate
    });
}
```

E em `proximo.ts`:
```typescript
// Aceitar skip_validation como arg
if (args.skip_validation) {
    // Pular validação — code-validator já aprovou
    // Ir direto para phase-transition
}
```

**Esforço:** ~1h

---

### 10.5 Task: Doc automático de fases (`iniciar-projeto.ts`)

**Arquivo:** `src/src/tools/iniciar-projeto.ts`

**Mudança:** Após criar estado do projeto, gerar `docs/00-setup/plano-orquestracao.md` automaticamente.

```typescript
// Após confirmarProjeto() salvar o estado:
const fluxo = getFluxoComStitch(nivel, usarStitch);
const planDoc = gerarPlanoOrquestracao(fluxo, nivel);
await saveFile(`${diretorio}/docs/00-setup/plano-orquestracao.md`, planDoc);
```

**Função `gerarPlanoOrquestracao`:**
- Lista fases do fluxo com: número, nome, especialista, entregável, gate checklist resumido
- Gerado de `flows/types.ts` em runtime — sempre atualizado

**Esforço:** ~1h

---

## Sprint 11 — Deploy de Skills + Migração (~8h)

### 11.1 Task: Script de deploy de skills

**Arquivo NOVO:** `src/src/utils/skill-deployer.ts`

```typescript
/**
 * Copia skills de content/skills/ para o diretório da IDE no projeto.
 * 
 * Windsurf: .windsurf/skills/<skill-name>/
 * Cursor: .cursor/rules/<skill-name>.mdc (conversão SKILL.md → .mdc)
 * Antigravity: .agent/skills/<skill-name>/
 */
export async function deploySkillsToProject(
    contentSkillsDir: string,  // Caminho para content/skills/
    projectDir: string,
    ide: IDEType,
    nivel: NivelComplexidade
): Promise<string[]>;  // Retorna lista de skills deployadas
```

**Lógica:**
1. Ler fluxo do nível → obter lista de skills necessárias
2. Para cada skill: copiar diretório inteiro para destino da IDE
3. Para Cursor: converter SKILL.md para .mdc com frontmatter do Cursor
4. Retornar lista de skills deployadas

**Integração:** Chamado em `iniciar-projeto.ts` após criar estado.

**Esforço:** ~3h

---

### 11.2 Task: Migração v9→v10

**Arquivo NOVO:** `src/src/utils/migration-v10.ts`

```typescript
/**
 * Migra estado de projeto v9 para v10.
 * Ajusta: nomes de fases, skills, numeração, total_fases.
 */
export function migrateStateV9toV10(estado: EstadoProjeto): EstadoProjeto;
```

**Lógica:**
1. Se `total_fases` é 7/13/17 (v9) → converter para 5/8/11 (v10)
2. Renumerar `fase_atual` baseado na fase em que o projeto está
3. Atualizar `gates_validados` com nova numeração
4. Preservar entregáveis já gerados

**Integração:** Chamado em `createStateService().load()` quando detecta versão antiga.

**Esforço:** ~2h

---

### 11.3 Task: Migration Guide

**Arquivo:** `docs/MIGRATION_V9_TO_V10.md`

Documento para desenvolvedores com:
- Breaking changes (nomes de fases, skills, numeração)
- Migração automática de estado
- Novas skills e onde encontrá-las
- Novos gate checklists

**Esforço:** ~1h

---

### 11.4 Task: Testes Manuais

| Teste | Descrição | Esforço |
|-------|-----------|---------|
| Fluxo simples E2E | Criar projeto → Discovery → Design → Arquitetura → Frontend → Backend | 1h |
| Fluxo médio parcial | Criar projeto → Produto → Requisitos → verificar specialist handler genérico | 0.5h |
| Readiness gate | Tentar entrar em Frontend sem artefatos → verificar bloqueio | 0.5h |

**Esforço:** ~2h

---

## Diagrama de Dependências

```
Sprint 8 (Prompt Mapper + Readiness Gate)
    ├── 8.1 prompt-mapper.ts ─────────────── [independente]
    ├── 8.2 readiness-gate.ts ────────────── [depende de 8.1]
    ├── 8.3 scoring-config.ts ────────────── [independente]
    └── 8.4 testes prompt-mapper ─────────── [depende de 8.1]

Sprint 9 (Generalizar Specialist Handler) ── [depende de Sprint 8]
    ├── 9.1 PhaseConfig type ─────────────── [independente]
    ├── 9.2 phase-config-loader.ts ───────── [depende de 9.1]
    ├── 9.3 specialist-phase-handler.ts ──── [depende de 9.1, 9.2]
    ├── 9.4 avancar.ts ──────────────────── [depende de 9.3]
    └── 9.5 specialist-formatters.ts ─────── [depende de 9.1]

Sprint 10 (Refatorar proximo.ts) ──────────── [depende de Sprint 9]
    ├── 10.1 phase-transition.ts ─────────── [independente]
    ├── 10.2 classification-handler.ts ───── [independente]
    ├── 10.3 simplificar proximo.ts ──────── [depende de 10.1, 10.2]
    ├── 10.4 fix delegação duplicada ─────── [depende de 10.3]
    └── 10.5 doc automático de fases ─────── [independente]

Sprint 11 (Deploy + Migração) ─────────────── [depende de Sprint 8-10]
    ├── 11.1 skill-deployer.ts ───────────── [depende de 8.1]
    ├── 11.2 migration-v10.ts ────────────── [depende de Sprint 8]
    ├── 11.3 migration guide doc ─────────── [depende de 11.2]
    └── 11.4 testes manuais ──────────────── [depende de tudo]
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:------:|-----------|
| Specialist handler genérico quebra Fase 1 (PRD) | Alta | Crítico | Manter `calculatePrdScore` e `getRequiredFields` como fallback para fase 1 |
| proximo.ts refatorado tem regressões | Alta | Alto | Extrair módulos incrementalmente, testar cada extração |
| Readiness gate muito restritivo bloqueia projetos | Média | Alto | Threshold 60 é generoso; fallback com `force_skip` |
| PhaseConfig parser falha com SKILL.md mal formatada | Média | Médio | Fallback para config mínima (pula coleta) |
| Migração v9→v10 perde dados de projetos existentes | Baixa | Crítico | Migration preserva entregáveis, só renumera fases |
| Cursor não suporta diretório de recursos na skill | Alta | Médio | Converter para .mdc com @mentions para recursos |

---

## Ordem Recomendada de Implementação

| Ordem | Task | Risco | Valor |
|:-----:|------|:-----:|:-----:|
| 1 | 8.1 Atualizar prompt-mapper.ts | Baixo | Alto |
| 2 | 8.3 Atualizar scoring-config.ts | Baixo | Médio |
| 3 | 8.2 Criar readiness-gate.ts | Médio | Alto |
| 4 | 8.4 Testes prompt-mapper | Baixo | Médio |
| 5 | 10.5 Doc automático de fases | Baixo | Médio |
| 6 | 10.4 Fix delegação duplicada | Baixo | Alto |
| 7 | 10.1 Extrair phase-transition.ts | Médio | Alto |
| 8 | 10.2 Extrair classification-handler.ts | Médio | Alto |
| 9 | 10.3 Simplificar proximo.ts | Alto | Alto |
| 10 | 9.1 PhaseConfig type | Baixo | Médio |
| 11 | 9.2 phase-config-loader.ts | Médio | Alto |
| 12 | 9.3 Refatorar specialist-phase-handler | Alto | Muito Alto |
| 13 | 9.4 Atualizar avancar.ts | Alto | Muito Alto |
| 14 | 9.5 specialist-formatters.ts | Médio | Médio |
| 15 | 11.1 skill-deployer.ts | Médio | Alto |
| 16 | 11.2 migration-v10.ts | Médio | Alto |
| 17 | 11.3 Migration guide | Baixo | Médio |
| 18 | 11.4 Testes manuais | — | Crítico |

> **Nota:** A ordem prioriza tasks de baixo risco e alto valor primeiro. O Sprint 9 (specialist handler genérico) é o mais arriscado e deve ser feito por último entre as refatorações de código — assim, se falhar, os outros ganhos já estão consolidados.
