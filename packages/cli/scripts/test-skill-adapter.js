import fse from 'fs-extra';
import { join } from 'path';
import { SkillAdapter } from '../dist/adapters/skill-adapter.js';

/**
 * Script de teste para validar adaptação de skills
 */
async function testSkillAdapter() {
    const adapter = new SkillAdapter();
    const testDir = join(process.cwd(), 'test-output');
    
    console.log('🧪 Testando Skill Adapter...\n');

    // Caminho de origem das skills (ajuste conforme necessário)
    const skillsSource = join(process.cwd(), 'content', 'skills');
    
    if (!await fse.pathExists(skillsSource)) {
        console.error(`❌ Skills source not found: ${skillsSource}`);
        console.log('💡 Execute este script a partir de packages/cli/');
        process.exit(1);
    }

    // Testar adaptação para cada IDE
    const ides = ['windsurf', 'cursor', 'antigravity'];
    
    for (const ide of ides) {
        console.log(`\n🔄 Testando adaptação para ${ide.toUpperCase()}...`);
        
        const targetDir = join(testDir, ide, 'skills');
        
        try {
            await adapter.adaptSkills(skillsSource, targetDir, ide, true);
            
            // Verificar resultado
            const skillDirs = await fse.readdir(targetDir);
            console.log(`✅ ${ide}: ${skillDirs.length} skills adaptadas`);
            
            // Verificar estrutura de uma skill
            if (skillDirs.length > 0) {
                const firstSkill = join(targetDir, skillDirs[0]);
                const files = await fse.readdir(firstSkill);
                
                if (ide === 'antigravity') {
                    const hasSkillMd = files.includes('skill.md');
                    const hasContentDir = files.includes('content');
                    console.log(`   📁 Estrutura Antigravity: skill.md=${hasSkillMd}, content/=${hasContentDir}`);
                } else {
                    const hasSkillMd = files.includes('SKILL.md');
                    console.log(`   📁 Estrutura ${ide}: SKILL.md=${hasSkillMd}`);
                }
            }
            
        } catch (error) {
            console.error(`❌ Erro em ${ide}:`, error.message);
        }
    }

    console.log('\n📊 Resumo dos testes:');
    console.log('📁 Arquivos gerados em:', testDir);
    console.log('💡 Revise manualmente para validar qualidade da adaptação');
}

// Executar teste
testSkillAdapter().catch(console.error);
