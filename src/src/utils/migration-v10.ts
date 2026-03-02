/**
 * Migration v9 → v10 (Maestro)
 * 
 * Migra estado de projetos existentes (v9) para o novo formato v10.
 * Ajusta: nomes de fases, numeração, total_fases, skills.
 * 
 * Regras:
 * - Projetos com total_fases 7/13/17 (v9) → 5/8/11 (v10)
 * - Renumera fase_atual baseado na fase em que o projeto está
 * - Atualiza gates_validados com nova numeração
 * - Preserva entregáveis já gerados (não perde dados)
 * - Adiciona readiness_approved=false por padrão
 * 
 * @since v10.0
 */

import type { EstadoProjeto, NivelComplexidade } from "../types/index.js";

/**
 * Mapeamento de nomes de fases v9 → nome da fase v10 mais próxima.
 * Usado para re-posicionar o projeto no novo fluxo.
 */
const FASE_V9_TO_V10: Record<string, { v10Name: string; v10Number: Record<NivelComplexidade, number> }> = {
    // Fases v9 que existem em v10 (direto)
    'Produto': { v10Name: 'Produto', v10Number: { simples: 1, medio: 1, complexo: 1 } },
    'Requisitos': { v10Name: 'Requisitos', v10Number: { simples: 1, medio: 2, complexo: 2 } },
    'UX Design': { v10Name: 'Design', v10Number: { simples: 2, medio: 3, complexo: 3 } },
    
    // Fases v9 que foram mergeadas em v10
    'Modelo de Domínio': { v10Name: 'Design Técnico', v10Number: { simples: 3, medio: 4, complexo: 4 } },
    'Banco de Dados': { v10Name: 'Design Técnico', v10Number: { simples: 3, medio: 4, complexo: 5 } },
    'Arquitetura': { v10Name: 'Arquitetura', v10Number: { simples: 3, medio: 4, complexo: 5 } },
    'Segurança': { v10Name: 'Design Técnico', v10Number: { simples: 3, medio: 4, complexo: 5 } },
    'Testes': { v10Name: 'Planejamento', v10Number: { simples: 3, medio: 5, complexo: 7 } },
    'Backlog': { v10Name: 'Planejamento', v10Number: { simples: 3, medio: 5, complexo: 7 } },
    'Contrato API': { v10Name: 'Contrato API', v10Number: { simples: 3, medio: 5, complexo: 6 } },
    
    // Fases v9 complexo que foram simplificadas
    'Arquitetura Avançada': { v10Name: 'Design Técnico', v10Number: { simples: 3, medio: 4, complexo: 5 } },
    'Performance': { v10Name: 'Design Técnico', v10Number: { simples: 3, medio: 4, complexo: 5 } },
    'Observabilidade': { v10Name: 'Deploy & Operação', v10Number: { simples: 5, medio: 8, complexo: 11 } },
    
    // Fases de código (mesmos nomes, numeração diferente)
    'Frontend': { v10Name: 'Frontend', v10Number: { simples: 4, medio: 6, complexo: 8 } },
    'Backend': { v10Name: 'Backend', v10Number: { simples: 5, medio: 7, complexo: 9 } },
    'Integração': { v10Name: 'Integração & Deploy', v10Number: { simples: 5, medio: 8, complexo: 10 } },
    'Deploy Final': { v10Name: 'Deploy & Operação', v10Number: { simples: 5, medio: 8, complexo: 11 } },
};

/**
 * Verifica se um estado precisa de migração v9→v10.
 */
export function needsMigration(estado: EstadoProjeto): boolean {
    // v9 tinha total_fases 7, 13 ou 17
    // v10 tem 5, 8 ou 11
    const v9Totals = [7, 13, 17];
    return v9Totals.includes(estado.total_fases);
}

/**
 * Migra estado v9 para v10.
 * Retorna novo estado com numeração atualizada.
 * NÃO modifica o objeto original — retorna cópia.
 */
export function migrateStateV9toV10(estado: EstadoProjeto): EstadoProjeto {
    if (!needsMigration(estado)) {
        return estado;
    }

    const migrated = { ...estado };
    
    // 1. Atualizar total_fases baseado no nível
    const newTotals: Record<number, { nivel: NivelComplexidade; total: number }> = {
        7: { nivel: 'simples', total: 5 },
        13: { nivel: 'medio', total: 8 },
        17: { nivel: 'complexo', total: 11 },
    };
    
    const mapping = newTotals[estado.total_fases];
    if (mapping) {
        migrated.total_fases = mapping.total;
        migrated.nivel = mapping.nivel;
    }
    
    // 2. Remapear fase_atual
    // Precisamos saber em qual fase v9 o projeto está para mapear para v10
    // Estratégia: se está em fase de código, mapear direto. Se em fase de doc, usar a fase mergeada mais próxima.
    const currentPhaseV9 = findV9PhaseName(estado.fase_atual, estado.total_fases);
    if (currentPhaseV9 && FASE_V9_TO_V10[currentPhaseV9]) {
        const v10Info = FASE_V9_TO_V10[currentPhaseV9];
        migrated.fase_atual = v10Info.v10Number[migrated.nivel] || estado.fase_atual;
    }
    
    // 3. Remapear gates_validados
    // Gates passados continuam validados — remapear números
    if (migrated.gates_validados && migrated.gates_validados.length > 0) {
        const newGates: number[] = [];
        for (const oldGate of migrated.gates_validados) {
            const oldPhaseName = findV9PhaseName(oldGate, estado.total_fases);
            if (oldPhaseName && FASE_V9_TO_V10[oldPhaseName]) {
                const newNum = FASE_V9_TO_V10[oldPhaseName].v10Number[migrated.nivel];
                if (newNum && !newGates.includes(newNum)) {
                    newGates.push(newNum);
                }
            }
        }
        migrated.gates_validados = newGates.sort((a, b) => a - b);
    }
    
    // 4. Adicionar campos v10 se não existem
    if (migrated.readiness_approved === undefined) {
        migrated.readiness_approved = false;
    }
    
    // 5. Marcar como migrado
    (migrated as any)._migrated_from = `v9_${estado.total_fases}fases`;
    (migrated as any)._migrated_at = new Date().toISOString();
    
    console.error(`[migration-v10] Migrado: ${estado.total_fases} fases → ${migrated.total_fases} fases, fase_atual: ${estado.fase_atual} → ${migrated.fase_atual}`);
    
    return migrated;
}

/**
 * Encontra o nome da fase v9 baseado no número e total de fases.
 */
function findV9PhaseName(faseNumero: number, totalFases: number): string | null {
    // Mapeamento reverso: número da fase → nome da fase nos fluxos v9
    const v9Simples = ['Produto', 'Requisitos', 'UX Design', 'Arquitetura', 'Backlog', 'Frontend', 'Backend'];
    const v9Medio = ['Produto', 'Requisitos', 'UX Design', 'Modelo de Domínio', 'Banco de Dados', 'Arquitetura', 'Segurança', 'Testes', 'Backlog', 'Contrato API', 'Frontend', 'Backend', 'Integração'];
    const v9Complexo = ['Produto', 'Requisitos', 'UX Design', 'Modelo de Domínio', 'Banco de Dados', 'Arquitetura', 'Arquitetura Avançada', 'Segurança', 'Performance', 'Observabilidade', 'Testes', 'Backlog', 'Contrato API', 'Frontend', 'Backend', 'Integração', 'Deploy Final'];
    
    let fases: string[];
    switch (totalFases) {
        case 7: fases = v9Simples; break;
        case 13: fases = v9Medio; break;
        case 17: fases = v9Complexo; break;
        default: return null;
    }
    
    const idx = faseNumero - 1;
    return (idx >= 0 && idx < fases.length) ? fases[idx] : null;
}

/**
 * Gera relatório de migração para logging/debug.
 */
export function generateMigrationReport(before: EstadoProjeto, after: EstadoProjeto): string {
    const lines: string[] = [];
    lines.push('=== Migration Report v9 → v10 ===');
    lines.push(`Projeto: ${before.nome} (${before.projeto_id})`);
    lines.push(`Total fases: ${before.total_fases} → ${after.total_fases}`);
    lines.push(`Nível: ${before.nivel} → ${after.nivel}`);
    lines.push(`Fase atual: ${before.fase_atual} → ${after.fase_atual}`);
    lines.push(`Gates validados: [${before.gates_validados.join(',')}] → [${after.gates_validados.join(',')}]`);
    lines.push(`Entregáveis preservados: ${Object.keys(before.entregaveis).length}`);
    lines.push('================================');
    return lines.join('\n');
}
