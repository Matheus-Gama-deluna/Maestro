import { readFile, readdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Resolve path to Maestro root (parent of mcp-server)
const __dirname = dirname(fileURLToPath(import.meta.url));
const MAESTRO_ROOT = join(__dirname, "..", "..", "..");

/**
 * Lê conteúdo de um especialista
 */
export async function lerEspecialista(nome: string): Promise<string> {
    const especialistasDir = join(MAESTRO_ROOT, "02-especialistas");
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
}

/**
 * Lê conteúdo de um template
 */
export async function lerTemplate(nome: string): Promise<string> {
    const templatesDir = join(MAESTRO_ROOT, "06-templates");
    const files = await readdir(templatesDir);

    // Busca arquivo que contém o nome do template
    const arquivo = files.find(f =>
        f.toLowerCase().includes(nome.toLowerCase()) && f.endsWith(".md")
    );

    if (!arquivo) {
        throw new Error(`Template não encontrado: ${nome}`);
    }

    const path = join(templatesDir, arquivo);
    return readFile(path, "utf-8");
}

/**
 * Lê conteúdo de um prompt
 */
export async function lerPrompt(categoria: string, nome: string): Promise<string> {
    const path = join(MAESTRO_ROOT, "05-prompts", categoria, `${nome}.md`);
    return readFile(path, "utf-8");
}

/**
 * Lê conteúdo de um guia
 */
export async function lerGuia(nome: string): Promise<string> {
    const guiasDir = join(MAESTRO_ROOT, "03-guias");
    const files = await readdir(guiasDir);

    const arquivo = files.find(f =>
        f.toLowerCase().includes(nome.toLowerCase()) && f.endsWith(".md")
    );

    if (!arquivo) {
        throw new Error(`Guia não encontrado: ${nome}`);
    }

    const path = join(guiasDir, arquivo);
    return readFile(path, "utf-8");
}

/**
 * Lista arquivos markdown em um diretório
 */
export async function listarArquivos(subdir: string): Promise<string[]> {
    const dir = join(MAESTRO_ROOT, subdir);
    const entries = await readdir(dir);
    return entries.filter(e => e.endsWith(".md"));
}

/**
 * Lista especialistas disponíveis
 */
export async function listarEspecialistas(): Promise<string[]> {
    const files = await listarArquivos("02-especialistas");
    return files.map(f => f.replace(/^Especialista em /i, "").replace(".md", ""));
}

/**
 * Lista templates disponíveis
 */
export async function listarTemplates(): Promise<string[]> {
    const files = await listarArquivos("06-templates");
    return files.map(f => f.replace(".md", ""));
}

/**
 * Lista guias disponíveis
 */
export async function listarGuias(): Promise<string[]> {
    const files = await listarArquivos("03-guias");
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
 * Obtém caminho raiz do Maestro
 */
export function getMaestroRoot(): string {
    return MAESTRO_ROOT;
}
