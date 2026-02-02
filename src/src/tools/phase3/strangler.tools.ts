import { StranglerOrchestrator } from '../../core/strangler/StranglerOrchestrator.js';

/**
 * MCP Tools para Strangler Fig (Fase 3 - Melhoria #27)
 */

const orchestrator = new StranglerOrchestrator();

export const stranglerTools = {
    plan_migration: {
        description: 'Planeja migração usando Strangler Fig Pattern',
        handler: async (args: { migration: any }) => {
            const planned = await orchestrator.planMigration(args.migration);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(planned, null, 2)
                }]
            };
        }
    },

    execute_migration_phase: {
        description: 'Executa fase de migração',
        handler: async (args: { migrationId: string; phaseId: string }) => {
            await orchestrator.executePhase(args.migrationId, args.phaseId);

            return {
                content: [{
                    type: 'text',
                    text: `Fase ${args.phaseId} executada com sucesso`
                }]
            };
        }
    },

    monitor_cutover: {
        description: 'Monitora métricas de cutover',
        handler: async (args: { migrationId: string }) => {
            const metrics = await orchestrator.monitorMetrics(args.migrationId);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(metrics, null, 2)
                }]
            };
        }
    }
};
