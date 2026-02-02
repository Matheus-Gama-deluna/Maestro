import { GrowthProjector } from '../../core/growth/GrowthProjector.js';

/**
 * MCP Tools para Projeção de Crescimento (Fase 3 - Melhoria #30)
 */

const projector = new GrowthProjector();

export const growthTools = {
    project_growth: {
        description: 'Projeta crescimento e capacidade',
        handler: async (args: { metric: string; current: number; period?: number }) => {
            const projection = await projector.projectGrowth(
                args.metric,
                args.current,
                args.period || 12
            );

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(projection, null, 2)
                }]
            };
        }
    },

    get_capacity_alerts: {
        description: 'Retorna alertas de capacidade',
        handler: async (args: { metric: string; current: number }) => {
            const projection = await projector.projectGrowth(args.metric, args.current);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(projection.alerts, null, 2)
                }]
            };
        }
    }
};
