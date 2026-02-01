# 🚀 Especialista em Dados e Analytics

## Visão Geral

Especialista responsável por projetar e implementar pipelines de dados, modelagem dimensional e dashboards inteligentes. Este especialista transforma dados brutos em insights acionáveis para tomada de decisão.

## 🎯 Missão Principal

Implementar engenharia de dados moderna com foco em:
- **Pipelines ETL/ELT** confiáveis e escaláveis
- **Modelagem dimensional** para análises rápidas
- **Qualidade e governança** de dados
- **Dashboards e KPIs** para tomada de decisão

## 📁 Estrutura de Diretórios

```
specialist-dados-analytics-ia/
├── SKILL.md                    # Skill principal (< 500 linhas)
├── README.md                   # Documentação completa
├── MCP_INTEGRATION.md          # Guia para implementação MCP
├── resources/                  # Recursos carregados sob demanda
│   ├── templates/             # Templates estruturados
│   │   ├── feature.md ✅
│   │   ├── slo-sli.md ✅
│   │   └── requisitos.md ✅
│   ├── examples/             # Exemplos práticos
│   │   └── analytics-examples.md
│   ├── checklists/           # Validação automática (via MCP)
│   │   └── analytics-validation.md
│   └── reference/            # Guias técnicos
│       └── analytics-guide.md
└── mcp_functions/             # Funções MCP (referência)
    ├── init_analytics_pipeline.py
    ├── validate_analytics_quality.py
    └── generate_insights_dashboard.py
```

## 🔄 Fluxo de Trabalho

### 1. Contexto de Entrada
- **Modelo de Domínio**: Entidades e relacionamentos
- **Requisitos de Negócio**: KPIs e métricas de sucesso
- **Fontes de Dados**: APIs, databases, arquivos
- **Infraestrutura**: Data warehouse, data lake

### 2. Processo Principal
1. **Discovery** (15 min): Análise de requisitos e fontes
2. **Modelagem**: Design dimensional e schema
3. **Pipeline**: Implementação ETL/ELT
4. **Validação**: Testes de qualidade
5. **Dashboard**: Visualização e KPIs
6. **Monitoramento**: SLAs e alertas

### 3. Entregáveis
- **Feature de Analytics**: Documentação completa
- **Pipeline ETL/ELT**: Código e documentação
- **Modelo Dimensional**: Schema e relacionamentos
- **Dashboard**: Visualização interativa
- **Testes de Qualidade**: Validação automatizada

## 🛠️ Templates Disponíveis

### Template Principal: feature.md
Estrutura completa para feature de analytics:

```markdown
# 📊 Feature de Analytics: [Nome da Feature]

## 📋 Metadados
- Objetivo de Negócio
- KPIs de Sucesso
- Fontes de Dados
- Stack Tecnológico

## 📥 Fontes de Dados
- Schema de entrada
- Frequência de atualização
- Confiabilidade

## 🔄 Pipeline de Dados
- Extração (Extract)
- Transformação (Transform)
- Carga (Load)

## 📊 Modelagem Dimensional
- Star Schema
- Tabelas de fato
- Dimensões

## 📈 KPIs e Métricas
- Métricas principais
- Fórmulas SQL
- Dashboard

## 🎨 Visualização
- Ferramenta
- Gráficos
- Filtros
```

### Templates de Apoio
- **slo-sli.md**: Service Level Objectives/Indicators
- **requisitos.md**: Requisitos de dados e analytics

## ✅ Quality Gates

### Critérios de Validação
- **Fontes documentadas**: 100% das fontes mapeadas
- **Schema definido**: Estrutura validada e documentada
- **Pipeline implementado**: ETL/ELT funcionando
- **Qualidade validada**: Testes automatizados passando
- **Dashboard funcional**: Visualização ativa e atualizada
- **KPIs calculados**: Métricas corretas e monitoradas

### Threshold de Qualidade
- **Score Mínimo**: 80 pontos para aprovação automática
- **Campos Obrigatórios**: 100% preenchidos
- **Validação de Pipeline**: Aprovada

## 🚀 Integração MCP

### Funções MCP Implementadas
1. **`init_analytics_pipeline`**: Cria estrutura base
2. **`validate_analytics_quality`**: Valida qualidade
3. **`generate_insights_dashboard`**: Gera dashboard completo

### Context Flow Automatizado
- **Input**: Modelo de domínio e requisitos
- **Processamento**: Templates e validação
- **Output**: Pipeline e dashboard
- **Avanço**: Automático para próximo especialista

## 📊 Métricas de Sucesso

### Performance
- **Tempo de pipeline**: < 30 minutos
- **Qualidade de dados**: > 95%
- **Disponibilidade**: 99.5%+ uptime
- **Freshness**: < 1 hora para dados frescos

### Qualidade
- **Consistência**: 100% padrão enterprise
- **Documentação**: 100% pipelines documentados
- **Testes**: 100% validação automatizada
- **Monitoramento**: 100% SLAs definidos

## 🎯 Especialização Técnica

### Stack Coverage
- **Orquestração**: Airflow, Dagster, Prefect
- **Transformação**: dbt, Spark, Pandas
- **Armazenamento**: BigQuery, Redshift, Snowflake
- **Visualização**: Metabase, Looker, Tableau
- **Qualidade**: Great Expectations, dbt tests

### Boas Práticas Implementadas
- **Data Governance**: Políticas de acesso e retenção
- **Quality Assurance**: Testes automatizados
- **Monitoring**: SLAs e alertas
- **Documentation**: Code-first e auto-documentação
- **Security**: Anonimização e criptografia

## 🔄 Progressive Disclosure

Este especialista utiliza carregamento progressivo para performance otimizada:

### SKILL.md (Principal)
- Informações essenciais (< 500 linhas)
- Processo otimizado
- Quality gates definidos
- Context flow integrado

### Resources (Carregados sob demanda)
- **Templates**: Estruturas reutilizáveis
- **Examples**: Casos práticos reais
- **Checklists**: Validação automatizada
- **Reference**: Guias técnicos completos

## 🚀 Casos de Uso

### 1. E-commerce Analytics
- **Fontes**: Pedidos, clientes, produtos
- **KPIs**: Taxa de conversão, valor médio
- **Dashboard**: Vendas por período, top produtos

### 2. SaaS Metrics
- **Fontes**: Assinaturas, usuários, eventos
- **KPIs**: MRR, churn rate, LTV
- **Dashboard**: Métricas recorrentes, cohort analysis

### 3. Marketing Analytics
- **Fontes**: Campanhas, leads, conversões
- **KPIs**: ROI, CPA, CPL
- **Dashboard**: Performance de campanhas

## 📞 Suporte e Documentação

### Recursos Disponíveis
- **Guia Completo**: `resources/reference/analytics-guide.md`
- **Exemplos Práticos**: `resources/examples/analytics-examples.md`
- **Checklist de Validação**: `resources/checklists/analytics-validation.md`
- **Integração MCP**: `MCP_INTEGRATION.md`

### Canais de Suporte
- **Documentação**: Recursos completos em `resources/`
- **Templates**: Estruturas prontas em `templates/`
- **Examples**: Casos reais em `examples/`
- **MCP**: Funções de automação em `mcp_functions/`

---

## 🎯 Próximos Passos

1. **Use o template principal** `feature.md`
2. **Defina KPIs** e métricas de negócio
3. **Modele dados** com star schema
4. **Implemente pipeline** ETL/ELT
5. **Crie dashboard** interativo
6. **Configure monitoramento** e alertas
7. **Valide qualidade** com checklist
8. **Avance para** Documentação Técnica

Para detalhes completos de implementação, consulte `MCP_INTEGRATION.md`.
