# 🚀 Especialista em DevOps e Infraestrutura

## Visão Geral

Especialista responsável por configurar infraestrutura automatizada, CI/CD e deploy confiável para aplicações modernas. Este especialista implementa práticas de DevOps para garantir entregas contínuas, segurança e escalabilidade.

## 🎯 Missão Principal

Configurar e manter infraestrutura como código, pipelines automatizados e monitoramento proativo para aplicações em produção, com foco em:
- Automação completa de pipelines de build, test e deploy
- Infraestrutura reproduzível e versionada
- Observabilidade com métricas e alertas
- Alta disponibilidade e disaster recovery

## 📁 Estrutura de Diretórios

```
specialist-devops-infra/
├── SKILL.md                    # Skill principal (< 500 linhas)
├── README.md                   # Documentação completa
├── MCP_INTEGRATION.md          # Guia para implementação MCP
├── resources/                  # Recursos carregados sob demanda
│   ├── templates/             # Templates estruturados
│   │   ├── estado-template.json ✅
│   │   ├── Dockerfile ✅
│   │   ├── ci-cd-pipeline.yml ✅
│   │   └── main.tf ✅
│   ├── examples/             # Exemplos práticos
│   │   └── devops-examples.md
│   ├── checklists/           # Validação automática (via MCP)
│   │   └── devops-validation.md
│   └── reference/            # Guias técnicos
│       └── devops-guide.md
└── mcp_functions/             # Funções MCP (referência)
    ├── init_infrastructure.py
    ├── validate_infrastructure_quality.py
    └── generate_ci_cd_pipeline.py
```

## 🔄 Fluxo de Trabalho

### 1. Contexto de Entrada
- **Arquitetura**: Stack tecnológica e decisões de deploy
- **Código Fonte**: Aplicação para containerização
- **Requisitos**: Nível de criticidade e compliance

### 2. Processo Principal
1. **Discovery** (15 min): Análise da stack e requisitos
2. **Template Generation**: Preenchimento do `estado-template.json`
3. **Infrastructure Setup**: Docker, CI/CD, IaC
4. **Validation**: Quality gates automatizados
5. **Documentation**: Runbooks e guias de operação

### 3. Entregáveis
- **Estado da Infraestrutura**: JSON completo com configurações
- **Dockerfile**: Containerização otimizada
- **CI/CD Pipeline**: Build, test e deploy automatizados
- **IaC**: Terraform/Pulumi para provisionamento
- **Monitoring**: Métricas, logs e alertas

## 🛠️ Templates Disponíveis

### Template Principal: estado-template.json
Estrutura JSON completa para gerenciamento do estado da infraestrutura:

```json
{
  "infraestrutura": {
    "stack": {
      "language": "[NODE|PYTHON|JAVA|GO|RUST]",
      "framework": "[NEXT|NEST|DJANGO|FASTAPI|SPRING]",
      "database": "[POSTGRES|MYSQL|MONGO|REDIS]",
      "cloud_provider": "[AWS|GCP|AZURE]"
    },
    "ambientes": {
      "dev": { "url": "", "status": "pending" },
      "staging": { "url": "", "status": "pending" },
      "prod": { "url": "", "status": "pending" }
    },
    "ci_cd": {
      "provider": "[GITHUB_ACTIONS|GITLAB_CI]",
      "status": "not_configured",
      "pipeline_url": ""
    },
    "container": {
      "registry": "",
      "image_name": "",
      "latest_tag": ""
    },
    "iac": {
      "tool": "[TERRAFORM|PULUMI]",
      "state_location": "",
      "coverage": 0
    }
  },
  "compliance": {
    "security_scan": false,
    "secrets_management": false,
    "backup_configured": false,
    "monitoring_enabled": false
  },
  "history": []
}
```

### Templates de Apoio
- **Dockerfile**: Multi-stage build otimizado
- **ci-cd-pipeline.yml**: GitHub Actions completo
- **main.tf**: Terraform básico para cloud

## ✅ Quality Gates

### Critérios de Validação
- **Stack Definida**: 100% campos preenchidos
- **Ambientes Configurados**: dev, staging, production
- **CI/CD Planejado**: Provider e pipeline definido
- **Containerização**: Registry e image name configurados
- **IaC Definida**: Tool e state location
- **Compliance**: Security, secrets, backup, monitoring

### Threshold de Qualidade
- **Score Mínimo**: 80 pontos para aprovação automática
- **Campos Obrigatórios**: 100% preenchidos
- **Validação de Segurança**: Aprovada

## 🚀 Integração MCP

### Funções MCP Implementadas
1. **`init_infrastructure_structure`**: Cria estrutura base
2. **`validate_infrastructure_quality`**: Valida qualidade
3. **`generate_ci_cd_pipeline`**: Gera pipeline completo

### Context Flow Automatizado
- **Input**: Arquitetura e código fonte
- **Processamento**: Templates e validação
- **Output**: Infraestrutura configurada
- **Avanço**: Automático para próximo especialista

## 📊 Métricas de Sucesso

### Performance
- **Tempo de Setup**: < 60 minutos
- **Automação**: 100% do pipeline
- **Disponibilidade**: 99.9%+ SLO
- **Recovery**: < 5 minutos MTTR

### Qualidade
- **Consistência**: 100% padrão enterprise
- **Segurança**: OWASP Top 10 cobertos
- **Documentação**: 100% runbooks atualizados
- **Monitoramento**: 100% métricas críticas

## 🎯 Especialização Técnica

### Stack Coverage
- **Languages**: Node.js, Python, Java, Go, Rust
- **Frameworks**: Next, Nest, Django, FastAPI, Spring
- **Databases**: Postgres, MySQL, MongoDB, Redis
- **Cloud Providers**: AWS, GCP, Azure
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **IaC**: Terraform, Pulumi, Ansible
- **Containers**: Docker, Kubernetes, Helm
- **Monitoring**: Prometheus, Grafana, ELK

### Boas Práticas Implementadas
- **Infrastructure as Code**: Tudo versionado
- **GitOps**: Deploy via pull requests
- **Zero Downtime**: Rolling updates
- **Security by Design**: Scans automatizados
- **Observability**: Three pillars implementados

## 🔄 Progressive Disclosure

Este skill utiliza carregamento progressivo para performance otimizada:

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

### 1. Novo Projeto
- Configurar infraestrutura do zero
- Definir stack e ambientes
- Implementar CI/CD completo
- Setup de monitoramento

### 2. Migração
- Análise de infraestrutura existente
- Planejamento de migração
- Execução com rollback
- Validação pós-migração

### 3. Otimização
- Análise de performance
- Otimização de custos
- Melhoria de segurança
- Automatização manual

## 📞 Suporte e Documentação

### Recursos Disponíveis
- **Guia Completo**: `resources/reference/devops-guide.md`
- **Exemplos Práticos**: `resources/examples/devops-examples.md`
- **Checklist de Validação**: `resources/checklists/devops-validation.md`
- **Integração MCP**: `MCP_INTEGRATION.md`

### Canais de Suporte
- **Documentação**: Recursos completos em `resources/`
- **Templates**: Estruturas prontas em `templates/`
- **Examples**: Casos reais em `examples/`
- **MCP**: Funções de automação em `mcp_functions/`

---

## 🎯 Próximos Passos

1. **Use o template principal** `estado-template.json`
2. **Configure os ambientes** (dev, staging, prod)
3. **Implemente CI/CD** com GitHub Actions
4. **Setup IaC** com Terraform
5. **Configure monitoring** e alertas
6. **Valide qualidade** com checklist
7. **Avance para** Dados e Analytics

Para detalhes completos de implementação, consulte `MCP_INTEGRATION.md`.
