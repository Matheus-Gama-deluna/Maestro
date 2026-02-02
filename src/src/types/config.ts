export type OperationMode = 'economy' | 'balanced' | 'quality';

export type FlowType = 'principal' | 'feature' | 'bugfix' | 'refactor';

export interface OptimizationConfig {
    batch_questions: boolean;
    context_caching: boolean;
    template_compression: boolean;
    smart_validation: boolean;
    one_shot_generation: boolean;
    differential_updates: boolean;
}

export interface ModeConfig {
    mode: OperationMode;
    optimization: OptimizationConfig;
    prompts_per_phase: {
        min: number;
        max: number;
        target: number;
    };
    quality_threshold: number;
    auto_fix_enabled: boolean;
    checkpoint_frequency: 'always' | 'critical' | 'never';
}

export const MODE_CONFIGS: Record<OperationMode, ModeConfig> = {
    economy: {
        mode: 'economy',
        optimization: {
            batch_questions: true,
            context_caching: true,
            template_compression: true,
            smart_validation: true,
            one_shot_generation: true,
            differential_updates: true,
        },
        prompts_per_phase: {
            min: 2,
            max: 5,
            target: 3,
        },
        quality_threshold: 70,
        auto_fix_enabled: true,
        checkpoint_frequency: 'critical',
    },
    balanced: {
        mode: 'balanced',
        optimization: {
            batch_questions: true,
            context_caching: true,
            template_compression: false,
            smart_validation: true,
            one_shot_generation: true,
            differential_updates: true,
        },
        prompts_per_phase: {
            min: 4,
            max: 8,
            target: 6,
        },
        quality_threshold: 75,
        auto_fix_enabled: true,
        checkpoint_frequency: 'critical',
    },
    quality: {
        mode: 'quality',
        optimization: {
            batch_questions: false,
            context_caching: true,
            template_compression: false,
            smart_validation: false,
            one_shot_generation: false,
            differential_updates: false,
        },
        prompts_per_phase: {
            min: 8,
            max: 15,
            target: 10,
        },
        quality_threshold: 80,
        auto_fix_enabled: false,
        checkpoint_frequency: 'always',
    },
};

export interface FlowConfig {
    type: FlowType;
    name: string;
    description: string;
    phases: number[];
    required_tools: string[];
    optional_tools: string[];
    frontend_first: boolean;
    auto_checkpoint_phases: number[];
}

export const FLOW_CONFIGS: Record<FlowType, FlowConfig> = {
    principal: {
        type: 'principal',
        name: 'Fluxo Principal',
        description: 'Desenvolvimento completo de projeto (13 fases)',
        phases: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        required_tools: [
            'validar_gate',
            'proximo',
            'criar_checkpoint',
            'validar_seguranca',
            'run_atam_session',
            'gerar_contrato_api',
        ],
        optional_tools: [
            'create_roadmap',
            'detect_contexts',
            'plan_migration',
        ],
        frontend_first: true,
        auto_checkpoint_phases: [3, 6, 9, 10, 13],
    },
    feature: {
        type: 'feature',
        name: 'Fluxo de Feature',
        description: 'Desenvolvimento de nova funcionalidade',
        phases: [1, 2, 3, 4, 5],
        required_tools: [
            'discovery_codebase',
            'validar_gate',
            'gerar_contrato_api',
            'criar_checkpoint',
        ],
        optional_tools: [
            'detect_contexts',
            'validar_seguranca',
        ],
        frontend_first: true,
        auto_checkpoint_phases: [3, 5],
    },
    bugfix: {
        type: 'bugfix',
        name: 'Fluxo de Correção',
        description: 'Correção de bugs e problemas',
        phases: [1, 2, 3],
        required_tools: [
            'discovery_codebase',
            'auto_fix',
            'validar_gate',
            'criar_checkpoint',
        ],
        optional_tools: [
            'validar_seguranca',
        ],
        frontend_first: false,
        auto_checkpoint_phases: [3],
    },
    refactor: {
        type: 'refactor',
        name: 'Fluxo de Refatoração',
        description: 'Refatoração e melhoria de código',
        phases: [1, 2, 3, 4],
        required_tools: [
            'discovery_codebase',
            'detect_contexts',
            'validar_gate',
            'criar_checkpoint',
        ],
        optional_tools: [
            'run_atam_session',
            'plan_migration',
        ],
        frontend_first: false,
        auto_checkpoint_phases: [2, 4],
    },
};

export interface ProjectConfig {
    mode: OperationMode;
    flow: FlowType;
    optimization: OptimizationConfig;
    frontend_first: boolean;
    auto_checkpoint: boolean;
    auto_fix: boolean;
}

export function getDefaultConfig(flow: FlowType, mode: OperationMode): ProjectConfig {
    const flowConfig = FLOW_CONFIGS[flow];
    const modeConfig = MODE_CONFIGS[mode];

    return {
        mode,
        flow,
        optimization: modeConfig.optimization,
        frontend_first: flowConfig.frontend_first,
        auto_checkpoint: modeConfig.checkpoint_frequency !== 'never',
        auto_fix: modeConfig.auto_fix_enabled,
    };
}

export function getModeDescription(mode: OperationMode): string {
    switch (mode) {
        case 'economy':
            return '💰 Economy: ~70% menos prompts, ideal para POCs e protótipos';
        case 'balanced':
            return '⚖️ Balanced: ~45% menos prompts, ideal para projetos internos (padrão)';
        case 'quality':
            return '⭐ Quality: Máxima qualidade, ideal para produtos complexos';
    }
}

export function getFlowDescription(flow: FlowType): string {
    const config = FLOW_CONFIGS[flow];
    return `${config.name}: ${config.description} (${config.phases.length} fases)`;
}
