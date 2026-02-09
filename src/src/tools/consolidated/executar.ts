/**
 * Tool Consolidada: executar
 * 
 * Unifica:
 * - avancar (avançar fase / onboarding)
 * - salvar (salvar conteúdo sem avançar)
 * - checkpoint (criar, rollback, listar)
 * 
 * Aceita parâmetro 'acao' para determinar a operação.
 * Padrão: "avancar" (comportamento mais comum).
 * 
 * @since v5.2.0 — Task C.1 do Roadmap v5.2
 */

import type { ToolResult } from "../../types/index.js";
import { formatResponse, formatError } from "../../utils/response-formatter.js";
import { avancar } from "./avancar.js";
import { checkpoint } from "./checkpoint-tool.js";
import { salvar } from "../salvar.js";

type ExecutarAcao = "avancar" | "salvar" | "checkpoint";

interface ExecutarArgs {
    diretorio: string;
    estado_json?: string;
    /** Ação principal: avancar (padrão), salvar, checkpoint */
    acao?: ExecutarAcao;

    // === Args de avancar ===
    entregavel?: string;
    respostas?: Record<string, unknown>;
    resumo_json?: string;
    nome_arquivo?: string;
    auto_flow?: boolean;
    /** Sub-ação para avancar (ex: 'proximo_bloco') ou checkpoint (ex: 'criar') */
    sub_acao?: string;

    // === Args de salvar ===
    conteudo?: string;
    tipo?: "rascunho" | "anexo" | "entregavel";

    // === Args de checkpoint ===
    /** Ação de checkpoint: criar, rollback, rollback_parcial, listar */
    checkpoint_acao?: "criar" | "rollback" | "rollback_parcial" | "listar";
    reason?: string;
    checkpointId?: string;
    modules?: string[];
    auto?: boolean;
}

/**
 * Tool: executar
 * Entry point unificado para ações de execução no projeto.
 */
export async function executar(args: ExecutarArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: formatError("executar", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    const acao = args.acao || "avancar";

    switch (acao) {
        case "avancar":
            return avancar({
                diretorio: args.diretorio,
                estado_json: args.estado_json,
                entregavel: args.entregavel,
                respostas: args.respostas,
                resumo_json: args.resumo_json,
                nome_arquivo: args.nome_arquivo,
                auto_flow: args.auto_flow,
                acao: args.sub_acao,
            });

        case "salvar":
            if (!args.conteudo) {
                return {
                    content: formatError("executar", "Para acao='salvar', `conteudo` é obrigatório."),
                    isError: true,
                };
            }
            return salvar({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                conteudo: args.conteudo,
                tipo: args.tipo || "rascunho",
                nome_arquivo: args.nome_arquivo,
            });

        case "checkpoint":
            return checkpoint({
                diretorio: args.diretorio,
                estado_json: args.estado_json,
                acao: args.checkpoint_acao || "listar",
                reason: args.reason,
                checkpointId: args.checkpointId,
                modules: args.modules,
                auto: args.auto,
            });

        default:
            return {
                content: formatResponse({
                    titulo: "⚠️ Ação Desconhecida",
                    resumo: `Ação '${acao}' não reconhecida.`,
                    alertas: ["Ações válidas: avancar, salvar, checkpoint"],
                    proximo_passo: {
                        tool: "executar",
                        descricao: "Tente novamente com uma ação válida",
                        args: `{ "diretorio": "${args.diretorio}", "acao": "avancar" }`,
                    },
                }),
            };
    }
}

export const executarSchema = {
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
        acao: {
            type: "string",
            enum: ["avancar", "salvar", "checkpoint"],
            description: "Ação principal (padrão: avancar). 'avancar' = avança fase/onboarding, 'salvar' = salva conteúdo sem avançar, 'checkpoint' = gerencia checkpoints",
        },
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável (para acao=avancar em fase de desenvolvimento)",
        },
        respostas: {
            type: "object",
            description: "Respostas de formulário (para acao=avancar em onboarding/brainstorm)",
        },
        resumo_json: {
            type: "string",
            description: "Resumo do projeto (opcional, para acao=avancar)",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo (para acao=avancar ou acao=salvar)",
        },
        auto_flow: {
            type: "boolean",
            description: "Modo automático para avancar (padrão: false)",
        },
        sub_acao: {
            type: "string",
            description: "Sub-ação específica (ex: 'proximo_bloco' para avancar)",
        },
        conteudo: {
            type: "string",
            description: "Conteúdo a salvar (obrigatório para acao=salvar)",
        },
        tipo: {
            type: "string",
            enum: ["rascunho", "anexo", "entregavel"],
            description: "Tipo de conteúdo (para acao=salvar, padrão: rascunho)",
        },
        checkpoint_acao: {
            type: "string",
            enum: ["criar", "rollback", "rollback_parcial", "listar"],
            description: "Ação de checkpoint (para acao=checkpoint, padrão: listar)",
        },
        reason: {
            type: "string",
            description: "Motivo do checkpoint (para checkpoint_acao=criar)",
        },
        checkpointId: {
            type: "string",
            description: "ID do checkpoint (para rollback)",
        },
        modules: {
            type: "array",
            items: { type: "string" },
            description: "Módulos para rollback parcial",
        },
        auto: {
            type: "boolean",
            description: "Checkpoint automático (padrão: false)",
        },
    },
    required: ["diretorio"],
};
