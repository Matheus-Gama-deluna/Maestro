import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

/**
 * Cria e configura o servidor MCP
 */
export function createMcpServer(): Server {
    const server = new Server(
        {
            name: "mcp-maestro",
            version: "1.0.0",
        },
        {
            capabilities: {
                resources: {},
                tools: {},
                prompts: {},
            },
        }
    );

    // Registrar handlers
    registerResources(server);
    registerTools(server);

    // Handler de erro
    server.onerror = (error) => {
        console.error("[MCP Error]", error);
    };

    return server;
}
