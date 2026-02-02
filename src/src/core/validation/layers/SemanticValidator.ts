import type { LayerValidationResult, ValidationContext, ValidationIssue } from '../types.js';

/**
 * Validador Semântico (Camada 2)
 * 
 * Verifica:
 * - Faz sentido no contexto
 * - Usa APIs corretas
 * - Tipos batem
 */
export class SemanticValidator {
    async validate(code: string, context?: ValidationContext): Promise<LayerValidationResult> {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];

        // 1. Verificar contexto
        const contextIssues = await this.checkContext(code, context);
        issues.push(...contextIssues);

        // 2. Verificar uso de APIs
        const apiIssues = await this.checkAPIUsage(code);
        issues.push(...apiIssues);

        // 3. Verificar tipos
        const typeIssues = await this.checkTypes(code);
        issues.push(...typeIssues);

        // Calcular score
        const score = this.calculateScore(issues);
        const passed = score >= 70;

        // Gerar sugestões
        if (!passed) {
            suggestions.push('Revisar uso de APIs e tipos');
            if (contextIssues.length > 0) {
                suggestions.push('Código pode não fazer sentido no contexto atual');
            }
            if (apiIssues.length > 0) {
                suggestions.push('Verificar documentação das APIs utilizadas');
            }
        }

        return {
            layer: 'Semântica',
            score,
            passed,
            issues,
            suggestions,
            timestamp: new Date().toISOString()
        };
    }

    private async checkContext(code: string, context?: ValidationContext): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar se usa variáveis não declaradas
        const variableUsage = this.extractVariableUsage(code);
        const variableDeclarations = this.extractVariableDeclarations(code);

        for (const variable of variableUsage) {
            if (!variableDeclarations.includes(variable) && !this.isBuiltIn(variable)) {
                issues.push({
                    type: 'undefined-variable',
                    severity: 'high',
                    message: `Variável '${variable}' pode não estar definida`,
                    suggestion: `Declarar '${variable}' antes de usar`
                });
            }
        }

        return issues;
    }

    private async checkAPIUsage(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar uso de APIs depreciadas
        const deprecatedAPIs = [
            { api: 'var ', message: 'Use const ou let ao invés de var' },
            { api: '.substr(', message: 'Use .substring() ao invés de .substr()' },
            { api: 'new Buffer(', message: 'Use Buffer.from() ao invés de new Buffer()' }
        ];

        for (const deprecated of deprecatedAPIs) {
            if (code.includes(deprecated.api)) {
                issues.push({
                    type: 'deprecated-api',
                    severity: 'medium',
                    message: `API depreciada: ${deprecated.api}`,
                    suggestion: deprecated.message
                });
            }
        }

        // Verificar uso incorreto de async/await
        if (code.includes('await ') && !code.includes('async ')) {
            issues.push({
                type: 'async-await-mismatch',
                severity: 'high',
                message: 'Uso de await sem função async',
                suggestion: 'Adicionar async à função que usa await'
            });
        }

        return issues;
    }

    private async checkTypes(code: string): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Verificar comparações suspeitas
        if (code.includes('==') && !code.includes('===')) {
            issues.push({
                type: 'loose-equality',
                severity: 'low',
                message: 'Uso de == ao invés de ===',
                suggestion: 'Preferir === para comparações estritas'
            });
        }

        // Verificar conversões de tipo implícitas
        const suspiciousPatterns = [
            { pattern: /\+\s*""/g, message: 'Conversão implícita para string' },
            { pattern: /\*\s*1/g, message: 'Conversão implícita para número' }
        ];

        for (const { pattern, message } of suspiciousPatterns) {
            if (pattern.test(code)) {
                issues.push({
                    type: 'implicit-conversion',
                    severity: 'low',
                    message,
                    suggestion: 'Usar conversão explícita (String(), Number())'
                });
            }
        }

        return issues;
    }

    private extractVariableUsage(code: string): string[] {
        const variables: string[] = [];
        
        // Regex simples para identificar uso de variáveis
        const usageRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        const matches = code.matchAll(usageRegex);
        
        for (const match of matches) {
            const variable = match[1];
            if (!this.isKeyword(variable)) {
                variables.push(variable);
            }
        }
        
        return [...new Set(variables)];
    }

    private extractVariableDeclarations(code: string): string[] {
        const declarations: string[] = [];
        
        // Regex para declarações
        const declRegex = /(?:const|let|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        const matches = code.matchAll(declRegex);
        
        for (const match of matches) {
            declarations.push(match[1]);
        }
        
        return declarations;
    }

    private isKeyword(word: string): boolean {
        const keywords = [
            'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
            'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
            'throw', 'new', 'this', 'super', 'class', 'extends', 'import', 'export',
            'default', 'async', 'await', 'typeof', 'instanceof', 'void', 'delete'
        ];
        return keywords.includes(word);
    }

    private isBuiltIn(word: string): boolean {
        const builtIns = [
            'console', 'process', 'Buffer', 'setTimeout', 'setInterval',
            'clearTimeout', 'clearInterval', 'Promise', 'Array', 'Object',
            'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON', 'Error',
            'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol'
        ];
        return builtIns.includes(word);
    }

    private calculateScore(issues: ValidationIssue[]): number {
        if (issues.length === 0) return 100;

        let penalty = 0;
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    penalty += 25;
                    break;
                case 'high':
                    penalty += 12;
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
