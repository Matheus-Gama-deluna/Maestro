import { RoadmapManager } from '../../core/roadmap/RoadmapManager.js';
import type { Phase, Milestone } from '../../core/roadmap/types.js';

/**
 * MCP Tools para Roadmap (Fase 3 - Melhoria #26)
 */

const manager = new RoadmapManager();

export const roadmapTools = {
    create_roadmap: {
        description: 'Cria roadmap arquitetural',
        handler: async (args: { name: string; phases: Phase[]; milestones: Milestone[] }) => {
            const roadmap = await manager.createRoadmap(args.name, args.phases, args.milestones);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(roadmap, null, 2)
                }]
            };
        }
    },

    update_milestone: {
        description: 'Atualiza status de milestone',
        handler: async (args: { roadmapId: string; milestoneId: string; updates: Partial<Milestone> }) => {
            await manager.updateMilestone(args.roadmapId, args.milestoneId, args.updates);

            return {
                content: [{
                    type: 'text',
                    text: `Milestone ${args.milestoneId} atualizado com sucesso`
                }]
            };
        }
    },

    get_roadmap_progress: {
        description: 'Retorna progresso do roadmap',
        handler: async (args: { roadmapId: string }) => {
            const progress = manager.getProgress(args.roadmapId);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(progress, null, 2)
                }]
            };
        }
    }
};
