/**
 * Sistema de Recomendações Contextuais - Sugestões inteligentes e acionáveis
 * 
 * Features principais:
 * - Recomendações priorizadas por impacto e esforço
 * - Auto-fixes quando tecnicamente viável
 * - Sugestões contextuais baseadas no tipo de projeto
 * - Exemplos práticos e específicos
 * 
 * @version 3.0.0
 */

import type { 
    SmartRecommendation, 
    AutofixAction, 
    ValidationContext, 
    SemanticMatch, 
    CompletenessAnalysis, 
    QualityAssessment 
} from "./intelligent-validator.js";
import type { AdaptiveScore } from "./adaptive-scoring.js";
import type { Fase } from "../types/index.js";

export interface RecommendationConfig {
    maxRecommendations: number;
    priorityThreshold: number;
    includeOptional: boolean;
    includeAutoFixes: boolean;
}

export interface UserProfile {
    experienceLevel: 'junior' | 'mid' | 'senior';
    preferredStyle: 'concise' | 'detailed' | 'examples';
    commonPatterns: string[];
    recentProjects: string[];
    feedbackHistory: RecommendationFeedback[];
}

export interface RecommendationFeedback {
    recommendationId: string;
    wasUseful: boolean;
    wasUsed: boolean;
    userComment?: string;
    timeToImplement?: number;
}

export interface RecommendationTemplate {
    id: string;
    phase: string;
    trigger: string;
    title: string;
    description: string;
    examples: string[];
    effort: 'quick' | 'moderate' | 'complex';
    impact: 'high' | 'medium' | 'low';
    autofix?: AutofixTemplate;
}

export interface AutofixTemplate {
    type: 'append' | 'replace' | 'insert' | 'restructure';
    pattern: string;
    replacement: string;
    confidence: number;
}

/**
 * Gerador inteligente de recomendações contextuais
 */
export class ContextualRecommender {
    private templates: Map<string, RecommendationTemplate[]>;
    private userProfiles: Map<string, UserProfile>;
    private phasePatterns: Map<string, string[]>;

    constructor() {
        this.templates = new Map();
        this.userProfiles = new Map();
        this.phasePatterns = new Map();
        this.initializeTemplates();
        this.initializePhasePatterns();
    }

    /**
     * Gera recomendações inteligentes priorizadas
     */
    public generateSmartRecommendations(
        semanticMatches: SemanticMatch[],
        completeness: CompletenessAnalysis,
        quality: QualityAssessment,
        adaptiveScore: AdaptiveScore,
        context: ValidationContext,
        userProfile?: UserProfile,
        config?: RecommendationConfig
    ): SmartRecommendation[] {
        const defaultConfig: RecommendationConfig = {
            maxRecommendations: 8,
            priorityThreshold: 0.3,
            includeOptional: true,
            includeAutoFixes: true
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        const recommendations: SmartRecommendation[] = [];

        // 1. Recomendações para problemas semânticos
        recommendations.push(...this.generateSemanticRecommendations(
            semanticMatches, 
            context, 
            userProfile
        ));

        // 2. Recomendações para completude
        recommendations.push(...this.generateCompletenessRecommendations(
            completeness, 
            context, 
            userProfile
        ));

        // 3. Recomendações para qualidade
        recommendations.push(...this.generateQualityRecommendations(
            quality, 
            context, 
            userProfile
        ));

        // 4. Recomendações baseadas no score adaptativo
        recommendations.push(...this.generateScoreBasedRecommendations(
            adaptiveScore, 
            context, 
            userProfile
        ));

        // 5. Recomendações contextuais específicas da fase
        recommendations.push(...this.generatePhaseSpecificRecommendations(
            context, 
            semanticMatches, 
            completeness, 
            userProfile
        ));

        // 6. Prioriza, filtra e limita
        return this.prioritizeAndFilter(recommendations, finalConfig, userProfile);
    }

    /**
     * Gera auto-fixes quando tecnicamente viável
     */
    public generateAutoFixes(
        content: string, 
        recommendations: SmartRecommendation[],
        context: ValidationContext
    ): SmartRecommendation[] {
        const autoFixableRecommendations: SmartRecommendation[] = [];

        for (const recommendation of recommendations) {
            if (!recommendation.autofix) continue;

            const autofix = this.generateAutoFixAction(
                content,
                recommendation,
                context
            );

            if (autofix && autofix.confidence > 0.7) {
                autoFixableRecommendations.push({
                    ...recommendation,
                    autofix,
                    type: 'critical', // Auto-fixes são sempre críticos
                    effort: 'quick'   // Auto-fixes são sempre rápidos
                });
            }
        }

        return autoFixableRecommendations;
    }

    /**
     * Atualiza perfil do usuário baseado em feedback
     */
    public updateUserProfile(
        userId: string,
        feedback: RecommendationFeedback[]
    ): void {
        let profile = this.userProfiles.get(userId);
        
        if (!profile) {
            profile = this.createDefaultProfile();
        }

        // Atualiza histórico de feedback
        profile.feedbackHistory.push(...feedback);

        // Aprende padrões baseado no feedback
        this.learnFromFeedback(profile, feedback);

        this.userProfiles.set(userId, profile);
    }

    /**
     * Gera recomendações para problemas semânticos
     */
    private generateSemanticRecommendations(
        semanticMatches: SemanticMatch[],
        context: ValidationContext,
        userProfile?: UserProfile
    ): SmartRecommendation[] {
        const recommendations: SmartRecommendation[] = [];

        for (const match of semanticMatches) {
            if (match.found) continue; // Só recomenda para conceitos não encontrados

            const template = this.findBestTemplate(
                context.phase.nome,
                'semantic',
                match.concept
            );

            if (template) {
                recommendations.push({
                    id: `semantic_${match.concept}_${Date.now()}`,
                    type: 'critical',
                    priority: this.calculatePriority(match.concept, context),
                    impact: template.impact,
                    effort: template.effort,
                    title: template.title.replace('[CONCEPT]', match.concept),
                    description: this.personalizeDescription(
                        template.description, 
                        context, 
                        userProfile
                    ),
                    examples: this.personalizeExamples(
                        template.examples, 
                        context, 
                        userProfile
                    ),
                    estimatedTimeMinutes: this.estimateTimeMinutes(template.effort),
                    autofix: template.autofix ? this.convertToAutofix(template.autofix) : undefined
                });
            }
        }

        return recommendations;
    }

    /**
     * Gera recomendações para completude
     */
    private generateCompletenessRecommendations(
        completeness: CompletenessAnalysis,
        context: ValidationContext,
        userProfile?: UserProfile
    ): SmartRecommendation[] {
        const recommendations: SmartRecommendation[] = [];

        // Recomendações para elementos críticos faltando
        for (const missing of completeness.missingCritical) {
            const template = this.findBestTemplate(
                context.phase.nome,
                'completeness',
                missing
            );

            if (template) {
                recommendations.push({
                    id: `critical_missing_${missing}_${Date.now()}`,
                    type: 'critical',
                    priority: 0.9,
                    impact: 'high',
                    effort: template.effort,
                    title: `Adicionar ${missing}`,
                    description: this.personalizeDescription(
                        template.description,
                        context,
                        userProfile
                    ),
                    examples: this.getExamplesForMissingElement(missing, context),
                    estimatedTimeMinutes: this.estimateTimeMinutes(template.effort),
                    autofix: this.generateStructuralAutofix(missing, context)
                });
            }
        }

        // Recomendações para elementos opcionais
        for (const missing of completeness.missingOptional) {
            if (recommendations.length >= 6) break; // Limita recomendações opcionais

            recommendations.push({
                id: `optional_missing_${missing}_${Date.now()}`,
                type: 'enhancement',
                priority: 0.4,
                impact: 'medium',
                effort: 'moderate',
                title: `Considerar adicionar ${missing}`,
                description: `Adicionar ${missing} pode melhorar a qualidade do entregável`,
                examples: this.getExamplesForMissingElement(missing, context),
                estimatedTimeMinutes: 15
            });
        }

        return recommendations;
    }

    /**
     * Gera recomendações para qualidade
     */
    private generateQualityRecommendations(
        quality: QualityAssessment,
        context: ValidationContext,
        userProfile?: UserProfile
    ): SmartRecommendation[] {
        const recommendations: SmartRecommendation[] = [];
        const threshold = 70; // Threshold para recomendar melhorias

        if (quality.clarity < threshold) {
            recommendations.push({
                id: `quality_clarity_${Date.now()}`,
                type: 'improvement',
                priority: 0.7,
                impact: 'high',
                effort: 'moderate',
                title: 'Melhorar clareza do conteúdo',
                description: 'O conteúdo pode ser mais claro e direto',
                examples: this.getClarityExamples(context),
                estimatedTimeMinutes: 20,
                autofix: this.generateClarityAutofix()
            });
        }

        if (quality.depth < threshold) {
            recommendations.push({
                id: `quality_depth_${Date.now()}`,
                type: 'improvement',
                priority: 0.6,
                impact: 'medium',
                effort: 'moderate',
                title: 'Aumentar profundidade da análise',
                description: 'Adicione mais detalhes e contexto às seções',
                examples: this.getDepthExamples(context),
                estimatedTimeMinutes: 25
            });
        }

        if (quality.practicality < threshold) {
            recommendations.push({
                id: `quality_practicality_${Date.now()}`,
                type: 'improvement',
                priority: 0.6,
                impact: 'high',
                effort: 'quick',
                title: 'Tornar mais prático e aplicável',
                description: 'Inclua exemplos concretos e passos acionáveis',
                examples: this.getPracticalityExamples(context),
                estimatedTimeMinutes: 15
            });
        }

        return recommendations;
    }

    /**
     * Gera recomendações baseadas no score adaptativo
     */
    private generateScoreBasedRecommendations(
        adaptiveScore: AdaptiveScore,
        context: ValidationContext,
        userProfile?: UserProfile
    ): SmartRecommendation[] {
        const recommendations: SmartRecommendation[] = [];

        // Identifica os componentes com menor score para focar melhorias
        const components = [
            { name: 'semantic', score: adaptiveScore.components.semantic, weight: adaptiveScore.weights.semantic },
            { name: 'completeness', score: adaptiveScore.components.completeness, weight: adaptiveScore.weights.completeness },
            { name: 'quality', score: adaptiveScore.components.quality, weight: adaptiveScore.weights.quality },
            { name: 'structure', score: adaptiveScore.components.structure, weight: adaptiveScore.weights.structure },
            { name: 'consistency', score: adaptiveScore.components.consistency, weight: adaptiveScore.weights.consistency }
        ].sort((a, b) => (a.score * a.weight) - (b.score * b.weight));

        // Recomenda melhorias para os 2 componentes mais fracos
        for (let i = 0; i < Math.min(2, components.length); i++) {
            const component = components[i];
            
            if (component.score < 60) { // Só recomenda se score baixo
                recommendations.push({
                    id: `score_${component.name}_${Date.now()}`,
                    type: 'improvement',
                    priority: 0.8 - (i * 0.2), // Primeira prioridade é maior
                    impact: component.weight > 0.3 ? 'high' : 'medium',
                    effort: this.getEffortForComponent(component.name),
                    title: this.getTitleForComponent(component.name),
                    description: this.getDescriptionForComponent(component.name, context),
                    examples: this.getExamplesForComponent(component.name, context),
                    estimatedTimeMinutes: this.getTimeForComponent(component.name)
                });
            }
        }

        return recommendations;
    }

    /**
     * Gera recomendações específicas da fase
     */
    private generatePhaseSpecificRecommendations(
        context: ValidationContext,
        semanticMatches: SemanticMatch[],
        completeness: CompletenessAnalysis,
        userProfile?: UserProfile
    ): SmartRecommendation[] {
        const templates = this.templates.get(context.phase.nome) || [];
        const recommendations: SmartRecommendation[] = [];

        for (const template of templates) {
            // Verifica se a recomendação é aplicável no contexto atual
            if (this.isTemplateApplicable(template, semanticMatches, completeness, context)) {
                recommendations.push({
                    id: `phase_${template.id}_${Date.now()}`,
                    type: 'enhancement',
                    priority: 0.5,
                    impact: template.impact,
                    effort: template.effort,
                    title: template.title,
                    description: this.personalizeDescription(template.description, context, userProfile),
                    examples: this.personalizeExamples(template.examples, context, userProfile),
                    estimatedTimeMinutes: this.estimateTimeMinutes(template.effort),
                    autofix: template.autofix ? this.convertToAutofix(template.autofix) : undefined
                });
            }
        }

        return recommendations;
    }

    /**
     * Prioriza, filtra e limita recomendações
     */
    private prioritizeAndFilter(
        recommendations: SmartRecommendation[],
        config: RecommendationConfig,
        userProfile?: UserProfile
    ): SmartRecommendation[] {
        let filtered = recommendations;

        // 1. Filtra por threshold de prioridade
        filtered = filtered.filter(r => r.priority >= config.priorityThreshold);

        // 2. Remove opcionais se configurado
        if (!config.includeOptional) {
            filtered = filtered.filter(r => r.type !== 'optional');
        }

        // 3. Remove auto-fixes se configurado
        if (!config.includeAutoFixes) {
            filtered = filtered.filter(r => !r.autofix);
        }

        // 4. Ordena por prioridade e impacto
        filtered.sort((a, b) => {
            const scoreA = this.calculateRecommendationScore(a, userProfile);
            const scoreB = this.calculateRecommendationScore(b, userProfile);
            return scoreB - scoreA;
        });

        // 5. Limita quantidade
        return filtered.slice(0, config.maxRecommendations);
    }

    /**
     * Inicializa templates de recomendações
     */
    private initializeTemplates(): void {
        // Templates para fase Produto
        this.templates.set('Produto', [
            {
                id: 'produto_problema',
                phase: 'Produto',
                trigger: 'missing_problema',
                title: 'Definir problema claramente',
                description: 'Adicione uma descrição clara do problema que o produto resolve',
                examples: [
                    'Usuários perdem 30 minutos por dia procurando informações dispersas em diferentes sistemas',
                    'Empresas gastam R$ 10.000/mês em licenças desnecessárias por falta de visibilidade'
                ],
                effort: 'quick',
                impact: 'high',
                autofix: {
                    type: 'append',
                    pattern: '## Problema',
                    replacement: '## Problema\n\n[Descreva claramente qual problema está sendo resolvido]\n\n**Impacto atual:**\n- [Quantifique o impacto do problema]\n- [Adicione dados específicos]\n\n**Por que resolver agora:**\n- [Justifique a urgência]\n',
                    confidence: 0.8
                }
            },
            {
                id: 'produto_personas',
                phase: 'Produto',
                trigger: 'missing_persona',
                title: 'Definir personas principais',
                description: 'Identifique quem são os usuários primários do produto',
                examples: [
                    'Gerentes de projeto (30-45 anos) que coordenam equipes remotas',
                    'Desenvolvedores sênior que precisam de visibilidade sobre dependências'
                ],
                effort: 'moderate',
                impact: 'high'
            }
        ]);

        // Templates para fase Requisitos
        this.templates.set('Requisitos', [
            {
                id: 'requisitos_funcionais',
                phase: 'Requisitos',
                trigger: 'missing_requisitos_funcionais',
                title: 'Adicionar requisitos funcionais com IDs',
                description: 'Liste os requisitos funcionais com identificadores únicos',
                examples: [
                    'RF001 - O sistema deve permitir login com email e senha',
                    'RF002 - O usuário deve poder visualizar dashboard personalizado'
                ],
                effort: 'moderate',
                impact: 'high',
                autofix: {
                    type: 'append',
                    pattern: '## Requisitos Funcionais',
                    replacement: '## Requisitos Funcionais\n\n**RF001** - [Descreva o primeiro requisito funcional]\n\n**RF002** - [Descreva o segundo requisito funcional]\n\n**RF003** - [Descreva o terceiro requisito funcional]\n',
                    confidence: 0.9
                }
            }
        ]);

        // Adiciona mais templates para outras fases...
    }

    /**
     * Inicializa padrões por fase
     */
    private initializePhasePatterns(): void {
        this.phasePatterns.set('Produto', [
            'problema', 'solução', 'usuário', 'valor', 'métrica', 'objetivo'
        ]);
        this.phasePatterns.set('Requisitos', [
            'funcional', 'não-funcional', 'critério', 'aceite', 'performance', 'segurança'
        ]);
        this.phasePatterns.set('UX Design', [
            'wireframe', 'protótipo', 'jornada', 'fluxo', 'usabilidade', 'acessibilidade'
        ]);
    }

    // Métodos auxiliares (implementação simplificada)
    private findBestTemplate(phase: string, category: string, concept: string): RecommendationTemplate | null {
        const templates = this.templates.get(phase) || [];
        return templates.find(t => t.trigger.includes(concept)) || null;
    }

    private calculatePriority(concept: string, context: ValidationContext): number {
        const criticalConcepts = ['problema', 'usuário', 'requisitos_funcionais'];
        return criticalConcepts.includes(concept) ? 0.9 : 0.6;
    }

    private personalizeDescription(description: string, context: ValidationContext, userProfile?: UserProfile): string {
        let personalized = description;
        
        // Personaliza baseado no tipo de projeto
        if (context.projectType === 'poc') {
            personalized = personalized.replace('completo', 'básico');
        }
        
        // Personaliza baseado na experiência
        if (userProfile?.experienceLevel === 'junior') {
            personalized += '\n\n💡 **Dica:** ' + this.getJuniorTip(description);
        }

        return personalized;
    }

    private personalizeExamples(examples: string[], context: ValidationContext, userProfile?: UserProfile): string[] {
        // Filtra exemplos baseado no contexto
        let relevantExamples = examples;
        
        if (context.projectType === 'poc') {
            relevantExamples = examples.filter(ex => !ex.includes('complexo') && !ex.includes('avançado'));
        }

        return relevantExamples.slice(0, 3); // Limita a 3 exemplos
    }

    private estimateTimeMinutes(effort: 'quick' | 'moderate' | 'complex'): number {
        const timeMap = { quick: 10, moderate: 20, complex: 45 };
        return timeMap[effort];
    }

    private convertToAutofix(template: AutofixTemplate): AutofixAction {
        return {
            type: template.type,
            target: template.pattern,
            content: template.replacement,
            confidence: template.confidence
        };
    }

    private generateAutoFixAction(content: string, recommendation: SmartRecommendation, context: ValidationContext): AutofixAction | null {
        if (!recommendation.autofix) return null;
        
        // Verifica se o auto-fix é aplicável no contexto atual
        const isApplicable = this.isAutoFixApplicable(content, recommendation.autofix, context);
        
        return isApplicable ? recommendation.autofix : null;
    }

    private createDefaultProfile(): UserProfile {
        return {
            experienceLevel: 'mid',
            preferredStyle: 'detailed',
            commonPatterns: [],
            recentProjects: [],
            feedbackHistory: []
        };
    }

    private learnFromFeedback(profile: UserProfile, feedback: RecommendationFeedback[]): void {
        // Aprende padrões baseado no feedback positivo
        const positiveFeedback = feedback.filter(f => f.wasUseful);
        // Implementação de aprendizado simples
    }

    private calculateRecommendationScore(recommendation: SmartRecommendation, userProfile?: UserProfile): number {
        let score = recommendation.priority * 100;
        
        // Ajusta baseado no impacto
        const impactMultiplier = { high: 1.2, medium: 1.0, low: 0.8 };
        score *= impactMultiplier[recommendation.impact];
        
        // Ajusta baseado no esforço (menos esforço = maior score)
        const effortMultiplier = { quick: 1.2, moderate: 1.0, complex: 0.8 };
        score *= effortMultiplier[recommendation.effort];
        
        return score;
    }

    // Métodos auxiliares placeholder (implementação completa seria mais complexa)
    private getExamplesForMissingElement(missing: string, context: ValidationContext): string[] { return [`Exemplo para ${missing}`]; }
    private generateStructuralAutofix(missing: string, context: ValidationContext): AutofixAction | undefined { return undefined; }
    private getClarityExamples(context: ValidationContext): string[] { return ['Use linguagem direta', 'Evite jargão técnico']; }
    private generateClarityAutofix(): AutofixAction | undefined { return undefined; }
    private getDepthExamples(context: ValidationContext): string[] { return ['Adicione contexto', 'Inclua justificativas']; }
    private getPracticalityExamples(context: ValidationContext): string[] { return ['Inclua exemplos práticos', 'Adicione passos específicos']; }
    private getEffortForComponent(component: string): 'quick' | 'moderate' | 'complex' { return 'moderate'; }
    private getTitleForComponent(component: string): string { return `Melhorar ${component}`; }
    private getDescriptionForComponent(component: string, context: ValidationContext): string { return `Melhore a ${component} do entregável`; }
    private getExamplesForComponent(component: string, context: ValidationContext): string[] { return [`Exemplo para ${component}`]; }
    private getTimeForComponent(component: string): number { return 20; }
    private isTemplateApplicable(template: RecommendationTemplate, semanticMatches: SemanticMatch[], completeness: CompletenessAnalysis, context: ValidationContext): boolean { return true; }
    private isAutoFixApplicable(content: string, autofix: AutofixAction, context: ValidationContext): boolean { return autofix.confidence > 0.7; }
    private getJuniorTip(description: string): string { return 'Comece com uma versão simples e vá refinando'; }
}
