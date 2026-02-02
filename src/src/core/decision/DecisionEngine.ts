import { DecisionMatrix } from './DecisionMatrix.js';
import { ConfidenceCalculator } from './ConfidenceCalculator.js';
import { AlternativeGenerator } from './AlternativeGenerator.js';
import type { Situation, ActionDecision, Decision, ActionType, RiskLevel } from './types.js';

/**
 * Motor de Decisões (Fase 2 - Melhoria #11)
 * 
 * Autonomia calibrada com matriz Risco x Confiança
 * Decide quando executar automaticamente, sugerir ou requerer aprovação
 */
export class DecisionEngine {
    private matrix: DecisionMatrix;
    private confidenceCalculator: ConfidenceCalculator;
    private alternativeGenerator: AlternativeGenerator;

    constructor() {
        this.matrix = new DecisionMatrix();
        this.confidenceCalculator = new ConfidenceCalculator();
        this.alternativeGenerator = new AlternativeGenerator();
    }

    /**
     * Avalia situação e decide ação apropriada
     */
    async evaluate(situation: Situation): Promise<ActionDecision> {
        console.log('[DecisionEngine] Avaliando situação:', situation.operation);

        // 1. Calcular confiança
        const confidence = await this.confidenceCalculator.calculate(situation);
        console.log(`[DecisionEngine] Confiança calculada: ${(confidence * 100).toFixed(1)}%`);

        // 2. Consultar matriz de decisão
        const action = this.matrix.getAction(situation.riskLevel, confidence);
        console.log(`[DecisionEngine] Ação determinada: ${action}`);

        // 3. Gerar alternativas se necessário
        const alternatives = ['suggest_approve', 'require_approval'].includes(action)
            ? await this.alternativeGenerator.generate(situation)
            : undefined;

        // 4. Gerar raciocínio
        const reasoning = this.generateReasoning(situation, confidence, action);

        return {
            action,
            confidence,
            reasoning,
            alternatives,
            requiresApproval: this.requiresApproval(action)
        };
    }

    /**
     * Registra decisão tomada para aprendizado
     */
    async recordDecision(decision: Decision): Promise<void> {
        console.log('[DecisionEngine] Registrando decisão:', decision.operation);

        // Salvar no histórico
        await this.saveDecisionHistory(decision);

        // Aprender com decisões do usuário
        if (decision.userOverride) {
            console.log('[DecisionEngine] Aprendendo com override do usuário');
            await this.confidenceCalculator.learn(decision);
        }
    }

    /**
     * Gera raciocínio explicando a decisão
     */
    private generateReasoning(
        situation: Situation,
        confidence: number,
        action: ActionType
    ): string {
        const parts: string[] = [];

        // Contexto
        parts.push(`Operação: ${situation.operation}`);
        parts.push(`Risco: ${situation.riskLevel}`);
        parts.push(`Confiança: ${(confidence * 100).toFixed(1)}%`);

        // Fatores de confiança
        if (situation.context.hasHistoricalMatch) {
            parts.push('✓ Operação similar já executada com sucesso');
        }
        if (situation.context.matchesKnownPattern) {
            parts.push('✓ Segue padrão conhecido');
        }
        if (situation.context.isNovelOperation) {
            parts.push('⚠ Operação nova, sem histórico');
        }
        if (!situation.context.hasFullContext) {
            parts.push('⚠ Contexto incompleto');
        }

        // Decisão
        parts.push('');
        parts.push(`Decisão: ${this.getActionDescription(action)}`);

        return parts.join('\n');
    }

    /**
     * Verifica se ação requer aprovação
     */
    private requiresApproval(action: ActionType): boolean {
        return ['suggest_approve', 'require_approval', 'human_only'].includes(action);
    }

    /**
     * Descrição da ação
     */
    private getActionDescription(action: ActionType): string {
        const descriptions: Record<ActionType, string> = {
            auto_execute: '🤖 Executar automaticamente (risco baixo, confiança alta)',
            execute_notify: '🤖 Executar e notificar (risco moderado, confiança alta)',
            suggest_approve: '💡 Sugerir e aguardar aprovação (confiança média)',
            require_approval: '✋ Requer aprovação explícita (risco alto ou confiança baixa)',
            human_only: '👤 Apenas humano pode decidir (risco crítico)'
        };

        return descriptions[action];
    }

    /**
     * Salva decisão no histórico
     */
    private async saveDecisionHistory(decision: Decision): Promise<void> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');

            const historyDir = path.join(process.cwd(), '.maestro', 'decisions', 'history');
            await fs.mkdir(historyDir, { recursive: true });

            const filename = `decision-${Date.now()}.json`;
            const filepath = path.join(historyDir, filename);

            await fs.writeFile(filepath, JSON.stringify(decision, null, 2));
            console.log(`[DecisionEngine] Decisão salva: ${filepath}`);
        } catch (error) {
            console.error('[DecisionEngine] Erro ao salvar decisão:', error);
        }
    }

    /**
     * Retorna histórico de decisões
     */
    async getHistory(limit: number = 10): Promise<Decision[]> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');

            const historyDir = path.join(process.cwd(), '.maestro', 'decisions', 'history');
            const files = await fs.readdir(historyDir);

            const decisions: Decision[] = [];
            for (const file of files.slice(-limit)) {
                const filepath = path.join(historyDir, file);
                const content = await fs.readFile(filepath, 'utf-8');
                decisions.push(JSON.parse(content));
            }

            return decisions.reverse();
        } catch (error) {
            console.error('[DecisionEngine] Erro ao ler histórico:', error);
            return [];
        }
    }
}
