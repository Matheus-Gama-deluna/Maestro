/**
 * Readiness Gate — Checkpoint consolidado pré-código (v10.0)
 *
 * Verifica se o CONJUNTO de artefatos de engenharia está coerente
 * antes de permitir entrada nas fases de código (Frontend, Backend, etc.).
 *
 * Cada fase anterior teve seu gate individual, mas o Readiness Gate
 * verifica a coerência do conjunto: PRD existe? Arquitetura definida?
 * Backlog com user stories?
 *
 * Thresholds:
 * - >= 80: auto-approve (prossegue para código)
 * - 60-79: aprovação manual necessária
 * - < 60: bloqueio total — artefatos críticos faltando
 *
 * @since v10.0
 */

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import type { EstadoProjeto, NivelComplexidade } from "../types/index.js";
import { getFluxoComStitch } from "../flows/types.js";

// ============================================================
// TYPES
// ============================================================

export interface ReadinessArtifact {
    name: string;
    exists: boolean;
    score: number;      // 0 ou weight (se existe e é válido)
    weight: number;     // Peso no score total
    path: string | null;
    charCount: number;
    minChars: number;
}

export interface ReadinessResult {
    score: number;
    approved: boolean;
    requiresManualApproval: boolean;
    artifacts: ReadinessArtifact[];
    gaps: string[];
    recommendation: string;
}

// ============================================================
// ARTIFACT DEFINITIONS
// ============================================================

interface ArtifactDef {
    name: string;
    weight: number;
    minChars: number;
    /** Glob-like patterns relative to project dir (tried in order) */
    patterns: string[];
    /** Content keywords that must be present for full score */
    keywords?: string[];
    /** Only required for these complexity levels (undefined = all) */
    requiredFor?: NivelComplexidade[];
}

/**
 * Definição dos artefatos verificados pelo Readiness Gate.
 * Pesos somam 100 para cada nível de complexidade.
 */
const ARTIFACT_DEFS: ArtifactDef[] = [
    {
        name: "PRD / Discovery",
        weight: 25,
        minChars: 600,
        patterns: [
            "docs/fase-01-*/discovery.md",
            "docs/fase-01-*/PRD.md",
            "docs/01-*/PRD.md",
            "docs/01-*/discovery.md",
        ],
    },
    {
        name: "Requisitos",
        weight: 15,
        minChars: 400,
        patterns: [
            "docs/fase-02-*/requisitos.md",
            "docs/02-*/requisitos.md",
        ],
        requiredFor: ["medio", "complexo"],
    },
    {
        name: "Design",
        weight: 15,
        minChars: 400,
        patterns: [
            "docs/fase-*-design/design-doc.md",
            "docs/fase-02-design/design-doc.md",
            "docs/fase-03-design/design-doc.md",
            "docs/*-design/design-doc.md",
            "docs/*-ux-design/design-doc.md",
        ],
    },
    {
        name: "Arquitetura / Design Técnico",
        weight: 25,
        minChars: 600,
        patterns: [
            "docs/fase-*-arquitetura/arquitetura.md",
            "docs/fase-*-technical-design/technical-design.md",
            "docs/fase-03-arquitetura/arquitetura.md",
            "docs/fase-04-*/technical-design.md",
            "docs/fase-05-*/technical-design.md",
            "docs/*-arquitetura/arquitetura.md",
        ],
        keywords: ["stack", "ADR"],
    },
    {
        name: "Backlog / Planejamento",
        weight: 15,
        minChars: 300,
        patterns: [
            "docs/fase-*-planejamento/backlog.md",
            "docs/fase-*-backlog/backlog.md",
            "docs/fase-05-*/backlog.md",
            "docs/fase-07-*/backlog.md",
            "docs/*-backlog/backlog.md",
        ],
        keywords: ["US-"],
        requiredFor: ["medio", "complexo"],
    },
    {
        name: "Contrato API",
        weight: 5,
        minChars: 200,
        patterns: [
            "docs/fase-*-contrato-api/openapi.yaml",
            "docs/fase-*-api/openapi.yaml",
            "docs/*-api/openapi.yaml",
        ],
        requiredFor: ["complexo"],
    },
];

// ============================================================
// MAIN FUNCTION
// ============================================================

/**
 * Executa o Readiness Check — verifica existência real de artefatos no disco.
 *
 * @param estado Estado atual do projeto
 * @param diretorio Diretório raiz do projeto
 * @returns ReadinessResult com score, breakdown e recomendações
 */
export async function readinessCheck(
    estado: EstadoProjeto,
    diretorio: string,
): Promise<ReadinessResult> {
    const nivel = estado.nivel;
    const artifacts: ReadinessArtifact[] = [];
    const gaps: string[] = [];

    // Filtrar artefatos relevantes para o nível de complexidade
    const relevantDefs = ARTIFACT_DEFS.filter(def => {
        if (!def.requiredFor) return true;
        return def.requiredFor.includes(nivel);
    });

    // Normalizar pesos para somar 100
    const totalWeight = relevantDefs.reduce((sum, d) => sum + d.weight, 0);
    const weightMultiplier = totalWeight > 0 ? 100 / totalWeight : 1;

    for (const def of relevantDefs) {
        const normalizedWeight = Math.round(def.weight * weightMultiplier);
        const result = await checkArtifact(diretorio, def, estado);

        artifacts.push({
            name: def.name,
            exists: result.exists,
            score: result.exists ? normalizedWeight : 0,
            weight: normalizedWeight,
            path: result.path,
            charCount: result.charCount,
            minChars: def.minChars,
        });

        if (!result.exists) {
            gaps.push(def.name);
        }
    }

    const score = artifacts.reduce((sum, a) => sum + a.score, 0);
    const approved = score >= 80;
    const requiresManualApproval = score >= 60 && score < 80;

    const recommendation = generateRecommendation(score, gaps, nivel);

    return {
        score,
        approved,
        requiresManualApproval,
        artifacts,
        gaps,
        recommendation,
    };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Verifica se um artefato existe no disco e tem conteúdo mínimo.
 * Tenta múltiplos patterns e também busca no estado.entregaveis.
 */
async function checkArtifact(
    diretorio: string,
    def: ArtifactDef,
    estado: EstadoProjeto,
): Promise<{ exists: boolean; path: string | null; charCount: number }> {
    // 1. Buscar nos entregáveis registrados no estado
    for (const [_key, absPath] of Object.entries(estado.entregaveis || {})) {
        const pathLower = (absPath as string).toLowerCase();
        const nameKeywords = def.name.toLowerCase().split(/[\s\/]+/);

        const matches = nameKeywords.some(kw =>
            kw.length > 3 && pathLower.includes(kw)
        );

        if (matches) {
            try {
                const content = await readFile(absPath as string, "utf-8");
                if (content && content.trim().length >= def.minChars) {
                    const keywordsOk = checkKeywords(content, def.keywords);
                    if (keywordsOk) {
                        return { exists: true, path: absPath as string, charCount: content.length };
                    }
                }
            } catch { /* file not found */ }
        }
    }

    // 2. Tentar patterns no filesystem
    const { readdirSync } = await import("fs");
    for (const pattern of def.patterns) {
        const resolved = resolveGlobPattern(diretorio, pattern);
        for (const candidate of resolved) {
            if (existsSync(candidate)) {
                try {
                    const content = await readFile(candidate, "utf-8");
                    if (content && content.trim().length >= def.minChars) {
                        const keywordsOk = checkKeywords(content, def.keywords);
                        if (keywordsOk) {
                            return { exists: true, path: candidate, charCount: content.length };
                        }
                    }
                } catch { /* read error */ }
            }
        }
    }

    return { exists: false, path: null, charCount: 0 };
}

/**
 * Verifica se o conteúdo contém as keywords obrigatórias.
 */
function checkKeywords(content: string, keywords?: string[]): boolean {
    if (!keywords || keywords.length === 0) return true;
    const lower = content.toLowerCase();
    return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Resolve padrões glob simples (* only) em caminhos reais.
 * Suporta apenas * em nomes de diretório — não é um glob engine completo.
 */
function resolveGlobPattern(diretorio: string, pattern: string): string[] {
    const parts = pattern.split("/");
    let candidates = [diretorio];

    for (const part of parts) {
        const nextCandidates: string[] = [];

        for (const dir of candidates) {
            if (part.includes("*")) {
                // Wildcard: listar diretórios e filtrar
                try {
                    const { readdirSync } = require("fs");
                    const entries = readdirSync(dir, { withFileTypes: true });
                    const regex = new RegExp(
                        "^" + part.replace(/\*/g, ".*") + "$",
                        "i"
                    );
                    for (const entry of entries) {
                        if (regex.test(entry.name)) {
                            nextCandidates.push(join(dir, entry.name));
                        }
                    }
                } catch { /* dir doesn't exist */ }
            } else {
                nextCandidates.push(join(dir, part));
            }
        }

        candidates = nextCandidates;
    }

    return candidates;
}

/**
 * Gera recomendação textual baseada no score e nos gaps.
 */
function generateRecommendation(
    score: number,
    gaps: string[],
    nivel: NivelComplexidade
): string {
    if (score >= 80) {
        return "✅ Todos os artefatos de engenharia estão prontos. Pode prosseguir para código.";
    }

    if (score >= 60) {
        return [
            `⚠️ Score ${score}/100 — aprovação manual necessária.`,
            `Artefatos faltando: ${gaps.join(", ")}.`,
            `Opções: (1) Gerar os artefatos faltantes. (2) Aprovar manualmente para prosseguir.`,
        ].join("\n");
    }

    return [
        `❌ Score ${score}/100 — bloqueado. Artefatos críticos faltando.`,
        `Faltam: ${gaps.join(", ")}.`,
        `Complete as fases de engenharia antes de iniciar o código.`,
    ].join("\n");
}

/**
 * Formata o resultado do Readiness Gate como markdown para exibição.
 */
export function formatReadinessResult(result: ReadinessResult): string {
    const lines: string[] = [];

    lines.push(`# 🔒 Readiness Gate — Checkpoint Pré-Código\n`);
    lines.push(`## Score: ${result.score}/100\n`);

    // Tabela de artefatos
    lines.push(`| Artefato | Status | Chars | Mínimo | Score |`);
    lines.push(`|----------|--------|-------|--------|-------|`);
    for (const a of result.artifacts) {
        const status = a.exists ? "✅" : "❌";
        const chars = a.exists ? String(a.charCount) : "—";
        lines.push(`| ${a.name} | ${status} | ${chars} | ${a.minChars} | ${a.score}/${a.weight} |`);
    }
    lines.push("");

    // Gaps
    if (result.gaps.length > 0) {
        lines.push(`## ❌ Artefatos Faltando\n`);
        for (const gap of result.gaps) {
            lines.push(`- **${gap}** — gere este documento antes de iniciar o código`);
        }
        lines.push("");
    }

    // Recomendação
    lines.push(`## Recomendação\n`);
    lines.push(result.recommendation);
    lines.push("");

    // Ações
    if (result.requiresManualApproval) {
        lines.push(`## 🔐 Ação Necessária\n`);
        lines.push(`- **Para corrigir** (recomendado): Complete os artefatos faltantes e re-submeta`);
        lines.push(`- **Para aprovar mesmo assim**: Diga "aprovar readiness gate"`);
        lines.push(`\n> ⚠️ A IA NÃO pode aprovar automaticamente. Aguarde decisão do usuário.`);
    } else if (!result.approved) {
        lines.push(`## ⛔ Bloqueado\n`);
        lines.push(`Complete as fases de engenharia antes de iniciar o código.`);
        lines.push(`Use \`executar({ acao: "avancar" })\` em cada fase pendente.`);
    }

    return lines.join("\n");
}
