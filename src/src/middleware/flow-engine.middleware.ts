/**
 * Middleware: withFlowEngine
 * 
 * Após execução da tool, calcula next_action via flow engine
 * de forma consistente, substituindo lógica local duplicada nas tools.
 * 
 * Se a tool já retornou next_action, o middleware NÃO sobrescreve
 * (permite que tools específicas tenham controle granular).
 */

import { parsearEstado } from "../state/storage.js";
import { getNextStep, getFlowProgress, flowStepToNextAction } from "../services/flow-engine.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export function withFlowEngine(handler: ToolHandler): ToolHandler {
    return async (args: Record<string, unknown>) => {
        const result = await handler(args);

        // Se deu erro, não calcular next_action
        if (result.isError) {
            return result;
        }

        const diretorio = args.diretorio as string | undefined;
        if (!diretorio) {
            return result;
        }

        // Usar estado atualizado da resposta, ou o estado de entrada
        const estadoJson = result.estado_atualizado || (args.estado_json as string | undefined);
        if (!estadoJson) {
            return result;
        }

        try {
            const estado = parsearEstado(estadoJson);
            if (!estado) return result;

            // Calcular next_action via flow engine (se a tool não definiu um)
            if (!result.next_action) {
                const nextStep = getNextStep(estado, diretorio);
                result.next_action = flowStepToNextAction(nextStep);

                if (nextStep.specialist) {
                    result.specialist_persona = result.specialist_persona || nextStep.specialist;
                }
            }

            // Sempre atualizar progress (é barato e útil)
            if (!result.progress) {
                result.progress = getFlowProgress(estado);
            }
        } catch (error) {
            console.warn("[withFlowEngine] Falha ao calcular next_action:", error);
        }

        return result;
    };
}
