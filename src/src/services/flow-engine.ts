/**
 * Flow Engine — State Machine para Fluxos do Maestro
 * 
 * Codifica transições de fase como state machine declarativa.
 * Qualquer tool pode perguntar "qual o próximo passo?" ao flow engine.
 * Gera next_action automaticamente baseado no estado atual.
 */

import type { EstadoProjeto } from "../types/index.js";
import type { NextAction, FlowProgress, SpecialistPersona } from "../types/response.js";
import { getFaseComStitch } from "../flows/types.js";
import { getSpecialistPersona } from "./specialist.service.js";

/**
 * Estado do fluxo extraído do estado do projeto
 */
export interface FlowState {
    hasGlobalConfig: boolean;
    hasProject: boolean;
    currentPhase: string;
    faseNumero: number;
    totalFases: number;
    gatesValidados: number[];
    mode: 'economy' | 'balanced' | 'quality';
    discoveryStatus: string;
    brainstormStatus: string;
    prdStatus: string;
    aguardandoAprovacao: boolean;
    aguardandoClassificacao: boolean;
    wantsBrainstorm: boolean;
    nivel: string;
    usarStitch: boolean;
    diretorio: string;
}

/**
 * Resultado do flow engine: próximo passo recomendado
 */
export interface FlowStep {
    phase: string;
    tool: string;
    description: string;
    args_template: Record<string, unknown>;
    requires_user_input: boolean;
    user_prompt?: string;
    auto_execute?: boolean;
    specialist?: SpecialistPersona | null;
}

/**
 * Transição declarativa no flow
 */
interface FlowTransition {
    from: string;
    to: string;
    tool: string;
    description: string;
    condition?: (state: FlowState) => boolean;
    requires_user_input: boolean;
    user_prompt?: string;
    auto_execute?: boolean;
}

/**
 * Fluxo de onboarding (setup → discovery → brainstorm → PRD)
 */
const ONBOARDING_FLOW: FlowTransition[] = [
    {
        from: "none",
        to: "setup",
        tool: "setup_inicial",
        description: "Configurar preferências globais do Maestro",
        condition: (s) => !s.hasGlobalConfig,
        requires_user_input: true,
        user_prompt: "Vamos configurar suas preferências (IDE, modo, etc.)",
    },
    {
        from: "none",
        to: "iniciar",
        tool: "iniciar_projeto",
        description: "Iniciar um novo projeto",
        condition: (s) => s.hasGlobalConfig && !s.hasProject,
        requires_user_input: true,
        user_prompt: "Qual o nome e descrição do projeto?",
    },
    {
        from: "setup",
        to: "iniciar",
        tool: "iniciar_projeto",
        description: "Iniciar um novo projeto após configuração",
        requires_user_input: true,
        user_prompt: "Configuração concluída! Qual o nome e descrição do projeto?",
    },
    {
        from: "iniciar",
        to: "confirmar",
        tool: "confirmar_projeto",
        description: "Confirmar criação do projeto com tipo e complexidade",
        requires_user_input: true,
        user_prompt: "Confirme o tipo e complexidade do projeto.",
    },
    {
        from: "confirmar",
        to: "discovery",
        tool: "onboarding_orchestrator",
        description: "Iniciar discovery do projeto",
        requires_user_input: true,
        user_prompt: "Vamos coletar informações sobre o projeto em blocos.",
    },
    {
        from: "discovery_in_progress",
        to: "discovery_next_block",
        tool: "onboarding_orchestrator",
        description: "Responder próximo bloco do discovery",
        requires_user_input: true,
        user_prompt: "Responda as perguntas do próximo bloco de discovery.",
    },
    {
        from: "discovery_complete",
        to: "brainstorm",
        tool: "brainstorm",
        description: "Brainstorm exploratório para refinar ideias",
        condition: (s) => s.mode !== "economy" && s.wantsBrainstorm,
        requires_user_input: true,
        user_prompt: "Discovery completo! Deseja fazer um brainstorm para explorar ideias?",
    },
    {
        from: "discovery_complete",
        to: "prd",
        tool: "prd_writer",
        description: "Gerar PRD a partir do discovery",
        condition: (s) => s.mode === "economy" || !s.wantsBrainstorm,
        requires_user_input: false,
        auto_execute: true,
    },
    {
        from: "brainstorm_complete",
        to: "prd",
        tool: "prd_writer",
        description: "Gerar PRD a partir do discovery + brainstorm",
        requires_user_input: false,
        auto_execute: true,
    },
    {
        from: "prd_complete",
        to: "confirmar_classificacao",
        tool: "confirmar_classificacao",
        description: "Confirmar classificação do projeto baseada no PRD",
        requires_user_input: true,
        user_prompt: "PRD gerado! Confirme a classificação sugerida.",
    },
];

/**
 * Fluxo de desenvolvimento (fases pós-onboarding)
 */
const DEVELOPMENT_FLOW: FlowTransition[] = [
    {
        from: "aguardando_aprovacao",
        to: "aprovar_gate",
        tool: "aprovar_gate",
        description: "Projeto aguardando aprovação do usuário",
        requires_user_input: true,
        user_prompt: "O projeto está bloqueado. Deseja aprovar ou rejeitar?",
    },
    {
        from: "aguardando_classificacao",
        to: "confirmar_classificacao",
        tool: "confirmar_classificacao",
        description: "Confirmar classificação antes de avançar",
        requires_user_input: true,
        user_prompt: "Confirme a classificação do projeto.",
    },
    {
        from: "fase_ativa",
        to: "gerar_entregavel",
        tool: "proximo",
        description: "Gerar entregável da fase atual e avançar",
        requires_user_input: true,
        user_prompt: "Trabalhe com o especialista para gerar o entregável da fase.",
    },
    {
        from: "fase_concluida",
        to: "validar_gate",
        tool: "validar_gate",
        description: "Validar checklist de saída da fase",
        requires_user_input: false,
        auto_execute: true,
    },
    {
        from: "projeto_concluido",
        to: "status_final",
        tool: "status",
        description: "Projeto concluído! Ver status final",
        requires_user_input: false,
    },
];

/**
 * Extrai estado do fluxo a partir do estado do projeto
 */
export function getFlowState(estado: EstadoProjeto, diretorio: string): FlowState {
    const onboarding = (estado as any).onboarding;
    return {
        hasGlobalConfig: !!estado.config?.setup?.completed,
        hasProject: !!estado.projeto_id,
        currentPhase: determineCurrentPhase(estado),
        faseNumero: estado.fase_atual,
        totalFases: estado.total_fases,
        gatesValidados: estado.gates_validados || [],
        mode: (estado.config?.mode || "balanced") as 'economy' | 'balanced' | 'quality',
        discoveryStatus: onboarding?.discoveryStatus || "pending",
        brainstormStatus: onboarding?.brainstormStatus || "pending",
        prdStatus: onboarding?.prdStatus || "pending",
        aguardandoAprovacao: estado.aguardando_aprovacao || false,
        aguardandoClassificacao: estado.aguardando_classificacao || false,
        wantsBrainstorm: true,
        nivel: estado.nivel,
        usarStitch: estado.usar_stitch || false,
        diretorio,
    };
}

/**
 * Determina a fase atual com base no estado
 */
function determineCurrentPhase(estado: EstadoProjeto): string {
    if (estado.aguardando_aprovacao) return "aguardando_aprovacao";
    if (estado.aguardando_classificacao) return "aguardando_classificacao";

    const onboarding = (estado as any).onboarding;
    if (onboarding) {
        if (onboarding.discoveryStatus === "in_progress") return "discovery_in_progress";
        if (onboarding.discoveryStatus === "completed" && onboarding.brainstormStatus === "pending") return "discovery_complete";
        if (onboarding.brainstormStatus === "in_progress") return "brainstorm_in_progress";
        if (onboarding.brainstormStatus === "completed" && onboarding.prdStatus === "pending") return "brainstorm_complete";
        if (onboarding.prdStatus === "completed") return "prd_complete";
    }

    if (estado.fase_atual >= estado.total_fases && estado.gates_validados.includes(estado.total_fases)) {
        return "projeto_concluido";
    }

    return "fase_ativa";
}

/**
 * Obtém o próximo passo recomendado pelo flow engine
 */
export function getNextStep(estado: EstadoProjeto, diretorio: string): FlowStep {
    const flowState = getFlowState(estado, diretorio);
    const currentPhase = flowState.currentPhase;

    // Buscar em ambos os fluxos
    const allTransitions = [...ONBOARDING_FLOW, ...DEVELOPMENT_FLOW];
    const transition = allTransitions.find(
        (t) => t.from === currentPhase && (!t.condition || t.condition(flowState))
    );

    if (!transition) {
        // Fallback: retornar status
        return {
            phase: currentPhase,
            tool: "status",
            description: "Ver status atual do projeto",
            args_template: { estado_json: "{{estado_json}}", diretorio },
            requires_user_input: false,
        };
    }

    const faseInfo = getFaseComStitch(
        estado.nivel as any,
        estado.fase_atual,
        estado.usar_stitch
    );
    const specialist = faseInfo ? getSpecialistPersona(faseInfo.nome) : null;

    return {
        phase: transition.to,
        tool: transition.tool,
        description: transition.description,
        args_template: { estado_json: "{{estado_json}}", diretorio },
        requires_user_input: transition.requires_user_input,
        user_prompt: transition.user_prompt,
        auto_execute: transition.auto_execute,
        specialist,
    };
}

/**
 * Converte FlowStep em NextAction para resposta de tool
 */
export function flowStepToNextAction(step: FlowStep): NextAction {
    return {
        tool: step.tool,
        description: step.description,
        args_template: step.args_template,
        requires_user_input: step.requires_user_input,
        user_prompt: step.user_prompt,
        auto_execute: step.auto_execute,
    };
}

/**
 * Calcula progresso atual do fluxo
 */
export function getFlowProgress(estado: EstadoProjeto): FlowProgress {
    const faseInfo = getFaseComStitch(
        estado.nivel as any,
        estado.fase_atual,
        estado.usar_stitch
    );

    return {
        current_phase: faseInfo?.nome || `Fase ${estado.fase_atual}`,
        total_phases: estado.total_fases,
        completed_phases: estado.gates_validados?.length || 0,
        percentage: Math.round(((estado.gates_validados?.length || 0) / estado.total_fases) * 100),
    };
}

/**
 * Verifica se o projeto está no fluxo de onboarding
 */
export function isInOnboarding(estado: EstadoProjeto): boolean {
    const phase = determineCurrentPhase(estado);
    return [
        "none", "setup", "iniciar", "confirmar",
        "discovery", "discovery_in_progress", "discovery_next_block",
        "discovery_complete", "brainstorm", "brainstorm_in_progress",
        "brainstorm_complete", "prd", "prd_complete", "confirmar_classificacao",
    ].includes(phase);
}

/**
 * Lista todas as transições disponíveis a partir do estado atual
 */
export function getAvailableTransitions(estado: EstadoProjeto, diretorio: string): FlowTransition[] {
    const flowState = getFlowState(estado, diretorio);
    const allTransitions = [...ONBOARDING_FLOW, ...DEVELOPMENT_FLOW];
    return allTransitions.filter(
        (t) => t.from === flowState.currentPhase && (!t.condition || t.condition(flowState))
    );
}
