import type { TierGate } from "../types/index.js";
import type { TemplateStructure } from "./template-parser.js";

export interface QualityMetrics {
    densidadeInformacao: number;
    ausenciaPlaceholders: number;
    presencaDadosConcretos: number;
    checklistQualidade: number;
    overall: number;
}

/**
 * Calcula métricas de qualidade do entregável
 */
export function calcularQualidade(
    entregavel: string,
    template: TemplateStructure,
    tier: TierGate = "base"
): QualityMetrics {
    const densidadeInformacao = calcularDensidadeInformacao(entregavel);
    const ausenciaPlaceholders = calcularAusenciaPlaceholders(entregavel, template);
    const presencaDadosConcretos = calcularPresencaDadosConcretos(entregavel);
    const checklistQualidade = calcularChecklistQualidade(entregavel, template);

    const overall = Math.round(
        (densidadeInformacao * 0.3) +
        (ausenciaPlaceholders * 0.3) +
        (presencaDadosConcretos * 0.2) +
        (checklistQualidade * 0.2)
    );

    return {
        densidadeInformacao,
        ausenciaPlaceholders,
        presencaDadosConcretos,
        checklistQualidade,
        overall,
    };
}

/**
 * Calcula densidade de informação (chars úteis / seção)
 */
function calcularDensidadeInformacao(entregavel: string): number {
    const linhas = entregavel.split("\n");
    let charsUteis = 0;
    let totalLinhas = 0;

    for (const linha of linhas) {
        const linhaTrimmed = linha.trim();
        
        // Ignora linhas vazias, headers, separadores
        if (
            linhaTrimmed.length === 0 ||
            linhaTrimmed.match(/^#{1,6}\s/) ||
            linhaTrimmed.match(/^-{3,}$/) ||
            linhaTrimmed.match(/^={3,}$/)
        ) {
            continue;
        }

        charsUteis += linhaTrimmed.length;
        totalLinhas++;
    }

    const mediaPorLinha = totalLinhas > 0 ? charsUteis / totalLinhas : 0;

    // Score baseado em média de 50 chars/linha como ideal
    const score = Math.min((mediaPorLinha / 50) * 100, 100);
    return Math.round(score);
}

/**
 * Calcula score de ausência de placeholders
 */
function calcularAusenciaPlaceholders(entregavel: string, template: TemplateStructure): number {
    if (template.camposObrigatorios.length === 0) {
        return 100;
    }

    let placeholdersEncontrados = 0;

    for (const campo of template.camposObrigatorios) {
        const regex = new RegExp(`\\[${campo}\\]`, "i");
        if (regex.test(entregavel)) {
            placeholdersEncontrados++;
        }
    }

    const score = ((template.camposObrigatorios.length - placeholdersEncontrados) / template.camposObrigatorios.length) * 100;
    return Math.round(score);
}

/**
 * Calcula presença de dados concretos (números, datas, URLs, etc)
 */
function calcularPresencaDadosConcretos(entregavel: string): number {
    const indicadores = [
        /\d{1,3}%/g,                    // Percentuais
        /\d+\s*(usuários|users|clientes)/gi, // Números de usuários
        /\d{4}-\d{2}-\d{2}/g,           // Datas ISO
        /\d{1,2}\/\d{1,2}\/\d{2,4}/g,   // Datas BR/US
        /https?:\/\/[^\s]+/g,           // URLs
        /\$\d+/g,                       // Valores monetários
        /\d+\s*(ms|seg|min|hora)/gi,    // Tempos
        /\d+\s*(MB|GB|KB)/gi,           // Tamanhos
    ];

    let totalIndicadores = 0;

    for (const regex of indicadores) {
        const matches = entregavel.match(regex);
        if (matches) {
            totalIndicadores += matches.length;
        }
    }

    // Score baseado em pelo menos 10 dados concretos
    const score = Math.min((totalIndicadores / 10) * 100, 100);
    return Math.round(score);
}

/**
 * Calcula score do checklist de qualidade
 */
function calcularChecklistQualidade(entregavel: string, template: TemplateStructure): number {
    if (template.checklistQualidade.length === 0) {
        return 100;
    }

    let itensPreenchidos = 0;

    for (const item of template.checklistQualidade) {
        const textoLimpo = item
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .slice(0, 30);

        const regex = new RegExp(`\\[x\\].*?${textoLimpo}`, "i");
        
        if (regex.test(entregavel)) {
            itensPreenchidos++;
        }
    }

    const score = (itensPreenchidos / template.checklistQualidade.length) * 100;
    return Math.round(score);
}

/**
 * Gera relatório de qualidade detalhado
 */
export function gerarRelatorioQualidade(
    metricas: QualityMetrics,
    tier: TierGate
): string {
    let relatorio = `## 📈 Relatório de Qualidade\n\n`;

    relatorio += `**Score Geral:** ${metricas.overall}/100\n\n`;

    relatorio += `### Métricas Detalhadas\n\n`;
    
    relatorio += `- **Densidade de Informação:** ${metricas.densidadeInformacao}/100\n`;
    relatorio += `  ${getStatusEmoji(metricas.densidadeInformacao)} ${getStatusTexto(metricas.densidadeInformacao, "densidade")}\n\n`;

    relatorio += `- **Ausência de Placeholders:** ${metricas.ausenciaPlaceholders}/100\n`;
    relatorio += `  ${getStatusEmoji(metricas.ausenciaPlaceholders)} ${getStatusTexto(metricas.ausenciaPlaceholders, "placeholders")}\n\n`;

    relatorio += `- **Presença de Dados Concretos:** ${metricas.presencaDadosConcretos}/100\n`;
    relatorio += `  ${getStatusEmoji(metricas.presencaDadosConcretos)} ${getStatusTexto(metricas.presencaDadosConcretos, "dados")}\n\n`;

    relatorio += `- **Checklist de Qualidade:** ${metricas.checklistQualidade}/100\n`;
    relatorio += `  ${getStatusEmoji(metricas.checklistQualidade)} ${getStatusTexto(metricas.checklistQualidade, "checklist")}\n\n`;

    // Sugestões baseadas em tier
    const sugestoes = gerarSugestoesQualidade(metricas, tier);
    if (sugestoes.length > 0) {
        relatorio += `### 💡 Sugestões de Melhoria\n\n`;
        sugestoes.forEach(s => {
            relatorio += `- ${s}\n`;
        });
    }

    return relatorio;
}

/**
 * Retorna emoji baseado no score
 */
function getStatusEmoji(score: number): string {
    if (score >= 80) return "✅";
    if (score >= 60) return "⚠️";
    return "❌";
}

/**
 * Retorna texto de status baseado no score e tipo
 */
function getStatusTexto(score: number, tipo: string): string {
    if (score >= 80) {
        switch (tipo) {
            case "densidade":
                return "Conteúdo bem detalhado";
            case "placeholders":
                return "Todos os campos preenchidos";
            case "dados":
                return "Dados concretos presentes";
            case "checklist":
                return "Checklist completo";
            default:
                return "Excelente";
        }
    }

    if (score >= 60) {
        switch (tipo) {
            case "densidade":
                return "Conteúdo pode ser mais detalhado";
            case "placeholders":
                return "Alguns campos ainda não preenchidos";
            case "dados":
                return "Adicione mais dados concretos";
            case "checklist":
                return "Complete o checklist";
            default:
                return "Bom, mas pode melhorar";
        }
    }

    switch (tipo) {
        case "densidade":
            return "Conteúdo muito superficial";
        case "placeholders":
            return "Muitos campos não preenchidos";
        case "dados":
            return "Faltam dados concretos";
        case "checklist":
            return "Checklist incompleto";
        default:
            return "Precisa melhorar";
    }
}

/**
 * Gera sugestões de melhoria baseadas nas métricas
 */
function gerarSugestoesQualidade(metricas: QualityMetrics, tier: TierGate): string[] {
    const sugestoes: string[] = [];

    if (metricas.densidadeInformacao < 70) {
        sugestoes.push("Adicione mais detalhes e contexto em cada seção");
        sugestoes.push("Expanda as descrições com exemplos práticos");
    }

    if (metricas.ausenciaPlaceholders < 80) {
        sugestoes.push("Substitua todos os placeholders [Campo] por valores reais");
    }

    if (metricas.presencaDadosConcretos < 60) {
        sugestoes.push("Inclua dados concretos: números, percentuais, datas, URLs");
        sugestoes.push("Adicione métricas mensuráveis e objetivos quantificáveis");
    }

    if (metricas.checklistQualidade < 70 && tier !== "essencial") {
        sugestoes.push("Complete o checklist de qualidade no final do documento");
    }

    if (metricas.overall < 60) {
        sugestoes.push("Revise o template da skill para garantir completude");
    }

    return sugestoes;
}

/**
 * Compara qualidade com tier esperado
 */
export function compararComTier(metricas: QualityMetrics, tier: TierGate): {
    adequado: boolean;
    mensagem: string;
} {
    const requisitos: Record<TierGate, number> = {
        essencial: 50,
        base: 70,
        avancado: 85,
    };

    const scoreMinimo = requisitos[tier];
    const adequado = metricas.overall >= scoreMinimo;

    let mensagem = "";
    if (adequado) {
        mensagem = `✅ Qualidade adequada para tier ${tier} (mínimo: ${scoreMinimo})`;
    } else {
        const diferenca = scoreMinimo - metricas.overall;
        mensagem = `⚠️ Qualidade abaixo do tier ${tier}. Faltam ${diferenca} pontos para atingir o mínimo de ${scoreMinimo}`;
    }

    return { adequado, mensagem };
}
