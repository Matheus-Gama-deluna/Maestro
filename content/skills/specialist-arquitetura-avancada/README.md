# Arquitetura Avançada - Especialista Maestro

**Versão:** 2.0 (Modern Skills)  
**Tipo:** Especialista Avançado  
**Fase:** 4 - Especialistas Avançados  
**Complexidade:** Alta (Projetos Enterprise)

---

## 🎯 Visão Geral

O especialista em **Arquitetura Avançada** é responsável por aplicar padrões arquiteturais sofisticados como **Domain-Driven Design (DDD)**, **CQRS**, **Event Sourcing** e **Microservices** em sistemas enterprise complexos.

### Quando Usar

✅ **Use este especialista quando:**
- Projeto tem múltiplos bounded contexts
- Necessita separação de responsabilidades (CQRS)
- Requer auditoria completa (Event Sourcing)
- Sistema distribuído com microservices
- Complexidade de domínio alta
- Escalabilidade horizontal necessária

❌ **Não use quando:**
- Projeto é simples (POC, MVP básico)
- Monolito modular é suficiente
- Time não tem experiência com DDD
- Overhead de complexidade não se justifica

---

## 📥 Inputs Obrigatórios

Para utilizar este especialista, você precisa ter:

1. **Arquitetura Base** (`docs/06-arquitetura/arquitetura.md`)
   - Arquitetura atual do sistema
   - Stack tecnológico definido
   - Decisões arquiteturais anteriores

2. **Modelo de Domínio** (`docs/04-modelo/modelo-dominio.md`)
   - Entidades e relacionamentos
   - Regras de negócio
   - Casos de uso mapeados

3. **Requisitos Complexos**
   - Requisitos funcionais avançados
   - Requisitos não-funcionais (escalabilidade, consistência)
   - Cenários de integração

4. **CONTEXTO.md do Projeto**
   - Restrições técnicas
   - Decisões de negócio
   - Limitações conhecidas

---

## 📤 Outputs Gerados

Este especialista produz os seguintes artefatos:

### 1. Blueprint Avançado
Documento completo da arquitetura avançada com:
- Bounded contexts identificados
- Context mapping
- Relações entre contextos
- Anticorruption layers

### 2. Planos DDD/CQRS/Event Sourcing
Estratégias detalhadas para:
- Implementação de DDD tático e estratégico
- Separação CQRS (Command/Query)
- Event store e event sourcing
- Versionamento de eventos

### 3. Estratégia de Microservices
Definição completa de:
- Service boundaries
- Communication patterns
- API Gateway strategy
- Service mesh configuration

### 4. Padrões de Comunicação
Especificação de:
- Comunicação síncrona (REST, GraphQL)
- Comunicação assíncrona (Message queues)
- Event-driven architecture
- Saga patterns

### 5. Governança Arquitetural
Framework de governança com:
- ADRs (Architecture Decision Records)
- Fitness functions
- Quality attributes
- Monitoring e observabilidade

---

## ✅ Quality Gates

Para avançar desta fase, os seguintes critérios devem ser atendidos:

| Critério | Threshold | Como Validar |
|----------|-----------|--------------|
| **Bounded Contexts Definidos** | 100% | Todos os contextos mapeados com responsabilidades claras |
| **Coesão de Contextos** | ≥ 80% | Métricas de coesão interna |
| **Domain Events Versionados** | 100% | Todos os eventos têm schema versionado |
| **API Contracts Documentados** | 100% | OpenAPI/AsyncAPI completos |
| **Service Autonomy** | ≥ 90% | Serviços podem ser deployados independentemente |
| **Event Consistency** | < 100ms | Eventual consistency dentro do SLA |

**Score Mínimo para Aprovação:** 85 pontos (de 100)

---

## 📚 Templates Disponíveis

Este especialista fornece os seguintes templates estruturados:

### 1. Bounded Context (`bounded-context.md`)
Template para definir bounded contexts com:
- Responsabilidade do contexto
- Linguagem ubíqua
- Aggregates e entities
- Domain events
- Integrações (upstream/downstream)

### 2. CQRS Implementation (`cqrs-implementation.md`)
Template para implementar CQRS com:
- Command side (write model)
- Query side (read model)
- Event handlers
- Projeções

### 3. Event Sourcing (`event-sourcing.md`)
Template para event sourcing com:
- Event store design
- Snapshots strategy
- Event replay
- Versioning strategy

### 4. Microservices Strategy (`microservices-strategy.md`)
Template para estratégia de microservices com:
- Service boundaries
- Communication patterns
- Data management
- Deployment strategy

---

## 🔄 Fluxo de Trabalho

### 1. Análise de Domínio
```
Input: Modelo de Domínio + Requisitos
↓
Identificar Bounded Contexts
↓
Mapear Relações entre Contextos
↓
Definir Linguagem Ubíqua
```

### 2. Design Estratégico
```
Context Mapping
↓
Padrões de Integração
↓
Anticorruption Layers
↓
Shared Kernels
```

### 3. Implementação Tática
```
Para cada Bounded Context:
- Aggregates e Entities
- Domain Events
- Application Services
- Infrastructure
```

### 4. Comunicação e Governança
```
Definir Padrões de Comunicação
↓
Contratos de API
↓
Event Schemas
↓
Monitoring e Observabilidade
```

---

## 🎯 Exemplos de Uso

### Cenário 1: E-commerce com Múltiplos Contextos
```
Bounded Contexts:
- Catalog (Produtos, Categorias)
- Order (Pedidos, Checkout)
- Payment (Pagamentos, Transações)
- Shipping (Entregas, Logística)
- Customer (Clientes, Perfis)

Padrões Aplicados:
- DDD para modelagem
- CQRS para Order e Catalog
- Event Sourcing para Payment
- Microservices para todos os contextos
```

### Cenário 2: Sistema Financeiro
```
Bounded Contexts:
- Account (Contas, Saldos)
- Transaction (Transações, Transferências)
- Compliance (Auditoria, Regulação)
- Risk (Análise de Risco, Fraude)

Padrões Aplicados:
- Event Sourcing para auditoria completa
- CQRS para performance de leitura
- Saga pattern para transações distribuídas
```

---

## 📖 Recursos Adicionais

### Documentação Completa
- **Examples:** `resources/examples/architecture-examples.md`
- **Validation:** `resources/checklists/architecture-validation.md`
- **Reference:** `resources/reference/architecture-guide.md`

### Funções MCP Disponíveis
- `init_bounded_context` - Inicializar bounded context
- `validate_ddd_model` - Validar modelo DDD
- `generate_cqrs_structure` - Gerar estrutura CQRS
- `validate_event_sourcing` - Validar Event Sourcing

---

## ⚠️ Guardrails Críticos

### ❌ NUNCA Faça
- Misturar bounded contexts
- Ignorar consistência eventual
- Criar microservices sem boundaries claras
- Pular domain events
- Compartilhar banco de dados entre contextos

### ✅ SEMPRE Faça
- Definir bounded contexts primeiro
- Usar linguagem ubíqua
- Implementar anticorruption layers
- Versionar eventos e APIs
- Documentar decisões arquiteturais (ADRs)

---

## 🔗 Dependências

### Especialistas Anteriores Necessários
- ✅ Gestão de Produto (PRD)
- ✅ Engenharia de Requisitos
- ✅ Modelagem de Domínio
- ✅ Arquitetura de Software (base)

### Especialistas Complementares
- Performance e Escalabilidade
- Observabilidade
- DevOps e Infraestrutura

---

## 📊 Métricas de Sucesso

### Indicadores Técnicos
- **Bounded Contexts:** > 80% coesão interna
- **Domain Events:** 100% versionados
- **API Contracts:** 100% documentados
- **Service Autonomy:** > 90% independente
- **Event Consistency:** < 100ms eventual

### Indicadores de Qualidade
- **Domain Model Purity:** ≥ 95%
- **Service Coupling:** ≤ 20%
- **Event Throughput:** > 1000 events/sec
- **API Latency:** < 100ms (p95)

---

**Documentação Completa:** Ver `MCP_INTEGRATION.md` para integração com MCP  
**Templates:** Ver `resources/templates/` para templates estruturados  
**Exemplos:** Ver `resources/examples/` para casos de uso completos
