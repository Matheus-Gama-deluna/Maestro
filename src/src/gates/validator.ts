import type { GateResultado, Fase, TierGate } from "../types/index.js";
import { getChecklistPorTier } from "./tiers.js";
import { parseTemplate } from "./template-parser.js";
import { validarContraTemplate, formatarResultadoValidacao } from "./template-validator.js";
import { calcularQualidade, gerarRelatorioQualidade, compararComTier } from "./quality-scorer.js";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { existsSync } from "fs";
import { join } from "path";

/**
 * Checklists de validação por fase (legado - mantido para compatibilidade)
 * @deprecated Use getChecklistPorTier() para validação adaptativa
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
 * Valida gate usando template da skill (novo sistema)
 * @param fase - Fase a validar
 * @param entregavel - Conteúdo do entregável
 * @param tier - Tier de validação
 * @param diretorioContent - Diretório base do content (ex: d:/Sistemas/Maestro/content)
 * @param checklistItems - Checklist opcional da skill para validação adicional
 */
export function validarGateComTemplate(
    fase: Fase,
    entregavel: string,
    tier: TierGate = "base",
    diretorioContent?: string,
    checklistItems?: string[]
): { sucesso: boolean; resultado?: any; resultadoLegacy?: GateResultado; erro?: string } {
    const skillNome = getSkillParaFase(fase.nome);
    
    if (!skillNome || !diretorioContent) {
        return { sucesso: false, erro: "Skill não encontrada ou diretório não especificado" };
    }

    // Tentar encontrar template principal da fase
    const templatePath = resolverTemplatePath(skillNome, fase.nome, diretorioContent);
    
    if (!templatePath || !existsSync(templatePath)) {
        return { sucesso: false, erro: "Template não encontrado" };
    }

    // Parsear template
    const templateStructure = parseTemplate(templatePath);
    
    if (!templateStructure) {
        return { sucesso: false, erro: "Erro ao parsear template" };
    }

    // Validar contra template
    const resultado = validarContraTemplate(entregavel, templateStructure, tier);
    
    // v5: Se tem checklistItems da skill, validar também contra eles
    let resultadoChecklist: GateResultado | undefined;
    if (checklistItems && checklistItems.length > 0) {
        resultadoChecklist = validarGateComChecklist(entregavel, checklistItems);
        // Merge resultados: se template OU checklist está válido, considera válido
        if (!resultado.valido && resultadoChecklist.valido) {
            resultado.valido = true;
        }
    }
    
    // Calcular qualidade
    const qualidade = calcularQualidade(entregavel, templateStructure, tier);
    
    return {
        sucesso: true,
        resultado: {
            ...resultado,
            qualidade,
            templateUsado: templatePath,
            skillNome,
            checklistValidado: resultadoChecklist,
        },
    };
}

/**
 * Resolve caminho do template baseado na skill e fase
 */
function resolverTemplatePath(skillNome: string, faseNome: string, diretorioContent: string): string | null {
    const basePath = join(diretorioContent, "skills", skillNome, "resources", "templates");
    
    // Mapeamento de fase para arquivo de template
    const templateMap: Record<string, string> = {
        "Produto": "PRD.md",
        "Requisitos": "requisitos.md",
        "UX Design": "design-doc.md",
        "Modelo de Domínio": "modelo-dominio.md",
        "Banco de Dados": "design-banco.md",
        "Arquitetura": "arquitetura.md",
        "Segurança": "checklist-seguranca.md",
        "Backlog": "backlog.md",
        "Contrato API": "contrato-api.md",
    };
    
    const templateFile = templateMap[faseNome];
    if (!templateFile) {
        return null;
    }
    
    return join(basePath, templateFile);
}

/**
 * Valida gate de uma fase com suporte a tier (legado)
 * @param fase - Fase a validar
 * @param entregavel - Conteúdo do entregável
 * @param tier - Tier de validação (default: usa checklist da fase, que é tier 'base')
 */
export function validarGate(
    fase: Fase,
    entregavel: string,
    tier?: TierGate
): GateResultado {
    const validados: string[] = [];
    const pendentes: string[] = [];
    const sugestoes: string[] = [];

    // Usa checklist do tier se especificado, senão usa o da fase (legado)
    const checklist = tier
        ? getChecklistPorTier(fase.numero, tier)
        : fase.gate_checklist;

    for (const item of checklist) {
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
 * Valida entregável contra checklist da skill
 */
function validarGateComChecklist(entregavel: string, checklist: string[]): GateResultado {
    const validados: string[] = [];
    const pendentes: string[] = [];
    const sugestoes: string[] = [];

    for (const item of checklist) {
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
function verificarItem(item: string, entregavel: string): boolean {
    const conteudoLower = entregavel.toLowerCase();

    // Sinônimos por item para matching mais robusto (fase 1 - PRD)
    const sinonimos: Record<string, string[][]> = {
        "problema claramente definido": [["problema", "problem", "dor", "oportunidade", "pain"]],
        "personas ou usuários identificados": [["persona", "usuário", "usuario", "usuarios", "usuários", "público", "publico", "user"]],
        "funcionalidades mvp listadas": [["funcionalidade", "funcionalidades", "feature", "mvp", "escopo", "solução", "soluçao"]],
        "métricas de sucesso definidas": [["métrica", "metrica", "métricas", "metricas", "kpi", "sucesso", "north star", "indicador"]],
    };

    // Tenta match por sinônimos primeiro
    const itemLower = item.toLowerCase();
    const gruposSinonimos = sinonimos[itemLower];
    if (gruposSinonimos) {
        return gruposSinonimos.every(grupo =>
            grupo.some(sin => conteudoLower.includes(sin))
        );
    }

    // Fallback: match por keywords (modo original melhorado)
    const keywords = item
        .toLowerCase()
        .replace(/[^a-záéíóúàãõç\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3);

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
