import type { TierGate } from "../types/index.js";
import type { TemplateStructure, TemplateSection, TemplateCheckbox } from "./template-parser.js";
import { getSecoesObrigatoriasPorTier, gerarRegexSecao } from "./template-parser.js";

export interface ValidationResult {
    valido: boolean;
    score: number;
    scoreDetalhado: ScoreDetalhado;
    secoesEncontradas: string[];
    secoesFaltando: string[];
    checkboxesPreenchidos: number;
    checkboxesTotal: number;
    placeholdersNaoSubstituidos: string[];
    camposFaltando: string[];
    feedback: string[];
    sugestoes: string[];
}

export interface ScoreDetalhado {
    estrutura: number;
    conteudo: number;
    checkboxes: number;
    qualidade: number;
    total: number;
}

/**
 * Valida um entregável contra um template
 */
export function validarContraTemplate(
    entregavel: string,
    template: TemplateStructure,
    tier: TierGate = "base"
): ValidationResult {
    const secoesObrigatorias = getSecoesObrigatoriasPorTier(template, tier);
    const secoesEncontradas: string[] = [];
    const secoesFaltando: string[] = [];
    const feedback: string[] = [];
    const sugestoes: string[] = [];

    // 1. Validar estrutura de seções
    for (const secao of secoesObrigatorias) {
        const regex = gerarRegexSecao(secao);
        const encontrada = regex.test(entregavel);

        if (encontrada) {
            secoesEncontradas.push(secao.titulo);
        } else {
            secoesFaltando.push(secao.titulo);
            feedback.push(`❌ Seção obrigatória faltando: **${secao.titulo}**`);
            sugestoes.push(`Adicione a seção "${secao.titulo}" seguindo o template`);
        }
    }

    // 2. Validar checkboxes
    const { checkboxesPreenchidos, checkboxesTotal } = validarCheckboxes(
        entregavel,
        template,
        tier,
        feedback,
        sugestoes
    );

    // 3. Validar placeholders
    const placeholdersNaoSubstituidos = detectarPlaceholders(entregavel, template.camposObrigatorios);
    if (placeholdersNaoSubstituidos.length > 0) {
        feedback.push(`⚠️ ${placeholdersNaoSubstituidos.length} placeholder(s) não substituído(s)`);
        placeholdersNaoSubstituidos.slice(0, 3).forEach(p => {
            sugestoes.push(`Substitua o placeholder: [${p}]`);
        });
    }

    // 4. Validar campos obrigatórios
    const camposFaltando = validarCamposObrigatorios(entregavel, template, feedback);

    // 5. Validar checklist de qualidade
    const checklistQualidadeScore = validarChecklistQualidade(
        entregavel,
        template.checklistQualidade,
        feedback
    );

    // 6. Calcular scores
    const scoreDetalhado = calcularScores(
        secoesEncontradas.length,
        secoesObrigatorias.length,
        checkboxesPreenchidos,
        checkboxesTotal,
        placeholdersNaoSubstituidos.length,
        template.camposObrigatorios.length,
        checklistQualidadeScore,
        entregavel.length
    );

    // 7. Determinar se é válido
    const valido = determinarValidade(
        secoesFaltando.length,
        checkboxesPreenchidos,
        checkboxesTotal,
        tier,
        scoreDetalhado.total
    );

    return {
        valido,
        score: scoreDetalhado.total,
        scoreDetalhado,
        secoesEncontradas,
        secoesFaltando,
        checkboxesPreenchidos,
        checkboxesTotal,
        placeholdersNaoSubstituidos,
        camposFaltando,
        feedback,
        sugestoes,
    };
}

/**
 * Valida checkboxes preenchidos no entregável
 */
function validarCheckboxes(
    entregavel: string,
    template: TemplateStructure,
    tier: TierGate,
    feedback: string[],
    sugestoes: string[]
): { checkboxesPreenchidos: number; checkboxesTotal: number } {
    const tierOrder: Record<TierGate, number> = { essencial: 0, base: 1, avancado: 2 };
    const tierAtual = tierOrder[tier];

    const checkboxesRelevantes = template.checkboxes.filter(cb => {
        const tierMinimo = tierOrder[cb.tierMinimo];
        return tierAtual >= tierMinimo;
    });

    let checkboxesPreenchidos = 0;
    const checkboxesNaoPreenchidos: TemplateCheckbox[] = [];

    for (const checkbox of checkboxesRelevantes) {
        const textoLimpo = checkbox.texto
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .slice(0, 30);

        const regexPreenchido = new RegExp(`\\[x\\].*?${textoLimpo}`, "i");
        
        if (regexPreenchido.test(entregavel)) {
            checkboxesPreenchidos++;
        } else {
            checkboxesNaoPreenchidos.push(checkbox);
        }
    }

    const percentualPreenchido = checkboxesRelevantes.length > 0
        ? (checkboxesPreenchidos / checkboxesRelevantes.length) * 100
        : 100;

    if (percentualPreenchido < 50) {
        feedback.push(`⚠️ Apenas ${Math.round(percentualPreenchido)}% dos checkboxes preenchidos`);
    }

    if (checkboxesNaoPreenchidos.length > 0 && checkboxesNaoPreenchidos.length <= 5) {
        feedback.push(`📋 Checkboxes pendentes:`);
        checkboxesNaoPreenchidos.slice(0, 5).forEach(cb => {
            sugestoes.push(`Preencher: ${cb.texto.slice(0, 60)}`);
        });
    }

    return {
        checkboxesPreenchidos,
        checkboxesTotal: checkboxesRelevantes.length,
    };
}

/**
 * Detecta placeholders não substituídos
 */
function detectarPlaceholders(entregavel: string, camposObrigatorios: string[]): string[] {
    const placeholdersEncontrados: string[] = [];

    for (const campo of camposObrigatorios) {
        const regex = new RegExp(`\\[${campo}\\]`, "i");
        if (regex.test(entregavel)) {
            placeholdersEncontrados.push(campo);
        }
    }

    return placeholdersEncontrados;
}

/**
 * Valida campos obrigatórios preenchidos
 */
function validarCamposObrigatorios(
    entregavel: string,
    template: TemplateStructure,
    feedback: string[]
): string[] {
    const camposFaltando: string[] = [];

    for (const campo of template.camposObrigatorios.slice(0, 10)) {
        const regex = new RegExp(`\\[${campo}\\]`, "i");
        if (regex.test(entregavel)) {
            camposFaltando.push(campo);
        }
    }

    if (camposFaltando.length > 0) {
        feedback.push(`⚠️ ${camposFaltando.length} campo(s) obrigatório(s) não preenchido(s)`);
    }

    return camposFaltando;
}

/**
 * Valida checklist de qualidade
 */
function validarChecklistQualidade(
    entregavel: string,
    checklistQualidade: string[],
    feedback: string[]
): number {
    if (checklistQualidade.length === 0) {
        return 100;
    }

    let itensEncontrados = 0;

    for (const item of checklistQualidade) {
        const textoLimpo = item
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .slice(0, 30);

        const regexItem = new RegExp(`\\[x\\].*?${textoLimpo}`, "i");
        
        if (regexItem.test(entregavel)) {
            itensEncontrados++;
        }
    }

    const percentual = (itensEncontrados / checklistQualidade.length) * 100;

    if (percentual < 70) {
        feedback.push(`⚠️ Checklist de qualidade: ${Math.round(percentual)}% completo`);
    }

    return percentual;
}

/**
 * Calcula scores detalhados
 */
function calcularScores(
    secoesEncontradas: number,
    secoesTotal: number,
    checkboxesPreenchidos: number,
    checkboxesTotal: number,
    placeholdersNaoSubstituidos: number,
    totalPlaceholders: number,
    checklistQualidadeScore: number,
    tamanhoEntregavel: number
): ScoreDetalhado {
    // Score de estrutura (30%)
    const scoreEstrutura = secoesTotal > 0
        ? (secoesEncontradas / secoesTotal) * 100
        : 100;

    // Score de conteúdo (40%)
    const placeholdersSubstituidos = totalPlaceholders > 0
        ? ((totalPlaceholders - placeholdersNaoSubstituidos) / totalPlaceholders) * 100
        : 100;
    
    const densidadeScore = Math.min((tamanhoEntregavel / 1000) * 100, 100);
    const scoreConteudo = (placeholdersSubstituidos * 0.7) + (densidadeScore * 0.3);

    // Score de checkboxes (20%)
    const scoreCheckboxes = checkboxesTotal > 0
        ? (checkboxesPreenchidos / checkboxesTotal) * 100
        : 100;

    // Score de qualidade (10%)
    const scoreQualidade = checklistQualidadeScore;

    // Score total
    const scoreTotal = Math.round(
        (scoreEstrutura * 0.3) +
        (scoreConteudo * 0.4) +
        (scoreCheckboxes * 0.2) +
        (scoreQualidade * 0.1)
    );

    return {
        estrutura: Math.round(scoreEstrutura),
        conteudo: Math.round(scoreConteudo),
        checkboxes: Math.round(scoreCheckboxes),
        qualidade: Math.round(scoreQualidade),
        total: scoreTotal,
    };
}

/**
 * Determina se o entregável é válido
 */
function determinarValidade(
    secoesFaltando: number,
    checkboxesPreenchidos: number,
    checkboxesTotal: number,
    tier: TierGate,
    scoreTotal: number
): boolean {
    // Critérios por tier
    const criterios: Record<TierGate, { minScore: number; minCheckboxes: number }> = {
        essencial: { minScore: 50, minCheckboxes: 0.5 },
        base: { minScore: 70, minCheckboxes: 0.7 },
        avancado: { minScore: 85, minCheckboxes: 0.9 },
    };

    const criterio = criterios[tier];
    const percentualCheckboxes = checkboxesTotal > 0
        ? checkboxesPreenchidos / checkboxesTotal
        : 1;

    return (
        secoesFaltando === 0 &&
        scoreTotal >= criterio.minScore &&
        percentualCheckboxes >= criterio.minCheckboxes
    );
}

/**
 * Formata resultado de validação para exibição
 */
export function formatarResultadoValidacao(resultado: ValidationResult, tier: TierGate): string {
    const { valido, score, scoreDetalhado, feedback, sugestoes } = resultado;

    let output = "";

    // Status geral
    if (valido) {
        output += `✅ **Validação aprovada!** Score: ${score}/100\n\n`;
    } else {
        output += `⚠️ **Validação pendente** Score: ${score}/100\n\n`;
    }

    // Score detalhado
    output += `### 📊 Score Detalhado\n\n`;
    output += `- **Estrutura (30%):** ${scoreDetalhado.estrutura}/100\n`;
    output += `- **Conteúdo (40%):** ${scoreDetalhado.conteudo}/100\n`;
    output += `- **Checkboxes (20%):** ${scoreDetalhado.checkboxes}/100\n`;
    output += `- **Qualidade (10%):** ${scoreDetalhado.qualidade}/100\n\n`;

    // Progresso de checkboxes
    const percentualCheckboxes = resultado.checkboxesTotal > 0
        ? Math.round((resultado.checkboxesPreenchidos / resultado.checkboxesTotal) * 100)
        : 100;
    
    output += `### ✅ Checkboxes: ${resultado.checkboxesPreenchidos}/${resultado.checkboxesTotal} (${percentualCheckboxes}%)\n\n`;

    // Seções
    if (resultado.secoesFaltando.length > 0) {
        output += `### ❌ Seções Faltando (${resultado.secoesFaltando.length})\n\n`;
        resultado.secoesFaltando.slice(0, 5).forEach(s => {
            output += `- ${s}\n`;
        });
        output += `\n`;
    }

    // Feedback
    if (feedback.length > 0) {
        output += `### 💬 Feedback\n\n`;
        feedback.slice(0, 8).forEach(f => {
            output += `${f}\n`;
        });
        output += `\n`;
    }

    // Sugestões
    if (sugestoes.length > 0 && !valido) {
        output += `### 💡 Sugestões de Melhoria\n\n`;
        sugestoes.slice(0, 5).forEach(s => {
            output += `- ${s}\n`;
        });
        output += `\n`;
    }

    return output;
}
