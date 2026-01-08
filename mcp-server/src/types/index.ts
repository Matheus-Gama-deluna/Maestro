// Níveis de complexidade do projeto
export type NivelComplexidade = "simples" | "medio" | "complexo";

// Tipos de fluxo
export type TipoFluxo = "novo_projeto" | "feature" | "bug" | "refatoracao";

// Tipos de história (Frontend First)
export type TipoHistoria = "contrato" | "frontend" | "backend" | "integracao";

// Estado do projeto
export interface EstadoProjeto {
    projeto_id: string;
    nome: string;
    diretorio: string;
    nivel: NivelComplexidade;
    tipo_fluxo: TipoFluxo;
    fase_atual: number;
    total_fases: number;
    entregaveis: Record<string, string>;
    gates_validados: number[];
    usar_stitch: boolean;
    criado_em: string;
    atualizado_em: string;
}

// Fase do fluxo
export interface Fase {
    numero: number;
    nome: string;
    especialista: string;
    template: string;
    gate_checklist: string[];
    entregavel_esperado: string;
}

// Resultado de validação de gate
export interface GateResultado {
    valido: boolean;
    itens_validados: string[];
    itens_pendentes: string[];
    sugestoes: string[];
}

// Fluxo completo
export interface Fluxo {
    nivel: NivelComplexidade;
    total_fases: number;
    fases: Fase[];
}

// Resultado de classificação de complexidade
export interface ClassificacaoResultado {
    nivel: NivelComplexidade;
    pontuacao: number;
    criterios: string[];
}

// Resource info
export interface ResourceInfo {
    uri: string;
    name: string;
    mimeType: string;
    description?: string;
}

// Tool result - compatible with MCP SDK
export interface ToolResult {
    [x: string]: unknown;
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError?: boolean;
}
