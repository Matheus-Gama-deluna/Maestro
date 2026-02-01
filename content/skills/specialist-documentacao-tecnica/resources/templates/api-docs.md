# 📡 API Documentation: [Nome da API]

## 📋 Metadados

**Versão da API:** v1.0  
**Base URL:** `https://api.exemplo.com/v1`  
**Data de Criação:** [DD/MM/YYYY]  
**Última Atualização:** [DD/MM/YYYY]  
**Status:** [Active|Deprecated|Beta]  
**Contato:** [email@exemplo.com]  

---

## 🔐 Autenticação

### Método de Autenticação
[ ] **Bearer Token (JWT)** - Token no header Authorization
[ ] **API Key** - Chave de API no header X-API-Key
[ ] **OAuth 2.0** - Flow de autorização OAuth
[ ] **Basic Auth** - Autenticação básica HTTP

### Exemplo de Uso
```bash
# Bearer Token
curl -H "Authorization: Bearer <SEU_TOKEN>" \
     https://api.exemplo.com/v1/users

# API Key
curl -H "X-API-Key: <SUA_API_KEY>" \
     https://api.exemplo.com/v1/users
```

### Gerenciamento de Tokens
[ ] **Obtenção:** [Como obter token/chave]
[ ] **Validade:** [Duração do token]
[ ] **Refresh:** [Como renovar token]
[ ] **Revogação:** [Como revogar token]

---

## 📊 Resumo da API

### Endpoints Disponíveis
| Recurso | Método | Endpoint | Descrição |
|--------|--------|----------|-----------|
| Users | GET | `/users` | Lista usuários |
| Users | POST | `/users` | Cria usuário |
| Users | GET | `/users/:id` | Detalhes do usuário |
| Users | PUT | `/users/:id` | Atualiza usuário |
| Users | DELETE | `/users/:id` | Remove usuário |
| Auth | POST | `/auth/login` | Login |
| Auth | POST | `/auth/refresh` | Refresh token |

### Rate Limiting
[ ] **Limit:** [1000] requisições/hora
[ ] **Window:** [1] hora
[ ] **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`
[ ] **Retry-After:** Tempo de espera em segundos

---

## 👥 Users

### GET /users
Retorna lista paginada de usuários.

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| page | number | Não | 1 | Número da página |
| limit | number | Não | 20 | Items por página (máx: 100) |
| search | string | Não | - | Filtro por nome ou email |
| active | boolean | Não | - | Filtrar usuários ativos |
| created_since | string | Não | - | Data ISO 8601 |

#### Response 200 - Success
```json
{
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Response 400 - Bad Request
```json
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Parâmetros inválidos",
    "details": {
      "limit": "Must be between 1 and 100"
    }
  }
}
```

#### Response 401 - Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticação inválido"
  }
}
```

#### Exemplo
```bash
# Listar usuários (página 1, 10 itens)
curl -H "Authorization: Bearer <TOKEN>" \
     "https://api.exemplo.com/v1/users?page=1&limit=10"

# Buscar usuários ativos
curl -H "Authorization: Bearer <TOKEN>" \
     "https://api.exemplo.com/v1/users?active=true"

# Buscar por nome
curl -H "Authorization: Bearer <TOKEN>" \
     "https://api.exemplo.com/v1/users?search=joão"
```

---

### POST /users
Cria um novo usuário.

#### Request Body
```json
{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "password": "senhaSegura123",
  "phone": "+55 11 99999-9999",
  "birth_date": "1990-01-01",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  }
}
```

#### Campos Obrigatórios
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| name | string | Nome completo | Mínimo 3 caracteres |
| email | string | Email válido | Formato email válido |
| password | string | Senha | Mínimo 8 caracteres |

#### Campos Opcionais
| Campo | Tipo | Descrição |
|-------|------|-----------|
| phone | string | Telefone com DDI |
| birth_date | string | Data no formato YYYY-MM-DD |
| address | object | Endereço completo |

#### Response 201 - Created
```json
{
  "data": {
    "id": 2,
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "active": true,
    "created_at": "2024-01-16T14:30:00Z",
    "updated_at": "2024-01-16T14:30:00Z"
  }
}
```

#### Response 400 - Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "email": "Email já cadastrado",
      "password": "Senha deve ter no mínimo 8 caracteres"
    }
  }
}
```

#### Exemplo
```bash
# Criar usuário
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{
       "name": "Maria Santos",
       "email": "maria@exemplo.com",
       "password": "senhaSegura123"
     }' \
     https://api.exemplo.com/v1/users
```

---

### GET /users/:id
Retorna detalhes de um usuário específico.

#### Path Parameters
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | number | ID do usuário |

#### Response 200 - Success
```json
{
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "+55 11 99999-9999",
    "birth_date": "1985-05-15",
    "active": true,
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "01234-567"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Response 404 - Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuário não encontrado"
  }
}
```

#### Exemplo
```bash
# Buscar usuário ID 1
curl -H "Authorization: Bearer <TOKEN>" \
     https://api.exemplo.com/v1/users/1
```

---

### PUT /users/:id
Atualiza dados de um usuário existente.

#### Path Parameters
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | number | ID do usuário |

#### Request Body
```json
{
  "name": "João Silva Atualizado",
  "phone": "+55 11 88888-8888",
  "address": {
    "street": "Avenida Principal",
    "number": "456",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "zip_code": "20000-000"
  }
}
```

#### Response 200 - Success
```json
{
  "data": {
    "id": 1,
    "name": "João Silva Atualizado",
    "email": "joao@exemplo.com",
    "phone": "+55 11 88888-8888",
    "active": true,
    "address": {
      "street": "Avenida Principal",
      "number": "456",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "zip_code": "20000-000"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-16T15:45:00Z"
  }
}
```

#### Exemplo
```bash
# Atualizar usuário ID 1
curl -X PUT \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{
       "name": "João Silva Atualizado",
       "phone": "+55 11 88888-8888"
     }' \
     https://api.exemplo.com/v1/users/1
```

---

### DELETE /users/:id
Remove um usuário (soft delete).

#### Path Parameters
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | number | ID do usuário |

#### Response 204 - No Content
Usuário marcado como inativo (soft delete).

#### Response 404 - Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuário não encontrado"
  }
}
```

#### Exemplo
```bash
# Remover usuário ID 1
curl -X DELETE \
     -H "Authorization: Bearer <TOKEN>" \
     https://api.exemplo.com/v1/users/1
```

---

## 🔐 Autenticação

### POST /auth/login
Realiza login do usuário e retorna token JWT.

#### Request Body
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### Response 200 - Success
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

#### Response 401 - Unauthorized
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha inválidos"
  }
}
```

#### Exemplo
```bash
# Login
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "email": "joao@exemplo.com",
       "password": "senha123"
     }' \
     https://api.exemplo.com/v1/auth/login
```

---

### POST /auth/refresh
Renova o token de acesso usando refresh token.

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response 200 - Success
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

---

## 📊 Data Models

### User
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string|null",
  "birth_date": "string|null",
  "active": "boolean",
  "address": {
    "street": "string",
    "number": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### Address
```json
{
  "street": "string",
  "number": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string"
}
```

---

## ⚠️ Erros Comuns

### Formato de Resposta de Erro
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro",
    "details": {
      "field": "Detalhe específico do campo"
    }
  }
}
```

### Códigos de Erro
| Código | HTTP | Descrição |
|--------|------|-----------|
| INVALID_PARAMETERS | 400 | Parâmetros inválidos |
| VALIDATION_ERROR | 400 | Erro de validação |
| UNAUTHORIZED | 401 | Não autorizado |
| FORBIDDEN | 403 | Acesso negado |
| NOT_FOUND | 404 | Recurso não encontrado |
| CONFLICT | 409 | Conflito de dados |
| RATE_LIMIT_EXCEEDED | 429 | Limite de requisições excedido |
| INTERNAL_ERROR | 500 | Erro interno do servidor |

---

## 🔄 Webhooks

### Eventos Disponíveis
[ ] **user.created** - Novo usuário criado
[ ] **user.updated** - Usuário atualizado
[ ] **user.deleted** - Usuário removido

### Configuração
```bash
# Configurar webhook
curl -X POST \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://seu-app.com/webhook",
       "events": ["user.created", "user.updated"],
       "secret": "webhook_secret"
     }' \
     https://api.exemplo.com/v1/webhooks
```

### Payload do Webhook
```json
{
  "event": "user.created",
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "created_at": "2024-01-16T14:30:00Z"
  },
  "timestamp": "2024-01-16T14:30:00Z"
}
```

---

## 🧪 Testes e Exemplos

### Postman Collection
[ ] **Download:** [Link para collection Postman]
[ ] **Environment:** [Variáveis de ambiente]
[ ] **Examples:** [Exemplos de requisições]

### SDKs e Bibliotecas
[ ] **JavaScript/Node.js:** [npm install @exemplo/api]
[ ] **Python:** [pip install exemplo-api]
[ ] **PHP:** [composer require exemplo/api]
[ ] **Ruby:** [gem install exemplo-api]

### Exemplo JavaScript
```javascript
import { ExemploAPI } from '@exemplo/api';

const api = new ExemploAPI({
  baseURL: 'https://api.exemplo.com/v1',
  token: 'seu_token_aqui'
});

// Listar usuários
const users = await api.users.list({ page: 1, limit: 10 });

// Criar usuário
const newUser = await api.users.create({
  name: 'Maria Santos',
  email: 'maria@exemplo.com',
  password: 'senhaSegura123'
});
```

---

## 📈 Limites e Quotas

### Rate Limiting
- **Free Tier:** 1000 requisições/hora
- **Pro Tier:** 10000 requisições/hora
- **Enterprise:** Ilimitado

### Data Limits
- **Tamanho máximo de request:** 10MB
- **Tamanho máximo de response:** 50MB
- **Timeout:** 30 segundos

---

## 🔄 Versionamento

### Política de Versionamento
- **Major:** Breaking changes (v1 → v2)
- **Minor:** Novas features (v1.1 → v1.2)
- **Patch:** Bug fixes (v1.1.1 → v1.1.2)

### Suporte a Versões
- **v1.x.x:** Suporte ativo
- **v0.x.x:** Beta, sem garantia de estabilidade
- **Deprecated:** Aviso 6 meses antes de remoção

---

## 📞 Suporte

### Contato
- **Email:** api-support@exemplo.com
- **Discord:** #api-support
- **Issues:** [GitHub Issues]
- **Status:** [Status Page]

### Documentação Adicional
- **Guia de Início Rápido:** [Link]
- **Tutoriais:** [Link]
- **FAQ:** [Link]
- **Changelog:** [Link]

---

**Última Atualização:** [DD/MM/YYYY]  
**Próxima Revisão:** [DD/MM/YYYY]