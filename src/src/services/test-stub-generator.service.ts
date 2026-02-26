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
 * @param testDir - Diretório base para os arquivos de teste
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
