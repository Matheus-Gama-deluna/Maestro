import { ValidationResult, ValidationIssue, DependencyInfo } from './types.js';

export class DependencyValidator {
    /**
     * Valida todas as dependências em um código
     */
    async validate(code: string, language: 'typescript' | 'javascript' | 'python' = 'typescript'): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // Extrair imports
        const imports = this.extractImports(code, language);

        // Validar cada import
        for (const imp of imports) {
            // Verificar se é import externo (não relativo)
            if (!imp.path.startsWith('.') && !imp.path.startsWith('/')) {
                const packageName = this.extractPackageName(imp.path);
                const exists = await this.checkPackageExists(packageName, language);

                if (!exists) {
                    issues.push({
                        severity: 'high',
                        type: 'hallucinated_dependency',
                        message: `Pacote "${packageName}" não existe`,
                        line: imp.line,
                        suggestion: `Verifique se o nome do pacote está correto ou se precisa ser instalado`
                    });
                }
            }

            // Validar funções importadas
            if (imp.imports.length > 0) {
                // Aqui poderíamos validar se as funções existem no pacote
                // Por ora, apenas registramos
            }
        }

        const score = this.calculateScore(issues);

        return {
            valid: score >= 70,
            score,
            issues,
            summary: this.generateSummary(issues)
        };
    }

    /**
     * Extrai imports do código
     */
    private extractImports(code: string, language: string): Array<{path: string, imports: string[], line: number}> {
        const imports: Array<{path: string, imports: string[], line: number}> = [];
        const lines = code.split('\n');

        if (language === 'typescript' || language === 'javascript') {
            lines.forEach((line, index) => {
                // import { a, b } from 'package'
                const namedMatch = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
                if (namedMatch) {
                    imports.push({
                        path: namedMatch[2],
                        imports: namedMatch[1].split(',').map(s => s.trim()),
                        line: index + 1
                    });
                    return;
                }

                // import package from 'package'
                const defaultMatch = line.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
                if (defaultMatch) {
                    imports.push({
                        path: defaultMatch[2],
                        imports: [defaultMatch[1]],
                        line: index + 1
                    });
                    return;
                }

                // import 'package'
                const bareMatch = line.match(/import\s+['"]([^'"]+)['"]/);
                if (bareMatch) {
                    imports.push({
                        path: bareMatch[1],
                        imports: [],
                        line: index + 1
                    });
                }
            });
        } else if (language === 'python') {
            lines.forEach((line, index) => {
                // from package import a, b
                const fromMatch = line.match(/from\s+(\S+)\s+import\s+(.+)/);
                if (fromMatch) {
                    imports.push({
                        path: fromMatch[1],
                        imports: fromMatch[2].split(',').map(s => s.trim()),
                        line: index + 1
                    });
                    return;
                }

                // import package
                const importMatch = line.match(/import\s+(\S+)/);
                if (importMatch) {
                    imports.push({
                        path: importMatch[1],
                        imports: [],
                        line: index + 1
                    });
                }
            });
        }

        return imports;
    }

    /**
     * Extrai nome do pacote de um import path
     */
    private extractPackageName(importPath: string): string {
        // @scope/package/subpath -> @scope/package
        if (importPath.startsWith('@')) {
            const parts = importPath.split('/');
            return `${parts[0]}/${parts[1]}`;
        }

        // package/subpath -> package
        return importPath.split('/')[0];
    }

    /**
     * Verifica se pacote existe
     */
    async checkPackageExists(packageName: string, language: string): Promise<boolean> {
        // Lista de pacotes conhecidos (built-in)
        const builtInPackages: Record<string, string[]> = {
            typescript: ['fs', 'path', 'crypto', 'http', 'https', 'util', 'events', 'stream'],
            javascript: ['fs', 'path', 'crypto', 'http', 'https', 'util', 'events', 'stream'],
            python: ['os', 'sys', 'json', 'datetime', 're', 'math', 'random']
        };

        if (builtInPackages[language]?.includes(packageName)) {
            return true;
        }

        // Pacotes populares conhecidos
        const popularPackages = [
            'react', 'vue', 'angular', 'express', 'axios', 'lodash', 'moment',
            'typescript', 'webpack', 'babel', 'eslint', 'prettier', 'jest',
            'next', 'nuxt', 'vite', 'tailwindcss', 'prisma', 'typeorm',
            'fastify', 'koa', 'nest', 'socket.io', 'redis', 'mongodb'
        ];

        if (popularPackages.includes(packageName)) {
            return true;
        }

        // Aqui poderíamos fazer chamada real para npm/pypi
        // Por ora, assumimos que pacotes desconhecidos podem não existir
        return false;
    }

    /**
     * Calcula score de validação
     */
    private calculateScore(issues: ValidationIssue[]): number {
        let score = 100;

        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 30;
                    break;
                case 'high':
                    score -= 20;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        }

        return Math.max(0, score);
    }

    /**
     * Gera resumo da validação
     */
    private generateSummary(issues: ValidationIssue[]): string {
        if (issues.length === 0) {
            return '✅ Todas as dependências são válidas';
        }

        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;
        const medium = issues.filter(i => i.severity === 'medium').length;
        const low = issues.filter(i => i.severity === 'low').length;

        const parts: string[] = [];
        if (critical > 0) parts.push(`${critical} crítico(s)`);
        if (high > 0) parts.push(`${high} alto(s)`);
        if (medium > 0) parts.push(`${medium} médio(s)`);
        if (low > 0) parts.push(`${low} baixo(s)`);

        return `⚠️ ${issues.length} problema(s) encontrado(s): ${parts.join(', ')}`;
    }
}
