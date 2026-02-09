#!/usr/bin/env node
/**
 * Entry point para modo STDIO (usado por IDEs como command)
 * 
 * Uso: node dist/stdio.js [diretorio]
 * Ou via npx após publicar no npm
 * 
 * v5: Skills como MCP Resources, MCP Prompts capability,
 *     tools consolidadas (8 públicas + legadas backward-compatible)
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
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { setProjectDirectory } from "./utils/files.js";

import { routeToolCall, getRegisteredTools, getToolCount } from "./router.js";
import { MAESTRO_NAME, MAESTRO_VERSION } from "./constants.js";
import { captureClientCapabilities } from "./services/client-capabilities.service.js";
import { listPrompts, getPrompt } from "./handlers/shared-prompt-handler.js";
import { listResources, readResource } from "./handlers/shared-resource-handler.js";

// Criar servidor MCP
const server = new Server(
    {
        name: MAESTRO_NAME,
        version: MAESTRO_VERSION,
    },
    {
        capabilities: {
            resources: {},
            tools: {},
            prompts: {},
        },
    }
);

// ==================== RESOURCES (v5.2: Handler compartilhado) ====================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return await listResources({ projectDir: projectsDir, includeSkills: true });
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    return await readResource(uri, { projectDir: projectsDir });
});

// ==================== PROMPTS (v5.2: Handler Compartilhado) ====================

server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return listPrompts();
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: promptArgs } = request.params;
    const diretorio = (promptArgs as any)?.diretorio || projectsDir;
    return await getPrompt(name, diretorio);
});

// v5.2: Funções de prompt movidas para handlers/shared-prompt-handler.ts

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

// v5.2: Capturar capabilities do client após handshake STDIO
server.oninitialized = () => {
    const clientCaps = server.getClientCapabilities();
    const clientVersion = server.getClientVersion();
    captureClientCapabilities({
        capabilities: clientCaps || {},
        clientInfo: clientVersion || {},
        protocolVersion: "2025-03-26",
    });
    console.error(`[STDIO] Client detectado: ${clientVersion?.name || "unknown"} v${clientVersion?.version || "?"}`);
};

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`MCP Maestro v${MAESTRO_VERSION} (stdio) iniciado — ${getToolCount()} tools públicas`);
    console.error(`Diretório de projetos: ${projectsDir}`);
}

main().catch(console.error);
