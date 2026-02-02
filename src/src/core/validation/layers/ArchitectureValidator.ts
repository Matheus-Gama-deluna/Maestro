import type { LayerValidator, LayerValidationResult, ValidationContext, ValidationIssue } from '../types.js';

/**
 * Validador de Arquitetura (Fase 2 - Melhoria #10)
 * 
 * Verifica:
 * - Respeito às camadas arquiteturais
 * - Direção de dependências
 * - Fitness functions
 * - Violações arquiteturais
 */
export class ArchitectureValidator implements LayerValidator {
    async validate(code: string, context?: ValidationContext): Promise<LayerValidationResult> {
        const issues: ValidationIssue[] = [];
        const startTime = new Date().toISOString();

        // 1. Verificar violações de camadas
        const layerIssues = await this.checkLayerViolations(code, context);
        issues.push(...layerIssues);

        // 2. Verificar direção de dependências
        const depIssues = await this.checkDependencyDirection(code, context);
        issues.push(...depIssues);

        // 3. Executar fitness functions
        const fitnessIssues = await this.runFitnessFunctions(code, context);
        issues.push(...fitnessIssues);

        // Calcular score
        const score = this.calculateScore(issues);
        const passed = score >= 80;

        return {
            layer: 'Arquitetura',
            score,
            passed,
            issues,
            suggestions: this.generateSuggestions(issues),
            timestamp: startTime
        };
    }

    private async checkLayerViolations(code: string, context?: ValidationContext): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Detectar camada do arquivo baseado no path
        const filePath = context?.projectPath || '';
        const layer = this.detectLayer(filePath);

        if (!layer) return issues;

        // Regras de camadas (Clean Architecture / Hexagonal)
        const layerRules: Record<string, { canImport: string[], cannotImport: string[] }> = {
            domain: {
                canImport: ['domain'],
                cannotImport: ['infrastructure', 'adapters', 'presentation']
            },
            application: {
                canImport: ['domain', 'application'],
                cannotImport: ['infrastructure', 'adapters', 'presentation']
            },
            infrastructure: {
                canImport: ['domain', 'application', 'infrastructure'],
                cannotImport: []
            },
            adapters: {
                canImport: ['domain', 'application', 'adapters'],
                cannotImport: []
            },
            presentation: {
                canImport: ['domain', 'application', 'presentation'],
                cannotImport: ['infrastructure']
            }
        };

        // Verificar imports
        const imports = this.extractImports(code);
        const rules = layerRules[layer];

        if (rules) {
            for (const imp of imports) {
                const importLayer = this.detectLayer(imp);
                if (importLayer && rules.cannotImport.includes(importLayer)) {
                    issues.push({
                        type: 'layer-violation',
                        severity: 'high',
                        message: `Camada ${layer} não pode importar de ${importLayer}: ${imp}`
                    });
                }
            }
        }

        return issues;
    }

    private async checkDependencyDirection(code: string, context?: ValidationContext): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar dependências circulares (simplificado)
        const imports = this.extractImports(code);
        const filePath = context?.projectPath || '';

        // Detectar imports que voltam para o mesmo módulo
        for (const imp of imports) {
            if (imp.includes(filePath.split('/').slice(-2, -1)[0])) {
                issues.push({
                    type: 'circular-dependency',
                    severity: 'high',
                    message: `Possível dependência circular detectada: ${imp}`
                });
            }
        }

        // Verificar acoplamento alto
        if (imports.length > 15) {
            issues.push({
                type: 'high-coupling',
                severity: 'medium',
                message: `Alto acoplamento: ${imports.length} imports. Considere reduzir dependências.`
            });
        }

        return issues;
    }

    private async runFitnessFunctions(code: string, context?: ValidationContext): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Fitness Function 1: Módulos devem ser independentes
        const exports = (code.match(/export\s+(class|function|const|interface)/g) || []).length;
        const imports = this.extractImports(code).length;
        
        if (imports > exports * 2) {
            issues.push({
                type: 'module-isolation',
                severity: 'medium',
                message: 'Módulo importa muito mais do que exporta. Considere melhor isolamento.'
            });
        }

        // Fitness Function 2: Interfaces sobre implementações
        const interfaceCount = (code.match(/interface\s+\w+/g) || []).length;
        const classCount = (code.match(/class\s+\w+/g) || []).length;
        
        if (classCount > 3 && interfaceCount === 0) {
            issues.push({
                type: 'missing-abstractions',
                severity: 'low',
                message: 'Considere usar interfaces para melhor abstração e testabilidade.'
            });
        }

        // Fitness Function 3: Tamanho do arquivo
        const lines = code.split('\n').length;
        if (lines > 300) {
            issues.push({
                type: 'large-file',
                severity: 'medium',
                message: `Arquivo muito grande (${lines} linhas). Considere dividir em módulos menores.`
            });
        }

        // Fitness Function 4: Responsabilidade única
        const publicMethods = (code.match(/public\s+\w+\s*\(/g) || []).length;
        if (publicMethods > 10) {
            issues.push({
                type: 'srp-violation',
                severity: 'medium',
                message: `Muitos métodos públicos (${publicMethods}). Pode violar Single Responsibility Principle.`
            });
        }

        return issues;
    }

    private detectLayer(path: string): string | null {
        const lowerPath = path.toLowerCase();
        
        if (lowerPath.includes('/domain/') || lowerPath.includes('/entities/')) {
            return 'domain';
        }
        if (lowerPath.includes('/application/') || lowerPath.includes('/usecases/')) {
            return 'application';
        }
        if (lowerPath.includes('/infrastructure/') || lowerPath.includes('/repositories/')) {
            return 'infrastructure';
        }
        if (lowerPath.includes('/adapters/') || lowerPath.includes('/controllers/')) {
            return 'adapters';
        }
        if (lowerPath.includes('/presentation/') || lowerPath.includes('/views/')) {
            return 'presentation';
        }
        
        return null;
    }

    private extractImports(code: string): string[] {
        const imports: string[] = [];
        
        // import ... from '...'
        const importMatches = code.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
            imports.push(match[1]);
        }
        
        // require('...')
        const requireMatches = code.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const match of requireMatches) {
            imports.push(match[1]);
        }
        
        return imports;
    }

    private calculateScore(issues: ValidationIssue[]): number {
        let score = 100;

        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 25;
                    break;
                case 'high':
                    score -= 15;
                    break;
                case 'medium':
                    score -= 8;
                    break;
                case 'low':
                    score -= 3;
                    break;
            }
        }

        return Math.max(0, score);
    }

    private generateSuggestions(issues: ValidationIssue[]): string[] {
        const suggestions: string[] = [];

        const layerViolations = issues.filter(i => i.type === 'layer-violation');
        if (layerViolations.length > 0) {
            suggestions.push('Corrija violações de camadas para manter arquitetura limpa');
        }

        const circularDeps = issues.filter(i => i.type === 'circular-dependency');
        if (circularDeps.length > 0) {
            suggestions.push('Remova dependências circulares refatorando módulos');
        }

        const coupling = issues.filter(i => i.type === 'high-coupling');
        if (coupling.length > 0) {
            suggestions.push('Reduza acoplamento usando interfaces e injeção de dependência');
        }

        const srp = issues.filter(i => i.type === 'srp-violation');
        if (srp.length > 0) {
            suggestions.push('Divida classes grandes seguindo Single Responsibility Principle');
        }

        if (suggestions.length === 0) {
            suggestions.push('Arquitetura está bem estruturada!');
        }

        return suggestions;
    }
}
