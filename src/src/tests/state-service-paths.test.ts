// src/src/tests/state-service-paths.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createStateService } from '../services/state.service.js';

describe('StateService — paths Windows/POSIX', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'maestro-test-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('saveFile cria subdiretórios automaticamente', async () => {
        const svc = createStateService(tempDir);
        const result = await svc.saveFile('docs/01-produto/PRD.md', '# PRD\nConteúdo');
        expect(result).toBe(true);

        const content = await readFile(join(tempDir, 'docs', '01-produto', 'PRD.md'), 'utf-8');
        expect(content).toContain('# PRD');
    });

    it('saveFile funciona com path simples sem subdiretório', async () => {
        const svc = createStateService(tempDir);
        const result = await svc.saveFile('arquivo.md', 'conteúdo simples');
        expect(result).toBe(true);

        const content = await readFile(join(tempDir, 'arquivo.md'), 'utf-8');
        expect(content).toBe('conteúdo simples');
    });

    it('saveFile funciona com path de 3 níveis de profundidade', async () => {
        const svc = createStateService(tempDir);
        const result = await svc.saveFile('a/b/c/deep.txt', 'conteúdo profundo');
        expect(result).toBe(true);

        const content = await readFile(join(tempDir, 'a', 'b', 'c', 'deep.txt'), 'utf-8');
        expect(content).toBe('conteúdo profundo');
    });

    it('saveFile retorna true quando consegue criar o arquivo', async () => {
        const svc = createStateService(tempDir);
        const result = await svc.saveFile('novo/caminho/arquivo.md', 'conteúdo de teste');
        expect(result).toBe(true);
    });

    it('saveFiles salva múltiplos arquivos', async () => {
        const svc = createStateService(tempDir);
        const saved = await svc.saveFiles([
            { path: 'a/file1.md', content: 'content1' },
            { path: 'b/file2.md', content: 'content2' },
        ]);
        expect(saved).toBe(2);

        const c1 = await readFile(join(tempDir, 'a', 'file1.md'), 'utf-8');
        const c2 = await readFile(join(tempDir, 'b', 'file2.md'), 'utf-8');
        expect(c1).toBe('content1');
        expect(c2).toBe('content2');
    });

    it('saveFiles retorna quantidade de arquivos salvos com sucesso', async () => {
        const svc = createStateService(tempDir);
        const saved = await svc.saveFiles([
            { path: 'ok/file.md', content: 'ok' },
        ]);
        expect(saved).toBe(1);
    });
});
