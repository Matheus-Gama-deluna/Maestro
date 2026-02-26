// src/src/tests/task-decomposer.test.ts
import { describe, it, expect } from 'vitest';
import {
    decomposeArchitectureToTasks,
    getNextTask,
    getTaskProgress,
} from '../services/task-decomposer.service.js';

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

describe('TaskDecomposer', () => {
    it('decompõe arquitetura em epics, stories e tasks', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);

        const epics = tasks.filter(t => t.type === 'epic');
        expect(epics.length).toBe(2); // API Auth + API Users

        const stories = tasks.filter(t => t.type === 'story');
        expect(stories.length).toBe(3); // Login + Registro + Listar

        const taskItems = tasks.filter(t => t.type === 'task');
        expect(taskItems.length).toBe(6); // 3 stories × 2 tasks
    });

    it('tasks de teste dependem de tasks de implementação', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        const testTasks = tasks.filter(t => t.tags.includes('testing'));

        for (const test of testTasks) {
            expect(test.dependencies.length).toBeGreaterThan(0);
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
        expect(next?.dependencies.length).toBe(0);
    });

    it('getNextTask respeita dependências', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);

        const implTask = tasks.find(t => t.tags.includes('implementation'));
        if (implTask) implTask.status = 'done';

        const next = getNextTask(tasks);
        expect(next).not.toBeNull();
    });

    it('getTaskProgress calcula corretamente', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);

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

    it('tasks pertencem à fase correta', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 7);
        const phaseTasks = tasks.filter(t => t.phase === 7);
        expect(phaseTasks.length).toBe(tasks.length);
    });

    it('getTaskProgress retorna 0% quando não há tasks na fase', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        const progress = getTaskProgress(tasks, 99); // fase inexistente
        expect(progress.total).toBe(0);
        expect(progress.percentage).toBe(0);
    });

    it('cada task de implementação tem acceptance_criteria extraídos da lista', () => {
        const tasks = decomposeArchitectureToTasks(sampleArchitecture, 5);
        const implTasks = tasks.filter(t => t.tags.includes('implementation'));

        const comCriteria = implTasks.filter(t => (t.metadata?.acceptance_criteria?.length ?? 0) > 0);
        expect(comCriteria.length).toBeGreaterThan(0);
    });
});
