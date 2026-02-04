import type { Fase, Fluxo } from "../types/index.js";

// Fluxo para projetos simples (7 fases)
export const FLUXO_SIMPLES: Fluxo = {
    nivel: "simples",
    total_fases: 7,
    fases: [
        {
            numero: 1,
            nome: "Produto",
            especialista: "Gestão de Produto",
            template: "PRD",
            skill: "specialist-gestao-produto",
            gate_checklist: [
                "Problema claramente definido",
                "MVP com funcionalidades listadas",
                "Personas identificadas",
            ],
            entregavel_esperado: "PRD.md",
        },
        {
            numero: 2,
            nome: "Requisitos",
            especialista: "Engenharia de Requisitos",
            template: "requisitos",
            skill: "specialist-engenharia-requisitos-ia",
            gate_checklist: [
                "Requisitos funcionais com IDs únicos",
                "Requisitos não-funcionais definidos",
                "Critérios de aceite especificados",
            ],
            entregavel_esperado: "requisitos.md",
        },
        {
            numero: 3,
            nome: "UX Design",
            especialista: "UX Design",
            template: "design-doc",
            skill: "specialist-ux-design",
            gate_checklist: [
                "Wireframes ou protótipos criados",
                "Jornadas do usuário mapeadas",
                "Fluxos de navegação definidos",
            ],
            entregavel_esperado: "design-doc.md",
        },
        {
            numero: 4,
            nome: "Arquitetura",
            especialista: "Arquitetura de Software",
            template: "arquitetura",
            skill: "specialist-arquitetura-software",
            gate_checklist: [
                "Stack tecnológica definida",
                "Diagrama C4 básico",
                "ADRs documentados",
            ],
            entregavel_esperado: "arquitetura.md",
        },
        {
            numero: 5,
            nome: "Backlog",
            especialista: "Plano de Execução",
            template: "backlog",
            skill: "specialist-plano-execucao-ia",
            gate_checklist: [
                "Épicos definidos",
                "Histórias de usuário criadas",
                "Definition of Done estabelecido",
            ],
            entregavel_esperado: "backlog.md",
        },
        {
            numero: 6,
            nome: "Frontend",
            especialista: "Desenvolvimento Frontend",
            template: "historia-usuario",
            skill: "specialist-desenvolvimento-frontend",
            gate_checklist: [
                "Componentes seguindo design",
                "Funcionando contra mock",
                "Responsivo e acessível",
            ],
            entregavel_esperado: "frontend-code",
        },
        {
            numero: 7,
            nome: "Backend",
            especialista: "Desenvolvimento",
            template: "historia-usuario",
            skill: "specialist-desenvolvimento-backend",
            gate_checklist: [
                "API implementada",
                "Testes passando",
                "Integração com frontend",
            ],
            entregavel_esperado: "backend-code",
        },
    ],
};

// Fluxo para projetos médios (13 fases)
export const FLUXO_MEDIO: Fluxo = {
    nivel: "medio",
    total_fases: 13,
    fases: [
        {
            numero: 1,
            nome: "Produto",
            especialista: "Gestão de Produto",
            template: "PRD",
            gate_checklist: [
                "Problema claramente definido",
                "Personas identificadas",
                "MVP com funcionalidades listadas",
                "North Star Metric definida",
                "Cronograma estimado",
            ],
            entregavel_esperado: "PRD.md",
        },
        {
            numero: 2,
            nome: "Requisitos",
            especialista: "Engenharia de Requisitos",
            template: "requisitos",
            gate_checklist: [
                "Requisitos funcionais com IDs únicos",
                "Requisitos não-funcionais definidos",
                "Critérios de aceite em Gherkin",
                "Matriz de rastreabilidade iniciada",
            ],
            entregavel_esperado: "requisitos.md",
        },
        {
            numero: 3,
            nome: "UX Design",
            especialista: "UX Design",
            template: "design-doc",
            gate_checklist: [
                "Jornadas do usuário mapeadas",
                "Wireframes criados",
                "Acessibilidade considerada",
                "Mapa de navegação definido",
            ],
            entregavel_esperado: "design-doc.md",
        },
        {
            numero: 4,
            nome: "Modelo de Domínio",
            especialista: "Modelagem e Arquitetura de Domínio com IA",
            template: "modelo-dominio",
            gate_checklist: [
                "Entidades identificadas",
                "Relacionamentos definidos",
                "Regras de negócio documentadas",
            ],
            entregavel_esperado: "modelo-dominio.md",
        },
        {
            numero: 5,
            nome: "Banco de Dados",
            especialista: "Banco de Dados",
            template: "design-banco",
            gate_checklist: [
                "Modelo relacional definido",
                "Índices planejados",
                "Scripts de migração criados",
            ],
            entregavel_esperado: "design-banco.md",
        },
        {
            numero: 6,
            nome: "Arquitetura",
            especialista: "Arquitetura de Software",
            template: "arquitetura",
            gate_checklist: [
                "Diagrama C4 completo",
                "Stack justificada",
                "ADRs documentados",
                "Pontos de integração definidos",
            ],
            entregavel_esperado: "arquitetura.md",
        },
        {
            numero: 7,
            nome: "Segurança",
            especialista: "Segurança da Informação",
            template: "checklist-seguranca",
            gate_checklist: [
                "OWASP Top 10 avaliado",
                "Autenticação definida",
                "Dados sensíveis mapeados",
            ],
            entregavel_esperado: "checklist-seguranca.md",
        },
        {
            numero: 8,
            nome: "Testes",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Estratégia definida",
                "Casos de teste mapeados",
                "Ferramentas selecionadas",
            ],
            entregavel_esperado: "plano-testes.md",
        },
        {
            numero: 9,
            nome: "Backlog",
            especialista: "Plano de Execução com IA",
            template: "backlog",
            gate_checklist: [
                "Épicos definidos",
                "Features priorizadas",
                "Histórias detalhadas",
                "Definition of Done estabelecido",
            ],
            entregavel_esperado: "backlog.md",
        },
        {
            numero: 10,
            nome: "Contrato API",
            especialista: "Contrato de API",
            template: "contrato-api",
            gate_checklist: [
                "Esquema OpenAPI definido",
                "Tipos gerados para FE e BE",
                "Mocks disponíveis",
            ],
            entregavel_esperado: "openapi.yaml",
        },
        {
            numero: 11,
            nome: "Frontend",
            especialista: "Desenvolvimento Frontend",
            template: "historia-usuario",
            gate_checklist: [
                "Componentes implementados",
                "Integração com mocks",
                "Testes de componente passados",
            ],
            entregavel_esperado: "frontend-code",
        },
        {
            numero: 12,
            nome: "Backend",
            especialista: "Desenvolvimento e Vibe Coding Estruturado",
            template: "historia-usuario",
            gate_checklist: [
                "API implementada conforme contrato",
                "Testes unitários passados",
                "Migrações executadas",
            ],
            entregavel_esperado: "backend-code",
        },
        {
            numero: 13,
            nome: "Integração",
            especialista: "DevOps e Infraestrutura",
            template: "arquitetura",
            gate_checklist: [
                "Frontend integrado ao Backend",
                "Testes E2E passados",
                "Pipeline CI/CD verde",
            ],
            entregavel_esperado: "deploy.md",
        },
    ],
};

// Fluxo para projetos complexos (17 fases)
export const FLUXO_COMPLEXO: Fluxo = {
    nivel: "complexo",
    total_fases: 17,
    fases: [
        ...FLUXO_MEDIO.fases.slice(0, 6), // Produto até Arquitetura
        {
            numero: 7,
            nome: "Arquitetura Avançada",
            especialista: "Arquitetura Avançada",
            template: "arquitetura",
            gate_checklist: [
                "Bounded Contexts definidos",
                "CQRS avaliado",
                "Event Sourcing planejado",
                "Microserviços mapeados",
            ],
            entregavel_esperado: "arquitetura-avancada.md",
        },
        {
            numero: 8,
            nome: "Segurança",
            especialista: "Segurança da Informação",
            template: "checklist-seguranca",
            gate_checklist: [
                "OWASP Top 10 avaliado",
                "Threat modeling realizado",
                "Pentest planejado",
                "Compliance verificado",
            ],
            entregavel_esperado: "checklist-seguranca.md",
        },
        {
            numero: 9,
            nome: "Performance",
            especialista: "Performance e Escalabilidade",
            template: "plano-testes",
            gate_checklist: [
                "Load testing planejado",
                "Caching strategy definida",
                "Métricas de performance definidas",
            ],
            entregavel_esperado: "plano-performance.md",
        },
        {
            numero: 10,
            nome: "Observabilidade",
            especialista: "Observabilidade",
            template: "arquitetura",
            gate_checklist: [
                "Estratégia de logs definida",
                "Métricas configuradas",
                "Tracing distribuído planejado",
                "Dashboards definidos",
            ],
            entregavel_esperado: "observabilidade.md",
        },
        {
            numero: 11,
            nome: "Testes",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Pirâmide de testes definida",
                "Contract testing planejado",
                "E2E strategy definida",
            ],
            entregavel_esperado: "plano-testes.md",
        },
        {
            numero: 12,
            nome: "Backlog",
            especialista: "Plano de Execução com IA",
            template: "backlog",
            gate_checklist: [
                "Épicos definidos",
                "Features priorizadas",
                "Histórias com dependências",
                "Sprints planejadas",
            ],
            entregavel_esperado: "backlog.md",
        },
        {
            numero: 13,
            nome: "Contrato API",
            especialista: "Contrato de API",
            template: "contrato-api",
            gate_checklist: [
                "OpenAPI completo",
                "Versionamento definido",
                "Breaking changes documentados",
            ],
            entregavel_esperado: "openapi.yaml",
        },
        {
            numero: 14,
            nome: "Frontend",
            especialista: "Desenvolvimento Frontend",
            template: "historia-usuario",
            gate_checklist: [
                "Componentes implementados",
                "Integração com mocks",
                "Testes de componente passados",
            ],
            entregavel_esperado: "frontend-code",
        },
        {
            numero: 15,
            nome: "Backend",
            especialista: "Desenvolvimento e Vibe Coding Estruturado",
            template: "historia-usuario",
            gate_checklist: [
                "API implementada conforme contrato",
                "Testes unitários passados",
                "Migrações executadas",
            ],
            entregavel_esperado: "backend-code",
        },
        {
            numero: 16,
            nome: "Integração",
            especialista: "DevOps e Infraestrutura",
            template: "arquitetura",
            gate_checklist: [
                "Frontend integrado ao Backend",
                "Testes E2E passados",
                "Pipeline CI/CD verde",
            ],
            entregavel_esperado: "deploy.md",
        },
        {
            numero: 17,
            nome: "Deploy Final",
            especialista: "DevOps e Infraestrutura",
            template: "arquitetura",
            gate_checklist: [
                "Deploy em produção",
                "Monitoramento ativo",
                "Health check ok",
            ],
            entregavel_esperado: "release.md",
        },
    ],
};

/**
 * Obtém fluxo por nível de complexidade
 */
export function getFluxo(nivel: "simples" | "medio" | "complexo"): Fluxo {
    switch (nivel) {
        case "simples":
            return FLUXO_SIMPLES;
        case "medio":
            return FLUXO_MEDIO;
        case "complexo":
            return FLUXO_COMPLEXO;
    }
}

/**
 * Obtém fase específica do fluxo
 */
export function getFase(nivel: "simples" | "medio" | "complexo", numero: number): Fase | undefined {
    const fluxo = getFluxo(nivel);
    return fluxo.fases.find((f) => f.numero === numero);
}

// Fase opcional de Stitch (inserida após UX Design quando habilitada)
const FASE_STITCH: Fase = {
    numero: 0, // Será ajustado dinamicamente
    nome: "Prototipagem",
    especialista: "Prototipagem Rápida com Google Stitch",
    template: "prototipo-stitch",
    gate_checklist: [
        "Design Doc aprovado como base para prototipagem",
        "Prompts para Stitch gerados com base no estilo definido",
        "Protótipos testados no stitch.withgoogle.com",
        "Código HTML/CSS exportado e salvo em docs/03-ux/stitch-output/",
        "Assets (imagens/ícones) salvos em docs/03-ux/stitch-output/assets/",
    ],
    entregavel_esperado: "prototipos.md",
};

/**
 * Obtém fluxo com fase de Stitch opcional
 * Se usarStitch=true, insere fase de prototipagem após UX Design (fase 3)
 * Isso garante que o Design Doc com estilo visual esteja pronto antes de prototipar
 */
export function getFluxoComStitch(nivel: "simples" | "medio" | "complexo", usarStitch: boolean): Fluxo {
    const base = getFluxo(nivel);

    if (!usarStitch) {
        return base;
    }

    // Insere Stitch como fase 4 (após UX Design)
    // Fluxo: Produto(1) -> Requisitos(2) -> UX Design(3) -> Stitch(4) -> ...
    const fasesComStitch: Fase[] = [
        ...base.fases.slice(0, 3), // Fases 1-3: Produto + Requisitos + UX Design
        { ...FASE_STITCH, numero: 4 }, // Stitch como fase 4
        ...base.fases.slice(3).map(f => ({ ...f, numero: f.numero + 1 })) // Renumera restante
    ];

    return {
        nivel: base.nivel,
        total_fases: base.total_fases + 1,
        fases: fasesComStitch
    };
}

/**
 * Obtém fase específica considerando Stitch opcional
 */
export function getFaseComStitch(
    nivel: "simples" | "medio" | "complexo",
    numero: number,
    usarStitch: boolean
): Fase | undefined {
    const fluxo = getFluxoComStitch(nivel, usarStitch);
    return fluxo.fases.find(f => f.numero === numero);
}
