import type { Fluxo, Fase } from "../types/index.js";

// Fluxo para nova feature (6 fases)
export const FLUXO_FEATURE: Fluxo = {
    nivel: "medio",
    total_fases: 6,
    fases: [
        {
            numero: 1,
            nome: "Análise de Impacto",
            especialista: "Arquitetura de Software",
            template: "adr",
            gate_checklist: [
                "Impacto no modelo de dados analisado",
                "Endpoints afetados identificados",
                "Dependências mapeadas",
            ],
            entregavel_esperado: "analise-impacto.md",
        },
        {
            numero: 2,
            nome: "Requisitos da Feature",
            especialista: "Engenharia de Requisitos",
            template: "requisitos",
            gate_checklist: [
                "Requisitos funcionais definidos",
                "Critérios de aceite especificados",
            ],
            entregavel_esperado: "requisitos-feature.md",
        },
        {
            numero: 3,
            nome: "Design",
            especialista: "UX Design",
            template: "design-doc",
            gate_checklist: [
                "Wireframes criados",
                "Fluxo de usuário definido",
            ],
            entregavel_esperado: "design-feature.md",
        },
        {
            numero: 4,
            nome: "Contrato API",
            especialista: "Contrato de API",
            template: "contrato-api",
            gate_checklist: [
                "Endpoints definidos",
                "Schema OpenAPI atualizado",
            ],
            entregavel_esperado: "contrato-feature.yaml",
        },
        {
            numero: 5,
            nome: "Implementação",
            especialista: "Desenvolvimento",
            template: "historia-usuario",
            gate_checklist: [
                "Código implementado",
                "Testes passando",
            ],
            entregavel_esperado: "codigo",
        },
        {
            numero: 6,
            nome: "Validação",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Testes de regressão executados",
                "Feature aprovada em review",
            ],
            entregavel_esperado: "validacao.md",
        },
    ],
};

// Fluxo para correção de bug (5 fases)
export const FLUXO_BUG: Fluxo = {
    nivel: "simples",
    total_fases: 5,
    fases: [
        {
            numero: 1,
            nome: "Reprodução",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Bug reproduzido consistentemente",
                "Ambiente de reprodução documentado",
                "Logs coletados",
            ],
            entregavel_esperado: "reproducao-bug.md",
        },
        {
            numero: 2,
            nome: "Análise de Causa Raiz",
            especialista: "Desenvolvimento",
            template: "adr",
            gate_checklist: [
                "Causa raiz identificada",
                "Código problemático localizado",
                "Impacto avaliado",
            ],
            entregavel_esperado: "causa-raiz.md",
        },
        {
            numero: 3,
            nome: "Correção",
            especialista: "Desenvolvimento",
            template: "historia-usuario",
            gate_checklist: [
                "Fix implementado",
                "Testes unitários adicionados",
            ],
            entregavel_esperado: "codigo",
        },
        {
            numero: 4,
            nome: "Teste de Regressão",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Bug não reproduz mais",
                "Testes de regressão passando",
                "Nenhum efeito colateral",
            ],
            entregavel_esperado: "teste-regressao.md",
        },
        {
            numero: 5,
            nome: "Deploy",
            especialista: "DevOps",
            template: "arquitetura",
            gate_checklist: [
                "Hotfix aplicado",
                "Monitoramento ativo",
            ],
            entregavel_esperado: "deploy-hotfix.md",
        },
    ],
};

// Fluxo para refatoração (6 fases)
export const FLUXO_REFATORACAO: Fluxo = {
    nivel: "medio",
    total_fases: 6,
    fases: [
        {
            numero: 1,
            nome: "Análise do Código Legado",
            especialista: "Arquitetura de Software",
            template: "arquitetura",
            gate_checklist: [
                "Código legado mapeado",
                "Débito técnico quantificado",
                "Riscos identificados",
            ],
            entregavel_esperado: "analise-legado.md",
        },
        {
            numero: 2,
            nome: "Plano de Refatoração",
            especialista: "Arquitetura de Software",
            template: "adr",
            gate_checklist: [
                "Estratégia de refatoração definida",
                "Fases de migração planejadas",
                "Rollback strategy definido",
            ],
            entregavel_esperado: "plano-refatoracao.md",
        },
        {
            numero: 3,
            nome: "Testes de Caracterização",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Testes do comportamento atual criados",
                "Cobertura baseline estabelecida",
            ],
            entregavel_esperado: "testes-caracterizacao.md",
        },
        {
            numero: 4,
            nome: "Refatoração Incremental",
            especialista: "Desenvolvimento",
            template: "historia-usuario",
            gate_checklist: [
                "Código refatorado",
                "Testes passando",
                "Comportamento preservado",
            ],
            entregavel_esperado: "codigo",
        },
        {
            numero: 5,
            nome: "Validação",
            especialista: "Análise de Testes",
            template: "plano-testes",
            gate_checklist: [
                "Testes de regressão passando",
                "Performance validada",
                "Code review aprovado",
            ],
            entregavel_esperado: "validacao-refatoracao.md",
        },
        {
            numero: 6,
            nome: "Documentação",
            especialista: "Arquitetura de Software",
            template: "arquitetura",
            gate_checklist: [
                "Arquitetura atualizada",
                "ADRs documentados",
                "README atualizado",
            ],
            entregavel_esperado: "documentacao.md",
        },
    ],
};
