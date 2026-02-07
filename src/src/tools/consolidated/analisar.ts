/**
 * Tool Consolidada: analisar
 * 
 * Unifica:
 * - analisar_seguranca (vulnerabilidades OWASP)
 * - analisar_qualidade (qualidade de código)
 * - analisar_performance (anti-patterns)
 * - validate_dependencies (hallucinations)
 * - validate_security (OWASP Top 10)
 * - gerar_relatorio (relatório consolidado)
 * 
 * Aceita parâmetro 'tipo' para determinar análise.
 */

import type { ToolResult } from "../../types/index.js";
import { formatError } from "../../utils/response-formatter.js";
import { analisarSeguranca } from "../analise/seguranca.js";
import { analisarQualidade } from "../analise/qualidade.js";
import { analisarPerformance } from "../analise/performance.js";
import { gerarRelatorio } from "../analise/relatorio.js";
import { validateDependencies, validateSecurity } from "../fase1/validation.tools.js";

interface AnalisarArgs {
    diretorio: string;
    estado_json?: string;
    code?: string;
    tipo?: "seguranca" | "qualidade" | "performance" | "dependencias" | "completo";
    language?: "typescript" | "javascript" | "python";
}

/**
 * Tool: analisar
 * Entry point unificado para análises de código.
 */
export async function analisar(args: AnalisarArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: formatError("analisar", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    const tipo = args.tipo || "completo";

    switch (tipo) {
        case "seguranca":
            return analisarSeguranca({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                code: args.code || "",
            } as any);

        case "qualidade":
            return analisarQualidade({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                code: args.code || "",
            } as any);

        case "performance":
            return analisarPerformance({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                code: args.code || "",
            } as any);

        case "dependencias":
            return validateDependencies({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                code: args.code || "",
                language: args.language,
            } as any);

        case "completo":
        default:
            return gerarRelatorio({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
            } as any);
    }
}

export const analisarSchema = {
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
        code: {
            type: "string",
            description: "Código para analisar",
        },
        tipo: {
            type: "string",
            enum: ["seguranca", "qualidade", "performance", "dependencias", "completo"],
            description: "Tipo de análise (padrão: completo)",
        },
        language: {
            type: "string",
            enum: ["typescript", "javascript", "python"],
            description: "Linguagem do código (para tipo=dependencias)",
        },
    },
    required: ["diretorio"],
};
