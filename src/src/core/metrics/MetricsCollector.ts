/**
 * Metrics Collector — v6.3 S4.2
 * Coleta métricas REAIS baseadas nos arquivos do projeto
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { EstadoProjeto } from '../../types/index.js';

export interface QualityMetrics {
    // Métricas de entregáveis
    entregaveisGerados: number;
    totalFases: number;
    progressoPercent: number;

    // Métricas de documentação
    docsEncontrados: number;
    adrsEncontrados: number;
    templatesUsados: number;

    // Métricas de código (se existir src/)
    arquivosCodigo: number;
    arquivosTeste: number;
    ratioTestesCodigo: number;

    // Score composto (0-100)
    scoreDocumentacao: number;
    scoreEntregaveis: number;
    scoreGeral: number;

    timestamp: string;
}

export interface MetricTrend {
    date: string;
    metric: string;
    value: number;
}

const METRICS_FILE = '.maestro/metrics.json';
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.maestro']);

export class MetricsCollector {

    /**
     * v6.3 S4.2: Coleta métricas reais do projeto
     */
    async collect(projectPath: string, estado?: EstadoProjeto): Promise<QualityMetrics> {
        const [docsInfo, codeInfo, adrsCount] = await Promise.all([
            this.analisarDocs(projectPath),
            this.analisarCodigo(projectPath),
            this.contarADRs(projectPath),
        ]);

        const entregaveisGerados = estado ? Object.keys(estado.entregaveis).length : 0;
        const totalFases = estado?.total_fases ?? 1;
        const progressoPercent = Math.round((entregaveisGerados / totalFases) * 100);

        // Score de documentação: docs + ADRs
        const scoreDocumentacao = Math.min(100, Math.round(
            (docsInfo.count / Math.max(1, totalFases)) * 60 +
            Math.min(40, adrsCount * 8)
        ));

        // Score de entregáveis: % de fases com entregável
        const scoreEntregaveis = progressoPercent;

        // Score geral: média ponderada
        const scoreGeral = Math.round(
            scoreDocumentacao * 0.4 +
            scoreEntregaveis * 0.4 +
            Math.min(20, codeInfo.ratioTestesCodigo * 20) * 0.2
        );

        const metrics: QualityMetrics = {
            entregaveisGerados,
            totalFases,
            progressoPercent,
            docsEncontrados: docsInfo.count,
            adrsEncontrados: adrsCount,
            templatesUsados: docsInfo.templates,
            arquivosCodigo: codeInfo.codigo,
            arquivosTeste: codeInfo.testes,
            ratioTestesCodigo: codeInfo.ratioTestesCodigo,
            scoreDocumentacao,
            scoreEntregaveis,
            scoreGeral,
            timestamp: new Date().toISOString(),
        };

        // Persistir no histórico (best-effort)
        await this.persistir(projectPath, metrics).catch(() => {});

        return metrics;
    }

    /**
     * Retorna tendência dos últimos N dias
     */
    async getTrends(projectPath: string, days: number = 30): Promise<MetricTrend[]> {
        try {
            const filePath = path.join(projectPath, METRICS_FILE);
            const raw = await fs.readFile(filePath, 'utf-8');
            const history: QualityMetrics[] = JSON.parse(raw);

            const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
            return history
                .filter(m => new Date(m.timestamp).getTime() > cutoff)
                .flatMap(m => [
                    { date: m.timestamp, metric: 'scoreGeral', value: m.scoreGeral },
                    { date: m.timestamp, metric: 'progressoPercent', value: m.progressoPercent },
                    { date: m.timestamp, metric: 'scoreDocumentacao', value: m.scoreDocumentacao },
                ]);
        } catch {
            return [];
        }
    }

    // ─── Helpers privados ────────────────────────────────────────────────────

    private async analisarDocs(projectPath: string): Promise<{ count: number; templates: number }> {
        const docsDir = path.join(projectPath, 'docs');
        let count = 0;
        let templates = 0;
        try {
            const entries = await fs.readdir(docsDir, { withFileTypes: true, recursive: true } as any);
            for (const e of entries as any[]) {
                if (e.isFile?.() && (e.name.endsWith('.md') || e.name.endsWith('.mdx'))) {
                    count++;
                    if (e.name.toLowerCase().includes('template')) templates++;
                }
            }
        } catch { /* docs/ pode não existir */ }
        return { count, templates };
    }

    private async contarADRs(projectPath: string): Promise<number> {
        const adrsDir = path.join(projectPath, '.maestro', 'adrs');
        try {
            const files = await fs.readdir(adrsDir);
            return files.filter(f => f.endsWith('.md') && f !== 'INDEX.md').length;
        } catch {
            return 0;
        }
    }

    private async analisarCodigo(projectPath: string): Promise<{
        codigo: number;
        testes: number;
        ratioTestesCodigo: number;
    }> {
        let codigo = 0;
        let testes = 0;

        const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.cs']);
        const TEST_PATTERNS = ['.test.', '.spec.', '_test.', '__tests__'];

        try {
            await this.walkDir(projectPath, (filePath) => {
                const ext = path.extname(filePath);
                if (!CODE_EXTS.has(ext)) return;

                const name = path.basename(filePath);
                const isTeste = TEST_PATTERNS.some(p => name.includes(p)) ||
                    filePath.includes(`${path.sep}test${path.sep}`) ||
                    filePath.includes(`${path.sep}tests${path.sep}`) ||
                    filePath.includes(`${path.sep}__tests__${path.sep}`);
                if (isTeste) testes++;
                else codigo++;
            });
        } catch { /* best-effort */ }

        const ratioTestesCodigo = codigo > 0 ? Math.min(1, testes / codigo) : 0;
        return { codigo, testes, ratioTestesCodigo };
    }

    private async walkDir(dir: string, callback: (filePath: string) => void): Promise<void> {
        let entries: any[];
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch { return; }

        for (const entry of entries) {
            if (IGNORED_DIRS.has(entry.name)) continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await this.walkDir(full, callback);
            } else if (entry.isFile()) {
                callback(full);
            }
        }
    }

    private async persistir(projectPath: string, metrics: QualityMetrics): Promise<void> {
        const filePath = path.join(projectPath, METRICS_FILE);
        let history: QualityMetrics[] = [];
        try {
            const raw = await fs.readFile(filePath, 'utf-8');
            history = JSON.parse(raw);
        } catch { /* arquivo não existe ainda */ }

        history.push(metrics);
        // Manter apenas últimas 90 entradas (~3 meses se coletado diariamente)
        if (history.length > 90) history = history.slice(-90);

        await fs.writeFile(filePath, JSON.stringify(history, null, 2), 'utf-8');
    }
}
