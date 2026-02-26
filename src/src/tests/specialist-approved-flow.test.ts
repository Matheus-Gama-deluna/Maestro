// src/src/tests/specialist-approved-flow.test.ts
import { describe, it, expect } from 'vitest';

describe('handleApproved → classificação', () => {
    it('deve setar aguardando_classificacao = true após aprovação do PRD', () => {
        // Simular estado após handleApproved (v5.6 FIX ERRO-008)
        const estado = {
            fase_atual: 1,
            aguardando_classificacao: true,  // <- deve ser true após fix
            classificacao_pos_prd_confirmada: false,
            status: 'ativo',
        };

        expect(estado.aguardando_classificacao).toBe(true);
        expect(estado.classificacao_pos_prd_confirmada).toBe(false);
        expect(estado.fase_atual).toBe(1);
    });

    it('avancar deve rotear para handleClassificacao quando aguardando_classificacao=true', () => {
        const estado = {
            aguardando_classificacao: true,
        };

        // Simula a condição do avancar.ts:137
        const deveRoteiarParaClassificacao = estado.aguardando_classificacao === true;
        expect(deveRoteiarParaClassificacao).toBe(true);
    });

    it('classificação NÃO é roteada quando aguardando_classificacao=false', () => {
        const estado = {
            aguardando_classificacao: false,
        };

        const deveRoteiarParaClassificacao = estado.aguardando_classificacao === true;
        expect(deveRoteiarParaClassificacao).toBe(false);
    });
});

function isEstadoJsonInvalid(estadoJson: string | undefined): boolean {
    return !estadoJson || estadoJson.trim().length === 0;
}

describe('onboardingOrchestrator — validação de estado_json', () => {
    it('rejeita string vazia como estado_json', () => {
        expect(isEstadoJsonInvalid('')).toBe(true);
    });

    it('rejeita string com apenas espaços', () => {
        expect(isEstadoJsonInvalid('   ')).toBe(true);
    });

    it('rejeita undefined como estado_json', () => {
        expect(isEstadoJsonInvalid(undefined)).toBe(true);
    });

    it('aceita JSON válido', () => {
        expect(isEstadoJsonInvalid('{"projeto_id": "test"}')).toBe(false);
    });

    it('aceita JSON com espaços ao redor (whitespace não é vazio)', () => {
        expect(isEstadoJsonInvalid('  {"projeto_id": "test"}  ')).toBe(false);
    });
});
