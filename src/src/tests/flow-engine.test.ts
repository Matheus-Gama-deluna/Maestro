import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNextStep, getFlowState, isInOnboarding } from '../services/flow-engine.js';
import type { EstadoProjeto } from '../types/index.js';

// Mock dependencies
vi.mock('../services/specialist.service.js', () => ({
    getSpecialistPersona: vi.fn().mockReturnValue({ role: 'Especialista Mock', context: 'Contexto mock' })
}));

vi.mock('../flows/types.js', () => ({
    getFaseComStitch: vi.fn().mockReturnValue({ nome: 'Requisitos', entregavel_esperado: 'requisitos.md' })
}));

describe('Flow Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Smart Auto-Flow (V6 Sprint 6)', () => {
        let baseState: any;

        beforeEach(() => {
            baseState = {
                projeto_id: '123',
                fase_atual: 2,
                total_fases: 10,
                config: { setup: { completed: true }, mode: 'balanced' },
                gates_validados: [1],
                nivel: 'medio',
                usar_stitch: false
                // flow_phase_type definido no teste
            };
        });

        it('deve manter requires_user_input=true para fases do tipo input_required', () => {
            baseState.flow_phase_type = 'input_required';
            
            const nextStep = getNextStep(baseState as EstadoProjeto, '/test');
            
            // Fases normais de transição de "fase_ativa" para "gerar_entregavel" requerem input humano
            expect(nextStep.tool).toBe('executar');
            expect(nextStep.requires_user_input).toBe(true);
        });

        it('deve sobrescrever requires_user_input=false para fases do tipo derived (Auto-Flow)', () => {
            baseState.flow_phase_type = 'derived';
            
            const nextStep = getNextStep(baseState as EstadoProjeto, '/test');
            
            // Fases derivadas podem avançar silenciosamente sem input
            expect(nextStep.tool).toBe('executar');
            expect(nextStep.requires_user_input).toBe(false);
        });

        it('deve sobrescrever requires_user_input=false para fases do tipo technical (Auto-Flow)', () => {
            baseState.flow_phase_type = 'technical';
            
            const nextStep = getNextStep(baseState as EstadoProjeto, '/test');
            
            expect(nextStep.tool).toBe('executar');
            expect(nextStep.requires_user_input).toBe(false);
        });

        it('deve manter requires_user_input=true para fases do tipo correction_loop', () => {
            baseState.flow_phase_type = 'correction_loop';
            
            const nextStep = getNextStep(baseState as EstadoProjeto, '/test');
            
            expect(nextStep.tool).toBe('executar');
            expect(nextStep.requires_user_input).toBe(true); // transição padrão exige input se for fallback
        });
    });

    describe('Fluxos de Estado (getFlowState & isInOnboarding)', () => {
        it('deve reconhecer corretamente se está em onboarding (specialist_active)', () => {
            const estadoOnboarding = {
                projeto_id: '123',
                onboarding: {
                    phase: 'running',
                    specialistPhase: { status: 'active' }
                }
            };
            expect(isInOnboarding(estadoOnboarding as any)).toBe(true);
            const fs = getFlowState(estadoOnboarding as EstadoProjeto, '/test');
            expect(fs.currentPhase).toBe('specialist_active');
        });

        it('não deve marcar como onboarding se phase for completed sem specialistPhase', () => {
            const estadoDesenvolvimento = {
                projeto_id: '123',
                fase_atual: 2,
                total_fases: 10,
                gates_validados: [1],
                onboarding: {
                    phase: 'completed',
                    specialistPhase: null
                }
            };
            expect(isInOnboarding(estadoDesenvolvimento as any)).toBe(false);
            const fs = getFlowState(estadoDesenvolvimento as unknown as EstadoProjeto, '/test');
            expect(fs.currentPhase).toBe('fase_ativa');
        });
    });
});
