/**
 * Script para copiar content do repositório para o pacote durante o build
 */

import fse from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync } from 'fs';

const { copySync, existsSync, ensureDirSync, removeSync } = fse;

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');
const contentSource = join(packageRoot, 'content');
const contentDest = join(packageRoot, 'content');

console.log('📦 Processando conteúdo do pacote...');

// Diretórios a processar (já estão em content/)
const dirs = ['specialists', 'templates', 'guides', 'prompts', 'skills', 'workflows', 'rules'];

// Garantir que o diretório content existe
ensureDirSync(contentSource);

// Função para copiar diretório com filtro de arquivos
function copyDirWithFilter(src, dest, excludePattern = null) {
    ensureDirSync(dest);
    
    if (!existsSync(src)) {
        console.log(`  ⚠ ${src} não encontrado`);
        return;
    }
    
    const items = readdirSync(src);
    for (const item of items) {
        const srcPath = join(src, item);
        const destPath = join(dest, item);
        const stat = statSync(srcPath);
        
        if (stat.isDirectory()) {
            copyDirWithFilter(srcPath, destPath, excludePattern);
        } else if (excludePattern && excludePattern.test(item)) {
            // Se source === dest, precisamos excluir o arquivo
            if (src === dest) {
                fse.removeSync(srcPath);
                console.log(`  🚫 Excluído: ${item}`);
            } else {
                console.log(`  🚫 Excluído: ${item}`);
                continue;
            }
        } else if (src !== dest) {
            // Só copia se source for diferente de dest
            copySync(srcPath, destPath, { overwrite: true });
        }
    }
}

for (const dir of dirs) {
    const src = join(contentSource, dir);
    
    if (dir === 'workflows') {
        // Excluir workflows legados e desnecessários
        const excludePattern = /^(mcp-.*\.md|create\.md|debug\.md|enhance\.md|preview\.md|status\.md|test\.md|ui-ux-pro-max\.md|README-MCP\.md)$/;
        copyDirWithFilter(src, src, excludePattern);
    }
    // Para outros diretórios, não precisa fazer nada pois já estão no lugar certo
    
    console.log(`  ✓ ${dir}/ processado`);
}

console.log('✅ Content processado com sucesso!\n');
