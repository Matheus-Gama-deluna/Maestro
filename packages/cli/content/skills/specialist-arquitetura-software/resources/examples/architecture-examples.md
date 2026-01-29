# Exemplos de Arquitetura de Software

## Exemplo 1: E-commerce Platform

### Input: Requisitos do Negócio
- Plataforma de e-commerce com 100k usuários
- Catálogo de 50k produtos
- Picos de 10k requisições/segundo
- Integração com pagamento e logística

### Output: Arquitetura Definida

#### Stack Tecnológica
```
Frontend: Next.js + TypeScript + Tailwind CSS
Backend: Node.js + Express + Prisma
Database: PostgreSQL + Redis
Infrastructure: AWS + Docker + Kubernetes
```

#### Arquitetura C4
```
Context: Web App + Mobile App + Admin Panel
Containers: Frontend + Backend API + Database + Cache
Components: Auth + Products + Orders + Payments + Shipping
```

#### ADRs Principais
```
ADR-001: Microservices vs Monolith → Monolith Modular
ADR-002: Database Choice → PostgreSQL + Redis
ADR-003: Deployment Strategy → Blue-Green on Kubernetes
```

#### SLOs
```
API Response Time: p95 < 200ms
System Availability: > 99.9%
Concurrent Users: 10k
Error Rate: < 0.1%
```

---

## Exemplo 2: SaaS Analytics Platform

### Input: Requisitos Técnicos
- Dashboard em tempo real
- Processamento de big data
- Multi-tenant architecture
- API-first design

### Output: Arquitetura Definida

#### Stack Tecnológica
```
Frontend: React + TypeScript + D3.js
Backend: Python + FastAPI + SQLAlchemy
Database: PostgreSQL + ClickHouse + Redis
Infrastructure: GCP + Docker + Terraform
```

#### Arquitetura C4
```
Context: Web App + API + Data Pipeline
Containers: Frontend + API Gateway + Services + Data Warehouse
Components: Auth + Analytics + Reporting + Data Processing
```

#### ADRs Principais
```
ADR-001: Multi-tenant Strategy → Database per Tenant
ADR-002: Real-time Processing → Kafka + ClickHouse
ADR-003: API Design → GraphQL + REST
```

#### SLOs
```
Dashboard Load Time: < 3 seconds
Data Processing Latency: < 30 seconds
API Response Time: p95 < 500ms
System Availability: > 99.5%
```

---

## Exemplo 3: Mobile Banking App

### Input: Requisitos de Segurança
- Aplicação bancária mobile
- Transações financeiras
- Compliance regulatório
- Alta segurança

### Output: Arquitetura Definida

#### Stack Tecnológica
```
Frontend: React Native + TypeScript
Backend: Java + Spring Boot + JPA
Database: PostgreSQL + Redis
Infrastructure: AWS + Docker + Vault
```

#### Arquitetura C4
```
Context: Mobile App + Admin Panel + Core Banking
Containers: Mobile App + API Gateway + Services + Database
Components: Auth + Accounts + Transactions + Notifications
```

#### ADRs Principais
```
ADR-001: Security Architecture → Zero Trust + MFA
ADR-002: Database Design → Immutable Ledger
ADR-003: API Security → OAuth2 + JWT + Rate Limiting
```

#### SLOs
```
Transaction Processing: < 2 seconds
App Launch Time: < 3 seconds
API Response Time: p95 < 300ms
System Availability: > 99.99%
```

---

## Padrões de Decisão Arquitetural

### 1. Escolha de Stack
```
Se (Web Application) → React + Node.js + PostgreSQL
Se (Mobile Application) → React Native + Node.js + PostgreSQL
Se (Data Processing) → Python + FastAPI + PostgreSQL + ClickHouse
Se (Enterprise) → Java + Spring Boot + PostgreSQL
```

### 2. Padrão de Arquitetura
```
Se (Time < 10) → Monolith Modular
Se (Time > 10) → Microservices
Se (Real-time) → Event-Driven
Se (Batch Processing) → ETL Pipeline
```

### 3. Estratégia de Deploy
```
Se (Cloud Native) → Kubernetes + Helm
Se (Simple Deploy) → Docker + Docker Compose
Se (Enterprise) → Terraform + Kubernetes
Se (Serverless) → Lambda + API Gateway
```

### 4. Estratégia de Banco
```
Se (Transactional) → PostgreSQL + Redis
Se (Analytics) → PostgreSQL + ClickHouse
Se (Simple Cache) → Redis
Se (Multi-tenant) → PostgreSQL per Tenant
```

---

## Anti-Patterns a Evitar

### 1. Arquitetura
```
❌ Microservices prematuro
✅ Monolith modular primeiro

❌ Over-engineering
✅ Simplicidade evolutiva

❌ Single point of failure
✅ Alta disponibilidade
```

### 2. Stack Tecnológica
```
❌ Tecnologias muito novas
✅ Tecnologias maduras e estáveis

❌ Muitas tecnologias diferentes
✅ Stack coesa e consistente

❌ Ignorar performance
✅ Performance-first design
```

### 3. SLOs
```
❌ SLOs irreais
✅ SLOs alcançáveis

❌ Sem monitoramento
✅ Observabilidade completa

❌ Sem error budget
✅ Gerenciamento de risco
```

---

## Templates Reutilizáveis

### Template de ADR
```markdown
# ADR-XXX: [Título]

## Status
Proposed

## Contexto
[Problema]

## Decisão
[Solução]

## Consequências
[Impactos]
```

### Template de SLO
```markdown
## [Componente] SLOs
- Response Time: p95 < [valor]ms
- Availability: > [valor]%
- Error Rate: < [valor]%
```

### Template de Stack
```markdown
### [Categoria]
- **Primary:** [Tecnologia principal]
- **Secondary:** [Tecnologia secundária]
- **Tooling:** [Ferramentas]
- **Testing:** [Testes]
```