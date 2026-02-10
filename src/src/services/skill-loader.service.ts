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
import { getCached, setCache } from "./skill-cache.service.js";
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

        // v5.2: Verificar cache antes de ler filesystem
        const cacheKey = `skill:${skillName}:${mode}`;
        const cached = getCached(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as ContextPackage;
            } catch {
                // Cache corrompido, continuar com leitura normal
            }
        }

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

        const result: ContextPackage = {
            skillName,
            specialist,
            skillContent,
            templateContent,
            checklistContent,
            referenceLinks,
            tokenEstimate: totalTokens,
            mode: resultMode,
        };

        // v5.2: Armazenar no cache para evitar re-leitura do filesystem
        setCache(cacheKey, JSON.stringify(result));

        return result;
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
     * v6.0 (P6): Carrega pacote COMPLETO de uma skill SEM truncamento de tokens.
     * Usado pelo specialist-activator para injetar recursos reais no contexto.
     * Diferente de loadForPhase que respeita budget de tokens.
     */
    async loadFullPackage(
        skillName: string
    ): Promise<ContextPackage | null> {
        const cacheKey = `skill-full:${skillName}`;
        const cached = getCached(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as ContextPackage;
            } catch {
                // Cache corrompido
            }
        }

        const specialist = getSpecialistPersona(
            this.skillNameToFaseName(skillName)
        );

        // Carregar TUDO em paralelo, sem truncamento
        const [rawSkill, rawTemplate, rawChecklist, templateFiles, checklistFiles, rawExamples, rawReference] =
            await Promise.all([
                this.contentResolver.readSkillFile(skillName, "SKILL.md"),
                this.contentResolver.readFirstTemplate(skillName),
                this.contentResolver.readFirstChecklist(skillName),
                this.contentResolver.listSkillResources(skillName, "templates"),
                this.contentResolver.listSkillResources(skillName, "checklists"),
                this.safeReadResource(skillName, "examples"),
                this.safeReadResource(skillName, "reference"),
            ]);

        const skillContent = rawSkill || "";
        const templateContent = rawTemplate || "";
        const checklistContent = rawChecklist || "";

        // Incluir exemplos e referência no skillContent se disponíveis
        let fullSkillContent = skillContent;
        if (rawExamples) {
            fullSkillContent += `\n\n## Exemplos\n\n${rawExamples}`;
        }
        if (rawReference) {
            fullSkillContent += `\n\n## Referência\n\n${rawReference}`;
        }

        const referenceLinks: string[] = [];
        for (const t of templateFiles) {
            referenceLinks.push(`maestro://skills/${skillName}/templates/${t}`);
        }
        for (const c of checklistFiles) {
            referenceLinks.push(`maestro://skills/${skillName}/checklists/${c}`);
        }

        const totalTokens =
            this.estimateTokens(fullSkillContent) +
            this.estimateTokens(templateContent) +
            this.estimateTokens(checklistContent);

        const result: ContextPackage = {
            skillName,
            specialist,
            skillContent: fullSkillContent,
            templateContent,
            checklistContent,
            referenceLinks,
            tokenEstimate: totalTokens,
            mode: "full",
        };

        setCache(cacheKey, JSON.stringify(result));
        return result;
    }

    /**
     * v6.0: Carrega por nome da skill diretamente (sem mapear de fase)
     */
    async loadBySkillName(
        skillName: string,
        mode: "economy" | "balanced" | "quality" = "balanced"
    ): Promise<ContextPackage | null> {
        const cacheKey = `skill:${skillName}:${mode}`;
        const cached = getCached(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as ContextPackage;
            } catch {
                // Cache corrompido
            }
        }

        const budget = TOKEN_BUDGETS[mode];
        const specialist = getSpecialistPersona(
            this.skillNameToFaseName(skillName)
        );

        const [rawSkill, rawTemplate, rawChecklist, templateFiles, checklistFiles] =
            await Promise.all([
                this.contentResolver.readSkillFile(skillName, "SKILL.md"),
                this.contentResolver.readFirstTemplate(skillName),
                this.contentResolver.readFirstChecklist(skillName),
                this.contentResolver.listSkillResources(skillName, "templates"),
                this.contentResolver.listSkillResources(skillName, "checklists"),
            ]);

        const skillContent = rawSkill
            ? this.processSkillContent(rawSkill, mode, budget.skill)
            : "";
        const templateContent = rawTemplate
            ? this.processTemplateContent(rawTemplate, mode, budget.template)
            : "";
        const checklistContent = rawChecklist
            ? this.truncateToTokenBudget(rawChecklist, budget.checklist)
            : "";

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

        const result: ContextPackage = {
            skillName,
            specialist,
            skillContent,
            templateContent,
            checklistContent,
            referenceLinks,
            tokenEstimate: totalTokens,
            mode: resultMode,
        };

        setCache(cacheKey, JSON.stringify(result));
        return result;
    }

    /**
     * v7.0 (Sprint 2 — NP6, NP8): Carrega pacote resumido para fase collecting.
     * Inclui esqueleto do template (headings + primeiros campos) + checklist resumido.
     * Budget: ~1500 tokens — suficiente para guiar perguntas inteligentes.
     */
    async loadCollectingPackage(
        skillName: string
    ): Promise<{ templateSkeleton: string; checklistSummary: string; skillGuide: string; tokenEstimate: number } | null> {
        const cacheKey = `skill-collecting:${skillName}`;
        const cached = getCached(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                // Cache corrompido
            }
        }

        const [rawSkill, rawTemplate, rawChecklist] = await Promise.all([
            this.contentResolver.readSkillFile(skillName, "SKILL.md"),
            this.contentResolver.readFirstTemplate(skillName),
            this.contentResolver.readFirstChecklist(skillName),
        ]);

        // Esqueleto do template: headings + primeiras linhas de cada seção
        const templateSkeleton = rawTemplate
            ? this.extractTemplateSkeleton(rawTemplate)
            : "PRD estruturado com: Sumário Executivo, Problema, Personas, MVP, Métricas, Riscos, Timeline";

        // Checklist resumido: categorias + pesos
        const checklistSummary = rawChecklist
            ? this.extractChecklistSummary(rawChecklist)
            : "";

        // Guia da skill: seções de processo e quality gate
        const skillGuide = rawSkill
            ? this.extractSkillGuide(rawSkill)
            : "";

        const tokenEstimate =
            this.estimateTokens(templateSkeleton) +
            this.estimateTokens(checklistSummary) +
            this.estimateTokens(skillGuide);

        const result = { templateSkeleton, checklistSummary, skillGuide, tokenEstimate };
        setCache(cacheKey, JSON.stringify(result));
        return result;
    }

    /**
     * Extrai esqueleto do template: headings + primeiras linhas de cada seção
     */
    private extractTemplateSkeleton(template: string): string {
        const lines = template.split("\n");
        const skeleton: string[] = [];
        let inSection = false;
        let sectionLines = 0;

        for (const line of lines) {
            const isHeading = /^#{1,4}\s+/.test(line);
            if (isHeading) {
                skeleton.push(line);
                inSection = true;
                sectionLines = 0;
            } else if (inSection && sectionLines < 2 && line.trim()) {
                skeleton.push(line);
                sectionLines++;
            } else if (line.trim() === '') {
                if (inSection && sectionLines > 0) {
                    inSection = false;
                }
            }
        }

        return skeleton.join("\n");
    }

    /**
     * Extrai resumo do checklist: categorias + pesos
     */
    private extractChecklistSummary(checklist: string): string {
        const lines = checklist.split("\n");
        const summary: string[] = [];

        for (const line of lines) {
            if (/^#{1,4}\s+/.test(line) || /^\*\*/.test(line.trim()) || /^-\s+\[/.test(line.trim())) {
                summary.push(line);
            }
        }

        return summary.slice(0, 20).join("\n");
    }

    /**
     * Extrai guia da skill: seções de processo otimizado e quality gate
     */
    private extractSkillGuide(skill: string): string {
        const sections = this.parseMarkdownSections(skill);
        const guideSections = sections.filter(s =>
            this.isSectionMatch(s.heading, ["processo otimizado", "processo", "quality gate", "inputs obrigatorios", "inputs obrigatórios"])
        );

        if (guideSections.length === 0) return "";

        return guideSections
            .map(s => `${"#".repeat(s.level)} ${s.heading}\n${this.truncateToTokenBudget(s.content, 200)}`)
            .join("\n\n");
    }

    /**
     * v6.0: Helper para ler primeiro recurso de um tipo (examples, reference)
     */
    private async safeReadResource(skillName: string, resourceType: "examples" | "templates" | "checklists" | "reference"): Promise<string | null> {
        try {
            const files = await this.contentResolver.listSkillResources(skillName, resourceType);
            if (files.length > 0) {
                return this.contentResolver.readSkillFile(skillName, `resources/${resourceType}/${files[0]}`);
            }
        } catch {
            // Recurso não encontrado
        }
        return null;
    }

    /**
     * v6.0: Mapeia nome da skill para nome da fase (para buscar persona)
     */
    private skillNameToFaseName(skillName: string): string {
        const map: Record<string, string> = {
            "specialist-gestao-produto": "Produto",
            "specialist-requisitos": "Requisitos",
            "specialist-ux-design": "UX Design",
            "specialist-arquitetura": "Arquitetura",
            "specialist-backlog": "Backlog",
            "specialist-frontend": "Frontend",
            "specialist-backend": "Backend",
            "specialist-devops": "DevOps",
            "specialist-testes": "Testes",
            "specialist-seguranca": "Segurança",
            "specialist-integracao": "Integração",
        };
        return map[skillName] || skillName;
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
