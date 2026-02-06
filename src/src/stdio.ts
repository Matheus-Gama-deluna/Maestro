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
import { ContentResolverService } from "./services/content-resolver.service.js";
import { SkillLoaderService } from "./services/skill-loader.service.js";
import { createStateService } from "./services/state.service.js";
import { getSpecialistPersona } from "./services/specialist.service.js";
import { getFaseComStitch } from "./flows/types.js";
import { getSkillParaFase } from "./utils/prompt-mapper.js";

// Criar servidor MCP
const server = new Server(
    {
        name: "mcp-maestro",
        version: "5.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
            prompts: {},
        },
    }
);

// ==================== RESOURCES (v5: Skills expandidas) ====================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const especialistas = await listarEspecialistas();
    const templates = await listarTemplates();
    const guias = await listarGuias();

    // v5: Listar skills como resources estruturados
    const contentResolver = new ContentResolverService(projectsDir);
    const skills = await contentResolver.listAvailableSkills();

    const skillResources = [];
    for (const skillName of skills) {
        // SKILL.md principal
        skillResources.push({
            uri: `maestro://skills/${skillName}/SKILL.md`,
            name: `Skill: ${skillName}`,
            mimeType: "text/markdown",
        });

        // Templates da skill
        const skillTemplates = await contentResolver.listSkillResources(skillName, "templates");
        for (const t of skillTemplates) {
            skillResources.push({
                uri: `maestro://skills/${skillName}/templates/${t}`,
                name: `${skillName} Template: ${t}`,
                mimeType: "text/markdown",
            });
        }

        // Checklists da skill
        const checklists = await contentResolver.listSkillResources(skillName, "checklists");
        for (const c of checklists) {
            skillResources.push({
                uri: `maestro://skills/${skillName}/checklists/${c}`,
                name: `${skillName} Checklist: ${c}`,
                mimeType: "text/markdown",
            });
        }
    }

    return {
        resources: [
            // v5: Skills estruturadas (prioridade)
            ...skillResources,

            // Legacy: especialistas, templates, guias
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

    // v5: Skills como resources
    if (uri.startsWith("maestro://skills/")) {
        const path = uri.replace("maestro://skills/", "");
        const parts = path.split("/");
        const skillName = parts[0];
        const contentResolver = new ContentResolverService(projectsDir);

        if (parts.length === 2 && parts[1] === "SKILL.md") {
            // maestro://skills/{skill}/SKILL.md
            const content = await contentResolver.readSkillFile(skillName, "SKILL.md");
            if (!content) throw new Error(`SKILL.md não encontrado: ${skillName}`);
            return { contents: [{ uri, mimeType: "text/markdown", text: content }] };
        }

        if (parts.length === 3) {
            // maestro://skills/{skill}/{tipo}/{arquivo}
            const tipo = parts[1] as "templates" | "checklists" | "examples" | "reference";
            const arquivo = parts[2];
            const content = await contentResolver.readSkillResource(skillName, tipo, arquivo);
            if (!content) throw new Error(`Resource não encontrado: ${uri}`);
            return { contents: [{ uri, mimeType: "text/markdown", text: content }] };
        }
    }

    // Legacy: especialistas
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
        const conteudo = `# Maestro v5 — Instruções para IA

Você está usando o Maestro v5, um orquestrador de desenvolvimento assistido por IA.

## Modo Híbrido (v5)

O Maestro v5 opera em modo híbrido:
- **Estado carregado automaticamente** de .maestro/estado.json (não precisa passar como parâmetro)
- **Skills injetadas ativamente** nas respostas das tools (não precisa ler manualmente)
- **Persistência automática** — o MCP salva estado e arquivos diretamente
- **Fallback stateless** — estado_json como parâmetro ainda aceito para compatibilidade

## Comportamentos Automáticos

Quando o usuário disser "próximo", "avançar", "terminei" ou "pronto":
1. Chame \`avancar(diretorio: "<path>")\`
2. O Maestro detecta contexto automaticamente
3. O contexto do especialista já vem incluído na resposta
4. Siga as instruções do especialista e template retornados

## Tools Disponíveis (v5 Consolidadas)

| Tool | Descrição |
|------|-----------|
| \`maestro(diretorio)\` | Entry point inteligente — detecta contexto e guia |
| \`avancar(diretorio, entregavel?)\` | Avança fase (onboarding ou desenvolvimento) |
| \`status(diretorio)\` | Status completo do projeto |
| \`validar(diretorio, tipo?)\` | Valida gate, entregável ou compliance |
| \`contexto(diretorio)\` | Contexto acumulado (ADRs, padrões) |
| \`salvar(diretorio, conteudo, tipo)\` | Salva rascunhos/anexos |
| \`checkpoint(diretorio, acao)\` | Gerencia checkpoints e rollbacks |
| \`analisar(diretorio, tipo?)\` | Análise de código (segurança, qualidade, etc.) |

> **Nota:** Tools legadas (proximo, validar_gate, etc.) ainda funcionam para backward compatibility.
`;
        return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }

    throw new Error(`Resource não encontrado: ${uri}`);
});

// ==================== PROMPTS (v5: System Prompt Automático) ====================

server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "maestro-specialist",
                description: "Persona + instruções do especialista da fase atual do projeto",
                arguments: [
                    {
                        name: "diretorio",
                        description: "Diretório do projeto",
                        required: true,
                    },
                ],
            },
            {
                name: "maestro-context",
                description: "Contexto completo do projeto para a sessão de trabalho",
                arguments: [
                    {
                        name: "diretorio",
                        description: "Diretório do projeto",
                        required: true,
                    },
                ],
            },
            {
                name: "maestro-template",
                description: "Template do entregável esperado para a fase atual",
                arguments: [
                    {
                        name: "diretorio",
                        description: "Diretório do projeto",
                        required: true,
                    },
                ],
            },
        ],
    };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: promptArgs } = request.params;
    const diretorio = (promptArgs as any)?.diretorio || projectsDir;

    if (name === "maestro-specialist") {
        return await buildSpecialistPrompt(diretorio);
    }

    if (name === "maestro-context") {
        return await buildContextPrompt(diretorio);
    }

    if (name === "maestro-template") {
        return await buildTemplatePrompt(diretorio);
    }

    throw new Error(`Prompt não encontrado: ${name}`);
});

/**
 * Constrói prompt dinâmico do especialista da fase atual.
 */
async function buildSpecialistPrompt(diretorio: string) {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) {
        return {
            description: "Nenhum projeto encontrado",
            messages: [{
                role: "user" as const,
                content: { type: "text" as const, text: "Nenhum projeto ativo neste diretório. Use `maestro(diretorio)` para começar." },
            }],
        };
    }

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    if (!faseInfo) {
        return {
            description: `Projeto: ${estado.nome}`,
            messages: [{
                role: "user" as const,
                content: { type: "text" as const, text: `Projeto ${estado.nome} — fase ${estado.fase_atual} não encontrada no fluxo.` },
            }],
        };
    }

    const mode = (estado.config?.mode || "balanced") as "economy" | "balanced" | "quality";
    const contentResolver = new ContentResolverService(diretorio);
    const skillLoader = new SkillLoaderService(contentResolver);

    try {
        const contextPkg = await skillLoader.loadForPhase(faseInfo.nome, mode);

        if (contextPkg) {
            return {
                description: `Especialista: ${contextPkg.specialist?.name || faseInfo.nome} — Fase ${estado.fase_atual}/${estado.total_fases}`,
                messages: [{
                    role: "user" as const,
                    content: {
                        type: "text" as const,
                        text: `# Especialista da Fase: ${faseInfo.nome}\n\n${skillLoader.formatAsMarkdown(contextPkg)}`,
                    },
                }],
            };
        }
    } catch (error) {
        console.warn("[Prompt] Falha ao carregar skill:", error);
    }

    // Fallback: persona básica
    const specialist = getSpecialistPersona(faseInfo.nome);
    return {
        description: `Especialista: ${specialist?.name || faseInfo.nome}`,
        messages: [{
            role: "user" as const,
            content: {
                type: "text" as const,
                text: specialist
                    ? `# ${specialist.name}\n\n**Tom:** ${specialist.tone}\n**Expertise:** ${specialist.expertise.join(", ")}\n**Instruções:** ${specialist.instructions}`
                    : `Fase ${estado.fase_atual}: ${faseInfo.nome}`,
            },
        }],
    };
}

/**
 * Constrói prompt de contexto completo do projeto.
 */
async function buildContextPrompt(diretorio: string) {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) {
        return {
            description: "Nenhum projeto encontrado",
            messages: [{
                role: "user" as const,
                content: { type: "text" as const, text: "Nenhum projeto ativo neste diretório." },
            }],
        };
    }

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);

    const contextText = `# Contexto do Projeto: ${estado.nome}

## Estado
| Campo | Valor |
|-------|-------|
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Fase Atual** | ${estado.fase_atual}/${estado.total_fases} — ${faseInfo?.nome || "N/A"} |
| **Gates Validados** | ${estado.gates_validados?.join(", ") || "nenhum"} |

## Entregáveis Salvos
${Object.entries(estado.entregaveis || {}).map(([k, v]) => `- **${k}:** ${v}`).join("\n") || "Nenhum ainda."}

## Próximo Passo
Trabalhe com o especialista **${faseInfo?.especialista || "N/A"}** para gerar: **${faseInfo?.entregavel_esperado || "N/A"}**
`;

    return {
        description: `Projeto: ${estado.nome} — Fase ${estado.fase_atual}/${estado.total_fases}`,
        messages: [{
            role: "user" as const,
            content: { type: "text" as const, text: contextText },
        }],
    };
}

/**
 * Constrói prompt do template da fase atual.
 */
async function buildTemplatePrompt(diretorio: string) {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) {
        return {
            description: "Nenhum projeto encontrado",
            messages: [{
                role: "user" as const,
                content: { type: "text" as const, text: "Nenhum projeto ativo neste diretório." },
            }],
        };
    }

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    if (!faseInfo) {
        return {
            description: `Projeto: ${estado.nome}`,
            messages: [{
                role: "user" as const,
                content: { type: "text" as const, text: `Projeto ${estado.nome} — fase ${estado.fase_atual} não encontrada.` },
            }],
        };
    }

    const contentResolver = new ContentResolverService(diretorio);
    const skillLoader = new SkillLoaderService(contentResolver);

    try {
        const templateContent = await skillLoader.loadTemplate(faseInfo.nome);

        if (templateContent) {
            return {
                description: `Template: ${faseInfo.entregavel_esperado || faseInfo.nome}`,
                messages: [{
                    role: "user" as const,
                    content: {
                        type: "text" as const,
                        text: `# Template do Entregável: ${faseInfo.entregavel_esperado || faseInfo.nome}

## Fase ${estado.fase_atual}/${estado.total_fases}: ${faseInfo.nome}

Use este template como base para gerar o entregável:

---

${templateContent}

---

> 💡 Dica: Preencha todas as seções marcadas com [...] ou indicadores de conteúdo.`,
                    },
                }],
            };
        }
    } catch (error) {
        console.warn("[Prompt] Falha ao carregar template:", error);
    }

    // Fallback: estrutura básica
    return {
        description: `Template: ${faseInfo.entregavel_esperado || faseInfo.nome}`,
        messages: [{
            role: "user" as const,
            content: {
                type: "text" as const,
                text: `# Template do Entregável: ${faseInfo.entregavel_esperado || faseInfo.nome}

## Fase ${estado.fase_atual}/${estado.total_fases}: ${faseInfo.nome}

### Estrutura Esperada

${faseInfo.gate_checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

---

> ℹ️ Template específico não disponível. Use a lista acima como guia.`,
            },
        }],
    };
}

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
    console.error(`MCP Maestro v5 (stdio) iniciado — ${getToolCount()} tools públicas`);
    console.error(`Diretório de projetos: ${projectsDir}`);
}

main().catch(console.error);
