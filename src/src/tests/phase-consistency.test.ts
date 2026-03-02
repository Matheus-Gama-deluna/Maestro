/**
 * Testes de consistência das listas de fases técnicas (v9.0 Sprint 5)
 *
 * Garante que:
 * - CODE_PHASE_NAMES é a fonte única de verdade
 * - Nenhuma fase de documento está listada como código
 * - Todas as fases dos fluxos estão cobertas pelo PHASE_TYPE_MAP
 * - isCodePhaseName funciona corretamente
 */
import { describe, it, expect } from 'vitest';
import {
    CODE_PHASE_NAMES,
    isCodePhaseName,
    PHASE_TYPE_MAP,
    FLUXO_SIMPLES,
    FLUXO_MEDIO,
    FLUXO_COMPLEXO,
} from '../flows/types.js';

describe('Phase Consistency (v9.0)', () => {
    describe('CODE_PHASE_NAMES', () => {
        it('contém exatamente Frontend, Backend, Integração & Deploy, Integração, Deploy & Operação (v10)', () => {
            expect(CODE_PHASE_NAMES).toContain('Frontend');
            expect(CODE_PHASE_NAMES).toContain('Backend');
            expect(CODE_PHASE_NAMES).toContain('Integração & Deploy');
            expect(CODE_PHASE_NAMES).toContain('Integração');
            expect(CODE_PHASE_NAMES).toContain('Deploy & Operação');
            expect(CODE_PHASE_NAMES).toHaveLength(5);
        });

        it('NÃO contém fases de documento', () => {
            const documentPhases = [
                'Produto', 'Requisitos', 'UX Design', 'Modelo de Domínio',
                'Banco de Dados', 'Arquitetura', 'Segurança', 'Testes',
                'Performance', 'Observabilidade', 'Backlog', 'Contrato API',
                'Prototipagem', 'Arquitetura Avançada',
            ];
            for (const phase of documentPhases) {
                expect(CODE_PHASE_NAMES).not.toContain(phase);
            }
        });

        it('Testes é fase de DOCUMENTO, não de código', () => {
            expect(CODE_PHASE_NAMES).not.toContain('Testes');
        });

        it('Deploy & Operação é fase de código (v10)', () => {
            expect(CODE_PHASE_NAMES).toContain('Deploy & Operação');
            expect(CODE_PHASE_NAMES).not.toContain('Deploy Final');
        });
    });

    describe('isCodePhaseName', () => {
        it('retorna true para fases de código (v10)', () => {
            expect(isCodePhaseName('Frontend')).toBe(true);
            expect(isCodePhaseName('Backend')).toBe(true);
            expect(isCodePhaseName('Integração')).toBe(true);
            expect(isCodePhaseName('Integração & Deploy')).toBe(true);
            expect(isCodePhaseName('Deploy & Operação')).toBe(true);
        });

        it('retorna true para nomes parciais (includes)', () => {
            expect(isCodePhaseName('Desenvolvimento Frontend')).toBe(true);
            expect(isCodePhaseName('Backend API')).toBe(true);
        });

        it('retorna false para fases de documento', () => {
            expect(isCodePhaseName('Testes')).toBe(false);
            expect(isCodePhaseName('Produto')).toBe(false);
            expect(isCodePhaseName('Requisitos')).toBe(false);
            expect(isCodePhaseName('Arquitetura')).toBe(false);
            expect(isCodePhaseName('Segurança')).toBe(false);
            expect(isCodePhaseName('Performance')).toBe(false);
            expect(isCodePhaseName('Observabilidade')).toBe(false);
            expect(isCodePhaseName('Backlog')).toBe(false);
            expect(isCodePhaseName('Contrato API')).toBe(false);
        });

        it('retorna false para undefined e string vazia', () => {
            expect(isCodePhaseName(undefined)).toBe(false);
            expect(isCodePhaseName('')).toBe(false);
        });
    });

    describe('PHASE_TYPE_MAP', () => {
        it('tem entrada para cada fase dos 3 fluxos', () => {
            const allPhaseNames = new Set<string>();
            for (const fase of FLUXO_SIMPLES.fases) allPhaseNames.add(fase.nome);
            for (const fase of FLUXO_MEDIO.fases) allPhaseNames.add(fase.nome);
            for (const fase of FLUXO_COMPLEXO.fases) allPhaseNames.add(fase.nome);

            for (const nome of allPhaseNames) {
                expect(PHASE_TYPE_MAP).toHaveProperty(nome);
            }
        });

        it('fases de código são classificadas como technical', () => {
            for (const name of CODE_PHASE_NAMES) {
                expect(PHASE_TYPE_MAP[name]).toBe('technical');
            }
        });

        it('Produto é input_required', () => {
            expect(PHASE_TYPE_MAP['Produto']).toBe('input_required');
        });

        it('fases derivadas são derived (v10)', () => {
            expect(PHASE_TYPE_MAP['Requisitos']).toBe('derived');
            expect(PHASE_TYPE_MAP['Arquitetura']).toBe('derived');
            expect(PHASE_TYPE_MAP['Design']).toBe('derived');
            expect(PHASE_TYPE_MAP['Design Técnico']).toBe('derived');
            expect(PHASE_TYPE_MAP['Planejamento']).toBe('derived');
            // Fases removidas na v10
            expect(PHASE_TYPE_MAP['UX Design']).toBeUndefined();
            expect(PHASE_TYPE_MAP['Backlog']).toBeUndefined();
        });

        it('valores são apenas input_required, derived ou technical', () => {
            const validValues = ['input_required', 'derived', 'technical'];
            for (const value of Object.values(PHASE_TYPE_MAP)) {
                expect(validValues).toContain(value);
            }
        });
    });
});
