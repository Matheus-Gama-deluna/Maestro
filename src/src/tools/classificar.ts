import type { ToolResult, NivelComplexidade, EstadoProjeto, TipoArtefato } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js";
import { getFluxo } from "../flows/types.js";
import { setCurrentDirectory } from "../state/context.js";
import { normalizeProjectPath, resolveProjectPath } from "../utils/files.js";
import { resolve } from "path";
import { determinarTierGate, descreverTier } from "../gates/tiers.js";

interface ClassificarArgs {
    prd?: string;
    nivel?: NivelComplexidade;
    tipo_artefato?: TipoArtefato; // Novo
    estado_json: string;
    diretorio: string;
}

/**
 * Tool: classificar
 * Reclassifica complexidade e tipo do projeto (modo stateless)
 */
export async function classificar(args: ClassificarArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📊 Classificar Projeto (Modo Stateless)

**Uso:**
\`\`\`
classificar(
    nivel: "simples" | "medio" | "complexo",
    tipo_artefato: "poc" | "script" | "internal" | "product",
    estado_json: "...",
    diretorio: "..."
)
\`\`\`
`,
            }],
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

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    let novoNivel: NivelComplexidade = estado.nivel;
    let novoTipo: TipoArtefato = estado.tipo_artefato || "product"; // Default se não existir
    let criterios: string[] = [];
    let pontuacao = 0;

    // Atualiza baseados nos argumentos
    if (args.nivel) {
        novoNivel = args.nivel;
        criterios.push("Nível ajustado manualmente");
    }

    if (args.tipo_artefato) {
        novoTipo = args.tipo_artefato;
        criterios.push("Tipo de artefato ajustado manualmente");
    }

    // Se PRD fornecido, tenta inferir nível (mas respeita manual se dado)
    if (args.prd && !args.nivel) {
        const resultado = classificarPRD(args.prd);
        novoNivel = resultado.nivel;
        criterios = resultado.criterios;
        pontuacao = resultado.pontuacao;
    }

    const nivelAnterior = estado.nivel;
    const tipoAnterior = estado.tipo_artefato;
    const tierAnterior = estado.tier_gate;

    // Recalcula Tier
    const novoTier = determinarTierGate(novoTipo, novoNivel);
    const fluxo = getFluxo(novoNivel);

    // Atualizar estado
    estado.nivel = novoNivel;
    estado.tipo_artefato = novoTipo;
    estado.tier_gate = novoTier;
    estado.total_fases = fluxo.total_fases;
    estado.classificacao_confirmada = true; // Se reclassificou, está confirmado

    // Serializar novo estado
    const estadoFile = serializarEstado(estado);

    const resposta = `# 📊 Projeto Reclassificado

## Alterações

| Campo | Antes | Depois |
|-------|-------|--------|
| **Tipo** | ${tipoAnterior || "-"} | **${novoTipo}** |
| **Nível** | ${nivelAnterior} | **${novoNivel.toUpperCase()}** |
| **Tier** | ${tierAnterior || "-"} | **${novoTier.toUpperCase()}** |
| **Fases** | ${getFluxo(nivelAnterior).total_fases} | **${fluxo.total_fases}** |

> ${descreverTier(novoTier)}

${pontuacao > 0 ? `## Análise PRD\n- **Pontuação:** ${pontuacao}\n${criterios.map(c => `- ${c}`).join("\n")}` : ""}

---

## ⚡ AÇÃO OBRIGATÓRIA - Atualizar Estado

### Atualizar estado
**Caminho:** \`${args.diretorio}/.maestro/estado.json\`

\`\`\`json
${estadoFile.content}
\`\`\`
`;

    return {
        content: [{ type: "text", text: resposta }],
        files: [{
            path: `${args.diretorio}/${estadoFile.path}`,
            content: estadoFile.content
        }],
        estado_atualizado: estadoFile.content,
    };
}

/**
 * Input schema para classificar
 */
export const classificarSchema = {
    type: "object",
    properties: {
        prd: {
            type: "string",
            description: "Conteúdo do PRD para classificação automática",
        },
        nivel: {
            type: "string",
            enum: ["simples", "medio", "complexo"],
            description: "Novo nível de complexidade",
        },
        tipo_artefato: {
            type: "string",
            enum: ["poc", "script", "internal", "product"],
            description: "Novo tipo de artefato",
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
