import { readFile, readdir, stat } from "fs/promises";
import { join, dirname, resolve, win32 } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { platform } from "os";
import { getBuiltinContentDir } from "./content-injector.js";

// Resolve path to content folder (server fallback)
const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_CONTENT_ROOT = join(__dirname, "..", "..", "..", "content");

// Diretório do projeto atual (pode ser setado por contexto)
let currentProjectDir: string | null = null;

/**
 * Define o diretório do projeto para leitura local
 */
export function setProjectDirectory(dir: string | null) {
    currentProjectDir = dir;
}

/**
 * Obtém o diretório do projeto atual
 */
export function getProjectDirectory(): string | null {
    return currentProjectDir;
}

/**
 * Verifica se o projeto tem content local instalado
 */
export function temContentLocal(diretorio?: string): boolean {
    const dir = diretorio || currentProjectDir;
    if (!dir) return false;
    return existsSync(join(dir, '.maestro', 'content'));
}

/**
 * Obtém o diretório de content (local ou servidor)
 */
function getContentRoot(diretorio?: string): string {
    const dir = diretorio || currentProjectDir;
    
    // Tenta local primeiro
    if (dir) {
        const localContent = join(dir, '.maestro', 'content');
        if (existsSync(localContent)) {
            return localContent;
        }
    }
    
    // Fallback para servidor (usa o content-injector para encontrar)
    try {
        return getBuiltinContentDir();
    } catch {
        // Último fallback - caminho relativo
        return join(__dirname, "..", "..", "..", "content");
    }
}

/**
 * Lê conteúdo de um especialista (local ou servidor)
 */
export async function lerEspecialista(nome: string, diretorio?: string): Promise<string> {
    const contentRoot = getContentRoot(diretorio);
    const especialistasDir = join(contentRoot, "specialists");
    
    try {
        const files = await readdir(especialistasDir);
        
        // Busca arquivo que contém o nome do especialista
        const arquivo = files.find(f =>
            f.toLowerCase().includes(nome.toLowerCase()) && f.endsWith(".md")
        );

        if (!arquivo) {
            throw new Error(`Especialista não encontrado: ${nome}`);
        }

        const path = join(especialistasDir, arquivo);
        return readFile(path, "utf-8");
    } catch (error) {
        // Se falhou no local, tenta no servidor
        if (contentRoot !== SERVER_CONTENT_ROOT) {
            return lerEspecialista(nome, undefined);
        }
        throw error;
    }
}

/**
 * Lê conteúdo de um template (local ou servidor)
 */
export async function lerTemplate(nome: string, diretorio?: string): Promise<string> {
    const contentRoot = getContentRoot(diretorio);
    const templatesDir = join(contentRoot, "templates");
    
    try {
        const files = await readdir(templatesDir);

        const arquivo = files.find(f =>
            f.toLowerCase().includes(nome.toLowerCase()) && f.endsWith(".md")
        );

        if (!arquivo) {
            throw new Error(`Template não encontrado: ${nome}`);
        }

        const path = join(templatesDir, arquivo);
        return readFile(path, "utf-8");
    } catch (error) {
        if (contentRoot !== SERVER_CONTENT_ROOT) {
            return lerTemplate(nome, undefined);
        }
        throw error;
    }
}

/**
 * Lê conteúdo de um prompt (local ou servidor)
 */
export async function lerPrompt(categoria: string, nome: string, diretorio?: string): Promise<string> {
    const contentRoot = getContentRoot(diretorio);
    const path = join(contentRoot, "prompts", categoria, `${nome}.md`);
    
    try {
        return await readFile(path, "utf-8");
    } catch (error) {
        if (contentRoot !== SERVER_CONTENT_ROOT) {
            return lerPrompt(categoria, nome, undefined);
        }
        throw error;
    }
}

/**
 * Lê conteúdo de um guia (local ou servidor)
 */
export async function lerGuia(nome: string, diretorio?: string): Promise<string> {
    const contentRoot = getContentRoot(diretorio);
    const guiasDir = join(contentRoot, "guides");
    
    try {
        const files = await readdir(guiasDir);

        const arquivo = files.find(f =>
            f.toLowerCase().includes(nome.toLowerCase()) && f.endsWith(".md")
        );

        if (!arquivo) {
            throw new Error(`Guia não encontrado: ${nome}`);
        }

        const path = join(guiasDir, arquivo);
        return readFile(path, "utf-8");
    } catch (error) {
        if (contentRoot !== SERVER_CONTENT_ROOT) {
            return lerGuia(nome, undefined);
        }
        throw error;
    }
}

/**
 * Lista arquivos markdown em um diretório dentro de content
 */
export async function listarArquivos(subdir: string, diretorio?: string): Promise<string[]> {
    const contentRoot = getContentRoot(diretorio);
    const dir = join(contentRoot, subdir);
    
    try {
        const entries = await readdir(dir);
        return entries.filter(e => e.endsWith(".md"));
    } catch {
        // Se falhar no local, tenta servidor
        if (contentRoot !== SERVER_CONTENT_ROOT) {
            return listarArquivos(subdir, undefined);
        }
        return [];
    }
}

/**
 * Lista especialistas disponíveis
 */
export async function listarEspecialistas(diretorio?: string): Promise<string[]> {
    const files = await listarArquivos("specialists", diretorio);
    return files.map(f => f.replace(/^Especialista em /i, "").replace(".md", ""));
}

/**
 * Lista templates disponíveis
 */
export async function listarTemplates(diretorio?: string): Promise<string[]> {
    const files = await listarArquivos("templates", diretorio);
    return files.map(f => f.replace(".md", ""));
}

/**
 * Lista guias disponíveis
 */
export async function listarGuias(diretorio?: string): Promise<string[]> {
    const files = await listarArquivos("guides", diretorio);
    return files.map(f => f.replace(".md", ""));
}

/**
 * Verifica se arquivo existe
 */
export async function arquivoExiste(path: string): Promise<boolean> {
    try {
        await stat(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Obtém caminho raiz do servidor (fallback)
 */
export function getServerContentRoot(): string {
    return SERVER_CONTENT_ROOT;
}

/**
 * Lê conteúdo de um exemplo de fluxo (local ou servidor)
 */
export async function lerExemplo(nome: string, diretorio?: string): Promise<string> {
    const contentRoot = getContentRoot(diretorio);
    const examplesDir = join(contentRoot, "examples");
    
    try {
        const files = await readdir(examplesDir);
        
        // Busca arquivo que contém o nome do exemplo
        const arquivo = files.find(f =>
            f.toLowerCase().includes(nome.toLowerCase()) && f.endsWith(".md")
        );

        if (!arquivo) {
            throw new Error(`Exemplo não encontrado: ${nome}`);
        }

        const path = join(examplesDir, arquivo);
        return readFile(path, "utf-8");
    } catch (error) {
        // Se falhou no local, tenta no servidor
        if (contentRoot !== SERVER_CONTENT_ROOT) {
            return lerExemplo(nome, undefined);
        }
        throw error;
    }
}

/**
 * Lista exemplos disponíveis
 */
export async function listarExemplos(diretorio?: string): Promise<string[]> {
    const files = await listarArquivos("examples", diretorio);
    return files.map(f => f.replace(".md", ""));
}

/**
 * Normaliza o caminho do projeto, removendo prefixos de container (ex: /app/c:)
 */
export function normalizeProjectPath(path: string): string {
    if (!path) return path;
    
    // Remove prefixo /app/ de caminhos Windows com drive letter (ex: /app/c: -> c:)
    const winDriveMatch = path.match(/^\/app\/([a-zA-Z]:.*)$/);
    if (winDriveMatch) {
        return winDriveMatch[1];
    }

    // Remove apenas /app/ se for um caminho absoluto linux/mac que foi prepended
    if (path.startsWith('/app/')) {
        const stripped = path.replace(/^\/app\//, '/');
        // Se após remover ficar apenas uma barra ou caminho válido, retorna
        return stripped;
    }

    return path;
}


/**
 * Resolve o caminho do projeto lidando com ambientes mistos (Docker Linux -> Windows Host)
 */
export function resolveProjectPath(path: string): string {
    const normalized = normalizeProjectPath(path).trim();
    
    // Debug logging
    if (platform() !== 'win32') {
        console.log(`[DEBUG] resolveProjectPath input: "${path}"`);
        console.log(`[DEBUG] normalized: "${normalized}"`);
    }

    // Se o path é Windows (Drive Letter) mas estamos no Linux (Docker/WSL)
    // Checks for "C:" at start OR "C:\" inside string (handling weird mounting)
    if (platform() !== 'win32' && (normalized.match(/^[a-zA-Z]:/) || normalized.includes(':\\'))) {
        console.log(`[DEBUG] Windows path detected on Linux. Mapping to CWD: ${process.cwd()}`);
        return process.cwd();
    }

    // Se parece um caminho Windows em ambiente Windows, força win32
    if (platform() === 'win32' && normalized.match(/^[a-zA-Z]:/)) {
        const safePath = normalized.replace(/\//g, '\\');
        return win32.resolve(safePath);
    }

    // Caso contrário, usa resolve padrão do sistema
    return resolve(normalized);
}

/**
 * Join paths handling mixed environments (Docker Linux -> Windows Host)
 */
export function joinProjectPath(...paths: string[]): string {
    if (paths.length === 0) return "";
    const first = normalizeProjectPath(paths[0]);
    
    // Se o primeiro segmento parece um caminho Windows, usa join win32
    if (first.match(/^[a-zA-Z]:/)) {
        return win32.join(...paths);
    }
    
    return join(...paths);
}
 