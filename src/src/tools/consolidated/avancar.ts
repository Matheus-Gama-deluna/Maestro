/**
 * Tool Consolidada: avancar
 * 
 * Unifica:
 * - proximo (avançar fase de desenvolvimento)
 * - onboarding_orchestrator (próximo bloco de onboarding)
 * - brainstorm (próxima seção)
 * 
 * Detecta contexto automaticamente e delega para o handler correto.
 * 
 * v8.0 Fixes:
 * - FIX: Prioriza aguardando_classificacao sobre specialistPhase
 * - FIX: Handler de classificação inline (respostas.nivel)
 * - FIX: Passa estado serializado para proximo.ts (não string vazia)
 * - FIX: Safety check para specialistPhase com status approved
 */

import type { ToolResult, EstadoProjeto, NivelComplexidade } from "../../types/index.js";
import { formatResponse, formatError } from "../../utils/response-formatter.js";
import { parsearEstado, serializarEstado } from "../../state/storage.js";
import { createStateService } from "../../services/state.service.js";
import { isInOnboarding } from "../../services/flow-engine.js";
import { proximo } from "../proximo.js";
import { onboardingOrchestrator } from "../../flows/onboarding-orchestrator.js";
import { brainstorm } from "../brainstorm.js";
import { resolveProjectPath } from "../../utils/files.js";
import { getFluxoComStitch, getFaseComStitch, isCodePhaseName } from "../../flows/types.js";
import { determinarTierGate, descreverTier } from "../../gates/tiers.js";
import { getSpecialistPersona } from "../../services/specialist.service.js";
import { existsSync, readFileSync } from "fs";
import { saveFile } from "../../utils/persistence.js";
import { isPrototypePhase } from "../../handlers/prototype-phase-handler.js";

interface AvancarArgs {
    diretorio: string;
    estado_json?: string;
    entregavel?: string;
    respostas?: Record<string, unknown>;
    resumo_json?: string;
    nome_arquivo?: string;
    auto_flow?: boolean;
    acao?: string;
}

// v5.6: Anti-loop protection — tracks consecutive identical calls PER DIRECTORY
const MAX_IDENTICAL_CALLS = 3;
const loopStates = new Map<string, { hash: string; count: number }>();

function computeCallHash(args: AvancarArgs, estado: EstadoProjeto): string {
    // Inclui checksum do conteúdo do entregável: entregáveis diferentes não devem ser
    // contados como chamada idêntica, mesmo que todos os flags de estado sejam iguais.
    const entregavelLen = args.entregavel ? args.entregavel.length : 0;
    const entregavelSnippet = args.entregavel ? args.entregavel.slice(0, 120) : '';
    const key = `${estado.fase_atual}|${estado.aguardando_classificacao}|${estado.aguardando_aprovacao ?? false}|${estado.em_estado_compulsorio ?? false}|${estado.status}|${estado.onboarding?.specialistPhase?.status || 'none'}|${entregavelLen}|${entregavelSnippet}|${JSON.stringify(args.respostas || {})}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const chr = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return String(hash);
}

/**
 * Verifica anti-loop por diretório. Retorna true se loop detectado.
 */
function checkAntiLoop(diretorio: string, hash: string): boolean {
    const state = loopStates.get(diretorio) || { hash: '', count: 0 };
    if (state.hash === hash) {
        state.count++;
        if (state.count >= MAX_IDENTICAL_CALLS) {
            loopStates.delete(diretorio);
            return true;
        }
    } else {
        state.hash = hash;
        state.count = 1;
    }
    loopStates.set(diretorio, state);
    return false;
}

/**
 * Tool: avancar
 * Entry point unificado para avançar no fluxo do projeto.
 * Detecta se está em onboarding ou desenvolvimento e delega.
 */
export async function avancar(args: AvancarArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: formatError("avancar", "Parâmetro `diretorio` é obrigatório."),
            isError: true,
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);

    // Determinar contexto
    let estado: EstadoProjeto | null = null;
    if (args.estado_json) {
        estado = parsearEstado(args.estado_json);
    }

    // v6.0: Auto-carregar estado do filesystem se não fornecido
    if (!estado) {
        try {
            const stateService = createStateService(diretorio);
            estado = await stateService.load();
        } catch {
            // Fallback silencioso
        }
    }

    // Se não tem estado, retornar erro com recovery path
    if (!estado) {
        return {
            content: formatError(
                "avancar",
                "Nenhum projeto encontrado neste diretório.",
                "Use `maestro({diretorio: \"" + diretorio + "\"})` para iniciar um novo projeto."
            ),
            isError: true,
        };
    }

    // v5.6: Anti-loop protection por diretório
    const callHash = computeCallHash(args, estado);
    if (checkAntiLoop(diretorio, callHash)) {
        // Diagnóstico contextual: instrução específica para cada estado de bloqueio
        let instrucaoEspecifica: string;
        if (estado.aguardando_aprovacao) {
            instrucaoEspecifica = [
                `O projeto está bloqueado aguardando decisão do usuário (score ${estado.score_bloqueado}/100).`,
                ``,
                `**NÃO chame executar() novamente sem alteração.** As opções são:`,
                `- **Para aprovar** (avançar mesmo com score baixo): use a tool \`aprovar_gate\` com \`{"acao":"aprovar","diretorio":"${diretorio}"}\``,
                `- **Para corrigir**: edite o arquivo no disco, salve, depois chame \`executar({diretorio:"${diretorio}",acao:"avancar"})\``,
                `- **Para ver os itens ❌**: use \`contexto({diretorio:"${diretorio}",estado_json:"..."})\` para ver o que está pendente`,
            ].join('\n');
        } else if (estado.aguardando_classificacao) {
            instrucaoEspecifica = `Aguardando classificação do projeto. Responda com: \`executar({diretorio: "${diretorio}", acao: "avancar", respostas: {nivel: "simples"}})\``;
        } else {
            instrucaoEspecifica = [
                `Diagnóstico: fase_atual=${estado.fase_atual}, status=${estado.status}, specialistPhase=${estado.onboarding?.specialistPhase?.status || 'none'}.`,
                ``,
                `Tente uma abordagem diferente:`,
                `- Se precisa de entregável: gere o conteúdo primeiro e passe via \`entregavel\``,
                `- Se travado: use \`maestro({diretorio: "${diretorio}"})\` para ver o status atual`,
            ].join('\n');
        }
        return {
            content: formatError(
                "avancar",
                `Loop detectado: ${MAX_IDENTICAL_CALLS} chamadas idênticas sem progresso.`,
                instrucaoEspecifica
            ),
            isError: true,
        };
    }

    // v8.0 FIX (Bug B): PRIORIZAR aguardando_classificacao ANTES de qualquer check de onboarding
    // Isso evita que o specialist handler seja chamado após o PRD ser aprovado
    if (estado.aguardando_classificacao) {
        return handleClassificacao(args, estado, diretorio);
    }

    // Verificar se está em onboarding
    const inOnboarding = isInOnboarding(estado);
    const onboarding = estado.onboarding;

    if (inOnboarding) {
        // v6.0: Novo fluxo com specialistPhase
        if (onboarding?.specialistPhase) {
            // v8.0 Safety: Se specialistPhase está em 'approved' mas não foi limpo,
            // forçar limpeza e redirecionar para classificação
            if (onboarding.specialistPhase.status === 'approved') {
                delete onboarding.specialistPhase;
                onboarding.phase = 'completed';
                estado.aguardando_classificacao = true;
                const estadoFile = serializarEstado(estado);
                try { await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content); } catch { /* ignore */ }
                return handleClassificacao(args, estado, diretorio);
            }

            // v9.0: Detectar fase de prototipagem (Stitch) e delegar para handler dedicado
            const faseAtualInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
            if (isPrototypePhase(faseAtualInfo?.nome, estado.usar_stitch)) {
                try {
                    const { handlePrototypePhase } = await import("../../handlers/prototype-phase-handler.js");
                    return handlePrototypePhase({
                        estado,
                        diretorio,
                        respostas: args.respostas,
                        entregavel: args.entregavel,
                    });
                } catch (err) {
                    return {
                        content: formatError(
                            "avancar",
                            `Erro ao processar fase de prototipagem: ${err instanceof Error ? err.message : String(err)}`,
                            `Tente novamente com: executar({diretorio: "${diretorio}", acao: "avancar", respostas: {design_system: "...", telas_prioritarias: ["..."]}})`
                        ),
                        isError: true,
                    };
                }
            }

            try {
                const { handleSpecialistPhase } = await import("../../handlers/specialist-phase-handler.js");
                return handleSpecialistPhase({
                    estado,
                    diretorio,
                    respostas: args.respostas,
                    entregavel: args.entregavel,
                });
            } catch (err) {
                // v6.0 (P14): Recovery path claro em caso de erro
                return {
                    content: formatError(
                        "avancar",
                        `Erro ao processar fase do especialista: ${err instanceof Error ? err.message : String(err)}`,
                        `Tente novamente com: executar({diretorio: "${diretorio}", acao: "avancar", respostas: {problema: "...", publico_alvo: "..."}})`
                    ),
                    isError: true,
                };
            }
        }

        // Legacy: Se brainstorm está em progresso
        if (onboarding?.brainstormStatus === "in_progress") {
            const respostasObj = args.respostas || {};
            const respostaSecao = (respostasObj.resposta_secao as string) || "";
            return brainstorm({
                diretorio: args.diretorio,
                estado_json: args.estado_json || "",
                acao: "proximo_secao",
                resposta_secao: respostaSecao,
            } as any);
        }

        // Legacy: Delegar para onboarding orchestrator (discoveryBlocks)
        return onboardingOrchestrator({
            diretorio: args.diretorio,
            estado_json: args.estado_json || "",
            acao: args.acao || "proximo_bloco",
            respostas_bloco: args.respostas,
            respostas: args.respostas,
        } as any);
    }

    // v10.0: Detectar fase de código e aplicar Readiness Gate + code-phase-handler
    const faseAtualInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
    const isCodePhaseDetected = isCodePhaseName(faseAtualInfo?.nome);

    if (isCodePhaseDetected) {
        // v10.0: Readiness Gate — checkpoint consolidado antes de fases de código
        // Verifica se é a PRIMEIRA vez entrando em código (gates_validados não contém fases de código)
        const isFirstCodePhase = !estado.readiness_approved && !estado.gates_validados?.some(g => {
            const fInfo = getFaseComStitch(estado.nivel, g, estado.usar_stitch);
            return isCodePhaseName(fInfo?.nome);
        });

        if (isFirstCodePhase) {
            try {
                const { readinessCheck, formatReadinessResult } = await import("../../gates/readiness-gate.js");
                const readiness = await readinessCheck(estado, diretorio);

                if (readiness.score < 60) {
                    // Bloqueio total — artefatos críticos faltando
                    return {
                        content: [{ type: "text" as const, text: formatReadinessResult(readiness) }],
                        isError: true,
                    };
                }

                if (readiness.score < 80) {
                    // Aprovação manual necessária
                    // Verificar se usuário está aprovando manualmente via respostas
                    const isManualApproval = args.respostas?.approve_readiness === true ||
                        args.respostas?.approve_readiness === 'true';

                    if (!isManualApproval) {
                        estado.readiness_score = readiness.score;
                        const estadoFile = serializarEstado(estado);
                        try { await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content); } catch { /* ignore */ }

                        return {
                            content: [{ type: "text" as const, text: formatReadinessResult(readiness) }],
                        };
                    }
                }

                // Score >= 80 ou aprovação manual: marcar como aprovado
                estado.readiness_approved = true;
                estado.readiness_score = readiness.score;
                console.error(`[avancar] v10.0: Readiness Gate aprovado (score: ${readiness.score})`);
            } catch (err) {
                // Best-effort — não bloqueia o fluxo se readiness gate falhar
                console.warn('[avancar] v10.0: Readiness Gate falhou (non-blocking):', err);
            }
        }

        try {
            const { handleCodePhase } = await import("../../handlers/code-phase-handler.js");
            return handleCodePhase({
                estado,
                diretorio,
                respostas: args.respostas,
                entregavel: args.entregavel,
            });
        } catch (err) {
            // Fallback: se code-phase-handler falhar, delegar para proximo.ts
            console.warn('[avancar] v8.0: Fallback para proximo.ts —', err);
        }
    }

    // v10.0: Fases de DOCUMENTO — tentar specialist handler com PhaseConfig
    // Se a skill tem collectFields, usa coleta conversacional dinâmica.
    // Senão, fallback para proximo.ts (comportamento v9).
    if (faseAtualInfo && !isCodePhaseDetected) {
        try {
            const { loadPhaseConfig } = await import("../../services/phase-config-loader.js");
            const configResult = await loadPhaseConfig(diretorio, faseAtualInfo, estado.ide);

            // Se PhaseConfig carregou com collectFields, usar specialist handler
            if (configResult.loaded && configResult.config.collectFields.length > 0) {
                // Inicializar specialistPhase se não existir para esta fase
                if (!estado.onboarding) {
                    const { criarEstadoOnboardingComEspecialista } = await import("../../services/onboarding.service.js");
                    estado.onboarding = criarEstadoOnboardingComEspecialista(
                        estado.projeto_id,
                        estado.config?.mode || 'balanced',
                        configResult.config.skillName
                    );
                } else if (!estado.onboarding.specialistPhase || estado.onboarding.specialistPhase.skillName !== configResult.config.skillName) {
                    // Fase mudou — criar novo specialistPhase para a fase atual
                    estado.onboarding.specialistPhase = {
                        skillName: configResult.config.skillName,
                        status: 'active',
                        collectedData: {},
                        interactionCount: 0,
                        activatedAt: new Date().toISOString(),
                    };
                    estado.onboarding.phase = 'specialist_active';
                }

                const { handleSpecialistPhase } = await import("../../handlers/specialist-phase-handler.js");
                return handleSpecialistPhase({
                    estado,
                    diretorio,
                    respostas: args.respostas,
                    entregavel: args.entregavel,
                    phaseConfig: configResult.config,
                });
            }
        } catch (err) {
            console.warn('[avancar] v10.0: PhaseConfig/specialist handler falhou, fallback para proximo.ts:', err);
        }
    }

    // Fallback: delegar para proximo.ts (comportamento v9)
    const estadoJson = args.estado_json || serializarEstado(estado).content;

    return proximo({
        diretorio: args.diretorio,
        estado_json: estadoJson,
        entregavel: args.entregavel,
        resumo_json: args.resumo_json,
        nome_arquivo: args.nome_arquivo,
        auto_flow: args.auto_flow,
    });
}

/**
 * v8.0: Handler de classificação inline.
 * Processa respostas.nivel para confirmar classificação sem precisar de entregável.
 * Evita o loop approved→specialist→approved.
 */
async function handleClassificacao(
    args: AvancarArgs,
    estado: EstadoProjeto,
    diretorio: string,
): Promise<ToolResult> {
    const respostas = args.respostas || {};
    const nivelConfirmado = respostas.nivel as string | undefined;

    // Se não tem nivel nas respostas, mostrar prompt de confirmação
    if (!nivelConfirmado) {
        const sugestao = estado.classificacao_sugerida;
        const inferencia = (estado as any).inferencia_contextual;
        const perguntas = inferencia?.perguntas_prioritarias || [];
        const perguntasMarkdown = perguntas.length
            ? perguntas.map((p: any) => `- (${p.prioridade}) ${p.pergunta}${p.valor_inferido ? `\n  - Inferido: ${p.valor_inferido} (confiança ${((p.confianca_inferencia ?? 0) * 100).toFixed(0)}%)` : ""}`).join("\n")
            : "- Informe domínio, stack preferida e integrações em um único prompt.";

        return {
            content: formatResponse({
                titulo: "🔍 Confirmação de Classificação Necessária",
                resumo: `Classificação sugerida: ${sugestao?.nivel?.toUpperCase() || 'MEDIO'}. Confirme para avançar.`,
                dados: sugestao ? {
                    "Nível sugerido": sugestao.nivel.toUpperCase(),
                    "Pontuação": String(sugestao.pontuacao),
                    "Critérios": sugestao.criterios?.join(', ') || '-',
                } : {
                    "Status": "Aguardando confirmação de classificação",
                },
                instrucoes: `## Ação obrigatória (responder em UM ÚNICO PROMPT)
Confirme ou ajuste a classificação usando:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "respostas": {
    "nivel": "${sugestao?.nivel || 'medio'}"
  }
})
\`\`\`

Responda também às perguntas abaixo no MESMO prompt:
${perguntasMarkdown}

> ⚠️ Não prossiga para outras fases antes de confirmar a classificação.`,
                proximo_passo: {
                    tool: "executar",
                    descricao: "Confirmar classificação do projeto",
                    args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": { "nivel": "${sugestao?.nivel || 'medio'}" } }`,
                    requer_input_usuario: true,
                    prompt_usuario: "Confirme a classificação sugerida ou ajuste o nível (simples/medio/complexo).",
                },
            }),
        };
    }

    // Confirmar classificação
    const validNiveis = ['simples', 'medio', 'complexo'];
    const nivel = validNiveis.includes(nivelConfirmado.toLowerCase())
        ? nivelConfirmado.toLowerCase() as NivelComplexidade
        : (estado.classificacao_sugerida?.nivel || 'medio' as NivelComplexidade);

    const novoTipo = estado.tipo_artefato || 'product';
    const novoTier = determinarTierGate(novoTipo, nivel);
    const fluxo = getFluxoComStitch(nivel, estado.usar_stitch);

    // Atualizar estado
    estado.nivel = nivel;
    estado.tipo_artefato = novoTipo;
    estado.tier_gate = novoTier;
    estado.total_fases = fluxo.total_fases;
    estado.aguardando_classificacao = false;
    estado.classificacao_pos_prd_confirmada = true;
    estado.classificacao_sugerida = undefined;

    // Persistir estado
    const estadoFile = serializarEstado(estado);
    try {
        await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
        console.error('[avancar] Erro ao salvar estado:', err);
    }

    const proximaFase = getFaseComStitch(nivel, estado.fase_atual, estado.usar_stitch);
    const specialist = proximaFase ? getSpecialistPersona(proximaFase.nome) : null;

    return {
        content: formatResponse({
            titulo: "✅ Classificação Confirmada!",
            resumo: `Projeto classificado como ${nivel.toUpperCase()}. ${estado.total_fases} fases no fluxo.`,
            dados: {
                "Nível": nivel.toUpperCase(),
                "Tipo": novoTipo,
                "Tier": novoTier.toUpperCase(),
                "Total Fases": String(estado.total_fases),
            },
            instrucoes: `Classificação confirmada! Agora trabalhe com o especialista para gerar o entregável da fase atual.

> ${descreverTier(novoTier)}

## 📍 Próxima Fase: ${proximaFase?.nome || 'Fase ' + estado.fase_atual}
- **Especialista:** ${proximaFase?.especialista || '-'}
- **Entregável:** ${proximaFase?.entregavel_esperado || '-'}

## Gate de Saída
${proximaFase?.gate_checklist?.map((item: string) => `- [ ] ${item}`).join('\n') || 'Nenhum'}

🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Comece a trabalhar com o especialista **${proximaFase?.especialista || 'da fase'}** para gerar o entregável.
Quando pronto, avance com:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "entregavel": "conteúdo do entregável..."
})
\`\`\``,
            proximo_passo: {
                tool: "executar",
                descricao: `Gerar entregável da fase ${estado.fase_atual} e avançar`,
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "entregavel": "conteúdo do entregável..." }`,
                requer_input_usuario: true,
                prompt_usuario: `Trabalhe com o especialista ${proximaFase?.especialista || 'da fase'} para gerar: ${proximaFase?.entregavel_esperado || 'entregável da fase'}`,
            },
        }),
        next_action: {
            tool: "executar",
            description: `Gerar entregável da fase ${estado.fase_atual} (${proximaFase?.nome || 'próxima'})`,
            args_template: { diretorio, acao: "avancar", entregavel: "{{conteudo_do_entregavel}}" },
            requires_user_input: true,
            user_prompt: `Trabalhe com o especialista ${proximaFase?.especialista || 'da fase'} para gerar: ${proximaFase?.entregavel_esperado || 'entregável'}`,
        },
        specialist_persona: specialist || undefined,
        progress: {
            current_phase: proximaFase?.nome || `Fase ${estado.fase_atual}`,
            total_phases: estado.total_fases,
            completed_phases: estado.gates_validados?.length || 0,
            percentage: Math.round(((estado.gates_validados?.length || 0) / estado.total_fases) * 100),
        },
    };
}

export const avancarSchema = {
    type: "object",
    properties: {
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
        estado_json: {
            type: "string",
            description: "Estado do projeto (opcional — carrega automaticamente)",
        },
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável (obrigatório para fase de desenvolvimento)",
        },
        respostas: {
            type: "object",
            description: "Respostas de formulário para onboarding/brainstorm",
        },
        resumo_json: {
            type: "string",
            description: "Resumo do projeto (opcional)",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo para salvar (opcional)",
        },
        auto_flow: {
            type: "boolean",
            description: "Modo automático: pula confirmações e avança automaticamente (padrão: false)",
        },
        acao: {
            type: "string",
            description: "Ação específica (ex: 'proximo_bloco', 'proximo_secao')",
        },
    },
    required: ["diretorio"],
};
