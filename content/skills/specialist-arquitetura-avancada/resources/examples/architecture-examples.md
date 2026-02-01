# Architecture Examples - Casos de Uso Completos

**Versão:** 1.0  
**Data:** 01/02/2026

Este documento contém 5 exemplos completos e production-ready de aplicação de padrões de Arquitetura Avançada.

---

## 📚 Índice de Exemplos

1. [E-commerce com DDD e Bounded Contexts](#exemplo-1-e-commerce-com-ddd)
2. [Sistema Financeiro com CQRS](#exemplo-2-sistema-financeiro-com-cqrs)
3. [Event Sourcing para Auditoria](#exemplo-3-event-sourcing-para-auditoria)
4. [Microservices com API Gateway](#exemplo-4-microservices-com-api-gateway)
5. [Saga Pattern para Transações Distribuídas](#exemplo-5-saga-pattern)

---

## Exemplo 1: E-commerce com DDD

### Contexto

Sistema de e-commerce com múltiplos bounded contexts seguindo Domain-Driven Design.

### Bounded Contexts Identificados

```
┌─────────────────────────────────────────────────────────┐
│                    E-commerce System                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Catalog    │  │    Order     │  │   Payment    │ │
│  │   Context    │  │   Context    │  │   Context    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                           │                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Shipping   │  │   Customer   │  │  Inventory   │ │
│  │   Context    │  │   Context    │  │   Context    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Catalog Context

**Responsabilidade:** Gerenciar produtos, categorias e catálogo

**Linguagem Ubíqua:**
- **Product:** Item vendável com SKU, preço e estoque
- **Category:** Agrupamento hierárquico de produtos
- **SKU:** Stock Keeping Unit - identificador único do produto

**Aggregates:**

```typescript
// Product Aggregate
class Product extends AggregateRoot {
  private constructor(
    public readonly id: ProductId,
    private name: string,
    private description: string,
    private price: Money,
    private category: CategoryId,
    private sku: SKU
  ) {
    super();
  }
  
  static create(
    name: string,
    description: string,
    price: Money,
    category: CategoryId,
    sku: SKU
  ): Product {
    const product = new Product(
      ProductId.generate(),
      name,
      description,
      price,
      category,
      sku
    );
    
    product.raise(new ProductCreated(
      product.id,
      name,
      price,
      sku
    ));
    
    return product;
  }
  
  updatePrice(newPrice: Money): void {
    if (newPrice.isNegative()) {
      throw new DomainException('Price cannot be negative');
    }
    
    const oldPrice = this.price;
    this.price = newPrice;
    
    this.raise(new ProductPriceChanged(
      this.id,
      oldPrice,
      newPrice
    ));
  }
}
```

### Order Context

**Responsabilidade:** Gerenciar pedidos e checkout

**Aggregates:**

```typescript
// Order Aggregate
class Order extends AggregateRoot {
  private items: OrderItem[] = [];
  private status: OrderStatus = OrderStatus.PENDING;
  
  static create(customerId: CustomerId): Order {
    const order = new Order(
      OrderId.generate(),
      customerId
    );
    
    order.raise(new OrderCreated(order.id, customerId));
    return order;
  }
  
  addItem(productId: ProductId, quantity: number, price: Money): void {
    // Invariant: Order must be in PENDING status
    this.ensurePending();
    
    // Invariant: Quantity must be positive
    if (quantity <= 0) {
      throw new DomainException('Quantity must be positive');
    }
    
    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
    
    this.raise(new OrderItemAdded(
      this.id,
      productId,
      quantity,
      price
    ));
  }
  
  checkout(): void {
    // Invariant: Order must have items
    if (this.items.length === 0) {
      throw new DomainException('Cannot checkout empty order');
    }
    
    this.status = OrderStatus.CONFIRMED;
    
    this.raise(new OrderConfirmed(
      this.id,
      this.calculateTotal(),
      this.items
    ));
  }
  
  private calculateTotal(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.subtotal()),
      Money.zero()
    );
  }
  
  private ensurePending(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new DomainException('Order is not in pending status');
    }
  }
}
```

### Context Mapping

```
Catalog ←→ Order (Customer/Supplier)
  - Order consome dados de Product (preço, disponibilidade)
  - Anticorruption Layer no Order para traduzir Product

Order → Payment (Published Language)
  - Order publica OrderConfirmed event
  - Payment subscreve e processa pagamento

Payment → Order (Conformist)
  - Payment notifica sucesso/falha
  - Order atualiza status

Order → Shipping (Published Language)
  - Order publica OrderPaid event
  - Shipping cria shipment

Inventory ←→ Order (Shared Kernel)
  - Compartilham conceito de Stock
  - Atualização coordenada
```

---

## Exemplo 2: Sistema Financeiro com CQRS

### Contexto

Sistema bancário com alta carga de leitura (consultas de saldo) e necessidade de auditoria completa.

### Arquitetura CQRS

```
┌─────────────────────────────────────────────────────┐
│                  Command Side (Write)                │
├─────────────────────────────────────────────────────┤
│  CreateAccount → AccountAggregate → AccountCreated  │
│  Deposit       → AccountAggregate → MoneyDeposited  │
│  Withdraw      → AccountAggregate → MoneyWithdrawn  │
│  Transfer      → AccountAggregate → MoneyTransferred│
└─────────────────────────────────────────────────────┘
                        ↓
                  Event Store
                        ↓
┌─────────────────────────────────────────────────────┐
│                  Query Side (Read)                   │
├─────────────────────────────────────────────────────┤
│  GetAccountBalance    → BalanceReadModel            │
│  GetTransactionHistory → TransactionReadModel       │
│  GetAccountStatement  → StatementReadModel          │
└─────────────────────────────────────────────────────┘
```

### Command Side

```typescript
// Commands
interface DepositMoney {
  commandId: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
}

interface WithdrawMoney {
  commandId: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
}

// Command Handlers
class DepositMoneyHandler {
  async handle(command: DepositMoney): Promise<void> {
    // 1. Load aggregate
    const account = await this.repository.findById(command.accountId);
    
    // 2. Execute domain logic
    account.deposit(
      Money.of(command.amount, command.currency),
      command.description
    );
    
    // 3. Save aggregate (persists events)
    await this.repository.save(account);
  }
}

// Aggregate
class Account extends AggregateRoot {
  private balance: Money = Money.zero();
  private transactions: Transaction[] = [];
  
  deposit(amount: Money, description: string): void {
    // Validate
    if (amount.isNegativeOrZero()) {
      throw new DomainException('Amount must be positive');
    }
    
    // Apply event
    this.apply(new MoneyDeposited(
      this.id,
      amount,
      description,
      new Date()
    ));
  }
  
  withdraw(amount: Money, description: string): void {
    // Invariant: Sufficient balance
    if (this.balance.isLessThan(amount)) {
      throw new InsufficientBalanceException();
    }
    
    this.apply(new MoneyWithdrawn(
      this.id,
      amount,
      description,
      new Date()
    ));
  }
  
  // Event handlers (apply state changes)
  private onMoneyDeposited(event: MoneyDeposited): void {
    this.balance = this.balance.add(event.amount);
    this.transactions.push(new Transaction(
      event.amount,
      'DEPOSIT',
      event.description,
      event.occurredAt
    ));
  }
  
  private onMoneyWithdrawn(event: MoneyWithdrawn): void {
    this.balance = this.balance.subtract(event.amount);
    this.transactions.push(new Transaction(
      event.amount,
      'WITHDRAWAL',
      event.description,
      event.occurredAt
    ));
  }
}
```

### Query Side

```typescript
// Read Models (desnormalizados para performance)
interface BalanceReadModel {
  accountId: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
}

interface TransactionReadModel {
  transactionId: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

// Query Handlers
class GetAccountBalanceHandler {
  async handle(query: GetAccountBalance): Promise<BalanceReadModel> {
    // Read from optimized read model
    return await this.balanceRepository.findByAccountId(query.accountId);
  }
}

// Projectors (atualizam read models via eventos)
class BalanceProjector {
  async onMoneyDeposited(event: MoneyDeposited): Promise<void> {
    const current = await this.repository.findByAccountId(event.accountId);
    
    await this.repository.upsert({
      accountId: event.accountId,
      balance: current.balance + event.amount.value,
      currency: event.amount.currency,
      lastUpdated: event.occurredAt
    });
  }
  
  async onMoneyWithdrawn(event: MoneyWithdrawn): Promise<void> {
    const current = await this.repository.findByAccountId(event.accountId);
    
    await this.repository.upsert({
      accountId: event.accountId,
      balance: current.balance - event.amount.value,
      currency: event.amount.currency,
      lastUpdated: event.occurredAt
    });
  }
}
```

---

## Exemplo 3: Event Sourcing para Auditoria

### Contexto

Sistema de compliance que requer auditoria completa de todas as mudanças de estado.

### Event Store Implementation

```typescript
// Event Store
interface DomainEvent {
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  occurredAt: Date;
  userId: string;
  data: any;
}

class PostgresEventStore {
  async appendEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Optimistic locking
      const { rows } = await client.query(
        'SELECT MAX(aggregate_version) as version FROM events WHERE aggregate_id = $1',
        [aggregateId]
      );
      
      const currentVersion = rows[0]?.version || 0;
      
      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyException(
          `Expected version ${expectedVersion}, but current is ${currentVersion}`
        );
      }
      
      // Append events
      for (const event of events) {
        await client.query(
          `INSERT INTO events (
            event_id, event_type, event_version,
            aggregate_id, aggregate_type, aggregate_version,
            occurred_at, user_id, data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            event.eventId,
            event.eventType,
            event.eventVersion,
            event.aggregateId,
            event.aggregateType,
            event.aggregateVersion,
            event.occurredAt,
            event.userId,
            JSON.stringify(event.data)
          ]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const { rows } = await this.pool.query(
      `SELECT * FROM events 
       WHERE aggregate_id = $1 
       ORDER BY aggregate_version ASC`,
      [aggregateId]
    );
    
    return rows.map(row => ({
      eventId: row.event_id,
      eventType: row.event_type,
      eventVersion: row.event_version,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      aggregateVersion: row.aggregate_version,
      occurredAt: row.occurred_at,
      userId: row.user_id,
      data: row.data
    }));
  }
}
```

### Temporal Queries

```typescript
class AuditService {
  // Consultar estado em qualquer ponto do tempo
  async getAggregateAtTime(
    aggregateId: string,
    timestamp: Date
  ): Promise<any> {
    const events = await this.eventStore.getEventsUntil(
      aggregateId,
      timestamp
    );
    
    return this.aggregateFactory.fromEvents(events);
  }
  
  // Gerar relatório de auditoria
  async generateAuditReport(
    aggregateId: string,
    from: Date,
    to: Date
  ): Promise<AuditReport> {
    const events = await this.eventStore.getEventsBetween(
      aggregateId,
      from,
      to
    );
    
    return {
      aggregateId,
      period: { from, to },
      changes: events.map(e => ({
        timestamp: e.occurredAt,
        user: e.userId,
        action: e.eventType,
        details: e.data
      }))
    };
  }
}
```

---

## Exemplo 4: Microservices com API Gateway

### Contexto

Sistema distribuído com múltiplos microservices e API Gateway como ponto de entrada único.

### Arquitetura

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
┌──────▼────────────────────────────────────┐
│         API Gateway (Kong)                │
│  - Authentication                         │
│  - Rate Limiting                          │
│  - Request Routing                        │
│  - Response Aggregation                   │
└──────┬────────────────────────────────────┘
       │
       ├─────────► User Service (Port 3001)
       ├─────────► Order Service (Port 3002)
       ├─────────► Product Service (Port 3003)
       └─────────► Payment Service (Port 3004)
```

### API Gateway Configuration (Kong)

```yaml
services:
  - name: user-service
    url: http://user-service:3001
    routes:
      - name: user-routes
        paths:
          - /api/users
        methods:
          - GET
          - POST
          - PUT
          - DELETE
    plugins:
      - name: jwt
        config:
          claims_to_verify:
            - exp
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: cors
        config:
          origins:
            - "*"
          
  - name: order-service
    url: http://order-service:3002
    routes:
      - name: order-routes
        paths:
          - /api/orders
    plugins:
      - name: jwt
      - name: request-transformer
        config:
          add:
            headers:
              - X-User-Id:$(headers.user_id)
```

### Service Implementation

```typescript
// User Service
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return await this.userService.findById(id);
  }
  
  @Post('/')
  async createUser(@Body() dto: CreateUserDto): Promise<UserDto> {
    return await this.userService.create(dto);
  }
}

// Order Service (com circuit breaker)
export class OrderService {
  private userServiceCircuit = new CircuitBreaker(
    this.callUserService.bind(this),
    {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    }
  );
  
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 1. Validar usuário (com circuit breaker)
    const user = await this.userServiceCircuit.fire(dto.userId);
    
    // 2. Criar ordem
    const order = await this.orderRepository.create({
      userId: dto.userId,
      items: dto.items
    });
    
    // 3. Publicar evento
    await this.eventBus.publish(new OrderCreated(order.id));
    
    return order;
  }
  
  private async callUserService(userId: string): Promise<User> {
    const response = await axios.get(
      `http://user-service:3001/api/users/${userId}`
    );
    return response.data;
  }
}
```

---

## Exemplo 5: Saga Pattern

### Contexto

Transação distribuída para processar pedido (Order → Payment → Inventory → Shipping).

### Orchestration-Based Saga

```typescript
// Saga Orchestrator
class OrderSaga {
  async execute(command: CreateOrderCommand): Promise<void> {
    const sagaId = uuid();
    const compensation: CompensationStep[] = [];
    
    try {
      // Step 1: Create Order
      const orderId = await this.orderService.createOrder(command);
      compensation.push({
        action: () => this.orderService.cancelOrder(orderId),
        description: 'Cancel Order'
      });
      
      // Step 2: Process Payment
      const paymentId = await this.paymentService.processPayment({
        orderId,
        amount: command.totalAmount
      });
      compensation.push({
        action: () => this.paymentService.refund(paymentId),
        description: 'Refund Payment'
      });
      
      // Step 3: Reserve Inventory
      await this.inventoryService.reserve({
        orderId,
        items: command.items
      });
      compensation.push({
        action: () => this.inventoryService.release(orderId),
        description: 'Release Inventory'
      });
      
      // Step 4: Schedule Shipping
      await this.shippingService.schedule({
        orderId,
        address: command.shippingAddress
      });
      
      // Success!
      await this.sagaRepository.markCompleted(sagaId);
      
    } catch (error) {
      // Execute compensations in reverse order
      for (const step of compensation.reverse()) {
        try {
          await step.action();
        } catch (compensationError) {
          // Log but continue with other compensations
          this.logger.error(
            `Compensation failed: ${step.description}`,
            compensationError
          );
        }
      }
      
      await this.sagaRepository.markFailed(sagaId, error);
      throw new SagaFailedException(sagaId, error);
    }
  }
}
```

---

**Total de Exemplos:** 5 cenários production-ready  
**Linhas de Código:** ~400 linhas  
**Última Atualização:** 01/02/2026
