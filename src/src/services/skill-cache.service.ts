/**
 * Cache de skills em memória para evitar re-leitura do filesystem.
 * 
 * TTL de 1 hora. Invalidação manual disponível.
 * 
 * @since v5.1.0 — Task 2.4 do Roadmap de Melhorias MCP
 */

interface CacheEntry {
    content: string;
    loadedAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hora

/**
 * Busca item no cache. Retorna null se não encontrado ou expirado.
 */
export function getCached(key: string, ttl: number = DEFAULT_TTL): string | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.loadedAt > ttl) {
        cache.delete(key);
        return null;
    }
    return entry.content;
}

/**
 * Armazena item no cache.
 */
export function setCache(key: string, content: string): void {
    cache.set(key, { content, loadedAt: Date.now() });
}

/**
 * Invalida entradas do cache que contenham o pattern.
 * Sem pattern = limpa tudo.
 */
export function invalidateCache(pattern?: string): void {
    if (!pattern) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
    }
}

/**
 * Retorna estatísticas do cache.
 */
export function getCacheStats(): { size: number; keys: string[] } {
    return { size: cache.size, keys: [...cache.keys()] };
}
