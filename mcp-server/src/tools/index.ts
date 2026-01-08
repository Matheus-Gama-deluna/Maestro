import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Tools básicas
import { iniciarProjeto, iniciarProjetoSchema } from "./iniciar-projeto.js";
import { proximo, proximoSchema } from "./proximo.js";
import { status, statusSchema } from "./status.js";
import { validarGate, validarGateSchema } from "./validar-gate.js";

// Tools v1.0
import { classificar, classificarSchema } from "./classificar.js";
import { contexto, contextoSchema } from "./contexto.js";
import { salvar, salvarSchema } from "./salvar.js";
import { implementarHistoria, implementarHistoriaSchema } from "./implementar-historia.js";

// Tools de fluxos alternativos
import { novaFeature, novaFeatureSchema, corrigirBug, corrigirBugSchema, refatorar, refatorarSchema } from "./fluxos-alternativos.js";

// Tools de análise
import { analisarSeguranca, analisarSegurancaSchema } from "./analise/seguranca.js";
import { analisarQualidade, analisarQualidadeSchema } from "./analise/qualidade.js";
import { analisarPerformance, analisarPerformanceSchema } from "./analise/performance.js";
import { gerarRelatorio, gerarRelatorioSchema } from "./analise/relatorio.js";

/**
 * Registra todas as tools no servidor MCP
 */
export function registerTools(server: Server) {
    // Listar tools disponíveis
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            // === CORE ===
            {
                name: "iniciar_projeto",
                description: "Inicia um novo projeto com o Maestro. Cria estrutura de pastas e carrega primeiro especialista.",
                inputSchema: iniciarProjetoSchema,
            },
            {
                name: "proximo",
                description: "Salva o entregável atual, valida o gate e avança para a próxima fase. Use quando o dev disser 'próximo', 'avançar' ou 'terminei'.",
                inputSchema: proximoSchema,
            },
            {
                name: "status",
                description: "Retorna status completo do projeto: fase atual, progresso, entregáveis gerados.",
                inputSchema: statusSchema,
            },
            {
                name: "validar_gate",
                description: "Valida o checklist de saída da fase atual ou específica.",
                inputSchema: validarGateSchema,
            },
            // === V1.0 ===
            {
                name: "classificar",
                description: "Reclassifica a complexidade do projeto baseado no PRD ou manualmente.",
                inputSchema: classificarSchema,
            },
            {
                name: "contexto",
                description: "Retorna contexto acumulado do projeto para manter consistência entre fases.",
                inputSchema: contextoSchema,
            },
            {
                name: "salvar",
                description: "Salva conteúdo (rascunho, anexo ou entregável) sem avançar de fase.",
                inputSchema: salvarSchema,
            },
            {
                name: "implementar_historia",
                description: "Orquestra a implementação de uma história de usuário em blocos (Frontend First).",
                inputSchema: implementarHistoriaSchema,
            },
            // === FLUXOS ALTERNATIVOS ===
            {
                name: "nova_feature",
                description: "Inicia fluxo de desenvolvimento de nova feature (6 fases).",
                inputSchema: novaFeatureSchema,
            },
            {
                name: "corrigir_bug",
                description: "Inicia fluxo de correção de bug (5 fases).",
                inputSchema: corrigirBugSchema,
            },
            {
                name: "refatorar",
                description: "Inicia fluxo de refatoração de código legado (6 fases).",
                inputSchema: refatorarSchema,
            },
            // === ANÁLISE ===
            {
                name: "analisar_seguranca",
                description: "Analisa código em busca de vulnerabilidades OWASP Top 10.",
                inputSchema: analisarSegurancaSchema,
            },
            {
                name: "analisar_qualidade",
                description: "Analisa qualidade do código, complexidade e padrões.",
                inputSchema: analisarQualidadeSchema,
            },
            {
                name: "analisar_performance",
                description: "Detecta problemas de performance e anti-patterns.",
                inputSchema: analisarPerformanceSchema,
            },
            {
                name: "gerar_relatorio",
                description: "Gera relatório consolidado de todas as análises com score.",
                inputSchema: gerarRelatorioSchema,
            },
        ],
    }));

    // Executar tools
    server.setRequestHandler(CallToolRequestSchema, async (request) => {

        const { name, arguments: args } = request.params;
        const typedArgs = args as Record<string, unknown> | undefined;

        try {
            switch (name) {
                // Core
                case "iniciar_projeto":
                    return await iniciarProjeto({
                        nome: typedArgs?.nome as string,
                        descricao: typedArgs?.descricao as string | undefined,
                        diretorio: typedArgs?.diretorio as string | undefined,
                    });

                case "proximo":
                    return await proximo({
                        entregavel: typedArgs?.entregavel as string,
                        forcar: typedArgs?.forcar as boolean | undefined,
                        nome_arquivo: typedArgs?.nome_arquivo as string | undefined,
                        diretorio: typedArgs?.diretorio as string | undefined,
                    });

                case "status":
                    return await status({
                        diretorio: typedArgs?.diretorio as string | undefined,
                    });

                case "validar_gate":
                    return await validarGate({
                        fase: typedArgs?.fase as number | undefined,
                        entregavel: typedArgs?.entregavel as string | undefined,
                    });

                // V1.0
                case "classificar":
                    return await classificar({
                        prd: typedArgs?.prd as string | undefined,
                        nivel: typedArgs?.nivel as "simples" | "medio" | "complexo" | undefined,
                    });

                case "contexto":
                    return await contexto();

                case "salvar":
                    return await salvar({
                        conteudo: typedArgs?.conteudo as string,
                        tipo: typedArgs?.tipo as "rascunho" | "anexo" | "entregavel",
                        nome_arquivo: typedArgs?.nome_arquivo as string | undefined,
                        diretorio: typedArgs?.diretorio as string | undefined,
                    });

                case "implementar_historia":
                    return await implementarHistoria({
                        historia_id: typedArgs?.historia_id as string | undefined,
                        modo: typedArgs?.modo as "analisar" | "iniciar" | "proximo_bloco" | undefined,
                    });

                // Fluxos Alternativos
                case "nova_feature":
                    return await novaFeature({
                        descricao: typedArgs?.descricao as string,
                        impacto_estimado: typedArgs?.impacto_estimado as "baixo" | "medio" | "alto" | undefined,
                    });

                case "corrigir_bug":
                    return await corrigirBug({
                        descricao: typedArgs?.descricao as string,
                        severidade: typedArgs?.severidade as "critica" | "alta" | "media" | "baixa" | undefined,
                        ticket_id: typedArgs?.ticket_id as string | undefined,
                    });

                case "refatorar":
                    return await refatorar({
                        area: typedArgs?.area as string,
                        motivo: typedArgs?.motivo as string,
                    });

                // Análise
                case "analisar_seguranca":
                    return await analisarSeguranca({
                        codigo: typedArgs?.codigo as string | undefined,
                        arquivo: typedArgs?.arquivo as string | undefined,
                    });

                case "analisar_qualidade":
                    return await analisarQualidade({
                        codigo: typedArgs?.codigo as string | undefined,
                        arquivo: typedArgs?.arquivo as string | undefined,
                    });

                case "analisar_performance":
                    return await analisarPerformance({
                        codigo: typedArgs?.codigo as string | undefined,
                        arquivo: typedArgs?.arquivo as string | undefined,
                    });

                case "gerar_relatorio":
                    return await gerarRelatorio({
                        codigo: typedArgs?.codigo as string | undefined,
                        arquivo: typedArgs?.arquivo as string | undefined,
                        formato: typedArgs?.formato as "completo" | "resumido" | undefined,
                    });

                default:
                    return {
                        content: [{ type: "text" as const, text: `❌ Tool não encontrada: ${name}` }],
                        isError: true,
                    };
            }
        } catch (error) {
            return {
                content: [{ type: "text" as const, text: `❌ Erro: ${String(error)}` }],
                isError: true,
            };
        }
    });
}
