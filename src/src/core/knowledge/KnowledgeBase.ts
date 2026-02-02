import { promises as fs } from 'fs';
import path from 'path';
import { KnowledgeEntry, Context } from './types.js';

export class KnowledgeBase {
    private baseDir: string;

    constructor(private projectDir: string) {
        this.baseDir = path.join(projectDir, '.maestro', 'knowledge');
    }

    /**
     * Registra uma entrada na base de conhecimento
     */
    async record(entry: KnowledgeEntry): Promise<void> {
        const typeDir = path.join(this.baseDir, `${entry.type}s`);
        await fs.mkdir(typeDir, { recursive: true });

        const filePath = path.join(typeDir, `${entry.id}.json`);
        await fs.writeFile(
            filePath,
            JSON.stringify(entry, null, 2),
            'utf-8'
        );
    }

    /**
     * Busca entradas por query (busca simples em tags e conteúdo)
     */
    async search(query: string): Promise<KnowledgeEntry[]> {
        const results: KnowledgeEntry[] = [];
        const types = ['adrs', 'patterns', 'decisions', 'metrics'];

        for (const type of types) {
            const typeDir = path.join(this.baseDir, type);
            
            try {
                const files = await fs.readdir(typeDir);
                
                for (const file of files) {
                    if (!file.endsWith('.json')) continue;
                    
                    const content = await fs.readFile(
                        path.join(typeDir, file),
                        'utf-8'
                    );
                    const entry: KnowledgeEntry = JSON.parse(content);
                    
                    // Busca simples em tags e conteúdo
                    const searchText = JSON.stringify(entry).toLowerCase();
                    if (searchText.includes(query.toLowerCase())) {
                        results.push(entry);
                    }
                }
            } catch (error) {
                // Diretório não existe ainda, continuar
                continue;
            }
        }

        return results;
    }

    /**
     * Retorna contexto relevante para uma fase específica
     */
    async getRelevantContext(fase: number): Promise<Context> {
        const adrs = await this.getEntriesByType('adr', fase);
        const patterns = await this.getEntriesByType('pattern', fase);
        const decisions = await this.getEntriesByType('decision', fase);
        const metrics = await this.getEntriesByType('metric', fase);

        // Priorizar por relevância e tempo
        const sortByRelevance = (entries: KnowledgeEntry[]) => {
            return entries.sort((a, b) => {
                // Peso temporal (mais recente = maior peso)
                const timeA = new Date(a.metadata.timestamp).getTime();
                const timeB = new Date(b.metadata.timestamp).getTime();
                const timeDiff = timeB - timeA;

                // Combinar com relevância
                const scoreA = a.metadata.relevance + (timeDiff > 0 ? 0.2 : 0);
                const scoreB = b.metadata.relevance + (timeDiff < 0 ? 0.2 : 0);

                return scoreB - scoreA;
            });
        };

        return {
            adrs: sortByRelevance(adrs).slice(0, 10), // Top 10
            patterns: sortByRelevance(patterns).slice(0, 10),
            decisions: sortByRelevance(decisions).slice(0, 20),
            metrics: sortByRelevance(metrics).slice(0, 10),
            summary: this.generateSummary(adrs, patterns, decisions, metrics),
        };
    }

    /**
     * Busca entradas por tipo e fase
     */
    private async getEntriesByType(
        type: 'adr' | 'pattern' | 'decision' | 'metric',
        fase?: number
    ): Promise<KnowledgeEntry[]> {
        const typeDir = path.join(this.baseDir, `${type}s`);
        const entries: KnowledgeEntry[] = [];

        try {
            const files = await fs.readdir(typeDir);

            for (const file of files) {
                if (!file.endsWith('.json')) continue;

                const content = await fs.readFile(
                    path.join(typeDir, file),
                    'utf-8'
                );
                const entry: KnowledgeEntry = JSON.parse(content);

                // Filtrar por fase se especificado
                if (fase === undefined || entry.metadata.fase === fase) {
                    entries.push(entry);
                }
            }
        } catch (error) {
            // Diretório não existe, retornar vazio
            return [];
        }

        return entries;
    }

    /**
     * Gera resumo do contexto
     */
    private generateSummary(
        adrs: KnowledgeEntry[],
        patterns: KnowledgeEntry[],
        decisions: KnowledgeEntry[],
        metrics: KnowledgeEntry[]
    ): string {
        const parts: string[] = [];

        if (adrs.length > 0) {
            parts.push(`${adrs.length} decisões arquiteturais registradas`);
        }

        if (patterns.length > 0) {
            parts.push(`${patterns.length} padrões identificados`);
        }

        if (decisions.length > 0) {
            parts.push(`${decisions.length} decisões técnicas`);
        }

        if (metrics.length > 0) {
            parts.push(`${metrics.length} métricas coletadas`);
        }

        return parts.length > 0
            ? parts.join(', ')
            : 'Nenhum conhecimento registrado ainda';
    }

    /**
     * Lista todas as entradas de um tipo
     */
    async listByType(type: 'adr' | 'pattern' | 'decision' | 'metric'): Promise<KnowledgeEntry[]> {
        return this.getEntriesByType(type);
    }

    /**
     * Obtém uma entrada específica por ID
     */
    async getById(id: string, type: 'adr' | 'pattern' | 'decision' | 'metric'): Promise<KnowledgeEntry | null> {
        const filePath = path.join(this.baseDir, `${type}s`, `${id}.json`);

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }
}
