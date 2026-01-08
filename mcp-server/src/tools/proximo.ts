import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../types/index.js";
import { lerEspecialista, lerTemplate } from "../utils/files.js";
import { carregarEstado, salvarEstado, registrarEntregavel } from "../state/storage.js";
import { getFase, getFluxo } from "../flows/types.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js";
import { validarGate, formatarResultadoGate } from "../gates/validator.js";
import { resolveDirectory } from "../state/context.js";

interface ProximoArgs {
    entregavel: string;
    forcar?: boolean;
    nome_arquivo?: string;
    diretorio?: string;
}

/**
 * Tool: proximo
 * Salva entregável e avança para próxima fase
 */
export async function proximo(args: ProximoArgs): Promise<ToolResult> {
    const diretorio = resolveDirectory(args.diretorio);
    const estado = await carregarEstado(diretorio);

    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Nenhum projeto iniciado neste diretório.\n\nUse `iniciar_projeto` primeiro.",
            }],
            isError: true,
        };
    }

    const faseAtual = getFase(estado.nivel, estado.fase_atual);
    if (!faseAtual) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Fase ${estado.fase_atual} não encontrada no fluxo ${estado.nivel}.`,
            }],
            isError: true,
        };
    }

    // Validar gate
    const gateResultado = validarGate(faseAtual, args.entregavel);

    if (!gateResultado.valido && !args.forcar) {
        const gateFormatado = formatarResultadoGate(gateResultado);
        return {
            content: [{
                type: "text",
                text: `# ⚠️ Gate não aprovado\n\n${gateFormatado}\n\n**Opções:**\n1. Complete os itens pendentes e tente novamente\n2. Use \`proximo(entregavel, forcar: true)\` para forçar avanço`,
            }],
        };
    }

    // Salvar entregável
    const nomeArquivo = args.nome_arquivo || faseAtual.entregavel_esperado;
    const faseDir = join(diretorio, "docs", `fase-${estado.fase_atual.toString().padStart(2, "0")}-${faseAtual.nome.toLowerCase().replace(/\s/g, "-")}`);
    await mkdir(faseDir, { recursive: true });

    const caminhoArquivo = join(faseDir, nomeArquivo);
    await writeFile(caminhoArquivo, args.entregavel, "utf-8");
    await registrarEntregavel(diretorio, estado.fase_atual, caminhoArquivo);

    // Classificar complexidade após fase 1 (PRD)
    let classificacaoInfo = "";
    if (estado.fase_atual === 1) {
        const classificacao = classificarPRD(args.entregavel);
        estado.nivel = classificacao.nivel;
        estado.total_fases = getFluxo(classificacao.nivel).total_fases;

        classificacaoInfo = `
## 🎯 Classificação do Projeto

| Campo | Valor |
|-------|-------|
| **Nível** | ${classificacao.nivel.toUpperCase()} |
| **Pontuação** | ${classificacao.pontuacao} pontos |
| **Total de Fases** | ${estado.total_fases} |

### Critérios detectados:
${classificacao.criterios.map(c => `- ${c}`).join("\n")}

> ${descreverNivel(classificacao.nivel)}
`;
    }

    // Avançar para próxima fase
    const faseAnterior = estado.fase_atual;

    if (estado.fase_atual < estado.total_fases) {
        estado.fase_atual += 1;
        estado.gates_validados.push(faseAnterior);
        await salvarEstado(diretorio, estado);
    }

    const proximaFase = getFase(estado.nivel, estado.fase_atual);

    // Se projeto concluído
    if (!proximaFase || estado.fase_atual > estado.total_fases) {
        return {
            content: [{
                type: "text",
                text: `# 🎉 Projeto Concluído!

## Resumo

| Campo | Valor |
|-------|-------|
| **Projeto** | ${estado.nome} |
| **Nível** | ${estado.nivel} |
| **Fases completadas** | ${estado.total_fases} |
| **Gates validados** | ${estado.gates_validados.length} |

### Entregáveis gerados:
${Object.entries(estado.entregaveis).map(([fase, caminho]) => `- ${fase}: \`${caminho}\``).join("\n")}

Parabéns! Todos os artefatos foram gerados em \`docs/\`.
`,
            }],
        };
    }

    // Carregar próxima fase
    const especialista = await lerEspecialista(proximaFase.especialista);
    const template = await lerTemplate(proximaFase.template);

    const resposta = `# ✅ Fase ${faseAnterior} Concluída!

## 📁 Entregável Salvo
\`${caminhoArquivo}\`

${gateResultado.valido ? "✅ Gate aprovado" : "⚠️ Gate forçado"}
${classificacaoInfo}

---

# 📍 Fase ${estado.fase_atual}/${estado.total_fases}: ${proximaFase.nome}

| Campo | Valor |
|-------|-------|
| **Especialista** | ${proximaFase.especialista} |
| **Template** | ${proximaFase.template} |
| **Entregável** | ${proximaFase.entregavel_esperado} |

## Gate de Saída
${proximaFase.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}

---

## 🎭 Especialista: ${proximaFase.especialista}

${especialista}

---

## 📝 Template: ${proximaFase.template}

${template}
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

/**
 * Input schema para proximo
 */
export const proximoSchema = {
    type: "object",
    properties: {
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável da fase atual",
        },
        forcar: {
            type: "boolean",
            description: "Forçar avanço mesmo se gate não aprovado",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo para salvar (opcional)",
        },
        diretorio: {
            type: "string",
            description: "Diretório do projeto (opcional, usa o último se não informado)",
        },
    },
    required: ["entregavel"],
};
