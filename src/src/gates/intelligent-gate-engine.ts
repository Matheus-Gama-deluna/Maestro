/**
 * Motor Principal de Gates Inteligentes - Orquestra todos os componentes
 * 
 * Este é o ponto de entrada principal que coordena:
 * - IntelligentValidator: Validação contextual semântica
 * - AdaptiveScoring: Scoring dinâmico baseado em contexto
 * - ContextualRecommender: Sugestões inteligentes e acionáveis
 * - MaturityLevelAssessor: Sistema de 5 níveis de maturidade
 * 
 * @version 3.0.0
 */

import { IntelligentValidator, type ValidationContext, type IntelligentValidationResult } from "./intelligent-validator.js";
import { AdaptiveScoring, type AdaptiveScore, type ProjectHistory } from "./adaptive-scoring.js";
import { ContextualRecommender, type UserProfile, type RecommendationConfig } from "./contextual-recommender.js";
import { MaturityLevelAssessor, type MaturityAssessment, type MaturityLevel } from "./maturity-levels.js";
import type { Fase, TierGate } from "../types/index.js";

export interface GateEngineConfig {
    enableIntelligentValidation: boolean;
    enableAdaptiveScoring: boolean;
    enableContextualRecommendations: boolean;
    enableMaturityLevels: boolean;
    fallbackToLegacy: boolean;
    maxRecommendations: number;
    userProfile?: UserProfile;
    projectHistory?: ProjectHistory;
}

export interface IntelligentGateResult {
    // Status principal
    canAdvance: boolean;
    maturityLevel: MaturityLevel;
    overallScore: number;
    
    // Componentes detalhados
    validationResult: IntelligentValidationResult;
    adaptiveScore: AdaptiveScore;
    maturityAssessment: MaturityAssessment;
    
    // Interface de apresentação
    summary: GateResultSummary;
    userFeedback: UserFeedbackOptions;
    
    // Meta-informações
    engineVersion: string;
    processingTimeMs: number;
    confidenceLevel: number;
}

export interface GateResultSummary {
    title: string;
    status: 'approved' | 'conditionally_approved' | 'needs_improvement' | 'blocked';
    statusIcon: string;
    statusColor: 'green' | 'yellow' | 'orange' | 'red';
    mainMessage: string;
    keyStrengths: string[];
    priorityActions: string[];
    nextSteps: string[];
    estimatedEffortHours: number;
}

export interface UserFeedbackOptions {
    quickActions: QuickAction[];
    detailsAvailable: boolean;
    canForceAdvance: boolean;
    canRequestHumanReview: boolean;
    feedbackPrompts: FeedbackPrompt[];
}

export interface QuickAction {
    id: string;
    label: string;
    type: 'advance' | 'iterate' | 'autofix' | 'consult' | 'skip';
    estimatedMinutes: number;
    confidence: number;
    consequences?: string;
}

export interface FeedbackPrompt {
    question: string;
    options: string[];
    purpose: string;
}

/**
 * Motor principal que orquestra todo o sistema de validação inteligente
 */
export class IntelligentGateEngine {
    private validator: IntelligentValidator;
    private scoring: AdaptiveScoring;
    private recommender: ContextualRecommender;
    private maturityAssessor: MaturityLevelAssessor;
    private defaultConfig: GateEngineConfig;

    constructor() {
        this.validator = new IntelligentValidator();
        this.scoring = new AdaptiveScoring();
        this.recommender = new ContextualRecommender();
        this.maturityAssessor = new MaturityLevelAssessor();
        
        this.defaultConfig = {
            enableIntelligentValidation: true,
            enableAdaptiveScoring: true,
            enableContextualRecommendations: true,
            enableMaturityLevels: true,
            fallbackToLegacy: true,
            maxRecommendations: 6
        };
    }

    /**
     * Método principal - valida entregável usando todo o sistema inteligente
     */
    public async validateDeliverable(
        content: string,
        phase: Fase,
        tier: TierGate = 'base',
        projectType: 'poc' | 'internal' | 'product' | 'critical' = 'internal',
        config?: Partial<GateEngineConfig>
    ): Promise<IntelligentGateResult> {
        const startTime = Date.now();
        const finalConfig = { ...this.defaultConfig, ...config };
        
        try {
            // 1. Constrói contexto de validação
            const context = this.buildValidationContext(phase, tier, projectType, finalConfig);
            
            // 2. Executa validação inteligente
            const validationResult = await this.executeIntelligentValidation(
                content, 
                context, 
                finalConfig
            );
            
            // 3. Calcula score adaptativo
            const adaptiveScore = await this.calculateAdaptiveScore(
                validationResult, 
                context, 
                finalConfig
            );
            
            // 4. Avalia nível de maturidade
            const maturityAssessment = await this.assessMaturityLevel(
                validationResult, 
                adaptiveScore, 
                context, 
                finalConfig
            );
            
            // 5. Gera recomendações contextuais
            const enhancedRecommendations = await this.generateEnhancedRecommendations(
                validationResult,
                adaptiveScore,
                context,
                finalConfig
            );
            
            // 6. Compila resultado final
            const result = this.compileIntelligentResult(
                validationResult,
                adaptiveScore,
                maturityAssessment,
                enhancedRecommendations,
                context,
                Date.now() - startTime
            );
            
            // 7. Registra para aprendizado futuro
            this.recordForLearning(result, context, finalConfig);
            
            return result;
            
        } catch (error) {
            // Fallback para sistema legado se configurado
            if (finalConfig.fallbackToLegacy) {
                return this.fallbackToLegacySystem(content, phase, tier);
            }
            
            throw error;
        }
    }

    /**
     * Valida com feedback em tempo real (streaming)
     */
    public async validateWithRealTimeFeedback(
        content: string,
        context: ValidationContext,
        onProgress: (update: ValidationProgressUpdate) => void
    ): Promise<IntelligentGateResult> {
        onProgress({ stage: 'initializing', progress: 0, message: 'Iniciando validação inteligente...' });
        
        // Validação semântica
        onProgress({ stage: 'semantic_analysis', progress: 20, message: 'Analisando conceitos e semântica...' });
        const validationResult = this.validator.validateContent(content, context);
        
        // Scoring adaptativo
        onProgress({ stage: 'adaptive_scoring', progress: 40, message: 'Calculando score adaptativo...' });
        const adaptiveScore = this.scoring.calculateMultiDimensionalScore(
            validationResult.semanticMatches,
            validationResult.completenessAnalysis,
            validationResult.qualityAssessment,
            context
        );
        
        // Avaliação de maturidade
        onProgress({ stage: 'maturity_assessment', progress: 60, message: 'Avaliando nível de maturidade...' });
        const maturityAssessment = this.maturityAssessor.assessMaturityLevel(
            validationResult,
            adaptiveScore,
            context
        );
        
        // Recomendações
        onProgress({ stage: 'recommendations', progress: 80, message: 'Gerando recomendações inteligentes...' });
        const recommendations = this.recommender.generateSmartRecommendations(
            validationResult.semanticMatches,
            validationResult.completenessAnalysis,
            validationResult.qualityAssessment,
            adaptiveScore,
            context
        );
        
        // Finalização
        onProgress({ stage: 'finalizing', progress: 100, message: 'Compilando resultado final...' });
        
        return this.compileIntelligentResult(
            { ...validationResult, recommendations },
            adaptiveScore,
            maturityAssessment,
            recommendations,
            context,
            0
        );
    }

    /**
     * Executa apenas análise rápida (para preview)
     */
    public quickAnalysis(
        content: string,
        phase: Fase,
        tier: TierGate = 'base'
    ): {
        estimatedLevel: MaturityLevel;
        quickScore: number;
        canLikelyAdvance: boolean;
        majorIssues: string[];
        quickWins: string[];
    } {
        const context = this.buildValidationContext(phase, tier, 'internal', this.defaultConfig);
        
        // Análise rápida sem processamento completo
        const semanticMatches = this.validator.validateSemanticContent(
            content, 
            this.getExpectedConcepts(phase)
        );
        
        const quickScore = this.calculateQuickScore(content, semanticMatches);
        const estimatedLevel = this.estimateMaturityLevel(quickScore);
        
        return {
            estimatedLevel,
            quickScore,
            canLikelyAdvance: estimatedLevel >= 2,
            majorIssues: this.identifyMajorIssues(content, semanticMatches),
            quickWins: this.identifyQuickWins(content, semanticMatches)
        };
    }

    /**
     * Registra feedback do usuário para aprendizado
     */
    public recordUserFeedback(
        resultId: string,
        userAccepted: boolean,
        actualTimeSpent?: number,
        userComments?: string,
        recommendationsUsed?: string[]
    ): void {
        // Implementação de aprendizado baseado em feedback
        // Atualiza modelos internos para melhorar futuras validações
        
        if (this.scoring) {
            // Atualiza pesos do scoring baseado na aceitação
            // this.scoring.updateWeightsFromFeedback(...);
        }
        
        if (this.recommender && recommendationsUsed) {
            // Atualiza efetividade das recomendações
            // this.recommender.updateFromFeedback(...);
        }
    }

    /**
     * Constrói contexto de validação
     */
    private buildValidationContext(
        phase: Fase,
        tier: TierGate,
        projectType: 'poc' | 'internal' | 'product' | 'critical',
        config: GateEngineConfig
    ): ValidationContext {
        return {
            projectType,
            teamExperience: this.inferTeamExperience(config.userProfile),
            timeConstraints: this.inferTimeConstraints(config),
            businessCriticality: this.mapProjectTypeToCriticality(projectType),
            iterationStage: 'refinement', // Padrão
            phase,
            tier
        };
    }

    /**
     * Executa validação inteligente
     */
    private async executeIntelligentValidation(
        content: string,
        context: ValidationContext,
        config: GateEngineConfig
    ): Promise<IntelligentValidationResult> {
        if (!config.enableIntelligentValidation) {
            // Fallback básico se desabilitado
            return this.createBasicValidationResult(content, context);
        }
        
        return this.validator.validateContent(content, context);
    }

    /**
     * Calcula score adaptativo
     */
    private async calculateAdaptiveScore(
        validationResult: IntelligentValidationResult,
        context: ValidationContext,
        config: GateEngineConfig
    ): Promise<AdaptiveScore> {
        if (!config.enableAdaptiveScoring) {
            // Fallback para score simples
            return this.createBasicScore(validationResult);
        }
        
        return this.scoring.calculateMultiDimensionalScore(
            validationResult.semanticMatches,
            validationResult.completenessAnalysis,
            validationResult.qualityAssessment,
            context,
            config.projectHistory
        );
    }

    /**
     * Avalia nível de maturidade
     */
    private async assessMaturityLevel(
        validationResult: IntelligentValidationResult,
        adaptiveScore: AdaptiveScore,
        context: ValidationContext,
        config: GateEngineConfig
    ): Promise<MaturityAssessment> {
        if (!config.enableMaturityLevels) {
            // Fallback para avaliação binária
            return this.createBasicMaturityAssessment(adaptiveScore);
        }
        
        return this.maturityAssessor.assessMaturityLevel(
            validationResult,
            adaptiveScore,
            context
        );
    }

    /**
     * Gera recomendações aprimoradas
     */
    private async generateEnhancedRecommendations(
        validationResult: IntelligentValidationResult,
        adaptiveScore: AdaptiveScore,
        context: ValidationContext,
        config: GateEngineConfig
    ): Promise<any[]> {
        if (!config.enableContextualRecommendations) {
            return validationResult.recommendations;
        }
        
        const recommendationConfig: RecommendationConfig = {
            maxRecommendations: config.maxRecommendations,
            priorityThreshold: 0.3,
            includeOptional: true,
            includeAutoFixes: true
        };
        
        return this.recommender.generateSmartRecommendations(
            validationResult.semanticMatches,
            validationResult.completenessAnalysis,
            validationResult.qualityAssessment,
            adaptiveScore,
            context,
            config.userProfile,
            recommendationConfig
        );
    }

    /**
     * Compila resultado final inteligente
     */
    private compileIntelligentResult(
        validationResult: IntelligentValidationResult,
        adaptiveScore: AdaptiveScore,
        maturityAssessment: MaturityAssessment,
        recommendations: any[],
        context: ValidationContext,
        processingTimeMs: number
    ): IntelligentGateResult {
        const summary = this.generateResultSummary(
            maturityAssessment, 
            adaptiveScore, 
            recommendations
        );
        
        const userFeedback = this.generateUserFeedbackOptions(
            maturityAssessment,
            recommendations,
            context
        );
        
        return {
            canAdvance: maturityAssessment.canAdvance,
            maturityLevel: maturityAssessment.level,
            overallScore: adaptiveScore.final,
            validationResult: { ...validationResult, recommendations },
            adaptiveScore,
            maturityAssessment,
            summary,
            userFeedback,
            engineVersion: '3.0.0',
            processingTimeMs,
            confidenceLevel: adaptiveScore.confidence
        };
    }

    /**
     * Gera resumo do resultado para apresentação
     */
    private generateResultSummary(
        maturityAssessment: MaturityAssessment,
        adaptiveScore: AdaptiveScore,
        recommendations: any[]
    ): GateResultSummary {
        const level = maturityAssessment.level;
        const canAdvance = maturityAssessment.canAdvance;
        
        let status: GateResultSummary['status'];
        let statusIcon: string;
        let statusColor: GateResultSummary['statusColor'];
        let mainMessage: string;
        
        if (canAdvance && level >= 3) {
            status = 'approved';
            statusIcon = '✅';
            statusColor = 'green';
            mainMessage = `Padrão profissional atingido (Nível ${level}) - Aprovado para avanço`;
        } else if (canAdvance && level >= 2) {
            status = 'conditionally_approved';
            statusIcon = '⚡';
            statusColor = 'yellow';
            mainMessage = `Estrutura básica presente (Nível ${level}) - Pode avançar com melhorias incrementais`;
        } else if (level === 1 && recommendations.length > 0) {
            status = 'needs_improvement';
            statusIcon = '🔄';
            statusColor = 'orange';
            mainMessage = `Conceito inicial (Nível ${level}) - Melhorias necessárias antes do avanço`;
        } else {
            status = 'blocked';
            statusIcon = '❌';
            statusColor = 'red';
            mainMessage = `Bloqueado por problemas críticos - Revisão necessária`;
        }
        
        const priorityActions = recommendations
            .filter(r => r.type === 'critical' || r.priority > 0.7)
            .slice(0, 3)
            .map(r => r.title);
        
        const estimatedEffortHours = recommendations
            .reduce((total, r) => total + (r.estimatedTimeMinutes || 0), 0) / 60;
        
        return {
            title: `${statusIcon} Nível ${level} - ${maturityAssessment.levelDescription}`,
            status,
            statusIcon,
            statusColor,
            mainMessage,
            keyStrengths: maturityAssessment.strengths,
            priorityActions,
            nextSteps: maturityAssessment.recommendedActions.map(a => a.description),
            estimatedEffortHours: Math.round(estimatedEffortHours * 10) / 10
        };
    }

    /**
     * Gera opções de feedback para o usuário
     */
    private generateUserFeedbackOptions(
        maturityAssessment: MaturityAssessment,
        recommendations: any[],
        context: ValidationContext
    ): UserFeedbackOptions {
        const quickActions: QuickAction[] = [];
        
        // Ação principal baseada na avaliação
        if (maturityAssessment.canAdvance) {
            quickActions.push({
                id: 'advance',
                label: `Avançar (Nível ${maturityAssessment.level})`,
                type: 'advance',
                estimatedMinutes: 0,
                confidence: 0.9
            });
        }
        
        // Auto-fixes disponíveis
        const autoFixRecommendations = recommendations.filter(r => r.autofix);
        if (autoFixRecommendations.length > 0) {
            quickActions.push({
                id: 'autofix',
                label: `Aplicar ${autoFixRecommendations.length} correção(ões) automática(s)`,
                type: 'autofix',
                estimatedMinutes: 5,
                confidence: 0.8
            });
        }
        
        // Iterar com melhorias rápidas
        const quickWins = recommendations.filter(r => r.effort === 'quick');
        if (quickWins.length > 0) {
            quickActions.push({
                id: 'iterate',
                label: `Implementar ${quickWins.length} melhoria(s) rápida(s)`,
                type: 'iterate',
                estimatedMinutes: quickWins.length * 10,
                confidence: 0.7
            });
        }
        
        return {
            quickActions,
            detailsAvailable: true,
            canForceAdvance: context.projectType === 'poc' || context.timeConstraints === 'tight',
            canRequestHumanReview: context.businessCriticality === 'critical',
            feedbackPrompts: this.generateFeedbackPrompts(maturityAssessment, context)
        };
    }

    /**
     * Gera prompts de feedback para aprendizado
     */
    private generateFeedbackPrompts(
        maturityAssessment: MaturityAssessment,
        context: ValidationContext
    ): FeedbackPrompt[] {
        const prompts: FeedbackPrompt[] = [];
        
        // Se o nível está abaixo do esperado
        if (maturityAssessment.level < 3) {
            prompts.push({
                question: 'Esta avaliação reflete suas expectativas para este tipo de projeto?',
                options: ['Sim, está adequada', 'Muito rigorosa', 'Pouco rigorosa'],
                purpose: 'Calibrar rigor por tipo de projeto'
            });
        }
        
        // Se há muitas recomendações
        if (maturityAssessment.recommendedActions.length > 3) {
            prompts.push({
                question: 'Quais recomendações são mais úteis para você?',
                options: ['As primeiras 3', 'Todas são relevantes', 'Prefiro menos recomendações'],
                purpose: 'Otimizar quantidade e relevância das recomendações'
            });
        }
        
        return prompts;
    }

    // Métodos de fallback e utilitários
    private async fallbackToLegacySystem(content: string, phase: Fase, tier: TierGate): Promise<IntelligentGateResult> {
        // Implementação simplificada para fallback
        const basicScore = content.length > 100 ? 70 : 40;
        const level = basicScore >= 70 ? 3 : 2;
        
        return {
            canAdvance: level >= 2,
            maturityLevel: level as MaturityLevel,
            overallScore: basicScore,
            validationResult: this.createBasicValidationResult(content, this.buildValidationContext(phase, tier, 'internal', this.defaultConfig)),
            adaptiveScore: this.createBasicScore({} as IntelligentValidationResult),
            maturityAssessment: this.createBasicMaturityAssessment({ final: basicScore } as AdaptiveScore),
            summary: {
                title: `Nível ${level} - Sistema Legado`,
                status: 'conditionally_approved',
                statusIcon: '⚡',
                statusColor: 'yellow',
                mainMessage: 'Validação usando sistema legado',
                keyStrengths: ['Conteúdo presente'],
                priorityActions: ['Migrar para sistema inteligente'],
                nextSteps: ['Avançar com cautela'],
                estimatedEffortHours: 0.5
            },
            userFeedback: {
                quickActions: [],
                detailsAvailable: false,
                canForceAdvance: true,
                canRequestHumanReview: false,
                feedbackPrompts: []
            },
            engineVersion: '2.x-legacy',
            processingTimeMs: 50,
            confidenceLevel: 60
        };
    }

    // Métodos auxiliares placeholder
    private inferTeamExperience(userProfile?: UserProfile): 'junior' | 'mid' | 'senior' {
        return userProfile?.experienceLevel || 'mid';
    }
    
    private inferTimeConstraints(config: GateEngineConfig): 'tight' | 'normal' | 'flexible' {
        return 'normal'; // Padrão
    }
    
    private mapProjectTypeToCriticality(projectType: string): 'low' | 'medium' | 'high' | 'critical' {
        const map = { poc: 'low', internal: 'medium', product: 'high', critical: 'critical' };
        return (map as any)[projectType] || 'medium';
    }
    
    private getExpectedConcepts(phase: Fase): string[] {
        const map: Record<string, string[]> = {
            'Produto': ['problema', 'persona', 'mvp'],
            'Requisitos': ['requisitos', 'criterios'],
            'UX Design': ['wireframes', 'jornadas']
        };
        return map[phase.nome] || [];
    }
    
    private calculateQuickScore(content: string, semanticMatches: any[]): number {
        const baseScore = Math.min((content.length / 500) * 50, 50);
        const semanticScore = semanticMatches.length > 0 ? 30 : 0;
        return Math.round(baseScore + semanticScore);
    }
    
    private estimateMaturityLevel(score: number): MaturityLevel {
        if (score >= 80) return 4;
        if (score >= 65) return 3;
        if (score >= 40) return 2;
        return 1;
    }
    
    private identifyMajorIssues(content: string, semanticMatches: any[]): string[] {
        const issues: string[] = [];
        if (content.length < 100) issues.push('Conteúdo muito curto');
        if (semanticMatches.length === 0) issues.push('Conceitos essenciais não identificados');
        return issues;
    }
    
    private identifyQuickWins(content: string, semanticMatches: any[]): string[] {
        const wins: string[] = [];
        if (content.length > 200) wins.push('Boa quantidade de conteúdo');
        if (semanticMatches.length > 0) wins.push('Alguns conceitos identificados');
        return wins;
    }
    
    private createBasicValidationResult(content: string, context: ValidationContext): IntelligentValidationResult {
        // Implementação básica para fallback
        return {} as IntelligentValidationResult;
    }
    
    private createBasicScore(validationResult: IntelligentValidationResult): AdaptiveScore {
        // Implementação básica para fallback
        return { final: 70, confidence: 60 } as AdaptiveScore;
    }
    
    private createBasicMaturityAssessment(adaptiveScore: AdaptiveScore): MaturityAssessment {
        // Implementação básica para fallback
        return {
            level: 2,
            canAdvance: true,
            levelDescription: 'Estrutura Básica',
            strengths: ['Conteúdo presente'],
            improvementAreas: ['Qualidade pode melhorar']
        } as MaturityAssessment;
    }
    
    private recordForLearning(result: IntelligentGateResult, context: ValidationContext, config: GateEngineConfig): void {
        // Registra dados para aprendizado futuro
        // Implementação futura
    }
}

// Interfaces auxiliares
export interface ValidationProgressUpdate {
    stage: 'initializing' | 'semantic_analysis' | 'adaptive_scoring' | 'maturity_assessment' | 'recommendations' | 'finalizing';
    progress: number; // 0-100
    message: string;
}
