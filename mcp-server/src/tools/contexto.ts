import type { ToolResult } from "../types/index.js";
import { carregarEstado } from "../state/storage.js";
import { getFase, getFluxo } from "../flows/types.js";

/**
 * Tool: contexto
 * Retorna contexto acumulado do projeto para injeção em prompts
 */
export async function contexto(): Promise<ToolResult> {
    const diretorio = process.cwd();
    const estado = await carregarEstado(diretorio);

    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Nenhum projeto iniciado neste diretório.",
            }],
            isError: true,
        };
    }

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
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

/**
 * Input schema para contexto
 */
export const contextoSchema = {
    type: "object",
    properties: {},
};
