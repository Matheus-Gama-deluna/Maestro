/**
 * Analyzers Index - Export all analyzers
 */

export { BaseAnalyzer, formatAnalysisResult } from "./base.js";
export type { Finding, AnalysisResult, AnalyzerOptions, Severity, AnalysisCategory, IAnalyzer } from "./base.js";

export { SecurityAnalyzer } from "./security-analyzer.js";
export { QualityAnalyzer } from "./quality-analyzer.js";
export { PerformanceAnalyzer } from "./performance-analyzer.js";

// Factory to get all analyzers
import { SecurityAnalyzer } from "./security-analyzer.js";
import { QualityAnalyzer } from "./quality-analyzer.js";
import { PerformanceAnalyzer } from "./performance-analyzer.js";
import type { IAnalyzer, AnalysisCategory } from "./base.js";

export function createAnalyzer(category: AnalysisCategory): IAnalyzer {
    switch (category) {
        case "security":
            return new SecurityAnalyzer();
        case "quality":
            return new QualityAnalyzer();
        case "performance":
            return new PerformanceAnalyzer();
        default:
            throw new Error(`Unknown analyzer category: ${category}`);
    }
}

export function getAllAnalyzers(): IAnalyzer[] {
    return [
        new SecurityAnalyzer(),
        new QualityAnalyzer(),
        new PerformanceAnalyzer(),
    ];
}
