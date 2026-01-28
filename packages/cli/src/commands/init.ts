import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { SkillAdapter } from '../adapters/skill-adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface InitOptions {
    force?: boolean;
    minimal?: boolean;
    ide?: 'windsurf' | 'cursor' | 'antigravity'; // Agora opcional
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

export async function init(options: InitOptions) {
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
            version: '1.3.0',
            initialized: new Date().toISOString(),
            ide: options.ide || 'windsurf',
            mcpFree: true
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

        // 4. Configurar IDE específica
        const ideConfig = IDE_CONFIGS[options.ide!];
        spinner.start(`Configurando IDE: ${options.ide}...`);
        
        // Ler RULES.md base
        const rulesPath = join(contentSource, 'rules', 'RULES.md');
        let rulesContent = '';
        if (await fse.pathExists(rulesPath)) {
            rulesContent = await fse.readFile(rulesPath, 'utf-8');
        } else {
            rulesContent = generateDefaultRules();
        }

        // Criar diretórios específicos da IDE
        await fse.ensureDir(join(cwd, dirname(ideConfig.path)));
        await fse.ensureDir(join(cwd, ideConfig.workflowsDir));
        await fse.ensureDir(join(cwd, ideConfig.skillsDir));

        // Copiar workflows para diretório específico da IDE
        const workflowsSrc = join(contentSource, 'workflows');
        const workflowsDest = join(cwd, ideConfig.workflowsDir);
        if (await fse.pathExists(workflowsSrc)) {
            await fse.copy(workflowsSrc, workflowsDest, { overwrite: options.force });
        }

        // Copiar e adaptar skills para IDE específica usando o adaptador
        spinner.start(`Adaptando skills para ${options.ide}...`);
        const skillsSrc = join(contentSource, 'skills');
        const skillsDest = join(cwd, ideConfig.skillsDir);
        
        if (await fse.pathExists(skillsSrc)) {
            const skillAdapter = new SkillAdapter();
            await skillAdapter.adaptSkills(skillsSrc, skillsDest, options.ide!, options.force);
        }

        // Gerar arquivo de regras
        const targetPath = join(cwd, ideConfig.path);
        const content = ideConfig.header + rulesContent;
        await fse.writeFile(targetPath, content);
        
        spinner.succeed(`IDE ${options.ide!} configurada com sucesso!`);

        // Resumo
        console.log(chalk.green.bold(`\n✅ Maestro inicializado para ${options.ide!}\n`));
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
        console.log(chalk.dim(`  ${ideConfig.workflowsDir}/`));
        console.log(chalk.dim(`  ${ideConfig.skillsDir}/`));
        console.log(chalk.dim(`  ${ideConfig.path}`));

        console.log(chalk.blue('\n🎯 Próximos passos:'));
        console.log(`  1. Abra sua ${options.ide}`);
        console.log('  2. Digite: /maestro');
        console.log(' 3. Comece a desenvolver!');
        console.log('');

    } catch (error) {
        spinner.fail('Erro durante inicialização');
        console.error(chalk.red(error));
        process.exit(1);
    }
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
| \`.maestro/content/\` | Especialistas, templates, guides |
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
