import { readFile } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../../types/index.js";
import { PerformanceAnalyzer, formatAnalysisResult } from "../../analyzers/index.js";

interface AnalisarPerformanceArgs {
    codigo?: string;
    arquivo?: string;
}

/**
 * Tool: analisar_performance
 * Detecta problemas de performance e anti-patterns
 */
export async function analisarPerformance(args: AnalisarPerformanceArgs): Promise<ToolResult> {
    let content: string;
    let fileName: string;

    if (args.codigo) {
        content = args.codigo;
        fileName = "codigo.ts";
    } else if (args.arquivo) {
        try {
            const fullPath = join(process.cwd(), args.arquivo);
            content = await readFile(fullPath, "utf-8");
            fileName = args.arquivo;
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **Erro**: Não foi possível ler o arquivo "${args.arquivo}".\n\n${String(error)}`,
                }],
                isError: true,
            };
        }
    } else {
        return {
            content: [{
                type: "text",
                text: `# ⚡ Análise de Performance

## Como usar

**Analisar código diretamente:**
\`\`\`
analisar_performance(codigo: "seu código aqui")
\`\`\`

**Analisar arquivo:**
\`\`\`
analisar_performance(arquivo: "src/api/routes.ts")
\`\`\`

## O que é verificado

| Categoria | Problemas |
|-----------|-----------|
| **Loops** | Await em loop, loops aninhados |
| **Queries** | N+1, sem LIMIT, sem cache |
| **React** | Inline functions, missing keys |
| **Bundle** | Bibliotecas pesadas (moment, lodash) |
| **DOM** | querySelector em loop |
`,
            }],
        };
    }

    const analyzer = new PerformanceAnalyzer();
    const result = await analyzer.analyze(content, { fileName });
    const formatted = formatAnalysisResult(result);

    return {
        content: [{ type: "text", text: formatted }],
    };
}

export const analisarPerformanceSchema = {
    type: "object",
    properties: {
        codigo: {
            type: "string",
            description: "Código fonte para analisar",
        },
        arquivo: {
            type: "string",
            description: "Caminho do arquivo para analisar",
        },
    },
};
