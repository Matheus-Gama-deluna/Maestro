import { vi, describe, it, expect, beforeEach } from 'vitest';
import { generateGateOrientationDoc } from '../utils/gate-orientation.js';
import { SkillLoaderService } from '../services/skill-loader.service.js';
import * as fsPromises from 'fs/promises';

// Mocks
vi.mock('fs/promises', () => ({
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../services/skill-loader.service.js', () => ({
    SkillLoaderService: class {
        async loadChecklist(faseNome: string) {
            if (faseNome === 'Produto') return '- Critério A\n- Critério B';
            return null;
        }
    }
}));

vi.mock('../utils/prompt-mapper.js', () => ({
    getSkillParaFase: vi.fn().mockReturnValue('skill-gestao-produto')
}));

vi.mock('../utils/ide-paths.js', () => ({
    getSkillFilePath: vi.fn().mockReturnValue('.agent/skills/skill-gestao-produto/'),
    detectIDE: vi.fn().mockReturnValue('cursor')
}));

describe('GateOrientation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve gerar o documento descritivo de gate e salvar no disco', async () => {
        const result = await generateGateOrientationDoc('/test/dir', 'Produto', 1);

        expect(result).not.toBeNull();
        expect(fsPromises.mkdir).toHaveBeenCalled();
        expect(fsPromises.writeFile).toHaveBeenCalled();

        // Verificar o path correto gerado
        const expectedPathPart = 'fase-01'; // Verifica normalização
        expect(result).toContain(expectedPathPart);
        expect(result).toContain('.orientacoes-gate.md');

        // Checar parte do conteúdo escrito
        const writeCallArgs = vi.mocked(fsPromises.writeFile).mock.calls[0];
        const contentWritten = writeCallArgs[1] as string;
        
        expect(contentWritten).toContain('Critérios do Gate — Fase 1: Produto');
        expect(contentWritten).toContain('skill-gestao-produto');
        expect(contentWritten).toContain('- Critério A\n- Critério B');
    });

    it('deve retornar null se o checklist da fase não for encontrado na skill', async () => {
        // Mocka uma fase não registrada
        const result = await generateGateOrientationDoc('/test/dir', 'FaseInvalida', 99);

        // Se não houver checklist, o orientador aborta e não gera nada
        expect(result).toBeNull();
        expect(fsPromises.writeFile).not.toHaveBeenCalled();
    });

    it('deve lidar corretamente com erros do filesystem durante a gravação', async () => {
        // Redefinir mock especificamente para este caso causar erro
        vi.mocked(fsPromises.mkdir).mockRejectedValueOnce(new Error('Permission denied'));

        const result = await generateGateOrientationDoc('/test/dir', 'Produto', 1);

        expect(result).toBeNull();
    });
});
