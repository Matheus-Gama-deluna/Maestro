/**
 * Pipeline Unificada de Orquestração v6.3
 *
 * Ordem fixa de execução:
 * 1. Error Handling     — captura erros e formata resposta
 * 2. State Load         — auto-carrega estado se não fornecido
 * 3. [Handler executa]  — tool original
 * 4. Persistence        — salva estado ANTES do FlowEngine
 * 5. ADR Generation     — extrai decisões de fases arquiteturais (best-effort)
 * 6. Flow Engine        — calcula next_action com estado já persistido (FORÇADO)
 * 7. Skill Inject       — injeta contexto do especialista (OBRIGATÓRIA)
 * 8. Prompt Validation  — valida uso correto das tools na resposta
 *
 * @since v6.0 — Sprint 1 do Roadmap de Orquestração
 * @since v6.1 — Correção 3: Persistence antes de FlowEngine + Sprint 6: ADR Generation
 * @since v6.2 — Sprint 2: withPromptValidation integrado
 * @since v6.3 — S1.1: Corrigido withPromptValidation (era no-op — expectedTool não era passado)
 */

import { withErrorHandling } from "../errors/index.js";
import { withStateLoad } from "./state-loader.middleware.js";
import { withFlowEngine } from "./flow-engine.middleware.js";
import { withSkillInjection } from "./skill-injection.middleware.js";
import { withPersistence } from "./persistence.middleware.js";
import { withADRGeneration } from "./adr-generation.middleware.js";
import { withPromptValidation } from "./validation.middleware.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

/**
 * Aplica pipeline completo e unificado de middlewares a um handler de tool.
 *
 * Esta é a ÚNICA função que deve ser usada para wrappear tools públicas.
 * Garante que todos os middlewares críticos sejam aplicados em ordem consistente.
 *
 * @param toolName - Nome da tool (para logs e error handling)
 * @param handler - Handler original da tool
 * @returns Handler wrapped com todos os middlewares
 */
export function applyOrchestrationPipeline(
    toolName: string,
    handler: ToolHandler
): ToolHandler {
    console.log(`[OrchestrationPipeline] Registering tool: ${toolName}`);

    // v6.3: Persistence → ADR → FlowEngine → Skill → PromptValidation
    // CORREÇÃO S1.1: withPromptValidation(toolName, toolName) — segundo argumento é expectedTool.
    // Sem ele, o middleware verificava `if (!expectedTool) return result` e nunca validava nada.
    return withErrorHandling(
        toolName,
        withStateLoad(
            withPersistence(
                withADRGeneration(
                    withFlowEngine(
                        withSkillInjection(
                            withPromptValidation(toolName, toolName)(handler)
                        )
                    )
                )
            )
        )
    );
}

/**
 * Variante leve da pipeline (DEPRECATED — usar applyOrchestrationPipeline)
 * 
 * Mantida apenas para compatibilidade temporária com código legado.
 * Será removida na v7.0.
 * 
 * @deprecated Use applyOrchestrationPipeline instead
 */
export function applyLightOrchestrationPipeline(
    toolName: string,
    handler: ToolHandler
): ToolHandler {
    console.warn(
        `[OrchestrationPipeline] DEPRECATED: applyLightOrchestrationPipeline used for ${toolName}. ` +
        `Use applyOrchestrationPipeline instead.`
    );
    
    // Mesmo comportamento — não há mais "light" vs "full"
    return applyOrchestrationPipeline(toolName, handler);
}
