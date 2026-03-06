# Sprint 3: Code Generation (v6.5) — Guia de Implementação Detalhado

**Objetivo:** Suportar geração de código real com validação granular via Task-Driven Development  
**Duração estimada:** 4-6 semanas  
**Pré-requisito:** Sprint 2 concluído (specialist decomposto, entry point unificado)  
**Resultado esperado:** Tasks ativadas no estado, scoring contextual, validação estática de código

---

## REGRAS PARA A IA EXECUTORA

1. **Execute uma task por vez**, na ordem listada
2. **Após cada task**, rode `npx tsc --noEmit` e `npm test`
3. **Cada arquivo novo deve ter <300 linhas** e testes próprios
4. **NÃO modifique o fluxo de fases de documentos** — essas tasks afetam APENAS fases de código
5. **Testes são obrigatórios** antes de cada commit. Nenhuma task está completa sem teste

---

## Visão Geral da Arquitetura

```
Fluxo atual (v6.0):
  Fase 1: PRD → Fase 2: Requisitos → ... → Fase N: Backend (1 entregável monolítico)

Fluxo proposto (v6.5):
  Fase 1: PRD → Fase 2: Requisitos → ... → Fase N: Backend
                                              ├── Epic: API Auth
                                              │   ├── Task: route handler     → arquivos + testes
                                              │   ├── Task: auth service      → arquivos + testes
                                              │   └── Task: unit tests        → validação
                                              └── Epic: API Users
                                                  └── ...
```

O tipo `EstadoProjeto.tasks` já existe (`types/index.ts:100-122`) mas nunca é populado. Este sprint ativa e usa esse campo.

---

## Task 3.1 — Ativar e Popular `EstadoProjeto.tasks`

### Contexto

O tipo de tasks já está definido em `src/src/types/index.ts` (linhas 100-122):

```typescript
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
    metadata?: {
        files?: string[];
        commits?: string[];
        tests?: string[];
        acceptance_criteria?: string[];
    };
}>;
```

### Passo 1: Criar `src/src/services/task-decomposer.service.ts`

Este serviço converte o entregável da fase de Arquitetura em epics → stories → tasks.

```typescript
/**
 * TaskDecomposer — Decompõe entregável de arquitetura em tasks executáveis
 * 
 * Recebe o documento de arquitetura e gera uma hierarquia de tasks:
 * - Epics: módulos principais (ex: "API Auth", "API Users")
 * - Stories: funcionalidades dentro do módulo (ex: "Login endpoint")
 * - Tasks: unidades de trabalho (ex: "Criar route handler", "Criar testes")
 * 
 * @since v6.5
 */

import { randomUUID } from "crypto";

export interface TaskItem {
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
    created_at: string;
    updated_at: string;
    tags: string[];
    metadata?: {
        files?: string[];
        tests?: string[];
        acceptance_criteria?: string[];
    };
}

/**
 * Gera uma estrutura de tasks a partir do entregável de arquitetura.
 * 
 * A IA fornece o documento de arquitetura como texto. Este serviço extrai:
 * - Seções com ## ou ### como potenciais epics/stories
 * - Listas de itens como tasks
 * - Referências a arquivos como metadata.files
 * 
 * @param arquiteturaContent - Conteúdo do documento de arquitetura (Markdown)
 * @param faseNumero - Número da fase de código (ex: 5 para Backend, 6 para Frontend)
 * @returns Array de TaskItem hierárquicas
 */
export function decomposeArchitectureToTasks(
    arquiteturaContent: string,
    faseNumero: number
): TaskItem[] {
    const tasks: TaskItem[] = [];
    const now = new Date().toISOString();

    // Extrair seções H2 como epics
    const epicSections = extractSections(arquiteturaContent, 2);

    for (const section of epicSections) {
        const epicId = generateId();
        const childIds: string[] = [];

        // Extrair subsections H3 como stories
        const storySections = extractSections(section.content, 3);

        for (const story of storySections) {
            const storyId = generateId();
            childIds.push(storyId);

            // Gerar tasks padrão para cada story
            const taskIds: string[] = [];

            // Task: implementação
            const implTaskId = generateId();
            taskIds.push(implTaskId);
            tasks.push(createTask({
                id: implTaskId,
                type: 'task',
                title: `Implementar: ${story.title}`,
                description: `Implementar a funcionalidade "${story.title}" conforme especificado na arquitetura.`,
                parent_id: storyId,
                phase: faseNumero,
                tags: ['implementation'],
                metadata: { acceptance_criteria: extractListItems(story.content) },
            }));

            // Task: testes
            const testTaskId = generateId();
            taskIds.push(testTaskId);
            tasks.push(createTask({
                id: testTaskId,
                type: 'task',
                title: `Testes: ${story.title}`,
                description: `Criar testes unitários e de integração para "${story.title}".`,
                parent_id: storyId,
                phase: faseNumero,
                dependencies: [implTaskId],
                tags: ['testing'],
            }));

            // Story
            tasks.push(createTask({
                id: storyId,
                type: 'story',
                title: story.title,
                description: story.content.substring(0, 200),
                parent_id: epicId,
                children_ids: taskIds,
                phase: faseNumero,
                tags: ['story'],
            }));
        }

        // Epic
        tasks.push(createTask({
            id: epicId,
            type: 'epic',
            title: section.title,
            description: `Epic: ${section.title}`,
            children_ids: childIds,
            phase: faseNumero,
            priority: 'high',
            tags: ['epic'],
        }));
    }

    return tasks;
}

/**
 * Retorna a próxima task a ser executada (status=todo, sem dependências bloqueadas).
 */
export function getNextTask(tasks: TaskItem[]): TaskItem | null {
    const doneTasks = new Set(tasks.filter(t => t.status === 'done').map(t => t.id));

    return tasks.find(t => {
        if (t.type !== 'task' && t.type !== 'subtask') return false;
        if (t.status !== 'todo') return false;
        // Verificar se todas as dependências estão done
        return t.dependencies.every(dep => doneTasks.has(dep));
    }) || null;
}

/**
 * Calcula progresso das tasks para uma fase específica.
 */
export function getTaskProgress(tasks: TaskItem[], phase: number): {
    total: number;
    done: number;
    inProgress: number;
    blocked: number;
    percentage: number;
} {
    const phaseTasks = tasks.filter(t => t.phase === phase && (t.type === 'task' || t.type === 'subtask'));
    const done = phaseTasks.filter(t => t.status === 'done').length;
    const inProgress = phaseTasks.filter(t => t.status === 'in_progress').length;
    const blocked = phaseTasks.filter(t => t.status === 'blocked').length;

    return {
        total: phaseTasks.length,
        done,
        inProgress,
        blocked,
        percentage: phaseTasks.length > 0 ? Math.round((done / phaseTasks.length) * 100) : 0,
    };
}

// === HELPERS ===

function generateId(): string {
    return `task-${randomUUID().substring(0, 8)}`;
}

interface Section {
    title: string;
    content: string;
}

function extractSections(markdown: string, level: number): Section[] {
    const prefix = '#'.repeat(level) + ' ';
    const lines = markdown.split('\n');
    const sections: Section[] = [];
    let current: Section | null = null;

    for (const line of lines) {
        if (line.startsWith(prefix)) {
            if (current) sections.push(current);
            current = { title: line.substring(prefix.length).trim(), content: '' };
        } else if (current) {
            current.content += line + '\n';
        }
    }
    if (current) sections.push(current);

    return sections;
}

function extractListItems(content: string): string[] {
    return content.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[-*]\s+/, ''));
}

function createTask(partial: Partial<TaskItem> & { id: string; type: TaskItem['type']; title: string }): TaskItem {
    const now = new Date().toISOString();
    return {
        description: '',
        status: 'todo',
        priority: 'medium',
        children_ids: [],
        dependencies: [],
        tags: [],
        created_at: now,
        updated_at: now,
        ...partial,
    };
}
```

### Passo 2: Integrar decomposição no fluxo de avanço

Quando `proximo.ts` detecta que a fase atual é de código (Backend/Frontend), após o gate da fase de Arquitetura ser aprovado, popular `estado.tasks`:

**Arquivo a modificar:** `src/src/tools/proximo.ts`

Após o gate ser aprovado e antes de avançar para a próxima fase, adicionar:

```typescript
// v6.5: Decompor arquitetura em tasks se entrando em fase de código
import { decomposeArchitectureToTasks } from "../services/task-decomposer.service.js";

// Dentro da lógica de avanço, após gate aprovado:
const proximaFaseInfo = getFaseComStitch(estado.nivel, estado.fase_atual + 1, estado.usar_stitch);
const isCodePhase = proximaFaseInfo?.nome && 
    ['Backend', 'Frontend', 'Integração', 'Testes'].some(k => proximaFaseInfo.nome.includes(k));

if (isCodePhase && entregavelValidado) {
    const tasks = decomposeArchitectureToTasks(entregavelValidado, estado.fase_atual + 1);
    if (tasks.length > 0) {
        estado.tasks = [...(estado.tasks || []), ...tasks];
    }
}
```

**IMPORTANTE:** Encontrar o local exato no `proximo.ts` onde o gate é aprovado e a fase avança. Inserir a decomposição ANTES de persistir o estado.

### Passo 3: Mostrar progresso de tasks no status

**Arquivo a modificar:** `src/src/tools/maestro-tool.ts` (na função de status)

Adicionar seção de tasks no output quando `estado.tasks` estiver populado:

```typescript
// No bloco de formatação de status, adicionar:
if (estado.tasks && estado.tasks.length > 0) {
    const { getTaskProgress } = await import("../services/task-decomposer.service.js");
    const progress = getTaskProgress(estado.tasks, estado.fase_atual);
    
    // Adicionar ao resumo:
    // Tasks: 3/10 (30%) | Em progresso: 1 | Bloqueadas: 0
}
```

### Teste de verificação

```bash
cd src
npx tsc --noEmit
npm test
```

### Testes unitários

```typescript
// src/src/__tests__/task-decomposer.test.ts
import { describe, it, expect } from 'vitest';
import { 
    decomposeArchitectureToTasks, 
    getNextTask, 
    getTaskProgress 
} from '../services/task-decomposer.service.js';

describe('TaskDecomposer', () => {
    const sampleArchitecture = `
## API de Autenticação

### Login Endpoint
- Receber email e senha via POST /auth/login
- Validar credenciais contra banco de dados
- Retornar JWT token

### Registro Endpoint
- Receber dados do usuário via POST /auth/register
- Validar email único
- Hashear senha com bcrypt

## API de Usuários

### Listar Usuários
- GET /users com paginação
- Filtro por nome e email
`;

    it('decompõe arquitetura em epics, stories e tasks', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);

        // Deve ter epics
        const epics = tasks.filter(t => t.type === 'epic');
        expect(epics.length).toBe(2); // API Auth + API Users

        // Deve ter stories
        const stories = tasks.filter(t => t.type === 'story');
        expect(stories.length).toBe(3); // Login + Registro + Listar

        // Deve ter tasks (2 por story: impl + testes)
        const taskItems = tasks.filter(t => t.type === 'task');
        expect(taskItems.length).toBe(6); // 3 stories × 2 tasks
    });

    it('tasks de teste dependem de tasks de implementação', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        const testTasks = tasks.filter(t => t.tags.includes('testing'));

        for (const test of testTasks) {
            expect(test.dependencies.length).toBeGreaterThan(0);
            // A dependência deve ser uma task de implementação
            const dep = tasks.find(t => t.id === test.dependencies[0]);
            expect(dep?.tags).toContain('implementation');
        }
    });

    it('getNextTask retorna task sem dependências bloqueadas', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        const next = getNextTask(tasks);

        expect(next).not.toBeNull();
        expect(next?.type).toBe('task');
        expect(next?.status).toBe('todo');
        expect(next?.dependencies.length).toBe(0); // Primeira task não tem deps
    });

    it('getNextTask respeita dependências', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        
        // Marcar primeira task de implementação como done
        const implTask = tasks.find(t => t.tags.includes('implementation'));
        if (implTask) implTask.status = 'done';

        const next = getNextTask(tasks);
        // Agora pode retornar uma task de teste (cuja dependência está done)
        // OU outra task de implementação sem deps
        expect(next).not.toBeNull();
    });

    it('getTaskProgress calcula corretamente', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        
        // Marcar 2 tasks como done
        const taskItems = tasks.filter(t => t.type === 'task');
        taskItems[0].status = 'done';
        taskItems[1].status = 'done';

        const progress = getTaskProgress(tasks, 5);
        expect(progress.total).toBe(6);
        expect(progress.done).toBe(2);
        expect(progress.percentage).toBe(33);
    });

    it('retorna array vazio para conteúdo sem seções H2', () => {
        const tasks = decomposeArchitectureToTasks('Texto simples sem seções', 5);
        expect(tasks.length).toBe(0);
    });
});
```

### Rollback
1. Remover `task-decomposer.service.ts`
2. Reverter modificações em `proximo.ts` e `maestro-tool.ts`

---

## Task 3.2 — Scoring Contextual por Tipo de Fase

### Contexto

O scoring atual em `proximo.ts` (linhas 131-147) usa pesos fixos:
```
qualityScore = (estrutura * 0.30) + (checklist * 0.50) + (tamanho * 0.20)
```

Fases de código precisam de pesos diferentes de fases de documento.

### Passo 1: Criar `src/src/services/scoring-config.ts`

```typescript
/**
 * Configuração de scoring contextual por tipo de fase.
 * 
 * Fases de documento (PRD, Requisitos) têm critérios diferentes de
 * fases de código (Backend, Frontend).
 * 
 * @since v6.5
 */

export interface ScoreWeights {
    estrutura: number;    // Peso do score de estrutura (0-1)
    checklist: number;    // Peso do score de checklist (0-1)
    qualidade: number;    // Peso do score de qualidade/tamanho (0-1)
    threshold: number;    // Score mínimo para aprovação (0-100)
}

export type PhaseCategory = 'documento' | 'design' | 'codigo';

/**
 * Pesos de scoring por categoria de fase.
 * 
 * - documento: PRD, Requisitos — foco em checklist e qualidade de conteúdo
 * - design: UX, Arquitetura — foco em estrutura e consistência
 * - codigo: Backend, Frontend, Testes — foco em qualidade (testes, tipos)
 */
export const SCORE_WEIGHTS: Record<PhaseCategory, ScoreWeights> = {
    documento: { estrutura: 0.20, checklist: 0.40, qualidade: 0.40, threshold: 65 },
    design:    { estrutura: 0.30, checklist: 0.30, qualidade: 0.40, threshold: 70 },
    codigo:    { estrutura: 0.10, checklist: 0.30, qualidade: 0.60, threshold: 75 },
};

/**
 * Mapeamento de nomes de fase para categorias.
 * Se a fase não for encontrada, usa 'documento' como default.
 */
const PHASE_CATEGORY_MAP: Record<string, PhaseCategory> = {
    // Documentos
    'Produto': 'documento',
    'PRD': 'documento',
    'Requisitos': 'documento',
    'Requisitos Técnicos': 'documento',

    // Design
    'UX/UI': 'design',
    'Design': 'design',
    'Arquitetura': 'design',
    'Arquitetura Técnica': 'design',
    'Prototipagem': 'design',

    // Código
    'Backend': 'codigo',
    'Frontend': 'codigo',
    'Integração': 'codigo',
    'Testes': 'codigo',
    'Deploy': 'codigo',
    'Implementação': 'codigo',
};

/**
 * Determina a categoria de uma fase pelo nome.
 */
export function getPhaseCategory(faseName: string): PhaseCategory {
    // Busca exata
    if (PHASE_CATEGORY_MAP[faseName]) return PHASE_CATEGORY_MAP[faseName];

    // Busca parcial (contém)
    for (const [key, category] of Object.entries(PHASE_CATEGORY_MAP)) {
        if (faseName.toLowerCase().includes(key.toLowerCase())) return category;
    }

    return 'documento'; // Default
}

/**
 * Retorna os pesos de scoring para uma fase específica.
 */
export function getScoreWeights(faseName: string): ScoreWeights {
    const category = getPhaseCategory(faseName);
    return SCORE_WEIGHTS[category];
}

/**
 * Calcula score de qualidade usando pesos contextuais.
 * 
 * @param estruturaScore - Score de estrutura (0-100)
 * @param checklistScore - Score de checklist (0-100)
 * @param qualidadeScore - Score de qualidade/tamanho (0-100)
 * @param faseName - Nome da fase para determinar pesos
 * @returns Score final (0-100) e se está aprovado
 */
export function calcularScoreContextual(
    estruturaScore: number,
    checklistScore: number,
    qualidadeScore: number,
    faseName: string
): { score: number; approved: boolean; weights: ScoreWeights; category: PhaseCategory } {
    const weights = getScoreWeights(faseName);
    const category = getPhaseCategory(faseName);
    
    const score = Math.round(
        (estruturaScore * weights.estrutura) +
        (checklistScore * weights.checklist) +
        (qualidadeScore * weights.qualidade)
    );

    return {
        score,
        approved: score >= weights.threshold,
        weights,
        category,
    };
}
```

### Passo 2: Integrar no `proximo.ts`

**Arquivo:** `src/src/tools/proximo.ts` — função `calcularQualityScore` (linhas 131-147)

**ANTES:**
```typescript
function calcularQualityScore(
    estruturaResult: ReturnType<typeof validarEstrutura>,
    gateResult: ReturnType<typeof validarGate>
): number {
    const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
    const checklistScore = totalChecklist > 0
        ? (gateResult.itens_validados.length / totalChecklist) * 100
        : 100;

    const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

    return Math.round(
        (estruturaResult.score * 0.30) +
        (checklistScore * 0.50) +
        (tamanhoScore * 0.20)
    );
}
```

**DEPOIS:**
```typescript
import { calcularScoreContextual } from "../services/scoring-config.js";

function calcularQualityScore(
    estruturaResult: ReturnType<typeof validarEstrutura>,
    gateResult: ReturnType<typeof validarGate>,
    faseName: string = 'documento'
): { score: number; approved: boolean } {
    const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
    const checklistScore = totalChecklist > 0
        ? (gateResult.itens_validados.length / totalChecklist) * 100
        : 100;

    const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

    return calcularScoreContextual(
        estruturaResult.score,
        checklistScore,
        tamanhoScore,
        faseName
    );
}
```

**IMPORTANTE:** Atualizar todas as chamadas de `calcularQualityScore` para passar o nome da fase e usar o retorno como objeto `{ score, approved }` ao invés de número simples. Buscar:

```bash
grep -n "calcularQualityScore" src/tools/proximo.ts
```

### Teste de verificação
```bash
cd src
npx tsc --noEmit
npm test
```

### Testes unitários

```typescript
// src/src/__tests__/scoring-config.test.ts
import { describe, it, expect } from 'vitest';
import { 
    getPhaseCategory, 
    getScoreWeights, 
    calcularScoreContextual,
    SCORE_WEIGHTS 
} from '../services/scoring-config.js';

describe('Scoring Contextual', () => {
    it('classifica fases corretamente', () => {
        expect(getPhaseCategory('PRD')).toBe('documento');
        expect(getPhaseCategory('Requisitos')).toBe('documento');
        expect(getPhaseCategory('Arquitetura')).toBe('design');
        expect(getPhaseCategory('UX/UI')).toBe('design');
        expect(getPhaseCategory('Backend')).toBe('codigo');
        expect(getPhaseCategory('Frontend')).toBe('codigo');
    });

    it('busca parcial funciona', () => {
        expect(getPhaseCategory('Arquitetura Técnica Detalhada')).toBe('design');
        expect(getPhaseCategory('Backend API REST')).toBe('codigo');
    });

    it('default é documento para fase desconhecida', () => {
        expect(getPhaseCategory('Fase Inventada')).toBe('documento');
    });

    it('threshold de código é maior que de documento', () => {
        expect(SCORE_WEIGHTS.codigo.threshold).toBeGreaterThan(SCORE_WEIGHTS.documento.threshold);
    });

    it('calcularScoreContextual retorna score e aprovação', () => {
        // PRD com scores medianos
        const resultDoc = calcularScoreContextual(70, 80, 60, 'PRD');
        expect(resultDoc.score).toBeGreaterThan(0);
        expect(resultDoc.category).toBe('documento');

        // Backend com mesmos scores — threshold maior, pode não aprovar
        const resultCode = calcularScoreContextual(70, 80, 60, 'Backend');
        expect(resultCode.category).toBe('codigo');
        // Código pesa mais qualidade (0.60) e menos estrutura (0.10)
        expect(resultCode.weights.qualidade).toBe(0.60);
    });

    it('score 80+ aprova em qualquer categoria', () => {
        const result = calcularScoreContextual(85, 85, 85, 'Backend');
        expect(result.approved).toBe(true);
    });

    it('score baixo reprova em código mas pode aprovar em documento', () => {
        const scoreDoc = calcularScoreContextual(60, 70, 60, 'PRD');
        const scoreCode = calcularScoreContextual(60, 70, 60, 'Backend');
        // Documento tem threshold 65, código tem 75
        // Resultados dependem dos pesos, mas código é mais rigoroso
        expect(scoreCode.weights.threshold).toBeGreaterThan(scoreDoc.weights.threshold);
    });
});
```

### Rollback
1. Remover `scoring-config.ts`
2. Reverter `calcularQualityScore` no `proximo.ts` para versão original

---

## Task 3.3 — TDD Integrado (Test Stubs)

### Contexto

Para fases de código, o especialista deve gerar test stubs ANTES do código de implementação. Isso segue o conceito de TDD Invertido já existente no Maestro, expandido para código real.

### Passo 1: Criar `src/src/services/test-stub-generator.service.ts`

```typescript
/**
 * TestStubGenerator — Gera stubs de teste a partir de tasks
 * 
 * Para cada task de implementação, gera um arquivo .test.ts com
 * describe/it blocks baseados nos acceptance criteria e na descrição.
 * 
 * Os testes são gerados com `it.todo()` para que a IA preencha.
 * 
 * @since v6.5
 */

import type { TaskItem } from "./task-decomposer.service.js";

/**
 * Gera conteúdo de arquivo de teste stub para uma task.
 * 
 * @param task - Task de implementação
 * @param framework - Framework de teste ('vitest' | 'jest')
 * @returns Conteúdo do arquivo .test.ts
 */
export function generateTestStub(
    task: TaskItem,
    framework: 'vitest' | 'jest' = 'vitest'
): string {
    const importLine = framework === 'vitest'
        ? "import { describe, it, expect } from 'vitest';"
        : "// Jest — imports globais";

    const criteria = task.metadata?.acceptance_criteria || [];
    const testCases = criteria.length > 0
        ? criteria.map(c => `    it.todo('${escapeQuotes(c)}');`).join('\n')
        : `    it.todo('${escapeQuotes(task.title)} — caso principal');
    it.todo('${escapeQuotes(task.title)} — caso de erro');
    it.todo('${escapeQuotes(task.title)} — edge case');`;

    return `${importLine}

/**
 * Testes para: ${task.title}
 * Task ID: ${task.id}
 * 
 * Gerado automaticamente pelo Maestro v6.5.
 * Preencha cada it.todo() com a implementação do teste.
 */
describe('${escapeQuotes(task.title)}', () => {
${testCases}
});
`;
}

/**
 * Gera stubs de teste para todas as tasks de implementação de uma fase.
 * 
 * @param tasks - Todas as tasks do projeto
 * @param phase - Número da fase
 * @returns Array de { path, content } para cada arquivo de teste
 */
export function generatePhaseTestStubs(
    tasks: TaskItem[],
    phase: number,
    testDir: string = '__tests__'
): Array<{ path: string; content: string }> {
    const implTasks = tasks.filter(
        t => t.phase === phase && t.type === 'task' && t.tags.includes('implementation')
    );

    return implTasks.map(task => {
        const fileName = slugify(task.title) + '.test.ts';
        return {
            path: `${testDir}/${fileName}`,
            content: generateTestStub(task),
        };
    });
}

// === HELPERS ===

function escapeQuotes(str: string): string {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
}
```

### Testes unitários

```typescript
// src/src/__tests__/test-stub-generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateTestStub, generatePhaseTestStubs } from '../services/test-stub-generator.service.js';
import type { TaskItem } from '../services/task-decomposer.service.js';

describe('TestStubGenerator', () => {
    const mockTask: TaskItem = {
        id: 'task-abc12345',
        type: 'task',
        title: 'Implementar Login Endpoint',
        description: 'Criar POST /auth/login com validação',
        status: 'todo',
        priority: 'high',
        children_ids: [],
        dependencies: [],
        phase: 5,
        tags: ['implementation'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
            acceptance_criteria: [
                'Receber email e senha via POST',
                'Retornar JWT token válido',
                'Retornar 401 para credenciais inválidas',
            ],
        },
    };

    it('gera stub com it.todo para cada acceptance criteria', () => {
        const stub = generateTestStub(mockTask);
        expect(stub).toContain("import { describe, it, expect } from 'vitest'");
        expect(stub).toContain('describe(');
        expect(stub).toContain('it.todo(');
        expect(stub).toContain('Receber email e senha via POST');
        expect(stub).toContain('Retornar JWT token');
        expect(stub).toContain('Retornar 401');
    });

    it('gera stubs padrão quando não há acceptance criteria', () => {
        const taskSemCriteria = { ...mockTask, metadata: {} };
        const stub = generateTestStub(taskSemCriteria);
        expect(stub).toContain('caso principal');
        expect(stub).toContain('caso de erro');
        expect(stub).toContain('edge case');
    });

    it('generatePhaseTestStubs gera arquivos para todas as tasks de implementação', () => {
        const tasks: TaskItem[] = [
            mockTask,
            { ...mockTask, id: 'task-def67890', title: 'Implementar Auth Service', tags: ['implementation'] },
            { ...mockTask, id: 'task-test1111', title: 'Testes de Login', tags: ['testing'] }, // Não deve gerar
        ];

        const stubs = generatePhaseTestStubs(tasks, 5);
        expect(stubs.length).toBe(2); // Apenas implementation, não testing
        expect(stubs[0].path).toContain('.test.ts');
        expect(stubs[1].path).toContain('.test.ts');
    });
});
```

### Rollback
Remover `test-stub-generator.service.ts` e seus testes.

---

## Task 3.4 — Validação Estática de Código (Opcional)

### Contexto

Para fases de código, o gate deveria verificar se o código gerado é minimamente válido (sem erros de sintaxe, imports corretos). Usando a TypeScript Compiler API é possível fazer parse sem executar `tsc` completo.

### ATENÇÃO — Complexidade Alta

Esta task é **opcional** para v6.5. Se o tempo for limitado, pular e implementar na v7.0. A validação por checklist (Task 3.2) já é uma melhoria significativa.

### Passo 1: Verificar se `typescript` está disponível

```bash
cd src
node -e "const ts = require('typescript'); console.log('TS version:', ts.version)"
```

Se `typescript` está em `devDependencies` (está: `^5.5.0`), NÃO será instalado em produção. Duas opções:
- **A:** Mover para `dependencies` (aumenta tamanho do pacote)
- **B:** Fazer validação best-effort (tentar import, se falhar, pular)

**Recomendação:** Opção B — validação best-effort.

### Passo 2: Criar `src/src/services/static-validator.service.ts`

```typescript
/**
 * StaticValidator — Validação estática de código TypeScript
 * 
 * Usa a TypeScript Compiler API para verificar sintaxe sem executar tsc.
 * Best-effort: se typescript não estiver disponível, retorna resultado vazio.
 * 
 * @since v6.5
 */

export interface StaticValidationResult {
    valid: boolean;
    errors: Array<{ line: number; message: string; severity: 'error' | 'warning' }>;
    stats: {
        totalLines: number;
        imports: number;
        exports: number;
        anyCount: number;  // Ocorrências de 'any'
    };
}

/**
 * Valida código TypeScript estaticamente.
 * Retorna erros de sintaxe e estatísticas básicas.
 */
export async function validateTypeScript(code: string, fileName: string = 'file.ts'): Promise<StaticValidationResult> {
    try {
        // Tentar importar typescript dinamicamente
        const ts = await import('typescript');

        const sourceFile = ts.createSourceFile(
            fileName,
            code,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        );

        const errors: StaticValidationResult['errors'] = [];

        // Verificar erros de parse
        // Note: createSourceFile não reporta erros semânticos, apenas sintáticos
        // Para erros semânticos, seria necessário criar um Program completo

        // Estatísticas básicas
        let imports = 0;
        let exports = 0;
        let anyCount = 0;

        function visit(node: any) {
            if (ts.isImportDeclaration(node)) imports++;
            if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) exports++;
            // Contar 'any' type annotations
            if (node.kind === ts.SyntaxKind.AnyKeyword) anyCount++;
            ts.forEachChild(node, visit);
        }

        visit(sourceFile);

        const totalLines = code.split('\n').length;

        return {
            valid: errors.length === 0,
            errors,
            stats: { totalLines, imports, exports, anyCount },
        };
    } catch {
        // typescript não disponível — retorna resultado vazio (best-effort)
        return {
            valid: true, // Não bloqueia se não puder validar
            errors: [],
            stats: {
                totalLines: code.split('\n').length,
                imports: 0,
                exports: 0,
                anyCount: 0,
            },
        };
    }
}
```

### Testes unitários

```typescript
// src/src/__tests__/static-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateTypeScript } from '../services/static-validator.service.js';

describe('StaticValidator', () => {
    it('valida código TypeScript correto', async () => {
        const code = `
import { join } from 'path';

export function hello(name: string): string {
    return \`Hello, \${name}!\`;
}
`;
        const result = await validateTypeScript(code);
        expect(result.valid).toBe(true);
        expect(result.stats.imports).toBe(1);
        expect(result.stats.exports).toBe(1);
        expect(result.stats.anyCount).toBe(0);
    });

    it('detecta uso de any', async () => {
        const code = `
export function process(data: any): any {
    return data;
}
`;
        const result = await validateTypeScript(code);
        expect(result.stats.anyCount).toBeGreaterThan(0);
    });

    it('conta linhas corretamente', async () => {
        const code = 'line1\nline2\nline3\n';
        const result = await validateTypeScript(code);
        expect(result.stats.totalLines).toBe(4); // Inclui última linha vazia
    });
});
```

### Rollback
Remover `static-validator.service.ts` e seus testes.

---

## Checklist de Conclusão do Sprint 3

```bash
cd src

# 1. Build compila
npx tsc --noEmit

# 2. Testes passam
npm test

# 3. Verificar que novos serviços existem
ls src/services/task-decomposer.service.ts
ls src/services/scoring-config.ts
ls src/services/test-stub-generator.service.ts

# 4. Verificar que testes existem
ls src/__tests__/task-decomposer.test.ts
ls src/__tests__/scoring-config.test.ts
ls src/__tests__/test-stub-generator.test.ts
```

### Métricas de sucesso
- [ ] `TaskDecomposer` extrai epics, stories e tasks de documento de arquitetura
- [ ] `getNextTask` retorna task correta respeitando dependências
- [ ] `getTaskProgress` calcula progresso por fase
- [ ] `estado.tasks` é populado durante transição para fase de código
- [ ] Scoring contextual diferencia documento vs design vs código
- [ ] Threshold de código (75%) é maior que de documento (65%)
- [ ] Test stubs são gerados com `it.todo()` para cada acceptance criteria
- [ ] Validação estática detecta `any` e conta imports/exports (se implementada)
- [ ] Todos os novos módulos têm <300 linhas
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm test` sem falhas

---

## Ordem de Execução Recomendada

```
3.2 (scoring contextual) → 60 min  — independente, pode ser feito primeiro
3.1 (tasks)               → 120 min — core do sprint, integração com proximo.ts
3.3 (test stubs)           → 60 min  — complementar a 3.1
3.4 (validação estática)   → 90 min  — opcional, best-effort
```

**Total estimado:** ~5-6 horas de implementação + verificação

---

*Sprint 3 detalhado em 25/02/2026.*
*Próximo: Sprint 4 — Platform Foundation (v7.0).*
