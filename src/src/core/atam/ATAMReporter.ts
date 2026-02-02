import type { ATAMSession, ATAMReport, QualityAnalysis, TradeoffMatrix, RiskAssessment } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Gerador de Relatórios ATAM (Fase 3 - Melhoria #23)
 */
export class ATAMReporter {
    async generateReport(session: ATAMSession): Promise<ATAMReport> {
        console.log('[ATAMReporter] Gerando relatório para sessão:', session.id);

        const qualityAnalysis = this.analyzeQuality(session);
        const tradeoffMatrix = this.buildTradeoffMatrix(session);
        const riskAssessment = this.assessRisks(session);
        const recommendations = this.prioritizeRecommendations(session);

        const report: ATAMReport = {
            sessionId: session.id,
            decision: session.decision,
            summary: this.generateSummary(session),
            qualityAnalysis,
            tradeoffMatrix,
            riskAssessment,
            recommendations,
            nextSteps: this.generateNextSteps(session)
        };

        await this.saveReport(report);

        return report;
    }

    private analyzeQuality(session: ATAMSession): QualityAnalysis[] {
        const analysis: QualityAnalysis[] = [];

        for (const attr of session.qualityAttributes) {
            const scenarios = session.scenarios.filter(s => s.attribute === attr);
            const gaps: string[] = [];
            let score = 100;

            for (const scenario of scenarios) {
                if (scenario.currentValue && scenario.targetValue) {
                    if (scenario.currentValue < scenario.targetValue) {
                        gaps.push(`${scenario.metric}: ${scenario.currentValue} < ${scenario.targetValue}`);
                        score -= 20;
                    }
                }
            }

            analysis.push({
                attribute: attr,
                scenarios,
                score: Math.max(0, score),
                gaps
            });
        }

        return analysis;
    }

    private buildTradeoffMatrix(session: ATAMSession): TradeoffMatrix {
        const attributes = session.qualityAttributes;
        const matrix: Record<string, Record<string, string>> = {};

        for (const attr1 of attributes) {
            matrix[attr1] = {};
            for (const attr2 of attributes) {
                if (attr1 === attr2) {
                    matrix[attr1][attr2] = '-';
                } else {
                    const tradeoff = session.tradeoffs.find(t => 
                        (t.attribute1 === attr1 && t.attribute2 === attr2) ||
                        (t.attribute1 === attr2 && t.attribute2 === attr1)
                    );
                    matrix[attr1][attr2] = tradeoff ? tradeoff.impact : 'neutral';
                }
            }
        }

        return {
            attributes,
            matrix
        };
    }

    private assessRisks(session: ATAMSession): RiskAssessment {
        const risks = session.risks;
        const highRisks = risks.filter(r => r.probability === 'high' || r.impact === 'high');
        const mediumRisks = risks.filter(r => 
            (r.probability === 'medium' || r.impact === 'medium') &&
            !(r.probability === 'high' || r.impact === 'high')
        );
        const lowRisks = risks.filter(r => r.probability === 'low' && r.impact === 'low');
        const criticalRisks = risks.filter(r => r.probability === 'high' && r.impact === 'high');

        return {
            totalRisks: risks.length,
            highRisks: highRisks.length,
            mediumRisks: mediumRisks.length,
            lowRisks: lowRisks.length,
            criticalRisks
        };
    }

    private prioritizeRecommendations(session: ATAMSession): any[] {
        // Simplificado - retorna recomendações como strings
        return session.recommendations.map((rec, idx) => ({
            id: `rec-${idx}`,
            priority: 'medium',
            description: rec,
            rationale: 'Baseado em análise ATAM',
            effort: 'medium',
            impact: 'medium'
        }));
    }

    private generateSummary(session: ATAMSession): string {
        const lines: string[] = [];
        
        lines.push(`Análise ATAM para: ${session.decision}`);
        lines.push(`Data: ${new Date(session.timestamp).toLocaleDateString()}`);
        lines.push(`Atributos de Qualidade: ${session.qualityAttributes.join(', ')}`);
        lines.push(`Cenários Avaliados: ${session.scenarios.length}`);
        lines.push(`Trade-offs Identificados: ${session.tradeoffs.length}`);
        lines.push(`Riscos Identificados: ${session.risks.length}`);
        lines.push(`Recomendações: ${session.recommendations.length}`);

        return lines.join('\n');
    }

    private generateNextSteps(session: ATAMSession): string[] {
        const steps: string[] = [];

        if (session.risks.length > 0) {
            steps.push('Revisar e priorizar riscos identificados');
            steps.push('Implementar mitigações para riscos críticos');
        }

        if (session.tradeoffs.length > 0) {
            steps.push('Documentar trade-offs em ADR');
            steps.push('Validar decisões com stakeholders');
        }

        steps.push('Estabelecer métricas de monitoramento');
        steps.push('Agendar revisão em 3 meses');

        return steps;
    }

    async exportMarkdown(report: ATAMReport): Promise<string> {
        const lines: string[] = [];

        lines.push(`# Relatório ATAM: ${report.decision}`);
        lines.push('');
        lines.push(`**Sessão:** ${report.sessionId}`);
        lines.push('');
        lines.push('## Sumário');
        lines.push('');
        lines.push(report.summary);
        lines.push('');
        
        lines.push('## Análise de Qualidade');
        lines.push('');
        for (const qa of report.qualityAnalysis) {
            lines.push(`### ${qa.attribute}`);
            lines.push(`**Score:** ${qa.score}/100`);
            if (qa.gaps.length > 0) {
                lines.push('**Gaps:**');
                qa.gaps.forEach(gap => lines.push(`- ${gap}`));
            }
            lines.push('');
        }

        lines.push('## Avaliação de Riscos');
        lines.push('');
        lines.push(`- **Total:** ${report.riskAssessment.totalRisks}`);
        lines.push(`- **Críticos:** ${report.riskAssessment.criticalRisks.length}`);
        lines.push(`- **Altos:** ${report.riskAssessment.highRisks}`);
        lines.push(`- **Médios:** ${report.riskAssessment.mediumRisks}`);
        lines.push('');

        lines.push('## Próximos Passos');
        lines.push('');
        report.nextSteps.forEach((step, idx) => {
            lines.push(`${idx + 1}. ${step}`);
        });
        lines.push('');

        return lines.join('\n');
    }

    private async saveReport(report: ATAMReport): Promise<void> {
        try {
            const reportsDir = path.join(process.cwd(), '.maestro', 'atam', 'reports');
            await fs.mkdir(reportsDir, { recursive: true });

            // JSON
            const jsonPath = path.join(reportsDir, `${report.sessionId}.json`);
            await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

            // Markdown
            const markdown = await this.exportMarkdown(report);
            const mdPath = path.join(reportsDir, `${report.sessionId}.md`);
            await fs.writeFile(mdPath, markdown);

            console.log('[ATAMReporter] Relatório salvo:', jsonPath);
        } catch (error) {
            console.error('[ATAMReporter] Erro ao salvar relatório:', error);
        }
    }
}
