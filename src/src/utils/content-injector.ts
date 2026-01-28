import { cp, mkdir, readdir } from "fs/promises";
import { existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getDefaultSourceDir(): string {
    // Tente diferentes caminhos relativos para encontrar o conteúdo
    const possiblePaths = [
        join(__dirname, "..", "..", "..", "content"),    // src/../content
        join(__dirname, "..", "..", "content"),          // src/content
        join(__dirname, "content"),                      // mesmo dir
        join(process.cwd(), "content"),                  // working dir
        join(__dirname, "..", "content"),                // dist/content (quando instalado)
    ];
    
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            console.log(`[DEBUG] Conteúdo encontrado em: ${path}`);
            return path;
        }
    }
    
    console.log(`[DEBUG] Conteúdo não encontrado. Tentados: ${possiblePaths.join(", ")}`);
    throw new Error("Conteúdo embutido não encontrado");
}

export function getBuiltinContentDir(): string {
    return getDefaultSourceDir();
}

export interface InjectContentOptions {
    sourcePath?: string;
    force?: boolean;
}

export interface InjectContentResult {
    targetDir: string;
    sourceDir: string;
    installed: boolean;
    filesCopied?: number;
}

async function countFiles(dir: string): Promise<number> {
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        let count = 0;
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                count += await countFiles(fullPath);
            } else {
                count += 1;
            }
        }
        return count;
    } catch {
        return 0;
    }
}

export async function injectContentIntoProject(diretorio: string, options?: InjectContentOptions): Promise<InjectContentResult> {
    const sourceDir = options?.sourcePath ?? getDefaultSourceDir();
    const targetDir = join(diretorio, ".maestro", "content");

    if (!directoryExists(sourceDir)) {
        throw new Error(`Fonte de conteúdo não encontrada: ${sourceDir}`);
    }

    if (existsSync(targetDir)) {
        if (!options?.force) {
            return { targetDir, sourceDir, installed: false };
        }
    }

    await mkdir(targetDir, { recursive: true });
    await cp(sourceDir, targetDir, { recursive: true });
    const filesCopied = await countFiles(targetDir);

    return {
        targetDir,
        sourceDir,
        installed: true,
        filesCopied,
    };
}

export async function ensureContentInstalled(diretorio: string): Promise<InjectContentResult> {
    const targetDir = join(diretorio, ".maestro", "content");
    if (existsSync(targetDir)) {
        return {
            targetDir,
            sourceDir: getDefaultSourceDir(),
            installed: false,
            filesCopied: await countFiles(targetDir),
        };
    }

    return injectContentIntoProject(diretorio);
}

function directoryExists(path: string): boolean {
    try {
        const stats = statSync(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
}
