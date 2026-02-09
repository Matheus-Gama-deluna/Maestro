/**
 * Tool: maestro
 * 
 * Entry point inteligente que detecta contexto e retorna o próximo passo.
 * Internamente delega para as tools existentes via flow engine.
 * Reduz a superfície cognitiva de 44 tools para 1 entry point principal.
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction, FlowProgress } from "../types/response.js";
import { formatResponse, formatError, formatArgsPreview as fmtArgs, nextActionToProximoPasso } from "../utils/response-formatter.js";
import { createStateService } from "../services/state.service.js";
import { getNextStep, getFlowProgress, flowStepToNextAction, isInOnboarding } from "../services/flow-engine.js";
import { getSpecialistPersona } from "../services/specialist.service.js";
import { getFaseComStitch } from "../flows/types.js";
import { parsearEstado } from "../state/storage.js";
import { existsSync } from "fs";
import { join } from "path";
import { readFile } from "fs/promises";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { buildResourceLinksBlock, skillResourceLink, templateResourceLink } from "../utils/resource-links.js";
import { loadUserConfig } from "../utils/config.js";
import { forAssistantOnly } from "../services/annotations-fallback.service.js";

interface MaestroArgs {
    diretorio: string;
    input?: string;
    acao?: string;
    estado_json?: string;
    respostas?: Record<string, unknown>;
}

/**
 * Tool: maestro
 * Entry point inteligente — detecta contexto e guia o fluxo
 */
export async function maestroTool(args: MaestroArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: `# 🎯 Maestro — Orquestrador Inteligente

**Uso:**
\`\`\`
maestro(diretorio: "/caminho/do/projeto")
\`\`\`

O Maestro detecta automaticamente o estado do projeto e guia o próximo passo.

## Ações disponíveis
- Sem projeto: inicia novo projeto
- Com projeto: analisa estado e recomenda próxima ação
- Com \`acao\`: executa ação específica
- Com \`input\`: processa texto livre do usuário
`,
            }],
        };
    }

    const stateService = createStateService(args.diretorio);

    // Tentar carregar estado do filesystem ou do argumento
    let estado: EstadoProjeto | null = null;
    
    if (args.estado_json) {
        estado = parsearEstado(args.estado_json);
    }
    
    if (!estado) {
        estado = await stateService.load();
    }

    // Sem projeto: guiar para criação ou executar ação se fornecida
    if (!estado) {
        // Se acao for setup_inicial, executar diretamente
        if (args.acao === "setup_inicial") {
            const { setupInicial } = await import("./setup-inicial.js");
            let params = args.respostas || {};
            if (args.input && Object.keys(params).length === 0) {
                const parsed = parseSetupInput(args.input);
                if (parsed) {
                    params = parsed;
                }
            }
            return setupInicial({
                ide: params.ide as any,
                modo: params.modo as any,
                usar_stitch: params.usar_stitch as boolean | undefined,
                preferencias_stack: params.preferencias_stack as any,
                team_size: params.team_size as any,
            });
        }

        // v5.3: Ação criar_projeto — combina setup + iniciar + confirmar em 1 passo
        if (args.acao === "criar_projeto") {
            return handleCriarProjeto(args);
        }

        return handleNoProject(args.diretorio);
    }

    // Com projeto: analisar estado e recomendar
    const nextStep = getNextStep(estado, args.diretorio);
    const progress = getFlowProgress(estado);
    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    const specialist = faseInfo ? getSpecialistPersona(faseInfo.nome) : null;
    const inOnboarding = isInOnboarding(estado);

    // Montar resposta contextual com formatResponse (v5.1)
    const statusEmoji = inOnboarding ? "🚀" : "📍";
    const phaseLabel = inOnboarding ? "Onboarding" : `Fase ${estado.fase_atual}/${estado.total_fases}`;
    const nextAction = flowStepToNextAction(nextStep);

    // Injeção ativa v5: contexto resumido do especialista
    let specialistContext = "";
    if (!inOnboarding && faseInfo) {
        try {
            const contentResolver = new ContentResolverService(args.diretorio);
            const skillLoader = new SkillLoaderService(contentResolver);
            const contextPkg = await skillLoader.loadForPhase(faseInfo.nome, "economy");
            if (contextPkg) {
                specialistContext = skillLoader.formatAsMarkdown(contextPkg);
            }
        } catch {
            // Fallback silencioso
        }
    }

    const content = formatResponse({
        titulo: `${statusEmoji} Maestro — ${estado.nome}`,
        resumo: `${phaseLabel} — ${faseInfo?.nome || "N/A"}`,
        dados: {
            "Projeto": estado.nome,
            "Nível": estado.nivel.toUpperCase(),
            "Fase": `${phaseLabel} — ${faseInfo?.nome || "N/A"}`,
            ...(specialist ? { "Especialista": specialist.name } : {}),
        },
        progresso: {
            atual: estado.fase_atual,
            total: estado.total_fases,
            percentual: progress.percentage,
        },
        ...(specialist ? {
            especialista: {
                nome: specialist.name,
                tom: specialist.tone,
                expertise: specialist.expertise,
            },
        } : {}),
        instrucoes: specialistContext || undefined,
        proximo_passo: {
            tool: nextStep.tool,
            descricao: nextStep.description,
            args: fmtArgs(nextStep.args_template),
            requer_input_usuario: !nextStep.auto_execute,
            prompt_usuario: nextStep.user_prompt,
        },
        secoes_extras: [{
            titulo: "📊 Progresso do Fluxo",
            conteudo: generateProgressBar(estado),
        }],
    });

    // v5.2: Resource links para especialista/skill referenciado
    if (!inOnboarding && faseInfo) {
        try {
            const { getSkillParaFase } = await import("../utils/prompt-mapper.js");
            const skillName = getSkillParaFase(faseInfo.nome);
            if (skillName) {
                const links = buildResourceLinksBlock([
                    skillResourceLink(skillName),
                    templateResourceLink(skillName, "template.md"),
                ], "Recursos do Especialista");
                content.push(...(links as any));
            }
        } catch {
            // Fallback silencioso se skill não encontrada
        }
    }

    return { content };
}

/**
 * Quando não há projeto no diretório
 * v5.3: Sempre referencia tools públicas (maestro) com parâmetros explícitos
 */
function handleNoProject(diretorio: string): ToolResult {
    const hasConfig = existsSync(join(diretorio, ".maestro", "config.json"));

    if (hasConfig) {
        // Config já existe — ir direto para criar projeto
        const content = formatResponse({
            titulo: "🎯 Maestro — Novo Projeto",
            resumo: `Nenhum projeto encontrado em \`${diretorio}\`. Preferências já configuradas.`,
            instrucoes: `EXECUTE a seguinte tool call após perguntar ao usuário o nome e descrição do projeto:

maestro({
  "diretorio": "${diretorio}",
  "acao": "criar_projeto",
  "respostas": {
    "nome": "<nome do projeto>",
    "descricao": "<descrição breve>"
  }
})`,
            proximo_passo: {
                tool: "maestro",
                descricao: "Criar novo projeto neste diretório",
                args: `{ "diretorio": "${diretorio}", "acao": "criar_projeto", "respostas": { "nome": "<nome>", "descricao": "<descrição>" } }`,
                requer_input_usuario: true,
                prompt_usuario: "Qual o nome e uma breve descrição do projeto?",
            },
        });
        return { content };
    }

    // Sem config — precisa de setup primeiro
    const content = formatResponse({
        titulo: "🎯 Maestro — Novo Projeto",
        resumo: `Nenhum projeto encontrado em \`${diretorio}\`. Configuração inicial necessária.`,
        instrucoes: `Pergunte ao usuário:
1. Qual IDE você usa? (windsurf / cursor / antigravity)
2. Qual modo prefere? (economy = rápido / balanced = equilibrado / quality = completo)
3. Deseja usar Stitch para prototipagem? (sim/não)

Depois EXECUTE:

maestro({
  "diretorio": "${diretorio}",
  "acao": "setup_inicial",
  "respostas": {
    "ide": "windsurf",
    "modo": "balanced",
    "usar_stitch": false
  }
})`,
        proximo_passo: {
            tool: "maestro",
            descricao: "Configurar preferências e depois criar projeto",
            args: `{ "diretorio": "${diretorio}", "acao": "setup_inicial", "respostas": { "ide": "windsurf", "modo": "balanced", "usar_stitch": false } }`,
            requer_input_usuario: true,
            prompt_usuario: "Qual IDE você usa? Qual modo prefere? (economy/balanced/quality)",
        },
    });
    return { content };
}

/**
 * v5.3: Criar projeto completo em um único passo
 * Combina setup_inicial + iniciar_projeto + confirmar_projeto
 */
async function handleCriarProjeto(args: MaestroArgs): Promise<ToolResult> {
    const diretorio = args.diretorio;
    const params = args.respostas || {};
    const nome = params.nome as string;
    const descricao = (params.descricao as string) || "";

    if (!nome) {
        const content = formatResponse({
            titulo: "🎯 Maestro — Criar Projeto",
            resumo: "Informe o nome e descrição do projeto para continuar.",
            instrucoes: `Pergunte ao usuário o nome e descrição do projeto, depois EXECUTE:

maestro({
  "diretorio": "${diretorio}",
  "acao": "criar_projeto",
  "respostas": {
    "nome": "<nome do projeto>",
    "descricao": "<descrição breve>"
  }
})`,
            proximo_passo: {
                tool: "maestro",
                descricao: "Criar projeto com nome e descrição",
                args: `{ "diretorio": "${diretorio}", "acao": "criar_projeto", "respostas": { "nome": "<nome>", "descricao": "<descrição>" } }`,
                requer_input_usuario: true,
                prompt_usuario: "Qual o nome e uma breve descrição do projeto?",
            },
        });
        return { content };
    }

    // Carregar config global ou usar defaults
    const configGlobal = await loadUserConfig();
    const ide = (params.ide as string) || configGlobal?.ide || "windsurf";
    const modo = (params.modo as string) || configGlobal?.modo || "balanced";
    const usarStitch = (params.usar_stitch as boolean) ?? configGlobal?.usar_stitch ?? false;

    // Se não tem config global, salvar automaticamente
    if (!configGlobal) {
        try {
            const { saveUserConfig } = await import("../utils/config.js");
            await saveUserConfig({ ide: ide as any, modo: modo as any, usar_stitch: usarStitch });
        } catch {
            // Fallback silencioso
        }
    }

    // Delegar para iniciar_projeto com confirmar_automaticamente=true
    const { iniciarProjeto } = await import("./iniciar-projeto.js");
    return iniciarProjeto({
        nome,
        descricao,
        diretorio,
        ide: ide as any,
        modo: modo as any,
        usar_stitch: usarStitch,
        confirmar_automaticamente: true,
    });
}

/**
 * Gera barra de progresso visual com fases
 */
function generateProgressBar(estado: EstadoProjeto): string {
    const lines: string[] = [];
    const totalFases = estado.total_fases || 7;

    for (let i = 1; i <= totalFases; i++) {
        const faseInfo = getFaseComStitch(estado.nivel as any, i, estado.usar_stitch);
        const nome = faseInfo?.nome || `Fase ${i}`;
        
        if (estado.gates_validados?.includes(i)) {
            lines.push(`✅ Fase ${i}: ${nome}`);
        } else if (i === estado.fase_atual) {
            lines.push(`🔄 **Fase ${i}: ${nome}** ← atual`);
        } else {
            lines.push(`⬜ Fase ${i}: ${nome}`);
        }
    }

    return lines.join("\n");
}

/**
 * Parse input text to extract setup_inicial parameters
 * Handles formats like: setup_inicial({ ide: "windsurf", modo: "balanced" })
 */
function parseSetupInput(input: string): Record<string, unknown> | null {
    // Match setup_inicial({ ... }) pattern
    const match = input.match(/setup_inicial\s*\(\s*(\{[\s\S]*\})\s*\)/);
    if (!match) return null;
    
    try {
        // Use Function constructor to safely evaluate the object literal
        const objStr = match[1];
        // Replace unquoted keys with quoted keys for valid JSON
        const jsonStr = objStr
            .replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":')
            .replace(/'/g, '"');
        return JSON.parse(jsonStr);
    } catch {
        return null;
    }
}
function formatArgsPreview(args: Record<string, unknown>): string {
    return Object.entries(args)
        .map(([key, value]) => {
            if (typeof value === "string" && value.startsWith("{{")) {
                return `${key}: "..."`;
            }
            return `${key}: ${JSON.stringify(value)}`;
        })
        .join(", ");
}

/**
 * Input schema para maestro
 */
export const maestroToolSchema = {
    type: "object",
    properties: {
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
        input: {
            type: "string",
            description: "Texto livre do usuário (opcional)",
        },
        acao: {
            type: "string",
            description: "Ação específica a executar (opcional)",
            enum: ["setup_inicial", "criar_projeto"],
        },
        estado_json: {
            type: "string",
            description: "Estado do projeto (opcional — carrega automaticamente se não fornecido)",
        },
        respostas: {
            type: "object",
            description: "Parâmetros estruturados. Para setup: {ide, modo, usar_stitch}. Para criar_projeto: {nome, descricao}. Para onboarding: respostas do bloco atual.",
            properties: {
                ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"], description: "IDE utilizada (para setup_inicial)" },
                modo: { type: "string", enum: ["economy", "balanced", "quality"], description: "Modo operacional (para setup_inicial)" },
                usar_stitch: { type: "boolean", description: "Usar Stitch para prototipagem (para setup_inicial)" },
                nome: { type: "string", description: "Nome do projeto (para criar_projeto)" },
                descricao: { type: "string", description: "Descrição breve do projeto (para criar_projeto)" },
            },
        },
    },
    required: ["diretorio"],
};
