#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { update } from './commands/update.js';

const program = new Command();

program
    .name('maestro')
    .description('CLI para inicializar projetos com Maestro - Desenvolvimento assistido por IA')
    .version('1.0.0')
    .option('-f, --force', 'Sobrescreve arquivos existentes')
    .option('--minimal', 'Instala apenas workflows e rules')
    .option('--ide <ide>', 'IDE alvo: gemini, cursor, copilot, windsurf, all (default: all)', 'all')
    .action(async (options) => {
        // Comportamento padrão: executa init quando chamado sem subcomando
        await init(options);
    });

program
    .command('init')
    .description('Inicializa Maestro no projeto atual')
    .option('-f, --force', 'Sobrescreve arquivos existentes')
    .option('--minimal', 'Instala apenas workflows e rules')
    .option('--ide <ide>', 'IDE alvo: gemini, cursor, copilot, windsurf, all (default: all)', 'all')
    .action(init);

program
    .command('update')
    .description('Atualiza content para a última versão')
    .option('-f, --force', 'Sobrescreve arquivos modificados')
    .action(update);

program.parse();
