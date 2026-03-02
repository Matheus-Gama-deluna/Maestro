/**
 * Skill Deployer (v10.0)
 * 
 * Copia skills de content/skills/ para o diretório da IDE no projeto.
 * Suporta múltiplas IDEs: Windsurf, Cursor, Antigravity.
 * 
 * Windsurf: .windsurf/skills/<skill-name>/
 * Cursor: .cursor/rules/<skill-name>.mdc (conversão SKILL.md → .mdc)
 * Antigravity: .agent/skills/<skill-name>/
 * 
 * @since v10.0
 */

import { existsSync, readdirSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, relative } from "path";
import type { NivelComplexidade } from "../types/index.js";
import { getFluxoComStitch } from "../flows/types.js";
import { getSkillsDir, type IDEType } from "../utils/ide-paths.js";

/**
 * Copia skills relevantes de contentDir para o diretório da IDE no projeto.
 * Filtra por nível de complexidade — só copia skills usadas no fluxo.
 * 
 * @param contentSkillsDir Caminho absoluto para content/skills/
 * @param projectDir Diretório raiz do projeto
 * @param ide IDE ativa (windsurf, cursor, antigravity)
 * @param nivel Nível de complexidade (simples, medio, complexo)
 * @param usarStitch Se deve incluir skill de prototipagem
 * @returns Lista de skills deployadas
 */
export async function deploySkillsToProject(
    contentSkillsDir: string,
    projectDir: string,
    ide: IDEType,
    nivel: NivelComplexidade,
    usarStitch: boolean = false,
): Promise<string[]> {
    const deployedSkills: string[] = [];
    
    // Obter lista de skills necessárias para o fluxo
    const fluxo = getFluxoComStitch(nivel, usarStitch);
    const requiredSkills = new Set<string>();
    
    for (const fase of fluxo.fases) {
        if (fase.skill) {
            requiredSkills.add(fase.skill);
        }
    }
    
    // Adicionar skills utilitárias (sempre deployadas)
    requiredSkills.add('specialist-debugging-troubleshooting');
    requiredSkills.add('specialist-exploracao-codebase');
    
    const targetDir = getSkillsDir(ide);
    const targetBase = join(projectDir, targetDir);
    
    for (const skillName of requiredSkills) {
        const sourceDir = join(contentSkillsDir, skillName);
        
        if (!existsSync(sourceDir)) {
            console.warn(`[skill-deployer] Skill ${skillName} não encontrada em ${contentSkillsDir}`);
            continue;
        }
        
        try {
            if (ide === 'cursor') {
                // Cursor: converter SKILL.md → .mdc
                await deployCursorRule(sourceDir, projectDir, skillName);
            } else {
                // Windsurf/Antigravity: copiar diretório completo
                const targetSkillDir = join(targetBase, skillName);
                copyDirectoryRecursive(sourceDir, targetSkillDir);
            }
            
            deployedSkills.push(skillName);
        } catch (err) {
            console.warn(`[skill-deployer] Falha ao deployar ${skillName}:`, err);
        }
    }
    
    console.error(`[skill-deployer] ${deployedSkills.length}/${requiredSkills.size} skills deployadas para ${ide} em ${projectDir}`);
    return deployedSkills;
}

/**
 * Converte SKILL.md em .mdc para Cursor.
 * Cursor usa .cursor/rules/ com frontmatter description + alwaysApply.
 */
async function deployCursorRule(
    sourceDir: string, 
    projectDir: string, 
    skillName: string
): Promise<void> {
    const skillMdPath = join(sourceDir, 'SKILL.md');
    if (!existsSync(skillMdPath)) return;
    
    const content = readFileSync(skillMdPath, 'utf-8');
    
    // Extrair description do frontmatter YAML
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    let description = skillName;
    let body = content;
    
    if (frontmatterMatch) {
        const yaml = frontmatterMatch[1];
        const descMatch = yaml.match(/description:\s*(.+)/);
        if (descMatch) {
            description = descMatch[1].trim().replace(/^["']|["']$/g, '');
        }
        body = content.substring(frontmatterMatch[0].length).trim();
    }
    
    // Gerar .mdc com frontmatter do Cursor
    const mdcContent = `---
description: "${description}"
alwaysApply: false
---

${body}
`;
    
    const targetDir = join(projectDir, '.cursor', 'rules');
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, `${skillName}.mdc`), mdcContent, 'utf-8');
    
    // Copiar resources como arquivos separados referenciáveis
    const resourcesDir = join(sourceDir, 'resources');
    if (existsSync(resourcesDir)) {
        const targetResourcesDir = join(projectDir, '.cursor', 'rules', `${skillName}-resources`);
        copyDirectoryRecursive(resourcesDir, targetResourcesDir);
    }
}

/**
 * Copia diretório recursivamente.
 */
function copyDirectoryRecursive(source: string, target: string): void {
    mkdirSync(target, { recursive: true });
    
    const entries = readdirSync(source, { withFileTypes: true });
    
    for (const entry of entries) {
        const sourcePath = join(source, entry.name);
        const targetPath = join(target, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            copyFileSync(sourcePath, targetPath);
        }
    }
}

/**
 * Verifica se as skills estão deployadas no projeto.
 * Retorna lista de skills faltantes.
 */
export function checkSkillsDeployed(
    projectDir: string,
    ide: IDEType,
    nivel: NivelComplexidade,
    usarStitch: boolean = false,
): string[] {
    const fluxo = getFluxoComStitch(nivel, usarStitch);
    const missingSkills: string[] = [];
    
    const targetDir = getSkillsDir(ide);
    
    for (const fase of fluxo.fases) {
        if (!fase.skill) continue;
        
        if (ide === 'cursor') {
            const rulePath = join(projectDir, '.cursor', 'rules', `${fase.skill}.mdc`);
            if (!existsSync(rulePath)) {
                missingSkills.push(fase.skill);
            }
        } else {
            const skillPath = join(projectDir, targetDir, fase.skill, 'SKILL.md');
            if (!existsSync(skillPath)) {
                missingSkills.push(fase.skill);
            }
        }
    }
    
    return missingSkills;
}
