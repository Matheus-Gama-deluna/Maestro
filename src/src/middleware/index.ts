/**
 * Middleware Pipeline do Maestro v5
 * 
 * Composição de middlewares para tools:
 * withErrorHandling → withStateLoad → withFlowEngine → withPersistence → withSkillInjection
 */

export { withStateLoad } from "./state-loader.middleware.js";
export { withPersistence } from "./persistence.middleware.js";
export { withFlowEngine } from "./flow-engine.middleware.js";
export { withSkillInjection } from "./skill-injection.middleware.js";

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
export function applyMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
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
 * Aplica apenas middlewares leves (sem skill injection e sem persistence).
 * Útil para tools que já fazem injeção ativa internamente (proximo, maestro).
 */
export function applyLightMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    return withErrorHandling(
        toolName,
        withStateLoad(handler)
    );
}

/**
 * Aplica middlewares inteligentes: estado + skill injection condicional.
 * v5.1: Injeta skill apenas quando o projeto está em fase de desenvolvimento (não onboarding).
 * Substitui applyLightMiddlewares para tools que se beneficiam de skill injection.
 */
export function applySmartMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    return withErrorHandling(
        toolName,
        withStateLoad(
            withSkillInjection(handler)
        )
    );
}

/**
 * Aplica middlewares de persistência e estado (sem skill injection).
 * Útil para tools que não precisam de injeção de skills mas precisam de persistência.
 */
export function applyPersistenceMiddlewares(toolName: string, handler: ToolHandler): ToolHandler {
    return withErrorHandling(
        toolName,
        withStateLoad(
            withPersistence(handler)
        )
    );
}
