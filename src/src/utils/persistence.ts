/**
 * Helper de persistência direta para o MCP.
 * 
 * O MCP salva seus próprios arquivos via fs/promises.
 * Elimina a necessidade de pedir para a IA criar arquivos.
 * 
 * @since v5.3.0 — Melhoria de Comunicação MCP ↔ IA
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";

/**
 * Garante que o diretório existe e salva o arquivo.
 */
export async function saveFile(filePath: string, content: string): Promise<void> {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
    await writeFile(filePath, content, "utf-8");
}

/**
 * Salva estado.json no diretório .maestro do projeto.
 */
export async function saveEstado(diretorio: string, content: string): Promise<string> {
    const filePath = join(diretorio, ".maestro", "estado.json");
    await saveFile(filePath, content);
    return filePath;
}

/**
 * Salva resumo.json e resumo.md no diretório .maestro do projeto.
 */
export async function saveResumo(
    diretorio: string, 
    files: Array<{ path: string; content: string }>
): Promise<string[]> {
    const saved: string[] = [];
    for (const f of files) {
        const filePath = join(diretorio, f.path);
        await saveFile(filePath, f.content);
        saved.push(filePath);
    }
    return saved;
}

/**
 * Salva um entregável no diretório docs do projeto.
 */
export async function saveEntregavel(filePath: string, content: string): Promise<string> {
    await saveFile(filePath, content);
    return filePath;
}

/**
 * Salva múltiplos arquivos de uma vez.
 * Retorna lista de caminhos salvos.
 */
export async function saveMultipleFiles(
    files: Array<{ path: string; content: string }>
): Promise<string[]> {
    const saved: string[] = [];
    for (const f of files) {
        await saveFile(f.path, f.content);
        saved.push(f.path);
    }
    return saved;
}

/**
 * Formata confirmação de arquivos salvos para o output.
 */
export function formatSavedFilesConfirmation(savedPaths: string[]): string {
    if (savedPaths.length === 0) return "";
    const items = savedPaths.map(p => `- ✅ \`${p}\``).join("\n");
    return `\n## 📁 Arquivos Salvos\n\n${items}\n`;
}
