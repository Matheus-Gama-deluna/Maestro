---
name: specialist-arquitetura-avancada
description: DDD, CQRS, event sourcing e microservices para sistemas enterprise.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Arquitetura Avançada · Skill do Especialista

## Missão
Endereçar cenários complexos com padrões avançados e governança, aplicando DDD, CQRS, event sourcing e microservices para sistemas enterprise.

## Quando ativar
- Fase: Especialista Avançado
- Workflows recomendados: /maestro, /refatorar-codigo
- Use quando o projeto exige arquitetura enterprise ou alta complexidade.

## Inputs obrigatórios
- Arquitetura base (`docs/06-arquitetura/arquitetura.md`)
- Requisitos complexos
- Mapeamento de domínios
- Modelo de domínio (`docs/04-modelo/modelo-dominio.md`)
- CONTEXTO.md do projeto

## Outputs gerados
- Blueprint avançado
- Planos para DDD/CQRS/event sourcing
- Estratégia de microserviços
- Padrões de comunicação
- Governança arquitetural

## Quality Gate
- DDD aplicado corretamente
- Eventos e fluxos modelados
- Estratégia de microserviços definida
- Bounded contexts identificados
- Padrões de comunicação definidos

## Domain-Driven Design (DDD)

### Bounded Contexts
```text
Identifique e defina:
- Contextos delimitados claros
- Relações entre contextos (Shared Kernel, Customer/Supplier, etc.)
- Linguagem ubíqua por contexto
- Anticorruption layers onde necessário
```

### Strategic Design
- **Context Mapping:** Mapeamento de relacionamentos
- **Ubiquitous Language:** Linguagem compartilhada
- **Bounded Contexts:** Fronteiras claras
- **Aggregates:** Raízes de consistência
- **Domain Events:** Eventos de domínio

## CQRS e Event Sourcing

### CQRS (Command Query Responsibility Segregation)
```text
Separe responsabilidades:
- Commands: Write operations
- Queries: Read operations
- Different models for read/write
- Eventual consistency aceitável
```

### Event Sourcing
```text
Implemente:
- Event store para persistência
- Snapshots para performance
- Event replay para debugging
- Versioning de eventos
```

## Microservices Architecture

### Service Boundaries
- **Single Responsibility:** Um serviço por bounded context
- **Loose Coupling:** Comunicação via APIs/events
- **High Cohesion:** Lógica coesa dentro do serviço
- **Autonomous:** Deployable independentemente

### Communication Patterns
- **Synchronous:** REST/GraphQL APIs
- **Asynchronous:** Message queues (Kafka, RabbitMQ)
- **Event-Driven:** Domain events
- **API Gateway:** Single entry point

## Processo de Arquitetura Avançada

### 1. Análise de Domínio
```text
Com base no modelo de domínio:
[COLE MODELO DE DOMÍNIO]

Identifique:
- Bounded contexts naturais
- Relações entre contextos
- Complexidade ciclomática
- Pontos de integração críticos
```

### 2. Design Estratégico
```text
Defina:
- Context mapping completo
- Padrões de integração
- Anticorruption layers
- Shared kernels onde aplicável
```

### 3. Implementação Tática
```text
Para cada bounded context:
- Aggregates e entities
- Domain events
- Application services
- Infrastructure concerns
```

### 4. Comunicação e Governança
```text
Estabeleça:
- Padrões de comunicação
- Contratos de API
- Event schemas
- Monitoring e observabilidade
```

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** misture bounded contexts
- **NUNCA** ignore consistência eventual
- **NUNCA** crie microservices sem boundaries claras
- **NUNCA** pula domain events

### SEMPRE Faça
- **SEMPRE** defina bounded contexts primeiro
- **SEMPRE** use linguagem ubíqua
- **SEMPRE** implemente anticorruption layers
- **SEMPRE** version eventos e APIs

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Arquitetura base existente
2. Modelo de domínio completo
3. Requisitos complexos
4. CONTEXTO.md com restrições
5. Mapeamento de domínios

### Prompt de Continuação
```
Atue como Arquiteto de Software Sênior Especialista.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Arquitetura base:
[COLE docs/06-arquitetura/arquitetura.md]

Modelo de domínio:
[COLE docs/04-modelo/modelo-dominio.md]

Preciso aplicar padrões avançados (DDD, CQRS, Event Sourcing) para este sistema complexo.
```

### Ao Concluir Esta Fase
1. **Defina** bounded contexts
2. **Projete** CQRS onde aplicável
3. **Implemente** event sourcing
4. **Estabeleça** comunicação entre serviços
5. **Documente** governança
6. **Valide** arquitetura

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Bounded Contexts:** > 80% coesão
- **Domain Events:** 100% versionados
- **API Contracts:** 100% documentados
- **Service Autonomy:** > 90% independente
- **Event Consistency:** < 100ms eventual

### Metas de Excelência
- Domain Model Purity: ≥ 95%
- Service Coupling: ≤ 20%
- Event Throughput: > 1000 events/sec
- API Latency: < 100ms (p95)

## Templates Prontos

### Bounded Context Template
```markdown
# [Context Name] Bounded Context

## Responsabilidade
[Descrição clara do que este contexto gerencia]

## Linguagem Ubíqua
- **[Termo 1]:** [Definição]
- **[Termo 2]:** [Definição]
- **[Termo 3]:** [Definição]

## Aggregates
### [Aggregate Name]
- **Root Entity:** [Entity]
- **Invariants:** [Regras de negócio]
- **Events:** [Domain events]

## Domain Events
### [Event Name]
- **When:** [Quando ocorre]
- **Data:** [Estrutura do evento]
- **Handler:** [Quem processa]

## Integration
- **Upstream:** [Contextos que consome]
- **Downstream:** [Contextos que publica]
- **Anticorruption:** [Layers necessários]
```

### CQRS Implementation
```typescript
// Command Side
interface CreateUserCommand {
  name: string;
  email: string;
}

class CreateUserHandler {
  async handle(command: CreateUserCommand): Promise<void> {
    const user = User.create(command.name, command.email);
    await this.repository.save(user);
    
    // Emit domain event
    user.commit();
  }
}

// Query Side
interface UserDto {
  id: string;
  name: string;
  email: string;
}

class UserQueryService {
  async getUser(id: string): Promise<UserDto> {
    return this.readModel.findById(id);
  }
}
```

### Event Sourcing Store
```typescript
interface Event {
  id: string;
  aggregateId: string;
  type: string;
  data: any;
  version: number;
  timestamp: Date;
}

class EventStore {
  async saveEvents(aggregateId: string, events: Event[]): Promise<void> {
    // Persist events
  }
  
  async getEvents(aggregateId: string): Promise<Event[]> {
    // Load and return events
  }
}
```

## Skills complementares
- `architecture`
- `database-design`
- `api-patterns`
- `intelligent-routing`
- `app-builder`
- `domain-modeling`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Arquitetura Avançada.md`
- **Artefatos alvo:**
  - Blueprint avançado
  - Planos para DDD/CQRS/event sourcing
  - Estratégia de microserviços
  - Padrões de comunicação
  - Governança arquitetural