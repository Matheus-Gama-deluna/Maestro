# Event Sourcing Template

**Bounded Context:** `[CONTEXT_NAME]`  
**Aggregate:** `[AGGREGATE_NAME]`  
**Versão:** 1.0  
**Data:** `[DATE]`

---

## 📋 Visão Geral Event Sourcing

**Event Sourcing** persiste o estado da aplicação como uma sequência de eventos ao invés de snapshots do estado atual. Cada mudança de estado é capturada como um evento imutável.

### Quando Usar Event Sourcing

✅ **Use quando:**
- Auditoria completa é obrigatória (compliance, regulação)
- Necessita temporal queries (estado em qualquer ponto do tempo)
- Event replay é valioso (debugging, analytics)
- Domain events são parte central do negócio
- Múltiplas projeções dos mesmos dados

❌ **Não use quando:**
- Sistema é simples (CRUD básico)
- Auditoria não é crítica
- Team não tem experiência com eventual consistency
- Complexidade não se justifica
- Performance de leitura é crítica sem cache

---

## 📨 Event Store Design

### Event Schema

```typescript
interface DomainEvent {
  // Identificação do evento
  eventId: string;              // UUID único do evento
  eventType: string;            // Tipo do evento (ex: "OrderCreated")
  eventVersion: number;         // Versão do schema do evento
  
  // Identificação do aggregate
  aggregateId: string;          // ID do aggregate
  aggregateType: string;        // Tipo do aggregate (ex: "Order")
  aggregateVersion: number;     // Versão do aggregate após este evento
  
  // Metadata
  occurredAt: Date;             // Timestamp do evento
  userId?: string;              // Usuário que causou o evento
  correlationId?: string;       // ID para rastrear fluxo
  causationId?: string;         // ID do comando que causou
  
  // Dados do evento (payload)
  data: {
    [key: string]: any;
  };
}
```

### Event Store Structure

```sql
-- Tabela principal de eventos
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  event_type VARCHAR(255) NOT NULL,
  event_version INT NOT NULL,
  
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_version INT NOT NULL,
  
  occurred_at TIMESTAMP NOT NULL,
  user_id UUID,
  correlation_id UUID,
  causation_id UUID,
  
  data JSONB NOT NULL,
  metadata JSONB,
  
  -- Índices para performance
  INDEX idx_aggregate (aggregate_id, aggregate_version),
  INDEX idx_occurred_at (occurred_at),
  INDEX idx_event_type (event_type)
);

-- Constraint: eventos são append-only
ALTER TABLE events ADD CONSTRAINT events_immutable 
  CHECK (aggregate_version > 0);
```

---

## 🎯 Domain Events

### `[EventName1]`

**Quando Ocorre:** `[Trigger que causa o evento]`  
**Versão Atual:** `1`  
**Publicado Por:** `[Aggregate]`

**Schema v1:**
```typescript
interface [EventName1] extends DomainEvent {
  eventType: '[EventName1]';
  eventVersion: 1;
  
  data: {
    [field1]: [type];
    [field2]: [type];
    [field3]: [type];
  };
}
```

**Exemplo:**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "[EventName1]",
  "eventVersion": 1,
  "aggregateId": "123e4567-e89b-12d3-a456-426614174000",
  "aggregateType": "[AggregateName]",
  "aggregateVersion": 1,
  "occurredAt": "2024-01-15T10:30:00Z",
  "userId": "user-123",
  "data": {
    "[field1]": "[value1]",
    "[field2]": "[value2]"
  }
}
```

**Event Handlers:**
- `[Handler1]` → `[Ação executada]`
- `[Handler2]` → `[Ação executada]`

---

### `[EventName2]`

**Quando Ocorre:** `[Trigger]`  
**Versão Atual:** `1`  
**Publicado Por:** `[Aggregate]`

**Schema v1:**
```typescript
interface [EventName2] extends DomainEvent {
  eventType: '[EventName2]';
  eventVersion: 1;
  
  data: {
    [field1]: [type];
    [field2]: [type];
  };
}
```

---

## 🔄 Event Replay

### Reconstruir Aggregate

```typescript
class [AggregateName] extends AggregateRoot {
  // Reconstruir aggregate a partir de eventos
  static fromEvents(events: DomainEvent[]): [AggregateName] {
    const aggregate = new [AggregateName]();
    
    // Aplicar cada evento em ordem
    for (const event of events) {
      aggregate.applyEvent(event, false); // false = não adicionar a uncommitted
    }
    
    return aggregate;
  }
  
  private applyEvent(event: DomainEvent, isNew: boolean): void {
    // Aplicar evento baseado no tipo
    switch (event.eventType) {
      case '[EventName1]':
        this.on[EventName1](event as [EventName1]);
        break;
      case '[EventName2]':
        this.on[EventName2](event as [EventName2]);
        break;
      default:
        throw new Error(`Unknown event type: ${event.eventType}`);
    }
    
    // Atualizar versão
    this.version = event.aggregateVersion;
    
    // Adicionar a uncommitted se for novo
    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }
}
```

### Repository Implementation

```typescript
class EventSourcedRepository<T extends AggregateRoot> {
  async findById(id: string): Promise<T> {
    // 1. Buscar eventos do aggregate
    const events = await this.eventStore.getEvents(id);
    
    if (events.length === 0) {
      throw new AggregateNotFoundException(id);
    }
    
    // 2. Reconstruir aggregate
    return this.aggregateFactory.fromEvents(events);
  }
  
  async save(aggregate: T): Promise<void> {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    
    if (uncommittedEvents.length === 0) {
      return; // Nada para salvar
    }
    
    // 1. Verificar concorrência (optimistic locking)
    const expectedVersion = aggregate.version - uncommittedEvents.length;
    await this.checkConcurrency(aggregate.id, expectedVersion);
    
    // 2. Persistir eventos
    await this.eventStore.appendEvents(aggregate.id, uncommittedEvents);
    
    // 3. Publicar eventos
    await this.eventBus.publishAll(uncommittedEvents);
    
    // 4. Limpar uncommitted
    aggregate.markEventsAsCommitted();
  }
  
  private async checkConcurrency(id: string, expectedVersion: number): Promise<void> {
    const currentVersion = await this.eventStore.getCurrentVersion(id);
    
    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyException(
        `Expected version ${expectedVersion}, but current is ${currentVersion}`
      );
    }
  }
}
```

---

## 📸 Snapshots Strategy

### Quando Criar Snapshots

**Estratégias:**
- **Every N Events:** Criar snapshot a cada N eventos (ex: 100)
- **Time-Based:** Criar snapshot a cada X tempo (ex: 1 hora)
- **On-Demand:** Criar snapshot manualmente quando necessário
- **Hybrid:** Combinar estratégias

**Recomendação:** Every 100 events

### Snapshot Schema

```typescript
interface Snapshot {
  snapshotId: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;  // Versão do aggregate neste snapshot
  createdAt: Date;
  
  // Estado completo do aggregate
  state: {
    [key: string]: any;
  };
}
```

### Snapshot Storage

```sql
CREATE TABLE snapshots (
  snapshot_id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_version INT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  state JSONB NOT NULL,
  
  -- Índices
  INDEX idx_aggregate_snapshot (aggregate_id, aggregate_version DESC),
  
  -- Constraint: um snapshot por versão
  UNIQUE (aggregate_id, aggregate_version)
);
```

### Snapshot Implementation

```typescript
class SnapshotRepository {
  async createSnapshot(aggregate: AggregateRoot): Promise<void> {
    const snapshot: Snapshot = {
      snapshotId: uuid(),
      aggregateId: aggregate.id,
      aggregateType: aggregate.constructor.name,
      aggregateVersion: aggregate.version,
      createdAt: new Date(),
      state: aggregate.toSnapshot()
    };
    
    await this.storage.save(snapshot);
  }
  
  async getLatestSnapshot(aggregateId: string): Promise<Snapshot | null> {
    return await this.storage.findLatest(aggregateId);
  }
}

class EventSourcedRepository<T extends AggregateRoot> {
  async findById(id: string): Promise<T> {
    // 1. Tentar carregar snapshot
    const snapshot = await this.snapshotRepository.getLatestSnapshot(id);
    
    let aggregate: T;
    let fromVersion = 0;
    
    if (snapshot) {
      // 2a. Reconstruir a partir do snapshot
      aggregate = this.aggregateFactory.fromSnapshot(snapshot);
      fromVersion = snapshot.aggregateVersion;
    } else {
      // 2b. Criar aggregate vazio
      aggregate = this.aggregateFactory.create();
    }
    
    // 3. Buscar eventos após o snapshot
    const events = await this.eventStore.getEventsAfterVersion(id, fromVersion);
    
    // 4. Aplicar eventos restantes
    for (const event of events) {
      aggregate.applyEvent(event, false);
    }
    
    return aggregate;
  }
}
```

---

## 🔄 Event Versioning

### Schema Evolution

**Problema:** Eventos são imutáveis, mas schemas evoluem.

**Solução:** Upcasting - converter eventos antigos para novo schema.

### Versioning Strategy

```typescript
// Evento v1 (original)
interface OrderCreatedV1 extends DomainEvent {
  eventVersion: 1;
  data: {
    customerId: string;
    totalAmount: number;
  };
}

// Evento v2 (adicionado campo)
interface OrderCreatedV2 extends DomainEvent {
  eventVersion: 2;
  data: {
    customerId: string;
    totalAmount: number;
    currency: string;  // NOVO CAMPO
  };
}

// Upcaster
class OrderCreatedUpcaster {
  upcast(event: DomainEvent): DomainEvent {
    if (event.eventVersion === 1) {
      return this.upcastV1ToV2(event as OrderCreatedV1);
    }
    return event;
  }
  
  private upcastV1ToV2(eventV1: OrderCreatedV1): OrderCreatedV2 {
    return {
      ...eventV1,
      eventVersion: 2,
      data: {
        ...eventV1.data,
        currency: 'USD'  // Valor padrão
      }
    };
  }
}
```

### Upcasting Pipeline

```typescript
class EventStore {
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    // 1. Buscar eventos raw
    const rawEvents = await this.storage.findByAggregateId(aggregateId);
    
    // 2. Aplicar upcasting
    const upcastedEvents = rawEvents.map(event => {
      const upcaster = this.upcasterRegistry.get(event.eventType);
      return upcaster ? upcaster.upcast(event) : event;
    });
    
    return upcastedEvents;
  }
}
```

---

## 📊 Temporal Queries

### Query State at Point in Time

```typescript
class TemporalQueryService {
  async getAggregateAtTime(
    aggregateId: string,
    timestamp: Date
  ): Promise<AggregateRoot> {
    // 1. Buscar eventos até o timestamp
    const events = await this.eventStore.getEventsUntil(aggregateId, timestamp);
    
    // 2. Reconstruir aggregate
    return this.aggregateFactory.fromEvents(events);
  }
  
  async getAggregateAtVersion(
    aggregateId: string,
    version: number
  ): Promise<AggregateRoot> {
    // 1. Buscar eventos até a versão
    const events = await this.eventStore.getEventsUntilVersion(aggregateId, version);
    
    // 2. Reconstruir aggregate
    return this.aggregateFactory.fromEvents(events);
  }
}
```

### Event Store Queries

```sql
-- Eventos até timestamp
SELECT * FROM events
WHERE aggregate_id = $1
  AND occurred_at <= $2
ORDER BY aggregate_version ASC;

-- Eventos até versão
SELECT * FROM events
WHERE aggregate_id = $1
  AND aggregate_version <= $2
ORDER BY aggregate_version ASC;

-- Eventos entre versões
SELECT * FROM events
WHERE aggregate_id = $1
  AND aggregate_version > $2
  AND aggregate_version <= $3
ORDER BY aggregate_version ASC;
```

---

## 🏗️ Arquitetura Event Sourcing

### Estrutura de Pastas

```
src/[context-name]/
├── domain/
│   ├── aggregates/
│   │   └── [aggregate-name].aggregate.ts
│   └── events/
│       ├── [event-name-1].event.ts
│       ├── [event-name-2].event.ts
│       └── upcasters/
│           └── [event-name].upcaster.ts
├── infrastructure/
│   ├── event-store/
│   │   ├── event-store.service.ts
│   │   ├── event-store.repository.ts
│   │   └── schemas/
│   │       └── events.sql
│   ├── snapshots/
│   │   ├── snapshot.repository.ts
│   │   └── snapshot.strategy.ts
│   └── repositories/
│       └── [aggregate-name].repository.ts
└── application/
    └── queries/
        └── temporal-query.service.ts
```

---

## ✅ Checklist de Implementação

### Event Store
- [ ] Eventos são append-only (imutáveis)
- [ ] Eventos têm timestamp e version
- [ ] Índices criados para performance
- [ ] Optimistic locking implementado
- [ ] Event bus integrado

### Snapshots
- [ ] Snapshot strategy definida
- [ ] Snapshots são criados automaticamente
- [ ] Snapshots são usados no load
- [ ] Cleanup de snapshots antigos
- [ ] Performance monitorada

### Event Replay
- [ ] Aggregate pode ser reconstruído
- [ ] Estado é consistente após replay
- [ ] Performance é aceitável (< 500ms)
- [ ] Temporal queries funcionam
- [ ] Debugging tools disponíveis

### Versioning
- [ ] Eventos têm schema versionado
- [ ] Upcasters implementados
- [ ] Backward compatibility garantida
- [ ] Migration strategy documentada
- [ ] Testes de compatibilidade

---

## 📈 Métricas e Monitoramento

### Métricas de Performance
- **Event Append:** < 10ms (p95)
- **Event Replay:** < 500ms para 1000 eventos
- **Snapshot Creation:** < 100ms
- **Temporal Query:** < 1s

### Métricas de Negócio
- **Events/sec:** `[threshold]`
- **Aggregate Size:** Média de eventos por aggregate
- **Snapshot Hit Rate:** > 90%

### Alertas
- 🔴 **Critical:** Event store down
- 🟡 **Warning:** Replay time > 1s
- 🟢 **Info:** Snapshot created

---

**Última Atualização:** `[DATE]`  
**Próxima Revisão:** `[DATE]`  
**Responsável:** `[TEAM/PERSON]`
