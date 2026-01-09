/**
 * Estrutura obrigatória de entregáveis por fase
 * Define seções que devem existir e tamanhos mínimos
 */

export interface SecaoObrigatoria {
    header: string;           // Regex para header (ex: "^##?\\s*Problema")
    descricao: string;        // Descrição para feedback
    tamanho_minimo?: number;  // Caracteres mínimos após header
}

export interface EstruturaFase {
    fase: number;
    nome: string;
    secoes: SecaoObrigatoria[];
    tamanho_minimo_total: number;  // Total do documento
    peso_estrutura: number;        // Peso no score (0-1)
}

/**
 * Estruturas obrigatórias por fase
 */
export const ESTRUTURAS_FASES: EstruturaFase[] = [
    {
        fase: 1,
        nome: "PRD",
        tamanho_minimo_total: 500,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(problema|problem)", descricao: "Seção de Problema" },
            { header: "^#{1,2}\\s*(usuário|usuario|user|persona)", descricao: "Seção de Usuários/Personas" },
            { header: "^#{1,2}\\s*(funcionalidade|feature|mvp|escopo)", descricao: "Seção de Funcionalidades/MVP" },
            { header: "^#{1,2}\\s*(métrica|metrica|sucesso|kpi)", descricao: "Seção de Métricas de Sucesso", tamanho_minimo: 50 },
        ],
    },
    {
        fase: 2,
        nome: "Requisitos",
        tamanho_minimo_total: 400,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(requisito|requirement|rf\\d|funcional)", descricao: "Requisitos Funcionais" },
            { header: "^#{1,2}\\s*(não.?funcional|nfr|rnf|performance|segurança)", descricao: "Requisitos Não-Funcionais" },
        ],
    },
    {
        fase: 3,
        nome: "UX/Design",
        tamanho_minimo_total: 300,
        peso_estrutura: 0.2,
        secoes: [
            { header: "^#{1,2}\\s*(jornada|journey|fluxo|flow)", descricao: "Jornadas/Fluxos" },
            { header: "^#{1,2}\\s*(wireframe|protótipo|prototipo|tela|screen)", descricao: "Wireframes/Protótipos" },
        ],
    },
    {
        fase: 4,
        nome: "Domínio",
        tamanho_minimo_total: 300,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(entidade|entity|modelo|model)", descricao: "Entidades" },
            { header: "^#{1,2}\\s*(relacionamento|relação|relation)", descricao: "Relacionamentos" },
        ],
    },
    {
        fase: 5,
        nome: "Banco de Dados",
        tamanho_minimo_total: 300,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(tabela|table|schema|modelo)", descricao: "Schema/Tabelas" },
        ],
    },
    {
        fase: 6,
        nome: "Arquitetura",
        tamanho_minimo_total: 400,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(c4|diagrama|arquitetura|architecture)", descricao: "Diagrama C4/Arquitetura" },
            { header: "^#{1,2}\\s*(stack|tecnologia|technology)", descricao: "Stack Tecnológica" },
            { header: "^#{1,2}\\s*(adr|decisão|decision)", descricao: "ADRs/Decisões" },
        ],
    },
    {
        fase: 7,
        nome: "Segurança",
        tamanho_minimo_total: 300,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(owasp|vulnerabilidade|security)", descricao: "OWASP/Vulnerabilidades" },
            { header: "^#{1,2}\\s*(autenticação|authentication|auth)", descricao: "Autenticação" },
        ],
    },
    {
        fase: 8,
        nome: "Testes",
        tamanho_minimo_total: 250,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(estratégia|strategy|plano)", descricao: "Estratégia de Testes" },
            { header: "^#{1,2}\\s*(caso|case|cenário|scenario)", descricao: "Casos de Teste" },
        ],
    },
    {
        fase: 9,
        nome: "Backlog",
        tamanho_minimo_total: 400,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(épico|epic)", descricao: "Épicos" },
            { header: "^#{1,2}\\s*(história|story|us\\d)", descricao: "Histórias de Usuário" },
        ],
    },
    {
        fase: 10,
        nome: "Contratos API",
        tamanho_minimo_total: 300,
        peso_estrutura: 0.3,
        secoes: [
            { header: "^#{1,2}\\s*(endpoint|api|openapi|swagger)", descricao: "Endpoints/OpenAPI" },
        ],
    },
    {
        fase: 11,
        nome: "Implementação",
        tamanho_minimo_total: 200,
        peso_estrutura: 0.2,
        secoes: [
            { header: "^#{1,2}\\s*(código|code|implement)", descricao: "Código Implementado" },
        ],
    },
];

/**
 * Get estrutura for a specific phase
 */
export function getEstruturaFase(fase: number): EstruturaFase | undefined {
    return ESTRUTURAS_FASES.find(e => e.fase === fase);
}

/**
 * Validate estrutura of an entregavel
 */
export function validarEstrutura(fase: number, entregavel: string): {
    valido: boolean;
    score: number;
    secoes_encontradas: string[];
    secoes_faltando: string[];
    tamanho_ok: boolean;
    feedback: string[];
} {
    const estrutura = getEstruturaFase(fase);

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

    // Check each section
    for (const secao of estrutura.secoes) {
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

    // Check total size
    const tamanho_ok = entregavel.length >= estrutura.tamanho_minimo_total;
    if (!tamanho_ok) {
        feedback.push(`⚠️ Documento muito curto: ${entregavel.length}/${estrutura.tamanho_minimo_total} caracteres`);
    }

    // Calculate score
    const secaoScore = estrutura.secoes.length > 0
        ? (secoes_encontradas.length / estrutura.secoes.length) * 100
        : 100;
    const tamanhoScore = tamanho_ok ? 100 : (entregavel.length / estrutura.tamanho_minimo_total) * 100;

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
