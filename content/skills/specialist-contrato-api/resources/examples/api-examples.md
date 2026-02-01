# Exemplos Práticos - Contrato de API

## Exemplo 1: REST API Completa (CRUD de Usuários)

**OpenAPI:**
```yaml
openapi: 3.0.0
info:
  title: Users API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Create user
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserDto'
      responses:
        '201':
          description: Created
components:
  schemas:
    User:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        email: { type: string }
    CreateUserDto:
      type: object
      required: [name, email]
      properties:
        name: { type: string }
        email: { type: string, format: email }
```

**Types Gerados:**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}
```

---

## Exemplo 2: GraphQL API

**Schema:**
```graphql
type User {
  id: ID!
  name: String!
  email: String!
}

type Query {
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}

input CreateUserInput {
  name: String!
  email: String!
}
```

---

## Exemplo 3: WebSocket API

**Events:**
```typescript
// Client → Server
interface ClientEvents {
  'message:send': (data: { text: string }) => void;
  'typing:start': () => void;
}

// Server → Client
interface ServerEvents {
  'message:received': (data: { id: string; text: string; from: string }) => void;
  'user:typing': (data: { userId: string }) => void;
}
```

---

## Exemplo 4: gRPC API

**Proto:**
```protobuf
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}

message GetUserRequest {
  string id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}
```
