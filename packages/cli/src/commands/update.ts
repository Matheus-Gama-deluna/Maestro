import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { SkillAdapter } from '../adapters/skill-adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface UpdateOptions {
    force?: boolean;
}

export async function update(options: UpdateOptions = {}) {
    const cwd = process.cwd();
    const spinner = ora();

    console.log(chalk.blue.bold('\n🔄 Maestro - Atualizando content\n'));

    // Verifica se projeto está inicializado
    if (!await fse.pathExists(join(cwd, '.maestro'))) {
        console.log(chalk.red('❌ Projeto não inicializado. Execute: npx @maestro init'));
        return;
    }

    const packageRoot = join(__dirname, '..', '..');
    const contentSource = join(packageRoot, 'content');

    try {
        // Detectar IDE do projeto
        const maestroConfigPath = join(cwd, '.maestro', 'config.json');
        let currentIDE: 'windsurf' | 'cursor' | 'antigravity' = 'windsurf'; // default
        
        if (await fse.pathExists(maestroConfigPath)) {
            const config = await fse.readJSON(maestroConfigPath);
            currentIDE = config.ide || 'windsurf';
        }

        // Atualizar content principal
        spinner.start('Atualizando especialistas e templates...');

        const contentDirs = ['specialists', 'templates', 'guides', 'prompts'];

        for (const dir of contentDirs) {
            const src = join(contentSource, dir);
            const dest = join(cwd, '.maestro', 'content', dir);

            if (await fse.pathExists(src)) {
                await fse.copy(src, dest, { overwrite: options.force });
            }
        }
        spinner.succeed('Content principal atualizado');

        // Atualizar workflows
        spinner.start('Atualizando workflows...');
        const workflowsSrc = join(contentSource, 'workflows');
        const workflowsDest = join(cwd, '.agent', 'workflows');

        if (await fse.pathExists(workflowsSrc)) {
            await fse.copy(workflowsSrc, workflowsDest, { overwrite: options.force });
        }
        spinner.succeed('Workflows atualizados');

        // Atualizar skills com adaptação para IDE atual
        spinner.start(`Atualizando skills para ${currentIDE}...`);
        const skillsSrc = join(contentSource, 'skills');
        const skillsDest = join(cwd, currentIDE === 'windsurf' ? '.windsurf/skills' : 
                              currentIDE === 'cursor' ? '.cursor/skills' : '.agent/skills');
        
        if (await fse.pathExists(skillsSrc)) {
            const skillAdapter = new SkillAdapter();
            await skillAdapter.adaptSkills(skillsSrc, skillsDest, currentIDE, options.force);
        }
        spinner.succeed(`Skills atualizadas para ${currentIDE}`);

        // Atualizar versão no config
        const config = await fse.readJSON(maestroConfigPath);
        config.lastUpdate = new Date().toISOString();
        await fse.writeJSON(maestroConfigPath, config, { spaces: 2 });

        console.log(chalk.green.bold('\n✅ Atualização concluída!\n'));

    } catch (error) {
        spinner.fail('Erro durante atualização');
        console.error(chalk.red(error));
        process.exit(1);
    }
}
