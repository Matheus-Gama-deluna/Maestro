/**
 * Router Centralizado do Maestro MCP v6
 *
 * Ponto ÚNICO de roteamento para todas as tools.
 * Ambos entry points (stdio.ts e index.ts) usam este router.
 *
 * v6: Separação PUBLIC (5 tools) vs LEGACY (em legacy-tools.ts).
 * - getRegisteredTools() retorna apenas PUBLIC tools
 * - routeToolCall() aceita AMBAS (backward compatible)
 * - Middlewares aplicados automaticamente
 */

import type { ToolResult } from "./types/index.js";
import { applyOrchestrationPipeline } from "./middleware/index.js";

// === IMPORTS DE TOOLS PÚBLICAS ===

import { contexto, contextoSchema } from "./tools/contexto.js";
import { maestroTool, maestroToolSchema } from "./tools/maestro-tool.js";
import { validar, validarSchema } from "./tools/consolidated/validar.js";
import { analisar, analisarSchema } from "./tools/consolidated/analisar.js";
import { executar, executarSchema } from "./tools/consolidated/executar.js";

// === IMPORTS DE TOOLS LEGADAS (em arquivo separado) ===
import { legacyTools, legacyRedirects } from "./legacy-tools.js";

// === DEFINIÇÃO DE TOOL ===

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

// ============================================================
// PUBLIC TOOLS — Expostas para a IA (superfície reduzida)
// ============================================================

// v5.2: 5 tools públicas (consolidação de 8→5)
const publicTools: ToolDefinition[] = [
    {
        name: "maestro",
        description: "🎯 Entry point do Maestro. Sem projeto: cria novo (acao='criar_projeto', respostas={nome, descricao}). Com projeto: retorna status e próximo passo. Para setup: acao='setup_inicial', respostas={ide, modo, usar_stitch}. Sem ação = retorna status do projeto.",
        inputSchema: maestroToolSchema,
        outputSchema: {
            type: "object",
            properties: {
                projeto: { type: "string" },
                nivel: { type: "string" },
                fase_atual: { type: "number" },
                total_fases: { type: "number" },
                fase_nome: { type: "string" },
                progresso_percentual: { type: "number" },
                especialista: { type: "string" },
                proximo_passo: {
                    type: "object",
                    properties: {
                        tool: { type: "string" },
                        descricao: { type: "string" },
                    },
                },
            },
        },
        handler: applyOrchestrationPipeline("maestro", (a) => maestroTool(a as any)),
    },
    {
        name: "executar",
        description: "⚡ Executa ações no projeto. acao='avancar' (padrão): avança fase/onboarding (com entregavel ou respostas). acao='salvar': salva conteúdo (requer conteudo). acao='checkpoint': gerencia checkpoints. Para onboarding: respostas={campo1: valor1, campo2: valor2}.",
        inputSchema: executarSchema,
        handler: applyOrchestrationPipeline("executar", (a) => executar(a as any)),
    },
    {
        name: "validar",
        description: "✅ Valida gate, entregável ou compliance. Tipo auto-detectado ou especificado via parâmetro 'tipo'.",
        inputSchema: validarSchema,
        handler: applyOrchestrationPipeline("validar", (a) => validar(a as any)),
    },
    {
        name: "analisar",
        description: "🔍 Analisa código: segurança, qualidade, performance, dependências ou relatório completo. Usa parâmetro 'tipo'.",
        inputSchema: analisarSchema,
        handler: applyOrchestrationPipeline("analisar", (a) => analisar(a as any)),
    },
    {
        name: "contexto",
        description: "🧠 Retorna contexto acumulado do projeto (ADRs, padrões, decisões, knowledge base).",
        inputSchema: contextoSchema,
        outputSchema: {
            type: "object",
            properties: {
                projeto: { type: "string" },
                nivel: { type: "string" },
                fase_atual: { type: "number" },
                total_fases: { type: "number" },
                fase_nome: { type: "string" },
                progresso_percentual: { type: "number" },
                gates_validados: { type: "array", items: { type: "number" } },
                entregaveis: { type: "object" },
                fases_completas: { type: "array" },
            },
        },
        handler: applyOrchestrationPipeline("contexto", (a) => contexto(a as any)),
    },
];

// Mapa completo para lookup rápido (public + legacy)
const allToolsMap = new Map<string, ToolDefinition>();
for (const tool of publicTools) allToolsMap.set(tool.name, tool);
for (const tool of legacyTools) allToolsMap.set(tool.name, tool);

// === API PÚBLICA ===

// Set para lookup rápido de nomes públicos
const publicToolNames = new Set(publicTools.map(t => t.name));

export async function routeToolCall(name: string, rawArgs: Record<string, unknown>): Promise<ToolResult> {
    const tool = allToolsMap.get(name);
    if (!tool) {
        return {
            content: [{ type: "text", text: `❌ Tool não encontrada: ${name}\n\nTools disponíveis: ${publicTools.map(t => t.name).join(", ")}` }],
            isError: true,
        };
    }

    const isLegacy = !publicToolNames.has(name);

    try {
        const result = await tool.handler(rawArgs);

        // v5.1: Deprecation warning para tools legadas
        if (isLegacy) {
            const redirect = legacyRedirects[name] || "maestro";
            result.content.push({
                type: "text" as const,
                text: `\n---\n> ⚠️ **Deprecation:** \`${name}\` será removida na v6. Use \`${redirect}\` como alternativa.`,
            });
        }

        return result;
    } catch (error) {
        return {
            content: [{ type: "text", text: `❌ Erro ao executar ${name}: ${String(error)}` }],
            isError: true,
        };
    }
}

/**
 * Retorna lista de tools PÚBLICAS no formato MCP.
 * v5: Apenas 8 tools consolidadas (reduz superfície cognitiva).
 * Ponto ÚNICO de listagem - usado por stdio.ts e index.ts.
 */
export function getRegisteredTools(): Array<{ name: string; description: string; inputSchema: Record<string, unknown>; outputSchema?: Record<string, unknown> }> {
    return publicTools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}),
    }));
}

/**
 * Retorna lista de TODAS as tools (public + legacy) no formato MCP.
 * Útil para diagnóstico e testes.
 */
export function getAllTools(): Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> {
    return [...publicTools, ...legacyTools].map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
    }));
}

/**
 * Retorna quantidade de tools públicas.
 */
export function getToolCount(): number {
    return publicTools.length;
}

/**
 * Retorna quantidade total de tools (public + legacy).
 */
export function getTotalToolCount(): number {
    return allToolsMap.size;
}
