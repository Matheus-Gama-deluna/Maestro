# Prompt: Versionamento de APIs

> **Prioridade**: 🟠 ALTA  
> **Aplicável a**: APIs públicas, integrações com terceiros, sistemas com múltiplos clientes

---

## Por que Versionar?

- **Breaking changes** sem quebrar clientes existentes
- **Deprecação gradual** de funcionalidades
- **Múltiplas versões** em produção simultaneamente
- **Contratos estáveis** para integradores

---

## Estratégias de Versionamento

| Estratégia | Exemplo | Prós | Contras |
|------------|---------|------|---------|
| **URL Path** | `/v1/users` | Simples, cache-friendly | Mudança de URL |
| **Query Param** | `/users?version=1` | Fácil de adicionar | Menos RESTful |
| **Header** | `Accept: application/vnd.api.v1+json` | Não polui URL | Menos visível |
| **Content Negotiation** | `Accept: application/vnd.company.v2+json` | Padrão HTTP | Mais complexo |

---

## Prompt Base: Estratégia de Versionamento

```text
Atue como arquiteto de APIs.

Estou criando uma API com as seguintes características:
- Tipo: [REST/GraphQL]
- Clientes: [internos/externos/públicos]
- Frequência de breaking changes esperada: [alta/média/baixa]
- Suporte simultâneo de versões: [ex. 2 versões, 6 meses]

Recomende uma estratégia de versionamento considerando:

1. **Mecanismo de Versão**
   - URL path, header, query param, ou híbrido
   - Justificativa para o contexto

2. **Política de Deprecação**
   - Quanto tempo uma versão é suportada?
   - Como comunicar deprecação aos clientes?
   - Headers de deprecação

3. **O que constitui uma nova versão?**
   - Breaking vs non-breaking changes
   - Quando incrementar major/minor

4. **Implementação**
   - Estrutura de código para múltiplas versões
   - Como compartilhar lógica entre versões
   - Testes por versão

5. **Documentação**
   - OpenAPI por versão ou unificado?
   - Changelog entre versões
```

---

## Prompt: Implementar Versionamento

```text
Tenho uma API existente que precisa de versionamento:
[COLE ESTRUTURA DE ENDPOINTS ATUAL]

Stack: [ex. Node.js + Express / Java + Spring]

Estratégia escolhida: [URL Path / Header / etc]

Gere:
1. Middleware/interceptor para roteamento de versões
2. Estrutura de pastas para organizar versões
3. Exemplo de endpoint com v1 e v2
4. Headers de deprecação (Sunset, Deprecation)
5. Testes para verificar compatibilidade
```

---

## Prompt: Migrar de v1 para v2

```text
Tenho esta API v1:
[COLE ENDPOINTS E SCHEMAS]

Preciso criar v2 com estas mudanças:
[DESCREVA BREAKING CHANGES]

Gere:
1. API v2 com as mudanças
2. Estratégia de migração para clientes
3. Período de dual-support recomendado
4. Guia de migração para documentação
5. Headers para comunicar deprecação de v1
```

---

## Headers de Deprecação (RFC 8594)

```http
HTTP/1.1 200 OK
Deprecation: @1735689600
Sunset: Sat, 01 Jan 2025 00:00:00 GMT
Link: <https://api.example.com/docs/v2>; rel="successor-version"
```

| Header | Significado |
|--------|-------------|
| `Deprecation` | Timestamp Unix de quando foi marcado como deprecated |
| `Sunset` | Data após a qual não será mais disponível |
| `Link: rel="successor-version"` | Link para nova versão |

---

## Exemplo: Versionamento por URL (Node.js + Express)

```typescript
// src/app.ts
import express from 'express';
import v1Router from './routes/v1';
import v2Router from './routes/v2';

const app = express();

// Versionamento por URL
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Fallback para versão padrão
app.use('/api', (req, res, next) => {
  res.redirect(301, `/api/v2${req.path}`);
});
```

```typescript
// src/routes/v1/users.ts
router.get('/', async (req, res) => {
  const users = await userService.getAll();
  
  // v1: resposta com formato antigo
  res.json({
    data: users.map(u => ({
      id: u.id,
      name: u.full_name, // v1 usa "name"
      email: u.email
    }))
  });
});
```

```typescript
// src/routes/v2/users.ts
router.get('/', async (req, res) => {
  const users = await userService.getAll();
  
  // v2: resposta com novo formato
  res.json({
    data: users.map(u => ({
      id: u.id,
      full_name: u.full_name, // v2 usa "full_name"
      email: u.email,
      profile: u.profile // v2 adiciona profile
    })),
    meta: {
      total: users.length,
      version: 'v2'
    }
  });
});
```

---

## Exemplo: Versionamento por Header

```typescript
// src/middleware/versioning.ts
const VERSION_HEADER = 'X-API-Version';
const DEFAULT_VERSION = '2';

export function versionRouter(req, res, next) {
  const version = req.headers[VERSION_HEADER.toLowerCase()] || DEFAULT_VERSION;
  
  // Anexar versão ao request
  req.apiVersion = version;
  
  // Adicionar headers de resposta
  res.setHeader(VERSION_HEADER, version);
  
  if (version === '1') {
    res.setHeader('Deprecation', '@1704067200');
    res.setHeader('Sunset', 'Mon, 01 Jul 2024 00:00:00 GMT');
  }
  
  next();
}

// No controller
export function getUsers(req, res) {
  const users = userService.getAll();
  
  if (req.apiVersion === '1') {
    return res.json(formatV1(users));
  }
  
  return res.json(formatV2(users));
}
```

---

## Política de Breaking Changes

### O que é Breaking Change?

| Tipo de Mudança | Breaking? | Ação |
|-----------------|-----------|------|
| Remover endpoint | ✅ Sim | Nova versão major |
| Remover campo da resposta | ✅ Sim | Nova versão major |
| Renomear campo | ✅ Sim | Nova versão major |
| Alterar tipo de campo | ✅ Sim | Nova versão major |
| Adicionar campo obrigatório no request | ✅ Sim | Nova versão major |
| Adicionar campo opcional na resposta | ❌ Não | Versão atual |
| Adicionar endpoint | ❌ Não | Versão atual |
| Adicionar campo opcional no request | ❌ Não | Versão atual |

### Exemplo de Política

```markdown
## Política de Versionamento - API [NOME]

### Versões Suportadas
- Máximo de 2 versões major em produção
- Versão deprecated tem suporte por 6 meses após lançamento da próxima
- Versão sunset é comunicada com 3 meses de antecedência

### Comunicação
- Changelog público em /docs/changelog
- Email para clientes cadastrados em mudanças major
- Headers Deprecation e Sunset em respostas

### SLA de Deprecação
1. Anúncio: -6 meses do sunset
2. Deprecation header: -3 meses do sunset
3. Sunset: remoção completa
```

---

## Documentação Multi-Versão

### OpenAPI por Versão

```yaml
# openapi-v1.yaml
openapi: 3.0.0
info:
  title: API v1 (Deprecated)
  version: 1.0.0
  x-deprecation-date: 2024-01-01

# openapi-v2.yaml
openapi: 3.0.0
info:
  title: API v2 (Current)
  version: 2.0.0
```

### Changelog

```markdown
# Changelog

## v2.0.0 (2024-01-15)

### Breaking Changes
- `GET /users`: Campo `name` renomeado para `full_name`
- `POST /users`: Campo `profile_url` agora é obrigatório

### Migração de v1 para v2
1. Substituir `name` por `full_name` em todas as requisições
2. Adicionar `profile_url` ao criar usuários

## v1.0.0 (2023-06-01)
- Release inicial
```

---

## Checklist

- [ ] Estratégia de versionamento definida e documentada
- [ ] Política de breaking changes clara
- [ ] Headers de deprecação implementados
- [ ] Documentação separada por versão
- [ ] Changelog atualizado
- [ ] Testes para todas as versões ativas
- [ ] Roteamento de versões testado

---

## Referências

- [RFC 8594 - The Sunset HTTP Header](https://tools.ietf.org/html/rfc8594)
- [API Versioning Best Practices](https://www.mnot.net/blog/2012/12/04/api-evolution)
- [Stripe API Versioning](https://stripe.com/docs/api/versioning)
