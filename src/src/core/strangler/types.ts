/**
 * Tipos para Strangler Fig Pattern (Fase 3 - Melhoria #27)
 */

export interface StranglerMigration {
    id: string;
    component: LegacyComponent;
    newComponent: ModernComponent;
    strategy: 'parallel' | 'incremental' | 'big-bang';
    phases: MigrationPhase[];
    cutoverMetrics: CutoverMetrics;
    rollbackPlan: RollbackPlan;
    status: 'planned' | 'in-progress' | 'completed' | 'rolled-back';
}

export interface LegacyComponent {
    id: string;
    name: string;
    path: string;
    dependencies: string[];
    metrics: ComponentMetrics;
}

export interface ModernComponent {
    id: string;
    name: string;
    path: string;
    technology: string;
    ready: boolean;
}

export interface MigrationPhase {
    id: string;
    name: string;
    description: string;
    percentage: number;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    startDate?: string;
    endDate?: string;
}

export interface CutoverMetrics {
    errorRate: number;
    latency: number;
    throughput: number;
    successRate: number;
    thresholds: MetricThresholds;
}

export interface MetricThresholds {
    maxErrorRate: number;
    maxLatency: number;
    minSuccessRate: number;
}

export interface RollbackPlan {
    trigger: RollbackTrigger[];
    steps: RollbackStep[];
    estimatedTime: number;
}

export interface RollbackTrigger {
    metric: string;
    threshold: number;
    action: 'alert' | 'auto-rollback';
}

export interface RollbackStep {
    order: number;
    description: string;
    automated: boolean;
}

export interface ComponentMetrics {
    linesOfCode: number;
    complexity: number;
    dependencies: number;
    testCoverage: number;
}
