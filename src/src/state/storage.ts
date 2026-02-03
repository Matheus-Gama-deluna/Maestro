import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { EstadoProjeto } from "../types/index.js";

const ESTADO_FILENAME = "estado.json";
const MAESTRO_DIR = ".maestro";

/**
 * Obtém caminho do arquivo de estado
 */
function getEstadoPath(diretorio: string): string {
    return join(diretorio, MAESTRO_DIR, ESTADO_FILENAME);
}

/**
 * Carrega estado do projeto
 */
export async function carregarEstado(diretorio: string): Promise<EstadoProjeto | null> {
    try {
        const path = getEstadoPath(diretorio);
        const conteudo = await readFile(path, "utf-8");
        return JSON.parse(conteudo) as EstadoProjeto;
    } catch {
        return null;
    }
}

/**
 * Salva estado do projeto
 */
export async function salvarEstado(diretorio: string, estado: EstadoProjeto): Promise<void> {
    const maestroDir = join(diretorio, MAESTRO_DIR);
    await mkdir(maestroDir, { recursive: true });

    estado.atualizado_em = new Date().toISOString();

    const path = getEstadoPath(diretorio);
    await writeFile(path, JSON.stringify(estado, null, 2), "utf-8");
}

/**
 * Cria estado inicial do projeto
 */
export function criarEstadoInicial(
    projetoId: string,
    nome: string,
    diretorio: string,
    ide?: 'windsurf' | 'cursor' | 'antigravity'
): EstadoProjeto {
    return {
        projeto_id: projetoId,
        nome,
        diretorio,
        nivel: "medio", // Será reclassificado após PRD
        tipo_fluxo: "novo_projeto",
        fase_atual: 1,
        total_fases: 10, // Será ajustado após classificação
        entregaveis: {},
        gates_validados: [],
        usar_stitch: false,
        stitch_confirmado: false, // Aguarda resposta do usuário sobre Stitch
        // Novos campos de classificação
        tipo_artefato: "product",
        tier_gate: "base",
        classificacao_confirmada: false,
        ide, // IDE utilizada no projeto

        // Campos de confirmação de classificação
        aguardando_classificacao: false,
        classificacao_pos_prd_confirmada: false,

        // Campos de proteção de gate
        aguardando_aprovacao: false,
        motivo_bloqueio: undefined,
        score_bloqueado: undefined,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
    };
}

/**
 * Serializa estado para JSON (modo stateless - retorna ao invés de salvar)
 */
export function serializarEstado(estado: EstadoProjeto): {
    path: string;
    content: string;
} {
    const estadoAtualizado = {
        ...estado,
        atualizado_em: new Date().toISOString()
    };
    return {
        path: ".maestro/estado.json",
        content: JSON.stringify(estadoAtualizado, null, 2)
    };
}

/**
 * Parseia estado de JSON string
 */
export function parsearEstado(json: string): EstadoProjeto | null {
    try {
        return JSON.parse(json) as EstadoProjeto;
    } catch {
        return null;
    }
}

/**
 * Registra entregável no estado
 */
export async function registrarEntregavel(
    diretorio: string,
    fase: number,
    caminho: string
): Promise<void> {
    const estado = await carregarEstado(diretorio);
    if (!estado) {
        throw new Error("Estado do projeto não encontrado");
    }

    estado.entregaveis[`fase_${fase}`] = caminho;
    await salvarEstado(diretorio, estado);
}

/**
 * Avança para próxima fase
 */
export async function avancarFase(diretorio: string): Promise<EstadoProjeto> {
    const estado = await carregarEstado(diretorio);
    if (!estado) {
        throw new Error("Estado do projeto não encontrado");
    }

    if (estado.fase_atual < estado.total_fases) {
        estado.fase_atual += 1;
        await salvarEstado(diretorio, estado);
    }

    return estado;
}

/**
 * Marca gate como validado
 */
export async function marcarGateValidado(
    diretorio: string,
    fase: number
): Promise<void> {
    const estado = await carregarEstado(diretorio);
    if (!estado) {
        throw new Error("Estado do projeto não encontrado");
    }

    if (!estado.gates_validados.includes(fase)) {
        estado.gates_validados.push(fase);
        await salvarEstado(diretorio, estado);
    }
}
