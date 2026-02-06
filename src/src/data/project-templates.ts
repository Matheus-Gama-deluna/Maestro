/**
 * Templates de Projeto — Projetos pré-configurados para onboarding rápido
 * 
 * Cada template contém discovery pré-preenchido, tipo/complexidade inferidos,
 * e stack sugerida. Permite criar projeto com 1-2 interações.
 */

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    tipo_artefato: 'poc' | 'script' | 'internal' | 'product';
    nivel_complexidade: 'simples' | 'medio' | 'complexo';
    discovery_preenchido: {
        problema: string;
        publico_alvo: string;
        funcionalidades_principais: string[];
        plataformas: string[];
        stack_sugerida: {
            frontend?: string;
            backend?: string;
            database?: string;
            infra?: string;
        };
    };
    perguntas_essenciais: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: "saas-b2b",
        name: "SaaS B2B",
        description: "Aplicação SaaS multi-tenant para empresas com autenticação, dashboard e billing",
        emoji: "🏢",
        tipo_artefato: "product",
        nivel_complexidade: "complexo",
        discovery_preenchido: {
            problema: "Empresas precisam de uma solução digital para gerenciar [processo]",
            publico_alvo: "Empresas de médio porte, gestores e equipes operacionais",
            funcionalidades_principais: [
                "Autenticação multi-tenant (SSO opcional)",
                "Dashboard com métricas e KPIs",
                "Gestão de usuários e permissões (RBAC)",
                "Planos e billing (Stripe/similar)",
                "API RESTful para integrações",
                "Notificações (email + in-app)",
            ],
            plataformas: ["Web (responsivo)"],
            stack_sugerida: {
                frontend: "Next.js + TailwindCSS + shadcn/ui",
                backend: "Node.js + Express/Fastify",
                database: "PostgreSQL + Redis",
                infra: "Docker + AWS/Vercel",
            },
        },
        perguntas_essenciais: [
            "Qual processo específico o SaaS vai resolver?",
            "Qual será o modelo de pricing (freemium, por seat, por uso)?",
            "Precisa de integrações com sistemas externos?",
        ],
    },
    {
        id: "ecommerce",
        name: "E-commerce",
        description: "Loja virtual com catálogo, carrinho, checkout e gestão de pedidos",
        emoji: "🛒",
        tipo_artefato: "product",
        nivel_complexidade: "complexo",
        discovery_preenchido: {
            problema: "Vender [produtos/serviços] online com experiência de compra fluida",
            publico_alvo: "Consumidores finais (B2C) interessados em [nicho]",
            funcionalidades_principais: [
                "Catálogo de produtos com busca e filtros",
                "Carrinho de compras persistente",
                "Checkout com múltiplos métodos de pagamento",
                "Gestão de pedidos e status",
                "Sistema de avaliações",
                "Painel administrativo",
            ],
            plataformas: ["Web (responsivo)", "PWA"],
            stack_sugerida: {
                frontend: "Next.js + TailwindCSS",
                backend: "Node.js + API REST",
                database: "PostgreSQL",
                infra: "Vercel + Stripe",
            },
        },
        perguntas_essenciais: [
            "Que tipo de produtos serão vendidos?",
            "Qual gateway de pagamento (Stripe, PagSeguro, etc.)?",
            "Precisa de gestão de estoque?",
        ],
    },
    {
        id: "api-microservices",
        name: "API / Microserviços",
        description: "API RESTful ou sistema de microserviços com documentação e testes",
        emoji: "🔌",
        tipo_artefato: "product",
        nivel_complexidade: "medio",
        discovery_preenchido: {
            problema: "Expor dados/funcionalidades como API para consumo por [clientes/apps]",
            publico_alvo: "Desenvolvedores e sistemas que consomem a API",
            funcionalidades_principais: [
                "API RESTful com versionamento",
                "Autenticação (JWT/OAuth2)",
                "Rate limiting e throttling",
                "Documentação OpenAPI/Swagger",
                "Testes automatizados (unit + integration)",
                "Logging e monitoramento",
            ],
            plataformas: ["API Server"],
            stack_sugerida: {
                backend: "Node.js + Fastify (ou Express)",
                database: "PostgreSQL + Redis (cache)",
                infra: "Docker + CI/CD",
            },
        },
        perguntas_essenciais: [
            "Quais recursos/entidades a API vai expor?",
            "Qual volume esperado de requisições?",
            "Precisa de comunicação assíncrona (filas, eventos)?",
        ],
    },
    {
        id: "mobile-app",
        name: "App Mobile",
        description: "Aplicativo mobile cross-platform com backend e push notifications",
        emoji: "📱",
        tipo_artefato: "product",
        nivel_complexidade: "complexo",
        discovery_preenchido: {
            problema: "Usuários precisam de [funcionalidade] acessível pelo celular",
            publico_alvo: "Usuários mobile (iOS e Android)",
            funcionalidades_principais: [
                "Telas principais com navegação fluida",
                "Autenticação (social login + email)",
                "Push notifications",
                "Sincronização offline-first",
                "Integração com API backend",
                "Deep linking",
            ],
            plataformas: ["iOS", "Android"],
            stack_sugerida: {
                frontend: "React Native + Expo",
                backend: "Node.js + API REST",
                database: "PostgreSQL + SQLite (local)",
                infra: "AWS/Firebase",
            },
        },
        perguntas_essenciais: [
            "Qual a funcionalidade principal do app?",
            "Precisa funcionar offline?",
            "Quais integrações nativas (câmera, GPS, etc.)?",
        ],
    },
    {
        id: "landing-page",
        name: "Landing Page",
        description: "Página de captura ou institucional com formulário e analytics",
        emoji: "🌐",
        tipo_artefato: "poc",
        nivel_complexidade: "simples",
        discovery_preenchido: {
            problema: "Apresentar [produto/serviço] e capturar leads/conversões",
            publico_alvo: "Visitantes interessados em [oferta]",
            funcionalidades_principais: [
                "Hero section com CTA principal",
                "Seções de benefícios/features",
                "Social proof (depoimentos, logos)",
                "Formulário de captura",
                "Analytics e tracking",
                "SEO otimizado",
            ],
            plataformas: ["Web"],
            stack_sugerida: {
                frontend: "Next.js + TailwindCSS",
                infra: "Vercel",
            },
        },
        perguntas_essenciais: [
            "Qual é a oferta/produto principal?",
            "Qual a ação desejada do visitante (cadastro, compra, contato)?",
        ],
    },
    {
        id: "dashboard",
        name: "Dashboard / Admin Panel",
        description: "Painel administrativo com gráficos, tabelas e gestão de dados",
        emoji: "📊",
        tipo_artefato: "internal",
        nivel_complexidade: "medio",
        discovery_preenchido: {
            problema: "Equipe precisa visualizar e gerenciar [dados/processos] de forma centralizada",
            publico_alvo: "Equipe interna (gestores, analistas, operadores)",
            funcionalidades_principais: [
                "Dashboard com gráficos e KPIs",
                "Tabelas com busca, filtro e paginação",
                "CRUD de entidades principais",
                "Controle de acesso (RBAC)",
                "Exportação de dados (CSV, PDF)",
                "Auditoria de ações",
            ],
            plataformas: ["Web"],
            stack_sugerida: {
                frontend: "Next.js + shadcn/ui + Recharts",
                backend: "Node.js + Prisma",
                database: "PostgreSQL",
            },
        },
        perguntas_essenciais: [
            "Quais dados/métricas precisam ser visualizados?",
            "Quantos tipos de usuário com permissões diferentes?",
            "Precisa integrar com sistemas existentes?",
        ],
    },
];

/**
 * Busca template por ID
 */
export function getTemplate(id: string): ProjectTemplate | null {
    return PROJECT_TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Lista templates disponíveis formatado
 */
export function listTemplatesFormatted(): string {
    return PROJECT_TEMPLATES.map(t =>
        `- **${t.emoji} ${t.name}** (\`${t.id}\`) — ${t.description} [${t.nivel_complexidade}]`
    ).join("\n");
}
