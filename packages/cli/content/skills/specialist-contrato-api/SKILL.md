---
name: specialist-contrato-api
description: Definição de OpenAPI, mocks, types e versionamento.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Contrato de API · Skill do Especialista

## Missão
Especificar contrato frontend-first com OpenAPI, mocks e tipagens, garantindo que frontend e backend compartilhem a mesma fonte de verdade.

## Quando ativar
- Fase: Fase 9 · Execução
- Workflows recomendados: /implementar-historia, /refatorar-codigo
- Use quando precisar antes de desenvolvimento FE/BE para sincronizar interfaces.

## Inputs obrigatórios
- Requisitos (`docs/02-requisitos/requisitos.md`)
- Modelo de Domínio (`docs/04-modelo/modelo-dominio.md`)
- Arquitetura (`docs/06-arquitetura/arquitetura.md`)
- Casos de uso críticos
- Stack tecnológica definida

## Outputs gerados
- `docs/09-api/contrato-api.md` — contrato completo
- OpenAPI/Swagger YAML validado
- Types gerados para frontend e backend
- Mock server configurado
- Documentação interativa

## Quality Gate
- OpenAPI válido (sem erros de lint)
- Todos os endpoints documentados
- Exemplos de request/response
- Types gerados para frontend
- Types gerados para backend
- Mock server funcionando
- Versionamento definido

## Fluxo de Criação de Contrato

### Ordem de Execução Obrigatória

| # | Bloco | Descrição | Validação |
|---|-------|-----------|-----------|
| 1 | **Schema** | Definir OpenAPI/GraphQL | Lint válido |
| 2 | **Types Frontend** | Gerar tipos TypeScript | Sem erros TS |
| 3 | **Types Backend** | Gerar DTOs | Sem erros TS |
| 4 | **Mock Server** | Configurar MSW/json-server | Mock respondendo |

### Fluxo Visual
```
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌─────────────┐
│ Schema  │ → │ Types FE  │ → │ Types BE │ → │ Mock Server │
└────┬────┘   └─────┬─────┘   └────┬─────┘   └──────┬──────┘
     │              │               │                 │
     ▼              ▼               ▼                 ▼
[lint]       [no errors]     [no errors]     [responding]
     ✓              ✓               ✓                 ✓
```

## Prompts por Bloco

### Bloco 1: Definir Schema OpenAPI
```text
Com base nos requisitos e modelo de domínio:
[COLE REQUISITOS E MODELO]

Gere um contrato OpenAPI 3.0 para a feature [NOME]:
- Endpoints necessários (GET, POST, PUT, DELETE)
- Request bodies com validações
- Response schemas
- Códigos de erro (400, 401, 404, 500)
- Exemplos de request/response

Formato: YAML válido
```

### Bloco 2: Gerar Types Frontend
```text
Com base neste OpenAPI:
[COLE OPENAPI]

Gere types TypeScript para o frontend:
- Interfaces para request/response
- Tipos para parâmetros
- Enums se necessário

Formato compatível com fetch/axios.
```

### Bloco 3: Gerar DTOs Backend
```text
Com base neste OpenAPI:
[COLE OPENAPI]

Gere DTOs para backend [STACK]:
- CreateXxxDto
- UpdateXxxDto
- XxxResponseDto
- Validações (class-validator ou equivalente)
```

### Bloco 4: Configurar Mock Server
```text
Com base neste OpenAPI:
[COLE OPENAPI]

Configure mock server usando [MSW/json-server/Prism]:
- Respostas mockadas para cada endpoint
- Dados de exemplo realistas
- Simulação de delays e erros
```

## Ferramentas Recomendadas

| Ferramenta | Uso | Stack |
|------------|-----|-------|
| **swagger-cli** | Validar OpenAPI | Todas |
| **openapi-typescript** | Gerar types frontend | TypeScript |
| **MSW** | Mock Service Worker | Browser + Node |
| **json-server** | Mock API rápido | Desenvolvimento |
| **Prism** | Mock server OpenAPI | Produção |
| **orval** | Gerar clients TypeScript | React/Vue |
| **swagger-codegen** | Gerar SDKs | Java/C#/Python |

## Estrutura do Contrato OpenAPI

### Seções Obrigatórias
1. **Info**
   - Title, version, description
   - Contact e license
   - Servers (dev, staging, prod)

2. **Paths**
   - Todos os endpoints com verbos HTTP
   - Parâmetros (path, query, header)
   - Request bodies com schemas
   - Responses com status codes

3. **Components**
   - Schemas reutilizáveis
   - Parameters comuns
   - Responses padrão
   - Security schemes

4. **Security**
   - Autenticação (JWT, API Key, OAuth)
   - Autorização por scopes
   - Rate limiting

5. **Examples**
   - Request/response examples
   - Mock data realista
   - Error cases

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** pule validação do OpenAPI
- **NUNCA** use exemplos genéricos
- **NUNCA** ignore códigos de erro
- **NUNCA** quebre backward compatibility

### SEMPRE Faça
- **SEMPRE** versione o contrato com o código
- **SEMPRE** use exemplos realistas nos mocks
- **SEMPRE** defina todos os códigos de erro
- **SEMPRE** mantenha backward compatibility

### Versionamento Obrigatório
```yaml
# Versionamento Semântico
version: 1.0.0  # Major.Minor.Patch

# Major: Breaking changes
# Minor: New features (backward compatible)
# Patch: Bug fixes (backward compatible)

# Exemplo de evolução:
# 1.0.0 → 1.1.0 (novo endpoint)
# 1.1.0 → 2.0.0 (campo obrigatório removido)
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Requisitos com endpoints necessários
2. Modelo de domínio com entidades
3. Arquitetura com stack definida
4. Casos de uso críticos

### Prompt de Continuação
```
Atue como Arquiteto de API Sênior.

Requisitos:
[COLE docs/02-requisitos/requisitos.md]

Modelo de Domínio:
[COLE docs/04-modelo/modelo-dominio.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

Preciso definir o contrato OpenAPI para sincronizar frontend e backend.
```

### Ao Concluir Esta Fase
1. **Valide o OpenAPI** com swagger-cli
2. **Gere os types** para frontend e backend
3. **Configure o mock server**
4. **Teste o contrato** com exemplos
5. **Documente o versionamento**
6. **Salve os artefatos** nos caminhos corretos

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Schema Validation:** 100% sem erros
- **Coverage:** Todos os endpoints documentados
- **Examples:** 100% com exemplos
- **Types Generation:** Sem erros TS
- **Mock Response Time:** < 100ms

### Metas de Excelência
- Schema Validation: 100%
- Documentation Coverage: 100%
- Mock Accuracy: ≥ 95%
- Developer Experience: Score ≥ 9/10

## Templates Prontos

### Estrutura OpenAPI Básica
```yaml
openapi: 3.0.0
info:
  title: API do Projeto
  version: 1.0.0
  description: API para [descrição]
servers:
  - url: http://localhost:3000/api/v1
    description: Development
  - url: https://api.projeto.com/v1
    description: Production

paths:
  /users:
    get:
      summary: Listar usuários
      responses:
        '200':
          description: Lista de usuários
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### TypeScript Frontend
```typescript
// Generated types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

### DTO Backend (NestJS)
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

## Skills complementares
- `api-patterns`
- `documentation-templates`
- `testing-patterns`
- `typescript-patterns`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Contrato de API.md`
- **Artefatos alvo:**
  - `docs/09-api/contrato-api.md`
  - OpenAPI/Swagger YAML validado
  - Types gerados para frontend e backend
  - Mock server configurado