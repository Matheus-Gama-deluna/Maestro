import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

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
        // Atualizar content
        spinner.start('Atualizando especialistas e templates...');

        const contentDirs = ['specialists', 'templates', 'guides', 'prompts', 'skills'];

        for (const dir of contentDirs) {
            const src = join(contentSource, dir);
            const dest = join(cwd, 'content', dir);

            if (await fse.pathExists(src)) {
                await fse.copy(src, dest, { overwrite: options.force });
            }
        }
        spinner.succeed('Content atualizado');

        // Atualizar workflows
        spinner.start('Atualizando workflows...');
        const workflowsSrc = join(contentSource, 'workflows');
        const workflowsDest = join(cwd, '.agent', 'workflows');

        if (await fse.pathExists(workflowsSrc)) {
            await fse.copy(workflowsSrc, workflowsDest, { overwrite: options.force });
        }
        spinner.succeed('Workflows atualizados');

        // Atualizar versão no config
        const configPath = join(cwd, '.maestro', 'config.json');
        const config = await fse.readJSON(configPath);
        config.lastUpdate = new Date().toISOString();
        await fse.writeJSON(configPath, config, { spaces: 2 });

        console.log(chalk.green.bold('\n✅ Atualização concluída!\n'));

    } catch (error) {
        spinner.fail('Erro durante atualização');
        console.error(chalk.red(error));
        process.exit(1);
    }
}
