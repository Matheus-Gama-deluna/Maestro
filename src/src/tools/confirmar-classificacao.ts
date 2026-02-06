import type { ToolResult, NivelComplexidade, TipoArtefato } from "../types/index.js";
import type { NextAction, SpecialistPersona, FlowProgress } from "../types/response.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { determinarTierGate, descreverTier } from "../gates/tiers.js";
import { getFluxoComStitch, getFaseComStitch } from "../flows/types.js";
import { normalizeProjectPath, resolveProjectPath } from "../utils/files.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolve } from "path";
import { getSpecialistPersona } from "../services/specialist.service.js";

interface ConfirmarClassificacaoArgs {
    estado_json: string;
    diretorio: string;
    nivel?: NivelComplexidade;
    tipo_artefato?: TipoArtefato;
}

/**
 * Tool: confirmar_classificacao
 * Confirma a reclassificação do projeto após a fase de PRD.
 * Pode aceitar a sugestão da IA ou forçar novos valores.
 */
export async function confirmarClassificacao(args: ConfirmarClassificacaoArgs): Promise<ToolResult> {
    // Validar parâmetros obrigatórios
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Erro: Estado Obrigatório

O parâmetro \`estado_json\` é obrigatório.
`,
            }],
            isError: true,
        };
    }

    if (!args.diretorio) {
        return {
            content: [{ type: "text", text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório." }],
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{ type: "text", text: "❌ **Erro**: Não foi possível parsear o estado JSON." }],
            isError: true,
        };
    }

    if (!estado.aguardando_classificacao && !estado.classificacao_sugerida) {
        return {
            content: [{
                type: "text",
                text: "⚠️ **Aviso**: O projeto não está aguardando confirmação de classificação. Use a tool `classificar` para reajustes manuais a qualquer momento.",
            }],
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    // Determinar valores finais (prioridade: argumento > sugestão > estado atual)
    const novoNivel = args.nivel || estado.classificacao_sugerida?.nivel || estado.nivel;

    // Se houver uma sugestão de tipo de artefato, deveríamos ter salvo no sugerido, 
    // mas como o 'classificarPRD' só retorna nível por enquanto, mantemos o tipo atual ou override
    // (A implementação planeja expandir a classificação completa no futuro, por hora focamos no nível)
    const novoTipo = args.tipo_artefato || estado.tipo_artefato || "product";

    // Recalcular Tier e Fluxo
    const novoTier = determinarTierGate(novoTipo, novoNivel);
    const fluxo = getFluxoComStitch(novoNivel, estado.usar_stitch);

    // Atualizar Estado
    estado.nivel = novoNivel;
    estado.tipo_artefato = novoTipo;
    estado.tier_gate = novoTier;
    estado.total_fases = fluxo.total_fases;

    // Marcar como confirmado e desbloquear
    estado.aguardando_classificacao = false;
    estado.classificacao_pos_prd_confirmada = true;
    estado.classificacao_sugerida = undefined; // Limpar sugestão

    // Serializar estado atualizado
    const estadoFile = serializarEstado(estado);

    const resposta = `# ✅ Classificação Confirmada

O projeto foi configurado com os seguintes parâmetros:

| Campo | Valor |
|-------|-------|
| **Nível** | **${novoNivel.toUpperCase()}** |
| **Tipo** | **${novoTipo}** |
| **Tier** | **${novoTier.toUpperCase()}** |
| **Total Fases** | ${estado.total_fases} |

> ${descreverTier(novoTier)}

---

## ⚡ Próximos Passos

Agora você pode prosseguir para a próxima fase.

\`\`\`
proximo(
    entregavel: "...", 
    estado_json: "...",
    diretorio: "${diretorio}"
)
\`\`\`

## 📁 AÇÃO OBRIGATÓRIA - Salvar Estado
**Caminho:** \`${diretorio}/.maestro/estado.json\`

\`\`\`json
${estadoFile.content}
\`\`\`
`;

    const proximaFase = getFaseComStitch(novoNivel, estado.fase_atual, estado.usar_stitch);
    const specialist = proximaFase ? getSpecialistPersona(proximaFase.nome) : null;

    const next_action: NextAction = {
        tool: "proximo",
        description: `Gerar entregável da fase ${estado.fase_atual} (${proximaFase?.nome || 'próxima'}) e avançar`,
        args_template: { entregavel: "{{conteudo_do_entregavel}}", estado_json: "{{estado_json}}", diretorio },
        requires_user_input: true,
        user_prompt: `Agora trabalhe com o especialista ${proximaFase?.especialista || 'da fase'} para gerar o entregável: ${proximaFase?.entregavel_esperado || 'da fase atual'}`,
    };

    const progress: FlowProgress = {
        current_phase: proximaFase?.nome || `Fase ${estado.fase_atual}`,
        total_phases: estado.total_fases,
        completed_phases: estado.gates_validados.length,
        percentage: Math.round((estado.gates_validados.length / estado.total_fases) * 100),
    };

    return {
        content: [{ type: "text", text: resposta }],
        files: [
            { path: `${diretorio}/${estadoFile.path}`, content: estadoFile.content }
        ],
        estado_atualizado: estadoFile.content,
        next_action,
        specialist_persona: specialist || undefined,
        progress,
    };
}

export const confirmarClassificacaoSchema = {
    type: "object",
    properties: {
        estado_json: { type: "string" },
        diretorio: { type: "string" },
        nivel: { type: "string", enum: ["simples", "medio", "complexo"] },
        tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"] }
    },
    required: ["estado_json", "diretorio"]
};
