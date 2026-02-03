import { readFileSync, existsSync } from "fs";
import type { TierGate } from "../types/index.js";

export interface TemplateMetadata {
    fase: string;
    skill: string;
    versao?: string;
    autor?: string;
}

export interface TemplateCheckbox {
    secao: string;
    texto: string;
    obrigatorio: boolean;
    tierMinimo: TierGate;
    linha: number;
}

export interface TemplateSection {
    nivel: number;
    titulo: string;
    tituloCompleto: string;
    obrigatorio: boolean;
    tierMinimo: TierGate;
    subsecoes: TemplateSection[];
    checkboxes: TemplateCheckbox[];
    conteudo: string;
    linha: number;
}

export interface TemplateStructure {
    secoes: TemplateSection[];
    checkboxes: TemplateCheckbox[];
    camposObrigatorios: string[];
    checklistQualidade: string[];
    metadata: TemplateMetadata;
    conteudoCompleto: string;
}

/**
 * Parseia um template markdown e extrai sua estrutura
 */
export function parseTemplate(templatePath: string): TemplateStructure | null {
    if (!existsSync(templatePath)) {
        return null;
    }

    const conteudo = readFileSync(templatePath, "utf-8");
    const linhas = conteudo.split("\n");

    const secoes: TemplateSection[] = [];
    const checkboxes: TemplateCheckbox[] = [];
    const camposObrigatorios: string[] = [];
    const checklistQualidade: string[] = [];
    
    let secaoAtual: TemplateSection | null = null;
    let pilhaSecoes: TemplateSection[] = [];
    let dentroChecklistQualidade = false;

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        const numeroLinha = i + 1;

        // Detectar checklist de qualidade
        if (linha.match(/^#{1,3}\s*checklist\s+(de\s+)?qualidade/i)) {
            dentroChecklistQualidade = true;
            continue;
        }

        // Extrair itens do checklist de qualidade
        if (dentroChecklistQualidade && linha.match(/^-\s*\[\s*\]/)) {
            const match = linha.match(/^-\s*\[\s*\]\s*\*?\*?(.+?)\*?\*?$/);
            if (match) {
                checklistQualidade.push(match[1].trim());
            }
            continue;
        }

        // Detectar headers (seções)
        const headerMatch = linha.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            dentroChecklistQualidade = false;
            const nivel = headerMatch[1].length;
            const titulo = headerMatch[2].trim();

            const secao: TemplateSection = {
                nivel,
                titulo: limparTitulo(titulo),
                tituloCompleto: titulo,
                obrigatorio: true,
                tierMinimo: "base",
                subsecoes: [],
                checkboxes: [],
                conteudo: "",
                linha: numeroLinha,
            };

            // Ajustar hierarquia de seções
            while (pilhaSecoes.length > 0 && pilhaSecoes[pilhaSecoes.length - 1].nivel >= nivel) {
                pilhaSecoes.pop();
            }

            if (pilhaSecoes.length === 0) {
                secoes.push(secao);
            } else {
                pilhaSecoes[pilhaSecoes.length - 1].subsecoes.push(secao);
            }

            pilhaSecoes.push(secao);
            secaoAtual = secao;
            continue;
        }

        // Detectar checkboxes
        const checkboxMatch = linha.match(/^-?\s*\[\s*\]\s*\*?\*?(.+?):?\*?\*?\s*(.*)$/);
        if (checkboxMatch && secaoAtual) {
            const textoCheckbox = checkboxMatch[1].trim();
            const descricao = checkboxMatch[2].trim();
            
            const checkbox: TemplateCheckbox = {
                secao: secaoAtual.titulo,
                texto: textoCheckbox + (descricao ? ": " + descricao : ""),
                obrigatorio: true,
                tierMinimo: "base",
                linha: numeroLinha,
            };

            secaoAtual.checkboxes.push(checkbox);
            checkboxes.push(checkbox);
            continue;
        }

        // Detectar campos obrigatórios (placeholders)
        const placeholderMatches = linha.matchAll(/\[([^\]]+)\]/g);
        for (const match of placeholderMatches) {
            const campo = match[1];
            if (!campo.includes("http") && !campo.includes("Data") && campo.length > 3) {
                if (!camposObrigatorios.includes(campo)) {
                    camposObrigatorios.push(campo);
                }
            }
        }

        // Adicionar conteúdo à seção atual
        if (secaoAtual) {
            secaoAtual.conteudo += linha + "\n";
        }
    }

    // Extrair metadata do conteúdo
    const metadata = extrairMetadata(conteudo, templatePath);

    return {
        secoes,
        checkboxes,
        camposObrigatorios,
        checklistQualidade,
        metadata,
        conteudoCompleto: conteudo,
    };
}

/**
 * Limpa título de seção removendo marcadores e formatação
 */
function limparTitulo(titulo: string): string {
    return titulo
        .replace(/^\d+\.\s*/, "")
        .replace(/\*\*/g, "")
        .replace(/\[.*?\]/g, "")
        .trim();
}

/**
 * Extrai metadata do template
 */
function extrairMetadata(conteudo: string, templatePath: string): TemplateMetadata {
    const linhas = conteudo.split("\n");
    
    let fase = "";
    let skill = "";
    let versao = "";
    let autor = "";

    // Extrair do path
    const pathParts = templatePath.split(/[/\\]/);
    const skillIndex = pathParts.findIndex(p => p === "skills");
    if (skillIndex >= 0 && skillIndex + 1 < pathParts.length) {
        skill = pathParts[skillIndex + 1];
    }

    // Extrair do conteúdo
    for (const linha of linhas.slice(0, 20)) {
        if (linha.match(/\*\*versão:\*\*/i)) {
            const match = linha.match(/\*\*versão:\*\*\s*(.+)/i);
            if (match) versao = match[1].trim();
        }
        if (linha.match(/\*\*autor:\*\*/i)) {
            const match = linha.match(/\*\*autor:\*\*\s*(.+)/i);
            if (match) autor = match[1].trim();
        }
    }

    // Inferir fase do primeiro header
    if (linhas.length > 0) {
        const primeiroHeader = linhas.find(l => l.match(/^#\s+/));
        if (primeiroHeader) {
            fase = primeiroHeader.replace(/^#\s+/, "").trim();
        }
    }

    return { fase, skill, versao, autor };
}

/**
 * Conta checkboxes por tier
 */
export function contarCheckboxesPorTier(estrutura: TemplateStructure, tier: TierGate): number {
    const tierOrder: Record<TierGate, number> = { essencial: 0, base: 1, avancado: 2 };
    const tierAtual = tierOrder[tier];

    return estrutura.checkboxes.filter(cb => {
        const tierMinimo = tierOrder[cb.tierMinimo];
        return tierAtual >= tierMinimo;
    }).length;
}

/**
 * Obtém seções obrigatórias por tier
 */
export function getSecoesObrigatoriasPorTier(
    estrutura: TemplateStructure,
    tier: TierGate
): TemplateSection[] {
    const tierOrder: Record<TierGate, number> = { essencial: 0, base: 1, avancado: 2 };
    const tierAtual = tierOrder[tier];

    const secoesObrigatorias: TemplateSection[] = [];

    function processarSecao(secao: TemplateSection) {
        const tierMinimo = tierOrder[secao.tierMinimo];
        if (secao.obrigatorio && tierAtual >= tierMinimo) {
            secoesObrigatorias.push(secao);
        }
        secao.subsecoes.forEach(processarSecao);
    }

    estrutura.secoes.forEach(processarSecao);
    return secoesObrigatorias;
}

/**
 * Gera regex para encontrar seção no entregável
 */
export function gerarRegexSecao(secao: TemplateSection): RegExp {
    const tituloLimpo = secao.titulo
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "\\s+");
    
    return new RegExp(`^#{1,${secao.nivel + 1}}\\s+.*?${tituloLimpo}`, "im");
}

/**
 * Extrai estatísticas do template
 */
export function getEstatisticasTemplate(estrutura: TemplateStructure): {
    totalSecoes: number;
    totalCheckboxes: number;
    totalCamposObrigatorios: number;
    totalChecklistQualidade: number;
    profundidadeMaxima: number;
} {
    let profundidadeMaxima = 0;

    function calcularProfundidade(secoes: TemplateSection[], nivel: number = 1) {
        for (const secao of secoes) {
            profundidadeMaxima = Math.max(profundidadeMaxima, nivel);
            if (secao.subsecoes.length > 0) {
                calcularProfundidade(secao.subsecoes, nivel + 1);
            }
        }
    }

    calcularProfundidade(estrutura.secoes);

    return {
        totalSecoes: contarSecoes(estrutura.secoes),
        totalCheckboxes: estrutura.checkboxes.length,
        totalCamposObrigatorios: estrutura.camposObrigatorios.length,
        totalChecklistQualidade: estrutura.checklistQualidade.length,
        profundidadeMaxima,
    };
}

function contarSecoes(secoes: TemplateSection[]): number {
    let total = secoes.length;
    for (const secao of secoes) {
        total += contarSecoes(secao.subsecoes);
    }
    return total;
}
