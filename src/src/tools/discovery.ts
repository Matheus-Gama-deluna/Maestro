import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { OnboardingState } from "../types/onboarding.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolveProjectPath } from "../utils/files.js";
import { buildElicitation } from "../services/elicitation-fallback.service.js";

/**
 * Respostas do Discovery inicial
 */
export interface DiscoveryRespostas {
    // Sobre o Projeto
    nome_projeto: string;
    problema: string;
    publico_alvo: string;
    
    // Escopo e MVP
    funcionalidades_principais: string[];
    fora_escopo: string[];
    cronograma: string;
    
    // Técnico
    stack_preferida?: string;
    plataformas: string[]; // web, mobile, desktop
    integracoes_externas: string[];
    
    // Time e Infraestrutura
    tamanho_time: string;
    experiencia_time: string;
    infraestrutura: string; // cloud, on-premise, hybrid
    
    // Requisitos Críticos
    performance_esperada: string;
    seguranca_compliance: string[];
    escalabilidade: string;
    
    // Dados e Analytics
    tipo_dados?: string; // relacional, nosql, hibrido
    volume_estimado?: string;
    necessita_analytics?: boolean;
    
    // UX e Design
    referencias_visuais?: string;
    acessibilidade_requerida?: boolean;
    
    // Orçamento e Restrições
    budget_estimado?: string;
    restricoes_tecnicas?: string[];
    restricoes_negocio?: string[];
}

export const discoverySchema = {
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
        respostas: {
            type: "object",
            description: "Respostas do questionário de discovery",
            properties: {
                nome_projeto: { type: "string" },
                problema: { type: "string" },
                publico_alvo: { type: "string" },
                funcionalidades_principais: {
                    type: "array",
                    items: { type: "string" }
                },
                fora_escopo: {
                    type: "array",
                    items: { type: "string" }
                },
                cronograma: { type: "string" },
                stack_preferida: { type: "string" },
                plataformas: {
                    type: "array",
                    items: { type: "string" }
                },
                integracoes_externas: {
                    type: "array",
                    items: { type: "string" }
                },
                tamanho_time: { type: "string" },
                experiencia_time: { type: "string" },
                infraestrutura: { type: "string" },
                performance_esperada: { type: "string" },
                seguranca_compliance: {
                    type: "array",
                    items: { type: "string" }
                },
                escalabilidade: { type: "string" },
            },
        },
    },
    required: ["estado_json", "diretorio"],
};

interface DiscoveryArgs {
    estado_json: string;
    diretorio: string;
    respostas?: Partial<DiscoveryRespostas>;
}

/**
 * Tool: discovery
 * Coleta informações iniciais agrupadas para reduzir prompts posteriores
 */
export async function discovery(args: DiscoveryArgs): Promise<ToolResult> {
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

    // Se não tem respostas, retorna questionário via elicitation fallback
    if (!args.respostas) {
        const modo = estado.config?.mode || 'balanced';

        // v5.2: Usar elicitation-fallback para perguntas estruturadas
        const elicitation = buildElicitation({
            title: "Discovery Inicial - Maestro",
            description: "Para otimizar o desenvolvimento, vou coletar informações iniciais agrupadas.",
            fields: [
                { name: "nome_projeto", label: "Nome do projeto", type: "text", required: true },
                { name: "problema", label: "Problema que resolve", type: "text", required: true, description: "Descreva o problema principal" },
                { name: "publico_alvo", label: "Público-alvo principal", type: "text", required: true },
                { name: "funcionalidades_principais", label: "3-5 funcionalidades principais do MVP", type: "text", required: true },
                { name: "cronograma", label: "Cronograma desejado", type: "text", required: false, default: "3 meses" },
                { name: "stack_preferida", label: "Stack preferida", type: "text", required: false, description: "Ex: React + Node.js, ou 'sugerir'" },
                { name: "plataformas", label: "Plataformas alvo", type: "select", options: ["web", "mobile", "desktop"], required: true },
            ],
        });

        // Se client suporta elicitation nativa, retornar payload nativo
        if (elicitation.useNative && elicitation.nativePayload) {
            return {
                content: [{ type: "text", text: "Aguardando respostas do discovery via elicitation..." }],
            };
        }

        // Fallback: questionário Markdown completo
        const questionario = gerarQuestionario(modo);
        return {
            content: [
                { type: "text", text: elicitation.markdownFallback || questionario },
            ],
        };
    }

    // v3.0: ADAPTER - Usar onboarding como fonte de verdade se disponível
    const onboarding = (estado as any).onboarding as OnboardingState | undefined;
    
    let estadoAtualizado: EstadoProjeto;
    
    if (onboarding) {
        // NOVO FLUXO: Preencher onboarding.discoveryResponses
        onboarding.discoveryResponses = {
            ...onboarding.discoveryResponses,
            ...args.respostas,
        };
        
        // Marcar todos os blocos como completos (modo compatibilidade)
        onboarding.discoveryBlocks.forEach(bloco => {
            bloco.status = 'completed';
        });
        
        onboarding.discoveryStatus = 'completed';
        onboarding.discoveryCompletedAt = new Date().toISOString();
        onboarding.totalInteractions++;
        onboarding.lastInteractionAt = new Date().toISOString();
        
        estadoAtualizado = {
            ...estado,
            onboarding: onboarding as any,
            atualizado_em: new Date().toISOString(),
        };
    } else {
        // LEGACY: Comportamento antigo para retrocompatibilidade
        // Usar cast para any para suportar campo legacy não tipado
        estadoAtualizado = {
            ...estado,
        } as EstadoProjeto;
        (estadoAtualizado as any).discovery = args.respostas;
    }

    const estadoFile = serializarEstado(estadoAtualizado);

    const resposta = `# ✅ Discovery Concluído

Informações coletadas e salvas com sucesso!

## Resumo Capturado

**Projeto:** ${args.respostas.nome_projeto || estado.nome}
**Problema:** ${args.respostas.problema || 'A definir'}
**Plataformas:** ${args.respostas.plataformas?.join(', ') || 'A definir'}
**Stack:** ${args.respostas.stack_preferida || 'A sugerir'}

---

## 📁 Próximos Passos

Todas as informações foram salvas em \`.maestro/estado.json\` no campo \`discovery\`.

Os especialistas agora têm acesso a este contexto e farão apenas perguntas de refinamento específicas.

**Pronto para iniciar a Fase 1 (Produto)!**

Use: \`status(estado_json: "...", diretorio: "${diretorio}")\` para ver o progresso.

---

## ⚡ AÇÃO OBRIGATÓRIA - Atualizar Estado

**Caminho:** \`${diretorio}/.maestro/estado.json\`

\`\`\`json
${estadoFile.content}
\`\`\`
`;

    return {
        content: [{ type: "text", text: resposta }],
        files: [{
            path: `${diretorio}/${estadoFile.path}`,
            content: estadoFile.content
        }],
        estado_atualizado: estadoFile.content,
    };
}

/**
 * Gera questionário adaptado ao modo selecionado
 */
function gerarQuestionario(modo: 'economy' | 'balanced' | 'quality'): string {
    const base = `# 🎯 Discovery Inicial - Maestro

Para otimizar o desenvolvimento e reduzir a quantidade de perguntas durante o projeto, vou coletar informações iniciais agrupadas.

**Modo selecionado:** ${modo.toUpperCase()}

---

## 1. Sobre o Projeto

**Nome do projeto:** ___

**Problema que resolve:**
(Descreva o problema principal que o projeto resolve)
___

**Público-alvo principal:**
(Quem são os usuários? Personas principais)
___

---

## 2. Escopo e MVP

**3-5 funcionalidades principais do MVP:**
1. ___
2. ___
3. ___

**O que NÃO faz parte do MVP:**
(Liste funcionalidades que ficam para versões futuras)
___

**Cronograma desejado:**
(Ex: 3 meses, 6 meses, 1 ano)
___

---

## 3. Técnico

**Stack preferida:**
(Ex: React + Node.js, Laravel + Vue, ou "sugerir baseado em requisitos")
___

**Plataformas alvo:**
- [ ] Web
- [ ] Mobile (iOS/Android)
- [ ] Desktop

**Integrações externas necessárias:**
(Ex: APIs de pagamento, autenticação social, serviços de email)
___

---

## 4. Time e Infraestrutura

**Tamanho do time:**
(Ex: solo, 2-5 pessoas, 6-10 pessoas, 10+)
___

**Experiência predominante do time:**
(Ex: júnior, pleno, sênior, misto)
___

**Infraestrutura disponível:**
- [ ] Cloud (AWS, GCP, Azure)
- [ ] On-premise
- [ ] Híbrido
___

---

## 5. Requisitos Críticos

**Performance esperada:**
(Ex: < 2s de resposta, suporta 1000 usuários simultâneos)
___

**Segurança/Compliance:**
- [ ] LGPD
- [ ] PCI-DSS
- [ ] HIPAA
- [ ] Outro: ___

**Escalabilidade:**
(Ex: crescimento esperado, picos de uso)
___

`;

    // Perguntas adicionais para modo balanced e quality
    if (modo === 'balanced' || modo === 'quality') {
        return base + `
---

## 6. Dados e Analytics

**Tipo de dados predominante:**
- [ ] Relacional (SQL)
- [ ] NoSQL (MongoDB, etc)
- [ ] Híbrido

**Volume estimado de dados:**
(Ex: milhares, milhões, bilhões de registros)
___

**Necessita analytics/BI?**
- [ ] Sim
- [ ] Não
___

---

## 7. UX e Design

**Referências visuais ou estilo desejado:**
(Links, descrição, ou "sugerir baseado no público")
___

**Acessibilidade requerida:**
- [ ] Sim (WCAG 2.1 AA)
- [ ] Não
___

` + (modo === 'quality' ? `
---

## 8. Orçamento e Restrições

**Budget estimado:**
(Para infraestrutura, ferramentas, etc)
___

**Restrições técnicas:**
(Ex: deve usar tecnologia X, não pode usar Y)
___

**Restrições de negócio:**
(Ex: prazo fixo, regulamentações específicas)
___

` : '') + `
---

## 📝 Como Responder

Copie este questionário, preencha as respostas e envie de volta.

Ou use a tool:
\`\`\`
discovery(
    estado_json: "...",
    diretorio: "...",
    respostas: {
        nome_projeto: "...",
        problema: "...",
        // ... demais campos
    }
)
\`\`\`

> 💡 **Dica:** Quanto mais detalhes você fornecer agora, menos perguntas serão feitas depois!
`;
    }

    // Modo economy: apenas essencial
    return base + `
---

## 📝 Como Responder

Copie este questionário, preencha as respostas essenciais e envie de volta.

Ou use a tool:
\`\`\`
discovery(
    estado_json: "...",
    diretorio: "...",
    respostas: {
        nome_projeto: "...",
        problema: "...",
        publico_alvo: "...",
        funcionalidades_principais: ["...", "...", "..."],
        plataformas: ["web"],
        // ... demais campos essenciais
    }
)
\`\`\`

> Modo Economy:** Perguntas mínimas para início rápido!
`;
}
