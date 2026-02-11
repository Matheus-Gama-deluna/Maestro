/**
 * Validation Middleware v6.0
 * 
 * Middleware que integra o PromptValidatorService para validar
 * chamadas de tools e garantir conformidade com o protocolo MCP.
 * 
 * Features:
 * - Valida se a tool correta está sendo usada
 * - Detecta erros comuns (ex: usar maestro() para avançar)
 * - Fornece feedback corretivo automático
 * - Rastreia estatísticas de erros
 */

import type { ToolResult } from "../types/index.js";
import { promptValidator, type ValidationResult } from "../services/prompt-validator.service.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

/**
 * Middleware de validação de prompts
 * 
 * Intercepta a resposta da tool e valida se está conforme o esperado.
 * Se detectar erros, adiciona feedback corretivo na resposta.
 */
export function withPromptValidation(
    toolName: string,
    expectedTool?: string
): (handler: ToolHandler) => ToolHandler {
    return (handler: ToolHandler) => {
        return async (args: Record<string, unknown>): Promise<ToolResult> => {
            // Executar handler original
            const result = await handler(args);

            // Se não há tool esperada, não validar
            if (!expectedTool) {
                return result;
            }

            // Extrair conteúdo da resposta para validação
            const responseText = result.content.map(c => c.type === 'text' ? c.text : '').join('\n');

            // Validar chamada de tool
            const validation = promptValidator.validateToolCall(responseText, expectedTool);

            // Se válido, retornar resultado original
            if (validation.valid) {
                return result;
            }

            // Se inválido, adicionar feedback corretivo
            const feedback = promptValidator.generateFeedback(validation);

            // Adicionar feedback ao conteúdo (sempre array)
            const enhancedContent = [
                ...result.content,
                { type: 'text' as const, text: feedback }
            ];

            return {
                ...result,
                content: enhancedContent,
                // Adicionar flag de validação falha
                validation_failed: true,
                validation_errors: validation.errors,
                validation_suggestions: validation.suggestions,
            };
        };
    };
}

/**
 * Wrapper conveniente para aplicar validação a múltiplas tools
 */
export function validateTools(
    toolMappings: Record<string, string>
): Record<string, (handler: ToolHandler) => ToolHandler> {
    const validators: Record<string, (handler: ToolHandler) => ToolHandler> = {};

    for (const [toolName, expectedTool] of Object.entries(toolMappings)) {
        validators[toolName] = withPromptValidation(toolName, expectedTool);
    }

    return validators;
}

/**
 * Configuração padrão de validações
 */
export const defaultValidations = validateTools({
    'maestro': 'maestro',
    'executar': 'executar',
    'validar': 'validar',
    'analisar': 'analisar',
    'contexto': 'contexto',
});
