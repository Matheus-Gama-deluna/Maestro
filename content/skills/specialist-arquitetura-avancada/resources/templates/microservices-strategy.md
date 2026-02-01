# Microservices Strategy Template

**Sistema:** `[SYSTEM_NAME]`  
**Versão:** 1.0  
**Data:** `[DATE]`

---

## 📋 Visão Geral da Estratégia

### Objetivos

**Por que Microservices?**
- `[Objetivo 1: ex: Escalabilidade independente]`
- `[Objetivo 2: ex: Deploy independente]`
- `[Objetivo 3: ex: Times autônomos]`
- `[Objetivo 4: ex: Tecnologias heterogêneas]`

### Princípios Arquiteturais

1. **Single Responsibility:** Um serviço, uma responsabilidade
2. **Loose Coupling:** Comunicação via APIs bem definidas
3. **High Cohesion:** Funcionalidades relacionadas juntas
4. **Autonomous:** Deployable e escalável independentemente
5. **Resilient:** Falhas isoladas, não cascata

---

## 🎯 Service Boundaries

### Serviços Identificados

| Serviço | Bounded Context | Responsabilidade | Team Owner |
|---------|-----------------|------------------|------------|
| `[Service 1]` | `[Context 1]` | `[Responsabilidade]` | `[Team]` |
| `[Service 2]` | `[Context 2]` | `[Responsabilidade]` | `[Team]` |
| `[Service 3]` | `[Context 3]` | `[Responsabilidade]` | `[Team]` |

### Service Sizing

**Critérios para Tamanho:**
- **Nano:** 1-2 desenvolvedores, < 1000 LOC
- **Micro:** 2-5 desenvolvedores, 1000-5000 LOC
- **Small:** 5-10 desenvolvedores, 5000-20000 LOC

**Recomendação:** Preferir Micro services

---

## 🔗 Communication Patterns

### Synchronous Communication

#### REST APIs

**Quando usar:**
- Request/Response imediato
- Cliente precisa do resultado
- Operações de leitura (queries)

**Padrões:**
```
Client → API Gateway → Service A
                    ↓
                Service B (se necessário)
```

**Exemplo:**
```yaml
# Service: [Service Name]
# Endpoint: GET /api/[resource]/{id}

openapi: 3.0.0
paths:
  /api/[resource]/{id}:
    get:
      summary: Get [resource] by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/[ResourceDto]'
        '404':
          description: Not found
```

---

#### GraphQL (Opcional)

**Quando usar:**
- Clientes precisam de dados flexíveis
- Múltiplas fontes de dados
- Mobile/Web com requisitos diferentes

**Schema:**
```graphql
type [Resource] {
  id: ID!
  [field1]: String!
  [field2]: Int
  [relation]: [RelatedResource]
}

type Query {
  [resource](id: ID!): [Resource]
  [resources](filter: [ResourceFilter]): [[Resource]!]!
}

type Mutation {
  create[Resource](input: Create[Resource]Input!): [Resource]!
  update[Resource](id: ID!, input: Update[Resource]Input!): [Resource]!
}
```

---

### Asynchronous Communication

#### Message Queues

**Quando usar:**
- Fire and forget
- Processamento assíncrono
- Eventual consistency aceitável
- Desacoplamento temporal

**Tecnologias:**
- **RabbitMQ:** Mensagens transacionais
- **Apache Kafka:** Event streaming, high throughput
- **AWS SQS/SNS:** Cloud-native, managed

**Padrões:**
```
Service A → Message Queue → Service B
                         → Service C
                         → Service D
```

**Exemplo (RabbitMQ):**
```typescript
// Publisher (Service A)
await channel.publish(
  'exchange.events',
  '[event.name]',
  Buffer.from(JSON.stringify({
    eventId: uuid(),
    eventType: '[EventName]',
    data: { /* ... */ }
  }))
);

// Consumer (Service B)
channel.consume('queue.[service-b]', async (msg) => {
  const event = JSON.parse(msg.content.toString());
  await this.handleEvent(event);
  channel.ack(msg);
});
```

---

#### Event-Driven Architecture

**Quando usar:**
- Domain events são centrais
- Múltiplos consumidores
- Event sourcing
- Audit trail necessário

**Padrões:**
```
Service A → Event Bus (Kafka) → Service B (Consumer Group 1)
                              → Service C (Consumer Group 2)
                              → Service D (Consumer Group 3)
```

**Exemplo (Kafka):**
```typescript
// Producer
await producer.send({
  topic: 'domain.events.[aggregate]',
  messages: [{
    key: aggregateId,
    value: JSON.stringify({
      eventType: '[EventName]',
      aggregateId,
      data: { /* ... */ }
    })
  }]
});

// Consumer
await consumer.subscribe({ 
  topic: 'domain.events.[aggregate]',
  fromBeginning: false
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    await this.handleEvent(event);
  }
});
```

---

## 🚪 API Gateway

### Responsabilidades

1. **Routing:** Direcionar requests para serviços
2. **Authentication:** Validar tokens JWT
3. **Rate Limiting:** Limitar requests por cliente
4. **Caching:** Cache de responses
5. **Aggregation:** Combinar múltiplos serviços
6. **Protocol Translation:** REST → gRPC, etc

### Configuração

```yaml
# Kong API Gateway
services:
  - name: [service-1]
    url: http://[service-1]:3000
    routes:
      - name: [service-1]-route
        paths:
          - /api/[resource]
        methods:
          - GET
          - POST
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100
      - name: cors
```

### Backend for Frontend (BFF)

**Quando usar:**
- Mobile e Web têm necessidades diferentes
- Agregação complexa de dados
- Otimização por cliente

```
Mobile App → BFF Mobile → Service A
                       → Service B
                       → Service C

Web App → BFF Web → Service A
                  → Service D
```

---

## 🗄️ Data Management

### Database per Service

**Princípio:** Cada serviço tem seu próprio banco de dados

```
Service A → Database A (PostgreSQL)
Service B → Database B (MongoDB)
Service C → Database C (Redis)
```

**Vantagens:**
- Isolamento de dados
- Tecnologia adequada por serviço
- Escalabilidade independente

**Desafios:**
- Transações distribuídas
- Queries cross-service
- Consistência de dados

---

### Saga Pattern

**Para transações distribuídas:**

#### Choreography-Based Saga

```
Order Service → OrderCreated event
              ↓
Payment Service → PaymentProcessed event
                ↓
Inventory Service → InventoryReserved event
                  ↓
Shipping Service → ShippingScheduled event
```

**Compensating Transactions:**
```
Se Shipping falha:
  → CancelShipping
  → ReleaseInventory
  → RefundPayment
  → CancelOrder
```

#### Orchestration-Based Saga

```
Saga Orchestrator
  ↓
  1. CreateOrder (Order Service)
  2. ProcessPayment (Payment Service)
  3. ReserveInventory (Inventory Service)
  4. ScheduleShipping (Shipping Service)
  
Se falha em qualquer passo:
  → Executar compensações na ordem reversa
```

---

### Event Sourcing + CQRS

**Para consistência eventual:**

```
Write Side:
Command → Service A → Event Store → Domain Events

Read Side:
Domain Events → Projector → Read Model (Service B)
                          → Read Model (Service C)
```

---

## 🔐 Service Mesh

### Responsabilidades

1. **Service Discovery:** Encontrar serviços
2. **Load Balancing:** Distribuir carga
3. **Circuit Breaking:** Prevenir cascata de falhas
4. **Retry Logic:** Retry automático
5. **Observability:** Tracing distribuído
6. **Security:** mTLS entre serviços

### Tecnologias

- **Istio:** Full-featured, complexo
- **Linkerd:** Lightweight, simples
- **Consul Connect:** Service mesh + service discovery

### Configuração (Istio)

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: [service-name]
spec:
  hosts:
    - [service-name]
  http:
    - route:
        - destination:
            host: [service-name]
            subset: v1
          weight: 90
        - destination:
            host: [service-name]
            subset: v2
          weight: 10
      retries:
        attempts: 3
        perTryTimeout: 2s
      timeout: 10s
```

---

## 🚀 Deployment Strategy

### Independent Deployment

**Cada serviço tem seu próprio pipeline:**

```
Code → Build → Test → Deploy to Dev → Deploy to Staging → Deploy to Prod
```

### Blue-Green Deployment

```
Traffic → Load Balancer → Blue (v1) - 100%
                       → Green (v2) - 0%

Após validação:
Traffic → Load Balancer → Blue (v1) - 0%
                       → Green (v2) - 100%
```

### Canary Deployment

```
Traffic → Load Balancer → v1 - 90%
                       → v2 - 10%

Gradualmente:
v1: 90% → 70% → 50% → 20% → 0%
v2: 10% → 30% → 50% → 80% → 100%
```

---

## 📊 Service Catalog

### Service Registry

| Service | Version | Endpoint | Health Check | Owner |
|---------|---------|----------|--------------|-------|
| `[Service 1]` | `v1.2.3` | `http://[service-1]:3000` | `/health` | `[Team]` |
| `[Service 2]` | `v2.0.1` | `http://[service-2]:3000` | `/health` | `[Team]` |
| `[Service 3]` | `v1.5.0` | `http://[service-3]:3000` | `/health` | `[Team]` |

### API Contracts

**Versionamento:**
- **URL Versioning:** `/api/v1/[resource]`
- **Header Versioning:** `Accept: application/vnd.api+json;version=1`
- **Content Negotiation:** `Accept: application/vnd.api.v1+json`

**Recomendação:** URL Versioning (mais explícito)

---

## 🛡️ Resilience Patterns

### Circuit Breaker

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private threshold = 5;
  private timeout = 60000; // 1 minuto
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitBreakerOpenError();
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
    }
  }
}
```

### Retry with Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await sleep(delay);
    }
  }
}
```

### Bulkhead Pattern

```typescript
// Isolar recursos por pool
class BulkheadExecutor {
  private pools: Map<string, Semaphore> = new Map();
  
  async execute<T>(
    poolName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const semaphore = this.getPool(poolName);
    
    await semaphore.acquire();
    try {
      return await fn();
    } finally {
      semaphore.release();
    }
  }
  
  private getPool(name: string): Semaphore {
    if (!this.pools.has(name)) {
      this.pools.set(name, new Semaphore(10)); // 10 concurrent
    }
    return this.pools.get(name)!;
  }
}
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: [service-name]-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: [service-name]
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Load Balancing

**Estratégias:**
- **Round Robin:** Distribuição uniforme
- **Least Connections:** Menos conexões ativas
- **IP Hash:** Sticky sessions
- **Weighted:** Baseado em capacidade

---

## ✅ Checklist de Implementação

### Service Design
- [ ] Bounded contexts mapeados para serviços
- [ ] Single responsibility por serviço
- [ ] APIs bem definidas (OpenAPI/AsyncAPI)
- [ ] Database per service
- [ ] Versionamento de APIs

### Communication
- [ ] API Gateway configurado
- [ ] Message broker escolhido e configurado
- [ ] Event schemas definidos
- [ ] Service mesh implementado (opcional)
- [ ] Circuit breakers implementados

### Data Management
- [ ] Saga pattern para transações distribuídas
- [ ] Eventual consistency aceita
- [ ] Event sourcing onde aplicável
- [ ] Read models otimizados

### Deployment
- [ ] CI/CD por serviço
- [ ] Blue-green ou canary deployment
- [ ] Health checks implementados
- [ ] Service discovery configurado
- [ ] Auto-scaling configurado

### Observability
- [ ] Distributed tracing (Jaeger/Zipkin)
- [ ] Centralized logging (ELK)
- [ ] Metrics (Prometheus/Grafana)
- [ ] Alerting configurado
- [ ] Dashboards criados

---

## 📊 Métricas e Monitoramento

### Service-Level Metrics
- **Latency:** p95 < 100ms
- **Throughput:** > 1000 RPS
- **Error Rate:** < 0.1%
- **Availability:** 99.9%

### Business Metrics
- **Requests/Service:** Distribuição de carga
- **Service Dependencies:** Mapa de dependências
- **Deployment Frequency:** Deploys por semana

### Alertas
- 🔴 **Critical:** Service down
- 🟡 **Warning:** High latency (> 500ms)
- 🟢 **Info:** Deployment completed

---

**Última Atualização:** `[DATE]`  
**Próxima Revisão:** `[DATE]`  
**Responsável:** `[TEAM/PERSON]`
