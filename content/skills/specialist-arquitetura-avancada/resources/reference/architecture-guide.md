# Architecture Guide - Referência Completa

**Versão:** 1.0  
**Data:** 01/02/2026

Guia de referência completo para Arquitetura Avançada com DDD, CQRS, Event Sourcing e Microservices.

---

## 📚 Índice

1. [Domain-Driven Design (DDD)](#domain-driven-design)
2. [CQRS Patterns](#cqrs-patterns)
3. [Event Sourcing Patterns](#event-sourcing-patterns)
4. [Microservices Best Practices](#microservices-best-practices)
5. [Integration Patterns](#integration-patterns)
6. [Anti-Patterns](#anti-patterns)

---

## Domain-Driven Design

### Strategic Design

#### Bounded Context

**Definição:** Um boundary explícito dentro do qual um modelo de domínio é definido e aplicável.

**Quando usar:**
- Sistema complexo com múltiplos subdomínios
- Times diferentes trabalhando em áreas diferentes
- Necessidade de isolamento de conceitos

**Como identificar:**
- Analise a linguagem usada em diferentes áreas
- Identifique onde os mesmos termos têm significados diferentes
- Agrupe funcionalidades relacionadas

**Exemplo:**
```
E-commerce:
- Catalog Context: Product, Category, SKU
- Order Context: Order, OrderItem, Cart
- Payment Context: Transaction, PaymentMethod
```

#### Context Mapping

**Tipos de Relações:**

1. **Partnership**
   - Dois contextos evoluem juntos
   - Mudanças coordenadas
   - Usado quando: Times colaboram estreitamente

2. **Shared Kernel**
   - Subset do modelo compartilhado
   - Mudanças requerem consenso
   - Usado quando: Conceitos realmente compartilhados

3. **Customer/Supplier**
   - Upstream (Supplier) e Downstream (Customer)
   - Customer depende de Supplier
   - Usado quando: Dependência clara

4. **Conformist**
   - Downstream conforma ao modelo upstream
   - Sem tradução
   - Usado quando: Upstream não pode mudar

5. **Anticorruption Layer (ACL)**
   - Camada de tradução
   - Protege modelo interno
   - Usado quando: Modelos incompatíveis

6. **Open Host Service**
   - API pública bem definida
   - Múltiplos consumers
   - Usado quando: Serviço compartilhado

7. **Published Language**
   - Linguagem comum para integração
   - Documentada e versionada
   - Usado quando: Múltiplos integradores

---

### Tactical Design

#### Aggregates

**Definição:** Cluster de objetos de domínio tratados como uma unidade para mudanças de dados.

**Regras:**
1. Um aggregate tem uma root entity
2. Referências externas apenas para a root
3. Invariants são mantidos dentro do aggregate
4. Transações não cruzam aggregates

**Design Guidelines:**
- Mantenha aggregates pequenos (idealmente uma entity)
- Use IDs para referenciar outros aggregates
- Modele verdadeiras invariants
- Considere eventual consistency

**Exemplo:**
```typescript
class Order extends AggregateRoot {
  private items: OrderItem[] = [];
  
  // Invariant: Order total must match sum of items
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.recalculateTotal();
  }
  
  // Invariant enforced
  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum + item.subtotal(),
      0
    );
  }
}
```

#### Entities vs Value Objects

**Entity:**
- Tem identidade única
- Mutável
- Comparação por ID
- Exemplo: User, Order, Product

**Value Object:**
- Sem identidade
- Imutável
- Comparação por valor
- Exemplo: Money, Address, DateRange

**Quando usar cada um:**
```typescript
// Entity - tem identidade
class Customer {
  constructor(
    public readonly id: CustomerId,
    private name: string,
    private email: Email // Value Object
  ) {}
  
  changeName(newName: string): void {
    this.name = newName;
  }
}

// Value Object - sem identidade, imutável
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}
  
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(
      this.amount + other.amount,
      this.currency
    );
  }
  
  equals(other: Money): boolean {
    return this.amount === other.amount &&
           this.currency === other.currency;
  }
}
```

#### Domain Events

**Definição:** Algo que aconteceu no domínio que é importante para o negócio.

**Naming Convention:**
- Past tense (OrderCreated, PaymentProcessed)
- Descreve o que aconteceu
- Contém dados relevantes

**Estrutura:**
```typescript
interface DomainEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  
  // Event-specific data
}

class OrderCreated implements DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly occurredAt: Date,
    public readonly aggregateId: string,
    public readonly customerId: string,
    public readonly totalAmount: number
  ) {}
}
```

---

## CQRS Patterns

### Command Side

**Princípios:**
- Commands são intenções (CreateOrder, CancelOrder)
- Validações de negócio no aggregate
- Retorna void ou ID
- Gera domain events

**Pattern:**
```typescript
// Command
interface CreateOrder {
  customerId: string;
  items: OrderItemDto[];
}

// Handler
class CreateOrderHandler {
  async handle(command: CreateOrder): Promise<string> {
    // 1. Validate
    this.validate(command);
    
    // 2. Create aggregate
    const order = Order.create(
      command.customerId,
      command.items
    );
    
    // 3. Save
    await this.repository.save(order);
    
    // 4. Publish events
    await this.eventBus.publishAll(
      order.uncommittedEvents
    );
    
    return order.id;
  }
}
```

### Query Side

**Princípios:**
- Queries são perguntas (GetOrderById)
- Não modificam estado
- Retornam DTOs
- Otimizados para leitura

**Pattern:**
```typescript
// Query
interface GetOrderById {
  orderId: string;
}

// Handler
class GetOrderByIdHandler {
  async handle(query: GetOrderById): Promise<OrderDto> {
    return await this.readRepository.findById(
      query.orderId
    );
  }
}

// DTO (desnormalizado)
interface OrderDto {
  id: string;
  customerName: string; // Denormalized
  items: OrderItemDto[];
  total: number;
  status: string;
  createdAt: Date;
}
```

### Read Model Projection

**Pattern:**
```typescript
class OrderReadModelProjector {
  // Atualiza read model quando eventos ocorrem
  async onOrderCreated(event: OrderCreated): Promise<void> {
    await this.readRepository.insert({
      id: event.aggregateId,
      customerId: event.customerId,
      total: event.totalAmount,
      status: 'PENDING',
      createdAt: event.occurredAt
    });
  }
  
  async onOrderPaid(event: OrderPaid): Promise<void> {
    await this.readRepository.update(
      event.aggregateId,
      { status: 'PAID' }
    );
  }
}
```

---

## Event Sourcing Patterns

### Event Store

**Princípios:**
- Eventos são append-only (imutáveis)
- Eventos são a fonte da verdade
- Estado é derivado de eventos
- Suporta temporal queries

**Implementation:**
```typescript
class EventStore {
  async appendEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    // Optimistic locking
    const currentVersion = await this.getCurrentVersion(
      aggregateId
    );
    
    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyException();
    }
    
    // Append events
    for (const event of events) {
      await this.storage.insert(event);
    }
  }
  
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return await this.storage.findByAggregateId(
      aggregateId
    );
  }
}
```

### Snapshots

**Quando usar:**
- Aggregate tem muitos eventos (> 100)
- Performance de replay é crítica
- Temporal queries são frequentes

**Strategy:**
```typescript
class SnapshotStrategy {
  shouldCreateSnapshot(eventCount: number): boolean {
    return eventCount % 100 === 0;
  }
  
  async createSnapshot(aggregate: AggregateRoot): Promise<void> {
    const snapshot = {
      aggregateId: aggregate.id,
      version: aggregate.version,
      state: aggregate.toSnapshot(),
      createdAt: new Date()
    };
    
    await this.storage.save(snapshot);
  }
}
```

### Event Versioning

**Strategies:**

1. **Upcasting:**
```typescript
class EventUpcaster {
  upcast(event: DomainEvent): DomainEvent {
    if (event.version === 1) {
      return this.upcastV1ToV2(event);
    }
    return event;
  }
  
  private upcastV1ToV2(eventV1: any): any {
    return {
      ...eventV1,
      version: 2,
      newField: 'default value'
    };
  }
}
```

2. **Multiple Versions:**
```typescript
interface OrderCreatedV1 {
  version: 1;
  customerId: string;
  total: number;
}

interface OrderCreatedV2 {
  version: 2;
  customerId: string;
  total: number;
  currency: string; // NEW
}

type OrderCreated = OrderCreatedV1 | OrderCreatedV2;
```

---

## Microservices Best Practices

### Service Sizing

**Guidelines:**
- **Nano:** 1-2 devs, < 1000 LOC
- **Micro:** 2-5 devs, 1000-5000 LOC
- **Small:** 5-10 devs, 5000-20000 LOC

**Recommendation:** Micro services

### Communication Patterns

#### Synchronous (REST)

**Quando usar:**
- Request/Response imediato
- Cliente precisa do resultado
- Queries (leitura)

**Pattern:**
```typescript
// Service A chama Service B
const response = await axios.get(
  'http://service-b/api/resource'
);
```

#### Asynchronous (Message Queue)

**Quando usar:**
- Fire and forget
- Processamento assíncrono
- Eventual consistency

**Pattern:**
```typescript
// Service A publica mensagem
await messageQueue.publish('queue.name', {
  eventType: 'OrderCreated',
  data: { orderId: '123' }
});

// Service B consome
messageQueue.subscribe('queue.name', async (msg) => {
  await this.handleOrderCreated(msg.data);
});
```

#### Event-Driven

**Quando usar:**
- Domain events são centrais
- Múltiplos consumidores
- Auditoria necessária

**Pattern:**
```typescript
// Service A publica evento
await eventBus.publish(new OrderCreated(orderId));

// Services B, C, D subscrevem
eventBus.subscribe(OrderCreated, async (event) => {
  await this.processOrder(event);
});
```

### Resilience Patterns

#### Circuit Breaker

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new CircuitBreakerOpenError();
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
}
```

#### Retry with Backoff

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
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

#### Bulkhead

```typescript
class BulkheadExecutor {
  private semaphore = new Semaphore(10);
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.semaphore.acquire();
    try {
      return await fn();
    } finally {
      this.semaphore.release();
    }
  }
}
```

---

## Integration Patterns

### Saga Pattern

#### Orchestration

```typescript
class OrderSaga {
  async execute(command: CreateOrder): Promise<void> {
    const compensations = [];
    
    try {
      // Step 1
      const orderId = await this.createOrder(command);
      compensations.push(() => this.cancelOrder(orderId));
      
      // Step 2
      await this.processPayment(orderId);
      compensations.push(() => this.refundPayment(orderId));
      
      // Step 3
      await this.reserveInventory(orderId);
      
    } catch (error) {
      // Execute compensations in reverse
      for (const compensate of compensations.reverse()) {
        await compensate();
      }
      throw error;
    }
  }
}
```

#### Choreography

```typescript
// Order Service
class OrderService {
  async createOrder(command: CreateOrder): Promise<void> {
    const order = await this.repository.create(command);
    await this.eventBus.publish(new OrderCreated(order.id));
  }
}

// Payment Service
class PaymentService {
  @Subscribe(OrderCreated)
  async onOrderCreated(event: OrderCreated): Promise<void> {
    await this.processPayment(event.orderId);
    await this.eventBus.publish(new PaymentProcessed(event.orderId));
  }
}

// Inventory Service
class InventoryService {
  @Subscribe(PaymentProcessed)
  async onPaymentProcessed(event: PaymentProcessed): Promise<void> {
    await this.reserveInventory(event.orderId);
  }
}
```

---

## Anti-Patterns

### ❌ Anemic Domain Model

**Problema:** Entities sem comportamento, apenas getters/setters.

```typescript
// ERRADO
class Order {
  public items: OrderItem[] = [];
  public total: number = 0;
  
  getItems() { return this.items; }
  setItems(items) { this.items = items; }
}

// CORRETO
class Order {
  private items: OrderItem[] = [];
  
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.recalculateTotal();
  }
}
```

### ❌ Shared Database

**Problema:** Múltiplos serviços acessando mesmo banco.

```typescript
// ERRADO
Service A → Database ← Service B

// CORRETO
Service A → Database A
Service B → Database B
```

### ❌ Distributed Monolith

**Problema:** Microservices com alto acoplamento.

**Sinais:**
- Deploys coordenados
- Mudanças em cascata
- Shared libraries com lógica de negócio

**Solução:**
- Database per service
- API contracts
- Bounded contexts claros

---

**Total:** ~600 linhas de referência técnica  
**Última Atualização:** 01/02/2026
