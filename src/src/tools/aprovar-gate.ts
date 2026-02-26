import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction, FlowProgress } from "../types/response.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { logEvent, EventTypes } from "../utils/history.js";
import { normalizeProjectPath, resolveProjectPath } from "../utils/files.js";
import { resolve } from "path";
import { getFaseComStitch } from "../flows/types.js";
import { getSpecialistPersona } from "../services/specialist.service.js";

interface AprovarGateArgs {
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
    acao: "aprovar" | "rejeitar";  // Ação do usuário
}

/**
 * Tool: aprovar_gate
 * 🔐 EXCLUSIVO DO USUÁRIO - Aprova ou rejeita avanço com pendências
 * 
 * Esta tool só deve ser executada quando o USUÁRIO HUMANO explicitamente
 * solicitar aprovação ou rejeição do gate pendente.
 * 
 * A IA NÃO deve chamar esta tool por conta própria.
 */
export async function aprovarGate(args: AprovarGateArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 🔐 Aprovar Gate (Exclusivo do Usuário)

Esta tool é para uso EXCLUSIVO do usuário humano.

**Uso:**
\`\`\`
aprovar_gate(
    acao: "aprovar" | "rejeitar",
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`

> ⚠️ **IMPORTANTE**: A IA NÃO deve chamar esta tool automaticamente.
> Apenas execute quando o usuário pedir explicitamente para aprovar ou rejeitar.
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

    const diretorio = resolveProjectPath(args.diretorio);

    if (!args.acao || !["aprovar", "rejeitar"].includes(args.acao)) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `acao` deve ser 'aprovar' ou 'rejeitar'.",
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

    setCurrentDirectory(diretorio);

    // Verificar se há aprovação pendente
    if (!estado.aguardando_aprovacao) {
        return {
            content: [{
                type: "text",
                text: `# ℹ️ Nenhuma Aprovação Pendente

O projeto não está aguardando aprovação de gate.

**Estado atual:**
- Fase: ${estado.fase_atual}/${estado.total_fases}
- Nível: ${estado.nivel}

> ⚠️ Para usar esta tool, o projeto deve primeiro passar por \`proximo()\`
> e ser bloqueado com score < 70.
`,
            }],
        };
    }

    // Verificar se há score registrado (garante que passou por validação real)
    if (args.acao === "aprovar" && estado.score_bloqueado === undefined) {
        return {
            content: [{
                type: "text",
                text: `# ⚠️ Aprovação Inválida

Não há score registrado para aprovar.

O projeto deve primeiro:
1. Passar por \`proximo()\` com um entregável
2. Ser bloqueado com score < 70
3. Então o usuário pode aprovar

**Use \`proximo()\` primeiro com o entregável completo.**
`,
            }],
            isError: true,
        };
    }

    const scoreAnterior = estado.score_bloqueado;
    const motivoAnterior = estado.motivo_bloqueio;

    if (args.acao === "aprovar") {
        // Limpar flags de bloqueio
        estado.aguardando_aprovacao = false;
        estado.motivo_bloqueio = undefined;
        estado.score_bloqueado = undefined;
        estado.itens_aprovados_bloqueio = undefined;
        estado.itens_pendentes_bloqueio = undefined;
        // V6 Sprint 2: Desativar modo compulsório ao aprovar
        estado.em_estado_compulsorio = false;

        // Serializar estado
        const estadoFile = serializarEstado(estado);

        const faseAtual = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
        const specialist = faseAtual ? getSpecialistPersona(faseAtual.nome) : null;

        const next_action: NextAction = {
            tool: "proximo",
            description: `Gerar entregável e avançar para fase ${estado.fase_atual} (${faseAtual?.nome || 'próxima'})`,
            args_template: { entregavel: "{{conteudo_do_entregavel}}", estado_json: "{{estado_json}}", diretorio },
            requires_user_input: true,
            user_prompt: `Gate aprovado. Agora gere o entregável: ${faseAtual?.entregavel_esperado || 'da fase atual'}`,
        };

        const progress: FlowProgress = {
            current_phase: faseAtual?.nome || `Fase ${estado.fase_atual}`,
            total_phases: estado.total_fases,
            completed_phases: estado.gates_validados.length,
            percentage: Math.round((estado.gates_validados.length / estado.total_fases) * 100),
        };

        return {
            content: [{
                type: "text",
                text: `# ✅ Gate Aprovado pelo Usuário

O avanço foi autorizado manualmente.

| Campo | Valor |
|-------|-------|
| **Score anterior** | ${scoreAnterior}/100 |
| **Motivo bloqueio** | ${motivoAnterior} |

## ⚡ Próximos Passos

1. **Salve o estado atualizado:**
   \`${args.diretorio}/.maestro/estado.json\`

2. **Chame \`proximo()\`** para avançar:
   \`\`\`
   proximo(entregavel: "...", estado_json: "...", diretorio: "...")
   \`\`\`

---

## 📁 Estado Atualizado

\`\`\`json
${estadoFile.content}
\`\`\`
`,
            }],
            files: [{
                path: `${args.diretorio}/${estadoFile.path}`,
                content: estadoFile.content
            }],
            estado_atualizado: estadoFile.content,
            next_action,
            specialist_persona: specialist || undefined,
            progress,
        };
    } else {
        // Rejeitar - limpar flags e manter na fase atual
        estado.aguardando_aprovacao = false;
        estado.motivo_bloqueio = undefined;
        estado.score_bloqueado = undefined;
        estado.itens_aprovados_bloqueio = undefined;
        estado.itens_pendentes_bloqueio = undefined;
        // V6 Sprint 2: Desativar modo compulsório ao rejeitar também
        estado.em_estado_compulsorio = false;

        // Serializar estado
        const estadoFile = serializarEstado(estado);

        const faseAtualRej = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);

        const next_action_rej: NextAction = {
            tool: "validar_gate",
            description: "Validar o entregável corrigido antes de tentar avançar novamente",
            args_template: { entregavel: "{{entregavel_corrigido}}", estado_json: "{{estado_json}}", diretorio },
            requires_user_input: true,
            user_prompt: "Corrija os itens pendentes e valide novamente antes de avançar.",
        };

        return {
            content: [{
                type: "text",
                text: `# ❌ Gate Rejeitado pelo Usuário

O avanço foi rejeitado. O projeto permanece na fase atual.

| Campo | Valor |
|-------|-------|
| **Fase atual** | ${estado.fase_atual}/${estado.total_fases} |
| **Score rejeitado** | ${scoreAnterior}/100 |

## 💡 Recomendação

Corrija os itens pendentes antes de tentar avançar novamente.

---

## 📁 Estado Atualizado

\`\`\`json
${estadoFile.content}
\`\`\`
`,
            }],
            files: [{
                path: `${args.diretorio}/${estadoFile.path}`,
                content: estadoFile.content
            }],
            estado_atualizado: estadoFile.content,
            next_action: next_action_rej,
            progress: {
                current_phase: faseAtualRej?.nome || `Fase ${estado.fase_atual}`,
                total_phases: estado.total_fases,
                completed_phases: estado.gates_validados.length,
                percentage: Math.round((estado.gates_validados.length / estado.total_fases) * 100),
            },
        };
    }
}

/**
 * Input schema para aprovar_gate
 */
export const aprovarGateSchema = {
    type: "object",
    properties: {
        acao: {
            type: "string",
            enum: ["aprovar", "rejeitar"],
            description: "🔐 EXCLUSIVO DO USUÁRIO. 'aprovar' para liberar avanço, 'rejeitar' para manter na fase atual.",
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
    required: ["acao", "estado_json", "diretorio"],
};
