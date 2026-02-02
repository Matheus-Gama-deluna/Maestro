/**
 * Tipos para Roadmap Arquitetural (Fase 3 - Melhoria #26)
 */

export interface ArchitecturalRoadmap {
    id: string;
    version: string;
    name: string;
    phases: Phase[];
    milestones: Milestone[];
    dependencies: Dependency[];
    metrics: RoadmapMetrics;
    createdAt: string;
    updatedAt: string;
}

export interface Phase {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'planned' | 'in-progress' | 'completed' | 'delayed';
    milestones: string[];
}

export interface Milestone {
    id: string;
    name: string;
    description: string;
    phase: string;
    targetDate: string;
    actualDate?: string;
    dependencies: string[];
    gates: Gate[];
    status: 'planned' | 'in-progress' | 'completed' | 'blocked';
    progress: number;
}

export interface Gate {
    id: string;
    name: string;
    criteria: GateCriteria[];
    status: 'pending' | 'passed' | 'failed';
}

export interface GateCriteria {
    id: string;
    description: string;
    metric: string;
    threshold: number;
    currentValue?: number;
    met: boolean;
}

export interface Dependency {
    from: string;
    to: string;
    type: 'blocks' | 'requires' | 'relates-to';
    description: string;
}

export interface RoadmapMetrics {
    totalPhases: number;
    completedPhases: number;
    totalMilestones: number;
    completedMilestones: number;
    overallProgress: number;
    onTrack: boolean;
}
