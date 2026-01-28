import fse from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SkillData {
    name: string;
    description: string;
    files: string[];
    metadata?: any;
}

/**
 * Adaptador de skills para diferentes IDEs
 * Mantém estrutura master e gera versões otimizadas
 */
export class SkillAdapter {
    private readonly IDE_CONFIGS = {
        windsurf: {
            skillsDir: '.windsurf/skills',
            adapter: this.adaptForWindsurf.bind(this)
        },
        cursor: {
            skillsDir: '.cursor/skills',
            adapter: this.adaptForCursor.bind(this)
        },
        antigravity: {
            skillsDir: '.agent/skills',
            adapter: this.adaptForAntigravity.bind(this)
        }
    };

    /**
     * Copia e adapta skills para a IDE específica
     */
    async adaptSkills(skillsSource: string, targetDir: string, ide: 'windsurf' | 'cursor' | 'antigravity', force = false): Promise<void> {
        const config = this.IDE_CONFIGS[ide];
        
        if (!await fse.pathExists(skillsSource)) {
            console.log(`⚠️  Skills source not found: ${skillsSource}`);
            return;
        }

        // Garantir diretório de destino
        await fse.ensureDir(targetDir);

        // Listar todas as skills
        const skillDirs = await this.getSkillDirectories(skillsSource);
        
        console.log(`🔄 Adapting ${skillDirs.length} skills for ${ide}...`);

        for (const skillDir of skillDirs) {
            const skillName = skillDir.split('/').pop()!;
            const skillPath = join(skillsSource, skillDir);
            const destPath = join(targetDir, skillName);

            await config.adapter(skillPath, destPath, skillName, force);
        }

        console.log(`✅ Skills adapted for ${ide}`);
    }

    /**
     * Lista todos os diretórios de skills
     */
    private async getSkillDirectories(skillsSource: string): Promise<string[]> {
        const items = await fse.readdir(skillsSource);
        const dirs: string[] = [];

        for (const item of items) {
            const itemPath = join(skillsSource, item);
            const stat = await fse.stat(itemPath);
            
            if (stat.isDirectory() && await fse.pathExists(join(itemPath, 'SKILL.md'))) {
                dirs.push(item);
            }
        }

        return dirs;
    }

    /**
     * Adaptador para Windsurf - cópia direta (100% compatível)
     */
    private async adaptForWindsurf(skillPath: string, destPath: string, skillName: string, force: boolean): Promise<void> {
        // Windsurf usa formato nativo - apenas copiar
        await fse.copy(skillPath, destPath, { overwrite: force });
    }

    /**
     * Adaptador para Cursor - simplificação com headers explícitos
     */
    private async adaptForCursor(skillPath: string, destPath: string, skillName: string, force: boolean): Promise<void> {
        await fse.ensureDir(destPath);

        // Ler SKILL.md original
        const skillMdPath = join(skillPath, 'SKILL.md');
        if (!await fse.pathExists(skillMdPath)) return;

        const content = await fse.readFile(skillMdPath, 'utf-8');
        const parsed = this.parseSkillMetadata(content);

        // Gerar versão Cursor-friendly
        const cursorContent = this.generateCursorContent(parsed, skillPath);
        
        await fse.writeFile(join(destPath, 'SKILL.md'), cursorContent);

        // Copiar outros arquivos .md
        const items = await fse.readdir(skillPath);
        for (const item of items) {
            if (item.endsWith('.md') && item !== 'SKILL.md') {
                const srcFile = join(skillPath, item);
                const destFile = join(destPath, item);
                await fse.copy(srcFile, destFile, { overwrite: force });
            }
        }
    }

    /**
     * Adaptador para Antigravity - formato .agent
     */
    private async adaptForAntigravity(skillPath: string, destPath: string, skillName: string, force: boolean): Promise<void> {
        await fse.ensureDir(destPath);

        // Ler SKILL.md original
        const skillMdPath = join(skillPath, 'SKILL.md');
        if (!await fse.pathExists(skillMdPath)) return;

        const content = await fse.readFile(skillMdPath, 'utf-8');
        const parsed = this.parseSkillMetadata(content);

        // Gerar versão Antigravity-friendly
        const antigravityContent = this.generateAntigravityContent(parsed, skillPath);
        
        // Antigravity espera skill.md (minúsculo)
        await fse.writeFile(join(destPath, 'skill.md'), antigravityContent);

        // Copiar conteúdo para subdiretório content/
        const contentDir = join(destPath, 'content');
        await fse.ensureDir(contentDir);

        const items = await fse.readdir(skillPath);
        for (const item of items) {
            if (item.endsWith('.md') && item !== 'SKILL.md') {
                const srcFile = join(skillPath, item);
                const destFile = join(contentDir, item);
                await fse.copy(srcFile, destFile, { overwrite: force });
            }
        }
    }

    /**
     * Parse metadata do SKILL.md
     */
    private parseSkillMetadata(content: string): SkillData {
        const yamlMatch = content.match(/^---\n(.*?)\n---/s);
        const metadata = yamlMatch ? yamlMatch[1] : '';
        
        const nameMatch = metadata.match(/name:\s*(.+)/);
        const descMatch = metadata.match(/description:\s*(.+)/);

        // Extrair content map
        const contentMapMatch = content.match(/\| File.*?\n\|.*?\n([\s\S]*?)\n---/);
        const files = contentMapMatch ? this.extractFilesFromTable(contentMapMatch[1]) : [];

        return {
            name: nameMatch ? nameMatch[1].trim() : 'unknown',
            description: descMatch ? descMatch[1].trim() : '',
            files,
            metadata: metadata
        };
    }

    /**
     * Extrai lista de arquivos da tabela de content map
     */
    private extractFilesFromTable(tableContent: string): string[] {
        const files: string[] = [];
        const lines = tableContent.split('\n');
        
        for (const line of lines) {
            const match = line.match(/\|\s*`([^`]+)`\s*\|/);
            if (match) {
                files.push(match[1]);
            }
        }
        
        return files;
    }

    /**
     * Gera conteúdo otimizado para Cursor
     */
    private generateCursorContent(skill: SkillData, skillPath: string): string {
        return `# ${skill.name}

## Description
${skill.description}

## Quick Access
${skill.files.map((file: string) => {
    const fileName = file.replace(/\.md$/, '');
    const description = this.getFileDescription(file);
    return `- **${fileName}**: ${description}`;
}).join('\n')}

## When to Use
Use this skill when working with:
- ${skill.name} related tasks
- ${skill.description.toLowerCase()}

## Files Available
${skill.files.map((file: string) => `- ${file}`).join('\n')}

---
*This skill is part of the Maestro File System - adapted for Cursor*
`;
    }

    /**
     * Gera conteúdo otimizado para Antigravity
     */
    private generateAntigravityContent(skill: SkillData, skillPath: string): string {
        return `---
name: ${skill.name}
trigger: on_demand
category: ${this.getCategoryFromName(skill.name)}
version: 1.0.0
---

# ${skill.name}

## Overview
${skill.description}

## Quick Start
This skill provides expertise in ${skill.name}. Use it when you need help with:

${skill.files.map((file: string) => {
    const fileName = file.replace(/\.md$/, '');
    const description = this.getFileDescription(file);
    return `- **${fileName}**: ${description}`;
}).join('\n')}

## Available Resources
All detailed guides are available in the \`content/\` directory:
${skill.files.map((file: string) => `- \`content/${file}\``).join('\n')}

## Usage
Simply reference this skill when working on ${skill.name} tasks, and the AI will automatically load the relevant expertise.

---
*Generated by Maestro CLI for Antigravity/Gemini*
`;
    }

    /**
     * Obtém descrição do arquivo baseada no nome
     */
    private getFileDescription(fileName: string): string {
        const descriptions: Record<string, string> = {
            'rest.md': 'REST API design principles',
            'graphql.md': 'GraphQL schema design',
            'auth.md': 'Authentication patterns',
            'ux-psychology.md': 'User psychology principles',
            'color-system.md': 'Color theory and selection',
            'typography-system.md': 'Font pairing and scale',
            'api-style.md': 'API style decision tree',
            'response.md': 'Response format patterns',
            'versioning.md': 'API versioning strategies'
        };

        return descriptions[fileName] || 'Detailed guide and reference';
    }

    /**
     * Determina categoria baseada no nome da skill
     */
    private getCategoryFromName(skillName: string): string {
        const categories: Record<string, string> = {
            'api-patterns': 'backend',
            'frontend-design': 'frontend',
            'architecture': 'architecture',
            'database-design': 'database',
            'mobile-design': 'mobile',
            'security': 'security',
            'performance': 'performance',
            'testing': 'testing'
        };

        return categories[skillName] || 'general';
    }
}
