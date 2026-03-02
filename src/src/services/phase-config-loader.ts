/**
 * Phase Config Loader (v10.0)
 * 
 * Carrega PhaseConfig a partir da SKILL.md do especialista.
 * Parseia seções "Coleta Conversacional" e extrai campos de coleta,
 * permitindo que o specialist-phase-handler funcione para qualquer fase.
 * 
 * Fallback: Se a skill não existir ou o parsing falhar, retorna config
 * mínima com collectFields vazio (comportamento v9 — pula coleta).
 * 
 * @since v10.0
 */

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import type { PhaseConfig, PhaseConfigResult, CollectField } from "../types/phase-config.js";
import type { Fase } from "../types/index.js";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { detectIDE, getSkillsDir } from "../utils/ide-paths.js";
import { getFaseDirName } from "../utils/entregavel-path.js";

/**
 * Carrega PhaseConfig para uma fase específica.
 * 
 * 1. Resolve o nome da skill via FASE_SKILL_MAP
 * 2. Lê o SKILL.md da skill
 * 3. Parseia seções relevantes (Coleta Conversacional, Persona, etc.)
 * 4. Monta PhaseConfig com dados da skill + dados do flows/types.ts
 * 
 * @param diretorio Diretório do projeto
 * @param faseInfo Informação da fase (de flows/types.ts)
 * @param ide IDE detectada (windsurf, cursor, antigravity)
 */
export async function loadPhaseConfig(
    diretorio: string,
    faseInfo: Fase,
    ide?: string,
): Promise<PhaseConfigResult> {
    const skillName = faseInfo.skill || getSkillParaFase(faseInfo.nome);
    
    if (!skillName) {
        return createFallbackConfig(faseInfo, diretorio);
    }

    // Tentar ler SKILL.md de múltiplos locais
    const ideType = (ide || detectIDE(diretorio) || 'windsurf') as 'windsurf' | 'cursor' | 'antigravity';
    const skillsDir = getSkillsDir(ideType);
    
    const possiblePaths = [
        join(diretorio, skillsDir, skillName, 'SKILL.md'),
        join(diretorio, '.windsurf', 'skills', skillName, 'SKILL.md'),
        join(diretorio, '.agent', 'skills', skillName, 'SKILL.md'),
    ];

    let skillContent: string | null = null;
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            try {
                skillContent = await readFile(path, 'utf-8');
                break;
            } catch { /* continue */ }
        }
    }

    if (!skillContent) {
        console.log(`[phase-config-loader] Skill ${skillName} não encontrada no disco — usando fallback`);
        return createFallbackConfig(faseInfo, diretorio);
    }

    // Parsear SKILL.md
    try {
        const config = parseSkillMd(skillContent, faseInfo, skillName, diretorio);
        return { loaded: true, config, source: 'skill' };
    } catch (err) {
        console.warn(`[phase-config-loader] Erro ao parsear ${skillName}/SKILL.md:`, err);
        return createFallbackConfig(faseInfo, diretorio);
    }
}

/**
 * Parseia o conteúdo do SKILL.md e extrai PhaseConfig.
 */
function parseSkillMd(
    content: string,
    faseInfo: Fase,
    skillName: string,
    diretorio: string,
): PhaseConfig {
    const collectFields = parseCollectFields(content);
    const persona = parsePersona(content);
    const specialistName = parseSpecialistName(content) || faseInfo.especialista;
    
    const faseDirName = getFaseDirName(faseInfo.numero, faseInfo.nome);
    const outputPath = join('docs', faseDirName, faseInfo.entregavel_esperado);

    return {
        faseName: faseInfo.nome,
        faseNumber: faseInfo.numero,
        specialistName,
        collectFields,
        outputPath,
        outputFilename: faseInfo.entregavel_esperado,
        skillName,
        gateChecklist: faseInfo.gate_checklist || [],
        persona,
    };
}

/**
 * Extrai campos de coleta da seção "## Coleta Conversacional" do SKILL.md.
 * Formato esperado:
 * 
 * ### Bloco 1 — O Problema (obrigatório)
 * 1. **Qual problema** este produto resolve?
 * 2. **Qual impacto** desse problema?
 */
function parseCollectFields(content: string): CollectField[] {
    const fields: CollectField[] = [];
    
    // Encontrar seção "Coleta Conversacional"
    const sectionMatch = content.match(/## Coleta Conversacional\s*\n([\s\S]*?)(?=\n## |\n---|\Z)/i);
    if (!sectionMatch) return fields;
    
    const section = sectionMatch[1];
    let currentBlock = 'geral';
    let currentRequired = true;
    
    const lines = section.split('\n');
    
    for (const line of lines) {
        // Detectar bloco: ### Bloco 1 — O Problema (obrigatório)
        const blockMatch = line.match(/^###\s+(?:Bloco\s+\d+\s*[—–-]\s*)?(.+?)(?:\s*\((?:obrigatório|importante|opcional)\))?\s*$/i);
        if (blockMatch) {
            currentBlock = blockMatch[1].trim().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
            currentRequired = !line.toLowerCase().includes('opcional');
            continue;
        }
        
        // Detectar pergunta numerada: 1. **Qual problema** este produto resolve?
        const questionMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(.*)/);
        if (questionMatch) {
            const label = questionMatch[1].trim();
            const rest = questionMatch[2].trim().replace(/\?$/, '');
            const fullQuestion = `${label} ${rest}`.trim();
            
            // Gerar ID a partir do label
            const id = label.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '')
                .substring(0, 30);
            
            fields.push({
                id: id || `field_${fields.length}`,
                label: fullQuestion || label,
                block: currentBlock,
                hint: rest || label,
                required: currentRequired,
            });
        }
    }
    
    return fields;
}

/**
 * Extrai nome do especialista do SKILL.md.
 * Procura por "**Nome:**" na seção Persona.
 */
function parseSpecialistName(content: string): string | null {
    const match = content.match(/\*\*Nome:\*\*\s*(.+)/i);
    return match ? match[1].trim() : null;
}

/**
 * Extrai persona do SKILL.md.
 */
function parsePersona(content: string): PhaseConfig['persona'] | undefined {
    const nameMatch = content.match(/\*\*Nome:\*\*\s*(.+)/i);
    const toneMatch = content.match(/\*\*Tom:\*\*\s*(.+)/i);
    
    if (!nameMatch) return undefined;
    
    // Extrair expertise (items de lista após "**Expertise:**")
    const expertiseSection = content.match(/\*\*Expertise:\*\*\s*\n((?:\s*-\s*.+\n?)+)/i);
    const expertise = expertiseSection
        ? expertiseSection[1].split('\n')
            .map(l => l.replace(/^\s*-\s*/, '').trim())
            .filter(Boolean)
        : [];
    
    // Extrair instruções dos comportamentos
    const behaviorSection = content.match(/\*\*Comportamento:\*\*\s*\n((?:\s*-\s*.+\n?)+)/i);
    const behaviors = behaviorSection
        ? behaviorSection[1].split('\n')
            .map(l => l.replace(/^\s*-\s*/, '').trim())
            .filter(Boolean)
            .join('. ')
        : '';
    
    return {
        name: nameMatch[1].trim(),
        tone: toneMatch ? toneMatch[1].trim() : 'Profissional e direto',
        expertise,
        instructions: behaviors || `Siga as instruções da skill ${nameMatch[1].trim()}.`,
    };
}

/**
 * Cria PhaseConfig fallback quando a skill não é encontrada.
 * collectFields vazio = pula coleta, vai direto para geração/validação.
 */
function createFallbackConfig(
    faseInfo: Fase,
    diretorio: string,
): PhaseConfigResult {
    const faseDirName = getFaseDirName(faseInfo.numero, faseInfo.nome);
    
    return {
        loaded: false,
        source: 'fallback',
        config: {
            faseName: faseInfo.nome,
            faseNumber: faseInfo.numero,
            specialistName: faseInfo.especialista,
            collectFields: [],
            outputPath: join('docs', faseDirName, faseInfo.entregavel_esperado),
            outputFilename: faseInfo.entregavel_esperado,
            skillName: faseInfo.skill || getSkillParaFase(faseInfo.nome) || 'unknown',
            gateChecklist: faseInfo.gate_checklist || [],
        },
    };
}
