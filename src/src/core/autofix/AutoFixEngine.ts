export interface FixStrategy {
    name: string;
    pattern: RegExp;
    fix: (code: string) => string;
    description: string;
}

export interface FixResult {
    success: boolean;
    fixed: string;
    changes: string[];
    errors: string[];
}

export class AutoFixEngine {
    private strategies: FixStrategy[] = [
        // Missing imports
        {
            name: 'add_missing_import',
            pattern: /(\w+) is not defined/,
            fix: (code) => {
                // Simplified: add common imports
                return `import { useState, useEffect } from 'react';\n${code}`;
            },
            description: 'Adiciona imports faltantes'
        },
        // Unused variables
        {
            name: 'remove_unused',
            pattern: /'(\w+)' is declared but never used/,
            fix: (code) => {
                return code; // Simplified
            },
            description: 'Remove variáveis não usadas'
        }
    ];

    async fix(code: string, error: string): Promise<FixResult> {
        const changes: string[] = [];
        const errors: string[] = [];
        let fixed = code;

        for (const strategy of this.strategies) {
            if (strategy.pattern.test(error)) {
                try {
                    fixed = strategy.fix(fixed);
                    changes.push(strategy.description);
                } catch (e) {
                    errors.push(`Erro em ${strategy.name}: ${String(e)}`);
                }
            }
        }

        return {
            success: changes.length > 0,
            fixed,
            changes,
            errors
        };
    }
}
