export interface KnowledgeEntry {
    id: string;
    type: 'adr' | 'pattern' | 'decision' | 'metric';
    content: any;
    metadata: {
        fase: number;
        timestamp: string;
        tags: string[];
        relevance: number;
    };
}

export interface ADRContent {
    decision: string;
    context: string;
    alternatives: Array<{
        name: string;
        pros: string[];
        cons: string[];
        score: number;
    }>;
    consequences: {
        positive: string[];
        negative: string[];
    };
    risks?: Array<{
        description: string;
        probability: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
        mitigation: string;
    }>;
}

export interface PatternContent {
    name: string;
    context: string;
    problem: string;
    solution: string;
    examples?: string[];
    relatedPatterns?: string[];
}

export interface DecisionContent {
    action: string;
    reason: string;
    alternatives?: string[];
    outcome?: string;
}

export interface MetricContent {
    name: string;
    value: number;
    unit: string;
    threshold?: number;
    trend?: 'improving' | 'stable' | 'degrading';
}

export interface Context {
    adrs: KnowledgeEntry[];
    patterns: KnowledgeEntry[];
    decisions: KnowledgeEntry[];
    metrics: KnowledgeEntry[];
    summary: string;
}
