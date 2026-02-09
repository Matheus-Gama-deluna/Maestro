/**
 * Utilitários de formatação de resposta para tools MCP.
 * 
 * Princípio: LLMs processam Markdown melhor que JSON.
 * Todas as tools devem usar estes helpers para gerar retornos consistentes.
 * 
 * @since v5.1.0 — Task 1.2 do Roadmap de Melhorias MCP
 * @updated v5.2.0 — Task A.7: Integração de annotations-fallback
 */

import type { NextAction, SpecialistPersona, FlowProgress } from "../types/response.js";
import { annotateContent, forAssistantOnly, forUserOnly } from "../services/annotations-fallback.service.js";
import { remapToPublicTool, isPublicTool } from "./next-step-formatter.js";

// === TIPOS ===

interface ResponseBlock {
    type: "text";
    text: string;
    annotations?: Record<string, unknown>;
}

export interface ToolResponseOptions {
    /** Título principal (H1) */
    titulo: string;
    /** Resumo curto para o usuário (1-2 linhas) */
    resumo: string;
    /** Tabela de dados chave-valor */
    dados?: Record<string, string | number | boolean>;
    /** Instruções para a IA (seção separada) */
    instrucoes?: string;
    /** Template do entregável */
    template?: string;
    /** Próximo passo recomendado */
    proximo_passo?: {
        tool: string;
        descricao: string;
        args?: string;
        requer_input_usuario?: boolean;
        prompt_usuario?: string;
        auto_execute?: boolean;
    };
    /** Barra de progresso */
    progresso?: { atual: number; total: number; percentual: number };
    /** Lista de itens (pendências, checklist, etc.) */
    lista?: { titulo: string; itens: string[] };
    /** Checklist com status (✅/❌/⬜) */
    checklist?: { titulo: string; itens: Array<{ texto: string; status: "ok" | "falha" | "pendente" }> };
    /** Alertas/warnings */
    alertas?: string[];
    /** Specialist persona ativa */
    especialista?: { nome: string; tom: string; expertise: string[] };
    /** Seções extras de Markdown livre */
    secoes_extras?: Array<{ titulo: string; conteudo: string }>;
}

// === FUNÇÕES PRINCIPAIS ===

/**
 * Gera resposta formatada em Markdown estruturado.
 * Retorna array de content blocks separados por propósito.
 * v5.2: Blocos de especialista e instruções marcados como assistant-only via annotations.
 */
export function formatResponse(opts: ToolResponseOptions): ResponseBlock[] {
    const blocks: ResponseBlock[] = [];

    // Bloco 1: Resumo para o usuário (sempre presente)
    let resumoBlock = `# ${opts.titulo}\n\n${opts.resumo}`;

    if (opts.progresso) {
        const filled = Math.floor(opts.progresso.percentual / 10);
        const empty = 10 - filled;
        resumoBlock += `\n\n**Progresso:** ${"█".repeat(filled)}${"░".repeat(empty)} ${opts.progresso.percentual}% (${opts.progresso.atual}/${opts.progresso.total})`;
    }

    if (opts.dados && Object.keys(opts.dados).length > 0) {
        resumoBlock += `\n\n| Campo | Valor |\n|-------|-------|\n`;
        for (const [k, v] of Object.entries(opts.dados)) {
            resumoBlock += `| **${k}** | ${v} |\n`;
        }
    }

    if (opts.alertas && opts.alertas.length > 0) {
        resumoBlock += `\n\n${opts.alertas.map(a => `> ⚠️ ${a}`).join("\n")}`;
    }

    blocks.push({ type: "text", text: resumoBlock });

    // Bloco 2: Especialista (se houver) — v5.2: marcado como assistant-only
    if (opts.especialista) {
        blocks.push(forAssistantOnly({
            type: "text",
            text: `## 🤖 Especialista: ${opts.especialista.nome}\n\n**Tom:** ${opts.especialista.tom}\n**Expertise:** ${opts.especialista.expertise.join(", ")}`,
        }));
    }

    // Bloco 3: Instruções para a IA (se houver) — v5.2: marcado como assistant-only
    if (opts.instrucoes) {
        blocks.push(forAssistantOnly({
            type: "text",
            text: `## 🤖 Instruções\n\n${opts.instrucoes}`,
        }));
    }

    // Bloco 4: Template (se houver)
    if (opts.template) {
        blocks.push({
            type: "text",
            text: `## 📝 Template do Entregável\n\n${opts.template}`,
        });
    }

    // Bloco 5: Lista (se houver)
    if (opts.lista) {
        blocks.push({
            type: "text",
            text: `## ${opts.lista.titulo}\n\n${opts.lista.itens.map(i => `- ${i}`).join("\n")}`,
        });
    }

    // Bloco 6: Checklist (se houver)
    if (opts.checklist) {
        const statusMap = { ok: "✅", falha: "❌", pendente: "⬜" };
        const items = opts.checklist.itens
            .map(i => `${statusMap[i.status]} ${i.texto}`)
            .join("\n");
        blocks.push({
            type: "text",
            text: `## ${opts.checklist.titulo}\n\n${items}`,
        });
    }

    // Bloco 7: Seções extras
    if (opts.secoes_extras) {
        for (const secao of opts.secoes_extras) {
            blocks.push({
                type: "text",
                text: `## ${secao.titulo}\n\n${secao.conteudo}`,
            });
        }
    }

    // Bloco final: Próximo passo (sempre no final, se houver)
    // v5.3: Valida que tool é pública, remapeia se necessário
    if (opts.proximo_passo) {
        const toolName = isPublicTool(opts.proximo_passo.tool) 
            ? opts.proximo_passo.tool 
            : remapToPublicTool(opts.proximo_passo.tool);
        
        if (!isPublicTool(opts.proximo_passo.tool)) {
            console.error(`[response-formatter] proximo_passo referencia tool interna: ${opts.proximo_passo.tool} → remapeado para: ${toolName}`);
        }

        let nextBlock = `## ▶️ Próximo Passo\n\n**${opts.proximo_passo.descricao}**\n`;
        nextBlock += `\n\`\`\`json\n${toolName}(${opts.proximo_passo.args || ""})\n\`\`\``;

        if (opts.proximo_passo.requer_input_usuario) {
            nextBlock += `\n\n> 👤 ${opts.proximo_passo.prompt_usuario || "Aguardando input do usuário."}`;
        } else {
            nextBlock += `\n\n> 🤖 Esta ação pode ser executada automaticamente.`;
        }

        blocks.push({ type: "text", text: nextBlock });
    }

    return blocks;
}

/**
 * Embute metadados de next_action no content (para clients que ignoram campos custom).
 */
export function embedNextAction(
    content: ResponseBlock[],
    nextAction?: NextAction
): ResponseBlock[] {
    if (!nextAction) return content;

    const metaBlock = `\n---\n\n**Próxima ação:** \`${nextAction.tool}\` — ${nextAction.description}${
        nextAction.requires_user_input ? `\n> 👤 ${nextAction.user_prompt || "Aguardando input."}` : ""
    }`;

    return [...content, { type: "text", text: metaBlock }];
}

/**
 * Embute progress info no content.
 */
export function embedProgress(
    content: ResponseBlock[],
    progress?: FlowProgress
): ResponseBlock[] {
    if (!progress) return content;

    const pct = progress.percentage;
    const filled = Math.floor(pct / 10);
    const empty = 10 - filled;
    const progressBlock = `**Fase:** ${progress.current_phase} | **Progresso:** ${"█".repeat(filled)}${"░".repeat(empty)} ${pct}% (${progress.completed_phases}/${progress.total_phases})`;

    return [...content, { type: "text", text: progressBlock }];
}

/**
 * Embute specialist persona no content.
 */
export function embedSpecialist(
    content: ResponseBlock[],
    specialist?: SpecialistPersona
): ResponseBlock[] {
    if (!specialist) return content;

    const specialistBlock = `## 🤖 Especialista: ${specialist.name}\n\n**Tom:** ${specialist.tone}\n**Expertise:** ${specialist.expertise.join(", ")}\n\n${specialist.instructions}`;

    return [...content, { type: "text", text: specialistBlock }];
}

/**
 * Embute TODOS os metadados (next_action + progress + specialist) no content.
 * Substitui campos custom que seriam ignorados pelo client MCP.
 */
export function embedAllMetadata(
    content: ResponseBlock[],
    metadata: {
        next_action?: NextAction;
        progress?: FlowProgress;
        specialist?: SpecialistPersona;
    }
): ResponseBlock[] {
    let result = content;
    result = embedSpecialist(result, metadata.specialist);
    result = embedProgress(result, metadata.progress);
    result = embedNextAction(result, metadata.next_action);
    return result;
}

/**
 * Formata erro de tool de forma consistente.
 */
export function formatError(toolName: string, message: string, suggestion?: string): ResponseBlock[] {
    let text = `# ❌ Erro em \`${toolName}\`\n\n${message}`;
    if (suggestion) {
        text += `\n\n**Sugestão:** ${suggestion}`;
    }
    return [{ type: "text", text }];
}

/**
 * Formata preview de argumentos para exibição em blocos de código.
 */
export function formatArgsPreview(args: Record<string, unknown>): string {
    return Object.entries(args)
        .map(([key, value]) => {
            if (typeof value === "string" && value.startsWith("{{")) {
                return `${key}: "..."`;
            }
            return `${key}: ${JSON.stringify(value)}`;
        })
        .join(", ");
}

/**
 * Converte NextAction para o formato proximo_passo do formatResponse.
 */
export function nextActionToProximoPasso(na: NextAction): ToolResponseOptions["proximo_passo"] {
    return {
        tool: na.tool,
        descricao: na.description,
        args: formatArgsPreview(na.args_template),
        requer_input_usuario: na.requires_user_input,
        prompt_usuario: na.user_prompt,
        auto_execute: na.auto_execute,
    };
}

/**
 * Converte FlowProgress para o formato progresso do formatResponse.
 */
export function flowProgressToProgresso(fp: FlowProgress): ToolResponseOptions["progresso"] {
    return {
        atual: fp.completed_phases,
        total: fp.total_phases,
        percentual: fp.percentage,
    };
}
