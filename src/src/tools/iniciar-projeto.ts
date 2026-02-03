import { join, resolve } from "path";
import { existsSync, readdirSync } from "fs";
import { platform } from "os";
import { randomUUID } from "crypto";
import type { ToolResult, TipoArtefato, NivelComplexidade, TierGate } from "../types/index.js";
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

interface IniciarProjetoArgs {
    nome: string;
    descricao?: string;
    diretorio: string;
    ide?: 'windsurf' | 'cursor' | 'antigravity';
    modo?: 'economy' | 'balanced' | 'quality';
}

interface ConfirmarProjetoArgs extends IniciarProjetoArgs {
    tipo_artefato: TipoArtefato;
    nivel_complexidade: NivelComplexidade;
    ide: 'windsurf' | 'cursor' | 'antigravity';
    modo: 'economy' | 'balanced' | 'quality';
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
 * Analisa a descrição, infere tipo e tier, e PEDE CONFIRMAÇÃO
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

    // 🚀 INJETAR CONTEÚDO AUTOMATICAMENTE (via npx)
    // 🚀 INJETAR CONTEÚDO AUTOMATICAMENTE
    // 🚀 INJETAR CONTEÚDO AUTOMATICAMENTE
    try {
        if (args.ide) {
            const injResult = await injectContentForIDE(diretorio, args.ide);
            console.error(`[INFO] Rules/Skills injetados para ${args.ide} em: ${injResult.targetDir}`);
        } else {
            return {
                content: [{ type: "text", text: `⚠️ **Ação Necessária**: Por favor, informe qual IDE você está utilizando para configurar o ambiente corretamente.\n\nExecute novamente o comando informando o parâmetro \`ide\`:\n\n- \`windsurf\`\n- \`cursor\`\n- \`antigravity\`\n\nExemplo:\n\`iniciar_projeto(..., ide: "cursor")\`` }],
            };
        }
    } catch (error) {
        console.error('[WARN] Não foi possível injetar conteúdo:', error);
    }

    // Inferir Classificação
    const inferenciaTipo = inferirTipoArtefato(args.nome, args.descricao);
    const inferenciaNivel = inferirComplexidade(inferenciaTipo.tipo, args.descricao);
    const tierSugerido = determinarTierGate(inferenciaTipo.tipo, inferenciaNivel.nivel);
    const descricaoTier = descreverTier(tierSugerido);
    
    // Mapear modo para nível de complexidade se não especificado
    const modoSugerido = args.modo || mapearModoParaNivel(inferenciaTipo.tipo);
    const nivelPorModo = mapearModoParaNivel(modoSugerido);

    const resposta = `# 🧐 Análise de Novo Projeto: ${args.nome}

Analisei a descrição e sugiro a seguinte configuração:

| Configuração | Sugestão | Motivo |
|---|---|---|
| **Tipo de Artefato** | \`${inferenciaTipo.tipo}\` | ${inferenciaTipo.razao} |
| **Complexidade** | \`${inferenciaNivel.nivel}\` | ${inferenciaNivel.razao} |
| **Tier de Gates** | **${tierSugerido.toUpperCase()}** | ${descricaoTier} |

---

## 🚦 Confirmação Necessária

Para efetivamente criar o projeto, você precisa **confirmar ou ajustar** estes valores.

**Opção 1: Concordo (Criar como sugerido)**
\`\`\`
**Opção 1: Concordo (Criar como sugerido)**
\`\`\`
confirmar_projeto(
    nome: "${args.nome}",
    descricao: "${args.descricao || ''}",
    diretorio: "${args.diretorio}",
    tipo_artefato: "${inferenciaTipo.tipo}",
    nivel_complexidade: "${inferenciaNivel.nivel}",
    ide: "${args.ide}",
    modo: "${modoSugerido}"
)
\`\`\`

**Opção 2: Ajustar (Forçar outro tipo)**
\`\`\`
confirmar_projeto(
    nome: "${args.nome}",
    descricao: "${args.descricao || ''}",
    diretorio: "${args.diretorio}",
    tipo_artefato: "product",  <-- altere aqui
    nivel_complexidade: "complexo", <-- altere aqui
    ide: "${args.ide}"
)
\`\`\`
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

    // Recalcula tier baseado no confirmado
    const tier = determinarTierGate(args.tipo_artefato, args.nivel_complexidade);

    const projetoId = randomUUID();

    // Cria estado com novos campos
    const estado = criarEstadoInicial(projetoId, args.nome, diretorio, args.ide);
    estado.nivel = args.nivel_complexidade;
    estado.tipo_artefato = args.tipo_artefato;
    estado.tier_gate = tier;
    estado.classificacao_confirmada = true;
    
    // Configurar modo e otimizações
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
    };

    // Cria resumo
    const resumo = criarResumoInicial(projetoId, args.nome, args.nivel_complexidade, 1, 10);
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

    const resposta = `# 🚀 Projeto Iniciado: ${args.nome}

**Configuração Confirmada:**
- Tipo: \`${args.tipo_artefato}\`
- Complexidade: \`${args.nivel_complexidade}\`
- Tier: **${tier.toUpperCase()}**
- Modo: **${args.modo.toUpperCase()}** ${getModoDescription(args.modo)}

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

## � Próximo Passo: Discovery

${args.modo === 'economy' ? 
'**Modo Economy:** Vamos coletar apenas informações essenciais para começar rapidamente.' :
args.modo === 'quality' ?
'**Modo Quality:** Vamos coletar informações detalhadas para garantir máxima qualidade.' :
'**Modo Balanced:** Vamos coletar informações moderadas para equilibrar velocidade e qualidade.'}

Para reduzir a quantidade de perguntas durante o projeto, execute o **Discovery**:

\`\`\`
discovery(
    estado_json: "<conteúdo do estado.json>",
    diretorio: "${diretorio}"
)
\`\`\`

Isso irá gerar um questionário agrupado. Após responder, os especialistas terão todo o contexto necessário!

---

## 🎨 Prototipagem Rápida com Google Stitch (Opcional)

Se desejar, você pode usar o **Google Stitch** para prototipagem de UI após a fase de UX Design.

> [Mais sobre Google Stitch](https://stitch.withgoogle.com)

---

## 🎨 Próximos Passos (Alternativo)

Se não for usar o Stitch, você pode iniciar a Fase 1 (Produto) direto.
O projeto foi inicializado no Tier **${tier.toUpperCase()}**.
${gerarSecaoPrompts("Produto")}
${gerarSecaoExemplo(detectarStack(args.nome, args.descricao))}
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
        modo: { type: "string", enum: ['economy', 'balanced', 'quality'], description: "Modo de execução: economy (rápido), balanced (equilibrado), quality (máxima qualidade)" }
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
        modo: { type: "string", enum: ['economy', 'balanced', 'quality'], description: "Modo de execução" }
    },
    required: ["nome", "diretorio", "tipo_artefato", "nivel_complexidade", "ide", "modo"],
};
