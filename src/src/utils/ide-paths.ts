import { join } from "path";
import { existsSync, readdirSync, statSync } from "fs";

/**
 * Configurações de diretórios para cada IDE
 */
export const IDE_CONFIGS = {
    windsurf: {
        rulesPath: '.windsurfrules',
        workflowsDir: '.windsurf/workflows',
        skillsDir: '.windsurf/skills',
        header: ''
    },
    cursor: {
        rulesPath: '.cursorrules',
        workflowsDir: '.cursor/commands',
        skillsDir: '.cursor/skills',
        header: ''
    },
    antigravity: {
        rulesPath: '.gemini/GEMINI.md',
        workflowsDir: '.agent/workflows',
        skillsDir: '.agent/skills',
        header: '---\ntrigger: always_on\nsystem: maestro\nversion: 3.0.0\n---\n\n'
    }
} as const;

export type IDEType = keyof typeof IDE_CONFIGS;

/**
 * Obtém o diretório de skills para a IDE especificada
 */
export function getSkillsDir(ide: IDEType): string {
    return IDE_CONFIGS[ide].skillsDir;
}

/**
 * Obtém o diretório de workflows para a IDE especificada
 */
export function getWorkflowsDir(ide: IDEType): string {
    return IDE_CONFIGS[ide].workflowsDir;
}

/**
 * Obtém o caminho completo para uma skill específica
 */
export function getSkillPath(skillName: string, projectDir: string, ide: IDEType): string {
    return join(projectDir, IDE_CONFIGS[ide].skillsDir, skillName);
}

/**
 * Obtém o caminho relativo para uma skill (para exibição)
 */
export function getSkillRelativePath(skillName: string, ide: IDEType): string {
    return `${IDE_CONFIGS[ide].skillsDir}/${skillName}`;
}

/**
 * Obtém o caminho para o arquivo SKILL.md
 */
export function getSkillFilePath(skillName: string, ide: IDEType): string {
    return `${IDE_CONFIGS[ide].skillsDir}/${skillName}/SKILL.md`;
}

/**
 * Obtém o caminho para resources de uma skill
 */
export function getSkillResourcePath(skillName: string, resourceType: 'templates' | 'examples' | 'checklists' | 'reference', ide: IDEType): string {
    return `${IDE_CONFIGS[ide].skillsDir}/${skillName}/resources/${resourceType}/`;
}

/**
 * Obtém o caminho para MCP_INTEGRATION.md de uma skill
 */
export function getSkillMCPPath(skillName: string, ide: IDEType): string {
    return `${IDE_CONFIGS[ide].skillsDir}/${skillName}/MCP_INTEGRATION.md`;
}

/**
 * Detecta a IDE baseada nos arquivos presentes no diretório
 */
export function detectIDE(projectDir: string): IDEType | null {
    // Verifica Windsurf
    if (existsSync(join(projectDir, '.windsurfrules')) ||
        existsSync(join(projectDir, '.windsurf'))) {
        return 'windsurf';
    }

    // Verifica Cursor
    if (existsSync(join(projectDir, '.cursorrules')) ||
        existsSync(join(projectDir, '.cursor'))) {
        return 'cursor';
    }

    // Verifica Antigravity
    if (existsSync(join(projectDir, '.gemini')) ||
        existsSync(join(projectDir, '.agent'))) {
        return 'antigravity';
    }

    return null;
}

/**
 * Formata mensagem de skill com caminhos corretos para a IDE
 */
export function formatSkillMessage(skillName: string, ide: IDEType): string {
    return `**Skill:** \`${skillName}\`  
**Localização:** \`${getSkillFilePath(skillName, ide)}\`

> 💡 **Como usar a skill:**
> 1. Ative com: \`@${skillName}\`
> 2. Leia SKILL.md para instruções detalhadas
> 3. Consulte templates em \`resources/templates/\`
> 4. Valide com checklist em \`resources/checklists/\`

**Resources disponíveis:**
- 📋 Templates: \`${getSkillResourcePath(skillName, 'templates', ide)}\`
- 📖 Examples: \`${getSkillResourcePath(skillName, 'examples', ide)}\`
- ✅ Checklists: \`${getSkillResourcePath(skillName, 'checklists', ide)}\`
- 📚 Reference: \`${getSkillResourcePath(skillName, 'reference', ide)}\`
- 🔧 MCP Functions: \`${getSkillMCPPath(skillName, ide)}\``;
}

function getAllMdFiles(dirPath: string, relativeBase: string): string[] {
    let results: string[] = [];
    if (!existsSync(dirPath)) return results;
    
    try {
        const items = readdirSync(dirPath);
        for (const item of items) {
            const fullPath = join(dirPath, item);
            const relPath = join(relativeBase, item).replace(/\\/g, '/');
            if (statSync(fullPath).isDirectory()) {
                results = results.concat(getAllMdFiles(fullPath, relPath));
            } else if (item.endsWith('.md')) {
                results.push(relPath);
            }
        }
    } catch (e) {
        // Ignorar erros silenciados
    }
    return results;
}

/**
 * V6 Sprint 3: Gera comando imperativo de hidratação de contexto (Active Rules Pointer).
 * Usa o formato de @menção nativo de cada IDE para forçar leitura imediata do SKILL.md
 * e todos os templates e checklists das subpastas na transição de fase,
 * sem criar arquivos extras e sem aguardar confirmação do usuário.
 *
 * Formatos nativos:
 * - Antigravity: @[.agent/skills/{skill}/SKILL.md]
 * - Cursor:      @.cursor/skills/{skill}/SKILL.md
 * - Windsurf:    #.windsurf/skills/{skill}/SKILL.md
 */
export function formatSkillHydrationCommand(skillName: string, ide: IDEType): string {
    const skillPath = getSkillFilePath(skillName, ide);
    
    const formatMention = (path: string) => {
        return ide === 'cursor' ? `@${path}`
             : ide === 'windsurf' ? `#${path}`
             : `@[${path}]`; // antigravity (default)
    };

    const mentions = [formatMention(skillPath)];

    try {
        const resourcesRelDir = `${IDE_CONFIGS[ide].skillsDir}/${skillName}/resources`;
        const resourcesAbsDir = join(process.cwd(), resourcesRelDir);
        
        const mdFiles = getAllMdFiles(resourcesAbsDir, resourcesRelDir);
        for (const file of mdFiles) {
            mentions.push(formatMention(file));
        }
    } catch (e) {
        // Fallback seguro caso path reading falhe
    }

    const mentionsList = mentions.map((m, i) => `> ${i + 1}. ${m}`).join('\n');

    return [
        ``,
        `---`,
        ``,
        `> ⚙️ **SISTEMA — AÇÃO OBRIGATÓRIA (Nova Fase Iniciada)**`,
        `> Leia AGORA os arquivos da sua função:`,
        mentionsList,
        `> Assuma a persona descrita no arquivo principal **imediatamente**.`,
        `> Confirme a mudança de fase dizendo: "Sou [nome do especialista], meu foco é [entregável desta fase]." e sugira os primeiros passos para o usuário.`,
        `> ✋ **NÃO** gere o entregável completo sem interagir com o usuário primeiro.`,
        ``,
    ].join('\n');
}

