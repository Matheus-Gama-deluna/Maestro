import { readFile } from "fs/promises";
import { join } from "path";
import type { ToolResult } from "../../types/index.js";
import { QualityAnalyzer, formatAnalysisResult } from "../../analyzers/index.js";

interface AnalisarQualidadeArgs {
    codigo?: string;
    arquivo?: string;
}

/**
 * Tool: analisar_qualidade
 * Analisa qualidade do código, complexidade e padrões
 */
export async function analisarQualidade(args: AnalisarQualidadeArgs): Promise<ToolResult> {
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
                text: `# 📊 Análise de Qualidade

## Como usar

**Analisar código diretamente:**
\`\`\`
analisar_qualidade(codigo: "seu código aqui")
\`\`\`

**Analisar arquivo:**
\`\`\`
analisar_qualidade(arquivo: "src/services/user.ts")
\`\`\`

## O que é verificado

| Métrica | Descrição |
|---------|-----------|
| **Complexidade** | Ciclomática (condicionais, loops) |
| **Tamanho** | Linhas de código, funções longas |
| **Padrões** | TODO/FIXME, código comentado |
| **Tipos** | Uso de any, tipos faltando |
| **Duplicação** | Strings duplicadas |
`,
            }],
        };
    }

    const analyzer = new QualityAnalyzer();
    const result = await analyzer.analyze(content, { fileName });
    const formatted = formatAnalysisResult(result);

    return {
        content: [{ type: "text", text: formatted }],
    };
}

export const analisarQualidadeSchema = {
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
