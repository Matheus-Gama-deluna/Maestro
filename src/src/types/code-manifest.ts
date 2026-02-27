/**
 * CodeManifest — Tipo para entregáveis de fases de código (v8.0)
 *
 * O "entregável" de uma fase de código é um manifest JSON que lista
 * os arquivos criados, status das user stories e progresso das tasks.
 *
 * Substitui o conceito de "1 arquivo markdown" por "N arquivos de código".
 *
 * @since v8.0
 */

export interface CodeManifest {
    fase: number;
    nome: string;                        // 'Frontend', 'Backend', 'Integração'
    stack: {
        framework: string;               // 'Next.js 14', 'Express'
        language: string;                 // 'TypeScript'
        extras?: string[];               // ['Tailwind', 'Zustand', 'Prisma']
    };
    user_stories: CodeManifestStory[];
    tasks_total: number;
    tasks_done: number;
    arquivos_criados: string[];          // Paths relativos ao projeto
    timestamp: string;
}

export interface CodeManifestStory {
    id: string;                          // US-020
    titulo: string;
    status: 'done' | 'in_progress' | 'todo';
    arquivos: string[];                  // Paths dos arquivos criados para esta US
}

/**
 * Estado da fase de código no handler.
 * Gerencia o ciclo: SETUP → WORKING → GATE
 */
export type CodePhaseStatus = 'setup' | 'working' | 'gate' | 'completed';

export interface CodePhaseState {
    status: CodePhaseStatus;
    faseNumero: number;
    faseNome: string;
    tasksGenerated: boolean;
    currentTaskIndex: number;
    manifest?: CodeManifest;
    setupAnswers?: Record<string, unknown>;
    startedAt: string;
    updatedAt: string;
}
