/**
 * Unified Validation Service (v6.1)
 * 
 * Consolidates 4 parallel validation systems into a single pipeline:
 * - template-validator.ts (template-based validation)
 * - intelligent-validator.ts (semantic validation)
 * - quality-scorer.ts (quality metrics)
 * - specialist-phase-handler.ts inline (section-check validation)
 * 
 * This service provides a single entry point for validating any deliverable,
 * regardless of the phase or type.
 * 
 * @since v6.1.0 — Opportunity #1 from Analysis
 */

import type { TierGate, Fase } from "../types/index.js";
import { validarContraTemplate, type ValidationResult } from "./template-validator.js";
import { parseTemplate, type TemplateStructure } from "./template-parser.js";
import { calcularQualidade, type QualityMetrics } from "./quality-scorer.js";
import { existsSync } from "fs";
import { join } from "path";

// === TYPES ===

export interface UnifiedValidationResult {
    /** Whether the deliverable passes the gate */
    valid: boolean;
    /** Overall score (0-100) */
    score: number;
    /** Maturity level (1-5) */
    maturityLevel: 1 | 2 | 3 | 4 | 5;
    /** Whether the deliverable can advance to next phase */
    canAdvance: boolean;
    /** Detailed breakdown by category */
    breakdown: {
        structure: number;
        content: number;
        quality: number;
        completeness: number;
    };
    /** Items that passed */
    passed: string[];
    /** Items that failed (blockers) */
    failed: string[];
    /** Warnings (non-blocking) */
    warnings: string[];
    /** Actionable suggestions */
    suggestions: string[];
    /** Which validation method was used */
    method: 'template' | 'section-check' | 'hybrid';
}

export interface UnifiedValidationOptions {
    /** Content to validate */
    content: string;
    /** Phase being validated */
    fase?: Fase;
    /** Gate tier level */
    tier?: TierGate;
    /** Path to content directory (for template resolution) */
    contentDir?: string;
    /** Skill name for template lookup */
    skillName?: string;
    /** Optional pre-parsed template */
    template?: TemplateStructure;
}

// === MAIN VALIDATION FUNCTION ===

/**
 * Validates deliverable content using the best available method.
 * 
 * Resolution order:
 * 1. If template is provided or can be resolved → template-based validation
 * 2. Fallback → section-check validation (PRD-specific)
 * 3. Always → quality scoring overlay
 */
export function validateDeliverable(opts: UnifiedValidationOptions): UnifiedValidationResult {
    const { content, tier = 'base' } = opts;

    // Normalize content first
    const normalizedContent = normalizeContent(content);

    // Try template-based validation first
    let templateResult: ValidationResult | null = null;
    let template: TemplateStructure | null = opts.template || null;

    if (!template && opts.contentDir && opts.skillName) {
        template = tryResolveTemplate(opts.contentDir, opts.skillName);
    }

    if (template) {
        templateResult = validarContraTemplate(normalizedContent, template, tier);
    }

    // Calculate quality metrics
    let qualityMetrics: QualityMetrics | null = null;
    if (template) {
        try {
            qualityMetrics = calcularQualidade(normalizedContent, template, tier);
        } catch { /* ignore quality scoring errors */ }
    }

    // Build unified result
    if (templateResult) {
        return buildFromTemplateResult(templateResult, qualityMetrics);
    }

    // Fallback: section-check (for PRD and similar)
    return buildFromSectionCheck(normalizedContent, tier, qualityMetrics);
}

// === HELPERS ===

function normalizeContent(content: string): string {
    let normalized = content;

    // Fix JSON-escaped newlines
    const realNewlines = (normalized.match(/\n/g) || []).length;
    const literalNewlines = (normalized.match(/\\n/g) || []).length;

    if (literalNewlines > realNewlines * 2) {
        normalized = normalized.replace(/\\n/g, '\n');
    }

    normalized = normalized.replace(/\r\n/g, '\n');
    normalized = normalized.replace(/\\"/g, '"');
    normalized = normalized.replace(/\\\\n/g, '\n');

    return normalized.trim();
}

function tryResolveTemplate(contentDir: string, skillName: string): TemplateStructure | null {
    const possiblePaths = [
        join(contentDir, 'skills', skillName, 'resources', 'templates'),
        join(contentDir, 'skills', skillName, 'templates'),
    ];

    for (const basePath of possiblePaths) {
        if (!existsSync(basePath)) continue;

        // Look for template files
        const templateFiles = ['PRD.md', 'template.md', 'entregavel.md'];
        for (const file of templateFiles) {
            const fullPath = join(basePath, file);
            if (existsSync(fullPath)) {
                const parsed = parseTemplate(fullPath);
                if (parsed) return parsed;
            }
        }
    }

    return null;
}

function buildFromTemplateResult(
    result: ValidationResult,
    quality: QualityMetrics | null
): UnifiedValidationResult {
    const qualityScore = quality?.overall ?? 50;

    // Combine template score with quality score (70/30 weight)
    const combinedScore = Math.round(result.score * 0.7 + qualityScore * 0.3);

    return {
        valid: result.valido,
        score: combinedScore,
        maturityLevel: scoreToMaturity(combinedScore),
        canAdvance: result.valido || combinedScore >= 70,
        breakdown: {
            structure: result.scoreDetalhado?.estrutura ?? 0,
            content: result.scoreDetalhado?.conteudo ?? 0,
            quality: qualityScore,
            completeness: result.scoreDetalhado?.checkboxes ?? 0,
        },
        passed: result.secoesEncontradas?.map(s => `✅ ${s}`) ?? [],
        failed: result.secoesFaltando?.map(s => `❌ ${s}`) ?? [],
        warnings: result.placeholdersNaoSubstituidos?.map(p => `⚠️ Placeholder: ${p}`) ?? [],
        suggestions: result.sugestoes ?? [],
        method: 'template',
    };
}

/**
 * Section-check validation (fallback for PRD and similar documents).
 * Uses the same logic as specialist-phase-handler.ts but exposed as a reusable function.
 */
function buildFromSectionCheck(
    content: string,
    tier: TierGate,
    quality: QualityMetrics | null
): UnifiedValidationResult {
    const sections = splitBySections(content);
    const checks = getSectionChecks();

    const passed: string[] = [];
    const failed: string[] = [];
    const warnings: string[] = [];

    let structureScore = 0;
    let maxStructure = 0;

    for (const check of checks) {
        maxStructure += check.weight;
        const section = sections.find(s => check.heading.test(s.heading));
        const found = !!section;
        const contentLength = section ? section.content.length : 0;
        const hasContent = found && contentLength >= check.minContentLength;

        if (found && hasContent) {
            structureScore += check.weight;
            passed.push(`✅ ${check.label}: Completo (${contentLength} chars)`);
        } else if (found) {
            structureScore += Math.floor(check.weight * 0.5);
            warnings.push(`⚠️ ${check.label}: Conteúdo insuficiente (${contentLength}/${check.minContentLength} chars)`);
        } else {
            failed.push(`❌ ${check.label}: Seção não encontrada`);
        }
    }

    // Bonus for word count
    const wordCount = content.split(/\s+/).length;
    let bonus = 0;
    if (wordCount > 500) bonus += 10;
    if (wordCount > 1000) bonus += 5;

    const rawScore = Math.min(Math.round((structureScore / maxStructure) * 85) + bonus, 100);
    const qualityScore = quality?.overall ?? 50;
    const finalScore = Math.round(rawScore * 0.7 + qualityScore * 0.3);

    return {
        valid: finalScore >= 70,
        score: finalScore,
        maturityLevel: scoreToMaturity(finalScore),
        canAdvance: finalScore >= 70,
        breakdown: {
            structure: Math.round((structureScore / maxStructure) * 100),
            content: Math.round(Math.min(wordCount / 5, 100)),
            quality: qualityScore,
            completeness: Math.round((passed.length / checks.length) * 100),
        },
        passed,
        failed,
        warnings,
        suggestions: generateSuggestions(failed, warnings, wordCount),
        method: 'section-check',
    };
}

function scoreToMaturity(score: number): 1 | 2 | 3 | 4 | 5 {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
}

interface SectionCheckDef {
    heading: RegExp;
    minContentLength: number;
    weight: number;
    label: string;
}

function getSectionChecks(): SectionCheckDef[] {
    return [
        { heading: /^[\d.\s]*(sum[aá]rio|summary|executiv)/i, minContentLength: 100, weight: 10, label: 'Sumário Executivo' },
        { heading: /^[\d.\s]*(problema|problem|oportunidade|dor|pain)/i, minContentLength: 150, weight: 15, label: 'Problema e Oportunidade' },
        { heading: /^[\d.\s]*(persona|jobs?\s*to\s*be|p[uú]blico|usu[aá]rios?|user)/i, minContentLength: 100, weight: 15, label: 'Personas e Público-alvo' },
        { heading: /^[\d.\s]*(mvp|funcionalidade|feature|solu[cç][aã]o|escopo)/i, minContentLength: 100, weight: 15, label: 'MVP e Funcionalidades' },
        { heading: /^[\d.\s]*(m[eé]trica|kpi|north\s*star|sucesso|indicador)/i, minContentLength: 50, weight: 10, label: 'Métricas de Sucesso' },
        { heading: /^[\d.\s]*(risco|mitiga[cç])/i, minContentLength: 80, weight: 10, label: 'Riscos e Mitigações' },
        { heading: /^[\d.\s]*(timeline|cronograma|marco|prazo|roadmap)/i, minContentLength: 50, weight: 5, label: 'Timeline e Marcos' },
        { heading: /^[\d.\s]*(vis[aã]o|estrat[eé]gia|go.to.market|escopo)/i, minContentLength: 50, weight: 5, label: 'Visão e Estratégia' },
    ];
}

function splitBySections(content: string): { heading: string; content: string }[] {
    const lines = content.split('\n');
    const sections: { heading: string; content: string }[] = [];
    let currentHeading = '';
    let currentContent: string[] = [];

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (currentHeading) {
                sections.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
            }
            currentHeading = headingMatch[2].trim();
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }

    if (currentHeading) {
        sections.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
    }

    return sections;
}

function generateSuggestions(failed: string[], warnings: string[], wordCount: number): string[] {
    const suggestions: string[] = [];

    if (failed.length > 0) {
        suggestions.push(`Adicione as ${failed.length} seção(ões) faltante(s) ao documento`);
    }
    if (warnings.length > 0) {
        suggestions.push(`Expanda o conteúdo de ${warnings.length} seção(ões) com conteúdo insuficiente`);
    }
    if (wordCount < 200) {
        suggestions.push(`Documento muito curto (${wordCount} palavras). Mínimo recomendado: 500`);
    }
    if (wordCount < 500) {
        suggestions.push('Adicione mais detalhes para atingir bônus de completude (+10 pontos)');
    }

    return suggestions;
}
