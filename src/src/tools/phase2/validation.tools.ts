import { ValidationPipeline } from '../../core/validation/ValidationPipeline.js';

/**
 * MCP Tools para Validação (Fase 2 - Melhoria #10)
 */

const pipeline = new ValidationPipeline();

export const validationTools = {
    validate_pipeline: {
        description: 'Valida código através do pipeline completo de 5 camadas',
        handler: async (args: {
            code: string;
            tier?: 'essencial' | 'base' | 'avancado';
            projectPath?: string;
        }) => {
            const result = await pipeline.validate(
                args.code,
                args.tier || 'base',
                args.projectPath ? { projectPath: args.projectPath } : undefined
            );

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    },

    validate_layer: {
        description: 'Valida código em camada específica',
        handler: async (args: {
            code: string;
            layer: string;
            projectPath?: string;
        }) => {
            const result = await pipeline.validateLayer(
                args.code,
                args.layer,
                args.projectPath ? { projectPath: args.projectPath } : undefined
            );

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    },

    get_validation_report: {
        description: 'Retorna relatório completo de validação',
        handler: async (args: { validationId: string }) => {
            return {
                content: [{
                    type: 'text',
                    text: `Relatório de validação: ${args.validationId}`
                }]
            };
        }
    }
};
