# Guia de Referência — Modelo de Domínio (DDD)

## Conceitos Fundamentais

### Entity vs Value Object vs Aggregate

| Conceito | Identidade | Mutável | Exemplo |
|----------|:----------:|:-------:|---------|
| **Entity** | ✅ Tem ID único | ✅ Sim | User, Order, Product |
| **Value Object** | ❌ Sem ID | ❌ Imutável | Money(amount, currency), Address(street, city) |
| **Aggregate** | ✅ Via Root | ✅ Sim | Order (root) + OrderItem + ShippingAddress |
| **Aggregate Root** | ✅ Entry point | ✅ Controla acesso | Order controla seus OrderItems |

### Regra do Aggregate
- Acesso externo SEMPRE via Aggregate Root (nunca via entity interna)
- Transação = 1 Aggregate (nunca modificar 2 aggregates na mesma transação)
- Se precisa modificar 2 aggregates → Domain Event

### Bounded Context
- Fronteira onde um modelo é CONSISTENTE
- Mesma palavra pode ter significado diferente em contexts diferentes
- Ex: "Cliente" em Vendas (comprador) vs "Cliente" em Suporte (ticket owner)

## Context Mapping — Relações

| Relação | Quando usar |
|---------|------------|
| **Partnership** | 2 contexts evoluem juntos, time único |
| **Customer-Supplier** | Consumer depende do Provider, negocia contrato |
| **Conformist** | Consumer aceita o modelo do Provider sem negociar |
| **Anti-Corruption Layer (ACL)** | Consumer traduz modelo externo para o interno |
| **Shared Kernel** | Código compartilhado entre contexts (usar com parcimônia) |
| **Published Language** | Contrato público (OpenAPI, eventos) |

## Domain Events

### Formato
```
Nome: [Substantivo][Verbo no passado]
  Ex: OrderCreated, PaymentApproved, UserRegistered

Payload: {
  eventId: UUID
  occurredAt: DateTime
  aggregateId: UUID
  data: { ... campos relevantes }
}
```

### Quando usar
- Quando algo acontece que OUTROS contexts precisam saber
- Quando precisa de consistência eventual (não transacional)
- Para desacoplar bounded contexts

## Event Storming (simplificado)

```
1. Listar EVENTOS (laranja): "O que acontece no sistema?"
   → OrderPlaced, PaymentReceived, ItemShipped

2. Listar COMANDOS (azul): "O que causa cada evento?"
   → PlaceOrder, ProcessPayment, ShipItem

3. Listar AGGREGATES (amarelo): "Quem processa cada comando?"
   → Order, Payment, Shipment

4. Agrupar em BOUNDED CONTEXTS
   → Sales (Order), Billing (Payment), Logistics (Shipment)
```

## Anti-patterns de DDD

| Anti-pattern | Por que é ruim | Correção |
|-------------|----------------|----------|
| Anemic Domain Model | Entidades sem lógica = procedural | Mover regras para dentro das entidades |
| God Aggregate | Aggregate com 10+ entidades | Dividir em aggregates menores |
| Shared DB entre contexts | Acoplamento forte | Cada context tem seu schema/DB |
| CRUD everywhere | Ignora regras de negócio | Modelar comportamentos, não dados |
| Linguagem técnica no domínio | Desconexão negócio-código | Glossário ubíquo: negócio = código |
| Event sourcing sem necessidade | Complexidade desnecessária | Usar apenas quando audit trail é requisito |
