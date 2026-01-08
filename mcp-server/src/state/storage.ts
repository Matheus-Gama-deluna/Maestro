import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { EstadoProjeto } from "../types/index.js";

const ESTADO_FILENAME = "estado.json";
const GUIA_DIR = ".guia";

/**
 * Obtém caminho do arquivo de estado
 */
function getEstadoPath(diretorio: string): string {
    return join(diretorio, GUIA_DIR, ESTADO_FILENAME);
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
    const guiaDir = join(diretorio, GUIA_DIR);
    await mkdir(guiaDir, { recursive: true });

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
    diretorio: string
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
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
    };
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
