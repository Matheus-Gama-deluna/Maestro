/**
 * Tool Consolidada: avancar
 * 
 * Unifica:
 * - proximo (avançar fase de desenvolvimento)
 * - onboarding_orchestrator (próximo bloco de onboarding)
 * - brainstorm (próxima seção)
 * 
 * Detecta contexto automaticamente e delega para o handler correto.
 */

import type { ToolResult, EstadoProjeto } from "../../types/index.js";
import { formatResponse, formatError } from "../../utils/response-formatter.js";
import { parsearEstado } from "../../state/storage.js";
import { isInOnboarding } from "../../services/flow-engine.js";
import { proximo } from "../proximo.js";
import { onboardingOrchestrator } from "../../flows/onboarding-orchestrator.js";
import { brainstorm } from "../brainstorm.js";

interface AvancarArgs {
    diretorio: string;
    estado_json?: string;
    entregavel?: string;
    respostas?: Record<string, unknown>;
    resumo_json?: string;
    nome_arquivo?: string;
    auto_flow?: boolean;
    acao?: string;
}

/**
 * Tool: avancar
 * Entry point unificado para avançar no fluxo do projeto.
 * Detecta se está em onboarding ou desenvolvimento e delega.
 */
export async function avancar(args: AvancarArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: formatError("avancar", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    // Determinar contexto
    let estado: EstadoProjeto | null = null;
    if (args.estado_json) {
        estado = parsearEstado(args.estado_json);
    }

    // Se não tem estado, delegar para onboarding (projeto novo ou carregando)
    if (!estado) {
        return onboardingOrchestrator({
            diretorio: args.diretorio,
            estado_json: args.estado_json || "",
            acao: args.acao || "proximo_bloco",
            respostas: args.respostas,
        } as any);
    }

    // Verificar se está em onboarding
    const inOnboarding = isInOnboarding(estado);
    const onboarding = (estado as any).onboarding;

    if (inOnboarding) {
        // Se brainstorm está em progresso
        if (onboarding?.brainstormStatus === "in_progress") {
            return brainstorm({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                acao: "proximo_secao",
                respostas: args.respostas,
            } as any);
        }

        // Caso contrário, delegar para onboarding orchestrator
        return onboardingOrchestrator({
            diretorio: args.diretorio,
            estado_json: args.estado_json || "",
            acao: args.acao || "proximo_bloco",
            respostas: args.respostas,
        } as any);
    }

    // Desenvolvimento: delegar para proximo
    if (!args.entregavel) {
        return {
            content: formatResponse({
                titulo: "⚠️ Entregável Necessário",
                resumo: "Para avançar na fase de desenvolvimento, forneça o entregável.",
                proximo_passo: {
                    tool: "avancar",
                    descricao: "Avançar fase com entregável",
                    args: `diretorio: "${args.diretorio}", entregavel: "conteúdo do entregável..."`,
                    requer_input_usuario: true,
                    prompt_usuario: "Forneça o conteúdo do entregável da fase atual.",
                },
            }),
        };
    }

    return proximo({
        diretorio: args.diretorio,
        estado_json: args.estado_json || "",
        entregavel: args.entregavel,
        resumo_json: args.resumo_json,
        nome_arquivo: args.nome_arquivo,
        auto_flow: args.auto_flow,
    });
}

export const avancarSchema = {
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
            description: "Conteúdo do entregável (obrigatório para fase de desenvolvimento)",
        },
        respostas: {
            type: "object",
            description: "Respostas de formulário para onboarding/brainstorm",
        },
        resumo_json: {
            type: "string",
            description: "Resumo do projeto (opcional)",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo para salvar (opcional)",
        },
        auto_flow: {
            type: "boolean",
            description: "Modo automático: pula confirmações e avança automaticamente (padrão: false)",
        },
        acao: {
            type: "string",
            description: "Ação específica (ex: 'proximo_bloco', 'proximo_secao')",
        },
    },
    required: ["diretorio"],
};
