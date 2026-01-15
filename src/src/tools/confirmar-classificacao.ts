import type { ToolResult, NivelComplexidade, TipoArtefato } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { determinarTierGate, descreverTier } from "../gates/tiers.js";
import { getFluxoComStitch } from "../flows/types.js";
import { setCurrentDirectory } from "../state/context.js";

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

    const diretorio = args.diretorio;
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

    return {
        content: [{ type: "text", text: resposta }],
        files: [
            { path: `${diretorio}/${estadoFile.path}`, content: estadoFile.content }
        ],
        estado_atualizado: estadoFile.content,
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
