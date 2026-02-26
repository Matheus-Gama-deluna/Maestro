/**
 * Factory de servidor MCP do Maestro
 *
 * Cria e configura um Server MCP com todos os handlers registrados.
 * Usado por stdio.ts e http.ts como entry points de transporte.
 *
 * @since v6.0 — Unificação de entry points
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { routeToolCall, getRegisteredTools, getToolCount } from "./router.js";
import { MAESTRO_NAME, MAESTRO_VERSION } from "./constants.js";
import { captureClientCapabilities } from "./services/client-capabilities.service.js";
import { listPrompts, getPrompt } from "./handlers/shared-prompt-handler.js";
import { listResources, readResource } from "./handlers/shared-resource-handler.js";
import { setProjectDirectory } from "./utils/files.js";

/**
 * Cria e configura um servidor MCP do Maestro com todos os handlers.
 *
 * @param projectDir - Diretório base do projeto (de argv ou cwd)
 * @returns Server MCP configurado, pronto para conectar a um transport
 */
export function createMaestroServer(projectDir: string): Server {
    setProjectDirectory(projectDir);

    const server = new Server(
        { name: MAESTRO_NAME, version: MAESTRO_VERSION },
        { capabilities: { resources: {}, tools: {}, prompts: {} } }
    );

    // === RESOURCES ===
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return await listResources({ projectDir, includeSkills: true });
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        return await readResource(uri, { projectDir });
    });

    // === PROMPTS ===
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return listPrompts();
    });

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: promptArgs } = request.params;
        const diretorio = (promptArgs as Record<string, unknown>)?.diretorio as string || projectDir;
        return await getPrompt(name, diretorio);
    });

    // === TOOLS ===
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getRegisteredTools(),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const rawArgs = (args as Record<string, unknown>) || {};
        return await routeToolCall(name, rawArgs);
    });

    // === CLIENT CAPABILITIES ===
    server.oninitialized = () => {
        const clientCaps = server.getClientCapabilities();
        const clientVersion = server.getClientVersion();
        captureClientCapabilities({
            capabilities: clientCaps || {},
            clientInfo: clientVersion || {},
            protocolVersion: "2025-03-26",
        });
        console.error(`[MCP] Client detectado: ${clientVersion?.name || "unknown"} v${clientVersion?.version || "?"}`);
    };

    return server;
}

/**
 * Retorna informações de inicialização para logging.
 */
export function getStartupInfo(projectDir: string): string {
    return `MCP Maestro v${MAESTRO_VERSION} — ${getToolCount()} tools públicas | Dir: ${projectDir}`;
}
