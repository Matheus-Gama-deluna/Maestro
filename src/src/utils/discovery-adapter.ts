/**
 * Adaptador para discovery dinâmico baseado em modo e estado
 */

import type { DiscoveryBlock, DiscoveryField, DiscoveryAdaptiveConfig } from "../types/onboarding.js";

/**
 * Gera blocos de discovery adaptados ao modo
 */
export function gerarBlocosDiscovery(config: DiscoveryAdaptiveConfig): DiscoveryBlock[] {
  const blocos: DiscoveryBlock[] = [];

  // Bloco 1: Sobre o Projeto (sempre obrigatório)
  blocos.push({
    id: 'projeto-basico',
    title: 'Sobre o Projeto',
    description: 'Informações fundamentais do projeto',
    required: true,
    mode: config.mode,
    status: 'pending',
    order: 1,
    estimatedTime: 5,
    fields: [
      {
        id: 'nome_projeto',
        label: 'Nome do projeto',
        type: 'text',
        required: true,
        placeholder: 'Ex: PulseTrack, Marketplace ABC',
        filled: false,
      },
      {
        id: 'problema',
        label: 'Qual problema resolve?',
        type: 'textarea',
        required: true,
        placeholder: 'Descreva o problema principal que o projeto resolve',
        filled: false,
      },
      {
        id: 'publico_alvo',
        label: 'Público-alvo principal',
        type: 'textarea',
        required: true,
        placeholder: 'Quem são os usuários? Personas principais',
        filled: false,
      },
    ],
  });

  // Bloco 2: Escopo e MVP (sempre obrigatório)
  blocos.push({
    id: 'escopo-mvp',
    title: 'Escopo e MVP',
    description: 'Defina o escopo inicial e funcionalidades principais',
    required: true,
    mode: config.mode,
    status: 'pending',
    order: 2,
    estimatedTime: 5,
    fields: [
      {
        id: 'funcionalidades_principais',
        label: '3-5 funcionalidades principais do MVP',
        type: 'array',
        required: true,
        placeholder: 'Adicione cada funcionalidade',
        filled: false,
      },
      {
        id: 'fora_escopo',
        label: 'O que NÃO faz parte do MVP?',
        type: 'textarea',
        required: false,
        placeholder: 'Funcionalidades que ficam para versões futuras',
        filled: false,
      },
      {
        id: 'cronograma',
        label: 'Cronograma desejado',
        type: 'text',
        required: true,
        placeholder: 'Ex: 3 meses, 6 meses, 1 ano',
        filled: false,
      },
    ],
  });

  // Bloco 3: Técnico (sempre obrigatório)
  blocos.push({
    id: 'tecnico',
    title: 'Requisitos Técnicos',
    description: 'Stack, plataformas e integrações',
    required: true,
    mode: config.mode,
    status: 'pending',
    order: 3,
    estimatedTime: 5,
    fields: [
      {
        id: 'stack_preferida',
        label: 'Stack preferida',
        type: 'text',
        required: false,
        placeholder: 'Ex: React + Node.js, ou "sugerir baseado em requisitos"',
        filled: false,
      },
      {
        id: 'plataformas',
        label: 'Plataformas alvo',
        type: 'checkbox',
        required: true,
        options: ['Web', 'Mobile (iOS/Android)', 'Desktop'],
        filled: false,
      },
      {
        id: 'integracoes_externas',
        label: 'Integrações externas necessárias',
        type: 'textarea',
        required: false,
        placeholder: 'Ex: APIs de pagamento, autenticação social, serviços de email',
        filled: false,
      },
    ],
  });

  // Bloco 4: Time e Infraestrutura (obrigatório em balanced/quality)
  if (config.mode !== 'economy') {
    blocos.push({
      id: 'time-infraestrutura',
      title: 'Time e Infraestrutura',
      description: 'Contexto de recursos e ambiente',
      required: config.mode === 'quality',
      mode: config.mode,
      status: 'pending',
      order: 4,
      estimatedTime: 3,
      fields: [
        {
          id: 'tamanho_time',
          label: 'Tamanho do time',
          type: 'select',
          required: true,
          options: ['Solo', '2-5 pessoas', '6-10 pessoas', '10+'],
          filled: false,
        },
        {
          id: 'experiencia_time',
          label: 'Experiência predominante',
          type: 'select',
          required: true,
          options: ['Júnior', 'Pleno', 'Sênior', 'Misto'],
          filled: false,
        },
        {
          id: 'infraestrutura',
          label: 'Infraestrutura disponível',
          type: 'checkbox',
          required: true,
          options: ['Cloud (AWS, GCP, Azure)', 'On-premise', 'Híbrido'],
          filled: false,
        },
      ],
    });
  }

  // Bloco 5: Requisitos Críticos (obrigatório em balanced/quality)
  if (config.mode !== 'economy') {
    blocos.push({
      id: 'requisitos-criticos',
      title: 'Requisitos Críticos',
      description: 'Performance, segurança e escalabilidade',
      required: config.mode === 'quality',
      mode: config.mode,
      status: 'pending',
      order: 5,
      estimatedTime: 4,
      fields: [
        {
          id: 'performance_esperada',
          label: 'Performance esperada',
          type: 'text',
          required: false,
          placeholder: 'Ex: < 2s de resposta, suporta 1000 usuários simultâneos',
          filled: false,
        },
        {
          id: 'seguranca_compliance',
          label: 'Segurança/Compliance',
          type: 'checkbox',
          required: false,
          options: ['LGPD', 'PCI-DSS', 'HIPAA', 'Outro'],
          filled: false,
        },
        {
          id: 'escalabilidade',
          label: 'Escalabilidade',
          type: 'textarea',
          required: false,
          placeholder: 'Crescimento esperado, picos de uso',
          filled: false,
        },
      ],
    });
  }

  // Bloco 6: Dados e Analytics (apenas em quality)
  if (config.mode === 'quality') {
    blocos.push({
      id: 'dados-analytics',
      title: 'Dados e Analytics',
      description: 'Tipo de dados, volume e necessidade de BI',
      required: false,
      mode: config.mode,
      status: 'pending',
      order: 6,
      estimatedTime: 3,
      fields: [
        {
          id: 'tipo_dados',
          label: 'Tipo de dados predominante',
          type: 'select',
          required: false,
          options: ['Relacional (SQL)', 'NoSQL (MongoDB, etc)', 'Híbrido'],
          filled: false,
        },
        {
          id: 'volume_estimado',
          label: 'Volume estimado de dados',
          type: 'text',
          required: false,
          placeholder: 'Ex: milhares, milhões, bilhões de registros',
          filled: false,
        },
        {
          id: 'necessita_analytics',
          label: 'Necessita analytics/BI?',
          type: 'checkbox',
          required: false,
          options: ['Sim', 'Não'],
          filled: false,
        },
      ],
    });
  }

  // Bloco 7: UX e Design (apenas em quality)
  if (config.mode === 'quality') {
    blocos.push({
      id: 'ux-design',
      title: 'UX e Design',
      description: 'Referências visuais e acessibilidade',
      required: false,
      mode: config.mode,
      status: 'pending',
      order: 7,
      estimatedTime: 2,
      fields: [
        {
          id: 'referencias_visuais',
          label: 'Referências visuais ou estilo desejado',
          type: 'textarea',
          required: false,
          placeholder: 'Links, descrição, ou "sugerir baseado no público"',
          filled: false,
        },
        {
          id: 'acessibilidade_requerida',
          label: 'Acessibilidade requerida',
          type: 'checkbox',
          required: false,
          options: ['Sim (WCAG 2.1 AA)', 'Não'],
          filled: false,
        },
      ],
    });
  }

  // Bloco 8: Orçamento e Restrições (apenas em quality)
  if (config.mode === 'quality') {
    blocos.push({
      id: 'orcamento-restricoes',
      title: 'Orçamento e Restrições',
      description: 'Budget e restrições técnicas/negócio',
      required: false,
      mode: config.mode,
      status: 'pending',
      order: 8,
      estimatedTime: 2,
      fields: [
        {
          id: 'budget_estimado',
          label: 'Budget estimado',
          type: 'text',
          required: false,
          placeholder: 'Para infraestrutura, ferramentas, etc',
          filled: false,
        },
        {
          id: 'restricoes_tecnicas',
          label: 'Restrições técnicas',
          type: 'textarea',
          required: false,
          placeholder: 'Ex: deve usar tecnologia X, não pode usar Y',
          filled: false,
        },
        {
          id: 'restricoes_negocio',
          label: 'Restrições de negócio',
          type: 'textarea',
          required: false,
          placeholder: 'Ex: prazo fixo, regulamentações específicas',
          filled: false,
        },
      ],
    });
  }

  // Pré-preencher com dados existentes se fornecidos
  if (config.existingData) {
    blocos.forEach((bloco) => {
      bloco.fields.forEach((field) => {
        if (config.existingData && config.existingData[field.id] !== undefined) {
          field.value = config.existingData[field.id];
          field.filled = true;
        }
      });
    });
  }

  return blocos;
}

/**
 * Calcula progresso do discovery
 */
export function calcularProgressoDiscovery(blocos: DiscoveryBlock[]): {
  completados: number;
  total: number;
  percentual: number;
  proximoBloco?: DiscoveryBlock;
} {
  const completados = blocos.filter((b) => b.status === 'completed').length;
  const total = blocos.length;
  const percentual = Math.round((completados / total) * 100);

  const proximoBloco = blocos.find((b) => b.status === 'pending');

  return { completados, total, percentual, proximoBloco };
}

/**
 * Valida se todos os campos obrigatórios foram preenchidos
 */
export function validarBlocoCompleto(bloco: DiscoveryBlock): {
  valido: boolean;
  camposFaltantes: string[];
} {
  const camposFaltantes = bloco.fields
    .filter((f) => f.required && !f.filled)
    .map((f) => f.label);

  return {
    valido: camposFaltantes.length === 0,
    camposFaltantes,
  };
}

/**
 * Extrai respostas do discovery dos blocos
 */
export function extrairRespostasDiscovery(blocos: DiscoveryBlock[]): Record<string, any> {
  const respostas: Record<string, any> = {};

  blocos.forEach((bloco) => {
    bloco.fields.forEach((field) => {
      if (field.filled && field.value !== undefined) {
        respostas[field.id] = field.value;
      }
    });
  });

  return respostas;
}

/**
 * Gera resumo do discovery para apresentação
 */
export function gerarResumoDiscovery(respostas: Record<string, any>): string {
  const linhas: string[] = [];

  linhas.push('# 📋 Resumo do Discovery\n');

  if (respostas.nome_projeto) {
    linhas.push(`**Projeto:** ${respostas.nome_projeto}`);
  }

  if (respostas.problema) {
    linhas.push(`**Problema:** ${respostas.problema}`);
  }

  if (respostas.publico_alvo) {
    linhas.push(`**Público-alvo:** ${respostas.publico_alvo}`);
  }

  if (respostas.funcionalidades_principais) {
    const funcs = Array.isArray(respostas.funcionalidades_principais)
      ? respostas.funcionalidades_principais.join(', ')
      : respostas.funcionalidades_principais;
    linhas.push(`**Funcionalidades principais:** ${funcs}`);
  }

  if (respostas.plataformas) {
    const plats = Array.isArray(respostas.plataformas)
      ? respostas.plataformas.join(', ')
      : respostas.plataformas;
    linhas.push(`**Plataformas:** ${plats}`);
  }

  if (respostas.cronograma) {
    linhas.push(`**Cronograma:** ${respostas.cronograma}`);
  }

  if (respostas.stack_preferida) {
    linhas.push(`**Stack:** ${respostas.stack_preferida}`);
  }

  linhas.push('\n---\n');

  return linhas.join('\n');
}
