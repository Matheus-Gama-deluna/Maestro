/**
 * PRD Scorer — Módulo de scoring e gap detection do PRD
 *
 * Contém: SECTION_CHECKS, splitPrdBySections, normalizePrdContent,
 *         calculatePrdScore, calculatePrdScoreDetailed, identifyPrdGaps
 *
 * @since v6.0 — Extraído de specialist-phase-handler.ts (Task 2.8)
 */

// === Sprint 6 (NP10): Validação Estruturada do PRD ===

export interface SectionCheck {
    heading: RegExp;
    minContentLength: number;
    weight: number;
    label: string;
}

export interface SectionResult {
    label: string;
    found: boolean;
    hasContent: boolean;
    score: number;
    maxScore: number;
    contentLength: number;
}

/**
 * v6.1 (Bug #1 fix): Regex patterns match against CLEANED heading text
 * (splitPrdBySections already strips '#' prefixes via headingMatch[2]).
 * Removed leading regex prefix that was causing all sections to appear "not found".
 * Also made patterns more permissive with optional numbering prefixes like "1." or "1.1".
 */
export const SECTION_CHECKS: SectionCheck[] = [
    { heading: /^[\d.\s]*(sum[aá]rio|summary|executiv)/i, minContentLength: 100, weight: 10, label: 'Sumário Executivo' },
    { heading: /^[\d.\s]*(problema|problem|oportunidade|dor|pain)/i, minContentLength: 150, weight: 15, label: 'Problema e Oportunidade' },
    { heading: /^[\d.\s]*(persona|jobs?\s*to\s*be|p[uú]blico|usu[aá]rios?|user)/i, minContentLength: 100, weight: 15, label: 'Personas e Público-alvo' },
    { heading: /^[\d.\s]*(mvp|funcionalidade|feature|solu[cç][aã]o|escopo)/i, minContentLength: 100, weight: 15, label: 'MVP e Funcionalidades' },
    { heading: /^[\d.\s]*(m[eé]trica|kpi|north\s*star|sucesso|indicador)/i, minContentLength: 50, weight: 10, label: 'Métricas de Sucesso' },
    { heading: /^[\d.\s]*(risco|mitiga[cç])/i, minContentLength: 80, weight: 10, label: 'Riscos e Mitigações' },
    { heading: /^[\d.\s]*(timeline|cronograma|marco|prazo|roadmap)/i, minContentLength: 50, weight: 5, label: 'Timeline e Marcos' },
    { heading: /^[\d.\s]*(vis[aã]o|estrat[eé]gia|go.to.market|escopo)/i, minContentLength: 50, weight: 5, label: 'Visão e Estratégia' },
];

/**
 * v6.1 (Bug #1): Normalizes PRD content to fix JSON escape issues.
 * When PRD is sent as JSON string argument, \n may arrive as literal "\n" instead of newlines.
 * Also handles \r\n and other escape artifacts.
 */
export function normalizePrdContent(content: string): string {
    let normalized = content;

    const realNewlineCount = (normalized.match(/\n/g) || []).length;
    const literalNewlineCount = (normalized.match(/\\n/g) || []).length;

    if (literalNewlineCount > realNewlineCount * 2) {
        normalized = normalized.replace(/\\n/g, '\n');
    }

    normalized = normalized.replace(/\r\n/g, '\n');
    normalized = normalized.replace(/\\"/g, '"');
    normalized = normalized.replace(/\\\\n/g, '\n');

    return normalized.trim();
}

/**
 * Sprint 6: Divide PRD em seções por headings markdown
 *
 * v6.1 (Bug #1 fix): Added normalizePrdContent() call before splitting.
 * Also matches up to h6 headers (#{1,6}) instead of only h4.
 */
export function splitPrdBySections(prd: string): { heading: string; content: string }[] {
    const normalizedPrd = normalizePrdContent(prd);
    const lines = normalizedPrd.split('\n');
    const sections: { heading: string; content: string }[] = [];
    let currentHeading = '';
    let currentContent: string[] = [];

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        const level = headingMatch ? headingMatch[1].length : 0;
        if (headingMatch && level <= 2) {
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

export function calculatePrdScoreDetailed(prd: string): { score: number; details: SectionResult[] } {
    const sections = splitPrdBySections(prd);
    const results: SectionResult[] = [];

    for (const check of SECTION_CHECKS) {
        const section = sections.find(s => check.heading.test(s.heading));
        const found = !!section;
        const contentLength = section ? section.content.length : 0;
        const hasContent = found && contentLength >= check.minContentLength;
        const sectionScore = found && hasContent
            ? check.weight
            : found
                ? Math.floor(check.weight * 0.5)
                : 0;

        results.push({
            label: check.label,
            found,
            hasContent,
            score: sectionScore,
            maxScore: check.weight,
            contentLength,
        });
    }

    const wordCount = prd.split(/\s+/).length;
    let bonus = 0;
    if (wordCount > 500) bonus += 10;
    if (wordCount > 1000) bonus += 5;

    const total = Math.min(results.reduce((acc, r) => acc + r.score, 0) + bonus, 100);
    return { score: total, details: results };
}

// v5.0 Sprint 5: Cache de scores para evitar oscilações
const scoreCache = new Map<string, { score: number; timestamp: number }>();
const SCORE_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Sprint 6 (NP10): Calcula score estruturado do PRD por seções com conteúdo mínimo.
 * v5.0: Adicionado cache e bypass por tamanho
 */
export function calculatePrdScore(prd: string, mode: string): number {
    const wordCount = prd.split(/\s+/).length;
    const charCount = prd.length;
    const hasStructure = prd.match(/^#{1,2}\s+/m) && prd.match(/^#{1,2}\s+/m);

    if (charCount > 3000 && wordCount > 400 && hasStructure) {
        const { score } = calculatePrdScoreDetailed(prd);
        return Math.max(score, 70);
    }

    const cacheKey = `${prd.slice(0, 500)}-${prd.length}`;
    const cached = scoreCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SCORE_CACHE_TTL) {
        return cached.score;
    }

    const { score } = calculatePrdScoreDetailed(prd);

    scoreCache.set(cacheKey, { score, timestamp: Date.now() });

    return score;
}

/**
 * Sprint 6 (NP10): Identifica gaps no PRD com detalhes por seção.
 * Mostra seções ausentes, seções com conteúdo insuficiente, e pontos perdidos.
 */
export function identifyPrdGaps(prd: string, _mode: string): string[] {
    const { details } = calculatePrdScoreDetailed(prd);
    const gaps: string[] = [];

    for (const result of details) {
        if (!result.found) {
            gaps.push(`❌ **${result.label}**: Seção não encontrada (0/${result.maxScore} pontos)`);
        } else if (!result.hasContent) {
            gaps.push(`⚠️ **${result.label}**: Seção encontrada mas conteúdo insuficiente — ${result.contentLength} chars (${result.score}/${result.maxScore} pontos)`);
        }
    }

    const wordCount = prd.split(/\s+/).length;
    if (wordCount < 200) {
        gaps.push(`📏 PRD muito curto (${wordCount} palavras). Mínimo recomendado: 500 palavras.`);
    }

    const complete = details.filter(r => r.found && r.hasContent);
    if (complete.length > 0 && gaps.length > 0) {
        gaps.push('');
        gaps.push('**Seções completas:**');
        for (const r of complete) {
            gaps.push(`✅ **${r.label}**: Completo (${r.score}/${r.maxScore} pontos)`);
        }
    }

    return gaps;
}
