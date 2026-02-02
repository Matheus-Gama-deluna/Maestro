import type { ConsistencyModel, ConsistencyRequirements, ConsistencyImplementation } from './types.js';

/**
 * Analisador de Consistência (Fase 3 - Melhoria #29)
 */
export class ConsistencyAnalyzer {
    analyzeRequirements(requirements: ConsistencyRequirements): ConsistencyModel {
        console.log('[ConsistencyAnalyzer] Analisando requisitos para:', requirements.contextId);

        const type = this.selectConsistencyType(requirements);
        const implementation = this.selectImplementation(type, requirements);

        const model: ConsistencyModel = {
            contextId: requirements.contextId,
            type,
            justification: this.generateJustification(type, requirements),
            implementation,
            tradeoffs: this.identifyTradeoffs(type),
            tests: []
        };

        console.log('[ConsistencyAnalyzer] Modelo selecionado:', type);

        return model;
    }

    private selectConsistencyType(req: ConsistencyRequirements): 'strong' | 'eventual' | 'causal' {
        const { criticality } = req.dataCharacteristics;
        const { availability } = req.sla;

        if (criticality === 'high' && availability >= 99.9) {
            return 'strong';
        }

        if (criticality === 'low' || availability < 99) {
            return 'eventual';
        }

        return 'causal';
    }

    private selectImplementation(type: string, req: ConsistencyRequirements): ConsistencyImplementation {
        const implementations: Record<string, ConsistencyImplementation> = {
            strong: {
                pattern: 'ACID',
                technology: ['PostgreSQL', 'MySQL'],
                configuration: { isolationLevel: 'SERIALIZABLE' },
                fallbackStrategy: 'Retry with exponential backoff'
            },
            eventual: {
                pattern: 'BASE',
                technology: ['Redis', 'Event Store'],
                configuration: { ttl: 300, maxRetries: 3 },
                fallbackStrategy: 'Eventual consistency with compensation'
            },
            causal: {
                pattern: 'Event-Sourcing',
                technology: ['EventStore', 'Kafka'],
                configuration: { retention: '7d' },
                fallbackStrategy: 'Replay events from snapshot'
            }
        };

        return implementations[type] || implementations.eventual;
    }

    private generateJustification(type: string, req: ConsistencyRequirements): string {
        const reasons: string[] = [];

        reasons.push(`Criticidade dos dados: ${req.dataCharacteristics.criticality}`);
        reasons.push(`SLA de disponibilidade: ${req.sla.availability}%`);
        reasons.push(`Volume de dados: ${req.dataCharacteristics.volume}`);

        return `Modelo ${type} selecionado baseado em: ${reasons.join('; ')}`;
    }

    private identifyTradeoffs(type: string): any[] {
        const tradeoffs: Record<string, any[]> = {
            strong: [
                { attribute: 'availability', impact: 'negative', description: 'Menor disponibilidade devido a locks' },
                { attribute: 'consistency', impact: 'positive', description: 'Garantia de consistência imediata' }
            ],
            eventual: [
                { attribute: 'availability', impact: 'positive', description: 'Alta disponibilidade' },
                { attribute: 'consistency', impact: 'negative', description: 'Consistência não imediata' }
            ],
            causal: [
                { attribute: 'complexity', impact: 'negative', description: 'Maior complexidade de implementação' },
                { attribute: 'auditability', impact: 'positive', description: 'Histórico completo de eventos' }
            ]
        };

        return tradeoffs[type] || [];
    }
}
