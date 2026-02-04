import { cp, mkdir, readdir } from "fs/promises";
import { existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFile, readFile } from "fs/promises";
import { SkillAdapter } from "../adapters/skill-adapter.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getDefaultSourceDir(): string {
    // Tente diferentes caminhos relativos para encontrar o conteúdo
    const possiblePaths = [
        join(__dirname, "..", "..", "..", "content"),    // src/../content
        join(__dirname, "..", "..", "content"),          // src/content
        join(__dirname, "content"),                      // mesmo dir
        join(process.cwd(), "content"),                  // working dir
        join(__dirname, "..", "content"),                // dist/content (quando instalado)
    ];
    
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            console.error(`[DEBUG] Conteúdo encontrado em: ${path}`);
            return path;
        }
    }
    
    console.error(`[DEBUG] Conteúdo não encontrado. Tentados: ${possiblePaths.join(", ")}`);
    throw new Error("Conteúdo embutido não encontrado");
}

export function getBuiltinContentDir(): string {
    return getDefaultSourceDir();
}

export interface InjectContentOptions {
    sourcePath?: string;
    force?: boolean;
}

export interface InjectContentResult {
    targetDir: string;
    sourceDir: string;
    installed: boolean;
    filesCopied?: number;
}

async function countFiles(dir: string): Promise<number> {
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        let count = 0;
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                count += await countFiles(fullPath);
            } else {
                count += 1;
            }
        }
        return count;
    } catch {
        return 0;
    }
}

export async function injectContentIntoProject(diretorio: string, options?: InjectContentOptions): Promise<InjectContentResult> {
    const sourceDir = options?.sourcePath ?? getDefaultSourceDir();
    const targetDir = join(diretorio, ".maestro", "content");

    if (!directoryExists(sourceDir)) {
        throw new Error(`Fonte de conteúdo não encontrada: ${sourceDir}`);
    }

    if (existsSync(targetDir)) {
        if (!options?.force) {
            return { targetDir, sourceDir, installed: false };
        }
    }

    await mkdir(targetDir, { recursive: true });
    await cp(sourceDir, targetDir, { recursive: true });
    const filesCopied = await countFiles(targetDir);

    return {
        targetDir,
        sourceDir,
        installed: true,
        filesCopied,
    };
}

export async function ensureContentInstalled(diretorio: string): Promise<InjectContentResult> {
    const targetDir = join(diretorio, ".maestro", "content");
    if (existsSync(targetDir)) {
        return {
            targetDir,
            sourceDir: getDefaultSourceDir(),
            installed: false,
            filesCopied: await countFiles(targetDir),
        };
    }

    return injectContentIntoProject(diretorio);
}

const IDE_CONFIGS = {
    windsurf: {
        path: '.windsurfrules',
        header: '',
        workflowsDir: '.windsurf/workflows',
        skillsDir: '.windsurf/skills'
    },
    cursor: {
        path: '.cursorrules',
        header: '',
        workflowsDir: '.cursor/commands',
        skillsDir: '.cursor/skills'
    },
    antigravity: {
        path: '.gemini/GEMINI.md',
        header: '---\ntrigger: always_on\nsystem: maestro\nversion: 1.0.0\n---\n\n',
        workflowsDir: '.agent/workflows',
        skillsDir: '.agent/skills'
    }
} as const;

export async function injectContentForIDE(diretorio: string, ide: 'windsurf' | 'cursor' | 'antigravity'): Promise<InjectContentResult> {
    const sourceDir = getDefaultSourceDir();
    const config = IDE_CONFIGS[ide];
    
    // 1. Injetar Rules
    const rulesSource = join(sourceDir, 'rules', 'RULES.md');
    let rulesContent = '';
    
    if (existsSync(rulesSource)) {
        rulesContent = await readFile(rulesSource, 'utf-8');
    } else {
        rulesContent = generateDefaultRules();
    }
    
    const rulesTarget = join(diretorio, config.path);
    const rulesDir = dirname(rulesTarget);
    
    if (!existsSync(rulesDir)) {
        await mkdir(rulesDir, { recursive: true });
    }
    
    await writeFile(rulesTarget, config.header + rulesContent);
    
    // 2. Injetar Skills (Adaptadas)
    const skillsSource = join(sourceDir, 'skills');
    const skillsTarget = join(diretorio, config.skillsDir);
    
    if (existsSync(skillsSource)) {
        const adapter = new SkillAdapter();
        await adapter.adaptSkills(skillsSource, skillsTarget, ide, true);
    }
    
    // 3. Injetar Workflows
    const workflowsSource = join(sourceDir, 'workflows');
    const workflowsTarget = join(diretorio, config.workflowsDir);
    
    if (existsSync(workflowsSource)) {
        await mkdir(workflowsTarget, { recursive: true });
        // Simples cópia para workflows (assumindo compatibilidade ou sem adapter específico por enquanto)
        // Nota: CLI copia workflows. Vamos copiar também.
        await cp(workflowsSource, workflowsTarget, { recursive: true, force: true });
    }

    return {
        targetDir: diretorio,
        sourceDir,
        installed: true,
        filesCopied: 0 // Simplificado
    };
}

function generateDefaultRules(): string {
    return `# Maestro File System - AI Rules

> Este arquivo define como a IA deve se comportar ao trabalhar com o sistema Maestro File System.

## Como Usar

1. **Ver status**: Use \`/00-maestro\` para ver progresso
2. **Iniciar projeto**: Use \`/01-iniciar-projeto\` para começar
3. **Avançar fases**: Use \`/02-avancar-fase\` para avançar
4. **Continuar**: Use \`/03-continuar-fase\` para retomar trabalho

## Estrutura Local

| Pasta | Conteúdo |
|-------|----------|
| \`.maestro/estado.json\` | Estado do projeto (fonte da verdade) |
| \`.maestro/content/\` | Especialistas, templates, guides (Interno) |
| \`.windsurf/workflows/\` | Workflows para Windsurf |
| \`.windsurf/skills/\` | Skills especializadas |
| \`.cursor/commands/\` | Commands para Cursor |
| \`.cursor/skills/\` | Skills especializadas |
| \`.agent/workflows/\` | Workflows Principais (00-08) |
| \`.agent/skills/\` | Skills especializadas |

## Comandos Disponíveis

### Gestão de Projeto
- \`/00-maestro\` - Router Inteligente (Status)
- \`/01-iniciar-projeto\` - Setup Inicial
- \`/02-avancar-fase\` - Transição de Fase (com automações)
- \`/03-continuar-fase\` - Retomada de Trabalho
- \`/08-deploy-projeto\` - Deploy e Encerramento

### Desenvolvimento
- \`/04-implementar-historia\` - Frontend-First Dev
- \`/05-nova-feature\` - Grandes Funcionalidades
- \`/06-corrigir-bug\` - Fix com análise de causa
- \`/07-refatorar-codigo\` - Melhoria técnica segura

## Especialistas IA

- Gestão de Produto
- Engenharia de Requisitos
- UX Design
- Arquitetura de Software
- E mais 20 especialistas disponíveis

## Orquestração Local

Este sistema opera 100% localmente, sem dependência de MCP remoto. A IA detecta automaticamente os arquivos e workflows disponíveis.

## Estado do Projeto

O estado é mantido em \`.maestro/estado.json\` e serve como fonte da verdade para o progresso do projeto.
`;
}


export async function verificarSkillCarregada(
    diretorio: string,
    skillName: string,
    ide: 'windsurf' | 'cursor' | 'antigravity'
): Promise<boolean> {
    const skillsDir = IDE_CONFIGS[ide].skillsDir;
    const skillPath = join(diretorio, skillsDir, skillName, 'SKILL.md');
    return existsSync(skillPath);
}

function directoryExists(path: string): boolean {
    try {
        const stats = statSync(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
}
