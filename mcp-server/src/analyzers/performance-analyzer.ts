/**
 * Performance Analyzer - Detects performance issues and anti-patterns
 */

import { BaseAnalyzer, type AnalyzerOptions, type Severity } from "./base.js";

interface PerformanceRule {
    id: string;
    name: string;
    description: string;
    severity: Severity;
    pattern: RegExp;
    suggestion: string;
}

const PERFORMANCE_RULES: PerformanceRule[] = [
    // Loop issues
    {
        id: "PERF-LOOP-AWAIT",
        name: "Await dentro de loop",
        description: "Await sequencial em loop causa N requests em série",
        severity: "high",
        pattern: /for\s*\([^)]*\)\s*\{[^}]*await\b|while\s*\([^)]*\)\s*\{[^}]*await\b/,
        suggestion: "Use Promise.all() para executar em paralelo",
    },
    {
        id: "PERF-NESTED-LOOP",
        name: "Loops aninhados",
        description: "Loops aninhados podem causar O(n²) ou pior",
        severity: "medium",
        pattern: /for\s*\([^)]*\)\s*\{[^}]*for\s*\(/,
        suggestion: "Considere usar Map/Set ou reestruturar algoritmo",
    },
    {
        id: "PERF-ARRAY-IN-LOOP",
        name: "Criação de array em loop",
        description: "Criar arrays dentro de loop causa alocações desnecessárias",
        severity: "low",
        pattern: /for\s*\([^)]*\)\s*\{[^}]*\[\s*\]/,
        suggestion: "Mova criação de array para fora do loop",
    },

    // Memory issues
    {
        id: "PERF-LARGE-ARRAY",
        name: "Array potencialmente grande",
        description: "Carregar todos registros de uma vez pode consumir muita memória",
        severity: "medium",
        pattern: /findAll|find\(\)|getAll|fetchAll/i,
        suggestion: "Use paginação ou streaming para grandes datasets",
    },
    {
        id: "PERF-NO-LIMIT",
        name: "Query sem LIMIT",
        description: "Query sem limite pode retornar milhões de registros",
        severity: "high",
        pattern: /SELECT.*FROM(?!.*LIMIT)/i,
        suggestion: "Sempre use LIMIT ou paginação em queries",
    },

    // React specific
    {
        id: "PERF-INLINE-FUNCTION",
        name: "Função inline em render",
        description: "Funções inline causam re-renders desnecessários",
        severity: "medium",
        pattern: /onClick=\{.*=>/,
        suggestion: "Use useCallback ou defina função fora do JSX",
    },
    {
        id: "PERF-INLINE-OBJECT",
        name: "Objeto inline em render",
        description: "Objetos inline causam re-renders desnecessários",
        severity: "medium",
        pattern: /style=\{\{|className=\{\{/,
        suggestion: "Use useMemo ou defina objeto fora do JSX",
    },
    {
        id: "PERF-MISSING-KEY",
        name: "Lista sem key",
        description: "Listas sem key única causam re-renders ineficientes",
        severity: "medium",
        pattern: /\.map\([^)]*\)\s*=>\s*<\w+(?![^>]*key=)/,
        suggestion: "Adicione key única em elementos de lista",
    },

    // API/Network
    {
        id: "PERF-N-PLUS-1",
        name: "Possível N+1 Query",
        description: "Query dentro de loop causa múltiplas requisições ao banco",
        severity: "high",
        pattern: /for.*\{[^}]*(?:find|get|fetch|query|select)/i,
        suggestion: "Use eager loading ou batch queries",
    },
    {
        id: "PERF-NO-CACHE",
        name: "Requisição sem cache",
        description: "Requisição que poderia ser cacheada",
        severity: "low",
        pattern: /fetch\([^)]*\)(?!.*cache)/i,
        suggestion: "Considere adicionar cache para dados estáticos",
    },

    // JS performance
    {
        id: "PERF-SYNC-LOCALSTORAGE",
        name: "LocalStorage síncrono",
        description: "LocalStorage é síncrono e pode bloquear a thread",
        severity: "low",
        pattern: /localStorage\.(get|set|remove)Item/,
        suggestion: "Use IndexedDB para dados grandes ou acesso frequente",
    },
    {
        id: "PERF-DOCUMENT-QUERYSELECTORALL",
        name: "QuerySelectorAll em loop",
        description: "DOM query repetida é custosa",
        severity: "medium",
        pattern: /for.*document\.querySelector/,
        suggestion: "Cache o resultado da query antes do loop",
    },
    {
        id: "PERF-STRING-CONCAT-LOOP",
        name: "Concatenação de string em loop",
        description: "Concatenar strings em loop é O(n²)",
        severity: "medium",
        pattern: /for.*\+=/,
        suggestion: "Use array.join() ou template literals",
    },
];

export class PerformanceAnalyzer extends BaseAnalyzer {
    category = "performance" as const;
    name = "Performance Analyzer";
    description = "Detecta problemas de performance e anti-patterns";

    protected async performAnalysis(content: string, options?: AnalyzerOptions): Promise<void> {
        const lines = content.split("\n");

        // Check for rules that span multiple lines
        for (const rule of PERFORMANCE_RULES) {
            if (rule.pattern.test(content)) {
                // Find the line number
                for (let i = 0; i < lines.length; i++) {
                    if (rule.pattern.test(lines[i])) {
                        this.addFinding({
                            severity: rule.severity,
                            title: `[${rule.id}] ${rule.name}`,
                            description: rule.description,
                            file: options?.fileName,
                            line: i + 1,
                            code: lines[i].trim(),
                            suggestion: rule.suggestion,
                        });
                        break;
                    }
                }
            }
        }

        // Check bundle size indicators
        const largeImports = [
            { name: "moment", size: "300KB", alternative: "dayjs (2KB)" },
            { name: "lodash", size: "70KB", alternative: "lodash-es com tree-shaking" },
            { name: "jquery", size: "90KB", alternative: "vanilla JS ou frameworks modernos" },
        ];

        for (const lib of largeImports) {
            const importPattern = new RegExp(`import.*from\\s*['"]${lib.name}['"]`);
            if (importPattern.test(content)) {
                this.addFinding({
                    severity: "medium",
                    title: `[PERF-LARGE-BUNDLE] Biblioteca pesada: ${lib.name}`,
                    description: `${lib.name} adiciona ~${lib.size} ao bundle`,
                    file: options?.fileName,
                    suggestion: `Considere usar ${lib.alternative}`,
                });
            }
        }
    }
}
