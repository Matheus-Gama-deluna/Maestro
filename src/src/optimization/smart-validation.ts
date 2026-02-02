import { createHash } from 'crypto';
import type { OptimizationConfig } from '../types/config.js';
import type { GateResultado } from '../types/index.js';

export interface ValidationCache {
    entregavel_hash: string;
    resultado: GateResultado;
    timestamp: number;
    fase: number;
}

export class SmartValidation {
    private cache: Map<string, ValidationCache>;
    private enabled: boolean;
    private ttl_ms: number;

    constructor(config: OptimizationConfig, ttl_minutes: number = 30) {
        this.cache = new Map();
        this.enabled = config.smart_validation;
        this.ttl_ms = ttl_minutes * 60 * 1000;
    }

    private hashContent(content: string): string {
        return createHash('sha256').update(content).digest('hex');
    }

    private isExpired(entry: ValidationCache): boolean {
        return Date.now() - entry.timestamp > this.ttl_ms;
    }

    getCached(fase: number, entregavel: string): GateResultado | null {
        if (!this.enabled) {
            return null;
        }

        const key = `fase-${fase}`;
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        const hash = this.hashContent(entregavel);
        if (entry.entregavel_hash !== hash) {
            return null;
        }

        return entry.resultado;
    }

    setCached(fase: number, entregavel: string, resultado: GateResultado): void {
        if (!this.enabled) {
            return;
        }

        const key = `fase-${fase}`;
        const entry: ValidationCache = {
            entregavel_hash: this.hashContent(entregavel),
            resultado,
            timestamp: Date.now(),
            fase,
        };

        this.cache.set(key, entry);
    }

    invalidate(fase: number): void {
        this.cache.delete(`fase-${fase}`);
    }

    clear(): void {
        this.cache.clear();
    }

    shouldValidateLayer(
        layer: 'estrutura' | 'checklist' | 'qualidade' | 'arquitetura' | 'seguranca',
        previousResults: Partial<Record<string, any>>
    ): boolean {
        if (!this.enabled) {
            return true;
        }

        switch (layer) {
            case 'estrutura':
                return true;

            case 'checklist':
                return previousResults.estrutura?.score >= 50;

            case 'qualidade':
                return (
                    previousResults.estrutura?.score >= 70 &&
                    previousResults.checklist?.score >= 70
                );

            case 'arquitetura':
                return (
                    previousResults.estrutura?.score >= 70 &&
                    previousResults.checklist?.score >= 70 &&
                    previousResults.qualidade?.score >= 70
                );

            case 'seguranca':
                return (
                    previousResults.estrutura?.score >= 70 &&
                    previousResults.checklist?.score >= 70 &&
                    previousResults.qualidade?.score >= 70 &&
                    previousResults.arquitetura?.score >= 70
                );

            default:
                return true;
        }
    }

    async validateIncremental(
        fase: number,
        entregavel: string,
        validators: {
            estrutura: () => Promise<any>;
            checklist: () => Promise<any>;
            qualidade: () => Promise<any>;
            arquitetura?: () => Promise<any>;
            seguranca?: () => Promise<any>;
        }
    ): Promise<{
        estrutura: any;
        checklist: any;
        qualidade: any | null;
        arquitetura: any | null;
        seguranca: any | null;
        layers_validated: number;
        layers_skipped: number;
    }> {
        const cached = this.getCached(fase, entregavel);
        if (cached) {
            return {
                estrutura: (cached as any).estrutura || {},
                checklist: (cached as any).checklist || {},
                qualidade: (cached as any).qualidade || null,
                arquitetura: (cached as any).arquitetura || null,
                seguranca: (cached as any).seguranca || null,
                layers_validated: 0,
                layers_skipped: 5,
            };
        }

        const results: any = {};
        let layers_validated = 0;
        let layers_skipped = 0;

        results.estrutura = await validators.estrutura();
        layers_validated++;

        if (!this.shouldValidateLayer('checklist', results)) {
            layers_skipped++;
            return { ...results, checklist: null, qualidade: null, arquitetura: null, seguranca: null, layers_validated, layers_skipped };
        }

        results.checklist = await validators.checklist();
        layers_validated++;

        if (!this.shouldValidateLayer('qualidade', results)) {
            layers_skipped++;
            return { ...results, qualidade: null, arquitetura: null, seguranca: null, layers_validated, layers_skipped };
        }

        results.qualidade = await validators.qualidade();
        layers_validated++;

        if (validators.arquitetura && this.shouldValidateLayer('arquitetura', results)) {
            results.arquitetura = await validators.arquitetura();
            layers_validated++;
        } else {
            results.arquitetura = null;
            layers_skipped++;
        }

        if (validators.seguranca && this.shouldValidateLayer('seguranca', results)) {
            results.seguranca = await validators.seguranca();
            layers_validated++;
        } else {
            results.seguranca = null;
            layers_skipped++;
        }

        return { ...results, layers_validated, layers_skipped };
    }

    getStats(): {
        cache_size: number;
        cache_hits: number;
        cache_misses: number;
    } {
        return {
            cache_size: this.cache.size,
            cache_hits: 0,
            cache_misses: 0,
        };
    }
}

export const globalValidationCache = new SmartValidation(
    { smart_validation: true } as OptimizationConfig,
    30
);
