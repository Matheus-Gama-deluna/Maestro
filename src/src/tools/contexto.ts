import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { getFase, getFluxo } from "../flows/types.js";
import { setCurrentDirectory } from "../state/context.js";
import { gerarInstrucaoRecursosCompacta } from "../utils/instructions.js";

interface ContextoArgs {
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
}

/**
 * Tool: contexto
 * Retorna contexto acumulado do projeto para injeção em prompts (modo stateless)
 */
export async function contexto(args: ContextoArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📋 Contexto do Projeto (Modo Stateless)

Para obter o contexto, a IA deve:
1. Ler o arquivo \`.maestro/estado.json\` do projeto
2. Passar o conteúdo como parâmetro

**Uso:**
\`\`\`
contexto(
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`
`,
            }],
        };
    }

    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    setCurrentDirectory(args.diretorio);

    const fluxo = getFluxo(estado.nivel);
    const faseAtual = getFase(estado.nivel, estado.fase_atual);

    // Construir resumo dos entregáveis
    const entregaveisResumo = Object.entries(estado.entregaveis)
        .map(([fase, caminho]) => {
            const numFase = parseInt(fase.replace("fase_", ""));
            const infoFase = getFase(estado.nivel, numFase);
            return `- **${infoFase?.nome || fase}**: \`${caminho}\``;
        })
        .join("\n");

    // Identificar stack e modelo (se disponíveis nas fases anteriores)
    const fasesCompletas = estado.gates_validados.map(num => getFase(estado.nivel, num)?.nome).join(", ");

    const resposta = `# 📋 Contexto do Projeto

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | ${estado.nome} |
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Tipo** | ${estado.tipo_fluxo} |
| **Fase Atual** | ${estado.fase_atual}/${estado.total_fases} - ${faseAtual?.nome || "N/A"} |

## Progresso

- **Gates validados:** ${estado.gates_validados.length}
- **Fases completas:** ${fasesCompletas || "Nenhuma"}
- **Última atualização:** ${new Date(estado.atualizado_em).toLocaleString("pt-BR")}

## Entregáveis Gerados

${entregaveisResumo || "Nenhum entregável gerado ainda."}

## Próxima Fase

${faseAtual ? `
| Campo | Valor |
|-------|-------|
| **Especialista** | ${faseAtual.especialista} |
| **Template** | ${faseAtual.template} |
| **Entregável esperado** | ${faseAtual.entregavel_esperado} |

### Checklist de Gate
${faseAtual.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}
` : "Projeto concluído!"}

## Fluxo Completo

${fluxo.fases.map(f => {
        const status = estado.gates_validados.includes(f.numero) ? "✅" :
            f.numero === estado.fase_atual ? "🔄" : "⬜";
        return `${status} **Fase ${f.numero}**: ${f.nome}`;
    }).join("\n")}

---

*Use este contexto para manter consistência entre as fases do projeto.*

${faseAtual ? gerarInstrucaoRecursosCompacta(faseAtual.especialista, faseAtual.template) : ""}
`;

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json,
    };
}

/**
 * Input schema para contexto
 */
export const contextoSchema = {
    type: "object",
    properties: {
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
