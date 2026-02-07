/**
 * Annotations com fallback para clients que não suportam o primitivo nativo.
 * 
 * MCP Annotations (protocol ≥ 2025-06-18) permitem marcar content com metadados
 * como audience, priority e provenance. Para clients mais antigos, embute
 * equivalentes inline no Markdown.
 * 
 * @since v5.1.0 — Task 3.3 do Roadmap de Melhorias MCP
 */

import { clientSupports } from "./client-capabilities.service.js";

export interface AnnotationData {
    /** Quem deve ver: "user", "assistant" ou ambos */
    audience?: ("user" | "assistant")[];
    /** Prioridade: 0.0 (baixa) a 1.0 (alta) */
    priority?: number;
    /** Proveniência: "tool-output", "cached", "computed" */
    provenance?: string;
}

/**
 * Aplica annotations a um content block.
 * Se o client suporta annotations nativas, retorna o bloco com campo `annotations`.
 * Senão, embute equivalentes inline no texto.
 */
export function annotateContent(
    block: { type: "text"; text: string },
    annotations: AnnotationData
): { type: "text"; text: string; annotations?: Record<string, unknown> } {
    const useNative = clientSupports("hasAnnotations");

    if (useNative) {
        return {
            ...block,
            annotations: {
                ...(annotations.audience ? { audience: annotations.audience } : {}),
                ...(annotations.priority !== undefined ? { priority: annotations.priority } : {}),
                ...(annotations.provenance ? { provenance: annotations.provenance } : {}),
            },
        };
    }

    // Fallback: Prefixo inline
    let prefix = "";
    if (annotations.audience?.length === 1) {
        if (annotations.audience[0] === "assistant") {
            prefix = "🤖 *[Para a IA]* ";
        } else if (annotations.audience[0] === "user") {
            prefix = "👤 *[Para o usuário]* ";
        }
    }
    if (annotations.priority !== undefined && annotations.priority >= 0.8) {
        prefix = "⚡ " + prefix;
    }

    return {
        type: "text",
        text: prefix ? `${prefix}\n\n${block.text}` : block.text,
    };
}

/**
 * Marca bloco como "apenas para a IA" (não exibir ao usuário).
 */
export function forAssistantOnly(block: { type: "text"; text: string }) {
    return annotateContent(block, { audience: ["assistant"], priority: 0.3 });
}

/**
 * Marca bloco como "apenas para o usuário" (exibir diretamente).
 */
export function forUserOnly(block: { type: "text"; text: string }) {
    return annotateContent(block, { audience: ["user"], priority: 0.8 });
}

/**
 * Marca bloco como alta prioridade.
 */
export function highPriority(block: { type: "text"; text: string }) {
    return annotateContent(block, { priority: 1.0 });
}
