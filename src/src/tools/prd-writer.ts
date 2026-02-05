/**
 * Tool: PRD Writer
 * Consolida brainstorm e discovery em um PRD estruturado e validado
 */

import type { ToolResult } from "../types/index.js";
import type { OnboardingState } from "../types/onboarding.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolveProjectPath } from "../utils/files.js";
import { calcularQualidade } from "../gates/quality-scorer.js";

interface PRDWriterArgs {
  estado_json: string;
  diretorio: string;
  acao?: 'gerar' | 'validar' | 'gerar_validar' | 'status';
}

/**
 * Gera PRD estruturado a partir do brainstorm e discovery
 */
function gerarPRDConteudo(onboarding: OnboardingState, nomeProjetoDiretorio: string): string {
  const linhas: string[] = [];

  // Cabeçalho
  linhas.push(`# PRD - ${onboarding.discoveryResponses.nome_projeto || 'Projeto'}`);
  linhas.push(`\n**Data:** ${new Date().toLocaleDateString('pt-BR')}`);
  linhas.push(`**Versão:** 1.0 (Draft)`);
  linhas.push(`**Status:** Em Validação\n`);

  // Sumário Executivo
  linhas.push('---\n');
  linhas.push('## 1. Sumário Executivo\n');

  const problemaSecao = onboarding.brainstormSections.find((s) => s.id === 'problema-oportunidade');
  if (problemaSecao?.response) {
    linhas.push('### Problema e Oportunidade\n');
    linhas.push(problemaSecao.response);
    linhas.push('\n');
  }

  // Personas
  linhas.push('---\n');
  linhas.push('## 2. Personas e Jobs to Be Done\n');

  const personasSecao = onboarding.brainstormSections.find((s) => s.id === 'personas-jtbd');
  if (personasSecao?.response) {
    linhas.push(personasSecao.response);
    linhas.push('\n');
  }

  // MVP e Funcionalidades
  linhas.push('---\n');
  linhas.push('## 3. MVP e Funcionalidades Priorizadas\n');

  const mvpSecao = onboarding.brainstormSections.find((s) => s.id === 'mvp-funcionalidades');
  if (mvpSecao?.response) {
    linhas.push(mvpSecao.response);
    linhas.push('\n');
  }

  // Métricas
  linhas.push('---\n');
  linhas.push('## 4. Métricas de Sucesso\n');

  const metricasSecao = onboarding.brainstormSections.find((s) => s.id === 'metricas-sucesso');
  if (metricasSecao?.response) {
    linhas.push(metricasSecao.response);
    linhas.push('\n');
  }

  // Riscos
  linhas.push('---\n');
  linhas.push('## 5. Riscos e Planos de Mitigação\n');

  const riscosSecao = onboarding.brainstormSections.find((s) => s.id === 'riscos-mitigacoes');
  if (riscosSecao?.response) {
    linhas.push(riscosSecao.response);
    linhas.push('\n');
  }

  // Contexto Técnico
  linhas.push('---\n');
  linhas.push('## 6. Contexto Técnico\n');

  linhas.push('### Stack Preferida\n');
  linhas.push(`${onboarding.discoveryResponses.stack_preferida || 'A sugerir baseado em requisitos'}\n`);

  linhas.push('### Plataformas\n');
  const plataformas = Array.isArray(onboarding.discoveryResponses.plataformas)
    ? onboarding.discoveryResponses.plataformas.join(', ')
    : onboarding.discoveryResponses.plataformas || 'A definir';
  linhas.push(`${plataformas}\n`);

  if (onboarding.discoveryResponses.integracoes_externas) {
    linhas.push('### Integrações Externas\n');
    linhas.push(`${onboarding.discoveryResponses.integracoes_externas}\n`);
  }

  // Timeline
  linhas.push('---\n');
  linhas.push('## 7. Timeline e Recursos\n');

  linhas.push(`### Cronograma Desejado\n`);
  linhas.push(`${onboarding.discoveryResponses.cronograma || 'A definir'}\n`);

  if (onboarding.discoveryResponses.tamanho_time) {
    linhas.push(`### Tamanho do Time\n`);
    linhas.push(`${onboarding.discoveryResponses.tamanho_time}\n`);
  }

  if (onboarding.discoveryResponses.experiencia_time) {
    linhas.push(`### Experiência do Time\n`);
    linhas.push(`${onboarding.discoveryResponses.experiencia_time}\n`);
  }

  // Requisitos Críticos
  linhas.push('---\n');
  linhas.push('## 8. Requisitos Críticos\n');

  if (onboarding.discoveryResponses.performance_esperada) {
    linhas.push(`### Performance\n`);
    linhas.push(`${onboarding.discoveryResponses.performance_esperada}\n`);
  }

  if (onboarding.discoveryResponses.seguranca_compliance && onboarding.discoveryResponses.seguranca_compliance.length > 0) {
    linhas.push(`### Compliance\n`);
    const compliance = Array.isArray(onboarding.discoveryResponses.seguranca_compliance)
      ? onboarding.discoveryResponses.seguranca_compliance.join(', ')
      : onboarding.discoveryResponses.seguranca_compliance;
    linhas.push(`${compliance}\n`);
  }

  if (onboarding.discoveryResponses.escalabilidade) {
    linhas.push(`### Escalabilidade\n`);
    linhas.push(`${onboarding.discoveryResponses.escalabilidade}\n`);
  }

  // Metadata
  linhas.push('---\n');
  linhas.push('## Metadata\n');
  linhas.push(`- **Modo:** ${onboarding.mode.toUpperCase()}`);
  linhas.push(`- **Criado em:** ${new Date().toISOString()}`);
  linhas.push(`- **Total de interações:** ${onboarding.totalInteractions}`);

  return linhas.join('\n');
}

/**
 * Tool: prd_writer
 * Gera, valida e consolida PRD
 */
export async function prdWriter(args: PRDWriterArgs): Promise<ToolResult> {
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

  const acao = args.acao || 'gerar';

  // Obter estado de onboarding
  const onboarding = (estado as any).onboarding as OnboardingState | undefined;
  if (!onboarding) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhum estado de onboarding encontrado.",
      }],
      isError: true,
    };
  }

  if (acao === 'gerar') {
    return handleGerarPRD(onboarding, estado, diretorio);
  } else if (acao === 'validar') {
    return handleValidarPRD(onboarding, estado, diretorio);
  } else if (acao === 'gerar_validar') {
    return handleGerarValidarPRD(onboarding, estado, diretorio);
  } else if (acao === 'status') {
    return handleStatusPRD(onboarding);
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
 * Handler: gerar PRD
 */
function handleGerarPRD(
  onboarding: OnboardingState,
  estado: any,
  diretorio: string
): ToolResult {
  if (onboarding.brainstormStatus !== 'completed') {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Brainstorm não foi concluído. Complete o brainstorm antes de gerar o PRD.",
      }],
      isError: true,
    };
  }

  // Gerar conteúdo do PRD
  const prdConteudo = gerarPRDConteudo(onboarding, estado.nome);

  // Atualizar estado
  onboarding.prdStatus = 'draft';
  onboarding.phase = 'prd_draft';
  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  const estadoAtualizado = {
    ...estado,
    onboarding,
    atualizado_em: new Date().toISOString(),
  };

  const estadoFile = serializarEstado(estadoAtualizado);

  const resposta = `# ✅ PRD Draft Gerado!

O PRD foi consolidado a partir do discovery e brainstorm.

---

## 📄 Conteúdo do PRD

\`\`\`markdown
${prdConteudo.substring(0, 500)}...
\`\`\`

---

## 🔍 Próximos Passos

1. **Revisar PRD:** Verifique se todos os detalhes estão corretos
2. **Validar Completude:** Use \`prd_writer(estado_json: "...", diretorio: "...", acao: "validar")\`
3. **Ajustar se necessário:** Refine seções que precisam de melhorias
4. **Avançar para Fase 1:** Quando validado, o PRD estará pronto para a próxima fase

---

## ⚡ AÇÃO OBRIGATÓRIA - Atualizar Estado

**Caminho:** \`${estadoFile.path}\`

\`\`\`json
${estadoFile.content}
\`\`\`

**Arquivo PRD:** \`docs/01-produto/PRD.md\`

\`\`\`markdown
${prdConteudo}
\`\`\`
`;

  return {
    content: [{ type: "text", text: resposta }],
    files: [
      {
        path: `${diretorio}/${estadoFile.path}`,
        content: estadoFile.content,
      },
      {
        path: `${diretorio}/docs/01-produto/PRD.md`,
        content: prdConteudo,
      },
    ],
    estado_atualizado: estadoFile.content,
  };
}

/**
 * Handler: validar PRD
 */
function handleValidarPRD(
  onboarding: OnboardingState,
  estado: any,
  diretorio: string
): ToolResult {
  if (onboarding.prdStatus !== 'draft') {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: PRD não está em draft. Gere o PRD primeiro.",
      }],
      isError: true,
    };
  }

  // Gerar conteúdo do PRD para validação
  const prdConteudo = gerarPRDConteudo(onboarding, estado.nome);

  // Validar completude
  const checklist = {
    'Sumário Executivo': prdConteudo.includes('Problema e Oportunidade'),
    'Personas e JTBD': prdConteudo.includes('Personas e Jobs to Be Done'),
    'MVP e Funcionalidades': prdConteudo.includes('MVP e Funcionalidades Priorizadas'),
    'Métricas de Sucesso': prdConteudo.includes('Métricas de Sucesso'),
    'Riscos e Mitigações': prdConteudo.includes('Riscos e Planos de Mitigação'),
    'Contexto Técnico': prdConteudo.includes('Contexto Técnico'),
    'Timeline e Recursos': prdConteudo.includes('Timeline e Recursos'),
    'Requisitos Críticos': prdConteudo.includes('Requisitos Críticos'),
  };

  const itemsValidados = Object.values(checklist).filter((v) => v).length;
  const totalItems = Object.keys(checklist).length;
  const score = Math.round((itemsValidados / totalItems) * 100);

  // Calcular qualidade
  const qualidade = calcularQualidade(prdConteudo, {
    camposObrigatorios: Object.keys(checklist),
    secoes: Object.keys(checklist),
  } as any);

  onboarding.prdScore = qualidade.overall;
  onboarding.prdStatus = score >= 70 ? 'validated' : 'draft';

  const linhas: string[] = [];
  linhas.push('# 📊 Validação do PRD\n');
  linhas.push(`**Score de Completude:** ${score}/100`);
  linhas.push(`**Score de Qualidade:** ${qualidade.overall}/100\n`);

  linhas.push('## Checklist de Completude\n');
  Object.entries(checklist).forEach(([item, valido]) => {
    const icon = valido ? '✅' : '❌';
    linhas.push(`${icon} ${item}`);
  });

  linhas.push(`\n**Total:** ${itemsValidados}/${totalItems} itens validados\n`);

  if (score >= 70) {
    linhas.push('✅ **PRD VALIDADO!** Score ≥ 70\n');
    linhas.push('Próximo passo: Avançar para Fase 1 (Produto)');
  } else {
    linhas.push(`⚠️ **PRD INCOMPLETO** Score: ${score}/100\n`);
    linhas.push('Recomendações:');
    Object.entries(checklist).forEach(([item, valido]) => {
      if (!valido) {
        linhas.push(`- Adicionar: ${item}`);
      }
    });
  }

  return {
    content: [{
      type: "text",
      text: linhas.join('\n'),
    }],
  };
}

/**
 * Handler: status do PRD
 */
function handleStatusPRD(onboarding: OnboardingState): ToolResult {
  const linhas: string[] = [];
  linhas.push('# 📄 Status do PRD\n');
  linhas.push(`**Status:** ${onboarding.prdStatus}`);
  linhas.push(`**Score:** ${onboarding.prdScore}/100`);
  linhas.push(`**Fase:** ${onboarding.phase}\n`);

  if (onboarding.prdValidationReport) {
    linhas.push('## Relatório de Validação\n');
    linhas.push(`**Score:** ${onboarding.prdValidationReport.score}/100\n`);

    linhas.push('### Checklist\n');
    Object.entries(onboarding.prdValidationReport.checklist).forEach(([item, valido]) => {
      const icon = valido ? '✅' : '❌';
      linhas.push(`${icon} ${item}`);
    });

    if (onboarding.prdValidationReport.gaps.length > 0) {
      linhas.push('\n### Lacunas\n');
      onboarding.prdValidationReport.gaps.forEach((gap) => {
        linhas.push(`- ${gap}`);
      });
    }

    if (onboarding.prdValidationReport.suggestions.length > 0) {
      linhas.push('\n### Sugestões\n');
      onboarding.prdValidationReport.suggestions.forEach((sugestao) => {
        linhas.push(`- ${sugestao}`);
      });
    }
  }

  return {
    content: [{
      type: "text",
      text: linhas.join('\n'),
    }],
  };
}

/**
 * Handler: gerar e validar PRD
 */
function handleGerarValidarPRD(
  onboarding: OnboardingState,
  estado: any,
  diretorio: string
): ToolResult {
  if (onboarding.brainstormStatus !== 'completed') {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Brainstorm não foi concluído. Complete o brainstorm antes de gerar o PRD.",
      }],
      isError: true,
    };
  }

  // Gerar conteúdo do PRD
  const prdConteudo = gerarPRDConteudo(onboarding, estado.nome);

  // Validar completude
  const checklist = {
    'Sumário Executivo': prdConteudo.includes('Problema e Oportunidade'),
    'Personas e JTBD': prdConteudo.includes('Personas e Jobs to Be Done'),
    'MVP e Funcionalidades': prdConteudo.includes('MVP e Funcionalidades Priorizadas'),
    'Métricas de Sucesso': prdConteudo.includes('Métricas de Sucesso'),
    'Riscos e Mitigações': prdConteudo.includes('Riscos e Planos de Mitigação'),
    'Contexto Técnico': prdConteudo.includes('Contexto Técnico'),
    'Timeline e Recursos': prdConteudo.includes('Timeline e Recursos'),
    'Requisitos Críticos': prdConteudo.includes('Requisitos Críticos'),
  };

  const itemsValidados = Object.values(checklist).filter((v) => v).length;
  const totalItems = Object.keys(checklist).length;
  const score = Math.round((itemsValidados / totalItems) * 100);

  // Calcular qualidade
  const qualidade = calcularQualidade(prdConteudo, {
    camposObrigatorios: Object.keys(checklist),
    secoes: Object.keys(checklist),
  } as any);

  onboarding.prdScore = qualidade.overall;
  onboarding.prdStatus = score >= 70 ? 'validated' : 'draft';

  const linhas: string[] = [];
  linhas.push('# 📊 Validação do PRD\n');
  linhas.push(`**Score de Completude:** ${score}/100`);
  linhas.push(`**Score de Qualidade:** ${qualidade.overall}/100\n`);

  linhas.push('## Checklist de Completude\n');
  Object.entries(checklist).forEach(([item, valido]) => {
    const icon = valido ? '✅' : '❌';
    linhas.push(`${icon} ${item}`);
  });

  linhas.push(`\n**Total:** ${itemsValidados}/${totalItems} itens validados\n`);

  if (score >= 70) {
    linhas.push('✅ **PRD VALIDADO!** Score ≥ 70\n');
    linhas.push('Próximo passo: Avançar para Fase 1 (Produto)');
  } else {
    linhas.push(`⚠️ **PRD INCOMPLETO** Score: ${score}/100\n`);
    linhas.push('Recomendações:');
    Object.entries(checklist).forEach(([item, valido]) => {
      if (!valido) {
        linhas.push(`- Adicionar: ${item}`);
      }
    });
  }

  // Atualizar estado
  onboarding.phase = 'prd_draft';
  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  const estadoAtualizado = {
    ...estado,
    onboarding,
    atualizado_em: new Date().toISOString(),
  };

  const estadoFile = serializarEstado(estadoAtualizado);

  const resposta = `# ✅ PRD Draft Gerado e Validado!

O PRD foi consolidado a partir do discovery e brainstorm.

---

## 📄 Conteúdo do PRD

\`\`\`markdown
${prdConteudo.substring(0, 500)}...
\`\`\`

---

## 🔍 Próximos Passos

1. **Revisar PRD:** Verifique se todos os detalhes estão corretos
2. **Ajustar se necessário:** Refine seções que precisam de melhorias
3. **Avançar para Fase 1:** Quando validado, o PRD estará pronto para a próxima fase

---

## ⚡ AÇÃO OBRIGATÓRIA - Atualizar Estado

**Caminho:** \`${estadoFile.path}\`

\`\`\`json
${estadoFile.content}
\`\`\`

**Arquivo PRD:** \`docs/01-produto/PRD.md\`

\`\`\`markdown
${prdConteudo}
\`\`\`
`;

  return {
    content: [{ type: "text", text: resposta }],
    files: [
      {
        path: `${diretorio}/${estadoFile.path}`,
        content: estadoFile.content,
      },
      {
        path: `${diretorio}/docs/01-produto/PRD.md`,
        content: prdConteudo,
      },
    ],
    estado_atualizado: estadoFile.content,
  };
}

export const prdWriterSchema = {
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
      enum: ["gerar", "validar", "gerar_validar", "status"],
      description: "Ação a executar: gerar (PRD draft), validar (verifica completude), gerar_validar (gera e valida em um passo - recomendado), status (mostra informações)",
    },
  },
  required: ["estado_json", "diretorio"],
};
