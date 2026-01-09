import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../types/index.js";
import { lerEspecialista, lerTemplate } from "../utils/files.js";
import { carregarEstado, salvarEstado, registrarEntregavel } from "../state/storage.js";
import { getFase, getFluxo } from "../flows/types.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js";
import { validarGate, formatarResultadoGate } from "../gates/validator.js";
import { validarEstrutura } from "../gates/estrutura.js";
import { resolveDirectory } from "../state/context.js";
import { carregarResumo, salvarResumo, extrairResumoEntregavel, criarResumoInicial } from "../state/memory.js";
import type { EntregavelResumo } from "../types/memory.js";

interface ProximoArgs {
    entregavel: string;
    forcar?: boolean;
    confirmar_usuario?: boolean;  // NOVO: Somente usuário pode definir
    nome_arquivo?: string;
    diretorio?: string;
}

/**
 * Calcula score de qualidade
 */
function calcularQualityScore(
    estruturaResult: ReturnType<typeof validarEstrutura>,
    gateResult: ReturnType<typeof validarGate>
): number {
    const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
    const checklistScore = totalChecklist > 0
        ? (gateResult.itens_validados.length / totalChecklist) * 100
        : 100;

    const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

    return Math.round(
        (estruturaResult.score * 0.30) +
        (checklistScore * 0.50) +
        (tamanhoScore * 0.20)
    );
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

    // Validar estrutura do entregável
    const estruturaResult = validarEstrutura(estado.fase_atual, args.entregavel);

    // Validar gate (checklist)
    const gateResultado = validarGate(faseAtual, args.entregavel);

    // Calcular score de qualidade
    const qualityScore = calcularQualityScore(estruturaResult, gateResultado);

    // Score < 50: BLOQUEAR - não pode avançar de forma alguma
    if (qualityScore < 50) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Bloqueado

## Score: ${qualityScore}/100 - Abaixo do mínimo (50)

O entregável não atende aos requisitos mínimos de qualidade.

### Problemas Encontrados

${estruturaResult.feedback.join("\n")}

### Checklist Pendente
${gateResultado.itens_pendentes.map((item, i) => `- ${item}\n  💡 ${gateResultado.sugestoes[i]}`).join("\n")}

---

**Não é possível avançar.** Corrija os itens acima e tente novamente.

Use \`avaliar_entregavel(entregavel: "...")\` para ver a análise completa.`,
            }],
        };
    }

    // Score 50-69: Requer confirmação EXPLÍCITA do usuário
    if (qualityScore < 70 && !args.confirmar_usuario) {
        return {
            content: [{
                type: "text",
                text: `# ⚠️ Confirmação Necessária

## Score: ${qualityScore}/100 - Requer aprovação do usuário

O entregável tem qualidade abaixo do ideal (mínimo recomendado: 70).

### Itens Pendentes

${estruturaResult.secoes_faltando.length > 0 ? `**Seções faltando:**\n${estruturaResult.secoes_faltando.map(s => `- ${s}`).join("\n")}\n` : ""}
${gateResultado.itens_pendentes.length > 0 ? `**Checklist pendente:**\n${gateResultado.itens_pendentes.map(item => `- ${item}`).join("\n")}` : ""}

---

## 🔐 Confirmação do Usuário Necessária

Para avançar com pendências, o **usuário** deve confirmar explicitamente:

\`\`\`
proximo(entregavel: "...", confirmar_usuario: true)
\`\`\`

> ⚠️ **IMPORTANTE**: A IA NÃO pode definir \`confirmar_usuario\`. 
> Apenas o usuário humano pode autorizar o avanço com pendências.

---

**Alternativas:**
1. Corrigir os itens pendentes e tentar novamente
2. Usuário confirmar avanço com \`confirmar_usuario: true\``,
            }],
        };
    }

    // Score >= 70 OU usuário confirmou: Pode avançar
    // (forcar ainda funciona para casos extremos, mas não é anunciado)

    // Salvar entregável
    const nomeArquivo = args.nome_arquivo || faseAtual.entregavel_esperado;
    const faseDir = join(diretorio, "docs", `fase-${estado.fase_atual.toString().padStart(2, "0")}-${faseAtual.nome.toLowerCase().replace(/\s/g, "-")}`);
    await mkdir(faseDir, { recursive: true });

    const caminhoArquivo = join(faseDir, nomeArquivo);
    await writeFile(caminhoArquivo, args.entregavel, "utf-8");
    await registrarEntregavel(diretorio, estado.fase_atual, caminhoArquivo);

    // Atualizar resumo do projeto
    let resumo = await carregarResumo(diretorio);
    if (!resumo) {
        resumo = criarResumoInicial(estado.projeto_id, estado.nome, estado.nivel, estado.fase_atual, estado.total_fases);
    }

    // Extrair resumo do entregável e adicionar
    const extractedInfo = extrairResumoEntregavel(args.entregavel, estado.fase_atual, faseAtual.nome, faseAtual.entregavel_esperado, caminhoArquivo);

    const novoEntregavel: EntregavelResumo = {
        fase: estado.fase_atual,
        nome: faseAtual.nome,
        tipo: faseAtual.entregavel_esperado,
        arquivo: caminhoArquivo,
        resumo: extractedInfo.resumo,
        pontos_chave: extractedInfo.pontos_chave,
        criado_em: new Date().toISOString(),
    };

    // Update or add deliverable
    const existingIdx = resumo.entregaveis.findIndex(e => e.fase === estado.fase_atual);
    if (existingIdx >= 0) {
        resumo.entregaveis[existingIdx] = novoEntregavel;
    } else {
        resumo.entregaveis.push(novoEntregavel);
    }

    // Update project info
    resumo.fase_atual = estado.fase_atual;
    resumo.nivel = estado.nivel;
    resumo.total_fases = estado.total_fases;

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

    // Atualizar contexto atual no resumo
    const proximaFaseInfo = getFase(estado.nivel, estado.fase_atual);
    if (proximaFaseInfo) {
        resumo.contexto_atual = {
            fase_nome: proximaFaseInfo.nome,
            objetivo: `Desenvolver ${proximaFaseInfo.entregavel_esperado}`,
            proximo_passo: `Trabalhar com ${proximaFaseInfo.especialista} para criar o entregável`,
            dependencias: resumo.entregaveis.map(e => e.nome),
        };
    }

    // Salvar resumo atualizado
    await salvarResumo(diretorio, resumo);

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
        confirmar_usuario: {
            type: "boolean",
            description: "APENAS O USUÁRIO pode definir. Confirma avanço com pendências (score 50-69). IA NÃO deve usar.",
        },
        forcar: {
            type: "boolean",
            description: "Forçar avanço (uso interno, não anunciado)",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo para salvar (opcional)",
        },
        diretorio: {
            type: "string",
            description: "Diretório do projeto (opcional)",
        },
    },
    required: ["entregavel"],
};
