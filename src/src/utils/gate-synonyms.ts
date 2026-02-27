/**
 * v7.1 FIX 4: Mapa de sinônimos pt↔en para validação de gate checklist.
 * 
 * O problema: gate checklist items em português (ex: "Versionamento definido")
 * eram validados via keyword matching literal no conteúdo do entregável.
 * Conteúdo em inglês (ex: YAML com "version: 1.0.0") não continha "versionamento",
 * causando falhas falsas no gate.
 * 
 * Solução: expandir cada keyword com sinônimos em ambos os idiomas,
 * termos técnicos equivalentes e variações comuns.
 */

/**
 * Mapa de sinônimos: keyword → lista de termos equivalentes.
 * Inclui traduções pt↔en, abreviações e termos técnicos.
 * Todas as chaves e valores devem ser lowercase.
 */
export const KEYWORD_SYNONYMS: Record<string, string[]> = {
    // === Versionamento / Versioning ===
    'versionamento': ['version', 'versioning', 'semver', 'versionamento', 'versão', 'versao'],
    'version': ['versionamento', 'versioning', 'semver', 'versão', 'versao'],
    'versioning': ['versionamento', 'version', 'semver'],

    // === Definido / Defined ===
    'definido': ['defined', 'definida', 'especificado', 'especificada', 'configurado', 'configurada', 'estabelecido'],
    'definida': ['defined', 'definido', 'especificada', 'configurada', 'estabelecida'],
    'defined': ['definido', 'definida', 'specified', 'configured', 'established'],

    // === Breaking changes ===
    'breaking': ['breaking', 'incompatível', 'incompativel', 'migração', 'migracao', 'deprecation'],
    'changes': ['changes', 'mudanças', 'mudancas', 'alterações', 'alteracoes'],
    'documentados': ['documented', 'documentadas', 'registrados', 'registradas', 'changelog', 'registro'],
    'documentadas': ['documented', 'documentados', 'registradas', 'changelog'],
    'documented': ['documentados', 'documentadas', 'registrados', 'changelog'],

    // === OpenAPI / Swagger ===
    'openapi': ['openapi', 'swagger', 'api-spec', 'open-api', 'oas'],
    'swagger': ['openapi', 'swagger', 'api-spec'],
    'completo': ['complete', 'completa', 'abrangente', 'comprehensive', 'full'],
    'complete': ['completo', 'completa', 'abrangente', 'full'],

    // === Bounded Contexts / DDD ===
    'bounded': ['bounded', 'delimitado', 'delimitada', 'contexto'],
    'contexts': ['contexts', 'contextos', 'domínios', 'dominios'],
    'microserviços': ['microservices', 'microserviço', 'microservicos', 'serviços', 'services'],
    'microservices': ['microserviços', 'microservicos', 'services', 'serviços'],

    // === CQRS / Event Sourcing ===
    'cqrs': ['cqrs', 'command', 'query', 'segregation', 'command-query'],
    'avaliado': ['evaluated', 'avaliada', 'analisado', 'analisada', 'assessed', 'reviewed'],
    'evaluated': ['avaliado', 'avaliada', 'analisado', 'assessed'],
    'planejado': ['planned', 'planejada', 'projetado', 'projetada', 'designed'],
    'planned': ['planejado', 'planejada', 'projetado', 'designed'],

    // === Segurança / Security ===
    'owasp': ['owasp', 'security', 'segurança', 'seguranca', 'vulnerabilidade'],
    'autenticação': ['authentication', 'autenticacao', 'auth', 'jwt', 'oauth', 'bearer'],
    'authentication': ['autenticação', 'autenticacao', 'auth', 'jwt', 'oauth'],
    'threat': ['threat', 'ameaça', 'ameaca', 'risco', 'risk'],
    'modeling': ['modeling', 'modelagem', 'modelação', 'model'],
    'compliance': ['compliance', 'conformidade', 'regulatório', 'regulatorio', 'lgpd', 'gdpr'],
    'pentest': ['pentest', 'penetration', 'pen-test', 'teste-invasão', 'teste-invasao'],

    // === Testes / Testing ===
    'pirâmide': ['pyramid', 'piramide', 'pirâmide', 'layers', 'camadas'],
    'pyramid': ['pirâmide', 'piramide', 'layers'],
    'contract': ['contract', 'contrato', 'pact', 'consumer-driven'],
    'contrato': ['contract', 'pact', 'consumer-driven'],
    'strategy': ['strategy', 'estratégia', 'estrategia', 'plano', 'abordagem'],
    'estratégia': ['strategy', 'estrategia', 'plano', 'approach'],

    // === Performance / Escalabilidade ===
    'caching': ['caching', 'cache', 'redis', 'memcached', 'cdn'],
    'cache': ['caching', 'redis', 'memcached', 'cdn'],
    'métricas': ['metrics', 'metricas', 'kpis', 'slos', 'indicators'],
    'metrics': ['métricas', 'metricas', 'kpis', 'slos'],
    'load': ['load', 'carga', 'stress', 'performance'],

    // === Observabilidade / Observability ===
    'logs': ['logs', 'logging', 'log', 'winston', 'elk', 'kibana'],
    'logging': ['logs', 'log', 'winston', 'elk'],
    'tracing': ['tracing', 'traces', 'trace', 'opentelemetry', 'jaeger', 'rastreamento'],
    'distribuído': ['distributed', 'distribuido', 'cross-service'],
    'distributed': ['distribuído', 'distribuido', 'cross-service'],
    'dashboards': ['dashboards', 'dashboard', 'grafana', 'painel', 'painéis', 'paineis'],

    // === Arquitetura / Architecture ===
    'diagrama': ['diagram', 'diagramas', 'c4', 'uml', 'mermaid'],
    'diagram': ['diagrama', 'diagramas', 'c4', 'uml', 'mermaid'],
    'stack': ['stack', 'tecnologia', 'tecnologias', 'tech-stack', 'tooling'],
    'justificada': ['justified', 'justificado', 'motivada', 'motivado', 'rationale'],
    'justified': ['justificada', 'justificado', 'motivated', 'rationale'],
    'adrs': ['adrs', 'adr', 'architectural-decision', 'decisões', 'decisoes', 'decision-record'],

    // === Componentes / Components ===
    'componentes': ['components', 'componente', 'modules', 'módulos', 'modulos'],
    'components': ['componentes', 'componente', 'modules', 'módulos'],
    'implementados': ['implemented', 'implementadas', 'criados', 'criadas', 'built'],
    'implemented': ['implementados', 'implementadas', 'criados', 'built'],

    // === Integração / Integration ===
    'integração': ['integration', 'integracao', 'integrations', 'integrated'],
    'integration': ['integração', 'integracao', 'integrations'],
    'mocks': ['mocks', 'mock', 'stub', 'stubs', 'fake', 'msw', 'wiremock', 'prism'],

    // === Banco de Dados / Database ===
    'relacional': ['relational', 'sql', 'postgres', 'postgresql', 'mysql', 'database'],
    'relational': ['relacional', 'sql', 'postgres', 'postgresql', 'mysql'],
    'índices': ['indexes', 'indices', 'index', 'indexação', 'indexacao'],
    'indexes': ['índices', 'indices', 'index', 'indexação'],
    'migrações': ['migrations', 'migracoes', 'migration', 'migrate', 'schema'],
    'migrations': ['migrações', 'migracoes', 'migration', 'schema'],

    // === Requisitos / Requirements ===
    'requisitos': ['requirements', 'requisito', 'requerimentos', 'specs'],
    'requirements': ['requisitos', 'requisito', 'requerimentos', 'specs'],
    'funcionais': ['functional', 'funcional', 'features', 'funcionalidades'],
    'functional': ['funcionais', 'funcional', 'features'],
    'critérios': ['criteria', 'criterios', 'acceptance', 'aceitação', 'aceitacao'],
    'criteria': ['critérios', 'criterios', 'acceptance'],
    'gherkin': ['gherkin', 'bdd', 'given-when-then', 'cenário', 'cenarios'],

    // === UX / Design ===
    'wireframes': ['wireframes', 'wireframe', 'mockups', 'protótipos', 'prototipos', 'sketch'],
    'jornadas': ['journeys', 'jornada', 'user-journey', 'fluxo', 'flow'],
    'journeys': ['jornadas', 'jornada', 'user-journey'],
    'acessibilidade': ['accessibility', 'a11y', 'wcag', 'aria'],
    'accessibility': ['acessibilidade', 'a11y', 'wcag', 'aria'],
    'navegação': ['navigation', 'navegacao', 'routing', 'menu', 'nav'],
    'navigation': ['navegação', 'navegacao', 'routing', 'menu'],

    // === Backlog / Planejamento ===
    'épicos': ['epics', 'epicos', 'epic', 'épico'],
    'epics': ['épicos', 'epicos', 'epic'],
    'features': ['features', 'funcionalidades', 'feature', 'histórias', 'stories'],
    'priorizadas': ['prioritized', 'priorizada', 'priorizado', 'ranked', 'ordered'],
    'prioritized': ['priorizadas', 'priorizada', 'ranked'],
    'histórias': ['stories', 'historias', 'user-stories', 'story', 'user-story'],
    'stories': ['histórias', 'historias', 'user-stories', 'story'],
    'sprints': ['sprints', 'sprint', 'iterações', 'iteracoes', 'iterations'],

    // === Deploy / CI/CD ===
    'pipeline': ['pipeline', 'ci/cd', 'cicd', 'ci-cd', 'github-actions', 'jenkins'],
    'deploy': ['deploy', 'deployment', 'implantação', 'implantacao', 'release'],
    'monitoramento': ['monitoring', 'monitoracao', 'observability', 'alerting'],
    'monitoring': ['monitoramento', 'monitoracao', 'observability'],

    // === Genéricos ===
    'mapeados': ['mapped', 'mapeadas', 'mapeado', 'identified', 'identificados', 'listed'],
    'mapped': ['mapeados', 'mapeadas', 'identified'],
    'selecionadas': ['selected', 'selecionados', 'escolhidas', 'chosen'],
    'selected': ['selecionadas', 'selecionados', 'chosen'],
    'configuradas': ['configured', 'configurados', 'setup', 'definidas'],
    'configured': ['configuradas', 'configurados', 'setup'],
    'criados': ['created', 'criadas', 'gerados', 'geradas', 'generated'],
    'created': ['criados', 'criadas', 'gerados', 'generated'],
    'passados': ['passing', 'passadas', 'passed', 'green', 'ok'],
    'passing': ['passados', 'passadas', 'passed', 'green'],
    'responsivo': ['responsive', 'responsiva', 'mobile-first', 'adaptive'],
    'responsive': ['responsivo', 'responsiva', 'mobile-first'],
    'acessível': ['accessible', 'acessivel', 'a11y', 'wcag'],
    'accessible': ['acessível', 'acessivel', 'a11y'],
};

/**
 * Expande uma lista de keywords com seus sinônimos.
 * Retorna a lista original + todos os sinônimos encontrados (sem duplicatas).
 */
export function expandKeywordsWithSynonyms(keywords: string[]): string[] {
    const expanded = new Set<string>(keywords);

    for (const kw of keywords) {
        const synonyms = KEYWORD_SYNONYMS[kw];
        if (synonyms) {
            for (const syn of synonyms) {
                expanded.add(syn);
            }
        }
    }

    return Array.from(expanded);
}
