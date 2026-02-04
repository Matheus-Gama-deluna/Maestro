/**
 * Verificador de prontidão (readiness) para PRD
 * Calcula score e identifica lacunas antes da validação final
 */

import type { OnboardingState, ReadinessCheckResult } from "../types/onboarding.js";

/**
 * Verifica prontidão do PRD para validação
 */
export function verificarProntidaoPRD(onboarding: OnboardingState): ReadinessCheckResult {
  const checklist: Record<string, boolean> = {};
  const missingFields: string[] = [];
  const recommendations: string[] = [];

  const discoveryCompleto = onboarding.discoveryStatus === 'completed';
  const brainstormCompleto = onboarding.brainstormStatus === 'completed';

  // Verificar discovery
  checklist['Discovery completo'] = discoveryCompleto;
  if (!discoveryCompleto) {
    missingFields.push('Discovery não foi concluído');
    recommendations.push('Complete o discovery com todas as informações do projeto');
  }

  // Verificar brainstorm
  checklist['Brainstorm completo'] = brainstormCompleto;
  if (!brainstormCompleto) {
    missingFields.push('Brainstorm não foi concluído');
    recommendations.push('Complete o brainstorm com análises estruturadas');
  }

  // Verificar campos obrigatórios do discovery
  const camposObrigatorios = [
    'nome_projeto',
    'problema',
    'publico_alvo',
    'funcionalidades_principais',
    'cronograma',
    'plataformas',
  ];

  camposObrigatorios.forEach((campo) => {
    const preenchido = onboarding.discoveryResponses[campo] !== undefined && 
                      onboarding.discoveryResponses[campo] !== null &&
                      onboarding.discoveryResponses[campo] !== '';
    
    checklist[`Campo: ${campo}`] = preenchido;
    
    if (!preenchido) {
      missingFields.push(`Campo obrigatório não preenchido: ${campo}`);
    }
  });

  // Verificar seções de brainstorm
  if (onboarding.brainstormStatus === 'completed') {
    const secoesCriticas = [
      'problema-oportunidade',
      'personas-jtbd',
      'mvp-funcionalidades',
      'metricas-sucesso',
      'riscos-mitigacoes',
    ];

    secoesCriticas.forEach((secaoId) => {
      const secao = onboarding.brainstormSections.find((s) => s.id === secaoId);
      const temResposta = secao && secao.response && secao.response.length > 100;
      
      checklist[`Seção: ${secaoId}`] = temResposta || false;
      
      if (!temResposta) {
        missingFields.push(`Seção de brainstorm incompleta: ${secaoId}`);
        recommendations.push(`Revise a seção "${secaoId}" com mais detalhes`);
      }
    });
  }

  // Calcular score
  const itemsValidados = Object.values(checklist).filter((v) => v).length;
  const totalItems = Object.keys(checklist).length;
  const score = Math.round((itemsValidados / totalItems) * 100);
  const estaPronto = score >= 70 && discoveryCompleto && brainstormCompleto;

  // Gerar próximas ações
  const nextActions: string[] = [];
  if (estaPronto && score >= 90) {
    nextActions.push('✅ PRD está pronto para validação final');
    nextActions.push('Execute: prd_writer(acao: "validar")');
  } else if (score >= 70) {
    nextActions.push('⚠️ PRD tem lacunas menores');
    nextActions.push('Revise as seções incompletas');
    nextActions.push('Execute: prd_writer(acao: "validar")');
  } else {
    nextActions.push('❌ PRD não está pronto');
    nextActions.push('Complete os campos e seções faltando');
    nextActions.push('Retorne ao discovery ou brainstorm conforme necessário');
  }

  return {
    isReady: estaPronto,
    score,
    completedFields: itemsValidados,
    totalFields: totalItems,
    missingFields,
    recommendations,
    nextActions,
  };
}

/**
 * Calcula tempo estimado restante
 */
export function calcularTempoEstimado(onboarding: OnboardingState): number {
  let tempoRestante = 0;

  if (onboarding.discoveryStatus !== 'completed') {
    const blocosPendentes = onboarding.discoveryBlocks?.filter((b) => b.status === 'pending').length || 0;
    tempoRestante += blocosPendentes * 5; // 5 minutos por bloco
  }

  if (onboarding.brainstormStatus !== 'completed') {
    const secoesPendentes = onboarding.brainstormSections?.filter((s) => s.status === 'pending').length || 0;
    tempoRestante += secoesPendentes * 10; // 10 minutos por seção
  }

  if (onboarding.prdStatus !== 'validated') {
    tempoRestante += 5; // 5 minutos para validação
  }

  return tempoRestante;
}

/**
 * Gera insights sobre o progresso
 */
export function gerarInsights(onboarding: OnboardingState): string[] {
  const insights: string[] = [];

  // Insights sobre discovery
  if (onboarding.discoveryStatus === 'completed') {
    insights.push('✅ Discovery concluído com sucesso');
    
    if (onboarding.discoveryResponses.stack_preferida) {
      insights.push(`📚 Stack identificada: ${onboarding.discoveryResponses.stack_preferida}`);
    }
    
    if (onboarding.discoveryResponses.cronograma) {
      insights.push(`⏱️ Timeline: ${onboarding.discoveryResponses.cronograma}`);
    }
  }

  // Insights sobre brainstorm
  if (onboarding.brainstormStatus === 'completed') {
    insights.push('✅ Brainstorm concluído com sucesso');
    
    const secoesCriticas = onboarding.brainstormSections.filter((s) => s.status === 'completed');
    insights.push(`📊 ${secoesCriticas.length} seções de análise completadas`);
  }

  // Insights sobre PRD
  if (onboarding.prdStatus === 'draft') {
    insights.push('📄 PRD draft gerado');
  } else if (onboarding.prdStatus === 'validated') {
    insights.push(`✅ PRD validado com score ${onboarding.prdScore}/100`);
  }

  // Insights sobre progresso geral
  const faseAtual = onboarding.phase;
  if (faseAtual === 'discovery') {
    insights.push('🎯 Fase atual: Coleta de informações');
  } else if (faseAtual === 'brainstorm') {
    insights.push('🧠 Fase atual: Análise e ideação');
  } else if (faseAtual === 'prd_draft') {
    insights.push('📋 Fase atual: Consolidação do PRD');
  } else if (faseAtual === 'validation') {
    insights.push('🔍 Fase atual: Validação final');
  }

  return insights;
}

/**
 * Recomenda próximas ações baseado no estado
 */
export function recomendarProximasAcoes(onboarding: OnboardingState): Array<{
  action: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
}> {
  const acoes: Array<{
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
  }> = [];

  if (onboarding.discoveryStatus !== 'completed') {
    const blocosPendentes = onboarding.discoveryBlocks?.filter((b) => b.status === 'pending') || [];
    if (blocosPendentes.length > 0) {
      acoes.push({
        action: 'Completar Discovery',
        description: `Preencha os ${blocosPendentes.length} blocos restantes de discovery`,
        priority: 'high',
        estimatedTime: blocosPendentes.length * 5,
      });
    }
  }

  if (onboarding.discoveryStatus === 'completed' && onboarding.brainstormStatus !== 'completed') {
    const secoesPendentes = onboarding.brainstormSections?.filter((s) => s.status === 'pending') || [];
    if (secoesPendentes.length > 0) {
      acoes.push({
        action: 'Iniciar Brainstorm',
        description: `Responda as ${secoesPendentes.length} seções de brainstorm estruturado`,
        priority: 'high',
        estimatedTime: secoesPendentes.length * 10,
      });
    }
  }

  if (onboarding.brainstormStatus === 'completed' && onboarding.prdStatus === 'pending') {
    acoes.push({
      action: 'Gerar PRD',
      description: 'Consolide o discovery e brainstorm em um PRD estruturado',
      priority: 'high',
      estimatedTime: 5,
    });
  }

  if (onboarding.prdStatus === 'draft') {
    acoes.push({
      action: 'Validar PRD',
      description: 'Verifique completude e qualidade do PRD draft',
      priority: 'high',
      estimatedTime: 5,
    });
  }

  if (onboarding.prdStatus === 'validated' && onboarding.prdScore >= 70) {
    acoes.push({
      action: 'Avançar para Fase 1',
      description: 'PRD validado! Pronto para iniciar a Fase 1 (Produto)',
      priority: 'high',
      estimatedTime: 0,
    });
  }

  // Ações de refinamento (prioridade média)
  if (onboarding.discoveryStatus === 'completed') {
    acoes.push({
      action: 'Revisar Discovery',
      description: 'Revise e refine as informações coletadas se necessário',
      priority: 'medium',
      estimatedTime: 10,
    });
  }

  if (onboarding.brainstormStatus === 'completed') {
    acoes.push({
      action: 'Revisar Brainstorm',
      description: 'Revise as análises e insights gerados',
      priority: 'medium',
      estimatedTime: 10,
    });
  }

  return acoes;
}
