import type { ToolResult } from "../types/index.js";
import type { Fase } from "../types/index.js";
import { carregarEstado } from "../state/storage.js";
import { getFase } from "../flows/types.js";
import { validarGate } from "../gates/validator.js";
import { validarEstrutura } from "../gates/estrutura.js";
import { resolveDirectory } from "../state/context.js";

interface AvaliarEntregavelArgs {
    entregavel: string;
    fase?: number;
    diretorio?: string;
}

interface QualityScore {
    total: number;
    estrutura: number;
    checklist: number;
    tamanho: number;
    aprovado: boolean;
    requer_confirmacao: boolean;
}

/**
 * Calcula score de qualidade completo
 */
function calcularScore(
    fase: Fase,
    entregavel: string,
    estruturaResult: ReturnType<typeof validarEstrutura>,
    gateResult: ReturnType<typeof validarGate>
): QualityScore {
    // Scores individuais
    const estruturaScore = estruturaResult.score;

    const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
    const checklistScore = totalChecklist > 0
        ? (gateResult.itens_validados.length / totalChecklist) * 100
        : 100;

    const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

    // Score total ponderado
    const total = Math.round(
        (estruturaScore * 0.30) +
        (checklistScore * 0.50) +
        (tamanhoScore * 0.20)
    );

    return {
        total,
        estrutura: Math.round(estruturaScore),
        checklist: Math.round(checklistScore),
        tamanho: tamanhoScore,
        aprovado: total >= 70,
        requer_confirmacao: total >= 50 && total < 70,
    };
}

/**
 * Tool: avaliar_entregavel
 * Avalia qualidade do entregável e retorna score com sugestões
 */
export async function avaliarEntregavel(args: AvaliarEntregavelArgs): Promise<ToolResult> {
    const diretorio = resolveDirectory(args.diretorio);
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

    const faseNum = args.fase || estado.fase_atual;
    const fase = getFase(estado.nivel, faseNum);

    if (!fase) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Fase ${faseNum} não encontrada.`,
            }],
            isError: true,
        };
    }

    // Validar estrutura
    const estruturaResult = validarEstrutura(faseNum, args.entregavel);

    // Validar checklist
    const gateResult = validarGate(fase, args.entregavel);

    // Calcular score
    const score = calcularScore(fase, args.entregavel, estruturaResult, gateResult);

    // Gerar resposta
    let statusEmoji = "✅";
    let statusText = "Aprovado";

    if (score.total < 50) {
        statusEmoji = "❌";
        statusText = "Bloqueado - Não pode avançar";
    } else if (score.total < 70) {
        statusEmoji = "⚠️";
        statusText = "Requer confirmação do usuário para avançar";
    }

    const barraProgresso = (valor: number) => {
        const cheios = Math.floor(valor / 10);
        return "█".repeat(cheios) + "░".repeat(10 - cheios);
    };

    let resposta = `# ${statusEmoji} Avaliação de Qualidade

## Score Total: ${score.total}/100 - ${statusText}

| ${barraProgresso(score.total)} | ${score.total}% |
|:---|---:|

## Detalhamento

| Critério | Score | Peso |
|----------|-------|------|
| Estrutura (seções) | ${score.estrutura}/100 | 30% |
| Checklist (keywords) | ${score.checklist}/100 | 50% |
| Tamanho | ${score.tamanho}/100 | 20% |

`;

    // Estrutura
    if (estruturaResult.secoes_encontradas.length > 0) {
        resposta += `\n### ✅ Seções Encontradas\n`;
        estruturaResult.secoes_encontradas.forEach(s => {
            resposta += `- ${s}\n`;
        });
    }

    if (estruturaResult.secoes_faltando.length > 0) {
        resposta += `\n### ❌ Seções Faltando\n`;
        estruturaResult.secoes_faltando.forEach(s => {
            resposta += `- ${s}\n`;
        });
    }

    // Checklist
    if (gateResult.itens_validados.length > 0) {
        resposta += `\n### ✅ Checklist Validado\n`;
        gateResult.itens_validados.forEach(item => {
            resposta += `- ${item}\n`;
        });
    }

    if (gateResult.itens_pendentes.length > 0) {
        resposta += `\n### ❌ Checklist Pendente\n`;
        gateResult.itens_pendentes.forEach((item, i) => {
            resposta += `- ${item}\n`;
            resposta += `  💡 ${gateResult.sugestoes[i]}\n`;
        });
    }

    // Feedback estrutural
    if (estruturaResult.feedback.length > 0) {
        resposta += `\n### 💬 Feedback\n`;
        estruturaResult.feedback.forEach(f => {
            resposta += `${f}\n`;
        });
    }

    // Próximos passos
    resposta += `\n---\n\n## 🎯 Próximos Passos\n\n`;

    if (score.total >= 70) {
        resposta += `✅ O entregável está aprovado! Use \`proximo(entregavel: "...")\` para avançar.\n`;
    } else if (score.total >= 50) {
        resposta += `⚠️ Score entre 50-69. Para avançar, o **usuário** deve confirmar explicitamente:
\n\`proximo(entregavel: "...", confirmar_usuario: true)\`\n
> **IMPORTANTE**: A IA não pode definir \`confirmar_usuario\`. Apenas o usuário pode confirmar.\n`;
    } else {
        resposta += `❌ Score abaixo de 50. **Não é possível avançar.**\n
Corrija os itens pendentes antes de tentar novamente.\n`;
    }

    return {
        content: [{ type: "text", text: resposta }],
    };
}

export const avaliarEntregavelSchema = {
    type: "object",
    properties: {
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável a ser avaliado",
        },
        fase: {
            type: "number",
            description: "Número da fase (opcional, usa atual)",
        },
        diretorio: {
            type: "string",
            description: "Diretório do projeto",
        },
    },
    required: ["entregavel"],
};
