/**
 * Fallback de Sampling para clients que não suportam o primitivo nativo.
 * 
 * Quando o client MCP não suporta `sampling`, gera instruções estruturadas
 * para a IA realizar a análise ela mesma (self-analysis).
 * 
 * @since v5.1.0 — Task 3.2 do Roadmap de Melhorias MCP
 */

import { clientSupports } from "./client-capabilities.service.js";

export interface SamplingRequest {
    /** Descrição do que deve ser analisado */
    task: string;
    /** Contexto para a análise */
    context: string;
    /** Formato esperado da resposta */
    expectedFormat?: string;
    /** Model hint (para sampling nativo) */
    modelHint?: string;
}

/**
 * Gera bloco de sampling (análise LLM-to-LLM).
 * Se o client suporta sampling nativa, retorna formato MCP.
 * Senão, retorna instruções para self-analysis.
 */
export function buildSamplingRequest(request: SamplingRequest): {
    useNative: boolean;
    nativePayload?: Record<string, unknown>;
    selfAnalysisFallback: string;
} {
    const useNative = clientSupports("hasSampling");

    if (useNative) {
        return {
            useNative: true,
            nativePayload: {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `${request.task}\n\nContexto:\n${request.context}`,
                        },
                    },
                ],
                modelPreferences: request.modelHint ? {
                    hints: [{ name: request.modelHint }],
                } : undefined,
                maxTokens: 4096,
            },
            selfAnalysisFallback: "",
        };
    }

    // Fallback: Instruções para self-analysis
    let md = `## 🔍 Análise Requerida\n\n`;
    md += `**Tarefa:** ${request.task}\n\n`;
    md += `### Contexto\n\n${request.context}\n\n`;

    if (request.expectedFormat) {
        md += `### Formato Esperado\n\n${request.expectedFormat}\n\n`;
    }

    md += `> 🤖 **Instruções para a IA:** Realize esta análise diretamente. `;
    md += `Avalie o contexto acima e produza a resposta no formato solicitado. `;
    md += `Não é necessário chamar ferramentas externas para esta análise.\n`;

    return {
        useNative: false,
        selfAnalysisFallback: md,
    };
}

/**
 * Gera fallback de análise de código quando sampling não está disponível.
 */
export function buildCodeAnalysisFallback(code: string, analysisType: string): string {
    return `## 🔍 Análise de Código — ${analysisType}

\`\`\`
${code.slice(0, 2000)}${code.length > 2000 ? "\n// ... truncado" : ""}
\`\`\`

> 🤖 **Instruções para a IA:** Analise o código acima considerando:
> - **Segurança:** vulnerabilidades OWASP Top 10
> - **Qualidade:** code smells, complexidade ciclomática, DRY/SOLID
> - **Performance:** anti-patterns, N+1, memory leaks
> 
> Produza um relatório estruturado com severidade (crítico/alto/médio/baixo) para cada achado.
`;
}
