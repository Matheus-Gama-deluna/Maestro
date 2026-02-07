/**
 * Router Centralizado do Maestro MCP v5
 * 
 * Ponto ÚNICO de roteamento para todas as tools.
 * Ambos entry points (stdio.ts e index.ts) usam este router.
 * 
 * v5: Separação PUBLIC (8 tools) vs LEGACY (37+ tools).
 * - getRegisteredTools() retorna apenas PUBLIC tools
 * - routeToolCall() aceita AMBAS (backward compatible)
 * - Middlewares aplicados automaticamente
 */

import type { ToolResult } from "./types/index.js";
import { applyMiddlewares, applyLightMiddlewares, applySmartMiddlewares, applyPersistenceMiddlewares } from "./middleware/index.js";

// === IMPORTS DE TOOLS ===

// Core
import { iniciarProjeto, iniciarProjetoSchema, confirmarProjeto, confirmarProjetoSchema } from "./tools/iniciar-projeto.js";
import { confirmarStitch, confirmarStitchSchema } from "./tools/confirmar-stitch.js";
import { carregarProjeto, carregarProjetoSchema } from "./tools/carregar-projeto.js";
import { proximo, proximoSchema } from "./tools/proximo.js";
import { status, statusSchema } from "./tools/status.js";
import { validarGate, validarGateSchema } from "./tools/validar-gate.js";
import { setupInicial, setupInicialSchema } from "./tools/setup-inicial.js";

// V1.0
import { classificar, classificarSchema } from "./tools/classificar.js";
import { contexto, contextoSchema } from "./tools/contexto.js";
import { salvar, salvarSchema } from "./tools/salvar.js";
import { implementarHistoria, implementarHistoriaSchema } from "./tools/implementar-historia.js";

// Fluxos alternativos
import { novaFeature, novaFeatureSchema, corrigirBug, corrigirBugSchema, refatorar, refatorarSchema } from "./tools/fluxos-alternativos.js";

// Análise
import { analisarSeguranca, analisarSegurancaSchema } from "./tools/analise/seguranca.js";
import { analisarQualidade, analisarQualidadeSchema } from "./tools/analise/qualidade.js";
import { analisarPerformance, analisarPerformanceSchema } from "./tools/analise/performance.js";
import { gerarRelatorio, gerarRelatorioSchema } from "./tools/analise/relatorio.js";

// Memória
import { atualizarCodebase, atualizarCodebaseSchema } from "./tools/atualizar-codebase.js";

// Qualidade
import { avaliarEntregavel, avaliarEntregavelSchema } from "./tools/avaliar-entregavel.js";

// Injeção de conteúdo
import { injetar_conteudo, injetarConteudoSchema } from "./tools/injetar-conteudo.js";

// Discovery
import { discovery, discoverySchema } from "./tools/discovery.js";

// Onboarding otimizado
import { onboardingOrchestrator, onboardingOrchestratorSchema } from "./flows/onboarding-orchestrator.js";
import { brainstorm, brainstormSchema } from "./tools/brainstorm.js";
import { prdWriter, prdWriterSchema } from "./tools/prd-writer.js";
import { nextStepsDashboard, nextStepsDashboardSchema } from "./tools/next-steps-dashboard.js";

// Gate e classificação
import { aprovarGate } from "./tools/aprovar-gate.js";
import { confirmarClassificacao } from "./tools/confirmar-classificacao.js";

// Fase 1: Knowledge Base
import {
    recordADR, recordADRSchema,
    recordPattern, recordPatternSchema,
    getContext, getContextSchema,
    searchKnowledge, searchKnowledgeSchema,
} from "./tools/fase1/knowledge.tools.js";

// Fase 1: Checkpoint
import {
    createCheckpoint, createCheckpointSchema,
    rollbackTotal, rollbackTotalSchema,
    rollbackPartial, rollbackPartialSchema,
    listCheckpoints, listCheckpointsSchema,
} from "./tools/fase1/checkpoint.tools.js";

// Fase 1: Validation
import {
    validateDependencies, validateDependenciesSchema,
    validateSecurity, validateSecuritySchema,
    checkCompliance, checkComplianceSchema,
} from "./tools/fase1/validation.tools.js";

// Fase 1: Risk, AutoFix, Discovery
import {
    evaluateRisk, evaluateRiskSchema,
    autoFix, autoFixSchema,
    discoverCodebase, discoverCodebaseSchema,
} from "./tools/fase1/misc.tools.js";

// Entry point inteligente
import { maestroTool, maestroToolSchema } from "./tools/maestro-tool.js";

// v5: Tools consolidadas
import { avancar, avancarSchema } from "./tools/consolidated/avancar.js";
import { validar, validarSchema } from "./tools/consolidated/validar.js";
import { checkpoint, checkpointSchema } from "./tools/consolidated/checkpoint-tool.js";
import { analisar, analisarSchema } from "./tools/consolidated/analisar.js";

// === DEFINIÇÃO DE TOOL ===

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

// ============================================================
// PUBLIC TOOLS — Expostas para a IA (superfície reduzida)
// ============================================================

const publicTools: ToolDefinition[] = [
    {
        name: "maestro",
        description: "🎯 Entry point inteligente do Maestro. Detecta contexto do projeto automaticamente e guia o próximo passo. Use esta tool quando não souber qual tool usar.",
        inputSchema: maestroToolSchema,
        handler: applySmartMiddlewares("maestro", (a) => maestroTool(a as any)),
    },
    {
        name: "avancar",
        description: "⏭️ Avança no fluxo do projeto. Em onboarding: processa próximo bloco. Em desenvolvimento: submete entregável e avança fase. Detecta contexto automaticamente.",
        inputSchema: avancarSchema,
        handler: applySmartMiddlewares("avancar", (a) => avancar(a as any)),
    },
    {
        name: "status",
        description: "📊 Retorna status completo do projeto com progresso, fase atual e próximos passos.",
        inputSchema: statusSchema,
        handler: applyMiddlewares("status", (a) => status(a as any)),
    },
    {
        name: "validar",
        description: "✅ Valida gate, entregável ou compliance. Tipo auto-detectado ou especificado via parâmetro 'tipo'.",
        inputSchema: validarSchema,
        handler: applyMiddlewares("validar", (a) => validar(a as any)),
    },
    {
        name: "contexto",
        description: "🧠 Retorna contexto acumulado do projeto (ADRs, padrões, decisões, knowledge base).",
        inputSchema: contextoSchema,
        handler: applyMiddlewares("contexto", (a) => contexto(a as any)),
    },
    {
        name: "salvar",
        description: "💾 Salva conteúdo (rascunho, anexo ou entregável) sem avançar de fase.",
        inputSchema: salvarSchema,
        handler: applyPersistenceMiddlewares("salvar", (a) => salvar(a as any)),
    },
    {
        name: "checkpoint",
        description: "🔒 Gerencia checkpoints: criar, rollback total/parcial ou listar. Usa parâmetro 'acao'.",
        inputSchema: checkpointSchema,
        handler: applyPersistenceMiddlewares("checkpoint", (a) => checkpoint(a as any)),
    },
    {
        name: "analisar",
        description: "🔍 Analisa código: segurança, qualidade, performance, dependências ou relatório completo. Usa parâmetro 'tipo'.",
        inputSchema: analisarSchema,
        handler: applyMiddlewares("analisar", (a) => analisar(a as any)),
    },
];

// ============================================================
// LEGACY TOOLS — Aceitas no routeToolCall mas NÃO listadas
// Backward compatible com v4 e anteriores
// ============================================================

const legacyTools: ToolDefinition[] = [
    // ──── CORE LEGACY ────
    {
        name: "setup_inicial",
        description: "[Interno] Salva configuração global. Use 'maestro' como entry point.",
        inputSchema: setupInicialSchema,
        handler: (a) => setupInicial(a as any),
    },
    {
        name: "iniciar_projeto",
        description: "[Interno] Inicia novo projeto. Use 'maestro' como entry point.",
        inputSchema: iniciarProjetoSchema,
        handler: (a) => iniciarProjeto(a as any),
    },
    {
        name: "confirmar_projeto",
        description: "[Interno] Confirma criação do projeto.",
        inputSchema: confirmarProjetoSchema,
        handler: (a) => confirmarProjeto(a as any),
    },
    {
        name: "confirmar_stitch",
        description: "[Interno] Confirma uso de prototipagem Stitch.",
        inputSchema: confirmarStitchSchema,
        handler: (a) => confirmarStitch(a as any),
    },
    {
        name: "carregar_projeto",
        description: "[Interno] Carrega projeto existente. Use 'maestro' como entry point.",
        inputSchema: carregarProjetoSchema,
        handler: (a) => carregarProjeto(a as any),
    },
    {
        name: "proximo",
        description: "[Interno] Avança fase. Use 'avancar' como alternativa consolidada.",
        inputSchema: proximoSchema,
        handler: applyLightMiddlewares("proximo", (a) => proximo(a as any)),
    },
    {
        name: "validar_gate",
        description: "[Interno] Valida gate. Use 'validar' como alternativa consolidada.",
        inputSchema: validarGateSchema,
        handler: (a) => validarGate(a as any),
    },
    {
        name: "aprovar_gate",
        description: "EXCLUSIVO DO USUÁRIO. Aprova ou rejeita avanço com pendências. IA NÃO deve chamar automaticamente.",
        inputSchema: { type: "object", properties: { acao: { type: "string", enum: ["aprovar", "rejeitar"] }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["acao", "estado_json", "diretorio"] },
        handler: (a) => aprovarGate(a as any),
    },
    {
        name: "classificar",
        description: "[Interno] Reclassifica complexidade.",
        inputSchema: classificarSchema,
        handler: (a) => classificar(a as any),
    },
    {
        name: "confirmar_classificacao",
        description: "[Interno] Confirma reclassificação após PRD.",
        inputSchema: { type: "object", properties: { estado_json: { type: "string" }, diretorio: { type: "string" }, nivel: { type: "string", enum: ["simples", "medio", "complexo"] }, tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"] } }, required: ["estado_json", "diretorio"] },
        handler: (a) => confirmarClassificacao(a as any),
    },
    {
        name: "implementar_historia",
        description: "[Interno] Implementação Frontend First.",
        inputSchema: implementarHistoriaSchema,
        handler: (a) => implementarHistoria(a as any),
    },

    // ──── FLUXOS ALTERNATIVOS ────
    {
        name: "nova_feature",
        description: "[Interno] Fluxo de nova feature.",
        inputSchema: novaFeatureSchema,
        handler: (a) => novaFeature(a as any),
    },
    {
        name: "corrigir_bug",
        description: "[Interno] Fluxo de correção de bug.",
        inputSchema: corrigirBugSchema,
        handler: (a) => corrigirBug(a as any),
    },
    {
        name: "refatorar",
        description: "[Interno] Fluxo de refatoração.",
        inputSchema: refatorarSchema,
        handler: (a) => refatorar(a as any),
    },

    // ──── ANÁLISE LEGACY ────
    {
        name: "analisar_seguranca",
        description: "[Interno] Use 'analisar' com tipo='seguranca'.",
        inputSchema: analisarSegurancaSchema,
        handler: (a) => analisarSeguranca(a as any),
    },
    {
        name: "analisar_qualidade",
        description: "[Interno] Use 'analisar' com tipo='qualidade'.",
        inputSchema: analisarQualidadeSchema,
        handler: (a) => analisarQualidade(a as any),
    },
    {
        name: "analisar_performance",
        description: "[Interno] Use 'analisar' com tipo='performance'.",
        inputSchema: analisarPerformanceSchema,
        handler: (a) => analisarPerformance(a as any),
    },
    {
        name: "gerar_relatorio",
        description: "[Interno] Use 'analisar' com tipo='completo'.",
        inputSchema: gerarRelatorioSchema,
        handler: (a) => gerarRelatorio(a as any),
    },

    // ──── MEMÓRIA ────
    {
        name: "atualizar_codebase",
        description: "[Interno] Atualiza informações do codebase.",
        inputSchema: atualizarCodebaseSchema,
        handler: (a) => atualizarCodebase(a as any),
    },

    // ──── QUALIDADE ────
    {
        name: "avaliar_entregavel",
        description: "[Interno] Use 'validar' com tipo='entregavel'.",
        inputSchema: avaliarEntregavelSchema,
        handler: (a) => avaliarEntregavel(a as any),
    },

    // ──── INJEÇÃO DE CONTEÚDO ────
    {
        name: "injetar_conteudo",
        description: "Injeta conteúdo base (especialistas, templates, guias) no projeto. Use force:true para sobrescrever.",
        inputSchema: injetarConteudoSchema,
        handler: (a) => injetar_conteudo(a as any),
    },

    // ──── DISCOVERY ────
    {
        name: "discovery",
        description: "[Interno] Use 'avancar' para fluxo de onboarding.",
        inputSchema: discoverySchema,
        handler: (a) => discovery(a as any),
    },

    // ──── ONBOARDING OTIMIZADO ────
    {
        name: "onboarding_orchestrator",
        description: "[Interno] Use 'avancar' para fluxo de onboarding.",
        inputSchema: onboardingOrchestratorSchema,
        handler: (a) => onboardingOrchestrator(a as any),
    },
    {
        name: "brainstorm",
        description: "[Interno] Use 'avancar' para brainstorm.",
        inputSchema: brainstormSchema,
        handler: (a) => brainstorm(a as any),
    },
    {
        name: "prd_writer",
        description: "[Interno] Use 'avancar' para geração de PRD.",
        inputSchema: prdWriterSchema,
        handler: (a) => prdWriter(a as any),
    },
    {
        name: "next_steps_dashboard",
        description: "[Interno] Use 'maestro' para dashboard.",
        inputSchema: nextStepsDashboardSchema,
        handler: (a) => nextStepsDashboard(a as any),
    },

    // ──── KNOWLEDGE BASE ────
    {
        name: "record_adr",
        description: "Registra Architecture Decision Record.",
        inputSchema: recordADRSchema,
        handler: (a) => recordADR(a as any),
    },
    {
        name: "record_pattern",
        description: "Registra padrão identificado.",
        inputSchema: recordPatternSchema,
        handler: (a) => recordPattern(a as any),
    },
    {
        name: "get_context",
        description: "[Interno] Use 'contexto' como alternativa consolidada.",
        inputSchema: getContextSchema,
        handler: (a) => getContext(a as any),
    },
    {
        name: "search_knowledge",
        description: "Busca na base de conhecimento.",
        inputSchema: searchKnowledgeSchema,
        handler: (a) => searchKnowledge(a as any),
    },

    // ──── CHECKPOINT LEGACY ────
    {
        name: "create_checkpoint",
        description: "[Interno] Use 'checkpoint' com acao='criar'.",
        inputSchema: createCheckpointSchema,
        handler: (a) => createCheckpoint(a as any),
    },
    {
        name: "rollback_total",
        description: "[Interno] Use 'checkpoint' com acao='rollback'.",
        inputSchema: rollbackTotalSchema,
        handler: (a) => rollbackTotal(a as any),
    },
    {
        name: "rollback_partial",
        description: "[Interno] Use 'checkpoint' com acao='rollback_parcial'.",
        inputSchema: rollbackPartialSchema,
        handler: (a) => rollbackPartial(a as any),
    },
    {
        name: "list_checkpoints",
        description: "[Interno] Use 'checkpoint' com acao='listar'.",
        inputSchema: listCheckpointsSchema,
        handler: (a) => listCheckpoints(a as any),
    },

    // ──── VALIDATION LEGACY ────
    {
        name: "validate_dependencies",
        description: "[Interno] Use 'analisar' com tipo='dependencias'.",
        inputSchema: validateDependenciesSchema,
        handler: (a) => validateDependencies(a as any),
    },
    {
        name: "validate_security",
        description: "[Interno] Use 'analisar' com tipo='seguranca'.",
        inputSchema: validateSecuritySchema,
        handler: (a) => validateSecurity(a as any),
    },
    {
        name: "check_compliance",
        description: "[Interno] Use 'validar' com tipo='compliance'.",
        inputSchema: checkComplianceSchema,
        handler: (a) => checkCompliance(a as any),
    },

    // ──── MISC LEGACY ────
    {
        name: "evaluate_risk",
        description: "Avalia risco de uma operação.",
        inputSchema: evaluateRiskSchema,
        handler: (a) => evaluateRisk(a as any),
    },
    {
        name: "auto_fix",
        description: "Tenta corrigir automaticamente erros de código.",
        inputSchema: autoFixSchema,
        handler: (a) => autoFix(a as any),
    },
    {
        name: "discover_codebase",
        description: "Analisa codebase e detecta arquitetura/stack.",
        inputSchema: discoverCodebaseSchema,
        handler: (a) => discoverCodebase(a as any),
    },
];

// Mapa completo para lookup rápido (public + legacy)
const allToolsMap = new Map<string, ToolDefinition>();
for (const tool of publicTools) allToolsMap.set(tool.name, tool);
for (const tool of legacyTools) allToolsMap.set(tool.name, tool);

// === API PÚBLICA ===

/**
 * Executa uma tool pelo nome com os argumentos fornecidos.
 * Ponto ÚNICO de execução - usado por stdio.ts e index.ts.
 * Aceita TODAS as tools (public + legacy) para backward compatibility.
 */
// Mapa de redirecionamento para deprecation warnings
const legacyRedirects: Record<string, string> = {
    "proximo": "avancar",
    "setup_inicial": "maestro",
    "iniciar_projeto": "maestro",
    "carregar_projeto": "maestro",
    "validar_gate": "validar(tipo: 'gate')",
    "avaliar_entregavel": "validar(tipo: 'entregavel')",
    "check_compliance": "validar(tipo: 'compliance')",
    "analisar_seguranca": "analisar(tipo: 'seguranca')",
    "analisar_qualidade": "analisar(tipo: 'qualidade')",
    "analisar_performance": "analisar(tipo: 'performance')",
    "gerar_relatorio": "analisar(tipo: 'completo')",
    "validate_dependencies": "analisar(tipo: 'dependencias')",
    "validate_security": "analisar(tipo: 'seguranca')",
    "create_checkpoint": "checkpoint(acao: 'criar')",
    "rollback_total": "checkpoint(acao: 'rollback')",
    "rollback_partial": "checkpoint(acao: 'rollback_parcial')",
    "list_checkpoints": "checkpoint(acao: 'listar')",
    "get_context": "contexto",
    "onboarding_orchestrator": "avancar",
    "brainstorm": "avancar",
    "prd_writer": "avancar",
    "next_steps_dashboard": "maestro",
    "discovery": "avancar",
};

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
export function getRegisteredTools(): Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> {
    return publicTools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
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
