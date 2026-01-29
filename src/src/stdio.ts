#!/usr/bin/env node
/**
 * Entry point para modo STDIO (usado por IDEs como command)
 * 
 * Uso: node dist/stdio.js [diretorio]
 * Ou via npx após publicar no npm
 * 
 * Se nenhum diretório for fornecido, usa o diretório de trabalho atual
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

import { iniciarProjeto, confirmarProjeto } from "./tools/iniciar-projeto.js";
import { carregarProjeto } from "./tools/carregar-projeto.js";
import { proximo } from "./tools/proximo.js";
import { status } from "./tools/status.js";
import { validarGate } from "./tools/validar-gate.js";
import { contexto } from "./tools/contexto.js";
import { classificar } from "./tools/classificar.js";
import { salvar } from "./tools/salvar.js";
import { injetar_conteudo } from "./tools/injetar-conteudo.js";

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

// ==================== TOOLS ====================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "iniciar_projeto",
            description: "Inicia novo projeto (stateless). Retorna arquivos para IA salvar.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    nome: { type: "string", description: "Nome do projeto" },
                    descricao: { type: "string", description: "Descrição opcional" },
                    diretorio: { type: "string", description: "Diretório absoluto do projeto" },
                    ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"], description: "IDE alvo para injection" },
                },
                required: ["nome", "diretorio"],
            },
        },
        {
            name: "confirmar_projeto",
            description: "Confirma criação do projeto com tipo e complexidade. Injeta conteúdo automaticamente.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    nome: { type: "string", description: "Nome do projeto" },
                    descricao: { type: "string", description: "Descrição opcional" },
                    diretorio: { type: "string", description: "Diretório absoluto do projeto" },
                    tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"], description: "Tipo de artefato" },
                    nivel_complexidade: { type: "string", enum: ["simples", "medio", "complexo"], description: "Nível de complexidade" },
                    ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"], description: "IDE alvo para injection" },
                },
                required: ["nome", "diretorio", "tipo_artefato", "nivel_complexidade", "ide"],
            },
        },
        {
            name: "carregar_projeto",
            description: "Carrega projeto existente (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["estado_json", "diretorio"],
            },
        },
        {
            name: "proximo",
            description: "Salva entregável e avança fase (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    entregavel: { type: "string", description: "Conteúdo do entregável" },
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                    nome_arquivo: { type: "string", description: "Nome do arquivo" },
                },
                required: ["entregavel", "estado_json", "diretorio"],
            },
        },
        {
            name: "status",
            description: "Retorna status do projeto (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["estado_json", "diretorio"],
            },
        },
        {
            name: "validar_gate",
            description: "Valida checklist de saída (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    fase: { type: "number", description: "Número da fase" },
                    entregavel: { type: "string", description: "Conteúdo para validar" },
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["estado_json", "diretorio"],
            },
        },
        {
            name: "contexto",
            description: "Retorna contexto do projeto (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["estado_json", "diretorio"],
            },
        },
        {
            name: "classificar",
            description: "Reclassifica complexidade (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    prd: { type: "string", description: "Conteúdo do PRD" },
                    nivel: { type: "string", enum: ["simples", "medio", "complexo"] },
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["estado_json", "diretorio"],
            },
        },
        {
            name: "salvar",
            description: "Salva conteúdo (stateless). Requer estado_json.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    conteudo: { type: "string", description: "Conteúdo a salvar" },
                    tipo: { type: "string", enum: ["rascunho", "anexo", "entregavel"] },
                    estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
                    diretorio: { type: "string", description: "Diretório do projeto" },
                },
                required: ["conteudo", "tipo", "estado_json", "diretorio"],
            },
        },
        {
            name: "injetar_conteudo",
            description: "Injeta conteúdo base (especialistas, templates, guias) no projeto. Use force:true para sobrescrever.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    diretorio: { type: "string", description: "Diretório absoluto do projeto" },
                    source: { type: "string", enum: ["builtin", "custom"], description: "Fonte do conteúdo (padrão: builtin)" },
                    custom_path: { type: "string", description: "Caminho customizado se source=custom" },
                    force: { type: "boolean", description: "Sobrescrever se já existe (padrão: false)" },
                },
                required: ["diretorio"],
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const a = args as Record<string, unknown> | undefined;
    const typedArgs = a || {};

    try {
        switch (name) {
            case "iniciar_projeto":
                return await iniciarProjeto({
                    nome: typedArgs.nome as string,
                    descricao: typedArgs.descricao as string | undefined,
                    diretorio: typedArgs.diretorio as string,
                    ide: typedArgs.ide as "windsurf" | "cursor" | "antigravity" | undefined,
                });
            case "confirmar_projeto":
                return await confirmarProjeto({
                    nome: typedArgs.nome as string,
                    descricao: typedArgs.descricao as string | undefined,
                    diretorio: typedArgs.diretorio as string,
                    tipo_artefato: typedArgs.tipo_artefato as "poc" | "script" | "internal" | "product",
                    nivel_complexidade: typedArgs.nivel_complexidade as "simples" | "medio" | "complexo",
                    ide: typedArgs.ide as "windsurf" | "cursor" | "antigravity",
                });
            case "carregar_projeto":
                return await carregarProjeto({
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                });
            case "proximo":
                return await proximo({
                    entregavel: typedArgs.entregavel as string,
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                    nome_arquivo: typedArgs.nome_arquivo as string | undefined,
                });
            case "status":
                return await status({
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                });
            case "validar_gate":
                return await validarGate({
                    fase: typedArgs.fase as number | undefined,
                    entregavel: typedArgs.entregavel as string | undefined,
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                });
            case "contexto":
                return await contexto({
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                });
            case "classificar":
                return await classificar({
                    prd: typedArgs.prd as string | undefined,
                    nivel: typedArgs.nivel as "simples" | "medio" | "complexo" | undefined,
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                });
            case "salvar":
                return await salvar({
                    conteudo: typedArgs.conteudo as string,
                    tipo: typedArgs.tipo as "rascunho" | "anexo" | "entregavel",
                    estado_json: typedArgs.estado_json as string,
                    diretorio: typedArgs.diretorio as string,
                    nome_arquivo: typedArgs.nome_arquivo as string | undefined,
                });
            case "injetar_conteudo":
                return await injetar_conteudo({
                    diretorio: typedArgs.diretorio as string,
                    source: typedArgs.source as "builtin" | "custom" | undefined,
                    custom_path: typedArgs.custom_path as string | undefined,
                    force: typedArgs.force as boolean | undefined,
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
