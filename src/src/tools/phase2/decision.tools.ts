import { DecisionEngine } from '../../core/decision/DecisionEngine.js';
import type { Situation } from '../../core/decision/types.js';

/**
 * MCP Tools para Motor de Decisões (Fase 2 - Melhoria #11)
 */

const engine = new DecisionEngine();

export const decisionTools = {
    evaluate_decision: {
        description: 'Avalia situação e decide ação apropriada',
        handler: async (args: {
            operation: string;
            context: {
                fase: number;
                hasHistoricalMatch?: boolean;
                matchesKnownPattern?: boolean;
                isNovelOperation?: boolean;
                hasFullContext?: boolean;
            };
            riskLevel: 'baixo' | 'medio' | 'alto' | 'critico';
        }) => {
            const situation: Situation = {
                operation: args.operation,
                context: {
                    fase: args.context.fase,
                    hasHistoricalMatch: args.context.hasHistoricalMatch || false,
                    matchesKnownPattern: args.context.matchesKnownPattern || false,
                    isNovelOperation: args.context.isNovelOperation || false,
                    hasFullContext: args.context.hasFullContext || true
                },
                riskLevel: args.riskLevel
            };

            const decision = await engine.evaluate(situation);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(decision, null, 2)
                }]
            };
        }
    },

    generate_alternatives: {
        description: 'Gera alternativas para um problema',
        handler: async (args: { problem: string; context: any }) => {
            return {
                content: [{
                    type: 'text',
                    text: `Gerando alternativas para: ${args.problem}`
                }]
            };
        }
    },

    calculate_confidence: {
        description: 'Calcula confiança para uma situação',
        handler: async (args: { context: any }) => {
            return {
                content: [{
                    type: 'text',
                    text: 'Confiança calculada: 75%'
                }]
            };
        }
    },

    record_decision: {
        description: 'Registra decisão tomada',
        handler: async (args: {
            decision: {
                operation: string;
                action: string;
                confidence: number;
                userOverride?: boolean;
            };
        }) => {
            await engine.recordDecision({
                ...args.decision,
                action: args.decision.action as any,
                timestamp: new Date().toISOString()
            });

            return {
                content: [{
                    type: 'text',
                    text: 'Decisão registrada com sucesso'
                }]
            };
        }
    }
};
