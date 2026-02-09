/**
 * Resource Links com fallback para clients que não suportam.
 * 
 * MCP ResourceLink (protocol ≥ 2025-03-26) permite referenciar resources
 * dentro de tool results. Para clients mais antigos, embute link como
 * referência Markdown inline.
 * 
 * @since v5.2.0 — Task C.2 do Roadmap v5.2
 */

import { clientSupports } from "../services/client-capabilities.service.js";

export interface ResourceLinkOptions {
    uri: string;
    description?: string;
    mimeType?: string;
}

/**
 * Gera um content block de resource link.
 * Se client suporta, retorna bloco tipo "resource_link".
 * Senão, retorna bloco texto com link Markdown.
 */
export function buildResourceLink(
    options: ResourceLinkOptions
): { type: string; [key: string]: unknown } {
    // Resource links são suportados no protocol 2025-03-26+
    // Mas nem todos os clients renderizam. Usar fallback seguro.
    const useNative = clientSupports("hasStructuredContent");

    if (useNative) {
        return {
            type: "resource_link",
            uri: options.uri,
            ...(options.description ? { description: options.description } : {}),
            ...(options.mimeType ? { mimeType: options.mimeType } : {}),
        };
    }

    // Fallback: link Markdown
    const label = options.description || options.uri;
    return {
        type: "text",
        text: `📎 [${label}](${options.uri})`,
    };
}

/**
 * Gera múltiplos resource links como bloco de referências.
 * Retorna um único content block com todos os links.
 */
export function buildResourceLinksBlock(
    links: ResourceLinkOptions[],
    title?: string
): Array<{ type: string; [key: string]: unknown }> {
    if (links.length === 0) return [];

    const useNative = clientSupports("hasStructuredContent");

    if (useNative) {
        return links.map(link => buildResourceLink(link));
    }

    // Fallback: bloco Markdown com lista de links
    const header = title || "📚 Recursos Relacionados";
    const items = links.map(l => `- 📎 [${l.description || l.uri}](${l.uri})`).join("\n");
    return [{
        type: "text",
        text: `### ${header}\n\n${items}`,
    }];
}

/**
 * Gera resource link para um especialista/skill.
 */
export function skillResourceLink(skillName: string, fileName: string = "SKILL.md"): ResourceLinkOptions {
    return {
        uri: `maestro://skills/${skillName}/${fileName}`,
        description: `Skill: ${skillName}`,
        mimeType: "text/markdown",
    };
}

/**
 * Gera resource link para um template.
 */
export function templateResourceLink(skillName: string, templateName: string): ResourceLinkOptions {
    return {
        uri: `maestro://skills/${skillName}/templates/${templateName}`,
        description: `Template: ${templateName}`,
        mimeType: "text/markdown",
    };
}

/**
 * Gera resource link para o system prompt.
 */
export function systemPromptResourceLink(): ResourceLinkOptions {
    return {
        uri: "maestro://system-prompt",
        description: "System Prompt do Maestro",
        mimeType: "text/markdown",
    };
}
