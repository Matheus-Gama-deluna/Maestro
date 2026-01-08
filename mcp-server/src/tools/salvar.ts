import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../types/index.js";
import { carregarEstado } from "../state/storage.js";
import { resolveDirectory } from "../state/context.js";

interface SalvarArgs {
    conteudo: string;
    tipo: "rascunho" | "anexo" | "entregavel";
    nome_arquivo?: string;
    diretorio?: string;
}

/**
 * Tool: salvar
 * Salva conteúdo sem avançar de fase
 */
export async function salvar(args: SalvarArgs): Promise<ToolResult> {
    const diretorio = resolveDirectory(args.diretorio);
    const estado = await carregarEstado(diretorio);

    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Nenhum projeto iniciado neste diretório.",
            }],
            isError: true,
        };
    }

    let targetDir: string;
    let nomeArquivo: string;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    switch (args.tipo) {
        case "rascunho":
            targetDir = join(diretorio, ".guia", "rascunhos");
            nomeArquivo = args.nome_arquivo || `rascunho-${timestamp}.md`;
            break;
        case "anexo":
            targetDir = join(diretorio, "docs", `fase-${estado.fase_atual.toString().padStart(2, "0")}`, "anexos");
            nomeArquivo = args.nome_arquivo || `anexo-${timestamp}.md`;
            break;
        case "entregavel":
            targetDir = join(diretorio, "docs", `fase-${estado.fase_atual.toString().padStart(2, "0")}`);
            nomeArquivo = args.nome_arquivo || `entregavel-${timestamp}.md`;
            break;
    }

    await mkdir(targetDir, { recursive: true });
    const caminhoCompleto = join(targetDir, nomeArquivo);
    await writeFile(caminhoCompleto, args.conteudo, "utf-8");

    const resposta = `# 💾 Conteúdo Salvo

## Detalhes

| Campo | Valor |
|-------|-------|
| **Tipo** | ${args.tipo} |
| **Arquivo** | \`${nomeArquivo}\` |
| **Caminho** | \`${caminhoCompleto}\` |
| **Tamanho** | ${args.conteudo.length} caracteres |

${args.tipo === "rascunho" ? `
> 💡 Rascunhos são salvos em \`.guia/rascunhos/\` e não contam como entregáveis.
` : ""}

${args.tipo === "anexo" ? `
> 💡 Anexos são salvos junto aos entregáveis da fase atual.
` : ""}

${args.tipo === "entregavel" ? `
> ⚠️ Este entregável foi salvo mas **não foi validado**. Use \`proximo()\` para validar e avançar.
` : ""}

---

**Próximas ações:**
- Para avançar de fase: \`proximo(entregavel: "[conteúdo]")\`
- Para verificar status: \`status()\`
`;

    return {
        content: [{ type: "text", text: resposta }],
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
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo (opcional, será gerado automaticamente)",
        },
        diretorio: {
            type: "string",
            description: "Diretório do projeto (opcional, usa o último se não informado)",
        },
    },
    required: ["conteudo", "tipo"],
};
