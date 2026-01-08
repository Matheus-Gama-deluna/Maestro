/**
 * Base types and interfaces for code analyzers
 */

// Severity levels for findings
export type Severity = "critical" | "high" | "medium" | "low" | "info";

// Categories of analysis
export type AnalysisCategory =
    | "security"
    | "performance"
    | "quality"
    | "accessibility"
    | "dependency";

// Individual finding from analysis
export interface Finding {
    id: string;
    category: AnalysisCategory;
    severity: Severity;
    title: string;
    description: string;
    file?: string;
    line?: number;
    column?: number;
    code?: string;
    suggestion?: string;
    references?: string[];
}

// Result of an analysis
export interface AnalysisResult {
    category: AnalysisCategory;
    timestamp: string;
    duration: number;
    findings: Finding[];
    summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
}

// Base analyzer interface
export interface IAnalyzer {
    category: AnalysisCategory;
    name: string;
    description: string;

    analyze(content: string, options?: AnalyzerOptions): Promise<AnalysisResult>;
}

// Options for analyzers
export interface AnalyzerOptions {
    fileType?: string;
    fileName?: string;
    projectDir?: string;
    rules?: string[];
    severity?: Severity;
}

/**
 * Abstract base class for all analyzers
 */
export abstract class BaseAnalyzer implements IAnalyzer {
    abstract category: AnalysisCategory;
    abstract name: string;
    abstract description: string;

    protected findings: Finding[] = [];
    protected startTime: number = 0;

    async analyze(content: string, options?: AnalyzerOptions): Promise<AnalysisResult> {
        this.startTime = Date.now();
        this.findings = [];

        await this.performAnalysis(content, options);

        return this.buildResult();
    }

    protected abstract performAnalysis(content: string, options?: AnalyzerOptions): Promise<void>;

    protected addFinding(finding: Omit<Finding, "id" | "category">): void {
        this.findings.push({
            id: `${this.category}-${this.findings.length + 1}`,
            category: this.category,
            ...finding,
        });
    }

    protected buildResult(): AnalysisResult {
        const summary = {
            total: this.findings.length,
            critical: this.findings.filter(f => f.severity === "critical").length,
            high: this.findings.filter(f => f.severity === "high").length,
            medium: this.findings.filter(f => f.severity === "medium").length,
            low: this.findings.filter(f => f.severity === "low").length,
            info: this.findings.filter(f => f.severity === "info").length,
        };

        return {
            category: this.category,
            timestamp: new Date().toISOString(),
            duration: Date.now() - this.startTime,
            findings: this.findings,
            summary,
        };
    }
}

/**
 * Format analysis result as markdown
 */
export function formatAnalysisResult(result: AnalysisResult): string {
    const lines: string[] = [];

    const emoji = {
        security: "🔒",
        performance: "⚡",
        quality: "📊",
        accessibility: "♿",
        dependency: "📦",
    };

    lines.push(`# ${emoji[result.category]} Análise de ${result.category.charAt(0).toUpperCase() + result.category.slice(1)}\n`);

    // Summary
    lines.push("## Resumo\n");
    lines.push(`| Severidade | Quantidade |`);
    lines.push(`|------------|------------|`);
    lines.push(`| 🔴 Crítico | ${result.summary.critical} |`);
    lines.push(`| 🟠 Alto | ${result.summary.high} |`);
    lines.push(`| 🟡 Médio | ${result.summary.medium} |`);
    lines.push(`| 🔵 Baixo | ${result.summary.low} |`);
    lines.push(`| ⚪ Info | ${result.summary.info} |`);
    lines.push(`| **Total** | **${result.summary.total}** |\n`);

    if (result.findings.length === 0) {
        lines.push("✅ **Nenhum problema encontrado!**\n");
        return lines.join("\n");
    }

    // Findings by severity
    const bySeverity = ["critical", "high", "medium", "low", "info"] as Severity[];

    for (const severity of bySeverity) {
        const findings = result.findings.filter(f => f.severity === severity);
        if (findings.length === 0) continue;

        const severityEmoji = {
            critical: "🔴",
            high: "🟠",
            medium: "🟡",
            low: "🔵",
            info: "⚪",
        };

        lines.push(`## ${severityEmoji[severity]} ${severity.toUpperCase()} (${findings.length})\n`);

        for (const finding of findings) {
            lines.push(`### ${finding.title}\n`);
            lines.push(finding.description);

            if (finding.file) {
                lines.push(`\n**Arquivo:** \`${finding.file}\`${finding.line ? `:${finding.line}` : ""}`);
            }

            if (finding.code) {
                lines.push(`\n\`\`\`\n${finding.code}\n\`\`\``);
            }

            if (finding.suggestion) {
                lines.push(`\n💡 **Sugestão:** ${finding.suggestion}`);
            }

            if (finding.references && finding.references.length > 0) {
                lines.push(`\n**Referências:**`);
                finding.references.forEach(ref => lines.push(`- ${ref}`));
            }

            lines.push("");
        }
    }

    lines.push(`---\n*Análise executada em ${result.duration}ms*`);

    return lines.join("\n");
}
