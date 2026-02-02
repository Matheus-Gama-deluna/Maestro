import { ADRManager } from '../../core/knowledge/ADRManager.js';
import { PatternRegistry } from '../../core/knowledge/PatternRegistry.js';
import { ContextLoader } from '../../core/knowledge/ContextLoader.js';
import { KnowledgeBase } from '../../core/knowledge/KnowledgeBase.js';
import { DecisionContent } from '../../core/knowledge/types.js';

// ==================== RECORD ADR ====================

export interface RecordADRParams {
    decision: string;
    context: string;
    alternatives: Array<{
        name: string;
        pros: string[];
        cons: string[];
        score: number;
    }>;
    consequences?: {
        positive: string[];
        negative: string[];
    };
    risks?: Array<{
        description: string;
        probability: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
        mitigation: string;
    }>;
    estado_json: string;
    diretorio: string;
}

export async function recordADR(params: RecordADRParams) {
    try {
        const estado = JSON.parse(params.estado_json);
        const adrManager = new ADRManager(params.diretorio);

        const id = await adrManager.create(
            params.decision,
            params.context,
            params.alternatives,
            params.consequences || { positive: [], negative: [] },
            estado.fase_atual,
            params.risks
        );

        // Gerar markdown do ADR
        const markdown = await adrManager.generateMarkdown(id);

        return {
            content: [{
                type: "text" as const,
                text: `✅ **ADR Registrado: ${id}**\n\nDecisão: ${params.decision}\nFase: ${estado.fase_atual}\n\nO ADR foi salvo em \`.maestro/knowledge/adrs/${id}.json\``
            }],
            files: [
                {
                    path: `.maestro/knowledge/adrs/${id}.md`,
                    content: markdown
                }
            ]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro ao registrar ADR: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const recordADRSchema = {
    type: "object" as const,
    properties: {
        decision: { type: "string", description: "Decisão arquitetural tomada" },
        context: { type: "string", description: "Contexto e motivação da decisão" },
        alternatives: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    pros: { type: "array", items: { type: "string" } },
                    cons: { type: "array", items: { type: "string" } },
                    score: { type: "number" }
                },
                required: ["name", "pros", "cons", "score"]
            },
            description: "Alternativas consideradas"
        },
        consequences: {
            type: "object",
            properties: {
                positive: { type: "array", items: { type: "string" } },
                negative: { type: "array", items: { type: "string" } }
            },
            description: "Consequências da decisão"
        },
        risks: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    description: { type: "string" },
                    probability: { type: "string", enum: ["low", "medium", "high"] },
                    impact: { type: "string", enum: ["low", "medium", "high"] },
                    mitigation: { type: "string" }
                }
            },
            description: "Riscos e mitigações"
        },
        estado_json: { type: "string", description: "Conteúdo de .maestro/estado.json" },
        diretorio: { type: "string", description: "Diretório do projeto" },
    },
    required: ["decision", "context", "alternatives", "estado_json", "diretorio"],
};

// ==================== RECORD PATTERN ====================

export interface RecordPatternParams {
    name: string;
    context: string;
    problem: string;
    solution: string;
    examples?: string[];
    relatedPatterns?: string[];
    estado_json: string;
    diretorio: string;
}

export async function recordPattern(params: RecordPatternParams) {
    try {
        const estado = JSON.parse(params.estado_json);
        const patternRegistry = new PatternRegistry(params.diretorio);

        const id = await patternRegistry.register(
            params.name,
            params.context,
            params.problem,
            params.solution,
            estado.fase_atual,
            params.examples,
            params.relatedPatterns
        );

        return {
            content: [{
                type: "text" as const,
                text: `✅ **Padrão Registrado: ${id}**\n\nNome: ${params.name}\nFase: ${estado.fase_atual}\n\nO padrão foi salvo em \`.maestro/knowledge/patterns/${id}.json\``
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro ao registrar padrão: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const recordPatternSchema = {
    type: "object" as const,
    properties: {
        name: { type: "string", description: "Nome do padrão" },
        context: { type: "string", description: "Contexto de aplicação" },
        problem: { type: "string", description: "Problema que resolve" },
        solution: { type: "string", description: "Solução proposta" },
        examples: { type: "array", items: { type: "string" }, description: "Exemplos de uso" },
        relatedPatterns: { type: "array", items: { type: "string" }, description: "Padrões relacionados" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["name", "context", "problem", "solution", "estado_json", "diretorio"],
};

// ==================== GET CONTEXT ====================

export interface GetContextParams {
    fase?: number;
    estado_json: string;
    diretorio: string;
}

export async function getContext(params: GetContextParams) {
    try {
        const estado = JSON.parse(params.estado_json);
        const fase = params.fase || estado.fase_atual;
        
        const contextLoader = new ContextLoader(params.diretorio);
        const context = await contextLoader.loadForPhase(fase);

        // Formatar resposta
        let text = `📚 **Contexto Relevante - Fase ${fase}**\n\n`;
        text += `${context.summary}\n\n`;

        if (context.adrs.length > 0) {
            text += `**Decisões Arquiteturais (${context.adrs.length}):**\n`;
            context.adrs.slice(0, 5).forEach(adr => {
                text += `- ${adr.id}: ${(adr.content as any).decision}\n`;
            });
            text += '\n';
        }

        if (context.patterns.length > 0) {
            text += `**Padrões Identificados (${context.patterns.length}):**\n`;
            context.patterns.slice(0, 5).forEach(pattern => {
                text += `- ${pattern.id}: ${(pattern.content as any).name}\n`;
            });
            text += '\n';
        }

        if (context.decisions.length > 0) {
            text += `**Decisões Recentes (${context.decisions.length}):**\n`;
            context.decisions.slice(0, 5).forEach(dec => {
                text += `- ${(dec.content as DecisionContent).action}\n`;
            });
            text += '\n';
        }

        return {
            content: [{
                type: "text" as const,
                text
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro ao carregar contexto: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const getContextSchema = {
    type: "object" as const,
    properties: {
        fase: { type: "number", description: "Fase específica (opcional, usa fase atual se omitido)" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["estado_json", "diretorio"],
};

// ==================== SEARCH KNOWLEDGE ====================

export interface SearchKnowledgeParams {
    query: string;
    estado_json: string;
    diretorio: string;
}

export async function searchKnowledge(params: SearchKnowledgeParams) {
    try {
        const kb = new KnowledgeBase(params.diretorio);
        const results = await kb.search(params.query);

        let text = `🔍 **Resultados da Busca: "${params.query}"**\n\n`;
        text += `Encontrados ${results.length} resultado(s)\n\n`;

        results.slice(0, 10).forEach(entry => {
            text += `**${entry.id}** (${entry.type})\n`;
            text += `Fase: ${entry.metadata.fase} | ${new Date(entry.metadata.timestamp).toLocaleDateString()}\n`;
            text += `Tags: ${entry.metadata.tags.join(', ')}\n\n`;
        });

        return {
            content: [{
                type: "text" as const,
                text
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro na busca: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const searchKnowledgeSchema = {
    type: "object" as const,
    properties: {
        query: { type: "string", description: "Termo de busca" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["query", "estado_json", "diretorio"],
};
