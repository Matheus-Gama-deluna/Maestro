# Architecture Validation Checklist

**Versão:** 1.0  
**Data:** 01/02/2026  
**Score Mínimo:** 85/100 pontos

Este checklist contém 100 pontos de validação para garantir qualidade em arquiteturas avançadas.

---

## 📊 Resumo de Pontuação

| Categoria | Pontos | Peso |
|-----------|--------|------|
| **Strategic Design (DDD)** | 25 | 25% |
| **Tactical Design (DDD)** | 20 | 20% |
| **CQRS Implementation** | 15 | 15% |
| **Event Sourcing** | 15 | 15% |
| **Microservices** | 15 | 15% |
| **Quality Attributes** | 10 | 10% |
| **TOTAL** | **100** | **100%** |

---

## 1. Strategic Design (DDD) - 25 pontos

### 1.1 Bounded Contexts (10 pontos)

- [ ] **[2pts]** Bounded contexts identificados e documentados
- [ ] **[2pts]** Cada contexto tem responsabilidade única e clara
- [ ] **[2pts]** Boundaries são respeitados (sem vazamento de conceitos)
- [ ] **[2pts]** Context mapping completo e atualizado
- [ ] **[2pts]** Relações entre contextos são explícitas (Customer/Supplier, etc)

### 1.2 Linguagem Ubíqua (5 pontos)

- [ ] **[1pt]** Glossário de termos por bounded context
- [ ] **[1pt]** Termos são consistentes no código e documentação
- [ ] **[1pt]** Ambiguidades eliminadas
- [ ] **[1pt]** Time usa mesma linguagem que domínio
- [ ] **[1pt]** Termos técnicos separados de termos de negócio

### 1.3 Context Integration (5 pontos)

- [ ] **[2pts]** Anticorruption layers onde necessário
- [ ] **[1pt]** Shared kernels documentados e justificados
- [ ] **[1pt]** Published languages definidos
- [ ] **[1pt]** Open host services implementados corretamente

### 1.4 Strategic Patterns (5 pontos)

- [ ] **[1pt]** Core domain identificado
- [ ] **[1pt]** Supporting subdomains mapeados
- [ ] **[1pt]** Generic subdomains identificados
- [ ] **[1pt]** Priorização de investimento por subdomain
- [ ] **[1pt]** Evolution strategy documentada

---

## 2. Tactical Design (DDD) - 20 pontos

### 2.1 Aggregates (8 pontos)

- [ ] **[2pts]** Aggregates identificados corretamente
- [ ] **[2pts]** Cada aggregate tem root entity clara
- [ ] **[2pts]** Invariants documentados e enforçados
- [ ] **[2pts]** Tamanho de aggregates é adequado (não muito grande)

### 2.2 Entities vs Value Objects (4 pontos)

- [ ] **[1pt]** Entities têm identidade única
- [ ] **[1pt]** Value objects são imutáveis
- [ ] **[1pt]** Distinção clara entre entities e VOs
- [ ] **[1pt]** Value objects implementam equality corretamente

### 2.3 Domain Events (4 pontos)

- [ ] **[1pt]** Domain events modelados para mudanças importantes
- [ ] **[1pt]** Eventos são imutáveis
- [ ] **[1pt]** Eventos seguem naming convention (past tense)
- [ ] **[1pt]** Eventos contêm dados suficientes para handlers

### 2.4 Repositories (4 pontos)

- [ ] **[1pt]** Repository por aggregate root
- [ ] **[1pt]** Repositories abstraem persistência
- [ ] **[1pt]** Queries complexas em repositories
- [ ] **[1pt]** Unit of Work implementado onde necessário

---

## 3. CQRS Implementation - 15 pontos

### 3.1 Command Side (6 pontos)

- [ ] **[1pt]** Commands são DTOs imutáveis
- [ ] **[1pt]** Command handlers retornam void ou ID
- [ ] **[1pt]** Validações de negócio no aggregate
- [ ] **[1pt]** Transações são atômicas
- [ ] **[1pt]** Idempotência garantida
- [ ] **[1pt]** Commands geram domain events

### 3.2 Query Side (5 pontos)

- [ ] **[1pt]** Queries não modificam estado
- [ ] **[1pt]** DTOs são imutáveis
- [ ] **[1pt]** Read models desnormalizados
- [ ] **[1pt]** Índices otimizados para queries
- [ ] **[1pt]** Paginação implementada

### 3.3 Synchronization (4 pontos)

- [ ] **[1pt]** Event handlers atualizam read models
- [ ] **[1pt]** Eventual consistency < 100ms (p95)
- [ ] **[1pt]** Retry logic implementado
- [ ] **[1pt]** Dead letter queue configurada

---

## 4. Event Sourcing - 15 pontos

### 4.1 Event Store (5 pontos)

- [ ] **[1pt]** Event store implementado (append-only)
- [ ] **[1pt]** Eventos têm timestamp e version
- [ ] **[1pt]** Optimistic locking implementado
- [ ] **[1pt]** Índices criados para performance
- [ ] **[1pt]** Event bus integrado

### 4.2 Snapshots (4 pontos)

- [ ] **[1pt]** Snapshot strategy definida
- [ ] **[1pt]** Snapshots criados automaticamente
- [ ] **[1pt]** Snapshots usados no load
- [ ] **[1pt]** Cleanup de snapshots antigos

### 4.3 Event Replay (3 pontos)

- [ ] **[1pt]** Aggregate pode ser reconstruído
- [ ] **[1pt]** Estado é consistente após replay
- [ ] **[1pt]** Performance aceitável (< 500ms)

### 4.4 Versioning (3 pontos)

- [ ] **[1pt]** Eventos têm schema versionado
- [ ] **[1pt]** Upcasters implementados
- [ ] **[1pt]** Backward compatibility garantida

---

## 5. Microservices - 15 pontos

### 5.1 Service Boundaries (4 pontos)

- [ ] **[1pt]** Um serviço por bounded context
- [ ] **[1pt]** Single responsibility por serviço
- [ ] **[1pt]** Loose coupling entre serviços
- [ ] **[1pt]** High cohesion dentro do serviço

### 5.2 Communication (4 pontos)

- [ ] **[1pt]** API contracts documentados (OpenAPI/AsyncAPI)
- [ ] **[1pt]** Versionamento de APIs implementado
- [ ] **[1pt]** Circuit breakers implementados
- [ ] **[1pt]** Retry logic com exponential backoff

### 5.3 Data Management (4 pontos)

- [ ] **[1pt]** Database per service
- [ ] **[1pt]** Saga pattern para transações distribuídas
- [ ] **[1pt]** Eventual consistency aceita
- [ ] **[1pt]** No shared databases

### 5.4 Deployment (3 pontos)

- [ ] **[1pt]** Independent deployment por serviço
- [ ] **[1pt]** Health checks implementados
- [ ] **[1pt]** Auto-scaling configurado

---

## 6. Quality Attributes - 10 pontos

### 6.1 Performance (3 pontos)

- [ ] **[1pt]** Latência p95 < 100ms
- [ ] **[1pt]** Throughput > 1000 RPS
- [ ] **[1pt]** Resource utilization < 80%

### 6.2 Scalability (2 pontos)

- [ ] **[1pt]** Horizontal scaling implementado
- [ ] **[1pt]** Load balancing configurado

### 6.3 Resilience (3 pontos)

- [ ] **[1pt]** Circuit breakers em chamadas externas
- [ ] **[1pt]** Bulkhead pattern implementado
- [ ] **[1pt]** Graceful degradation

### 6.4 Observability (2 pontos)

- [ ] **[1pt]** Distributed tracing implementado
- [ ] **[1pt]** Metrics e logs centralizados

---

## 📋 Checklist Rápido por Padrão

### DDD Checklist

```
Strategic Design:
✓ Bounded contexts identificados
✓ Context mapping completo
✓ Linguagem ubíqua definida
✓ Anticorruption layers

Tactical Design:
✓ Aggregates com root entities
✓ Invariants enforçados
✓ Domain events modelados
✓ Repositories por aggregate
```

### CQRS Checklist

```
Command Side:
✓ Commands imutáveis
✓ Handlers retornam void/ID
✓ Domain events publicados
✓ Transações atômicas

Query Side:
✓ Queries não modificam estado
✓ DTOs imutáveis
✓ Read models desnormalizados
✓ Índices otimizados

Sync:
✓ Event handlers implementados
✓ Eventual consistency < 100ms
✓ Retry logic
✓ DLQ configurada
```

### Event Sourcing Checklist

```
Event Store:
✓ Append-only
✓ Eventos versionados
✓ Optimistic locking
✓ Performance adequada

Snapshots:
✓ Strategy definida
✓ Criação automática
✓ Usado no load
✓ Cleanup implementado

Replay:
✓ Aggregate reconstruível
✓ Estado consistente
✓ Performance < 500ms

Versioning:
✓ Schema versionado
✓ Upcasters
✓ Backward compatibility
```

### Microservices Checklist

```
Boundaries:
✓ Um serviço por context
✓ Single responsibility
✓ Loose coupling
✓ High cohesion

Communication:
✓ API contracts
✓ Versionamento
✓ Circuit breakers
✓ Retry logic

Data:
✓ Database per service
✓ Saga pattern
✓ Eventual consistency
✓ No shared DB

Deployment:
✓ Independent deployment
✓ Health checks
✓ Auto-scaling
```

---

## 🎯 Cálculo de Score

### Fórmula

```
Score Total = Σ (Pontos Obtidos por Categoria)

Aprovação:
- Score >= 85: ✅ Aprovado
- Score 70-84: ⚠️ Aprovado com ressalvas
- Score < 70: ❌ Reprovado
```

### Exemplo de Cálculo

```
Strategic Design: 22/25 (88%)
Tactical Design: 18/20 (90%)
CQRS: 13/15 (87%)
Event Sourcing: 12/15 (80%)
Microservices: 14/15 (93%)
Quality Attributes: 8/10 (80%)

Total: 87/100 ✅ APROVADO
```

---

## 📊 Relatório de Validação

### Template

```markdown
# Architecture Validation Report

**Project:** [Nome do Projeto]
**Date:** [Data]
**Validator:** [Nome]

## Score Summary

| Category | Score | Status |
|----------|-------|--------|
| Strategic Design | XX/25 | ✅/⚠️/❌ |
| Tactical Design | XX/20 | ✅/⚠️/❌ |
| CQRS | XX/15 | ✅/⚠️/❌ |
| Event Sourcing | XX/15 | ✅/⚠️/❌ |
| Microservices | XX/15 | ✅/⚠️/❌ |
| Quality Attributes | XX/10 | ✅/⚠️/❌ |
| **TOTAL** | **XX/100** | **✅/⚠️/❌** |

## Issues Found

### Critical (Blocker)
- [Issue 1]
- [Issue 2]

### Warning (Should Fix)
- [Issue 1]
- [Issue 2]

### Info (Nice to Have)
- [Item 1]
- [Item 2]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

## Next Steps

- [ ] Fix critical issues
- [ ] Address warnings
- [ ] Re-validate
```

---

**Total de Pontos:** 100  
**Threshold Aprovação:** 85  
**Última Atualização:** 01/02/2026
