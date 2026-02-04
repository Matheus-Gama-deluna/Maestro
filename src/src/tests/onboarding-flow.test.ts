/**
 * Testes para o fluxo de onboarding otimizado
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { OnboardingState, DiscoveryBlock } from '../types/onboarding.js';
import {
  gerarBlocosDiscovery,
  calcularProgressoDiscovery,
  validarBlocoCompleto,
  extrairRespostasDiscovery,
  gerarResumoDiscovery,
} from '../utils/discovery-adapter.js';

describe('Discovery Adapter', () => {
  describe('gerarBlocosDiscovery', () => {
    it('deve gerar blocos básicos para modo economy', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      expect(blocos.length).toBe(3); // projeto-basico, escopo-mvp, tecnico
      expect(blocos[0].id).toBe('projeto-basico');
      expect(blocos[0].required).toBe(true);
    });

    it('deve gerar mais blocos para modo balanced', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'balanced',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      expect(blocos.length).toBe(5); // adiciona time-infraestrutura e requisitos-criticos
      expect(blocos.some((b) => b.id === 'time-infraestrutura')).toBe(true);
    });

    it('deve gerar todos os blocos para modo quality', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'quality',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      expect(blocos.length).toBe(8); // adiciona dados-analytics, ux-design, orcamento-restricoes
      expect(blocos.some((b) => b.id === 'dados-analytics')).toBe(true);
      expect(blocos.some((b) => b.id === 'ux-design')).toBe(true);
      expect(blocos.some((b) => b.id === 'orcamento-restricoes')).toBe(true);
    });

    it('deve pré-preencher campos com dados existentes', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
        existingData: {
          nome_projeto: 'PulseTrack',
          problema: 'Monitorar saúde ocupacional',
        },
      });

      const blocoBasico = blocos[0];
      const nomeField = blocoBasico.fields.find((f) => f.id === 'nome_projeto');
      const problemaField = blocoBasico.fields.find((f) => f.id === 'problema');

      expect(nomeField?.value).toBe('PulseTrack');
      expect(nomeField?.filled).toBe(true);
      expect(problemaField?.value).toBe('Monitorar saúde ocupacional');
      expect(problemaField?.filled).toBe(true);
    });
  });

  describe('calcularProgressoDiscovery', () => {
    it('deve calcular progresso corretamente', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      // Marcar primeiro bloco como completo
      blocos[0].status = 'completed';

      const progresso = calcularProgressoDiscovery(blocos);

      expect(progresso.completados).toBe(1);
      expect(progresso.total).toBe(3);
      expect(progresso.percentual).toBe(33);
      expect(progresso.proximoBloco?.id).toBe('escopo-mvp');
    });

    it('deve retornar undefined para proximoBloco quando todos estão completos', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      blocos.forEach((b) => (b.status = 'completed'));

      const progresso = calcularProgressoDiscovery(blocos);

      expect(progresso.completados).toBe(3);
      expect(progresso.percentual).toBe(100);
      expect(progresso.proximoBloco).toBeUndefined();
    });
  });

  describe('validarBlocoCompleto', () => {
    it('deve validar bloco com todos os campos obrigatórios preenchidos', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      const bloco = blocos[0];
      bloco.fields.forEach((f) => {
        if (f.required) {
          f.filled = true;
          f.value = 'valor_teste';
        }
      });

      const validacao = validarBlocoCompleto(bloco);

      expect(validacao.valido).toBe(true);
      expect(validacao.camposFaltantes.length).toBe(0);
    });

    it('deve detectar campos obrigatórios faltando', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      const bloco = blocos[0];
      // Não preencher nenhum campo

      const validacao = validarBlocoCompleto(bloco);

      expect(validacao.valido).toBe(false);
      expect(validacao.camposFaltantes.length).toBeGreaterThan(0);
      expect(validacao.camposFaltantes).toContain('Nome do projeto');
    });
  });

  describe('extrairRespostasDiscovery', () => {
    it('deve extrair respostas dos blocos preenchidos', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      blocos[0].fields[0].filled = true;
      blocos[0].fields[0].value = 'PulseTrack';
      blocos[0].fields[1].filled = true;
      blocos[0].fields[1].value = 'Monitorar saúde ocupacional';

      const respostas = extrairRespostasDiscovery(blocos);

      expect(respostas.nome_projeto).toBe('PulseTrack');
      expect(respostas.problema).toBe('Monitorar saúde ocupacional');
    });

    it('deve ignorar campos não preenchidos', () => {
      const blocos = gerarBlocosDiscovery({
        mode: 'economy',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      });

      blocos[0].fields[0].filled = true;
      blocos[0].fields[0].value = 'PulseTrack';
      // Não preencher o segundo campo

      const respostas = extrairRespostasDiscovery(blocos);

      expect(respostas.nome_projeto).toBe('PulseTrack');
      expect(respostas.problema).toBeUndefined();
    });
  });

  describe('gerarResumoDiscovery', () => {
    it('deve gerar resumo formatado com respostas', () => {
      const respostas = {
        nome_projeto: 'PulseTrack',
        problema: 'Monitorar saúde ocupacional',
        publico_alvo: 'Empresas e profissionais de saúde',
        funcionalidades_principais: ['Dashboard', 'Alertas', 'Relatórios'],
        plataformas: ['Web', 'Mobile'],
        cronograma: '6 meses',
        stack_preferida: 'React + Node.js',
      };

      const resumo = gerarResumoDiscovery(respostas);

      expect(resumo).toContain('PulseTrack');
      expect(resumo).toContain('Monitorar saúde ocupacional');
      expect(resumo).toContain('Dashboard, Alertas, Relatórios');
      expect(resumo).toContain('Web, Mobile');
      expect(resumo).toContain('React + Node.js');
    });

    it('deve gerar resumo mesmo com respostas parciais', () => {
      const respostas = {
        nome_projeto: 'PulseTrack',
        problema: 'Monitorar saúde ocupacional',
      };

      const resumo = gerarResumoDiscovery(respostas);

      expect(resumo).toContain('PulseTrack');
      expect(resumo).toContain('Monitorar saúde ocupacional');
      expect(resumo.length).toBeGreaterThan(0);
    });
  });
});

describe('OnboardingState', () => {
  let onboarding: OnboardingState;

  beforeEach(() => {
    onboarding = {
      projectId: 'test-project-123',
      phase: 'discovery',
      discoveryStatus: 'in_progress',
      discoveryBlocks: gerarBlocosDiscovery({
        mode: 'balanced',
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
      }),
      discoveryResponses: {},
      brainstormStatus: 'pending',
      brainstormSections: [],
      prdStatus: 'pending',
      prdScore: 0,
      mode: 'balanced',
      totalInteractions: 0,
    };
  });

  it('deve inicializar com estado correto', () => {
    expect(onboarding.phase).toBe('discovery');
    expect(onboarding.discoveryStatus).toBe('in_progress');
    expect(onboarding.discoveryBlocks.length).toBe(5);
    expect(onboarding.totalInteractions).toBe(0);
  });

  it('deve rastrear progresso do discovery', () => {
    onboarding.discoveryBlocks[0].status = 'completed';
    onboarding.totalInteractions++;

    const progresso = calcularProgressoDiscovery(onboarding.discoveryBlocks);
    expect(progresso.completados).toBe(1);
    expect(onboarding.totalInteractions).toBe(1);
  });

  it('deve marcar discovery como completo quando todos os blocos obrigatórios estão completos', () => {
    onboarding.discoveryBlocks
      .filter((b) => b.required)
      .forEach((b) => (b.status = 'completed'));

    const todosObrigatoriosCompletos = onboarding.discoveryBlocks
      .filter((b) => b.required)
      .every((b) => b.status === 'completed');

    expect(todosObrigatoriosCompletos).toBe(true);
  });
});
