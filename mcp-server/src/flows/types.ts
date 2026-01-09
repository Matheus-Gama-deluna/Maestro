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
            gate_checklist: [
                "API implementada",
                "Testes passando",
                "Integração com frontend",
            ],
            entregavel_esperado: "backend-code",
        },
    ],
};

// Fluxo para projetos médios (11 fases)
export const FLUXO_MEDIO: Fluxo = {
    nivel: "medio",
    total_fases: 11,
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
            especialista: "Modelagem de Domínio",
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
            especialista: "Segurança",
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
            especialista: "Plano de Execução",
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
            nome: "Desenvolvimento",
            especialista: "Desenvolvimento",
            template: "historia-usuario",
            gate_checklist: [
                "Frontend implementado",
                "Backend implementado",
                "Integração testada",
                "Deploy realizado",
            ],
            entregavel_esperado: "codigo",
        },
    ],
};

// Fluxo para projetos complexos (15 fases)
export const FLUXO_COMPLEXO: Fluxo = {
    nivel: "complexo",
    total_fases: 15,
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
            especialista: "Segurança",
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
            especialista: "Performance",
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
            especialista: "Plano de Execução",
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
            nome: "Desenvolvimento",
            especialista: "Desenvolvimento",
            template: "historia-usuario",
            gate_checklist: [
                "Frontend implementado",
                "Backend implementado",
                "Integração testada",
            ],
            entregavel_esperado: "codigo",
        },
        {
            numero: 15,
            nome: "Deploy",
            especialista: "DevOps",
            template: "arquitetura",
            gate_checklist: [
                "Pipeline CI/CD configurado",
                "Infraestrutura provisionada",
                "Rollback testado",
                "Monitoring ativo",
            ],
            entregavel_esperado: "deploy.md",
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
