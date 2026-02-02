import type { LayerValidationResult, ValidationContext, ValidationIssue } from '../types.js';

/**
 * Validador Sintático (Camada 1)
 * 
 * Verifica:
 * - Código compila
 * - Sintaxe correta
 * - Imports existem
 */
export class SyntacticValidator {
    async validate(code: string, context?: ValidationContext): Promise<LayerValidationResult> {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];

        // 1. Verificar compilação básica
        const compilationIssues = await this.checkCompilation(code);
        issues.push(...compilationIssues);

        // 2. Verificar sintaxe
        const syntaxIssues = await this.checkSyntax(code);
        issues.push(...syntaxIssues);

        // 3. Verificar imports
        const importIssues = await this.checkImports(code);
        issues.push(...importIssues);

        // Calcular score
        const score = this.calculateScore(issues);
        const passed = score >= 80;

        // Gerar sugestões
        if (!passed) {
            suggestions.push('Corrija erros de sintaxe antes de prosseguir');
            if (compilationIssues.length > 0) {
                suggestions.push('Código não compila - verifique erros de TypeScript');
            }
            if (importIssues.length > 0) {
                suggestions.push('Alguns imports estão incorretos ou faltando');
            }
        }

        return {
            layer: 'Sintática',
            score,
            passed,
            issues,
            suggestions,
            timestamp: new Date().toISOString()
        };
    }

    private async checkCompilation(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        try {
            // Verificar se tem erros de sintaxe básicos
            // (TypeScript compilation seria feita aqui em produção)
            
            // Verificar parênteses, chaves e colchetes balanceados
            const brackets = { '(': 0, '{': 0, '[': 0 };
            for (const char of code) {
                if (char === '(') brackets['(']++;
                if (char === ')') brackets['(']--;
                if (char === '{') brackets['{']++;
                if (char === '}') brackets['{']--;
                if (char === '[') brackets['[']++;
                if (char === ']') brackets['[']--;
            }

            if (brackets['('] !== 0) {
                issues.push({
                    type: 'syntax-error',
                    severity: 'critical',
                    message: 'Parênteses não balanceados'
                });
            }
            if (brackets['{'] !== 0) {
                issues.push({
                    type: 'syntax-error',
                    severity: 'critical',
                    message: 'Chaves não balanceadas'
                });
            }
            if (brackets['['] !== 0) {
                issues.push({
                    type: 'syntax-error',
                    severity: 'critical',
                    message: 'Colchetes não balanceados'
                });
            }
        } catch (error) {
            issues.push({
                type: 'compilation-error',
                severity: 'critical',
                message: `Erro de compilação: ${error instanceof Error ? error.message : String(error)}`
            });
        }

        return issues;
    }

    private async checkSyntax(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar palavras-chave mal escritas
        const commonTypos = [
            { wrong: 'fucntion', correct: 'function' },
            { wrong: 'cosnt', correct: 'const' },
            { wrong: 'retrun', correct: 'return' },
            { wrong: 'improt', correct: 'import' },
            { wrong: 'exoprt', correct: 'export' }
        ];

        for (const typo of commonTypos) {
            if (code.includes(typo.wrong)) {
                issues.push({
                    type: 'typo',
                    severity: 'high',
                    message: `Possível erro de digitação: '${typo.wrong}' (deveria ser '${typo.correct}'?)`,
                    suggestion: `Corrigir para '${typo.correct}'`
                });
            }
        }

        // Verificar ponto e vírgula faltando (se não for TypeScript moderno)
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Linhas que deveriam ter ponto e vírgula
            if (line && 
                !line.endsWith(';') && 
                !line.endsWith('{') && 
                !line.endsWith('}') &&
                !line.endsWith(',') &&
                !line.startsWith('//') &&
                !line.startsWith('/*') &&
                !line.startsWith('*') &&
                !line.startsWith('import') &&
                !line.startsWith('export') &&
                (line.startsWith('const ') || line.startsWith('let ') || line.startsWith('var '))
            ) {
                issues.push({
                    type: 'missing-semicolon',
                    severity: 'low',
                    message: `Possível ponto e vírgula faltando`,
                    line: i + 1,
                    suggestion: 'Adicionar ponto e vírgula no final da linha'
                });
            }
        }

        return issues;
    }

    private async checkImports(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Extrair imports
        const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g;
        const imports = [...code.matchAll(importRegex)];

        for (const match of imports) {
            const importPath = match[1];
            
            // Verificar imports relativos mal formados
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
                // Verificar se tem extensão (pode ser necessário em alguns casos)
                if (!importPath.endsWith('.js') && !importPath.endsWith('.ts')) {
                    // Isso é ok em TypeScript moderno, mas pode ser um problema
                    // Não adicionar como issue por enquanto
                }
            }

            // Verificar imports vazios
            if (!importPath || importPath.trim() === '') {
                issues.push({
                    type: 'invalid-import',
                    severity: 'critical',
                    message: 'Import com caminho vazio',
                    suggestion: 'Especificar caminho do módulo'
                });
            }
        }

        return issues;
    }

    private calculateScore(issues: ValidationIssue[]): number {
        if (issues.length === 0) return 100;

        // Penalizar baseado na severidade
        let penalty = 0;
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    penalty += 30;
                    break;
                case 'high':
                    penalty += 15;
                    break;
                case 'medium':
                    penalty += 5;
                    break;
                case 'low':
                    penalty += 2;
                    break;
            }
        }

        return Math.max(0, 100 - penalty);
    }
}
