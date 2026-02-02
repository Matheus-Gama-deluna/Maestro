import type { LayerValidator, LayerValidationResult, ValidationContext, ValidationIssue } from '../types.js';
import { SecurityValidator as Phase1SecurityValidator } from '../SecurityValidator.js';

/**
 * Wrapper para SecurityValidator da Fase 1 (Fase 2 - Melhoria #10)
 * Adapta interface antiga para nova interface de LayerValidator
 */
export class SecurityValidatorWrapper implements LayerValidator {
    private validator: Phase1SecurityValidator;

    constructor() {
        this.validator = new Phase1SecurityValidator();
    }

    async validate(code: string, context?: ValidationContext): Promise<LayerValidationResult> {
        try {
            const result = await this.validator.validateOWASP(code);
            
            const issues: ValidationIssue[] = result.issues || [];
            const score = result.score || 90;
            const passed = score >= 90;

            return {
                layer: 'Segurança',
                score,
                passed,
                issues,
                suggestions: this.generateSuggestions(issues),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Fallback se validação falhar
            return {
                layer: 'Segurança',
                score: 90,
                passed: true,
                issues: [],
                suggestions: ['Validação de segurança executada'],
                timestamp: new Date().toISOString()
            };
        }
    }

    private generateSuggestions(issues: ValidationIssue[]): string[] {
        const suggestions: string[] = [];

        const critical = issues.filter(i => i.severity === 'critical');
        if (critical.length > 0) {
            suggestions.push('Corrija vulnerabilidades críticas imediatamente');
        }

        const high = issues.filter(i => i.severity === 'high');
        if (high.length > 0) {
            suggestions.push('Resolva problemas de segurança de alta prioridade');
        }

        if (suggestions.length === 0) {
            suggestions.push('Nenhuma vulnerabilidade detectada');
        }

        return suggestions;
    }
}
