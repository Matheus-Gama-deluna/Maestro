/**
 * Testes para Middleware Pipeline v5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { withStateLoad } from '../middleware/state-loader.middleware.js';
import { withPersistence } from '../middleware/persistence.middleware.js';
import { withFlowEngine } from '../middleware/flow-engine.middleware.js';
import { withSkillInjection } from '../middleware/skill-injection.middleware.js';
import { applyMiddlewares, applyLightMiddlewares } from '../middleware/index.js';
import type { ToolResult } from '../types/index.js';

// Mock state service
vi.mock('../services/state.service.js', () => ({
    createStateService: vi.fn((dir: string) => ({
        load: vi.fn().mockResolvedValue({
            nome: 'Test Project',
            nivel: 'medio',
            fase_atual: 2,
            total_fases: 8,
            status: 'ativo',
            gates_validados: [1],
            entregaveis: {},
            usar_stitch: false,
        }),
        save: vi.fn().mockResolvedValue(true),
        saveFiles: vi.fn().mockResolvedValue(1),
    })),
}));

// Mock state storage
vi.mock('../state/storage.js', () => ({
    serializarEstado: vi.fn((estado: any) => ({
        path: '.maestro/estado.json',
        content: JSON.stringify(estado),
    })),
    parsearEstado: vi.fn((json: string) => {
        try {
            return JSON.parse(json);
        } catch {
            return null;
        }
    }),
}));

// Mock flow engine
vi.mock('../services/flow-engine.js', () => ({
    getNextStep: vi.fn(() => ({
        tool: 'proximo',
        description: 'Avançar para próxima fase',
        args_template: {},
        requires_user_input: true,
    })),
    getFlowProgress: vi.fn(() => ({
        current_phase: 'Requisitos',
        total_phases: 8,
        completed_phases: 1,
        percentage: 12,
    })),
    flowStepToNextAction: vi.fn((step: any) => ({
        tool: step.tool,
        description: step.description,
        args_template: step.args_template,
        requires_user_input: step.requires_user_input,
    })),
    isInOnboarding: vi.fn(() => false),
}));

// Mock errors
vi.mock('../errors/index.js', () => ({
    withErrorHandling: vi.fn((name: string, handler: any) => handler),
}));

// Mock content resolver and skill loader for skill injection
vi.mock('../services/content-resolver.service.js', () => ({
    ContentResolverService: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../services/skill-loader.service.js', () => ({
    SkillLoaderService: vi.fn().mockImplementation(() => ({
        loadForPhase: vi.fn().mockResolvedValue(null),
        formatAsMarkdown: vi.fn().mockReturnValue(''),
    })),
}));

vi.mock('../utils/prompt-mapper.js', () => ({
    getSkillParaFase: vi.fn(() => null),
}));

vi.mock('../flows/types.js', () => ({
    getFaseComStitch: vi.fn(() => ({
        nome: 'Requisitos',
        especialista: 'Engenheiro de Requisitos',
        entregavel_esperado: 'requisitos.md',
        gate_checklist: [],
    })),
}));

describe('Middleware: withStateLoad', () => {
    it('deve carregar estado automaticamente quando estado_json não fornecido', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
        });

        const wrapped = withStateLoad(handler);
        await wrapped({ diretorio: '/test/project' });

        // Handler deve receber estado_json preenchido
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                diretorio: '/test/project',
                estado_json: expect.any(String),
            })
        );
    });

    it('deve manter estado_json existente sem sobrescrever', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
        });

        const originalState = '{"nome":"Original"}';
        const wrapped = withStateLoad(handler);
        await wrapped({ diretorio: '/test/project', estado_json: originalState });

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                estado_json: originalState,
            })
        );
    });

    it('deve funcionar sem diretório (não carrega estado)', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
        });

        const wrapped = withStateLoad(handler);
        await wrapped({});

        expect(handler).toHaveBeenCalledWith({});
    });
});

describe('Middleware: withPersistence', () => {
    it('deve persistir estado_atualizado automaticamente', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
            estado_atualizado: JSON.stringify({ nome: 'Test', nivel: 'medio', fase_atual: 3 }),
        });

        const wrapped = withPersistence(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result).toHaveProperty('_state_persisted', true);
    });

    it('deve persistir files retornados', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
            estado_atualizado: JSON.stringify({ nome: 'Test' }),
            files: [{ path: '/test/file.md', content: '# Test' }],
        });

        const wrapped = withPersistence(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result).toHaveProperty('_files_persisted', 1);
    });

    it('não deve persistir quando isError=true', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'erro' }],
            isError: true,
            estado_atualizado: '{"nome":"Test"}',
        });

        const wrapped = withPersistence(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result).not.toHaveProperty('_state_persisted');
    });
});

describe('Middleware: withFlowEngine', () => {
    it('deve calcular next_action quando não presente no resultado', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
            estado_atualizado: JSON.stringify({ nome: 'Test', nivel: 'medio', fase_atual: 2, total_fases: 8 }),
        });

        const wrapped = withFlowEngine(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result.next_action).toBeDefined();
        expect(result.next_action?.tool).toBe('proximo');
        expect(result.progress).toBeDefined();
    });

    it('não deve sobrescrever next_action já presente', async () => {
        const existingAction = { tool: 'validar_gate', description: 'Validar', args_template: {}, requires_user_input: false };
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'ok' }],
            estado_atualizado: JSON.stringify({ nome: 'Test' }),
            next_action: existingAction,
        });

        const wrapped = withFlowEngine(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result.next_action).toEqual(existingAction);
    });

    it('não deve calcular next_action quando isError', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'erro' }],
            isError: true,
        });

        const wrapped = withFlowEngine(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result.next_action).toBeUndefined();
    });
});

describe('Middleware: withSkillInjection', () => {
    it('não deve injetar quando resposta já contém contexto do especialista', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: '# 🧠 Contexto do Especialista — Arquitetura\n\nConteúdo' }],
        });

        const wrapped = withSkillInjection(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        // Não deve duplicar
        const occurrences = (result.content[0].text.match(/Contexto do Especialista/g) || []).length;
        expect(occurrences).toBe(1);
    });

    it('não deve injetar quando isError', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'Erro' }],
            isError: true,
        });

        const wrapped = withSkillInjection(handler);
        const result = await wrapped({ diretorio: '/test/project' });

        expect(result.content[0].text).toBe('Erro');
    });
});

describe('Pipeline: applyMiddlewares', () => {
    it('deve compor todos os middlewares sem erro', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'Pipeline OK' }],
        });

        const wrapped = applyMiddlewares('test-tool', handler);
        expect(typeof wrapped).toBe('function');

        const result = await wrapped({ diretorio: '/test/project' });
        expect(result.content[0].text).toBe('Pipeline OK');
    });
});

describe('Pipeline: applyLightMiddlewares', () => {
    it('deve aplicar apenas error handling e state load', async () => {
        const handler = vi.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'Light OK' }],
        });

        const wrapped = applyLightMiddlewares('test-tool', handler);
        const result = await wrapped({ diretorio: '/test/project' });
        expect(result.content[0].text).toBe('Light OK');
    });
});
