/**
 * Tipos para ATAM - Architecture Tradeoff Analysis Method (Fase 3 - Melhoria #23)
 */

export type QualityAttribute = 'performance' | 'security' | 'maintainability' | 'scalability' | 'availability' | 'usability';

export interface QualityScenario {
    id: string;
    attribute: QualityAttribute;
    stimulus: string;
    response: string;
    metric: string;
    priority: 'high' | 'medium' | 'low';
    currentValue?: number;
    targetValue?: number;
}

export interface Tradeoff {
    id: string;
    attribute1: QualityAttribute;
    attribute2: QualityAttribute;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    severity: 'high' | 'medium' | 'low';
}

export interface Risk {
    id: string;
    description: string;
    probability: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    category: string;
    mitigations: string[];
}

export interface Mitigation {
    id: string;
    riskId: string;
    strategy: string;
    cost: 'high' | 'medium' | 'low';
    effectiveness: 'high' | 'medium' | 'low';
    timeline: string;
}

export interface ATAMSession {
    id: string;
    decision: string;
    timestamp: string;
    qualityAttributes: QualityAttribute[];
    scenarios: QualityScenario[];
    tradeoffs: Tradeoff[];
    risks: Risk[];
    mitigations: Mitigation[];
    recommendations: string[];
    status: 'planned' | 'in-progress' | 'completed';
}

export interface ATAMReport {
    sessionId: string;
    decision: string;
    summary: string;
    qualityAnalysis: QualityAnalysis[];
    tradeoffMatrix: TradeoffMatrix;
    riskAssessment: RiskAssessment;
    recommendations: Recommendation[];
    nextSteps: string[];
}

export interface QualityAnalysis {
    attribute: QualityAttribute;
    scenarios: QualityScenario[];
    score: number;
    gaps: string[];
}

export interface TradeoffMatrix {
    attributes: QualityAttribute[];
    matrix: Record<string, Record<string, string>>;
}

export interface RiskAssessment {
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    criticalRisks: Risk[];
}

export interface Recommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    rationale: string;
    effort: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
}
