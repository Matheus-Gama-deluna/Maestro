import { ConsistencyAnalyzer } from '../../core/consistency/ConsistencyAnalyzer.js';
import type { ConsistencyRequirements } from '../../core/consistency/types.js';

/**
 * MCP Tools para Consistência (Fase 3 - Melhoria #29)
 */

const analyzer = new ConsistencyAnalyzer();

export const consistencyTools = {
    analyze_consistency: {
        description: 'Analisa requisitos de consistência e seleciona modelo',
        handler: async (args: { requirements: ConsistencyRequirements }) => {
            const model = analyzer.analyzeRequirements(args.requirements);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(model, null, 2)
                }]
            };
        }
    }
};
