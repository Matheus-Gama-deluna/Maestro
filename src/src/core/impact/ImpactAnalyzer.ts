/**
 * Impact Analyzer (Fase 2 - Melhoria #22)
 * Analisa impacto de mudanças no código
 */
export class ImpactAnalyzer {
    async analyze(change: CodeChange): Promise<ImpactAnalysis> {
        console.log('[ImpactAnalyzer] Analisando impacto:', change.file);

        const affectedFiles = await this.findAffectedFiles(change);
        const riskLevel = this.assessRisk(affectedFiles.length);

        return {
            change,
            affectedFiles,
            riskLevel,
            recommendations: this.generateRecommendations(affectedFiles.length)
        };
    }

    private async findAffectedFiles(change: CodeChange): Promise<string[]> {
        // Simplificado: retorna lista vazia
        // Em produção, analisaria dependências
        return [];
    }

    private assessRisk(affectedCount: number): string {
        if (affectedCount === 0) return 'baixo';
        if (affectedCount < 5) return 'medio';
        if (affectedCount < 10) return 'alto';
        return 'critico';
    }

    private generateRecommendations(affectedCount: number): string[] {
        const recommendations: string[] = [];

        if (affectedCount > 5) {
            recommendations.push('Considere dividir a mudança em partes menores');
            recommendations.push('Execute testes de regressão completos');
        }

        if (affectedCount > 0) {
            recommendations.push('Revise arquivos afetados antes de commitar');
        }

        return recommendations;
    }
}

export interface CodeChange {
    file: string;
    type: 'add' | 'modify' | 'delete';
    lines: number;
}

export interface ImpactAnalysis {
    change: CodeChange;
    affectedFiles: string[];
    riskLevel: string;
    recommendations: string[];
}
