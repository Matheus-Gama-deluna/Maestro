import { join, resolve } from "path";
import { existsSync, readdirSync } from "fs";
import { platform } from "os";
import { randomUUID } from "crypto";
import type { ToolResult, TipoArtefato, NivelComplexidade, TierGate } from "../types/index.js";
import type { OnboardingState } from "../types/onboarding.js";
import { criarEstadoInicial, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { criarResumoInicial, serializarResumo } from "../state/memory.js";
import { determinarTierGate, descreverTier } from "../gates/tiers.js";
import { logEvent, EventTypes } from "../utils/history.js";
import { gerarSystemMd } from "../utils/system-md.js";
import { detectarStack, gerarSecaoPrompts, gerarSecaoExemplo, getSkillParaFase, getSkillPath } from "../utils/prompt-mapper.js";
import { resolveProjectPath, joinProjectPath } from "../utils/files.js";
import { ensureContentInstalled, injectContentForIDE } from "../utils/content-injector.js";
import { formatSkillMessage } from "../utils/ide-paths.js";
import { loadUserConfig } from "../utils/config.js";
import { gerarBlocosDiscovery, calcularProgressoDiscovery } from "../utils/discovery-adapter.js";

interface IniciarProjetoArgs {
    nome: string;
    descricao?: string;
    diretorio: string;
    ide?: 'windsurf' | 'cursor' | 'antigravity';
    modo?: 'economy' | 'balanced' | 'quality';
    // v3.0: Novos parâmetros de onboarding
    auto_flow?: boolean;
    usar_stitch?: boolean;
    project_definition_source?: 'ja_definido' | 'brainstorm' | 'sandbox';
    brainstorm_mode?: 'none' | 'assistido';
    confirmar_automaticamente?: boolean;
    // Campos opcionais para one-shot
    tipo_artefato?: TipoArtefato;
    nivel_complexidade?: NivelComplexidade;
}

interface ConfirmarProjetoArgs extends IniciarProjetoArgs {
    tipo_artefato?: TipoArtefato;
    nivel_complexidade?: NivelComplexidade;
    ide: 'windsurf' | 'cursor' | 'antigravity';
    modo: 'economy' | 'balanced' | 'quality';
    // Herda os novos parâmetros de IniciarProjetoArgs
}

/**
 * Cria estado inicial de onboarding
 */
function criarEstadoOnboardingInicial(projectId: string, modo: 'economy' | 'balanced' | 'quality'): OnboardingState {
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
 * Formata bloco de discovery para apresentação
 */
function formatarBlocoDiscoverySimples(bloco: any): string {
    const linhas: string[] = [];
    linhas.push(`## ${bloco.title}\n`);
    linhas.push(`${bloco.description}\n`);
    
    bloco.fields.forEach((field: any, idx: number) => {
        const required = field.required ? ' *' : '';
        linhas.push(`### ${idx + 1}. ${field.label}${required}`);
        if (field.placeholder) {
            linhas.push(`_${field.placeholder}_`);
        }
        linhas.push('');
    });
    
    return linhas.join('\n');
}

/**
 * Infere o tipo de artefato baseado na descrição
 */
function inferirTipoArtefato(nome: string, descricao: string = ""): { tipo: TipoArtefato; razao: string } {
    const texto = (nome + " " + descricao).toLowerCase();

    if (texto.includes("poc") || texto.includes("prova de conceito") || texto.includes("teste rápido") || texto.includes("protótipo"))
        return { tipo: "poc", razao: "Termos indicam experimento ou teste conceito" };

    if (texto.includes("script") || texto.includes("cli") || texto.includes("automação") || texto.includes("bot"))
        return { tipo: "script", razao: "Termos indicam automação ou ferramenta de linha de comando" };

    if (texto.includes("interno") || texto.includes("backoffice") || texto.includes("painel admin") || texto.includes("dashboard equipe"))
        return { tipo: "internal", razao: "Termos indicam ferramenta de uso interno" };

    return { tipo: "product", razao: "Padrão para sistemas voltados ao usuário final" };
}

/**
 * Infere a complexidade baseada na descrição e tipo
 */
function inferirComplexidade(tipo: TipoArtefato, descricao: string = ""): { nivel: NivelComplexidade; razao: string } {
    const texto = descricao.toLowerCase();

    // POCs e Scripts tendem a ser simples, mas podem variar
    if (tipo === "poc" || tipo === "script") {
        if (texto.includes("complexo") || texto.includes("avançado")) return { nivel: "medio", razao: "Tipo simples, mas descrição indica complexidade moderada" };
        return { nivel: "simples", razao: "Padrão para POCs e Scripts" };
    }

    if (texto.includes("microserviços") || texto.includes("distribuído") || texto.includes("alta escala") || texto.includes("crítico"))
        return { nivel: "complexo", razao: "Indicadores de arquitetura distribuída ou alta criticidade" };

    if (texto.includes("simples") || texto.includes("básico") || texto.includes("crud") || texto.includes("landing page"))
        return { nivel: "simples", razao: "Termos indicam escopo reduzido" };

    return { nivel: "medio", razao: "Complexidade padrão para aplicações web/mobile" };
}

/**
 * Mapeia modo para nível de complexidade sugerido
 */
function mapearModoParaNivel(modo: 'economy' | 'balanced' | 'quality' | TipoArtefato): 'economy' | 'balanced' | 'quality' {
    // Se já é um modo, retorna
    if (modo === 'economy' || modo === 'balanced' || modo === 'quality') {
        return modo;
    }
    
    // Se é um tipo de artefato, sugere modo baseado no tipo
    switch (modo) {
        case 'poc':
        case 'script':
            return 'economy';
        case 'internal':
            return 'balanced';
        case 'product':
            return 'quality';
        default:
            return 'balanced';
    }
}

/**
 * Retorna descrição do modo selecionado
 */
function getModoDescription(modo: 'economy' | 'balanced' | 'quality'): string {
    switch (modo) {
        case 'economy':
            return '(Rápido: 7 fases, perguntas mínimas, validação essencial)';
        case 'balanced':
            return '(Equilibrado: 13 fases, perguntas moderadas, validação completa)';
        case 'quality':
            return '(Qualidade: 17 fases, perguntas detalhadas, validação avançada)';
    }
}

/**
 * Tool: iniciar_projeto
 * Faz perguntas interativas sobre tipo, complexidade e modo
 * NÃO CRIA ARQUIVOS AINDA
 */
export async function iniciarProjeto(args: IniciarProjetoArgs): Promise<ToolResult> {
    if (!args.diretorio) {
        return {
            content: [{ type: "text", text: "❌ Erro: Diretório é obrigatório." }],
            isError: true,
        };
    }

    // Normalizar e resolver diretório
    const diretorio = resolveProjectPath(args.diretorio);

    const configGlobal = await loadUserConfig();
    const ideEfetiva = args.ide || configGlobal?.ide;
    const modoEfetivo = args.modo || configGlobal?.modo || 'balanced';

    // Verificar IDE - wizard curto
    if (!ideEfetiva) {
        return {
            content: [{ type: "text", text: `# 🎯 Setup do Projeto: ${args.nome}

**Wizard de Configuração Rápida** (1 prompt, 5 decisões)

Para começar direto no discovery, responda em **um único comando**:

\`\`\`
iniciar_projeto({
  nome: "${args.nome}",
  descricao: "${args.descricao || 'Descrição do projeto'}",
  diretorio: "${args.diretorio}",
  ide: "windsurf",              // windsurf | cursor | antigravity
  modo: "balanced",             // economy | balanced | quality
  auto_flow: false,             // true = avança automaticamente quando score >= 70
  usar_stitch: false,           // true = habilita Google Stitch para prototipagem
  project_definition_source: "ja_definido",  // ja_definido | brainstorm | sandbox
  confirmar_automaticamente: true  // true = cria estado e inicia discovery em 1 passo
})
\`\`\`

### 📋 Sobre as opções:
- **IDE**: Onde os rules/skills serão injetados
- **Modo**: economy (rápido, 7 fases) | balanced (13 fases) | quality (17 fases)
- **Auto Flow**: Auto-avança entre fases quando score >= 70
- **Stitch**: Prototipagem rápida de UI com Google Stitch
- **Project Definition**: 
  - \`ja_definido\`: Você já sabe problema/público/MVP
  - \`brainstorm\`: Quer explorar ideias primeiro
  - \`sandbox\`: Criar cenário fictício para teste
- **Confirmar Automaticamente**: Setup + bootstrap + discovery em 1 passo

💡 **Dica**: Use \`confirmar_automaticamente: true\` para fluxo mais rápido!` }],
        };
    }

    // 🚀 INJETAR CONTEÚDO AUTOMATICAMENTE
    try {
        const injResult = await injectContentForIDE(diretorio, ideEfetiva);
        console.error(`[INFO] Rules/Skills injetados para ${ideEfetiva} em: ${injResult.targetDir}`);
    } catch (error) {
        console.error('[WARN] Não foi possível injetar conteúdo:', error);
    }

    // Inferir sugestões baseadas na descrição
    const inferenciaTipo = inferirTipoArtefato(args.nome, args.descricao);
    const inferenciaNivel = inferirComplexidade(inferenciaTipo.tipo, args.descricao);
    const modoSugerido = modoEfetivo || mapearModoParaNivel(inferenciaTipo.tipo);

    // 🚀 ONE-SHOT: Se confirmar_automaticamente=true, criar projeto imediatamente
    if (args.confirmar_automaticamente === true) {
        return await confirmarProjeto({
            ...args,
            ide: ideEfetiva,
            modo: modoSugerido,
            tipo_artefato: args.tipo_artefato || inferenciaTipo.tipo,
            nivel_complexidade: args.nivel_complexidade || inferenciaNivel.nivel,
        } as ConfirmarProjetoArgs);
    }

    const resposta = `# 🎯 Configuração do Projeto: ${args.nome}

Fluxo PRD-first habilitado. Vamos coletar PRD na próxima interação (evita retrabalho de classificação).

👉 Envie **um único prompt** para confirmar e já começar em modo discovery + PRD:
\`\`\`
confirmar_projeto({
  nome: "${args.nome}",
  descricao: "${args.descricao || ''}",
  diretorio: "${args.diretorio}",
  ide: "${ideEfetiva}",
  modo: "${modoSugerido}", // economy | balanced | quality
  auto_flow: ${args.auto_flow ?? false},
  usar_stitch: ${args.usar_stitch ?? false},
  project_definition_source: "${args.project_definition_source || 'ja_definido'}"
})
\`\`\`

### Sugestões automáticas
- Tipo sugerido: \`${inferenciaTipo.tipo}\` (${inferenciaTipo.razao})
- Complexidade sugerida: \`${inferenciaNivel.nivel}\` (${inferenciaNivel.razao})
- Modo sugerido: \`${modoSugerido}\`

Se quiser forçar tipo/complexidade, adicione no mesmo comando: \`tipo_artefato\` e \`nivel_complexidade\`.

💡 **Atalho rápido**: Use \`confirmar_automaticamente: true\` no \`iniciar_projeto\` para pular esta etapa!
`; 

    return {
        content: [{ type: "text", text: resposta }],
    };
}

/**
 * Tool: confirmar_projeto
 * Cria efetivamente os arquivos do projeto com os tipos confirmados
 */
export async function confirmarProjeto(args: ConfirmarProjetoArgs): Promise<ToolResult> {
    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    // 🚀 INJETAR CONTEÚDO AUTOMATICAMENTE (via npx)
    // 🚀 INJETAR CONTEÚDO AUTOMATICAMENTE (Garantia)
    try {
        if (args.ide) {
             const injResult = await injectContentForIDE(diretorio, args.ide);
             console.error(`[INFO] (Confirmar) Rules/Skills verificados para ${args.ide}`);
        }
    } catch (error) {
        console.error('[WARN] Não foi possível injetar conteúdo embutido:', error);
    }

    // Definir tipo/nivel a partir dos argumentos ou inferência leve da descrição
    const tipoFinal = args.tipo_artefato || inferirTipoArtefato(args.nome, args.descricao).tipo;
    const nivelFinal = args.nivel_complexidade || inferirComplexidade(tipoFinal, args.descricao).nivel;

    // Recalcula tier baseado no confirmado ou inferido
    const tier = determinarTierGate(tipoFinal, nivelFinal);

    const projetoId = randomUUID();

    // Cria estado com novos campos
    const estado = criarEstadoInicial(projetoId, args.nome, diretorio, args.ide);
    estado.nivel = nivelFinal;
    estado.tipo_artefato = tipoFinal;
    estado.tier_gate = tier;
    estado.classificacao_confirmada = Boolean(args.nivel_complexidade && args.tipo_artefato);
    estado.aguardando_classificacao = !estado.classificacao_confirmada;
    estado.classificacao_pos_prd_confirmada = estado.classificacao_confirmada;
    
    // Configurar modo e otimizações (v3.0 com novos campos)
    estado.config = {
        mode: args.modo,
        flow: 'principal',
        optimization: {
            batch_questions: args.modo === 'economy',
            context_caching: args.modo !== 'economy',
            template_compression: args.modo === 'economy',
            smart_validation: args.modo === 'quality',
            one_shot_generation: args.modo === 'economy',
            differential_updates: args.modo === 'balanced' || args.modo === 'quality',
        },
        frontend_first: true,
        auto_checkpoint: args.modo === 'quality',
        auto_fix: args.modo !== 'economy',
        // v3.0: Novos campos de onboarding
        auto_flow: args.auto_flow ?? false,
        onboarding: {
            enabled: true,
            source: 'onboarding_v2',
            project_definition_source: args.project_definition_source || 'ja_definido',
        },
        setup: {
            completed: true,
            decided_at: new Date().toISOString(),
            decided_by: (args.tipo_artefato && args.nivel_complexidade) ? 'user' : 'mixed',
        },
    };
    
    // Persistir usar_stitch no estado raiz
    estado.usar_stitch = args.usar_stitch ?? false;
    estado.stitch_confirmado = args.usar_stitch !== undefined;

    // v3.0: Criar estado de onboarding inicial
    const onboardingState = criarEstadoOnboardingInicial(projetoId, args.modo);
    (estado as any).onboarding = onboardingState;

    // Cria resumo
    const resumo = criarResumoInicial(projetoId, args.nome, nivelFinal, 1, 10);
    resumo.descricao = args.descricao;

    const estadoFile = serializarEstado(estado);
    const resumoFiles = serializarResumo(resumo);

    // Logar evento de projeto confirmado
    try {
        await logEvent(diretorio, {
            type: EventTypes.PROJECT_CONFIRMED,
            fase: 1,
            data: {
                projetoId,
                nome: args.nome,
                tipo: args.tipo_artefato,
                nivel: args.nivel_complexidade,
                tier
            }
        });

        // Gerar SYSTEM.md inicial
        await gerarSystemMd(diretorio, estado, 'Produto', 'Gestão de Produto', [
            'Definir visão do produto',
            'Identificar personas',
            'Criar PRD com problema e MVP'
        ]);
    } catch (error) {
        console.warn('Aviso: Não foi possível criar histórico/SYSTEM.md:', error);
    }

    // v3.0: Obter primeiro bloco do discovery
    const progresso = calcularProgressoDiscovery(onboardingState.discoveryBlocks);
    const primeiroBloco = progresso.proximoBloco;
    const blocoFormatado = primeiroBloco ? formatarBlocoDiscoverySimples(primeiroBloco) : '';

    const resposta = `# 🚀 Projeto Iniciado: ${args.nome}

**Configuração**
- Tipo: \`${tipoFinal}\` (pode ser ajustado após PRD)
- Complexidade: \`${nivelFinal}\` (pode ser ajustado após PRD)
- Tier: **${tier?.toUpperCase() || 'N/A'}**
- Modo: **${args.modo?.toUpperCase() || 'BALANCED'}** ${getModoDescription(args.modo || 'balanced')}
- Auto Flow: **${args.auto_flow ? 'SIM' : 'NÃO'}** ${args.auto_flow ? '(avança automaticamente quando score >= 70)' : ''}
- Usar Stitch: **${args.usar_stitch ? 'SIM' : 'NÃO'}**
- Definição: **${args.project_definition_source || 'ja_definido'}**

| Campo | Valor |
|-------|-------|
| **ID** | \`${projetoId}\` |
| **Diretório** | \`${diretorio}\` |
| **IDE** | ${args.ide} |

---

## ⚡ AÇÃO OBRIGATÓRIA - Criar Arquivos

### 1. Criar: estado.json
**Caminho:** \`${diretorio}/.maestro/estado.json\`

\`\`\`json
${estadoFile.content}
\`\`\`

### 2. Criar: resumo.json
**Caminho:** \`${diretorio}/.maestro/resumo.json\`

\`\`\`json
${resumoFiles[0].content}
\`\`\`

### 3. Criar: resumo.md
**Caminho:** \`${diretorio}/.maestro/resumo.md\`

\`\`\`markdown
${resumoFiles[1].content}
\`\`\`

---

## 🤖 Especialista Ativado

${(() => {
    const skillInicial = getSkillParaFase("Produto");
    if (!skillInicial) return "";
    
    return formatSkillMessage(skillInicial, args.ide) + "\n\n---\n";
})()}

## � Kickstart: Discovery Guiado (Bloco 1/${progresso.total})

${args.modo === 'economy' ? 
'**Modo Economy:** Perguntas mínimas para início rápido.' :
args.modo === 'quality' ?
'**Modo Quality:** Perguntas detalhadas para máxima qualidade.' :
'**Modo Balanced:** Perguntas moderadas para equilíbrio velocidade/qualidade.'}

**Progresso:** ${progresso.completados}/${progresso.total} blocos (${progresso.percentual}%)

${blocoFormatado}

---

## 📝 Como Responder

Preencha os campos acima e use o **onboarding_orchestrator** para continuar:

\`\`\`
onboarding_orchestrator({
    estado_json: "<conteúdo do estado.json que você acabou de criar>",
    diretorio: "${diretorio}",
    acao: "proximo_bloco",
    respostas_bloco: {
        "campo_id": "valor",
        "outro_campo": "valor"
    }
})
\`\`\`

💡 **Dica:** Quanto mais detalhes você fornecer agora, menos perguntas serão feitas depois!

**Tempo estimado para este bloco:** ${primeiroBloco?.estimatedTime || 5} minutos

---

## 🎯 Fluxo Completo

1. ✅ **Setup concluído** - Projeto configurado
2. 🔄 **Discovery em andamento** - Coletando informações (bloco 1/${progresso.total})
3. ⏳ **Brainstorm** - Após completar discovery
4. ⏳ **PRD** - Consolidação final
5. ⏳ **Fase 1 (Produto)** - Início do desenvolvimento

${args.usar_stitch ? '\n> 🎨 **Google Stitch habilitado** - Disponível para prototipagem após UX Design\n' : ''}
`;

    return {
        content: [{ type: "text", text: resposta }],
        files: [
            { path: `${diretorio}/${estadoFile.path}`, content: estadoFile.content },
            ...resumoFiles.map(f => ({ path: `${diretorio}/${f.path}`, content: f.content }))
        ],
        estado_atualizado: estadoFile.content,
    };
}

export const iniciarProjetoSchema = {
    type: "object",
    properties: {
        nome: { type: "string", description: "Nome do projeto" },
        descricao: { type: "string", description: "Descrição para análise" },
        diretorio: { type: "string", description: "Diretório absoluto" },
        ide: { type: "string", enum: ['windsurf', 'cursor', 'antigravity'], description: "IDE alvo para injection" },
        modo: { type: "string", enum: ['economy', 'balanced', 'quality'], description: "Modo de execução: economy (rápido), balanced (equilibrado), quality (máxima qualidade)" },
        auto_flow: { type: "boolean", description: "Auto-avança entre fases quando score >= 70" },
        usar_stitch: { type: "boolean", description: "Habilita Google Stitch para prototipagem de UI" },
        project_definition_source: { type: "string", enum: ['ja_definido', 'brainstorm', 'sandbox'], description: "Fonte da definição do projeto" },
        brainstorm_mode: { type: "string", enum: ['none', 'assistido'], description: "Modo de brainstorm" },
        confirmar_automaticamente: { type: "boolean", description: "Criar estado e iniciar discovery em 1 passo" }
    },
    required: ["nome", "diretorio"],
};

export const confirmarProjetoSchema = {
    type: "object",
    properties: {
        nome: { type: "string" },
        descricao: { type: "string" },
        diretorio: { type: "string" },
        tipo_artefato: { type: "string", enum: ["poc", "script", "internal", "product"] },
        nivel_complexidade: { type: "string", enum: ["simples", "medio", "complexo"] },
        ide: { type: "string", enum: ['windsurf', 'cursor', 'antigravity'], description: "IDE alvo para injection" },
        modo: { type: "string", enum: ['economy', 'balanced', 'quality'], description: "Modo de execução" },
        auto_flow: { type: "boolean", description: "Auto-avança entre fases quando score >= 70" },
        usar_stitch: { type: "boolean", description: "Habilita Google Stitch para prototipagem de UI" },
        project_definition_source: { type: "string", enum: ['ja_definido', 'brainstorm', 'sandbox'], description: "Fonte da definição do projeto" },
        brainstorm_mode: { type: "string", enum: ['none', 'assistido'], description: "Modo de brainstorm" }
    },
    required: ["nome", "diretorio", "ide", "modo"],
};
