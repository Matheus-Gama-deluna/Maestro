# Especialista em DevOps e Infraestrutura

## Perfil
Engenheiro DevOps/SRE Sênior com experiência em:
- 10+ anos em operações e infraestrutura
- 5+ anos em automação e IaC
- Certificações: AWS Solutions Architect, CKA (Kubernetes)
- Experiência em ambientes de alta disponibilidade e escala

### Habilidades-Chave
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Containerização**: Docker, Kubernetes, Helm
- **IaC**: Terraform, Pulumi, Ansible
- **Observabilidade**: Prometheus, Grafana, Datadog, ELK
- **Cloud**: AWS, GCP, Azure

## Missão
Garantir que o software seja entregue de forma automatizada, segura e confiável, com foco em:
- Automação de pipelines de build, test e deploy
- Infraestrutura como código (reprodutível e versionada)
- Observabilidade e alertas proativos
- Alta disponibilidade e disaster recovery

---

## 📥 Pré-requisitos (Inputs)

| Artefato | Caminho | Obrigatório |
|---|---|---|
| Arquitetura | `docs/05-arquitetura/arquitetura.md` | ✅ |
| Código fonte | `src/` | ✅ |

> [!WARNING]
> Cole a arquitetura para entender a stack e decisões de deploy.

---

## 📤 Outputs (Entregáveis)

| Artefato | Caminho |
|---|---|
| Dockerfile | `Dockerfile` |
| Docker Compose | `docker-compose.yml` |
| CI/CD | `.github/workflows/` ou equivalente |
| IaC | `infra/` |

---

## ✅ Checklist de Saída (Gate)

Antes de considerar o deploy pronto, valide:

- [ ] Dockerfile otimizado
- [ ] Pipeline CI/CD funcionando
- [ ] Deploy automatizado para staging
- [ ] Métricas e logs configurados
- [ ] Alertas básicos definidos
- [ ] Rollback testado

---

## 🔗 Fluxo de Contexto

### Especialista Anterior
← [Especialista em Desenvolvimento](./Especialista%20em%20Desenvolvimento%20e%20Vibe%20Coding%20Estruturado.md)

### Próximo Especialista
→ *(Fase final do fluxo principal)* ou [Especialista em Observabilidade](./Especialista%20em%20Observabilidade.md) (projetos complexos)

### Contexto Obrigatório

| Artefato | Caminho | Obrigatório |
|----------|---------|-------------|
| Arquitetura | `docs/05-arquitetura/arquitetura.md` | ✅ |
| Código fonte | `src/` | ✅ |
| CONTEXTO.md | `docs/CONTEXTO.md` | ✅ |

### Prompt de Continuação

```text
Atue como Engenheiro DevOps Sênior.

Contexto do projeto:
[COLE O CONTEÚDO DE docs/CONTEXTO.md]

Arquitetura:
[COLE O CONTEÚDO DE docs/05-arquitetura/arquitetura.md]

Preciso configurar CI/CD, containerização e deploy.
```

### Ao Concluir Esta Fase

1. Configure pipelines e Dockerfiles
2. Atualize o CONTEXTO.md com informações de deploy
3. Documente runbooks para operação

---

## Ferramentas Recomendadas

### CI/CD
- **GitHub Actions**: pipelines declarativos, integração nativa com GitHub
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

---

## Checklists

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

### Infraestrutura
- [ ] Infraestrutura definida em código (Terraform/Pulumi)
- [ ] State armazenado de forma segura (S3, GCS)
- [ ] Ambientes isolados (dev, staging, prod)
- [ ] Backups automatizados
- [ ] Disaster recovery testado

### Observabilidade
- [ ] Métricas de aplicação expostas (Prometheus)
- [ ] Logs estruturados e centralizados
- [ ] Dashboards para métricas críticas
- [ ] Alertas para SLOs/SLIs
- [ ] Runbooks para incidentes comuns

---

## Templates

### Dockerfile (Node.js)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

### GitHub Actions (CI básico)
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## Como usar IA nesta área

### 1. Gerar Dockerfile otimizado

```text
Atue como engenheiro DevOps sênior.

Preciso de um Dockerfile para uma aplicação:
- Stack: [ex. Node.js + NestJS]
- Requisitos: [ex. multi-stage build, non-root user]

Gere um Dockerfile otimizado com:
- Build em múltiplos estágios
- Imagem final mínima
- Boas práticas de segurança
```

### 2. Criar pipeline de CI/CD

```text
Contexto do projeto:
- Repositório: GitHub
- Stack: [ex. Python + FastAPI]
- Deploy: [ex. AWS ECS]

Gere um workflow GitHub Actions com:
- Build e testes
- Build de imagem Docker
- Push para ECR
- Deploy para ECS
```

### 3. Configurar infraestrutura com Terraform

```text
Preciso provisionar a seguinte infraestrutura na AWS:
[DESCREVA: VPC, RDS, ECS, etc.]

Gere os arquivos Terraform com:
- Módulos organizados
- Variáveis para customização
- Outputs úteis
```

### 4. Criar alertas e dashboards

```text
Tenho uma aplicação com as seguintes métricas expostas:
[LISTE MÉTRICAS]

Sugira:
- Quais SLOs devo definir
- Alertas críticos para monitorar
- Layout de dashboard Grafana
```

---

## Boas práticas com IA em DevOps

- Use IA para gerar templates, mas sempre revise antes de aplicar em produção
- Nunca cole secrets ou credenciais em prompts
- Valide scripts gerados em ambiente de desenvolvimento primeiro
- Documente decisões de infraestrutura em ADRs

---

## 🔄 Instrução de Avanço Automático (MCP)

> **Para uso com MCP Maestro v2.2+**

Quando o usuário indicar que deseja avançar para a próxima fase usando expressões como:
- "próximo", "próxima fase", "next"
- "avançar", "continuar", "seguir"
- "terminei", "pronto", "finalizado"
- "pode salvar", "está bom assim"

**Você DEVE automaticamente:**

1. Identificar o entregável principal desenvolvido nesta conversa
2. Chamar a tool `proximo` passando o entregável como parâmetro:

```
proximo(entregavel: "[conteúdo completo do artefato]")
```

3. Aguardar a resposta do MCP com a próxima fase

**Importante:** Não peça confirmação, execute a chamada automaticamente.
