/**
 * Sistema de Scoring Adaptativo - Substitui scores fixos por dinâmicos
 * 
 * Features principais:
 * - Pesos dinâmicos baseados em contexto
 * - Thresholds adaptativos por projeto
 * - Score multi-dimensional
 * - Aprendizado com histórico de projetos
 * 
 * @version 3.0.0
 */

import type { ValidationContext, CompletenessAnalysis, QualityAssessment, SemanticMatch } from "./intelligent-validator.js";
import type { TierGate, NivelComplexidade, TipoArtefato } from "../types/index.js";

export interface ScoringWeights {
    semantic: number;       // Peso para análise semântica
    completeness: number;   // Peso para completude
    quality: number;        // Peso para qualidade
    structure: number;      // Peso para estrutura
    consistency: number;    // Peso para consistência
}

export interface ThresholdConfig {
    exemplar: number;       // Level 5 - Exemplar
    highQuality: number;    // Level 4 - Alta qualidade  
    professional: number;  // Level 3 - Padrão profissional
    basic: number;          // Level 2 - Estrutura básica
    minimal: number;        // Level 1 - Conceito inicial
    canAdvance: number;     // Threshold mínimo para avançar
}

export interface AdaptiveScore {
    final: number;          // Score final adaptativo
    components: {           // Breakdown dos componentes
        semantic: number;
        completeness: number;
        quality: number;
        structure: number;
        consistency: number;
    };
    weights: ScoringWeights;
    thresholds: ThresholdConfig;
    adjustments: ScoreAdjustment[];
    confidence: number;     // Confiança na avaliação
}

export interface ScoreAdjustment {
    type: 'context' | 'historical' | 'tier' | 'phase' | 'team';
    factor: number;         // Multiplicador aplicado
    reason: string;         // Explicação do ajuste
    impact: number;         // Impacto no score final
}

export interface ProjectHistory {
    projectId: string;
    successfulAdvances: number;
    totalAttempts: number;
    averageQuality: number;
    commonIssues: string[];
    teamExperience: 'junior' | 'mid' | 'senior';
    projectType: TipoArtefato;
    complexity: NivelComplexidade;
}

/**
 * Engine para cálculo de scores adaptativos baseados em contexto
 */
export class AdaptiveScoring {
    private contextualWeights: Map<string, ScoringWeights>;
    private baseThresholds: Map<TierGate, ThresholdConfig>;
    private historicalData: Map<string, ProjectHistory>;
    private learningRate: number = 0.1;

    constructor() {
        this.contextualWeights = new Map();
        this.baseThresholds = new Map();
        this.historicalData = new Map();
        this.initializeContextualWeights();
        this.initializeBaseThresholds();
    }

    /**
     * Calcula pesos dinâmicos baseados no contexto do projeto
     */
    public calculateDynamicWeights(context: ValidationContext): ScoringWeights {
        const baseKey = this.getContextKey(context);
        let weights = this.contextualWeights.get(baseKey) || this.getDefaultWeights();

        // Aplica ajustes baseados em fatores contextuais
        weights = this.applyContextualAdjustments(weights, context);
        
        // Aplica aprendizado histórico se disponível
        weights = this.applyHistoricalLearning(weights, context);

        return this.normalizeWeights(weights);
    }

    /**
     * Obtém thresholds adaptativos para o contexto
     */
    public getAdaptiveThresholds(
        context: ValidationContext,
        projectHistory?: ProjectHistory
    ): ThresholdConfig {
        const baseThresholds = this.baseThresholds.get(context.tier);
        let thresholds = baseThresholds ? { ...baseThresholds } : this.getDefaultThresholds();

        // Ajusta baseado no contexto do projeto
        thresholds = this.adjustThresholdsForContext(thresholds, context);

        // Ajusta baseado no histórico se disponível
        if (projectHistory) {
            thresholds = this.adjustThresholdsForHistory(thresholds, projectHistory);
        }

        return thresholds;
    }

    /**
     * Calcula score multi-dimensional adaptativo
     */
    public calculateMultiDimensionalScore(
        semanticMatches: SemanticMatch[],
        completeness: CompletenessAnalysis,
        quality: QualityAssessment,
        context: ValidationContext,
        projectHistory?: ProjectHistory
    ): AdaptiveScore {
        // 1. Calcula pesos dinâmicos
        const weights = this.calculateDynamicWeights(context);
        
        // 2. Obtém thresholds adaptativos
        const thresholds = this.getAdaptiveThresholds(context, projectHistory);

        // 3. Calcula scores dos componentes
        const semanticScore = this.calculateSemanticScore(semanticMatches);
        const completenessScore = completeness.completenessScore;
        const qualityScore = quality.overall;
        const structureScore = completeness.structuralIntegrity;
        const consistencyScore = this.calculateConsistencyScore(semanticMatches, completeness, quality);

        // 4. Aplica pesos para score final
        const rawScore = Math.round(
            (semanticScore * weights.semantic) +
            (completenessScore * weights.completeness) +
            (qualityScore * weights.quality) +
            (structureScore * weights.structure) +
            (consistencyScore * weights.consistency)
        );

        // 5. Aplica ajustes contextuais
        const { adjustedScore, adjustments } = this.applyScoreAdjustments(
            rawScore, 
            context, 
            projectHistory
        );

        // 6. Calcula confiança na avaliação
        const confidence = this.calculateConfidence(
            semanticMatches,
            completeness,
            quality,
            context
        );

        return {
            final: Math.max(0, Math.min(100, adjustedScore)),
            components: {
                semantic: semanticScore,
                completeness: completenessScore,
                quality: qualityScore,
                structure: structureScore,
                consistency: consistencyScore
            },
            weights,
            thresholds,
            adjustments,
            confidence
        };
    }

    /**
     * Atualiza pesos baseado em feedback do usuário
     */
    public updateWeightsFromFeedback(
        context: ValidationContext,
        originalScore: AdaptiveScore,
        userAccepted: boolean,
        userFeedback?: string
    ): void {
        const contextKey = this.getContextKey(context);
        const currentWeights = this.contextualWeights.get(contextKey);
        
        if (!currentWeights) return;

        // Aprendizado simples: ajusta pesos baseado na aceitação
        const adjustmentFactor = userAccepted ? 1 + this.learningRate : 1 - this.learningRate;
        
        const updatedWeights: ScoringWeights = {
            semantic: currentWeights.semantic * adjustmentFactor,
            completeness: currentWeights.completeness * adjustmentFactor,
            quality: currentWeights.quality * adjustmentFactor,
            structure: currentWeights.structure * adjustmentFactor,
            consistency: currentWeights.consistency * adjustmentFactor
        };

        this.contextualWeights.set(contextKey, this.normalizeWeights(updatedWeights));
    }

    /**
     * Registra histórico de projeto para aprendizado
     */
    public recordProjectHistory(
        projectId: string,
        context: ValidationContext,
        wasSuccessful: boolean,
        finalQuality: number
    ): void {
        const existing = this.historicalData.get(projectId) || {
            projectId,
            successfulAdvances: 0,
            totalAttempts: 0,
            averageQuality: 0,
            commonIssues: [],
            teamExperience: context.teamExperience,
            projectType: context.projectType as TipoArtefato,
            complexity: 'medio' as NivelComplexidade
        };

        existing.totalAttempts += 1;
        if (wasSuccessful) {
            existing.successfulAdvances += 1;
        }

        // Atualiza média de qualidade
        existing.averageQuality = (
            (existing.averageQuality * (existing.totalAttempts - 1)) + finalQuality
        ) / existing.totalAttempts;

        this.historicalData.set(projectId, existing);
    }

    /**
     * Inicializa pesos contextuais para diferentes tipos de projeto
     */
    private initializeContextualWeights(): void {
        this.contextualWeights = new Map([
            // POC - Foca mais em semantic e menos em completude formal
            ['poc.junior', { semantic: 0.5, completeness: 0.2, quality: 0.15, structure: 0.1, consistency: 0.05 }],
            ['poc.mid', { semantic: 0.45, completeness: 0.25, quality: 0.2, structure: 0.05, consistency: 0.05 }],
            ['poc.senior', { semantic: 0.4, completeness: 0.3, quality: 0.2, structure: 0.05, consistency: 0.05 }],

            // Internal - Balanceado, mais estrutura
            ['internal.junior', { semantic: 0.3, completeness: 0.35, quality: 0.2, structure: 0.1, consistency: 0.05 }],
            ['internal.mid', { semantic: 0.25, completeness: 0.4, quality: 0.25, structure: 0.05, consistency: 0.05 }],
            ['internal.senior', { semantic: 0.2, completeness: 0.45, quality: 0.25, structure: 0.05, consistency: 0.05 }],

            // Product - Maior foco em qualidade e completude
            ['product.junior', { semantic: 0.2, completeness: 0.35, quality: 0.3, structure: 0.1, consistency: 0.05 }],
            ['product.mid', { semantic: 0.15, completeness: 0.4, quality: 0.35, structure: 0.05, consistency: 0.05 }],
            ['product.senior', { semantic: 0.1, completeness: 0.4, quality: 0.4, structure: 0.05, consistency: 0.05 }],

            // Critical - Máximo rigor em qualidade e consistência
            ['critical.junior', { semantic: 0.15, completeness: 0.3, quality: 0.35, structure: 0.15, consistency: 0.05 }],
            ['critical.mid', { semantic: 0.1, completeness: 0.35, quality: 0.4, structure: 0.1, consistency: 0.05 }],
            ['critical.senior', { semantic: 0.05, completeness: 0.35, quality: 0.45, structure: 0.1, consistency: 0.05 }]
        ]);
    }

    /**
     * Inicializa thresholds base por tier
     */
    private initializeBaseThresholds(): void {
        this.baseThresholds = new Map([
            ['essencial', {
                exemplar: 85, highQuality: 75, professional: 60, basic: 40, minimal: 25, canAdvance: 40
            }],
            ['base', {
                exemplar: 90, highQuality: 80, professional: 70, basic: 50, minimal: 30, canAdvance: 50
            }],
            ['avancado', {
                exemplar: 95, highQuality: 85, professional: 75, basic: 60, minimal: 40, canAdvance: 60
            }]
        ]);
    }

    /**
     * Gera chave de contexto para lookup
     */
    private getContextKey(context: ValidationContext): string {
        return `${context.projectType}.${context.teamExperience}`;
    }

    /**
     * Aplica ajustes contextuais aos pesos
     */
    private applyContextualAdjustments(
        weights: ScoringWeights, 
        context: ValidationContext
    ): ScoringWeights {
        const adjusted = { ...weights };

        // Ajuste por restrição de tempo
        if (context.timeConstraints === 'tight') {
            adjusted.semantic *= 1.2;      // Prioriza conteúdo sobre forma
            adjusted.structure *= 0.8;      // Reduz exigência de estrutura
        } else if (context.timeConstraints === 'flexible') {
            adjusted.quality *= 1.2;       // Aumenta exigência de qualidade
            adjusted.consistency *= 1.5;   // Prioriza consistência
        }

        // Ajuste por criticidade do negócio
        if (context.businessCriticality === 'critical') {
            adjusted.quality *= 1.3;
            adjusted.consistency *= 1.5;
        } else if (context.businessCriticality === 'low') {
            adjusted.semantic *= 1.2;
            adjusted.quality *= 0.9;
        }

        // Ajuste por estágio de iteração
        if (context.iterationStage === 'initial') {
            adjusted.semantic *= 1.3;      // Prioriza conceitos
            adjusted.completeness *= 0.8;  // Menos rigor na completude
        } else if (context.iterationStage === 'final') {
            adjusted.quality *= 1.3;       // Máxima qualidade
            adjusted.consistency *= 1.4;   // Máxima consistência
        }

        return adjusted;
    }

    /**
     * Aplica aprendizado histórico aos pesos
     */
    private applyHistoricalLearning(
        weights: ScoringWeights, 
        context: ValidationContext
    ): ScoringWeights {
        // Implementação simplificada - pode ser expandida
        const contextKey = this.getContextKey(context);
        const learnedWeights = this.contextualWeights.get(contextKey);
        
        if (learnedWeights) {
            // Interpola entre pesos base e aprendidos
            const alpha = 0.7; // Peso para dados aprendidos
            
            return {
                semantic: weights.semantic * (1 - alpha) + learnedWeights.semantic * alpha,
                completeness: weights.completeness * (1 - alpha) + learnedWeights.completeness * alpha,
                quality: weights.quality * (1 - alpha) + learnedWeights.quality * alpha,
                structure: weights.structure * (1 - alpha) + learnedWeights.structure * alpha,
                consistency: weights.consistency * (1 - alpha) + learnedWeights.consistency * alpha
            };
        }

        return weights;
    }

    /**
     * Normaliza pesos para somar 1.0
     */
    private normalizeWeights(weights: ScoringWeights): ScoringWeights {
        const sum = weights.semantic + weights.completeness + weights.quality + 
                   weights.structure + weights.consistency;
        
        if (sum === 0) return this.getDefaultWeights();
        
        return {
            semantic: weights.semantic / sum,
            completeness: weights.completeness / sum,
            quality: weights.quality / sum,
            structure: weights.structure / sum,
            consistency: weights.consistency / sum
        };
    }

    /**
     * Ajusta thresholds baseado no contexto
     */
    private adjustThresholdsForContext(
        thresholds: ThresholdConfig,
        context: ValidationContext
    ): ThresholdConfig {
        const adjusted = { ...thresholds };

        // Ajuste por experiência da equipe
        if (context.teamExperience === 'junior') {
            // Thresholds mais baixos para times junior
            Object.keys(adjusted).forEach(key => {
                (adjusted as any)[key] *= 0.9;
            });
        } else if (context.teamExperience === 'senior') {
            // Thresholds mais altos para times senior
            Object.keys(adjusted).forEach(key => {
                (adjusted as any)[key] *= 1.1;
            });
        }

        // Ajuste por restrições de tempo
        if (context.timeConstraints === 'tight') {
            adjusted.canAdvance *= 0.8;  // Permite avanço mais rápido
        }

        return adjusted;
    }

    /**
     * Ajusta thresholds baseado no histórico
     */
    private adjustThresholdsForHistory(
        thresholds: ThresholdConfig,
        history: ProjectHistory
    ): ThresholdConfig {
        const successRate = history.totalAttempts > 0 
            ? history.successfulAdvances / history.totalAttempts 
            : 0.5;

        const adjusted = { ...thresholds };

        // Se taxa de sucesso é alta, pode ser mais exigente
        if (successRate > 0.8) {
            Object.keys(adjusted).forEach(key => {
                (adjusted as any)[key] *= 1.1;
            });
        } else if (successRate < 0.4) {
            // Se taxa de sucesso é baixa, seja mais leniente
            Object.keys(adjusted).forEach(key => {
                (adjusted as any)[key] *= 0.9;
            });
        }

        return adjusted;
    }

    /**
     * Aplica ajustes finais ao score
     */
    private applyScoreAdjustments(
        rawScore: number,
        context: ValidationContext,
        projectHistory?: ProjectHistory
    ): { adjustedScore: number; adjustments: ScoreAdjustment[] } {
        let adjustedScore = rawScore;
        const adjustments: ScoreAdjustment[] = [];

        // Ajuste por tier
        const tierMultiplier = this.getTierMultiplier(context.tier);
        if (tierMultiplier !== 1.0) {
            const impact = adjustedScore * (tierMultiplier - 1);
            adjustedScore *= tierMultiplier;
            adjustments.push({
                type: 'tier',
                factor: tierMultiplier,
                reason: `Ajuste para tier ${context.tier}`,
                impact: Math.round(impact)
            });
        }

        // Ajuste por fase (algumas fases são naturalmente mais difíceis)
        const phaseMultiplier = this.getPhaseMultiplier(context.phase.nome);
        if (phaseMultiplier !== 1.0) {
            const impact = adjustedScore * (phaseMultiplier - 1);
            adjustedScore *= phaseMultiplier;
            adjustments.push({
                type: 'phase',
                factor: phaseMultiplier,
                reason: `Ajuste para fase ${context.phase.nome}`,
                impact: Math.round(impact)
            });
        }

        return { adjustedScore: Math.round(adjustedScore), adjustments };
    }

    // Métodos auxiliares
    private getDefaultWeights(): ScoringWeights {
        return { semantic: 0.25, completeness: 0.35, quality: 0.25, structure: 0.1, consistency: 0.05 };
    }

    private getDefaultThresholds(): ThresholdConfig {
        return { exemplar: 90, highQuality: 80, professional: 70, basic: 50, minimal: 30, canAdvance: 50 };
    }

    private calculateSemanticScore(matches: SemanticMatch[]): number {
        if (matches.length === 0) return 0;
        
        const foundMatches = matches.filter(m => m.found);
        if (foundMatches.length === 0) return 0;
        
        const totalConfidence = foundMatches.reduce((sum, m) => sum + m.confidence, 0);
        const avgConfidence = totalConfidence / foundMatches.length;
        const coverageScore = (foundMatches.length / matches.length) * 100;
        
        return Math.round((avgConfidence * 100 * 0.7) + (coverageScore * 0.3));
    }

    private calculateConsistencyScore(
        semanticMatches: SemanticMatch[],
        completeness: CompletenessAnalysis,
        quality: QualityAssessment
    ): number {
        // Score de consistência baseado em coerência entre diferentes métricas
        const semanticScore = this.calculateSemanticScore(semanticMatches);
        const variance = this.calculateVariance([
            semanticScore,
            completeness.completenessScore,
            quality.overall
        ]);
        
        // Menor variância = maior consistência
        return Math.max(0, 100 - variance);
    }

    private calculateVariance(scores: number[]): number {
        if (scores.length < 2) return 0;
        
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        
        return Math.sqrt(variance);
    }

    private calculateConfidence(
        semanticMatches: SemanticMatch[],
        completeness: CompletenessAnalysis,
        quality: QualityAssessment,
        context: ValidationContext
    ): number {
        // Confiança baseada na quantidade e qualidade dos dados disponíveis
        let confidence = 50; // Base
        
        // Aumenta confiança com mais dados semânticos
        if (semanticMatches.length > 0) {
            const avgConfidence = semanticMatches
                .filter(m => m.found)
                .reduce((sum, m) => sum + m.confidence, 0) / semanticMatches.length;
            confidence += avgConfidence * 30;
        }
        
        // Aumenta confiança com alta completude
        if (completeness.completenessScore > 70) {
            confidence += 15;
        }
        
        // Reduz confiança se há muitos elementos críticos faltando
        if (completeness.missingCritical.length > 2) {
            confidence -= 20;
        }
        
        return Math.max(0, Math.min(100, Math.round(confidence)));
    }

    private getTierMultiplier(tier: TierGate): number {
        const multipliers = {
            'essencial': 0.95,  // Mais leniente
            'base': 1.0,        // Padrão
            'avancado': 1.1     // Mais rigoroso
        };
        return multipliers[tier] || 1.0;
    }

    private getPhaseMultiplier(phaseName: string): number {
        // Algumas fases são naturalmente mais difíceis
        const multipliers: Record<string, number> = {
            'Produto': 1.0,
            'Requisitos': 1.05,
            'UX Design': 0.95,
            'Arquitetura': 1.1,
            'Backlog': 0.95,
            'Frontend': 1.0,
            'Backend': 1.0
        };
        return multipliers[phaseName] || 1.0;
    }
}
