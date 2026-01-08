import type { ToolResult } from "../types/index.js";
import { carregarEstado } from "../state/storage.js";
import { getFase } from "../flows/types.js";
import { validarGate as validarGateCore, formatarResultadoGate } from "../gates/validator.js";

interface ValidarGateArgs {
    fase?: number;
    entregavel?: string;
}

/**
 * Tool: validar_gate
 * Valida checklist de saída da fase
 */
export async function validarGate(args: ValidarGateArgs): Promise<ToolResult> {
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

    const numeroFase = args.fase || estado.fase_atual;
    const fase = getFase(estado.nivel, numeroFase);

    if (!fase) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Fase ${numeroFase} não encontrada.`,
            }],
            isError: true,
        };
    }

    // Se não passou entregável, mostrar checklist
    if (!args.entregavel) {
        const resposta = `# 📋 Gate da Fase ${numeroFase}: ${fase.nome}

## Checklist de Saída

${fase.gate_checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

## Como usar

Para validar o gate, passe o entregável:
\`\`\`
validar_gate(entregavel: "[seu conteúdo]")
\`\`\`

Ou para validar uma fase específica:
\`\`\`
validar_gate(fase: ${numeroFase}, entregavel: "[seu conteúdo]")
\`\`\`
`;

        return {
            content: [{ type: "text", text: resposta }],
        };
    }

    // Validar gate
    const resultado = validarGateCore(fase, args.entregavel);
    const resultadoFormatado = formatarResultadoGate(resultado);

    const resposta = `# Gate da Fase ${numeroFase}: ${fase.nome}

${resultadoFormatado}

${resultado.valido
            ? "✅ **Você pode avançar!** Use `proximo(entregavel)` para ir para a próxima fase."
            : "⚠️ **Complete os itens pendentes** ou use `proximo(entregavel, forcar: true)` para forçar avanço."}
`;

    return {
        content: [{ type: "text", text: resposta }],
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
    },
};
