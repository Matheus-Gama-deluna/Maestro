import { KnowledgeBase } from './KnowledgeBase.js';
import { KnowledgeEntry, Context } from './types.js';

export class ContextLoader {
    private kb: KnowledgeBase;

    constructor(projectDir: string) {
        this.kb = new KnowledgeBase(projectDir);
    }

    /**
     * Carrega contexto otimizado para uma fase específica
     */
    async loadForPhase(fase: number): Promise<Context> {
        const context = await this.kb.getRelevantContext(fase);

        // Comprimir contexto antigo (> 30 dias)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const compressOld = (entries: KnowledgeEntry[]) => {
            return entries.map(entry => {
                const entryTime = new Date(entry.metadata.timestamp).getTime();
                
                if (entryTime < thirtyDaysAgo) {
                    // Manter apenas metadados para contexto antigo
                    return {
                        ...entry,
                        content: `[Comprimido] ${entry.type} de ${new Date(entry.metadata.timestamp).toLocaleDateString()}`,
                    };
                }
                
                return entry;
            });
        };

        return {
            adrs: compressOld(context.adrs),
            patterns: compressOld(context.patterns),
            decisions: compressOld(context.decisions),
            metrics: context.metrics, // Métricas sempre completas
            summary: context.summary,
        };
    }

    /**
     * Carrega contexto completo (sem compressão)
     */
    async loadFull(fase?: number): Promise<Context> {
        return this.kb.getRelevantContext(fase || 0);
    }

    /**
     * Busca contexto por query
     */
    async searchContext(query: string): Promise<KnowledgeEntry[]> {
        return this.kb.search(query);
    }
}
