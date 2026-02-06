/**
 * Testes para ContentResolverService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentResolverService } from '../services/content-resolver.service.js';
import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

// Mock fs modules
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    return {
        ...actual,
        existsSync: vi.fn(),
    };
});

vi.mock('fs/promises', async () => {
    const actual = await vi.importActual('fs/promises');
    return {
        ...actual,
        readFile: vi.fn(),
        readdir: vi.fn(),
    };
});

const mockExistsSync = vi.mocked(existsSync);
const mockReadFile = vi.mocked(readFile);
const mockReaddir = vi.mocked(readdir);

describe('ContentResolverService', () => {
    let service: ContentResolverService;
    const testDir = '/test/project';

    beforeEach(() => {
        vi.clearAllMocks();
        // Default: server content exists, project content does not
        mockExistsSync.mockImplementation((path: any) => {
            const pathStr = String(path);
            if (pathStr.includes('.maestro/content')) return false;
            if (pathStr.includes('content')) return true;
            return false;
        });
        service = new ContentResolverService(testDir);
    });

    describe('hasProjectContent', () => {
        it('deve retornar false quando .maestro/content não existe', () => {
            mockExistsSync.mockImplementation((path: any) => {
                return !String(path).includes('.maestro');
            });
            const svc = new ContentResolverService(testDir);
            expect(svc.hasProjectContent()).toBe(false);
        });

        it('deve retornar true quando .maestro/content existe', () => {
            mockExistsSync.mockImplementation(() => true);
            const svc = new ContentResolverService(testDir);
            expect(svc.hasProjectContent()).toBe(true);
        });
    });

    describe('getSkillDir', () => {
        it('deve priorizar projeto local quando disponível', () => {
            mockExistsSync.mockImplementation((path: any) => {
                const p = String(path);
                // .maestro/content deve existir E a skill dentro dele também
                if (p.includes('.maestro') && p.includes('content')) return true;
                return false;
            });

            const svc = new ContentResolverService(testDir);
            const dir = svc.getSkillDir('specialist-arquitetura');
            expect(dir).not.toBeNull();
            expect(dir!).toContain('.maestro');
            expect(dir!).toContain('specialist-arquitetura');
        });

        it('deve usar servidor como fallback', () => {
            mockExistsSync.mockImplementation((path: any) => {
                const p = String(path);
                if (p.includes('.maestro')) return false;
                if (p.includes('content/skills/specialist-arquitetura')) return true;
                if (p.includes('content')) return true;
                return false;
            });

            const svc = new ContentResolverService(testDir);
            const dir = svc.getSkillDir('specialist-arquitetura');
            expect(dir).not.toBeNull();
            expect(dir).not.toContain('.maestro');
        });

        it('deve retornar null quando skill não existe em nenhum lugar', () => {
            mockExistsSync.mockReturnValue(false);
            const svc = new ContentResolverService(testDir);
            const dir = svc.getSkillDir('skill-inexistente');
            expect(dir).toBeNull();
        });
    });

    describe('readSkillFile', () => {
        it('deve ler arquivo de skill e cachear resultado', async () => {
            const skillContent = '# Test Skill\n\nConteúdo de teste';
            mockExistsSync.mockImplementation((path: any) => {
                const p = String(path);
                if (p.includes('.maestro')) return false;
                return true;
            });
            mockReadFile.mockResolvedValue(skillContent as any);

            const svc = new ContentResolverService(testDir);
            const result1 = await svc.readSkillFile('specialist-test', 'SKILL.md');
            const result2 = await svc.readSkillFile('specialist-test', 'SKILL.md');

            expect(result1).toBe(skillContent);
            expect(result2).toBe(skillContent);
            // Segundo call usa cache — readFile chamado apenas 1x
            expect(mockReadFile).toHaveBeenCalledTimes(1);
        });

        it('deve retornar null quando skill não encontrada', async () => {
            mockExistsSync.mockReturnValue(false);
            const svc = new ContentResolverService(testDir);
            const result = await svc.readSkillFile('inexistente', 'SKILL.md');
            expect(result).toBeNull();
        });
    });

    describe('listSkillResources', () => {
        it('deve listar apenas arquivos .md', async () => {
            mockExistsSync.mockImplementation((path: any) => {
                const p = String(path);
                if (p.includes('.maestro')) return false;
                return true;
            });
            mockReaddir.mockResolvedValue(['template.md', 'README.txt', 'example.md'] as any);

            const svc = new ContentResolverService(testDir);
            const result = await svc.listSkillResources('specialist-test', 'templates');
            expect(result).toEqual(['template.md', 'example.md']);
        });

        it('deve retornar array vazio quando skill não existe', async () => {
            mockExistsSync.mockReturnValue(false);
            const svc = new ContentResolverService(testDir);
            const result = await svc.listSkillResources('inexistente', 'templates');
            expect(result).toEqual([]);
        });
    });

    describe('clearCache', () => {
        it('deve limpar cache e forçar re-leitura', async () => {
            const content = '# Cached';
            mockExistsSync.mockImplementation((path: any) => {
                if (String(path).includes('.maestro')) return false;
                return true;
            });
            mockReadFile.mockResolvedValue(content as any);

            const svc = new ContentResolverService(testDir);
            await svc.readSkillFile('test', 'SKILL.md');
            svc.clearCache();
            await svc.readSkillFile('test', 'SKILL.md');

            expect(mockReadFile).toHaveBeenCalledTimes(2);
        });
    });
});
