#!/usr/bin/env node
import express, { Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
const PORT = parseInt(process.env.PORT || "3000", 10);
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Interface para sessões SSE
interface SseSession {
    response: Response;
    lastAccess: Date;
    heartbeatInterval: NodeJS.Timeout;
}

// Armazenar sessões ativas (suporta SSE e HTTP simples)
const sessions = new Map<string, SseSession>();

// Limpar sessões inativas a cada 5 minutos
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.lastAccess.getTime() > 30 * 60 * 1000) {
            sessions.delete(id);
        }
    }
}, 5 * 60 * 1000);

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        server: "mcp-maestro",
        version: MAESTRO_VERSION,
        sessions: sessions.size,
    });
});

/**
 * Info endpoint
 */
app.get("/", (req, res) => {
    res.json({
        name: "MCP Maestro",
        version: MAESTRO_VERSION,
        description: "Model Context Protocol server for Maestro development guide",
        endpoints: {
            health: "GET /health",
            mcp: "POST /mcp",
            resources: "GET /resources",
            tools: "GET /tools",
        },
    });
});

/**
 * Lista resources disponíveis (HTTP helper)
 */
app.get("/resources", async (req, res) => {
    try {
        // Simula chamada MCP
        const result = await handleMcpRequest({
            jsonrpc: "2.0",
            id: randomUUID(),
            method: "resources/list",
            params: {},
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

/**
 * Lista tools disponíveis (HTTP helper)
 */
app.get("/tools", async (req, res) => {
    try {
        const result = await handleMcpRequest({
            jsonrpc: "2.0",
            id: randomUUID(),
            method: "tools/list",
            params: {},
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// ============================================
// SSE Transport para MCP (Streamable HTTP)
// ============================================

/**
 * SSE Endpoint - Estabelece conexão Server-Sent Events
 * Clientes como Gemini/Antigravity usam este endpoint
 */
app.get("/mcp", (req, res) => {
    // Verificar se é request SSE
    const accept = req.headers.accept || "";
    if (!accept.includes("text/event-stream")) {
        // Não é SSE, retornar info do endpoint
        res.json({
            name: "MCP Maestro",
            version: MAESTRO_VERSION,
            transport: "streamable-http",
            endpoints: {
                sse: "GET /mcp (Accept: text/event-stream)",
                post: "POST /mcp",
            },
        });
        return;
    }

    // Configurar headers SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Para Nginx/proxies
    res.setHeader("Transfer-Encoding", "chunked"); // Força chunked encoding
    res.flushHeaders();

    // Criar sessão
    const sessionId = randomUUID();

    // Enviar padding inicial para forçar flush através de proxies (Cloudflare, etc.)
    // Alguns proxies bufferam até receber ~1KB de dados
    const padding = ": " + "x".repeat(2048) + "\n\n";
    res.write(padding);

    // Heartbeat para manter conexão viva
    const heartbeatInterval = setInterval(() => {
        try {
            res.write(": heartbeat\n\n");
        } catch {
            // Conexão fechada
            clearInterval(heartbeatInterval);
        }
    }, 25000);

    // Armazenar sessão
    sessions.set(sessionId, {
        response: res,
        lastAccess: new Date(),
        heartbeatInterval,
    });

    // Enviar evento endpoint (obrigatório para MCP Streamable HTTP)
    const endpointUrl = `/mcp?sessionId=${sessionId}`;
    res.write(`event: endpoint\ndata: ${endpointUrl}\n\n`);

    console.log(`[SSE] Session created: ${sessionId}`);

    // Cleanup quando conexão fechar
    req.on("close", () => {
        console.log(`[SSE] Session closed: ${sessionId}`);
        clearInterval(heartbeatInterval);
        sessions.delete(sessionId);
    });
});

/**
 * DELETE /mcp - Encerra sessão SSE
 */
app.delete("/mcp", (req, res) => {
    const sessionId = req.query.sessionId as string;

    if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId);
        if (session) {
            clearInterval(session.heartbeatInterval);
            try {
                session.response.end();
            } catch {
                // Já fechada
            }
        }
        sessions.delete(sessionId);
        res.json({ success: true, message: "Session terminated" });
    } else {
        res.status(404).json({ error: "Session not found" });
    }
});

/**
 * Endpoint principal MCP (JSON-RPC)
 * Suporta tanto HTTP direto quanto SSE via sessionId
 */
app.post("/mcp", async (req, res) => {
    try {
        const request = req.body;
        const sessionId = req.query.sessionId as string | undefined;

        // Atualizar lastAccess da sessão se existir
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId)!;
            session.lastAccess = new Date();
        }

        // Validar request JSON-RPC
        if (!request.jsonrpc || request.jsonrpc !== "2.0") {
            const errorResponse = {
                jsonrpc: "2.0",
                error: { code: -32600, message: "Invalid Request: missing jsonrpc 2.0" },
                id: request.id || null,
            };
            res.status(400).json(errorResponse);
            return;
        }

        if (!request.method) {
            const errorResponse = {
                jsonrpc: "2.0",
                error: { code: -32600, message: "Invalid Request: missing method" },
                id: request.id,
            };
            res.status(400).json(errorResponse);
            return;
        }

        const result = await handleMcpRequest(request);

        // Se tem sessão SSE ativa, enviar resposta por lá também
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId)!;
            try {
                session.response.write(`event: message\ndata: ${JSON.stringify(result)}\n\n`);
            } catch {
                // Sessão SSE pode ter sido fechada
                sessions.delete(sessionId);
            }
        }

        // Sempre responder via HTTP também
        res.json(result);
    } catch (error) {
        console.error("[MCP Error]", error);
        res.status(500).json({
            jsonrpc: "2.0",
            error: { code: -32603, message: String(error) },
            id: req.body?.id || null,
        });
    }
});

/**
 * Processa request MCP
 */
async function handleMcpRequest(request: {
    jsonrpc: string;
    id: string;
    method: string;
    params?: Record<string, unknown>;
}): Promise<object> {
    const { method, params, id } = request;

    try {
        // Simular chamada ao handler do servidor MCP
        // O SDK normalmente usa streams, mas aqui fazemos diretamente
        let result: unknown;

        switch (method) {
            case "resources/list": {
                const resources = await getResourcesList();
                result = resources;
                break;
            }

            case "resources/read": {
                const uri = (params as { uri: string }).uri;
                result = await getResourceContent(uri);
                break;
            }

            case "tools/list": {
                result = await getToolsList();
                break;
            }

            case "tools/call": {
                const { name, arguments: args } = params as {
                    name: string;
                    arguments?: Record<string, unknown>;
                };
                result = await callTool(name, args);
                break;
            }

            case "initialize": {
                // Capturar capabilities do client
                if (params) {
                    captureClientCapabilities(params);
                }
                result = {
                    protocolVersion: SUPPORTED_PROTOCOL_VERSION,
                    serverInfo: { name: MAESTRO_NAME, version: MAESTRO_VERSION },
                    capabilities: { resources: {}, tools: {}, prompts: {} },
                };
                break;
            }

            case "prompts/list": {
                result = await getPromptsList();
                break;
            }

            case "prompts/get": {
                const { name: promptName, arguments: promptArgs } = params as {
                    name: string;
                    arguments?: Record<string, string>;
                };
                result = await getPromptContent(promptName, promptArgs);
                break;
            }

            default:
                return {
                    jsonrpc: "2.0",
                    error: { code: -32601, message: `Method not found: ${method}` },
                    id,
                };
        }

        return {
            jsonrpc: "2.0",
            result,
            id,
        };
    } catch (error) {
        return {
            jsonrpc: "2.0",
            error: { code: -32603, message: String(error) },
            id,
        };
    }
}

// ============================================
// Implementações diretas (bypass do SDK transport)
// ============================================

import { MAESTRO_NAME, MAESTRO_VERSION, SUPPORTED_PROTOCOL_VERSION } from "./constants.js";
import { captureClientCapabilities } from "./services/client-capabilities.service.js";

import { routeToolCall, getRegisteredTools, getToolCount } from "./router.js";
import { listResources as sharedListResources, readResource as sharedReadResource } from "./handlers/shared-resource-handler.js";
import { listPrompts as sharedListPrompts, getPrompt as sharedGetPrompt } from "./handlers/shared-prompt-handler.js";

// v5.2: Usa handler compartilhado para resources (elimina duplicação)
async function getResourcesList() {
    return await sharedListResources();
}

async function getResourceContent(uri: string) {
    return await sharedReadResource(uri);
}

async function getToolsList() {
    return { tools: getRegisteredTools() };
}

async function callTool(name: string, args?: Record<string, unknown>) {
    return await routeToolCall(name, args || {});
}

// v5.2: Usa handler compartilhado para prompts (elimina duplicação)
async function getPromptsList() {
    return sharedListPrompts();
}

async function getPromptContent(name: string, args?: Record<string, string>) {
    const diretorio = args?.diretorio || process.cwd();
    return await sharedGetPrompt(name, diretorio);
}

// ============================================
// Iniciar servidor
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    MCP MAESTRO v${MAESTRO_VERSION}                      ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on http://localhost:${PORT}              ║
║                                                             ║
║  Endpoints:                                                 ║
║    POST /mcp          - MCP JSON-RPC endpoint               ║
║    GET  /health       - Health check                        ║
║    GET  /resources    - List resources                      ║
║    GET  /tools        - List tools                          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
