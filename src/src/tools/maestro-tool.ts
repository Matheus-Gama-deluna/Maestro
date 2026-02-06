/**
 * Tool: maestro
 * 
 * Entry point inteligente que detecta contexto e retorna o próximo passo.
 * Internamente delega para as tools existentes via flow engine.
 * Reduz a superfície cognitiva de 44 tools para 1 entry point principal.
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { NextAction, FlowProgress } from "../types/response.js";
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
            return setupInicial({
                ide: args.respostas?.ide as any,
                modo: args.respostas?.modo as any,
                usar_stitch: args.respostas?.usar_stitch as boolean | undefined,
                preferencias_stack: args.respostas?.preferencias_stack as any,
                team_size: args.respostas?.team_size as any,
            });
        }
        return handleNoProject(args.diretorio);
    }

    // Com projeto: analisar estado e recomendar
    const nextStep = getNextStep(estado, args.diretorio);
    const progress = getFlowProgress(estado);
    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    const specialist = faseInfo ? getSpecialistPersona(faseInfo.nome) : null;
    const inOnboarding = isInOnboarding(estado);

    // Montar resposta contextual
    const statusEmoji = inOnboarding ? "🚀" : "📍";
    const phaseLabel = inOnboarding ? "Onboarding" : `Fase ${estado.fase_atual}/${estado.total_fases}`;

    // Injeção ativa v5: contexto resumido do especialista
    let specialistContext = "";
    if (!inOnboarding && faseInfo) {
        try {
            const contentResolver = new ContentResolverService(args.diretorio);
            const skillLoader = new SkillLoaderService(contentResolver);
            // Usar modo economy para manter resposta concisa no maestro
            const contextPkg = await skillLoader.loadForPhase(faseInfo.nome, "economy");
            if (contextPkg) {
                specialistContext = `\n---\n\n${skillLoader.formatAsMarkdown(contextPkg)}\n`;
            }
        } catch {
            // Fallback silencioso — sem injeção ativa
        }
    }

    const resposta = `# ${statusEmoji} Maestro — ${estado.nome}

## Estado Atual

| Campo | Valor |
|-------|-------|
| **Projeto** | ${estado.nome} |
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Fase** | ${phaseLabel} — ${faseInfo?.nome || "N/A"} |
| **Progresso** | ${"█".repeat(Math.floor(progress.percentage / 10))}${"░".repeat(10 - Math.floor(progress.percentage / 10))} ${progress.percentage}% |
${specialist ? `| **Especialista** | ${specialist.name} |` : ""}

## 🎯 Próximo Passo Recomendado

**${nextStep.description}**

${nextStep.user_prompt ? `> ${nextStep.user_prompt}` : ""}

### Executar:
\`\`\`
${nextStep.tool}(${formatArgsPreview(nextStep.args_template)})
\`\`\`

${nextStep.auto_execute ? "> 🤖 Esta ação pode ser executada automaticamente." : "> 👤 Esta ação requer input do usuário."}

---

## 📊 Progresso do Fluxo

${generateProgressBar(estado)}
${specialistContext}`;

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json,
        next_action: flowStepToNextAction(nextStep),
        specialist_persona: specialist || undefined,
        progress,
    };
}

/**
 * Quando não há projeto no diretório
 */
function handleNoProject(diretorio: string): ToolResult {
    const hasConfig = existsSync(join(diretorio, ".maestro", "config.json"));

    const next_action: NextAction = hasConfig ? {
        tool: "iniciar_projeto",
        description: "Iniciar um novo projeto neste diretório",
        args_template: { nome: "{{nome_do_projeto}}", diretorio },
        requires_user_input: true,
        user_prompt: "Qual o nome do projeto que deseja criar?",
    } : {
        tool: "setup_inicial",
        description: "Configurar preferências globais do Maestro",
        args_template: {},
        requires_user_input: true,
        user_prompt: "Vamos configurar suas preferências (IDE, modo operacional, etc.)",
    };

    return {
        content: [{
            type: "text",
            text: `# 🎯 Maestro — Novo Projeto

Nenhum projeto encontrado em \`${diretorio}\`.

## 🚀 Próximo Passo

${hasConfig
    ? "**Suas preferências já estão configuradas.** Vamos iniciar um novo projeto!"
    : "**Primeiro, vamos configurar suas preferências** (IDE, modo, etc.)"}

### Executar:
\`\`\`
${next_action.tool}(${formatArgsPreview(next_action.args_template)})
\`\`\`
`,
        }],
        next_action,
    };
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
 * Formata preview de argumentos para exibição
 */
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
        },
        estado_json: {
            type: "string",
            description: "Estado do projeto (opcional — carrega automaticamente se não fornecido)",
        },
        respostas: {
            type: "object",
            description: "Respostas de formulário (opcional)",
        },
    },
    required: ["diretorio"],
};
