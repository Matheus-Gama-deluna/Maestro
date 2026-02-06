/**
 * ContentResolverService — Resolução Unificada de Conteúdo
 * 
 * Única fonte de verdade para resolver onde ler conteúdo:
 * 1. Projeto local (.maestro/content/) — Plano B (prioridade)
 * 2. Servidor (content/) — Plano A (fallback)
 * 
 * Cache em memória para evitar I/O repetido.
 */

import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface CacheEntry {
    content: string;
    timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export class ContentResolverService {
    private diretorio: string;
    private projectContentRoot: string;
    private serverContentRoot: string;
    private cache: Map<string, CacheEntry> = new Map();

    constructor(diretorio: string) {
        this.diretorio = diretorio;
        this.projectContentRoot = join(diretorio, ".maestro", "content");
        this.serverContentRoot = this.resolveServerContentRoot();
    }

    /**
     * Resolve o diretório raiz de conteúdo do servidor.
     * Tenta múltiplos caminhos relativos ao módulo.
     */
    private resolveServerContentRoot(): string {
        const possiblePaths = [
            join(__dirname, "..", "..", "..", "content"),
            join(__dirname, "..", "..", "content"),
            join(__dirname, "..", "content"),
            join(process.cwd(), "content"),
        ];

        for (const path of possiblePaths) {
            if (existsSync(path)) {
                return path;
            }
        }

        // Fallback: retorna o path mais provável mesmo sem existir
        return possiblePaths[0];
    }

    /**
     * Retorna o diretório raiz de conteúdo ativo.
     * Prioriza projeto local, fallback para servidor.
     */
    getContentRoot(): string {
        if (this.hasProjectContent()) {
            return this.projectContentRoot;
        }
        return this.serverContentRoot;
    }

    /**
     * Verifica se o projeto tem conteúdo local instalado (.maestro/content)
     */
    hasProjectContent(): boolean {
        return existsSync(this.projectContentRoot);
    }

    /**
     * Retorna o diretório raiz do conteúdo do servidor (sempre disponível)
     */
    getServerContentRoot(): string {
        return this.serverContentRoot;
    }

    /**
     * Resolve o diretório de uma skill específica.
     * Prioriza projeto local → servidor.
     * Retorna null se não encontrada em nenhum.
     */
    getSkillDir(skillName: string): string | null {
        // 1. Tentar no projeto local
        const projectSkillDir = join(this.projectContentRoot, "skills", skillName);
        if (existsSync(projectSkillDir)) {
            return projectSkillDir;
        }

        // 2. Tentar no servidor
        const serverSkillDir = join(this.serverContentRoot, "skills", skillName);
        if (existsSync(serverSkillDir)) {
            return serverSkillDir;
        }

        return null;
    }

    /**
     * Lê conteúdo de um arquivo de skill.
     * Prioriza projeto local → servidor.
     * Retorna null se não encontrado.
     */
    async readSkillFile(skillName: string, fileName: string): Promise<string | null> {
        const cacheKey = `skill:${skillName}:${fileName}`;
        const cached = this.getFromCache(cacheKey);
        if (cached !== null) return cached;

        const skillDir = this.getSkillDir(skillName);
        if (!skillDir) return null;

        const filePath = join(skillDir, fileName);
        try {
            if (!existsSync(filePath)) return null;
            const content = await readFile(filePath, "utf-8");
            this.setCache(cacheKey, content);
            return content;
        } catch {
            return null;
        }
    }

    /**
     * Lista recursos disponíveis de uma skill (templates, examples, checklists, reference).
     */
    async listSkillResources(
        skillName: string,
        tipo: "templates" | "examples" | "checklists" | "reference"
    ): Promise<string[]> {
        const skillDir = this.getSkillDir(skillName);
        if (!skillDir) return [];

        const resourceDir = join(skillDir, "resources", tipo);
        try {
            if (!existsSync(resourceDir)) return [];
            const entries = await readdir(resourceDir);
            return entries.filter(e => e.endsWith(".md"));
        } catch {
            return [];
        }
    }

    /**
     * Lê recurso específico de uma skill.
     */
    async readSkillResource(
        skillName: string,
        tipo: "templates" | "examples" | "checklists" | "reference",
        arquivo: string
    ): Promise<string | null> {
        const cacheKey = `resource:${skillName}:${tipo}:${arquivo}`;
        const cached = this.getFromCache(cacheKey);
        if (cached !== null) return cached;

        const skillDir = this.getSkillDir(skillName);
        if (!skillDir) return null;

        const filePath = join(skillDir, "resources", tipo, arquivo);
        try {
            if (!existsSync(filePath)) return null;
            const content = await readFile(filePath, "utf-8");
            this.setCache(cacheKey, content);
            return content;
        } catch {
            return null;
        }
    }

    /**
     * Lê o primeiro arquivo de template encontrado para uma skill.
     * Retorna null se nenhum template disponível.
     */
    async readFirstTemplate(skillName: string): Promise<string | null> {
        const templates = await this.listSkillResources(skillName, "templates");
        if (templates.length === 0) return null;
        return this.readSkillResource(skillName, "templates", templates[0]);
    }

    /**
     * Lê o primeiro arquivo de checklist encontrado para uma skill.
     * Retorna null se nenhum checklist disponível.
     */
    async readFirstChecklist(skillName: string): Promise<string | null> {
        const checklists = await this.listSkillResources(skillName, "checklists");
        if (checklists.length === 0) return null;
        return this.readSkillResource(skillName, "checklists", checklists[0]);
    }

    /**
     * Lista todas as skills disponíveis (pastas dentro de skills/).
     */
    async listAvailableSkills(): Promise<string[]> {
        const contentRoot = this.getContentRoot();
        const skillsDir = join(contentRoot, "skills");

        try {
            if (!existsSync(skillsDir)) return [];
            const entries = await readdir(skillsDir, { withFileTypes: true });
            return entries
                .filter(e => e.isDirectory() && e.name.startsWith("specialist-"))
                .map(e => e.name);
        } catch {
            return [];
        }
    }

    // === Cache ===

    private getFromCache(key: string): string | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
            this.cache.delete(key);
            return null;
        }
        return entry.content;
    }

    private setCache(key: string, content: string): void {
        this.cache.set(key, { content, timestamp: Date.now() });
    }

    /**
     * Limpa o cache (útil para testes ou após injeção de conteúdo).
     */
    clearCache(): void {
        this.cache.clear();
    }

    // === Version Management (v5: Sprint D.3) ===

    /**
     * Lê o manifesto de versão do conteúdo (.version.json).
     * Retorna null se não encontrado.
     */
    async readVersionManifest(source: "project" | "server" = "project"): Promise<Record<string, unknown> | null> {
        const root = source === "project" ? this.projectContentRoot : this.serverContentRoot;
        const versionPath = join(root, ".version.json");
        
        try {
            if (!existsSync(versionPath)) return null;
            const content = await readFile(versionPath, "utf-8");
            return JSON.parse(content);
        } catch {
            return null;
        }
    }

    /**
     * Verifica se o conteúdo local está desatualizado comparado ao servidor.
     * Retorna objeto com informações de compatibilidade.
     */
    async checkVersionCompatibility(): Promise<{
        hasProjectContent: boolean;
        projectVersion: string | null;
        serverVersion: string | null;
        isCompatible: boolean;
        needsUpdate: boolean;
        message: string;
    }> {
        const projectManifest = await this.readVersionManifest("project");
        const serverManifest = await this.readVersionManifest("server");

        const projectVersion = projectManifest?.version as string | null;
        const serverVersion = serverManifest?.version as string | null;
        const hasProjectContent = this.hasProjectContent();

        if (!hasProjectContent) {
            return {
                hasProjectContent: false,
                projectVersion: null,
                serverVersion,
                isCompatible: true,
                needsUpdate: false,
                message: "Usando conteúdo do servidor (builtin).",
            };
        }

        if (!projectVersion || !serverVersion) {
            return {
                hasProjectContent: true,
                projectVersion,
                serverVersion,
                isCompatible: true,
                needsUpdate: false,
                message: "Sem informação de versão disponível.",
            };
        }

        // Comparar versões major.minor.patch
        const [pMajor, pMinor] = projectVersion.split(".").map(Number);
        const [sMajor, sMinor] = serverVersion.split(".").map(Number);

        const isCompatible = pMajor === sMajor;
        const needsUpdate = pMinor < sMinor || (pMajor < sMajor);

        return {
            hasProjectContent: true,
            projectVersion,
            serverVersion,
            isCompatible,
            needsUpdate,
            message: needsUpdate
                ? `Conteúdo local desatualizado (${projectVersion} vs ${serverVersion}). Execute 'npx @maestro-ai/cli' para atualizar.`
                : `Conteúdo local atualizado (${projectVersion}).`,
        };
    }
}

/**
 * Factory function para criar ContentResolverService.
 */
export function createContentResolver(diretorio: string): ContentResolverService {
    return new ContentResolverService(diretorio);
}
