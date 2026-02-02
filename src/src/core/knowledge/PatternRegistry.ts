import { KnowledgeBase } from './KnowledgeBase.js';
import { KnowledgeEntry, PatternContent } from './types.js';

export class PatternRegistry {
    private kb: KnowledgeBase;

    constructor(projectDir: string) {
        this.kb = new KnowledgeBase(projectDir);
    }

    /**
     * Registra um novo padrão
     */
    async register(
        name: string,
        context: string,
        problem: string,
        solution: string,
        fase: number,
        examples?: string[],
        relatedPatterns?: string[]
    ): Promise<string> {
        const id = `PATTERN-${String(Date.now()).slice(-6)}`;

        const entry: KnowledgeEntry = {
            id,
            type: 'pattern',
            content: {
                name,
                context,
                problem,
                solution,
                examples,
                relatedPatterns,
            } as PatternContent,
            metadata: {
                fase,
                timestamp: new Date().toISOString(),
                tags: ['pattern', name.toLowerCase().replace(/\s+/g, '-')],
                relevance: 0.8,
            },
        };

        await this.kb.record(entry);
        return id;
    }

    /**
     * Lista todos os padrões
     */
    async list(): Promise<KnowledgeEntry[]> {
        return this.kb.listByType('pattern');
    }

    /**
     * Obtém um padrão específico
     */
    async get(id: string): Promise<KnowledgeEntry | null> {
        return this.kb.getById(id, 'pattern');
    }

    /**
     * Busca padrões por nome
     */
    async searchByName(name: string): Promise<KnowledgeEntry[]> {
        const all = await this.list();
        return all.filter(p => {
            const content = p.content as PatternContent;
            return content.name.toLowerCase().includes(name.toLowerCase());
        });
    }
}
