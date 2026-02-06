# Prompt: Idempotência em APIs

> **Prioridade**: 🔴 CRÍTICA  
> **Aplicável a**: Projetos Nível 2 (Médio) e Nível 3 (Complexo)

---

## Por que é Crítico?

Sem idempotência, operações podem ser duplicadas em caso de:
- Retry automático de clientes
- Timeout de rede seguido de retry manual
- Falha de conexão após processamento

**Consequências em produção:**
- Cobranças duplicadas em pagamentos
- Pedidos duplicados em e-commerce
- Criação de recursos duplicados
- Inconsistência de dados

---

## Conceito

> **Idempotência**: Uma operação que pode ser executada múltiplas vezes produzindo o mesmo resultado.

| Método HTTP | Naturalmente Idempotente? |
|-------------|---------------------------|
| GET | ✅ Sim |
| PUT | ✅ Sim (substitui recurso) |
| DELETE | ✅ Sim (recurso já deletado = ok) |
| POST | ❌ **Não** - Requer implementação |
| PATCH | ⚠️ Depende da implementação |

---

## Prompt Base

```text
Atue como arquiteto de APIs com foco em resiliência.

Preciso implementar idempotência no seguinte endpoint:
- Método: [POST/PATCH]
- Rota: [ex: /api/v1/payments]
- Operação: [ex: criar pagamento, processar pedido]

Stack: [ex: Node.js + Express + Redis / Java + Spring + PostgreSQL]

Gere uma implementação completa com:

1. **Estratégia de Idempotency Key**
   - Via header `Idempotency-Key`
   - Formato: UUID v4
   - Validação de formato

2. **Armazenamento de Estado**
   - Schema para Redis ou tabela em banco
   - Estados: PROCESSING, COMPLETED, FAILED
   - TTL apropriado (mínimo 24h)

3. **Fluxo de Processamento**
   - Verificar se key já existe
   - Se PROCESSING: retornar 409 Conflict
   - Se COMPLETED: retornar resposta cacheada
   - Se nova: processar e armazenar resultado

4. **Middleware/Interceptor**
   - Código reutilizável para decorar endpoints

5. **Testes**
   - Request normal (200)
   - Request duplicada (resposta cached)
   - Request durante processamento (409)
   - Request com key inválida (400)

Inclua:
- Código completo e comentado
- Schema de armazenamento
- Exemplos de uso
```

---

## Padrões Obrigatórios

### Header Padrão

```http
POST /api/v1/orders HTTP/1.1
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "product_id": "123",
  "quantity": 1
}
```

### Respostas

| Cenário | Status Code | Body |
|---------|-------------|------|
| Primeira execução com sucesso | 200/201 | Recurso criado |
| Key já processada com sucesso | 200/201 | Resposta cacheada (idêntica) |
| Key em processamento | 409 Conflict | `{"error": "Request already in progress"}` |
| Key inválida/ausente | 400 Bad Request | `{"error": "Invalid Idempotency-Key"}` |
| Primeira execução com erro | 4xx/5xx | Erro original (cachear também) |

### Schema Redis

```plaintext
Key: idempotency:{idempotency_key}
TTL: 86400 (24 horas)
Value: {
  "status": "PROCESSING" | "COMPLETED" | "FAILED",
  "response_code": 201,
  "response_body": {...},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Schema SQL (Alternativa)

```sql
CREATE TABLE idempotency_keys (
    key VARCHAR(36) PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    response_code INT,
    response_body JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_idempotency_created ON idempotency_keys(created_at);

-- Job para limpar keys antigas (> 24h)
DELETE FROM idempotency_keys WHERE created_at < NOW() - INTERVAL '24 hours';
```

---

## Exemplo de Implementação (Node.js + Express + Redis)

```typescript
import { Redis } from 'ioredis';
import { Request, Response, NextFunction } from 'express';

const redis = new Redis();
const TTL_SECONDS = 86400; // 24 horas

interface IdempotencyRecord {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responseCode?: number;
  responseBody?: any;
  createdAt: string;
}

export function idempotent() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    // Validar presença e formato
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Idempotency-Key header required' });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      return res.status(400).json({ error: 'Invalid Idempotency-Key format' });
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    // Verificar se já existe
    const existing = await redis.get(redisKey);
    
    if (existing) {
      const record: IdempotencyRecord = JSON.parse(existing);
      
      if (record.status === 'PROCESSING') {
        return res.status(409).json({ 
          error: 'Request already in progress',
          idempotency_key: idempotencyKey
        });
      }
      
      // Retornar resposta cacheada
      return res.status(record.responseCode!).json(record.responseBody);
    }

    // Marcar como em processamento
    const processingRecord: IdempotencyRecord = {
      status: 'PROCESSING',
      createdAt: new Date().toISOString()
    };
    
    await redis.setex(redisKey, TTL_SECONDS, JSON.stringify(processingRecord));

    // Interceptar a resposta para cachear
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const completedRecord: IdempotencyRecord = {
        status: res.statusCode >= 400 ? 'FAILED' : 'COMPLETED',
        responseCode: res.statusCode,
        responseBody: body,
        createdAt: processingRecord.createdAt
      };
      
      redis.setex(redisKey, TTL_SECONDS, JSON.stringify(completedRecord));
      
      return originalJson(body);
    };

    next();
  };
}

// Uso no router
app.post('/api/v1/orders', idempotent(), createOrderHandler);
```

---

## Prompt para Revisar Idempotência Existente

```text
Tenho este endpoint que realiza operações que não podem ser duplicadas:
[COLE O CÓDIGO DO ENDPOINT]

Analise:
1. O endpoint é idempotente? Se não, por quê?
2. Quais operações podem causar problemas se duplicadas?
3. Sugira como adicionar idempotência mantendo compatibilidade.
```

---

## Checklist de Implementação

- [ ] Header `Idempotency-Key` definido
- [ ] Validação de formato (UUID v4)
- [ ] Armazenamento de estado configurado (Redis/DB)
- [ ] TTL mínimo de 24 horas
- [ ] Tratamento de requisição em andamento (409)
- [ ] Cache de resposta para requests duplicadas
- [ ] Testes automatizados cobrindo todos os cenários
- [ ] Documentação na OpenAPI/Swagger

---

## Referências

- [Stripe - Idempotent Requests](https://stripe.com/docs/api/idempotent_requests)
- [Idempotency Patterns](https://blog.bitsrc.io/design-patterns-for-microservices-idempotency/)
