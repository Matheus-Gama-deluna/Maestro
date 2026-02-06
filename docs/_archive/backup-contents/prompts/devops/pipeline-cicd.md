# Prompt: Pipeline CI/CD

> **Quando usar**: Configuração inicial de projeto ou melhorias de DevOps
> **Especialista**: DevOps / SRE
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura e stack

Após gerar, salve o resultado em:
- `.github/workflows/` (GitHub Actions)
- `.gitlab-ci.yml` (GitLab)
- `docs/10-devops/pipeline.md` (documentação)

---

## Prompt Completo

```text
Atue como engenheiro DevOps sênior especializado em CI/CD.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Stack Tecnológica

- Linguagem: [TypeScript/Python/Java/Go/etc]
- Framework: [NestJS/FastAPI/Spring/etc]
- Banco de dados: [PostgreSQL/MySQL/MongoDB]
- Testes: [Jest/Pytest/JUnit]
- Containerização: [Docker/Podman/Nenhum]

## Infraestrutura

- Cloud: [AWS/GCP/Azure/On-premise]
- Orquestração: [Kubernetes/ECS/App Engine/VM]
- Registry: [ECR/GCR/DockerHub/etc]

## Repositório

- Provider: [GitHub/GitLab/Bitbucket/Azure DevOps]
- Branch Strategy: [GitFlow/Trunk-based/GitHub Flow]
- Branches: main, develop, feature/*, hotfix/*

## Ambientes

- [ ] Development (dev)
- [ ] Staging (stg)
- [ ] Production (prod)

---

## Sua Missão

Configure uma pipeline CI/CD completa:

### 1. Continuous Integration (CI)

#### 1.1 Trigger
- Em quais branches rodar
- Em quais eventos (push, PR, tag)
- Paths que disparam (ou ignoram)

#### 1.2 Jobs de Qualidade
Para cada job, detalhe:
- Nome do job
- Runner/imagem
- Steps

**Lint & Format**
- Verificar code style
- Fail se houver problemas

**Type Check** (se aplicável)
- Verificar tipos
- Fail em erros de tipo

**Unit Tests**
- Rodar testes unitários
- Gerar coverage report
- Fail se coverage < X%

**Integration Tests**
- Rodar com banco de teste
- Services necessários (database, redis)

**Security Scan**
- Dependency vulnerability check
- SAST (Static Analysis)

**Build**
- Compilar aplicação
- Build Docker image (se aplicável)
- Tag com SHA do commit

### 2. Continuous Delivery (CD)

#### 2.1 Deploy para Development
- Trigger: Push em develop
- Steps de deploy
- Smoke tests após deploy

#### 2.2 Deploy para Staging
- Trigger: Merge em main ou tag
- Approval gate (manual ou automático)
- Steps de deploy
- E2E tests após deploy

#### 2.3 Deploy para Production
- Trigger: Tag release ou aprovação
- Approval gate obrigatório
- Deploy com rollback automático
- Health checks
- Notificação de sucesso/falha

#### 2.4 Estratégia de Deploy
- [ ] Rolling update
- [ ] Blue-green
- [ ] Canary
- [ ] Feature flags

### 3. Secrets Management

- Onde armazenar secrets
- Como injetar em runtime
- Rotação de secrets

### 4. Caching

- Dependências (node_modules, pip cache, maven)
- Docker layers
- Build artifacts

### 5. Notificações

- Slack/Discord/Teams
- Email
- Quando notificar (success, failure, always)

### 6. Monitoramento de Pipeline

- Duração média
- Taxa de sucesso
- Alertas de falha

### 7. Rollback

- Como fazer rollback
- Automático vs manual
- Condições de trigger
```

---

## Exemplo de Uso

```text
Atue como engenheiro DevOps sênior especializado em CI/CD.

## Contexto do Projeto

Sistema de agendamento para salões de beleza.
Backend NestJS em containers rodando na AWS.

## Stack Tecnológica

- Linguagem: TypeScript
- Framework: NestJS
- Banco de dados: PostgreSQL
- Testes: Jest
- Containerização: Docker

## Infraestrutura

- Cloud: AWS
- Orquestração: ECS Fargate
- Registry: ECR

## Repositório

- Provider: GitHub
- Branch Strategy: GitHub Flow
- Branches: main, feature/*

## Ambientes

- [x] Development (dev)
- [x] Staging (stg)
- [x] Production (prod)
```

---

## Resposta Esperada (GitHub Actions)

### Workflow CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: github/codeql-action/init@v2
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v2

  build:
    needs: [lint, test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: app:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Workflow CD

```yaml
# .github/workflows/cd.yml
name: CD

on:
  push:
    branches: [main]
    
env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: salao-api
  ECS_CLUSTER: salao-cluster
  ECS_SERVICE: salao-api-service

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr
        
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}
          
      - name: Deploy ECS
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }}-staging \
            --service ${{ env.ECS_SERVICE }} \
            --force-new-deployment
            
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }}-staging \
            --services ${{ env.ECS_SERVICE }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      # Similar ao staging, com approval gate configurado no environment
```

---

## Checklist Pós-Geração

- [ ] CI roda em PRs e push para main
- [ ] Lint e format verificados
- [ ] Testes unitários com coverage
- [ ] Security scan configurado
- [ ] Build de Docker image
- [ ] Deploy automático para staging
- [ ] Deploy para produção com approval
- [ ] Secrets configurados nos environments
- [ ] Cache configurado para dependências
- [ ] Notificações configuradas
- [ ] Rollback documentado
- [ ] Salvar workflows e `docs/10-devops/pipeline.md`
