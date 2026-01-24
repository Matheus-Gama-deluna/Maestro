/**
 * Script para copiar content do repositório para o pacote durante o build
 */

import fse from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { copySync, existsSync, ensureDirSync } = fse;

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');
const repoRoot = join(packageRoot, '..', '..');

const contentSource = join(repoRoot, 'content');
const contentDest = join(packageRoot, 'content');

console.log('📦 Copiando content para o pacote...');

// Diretórios a copiar
const dirs = ['specialists', 'templates', 'guides', 'prompts', 'skills', 'workflows', 'rules'];

ensureDirSync(contentDest);

for (const dir of dirs) {
    const src = join(contentSource, dir);
    const dest = join(contentDest, dir);

    if (existsSync(src)) {
        copySync(src, dest, { overwrite: true });
        console.log(`  ✓ ${dir}/`);
    } else {
        console.log(`  ⚠ ${dir}/ não encontrado`);
    }
}

console.log('✅ Content copiado com sucesso!\n');
