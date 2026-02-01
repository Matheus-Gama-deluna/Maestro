# Catálogo de Stacks para Cloud Moderna

Complemento ao catálogo de hospedagem compartilhada, focado em infraestrutura cloud.

---

## Plano 1 – Serverless Simples

**Tipo:** APIs leves, funções acionadas por eventos  
**Complexidade:** Baixa

### Stack
- **Runtime:** Vercel Functions, Netlify Functions, AWS Lambda
- **Banco:** PlanetScale, Supabase, Neon (PostgreSQL serverless)
- **Auth:** Clerk, Auth0, Supabase Auth

### Casos de Uso
- APIs para landing pages
- Webhooks e integrações
- Backend-for-frontend (BFF)

---

## Plano 2 – Aplicação Containerizada (PaaS)

**Tipo:** Apps web completas, APIs com estado  
**Complexidade:** Média

### Stack
- **Deploy:** Railway, Render, Fly.io
- **Containers:** Docker
- **Banco:** PostgreSQL gerenciado (Railway, Render, Supabase)
- **Cache:** Redis (Upstash, Railway)

### Casos de Uso
- MVPs e apps early-stage
- Projetos com orçamento limitado
- Deploy rápido sem gerenciar infra

---

## Plano 3 – AWS Estruturado

**Tipo:** Sistemas de médio/grande porte  
**Complexidade:** Alta

### Stack
- **Compute:** ECS Fargate, EC2, Lambda
- **Banco:** RDS (PostgreSQL/MySQL), DynamoDB
- **Storage:** S3
- **CDN:** CloudFront
- **Auth:** Cognito
- **IaC:** Terraform, CDK

### Casos de Uso
- Sistemas enterprise
- Alta disponibilidade necessária
- Compliance (SOC2, HIPAA)

---

## Plano 4 – GCP Moderno

**Tipo:** Apps data-intensive, ML  
**Complexidade:** Alta

### Stack
- **Compute:** Cloud Run, GKE
- **Banco:** Cloud SQL, Firestore
- **Data:** BigQuery, Dataflow
- **ML:** Vertex AI
- **IaC:** Terraform

### Casos de Uso
- Analytics e BI
- Pipelines de ML
- Integração com Google Workspace

---

## Plano 5 – Kubernetes Full

**Tipo:** Microserviços, multi-tenant  
**Complexidade:** Muito Alta

### Stack
- **Orquestração:** EKS, GKE, AKS, ou self-hosted
- **Ingress:** NGINX, Traefik
- **Service Mesh:** Istio, Linkerd
- **GitOps:** ArgoCD, Flux
- **Observability:** Prometheus, Grafana, Loki

### Casos de Uso
- Microserviços em escala
- Multi-tenant SaaS
- Equipes grandes com autonomia

---

## Comparativo

| Critério | Serverless | PaaS | AWS/GCP | K8s Full |
|---|---|---|---|---|
| **Custo inicial** | Baixo | Baixo | Médio | Alto |
| **Escala** | Auto | Auto | Configurável | Configurável |
| **Complexidade** | Baixa | Baixa | Alta | Muito Alta |
| **Vendor lock-in** | Alto | Médio | Médio | Baixo |
| **Time to deploy** | Minutos | Minutos | Horas | Dias |

---

## Relação com o Playbook

Para qualquer plano cloud:

1. Use o **Especialista em DevOps** para definir pipelines
2. Use o **Especialista em Arquitetura** para decisões de design
3. Use o **Especialista em Segurança** para IAM, secrets e compliance
4. Documente decisões em ADRs
