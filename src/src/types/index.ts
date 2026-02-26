import type { NextAction, SpecialistPersona, FlowProgress } from "./response.js";

// Níveis de complexidade do projeto
export type NivelComplexidade = "simples" | "medio" | "complexo";

// Tipos de fluxo
export type TipoFluxo = "novo_projeto" | "feature" | "bug" | "refatoracao";

// Fonte de definição do projeto (v3.0 - onboarding)
export type ProjectDefinitionSource = "ja_definido" | "brainstorm" | "sandbox";

// Tipos de história (Frontend First)
export type TipoHistoria = "contrato" | "frontend" | "backend" | "integracao";

// Tipo de artefato - determina criticidade e formalidade
export type TipoArtefato = "poc" | "script" | "internal" | "product";

// Tier de gates - determina profundidade das validações
export type TierGate = "essencial" | "base" | "avancado";


// Estado do projeto
export interface EstadoProjeto {
    projeto_id: string;
    nome: string;
    diretorio: string;
    nivel: NivelComplexidade;
    tipo_artefato: TipoArtefato;           // Novo: tipo de artefato
    tier_gate: TierGate;                    // Novo: tier de validações
    classificacao_confirmada: boolean;      // Novo: se usuário confirmou tipo/complexidade
    ide?: 'windsurf' | 'cursor' | 'antigravity';  // IDE utilizada no projeto
    tipo_fluxo: TipoFluxo;
    status?: 'aguardando_prd' | 'ativo';
    fase_atual: number;
    total_fases: number;
    entregaveis: Record<string, string>;
    gates_validados: number[];
    usar_stitch: boolean;
    stitch_confirmado: boolean;  // Indica se usuário já respondeu sobre usar Stitch
    // Campos de proteção de gate
    aguardando_aprovacao: boolean;      // Flag de bloqueio - requer aprovação do usuário
    motivo_bloqueio?: string;           // Razão do bloqueio
    score_bloqueado?: number;           // Score que causou o bloqueio

    // Campos de confirmação de classificação
    aguardando_classificacao: boolean;      // Flag de bloqueio - requer confirmação de classificação pós-PRD
    classificacao_pos_prd_confirmada: boolean; // Flag indicando que checagem já foi feita
    classificacao_sugerida?: {              // Sugestão da IA para o usuário confirmar
        nivel: NivelComplexidade;
        pontuacao: number;
        criterios: string[];
    };

    // V6 Sprint 2: Estado compulsório — bloqueia tools durante correção de gate
    em_estado_compulsorio?: boolean;
    tools_permitidas_no_compulsorio?: string[];

    // Itens de validação salvos ao bloquear gate (score 50-69) para exibição na retomada
    itens_aprovados_bloqueio?: string[];
    itens_pendentes_bloqueio?: string[];

    // V6 Sprint 6: Classificação de tipo de fase para Smart Auto-Flow
    flow_phase_type?: 'input_required' | 'derived' | 'technical' | 'correction_loop';
    auto_flow_enabled?: boolean;

    // Inferência contextual (balanceada para evitar excesso de suposições)
    inferencia_contextual?: InferenciaContextual;

    // v6.0: Classificação progressiva (acumula sinais ao longo das fases)
    classificacao_progressiva?: ClassificacaoProgressiva;

    // v2.0: Configuração de modo e otimizações
    config?: {
        mode: 'economy' | 'balanced' | 'quality';
        flow: 'principal' | 'feature' | 'bugfix' | 'refactor';
        optimization: {
            batch_questions: boolean;
            context_caching: boolean;
            template_compression: boolean;
            smart_validation: boolean;
            one_shot_generation: boolean;
            differential_updates: boolean;
        };
        frontend_first: boolean;
        auto_checkpoint: boolean;
        auto_fix: boolean;
        /** v6.3 S1.2: Controla se brainstorm é sugerido. Padrão: false em economy, true nos demais. */
        wantsBrainstorm?: boolean;
        // v3.0: Novos campos de onboarding
        auto_flow?: boolean;  // Auto-avanço quando score >= 70
        onboarding?: {
            enabled: boolean;  // Se usa onboarding_orchestrator como caminho principal
            source: 'onboarding_v2' | 'legacy_discovery';
            project_definition_source?: 'ja_definido' | 'brainstorm' | 'sandbox';
        };
        setup?: {
            completed: boolean;
            decided_at: string;
            decided_by: 'user' | 'inferred' | 'mixed';
        };
    };

    // v2.0: Sistema de tarefas
    tasks?: Array<{
        id: string;
        type: 'epic' | 'feature' | 'story' | 'task' | 'subtask';
        title: string;
        description: string;
        status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done';
        priority: 'critical' | 'high' | 'medium' | 'low';
        parent_id?: string;
        children_ids: string[];
        dependencies: string[];
        phase?: number;
        estimate_hours?: number;
        actual_hours?: number;
        created_at: string;
        updated_at: string;
        tags: string[];
        metadata?: {
            files?: string[];
            commits?: string[];
            tests?: string[];
            acceptance_criteria?: string[];
        };
    }>;

    // v3.0: Onboarding otimizado
    onboarding?: import("./onboarding.js").OnboardingState;

    criado_em: string;
    atualizado_em: string;
}

export interface PerguntaPriorizada {
    pergunta: string;
    prioridade: 'critica' | 'importante' | 'opcional';
    pode_inferir: boolean;
    valor_inferido?: string;
    confianca_inferencia?: number;
}

export interface InferenciaContextual {
    dominio?: { nome: string; confianca: number };
    stack?: { frontend?: string; backend?: string; database?: string; confianca: number };
    perguntas_prioritarias?: PerguntaPriorizada[];
}

// v6.0: Classificação Progressiva
export interface SinalClassificacao {
    fase: number;
    fonte: string;          // "prd" | "requisitos" | "ux" | "arquitetura" | "usuario"
    categoria: string;      // "dominio" | "stack" | "integracao" | "seguranca" | "volume" | "equipe"
    valor: string;
    confianca: number;      // 0-1
    timestamp: string;
}

export interface ClassificacaoProgressiva {
    nivel_atual: NivelComplexidade;
    nivel_provisorio: boolean;      // true até confirmação definitiva na fase de arquitetura
    confianca_geral: number;        // 0-100
    sinais: SinalClassificacao[];
    historico_niveis: Array<{ fase: number; nivel: NivelComplexidade; motivo: string }>;
    fases_refinamento: number[];    // fases que refinam: [1, 2, 4] (simples) ou [1, 2, 5] (medio)
}


// Fase do fluxo
export interface Fase {
    numero: number;
    nome: string;
    especialista: string;
    template: string;
    skill?: string; // Nome da skill (ex: "specialist-gestao-produto")
    gate_checklist: string[];
    entregavel_esperado: string;
}

// Resultado de validação de gate
export interface GateResultado {
    valido: boolean;
    itens_validados: string[];
    itens_pendentes: string[];
    sugestoes: string[];
}

// Fluxo completo
export interface Fluxo {
    nivel: NivelComplexidade;
    total_fases: number;
    fases: Fase[];
}

// Resultado de classificação de complexidade
export interface ClassificacaoResultado {
    nivel: NivelComplexidade;
    pontuacao: number;
    criterios: string[];
}

// Resource info
export interface ResourceInfo {
    uri: string;
    name: string;
    mimeType: string;
    description?: string;
}

// Tool result - compatible with MCP SDK ServerResult
// v5.2: Index signature mantido para compatibilidade com ServerResult do SDK.
// Campos internos (_internal) são usados pelo middleware pipeline e NÃO vazam para o client.
// O middleware embedAllMetadata() embute next_action/progress/specialist no content textual.
export interface ToolResult {
    [x: string]: unknown;
    content: Array<{
        type: "text";
        text: string;
        annotations?: Record<string, unknown>;
    }>;
    isError?: boolean;
    /** Structured content para clients que suportam (protocol ≥ 2025-06-18) — campo MCP padrão */
    structuredContent?: { type: string; json: Record<string, unknown> };

    // === Campos INTERNOS (pipeline de middlewares) ===
    // Estes campos são consumidos pelos middlewares e NÃO são enviados ao client MCP.
    // O SDK do MCP ignora campos desconhecidos no retorno.

    /** @internal Files for persistence middleware to save */
    files?: Array<{ path: string; content: string; encoding?: string }>;
    /** @internal Updated state JSON — consumido por withPersistence */
    estado_atualizado?: string;
    /** @internal Next action — calculado por withFlowEngine, embutido no content por embedAllMetadata */
    next_action?: NextAction;
    /** @internal Specialist persona — calculado por withFlowEngine */
    specialist_persona?: SpecialistPersona;
    /** @internal Flow progress — calculado por withFlowEngine */
    progress?: FlowProgress;
}

// Re-export response types
export { FileToSave, MaestroToolResult, NextAction, SpecialistPersona, FlowProgress, createFileToSave, formatFilesInstruction } from "./response.js";
