/**
 * StateService — Persistência Ativa
 * 
 * O MCP agora pode gravar estado diretamente no filesystem,
 * sem depender da IA para salvar arquivos.
 * 
 * Fallback: continua retornando files[] e estado_atualizado 
 * para IDEs que preferem controlar a persistência.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { EstadoProjeto } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";

export class StateService {
    private maestroDir: string;
    private estadoPath: string;

    constructor(private diretorio: string) {
        this.maestroDir = join(diretorio, ".maestro");
        this.estadoPath = join(this.maestroDir, "estado.json");
    }

    /**
     * Carrega estado do projeto do filesystem.
     * Retorna null se não existir ou falhar.
     */
    async load(): Promise<EstadoProjeto | null> {
        try {
            if (!existsSync(this.estadoPath)) return null;
            const raw = await readFile(this.estadoPath, "utf-8");
            return parsearEstado(raw);
        } catch {
            return null;
        }
    }

    /**
     * Salva estado no filesystem.
     * Cria diretório .maestro se não existir.
     * Retorna true se salvou com sucesso, false se falhou (fallback para files[]).
     */
    async save(estado: EstadoProjeto): Promise<boolean> {
        try {
            await mkdir(this.maestroDir, { recursive: true });
            estado.atualizado_em = new Date().toISOString();
            const serialized = serializarEstado(estado);
            await writeFile(this.estadoPath, serialized.content, "utf-8");
            return true;
        } catch (error) {
            console.warn("[StateService] Falha ao salvar estado:", error);
            return false;
        }
    }

    /**
     * Aplica patch parcial ao estado e salva.
     * Carrega estado atual, aplica as mudanças, e persiste.
     */
    async patch(changes: Partial<EstadoProjeto>): Promise<EstadoProjeto | null> {
        const current = await this.load();
        if (!current) return null;

        const updated = { ...current, ...changes, atualizado_em: new Date().toISOString() };
        const success = await this.save(updated);
        return success ? updated : null;
    }

    /**
     * Salva arquivo genérico no diretório do projeto.
     * Usado para entregáveis, resumos, etc.
     */
    async saveFile(relativePath: string, content: string): Promise<boolean> {
        try {
            const fullPath = join(this.diretorio, relativePath);
            const dir = fullPath.substring(0, fullPath.lastIndexOf("/")).replace(/\\/g, "/");
            // Normalize for Windows
            const dirNormalized = dir.replace(/\//g, join("a", "b").includes("\\") ? "\\" : "/");
            await mkdir(fullPath.substring(0, fullPath.replace(/\\/g, "/").lastIndexOf("/")), { recursive: true });
            await writeFile(fullPath, content, "utf-8");
            return true;
        } catch (error) {
            console.warn("[StateService] Falha ao salvar arquivo:", relativePath, error);
            return false;
        }
    }

    /**
     * Salva múltiplos arquivos de uma vez.
     * Retorna quantos foram salvos com sucesso.
     */
    async saveFiles(files: Array<{ path: string; content: string }>): Promise<number> {
        let saved = 0;
        for (const file of files) {
            // Se path é absoluto, usar diretamente; se relativo, usar join
            const fullPath = file.path.startsWith(this.diretorio) 
                ? file.path 
                : join(this.diretorio, file.path);
            try {
                const dirPart = fullPath.replace(/\\/g, "/");
                const dirOnly = dirPart.substring(0, dirPart.lastIndexOf("/"));
                await mkdir(dirOnly, { recursive: true });
                await writeFile(fullPath, file.content, "utf-8");
                saved++;
            } catch (error) {
                console.warn("[StateService] Falha ao salvar:", fullPath, error);
            }
        }
        return saved;
    }

    /**
     * Verifica se o diretório .maestro existe (projeto inicializado).
     */
    exists(): boolean {
        return existsSync(this.maestroDir);
    }

    /**
     * Verifica se tem estado salvo.
     */
    hasState(): boolean {
        return existsSync(this.estadoPath);
    }
}

/**
 * Factory function para criar StateService.
 * Facilita o uso em tools que recebem diretorio como argumento.
 */
export function createStateService(diretorio: string): StateService {
    return new StateService(diretorio);
}
