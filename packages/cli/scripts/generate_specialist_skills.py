"""Utility script to (re)generate skill folders for each Maestro specialist.

This script centralizes the mapping documented em `ESPECIALISTAS_COMPLETOS.md`
e cria uma skill compatível com Windsurf para cada especialista.
"""

from __future__ import annotations

from pathlib import Path
from textwrap import dedent


BASE_SKILLS_DIR = Path(__file__).resolve().parents[1] / "content" / "skills"


def format_list(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


SPECIALISTS = [
    {
        "slug": "specialist-gestao-produto",
        "title": "Gestão de Produto",
        "phase": "Fase 1 · Produto",
        "description": "Planejamento estratégico de produto com foco em PRD executável e métricas claras.",
        "mission": "Transformar ideias em PRDs executáveis em 60-90 minutos, garantindo problema bem definido, personas e North Star alinhada.",
        "activation": "definir visão, problema e prioridades antes de avançar para requisitos ou design.",
        "inputs": [
            "Ideia ou notas brutas do produto",
            "Contexto de negócio, métricas atuais e stakeholders",
            "Restrições conhecidas (timeline, budget, compliance)",
        ],
        "outputs": [
            "`docs/01-produto/PRD.md` — PRD com visão, escopo e métricas",
            "Matriz de priorização (ex.: RICE) e mapa de personas",
        ],
        "gate": [
            "Problema e oportunidade claramente descritos",
            "Pelo menos 2 personas com Jobs to Be Done",
            "Backlog inicial ou MVP priorizado",
            "North Star Metric definida",
        ],
        "doc_path": "content/specialists/Especialista em Gestão de Produto.md",
        "related": ["plan-writing", "brainstorming"],
        "workflows": ["/maestro", "/iniciar-projeto", "/avancar-fase"],
    },
    {
        "slug": "specialist-engenharia-requisitos-ia",
        "title": "Engenharia de Requisitos com IA",
        "phase": "Fase 2 · Requisitos",
        "description": "Refinamento de requisitos funcionais e não funcionais com rastreabilidade.",
        "mission": "Transformar visão de produto em requisitos claros, testáveis e rastreáveis.",
        "activation": "documentar requisitos antes de modelagem de domínio ou UX detalhado.",
        "inputs": [
            "PRD aprovado",
            "Contexto do negócio e restrições",
            "Diretrizes de compliance e qualidade",
        ],
        "outputs": [
            "`docs/02-requisitos/requisitos.md` — documento de requisitos completo",
            "Matriz RF × Telas e critérios de aceite",
        ],
        "gate": [
            "Ids únicos por requisito",
            "Critérios de aceite testáveis",
            "RNFs mapeados",
            "Matriz de rastreabilidade preenchida",
        ],
        "doc_path": "content/specialists/Especialista em Engenharia de Requisitos com IA.md",
        "related": ["plan-writing", "documentation-templates"],
        "workflows": ["/continuar-fase", "/avancar-fase"],
    },
    {
        "slug": "specialist-ux-design",
        "title": "UX Design",
        "phase": "Fase 3 · UX",
        "description": "Design Document completo com jornadas, wireframes e compromissos de design.",
        "mission": "Entregar Design Document completo com jornadas, wireframes e critérios de acessibilidade.",
        "activation": "antes de qualquer implementação frontend ou prototipagem de alta fidelidade.",
        "inputs": [
            "PRD e requisitos aprovados",
            "Insights de pesquisa e constraints de marca",
            "Componentes existentes ou design system",
        ],
        "outputs": [
            "`docs/03-ux/design-doc.md` — Design Document",
            "Wireframes, fluxos e checklist de acessibilidade",
        ],
        "gate": [
            "Jornadas e fluxos mapeados",
            "Wireframes para telas críticas",
            "Critérios WCAG considerados",
            "Design Commitment fechado",
        ],
        "doc_path": "content/specialists/Especialista em UX Design.md",
        "related": ["frontend-design", "animation-guide", "mobile-design"],
        "workflows": ["/avancar-fase", "/implementar-historia"],
    },
    {
        "slug": "specialist-prototipagem-stitch",
        "title": "Prototipagem Rápida com Google Stitch",
        "phase": "Fase 3 · UX",
        "description": "Prototipagem acelerada com Google Stitch integrando IA e feedback rápido.",
        "mission": "Criar protótipos funcionais rapidamente para validar interações e fluxos.",
        "activation": "quando o time precisa testar UI navegável antes da implementação final.",
        "inputs": [
            "Design Document e requisitos priorizados",
            "Componentes ou guidelines existentes",
            "Cenários de teste com usuários",
        ],
        "outputs": [
            "Protótipo navegável no Stitch",
            "Lista de componentes/variantes aprovados",
            "Feedback consolidado",
        ],
        "gate": [
            "Protótipo testável",
            "Feedback capturado de stakeholders",
            "Issues priorizadas para iteração",
        ],
        "doc_path": "content/specialists/Especialista em Prototipagem Rápida com Google Stitch.md",
        "related": ["frontend-design", "animation-guide", "react-patterns"],
        "workflows": ["/maestro", "/avancar-fase"],
    },
    {
        "slug": "specialist-modelagem-dominio",
        "title": "Modelagem e Arquitetura de Domínio",
        "phase": "Fase 4 · Modelo de Domínio",
        "description": "DDD aplicado com entidades, regras de negócio e bounded contexts claros.",
        "mission": "Modelar entidades, agregados e regras de negócio que sustentem a arquitetura.",
        "activation": "quando precisamos alinhar domínio antes de banco e arquitetura técnica.",
        "inputs": [
            "Requisitos funcionais e não funcionais",
            "Design document e fluxos",
            "Insights de negócio",
        ],
        "outputs": [
            "`docs/04-modelo/modelo-dominio.md` — documento de domínio",
            "Diagramas de entidades e relacionamentos",
        ],
        "gate": [
            "Entidades e relacionamentos descritos",
            "Regras de negócio explícitas",
            "Bounded contexts identificados",
        ],
        "doc_path": "content/specialists/Especialista em Modelagem e Arquitetura de Domínio com IA.md",
        "related": ["database-design", "architecture"],
        "workflows": ["/continuar-fase", "/avancar-fase"],
    },
    {
        "slug": "specialist-banco-dados",
        "title": "Banco de Dados",
        "phase": "Fase 5 · Banco de Dados",
        "description": "Schema design, índices e migrações seguras para o projeto.",
        "mission": "Definir schema, índices e estratégia de migração garantindo performance.",
        "activation": "antes da implementação backend e após o modelo de domínio.",
        "inputs": [
            "Modelo de domínio aprovado",
            "Requisitos de escala e compliance",
            "Tecnologias-alvo definidas",
        ],
        "outputs": [
            "`docs/05-banco/design-banco.md`",
            "Scripts ou migrações iniciais",
        ],
        "gate": [
            "Schema normalizado",
            "Índices críticos definidos",
            "Considerações de performance registradas",
        ],
        "doc_path": "content/specialists/Especialista em Banco de Dados.md",
        "related": ["database-design", "performance-profiling"],
        "workflows": ["/continuar-fase", "/avancar-fase"],
    },
    {
        "slug": "specialist-arquitetura-software",
        "title": "Arquitetura de Software",
        "phase": "Fase 6 · Arquitetura",
        "description": "Technical Specification completa com C4, stack e ADRs.",
        "mission": "Definir arquitetura alvo, stack e decisões críticas seguindo princípios security-first.",
        "activation": "quando precisamos de blueprint técnico antes de desenvolvimento.",
        "inputs": [
            "PRD, requisitos e modelo de domínio",
            "Design doc e decisões de banco",
            "Restrições de negócio",
        ],
        "outputs": [
            "`docs/06-arquitetura/arquitetura.md`",
            "ADRs e diagramas C4",
        ],
        "gate": [
            "Diagramas C4 atualizados",
            "Stack justificada",
            "Segurança e autenticação definidas",
        ],
        "doc_path": "content/specialists/Especialista em Arquitetura de Software.md",
        "related": ["architecture", "database-design", "api-patterns", "intelligent-routing"],
        "workflows": ["/maestro", "/avancar-fase"],
    },
    {
        "slug": "specialist-seguranca-informacao",
        "title": "Segurança da Informação",
        "phase": "Fase 7 · Segurança",
        "description": "Avaliação OWASP, LGPD e threat modeling para o sistema.",
        "mission": "Garantir segurança ponta a ponta cobrindo OWASP Top 10, criptografia e LGPD.",
        "activation": "antes de testes, deploy e durante revisões críticas.",
        "inputs": [
            "Arquitetura e requisitos",
            "Fluxos de dados sensíveis",
            "Inventário de integrações",
        ],
        "outputs": [
            "`docs/06-seguranca/checklist-seguranca.md`",
            "Threat model e recomendações",
        ],
        "gate": [
            "OWASP revisado",
            "Autenticação/autorização validadas",
            "Dados sensíveis mapeados",
        ],
        "doc_path": "content/specialists/Especialista em Segurança da Informação.md",
        "related": ["vulnerability-scanner", "red-team-tactics", "security"],
        "workflows": ["/corrigir-bug", "/refatorar-codigo", "/deploy"],
    },
    {
        "slug": "specialist-analise-testes",
        "title": "Análise de Testes",
        "phase": "Fase 8 · Testes",
        "description": "Planejamento de testes unitários, integração e E2E com estratégia clara.",
        "mission": "Definir estratégia de testes cobrindo pirâmide completa e métricas de cobertura.",
        "activation": "antes da implementação massiva ou refatorações críticas.",
        "inputs": [
            "Requisitos priorizados",
            "Arquitetura e contratos de API",
            "Riscos conhecidos",
        ],
        "outputs": [
            "`docs/07-testes/plano-testes.md`",
            "Suite de casos priorizados",
        ],
        "gate": [
            "Casos de teste catalogados",
            "Estratégia por camada",
            "Ferramentas selecionadas",
        ],
        "doc_path": "content/specialists/Especialista em Análise de Testes.md",
        "related": ["testing-patterns", "tdd-workflow", "code-review-checklist", "webapp-testing"],
        "workflows": ["/maestro", "/implementar-historia", "/corrigir-bug"],
    },
    {
        "slug": "specialist-plano-execucao-ia",
        "title": "Plano de Execução com IA",
        "phase": "Fase 9 · Execução",
        "description": "Planejamento de backlog, épicos, histórias e roadmap operado com IA.",
        "mission": "Quebrar visão em backlog FE/BE, definir épicos, histórias e DoD.",
        "activation": "antes de iniciar desenvolvimento paralelo de squads.",
        "inputs": [
            "Todos os artefatos anteriores",
            "Capacidades do time e restrições de sprint",
            "Metas de release",
        ],
        "outputs": [
            "`docs/08-backlog/backlog.md`",
            "Timeline e roadmap",
        ],
        "gate": [
            "Épicos definidos",
            "Histórias priorizadas",
            "Definition of Done documentado",
        ],
        "doc_path": "content/specialists/Especialista em Plano de Execução com IA.md",
        "related": ["plan-writing", "documentation-templates", "brainstorming"],
        "workflows": ["/maestro", "/nova-feature"],
    },
    {
        "slug": "specialist-contrato-api",
        "title": "Contrato de API",
        "phase": "Fase 9 · Execução",
        "description": "Definição de OpenAPI, mocks, types e versionamento.",
        "mission": "Especificar contrato frontend-first com OpenAPI, mocks e tipagens.",
        "activation": "antes de desenvolvimento FE/BE para sincronizar interfaces.",
        "inputs": [
            "Requisitos e arquitetura",
            "Modelos de domínio",
            "Casos de uso críticos",
        ],
        "outputs": [
            "`docs/09-api/contrato-api.md`",
            "Mocks e types gerados",
        ],
        "gate": [
            "OpenAPI publicado",
            "Types gerados",
            "Mock server funcional",
        ],
        "doc_path": "content/specialists/Especialista em Contrato de API.md",
        "related": ["api-patterns", "documentation-templates", "testing-patterns"],
        "workflows": ["/implementar-historia", "/refatorar-codigo"],
    },
    {
        "slug": "specialist-desenvolvimento-frontend",
        "title": "Desenvolvimento Frontend",
        "phase": "Fase 10 · Desenvolvimento Frontend",
        "description": "Implementação de componentes, pages e hooks alinhados com design e contrato de API.",
        "mission": "Construir experiências frontend de alta qualidade com testes e integração ao contrato.",
        "activation": "durante execução de user stories frontend.",
        "inputs": [
            "Contrato de API e mocks",
            "Design document e componentes",
            "Backlog priorizado",
        ],
        "outputs": [
            "Componentes, pages e hooks",
            "Testes unitários e snapshots",
        ],
        "gate": [
            "Componentes funcionais",
            "Testes passando",
            "Integração com mocks",
        ],
        "doc_path": "content/specialists/Especialista em Desenvolvimento Frontend.md",
        "related": ["react-patterns", "frontend-design", "tailwind-patterns", "nextjs-best-practices", "animation-guide"],
        "workflows": ["/implementar-historia", "/corrigir-bug", "/refatorar-codigo"],
    },
    {
        "slug": "specialist-desenvolvimento-backend",
        "title": "Desenvolvimento e Vibe Coding Estruturado",
        "phase": "Fase 11 · Desenvolvimento Backend",
        "description": "Implementação de services, controllers e testes seguindo clean code.",
        "mission": "Construir serviços backend alinhados ao contrato, com testes e qualidade.",
        "activation": "para histórias backend, integrações ou refatorações de serviços.",
        "inputs": [
            "Contrato de API e arquitetura",
            "Modelo de domínio",
            "Backlog backend",
        ],
        "outputs": [
            "Services, controllers e entities",
            "Testes unitários e de integração",
        ],
        "gate": [
            "Services cobertos por testes",
            "Integração com frontend",
            "Documentação atualizada",
        ],
        "doc_path": "content/specialists/Especialista em Desenvolvimento e Vibe Coding Estruturado.md",
        "related": ["clean-code", "nodejs-best-practices", "python-patterns", "api-patterns", "database-design"],
        "workflows": ["/implementar-historia", "/corrigir-bug", "/refatorar-codigo"],
    },
    {
        "slug": "specialist-devops-infra",
        "title": "DevOps e Infraestrutura",
        "phase": "Fase 12 · DevOps",
        "description": "Pipelines, IaC, Docker e monitoramento para deploy seguro.",
        "mission": "Configurar CI/CD, contêineres e infraestrutura pronta para produção.",
        "activation": "antes de releases e para manter ambientes confiáveis.",
        "inputs": [
            "Arquitetura e requisitos de infraestrutura",
            "Secrets e credenciais seguras",
            "Métricas esperadas",
        ],
        "outputs": [
            "Pipelines CI/CD",
            "Dockerfiles, IaC e configs de deploy",
        ],
        "gate": [
            "Pipeline verde",
            "Imagens versionadas",
            "Deploy automatizado",
        ],
        "doc_path": "content/specialists/Especialista em DevOps e Infraestrutura.md",
        "related": ["deployment-procedures", "server-management", "powershell-windows", "bash-linux"],
        "workflows": ["/deploy", "/maestro"],
    },
    {
        "slug": "specialist-dados-analytics-ia",
        "title": "Dados e Analytics com IA",
        "phase": "Fase 13 · Dados",
        "description": "Pipelines ETL, dashboards e métricas inteligentes.",
        "mission": "Projetar e implementar pipelines de dados e dashboards guiados por IA.",
        "activation": "quando o projeto precisa de métricas acionáveis e automação de dados.",
        "inputs": [
            "Requisitos de negócio e KPIs",
            "Fontes de dados disponíveis",
            "Regras de privacidade",
        ],
        "outputs": [
            "ETL pipelines documentados",
            "Dashboards e métricas operacionais",
        ],
        "gate": [
            "ETL funcionando",
            "Dashboards acessíveis",
            "Métricas coletadas e monitoradas",
        ],
        "doc_path": "content/specialists/Especialista em Dados e Analytics com IA.md",
        "related": ["database-design", "performance-profiling"],
        "workflows": ["/nova-feature", "/maestro"],
    },
    {
        "slug": "specialist-documentacao-tecnica",
        "title": "Documentação Técnica",
        "phase": "Fase 14 · Documentação",
        "description": "Documentação técnica, API docs e guias de usuário consistentes.",
        "mission": "Produzir documentação atualizada para desenvolvedores e usuários.",
        "activation": "ao finalizar funcionalidades ou preparar handoff.",
        "inputs": [
            "Artefatos técnicos atualizados",
            "Histórico de decisões",
            "Guidelines de comunicação",
        ],
        "outputs": [
            "Documentação técnica consolidada",
            "API docs e user guides",
        ],
        "gate": [
            "Documentação completa",
            "API docs sincronizadas",
            "Guia de usuário publicado",
        ],
        "doc_path": "content/specialists/Especialista em Documentação Técnica.md",
        "related": ["documentation-templates", "plan-writing", "clean-code"],
        "workflows": ["/maestro", "/deploy"],
    },
    {
        "slug": "specialist-acessibilidade",
        "title": "Acessibilidade",
        "phase": "Fase 14 · Documentação",
        "description": "Garantia de conformidade WCAG, ARIA e testes com leitores de tela.",
        "mission": "Elevar o nível de acessibilidade em design e implementação.",
        "activation": "antes de releases públicos ou quando o produto precisa atender normas.",
        "inputs": [
            "Designs e componentes prontos",
            "Implementação frontend",
            "Requisitos legais",
        ],
        "outputs": [
            "Relatório de acessibilidade",
            "Backlog de ajustes prioritários",
        ],
        "gate": [
            "Conformidade WCAG AA",
            "Testes com leitores de tela",
            "Issues de acessibilidade priorizadas",
        ],
        "doc_path": "content/specialists/Especialista em Acessibilidade.md",
        "related": ["frontend-design", "webapp-testing"],
        "workflows": ["/refatorar-codigo", "/deploy"],
    },
    {
        "slug": "specialist-debugging-troubleshooting",
        "title": "Debugging e Troubleshooting",
        "phase": "Fase 15 · Debug",
        "description": "Análise de causa raiz e correção segura de bugs.",
        "mission": "Reproduzir, analisar e corrigir bugs documentando causa raiz.",
        "activation": "quando incidentes ou bugs críticos surgem.",
        "inputs": [
            "Bug report, logs e métricas",
            "Contexto do código afetado",
            "Testes existentes",
        ],
        "outputs": [
            "Bug corrigido e validado",
            "Root cause documentada",
        ],
        "gate": [
            "Reprodução garantida",
            "Testes de regressão passando",
            "Registro no resumo do projeto",
        ],
        "doc_path": "content/specialists/Especialista em Debugging e Troubleshooting.md",
        "related": ["systematic-debugging", "performance-profiling", "vulnerability-scanner"],
        "workflows": ["/corrigir-bug", "/refatorar-codigo"],
    },
    {
        "slug": "specialist-desenvolvimento-mobile",
        "title": "Desenvolvimento Mobile",
        "phase": "Fase 16 · Mobile",
        "description": "Implementação mobile (React Native/Flutter/iOS/Android) com testes e deploy.",
        "mission": "Construir apps mobile alinhados aos requisitos e prontos para loja.",
        "activation": "para histórias mobile dedicadas ou integrações mobile-first.",
        "inputs": [
            "Requisitos e design mobile",
            "Contrato de API",
            "Assets e guidelines",
        ],
        "outputs": [
            "App mobile funcional",
            "Testes e builds para lojas",
        ],
        "gate": [
            "App funcionando",
            "Testes passando",
            "Checklist de publicação atendido",
        ],
        "doc_path": "content/specialists/Especialista em Desenvolvimento Mobile.md",
        "related": ["mobile-design", "game-development", "i18n-localization"],
        "workflows": ["/implementar-historia", "/deploy"],
    },
    {
        "slug": "specialist-exploracao-codebase",
        "title": "Exploração de Codebase",
        "phase": "Fase 17 · Exploração",
        "description": "Mapeamento de codebases legadas e documentação de insights.",
        "mission": "Entender rapidamente uma codebase existente e produzir recomendações.",
        "activation": "em due diligences, auditorias ou repasses de projetos.",
        "inputs": [
            "Codebase existente",
            "Documentação disponível",
            "Objetivos de análise",
        ],
        "outputs": [
            "Relatório de exploração",
            "Mapa de dependências e riscos",
        ],
        "gate": [
            "Codebase mapeada",
            "Documentação atualizada",
            "Ações recomendadas",
        ],
        "doc_path": "content/specialists/Especialista em Exploração de Codebase.md",
        "related": ["clean-code", "systematic-debugging", "code-review-checklist"],
        "workflows": ["/maestro", "/refatorar-codigo"],
    },
    {
        "slug": "specialist-arquitetura-avancada",
        "title": "Arquitetura Avançada",
        "phase": "Especialista Avançado",
        "description": "DDD, CQRS, event sourcing e microservices para sistemas enterprise.",
        "mission": "Endereçar cenários complexos com padrões avançados e governança.",
        "activation": "quando o projeto exige arquitetura enterprise ou alta complexidade.",
        "inputs": [
            "Arquitetura base",
            "Requisitos complexos",
            "Mapeamento de domínios",
        ],
        "outputs": [
            "Blueprint avançado",
            "Planos para DDD/CQRS/event sourcing",
        ],
        "gate": [
            "DDD aplicado",
            "Eventos e fluxos modelados",
            "Estratégia de microserviços definida",
        ],
        "doc_path": "content/specialists/Especialista em Arquitetura Avançada.md",
        "related": ["architecture", "database-design", "api-patterns", "intelligent-routing", "app-builder"],
        "workflows": ["/maestro", "/refatorar-codigo"],
    },
    {
        "slug": "specialist-performance-escalabilidade",
        "title": "Performance e Escalabilidade",
        "phase": "Especialista Avançado",
        "description": "Perfis de carga, caching, tuning e auto-scaling para alto volume.",
        "mission": "Garantir que o sistema suporte milhões de requisições com desempenho.",
        "activation": "em projetos com SLOs agressivos ou problemas de performance.",
        "inputs": [
            "Requisitos de performance",
            "Métricas atuais",
            "Cenários de pico",
        ],
        "outputs": [
            "Planos de teste de carga",
            "Estratégias de caching e tuning",
        ],
        "gate": [
            "SLOs definidos",
            "Testes executados",
            "Otimizações implementadas",
        ],
        "doc_path": "content/specialists/Especialista em Performance e Escalabilidade.md",
        "related": ["performance-profiling", "systematic-debugging", "database-design", "deployment-procedures"],
        "workflows": ["/corrigir-bug", "/maestro"],
    },
    {
        "slug": "specialist-observabilidade",
        "title": "Observabilidade",
        "phase": "Especialista Avançado",
        "description": "Logs, métricas, tracing e SLOs para operação confiável.",
        "mission": "Construir stack de observabilidade completa com monitoramento proativo.",
        "activation": "antes ou durante operação em produção enterprise.",
        "inputs": [
            "Arquitetura e módulos",
            "Metas de confiabilidade",
            "Ferramentas disponíveis",
        ],
        "outputs": [
            "Stack de observabilidade",
            "SLOs e dashboards",
        ],
        "gate": [
            "Logs centralizados",
            "Métricas chave configuradas",
            "Alertas mapeados",
        ],
        "doc_path": "content/specialists/Especialista em Observabilidade.md",
        "related": ["performance-profiling", "deployment-procedures", "systematic-debugging"],
        "workflows": ["/deploy", "/maestro"],
    },
    {
        "slug": "specialist-migracao-modernizacao",
        "title": "Migração e Modernização",
        "phase": "Especialista Avançado",
        "description": "Planejamento Strangler Fig, migrações de dados e rollback seguro.",
        "mission": "Guiar transformações de legados com riscos controlados.",
        "activation": "quando um sistema legado precisa ser substituído em ondas.",
        "inputs": [
            "Mapeamento do legado",
            "Arquitetura alvo",
            "Planos de dados e cutover",
        ],
        "outputs": [
            "Plano de migração",
            "Mapeamento Strangler e matriz de riscos",
        ],
        "gate": [
            "Plano de rollback definido",
            "Fases e milestones claros",
            "Riscos mitigados",
        ],
        "doc_path": "content/specialists/Especialista em Migração e Modernização.md",
        "related": ["clean-code", "database-design", "deployment-procedures", "systematic-debugging"],
        "workflows": ["/refatorar-codigo", "/maestro"],
    },
    {
        "slug": "specialist-mobile-design-avancado",
        "title": "Mobile Design (Avançado)",
        "phase": "Especialista Avançado",
        "description": "Arquitetura mobile enterprise com performance e segurança.",
        "mission": "Definir arquitetura mobile escalável para apps enterprise.",
        "activation": "em projetos mobile críticos ou com requisitos avançados.",
        "inputs": [
            "Requisitos mobile complexos",
            "Stack e integrações",
            "Políticas de segurança",
        ],
        "outputs": [
            "Arquitetura mobile enterprise",
            "Guidelines de performance e segurança",
        ],
        "gate": [
            "Patterns mobile definidos",
            "Performance otimizada",
            "Segurança auditada",
        ],
        "doc_path": "content/specialists/Especialista em Desenvolvimento Mobile.md",
        "related": ["mobile-design", "frontend-design", "game-development", "i18n-localization"],
        "workflows": ["/nova-feature", "/deploy"],
    },
]


def build_skill_content(spec: dict[str, object]) -> str:
    return dedent(
        f"""
        ---
        name: {spec['slug']}
        description: {spec['description']}
        allowed-tools: Read, Write, Edit, Glob, Grep
        ---

        # {spec['title']} · Skill do Especialista

        ## 🎯 Missão
        {spec['mission']}

        ## 🧭 Quando ativar
        - Fase: {spec['phase']}
        - Workflows recomendados: {', '.join(spec['workflows'])}
        - Use quando precisar {spec['activation']}

        ## 📥 Inputs obrigatórios
        {format_list(spec['inputs'])}

        ## 📤 Outputs gerados
        {format_list(spec['outputs'])}

        ## ✅ Quality Gate
        {format_list(spec['gate'])}

        ## 🔗 Skills complementares
        {format_list([f"`{skill}`" for skill in spec['related']]) if spec['related'] else '- (esta skill é auto-suficiente)'}

        ## 📂 Referências essenciais
        - Especialista original: `{spec['doc_path']}`
        - Artefatos alvo:
        {format_list(spec['outputs'])}
        """
    ).strip() + "\n"


def main() -> None:
    BASE_SKILLS_DIR.mkdir(parents=True, exist_ok=True)

    for spec in SPECIALISTS:
        folder = BASE_SKILLS_DIR / spec["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        skill_file = folder / "SKILL.md"
        skill_file.write_text(build_skill_content(spec), encoding="utf-8")

    print(f"✅ Generated {len(SPECIALISTS)} specialist skills in {BASE_SKILLS_DIR}")


if __name__ == "__main__":
    main()
