/**
 * Specialist Phase Handler (v6.0)
 * 
 * Handler central do novo fluxo de onboarding unificado.
 * Gerencia o ciclo: specialist_active → collecting → generating → validating → approved
 * 
 * Resolve:
 * - P5: Especialista nunca ativado de verdade
 * - P10: IA chama tool errada
 * - P11: next_action sem parâmetros necessários
 * - P14: Recovery paths claros em caso de erro
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { OnboardingState, SpecialistPhaseState } from "../types/onboarding.js";
import { formatResponse, formatError } from "../utils/response-formatter.js";
import { serializarEstado } from "../state/storage.js";
import { saveFile } from "../utils/persistence.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";

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

    // Acumular dados recebidos
    for (const [key, value] of Object.entries(respostas)) {
        if (value !== undefined && value !== null && value !== '') {
            sp.collectedData[key] = value;
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
        // Todos os campos obrigatórios preenchidos → gerar PRD
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

Campos já coletados:
${collected.map(f => `✅ **${f.label}**: ${truncateValue(sp.collectedData[f.id])}`).join('\n')}

Campos que FALTAM (pergunte ao usuário):
${missing.map(f => `❌ **${f.label}** — ${f.hint}`).join('\n')}

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
            instrucoes: `⚠️ OBRIGATÓRIO: Use o template abaixo para gerar o PRD. NÃO invente dados que não foram coletados.

## Dados Coletados do Usuário

${collectedSummary}

${templateContent ? `## Template do PRD (USE ESTE TEMPLATE)

${templateContent}` : '## Template do PRD\n\nGere um PRD estruturado com: Visão, Problema, Público-alvo, Funcionalidades MVP, Métricas de Sucesso, Riscos.'}

${checklistContent ? `## Checklist de Validação (VALIDE CONTRA ESTE CHECKLIST)

${checklistContent}` : ''}

---

⚠️ **INSTRUÇÕES DE GERAÇÃO:**
1. Preencha CADA seção do template com os dados coletados
2. Se um dado não foi coletado, marque como "A definir com o usuário"
3. NÃO invente números, métricas ou dados que o usuário não forneceu
4. Após gerar, envie o PRD como entregável:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "entregavel": "<conteúdo completo do PRD>"
})
\`\`\`

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
 */
async function handleValidating(
    args: SpecialistPhaseArgs,
    onboarding: OnboardingState,
    sp: SpecialistPhaseState
): Promise<ToolResult> {
    const { estado, diretorio, entregavel } = args;

    if (!entregavel) {
        // Se chamou sem entregável, voltar para generating
        sp.status = 'generating';
        await persistState(estado, onboarding, diretorio);
        return handleGenerating(args, onboarding, sp);
    }

    // Salvar PRD draft
    sp.prdDraft = entregavel;
    sp.status = 'validating';

    // Calcular score básico de validação
    const score = calculatePrdScore(entregavel, onboarding.mode);
    sp.validationScore = score;

    onboarding.prdStatus = 'draft';
    onboarding.totalInteractions++;
    onboarding.lastInteractionAt = new Date().toISOString();

    // Salvar PRD como arquivo
    try {
        await saveFile(`${diretorio}/.maestro/entregaveis/prd-draft.md`, entregavel);
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

    // PRD precisa de melhorias
    const gaps = identifyPrdGaps(entregavel, onboarding.mode);

    return {
        content: formatResponse({
            titulo: "📊 Validação do PRD",
            resumo: `PRD recebido. Score: ${score}/100. ${score >= 70 ? 'Aprovado!' : 'Precisa de melhorias.'}`,
            dados: {
                "Score": `${score}/100`,
                "Status": score >= 70 ? "✅ Aprovado" : "⚠️ Precisa de melhorias",
                "Mínimo": "70/100",
            },
            instrucoes: `${gaps.length > 0 ? `## Gaps Identificados\n\n${gaps.map(g => `- ❌ ${g}`).join('\n')}\n\n` : ''}⚠️ Melhore o PRD nos pontos acima e reenvie:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "entregavel": "<PRD melhorado>"
})
\`\`\`

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar", entregavel: "..."})\``,
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
            instrucoes: `O PRD foi aprovado. O projeto agora avança para a fase de desenvolvimento.

⚠️ Próximo passo: Confirmar classificação do projeto baseada no PRD gerado.

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

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
 * Constrói prompt de coleta quando não há respostas
 */
function buildCollectionPrompt(
    diretorio: string,
    sp: SpecialistPhaseState,
    mode: string
): ToolResult {
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

    return {
        content: formatResponse({
            titulo: "🧠 Especialista: Gestão de Produto",
            resumo: `Coleta de informações do produto. ${collected.length}/${required.length} campos preenchidos.`,
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos abaixo. NÃO invente dados.
${collectedInfo}

Campos que FALTAM (pergunte ao usuário):
${missing.map(f => `❌ **${f.label}** — ${f.hint}`).join('\n')}

Após coletar as respostas, EXECUTE:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "respostas": ${JSON.stringify(missingTemplate, null, 4)}
})
\`\`\`

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
    modes: string[];
}

/**
 * Retorna campos obrigatórios por modo
 */
function getRequiredFields(mode: string): RequiredField[] {
    const fields: RequiredField[] = [
        { id: 'problema', label: 'Problema central', hint: 'Qual problema o produto resolve?', modes: ['economy', 'balanced', 'quality'] },
        { id: 'publico_alvo', label: 'Público-alvo', hint: 'Quem são os usuários principais?', modes: ['economy', 'balanced', 'quality'] },
        { id: 'funcionalidades_mvp', label: 'Funcionalidades MVP', hint: '3-5 features essenciais', modes: ['economy', 'balanced', 'quality'] },
        { id: 'north_star_metric', label: 'North Star Metric', hint: 'Como medir sucesso?', modes: ['economy', 'balanced', 'quality'] },
        { id: 'riscos', label: 'Riscos principais', hint: 'Riscos de mercado, técnicos, negócio', modes: ['balanced', 'quality'] },
        { id: 'timeline', label: 'Timeline desejado', hint: 'Cronograma esperado', modes: ['balanced', 'quality'] },
        { id: 'personas', label: 'Personas detalhadas', hint: '2-3 personas com JTBD', modes: ['quality'] },
        { id: 'go_to_market', label: 'Estratégia go-to-market', hint: 'Como alcançar os primeiros usuários', modes: ['quality'] },
    ];

    return fields.filter(f => f.modes.includes(mode));
}

/**
 * Calcula score básico do PRD
 */
function calculatePrdScore(prd: string, mode: string): number {
    let score = 0;
    const checks = [
        { pattern: /proble?ma|pain\s*point/i, weight: 15, label: 'Problema definido' },
        { pattern: /p[uú]blico|target|persona|usu[aá]rio/i, weight: 15, label: 'Público-alvo' },
        { pattern: /funcionalidade|feature|mvp/i, weight: 15, label: 'Funcionalidades MVP' },
        { pattern: /m[eé]trica|kpi|north\s*star|sucesso/i, weight: 10, label: 'Métricas' },
        { pattern: /risco|mitiga/i, weight: 10, label: 'Riscos' },
        { pattern: /escopo|fora\s*do\s*escopo|out\s*of\s*scope/i, weight: 10, label: 'Escopo' },
        { pattern: /cronograma|timeline|prazo/i, weight: 5, label: 'Timeline' },
        { pattern: /requisito|requirement/i, weight: 5, label: 'Requisitos' },
    ];

    for (const check of checks) {
        if (check.pattern.test(prd)) {
            score += check.weight;
        }
    }

    // Bonus por tamanho (PRDs muito curtos são incompletos)
    const wordCount = prd.split(/\s+/).length;
    if (wordCount > 500) score += 10;
    if (wordCount > 1000) score += 5;

    return Math.min(score, 100);
}

/**
 * Identifica gaps no PRD
 */
function identifyPrdGaps(prd: string, mode: string): string[] {
    const gaps: string[] = [];
    const checks = [
        { pattern: /proble?ma|pain\s*point/i, label: 'Seção de Problema não encontrada' },
        { pattern: /p[uú]blico|target|persona/i, label: 'Seção de Público-alvo não encontrada' },
        { pattern: /funcionalidade|feature|mvp/i, label: 'Seção de Funcionalidades MVP não encontrada' },
        { pattern: /m[eé]trica|kpi|north\s*star/i, label: 'Seção de Métricas de Sucesso não encontrada' },
        { pattern: /risco|mitiga/i, label: 'Seção de Riscos não encontrada' },
        { pattern: /escopo|fora\s*do\s*escopo/i, label: 'Definição de Escopo não encontrada' },
    ];

    for (const check of checks) {
        if (!check.pattern.test(prd)) {
            gaps.push(check.label);
        }
    }

    const wordCount = prd.split(/\s+/).length;
    if (wordCount < 200) {
        gaps.push(`PRD muito curto (${wordCount} palavras). Mínimo recomendado: 500 palavras.`);
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
