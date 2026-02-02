import type { GrowthProjection, TimeSeriesProjection, CapacityAlert, ScalingRecommendation } from './types.js';

/**
 * Projetor de Crescimento (Fase 3 - Melhoria #30)
 */
export class GrowthProjector {
    async projectGrowth(metric: string, current: number, period: number = 12): Promise<GrowthProjection> {
        console.log('[GrowthProjector] Projetando crescimento:', metric);

        const projections = this.generateProjections(current, period);
        const alerts = this.generateAlerts(metric, current, projections);
        const recommendations = this.generateRecommendations(alerts);

        const projection: GrowthProjection = {
            metric,
            current,
            unit: this.getUnit(metric),
            projections,
            alerts,
            recommendations,
            generatedAt: new Date().toISOString()
        };

        console.log('[GrowthProjector] Projeção gerada com', projections.length, 'períodos');

        return projection;
    }

    private generateProjections(current: number, periods: number): TimeSeriesProjection[] {
        const projections: TimeSeriesProjection[] = [];
        const growthRate = 0.15; // 15% ao mês

        for (let i = 1; i <= periods; i++) {
            const value = current * Math.pow(1 + growthRate, i);
            const confidence = Math.max(0.5, 1 - (i * 0.05)); // Confiança diminui com o tempo

            projections.push({
                period: `+${i}m`,
                value: Math.round(value),
                confidence
            });
        }

        return projections;
    }

    private generateAlerts(metric: string, current: number, projections: TimeSeriesProjection[]): CapacityAlert[] {
        const alerts: CapacityAlert[] = [];
        const threshold = current * 2; // Alerta quando dobrar

        for (const proj of projections) {
            if (proj.value >= threshold) {
                alerts.push({
                    id: `alert-${Date.now()}`,
                    severity: proj.value >= threshold * 1.5 ? 'critical' : 'warning',
                    metric,
                    threshold,
                    projected: proj.value,
                    timeToThreshold: proj.period,
                    actions: [
                        'Revisar capacidade de infraestrutura',
                        'Planejar scaling',
                        'Otimizar recursos'
                    ]
                });
                break;
            }
        }

        return alerts;
    }

    private generateRecommendations(alerts: CapacityAlert[]): ScalingRecommendation[] {
        const recommendations: ScalingRecommendation[] = [];

        for (const alert of alerts) {
            if (alert.severity === 'critical') {
                recommendations.push({
                    id: `rec-${Date.now()}`,
                    type: 'horizontal',
                    description: 'Adicionar instâncias para distribuir carga',
                    estimatedCost: 'Médio',
                    estimatedImpact: 'Alto',
                    priority: 'high'
                });

                recommendations.push({
                    id: `rec-${Date.now()}-2`,
                    type: 'architectural',
                    description: 'Implementar caching para reduzir carga',
                    estimatedCost: 'Baixo',
                    estimatedImpact: 'Médio',
                    priority: 'high'
                });
            }
        }

        return recommendations;
    }

    private getUnit(metric: string): string {
        const units: Record<string, string> = {
            users: 'usuários',
            requests: 'req/s',
            storage: 'GB',
            memory: 'MB'
        };

        return units[metric] || 'unidades';
    }
}
