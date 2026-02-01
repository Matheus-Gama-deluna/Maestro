# Exemplos Práticos - Plano de Execução

**Versão:** 2.0  
**Última Atualização:** 31/01/2026

Este arquivo contém exemplos práticos completos de planejamento de execução para diferentes tipos de projetos.

---

## Exemplo 1: E-commerce - Backlog Completo

### **Input: PRD de E-commerce**

**Produto:** Loja online de roupas  
**MVP:** Catálogo + Carrinho + Checkout  
**Time:** 2 devs + IA  
**Prazo:** 8 semanas

### **Output: Backlog Estruturado**

**Épicos Identificados:**
1. Catálogo de Produtos (Alta prioridade)
2. Carrinho de Compras (Alta prioridade)
3. Checkout e Pagamento (Crítica)

**Features por Tipo:**
- **CONT-001:** API de Produtos (OpenAPI) - 2 dias
- **CONT-002:** API de Carrinho - 1 dia
- **CONT-003:** API de Checkout - 3 dias
- **FE-001:** Listagem de Produtos - 3 dias
- **FE-002:** Detalhes do Produto - 2 dias
- **FE-003:** Carrinho de Compras - 4 dias
- **FE-004:** Fluxo de Checkout - 5 dias
- **BE-001:** CRUD de Produtos - 4 dias
- **BE-002:** Lógica de Carrinho - 3 dias
- **BE-003:** Processamento de Pagamento - 6 dias
- **INT-001:** Integração Catálogo - 2 dias
- **INT-002:** Integração Checkout - 3 dias

**Timeline:**
- Sprint 0: Setup (1 semana)
- Sprint 1: Contratos (2 semanas)
- Sprint 2-3: Frontend + Backend paralelo (4 semanas)
- Sprint 4: Integração (1 semana)

**Total:** 8 semanas com buffer de 20%

---

## Exemplo 2: SaaS - Sprint Planning

### **Input: Requisitos de Dashboard**

**Produto:** Dashboard de analytics  
**Feature:** Visualização de métricas em tempo real  
**Time:** 1 dev + IA  
**Sprint:** 2 semanas

### **Output: Sprint Backlog**

**Histórias do Sprint:**

1. **US-001:** Como usuário, quero ver métricas em cards
   - Estimativa: 3 pontos
   - Tarefas: Componente Card, API de métricas, Testes

2. **US-002:** Como usuário, quero filtrar por período
   - Estimativa: 5 pontos
   - Tarefas: DatePicker, Query params, Cache

3. **US-003:** Como usuário, quero exportar relatório
   - Estimativa: 5 pontos
   - Tarefas: Geração PDF, Download, Email

**Capacity:** 13 pontos (assumindo velocity de 13 pontos/sprint)  
**Commitment:** 13 pontos (100% da capacity)

---

## Exemplo 3: Mobile App - Release Planning

### **Input: Design de App Mobile**

**Produto:** App de delivery  
**Releases:** 3 releases em 12 semanas  
**Time:** 2 devs + IA

### **Output: Roadmap de Releases**

**Release 1.0 - MVP (Semana 4):**
- Cadastro e Login
- Listagem de Restaurantes
- Cardápio
- Carrinho básico

**Release 1.1 - Pagamento (Semana 8):**
- Integração com gateway
- Histórico de pedidos
- Notificações push

**Release 1.2 - Gamificação (Semana 12):**
- Sistema de pontos
- Cupons de desconto
- Avaliações

**Métricas:**
- Features por release: 4-5
- Velocity média: 20 pontos/sprint
- Buffer: 20% em cada release

---

## Exemplo 4: API REST - Contrato First

### **Input: Requisito de API de Usuários**

**Funcionalidade:** CRUD completo de usuários  
**Stack:** NestJS + PostgreSQL

### **Output: Contrato + Histórias**

**CONT-001: Contrato de API de Usuários**

```yaml
openapi: 3.0.0
paths:
  /api/users:
    get:
      summary: Listar usuários
      responses:
        '200':
          description: Lista de usuários
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Criar usuário
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserDto'
      responses:
        '201':
          description: Usuário criado
```

**Histórias Derivadas:**
- **FE-001:** Tela de listagem de usuários (contra mock)
- **FE-002:** Formulário de criação (contra mock)
- **BE-001:** Implementar GET /api/users
- **BE-002:** Implementar POST /api/users
- **INT-001:** Conectar frontend com backend real

---

## Exemplo 5: Microserviços - Dependências Complexas

### **Input: Sistema com 3 Microserviços**

**Serviços:**
1. Auth Service
2. User Service
3. Order Service

**Dependências:**
- Order Service depende de User Service
- Ambos dependem de Auth Service

### **Output: Ordem de Execução**

**Fase 1: Auth Service (Semanas 1-2)**
- CONT-001: Contrato de Auth
- BE-001: Implementar Auth
- Testes de integração

**Fase 2: User Service (Semanas 3-4)**
- CONT-002: Contrato de User
- BE-002: Implementar User (usa Auth)
- Testes de integração

**Fase 3: Order Service (Semanas 5-6)**
- CONT-003: Contrato de Order
- BE-003: Implementar Order (usa User + Auth)
- Testes de integração

**Fase 4: Frontend (Semanas 7-8)**
- FE-001: Telas de autenticação
- FE-002: Gestão de usuários
- FE-003: Gestão de pedidos

**Fase 5: Integração (Semana 9)**
- INT-001: Testes E2E completos
- Deploy orquestrado

---

**Total de Exemplos:** 5  
**Cenários Cobertos:** E-commerce, SaaS, Mobile, API REST, Microserviços  
**Complexidade:** Simples a Complexa
