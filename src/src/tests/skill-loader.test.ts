/**
 * Testes para SkillLoaderService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillLoaderService, type ContextPackage } from '../services/skill-loader.service.js';
import { ContentResolverService } from '../services/content-resolver.service.js';
import { invalidateCache } from '../services/skill-cache.service.js';

// Mock ContentResolverService
vi.mock('../services/content-resolver.service.js');

// Mock prompt-mapper
vi.mock('../utils/prompt-mapper.js', () => ({
    getSkillParaFase: vi.fn((fase: string) => {
        const map: Record<string, string> = {
            'Produto': 'specialist-gestao-produto',
            'Arquitetura': 'specialist-arquitetura-software',
            'Desconhecida': '',
        };
        return map[fase] || null;
    }),
    FASE_SKILL_MAP: {
        'Produto': 'specialist-gestao-produto',
        'Arquitetura': 'specialist-arquitetura-software',
    },
}));

// Mock specialist.service
vi.mock('../services/specialist.service.js', () => ({
    getSpecialistPersona: vi.fn((fase: string) => {
        if (fase === 'Produto') {
            return {
                name: 'Gestão de Produto',
                tone: 'Estratégico',
                expertise: ['product discovery', 'lean startup'],
                instructions: 'Foque em entender o problema.',
            };
        }
        if (fase === 'Arquitetura') {
            return {
                name: 'Arquitetura de Software',
                tone: 'Técnico',
                expertise: ['C4', 'ADR'],
                instructions: 'Defina arquitetura alvo.',
            };
        }
        return null;
    }),
}));

const SAMPLE_SKILL_MD = `---
name: specialist-gestao-produto
description: PRD e gestão de produto
---

# Gestão de Produto · Skill do Especialista

## Missão
Definir produto com foco no usuário.

## Quando ativar
- Fase 1 do projeto

## Inputs obrigatórios
- Briefing do cliente

## Outputs gerados
- PRD completo

## Quality Gate
- PRD com escopo definido
- Personas mapeadas

## 🚀 Processo Otimizado

### 1. Discovery
Faça perguntas focadas.

### 2. Geração
Use template estruturado.

## 📋 Recursos Disponíveis

### Templates
- resources/templates/prd.md

## 🔄 Context Flow
Prepare transição para requisitos.

## MCP Integration
Funções descritivas.

## 📖 Documentação Completa
Detalhes em README.md.
`;

const SAMPLE_TEMPLATE = `# Template PRD

## 1. Visão Geral
[Descreva o produto]

## 2. Problema
[Qual problema resolve]

## 3. Personas
[Defina personas]

## 4. Escopo
[Defina escopo MVP]
`;

const SAMPLE_CHECKLIST = `# Checklist de Validação

- [ ] PRD tem visão geral
- [ ] Problema definido
- [ ] Pelo menos 2 personas
- [ ] Escopo MVP claro
`;

describe('SkillLoaderService', () => {
    let service: SkillLoaderService;
    let mockResolver: any;

    beforeEach(() => {
        vi.clearAllMocks();
        invalidateCache();

        mockResolver = {
            readSkillFile: vi.fn(),
            readFirstTemplate: vi.fn(),
            readFirstChecklist: vi.fn(),
            listSkillResources: vi.fn(),
            getSkillDir: vi.fn(),
        };

        service = new SkillLoaderService(mockResolver as unknown as ContentResolverService);
    });

    describe('loadForPhase', () => {
        it('deve retornar null para fase sem skill mapeada', async () => {
            const result = await service.loadForPhase('FaseInexistente', 'balanced');
            expect(result).toBeNull();
        });

        it('deve carregar pacote completo para fase com skill', async () => {
            mockResolver.readSkillFile.mockResolvedValue(SAMPLE_SKILL_MD);
            mockResolver.readFirstTemplate.mockResolvedValue(SAMPLE_TEMPLATE);
            mockResolver.readFirstChecklist.mockResolvedValue(SAMPLE_CHECKLIST);
            mockResolver.listSkillResources.mockResolvedValue(['prd.md']);

            const result = await service.loadForPhase('Produto', 'balanced');

            expect(result).not.toBeNull();
            expect(result!.skillName).toBe('specialist-gestao-produto');
            expect(result!.specialist).not.toBeNull();
            expect(result!.specialist!.name).toBe('Gestão de Produto');
            expect(result!.skillContent.length).toBeGreaterThan(0);
            expect(result!.templateContent.length).toBeGreaterThan(0);
            expect(result!.checklistContent.length).toBeGreaterThan(0);
            expect(result!.tokenEstimate).toBeGreaterThan(0);
        });

        it('deve respeitar budget em modo economy (skill menor)', async () => {
            mockResolver.readSkillFile.mockResolvedValue(SAMPLE_SKILL_MD);
            mockResolver.readFirstTemplate.mockResolvedValue(SAMPLE_TEMPLATE);
            mockResolver.readFirstChecklist.mockResolvedValue(SAMPLE_CHECKLIST);
            mockResolver.listSkillResources.mockResolvedValue([]);

            const economy = await service.loadForPhase('Produto', 'economy');
            const quality = await service.loadForPhase('Produto', 'quality');

            expect(economy).not.toBeNull();
            expect(quality).not.toBeNull();
            // Economy deve ter menos tokens que quality
            expect(economy!.tokenEstimate).toBeLessThanOrEqual(quality!.tokenEstimate);
        });

        it('deve incluir seções essenciais em economy mode', async () => {
            mockResolver.readSkillFile.mockResolvedValue(SAMPLE_SKILL_MD);
            mockResolver.readFirstTemplate.mockResolvedValue(null);
            mockResolver.readFirstChecklist.mockResolvedValue(null);
            mockResolver.listSkillResources.mockResolvedValue([]);

            const result = await service.loadForPhase('Produto', 'economy');

            expect(result).not.toBeNull();
            // Seções essenciais devem estar presentes
            expect(result!.skillContent).toContain('Missão');
            expect(result!.skillContent).toContain('Quality Gate');
        });

        it('deve lidar com skill sem template e checklist', async () => {
            mockResolver.readSkillFile.mockResolvedValue(SAMPLE_SKILL_MD);
            mockResolver.readFirstTemplate.mockResolvedValue(null);
            mockResolver.readFirstChecklist.mockResolvedValue(null);
            mockResolver.listSkillResources.mockResolvedValue([]);

            const result = await service.loadForPhase('Produto', 'balanced');

            expect(result).not.toBeNull();
            expect(result!.templateContent).toBe('');
            expect(result!.checklistContent).toBe('');
        });
    });

    describe('loadChecklist', () => {
        it('deve carregar checklist para fase válida', async () => {
            mockResolver.readFirstChecklist.mockResolvedValue(SAMPLE_CHECKLIST);

            const result = await service.loadChecklist('Produto');
            expect(result).toBe(SAMPLE_CHECKLIST);
        });

        it('deve retornar null para fase sem skill', async () => {
            const result = await service.loadChecklist('FaseInexistente');
            expect(result).toBeNull();
        });
    });

    describe('loadTemplate', () => {
        it('deve carregar template para fase válida', async () => {
            mockResolver.readFirstTemplate.mockResolvedValue(SAMPLE_TEMPLATE);

            const result = await service.loadTemplate('Produto');
            expect(result).toBe(SAMPLE_TEMPLATE);
        });
    });

    describe('formatAsMarkdown', () => {
        it('deve formatar pacote como markdown legível', () => {
            const pkg: ContextPackage = {
                skillName: 'specialist-gestao-produto',
                specialist: {
                    name: 'Gestão de Produto',
                    tone: 'Estratégico',
                    expertise: ['product discovery'],
                    instructions: 'Foque no problema.',
                },
                skillContent: '## Missão\nDefinir produto.',
                templateContent: '# Template PRD\n## Visão',
                checklistContent: '- [ ] PRD completo',
                referenceLinks: ['maestro://skills/specialist-gestao-produto/templates/prd.md'],
                tokenEstimate: 500,
                mode: 'summary',
            };

            const md = service.formatAsMarkdown(pkg);

            expect(md).toContain('Gestão de Produto');
            expect(md).toContain('Estratégico');
            expect(md).toContain('Instruções do Especialista');
            expect(md).toContain('Template do Entregável');
            expect(md).toContain('Checklist de Validação');
            expect(md).toContain('Recursos Adicionais');
            expect(md).toContain('500 tokens');
        });

        it('deve omitir seções vazias', () => {
            const pkg: ContextPackage = {
                skillName: 'test',
                specialist: null,
                skillContent: '',
                templateContent: '',
                checklistContent: '- [ ] Item',
                referenceLinks: [],
                tokenEstimate: 10,
                mode: 'skeleton',
            };

            const md = service.formatAsMarkdown(pkg);

            expect(md).not.toContain('Instruções do Especialista');
            expect(md).not.toContain('Template do Entregável');
            expect(md).toContain('Checklist de Validação');
            expect(md).not.toContain('Recursos Adicionais');
        });
    });
});
