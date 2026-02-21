import { vi, describe, it, expect, beforeEach } from 'vitest';
import { aprovarGate } from '../tools/aprovar-gate.js';
import * as storage from '../state/storage.js';
import * as context from '../state/context.js';
import * as files from '../utils/files.js';

// Mocks
vi.mock('../state/storage.js', () => ({
    parsearEstado: vi.fn(),
    serializarEstado: vi.fn()
}));

vi.mock('../state/context.js', () => ({
    setCurrentDirectory: vi.fn()
}));

vi.mock('../utils/files.js', () => ({
    resolveProjectPath: vi.fn((p) => p),
    normalizeProjectPath: vi.fn((p) => p)
}));

vi.mock('../utils/history.js', () => ({
    logEvent: vi.fn(),
    EventTypes: {}
}));

vi.mock('../flows/types.js', () => ({
    getFaseComStitch: vi.fn().mockReturnValue({ nome: 'Fase de Teste', entregavel_esperado: 'Doc de Teste' })
}));

vi.mock('../services/specialist.service.js', () => ({
    getSpecialistPersona: vi.fn().mockReturnValue('Persona de Teste')
}));

describe('AprovarGate Tool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar erro se nao informar estado_json', async () => {
        const result = await aprovarGate({
            acao: 'aprovar',
            estado_json: '',
            diretorio: '/test'
        });
        expect(result.content[0].text).toContain('uso EXCLUSIVO do usuário');
        expect(result.isError).toBeUndefined(); // Por design, o texto instrucional não tem isError = true
    });

    it('deve retornar mensagem informacional se o estado não estiver aguardando aprovação', async () => {
        const estadoFalso = { aguardando_aprovacao: false, fase_atual: 1, total_fases: 10, nivel: 'simples' };
        vi.mocked(storage.parsearEstado).mockReturnValue(estadoFalso as any);

        const result = await aprovarGate({
            acao: 'aprovar',
            estado_json: JSON.stringify(estadoFalso),
            diretorio: '/test'
        });

        expect(result.content[0].text).toContain('Nenhuma Aprovação Pendente');
    });

    it('deve retornar erro se acao for aprovar mas não houver score bloqueado', async () => {
        const estadoAguardando = { aguardando_aprovacao: true, score_bloqueado: undefined, fase_atual: 1 };
        vi.mocked(storage.parsearEstado).mockReturnValue(estadoAguardando as any);

        const result = await aprovarGate({
            acao: 'aprovar',
            estado_json: JSON.stringify(estadoAguardando),
            diretorio: '/test'
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Aprovação Inválida');
    });

    it('deve aprovar o gate com sucesso, removendo flag compulsória e retornando next_action proximo', async () => {
        const estadoValido = { 
            aguardando_aprovacao: true, 
            score_bloqueado: 60, 
            fase_atual: 1, 
            total_fases: 10,
            gates_validados: [],
            em_estado_compulsorio: true, // v6 compulsório
            motivo_bloqueio: 'Faltam coisas'
        };
        vi.mocked(storage.parsearEstado).mockReturnValue(estadoValido as any);
        vi.mocked(storage.serializarEstado).mockReturnValue({ content: '{"mock":true}', path: 'estado.json' });

        const result = await aprovarGate({
            acao: 'aprovar',
            estado_json: JSON.stringify(estadoValido),
            diretorio: '/test'
        });

        // Verificações de mutação de estado
        expect(estadoValido.aguardando_aprovacao).toBe(false);
        expect(estadoValido.score_bloqueado).toBeUndefined();
        expect(estadoValido.motivo_bloqueio).toBeUndefined();
        expect(estadoValido.em_estado_compulsorio).toBe(false);

        expect(storage.serializarEstado).toHaveBeenCalledWith(estadoValido);
        expect(result.next_action?.tool).toBe('proximo');
        expect(result.content[0].text).toContain('Gate Aprovado pelo Usuário');
    });

    it('deve rejeitar o gate com sucesso e retornar next_action validar_gate', async () => {
        const estadoValido = { 
            aguardando_aprovacao: true, 
            score_bloqueado: 60, 
            fase_atual: 1, 
            total_fases: 10,
            gates_validados: [],
            em_estado_compulsorio: true,
            motivo_bloqueio: 'Faltam coisas'
        };
        vi.mocked(storage.parsearEstado).mockReturnValue(estadoValido as any);
        vi.mocked(storage.serializarEstado).mockReturnValue({ content: '{"mock":true}', path: 'estado.json' });

        const result = await aprovarGate({
            acao: 'rejeitar',
            estado_json: JSON.stringify(estadoValido),
            diretorio: '/test'
        });

        // Verificações de mutação de estado
        expect(estadoValido.aguardando_aprovacao).toBe(false);
        expect(estadoValido.score_bloqueado).toBeUndefined();
        expect(estadoValido.motivo_bloqueio).toBeUndefined();
        expect(estadoValido.em_estado_compulsorio).toBe(false);

        expect(storage.serializarEstado).toHaveBeenCalledWith(estadoValido);
        expect(result.next_action?.tool).toBe('validar_gate');
        expect(result.content[0].text).toContain('Gate Rejeitado pelo Usuário');
    });
});
