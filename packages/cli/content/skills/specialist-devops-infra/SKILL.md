---
name: specialist-devops-infra
description: Pipelines, IaC, Docker e monitoramento para deploy seguro.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# DevOps e Infraestrutura · Skill do Especialista

## Missão
Configurar CI/CD, contêineres e infraestrutura pronta para produção, garantindo entregas automatizadas, seguras e confiáveis.

## Quando ativar
- Fase: Fase 12 · DevOps
- Workflows recomendados: /deploy, /maestro
- Use quando precisar antes de releases e para manter ambientes confiáveis.

## Inputs obrigatórios
- Arquitetura (`docs/06-arquitetura/arquitetura.md`)
- Código fonte (`src/`)
- CONTEXTO.md do projeto
- Requisitos de infraestrutura
- Secrets e credenciais seguras
- Métricas esperadas

## Outputs gerados
- Pipelines CI/CD completos
- Dockerfiles otimizados
- Docker Compose para desenvolvimento
- IaC (Terraform/Pulumi)
- Configurações de deploy
- Monitoramento e alertas

## Quality Gate
- Dockerfile otimizado (multi-stage)
- Pipeline CI/CD funcionando
- Deploy automatizado para staging
- Métricas e logs configurados
- Alertas básicos definidos
- Rollback testado
- Infraestrutura como código versionada

## Ferramentas Recomendadas

### CI/CD
- **GitHub Actions**: pipelines declarativos, integração nativa
- **GitLab CI**: pipelines robustos, runners self-hosted
- **ArgoCD**: GitOps para Kubernetes

### Containerização
- **Docker**: empacotamento de aplicações
- **Docker Compose**: orquestração local
- **Kubernetes**: orquestração em produção
- **Helm**: charts para deploy em K8s

### Infraestrutura como Código
- **Terraform**: multi-cloud, state management
- **Pulumi**: IaC com linguagens de programação
- **Ansible**: configuração de servidores

### Observabilidade
- **Prometheus + Grafana**: métricas e dashboards
- **Loki**: logs centralizados
- **Jaeger/Zipkin**: tracing distribuído
- **PagerDuty/Opsgenie**: alertas e on-call

## Processo Obrigatório de Configuração

### 1. Análise da Arquitetura
```text
Com base na arquitetura:
[COLE ARQUITETURA]

Identifique:
- Stack tecnológica (Node, Python, Java, etc.)
- Dependências (banco, cache, filas)
- Requisitos de escala
- Restrições de segurança/compliance
```

### 2. Containerização
```text
Para a stack [TECNOLOGIA]:
- Crie Dockerfile otimizado (multi-stage)
- Configure docker-compose.yml
- Defina health checks
- Otimize tamanho da imagem
```

### 3. Pipeline CI/CD
```text
Configure pipeline com:
- Build automatizado
- Testes unitários e integração
- Análise estática (linting, SAST)
- Build de imagem com tag semântica
- Deploy para staging
- Deploy para produção com aprovação
```

### 4. Infraestrutura como Código
```text
Defina infraestrutura usando [TERRAFORM/PULUMI]:
- Recursos de cloud (VPC, EC2, RDS, etc.)
- Kubernetes clusters
- Networking e segurança
- Backup e disaster recovery
```

## Checklists Obrigatórias

### Pipeline de CI/CD
- [ ] Build automatizado a cada push
- [ ] Testes unitários e de integração no pipeline
- [ ] Análise estática de código (linting, SAST)
- [ ] Build de imagem Docker com tag semântica
- [ ] Deploy automatizado para staging
- [ ] Deploy para produção com aprovação manual ou automática
- [ ] Rollback automatizado em caso de falha

### Containerização
- [ ] Dockerfile otimizado (multi-stage build)
- [ ] Imagens base oficiais e atualizadas
- [ ] Variáveis de ambiente para configuração
- [ ] Health checks configurados
- [ ] Recursos (CPU/memória) limitados
- [ ] Security scanning de imagens

### Infraestrutura
- [ ] Infraestrutura definida em código (Terraform/Pulumi)
- [ ] State armazenado de forma segura (S3, GCS)
- [ ] Ambientes isolados (dev, staging, prod)
- [ ] Backups automatizados
- [ ] Disaster recovery testado
- [ ] Segurança (firewalls, IAM, encryption)

### Observabilidade
- [ ] Métricas de aplicação expostas (Prometheus)
- [ ] Logs estruturados e centralizados
- [ ] Dashboards para métricas críticas
- [ ] Alertas para SLOs/SLIs
- [ ] Runbooks para incidentes comuns
- [ ] Tracing distribuído (se microserviços)

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** exponha secrets em código ou logs
- **NUNCA** use imagens base inseguras
- **NUNCA** pule testes em produção
- **NUNCA** ignore alertas críticas

### SEMPRE Faça
- **SEMPRE** use multi-stage builds
- **SEMPRE** versione infraestrutura como código
- **SEMPRE** implemente rollback automático
- **SEMPRE** monitore SLOs/SLIs

### Segurança Obrigatória
```yaml
# Exemplo de security scanning
- name: Security Scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
    format: 'sarif'
    exit-code: '1'
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Arquitetura completa com stack definida
2. Código fonte com dependências
3. CONTEXTO.md com restrições
4. Requisitos de compliance (se aplicável)

### Prompt de Continuação
```
Atue como Engenheiro DevOps Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

Preciso configurar CI/CD, containerização e deploy.
```

### Ao Concluir Esta Fase
1. **Configure pipelines** e Dockerfiles
2. **Crie infraestrutura** como código
3. **Configure monitoramento** e alertas
4. **Teste deploy** em staging
5. **Documente runbooks** para operação
6. **Atualize o CONTEXTO.md** com informações de deploy

## Métricas e SLOs

### Indicadores Obrigatórios
- **Build Time:** < 5 minutos
- **Deploy Time:** < 10 minutos
- **Uptime:** ≥ 99.9%
- **MTTR:** < 30 minutos
- **MTBF:** > 30 dias

### SLOs Recomendados
- **Availability:** 99.9% (43min downtime/mês)
- **Latency:** p95 < 500ms
- **Error Rate:** < 0.1%
- **Recovery Time:** < 5 minutos

## Templates Prontos

### Dockerfile (Node.js)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### GitHub Actions (CI/CD)
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging"
      - name: Deploy to production
        if: success()
        run: echo "Deploy to production"
```

### Terraform (AWS)
```hcl
provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
```

## Skills complementares
- `deployment-procedures`
- `server-management`
- `powershell-windows`
- `bash-linux`
- `kubernetes-patterns`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em DevOps e Infraestrutura.md`
- **Artefatos alvo:**
  - Pipelines CI/CD completos
  - Dockerfiles otimizados
  - IaC versionada
  - Configurações de deploy
  - Monitoramento e alertas