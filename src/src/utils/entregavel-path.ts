import { existsSync } from "fs";
import { join } from "path";
import type { EstadoProjeto, Fase } from "../types/index.js";

/**
 * PADRÃO CANÔNICO: Gera o nome do diretório de uma fase.
 * Formato: fase-XX-nome-da-fase
 * Exemplo: fase-01-produto, fase-05-banco-de-dados
 *
 * Esta é a ÚNICA fonte de verdade para nomes de pasta de fase.
 * Todos os outros módulos (salvar.ts, gate-orientation.ts, proximo.ts) devem importar e usar esta função.
 */
export function getFaseDirName(fase: number, faseNome: string): string {
    const num = fase.toString().padStart(2, "0");
    const slug = faseNome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove acentos
        .replace(/\s+/g, '-')                                // espaços → hífens
        .replace(/[^a-z0-9-]/g, '');                        // remove caracteres especiais
    return `fase-${num}-${slug}`;
}

/**
 * Constrói path canônico: docs/fase-XX-nome/entregavel
 * Exemplo: docs/fase-01-produto/PRD.md
 */
function construirPathDinamico(
    diretorio: string,
    fase: number,
    faseInfo: Fase
): string {
    return join(diretorio, "docs", getFaseDirName(fase, faseInfo.nome), faseInfo.entregavel_esperado);
}

/**
 * Constrói path legado: .maestro/entregaveis/entregavel
 * Exemplo: .maestro/entregaveis/PRD.md
 */
function construirPathLegado(
    diretorio: string,
    faseInfo: Fase
): string {
    return join(diretorio, ".maestro", "entregaveis", faseInfo.entregavel_esperado);
}

/**
 * Constrói path convencional legado: docs/XX-nome/entregavel
 * Mantido APENAS para resolver projetos antigos — NÃO usar para criar novos paths.
 * @deprecated Use getFaseDirName() + construirPathDinamico() para novos arquivos.
 */
function construirPathConvencional(
    diretorio: string,
    fase: number,
    faseInfo: Fase
): string {
    const faseDirName = `${fase.toString().padStart(2, "0")}-${faseInfo.nome.toLowerCase().replace(/\s/g, "-")}`;
    return join(diretorio, "docs", faseDirName, faseInfo.entregavel_esperado);
}

/**
 * Resolve o caminho do entregável tentando múltiplas convenções.
 * 
 * Ordem de prioridade:
 * 1. estado.entregaveis[fase_X] — caminho salvo previamente pelo proximo()
 * 2. docs/fase-XX-nome/entregavel — path dinâmico (padrão atual do avancar.ts)
 * 3. docs/XX-nome/entregavel — path convencional (documentado no GEMINI.md)
 * 4. .maestro/entregaveis/entregavel — formato legado
 * 
 * @param diretorio - Diretório raiz do projeto
 * @param fase - Número da fase atual
 * @param faseInfo - Informações da fase (nome, entregavel_esperado, etc)
 * @param estado - Estado do projeto (para acessar estado.entregaveis)
 * @returns Caminho absoluto do arquivo se encontrado, null caso contrário
 */
export function resolverPathEntregavel(
    diretorio: string,
    fase: number,
    faseInfo: Fase,
    estado: EstadoProjeto
): string | null {
    // 1. Tentar caminho salvo no estado (prioridade máxima)
    const chaveNova = `fase_${fase}`;
    const chaveLegacy = fase.toString();
    const caminhoSalvo = estado.entregaveis?.[chaveNova] || estado.entregaveis?.[chaveLegacy];

    if (caminhoSalvo) {
        // Verificar se é caminho absoluto ou relativo
        let caminhoCompleto: string;

        if (caminhoSalvo.includes('/') || caminhoSalvo.includes('\\')) {
            // Caminho completo ou relativo
            if (caminhoSalvo.startsWith(diretorio)) {
                caminhoCompleto = caminhoSalvo;
            } else {
                caminhoCompleto = join(diretorio, caminhoSalvo);
            }
        } else {
            // Apenas nome do arquivo (formato legado)
            caminhoCompleto = join(diretorio, ".maestro", "entregaveis", caminhoSalvo);
        }

        if (existsSync(caminhoCompleto)) {
            return caminhoCompleto;
        }
    }

    // 2. Tentar path dinâmico (docs/fase-XX-nome/)
    const pathDinamico = construirPathDinamico(diretorio, fase, faseInfo);
    if (existsSync(pathDinamico)) {
        return pathDinamico;
    }

    // 3. Tentar path convencional (docs/XX-nome/)
    const pathConvencional = construirPathConvencional(diretorio, fase, faseInfo);
    if (existsSync(pathConvencional)) {
        return pathConvencional;
    }

    // 4. Tentar path legado (.maestro/entregaveis/)
    const pathLegado = construirPathLegado(diretorio, faseInfo);
    if (existsSync(pathLegado)) {
        return pathLegado;
    }

    // Nenhum arquivo encontrado
    return null;
}

/**
 * Gera lista de paths esperados para mensagem de erro
 */
export function listarPathsEsperados(
    diretorio: string,
    fase: number,
    faseInfo: Fase
): string[] {
    return [
        construirPathDinamico(diretorio, fase, faseInfo),
        construirPathConvencional(diretorio, fase, faseInfo),
        construirPathLegado(diretorio, faseInfo)
    ];
}
