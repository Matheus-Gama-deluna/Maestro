/**
 * Tool Consolidada: validar
 * 
 * Unifica:
 * - validar_gate (validar checklist de saída)
 * - avaliar_entregavel (avaliar qualidade)
 * - check_compliance (verificar compliance)
 * 
 * Detecta tipo de validação automaticamente ou aceita parâmetro explícito.
 */

import type { ToolResult } from "../../types/index.js";
import { formatError } from "../../utils/response-formatter.js";
import { validarGate } from "../validar-gate.js";
import { avaliarEntregavel } from "../avaliar-entregavel.js";
import { checkCompliance } from "../fase1/validation.tools.js";

interface ValidarArgs {
    diretorio: string;
    estado_json?: string;
    entregavel?: string;
    tipo?: "gate" | "entregavel" | "compliance";
    fase?: number;
    standard?: "LGPD" | "PCI-DSS" | "HIPAA";
    code?: string;
}

/**
 * Tool: validar
 * Entry point unificado para validações.
 */
export async function validar(args: ValidarArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: formatError("validar", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    // Auto-detectar tipo se não fornecido
    const tipo = args.tipo || autoDetectTipo(args);

    switch (tipo) {
        case "gate":
            return validarGate({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                entregavel: args.entregavel,
                fase: args.fase,
            } as any);

        case "entregavel":
            return avaliarEntregavel({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                entregavel: args.entregavel || "",
            } as any);

        case "compliance":
            return checkCompliance({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                code: args.code || args.entregavel || "",
                standard: args.standard || "LGPD",
            } as any);

        default:
            // Fallback: validar gate
            return validarGate({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                entregavel: args.entregavel,
                fase: args.fase,
            } as any);
    }
}

function autoDetectTipo(args: ValidarArgs): "gate" | "entregavel" | "compliance" {
    if (args.standard || args.code) return "compliance";
    if (args.entregavel && !args.estado_json) return "entregavel";
    return "gate";
}

export const validarSchema = {
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
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável para validar",
        },
        tipo: {
            type: "string",
            enum: ["gate", "entregavel", "compliance"],
            description: "Tipo de validação (auto-detectado se omitido)",
        },
        fase: {
            type: "number",
            description: "Número da fase para validar gate (opcional, usa fase atual)",
        },
        standard: {
            type: "string",
            enum: ["LGPD", "PCI-DSS", "HIPAA"],
            description: "Padrão de compliance (apenas para tipo=compliance)",
        },
        code: {
            type: "string",
            description: "Código para verificar compliance",
        },
    },
    required: ["diretorio"],
};
