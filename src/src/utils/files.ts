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
 * Obtém o diretório de content (SEMPRE do servidor para recursos internos)
 */
function getServerContentDir(): string {
    try {
        return getBuiltinContentDir();
    } catch {
        return SERVER_CONTENT_ROOT;
    }
}

/**
 * Normaliza nome de especialista para formato de skill
 * Ex: "Gestão de Produto" → "gestao-produto"
 * Remove acentos, espaços, pontuação
 */
function removerStopwords(nomeNormalizado: string): string {
    return nomeNormalizado
        .replace(/-(de|da|do|das|dos)-/g, '-')
        .replace(/^(de|da|do|das|dos)-/, '')
        .replace(/-(de|da|do|das|dos)$/,'')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizarNomeEspecialista(nome: string): string {
    const trimmed = nome.trim();

    return removerStopwords(
        trimmed
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^\w\s-]/g, '') // Remove pontuação
            .replace(/\s+/g, '-') // Espaços → hífens
            .replace(/-+/g, '-') // Múltiplos hífens → um
            .replace(/^-+|-+$/g, '') // Remove hífens residuais das extremidades
    );
}

/**
 * Mapa de aliases para especialistas (compatibilidade com nomes antigos)
 * Mapeia nomes "humanos" para nomes de skill
 */
const ESPECIALISTA_SKILL_MAP: Record<string, string> = {
    // Fluxo Simples
    "gestao-produto": "specialist-gestao-produto",
    "engenharia-de-requisitos": "specialist-engenharia-requisitos-ia",
    "ux-design": "specialist-ux-design",
    "arquitetura-de-software": "specialist-arquitetura-software",
    "plano-de-execucao": "specialist-plano-execucao-ia",
    "desenvolvimento-frontend": "specialist-desenvolvimento-frontend",
    "desenvolvimento-backend": "specialist-desenvolvimento-backend",
    "desenvolvimento": "specialist-desenvolvimento-backend",
    
    // Fluxo Médio
    "modelagem-de-dominio": "specialist-modelagem-dominio",
    "banco-de-dados": "specialist-banco-dados",
    "seguranca": "specialist-seguranca-informacao",
    "seguranca-da-informacao": "specialist-seguranca-informacao",
    "analise-de-testes": "specialist-analise-testes",
    "contrato-api": "specialist-contrato-api",
    "devops": "specialist-devops-infra",
    "integracao": "specialist-devops-infra",
    
    // Fluxo Complexo
    "arquitetura-avancada": "specialist-arquitetura-avancada",
    "performance": "specialist-performance-escalabilidade",
    "escalabilidade": "specialist-performance-escalabilidade",
    "observabilidade": "specialist-observabilidade",
    
    // Complementares
    "dados-e-analytics": "specialist-dados-analytics-ia",
    "acessibilidade": "specialist-acessibilidade",
    "debugging": "specialist-debugging-troubleshooting",
    "documentacao": "specialist-documentacao-tecnica",
    "exploracao": "specialist-exploracao-codebase",
    "migracao": "specialist-migracao-modernizacao",
    "mobile": "specialist-desenvolvimento-mobile",
    "mobile-design": "specialist-mobile-design-avancado",
    "prototipagem": "specialist-prototipagem-stitch",
};

/**
 * Lê conteúdo de um especialista (apenas servidor)
 * Agora busca em skills/{skill-name}/SKILL.md
 * Suporta normalização de nomes e aliases
 */
export async function lerEspecialista(nome: string): Promise<string> {
    const contentRoot = getServerContentDir();
    const skillsDir = join(contentRoot, "skills");
    
    try {
        const skillFolders = await readdir(skillsDir);
        
        // Estratégia 1: Buscar por alias exato (compatibilidade)
        const nomeNormalizado = normalizarNomeEspecialista(nome);
        const nomeSemHifen = nomeNormalizado.replace(/-/g, '');
        let skillFolder: string | undefined = ESPECIALISTA_SKILL_MAP[nomeNormalizado];
        
        // Estratégia 2: Se não encontrou por alias, buscar por matching fuzzy
        if (!skillFolder) {
            skillFolder = skillFolders.find(f => {
                const folderNormalizado = normalizarNomeEspecialista(f.replace('specialist-', ''));
                return folderNormalizado === nomeNormalizado;
            });
        }
        
        // Estratégia 3: Fallback para includes (compatibilidade com versão anterior)
        if (!skillFolder) {
            skillFolder = skillFolders.find(f => {
                const folderNormalizado = normalizarNomeEspecialista(f.replace('specialist-', ''));
                const folderSemHifen = folderNormalizado.replace(/-/g, '');
                return folderNormalizado === nomeNormalizado
                    || folderSemHifen === nomeSemHifen
                    || folderNormalizado.includes(nomeNormalizado)
                    || nomeNormalizado.includes(folderNormalizado)
                    || folderSemHifen.includes(nomeSemHifen)
                    || nomeSemHifen.includes(folderSemHifen);
            });
        }

        if (!skillFolder) {
            // Erro detalhado com sugestões
            const skillsDisponiveis = skillFolders
                .filter(f => f.startsWith('specialist-'))
                .map(f => f.replace('specialist-', '').replace(/-/g, ' '))
                .join(', ');
            
            throw new Error(
                `Skill não encontrada para especialista: "${nome}"\n\n` +
                `Skills disponíveis: ${skillsDisponiveis || 'nenhuma'}\n\n` +
                `Dica: Verifique se a skill está carregada em content/skills no projeto.`
            );
        }

        // Lê o arquivo SKILL.md da pasta
        const skillPath = join(skillsDir, skillFolder, "SKILL.md");
        
        if (!existsSync(skillPath)) {
            throw new Error(`Arquivo SKILL.md não encontrado em: ${skillFolder}`);
        }
        
        return readFile(skillPath, "utf-8");
    } catch (error) {
        throw new Error(`Erro ao ler especialista ${nome}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Lê conteúdo de um template (apenas servidor)
 */
export async function lerTemplate(nome: string): Promise<string> {
    const contentRoot = getServerContentDir();
    const templatesDir = join(contentRoot, "templates");
    
    const files = await readdir(templatesDir);

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
 * Lê conteúdo de um prompt (apenas servidor)
 */
export async function lerPrompt(categoria: string, nome: string): Promise<string> {
    const contentRoot = getServerContentDir();
    const path = join(contentRoot, "prompts", categoria, `${nome}.md`);
    return await readFile(path, "utf-8");
}

/**
 * Lê conteúdo de um guia (apenas servidor)
 */
export async function lerGuia(nome: string): Promise<string> {
    const contentRoot = getServerContentDir();
    const guiasDir = join(contentRoot, "guides");
    
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
 * Lista arquivos markdown em um diretório dentro de content (servidor)
 */
export async function listarArquivos(subdir: string): Promise<string[]> {
    const contentRoot = getServerContentDir();
    const dir = join(contentRoot, subdir);
    
    try {
        const entries = await readdir(dir);
        return entries.filter(e => e.endsWith(".md"));
    } catch {
        return [];
    }
}

/**
 * Lista especialistas disponíveis
 * Agora lista skills ao invés de specialists
 */
export async function listarEspecialistas(): Promise<string[]> {
    const contentRoot = getServerContentDir();
    const skillsDir = join(contentRoot, "skills");
    
    try {
        const entries = await readdir(skillsDir, { withFileTypes: true });
        const skillFolders = entries
            .filter(e => e.isDirectory())
            .map(e => e.name);
        
        // Retorna nomes amigáveis (remove 'specialist-' prefix)
        return skillFolders.map(folder => {
            if (folder.startsWith('specialist-')) {
                return folder.replace('specialist-', '').split('-').map(w => 
                    w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' ');
            }
            return folder.split('-').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
        });
    } catch {
        return [];
    }
}

/**
 * Lista templates disponíveis
 */
export async function listarTemplates(): Promise<string[]> {
    const files = await listarArquivos("templates");
    return files.map(f => f.replace(".md", ""));
}

/**
 * Lista guias disponíveis
 */
export async function listarGuias(): Promise<string[]> {
    const files = await listarArquivos("guides");
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
 * Lê conteúdo de um exemplo de fluxo (apenas servidor)
 */
export async function lerExemplo(nome: string): Promise<string> {
    const contentRoot = getServerContentDir();
    const examplesDir = join(contentRoot, "examples");
    
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
}

/**
 * Lista exemplos disponíveis
 */
export async function listarExemplos(): Promise<string[]> {
    const files = await listarArquivos("examples");
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
        console.error(`[DEBUG] resolveProjectPath input: "${path}"`);
        console.error(`[DEBUG] normalized: "${normalized}"`);
    }

    // Se o path é Windows (Drive Letter) mas estamos no Linux (Docker/WSL)
    // Checks for "C:" at start OR "C:\" inside string (handling weird mounting)
    if (platform() !== 'win32' && (normalized.match(/^[a-zA-Z]:/) || normalized.includes(':\\'))) {
        console.error(`[DEBUG] Windows path detected on Linux. Mapping to CWD: ${process.cwd()}`);
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
 