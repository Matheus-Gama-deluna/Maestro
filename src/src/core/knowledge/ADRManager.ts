import { KnowledgeBase } from './KnowledgeBase.js';
import { KnowledgeEntry, ADRContent } from './types.js';

export class ADRManager {
    private kb: KnowledgeBase;

    constructor(projectDir: string) {
        this.kb = new KnowledgeBase(projectDir);
    }

    /**
     * Cria um novo ADR
     */
    async create(
        decision: string,
        context: string,
        alternatives: ADRContent['alternatives'],
        consequences: ADRContent['consequences'],
        fase: number,
        risks?: ADRContent['risks']
    ): Promise<string> {
        const id = `ADR-${String(Date.now()).slice(-6)}`;

        const entry: KnowledgeEntry = {
            id,
            type: 'adr',
            content: {
                decision,
                context,
                alternatives,
                consequences,
                risks,
            } as ADRContent,
            metadata: {
                fase,
                timestamp: new Date().toISOString(),
                tags: ['architecture', 'decision'],
                relevance: 1.0,
            },
        };

        await this.kb.record(entry);
        return id;
    }

    /**
     * Lista todos os ADRs
     */
    async list(): Promise<KnowledgeEntry[]> {
        return this.kb.listByType('adr');
    }

    /**
     * Obtém um ADR específico
     */
    async get(id: string): Promise<KnowledgeEntry | null> {
        return this.kb.getById(id, 'adr');
    }

    /**
     * Gera markdown de um ADR
     */
    async generateMarkdown(id: string): Promise<string> {
        const adr = await this.get(id);
        if (!adr) return '';

        const content = adr.content as ADRContent;
        const date = new Date(adr.metadata.timestamp).toLocaleDateString('pt-BR');

        let md = `# ${id}: ${content.decision}\n\n`;
        md += `**Data:** ${date}  \n`;
        md += `**Fase:** ${adr.metadata.fase}  \n`;
        md += `**Status:** Aceito\n\n`;

        md += `## Contexto\n\n${content.context}\n\n`;

        md += `## Decisão\n\n${content.decision}\n\n`;

        if (content.alternatives && content.alternatives.length > 0) {
            md += `## Alternativas Consideradas\n\n`;
            content.alternatives.forEach((alt, i) => {
                md += `### Alternativa ${i + 1}: ${alt.name}\n\n`;
                md += `**Prós:**\n${alt.pros.map(p => `- ${p}`).join('\n')}\n\n`;
                md += `**Contras:**\n${alt.cons.map(c => `- ${c}`).join('\n')}\n\n`;
                md += `**Score:** ${alt.score}/10\n\n`;
            });
        }

        md += `## Consequências\n\n`;
        md += `### Positivas\n${content.consequences.positive.map(p => `- ${p}`).join('\n')}\n\n`;
        md += `### Negativas\n${content.consequences.negative.map(n => `- ${n}`).join('\n')}\n\n`;

        if (content.risks && content.risks.length > 0) {
            md += `## Riscos e Mitigações\n\n`;
            md += `| Risco | Probabilidade | Impacto | Mitigação |\n`;
            md += `|-------|---------------|---------|----------|\n`;
            content.risks.forEach(risk => {
                md += `| ${risk.description} | ${risk.probability} | ${risk.impact} | ${risk.mitigation} |\n`;
            });
        }

        return md;
    }
}
