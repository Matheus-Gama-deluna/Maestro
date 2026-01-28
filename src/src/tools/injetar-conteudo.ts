import type { ToolResult } from "../types/index.js";
import { resolveProjectPath } from "../utils/files.js";
import { injectContentIntoProject, getBuiltinContentDir } from "../utils/content-injector.js";

interface InjetarConteudoArgs {
    diretorio: string;
    source?: "builtin" | "custom";
    custom_path?: string;
    force?: boolean;
}

/**
 * Tool: injetar_conteudo
 * Copia o conteúdo base (especialistas, templates, guias, prompts) para .maestro/content do projeto.
 * Permite sobrescrever com force=true ou usar fonte customizada.
 */
export async function injetar_conteudo(args: InjetarConteudoArgs): Promise<ToolResult> {
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

    let sourcePath: string | undefined;
    if (args.source === "custom" && args.custom_path) {
        sourcePath = args.custom_path;
    }

    try {
        const result = await injectContentIntoProject(diretorio, {
            sourcePath,
            force: args.force,
        });

        if (!result.installed) {
            return {
                content: [{
                    type: "text",
                    text: `ℹ️ **Conteúdo já existe**

📁 Destino: \`${result.targetDir}\`

Para sobrescrever, use \`force: true\`:
\`\`\`
injetar_conteudo(
    diretorio: "${args.diretorio}",
    force: true
)
\`\`\``,
                }],
            };
        }

        return {
            content: [{
                type: "text",
                text: `✅ **Conteúdo injetado com sucesso!**

📁 Destino: \`${result.targetDir}\`
📦 Fonte: ${result.sourceDir}
📊 Arquivos copiados: ${result.filesCopied}

Estrutura criada:
- specialists/ (especialistas de cada fase)
- templates/ (modelos de entregáveis)
- guides/ (guias de apoio)
- prompts/ (prompts por categoria)
- examples/ (exemplos de fluxos)

O projeto agora tem acesso local a todos os recursos do Maestro!`,
            }],
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro ao injetar conteúdo**: ${String(error)}

Verifique:
- O diretório do projeto existe
- Permissões de escrita no diretório
- Fonte de conteúdo disponível (${getBuiltinContentDir()})`,
            }],
            isError: true,
        };
    }
}

/**
 * Input schema para injetar_conteudo
 */
export const injetarConteudoSchema = {
    type: "object",
    properties: {
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
        source: {
            type: "string",
            enum: ["builtin", "custom"],
            description: "Fonte do conteúdo (padrão: builtin)",
        },
        custom_path: {
            type: "string",
            description: "Caminho customizado se source=custom",
        },
        force: {
            type: "boolean",
            description: "Sobrescrever se já existe (padrão: false)",
        },
    },
    required: ["diretorio"],
};
