import { describe, it, expect } from 'vitest';
import {
  FASE_SKILL_MAP,
  getSkillParaFase,
  temSkillParaFase,
  getSkillPath,
  getSkillFilePath,
  getSkillResourcePath
} from '../prompt-mapper.js';

describe('Mapeamento de Skills v10', () => {
  describe('FASE_SKILL_MAP', () => {
    it('deve ter mapeamento para fases do fluxo simples v10 (5 fases)', () => {
      const fasesSimples = [
        'Discovery',
        'Design',
        'Arquitetura',
        'Frontend',
        'Backend'
      ];
      
      fasesSimples.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter mapeamento para fases adicionais do fluxo médio v10', () => {
      const fasesMedias = [
        'Produto',
        'Requisitos',
        'Design Técnico',
        'Planejamento',
        'Integração & Deploy'
      ];
      
      fasesMedias.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter mapeamento para fases adicionais do fluxo complexo v10', () => {
      const fasesComplexas = [
        'Modelo de Domínio',
        'Contrato API',
        'Integração',
        'Deploy & Operação'
      ];
      
      fasesComplexas.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve ter mapeamento para fase opcional', () => {
      expect(FASE_SKILL_MAP['Prototipagem']).toBe('specialist-prototipagem-stitch');
    });
    
    it('deve ter mapeamento para skills utilitárias', () => {
      const utilitarias = [
        'Debugging',
        'Exploração'
      ];
      
      utilitarias.forEach(fase => {
        expect(FASE_SKILL_MAP[fase]).toBeDefined();
        expect(FASE_SKILL_MAP[fase]).toMatch(/^specialist-/);
      });
    });
    
    it('deve mapear skills corretas para nomes v10', () => {
      expect(FASE_SKILL_MAP['Discovery']).toBe('specialist-discovery');
      expect(FASE_SKILL_MAP['Design']).toBe('specialist-design');
      expect(FASE_SKILL_MAP['Arquitetura']).toBe('specialist-architect');
      expect(FASE_SKILL_MAP['Produto']).toBe('specialist-product');
      expect(FASE_SKILL_MAP['Design Técnico']).toBe('specialist-technical-design');
      expect(FASE_SKILL_MAP['Planejamento']).toBe('specialist-planning');
      expect(FASE_SKILL_MAP['Modelo de Domínio']).toBe('specialist-domain');
      expect(FASE_SKILL_MAP['Contrato API']).toBe('specialist-api-contract');
      expect(FASE_SKILL_MAP['Deploy & Operação']).toBe('specialist-operations');
    });
  });
  
  describe('getSkillParaFase', () => {
    it('deve retornar skill correta para fases v10', () => {
      expect(getSkillParaFase('Discovery')).toBe('specialist-discovery');
      expect(getSkillParaFase('Produto')).toBe('specialist-product');
      expect(getSkillParaFase('Requisitos')).toBe('specialist-requirements');
      expect(getSkillParaFase('Design')).toBe('specialist-design');
      expect(getSkillParaFase('Design Técnico')).toBe('specialist-technical-design');
    });
    
    it('deve retornar null para fase desconhecida', () => {
      expect(getSkillParaFase('Fase Inexistente')).toBeNull();
      expect(getSkillParaFase('')).toBeNull();
    });
    
    it('deve ser case-sensitive', () => {
      expect(getSkillParaFase('discovery')).toBeNull();
      expect(getSkillParaFase('Discovery')).toBe('specialist-discovery');
    });

    it('deve retornar null para fases removidas v9', () => {
      expect(getSkillParaFase('UX Design')).toBeNull();
      expect(getSkillParaFase('Banco de Dados')).toBeNull();
      expect(getSkillParaFase('Segurança')).toBeNull();
      expect(getSkillParaFase('Backlog')).toBeNull();
    });
  });
  
  describe('temSkillParaFase', () => {
    it('deve retornar true para fases v10 com skill', () => {
      expect(temSkillParaFase('Discovery')).toBe(true);
      expect(temSkillParaFase('Produto')).toBe(true);
      expect(temSkillParaFase('Design Técnico')).toBe(true);
      expect(temSkillParaFase('Deploy & Operação')).toBe(true);
    });
    
    it('deve retornar false para fase sem skill', () => {
      expect(temSkillParaFase('Fase Inexistente')).toBe(false);
      expect(temSkillParaFase('')).toBe(false);
    });
  });
  
  describe('getSkillPath', () => {
    it('deve retornar caminho correto no Windows', () => {
      const path = getSkillPath('specialist-discovery', 'C:\\projeto');
      expect(path).toContain('specialist-discovery');
      expect(path).toContain('.agent');
      expect(path).toContain('skills');
    });
    
    it('deve retornar caminho correto no Unix', () => {
      const path = getSkillPath('specialist-discovery', '/projeto');
      expect(path).toContain('specialist-discovery');
      expect(path).toContain('.agent');
      expect(path).toContain('skills');
    });
    
    it('deve funcionar com skills v10', () => {
      const skills = [
        'specialist-discovery',
        'specialist-technical-design',
        'specialist-frontend',
        'specialist-domain',
        'specialist-operations'
      ];
      
      skills.forEach(skill => {
        const path = getSkillPath(skill, '/projeto');
        expect(path).toContain(skill);
      });
    });
  });
  
  describe('getSkillFilePath', () => {
    it('deve retornar caminho de arquivo correto', () => {
      const path = getSkillFilePath('specialist-discovery', '/projeto', 'SKILL.md');
      expect(path).toContain('specialist-discovery');
      expect(path).toContain('SKILL.md');
    });
    
    it('deve funcionar com diferentes arquivos', () => {
      const arquivos = ['SKILL.md', 'README.md', 'MCP_INTEGRATION.md'];
      
      arquivos.forEach(arquivo => {
        const path = getSkillFilePath('specialist-discovery', '/projeto', arquivo);
        expect(path).toContain(arquivo);
      });
    });
  });
  
  describe('getSkillResourcePath', () => {
    it('deve retornar caminho de resource correto para templates', () => {
      const path = getSkillResourcePath('specialist-discovery', '/projeto', 'templates');
      expect(path).toContain('specialist-discovery');
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
        const path = getSkillResourcePath('specialist-discovery', '/projeto', tipo);
        expect(path).toContain(tipo);
        expect(path).toContain('resources');
      });
    });
  });
  
  describe('Integração entre funções', () => {
    it('deve mapear fase → skill → caminho completo', () => {
      const fase = 'Discovery';
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
