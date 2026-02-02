import { ContextDetector } from '../../core/context/ContextDetector.js';

/**
 * MCP Tools para Bounded Contexts (Fase 3 - Melhoria #28)
 */

const detector = new ContextDetector();

export const contextTools = {
    detect_contexts: {
        description: 'Detecta bounded contexts automaticamente',
        handler: async (args: { projectPath: string }) => {
            const contexts = await detector.detectContexts(args.projectPath);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(contexts, null, 2)
                }]
            };
        }
    },

    validate_context: {
        description: 'Valida bounded context',
        handler: async (args: { context: any }) => {
            const validation = detector.validateContext(args.context);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(validation, null, 2)
                }]
            };
        }
    }
};
