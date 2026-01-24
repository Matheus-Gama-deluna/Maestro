import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Diretório de content do servidor (fallback)
const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_CONTENT_DIR = join(__dirname, '..', '..', '..', 'content');

/**
 * Carrega um especialista do projeto local ou fallback do servidor
 */
export async function carregarEspecialista(nome: string, diretorio?: string): Promise<string | null> {
  // Normalizar nome do arquivo
  const nomeArquivo = nome.endsWith('.md') ? nome : `${nome}.md`;
  
  // 1. Tentar carregar do projeto local primeiro
  if (diretorio) {
    const localPath = join(diretorio, '.maestro', 'content', 'specialists', nomeArquivo);
    if (existsSync(localPath)) {
      return await readFile(localPath, 'utf-8');
    }
  }
  
  // 2. Fallback para content/ do servidor
  const serverPath = join(SERVER_CONTENT_DIR, 'specialists', nomeArquivo);
  if (existsSync(serverPath)) {
    return await readFile(serverPath, 'utf-8');
  }
  
  return null;
}

/**
 * Carrega um template do projeto local ou fallback do servidor
 */
export async function carregarTemplate(nome: string, diretorio?: string): Promise<string | null> {
  const nomeArquivo = nome.endsWith('.md') ? nome : `${nome}.md`;
  
  if (diretorio) {
    const localPath = join(diretorio, '.maestro', 'content', 'templates', nomeArquivo);
    if (existsSync(localPath)) {
      return await readFile(localPath, 'utf-8');
    }
  }
  
  const serverPath = join(SERVER_CONTENT_DIR, 'templates', nomeArquivo);
  if (existsSync(serverPath)) {
    return await readFile(serverPath, 'utf-8');
  }
  
  return null;
}

/**
 * Carrega um guia do projeto local ou fallback do servidor
 */
export async function carregarGuia(nome: string, diretorio?: string): Promise<string | null> {
  const nomeArquivo = nome.endsWith('.md') ? nome : `${nome}.md`;
  
  if (diretorio) {
    const localPath = join(diretorio, '.maestro', 'content', 'guides', nomeArquivo);
    if (existsSync(localPath)) {
      return await readFile(localPath, 'utf-8');
    }
  }
  
  const serverPath = join(SERVER_CONTENT_DIR, 'guides', nomeArquivo);
  if (existsSync(serverPath)) {
    return await readFile(serverPath, 'utf-8');
  }
  
  return null;
}

/**
 * Carrega um prompt do projeto local ou fallback do servidor
 */
export async function carregarPrompt(categoria: string, nome: string, diretorio?: string): Promise<string | null> {
  const nomeArquivo = nome.endsWith('.md') ? nome : `${nome}.md`;
  
  if (diretorio) {
    const localPath = join(diretorio, '.maestro', 'content', 'prompts', categoria, nomeArquivo);
    if (existsSync(localPath)) {
      return await readFile(localPath, 'utf-8');
    }
  }
  
  const serverPath = join(SERVER_CONTENT_DIR, 'prompts', categoria, nomeArquivo);
  if (existsSync(serverPath)) {
    return await readFile(serverPath, 'utf-8');
  }
  
  return null;
}

/**
 * Verifica se o projeto tem content local instalado
 */
export function temContentLocal(diretorio: string): boolean {
  return existsSync(join(diretorio, '.maestro', 'content'));
}
