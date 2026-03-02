/**
 * Mapeamento de fases para prompts relacionados
 * Usado para injetar prompts recomendados nas respostas do MCP
 */

export interface PromptRef {
    categoria: string;
    nome: string;
}

/**
 * Mapeamento de fases para skills locais (v10.0)
 * Skills estão em {IDE_SPECIFIC}/skills/{nome}/
 * Use ide-paths.ts para obter caminhos corretos por IDE
 * 
 * v10.0: Fluxos enxutos — Simples(5), Médio(8), Complexo(11)
 * Inclui aliases de nomes antigos (v9) para backward compatibility.
 * 
 * @since 10.0.0
 */
export const FASE_SKILL_MAP: Record<string, string> = {
    // ========================================
    // FLUXO SIMPLES v10 (5 fases)
    // ========================================
    "Discovery": "specialist-discovery",
    "Design": "specialist-design",
    "Arquitetura": "specialist-architect",
    "Frontend": "specialist-frontend",
    "Backend": "specialist-backend",

    // ========================================
    // FLUXO MÉDIO v10 (8 fases) — adiciona:
    // ========================================
    "Produto": "specialist-product",
    "Requisitos": "specialist-requirements",
    "Design Técnico": "specialist-technical-design",
    "Planejamento": "specialist-planning",
    "Integração & Deploy": "specialist-devops",

    // ========================================
    // FLUXO COMPLEXO v10 (11 fases) — adiciona:
    // ========================================
    "Modelo de Domínio": "specialist-domain",
    "Contrato API": "specialist-api-contract",
    "Integração": "specialist-devops",
    "Deploy & Operação": "specialist-operations",

    // ========================================
    // OPCIONAL
    // ========================================
    "Prototipagem": "specialist-prototipagem-stitch",

    // ========================================
    // UTILITÁRIAS (on-demand, sem fase)
    // ========================================
    "Debugging": "specialist-debugging-troubleshooting",
    "Exploração": "specialist-exploracao-codebase",
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
    // v10 Fluxo Simples
    "Discovery": [
        { categoria: "produto", nome: "prd-completo" },
        { categoria: "produto", nome: "north-star" },
        { categoria: "requisitos", nome: "analise-requisitos" }
    ],
    "Design": [
        { categoria: "ux", nome: "design-system" }
    ],
    "Arquitetura": [
        { categoria: "arquitetura", nome: "clean-architecture" },
        { categoria: "arquitetura", nome: "arquitetura-c4-completo" }
    ],
    "Frontend": [
        { categoria: "desenvolvimento", nome: "code-review" },
        { categoria: "acessibilidade", nome: "wcag-checklist" }
    ],
    "Backend": [
        { categoria: "desenvolvimento", nome: "code-review" }
    ],

    // v10 Fluxo Médio — adiciona:
    "Produto": [
        { categoria: "produto", nome: "prd-completo" },
        { categoria: "produto", nome: "north-star" }
    ],
    "Requisitos": [
        { categoria: "requisitos", nome: "analise-requisitos" },
        { categoria: "requisitos", nome: "gherkin" }
    ],
    "Design Técnico": [
        { categoria: "arquitetura", nome: "clean-architecture" },
        { categoria: "arquitetura", nome: "arquitetura-c4-completo" },
        { categoria: "arquitetura", nome: "modelo-dominio" },
        { categoria: "database", nome: "modelagem-postgres" },
        { categoria: "seguranca", nome: "security-review" }
    ],
    "Planejamento": [
        { categoria: "apis", nome: "openapi-design" },
        { categoria: "apis", nome: "rest-best-practices" },
        { categoria: "testes", nome: "plano-testes" }
    ],
    "Integração & Deploy": [
        { categoria: "devops", nome: "ci-cd-pipeline" },
        { categoria: "devops", nome: "docker-kubernetes" }
    ],

    // v10 Fluxo Complexo — adiciona:
    "Modelo de Domínio": [
        { categoria: "arquitetura", nome: "modelo-dominio" },
        { categoria: "arquitetura", nome: "ddd-bounded-contexts" },
        { categoria: "arquitetura", nome: "ddd-cqrs" }
    ],
    "Contrato API": [
        { categoria: "apis", nome: "openapi-design" },
        { categoria: "apis", nome: "rest-best-practices" }
    ],
    "Integração": [
        { categoria: "devops", nome: "ci-cd-pipeline" }
    ],
    "Deploy & Operação": [
        { categoria: "observabilidade", nome: "logging-estruturado" },
        { categoria: "observabilidade", nome: "metricas-alertas" },
        { categoria: "devops", nome: "ci-cd-pipeline" }
    ],

    // Opcional
    "Prototipagem": [
        { categoria: "prototipagem", nome: "prompt-stitch" },
        { categoria: "prototipagem", nome: "prototipo-stitch" }
    ],
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
