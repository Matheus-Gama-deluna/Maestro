/**
 * Router Centralizado do Maestro MCP
 * 
 * Ponto ÚNICO de roteamento para todas as tools.
 * Ambos entry points (stdio.ts e index.ts) usam este router.
 * Elimina divergência de parâmetros e tools entre entry points.
 */

import type { ToolResult } from "./types/index.js";

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

// === DEFINIÇÃO DE TOOL ===

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

// === REGISTRY ===

const toolRegistry: ToolDefinition[] = [
    // ──── ENTRY POINT INTELIGENTE ────
    {
        name: "maestro",
        description: "🎯 Entry point inteligente do Maestro. Detecta contexto do projeto automaticamente e guia o próximo passo. Use esta tool quando não souber qual tool usar — ela analisa o estado e recomenda a ação correta.",
        inputSchema: maestroToolSchema,
        handler: (a) => maestroTool(a as any),
    },

    // ──── CORE ────
    {
        name: "setup_inicial",
        description: "Salva configuração global única do usuário (IDE, modo, preferências). Evita múltiplos prompts em projetos futuros.",
        inputSchema: setupInicialSchema,
        handler: (a) => setupInicial(a as any),
    },
    {
        name: "iniciar_projeto",
        description: "Inicia um novo projeto com o Maestro. Retorna perguntas ou cria arquivos dependendo dos parâmetros. Requer diretorio.",
        inputSchema: iniciarProjetoSchema,
        handler: (a) => iniciarProjeto(a as any),
    },
    {
        name: "confirmar_projeto",
        description: "Confirma criação do projeto com tipo e complexidade. Injeta conteúdo automaticamente.",
        inputSchema: confirmarProjetoSchema,
        handler: (a) => confirmarProjeto(a as any),
    },
    {
        name: "confirmar_stitch",
        description: "Confirma se o projeto usará prototipagem com Google Stitch. Deve ser chamada após iniciar_projeto.",
        inputSchema: confirmarStitchSchema,
        handler: (a) => confirmarStitch(a as any),
    },
    {
        name: "carregar_projeto",
        description: "Carrega um projeto existente. Requer estado_json e diretorio.",
        inputSchema: carregarProjetoSchema,
        handler: (a) => carregarProjeto(a as any),
    },
    {
        name: "proximo",
        description: "Valida entregável e avança para próxima fase. Requer entregavel, estado_json e diretorio.",
        inputSchema: proximoSchema,
        handler: (a) => proximo(a as any),
    },
    {
        name: "status",
        description: "Retorna status completo do projeto. Requer estado_json e diretorio.",
        inputSchema: statusSchema,
        handler: (a) => status(a as any),
    },
    {
        name: "validar_gate",
        description: "Valida checklist de saída da fase. Requer estado_json e diretorio.",
        inputSchema: validarGateSchema,
        handler: (a) => validarGate(a as any),
    },
    {
        name: "aprovar_gate",
        description: "EXCLUSIVO DO USUÁRIO. Aprova ou rejeita avanço com pendências. IA NÃO deve chamar automaticamente.",
        inputSchema: { type: "object", properties: { acao: { type: "string", enum: ["aprovar", "rejeitar"] }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["acao", "estado_json", "diretorio"] },
        handler: (a) => aprovarGate(a as any),
    },

    // ──── V1.0 ────
    {
        name: "classificar",
        description: "Reclassifica complexidade do projeto. Requer estado_json e diretorio.",
        inputSchema: classificarSchema,
        handler: (a) => classificar(a as any),
    },
    {
        name: "contexto",
        description: "Retorna contexto acumulado do projeto. Requer estado_json e diretorio.",
        inputSchema: contextoSchema,
        handler: (a) => contexto(a as any),
    },
    {
        name: "salvar",
        description: "Salva conteúdo sem avançar de fase. Requer conteudo, tipo, estado_json e diretorio.",
        inputSchema: salvarSchema,
        handler: (a) => salvar(a as any),
    },
    {
        name: "confirmar_classificacao",
        description: "Confirma e efetiva a reclassificação após PRD. Requer estado_json e diretorio.",
        inputSchema: { type: "object", properties: { estado_json: { type: "string" }, diretorio: { type: "string" }, nivel: { type: "string", enum: ["simples", "medio", "complexo"] }, tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"] } }, required: ["estado_json", "diretorio"] },
        handler: (a) => confirmarClassificacao(a as any),
    },
    {
        name: "implementar_historia",
        description: "Orquestra implementação de história em blocos (Frontend First).",
        inputSchema: implementarHistoriaSchema,
        handler: (a) => implementarHistoria(a as any),
    },

    // ──── FLUXOS ALTERNATIVOS ────
    {
        name: "nova_feature",
        description: "Inicia fluxo de desenvolvimento de nova feature (6 fases).",
        inputSchema: novaFeatureSchema,
        handler: (a) => novaFeature(a as any),
    },
    {
        name: "corrigir_bug",
        description: "Inicia fluxo de correção de bug (5 fases).",
        inputSchema: corrigirBugSchema,
        handler: (a) => corrigirBug(a as any),
    },
    {
        name: "refatorar",
        description: "Inicia fluxo de refatoração de código legado (6 fases).",
        inputSchema: refatorarSchema,
        handler: (a) => refatorar(a as any),
    },

    // ──── ANÁLISE ────
    {
        name: "analisar_seguranca",
        description: "Analisa código em busca de vulnerabilidades OWASP Top 10.",
        inputSchema: analisarSegurancaSchema,
        handler: (a) => analisarSeguranca(a as any),
    },
    {
        name: "analisar_qualidade",
        description: "Analisa qualidade do código, complexidade e padrões.",
        inputSchema: analisarQualidadeSchema,
        handler: (a) => analisarQualidade(a as any),
    },
    {
        name: "analisar_performance",
        description: "Detecta problemas de performance e anti-patterns.",
        inputSchema: analisarPerformanceSchema,
        handler: (a) => analisarPerformance(a as any),
    },
    {
        name: "gerar_relatorio",
        description: "Gera relatório consolidado de todas as análises com score.",
        inputSchema: gerarRelatorioSchema,
        handler: (a) => gerarRelatorio(a as any),
    },

    // ──── MEMÓRIA ────
    {
        name: "atualizar_codebase",
        description: "Atualiza informações do codebase para memória do projeto.",
        inputSchema: atualizarCodebaseSchema,
        handler: (a) => atualizarCodebase(a as any),
    },

    // ──── QUALIDADE ────
    {
        name: "avaliar_entregavel",
        description: "Avalia qualidade do entregável com score e sugestões. Use antes de proximo().",
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
        description: "Coleta informações iniciais agrupadas para reduzir prompts. Retorna questionário ou salva respostas.",
        inputSchema: discoverySchema,
        handler: (a) => discovery(a as any),
    },

    // ──── ONBOARDING OTIMIZADO ────
    {
        name: "onboarding_orchestrator",
        description: "Orquestra fluxo de onboarding otimizado (discovery adaptativo → brainstorm → PRD). Reduz prompts e integra coleta de contexto.",
        inputSchema: onboardingOrchestratorSchema,
        handler: (a) => onboardingOrchestrator(a as any),
    },
    {
        name: "brainstorm",
        description: "Brainstorm assistido com prompts estruturados. Consolida respostas em insights para o PRD.",
        inputSchema: brainstormSchema,
        handler: (a) => brainstorm(a as any),
    },
    {
        name: "prd_writer",
        description: "Gera, valida e consolida PRD a partir do discovery e brainstorm. Calcula score de completude.",
        inputSchema: prdWriterSchema,
        handler: (a) => prdWriter(a as any),
    },
    {
        name: "next_steps_dashboard",
        description: "Apresenta dashboard consolidado com progresso, insights e próximas ações recomendadas.",
        inputSchema: nextStepsDashboardSchema,
        handler: (a) => nextStepsDashboard(a as any),
    },

    // ──── FASE 1: KNOWLEDGE BASE ────
    {
        name: "record_adr",
        description: "Registra Architecture Decision Record com decisão, contexto, alternativas e consequências",
        inputSchema: recordADRSchema,
        handler: (a) => recordADR(a as any),
    },
    {
        name: "record_pattern",
        description: "Registra padrão identificado com contexto, problema e solução",
        inputSchema: recordPatternSchema,
        handler: (a) => recordPattern(a as any),
    },
    {
        name: "get_context",
        description: "Retorna contexto relevante para fase específica (ADRs, padrões, decisões)",
        inputSchema: getContextSchema,
        handler: (a) => getContext(a as any),
    },
    {
        name: "search_knowledge",
        description: "Busca na base de conhecimento por query",
        inputSchema: searchKnowledgeSchema,
        handler: (a) => searchKnowledge(a as any),
    },

    // ──── FASE 1: CHECKPOINT ────
    {
        name: "create_checkpoint",
        description: "Cria checkpoint do projeto antes de mudanças arriscadas",
        inputSchema: createCheckpointSchema,
        handler: (a) => createCheckpoint(a as any),
    },
    {
        name: "rollback_total",
        description: "Rollback total para um checkpoint",
        inputSchema: rollbackTotalSchema,
        handler: (a) => rollbackTotal(a as any),
    },
    {
        name: "rollback_partial",
        description: "Rollback parcial (apenas módulos específicos)",
        inputSchema: rollbackPartialSchema,
        handler: (a) => rollbackPartial(a as any),
    },
    {
        name: "list_checkpoints",
        description: "Lista todos os checkpoints disponíveis",
        inputSchema: listCheckpointsSchema,
        handler: (a) => listCheckpoints(a as any),
    },

    // ──── FASE 1: VALIDATION ────
    {
        name: "validate_dependencies",
        description: "Valida dependências e detecta hallucinations",
        inputSchema: validateDependenciesSchema,
        handler: (a) => validateDependencies(a as any),
    },
    {
        name: "validate_security",
        description: "Valida segurança contra OWASP Top 10",
        inputSchema: validateSecuritySchema,
        handler: (a) => validateSecurity(a as any),
    },
    {
        name: "check_compliance",
        description: "Verifica compliance (LGPD, PCI-DSS, HIPAA)",
        inputSchema: checkComplianceSchema,
        handler: (a) => checkCompliance(a as any),
    },

    // ──── FASE 1: RISK, AUTOFIX, DISCOVERY ────
    {
        name: "evaluate_risk",
        description: "Avalia risco de uma operação",
        inputSchema: evaluateRiskSchema,
        handler: (a) => evaluateRisk(a as any),
    },
    {
        name: "auto_fix",
        description: "Tenta corrigir automaticamente erros de código",
        inputSchema: autoFixSchema,
        handler: (a) => autoFix(a as any),
    },
    {
        name: "discover_codebase",
        description: "Analisa codebase e detecta arquitetura/stack",
        inputSchema: discoverCodebaseSchema,
        handler: (a) => discoverCodebase(a as any),
    },
];

// === API PÚBLICA ===

/**
 * Executa uma tool pelo nome com os argumentos fornecidos.
 * Ponto ÚNICO de execução - usado por stdio.ts e index.ts.
 */
export async function routeToolCall(name: string, rawArgs: Record<string, unknown>): Promise<ToolResult> {
    const tool = toolRegistry.find(t => t.name === name);
    if (!tool) {
        return {
            content: [{ type: "text", text: `❌ Tool não encontrada: ${name}` }],
            isError: true,
        };
    }

    try {
        return await tool.handler(rawArgs);
    } catch (error) {
        return {
            content: [{ type: "text", text: `❌ Erro ao executar ${name}: ${String(error)}` }],
            isError: true,
        };
    }
}

/**
 * Retorna lista de todas as tools registradas no formato MCP.
 * Ponto ÚNICO de listagem - usado por stdio.ts e index.ts.
 */
export function getRegisteredTools(): Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> {
    return toolRegistry.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
    }));
}

/**
 * Retorna quantidade de tools registradas.
 */
export function getToolCount(): number {
    return toolRegistry.length;
}
