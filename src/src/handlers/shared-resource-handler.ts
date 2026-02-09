/**
 * Handlers compartilhados de Resources entre stdio.ts e index.ts.
 * 
 * Elimina duplicação de lógica de resources/list e resources/read.
 * Ambos entry points importam daqui.
 * 
 * @since v5.1.0 — Task 1.5 do Roadmap de Melhorias MCP
 * @updated v5.2.0 — Task A.2: Integração efetiva + suporte a skills e system-prompt dinâmico
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

import { buildSystemPrompt } from "../services/system-prompt.service.js";
import { ContentResolverService } from "../services/content-resolver.service.js";

export interface ResourceInfo {
    uri: string;
    name: string;
    mimeType: string;
    description?: string;
}

export interface SkillResourceInfo {
    uri: string;
    name: string;
    mimeType: string;
}

/**
 * Opções para listagem de resources.
 */
export interface ListResourcesOptions {
    /** Diretório do projeto (para resolver skills) */
    projectDir?: string;
    /** Se true, inclui skill resources (usado no stdio) */
    includeSkills?: boolean;
}

/**
 * Lista todos os resources disponíveis (especialistas, templates, guias, system-prompt).
 * Opcionalmente inclui skill resources quando projectDir é fornecido.
 */
export async function listResources(opts?: ListResourcesOptions): Promise<{ resources: ResourceInfo[] }> {
    const especialistas = await listarEspecialistas();
    const templates = await listarTemplates();
    const guias = await listarGuias();

    const resources: ResourceInfo[] = [];

    // v5.2: Skill resources (quando projectDir disponível e includeSkills=true)
    if (opts?.includeSkills && opts?.projectDir) {
        const contentResolver = new ContentResolverService(opts.projectDir);
        const skills = await contentResolver.listAvailableSkills();

        for (const skillName of skills) {
            resources.push({
                uri: `maestro://skills/${skillName}/SKILL.md`,
                name: `Skill: ${skillName}`,
                mimeType: "text/markdown",
            });

            const skillTemplates = await contentResolver.listSkillResources(skillName, "templates");
            for (const t of skillTemplates) {
                resources.push({
                    uri: `maestro://skills/${skillName}/templates/${t}`,
                    name: `${skillName} Template: ${t}`,
                    mimeType: "text/markdown",
                });
            }

            const checklists = await contentResolver.listSkillResources(skillName, "checklists");
            for (const c of checklists) {
                resources.push({
                    uri: `maestro://skills/${skillName}/checklists/${c}`,
                    name: `${skillName} Checklist: ${c}`,
                    mimeType: "text/markdown",
                });
            }
        }
    }

    // Legacy: especialistas, templates, guias
    resources.push(
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
    );

    return { resources };
}

/**
 * Opções para leitura de resource.
 */
export interface ReadResourceOptions {
    /** Diretório do projeto (para resolver skills e system-prompt dinâmico) */
    projectDir?: string;
}

/**
 * Lê o conteúdo de um resource pelo URI.
 */
export async function readResource(uri: string, opts?: ReadResourceOptions): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
    // v5.2: Skills como resources
    if (uri.startsWith("maestro://skills/") && opts?.projectDir) {
        const path = uri.replace("maestro://skills/", "");
        const parts = path.split("/");
        const skillName = parts[0];
        const contentResolver = new ContentResolverService(opts.projectDir);

        if (parts.length === 2 && parts[1] === "SKILL.md") {
            const content = await contentResolver.readSkillFile(skillName, "SKILL.md");
            if (!content) throw new Error(`SKILL.md não encontrado: ${skillName}`);
            return { contents: [{ uri, mimeType: "text/markdown", text: content }] };
        }

        if (parts.length === 3) {
            const tipo = parts[1] as "templates" | "checklists" | "examples" | "reference";
            const arquivo = parts[2];
            const content = await contentResolver.readSkillResource(skillName, tipo, arquivo);
            if (!content) throw new Error(`Resource não encontrado: ${uri}`);
            return { contents: [{ uri, mimeType: "text/markdown", text: content }] };
        }
    }

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

    // Prompts
    if (uri.startsWith("maestro://prompt/")) {
        const path = uri.replace("maestro://prompt/", "");
        const [categoria, nome] = path.split("/");
        const conteudo = await lerPrompt(decodeURIComponent(categoria), decodeURIComponent(nome));
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo || "Prompt não encontrado." }] };
    }

    // v5.2: System Prompt dinâmico (integra system-prompt.service)
    if (uri === "maestro://system-prompt") {
        const conteudo = buildSystemPrompt();
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
}
