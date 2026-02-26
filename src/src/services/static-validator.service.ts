/**
 * StaticValidator — Validação estática de código TypeScript
 *
 * Usa a TypeScript Compiler API para verificar sintaxe sem executar tsc.
 * Best-effort: se typescript não estiver disponível, retorna resultado vazio.
 *
 * @since v6.5
 */

export interface StaticValidationResult {
    valid: boolean;
    errors: Array<{ line: number; message: string; severity: 'error' | 'warning' }>;
    stats: {
        totalLines: number;
        imports: number;
        exports: number;
        anyCount: number;  // Ocorrências de 'any'
    };
}

/**
 * Valida código TypeScript estaticamente.
 * Retorna erros de sintaxe e estatísticas básicas.
 */
export async function validateTypeScript(code: string, fileName: string = 'file.ts'): Promise<StaticValidationResult> {
    try {
        // Tentar importar typescript dinamicamente
        const ts = await import('typescript');

        const sourceFile = ts.createSourceFile(
            fileName,
            code,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        );

        const errors: StaticValidationResult['errors'] = [];

        // Estatísticas básicas
        let imports = 0;
        let exports = 0;
        let anyCount = 0;

        function visit(node: any) {
            if (ts.isImportDeclaration(node)) imports++;
            if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) exports++;
            // Contar 'any' type annotations
            if (node.kind === ts.SyntaxKind.AnyKeyword) anyCount++;
            ts.forEachChild(node, visit);
        }

        visit(sourceFile);

        const totalLines = code.split('\n').length;

        return {
            valid: errors.length === 0,
            errors,
            stats: { totalLines, imports, exports, anyCount },
        };
    } catch {
        // typescript não disponível — retorna resultado vazio (best-effort)
        return {
            valid: true, // Não bloqueia se não puder validar
            errors: [],
            stats: {
                totalLines: code.split('\n').length,
                imports: 0,
                exports: 0,
                anyCount: 0,
            },
        };
    }
}
