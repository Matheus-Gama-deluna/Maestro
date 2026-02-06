import { join, resolve } from "path";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction } from "../types/response.js";
import { parsearEstado } from "../state/storage.js";
import { normalizeProjectPath, resolveProjectPath, joinProjectPath } from "../utils/files.js";
import { setCurrentDirectory } from "../state/context.js";

interface SalvarArgs {
    conteudo: string;
    tipo: "rascunho" | "anexo" | "entregavel";
    estado_json: string;     // Estado atual (obrigatório)
    nome_arquivo?: string;
    diretorio: string;       // Diretório do projeto (obrigatório)
}

/**
 * Tool: salvar
 * Salva conteúdo sem avançar de fase (modo stateless)
 * Retorna arquivo para a IA salvar
 */
export async function salvar(args: SalvarArgs): Promise<ToolResult> {
    // Validar parâmetros obrigatórios
    if (!args.conteudo || args.conteudo.trim().length === 0) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `conteudo` é obrigatório e não pode estar vazio.",
            }],
            isError: true,
        };
    }

    const tiposValidos = ["rascunho", "anexo", "entregavel"];
    if (!args.tipo || !tiposValidos.includes(args.tipo)) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Parâmetro \`tipo\` deve ser um de: ${tiposValidos.join(", ")}.\n\nRecebido: "${args.tipo || "undefined"}"`,
            }],
            isError: true,
        };
    }

    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Erro: Estado Obrigatório

O parâmetro \`estado_json\` é obrigatório.

**Uso:**
\`\`\`
salvar(
    conteudo: "...",
    tipo: "rascunho",
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`
`,
            }],
            isError: true,
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

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    let targetPath: string;
    let nomeArquivo: string;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    switch (args.tipo) {
        case "rascunho":
            nomeArquivo = args.nome_arquivo || `rascunho-${timestamp}.md`;
            targetPath = `${diretorio}/.maestro/rascunhos/${nomeArquivo}`;
            break;
        case "anexo":
            nomeArquivo = args.nome_arquivo || `anexo-${timestamp}.md`;
            targetPath = `${diretorio}/docs/fase-${estado.fase_atual.toString().padStart(2, "0")}/anexos/${nomeArquivo}`;
            break;
        case "entregavel":
            nomeArquivo = args.nome_arquivo || `entregavel-${timestamp}.md`;
            targetPath = `${diretorio}/docs/fase-${estado.fase_atual.toString().padStart(2, "0")}/${nomeArquivo}`;
            break;
    }

    const resposta = `# 💾 Salvar Conteúdo

## Detalhes

| Campo | Valor |
|-------|-------|
| **Tipo** | ${args.tipo} |
| **Arquivo** | \`${nomeArquivo}\` |
| **Caminho** | \`${targetPath}\` |
| **Tamanho** | ${args.conteudo.length} caracteres |

${args.tipo === "rascunho" ? `
> 💡 Rascunhos são salvos em \`.maestro/rascunhos/\` e não contam como entregáveis.
` : ""}

${args.tipo === "anexo" ? `
> 💡 Anexos são salvos junto aos entregáveis da fase atual.
` : ""}

${args.tipo === "entregavel" ? `
> ⚠️ Este entregável será salvo mas **não foi validado**. Use \`proximo()\` para validar e avançar.
` : ""}

---

## ⚡ AÇÃO OBRIGATÓRIA - Salvar Arquivo

**A IA DEVE executar o comando abaixo para criar o arquivo.**

### 1. Criar diretório (se necessário)
\`\`\`
mkdir -p "${targetPath.substring(0, targetPath.lastIndexOf("/"))}"
\`\`\`

### 2. Salvar arquivo
**Caminho:** \`${targetPath}\`

\`\`\`markdown
${args.conteudo.slice(0, 500)}${args.conteudo.length > 500 ? "\n... [conteúdo completo no campo files]" : ""}
\`\`\`

---

**Próximas ações:**
- Para avançar de fase: \`proximo(entregavel: "...", estado_json: "...")\`
- Para verificar status: \`status(estado_json: "...")\`
`;

    const next_action: NextAction = args.tipo === "entregavel" ? {
        tool: "proximo",
        description: "Validar e avançar com o entregável salvo",
        args_template: { entregavel: args.conteudo.slice(0, 100) + "...", estado_json: "{{estado_json}}", diretorio },
        requires_user_input: false,
        auto_execute: false,
    } : {
        tool: "status",
        description: "Verificar status atual do projeto",
        args_template: { estado_json: "{{estado_json}}", diretorio },
        requires_user_input: false,
    };

    return {
        content: [{ type: "text", text: resposta }],
        files: [{
            path: targetPath,
            content: args.conteudo
        }],
        next_action,
    };
}

/**
 * Input schema para salvar
 */
export const salvarSchema = {
    type: "object",
    properties: {
        conteudo: {
            type: "string",
            description: "Conteúdo a ser salvo",
        },
        tipo: {
            type: "string",
            enum: ["rascunho", "anexo", "entregavel"],
            description: "Tipo do conteúdo",
        },
        estado_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/estado.json",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo (opcional, será gerado automaticamente)",
        },
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
    },
    required: ["conteudo", "tipo", "estado_json", "diretorio"],
};
