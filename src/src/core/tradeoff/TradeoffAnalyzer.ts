/**
 * Tradeoff Analyzer (Fase 2 - Melhoria #17)
 * Analisa trade-offs entre alternativas
 */
export class TradeoffAnalyzer {
    async analyze(alternatives: Alternative[]): Promise<TradeoffAnalysis> {
        console.log('[TradeoffAnalyzer] Analisando trade-offs de', alternatives.length, 'alternativas');

        const scored = alternatives.map(alt => ({
            ...alt,
            finalScore: this.calculateScore(alt)
        }));

        const sorted = scored.sort((a, b) => b.finalScore - a.finalScore);
        const recommendation = sorted[0];

        return {
            alternatives: sorted,
            recommendation,
            reasoning: this.generateReasoning(sorted)
        };
    }

    private calculateScore(alternative: Alternative): number {
        let score = alternative.baseScore || 0.5;

        // Ajustar por prós e contras
        score += alternative.pros.length * 0.05;
        score -= alternative.cons.length * 0.05;

        // Ajustar por risco
        const riskPenalty = {
            baixo: 0,
            medio: -0.1,
            alto: -0.2,
            critico: -0.3
        };
        score += riskPenalty[alternative.risk as keyof typeof riskPenalty] || 0;

        return Math.max(0, Math.min(1, score));
    }

    private generateReasoning(alternatives: Alternative[]): string {
        const best = alternatives[0];
        const reasons: string[] = [];

        reasons.push(`Melhor alternativa: ${best.name}`);
        reasons.push(`Score: ${((best.finalScore || 0) * 100).toFixed(1)}%`);
        reasons.push('');
        reasons.push('Principais vantagens:');
        best.pros.slice(0, 3).forEach(pro => reasons.push(`  ✓ ${pro}`));
        
        if (best.cons.length > 0) {
            reasons.push('');
            reasons.push('Pontos de atenção:');
            best.cons.slice(0, 2).forEach(con => reasons.push(`  ⚠ ${con}`));
        }

        return reasons.join('\n');
    }
}

export interface Alternative {
    name: string;
    description: string;
    baseScore?: number;
    pros: string[];
    cons: string[];
    risk: string;
    finalScore?: number;
}

export interface TradeoffAnalysis {
    alternatives: Alternative[];
    recommendation: Alternative;
    reasoning: string;
}
