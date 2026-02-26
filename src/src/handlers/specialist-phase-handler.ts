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
import { existsSync, readFileSync } from "fs";
import { detectIDE, getSkillsDir, getSkillFilePath, type IDEType, formatSkillHydrationCommand } from "../utils/ide-paths.js";
import { classificacaoProgressiva } from "../services/classificacao-progressiva.service.js";
import { getFaseComStitch } from "../flows/types.js";
import { normalizeFieldKey, getRequiredFields } from "./field-normalizer.js";
import { calculatePrdScore, calculatePrdScoreDetailed, identifyPrdGaps, normalizePrdContent } from "./prd-scorer.js";
import { loadCollectingContext, formatMissingFieldsByBlock, truncateValue, buildCollectionPrompt } from "./specialist-formatters.js";

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


/**
 * Entry point do specialist phase handler.
 * Detecta o status atual e delega para o handler correto.
 */
export async function handleSpecialistPhase(args: SpecialistPhaseArgs): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const onboarding = estado.onboarding;

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
        return buildCollectionPrompt(estado, diretorio, sp, mode, resolveIDEForProject);
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
    // v5.6 FIX (ERRO-008): Restaurar flag para que avancar.ts:128 roteie corretamente
    estado.aguardando_classificacao = true;
    estado.classificacao_pos_prd_confirmada = false;
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

/**
 * Persiste estado atualizado
 */
async function persistState(
    estado: EstadoProjeto,
    onboarding: OnboardingState,
    diretorio: string
): Promise<void> {
    estado.onboarding = onboarding;
    estado.atualizado_em = new Date().toISOString();
    const estadoFile = serializarEstado(estado);
    try {
        await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
        console.error('[specialist-phase] Erro ao salvar estado:', err);
    }
}

// Exportar funcao para uso em outros modulos
export { getSpecialistQuestions } from "./specialist-formatters.js";
