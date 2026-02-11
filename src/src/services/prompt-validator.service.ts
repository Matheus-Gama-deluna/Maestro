/**
 * PromptValidatorService v1.0
 * 
 * Serviço de validação de conformidade da IA com o protocolo MCP.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class PromptValidatorService {
  private errorCount: Map<string, number> = new Map();

  validateToolCall(response: string, expectedTool: string): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Detectar tool usada
    const toolMatch = response.match(/(executar|maestro|validar)\s*\(/);
    const usedTool = toolMatch ? toolMatch[1] : null;

    if (!usedTool) {
      errors.push("Nenhuma chamada de tool detectada");
      suggestions.push("Use 'executar({...})' para avançar no fluxo");
      return { valid: false, errors, suggestions, severity: 'critical' };
    }

    if (usedTool !== expectedTool) {
      errors.push(`Tool incorreta: usou '${usedTool}', esperado '${expectedTool}'`);
      if (expectedTool === 'executar' && usedTool === 'maestro') {
        suggestions.push("NUNCA use 'maestro()' para tentar avançar");
        suggestions.push("Use 'executar({acao: 'avancar'})' em vez disso");
      }
    }

    const severity = usedTool !== expectedTool ? 'critical' : 
                    errors.length > 2 ? 'high' : 
                    errors.length > 0 ? 'medium' : 'low';

    return { valid: errors.length === 0, errors, suggestions, severity };
  }

  generateFeedback(result: ValidationResult): string {
    if (result.valid) return "";

    let feedback = "## ⚠️ Erro de Comunicação\n\n";
    feedback += "### Problemas:\n";
    for (const error of result.errors) {
      feedback += `- ${error}\n`;
    }
    feedback += "\n### Correção:\n";
    for (const suggestion of result.suggestions) {
      feedback += `- ${suggestion}\n`;
    }
    return feedback;
  }

  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCount);
  }

  clearStats(): void {
    this.errorCount.clear();
  }
}

export const promptValidator = new PromptValidatorService();
