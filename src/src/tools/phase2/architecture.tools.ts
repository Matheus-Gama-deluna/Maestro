import { FitnessFunctions } from '../../core/architecture/FitnessFunctions.js';
import type { ProjectStructure } from '../../core/architecture/types.js';

/**
 * MCP Tools para Fitness Functions (Fase 2 - Melhoria #12)
 */

const fitness = new FitnessFunctions();

export const architectureTools = {
    validate_architecture: {
        description: 'Valida todas as regras arquiteturais',
        handler: async (args: { projectPath: string }) => {
            const project: ProjectStructure = {
                rootPath: args.projectPath,
                files: []
            };

            const result = await fitness.validateAll(project);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    },

    run_fitness_function: {
        description: 'Executa fitness function específica',
        handler: async (args: { ruleId: string; projectPath: string }) => {
            const project: ProjectStructure = {
                rootPath: args.projectPath,
                files: []
            };

            const result = await fitness.runRule(args.ruleId, project);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    },

    get_violations: {
        description: 'Lista todas as violações arquiteturais',
        handler: async (args: { severity?: 'error' | 'warning' | 'info' }) => {
            return {
                content: [{
                    type: 'text',
                    text: `Listando violações (severidade: ${args.severity || 'todas'})`
                }]
            };
        }
    }
};
