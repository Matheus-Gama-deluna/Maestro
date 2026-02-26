import { SkillLoaderService } from '../services/skill-loader.service.js';
import { ContentResolverService } from '../services/content-resolver.service.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { getSkillParaFase } from './prompt-mapper.js';
import { getSkillFilePath, detectIDE } from './ide-paths.js';
import { getFaseDirName } from './entregavel-path.js';

/**
 * V6 Sprint 4: TDD Invertido — Gera documento de orientação de Gate ANTES do entregável.
 *
 * No início de cada fase, o Maestro cria um arquivo `.orientacoes-gate.md` com os critérios
 * EXATOS que a ValidationPipeline irá checar. A IA lê esse arquivo antes de escrever o
 * entregável, aumentando o score na primeira tentativa.
 *
 * Reutiliza: SkillLoaderService.loadChecklist() (já implementado)
 */
export async function generateGateOrientationDoc(
    diretorio: string,
    faseNome: string,
    faseNumero: number
): Promise<string | null> {
    try {
        const resolver = new ContentResolverService(diretorio);
        const loader = new SkillLoaderService(resolver);

        // Reutilizar loadChecklist() existente — não reinventar a roda
        const checklist = await loader.loadChecklist(faseNome);
        if (!checklist) {
            console.warn(`[gate-orientation] Checklist não encontrado para fase: ${faseNome}`);
            return null;
        }

        const skillName = getSkillParaFase(faseNome) || 'skill-desconhecida';
        // V6 Gap fix #3: path IDE-aware via detectIDE + getSkillFilePath
        const ide = detectIDE(diretorio) ?? 'windsurf';
        const skillPath = getSkillFilePath(skillName, ide);

        const conteudo = [
            `# 🎯 Critérios do Gate — Fase ${faseNumero}: ${faseNome}`,
            ``,
            `> ⚠️ **LEIA ESTE ARQUIVO ANTES DE ESCREVER O ENTREGÁVEL.**`,
            `> Gerado automaticamente pelo Maestro V6. Estes são os critérios EXATOS da validação.`,
            ``,
            `## Skill Ativa desta Fase`,
            `\`${skillName}\``,
            ``,
            `## ✅ Checklist de Aprovação (Score mínimo: 70/100)`,
            ``,
            `> Seu entregável DEVE satisfazer os critérios abaixo para passar no Gate automaticamente.`,
            ``,
            checklist,
            ``,
            `## 📋 Estrutura Esperada`,
            ``,
            `Consulte o template em: \`${skillPath}resources/templates/\``,
            ``,
            `---`,
            `_Score mínimo para aprovação automática: **70/100**_`,
            `_Arquivo gerado em: ${new Date().toISOString()}_`,
        ].join('\n');

        const outputPath = join(
            diretorio,
            'docs',
            getFaseDirName(faseNumero, faseNome),
            '.orientacoes-gate.md'
        );

        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, conteudo, 'utf-8');

        console.log(`[gate-orientation] Guia de Gate criado: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.warn(`[gate-orientation] Falha ao gerar orientação de gate:`, error);
        return null;
    }
}
