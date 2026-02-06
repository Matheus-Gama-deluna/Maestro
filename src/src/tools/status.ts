
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction, FlowProgress } from "../types/response.js";
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
            content: [{
                type: "text",
                text: `# ℹ️ Status do Projeto (Modo Stateless)

Para ver o status, a IA deve:
1. Ler o arquivo \`.maestro/estado.json\` do projeto
2. Passar o conteúdo como parâmetro

**Uso:**
\`\`\`
status(
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

    let next_action: NextAction;
    if (estado.aguardando_aprovacao) {
        next_action = {
            tool: "aprovar_gate",
            description: "Projeto aguardando aprovação do usuário para avançar",
            args_template: { acao: "aprovar", estado_json: "{{estado_json}}", diretorio: args.diretorio },
            requires_user_input: true,
            user_prompt: "O projeto está bloqueado. Deseja aprovar ou rejeitar o avanço?",
        };
    } else if (estado.aguardando_classificacao) {
        next_action = {
            tool: "confirmar_classificacao",
            description: "Confirmar classificação pós-PRD antes de avançar",
            args_template: { estado_json: "{{estado_json}}", diretorio: args.diretorio },
            requires_user_input: true,
            user_prompt: "Confirme a classificação sugerida para o projeto.",
        };
    } else {
        next_action = {
            tool: "proximo",
            description: `Gerar entregável da fase ${estado.fase_atual} (${faseAtual?.nome || 'atual'}) e avançar`,
            args_template: { entregavel: "{{conteudo_do_entregavel}}", estado_json: "{{estado_json}}", diretorio: args.diretorio },
            requires_user_input: true,
            user_prompt: `Trabalhe com o especialista ${faseAtual?.especialista || 'da fase'} para gerar: ${faseAtual?.entregavel_esperado || 'entregável'}`,
        };
    }

    const progress: FlowProgress = {
        current_phase: faseAtual?.nome || `Fase ${estado.fase_atual}`,
        total_phases: estado.total_fases,
        completed_phases: estado.gates_validados.length,
        percentage: progresso,
    };

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json,
        next_action,
        specialist_persona: specialist || undefined,
        progress,
    };
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
