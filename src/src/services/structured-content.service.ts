/**
 * Structured Content com fallback para clients que não suportam o primitivo nativo.
 * 
 * MCP structuredContent (protocol ≥ 2025-06-18) permite retornar JSON tipado
 * junto com content textual. Para clients mais antigos, embute o JSON como
 * bloco de código dentro do Markdown.
 * 
 * @since v5.1.0 — Task 4.1 do Roadmap de Melhorias MCP
 */

import { clientSupports } from "./client-capabilities.service.js";

/**
 * Gera resposta com structured content.
 * Se client suporta, retorna structuredContent separado.
 * Senão, embute JSON formatado dentro do content textual.
 */
export function withStructuredContent<T extends Record<string, unknown>>(
    textContent: Array<{ type: "text"; text: string }>,
    structuredData: T,
    jsonLabel?: string
): {
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: { type: "json"; json: T };
} {
    const useNative = clientSupports("hasStructuredContent");

    if (useNative) {
        return {
            content: textContent,
            structuredContent: { type: "json", json: structuredData },
        };
    }

    // Fallback: embute JSON como bloco de código no final
    const label = jsonLabel || "Dados Estruturados";
    const jsonBlock: { type: "text"; text: string } = {
        type: "text",
        text: `## 📦 ${label}\n\n\`\`\`json\n${JSON.stringify(structuredData, null, 2)}\n\`\`\``,
    };

    return {
        content: [...textContent, jsonBlock],
    };
}

/**
 * Extrai dados estruturados de um ToolResult (para uso em pipelines).
 * Útil quando um middleware precisa acessar dados tipados do resultado.
 */
export function extractStructuredData<T>(
    result: { structuredContent?: { type: string; json: T } }
): T | null {
    if (result.structuredContent?.type === "json") {
        return result.structuredContent.json;
    }
    return null;
}
