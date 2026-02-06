/**
 * SkillLoaderService — Carregamento Ativo de Skills com Budget de Tokens
 * 
 * Monta "pacote de contexto" por fase, controlando o volume de conteúdo
 * injetado na resposta para evitar estouro de contexto.
 * 
 * Usa ContentResolverService para resolver caminhos.
 * Usa FASE_SKILL_MAP para mapear fases → skills.
 */

import { ContentResolverService } from "./content-resolver.service.js";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { getSpecialistPersona } from "./specialist.service.js";
import type { SpecialistPersona } from "../types/response.js";

/**
 * Pacote de contexto montado para uma fase
 */
export interface ContextPackage {
    skillName: string;
    specialist: SpecialistPersona | null;
    skillContent: string;
    templateContent: string;
    checklistContent: string;
    referenceLinks: string[];
    tokenEstimate: number;
    mode: "full" | "summary" | "skeleton";
}

/**
 * Seção parseada de um markdown
 */
interface MarkdownSection {
    heading: string;
    level: number;
    content: string;
    charCount: number;
    tokenEstimate: number;
}

/**
 * Budgets de tokens por modo
 */
const TOKEN_BUDGETS = {
    economy: { skill: 400, template: 300, checklist: 200, total: 1500 },
    balanced: { skill: 1500, template: 800, checklist: 300, total: 4000 },
    quality: { skill: 3000, template: 1200, checklist: 400, total: 8000 },
} as const;

/**
 * Seções essenciais que sempre devem ser incluídas do SKILL.md
 */
const ESSENTIAL_SECTIONS = [
    "missão", "missao",
    "quando ativar",
    "inputs obrigatórios", "inputs obrigatorios",
    "outputs gerados",
    "quality gate",
    "processo otimizado", "processo",
    "recursos disponíveis", "recursos disponiveis",
];

/**
 * Seções opcionais (incluídas em balanced/quality)
 */
const OPTIONAL_SECTIONS = [
    "context flow",
    "princípios críticos", "principios criticos",
    "stack padrão", "stack padrao",
    "métricas de sucesso", "metricas de sucesso",
];

/**
 * Seções de referência (incluídas apenas em quality)
 */
const REFERENCE_SECTIONS = [
    "mcp integration",
    "documentação completa", "documentacao completa",
    "exemplos", "examples",
];

export class SkillLoaderService {
    private contentResolver: ContentResolverService;

    constructor(contentResolver: ContentResolverService) {
        this.contentResolver = contentResolver;
    }

    /**
     * Carrega pacote completo de contexto para uma fase.
     * Retorna null se a fase não tem skill mapeada.
     */
    async loadForPhase(
        faseNome: string,
        mode: "economy" | "balanced" | "quality" = "balanced"
    ): Promise<ContextPackage | null> {
        const skillName = getSkillParaFase(faseNome);
        if (!skillName) return null;

        const budget = TOKEN_BUDGETS[mode];
        const specialist = getSpecialistPersona(faseNome);

        // Carregar conteúdos em paralelo
        const [rawSkill, rawTemplate, rawChecklist, templateFiles, checklistFiles] =
            await Promise.all([
                this.contentResolver.readSkillFile(skillName, "SKILL.md"),
                this.contentResolver.readFirstTemplate(skillName),
                this.contentResolver.readFirstChecklist(skillName),
                this.contentResolver.listSkillResources(skillName, "templates"),
                this.contentResolver.listSkillResources(skillName, "checklists"),
            ]);

        // Processar skill com budget
        const skillContent = rawSkill
            ? this.processSkillContent(rawSkill, mode, budget.skill)
            : "";

        // Processar template com budget
        const templateContent = rawTemplate
            ? this.processTemplateContent(rawTemplate, mode, budget.template)
            : "";

        // Checklist sempre completo (é curto)
        const checklistContent = rawChecklist
            ? this.truncateToTokenBudget(rawChecklist, budget.checklist)
            : "";

        // Links de referência para recursos adicionais
        const referenceLinks: string[] = [];
        for (const t of templateFiles) {
            referenceLinks.push(`maestro://skills/${skillName}/templates/${t}`);
        }
        for (const c of checklistFiles) {
            referenceLinks.push(`maestro://skills/${skillName}/checklists/${c}`);
        }

        const totalTokens =
            this.estimateTokens(skillContent) +
            this.estimateTokens(templateContent) +
            this.estimateTokens(checklistContent);

        const resultMode: ContextPackage["mode"] =
            mode === "economy" ? "summary" : mode === "balanced" ? "summary" : "full";

        return {
            skillName,
            specialist,
            skillContent,
            templateContent,
            checklistContent,
            referenceLinks,
            tokenEstimate: totalTokens,
            mode: resultMode,
        };
    }

    /**
     * Carrega apenas o checklist de gate de uma fase.
     */
    async loadChecklist(faseNome: string): Promise<string | null> {
        const skillName = getSkillParaFase(faseNome);
        if (!skillName) return null;
        return this.contentResolver.readFirstChecklist(skillName);
    }

    /**
     * Carrega apenas o template de uma fase.
     */
    async loadTemplate(faseNome: string): Promise<string | null> {
        const skillName = getSkillParaFase(faseNome);
        if (!skillName) return null;
        return this.contentResolver.readFirstTemplate(skillName);
    }

    /**
     * Formata ContextPackage como markdown para injeção na resposta.
     */
    formatAsMarkdown(pkg: ContextPackage): string {
        const parts: string[] = [];

        // Persona do especialista
        if (pkg.specialist) {
            parts.push(`## 🤖 Especialista: ${pkg.specialist.name}\n`);
            parts.push(`**Tom:** ${pkg.specialist.tone}`);
            parts.push(`**Expertise:** ${pkg.specialist.expertise.join(", ")}`);
            parts.push(`**Instruções:** ${pkg.specialist.instructions}\n`);
        }

        // Conteúdo da skill
        if (pkg.skillContent) {
            parts.push(`## 📋 Instruções do Especialista\n`);
            parts.push(pkg.skillContent);
            parts.push("");
        }

        // Template do entregável
        if (pkg.templateContent) {
            parts.push(`## 📝 Template do Entregável\n`);
            parts.push(pkg.templateContent);
            parts.push("");
        }

        // Checklist de gate
        if (pkg.checklistContent) {
            parts.push(`## ✅ Checklist de Validação (Gate)\n`);
            parts.push(pkg.checklistContent);
            parts.push("");
        }

        // Links de referência
        if (pkg.referenceLinks.length > 0) {
            parts.push(`## 📚 Recursos Adicionais\n`);
            for (const link of pkg.referenceLinks) {
                parts.push(`- \`${link}\``);
            }
            parts.push("");
        }

        // Info de budget
        parts.push(`---`);
        parts.push(`> 📊 Contexto injetado: ~${pkg.tokenEstimate} tokens (modo: ${pkg.mode})`);

        return parts.join("\n");
    }

    /**
     * Processa conteúdo do SKILL.md respeitando budget.
     * Seleciona seções essenciais primeiro, depois opcionais, depois referência.
     */
    private processSkillContent(
        rawContent: string,
        mode: "economy" | "balanced" | "quality",
        tokenBudget: number
    ): string {
        const sections = this.parseMarkdownSections(rawContent);
        const selected: MarkdownSection[] = [];
        let usedTokens = 0;

        // Remover frontmatter YAML se presente
        const contentWithoutFrontmatter = rawContent.replace(/^---[\s\S]*?---\n*/m, "");

        // Fase 1: Seções essenciais (sempre incluídas)
        for (const section of sections) {
            if (this.isSectionMatch(section.heading, ESSENTIAL_SECTIONS)) {
                if (usedTokens + section.tokenEstimate <= tokenBudget) {
                    selected.push(section);
                    usedTokens += section.tokenEstimate;
                }
            }
        }

        // Fase 2: Seções opcionais (balanced/quality)
        if (mode !== "economy") {
            for (const section of sections) {
                if (this.isSectionMatch(section.heading, OPTIONAL_SECTIONS)) {
                    if (usedTokens + section.tokenEstimate <= tokenBudget) {
                        selected.push(section);
                        usedTokens += section.tokenEstimate;
                    }
                }
            }
        }

        // Fase 3: Seções de referência (apenas quality)
        if (mode === "quality") {
            for (const section of sections) {
                if (this.isSectionMatch(section.heading, REFERENCE_SECTIONS)) {
                    if (usedTokens + section.tokenEstimate <= tokenBudget) {
                        selected.push(section);
                        usedTokens += section.tokenEstimate;
                    }
                }
            }
        }

        if (selected.length === 0) {
            // Fallback: truncar conteúdo bruto
            return this.truncateToTokenBudget(contentWithoutFrontmatter, tokenBudget);
        }

        return selected
            .map(s => `${"#".repeat(s.level)} ${s.heading}\n${s.content}`)
            .join("\n\n");
    }

    /**
     * Processa template do entregável respeitando budget.
     * Em economy mode: apenas títulos (skeleton).
     * Em balanced/quality: template completo.
     */
    private processTemplateContent(
        rawContent: string,
        mode: "economy" | "balanced" | "quality",
        tokenBudget: number
    ): string {
        if (mode === "economy") {
            // Skeleton: apenas headings
            return this.extractHeadingsOnly(rawContent);
        }

        return this.truncateToTokenBudget(rawContent, tokenBudget);
    }

    /**
     * Parseia markdown em seções por headings.
     */
    private parseMarkdownSections(content: string): MarkdownSection[] {
        const lines = content.split("\n");
        const sections: MarkdownSection[] = [];
        let currentHeading = "";
        let currentLevel = 0;
        let currentContent: string[] = [];

        for (const line of lines) {
            const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
            if (headingMatch) {
                // Salvar seção anterior
                if (currentHeading) {
                    const contentStr = currentContent.join("\n").trim();
                    sections.push({
                        heading: currentHeading,
                        level: currentLevel,
                        content: contentStr,
                        charCount: contentStr.length,
                        tokenEstimate: this.estimateTokens(contentStr),
                    });
                }
                currentHeading = headingMatch[2];
                currentLevel = headingMatch[1].length;
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        }

        // Última seção
        if (currentHeading) {
            const contentStr = currentContent.join("\n").trim();
            sections.push({
                heading: currentHeading,
                level: currentLevel,
                content: contentStr,
                charCount: contentStr.length,
                tokenEstimate: this.estimateTokens(contentStr),
            });
        }

        return sections;
    }

    /**
     * Verifica se o heading da seção corresponde a uma das seções alvo.
     */
    private isSectionMatch(heading: string, targets: string[]): boolean {
        const normalized = heading
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, "")
            .trim();

        return targets.some(t => normalized.includes(t));
    }

    /**
     * Extrai apenas os headings de um markdown (skeleton).
     */
    private extractHeadingsOnly(content: string): string {
        const lines = content.split("\n");
        const headings = lines.filter(line => line.match(/^#{1,4}\s+/));
        return headings.join("\n");
    }

    /**
     * Estima tokens a partir de caracteres (~4 chars = 1 token).
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /**
     * Trunca texto para caber no budget de tokens.
     */
    private truncateToTokenBudget(text: string, tokenBudget: number): string {
        const maxChars = tokenBudget * 4;
        if (text.length <= maxChars) return text;

        const truncated = text.substring(0, maxChars);
        // Cortar no último parágrafo completo
        const lastNewline = truncated.lastIndexOf("\n\n");
        if (lastNewline > maxChars * 0.7) {
            return truncated.substring(0, lastNewline) + "\n\n> ⚡ *Conteúdo truncado. Consulte o recurso completo via MCP Resources.*";
        }
        return truncated + "\n\n> ⚡ *Conteúdo truncado. Consulte o recurso completo via MCP Resources.*";
    }
}

/**
 * Factory function para criar SkillLoaderService.
 */
export function createSkillLoader(contentResolver: ContentResolverService): SkillLoaderService {
    return new SkillLoaderService(contentResolver);
}
