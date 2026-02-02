import { createHash } from 'crypto';
import type { OptimizationConfig } from '../types/config.js';

export interface CachedContext {
    content: string;
    hash: string;
    expires: number;
    size_bytes: number;
    hits: number;
}

export interface CacheStats {
    total_entries: number;
    total_size_bytes: number;
    hit_rate: number;
    total_hits: number;
    total_misses: number;
}

export class ContextCache {
    private cache: Map<string, CachedContext>;
    private enabled: boolean;
    private ttl_ms: number;
    private max_size_bytes: number;
    private stats: {
        hits: number;
        misses: number;
    };

    constructor(config: OptimizationConfig, ttl_hours: number = 1, max_size_mb: number = 50) {
        this.cache = new Map();
        this.enabled = config.context_caching;
        this.ttl_ms = ttl_hours * 60 * 60 * 1000;
        this.max_size_bytes = max_size_mb * 1024 * 1024;
        this.stats = { hits: 0, misses: 0 };
    }

    private hashContent(content: string): string {
        return createHash('sha256').update(content).digest('hex');
    }

    private isExpired(entry: CachedContext): boolean {
        return Date.now() > entry.expires;
    }

    private getTotalSize(): number {
        let total = 0;
        for (const entry of this.cache.values()) {
            total += entry.size_bytes;
        }
        return total;
    }

    private evictOldest(): void {
        let oldest: { key: string; expires: number } | null = null;

        for (const [key, entry] of this.cache.entries()) {
            if (!oldest || entry.expires < oldest.expires) {
                oldest = { key, expires: entry.expires };
            }
        }

        if (oldest) {
            this.cache.delete(oldest.key);
        }
    }

    get(key: string): string | null {
        if (!this.enabled) {
            return null;
        }

        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        entry.hits++;
        this.stats.hits++;
        return entry.content;
    }

    set(key: string, content: string): void {
        if (!this.enabled) {
            return;
        }

        const size_bytes = Buffer.byteLength(content, 'utf8');

        while (this.getTotalSize() + size_bytes > this.max_size_bytes) {
            this.evictOldest();
        }

        const entry: CachedContext = {
            content,
            hash: this.hashContent(content),
            expires: Date.now() + this.ttl_ms,
            size_bytes,
            hits: 0,
        };

        this.cache.set(key, entry);
    }

    has(key: string): boolean {
        if (!this.enabled) {
            return false;
        }

        const entry = this.cache.get(key);
        return entry !== undefined && !this.isExpired(entry);
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidatePattern(pattern: RegExp): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    clear(): void {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0 };
    }

    getStats(): CacheStats {
        const total_requests = this.stats.hits + this.stats.misses;
        const hit_rate = total_requests > 0 ? (this.stats.hits / total_requests) * 100 : 0;

        return {
            total_entries: this.cache.size,
            total_size_bytes: this.getTotalSize(),
            hit_rate,
            total_hits: this.stats.hits,
            total_misses: this.stats.misses,
        };
    }

    getEntry(key: string): CachedContext | null {
        const entry = this.cache.get(key);
        if (!entry || this.isExpired(entry)) {
            return null;
        }
        return entry;
    }

    prune(): number {
        let count = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }
}

export const globalCache = new ContextCache(
    { context_caching: true } as OptimizationConfig,
    1,
    50
);

export function getCachedEspecialista(nome: string): string | null {
    return globalCache.get(`especialista:${nome}`);
}

export function setCachedEspecialista(nome: string, content: string): void {
    globalCache.set(`especialista:${nome}`, content);
}

export function getCachedTemplate(nome: string): string | null {
    return globalCache.get(`template:${nome}`);
}

export function setCachedTemplate(nome: string, content: string): void {
    globalCache.set(`template:${nome}`, content);
}

export function getCachedEstado(diretorio: string): string | null {
    return globalCache.get(`estado:${diretorio}`);
}

export function setCachedEstado(diretorio: string, content: string): void {
    globalCache.set(`estado:${diretorio}`, content);
}

export function invalidateEstado(diretorio: string): void {
    globalCache.invalidate(`estado:${diretorio}`);
}
