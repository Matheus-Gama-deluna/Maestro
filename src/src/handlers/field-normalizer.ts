/**
 * Field Normalizer — Módulo de normalização de campos do specialist handler
 *
 * Contém: FIELD_ALIASES, normalizeFieldKey, RequiredField, getRequiredFields, getFieldsByBlock
 *
 * @since v6.0 — Extraído de specialist-phase-handler.ts (Task 2.8)
 */

// === Sprint 5 (NP2, NP3): Fuzzy Field Matching ===

export const FIELD_ALIASES: Record<string, string[]> = {
    'problema': ['problema_central', 'problem', 'pain_point', 'dor', 'problema_principal'],
    'publico_alvo': ['publico', 'target', 'audience', 'usuarios', 'usuarios_alvo', 'target_audience'],
    'funcionalidades_mvp': ['features', 'funcionalidades', 'mvp', 'features_mvp', 'funcionalidades_principais'],
    'north_star_metric': ['metrica', 'metric', 'kpi', 'north_star', 'metrica_sucesso', 'metrica_principal'],
    'riscos': ['riscos_principais', 'risks', 'riscos_mercado', 'riscos_tecnicos', 'riscos_negocio'],
    'timeline': ['cronograma', 'prazo', 'timeline_desejado', 'quando', 'prazo_lancamento', 'prazo_mvp', 'prazo_mvp_desejado'],
    'personas': ['persona', 'persona_principal', 'personas_detalhadas', 'perfil_usuario'],
    'go_to_market': ['gtm', 'lancamento', 'estrategia_lancamento', 'go_to_market_strategy', 'estrategia_gtm'],
    'diferencial': ['diferencial_competitivo', 'vantagem', 'competitive_advantage', 'proposta_valor'],
    'visao_produto': ['visao', 'vision', 'missao', 'mission', 'visao_estrategica'],
};

export function normalizeFieldKey(key: string): string {
    const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
        if (normalized === canonical || aliases.includes(normalized)) {
            return canonical;
        }
    }
    return normalized;
}

export interface RequiredField {
    id: string;
    label: string;
    hint: string;
    example: string;
    block: 'problema' | 'solucao' | 'planejamento';
    modes: string[];
}

/**
 * Sprint 3 (NP1, NP5, NP9): Campos com linguagem simples, exemplos práticos e blocos temáticos.
 * Alinhados com seções do template PRD para eliminar gap campos vs template.
 */
export function getRequiredFields(mode: string): RequiredField[] {
    const fields: RequiredField[] = [
        // Bloco 1 — O Problema (todos os modos)
        { id: 'problema', label: 'Qual problema seu produto resolve?', hint: 'Descreva a dor principal que seus usuários sentem hoje', example: 'Ex: "Equipes perdem controle de tarefas por usar planilhas"', block: 'problema', modes: ['economy', 'balanced', 'quality'] },
        { id: 'publico_alvo', label: 'Quem vai usar seu produto?', hint: 'Descreva o perfil das pessoas que mais precisam da solução', example: 'Ex: "Pequenas empresas de 5-30 pessoas, coordenadores de equipe"', block: 'problema', modes: ['economy', 'balanced', 'quality'] },

        // Bloco 2 — A Solução (todos os modos)
        { id: 'funcionalidades_mvp', label: 'Quais as 3-5 coisas mais importantes que o produto precisa fazer?', hint: 'Liste as funcionalidades essenciais para a primeira versão', example: 'Ex: "Criar checklists, atribuir tarefas, ver status, notificar prazos"', block: 'solucao', modes: ['economy', 'balanced', 'quality'] },
        { id: 'north_star_metric', label: 'Qual número mostra que o produto está funcionando?', hint: 'A métrica mais importante para saber se o produto dá certo', example: 'Ex: "% de checklists concluídos no prazo" ou "Quantos pedidos por semana"', block: 'solucao', modes: ['economy', 'balanced', 'quality'] },
        { id: 'diferencial', label: 'O que torna seu produto diferente dos concorrentes?', hint: 'Sua vantagem competitiva ou proposta de valor única', example: 'Ex: "Integração nativa com WhatsApp, que nenhum concorrente tem"', block: 'solucao', modes: ['economy', 'balanced', 'quality'] },

        // Bloco 3 — Planejamento (balanced/quality)
        { id: 'riscos', label: 'O que pode dar errado?', hint: 'Riscos que podem atrapalhar o sucesso do produto', example: 'Ex: "Usuários não adotarem, custo alto de servidor, concorrente lançar antes"', block: 'planejamento', modes: ['balanced', 'quality'] },
        { id: 'timeline', label: 'Em quanto tempo quer lançar a primeira versão?', hint: 'Prazo desejado para o MVP estar no ar', example: 'Ex: "8 semanas para MVP + 2 semanas piloto"', block: 'planejamento', modes: ['balanced', 'quality'] },

        // Campos extras quality (alinhados com template PRD)
        { id: 'personas', label: 'Descreva 2-3 tipos de pessoas que vão usar (nome fictício, cargo, rotina)', hint: 'Perfis detalhados dos usuários principais', example: 'Ex: "Maria, coordenadora, monitora equipes pelo celular entre reuniões"', block: 'problema', modes: ['quality'] },
        { id: 'go_to_market', label: 'Como pretende conseguir os primeiros usuários?', hint: 'Estratégia para lançamento e adoção inicial', example: 'Ex: "Piloto com 2 clientes atuais, depois indicação boca-a-boca"', block: 'planejamento', modes: ['quality'] },
        { id: 'visao_produto', label: 'Onde você quer que o produto esteja em 1 ano?', hint: 'Visão de longo prazo do produto', example: 'Ex: "Ser a ferramenta padrão de gestão de tarefas para PMEs no Brasil"', block: 'solucao', modes: ['quality'] },
    ];

    return fields.filter(f => f.modes.includes(mode));
}

/**
 * Sprint 3: Agrupa campos por bloco temático para coleta em etapas
 */
export function getFieldsByBlock(mode: string): { block: string; title: string; fields: RequiredField[] }[] {
    const allFields = getRequiredFields(mode);
    const blocks = [
        { block: 'problema', title: '🔍 O Problema — Conte sobre o problema que quer resolver e quem sofre com ele' },
        { block: 'solucao', title: '💡 A Solução — O que o produto precisa fazer e como medir se está funcionando?' },
        { block: 'planejamento', title: '📅 Planejamento — Riscos, prazos e como chegar aos primeiros usuários' },
    ];

    return blocks
        .map(b => ({
            ...b,
            fields: allFields.filter(f => f.block === b.block),
        }))
        .filter(b => b.fields.length > 0);
}
