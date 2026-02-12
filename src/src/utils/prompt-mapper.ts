/**
 * Mapeamento de fases para prompts relacionados
 * Usado para injetar prompts recomendados nas respostas do MCP
 */

export interface PromptRef {
    categoria: string;
    nome: string;
}

/**
 * Mapeamento de fases para skills locais
 * Skills estão em {IDE_SPECIFIC}/skills/{nome}/
 * Use ide-paths.ts para obter caminhos corretos por IDE
 * @since 2.0.0 - Skills v2.0 Migration
 */
export const FASE_SKILL_MAP: Record<string, string> = {
    // ========================================
    // FLUXO SIMPLES (7 fases)
    // ========================================
    "Produto": "specialist-gestao-produto",
    "Requisitos": "specialist-engenharia-requisitos-ia",
    "UX Design": "specialist-ux-design",
    "Arquitetura": "specialist-arquitetura-software",
    "Backlog": "specialist-plano-execucao-ia",
    "Frontend": "specialist-desenvolvimento-frontend",
    "Backend": "specialist-desenvolvimento-backend",
    
    // ========================================
    // FLUXO MÉDIO (13 fases) - Adiciona:
    // ========================================
    "Modelo de Domínio": "specialist-modelagem-dominio",
    "Banco de Dados": "specialist-banco-dados",
    "Segurança": "specialist-seguranca-informacao",
    "Testes": "specialist-analise-testes",
    "Contrato API": "specialist-contrato-api",
    "Integração": "specialist-devops-infra",
    
    // ========================================
    // FLUXO COMPLEXO (17 fases) - Adiciona:
    // ========================================
    "Arquitetura Avançada": "specialist-arquitetura-avancada",
    "Performance": "specialist-performance-escalabilidade",
    "Observabilidade": "specialist-observabilidade",
    
    // ========================================
    // OPCIONAL
    // ========================================
    "Prototipagem": "specialist-prototipagem-stitch",
    
    // ========================================
    // COMPLEMENTARES
    // ========================================
    "Dados e Analytics": "specialist-dados-analytics-ia",
    "Acessibilidade": "specialist-acessibilidade",
    "Debugging": "specialist-debugging-troubleshooting",
    "Documentação": "specialist-documentacao-tecnica",
    "Exploração": "specialist-exploracao-codebase",
    "Migração": "specialist-migracao-modernizacao",
    "Mobile": "specialist-desenvolvimento-mobile",
    "Mobile Design": "specialist-mobile-design-avancado"
};

/**
 * Retorna o nome da skill para uma fase
 * @param faseNome Nome da fase (ex: "Produto", "Requisitos")
 * @returns Nome da skill (ex: "specialist-gestao-produto") ou null se não encontrado
 * @since 2.0.0
 */
export function getSkillParaFase(faseNome: string): string | null {
    return FASE_SKILL_MAP[faseNome] || null;
}

/**
 * Verifica se uma fase tem skill associada
 * @param faseNome Nome da fase
 * @returns true se existe skill para a fase
 * @since 2.0.0
 */
export function temSkillParaFase(faseNome: string): boolean {
    return faseNome in FASE_SKILL_MAP;
}

/**
 * Retorna o caminho completo para uma skill no projeto
 * @param skillNome Nome da skill (ex: "specialist-gestao-produto")
 * @param diretorio Diretório do projeto
 * @returns Caminho absoluto para a skill
 * @deprecated Use getSkillPath from ide-paths.ts com o parâmetro IDE
 * Esta função mantida para compatibilidade, mas retorna caminho genérico
 */
export function getSkillPath(skillNome: string, diretorio: string): string {
    const { join } = require("path");
    // Nota: Este caminho é genérico. Para caminhos específicos de IDE,
    // use: import { getSkillPath } from '../utils/ide-paths.js'
    return join(diretorio, '.agent', 'skills', skillNome);
}

/**
 * Retorna o caminho para um arquivo específico da skill
 * @param skillNome Nome da skill
 * @param diretorio Diretório do projeto
 * @param arquivo Nome do arquivo (ex: "SKILL.md", "README.md")
 * @returns Caminho absoluto para o arquivo
 * @since 2.0.0
 */
export function getSkillFilePath(
    skillNome: string, 
    diretorio: string, 
    arquivo: string
): string {
    const { join } = require("path");
    return join(getSkillPath(skillNome, diretorio), arquivo);
}

/**
 * Retorna o caminho para resources de uma skill
 * @param skillNome Nome da skill
 * @param diretorio Diretório do projeto
 * @param tipo Tipo de resource (templates, examples, checklists, reference)
 * @returns Caminho absoluto para o diretório de resources
 * @since 2.0.0
 */
export function getSkillResourcePath(
    skillNome: string,
    diretorio: string,
    tipo: 'templates' | 'examples' | 'checklists' | 'reference'
): string {
    const { join } = require("path");
    return join(getSkillPath(skillNome, diretorio), 'resources', tipo);
}

/**
 * Mapeamento fase → prompts relacionados
 * Os prompts são carregados de .maestro/content/prompts/ ou fallback do servidor
 */
const FASE_PROMPTS_MAP: Record<string, PromptRef[]> = {
    // Fase 1
    "Produto": [
        { categoria: "produto", nome: "prd-completo" },
        { categoria: "produto", nome: "north-star" }
    ],
    // Fase 2
    "Requisitos": [
        { categoria: "requisitos", nome: "analise-requisitos" },
        { categoria: "requisitos", nome: "gherkin" }
    ],
    // Fase 3
    "UX Design": [
        { categoria: "ux", nome: "design-system" }
    ],
    // Fase 4 (Stitch - opcional)
    "Prototipagem": [
        { categoria: "prototipagem", nome: "prompt-stitch" },
        { categoria: "prototipagem", nome: "prototipo-stitch" }
    ],
    // Fase 4/5 
    "Modelo de Domínio": [
        { categoria: "arquitetura", nome: "modelo-dominio" },
        { categoria: "arquitetura", nome: "ddd-bounded-contexts" }
    ],
    // Fase 5/6
    "Banco de Dados": [
        { categoria: "database", nome: "modelagem-postgres" },
        { categoria: "database", nome: "otimizacao-queries" }
    ],
    // Fase 6/7
    "Arquitetura": [
        { categoria: "arquitetura", nome: "clean-architecture" },
        { categoria: "arquitetura", nome: "arquitetura-c4-completo" }
    ],
    // Fase 7 (complexo)
    "Arquitetura Avançada": [
        { categoria: "arquitetura", nome: "ddd-cqrs" },
        { categoria: "arquitetura", nome: "multi-tenancy" }
    ],
    // Fase 7/8
    "Segurança": [
        { categoria: "seguranca", nome: "security-review" },
        { categoria: "seguranca", nome: "auth-patterns" },
        { categoria: "seguranca", nome: "lgpd-compliance" }
    ],
    // Fase 8/9
    "Testes": [
        { categoria: "testes", nome: "plano-testes" },
        { categoria: "testes", nome: "tdd-workflow" },
        { categoria: "testes", nome: "testes-integracao" }
    ],
    // Fase 9 (complexo)
    "Performance": [
        { categoria: "escalabilidade", nome: "escalabilidade-horizontal" },
        { categoria: "escalabilidade", nome: "caching-strategies" }
    ],
    // Fase 10 (complexo)
    "Observabilidade": [
        { categoria: "observabilidade", nome: "logging-estruturado" },
        { categoria: "observabilidade", nome: "metricas-alertas" },
        { categoria: "observabilidade", nome: "tracing-distribuido" }
    ],
    // Fase Backlog
    "Plano de Execução": [],
    // Fase Contrato API
    "Contrato API": [
        { categoria: "apis", nome: "openapi-design" },
        { categoria: "apis", nome: "rest-best-practices" }
    ],
    // Fase Frontend
    "Frontend": [
        { categoria: "desenvolvimento", nome: "code-review" },
        { categoria: "acessibilidade", nome: "wcag-checklist" }
    ],
    // Fase Backend
    "Backend": [
        { categoria: "desenvolvimento", nome: "code-review" }
    ],
    // Fase Integração/DevOps
    "Integração": [
        { categoria: "devops", nome: "ci-cd-pipeline" },
        { categoria: "devops", nome: "docker-kubernetes" }
    ]
};

/**
 * Mapeamento de stacks para exemplos de fluxo completo
 */
const STACK_EXEMPLOS_MAP: Record<string, string> = {
    "java": "Exemplo de Fluxo Completo com Java e Spring Boot",
    "spring": "Exemplo de Fluxo Completo com Java e Spring Boot",
    "springboot": "Exemplo de Fluxo Completo com Java e Spring Boot",
    "laravel": "Exemplo de Fluxo Completo com Laravel e Filament",
    "filament": "Exemplo de Fluxo Completo com Laravel e Filament",
    "livewire": "Exemplo de Fluxo Completo com Laravel e Livewire",
    "php": "Exemplo de Fluxo Completo com Laravel e Filament",
    "node": "Exemplo de Fluxo Completo com Node e NestJS",
    "nodejs": "Exemplo de Fluxo Completo com Node e NestJS",
    "nestjs": "Exemplo de Fluxo Completo com Node e NestJS",
    "nest": "Exemplo de Fluxo Completo com Node e NestJS",
    "typescript": "Exemplo de Fluxo Completo com Node e NestJS",
    "default": "Exemplo de Fluxo Completo com Node e NestJS"
};

/**
 * Retorna prompts relacionados a uma fase
 */
export function getPromptsParaFase(faseNome: string): PromptRef[] {
    return FASE_PROMPTS_MAP[faseNome] || [];
}

/**
 * Verifica se uma fase tem prompts relacionados
 */
export function temPromptsParaFase(faseNome: string): boolean {
    const prompts = FASE_PROMPTS_MAP[faseNome];
    return prompts !== undefined && prompts.length > 0;
}

/**
 * Detecta stack a partir de texto (nome/descrição do projeto)
 */
export function detectarStack(nome?: string, descricao?: string): string | null {
    const texto = `${nome || ""} ${descricao || ""}`.toLowerCase();
    
    const stacks = [
        "spring", "springboot", "java",
        "laravel", "filament", "livewire", "php",
        "nestjs", "nest", "node", "nodejs", "typescript"
    ];
    
    for (const stack of stacks) {
        if (texto.includes(stack)) {
            return stack;
        }
    }
    
    return null;
}

/**
 * Retorna nome do exemplo mais relevante para uma stack
 */
export function getExemploParaStack(stack?: string | null): string | null {
    if (!stack) return STACK_EXEMPLOS_MAP["default"];
    return STACK_EXEMPLOS_MAP[stack.toLowerCase()] || STACK_EXEMPLOS_MAP["default"];
}

/**
 * Gera markdown com seção de prompts recomendados
 * @since 2.0.0 - Atualizado para usar skills ao invés de resources
 */
export function gerarSecaoPrompts(faseNome: string): string {
    const skillNome = getSkillParaFase(faseNome);
    
    if (!skillNome) {
        return "";
    }
    
    return `
## 📚 Recursos Recomendados

Para gerar o entregável com qualidade, consulte os recursos da skill:

**Skill Ativa:** \`${skillNome}\`

### Recursos Disponíveis na Skill:
- **SKILL.md**: Instruções e contexto do especialista
- **resources/templates/**: Templates de entregáveis
- **resources/examples/**: Exemplos práticos
- **resources/checklists/**: Checklists de validação
- **resources/reference/**: Material de referência

> 💡 Todos os recursos estão disponíveis localmente na pasta da skill.
> A IA tem acesso direto a estes arquivos através do sistema de skills.
`;
}

/**
 * Gera markdown com referência ao exemplo de fluxo
 */
export function gerarSecaoExemplo(stack?: string | null): string {
    const exemplo = getExemploParaStack(stack);
    
    if (!exemplo) {
        return "";
    }
    
    return `
## 📖 Exemplo de Referência

Para ver um fluxo completo similar ao seu projeto, consulte:

\`read_resource("maestro://exemplo/${encodeURIComponent(exemplo)}")\`

> 💡 Este exemplo mostra todas as fases do desenvolvimento com a stack recomendada.
`;
}
