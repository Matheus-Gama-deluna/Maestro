# Bounded Context Template

**Bounded Context:** `[CONTEXT_NAME]`  
**Responsável:** `[TEAM_NAME]`  
**Versão:** 1.0  
**Data:** `[DATE]`

---

## 📋 Responsabilidade

### Descrição
`[Descrição clara e concisa do que este bounded context gerencia. Deve ser uma única responsabilidade bem definida.]`

### Escopo
**Inclui:**
- `[Funcionalidade 1]`
- `[Funcionalidade 2]`
- `[Funcionalidade 3]`

**Não Inclui:**
- `[Funcionalidade fora do escopo 1]`
- `[Funcionalidade fora do escopo 2]`

---

## 🗣️ Linguagem Ubíqua

### Termos do Domínio

| Termo | Definição | Sinônimos | Evitar |
|-------|-----------|-----------|--------|
| `[Termo 1]` | `[Definição precisa]` | `[Sinônimos aceitos]` | `[Termos ambíguos]` |
| `[Termo 2]` | `[Definição precisa]` | `[Sinônimos aceitos]` | `[Termos ambíguos]` |
| `[Termo 3]` | `[Definição precisa]` | `[Sinônimos aceitos]` | `[Termos ambíguos]` |

### Glossário Completo

#### `[Termo Principal 1]`
**Definição:** `[Definição detalhada]`  
**Contexto:** `[Quando e como é usado]`  
**Exemplo:** `[Exemplo de uso]`  
**Relacionamentos:** `[Relação com outros termos]`

#### `[Termo Principal 2]`
**Definição:** `[Definição detalhada]`  
**Contexto:** `[Quando e como é usado]`  
**Exemplo:** `[Exemplo de uso]`  
**Relacionamentos:** `[Relação com outros termos]`

---

## 🎯 Aggregates

### `[Aggregate Name 1]`

#### Root Entity
**Nome:** `[EntityName]`  
**Identificador:** `[ID type e formato]`  
**Ciclo de Vida:** `[Criação → Estados → Finalização]`

#### Invariants (Regras de Negócio)
1. `[Invariant 1: Regra que SEMPRE deve ser verdadeira]`
2. `[Invariant 2: Regra que SEMPRE deve ser verdadeira]`
3. `[Invariant 3: Regra que SEMPRE deve ser verdadeira]`

#### Entities
- **`[Entity 1]`:** `[Descrição]`
- **`[Entity 2]`:** `[Descrição]`

#### Value Objects
- **`[ValueObject 1]`:** `[Descrição e validações]`
- **`[ValueObject 2]`:** `[Descrição e validações]`

#### Comportamentos (Methods)
```typescript
class [AggregateName] {
  // Criação
  static create([params]): [AggregateName]
  
  // Comandos
  [command1]([params]): void
  [command2]([params]): void
  
  // Queries
  [query1](): [ReturnType]
  [query2](): [ReturnType]
  
  // Domain Events
  private raise[EventName](): void
}
```

---

### `[Aggregate Name 2]`

#### Root Entity
**Nome:** `[EntityName]`  
**Identificador:** `[ID type e formato]`  
**Ciclo de Vida:** `[Criação → Estados → Finalização]`

#### Invariants (Regras de Negócio)
1. `[Invariant 1]`
2. `[Invariant 2]`

#### Entities
- **`[Entity 1]`:** `[Descrição]`

#### Value Objects
- **`[ValueObject 1]`:** `[Descrição]`

---

## 📨 Domain Events

### `[EventName1]`

**Quando Ocorre:** `[Trigger que causa o evento]`  
**Publicado Por:** `[Aggregate que publica]`  
**Consumido Por:** `[Quem processa este evento]`

**Estrutura do Evento:**
```typescript
interface [EventName1] {
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  version: number;
  
  // Dados do evento
  [field1]: [type];
  [field2]: [type];
  [field3]: [type];
}
```

**Handlers:**
- `[Handler 1]` → `[Ação executada]`
- `[Handler 2]` → `[Ação executada]`

---

### `[EventName2]`

**Quando Ocorre:** `[Trigger]`  
**Publicado Por:** `[Aggregate]`  
**Consumido Por:** `[Handlers]`

**Estrutura do Evento:**
```typescript
interface [EventName2] {
  eventId: string;
  aggregateId: string;
  occurredAt: Date;
  version: number;
  
  [field1]: [type];
  [field2]: [type];
}
```

---

## 🔗 Integrações

### Upstream Contexts (Dependências)

#### `[Context Name 1]`
**Tipo de Relação:** `[Customer/Supplier, Conformist, Anticorruption Layer]`  
**Dados Consumidos:** `[Quais dados/eventos]`  
**Frequência:** `[Real-time, Batch, On-demand]`  
**Contrato:** `[Link para API/Event schema]`

**Anticorruption Layer:**
```
[Context Name 1] → ACL → [Current Context]
- Traduz [External Model] para [Internal Model]
- Valida [External Data]
- Mapeia [External Events] para [Internal Events]
```

---

### Downstream Contexts (Consumidores)

#### `[Context Name 2]`
**Tipo de Relação:** `[Customer/Supplier, Published Language, Open Host Service]`  
**Dados Publicados:** `[Quais dados/eventos]`  
**Frequência:** `[Real-time, Batch, On-demand]`  
**Contrato:** `[Link para API/Event schema]`

**Published Language:**
```
[Current Context] → API/Events → [Context Name 2]
- Publica [Event 1]
- Publica [Event 2]
- Expõe [API Endpoint 1]
- Expõe [API Endpoint 2]
```

---

### Shared Kernel (se aplicável)

**Compartilhado com:** `[Context Name]`  
**Componentes Compartilhados:**
- `[Shared Model 1]`
- `[Shared Model 2]`
- `[Shared Library]`

**Governança:**
- Mudanças requerem aprovação de ambos os times
- Versionamento semântico obrigatório
- Testes de integração compartilhados

---

## 🏗️ Arquitetura Interna

### Camadas

```
┌─────────────────────────────────────┐
│   Application Layer                 │
│   - Application Services            │
│   - Command Handlers                │
│   - Query Handlers                  │
│   - DTOs                            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Domain Layer                      │
│   - Aggregates                      │
│   - Entities                        │
│   - Value Objects                   │
│   - Domain Events                   │
│   - Domain Services                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│   - Repositories                    │
│   - Event Store                     │
│   - External Services               │
│   - Messaging                       │
└─────────────────────────────────────┘
```

### Estrutura de Pastas

```
src/[context-name]/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── services/
│   └── dtos/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── services/
└── infrastructure/
    ├── repositories/
    ├── event-store/
    └── external/
```

---

## 📊 Métricas e Monitoramento

### Métricas de Negócio
- `[Métrica 1]`: `[Descrição e threshold]`
- `[Métrica 2]`: `[Descrição e threshold]`
- `[Métrica 3]`: `[Descrição e threshold]`

### Métricas Técnicas
- **Throughput:** `[X] eventos/segundo`
- **Latência:** `p95 < [X]ms`
- **Error Rate:** `< [X]%`
- **Consistency:** `< [X]ms eventual`

### Alertas
- 🔴 **Critical:** `[Condição crítica]`
- 🟡 **Warning:** `[Condição de aviso]`
- 🟢 **Info:** `[Condição informativa]`

---

## ✅ Checklist de Validação

### Strategic Design
- [ ] Responsabilidade única e clara
- [ ] Linguagem ubíqua definida
- [ ] Boundaries bem definidos
- [ ] Integrações mapeadas
- [ ] Anticorruption layers onde necessário

### Tactical Design
- [ ] Aggregates identificados
- [ ] Root entities definidas
- [ ] Invariants documentados
- [ ] Domain events modelados
- [ ] Value objects validados

### Implementação
- [ ] Estrutura de pastas seguindo padrão
- [ ] Repositories por aggregate
- [ ] Event handlers implementados
- [ ] Testes de domínio completos
- [ ] Documentação atualizada

---

## 📚 Referências

### Documentação
- **Context Map:** `[Link para context map geral]`
- **API Contract:** `[Link para OpenAPI/AsyncAPI]`
- **Event Catalog:** `[Link para catálogo de eventos]`

### Decisões Arquiteturais
- **ADR-001:** `[Decisão importante 1]`
- **ADR-002:** `[Decisão importante 2]`

---

**Última Atualização:** `[DATE]`  
**Próxima Revisão:** `[DATE]`  
**Responsável:** `[TEAM/PERSON]`
