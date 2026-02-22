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
import { resolveProjectPath } from "../utils/files.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { buildResourceLinksBlock, skillResourceLink, templateResourceLink } from "../utils/resource-links.js";
import { loadUserConfig } from "../utils/config.js";
import { forAssistantOnly } from "../services/annotations-fallback.service.js";
import { formatSkillHydrationCommand, detectIDE } from "../utils/ide-paths.js";
import { getSkillParaFase } from "../utils/prompt-mapper.js";

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

    // v5.4: Normalizar diretório para evitar inconsistência de caminhos
    // Ex: /xampp/htdocs/cccrj → C:\xampp\htdocs\cccrj no Windows
    const diretorio = resolveProjectPath(args.diretorio);

    const stateService = createStateService(diretorio);

    // Tentar carregar estado do filesystem ou do argumento
    let estado: EstadoProjeto | null = null;
    
    if (args.estado_json) {
        estado = parsearEstado(args.estado_json);
    }
    
    if (!estado) {
        estado = await stateService.load();
    }

    // Sem projeto ou comando explícito de recriação: guiar para criação ou executar ação se fornecida
    if (!estado || args.acao === "setup_inicial" || args.acao === "criar_projeto") {
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
            }, diretorio);
        }

        // v5.3 / v6.1: Ação criar_projeto — combina setup + iniciar + confirmar em 1 passo (mesmo se estado fantasma existir)
        if (args.acao === "criar_projeto") {
            return handleCriarProjeto({ ...args, diretorio });
        }

        return await handleNoProject(diretorio);
    }

    // v7.0: Delegação de avanços para unificar o fluxo no maestro
    if (args.acao === "avancar") {
        const { executar } = await import("./consolidated/executar.js");
        return executar({ ...args, acao: "avancar" });
    }

    // Com projeto: analisar estado e recomendar
    const nextStep = getNextStep(estado, diretorio);
    const progress = getFlowProgress(estado);
    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    const specialist = faseInfo ? getSpecialistPersona(faseInfo.nome) : null;
    const inOnboarding = isInOnboarding(estado);

    // Montar resposta contextual com formatResponse (v5.1)
    const statusEmoji = inOnboarding ? "🚀" : "📍";
    const phaseLabel = inOnboarding ? "Onboarding" : `Fase ${estado.fase_atual}/${estado.total_fases}`;
    const nextAction = flowStepToNextAction(nextStep);

    // v7.0: Substituído injeção ativa massiva por comando de hidratação dinâmico da IDE
    let specialistContext = "";
    if (faseInfo) {
        try {
            const skillName = getSkillParaFase(faseInfo.nome);
            if (skillName) {
                const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
                specialistContext = formatSkillHydrationCommand(skillName, ide);
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
    if (faseInfo) {
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
 * v6.0: SEMPRE mostra config e pede confirmação para ESTE projeto (resolve P7, P8)
 * Mesmo com config global existente, confirma antes de prosseguir
 */
async function handleNoProject(diretorio: string): Promise<ToolResult> {
    const configGlobal = await loadUserConfig();

    if (configGlobal) {
        // v6.0 (P7/P8): Config global existe, mas PERGUNTAR se quer usar para ESTE projeto
        const content = formatResponse({
            titulo: "🎯 Maestro — Novo Projeto",
            resumo: `Nenhum projeto encontrado em \`${diretorio}\`. Configuração global detectada.`,
            dados: {
                "IDE": configGlobal.ide,
                "Modo": configGlobal.modo,
                "Stitch": configGlobal.usar_stitch ? "Sim" : "Não",
            },
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário ANTES de prosseguir:

1. **Confirme as configurações acima** para ESTE projeto:
   - IDE: ${configGlobal.ide} — manter ou trocar? (windsurf / cursor / antigravity)
   - Modo: ${configGlobal.modo} — manter ou trocar? (economy / balanced / quality)
   - Stitch: ${configGlobal.usar_stitch ? "Sim" : "Não"} — manter ou trocar?

2. **Pergunte o nome e descrição** do projeto.

⚠️ NÃO prossiga sem respostas REAIS do usuário. NÃO infira valores.
⚠️ NÃO use as configurações globais automaticamente sem confirmação explícita.

Depois que o usuário confirmar, EXECUTE:

maestro({
  "diretorio": "${diretorio}",
  "acao": "criar_projeto",
  "respostas": {
    "nome": "<nome do projeto>",
    "descricao": "<descrição breve>",
    "ide": "<ide confirmada>",
    "modo": "<modo confirmado>",
    "usar_stitch": <true_ou_false_confirmado>
  }
})

⚠️ NÃO chame maestro() sem ação — isso reinicia o fluxo. Sempre use acao="criar_projeto".`,
            proximo_passo: {
                tool: "maestro",
                descricao: "Confirmar configurações e criar novo projeto",
                args: `{ "diretorio": "${diretorio}", "acao": "criar_projeto", "respostas": { "nome": "<nome>", "descricao": "<descrição>", "ide": "<ide>", "modo": "<modo>", "usar_stitch": <bool> } }`,
                requer_input_usuario: true,
                prompt_usuario: "As configurações acima estão corretas para este projeto? Qual o nome e descrição do projeto?",
            },
        });
        return { content };
    }

    // Sem config — precisa de setup primeiro
    const content = formatResponse({
        titulo: "🎯 Maestro — Novo Projeto",
        resumo: `Nenhum projeto encontrado em \`${diretorio}\`. Configuração inicial necessária.`,
        instrucoes: `⚠️ OBRIGATÓRIO: Pergunte CADA item ao usuário. NÃO infira respostas. NÃO use valores padrão sem confirmação explícita.

Pergunte ao usuário:
1. **Qual IDE você usa?** (windsurf / cursor / antigravity)
   - Impacto: Define onde rules/skills serão injetados
2. **Qual modo prefere?**
   - economy = rápido, 7 fases, perguntas mínimas
   - balanced = equilibrado, 13 fases, perguntas moderadas
   - quality = completo, 17 fases, perguntas detalhadas
3. **Deseja usar Stitch para prototipagem?** (sim/não)
   - Impacto: Habilita Google Stitch para prototipagem rápida de UI

Depois EXECUTE:

maestro({
  "diretorio": "${diretorio}",
  "acao": "setup_inicial",
  "respostas": {
    "ide": "<resposta_ide>",
    "modo": "<resposta_modo>",
    "usar_stitch": <true_ou_false>
  }
})

⚠️ Substitua os valores pelos que o usuário informar. NÃO use valores padrão sem perguntar.`,
        proximo_passo: {
            tool: "maestro",
            descricao: "Configurar preferências e depois criar projeto",
            args: `{ "diretorio": "${diretorio}", "acao": "setup_inicial", "respostas": { "ide": "<ide>", "modo": "<modo>", "usar_stitch": <bool> } }`,
            requer_input_usuario: true,
            prompt_usuario: "Qual IDE você usa? Qual modo prefere? (economy/balanced/quality) Deseja usar Stitch?",
        },
    });
    return { content };
}

/**
 * v6.0: Criar projeto completo em um único passo
 * Combina setup_inicial + iniciar_projeto + confirmar_projeto
 * P8: Exige ide/modo explícitos (não usa defaults silenciosos)
 * P9: NÃO usa confirmar_automaticamente — projeto criado sem discovery blocks
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
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário o nome, descrição, IDE, modo e stitch. NÃO infira valores.

maestro({
  "diretorio": "${diretorio}",
  "acao": "criar_projeto",
  "respostas": {
    "nome": "<nome do projeto>",
    "descricao": "<descrição breve>",
    "ide": "<ide>",
    "modo": "<modo>",
    "usar_stitch": <bool>
  }
})`,
            proximo_passo: {
                tool: "maestro",
                descricao: "Criar projeto com nome, descrição e configurações",
                args: `{ "diretorio": "${diretorio}", "acao": "criar_projeto", "respostas": { "nome": "<nome>", "descricao": "<descrição>", "ide": "<ide>", "modo": "<modo>", "usar_stitch": <bool> } }`,
                requer_input_usuario: true,
                prompt_usuario: "Qual o nome, descrição do projeto? Confirme IDE, modo e stitch.",
            },
        });
        return { content };
    }

    // v6.0 (P8): Carregar config global mas EXIGIR confirmação explícita
    const configGlobal = await loadUserConfig();
    const ide = params.ide as string;
    const modo = params.modo as string;
    const usarStitch = params.usar_stitch as boolean | undefined;

    // Prioridade 4 (Diag): Forçar sequência de Setup caso a config global não exista
    if (!configGlobal) {
        const content = formatResponse({
            titulo: "⚠️ Maestro — Setup Necessário",
            resumo: `É necessário realizar a configuração inicial antes de criar novos projetos.`,
            instrucoes: `⚠️ OBRIGATÓRIO: Inicie o setup_inicial antes de criar o projeto.`,
            proximo_passo: {
                tool: "maestro",
                descricao: "Realizar o setup inicial",
                args: `{ "diretorio": "${diretorio}", "acao": "setup_inicial" }`,
                requer_input_usuario: true,
                prompt_usuario: "Qual IDE você usa? Qual modo prefere (economy/balanced/quality)? Deseja usar Stitch?",
            },
        });
        return { content };
    }

    // Se ide/modo não foram fornecidos explicitamente, pedir ao usuário
    if (!ide || !modo) {
        const content = formatResponse({
            titulo: "⚠️ Maestro — Configurações Necessárias",
            resumo: `Projeto "${nome}" precisa de configurações confirmadas para este projeto.`,
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário as configurações para ESTE projeto.
NÃO use valores padrão sem confirmação explícita do usuário.

${configGlobal ? `Config global detectada: IDE=${configGlobal.ide}, Modo=${configGlobal.modo}, Stitch=${configGlobal.usar_stitch ? "Sim" : "Não"}
Pergunte: "Deseja usar estas configurações para este projeto ou ajustar?"` : "Nenhuma config global encontrada. Pergunte cada item."}

Depois EXECUTE:

maestro({
  "diretorio": "${diretorio}",
  "acao": "criar_projeto",
  "respostas": {
    "nome": "${nome}",
    "descricao": "${descricao}",
    "ide": "<ide confirmada>",
    "modo": "<modo confirmado>",
    "usar_stitch": <true_ou_false>
  }
})`,
            proximo_passo: {
                tool: "maestro",
                descricao: "Criar projeto com configurações confirmadas",
                args: `{ "diretorio": "${diretorio}", "acao": "criar_projeto", "respostas": { "nome": "${nome}", "descricao": "${descricao}", "ide": "<ide>", "modo": "<modo>", "usar_stitch": <bool> } }`,
                requer_input_usuario: true,
                prompt_usuario: "Confirme IDE, modo e stitch para este projeto.",
            },
        });
        return { content };
    }

    // Salvar/atualizar config global se necessário
    try {
        const { saveUserConfig } = await import("../utils/config.js");
        await saveUserConfig({ ide: ide as any, modo: modo as any, usar_stitch: usarStitch ?? false });
    } catch {
        // Fallback silencioso
    }

    // v6.0 (P9): Delegar para iniciar_projeto SEM confirmar_automaticamente
    // O projeto é criado e vai direto para o especialista (sem discovery blocks)
    const { iniciarProjeto } = await import("./iniciar-projeto.js");
    return iniciarProjeto({
        nome,
        descricao,
        diretorio,
        ide: ide as any,
        modo: modo as any,
        usar_stitch: usarStitch ?? false,
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
            enum: ["setup_inicial", "criar_projeto", "avancar"],
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
