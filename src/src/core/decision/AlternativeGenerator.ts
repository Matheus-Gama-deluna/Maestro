import type { Situation, Alternative } from './types.js';

/**
 * Gerador de Alternativas (Fase 2 - Melhoria #11)
 * 
 * Gera soluções alternativas quando:
 * - Confiança é baixa/média
 * - Múltiplas abordagens são possíveis
 * - Usuário precisa escolher
 */
export class AlternativeGenerator {
    /**
     * Gera alternativas para uma situação
     */
    async generate(situation: Situation): Promise<Alternative[]> {
        console.log('[AlternativeGenerator] Gerando alternativas para:', situation.operation);

        const alternatives: Alternative[] = [];

        // 1. Buscar soluções similares no histórico
        const historical = await this.findHistoricalSolutions(situation);
        alternatives.push(...historical);

        // 2. Buscar padrões conhecidos
        const patterns = await this.findMatchingPatterns(situation);
        alternatives.push(...patterns);

        // 3. Gerar novas alternativas baseadas em regras
        const generated = await this.generateFromRules(situation);
        alternatives.push(...generated);

        // Ordenar por score (melhor primeiro)
        const sorted = alternatives.sort((a, b) => b.score - a.score);

        // Retornar top 3
        return sorted.slice(0, 3);
    }

    /**
     * Busca soluções similares no histórico
     */
    private async findHistoricalSolutions(situation: Situation): Promise<Alternative[]> {
        const alternatives: Alternative[] = [];

        try {
            const fs = await import('fs/promises');
            const path = await import('path');

            const historyDir = path.join(process.cwd(), '.maestro', 'decisions', 'history');
            const files = await fs.readdir(historyDir);

            // Buscar decisões similares
            for (const file of files.slice(-20)) { // Últimas 20
                const filepath = path.join(historyDir, file);
                const content = await fs.readFile(filepath, 'utf-8');
                const decision = JSON.parse(content);

                // Se operação similar e foi bem-sucedida
                if (this.isSimilarOperation(decision.operation, situation.operation)) {
                    alternatives.push({
                        description: `Solução usada anteriormente: ${decision.operation}`,
                        approach: 'historical',
                        score: 0.8,
                        pros: ['Já testada com sucesso', 'Baixo risco'],
                        cons: ['Pode não ser ideal para contexto atual'],
                        estimatedRisk: 'baixo'
                    });
                }
            }
        } catch (error) {
            // Sem histórico ainda
        }

        return alternatives;
    }

    /**
     * Busca padrões conhecidos
     */
    private async findMatchingPatterns(situation: Situation): Promise<Alternative[]> {
        const alternatives: Alternative[] = [];

        // Padrões comuns de desenvolvimento
        const patterns = [
            {
                name: 'Abordagem Incremental',
                description: 'Implementar em pequenos passos com validação contínua',
                score: 0.75,
                pros: ['Menor risco', 'Fácil rollback', 'Validação constante'],
                cons: ['Mais lento', 'Requer mais iterações']
            },
            {
                name: 'Abordagem Direta',
                description: 'Implementar solução completa de uma vez',
                score: 0.6,
                pros: ['Mais rápido', 'Menos overhead'],
                cons: ['Maior risco', 'Difícil rollback']
            },
            {
                name: 'Prototipagem',
                description: 'Criar protótipo primeiro para validar abordagem',
                score: 0.7,
                pros: ['Valida conceito', 'Identifica problemas cedo'],
                cons: ['Requer refatoração posterior', 'Tempo adicional']
            }
        ];

        // Adicionar padrões relevantes
        for (const pattern of patterns) {
            alternatives.push({
                description: pattern.description,
                approach: pattern.name.toLowerCase().replace(/\s+/g, '-'),
                score: pattern.score,
                pros: pattern.pros,
                cons: pattern.cons,
                estimatedRisk: pattern.score > 0.7 ? 'baixo' : 'medio'
            });
        }

        return alternatives;
    }

    /**
     * Gera alternativas baseadas em regras
     */
    private async generateFromRules(situation: Situation): Promise<Alternative[]> {
        const alternatives: Alternative[] = [];

        // Regra 1: Se risco alto, sugerir abordagem conservadora
        if (situation.riskLevel === 'alto' || situation.riskLevel === 'critico') {
            alternatives.push({
                description: 'Abordagem conservadora com validação em cada etapa',
                approach: 'conservative',
                score: 0.85,
                pros: ['Máxima segurança', 'Validação contínua', 'Fácil rollback'],
                cons: ['Mais lento', 'Requer mais interação'],
                estimatedRisk: 'baixo'
            });
        }

        // Regra 2: Se contexto incompleto, sugerir coleta de informações
        if (!situation.context.hasFullContext) {
            alternatives.push({
                description: 'Coletar mais informações antes de prosseguir',
                approach: 'information-gathering',
                score: 0.7,
                pros: ['Decisão mais informada', 'Reduz risco'],
                cons: ['Demora adicional'],
                estimatedRisk: 'baixo'
            });
        }

        // Regra 3: Se operação nova, sugerir pesquisa
        if (situation.context.isNovelOperation) {
            alternatives.push({
                description: 'Pesquisar melhores práticas e exemplos similares',
                approach: 'research-first',
                score: 0.65,
                pros: ['Aprende com outros', 'Evita erros comuns'],
                cons: ['Tempo de pesquisa'],
                estimatedRisk: 'medio'
            });
        }

        return alternatives;
    }

    /**
     * Verifica se operações são similares
     */
    private isSimilarOperation(op1: string, op2: string): boolean {
        // Simplificado: compara prefixos
        const prefix1 = op1.split(':')[0];
        const prefix2 = op2.split(':')[0];
        return prefix1 === prefix2;
    }
}
