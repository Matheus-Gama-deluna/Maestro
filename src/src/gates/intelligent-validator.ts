/**
 * Sistema de Validação Inteligente - Substitui validação baseada em regex
 * 
 * Features principais:
 * - Validação semântica contextual
 * - Análise de completude inteligente  
 * - Detecção de qualidade real
 * - Adaptação por contexto de projeto
 * 
 * @version 3.0.0
 */

import type { TierGate, Fase } from "../types/index.js";

export interface ValidationContext {
    projectType: 'poc' | 'internal' | 'product' | 'critical';
    teamExperience: 'junior' | 'mid' | 'senior';
    timeConstraints: 'tight' | 'normal' | 'flexible';
    businessCriticality: 'low' | 'medium' | 'high' | 'critical';
    iterationStage: 'initial' | 'refinement' | 'final';
    phase: Fase;
    tier: TierGate;
}

export interface SemanticMatch {
    concept: string;
    found: boolean;
    confidence: number;
    location?: string;
    suggestions?: string[];
}

export interface CompletenessAnalysis {
    totalExpectedElements: number;
    foundElements: number;
    missingCritical: string[];
    missingOptional: string[];
    completenessScore: number;
    structuralIntegrity: number;
}

export interface QualityAssessment {
    clarity: number;           // Clareza do conteúdo
    depth: number;            // Profundidade da análise
    coherence: number;        // Coerência interna
    practicality: number;     // Aplicabilidade prática
    completeness: number;     // Completude
    overall: number;          // Score geral
}

export interface IntelligentValidationResult {
    isValid: boolean;
    maturityLevel: 1 | 2 | 3 | 4 | 5;
    canAdvance: boolean;
    semanticMatches: SemanticMatch[];
    completenessAnalysis: CompletenessAnalysis;
    qualityAssessment: QualityAssessment;
    adaptiveScore: number;
    recommendations: SmartRecommendation[];
    blockers: ValidationBlocker[];
    warnings: ValidationWarning[];
    contextAdaptations: string[];
}

export interface SmartRecommendation {
    id: string;
    type: 'critical' | 'improvement' | 'enhancement' | 'optional';
    priority: number;
    impact: 'high' | 'medium' | 'low';
    effort: 'quick' | 'moderate' | 'complex';
    title: string;
    description: string;
    examples?: string[];
    autofix?: AutofixAction;
    estimatedTimeMinutes?: number;
}

export interface AutofixAction {
    type: 'append' | 'replace' | 'insert' | 'restructure';
    target: string;
    content: string;
    confidence: number;
}

export interface ValidationBlocker {
    id: string;
    severity: 'critical';
    message: string;
    requirement: string;
    howToFix: string;
    examples: string[];
}

export interface ValidationWarning {
    id: string;
    severity: 'warning' | 'info';
    message: string;
    suggestion: string;
    impact: string;
}

/**
 * Core do novo sistema de validação inteligente
 */
export class IntelligentValidator {
    private semanticPatterns!: Map<string, RegExp[]>;
    private qualityIndicators!: Map<string, string[]>;
    private contextualWeights!: Map<string, number>;

    constructor() {
        this.initializePatterns();
        this.initializeQualityIndicators();
        this.initializeContextualWeights();
    }

    /**
     * Valida conteúdo usando inteligência contextual
     */
    public validateContent(
        content: string, 
        context: ValidationContext
    ): IntelligentValidationResult {
        // 1. Análise semântica dos conceitos esperados
        const semanticMatches = this.validateSemanticContent(
            content, 
            this.getExpectedConcepts(context.phase)
        );

        // 2. Análise de completude estrutural
        const completenessAnalysis = this.analyzeCompleteness(
            content, 
            context
        );

        // 3. Avaliação de qualidade multi-dimensional
        const qualityAssessment = this.assessQuality(
            content, 
            this.getQualityCriteria(context)
        );

        // 4. Score adaptativo baseado no contexto
        const adaptiveScore = this.calculateAdaptiveScore(
            semanticMatches,
            completenessAnalysis,
            qualityAssessment,
            context
        );

        // 5. Determinação do nível de maturidade
        const maturityLevel = this.determineMaturityLevel(
            adaptiveScore,
            completenessAnalysis,
            context
        );

        // 6. Geração de recomendações inteligentes
        const recommendations = this.generateRecommendations(
            semanticMatches,
            completenessAnalysis,
            qualityAssessment,
            context
        );

        // 7. Identificação de bloqueadores e avisos
        const { blockers, warnings } = this.identifyIssues(
            semanticMatches,
            completenessAnalysis,
            qualityAssessment,
            context
        );

        // 8. Determinação se pode avançar
        const canAdvance = this.canAdvanceToNextPhase(
            maturityLevel,
            blockers,
            context
        );

        return {
            isValid: blockers.length === 0,
            maturityLevel,
            canAdvance,
            semanticMatches,
            completenessAnalysis,
            qualityAssessment,
            adaptiveScore,
            recommendations,
            blockers,
            warnings,
            contextAdaptations: this.getContextAdaptations(context)
        };
    }

    /**
     * Validação semântica contextual - substitui regex simples
     */
    public validateSemanticContent(
        content: string, 
        expectedConcepts: string[]
    ): SemanticMatch[] {
        const matches: SemanticMatch[] = [];
        const normalizedContent = this.normalizeContent(content);

        for (const concept of expectedConcepts) {
            const patterns = this.semanticPatterns.get(concept) || [];
            const synonyms = this.getConceptSynonyms(concept);
            
            let found = false;
            let confidence = 0;
            let location = '';

            // Busca por padrões semânticos, não apenas palavras-chave
            for (const pattern of patterns) {
                const match = normalizedContent.match(pattern);
                if (match) {
                    found = true;
                    confidence = Math.max(confidence, 0.9);
                    location = this.extractContext(content, match.index || 0);
                    break;
                }
            }

            // Fallback para sinônimos se não encontrou padrões
            if (!found) {
                for (const synonym of synonyms) {
                    if (normalizedContent.includes(synonym.toLowerCase())) {
                        found = true;
                        confidence = Math.max(confidence, 0.6);
                        location = this.findSynonymContext(content, synonym);
                        break;
                    }
                }
            }

            matches.push({
                concept,
                found,
                confidence,
                location: found ? location : undefined,
                suggestions: found ? undefined : this.getSuggestions(concept)
            });
        }

        return matches;
    }

    /**
     * Análise de completude inteligente - considera contexto
     */
    public analyzeCompleteness(
        content: string, 
        context: ValidationContext
    ): CompletenessAnalysis {
        const expectedElements = this.getExpectedElements(context);
        const foundElements: string[] = [];
        const missingCritical: string[] = [];
        const missingOptional: string[] = [];

        // Análise estrutural baseada no tipo de documento
        const structure = this.analyzeStructure(content, context.phase);

        // Verifica cada elemento esperado
        for (const element of expectedElements) {
            const isPresent = this.isElementPresent(content, element, context);
            
            if (isPresent) {
                foundElements.push(element.name);
            } else {
                if (element.critical) {
                    missingCritical.push(element.name);
                } else {
                    missingOptional.push(element.name);
                }
            }
        }

        const completenessScore = expectedElements.length > 0 
            ? (foundElements.length / expectedElements.length) * 100
            : 100;

        return {
            totalExpectedElements: expectedElements.length,
            foundElements: foundElements.length,
            missingCritical,
            missingOptional,
            completenessScore: Math.round(completenessScore),
            structuralIntegrity: structure.integrity
        };
    }

    /**
     * Avaliação de qualidade multi-dimensional
     */
    public assessQuality(
        content: string, 
        criteria: QualityCriteria
    ): QualityAssessment {
        const clarity = this.assessClarity(content);
        const depth = this.assessDepth(content, criteria);
        const coherence = this.assessCoherence(content);
        const practicality = this.assessPracticality(content, criteria);
        const completeness = this.assessCompleteness(content, criteria);

        const overall = Math.round(
            (clarity * 0.2) +
            (depth * 0.25) +
            (coherence * 0.2) +
            (practicality * 0.2) +
            (completeness * 0.15)
        );

        return {
            clarity,
            depth,
            coherence,
            practicality,
            completeness,
            overall
        };
    }

    /**
     * Score adaptativo baseado no contexto
     */
    private calculateAdaptiveScore(
        semanticMatches: SemanticMatch[],
        completeness: CompletenessAnalysis,
        quality: QualityAssessment,
        context: ValidationContext
    ): number {
        // Pesos adaptativos baseados no contexto
        const weights = this.getAdaptiveWeights(context);
        
        const semanticScore = this.calculateSemanticScore(semanticMatches);
        
        const adaptiveScore = Math.round(
            (semanticScore * weights.semantic) +
            (completeness.completenessScore * weights.completeness) +
            (quality.overall * weights.quality) +
            (completeness.structuralIntegrity * weights.structure)
        );

        return Math.max(0, Math.min(100, adaptiveScore));
    }

    /**
     * Determina nível de maturidade (1-5)
     */
    private determineMaturityLevel(
        adaptiveScore: number,
        completeness: CompletenessAnalysis,
        context: ValidationContext
    ): 1 | 2 | 3 | 4 | 5 {
        // Ajusta thresholds baseado no contexto
        const thresholds = this.getMaturityThresholds(context);
        
        // Considera bloqueadores críticos
        if (completeness.missingCritical.length > 0) {
            return 1; // Conceito inicial
        }

        if (adaptiveScore >= thresholds.exemplar) {
            return 5; // Exemplar
        } else if (adaptiveScore >= thresholds.highQuality) {
            return 4; // Alta qualidade
        } else if (adaptiveScore >= thresholds.professional) {
            return 3; // Padrão profissional
        } else if (adaptiveScore >= thresholds.basic) {
            return 2; // Estrutura básica
        } else {
            return 1; // Conceito inicial
        }
    }

    /**
     * Inicialização dos padrões semânticos
     */
    private initializePatterns(): void {
        this.semanticPatterns = new Map([
            ['problema', [
                /problema\s+(?:que\s+)?(?:estamos\s+)?(?:tentando\s+)?(?:resolver|solucionar|abordar)/i,
                /(?:dor|pain\s+point|dificuldade|desafio).*(?:usuário|cliente|negócio)/i,
                /(?:por\s+que|why|motivação).*(?:projeto|solução|produto)/i
            ]],
            ['persona', [
                /(?:usuário|user|cliente|persona).*(?:típico|principal|primário|target)/i,
                /(?:público|audience).*(?:alvo|target)/i,
                /(?:perfil|características).*(?:usuário|user)/i
            ]],
            ['mvp', [
                /(?:mvp|minimum\s+viable|mínimo\s+viável|produto\s+mínimo)/i,
                /(?:funcionalidades|features).*(?:essenciais|básicas|principais|core)/i,
                /(?:escopo|scope).*(?:inicial|primeiro|v1|primeira)/i
            ]],
            ['metricas', [
                /(?:métrica|kpi|indicador|objetivo).*(?:sucesso|performance)/i,
                /(?:como|how).*(?:medir|avaliar|acompanhar|monitorar)/i,
                /(?:\d+%|\d+\s+usuários|\d+\s+conversões)/i
            ]]
        ]);
    }

    /**
     * Inicialização dos indicadores de qualidade
     */
    private initializeQualityIndicators(): void {
        this.qualityIndicators = new Map([
            ['dados_concretos', ['%', 'usuários', 'clientes', 'R$', '$', 'ms', 'seg', 'MB', 'GB']],
            ['temporalidade', ['2024', '2025', 'Q1', 'Q2', 'Q3', 'Q4', 'sprint', 'semana']],
            ['especificidade', ['RF001', 'US001', 'AC001', 'ID:', 'versão', 'API']],
            ['exemplos', ['exemplo', 'como:', 'por exemplo', 'e.g.', 'cenário', 'caso']]
        ]);
    }

    /**
     * Inicialização dos pesos contextuais
     */
    private initializeContextualWeights(): void {
        this.contextualWeights = new Map([
            ['poc.semantic', 0.4], ['poc.completeness', 0.3], ['poc.quality', 0.2], ['poc.structure', 0.1],
            ['internal.semantic', 0.3], ['internal.completeness', 0.4], ['internal.quality', 0.2], ['internal.structure', 0.1],
            ['product.semantic', 0.25], ['product.completeness', 0.35], ['product.quality', 0.3], ['product.structure', 0.1],
            ['critical.semantic', 0.2], ['critical.completeness', 0.3], ['critical.quality', 0.35], ['critical.structure', 0.15]
        ]);
    }

    // Métodos auxiliares (implementação simplificada)
    private normalizeContent(content: string): string {
        return content.toLowerCase()
            .replace(/[^\w\s\-\.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private getExpectedConcepts(phase: Fase): string[] {
        const conceptsMap: Record<string, string[]> = {
            'Produto': ['problema', 'persona', 'mvp', 'metricas'],
            'Requisitos': ['requisitos_funcionais', 'requisitos_nao_funcionais', 'criterios_aceite'],
            'UX Design': ['wireframes', 'jornadas', 'fluxos'],
            'Arquitetura': ['stack', 'diagrama', 'decisões'],
            'Backlog': ['epicos', 'historias', 'definition_of_done']
        };
        return conceptsMap[phase.nome] || [];
    }

    private getConceptSynonyms(concept: string): string[] {
        const synonymsMap: Record<string, string[]> = {
            'problema': ['dificuldade', 'desafio', 'pain point', 'dor', 'necessidade'],
            'persona': ['usuário', 'cliente', 'público-alvo', 'target', 'perfil'],
            'mvp': ['produto mínimo', 'versão inicial', 'primeiro release', 'beta'],
            'metricas': ['kpi', 'indicadores', 'objetivos', 'metas', 'resultados']
        };
        return synonymsMap[concept] || [];
    }

    private getSuggestions(concept: string): string[] {
        const suggestionsMap: Record<string, string[]> = {
            'problema': [
                'Descreva claramente qual problema você está resolvendo',
                'Adicione contexto sobre o impacto do problema',
                'Inclua dados quantitativos sobre o problema'
            ],
            'persona': [
                'Defina quem são os usuários principais',
                'Adicione características demográficas',
                'Descreva comportamentos e necessidades'
            ]
        };
        return suggestionsMap[concept] || [`Adicione informações sobre: ${concept}`];
    }

    private extractContext(content: string, position: number): string {
        const start = Math.max(0, position - 50);
        const end = Math.min(content.length, position + 50);
        return '...' + content.substring(start, end) + '...';
    }

    private findSynonymContext(content: string, synonym: string): string {
        const index = content.toLowerCase().indexOf(synonym.toLowerCase());
        return index >= 0 ? this.extractContext(content, index) : '';
    }

    // Placeholder para métodos complexos que serão implementados posteriormente
    private getExpectedElements(context: ValidationContext): any[] { return []; }
    private analyzeStructure(content: string, phase: Fase): any { return { integrity: 85 }; }
    private isElementPresent(content: string, element: any, context: ValidationContext): boolean { return true; }
    private assessClarity(content: string): number { return 80; }
    private assessDepth(content: string, criteria: any): number { return 75; }
    private assessCoherence(content: string): number { return 82; }
    private assessPracticality(content: string, criteria: any): number { return 78; }
    private assessCompleteness(content: string, criteria: any): number { return 85; }
    private getQualityCriteria(context: ValidationContext): any { return {}; }
    private getAdaptiveWeights(context: ValidationContext): any {
        const key = context.projectType;
        return {
            semantic: this.contextualWeights.get(`${key}.semantic`) || 0.3,
            completeness: this.contextualWeights.get(`${key}.completeness`) || 0.4,
            quality: this.contextualWeights.get(`${key}.quality`) || 0.2,
            structure: this.contextualWeights.get(`${key}.structure`) || 0.1
        };
    }
    private calculateSemanticScore(matches: SemanticMatch[]): number {
        if (matches.length === 0) return 0;
        const avgConfidence = matches
            .filter(m => m.found)
            .reduce((sum, m) => sum + m.confidence, 0) / matches.length;
        return Math.round(avgConfidence * 100);
    }
    private getMaturityThresholds(context: ValidationContext): any {
        return {
            exemplar: 90,
            highQuality: 80,
            professional: 70,
            basic: 50
        };
    }
    private generateRecommendations(semanticMatches: SemanticMatch[], completeness: CompletenessAnalysis, quality: QualityAssessment, context: ValidationContext): SmartRecommendation[] {
        return [];
    }
    private identifyIssues(semanticMatches: SemanticMatch[], completeness: CompletenessAnalysis, quality: QualityAssessment, context: ValidationContext): { blockers: ValidationBlocker[], warnings: ValidationWarning[] } {
        return { blockers: [], warnings: [] };
    }
    private canAdvanceToNextPhase(maturityLevel: number, blockers: ValidationBlocker[], context: ValidationContext): boolean {
        return blockers.length === 0 && maturityLevel >= 2;
    }
    private getContextAdaptations(context: ValidationContext): string[] {
        return [`Adaptado para projeto ${context.projectType}`, `Tier: ${context.tier}`];
    }
}

// Tipos auxiliares
interface QualityCriteria {
    domain: string;
    complexity: string;
    audience: string;
}
