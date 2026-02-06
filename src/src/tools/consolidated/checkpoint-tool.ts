/**
 * Tool Consolidada: checkpoint
 * 
 * Unifica:
 * - create_checkpoint (criar checkpoint)
 * - rollback_total (rollback completo)
 * - rollback_partial (rollback parcial)
 * - list_checkpoints (listar checkpoints)
 * 
 * Aceita parâmetro 'acao' para determinar a operação.
 */

import type { ToolResult } from "../../types/index.js";
import {
    createCheckpoint,
    rollbackTotal,
    rollbackPartial,
    listCheckpoints,
} from "../fase1/checkpoint.tools.js";

interface CheckpointArgs {
    diretorio: string;
    estado_json?: string;
    acao?: "criar" | "rollback" | "rollback_parcial" | "listar";
    reason?: string;
    checkpointId?: string;
    modules?: string[];
    auto?: boolean;
}

/**
 * Tool: checkpoint
 * Entry point unificado para checkpoint/rollback.
 */
export async function checkpoint(args: CheckpointArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    const acao = args.acao || "listar";

    switch (acao) {
        case "criar":
            return createCheckpoint({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                reason: args.reason || "Checkpoint manual",
                auto: args.auto,
            } as any);

        case "rollback":
            if (!args.checkpointId) {
                return {
                    content: [{
                        type: "text",
                        text: "❌ **Erro**: `checkpointId` é obrigatório para rollback.",
                    }],
                    isError: true,
                };
            }
            return rollbackTotal({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                checkpointId: args.checkpointId,
            } as any);

        case "rollback_parcial":
            if (!args.checkpointId || !args.modules?.length) {
                return {
                    content: [{
                        type: "text",
                        text: "❌ **Erro**: `checkpointId` e `modules` são obrigatórios para rollback parcial.",
                    }],
                    isError: true,
                };
            }
            return rollbackPartial({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                checkpointId: args.checkpointId,
                modules: args.modules,
            } as any);

        case "listar":
        default:
            return listCheckpoints({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
            } as any);
    }
}

export const checkpointSchema = {
    type: "object",
    properties: {
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
        estado_json: {
            type: "string",
            description: "Estado do projeto (opcional — carrega automaticamente)",
        },
        acao: {
            type: "string",
            enum: ["criar", "rollback", "rollback_parcial", "listar"],
            description: "Ação a executar (padrão: listar)",
        },
        reason: {
            type: "string",
            description: "Motivo do checkpoint (para acao=criar)",
        },
        checkpointId: {
            type: "string",
            description: "ID do checkpoint (para rollback)",
        },
        modules: {
            type: "array",
            items: { type: "string" },
            description: "Módulos para rollback parcial",
        },
        auto: {
            type: "boolean",
            description: "Checkpoint automático (padrão: false)",
        },
    },
    required: ["diretorio"],
};
