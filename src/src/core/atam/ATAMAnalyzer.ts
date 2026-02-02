import type { ATAMSession, QualityScenario, Tradeoff, Risk, Recommendation } from './types.js';
import { QualityScenarios } from './QualityScenarios.js';
import { RiskRegistry } from './RiskRegistry.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Analisador ATAM (Fase 3 - Melhoria #23)
 */
export class ATAMAnalyzer {
    private scenarios: QualityScenarios;
    private riskRegistry: RiskRegistry;
    private sessions: Map<string, ATAMSession>;

    constructor() {
        this.scenarios = new QualityScenarios();
        this.riskRegistry = new RiskRegistry();
        this.sessions = new Map();
    }

    async createSession(decision: string, selectedScenarios?: string[]): Promise<ATAMSession> {
        const sessionId = `atam-${Date.now()}`;
        
        let scenarios: QualityScenario[];
        if (selectedScenarios && selectedScenarios.length > 0) {
            scenarios = selectedScenarios
                .map(id => this.scenarios.getScenarioById(id))
                .filter(s => s !== undefined) as QualityScenario[];
        } else {
            scenarios = this.scenarios.getHighPriorityScenarios();
        }

        const session: ATAMSession = {
            id: sessionId,
            decision,
            timestamp: new Date().toISOString(),
            qualityAttributes: [...new Set(scenarios.map(s => s.attribute))],
            scenarios,
            tradeoffs: [],
            risks: [],
            mitigations: [],
            recommendations: [],
            status: 'planned'
        };

        this.sessions.set(sessionId, session);
        console.log('[ATAMAnalyzer] Sessão criada:', sessionId);

        return session;
    }

    async analyzeTradeoffs(sessionId: string): Promise<Tradeoff[]> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Sessão não encontrada: ${sessionId}`);
        }

        const tradeoffs: Tradeoff[] = [];
        const attributes = session.qualityAttributes;

        // Analisar trade-offs entre pares de atributos
        for (let i = 0; i < attributes.length; i++) {
            for (let j = i + 1; j < attributes.length; j++) {
                const tradeoff = this.identifyTradeoff(attributes[i], attributes[j], session);
                if (tradeoff) {
                    tradeoffs.push(tradeoff);
                }
            }
        }

        session.tradeoffs = tradeoffs;
        console.log('[ATAMAnalyzer] Trade-offs identificados:', tradeoffs.length);

        return tradeoffs;
    }

    private identifyTradeoff(attr1: string, attr2: string, session: ATAMSession): Tradeoff | null {
        // Trade-offs conhecidos
        const knownTradeoffs: Record<string, Record<string, Tradeoff>> = {
            performance: {
                security: {
                    id: `to-${Date.now()}`,
                    attribute1: 'performance',
                    attribute2: 'security',
                    description: 'Criptografia e validações aumentam latência',
                    impact: 'negative',
                    severity: 'medium'
                },
                maintainability: {
                    id: `to-${Date.now()}`,
                    attribute1: 'performance',
                    attribute2: 'maintainability',
                    description: 'Otimizações podem reduzir legibilidade do código',
                    impact: 'negative',
                    severity: 'low'
                }
            },
            scalability: {
                maintainability: {
                    id: `to-${Date.now()}`,
                    attribute1: 'scalability',
                    attribute2: 'maintainability',
                    description: 'Arquitetura distribuída aumenta complexidade',
                    impact: 'negative',
                    severity: 'medium'
                }
            }
        };

        return knownTradeoffs[attr1]?.[attr2] || knownTradeoffs[attr2]?.[attr1] || null;
    }

    async identifyRisks(sessionId: string): Promise<Risk[]> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Sessão não encontrada: ${sessionId}`);
        }

        const risks: Risk[] = [];

        // Identificar riscos baseados em cenários
        for (const scenario of session.scenarios) {
            if (scenario.priority === 'high' && !scenario.currentValue) {
                risks.push({
                    id: `risk-${Date.now()}-${scenario.id}`,
                    description: `Cenário crítico sem baseline: ${scenario.stimulus}`,
                    probability: 'medium',
                    impact: 'high',
                    category: scenario.attribute,
                    mitigations: [
                        'Estabelecer baseline de métricas',
                        'Implementar monitoramento contínuo'
                    ]
                });
            }
        }

        // Riscos de trade-offs
        for (const tradeoff of session.tradeoffs) {
            if (tradeoff.severity === 'high') {
                risks.push({
                    id: `risk-${Date.now()}-${tradeoff.id}`,
                    description: `Trade-off crítico: ${tradeoff.description}`,
                    probability: 'high',
                    impact: 'medium',
                    category: 'architecture',
                    mitigations: [
                        'Revisar decisão arquitetural',
                        'Considerar alternativas'
                    ]
                });
            }
        }

        session.risks = risks;
        
        // Registrar riscos
        for (const risk of risks) {
            this.riskRegistry.registerRisk(risk);
        }

        console.log('[ATAMAnalyzer] Riscos identificados:', risks.length);

        return risks;
    }

    async generateRecommendations(sessionId: string): Promise<Recommendation[]> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Sessão não encontrada: ${sessionId}`);
        }

        const recommendations: Recommendation[] = [];

        // Recomendações baseadas em riscos críticos
        const criticalRisks = session.risks.filter(r => 
            r.probability === 'high' && r.impact === 'high'
        );

        for (const risk of criticalRisks) {
            recommendations.push({
                id: `rec-${Date.now()}`,
                priority: 'high',
                description: `Mitigar risco crítico: ${risk.description}`,
                rationale: 'Risco de alta probabilidade e alto impacto',
                effort: 'high',
                impact: 'high'
            });
        }

        // Recomendações baseadas em cenários não atendidos
        for (const scenario of session.scenarios) {
            if (scenario.currentValue && scenario.targetValue) {
                if (scenario.currentValue < scenario.targetValue) {
                    recommendations.push({
                        id: `rec-${Date.now()}`,
                        priority: scenario.priority,
                        description: `Melhorar ${scenario.attribute}: ${scenario.metric}`,
                        rationale: `Gap entre atual (${scenario.currentValue}) e alvo (${scenario.targetValue})`,
                        effort: 'medium',
                        impact: 'medium'
                    });
                }
            }
        }

        session.recommendations = recommendations.map(r => r.description);

        console.log('[ATAMAnalyzer] Recomendações geradas:', recommendations.length);

        return recommendations;
    }

    async completeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Sessão não encontrada: ${sessionId}`);
        }

        session.status = 'completed';
        await this.saveSession(session);
        
        console.log('[ATAMAnalyzer] Sessão completada:', sessionId);
    }

    private async saveSession(session: ATAMSession): Promise<void> {
        try {
            const sessionsDir = path.join(process.cwd(), '.maestro', 'atam', 'sessions');
            await fs.mkdir(sessionsDir, { recursive: true });

            const filepath = path.join(sessionsDir, `${session.id}.json`);
            await fs.writeFile(filepath, JSON.stringify(session, null, 2));
            
            console.log('[ATAMAnalyzer] Sessão salva:', filepath);
        } catch (error) {
            console.error('[ATAMAnalyzer] Erro ao salvar sessão:', error);
        }
    }

    getSession(sessionId: string): ATAMSession | undefined {
        return this.sessions.get(sessionId);
    }
}
