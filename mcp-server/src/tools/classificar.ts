import type { ToolResult, NivelComplexidade } from "../types/index.js";
import { carregarEstado, salvarEstado } from "../state/storage.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js";
import { getFluxo } from "../flows/types.js";

interface ClassificarArgs {
    prd?: string;
    nivel?: NivelComplexidade;
}

/**
 * Tool: classificar
 * Reclassifica complexidade do projeto baseado no PRD ou manual
 */
export async function classificar(args: ClassificarArgs): Promise<ToolResult> {
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

    let novoNivel: NivelComplexidade;
    let criterios: string[] = [];
    let pontuacao = 0;

    if (args.nivel) {
        // Classificação manual
        novoNivel = args.nivel;
        criterios.push("Classificação manual pelo usuário");
    } else if (args.prd) {
        // Classificação automática baseada no PRD
        const resultado = classificarPRD(args.prd);
        novoNivel = resultado.nivel;
        criterios = resultado.criterios;
        pontuacao = resultado.pontuacao;
    } else {
        return {
            content: [{
                type: "text",
                text: `# 📊 Classificar Projeto

## Uso

**Classificação automática (recomendado):**
\`\`\`
classificar(prd: "[conteúdo do PRD]")
\`\`\`

**Classificação manual:**
\`\`\`
classificar(nivel: "simples" | "medio" | "complexo")
\`\`\`

## Níveis Disponíveis

| Nível | Fases | Descrição |
|-------|-------|-----------|
| simples | 5 | MVP rápido, poucas integrações |
| medio | 11 | Completo com segurança e testes |
| complexo | 15 | Enterprise com arquitetura avançada |

## Nível Atual
**${estado.nivel.toUpperCase()}** (${estado.total_fases} fases)
`,
            }],
        };
    }

    const nivelAnterior = estado.nivel;
    const fluxo = getFluxo(novoNivel);

    estado.nivel = novoNivel;
    estado.total_fases = fluxo.total_fases;
    await salvarEstado(diretorio, estado);

    const resposta = `# 📊 Projeto Reclassificado

## Alteração

| Campo | Antes | Depois |
|-------|-------|--------|
| **Nível** | ${nivelAnterior} | **${novoNivel.toUpperCase()}** |
| **Total de Fases** | ${getFluxo(nivelAnterior).total_fases} | **${fluxo.total_fases}** |

${pontuacao > 0 ? `## Análise\n- **Pontuação:** ${pontuacao} pontos` : ""}

${criterios.length > 0 ? `### Critérios detectados:\n${criterios.map(c => `- ${c}`).join("\n")}` : ""}

> ${descreverNivel(novoNivel)}

## Fase Atual
Você continua na **fase ${estado.fase_atual}** do fluxo.
`;

    return {
        content: [{ type: "text", text: resposta }],
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
            description: "Nível de complexidade para classificação manual",
        },
    },
};
