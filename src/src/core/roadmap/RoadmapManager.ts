import type { ArchitecturalRoadmap, Phase, Milestone, RoadmapMetrics } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Gerenciador de Roadmap Arquitetural (Fase 3 - Melhoria #26)
 */
export class RoadmapManager {
    private roadmaps: Map<string, ArchitecturalRoadmap>;

    constructor() {
        this.roadmaps = new Map();
    }

    async createRoadmap(name: string, phases: Phase[], milestones: Milestone[]): Promise<ArchitecturalRoadmap> {
        const roadmapId = `roadmap-${Date.now()}`;

        const roadmap: ArchitecturalRoadmap = {
            id: roadmapId,
            version: '1.0.0',
            name,
            phases,
            milestones,
            dependencies: [],
            metrics: this.calculateMetrics(phases, milestones),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.roadmaps.set(roadmapId, roadmap);
        await this.save(roadmap);

        console.log('[RoadmapManager] Roadmap criado:', roadmapId);

        return roadmap;
    }

    async updateMilestone(roadmapId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void> {
        const roadmap = this.roadmaps.get(roadmapId);
        if (!roadmap) {
            throw new Error(`Roadmap não encontrado: ${roadmapId}`);
        }

        const milestone = roadmap.milestones.find(m => m.id === milestoneId);
        if (!milestone) {
            throw new Error(`Milestone não encontrado: ${milestoneId}`);
        }

        Object.assign(milestone, updates);
        roadmap.updatedAt = new Date().toISOString();
        roadmap.metrics = this.calculateMetrics(roadmap.phases, roadmap.milestones);

        await this.save(roadmap);

        console.log('[RoadmapManager] Milestone atualizado:', milestoneId);
    }

    getProgress(roadmapId: string): RoadmapMetrics {
        const roadmap = this.roadmaps.get(roadmapId);
        if (!roadmap) {
            throw new Error(`Roadmap não encontrado: ${roadmapId}`);
        }

        return roadmap.metrics;
    }

    private calculateMetrics(phases: Phase[], milestones: Milestone[]): RoadmapMetrics {
        const completedPhases = phases.filter(p => p.status === 'completed').length;
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        const overallProgress = milestones.length > 0 
            ? (completedMilestones / milestones.length) * 100 
            : 0;

        const delayedPhases = phases.filter(p => p.status === 'delayed').length;
        const onTrack = delayedPhases === 0;

        return {
            totalPhases: phases.length,
            completedPhases,
            totalMilestones: milestones.length,
            completedMilestones,
            overallProgress,
            onTrack
        };
    }

    private async save(roadmap: ArchitecturalRoadmap): Promise<void> {
        try {
            const roadmapDir = path.join(process.cwd(), '.maestro', 'roadmap');
            await fs.mkdir(roadmapDir, { recursive: true });

            const filepath = path.join(roadmapDir, `${roadmap.id}.json`);
            await fs.writeFile(filepath, JSON.stringify(roadmap, null, 2));

            console.log('[RoadmapManager] Roadmap salvo:', filepath);
        } catch (error) {
            console.error('[RoadmapManager] Erro ao salvar:', error);
        }
    }
}
