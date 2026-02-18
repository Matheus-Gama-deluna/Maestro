/**
 * Middleware: withFlowEngine
 * 
 * v6.0 Sprint 4: FlowEngine FORÇADO (não sugestivo)
 * 
 * Após execução da tool, calcula next_action via flow engine
 * e SEMPRE sobrescreve, mesmo se a tool definiu um valor diferente.
 * 
 * Isso garante que o fluxo seja controlado centralmente pelo FlowEngine,
 * impedindo que tools individuais desviem do caminho correto.
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

            // v6.0: SEMPRE calcular e sobrescrever next_action (forçado)
            const nextStep = getNextStep(estado, diretorio);
            const commandedAction = flowStepToNextAction(nextStep);
            
            // Logar se a tool tentou definir um next_action diferente
            if (result.next_action && result.next_action.tool !== commandedAction.tool) {
                console.warn(
                    `[FlowEngine] Override detected: ` +
                    `tool wanted "${result.next_action.tool}", ` +
                    `flow commands "${commandedAction.tool}"`
                );
            }
            
            // SEMPRE sobrescrever (não é mais condicional)
            result.next_action = commandedAction;

            if (nextStep.specialist) {
                result.specialist_persona = result.specialist_persona || nextStep.specialist;
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
