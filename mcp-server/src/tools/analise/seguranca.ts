import { readFile } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../../types/index.js";
import { SecurityAnalyzer, formatAnalysisResult } from "../../analyzers/index.js";

interface AnalisarSegurancaArgs {
    codigo?: string;
    arquivo?: string;
}

/**
 * Tool: analisar_seguranca
 * Analisa código em busca de vulnerabilidades OWASP Top 10
 */
export async function analisarSeguranca(args: AnalisarSegurancaArgs): Promise<ToolResult> {
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
                text: `# 🔒 Análise de Segurança

## Como usar

**Analisar código diretamente:**
\`\`\`
analisar_seguranca(codigo: "seu código aqui")
\`\`\`

**Analisar arquivo:**
\`\`\`
analisar_seguranca(arquivo: "src/controllers/auth.ts")
\`\`\`

## O que é verificado

| Categoria | Verificações |
|-----------|--------------|
| **OWASP A01** | Broken Access Control |
| **OWASP A02** | Cryptographic Failures (secrets hardcoded) |
| **OWASP A03** | Injection (SQL, Command, eval) |
| **OWASP A07** | XSS (innerHTML, document.write) |

## Regras Adicionais
- Secrets em código
- CORS permissivo
- JWT inseguro
- Dados sensíveis expostos
`,
            }],
        };
    }

    const analyzer = new SecurityAnalyzer();
    const result = await analyzer.analyze(content, { fileName });
    const formatted = formatAnalysisResult(result);

    return {
        content: [{ type: "text", text: formatted }],
    };
}

export const analisarSegurancaSchema = {
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
