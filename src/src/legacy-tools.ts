/**
 * Tools Legadas do Maestro MCP
 *
 * Estas tools são aceitas pelo router para backward compatibility,
 * mas NÃO são listadas para a IA. Cada chamada adiciona deprecation warning.
 *
 * Serão removidas completamente na v7.0.
 *
 * @deprecated v6.0 — Use as 5 tools públicas (maestro, executar, validar, analisar, contexto)
 */

import type { ToolResult } from "./types/index.js";
import { applyOrchestrationPipeline } from "./middleware/index.js";
import { withErrorHandling } from "./errors/index.js";

// === IMPORTS DE TOOLS LEGADAS ===

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

// v5: Tools consolidadas legacy
import { avancar, avancarSchema } from "./tools/consolidated/avancar.js";
import { checkpoint, checkpointSchema } from "./tools/consolidated/checkpoint-tool.js";

// === DEFINIÇÃO DE TOOL ===

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

// ============================================================
// LEGACY TOOLS — Aceitas no routeToolCall mas NÃO listadas
// Backward compatible com v4 e anteriores
// ============================================================

export const legacyTools: ToolDefinition[] = [
    // ──── v5.2 LEGACY (antes públicas, agora subsumidas por executar/maestro) ────
    {
        name: "avancar",
        description: "[v5.2 Legacy] Use 'executar' com acao='avancar'. Avança fase/onboarding.",
        inputSchema: avancarSchema,
        handler: applyOrchestrationPipeline("avancar", (a) => avancar(a as any)),
    },
    {
        name: "salvar",
        description: "[v5.2 Legacy] Use 'executar' com acao='salvar'. Salva conteúdo sem avançar.",
        inputSchema: salvarSchema,
        handler: applyOrchestrationPipeline("salvar", (a) => salvar(a as any)),
    },
    {
        name: "checkpoint",
        description: "[v5.2 Legacy] Use 'executar' com acao='checkpoint'. Gerencia checkpoints.",
        inputSchema: checkpointSchema,
        handler: applyOrchestrationPipeline("checkpoint", (a) => checkpoint(a as any)),
    },
    {
        name: "status",
        description: "[v5.2 Legacy] Use 'maestro' sem ação para obter status. Retorna status do projeto.",
        inputSchema: statusSchema,
        handler: applyOrchestrationPipeline("status", (a) => status(a as any)),
    },
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
        handler: applyOrchestrationPipeline("proximo", (a) => proximo(a as any)),
    },
    {
        name: "validar_gate",
        description: "[Interno] Valida gate. Use 'validar' como alternativa consolidada.",
        inputSchema: validarGateSchema,
        handler: withErrorHandling("validar_gate", (a) => validarGate(a as any)),
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
        handler: withErrorHandling("confirmar_classificacao", (a) => confirmarClassificacao(a as any)),
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
        handler: withErrorHandling("nova_feature", (a) => novaFeature(a as any)),
    },
    {
        name: "corrigir_bug",
        description: "[Interno] Fluxo de correção de bug.",
        inputSchema: corrigirBugSchema,
        handler: withErrorHandling("corrigir_bug", (a) => corrigirBug(a as any)),
    },
    {
        name: "refatorar",
        description: "[Interno] Fluxo de refatoração.",
        inputSchema: refatorarSchema,
        handler: withErrorHandling("refatorar", (a) => refatorar(a as any)),
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
        handler: withErrorHandling("onboarding_orchestrator", (a) => onboardingOrchestrator(a as any)),
    },
    {
        name: "brainstorm",
        description: "[Interno] Use 'avancar' para brainstorm.",
        inputSchema: brainstormSchema,
        handler: withErrorHandling("brainstorm", (a) => brainstorm(a as any)),
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

// ============================================================
// LEGACY REDIRECTS — Para deprecation warnings informativos
// ============================================================

export const legacyRedirects: Record<string, string> = {
    // v5.2: Tools consolidadas em executar
    "avancar": "executar(acao: 'avancar')",
    "salvar": "executar(acao: 'salvar')",
    "checkpoint": "executar(acao: 'checkpoint')",
    "status": "maestro",
    // v5.0 legacy
    "proximo": "executar(acao: 'avancar')",
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
    "create_checkpoint": "executar(acao: 'checkpoint', checkpoint_acao: 'criar')",
    "rollback_total": "executar(acao: 'checkpoint', checkpoint_acao: 'rollback')",
    "rollback_partial": "executar(acao: 'checkpoint', checkpoint_acao: 'rollback_parcial')",
    "list_checkpoints": "executar(acao: 'checkpoint', checkpoint_acao: 'listar')",
    "get_context": "contexto",
    "onboarding_orchestrator": "executar(acao: 'avancar')",
    "brainstorm": "executar(acao: 'avancar')",
    "prd_writer": "executar(acao: 'avancar')",
    "next_steps_dashboard": "maestro",
    "discovery": "executar(acao: 'avancar')",
};
