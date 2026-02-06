/**
 * Response types for stateless MCP architecture
 * Files are returned to the AI for saving instead of being written directly
 */

/**
 * Represents a file that the AI should save
 */
export interface FileToSave {
    /** Relative path from project root (e.g., ".maestro/estado.json") */
    path: string;
    /** File content */
    content: string;
    /** Encoding (default: utf-8) */
    encoding?: string;
}

/**
 * Instrução programática do próximo passo para a IA
 */
export interface NextAction {
    /** Nome da tool a chamar */
    tool: string;
    /** Descrição do que fazer */
    description: string;
    /** Template de argumentos para a próxima chamada */
    args_template: Record<string, unknown>;
    /** Se precisa de input do usuário antes de executar */
    requires_user_input: boolean;
    /** Pergunta para fazer ao usuário (se requires_user_input=true) */
    user_prompt?: string;
    /** Se true, IA pode executar sem perguntar ao usuário */
    auto_execute?: boolean;
}

/**
 * Persona de especialista que a IA deve assumir
 */
export interface SpecialistPersona {
    /** Nome do especialista */
    name: string;
    /** Tom de comunicação */
    tone: string;
    /** Áreas de expertise */
    expertise: string[];
    /** Instruções de comportamento */
    instructions: string;
}

/**
 * Progresso atual do fluxo
 */
export interface FlowProgress {
    /** Nome da fase atual */
    current_phase: string;
    /** Total de fases no fluxo */
    total_phases: number;
    /** Fases já completadas */
    completed_phases: number;
    /** Percentual de conclusão */
    percentage: number;
}

/**
 * Extended tool result with files to save
 */
export interface MaestroToolResult {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
    /** Files that the AI should save to the filesystem */
    files?: FileToSave[];
    /** Updated state JSON (for convenience) */
    estado_atualizado?: string;
    /** Instrução programática do próximo passo */
    next_action?: NextAction;
    /** Persona de especialista ativa */
    specialist_persona?: SpecialistPersona;
    /** Progresso do fluxo */
    progress?: FlowProgress;
}

/**
 * Helper to create a file-to-save object
 */
export function createFileToSave(path: string, content: string | object): FileToSave {
    return {
        path,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
        encoding: "utf-8"
    };
}

/**
 * Format files instruction for AI
 */
export function formatFilesInstruction(files: FileToSave[], baseDir: string): string {
    if (files.length === 0) return "";
    
    const filesList = files.map(f => `- \`${baseDir}/${f.path}\``).join("\n");
    
    return `
---

## 📁 Arquivos para Salvar

A IA deve salvar os seguintes arquivos no projeto:

${filesList}

> **Instruções para a IA**: Use \`write_to_file\` para criar cada arquivo acima.
> Os conteúdos estão no campo \`files\` da resposta desta tool.
`;
}
