import type { LayerValidator, LayerValidationResult, ValidationContext, ValidationIssue } from '../types.js';

/**
 * Validador de Qualidade (Fase 2 - Melhoria #10)
 * 
 * Verifica:
 * - Padrões do projeto
 * - Code smells
 * - Testabilidade
 * - Complexidade ciclomática
 */
export class QualityValidator implements LayerValidator {
    async validate(code: string, context?: ValidationContext): Promise<LayerValidationResult> {
        const issues: ValidationIssue[] = [];
        const startTime = new Date().toISOString();

        // 1. Verificar padrões do projeto
        const patternIssues = await this.checkProjectPatterns(code);
        issues.push(...patternIssues);

        // 2. Verificar code smells
        const smellIssues = await this.checkCodeSmells(code);
        issues.push(...smellIssues);

        // 3. Verificar testabilidade
        const testabilityIssues = await this.checkTestability(code);
        issues.push(...testabilityIssues);

        // 4. Verificar complexidade ciclomática
        const complexityIssues = await this.checkComplexity(code);
        issues.push(...complexityIssues);

        // Calcular score
        const score = this.calculateScore(issues);
        const passed = score >= 70;

        return {
            layer: 'Qualidade',
            score,
            passed,
            issues,
            suggestions: this.generateSuggestions(issues),
            timestamp: startTime
        };
    }

    private async checkProjectPatterns(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar naming conventions
        if (!/^[A-Z]/.test(code.match(/class\s+(\w+)/)?.[1] || '')) {
            issues.push({
                type: 'naming-convention',
                severity: 'low',
                message: 'Classes devem começar com letra maiúscula'
            });
        }

        // Verificar uso de const/let vs var
        if (code.includes('var ')) {
            issues.push({
                type: 'deprecated-syntax',
                severity: 'medium',
                message: 'Evite usar "var", prefira "const" ou "let"'
            });
        }

        // Verificar uso de any
        const anyCount = (code.match(/:\s*any/g) || []).length;
        if (anyCount > 3) {
            issues.push({
                type: 'type-safety',
                severity: 'medium',
                message: `Uso excessivo de "any" (${anyCount} ocorrências). Prefira tipos específicos.`
            });
        }

        return issues;
    }

    private async checkCodeSmells(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Funções muito longas (> 50 linhas)
        const functions = code.match(/function\s+\w+[^{]*\{[^}]*\}/gs) || [];
        for (const func of functions) {
            const lines = func.split('\n').length;
            if (lines > 50) {
                issues.push({
                    type: 'long-function',
                    severity: 'medium',
                    message: `Função com ${lines} linhas. Considere refatorar em funções menores.`
                });
            }
        }

        // Muitos parâmetros (> 5)
        const funcWithManyParams = code.match(/function\s+\w+\s*\([^)]{50,}\)/g);
        if (funcWithManyParams) {
            issues.push({
                type: 'too-many-parameters',
                severity: 'medium',
                message: 'Função com muitos parâmetros. Considere usar objeto de configuração.'
            });
        }

        // Código duplicado
        const lines = code.split('\n');
        const duplicates = this.findDuplicateLines(lines);
        if (duplicates > 5) {
            issues.push({
                type: 'code-duplication',
                severity: 'high',
                message: `${duplicates} linhas duplicadas encontradas. Considere extrair para função.`
            });
        }

        // Magic numbers
        const magicNumbers = code.match(/\b\d{2,}\b/g) || [];
        if (magicNumbers.length > 5) {
            issues.push({
                type: 'magic-numbers',
                severity: 'low',
                message: 'Números mágicos encontrados. Considere usar constantes nomeadas.'
            });
        }

        return issues;
    }

    private async checkTestability(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar se há dependências hardcoded
        if (code.includes('new ') && !code.includes('constructor')) {
            issues.push({
                type: 'hard-dependency',
                severity: 'medium',
                message: 'Dependências instanciadas diretamente dificultam testes. Considere injeção de dependência.'
            });
        }

        // Verificar funções puras vs side effects
        if (code.includes('console.log') || code.includes('process.exit')) {
            issues.push({
                type: 'side-effects',
                severity: 'low',
                message: 'Side effects encontrados. Considere isolar lógica pura.'
            });
        }

        // Verificar acoplamento
        const imports = (code.match(/import.*from/g) || []).length;
        if (imports > 10) {
            issues.push({
                type: 'high-coupling',
                severity: 'medium',
                message: `Alto acoplamento (${imports} imports). Considere reduzir dependências.`
            });
        }

        return issues;
    }

    private async checkComplexity(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Calcular complexidade ciclomática simplificada
        const complexity = this.calculateCyclomaticComplexity(code);
        
        if (complexity > 15) {
            issues.push({
                type: 'high-complexity',
                severity: 'high',
                message: `Complexidade ciclomática alta (${complexity}). Refatore para reduzir.`
            });
        } else if (complexity > 10) {
            issues.push({
                type: 'moderate-complexity',
                severity: 'medium',
                message: `Complexidade ciclomática moderada (${complexity}). Considere simplificar.`
            });
        }

        // Verificar aninhamento profundo
        const maxNesting = this.calculateMaxNesting(code);
        if (maxNesting > 4) {
            issues.push({
                type: 'deep-nesting',
                severity: 'medium',
                message: `Aninhamento profundo (${maxNesting} níveis). Considere early returns.`
            });
        }

        return issues;
    }

    private calculateScore(issues: ValidationIssue[]): number {
        let score = 100;

        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 20;
                    break;
                case 'high':
                    score -= 10;
                    break;
                case 'medium':
                    score -= 5;
                    break;
                case 'low':
                    score -= 2;
                    break;
            }
        }

        return Math.max(0, score);
    }

    private generateSuggestions(issues: ValidationIssue[]): string[] {
        const suggestions: string[] = [];

        const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
        if (criticalIssues.length > 0) {
            suggestions.push('Priorize correção de problemas críticos e altos');
        }

        const smells = issues.filter(i => i.type.includes('smell') || i.type.includes('duplication'));
        if (smells.length > 0) {
            suggestions.push('Refatore código duplicado e code smells');
        }

        const complexity = issues.filter(i => i.type.includes('complexity'));
        if (complexity.length > 0) {
            suggestions.push('Simplifique funções complexas quebrando em funções menores');
        }

        if (suggestions.length === 0) {
            suggestions.push('Qualidade do código está boa!');
        }

        return suggestions;
    }

    private findDuplicateLines(lines: string[]): number {
        const seen = new Map<string, number>();
        let duplicates = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 20) { // Ignora linhas muito curtas
                const count = seen.get(trimmed) || 0;
                seen.set(trimmed, count + 1);
                if (count > 0) duplicates++;
            }
        }

        return duplicates;
    }

    private calculateCyclomaticComplexity(code: string): number {
        // Simplificado: conta pontos de decisão
        let complexity = 1; // Base

        // if, else if, while, for, case, catch, &&, ||, ?
        const patterns = [
            /\bif\s*\(/g,
            /\belse\s+if\s*\(/g,
            /\bwhile\s*\(/g,
            /\bfor\s*\(/g,
            /\bcase\s+/g,
            /\bcatch\s*\(/g,
            /&&/g,
            /\|\|/g,
            /\?/g
        ];

        for (const pattern of patterns) {
            const matches = code.match(pattern);
            if (matches) complexity += matches.length;
        }

        return complexity;
    }

    private calculateMaxNesting(code: string): number {
        let maxNesting = 0;
        let currentNesting = 0;

        for (const char of code) {
            if (char === '{') {
                currentNesting++;
                maxNesting = Math.max(maxNesting, currentNesting);
            } else if (char === '}') {
                currentNesting--;
            }
        }

        return maxNesting;
    }
}
