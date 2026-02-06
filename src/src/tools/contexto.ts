import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction, FlowProgress } from "../types/response.js";
import { parsearEstado } from "../state/storage.js";
import { getFase, getFluxo } from "../flows/types.js";
import { setCurrentDirectory } from "../state/context.js";
import { gerarInstrucaoRecursosCompacta } from "../utils/instructions.js";
import { normalizeProjectPath, resolveProjectPath, joinProjectPath } from "../utils/files.js";
import { resolve } from "path";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { formatSkillMessage, detectIDE } from "../utils/ide-paths.js";
import { getSpecialistPersona } from "../services/specialist.service.js";

interface ContextoArgs {
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
}

/**
 * Tool: contexto
 * Retorna contexto acumulado do projeto para injeção em prompts (modo stateless)
 */
export async function contexto(args: ContextoArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📋 Contexto do Projeto (Modo Stateless)

Para obter o contexto, a IA deve:
1. Ler o arquivo \`.maestro/estado.json\` do projeto
2. Passar o conteúdo como parâmetro

**Uso:**
\`\`\`
contexto(
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

    const diretorio = resolve(normalizeProjectPath(args.diretorio));
    setCurrentDirectory(diretorio);

    const fluxo = getFluxo(estado.nivel);
    const faseAtual = getFase(estado.nivel, estado.fase_atual);

    // Construir resumo dos entregáveis
    const entregaveisResumo = Object.entries(estado.entregaveis)
        .map(([fase, caminho]) => {
            const numFase = parseInt(fase.replace("fase_", ""));
            const infoFase = getFase(estado.nivel, numFase);
            return `- **${infoFase?.nome || fase}**: \`${caminho}\``;
        })
        .join("\n");

    // Identificar stack e modelo (se disponíveis nas fases anteriores)
    const fasesCompletas = estado.gates_validados.map(num => getFase(estado.nivel, num)?.nome).join(", ");

    const resposta = `# 📋 Contexto do Projeto

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | ${estado.nome} |
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Tipo** | ${estado.tipo_fluxo} |
| **Fase Atual** | ${estado.fase_atual}/${estado.total_fases} - ${faseAtual?.nome || "N/A"} |

## Progresso

- **Gates validados:** ${estado.gates_validados.length}
- **Fases completas:** ${fasesCompletas || "Nenhuma"}
- **Última atualização:** ${new Date(estado.atualizado_em).toLocaleString("pt-BR")}

## Entregáveis Gerados

${entregaveisResumo || "Nenhum entregável gerado ainda."}

## 🤖 Skills Utilizadas

${(() => {
    const skillsUtilizadas = estado.gates_validados
        .map(num => {
            const fase = getFase(estado.nivel, num);
            if (!fase) return null;
            const skill = getSkillParaFase(fase.nome);
            return skill ? `- ✅ **${fase.nome}**: \`${skill}\`` : null;
        })
        .filter(Boolean);
    
    return skillsUtilizadas.length > 0 
        ? skillsUtilizadas.join("\n")
        : "Nenhuma skill utilizada ainda.";
})()}

## Próxima Fase

${faseAtual ? `
| Campo | Valor |
|-------|-------|
| **Especialista** | ${faseAtual.especialista} |
| **Entregável esperado** | ${faseAtual.entregavel_esperado} |

${(() => {
    const proximaSkill = getSkillParaFase(faseAtual.nome);
    if (!proximaSkill) return "";
    
    return `
### 💡 Próximos Passos com Skill

${formatSkillMessage(proximaSkill, estado.ide || detectIDE(args.diretorio) || 'windsurf')}

1. Ativar skill: \`@${proximaSkill}\`
2. Ler \`SKILL.md\` para instruções da fase
3. Consultar templates em \`resources/templates/\`
4. Seguir checklist em \`resources/checklists/\`
`;
})()}

### Checklist de Gate
${faseAtual.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}
` : "Projeto concluído!"}

## Fluxo Completo

${fluxo.fases.map(f => {
        const status = estado.gates_validados.includes(f.numero) ? "✅" :
            f.numero === estado.fase_atual ? "🔄" : "⬜";
        return `${status} **Fase ${f.numero}**: ${f.nome}`;
    }).join("\n")}

---

*Use este contexto para manter consistência entre as fases do projeto.*
`;

    const specialist = faseAtual ? getSpecialistPersona(faseAtual.nome) : null;

    const next_action: NextAction = {
        tool: "proximo",
        description: `Gerar entregável da fase ${estado.fase_atual} (${faseAtual?.nome || 'atual'}) e avançar`,
        args_template: { entregavel: "{{conteudo_do_entregavel}}", estado_json: "{{estado_json}}", diretorio: args.diretorio },
        requires_user_input: true,
        user_prompt: `Use o contexto acima para trabalhar com ${faseAtual?.especialista || 'o especialista'} e gerar: ${faseAtual?.entregavel_esperado || 'entregável'}`,
    };

    const progress: FlowProgress = {
        current_phase: faseAtual?.nome || `Fase ${estado.fase_atual}`,
        total_phases: estado.total_fases,
        completed_phases: estado.gates_validados.length,
        percentage: Math.round((estado.gates_validados.length / estado.total_fases) * 100),
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
 * Input schema para contexto
 */
export const contextoSchema = {
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
