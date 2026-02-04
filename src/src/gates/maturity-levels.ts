/**
 * Sistema de 5 Níveis de Maturidade - Substitui validação binária
 * 
 * Features principais:
 * - 5 níveis graduais de maturidade ao invés de aprovado/rejeitado
 * - Critérios adaptativos baseados no contexto do projeto
 * - Permite avanço inteligente mesmo com qualidade não ideal
 * - Feedback progressivo e construtivo
 * 
 * @version 3.0.0
 */

import type { 
    ValidationContext, 
    IntelligentValidationResult, 
    SmartRecommendation,
    ValidationBlocker,
    ValidationWarning
} from "./intelligent-validator.js";
import type { AdaptiveScore } from "./adaptive-scoring.js";

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export interface MaturityAssessment {
    level: MaturityLevel;
    canAdvance: boolean;
    advancementReason: string;
    levelDescription: string;
    nextLevelRequirements: string[];
    strengths: string[];
    improvementAreas: string[];
    contextualFactors: string[];
    recommendedActions: MaturityAction[];
}

export interface MaturityAction {
    action: 'advance' | 'iterate' | 'consult' | 'research' | 'review';
    priority: 'immediate' | 'soon' | 'eventual';
    description: string;
    estimatedHours: number;
    expectedImpact: 'high' | 'medium' | 'low';
}

export interface MaturityCriteria {
    level: MaturityLevel;
    name: string;
    description: string;
    minScore: number;
    maxCriticalBlockers: number;
    requiredElements: string[];
    contextualAdjustments: Map<string, number>;
    advancementPolicy: AdvancementPolicy;
}

export interface AdvancementPolicy {
    allowAdvanceWithWarnings: boolean;
    allowAdvanceWithMinorBlockers: boolean;
    requireUserConfirmation: boolean;
    maxWarningsForAutoAdvance: number;
    contextualOverrides: string[];
}

/**
 * Avaliador de níveis de maturidade
 */
export class MaturityLevelAssessor {
    private criteria: Map<MaturityLevel, MaturityCriteria>;
    private contextualModifiers: Map<string, number>;

    constructor() {
        this.criteria = new Map();
        this.contextualModifiers = new Map();
        this.initializeCriteria();
        this.initializeContextualModifiers();
    }

    /**
     * Avalia o nível de maturidade de um entregável
     */
    public assessMaturityLevel(
        validationResult: IntelligentValidationResult,
        adaptiveScore: AdaptiveScore,
        context: ValidationContext
    ): MaturityAssessment {
        // 1. Determina nível base pelo score
        const baseLevel = this.determineBaseLevelFromScore(
            adaptiveScore.final, 
            context
        );

        // 2. Ajusta baseado em bloqueadores críticos
        const adjustedLevel = this.adjustForBlockers(
            baseLevel,
            validationResult.blockers,
            context
        );

        // 3. Aplica modificadores contextuais
        const finalLevel = this.applyContextualModifiers(
            adjustedLevel,
            context,
            validationResult
        );

        // 4. Determina se pode avançar
        const canAdvance = this.determineAdvancementEligibility(
            finalLevel,
            validationResult,
            context
        );

        // 5. Gera recomendações de ação
        const recommendedActions = this.generateMaturityActions(
            finalLevel,
            validationResult,
            context
        );

        // 6. Compila assessment completo
        return this.compileAssessment(
            finalLevel,
            canAdvance,
            validationResult,
            adaptiveScore,
            context,
            recommendedActions
        );
    }

    /**
     * Obtém descrição detalhada de um nível de maturidade
     */
    public getMaturityLevelDetails(level: MaturityLevel): MaturityCriteria | null {
        return this.criteria.get(level) || null;
    }

    /**
     * Sugere próximos passos baseado no nível atual
     */
    public suggestNextSteps(
        currentLevel: MaturityLevel,
        targetLevel: MaturityLevel,
        context: ValidationContext
    ): string[] {
        const steps: string[] = [];
        
        for (let level = currentLevel + 1; level <= targetLevel; level++) {
            const criteria = this.criteria.get(level as MaturityLevel);
            if (criteria) {
                steps.push(`**Para atingir ${criteria.name}:**`);
                steps.push(...criteria.requiredElements.map(el => `- ${el}`));
            }
        }

        return steps;
    }

    /**
     * Calcula o gap entre nível atual e desejado
     */
    public calculateMaturityGap(
        currentLevel: MaturityLevel,
        desiredLevel: MaturityLevel,
        validationResult: IntelligentValidationResult
    ): {
        gap: number;
        effortEstimate: 'low' | 'medium' | 'high' | 'very_high';
        keyBarriers: string[];
        quickWins: string[];
    } {
        const gap = desiredLevel - currentLevel;
        
        let effortEstimate: 'low' | 'medium' | 'high' | 'very_high';
        if (gap <= 1) effortEstimate = 'low';
        else if (gap === 2) effortEstimate = 'medium';
        else if (gap === 3) effortEstimate = 'high';
        else effortEstimate = 'very_high';

        const keyBarriers = this.identifyKeyBarriers(currentLevel, desiredLevel, validationResult);
        const quickWins = this.identifyQuickWins(currentLevel, desiredLevel, validationResult);

        return { gap, effortEstimate, keyBarriers, quickWins };
    }

    /**
     * Inicializa critérios para cada nível de maturidade
     */
    private initializeCriteria(): void {
        // Level 1: Conceito Inicial
        this.criteria.set(1, {
            level: 1,
            name: 'Conceito Inicial',
            description: 'Ideia básica documentada, pode ter lacunas significativas',
            minScore: 0,
            maxCriticalBlockers: 10,
            requiredElements: ['Problema identificado', 'Solução esboçada'],
            contextualAdjustments: new Map([
                ['poc', 10], ['tight_deadline', 15], ['junior_team', 10]
            ]),
            advancementPolicy: {
                allowAdvanceWithWarnings: true,
                allowAdvanceWithMinorBlockers: true,
                requireUserConfirmation: false,
                maxWarningsForAutoAdvance: 10,
                contextualOverrides: ['poc', 'prototype', 'experiment']
            }
        });

        // Level 2: Estrutura Básica
        this.criteria.set(2, {
            level: 2,
            name: 'Estrutura Básica',
            description: 'Estrutura fundamental presente, principais seções identificadas',
            minScore: 40,
            maxCriticalBlockers: 3,
            requiredElements: [
                'Estrutura básica presente',
                'Principais seções identificadas',
                'Contexto mínimo fornecido'
            ],
            contextualAdjustments: new Map([
                ['poc', 5], ['internal', 0], ['product', -5]
            ]),
            advancementPolicy: {
                allowAdvanceWithWarnings: true,
                allowAdvanceWithMinorBlockers: true,
                requireUserConfirmation: false,
                maxWarningsForAutoAdvance: 8,
                contextualOverrides: ['iterative_development']
            }
        });

        // Level 3: Padrão Profissional
        this.criteria.set(3, {
            level: 3,
            name: 'Padrão Profissional',
            description: 'Qualidade adequada para uso profissional, cumpre expectativas básicas',
            minScore: 65,
            maxCriticalBlockers: 1,
            requiredElements: [
                'Todos os elementos obrigatórios presentes',
                'Qualidade de conteúdo adequada',
                'Estrutura coerente',
                'Informações suficientes para ação'
            ],
            contextualAdjustments: new Map([
                ['poc', 10], ['internal', 5], ['product', 0], ['critical', -10]
            ]),
            advancementPolicy: {
                allowAdvanceWithWarnings: true,
                allowAdvanceWithMinorBlockers: false,
                requireUserConfirmation: false,
                maxWarningsForAutoAdvance: 3,
                contextualOverrides: ['standard_process']
            }
        });

        // Level 4: Alta Qualidade
        this.criteria.set(4, {
            level: 4,
            name: 'Alta Qualidade',
            description: 'Excede expectativas, serve como referência para projetos similares',
            minScore: 80,
            maxCriticalBlockers: 0,
            requiredElements: [
                'Excelente qualidade de conteúdo',
                'Detalhamento apropriado',
                'Consistência interna',
                'Exemplos práticos incluídos',
                'Considerações de edge cases'
            ],
            contextualAdjustments: new Map([
                ['poc', 15], ['internal', 10], ['product', 5], ['critical', 0]
            ]),
            advancementPolicy: {
                allowAdvanceWithWarnings: false,
                allowAdvanceWithMinorBlockers: false,
                requireUserConfirmation: false,
                maxWarningsForAutoAdvance: 1,
                contextualOverrides: []
            }
        });

        // Level 5: Exemplar
        this.criteria.set(5, {
            level: 5,
            name: 'Exemplar',
            description: 'Qualidade excepcional, benchmark para organizações',
            minScore: 90,
            maxCriticalBlockers: 0,
            requiredElements: [
                'Qualidade excepcional',
                'Inovação e criatividade',
                'Análise aprofundada',
                'Antecipação de problemas',
                'Documentação exemplar',
                'Reutilizável como template'
            ],
            contextualAdjustments: new Map([
                ['poc', 20], ['internal', 15], ['product', 10], ['critical', 5]
            ]),
            advancementPolicy: {
                allowAdvanceWithWarnings: false,
                allowAdvanceWithMinorBlockers: false,
                requireUserConfirmation: false,
                maxWarningsForAutoAdvance: 0,
                contextualOverrides: []
            }
        });
    }

    /**
     * Inicializa modificadores contextuais
     */
    private initializeContextualModifiers(): void {
        this.contextualModifiers = new Map([
            // Tipo de projeto
            ['project.poc', 0.9],           // POCs são mais lenientes
            ['project.internal', 1.0],      // Padrão
            ['project.product', 1.1],       // Produtos são mais rigorosos
            ['project.critical', 1.2],      // Críticos são muito rigorosos
            
            // Experiência da equipe
            ['team.junior', 0.9],           // Times junior têm expectativas menores
            ['team.mid', 1.0],              // Padrão
            ['team.senior', 1.1],           // Times senior têm expectativas maiores
            
            // Restrições de tempo
            ['time.tight', 0.85],           // Prazos apertados são mais lenientes
            ['time.normal', 1.0],           // Padrão
            ['time.flexible', 1.15],        // Tempo flexível permite maior rigor
            
            // Criticidade do negócio
            ['business.low', 0.9],          // Baixa criticidade
            ['business.medium', 1.0],       // Padrão
            ['business.high', 1.1],         // Alta criticidade
            ['business.critical', 1.2],     // Criticidade extrema
            
            // Estágio da iteração
            ['iteration.initial', 0.8],     // Iterações iniciais são mais lenientes
            ['iteration.refinement', 1.0],  // Padrão
            ['iteration.final', 1.3]        // Iterações finais são mais rigorosas
        ]);
    }

    /**
     * Determina nível base pelo score adaptativo
     */
    private determineBaseLevelFromScore(score: number, context: ValidationContext): MaturityLevel {
        // Obtém thresholds ajustados para o contexto
        const thresholds = this.getAdjustedThresholds(context);

        if (score >= thresholds.exemplar) return 5;
        if (score >= thresholds.highQuality) return 4;
        if (score >= thresholds.professional) return 3;
        if (score >= thresholds.basic) return 2;
        return 1;
    }

    /**
     * Ajusta nível baseado em bloqueadores críticos
     */
    private adjustForBlockers(
        baseLevel: MaturityLevel,
        blockers: ValidationBlocker[],
        context: ValidationContext
    ): MaturityLevel {
        let adjustedLevel = baseLevel;
        
        // Bloqueadores críticos sempre rebaixam para Level 1 ou 2 max
        if (blockers.length > 0) {
            const criteria = this.criteria.get(adjustedLevel);
            if (criteria && blockers.length > criteria.maxCriticalBlockers) {
                // Calcula quanto rebaixar baseado no número de bloqueadores
                const excessBlockers = blockers.length - criteria.maxCriticalBlockers;
                adjustedLevel = Math.max(1, adjustedLevel - Math.ceil(excessBlockers / 2)) as MaturityLevel;
            }
        }

        return adjustedLevel;
    }

    /**
     * Aplica modificadores contextuais
     */
    private applyContextualModifiers(
        level: MaturityLevel,
        context: ValidationContext,
        validationResult: IntelligentValidationResult
    ): MaturityLevel {
        let adjustedLevel = level;
        
        // Aplica modificadores baseados no contexto
        const modifiers = [
            `project.${context.projectType}`,
            `team.${context.teamExperience}`,
            `time.${context.timeConstraints}`,
            `business.${context.businessCriticality}`,
            `iteration.${context.iterationStage}`
        ];

        let totalModifier = 1.0;
        for (const modifier of modifiers) {
            totalModifier *= this.contextualModifiers.get(modifier) || 1.0;
        }

        // Se o modificador sugere ser mais leniente, pode promover um nível
        if (totalModifier < 0.9 && adjustedLevel < 5) {
            adjustedLevel = (adjustedLevel + 1) as MaturityLevel;
        }
        // Se o modificador sugere ser mais rigoroso, pode rebaixar um nível
        else if (totalModifier > 1.1 && adjustedLevel > 1) {
            adjustedLevel = (adjustedLevel - 1) as MaturityLevel;
        }

        return adjustedLevel;
    }

    /**
     * Determina se pode avançar baseado no nível e contexto
     */
    private determineAdvancementEligibility(
        level: MaturityLevel,
        validationResult: IntelligentValidationResult,
        context: ValidationContext
    ): boolean {
        const criteria = this.criteria.get(level);
        if (!criteria) return false;

        const policy = criteria.advancementPolicy;

        // Verifica bloqueadores críticos
        if (validationResult.blockers.length > 0 && !policy.allowAdvanceWithMinorBlockers) {
            return false;
        }

        // Verifica warnings
        if (validationResult.warnings.length > policy.maxWarningsForAutoAdvance) {
            return policy.allowAdvanceWithWarnings;
        }

        // Verifica overrides contextuais
        const contextKey = `${context.projectType}`;
        if (policy.contextualOverrides.includes(contextKey)) {
            return true;
        }

        // Level 2+ pode sempre avançar por padrão (sistema não-bloqueante)
        return level >= 2;
    }

    /**
     * Gera ações recomendadas baseadas no nível de maturidade
     */
    private generateMaturityActions(
        level: MaturityLevel,
        validationResult: IntelligentValidationResult,
        context: ValidationContext
    ): MaturityAction[] {
        const actions: MaturityAction[] = [];

        // Sempre sugere avançar se elegível
        if (this.determineAdvancementEligibility(level, validationResult, context)) {
            actions.push({
                action: 'advance',
                priority: 'immediate',
                description: `Avançar para próxima fase (nível ${level} é suficiente)`,
                estimatedHours: 0,
                expectedImpact: 'high'
            });
        }

        // Sugere iteração se há melhorias fáceis
        if (level < 3 && validationResult.recommendations.length > 0) {
            const quickFixes = validationResult.recommendations.filter(r => r.effort === 'quick');
            if (quickFixes.length > 0) {
                actions.push({
                    action: 'iterate',
                    priority: 'soon',
                    description: `Implementar ${quickFixes.length} melhorias rápidas antes de avançar`,
                    estimatedHours: quickFixes.length * 0.5,
                    expectedImpact: 'medium'
                });
            }
        }

        // Sugere consulta para projetos críticos com problemas
        if (context.businessCriticality === 'critical' && level < 3) {
            actions.push({
                action: 'consult',
                priority: 'soon',
                description: 'Consultar especialista devido à criticidade do projeto',
                estimatedHours: 1,
                expectedImpact: 'high'
            });
        }

        // Sugere pesquisa se há conhecimento faltando
        if (validationResult.semanticMatches.filter(m => !m.found).length > 2) {
            actions.push({
                action: 'research',
                priority: 'eventual',
                description: 'Pesquisar conceitos em falta para melhorar qualidade',
                estimatedHours: 2,
                expectedImpact: 'medium'
            });
        }

        return actions.slice(0, 3); // Limita a 3 ações
    }

    /**
     * Compila assessment final
     */
    private compileAssessment(
        level: MaturityLevel,
        canAdvance: boolean,
        validationResult: IntelligentValidationResult,
        adaptiveScore: AdaptiveScore,
        context: ValidationContext,
        actions: MaturityAction[]
    ): MaturityAssessment {
        const criteria = this.criteria.get(level)!;
        const nextLevel = Math.min(5, level + 1) as MaturityLevel;
        const nextCriteria = this.criteria.get(nextLevel);

        return {
            level,
            canAdvance,
            advancementReason: canAdvance 
                ? this.generateAdvancementReason(level, context, validationResult)
                : this.generateBlockageReason(validationResult),
            levelDescription: criteria.description,
            nextLevelRequirements: nextCriteria?.requiredElements || [],
            strengths: this.identifyStrengths(validationResult, adaptiveScore),
            improvementAreas: this.identifyImprovementAreas(validationResult, adaptiveScore),
            contextualFactors: this.getContextualFactors(context),
            recommendedActions: actions
        };
    }

    // Métodos auxiliares
    private getAdjustedThresholds(context: ValidationContext) {
        return {
            exemplar: 90,
            highQuality: 80,
            professional: 65,
            basic: 40
        };
    }

    private generateAdvancementReason(level: MaturityLevel, context: ValidationContext, result: IntelligentValidationResult): string {
        if (level >= 3) return `Qualidade ${this.criteria.get(level)?.name} atingida - avanço recomendado`;
        if (context.projectType === 'poc') return 'POC com estrutura suficiente para validação';
        if (context.timeConstraints === 'tight') return 'Prazo apertado permite avanço com iteração posterior';
        return 'Estrutura básica presente, permite avanço com melhorias incrementais';
    }

    private generateBlockageReason(result: IntelligentValidationResult): string {
        if (result.blockers.length > 0) {
            return `${result.blockers.length} bloqueador(es) crítico(s) impedem avanço`;
        }
        return 'Qualidade insuficiente para avanço seguro';
    }

    private identifyStrengths(result: IntelligentValidationResult, score: AdaptiveScore): string[] {
        const strengths: string[] = [];
        
        if (score.components.semantic > 70) strengths.push('Conceitos bem definidos');
        if (score.components.completeness > 70) strengths.push('Estrutura completa');
        if (score.components.quality > 70) strengths.push('Boa qualidade de conteúdo');
        if (score.components.consistency > 70) strengths.push('Consistência interna');
        
        return strengths;
    }

    private identifyImprovementAreas(result: IntelligentValidationResult, score: AdaptiveScore): string[] {
        const areas: string[] = [];
        
        if (score.components.semantic < 60) areas.push('Conceitos precisam ser melhor definidos');
        if (score.components.completeness < 60) areas.push('Estrutura incompleta');
        if (score.components.quality < 60) areas.push('Qualidade do conteúdo pode melhorar');
        
        return areas;
    }

    private getContextualFactors(context: ValidationContext): string[] {
        return [
            `Projeto tipo ${context.projectType}`,
            `Equipe ${context.teamExperience}`,
            `Prazo ${context.timeConstraints}`,
            `Criticidade ${context.businessCriticality}`
        ];
    }

    private identifyKeyBarriers(current: MaturityLevel, desired: MaturityLevel, result: IntelligentValidationResult): string[] {
        const barriers: string[] = [];
        
        if (result.blockers.length > 0) {
            barriers.push(`${result.blockers.length} bloqueador(es) crítico(s)`);
        }
        
        if (result.completenessAnalysis.missingCritical.length > 0) {
            barriers.push(`${result.completenessAnalysis.missingCritical.length} elemento(s) crítico(s) faltando`);
        }
        
        return barriers;
    }

    private identifyQuickWins(current: MaturityLevel, desired: MaturityLevel, result: IntelligentValidationResult): string[] {
        return result.recommendations
            .filter(r => r.effort === 'quick' && r.impact === 'high')
            .map(r => r.title)
            .slice(0, 3);
    }
}
