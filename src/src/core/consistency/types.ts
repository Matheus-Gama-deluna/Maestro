/**
 * Tipos para Consistência por Contexto (Fase 3 - Melhoria #29)
 */

export interface ConsistencyModel {
    contextId: string;
    type: 'strong' | 'eventual' | 'causal';
    justification: string;
    implementation: ConsistencyImplementation;
    tradeoffs: ConsistencyTradeoff[];
    tests: ConsistencyTest[];
}

export interface ConsistencyImplementation {
    pattern: 'ACID' | 'BASE' | 'SAGA' | 'Event-Sourcing';
    technology: string[];
    configuration: Record<string, any>;
    fallbackStrategy: string;
}

export interface ConsistencyTradeoff {
    attribute: string;
    impact: 'positive' | 'negative';
    description: string;
}

export interface ConsistencyTest {
    id: string;
    name: string;
    scenario: string;
    expectedBehavior: string;
    passed: boolean;
}

export interface ConsistencyRequirements {
    contextId: string;
    sla: {
        availability: number;
        latency: number;
    };
    dataCharacteristics: {
        volume: 'low' | 'medium' | 'high';
        velocity: 'low' | 'medium' | 'high';
        criticality: 'low' | 'medium' | 'high';
    };
    businessRules: string[];
}
