/**
 * DeliverableGateService — Validação e scoring de entregáveis para gates (v9.0)
 *
 * Extraído de proximo.ts para modularização.
 * Responsabilidades:
 * - Executar ValidationPipeline
 * - Calcular score granular por keywords + sinônimos
 * - Construir resultado de gate com itens validados/pendentes
 *
 * @since v9.0 — extraído de proximo.ts
 */

import { expandKeywordsWithSynonyms } from "../utils/gate-synonyms.js";
import { calcularScoreContextual } from "./scoring-config.js";

export interface GateValidationInput {
    entregavel: string;
    faseNome: string;
    tier: string;
    gateChecklist: string[];
}

export interface GateValidationResult {
    qualityScore: number;
    gateResultado: {
        valido: boolean;
        itens_validados: string[];
        itens_pendentes: string[];
        sugestoes: string[];
    };
    estruturaResult: {
        valido: boolean;
        score: number;
        secoes_encontradas: string[];
        secoes_faltando: string[];
        tamanho_ok: boolean;
        feedback: string[];
    };
}

/**
 * Executa a validação completa de um entregável textual para gate de fase.
 * Retorna score granular, itens validados/pendentes e sugestões.
 */
export async function validateDeliverableForGate(
    input: GateValidationInput
): Promise<GateValidationResult> {
    const { entregavel, faseNome, tier, gateChecklist } = input;

    // Importar ValidationPipeline dinamicamente (evitar circular deps)
    const { ValidationPipeline } = await import("../core/validation/ValidationPipeline.js");
    const validationPipeline = new ValidationPipeline();

    const validationResult = await validationPipeline.validateDeliverable(
        entregavel,
        faseNome,
        tier as 'essencial' | 'base' | 'avancado',
        gateChecklist
    );

    // Extrair issues individuais
    const allIssues = validationResult.results.flatMap((r: any) => r.issues || []);
    const allSuggestions = validationResult.results.flatMap((r: any) => r.suggestions || []);

    // Construir itens granulares via keywords + sinônimos
    const itensValidadosGranular: string[] = [];
    const itensPendentesGranular: string[] = [];
    const contentLower = entregavel.toLowerCase();

    for (const item of gateChecklist) {
        const keywords = item.toLowerCase()
            .replace(/[^a-záàâãéèêíïóôõöúüçñ\s0-9/\-]/gi, '')
            .split(/\s+/)
            .filter((w: string) => w.length > 3);

        const expandedKeywords = expandKeywordsWithSynonyms(keywords);

        const matchedOriginal = keywords.filter((kw: string) => {
            if (contentLower.includes(kw)) return true;
            const syns = expandedKeywords.filter(s => s !== kw);
            return syns.some(syn => contentLower.includes(syn));
        });

        const matchRatio = keywords.length > 0 ? matchedOriginal.length / keywords.length : 1;
        const threshold = keywords.length <= 2 ? 0.5 : 0.4;

        if (matchRatio >= threshold) {
            itensValidadosGranular.push(`✅ ${item}`);
        } else {
            itensPendentesGranular.push(`❌ ${item}`);
        }
    }

    // Adicionar issues críticas não cobertas
    for (const issue of allIssues) {
        if (issue.severity === 'critical' || issue.severity === 'high') {
            const jaListado = itensPendentesGranular.some((p: string) => p.toLowerCase().includes(issue.type));
            if (!jaListado) {
                itensPendentesGranular.push(`❌ ${issue.message}`);
            }
        }
    }

    // Calcular scores
    const totalItens = itensValidadosGranular.length + itensPendentesGranular.length;
    const checklistScore = totalItens > 0
        ? (itensValidadosGranular.length / totalItens) * 100
        : 100;

    const tamanhoScore = entregavel.trim().length >= 600 ? 100 : 50;
    const scoreContextual = calcularScoreContextual(
        validationResult.overallScore,
        checklistScore,
        tamanhoScore,
        faseNome
    );
    const qualityScore = scoreContextual.score;

    console.log(`[deliverable-gate] Score granular — overallScore=${validationResult.overallScore}, checklistScore=${checklistScore.toFixed(0)}%, tamanhoScore=${tamanhoScore}, qualityScore=${qualityScore}, itens=${itensValidadosGranular.length}✅/${itensPendentesGranular.length}❌`);

    return {
        qualityScore,
        gateResultado: {
            valido: validationResult.passed && itensPendentesGranular.length === 0,
            itens_validados: itensValidadosGranular,
            itens_pendentes: itensPendentesGranular,
            sugestoes: [...allSuggestions, ...validationResult.recommendations],
        },
        estruturaResult: {
            valido: validationResult.passed,
            score: qualityScore,
            secoes_encontradas: itensValidadosGranular,
            secoes_faltando: itensPendentesGranular.map(p => p.replace(/^❌\s*/, '')),
            tamanho_ok: tamanhoScore === 100,
            feedback: [...validationResult.recommendations, ...allSuggestions],
        },
    };
}
