import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { getFase } from "../flows/types.js";
import { validarGate as validarGateCore, formatarResultadoGate } from "../gates/validator.js";
import { normalizeProjectPath, resolveProjectPath } from "../utils/files.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolve } from "path";
import { getSkillParaFase } from "../utils/prompt-mapper.js";

interface ValidarGateArgs {
    fase?: number;
    entregavel?: string;
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
}

/**
 * Tool: validar_gate
 * Valida checklist de saída da fase (modo stateless)
 */
export async function validarGate(args: ValidarGateArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📋 Validar Gate (Modo Stateless)

Para validar um gate, a IA deve:
1. Ler o arquivo \`.maestro/estado.json\` do projeto
2. Passar o conteúdo como parâmetro

**Uso:**
\`\`\`
validar_gate(
    entregavel: "[conteúdo]",
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

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

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
validar_gate(
    entregavel: "[seu conteúdo]",
    estado_json: "...",
    diretorio: "..."
)
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

${(() => {
    const skillAtual = getSkillParaFase(fase.nome);
    if (!skillAtual) return "";
    
    return `
## 📋 Checklist da Skill

**Localização:** \`.agent/skills/${skillAtual}/resources/checklists/\`

> 💡 Consulte o checklist completo da skill para validação detalhada.
`;
})()}

${resultado.valido
            ? "✅ **Você pode avançar!** Use `proximo(entregavel: \"...\", estado_json: \"...\")` para ir para a próxima fase."
            : "⚠️ **Complete os itens pendentes** ou use `proximo(entregavel: \"...\", estado_json: \"...\", confirmar_usuario: true)` para forçar avanço."}
`;

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json,
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
