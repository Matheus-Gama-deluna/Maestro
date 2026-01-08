import type { GateResultado, Fase } from "../types/index.js";

/**
 * Checklists de validação por fase
 */
export const GATE_CHECKLISTS: Record<number, string[]> = {
    1: [
        "Problema claramente definido",
        "Personas ou usuários identificados",
        "Funcionalidades MVP listadas",
        "Métricas de sucesso definidas",
    ],
    2: [
        "Requisitos funcionais com IDs únicos",
        "Requisitos não-funcionais especificados",
        "Critérios de aceite definidos",
    ],
    3: [
        "Jornadas do usuário mapeadas",
        "Wireframes ou protótipos criados",
        "Acessibilidade considerada",
    ],
    4: [
        "Entidades do domínio identificadas",
        "Relacionamentos entre entidades definidos",
        "Regras de negócio documentadas",
    ],
    5: [
        "Modelo de dados definido",
        "Índices planejados",
        "Migrations ou scripts criados",
    ],
    6: [
        "Diagrama C4 criado",
        "Stack tecnológica justificada",
        "ADRs documentados",
    ],
    7: [
        "OWASP Top 10 avaliado",
        "Autenticação definida",
        "Dados sensíveis mapeados",
    ],
    8: [
        "Estratégia de testes definida",
        "Casos de teste mapeados",
        "Ferramentas selecionadas",
    ],
    9: [
        "Épicos definidos",
        "Histórias de usuário criadas",
        "Priorização realizada",
        "Definition of Done estabelecido",
    ],
    10: [
        "Esquema OpenAPI definido",
        "Tipos gerados",
        "Mocks disponíveis",
    ],
    11: [
        "Código implementado",
        "Testes passando",
        "Code review realizado",
    ],
};

/**
 * Valida gate de uma fase
 */
export function validarGate(fase: Fase, entregavel: string): GateResultado {
    const validados: string[] = [];
    const pendentes: string[] = [];
    const sugestoes: string[] = [];

    for (const item of fase.gate_checklist) {
        if (verificarItem(item, entregavel)) {
            validados.push(item);
        } else {
            pendentes.push(item);
            sugestoes.push(gerarSugestao(item));
        }
    }

    return {
        valido: pendentes.length === 0,
        itens_validados: validados,
        itens_pendentes: pendentes,
        sugestoes,
    };
}

/**
 * Verifica se um item do checklist está presente no entregável
 */
function verificarItem(item: string, entregavel: string): boolean {
    // Extrai palavras-chave do item
    const keywords = item
        .toLowerCase()
        .replace(/[^a-záéíóúàãõç\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3);

    const conteudoLower = entregavel.toLowerCase();

    // Verifica se pelo menos 50% das keywords estão presentes
    const encontradas = keywords.filter((kw) => conteudoLower.includes(kw));
    return encontradas.length >= Math.ceil(keywords.length * 0.5);
}

/**
 * Gera sugestão para item pendente
 */
function gerarSugestao(item: string): string {
    const sugestoes: Record<string, string> = {
        problema: "Descreva claramente qual problema está sendo resolvido",
        personas: "Identifique quem são os usuários do sistema",
        funcionalidades: "Liste as funcionalidades principais do MVP",
        requisitos: "Adicione requisitos funcionais com IDs (RF001, RF002...)",
        "não-funcionais": "Especifique requisitos de performance, segurança, etc.",
        critérios: "Defina critérios de aceite claros e testáveis",
        jornadas: "Mapeie as jornadas completas dos usuários",
        wireframes: "Crie wireframes ou protótipos das telas",
        entidades: "Identifique as entidades principais do domínio",
        relacionamentos: "Defina como as entidades se relacionam",
        diagrama: "Crie diagrama C4 (Context, Container, Component)",
        stack: "Justifique a escolha da stack tecnológica",
        owasp: "Avalie os riscos do OWASP Top 10",
        autenticação: "Defina estratégia de autenticação",
        épicos: "Organize funcionalidades em épicos",
        histórias: "Crie histórias de usuário detalhadas",
        openapi: "Defina schema OpenAPI para os endpoints",
        testes: "Garanta que os testes estejam passando",
    };

    // Busca sugestão correspondente
    for (const [keyword, sugestao] of Object.entries(sugestoes)) {
        if (item.toLowerCase().includes(keyword)) {
            return sugestao;
        }
    }

    return `Adicione: ${item}`;
}

/**
 * Formata resultado do gate para exibição
 */
export function formatarResultadoGate(resultado: GateResultado): string {
    const lines: string[] = [];

    lines.push("## 📋 Validação de Gate\n");

    if (resultado.valido) {
        lines.push("✅ **Gate aprovado!** Todos os itens validados.\n");
    } else {
        lines.push("⚠️ **Gate pendente** - Itens faltando:\n");
    }

    if (resultado.itens_validados.length > 0) {
        lines.push("### ✅ Validados:");
        resultado.itens_validados.forEach((item) => {
            lines.push(`- ${item}`);
        });
        lines.push("");
    }

    if (resultado.itens_pendentes.length > 0) {
        lines.push("### ❌ Pendentes:");
        resultado.itens_pendentes.forEach((item, i) => {
            lines.push(`- ${item}`);
            lines.push(`  💡 ${resultado.sugestoes[i]}`);
        });
        lines.push("");
    }

    return lines.join("\n");
}
