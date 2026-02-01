# 📚 Exemplos Práticos de Documentação

## 🎯 Input/Output Pairs Reais

### Exemplo 1: Projeto Web Completo

#### Input (Contexto do Projeto)
```
Projeto: E-commerce B2B de produtos industriais
Stack: Next.js 14 + TypeScript + Prisma + PostgreSQL
Features: Catálogo de produtos, carrinho, checkout, painel admin
Público: Desenvolvedores e clientes B2B
```

#### Output (README.md Gerado)
```markdown
# 🏭 IndustrialSupply - E-commerce B2B

> Plataforma de e-commerce B2B para produtos industriais com gestão de catálogo e pedidos

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](package.json)

## 🎯 Sobre

IndustrialSupply é uma plataforma completa de e-commerce B2B desenvolvida para empresas que precisam gerenciar catálogos de produtos industriais, processar pedidos em grande volume e oferecer uma experiência de compra otimizada para clientes corporativos.

### Problema Resolvido
- **Desafio:** Empresas industriais enfrentam dificuldades em gerenciar catálogos complexos com milhares de produtos
- **Impacto:** Perdas de vendas devido à experiência de compra inadequada e processos manuais ineficientes
- **Solução:** Plataforma automatizada com catálogo inteligente, gestão de pedidos e integração com sistemas ERP

## ✨ Features

### 🌟 Principais
- **Catálogo Inteligente:** Busca avançada com filtros técnicos e cross-selling
- **Gestão de Pedidos:** Workflow completo de aprovação e rastreamento
- **Painel Admin:** Dashboard completo com analytics e relatórios
- **Integração ERP:** Sincronização automática com sistemas existentes

### 🔧 Técnicas
- **Performance:** Cache Redis e lazy loading para catálogos grandes
- **Segurança:** Autenticação JWT com RBAC e criptografia de dados
- **Escalabilidade:** Arquitetura microservices com Kubernetes
- **Acessibilidade:** WCAG 2.1 AA compliance

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Next.js 14 com App Router
- **Linguagem:** TypeScript 5.0
- **Estilização:** Tailwind CSS + Shadcn/ui
- **Estado:** Zustand + React Query
- **Testes:** Jest + Playwright

### Backend
- **Framework:** Node.js + Express + TypeScript
- **Banco de Dados:** PostgreSQL 15 + Prisma ORM
- **Cache:** Redis 7
- **Autenticação:** JWT + Passport.js
- **API:** REST com OpenAPI 3.0

## 🚀 Getting Started

### Instalação
```bash
# Clone o repositório
git clone https://github.com/industrial/supply.git
cd industrial-supply

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET, etc.

# Execute migrações
npx prisma migrate dev

# Inicie desenvolvimento
npm run dev
```

### Acesso
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api
- **Admin:** http://localhost:3000/admin
- **Documentação:** http://localhost:3000/docs
```

---

### Exemplo 2: API RESTful

#### Input (Especificação da API)
```
API: Sistema de gestão de tarefas
Endpoints: CRUD de tasks, usuários, projetos
Autenticação: JWT Bearer tokens
Database: MongoDB com Mongoose
Features: Assignments, deadlines, comments
```

#### Output (Documentação API Gerada)
```markdown
# 📋 TaskManager API Documentation

## 🔐 Autenticação

### Bearer Token (JWT)
```bash
curl -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
     https://api.taskmanager.com/v1/tasks
```

### Obtenção de Token
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}' \
     https://api.taskmanager.com/v1/auth/login
```

Response:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "expires_in": 3600
  }
}
```

## 📋 Tasks

### GET /tasks
Lista tarefas com filtros e paginação.

#### Query Parameters
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| page | number | 1 | Número da página |
| limit | number | 20 | Items por página (máx: 100) |
| status | string | - | pending|in_progress|completed |
| priority | string | - | low|medium|high |
| assignee | string | - | ID do usuário atribuído |
| project | string | - | ID do projeto |

#### Response 200
```json
{
  "data": [
    {
      "id": "64a1b2c3d4e5f6789012345",
      "title": "Implementar autenticação JWT",
      "description": "Criar sistema de login com JWT tokens",
      "status": "in_progress",
      "priority": "high",
      "assignee": {
        "id": "64a1b2c3d4e5f6789012346",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "project": {
        "id": "64a1b2c3d4e5f6789012347",
        "name": "Sistema de Autenticação"
      },
      "due_date": "2024-02-15T23:59:59Z",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-16T14:20:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### POST /tasks
Cria uma nova tarefa.

#### Request Body
```json
{
  "title": "Configurar CI/CD pipeline",
  "description": "Implementar GitHub Actions para deploy automático",
  "priority": "medium",
  "assignee_id": "64a1b2c3d4e5f6789012346",
  "project_id": "64a1b2c3d4e5f6789012347",
  "due_date": "2024-02-20T23:59:59Z",
  "tags": ["devops", "automation", "github"]
}
```

#### Response 201
```json
{
  "data": {
    "id": "64a1b2c3d4e5f6789012348",
    "title": "Configurar CI/CD pipeline",
    "description": "Implementar GitHub Actions para deploy automático",
    "status": "pending",
    "priority": "medium",
    "assignee": {
      "id": "64a1b2c3d4e5f6789012346",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "project": {
      "id": "64a1b2c3d4e5f6789012347",
      "name": "Sistema de Autenticação"
    },
    "due_date": "2024-02-20T23:59:59Z",
    "tags": ["devops", "automation", "github"],
    "created_at": "2024-01-16T15:45:00Z",
    "updated_at": "2024-01-16T15:45:00Z"
  }
}
```

## 📊 Data Models

### Task
```json
{
  "id": "string (ObjectId)",
  "title": "string (required, max: 200)",
  "description": "string (optional, max: 2000)",
  "status": "enum: pending|in_progress|completed|cancelled",
  "priority": "enum: low|medium|high|urgent",
  "assignee": "User (optional)",
  "project": "Project (optional)",
  "due_date": "ISO 8601 datetime (optional)",
  "tags": "array<string>",
  "comments": "array<Comment>",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "title": "Título é obrigatório",
      "due_date": "Data deve ser futura"
    }
  }
}
```

### Error Codes
| Código | HTTP | Descrição |
|--------|------|-----------|
| VALIDATION_ERROR | 400 | Erro de validação |
| UNAUTHORIZED | 401 | Não autorizado |
| FORBIDDEN | 403 | Acesso negado |
| NOT_FOUND | 404 | Recurso não encontrado |
| CONFLICT | 409 | Conflito de dados |
| RATE_LIMIT_EXCEEDED | 429 | Limite excedido |
| INTERNAL_ERROR | 500 | Erro interno |
```

---

### Exemplo 3: ADR (Architecture Decision Record)

#### Input (Decisão Arquitetural)
```
Decisão: Escolha entre Monolith vs Microservices
Contexto: Sistema de e-commerce B2B crescendo rapidamente
Equipe: 8 desenvolvedores, experiência variada
Requisitos: Escalabilidade, time-to-market, manutenção
```

#### Output (ADR Gerado)
```markdown
# ADR-001: Arquitetura Monolith vs Microservices

## Status
Accepted

## Contexto
IndustrialSupply está experimentando crescimento rápido de usuários e pedidos. A arquitetura monolítica atual está mostrando sinais de dificuldade em escalar, com deployments lentos e acoplamento crescente entre módulos.

### Fatores Considerados
- **Crescimento:** 300% aumento de usuários nos últimos 6 meses
- **Equipe:** 8 desenvolvedores com experiência mista
- **Time-to-Market:** Necessidade de lançar features rapidamente
- **Manutenibilidade:** Código base crescendo em complexidade
- **Performance:** Tempos de resposta aumentando sob carga

## Decisão
Adotar arquitetura **Modular Monolith** com estratégia de migração gradual para microservices no futuro.

### Arquitetura Escolhida
```
┌─────────────────────────────────────┐
│           Monolith Modular          │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Users   │ │Products │ │ Orders  │ │
│  │ Module  │ │ Module  │ │ Module  │ │
│  └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Payment │ │Shipping │ │ Analytics│ │
│  │ Module  │ │ Module  │ │ Module  │ │
│  └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│         Shared Infrastructure        │
│  - Database (PostgreSQL)            │
│  - Cache (Redis)                     │
│  - Message Queue (RabbitMQ)         │
└─────────────────────────────────────┘
```

## Razões

### Por que Modular Monolith Agora?
1. **Time-to-Market:** Mais rápido para implementar features
2. **Equipe:** Menor complexidade operacional para time misto
3. **Custo:** Infraestrutura mais simples e barata
4. **Debugging:** Mais fácil de debugar e monitorar
5. **Transações:** Consistência de dados mais simples

### Por que não Microservices Agora?
1. **Complexidade Operacional:** Overhead para equipe atual
2. **Distribuição:** Debugging distribuído complexo
3. **Dados:** Consistência distribuída desafiadora
4. **Testes:** Testes de integração mais complexos

## Consequências

### Positivas ✅
- **Desenvolvimento Rápido:** Features implementadas 40% mais rápido
- **Deploy Simples:** Single artifact deployment
- **Debugging:** Stack traces unificados
- **Transações:** ACID transactions disponíveis
- **Custo:** Menor overhead operacional

### Negativas ❌
- **Escalabilidade:** Escala vertical limitada
- **Acoplamento:** Risco de acoplamento entre módulos
- **Tecnologia:** Single technology stack
- **Deploy:** Deploy completo necessário para mudanças pequenas

## Estratégia de Migração Futura

### Fase 1 (0-6 meses): Modularização
- Implementar boundaries claros entre módulos
- Usar Domain-Driven Design
- Criar APIs internas entre módulos

### Fase 2 (6-12 meses): Preparação
- Implementar service discovery
- Criar observabilidade granular
- Preparar databases para split

### Fase 3 (12+ meses): Extração Gradual
- Extrair módulos independentes como microservices
- Começar com Analytics, depois Payments
- Manter core como monolith por mais tempo

## Alternativas Consideradas

### Microservices Imediato
**Prós:** Escalabilidade horizontal, tecnologia heterogênea  
**Contras:** Complexidade operacional alta, time não preparado

### Serverless Functions
**Prós:** Auto-scaling, pay-per-use  
**Contras:** Cold starts, complexidade de estado

### Clean Architecture
**Prós:** Separação de responsabilidades clara  
**Contras:** Overhead de complexidade para time atual

## Métricas de Sucesso

### Técnicas
- **Deploy Time:** < 5 minutos (atual: 15 minutos)
- **Build Time:** < 3 minutos (atual: 8 minutos)
- **Response Time:** < 200ms P95 (atual: 500ms)
- **Uptime:** 99.9% (atual: 99.5%)

### Negócio
- **Time-to-Market:** Features 40% mais rápidas
- **Bug Rate:** Redução 50% em bugs de integração
- **Developer Velocity:** +25% na velocidade de entrega

## Data da Decisão
2024-01-15

## Revisão
Próxima revisão em 2024-07-15 ou quando atingirmos 1000 usuários simultâneos.

---

## Aprovadores
- **CTO:** João Silva (joao@company.com)
- **Tech Lead:** Maria Santos (maria@company.com)
- **Product Manager:** Pedro Oliveira (pedro@company.com)
```

---

## 🎯 Templates de Uso Rápido

### Template para Novo Projeto
```markdown
# 🚀 [Nome do Projeto]

> [Descrição em uma linha]

## 🎯 Sobre
[2-3 parágrafos explicando o projeto]

## ✨ Features
- **Feature 1:** [Descrição]
- **Feature 2:** [Descrição]

## 🛠️ Stack
- **Frontend:** [Tecnologias]
- **Backend:** [Tecnologias]
- **Database:** [Banco]

## 🚀 Getting Started
```bash
# Instalação
git clone [url]
cd [projeto]
npm install

# Configuração
cp .env.example .env

# Execução
npm run dev
```

## 📁 Estrutura
```
projeto/
├── src/
├── tests/
├── docs/
└── README.md
```
```

### Template para API Endpoint
```markdown
### [MÉTODO] [ENDPOINT]
[Descrição curta do endpoint]

#### Request
```bash
curl -X [MÉTODO] \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '[REQUEST_BODY]' \
     [URL]
```

#### Response 200
```json
{
  "data": [RESPONSE_DATA]
}
```

#### Error Responses
- **400:** Bad Request
- **401:** Unauthorized
- **404:** Not Found
```

---

## 📊 Métricas de Qualidade

### Checklist de Validação
- [ ] **README completo** com getting started
- [ ] **API docs** sincronizadas com código
- [ ] **Exemplos funcionais** testados
- [ ] **Links válidos** e acessíveis
- [ ] **Formato consistente** em todo documento
- [ ] **Versão atualizada** com changelog

### Score de Qualidade
- **Completude:** 25 pontos
- **Clareza:** 20 pontos
- **Exemplos:** 20 pontos
- **Atualização:** 15 pontos
- **Formatação:** 10 pontos
- **Links:** 10 pontos

**Mínimo para aprovação:** 75/100 pontos