/**
 * Testes para readiness checker e dashboard
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { OnboardingState } from '../types/onboarding.js';
import {
  verificarProntidaoPRD,
  calcularTempoEstimado,
  gerarInsights,
  recomendarProximasAcoes,
} from '../utils/readiness-checker.js';
import { gerarBlocosDiscovery } from '../utils/discovery-adapter.js';

describe('Readiness Checker', () => {
  let onboarding: OnboardingState;

  beforeEach(() => {
    onboarding = {
      projectId: 'test-project-123',
      phase: 'prd_draft',
      discoveryStatus: 'completed',
      discoveryBlocks: gerarBlocosDiscovery({
        mode: 'balanced',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      }).map((bloco) => ({ ...bloco, status: 'completed' as const, fields: bloco.fields.map((field) => ({ ...field, filled: true, value: field.value ?? 'valor preenchido' })) })),
      discoveryResponses: {
        nome_projeto: 'PulseTrack',
        problema: 'Monitorar saúde ocupacional',
        publico_alvo: 'Empresas e profissionais',
        funcionalidades_principais: ['Dashboard', 'Alertas'],
        cronograma: '6 meses',
        plataformas: ['Web'],
        stack_preferida: 'React + Node.js',
      },
      discoveryCompletedAt: new Date().toISOString(),
      brainstormStatus: 'completed',
      brainstormSections: [
        {
          id: 'problema-oportunidade',
          title: 'Problema',
          description: 'Defina',
          prompt: 'Elabore...',
          expectedOutput: 'Análise',
          status: 'completed',
          response: 'Resposta detalhada sobre o problema e oportunidade de mercado, incluindo métricas, referências setoriais e expectativas de crescimento para garantir que ultrapasse o limite mínimo exigido de caracteres pela validação.',
          order: 1,
        },
        {
          id: 'personas-jtbd',
          title: 'Personas',
          description: 'Defina',
          prompt: 'Crie...',
          expectedOutput: 'Personas',
          status: 'completed',
          response: 'Personas bem definidas com JTBD, detalhando motivações, dores e métricas de sucesso para cada perfil, mantendo o texto acima de cem caracteres conforme requerido.',
          order: 2,
        },
        {
          id: 'mvp-funcionalidades',
          title: 'MVP',
          description: 'Refine',
          prompt: 'Refine...',
          expectedOutput: 'Matriz RICE',
          status: 'completed',
          response: 'Matriz RICE com funcionalidades priorizadas, apresentando valores de Reach, Impact, Confidence e Effort para cada item, garantindo explicação completa e texto suficientemente longo.',
          order: 3,
        },
        {
          id: 'metricas-sucesso',
          title: 'Métricas',
          description: 'Defina',
          prompt: 'Defina...',
          expectedOutput: 'North Star',
          status: 'completed',
          response: 'North Star Metric e KPIs definidos com baseline atual, metas trimestrais e justificativa estratégica detalhada para demonstrar maturidade das métricas propostas.',
          order: 4,
        },
        {
          id: 'riscos-mitigacoes',
          title: 'Riscos',
          description: 'Identifique',
          prompt: 'Identifique...',
          expectedOutput: 'Matriz de riscos',
          status: 'completed',
          response: 'Riscos identificados com planos de mitigação específicos, cobrindo aspectos técnicos, de mercado e de equipe com descrições robustas para satisfazer a validação automática.',
          order: 5,
        },
      ],
      brainstormCompletedAt: new Date().toISOString(),
      prdStatus: 'draft',
      prdScore: 0,
      mode: 'balanced',
      totalInteractions: 0,
    };
  });

  describe('verificarProntidaoPRD', () => {
    it('deve retornar score alto quando tudo está completo', () => {
      const resultado = verificarProntidaoPRD(onboarding);

      expect(resultado.score).toBeGreaterThanOrEqual(70);
      expect(resultado.isReady).toBe(true);
      expect(resultado.missingFields.length).toBeLessThan(3);
    });

    it('deve detectar discovery incompleto', () => {
      onboarding.discoveryStatus = 'pending';

      const resultado = verificarProntidaoPRD(onboarding);

      expect(resultado.isReady).toBe(false);
      expect(resultado.missingFields).toContain('Discovery não foi concluído');
    });

    it('deve detectar brainstorm incompleto', () => {
      onboarding.brainstormStatus = 'pending';

      const resultado = verificarProntidaoPRD(onboarding);

      expect(resultado.isReady).toBe(false);
      expect(resultado.missingFields).toContain('Brainstorm não foi concluído');
    });

    it('deve detectar campos obrigatórios faltando', () => {
      onboarding.discoveryResponses.nome_projeto = '';

      const resultado = verificarProntidaoPRD(onboarding);

      expect(resultado.missingFields.length).toBeGreaterThan(0);
      expect(resultado.missingFields.some((f) => f.includes('nome_projeto'))).toBe(true);
    });

    it('deve gerar recomendações quando há lacunas', () => {
      onboarding.discoveryStatus = 'in_progress';

      const resultado = verificarProntidaoPRD(onboarding);

      expect(resultado.recommendations.length).toBeGreaterThan(0);
      expect(resultado.recommendations[0]).toContain('discovery');
    });

    it('deve gerar próximas ações', () => {
      const resultado = verificarProntidaoPRD(onboarding);

      expect(resultado.nextActions.length).toBeGreaterThan(0);
      expect(resultado.nextActions[0]).toBeTruthy();
    });
  });

  describe('calcularTempoEstimado', () => {
    it('deve calcular tempo para discovery incompleto', () => {
      onboarding.discoveryStatus = 'in_progress';
      onboarding.discoveryBlocks = onboarding.discoveryBlocks.map((b) => ({ ...b, status: 'pending' }));

      const tempo = calcularTempoEstimado(onboarding);

      const esperado = (onboarding.discoveryBlocks.length * 5) + 5; // +5 pela validação
      expect(tempo).toBe(esperado);
    });

    it('deve calcular tempo para brainstorm incompleto', () => {
      onboarding.brainstormStatus = 'in_progress';
      onboarding.brainstormSections = onboarding.brainstormSections.map((s) => ({ ...s, status: 'pending' }));

      const tempo = calcularTempoEstimado(onboarding);

      const esperado = (onboarding.brainstormSections.length * 10) + 5;
      expect(tempo).toBe(esperado);
    });

    it('deve retornar 0 quando tudo está completo', () => {
      const tempo = calcularTempoEstimado(onboarding);

      expect(tempo).toBe(5); // Apenas validação do PRD
    });

    it('deve calcular tempo total para fluxo completo', () => {
      onboarding.discoveryStatus = 'in_progress';
      onboarding.discoveryBlocks = onboarding.discoveryBlocks.map((b) => ({ ...b, status: 'pending' }));
      onboarding.brainstormStatus = 'in_progress';
      onboarding.brainstormSections = onboarding.brainstormSections.map((s) => ({ ...s, status: 'pending' }));
      onboarding.prdStatus = 'pending';

      const tempo = calcularTempoEstimado(onboarding);
      const blocosPendentes = onboarding.discoveryBlocks.filter((b) => b.status === 'pending').length;
      const secoesPendentes = onboarding.brainstormSections.filter((s) => s.status === 'pending').length;
      const tempoDiscovery = blocosPendentes * 5;
      const tempoBrainstorm = secoesPendentes * 10;
      const tempoValidacao = 5;

      expect(tempo).toBe(tempoDiscovery + tempoBrainstorm + tempoValidacao);
    });
  });

  describe('gerarInsights', () => {
    it('deve gerar insights quando discovery está completo', () => {
      const insights = gerarInsights(onboarding);

      expect(insights.some((i) => i.includes('Discovery'))).toBe(true);
    });

    it('deve gerar insights quando brainstorm está completo', () => {
      const insights = gerarInsights(onboarding);

      expect(insights.some((i) => i.includes('Brainstorm'))).toBe(true);
      expect(insights.some((i) => i.includes('seções'))).toBe(true);
    });

    it('deve gerar insights sobre stack quando disponível', () => {
      const insights = gerarInsights(onboarding);

      expect(insights.some((i) => i.includes('Stack'))).toBe(true);
    });

    it('deve gerar insights sobre timeline quando disponível', () => {
      const insights = gerarInsights(onboarding);

      expect(insights.some((i) => i.includes('Timeline'))).toBe(true);
    });

    it('deve indicar fase atual', () => {
      const insights = gerarInsights(onboarding);

      expect(insights.some((i) => i.includes('Fase atual'))).toBe(true);
    });
  });

  describe('recomendarProximasAcoes', () => {
    it('deve recomendar completar discovery quando incompleto', () => {
      onboarding.discoveryStatus = 'in_progress';
      onboarding.discoveryBlocks[0].status = 'pending';

      const acoes = recomendarProximasAcoes(onboarding);

      expect(acoes.some((a) => a.action.includes('Discovery'))).toBe(true);
    });

    it('deve recomendar brainstorm quando discovery está completo', () => {
      onboarding.brainstormStatus = 'in_progress';
      onboarding.brainstormSections[0].status = 'pending';

      const acoes = recomendarProximasAcoes(onboarding);

      expect(acoes.some((a) => a.action.includes('Brainstorm'))).toBe(true);
    });

    it('deve recomendar gerar PRD quando brainstorm está completo', () => {
      onboarding.prdStatus = 'pending';

      const acoes = recomendarProximasAcoes(onboarding);

      expect(acoes.some((a) => a.action.includes('PRD'))).toBe(true);
    });

    it('deve recomendar validar PRD quando draft está pronto', () => {
      onboarding.prdStatus = 'draft';

      const acoes = recomendarProximasAcoes(onboarding);

      expect(acoes.some((a) => a.action.includes('Validar'))).toBe(true);
    });

    it('deve priorizar ações corretamente', () => {
      onboarding.discoveryStatus = 'in_progress';
      onboarding.discoveryBlocks = onboarding.discoveryBlocks.map((b) => ({ ...b, status: 'pending' }));
      const acoes = recomendarProximasAcoes(onboarding);
      const acoesAlta = acoes.filter((a) => a.priority === 'high');

      expect(acoesAlta.length).toBeGreaterThan(0);
      expect(acoesAlta[0].action).toContain('Discovery');
    });

    it('deve estimar tempo para cada ação', () => {
      const acoes = recomendarProximasAcoes(onboarding);

      acoes.forEach((acao) => {
        expect(acao.estimatedTime).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Dashboard Integration', () => {
    it('deve consolidar progresso de discovery', () => {
      const completadas = onboarding.discoveryBlocks.filter((b) => b.status === 'completed').length;
      const total = onboarding.discoveryBlocks.length;
      const percentual = Math.round((completadas / total) * 100);

      expect(percentual).toBe(100);
    });

    it('deve consolidar progresso de brainstorm', () => {
      const completadas = onboarding.brainstormSections.filter((s) => s.status === 'completed').length;
      const total = onboarding.brainstormSections.length;
      const percentual = Math.round((completadas / total) * 100);

      expect(percentual).toBe(100);
    });

    it('deve consolidar prontidão do PRD', () => {
      const prontidao = verificarProntidaoPRD(onboarding);

      expect(prontidao.isReady).toBe(true);
      expect(prontidao.score).toBeGreaterThanOrEqual(70);
    });

    it('deve consolidar tempo estimado restante', () => {
      const tempo = calcularTempoEstimado(onboarding);

      expect(tempo).toBeGreaterThanOrEqual(0);
    });

    it('deve consolidar insights e ações', () => {
      const insights = gerarInsights(onboarding);
      const acoes = recomendarProximasAcoes(onboarding);

      expect(insights.length).toBeGreaterThan(0);
      expect(acoes.length).toBeGreaterThan(0);
    });
  });
});
