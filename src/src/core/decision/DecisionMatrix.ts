import type { RiskLevel, ActionType } from './types.js';

/**
 * Matriz de Decisão Risco x Confiança (Fase 2 - Melhoria #11)
 * 
 * Define ações baseadas em:
 * - Nível de risco da operação
 * - Confiança da IA na decisão
 */
export class DecisionMatrix {
    private matrix: Record<RiskLevel, Record<string, ActionType>>;

    constructor() {
        this.matrix = {
            baixo: {
                alta: 'auto_execute',      // Confiança alta, risco baixo → Executa
                media: 'execute_notify',   // Confiança média, risco baixo → Executa e notifica
                baixa: 'suggest_approve'   // Confiança baixa, risco baixo → Sugere
            },
            medio: {
                alta: 'execute_notify',    // Confiança alta, risco médio → Executa e notifica
                media: 'suggest_approve',  // Confiança média, risco médio → Sugere
                baixa: 'require_approval'  // Confiança baixa, risco médio → Requer aprovação
            },
            alto: {
                alta: 'suggest_approve',   // Confiança alta, risco alto → Sugere
                media: 'require_approval', // Confiança média, risco alto → Requer aprovação
                baixa: 'human_only'        // Confiança baixa, risco alto → Apenas humano
            },
            critico: {
                alta: 'require_approval',  // Confiança alta, risco crítico → Requer aprovação
                media: 'human_only',       // Confiança média, risco crítico → Apenas humano
                baixa: 'human_only'        // Confiança baixa, risco crítico → Apenas humano
            }
        };
    }

    /**
     * Retorna ação apropriada baseada em risco e confiança
     */
    getAction(riskLevel: RiskLevel, confidence: number): ActionType {
        const confidenceLevel = this.getConfidenceLevel(confidence);
        return this.matrix[riskLevel][confidenceLevel];
    }

    /**
     * Converte score numérico em nível de confiança
     */
    private getConfidenceLevel(confidence: number): string {
        if (confidence >= 0.7) return 'alta';
        if (confidence >= 0.4) return 'media';
        return 'baixa';
    }

    /**
     * Retorna matriz completa (para debug/visualização)
     */
    getMatrix(): Record<RiskLevel, Record<string, ActionType>> {
        return this.matrix;
    }

    /**
     * Atualiza threshold de confiança (para calibração)
     */
    updateThresholds(highThreshold: number, mediumThreshold: number): void {
        // Permite ajustar os thresholds dinamicamente
        // Por exemplo, se usuário quer IA mais conservadora, aumentar thresholds
        console.log(`[DecisionMatrix] Thresholds atualizados: alta=${highThreshold}, média=${mediumThreshold}`);
    }
}
