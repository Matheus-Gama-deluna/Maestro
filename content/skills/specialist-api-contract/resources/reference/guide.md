# Guia de Referência — Contrato de API

## OpenAPI 3.0 — Estrutura Mínima

```yaml
openapi: 3.0.3
info:
  title: [Nome da API]
  version: 1.0.0
  description: [Descrição]
servers:
  - url: http://localhost:3001/api
    description: Development
  - url: https://api-staging.app.com/api
    description: Staging
  - url: https://api.app.com/api
    description: Production
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
paths:
  /resources:
    get: ...
    post: ...
  /resources/{id}:
    get: ...
    patch: ...
    delete: ...
```

## Derivação: Modelo de Dados → Endpoints

Para cada entidade principal:

| Entidade | GET list | GET detail | POST | PATCH | DELETE |
|----------|---------|-----------|------|-------|--------|
| User | `/users` | `/users/:id` | `/auth/register` | `/users/:id` | — |
| Project | `/projects` | `/projects/:id` | `/projects` | `/projects/:id` | `/projects/:id` |
| Task | `/projects/:pid/tasks` | `/tasks/:id` | `/projects/:pid/tasks` | `/tasks/:id` | `/tasks/:id` |

## Paginação — Dois Padrões

### Offset-based (simples)
```
GET /tasks?page=1&limit=20
Response: { data: [...], meta: { total: 150, page: 1, limit: 20, pages: 8 } }
```

### Cursor-based (performante para grandes volumes)
```
GET /tasks?cursor=abc123&limit=20
Response: { data: [...], meta: { nextCursor: "def456", hasMore: true } }
```

## Error Response — RFC 7807

```json
{
  "type": "https://api.app.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "O campo 'title' é obrigatório",
  "instance": "/api/tasks",
  "errors": [
    { "field": "title", "message": "Required", "code": "required" }
  ]
}
```

## Status Codes — Quando Usar

| Código | Quando | Body |
|--------|--------|------|
| 200 | GET/PATCH sucesso | `{ data: {...} }` |
| 201 | POST sucesso (criou) | `{ data: {...} }` + Location header |
| 204 | DELETE sucesso | Sem body |
| 400 | Validação falhou | Error com details |
| 401 | Não autenticado | Error |
| 403 | Sem permissão | Error |
| 404 | Não encontrado | Error |
| 409 | Conflito (duplicado) | Error |
| 422 | Semântica inválida | Error |
| 429 | Rate limit excedido | Error + Retry-After header |
| 500 | Erro interno | Error genérico (sem detalhes internos) |

## Versionamento

| Estratégia | Exemplo | Quando usar |
|-----------|---------|------------|
| **URI** | `/v1/tasks` | Simples, visível, mais comum |
| **Header** | `Accept: application/vnd.api.v1+json` | Elegante, não polui URL |
| **Query** | `/tasks?version=1` | Fácil de testar, menos RESTful |
| **Sem versão** | `/tasks` | MVP sem consumers externos |

## Anti-patterns

| Anti-pattern | Correção |
|-------------|----------|
| Endpoints que não refletem o modelo | Derivar CRUD do modelo de dados |
| Schemas com `type: any` | Tipos reais: string (format: uuid), integer, etc |
| Sem exemplos | 1 exemplo por endpoint facilita mocks |
| Sem autenticação documentada | securitySchemes + security em cada endpoint |
| Lista sem paginação | SEMPRE paginar endpoints que retornam arrays |
| Error responses inconsistentes | RFC 7807 padrão em TODOS os erros |
