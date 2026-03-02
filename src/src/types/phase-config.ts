/**
 * Configuração dinâmica de uma fase de documento (v10.0).
 * Carregada da SKILL.md do especialista em runtime.
 * 
 * Permite que o specialist-phase-handler funcione para QUALQUER fase,
 * não apenas para a Fase 1 (PRD) como era no v9.
 * 
 * @since v10.0
 */

/**
 * Campo de coleta conversacional — cada pergunta que o especialista faz ao usuário.
 */
export interface CollectField {
    /** ID único do campo (ex: "problema", "stack_preferida") */
    id: string;
    /** Pergunta ou label para o usuário (ex: "Qual problema o produto resolve?") */
    label: string;
    /** Bloco temático (ex: "problema", "solucao", "contexto") para agrupamento */
    block: string;
    /** Dica curta para ajudar o usuário */
    hint: string;
    /** Exemplo de resposta */
    example?: string;
    /** Se é obrigatório para avançar para geração */
    required: boolean;
}

/**
 * Configuração completa de uma fase de documento.
 * O specialist-phase-handler usa esta config para conduzir coleta, geração e validação.
 */
export interface PhaseConfig {
    /** Nome da fase (ex: "Discovery", "Requisitos", "Design Técnico") */
    faseName: string;
    /** Número da fase no fluxo atual */
    faseNumber: number;
    /** Nome do especialista para exibição (ex: "Product Discovery Lead") */
    specialistName: string;
    /** Campos de coleta conversacional (extraídos da seção "Coleta Conversacional" da skill) */
    collectFields: CollectField[];
    /** Path relativo do entregável esperado (ex: "docs/01-discovery/discovery.md") */
    outputPath: string;
    /** Nome do arquivo do entregável (ex: "discovery.md") */
    outputFilename: string;
    /** Nome da skill associada (ex: "specialist-discovery") */
    skillName: string;
    /** Gate checklist items (do flows/types.ts) */
    gateChecklist: string[];
    /** Persona do especialista para configurar o comportamento da IA */
    persona?: {
        name: string;
        tone: string;
        expertise: string[];
        instructions: string;
    };
}

/**
 * Resultado do carregamento de PhaseConfig.
 * Se loaded=false, o handler deve usar fallback (comportamento v9 para Fase 1).
 */
export interface PhaseConfigResult {
    loaded: boolean;
    config: PhaseConfig;
    source: 'skill' | 'fallback';
}
