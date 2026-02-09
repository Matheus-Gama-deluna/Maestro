/**
 * Testes unitários para módulos integrados na v5.2
 * 
 * Cobre:
 * - skill-cache.service (A.3)
 * - structured-content.service (A.8)
 * - annotations-fallback.service (A.7)
 * - response-formatter (A.6)
 * - client-capabilities.service (A.5)
 * - elicitation-fallback.service (A.7)
 * - sampling-fallback.service (A.7)
 */

import { describe, it, expect, beforeEach } from "vitest";

// === skill-cache.service ===
import {
    getCached,
    setCache,
    invalidateCache,
    getCacheStats,
} from "../services/skill-cache.service.js";

describe("skill-cache.service", () => {
    beforeEach(() => {
        invalidateCache();
    });

    it("retorna null para chave inexistente", () => {
        expect(getCached("nao-existe")).toBeNull();
    });

    it("armazena e recupera valor", () => {
        setCache("key1", "valor1");
        expect(getCached("key1")).toBe("valor1");
    });

    it("invalida cache específico", () => {
        setCache("key1", "valor1");
        setCache("key2", "valor2");
        invalidateCache("key1");
        expect(getCached("key1")).toBeNull();
        expect(getCached("key2")).toBe("valor2");
    });

    it("invalida todo o cache", () => {
        setCache("key1", "valor1");
        setCache("key2", "valor2");
        invalidateCache();
        expect(getCached("key1")).toBeNull();
        expect(getCached("key2")).toBeNull();
    });

    it("retorna stats corretas", () => {
        setCache("a", "1");
        setCache("b", "2");
        const stats = getCacheStats();
        expect(stats.size).toBe(2);
        expect(stats.keys).toContain("a");
        expect(stats.keys).toContain("b");
    });
});

// === structured-content.service ===
import {
    withStructuredContent,
    extractStructuredData,
} from "../services/structured-content.service.js";

describe("structured-content.service", () => {
    it("embute JSON como bloco markdown quando client não suporta", () => {
        const text = [{ type: "text" as const, text: "# Teste" }];
        const data = { fase: 1, nome: "Produto" };
        const result = withStructuredContent(text, data, "Dados");

        // Sem suporte nativo, deve ter 2 blocos (original + JSON)
        expect(result.content.length).toBe(2);
        expect(result.content[1].text).toContain("```json");
        expect(result.content[1].text).toContain('"fase": 1');
        expect(result.structuredContent).toBeUndefined();
    });

    it("extractStructuredData retorna null sem structuredContent", () => {
        expect(extractStructuredData({})).toBeNull();
    });

    it("extractStructuredData retorna dados quando presente", () => {
        const data = { x: 1 };
        const result = extractStructuredData({
            structuredContent: { type: "json", json: data },
        });
        expect(result).toEqual(data);
    });
});

// === annotations-fallback.service ===
import {
    annotateContent,
    forAssistantOnly,
    forUserOnly,
} from "../services/annotations-fallback.service.js";

describe("annotations-fallback.service", () => {
    it("forAssistantOnly adiciona annotation ou prefixo inline", () => {
        const block = { type: "text" as const, text: "Instruções secretas" };
        const result = forAssistantOnly(block);
        // Deve ter o texto original (possivelmente com prefixo)
        expect(result.text).toContain("Instruções secretas");
        expect(result.type).toBe("text");
    });

    it("forUserOnly adiciona annotation ou prefixo inline", () => {
        const block = { type: "text" as const, text: "Para o usuário" };
        const result = forUserOnly(block);
        expect(result.text).toContain("Para o usuário");
        expect(result.type).toBe("text");
    });

    it("annotateContent processa bloco individual", () => {
        const block = { type: "text" as const, text: "Bloco 1" };
        const result = annotateContent(block, { audience: ["user"], priority: 0.5 });
        expect(result.type).toBe("text");
        expect(result.text).toContain("Bloco 1");
    });
});

// === response-formatter ===
import {
    formatResponse,
    formatError,
    embedAllMetadata,
    embedNextAction,
    embedProgress,
    embedSpecialist,
} from "../utils/response-formatter.js";

describe("response-formatter", () => {
    it("formatResponse gera bloco com título e resumo", () => {
        const blocks = formatResponse({
            titulo: "Teste",
            resumo: "Resumo do teste",
        });
        expect(blocks.length).toBeGreaterThanOrEqual(1);
        expect(blocks[0].text).toContain("# Teste");
        expect(blocks[0].text).toContain("Resumo do teste");
    });

    it("formatResponse inclui dados como tabela", () => {
        const blocks = formatResponse({
            titulo: "T",
            resumo: "R",
            dados: { Projeto: "Meu App", Fase: 3 },
        });
        const text = blocks.map(b => b.text).join("\n");
        expect(text).toContain("Meu App");
        expect(text).toContain("3");
    });

    it("formatResponse inclui alertas", () => {
        const blocks = formatResponse({
            titulo: "T",
            resumo: "R",
            alertas: ["Atenção!"],
        });
        const text = blocks.map(b => b.text).join("\n");
        expect(text).toContain("⚠️ Atenção!");
    });

    it("formatResponse inclui próximo passo", () => {
        const blocks = formatResponse({
            titulo: "T",
            resumo: "R",
            proximo_passo: {
                tool: "avancar",
                descricao: "Avançar fase",
            },
        });
        const text = blocks.map(b => b.text).join("\n");
        expect(text).toContain("avancar");
        expect(text).toContain("Avançar fase");
    });

    it("formatError gera bloco de erro", () => {
        const blocks = formatError("status", "Algo deu errado", "Tente novamente");
        expect(blocks.length).toBe(1);
        expect(blocks[0].text).toContain("❌ Erro");
        expect(blocks[0].text).toContain("status");
        expect(blocks[0].text).toContain("Algo deu errado");
        expect(blocks[0].text).toContain("Tente novamente");
    });

    it("embedAllMetadata embute specialist, progress e next_action", () => {
        const base = [{ type: "text" as const, text: "Base" }];
        const result = embedAllMetadata(base, {
            specialist: {
                name: "Arquiteto",
                tone: "Técnico",
                expertise: ["Backend"],
                instructions: "Foque em APIs",
            },
            progress: {
                current_phase: "Arquitetura",
                total_phases: 5,
                completed_phases: 2,
                percentage: 40,
            },
            next_action: {
                tool: "avancar",
                description: "Próxima fase",
                args_template: {},
                requires_user_input: false,
            },
        });
        const text = result.map(b => b.text).join("\n");
        expect(text).toContain("Arquiteto");
        expect(text).toContain("40%");
        expect(text).toContain("avancar");
    });
});

// === client-capabilities.service ===
import {
    captureClientCapabilities,
    getClientCapabilities,
    clientSupports,
} from "../services/client-capabilities.service.js";

describe("client-capabilities.service", () => {
    it("captura e retorna capabilities", () => {
        captureClientCapabilities({
            capabilities: { sampling: {} },
            clientInfo: { name: "windsurf", version: "1.0" },
            protocolVersion: "2025-03-26",
        });
        const caps = getClientCapabilities();
        expect(caps).toBeDefined();
        expect(caps.clientName).toBe("windsurf");
        expect(caps.hasSampling).toBe(true);
        expect(caps.hasElicitation).toBe(false);
    });

    it("clientSupports retorna boolean", () => {
        const result = clientSupports("hasSampling");
        expect(typeof result).toBe("boolean");
    });
});

// === elicitation-fallback.service ===
import { buildElicitation } from "../services/elicitation-fallback.service.js";

describe("elicitation-fallback.service", () => {
    it("gera markdown fallback para questionário", () => {
        const result = buildElicitation({
            title: "Discovery",
            description: "Coleta de dados",
            fields: [
                { name: "nome", label: "Nome do projeto", type: "text", required: true },
                { name: "tipo", label: "Tipo", type: "select", options: ["web", "mobile"], required: false },
            ],
        });
        expect(result.markdownFallback).toContain("Discovery");
        expect(result.markdownFallback).toContain("Nome do projeto");
        expect(typeof result.useNative).toBe("boolean");
    });
});

// === sampling-fallback.service ===
import { buildCodeAnalysisFallback } from "../services/sampling-fallback.service.js";

describe("sampling-fallback.service", () => {
    it("gera checklist de análise para código", () => {
        const result = buildCodeAnalysisFallback(
            "function hello() { return 'world'; }",
            "completo"
        );
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });
});
