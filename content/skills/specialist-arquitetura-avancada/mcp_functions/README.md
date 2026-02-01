# MCP Functions Reference - Arquitetura Avançada

**Versão:** 1.0  
**Data:** 01/02/2026  
**MCP Server:** @maestro/mcp-server

Este documento descreve as funções MCP disponíveis para o especialista de Arquitetura Avançada. **Importante:** Estas são apenas referências descritivas. A implementação real está no MCP Server.

---

## 📋 Funções Disponíveis

1. [init_bounded_context](#1-init_bounded_context)
2. [validate_ddd_model](#2-validate_ddd_model)
3. [generate_cqrs_structure](#3-generate_cqrs_structure)
4. [validate_event_sourcing](#4-validate_event_sourcing)

---

## 1. init_bounded_context

### Descrição

Inicializa a estrutura completa de um bounded context seguindo padrões DDD.

### Quando Usar

- Ao identificar um novo bounded context
- Ao iniciar implementação de um contexto
- Ao migrar funcionalidade para novo contexto

### Input Schema

```typescript
interface InitBoundedContextInput {
  contextName: string;              // Nome do contexto (PascalCase)
  responsibility: string;           // Responsabilidade única e clara
  ubiquitousLanguage: {            // Glossário de termos
    [term: string]: string;
  };
  aggregates: string[];            // Lista de aggregates
  domainEvents: string[];          // Lista de domain events
  upstreamContexts?: string[];     // Contextos upstream (dependências)
  downstreamContexts?: string[];   // Contextos downstream (consumidores)
}
```

### Output

```typescript
interface InitBoundedContextOutput {
  success: boolean;
  contextPath: string;              // Caminho criado
  filesCreated: string[];           // Arquivos gerados
  validationScore: number;          // Score de validação (0-100)
  warnings: string[];               // Avisos
}
```

### Exemplo de Uso

```json
{
  "contextName": "Order",
  "responsibility": "Gerenciar pedidos e checkout",
  "ubiquitousLanguage": {
    "Order": "Pedido do cliente",
    "OrderItem": "Item do pedido",
    "Cart": "Carrinho de compras"
  },
  "aggregates": ["Order", "Cart"],
  "domainEvents": ["OrderCreated", "OrderPaid", "OrderCancelled"],
  "upstreamContexts": ["Catalog"],
  "downstreamContexts": ["Payment", "Shipping"]
}
```

### Arquivos Gerados

```
docs/bounded-contexts/order/
├── bounded-context.md           # Documentação do contexto
├── ubiquitous-language.md       # Glossário
├── aggregates/
│   ├── order.md
│   └── cart.md
├── domain-events/
│   ├── order-created.md
│   ├── order-paid.md
│   └── order-cancelled.md
└── integration/
    ├── upstream.md              # Integrações upstream
    └── downstream.md            # Integrações downstream
```

### Validações Automáticas

- ✅ Nome do contexto segue convenção (PascalCase)
- ✅ Responsabilidade é clara e única (< 100 caracteres)
- ✅ Linguagem ubíqua está definida (mínimo 3 termos)
- ✅ Aggregates têm root entity
- ✅ Domain events seguem padrão (PastTense)
- ✅ Não há conflito com contextos existentes

---

## 2. validate_ddd_model

### Descrição

Valida se o modelo de domínio segue princípios DDD corretamente, retornando score e recomendações.

### Quando Usar

- Após criar/atualizar modelo de domínio
- Antes de avançar para implementação
- Durante code review de domínio
- Em quality gates automatizados

### Input Schema

```typescript
interface ValidateDDDModelInput {
  modelPath: string;                // Caminho para modelo de domínio
  boundedContexts: string[];        // Contextos a validar
  validationLevel: 'basic' | 'strict' | 'enterprise';
  checkCohesion?: boolean;          // Validar coesão (default: true)
  checkCoupling?: boolean;          // Validar acoplamento (default: true)
}
```

### Output

```typescript
interface ValidateDDDModelOutput {
  score: number;                    // Score total (0-100)
  status: 'approved' | 'warning' | 'rejected';
  breakdown: {
    strategicDesign: number;        // 40 pontos
    tacticalDesign: number;         // 40 pontos
    qualityAttributes: number;      // 20 pontos
  };
  issues: ValidationIssue[];
  warnings: string[];
  recommendations: string[];
  metrics: {
    cohesion: number;               // 0-100%
    coupling: number;               // 0-100%
    aggregateCount: number;
    eventCount: number;
  };
}

interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  location?: string;
  suggestion?: string;
}
```

### Exemplo de Uso

```json
{
  "modelPath": "docs/04-modelo/modelo-dominio.md",
  "boundedContexts": ["Order", "Payment", "Shipping"],
  "validationLevel": "strict",
  "checkCohesion": true,
  "checkCoupling": true
}
```

### Critérios de Validação

#### Strategic Design (40 pontos)
- Bounded contexts identificados (10 pts)
- Context mapping definido (10 pts)
- Linguagem ubíqua por contexto (10 pts)
- Anticorruption layers onde necessário (10 pts)

#### Tactical Design (40 pontos)
- Aggregates com root entity (10 pts)
- Entities vs Value Objects corretos (10 pts)
- Domain events modelados (10 pts)
- Repositories por aggregate (10 pts)

#### Quality Attributes (20 pontos)
- Coesão interna > 80% (10 pts)
- Acoplamento < 20% (10 pts)

### Thresholds

```typescript
const thresholds = {
  basic: {
    minScore: 60,
    minCohesion: 60,
    maxCoupling: 40
  },
  strict: {
    minScore: 85,
    minCohesion: 80,
    maxCoupling: 20
  },
  enterprise: {
    minScore: 95,
    minCohesion: 90,
    maxCoupling: 10
  }
};
```

---

## 3. generate_cqrs_structure

### Descrição

Gera estrutura completa para implementação CQRS com commands, queries, handlers e read models.

### Quando Usar

- Ao decidir aplicar CQRS em um contexto
- Ao separar read/write models
- Ao implementar eventual consistency

### Input Schema

```typescript
interface GenerateCQRSStructureInput {
  boundedContext: string;
  aggregate: string;
  commands: CommandDefinition[];
  queries: QueryDefinition[];
  events: string[];
  readModels?: ReadModelDefinition[];
  language?: 'typescript' | 'csharp' | 'java';
}

interface CommandDefinition {
  name: string;
  properties: PropertyDefinition[];
  validations?: string[];
}

interface QueryDefinition {
  name: string;
  parameters: PropertyDefinition[];
  returns: string;
  pagination?: boolean;
}

interface PropertyDefinition {
  name: string;
  type: string;
  required: boolean;
  validation?: string;
}
```

### Output

```typescript
interface GenerateCQRSStructureOutput {
  success: boolean;
  filesGenerated: {
    commands: string[];
    queries: string[];
    events: string[];
    readModels: string[];
    handlers: string[];
  };
  validationScore: number;
  warnings: string[];
}
```

### Exemplo de Uso

```json
{
  "boundedContext": "Order",
  "aggregate": "Order",
  "commands": [
    {
      "name": "CreateOrder",
      "properties": [
        { "name": "customerId", "type": "string", "required": true },
        { "name": "items", "type": "OrderItem[]", "required": true }
      ]
    },
    {
      "name": "CancelOrder",
      "properties": [
        { "name": "orderId", "type": "string", "required": true },
        { "name": "reason", "type": "string", "required": true }
      ]
    }
  ],
  "queries": [
    {
      "name": "GetOrderById",
      "parameters": [
        { "name": "orderId", "type": "string", "required": true }
      ],
      "returns": "OrderDto"
    },
    {
      "name": "GetOrdersByCustomer",
      "parameters": [
        { "name": "customerId", "type": "string", "required": true }
      ],
      "returns": "OrderDto[]",
      "pagination": true
    }
  ],
  "events": ["OrderCreated", "OrderCancelled"],
  "language": "typescript"
}
```

### Estrutura Gerada

```
src/order/
├── commands/
│   ├── create-order.command.ts
│   ├── create-order.handler.ts
│   ├── cancel-order.command.ts
│   └── cancel-order.handler.ts
├── queries/
│   ├── get-order-by-id.query.ts
│   ├── get-order-by-id.handler.ts
│   ├── get-orders-by-customer.query.ts
│   └── get-orders-by-customer.handler.ts
├── events/
│   ├── order-created.event.ts
│   ├── order-created.handler.ts
│   ├── order-cancelled.event.ts
│   └── order-cancelled.handler.ts
├── domain/
│   └── order.aggregate.ts
└── read-models/
    └── order.dto.ts
```

---

## 4. validate_event_sourcing

### Descrição

Valida implementação de Event Sourcing, verificando event store, snapshots, replay e versioning.

### Quando Usar

- Após implementar event store
- Antes de deploy em produção
- Durante auditoria de arquitetura
- Em quality gates de Event Sourcing

### Input Schema

```typescript
interface ValidateEventSourcingInput {
  eventStorePath: string;
  aggregates: string[];
  snapshotStrategy?: 'every_n_events' | 'time_based' | 'on_demand';
  snapshotInterval?: number;
  checkPerformance?: boolean;
  checkVersioning?: boolean;
}
```

### Output

```typescript
interface ValidateEventSourcingOutput {
  score: number;                    // Score total (0-100)
  status: 'approved' | 'warning' | 'rejected';
  breakdown: {
    eventStore: number;             // 30 pontos
    snapshots: number;              // 20 pontos
    eventReplay: number;            // 20 pontos
    versioning: number;             // 30 pontos
  };
  metrics: {
    eventCount: number;
    snapshotCount: number;
    oldestEvent: Date;
    newestEvent: Date;
    averageEventsPerAggregate: number;
  };
  performance: {
    replayTimeMs: number;
    eventsPerSecond: number;
    snapshotHitRate: number;
  };
  issues: ValidationIssue[];
  recommendations: string[];
}
```

### Exemplo de Uso

```json
{
  "eventStorePath": "src/infrastructure/event-store",
  "aggregates": ["Order", "Payment"],
  "snapshotStrategy": "every_n_events",
  "snapshotInterval": 100,
  "checkPerformance": true,
  "checkVersioning": true
}
```

### Critérios de Validação

#### Event Store (30 pontos)
- Event store implementado (10 pts)
- Eventos são append-only (10 pts)
- Eventos têm timestamp e version (10 pts)

#### Snapshots (20 pontos)
- Snapshot strategy definida (10 pts)
- Snapshots são criados corretamente (10 pts)

#### Event Replay (20 pontos)
- Event replay funciona (10 pts)
- Estado é reconstruído corretamente (10 pts)

#### Versioning (30 pontos)
- Eventos têm schema versionado (15 pts)
- Upcasting implementado (15 pts)

### Performance Thresholds

```typescript
const performanceThresholds = {
  replayTime: {
    good: 500,      // < 500ms
    warning: 1000,  // < 1s
    critical: 2000  // < 2s
  },
  eventsPerSecond: {
    good: 10000,
    warning: 5000,
    critical: 1000
  },
  snapshotHitRate: {
    good: 90,       // > 90%
    warning: 70,    // > 70%
    critical: 50    // > 50%
  }
};
```

---

## 🔗 Integração com MCP

### Como Chamar Funções

```typescript
// Via MCP Client
import { MCPClient } from '@maestro/mcp-client';

const client = new MCPClient();

// Exemplo: Inicializar Bounded Context
const result = await client.call('init_bounded_context', {
  contextName: 'Order',
  responsibility: 'Gerenciar pedidos',
  ubiquitousLanguage: {
    'Order': 'Pedido do cliente'
  },
  aggregates: ['Order'],
  domainEvents: ['OrderCreated']
});

console.log(result);
```

### Via CLI

```bash
# Inicializar bounded context
mcp call init_bounded_context \
  --context-name "Order" \
  --responsibility "Gerenciar pedidos" \
  --aggregates "Order,Cart" \
  --events "OrderCreated,OrderPaid"

# Validar modelo DDD
mcp call validate_ddd_model \
  --model-path "docs/04-modelo/modelo-dominio.md" \
  --contexts "Order,Payment" \
  --level "strict"

# Gerar estrutura CQRS
mcp call generate_cqrs_structure \
  --context "Order" \
  --aggregate "Order" \
  --commands "CreateOrder,CancelOrder" \
  --queries "GetOrderById"

# Validar Event Sourcing
mcp call validate_event_sourcing \
  --event-store-path "src/infrastructure/event-store" \
  --aggregates "Order,Payment" \
  --check-performance true
```

---

## 📊 Quality Gates Integration

### Configuração Automática

```json
{
  "mcp": {
    "architecture": {
      "auto_validate": true,
      "validation_level": "strict",
      "quality_gates": {
        "ddd_model": 85,
        "cqrs_structure": 90,
        "event_sourcing": 80
      },
      "fail_on_warning": false,
      "generate_report": true
    }
  }
}
```

### Uso em CI/CD

```yaml
# .github/workflows/architecture-validation.yml
name: Architecture Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Validate DDD Model
        run: |
          mcp call validate_ddd_model \
            --model-path "docs/04-modelo/modelo-dominio.md" \
            --level "strict" \
            --fail-on-score-below 85
      
      - name: Validate Event Sourcing
        run: |
          mcp call validate_event_sourcing \
            --event-store-path "src/infrastructure/event-store" \
            --check-performance true \
            --fail-on-score-below 80
```

---

**Nota:** Todas as funções descritas são **referências** para o MCP Server. A implementação real está em `@maestro/mcp-server/functions/architecture/`.

**Última Atualização:** 01/02/2026
