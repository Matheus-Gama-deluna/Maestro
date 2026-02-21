import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startFileWatcher, stopFileWatcher, getActiveWatcherCount } from '../services/watcher.service.js';

// Mock chokidar
vi.mock('chokidar', () => {
    const watchers = new Map();
    return {
        default: {
            watch: vi.fn((filePath) => {
                const watcher = {
                    on: vi.fn((event, cb) => {
                        if (!watchers.has(filePath)) watchers.set(filePath, {});
                        watchers.get(filePath)[event] = cb;
                        return watcher;
                    }),
                    close: vi.fn(),
                    // Helper para simular eventos nos testes
                    __emit: (event: string, ...args: any[]) => {
                        if (watchers.get(filePath)?.[event]) {
                            watchers.get(filePath)[event](...args);
                        }
                    }
                };
                // Salvar o watcher instanciado para acesso no teste
                watchers.set(filePath + '_instance', watcher);
                return watcher;
            }),
            __getWatchers: () => watchers
        }
    };
});

// Mock fs/promises
vi.mock('fs/promises', () => ({
    readFile: vi.fn().mockResolvedValue('# Produto\n\nMocked PRD content for testing.')
}));

// Mock ValidationPipeline
vi.mock('../core/validation/ValidationPipeline.js', () => {
    return {
        ValidationPipeline: class {
            async validateDeliverable() {
                return {
                    overallScore: 85,
                    recommendations: ['Sugestão mockada']
                };
            }
        }
    };
});

describe('WatcherService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Limpar watchers residuais
        stopFileWatcher('/test/dir');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('deve registrar um novo watcher e gerenciar contagem', async () => {
        const onValidationResult = vi.fn();
        
        await startFileWatcher({
            filePath: '/test/dir/PRD.md',
            diretorio: '/test/dir',
            faseNome: 'Produto',
            onValidationResult
        });

        expect(getActiveWatcherCount()).toBe(1);

        stopFileWatcher('/test/dir');
        expect(getActiveWatcherCount()).toBe(0);
    });

    it('deve disparar a validação quando o arquivo mudar respeitando debounce', async () => {
        let resolveValidation: () => void;
        const validationPromise = new Promise<void>(r => resolveValidation = r);

        const onValidationResult = vi.fn().mockImplementation(() => {
            resolveValidation();
        });
        
        await startFileWatcher({
            filePath: '/test/dir/PRD.md',
            diretorio: '/test/dir',
            faseNome: 'Produto',
            onValidationResult
        });

        const chokidar = await import('chokidar');
        const watchersMap = (chokidar.default as any).__getWatchers();
        const watcherInstance = watchersMap.get('/test/dir/PRD.md_instance');
        
        // Simular 3 eventos de change muito rápidos
        watcherInstance.__emit('change');
        watcherInstance.__emit('change');
        watcherInstance.__emit('change');

        // Avançar o tempo apenas 200ms (antes do debounce de 500ms)
        await vi.advanceTimersByTimeAsync(200);
        expect(onValidationResult).not.toHaveBeenCalled();

        // Avançar o tempo além dos 500ms
        await vi.advanceTimersByTimeAsync(350);

        // Aguarda toda a cadeia async (resolve readFile, etc)
        await validationPromise;

        // Deve ter chamado a validação apenas 1 vez debido ao debounce
        expect(onValidationResult).toHaveBeenCalledTimes(1);
        expect(onValidationResult).toHaveBeenCalledWith(
            85,
            'Score: 85/100\nSugestão mockada',
            '/test/dir/PRD.md'
        );
    });

    it('não deve acumular múltiplos watchers para o mesmo diretório', async () => {
        const onValidationResult = vi.fn();
        
        await startFileWatcher({
            filePath: '/test/dir/PRD.md',
            diretorio: '/test/dir',
            faseNome: 'Produto',
            onValidationResult
        });

        // Chamar novamente para o mesmo diretório
        await startFileWatcher({
            filePath: '/test/dir/PRD.md',
            diretorio: '/test/dir',
            faseNome: 'Produto',
            onValidationResult
        });

        expect(getActiveWatcherCount()).toBe(1);
    });
});
