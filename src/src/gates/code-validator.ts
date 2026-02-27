/**
 * CodeValidator — Validação de fases de código orientada a artefatos (v9.0)
 *
 * Em vez de buscar keywords em texto markdown, valida por:
 * 1. Existência de arquivos no disco (50% do score)
 * 2. Progresso de tasks/user stories (30% do score)
 * 3. Manifest gerado corretamente (20% do score)
 *
 * Fallback textual mantido como contingência quando manifest não existe.
 *
 * @since v9.0
 */

import { existsSync } from "fs";
import { join } from "path";
import type { CodeManifest } from "../types/code-manifest.js";
import type { TaskItem } from "../services/task-decomposer.service.js";

export interface CodeValidationResult {
    score: number;
    approved: boolean;
    breakdown: {
        arquivos: number;
        tasks: number;
        manifest: number;
    };
    details: {
        arquivos_encontrados: string[];
        arquivos_faltando: string[];
        tasks_done: number;
        tasks_total: number;
        user_stories_cobertas: string[];
        user_stories_pendentes: string[];
    };
    feedback: string[];
}

/** Peso de cada componente do score */
const WEIGHTS = {
    arquivos: 0.50,
    tasks: 0.30,
    manifest: 0.20,
};

/** Threshold para aprovação automática */
const SCORE_AUTO_APPROVE = 70;

/**
 * Valida uma fase de código usando manifest + artefatos reais no disco.
 *
 * @param manifest - CodeManifest gerado pelo code-phase-handler
 * @param diretorio - Diretório raiz do projeto
 * @param tasks - Tasks da fase atual (do estado.tasks)
 * @param faseNumero - Número da fase
 * @returns CodeValidationResult com score, breakdown e detalhes
 */
export function validateCodePhase(
    manifest: CodeManifest | undefined,
    diretorio: string,
    tasks: TaskItem[],
    faseNumero: number
): CodeValidationResult {
    const feedback: string[] = [];

    // Se não tem manifest, retornar score mínimo com feedback
    if (!manifest) {
        feedback.push("Manifest não encontrado. Gere o manifest completando as tasks da fase.");
        return {
            score: 0,
            approved: false,
            breakdown: { arquivos: 0, tasks: 0, manifest: 0 },
            details: {
                arquivos_encontrados: [],
                arquivos_faltando: [],
                tasks_done: 0,
                tasks_total: 0,
                user_stories_cobertas: [],
                user_stories_pendentes: [],
            },
            feedback,
        };
    }

    // 1. Verificar existência de arquivos (50%)
    const { arquivosScore, encontrados, faltando } = scoreArquivos(manifest, diretorio);

    // 2. Verificar progresso de tasks (30%)
    const { tasksScore, done, total } = scoreTasks(tasks, faseNumero);

    // 3. Verificar manifest (20%)
    const { manifestScore, storyCobertas, storyPendentes } = scoreManifest(manifest);

    // Calcular score final ponderado
    const score = Math.round(
        arquivosScore * WEIGHTS.arquivos +
        tasksScore * WEIGHTS.tasks +
        manifestScore * WEIGHTS.manifest
    );

    // Gerar feedback
    if (faltando.length > 0) {
        feedback.push(`Arquivos faltando no disco: ${faltando.slice(0, 5).join(', ')}${faltando.length > 5 ? ` (+${faltando.length - 5} mais)` : ''}`);
    }
    if (done < total) {
        feedback.push(`Tasks pendentes: ${total - done}/${total}`);
    }
    if (storyPendentes.length > 0) {
        feedback.push(`User Stories não cobertas: ${storyPendentes.join(', ')}`);
    }
    if (score >= SCORE_AUTO_APPROVE) {
        feedback.push("Gate de código aprovado automaticamente.");
    } else if (score >= 50) {
        feedback.push("Score entre 50-69: aprovação manual necessária.");
    } else {
        feedback.push("Score abaixo de 50: bloqueado. Complete mais tasks e gere os arquivos.");
    }

    return {
        score,
        approved: score >= SCORE_AUTO_APPROVE,
        breakdown: {
            arquivos: Math.round(arquivosScore),
            tasks: Math.round(tasksScore),
            manifest: Math.round(manifestScore),
        },
        details: {
            arquivos_encontrados: encontrados,
            arquivos_faltando: faltando,
            tasks_done: done,
            tasks_total: total,
            user_stories_cobertas: storyCobertas,
            user_stories_pendentes: storyPendentes,
        },
        feedback,
    };
}

/**
 * Formata o resultado da validação como markdown para exibição.
 */
export function formatCodeValidationResult(result: CodeValidationResult, faseNome: string): string {
    const icon = result.approved ? '✅' : result.score >= 50 ? '⚠️' : '❌';
    const status = result.approved ? 'Aprovado' : result.score >= 50 ? 'Aprovação Manual Necessária' : 'Bloqueado';

    let md = `## ${icon} Gate de Código: ${faseNome} — ${status}\n\n`;
    md += `### Score: ${result.score}/100\n\n`;
    md += `| Componente | Score | Peso |\n`;
    md += `|-----------|-------|------|\n`;
    md += `| Arquivos no disco | ${result.breakdown.arquivos}/100 | 50% |\n`;
    md += `| Tasks concluídas | ${result.breakdown.tasks}/100 | 30% |\n`;
    md += `| Manifest/US | ${result.breakdown.manifest}/100 | 20% |\n\n`;

    if (result.details.arquivos_encontrados.length > 0) {
        md += `### Arquivos Encontrados (${result.details.arquivos_encontrados.length})\n`;
        md += result.details.arquivos_encontrados.slice(0, 10).map(f => `- ✅ \`${f}\``).join('\n') + '\n\n';
    }

    if (result.details.arquivos_faltando.length > 0) {
        md += `### Arquivos Faltando (${result.details.arquivos_faltando.length})\n`;
        md += result.details.arquivos_faltando.slice(0, 10).map(f => `- ❌ \`${f}\``).join('\n') + '\n\n';
    }

    if (result.details.tasks_total > 0) {
        md += `### Tasks: ${result.details.tasks_done}/${result.details.tasks_total}\n\n`;
    }

    if (result.details.user_stories_cobertas.length > 0) {
        md += `### User Stories Cobertas\n`;
        md += result.details.user_stories_cobertas.map(s => `- ✅ ${s}`).join('\n') + '\n\n';
    }

    if (result.details.user_stories_pendentes.length > 0) {
        md += `### User Stories Pendentes\n`;
        md += result.details.user_stories_pendentes.map(s => `- ⏳ ${s}`).join('\n') + '\n\n';
    }

    if (result.feedback.length > 0) {
        md += `### Feedback\n`;
        md += result.feedback.map(f => `> ${f}`).join('\n') + '\n';
    }

    return md;
}

// === SCORE HELPERS ===

function scoreArquivos(
    manifest: CodeManifest,
    diretorio: string
): { arquivosScore: number; encontrados: string[]; faltando: string[] } {
    const arquivos = manifest.arquivos_criados || [];

    if (arquivos.length === 0) {
        // Sem arquivos listados — tentar detectar diretórios relevantes
        const fase = manifest.nome.toLowerCase();
        const dirsToCheck = getDirsForPhase(fase);
        const found: string[] = [];

        for (const dir of dirsToCheck) {
            const fullPath = join(diretorio, dir);
            if (existsSync(fullPath)) {
                found.push(dir + '/');
            }
        }

        // Se encontrou pelo menos um diretório relevante, dar score parcial
        return {
            arquivosScore: found.length > 0 ? Math.min(found.length * 25, 80) : 0,
            encontrados: found,
            faltando: dirsToCheck.filter(d => !found.includes(d + '/')).map(d => d + '/'),
        };
    }

    const encontrados: string[] = [];
    const faltando: string[] = [];

    for (const arquivo of arquivos) {
        // Tentar path absoluto primeiro, depois relativo ao projeto
        const absPath = arquivo.startsWith('/') || arquivo.match(/^[A-Z]:/) ? arquivo : join(diretorio, arquivo);
        if (existsSync(absPath)) {
            encontrados.push(arquivo);
        } else {
            faltando.push(arquivo);
        }
    }

    const total = arquivos.length;
    const arquivosScore = total > 0 ? (encontrados.length / total) * 100 : 0;

    return { arquivosScore, encontrados, faltando };
}

function scoreTasks(
    tasks: TaskItem[],
    faseNumero: number
): { tasksScore: number; done: number; total: number } {
    const phaseTasks = tasks.filter(
        t => t.phase === faseNumero && (t.type === 'task' || t.type === 'subtask')
    );

    const done = phaseTasks.filter(t => t.status === 'done').length;
    const total = phaseTasks.length;

    // Se não tem tasks definidas, dar score neutro (não penalizar)
    const tasksScore = total > 0 ? (done / total) * 100 : 50;

    return { tasksScore, done, total };
}

function scoreManifest(
    manifest: CodeManifest
): { manifestScore: number; storyCobertas: string[]; storyPendentes: string[] } {
    let score = 0;
    const storyCobertas: string[] = [];
    const storyPendentes: string[] = [];

    // Manifest existe — 40 pontos base
    score += 40;

    // Stack preenchida — 20 pontos
    if (manifest.stack?.framework && manifest.stack.framework.length > 0) {
        score += 20;
    }

    // User stories com status — 40 pontos
    const stories = manifest.user_stories || [];
    if (stories.length > 0) {
        const doneStories = stories.filter(s => s.status === 'done');
        storyCobertas.push(...doneStories.map(s => `${s.id}: ${s.titulo}`));
        storyPendentes.push(
            ...stories.filter(s => s.status !== 'done').map(s => `${s.id}: ${s.titulo}`)
        );
        const storyRatio = doneStories.length / stories.length;
        score += Math.round(storyRatio * 40);
    } else {
        // Sem US definidas — dar pontos parciais se tem tasks_done
        if (manifest.tasks_done > 0 && manifest.tasks_total > 0) {
            score += Math.round((manifest.tasks_done / manifest.tasks_total) * 40);
        }
    }

    return { manifestScore: Math.min(score, 100), storyCobertas, storyPendentes };
}

function getDirsForPhase(faseNomeLower: string): string[] {
    if (faseNomeLower.includes('frontend')) {
        return ['frontend', 'src', 'app', 'pages', 'components'];
    }
    if (faseNomeLower.includes('backend')) {
        return ['backend', 'server', 'api', 'src'];
    }
    if (faseNomeLower.includes('integra')) {
        return ['tests', 'e2e', '__tests__'];
    }
    if (faseNomeLower.includes('deploy')) {
        return ['.github', 'docker', 'infra', 'scripts'];
    }
    return [];
}
