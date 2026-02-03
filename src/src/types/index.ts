// Níveis de complexidade do projeto
export type NivelComplexidade = "simples" | "medio" | "complexo";

// Tipos de fluxo
export type TipoFluxo = "novo_projeto" | "feature" | "bug" | "refatoracao";

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

    criado_em: string;
    atualizado_em: string;
}


// Fase do fluxo
export interface Fase {
    numero: number;
    nome: string;
    especialista: string;
    template: string;
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

// Tool result - compatible with MCP SDK
export interface ToolResult {
    [x: string]: unknown;
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError?: boolean;
    /** Files for the AI to save (stateless mode) */
    files?: Array<{
        path: string;
        content: string;
        encoding?: string;
    }>;
    /** Updated state JSON string */
    estado_atualizado?: string;
}

// Re-export response types
export { FileToSave, MaestroToolResult, createFileToSave, formatFilesInstruction } from "./response.js";
