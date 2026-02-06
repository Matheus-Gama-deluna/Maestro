/**
 * Error Handling Estruturado do Maestro
 * 
 * Hierarquia de erros com códigos, recovery actions e contexto.
 * Quando um erro tem `recovery`, a IA sabe exatamente como corrigi-lo.
 */

import type { NextAction } from "../types/response.js";

/**
 * Erro base do Maestro com código e recovery action
 */
export class MaestroError extends Error {
    public readonly code: string;
    public readonly recovery?: NextAction;
    public readonly details?: Record<string, unknown>;

    constructor(
        message: string,
        code: string,
        options?: {
            recovery?: NextAction;
            details?: Record<string, unknown>;
            cause?: Error;
        }
    ) {
        super(message);
        this.name = "MaestroError";
        this.code = code;
        this.recovery = options?.recovery;
        this.details = options?.details;
        if (options?.cause) this.cause = options.cause;
    }
}

/**
 * Erro de validação de input
 */
export class ValidationError extends MaestroError {
    constructor(
        message: string,
        options?: {
            field?: string;
            expected?: string;
            received?: string;
            recovery?: NextAction;
        }
    ) {
        super(message, "VALIDATION_ERROR", {
            recovery: options?.recovery,
            details: {
                field: options?.field,
                expected: options?.expected,
                received: options?.received,
            },
        });
        this.name = "ValidationError";
    }
}

/**
 * Erro de estado inválido
 */
export class StateError extends MaestroError {
    constructor(
        message: string,
        options?: {
            currentState?: string;
            expectedState?: string;
            recovery?: NextAction;
        }
    ) {
        super(message, "STATE_ERROR", {
            recovery: options?.recovery,
            details: {
                currentState: options?.currentState,
                expectedState: options?.expectedState,
            },
        });
        this.name = "StateError";
    }
}

/**
 * Erro de fluxo (transição inválida, fase não encontrada, etc.)
 */
export class FlowError extends MaestroError {
    constructor(
        message: string,
        options?: {
            currentPhase?: string;
            targetPhase?: string;
            recovery?: NextAction;
        }
    ) {
        super(message, "FLOW_ERROR", {
            recovery: options?.recovery,
            details: {
                currentPhase: options?.currentPhase,
                targetPhase: options?.targetPhase,
            },
        });
        this.name = "FlowError";
    }
}

/**
 * Erro de persistência (falha ao ler/escrever arquivos)
 */
export class PersistenceError extends MaestroError {
    constructor(
        message: string,
        options?: {
            path?: string;
            operation?: "read" | "write";
            recovery?: NextAction;
            cause?: Error;
        }
    ) {
        super(message, "PERSISTENCE_ERROR", {
            recovery: options?.recovery,
            details: {
                path: options?.path,
                operation: options?.operation,
            },
            cause: options?.cause,
        });
        this.name = "PersistenceError";
    }
}

/**
 * Erro de tool não encontrada
 */
export class ToolNotFoundError extends MaestroError {
    constructor(toolName: string) {
        super(`Tool não encontrada: ${toolName}`, "TOOL_NOT_FOUND", {
            recovery: {
                tool: "maestro",
                description: "Use o entry point inteligente para encontrar a tool correta",
                args_template: { diretorio: "{{diretorio}}" },
                requires_user_input: false,
            },
            details: { toolName },
        });
        this.name = "ToolNotFoundError";
    }
}

/**
 * Formata um MaestroError para resposta de tool
 */
export function formatMaestroError(error: MaestroError): {
    content: Array<{ type: "text"; text: string }>;
    isError: boolean;
    next_action?: NextAction;
} {
    let text = `# ❌ ${error.name}: ${error.message}\n\n`;
    text += `**Código:** \`${error.code}\`\n\n`;

    if (error.details) {
        text += "**Detalhes:**\n";
        for (const [key, value] of Object.entries(error.details)) {
            if (value !== undefined) {
                text += `- **${key}:** ${value}\n`;
            }
        }
        text += "\n";
    }

    if (error.recovery) {
        text += `## 🔄 Ação de Recuperação\n\n`;
        text += `**Tool:** \`${error.recovery.tool}\`\n`;
        text += `**Descrição:** ${error.recovery.description}\n`;
        if (error.recovery.user_prompt) {
            text += `\n> ${error.recovery.user_prompt}\n`;
        }
    }

    return {
        content: [{ type: "text", text }],
        isError: true,
        next_action: error.recovery,
    };
}

/**
 * Wraps uma função de tool com error handling automático
 */
export function withErrorHandling<T extends Record<string, unknown>>(
    toolName: string,
    handler: (args: T) => Promise<any>
): (args: T) => Promise<any> {
    return async (args: T) => {
        try {
            return await handler(args);
        } catch (error) {
            if (error instanceof MaestroError) {
                return formatMaestroError(error);
            }

            // Erro genérico — wrappa em MaestroError
            const maestroErr = new MaestroError(
                `Erro inesperado em ${toolName}: ${String(error)}`,
                "UNEXPECTED_ERROR",
                {
                    recovery: {
                        tool: "status",
                        description: "Verificar status do projeto após erro",
                        args_template: { estado_json: "{{estado_json}}", diretorio: "{{diretorio}}" },
                        requires_user_input: false,
                    },
                    cause: error instanceof Error ? error : undefined,
                }
            );
            return formatMaestroError(maestroErr);
        }
    };
}
