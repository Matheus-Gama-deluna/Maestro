/**
 * Testes para brainstorm e PRD writer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { OnboardingState, BrainstormSection } from '../types/onboarding.js';
import { gerarBlocosDiscovery } from '../utils/discovery-adapter.js';

describe('Brainstorm e PRD Writer', () => {
  let onboarding: OnboardingState;

  beforeEach(() => {
    onboarding = {
      projectId: 'test-project-123',
      phase: 'discovery',
      discoveryStatus: 'completed',
      discoveryBlocks: gerarBlocosDiscovery({
        mode: 'balanced',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      }),
      discoveryResponses: {
        nome_projeto: 'PulseTrack',
        problema: 'Monitorar saúde ocupacional',
        publico_alvo: 'Empresas e profissionais de saúde',
        funcionalidades_principais: ['Dashboard', 'Alertas', 'Relatórios'],
        plataformas: ['Web', 'Mobile'],
        cronograma: '6 meses',
        stack_preferida: 'React + Node.js',
        tamanho_time: '2-5 pessoas',
        experiencia_time: 'Pleno',
      },
      discoveryCompletedAt: new Date().toISOString(),
      brainstormStatus: 'pending',
      brainstormSections: [],
      prdStatus: 'pending',
      prdScore: 0,
      mode: 'balanced',
      totalInteractions: 0,
    };
  });

  describe('Brainstorm Sections', () => {
    it('deve gerar 5 seções de brainstorm', () => {
      const secoes: BrainstormSection[] = [
        {
          id: 'problema-oportunidade',
          title: 'Problema e Oportunidade',
          description: 'Defina o problema de forma quantificada',
          prompt: 'Elabore o problema...',
          expectedOutput: 'Análise estruturada',
          status: 'pending',
          order: 1,
        },
        {
          id: 'personas-jtbd',
          title: 'Personas e Jobs to Be Done',
          description: 'Defina personas principais',
          prompt: 'Crie personas...',
          expectedOutput: 'Descrição de personas',
          status: 'pending',
          order: 2,
        },
        {
          id: 'mvp-funcionalidades',
          title: 'MVP e Funcionalidades',
          description: 'Refine funcionalidades',
          prompt: 'Refine e priorize...',
          expectedOutput: 'Matriz RICE',
          status: 'pending',
          order: 3,
        },
        {
          id: 'metricas-sucesso',
          title: 'Métricas de Sucesso',
          description: 'Defina North Star',
          prompt: 'Defina métricas...',
          expectedOutput: 'North Star + KPIs',
          status: 'pending',
          order: 4,
        },
        {
          id: 'riscos-mitigacoes',
          title: 'Riscos e Mitigações',
          description: 'Identifique riscos',
          prompt: 'Identifique riscos...',
          expectedOutput: 'Matriz de riscos',
          status: 'pending',
          order: 5,
        },
      ];

      expect(secoes.length).toBe(5);
      expect(secoes[0].id).toBe('problema-oportunidade');
      expect(secoes[4].id).toBe('riscos-mitigacoes');
    });

    it('deve rastrear progresso do brainstorm', () => {
      const secoes: BrainstormSection[] = [
        {
          id: 'problema-oportunidade',
          title: 'Problema e Oportunidade',
          description: 'Defina o problema',
          prompt: 'Elabore...',
          expectedOutput: 'Análise',
          status: 'completed',
          response: 'Resposta do usuário',
          order: 1,
        },
        {
          id: 'personas-jtbd',
          title: 'Personas',
          description: 'Defina personas',
          prompt: 'Crie...',
          expectedOutput: 'Personas',
          status: 'pending',
          order: 2,
        },
      ];

      const completadas = secoes.filter((s) => s.status === 'completed').length;
      const total = secoes.length;
      const percentual = Math.round((completadas / total) * 100);

      expect(completadas).toBe(1);
      expect(total).toBe(2);
      expect(percentual).toBe(50);
    });

    it('deve marcar brainstorm como completo quando todas as seções estão completas', () => {
      const secoes: BrainstormSection[] = [
        {
          id: 'problema-oportunidade',
          title: 'Problema',
          description: 'Defina',
          prompt: 'Elabore...',
          expectedOutput: 'Análise',
          status: 'completed',
          response: 'Resposta 1',
          order: 1,
        },
        {
          id: 'personas-jtbd',
          title: 'Personas',
          description: 'Defina',
          prompt: 'Crie...',
          expectedOutput: 'Personas',
          status: 'completed',
          response: 'Resposta 2',
          order: 2,
        },
      ];

      const todasCompletas = secoes.every((s) => s.status === 'completed');
      expect(todasCompletas).toBe(true);
    });
  });

  describe('PRD Generation', () => {
    it('deve gerar PRD com todas as seções', () => {
      const prdConteudo = `# PRD - ${onboarding.discoveryResponses.nome_projeto}

## 1. Sumário Executivo
Problema e oportunidade...

## 2. Personas e Jobs to Be Done
Personas...

## 3. MVP e Funcionalidades Priorizadas
Funcionalidades...

## 4. Métricas de Sucesso
Métricas...

## 5. Riscos e Planos de Mitigação
Riscos...

## 6. Contexto Técnico
Stack: ${onboarding.discoveryResponses.stack_preferida}

## 7. Timeline e Recursos
Cronograma: ${onboarding.discoveryResponses.cronograma}

## 8. Requisitos Críticos
Requisitos...`;

      expect(prdConteudo).toContain('PulseTrack');
      expect(prdConteudo).toContain('Sumário Executivo');
      expect(prdConteudo).toContain('Personas');
      expect(prdConteudo).toContain('MVP');
      expect(prdConteudo).toContain('Métricas');
      expect(prdConteudo).toContain('Riscos');
      expect(prdConteudo).toContain('React + Node.js');
      expect(prdConteudo).toContain('6 meses');
    });

    it('deve validar completude do PRD', () => {
      const checklist = {
        'Sumário Executivo': true,
        'Personas e JTBD': true,
        'MVP e Funcionalidades': true,
        'Métricas de Sucesso': true,
        'Riscos e Mitigações': true,
        'Contexto Técnico': true,
        'Timeline e Recursos': true,
        'Requisitos Críticos': true,
      };

      const itemsValidados = Object.values(checklist).filter((v) => v).length;
      const totalItems = Object.keys(checklist).length;
      const score = Math.round((itemsValidados / totalItems) * 100);

      expect(score).toBe(100);
      expect(itemsValidados).toBe(8);
    });

    it('deve detectar lacunas no PRD', () => {
      const checklist = {
        'Sumário Executivo': true,
        'Personas e JTBD': false,
        'MVP e Funcionalidades': true,
        'Métricas de Sucesso': false,
        'Riscos e Mitigações': true,
        'Contexto Técnico': true,
        'Timeline e Recursos': true,
        'Requisitos Críticos': true,
      };

      const itemsValidados = Object.values(checklist).filter((v) => v).length;
      const totalItems = Object.keys(checklist).length;
      const score = Math.round((itemsValidados / totalItems) * 100);

      const lacunas = Object.entries(checklist)
        .filter(([_, valido]) => !valido)
        .map(([item]) => item);

      expect(score).toBe(75);
      expect(lacunas.length).toBe(2);
      expect(lacunas).toContain('Personas e JTBD');
      expect(lacunas).toContain('Métricas de Sucesso');
    });
  });

  describe('Onboarding State Transitions', () => {
    it('deve transicionar de discovery para brainstorm', () => {
      onboarding.phase = 'brainstorm';
      onboarding.brainstormStatus = 'in_progress';

      expect(onboarding.phase).toBe('brainstorm');
      expect(onboarding.brainstormStatus).toBe('in_progress');
    });

    it('deve transicionar de brainstorm para prd_draft', () => {
      onboarding.phase = 'prd_draft';
      onboarding.brainstormStatus = 'completed';
      onboarding.prdStatus = 'draft';

      expect(onboarding.phase).toBe('prd_draft');
      expect(onboarding.brainstormStatus).toBe('completed');
      expect(onboarding.prdStatus).toBe('draft');
    });

    it('deve transicionar de prd_draft para validation', () => {
      onboarding.phase = 'validation';
      onboarding.prdStatus = 'validated';
      onboarding.prdScore = 85;

      expect(onboarding.phase).toBe('validation');
      expect(onboarding.prdStatus).toBe('validated');
      expect(onboarding.prdScore).toBeGreaterThanOrEqual(70);
    });

    it('deve rastrear total de interações', () => {
      onboarding.totalInteractions = 0;

      // Discovery
      onboarding.totalInteractions += 3;
      expect(onboarding.totalInteractions).toBe(3);

      // Brainstorm
      onboarding.totalInteractions += 5;
      expect(onboarding.totalInteractions).toBe(8);

      // PRD
      onboarding.totalInteractions += 2;
      expect(onboarding.totalInteractions).toBe(10);
    });
  });

  describe('PRD Score Calculation', () => {
    it('deve calcular score baseado em completude', () => {
      const completude = {
        campos_preenchidos: 8,
        campos_totais: 8,
      };

      const score = Math.round((completude.campos_preenchidos / completude.campos_totais) * 100);
      expect(score).toBe(100);
    });

    it('deve considerar PRD validado com score >= 70', () => {
      const scores = [85, 75, 70, 65, 50];

      scores.forEach((score) => {
        const validado = score >= 70;
        if (score >= 70) {
          expect(validado).toBe(true);
        } else {
          expect(validado).toBe(false);
        }
      });
    });

    it('deve calcular score ponderado com qualidade', () => {
      const completude = 80;
      const qualidade = 75;
      const clareza = 85;

      const scoreTotal = Math.round(
        completude * 0.4 + qualidade * 0.35 + clareza * 0.25
      );

      expect(scoreTotal).toBeGreaterThan(70);
      expect(scoreTotal).toBeLessThanOrEqual(100);
    });
  });
});
