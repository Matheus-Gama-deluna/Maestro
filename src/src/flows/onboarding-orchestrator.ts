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
  calcularProgressoDiscovery,
  validarBlocoCompleto,
  extrairRespostasDiscovery,
  gerarResumoDiscovery,
} from "../utils/discovery-adapter.js";
import {
  criarEstadoOnboardingInicial,
  obterEstadoOnboarding,
  salvarEstadoOnboarding,
} from "../services/onboarding.service.js";
import { saveFile, formatSavedFilesConfirmation } from "../utils/persistence.js";

interface OnboardingOrchestratorArgs {
  estado_json: string;
  diretorio: string;
  acao?: 'iniciar' | 'proximo_bloco' | 'status' | 'resumo';
  respostas_bloco?: Record<string, any>;
  respostas?: Record<string, any>;
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
    onboarding = criarEstadoOnboardingInicial(estado.projeto_id, modo);
  }

  // Processar ação
  if (acao === 'iniciar') {
    return handleIniciar(onboarding, estado, diretorio);
  } else if (acao === 'proximo_bloco') {
    // v5.3: Aceitar tanto respostas_bloco quanto respostas (normalização)
    const respostas = args.respostas_bloco || args.respostas;
    return handleProximoBloco(onboarding, estado, diretorio, respostas);
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
async function handleIniciar(
  onboarding: OnboardingState,
  estado: EstadoProjeto,
  diretorio: string
): Promise<ToolResult> {
  const progresso = calcularProgressoDiscovery(onboarding.discoveryBlocks);

  if (!progresso.proximoBloco) {
    return {
      content: [{
        type: "text",
        text: "✅ **Discovery já concluído!**\n\nTodos os blocos foram preenchidos. Próximo passo: brainstorm.",
      }],
      next_action: {
        tool: "executar",
        description: "Iniciar brainstorm assistido após discovery completo",
        args_template: { diretorio: diretorio, acao: "avancar" },
        requires_user_input: false,
        auto_execute: true,
      },
      progress: {
        current_phase: "discovery",
        total_phases: 4,
        completed_phases: 1,
        percentage: 25,
      },
    };
  }

  onboarding.totalInteractions++;
  onboarding.lastInteractionAt = new Date().toISOString();

  // Persistir estado atualizado (interação contada)
  const estadoAtualizado = salvarEstadoOnboarding(estado, onboarding);
  const estadoFile = serializarEstado(estadoAtualizado);

  // v5.3: Persistência direta via fs
  try {
    await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
  } catch (err) {
    console.error('[onboarding] Erro ao salvar estado:', err);
  }

  const blocoFormatado = formatarBlocoDiscovery(progresso.proximoBloco);

  // Gerar template de args com os IDs dos campos do bloco
  const camposTemplate: Record<string, string> = {};
  progresso.proximoBloco.fields.forEach(f => {
    camposTemplate[f.id] = f.placeholder || `<${f.label}>`;
  });

  const resposta = `# 🚀 Kickstart Guiado - Discovery Interativo

**Projeto:** ${estado.nome}  
**Modo:** ${onboarding.mode.toUpperCase()}  
**Progresso:** ${progresso.completados}/${progresso.total} blocos (${progresso.percentual}%)

---

${blocoFormatado}

---

**💡 Dica:** Quanto mais detalhes você fornecer agora, menos perguntas serão feitas depois!

**Tempo estimado para este bloco:** ${progresso.proximoBloco.estimatedTime} minutos
`;

  return {
    content: [{ type: "text", text: resposta }],
    estado_atualizado: estadoFile.content,
    next_action: {
      tool: "executar",
      description: `Coletar respostas do bloco "${progresso.proximoBloco.title}" e enviar`,
      args_template: {
        diretorio: diretorio,
        acao: "avancar",
        respostas: camposTemplate,
      },
      requires_user_input: true,
      user_prompt: `Preencha as informações do bloco "${progresso.proximoBloco.title}"`,
    },
    progress: {
      current_phase: "discovery",
      total_phases: 4,
      completed_phases: 0,
      percentage: progresso.percentual,
    },
  };
}

/**
 * Handler: processar próximo bloco
 */
async function handleProximoBloco(
  onboarding: OnboardingState,
  estado: EstadoProjeto,
  diretorio: string,
  respostas?: Record<string, any>
): Promise<ToolResult> {
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

  // SEMPRE persistir estado intermediário (FIX: antes só persistia no final)
  const estadoAtualizado = salvarEstadoOnboarding(estado, onboarding);

  // Se todos os blocos obrigatórios foram completados, marcar discovery como completo
  const todosObrigatoriosCompletos = onboarding.discoveryBlocks
    .filter((b) => b.required)
    .every((b) => b.status === 'completed');

  if (todosObrigatoriosCompletos && !progresso.proximoBloco) {
    onboarding.discoveryStatus = 'completed';
    onboarding.discoveryCompletedAt = new Date().toISOString();

    // Salvar estado final do discovery
    const estadoFinal = salvarEstadoOnboarding(estado, onboarding);
    const estadoFile = serializarEstado(estadoFinal);

    const resumo = gerarResumoDiscovery(onboarding.discoveryResponses);

    const resposta = `# ✅ Discovery Concluído!

${resumo}

---

## 🎯 Próximos Passos

Todas as informações foram coletadas com sucesso! Agora vamos para o **Brainstorm Assistido**.

**Tempo estimado:** 10-15 minutos
`;

    // v5.3: Persistência direta
    try {
      await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
      console.error('[onboarding] Erro ao salvar estado:', err);
    }

    return {
      content: [{ type: "text", text: resposta }],
      estado_atualizado: estadoFile.content,
      next_action: {
        tool: "executar",
        description: "Iniciar brainstorm assistido com dados do discovery",
        args_template: { diretorio: diretorio, acao: "avancar" },
        requires_user_input: false,
        auto_execute: true,
      },
      progress: {
        current_phase: "discovery",
        total_phases: 4,
        completed_phases: 1,
        percentage: 25,
      },
    };
  }

  // Continuar para próximo bloco - AGORA COM PERSISTÊNCIA
  const estadoFile = serializarEstado(estadoAtualizado);

  if (progresso.proximoBloco) {
    const blocoFormatado = formatarBlocoDiscovery(progresso.proximoBloco);

    // Gerar template de args com os IDs dos campos do próximo bloco
    const camposTemplate: Record<string, string> = {};
    progresso.proximoBloco.fields.forEach(f => {
      camposTemplate[f.id] = f.placeholder || `<${f.label}>`;
    });

    // S4.2: Resumo executivo do que já foi coletado
    const respostasColetadas = Object.entries(onboarding.discoveryResponses || {});
    let resumoExecutivo = "";
    if (respostasColetadas.length > 0) {
      const itens = respostasColetadas.slice(-6).map(([key, val]) => {
        const valor = typeof val === 'string' ? val.slice(0, 80) : JSON.stringify(val).slice(0, 80);
        return `- **${key}:** ${valor}${(typeof val === 'string' && val.length > 80) ? '...' : ''}`;
      });
      resumoExecutivo = `## 📋 Resumo até agora

${itens.join("\n")}

> ✅ Está correto? Se precisar corrigir algo, informe antes de continuar.

---

`;
    }

    const resposta = `# ✅ Bloco Concluído!

**${blocoAtual.title}** foi salvo com sucesso.

---

## 📊 Progresso

${progresso.completados}/${progresso.total} blocos concluídos (${progresso.percentual}%)

---

${resumoExecutivo}## 🔄 Próximo Bloco

${blocoFormatado}

---

**Tempo estimado:** ${progresso.proximoBloco.estimatedTime} minutos
`;

    // v5.3: Persistência direta
    try {
      await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
      console.error('[onboarding] Erro ao salvar estado:', err);
    }

    return {
      content: [{ type: "text", text: resposta }],
      estado_atualizado: estadoFile.content,
      next_action: {
        tool: "executar",
        description: `Coletar respostas do bloco "${progresso.proximoBloco.title}" e enviar`,
        args_template: {
          diretorio: diretorio,
          acao: "avancar",
          respostas: camposTemplate,
        },
        requires_user_input: true,
        user_prompt: `Preencha as informações do bloco "${progresso.proximoBloco.title}"`,
      },
      progress: {
        current_phase: "discovery",
        total_phases: 4,
        completed_phases: 0,
        percentage: progresso.percentual,
      },
    };
  }

  // v5.3: Persistência direta
  try {
    await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
  } catch (err) {
    console.error('[onboarding] Erro ao salvar estado:', err);
  }

  return {
    content: [{
      type: "text",
      text: "✅ **Discovery concluído!** Todos os blocos foram preenchidos.",
    }],
    estado_atualizado: estadoFile.content,
    next_action: {
      tool: "executar",
      description: "Iniciar brainstorm assistido",
      args_template: { diretorio: diretorio, acao: "avancar" },
      requires_user_input: false,
      auto_execute: true,
    },
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
