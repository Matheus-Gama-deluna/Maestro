import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * ADR Generator (Fase 2 - Melhoria #15)
 * Gera Architecture Decision Records automaticamente
 */
export class ADRGenerator {
    async generate(decision: ADRInput): Promise<string> {
        console.log('[ADRGenerator] Gerando ADR:', decision.title);

        const adr = this.formatADR(decision);
        await this.save(adr, decision.title);
        
        return adr;
    }

    private formatADR(decision: ADRInput): string {
        const date = new Date().toISOString().split('T')[0];
        const number = decision.number || 1;

        return `# ADR ${number}: ${decision.title}

**Data:** ${date}  
**Status:** ${decision.status || 'Proposto'}  
**Contexto:** ${decision.context}

## Decisão

${decision.decision}

## Consequências

### Positivas
${decision.consequences.positive.map(c => `- ${c}`).join('\n')}

### Negativas
${decision.consequences.negative.map(c => `- ${c}`).join('\n')}

## Alternativas Consideradas

${decision.alternatives.map(alt => `
### ${alt.name}
**Prós:** ${alt.pros.join(', ')}  
**Contras:** ${alt.cons.join(', ')}  
**Razão da rejeição:** ${alt.rejectionReason}
`).join('\n')}

## Referências

${decision.references?.map(ref => `- ${ref}`).join('\n') || 'N/A'}
`;
    }

    private async save(adr: string, title: string): Promise<void> {
        try {
            const adrDir = path.join(process.cwd(), '.maestro', 'adrs');
            await fs.mkdir(adrDir, { recursive: true });

            const filename = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}.md`;
            const filepath = path.join(adrDir, filename);

            await fs.writeFile(filepath, adr);
            console.log('[ADRGenerator] ADR salvo:', filepath);
        } catch (error) {
            console.error('[ADRGenerator] Erro ao salvar ADR:', error);
        }
    }
}

export interface ADRInput {
    number?: number;
    title: string;
    status?: string;
    context: string;
    decision: string;
    consequences: {
        positive: string[];
        negative: string[];
    };
    alternatives: Array<{
        name: string;
        pros: string[];
        cons: string[];
        rejectionReason: string;
    }>;
    references?: string[];
}
