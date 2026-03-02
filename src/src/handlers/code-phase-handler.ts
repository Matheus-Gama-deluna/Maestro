/**
 * Code Phase Handler (v8.0)
 *
 * Handler dedicado para fases de desenvolvimento de código (Frontend, Backend, Integração, Deploy).
 *
 * Responsabilidades:
 * 1. Detectar que é fase de código e interceptar antes do proximo.ts
 * 2. Ler backlog, OpenAPI, arquitetura do disco (via menções)
 * 3. Gerar tasks baseadas no Backlog (não da arquitetura)
 * 4. Apresentar tasks task-by-task com contexto dos docs anteriores
 * 5. Validar existência real de arquivos (não keywords)
 * 6. Gerar manifest ao completar todas tasks
 *
 * State machine: SETUP → WORKING → GATE → COMPLETED
 *
 * @since v8.0
 */

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { CodePhaseState, CodeManifest } from "../types/code-manifest.js";
import { serializarEstado } from "../state/storage.js";
import { saveFile } from "../utils/persistence.js";
import { resolveProjectPath } from "../utils/files.js";
import { getFaseComStitch, CODE_PHASE_NAMES, isCodePhaseName } from "../flows/types.js";
import { validateCodePhase, formatCodeValidationResult } from "../gates/code-validator.js";
import { decomposeBacklogToTasks, getNextTask, getTaskProgress } from "../services/task-decomposer.service.js";
import { formatMention, detectIDE } from "../utils/ide-paths.js";
import { getFaseDirName } from "../utils/entregavel-path.js";

interface CodePhaseArgs {
    estado: EstadoProjeto;
    diretorio: string;
    respostas?: Record<string, unknown>;
    entregavel?: string;
}

/**
 * Verifica se uma fase é de código.
 * v9.0: Delega para isCodePhaseName de flows/types.ts (fonte única de verdade).
 */
export function isCodePhase(faseNome: string | undefined): boolean {
    return isCodePhaseName(faseNome);
}

/**
 * Entry point do Code Phase Handler.
 * Detecta o estado atual e delega para o handler correto.
 */
export async function handleCodePhase(args: CodePhaseArgs): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const faseInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);

    if (!faseInfo) {
        return {
            content: [{ type: "text", text: `❌ Fase ${estado.fase_atual} não encontrada no fluxo.` }],
            isError: true,
        };
    }

    // Carregar ou inicializar estado da fase de código
    let codeState = loadCodePhaseState(estado, estado.fase_atual, faseInfo.nome);

    // State machine
    switch (codeState.status) {
        case 'setup':
            return handleSetup(args, codeState, faseInfo);
        case 'working':
            return handleWorking(args, codeState, faseInfo);
        case 'gate':
            return handleGate(args, codeState, faseInfo);
        case 'completed':
            // Já completou — delegar para proximo.ts para avançar
            return delegateToProximo(args);
        default:
            return handleSetup(args, codeState, faseInfo);
    }
}

/**
 * Handler: SETUP — Primeira vez na fase de código.
 * Lê backlog + OpenAPI + arquitetura, gera tasks, apresenta visão geral.
 */
async function handleSetup(
    args: CodePhaseArgs,
    codeState: CodePhaseState,
    faseInfo: { nome: string; numero: number; especialista: string; gate_checklist: string[] }
): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const ide = (estado.ide || detectIDE(diretorio) || 'windsurf') as 'windsurf' | 'cursor' | 'antigravity';

    // Ler entregáveis anteriores do disco
    const backlogContent = await readEntregavel(estado, diretorio, 'backlog');
    const openApiContent = await readEntregavel(estado, diretorio, 'openapi');
    const arquiteturaContent = await readEntregavel(estado, diretorio, 'arquitetura');

    // Gerar tasks a partir do backlog (se disponível)
    if (!codeState.tasksGenerated && backlogContent) {
        try {
            const newTasks = decomposeBacklogToTasks(
                backlogContent,
                openApiContent,
                estado.fase_atual,
                faseInfo.nome
            );
            if (newTasks.length > 0) {
                // Limpar tasks antigas da mesma fase
                estado.tasks = [
                    ...(estado.tasks || []).filter(t => t.phase !== estado.fase_atual),
                    ...newTasks,
                ];
                codeState.tasksGenerated = true;
                console.log(`[code-phase] v8.0: ${newTasks.length} tasks geradas do Backlog para fase ${estado.fase_atual} (${faseInfo.nome})`);
            }
        } catch (err) {
            console.warn('[code-phase] v8.0: Falha ao gerar tasks do backlog:', err);
        }
    }

    // Calcular progresso
    const progress = getTaskProgress(estado.tasks || [], estado.fase_atual);
    const nextTask = getNextTask((estado.tasks || []).filter(t => t.phase === estado.fase_atual));

    // Extrair stack da arquitetura (parsing simplificado)
    const stackInfo = extractStackInfo(arquiteturaContent, faseInfo.nome);

    // v9.0 Sprint 4: Inicializar manifest com stack da arquitetura
    if (!codeState.manifest) {
        codeState.manifest = createEmptyManifest(estado.fase_atual, faseInfo.nome);
    }
    codeState.manifest.stack = extractStackForManifest(arquiteturaContent, faseInfo.nome);

    // Extrair user stories relevantes do backlog
    const relevantStories = extractRelevantStoriesSummary(backlogContent, faseInfo.nome);

    // Extrair endpoints do OpenAPI
    const endpointsSummary = extractEndpointsSummary(openApiContent, faseInfo.nome);

    // Gerar menções aos documentos relevantes
    const mencoes = buildRelevantMentions(estado, diretorio, faseInfo.nome, ide);

    // Atualizar estado
    codeState.status = nextTask ? 'working' : 'setup';
    saveCodePhaseState(estado, codeState);
    await persistState(estado, diretorio);

    const taskInfo = nextTask
        ? `\n## ⚡ Task Atual: 1/${progress.total} — ${nextTask.title}\n${nextTask.description}\n`
        : '\n> ⚠️ Nenhuma task gerada. Verifique se o backlog existe.\n';

    return {
        content: [{
            type: "text",
            text: `# 🚀 Fase ${estado.fase_atual}: ${faseInfo.nome} — Setup

## 👤 Especialista: ${faseInfo.especialista}

${stackInfo}

${relevantStories}

${endpointsSummary}

## 📎 Leia antes de começar
${mencoes}
${taskInfo}
## 📊 Progresso: ${progress.done}/${progress.total} tasks (${progress.percentage}%)

## Gate de Saída
${faseInfo.gate_checklist.map(item => `- [ ] ${item}`).join('\n')}

---

### 🤖 Instruções para a IA

1. **Leia os documentos mencionados** acima para entender o contexto completo
2. **Implemente a task atual** seguindo a stack definida na Arquitetura
3. **Após concluir**, marque como feita chamando:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "respostas": { "task_done": true }
})
\`\`\`

> ⚠️ Implemente UMA task por vez. Não tente fazer tudo de uma vez.
`,
        }],
        estado_atualizado: serializarEstado(estado).content,
        specialist_persona: {
            name: faseInfo.especialista,
            tone: "Técnico e prático",
            expertise: getExpertiseForPhase(faseInfo.nome),
            instructions: `Você é o especialista de ${faseInfo.nome}. Implemente task por task seguindo a stack definida na Arquitetura. Use os docs de referência para contexto.`,
        },
        progress: {
            current_phase: faseInfo.nome,
            total_phases: estado.total_fases,
            completed_phases: estado.gates_validados?.length || 0,
            percentage: Math.round(((estado.gates_validados?.length || 0) / estado.total_fases) * 100),
        },
    };
}

/**
 * Handler: WORKING — Task por task.
 * Recebe indicação de task concluída, marca done, apresenta próxima.
 */
async function handleWorking(
    args: CodePhaseArgs,
    codeState: CodePhaseState,
    faseInfo: { nome: string; numero: number; especialista: string; gate_checklist: string[] }
): Promise<ToolResult> {
    const { estado, diretorio, respostas } = args;
    const ide = (estado.ide || detectIDE(diretorio) || 'windsurf') as 'windsurf' | 'cursor' | 'antigravity';

    const phaseTasks = (estado.tasks || []).filter(t => t.phase === estado.fase_atual);

    // Se respostas indica task concluída
    if (respostas?.task_done === true || respostas?.task_done === 'true') {
        // Encontrar task atual (primeira todo ou in_progress)
        const currentTask = phaseTasks.find(t =>
            (t.type === 'task' || t.type === 'subtask') &&
            (t.status === 'in_progress' || t.status === 'todo') &&
            t.dependencies.every(dep => phaseTasks.some(pt => pt.id === dep && pt.status === 'done'))
        );

        if (currentTask) {
            currentTask.status = 'done';
            currentTask.updated_at = new Date().toISOString();
            console.log(`[code-phase] Task marcada como done: ${currentTask.title}`);

            // Verificar se o parent (story) está completo
            if (currentTask.parent_id) {
                const parent = phaseTasks.find(t => t.id === currentTask.parent_id);
                if (parent) {
                    const allChildrenDone = parent.children_ids.every(cid =>
                        phaseTasks.some(t => t.id === cid && t.status === 'done')
                    );
                    if (allChildrenDone) {
                        parent.status = 'done';
                        parent.updated_at = new Date().toISOString();
                    }
                }
            }
        }

        // Registrar arquivos criados (se informados nas respostas)
        if (respostas?.arquivos_criados && Array.isArray(respostas.arquivos_criados)) {
            if (!codeState.manifest) {
                codeState.manifest = createEmptyManifest(estado.fase_atual, faseInfo.nome);
            }
            codeState.manifest.arquivos_criados.push(
                ...(respostas.arquivos_criados as string[])
            );
        }
    }

    // Calcular progresso atualizado
    const progress = getTaskProgress(phaseTasks, estado.fase_atual);
    const nextTask = getNextTask(phaseTasks);

    // Se todas as tasks estão done → ir para GATE
    if (!nextTask && progress.total > 0 && progress.done === progress.total) {
        codeState.status = 'gate';
        saveCodePhaseState(estado, codeState);
        await persistState(estado, diretorio);
        return handleGate(args, codeState, faseInfo);
    }

    // Marcar próxima task como in_progress
    if (nextTask && nextTask.status === 'todo') {
        nextTask.status = 'in_progress';
        nextTask.updated_at = new Date().toISOString();
    }

    codeState.currentTaskIndex = progress.done;
    codeState.updatedAt = new Date().toISOString();
    saveCodePhaseState(estado, codeState);
    await persistState(estado, diretorio);

    const taskNum = progress.done + 1;
    const mencoes = buildRelevantMentions(estado, diretorio, faseInfo.nome, ide);

    return {
        content: [{
            type: "text",
            text: `# ${progress.done > 0 ? '✅ Task Anterior Concluída!' : ''} Task ${taskNum}/${progress.total}

## 📊 Progresso: ${progress.done}/${progress.total} (${progress.percentage}%)
${'█'.repeat(Math.floor(progress.percentage / 5))}${'░'.repeat(20 - Math.floor(progress.percentage / 5))} ${progress.percentage}%

${nextTask ? `## 📌 Task Atual: ${nextTask.title}
${nextTask.description}

${nextTask.metadata?.acceptance_criteria ? `### Critérios de Aceite\n${nextTask.metadata.acceptance_criteria.map(c => `- [ ] ${c}`).join('\n')}` : ''}

${nextTask.metadata?.files ? `### Arquivos Esperados\n${nextTask.metadata.files.map(f => `- \`${f}\``).join('\n')}` : ''}
` : '> Nenhuma task pendente.'}

## 📎 Referência
${mencoes}

---

### 🤖 Após implementar esta task:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "respostas": { "task_done": true }
})
\`\`\`
`,
        }],
        estado_atualizado: serializarEstado(estado).content,
        next_action: {
            tool: "executar",
            description: `Concluir task ${taskNum}/${progress.total}: ${nextTask?.title || 'próxima'}`,
            args_template: { diretorio, acao: "avancar", respostas: { task_done: true } },
            requires_user_input: false,
        },
    };
}

/**
 * Handler: GATE — Todas tasks done. Gerar manifest e validar.
 * v9.0: Usa CodeValidator (validação por artefatos) em vez de delegar para proximo.ts textual.
 * Se score >= 70, avança automaticamente via proximo.ts.
 * Se score 50-69, aguarda aprovação manual.
 * Se score < 50, bloqueia com instruções.
 */
async function handleGate(
    args: CodePhaseArgs,
    codeState: CodePhaseState,
    faseInfo: { nome: string; numero: number; especialista: string; gate_checklist: string[] }
): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const progress = getTaskProgress(estado.tasks || [], estado.fase_atual);

    // Gerar manifest
    const manifest = codeState.manifest || createEmptyManifest(estado.fase_atual, faseInfo.nome);
    manifest.tasks_total = progress.total;
    manifest.tasks_done = progress.done;
    manifest.timestamp = new Date().toISOString();

    // Escanear arquivos criados no diretório do projeto
    const scannedFiles = scanProjectFiles(diretorio, faseInfo.nome);
    manifest.arquivos_criados = [...new Set([...manifest.arquivos_criados, ...scannedFiles])];

    // v9.0 Sprint 4: Popular user_stories a partir das tasks do estado
    populateManifestUserStories(manifest, estado.tasks || [], estado.fase_atual);

    // Salvar manifest
    const faseDirName = getFaseDirName(estado.fase_atual, faseInfo.nome);
    const manifestPath = join(diretorio, 'docs', faseDirName, 'manifest.json');
    const summaryPath = join(diretorio, 'docs', faseDirName, `${faseInfo.nome.toLowerCase()}-summary.md`);

    try {
        await saveFile(manifestPath, JSON.stringify(manifest, null, 2));

        // Gerar resumo markdown
        const summaryContent = generateSummaryMarkdown(manifest, faseInfo, progress);
        await saveFile(summaryPath, summaryContent);

        // Registrar como entregável no estado
        estado.entregaveis[`fase_${estado.fase_atual}`] = summaryPath;
    } catch (err) {
        console.warn('[code-phase] Falha ao salvar manifest:', err);
    }

    // v9.0: Validação orientada a artefatos (em vez de keywords textuais)
    const validationResult = validateCodePhase(
        manifest,
        diretorio,
        estado.tasks || [],
        estado.fase_atual
    );

    console.log(`[code-phase] v9.0: CodeValidator score=${validationResult.score}/100 approved=${validationResult.approved} (arquivos=${validationResult.breakdown.arquivos}, tasks=${validationResult.breakdown.tasks}, manifest=${validationResult.breakdown.manifest})`);

    // Score < 50: BLOQUEAR
    if (validationResult.score < 50) {
        const feedbackMd = formatCodeValidationResult(validationResult, faseInfo.nome);
        return {
            content: [{
                type: "text",
                text: `# ❌ Gate de Código Bloqueado — ${faseInfo.nome}\n\n${feedbackMd}\n\n---\n\n**Não é possível avançar.** Complete as tasks pendentes, gere os arquivos e tente novamente com \`executar({ acao: "avancar" })\`.`,
            }],
            estado_atualizado: serializarEstado(estado).content,
        };
    }

    // Score 50-69: Aguardar aprovação manual
    if (validationResult.score < 70) {
        estado.aguardando_aprovacao = true;
        estado.motivo_bloqueio = `Gate de código: score ${validationResult.score}/100`;
        estado.score_bloqueado = validationResult.score;
        saveCodePhaseState(estado, codeState);
        await persistState(estado, diretorio);

        const feedbackMd = formatCodeValidationResult(validationResult, faseInfo.nome);
        return {
            content: [{
                type: "text",
                text: `# ⚠️ Aprovação Manual Necessária — ${faseInfo.nome}\n\n${feedbackMd}\n\n---\n\n## 🔐 Ação do Usuário\n\n- **Para corrigir** (recomendado): Complete as tasks pendentes e re-submeta\n- **Para aprovar mesmo assim**: Diga "aprovar o gate"\n\n> ⚠️ A IA NÃO pode aprovar automaticamente.`,
            }],
            estado_atualizado: serializarEstado(estado).content,
        };
    }

    // Score >= 70: Aprovado — marcar como completed e delegar para proximo.ts para avançar fase
    codeState.status = 'completed';
    codeState.manifest = manifest;
    saveCodePhaseState(estado, codeState);
    await persistState(estado, diretorio);

    // Delegar para proximo.ts para avançar fase (com summary como entregável textual)
    return delegateToProximo(args);
}

// === HELPER FUNCTIONS ===

/**
 * Carrega ou inicializa o estado da fase de código.
 */
function loadCodePhaseState(estado: EstadoProjeto, faseNumero: number, faseNome: string): CodePhaseState {
    const existing = (estado as any).codePhaseState as CodePhaseState | undefined;
    if (existing && existing.faseNumero === faseNumero) {
        return existing;
    }

    return {
        status: 'setup',
        faseNumero,
        faseNome,
        tasksGenerated: false,
        currentTaskIndex: 0,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

function saveCodePhaseState(estado: EstadoProjeto, codeState: CodePhaseState): void {
    (estado as any).codePhaseState = codeState;
}

async function persistState(estado: EstadoProjeto, diretorio: string): Promise<void> {
    estado.atualizado_em = new Date().toISOString();
    const estadoFile = serializarEstado(estado);
    try {
        await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
        console.error('[code-phase] Erro ao salvar estado:', err);
    }
}

/**
 * Lê um entregável anterior do disco.
 */
async function readEntregavel(
    estado: EstadoProjeto,
    diretorio: string,
    tipo: 'backlog' | 'openapi' | 'arquitetura' | 'design' | 'banco'
): Promise<string | null> {
    const entregaveis = estado.entregaveis || {};

    // Buscar no estado por chave parcial
    for (const [key, path] of Object.entries(entregaveis)) {
        const keyLower = key.toLowerCase();
        const pathLower = (path as string).toLowerCase();

        const match =
            (tipo === 'backlog' && (keyLower.includes('backlog') || pathLower.includes('backlog'))) ||
            (tipo === 'openapi' && (keyLower.includes('api') || pathLower.includes('openapi') || pathLower.includes('.yaml'))) ||
            (tipo === 'arquitetura' && (keyLower.includes('arquitetura') || pathLower.includes('arquitetura')) && !pathLower.includes('avancada')) ||
            (tipo === 'design' && (keyLower.includes('design') || pathLower.includes('design-doc'))) ||
            (tipo === 'banco' && (keyLower.includes('banco') || pathLower.includes('design-banco')));

        if (match) {
            try {
                const content = await readFile(path as string, 'utf-8');
                if (content && content.trim().length > 50) return content;
            } catch { /* ignore */ }
        }
    }

    // Fallback: tentar paths convencionais
    const fallbackPaths: Record<string, string[]> = {
        backlog: ['docs/12-backlog/backlog.md', 'docs/fase-12-backlog/backlog.md'],
        openapi: ['docs/13-api/openapi.yaml', 'docs/fase-13-contrato-api/openapi.yaml'],
        arquitetura: ['docs/06-arquitetura/arquitetura.md', 'docs/fase-06-arquitetura/arquitetura.md'],
        design: ['docs/03-ux-design/design-doc.md', 'docs/fase-03-ux-design/design-doc.md'],
        banco: ['docs/fase-05-banco/design-banco.md', 'docs/fase-05-banco-de-dados/design-banco.md'],
    };

    for (const relPath of (fallbackPaths[tipo] || [])) {
        const fullPath = join(diretorio, relPath);
        if (existsSync(fullPath)) {
            try {
                return await readFile(fullPath, 'utf-8');
            } catch { /* ignore */ }
        }
    }

    return null;
}

/**
 * Extrai informações de stack da arquitetura.
 */
function extractStackInfo(arquiteturaContent: string | null, faseNome: string): string {
    if (!arquiteturaContent) return '## Stack\n> ⚠️ Documento de Arquitetura não encontrado. Consulte o especialista.';

    const fase = faseNome.toLowerCase();
    const lines = arquiteturaContent.split('\n');
    const stackLines: string[] = [];
    let inStackSection = false;

    for (const line of lines) {
        if (line.match(/stack\s+tecnol[oó]gica/i) || line.match(/## \d+\.\s*Stack/i)) {
            inStackSection = true;
            continue;
        }
        if (inStackSection) {
            if (line.match(/^##\s/) && !line.match(/stack/i)) break;
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                const lower = line.toLowerCase();
                if (fase.includes('frontend') && (lower.includes('frontend') || lower.includes('next') || lower.includes('react') || lower.includes('tailwind'))) {
                    stackLines.push(line.trim());
                } else if (fase.includes('backend') && (lower.includes('backend') || lower.includes('node') || lower.includes('express') || lower.includes('prisma'))) {
                    stackLines.push(line.trim());
                } else if (!fase.includes('frontend') && !fase.includes('backend')) {
                    stackLines.push(line.trim());
                }
            }
        }
    }

    if (stackLines.length === 0) {
        // Fallback: buscar menções genéricas de stack
        return `## Stack Definida (Arquitetura)\n> Consulte o documento de Arquitetura para a stack completa.`;
    }

    return `## Stack Definida (Arquitetura)\n${stackLines.join('\n')}`;
}

/**
 * Extrai resumo de user stories relevantes do backlog.
 */
function extractRelevantStoriesSummary(backlogContent: string | null, faseNome: string): string {
    if (!backlogContent) return '## 📋 User Stories\n> ⚠️ Backlog não encontrado.';

    const lines = backlogContent.split('\n');
    const stories: string[] = [];
    const fase = faseNome.toLowerCase();

    for (const line of lines) {
        const match = line.match(/\|\s*(US-\d+)\s*\|\s*(.+?)\s*\|\s*(\S+)\s*\|\s*\S*\s*\|\s*(\d+)\s*pts?\s*\|/);
        if (match) {
            const [, id, desc, tipo, pts] = match;
            const tipoLower = tipo.toLowerCase();
            const isRelevant =
                (fase.includes('frontend') && tipoLower.includes('fe')) ||
                (fase.includes('backend') && tipoLower.includes('be')) ||
                (fase.includes('integra') && (tipoLower.includes('integra') || tipoLower.includes('fe+be'))) ||
                (!fase.includes('frontend') && !fase.includes('backend') && !fase.includes('integra'));

            if (isRelevant) {
                stories.push(`| ${id} | ${desc.trim().substring(0, 60)} | ${tipo} | ${pts}pts |`);
            }
        }
    }

    if (stories.length === 0) return '## 📋 User Stories\n> Nenhuma US específica encontrada para esta fase.';

    return `## 📋 User Stories para ${faseNome}\n\n| ID | Descrição | Tipo | Pts |\n|---|---|---|---|\n${stories.join('\n')}`;
}

/**
 * Extrai resumo de endpoints do OpenAPI.
 */
function extractEndpointsSummary(openApiContent: string | null, faseNome: string): string {
    if (!openApiContent) return '';

    const fase = faseNome.toLowerCase();
    const lines = openApiContent.split('\n');
    const endpoints: string[] = [];
    let currentPath = '';

    for (const line of lines) {
        const pathMatch = line.match(/^  (\/\S+):$/);
        if (pathMatch) { currentPath = pathMatch[1]; continue; }
        const methodMatch = line.match(/^\s{4}(get|post|put|delete|patch):$/);
        if (methodMatch && currentPath) {
            endpoints.push(`\`${methodMatch[1].toUpperCase()} ${currentPath}\``);
        }
    }

    if (endpoints.length === 0) return '';

    const verb = fase.includes('frontend') ? 'consumir' : fase.includes('backend') ? 'implementar' : 'integrar';
    return `## 🔗 Endpoints para ${verb}\n${endpoints.join(' · ')}`;
}

/**
 * Gera menções de arquivo para documentos relevantes à fase.
 */
function buildRelevantMentions(
    estado: EstadoProjeto,
    diretorio: string,
    faseNome: string,
    ide: 'windsurf' | 'cursor' | 'antigravity'
): string {
    const mencoes: string[] = [];
    const entregaveis = estado.entregaveis || {};
    const fase = faseNome.toLowerCase();

    // Documentos sempre relevantes para código
    const relevantKeys = ['backlog', 'api', 'contrato', 'arquitetura'];
    if (fase.includes('frontend')) relevantKeys.push('design', 'ux');
    if (fase.includes('backend')) relevantKeys.push('banco', 'dominio', 'modelo', 'seguranca');
    if (fase.includes('integra')) relevantKeys.push('testes');

    for (const [key, absPath] of Object.entries(entregaveis)) {
        const kl = key.toLowerCase();
        const pl = (absPath as string).toLowerCase();
        if (relevantKeys.some(rk => kl.includes(rk) || pl.includes(rk))) {
            const relPath = (absPath as string)
                .replace(diretorio.replace(/\\/g, '/'), '')
                .replace(diretorio, '')
                .replace(/^[\\/]+/, '');
            mencoes.push(`- ${formatMention(relPath.replace(/\\/g, '/'), ide)}`);
        }
    }

    return mencoes.length > 0 ? mencoes.join('\n') : '> Nenhum documento de referência encontrado.';
}

/**
 * Escaneia arquivos de código criados no projeto.
 */
function scanProjectFiles(diretorio: string, faseNome: string): string[] {
    const fase = faseNome.toLowerCase();
    const files: string[] = [];

    const dirsToScan = [];
    if (fase.includes('frontend')) dirsToScan.push('frontend', 'src', 'app', 'pages', 'components');
    if (fase.includes('backend')) dirsToScan.push('backend', 'server', 'api', 'src');
    if (fase.includes('integra')) dirsToScan.push('tests', 'e2e', '__tests__');

    for (const dir of dirsToScan) {
        const fullPath = join(diretorio, dir);
        if (existsSync(fullPath)) {
            files.push(dir + '/');
        }
    }

    return files;
}

function createEmptyManifest(fase: number, nome: string): CodeManifest {
    return {
        fase,
        nome,
        stack: { framework: '', language: 'TypeScript' },
        user_stories: [],
        tasks_total: 0,
        tasks_done: 0,
        arquivos_criados: [],
        timestamp: new Date().toISOString(),
    };
}

/**
 * v9.0 Sprint 4: Extrai stack estruturada da arquitetura para o manifest.
 */
function extractStackForManifest(
    arquiteturaContent: string | null,
    faseNome: string
): CodeManifest['stack'] {
    if (!arquiteturaContent) return { framework: '', language: 'TypeScript' };

    const fase = faseNome.toLowerCase();
    const content = arquiteturaContent.toLowerCase();
    const extras: string[] = [];
    let framework = '';
    let language = 'TypeScript';

    if (fase.includes('frontend')) {
        if (content.includes('next.js') || content.includes('nextjs')) framework = 'Next.js';
        else if (content.includes('react')) framework = 'React';
        else if (content.includes('vue')) framework = 'Vue.js';
        else if (content.includes('angular')) framework = 'Angular';
        if (content.includes('tailwind')) extras.push('Tailwind');
        if (content.includes('shadcn')) extras.push('shadcn/ui');
        if (content.includes('zustand')) extras.push('Zustand');
        if (content.includes('react query') || content.includes('tanstack')) extras.push('React Query');
    } else if (fase.includes('backend')) {
        if (content.includes('express')) framework = 'Express';
        else if (content.includes('fastify')) framework = 'Fastify';
        else if (content.includes('nestjs') || content.includes('nest.js')) framework = 'NestJS';
        if (content.includes('prisma')) extras.push('Prisma');
        if (content.includes('postgresql') || content.includes('postgres')) extras.push('PostgreSQL');
        if (content.includes('redis')) extras.push('Redis');
        if (content.includes('jwt')) extras.push('JWT');
    } else if (fase.includes('integra')) {
        if (content.includes('playwright')) framework = 'Playwright';
        else if (content.includes('cypress')) framework = 'Cypress';
        if (content.includes('docker')) extras.push('Docker');
    } else if (fase.includes('deploy')) {
        if (content.includes('docker')) framework = 'Docker';
        if (content.includes('github actions')) extras.push('GitHub Actions');
        if (content.includes('aws')) extras.push('AWS');
    }

    if (content.includes('javascript') && !content.includes('typescript')) language = 'JavaScript';
    if (content.includes('python')) language = 'Python';
    if (content.includes('java') && !content.includes('javascript')) language = 'Java';

    return { framework, language, extras: extras.length > 0 ? extras : undefined };
}

/**
 * v9.0 Sprint 4: Popula manifest.user_stories a partir das tasks do estado.
 * Mapeia tasks com parent_id (stories) para CodeManifestStory.
 */
function populateManifestUserStories(
    manifest: CodeManifest,
    tasks: import('../services/task-decomposer.service.js').TaskItem[],
    faseNumero: number
): void {
    const phaseTasks = tasks.filter(t => t.phase === faseNumero);
    const stories = phaseTasks.filter(t => t.type === 'story');

    manifest.user_stories = stories.map(story => {
        // Extrair ID da US do título (ex: "US-020: CRUD Produtos")
        const idMatch = story.title.match(/US-\d+/i);
        const id = idMatch ? idMatch[0] : story.id;

        // Verificar status das sub-tasks
        const childTasks = phaseTasks.filter(t => t.parent_id === story.id);
        const allDone = childTasks.length > 0 && childTasks.every(t => t.status === 'done');
        const anyInProgress = childTasks.some(t => t.status === 'in_progress');

        // Coletar arquivos das sub-tasks
        const arquivos = childTasks
            .flatMap(t => t.metadata?.files || [])
            .filter(Boolean);

        return {
            id,
            titulo: story.title.replace(/^US-\d+:\s*/i, ''),
            status: allDone ? 'done' as const : anyInProgress ? 'in_progress' as const : 'todo' as const,
            arquivos,
        };
    });
}

function generateSummaryMarkdown(
    manifest: CodeManifest,
    faseInfo: { nome: string },
    progress: { total: number; done: number; percentage: number }
): string {
    // v9.0 Sprint 4: Stack info
    const stackMd = manifest.stack?.framework
        ? `## Stack\n- **Framework:** ${manifest.stack.framework}\n- **Language:** ${manifest.stack.language}${manifest.stack.extras ? `\n- **Extras:** ${manifest.stack.extras.join(', ')}` : ''}\n`
        : '';

    // v9.0 Sprint 4: Tabela rastreável US → arquivos → status
    let traceabilityMd = '';
    if (manifest.user_stories.length > 0) {
        traceabilityMd = `## Rastreabilidade US → Código\n\n| US | Título | Status | Arquivos |\n|----|--------|--------|----------|\n`;
        for (const story of manifest.user_stories) {
            const icon = story.status === 'done' ? '✅' : story.status === 'in_progress' ? '🔄' : '⏳';
            const arquivos = story.arquivos.length > 0
                ? story.arquivos.slice(0, 3).map(f => `\`${f}\``).join(', ') + (story.arquivos.length > 3 ? ` (+${story.arquivos.length - 3})` : '')
                : '—';
            traceabilityMd += `| ${story.id} | ${story.titulo.substring(0, 50)} | ${icon} ${story.status} | ${arquivos} |\n`;
        }
        const doneCount = manifest.user_stories.filter(s => s.status === 'done').length;
        traceabilityMd += `\n> **US Concluídas:** ${doneCount}/${manifest.user_stories.length}\n`;
    } else {
        traceabilityMd = `## User Stories\n(geradas via TaskDecomposer)\n`;
    }

    return `# ${faseInfo.nome} — Resumo de Implementação\n\n## Progresso\n- **Tasks:** ${progress.done}/${progress.total} (${progress.percentage}%)\n- **Arquivos criados:** ${manifest.arquivos_criados.length}\n\n${stackMd}\n${traceabilityMd}\n## Arquivos Criados\n${manifest.arquivos_criados.map(f => `- \`${f}\``).join('\n') || '(nenhum registrado)'}\n\n## Timestamp\n${manifest.timestamp}\n`;
}

function getExpertiseForPhase(faseNome: string): string[] {
    const fase = faseNome.toLowerCase();
    if (fase.includes('frontend')) return ['React', 'Next.js', 'TypeScript', 'componentes', 'responsividade', 'acessibilidade'];
    if (fase.includes('backend')) return ['Node.js', 'Express', 'REST API', 'banco de dados', 'autenticação', 'testes'];
    if (fase.includes('integra')) return ['E2E testing', 'CORS', 'CI/CD', 'Docker', 'monitoramento'];
    if (fase.includes('deploy')) return ['DevOps', 'CI/CD', 'AWS', 'Docker', 'monitoramento', 'deploy'];
    return ['desenvolvimento', 'arquitetura', 'testes'];
}

/**
 * Delega para proximo.ts para avançar fase.
 * 
 * v10.0 FIX: Quando code-validator já aprovou (codeState.status === 'completed'),
 * passa skip_validation=true para pular a re-validação textual redundante
 * em proximo.ts (validateDeliverableForGate). Antes, o code-validator fazia
 * validação por artefatos reais e depois proximo.ts re-validava por keywords,
 * potencialmente contradizendo o score.
 */
async function delegateToProximo(args: CodePhaseArgs): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const codeState = (estado as any).codePhaseState as CodePhaseState | undefined;
    const manifest = codeState?.manifest;

    // Gerar entregável textual a partir do manifest (usado para resumo, não validação)
    const entregavelTexto = manifest
        ? generateSummaryMarkdown(manifest, { nome: codeState?.faseNome || '' }, getTaskProgress(estado.tasks || [], estado.fase_atual))
        : 'Fase de código concluída. Manifest não gerado.';

    // v10.0: Se code-validator já aprovou, pular validação textual redundante
    const skipValidation = codeState?.status === 'completed';

    const { proximo } = await import("../tools/proximo.js");
    return proximo({
        diretorio,
        estado_json: serializarEstado(estado).content,
        entregavel: entregavelTexto,
        skip_validation: skipValidation,
    });
}
