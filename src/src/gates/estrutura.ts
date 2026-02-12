/**
 * Estrutura obrigatória de entregáveis por fase
 * Define seções que devem existir e tamanhos mínimos adaptativos por tier
 */

import type { TierGate } from "../types/index.js";

export interface SecaoObrigatoria {
    header: string;           // Regex para header (ex: "^##?\\s*Problema")
    descricao: string;        // Descrição para feedback
    tamanho_minimo?: number;  // Caracteres mínimos após header (opcional, só para tier avançado)
    obrigatorio_tier?: TierGate; // Tier mínimo onde esta seção é obrigatória (default: essencial)
}

export interface TamanhosPorTier {
    essencial: number;
    base: number;
    avancado: number;
}

export interface EstruturaFase {
    fase: number;
    nome: string;
    secoes: SecaoObrigatoria[];
    tamanho_minimo_por_tier: TamanhosPorTier;  // Tamanhos adaptativos por tier
    peso_estrutura: number;        // Peso no score (0-1)
}

/**
 * Estruturas obrigatórias por fase
 */
export const ESTRUTURAS_FASES: EstruturaFase[] = [
    {
        fase: 1,
        nome: "PRD",
        tamanho_minimo_por_tier: { essencial: 100, base: 300, avancado: 500 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(problema|problem|oportunidade|dor|pain)", descricao: "Seção de Problema" },
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(usu[áa]rios?|usuario|user|persona|p[uú]blico)", descricao: "Seção de Usuários/Personas", obrigatorio_tier: "base" },
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(funcionalidade|feature|mvp|escopo|solu[cç][aã]o)", descricao: "Seção de Funcionalidades/MVP" },
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(m[eé]trica|sucesso|kpi|north.?star|indicador)", descricao: "Seção de Métricas de Sucesso", obrigatorio_tier: "base" },
        ],
    },
    {
        fase: 2,
        nome: "Requisitos",
        tamanho_minimo_por_tier: { essencial: 100, base: 300, avancado: 400 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(requisito|requirement|rf\\d|funcional)", descricao: "Requisitos Funcionais" },
            { header: "^#{1,2}\\s*(não.?funcional|nfr|rnf|performance|segurança)", descricao: "Requisitos Não-Funcionais", obrigatorio_tier: "base" },
        ],
    },
    {
        fase: 3,
        nome: "UX/Design",
        tamanho_minimo_por_tier: { essencial: 50, base: 200, avancado: 300 },
        peso_estrutura: 0.2,
        secoes: [
            { header: "^#{1,2}\\s*(jornada|journey|fluxo|flow)", descricao: "Jornadas/Fluxos" },
            { header: "^#{1,2}\\s*(wireframe|protótipo|prototipo|tela|screen)", descricao: "Wireframes/Protótipos", obrigatorio_tier: "base" },
        ],
    },
    {
        fase: 4,
        nome: "Prototipagem",
        tamanho_minimo_por_tier: { essencial: 50, base: 100, avancado: 200 },
        peso_estrutura: 0.2,
        secoes: [
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(prot[oó]tipo|prototype|componente|component|tela|screen)", descricao: "Componentes/Telas Prototipadas" },
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(fluxo|flow|navega[cç][aã]o|jornada)", descricao: "Fluxos de Navegação", obrigatorio_tier: "base" },
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(design|estilo|cor|tipografia|visual)", descricao: "Design System/Estilo Visual", obrigatorio_tier: "base" },
            { header: "^#{1,3}\\s*\\d*\\.?\\s*(html|export|c[oó]digo|stitch|arquivo)", descricao: "Código HTML Exportado" },
        ],
    },
    {
        fase: 4,
        nome: "Domínio",
        tamanho_minimo_por_tier: { essencial: 50, base: 200, avancado: 300 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(entidade|entity|modelo|model)", descricao: "Entidades" },
            { header: "^#{1,2}\\s*(relacionamento|relação|relation)", descricao: "Relacionamentos", obrigatorio_tier: "base" },
        ],
    },
    {
        fase: 5,
        nome: "Banco de Dados",
        tamanho_minimo_por_tier: { essencial: 50, base: 200, avancado: 300 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(tabela|table|schema|modelo)", descricao: "Schema/Tabelas" },
        ],
    },
    {
        fase: 6,
        nome: "Arquitetura",
        tamanho_minimo_por_tier: { essencial: 100, base: 300, avancado: 400 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(c4|diagrama|arquitetura|architecture)", descricao: "Diagrama C4/Arquitetura", obrigatorio_tier: "base" },
            { header: "^#{1,2}\\s*(stack|tecnologia|technology)", descricao: "Stack Tecnológica" },
            { header: "^#{1,2}\\s*(adr|decisão|decision)", descricao: "ADRs/Decisões", obrigatorio_tier: "base" },
        ],
    },
    {
        fase: 7,
        nome: "Segurança",
        tamanho_minimo_por_tier: { essencial: 50, base: 200, avancado: 300 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(owasp|vulnerabilidade|security)", descricao: "OWASP/Vulnerabilidades", obrigatorio_tier: "avancado" },
            { header: "^#{1,2}\\s*(autenticação|authentication|auth)", descricao: "Autenticação" },
        ],
    },
    {
        fase: 8,
        nome: "Testes",
        tamanho_minimo_por_tier: { essencial: 50, base: 150, avancado: 250 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(estratégia|strategy|plano)", descricao: "Estratégia de Testes" },
            { header: "^#{1,2}\\s*(caso|case|cenário|scenario)", descricao: "Casos de Teste", obrigatorio_tier: "base" },
        ],
    },
    {
        fase: 9,
        nome: "Backlog",
        tamanho_minimo_por_tier: { essencial: 100, base: 300, avancado: 400 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(épico|epic)", descricao: "Épicos" },
            { header: "^#{1,2}\\s*(história|story|us\\d)", descricao: "Histórias de Usuário" },
        ],
    },
    {
        fase: 10,
        nome: "Contratos API",
        tamanho_minimo_por_tier: { essencial: 50, base: 200, avancado: 300 },
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(endpoint|api|openapi|swagger)", descricao: "Endpoints/OpenAPI" },
        ],
    },
    {
        fase: 11,
        nome: "Implementação",
        tamanho_minimo_por_tier: { essencial: 50, base: 150, avancado: 200 },
        peso_estrutura: 0.2,
        secoes: [
            { header: "^#{1,2}\\s*(código|code|implement)", descricao: "Código Implementado" },
        ],
    },
];

/**
 * Get estrutura for a specific phase by number
 */
export function getEstruturaFase(fase: number): EstruturaFase | undefined {
    return ESTRUTURAS_FASES.find(e => e.fase === fase);
}

/**
 * Get estrutura for a specific phase by name (necessário para fases dinâmicas como Prototipagem)
 */
export function getEstruturaFaseByName(nome: string): EstruturaFase | undefined {
    const nomeLower = nome.toLowerCase();
    return ESTRUTURAS_FASES.find(e => e.nome.toLowerCase() === nomeLower);
}

/**
 * Verifica se uma seção é obrigatória para o tier atual
 */
function isSecaoObrigatoria(secao: SecaoObrigatoria, tier: TierGate): boolean {
    const tierMinimo = secao.obrigatorio_tier || "essencial";
    const tierOrder: Record<TierGate, number> = { essencial: 0, base: 1, avancado: 2 };
    return tierOrder[tier] >= tierOrder[tierMinimo];
}

/**
 * Validate estrutura of an entregavel com suporte a tier
 * @param fase - Número da fase
 * @param entregavel - Conteúdo do entregável
 * @param tier - Tier de validação
 * @param faseNome - Nome da fase (opcional, para fases dinâmicas como Prototipagem)
 */
export function validarEstrutura(
    fase: number,
    entregavel: string,
    tier: TierGate = "base",
    faseNome?: string
): {
    valido: boolean;
    score: number;
    secoes_encontradas: string[];
    secoes_faltando: string[];
    tamanho_ok: boolean;
    feedback: string[];
} {
    // Priorizar busca por nome (para fases dinâmicas como Prototipagem)
    const estrutura = faseNome ? (getEstruturaFaseByName(faseNome) || getEstruturaFase(fase)) : getEstruturaFase(fase);

    if (!estrutura) {
        // Fase sem estrutura definida - aceita qualquer coisa
        return {
            valido: true,
            score: 100,
            secoes_encontradas: [],
            secoes_faltando: [],
            tamanho_ok: true,
            feedback: [],
        };
    }

    const secoes_encontradas: string[] = [];
    const secoes_faltando: string[] = [];
    const feedback: string[] = [];
    const conteudoLower = entregavel.toLowerCase();

    // Filtra seções obrigatórias para o tier atual
    const secoesObrigatorias = estrutura.secoes.filter(s => isSecaoObrigatoria(s, tier));

    // Check each section
    for (const secao of secoesObrigatorias) {
        const regex = new RegExp(secao.header, "im");
        const match = conteudoLower.match(regex);

        if (match) {
            secoes_encontradas.push(secao.descricao);

            // Check minimum size if specified
            if (secao.tamanho_minimo) {
                const startIndex = match.index! + match[0].length;
                const restContent = entregavel.slice(startIndex, startIndex + secao.tamanho_minimo + 100);
                if (restContent.length < secao.tamanho_minimo) {
                    feedback.push(`⚠️ ${secao.descricao}: conteúdo muito curto (mín: ${secao.tamanho_minimo} chars)`);
                }
            }
        } else {
            secoes_faltando.push(secao.descricao);
            feedback.push(`❌ Seção obrigatória faltando: ${secao.descricao}`);
        }
    }

    // Check total size based on tier
    const tamanhoMinimo = estrutura.tamanho_minimo_por_tier[tier];
    const tamanho_ok = entregavel.length >= tamanhoMinimo;
    if (!tamanho_ok) {
        feedback.push(`⚠️ Documento muito curto: ${entregavel.length}/${tamanhoMinimo} caracteres`);
    }

    // Calculate score
    const secaoScore = secoesObrigatorias.length > 0
        ? (secoes_encontradas.length / secoesObrigatorias.length) * 100
        : 100;
    const tamanhoScore = tamanho_ok ? 100 : (entregavel.length / tamanhoMinimo) * 100;

    const score = Math.round((secaoScore * estrutura.peso_estrutura) + (tamanhoScore * (1 - estrutura.peso_estrutura)));
    const valido = secoes_faltando.length === 0 && tamanho_ok;

    return {
        valido,
        score,
        secoes_encontradas,
        secoes_faltando,
        tamanho_ok,
        feedback,
    };
}
