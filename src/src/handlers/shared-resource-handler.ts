/**
 * Handlers compartilhados de Resources entre stdio.ts e index.ts.
 * 
 * Elimina duplicação de lógica de resources/list e resources/read.
 * Ambos entry points importam daqui.
 * 
 * @since v5.1.0 — Task 1.5 do Roadmap de Melhorias MCP
 */

import {
    listarEspecialistas,
    listarTemplates,
    listarGuias,
    lerEspecialista,
    lerTemplate,
    lerGuia,
    lerPrompt,
} from "../utils/files.js";

export interface ResourceInfo {
    uri: string;
    name: string;
    mimeType: string;
    description: string;
}

/**
 * Lista todos os resources disponíveis (especialistas, templates, guias, system-prompt).
 */
export async function listResources(): Promise<{ resources: ResourceInfo[] }> {
    const especialistas = await listarEspecialistas();
    const templates = await listarTemplates();
    const guias = await listarGuias();

    return {
        resources: [
            ...especialistas.map((e) => ({
                uri: `maestro://especialista/${encodeURIComponent(e)}`,
                name: `Especialista: ${e}`,
                mimeType: "text/markdown",
                description: `Especialista em ${e}`,
            })),
            ...templates.map((t) => ({
                uri: `maestro://template/${encodeURIComponent(t)}`,
                name: `Template: ${t}`,
                mimeType: "text/markdown",
                description: `Template de ${t}`,
            })),
            ...guias.map((g) => ({
                uri: `maestro://guia/${encodeURIComponent(g)}`,
                name: `Guia: ${g}`,
                mimeType: "text/markdown",
                description: `Guia de ${g}`,
            })),
            {
                uri: "maestro://system-prompt",
                name: "System Prompt",
                mimeType: "text/markdown",
                description: "Instruções de comportamento para a IA",
            },
        ],
    };
}

/**
 * Lê o conteúdo de um resource pelo URI.
 */
export async function readResource(uri: string): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
    // Especialistas
    if (uri.startsWith("maestro://especialista/")) {
        const nome = decodeURIComponent(uri.replace("maestro://especialista/", ""));
        const conteudo = await lerEspecialista(nome);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo || `Especialista "${nome}" não encontrado.` }] };
    }

    // Templates
    if (uri.startsWith("maestro://template/")) {
        const nome = decodeURIComponent(uri.replace("maestro://template/", ""));
        const conteudo = await lerTemplate(nome);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo || `Template "${nome}" não encontrado.` }] };
    }

    // Guias
    if (uri.startsWith("maestro://guia/")) {
        const nome = decodeURIComponent(uri.replace("maestro://guia/", ""));
        const conteudo = await lerGuia(nome);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo || `Guia "${nome}" não encontrado.` }] };
    }

    // System Prompt
    if (uri === "maestro://system-prompt") {
        const conteudo = await lerPrompt("system", "prompt");
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo || "System prompt não encontrado." }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
}
