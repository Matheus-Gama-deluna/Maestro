import * as fs from 'fs/promises';
import * as path from 'path';
import { parsearEstado } from "../state/storage.js";
import { getFluxoComStitch } from "../flows/types.js";
import { KnowledgeBase } from "../core/knowledge/KnowledgeBase.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

// v6.3 S3.1: Fases que disparam geração automática de ADR (expandido)
const FASES_ARQUITETURAIS = new Set([
    'Arquitetura',
    'Arquitetura Avançada',
    'Banco de Dados',
    'Segurança',
    'Contrato API',
    'Requisitos',
    'Modelo de Domínio',
]);

// Padrões regex para detectar decisões arquiteturais no texto.
// NOTA: Só captura frases iniciadas no começo de linhas comuns — evita fragmentar
// títulos de seções markdown (###) ou linhas de checklist (- [x]).
const PADROES_DECISAO = [
    /^(?![-#*\[\|>])\w.*?\b(?:decidimos?\s+(?:usar?|utilizar?|adotar?)\s+)([^.\n]{15,120})/gim,
    /^(?![-#*\[\|>])\w.*?\b(?:escolhemos?\s+)([^.\n]{15,120})(?:\s+por\s+[^.\n]+)?/gim,
    /^(?![-#*\[\|>])\w.*?\b(?:adotamos?\s+)([^.\n]{15,120})/gim,
    /^(?![-#*\[\|>])\w.*?\b(?:usaremos?\s+)([^.\n]{15,120})/gim,
    /^(?![-#*\[\|>])\w.*?\b(?:optamos?\s+por\s+)([^.\n]{15,120})/gim,
];

interface ADR {
    id: string;
    titulo: string;
    fase: string;
    decisao: string;
    contexto: string;
    timestamp: string;
    status: 'proposto' | 'aceito' | 'depreciado';
}

export function withADRGeneration(handler: ToolHandler): ToolHandler {
    return async (args: Record<string, unknown>) => {
        const result = await handler(args);

        // Só gerar ADR se a operação foi bem-sucedida
        if (result.isError) return result;

        const diretorio = args.diretorio as string | undefined;
        if (!diretorio) return result;

        // Ler estado — preferir estado atualizado (pós-persistência)
        const estadoJson = result.estado_atualizado || (args.estado_json as string | undefined);
        // Guard: garantir que é string válida antes de parsear
        if (!estadoJson || typeof estadoJson !== 'string') return result;

        try {
            const estado = parsearEstado(estadoJson);
            if (!estado) return result;

            // Verificar se a fase anterior (que acabou de ser concluída) é arquitetural
            // A fase_atual já avançou, então a fase concluída é a anterior
            const faseConcluidaNum = estado.fase_atual - 1;
            if (faseConcluidaNum < 1) return result;

            // v6.2: Usar getFluxoComStitch para obter nome correto da fase
            // (estado.fases não existe — o estado usa nivel + fase_atual)
            const nomeFaseConcluida = (args.nomeFaseConcluida as string) ||
                inferirNomeFase(estado, faseConcluidaNum);

            if (!nomeFaseConcluida || !FASES_ARQUITETURAIS.has(nomeFaseConcluida)) return result;

            // P4: Evitar re-gerar ADRs para a mesma fase (cada re-submissão gera duplicatas)
            const adrsDir = path.join(diretorio, '.maestro', 'adrs');
            const indiceArquivo = path.join(adrsDir, 'INDEX.md');
            try {
                const indice = await fs.readFile(indiceArquivo, 'utf-8');
                const faseSlug = nomeFaseConcluida.toLowerCase().replace(/\s+/g, '-');
                if (indice.includes(`fase: ${nomeFaseConcluida}`) || indice.includes(faseSlug)) {
                    console.log(`[ADRGeneration] Fase "${nomeFaseConcluida}" já processada — ignorando.`);
                    return result;
                }
            } catch { /* INDEX.md ainda não existe — pode gerar */ }

            // Extrair entregável dos args (guard: deve ser string com conteúdo)
            const entregavel = args.entregavel;
            if (!entregavel || typeof entregavel !== 'string' || entregavel.length < 100) return result;

            // Extrair decisões do entregável
            const decisoes = extrairDecisoes(entregavel, nomeFaseConcluida);
            if (decisoes.length === 0) return result;

            // Salvar ADRs no diretório do projeto (arquivos .md)
            await salvarADRs(diretorio, decisoes, nomeFaseConcluida);

            // v6.3 S3.2: Persistir ADRs no KnowledgeBase para consulta futura
            await persistirNoKnowledgeBase(diretorio, decisoes, faseConcluidaNum);

            console.log(`[ADRGeneration] ${decisoes.length} ADR(s) gerados para fase: ${nomeFaseConcluida}`);

            // Adicionar nota ao resultado sobre ADRs gerados
            if (result.content?.[0]?.text) {
                result.content[0].text +=
                    `\n\n---\n\n📋 **${decisoes.length} ADR(s) gerado(s) automaticamente** em \`.maestro/adrs/\`\n` +
                    decisoes.map(d => `- ${d.id}: ${d.titulo}`).join('\n') +
                    `\n\n> 💡 Use \`contexto()\` para ver todas as decisões acumuladas do projeto.`;
            }

        } catch (error) {
            // ADR generation é best-effort — não bloqueia o fluxo
            console.warn('[ADRGeneration] Falha ao gerar ADRs (non-blocking):', error);
        }

        return result;
    };
}

/**
 * v6.2: Infere o nome da fase usando getFluxoComStitch ao invés de estado.fases
 * (que não existe no tipo EstadoProjeto)
 */
function inferirNomeFase(estado: any, faseNum: number): string {
    try {
        const nivel = estado.nivel as 'simples' | 'medio' | 'complexo' | undefined;
        const usarStitch = estado.usar_stitch as boolean | undefined;
        if (!nivel) return '';

        const fluxo = getFluxoComStitch(nivel, usarStitch ?? false);
        const fase = fluxo.fases.find((f) => f.numero === faseNum);
        return fase?.nome || '';
    } catch {
        return '';
    }
}

function extrairDecisoes(entregavel: string, nomeFase: string): ADR[] {
    const decisoes: ADR[] = [];
    const vistas = new Set<string>();

    for (const padrao of PADROES_DECISAO) {
        padrao.lastIndex = 0; // Reset regex state
        let match;
        while ((match = padrao.exec(entregavel)) !== null) {
            const decisaoTexto = match[1]?.trim();
            if (!decisaoTexto || decisaoTexto.length < 5) continue;

            // Evitar duplicatas
            const chave = decisaoTexto.toLowerCase().slice(0, 50);
            if (vistas.has(chave)) continue;
            vistas.add(chave);

            // Extrair contexto (linha anterior à decisão)
            const posicao = match.index;
            const textoAntes = entregavel.slice(Math.max(0, posicao - 200), posicao);
            const linhasAntes = textoAntes.split('\n');
            const contexto = linhasAntes[linhasAntes.length - 2]?.trim() || '';

            const id = `ADR-${String(decisoes.length + 1).padStart(3, '0')}`;
            decisoes.push({
                id,
                titulo: decisaoTexto.slice(0, 80),
                fase: nomeFase,
                decisao: decisaoTexto,
                contexto,
                timestamp: new Date().toISOString(),
                status: 'aceito'
            });

            // Limitar a 10 ADRs por fase para evitar ruído
            if (decisoes.length >= 10) break;
        }
        if (decisoes.length >= 10) break;
    }

    return decisoes;
}

/**
 * v6.3 S3.2: Persiste ADRs no KnowledgeBase para consulta via contexto()
 */
async function persistirNoKnowledgeBase(diretorio: string, adrs: ADR[], faseNum: number): Promise<void> {
    try {
        const kb = new KnowledgeBase(diretorio);
        for (const adr of adrs) {
            await kb.record({
                id: adr.id,
                type: 'adr',
                content: {
                    decision: adr.decisao,
                    context: adr.contexto,
                    alternatives: [],
                    consequences: { positive: [], negative: [] },
                },
                metadata: {
                    fase: faseNum,
                    timestamp: adr.timestamp,
                    tags: [adr.fase.toLowerCase().replace(/\s+/g, '-'), 'auto-generated'],
                    relevance: 0.8,
                },
            });
        }
    } catch (err) {
        // KnowledgeBase é best-effort — não bloqueia o fluxo
        console.warn('[ADRGeneration] Falha ao persistir no KnowledgeBase (non-blocking):', err);
    }
}

async function salvarADRs(diretorio: string, adrs: ADR[], nomeFase: string): Promise<void> {
    const adrsDir = path.join(diretorio, '.maestro', 'adrs');
    await fs.mkdir(adrsDir, { recursive: true });

    for (const adr of adrs) {
        const nomeArquivo = `${adr.id}-${nomeFase.toLowerCase().replace(/\s+/g, '-')}.md`;
        const caminhoArquivo = path.join(adrsDir, nomeArquivo);

        const conteudo = `# ${adr.id}: ${adr.titulo}

**Status:** ${adr.status}  
**Fase:** ${adr.fase}  
**Data:** ${new Date(adr.timestamp).toLocaleDateString('pt-BR')}

## Contexto

${adr.contexto || 'Extraído automaticamente do entregável da fase.'}

## Decisão

${adr.decisao}

## Consequências

> ⚠️ Este ADR foi gerado automaticamente. Revise e complemente com consequências e alternativas consideradas.

---
*Gerado automaticamente pelo MCP Maestro v6.1 — withADRGeneration*
`;

        await fs.writeFile(caminhoArquivo, conteudo, 'utf-8');
    }

    // Atualizar índice de ADRs
    const indiceArquivo = path.join(adrsDir, 'INDEX.md');
    let indice = '# Índice de ADRs\n\n';
    try {
        indice = await fs.readFile(indiceArquivo, 'utf-8');
    } catch { /* arquivo não existe ainda */ }

    for (const adr of adrs) {
        const linha = `- [${adr.id}](${adr.id}-${nomeFase.toLowerCase().replace(/\s+/g, '-')}.md): ${adr.titulo}\n`;
        if (!indice.includes(adr.id)) {
            indice += linha;
        }
    }

    await fs.writeFile(indiceArquivo, indice, 'utf-8');
}
