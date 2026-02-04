/**
 * Orquestrador de fluxo de onboarding otimizado
 * Coordena discovery adaptativo, brainstorm e PRD integrado
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type {
  OnboardingState,
  DiscoveryBlock,
  BrainstormSection,
  OnboardingPhase,
  ReadinessCheckResult,
} from "../types/onboarding.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolveProjectPath } from "../utils/files.js";
import {
  gerarBlocosDiscovery,
  calcularProgressoDiscovery,
  validarBlocoCompleto,
  extrairRespostasDiscovery,
  gerarResumoDiscovery,
} from "../utils/discovery-adapter.js";

interface OnboardingOrchestratorArgs {
  estado_json: string;
  diretorio: string;
  acao?: 'iniciar' | 'proximo_bloco' | 'status' | 'resumo';
  respostas_bloco?: Record<string, any>;
}

/**
 * Cria estado inicial de onboarding
 */
function criarEstadoOnboarding(projectId: string, modo: 'economy' | 'balanced' | 'quality'): OnboardingState {
  const blocosDiscovery = gerarBlocosDiscovery({
    mode: modo,
    skipCompletedBlocks: false,
    prioritizeByMode: true,
    allowBatchInput: true,
  });

  return {
    projectId,
    phase: 'discovery',
    discoveryStatus: 'in_progress',
    discoveryBlocks: blocosDiscovery,
    discoveryResponses: {},
    discoveryStartedAt: new Date().toISOString(),
    brainstormStatus: 'pending',
    brainstormSections: [],
    prdStatus: 'pending',
    prdScore: 0,
    mode: modo,
    totalInteractions: 0,
    lastInteractionAt: new Date().toISOString(),
  };
}

/**
 * Obtém estado de onboarding do estado do projeto
 */
function obterEstadoOnboarding(estado: EstadoProjeto): OnboardingState | null {
  return (estado as any).onboarding || null;
}

/**
 * Salva estado de onboarding no estado do projeto
 */
function salvarEstadoOnboarding(estado: EstadoProjeto, onboarding: OnboardingState): EstadoProjeto {
  return {
    ...estado,
    onboarding: onboarding as any,
    atualizado_em: new Date().toISOString(),
  };
}

/**
 * Formata bloco de discovery para apresentação
 */
function formatarBlocoDiscovery(bloco: DiscoveryBlock): string {
  const linhas: string[] = [];

  linhas.push(`## ${bloco.title}\n`);
  linhas.push(`${bloco.description}\n`);

  bloco.fields.forEach((field, idx) => {
    const required = field.required ? ' *' : '';
    linhas.push(`### ${idx + 1}. ${field.label}${required}`);

    if (field.type === 'checkbox' && field.options) {
      field.options.forEach((opt) => {
        linhas.push(`- [ ] ${opt}`);
      });
    } else if (field.type === 'select' && field.options) {
      linhas.push(`**Opções:** ${field.options.join(', ')}`);
    } else if (field.placeholder) {
      linhas.push(`_${field.placeholder}_`);
    }

    linhas.push('');
  });

  return linhas.join('\n');
}

/**
 * Tool: onboarding-orchestrator
 * Orquestra o fluxo de onboarding (discovery → brainstorm → PRD)
 */
export async function onboardingOrchestrator(args: OnboardingOrchestratorArgs): Promise<ToolResult> {
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

  // Obter ou criar estado de onboarding
  let onboarding = obterEstadoOnboarding(estado);
  if (!onboarding) {
    const modo = (estado.config?.mode || 'balanced') as 'economy' | 'balanced' | 'quality';
    onboarding = criarEstadoOnboarding(estado.projeto_id, modo);
  }

  // Processar ação
  if (acao === 'iniciar') {
    return handleIniciar(onboarding, estado, diretorio);
  } else if (acao === 'proximo_bloco') {
    return handleProximoBloco(onboarding, estado, diretorio, args.respostas_bloco);
  } else if (acao === 'status') {
    return handleStatus(onboarding);
  } else if (acao === 'resumo') {
    return handleResumo(onboarding);
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
 * Handler: iniciar onboarding
 */
function handleIniciar(
  onboarding: OnboardingState,
  estado: EstadoProjeto,
  diretorio: string
): ToolResult {
  const progresso = calcularProgressoDiscovery(onboarding.discoveryBlocks);

  if (!progresso.proximoBloco) {
    return {
      content: [{
        type: "text",
        text: "✅ **Discovery já concluído!**\n\nTodos os blocos foram preenchidos. Próximo passo: brainstorm.",
      }],
    };
  }

  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  const blocoFormatado = formatarBlocoDiscovery(progresso.proximoBloco);

  const resposta = `# 🚀 Kickstart Guiado - Discovery Interativo

**Projeto:** ${estado.nome}  
**Modo:** ${onboarding.mode.toUpperCase()}  
**Progresso:** ${progresso.completados}/${progresso.total} blocos (${progresso.percentual}%)

---

${blocoFormatado}

---

## 📝 Como Responder

Preencha os campos acima e envie as respostas usando:

\`\`\`
onboarding_orchestrator(
    estado_json: "...",
    diretorio: "...",
    acao: "proximo_bloco",
    respostas_bloco: {
        "campo_id": "valor",
        "outro_campo": ["valor1", "valor2"]
    }
)
\`\`\`

**💡 Dica:** Quanto mais detalhes você fornecer agora, menos perguntas serão feitas depois!

---

**Tempo estimado para este bloco:** ${progresso.proximoBloco.estimatedTime} minutos
`;

  return {
    content: [{
      type: "text",
      text: resposta,
    }],
  };
}

/**
 * Handler: processar próximo bloco
 */
function handleProximoBloco(
  onboarding: OnboardingState,
  estado: EstadoProjeto,
  diretorio: string,
  respostas?: Record<string, any>
): ToolResult {
  if (!respostas || Object.keys(respostas).length === 0) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhuma resposta fornecida. Use `respostas_bloco` para enviar as respostas.",
      }],
      isError: true,
    };
  }

  // Encontrar bloco atual
  const blocoAtual = onboarding.discoveryBlocks.find((b) => b.status === 'in_progress' || b.status === 'pending');
  if (!blocoAtual) {
    return {
      content: [{
        type: "text",
        text: "❌ **Erro**: Nenhum bloco em progresso encontrado.",
      }],
      isError: true,
    };
  }

  // Atualizar campos com respostas
  blocoAtual.fields.forEach((field) => {
    if (respostas[field.id] !== undefined) {
      field.value = respostas[field.id];
      field.filled = true;
    }
  });

  // Validar bloco
  const validacao = validarBlocoCompleto(blocoAtual);
  if (!validacao.valido) {
    return {
      content: [{
        type: "text",
        text: `⚠️ **Campos obrigatórios faltando:**\n\n${validacao.camposFaltantes.map((c) => `- ${c}`).join('\n')}\n\nPor favor, preencha esses campos antes de continuar.`,
      }],
      isError: true,
    };
  }

  // Marcar bloco como completo
  blocoAtual.status = 'completed';
  onboarding.discoveryResponses = {
    ...onboarding.discoveryResponses,
    ...respostas,
  };

  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  // Calcular progresso
  const progresso = calcularProgressoDiscovery(onboarding.discoveryBlocks);

  // Se todos os blocos obrigatórios foram completados, marcar discovery como completo
  const todosObrigatoriosCompletos = onboarding.discoveryBlocks
    .filter((b) => b.required)
    .every((b) => b.status === 'completed');

  if (todosObrigatoriosCompletos && !progresso.proximoBloco) {
    onboarding.discoveryStatus = 'completed';
    onboarding.discoveryCompletedAt = new Date().toISOString();

    // Salvar estado
    const estadoAtualizado = salvarEstadoOnboarding(estado, onboarding);
    const estadoFile = serializarEstado(estadoAtualizado);

    const resumo = gerarResumoDiscovery(onboarding.discoveryResponses);

    const resposta = `# ✅ Discovery Concluído!

${resumo}

---

## 🎯 Próximos Passos

Todas as informações foram coletadas com sucesso! Agora vamos para o **Brainstorm Assistido**.

**Ações recomendadas:**
1. Revisar o resumo acima
2. Iniciar brainstorm estruturado
3. Consolidar insights em PRD draft
4. Validar completude

**Tempo estimado:** 10-15 minutos

---

## ⚡ AÇÃO OBRIGATÓRIA - Atualizar Estado

**Caminho:** \`${estadoFile.path}\`

\`\`\`json
${estadoFile.content}
\`\`\`

Use: \`onboarding_orchestrator(estado_json: "...", diretorio: "${diretorio}", acao: "status")\` para ver o progresso.
`;

    return {
      content: [{ type: "text", text: resposta }],
      files: [{
        path: `${diretorio}/${estadoFile.path}`,
        content: estadoFile.content,
      }],
      estado_atualizado: estadoFile.content,
    };
  }

  // Continuar para próximo bloco
  if (progresso.proximoBloco) {
    const blocoFormatado = formatarBlocoDiscovery(progresso.proximoBloco);

    const resposta = `# ✅ Bloco Concluído!

**${blocoAtual.title}** foi salvo com sucesso.

---

## 📊 Progresso

${progresso.completados}/${progresso.total} blocos concluídos (${progresso.percentual}%)

---

## 🔄 Próximo Bloco

${blocoFormatado}

---

**Tempo estimado:** ${progresso.proximoBloco.estimatedTime} minutos
`;

    return {
      content: [{
        type: "text",
        text: resposta,
      }],
    };
  }

  return {
    content: [{
      type: "text",
      text: "✅ **Discovery concluído!** Todos os blocos foram preenchidos.",
    }],
  };
}

/**
 * Handler: status do onboarding
 */
function handleStatus(onboarding: OnboardingState): ToolResult {
  const progresso = calcularProgressoDiscovery(onboarding.discoveryBlocks);

  const linhas: string[] = [];
  linhas.push('# 📊 Status do Onboarding\n');
  linhas.push(`**Fase:** ${onboarding.phase}`);
  linhas.push(`**Modo:** ${onboarding.mode.toUpperCase()}`);
  linhas.push(`**Total de interações:** ${onboarding.totalInteractions}\n`);

  linhas.push('## Discovery');
  linhas.push(`**Status:** ${onboarding.discoveryStatus}`);
  linhas.push(`**Progresso:** ${progresso.completados}/${progresso.total} blocos (${progresso.percentual}%)\n`);

  linhas.push('## Brainstorm');
  linhas.push(`**Status:** ${onboarding.brainstormStatus}`);
  linhas.push(`**Seções:** ${onboarding.brainstormSections.length}\n`);

  linhas.push('## PRD');
  linhas.push(`**Status:** ${onboarding.prdStatus}`);
  linhas.push(`**Score:** ${onboarding.prdScore}/100\n`);

  if (onboarding.lastInteractionAt) {
    linhas.push(`**Última interação:** ${new Date(onboarding.lastInteractionAt).toLocaleString('pt-BR')}`);
  }

  return {
    content: [{
      type: "text",
      text: linhas.join('\n'),
    }],
  };
}

/**
 * Handler: resumo do discovery
 */
function handleResumo(onboarding: OnboardingState): ToolResult {
  const resumo = gerarResumoDiscovery(onboarding.discoveryResponses);

  return {
    content: [{
      type: "text",
      text: resumo,
    }],
  };
}

export const onboardingOrchestratorSchema = {
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
      enum: ["iniciar", "proximo_bloco", "status", "resumo"],
      description: "Ação a executar",
    },
    respostas_bloco: {
      type: "object",
      description: "Respostas do bloco atual",
    },
  },
  required: ["estado_json", "diretorio"],
};
