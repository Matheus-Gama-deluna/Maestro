import { join, resolve } from "path";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction } from "../types/response.js";
import { parsearEstado } from "../state/storage.js";
import { normalizeProjectPath, resolveProjectPath, joinProjectPath } from "../utils/files.js";
import { setCurrentDirectory } from "../state/context.js";
import { formatError, embedNextAction } from "../utils/response-formatter.js";
import { getFaseDirName } from "../utils/entregavel-path.js";
import { getFluxoComStitch } from "../flows/types.js";

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
            content: formatError("salvar", "Parâmetro `conteudo` é obrigatório e não pode estar vazio."),
            isError: true,
        };
    }

    const tiposValidos = ["rascunho", "anexo", "entregavel"];
    if (!args.tipo || !tiposValidos.includes(args.tipo)) {
        return {
            content: formatError("salvar", `Parâmetro \`tipo\` deve ser um de: ${tiposValidos.join(", ")}. Recebido: "${args.tipo || "undefined"}"`),
            isError: true,
        };
    }

    if (!args.estado_json) {
        return {
            content: formatError("salvar", "Parâmetro `estado_json` é obrigatório.", "Leia `.maestro/estado.json` e passe como parâmetro."),
            isError: true,
        };
    }

    if (!args.diretorio) {
        return {
            content: formatError("salvar", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: formatError("salvar", "Não foi possível parsear o estado JSON."),
            isError: true,
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    let targetPath: string;
    let nomeArquivo: string;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    // Resolver nome da fase atual para gerar path canônico
    const fluxo = getFluxoComStitch(estado.nivel, estado.usar_stitch ?? false);
    const faseAtualInfo = fluxo?.fases?.find(f => f.numero === estado.fase_atual);
    const faseNomeAtual = faseAtualInfo?.nome ?? `fase-${estado.fase_atual}`;
    const faseDirName = getFaseDirName(estado.fase_atual, faseNomeAtual);

    switch (args.tipo) {
        case "rascunho":
            nomeArquivo = args.nome_arquivo || `rascunho-${timestamp}.md`;
            targetPath = `${diretorio}/.maestro/rascunhos/${nomeArquivo}`;
            break;
        case "anexo":
            nomeArquivo = args.nome_arquivo || `anexo-${timestamp}.md`;
            targetPath = `${diretorio}/docs/${faseDirName}/anexos/${nomeArquivo}`;
            break;
        case "entregavel":
            nomeArquivo = args.nome_arquivo || `entregavel-${timestamp}.md`;
            targetPath = `${diretorio}/docs/${faseDirName}/${nomeArquivo}`;
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
        tool: "avancar",
        description: "Validar e avançar com o entregável salvo",
        args_template: { entregavel: "{{conteudo}}", diretorio },
        requires_user_input: false,
        auto_execute: false,
    } : {
        tool: "status",
        description: "Verificar status atual do projeto",
        args_template: { diretorio },
        requires_user_input: false,
    };

    // v5.2: Embute metadados no content + files como instrução inline
    const fileInstruction: { type: "text"; text: string } = {
        type: "text",
        text: `## ⚡ AÇÃO OBRIGATÓRIA - Salvar Arquivo\n\n**Caminho:** \`${targetPath}\`\n**Tamanho:** ${args.conteudo.length} caracteres\n\n> A IA DEVE salvar o conteúdo no caminho indicado acima.`,
    };

    const content = embedNextAction(
        [{ type: "text", text: resposta }, fileInstruction],
        next_action
    );

    return {
        content,
        files: [{
            path: targetPath,
            content: args.conteudo
        }],
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
