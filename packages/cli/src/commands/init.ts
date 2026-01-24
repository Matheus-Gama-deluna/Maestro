import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface InitOptions {
    force?: boolean;
    minimal?: boolean;
}

export async function init(options: InitOptions = {}) {
    const cwd = process.cwd();
    const spinner = ora();

    console.log(chalk.blue.bold('\n🎯 Maestro - Inicializando projeto\n'));

    // Verifica se já existe
    if (existsSync(join(cwd, '.maestro')) && !options.force) {
        console.log(chalk.yellow('⚠️  Projeto já inicializado. Use --force para sobrescrever.'));
        return;
    }

    // Paths do content embarcado no pacote
    const packageRoot = join(__dirname, '..', '..');
    const contentSource = join(packageRoot, 'content');

    try {
        // 1. Criar estrutura .maestro
        spinner.start('Criando estrutura .maestro/');
        await fse.ensureDir(join(cwd, '.maestro'));
        await fse.ensureDir(join(cwd, '.maestro', 'history'));
        await fse.writeJSON(join(cwd, '.maestro', 'config.json'), {
            version: '1.0.0',
            initialized: new Date().toISOString(),
            mcpServer: 'https://maestro.deluna.dev.br/mcp'
        }, { spaces: 2 });
        spinner.succeed('Estrutura .maestro/ criada');

        // 2. Copiar content para .maestro/content/ (se não minimal)
        if (!options.minimal) {
            spinner.start('Copiando especialistas e templates para .maestro/content/...');

            // Content vai para .maestro/content/
            const contentDirs = ['specialists', 'templates', 'guides', 'prompts'];

            for (const dir of contentDirs) {
                const src = join(contentSource, dir);
                const dest = join(cwd, '.maestro', 'content', dir);

                if (await fse.pathExists(src)) {
                    await fse.copy(src, dest, { overwrite: options.force });
                }
            }
            spinner.succeed('Content copiado para .maestro/content/');
        }

        // 3. Copiar skills para .agent/skills/
        spinner.start('Copiando skills para .agent/skills/...');
        const skillsSrc = join(contentSource, 'skills');
        const skillsDest = join(cwd, '.agent', 'skills');

        if (await fse.pathExists(skillsSrc)) {
            await fse.copy(skillsSrc, skillsDest, { overwrite: options.force });
        }
        spinner.succeed('Skills copiados para .agent/skills/');

        // 4. Copiar workflows para .agent/workflows/
        spinner.start('Copiando workflows para .agent/workflows/...');
        const workflowsSrc = join(contentSource, 'workflows');
        const workflowsDest = join(cwd, '.agent', 'workflows');

        if (await fse.pathExists(workflowsSrc)) {
            await fse.copy(workflowsSrc, workflowsDest, { overwrite: options.force });
        }
        spinner.succeed('Workflows copiados para .agent/workflows/');

        // 5. Gerar GEMINI.md
        spinner.start('Gerando GEMINI.md...');
        const geminiContent = generateGeminiMd();
        await fse.writeFile(join(cwd, 'GEMINI.md'), geminiContent);
        spinner.succeed('GEMINI.md gerado');

        // Resumo
        console.log(chalk.green.bold('\n✅ Maestro inicializado com sucesso!\n'));
        console.log(chalk.dim('Estrutura criada:'));
        console.log(chalk.dim('  .maestro/'));
        console.log(chalk.dim('    ├── config.json'));
        console.log(chalk.dim('    ├── history/'));
        if (!options.minimal) {
            console.log(chalk.dim('    └── content/'));
            console.log(chalk.dim('        ├── specialists/'));
            console.log(chalk.dim('        ├── templates/'));
            console.log(chalk.dim('        ├── guides/'));
            console.log(chalk.dim('        └── prompts/'));
        }
        console.log(chalk.dim('  .agent/'));
        console.log(chalk.dim('    ├── skills/'));
        console.log(chalk.dim('    └── workflows/'));
        console.log(chalk.dim('  GEMINI.md'));

        console.log(chalk.blue('\n📋 Próximos passos:'));
        console.log('  1. Configure o MCP na sua IDE:');
        console.log(chalk.gray('     "mcpServers": { "maestro": { "serverUrl": "https://maestro.deluna.dev.br/mcp" } }'));
        console.log('  2. Inicie um novo projeto com: @mcp:maestro iniciar_projeto');
        console.log('');

    } catch (error) {
        spinner.fail('Erro durante inicialização');
        console.error(chalk.red(error));
        process.exit(1);
    }
}

function generateGeminiMd(): string {
    return `---
trigger: always_on
system: maestro
version: 1.0.0
---

# Maestro - Desenvolvimento Assistido por IA

> Este projeto utiliza o sistema Maestro para desenvolvimento estruturado.

## Configuração MCP

\`\`\`json
{
  "mcpServers": {
    "maestro": {
      "serverUrl": "https://maestro.deluna.dev.br/mcp"
    }
  }
}
\`\`\`

## Como Usar

1. **Iniciar projeto**: Use \`iniciar_projeto\` para começar
2. **Avançar fases**: Use \`proximo\` para salvar e avançar
3. **Ver status**: Use \`status\` para ver onde está

## Estrutura Local

| Pasta | Conteúdo |
|-------|----------|
| \`.maestro/estado.json\` | Estado do projeto (fonte da verdade) |
| \`.maestro/SYSTEM.md\` | Contexto atual para IA |
| \`.maestro/content/\` | Especialistas, templates, prompts |
| \`.agent/skills/\` | Skills disponíveis |
| \`.agent/workflows/\` | Workflows automatizados |

## Estado do Projeto

O estado é mantido em \`.maestro/estado.json\` e deve ser passado como \`estado_json\` em todos os tools MCP.
`;
}
