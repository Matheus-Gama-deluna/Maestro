import { ATAMAnalyzer } from '../../core/atam/ATAMAnalyzer.js';
import { ATAMReporter } from '../../core/atam/ATAMReporter.js';

/**
 * MCP Tools para ATAM (Fase 3 - Melhoria #23)
 */

const analyzer = new ATAMAnalyzer();
const reporter = new ATAMReporter();

export const atamTools = {
    run_atam_session: {
        description: 'Executa sessão ATAM para análise de trade-offs arquiteturais',
        handler: async (args: { decision: string; scenarios?: string[] }) => {
            const session = await analyzer.createSession(args.decision, args.scenarios);
            await analyzer.analyzeTradeoffs(session.id);
            await analyzer.identifyRisks(session.id);
            await analyzer.generateRecommendations(session.id);
            await analyzer.completeSession(session.id);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(session, null, 2)
                }]
            };
        }
    },

    generate_atam_report: {
        description: 'Gera relatório completo de sessão ATAM',
        handler: async (args: { sessionId: string }) => {
            const session = analyzer.getSession(args.sessionId);
            if (!session) {
                return {
                    content: [{
                        type: 'text',
                        text: `Sessão não encontrada: ${args.sessionId}`
                    }]
                };
            }

            const report = await reporter.generateReport(session);
            const markdown = await reporter.exportMarkdown(report);

            return {
                content: [{
                    type: 'text',
                    text: markdown
                }]
            };
        }
    }
};
