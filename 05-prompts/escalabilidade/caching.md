# Prompt: Estratégias de Cache

> **Prioridade**: 🟡 MÉDIA  
> **Aplicável a**: APIs com alta carga, dados lidos frequentemente

---

## Prompt Base: Projetar Cache

```text
Atue como engenheiro de performance.

Tenho um sistema com:
- Stack: [ex. Node.js + PostgreSQL + Redis]
- Tráfego: [ex. 1000 req/s, 80% leitura, 20% escrita]
- Dados: [ex. catálogo de 50k produtos, users sessions, configurações]
- Latência atual: [ex. p95 = 500ms]
- Meta: [ex. p95 < 100ms]

Para cada tipo de dado, recomende:

1. **Padrão de Cache**
   - Cache-aside, write-through, read-through, ou combinação
   - Justificativa

2. **TTL e Invalidação**
   - Tempo de vida sugerido
   - Estratégia de invalidação (explícita, event-driven, TTL puro)

3. **Estrutura no Redis**
   - Tipo de dado Redis (string, hash, set, sorted set)
   - Naming convention para keys
   - Exemplos de comandos

4. **Código de Implementação**
   - Cache layer reutilizável
   - Decorators ou helpers
   - Tratamento de cache miss e falha do Redis

5. **Métricas**
   - O que monitorar
   - Alertas recomendados
```

---

## Prompt: Cache para Endpoint Específico

```text
Tenho este endpoint que é lento:
[COLE CÓDIGO DO ENDPOINT]

Métricas atuais:
- Latência: [ex. p95 = 800ms]
- Chamadas/dia: [ex. 100k]
- Taxa de mudança dos dados: [ex. atualizam 1x por hora]

Gere:
1. Análise do que pode ser cacheado
2. Implementação com cache-aside
3. Estratégia de invalidação
4. Código refatorado
5. Testes para validar cache hit/miss
```

---

## Prompt: Invalidação de Cache

```text
Tenho o seguinte cenário de cache:
- Entidades: [ex. User, Order, Product]
- Relacionamentos: [ex. User tem Orders, Order tem Products]
- Caches atuais: [ex. user:123, user:123:orders, product:456]

Quando um User é atualizado, preciso invalidar: [DESCREVA]

Projete uma estratégia de invalidação que:
1. Garanta consistência
2. Minimize invalidações desnecessárias
3. Use eventos/pub-sub se benéfico
4. Documente quais eventos afetam quais caches
```

---

## Prompt: Cache Multi-Layer

```text
Quero implementar cache em múltiplas camadas:
1. Browser/CDN (edge)
2. Application (in-memory)
3. Distributed (Redis)
4. Database (query cache)

Para estes endpoints:
[LISTE ENDPOINTS E CARACTERÍSTICAS]

Gere:
1. Estratégia por camada
2. Headers HTTP para cache de browser/CDN
3. Código para cache in-memory + Redis
4. Quando usar cada camada
5. Como invalidar coordenadamente
```

---

## Prompt: Resolver Cache Stampede

```text
Estou tendo problemas de cache stampede:
- Cenário: [ex. muitos requests simultâneos no cache miss]
- Impacto: [ex. banco sobrecarrega, timeout em cascata]

Stack: [DESCREVA]

Implemente:
1. Lock de requisição única (singleflight)
2. Probabilistic early expiration
3. Fallback para stale data durante refresh
4. Código completo com testes
```

---

## Exemplo: Cache Layer Genérico

```typescript
// src/cache/cacheLayer.ts
import Redis from 'ioredis';

interface CacheOptions {
  ttl?: number;           // segundos
  staleWhileRevalidate?: boolean;
  lockTimeout?: number;   // ms
}

class CacheLayer {
  private redis: Redis;
  private locks = new Map<string, Promise<any>>();
  
  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = 3600, staleWhileRevalidate = false, lockTimeout = 5000 } = options;

    // 1. Tentar cache
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      
      // SWR: retornar stale e atualizar em background
      if (staleWhileRevalidate && this.isNearExpiry(key)) {
        this.refreshInBackground(key, fetcher, ttl);
      }
      
      return data;
    }

    // 2. Prevenir stampede com lock
    if (this.locks.has(key)) {
      return this.locks.get(key);
    }

    // 3. Buscar com timeout
    const promise = this.fetchWithLock(key, fetcher, ttl, lockTimeout);
    this.locks.set(key, promise);
    
    try {
      return await promise;
    } finally {
      this.locks.delete(key);
    }
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private async fetchWithLock<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number,
    timeout: number
  ): Promise<T> {
    const lockKey = `lock:${key}`;
    const lockAcquired = await this.redis.set(lockKey, '1', 'PX', timeout, 'NX');
    
    try {
      const data = await fetcher();
      await this.redis.setex(key, ttl, JSON.stringify(data));
      return data;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async isNearExpiry(key: string): Promise<boolean> {
    const ttl = await this.redis.ttl(key);
    return ttl < 60; // último minuto
  }

  private async refreshInBackground<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<void> {
    // Fire and forget
    fetcher()
      .then(data => this.redis.setex(key, ttl, JSON.stringify(data)))
      .catch(err => console.error(`Background refresh failed for ${key}:`, err));
  }
}

// Uso
const cache = new CacheLayer(redis);

const user = await cache.get(
  `user:${userId}`,
  () => db.users.findById(userId),
  { ttl: 300, staleWhileRevalidate: true }
);
```

---

## Checklist

- [ ] Padrão de cache escolhido para cada tipo de dado
- [ ] TTLs definidos e documentados
- [ ] Invalidação implementada para operações de escrita
- [ ] Proteção contra stampede
- [ ] Monitoramento de hit rate
- [ ] Fallback se Redis indisponível
- [ ] Testes de cache hit, miss, e invalidação

---

## Referências

Consulte: [Guia de Estratégias de Cache](../03-guias/Guia%20de%20Estratégias%20de%20Cache.md)
