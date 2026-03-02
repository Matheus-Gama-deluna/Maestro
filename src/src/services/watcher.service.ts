/**
 * V6 Sprint 5: Event-Driven Watcher Service
 *
 * Monitora o arquivo de entregável da fase atual em background.
 * Ao detectar um salvamento (evento 'change'), dispara a ValidationPipeline
 * automaticamente — sem que o usuário precise chamar `validar()`.
 *
 * Cuidados:
 * - Debounce de 500ms para evitar múltiplas validações em edições rápidas
 * - Gerenciamento de ciclo de vida: watcher é descartado ao avançar de fase
 * - Usa chokidar (mais robusto que fs.watch nativo no Windows e Mac)
 *
 * IMPORTANTE: Instalar dependência: npm install chokidar --workspace=packages/mcp-server
 */

type ValidationCallback = (score: number, feedback: string, filePath: string) => void;

interface WatcherConfig {
    /** Caminho absoluto do arquivo a ser monitorado */
    filePath: string;
    /** Diretório raiz do projeto Maestro */
    diretorio: string;
    /** Nome da fase atual (para contexto de validação) */
    faseNome: string;
    /** Tier de rigor da validação */
    tier?: 'essencial' | 'base' | 'avancado';
    /** Checklist da fase para validação semântica */
    gateChecklist?: string[];
    /** Callback chamado com o resultado da validação */
    onValidationResult: ValidationCallback;
}

// Mapa de watchers ativos por diretório do projeto
// Chave: diretório, Valor: objeto watcher (FSWatcher do chokidar ou fallback)
const activeWatchers = new Map<string, { close: () => void }>();

/**
 * Inicia o monitoramento de um arquivo de entregável.
 * Se já existe um watcher ativo para este diretório, ele é substituído.
 */
export async function startFileWatcher(config: WatcherConfig): Promise<void> {
    // Parar watcher anterior se existir (evita duplicatas)
    stopFileWatcher(config.diretorio);

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    try {
        // Tentar usar chokidar (mais robusto, cross-platform)
        const chokidar = await import('chokidar');
        const watcher = chokidar.default.watch(config.filePath, {
            persistent: false,       // Não impedir o processo de terminar
            ignoreInitial: true,      // Não disparar na inicialização
            awaitWriteFinish: {       // Aguardar o arquivo terminar de ser escrito
                stabilityThreshold: 200,
                pollInterval: 100,
            },
        });

        watcher.on('change', () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                await runValidation(config);
            }, 500); // Debounce de 500ms
        });

        watcher.on('error', (error: unknown) => {
            console.warn(`[watcher] Erro ao monitorar ${config.filePath}:`, error);
        });

        activeWatchers.set(config.diretorio, { close: () => watcher.close() });
        console.error(`[watcher] Monitorando: ${config.filePath}`);
    } catch {
        // Fallback para fs.watch nativo se chokidar não estiver disponível
        console.warn('[watcher] chokidar não disponível, usando fs.watch nativo como fallback');
        const { watch } = await import('fs');
        const nativeWatcher = watch(config.filePath, { persistent: false }, () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                await runValidation(config);
            }, 500);
        });

        activeWatchers.set(config.diretorio, { close: () => nativeWatcher.close() });
    }
}

/**
 * Para e descarta o watcher ativo para um diretório.
 * Deve ser chamado ao avançar de fase para evitar leaks de file handles.
 */
export function stopFileWatcher(diretorio: string): void {
    const watcher = activeWatchers.get(diretorio);
    if (watcher) {
        watcher.close();
        activeWatchers.delete(diretorio);
        console.error(`[watcher] Monitoramento encerrado para: ${diretorio}`);
    }
}

/**
 * Retorna o número de watchers ativos (útil para debugging e testes).
 */
export function getActiveWatcherCount(): number {
    return activeWatchers.size;
}

/**
 * Executa a validação do entregável e chama o callback com o resultado.
 * Implementação real: integrar com ValidationPipeline.
 */
async function runValidation(config: WatcherConfig): Promise<void> {
    try {
        const { readFile } = await import('fs/promises');
        const content = await readFile(config.filePath, 'utf-8');

        console.error(`[watcher] Arquivo salvo, executando validação: ${config.filePath} (${content.length} chars)`);

        const { ValidationPipeline } = await import('../core/validation/ValidationPipeline.js');
        const pipeline = new ValidationPipeline();

        const tier = config.tier || 'base';
        const gateChecklist = config.gateChecklist || [];

        const result = await pipeline.validateDeliverable(content, config.faseNome, tier, gateChecklist);

        let feedback = `Score: ${result.overallScore}/100`;
        if (result.recommendations && result.recommendations.length > 0) {
            feedback += '\n' + result.recommendations.join('\n');
        }

        config.onValidationResult(
            result.overallScore,
            feedback,
            config.filePath
        );
    } catch (error) {
        console.error('[watcher] Erro ao ler arquivo para validação:', error);
    }
}
