/**
 * Quality Analyzer - Code quality metrics and issues
 */

import { BaseAnalyzer, type AnalyzerOptions, type Severity } from "./base.js";
import { parseCode } from "../utils/code-parser.js";

interface QualityRule {
    id: string;
    name: string;
    description: string;
    severity: Severity;
    pattern: RegExp;
    suggestion: string;
}

const QUALITY_RULES: QualityRule[] = [
    {
        id: "QUAL-LONG-FUNCTION",
        name: "Função muito longa",
        description: "Funções com mais de 50 linhas são difíceis de manter",
        severity: "medium",
        pattern: /function\s+\w+|=>\s*\{/,
        suggestion: "Extraia lógica para funções menores e mais específicas",
    },
    {
        id: "QUAL-MAGIC-NUMBER",
        name: "Número mágico",
        description: "Número literal sem explicação do significado",
        severity: "low",
        pattern: /(?<![.\d])\b(?!0|1|2|10|100|1000\b)[3-9]\d*\b(?!\.\d)/,
        suggestion: "Use constantes nomeadas para valores mágicos",
    },
    {
        id: "QUAL-NESTED-CALLBACKS",
        name: "Callback hell",
        description: "Callbacks aninhados demais (mais de 3 níveis)",
        severity: "medium",
        pattern: /\)\s*=>\s*\{[^}]*\)\s*=>\s*\{[^}]*\)\s*=>\s*\{/,
        suggestion: "Use async/await ou Promise.all para simplificar",
    },
    {
        id: "QUAL-EMPTY-CATCH",
        name: "Catch vazio",
        description: "Catch que ignora o erro silenciosamente",
        severity: "high",
        pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
        suggestion: "Trate ou logue o erro, nunca ignore silenciosamente",
    },
    {
        id: "QUAL-TODO",
        name: "TODO pendente",
        description: "Código marcado como TODO não implementado",
        severity: "info",
        pattern: /\/\/\s*TODO|\/\*\s*TODO/i,
        suggestion: "Resolva TODOs antes de mergear para main",
    },
    {
        id: "QUAL-FIXME",
        name: "FIXME pendente",
        description: "Bug conhecido não corrigido",
        severity: "medium",
        pattern: /\/\/\s*FIXME|\/\*\s*FIXME/i,
        suggestion: "Corrija FIXMEs antes de mergear para main",
    },
    {
        id: "QUAL-ANY-TYPE",
        name: "Uso de any",
        description: "Tipo any desabilita verificação de tipos",
        severity: "low",
        pattern: /:\s*any\b|\bas\s+any\b/,
        suggestion: "Use tipos específicos ou unknown se necessário",
    },
    {
        id: "QUAL-CONSOLE",
        name: "Console em código",
        description: "Console.log deixado no código",
        severity: "info",
        pattern: /console\.(log|debug|trace)\s*\(/,
        suggestion: "Use logger apropriado ou remova antes de deploy",
    },
    {
        id: "QUAL-COMMENTED-CODE",
        name: "Código comentado",
        description: "Código comentado polui o codebase",
        severity: "low",
        pattern: /\/\/\s*(const|let|var|function|if|for|while|return)\s/,
        suggestion: "Remova código comentado, use Git para histórico",
    },
    {
        id: "QUAL-LARGE-FILE",
        name: "Arquivo muito grande",
        description: "Arquivos com mais de 500 linhas são difíceis de navegar",
        severity: "medium",
        pattern: /./,
        suggestion: "Divida em módulos menores e mais focados",
    },
    {
        id: "QUAL-DEEP-NESTING",
        name: "Aninhamento profundo",
        description: "Código com mais de 4 níveis de indentação",
        severity: "medium",
        pattern: /^\s{16,}\S/,
        suggestion: "Use early returns e extraia funções auxiliares",
    },
    {
        id: "QUAL-DUPLICATE-STRING",
        name: "String duplicada",
        description: "Mesma string literal usada múltiplas vezes",
        severity: "low",
        pattern: /['"][^'"]{10,}['"]/,
        suggestion: "Extraia para constante ou arquivo de configuração",
    },
];

export class QualityAnalyzer extends BaseAnalyzer {
    category = "quality" as const;
    name = "Quality Analyzer";
    description = "Analisa qualidade do código, complexidade e padrões";

    protected async performAnalysis(content: string, options?: AnalyzerOptions): Promise<void> {
        const lines = content.split("\n");
        const parsed = parseCode(content, options?.fileName || "file.ts");

        // Check file size
        if (lines.length > 500) {
            this.addFinding({
                severity: "medium",
                title: "[QUAL-LARGE-FILE] Arquivo muito grande",
                description: `Arquivo com ${lines.length} linhas (máximo recomendado: 500)`,
                file: options?.fileName,
                suggestion: "Divida em módulos menores e mais focados",
            });
        }

        // Check complexity
        if (parsed.complexity > 20) {
            this.addFinding({
                severity: "high",
                title: "[QUAL-HIGH-COMPLEXITY] Alta complexidade ciclomática",
                description: `Complexidade ${parsed.complexity} (máximo recomendado: 20)`,
                file: options?.fileName,
                suggestion: "Simplifique condicionais e extraia funções",
            });
        } else if (parsed.complexity > 10) {
            this.addFinding({
                severity: "medium",
                title: "[QUAL-MEDIUM-COMPLEXITY] Complexidade moderada",
                description: `Complexidade ${parsed.complexity} (ideal: < 10)`,
                file: options?.fileName,
                suggestion: "Considere simplificar a lógica",
            });
        }

        // Check for patterns in each line
        const stringCounts = new Map<string, number>();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            // Count string occurrences for duplication check
            const strings = line.match(/['"][^'"]{10,}['"]/g) || [];
            for (const str of strings) {
                stringCounts.set(str, (stringCounts.get(str) || 0) + 1);
            }

            // Check each rule
            for (const rule of QUALITY_RULES) {
                if (rule.id === "QUAL-LARGE-FILE") continue;
                if (rule.id === "QUAL-DUPLICATE-STRING") continue;

                if (rule.pattern.test(line)) {
                    this.addFinding({
                        severity: rule.severity,
                        title: `[${rule.id}] ${rule.name}`,
                        description: rule.description,
                        file: options?.fileName,
                        line: lineNum,
                        code: line.trim(),
                        suggestion: rule.suggestion,
                    });
                }
            }
        }

        // Report duplicate strings
        for (const [str, count] of stringCounts) {
            if (count >= 3) {
                this.addFinding({
                    severity: "low",
                    title: "[QUAL-DUPLICATE-STRING] String duplicada",
                    description: `String ${str.slice(0, 30)}... usada ${count} vezes`,
                    file: options?.fileName,
                    suggestion: "Extraia para constante ou arquivo de configuração",
                });
            }
        }

        // Check for functions without proper naming
        for (const func of parsed.functions) {
            if (func.name.length < 3) {
                this.addFinding({
                    severity: "low",
                    title: "[QUAL-SHORT-NAME] Nome de função muito curto",
                    description: `Função "${func.name}" deveria ter nome mais descritivo`,
                    file: options?.fileName,
                    line: func.line,
                    suggestion: "Use nomes que descrevam o que a função faz",
                });
            }
        }
    }
}
