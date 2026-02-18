/**
 * Middleware Pipeline do Maestro v6
 * 
 * v6.0: Pipeline Unificada — TODAS as tools usam applyOrchestrationPipeline
 * Ordem fixa: Error → State → Flow → Persistence → Skill
 * 
 * DEPRECATED: applyMiddlewares, applySmartMiddlewares, applyLightMiddlewares, applyPersistenceMiddlewares
 * Serão removidos na v7.0
 */

// v6.0: Pipeline Unificada (RECOMENDADO)
export { applyOrchestrationPipeline, applyLightOrchestrationPipeline } from "./orchestration-pipeline.middleware.js";

// Middlewares individuais (para uso avançado)
export { withStateLoad } from "./state-loader.middleware.js";
export { withPersistence } from "./persistence.middleware.js";
export { withFlowEngine } from "./flow-engine.middleware.js";
export { withSkillInjection } from "./skill-injection.middleware.js";
export { withPromptValidation, defaultValidations } from "./validation.middleware.js";

import { withStateLoad } from "./state-loader.middleware.js";
import { withPersistence } from "./persistence.middleware.js";
import { withFlowEngine } from "./flow-engine.middleware.js";
import { withSkillInjection } from "./skill-injection.middleware.js";
import { withErrorHandling } from "../errors/index.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

/**
 * Aplica pipeline completo de middlewares a um handler de tool.
 * 
 * Ordem de execução (de fora para dentro):
 * 1. withErrorHandling — captura erros e formata resposta
 * 2. withStateLoad — auto-carrega estado se estado_json não fornecido
 * 3. withFlowEngine — calcula next_action via flow engine
 * 4. withPersistence — salva estado e files automaticamente
 * 5. withSkillInjection — injeta contexto de skill na resposta
 * 
 * O handler original executa no centro do pipeline.
 */
/**
 * @deprecated v6.0 — Use applyOrchestrationPipeline instead
 * Será removido na v7.0
 */
export function applyMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    console.warn(`[Middleware] DEPRECATED: applyMiddlewares used for ${toolName}. Use applyOrchestrationPipeline.`);
    return withErrorHandling(
        toolName,
        withStateLoad(
            withFlowEngine(
                withPersistence(
                    withSkillInjection(handler)
                )
            )
        )
    );
}

/**
 * @deprecated v6.0 — Use applyOrchestrationPipeline instead
 * Será removido na v7.0
 */
export function applyLightMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    console.warn(`[Middleware] DEPRECATED: applyLightMiddlewares used for ${toolName}. Use applyOrchestrationPipeline.`);
    return withErrorHandling(
        toolName,
        withStateLoad(handler)
    );
}

/**
 * @deprecated v6.0 — Use applyOrchestrationPipeline instead
 * Será removido na v7.0
 */
export function applySmartMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    console.warn(`[Middleware] DEPRECATED: applySmartMiddlewares used for ${toolName}. Use applyOrchestrationPipeline.`);
    return withErrorHandling(
        toolName,
        withStateLoad(
            withSkillInjection(handler)
        )
    );
}

/**
 * @deprecated v6.0 — Use applyOrchestrationPipeline instead
 * Será removido na v7.0
 */
export function applyPersistenceMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    console.warn(`[Middleware] DEPRECATED: applyPersistenceMiddlewares used for ${toolName}. Use applyOrchestrationPipeline.`);
    return withErrorHandling(
        toolName,
        withStateLoad(
            withPersistence(handler)
        )
    );
}
