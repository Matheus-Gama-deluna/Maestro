import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { getFase, getFluxo } from "../flows/types.js";
import { descreverNivel } from "../flows/classifier.js";
import { setCurrentDirectory } from "../state/context.js";
import { gerarInstrucaoRecursosCompacta } from "../utils/instructions.js";
import { gerarSecaoPrompts, getSkillParaFase, getSkillPath } from "../utils/prompt-mapper.js";
import { temContentLocal, normalizeProjectPath, joinProjectPath } from "../utils/files.js";
import { formatSkillMessage, detectIDE } from "../utils/ide-paths.js";
import { getSpecialistPersona } from "../services/specialist.service.js";
import { formatResponse, formatError, embedAllMetadata } from "../utils/response-formatter.js";
import { withStructuredContent } from "../services/structured-content.service.js";
import type { FlowProgress } from "../types/response.js";

interface StatusArgs {
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
}

/**
 * Tool: status
 * Retorna status completo do projeto (modo stateless)
 */
export async function status(args: StatusArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: formatError("status", "Parâmetro `estado_json` é obrigatório.", "Leia `.maestro/estado.json` e passe como parâmetro."),
        };
    }

    if (!args.diretorio) {
        return {
            content: formatError("status", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: formatError("status", "Não foi possível parsear o estado JSON."),
            isError: true,
        };
    }

    setCurrentDirectory(args.diretorio);

    // Verifica se há conteúdo local disponível (via npx)
    const avisoContentLocal = temContentLocal(args.diretorio) ? "" : `
> ℹ️ **Contúdo embutido**: Usando conteúdo embutido via npx. Para especialistas/templates personalizados, execute \`npx @maestro-ai/cli\`.`;

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
${avisoContentLocal}
## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | ${estado.nome} |
| **ID** | \`${estado.projeto_id}\` |
| **Diretório** | \`${args.diretorio}\` |
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

${(() => {
    if (!faseAtual) return "";
    const skillAtual = getSkillParaFase(faseAtual.nome);
    if (!skillAtual) return "";
    
    // Detectar IDE do estado ou do diretório
    const ide = estado.ide || detectIDE(args.diretorio) || 'windsurf';
    
    return `
## 🤖 Especialista Ativo

${formatSkillMessage(skillAtual, ide)}
`;
})()}

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

    const specialist = faseAtual ? getSpecialistPersona(faseAtual.nome) : null;

    const progress: FlowProgress = {
        current_phase: faseAtual?.nome || `Fase ${estado.fase_atual}`,
        total_phases: estado.total_fases,
        completed_phases: estado.gates_validados.length,
        percentage: Math.round((estado.gates_validados.length / estado.total_fases) * 100),
    };

    // v5.2: Structured content — dados JSON para clients que suportam
    const structuredData = {
        projeto: estado.nome,
        projeto_id: estado.projeto_id,
        nivel: estado.nivel,
        fase_atual: estado.fase_atual,
        total_fases: estado.total_fases,
        fase_nome: faseAtual?.nome || null,
        progresso_percentual: progress.percentage,
        gates_validados: estado.gates_validados,
        entregaveis: estado.entregaveis,
        atualizado_em: estado.atualizado_em,
    };

    // v5.2: Embute metadados no content (elimina campos custom ignorados pelo client)
    const baseContent = embedAllMetadata(
        [{ type: "text", text: resposta }],
        { specialist: specialist || undefined, progress }
    );

    const result = withStructuredContent(baseContent, structuredData, "Status do Projeto");
    return { content: result.content };
}

/**
 * Input schema para status
 */
export const statusSchema = {
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
