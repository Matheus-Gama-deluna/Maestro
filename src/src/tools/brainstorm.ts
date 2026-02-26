/**
 * Tool: Brainstorm Assistido
 * Gera prompts estruturados para brainstorm e consolida respostas em PRD draft
 */

import type { ToolResult } from "../types/index.js";
import type { BrainstormSection, OnboardingState } from "../types/onboarding.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolveProjectPath } from "../utils/files.js";
import { saveFile } from "../utils/persistence.js";

interface BrainstormArgs {
  estado_json: string;
  diretorio: string;
  acao?: 'iniciar' | 'proximo_secao' | 'status';
  resposta_secao?: string;
}

/**
 * Gera seções de brainstorm baseadas no discovery
 */
function gerarSecoesBrainstorm(discoveryResponses: Record<string, any>): BrainstormSection[] {
  const secoes: BrainstormSection[] = [];

  // Seção 1: Problema e Oportunidade
  secoes.push({
    id: 'problema-oportunidade',
    title: 'Problema e Oportunidade',
    description: 'Defina o problema de forma quantificada e a oportunidade de mercado',
    prompt: `Com base no discovery:
- **Problema:** ${discoveryResponses.problema || 'A definir'}
- **Público-alvo:** ${discoveryResponses.publico_alvo || 'A definir'}

Elabore:
1. **Problema quantificado:** Qual é o impacto atual? (números, percentuais, custos)
2. **Oportunidade:** Qual é o tamanho do mercado? Qual é o potencial de crescimento?
3. **Urgência:** Por que resolver agora? Qual é o contexto de mercado?
4. **Diferenciais:** Como sua solução é diferente das alternativas existentes?

Forneça uma análise estruturada com dados concretos.`,
    expectedOutput: 'Análise de 200-300 palavras com números, contexto de mercado e diferenciais',
    status: 'pending',
    order: 1,
  });

  // Seção 2: Personas e Jobs to Be Done
  secoes.push({
    id: 'personas-jtbd',
    title: 'Personas e Jobs to Be Done',
    description: 'Defina 2-3 personas principais e seus jobs to be done',
    prompt: `Com base no público-alvo: ${discoveryResponses.publico_alvo || 'A definir'}

Crie 2-3 personas detalhadas:

Para cada persona:
1. **Nome e perfil:** Idade, profissão, contexto
2. **Motivações:** O que os move? Quais são seus objetivos?
3. **Dores:** Quais são os problemas que enfrentam?
4. **Job to Be Done:** O que eles tentam realizar? (não é sobre o produto, é sobre o objetivo)
5. **Métrica de sucesso:** Como eles medem sucesso?

Forneça personas realistas e acionáveis.`,
    expectedOutput: 'Descrição de 2-3 personas com JTBD, dores e motivações',
    status: 'pending',
    order: 2,
  });

  // Seção 3: MVP e Funcionalidades
  secoes.push({
    id: 'mvp-funcionalidades',
    title: 'MVP e Funcionalidades Priorizadas',
    description: 'Refine as funcionalidades principais e priorize com RICE',
    prompt: `Com base nas funcionalidades iniciais: ${
      Array.isArray(discoveryResponses.funcionalidades_principais)
        ? discoveryResponses.funcionalidades_principais.join(', ')
        : discoveryResponses.funcionalidades_principais || 'A definir'
    }

Refine e priorize:
1. **Funcionalidades do MVP:** Liste 3-5 features essenciais
2. **Critério RICE para cada feature:**
   - Reach: Quantos usuários serão impactados?
   - Impact: Qual é o impacto por usuário? (3=massivo, 2=alto, 1=médio, 0.5=baixo, 0.25=mínimo)
   - Confidence: Qual é sua confiança? (100%, 80%, 50%)
   - Effort: Quantas semanas de trabalho?
3. **Score RICE:** (Reach × Impact × Confidence) / Effort
4. **Ordem de priorização:** Ordene por score RICE

Forneça uma matriz RICE estruturada.`,
    expectedOutput: 'Matriz RICE com 3-5 features, scores e ordem de priorização',
    status: 'pending',
    order: 3,
  });

  // Seção 4: Métricas de Sucesso
  secoes.push({
    id: 'metricas-sucesso',
    title: 'Métricas de Sucesso e North Star',
    description: 'Defina North Star Metric e KPIs secundários',
    prompt: `Para o projeto: ${discoveryResponses.nome_projeto || 'A definir'}

Defina métricas de sucesso:
1. **North Star Metric:** Qual é a métrica principal que reflete valor ao usuário?
   - Deve ser mensurável
   - Deve ser influenciável pelo time
   - Deve levar a revenue sustentável
2. **KPIs Secundários:** 3-5 métricas que suportam a North Star
   - Acquisition: Como atrair usuários?
   - Activation: Como ativar usuários?
   - Retention: Como manter usuários?
   - Revenue: Como gerar receita?
   - Referral: Como usuários trazem outros?
3. **Baseline e Meta:** Qual é o valor atual? Qual é a meta em 6 meses?

Forneça métricas SMART (Specific, Measurable, Achievable, Relevant, Time-bound).`,
    expectedOutput: 'North Star Metric + 5 KPIs com baseline, meta e frequência de medição',
    status: 'pending',
    order: 4,
  });

  // Seção 5: Riscos e Mitigações
  secoes.push({
    id: 'riscos-mitigacoes',
    title: 'Riscos e Planos de Mitigação',
    description: 'Identifique riscos principais e planos de mitigação',
    prompt: `Para o projeto: ${discoveryResponses.nome_projeto || 'A definir'}

Identifique riscos:
1. **Riscos de Mercado:** Aceitação do mercado? Competição?
2. **Riscos Técnicos:** Stack? Escalabilidade? Integrações?
3. **Riscos de Time:** Experiência? Recursos? Timeline?
4. **Riscos de Negócio:** Budget? Stakeholders? Regulamentações?

Para cada risco:
- **Descrição:** O que pode dar errado?
- **Probabilidade:** Alta, Média, Baixa
- **Impacto:** Alto, Médio, Baixo
- **Plano de Mitigação:** Como evitar ou minimizar?
- **Plano de Contingência:** Se acontecer, qual é o plano B?

Forneça 5-7 riscos com planos de mitigação.`,
    expectedOutput: 'Matriz de riscos com 5-7 itens, probabilidade, impacto e planos',
    status: 'pending',
    order: 5,
  });

  return secoes;
}

/**
 * Formata seção de brainstorm para apresentação
 */
function formatarSecaoBrainstorm(secao: BrainstormSection): string {
  const linhas: string[] = [];

  linhas.push(`## ${secao.title}\n`);
  linhas.push(`${secao.description}\n`);
  linhas.push('---\n');
  linhas.push(`### Prompt\n`);
  linhas.push(secao.prompt);
  linhas.push('\n---\n');
  linhas.push(`### Resultado Esperado\n`);
  linhas.push(secao.expectedOutput);
  linhas.push('\n');

  return linhas.join('\n');
}

/**
 * Tool: brainstorm
 * Orquestra brainstorm estruturado
 */
export async function brainstorm(args: BrainstormArgs): Promise<ToolResult> {
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

  const acao = args.acao || 'iniciar';

  // Obter estado de onboarding
  const onboarding = estado.onboarding;
  if (!onboarding) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhum estado de onboarding encontrado. Execute discovery primeiro.",
      }],
      isError: true,
    };
  }

  // Caminho B: permitir brainstorm exploratório mesmo sem discovery completo
  const discoveryIncompleto = onboarding.discoveryStatus !== 'completed';

  if (acao === 'iniciar') {
    return handleIniciarBrainstorm(onboarding, estado, diretorio, discoveryIncompleto);
  } else if (acao === 'proximo_secao') {
    return handleProximaSecao(onboarding, estado, diretorio, args.resposta_secao);
  } else if (acao === 'status') {
    return handleStatusBrainstorm(onboarding);
  }

  return {
    content: [{
      type: "text",
      text: `❌ **Erro**: Ação desconhecida: ${acao}`,
    }],
    isError: true,
  };
}

/**
 * Handler: iniciar brainstorm
 */
async function handleIniciarBrainstorm(
  onboarding: OnboardingState,
  estado: any,
  diretorio: string,
  discoveryIncompleto: boolean = false
): Promise<ToolResult> {
  // Gerar seções de brainstorm
  if (onboarding.brainstormSections.length === 0) {
    onboarding.brainstormSections = gerarSecoesBrainstorm(onboarding.discoveryResponses);
  }

  onboarding.brainstormStatus = 'in_progress';
  onboarding.phase = 'brainstorm';
  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  const proximaSecao = onboarding.brainstormSections.find((s) => s.status === 'pending');

  if (!proximaSecao) {
    return {
      content: [{
        type: "text",
        text: "✅ **Brainstorm já concluído!** Todas as seções foram preenchidas.",
      }],
      next_action: {
        tool: "executar",
        description: "Gerar PRD a partir do brainstorm e discovery",
        args_template: { diretorio: diretorio, acao: "avancar" },
        requires_user_input: false,
        auto_execute: true,
      },
    };
  }

  const secaoFormatada = formatarSecaoBrainstorm(proximaSecao);
  const progresso = onboarding.brainstormSections.filter((s) => s.status === 'completed').length;
  const total = onboarding.brainstormSections.length;

  const avisoDiscovery = discoveryIncompleto
    ? `\n> ⚠️ **Modo Exploratório**: Discovery não foi concluído. Algumas seções podem ter dados incompletos. Você pode voltar ao discovery depois.\n`
    : '';

  const resposta = `# 🧠 Brainstorm Assistido

**Projeto:** ${estado.nome}  
**Progresso:** ${progresso}/${total} seções (${Math.round((progresso / total) * 100)}%)
${avisoDiscovery}
---

${secaoFormatada}

---

**Tempo estimado:** 10-15 minutos para esta seção
`;

  return {
    content: [{ type: "text", text: resposta }],
    next_action: {
      tool: "executar",
      description: `Responder à seção "${proximaSecao.title}" do brainstorm`,
      args_template: {
        diretorio: diretorio,
        acao: "avancar",
        respostas: { resposta_secao: `<Resposta para: ${proximaSecao.title}>` },
      },
      requires_user_input: true,
      user_prompt: proximaSecao.prompt,
    },
    progress: {
      current_phase: "brainstorm",
      total_phases: 4,
      completed_phases: 1,
      percentage: Math.round(25 + (progresso / total) * 25),
    },
  };
}

/**
 * Handler: processar próxima seção
 */
async function handleProximaSecao(
  onboarding: OnboardingState,
  estado: any,
  diretorio: string,
  resposta?: string
): Promise<ToolResult> {
  if (!resposta || resposta.trim().length === 0) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhuma resposta fornecida. Use `resposta_secao` para enviar sua resposta.",
      }],
      isError: true,
    };
  }

  // Encontrar seção atual
  const secaoAtual = onboarding.brainstormSections.find((s) => s.status === 'pending');
  if (!secaoAtual) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhuma seção em progresso encontrada.",
      }],
      isError: true,
    };
  }

  // Salvar resposta
  secaoAtual.response = resposta;
  secaoAtual.status = 'completed';

  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  // Calcular progresso
  const completadas = onboarding.brainstormSections.filter((s) => s.status === 'completed').length;
  const total = onboarding.brainstormSections.length;

  // Persistir estado atualizado
  estado.onboarding = onboarding;
  estado.atualizado_em = new Date().toISOString();
  const estadoFile = serializarEstado(estado);

  // Verificar se todas as seções foram completadas
  if (completadas === total) {
    onboarding.brainstormStatus = 'completed';
    onboarding.brainstormCompletedAt = new Date().toISOString();
    onboarding.phase = 'prd_draft';

    // Re-serializar com status final
    estado.onboarding = onboarding;
    const estadoFileFinal = serializarEstado(estado);

    const resposta = `# ✅ Brainstorm Concluído!

Todas as seções foram preenchidas com sucesso.

---

## 📊 Resumo do Brainstorm

**Seções completadas:** ${completadas}/${total}

${onboarding.brainstormSections.map((s, i) => `${i + 1}. ✅ ${s.title}`).join('\n')}

---

## 🎯 Próximos Passos

Agora vamos consolidar todos os insights em um **PRD Draft** estruturado.

**Tempo estimado:** 5-10 minutos
`;

    // v5.3: Persistência direta
    try {
      await saveFile(`${diretorio}/${estadoFileFinal.path}`, estadoFileFinal.content);
    } catch (err) {
      console.error('[brainstorm] Erro ao salvar estado:', err);
    }

    return {
      content: [{ type: "text", text: resposta }],
      estado_atualizado: estadoFileFinal.content,
      next_action: {
        tool: "executar",
        description: "Gerar PRD a partir do brainstorm e discovery",
        args_template: { diretorio: diretorio, acao: "avancar" },
        requires_user_input: false,
        auto_execute: true,
      },
      progress: {
        current_phase: "brainstorm",
        total_phases: 4,
        completed_phases: 2,
        percentage: 50,
      },
    };
  }

  // Continuar para próxima seção
  const proximaSecao = onboarding.brainstormSections.find((s) => s.status === 'pending');

  if (proximaSecao) {
    const secaoFormatada = formatarSecaoBrainstorm(proximaSecao);

    const resposta = `# ✅ Seção Concluída!

**${secaoAtual.title}** foi salvo com sucesso.

---

## 📊 Progresso

${completadas}/${total} seções concluídas (${Math.round((completadas / total) * 100)}%)

---

## 🔄 Próxima Seção

${secaoFormatada}

---

**Tempo estimado:** 10-15 minutos
`;

    // v5.3: Persistência direta
    try {
      await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
      console.error('[brainstorm] Erro ao salvar estado:', err);
    }

    return {
      content: [{ type: "text", text: resposta }],
      estado_atualizado: estadoFile.content,
      next_action: {
        tool: "executar",
        description: `Responder à seção "${proximaSecao.title}"`,
        args_template: {
          diretorio: diretorio,
          acao: "avancar",
          respostas: { resposta_secao: `<Resposta para: ${proximaSecao.title}>` },
        },
        requires_user_input: true,
        user_prompt: proximaSecao.prompt,
      },
      progress: {
        current_phase: "brainstorm",
        total_phases: 4,
        completed_phases: 1,
        percentage: Math.round(25 + (completadas / total) * 25),
      },
    };
  }

  // v5.3: Persistência direta
  try {
    await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
  } catch (err) {
    console.error('[brainstorm] Erro ao salvar estado:', err);
  }

  return {
    content: [{ type: "text", text: "✅ **Brainstorm concluído!** Todas as seções foram preenchidas." }],
    estado_atualizado: estadoFile.content,
    next_action: {
      tool: "executar",
      description: "Gerar PRD a partir do brainstorm e discovery",
      args_template: { diretorio: diretorio, acao: "avancar" },
      requires_user_input: false,
      auto_execute: true,
    },
  };
}

/**
 * Handler: status do brainstorm
 */
function handleStatusBrainstorm(onboarding: OnboardingState): ToolResult {
  const completadas = onboarding.brainstormSections.filter((s) => s.status === 'completed').length;
  const total = onboarding.brainstormSections.length;

  const linhas: string[] = [];
  linhas.push('# 📊 Status do Brainstorm\n');
  linhas.push(`**Status:** ${onboarding.brainstormStatus}`);
  linhas.push(`**Progresso:** ${completadas}/${total} seções (${Math.round((completadas / total) * 100)}%)\n`);

  linhas.push('## Seções\n');
  onboarding.brainstormSections.forEach((secao) => {
    const icon = secao.status === 'completed' ? '✅' : '⏳';
    linhas.push(`${icon} ${secao.title}`);
  });

  return {
    content: [{
      type: "text",
      text: linhas.join('\n'),
    }],
  };
}

export const brainstormSchema = {
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
    acao: {
      type: "string",
      enum: ["iniciar", "proximo_secao", "status"],
      description: "Ação a executar",
    },
    resposta_secao: {
      type: "string",
      description: "Resposta para a seção de brainstorm",
    },
  },
  required: ["estado_json", "diretorio"],
};
