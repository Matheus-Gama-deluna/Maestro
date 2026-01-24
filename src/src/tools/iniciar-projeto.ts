import { join, resolve } from "path";
import { existsSync, readdirSync } from "fs";
import { platform } from "os";
import { v4 as uuid } from "uuid";
import type { ToolResult, TipoArtefato, NivelComplexidade, TierGate } from "../types/index.js";
import { criarEstadoInicial, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { criarResumoInicial, serializarResumo } from "../state/memory.js";
import { determinarTierGate, descreverTier } from "../gates/tiers.js";
import { logEvent, EventTypes } from "../utils/history.js";
import { gerarSystemMd } from "../utils/system-md.js";
import { detectarStack, gerarSecaoPrompts, gerarSecaoExemplo } from "../utils/prompt-mapper.js";
import { resolveProjectPath } from "../utils/files.js";

interface IniciarProjetoArgs {
    nome: string;
    descricao?: string;
    diretorio: string;
}

interface ConfirmarProjetoArgs extends IniciarProjetoArgs {
    tipo_artefato: TipoArtefato;
    nivel_complexidade: NivelComplexidade;
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

    // Verificar se o CLI foi executado
    const configPath = join(diretorio, '.maestro', 'config.json');
    
    if (!existsSync(configPath)) {
        // Tentar listar o diretório para debug (se existir)
        try {
            if (existsSync(diretorio)) {
                console.log('[DEBUG] Conteúdo do diretório:', readdirSync(diretorio));
                if (existsSync(join(diretorio, '.maestro'))) {
                    console.log('[DEBUG] Conteúdo de .maestro:', readdirSync(join(diretorio, '.maestro')));
                }
            } else {
                console.log('[DEBUG] Diretório raiz não existe');
            }
        } catch (e) {
            console.log('[DEBUG] Erro ao listar diretório:', e);
        }

        return {
            content: [{ 
                type: "text", 
                text: `# ⚠️ Pré-requisito: CLI não inicializado

O Maestro CLI precisa ser executado primeiro para configurar o projeto.

## 📦 Execute o comando:

\`\`\`bash
cd ${diretorio}
npx @maestro-ai/cli
\`\`\`

## Caminho verificado:
\`${configPath}\`

## O que o CLI faz:
- Cria a estrutura \`.maestro/\` com config.json
- Injeta especialistas, templates e prompts locais
- Configura skills e workflows
- Gera arquivos de regras para sua IDE

## 🐛 Debug Info (Path Resolution)
- **OS Platform**: ${platform()}
- **Process CWD**: ${process.cwd()}
- **Raw Args Directory**: ${args.diretorio}
- **Resolved Directory**: ${diretorio}
- **Config Path Checked**: ${configPath}
- **FS Exists (Resolved)**: ${existsSync(diretorio)}
- **FS Exists (Config)**: ${existsSync(configPath)}

---

**Após executar o CLI, tente novamente:**
\`\`\`
iniciar_projeto(nome: "${args.nome}", diretorio: "${args.diretorio}")
\`\`\`
`
            }],
            isError: true,
        };
    }

    // Inferir Classificação
    const inferenciaTipo = inferirTipoArtefato(args.nome, args.descricao);
    const inferenciaNivel = inferirComplexidade(inferenciaTipo.tipo, args.descricao);
    const tierSugerido = determinarTierGate(inferenciaTipo.tipo, inferenciaNivel.nivel);
    const descricaoTier = descreverTier(tierSugerido);

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
confirmar_projeto(
    nome: "${args.nome}",
    descricao: "${args.descricao || ''}",
    diretorio: "${args.diretorio}",
    tipo_artefato: "${inferenciaTipo.tipo}",
    nivel_complexidade: "${inferenciaNivel.nivel}"
)
\`\`\`

**Opção 2: Ajustar (Forçar outro tipo)**
\`\`\`
confirmar_projeto(
    nome: "${args.nome}",
    descricao: "${args.descricao || ''}",
    diretorio: "${args.diretorio}",
    tipo_artefato: "product",  <-- altere aqui
    nivel_complexidade: "complexo" <-- altere aqui
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

    // Verificar se o CLI foi executado
    const configPath = join(diretorio, '.maestro', 'config.json');
    if (!existsSync(configPath)) {
        return {
            content: [{ 
                type: "text", 
                text: `# ⚠️ Pré-requisito: CLI não inicializado

O Maestro CLI precisa ser executado primeiro para configurar o projeto.

## 📦 Execute o comando:

\`\`\`bash
cd ${diretorio}
npx @maestro-ai/cli
\`\`\`

---

**Após executar o CLI, tente novamente:**
\`\`\`
confirmar_projeto(
    nome: "${args.nome}",
    descricao: "${args.descricao || ''}",
    diretorio: "${diretorio}",
    tipo_artefato: "${args.tipo_artefato}",
    nivel_complexidade: "${args.nivel_complexidade}"
)
\`\`\`
`
            }],
            isError: true,
        };
    }

    // Recalcula tier baseado no confirmado
    const tier = determinarTierGate(args.tipo_artefato, args.nivel_complexidade);

    const projetoId = uuid();

    // Cria estado com novos campos
    const estado = criarEstadoInicial(projetoId, args.nome, diretorio);
    estado.nivel = args.nivel_complexidade;
    estado.tipo_artefato = args.tipo_artefato;
    estado.tier_gate = tier;
    estado.classificacao_confirmada = true;

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

| Campo | Valor |
|-------|-------|
| **ID** | \`${projetoId}\` |
| **Diretório** | \`${diretorio}\` |

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

## 🎨 Prototipagem Rápida com Google Stitch (Opcional)

Antes de iniciar o desenvolvimento, você gostaria de usar o **Google Stitch** para criar protótipos de UI rapidamente?

### Com Stitch você pode:
- ✨ Validar UI com stakeholders antes de desenvolver
- 🎯 Gerar código base para componentes
- ⚡ Acelerar a fase de design

> [Mais sobre Google Stitch](https://stitch.withgoogle.com)

---

## ❓ AGUARDANDO RESPOSTA DO USUÁRIO

**Pergunte ao usuário:**
> "Deseja utilizar o Google Stitch para prototipagem rápida de UI?"
>
> Opções: **"Sim"** ou **"Não"**

Após a resposta, use a tool \`confirmar_stitch\`:

\`\`\`
confirmar_stitch(
    estado_json: "<conteúdo do estado.json>",
    diretorio: "${diretorio}",
    usar_stitch: true  // ou false
)
\`\`\`

> ⚠️ **IMPORTANTE**: Aguarde a resposta do usuário antes de prosseguir!

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
    },
    required: ["nome", "diretorio", "tipo_artefato", "nivel_complexidade"],
};
