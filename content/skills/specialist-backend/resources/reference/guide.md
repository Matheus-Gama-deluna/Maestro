# Guia de Referência — Backend

## Processo por User Story

Para cada User Story do Backlog/Discovery:

```
1. Ler modelo de dados da Arquitetura
2. Criar/atualizar migration → se novas tabelas são necessárias
3. Criar DTOs → validação de input com Zod/class-validator
4. Implementar service → regras de negócio isoladas
5. Implementar controller → rotas, middleware, error handling
6. Testar → unitário (service) + integração (controller)
7. Verificar → auth, validação, error handling padronizado
```

## Estrutura de Projeto Recomendada

```
backend/
├── src/
│   ├── modules/           # Organizado por domínio
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── auth.test.ts
│   │   ├── tasks/
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.dto.ts
│   │   │   └── tasks.test.ts
│   │   └── projects/
│   ├── middleware/         # Auth, error handler, rate limit
│   ├── lib/               # Prisma client, logger, config
│   └── index.ts           # Entry point
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── package.json
```

## Padrões de API REST

### Convenções de URL
| Operação | Método | URL | Body |
|----------|--------|-----|------|
| Listar | GET | `/api/tasks?status=todo&page=1` | — |
| Detalhar | GET | `/api/tasks/:id` | — |
| Criar | POST | `/api/tasks` | `{ title, projectId, ... }` |
| Atualizar | PATCH | `/api/tasks/:id` | `{ title?, status? }` |
| Deletar | DELETE | `/api/tasks/:id` | — |

### Formato de resposta padrão
```json
// Sucesso
{ "data": { ... }, "meta": { "total": 42, "page": 1 } }

// Erro
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### Status codes
| Código | Quando usar |
|--------|------------|
| 200 | GET/PATCH com sucesso |
| 201 | POST com sucesso (criou recurso) |
| 204 | DELETE com sucesso (sem body) |
| 400 | Validação falhou (input inválido) |
| 401 | Não autenticado |
| 403 | Autenticado mas sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email duplicado) |
| 500 | Erro interno (nunca expor detalhes ao client) |

## Validação com Zod

```typescript
// DTO com validação
const CreateTaskDTO = z.object({
  title: z.string().min(1).max(200),
  projectId: z.string().uuid(),
  description: z.string().optional(),
  priority: z.enum(['p1', 'p2', 'p3', 'p4']).default('p3'),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional(),
});

// No controller
const body = CreateTaskDTO.parse(req.body); // Throws ZodError se inválido
```

## Error Handling Padronizado

```typescript
// Middleware centralizado — NÃO tratar erros em cada controller
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: err.errors } });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
  }
  // Erro genérico — logar detalhes, retornar mensagem genérica
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } });
});
```

## Testes

### Service (unitário)
```typescript
describe('TaskService', () => {
  it('should create task with valid data', async () => {
    // Arrange — mock do repository
    // Act — chamar service.create(dto)
    // Assert — verificar retorno e chamadas ao repository
  });

  it('should throw when project not found', async () => {
    // Arrange — mock retorna null
    // Act + Assert — expect(...).rejects.toThrow(NotFoundError)
  });
});
```

### Controller (integração)
```typescript
describe('POST /api/tasks', () => {
  it('should return 201 with valid body', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', projectId: validProjectId });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test');
  });

  it('should return 400 with invalid body', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({}); // Missing required fields
    expect(res.status).toBe(400);
  });
});
```

## Anti-patterns de Backend

| Anti-pattern | Correção |
|-------------|----------|
| Lógica de negócio no controller | Mover para service — controller só roteia |
| Sem validação de input | Zod/Joi em TODOS os endpoints |
| Error handling por endpoint | Middleware centralizado de erro |
| Queries N+1 no Prisma | Usar `include` ou `select` com relations |
| Senhas em plain text nos logs | Nunca logar body de auth, usar redaction |
| Sem rate limiting em auth | express-rate-limit no login/register |
| Testes que dependem de banco real | Mock do Prisma client ou banco in-memory |
