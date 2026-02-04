/**
 * Wrapper de Compatibilidade - Permite migração gradual do sistema antigo para o novo
 * 
 * Features principais:
 * - Mantém interface compatível com sistema legado
 * - Migração transparente para novo sistema
 * - Fallback automático em caso de problemas
 * - Logs de migração para monitoramento
 * 
 * @version 3.0.0
 */

import { IntelligentGateEngine, type IntelligentGateResult } from "./intelligent-gate-engine.js";
import type { GateResultado, Fase } from "../types/index.js";
import { validarGate as validarGateLegacy, formatarResultadoGate } from "./validator.js";

export interface MigrationConfig {
    enableNewSystem: boolean;
    fallbackOnError: boolean;
    logMigrationEvents: boolean;
    gradualRolloutPercentage: number; // 0-100
    phaseWhitelist?: string[]; // Fases que podem usar novo sistema
    userWhitelist?: string[]; // Usuários que podem usar novo sistema
}

export interface MigrationLog {
    timestamp: Date;
    phase: string;
    tier: string;
    systemUsed: 'legacy' | 'intelligent' | 'fallback';
    success: boolean;
    processingTimeMs: number;
    errorMessage?: string;
    userFeedback?: string;
}

/**
 * Wrapper que gerencia a transição entre sistema legado e inteligente
 */
export class CompatibilityWrapper {
    private intelligentEngine: IntelligentGateEngine;
    private migrationConfig: MigrationConfig;
    private migrationLogs: MigrationLog[] = [];

    constructor(config?: Partial<MigrationConfig>) {
        this.intelligentEngine = new IntelligentGateEngine();
        this.migrationConfig = {
            enableNewSystem: true,
            fallbackOnError: true,
            logMigrationEvents: true,
            gradualRolloutPercentage: 100,
            ...config
        };
    }

    /**
     * Valida gate mantendo compatibilidade com interface legada
     * Esta é a função principal chamada pelos tools existentes
     */
    public async validateGateCompatible(
        fase: Fase,
        entregavel: string,
        tier: 'essencial' | 'base' | 'avancado' = 'base',
        userId?: string
    ): Promise<{
        // Interface legada - mantida para compatibilidade
        legacyResult: GateResultado;
        legacyFormatted: string;
        
        // Novo sistema - informações adicionais
        intelligentResult?: IntelligentGateResult;
        systemUsed: 'legacy' | 'intelligent' | 'fallback';
        migrationRecommendation?: string;
    }> {
        const startTime = Date.now();
        let systemUsed: 'legacy' | 'intelligent' | 'fallback' = 'legacy';
        let intelligentResult: IntelligentGateResult | undefined;
        let legacyResult: GateResultado;
        let error: string | undefined;

        try {
            // Decide qual sistema usar
            const shouldUseIntelligentSystem = this.shouldUseIntelligentSystem(fase, userId);
            
            if (shouldUseIntelligentSystem) {
                // Tenta usar sistema inteligente
                systemUsed = 'intelligent';
                intelligentResult = await this.intelligentEngine.validateDeliverable(
                    entregavel,
                    fase,
                    tier,
                    this.inferProjectType(entregavel)
                );
                
                // Converte resultado inteligente para formato legado
                legacyResult = this.convertToLegacyResult(intelligentResult);
                
            } else {
                // Usa sistema legado
                systemUsed = 'legacy';
                legacyResult = validarGateLegacy(fase, entregavel, tier);
            }
            
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            
            if (this.migrationConfig.fallbackOnError && systemUsed === 'intelligent') {
                // Fallback para sistema legado
                systemUsed = 'fallback';
                legacyResult = validarGateLegacy(fase, entregavel, tier);
            } else {
                throw err;
            }
        }

        // Formata resultado legado
        const legacyFormatted = formatarResultadoGate(legacyResult);

        // Log da migração
        if (this.migrationConfig.logMigrationEvents) {
            this.logMigrationEvent({
                timestamp: new Date(),
                phase: fase.nome,
                tier,
                systemUsed,
                success: !error,
                processingTimeMs: Date.now() - startTime,
                errorMessage: error
            });
        }

        // Gera recomendação de migração
        const migrationRecommendation = this.generateMigrationRecommendation(
            systemUsed,
            intelligentResult,
            legacyResult,
            fase
        );

        return {
            legacyResult,
            legacyFormatted,
            intelligentResult,
            systemUsed,
            migrationRecommendation
        };
    }

    /**
     * Versão híbrida que mostra ambos os resultados para comparação
     */
    public async validateGateComparison(
        fase: Fase,
        entregavel: string,
        tier: 'essencial' | 'base' | 'avancado' = 'base'
    ): Promise<{
        legacyResult: GateResultado;
        intelligentResult: IntelligentGateResult;
        comparison: SystemComparison;
        recommendation: string;
    }> {
        const [legacyResult, intelligentResult] = await Promise.all([
            // Sistema legado
            Promise.resolve(validarGateLegacy(fase, entregavel, tier)),
            
            // Sistema inteligente
            this.intelligentEngine.validateDeliverable(
                entregavel,
                fase,
                tier,
                this.inferProjectType(entregavel)
            )
        ]);

        const comparison = this.compareResults(legacyResult, intelligentResult);
        const recommendation = this.generateComparisonRecommendation(comparison);

        return {
            legacyResult,
            intelligentResult,
            comparison,
            recommendation
        };
    }

    /**
     * Configuração de migração em tempo real
     */
    public updateMigrationConfig(newConfig: Partial<MigrationConfig>): void {
        this.migrationConfig = { ...this.migrationConfig, ...newConfig };
    }

    /**
     * Estatísticas de migração
     */
    public getMigrationStats(): {
        totalValidations: number;
        intelligentSystemUsage: number;
        fallbackRate: number;
        averageProcessingTime: { legacy: number; intelligent: number };
        successRate: { legacy: number; intelligent: number };
        userAdoptionTrends: Record<string, number>;
    } {
        const total = this.migrationLogs.length;
        const intelligentUsage = this.migrationLogs.filter(l => l.systemUsed === 'intelligent').length;
        const fallbacks = this.migrationLogs.filter(l => l.systemUsed === 'fallback').length;
        
        const legacyLogs = this.migrationLogs.filter(l => l.systemUsed === 'legacy');
        const intelligentLogs = this.migrationLogs.filter(l => l.systemUsed === 'intelligent');
        
        const avgLegacyTime = legacyLogs.length > 0 
            ? legacyLogs.reduce((sum, l) => sum + l.processingTimeMs, 0) / legacyLogs.length 
            : 0;
            
        const avgIntelligentTime = intelligentLogs.length > 0 
            ? intelligentLogs.reduce((sum, l) => sum + l.processingTimeMs, 0) / intelligentLogs.length 
            : 0;

        const legacySuccessRate = legacyLogs.length > 0
            ? legacyLogs.filter(l => l.success).length / legacyLogs.length
            : 0;
            
        const intelligentSuccessRate = intelligentLogs.length > 0
            ? intelligentLogs.filter(l => l.success).length / intelligentLogs.length
            : 0;

        return {
            totalValidations: total,
            intelligentSystemUsage: total > 0 ? intelligentUsage / total : 0,
            fallbackRate: intelligentUsage > 0 ? fallbacks / intelligentUsage : 0,
            averageProcessingTime: {
                legacy: Math.round(avgLegacyTime),
                intelligent: Math.round(avgIntelligentTime)
            },
            successRate: {
                legacy: Math.round(legacySuccessRate * 100) / 100,
                intelligent: Math.round(intelligentSuccessRate * 100) / 100
            },
            userAdoptionTrends: this.calculateAdoptionTrends()
        };
    }

    /**
     * Limpa logs antigos para gerenciar memória
     */
    public cleanupOldLogs(daysOld: number = 30): void {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        
        this.migrationLogs = this.migrationLogs.filter(log => log.timestamp > cutoff);
    }

    /**
     * Decide se deve usar sistema inteligente
     */
    private shouldUseIntelligentSystem(fase: Fase, userId?: string): boolean {
        if (!this.migrationConfig.enableNewSystem) return false;

        // Whitelist de fases
        if (this.migrationConfig.phaseWhitelist && 
            !this.migrationConfig.phaseWhitelist.includes(fase.nome)) {
            return false;
        }

        // Whitelist de usuários
        if (this.migrationConfig.userWhitelist && userId && 
            !this.migrationConfig.userWhitelist.includes(userId)) {
            return false;
        }

        // Rollout gradual
        const random = Math.random() * 100;
        return random <= this.migrationConfig.gradualRolloutPercentage;
    }

    /**
     * Converte resultado inteligente para formato legado
     */
    private convertToLegacyResult(intelligentResult: IntelligentGateResult): GateResultado {
        // Mapeia nível de maturidade para sistema binário legado
        const isValid = intelligentResult.canAdvance;
        
        // Extrai itens validados e pendentes das recomendações
        const recommendations = intelligentResult.validationResult.recommendations || [];
        const criticalRecommendations = recommendations.filter(r => r.type === 'critical');
        
        const validatedItems: string[] = [];
        const pendingItems: string[] = [];
        const suggestions: string[] = [];

        // Converte strengths em itens validados
        if (intelligentResult.maturityAssessment.strengths) {
            validatedItems.push(...intelligentResult.maturityAssessment.strengths);
        }

        // Converte recomendações críticas em itens pendentes
        criticalRecommendations.forEach(rec => {
            pendingItems.push(rec.title);
            suggestions.push(rec.description);
        });

        // Se não há itens específicos, usa avaliação geral
        if (validatedItems.length === 0 && pendingItems.length === 0) {
            if (isValid) {
                validatedItems.push(`Nível ${intelligentResult.maturityLevel} atingido`);
            } else {
                pendingItems.push('Melhorias necessárias para avanço');
                suggestions.push('Consulte as recomendações detalhadas do sistema inteligente');
            }
        }

        return {
            valido: isValid,
            itens_validados: validatedItems,
            itens_pendentes: pendingItems,
            sugestoes: suggestions
        };
    }

    /**
     * Infere tipo de projeto baseado no conteúdo
     */
    private inferProjectType(entregavel: string): 'poc' | 'internal' | 'product' | 'critical' {
        const content = entregavel.toLowerCase();
        
        if (content.includes('poc') || content.includes('prototipo') || content.includes('teste')) {
            return 'poc';
        }
        
        if (content.includes('critico') || content.includes('producao') || content.includes('mission')) {
            return 'critical';
        }
        
        if (content.includes('produto') || content.includes('cliente') || content.includes('user')) {
            return 'product';
        }
        
        return 'internal';
    }

    /**
     * Gera recomendação de migração
     */
    private generateMigrationRecommendation(
        systemUsed: 'legacy' | 'intelligent' | 'fallback',
        intelligentResult?: IntelligentGateResult,
        legacyResult?: GateResultado,
        fase?: Fase
    ): string {
        switch (systemUsed) {
            case 'intelligent':
                return `✨ **Novo Sistema Inteligente**: Validação avançada com nível ${intelligentResult?.maturityLevel} e ${intelligentResult?.validationResult.recommendations.length || 0} recomendações personalizadas.`;
            
            case 'fallback':
                return `⚠️ **Fallback Aplicado**: Sistema inteligente falhou, usando validação legada. Considere reportar o problema.`;
            
            case 'legacy':
                return `🔄 **Sistema Legado**: Considere habilitar o novo sistema inteligente para validações mais precisas e recomendações contextuais.`;
            
            default:
                return '';
        }
    }

    /**
     * Compara resultados dos dois sistemas
     */
    private compareResults(legacyResult: GateResultado, intelligentResult: IntelligentGateResult): SystemComparison {
        return {
            agreementLevel: this.calculateAgreementLevel(legacyResult, intelligentResult),
            scoreComparison: {
                legacy: this.calculateLegacyScore(legacyResult),
                intelligent: intelligentResult.overallScore
            },
            validationComparison: {
                legacy: legacyResult.valido,
                intelligent: intelligentResult.canAdvance
            },
            recommendationCount: {
                legacy: legacyResult.sugestoes.length,
                intelligent: intelligentResult.validationResult.recommendations.length
            },
            advantages: {
                legacy: this.identifyLegacyAdvantages(legacyResult, intelligentResult),
                intelligent: this.identifyIntelligentAdvantages(intelligentResult, legacyResult)
            }
        };
    }

    /**
     * Gera recomendação baseada na comparação
     */
    private generateComparisonRecommendation(comparison: SystemComparison): string {
        const agreement = comparison.agreementLevel;
        
        if (agreement > 0.8) {
            return `✅ **Alta Concordância** (${Math.round(agreement * 100)}%): Ambos os sistemas chegaram a conclusões similares. O sistema inteligente oferece ${comparison.recommendationCount.intelligent - comparison.recommendationCount.legacy} recomendações adicionais.`;
        } else if (agreement > 0.6) {
            return `🤔 **Concordância Moderada** (${Math.round(agreement * 100)}%): Há algumas diferenças entre os sistemas. Recomenda-se revisar as justificativas do sistema inteligente.`;
        } else {
            return `⚠️ **Baixa Concordância** (${Math.round(agreement * 100)}%): Resultados significativamente diferentes. Recomenda-se análise manual ou consulta a especialista.`;
        }
    }

    /**
     * Log de evento de migração
     */
    private logMigrationEvent(log: MigrationLog): void {
        this.migrationLogs.push(log);
        
        // Mantém apenas os últimos 1000 logs para gerenciar memória
        if (this.migrationLogs.length > 1000) {
            this.migrationLogs = this.migrationLogs.slice(-1000);
        }
    }

    // Métodos auxiliares
    private calculateAgreementLevel(legacyResult: GateResultado, intelligentResult: IntelligentGateResult): number {
        // Compara decisão de avanço (peso maior)
        const advanceAgreement = legacyResult.valido === intelligentResult.canAdvance ? 0.6 : 0;
        
        // Compara número de problemas encontrados (peso menor)
        const legacyIssues = legacyResult.itens_pendentes.length;
        const intelligentIssues = intelligentResult.validationResult.blockers.length + 
                                  intelligentResult.validationResult.warnings.length;
        
        const issuesAgreement = Math.abs(legacyIssues - intelligentIssues) <= 2 ? 0.3 : 0.1;
        
        // Compara quantidade de sugestões (peso menor)
        const suggestionDiff = Math.abs(legacyResult.sugestoes.length - intelligentResult.validationResult.recommendations.length);
        const suggestionsAgreement = suggestionDiff <= 3 ? 0.1 : 0;
        
        return advanceAgreement + issuesAgreement + suggestionsAgreement;
    }

    private calculateLegacyScore(legacyResult: GateResultado): number {
        const totalItems = legacyResult.itens_validados.length + legacyResult.itens_pendentes.length;
        if (totalItems === 0) return legacyResult.valido ? 70 : 30;
        
        return Math.round((legacyResult.itens_validados.length / totalItems) * 100);
    }

    private identifyLegacyAdvantages(legacyResult: GateResultado, intelligentResult: IntelligentGateResult): string[] {
        const advantages: string[] = [];
        
        if (legacyResult.sugestoes.length < intelligentResult.validationResult.recommendations.length / 2) {
            advantages.push('Mais conciso e direto');
        }
        
        advantages.push('Sistema estável e testado');
        advantages.push('Processamento mais rápido');
        
        return advantages;
    }

    private identifyIntelligentAdvantages(intelligentResult: IntelligentGateResult, legacyResult: GateResultado): string[] {
        const advantages: string[] = [
            `Análise em ${intelligentResult.maturityLevel} níveis de maturidade`,
            'Recomendações contextuais e prioritizadas',
            'Score adaptativo baseado no tipo de projeto'
        ];
        
        if (intelligentResult.validationResult.recommendations.length > legacyResult.sugestoes.length) {
            advantages.push(`${intelligentResult.validationResult.recommendations.length - legacyResult.sugestoes.length} recomendações adicionais`);
        }
        
        if (intelligentResult.confidenceLevel > 80) {
            advantages.push('Alta confiabilidade na avaliação');
        }
        
        return advantages;
    }

    private calculateAdoptionTrends(): Record<string, number> {
        // Calcula tendências de adoção por fase
        const trends: Record<string, number> = {};
        
        for (const log of this.migrationLogs) {
            if (!trends[log.phase]) trends[log.phase] = 0;
            if (log.systemUsed === 'intelligent') trends[log.phase]++;
        }
        
        // Converte para percentuais
        const phaseCounts: Record<string, number> = {};
        for (const log of this.migrationLogs) {
            phaseCounts[log.phase] = (phaseCounts[log.phase] || 0) + 1;
        }
        
        for (const phase in trends) {
            trends[phase] = phaseCounts[phase] > 0 ? trends[phase] / phaseCounts[phase] : 0;
        }
        
        return trends;
    }
}

// Interfaces auxiliares
interface SystemComparison {
    agreementLevel: number; // 0-1
    scoreComparison: {
        legacy: number;
        intelligent: number;
    };
    validationComparison: {
        legacy: boolean;
        intelligent: boolean;
    };
    recommendationCount: {
        legacy: number;
        intelligent: number;
    };
    advantages: {
        legacy: string[];
        intelligent: string[];
    };
}
