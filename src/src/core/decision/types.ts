/**
 * Tipos para Motor de Decisões (Fase 2 - Melhoria #11)
 */

export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export type ActionType = 
    | 'auto_execute'      // 🤖 Executa sem perguntar
    | 'execute_notify'    // 🤖 Executa e notifica
    | 'suggest_approve'   // 💡 Sugere e aguarda
    | 'require_approval'  // ✋ Requer aprovação
    | 'human_only';       // 👤 Apenas humano

export interface Situation {
    operation: string;
    context: {
        fase: number;
        hasHistoricalMatch: boolean;
        matchesKnownPattern: boolean;
        isNovelOperation: boolean;
        hasFullContext: boolean;
    };
    riskLevel: RiskLevel;
}

export interface ActionDecision {
    action: ActionType;
    confidence: number;
    reasoning: string;
    alternatives?: Alternative[];
    requiresApproval: boolean;
}

export interface Alternative {
    description: string;
    approach: string;
    score: number;
    pros: string[];
    cons: string[];
    estimatedRisk: string;
}

export interface Decision {
    operation: string;
    action: ActionType;
    confidence: number;
    userOverride?: boolean;
    timestamp: string;
    outcome?: 'success' | 'failure';
}
