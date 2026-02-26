// src/src/tests/test-stub-generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateTestStub, generatePhaseTestStubs } from '../services/test-stub-generator.service.js';
import type { TaskItem } from '../services/task-decomposer.service.js';

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

describe('TestStubGenerator', () => {
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
        const taskSemCriteria: TaskItem = { ...mockTask, metadata: {} };
        const stub = generateTestStub(taskSemCriteria);
        expect(stub).toContain('caso principal');
        expect(stub).toContain('caso de erro');
        expect(stub).toContain('edge case');
    });

    it('stub contém o ID da task como referência', () => {
        const stub = generateTestStub(mockTask);
        expect(stub).toContain('task-abc12345');
    });

    it('stub contém o título da task no describe', () => {
        const stub = generateTestStub(mockTask);
        expect(stub).toContain('Implementar Login Endpoint');
    });

    it('suporta framework jest', () => {
        const stub = generateTestStub(mockTask, 'jest');
        expect(stub).toContain('// Jest');
        expect(stub).not.toContain("from 'vitest'");
    });

    it('generatePhaseTestStubs gera arquivos para tasks de implementação', () => {
        const tasks: TaskItem[] = [
            mockTask,
            { ...mockTask, id: 'task-def67890', title: 'Implementar Auth Service', tags: ['implementation'] },
            { ...mockTask, id: 'task-test1111', title: 'Testes de Login', tags: ['testing'] },
        ];

        const stubs = generatePhaseTestStubs(tasks, 5);
        expect(stubs.length).toBe(2); // Apenas implementation, não testing
        expect(stubs[0].path).toContain('.test.ts');
        expect(stubs[1].path).toContain('.test.ts');
    });

    it('generatePhaseTestStubs usa testDir customizado', () => {
        const stubs = generatePhaseTestStubs([mockTask], 5, 'src/__tests__');
        expect(stubs[0].path).toContain('src/__tests__');
    });

    it('generatePhaseTestStubs retorna vazio se não há tasks de implementação', () => {
        const tasks: TaskItem[] = [
            { ...mockTask, tags: ['testing'] },
            { ...mockTask, id: 'epic-1', type: 'epic', tags: ['epic'] },
        ];
        const stubs = generatePhaseTestStubs(tasks, 5);
        expect(stubs.length).toBe(0);
    });

    it('path do stub usa slug do título sem caracteres especiais', () => {
        const taskComAcento: TaskItem = { ...mockTask, title: 'Implementar: Autenticação JWT' };
        const stubs = generatePhaseTestStubs([taskComAcento], 5);
        expect(stubs[0].path).not.toMatch(/[^a-z0-9\-/._]/i);
    });
});
