import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Tools básicas
import { iniciarProjeto, iniciarProjetoSchema } from "./iniciar-projeto.js";
import { confirmarStitch, confirmarStitchSchema } from "./confirmar-stitch.js";
import { carregarProjeto, carregarProjetoSchema } from "./carregar-projeto.js";
import { proximo, proximoSchema } from "./proximo.js";
import { status, statusSchema } from "./status.js";
import { validarGate, validarGateSchema } from "./validar-gate.js";
import { setupInicial, setupInicialSchema } from "./setup-inicial.js";

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

// Tools de memória
import { atualizarCodebase, atualizarCodebaseSchema } from "./atualizar-codebase.js";

// Tools de qualidade
import { avaliarEntregavel, avaliarEntregavelSchema } from "./avaliar-entregavel.js";

// Tools de injeção de conteúdo
import { injetar_conteudo, injetarConteudoSchema } from "./injetar-conteudo.js";

// Tools de discovery
import { discovery, discoverySchema } from "./discovery.js";

/**
 * Registra todas as tools no servidor MCP
 */
export function registerTools(server: Server) {
    // Listar tools disponíveis
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            // === CORE (Stateless) ===
            {
                name: "setup_inicial",
                description: "Salva configuração global única do usuário (IDE, modo, preferências). Evita múltiplos prompts em projetos futuros.",
                inputSchema: setupInicialSchema,
            },
            {
                name: "iniciar_projeto",
                description: "Inicia um novo projeto com o Maestro. Retorna arquivos para a IA salvar e pergunta sobre Stitch. Requer diretorio.",
                inputSchema: iniciarProjetoSchema,
            },
            {
                name: "confirmar_stitch",
                description: "Confirma se o projeto usará prototipagem com Google Stitch. Deve ser chamada após iniciar_projeto com a resposta do usuário.",
                inputSchema: confirmarStitchSchema,
            },
            {
                name: "carregar_projeto",
                description: "Carrega um projeto existente. Requer estado_json (conteúdo de .maestro/estado.json) e diretorio.",
                inputSchema: carregarProjetoSchema,
            },
            {
                name: "proximo",
                description: "Valida entregável e avança para próxima fase. Requer entregavel, estado_json e diretorio. Retorna arquivos para IA salvar.",
                inputSchema: proximoSchema,
            },
            {
                name: "status",
                description: "Retorna status completo do projeto. Requer estado_json e diretorio.",
                inputSchema: statusSchema,
            },
            {
                name: "validar_gate",
                description: "Valida checklist de saída da fase. Requer estado_json e diretorio.",
                inputSchema: validarGateSchema,
            },
            // === V1.0 (Stateless) ===
            {
                name: "classificar",
                description: "Reclassifica complexidade do projeto. Requer estado_json e diretorio. Retorna arquivo para IA salvar.",
                inputSchema: classificarSchema,
            },
            {
                name: "contexto",
                description: "Retorna contexto acumulado do projeto. Requer estado_json e diretorio.",
                inputSchema: contextoSchema,
            },
            {
                name: "salvar",
                description: "Salva conteúdo sem avançar de fase. Requer conteudo, tipo, estado_json e diretorio. Retorna arquivo para IA salvar.",
                inputSchema: salvarSchema,
            },
            {
                name: "implementar_historia",
                description: "Orquestra implementação de história em blocos (Frontend First).",
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
            // === MEMÓRIA ===
            {
                name: "atualizar_codebase",
                description: "Atualiza informações do codebase para memória do projeto.",
                inputSchema: atualizarCodebaseSchema,
            },
            // === QUALIDADE ===
            {
                name: "avaliar_entregavel",
                description: "Avalia qualidade do entregável com score e sugestões. Use antes de proximo().",
                inputSchema: avaliarEntregavelSchema,
            },
            // === INJEÇÃO DE CONTEÚDO ===
            {
                name: "injetar_conteudo",
                description: "Injeta conteúdo base (especialistas, templates, guias) no projeto. Use force:true para sobrescrever.",
                inputSchema: injetarConteudoSchema,
            },
            // === DISCOVERY ===
            {
                name: "discovery",
                description: "Coleta informações iniciais agrupadas para reduzir prompts. Retorna questionário ou salva respostas.",
                inputSchema: discoverySchema,
            },
        ],
    }));

    // Executar tools
    server.setRequestHandler(CallToolRequestSchema, async (request) => {

        const { name, arguments: args } = request.params;
        const typedArgs = args as Record<string, unknown> | undefined;

        try {
            switch (name) {
                // Core (Stateless)
                case "setup_inicial":
                    return await setupInicial({
                        ide: typedArgs?.ide as 'windsurf' | 'cursor' | 'antigravity' | undefined,
                        modo: typedArgs?.modo as 'economy' | 'balanced' | 'quality' | undefined,
                        usar_stitch: typedArgs?.usar_stitch as boolean | undefined,
                        preferencias_stack: typedArgs?.preferencias_stack as any,
                        team_size: typedArgs?.team_size as 'solo' | 'pequeno' | 'medio' | 'grande' | undefined,
                    });

                case "iniciar_projeto":
                    return await iniciarProjeto({
                        nome: typedArgs?.nome as string,
                        descricao: typedArgs?.descricao as string | undefined,
                        diretorio: typedArgs?.diretorio as string,
                    });

                case "confirmar_stitch":
                    return await confirmarStitch({
                        estado_json: typedArgs?.estado_json as string,
                        diretorio: typedArgs?.diretorio as string,
                        usar_stitch: typedArgs?.usar_stitch as boolean,
                    });

                case "carregar_projeto":
                    return await carregarProjeto({
                        estado_json: typedArgs?.estado_json as string,
                        resumo_json: typedArgs?.resumo_json as string | undefined,
                        diretorio: typedArgs?.diretorio as string,
                    });

                case "proximo":
                    return await proximo({
                        entregavel: typedArgs?.entregavel as string,
                        estado_json: typedArgs?.estado_json as string,
                        resumo_json: typedArgs?.resumo_json as string | undefined,
                        nome_arquivo: typedArgs?.nome_arquivo as string | undefined,
                        diretorio: typedArgs?.diretorio as string,
                    });

                case "status":
                    return await status({
                        estado_json: typedArgs?.estado_json as string,
                        diretorio: typedArgs?.diretorio as string,
                    });

                case "validar_gate":
                    return await validarGate({
                        fase: typedArgs?.fase as number | undefined,
                        entregavel: typedArgs?.entregavel as string | undefined,
                        estado_json: typedArgs?.estado_json as string,
                        diretorio: typedArgs?.diretorio as string,
                    });

                // V1.0 (Stateless)
                case "classificar":
                    return await classificar({
                        prd: typedArgs?.prd as string | undefined,
                        nivel: typedArgs?.nivel as "simples" | "medio" | "complexo" | undefined,
                        estado_json: typedArgs?.estado_json as string,
                        diretorio: typedArgs?.diretorio as string,
                    });

                case "contexto":
                    return await contexto({
                        estado_json: typedArgs?.estado_json as string,
                        diretorio: typedArgs?.diretorio as string,
                    });

                case "salvar":
                    return await salvar({
                        conteudo: typedArgs?.conteudo as string,
                        tipo: typedArgs?.tipo as "rascunho" | "anexo" | "entregavel",
                        estado_json: typedArgs?.estado_json as string,
                        nome_arquivo: typedArgs?.nome_arquivo as string | undefined,
                        diretorio: typedArgs?.diretorio as string,
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

                case "atualizar_codebase":
                    return await atualizarCodebase({
                        diretorio: typedArgs?.diretorio as string | undefined,
                        estrutura: typedArgs?.estrutura as { raiz: string; pastas: { path: string; descricao: string }[] } | undefined,
                        arquivos: typedArgs?.arquivos as { path: string; tipo: "entry" | "config" | "core" | "util" | "test" | "other"; descricao: string }[] | undefined,
                        dependencias: typedArgs?.dependencias as { nome: string; versao: string; tipo: "prod" | "dev"; uso: string }[] | undefined,
                        endpoints: typedArgs?.endpoints as { path: string; metodo: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"; descricao: string }[] | undefined,
                        entidades: typedArgs?.entidades as { nome: string; campos: { nome: string; tipo: string }[] }[] | undefined,
                        padroes: typedArgs?.padroes as { naming?: string; estrutura_pastas?: string; testes?: string; commits?: string } | undefined,
                    });

                case "avaliar_entregavel":
                    return await avaliarEntregavel({
                        entregavel: typedArgs?.entregavel as string,
                        fase: typedArgs?.fase as number | undefined,
                        diretorio: typedArgs?.diretorio as string | undefined,
                    });

                case "injetar_conteudo":
                    return await injetar_conteudo({
                        diretorio: typedArgs?.diretorio as string,
                        source: typedArgs?.source as "builtin" | "custom" | undefined,
                        custom_path: typedArgs?.custom_path as string | undefined,
                        force: typedArgs?.force as boolean | undefined,
                    });

                case "discovery":
                    return await discovery({
                        estado_json: typedArgs?.estado_json as string,
                        diretorio: typedArgs?.diretorio as string,
                        respostas: typedArgs?.respostas as any,
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
