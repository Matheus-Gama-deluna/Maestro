import type { StranglerMigration, MigrationPhase, CutoverMetrics } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Orquestrador Strangler Fig (Fase 3 - Melhoria #27)
 */
export class StranglerOrchestrator {
    private migrations: Map<string, StranglerMigration>;

    constructor() {
        this.migrations = new Map();
    }

    async planMigration(migration: Omit<StranglerMigration, 'id' | 'status'>): Promise<StranglerMigration> {
        const migrationId = `migration-${Date.now()}`;

        const fullMigration: StranglerMigration = {
            id: migrationId,
            ...migration,
            status: 'planned'
        };

        this.migrations.set(migrationId, fullMigration);
        await this.save(fullMigration);

        console.log('[StranglerOrchestrator] Migração planejada:', migrationId);

        return fullMigration;
    }

    async executePhase(migrationId: string, phaseId: string): Promise<void> {
        const migration = this.migrations.get(migrationId);
        if (!migration) {
            throw new Error(`Migração não encontrada: ${migrationId}`);
        }

        const phase = migration.phases.find(p => p.id === phaseId);
        if (!phase) {
            throw new Error(`Fase não encontrada: ${phaseId}`);
        }

        phase.status = 'in-progress';
        phase.startDate = new Date().toISOString();
        migration.status = 'in-progress';

        await this.save(migration);

        console.log('[StranglerOrchestrator] Fase iniciada:', phaseId);

        // Simular execução
        await new Promise(resolve => setTimeout(resolve, 100));

        phase.status = 'completed';
        phase.endDate = new Date().toISOString();

        await this.save(migration);

        console.log('[StranglerOrchestrator] Fase completada:', phaseId);
    }

    async monitorMetrics(migrationId: string): Promise<CutoverMetrics> {
        const migration = this.migrations.get(migrationId);
        if (!migration) {
            throw new Error(`Migração não encontrada: ${migrationId}`);
        }

        const metrics = migration.cutoverMetrics;

        // Verificar thresholds
        if (metrics.errorRate > metrics.thresholds.maxErrorRate) {
            console.warn('[StranglerOrchestrator] Taxa de erro acima do threshold!');
            await this.triggerRollback(migrationId, 'Error rate exceeded');
        }

        if (metrics.successRate < metrics.thresholds.minSuccessRate) {
            console.warn('[StranglerOrchestrator] Taxa de sucesso abaixo do threshold!');
            await this.triggerRollback(migrationId, 'Success rate too low');
        }

        return metrics;
    }

    async triggerRollback(migrationId: string, reason: string): Promise<void> {
        const migration = this.migrations.get(migrationId);
        if (!migration) {
            throw new Error(`Migração não encontrada: ${migrationId}`);
        }

        console.log('[StranglerOrchestrator] Iniciando rollback:', reason);

        migration.status = 'rolled-back';

        for (const step of migration.rollbackPlan.steps) {
            console.log(`[StranglerOrchestrator] Executando rollback step ${step.order}: ${step.description}`);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        await this.save(migration);

        console.log('[StranglerOrchestrator] Rollback completado');
    }

    private async save(migration: StranglerMigration): Promise<void> {
        try {
            const migrationsDir = path.join(process.cwd(), '.maestro', 'strangler', 'migrations');
            await fs.mkdir(migrationsDir, { recursive: true });

            const filepath = path.join(migrationsDir, `${migration.id}.json`);
            await fs.writeFile(filepath, JSON.stringify(migration, null, 2));
        } catch (error) {
            console.error('[StranglerOrchestrator] Erro ao salvar:', error);
        }
    }
}
