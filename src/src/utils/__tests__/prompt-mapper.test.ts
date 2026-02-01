import { describe, it, expect } from 'vitest';
import {
  FASE_SKILL_MAP,
  getSkillParaFase,
  temSkillParaFase,
  getSkillPath,
  getSkillFilePath,
  getSkillResourcePath
} from '../prompt-mapper.js';

describe('Mapeamento de Skills', () => {
  describe('FASE_SKILL_MAP', () => {
    it('deve ter mapeamento para todas as fases principais (fluxo simples)', () => {
      const fasesObrigatorias = [
        'Produto',
        'Requisitos',
        'UX Design',
        'Arquitetura',
        'Backlog',
        'Frontend',
        'Backend'
      ];
      
      fasesObrigatorias.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter mapeamento para fases médias', () => {
      const fasesMedias = [
        'Modelo de Domínio',
        'Banco de Dados',
        'Segurança',
        'Testes',
        'Contrato API',
        'Integração'
      ];
      
      fasesMedias.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter mapeamento para fases complexas', () => {
      const fasesComplexas = [
        'Arquitetura Avançada',
        'Performance',
        'Observabilidade'
      ];
      
      fasesComplexas.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter mapeamento para fase opcional', () => {
      expect(FASE_SKILL_MAP['Prototipagem']).toBe('specialist-prototipagem-stitch');
    });
    
    it('deve ter mapeamento para fases complementares', () => {
      const fasesComplementares = [
        'Dados e Analytics',
        'Acessibilidade',
        'Debugging',
        'Documentação',
        'Exploração',
        'Migração',
        'Mobile',
        'Mobile Design'
      ];
      
      fasesComplementares.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter total de 25 mapeamentos', () => {
      const totalMapeamentos = Object.keys(FASE_SKILL_MAP).length;
      expect(totalMapeamentos).toBe(25);
    });
  });
  
  describe('getSkillParaFase', () => {
    it('deve retornar skill correta para fase conhecida', () => {
      expect(getSkillParaFase('Produto')).toBe('specialist-gestao-produto');
      expect(getSkillParaFase('Requisitos')).toBe('specialist-engenharia-requisitos-ia');
      expect(getSkillParaFase('Arquitetura Avançada')).toBe('specialist-arquitetura-avancada');
      expect(getSkillParaFase('UX Design')).toBe('specialist-ux-design');
    });
    
    it('deve retornar null para fase desconhecida', () => {
      expect(getSkillParaFase('Fase Inexistente')).toBeNull();
      expect(getSkillParaFase('')).toBeNull();
    });
    
    it('deve ser case-sensitive', () => {
      expect(getSkillParaFase('produto')).toBeNull(); // minúsculo
      expect(getSkillParaFase('Produto')).toBe('specialist-gestao-produto'); // correto
    });
  });
  
  describe('temSkillParaFase', () => {
    it('deve retornar true para fase com skill', () => {
      expect(temSkillParaFase('Produto')).toBe(true);
      expect(temSkillParaFase('Requisitos')).toBe(true);
      expect(temSkillParaFase('Observabilidade')).toBe(true);
    });
    
    it('deve retornar false para fase sem skill', () => {
      expect(temSkillParaFase('Fase Inexistente')).toBe(false);
      expect(temSkillParaFase('')).toBe(false);
    });
  });
  
  describe('getSkillPath', () => {
    it('deve retornar caminho correto no Windows', () => {
      const path = getSkillPath('specialist-gestao-produto', 'C:\\projeto');
      expect(path).toContain('specialist-gestao-produto');
      expect(path).toContain('.agent');
      expect(path).toContain('skills');
    });
    
    it('deve retornar caminho correto no Unix', () => {
      const path = getSkillPath('specialist-gestao-produto', '/projeto');
      expect(path).toContain('specialist-gestao-produto');
      expect(path).toContain('.agent');
      expect(path).toContain('skills');
    });
    
    it('deve funcionar com diferentes nomes de skills', () => {
      const skills = [
        'specialist-gestao-produto',
        'specialist-arquitetura-avancada',
        'specialist-desenvolvimento-frontend'
      ];
      
      skills.forEach(skill => {
        const path = getSkillPath(skill, '/projeto');
        expect(path).toContain(skill);
      });
    });
  });
  
  describe('getSkillFilePath', () => {
    it('deve retornar caminho de arquivo correto', () => {
      const path = getSkillFilePath('specialist-gestao-produto', '/projeto', 'SKILL.md');
      expect(path).toContain('specialist-gestao-produto');
      expect(path).toContain('SKILL.md');
    });
    
    it('deve funcionar com diferentes arquivos', () => {
      const arquivos = ['SKILL.md', 'README.md', 'MCP_INTEGRATION.md'];
      
      arquivos.forEach(arquivo => {
        const path = getSkillFilePath('specialist-gestao-produto', '/projeto', arquivo);
        expect(path).toContain(arquivo);
      });
    });
  });
  
  describe('getSkillResourcePath', () => {
    it('deve retornar caminho de resource correto para templates', () => {
      const path = getSkillResourcePath('specialist-gestao-produto', '/projeto', 'templates');
      expect(path).toContain('specialist-gestao-produto');
      expect(path).toContain('resources');
      expect(path).toContain('templates');
    });
    
    it('deve funcionar com todos os tipos de resources', () => {
      const tipos: Array<'templates' | 'examples' | 'checklists' | 'reference'> = [
        'templates',
        'examples',
        'checklists',
        'reference'
      ];
      
      tipos.forEach(tipo => {
        const path = getSkillResourcePath('specialist-gestao-produto', '/projeto', tipo);
        expect(path).toContain(tipo);
        expect(path).toContain('resources');
      });
    });
  });
  
  describe('Integração entre funções', () => {
    it('deve mapear fase → skill → caminho completo', () => {
      const fase = 'Produto';
      const skill = getSkillParaFase(fase);
      
      expect(skill).not.toBeNull();
      
      if (skill) {
        const skillPath = getSkillPath(skill, '/projeto');
        expect(skillPath).toContain(skill);
        
        const skillFile = getSkillFilePath(skill, '/projeto', 'SKILL.md');
        expect(skillFile).toContain('SKILL.md');
        
        const templatesPath = getSkillResourcePath(skill, '/projeto', 'templates');
        expect(templatesPath).toContain('templates');
      }
    });
    
    it('deve validar fluxo completo para todas as fases', () => {
      const fases = Object.keys(FASE_SKILL_MAP);
      
      fases.forEach(fase => {
        const skill = getSkillParaFase(fase);
        expect(skill).not.toBeNull();
        expect(temSkillParaFase(fase)).toBe(true);
        
        if (skill) {
          const path = getSkillPath(skill, '/projeto');
          expect(path).toBeTruthy();
        }
      });
    });
  });
});
