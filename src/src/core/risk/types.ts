export interface RiskLevel {
    level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'DANGEROUS';
    score: number;
    factors: RiskFactor[];
}

export interface RiskFactor {
    name: string;
    weight: number;
    description: string;
}

export interface RiskDecision {
    id: string;
    timestamp: string;
    operation: string;
    riskLevel: RiskLevel;
    approved: boolean;
    justification?: string;
}
