import type {
    ValidationLayer,
    LayerValidationResult,
    PipelineResult,
    ValidationContext,
    TIER_SCORES
} from './types.js';
import { SyntacticValidator } from './layers/SyntacticValidator.js';
import { SemanticValidator } from './layers/SemanticValidator.js';
import { QualityValidator } from './layers/QualityValidator.js';
import { ArchitectureValidator } from './layers/ArchitectureValidator.js';
import { SecurityValidatorWrapper } from './layers/SecurityValidatorWrapper.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Pipeline de Validação Multi-Camadas (Fase 2 - Melhoria #10)
 * 
 * Valida código em 5 camadas sequenciais:
 * 1. Sintática (≥ 80%) - Compilação, sintaxe, imports
 * 2. Semântica (≥ 70%) - Contexto, APIs, tipos
 * 3. Qualidade (≥ 70%) - Padrões, code smells, testabilidade
 * 4. Arquitetura (≥ 80%) - Camadas, dependências, fitness functions
 * 5. Segurança (≥ 90%) - OWASP, vulnerabilidades
 */
export class ValidationPipeline {
    private layers: ValidationLayer[];

    constructor() {
        this.layers = [
            {
                name: 'Sintática',
                order: 1,
                minScore: 80,
                validator: new SyntacticValidator(),
                stopOnFailure: true // Para se falhar (código não compila)
            },
            {
                name: 'Semântica',
                order: 2,
                minScore: 70,
                validator: new SemanticValidator(),
                stopOnFailure: false
            },
            {
                name: 'Qualidade',
                order: 3,
                minScore: 70,
                validator: new QualityValidator(),
                stopOnFailure: false
            },
            {
                name: 'Arquitetura',
                order: 4,
                minScore: 80,
                validator: new ArchitectureValidator(),
                stopOnFailure: false
            },
            {
                name: 'Segurança',
                order: 5,
                minScore: 90,
                validator: new SecurityValidatorWrapper(),
                stopOnFailure: true // Para se encontrar vulnerabilidades críticas
            }
        ];
    }

    /**
     * Valida código através do pipeline completo
     */
    async validate(
        code: string,
        tier: 'essencial' | 'base' | 'avancado' = 'base',
        context?: ValidationContext
    ): Promise<PipelineResult> {
        const results: LayerValidationResult[] = [];
        const startTime = new Date().toISOString();

        console.log(`[ValidationPipeline] Iniciando validação (tier: ${tier})`);

        // Executar camadas sequencialmente
        for (const layer of this.layers) {
            console.log(`[ValidationPipeline] Executando camada: ${layer.name}`);
            
            try {
                const result = await layer.validator.validate(code, context);
                results.push(result);

                // Verificar se deve parar
                if (!result.passed && layer.stopOnFailure) {
                    console.log(`[ValidationPipeline] Parando pipeline - ${layer.name} falhou (crítico)`);
                    break;
                }
            } catch (error) {
                console.error(`[ValidationPipeline] Erro na camada ${layer.name}:`, error);
                results.push({
                    layer: layer.name,
                    score: 0,
                    passed: false,
                    issues: [{
                        type: 'validation-error',
                        severity: 'critical',
                        message: `Erro ao executar validação: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    suggestions: ['Verificar logs para detalhes do erro'],
                    timestamp: new Date().toISOString()
                });

                if (layer.stopOnFailure) {
                    break;
                }
            }
        }

        // Gerar relatório final
        const pipelineResult = this.generateReport(results, tier, startTime);

        // Salvar relatório
        await this.saveReport(pipelineResult);

        return pipelineResult;
    }

    /**
     * Valida camada específica
     */
    async validateLayer(
        code: string,
        layerName: string,
        context?: ValidationContext
    ): Promise<LayerValidationResult> {
        const layer = this.layers.find(l => l.name.toLowerCase() === layerName.toLowerCase());
        
        if (!layer) {
            throw new Error(`Camada não encontrada: ${layerName}`);
        }

        return layer.validator.validate(code, context);
    }

    /**
     * Gera relatório consolidado
     */
    private generateReport(
        results: LayerValidationResult[],
        tier: string,
        startTime: string
    ): PipelineResult {
        // Calcular score geral (média ponderada)
        const totalWeight = results.length;
        const weightedScore = results.reduce((sum, r) => sum + r.score, 0) / totalWeight;

        // Verificar se passou (todas as camadas críticas passaram)
        const passed = results.every(r => r.passed || !this.isCriticalLayer(r.layer));

        // Gerar recomendações
        const recommendations = this.generateRecommendations(results);

        return {
            overallScore: Math.round(weightedScore),
            passed,
            results,
            recommendations,
            tier: tier as 'essencial' | 'base' | 'avancado',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Verifica se camada é crítica
     */
    private isCriticalLayer(layerName: string): boolean {
        const layer = this.layers.find(l => l.name === layerName);
        return layer?.stopOnFailure ?? false;
    }

    /**
     * Gera recomendações baseadas nos resultados
     */
    private generateRecommendations(results: LayerValidationResult[]): string[] {
        const recommendations: string[] = [];

        for (const result of results) {
            if (!result.passed) {
                recommendations.push(`❌ ${result.layer}: Score ${result.score}% - ${result.issues.length} problemas encontrados`);
                
                // Adicionar sugestões da camada
                if (result.suggestions.length > 0) {
                    recommendations.push(...result.suggestions.map(s => `  💡 ${s}`));
                }
            } else {
                recommendations.push(`✅ ${result.layer}: Score ${result.score}% - Aprovado`);
            }
        }

        // Recomendação geral
        const failedLayers = results.filter(r => !r.passed);
        if (failedLayers.length > 0) {
            recommendations.push('');
            recommendations.push(`📊 Resumo: ${failedLayers.length} camada(s) falharam`);
            recommendations.push('🔧 Corrija os problemas acima antes de prosseguir');
        } else {
            recommendations.push('');
            recommendations.push('🎉 Todas as camadas passaram com sucesso!');
        }

        return recommendations;
    }

    /**
     * Salva relatório de validação
     */
    private async saveReport(result: PipelineResult): Promise<void> {
        try {
            const reportsDir = path.join(process.cwd(), '.maestro', 'validation', 'reports');
            await fs.mkdir(reportsDir, { recursive: true });

            const filename = `validation-${Date.now()}.json`;
            const filepath = path.join(reportsDir, filename);

            await fs.writeFile(filepath, JSON.stringify(result, null, 2));
            console.log(`[ValidationPipeline] Relatório salvo: ${filepath}`);
        } catch (error) {
            console.error('[ValidationPipeline] Erro ao salvar relatório:', error);
        }
    }

    /**
     * Retorna configuração de scores mínimos por tier
     */
    getMinScores(tier: 'essencial' | 'base' | 'avancado') {
        const scores = {
            essencial: {
                sintatica: 80,
                semantica: 60,
                qualidade: 50,
                arquitetura: 60,
                seguranca: 70
            },
            base: {
                sintatica: 80,
                semantica: 70,
                qualidade: 70,
                arquitetura: 80,
                seguranca: 90
            },
            avancado: {
                sintatica: 90,
                semantica: 80,
                qualidade: 80,
                arquitetura: 90,
                seguranca: 95
            }
        };

        return scores[tier];
    }
}
