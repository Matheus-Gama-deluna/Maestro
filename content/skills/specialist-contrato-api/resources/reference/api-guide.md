# Guia Completo - Contrato de API

## OpenAPI 3.0 Specification

### Estrutura Básica
```yaml
openapi: 3.0.0
info:
  title: API Name
  version: 1.0.0
  description: API description
servers:
  - url: http://localhost:3000/api/v1
paths:
  /resource:
    get:
      summary: Get resources
      responses:
        '200':
          description: Success
components:
  schemas:
    Resource:
      type: object
      properties:
        id: { type: string }
```

---

## Contract-First Development

### Benefícios
1. Frontend e Backend trabalham em paralelo
2. Mocks permitem desenvolvimento independente
3. Validação antecipada de erros
4. Documentação sempre atualizada

### Fluxo
```
1. Definir Contrato OpenAPI
2. Gerar Types (frontend)
3. Gerar DTOs (backend)
4. Criar Mocks
5. Frontend desenvolve contra mocks
6. Backend implementa contrato
7. Integração
```

---

## API Design Patterns

### REST Best Practices
- Use substantivos para recursos (`/users`, não `/getUsers`)
- Verbos HTTP corretos (GET, POST, PUT, DELETE)
- Status codes apropriados
- Versionamento na URL (`/v1/users`)
- Paginação, filtros e ordenação

### Error Handling
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "message": "Must be valid email" }
    ]
  }
}
```

---

## Versionamento Semântico

**Formato:** MAJOR.MINOR.PATCH

- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

**Exemplo:**
- 1.0.0 → 1.1.0: Novo endpoint (backward compatible)
- 1.1.0 → 2.0.0: Campo obrigatório removido (breaking)

---

## Ferramentas

- **swagger-cli:** Validar OpenAPI
- **openapi-typescript:** Gerar types TS
- **MSW:** Mock Service Worker
- **Prism:** Mock server OpenAPI
- **orval:** Gerar hooks React Query
