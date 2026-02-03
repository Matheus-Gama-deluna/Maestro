#!/usr/bin/env node
import express, { Response } from "express";
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
            version: "1.0.0",
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

import { iniciarProjeto, confirmarProjeto } from "./tools/iniciar-projeto.js";
import { carregarProjeto } from "./tools/carregar-projeto.js";
import { proximo } from "./tools/proximo.js";
import { status } from "./tools/status.js";
import { validarGate } from "./tools/validar-gate.js";
import { classificar } from "./tools/classificar.js";
import { contexto } from "./tools/contexto.js";
import { salvar } from "./tools/salvar.js";
import { implementarHistoria } from "./tools/implementar-historia.js";
import { novaFeature, corrigirBug, refatorar } from "./tools/fluxos-alternativos.js";
import { aprovarGate } from "./tools/aprovar-gate.js";
import { confirmarClassificacao } from "./tools/confirmar-classificacao.js";

// Definição das tools para exibição como resources no seletor @mcp:maestro:
const TOOLS_AS_RESOURCES = [
    { name: "iniciar_projeto", emoji: "🚀", desc: "Inicia novo projeto (Analisa e Sugere)", params: "nome, diretorio, [descricao]" },
    { name: "confirmar_projeto", emoji: "✅", desc: "Confirma criação com tipo definido", params: "nome, diretorio, tipo_artefato, nivel_complexidade" },
    { name: "carregar_projeto", emoji: "📂", desc: "Carrega projeto existente", params: "estado_json, diretorio" },
    { name: "proximo", emoji: "➡️", desc: "Salva entregável e avança fase", params: "entregavel, estado_json, diretorio" },
    { name: "status", emoji: "📊", desc: "Retorna status do projeto", params: "estado_json, diretorio" },
    { name: "validar_gate", emoji: "✅", desc: "Valida checklist de saída", params: "estado_json, diretorio, [fase], [entregavel]" },
    { name: "classificar", emoji: "📏", desc: "Reclassifica complexidade", params: "estado_json, diretorio, [prd], [nivel]" },
    { name: "contexto", emoji: "📋", desc: "Retorna contexto acumulado", params: "estado_json, diretorio" },
    { name: "salvar", emoji: "💾", desc: "Salva rascunhos/anexos", params: "conteudo, tipo, estado_json, diretorio" },
    { name: "implementar_historia", emoji: "📝", desc: "Orquestra implementação de história", params: "[historia_id], [modo]" },
    { name: "nova_feature", emoji: "✨", desc: "Inicia fluxo de nova feature", params: "descricao, [impacto_estimado]" },
    { name: "corrigir_bug", emoji: "🐛", desc: "Inicia fluxo de correção de bug", params: "descricao, [severidade], [ticket_id]" },
    { name: "refatorar", emoji: "♻️", desc: "Inicia fluxo de refatoração", params: "area, motivo" },
    { name: "aprovar_gate", emoji: "🔐", desc: "USUÁRIO: Aprova/rejeita gate pendente", params: "acao, estado_json, diretorio" },
    { name: "confirmar_classificacao", emoji: "🧐", desc: "Confirma reclassificação pós-PRD", params: "estado_json, diretorio, [nivel]" },
];

// Gera instrução de execução para uma tool
function getToolDocumentation(toolName: string): string {
    const tool = TOOLS_AS_RESOURCES.find(t => t.name === toolName);
    if (!tool) return `Tool não encontrada: ${toolName}`;

    // Instruções específicas por tool
    const instrucoes: Record<string, string> = {
        iniciar_projeto: `Pergunte ao usuário:
1. Nome do projeto
2. Descrição breve (opcional)
3. Diretório (padrão: diretório atual)

Depois execute \`mcp_maestro_iniciar_projeto\` com esses dados.
A tool retornará uma sugestão de classificação. Peça confirmação ao usuário.`,

        confirmar_projeto: `Use APÓS \`iniciar_projeto\` ter retornado uma sugestão.
Execute \`mcp_maestro_confirmar_projeto\` com os dados confirmados pelo usuário (tipo e nível).
Isso criará efetivamente os arquivos do projeto.`,

        carregar_projeto: `Procure o arquivo \`.maestro/estado.json\` no diretório atual.
Se encontrar, leia o conteúdo e execute \`mcp_maestro_carregar_projeto\`.
Se não encontrar, avise o usuário que não há projeto Maestro neste diretório.`,

        status: `Procure o arquivo \`.maestro/estado.json\` no diretório atual.
Se encontrar, leia o conteúdo e execute \`mcp_maestro_status\`.
Mostre: fase atual, especialista, progresso e próximos passos.`,

        proximo: `1. Leia o arquivo \`.maestro/estado.json\`
2. Compile o entregável da fase atual baseado na conversa
3. Execute \`mcp_maestro_proximo\` com o entregável
4. Salve o novo estado no arquivo`,

        validar_gate: `1. Leia o arquivo \`.maestro/estado.json\`
2. Execute \`mcp_maestro_validar_gate\`
3. Mostre o resultado do checklist`,

        classificar: `1. Leia o arquivo \`.maestro/estado.json\`
2. Execute \`mcp_maestro_classificar\` com o nível desejado
3. Atualize o arquivo de estado`,

        contexto: `1. Leia o arquivo \`.maestro/estado.json\`
2. Execute \`mcp_maestro_contexto\`
3. Mostre o contexto acumulado do projeto`,

        salvar: `Use quando o usuário quiser salvar um rascunho ou anexo.
Execute \`mcp_maestro_salvar\` com o conteúdo e tipo.`,

        implementar_historia: `Use para implementar uma história do backlog.
Execute \`mcp_maestro_implementar_historia\` com o ID da história.`,

        nova_feature: `Pergunte a descrição da feature e impacto estimado.
Execute \`mcp_maestro_nova_feature\`.`,

        corrigir_bug: `Pergunte a descrição do bug e severidade.
Execute \`mcp_maestro_corrigir_bug\`.`,

        refatorar: `Pergunte a área e motivo da refatoração.
Execute \`mcp_maestro_refatorar\`.`,

        confirmar_classificacao: `Use quando o projeto estiver aguardando confirmação de classificação.
Execute \`mcp_maestro_confirmar_classificacao\`.
Mostre o resultado.`,
    };

    return `## 🎯 EXECUTE AGORA: ${tool.emoji} ${tool.name}

${tool.desc}

### Parâmetros
\`${tool.params}\`

### Instruções
${instrucoes[toolName] || `Execute \`mcp_maestro_${toolName}\` com os parâmetros necessários.`}

---
**AÇÃO REQUERIDA**: Execute a tool acima imediatamente. Se precisar de informações do usuário, pergunte primeiro.
`;
}

async function getResourcesList() {
    // Expõe apenas as tools no seletor @mcp:maestro:
    // Especialistas, templates e guias continuam acessíveis via URI direta
    return {
        resources: TOOLS_AS_RESOURCES.map((t) => ({
            uri: `maestro://tool/${t.name}`,
            name: `${t.emoji} ${t.name}`,
            description: t.desc,
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
    return {
        tools: [
            // Core (Stateless) - requer estado_json e diretorio
            { name: "iniciar_projeto", description: "Analisa novo projeto e sugere classificação (stateless). NÃO CRIA ARQUIVOS.", inputSchema: { type: "object", properties: { nome: { type: "string" }, descricao: { type: "string" }, diretorio: { type: "string" }, ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"] } }, required: ["nome", "diretorio"] } },
            { name: "confirmar_projeto", description: "Cria efetivamente o projeto com classificação confirmada.", inputSchema: { type: "object", properties: { nome: { type: "string" }, descricao: { type: "string" }, diretorio: { type: "string" }, tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"] }, nivel_complexidade: { type: "string", enum: ["simples", "medio", "complexo"] }, ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"] } }, required: ["nome", "diretorio", "tipo_artefato", "nivel_complexidade", "ide"] } },
            { name: "carregar_projeto", description: "Carrega projeto existente (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["estado_json", "diretorio"] } },
            { name: "proximo", description: "Salva entregável e avança fase (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { entregavel: { type: "string" }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["entregavel", "estado_json", "diretorio"] } },
            { name: "status", description: "Retorna status do projeto (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["estado_json", "diretorio"] } },
            { name: "validar_gate", description: "Valida checklist de saída (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { fase: { type: "number" }, entregavel: { type: "string" }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["estado_json", "diretorio"] } },
            { name: "aprovar_gate", description: "🔐 EXCLUSIVO DO USUÁRIO. Aprova ou rejeita avanço com pendências. IA NÃO deve chamar automaticamente.", inputSchema: { type: "object", properties: { acao: { type: "string", enum: ["aprovar", "rejeitar"] }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["acao", "estado_json", "diretorio"] } },
            // V1.0 (Stateless)
            { name: "classificar", description: "Reclassifica complexidade (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { prd: { type: "string" }, nivel: { type: "string", enum: ["simples", "medio", "complexo"] }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["estado_json", "diretorio"] } },
            { name: "contexto", description: "Retorna contexto do projeto (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["estado_json", "diretorio"] } },
            { name: "salvar", description: "Salva conteúdo (stateless). Requer estado_json.", inputSchema: { type: "object", properties: { conteudo: { type: "string" }, tipo: { type: "string", enum: ["rascunho", "anexo", "entregavel"] }, estado_json: { type: "string" }, diretorio: { type: "string" } }, required: ["conteudo", "tipo", "estado_json", "diretorio"] } },
            { name: "implementar_historia", description: "Orquestra implementação de história", inputSchema: { type: "object", properties: { historia_id: { type: "string" }, modo: { type: "string", enum: ["analisar", "iniciar", "proximo_bloco"] } } } },
            // Fluxos Alternativos
            { name: "nova_feature", description: "Inicia fluxo de nova feature", inputSchema: { type: "object", properties: { descricao: { type: "string" }, impacto_estimado: { type: "string", enum: ["baixo", "medio", "alto"] } }, required: ["descricao"] } },
            { name: "corrigir_bug", description: "Inicia fluxo de correção de bug", inputSchema: { type: "object", properties: { descricao: { type: "string" }, severidade: { type: "string", enum: ["critica", "alta", "media", "baixa"] }, ticket_id: { type: "string" } }, required: ["descricao"] } },
            { name: "refatorar", description: "Inicia fluxo de refatoração", inputSchema: { type: "object", properties: { area: { type: "string" }, motivo: { type: "string" } }, required: ["area", "motivo"] } },
            { name: "confirmar_classificacao", description: "Confirma e efetiva a reclassificação após PRD", inputSchema: { type: "object", properties: { estado_json: { type: "string" }, diretorio: { type: "string" }, nivel: { type: "string", enum: ["simples", "medio", "complexo"] }, tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"] } }, required: ["estado_json", "diretorio"] } },
        ],
    };
}

async function callTool(name: string, args?: Record<string, unknown>) {
    const a = args || {};
    try {
        switch (name) {
            case "iniciar_projeto":
                return await iniciarProjeto({ nome: a.nome as string, descricao: a.descricao as string | undefined, diretorio: a.diretorio as string, ide: a.ide as "windsurf" | "cursor" | "antigravity" | undefined, modo: a.modo as "economy" | "balanced" | "quality" | undefined });
            case "confirmar_projeto":
                return await confirmarProjeto({ nome: a.nome as string, descricao: a.descricao as string | undefined, diretorio: a.diretorio as string, tipo_artefato: a.tipo_artefato as any, nivel_complexidade: a.nivel_complexidade as any, ide: a.ide as any, modo: a.modo as any });
            case "carregar_projeto":
                return await carregarProjeto({ estado_json: a.estado_json as string, diretorio: a.diretorio as string });
            case "proximo":
                return await proximo({ entregavel: a.entregavel as string, estado_json: a.estado_json as string, nome_arquivo: a.nome_arquivo as string | undefined, diretorio: a.diretorio as string });
            case "status":
                return await status({ estado_json: a.estado_json as string, diretorio: a.diretorio as string });
            case "validar_gate":
                return await validarGate({ fase: a.fase as number | undefined, entregavel: a.entregavel as string | undefined, estado_json: a.estado_json as string, diretorio: a.diretorio as string });
            case "classificar":
                return await classificar({ prd: a.prd as string | undefined, nivel: a.nivel as "simples" | "medio" | "complexo" | undefined, estado_json: a.estado_json as string, diretorio: a.diretorio as string });
            case "contexto":
                return await contexto({ estado_json: a.estado_json as string, diretorio: a.diretorio as string });
            case "salvar":
                return await salvar({ conteudo: a.conteudo as string, tipo: a.tipo as "rascunho" | "anexo" | "entregavel", estado_json: a.estado_json as string, nome_arquivo: a.nome_arquivo as string | undefined, diretorio: a.diretorio as string });
            case "implementar_historia":
                return await implementarHistoria({ historia_id: a.historia_id as string | undefined, modo: a.modo as "analisar" | "iniciar" | "proximo_bloco" | undefined });
            case "nova_feature":
                return await novaFeature({ descricao: a.descricao as string, impacto_estimado: a.impacto_estimado as "baixo" | "medio" | "alto" | undefined });
            case "corrigir_bug":
                return await corrigirBug({ descricao: a.descricao as string, severidade: a.severidade as "critica" | "alta" | "media" | "baixa" | undefined, ticket_id: a.ticket_id as string | undefined });
            case "refatorar":
                return await refatorar({ area: a.area as string, motivo: a.motivo as string });
            case "aprovar_gate":
                return await aprovarGate({ acao: a.acao as "aprovar" | "rejeitar", estado_json: a.estado_json as string, diretorio: a.diretorio as string });
            case "confirmar_classificacao":
                return await confirmarClassificacao({ estado_json: a.estado_json as string, diretorio: a.diretorio as string, nivel: a.nivel as any, tipo_artefato: a.tipo_artefato as any });
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
