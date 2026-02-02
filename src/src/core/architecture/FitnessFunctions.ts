import type { ArchitectureRule, FitnessResult, RuleResult, ProjectStructure } from './types.js';

/**
 * Fitness Functions (Fase 2 - Melhoria #12)
 * 
 * Garantem qualidade arquitetural através de regras automatizadas
 */
export class FitnessFunctions {
    private rules: ArchitectureRule[];

    constructor() {
        this.rules = [
            {
                id: 'no-circular-deps',
                name: 'Sem Dependências Circulares',
                description: 'Detecta e previne dependências circulares entre módulos',
                severity: 'error',
                validate: (project) => this.checkCircularDependencies(project)
            },
            {
                id: 'layer-dependency-direction',
                name: 'Direção de Dependências entre Camadas',
                description: 'Domínio não pode depender de Infraestrutura',
                severity: 'error',
                validate: (project) => this.checkLayerDependencies(project)
            },
            {
                id: 'module-isolation',
                name: 'Isolamento de Módulos',
                description: 'Módulos devem ser independentes',
                severity: 'warning',
                validate: (project) => this.checkModuleIsolation(project)
            },
            {
                id: 'test-coverage',
                name: 'Cobertura de Testes',
                description: 'Cobertura mínima de 70%',
                severity: 'warning',
                validate: (project) => this.checkTestCoverage(project)
            },
            {
                id: 'max-complexity',
                name: 'Complexidade Máxima',
                description: 'Complexidade ciclomática < 10',
                severity: 'warning',
                validate: (project) => this.checkComplexity(project)
            }
        ];
    }

    /**
     * Valida todas as regras arquiteturais
     */
    async validateAll(project: ProjectStructure): Promise<FitnessResult> {
        console.log('[FitnessFunctions] Validando arquitetura do projeto');

        const results: RuleResult[] = [];

        for (const rule of this.rules) {
            console.log(`[FitnessFunctions] Executando regra: ${rule.name}`);
            
            try {
                const result = await rule.validate(project);
                results.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    severity: rule.severity,
                    passed: result.passed,
                    violations: result.violations || []
                });
            } catch (error) {
                console.error(`[FitnessFunctions] Erro na regra ${rule.name}:`, error);
                results.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    severity: rule.severity,
                    passed: false,
                    violations: [`Erro ao executar regra: ${error}`]
                });
            }
        }

        const overallPassed = results.every(r => r.severity !== 'error' || r.passed);

        return {
            overallPassed,
            results,
            summary: this.generateSummary(results)
        };
    }

    /**
     * Executa regra específica
     */
    async runRule(ruleId: string, project: ProjectStructure): Promise<RuleResult> {
        const rule = this.rules.find(r => r.id === ruleId);
        
        if (!rule) {
            throw new Error(`Regra não encontrada: ${ruleId}`);
        }

        const result = await rule.validate(project);
        
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            passed: result.passed,
            violations: result.violations || []
        };
    }

    /**
     * Verifica dependências circulares
     */
    private checkCircularDependencies(project: ProjectStructure): { passed: boolean; violations: string[] } {
        const violations: string[] = [];
        const graph = this.buildDependencyGraph(project);
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const detectCycle = (node: string, path: string[]): boolean => {
            if (recursionStack.has(node)) {
                violations.push(`Dependência circular detectada: ${[...path, node].join(' → ')}`);
                return true;
            }

            if (visited.has(node)) return false;

            visited.add(node);
            recursionStack.add(node);

            const dependencies = graph.get(node) || [];
            for (const dep of dependencies) {
                if (detectCycle(dep, [...path, node])) {
                    return true;
                }
            }

            recursionStack.delete(node);
            return false;
        };

        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                detectCycle(node, []);
            }
        }

        return {
            passed: violations.length === 0,
            violations
        };
    }

    /**
     * Verifica direção de dependências entre camadas
     */
    private checkLayerDependencies(project: ProjectStructure): { passed: boolean; violations: string[] } {
        const violations: string[] = [];

        // Regras de camadas (Clean Architecture)
        const layerHierarchy = ['domain', 'application', 'infrastructure', 'presentation'];
        
        for (const file of project.files || []) {
            const fileLayer = this.detectLayer(file.path);
            if (!fileLayer) continue;

            const imports = this.extractImports(file.content);
            
            for (const imp of imports) {
                const importLayer = this.detectLayer(imp);
                if (!importLayer) continue;

                const fileLayerIndex = layerHierarchy.indexOf(fileLayer);
                const importLayerIndex = layerHierarchy.indexOf(importLayer);

                // Camadas internas não podem depender de camadas externas
                if (fileLayerIndex < importLayerIndex) {
                    violations.push(
                        `${file.path}: Camada ${fileLayer} não pode depender de ${importLayer}`
                    );
                }
            }
        }

        return {
            passed: violations.length === 0,
            violations
        };
    }

    /**
     * Verifica isolamento de módulos
     */
    private checkModuleIsolation(project: ProjectStructure): { passed: boolean; violations: string[] } {
        const violations: string[] = [];

        for (const file of project.files || []) {
            const imports = this.extractImports(file.content);
            const exports = this.extractExports(file.content);

            // Módulo importa muito mais do que exporta
            if (imports.length > exports.length * 3) {
                violations.push(
                    `${file.path}: Alto acoplamento (${imports.length} imports vs ${exports.length} exports)`
                );
            }
        }

        return {
            passed: violations.length === 0,
            violations
        };
    }

    /**
     * Verifica cobertura de testes
     */
    private checkTestCoverage(project: ProjectStructure): { passed: boolean; violations: string[] } {
        const violations: string[] = [];

        const sourceFiles = (project.files || []).filter(f => 
            !f.path.includes('test') && !f.path.includes('spec')
        );
        const testFiles = (project.files || []).filter(f => 
            f.path.includes('test') || f.path.includes('spec')
        );

        const coverage = testFiles.length / sourceFiles.length;

        if (coverage < 0.7) {
            violations.push(
                `Cobertura de testes baixa: ${(coverage * 100).toFixed(1)}% (mínimo: 70%)`
            );
        }

        return {
            passed: coverage >= 0.7,
            violations
        };
    }

    /**
     * Verifica complexidade ciclomática
     */
    private checkComplexity(project: ProjectStructure): { passed: boolean; violations: string[] } {
        const violations: string[] = [];

        for (const file of project.files || []) {
            const complexity = this.calculateComplexity(file.content);
            
            if (complexity > 10) {
                violations.push(
                    `${file.path}: Complexidade alta (${complexity})`
                );
            }
        }

        return {
            passed: violations.length === 0,
            violations
        };
    }

    /**
     * Constrói grafo de dependências
     */
    private buildDependencyGraph(project: ProjectStructure): Map<string, string[]> {
        const graph = new Map<string, string[]>();

        for (const file of project.files || []) {
            const imports = this.extractImports(file.content);
            graph.set(file.path, imports);
        }

        return graph;
    }

    /**
     * Detecta camada do arquivo
     */
    private detectLayer(path: string): string | null {
        const lower = path.toLowerCase();
        if (lower.includes('/domain/')) return 'domain';
        if (lower.includes('/application/')) return 'application';
        if (lower.includes('/infrastructure/')) return 'infrastructure';
        if (lower.includes('/presentation/')) return 'presentation';
        return null;
    }

    /**
     * Extrai imports do código
     */
    private extractImports(code: string): string[] {
        const imports: string[] = [];
        const matches = code.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
        for (const match of matches) {
            imports.push(match[1]);
        }
        return imports;
    }

    /**
     * Extrai exports do código
     */
    private extractExports(code: string): string[] {
        const exports: string[] = [];
        const matches = code.matchAll(/export\s+(class|function|const|interface)\s+(\w+)/g);
        for (const match of matches) {
            exports.push(match[2]);
        }
        return exports;
    }

    /**
     * Calcula complexidade ciclomática
     */
    private calculateComplexity(code: string): number {
        let complexity = 1;
        const patterns = [/\bif\s*\(/g, /\bwhile\s*\(/g, /\bfor\s*\(/g, /\bcase\s+/g, /&&/g, /\|\|/g];
        
        for (const pattern of patterns) {
            const matches = code.match(pattern);
            if (matches) complexity += matches.length;
        }
        
        return complexity;
    }

    /**
     * Gera resumo dos resultados
     */
    private generateSummary(results: RuleResult[]): string {
        const passed = results.filter(r => r.passed).length;
        const failed = results.length - passed;
        const errors = results.filter(r => r.severity === 'error' && !r.passed).length;

        return `${passed}/${results.length} regras passaram | ${errors} erros críticos`;
    }

    /**
     * Lista todas as regras disponíveis
     */
    getRules(): ArchitectureRule[] {
        return this.rules;
    }
}
