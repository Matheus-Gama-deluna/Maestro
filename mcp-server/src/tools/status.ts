import type { ToolResult } from "../types/index.js";
import { carregarEstado } from "../state/storage.js";
import { getFase, getFluxo } from "../flows/types.js";
import { descreverNivel } from "../flows/classifier.js";
import { resolveDirectory } from "../state/context.js";

interface StatusArgs {
    diretorio?: string;
}

/**
 * Tool: status
 * Retorna status completo do projeto
 */
export async function status(args?: StatusArgs): Promise<ToolResult> {
    const diretorio = resolveDirectory(args?.diretorio);
    const estado = await carregarEstado(diretorio);

    if (!estado) {
        return {
            content: [{
                type: "text",
                text: `# ℹ️ Nenhum projeto ativo

Nenhum projeto iniciado neste diretório.

**Para iniciar um projeto use:**
\`\`\`
iniciar_projeto(nome: "Nome do Projeto")
\`\`\`
`,
            }],
        };
    }

    const fluxo = getFluxo(estado.nivel);
    const faseAtual = getFase(estado.nivel, estado.fase_atual);

    const progresso = Math.round((estado.fase_atual / estado.total_fases) * 100);
    const barraProgresso = "█".repeat(Math.floor(progresso / 10)) + "░".repeat(10 - Math.floor(progresso / 10));

    const fasesCompletas = estado.gates_validados.map(num => {
        const fase = getFase(estado.nivel, num);
        return fase ? `✅ Fase ${num}: ${fase.nome}` : `✅ Fase ${num}`;
    });

    const fasesPendentes = fluxo.fases
        .filter(f => f.numero > estado.fase_atual)
        .map(f => `⬜ Fase ${f.numero}: ${f.nome}`);

    const resposta = `# 📊 Status do Projeto

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | ${estado.nome} |
| **ID** | \`${estado.projeto_id}\` |
| **Diretório** | \`${estado.diretorio}\` |
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Tipo** | ${estado.tipo_fluxo} |

## Progresso

| ${barraProgresso} | ${progresso}% |
|:---|---:|

**Fase atual:** ${estado.fase_atual}/${estado.total_fases} - **${faseAtual?.nome || "N/A"}**

> ${descreverNivel(estado.nivel)}

## Fases

### ✅ Concluídas (${fasesCompletas.length})
${fasesCompletas.length > 0 ? fasesCompletas.join("\n") : "Nenhuma fase concluída ainda"}

### 📍 Atual
🔄 **Fase ${estado.fase_atual}: ${faseAtual?.nome || "N/A"}**
- Especialista: ${faseAtual?.especialista || "N/A"}
- Entregável esperado: ${faseAtual?.entregavel_esperado || "N/A"}

### ⬜ Pendentes (${fasesPendentes.length})
${fasesPendentes.length > 0 ? fasesPendentes.join("\n") : "Todas as fases foram concluídas!"}

## Gate da Fase Atual

${faseAtual?.gate_checklist.map(item => `- [ ] ${item}`).join("\n") || "N/A"}

## Entregáveis Gerados

${Object.keys(estado.entregaveis).length > 0
            ? Object.entries(estado.entregaveis).map(([fase, caminho]) => `- **${fase}**: \`${caminho}\``).join("\n")
            : "Nenhum entregável gerado ainda"}

---

**Última atualização:** ${new Date(estado.atualizado_em).toLocaleString("pt-BR")}
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

/**
 * Input schema para status
 */
export const statusSchema = {
    type: "object",
    properties: {
        diretorio: {
            type: "string",
            description: "Diretório do projeto (opcional)",
        },
    },
};
