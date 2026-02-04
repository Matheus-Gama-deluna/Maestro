import type { ToolResult } from "../types/index.js";
import { saveUserConfig, loadUserConfig, getConfigPath, MaestroUserConfig } from "../utils/config.js";

interface SetupInicialArgs extends Partial<MaestroUserConfig> {}

export async function setupInicial(args: SetupInicialArgs): Promise<ToolResult> {
    const existente = await loadUserConfig();

    if (!args.ide || !args.modo || args.usar_stitch === undefined) {
        return {
            content: [{
                type: "text",
                text: `# ⚙️ Setup Inicial Necessário

Defina uma única vez suas preferências para evitar perguntas repetidas.

Informe em **um único prompt** (sem quebrar em vários):
\`\`\`
setup_inicial({
  ide: "windsurf",        // windsurf | cursor | antigravity
  modo: "balanced",       // economy | balanced | quality
  usar_stitch: false,
  preferencias_stack: {
    frontend: "react",    // opcional
    backend: "node",      // opcional
    database: "postgres"  // opcional
  },
  team_size: "pequeno"     // opcional
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

> Suas preferências serão usadas automaticamente ao iniciar projetos.`,
        }],
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
