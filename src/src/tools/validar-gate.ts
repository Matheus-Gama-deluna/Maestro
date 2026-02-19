import type { ToolResult, EstadoProjeto, TierGate } from "../types/index.js";
import type { NextAction, FlowProgress } from "../types/response.js";
import { parsearEstado } from "../state/storage.js";
import { getFase } from "../flows/types.js";
import { IntelligentGateEngine, type IntelligentGateResult } from "../gates/intelligent-gate-engine.js";
import { validarGate as validarGateLegacy, formatarResultadoGate } from "../gates/validator.js";
import { normalizeProjectPath, resolveProjectPath, getServerContentRoot } from "../utils/files.js";
import { setCurrentDirectory } from "../state/context.js";
import { join } from "path";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { getSkillResourcePath, detectIDE } from "../utils/ide-paths.js";
import { readFile } from "fs/promises";
import { getSpecialistPersona } from "../services/specialist.service.js";

/**
 * v6.3: Sistema de gates unificado usando IntelligentGateEngine
 * Substitui os 3 sistemas paralelos anteriores:
 *   - gates/validator.ts (GATE_CHECKLISTS legado)
 *   - core/validation/layers/DeliverableValidator.ts
 *   - gates/template-validator.ts
 */

interface ValidarGateArgs {
    fase?: number;
    entregavel?: string;
    estado_json: string;
    diretorio: string;
}

/** Mapeia tipo de artefato do estado para tipo de projeto do engine */
function mapProjectType(
    tipoArtefato?: string
): 'poc' | 'internal' | 'product' | 'critical' {
    switch (tipoArtefato) {
        case 'poc':      return 'poc';
        case 'product':  return 'product';
        case 'script':   return 'poc';
        case 'internal': return 'internal';
        default:         return 'internal';
    }
}

/** Mapeia tier do estado para tier do engine */
function mapTier(tier?: string): TierGate {
    if (tier === 'essencial' || tier === 'base' || tier === 'avancado') return tier;
    return 'base';
}

/** Ícone e label para cada nível de maturidade */
const MATURITY_LABELS: Record<number, { icon: string; label: string }> = {
    1: { icon: '🌱', label: 'Conceito Inicial' },
    2: { icon: '🔨', label: 'Estrutura Básica' },
    3: { icon: '✅', label: 'Padrão Profissional' },
    4: { icon: '⭐', label: 'Alta Qualidade' },
    5: { icon: '🏆', label: 'Exemplar' },
};

/** Formata resultado do IntelligentGateEngine em texto legível */
function formatIntelligentResult(
    result: IntelligentGateResult,
    faseNumero: number,
    faseNome: string,
    tier: string
): string {
    const maturity = MATURITY_LABELS[result.maturityLevel] ?? MATURITY_LABELS[1];
    const { summary, validationResult, adaptiveScore } = result;

    let text = `# Gate da Fase ${faseNumero}: ${faseNome}\n\n`;

    // Status principal
    text += `## ${summary.statusIcon} ${summary.title}\n\n`;
    text += `${summary.mainMessage}\n\n`;

    // Score e nível de maturidade
    text += `## 📊 Avaliação\n\n`;
    text += `| Dimensão | Score |\n|----------|-------|\n`;
    text += `| **Score Geral** | **${result.overallScore}/100** |\n`;
    text += `| Semântica | ${adaptiveScore.components.semantic}/100 |\n`;
    text += `| Completude | ${adaptiveScore.components.completeness}/100 |\n`;
    text += `| Qualidade | ${adaptiveScore.components.quality}/100 |\n`;
    text += `| Estrutura | ${adaptiveScore.components.structure}/100 |\n\n`;

    text += `**Nível de Maturidade:** ${maturity.icon} Nível ${result.maturityLevel} — ${maturity.label}\n`;
    text += `**Tier de Validação:** ${tier}\n`;
    text += `**Confiança:** ${Math.round(result.confidenceLevel * 100)}%\n\n`;

    // Pontos fortes
    if (summary.keyStrengths.length > 0) {
        text += `## 💪 Pontos Fortes\n\n`;
        summary.keyStrengths.forEach(s => { text += `- ${s}\n`; });
        text += '\n';
    }

    // Bloqueadores críticos
    if (validationResult.blockers.length > 0) {
        text += `## 🔴 Bloqueadores Críticos\n\n`;
        validationResult.blockers.forEach(b => {
            text += `**${b.message}**\n`;
            text += `> Como corrigir: ${b.howToFix}\n\n`;
        });
    }

    // Ações prioritárias
    if (summary.priorityActions.length > 0) {
        text += `## ⚡ Ações Prioritárias\n\n`;
        summary.priorityActions.forEach((a, i) => { text += `${i + 1}. ${a}\n`; });
        text += '\n';
    }

    // Recomendações inteligentes
    const criticalRecs = validationResult.recommendations.filter(r => r.type === 'critical');
    const improvRecs = validationResult.recommendations.filter(r => r.type === 'improvement').slice(0, 3);

    if (criticalRecs.length > 0) {
        text += `## 🔧 Melhorias Necessárias\n\n`;
        criticalRecs.forEach(r => {
            text += `**[${r.impact.toUpperCase()}] ${r.title}**`;
            if (r.estimatedTimeMinutes) text += ` _(~${r.estimatedTimeMinutes}min)_`;
            text += `\n${r.description}\n`;
            if (r.examples && r.examples.length > 0) {
                text += `> Exemplo: ${r.examples[0]}\n`;
            }
            text += '\n';
        });
    }

    if (improvRecs.length > 0) {
        text += `## 💡 Sugestões de Melhoria\n\n`;
        improvRecs.forEach(r => {
            text += `- **${r.title}** _(esforço: ${r.effort})_: ${r.description}\n`;
        });
        text += '\n';
    }

    // Próximos passos
    if (summary.nextSteps.length > 0) {
        text += `## 🗺️ Próximos Passos\n\n`;
        summary.nextSteps.forEach((s, i) => { text += `${i + 1}. ${s}\n`; });
        text += '\n';
    }

    // Decisão final
    if (result.canAdvance) {
        text += `---\n✅ **Você pode avançar!** Use \`proximo(entregavel: "...", estado_json: "...", diretorio: "...")\` para ir para a próxima fase.`;
    } else {
        text += `---\n⚠️ **Complete os itens pendentes** ou use \`proximo(entregavel: "...", estado_json: "...", confirmar_usuario: true)\` para forçar avanço.`;
    }

    return text;
}

/** Fallback para sistema legado quando engine falha */
function formatLegacyResult(
    resultado: ReturnType<typeof validarGateLegacy>,
    faseNumero: number,
    faseNome: string
): string {
    const resultadoFormatado = formatarResultadoGate(resultado);
    let text = `# Gate da Fase ${faseNumero}: ${faseNome}\n\n`;
    text += `## ⚠️ Validação Legada (Engine indisponível)\n\n`;
    text += resultadoFormatado + '\n\n';
    text += resultado.valido
        ? `✅ **Você pode avançar!** Use \`proximo(entregavel: "...", estado_json: "...", diretorio: "...")\` para ir para a próxima fase.`
        : `⚠️ **Complete os itens pendentes** ou use \`proximo(entregavel: "...", estado_json: "...", confirmar_usuario: true)\` para forçar avanço.`;
    return text;
}

/**
 * Tool: validar_gate
 * v6.3: Usa IntelligentGateEngine como sistema principal (com fallback legado automático)
 */
export async function validarGate(args: ValidarGateArgs): Promise<ToolResult> {
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📋 Validar Gate (Modo Stateless)\n\nPara validar um gate, a IA deve:\n1. Ler o arquivo \`.maestro/estado.json\` do projeto\n2. Passar o conteúdo como parâmetro\n\n**Uso:**\n\`\`\`\nvalidar_gate(\n    entregavel: "[conteúdo]",\n    estado_json: "...",\n    diretorio: "C:/projetos/meu-projeto"\n)\n\`\`\`\n`,
            }],
        };
    }

    if (!args.diretorio) {
        return {
            content: [{ type: "text", text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório." }],
            isError: true,
        };
    }

    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{ type: "text", text: "❌ **Erro**: Não foi possível parsear o estado JSON." }],
            isError: true,
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    const numeroFase = args.fase || estado.fase_atual;
    const fase = getFase(estado.nivel, numeroFase);

    if (!fase) {
        return {
            content: [{ type: "text", text: `❌ **Erro**: Fase ${numeroFase} não encontrada.` }],
            isError: true,
        };
    }

    // Buscar entregável automaticamente se não foi passado
    let entregavel = args.entregavel;

    if (!entregavel) {
        const chaveNova = `fase_${numeroFase}`;
        const chaveLegacy = numeroFase.toString();
        const caminhoOuNome = estado.entregaveis[chaveNova] || estado.entregaveis[chaveLegacy];

        if (caminhoOuNome) {
            try {
                let caminhoEntregavel: string;
                if (caminhoOuNome.includes('/') || caminhoOuNome.includes('\\')) {
                    caminhoEntregavel = caminhoOuNome.startsWith(diretorio)
                        ? caminhoOuNome
                        : join(diretorio, caminhoOuNome);
                } else {
                    caminhoEntregavel = join(diretorio, ".maestro", "entregaveis", caminhoOuNome);
                }
                entregavel = await readFile(caminhoEntregavel, "utf-8");
            } catch {
                // Continua sem entregável
            }
        }

        if (!entregavel) {
            const resposta = `# 📋 Gate da Fase ${numeroFase}: ${fase.nome}\n\n## ⚠️ Nenhum Entregável Encontrado\n\nNenhum entregável encontrado para esta fase.\n\n## Checklist de Saída\n\n${fase.gate_checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\n## 💡 Como Proceder\n\n1. Gere o entregável da fase usando os especialistas\n2. Salve com \`proximo()\` para validação automática\n3. Ou passe manualmente: \`validar_gate(entregavel: "...", estado_json: "...", diretorio: "...")\`\n`;
            return { content: [{ type: "text", text: resposta }] };
        }
    }

    const tier = mapTier(estado.tier_gate);
    const projectType = mapProjectType(estado.tipo_artefato);

    // === SISTEMA PRINCIPAL: IntelligentGateEngine (v6.3) ===
    let resposta: string;
    let canAdvance: boolean;

    try {
        const engine = new IntelligentGateEngine();
        const result = await engine.validateDeliverable(
            entregavel,
            fase,
            tier,
            projectType,
            { fallbackToLegacy: false, maxRecommendations: 6 }
        );

        resposta = formatIntelligentResult(result, numeroFase, fase.nome, tier);
        canAdvance = result.canAdvance;

        // Link para template da skill (mantido do sistema anterior)
        const skillAtual = getSkillParaFase(fase.nome);
        if (skillAtual) {
            const ide = estado.ide || detectIDE(args.diretorio) || 'windsurf';
            const templatesPath = getSkillResourcePath(skillAtual, 'templates', ide);
            resposta += `\n\n## 📄 Template de Referência\n\n**Localização:** \`${templatesPath}\`\n\n> 💡 Consulte o template para ver a estrutura completa esperada.\n`;
        }
    } catch (engineError) {
        // === FALLBACK: Sistema legado ===
        console.warn(`[validar_gate] IntelligentGateEngine falhou, usando fallback legado:`, engineError);
        const resultado = validarGateLegacy(fase, entregavel);
        resposta = formatLegacyResult(resultado, numeroFase, fase.nome);
        canAdvance = resultado.valido;

        const skillAtual = getSkillParaFase(fase.nome);
        if (skillAtual) {
            const ide = estado.ide || detectIDE(args.diretorio) || 'windsurf';
            const checklistPath = getSkillResourcePath(skillAtual, 'checklists', ide);
            resposta += `\n\n## 📋 Checklist da Skill\n\n**Localização:** \`${checklistPath}\`\n`;
        }
    }

    const specialist = fase ? getSpecialistPersona(fase.nome) : null;

    const next_action: NextAction = canAdvance ? {
        tool: "proximo",
        description: `Gate validado. Avançar com o entregável da fase ${numeroFase} (${fase.nome})`,
        args_template: { entregavel: "{{conteudo_do_entregavel}}", estado_json: "{{estado_json}}", diretorio },
        requires_user_input: false,
        auto_execute: false,
    } : {
        tool: "proximo",
        description: "Complete os itens pendentes e tente avançar novamente",
        args_template: { entregavel: "{{entregavel_corrigido}}", estado_json: "{{estado_json}}", diretorio },
        requires_user_input: true,
        user_prompt: "Corrija os itens pendentes no entregável e tente novamente.",
    };

    const progress: FlowProgress = {
        current_phase: fase?.nome || `Fase ${numeroFase}`,
        total_phases: estado.total_fases,
        completed_phases: estado.gates_validados.length,
        percentage: Math.round((estado.gates_validados.length / estado.total_fases) * 100),
    };

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json,
        next_action,
        specialist_persona: specialist || undefined,
        progress,
    };
}

/**
 * Input schema para validar_gate
 */
export const validarGateSchema = {
    type: "object",
    properties: {
        fase: {
            type: "number",
            description: "Número da fase a validar (default: fase atual)",
        },
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável para validação",
        },
        estado_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/estado.json",
        },
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
    },
    required: ["estado_json", "diretorio"],
};
