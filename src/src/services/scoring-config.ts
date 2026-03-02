/**
 * Configuração de scoring contextual por tipo de fase.
 *
 * Fases de documento (PRD, Requisitos) têm critérios diferentes de
 * fases de código (Backend, Frontend).
 *
 * @since v6.5
 */

export interface ScoreWeights {
    estrutura: number;    // Peso do score de estrutura (0-1)
    checklist: number;    // Peso do score de checklist (0-1)
    qualidade: number;    // Peso do score de qualidade/tamanho (0-1)
    threshold: number;    // Score mínimo para aprovação (0-100)
}

export type PhaseCategory = 'documento' | 'design' | 'codigo';

/**
 * Pesos de scoring por categoria de fase.
 *
 * - documento: PRD, Requisitos — foco em checklist e qualidade de conteúdo
 * - design: UX, Arquitetura — foco em estrutura e consistência
 * - codigo: Backend, Frontend, Testes — foco em qualidade (testes, tipos)
 */
export const SCORE_WEIGHTS: Record<PhaseCategory, ScoreWeights> = {
    documento: { estrutura: 0.20, checklist: 0.40, qualidade: 0.40, threshold: 65 },
    design:    { estrutura: 0.30, checklist: 0.30, qualidade: 0.40, threshold: 70 },
    codigo:    { estrutura: 0.10, checklist: 0.30, qualidade: 0.60, threshold: 75 },
};

/**
 * Mapeamento de nomes de fase para categorias.
 * Se a fase não for encontrada, usa 'documento' como default.
 */
const PHASE_CATEGORY_MAP: Record<string, PhaseCategory> = {
    // Documentos (produto e requisitos)
    'Discovery': 'documento',
    'Produto': 'documento',
    'PRD': 'documento',
    'Requisitos': 'documento',

    // Design (visual e técnico) — inclui aliases de nomes v9
    'Design': 'design',
    'UX/UI': 'design',
    'UX Design': 'design',
    'Design Técnico': 'design',
    'Arquitetura': 'design',
    'Modelo de Domínio': 'design',
    'Contrato API': 'design',
    'Planejamento': 'documento',
    'Prototipagem': 'design',

    // Código (implementação e deploy)
    'Frontend': 'codigo',
    'Backend': 'codigo',
    'Integração': 'codigo',
    'Integração & Deploy': 'codigo',
    'Deploy & Operação': 'codigo',
};

/**
 * Determina a categoria de uma fase pelo nome.
 */
export function getPhaseCategory(faseName: string): PhaseCategory {
    // Busca exata
    if (PHASE_CATEGORY_MAP[faseName]) return PHASE_CATEGORY_MAP[faseName];

    // Busca parcial (contém)
    for (const [key, category] of Object.entries(PHASE_CATEGORY_MAP)) {
        if (faseName.toLowerCase().includes(key.toLowerCase())) return category;
    }

    return 'documento'; // Default
}

/**
 * Retorna os pesos de scoring para uma fase específica.
 */
export function getScoreWeights(faseName: string): ScoreWeights {
    const category = getPhaseCategory(faseName);
    return SCORE_WEIGHTS[category];
}

/**
 * Calcula score de qualidade usando pesos contextuais.
 *
 * @param estruturaScore - Score de estrutura (0-100)
 * @param checklistScore - Score de checklist (0-100)
 * @param qualidadeScore - Score de qualidade/tamanho (0-100)
 * @param faseName - Nome da fase para determinar pesos
 * @returns Score final (0-100) e se está aprovado
 */
export function calcularScoreContextual(
    estruturaScore: number,
    checklistScore: number,
    qualidadeScore: number,
    faseName: string
): { score: number; approved: boolean; weights: ScoreWeights; category: PhaseCategory } {
    const weights = getScoreWeights(faseName);
    const category = getPhaseCategory(faseName);

    const score = Math.round(
        (estruturaScore * weights.estrutura) +
        (checklistScore * weights.checklist) +
        (qualidadeScore * weights.qualidade)
    );

    return {
        score,
        approved: score >= weights.threshold,
        weights,
        category,
    };
}
