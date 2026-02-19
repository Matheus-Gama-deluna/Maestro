/**
 * Global project context management — v6.3
 * Tracks the current project directory across tool calls
 * S4.1: Adds state cache to avoid repeated disk reads within the same session
 */

import { existsSync } from "fs";
import { join } from "path";
import { setProjectDirectory } from "../utils/files.js";
import type { EstadoProjeto } from "../types/index.js";

// Global state: stores the current project directory
let currentProjectDirectory: string | null = null;

// Path to state file
const ESTADO_FILE = ".maestro/estado.json";

// ─── v6.3 S4.1: Estado cache ──────────────────────────────────────────────────
// Evita leituras de disco repetidas entre tool calls na mesma sessão.
// TTL de 30s: suficiente para calls em sequência, mas evita dados stale.

interface CacheEntry {
    estado: EstadoProjeto;
    timestamp: number;
    diretorio: string;
}

const CACHE_TTL_MS = 30_000;
let estadoCache: CacheEntry | null = null;

/**
 * Armazena estado no cache (chamar após salvarEstado / parsearEstado bem-sucedido)
 */
export function setCachedEstado(estado: EstadoProjeto, diretorio: string): void {
    estadoCache = { estado, timestamp: Date.now(), diretorio };
}

/**
 * Recupera estado do cache se ainda válido para o diretório informado
 */
export function getCachedEstado(diretorio: string): EstadoProjeto | null {
    if (!estadoCache) return null;
    if (estadoCache.diretorio !== diretorio) return null;
    if (Date.now() - estadoCache.timestamp > CACHE_TTL_MS) {
        estadoCache = null;
        return null;
    }
    return estadoCache.estado;
}

/**
 * Invalida o cache (chamar quando estado for modificado)
 */
export function invalidateEstadoCache(): void {
    estadoCache = null;
}

// ─── Directory management ─────────────────────────────────────────────────────

/**
 * Check if a directory contains a valid Maestro project
 */
export function isValidProject(dir: string): boolean {
    const estadoPath = join(dir, ESTADO_FILE);
    return existsSync(estadoPath);
}

/**
 * Set the current project directory
 * Also updates the files utility for local content reading
 */
export function setCurrentDirectory(dir: string): void {
    // Invalida cache se mudar de diretório
    if (currentProjectDirectory !== dir) {
        invalidateEstadoCache();
    }
    currentProjectDirectory = dir;
    setProjectDirectory(dir);
}

/**
 * Get the current project directory
 * Falls back to process.cwd() if not set
 */
export function getCurrentDirectory(): string {
    return currentProjectDirectory || process.cwd();
}

/**
 * Clear the current project directory
 */
export function clearCurrentDirectory(): void {
    currentProjectDirectory = null;
    estadoCache = null;
    setProjectDirectory(null);
}

/**
 * Check if a project directory is currently tracked
 */
export function hasCurrentDirectory(): boolean {
    return currentProjectDirectory !== null;
}

/**
 * Get default projects directory based on environment
 */
export function getDefaultProjectsDirectory(): string {
    return process.env.NODE_ENV === "production"
        ? "/app/projects"
        : process.cwd();
}

/**
 * Get project directory from args or fallback to current/cwd
 */
export function resolveDirectory(argsDir?: string): string {
    if (argsDir) {
        setCurrentDirectory(argsDir);
        return argsDir;
    }
    if (currentProjectDirectory) {
        return currentProjectDirectory;
    }
    const cwd = process.cwd();
    if (isValidProject(cwd)) {
        setCurrentDirectory(cwd);
        return cwd;
    }
    return cwd;
}

/**
 * Try to auto-detect and load a project from a directory
 * Returns the directory if valid, null otherwise
 */
export function tryAutoDetect(dir: string): string | null {
    if (isValidProject(dir)) {
        setCurrentDirectory(dir);
        return dir;
    }
    return null;
}
