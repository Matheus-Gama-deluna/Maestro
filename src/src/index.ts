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
        version: "3.0.0",
        sessions: sessions.size,
    });
});

/**
 * Info endpoint
 */
app.get("/", (req, res) => {
    res.json({
        name: "MCP Maestro",
        version: "3.0.0",
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
            version: "3.0.0",
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
                result = {
                    protocolVersion: "2024-11-05",
                    serverInfo: { name: "mcp-maestro", version: "4.0.0" },
                    capabilities: { resources: {}, tools: {}, prompts: {} },
                };
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

import {
    listarEspecialistas,
    listarTemplates,
    listarGuias,
    lerEspecialista,
    lerTemplate,
    lerGuia,
    lerPrompt,
} from "./utils/files.js";

import { routeToolCall, getRegisteredTools, getToolCount } from "./router.js";

// Gera documentação de uma tool a partir do registry do router
function getToolDocumentation(toolName: string): string {
    const tools = getRegisteredTools();
    const tool = tools.find(t => t.name === toolName);
    if (!tool) return `Tool não encontrada: ${toolName}`;

    return `## 🎯 ${tool.name}

${tool.description}

---
**AÇÃO REQUERIDA**: Execute a tool acima com os parâmetros necessários.
`;
}

async function getResourcesList() {
    // Expõe as tools registradas no router como resources no seletor @mcp:maestro:
    // Especialistas, templates e guias continuam acessíveis via URI direta
    const tools = getRegisteredTools();
    return {
        resources: tools.map((t) => ({
            uri: `maestro://tool/${t.name}`,
            name: t.name,
            description: t.description,
            mimeType: "text/markdown",
        })),
    };
}

async function getResourceContent(uri: string) {
    // Handler para tools (exibidas no seletor @mcp:maestro:)
    if (uri.startsWith("maestro://tool/")) {
        const toolName = uri.replace("maestro://tool/", "");
        const conteudo = getToolDocumentation(toolName);
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    // Handlers para recursos internos (acessíveis via URI direta pela IA)
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
        const conteudo = await lerPrompt(
            decodeURIComponent(categoria),
            decodeURIComponent(nome)
        );
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    if (uri === "maestro://system-prompt") {
        const conteudo = `# Maestro - Instruções OBRIGATÓRIAS para IA

## 🚫 REGRAS ABSOLUTAS (VIOLAÇÃO = FALHA)

1. **NUNCA chame \`aprovar_gate\`** - Esta tool é EXCLUSIVA do usuário humano
2. **NUNCA gere entregáveis SEM LER o especialista e template ANTES**
3. **NUNCA avance sem confirmação EXPLÍCITA do usuário** ("sim", "pode", "avançar")
4. **NUNCA passe entregáveis vazios ou incompletos** para \`proximo()\`
5. **NUNCA pule a leitura de recursos** - é OBRIGATÓRIO para cada fase

---

## 📚 LEITURA OBRIGATÓRIA DE RECURSOS

Para CADA fase, você DEVE executar estes comandos ANTES de gerar qualquer conteúdo:

\`\`\`
// 1. Ler o especialista da fase
read_resource("maestro://especialista/{nome}")

// 2. Ler o template do entregável
read_resource("maestro://template/{nome}")
\`\`\`

### Recursos Disponíveis

| Tipo | URI | Exemplo |
|------|-----|---------|
| Especialista | \`maestro://especialista/{nome}\` | \`maestro://especialista/Gestão de Produto\` |
| Template | \`maestro://template/{nome}\` | \`maestro://template/PRD\` |
| Guia | \`maestro://guia/{nome}\` | \`maestro://guia/Gates de Qualidade\` |

> ⛔ **GERAR ENTREGÁVEL SEM LER RECURSOS = ERRO GRAVE**

---

## 🔄 FLUXO OBRIGATÓRIO DE AVANÇO

1. Chamar \`status()\` para ver fase atual
2. **LER especialista** da fase → OBRIGATÓRIO
3. **LER template** da fase → OBRIGATÓRIO
4. Fazer as perguntas obrigatórias do especialista ao usuário
5. Gerar entregável seguindo TODAS as seções do template
6. **Apresentar ao usuário** e perguntar: "Posso salvar e avançar?"
7. **Aguardar confirmação EXPLÍCITA** ("sim", "pode", "avançar")
8. Chamar \`proximo(entregavel)\`
9. Se bloqueado (score < 70): PARAR e informar ao usuário
10. Repetir para próxima fase

---

## 🔐 Sistema de Proteção de Gates

- **Score >= 70**: Aprovado automaticamente
- **Score 50-69**: BLOQUEADO → Aguardar decisão do usuário
- **Score < 50**: Rejeitado → Corrigir e tentar novamente
- **Entregável < 200 chars**: BLOQUEADO → Desenvolver conteúdo

Quando bloqueado:
- A IA deve INFORMAR o usuário sobre o bloqueio
- A IA deve AGUARDAR o usuário decidir
- A IA NÃO pode chamar \`aprovar_gate\` por conta própria

---

## Tools Disponíveis

### Core
- \`iniciar_projeto\` - Inicia novo projeto
- \`carregar_projeto\` - Carrega projeto existente
- \`proximo\` - Salva entregável e avança fase
- \`status\` - Retorna estado atual
- \`validar_gate\` - Valida checklist da fase

### 🔐 Exclusivo do Usuário
- \`aprovar_gate\` - ⛔ IA NÃO PODE USAR

### Auxiliares
- \`classificar\` - Reclassifica complexidade
- \`contexto\` - Retorna contexto acumulado
- \`salvar\` - Salva rascunhos/anexos
`;
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
}

async function getToolsList() {
    return { tools: getRegisteredTools() };
}

async function callTool(name: string, args?: Record<string, unknown>) {
    return await routeToolCall(name, args || {});
}

// ============================================
// Iniciar servidor
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    MCP MAESTRO v3.0.0                      ║
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
