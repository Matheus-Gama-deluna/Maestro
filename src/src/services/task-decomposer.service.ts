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
