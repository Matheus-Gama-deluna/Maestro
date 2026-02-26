/**
 * Prototype Phase Handler (v9.0)
 * 
 * Handler dedicado para a fase de Prototipagem com Google Stitch.
 * Gerencia o ciclo completo:
 *   analyzing → prompts_generated → awaiting_html → validating_html → approved
 * 
 * Fluxo:
 * 1. ANALYZING: Lê Design Doc + docs anteriores, mapeia componentes/telas
 * 2. PROMPTS_GENERATED: Gera prompts otimizados para Google Stitch, salva em arquivo
 * 3. AWAITING_HTML: Aguarda usuário retornar com arquivos HTML do Stitch
 * 4. VALIDATING_HTML: Valida arquivos HTML na pasta prototipos/
 * 5. APPROVED: Protótipos validados, avança para próxima fase
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { OnboardingState } from "../types/onboarding.js";
import { formatResponse, formatError } from "../utils/response-formatter.js";
import { serializarEstado } from "../state/storage.js";
import { saveFile } from "../utils/persistence.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { existsSync, readFileSync, readdirSync, mkdirSync, statSync } from "fs";
import { join, basename, extname } from "path";
import { detectIDE, getSkillFilePath, getSkillsDir, type IDEType } from "../utils/ide-paths.js";

// === CONSTANTES ===

/** Pasta onde os protótipos HTML devem ser colocados pelo usuário */
const PROTOTYPE_OUTPUT_DIR = 'prototipos';

/** Pasta de prompts gerados */
const PROMPTS_OUTPUT_FILE = 'prototipos/stitch-prompts.md';

/** Documento de validação final */
const VALIDATION_OUTPUT_FILE = 'prototipos/validacao-prototipos.md';

/** Sub-estados da fase de prototipagem */
export type PrototypePhaseStatus =
    | 'analyzing'
    | 'prompts_generated'
    | 'awaiting_html'
    | 'validating_html'
    | 'approved';

/** Estado persistido no specialistPhase.collectedData para prototipagem */
interface PrototypePhaseData {
    prototypeStatus: PrototypePhaseStatus;
    designDocPath?: string;
    designDocContent?: string;
    mappedComponents?: string[];
    mappedScreens?: string[];
    designSystem?: string;
    promptsGenerated?: boolean;
    promptsFilePath?: string;
    htmlFiles?: string[];
    validationScore?: number;
    validationDetails?: string;
    iterationCount: number;
}

interface PrototypePhaseArgs {
    estado: EstadoProjeto;
    diretorio: string;
    respostas?: Record<string, unknown>;
    entregavel?: string;
}

// === HELPERS ===

function getPrototypeDir(diretorio: string): string {
    return join(diretorio, PROTOTYPE_OUTPUT_DIR);
}

function getPromptsFilePath(diretorio: string): string {
    return join(diretorio, PROMPTS_OUTPUT_FILE);
}

function getValidationFilePath(diretorio: string): string {
    return join(diretorio, VALIDATION_OUTPUT_FILE);
}

/**
 * Cria a pasta prototipos/ se não existir
 */
function ensurePrototypeDir(diretorio: string): string {
    const dir = getPrototypeDir(diretorio);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return dir;
}

/**
 * Busca arquivos HTML na pasta prototipos/
 */
function findHtmlFiles(diretorio: string): string[] {
    const dir = getPrototypeDir(diretorio);
    if (!existsSync(dir)) return [];

    try {
        const files = readdirSync(dir, { recursive: true }) as string[];
        return files
            .filter(f => {
                const ext = extname(String(f)).toLowerCase();
                return ext === '.html' || ext === '.htm';
            })
            .map(f => String(f));
    } catch {
        return [];
    }
}

/** Resultado detalhado de validação por categoria (alinhado ao checklist de 100 pontos) */
interface ValidationCategoryResult {
    name: string;
    maxPoints: number;
    earnedPoints: number;
    items: Array<{ name: string; maxPoints: number; earnedPoints: number; status: '✅' | '⚠️' | '❌' }>;
}

interface DetailedValidationResult {
    score: number;
    categories: ValidationCategoryResult[];
    fileDetails: Array<{ file: string; size: number; hasContent: boolean; hasStructure: boolean; hasCss: boolean }>;
    summary: string;
    gaps: string[];
    strengths: string[];
}

/**
 * Analisa um arquivo HTML e retorna métricas detalhadas
 */
function analyzeHtmlFile(content: string): {
    componentCount: number;
    uniqueClasses: number;
    hasMediaQueries: boolean;
    mediaQueryCount: number;
    hasForms: boolean;
    formCount: number;
    hasHoverStates: boolean;
    hasLoadingStates: boolean;
    hasErrorStates: boolean;
    hasDisabledStates: boolean;
    hasNavigation: boolean;
    hasButtons: boolean;
    buttonCount: number;
    hasInputs: boolean;
    inputCount: number;
    hasModals: boolean;
    hasTables: boolean;
    hasCards: boolean;
    hasIcons: boolean;
    hasAlerts: boolean;
    hasBadges: boolean;
    hasTooltips: boolean;
    hasColorVariables: boolean;
    hasFontFamily: boolean;
    hasFontSizes: boolean;
    hasFlexOrGrid: boolean;
    hasTransitions: boolean;
    hasAnimations: boolean;
    hasAriaAttributes: boolean;
    linkCount: number;
    imageCount: number;
    sectionCount: number;
    cssSize: number;
    totalSize: number;
} {
    const lower = content.toLowerCase();

    // Componentes
    const divCount = (content.match(/<div/gi) || []).length;
    const sectionTags = (content.match(/<(section|article|aside|header|footer|main|nav)/gi) || []).length;
    const componentCount = divCount + sectionTags;

    // CSS classes
    const classMatches = content.match(/class="([^"]*)"/gi) || [];
    const allClasses = classMatches.flatMap(m => (m.match(/class="([^"]*)"/i)?.[1] || '').split(/\s+/));
    const uniqueClasses = new Set(allClasses.filter(c => c.length > 0)).size;

    // Media queries (responsividade)
    const mediaQueryMatches = content.match(/@media/gi) || [];
    const hasMediaQueries = mediaQueryMatches.length > 0;
    const mediaQueryCount = mediaQueryMatches.length;

    // Forms
    const formMatches = content.match(/<form/gi) || [];
    const hasForms = formMatches.length > 0;
    const formCount = formMatches.length;

    // Estados
    const hasHoverStates = /:hover/i.test(content);
    const hasLoadingStates = /loading|spinner|skeleton|shimmer|pulse/i.test(content);
    const hasErrorStates = /error|invalid|danger|alert-danger|text-red|text-danger/i.test(content);
    const hasDisabledStates = /disabled|:disabled|opacity.*0\.[3-5]|cursor.*not-allowed/i.test(content);

    // Navegação
    const hasNavigation = /<nav/i.test(content) || /navbar|sidebar|menu|breadcrumb/i.test(content);

    // Botões
    const buttonMatches = content.match(/<button/gi) || [];
    const btnClassMatches = content.match(/class="[^"]*btn[^"]*"/gi) || [];
    const hasButtons = buttonMatches.length > 0 || btnClassMatches.length > 0;
    const buttonCount = Math.max(buttonMatches.length, btnClassMatches.length);

    // Inputs
    const inputMatches = content.match(/<input/gi) || [];
    const selectMatches = content.match(/<select/gi) || [];
    const textareaMatches = content.match(/<textarea/gi) || [];
    const hasInputs = inputMatches.length + selectMatches.length + textareaMatches.length > 0;
    const inputCount = inputMatches.length + selectMatches.length + textareaMatches.length;

    // Componentes UI
    const hasModals = /modal|dialog|overlay|backdrop/i.test(content);
    const hasTables = /<table/i.test(content);
    const hasCards = /card|panel/i.test(content);
    const hasIcons = /icon|svg|fa-|material-icons|lucide/i.test(content);
    const hasAlerts = /alert|notification|toast|snackbar/i.test(content);
    const hasBadges = /badge|chip|tag|label/i.test(content);
    const hasTooltips = /tooltip|popover/i.test(content);

    // Design System
    const hasColorVariables = /--[a-z]+-color|--primary|--secondary|--accent|var\(--/i.test(content);
    const hasFontFamily = /font-family/i.test(content);
    const hasFontSizes = /font-size/i.test(content);
    const hasFlexOrGrid = /display\s*:\s*(flex|grid)/i.test(content);
    const hasTransitions = /transition/i.test(content);
    const hasAnimations = /animation|@keyframes/i.test(content);

    // Acessibilidade
    const hasAriaAttributes = /aria-|role="/i.test(content);

    // Contagens
    const linkCount = (content.match(/<a\s/gi) || []).length;
    const imageCount = (content.match(/<img/gi) || []).length;
    const sectionCount = sectionTags;

    // CSS size
    const styleBlocks = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
    const cssSize = styleBlocks.reduce((acc, block) => acc + block.length, 0);

    return {
        componentCount, uniqueClasses, hasMediaQueries, mediaQueryCount,
        hasForms, formCount, hasHoverStates, hasLoadingStates, hasErrorStates,
        hasDisabledStates, hasNavigation, hasButtons, buttonCount, hasInputs,
        inputCount, hasModals, hasTables, hasCards, hasIcons, hasAlerts,
        hasBadges, hasTooltips, hasColorVariables, hasFontFamily, hasFontSizes,
        hasFlexOrGrid, hasTransitions, hasAnimations, hasAriaAttributes,
        linkCount, imageCount, sectionCount, cssSize, totalSize: content.length,
    };
}

/**
 * Valida os arquivos HTML com scoring granular alinhado ao checklist (100 pontos)
 * 
 * Categorias:
 * - Componentes: 40 pts (principais 20, design system 10, estados 5, reutilização 5)
 * - Fluxos: 30 pts (principais 15, navegação 5, feedback visual 5, erros 5)
 * - Design: 20 pts (cores 5, tipografia 5, espaçamento 5, responsividade 5)
 * - Qualidade: 10 pts (código exportado 5, feedback stakeholders 3, documentação 2)
 */
function validateHtmlFiles(diretorio: string, htmlFiles: string[]): DetailedValidationResult {
    const dir = getPrototypeDir(diretorio);
    const fileDetails: DetailedValidationResult['fileDetails'] = [];
    const allAnalyses: ReturnType<typeof analyzeHtmlFile>[] = [];

    // Analisar cada arquivo
    for (const file of htmlFiles) {
        const fullPath = join(dir, file);
        try {
            const content = readFileSync(fullPath, 'utf-8');
            const stat = statSync(fullPath);
            const analysis = analyzeHtmlFile(content);
            allAnalyses.push(analysis);
            fileDetails.push({
                file,
                size: stat.size,
                hasContent: content.trim().length > 100,
                hasStructure: /<html/i.test(content) || /<div/i.test(content) || /<body/i.test(content),
                hasCss: /<style/i.test(content) || /class="/i.test(content),
            });
        } catch {
            fileDetails.push({ file, size: 0, hasContent: false, hasStructure: false, hasCss: false });
        }
    }

    if (allAnalyses.length === 0) {
        return {
            score: 0,
            categories: [],
            fileDetails,
            summary: '❌ Nenhum arquivo HTML válido encontrado',
            gaps: ['Nenhum arquivo HTML válido na pasta prototipos/'],
            strengths: [],
        };
    }

    // Agregar métricas de todos os arquivos
    const totalComponents = allAnalyses.reduce((s, a) => s + a.componentCount, 0);
    const totalUniqueClasses = allAnalyses.reduce((s, a) => s + a.uniqueClasses, 0);
    const totalButtons = allAnalyses.reduce((s, a) => s + a.buttonCount, 0);
    const totalInputs = allAnalyses.reduce((s, a) => s + a.inputCount, 0);
    const totalLinks = allAnalyses.reduce((s, a) => s + a.linkCount, 0);
    const totalCssSize = allAnalyses.reduce((s, a) => s + a.cssSize, 0);
    const anyHasNav = allAnalyses.some(a => a.hasNavigation);
    const anyHasForms = allAnalyses.some(a => a.hasForms);
    const anyHasModals = allAnalyses.some(a => a.hasModals);
    const anyHasTables = allAnalyses.some(a => a.hasTables);
    const anyHasCards = allAnalyses.some(a => a.hasCards);
    const anyHasIcons = allAnalyses.some(a => a.hasIcons);
    const anyHasAlerts = allAnalyses.some(a => a.hasAlerts);
    const anyHasBadges = allAnalyses.some(a => a.hasBadges);
    const anyHasTooltips = allAnalyses.some(a => a.hasTooltips);
    const anyHasHover = allAnalyses.some(a => a.hasHoverStates);
    const anyHasLoading = allAnalyses.some(a => a.hasLoadingStates);
    const anyHasError = allAnalyses.some(a => a.hasErrorStates);
    const anyHasDisabled = allAnalyses.some(a => a.hasDisabledStates);
    const anyHasMediaQueries = allAnalyses.some(a => a.hasMediaQueries);
    const totalMediaQueries = allAnalyses.reduce((s, a) => s + a.mediaQueryCount, 0);
    const anyHasColorVars = allAnalyses.some(a => a.hasColorVariables);
    const anyHasFontFamily = allAnalyses.some(a => a.hasFontFamily);
    const anyHasFontSizes = allAnalyses.some(a => a.hasFontSizes);
    const anyHasFlexGrid = allAnalyses.some(a => a.hasFlexOrGrid);
    const anyHasTransitions = allAnalyses.some(a => a.hasTransitions);
    const anyHasAnimations = allAnalyses.some(a => a.hasAnimations);
    const anyHasAria = allAnalyses.some(a => a.hasAriaAttributes);

    // Contar tipos de componentes UI presentes
    const uiComponentTypes = [anyHasNav, anyHasForms, anyHasModals, anyHasTables, anyHasCards,
        anyHasIcons, anyHasAlerts, anyHasBadges, anyHasTooltips,
        totalButtons > 0, totalInputs > 0].filter(Boolean).length;

    // === CATEGORIA 1: COMPONENTES (40 pontos) ===
    // 1.1 Componentes principais presentes (20 pts)
    let componentScore = 0;
    if (totalComponents >= 30 && uiComponentTypes >= 6) componentScore = 20;
    else if (totalComponents >= 20 && uiComponentTypes >= 4) componentScore = 15;
    else if (totalComponents >= 10 && uiComponentTypes >= 3) componentScore = 10;
    else if (totalComponents >= 5) componentScore = 5;

    // 1.2 Design System aderência (10 pts)
    let dsScore = 0;
    if (anyHasColorVars) dsScore += 3;
    if (anyHasFontFamily) dsScore += 2;
    if (anyHasFontSizes) dsScore += 2;
    if (totalUniqueClasses >= 20) dsScore += 3;
    else if (totalUniqueClasses >= 10) dsScore += 2;
    else if (totalUniqueClasses >= 5) dsScore += 1;
    dsScore = Math.min(dsScore, 10);

    // 1.3 Estados implementados (5 pts)
    let statesScore = 0;
    const stateCount = [anyHasHover, anyHasLoading, anyHasError, anyHasDisabled].filter(Boolean).length;
    if (stateCount >= 4) statesScore = 5;
    else if (stateCount >= 2) statesScore = 3;
    else if (stateCount >= 1) statesScore = 1;

    // 1.4 Reutilização (5 pts)
    let reuseScore = 0;
    if (totalUniqueClasses >= 30 && allAnalyses.length >= 3) reuseScore = 5;
    else if (totalUniqueClasses >= 15 && allAnalyses.length >= 2) reuseScore = 3;
    else if (totalUniqueClasses >= 5) reuseScore = 1;

    const componentsCategory: ValidationCategoryResult = {
        name: 'Componentes',
        maxPoints: 40,
        earnedPoints: componentScore + dsScore + statesScore + reuseScore,
        items: [
            { name: 'Componentes principais presentes', maxPoints: 20, earnedPoints: componentScore, status: componentScore >= 15 ? '✅' : componentScore >= 10 ? '⚠️' : '❌' },
            { name: 'Design System aderência', maxPoints: 10, earnedPoints: dsScore, status: dsScore >= 7 ? '✅' : dsScore >= 5 ? '⚠️' : '❌' },
            { name: 'Estados implementados', maxPoints: 5, earnedPoints: statesScore, status: statesScore >= 3 ? '✅' : statesScore >= 1 ? '⚠️' : '❌' },
            { name: 'Reutilização', maxPoints: 5, earnedPoints: reuseScore, status: reuseScore >= 3 ? '✅' : reuseScore >= 1 ? '⚠️' : '❌' },
        ],
    };

    // === CATEGORIA 2: FLUXOS (30 pontos) ===
    // 2.1 Fluxos principais (15 pts)
    let flowScore = 0;
    const hasMultiplePages = allAnalyses.length >= 3;
    const hasInteractivity = totalButtons > 0 && totalLinks > 0;
    if (hasMultiplePages && hasInteractivity && anyHasForms) flowScore = 15;
    else if (hasMultiplePages && hasInteractivity) flowScore = 10;
    else if (allAnalyses.length >= 2 && (totalButtons > 0 || totalLinks > 0)) flowScore = 7;
    else if (allAnalyses.length >= 1) flowScore = 3;

    // 2.2 Navegação (5 pts)
    let navScore = 0;
    if (anyHasNav && totalLinks >= 5) navScore = 5;
    else if (anyHasNav || totalLinks >= 3) navScore = 3;
    else if (totalLinks >= 1) navScore = 1;

    // 2.3 Feedback visual (5 pts)
    let feedbackScore = 0;
    const feedbackElements = [anyHasLoading, anyHasAlerts, anyHasTransitions, anyHasAnimations].filter(Boolean).length;
    if (feedbackElements >= 3) feedbackScore = 5;
    else if (feedbackElements >= 2) feedbackScore = 3;
    else if (feedbackElements >= 1) feedbackScore = 1;

    // 2.4 Tratamento de erros (5 pts)
    let errorScore = 0;
    if (anyHasError && anyHasForms && anyHasAlerts) errorScore = 5;
    else if (anyHasError && (anyHasForms || anyHasAlerts)) errorScore = 3;
    else if (anyHasError) errorScore = 1;

    const flowsCategory: ValidationCategoryResult = {
        name: 'Fluxos',
        maxPoints: 30,
        earnedPoints: flowScore + navScore + feedbackScore + errorScore,
        items: [
            { name: 'Fluxos principais funcionam', maxPoints: 15, earnedPoints: flowScore, status: flowScore >= 10 ? '✅' : flowScore >= 7 ? '⚠️' : '❌' },
            { name: 'Navegação intuitiva', maxPoints: 5, earnedPoints: navScore, status: navScore >= 3 ? '✅' : navScore >= 1 ? '⚠️' : '❌' },
            { name: 'Feedback visual', maxPoints: 5, earnedPoints: feedbackScore, status: feedbackScore >= 3 ? '✅' : feedbackScore >= 1 ? '⚠️' : '❌' },
            { name: 'Tratamento de erros', maxPoints: 5, earnedPoints: errorScore, status: errorScore >= 3 ? '✅' : errorScore >= 1 ? '⚠️' : '❌' },
        ],
    };

    // === CATEGORIA 3: DESIGN (20 pontos) ===
    // 3.1 Cores (5 pts)
    let colorScore = 0;
    if (anyHasColorVars && totalCssSize > 500) colorScore = 5;
    else if (totalCssSize > 300) colorScore = 3;
    else if (totalCssSize > 100) colorScore = 1;

    // 3.2 Tipografia (5 pts)
    let typoScore = 0;
    if (anyHasFontFamily && anyHasFontSizes) typoScore = 5;
    else if (anyHasFontFamily || anyHasFontSizes) typoScore = 3;
    else if (totalCssSize > 200) typoScore = 1;

    // 3.3 Espaçamento (5 pts)
    let spacingScore = 0;
    if (anyHasFlexGrid && totalUniqueClasses >= 15) spacingScore = 5;
    else if (anyHasFlexGrid || totalUniqueClasses >= 10) spacingScore = 3;
    else if (totalCssSize > 100) spacingScore = 1;

    // 3.4 Responsividade (5 pts)
    let responsiveScore = 0;
    if (totalMediaQueries >= 3) responsiveScore = 5;
    else if (totalMediaQueries >= 2) responsiveScore = 3;
    else if (anyHasMediaQueries) responsiveScore = 1;

    const designCategory: ValidationCategoryResult = {
        name: 'Design',
        maxPoints: 20,
        earnedPoints: colorScore + typoScore + spacingScore + responsiveScore,
        items: [
            { name: 'Cores do Design System', maxPoints: 5, earnedPoints: colorScore, status: colorScore >= 3 ? '✅' : colorScore >= 1 ? '⚠️' : '❌' },
            { name: 'Tipografia consistente', maxPoints: 5, earnedPoints: typoScore, status: typoScore >= 3 ? '✅' : typoScore >= 1 ? '⚠️' : '❌' },
            { name: 'Espaçamento uniforme', maxPoints: 5, earnedPoints: spacingScore, status: spacingScore >= 3 ? '✅' : spacingScore >= 1 ? '⚠️' : '❌' },
            { name: 'Responsividade', maxPoints: 5, earnedPoints: responsiveScore, status: responsiveScore >= 3 ? '✅' : responsiveScore >= 1 ? '⚠️' : '❌' },
        ],
    };

    // === CATEGORIA 4: QUALIDADE (10 pontos) ===
    // 4.1 Código exportado (5 pts)
    let codeScore = 0;
    const allHaveContent = fileDetails.every(f => f.hasContent && f.hasStructure);
    const allHaveCss = fileDetails.every(f => f.hasCss);
    if (allHaveContent && allHaveCss && allAnalyses.length >= 3) codeScore = 5;
    else if (allHaveContent && allHaveCss) codeScore = 3;
    else if (allHaveContent) codeScore = 1;

    // 4.2 Feedback stakeholders (3 pts) — verificar se existe documento de feedback
    let feedbackStakeholderScore = 0;
    const feedbackDocPath = join(diretorio, 'prototipos', 'feedback-stakeholders.md');
    const validationDocPath = getValidationFilePath(diretorio);
    if (existsSync(feedbackDocPath)) feedbackStakeholderScore = 3;
    else if (existsSync(validationDocPath)) feedbackStakeholderScore = 1;

    // 4.3 Documentação (2 pts) — verificar se existe prototipos.md
    let docScore = 0;
    const protoDocPath = join(diretorio, 'prototipos', 'prototipos.md');
    const promptsPath = getPromptsFilePath(diretorio);
    if (existsSync(protoDocPath) && existsSync(promptsPath)) docScore = 2;
    else if (existsSync(protoDocPath) || existsSync(promptsPath)) docScore = 1;

    const qualityCategory: ValidationCategoryResult = {
        name: 'Qualidade',
        maxPoints: 10,
        earnedPoints: codeScore + feedbackStakeholderScore + docScore,
        items: [
            { name: 'Código exportado disponível', maxPoints: 5, earnedPoints: codeScore, status: codeScore >= 3 ? '✅' : codeScore >= 1 ? '⚠️' : '❌' },
            { name: 'Feedback stakeholders', maxPoints: 3, earnedPoints: feedbackStakeholderScore, status: feedbackStakeholderScore >= 2 ? '✅' : feedbackStakeholderScore >= 1 ? '⚠️' : '❌' },
            { name: 'Documentação completa', maxPoints: 2, earnedPoints: docScore, status: docScore >= 1 ? '✅' : '❌' },
        ],
    };

    // === SCORE TOTAL ===
    const categories = [componentsCategory, flowsCategory, designCategory, qualityCategory];
    const totalScore = categories.reduce((s, c) => s + c.earnedPoints, 0);

    // Identificar gaps e strengths
    const gaps: string[] = [];
    const strengths: string[] = [];
    for (const cat of categories) {
        for (const item of cat.items) {
            if (item.status === '❌') gaps.push(`${item.name} (${item.earnedPoints}/${item.maxPoints})`);            else if (item.status === '⚠️') gaps.push(`${item.name} — pode melhorar (${item.earnedPoints}/${item.maxPoints})`);
            else strengths.push(`${item.name} (${item.earnedPoints}/${item.maxPoints})`);
        }
    }

    // Gerar summary
    const fileSummary = fileDetails.map(d =>
        `${d.hasContent && d.hasStructure ? '✅' : d.hasContent ? '⚠️' : '❌'} **${d.file}** — ${formatSize(d.size)}${d.hasCss ? '' : ' (sem CSS)'}${d.hasStructure ? '' : ' (sem estrutura HTML)'}`
    ).join('\n');

    const categorySummary = categories.map(c =>
        `### ${c.name} (${c.earnedPoints}/${c.maxPoints})\n${c.items.map(i => `${i.status} ${i.name}: ${i.earnedPoints}/${i.maxPoints}`).join('\n')}`
    ).join('\n\n');

    return {
        score: totalScore,
        categories,
        fileDetails,
        summary: `## 📄 Arquivos\n\n${fileSummary}\n\n## 📊 Detalhamento por Categoria\n\n${categorySummary}`,
        gaps,
        strengths,
    };
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Tenta localizar o Design Doc da fase anterior (UX Design)
 */
function findDesignDoc(diretorio: string, estado: EstadoProjeto): { path: string; content: string } | null {
    // Tentar paths comuns do Design Doc
    const candidates = [
        join(diretorio, 'docs/03-ux-design/design-doc.md'),
        join(diretorio, 'docs/fase-03-ux-design/design-doc.md'),
        join(diretorio, 'docs/03-ux/design-doc.md'),
        join(diretorio, 'docs/fase-03-ux/design-doc.md'),
    ];

    // Também verificar entregáveis salvos no estado
    for (const key of Object.keys(estado.entregaveis || {})) {
        const path = estado.entregaveis[key];
        if (path && existsSync(path)) {
            const content = readFileSync(path, 'utf-8');
            if (content.toLowerCase().includes('design') || content.toLowerCase().includes('ux')) {
                return { path, content };
            }
        }
    }

    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            try {
                return { path: candidate, content: readFileSync(candidate, 'utf-8') };
            } catch { /* ignore */ }
        }
    }

    // Buscar qualquer .md em docs/ que contenha "design"
    try {
        const docsDir = join(diretorio, 'docs');
        if (existsSync(docsDir)) {
            const walkDir = (dir: string): string[] => {
                const results: string[] = [];
                try {
                    const entries = readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = join(dir, entry.name);
                        if (entry.isDirectory()) {
                            results.push(...walkDir(fullPath));
                        } else if (entry.name.toLowerCase().includes('design') && extname(entry.name) === '.md') {
                            results.push(fullPath);
                        }
                    }
                } catch { /* ignore */ }
                return results;
            };
            const designFiles = walkDir(docsDir);
            if (designFiles.length > 0) {
                const content = readFileSync(designFiles[0], 'utf-8');
                return { path: designFiles[0], content };
            }
        }
    } catch { /* ignore */ }

    return null;
}

/**
 * Resolve a IDE do projeto
 */
function resolveIDE(estado: EstadoProjeto, diretorio: string): IDEType {
    return estado.ide || detectIDE(diretorio) || 'windsurf';
}

/**
 * Persiste estado atualizado
 */
async function persistState(
    estado: EstadoProjeto,
    diretorio: string
): Promise<void> {
    estado.atualizado_em = new Date().toISOString();
    const estadoFile = serializarEstado(estado);
    try {
        await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
        console.error('[prototype-phase] Erro ao salvar estado:', err);
    }
}

/**
 * Obtém ou inicializa os dados da fase de prototipagem
 */
function getPrototypeData(collectedData: Record<string, any>): PrototypePhaseData {
    return {
        prototypeStatus: collectedData.prototypeStatus || 'analyzing',
        designDocPath: collectedData.designDocPath,
        designDocContent: collectedData.designDocContent,
        mappedComponents: collectedData.mappedComponents || [],
        mappedScreens: collectedData.mappedScreens || [],
        designSystem: collectedData.designSystem,
        promptsGenerated: collectedData.promptsGenerated || false,
        promptsFilePath: collectedData.promptsFilePath,
        htmlFiles: collectedData.htmlFiles || [],
        validationScore: collectedData.validationScore,
        validationDetails: collectedData.validationDetails,
        iterationCount: collectedData.iterationCount || 0,
    };
}

function savePrototypeData(collectedData: Record<string, any>, data: PrototypePhaseData): void {
    Object.assign(collectedData, data);
}

// === ENTRY POINT ===

/**
 * Entry point do prototype phase handler.
 * Detecta sub-estado e delega para o handler correto.
 */
export async function handlePrototypePhase(args: PrototypePhaseArgs): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const onboarding = estado.onboarding;
    const sp = onboarding?.specialistPhase;

    if (!sp) {
        return {
            content: formatError(
                "prototype-phase",
                "Nenhuma fase de especialista ativa encontrada.",
                `Use \`maestro({diretorio: "${diretorio}"})\` para verificar o status do projeto.`
            ),
            isError: true,
        };
    }

    const data = getPrototypeData(sp.collectedData);

    // Criar pasta prototipos/ automaticamente
    ensurePrototypeDir(diretorio);

    switch (data.prototypeStatus) {
        case 'analyzing':
            return handleAnalyzing(args, sp, data);

        case 'prompts_generated':
            return handlePromptsGenerated(args, sp, data);

        case 'awaiting_html': {
            // Verificar se há HTMLs na pasta
            const htmlFiles = findHtmlFiles(diretorio);
            if (htmlFiles.length > 0) {
                data.prototypeStatus = 'validating_html';
                data.htmlFiles = htmlFiles;
                savePrototypeData(sp.collectedData, data);
                return handleValidatingHtml(args, sp, data);
            }
            return handleAwaitingHtml(args, sp, data);
        }

        case 'validating_html':
            return handleValidatingHtml(args, sp, data);

        case 'approved':
            return handleApproved(args, sp, data);

        default:
            return {
                content: formatError(
                    "prototype-phase",
                    `Sub-estado desconhecido: ${data.prototypeStatus}`,
                    `Use \`executar({diretorio: "${diretorio}", acao: "avancar"})\` para tentar avançar.`
                ),
                isError: true,
            };
    }
}

// === SUB-HANDLERS ===

/**
 * Etapa 1: ANALYZING
 * Lê Design Doc, mapeia componentes e telas, prepara contexto para geração de prompts
 */
async function handleAnalyzing(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio, respostas } = args;

    // Se recebeu respostas com informações de design
    if (respostas) {
        if (respostas.design_system) data.designSystem = String(respostas.design_system);
        if (respostas.telas_prioritarias) {
            data.mappedScreens = Array.isArray(respostas.telas_prioritarias)
                ? respostas.telas_prioritarias.map(String)
                : String(respostas.telas_prioritarias).split(',').map(s => s.trim());
        }
        if (respostas.componentes) {
            data.mappedComponents = Array.isArray(respostas.componentes)
                ? respostas.componentes.map(String)
                : String(respostas.componentes).split(',').map(s => s.trim());
        }
    }

    // Tentar encontrar Design Doc
    const designDoc = findDesignDoc(diretorio, estado);
    if (designDoc) {
        data.designDocPath = designDoc.path;
        // Guardar resumo (não conteúdo completo para economizar tokens)
        data.designDocContent = designDoc.content.substring(0, 3000);
    }

    // Se já temos informações suficientes para gerar prompts
    const hasDesignDoc = !!data.designDocPath;
    const hasScreens = data.mappedScreens && data.mappedScreens.length > 0;
    const hasDesignSystem = !!data.designSystem;

    if (hasDesignDoc && hasScreens && hasDesignSystem) {
        // Avançar para geração de prompts
        data.prototypeStatus = 'prompts_generated';
        sp.status = 'generating';
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);
        return handlePromptsGenerated(args, sp, data);
    }

    // Ainda precisa de informações
    sp.status = 'collecting';
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    const ide = resolveIDE(estado, diretorio);
    const skillDir = `${getSkillsDir(ide)}/specialist-prototipagem-stitch`;

    const missingItems: string[] = [];
    if (!hasDesignDoc) missingItems.push('Design Doc da fase anterior');
    if (!hasDesignSystem) missingItems.push('Design System escolhido (Material, Ant Design, Chakra UI, Custom)');
    if (!hasScreens) missingItems.push('3-5 telas prioritárias para prototipar');

    const designDocInfo = hasDesignDoc
        ? `✅ **Design Doc encontrado:** \`${data.designDocPath}\``
        : `❌ **Design Doc não encontrado** — Verifique se a fase de UX Design foi concluída`;

    return {
        content: formatResponse({
            titulo: "🎨 Prototipagem com Google Stitch — Etapa 1: Análise",
            resumo: `Mapeando componentes e telas para prototipagem. ${3 - missingItems.length}/3 informações coletadas.`,
            dados: {
                "Design Doc": hasDesignDoc ? '✅ Encontrado' : '❌ Não encontrado',
                "Design System": data.designSystem || '❌ Não definido',
                "Telas mapeadas": hasScreens ? data.mappedScreens!.join(', ') : '❌ Nenhuma',
            },
            instrucoes: `## 📋 Análise do Projeto para Prototipagem

${designDocInfo}

${hasDesignDoc ? `### Conteúdo do Design Doc (resumo)
Leia o arquivo completo: \`${data.designDocPath}\`
` : ''}

### 📚 Recursos do Especialista
- Template de Prompts: \`${skillDir}/resources/templates/prompt-stitch.md\`
- Checklist de Validação: \`${skillDir}/resources/checklists/stitch-validation.md\`
- Guia Completo: \`${skillDir}/SKILL.md\`

---

## ❌ Informações Faltantes

${missingItems.map(item => `- **${item}**`).join('\n')}

### 🎯 Pergunte ao usuário:
${!hasDesignSystem ? '1. **Qual Design System usar?** (Material Design, Ant Design, Chakra UI, ou Custom com cores específicas)\n' : ''}${!hasScreens ? '2. **Quais são as 3-5 telas mais importantes para prototipar primeiro?** (ex: Dashboard, Login, Perfil, Listagem)\n' : ''}${!hasDesignDoc ? '3. **Onde está o Design Doc?** (ou peça para o usuário descrever o layout desejado)\n' : ''}

⚠️ **NÃO** peça decisões de stack/infraestrutura — isso é da fase de Arquitetura.
Foco é **100% visual**: transformar o Design Doc em protótipos funcionais.

## 📍 Onde Estamos
🔄 Análise → ⏳ Geração de Prompts → ⏳ Prototipagem no Stitch → ⏳ Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Enviar informações de design coletadas",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": { "design_system": "<Material Design|Ant Design|Chakra UI|Custom>", "telas_prioritarias": ["<tela1>", "<tela2>", "<tela3>"] } }`,
                requer_input_usuario: true,
                prompt_usuario: "Informe o Design System e as telas prioritárias para prototipagem.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Enviar informações de design para geração de prompts",
            args_template: {
                diretorio,
                acao: "avancar",
                respostas: {
                    design_system: "<Design System>",
                    telas_prioritarias: ["<tela1>", "<tela2>", "<tela3>"],
                },
            },
            requires_user_input: true,
            user_prompt: "Informe o Design System e as telas prioritárias.",
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prototipagem rápida", "design system integration", "prompt engineering para UI"],
            instructions: "Foque em mapear componentes e telas do Design Doc. NÃO peça decisões de stack/infraestrutura.",
        },
        progress: {
            current_phase: "prototipagem_analyzing",
            total_phases: 5,
            completed_phases: 0,
            percentage: 10,
        },
    };
}

/**
 * Etapa 2: PROMPTS_GENERATED
 * Gera prompts otimizados para Google Stitch e salva em arquivo
 */
async function handlePromptsGenerated(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    // Carregar template de prompts da skill
    let promptTemplate = "";
    try {
        const contentResolver = new ContentResolverService(diretorio);
        const skillLoader = new SkillLoaderService(contentResolver);
        const pkg = await skillLoader.loadFullPackage('specialist-prototipagem-stitch');
        if (pkg?.templateContent) {
            promptTemplate = pkg.templateContent;
        }
    } catch (err) {
        console.warn('[prototype-phase] Falha ao carregar template de prompts:', err);
    }

    const ide = resolveIDE(estado, diretorio);
    const promptsPath = getPromptsFilePath(diretorio);

    // Construir contexto para geração de prompts
    const screensInfo = data.mappedScreens && data.mappedScreens.length > 0
        ? data.mappedScreens.map((s, i) => `${i + 1}. **${s}**`).join('\n')
        : 'Nenhuma tela mapeada';

    const componentsInfo = data.mappedComponents && data.mappedComponents.length > 0
        ? data.mappedComponents.map((c, i) => `${i + 1}. ${c}`).join('\n')
        : 'Nenhum componente mapeado';

    sp.status = 'generating';
    data.prototypeStatus = 'prompts_generated';
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    return {
        content: formatResponse({
            titulo: "📝 Prototipagem — Etapa 2: Geração de Prompts para Stitch",
            resumo: "Informações coletadas. Gere os prompts otimizados para Google Stitch.",
            dados: {
                "Design System": data.designSystem || 'Não definido',
                "Telas": String(data.mappedScreens?.length || 0),
                "Componentes": String(data.mappedComponents?.length || 0),
                "Design Doc": data.designDocPath ? '✅' : '❌',
            },
            instrucoes: `🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Você DEVE gerar os prompts para Google Stitch e salvá-los no arquivo \`${PROMPTS_OUTPUT_FILE}\`.

## 📋 Contexto para Geração

### Design System: ${data.designSystem || 'A definir'}

### Telas Prioritárias
${screensInfo}

### Componentes Mapeados
${componentsInfo}

${data.designDocPath ? `### Design Doc
Leia o arquivo completo para contexto: \`${data.designDocPath}\`\n` : ''}

## 🎨 Template de Referência para Prompts

${promptTemplate ? `Leia o template completo: \`${getSkillsDir(ide)}/specialist-prototipagem-stitch/resources/templates/prompt-stitch.md\`

### Estrutura de cada prompt:
\`\`\`
Create a [Design System] [tipo de componente/tela] with:
- [Funcionalidade 1]
- [Funcionalidade 2]
- Responsive layout for [dispositivos]
- Color scheme: Primary [#HEX], Secondary [#HEX]
- Typography: [Font family]
\`\`\`` : 'Gere prompts estruturados para cada tela/componente.'}

## ⚠️ INSTRUÇÕES DE GERAÇÃO

1. **Gere 1 prompt por tela** listada acima
2. Cada prompt deve incluir: Design System, cores, tipografia, componentes, responsividade
3. **SALVE todos os prompts** no arquivo \`${PROMPTS_OUTPUT_FILE}\`
4. Após salvar, avance:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

🤖 **NÃO ESPERE** o usuário dizer "pode seguir". Gere os prompts, salve e execute a tool AGORA.

## 📍 Onde Estamos
✅ Análise → 🔄 Geração de Prompts → ⏳ Prototipagem no Stitch → ⏳ Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Salvar prompts e avançar para aguardar HTML",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Salvar prompts em prototipos/stitch-prompts.md e avançar",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: false,
            auto_execute: true,
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prompt engineering para UI", "design system integration"],
            instructions: "Gere prompts otimizados para cada tela. Use o Design System especificado. Seja específico com cores, tipografia e responsividade.",
        },
        progress: {
            current_phase: "prototipagem_prompts",
            total_phases: 5,
            completed_phases: 1,
            percentage: 30,
        },
    };
}

/**
 * Etapa 3: AWAITING_HTML
 * Aguarda o usuário retornar com arquivos HTML do Google Stitch
 */
async function handleAwaitingHtml(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    // Verificar se prompts foram salvos
    const promptsExist = existsSync(getPromptsFilePath(diretorio));

    if (!promptsExist && !data.promptsGenerated) {
        // Prompts ainda não foram gerados — voltar para etapa anterior
        data.prototypeStatus = 'prompts_generated';
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);
        return handlePromptsGenerated(args, sp, data);
    }

    // Marcar prompts como gerados
    data.promptsGenerated = true;
    data.promptsFilePath = getPromptsFilePath(diretorio);
    data.prototypeStatus = 'awaiting_html';
    sp.status = 'collecting';
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    const protoDir = getPrototypeDir(diretorio);
    const htmlFiles = findHtmlFiles(diretorio);

    return {
        content: formatResponse({
            titulo: "🌐 Prototipagem — Etapa 3: Prototipagem no Google Stitch",
            resumo: `Prompts gerados! Agora o usuário deve usar os prompts no stitch.withgoogle.com e retornar os arquivos HTML.`,
            dados: {
                "Prompts salvos": promptsExist ? `✅ ${PROMPTS_OUTPUT_FILE}` : '❌ Não encontrado',
                "Pasta de protótipos": `${PROTOTYPE_OUTPUT_DIR}/`,
                "Arquivos HTML encontrados": String(htmlFiles.length),
            },
            instrucoes: `## 🎯 Instruções para o Usuário

### Passo 1: Acesse o Google Stitch
Abra **[stitch.withgoogle.com](https://stitch.withgoogle.com)** no navegador.

### Passo 2: Use os Prompts Gerados
Os prompts estão salvos em: \`${PROMPTS_OUTPUT_FILE}\`

Para cada tela/componente:
1. Copie o prompt correspondente do arquivo
2. Cole no Google Stitch
3. Itere até obter o resultado desejado
4. **Exporte o código HTML** do Stitch

### Passo 3: Salve os Arquivos HTML
Coloque os arquivos HTML exportados na pasta:

📁 **\`${protoDir}\`**

Estrutura esperada:
\`\`\`
${PROTOTYPE_OUTPUT_DIR}/
├── dashboard.html
├── login.html
├── perfil.html
├── listagem.html
└── ... (outros protótipos)
\`\`\`

### Passo 4: Avise quando terminar
Após colocar todos os arquivos HTML na pasta, diga **"protótipos prontos"** ou execute:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

---

⚠️ **IMPORTANTE:**
- A fase **só será concluída** quando os arquivos HTML estiverem na pasta \`${PROTOTYPE_OUTPUT_DIR}/\`
- O sistema validará automaticamente os arquivos HTML
- Você pode iterar quantas vezes quiser antes de avançar

${htmlFiles.length > 0 ? `\n### 📄 Arquivos HTML já encontrados:\n${htmlFiles.map(f => `- \`${f}\``).join('\n')}\n\n> Para validar estes arquivos, execute \`executar({acao: "avancar"})\`` : ''}

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → 🔄 Prototipagem no Stitch → ⏳ Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Verificar arquivos HTML na pasta prototipos/",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: true,
                prompt_usuario: "Coloque os arquivos HTML exportados do Stitch na pasta prototipos/ e diga 'protótipos prontos'.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Verificar arquivos HTML após usuário colocar na pasta",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: true,
            user_prompt: "Coloque os arquivos HTML na pasta prototipos/ e avise quando terminar.",
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prototipagem rápida", "export HTML/CSS"],
            instructions: "Aguarde o usuário retornar com os arquivos HTML. Oriente sobre como usar o Stitch se necessário.",
        },
        progress: {
            current_phase: "prototipagem_awaiting_html",
            total_phases: 5,
            completed_phases: 2,
            percentage: 50,
        },
    };
}

/** Thresholds alinhados ao checklist stitch-validation.md */
const SCORE_AUTO_APPROVE = 75;   // >= 75: aprovação automática (Bom/Excelente)
const SCORE_MANUAL_APPROVE = 60; // 60-74: aprovação manual necessária (Aceitável)
// < 60: bloqueado (Insuficiente)

/**
 * Gera instruções de correção específicas baseadas nos gaps identificados
 */
function generateCorrectionInstructions(validation: DetailedValidationResult, diretorio: string): string {
    const ide = 'windsurf'; // fallback
    const skillDir = `.windsurf/skills/specialist-prototipagem-stitch`;

    const gapInstructions: string[] = [];

    for (const cat of validation.categories) {
        const lowItems = cat.items.filter(i => i.status === '❌' || i.status === '⚠️');
        if (lowItems.length === 0) continue;

        gapInstructions.push(`### ${cat.name} (${cat.earnedPoints}/${cat.maxPoints})`);
        for (const item of lowItems) {
            const missing = item.maxPoints - item.earnedPoints;
            gapInstructions.push(`${item.status} **${item.name}**: ${item.earnedPoints}/${item.maxPoints} — faltam **${missing} pontos**`);

            // Instruções específicas por item
            if (item.name.includes('Componentes principais')) {
                gapInstructions.push('  → Adicione mais componentes HTML: `<nav>`, `<form>`, `<table>`, cards, modais, ícones');
            } else if (item.name.includes('Design System')) {
                gapInstructions.push('  → Use CSS variables (`--primary`, `--secondary`), `font-family`, `font-size`, classes consistentes');
            } else if (item.name.includes('Estados')) {
                gapInstructions.push('  → Adicione `:hover`, loading states, error states, `disabled` em botões/inputs');
            } else if (item.name.includes('Reutilização')) {
                gapInstructions.push('  → Use classes CSS reutilizáveis em múltiplos arquivos HTML');
            } else if (item.name.includes('Fluxos principais')) {
                gapInstructions.push('  → Crie 3+ páginas HTML com botões, links e formulários interconectados');
            } else if (item.name.includes('Navegação')) {
                gapInstructions.push('  → Adicione `<nav>` com links entre as páginas do protótipo');
            } else if (item.name.includes('Feedback visual')) {
                gapInstructions.push('  → Adicione loading indicators, alertas, transitions CSS, animações');
            } else if (item.name.includes('Tratamento de erros')) {
                gapInstructions.push('  → Adicione validação de formulários, mensagens de erro, alertas de erro');
            } else if (item.name.includes('Cores')) {
                gapInstructions.push('  → Use CSS variables para cores e aumente o CSS inline (`<style>`)');
            } else if (item.name.includes('Tipografia')) {
                gapInstructions.push('  → Defina `font-family` e `font-size` consistentes no CSS');
            } else if (item.name.includes('Espaçamento')) {
                gapInstructions.push('  → Use `display: flex` ou `display: grid` para layout estruturado');
            } else if (item.name.includes('Responsividade')) {
                gapInstructions.push('  → Adicione `@media` queries para mobile, tablet e desktop (3+ breakpoints)');
            } else if (item.name.includes('Feedback stakeholders')) {
                gapInstructions.push(`  → Crie \`prototipos/feedback-stakeholders.md\` com feedback documentado`);
            } else if (item.name.includes('Documentação')) {
                gapInstructions.push(`  → Crie \`prototipos/prototipos.md\` com resumo dos protótipos`);
            }
        }
        gapInstructions.push('');
    }

    return gapInstructions.join('\n');
}

/**
 * Etapa 4: VALIDATING_HTML
 * Valida os arquivos HTML encontrados na pasta prototipos/
 * 
 * Thresholds (alinhados ao checklist stitch-validation.md):
 * - >= 75: Aprovação automática (Bom/Excelente)
 * - 60-74: Aprovação manual necessária (Aceitável)
 * - < 60: Bloqueado (Insuficiente)
 */
async function handleValidatingHtml(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    const htmlFiles = findHtmlFiles(diretorio);

    if (htmlFiles.length === 0) {
        // Nenhum HTML encontrado — voltar para awaiting
        data.prototypeStatus = 'awaiting_html';
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);
        return handleAwaitingHtml(args, sp, data);
    }

    // Validar arquivos com scoring granular
    const validation = validateHtmlFiles(diretorio, htmlFiles);
    data.htmlFiles = htmlFiles;
    data.validationScore = validation.score;
    data.validationDetails = validation.summary;
    data.iterationCount++;

    sp.status = 'validating';
    sp.validationScore = validation.score;

    const ide = resolveIDE(estado, diretorio);
    const skillDir = `${getSkillsDir(ide)}/specialist-prototipagem-stitch`;

    // === SCORE >= 75: APROVAÇÃO AUTOMÁTICA ===
    if (validation.score >= SCORE_AUTO_APPROVE) {
        data.prototypeStatus = 'approved';
        sp.status = 'approved';
        sp.completedAt = new Date().toISOString();
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);

        // Gerar documento de validação
        const validationDoc = generateValidationDocument(data, validation, diretorio);
        try {
            await saveFile(getValidationFilePath(diretorio), validationDoc);
        } catch (err) {
            console.warn('[prototype-phase] Falha ao salvar validação:', err);
        }

        return handleApproved(args, sp, data);
    }

    // === SCORE 60-74: APROVAÇÃO MANUAL NECESSÁRIA ===
    if (validation.score >= SCORE_MANUAL_APPROVE) {
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);

        const correctionInstructions = generateCorrectionInstructions(validation, diretorio);
        const classification = validation.score >= 70 ? 'Aceitável ⚠️' : 'Aceitável (baixo) ⚠️';

        return {
            content: formatResponse({
                titulo: "⚠️ Validação dos Protótipos — Aprovação Manual Necessária",
                resumo: `Score: ${validation.score}/100 (${classification}). ${htmlFiles.length} arquivo(s). Iteração ${data.iterationCount}. Mínimo para auto-aprovação: ${SCORE_AUTO_APPROVE}.`,
                dados: {
                    "Arquivos HTML": String(htmlFiles.length),
                    "Score": `${validation.score}/100`,
                    "Classificação": classification,
                    "Auto-aprovação": `>= ${SCORE_AUTO_APPROVE}`,
                    "Iteração": String(data.iterationCount),
                },
                instrucoes: `${validation.summary}

## � Gaps Identificados

${correctionInstructions}

## ✅ Pontos Fortes
${validation.strengths.length > 0 ? validation.strengths.map(s => `- ✅ ${s}`).join('\n') : '- Nenhum item com pontuação máxima'}

## 📚 Recursos Para Correção
- **Template:** \`${skillDir}/resources/templates/prototipo-stitch.md\`
- **Checklist:** \`${skillDir}/resources/checklists/stitch-validation.md\`
- **Guia:** \`${skillDir}/SKILL.md\`

## 🔄 Como Corrigir
1. Leia o checklist → Veja quais critérios não foram atendidos
2. Edite os arquivos HTML → Adicione os elementos faltantes
3. Re-submeta → \`executar({acao: "avancar"})\`

## 🔐 Ação do Usuário Necessária
- **Para corrigir** (recomendado): Siga as instruções acima e re-submeta
- **Para aprovar mesmo assim**: Diga "aprovar o gate" ou "aprovar protótipos"

> ⚠️ A IA **NÃO** pode aprovar automaticamente. Aguarde a decisão do usuário.

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → ✅ Prototipagem no Stitch → 🔄 Validação HTML → ⏳ Aprovação`,
                proximo_passo: {
                    tool: "executar",
                    descricao: "Re-validar após melhorias ou aguardar aprovação manual",
                    args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                    requer_input_usuario: true,
                    prompt_usuario: "Corrija os gaps ou diga 'aprovar o gate' para avançar.",
                },
            }),
            next_action: {
                tool: "executar",
                description: "Re-validar após correções ou aguardar aprovação manual",
                args_template: { diretorio, acao: "avancar" },
                requires_user_input: true,
                user_prompt: "Corrija os gaps ou diga 'aprovar o gate' para avançar.",
            },
            progress: {
                current_phase: "prototipagem_validating",
                total_phases: 5,
                completed_phases: 3,
                percentage: 70,
            },
        };
    }

    // === SCORE < 60: BLOQUEADO ===
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    const correctionInstructions = generateCorrectionInstructions(validation, diretorio);

    return {
        content: formatResponse({
            titulo: "❌ Validação dos Protótipos — Bloqueado",
            resumo: `Score: ${validation.score}/100 (Insuficiente). Mínimo: ${SCORE_MANUAL_APPROVE}. ${htmlFiles.length} arquivo(s). Iteração ${data.iterationCount}.`,
            dados: {
                "Arquivos HTML": String(htmlFiles.length),
                "Score": `${validation.score}/100`,
                "Classificação": "Insuficiente ❌",
                "Mínimo para aprovação manual": String(SCORE_MANUAL_APPROVE),
                "Mínimo para auto-aprovação": String(SCORE_AUTO_APPROVE),
                "Iteração": String(data.iterationCount),
            },
            instrucoes: `${validation.summary}

## ❌ Gaps Críticos — Correção Obrigatória

${correctionInstructions}

## 📚 Recursos Para Correção
- **Template:** \`${skillDir}/resources/templates/prototipo-stitch.md\`
- **Checklist:** \`${skillDir}/resources/checklists/stitch-validation.md\`
- **Guia:** \`${skillDir}/SKILL.md\`

## 🔄 Como Corrigir
1. **Leia o checklist** → Veja EXATAMENTE quais critérios não foram atendidos
2. **Edite os arquivos HTML** na pasta \`${PROTOTYPE_OUTPUT_DIR}/\`
3. **Adicione os elementos faltantes** listados acima
4. **Re-submeta**: \`executar({acao: "avancar"})\`

> ⛔ **NÃO é possível aprovar manualmente** com score < ${SCORE_MANUAL_APPROVE}. Corrija os itens acima primeiro.

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → ✅ Prototipagem no Stitch → 🔄 Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Re-validar após correções nos arquivos HTML",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: true,
                prompt_usuario: "Corrija os arquivos HTML conforme instruções e avise quando prontos.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Re-validar arquivos HTML após correções obrigatórias",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: true,
            user_prompt: "Corrija os arquivos HTML e avise quando prontos.",
        },
        progress: {
            current_phase: "prototipagem_validating",
            total_phases: 5,
            completed_phases: 3,
            percentage: 70,
        },
    };
}

/**
 * Etapa 5: APPROVED
 * Protótipos validados, preparar transição para próxima fase
 */
async function handleApproved(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const onboarding = estado.onboarding!;

    const htmlFiles = data.htmlFiles || findHtmlFiles(diretorio);
    const protoDir = getPrototypeDir(diretorio);

    // Limpar specialistPhase para que avancar.ts não redirecione de volta
    const finalScore = data.validationScore || 0;
    const finalIteration = data.iterationCount;

    // Marcar fase como concluída no onboarding
    if (onboarding) {
        delete onboarding.specialistPhase;
        onboarding.phase = 'completed';
        onboarding.completedAt = new Date().toISOString();
    }

    // NÃO avançar fase_atual aqui — isso é responsabilidade do proximo.ts
    // Apenas marcar que o entregável está pronto
    estado.status = 'ativo';

    await persistState(estado, diretorio);

    // Gerar entregável prototipos.md com resumo
    const entregavelContent = generatePrototypeSummary(data, htmlFiles, diretorio);
    const entregavelPath = join(protoDir, 'prototipos.md');
    try {
        await saveFile(entregavelPath, entregavelContent);
    } catch (err) {
        console.warn('[prototype-phase] Falha ao salvar entregável:', err);
    }

    return {
        content: formatResponse({
            titulo: "✅ Protótipos Aprovados!",
            resumo: `${htmlFiles.length} protótipo(s) HTML validado(s) com score ${finalScore}/100. Fase de prototipagem concluída!`,
            dados: {
                "Arquivos HTML": String(htmlFiles.length),
                "Score Final": `${finalScore}/100`,
                "Iterações": String(finalIteration),
                "Pasta": `${PROTOTYPE_OUTPUT_DIR}/`,
                "Entregável": `${PROTOTYPE_OUTPUT_DIR}/prototipos.md`,
            },
            instrucoes: `## 🎉 Prototipagem Concluída!

### 📁 Arquivos do Protótipo
${htmlFiles.map(f => `- \`${PROTOTYPE_OUTPUT_DIR}/${f}\``).join('\n')}

### 📄 Documentos Gerados
- Prompts: \`${PROMPTS_OUTPUT_FILE}\`
- Validação: \`${VALIDATION_OUTPUT_FILE}\`
- Resumo: \`${PROTOTYPE_OUTPUT_DIR}/prototipos.md\`

### 🚀 Próximos Passos
1. Os protótipos HTML servem como referência visual para o desenvolvimento
2. O código exportado pode ser usado como base para componentes frontend
3. O Design Doc foi validado visualmente através dos protótipos

Para avançar para a próxima fase (Arquitetura):

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → ✅ Prototipagem no Stitch → ✅ Validação HTML → ✅ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Avançar para a próxima fase",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Avançar para próxima fase (Arquitetura)",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: false,
            auto_execute: true,
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prototipagem rápida", "export HTML/CSS"],
            instructions: "Protótipos aprovados. Prepare a transição para a fase de Arquitetura.",
        },
        progress: {
            current_phase: "prototipagem_approved",
            total_phases: 5,
            completed_phases: 5,
            percentage: 100,
        },
    };
}

// === DOCUMENT GENERATORS ===

function generateValidationDocument(
    data: PrototypePhaseData,
    validation: ReturnType<typeof validateHtmlFiles>,
    diretorio: string
): string {
    const now = new Date().toISOString().split('T')[0];
    return `# Validação de Protótipos — ${now}

## Resumo
- **Score:** ${validation.score}/100
- **Arquivos:** ${validation.fileDetails.length}
- **Iterações:** ${data.iterationCount}
- **Design System:** ${data.designSystem || 'N/A'}

## Arquivos Validados

| Arquivo | Tamanho | Conteúdo | Estrutura HTML |
|---------|---------|----------|----------------|
${validation.fileDetails.map((d: { file: string; size: number; hasContent: boolean; hasStructure: boolean; hasCss: boolean }) => `| ${d.file} | ${formatSize(d.size)} | ${d.hasContent ? '✅' : '❌'} | ${d.hasStructure ? '✅' : '❌'} |`).join('\n')}

## Telas Prototipadas
${(data.mappedScreens || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'N/A'}

## Componentes Mapeados
${(data.mappedComponents || []).map((c, i) => `${i + 1}. ${c}`).join('\n') || 'N/A'}

---
*Gerado automaticamente pelo Maestro — Fase de Prototipagem*
`;
}

function generatePrototypeSummary(
    data: PrototypePhaseData,
    htmlFiles: string[],
    diretorio: string
): string {
    const now = new Date().toISOString().split('T')[0];
    return `# Protótipos — Resumo da Fase

**Data:** ${now}
**Design System:** ${data.designSystem || 'N/A'}
**Score de Validação:** ${data.validationScore || 0}/100

## Arquivos HTML

${htmlFiles.map(f => `- \`${f}\``).join('\n') || 'Nenhum arquivo'}

## Telas Prototipadas

${(data.mappedScreens || []).map((s, i) => `${i + 1}. **${s}**`).join('\n') || 'N/A'}

## Componentes

${(data.mappedComponents || []).map((c, i) => `${i + 1}. ${c}`).join('\n') || 'N/A'}

## Design Doc de Referência

${data.designDocPath ? `\`${data.designDocPath}\`` : 'Não encontrado'}

## Prompts Utilizados

Arquivo: \`${PROMPTS_OUTPUT_FILE}\`

---

### Próximos Passos
1. Usar protótipos como referência visual no desenvolvimento frontend
2. Componentes HTML podem ser adaptados para o framework escolhido
3. Manter protótipos atualizados conforme mudanças de design

---
*Gerado automaticamente pelo Maestro — Fase de Prototipagem*
`;
}

/**
 * Verifica se a fase atual é de prototipagem (Stitch) pelo nome da fase
 */
export function isPrototypePhase(faseNome: string | undefined, usarStitch: boolean): boolean {
    if (!usarStitch) return false;
    return faseNome?.toLowerCase() === 'prototipagem';
}
