import type { ToolResult } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { getFluxoComStitch, getFaseComStitch } from "../flows/types.js";
import { gerarInstrucaoRecursos } from "../utils/instructions.js";

interface ConfirmarStitchArgs {
    estado_json: string;
    diretorio: string;
    usar_stitch: boolean;
}

/**
 * Tool: confirmar_stitch
 * Confirma se o projeto vai usar prototipagem com Google Stitch
 * Deve ser chamada após iniciar_projeto com a resposta do usuário
 */
export async function confirmarStitch(args: ConfirmarStitchArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Erro: Estado Obrigatório

O parâmetro \`estado_json\` é obrigatório.

**Uso:**
1. Leia o arquivo \`.maestro/estado.json\`
2. Passe o conteúdo como parâmetro
`,
            }],
            isError: true,
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

    if (typeof args.usar_stitch !== "boolean") {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `usar_stitch` deve ser `true` ou `false`.",
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

    // Verificar se já foi confirmado
    if (estado.stitch_confirmado) {
        return {
            content: [{
                type: "text",
                text: `# ⚠️ Stitch Já Configurado

A configuração de Stitch já foi definida anteriormente.

| Campo | Valor |
|-------|-------|
| **Usar Stitch** | ${estado.usar_stitch ? "Sim" : "Não"} |
| **Total de Fases** | ${estado.total_fases} |

Para alterar, inicie um novo projeto.
`,
            }],
        };
    }

    const diretorio = args.diretorio;
    setCurrentDirectory(diretorio);

    // Atualizar estado
    estado.usar_stitch = args.usar_stitch;
    estado.stitch_confirmado = true;

    // Recalcular total de fases considerando Stitch
    const fluxo = getFluxoComStitch(estado.nivel, estado.usar_stitch);
    estado.total_fases = fluxo.total_fases;

    // Serializar estado atualizado
    const estadoFile = serializarEstado(estado);

    // Obter fase 1 para instruções
    const fase1 = getFaseComStitch(estado.nivel, 1, estado.usar_stitch)!;

    const stitchInfo = args.usar_stitch
        ? `## ✅ Prototipagem com Stitch Habilitada

O fluxo agora inclui uma **fase de prototipagem** após Requisitos.

| Campo | Valor |
|-------|-------|
| **Stitch** | ✅ Habilitado |
| **Total de Fases** | ${estado.total_fases} |
| **Fase de Stitch** | Fase 3 (após Requisitos) |

> 💡 Na fase 3, você usará o Google Stitch para criar protótipos de UI.
`
        : `## ✅ Configuração Concluída

Prosseguindo **sem** fase de prototipagem.

| Campo | Valor |
|-------|-------|
| **Stitch** | ❌ Não habilitado |
| **Total de Fases** | ${estado.total_fases} |
`;

    const resposta = `# 🎯 Stitch Configurado

${stitchInfo}

---

## ⚡ AÇÃO OBRIGATÓRIA - Atualizar Estado

**Caminho:** \`${diretorio}/.maestro/estado.json\`

\`\`\`json
${estadoFile.content}
\`\`\`

---

## 📋 Fase 1/${estado.total_fases}: ${fase1.nome}

| Campo | Valor |
|-------|-------|
| **Especialista** | ${fase1.especialista} |
| **Entregável** | ${fase1.entregavel_esperado} |

### Gate de Saída
${fase1.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}

---

## Próximo Passo

Desenvolva o **PRD** definindo:
- Problema a resolver
- Personas
- MVP
- Métricas

Quando terminar, diga **"próximo"**.

${gerarInstrucaoRecursos(fase1.nome, "AÇÃO OBRIGATÓRIA - Carregar Recursos da Fase 1")}
`;

    return {
        content: [{ type: "text", text: resposta }],
        files: [
            { path: `${diretorio}/${estadoFile.path}`, content: estadoFile.content }
        ],
        estado_atualizado: estadoFile.content,
    };
}

export const confirmarStitchSchema = {
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
        usar_stitch: {
            type: "boolean",
            description: "true = usar Stitch para prototipagem, false = pular prototipagem",
        },
    },
    required: ["estado_json", "diretorio", "usar_stitch"],
};
