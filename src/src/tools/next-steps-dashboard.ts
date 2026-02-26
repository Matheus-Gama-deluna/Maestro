/**
 * Tool: Next Steps Dashboard
 * Apresenta painel consolidado de progresso e próximas ações
 */

import type { ToolResult } from "../types/index.js";
import type { OnboardingState, NextStepsDashboard } from "../types/onboarding.js";
import { parsearEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolveProjectPath } from "../utils/files.js";
import { calcularProgressoDiscovery } from "../utils/discovery-adapter.js";
import {
  verificarProntidaoPRD,
  calcularTempoEstimado,
  gerarInsights,
  recomendarProximasAcoes,
} from "../utils/readiness-checker.js";

interface NextStepsDashboardArgs {
  estado_json: string;
  diretorio: string;
}

/**
 * Gera dashboard de próximos passos
 */
function gerarDashboard(onboarding: OnboardingState): NextStepsDashboard {
  const progressoDiscovery = calcularProgressoDiscovery(onboarding.discoveryBlocks || []);
  const progressoBrainstorm = onboarding.brainstormSections?.length || 0;
  const completadasBrainstorm = onboarding.brainstormSections?.filter((s) => s.status === 'completed').length || 0;

  const prontidao = verificarProntidaoPRD(onboarding);
  const tempoRestante = calcularTempoEstimado(onboarding);
  const acoes = recomendarProximasAcoes(onboarding);

  return {
    discoveryStatus: {
      completed: progressoDiscovery.completados,
      total: progressoDiscovery.total,
      percentage: progressoDiscovery.percentual,
      nextBlock: progressoDiscovery.proximoBloco,
    },
    brainstormStatus: {
      completed: completadasBrainstorm,
      total: progressoBrainstorm,
      percentage: progressoBrainstorm > 0 ? Math.round((completadasBrainstorm / progressoBrainstorm) * 100) : 0,
      nextSection: onboarding.brainstormSections?.find((s) => s.status === 'pending'),
    },
    prdReadiness: prontidao,
    recommendedActions: acoes,
    estimatedTimeRemaining: tempoRestante,
    currentPhase: onboarding.phase,
  };
}

/**
 * Formata dashboard para apresentação
 */
function formatarDashboard(dashboard: NextStepsDashboard, onboarding: OnboardingState): string {
  const linhas: string[] = [];

  // Cabeçalho
  linhas.push('# 📊 Dashboard de Progresso\n');
  linhas.push(`**Fase Atual:** ${dashboard.currentPhase.toUpperCase()}`);
  linhas.push(`**Tempo Estimado Restante:** ${dashboard.estimatedTimeRemaining} minutos\n`);

  // Discovery
  linhas.push('---\n');
  linhas.push('## 🔍 Discovery\n');
  linhas.push(`**Progresso:** ${dashboard.discoveryStatus.completed}/${dashboard.discoveryStatus.total} blocos (${dashboard.discoveryStatus.percentage}%)`);

  if (dashboard.discoveryStatus.percentage === 100) {
    linhas.push('✅ **Discovery Concluído!**\n');
  } else if (dashboard.discoveryStatus.nextBlock) {
    linhas.push(`⏳ **Próximo bloco:** ${dashboard.discoveryStatus.nextBlock.title}\n`);
  }

  // Brainstorm
  linhas.push('---\n');
  linhas.push('## 🧠 Brainstorm\n');
  linhas.push(`**Progresso:** ${dashboard.brainstormStatus.completed}/${dashboard.brainstormStatus.total} seções (${dashboard.brainstormStatus.percentage}%)`);

  if (dashboard.brainstormStatus.percentage === 100) {
    linhas.push('✅ **Brainstorm Concluído!**\n');
  } else if (dashboard.brainstormStatus.nextSection) {
    linhas.push(`⏳ **Próxima seção:** ${dashboard.brainstormStatus.nextSection.title}\n`);
  } else if (dashboard.brainstormStatus.total === 0) {
    linhas.push('⏳ **Aguardando discovery completo...**\n');
  }

  // PRD Readiness
  linhas.push('---\n');
  linhas.push('## 📄 PRD Readiness\n');
  linhas.push(`**Score:** ${dashboard.prdReadiness.score}/100`);
  linhas.push(`**Campos Completos:** ${dashboard.prdReadiness.completedFields}/${dashboard.prdReadiness.totalFields}`);

  if (dashboard.prdReadiness.isReady) {
    linhas.push('✅ **PRD está pronto para validação!**\n');
  } else {
    linhas.push('⚠️ **PRD não está pronto**\n');

    if (dashboard.prdReadiness.missingFields.length > 0) {
      linhas.push('**Campos faltando:**');
      dashboard.prdReadiness.missingFields.slice(0, 3).forEach((field) => {
        linhas.push(`- ${field}`);
      });
      if (dashboard.prdReadiness.missingFields.length > 3) {
        linhas.push(`- ... e mais ${dashboard.prdReadiness.missingFields.length - 3}`);
      }
      linhas.push('');
    }
  }

  // Insights
  const insights = gerarInsights(onboarding);
  if (insights.length > 0) {
    linhas.push('---\n');
    linhas.push('## 💡 Insights\n');
    insights.forEach((insight) => {
      linhas.push(`${insight}`);
    });
    linhas.push('');
  }

  // Próximas Ações
  linhas.push('---\n');
  linhas.push('## 🎯 Próximas Ações Recomendadas\n');

  const acoesAlta = dashboard.recommendedActions.filter((a) => a.priority === 'high');
  const acoesMédia = dashboard.recommendedActions.filter((a) => a.priority === 'medium');

  if (acoesAlta.length > 0) {
    linhas.push('### 🔴 Alta Prioridade\n');
    acoesAlta.forEach((acao) => {
      linhas.push(`**${acao.action}** (${acao.estimatedTime} min)`);
      linhas.push(`${acao.description}\n`);
    });
  }

  if (acoesMédia.length > 0) {
    linhas.push('### 🟡 Média Prioridade\n');
    acoesMédia.forEach((acao) => {
      linhas.push(`**${acao.action}** (${acao.estimatedTime} min)`);
      linhas.push(`${acao.description}\n`);
    });
  }

  // CTA Único
  linhas.push('---\n');
  linhas.push('## ⚡ Próximo Passo\n');

  if (dashboard.discoveryStatus.percentage < 100) {
    linhas.push('👉 **Continue com o Discovery**\n');
    linhas.push('```\n');
    linhas.push('onboarding_orchestrator(\n');
    linhas.push('    estado_json: "...",\n');
    linhas.push('    diretorio: "...",\n');
    linhas.push('    acao: "proximo_bloco",\n');
    linhas.push('    respostas_bloco: { ... }\n');
    linhas.push(')\n');
    linhas.push('```\n');
  } else if (dashboard.brainstormStatus.percentage < 100) {
    linhas.push('👉 **Continue com o Brainstorm**\n');
    linhas.push('```\n');
    linhas.push('brainstorm(\n');
    linhas.push('    estado_json: "...",\n');
    linhas.push('    diretorio: "...",\n');
    linhas.push('    acao: "proximo_secao",\n');
    linhas.push('    resposta_secao: "Sua resposta aqui..."\n');
    linhas.push(')\n');
    linhas.push('```\n');
  } else if (onboarding.prdStatus === 'pending') {
    linhas.push('👉 **Gere o PRD Draft**\n');
    linhas.push('```\n');
    linhas.push('prd_writer(\n');
    linhas.push('    estado_json: "...",\n');
    linhas.push('    diretorio: "...",\n');
    linhas.push('    acao: "gerar"\n');
    linhas.push(')\n');
    linhas.push('```\n');
  } else if (onboarding.prdStatus === 'draft') {
    linhas.push('👉 **Valide o PRD**\n');
    linhas.push('```\n');
    linhas.push('prd_writer(\n');
    linhas.push('    estado_json: "...",\n');
    linhas.push('    diretorio: "...",\n');
    linhas.push('    acao: "validar"\n');
    linhas.push(')\n');
    linhas.push('```\n');
  } else if (onboarding.prdStatus === 'validated' && onboarding.prdScore >= 70) {
    linhas.push('👉 **PRD Validado! Pronto para Fase 1**\n');
    linhas.push('```\n');
    linhas.push('proximo(\n');
    linhas.push('    estado_json: "...",\n');
    linhas.push('    diretorio: "...",\n');
    linhas.push('    entregavel: "PRD validado"\n');
    linhas.push(')\n');
    linhas.push('```\n');
  }

  return linhas.join('\n');
}

/**
 * Tool: next_steps_dashboard
 * Apresenta dashboard consolidado de progresso
 */
export async function nextStepsDashboard(args: NextStepsDashboardArgs): Promise<ToolResult> {
  if (!args.estado_json) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Parâmetro `estado_json` é obrigatório.",
      }],
      isError: true,
    };
  }

  if (!args.diretorio) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
      }],
      isError: true,
    };
  }

  const estado = parsearEstado(args.estado_json);
  if (!estado) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
      }],
      isError: true,
    };
  }

  const diretorio = resolveProjectPath(args.diretorio);
  setCurrentDirectory(diretorio);

  // Obter estado de onboarding
  const onboarding = estado.onboarding;
  if (!onboarding) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhum estado de onboarding encontrado.",
      }],
      isError: true,
    };
  }

  // Gerar dashboard
  const dashboard = gerarDashboard(onboarding);
  const dashboardFormatado = formatarDashboard(dashboard, onboarding);

  return {
    content: [{
      type: "text",
      text: dashboardFormatado,
    }],
  };
}

export const nextStepsDashboardSchema = {
  type: "object",
  properties: {
    estado_json: {
      type: "string",
      description: "Conteúdo do arquivo .maestro/estado.json",
    },
    diretorio: {
      type: "string",
      description: "Diretório absoluto do projeto",
    },
  },
  required: ["estado_json", "diretorio"],
};
