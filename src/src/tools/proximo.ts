import { join, resolve } from "path";
import { existsSync, readdirSync } from "fs";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { getFase, getFluxo, getFaseComStitch, getFluxoComStitch, isCodePhaseName, PHASE_TYPE_MAP } from "../flows/types.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js"; // @deprecated v6.0 - usar ClassificacaoProgressivaService
import { validarGate, formatarResultadoGate, validarGateComTemplate } from "../gates/validator.js";
import { setCurrentDirectory } from "../state/context.js";
import { parsearResumo, serializarResumo, criarResumoInicial, extrairResumoEntregavel } from "../state/memory.js";
import { gerarInstrucaoProximaFase, gerarInstrucaoCorrecao, gerarInstrucaoContinuidade } from "../utils/instructions.js";
import type { EntregavelResumo, ProjectSummary } from "../types/memory.js";
import { logEvent, EventTypes } from "../utils/history.js";
import { getSpecialistPersona } from "../services/specialist.service.js";
import { gerarSystemMd } from "../utils/system-md.js";
import { gerarSecaoPrompts, getSkillParaFase, getSkillPath, getSkillResourcePath } from "../utils/prompt-mapper.js";
import { validarEstrutura } from "../gates/estrutura.js";
import { normalizeProjectPath, resolveProjectPath, joinProjectPath, getServerContentRoot } from "../utils/files.js";
import { formatSkillMessage, formatSkillHydrationCommand, formatMention, detectIDE, getSkillResourcePath as getIDESkillResourcePath } from "../utils/ide-paths.js";
import { inferirContextoBalanceado } from "../utils/inferencia-contextual.js";
import { verificarSkillCarregada } from "../utils/content-injector.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { saveFile, saveMultipleFiles, formatSavedFilesConfirmation } from "../utils/persistence.js";
import { classificacaoProgressiva } from "../services/classificacao-progressiva.service.js"; // v6.0
import { getSpecialistQuestions } from "../handlers/specialist-phase-handler.js"; // v7.0
import { resolverPathEntregavel, listarPathsEsperados, getFaseDirName } from "../utils/entregavel-path.js"; // v5.5.0
import { readFile } from "fs/promises";
import { isPrototypePhase } from "../handlers/prototype-phase-handler.js"; // v9.0
// v6.3 S5.1: Autonomia calibrada
import { DecisionEngine } from "../core/decision/DecisionEngine.js";
// V6 Sprint 4+5: Gate orientation e watcher de entregáveis
import { generateGateOrientationDoc } from "../utils/gate-orientation.js";
import { startFileWatcher, stopFileWatcher } from "../services/watcher.service.js";
import { RiskEvaluator } from "../core/risk/RiskEvaluator.js";
import type { RiskLevel as DecisionRiskLevel } from "../core/decision/types.js";
// v6.5: Sprint 3 — Code Generation
import { decomposeArchitectureToTasks, getTaskProgress } from "../services/task-decomposer.service.js";
import { calcularScoreContextual } from "../services/scoring-config.js";
import { expandKeywordsWithSynonyms } from "../utils/gate-synonyms.js";
import { validateDeliverableForGate } from "../services/deliverable-gate.service.js";


interface ProximoArgs {
    entregavel?: string;  // v5.5.0: Opcional - sistema lê do disco automaticamente
    estado_json: string;         // Estado atual do projeto (obrigatório)
    resumo_json?: string;        // Resumo atual (opcional, cria novo se não informado)
    nome_arquivo?: string;
    diretorio: string;           // Diretório do projeto (obrigatório)
    auto_flow?: boolean;         // Modo fluxo automático: auto-confirma classificação e avança sem bloqueios
    skip_validation?: boolean;   // v10.0: Pular validação textual quando code-validator já aprovou
}

/**
 * v7.2 FIX C: Gera menções de arquivo para entregáveis anteriores + gate orientation.
 * Em vez de injetar conteúdo inline (gasto de tokens), gera menções nativas da IDE
 * (#path no Windsurf) para que a IA LEIA os arquivos sob demanda.
 */
function formatarContextoComoMencoes(
    estado: EstadoProjeto,
    diretorio: string,
    ide: string,
    gateOrientationDirName?: string
): string {
    const entregaveis = estado.entregaveis || {};
    const keys = Object.keys(entregaveis);
    if (keys.length === 0 && !gateOrientationDirName) return '';

    const linhas: string[] = [];
    linhas.push(`## 📋 Contexto do Projeto — Leia os Entregáveis Anteriores`);
    linhas.push('');
    linhas.push(`> ⚠️ Leia os documentos abaixo para entender decisões já tomadas. **NÃO contradiga** o que foi definido.`);
    linhas.push('');

    // Menções para entregáveis anteriores (paths relativos ao projeto)
    let idx = 1;
    for (const key of keys) {
        const absPath = entregaveis[key];
        // Converter path absoluto para relativo ao projeto
        const relPath = absPath
            .replace(diretorio.replace(/\\/g, '/'), '')
            .replace(diretorio, '')
            .replace(/^[\\/]+/, '');
        linhas.push(`> ${idx}. ${formatMention(relPath.replace(/\\/g, '/'), ide as any)}`);
        idx++;
    }

    // Menção para .orientacoes-gate.md da próxima fase
    if (gateOrientationDirName) {
        linhas.push(`> ${idx}. ${formatMention(`docs/${gateOrientationDirName}/.orientacoes-gate.md`, ide as any)}`);
    }

    linhas.push('');
    return linhas.join('\n');
}

/**
 * v6.3 S5.2-S5.3: Avalia autonomia para o avanço de fase usando RiskEvaluator + DecisionEngine.
 * Retorna null se pode prosseguir, ou ToolResult de bloqueio se requer aprovação humana.
 */
async function avaliarAutonomia(
    estado: EstadoProjeto,
    nomeFase: string,
    diretorio: string,
    autoFlow: boolean
): Promise<null | ToolResult> {
    if (autoFlow) return null; // Modo automático: sempre passa direto

    try {
        const riskEvaluator = new RiskEvaluator(diretorio);
        const decisionEngine = new DecisionEngine();

        // Avaliar risco do avanço de fase
        const riskInfo = await riskEvaluator.evaluate(`advance-phase-${nomeFase}`, {
            filesAffected: 1,
            hasTests: estado.gates_validados.length > 0,
        });

        // Mapear nível do RiskEvaluator para DecisionEngine
        const riskMap: Record<string, DecisionRiskLevel> = {
            SAFE: 'baixo', LOW: 'baixo', MEDIUM: 'medio', HIGH: 'alto', DANGEROUS: 'critico',
        };
        const decisionRisk: DecisionRiskLevel = riskMap[riskInfo.level] ?? 'medio';

        const decision = await decisionEngine.evaluate({
            operation: `advance-phase-${nomeFase}`,
            riskLevel: decisionRisk,
            context: {
                fase: estado.fase_atual,
                hasHistoricalMatch: estado.gates_validados.length > 0,
                matchesKnownPattern: true,
                isNovelOperation: estado.fase_atual === 1,
                hasFullContext: !!nomeFase,
            },
        });

        // v6.3 S5.4: Só bloqueia em risco crítico / human_only
        if (decision.action === 'human_only') {
            return {
                content: [{
                    type: "text" as const,
                    text: `# ✋ Aprovação Necessária — Autonomia Calibrada (v6.3)

O sistema avaliou que esta operação requer aprovação explícita do usuário.

| Fator | Valor |
|-------|-------|
| **Fase** | ${estado.fase_atual} — ${nomeFase} |
| **Risco** | ${riskInfo.level} (score: ${riskInfo.score}) |
| **Confiança da IA** | ${Math.round(decision.confidence * 100)}% |

## Fatores de Risco Detectados
${riskInfo.factors.map(f => `- **${f.name}** (peso: ${f.weight}) — ${f.description}`).join('\n')}

## Raciocínio
\`\`\`
${decision.reasoning}
\`\`\`

> 🔐 Para prosseguir, confirme: **"Confirmo o avanço da fase ${estado.fase_atual}"**
> Ou use \`auto_flow: true\` para modo automático sem checagens de risco.
`,
                }],
            };
        }

        // Para outros níveis, apenas loga (não bloqueia)
        console.error(`[Autonomia v6.3] fase=${estado.fase_atual} nome=${nomeFase} confianca=${Math.round(decision.confidence * 100)}% risco=${riskInfo.level} acao=${decision.action}`);

    } catch (err) {
        // Best-effort — nunca bloqueia o fluxo
        console.warn('[Autonomia v6.3] Falha na avaliação (non-blocking):', err);
    }

    return null;
}

/**
 * Calcula score de qualidade usando pesos contextuais por tipo de fase (v6.5).
 * Fases de código têm threshold e pesos diferentes de fases de documento.
 */
function calcularQualityScore(
    estruturaResult: ReturnType<typeof validarEstrutura>,
    gateResult: ReturnType<typeof validarGate>,
    faseName: string = 'documento'
): { score: number; approved: boolean } {
    const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
    const checklistScore = totalChecklist > 0
        ? (gateResult.itens_validados.length / totalChecklist) * 100
        : 100;

    const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

    return calcularScoreContextual(
        estruturaResult.score,
        checklistScore,
        tamanhoScore,
        faseName
    );
}


/**
 * Tool: proximo
 * Salva entregável e avança para próxima fase (modo stateless)
 * Retorna arquivos para a IA salvar
 */
export async function proximo(args: ProximoArgs): Promise<ToolResult> {
    // Validar parâmetros obrigatórios
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Erro: Estado Obrigatório

O parâmetro \`estado_json\` é obrigatório no modo stateless.

**Uso correto:**
1. IA lê \`.maestro/estado.json\` do projeto
2. Passa o conteúdo como parâmetro

\`\`\`
proximo(
    entregavel: "conteúdo do PRD...",
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`
`,
            }],
            isError: true,
        };
    }

    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    // Verifica se há conteúdo local disponível (via npx)
    const avisoContentLocal = ""; // Sem aviso crítico, funciona via npx

    // Obter fase atual para mensagens de erro
    const faseAtualInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);

    // v9.0: Fase de prototipagem — entregável é prototipos.md + verificação de HTML na pasta
    const isProtoPhase = isPrototypePhase(faseAtualInfo?.nome, estado.usar_stitch);

    // v6.6 FIX #4: SEMPRE tentar ler do disco primeiro, mesmo quando entregável é passado como argumento.
    // Antes, se a IA passava conteúdo como argumento (>100 chars), o disco era ignorado.
    // Isso causava: 1) Gasto de tokens (15K+ chars na chamada), 2) Inconsistência disco vs argumento.
    // Agora: disco tem prioridade. Argumento é fallback.
    let entregavel = args.entregavel;
    let entregavelLidoDoDisco = false;
    let caminhoResolvido: string | null = null;

    const TAMANHO_MINIMO_CONTEUDO_REAL = 100;

    // Sempre tentar ler do disco primeiro (independente do argumento)
    {
        if (faseAtualInfo) {
            // v9.0: Para fase de prototipagem, tentar ler prototipos/prototipos.md
            if (isProtoPhase) {
                const protoSummaryPath = join(diretorio, 'prototipos', 'prototipos.md');
                if (existsSync(protoSummaryPath)) {
                    try {
                        entregavel = await readFile(protoSummaryPath, 'utf-8');
                        entregavelLidoDoDisco = true;
                        caminhoResolvido = protoSummaryPath;
                    } catch { /* ignore */ }
                }
            }

            // v6.6 FIX #4: SEMPRE tentar resolver o path do disco, mesmo se args.entregavel existe.
            // Disco tem prioridade sobre argumento para: (a) economizar tokens, (b) evitar inconsistência.
            // Se o arquivo no disco existir e tiver conteúdo válido, usamos ele.
            // Se não existir, caímos de volta para args.entregavel.
            if (!entregavelLidoDoDisco) {
                const pathDoDisco = resolverPathEntregavel(
                    diretorio,
                    estado.fase_atual,
                    faseAtualInfo,
                    estado
                );

                if (pathDoDisco) {
                    try {
                        const conteudoDisco = await readFile(pathDoDisco, 'utf-8');
                        if (conteudoDisco && conteudoDisco.trim().length >= TAMANHO_MINIMO_CONTEUDO_REAL) {
                            entregavel = conteudoDisco;
                            entregavelLidoDoDisco = true;
                            caminhoResolvido = pathDoDisco;
                            console.error(`[proximo] v6.6 FIX #4: Entregável lido do disco (${conteudoDisco.length} chars): ${pathDoDisco}`);
                        }
                    } catch (err) {
                        // Arquivo não encontrado ou erro de leitura — usar args.entregavel como fallback
                    }
                }
            }
        }
    }

    // v9.0: Para fase de prototipagem, verificar se há HTML na pasta prototipos/
    if (isProtoPhase) {
        const protoDir = join(diretorio, 'prototipos');
        let htmlFiles: string[] = [];
        if (existsSync(protoDir)) {
            try {
                const allFiles = readdirSync(protoDir, { recursive: true }) as string[];
                htmlFiles = allFiles.filter(f => {
                    const ext = String(f).toLowerCase();
                    return ext.endsWith('.html') || ext.endsWith('.htm');
                }).map(String);
            } catch { /* ignore */ }
        }

        if (htmlFiles.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `# ❌ Protótipos HTML Não Encontrados

A fase de Prototipagem requer que os arquivos HTML exportados do Google Stitch estejam na pasta \`prototipos/\`.

## 📁 Pasta verificada
\`${protoDir}\`

## ⚡ AÇÃO OBRIGATÓRIA

1. Acesse **stitch.withgoogle.com**
2. Use os prompts de \`prototipos/stitch-prompts.md\`
3. Exporte os protótipos como HTML
4. Coloque os arquivos \`.html\` na pasta \`prototipos/\`
5. Depois execute: \`executar({acao: "avancar"})\`

> ⛔ A fase **só será concluída** quando os arquivos HTML estiverem na pasta.
`,
                }],
                isError: true,
                next_action: {
                    tool: "executar",
                    description: "Aguardar o usuário exportar os arquivos HTML do Google Stitch",
                    args_template: { diretorio, acao: "avancar" },
                    requires_user_input: true,
                    user_prompt: "Por favor, gere os protótipos no stitch.withgoogle.com e salve os arquivos .html. Me avise quando terminar para eu validar!",
                    auto_execute: false
                }
            };
        }

        // Se tem HTML mas não tem entregável markdown, gerar um resumo automático
        if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_CONTEUDO_REAL) {
            entregavel = `# Protótipos — Fase de Prototipagem\n\n## Arquivos HTML\n\n${htmlFiles.map(f => `- \`${f}\``).join('\n')}\n\n## Total: ${htmlFiles.length} protótipo(s)\n`;
            entregavelLidoDoDisco = false;
            caminhoResolvido = null;
        }
    }

    // Se ainda não tem entregável válido, retornar erro
    const TAMANHO_MINIMO_ENTREGAVEL = 200;
    if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_ENTREGAVEL) {
        // Obter skill e IDE para instruções corretas
        const ideDetectada = detectIDE(diretorio) || 'windsurf';
        const skillNome = faseAtualInfo ? getSkillParaFase(faseAtualInfo.nome) : null;

        let instrucoesSkill = "";
        if (skillNome) {
            const skillPath = getIDESkillResourcePath(skillNome, 'reference', ideDetectada);
            const templatesPath = getIDESkillResourcePath(skillNome, 'templates', ideDetectada);
            instrucoesSkill = `
### 📚 Recursos da Skill

Abra os seguintes arquivos no seu IDE:

1. **SKILL.md** (instruções do especialista):
   \`${getIDESkillResourcePath(skillNome, 'reference', ideDetectada)}SKILL.md\`

2. **Templates** (estrutura do entregável):
   \`${templatesPath}\`

3. **Checklists** (validação):
   \`${getIDESkillResourcePath(skillNome, 'checklists', ideDetectada)}\`
`;
        }

        // Listar paths esperados para ajudar o usuário
        const pathsEsperados = faseAtualInfo
            ? listarPathsEsperados(diretorio, estado.fase_atual, faseAtualInfo)
            : [];

        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Não Encontrado

O sistema não encontrou o entregável da fase atual.

| Métrica | Valor |
|---------|-------|
| **Fase** | ${estado.fase_atual} - ${faseAtualInfo?.nome || 'N/A'} |
| **Entregável esperado** | ${faseAtualInfo?.entregavel_esperado || 'N/A'} |
| **Tamanho recebido** | ${args.entregavel?.trim().length || 0} caracteres |
| **Tamanho mínimo** | ${TAMANHO_MINIMO_ENTREGAVEL} caracteres |

---

## 📁 Paths Verificados

O sistema tentou ler o entregável dos seguintes locais:

${pathsEsperados.map((p, i) => `${i + 1}. \`${p}\``).join('\n')}

> ⚠️ **Nenhum arquivo encontrado** em nenhum dos paths acima.

---

## ⚡ AÇÃO OBRIGATÓRIA

Você **DEVE** desenvolver o entregável corretamente:
${instrucoesSkill}

### Fluxo Obrigatório

1. Leia a **SKILL.md** → Siga as instruções e perguntas do especialista
2. Consulte os **Templates** → Use como base estrutural
3. Faça perguntas ao usuário → Conforme indicado na SKILL
4. Gere o entregável → Seguindo TODAS as seções do template
5. **Salve o arquivo** → Em um dos paths listados acima
6. Valide com o **Checklist** → Antes de avançar
7. Apresente ao usuário → Para aprovação
8. Só então chame \`proximo()\` → Sistema lerá automaticamente do disco

> ⛔ **NÃO TENTE AVANÇAR** com entregáveis vazios ou incompletos!
`,
            }],
            isError: true,
        };
    }

    // v7.1 FIX 6: Deprecation warning quando entregável veio do argumento (não do disco)
    // Incentiva a IA a salvar no disco primeiro e chamar executar({acao: "avancar"})
    let deprecationWarning = '';
    if (!entregavelLidoDoDisco && entregavel && entregavel.trim().length > 500) {
        console.warn(`[proximo] v7.1 DEPRECATION: entregável passado como argumento (${entregavel.length} chars). Salve no disco primeiro.`);
        deprecationWarning = `> ⚠️ **AVISO:** O entregável foi recebido via argumento (${entregavel.length} chars), não do disco.\n> Para melhor performance, **salve o arquivo no disco primeiro** e depois chame \`executar({ acao: "avancar" })\`.\n> O sistema lê automaticamente do path canônico: \`docs/fase-XX-nome/entregavel\`\n\n`;
    }

    // v5.5.0: Após validação, entregavel é garantidamente string não-vazia
    // TypeScript assertion para evitar erros de tipo
    const entregavelValidado: string = entregavel!;

    // v6.3 S5.3: Avaliação de autonomia — RiskEvaluator + DecisionEngine
    const autonomiaBlock = await avaliarAutonomia(
        estado,
        faseAtualInfo?.nome ?? `Fase ${estado.fase_atual}`,
        diretorio,
        args.auto_flow ?? false
    );
    if (autonomiaBlock) return autonomiaBlock;

    // Verificar se há bloqueio de aprovação pendente (Gate)
    // v6.6 FIX #1: Se um novo entregável foi fornecido (argumento ou disco), RESETAR o bloqueio
    // e re-validar. Antes deste fix, o sistema retornava imediatamente sem re-avaliar,
    // fazendo o score ficar fixo mesmo com conteúdo melhorado.
    if (estado.aguardando_aprovacao) {
        const temNovoEntregavel = entregavelValidado && entregavelValidado.trim().length >= TAMANHO_MINIMO_ENTREGAVEL;

        if (temNovoEntregavel) {
            // Resetar flags de bloqueio — permitir re-validação com o novo conteúdo
            const scoreAnterior = estado.score_bloqueado;
            estado.aguardando_aprovacao = false;
            estado.em_estado_compulsorio = false;
            estado.motivo_bloqueio = undefined;
            // Manter score_bloqueado para calcular delta depois
            console.error(`[proximo] v6.6 FIX #1: Re-validando entregável (score anterior: ${scoreAnterior}). Flag aguardando_aprovacao resetado.`);
            // Continua para o fluxo de validação abaixo ↓
        } else {
            // Sem novo entregável — manter bloqueio e mostrar instruções
            const ideParaInstrucao = detectIDE(diretorio) || 'windsurf';
            const instrucaoCorrecao = faseAtualInfo
                ? gerarInstrucaoCorrecao(
                    faseAtualInfo.nome,
                    estado.score_bloqueado || 0,
                    (estado as any).itens_aprovados_bloqueio || [],
                    (estado as any).itens_pendentes_bloqueio || [],
                    [],
                    [],
                    ideParaInstrucao,
                    diretorio,
                    true  // requiresUserDecision: score 50-69, aguarda usuário
                )
                : "";

            return {
                content: [{
                    type: "text",
                    text: `# ⛔ Projeto Aguardando Aprovação

O projeto está bloqueado aguardando aprovação do usuário.

| Campo | Valor |
|-------|-------|
| **Motivo** | ${estado.motivo_bloqueio || "Score abaixo do ideal"} |
| **Score** | ${estado.score_bloqueado}/100 |

${instrucaoCorrecao}

## 🔐 Ação Necessária

O **usuário humano** deve decidir:

- **Para aprovar e avançar**: Diga "aprovar o gate"
- **Para corrigir primeiro**: Edite o arquivo no disco e re-submeta com \`executar({ acao: "avancar" })\`

> ⚠️ A IA NÃO pode aprovar automaticamente. Aguarde a decisão do usuário.
> 💡 Se o entregável foi melhorado, salve no disco e chame \`executar\` novamente — o sistema irá re-avaliar.
`,
                }],
            };
        }
    }

    // Fluxo PRD-first: se ainda aguardando PRD, analisar e AUTO-CONFIRMAR se auto_flow
    if (estado.status === "aguardando_prd" && estado.fase_atual === 1) {
        const analise = classificarPRD(entregavelValidado);
        estado.classificacao_sugerida = analise;
        estado.status = "ativo";

        // AUTO-FLOW: confirma automaticamente a classificação e continua
        if (args.auto_flow) {
            estado.nivel = analise.nivel;
            estado.aguardando_classificacao = false;
            estado.classificacao_pos_prd_confirmada = true;
            estado.total_fases = getFluxoComStitch(analise.nivel, estado.usar_stitch).total_fases;
            // Continua o fluxo normal abaixo (não retorna aqui)
        } else {
            estado.aguardando_classificacao = true;
            estado.classificacao_pos_prd_confirmada = false;

            // Inferência balanceada (não assume críticos) + perguntas agrupadas
            estado.inferencia_contextual = inferirContextoBalanceado(`${estado.nome} ${entregavelValidado}`);

            const estadoFile = serializarEstado(estado);

            const perguntas = estado.inferencia_contextual?.perguntas_prioritarias || [];
            const perguntasMarkdown = perguntas.length
                ? perguntas.map((p) => `- (${p.prioridade}) ${p.pergunta}${p.valor_inferido ? `
  - Inferido: ${p.valor_inferido} (confiança ${((p.confianca_inferencia ?? 0) * 100).toFixed(0)}%)` : ""}`).join("\n")
                : "- Informe domínio, stack preferida e integrações em um único prompt.";

            return {
                content: [{
                    type: "text",
                    text: `# 🔍 PRD Analisado (PRD-first)

| Campo | Valor |
|-------|-------|
| Nível sugerido | ${analise.nivel.toUpperCase()} |
| Pontuação | ${analise.pontuacao} |
| Critérios | ${analise.criterios.join(", ")} |

## Ação obrigatória (responder em UM ÚNICO PROMPT)
Confirme ou ajuste a classificação usando:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "respostas": {
    "nivel": "${analise.nivel}"
  }
})
\`\`\`

Responda também às perguntas abaixo no MESMO prompt:
${perguntasMarkdown}

> ⚠️ Não prossiga para outras fases antes de confirmar a classificação.
`,
                }],
                estado_atualizado: estadoFile.content,
            };
        }
    }

    // Verificar se há bloqueio de confirmação de classificação (Pós-PRD)
    // AUTO-FLOW: auto-confirma e continua sem bloquear
    if (estado.aguardando_classificacao) {
        if (args.auto_flow && estado.classificacao_sugerida) {
            // Auto-confirmar classificação
            estado.nivel = estado.classificacao_sugerida.nivel;
            estado.aguardando_classificacao = false;
            estado.classificacao_pos_prd_confirmada = true;
            estado.total_fases = getFluxoComStitch(estado.classificacao_sugerida.nivel, estado.usar_stitch).total_fases;
            estado.classificacao_sugerida = undefined;
            // Continua o fluxo normal (não retorna)
        } else {
            let msgSugestao = "";
            if (estado.classificacao_sugerida) {
                msgSugestao = `
## Sugestão da IA
| Campo | Valor |
|-------|-------|
| **Nível** | ${estado.classificacao_sugerida.nivel.toUpperCase()} |
| **Pontuação** | ${estado.classificacao_sugerida.pontuacao} |
`;
            }

            return {
                content: [{
                    type: "text",
                    text: `# ⛔ Confirmação de Classificação Necessária

Antes de prosseguir, você precisa confirmar a classificação do projeto.

${msgSugestao}

## 🔐 Ação Necessária (responder em UM ÚNICO PROMPT)

Confirme ou ajuste a classificação:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "respostas": {
    "nivel": "<simples|medio|complexo>"
  }
})
\`\`\`

Inclua no MESMO prompt qualquer ajuste de domínio/stack ou integrações críticas.

> ⚠️ **IMPORTANTE**: Confirme a classificação antes de continuar.
`,
                }],
            };
        }
    }

    const faseAtual = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
    if (!faseAtual) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Fase ${estado.fase_atual} não encontrada no fluxo ${estado.nivel}.`,
            }],
            isError: true,
        };
    }

    // v6.0 Sprint 5: Enforcement de skill + template + checklist antes de avançar
    // Verificação obrigatória em TODOS os modos (incluindo auto_flow)
    const ideDetectada = detectIDE(diretorio) || 'windsurf';
    const skillObrigatoria = getSkillParaFase(faseAtual.nome);
    if (skillObrigatoria) {
        const skillOk = await verificarSkillCarregada(diretorio, skillObrigatoria, ideDetectada).catch(() => false);
        if (!skillOk) {
            return {
                content: [{
                    type: "text",
                    text: `# ⛔ Skill Obrigatória Não Carregada

Fase: **${faseAtual.nome}**
Skill necessária: \`${skillObrigatoria}\`

Carregue e leia a skill antes de gerar o entregável:
1) Ler SKILL: \`${getIDESkillResourcePath(skillObrigatoria, 'reference', ideDetectada)}SKILL.md\`
2) Templates: \`${getIDESkillResourcePath(skillObrigatoria, 'templates', ideDetectada)}\`
3) Checklist: \`${getIDESkillResourcePath(skillObrigatoria, 'checklists', ideDetectada)}\`

> Gere o entregável seguindo o template e valide com o checklist antes de chamar \`proximo\`.`,
                }],
                isError: true,
            };
        }
    }

    // v10.0: skip_validation — quando code-validator já aprovou, pular validação textual
    // Isso evita a delegação duplicada: code-validator (artefatos) → proximo (keywords)
    let qualityScore: number;
    let gateResultado: { valido: boolean; itens_validados: string[]; itens_pendentes: string[]; sugestoes: string[] };
    let estruturaResult: { score: number; tamanho_ok: boolean; secoes_faltando: string[] };

    if (args.skip_validation) {
        console.error(`[proximo] v10.0: skip_validation=true — code-validator já aprovou, pulando validateDeliverable`);
        qualityScore = 100;
        gateResultado = { valido: true, itens_validados: faseAtual.gate_checklist || [], itens_pendentes: [], sugestoes: [] };
        estruturaResult = { score: 100, tamanho_ok: true, secoes_faltando: [] };
    } else {
        // v9.0: Validação de gate delegada ao deliverable-gate.service.ts
        const tier = estado.tier_gate || "base";
        console.error(`[proximo] Iniciando validateDeliverable (fase: ${faseAtual.nome}, tier: ${tier})`);

        try {
            const validation = await validateDeliverableForGate({
                entregavel: entregavelValidado,
                faseNome: faseAtual.nome,
                tier,
                gateChecklist: faseAtual.gate_checklist || [],
            });
            qualityScore = validation.qualityScore;
            gateResultado = validation.gateResultado;
            estruturaResult = validation.estruturaResult;
        } catch (error) {
            console.error('[proximo] Erro ao executar validateDeliverable:', error);
            return {
                content: [{
                    type: "text",
                    text: `# ❌ Erro na Validação do Entregável

Ocorreu um erro ao validar o entregável da fase **${faseAtual.nome}**.

**Erro:** ${error instanceof Error ? error.message : String(error)}

Por favor, verifique:
1. O entregável está formatado corretamente em Markdown?
2. O conteúdo segue o template da fase?
3. Todos os itens do gate checklist estão evidenciados?

Se o erro persistir, contate o suporte técnico.`,
                }],
                isError: true,
            };
        }
    }

    console.error(`[proximo] validateDeliverable completo — Score: ${qualityScore}/100`);

    // v6.6 MELHORIA #6: Calcular delta de score para feedback incremental
    const scoreAnteriorDelta = estado.score_bloqueado;
    const deltaInfo = (scoreAnteriorDelta != null && scoreAnteriorDelta !== qualityScore)
        ? `\n> 📊 **Score anterior:** ${scoreAnteriorDelta}/100 → **Atual:** ${qualityScore}/100 (${qualityScore > scoreAnteriorDelta ? '📈 +' : '📉 '}${qualityScore - scoreAnteriorDelta})\n`
        : '';

    // Score < 50: BLOQUEAR com instruções detalhadas de correção
    if (qualityScore < 50) {
        // V6 Sprint 2: Ativar modo compulsório também no score < 50
        estado.em_estado_compulsorio = true;
        estado.aguardando_aprovacao = false; // Score < 50 não aguarda aprovação — é bloqueio total
        try {
            await saveFile(`${diretorio}/.maestro/estado.json`, serializarEstado(estado).content);
        } catch { /* silencioso */ }

        const ideParaBloqueio = detectIDE(diretorio) || 'windsurf';
        const feedbackBloqueio = gerarInstrucaoCorrecao(
            faseAtual.nome,
            qualityScore,
            gateResultado.itens_validados || [],
            gateResultado.itens_pendentes || [],
            gateResultado.sugestoes || [],
            estruturaResult.secoes_faltando || [],
            ideParaBloqueio,
            diretorio  // V6 Sprint 1: payload de auto-correção
        );

        // Feedback de leitura do disco
        const feedbackLeituraBloqueio = entregavelLidoDoDisco && caminhoResolvido
            ? `> 📄 **Entregável lido de:** \`${caminhoResolvido}\`\n\n`
            : !caminhoResolvido && faseAtualInfo
                ? `> ⚠️ **Arquivo não encontrado no disco.** O conteúdo foi recebido via argumento.\n\n`
                : "";

        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Bloqueado

${feedbackLeituraBloqueio}## Score: ${qualityScore}/100 - Abaixo do mínimo (50)
${deltaInfo}
O entregável não atende aos requisitos mínimos de qualidade.

${feedbackBloqueio}

---

**Não é possível avançar.** Corrija os itens acima, salve o arquivo e tente novamente com \`executar({ acao: "avancar" })\`.`,
            }],
        };
    }

    // Score 50-69: Bloquear e aguardar aprovação do usuário (com instruções detalhadas)
    if (qualityScore < 70) {
        // Setar flag de bloqueio no estado
        estado.aguardando_aprovacao = true;
        estado.motivo_bloqueio = "Score abaixo de 70 - requer aprovação do usuário";
        estado.score_bloqueado = qualityScore;
        // V6 Sprint 2: Ativar modo compulsório — bloqueia divagação da IA
        estado.em_estado_compulsorio = true;
        // Salvar itens de validação para exibição correta na retomada
        estado.itens_aprovados_bloqueio = gateResultado.itens_validados || [];
        estado.itens_pendentes_bloqueio = gateResultado.itens_pendentes || [];

        // Serializar estado bloqueado
        const estadoBloqueado = serializarEstado(estado);

        // v5.3: Persistência direta para estado bloqueado
        try {
            await saveFile(`${diretorio}/${estadoBloqueado.path}`, estadoBloqueado.content);
        } catch (err) {
            console.error('[proximo] Erro ao salvar estado bloqueado:', err);
        }

        // v5.5.0: Feedback instrutor com templates e checklists
        const ideParaAprovacao = detectIDE(diretorio) || 'windsurf';
        const feedbackAprovacao = gerarInstrucaoCorrecao(
            faseAtual.nome,
            qualityScore,
            gateResultado.itens_validados || [],
            gateResultado.itens_pendentes || [],
            gateResultado.sugestoes || [],
            estruturaResult.secoes_faltando || [],
            ideParaAprovacao,
            diretorio,
            true  // requiresUserDecision: aguarda decisão explícita do usuário
        );

        // Feedback de leitura do disco
        const feedbackLeituraAprovacao = entregavelLidoDoDisco && caminhoResolvido
            ? `> 📄 **Entregável lido de:** \`${caminhoResolvido}\`\n\n`
            : !caminhoResolvido && faseAtualInfo
                ? `> ⚠️ **Arquivo não encontrado no disco.** O conteúdo foi recebido via argumento.\n\n`
                : "";

        return {
            content: [{
                type: "text",
                text: `# ⚠️ Aprovação do Usuário Necessária

${feedbackLeituraAprovacao}## Score: ${qualityScore}/100 - Abaixo do mínimo recomendado (70)
${deltaInfo}
O entregável tem qualidade abaixo do ideal mas pode ser melhorado.

${feedbackAprovacao}

---

## 🔐 Ação do Usuário Necessária

O projeto foi **bloqueado** aguardando decisão do usuário:

- **Para corrigir** (recomendado): Siga as instruções acima, edite o arquivo e re-submeta com \`executar({ acao: "avancar" })\`
- **Para aprovar mesmo assim**: Diga "aprovar o gate"

> ⚠️ **CRÍTICO**: A IA NÃO pode aprovar automaticamente.
> Aguarde a decisão explícita do usuário humano.
`,
            }],
            estado_atualizado: estadoBloqueado.content,
        };
    }

    // Score >= 70 OU usuário confirmou: Pode avançar

    // Preparar arquivos para salvar
    const filesToSave: Array<{ path: string; content: string }> = [];

    // Arquivo do entregável
    const nomeArquivo = args.nome_arquivo || faseAtual.entregavel_esperado;
    const faseDirName = getFaseDirName(estado.fase_atual, faseAtual.nome); // padrão canônico com normalização de acentos
    const caminhoArquivo = `${diretorio}/docs/${faseDirName}/${nomeArquivo}`;

    filesToSave.push({
        path: caminhoArquivo,
        content: entregavelValidado
    });

    // Atualizar estado com entregável registrado
    estado.entregaveis[`fase_${estado.fase_atual}`] = caminhoArquivo;

    // V6 Sprint 2: Garantir que ga saiu do modo compulsório ao avançar com sucesso
    estado.em_estado_compulsorio = false;
    estado.aguardando_aprovacao = false;
    estado.motivo_bloqueio = undefined;
    estado.score_bloqueado = undefined;

    // v9.0: PHASE_TYPE_MAP agora importado de flows/types.ts (fonte única de verdade)

    // Preparar/atualizar resumo
    let resumo: ProjectSummary;
    if (args.resumo_json) {
        resumo = parsearResumo(args.resumo_json) || criarResumoInicial(estado.projeto_id, estado.nome, estado.nivel, estado.fase_atual, estado.total_fases);
    } else {
        resumo = criarResumoInicial(estado.projeto_id, estado.nome, estado.nivel, estado.fase_atual, estado.total_fases);
    }

    // Extrair resumo do entregável
    const extractedInfo = extrairResumoEntregavel(entregavelValidado, estado.fase_atual, faseAtual.nome, faseAtual.entregavel_esperado, caminhoArquivo);

    const novoEntregavel: EntregavelResumo = {
        fase: estado.fase_atual,
        nome: faseAtual.nome,
        tipo: faseAtual.entregavel_esperado,
        arquivo: caminhoArquivo,
        resumo: extractedInfo.resumo,
        pontos_chave: extractedInfo.pontos_chave,
        criado_em: new Date().toISOString(),
    };

    // Adicionar ou atualizar entregável no resumo
    const existingIdx = resumo.entregaveis.findIndex(e => e.fase === estado.fase_atual);
    if (existingIdx >= 0) {
        resumo.entregaveis[existingIdx] = novoEntregavel;
    } else {
        resumo.entregaveis.push(novoEntregavel);
    }

    // v6.0: Classificação Progressiva — acumula sinais e refina em TODA transição de fase
    let classificacaoInfo = "";

    // Inicializar classificação progressiva se não existir
    if (!estado.classificacao_progressiva) {
        estado.classificacao_progressiva = {
            nivel_atual: estado.nivel,
            nivel_provisorio: true,
            confianca_geral: 50,
            sinais: [],
            historico_niveis: [],
            fases_refinamento: []
        };
    }

    // Registrar sinais do entregável atual
    const sinaisAtualizados = classificacaoProgressiva.registrarSinais(
        entregavelValidado,
        faseAtual,
        estado.classificacao_progressiva.sinais
    );
    estado.classificacao_progressiva.sinais = sinaisAtualizados;

    // Sprint 4 (v7.0): Capturar sinais das respostas dos especialistas
    // Fase 2 (Requisitos) e Fase 4 (Arquitetura) fazem perguntas técnicas
    if (estado.fase_atual === 2 || estado.fase_atual === 4) {
        const sinaisEspecialista = classificacaoProgressiva.extrairSinaisEspecialista(
            estado.fase_atual,
            entregavelValidado
        );

        if (sinaisEspecialista.length > 0) {
            // Adicionar sinais do especialista aos sinais existentes
            estado.classificacao_progressiva.sinais = [
                ...estado.classificacao_progressiva.sinais,
                ...sinaisEspecialista
            ];
        }
    }

    // Recalcular classificação com todos os sinais acumulados (incluindo sinais do especialista)
    const { nivel: nivelCalculado, confianca, criterios } = classificacaoProgressiva.recalcular(
        estado.classificacao_progressiva.sinais
    );

    // Verificar se precisa expandir o fluxo
    const expansao = classificacaoProgressiva.verificarExpansao(
        estado.classificacao_progressiva.nivel_atual,
        nivelCalculado,
        estado.fase_atual
    );

    // Atualizar classificação progressiva
    estado.classificacao_progressiva.confianca_geral = confianca;
    estado.classificacao_progressiva.fases_refinamento.push(estado.fase_atual);

    // Se houve expansão, registrar no histórico e expandir fluxo
    if (expansao.expandir) {
        estado.classificacao_progressiva.historico_niveis.push({
            fase: estado.fase_atual,
            nivel: nivelCalculado,
            motivo: `Expansão detectada: ${criterios.join(", ")}`
        });
        estado.classificacao_progressiva.nivel_atual = nivelCalculado;
        estado.nivel = nivelCalculado;
        estado.total_fases = getFluxoComStitch(nivelCalculado, estado.usar_stitch).total_fases;

        classificacaoInfo = `
## 🔄 Expansão de Fluxo Detectada!

| Campo | Valor |
|-------|-------|
| **De** | ${expansao.de.toUpperCase()} |
| **Para** | ${expansao.para.toUpperCase()} |
| **Fases Adicionadas** | +${expansao.fasesAdicionadas} fases |
| **Total de Fases** | ${estado.total_fases} |
| **Confiança** | ${confianca}% |

### 📊 Sinais que levaram à expansão:
${criterios.map(c => `- ${c}`).join("\n")}

> ⚡ O sistema detectou complexidade adicional baseado nas suas respostas e expandiu o fluxo automaticamente.
> As fases já concluídas permanecem intactas.
`;
    } else if (estado.fase_atual === 1) {
        // Primeira classificação (provisória)
        estado.classificacao_progressiva.nivel_atual = nivelCalculado;
        estado.nivel = nivelCalculado;
        estado.total_fases = getFluxoComStitch(nivelCalculado, estado.usar_stitch).total_fases;

        classificacaoInfo = `
## 🎯 Classificação Inicial (PROVISÓRIA)

| Campo | Valor |
|-------|-------|
| **Nível** | ${nivelCalculado.toUpperCase()} |
| **Confiança** | ${confianca}% |
| **Total de Fases** | ${estado.total_fases} |

### Critérios detectados:
${criterios.map(c => `- ${c}`).join("\n")}

> 💡 Esta classificação é **provisória** e será refinada automaticamente
> conforme você avança nas fases de Requisitos e Arquitetura.
`;
    } else {
        // Refinamento em fases intermediárias
        const nivelMudou = estado.classificacao_progressiva.nivel_atual !== nivelCalculado;
        if (nivelMudou && !expansao.expandir) {
            // Nível mudou mas não expandiu (confiança aumentou)
            estado.classificacao_progressiva.nivel_atual = nivelCalculado;
            estado.nivel = nivelCalculado;
        }

        classificacaoInfo = `
## 📊 Classificação Refinada

| Campo | Valor |
|-------|-------|
| **Nível Atual** | ${estado.classificacao_progressiva.nivel_atual.toUpperCase()} |
| **Confiança** | ${confianca}% |
| **Sinais Acumulados** | ${sinaisAtualizados.length} |

### Critérios atualizados:
${criterios.slice(0, 5).map(c => `- ${c}`).join("\n")}
`;
    }

    // Marcar como definitiva na fase de Arquitetura
    if (faseAtual.nome.toLowerCase().includes("arquitetura")) {
        estado.classificacao_progressiva.nivel_provisorio = false;
        classificacaoInfo += `\n> ✅ **Classificação DEFINITIVA** confirmada na fase de Arquitetura.\n`;
    }

    // v9.0: Decompor em tasks ao entrar em fase de código — usa Backlog como fonte primária
    // FIX: Antes usava ['Backend','Frontend','Integração','Testes'] — 'Testes' é fase de documento, não de código
    const proximaFaseInfo2 = getFaseComStitch(estado.nivel, estado.fase_atual + 1, estado.usar_stitch);
    const isCodePhaseNext = isCodePhaseName(proximaFaseInfo2?.nome);

    if (isCodePhaseNext) {
        try {
            // v8.0: Tentar ler backlog e OpenAPI do disco para gerar tasks baseadas no Backlog
            const { decomposeBacklogToTasks } = await import("../services/task-decomposer.service.js");
            let backlogContent: string | null = null;
            let openApiContent: string | null = null;

            // Buscar backlog nos entregáveis
            for (const [key, path] of Object.entries(estado.entregaveis || {})) {
                const pl = (path as string).toLowerCase();
                if (pl.includes('backlog') && !backlogContent) {
                    try { backlogContent = await readFile(path as string, 'utf-8'); } catch { /* ignore */ }
                }
                if ((pl.includes('openapi') || pl.includes('.yaml')) && !openApiContent) {
                    try { openApiContent = await readFile(path as string, 'utf-8'); } catch { /* ignore */ }
                }
            }

            if (backlogContent) {
                const newTasks = decomposeBacklogToTasks(
                    backlogContent,
                    openApiContent,
                    estado.fase_atual + 1,
                    proximaFaseInfo2!.nome
                );
                if (newTasks.length > 0) {
                    // Limpar tasks antigas da mesma fase antes de adicionar novas
                    estado.tasks = [
                        ...(estado.tasks || []).filter(t => t.phase !== estado.fase_atual + 1),
                        ...newTasks,
                    ];
                    console.error(`[proximo] v8.0: ${newTasks.length} tasks geradas do BACKLOG para fase ${estado.fase_atual + 1} (${proximaFaseInfo2?.nome})`);
                }
            } else if (entregavelValidado) {
                // Fallback: usar decomposição por H2/H3 do entregável anterior
                const newTasks = decomposeArchitectureToTasks(entregavelValidado, estado.fase_atual + 1);
                if (newTasks.length > 0) {
                    estado.tasks = [...(estado.tasks || []), ...newTasks];
                    console.error(`[proximo] v6.5 fallback: ${newTasks.length} tasks geradas da arquitetura para fase ${estado.fase_atual + 1}`);
                }
            }
        } catch (err) {
            console.warn('[proximo] v8.0: Falha ao gerar tasks (non-blocking):', err);
        }
    }

    // Avançar para próxima fase
    const faseAnterior = estado.fase_atual;

    if (estado.fase_atual < estado.total_fases) {
        estado.fase_atual += 1;
        estado.gates_validados.push(faseAnterior);
    }

    const proximaFase = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);

    // Atualizar contexto no resumo
    const proximaFaseInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
    if (proximaFaseInfo) {
        resumo.contexto_atual = {
            fase_nome: proximaFaseInfo.nome,
            objetivo: `Desenvolver ${proximaFaseInfo.entregavel_esperado}`,
            proximo_passo: `Trabalhar com ${proximaFaseInfo.especialista} para criar o entregável`,
            dependencias: resumo.entregaveis.map(e => e.nome),
        };
    }
    resumo.fase_atual = estado.fase_atual;
    resumo.nivel = estado.nivel;
    resumo.total_fases = estado.total_fases;

    // Serializar estado e resumo
    const estadoFile = serializarEstado(estado);
    const resumoFiles = serializarResumo(resumo);

    filesToSave.push({
        path: `${diretorio}/${estadoFile.path}`,
        content: estadoFile.content
    });
    filesToSave.push(...resumoFiles.map(f => ({
        path: `${diretorio}/${f.path}`,
        content: f.content
    })));

    // Logar transição de fase e atualizar SYSTEM.md
    try {
        await logEvent(diretorio, {
            type: EventTypes.PHASE_TRANSITION,
            fase: estado.fase_atual,
            data: {
                de: faseAnterior,
                para: estado.fase_atual,
                entregavel: caminhoArquivo,
                score: qualityScore
            }
        });

        if (proximaFase) {
            await gerarSystemMd(
                diretorio,
                estado,
                proximaFase.nome,
                proximaFase.especialista,
                proximaFase.gate_checklist
            );
        }
    } catch (error) {
        console.warn('Aviso: Não foi possível atualizar histórico/SYSTEM.md:', error);
    }

    // V6 Sprint 4: Gerar guia de Gate da PRÓXIMA fase (TDD Invertido)
    // Cria docs/fase-XX/.orientacoes-gate.md com os critérios exatos de validação
    if (proximaFase) {
        try {
            const gateOrientationPath = await generateGateOrientationDoc(
                diretorio,
                proximaFase.nome,
                estado.fase_atual
            );
            // Atualizar flow_phase_type da próxima fase no estado (Sprint 6)
            estado.flow_phase_type = PHASE_TYPE_MAP[proximaFase.nome] ?? 'derived';
            if (gateOrientationPath) {
                console.error(`[proximo] Guia de Gate gerado: ${gateOrientationPath}`);
            }
        } catch (error) {
            console.warn('[proximo] Falha ao gerar orientação de gate (não crítico):', error);
        }
    }

    // V6 Sprint 5: Gerenciar ciclo de vida do watcher de entregáveis
    // Parar watcher da fase anterior (evita leak de file handles)
    stopFileWatcher(diretorio);
    // Iniciar watcher para o PRÓXIMO entregável assim que a fase avançar
    if (proximaFase) {
        const proximaFaseDirName = `fase-${estado.fase_atual.toString().padStart(2, '0')}-${proximaFase.nome.toLowerCase().replace(/\s/g, '-')}`;
        const proximoEntregavelPath = `${diretorio}/docs/${proximaFaseDirName}/${proximaFase.entregavel_esperado}`;
        startFileWatcher({
            filePath: proximoEntregavelPath,
            diretorio,
            faseNome: proximaFase.nome,
            tier: estado.tier_gate || 'base',
            gateChecklist: proximaFase.gate_checklist || [],
            onValidationResult: (score, feedback, filePath) => {
                // Log no console — o usuário será notificado via IDE ao chamar executar
                console.error(`\n==========================================\n[watcher] ${proximaFase.nome} | Score: ${score} | ${filePath}`);
                if (score >= 0) console.error(`[watcher] Feedback:\n${feedback}\n==========================================\n`);
            }
        }).catch(err => console.warn('[watcher] Não foi possível iniciar o watcher:', err));
    }

    // v6.0: Bloco de interrupção pós-PRD removido — classificação progressiva já cuida disso

    // v5.5.0: Feedback visual quando entregável foi lido do disco
    const feedbackLeitura = entregavelLidoDoDisco && caminhoResolvido
        ? `
> 📄 **Entregável lido automaticamente de:** \`${caminhoResolvido}\`

`
        : "";

    // v7.0: Gerar informações da próxima skill usando menção dinâmica da IDE
    const proximaSkillInfo = await (async () => {
        if (!proximaFase) return "";

        const proximaSkill = getSkillParaFase(proximaFase.nome);
        if (!proximaSkill) return "";

        const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
        return `

## 🤖 Próximo Especialista

${formatSkillHydrationCommand(proximaSkill, ide, diretorio)}
`;
    })();

    // v7.2 FIX C: Gerar menções de arquivo para entregáveis anteriores + gate orientation
    const ideParaMencoes = estado.ide || detectIDE(diretorio) || 'windsurf';
    const gateOrientationDir = proximaFase ? getFaseDirName(estado.fase_atual, proximaFase.nome) : undefined;
    const contextoAcumulado = formatarContextoComoMencoes(estado, diretorio, ideParaMencoes, gateOrientationDir);

    // v7.1 FIX 5: Path canônico para a próxima fase
    const pathInfoProximaFase = proximaFase ? (() => {
        const dirName = getFaseDirName(estado.fase_atual, proximaFase.nome);
        return `\n### 📁 Onde Salvar o Entregável\n\n| Tipo | Path |\n|------|------|\n| **Entregável** | \`docs/${dirName}/${proximaFase.entregavel_esperado}\` |\n| **Orientações de Gate** | \`docs/${dirName}/.orientacoes-gate.md\` |\n\n> ⚠️ **SALVE o entregável EXATAMENTE no path indicado.** O sistema lê automaticamente do disco.\n> Após salvar, chame: \`executar({ acao: "avancar" })\`\n`;
    })() : '';

    const resposta = `# ✅ Fase ${faseAnterior} Concluída!

## 📁 Entregável
\`${caminhoArquivo}\`

${gateResultado.valido ? "✅ Gate aprovado" : "⚠️ Gate forçado"}
${classificacaoInfo}

---

# 📍 Fase ${estado.fase_atual}/${estado.total_fases}: ${proximaFase?.nome || "Concluído"}

| Campo | Valor |
|-------|-------|
| **Especialista** | ${proximaFase?.especialista || "-"} |
| **Entregável** | ${proximaFase?.entregavel_esperado || "-"} |

${getSpecialistQuestions(estado.fase_atual, proximaFase?.nome)}

## Gate de Saída
${proximaFase?.gate_checklist.map(item => `- [ ] ${item}`).join("\n") || "Nenhum"}
${pathInfoProximaFase}
${contextoAcumulado}
${proximaSkillInfo}
---

`;

    // V6 Sprint 6: Instrução de continuidade autônoma
    // Retorna vazio para fases 'input_required' (especialista faz as perguntas naturalmente)
    const continuidade = gerarInstrucaoContinuidade(
        diretorio,
        faseAnterior,
        proximaFase?.nome ?? '',
        estado.flow_phase_type ?? 'derived'
    );

    // v5.3: Persistência direta — salvar todos os arquivos via fs
    try {
        await saveMultipleFiles(filesToSave);
    } catch (err) {
        console.error('[proximo] Erro ao salvar arquivos:', err);
    }

    const confirmacao = formatSavedFilesConfirmation(filesToSave.map(f => f.path));

    const specialist = proximaFase ? getSpecialistPersona(proximaFase.nome) : null;

    // v5: next_action e progress são calculados automaticamente pelo middleware flow-engine.middleware.ts
    // Mantemos apenas specialist_persona e estado_atualizado para o middleware processar
    return {
        content: [{ type: "text", text: deprecationWarning + feedbackLeitura + resposta + confirmacao + continuidade }],
        estado_atualizado: estadoFile.content,
        specialist_persona: specialist || undefined,
        // next_action e progress serão adicionados pelo middleware withFlowEngine
    };
}

/**
 * Input schema para proximo
 */
export const proximoSchema = {
    type: "object",
    properties: {
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável da fase atual",
        },
        estado_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/estado.json",
        },
        resumo_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/resumo.json (opcional)",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo para salvar (opcional)",
        },
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
        auto_flow: {
            type: "boolean",
            description: "Modo fluxo automático: auto-confirma classificação, pula verificações redundantes e avança automaticamente se score >= 70 (padrão: false)",
        },
    },
    required: ["estado_json", "diretorio"],  // v5.5.0: entregavel agora é opcional
};
