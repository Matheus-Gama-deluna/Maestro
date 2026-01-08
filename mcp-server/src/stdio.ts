#!/usr/bin/env node
/**
 * Entry point para modo STDIO (usado por IDEs como command)
 * 
 * Uso: node dist/stdio.js
 * Ou via npx após publicar no npm
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
    listarEspecialistas,
    listarTemplates,
    listarGuias,
    lerEspecialista,
    lerTemplate,
    lerGuia,
    lerPrompt,
} from "./utils/files.js";

import { iniciarProjeto } from "./tools/iniciar-projeto.js";
import { proximo } from "./tools/proximo.js";
import { status } from "./tools/status.js";
import { validarGate } from "./tools/validar-gate.js";

// Criar servidor MCP
const server = new Server(
    {
        name: "mcp-maestro",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

// ==================== RESOURCES ====================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const especialistas = await listarEspecialistas();
    const templates = await listarTemplates();
    const guias = await listarGuias();

    return {
        resources: [
            ...especialistas.map((e) => ({
                uri: `maestro://especialista/${encodeURIComponent(e)}`,
                name: `Especialista: ${e}`,
                mimeType: "text/markdown",
            })),
            ...templates.map((t) => ({
                uri: `maestro://template/${encodeURIComponent(t)}`,
                name: `Template: ${t}`,
                mimeType: "text/markdown",
            })),
            ...guias.map((g) => ({
                uri: `maestro://guia/${encodeURIComponent(g)}`,
                name: `Guia: ${g}`,
                mimeType: "text/markdown",
            })),
            {
                uri: "maestro://system-prompt",
                name: "System Prompt",
                mimeType: "text/markdown",
            },
        ],
    };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (uri.startsWith("maestro://especialista/")) {
        const nome = decodeURIComponent(uri.replace("maestro://especialista/", ""));
        const conteudo = await lerEspecialista(nome);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    if (uri.startsWith("maestro://template/")) {
        const nome = decodeURIComponent(uri.replace("maestro://template/", ""));
        const conteudo = await lerTemplate(nome);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    if (uri.startsWith("maestro://guia/")) {
        const nome = decodeURIComponent(uri.replace("maestro://guia/", ""));
        const conteudo = await lerGuia(nome);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    if (uri.startsWith("maestro://prompt/")) {
        const path = uri.replace("maestro://prompt/", "");
        const [categoria, nome] = path.split("/");
        const conteudo = await lerPrompt(decodeURIComponent(categoria), decodeURIComponent(nome));
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    if (uri === "maestro://system-prompt") {
        const conteudo = `# Maestro - Instruções para IA

Você está usando o Maestro, um guia de desenvolvimento assistido por IA.

## Comportamentos Automáticos

Quando o usuário disser "próximo", "avançar", "terminei" ou "pronto":
1. Identifique o entregável desenvolvido na conversa
2. Chame a tool \`proximo\` passando o entregável
3. Aguarde a resposta com a próxima fase

## Tools Disponíveis

- \`iniciar_projeto\` - Inicia novo projeto
- \`proximo\` - Salva entregável e avança fase
- \`status\` - Retorna estado atual
- \`validar_gate\` - Valida checklist da fase
- \`classificar\` - Reclassifica complexidade do projeto
- \`contexto\` - Retorna contexto acumulado
- \`salvar\` - Salva rascunhos ou anexos
`;
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
});

// ==================== TOOLS ====================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "iniciar_projeto",
            description: "Inicia um novo projeto com o Maestro",
            inputSchema: {
                type: "object" as const,
                properties: {
                    nome: { type: "string", description: "Nome do projeto" },
                    descricao: { type: "string", description: "Descrição opcional" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["nome"],
            },
        },
        {
            name: "proximo",
            description: "Salva entregável e avança para próxima fase",
            inputSchema: {
                type: "object" as const,
                properties: {
                    entregavel: { type: "string", description: "Conteúdo do entregável" },
                    forcar: { type: "boolean", description: "Forçar avanço" },
                    nome_arquivo: { type: "string", description: "Nome do arquivo" },
                },
                required: ["entregavel"],
            },
        },
        {
            name: "status",
            description: "Retorna status do projeto",
            inputSchema: { type: "object" as const, properties: {} },
        },
        {
            name: "validar_gate",
            description: "Valida checklist de saída da fase",
            inputSchema: {
                type: "object" as const,
                properties: {
                    fase: { type: "number", description: "Número da fase" },
                    entregavel: { type: "string", description: "Conteúdo para validar" },
                },
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const typedArgs = args as Record<string, unknown> | undefined;

    try {
        switch (name) {
            case "iniciar_projeto":
                return await iniciarProjeto({
                    nome: typedArgs?.nome as string,
                    descricao: typedArgs?.descricao as string | undefined,
                    diretorio: typedArgs?.diretorio as string | undefined,
                });
            case "proximo":
                return await proximo({
                    entregavel: typedArgs?.entregavel as string,
                    forcar: typedArgs?.forcar as boolean | undefined,
                    nome_arquivo: typedArgs?.nome_arquivo as string | undefined,
                });
            case "status":
                return await status();
            case "validar_gate":
                return await validarGate({
                    fase: typedArgs?.fase as number | undefined,
                    entregavel: typedArgs?.entregavel as string | undefined,
                });
            default:
                return {
                    content: [{ type: "text" as const, text: `Tool não encontrada: ${name}` }],
                    isError: true,
                };
        }
    } catch (error) {
        return {
            content: [{ type: "text" as const, text: `Erro: ${String(error)}` }],
            isError: true,
        };
    }
});

// ==================== START ====================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Maestro (stdio) iniciado");
}

main().catch(console.error);
