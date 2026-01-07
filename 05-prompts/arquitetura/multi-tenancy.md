# Prompt: Multi-tenancy

> **Prioridade**: 🟡 MÉDIA  
> **Aplicável a**: SaaS, plataformas white-label, sistemas B2B

---

## Prompt Base: Projetar Multi-tenancy

```text
Atue como arquiteto de software especialista em SaaS.

Preciso implementar multi-tenancy para:
- Tipo de produto: [ex. CRM SaaS, e-commerce white-label]
- Número esperado de tenants: [ex. 100 / 10.000 / 1M]
- Isolamento necessário: [ex. dados apenas / compliance rígido]
- Customização por tenant: [ex. branding / features / workflows]

Constraints:
- Stack: [DESCREVA]
- Orçamento de infra: [DESCREVA]
- Time: [DESCREVA]

Projete:

1. **Modelo de Isolamento**
   - Database per tenant, schema per tenant, ou row-level?
   - Justificativa para o contexto
   - Estratégia para tenants com necessidades especiais

2. **Identificação de Tenant**
   - Como identificar o tenant em cada request
   - Subdomain, header, JWT, ou combinação
   - Fallback se não identificado

3. **Implementação de Dados**
   - Schema das tabelas (com tenant_id)
   - Middleware/interceptor para filtrar
   - Como garantir que queries não vazem dados

4. **Customização**
   - Configurações por tenant
   - Feature flags por plano
   - Branding (logo, cores)

5. **Operacional**
   - Provisioning de novo tenant
   - Migrations multi-tenant
   - Backup/restore por tenant
   - Monitoramento por tenant
```

---

## Prompt: Migrar para Multi-tenant

```text
Tenho um sistema single-tenant que precisa virar multi-tenant:
[DESCREVA ESTRUTURA ATUAL]

Requisitos:
- Manter dados do tenant atual
- Adicionar suporte a novos tenants
- Mínimo de breaking changes
- Timeline: [PRAZO]

Gere um plano de migração com:
1. Alterações de schema (adicionar tenant_id)
2. Migrations de dados existentes
3. Mudanças de código (queries, middlewares)
4. Testes de validação
5. Rollout gradual
```

---

## Prompt: Implementar Row-Level Security

```text
Preciso implementar isolamento por row-level security.

Stack: [ex. PostgreSQL + Prisma + Node.js]

Tabelas principais:
[LISTE TABELAS]

Gere:
1. Migrations para adicionar tenant_id
2. Policies RLS no PostgreSQL  
3. Middleware para setar current_tenant
4. Repository base com tenant scope
5. Testes de isolamento
```

---

## Prompt: Tenant Provisioning

```text
Preciso automatizar o onboarding de novos tenants.

Quando um novo tenant é criado, preciso:
- [ex. Criar registro no banco]
- [ex. Configurar subdomain no DNS]
- [ex. Criar usuário admin]
- [ex. Popular dados iniciais]
- [ex. Enviar email de boas-vindas]

Stack: [DESCREVA]

Gere:
1. Endpoint/workflow de provisioning
2. Jobs assíncronos necessários
3. Rollback se algum step falhar
4. Notificações de progresso
5. Documentação do processo
```

---

## Prompt: Limites e Quotas por Tenant

```text
Preciso implementar limites por plano:

| Recurso | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Usuários | 5 | 50 | Ilimitado |
| Storage | 1GB | 10GB | 100GB |
| API calls/dia | 1000 | 10000 | Ilimitado |
| Features | [X,Y] | [X,Y,Z] | Todas |

Stack: [DESCREVA]

Gere:
1. Schema para quotas e usage tracking
2. Service para verificar limites
3. Middleware para bloquear quando excede
4. Dashboard de usage para tenant admin
5. Alerts quando próximo do limite
```

---

## Exemplo: Tenant Context Completo

```typescript
// src/tenancy/TenantContext.ts
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from '@prisma/client';

interface TenantContext {
  tenantId: string;
  config: TenantConfig;
  user?: User;
}

interface TenantConfig {
  id: string;
  subdomain: string;
  plan: 'free' | 'pro' | 'enterprise';
  quotas: {
    maxUsers: number;
    maxStorage: number;
    maxApiCalls: number;
  };
  features: string[];
}

const storage = new AsyncLocalStorage<TenantContext>();

// Middleware
export async function tenantMiddleware(req, res, next) {
  const tenantId = extractTenantIdFromRequest(req);
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not found' });
  }

  const config = await loadTenantConfig(tenantId);
  
  storage.run({ tenantId, config }, next);
}

// Getters
export function getTenant(): TenantContext {
  const ctx = storage.getStore();
  if (!ctx) throw new Error('No tenant context');
  return ctx;
}

export function getTenantId(): string {
  return getTenant().tenantId;
}

export function hasFeature(feature: string): boolean {
  return getTenant().config.features.includes(feature);
}

// Prisma extension para injetar tenant automaticamente
export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...args.where, tenantId: getTenantId() };
        return query(args);
      },
      async create({ args, query }) {
        args.data = { ...args.data, tenantId: getTenantId() };
        return query(args);
      },
      // ... outras operações
    }
  }
});
```

---

## Checklist

- [ ] Modelo de isolamento definido
- [ ] Identificação de tenant implementada
- [ ] Todas as queries filtram por tenant
- [ ] Testes de isolamento automatizados
- [ ] Provisioning automatizado
- [ ] Limites e quotas por plano
- [ ] Monitoramento por tenant
- [ ] Documentação de onboarding

---

## Referências

Consulte: [Guia de Multi-tenancy](../03-guias/Guia%20de%20Multi-tenancy.md)
