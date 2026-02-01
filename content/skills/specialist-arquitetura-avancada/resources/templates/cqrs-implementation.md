# CQRS Implementation Template

**Bounded Context:** `[CONTEXT_NAME]`  
**Aggregate:** `[AGGREGATE_NAME]`  
**Versão:** 1.0  
**Data:** `[DATE]`

---

## 📋 Visão Geral CQRS

**Command Query Responsibility Segregation (CQRS)** separa operações de leitura (queries) e escrita (commands) em modelos diferentes, permitindo otimização independente de cada lado.

### Quando Usar CQRS

✅ **Use quando:**
- Alta carga de leitura vs escrita (ratio > 10:1)
- Necessita otimizar reads e writes independentemente
- Eventual consistency é aceitável
- Múltiplas representações dos mesmos dados
- Auditoria completa é necessária

❌ **Não use quando:**
- Sistema é simples (CRUD básico)
- Consistência imediata é obrigatória
- Time não tem experiência com eventual consistency
- Overhead de complexidade não se justifica

---

## 🎯 Command Side (Write Model)

### Commands

#### `[CommandName1]`

**Intenção:** `[O que este comando faz]`  
**Trigger:** `[Quando é executado]`  
**Autorização:** `[Quem pode executar]`

**Estrutura:**
```typescript
interface [CommandName1] {
  // Identificação
  commandId: string;
  timestamp: Date;
  userId: string;
  
  // Dados do comando
  [field1]: [type];
  [field2]: [type];
  [field3]: [type];
}
```

**Validações:**
- `[Validação 1: Regra de negócio]`
- `[Validação 2: Regra de negócio]`
- `[Validação 3: Regra de negócio]`

**Handler:**
```typescript
class [CommandName1]Handler {
  async handle(command: [CommandName1]): Promise<void | string> {
    // 1. Validar comando
    this.validate(command);
    
    // 2. Carregar aggregate
    const aggregate = await this.repository.findById(command.aggregateId);
    
    // 3. Executar lógica de domínio
    aggregate.[domainMethod](command.[field1], command.[field2]);
    
    // 4. Persistir aggregate
    await this.repository.save(aggregate);
    
    // 5. Publicar domain events
    await this.eventBus.publishAll(aggregate.uncommittedEvents);
    
    // 6. Retornar ID (opcional)
    return aggregate.id;
  }
  
  private validate(command: [CommandName1]): void {
    // Validações de negócio
  }
}
```

**Domain Events Gerados:**
- `[EventName1]` → `[Quando ocorre]`
- `[EventName2]` → `[Quando ocorre]`

---

#### `[CommandName2]`

**Intenção:** `[O que este comando faz]`  
**Trigger:** `[Quando é executado]`  
**Autorização:** `[Quem pode executar]`

**Estrutura:**
```typescript
interface [CommandName2] {
  commandId: string;
  timestamp: Date;
  userId: string;
  
  [field1]: [type];
  [field2]: [type];
}
```

**Validações:**
- `[Validação 1]`
- `[Validação 2]`

**Handler:**
```typescript
class [CommandName2]Handler {
  async handle(command: [CommandName2]): Promise<void> {
    // Implementação
  }
}
```

---

### Write Model (Domain Model)

```typescript
class [AggregateName] extends AggregateRoot {
  private id: string;
  private [field1]: [type];
  private [field2]: [type];
  private version: number;
  
  // Criação
  static create([params]): [AggregateName] {
    const aggregate = new [AggregateName]();
    aggregate.apply(new [AggregateCreatedEvent]([params]));
    return aggregate;
  }
  
  // Comandos (métodos de domínio)
  [domainMethod1]([params]): void {
    // Validar invariants
    this.ensureInvariant1();
    
    // Aplicar mudança via evento
    this.apply(new [Event1]([params]));
  }
  
  [domainMethod2]([params]): void {
    this.ensureInvariant2();
    this.apply(new [Event2]([params]));
  }
  
  // Event Handlers (aplicam mudanças de estado)
  private on[Event1](event: [Event1]): void {
    this.[field1] = event.[field1];
    this.[field2] = event.[field2];
  }
  
  private on[Event2](event: [Event2]): void {
    this.[field1] = event.[field1];
  }
  
  // Invariants
  private ensureInvariant1(): void {
    if (![condition]) {
      throw new DomainException('[Invariant violation message]');
    }
  }
}
```

---

## 📖 Query Side (Read Model)

### Queries

#### `[QueryName1]`

**Objetivo:** `[O que retorna]`  
**Casos de Uso:** `[Quando é usado]`  
**Autorização:** `[Quem pode consultar]`

**Estrutura:**
```typescript
interface [QueryName1] {
  queryId: string;
  timestamp: Date;
  userId: string;
  
  // Parâmetros de busca
  [param1]: [type];
  [param2]?: [type]; // opcional
}
```

**Handler:**
```typescript
class [QueryName1]Handler {
  async handle(query: [QueryName1]): Promise<[DtoName]> {
    // 1. Validar query
    this.validate(query);
    
    // 2. Buscar no read model (otimizado para leitura)
    const data = await this.readRepository.findBy[Criteria](
      query.[param1],
      query.[param2]
    );
    
    // 3. Mapear para DTO
    return this.mapper.toDto(data);
  }
}
```

**DTO Retornado:**
```typescript
interface [DtoName] {
  id: string;
  [field1]: [type];
  [field2]: [type];
  [field3]: [type];
  
  // Dados desnormalizados (otimizados para leitura)
  [denormalizedField1]: [type];
  [denormalizedField2]: [type];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
```

---

#### `[QueryName2]`

**Objetivo:** `[O que retorna]`  
**Casos de Uso:** `[Quando é usado]`

**Estrutura:**
```typescript
interface [QueryName2] {
  queryId: string;
  userId: string;
  
  // Paginação
  page: number;
  pageSize: number;
  
  // Filtros
  [filter1]?: [type];
  [filter2]?: [type];
  
  // Ordenação
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Handler:**
```typescript
class [QueryName2]Handler {
  async handle(query: [QueryName2]): Promise<PagedResult<[DtoName]>> {
    const data = await this.readRepository.findPaged(query);
    return {
      items: data.items.map(this.mapper.toDto),
      total: data.total,
      page: query.page,
      pageSize: query.pageSize
    };
  }
}
```

---

### Read Model (Projeções)

```typescript
// Projeção otimizada para leitura
interface [ReadModelName] {
  id: string;
  
  // Dados desnormalizados
  [field1]: [type];
  [field2]: [type];
  
  // Agregações pré-calculadas
  [aggregation1]: [type];
  [aggregation2]: [type];
  
  // Joins pré-materializados
  [relatedData1]: [type];
  [relatedData2]: [type];
  
  // Metadata
  lastUpdated: Date;
  version: number;
}
```

**Atualização via Event Handlers:**
```typescript
class [ReadModelName]Projector {
  // Atualiza read model quando eventos ocorrem
  async on[Event1](event: [Event1]): Promise<void> {
    await this.readRepository.upsert({
      id: event.aggregateId,
      [field1]: event.[field1],
      [field2]: event.[field2],
      lastUpdated: event.occurredAt
    });
  }
  
  async on[Event2](event: [Event2]): Promise<void> {
    await this.readRepository.update(event.aggregateId, {
      [field1]: event.[field1],
      lastUpdated: event.occurredAt
    });
  }
}
```

---

## 🔄 Event Handlers

### Domain Event → Read Model Sync

```typescript
class [EventName1]Handler {
  async handle(event: [EventName1]): Promise<void> {
    // 1. Atualizar read model principal
    await this.updatePrimaryReadModel(event);
    
    // 2. Atualizar read models secundários
    await this.updateSecondaryReadModels(event);
    
    // 3. Invalidar caches
    await this.cacheService.invalidate(`[key-pattern]`);
    
    // 4. Notificar outros contextos (se necessário)
    await this.eventBus.publish(new [IntegrationEvent](event));
  }
  
  private async updatePrimaryReadModel(event: [EventName1]): Promise<void> {
    // Lógica de atualização
  }
}
```

---

## 🏗️ Arquitetura CQRS

### Estrutura de Pastas

```
src/[context-name]/
├── commands/
│   ├── [command-name-1].command.ts
│   ├── [command-name-1].handler.ts
│   ├── [command-name-2].command.ts
│   └── [command-name-2].handler.ts
├── queries/
│   ├── [query-name-1].query.ts
│   ├── [query-name-1].handler.ts
│   ├── [query-name-2].query.ts
│   └── [query-name-2].handler.ts
├── domain/
│   ├── [aggregate-name].aggregate.ts
│   ├── [entity-name].entity.ts
│   └── [value-object-name].vo.ts
├── events/
│   ├── [event-name-1].event.ts
│   ├── [event-name-1].handler.ts
│   ├── [event-name-2].event.ts
│   └── [event-name-2].handler.ts
├── read-models/
│   ├── [read-model-name].model.ts
│   ├── [read-model-name].projector.ts
│   └── [dto-name].dto.ts
└── infrastructure/
    ├── repositories/
    │   ├── [aggregate-name].repository.ts (write)
    │   └── [read-model-name].repository.ts (read)
    └── event-store/
        └── event-store.service.ts
```

---

## 📊 Eventual Consistency

### Estratégia de Sincronização

**Write → Read Sync:**
```
Command → Aggregate → Event → Event Handler → Read Model
                                              ↓
                                         Cache Invalidation
```

**Tempo de Consistência:**
- **Target:** < 100ms
- **p95:** < 200ms
- **p99:** < 500ms

### Handling Inconsistencies

```typescript
class ConsistencyChecker {
  async checkConsistency(): Promise<void> {
    // 1. Comparar write model vs read model
    const writeCount = await this.writeRepository.count();
    const readCount = await this.readRepository.count();
    
    if (writeCount !== readCount) {
      // 2. Identificar divergências
      const missing = await this.findMissingInReadModel();
      
      // 3. Reprocessar eventos
      for (const id of missing) {
        await this.replayEvents(id);
      }
    }
  }
}
```

---

## ✅ Checklist de Implementação

### Commands
- [ ] Todos os commands têm validações
- [ ] Handlers retornam void ou ID
- [ ] Domain events são publicados
- [ ] Transações são atômicas
- [ ] Idempotência garantida

### Queries
- [ ] Queries não modificam estado
- [ ] DTOs são imutáveis
- [ ] Paginação implementada
- [ ] Filtros validados
- [ ] Performance otimizada

### Read Models
- [ ] Projeções estão atualizadas
- [ ] Desnormalização aplicada
- [ ] Índices criados
- [ ] Cache configurado
- [ ] Consistency check implementado

### Event Handlers
- [ ] Handlers são idempotentes
- [ ] Retry logic implementado
- [ ] Dead letter queue configurada
- [ ] Monitoring ativo
- [ ] Alertas configurados

---

## 📈 Métricas e Monitoramento

### Métricas de Performance
- **Command Latency:** p95 < 100ms
- **Query Latency:** p95 < 50ms
- **Event Processing:** < 100ms
- **Read Model Lag:** < 200ms

### Métricas de Negócio
- **Commands/sec:** `[threshold]`
- **Queries/sec:** `[threshold]`
- **Read/Write Ratio:** `[expected ratio]`

### Alertas
- 🔴 **Critical:** Read model lag > 1s
- 🟡 **Warning:** Event processing > 500ms
- 🟢 **Info:** Consistency check completed

---

**Última Atualização:** `[DATE]`  
**Próxima Revisão:** `[DATE]`  
**Responsável:** `[TEAM/PERSON]`
