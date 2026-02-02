/**
 * Tipos para Fitness Functions e Arquitetura (Fase 2 - Melhoria #12)
 */

export interface ArchitectureRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    validate: (project: ProjectStructure) => { passed: boolean; violations: string[] };
    autoFix?: (project: ProjectStructure) => Promise<FixResult>;
}

export interface ProjectStructure {
    rootPath: string;
    files: FileInfo[];
    dependencies?: Record<string, string>;
}

export interface FileInfo {
    path: string;
    content: string;
    size: number;
}

export interface FitnessResult {
    overallPassed: boolean;
    results: RuleResult[];
    summary: string;
}

export interface RuleResult {
    ruleId: string;
    ruleName: string;
    severity: 'error' | 'warning' | 'info';
    passed: boolean;
    violations: string[];
}

export interface FixResult {
    success: boolean;
    changes: string[];
    message: string;
}
