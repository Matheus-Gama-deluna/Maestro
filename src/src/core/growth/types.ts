/**
 * Tipos para Projeção de Crescimento (Fase 3 - Melhoria #30)
 */

export interface GrowthProjection {
    metric: string;
    current: number;
    unit: string;
    projections: TimeSeriesProjection[];
    alerts: CapacityAlert[];
    recommendations: ScalingRecommendation[];
    generatedAt: string;
}

export interface TimeSeriesProjection {
    period: string;
    value: number;
    confidence: number;
}

export interface CapacityAlert {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    metric: string;
    threshold: number;
    projected: number;
    timeToThreshold: string;
    actions: string[];
}

export interface ScalingRecommendation {
    id: string;
    type: 'horizontal' | 'vertical' | 'architectural';
    description: string;
    estimatedCost: string;
    estimatedImpact: string;
    priority: 'high' | 'medium' | 'low';
}

export interface GrowthModel {
    type: 'linear' | 'exponential' | 'logarithmic';
    parameters: Record<string, number>;
    accuracy: number;
}
