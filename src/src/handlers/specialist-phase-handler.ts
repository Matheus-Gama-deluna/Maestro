/**
 * Specialist Phase Handler (v6.1)
 * 
 * Handler central do novo fluxo de onboarding unificado.
 * Gerencia o ciclo: specialist_active → collecting → generating → validating → approved
 * 
 * v6.1 Fixes:
 * - FIX: PRD validation score (was always 15/100 due to regex/escape bug)
 * - FIX: prazo_mvp alias mapping
 * - FIX: Infinite retry loop (max 3 attempts)
 * - FIX: File-based PRD validation (eliminates JSON escape issues)
 * - FIX: Reduced template repetition in context
 * - FIX: Standardized output with AI instruction markers
 * - FIX: Resource loading instructions in output
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { OnboardingState, SpecialistPhaseState } from "../types/onboarding.js";
import { formatResponse, formatError } from "../utils/response-formatter.js";
import { serializarEstado } from "../state/storage.js";
import { saveFile } from "../utils/persistence.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { existsSync, readFileSync } from "fs";

/** Maximum number of automatic PRD validation retries before requiring user approval */
const MAX_PRD_VALIDATION_RETRIES = 3;

interface SpecialistPhaseArgs {
    estado: EstadoProjeto;
    diretorio: string;
    respostas?: Record<string, unknown>;
    entregavel?: string;
}

// === Sprint 5 (NP2, NP3): Fuzzy Field Matching ===

const FIELD_ALIASES: Record<string, string[]> = {
    'problema': ['problema_central', 'problem', 'pain_point', 'dor', 'problema_principal'],
    'publico_alvo': ['publico', 'target', 'audience', 'usuarios', 'usuarios_alvo', 'target_audience'],
    'funcionalidades_mvp': ['features', 'funcionalidades', 'mvp', 'features_mvp', 'funcionalidades_principais'],
    'north_star_metric': ['metrica', 'metric', 'kpi', 'north_star', 'metrica_sucesso', 'metrica_principal'],
    'riscos': ['riscos_principais', 'risks', 'riscos_mercado', 'riscos_tecnicos', 'riscos_negocio'],
    'timeline': ['cronograma', 'prazo', 'timeline_desejado', 'quando', 'prazo_lancamento', 'prazo_mvp', 'prazo_mvp_desejado'],
    'personas': ['persona', 'persona_principal', 'personas_detalhadas', 'perfil_usuario'],
    'go_to_market': ['gtm', 'lancamento', 'estrategia_lancamento', 'go_to_market_strategy', 'estrategia_gtm'],
    'diferencial': ['diferencial_competitivo', 'vantagem', 'competitive_advantage', 'proposta_valor'],
    'visao_produto': ['visao', 'vision', 'missao', 'mission', 'visao_estrategica'],
};

function normalizeFieldKey(key: string): string {
    const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
        if (normalized === canonical || aliases.includes(normalized)) {
            return canonical;
        }
    }
    return normalized;
}

/**
 * Entry point do specialist phase handler.
 * Detecta o status atual e delega para o handler correto.
 */
export async function handleSpecialistPhase(args: SpecialistPhaseArgs): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const onboarding = (estado as any).onboarding as OnboardingState | undefined;

    if (!onboarding?.specialistPhase) {
        return {
            content: formatError(
                "specialist-phase",
                "Nenhuma fase de especialista ativa encontrada.",
                `Use \`maestro({diretorio: "${diretorio}"})\` para verificar o status do projeto.`
            ),
            isError: true,
        };
    }

    const sp = onboarding.specialistPhase;

    switch (sp.status) {
        case 'active':
        case 'collecting':
            return handleCollecting(args, onboarding, sp);
        case 'generating':
            if (args.entregavel) {
                sp.status = 'validating';
                return handleValidating(args, onboarding, sp);
            }
            return handleGenerating(args, onboarding, sp);
        case 'validating':
            return handleValidating(args, onboarding, sp);
        case 'approved':
            return handleApproved(args, onboarding, sp);
        default:
            return {
                content: formatError(
                    "specialist-phase",
                    `Status desconhecido: ${sp.status}`,
                    `Use \`executar({diretorio: "${diretorio}", acao: "avancar"})\` para tentar avançar.`
                ),
                isError: true,
            };
    }
}

/**
 * Handler: collecting — Recebe respostas do usuário e acumula dados
 */
async function handleCollecting(
    args: SpecialistPhaseArgs,
    onboarding: OnboardingState,
    sp: SpecialistPhaseState
): Promise<ToolResult> {
    const { estado, diretorio, respostas } = args;
    const mode = onboarding.mode || 'balanced';

    // Se não há respostas, mostrar o que falta
    if (!respostas || Object.keys(respostas).length === 0) {
        return buildCollectionPrompt(diretorio, sp, mode);
    }

    // Acumular dados recebidos (com fuzzy matching de campos — Sprint 5)
    for (const [key, value] of Object.entries(respostas)) {
        if (value !== undefined && value !== null && value !== '') {
            const normalizedKey = normalizeFieldKey(key);
            sp.collectedData[normalizedKey] = value;
        }
    }
    sp.interactionCount++;
    sp.status = 'collecting';
    onboarding.totalInteractions++;
    onboarding.lastInteractionAt = new Date().toISOString();

    // Verificar se tem dados suficientes para gerar PRD
    const required = getRequiredFields(mode);
    const missing = required.filter(f => !sp.collectedData[f.id]);
    const collected = required.filter(f => sp.collectedData[f.id]);

    if (missing.length === 0) {
        // Todos os campos obrigatórios preenchidos
        if (args.entregavel) {
            // Entregável já presente → skip generating, ir direto para validating
            sp.status = 'validating';
            await persistState(estado, onboarding, diretorio);
            return handleValidating(args, onboarding, sp);
        }
        // Sem entregável → gerar PRD
        sp.status = 'generating';
        await persistState(estado, onboarding, diretorio);
        return handleGenerating(args, onboarding, sp);
    }

    // Ainda faltam campos — pedir mais informações
    await persistState(estado, onboarding, diretorio);

    const progressPct = Math.round((collected.length / required.length) * 100);

    // v6.0 (P11): next_action com parâmetros COMPLETOS e EXATOS
    const missingTemplate: Record<string, string> = {};
    for (const f of missing) {
        missingTemplate[f.id] = `<${f.label}>`;
    }

    return {
        content: formatResponse({
            titulo: "🧠 Especialista: Gestão de Produto",
            resumo: `Dados recebidos! ${collected.length}/${required.length} campos preenchidos (${progressPct}%).`,
            dados: {
                "Campos preenchidos": `${collected.length}/${required.length}`,
                "Progresso": `${progressPct}%`,
                "Interações": sp.interactionCount.toString(),
            },
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos que ainda faltam. NÃO invente dados.

${await loadCollectingContext(diretorio, sp.skillName)}

Campos já coletados:
${collected.map(f => `✅ **${f.label}**: ${truncateValue(sp.collectedData[f.id])}`).join('\n')}

${formatMissingFieldsByBlock(missing, mode)}

⚠️ REGRA CRÍTICA: Os dados devem vir DIRETAMENTE do usuário.
Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim":
→ Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados."
→ Reformule as perguntas de forma mais simples se o usuário parecer travado.
→ Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.

## 📍 Onde Estamos
✅ Setup → 🔄 Coleta (${progressPct}%) → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar"})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: `Enviar respostas dos campos faltantes`,
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": ${JSON.stringify(missingTemplate)} }`,
                requer_input_usuario: true,
                prompt_usuario: `Responda: ${missing.map(f => f.label).join(', ')}`,
            },
        }),
        next_action: {
            tool: "executar",
            description: `Enviar respostas: ${missing.map(f => f.label).join(', ')}`,
            args_template: {
                diretorio,
                acao: "avancar",
                respostas: missingTemplate,
            },
            requires_user_input: true,
            user_prompt: `Responda: ${missing.map(f => f.label).join(', ')}`,
        },
        specialist_persona: {
            name: "Gestão de Produto",
            tone: "Estratégico e orientado ao usuário",
            expertise: ["product discovery", "lean startup", "user stories", "MVP definition"],
            instructions: "Conduza a coleta de forma conversacional focada em PRODUTO. PERGUNTE — NÃO invente. Faça follow-up quando respostas forem vagas (< 20 palavras).",
        },
        progress: {
            current_phase: "specialist_collecting",
            total_phases: 5,
            completed_phases: 1,
            percentage: 20 + Math.round(progressPct * 0.3),
        },
    };
}

/**
 * Handler: generating — Gera PRD draft a partir dos dados coletados
 */
async function handleGenerating(
    args: SpecialistPhaseArgs,
    onboarding: OnboardingState,
    sp: SpecialistPhaseState
): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const mode = onboarding.mode || 'balanced';

    // Carregar template e checklist reais da skill
    let templateContent = "";
    let checklistContent = "";
    try {
        const contentResolver = new ContentResolverService(diretorio);
        const skillLoader = new SkillLoaderService(contentResolver);
        const pkg = await skillLoader.loadFullPackage(sp.skillName);
        if (pkg) {
            templateContent = pkg.templateContent;
            checklistContent = pkg.checklistContent;
        }
    } catch (err) {
        console.warn('[specialist-phase] Falha ao carregar recursos:', err);
    }

    // Montar contexto para geração do PRD
    const collectedSummary = Object.entries(sp.collectedData)
        .map(([key, value]) => `- **${key}**: ${value}`)
        .join('\n');

    sp.status = 'generating';
    await persistState(estado, onboarding, diretorio);

    return {
        content: formatResponse({
            titulo: "📝 Geração do PRD",
            resumo: "Todos os dados foram coletados. Gerando PRD draft usando o template do especialista.",
            instrucoes: `🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Você DEVE gerar o PRD e enviá-lo como entregável IMEDIATAMENTE, sem esperar comando do usuário.

## Dados Coletados do Usuário

${collectedSummary}

${templateContent ? `## 🔧 Recurso do Especialista
> 💡 Para template completo: leia \`.agent/skills/specialist-gestao-produto/resources/templates/PRD.md\`
> Ou execute: \`read_resource("maestro://especialista/gestao-produto")\`

## Template do PRD (ESTRUTURA — use como guia)

${extractTemplateSkeleton(templateContent)}` : '## Template do PRD\\n\\nGere um PRD estruturado com: Visão, Problema, Público-alvo, Funcionalidades MVP, Métricas de Sucesso, Riscos.'}

---

⚠️ **INSTRUÇÕES DE GERAÇÃO:**
1. Preencha CADA seção do template com os dados coletados
2. Se um dado não foi coletado, marque como "A definir com o usuário"
3. NÃO invente números, métricas ou dados que o usuário não forneceu
4. Após gerar, envie o PRD como entregável IMEDIATAMENTE:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "entregavel": "<conteúdo completo do PRD>"
})
\`\`\`

🤖 **NÃO ESPERE** o usuário dizer "pode seguir" ou "avançar". Execute a tool AGORA.

## 📍 Onde Estamos
✅ Setup → ✅ Coleta → 🔄 Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar", entregavel: "..."})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: "Enviar PRD gerado como entregável",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "entregavel": "<PRD completo>" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Gerar e enviar PRD como entregável",
            args_template: {
                diretorio,
                acao: "avancar",
                entregavel: "{{PRD_GERADO_COM_TEMPLATE}}",
            },
            requires_user_input: false,
            auto_execute: true,
        },
        specialist_persona: {
            name: "Gestão de Produto",
            tone: "Completo e estruturado",
            expertise: ["PRDs", "especificações", "escopo", "métricas de sucesso"],
            instructions: "Gere o PRD usando EXATAMENTE o template fornecido. Preencha com dados REAIS coletados. Marque gaps como 'A definir'.",
        },
        progress: {
            current_phase: "specialist_generating",
            total_phases: 5,
            completed_phases: 2,
            percentage: 55,
        },
    };
}

/**
 * Handler: validating — Recebe PRD draft e valida
 * v6.1: File-based validation, retry limit, normalized PRD parsing
 */
async function handleValidating(
    args: SpecialistPhaseArgs,
    onboarding: OnboardingState,
    sp: SpecialistPhaseState
): Promise<ToolResult> {
    const { estado, diretorio } = args;
    let entregavel = args.entregavel;

    // v6.1 (Problem #7): File-based validation fallback
    if (!entregavel) {
        // Try reading from saved draft file
        const draftPath = `${diretorio}/.maestro/entregaveis/prd-draft.md`;
        const docsPath = `${diretorio}/docs/01-produto/PRD.md`;

        if (existsSync(docsPath)) {
            try { entregavel = readFileSync(docsPath, 'utf-8'); } catch { /* ignore */ }
        }
        if (!entregavel && existsSync(draftPath)) {
            try { entregavel = readFileSync(draftPath, 'utf-8'); } catch { /* ignore */ }
        }
    }

    if (!entregavel) {
        // Se chamou sem entregável e sem arquivo, voltar para generating
        sp.status = 'generating';
        await persistState(estado, onboarding, diretorio);
        return handleGenerating(args, onboarding, sp);
    }

    // v6.1 (Bug #1): Normalize string — fix JSON-escaped newlines
    entregavel = normalizePrdContent(entregavel);

    // Salvar PRD draft
    sp.prdDraft = entregavel;
    sp.status = 'validating';

    // v6.1 (Bug #3): Track validation attempts
    if (!sp.validationAttempts) sp.validationAttempts = 0;
    sp.validationAttempts++;

    // Calcular score básico de validação
    const score = calculatePrdScore(entregavel, onboarding.mode);
    sp.validationScore = score;

    onboarding.prdStatus = 'draft';
    onboarding.totalInteractions++;
    onboarding.lastInteractionAt = new Date().toISOString();

    // Salvar PRD como arquivo
    try {
        await saveFile(`${diretorio}/.maestro/entregaveis/prd-draft.md`, entregavel);
        await saveFile(`${diretorio}/docs/01-produto/PRD.md`, entregavel);
    } catch (err) {
        console.warn('[specialist-phase] Falha ao salvar PRD:', err);
    }

    await persistState(estado, onboarding, diretorio);

    if (score >= 70) {
        // PRD aprovado
        sp.status = 'approved';
        sp.completedAt = new Date().toISOString();
        onboarding.prdStatus = 'validated';
        onboarding.prdScore = score;
        await persistState(estado, onboarding, diretorio);
        return handleApproved(args, onboarding, sp);
    }

    // v6.1 (Bug #3): Check retry limit
    const retriesExhausted = sp.validationAttempts >= MAX_PRD_VALIDATION_RETRIES;

    // PRD precisa de melhorias
    const { details } = calculatePrdScoreDetailed(entregavel);
    const gaps = identifyPrdGaps(entregavel, onboarding.mode);

    // v6.1: Build detailed score breakdown for transparency
    const scoreBreakdown = details
        .map(d => `${d.found && d.hasContent ? '✅' : d.found ? '⚠️' : '❌'} **${d.label}**: ${d.score}/${d.maxScore} pts${d.found ? ` (${d.contentLength} chars)` : ''}`)
        .join('\n');

    if (retriesExhausted) {
        // v6.1 (Bug #3): Max retries reached — ask user for decision
        return {
            content: formatResponse({
                titulo: "📊 Validação do PRD — Decisão Necessária",
                resumo: `PRD validado com score ${score}/100 após ${sp.validationAttempts} tentativas. Requer decisão do usuário.`,
                dados: {
                    "Score": `${score}/100`,
                    "Tentativas": `${sp.validationAttempts}/${MAX_PRD_VALIDATION_RETRIES}`,
                    "Status": "⚠️ Limite de tentativas atingido",
                    "Mínimo": "70/100",
                },
                instrucoes: `## 📊 Detalhamento do Score\n\n${scoreBreakdown}\n\n${gaps.length > 0 ? `## Gaps Restantes\n\n${gaps.map(g => `- ${g}`).join('\n')}\n\n` : ''}## ⚠️ Limite de Tentativas Atingido\n\nO PRD já foi reenviado ${sp.validationAttempts} vezes sem atingir o score mínimo de 70/100.\n\n**Pergunte ao usuário:**\n1. Aprovar o PRD com score atual (${score}/100) e prosseguir\n2. Solicitar melhorias específicas antes de reenviar\n3. Cancelar e recomeçar a coleta de dados\n\n⚠️ **NÃO reenvie automaticamente.** Aguarde a decisão do usuário.`,
                proximo_passo: {
                    tool: "executar",
                    descricao: "Aguardando decisão do usuário sobre o PRD",
                    args: `{ "diretorio": "${diretorio}", "acao": "avancar", "entregavel": "<PRD final>" }`,
                    requer_input_usuario: true,
                    prompt_usuario: `PRD com score ${score}/100 após ${sp.validationAttempts} tentativas. Aprovar, melhorar ou recomeçar?`,
                },
            }),
            next_action: {
                tool: "executar",
                description: "Aguardar decisão do usuário",
                args_template: { diretorio, acao: "avancar" },
                requires_user_input: true,
                user_prompt: `PRD com score ${score}/100. Aprovar, melhorar ou recomeçar?`,
            },
            progress: {
                current_phase: "specialist_validating",
                total_phases: 5,
                completed_phases: 3,
                percentage: 65,
            },
        };
    }

    // Normal retry flow (within limits)
    return {
        content: formatResponse({
            titulo: "📊 Validação do PRD",
            resumo: `PRD recebido. Score: ${score}/100. Tentativa ${sp.validationAttempts}/${MAX_PRD_VALIDATION_RETRIES}.`,
            dados: {
                "Score": `${score}/100`,
                "Tentativa": `${sp.validationAttempts}/${MAX_PRD_VALIDATION_RETRIES}`,
                "Status": "⚠️ Precisa de melhorias",
                "Mínimo": "70/100",
            },
            instrucoes: `## 📊 Detalhamento do Score\n\n${scoreBreakdown}\n\n${gaps.length > 0 ? `## Gaps Identificados\n\n${gaps.map(g => `- ${g}`).join('\n')}\n\n` : ''}🤖 **AÇÃO REQUERIDA (tentativa ${sp.validationAttempts + 1}/${MAX_PRD_VALIDATION_RETRIES}):**\nMelhore o PRD nos pontos acima e reenvie.\n\n\`\`\`json\nexecutar({\n    "diretorio": "${diretorio}",\n    "acao": "avancar",\n    "entregavel": "<PRD melhorado>"\n})\n\`\`\`\n\n## 📍 Onde Estamos\n✅ Setup → ✅ Coleta → ✅ Geração PRD → 🔄 Validação → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Reenviar PRD melhorado",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "entregavel": "<PRD melhorado>" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Melhorar e reenviar PRD",
            args_template: {
                diretorio,
                acao: "avancar",
                entregavel: "{{PRD_MELHORADO}}",
            },
            requires_user_input: false,
            auto_execute: true,
        },
        progress: {
            current_phase: "specialist_validating",
            total_phases: 5,
            completed_phases: 3,
            percentage: 65,
        },
    };
}

/**
 * Handler: approved — PRD aprovado, preparar transição
 */
async function handleApproved(
    args: SpecialistPhaseArgs,
    onboarding: OnboardingState,
    sp: SpecialistPhaseState
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    sp.status = 'approved';
    sp.completedAt = sp.completedAt || new Date().toISOString();
    onboarding.prdStatus = 'approved';
    onboarding.phase = 'completed';
    onboarding.completedAt = new Date().toISOString();

    // Avançar estado do projeto para fase 1 de desenvolvimento
    estado.fase_atual = 1;
    estado.aguardando_classificacao = true;

    await persistState(estado, onboarding, diretorio);

    return {
        content: formatResponse({
            titulo: "✅ PRD Aprovado!",
            resumo: `PRD validado com score ${sp.validationScore || 'N/A'}/100. Onboarding concluído!`,
            dados: {
                "Score Final": `${sp.validationScore || 'N/A'}/100`,
                "Interações": sp.interactionCount.toString(),
                "Status": "Aprovado",
            },
            instrucoes: `O PRD foi aprovado! Parabéns!

🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Você DEVE avançar para a fase de desenvolvimento IMEDIATAMENTE.

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

🤖 **NÃO ESPERE** o usuário. Execute a tool AGORA para iniciar o desenvolvimento.

## 📍 Onde Estamos
✅ Setup → ✅ Coleta → ✅ Geração PRD → ✅ Validação → 🔄 Desenvolvimento

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar"})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: "Avançar para fase de desenvolvimento",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Avançar para fase de desenvolvimento",
            args_template: {
                diretorio,
                acao: "avancar",
            },
            requires_user_input: false,
            auto_execute: true,
        },
        progress: {
            current_phase: "specialist_approved",
            total_phases: 5,
            completed_phases: 4,
            percentage: 85,
        },
    };
}

// === HELPERS ===

/**
 * v6.1 (Problem #4): Extracts only the heading structure (skeleton) from a full template.
 * Reduces token usage by ~80% compared to injecting the full template content.
 */
function extractTemplateSkeleton(templateContent: string): string {
    const lines = templateContent.split('\n');
    const skeleton: string[] = [];

    for (const line of lines) {
        // Keep headings
        if (line.match(/^#{1,6}\s+/)) {
            skeleton.push(line);
        }
        // Keep checkbox items (just the label, not description)
        else if (line.match(/^\s*-?\s*\[\s*\]/)) {
            const match = line.match(/^\s*-?\s*\[\s*\]\s*\*?\*?(.+?)[\*:].*/);
            if (match) {
                skeleton.push(`- [ ] ${match[1].trim()}`);
            } else {
                skeleton.push(line.substring(0, 80));
            }
        }
    }

    return skeleton.join('\n');
}

/**
 * Sprint 3 (NP1, NP5, NP9): Formata campos faltantes organizados por blocos temáticos com exemplos.
 */
function formatMissingFieldsByBlock(missing: RequiredField[], mode: string): string {
    const blockTitles: Record<string, string> = {
        'problema': '🔍 **O Problema**',
        'solucao': '💡 **A Solução**',
        'planejamento': '📅 **Planejamento**',
    };

    const blockOrder = ['problema', 'solucao', 'planejamento'];
    const grouped: Record<string, RequiredField[]> = {};

    for (const f of missing) {
        if (!grouped[f.block]) grouped[f.block] = [];
        grouped[f.block].push(f);
    }

    const parts: string[] = ['## Campos que FALTAM (pergunte ao usuário):\n'];

    for (const block of blockOrder) {
        const fields = grouped[block];
        if (!fields || fields.length === 0) continue;

        parts.push(`### ${blockTitles[block] || block}\n`);
        for (const f of fields) {
            parts.push(`❌ **${f.label}**`);
            parts.push(`   _${f.hint}_`);
            parts.push(`   ${f.example}\n`);
        }
    }

    return parts.join('\n');
}

/**
 * Sprint 2 (NP6, NP8): Carrega contexto resumido do especialista para injeção na fase collecting.
 * Retorna markdown com esqueleto do template + checklist resumido + guia da skill.
 */
async function loadCollectingContext(diretorio: string, skillName: string): Promise<string> {
    try {
        const contentResolver = new ContentResolverService(diretorio);
        const skillLoader = new SkillLoaderService(contentResolver);
        const pkg = await skillLoader.loadCollectingPackage(skillName);
        if (!pkg) return '';

        const parts: string[] = [];

        if (pkg.templateSkeleton) {
            parts.push(`## 📋 Estrutura do PRD Final (use como guia para suas perguntas)

${pkg.templateSkeleton}`);
        }

        if (pkg.checklistSummary) {
            parts.push(`## ✅ Checklist de Validação (resumo)

${pkg.checklistSummary}`);
        }

        if (pkg.skillGuide) {
            parts.push(`## 🧠 Guia do Especialista

${pkg.skillGuide}`);
        }

        if (parts.length === 0) return '';
        return parts.join('\n\n') + `\n\n> 📊 Contexto injetado: ~${pkg.tokenEstimate} tokens`;
    } catch (err) {
        console.warn('[specialist-phase] Falha ao carregar collecting context:', err);
        return '';
    }
}

/**
 * Constrói prompt de coleta quando não há respostas
 */
async function buildCollectionPrompt(
    diretorio: string,
    sp: SpecialistPhaseState,
    mode: string
): Promise<ToolResult> {
    const required = getRequiredFields(mode);
    const missing = required.filter(f => !sp.collectedData[f.id]);
    const collected = required.filter(f => sp.collectedData[f.id]);

    const missingTemplate: Record<string, string> = {};
    for (const f of missing) {
        missingTemplate[f.id] = `<${f.label}>`;
    }

    const collectedInfo = collected.length > 0
        ? `\n\nCampos já coletados:\n${collected.map(f => `✅ **${f.label}**: ${truncateValue(sp.collectedData[f.id])}`).join('\n')}`
        : '';

    // Sprint 2 (NP6, NP8): Injetar contexto do especialista desde a coleta
    const collectingContext = await loadCollectingContext(diretorio, sp.skillName);

    return {
        content: formatResponse({
            titulo: "🧠 Especialista: Gestão de Produto",
            resumo: `Coleta de informações do produto. ${collected.length}/${required.length} campos preenchidos.`,
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos abaixo. NÃO invente dados.

${collectingContext}
${collectedInfo}

${formatMissingFieldsByBlock(missing, mode)}

⚠️ REGRA CRÍTICA: Os dados devem vir DIRETAMENTE do usuário.
Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim":
→ Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados."
→ Reformule as perguntas de forma mais simples se o usuário parecer travado.
→ Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.

Após coletar as respostas, EXECUTE:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "respostas": ${JSON.stringify(missingTemplate, null, 4)}
})
\`\`\`

## 📍 Onde Estamos
✅ Setup → 🔄 Coleta → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar"})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: "Enviar respostas coletadas do usuário",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": ${JSON.stringify(missingTemplate)} }`,
                requer_input_usuario: true,
                prompt_usuario: `Responda: ${missing.map(f => f.label).join(', ')}`,
            },
        }),
        next_action: {
            tool: "executar",
            description: `Coletar e enviar: ${missing.map(f => f.label).join(', ')}`,
            args_template: {
                diretorio,
                acao: "avancar",
                respostas: missingTemplate,
            },
            requires_user_input: true,
            user_prompt: `Pergunte ao usuário: ${missing.map(f => f.label).join(', ')}`,
        },
        specialist_persona: {
            name: "Gestão de Produto",
            tone: "Estratégico e orientado ao usuário",
            expertise: ["product discovery", "lean startup", "user stories", "MVP definition"],
            instructions: "Conduza a coleta focada em PRODUTO. PERGUNTE — NÃO invente. Faça follow-up quando respostas forem vagas.",
        },
        progress: {
            current_phase: "specialist_active",
            total_phases: 5,
            completed_phases: 1,
            percentage: 20,
        },
    };
}

interface RequiredField {
    id: string;
    label: string;
    hint: string;
    example: string;
    block: 'problema' | 'solucao' | 'planejamento';
    modes: string[];
}

/**
 * Sprint 3 (NP1, NP5, NP9): Campos com linguagem simples, exemplos práticos e blocos temáticos.
 * Alinhados com seções do template PRD para eliminar gap campos vs template.
 */
function getRequiredFields(mode: string): RequiredField[] {
    const fields: RequiredField[] = [
        // Bloco 1 — O Problema (todos os modos)
        { id: 'problema', label: 'Qual problema seu produto resolve?', hint: 'Descreva a dor principal que seus usuários sentem hoje', example: 'Ex: "Equipes perdem controle de tarefas por usar planilhas"', block: 'problema', modes: ['economy', 'balanced', 'quality'] },
        { id: 'publico_alvo', label: 'Quem vai usar seu produto?', hint: 'Descreva o perfil das pessoas que mais precisam da solução', example: 'Ex: "Pequenas empresas de 5-30 pessoas, coordenadores de equipe"', block: 'problema', modes: ['economy', 'balanced', 'quality'] },

        // Bloco 2 — A Solução (todos os modos)
        { id: 'funcionalidades_mvp', label: 'Quais as 3-5 coisas mais importantes que o produto precisa fazer?', hint: 'Liste as funcionalidades essenciais para a primeira versão', example: 'Ex: "Criar checklists, atribuir tarefas, ver status, notificar prazos"', block: 'solucao', modes: ['economy', 'balanced', 'quality'] },
        { id: 'north_star_metric', label: 'Qual número mostra que o produto está funcionando?', hint: 'A métrica mais importante para saber se o produto dá certo', example: 'Ex: "% de checklists concluídos no prazo" ou "Quantos pedidos por semana"', block: 'solucao', modes: ['economy', 'balanced', 'quality'] },

        // Bloco 3 — Planejamento (balanced/quality)
        { id: 'riscos', label: 'O que pode dar errado?', hint: 'Riscos que podem atrapalhar o sucesso do produto', example: 'Ex: "Usuários não adotarem, custo alto de servidor, concorrente lançar antes"', block: 'planejamento', modes: ['balanced', 'quality'] },
        { id: 'timeline', label: 'Em quanto tempo quer lançar a primeira versão?', hint: 'Prazo desejado para o MVP estar no ar', example: 'Ex: "8 semanas para MVP + 2 semanas piloto"', block: 'planejamento', modes: ['balanced', 'quality'] },

        // Campos extras balanced (alinhados com template PRD)
        { id: 'diferencial', label: 'O que torna seu produto diferente dos concorrentes?', hint: 'Sua vantagem competitiva ou proposta de valor única', example: 'Ex: "Integração nativa com WhatsApp, que nenhum concorrente tem"', block: 'solucao', modes: ['balanced', 'quality'] },

        // Campos extras quality (alinhados com template PRD)
        { id: 'personas', label: 'Descreva 2-3 tipos de pessoas que vão usar (nome fictício, cargo, rotina)', hint: 'Perfis detalhados dos usuários principais', example: 'Ex: "Maria, coordenadora, monitora equipes pelo celular entre reuniões"', block: 'problema', modes: ['quality'] },
        { id: 'go_to_market', label: 'Como pretende conseguir os primeiros usuários?', hint: 'Estratégia para lançamento e adoção inicial', example: 'Ex: "Piloto com 2 clientes atuais, depois indicação boca-a-boca"', block: 'planejamento', modes: ['quality'] },
        { id: 'visao_produto', label: 'Onde você quer que o produto esteja em 1 ano?', hint: 'Visão de longo prazo do produto', example: 'Ex: "Ser a ferramenta padrão de gestão de tarefas para PMEs no Brasil"', block: 'solucao', modes: ['quality'] },
    ];

    return fields.filter(f => f.modes.includes(mode));
}

/**
 * Sprint 3: Agrupa campos por bloco temático para coleta em etapas
 */
function getFieldsByBlock(mode: string): { block: string; title: string; fields: RequiredField[] }[] {
    const allFields = getRequiredFields(mode);
    const blocks = [
        { block: 'problema', title: '🔍 O Problema — Conte sobre o problema que quer resolver e quem sofre com ele' },
        { block: 'solucao', title: '💡 A Solução — O que o produto precisa fazer e como medir se está funcionando?' },
        { block: 'planejamento', title: '📅 Planejamento — Riscos, prazos e como chegar aos primeiros usuários' },
    ];

    return blocks
        .map(b => ({
            ...b,
            fields: allFields.filter(f => f.block === b.block),
        }))
        .filter(b => b.fields.length > 0);
}

// === Sprint 6 (NP10): Validação Estruturada do PRD ===

interface SectionCheck {
    heading: RegExp;
    minContentLength: number;
    weight: number;
    label: string;
}

interface SectionResult {
    label: string;
    found: boolean;
    hasContent: boolean;
    score: number;
    maxScore: number;
    contentLength: number;
}

/**
 * v6.1 (Bug #1 fix): Regex patterns match against CLEANED heading text
 * (splitPrdBySections already strips '#' prefixes via headingMatch[2]).
 * Removed leading regex prefix that was causing all sections to appear "not found".
 * Also made patterns more permissive with optional numbering prefixes like "1." or "1.1".
 */
const SECTION_CHECKS: SectionCheck[] = [
    { heading: /^\d*\.?\d*\s*(sum[aá]rio|summary|executiv)/i, minContentLength: 100, weight: 10, label: 'Sumário Executivo' },
    { heading: /^\d*\.?\d*\s*(problema|problem|oportunidade|dor)/i, minContentLength: 150, weight: 15, label: 'Problema e Oportunidade' },
    { heading: /^\d*\.?\d*\s*(persona|jobs?\s*to\s*be|p[uú]blico|usu[aá]rio)/i, minContentLength: 100, weight: 15, label: 'Personas e Público-alvo' },
    { heading: /^\d*\.?\d*\s*(mvp|funcionalidade|feature|solu[cç][aã]o)/i, minContentLength: 100, weight: 15, label: 'MVP e Funcionalidades' },
    { heading: /^\d*\.?\d*\s*(m[eé]trica|kpi|north\s*star|sucesso|indicador)/i, minContentLength: 50, weight: 10, label: 'Métricas de Sucesso' },
    { heading: /^\d*\.?\d*\s*(risco|mitiga[cç])/i, minContentLength: 80, weight: 10, label: 'Riscos e Mitigações' },
    { heading: /^\d*\.?\d*\s*(timeline|cronograma|marco|prazo|roadmap)/i, minContentLength: 50, weight: 5, label: 'Timeline e Marcos' },
    { heading: /^\d*\.?\d*\s*(vis[aã]o|estrat[eé]gia|go.to.market|escopo)/i, minContentLength: 50, weight: 5, label: 'Visão e Estratégia' },
];

/**
 * Sprint 6: Divide PRD em seções por headings markdown
 */
/**
 * v6.1 (Bug #1 fix): Added normalizePrdContent() call before splitting.
 * Also matches up to h6 headers (#{1,6}) instead of only h4.
 */
function splitPrdBySections(prd: string): { heading: string; content: string }[] {
    // Normalize is done before calling this function, but safe to re-normalize
    const normalizedPrd = normalizePrdContent(prd);
    const lines = normalizedPrd.split('\n');
    const sections: { heading: string; content: string }[] = [];
    let currentHeading = '';
    let currentContent: string[] = [];

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (currentHeading) {
                sections.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
            }
            currentHeading = headingMatch[2].trim();
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }

    if (currentHeading) {
        sections.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
    }

    return sections;
}

/**
 * v6.1 (Bug #1): Normalizes PRD content to fix JSON escape issues.
 * When PRD is sent as JSON string argument, \n may arrive as literal "\n" instead of newlines.
 * Also handles \r\n and other escape artifacts.
 */
function normalizePrdContent(content: string): string {
    let normalized = content;

    // Fix literal \n that are not actual newlines
    // Only replace if the string doesn't seem to have real newlines already
    const realNewlineCount = (normalized.match(/\n/g) || []).length;
    const literalNewlineCount = (normalized.match(/\\n/g) || []).length;

    if (literalNewlineCount > realNewlineCount * 2) {
        // Likely has escaped newlines — replace them
        normalized = normalized.replace(/\\n/g, '\n');
    }

    // Normalize CRLF to LF
    normalized = normalized.replace(/\r\n/g, '\n');

    // Fix escaped quotes from JSON serialization if present
    normalized = normalized.replace(/\\"/g, '"');

    // Fix double-escaped newlines (\\n → \n)
    normalized = normalized.replace(/\\\\n/g, '\n');

    return normalized.trim();
}

/**
 * Sprint 6 (NP10): Calcula score estruturado do PRD por seções com conteúdo mínimo.
 * Substitui a versão antiga baseada em regex triviais.
 */
function calculatePrdScore(prd: string, mode: string): number {
    const { score } = calculatePrdScoreDetailed(prd);
    return score;
}

function calculatePrdScoreDetailed(prd: string): { score: number; details: SectionResult[] } {
    const sections = splitPrdBySections(prd);
    const results: SectionResult[] = [];

    for (const check of SECTION_CHECKS) {
        const section = sections.find(s => check.heading.test(s.heading));
        const found = !!section;
        const contentLength = section ? section.content.length : 0;
        const hasContent = found && contentLength >= check.minContentLength;
        const sectionScore = found && hasContent
            ? check.weight
            : found
                ? Math.floor(check.weight * 0.5)
                : 0;

        results.push({
            label: check.label,
            found,
            hasContent,
            score: sectionScore,
            maxScore: check.weight,
            contentLength,
        });
    }

    // Bonus por completude geral
    const wordCount = prd.split(/\s+/).length;
    let bonus = 0;
    if (wordCount > 500) bonus += 10;
    if (wordCount > 1000) bonus += 5;

    const total = Math.min(results.reduce((acc, r) => acc + r.score, 0) + bonus, 100);
    return { score: total, details: results };
}

/**
 * Sprint 6 (NP10): Identifica gaps no PRD com detalhes por seção.
 * Mostra seções ausentes, seções com conteúdo insuficiente, e pontos perdidos.
 */
function identifyPrdGaps(prd: string, mode: string): string[] {
    const { details } = calculatePrdScoreDetailed(prd);
    const gaps: string[] = [];

    for (const result of details) {
        if (!result.found) {
            gaps.push(`❌ **${result.label}**: Seção não encontrada (0/${result.maxScore} pontos)`);
        } else if (!result.hasContent) {
            gaps.push(`⚠️ **${result.label}**: Seção encontrada mas conteúdo insuficiente — ${result.contentLength} chars (${result.score}/${result.maxScore} pontos)`);
        }
    }

    const wordCount = prd.split(/\s+/).length;
    if (wordCount < 200) {
        gaps.push(`📏 PRD muito curto (${wordCount} palavras). Mínimo recomendado: 500 palavras.`);
    }

    // Mostrar seções completas como referência positiva
    const complete = details.filter(r => r.found && r.hasContent);
    if (complete.length > 0 && gaps.length > 0) {
        gaps.push('');
        gaps.push('**Seções completas:**');
        for (const r of complete) {
            gaps.push(`✅ **${r.label}**: Completo (${r.score}/${r.maxScore} pontos)`);
        }
    }

    return gaps;
}

/**
 * Trunca valor para exibição
 */
function truncateValue(value: any): string {
    const str = String(value);
    return str.length > 80 ? str.substring(0, 77) + '...' : str;
}

/**
 * Persiste estado atualizado
 */
async function persistState(
    estado: EstadoProjeto,
    onboarding: OnboardingState,
    diretorio: string
): Promise<void> {
    (estado as any).onboarding = onboarding;
    estado.atualizado_em = new Date().toISOString();
    const estadoFile = serializarEstado(estado);
    try {
        await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
        console.error('[specialist-phase] Erro ao salvar estado:', err);
    }
}
