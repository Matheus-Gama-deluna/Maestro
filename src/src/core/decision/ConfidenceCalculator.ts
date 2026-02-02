import type { Situation, Decision } from './types.js';

/**
 * Calculador de Confiança (Fase 2 - Melhoria #11)
 * 
 * Calcula confiança da IA baseado em:
 * - Histórico de operações similares
 * - Padrões conhecidos
 * - Novidade da operação
 * - Completude do contexto
 */
export class ConfidenceCalculator {
    private learningData: Map<string, number>;

    constructor() {
        this.learningData = new Map();
    }

    /**
     * Calcula confiança para uma situação
     */
    calculate(situation: Situation): number {
        let confidence = 0.5; // Base: 50%

        // Ajustes baseados em contexto
        if (situation.context.hasHistoricalMatch) {
            confidence += 0.2; // +20% se já fez algo similar
        }

        if (situation.context.matchesKnownPattern) {
            confidence += 0.15; // +15% se segue padrão conhecido
        }

        if (situation.context.isNovelOperation) {
            confidence -= 0.2; // -20% se é operação nova
        }

        if (!situation.context.hasFullContext) {
            confidence -= 0.15; // -15% se falta contexto
        }

        // Ajuste baseado em aprendizado prévio
        const learnedConfidence = this.learningData.get(situation.operation);
        if (learnedConfidence !== undefined) {
            confidence = (confidence + learnedConfidence) / 2; // Média
        }

        // Garantir range [0, 1]
        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Aprende com decisões do usuário
     */
    async learn(decision: Decision): Promise<void> {
        console.log('[ConfidenceCalculator] Aprendendo com decisão:', decision.operation);

        // Se usuário aprovou algo que IA marcou como baixa confiança,
        // aumentar confiança para próximas vezes
        if (decision.userOverride) {
            const currentConfidence = this.learningData.get(decision.operation) || 0.5;
            const newConfidence = Math.min(1, currentConfidence + 0.1);
            this.learningData.set(decision.operation, newConfidence);

            console.log(`[ConfidenceCalculator] Confiança ajustada: ${decision.operation} → ${(newConfidence * 100).toFixed(1)}%`);
        }

        // Salvar dados de aprendizado
        await this.saveLearningData();
    }

    /**
     * Extrai padrão de uma decisão
     */
    private extractPattern(decision: Decision): string {
        // Simplificado: usa o tipo de operação como padrão
        return decision.operation.split(':')[0];
    }

    /**
     * Salva dados de aprendizado
     */
    private async saveLearningData(): Promise<void> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');

            const dataDir = path.join(process.cwd(), '.maestro', 'decisions');
            await fs.mkdir(dataDir, { recursive: true });

            const filepath = path.join(dataDir, 'learning-data.json');
            const data = Object.fromEntries(this.learningData);

            await fs.writeFile(filepath, JSON.stringify(data, null, 2));
            console.log('[ConfidenceCalculator] Dados de aprendizado salvos');
        } catch (error) {
            console.error('[ConfidenceCalculator] Erro ao salvar dados:', error);
        }
    }

    /**
     * Carrega dados de aprendizado
     */
    async loadLearningData(): Promise<void> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');

            const filepath = path.join(process.cwd(), '.maestro', 'decisions', 'learning-data.json');
            const content = await fs.readFile(filepath, 'utf-8');
            const data = JSON.parse(content);

            this.learningData = new Map(Object.entries(data));
            console.log('[ConfidenceCalculator] Dados de aprendizado carregados');
        } catch (error) {
            // Arquivo não existe ainda, tudo bem
            console.log('[ConfidenceCalculator] Nenhum dado de aprendizado prévio encontrado');
        }
    }

    /**
     * Retorna estatísticas de aprendizado
     */
    getStats(): { totalPatterns: number; avgConfidence: number } {
        const values = Array.from(this.learningData.values());
        const avgConfidence = values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0.5;

        return {
            totalPatterns: this.learningData.size,
            avgConfidence
        };
    }
}
