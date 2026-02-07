/**
 * Fallback de Elicitation para clients que não suportam o primitivo nativo.
 * 
 * Quando o client MCP não suporta `elicitation`, gera blocos de texto
 * estruturado que pedem input do usuário de forma clara para a IA.
 * 
 * @since v5.1.0 — Task 3.1 do Roadmap de Melhorias MCP
 */

import { clientSupports } from "./client-capabilities.service.js";

export interface ElicitationField {
    name: string;
    label: string;
    type: "text" | "select" | "boolean" | "number";
    options?: string[];
    default?: string;
    required?: boolean;
    description?: string;
}

export interface ElicitationRequest {
    title: string;
    description: string;
    fields: ElicitationField[];
}

/**
 * Gera bloco de elicitation.
 * Se o client suporta elicitation nativa, retorna formato MCP.
 * Senão, retorna Markdown estruturado para a IA interpretar.
 */
export function buildElicitation(request: ElicitationRequest): {
    useNative: boolean;
    nativePayload?: Record<string, unknown>;
    markdownFallback: string;
} {
    const useNative = clientSupports("hasElicitation");

    if (useNative) {
        return {
            useNative: true,
            nativePayload: {
                message: request.description,
                requestedSchema: {
                    type: "object",
                    properties: Object.fromEntries(
                        request.fields.map(f => [f.name, {
                            type: f.type === "select" ? "string" : f.type === "boolean" ? "boolean" : f.type === "number" ? "number" : "string",
                            description: f.label,
                            ...(f.options ? { enum: f.options } : {}),
                            ...(f.default ? { default: f.default } : {}),
                        }])
                    ),
                    required: request.fields.filter(f => f.required).map(f => f.name),
                },
            },
            markdownFallback: "",
        };
    }

    // Fallback: Markdown estruturado
    let md = `## ❓ ${request.title}\n\n${request.description}\n\n`;
    md += `**Responda os campos abaixo:**\n\n`;

    for (const field of request.fields) {
        const required = field.required ? " *(obrigatório)*" : " *(opcional)*";

        switch (field.type) {
            case "select":
                md += `### ${field.label}${required}\n`;
                md += `Opções: ${field.options?.map(o => `\`${o}\``).join(" | ") || "N/A"}\n`;
                if (field.default) md += `Padrão: \`${field.default}\`\n`;
                md += `\n`;
                break;
            case "boolean":
                md += `### ${field.label}${required}\n`;
                md += `Responda: \`sim\` ou \`não\`\n`;
                if (field.default) md += `Padrão: \`${field.default}\`\n`;
                md += `\n`;
                break;
            case "number":
                md += `### ${field.label}${required}\n`;
                md += `Informe um número.\n`;
                if (field.default) md += `Padrão: \`${field.default}\`\n`;
                md += `\n`;
                break;
            default:
                md += `### ${field.label}${required}\n`;
                if (field.description) md += `${field.description}\n`;
                if (field.default) md += `Padrão: \`${field.default}\`\n`;
                md += `\n`;
        }
    }

    md += `> 👤 **Aguardando resposta do usuário.** A IA deve apresentar estas perguntas ao usuário e coletar as respostas antes de prosseguir.\n`;

    return {
        useNative: false,
        markdownFallback: md,
    };
}

/**
 * Gera bloco de discovery (perguntas para o usuário) como fallback de elicitation.
 */
export function buildDiscoveryFallback(questions: string[]): string {
    let md = `## 🔍 Discovery — Perguntas para o Usuário\n\n`;
    md += `Antes de prosseguir, responda:\n\n`;
    questions.forEach((q, i) => {
        md += `${i + 1}. ${q}\n`;
    });
    md += `\n> 👤 **Aguardando respostas.** Passe as respostas no campo \`respostas\` da próxima chamada.\n`;
    return md;
}
