# Prompt: Design de API REST

> **Quando usar**: Fase de arquitetura, antes de implementar endpoints
> **Especialista**: [Arquitetura de Software](../../02-especialistas/Especialista%20em%20Arquitetura%20de%20Software.md)
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/02-requisitos/requisitos.md` - Requisitos funcionais
- `docs/04-modelo/modelo-dominio.md` - Entidades do sistema

Após gerar, salve o resultado em:
- `docs/06-api/api-design.md`
- `docs/06-api/openapi.yaml` (especificação)

---

## Prompt Completo

```text
Atue como arquiteto de APIs especializado em REST e OpenAPI.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Requisitos Funcionais

[COLE RFs DE docs/02-requisitos/requisitos.md]

## Modelo de Domínio

[COLE ENTIDADES DE docs/04-modelo/modelo-dominio.md]

## Configurações

Versionamento: [URL path: /v1 | Header: X-API-Version | Query: ?version=1]
Autenticação: [JWT Bearer | API Key | OAuth 2.0 | Session]
Formato: [JSON | JSON:API | HAL]
Base URL: [https://api.exemplo.com]

---

## Sua Missão

Projete uma API REST completa seguindo boas práticas:

### 1. Recursos e Endpoints

Para cada recurso (baseado nas entidades):

**Recurso: /recursos**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /recursos | Listar (paginado) | Sim/Não |
| GET | /recursos/:id | Obter por ID | Sim/Não |
| POST | /recursos | Criar | Sim/Não |
| PUT | /recursos/:id | Atualizar completo | Sim/Não |
| PATCH | /recursos/:id | Atualizar parcial | Sim/Não |
| DELETE | /recursos/:id | Remover | Sim/Não |

### 2. Padrões de Nomenclatura

- Recursos no plural: /users, /orders
- Kebab-case para multi-palavras: /order-items
- IDs como path parameter: /users/:id
- Relacionamentos: /users/:id/orders
- Ações especiais: POST /orders/:id/cancel

### 3. Query Parameters

Padronize:
- **Paginação**: page, limit (ou cursor)
- **Ordenação**: sort=field:asc,field2:desc
- **Filtros**: filter[field]=value
- **Campos**: fields=id,name,email
- **Expands**: include=orders,profile

### 4. Request/Response Schemas

Para cada endpoint principal, defina:

**Request Body (POST/PUT)**
```json
{
  "campo1": "tipo",
  "campo2": "tipo"
}
```

**Response Body (Sucesso)**
```json
{
  "data": { ... },
  "meta": { ... }
}
```

**Response Body (Lista)**
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 5. HTTP Status Codes

| Código | Quando Usar |
|--------|-------------|
| 200 | Sucesso (GET, PUT, PATCH) |
| 201 | Criado (POST) |
| 204 | Sem conteúdo (DELETE) |
| 400 | Request inválido |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 409 | Conflito (duplicação) |
| 422 | Erro de validação |
| 429 | Rate limit exceeded |
| 500 | Erro interno |

### 6. Formato de Erros

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem amigável",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ],
    "traceId": "abc-123"
  }
}
```

### 7. Headers

**Request Headers**
- Authorization: Bearer {token}
- Content-Type: application/json
- Accept: application/json
- X-Request-ID: {uuid}

**Response Headers**
- X-Request-ID: {uuid}
- X-RateLimit-Limit: 100
- X-RateLimit-Remaining: 95
- X-RateLimit-Reset: timestamp

### 8. Versionamento

Estratégia escolhida e como deprecar versões antigas.

### 9. Segurança

- Rate limiting por endpoint
- Validação de input
- CORS configuration

### 10. OpenAPI Specification

Gere a especificação OpenAPI 3.0 em YAML para os endpoints principais.
```

---

## Exemplo de Uso

```text
Atue como arquiteto de APIs especializado em REST e OpenAPI.

## Contexto do Projeto

Sistema de agendamento para salões de beleza.

## Requisitos Funcionais

- RF-001: Listar horários disponíveis
- RF-002: Criar agendamento
- RF-003: Cancelar agendamento
- RF-004: Listar agendamentos do dia

## Modelo de Domínio

- Cliente (id, nome, telefone, email)
- Servico (id, nome, duracao, preco)
- Profissional (id, nome, especialidades)
- Agendamento (id, clienteId, servicoId, profissionalId, dataHora, status)

## Configurações

Versionamento: URL path /v1
Autenticação: JWT Bearer (admin) / Público (cliente agendando)
Formato: JSON
Base URL: https://api.salao.com
```

---

## Resposta Esperada

### Recursos

**Recurso: /agendamentos**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /v1/agendamentos | Listar (admin) | JWT |
| GET | /v1/agendamentos/:id | Obter | JWT |
| POST | /v1/agendamentos | Criar | Público |
| DELETE | /v1/agendamentos/:id | Cancelar | JWT ou Token |

**Recurso: /disponibilidade**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /v1/profissionais/:id/disponibilidade | Horários livres | Público |

### Request/Response

**POST /v1/agendamentos**

Request:
```json
{
  "profissionalId": "uuid",
  "servicoId": "uuid",
  "dataHora": "2024-01-15T14:00:00Z",
  "cliente": {
    "nome": "Maria Silva",
    "telefone": "11999998888"
  }
}
```

Response (201):
```json
{
  "data": {
    "id": "uuid",
    "status": "CONFIRMADO",
    "dataHora": "2024-01-15T14:00:00Z",
    "profissional": { "id": "uuid", "nome": "Ana" },
    "servico": { "id": "uuid", "nome": "Corte", "duracao": 30 }
  }
}
```

### OpenAPI (Resumo)

```yaml
openapi: 3.0.3
info:
  title: API Salão de Beleza
  version: 1.0.0
  
paths:
  /v1/agendamentos:
    post:
      summary: Criar agendamento
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CriarAgendamento'
      responses:
        '201':
          description: Agendamento criado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AgendamentoResponse'
```

---

## Checklist Pós-Geração

- [ ] Todos os recursos mapeados das entidades
- [ ] Verbos HTTP corretos para cada ação
- [ ] Paginação padronizada
- [ ] Formato de erro consistente
- [ ] Status codes documentados
- [ ] Headers de request/response definidos
- [ ] Rate limiting especificado
- [ ] Versionamento definido
- [ ] OpenAPI spec gerada
- [ ] Salvar em `docs/06-api/api-design.md`
