#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { createMcpServer } from "./server.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Criar servidor MCP
const mcpServer = createMcpServer();

// Armazenar sessões ativas
const sessions = new Map<string, { lastAccess: Date }>();

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
        version: "1.0.0",
        sessions: sessions.size,
    });
});

/**
 * Info endpoint
 */
app.get("/", (req, res) => {
    res.json({
        name: "MCP Maestro",
        version: "1.0.0",
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

/**
 * Endpoint principal MCP (JSON-RPC)
 */
app.post("/mcp", async (req, res) => {
    try {
        const request = req.body;

        // Validar request JSON-RPC
        if (!request.jsonrpc || request.jsonrpc !== "2.0") {
            res.status(400).json({
                jsonrpc: "2.0",
                error: { code: -32600, message: "Invalid Request: missing jsonrpc 2.0" },
                id: request.id || null,
            });
            return;
        }

        if (!request.method) {
            res.status(400).json({
                jsonrpc: "2.0",
                error: { code: -32600, message: "Invalid Request: missing method" },
                id: request.id,
            });
            return;
        }

        const result = await handleMcpRequest(request);
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
                    serverInfo: { name: "mcp-maestro", version: "1.0.0" },
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

import { iniciarProjeto } from "./tools/iniciar-projeto.js";
import { proximo } from "./tools/proximo.js";
import { status } from "./tools/status.js";
import { validarGate } from "./tools/validar-gate.js";
import { classificar } from "./tools/classificar.js";
import { contexto } from "./tools/contexto.js";
import { salvar } from "./tools/salvar.js";
import { implementarHistoria } from "./tools/implementar-historia.js";
import { novaFeature, corrigirBug, refatorar } from "./tools/fluxos-alternativos.js";

async function getResourcesList() {
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
}

async function getResourceContent(uri: string) {
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
        const conteudo = `# Maestro - Instruções para IA

Você está usando o Maestro, um guia de desenvolvimento assistido por IA.

## Comportamentos Automáticos

Quando o usuário disser "próximo", "avançar", "terminei" ou "pronto":
1. Identifique o entregável desenvolvido na conversa
2. Chame a tool \`proximo\` passando o entregável
3. Aguarde a resposta com a próxima fase

## Tools Disponíveis

### Core
- \`iniciar_projeto\` - Inicia novo projeto
- \`proximo\` - Salva entregável e avança fase
- \`status\` - Retorna estado atual
- \`validar_gate\` - Valida checklist da fase

### Auxiliares
- \`classificar\` - Reclassifica complexidade
- \`contexto\` - Retorna contexto acumulado
- \`salvar\` - Salva rascunhos/anexos
- \`implementar_historia\` - Orquestra implementação

### Fluxos Alternativos
- \`nova_feature\` - Inicia fluxo de feature
- \`corrigir_bug\` - Inicia fluxo de bug fix
- \`refatorar\` - Inicia fluxo de refatoração
`;
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
}

async function getToolsList() {
    return {
        tools: [
            // Core
            { name: "iniciar_projeto", description: "Inicia um novo projeto com o Maestro", inputSchema: { type: "object", properties: { nome: { type: "string" }, descricao: { type: "string" }, diretorio: { type: "string" } }, required: ["nome"] } },
            { name: "proximo", description: "Salva entregável e avança para próxima fase", inputSchema: { type: "object", properties: { entregavel: { type: "string" }, forcar: { type: "boolean" }, nome_arquivo: { type: "string" } }, required: ["entregavel"] } },
            { name: "status", description: "Retorna status do projeto", inputSchema: { type: "object", properties: {} } },
            { name: "validar_gate", description: "Valida checklist de saída da fase", inputSchema: { type: "object", properties: { fase: { type: "number" }, entregavel: { type: "string" } } } },
            // V1.0
            { name: "classificar", description: "Reclassifica complexidade do projeto", inputSchema: { type: "object", properties: { prd: { type: "string" }, nivel: { type: "string", enum: ["simples", "medio", "complexo"] } } } },
            { name: "contexto", description: "Retorna contexto acumulado do projeto", inputSchema: { type: "object", properties: {} } },
            { name: "salvar", description: "Salva conteúdo sem avançar de fase", inputSchema: { type: "object", properties: { conteudo: { type: "string" }, tipo: { type: "string", enum: ["rascunho", "anexo", "entregavel"] }, nome_arquivo: { type: "string" } }, required: ["conteudo", "tipo"] } },
            { name: "implementar_historia", description: "Orquestra implementação de história", inputSchema: { type: "object", properties: { historia_id: { type: "string" }, modo: { type: "string", enum: ["analisar", "iniciar", "proximo_bloco"] } } } },
            // Fluxos Alternativos
            { name: "nova_feature", description: "Inicia fluxo de nova feature", inputSchema: { type: "object", properties: { descricao: { type: "string" }, impacto_estimado: { type: "string", enum: ["baixo", "medio", "alto"] } }, required: ["descricao"] } },
            { name: "corrigir_bug", description: "Inicia fluxo de correção de bug", inputSchema: { type: "object", properties: { descricao: { type: "string" }, severidade: { type: "string", enum: ["critica", "alta", "media", "baixa"] }, ticket_id: { type: "string" } }, required: ["descricao"] } },
            { name: "refatorar", description: "Inicia fluxo de refatoração", inputSchema: { type: "object", properties: { area: { type: "string" }, motivo: { type: "string" } }, required: ["area", "motivo"] } },
        ],
    };
}

async function callTool(name: string, args?: Record<string, unknown>) {
    const a = args || {};
    try {
        switch (name) {
            case "iniciar_projeto":
                return await iniciarProjeto({ nome: a.nome as string, descricao: a.descricao as string | undefined, diretorio: a.diretorio as string | undefined });
            case "proximo":
                return await proximo({ entregavel: a.entregavel as string, forcar: a.forcar as boolean | undefined, nome_arquivo: a.nome_arquivo as string | undefined });
            case "status":
                return await status();
            case "validar_gate":
                return await validarGate({ fase: a.fase as number | undefined, entregavel: a.entregavel as string | undefined });
            case "classificar":
                return await classificar({ prd: a.prd as string | undefined, nivel: a.nivel as "simples" | "medio" | "complexo" | undefined });
            case "contexto":
                return await contexto();
            case "salvar":
                return await salvar({ conteudo: a.conteudo as string, tipo: a.tipo as "rascunho" | "anexo" | "entregavel", nome_arquivo: a.nome_arquivo as string | undefined });
            case "implementar_historia":
                return await implementarHistoria({ historia_id: a.historia_id as string | undefined, modo: a.modo as "analisar" | "iniciar" | "proximo_bloco" | undefined });
            case "nova_feature":
                return await novaFeature({ descricao: a.descricao as string, impacto_estimado: a.impacto_estimado as "baixo" | "medio" | "alto" | undefined });
            case "corrigir_bug":
                return await corrigirBug({ descricao: a.descricao as string, severidade: a.severidade as "critica" | "alta" | "media" | "baixa" | undefined, ticket_id: a.ticket_id as string | undefined });
            case "refatorar":
                return await refatorar({ area: a.area as string, motivo: a.motivo as string });
            default:
                return { content: [{ type: "text", text: `Tool não encontrada: ${name}` }], isError: true };
        }
    } catch (error) {
        return { content: [{ type: "text", text: `Erro: ${String(error)}` }], isError: true };
    }
}

// ============================================
// Iniciar servidor
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    MCP MAESTRO v1.0.0                      ║
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
