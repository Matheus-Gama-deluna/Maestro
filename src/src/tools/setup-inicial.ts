import type { ToolResult } from "../types/index.js";
import { saveUserConfig, loadUserConfig, getConfigPath, MaestroUserConfig } from "../utils/config.js";

interface SetupInicialArgs extends Partial<MaestroUserConfig> {}

export async function setupInicial(args: SetupInicialArgs, diretorio?: string): Promise<ToolResult> {
    const existente = await loadUserConfig();

    if (!args.ide || !args.modo || args.usar_stitch === undefined) {
        return {
            content: [{
                type: "text",
                text: `# ⚙️ Setup Inicial Necessário

Defina uma única vez suas preferências para evitar perguntas repetidas.

Pergunte ao usuário:
1. Qual IDE você usa? (windsurf / cursor / antigravity)
2. Qual modo prefere? (economy = rápido / balanced = equilibrado / quality = completo)
3. Deseja usar Stitch para prototipagem? (sim/não)

Depois EXECUTE:

\`\`\`json
maestro({
  "diretorio": "<diretorio>",
  "acao": "setup_inicial",
  "respostas": {
    "ide": "windsurf",
    "modo": "balanced",
    "usar_stitch": false
  }
})
\`\`\`

${existente ? `Config atual detectada em ${getConfigPath()}. Envie novamente para atualizar.` : "Nenhuma configuração encontrada ainda."}`,
            }],
        };
    }

    const payload: MaestroUserConfig = {
        ide: args.ide,
        modo: args.modo,
        usar_stitch: args.usar_stitch,
        preferencias_stack: args.preferencias_stack,
        team_size: args.team_size,
        version: args.version || "2.1.0",
    };

    await saveUserConfig(payload);

    // v5.4: Montar próximo passo com diretório concreto se disponível
    const dirLabel = diretorio || "<diretorio_do_projeto>";

    return {
        content: [{
            type: "text",
            text: `# ✅ Setup Inicial Salvo

Configuração persistida em: \`${getConfigPath()}\`

| Campo | Valor |
|-------|-------|
| IDE | ${payload.ide} |
| Modo | ${payload.modo} |
| Stitch | ${payload.usar_stitch ? "Sim" : "Não"} |
| Stack | ${formatStack(payload)} |
| Time | ${payload.team_size || "-"} |

> Suas preferências serão usadas automaticamente ao iniciar projetos.

---

## ▶️ Próximo Passo: Criar Projeto

Agora pergunte ao usuário o **nome** e uma **descrição breve** do projeto, depois EXECUTE:

\`\`\`json
maestro({
  "diretorio": "${dirLabel}",
  "acao": "criar_projeto",
  "respostas": {
    "nome": "<nome do projeto>",
    "descricao": "<descrição breve>"
  }
})
\`\`\`

⚠️ **IMPORTANTE:** NÃO chame \`maestro()\` sem \`acao\` — isso reinicia o fluxo. Sempre use \`acao: "criar_projeto"\`.`,
        }],
        next_action: {
            tool: "maestro",
            description: "Criar novo projeto com as preferências salvas",
            args_template: {
                diretorio: dirLabel,
                acao: "criar_projeto",
                respostas: {
                    nome: "<nome_do_projeto>",
                    descricao: "<descrição breve>",
                },
            },
            requires_user_input: true,
            user_prompt: "Qual o nome e uma breve descrição do projeto que deseja criar?",
        },
    };
}

function formatStack(cfg: MaestroUserConfig): string {
    if (!cfg.preferencias_stack) return "-";
    const { frontend, backend, database } = cfg.preferencias_stack;
    return [frontend, backend, database].filter(Boolean).join(" / ") || "-";
}

export const setupInicialSchema = {
    type: "object",
    properties: {
        ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"] },
        modo: { type: "string", enum: ["economy", "balanced", "quality"] },
        usar_stitch: { type: "boolean" },
        preferencias_stack: {
            type: "object",
            properties: {
                frontend: { type: "string", enum: ["react", "vue", "angular", "nextjs"] },
                backend: { type: "string", enum: ["node", "java", "php", "python"] },
                database: { type: "string", enum: ["postgres", "mysql", "mongodb"] },
            },
        },
        team_size: { type: "string", enum: ["solo", "pequeno", "medio", "grande"] },
        version: { type: "string" },
    },
    required: [],
};
