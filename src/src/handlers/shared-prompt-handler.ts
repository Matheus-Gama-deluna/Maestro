/**
 * Handler compartilhado de Prompts MCP.
 * 
 * Centraliza a lógica de listagem e resolução de prompts
 * para ambos entry points (stdio.ts e index.ts).
 * 
 * @since v5.2.0 — Task C.4 do Roadmap v5.2
 */

import { createStateService } from "../services/state.service.js";
import { getFaseComStitch } from "../flows/types.js";
import { getSpecialistPersona } from "../services/specialist.service.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { getRegisteredTools } from "../router.js";

// === TIPOS ===

interface PromptDefinition {
    name: string;
    description: string;
    arguments: Array<{ name: string; description: string; required: boolean }>;
}

interface PromptMessage {
    role: "user" | "assistant";
    content: { type: "text"; text: string };
}

interface PromptResult {
    [x: string]: unknown; // SDK ServerResult compatibility
    description: string;
    messages: PromptMessage[];
}

// === LISTAGEM ===

const PROMPT_DEFINITIONS: PromptDefinition[] = [
    {
        name: "maestro-specialist",
        description: "Persona + instruções do especialista da fase atual do projeto",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
    {
        name: "maestro-context",
        description: "Contexto completo do projeto para a sessão de trabalho",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
    {
        name: "maestro-template",
        description: "Template do entregável esperado para a fase atual",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
    {
        name: "maestro-sessao",
        description: "Contexto completo para sessão de trabalho (specialist + context + template + tools)",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
];

/**
 * Retorna lista de prompts disponíveis.
 */
export function listPrompts(): { prompts: PromptDefinition[] } {
    return { prompts: PROMPT_DEFINITIONS };
}

/**
 * Resolve um prompt pelo nome.
 */
export async function getPrompt(name: string, diretorio: string): Promise<PromptResult> {
    switch (name) {
        case "maestro-specialist":
            return buildSpecialistPrompt(diretorio);
        case "maestro-context":
            return buildContextPrompt(diretorio);
        case "maestro-template":
            return buildTemplatePrompt(diretorio);
        case "maestro-sessao":
            return buildSessionPrompt(diretorio);
        default:
            throw new Error(`Prompt não encontrado: ${name}`);
    }
}

// === BUILDERS ===

function noProjectResult(msg?: string): PromptResult {
    return {
        description: "Nenhum projeto encontrado",
        messages: [{
            role: "user",
            content: { type: "text", text: msg || "Nenhum projeto ativo neste diretório. Use `maestro(diretorio)` para começar." },
        }],
    };
}

async function buildSpecialistPrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) return noProjectResult();

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    if (!faseInfo) {
        return {
            description: `Projeto: ${estado.nome}`,
            messages: [{
                role: "user",
                content: { type: "text", text: `Projeto ${estado.nome} — fase ${estado.fase_atual} não encontrada no fluxo.` },
            }],
        };
    }

    const mode = (estado.config?.mode || "balanced") as "economy" | "balanced" | "quality";
    const contentResolver = new ContentResolverService(diretorio);
    const skillLoader = new SkillLoaderService(contentResolver);

    try {
        const contextPkg = await skillLoader.loadForPhase(faseInfo.nome, mode);
        if (contextPkg) {
            return {
                description: `Especialista: ${contextPkg.specialist?.name || faseInfo.nome} — Fase ${estado.fase_atual}/${estado.total_fases}`,
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `# Especialista da Fase: ${faseInfo.nome}\n\n${skillLoader.formatAsMarkdown(contextPkg)}`,
                    },
                }],
            };
        }
    } catch (error) {
        console.warn("[Prompt] Falha ao carregar skill:", error);
    }

    // Fallback: persona básica
    const specialist = getSpecialistPersona(faseInfo.nome);
    return {
        description: `Especialista: ${specialist?.name || faseInfo.nome}`,
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: specialist
                    ? `# ${specialist.name}\n\n**Tom:** ${specialist.tone}\n**Expertise:** ${specialist.expertise.join(", ")}\n**Instruções:** ${specialist.instructions}`
                    : `Fase ${estado.fase_atual}: ${faseInfo.nome}`,
            },
        }],
    };
}

async function buildContextPrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) return noProjectResult("Nenhum projeto ativo neste diretório.");

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);

    const contextText = `# Contexto do Projeto: ${estado.nome}

## Estado
| Campo | Valor |
|-------|-------|
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Fase Atual** | ${estado.fase_atual}/${estado.total_fases} — ${faseInfo?.nome || "N/A"} |
| **Gates Validados** | ${estado.gates_validados?.join(", ") || "nenhum"} |

## Entregáveis Salvos
${Object.entries(estado.entregaveis || {}).map(([k, v]) => `- **${k}:** ${v}`).join("\n") || "Nenhum ainda."}

## Próximo Passo
Trabalhe com o especialista **${faseInfo?.especialista || "N/A"}** para gerar: **${faseInfo?.entregavel_esperado || "N/A"}**
`;

    return {
        description: `Projeto: ${estado.nome} — Fase ${estado.fase_atual}/${estado.total_fases}`,
        messages: [{
            role: "user",
            content: { type: "text", text: contextText },
        }],
    };
}

async function buildTemplatePrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) return noProjectResult("Nenhum projeto ativo neste diretório.");

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    if (!faseInfo) {
        return {
            description: `Projeto: ${estado.nome}`,
            messages: [{
                role: "user",
                content: { type: "text", text: `Projeto ${estado.nome} — fase ${estado.fase_atual} não encontrada.` },
            }],
        };
    }

    const contentResolver = new ContentResolverService(diretorio);
    const skillLoader = new SkillLoaderService(contentResolver);

    try {
        const templateContent = await skillLoader.loadTemplate(faseInfo.nome);
        if (templateContent) {
            return {
                description: `Template: ${faseInfo.entregavel_esperado || faseInfo.nome}`,
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `# Template do Entregável: ${faseInfo.entregavel_esperado || faseInfo.nome}

## Fase ${estado.fase_atual}/${estado.total_fases}: ${faseInfo.nome}

Use este template como base para gerar o entregável:

---

${templateContent}

---

> 💡 Dica: Preencha todas as seções marcadas com [...] ou indicadores de conteúdo.`,
                    },
                }],
            };
        }
    } catch (error) {
        console.warn("[Prompt] Falha ao carregar template:", error);
    }

    // Fallback: estrutura básica
    return {
        description: `Template: ${faseInfo.entregavel_esperado || faseInfo.nome}`,
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `# Template do Entregável: ${faseInfo.entregavel_esperado || faseInfo.nome}

## Fase ${estado.fase_atual}/${estado.total_fases}: ${faseInfo.nome}

### Estrutura Esperada

${faseInfo.gate_checklist.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

---

> ℹ️ Template específico não disponível. Use a lista acima como guia.`,
            },
        }],
    };
}

async function buildSessionPrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) {
        // v5.2: Lista tools consolidadas
        const tools = getRegisteredTools();
        const toolsList = tools.map(t => `- **${t.name}** — ${t.description.replace(/^[^\s]+ /, "")}`).join("\n");
        return {
            description: "Nenhum projeto encontrado",
            messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: `# 🎯 Sessão Maestro

Nenhum projeto ativo em \`${diretorio}\`.

Use \`maestro(diretorio: "${diretorio}")\` para começar.

## Tools Disponíveis
${toolsList}`,
                },
            }],
        };
    }

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    const specialist = faseInfo ? getSpecialistPersona(faseInfo.nome) : null;

    let sessionContent = `# 🎯 Sessão Maestro — ${estado.nome}\n\n`;

    // Specialist
    if (specialist) {
        sessionContent += `## 🤖 Especialista: ${specialist.name}\n\n`;
        sessionContent += `**Tom:** ${specialist.tone}\n`;
        sessionContent += `**Expertise:** ${specialist.expertise.join(", ")}\n`;
        sessionContent += `**Instruções:** ${specialist.instructions}\n\n`;
    }

    // Contexto do projeto
    sessionContent += `## 📋 Contexto\n\n`;
    sessionContent += `| Campo | Valor |\n|-------|-------|\n`;
    sessionContent += `| **Projeto** | ${estado.nome} |\n`;
    sessionContent += `| **Nível** | ${estado.nivel.toUpperCase()} |\n`;
    sessionContent += `| **Fase** | ${estado.fase_atual}/${estado.total_fases} — ${faseInfo?.nome || "N/A"} |\n`;
    sessionContent += `| **Gates Validados** | ${estado.gates_validados.length} |\n\n`;

    // Skill injection
    if (faseInfo) {
        try {
            const contentResolver = new ContentResolverService(diretorio);
            const skillLoader = new SkillLoaderService(contentResolver);
            const mode = (estado.config?.mode || "balanced") as "economy" | "balanced" | "quality";
            const contextPkg = await skillLoader.loadForPhase(faseInfo.nome, mode);
            if (contextPkg) {
                sessionContent += `## 📚 Skill da Fase\n\n${skillLoader.formatAsMarkdown(contextPkg)}\n\n`;
            }
        } catch {
            // Fallback silencioso
        }
    }

    // v5.2: Tools consolidadas dinâmicas
    const tools = getRegisteredTools();
    sessionContent += `## 🔧 Tools Disponíveis\n\n`;
    sessionContent += tools.map(t => `- **${t.name}** — ${t.description.replace(/^[^\s]+ /, "")}`).join("\n");

    return {
        description: `Sessão: ${estado.nome} — Fase ${estado.fase_atual}`,
        messages: [{
            role: "user",
            content: { type: "text", text: sessionContent },
        }],
    };
}
