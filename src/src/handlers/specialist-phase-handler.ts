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
import { existsSync, readFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { detectIDE, getSkillsDir, getSkillResourcePath, getSkillFilePath, type IDEType, formatSkillHydrationCommand } from "../utils/ide-paths.js";
import { classificarPRD } from "../flows/classifier.js"; // @deprecated v6.0 - usar ClassificacaoProgressivaService
import { inferirContextoBalanceado } from "../utils/inferencia-contextual.js";
import { classificacaoProgressiva } from "../services/classificacao-progressiva.service.js"; // v6.0
import { getFaseComStitch } from "../flows/types.js"; // v6.0

/** Maximum number of automatic PRD validation retries before requiring user approval */
const MAX_PRD_VALIDATION_RETRIES = 3;

/** Paths padrão para saída de documentos — a IA DEVE usar estes paths */
const PRD_OUTPUT_PATHS = {
    primary: 'docs/01-produto/PRD.md',
    draft: '.maestro/entregaveis/prd-draft.md',
} as const;

/**
 * Resolve a IDE efetiva para o projeto (estado > detecção > fallback windsurf)
 */
function resolveIDEForProject(estado: EstadoProjeto, diretorio: string): IDEType {
    return estado.ide || detectIDE(diretorio) || 'windsurf';
}

/**
 * Retorna o path absoluto padronizado para o PRD do projeto
 */
function getPrdOutputPath(diretorio: string): string {
    return `${diretorio}/${PRD_OUTPUT_PATHS.primary}`;
}

/**
 * Retorna o path absoluto do draft do PRD
 */
function getPrdDraftPath(diretorio: string): string {
    return `${diretorio}/${PRD_OUTPUT_PATHS.draft}`;
}

/**
 * Retorna o path relativo de skills adaptado para a IDE do projeto
 */
function getSkillPathForIDE(skillName: string, estado: EstadoProjeto, diretorio: string): {
    skillFile: string;
    templatePath: string;
    checklistPath: string;
    guidePath: string;
} {
    const ide = resolveIDEForProject(estado, diretorio);
    return {
        skillFile: getSkillFilePath(skillName, ide),
        templatePath: `${getSkillsDir(ide)}/${skillName}/resources/templates/PRD.md`,
        checklistPath: `${getSkillsDir(ide)}/${skillName}/resources/checklists/gate-checklist.md`,
        guidePath: `${getSkillsDir(ide)}/${skillName}/SKILL.md`,
    };
}

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
        case 'generating': {
            // v7.1: File-first — verificar disco OU param entregavel
            const hasPrdOnDisk = existsSync(getPrdOutputPath(diretorio)) || existsSync(getPrdDraftPath(diretorio));
            if (args.entregavel || hasPrdOnDisk) {
                sp.status = 'validating';
                return handleValidating(args, onboarding, sp);
            }
            return handleGenerating(args, onboarding, sp);
        }
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
        return buildCollectionPrompt(estado, diretorio, sp, mode);
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

${loadCollectingContext(sp.skillName, resolveIDEForProject(estado, diretorio))}

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

    // Montar contexto para geração do PRD
    const collectedSummary = Object.entries(sp.collectedData)
        .map(([key, value]) => `- **${key}**: ${value}`)
        .join('\n');

    // v7.0: Resolver paths de skills adaptados para a IDE do projeto
    const skillPaths = getSkillPathForIDE(sp.skillName, estado, diretorio);

    sp.status = 'generating';
    await persistState(estado, onboarding, diretorio);

    return {
        content: formatResponse({
            titulo: "📝 Geração do PRD",
            resumo: "Todos os dados foram coletados. Gerando PRD draft usando o template do especialista.",
            instrucoes: `🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Você DEVE gerar o PRD e salvá-lo no disco IMEDIATAMENTE, sem esperar comando do usuário.

## Dados Coletados do Usuário

${collectedSummary}

${formatSkillHydrationCommand(sp.skillName, resolveIDEForProject(estado, diretorio))}

---

⚠️ **INSTRUÇÕES DE GERAÇÃO:**
1. Preencha CADA seção do template com os dados coletados
2. Se um dado não foi coletado, marque como "A definir com o usuário"
3. NÃO invente números, métricas ou dados que o usuário não forneceu
4. **SALVE O PRD** no arquivo \`${PRD_OUTPUT_PATHS.primary}\`
5. Após salvar, avance usando:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

⚠️ **NÃO passe o conteúdo via entregavel.** O MCP lê direto do arquivo.

🤖 **NÃO ESPERE** o usuário dizer "pode seguir" ou "avançar". Salve o arquivo e execute a tool AGORA.

## 📍 Onde Estamos
✅ Setup → ✅ Coleta → 🔄 Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar"})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: "Salvar PRD no disco e avançar para validação",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Salvar PRD em docs/01-produto/PRD.md e avançar",
            args_template: {
                diretorio,
                acao: "avancar",
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
    let entregavel: string | undefined;

    // v7.0: File-first validation — prioriza disco sobre param JSON
    // Isso elimina escape issues de JSON e economiza ~5-10k tokens por chamada
    const docsPath = getPrdOutputPath(diretorio);
    const draftPath = getPrdDraftPath(diretorio);

    // PRIORIDADE 1: Ler do disco (file-first)
    if (existsSync(docsPath)) {
        try { entregavel = readFileSync(docsPath, 'utf-8'); } catch { /* ignore */ }
    }
    if (!entregavel && existsSync(draftPath)) {
        try { entregavel = readFileSync(draftPath, 'utf-8'); } catch { /* ignore */ }
    }

    if (!entregavel) {
        // Se arquivo não existe, instruir a salvar primeiro
        return {
            content: formatResponse({
                titulo: "⚠️ PRD Não Encontrado",
                resumo: "O PRD precisa ser salvo no disco antes de validar.",
                dados: {
                    "Arquivo esperado": PRD_OUTPUT_PATHS.primary,
                },
                instrucoes: `🤖 **AÇÃO REQUERIDA:**

1. **Gere e salve o PRD** no arquivo \`${PRD_OUTPUT_PATHS.primary}\`
2. Após salvar, avance:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

⚠️ **NÃO passe o conteúdo via entregavel.** O MCP lê direto do arquivo.`,
                proximo_passo: {
                    tool: "executar",
                    descricao: "Salvar PRD no arquivo e avançar",
                    args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                    requer_input_usuario: false,
                    auto_execute: true,
                },
            }),
            next_action: {
                tool: "executar",
                description: "Salvar PRD em docs/01-produto/PRD.md e avançar",
                args_template: { diretorio, acao: "avancar" },
                requires_user_input: false,
                auto_execute: true,
            },
            progress: {
                current_phase: "specialist_generating",
                total_phases: 5,
                completed_phases: 2,
                percentage: 55,
            },
        };
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

    // Salvar PRD como arquivo (paths padronizados)
    try {
        await saveFile(getPrdDraftPath(diretorio), entregavel);
        await saveFile(getPrdOutputPath(diretorio), entregavel);
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
                    args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                    requer_input_usuario: true,
                    prompt_usuario: `PRD com score ${score}/100 após ${sp.validationAttempts} tentativas. Aprovar, melhorar ou recomeçar? Se melhorar, edite o arquivo ${PRD_OUTPUT_PATHS.primary} e avance.`,
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
            instrucoes: `## 📊 Detalhamento do Score\n\n${scoreBreakdown}\n\n${gaps.length > 0 ? `## Gaps Identificados\n\n${gaps.map(g => `- ${g}`).join('\n')}\n\n` : ''}🤖 **AÇÃO REQUERIDA (tentativa ${sp.validationAttempts + 1}/${MAX_PRD_VALIDATION_RETRIES}):**\nMelhore o PRD nos pontos acima.\n\n1. **Edite o arquivo** \`${PRD_OUTPUT_PATHS.primary}\` com as melhorias\n2. Após salvar, avance:\n\n\`\`\`json\nexecutar({\n    "diretorio": "${diretorio}",\n    "acao": "avancar"\n})\n\`\`\`\n\n⚠️ **NÃO passe o conteúdo via entregavel.** O MCP lê direto do arquivo.\n\n## 📍 Onde Estamos\n✅ Setup → ✅ Coleta → ✅ Geração PRD → 🔄 Validação → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Salvar PRD melhorado no disco e avançar",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Salvar PRD melhorado em docs/01-produto/PRD.md e avançar",
            args_template: {
                diretorio,
                acao: "avancar",
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
 * Handler: approved — PRD aprovado, preparar transição para classificação
 * 
 * v8.0 Fix: Limpa specialistPhase do onboarding para que avancar.ts
 * não redirecione de volta para o specialist handler.
 * Classifica o PRD do disco e popula classificacao_sugerida.
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

    // v8.0 FIX (Bug A): LIMPAR specialistPhase para que avancar.ts não redirecione de volta
    // Salvamos os dados finais antes de limpar
    const finalScore = sp.validationScore || 0;
    const finalInteractions = sp.interactionCount;

    // Remover specialistPhase do onboarding — onboarding está CONCLUÍDO
    delete onboarding.specialistPhase;

    // v8.0 FIX: Classificar PRD do disco para popular classificacao_sugerida
    let prdContent = '';
    const prdPath = getPrdOutputPath(diretorio);
    const draftPath = getPrdDraftPath(diretorio);
    if (existsSync(prdPath)) {
        try { prdContent = readFileSync(prdPath, 'utf-8'); } catch { /* ignore */ }
    }
    if (!prdContent && existsSync(draftPath)) {
        try { prdContent = readFileSync(draftPath, 'utf-8'); } catch { /* ignore */ }
    }
    if (!prdContent && sp.prdDraft) {
        prdContent = sp.prdDraft;
    }

    // v6.0: Classificação Progressiva — inicializar com sinais do PRD
    let classificacaoInfo = '';
    if (prdContent) {
        // Inicializar classificação progressiva
        const faseAtual = getFaseComStitch(estado.nivel, 1, estado.usar_stitch);
        if (!faseAtual) {
            throw new Error("Fase 1 não encontrada no fluxo");
        }

        // Registrar sinais do PRD
        const sinais = classificacaoProgressiva.registrarSinais(prdContent, faseAtual, []);

        // Calcular classificação inicial
        const { nivel, confianca, criterios } = classificacaoProgressiva.recalcular(sinais);

        // Inicializar estado de classificação progressiva
        estado.classificacao_progressiva = {
            nivel_atual: nivel,
            nivel_provisorio: true, // SEMPRE provisório no PRD
            confianca_geral: confianca,
            sinais,
            historico_niveis: [{
                fase: 1,
                nivel,
                motivo: "Classificação inicial baseada no PRD"
            }],
            fases_refinamento: [1]
        };

        // Manter compatibilidade com classificacao_sugerida
        estado.classificacao_sugerida = {
            nivel,
            pontuacao: Math.round(confianca),
            criterios,
        };

        // Mensagem simplificada - sem bloqueio de classificação
        classificacaoInfo = `

✅ **PRD Aprovado e Salvo!**

📁 Arquivo: \`docs/01-produto/PRD.md\`

🎯 **Próximo Passo:** Vamos detalhar os requisitos técnicos com o Especialista de Requisitos.

> 💡 A classificação do projeto será refinada automaticamente conforme avançamos nas fases.

Use: \`executar({acao: "avancar"})\`
`;
    }

    // Avançar estado do projeto para fase 1 de desenvolvimento
    estado.fase_atual = 1;
    // Classificação em background - sem bloqueio
    // estado.aguardando_classificacao removido - classificação é silenciosa
    estado.status = 'ativo';

    await persistState(estado, onboarding, diretorio);

    return {
        content: formatResponse({
            titulo: "✅ PRD Aprovado!",
            resumo: `PRD validado com score ${finalScore}/100. Onboarding concluído! Agora confirme a classificação do projeto.`,
            dados: {
                "Score Final": `${finalScore}/100`,
                "Interações": finalInteractions.toString(),
                "Status": "Aprovado — Aguardando classificação",
            },
            instrucoes: `O PRD foi aprovado! Parabéns!
${classificacaoInfo}

## 📍 Onde Estamos
✅ Setup → ✅ Coleta → ✅ Geração PRD → ✅ Validação → 🔄 Classificação → ⏳ Desenvolvimento

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar", respostas: {nivel: "..."}})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: "Confirmar classificação do projeto",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": { "nivel": "${estado.classificacao_sugerida?.nivel || 'medio'}" } }`,
                requer_input_usuario: true,
                prompt_usuario: "Confirme a classificação sugerida ou ajuste o nível.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Confirmar classificação do projeto",
            args_template: {
                diretorio,
                acao: "avancar",
                respostas: { nivel: estado.classificacao_sugerida?.nivel || 'medio' },
            },
            requires_user_input: true,
            user_prompt: "Confirme a classificação sugerida ou ajuste o nível.",
        },
        progress: {
            current_phase: "classificacao",
            total_phases: 6,
            completed_phases: 4,
            percentage: 70,
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
 * v7.0: Substituído injeção ativa por menção dinâmica da IDE
 */
function loadCollectingContext(skillName: string, ide: IDEType): string {
    return formatSkillHydrationCommand(skillName, ide);
}

/**
 * Constrói prompt de coleta quando não há respostas
 */
async function buildCollectionPrompt(
    estado: EstadoProjeto,
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
    const collectingContext = loadCollectingContext(sp.skillName, resolveIDEForProject(estado, diretorio));

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
        { id: 'diferencial', label: 'O que torna seu produto diferente dos concorrentes?', hint: 'Sua vantagem competitiva ou proposta de valor única', example: 'Ex: "Integração nativa com WhatsApp, que nenhum concorrente tem"', block: 'solucao', modes: ['economy', 'balanced', 'quality'] },

        // Bloco 3 — Planejamento (balanced/quality)
        { id: 'riscos', label: 'O que pode dar errado?', hint: 'Riscos que podem atrapalhar o sucesso do produto', example: 'Ex: "Usuários não adotarem, custo alto de servidor, concorrente lançar antes"', block: 'planejamento', modes: ['balanced', 'quality'] },
        { id: 'timeline', label: 'Em quanto tempo quer lançar a primeira versão?', hint: 'Prazo desejado para o MVP estar no ar', example: 'Ex: "8 semanas para MVP + 2 semanas piloto"', block: 'planejamento', modes: ['balanced', 'quality'] },

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

/**
 * Sprint 2 (v7.0): Retorna perguntas técnicas que o especialista deve fazer
 * Distribui perguntas técnicas aos especialistas de cada fase
 * 
 * v8.1 FIX: Refatorado para usar nome da fase em vez de número hardcoded.
 * Quando Stitch está habilitado, fase 4 é Prototipagem (não Arquitetura).
 * Usar número causava injeção de perguntas de Arquitetura na fase de Prototipagem.
 */
function getSpecialistQuestions(fase: number, faseNome?: string): string {
    // v8.1: Usar nome da fase quando disponível (mais robusto que número)
    const nome = faseNome?.toLowerCase() || '';

    if (nome === 'requisitos' || (!faseNome && fase === 2)) {
        return `
## 📋 Coleta de Requisitos Técnicos

Como Especialista de Requisitos, preciso entender alguns aspectos técnicos para criar um documento completo:

### 1. Volume e Escala
- Quantos usuários simultâneos você espera?
- Quantas transações/operações por dia?
- Crescimento esperado nos próximos 6 meses?

### 2. Integrações Externas
- Precisa integrar com quais sistemas/APIs?
- Exemplos: pagamento (Stripe, PagSeguro), email (SendGrid), SMS, etc.
- Autenticação social? (Google, Facebook, etc.)

### 3. Segurança e Compliance
- Precisa seguir LGPD? (dados de brasileiros)
- Dados sensíveis? (cartão, saúde, financeiro)
- Outros requisitos? (PCI-DSS, HIPAA, SOC2)

### 4. Performance
- Tempo de resposta esperado? (ex: < 200ms)
- Disponibilidade necessária? (ex: 99.9%)
- Horários de pico de uso?

> 💡 Responda de forma natural, não precisa seguir a ordem exata. Após suas respostas, vou criar o documento de requisitos.
`;
    }

    if (nome === 'arquitetura' || nome === 'arquitetura avançada') {
        return `
## 🏗️ Decisões de Arquitetura

Como Especialista de Arquitetura, preciso entender suas preferências e restrições:

### 1. Stack Tecnológica
- **Frontend:** Tem preferência? (React, Vue, Angular, Next.js)
- **Backend:** Qual linguagem/framework? (Node.js, Python, PHP, Java)
- **Database:** Qual banco de dados? (PostgreSQL, MySQL, MongoDB)
- Alguma restrição ou tecnologia que o time já domina?

### 2. Time e Infraestrutura
- Quem vai desenvolver? (senioridade: júnior, pleno, sênior)
- Onde vai hospedar? (AWS, Azure, Vercel, Heroku, VPS)
- Orçamento mensal de infraestrutura?

### 3. Padrões Arquiteturais
- Monolito ou microserviços?
- Multi-tenant necessário?
- Precisa de cache? CDN?

> 💡 Se não tiver preferência, posso sugerir a melhor stack baseado nos requisitos já definidos.
`;
    }

    if (nome === 'prototipagem') {
        return `
## 🎨 Prototipagem Rápida com Google Stitch

Como Especialista de Prototipagem, vou transformar o Design Doc aprovado em protótipos interativos usando Google Stitch.

### 📋 Processo de 5 Etapas

**Etapa 1 — Análise** *(automática)*
O sistema analisa o Design Doc e mapeia:
- Componentes de UI necessários
- Fluxos de interação principais
- Design System definido

**Etapa 2 — Geração de Prompts** *(automática)*
O sistema gera prompts otimizados e salva em:
📁 \`prototipos/stitch-prompts.md\`

**Etapa 3 — Prototipagem no Stitch** *(usuário)*
Você usa os prompts no stitch.withgoogle.com:
1. Copie cada prompt do arquivo gerado
2. Cole no Google Stitch
3. Itere até obter o resultado desejado
4. **Exporte o código HTML**
5. **Salve os arquivos .html na pasta \`prototipos/\`**

**Etapa 4 — Validação HTML** *(automática)*
O sistema valida os arquivos HTML na pasta:
- Estrutura HTML válida
- Conteúdo mínimo
- Score >= 50 para aprovação

**Etapa 5 — Aprovação**
Protótipos validados → próxima fase

### ⚠️ IMPORTANTE
- **NÃO** peça decisões de stack tecnológica — isso é da fase de Arquitetura
- **NÃO** peça decisões de infraestrutura — isso é da fase de Arquitetura
- Foco é **100% visual**: transformar o Design Doc em protótipos funcionais
- A fase **só será concluída** quando os arquivos HTML estiverem na pasta \`prototipos/\`

### 🎯 Para começar, preciso saber:
1. Qual Design System usar? (Material, Ant Design, Chakra UI, Custom)
2. Quais são as 3-5 telas mais importantes para prototipar primeiro?
3. Tem preferência de tema? (light/dark)

> 💡 Acesse stitch.withgoogle.com para usar os prompts que vou gerar. O Stitch é gratuito e gera interfaces com código exportável.
`;
    }

    return '';
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
    { heading: /^[\d.\s]*(sum[aá]rio|summary|executiv)/i, minContentLength: 100, weight: 10, label: 'Sumário Executivo' },
    { heading: /^[\d.\s]*(problema|problem|oportunidade|dor|pain)/i, minContentLength: 150, weight: 15, label: 'Problema e Oportunidade' },
    { heading: /^[\d.\s]*(persona|jobs?\s*to\s*be|p[uú]blico|usu[aá]rios?|user)/i, minContentLength: 100, weight: 15, label: 'Personas e Público-alvo' },
    { heading: /^[\d.\s]*(mvp|funcionalidade|feature|solu[cç][aã]o|escopo)/i, minContentLength: 100, weight: 15, label: 'MVP e Funcionalidades' },
    { heading: /^[\d.\s]*(m[eé]trica|kpi|north\s*star|sucesso|indicador)/i, minContentLength: 50, weight: 10, label: 'Métricas de Sucesso' },
    { heading: /^[\d.\s]*(risco|mitiga[cç])/i, minContentLength: 80, weight: 10, label: 'Riscos e Mitigações' },
    { heading: /^[\d.\s]*(timeline|cronograma|marco|prazo|roadmap)/i, minContentLength: 50, weight: 5, label: 'Timeline e Marcos' },
    { heading: /^[\d.\s]*(vis[aã]o|estrat[eé]gia|go.to.market|escopo)/i, minContentLength: 50, weight: 5, label: 'Visão e Estratégia' },
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
        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        const level = headingMatch ? headingMatch[1].length : 0;
        // Só quebra seção em h1 ou h2 (nível top-level)
        // Sub-headings (h3, h4) ficam como conteúdo da seção-pai
        if (headingMatch && level <= 2) {
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

// v5.0 Sprint 5: Cache de scores para evitar oscilações
const scoreCache = new Map<string, { score: number; timestamp: number }>();
const SCORE_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Sprint 6 (NP10): Calcula score estruturado do PRD por seções com conteúdo mínimo.
 * v5.0: Adicionado cache e bypass por tamanho
 */
function calculatePrdScore(prd: string, mode: string): number {
    // Sprint 5: Bypass por tamanho — PRDs grandes com estrutura mínima = score alto
    const wordCount = prd.split(/\s+/).length;
    const charCount = prd.length;
    const hasStructure = prd.match(/^#{1,2}\s+/m) && prd.match(/^#{1,2}\s+/m); // Tem pelo menos um h1/h2

    // Se PRD tem >3000 chars, >400 palavras e estrutura markdown → score mínimo 70
    if (charCount > 3000 && wordCount > 400 && hasStructure) {
        const { score } = calculatePrdScoreDetailed(prd);
        // Retorna o maior entre o score calculado e 70 (para evitar penalizar PRDs bons)
        return Math.max(score, 70);
    }

    // Sprint 5: Verificar cache
    const cacheKey = `${prd.slice(0, 500)}-${prd.length}`; // Hash simples
    const cached = scoreCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SCORE_CACHE_TTL) {
        return cached.score;
    }

    const { score } = calculatePrdScoreDetailed(prd);

    // Sprint 5: Salvar no cache
    scoreCache.set(cacheKey, { score, timestamp: Date.now() });

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

// Exportar função para uso em outros módulos
export { getSpecialistQuestions };
