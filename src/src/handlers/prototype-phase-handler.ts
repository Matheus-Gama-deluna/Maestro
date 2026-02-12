/**
 * Prototype Phase Handler (v9.0)
 * 
 * Handler dedicado para a fase de Prototipagem com Google Stitch.
 * Gerencia o ciclo completo:
 *   analyzing → prompts_generated → awaiting_html → validating_html → approved
 * 
 * Fluxo:
 * 1. ANALYZING: Lê Design Doc + docs anteriores, mapeia componentes/telas
 * 2. PROMPTS_GENERATED: Gera prompts otimizados para Google Stitch, salva em arquivo
 * 3. AWAITING_HTML: Aguarda usuário retornar com arquivos HTML do Stitch
 * 4. VALIDATING_HTML: Valida arquivos HTML na pasta prototipos/
 * 5. APPROVED: Protótipos validados, avança para próxima fase
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { OnboardingState } from "../types/onboarding.js";
import { formatResponse, formatError } from "../utils/response-formatter.js";
import { serializarEstado } from "../state/storage.js";
import { saveFile } from "../utils/persistence.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { existsSync, readFileSync, readdirSync, mkdirSync, statSync } from "fs";
import { join, basename, extname } from "path";
import { detectIDE, getSkillFilePath, getSkillsDir, type IDEType } from "../utils/ide-paths.js";

// === CONSTANTES ===

/** Pasta onde os protótipos HTML devem ser colocados pelo usuário */
const PROTOTYPE_OUTPUT_DIR = 'prototipos';

/** Pasta de prompts gerados */
const PROMPTS_OUTPUT_FILE = 'prototipos/stitch-prompts.md';

/** Documento de validação final */
const VALIDATION_OUTPUT_FILE = 'prototipos/validacao-prototipos.md';

/** Sub-estados da fase de prototipagem */
export type PrototypePhaseStatus =
    | 'analyzing'
    | 'prompts_generated'
    | 'awaiting_html'
    | 'validating_html'
    | 'approved';

/** Estado persistido no specialistPhase.collectedData para prototipagem */
interface PrototypePhaseData {
    prototypeStatus: PrototypePhaseStatus;
    designDocPath?: string;
    designDocContent?: string;
    mappedComponents?: string[];
    mappedScreens?: string[];
    designSystem?: string;
    promptsGenerated?: boolean;
    promptsFilePath?: string;
    htmlFiles?: string[];
    validationScore?: number;
    validationDetails?: string;
    iterationCount: number;
}

interface PrototypePhaseArgs {
    estado: EstadoProjeto;
    diretorio: string;
    respostas?: Record<string, unknown>;
    entregavel?: string;
}

// === HELPERS ===

function getPrototypeDir(diretorio: string): string {
    return join(diretorio, PROTOTYPE_OUTPUT_DIR);
}

function getPromptsFilePath(diretorio: string): string {
    return join(diretorio, PROMPTS_OUTPUT_FILE);
}

function getValidationFilePath(diretorio: string): string {
    return join(diretorio, VALIDATION_OUTPUT_FILE);
}

/**
 * Cria a pasta prototipos/ se não existir
 */
function ensurePrototypeDir(diretorio: string): string {
    const dir = getPrototypeDir(diretorio);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return dir;
}

/**
 * Busca arquivos HTML na pasta prototipos/
 */
function findHtmlFiles(diretorio: string): string[] {
    const dir = getPrototypeDir(diretorio);
    if (!existsSync(dir)) return [];

    try {
        const files = readdirSync(dir, { recursive: true }) as string[];
        return files
            .filter(f => {
                const ext = extname(String(f)).toLowerCase();
                return ext === '.html' || ext === '.htm';
            })
            .map(f => String(f));
    } catch {
        return [];
    }
}

/**
 * Valida os arquivos HTML encontrados
 */
function validateHtmlFiles(diretorio: string, htmlFiles: string[]): {
    score: number;
    details: Array<{ file: string; size: number; hasContent: boolean; hasStructure: boolean }>;
    summary: string;
} {
    const dir = getPrototypeDir(diretorio);
    const details: Array<{ file: string; size: number; hasContent: boolean; hasStructure: boolean }> = [];
    let totalScore = 0;

    for (const file of htmlFiles) {
        const fullPath = join(dir, file);
        try {
            const stat = statSync(fullPath);
            const content = readFileSync(fullPath, 'utf-8');
            const size = stat.size;
            const hasContent = content.trim().length > 100;
            const hasStructure = /<html/i.test(content) || /<div/i.test(content) || /<body/i.test(content);

            let fileScore = 0;
            if (hasContent) fileScore += 50;
            if (hasStructure) fileScore += 30;
            if (size > 500) fileScore += 10;
            if (/<style/i.test(content) || /class="/i.test(content)) fileScore += 10;

            totalScore += fileScore;
            details.push({ file, size, hasContent, hasStructure });
        } catch {
            details.push({ file, size: 0, hasContent: false, hasStructure: false });
        }
    }

    const avgScore = htmlFiles.length > 0 ? Math.round(totalScore / htmlFiles.length) : 0;

    const summary = details.map(d =>
        `${d.hasContent && d.hasStructure ? '✅' : d.hasContent ? '⚠️' : '❌'} **${d.file}** — ${formatSize(d.size)}${d.hasStructure ? '' : ' (sem estrutura HTML válida)'}`
    ).join('\n');

    return { score: avgScore, details, summary };
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Tenta localizar o Design Doc da fase anterior (UX Design)
 */
function findDesignDoc(diretorio: string, estado: EstadoProjeto): { path: string; content: string } | null {
    // Tentar paths comuns do Design Doc
    const candidates = [
        join(diretorio, 'docs/03-ux-design/design-doc.md'),
        join(diretorio, 'docs/fase-03-ux-design/design-doc.md'),
        join(diretorio, 'docs/03-ux/design-doc.md'),
        join(diretorio, 'docs/fase-03-ux/design-doc.md'),
    ];

    // Também verificar entregáveis salvos no estado
    for (const key of Object.keys(estado.entregaveis || {})) {
        const path = estado.entregaveis[key];
        if (path && existsSync(path)) {
            const content = readFileSync(path, 'utf-8');
            if (content.toLowerCase().includes('design') || content.toLowerCase().includes('ux')) {
                return { path, content };
            }
        }
    }

    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            try {
                return { path: candidate, content: readFileSync(candidate, 'utf-8') };
            } catch { /* ignore */ }
        }
    }

    // Buscar qualquer .md em docs/ que contenha "design"
    try {
        const docsDir = join(diretorio, 'docs');
        if (existsSync(docsDir)) {
            const walkDir = (dir: string): string[] => {
                const results: string[] = [];
                try {
                    const entries = readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = join(dir, entry.name);
                        if (entry.isDirectory()) {
                            results.push(...walkDir(fullPath));
                        } else if (entry.name.toLowerCase().includes('design') && extname(entry.name) === '.md') {
                            results.push(fullPath);
                        }
                    }
                } catch { /* ignore */ }
                return results;
            };
            const designFiles = walkDir(docsDir);
            if (designFiles.length > 0) {
                const content = readFileSync(designFiles[0], 'utf-8');
                return { path: designFiles[0], content };
            }
        }
    } catch { /* ignore */ }

    return null;
}

/**
 * Resolve a IDE do projeto
 */
function resolveIDE(estado: EstadoProjeto, diretorio: string): IDEType {
    return estado.ide || detectIDE(diretorio) || 'windsurf';
}

/**
 * Persiste estado atualizado
 */
async function persistState(
    estado: EstadoProjeto,
    diretorio: string
): Promise<void> {
    estado.atualizado_em = new Date().toISOString();
    const estadoFile = serializarEstado(estado);
    try {
        await saveFile(`${diretorio}/${estadoFile.path}`, estadoFile.content);
    } catch (err) {
        console.error('[prototype-phase] Erro ao salvar estado:', err);
    }
}

/**
 * Obtém ou inicializa os dados da fase de prototipagem
 */
function getPrototypeData(collectedData: Record<string, any>): PrototypePhaseData {
    return {
        prototypeStatus: collectedData.prototypeStatus || 'analyzing',
        designDocPath: collectedData.designDocPath,
        designDocContent: collectedData.designDocContent,
        mappedComponents: collectedData.mappedComponents || [],
        mappedScreens: collectedData.mappedScreens || [],
        designSystem: collectedData.designSystem,
        promptsGenerated: collectedData.promptsGenerated || false,
        promptsFilePath: collectedData.promptsFilePath,
        htmlFiles: collectedData.htmlFiles || [],
        validationScore: collectedData.validationScore,
        validationDetails: collectedData.validationDetails,
        iterationCount: collectedData.iterationCount || 0,
    };
}

function savePrototypeData(collectedData: Record<string, any>, data: PrototypePhaseData): void {
    Object.assign(collectedData, data);
}

// === ENTRY POINT ===

/**
 * Entry point do prototype phase handler.
 * Detecta sub-estado e delega para o handler correto.
 */
export async function handlePrototypePhase(args: PrototypePhaseArgs): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const onboarding = (estado as any).onboarding as OnboardingState | undefined;
    const sp = onboarding?.specialistPhase;

    if (!sp) {
        return {
            content: formatError(
                "prototype-phase",
                "Nenhuma fase de especialista ativa encontrada.",
                `Use \`maestro({diretorio: "${diretorio}"})\` para verificar o status do projeto.`
            ),
            isError: true,
        };
    }

    const data = getPrototypeData(sp.collectedData);

    // Criar pasta prototipos/ automaticamente
    ensurePrototypeDir(diretorio);

    switch (data.prototypeStatus) {
        case 'analyzing':
            return handleAnalyzing(args, sp, data);

        case 'prompts_generated':
            return handlePromptsGenerated(args, sp, data);

        case 'awaiting_html': {
            // Verificar se há HTMLs na pasta
            const htmlFiles = findHtmlFiles(diretorio);
            if (htmlFiles.length > 0) {
                data.prototypeStatus = 'validating_html';
                data.htmlFiles = htmlFiles;
                savePrototypeData(sp.collectedData, data);
                return handleValidatingHtml(args, sp, data);
            }
            return handleAwaitingHtml(args, sp, data);
        }

        case 'validating_html':
            return handleValidatingHtml(args, sp, data);

        case 'approved':
            return handleApproved(args, sp, data);

        default:
            return {
                content: formatError(
                    "prototype-phase",
                    `Sub-estado desconhecido: ${data.prototypeStatus}`,
                    `Use \`executar({diretorio: "${diretorio}", acao: "avancar"})\` para tentar avançar.`
                ),
                isError: true,
            };
    }
}

// === SUB-HANDLERS ===

/**
 * Etapa 1: ANALYZING
 * Lê Design Doc, mapeia componentes e telas, prepara contexto para geração de prompts
 */
async function handleAnalyzing(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio, respostas } = args;

    // Se recebeu respostas com informações de design
    if (respostas) {
        if (respostas.design_system) data.designSystem = String(respostas.design_system);
        if (respostas.telas_prioritarias) {
            data.mappedScreens = Array.isArray(respostas.telas_prioritarias)
                ? respostas.telas_prioritarias.map(String)
                : String(respostas.telas_prioritarias).split(',').map(s => s.trim());
        }
        if (respostas.componentes) {
            data.mappedComponents = Array.isArray(respostas.componentes)
                ? respostas.componentes.map(String)
                : String(respostas.componentes).split(',').map(s => s.trim());
        }
    }

    // Tentar encontrar Design Doc
    const designDoc = findDesignDoc(diretorio, estado);
    if (designDoc) {
        data.designDocPath = designDoc.path;
        // Guardar resumo (não conteúdo completo para economizar tokens)
        data.designDocContent = designDoc.content.substring(0, 3000);
    }

    // Se já temos informações suficientes para gerar prompts
    const hasDesignDoc = !!data.designDocPath;
    const hasScreens = data.mappedScreens && data.mappedScreens.length > 0;
    const hasDesignSystem = !!data.designSystem;

    if (hasDesignDoc && hasScreens && hasDesignSystem) {
        // Avançar para geração de prompts
        data.prototypeStatus = 'prompts_generated';
        sp.status = 'generating';
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);
        return handlePromptsGenerated(args, sp, data);
    }

    // Ainda precisa de informações
    sp.status = 'collecting';
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    const ide = resolveIDE(estado, diretorio);
    const skillDir = `${getSkillsDir(ide)}/specialist-prototipagem-stitch`;

    const missingItems: string[] = [];
    if (!hasDesignDoc) missingItems.push('Design Doc da fase anterior');
    if (!hasDesignSystem) missingItems.push('Design System escolhido (Material, Ant Design, Chakra UI, Custom)');
    if (!hasScreens) missingItems.push('3-5 telas prioritárias para prototipar');

    const designDocInfo = hasDesignDoc
        ? `✅ **Design Doc encontrado:** \`${data.designDocPath}\``
        : `❌ **Design Doc não encontrado** — Verifique se a fase de UX Design foi concluída`;

    return {
        content: formatResponse({
            titulo: "🎨 Prototipagem com Google Stitch — Etapa 1: Análise",
            resumo: `Mapeando componentes e telas para prototipagem. ${3 - missingItems.length}/3 informações coletadas.`,
            dados: {
                "Design Doc": hasDesignDoc ? '✅ Encontrado' : '❌ Não encontrado',
                "Design System": data.designSystem || '❌ Não definido',
                "Telas mapeadas": hasScreens ? data.mappedScreens!.join(', ') : '❌ Nenhuma',
            },
            instrucoes: `## 📋 Análise do Projeto para Prototipagem

${designDocInfo}

${hasDesignDoc ? `### Conteúdo do Design Doc (resumo)
Leia o arquivo completo: \`${data.designDocPath}\`
` : ''}

### 📚 Recursos do Especialista
- Template de Prompts: \`${skillDir}/resources/templates/prompt-stitch.md\`
- Checklist de Validação: \`${skillDir}/resources/checklists/stitch-validation.md\`
- Guia Completo: \`${skillDir}/SKILL.md\`

---

## ❌ Informações Faltantes

${missingItems.map(item => `- **${item}**`).join('\n')}

### 🎯 Pergunte ao usuário:
${!hasDesignSystem ? '1. **Qual Design System usar?** (Material Design, Ant Design, Chakra UI, ou Custom com cores específicas)\n' : ''}${!hasScreens ? '2. **Quais são as 3-5 telas mais importantes para prototipar primeiro?** (ex: Dashboard, Login, Perfil, Listagem)\n' : ''}${!hasDesignDoc ? '3. **Onde está o Design Doc?** (ou peça para o usuário descrever o layout desejado)\n' : ''}

⚠️ **NÃO** peça decisões de stack/infraestrutura — isso é da fase de Arquitetura.
Foco é **100% visual**: transformar o Design Doc em protótipos funcionais.

## 📍 Onde Estamos
🔄 Análise → ⏳ Geração de Prompts → ⏳ Prototipagem no Stitch → ⏳ Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Enviar informações de design coletadas",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": { "design_system": "<Material Design|Ant Design|Chakra UI|Custom>", "telas_prioritarias": ["<tela1>", "<tela2>", "<tela3>"] } }`,
                requer_input_usuario: true,
                prompt_usuario: "Informe o Design System e as telas prioritárias para prototipagem.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Enviar informações de design para geração de prompts",
            args_template: {
                diretorio,
                acao: "avancar",
                respostas: {
                    design_system: "<Design System>",
                    telas_prioritarias: ["<tela1>", "<tela2>", "<tela3>"],
                },
            },
            requires_user_input: true,
            user_prompt: "Informe o Design System e as telas prioritárias.",
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prototipagem rápida", "design system integration", "prompt engineering para UI"],
            instructions: "Foque em mapear componentes e telas do Design Doc. NÃO peça decisões de stack/infraestrutura.",
        },
        progress: {
            current_phase: "prototipagem_analyzing",
            total_phases: 5,
            completed_phases: 0,
            percentage: 10,
        },
    };
}

/**
 * Etapa 2: PROMPTS_GENERATED
 * Gera prompts otimizados para Google Stitch e salva em arquivo
 */
async function handlePromptsGenerated(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    // Carregar template de prompts da skill
    let promptTemplate = "";
    try {
        const contentResolver = new ContentResolverService(diretorio);
        const skillLoader = new SkillLoaderService(contentResolver);
        const pkg = await skillLoader.loadFullPackage('specialist-prototipagem-stitch');
        if (pkg?.templateContent) {
            promptTemplate = pkg.templateContent;
        }
    } catch (err) {
        console.warn('[prototype-phase] Falha ao carregar template de prompts:', err);
    }

    const ide = resolveIDE(estado, diretorio);
    const promptsPath = getPromptsFilePath(diretorio);

    // Construir contexto para geração de prompts
    const screensInfo = data.mappedScreens && data.mappedScreens.length > 0
        ? data.mappedScreens.map((s, i) => `${i + 1}. **${s}**`).join('\n')
        : 'Nenhuma tela mapeada';

    const componentsInfo = data.mappedComponents && data.mappedComponents.length > 0
        ? data.mappedComponents.map((c, i) => `${i + 1}. ${c}`).join('\n')
        : 'Nenhum componente mapeado';

    sp.status = 'generating';
    data.prototypeStatus = 'prompts_generated';
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    return {
        content: formatResponse({
            titulo: "📝 Prototipagem — Etapa 2: Geração de Prompts para Stitch",
            resumo: "Informações coletadas. Gere os prompts otimizados para Google Stitch.",
            dados: {
                "Design System": data.designSystem || 'Não definido',
                "Telas": String(data.mappedScreens?.length || 0),
                "Componentes": String(data.mappedComponents?.length || 0),
                "Design Doc": data.designDocPath ? '✅' : '❌',
            },
            instrucoes: `🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Você DEVE gerar os prompts para Google Stitch e salvá-los no arquivo \`${PROMPTS_OUTPUT_FILE}\`.

## 📋 Contexto para Geração

### Design System: ${data.designSystem || 'A definir'}

### Telas Prioritárias
${screensInfo}

### Componentes Mapeados
${componentsInfo}

${data.designDocPath ? `### Design Doc
Leia o arquivo completo para contexto: \`${data.designDocPath}\`\n` : ''}

## 🎨 Template de Referência para Prompts

${promptTemplate ? `Leia o template completo: \`${getSkillsDir(ide)}/specialist-prototipagem-stitch/resources/templates/prompt-stitch.md\`

### Estrutura de cada prompt:
\`\`\`
Create a [Design System] [tipo de componente/tela] with:
- [Funcionalidade 1]
- [Funcionalidade 2]
- Responsive layout for [dispositivos]
- Color scheme: Primary [#HEX], Secondary [#HEX]
- Typography: [Font family]
\`\`\`` : 'Gere prompts estruturados para cada tela/componente.'}

## ⚠️ INSTRUÇÕES DE GERAÇÃO

1. **Gere 1 prompt por tela** listada acima
2. Cada prompt deve incluir: Design System, cores, tipografia, componentes, responsividade
3. **SALVE todos os prompts** no arquivo \`${PROMPTS_OUTPUT_FILE}\`
4. Após salvar, avance:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

🤖 **NÃO ESPERE** o usuário dizer "pode seguir". Gere os prompts, salve e execute a tool AGORA.

## 📍 Onde Estamos
✅ Análise → 🔄 Geração de Prompts → ⏳ Prototipagem no Stitch → ⏳ Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Salvar prompts e avançar para aguardar HTML",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Salvar prompts em prototipos/stitch-prompts.md e avançar",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: false,
            auto_execute: true,
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prompt engineering para UI", "design system integration"],
            instructions: "Gere prompts otimizados para cada tela. Use o Design System especificado. Seja específico com cores, tipografia e responsividade.",
        },
        progress: {
            current_phase: "prototipagem_prompts",
            total_phases: 5,
            completed_phases: 1,
            percentage: 30,
        },
    };
}

/**
 * Etapa 3: AWAITING_HTML
 * Aguarda o usuário retornar com arquivos HTML do Google Stitch
 */
async function handleAwaitingHtml(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    // Verificar se prompts foram salvos
    const promptsExist = existsSync(getPromptsFilePath(diretorio));

    if (!promptsExist && !data.promptsGenerated) {
        // Prompts ainda não foram gerados — voltar para etapa anterior
        data.prototypeStatus = 'prompts_generated';
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);
        return handlePromptsGenerated(args, sp, data);
    }

    // Marcar prompts como gerados
    data.promptsGenerated = true;
    data.promptsFilePath = getPromptsFilePath(diretorio);
    data.prototypeStatus = 'awaiting_html';
    sp.status = 'collecting';
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    const protoDir = getPrototypeDir(diretorio);
    const htmlFiles = findHtmlFiles(diretorio);

    return {
        content: formatResponse({
            titulo: "🌐 Prototipagem — Etapa 3: Prototipagem no Google Stitch",
            resumo: `Prompts gerados! Agora o usuário deve usar os prompts no stitch.withgoogle.com e retornar os arquivos HTML.`,
            dados: {
                "Prompts salvos": promptsExist ? `✅ ${PROMPTS_OUTPUT_FILE}` : '❌ Não encontrado',
                "Pasta de protótipos": `${PROTOTYPE_OUTPUT_DIR}/`,
                "Arquivos HTML encontrados": String(htmlFiles.length),
            },
            instrucoes: `## 🎯 Instruções para o Usuário

### Passo 1: Acesse o Google Stitch
Abra **[stitch.withgoogle.com](https://stitch.withgoogle.com)** no navegador.

### Passo 2: Use os Prompts Gerados
Os prompts estão salvos em: \`${PROMPTS_OUTPUT_FILE}\`

Para cada tela/componente:
1. Copie o prompt correspondente do arquivo
2. Cole no Google Stitch
3. Itere até obter o resultado desejado
4. **Exporte o código HTML** do Stitch

### Passo 3: Salve os Arquivos HTML
Coloque os arquivos HTML exportados na pasta:

📁 **\`${protoDir}\`**

Estrutura esperada:
\`\`\`
${PROTOTYPE_OUTPUT_DIR}/
├── dashboard.html
├── login.html
├── perfil.html
├── listagem.html
└── ... (outros protótipos)
\`\`\`

### Passo 4: Avise quando terminar
Após colocar todos os arquivos HTML na pasta, diga **"protótipos prontos"** ou execute:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

---

⚠️ **IMPORTANTE:**
- A fase **só será concluída** quando os arquivos HTML estiverem na pasta \`${PROTOTYPE_OUTPUT_DIR}/\`
- O sistema validará automaticamente os arquivos HTML
- Você pode iterar quantas vezes quiser antes de avançar

${htmlFiles.length > 0 ? `\n### 📄 Arquivos HTML já encontrados:\n${htmlFiles.map(f => `- \`${f}\``).join('\n')}\n\n> Para validar estes arquivos, execute \`executar({acao: "avancar"})\`` : ''}

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → 🔄 Prototipagem no Stitch → ⏳ Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Verificar arquivos HTML na pasta prototipos/",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: true,
                prompt_usuario: "Coloque os arquivos HTML exportados do Stitch na pasta prototipos/ e diga 'protótipos prontos'.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Verificar arquivos HTML após usuário colocar na pasta",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: true,
            user_prompt: "Coloque os arquivos HTML na pasta prototipos/ e avise quando terminar.",
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prototipagem rápida", "export HTML/CSS"],
            instructions: "Aguarde o usuário retornar com os arquivos HTML. Oriente sobre como usar o Stitch se necessário.",
        },
        progress: {
            current_phase: "prototipagem_awaiting_html",
            total_phases: 5,
            completed_phases: 2,
            percentage: 50,
        },
    };
}

/**
 * Etapa 4: VALIDATING_HTML
 * Valida os arquivos HTML encontrados na pasta prototipos/
 */
async function handleValidatingHtml(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;

    const htmlFiles = findHtmlFiles(diretorio);

    if (htmlFiles.length === 0) {
        // Nenhum HTML encontrado — voltar para awaiting
        data.prototypeStatus = 'awaiting_html';
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);
        return handleAwaitingHtml(args, sp, data);
    }

    // Validar arquivos
    const validation = validateHtmlFiles(diretorio, htmlFiles);
    data.htmlFiles = htmlFiles;
    data.validationScore = validation.score;
    data.validationDetails = validation.summary;
    data.iterationCount++;

    sp.status = 'validating';
    sp.validationScore = validation.score;

    if (validation.score >= 50) {
        // Aprovado — gerar documento de validação
        data.prototypeStatus = 'approved';
        sp.status = 'approved';
        sp.completedAt = new Date().toISOString();
        savePrototypeData(sp.collectedData, data);
        await persistState(estado, diretorio);

        // Gerar documento de validação
        const validationDoc = generateValidationDocument(data, validation, diretorio);
        try {
            await saveFile(getValidationFilePath(diretorio), validationDoc);
        } catch (err) {
            console.warn('[prototype-phase] Falha ao salvar validação:', err);
        }

        return handleApproved(args, sp, data);
    }

    // Score baixo — pedir melhorias
    savePrototypeData(sp.collectedData, data);
    await persistState(estado, diretorio);

    return {
        content: formatResponse({
            titulo: "📊 Validação dos Protótipos — Melhorias Necessárias",
            resumo: `${htmlFiles.length} arquivo(s) HTML encontrado(s). Score: ${validation.score}/100. Iteração ${data.iterationCount}.`,
            dados: {
                "Arquivos HTML": String(htmlFiles.length),
                "Score": `${validation.score}/100`,
                "Mínimo": "50/100",
                "Iteração": String(data.iterationCount),
            },
            instrucoes: `## 📄 Arquivos Encontrados

${validation.summary}

## ⚠️ Melhorias Necessárias

Os arquivos HTML precisam de mais conteúdo/estrutura para serem aprovados.

### Sugestões:
- Verifique se os arquivos foram exportados corretamente do Stitch
- Cada arquivo deve conter HTML válido com tags \`<html>\`, \`<body>\`, \`<div>\`, etc.
- Inclua CSS inline ou em \`<style>\` para estilização
- Arquivos muito pequenos (< 500 bytes) indicam export incompleto

### Para corrigir:
1. Re-exporte os protótipos do Google Stitch
2. Substitua os arquivos na pasta \`${PROTOTYPE_OUTPUT_DIR}/\`
3. Execute novamente:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → ✅ Prototipagem no Stitch → 🔄 Validação HTML → ⏳ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Re-validar após melhorias nos arquivos HTML",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: true,
                prompt_usuario: "Corrija os arquivos HTML e avise quando estiverem prontos.",
            },
        }),
        next_action: {
            tool: "executar",
            description: "Re-validar arquivos HTML após correções",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: true,
            user_prompt: "Corrija os arquivos HTML e avise quando prontos.",
        },
        progress: {
            current_phase: "prototipagem_validating",
            total_phases: 5,
            completed_phases: 3,
            percentage: 70,
        },
    };
}

/**
 * Etapa 5: APPROVED
 * Protótipos validados, preparar transição para próxima fase
 */
async function handleApproved(
    args: PrototypePhaseArgs,
    sp: any,
    data: PrototypePhaseData
): Promise<ToolResult> {
    const { estado, diretorio } = args;
    const onboarding = (estado as any).onboarding as OnboardingState;

    const htmlFiles = data.htmlFiles || findHtmlFiles(diretorio);
    const protoDir = getPrototypeDir(diretorio);

    // Limpar specialistPhase para que avancar.ts não redirecione de volta
    const finalScore = data.validationScore || 0;
    const finalIteration = data.iterationCount;

    // Marcar fase como concluída no onboarding
    if (onboarding) {
        delete onboarding.specialistPhase;
        onboarding.phase = 'completed';
        onboarding.completedAt = new Date().toISOString();
    }

    // NÃO avançar fase_atual aqui — isso é responsabilidade do proximo.ts
    // Apenas marcar que o entregável está pronto
    estado.status = 'ativo';

    await persistState(estado, diretorio);

    // Gerar entregável prototipos.md com resumo
    const entregavelContent = generatePrototypeSummary(data, htmlFiles, diretorio);
    const entregavelPath = join(protoDir, 'prototipos.md');
    try {
        await saveFile(entregavelPath, entregavelContent);
    } catch (err) {
        console.warn('[prototype-phase] Falha ao salvar entregável:', err);
    }

    return {
        content: formatResponse({
            titulo: "✅ Protótipos Aprovados!",
            resumo: `${htmlFiles.length} protótipo(s) HTML validado(s) com score ${finalScore}/100. Fase de prototipagem concluída!`,
            dados: {
                "Arquivos HTML": String(htmlFiles.length),
                "Score Final": `${finalScore}/100`,
                "Iterações": String(finalIteration),
                "Pasta": `${PROTOTYPE_OUTPUT_DIR}/`,
                "Entregável": `${PROTOTYPE_OUTPUT_DIR}/prototipos.md`,
            },
            instrucoes: `## 🎉 Prototipagem Concluída!

### 📁 Arquivos do Protótipo
${htmlFiles.map(f => `- \`${PROTOTYPE_OUTPUT_DIR}/${f}\``).join('\n')}

### 📄 Documentos Gerados
- Prompts: \`${PROMPTS_OUTPUT_FILE}\`
- Validação: \`${VALIDATION_OUTPUT_FILE}\`
- Resumo: \`${PROTOTYPE_OUTPUT_DIR}/prototipos.md\`

### 🚀 Próximos Passos
1. Os protótipos HTML servem como referência visual para o desenvolvimento
2. O código exportado pode ser usado como base para componentes frontend
3. O Design Doc foi validado visualmente através dos protótipos

Para avançar para a próxima fase (Arquitetura):

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar"
})
\`\`\`

## 📍 Onde Estamos
✅ Análise → ✅ Geração de Prompts → ✅ Prototipagem no Stitch → ✅ Validação HTML → ✅ Aprovação`,
            proximo_passo: {
                tool: "executar",
                descricao: "Avançar para a próxima fase",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar" }`,
                requer_input_usuario: false,
                auto_execute: true,
            },
        }),
        next_action: {
            tool: "executar",
            description: "Avançar para próxima fase (Arquitetura)",
            args_template: { diretorio, acao: "avancar" },
            requires_user_input: false,
            auto_execute: true,
        },
        specialist_persona: {
            name: "Prototipagem Rápida com Google Stitch",
            tone: "Visual e iterativo",
            expertise: ["Google Stitch", "prototipagem rápida", "export HTML/CSS"],
            instructions: "Protótipos aprovados. Prepare a transição para a fase de Arquitetura.",
        },
        progress: {
            current_phase: "prototipagem_approved",
            total_phases: 5,
            completed_phases: 5,
            percentage: 100,
        },
    };
}

// === DOCUMENT GENERATORS ===

function generateValidationDocument(
    data: PrototypePhaseData,
    validation: ReturnType<typeof validateHtmlFiles>,
    diretorio: string
): string {
    const now = new Date().toISOString().split('T')[0];
    return `# Validação de Protótipos — ${now}

## Resumo
- **Score:** ${validation.score}/100
- **Arquivos:** ${validation.details.length}
- **Iterações:** ${data.iterationCount}
- **Design System:** ${data.designSystem || 'N/A'}

## Arquivos Validados

| Arquivo | Tamanho | Conteúdo | Estrutura HTML |
|---------|---------|----------|----------------|
${validation.details.map(d => `| ${d.file} | ${formatSize(d.size)} | ${d.hasContent ? '✅' : '❌'} | ${d.hasStructure ? '✅' : '❌'} |`).join('\n')}

## Telas Prototipadas
${(data.mappedScreens || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'N/A'}

## Componentes Mapeados
${(data.mappedComponents || []).map((c, i) => `${i + 1}. ${c}`).join('\n') || 'N/A'}

---
*Gerado automaticamente pelo Maestro — Fase de Prototipagem*
`;
}

function generatePrototypeSummary(
    data: PrototypePhaseData,
    htmlFiles: string[],
    diretorio: string
): string {
    const now = new Date().toISOString().split('T')[0];
    return `# Protótipos — Resumo da Fase

**Data:** ${now}
**Design System:** ${data.designSystem || 'N/A'}
**Score de Validação:** ${data.validationScore || 0}/100

## Arquivos HTML

${htmlFiles.map(f => `- \`${f}\``).join('\n') || 'Nenhum arquivo'}

## Telas Prototipadas

${(data.mappedScreens || []).map((s, i) => `${i + 1}. **${s}**`).join('\n') || 'N/A'}

## Componentes

${(data.mappedComponents || []).map((c, i) => `${i + 1}. ${c}`).join('\n') || 'N/A'}

## Design Doc de Referência

${data.designDocPath ? `\`${data.designDocPath}\`` : 'Não encontrado'}

## Prompts Utilizados

Arquivo: \`${PROMPTS_OUTPUT_FILE}\`

---

### Próximos Passos
1. Usar protótipos como referência visual no desenvolvimento frontend
2. Componentes HTML podem ser adaptados para o framework escolhido
3. Manter protótipos atualizados conforme mudanças de design

---
*Gerado automaticamente pelo Maestro — Fase de Prototipagem*
`;
}

/**
 * Verifica se a fase atual é de prototipagem (Stitch) pelo nome da fase
 */
export function isPrototypePhase(faseNome: string | undefined, usarStitch: boolean): boolean {
    if (!usarStitch) return false;
    return faseNome?.toLowerCase() === 'prototipagem';
}
