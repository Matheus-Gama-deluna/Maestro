# Prompt: Rate Limiting e Throttling

> **Prioridade**: 🔴 CRÍTICA  
> **Aplicável a**: Todos os projetos com APIs expostas

---

## Por que é Crítico?

Rate limiting protege seu sistema contra:
- **DDoS e ataques de força bruta**
- **Abuso de API** (scraping, spam)
- **Esgotamento de recursos** (CPU, memória, banco)
- **Custos inesperados** (APIs pagas, cloud billing)
- **Degradação de serviço** para usuários legítimos

---

## Algoritmos de Rate Limiting

| Algoritmo | Comportamento | Melhor Para |
|-----------|---------------|-------------|
| **Fixed Window** | Conta requests em janelas fixas (ex: por minuto) | APIs simples, fácil de implementar |
| **Sliding Window Log** | Janela deslizante precisa | Precisão, mas alto uso de memória |
| **Sliding Window Counter** | Híbrido: precisão + eficiência | Maioria dos casos |
| **Token Bucket** | Tokens recarregam gradualmente, permite bursts | APIs que toleram picos curtos |
| **Leaky Bucket** | Processa em taxa constante, descarta excesso | Suavizar tráfego, filas |

---

## Prompt Base

```text
Atue como engenheiro de segurança e performance.

Preciso implementar rate limiting para:
- API: [DESCREVA: ex. REST API pública de e-commerce]
- Endpoints críticos: [LISTE: ex. /login, /checkout, /api/*]
- Tráfego esperado: [ex. 1000 req/min normal, picos de 5000]
- Tipos de cliente: [AUTENTICADO/ANÔNIMO/API_KEY/OAUTH]

Stack: [ex. Node.js + Express + Redis / Python + FastAPI]

Gere implementação completa com:

1. **Algoritmo recomendado** e justificativa

2. **Limites por tier**
   - Anônimo: X req/min
   - Autenticado free: Y req/min
   - Autenticado premium: Z req/min
   - API Key: W req/min

3. **Limites específicos por endpoint**
   - /login: mais restrito (proteção brute force)
   - /search: menos restrito
   - /checkout: moderado

4. **Headers de resposta** (RFC 6585)
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset
   - Retry-After (quando 429)

5. **Armazenamento** (Redis patterns)
   - Schema de keys
   - TTL

6. **Bypasses seguros**
   - Health checks
   - Requests internos
   - IPs whitelisted

7. **Resposta 429** com:
   - Mensagem clara
   - Retry-After header
   - Link para documentação de limites

8. **Testes automatizados**
```

---

## Padrões Obrigatórios

### Headers de Resposta

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640000000
Retry-After: 60
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please retry after 60 seconds.",
  "documentation_url": "https://api.example.com/docs/rate-limits",
  "limit": 100,
  "remaining": 0,
  "reset_at": "2024-01-01T12:01:00Z"
}
```

---

## Limites Recomendados por Contexto

### APIs Públicas

| Tier | Limite | Janela |
|------|--------|--------|
| Anônimo | 60 req | 1 min |
| Free | 100 req | 1 min |
| Pro | 1000 req | 1 min |
| Enterprise | 10000 req | 1 min |

### Endpoints Sensíveis

| Endpoint | Limite | Janela | Justificativa |
|----------|--------|--------|---------------|
| `/login` | 5 | 1 min | Brute force protection |
| `/password-reset` | 3 | 15 min | Anti-abuse |
| `/register` | 10 | 1 hora | Spam accounts |
| `/search` | 30 | 1 min | Resource intensive |
| `/export` | 5 | 1 hora | Heavy operation |

---

## Exemplo: Sliding Window Counter (Node.js + Redis)

```typescript
import { Redis } from 'ioredis';
import { Request, Response, NextFunction } from 'express';

const redis = new Redis();

interface RateLimitConfig {
  windowMs: number;      // Janela em ms
  maxRequests: number;   // Máximo de requests na janela
  keyPrefix?: string;    // Prefixo para a key
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

function getClientIdentifier(req: Request): string {
  // Prioridade: API Key > User ID > IP
  const apiKey = req.headers['x-api-key'] as string;
  if (apiKey) return `apikey:${apiKey}`;
  
  const userId = (req as any).user?.id;
  if (userId) return `user:${userId}`;
  
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  return `ip:${ip}`;
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyPrefix = 'ratelimit' } = config;
  const windowSec = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = `${keyPrefix}:${clientId}:${windowStart}`;

    try {
      // Incrementar contador atomicamente
      const current = await redis.incr(key);
      
      // Definir TTL apenas na primeira request da janela
      if (current === 1) {
        await redis.expire(key, windowSec + 1);
      }

      const remaining = Math.max(0, maxRequests - current);
      const resetTime = Math.ceil((windowStart + windowMs) / 1000);

      // Adicionar headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      if (current > maxRequests) {
        const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          error: 'rate_limit_exceeded',
          message: `Too many requests. Please retry after ${retryAfter} seconds.`,
          limit: maxRequests,
          remaining: 0,
          reset_at: new Date(resetTime * 1000).toISOString()
        });
      }

      next();
    } catch (error) {
      // Em caso de falha do Redis, permitir request (fail-open)
      console.error('Rate limit error:', error);
      next();
    }
  };
}

// Uso com diferentes limites
const apiLimiter = rateLimit({ windowMs: 60000, maxRequests: 100 });
const loginLimiter = rateLimit({ windowMs: 60000, maxRequests: 5, keyPrefix: 'login' });
const searchLimiter = rateLimit({ windowMs: 60000, maxRequests: 30, keyPrefix: 'search' });

app.use('/api/', apiLimiter);
app.post('/login', loginLimiter, loginHandler);
app.get('/search', searchLimiter, searchHandler);
```

---

## Exemplo: Token Bucket para Bursts

```typescript
interface TokenBucketConfig {
  bucketSize: number;        // Capacidade máxima
  refillRate: number;        // Tokens adicionados por segundo
  keyPrefix?: string;
}

export function tokenBucket(config: TokenBucketConfig) {
  const { bucketSize, refillRate, keyPrefix = 'tokenbucket' } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientIdentifier(req);
    const key = `${keyPrefix}:${clientId}`;
    const now = Date.now();

    // Lua script para operação atômica
    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local bucketSize = tonumber(ARGV[2])
      local refillRate = tonumber(ARGV[3])
      
      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or bucketSize
      local lastRefill = tonumber(bucket[2]) or now
      
      -- Calcular tokens recarregados
      local elapsed = (now - lastRefill) / 1000
      local refilled = math.min(bucketSize, tokens + (elapsed * refillRate))
      
      if refilled >= 1 then
        -- Consumir 1 token
        redis.call('HMSET', key, 'tokens', refilled - 1, 'last_refill', now)
        redis.call('EXPIRE', key, 3600)
        return {1, math.floor(refilled - 1), bucketSize}
      else
        return {0, 0, bucketSize}
      end
    `;

    const result = await redis.eval(luaScript, 1, key, now, bucketSize, refillRate) as number[];
    const [allowed, remaining, limit] = result;

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (!allowed) {
      const retryAfter = Math.ceil((1 - remaining) / refillRate);
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: `Too many requests. Retry after ${retryAfter} seconds.`
      });
    }

    next();
  };
}

// Permite burst de 10, recarrega 2 tokens/segundo
app.use('/api/', tokenBucket({ bucketSize: 10, refillRate: 2 }));
```

---

## Prompt: Revisar Rate Limiting Existente

```text
Tenho este código de rate limiting implementado:
[COLE O CÓDIGO]

Analise:
1. O algoritmo está correto?
2. Há condições de corrida (race conditions)?
3. Os limites são apropriados para [CONTEXTO]?
4. O que acontece se o Redis falhar?
5. Sugira melhorias de segurança e performance.
```

---

## Prompt: Rate Limiting para Microserviços

```text
Tenho uma arquitetura de microserviços com:
- API Gateway (entrada única)
- Serviços: [auth, orders, payments, notifications]
- Comunicação interna via [gRPC/HTTP/mensageria]

Stack: [DESCREVA]

Projete uma estratégia de rate limiting que:
1. Limite no gateway (proteção global)
2. Limite por serviço (proteção granular)
3. Propague limites entre serviços
4. Trate rate limiting distribuído (múltiplas instâncias)
5. Inclua circuit breaker para dependências lentas
```

---

## Checklist de Implementação

- [ ] Algoritmo escolhido e justificado
- [ ] Limites definidos por tier de usuário
- [ ] Limites específicos para endpoints sensíveis
- [ ] Headers X-RateLimit-* em todas as respostas
- [ ] Resposta 429 com Retry-After
- [ ] Armazenamento distribuído (Redis)
- [ ] Bypass para health checks e IPs internos
- [ ] Fail-open em caso de falha do Redis
- [ ] Logs de rate limiting para análise
- [ ] Alertas quando limites são atingidos frequentemente
- [ ] Documentação de limites para desenvolvedores
- [ ] Testes automatizados

---

## Referências

- [RFC 6585 - 429 Too Many Requests](https://tools.ietf.org/html/rfc6585)
- [Stripe Rate Limiting](https://stripe.com/docs/rate-limits)
- [Redis Rate Limiting Patterns](https://redis.io/commands/incr#pattern-rate-limiter)
