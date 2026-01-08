import { readFile } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../../types/index.js";
import {
    getAllAnalyzers,
    formatAnalysisResult,
    type AnalysisResult
} from "../../analyzers/index.js";

interface GerarRelatorioArgs {
    codigo?: string;
    arquivo?: string;
    formato?: "completo" | "resumido";
}

/**
 * Tool: gerar_relatorio
 * Gera relatório consolidado de todas as análises
 */
export async function gerarRelatorio(args: GerarRelatorioArgs): Promise<ToolResult> {
    let content: string;
    let fileName: string;

    if (args.codigo) {
        content = args.codigo;
        fileName = "codigo.ts";
    } else if (args.arquivo) {
        try {
            const fullPath = join(process.cwd(), args.arquivo);
            content = await readFile(fullPath, "utf-8");
            fileName = args.arquivo;
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **Erro**: Não foi possível ler o arquivo "${args.arquivo}".\n\n${String(error)}`,
                }],
                isError: true,
            };
        }
    } else {
        return {
            content: [{
                type: "text",
                text: `# 📋 Gerar Relatório

## Como usar

**Analisar código diretamente:**
\`\`\`
gerar_relatorio(codigo: "seu código aqui")
\`\`\`

**Analisar arquivo:**
\`\`\`
gerar_relatorio(arquivo: "src/index.ts")
\`\`\`

**Formato resumido:**
\`\`\`
gerar_relatorio(arquivo: "src/index.ts", formato: "resumido")
\`\`\`

## O que é incluído

- 🔒 Análise de Segurança (OWASP)
- 📊 Análise de Qualidade
- ⚡ Análise de Performance
`,
            }],
        };
    }

    const analyzers = getAllAnalyzers();
    const results: AnalysisResult[] = [];

    for (const analyzer of analyzers) {
        const result = await analyzer.analyze(content, { fileName });
        results.push(result);
    }

    // Consolidate summary
    const totalFindings = results.reduce((sum, r) => sum + r.summary.total, 0);
    const totalCritical = results.reduce((sum, r) => sum + r.summary.critical, 0);
    const totalHigh = results.reduce((sum, r) => sum + r.summary.high, 0);
    const totalMedium = results.reduce((sum, r) => sum + r.summary.medium, 0);
    const totalLow = results.reduce((sum, r) => sum + r.summary.low, 0);
    const totalInfo = results.reduce((sum, r) => sum + r.summary.info, 0);

    const lines: string[] = [];

    lines.push(`# 📋 Relatório de Análise\n`);
    lines.push(`**Arquivo:** \`${fileName}\``);
    lines.push(`**Data:** ${new Date().toLocaleString("pt-BR")}\n`);

    // Overall score
    const score = Math.max(0, 100 - (totalCritical * 20 + totalHigh * 10 + totalMedium * 5 + totalLow * 2));
    const scoreEmoji = score >= 80 ? "🟢" : score >= 60 ? "🟡" : score >= 40 ? "🟠" : "🔴";

    lines.push(`## Score: ${scoreEmoji} ${score}/100\n`);

    // Summary table
    lines.push("## Resumo Consolidado\n");
    lines.push("| Categoria | Critical | High | Medium | Low | Total |");
    lines.push("|-----------|----------|------|--------|-----|-------|");

    for (const result of results) {
        const emoji = {
            security: "🔒",
            quality: "📊",
            performance: "⚡",
            accessibility: "♿",
            dependency: "📦",
        };
        lines.push(`| ${emoji[result.category]} ${result.category} | ${result.summary.critical} | ${result.summary.high} | ${result.summary.medium} | ${result.summary.low} | ${result.summary.total} |`);
    }

    lines.push(`| **TOTAL** | **${totalCritical}** | **${totalHigh}** | **${totalMedium}** | **${totalLow}** | **${totalFindings}** |\n`);

    // Recommendations
    if (totalFindings > 0) {
        lines.push("## ⚠️ Recomendações Prioritárias\n");

        // Get top 5 most critical findings
        const allFindings = results.flatMap(r => r.findings);
        const prioritized = allFindings
            .sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                return order[a.severity] - order[b.severity];
            })
            .slice(0, 5);

        for (const finding of prioritized) {
            const severityEmoji = {
                critical: "🔴",
                high: "🟠",
                medium: "🟡",
                low: "🔵",
                info: "⚪",
            };
            lines.push(`${severityEmoji[finding.severity]} **${finding.title}**`);
            if (finding.suggestion) {
                lines.push(`   └─ ${finding.suggestion}`);
            }
        }
        lines.push("");
    } else {
        lines.push("## ✅ Nenhum problema encontrado!\n");
        lines.push("O código passou em todas as verificações.\n");
    }

    // Detailed reports if formato is completo
    if (args.formato !== "resumido") {
        lines.push("---\n");
        lines.push("# Relatórios Detalhados\n");

        for (const result of results) {
            if (result.findings.length > 0) {
                lines.push(formatAnalysisResult(result));
                lines.push("\n---\n");
            }
        }
    }

    return {
        content: [{ type: "text", text: lines.join("\n") }],
    };
}

export const gerarRelatorioSchema = {
    type: "object",
    properties: {
        codigo: {
            type: "string",
            description: "Código fonte para analisar",
        },
        arquivo: {
            type: "string",
            description: "Caminho do arquivo para analisar",
        },
        formato: {
            type: "string",
            enum: ["completo", "resumido"],
            description: "Formato do relatório (default: completo)",
        },
    },
};
