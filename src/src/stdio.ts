#!/usr/bin/env node
/**
 * Entry point para modo STDIO (usado por IDEs como command)
 * 
 * Uso: node dist/stdio.js [diretorio]
 * Ou via npx após publicar no npm
 * 
 * Se nenhum diretório for fornecido, usa o diretório de trabalho atual
 * 
 * NOTA: Usa router centralizado (router.ts) para roteamento de tools.
 * Não duplicar switch/case aqui - todas as tools são registradas no router.
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
    setProjectDirectory,
} from "./utils/files.js";

import { routeToolCall, getRegisteredTools, getToolCount } from "./router.js";

// Criar servidor MCP
const server = new Server(
    {
        name: "mcp-maestro",
        version: "4.0.0",
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
        const conteudo = `# Maestro - Instruções para IA (Modo Stateless)

Você está usando o Maestro, um guia de desenvolvimento assistido por IA.

## Modo Stateless

Este MCP opera em modo stateless. A IA deve:
1. Ler arquivos de estado do projeto (.maestro/estado.json)
2. Passar o conteúdo como parâmetro nas chamadas de tools
3. Salvar os arquivos retornados no campo \`files\` das respostas

## Comportamentos Automáticos

Quando o usuário disser "próximo", "avançar", "terminei" ou "pronto":
1. Leia .maestro/estado.json do projeto
2. Identifique o entregável desenvolvido
3. Chame \`proximo\` passando entregavel, estado_json e diretorio
4. Salve os arquivos retornados

## Tools Disponíveis (Stateless)

- \`iniciar_projeto(nome, diretorio)\` - Inicia novo projeto
- \`carregar_projeto(estado_json, diretorio)\` - Carrega projeto existente
- \`proximo(entregavel, estado_json, diretorio)\` - Salva e avança fase
- \`status(estado_json, diretorio)\` - Retorna estado atual
- \`validar_gate(estado_json, diretorio)\` - Valida checklist
- \`classificar(estado_json, diretorio)\` - Reclassifica projeto
- \`contexto(estado_json, diretorio)\` - Retorna contexto
- \`salvar(conteudo, tipo, estado_json, diretorio)\` - Salva rascunhos/anexos
`;
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
});

// ==================== TOOLS (via Router Centralizado) ====================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: getRegisteredTools(),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const rawArgs = (args as Record<string, unknown>) || {};
    return await routeToolCall(name, rawArgs);
});

// ==================== START ====================

// Obter diretório dos argumentos ou usar cwd
const projectsDir = process.argv[2] || process.cwd();

// Configurar diretório padrão para as tools
setProjectDirectory(projectsDir);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`MCP Maestro (stdio) iniciado - Modo Stateless`);
    console.error(`Diretório de projetos: ${projectsDir}`);
}

main().catch(console.error);
