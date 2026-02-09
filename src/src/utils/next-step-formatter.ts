/**
 * Helper para gerar blocos de "Próximo Passo" corretos.
 * 
 * REGRA FUNDAMENTAL: Toda referência a tool no output DEVE ser uma das 5 tools públicas:
 * maestro, executar, validar, analisar, contexto.
 * 
 * @since v5.3.0 — Melhoria de Comunicação MCP ↔ IA
 */

const PUBLIC_TOOLS = new Set(["maestro", "executar", "validar", "analisar", "contexto"]);

/**
 * Mapa de redirecionamento: tool interna → tool pública equivalente
 */
const TOOL_REMAP: Record<string, { tool: string; wrapArgs?: (args: Record<string, unknown>) => Record<string, unknown> }> = {
    "setup_inicial": { 
        tool: "maestro", 
        wrapArgs: (args) => ({ ...args, acao: "setup_inicial" }) 
    },
    "iniciar_projeto": { 
        tool: "maestro", 
        wrapArgs: (args) => ({ ...args, acao: "criar_projeto" }) 
    },
    "confirmar_projeto": { 
        tool: "maestro", 
        wrapArgs: (args) => ({ ...args, acao: "criar_projeto" }) 
    },
    "carregar_projeto": { 
        tool: "maestro", 
        wrapArgs: (args) => ({ ...args }) 
    },
    "onboarding_orchestrator": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
    "brainstorm": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
    "prd_writer": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
    "proximo": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
    "avancar": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
    "salvar": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "salvar" }) 
    },
    "checkpoint": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "checkpoint" }) 
    },
    "status": { 
        tool: "maestro" 
    },
    "validar_gate": { 
        tool: "validar", 
        wrapArgs: (args) => ({ ...args, tipo: "gate" }) 
    },
    "avaliar_entregavel": { 
        tool: "validar", 
        wrapArgs: (args) => ({ ...args, tipo: "entregavel" }) 
    },
    "confirmar_classificacao": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
    "aprovar_gate": { 
        tool: "executar", 
        wrapArgs: (args) => ({ ...args, acao: "avancar" }) 
    },
};

export interface NextStepConfig {
    /** Nome da tool (será validado/remapeado para pública) */
    tool: string;
    /** Argumentos da tool call */
    args: Record<string, unknown>;
    /** Descrição do que fazer */
    description: string;
    /** Se requer input do usuário antes de executar */
    requiresUserInput?: boolean;
    /** Prompt para o usuário (se requiresUserInput=true) */
    userPrompt?: string;
    /** Se a IA pode executar automaticamente */
    autoExecute?: boolean;
}

export interface FormattedNextStep {
    tool: string;
    args: Record<string, unknown>;
    description: string;
    requiresUserInput: boolean;
    userPrompt?: string;
    autoExecute?: boolean;
    markdown: string;
}

/**
 * Valida e formata o próximo passo, garantindo que usa tool pública.
 */
export function formatNextStep(config: NextStepConfig): FormattedNextStep {
    let tool = config.tool;
    let args = { ...config.args };

    // Remapear tool interna para pública
    if (!PUBLIC_TOOLS.has(tool)) {
        const remap = TOOL_REMAP[tool];
        if (remap) {
            tool = remap.tool;
            if (remap.wrapArgs) {
                args = remap.wrapArgs(args);
            }
        } else {
            console.error(`[next-step-formatter] Tool desconhecida: ${tool}, usando maestro como fallback`);
            tool = "maestro";
        }
    }

    // Limpar campos internos dos args para exibição
    const displayArgs = { ...args };
    delete displayArgs["estado_json"]; // Será carregado automaticamente

    const argsJson = JSON.stringify(displayArgs, null, 2);
    const requiresUserInput = config.requiresUserInput ?? false;
    const autoExecute = config.autoExecute ?? false;

    let markdown = `## ▶️ Próximo Passo\n\n**${config.description}**\n`;

    if (requiresUserInput && config.userPrompt) {
        markdown += `\n> 👤 ${config.userPrompt}\n`;
    }

    if (autoExecute) {
        markdown += `\n🤖 **Execute automaticamente:**\n`;
    }

    markdown += `\n\`\`\`json\n${tool}(${argsJson})\n\`\`\``;

    return {
        tool,
        args,
        description: config.description,
        requiresUserInput,
        userPrompt: config.userPrompt,
        autoExecute,
        markdown,
    };
}

/**
 * Verifica se uma tool é pública.
 */
export function isPublicTool(toolName: string): boolean {
    return PUBLIC_TOOLS.has(toolName);
}

/**
 * Remapeia uma tool interna para a tool pública equivalente.
 * Retorna o nome da tool pública.
 */
export function remapToPublicTool(toolName: string): string {
    if (PUBLIC_TOOLS.has(toolName)) return toolName;
    const remap = TOOL_REMAP[toolName];
    return remap?.tool || "maestro";
}
