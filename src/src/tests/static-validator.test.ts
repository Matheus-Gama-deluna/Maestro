// src/src/tests/static-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateTypeScript } from '../services/static-validator.service.js';

describe('StaticValidator', () => {
    it('valida código TypeScript correto', async () => {
        const code = `
import { join } from 'path';
export { join };

export function hello(name: string): string {
    return \`Hello, \${name}!\`;
}
`;
        const result = await validateTypeScript(code);
        expect(result.valid).toBe(true);
        expect(result.stats.imports).toBe(1);
        expect(result.stats.exports).toBeGreaterThanOrEqual(1); // ExportDeclaration: export { join }
        expect(result.stats.anyCount).toBe(0);
    });

    it('detecta uso de any', async () => {
        const code = `
export function process(data: any): any {
    return data;
}
`;
        const result = await validateTypeScript(code);
        expect(result.stats.anyCount).toBeGreaterThan(0);
    });

    it('conta linhas corretamente', async () => {
        const code = 'line1\nline2\nline3\n';
        const result = await validateTypeScript(code);
        expect(result.stats.totalLines).toBe(4); // Inclui última linha vazia
    });

    it('retorna valid=true para string vazia (best-effort)', async () => {
        const result = await validateTypeScript('');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('conta múltiplos imports', async () => {
        const code = `
import { join } from 'path';
import { readFile } from 'fs/promises';
import type { EstadoProjeto } from './types.js';

export const VERSION = '1.0.0';
`;
        const result = await validateTypeScript(code);
        expect(result.stats.imports).toBe(3);
    });

    it('retorna objeto com estrutura correta', async () => {
        const result = await validateTypeScript('const x = 1;');
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('stats');
        expect(result.stats).toHaveProperty('totalLines');
        expect(result.stats).toHaveProperty('imports');
        expect(result.stats).toHaveProperty('exports');
        expect(result.stats).toHaveProperty('anyCount');
        expect(Array.isArray(result.errors)).toBe(true);
    });
});
