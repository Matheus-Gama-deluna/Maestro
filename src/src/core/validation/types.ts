export interface ValidationResult {
    valid: boolean;
    score: number;
    issues: ValidationIssue[];
    summary: string;
}

export interface ValidationIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    file?: string;
    line?: number;
    suggestion?: string;
}

export interface DependencyInfo {
    name: string;
    version?: string;
    exists: boolean;
    registry?: string;
}

export interface SecurityVulnerability {
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    file: string;
    line: number;
    code: string;
    fix?: string;
}

export interface ComplianceCheck {
    standard: 'LGPD' | 'PCI-DSS' | 'HIPAA' | 'OWASP';
    passed: boolean;
    issues: string[];
}

// ===== FASE 2: Pipeline Multi-Camadas =====

export interface LayerValidationResult {
    layer: string;
    score: number;
    passed: boolean;
    issues: ValidationIssue[];
    suggestions: string[];
    timestamp: string;
}

export interface PipelineResult {
    overallScore: number;
    passed: boolean;
    results: LayerValidationResult[];
    recommendations: string[];
    tier: 'essencial' | 'base' | 'avancado';
    timestamp: string;
}

export interface ValidationLayer {
    name: string;
    order: number;
    minScore: number;
    validator: LayerValidator;
    stopOnFailure: boolean;
}

export interface LayerValidator {
    validate(code: string, context?: ValidationContext): Promise<LayerValidationResult>;
}

export interface ValidationContext {
    projectPath: string;
    fase?: number;
    tier?: 'essencial' | 'base' | 'avancado';
    codebase?: any;
}

export const TIER_SCORES = {
    essencial: {
        sintatica: 80,
        semantica: 60,
        qualidade: 50,
        arquitetura: 60,
        seguranca: 70
    },
    base: {
        sintatica: 80,
        semantica: 70,
        qualidade: 70,
        arquitetura: 80,
        seguranca: 90
    },
    avancado: {
        sintatica: 90,
        semantica: 80,
        qualidade: 80,
        arquitetura: 90,
        seguranca: 95
    }
} as const;

