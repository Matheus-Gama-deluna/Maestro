import type { Fase, Fluxo } from "../types/index.js";
import type { EstadoProjeto } from "../types/index.js";

/**
 * Nomes canônicos das fases de desenvolvimento de código.
 * FONTE ÚNICA DE VERDADE — todos os arquivos devem importar daqui.
 * 
 * v10.0: Atualizado para fluxos enxutos.
 * "Integração & Deploy" é fase de código (deploy.md + CI/CD + E2E).
 * "Deploy & Operação" é fase de código (release.md + SLOs + runbooks).
 * 
 * @since v10.0
 */
export const CODE_PHASE_NAMES = ['Frontend', 'Backend', 'Integração & Deploy', 'Integração', 'Deploy & Operação'] as const;

/**
 * Verifica se uma fase é de código (desenvolvimento).
 * Usa CODE_PHASE_NAMES como fonte única.
 * 
 * @since v9.0
 */
export function isCodePhaseName(faseNome: string | undefined): boolean {
    if (!faseNome) return false;
    return CODE_PHASE_NAMES.some(k => faseNome.includes(k));
}

/**
 * Classificação de tipo de fase para Smart Auto-Flow.
 * Usado por proximo.ts para decidir se a próxima fase precisa de input do usuário.
 * 
 * v10.0: Atualizado com nomes de fases consolidadas.
 * 
 * @since v10.0
 */
export const PHASE_TYPE_MAP: Record<string, EstadoProjeto['flow_phase_type']> = {
    // Fases que requerem input do usuário (coleta conversacional)
    'Discovery': 'input_required',
    'Produto': 'input_required',
    // Fases derivadas (IA gera a partir de docs anteriores + coleta complementar)
    'Requisitos': 'derived',
    'Design': 'derived',
    'Arquitetura': 'derived',
    'Design Técnico': 'derived',
    'Modelo de Domínio': 'derived',
    'Contrato API': 'derived',
    'Planejamento': 'derived',
    'Prototipagem': 'derived',
    // Fases técnicas (código e infra)
    'Frontend': 'technical',
    'Backend': 'technical',
    'Integração & Deploy': 'technical',
    'Integração': 'technical',
    'Deploy & Operação': 'technical',
};

// ============================================================
// GATE CHECKLISTS COMPARTILHADOS (reutilizados entre fluxos)
// ============================================================

const GATE_FRONTEND = [
    "Componentes implementados conforme design doc e user stories",
    "Pages com rotas configuradas para cada fluxo",
    "State management conectado (hooks/stores)",
    "Integração com mocks ou API real",
    "Testes unitários para componentes críticos",
    "Responsivo mobile-first e acessível",
    "Loading, empty e error states em todas as telas",
];

const GATE_BACKEND = [
    "Endpoints implementados conforme modelo de dados da arquitetura",
    "DTOs com validação de input para cada endpoint",
    "Services com regras de negócio do modelo de domínio",
    "Testes unitários para services e controllers",
    "Migrações de banco executáveis",
    "Error handling padronizado conforme schema de erros",
    "Autenticação implementada conforme arquitetura",
];

const GATE_INTEGRACAO_DEPLOY = [
    "Frontend conectado ao Backend real (mocks removidos)",
    "Todos os endpoints funcionando end-to-end",
    "Testes E2E para fluxos críticos",
    "CORS e variáveis de ambiente configurados",
    "Pipeline CI/CD verde com testes automatizados",
    "Health check respondendo corretamente",
    "Monitoramento ativo (error tracking)",
];

// ============================================================
// FLUXO SIMPLES — 5 fases (v10.0, antes: 7)
// Discovery (PRD+Requisitos), Design, Arquitetura, Frontend, Backend
// ============================================================

export const FLUXO_SIMPLES: Fluxo = {
    nivel: "simples",
    total_fases: 5,
    fases: [
        {
            numero: 1,
            nome: "Discovery",
            especialista: "Product Discovery Lead",
            template: "discovery",
            skill: "specialist-discovery",
            gate_checklist: [
                "Problema definido com impacto quantificado",
                "Mínimo 2 personas com JTBD",
                "MVP com 3-5 funcionalidades priorizadas",
                "Requisitos funcionais com IDs únicos",
                "Requisitos não-funcionais definidos",
                "North Star Metric definida e mensurável",
                "Riscos identificados com mitigação",
            ],
            entregavel_esperado: "discovery.md",
        },
        {
            numero: 2,
            nome: "Design",
            especialista: "UX Designer Lead",
            template: "design-doc",
            skill: "specialist-design",
            gate_checklist: [
                "Jornada do usuário principal mapeada completa",
                "Wireframes cobrem todas as telas do MVP",
                "Design system definido (cores, tipografia, componentes)",
                "Navegação e arquitetura de informação clara",
                "Estados de UI (loading, empty, error) documentados",
                "Acessibilidade WCAG 2.1 AA considerada",
                "Responsividade mobile-first planejada",
            ],
            entregavel_esperado: "design-doc.md",
        },
        {
            numero: 3,
            nome: "Arquitetura",
            especialista: "Arquiteto de Soluções",
            template: "arquitetura",
            skill: "specialist-architect",
            gate_checklist: [
                "Stack tecnológica justificada com ADRs",
                "Diagrama C4 nível 1 e 2 presentes",
                "Modelo de dados com entidades e relacionamentos",
                "Schema de banco com PKs, FKs e índices",
                "Autenticação e autorização definidas",
                "NFRs mensuráveis (tempo de resposta, disponibilidade)",
                "Mínimo 2 ADRs documentados",
            ],
            entregavel_esperado: "arquitetura.md",
        },
        {
            numero: 4,
            nome: "Frontend",
            especialista: "Frontend Developer Lead",
            template: "historia-usuario",
            skill: "specialist-frontend",
            gate_checklist: GATE_FRONTEND,
            entregavel_esperado: "frontend-code",
        },
        {
            numero: 5,
            nome: "Backend",
            especialista: "Backend Developer Lead",
            template: "historia-usuario",
            skill: "specialist-backend",
            gate_checklist: GATE_BACKEND,
            entregavel_esperado: "backend-code",
        },
    ],
};

// ============================================================
// FLUXO MÉDIO — 8 fases (v10.0, antes: 13)
// Produto, Requisitos, Design, Design Técnico, Planejamento,
// Frontend, Backend, Integração & Deploy
// ============================================================

export const FLUXO_MEDIO: Fluxo = {
    nivel: "medio",
    total_fases: 8,
    fases: [
        {
            numero: 1,
            nome: "Produto",
            especialista: "Product Manager",
            template: "PRD",
            skill: "specialist-product",
            gate_checklist: [
                "Problema definido com impacto quantificado",
                "Mínimo 2 personas detalhadas com JTBD",
                "MVP com 3-7 funcionalidades priorizadas (RICE ou MoSCoW)",
                "Escopo negativo definido (o que NÃO está no MVP)",
                "North Star Metric com metas de 3 e 6 meses",
                "Top 5 riscos com mitigação",
                "Modelo de negócio claro",
            ],
            entregavel_esperado: "PRD.md",
        },
        {
            numero: 2,
            nome: "Requisitos",
            especialista: "Engenheiro de Requisitos",
            template: "requisitos",
            skill: "specialist-requirements",
            gate_checklist: [
                "Requisitos funcionais com IDs únicos e descrição clara",
                "Critérios de aceite em Gherkin para RFs de prioridade Alta",
                "Requisitos não-funcionais mensuráveis",
                "Regras de negócio documentadas",
                "Matriz de rastreabilidade RF ↔ PRD",
            ],
            entregavel_esperado: "requisitos.md",
        },
        {
            numero: 3,
            nome: "Design",
            especialista: "UX Designer Lead",
            template: "design-doc",
            skill: "specialist-design",
            gate_checklist: [
                "Jornada do usuário principal mapeada completa",
                "Wireframes cobrem todas as telas do MVP",
                "Design system definido (cores, tipografia, componentes)",
                "Navegação e arquitetura de informação clara",
                "Estados de UI (loading, empty, error) documentados",
                "Acessibilidade WCAG 2.1 AA considerada",
                "Responsividade mobile-first planejada",
            ],
            entregavel_esperado: "design-doc.md",
        },
        {
            numero: 4,
            nome: "Design Técnico",
            especialista: "Arquiteto de Soluções",
            template: "technical-design",
            skill: "specialist-technical-design",
            gate_checklist: [
                "Entidades do domínio com atributos e relacionamentos completos",
                "Schema de banco com tipos reais, PKs/FKs e índices planejados",
                "Stack tecnológica justificada com mínimo 3 ADRs",
                "Diagrama C4 nível 1 e 2",
                "Autenticação e autorização definidas",
                "OWASP Top 5 mitigado",
                "NFRs mensuráveis (tempo resposta, disponibilidade, escala)",
                "Estratégia de deploy com ambientes",
            ],
            entregavel_esperado: "technical-design.md",
        },
        {
            numero: 5,
            nome: "Planejamento",
            especialista: "Tech Lead",
            template: "backlog",
            skill: "specialist-planning",
            gate_checklist: [
                "Épicos mapeiam funcionalidades do MVP",
                "User Stories com IDs, tipo FE/BE e story points",
                "Top 10 US com critérios de aceite detalhados",
                "Endpoints de API derivados do modelo de dados",
                "Sprints planejados com objetivo e US incluídas",
                "Estratégia de testes com ferramentas e cobertura",
                "Definition of Done definido",
            ],
            entregavel_esperado: "backlog.md",
        },
        {
            numero: 6,
            nome: "Frontend",
            especialista: "Frontend Developer Lead",
            template: "historia-usuario",
            skill: "specialist-frontend",
            gate_checklist: GATE_FRONTEND,
            entregavel_esperado: "frontend-code",
        },
        {
            numero: 7,
            nome: "Backend",
            especialista: "Backend Developer Lead",
            template: "historia-usuario",
            skill: "specialist-backend",
            gate_checklist: GATE_BACKEND,
            entregavel_esperado: "backend-code",
        },
        {
            numero: 8,
            nome: "Integração & Deploy",
            especialista: "DevOps / SRE Engineer",
            template: "deploy",
            skill: "specialist-devops",
            gate_checklist: GATE_INTEGRACAO_DEPLOY,
            entregavel_esperado: "deploy.md",
        },
    ],
};

// ============================================================
// FLUXO COMPLEXO — 11 fases (v10.0, antes: 17)
// Produto, Requisitos, Design, Modelo de Domínio, Design Técnico,
// Contrato API, Planejamento, Frontend, Backend, Integração, Deploy & Operação
// ============================================================

export const FLUXO_COMPLEXO: Fluxo = {
    nivel: "complexo",
    total_fases: 11,
    fases: [
        // Fases 1-3: iguais ao médio (Produto, Requisitos, Design)
        ...FLUXO_MEDIO.fases.slice(0, 3),
        {
            numero: 4,
            nome: "Modelo de Domínio",
            especialista: "Domain Expert / DDD Strategist",
            template: "modelo-dominio",
            skill: "specialist-domain",
            gate_checklist: [
                "Bounded contexts identificados com responsabilidades claras",
                "Linguagem ubíqua documentada (glossário com 10+ termos)",
                "Aggregates com aggregate roots identificados",
                "Entidades com atributos e identidade definida",
                "Value Objects identificados (imutáveis, sem identidade)",
                "Invariantes/regras de negócio por aggregate",
                "Domain events mapeados (mínimo 5)",
                "Context map com relações entre bounded contexts",
            ],
            entregavel_esperado: "modelo-dominio.md",
        },
        {
            // Design Técnico no complexo: sem seção de domínio (já coberta na fase 4)
            numero: 5,
            nome: "Design Técnico",
            especialista: "Arquiteto de Soluções",
            template: "technical-design",
            skill: "specialist-technical-design",
            gate_checklist: [
                "Schema de banco com tipos reais, PKs/FKs e índices planejados",
                "Stack tecnológica justificada com mínimo 3 ADRs",
                "Diagrama C4 nível 1 e 2",
                "Autenticação e autorização definidas",
                "OWASP Top 5 mitigado",
                "NFRs mensuráveis (tempo resposta, disponibilidade, escala)",
                "Estratégia de deploy com ambientes",
            ],
            entregavel_esperado: "technical-design.md",
        },
        {
            numero: 6,
            nome: "Contrato API",
            especialista: "API Designer",
            template: "contrato-api",
            skill: "specialist-api-contract",
            gate_checklist: [
                "OpenAPI 3.0+ válido (parseable por ferramentas)",
                "CRUD completo para cada entidade principal",
                "Schemas de request e response com tipos reais",
                "Autenticação definida (security schemes)",
                "Paginação em endpoints que retornam listas",
                "Error responses padronizadas",
                "Pelo menos 1 exemplo por endpoint",
            ],
            entregavel_esperado: "openapi.yaml",
        },
        {
            numero: 7,
            nome: "Planejamento",
            especialista: "Tech Lead",
            template: "backlog",
            skill: "specialist-planning",
            gate_checklist: [
                "Épicos mapeiam funcionalidades do MVP",
                "User Stories com IDs, tipo FE/BE e story points",
                "Top 10 US com critérios de aceite detalhados",
                "Sprints planejados com objetivo e US incluídas",
                "Estratégia de testes com ferramentas e cobertura",
                "Definition of Done definido",
            ],
            entregavel_esperado: "backlog.md",
        },
        {
            numero: 8,
            nome: "Frontend",
            especialista: "Frontend Developer Lead",
            template: "historia-usuario",
            skill: "specialist-frontend",
            gate_checklist: GATE_FRONTEND,
            entregavel_esperado: "frontend-code",
        },
        {
            numero: 9,
            nome: "Backend",
            especialista: "Backend Developer Lead",
            template: "historia-usuario",
            skill: "specialist-backend",
            gate_checklist: GATE_BACKEND,
            entregavel_esperado: "backend-code",
        },
        {
            numero: 10,
            nome: "Integração",
            especialista: "DevOps / SRE Engineer",
            template: "deploy",
            skill: "specialist-devops",
            gate_checklist: [
                "Frontend conectado ao Backend real (mocks removidos)",
                "Todos os endpoints do OpenAPI funcionando end-to-end",
                "Testes E2E para fluxos críticos",
                "CORS e variáveis de ambiente configurados",
                "Pipeline CI/CD verde com testes automatizados",
            ],
            entregavel_esperado: "deploy.md",
        },
        {
            numero: 11,
            nome: "Deploy & Operação",
            especialista: "SRE Senior / Platform Engineer",
            template: "release",
            skill: "specialist-operations",
            gate_checklist: [
                "Deploy em produção realizado com sucesso",
                "Monitoramento ativo com métricas e alertas",
                "Health checks respondendo corretamente (liveness + readiness)",
                "SLOs definidos com SLIs mensuráveis",
                "Runbook de operações documentado (mínimo 3 cenários)",
                "Rollback testado e funcional",
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
    skill: "specialist-prototipagem-stitch",
    gate_checklist: [
        "Design Doc da fase anterior analisado e componentes mapeados",
        "Prompts otimizados para Google Stitch gerados e salvos em prototipos/stitch-prompts.md",
        "Protótipos criados no stitch.withgoogle.com usando os prompts gerados",
        "Arquivos HTML exportados do Stitch e salvos na pasta prototipos/",
        "Protótipos HTML validados pelo sistema (score >= 50)",
    ],
    entregavel_esperado: "prototipos.md",
};

/**
 * Obtém fluxo com fase de Stitch opcional.
 * Se usarStitch=true, insere fase de prototipagem APÓS a fase "Design".
 * 
 * v10.0: Busca dinamicamente a fase "Design" em vez de hardcoded na posição 3,
 * porque no fluxo simples Design é fase 2, e no médio/complexo é fase 3.
 */
export function getFluxoComStitch(nivel: "simples" | "medio" | "complexo", usarStitch: boolean): Fluxo {
    const base = getFluxo(nivel);

    if (!usarStitch) {
        return base;
    }

    // Encontrar a fase "Design" dinamicamente
    const designIndex = base.fases.findIndex(f => f.nome === 'Design');
    if (designIndex === -1) {
        // Sem fase de Design, retorna fluxo base sem Stitch
        return base;
    }

    const insertAfter = designIndex + 1; // Inserir APÓS Design
    const stitchNumero = base.fases[designIndex].numero + 1;

    const fasesComStitch: Fase[] = [
        ...base.fases.slice(0, insertAfter),
        { ...FASE_STITCH, numero: stitchNumero },
        ...base.fases.slice(insertAfter).map(f => ({ ...f, numero: f.numero + 1 }))
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
