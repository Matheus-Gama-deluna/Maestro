// src/src/tests/scoring-config.test.ts
import { describe, it, expect } from 'vitest';
import {
    getPhaseCategory,
    getScoreWeights,
    calcularScoreContextual,
    SCORE_WEIGHTS,
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
        const resultDoc = calcularScoreContextual(70, 80, 60, 'PRD');
        expect(resultDoc.score).toBeGreaterThan(0);
        expect(resultDoc.category).toBe('documento');

        const resultCode = calcularScoreContextual(70, 80, 60, 'Backend');
        expect(resultCode.category).toBe('codigo');
        expect(resultCode.weights.qualidade).toBe(0.60);
    });

    it('score 80+ aprova em qualquer categoria', () => {
        const result = calcularScoreContextual(85, 85, 85, 'Backend');
        expect(result.approved).toBe(true);
    });

    it('score baixo reprova em código mas pode aprovar em documento', () => {
        const scoreDoc = calcularScoreContextual(60, 70, 60, 'PRD');
        const scoreCode = calcularScoreContextual(60, 70, 60, 'Backend');
        expect(scoreCode.weights.threshold).toBeGreaterThan(scoreDoc.weights.threshold);
    });

    it('getScoreWeights retorna pesos corretos para cada categoria', () => {
        const docWeights = getScoreWeights('PRD');
        expect(docWeights.estrutura).toBe(0.20);
        expect(docWeights.checklist).toBe(0.40);
        expect(docWeights.qualidade).toBe(0.40);

        const codeWeights = getScoreWeights('Backend');
        expect(codeWeights.estrutura).toBe(0.10);
        expect(codeWeights.checklist).toBe(0.30);
        expect(codeWeights.qualidade).toBe(0.60);

        const designWeights = getScoreWeights('Arquitetura');
        expect(designWeights.estrutura).toBe(0.30);
    });

    it('soma dos pesos é sempre 1.0', () => {
        for (const [, weights] of Object.entries(SCORE_WEIGHTS)) {
            const soma = weights.estrutura + weights.checklist + weights.qualidade;
            expect(soma).toBeCloseTo(1.0, 5);
        }
    });

    it('score calculado fica entre 0 e 100', () => {
        const result = calcularScoreContextual(100, 100, 100, 'Backend');
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.score).toBeGreaterThanOrEqual(0);

        const resultZero = calcularScoreContextual(0, 0, 0, 'PRD');
        expect(resultZero.score).toBe(0);
    });
});
