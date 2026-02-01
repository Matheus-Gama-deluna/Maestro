---
name: specialist-performance-escalabilidade
description: Perfis de carga, caching, tuning e auto-scaling para alto volume.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Performance e Escalabilidade · Skill do Especialista

## Missão
Garantir que o sistema suporte milhões de requisições com desempenho, aplicando perfis de carga, caching, tuning e auto-scaling para alto volume.

## Quando ativar
- Fase: Especialista Avançado
- Workflows recomendados: /corrigir-bug, /maestro
- Use quando precisar em projetos com SLOs agressivos ou problemas de performance.

## Inputs obrigatórios
- Requisitos de performance
- Métricas atuais
- Cenários de pico
- Arquitetura existente
- CONTEXTO.md do projeto

## Outputs gerados
- Planos de teste de carga
- Estratégias de caching e tuning
- Configuração de auto-scaling
- Relatórios de performance
- Recomendações de otimização

## Quality Gate
- SLOs definidos e medidos
- Testes de carga executados
- Otimizações implementadas
- Auto-scaling configurado
- Monitoramento ativo

## Performance Engineering

### SLOs e SLIs
```text
Defina métricas claras:
- Latency: p95 < 100ms, p99 < 500ms
- Throughput: > 1000 RPS
- Error Rate: < 0.1%
- Availability: 99.9%
- Resource Utilization: < 80%
```

### Performance Testing
```bash
# Load testing com k6
k6 run --vus 100 --duration 5m script.js

# Stress testing
k6 run --vus 1000 --duration 10m stress-test.js

# Soak testing
k6 run --vus 50 --duration 24h soak-test.js
```

## Caching Strategies

### Multi-Level Caching
```text
Implemente cache hierarchy:
1. Browser Cache (Client-side)
2. CDN Cache (Edge)
3. Application Cache (Redis/Memcached)
4. Database Cache (Query cache)
5. Static Cache (CDN + CloudFront)
```

### Cache Patterns
- **Cache-Aside:** Application manages cache
- **Read-Through:** Cache manages misses
- **Write-Through:** Write to cache and DB
- **Write-Behind:** Async write to DB
- **Refresh-Ahead:** Proactive cache refresh

## Optimization Techniques

### Database Optimization
```sql
-- Indexes estratégicos
CREATE INDEX CONCURRENTLY idx_user_email_active 
ON users(email) WHERE active = true;

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM orders 
WHERE user_id = $1 AND created_at > $2;
```

### Application Optimization
```javascript
// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Async processing
await Promise.all([
  fetchUser(id),
  fetchOrders(id),
  fetchProfile(id)
]);
```

## Auto-Scaling Strategies

### Horizontal Scaling
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 2
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Vertical Scaling
```yaml
# Kubernetes VPA
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  updatePolicy:
    updateMode: Auto
```

## Processo de Performance Engineering

### 1. Baseline Establishment
```text
Meça performance atual:
- Latency por endpoint
- Throughput por serviço
- Resource utilization
- Error rates
- Database query times
```

### 2. Bottleneck Identification
```text
Identifique gargalos:
- CPU-bound vs I/O-bound
- Database queries lentas
- Network latency
- Memory leaks
- Contention points
```

### 3. Optimization Implementation
```text
Aplique otimizações:
- Database indexing
- Caching strategies
- Code optimization
- Resource allocation
- Architecture changes
```

### 4. Validation
```text
Valide melhorias:
- Load testing pós-otimização
- Compare baseline vs optimized
- Monitor production metrics
- Validate SLO achievement
```

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** otimize sem medição
- **NUNCA** ignore SLOs em produção
- **NUNCA** cache dados sensíveis sem TTL
- **NUNCA** scale sem monitoramento

### SEMPRE Faça
- **SEMPRE** meça antes de otimizar
- **SEMPRE** defina SLOs claros
- **SEMPRE** monitore em produção
- **SEMPRE** teste load antes de deploy

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Requisitos de performance
2. Métricas atuais do sistema
3. Cenários de pico esperados
4. Arquitetura existente
5. CONTEXTO.md com restrições

### Prompt de Continuação
```
Atue como Performance Engineer Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Requisitos de performance:
[COLE REQUISITOS DE PERFORMANCE]

Métricas atuais:
[COLE MÉTRICAS ATUAIS]

Preciso garantir que o sistema suporte [NÚMERO] requisições com performance adequada.
```

### Ao Concluir Esta Fase
1. **Defina** SLOs e SLIs
2. **Implemente** caching strategies
3. **Configure** auto-scaling
4. **Otimize** bottlenecks
5. **Teste** load scenarios
6. **Monitore** production

## Métricas de Performance

### Indicadores Obrigatórios
- **Latency:** p95 < 100ms, p99 < 500ms
- **Throughput:** > 1000 RPS
- **Error Rate:** < 0.1%
- **Availability:** 99.9%
- **Resource Utilization:** < 80%
- **Cache Hit Rate:** > 90%

### Metas de Excelência
- Latency: p95 < 50ms, p99 < 200ms
- Throughput: > 5000 RPS
- Error Rate: < 0.01%
- Availability: 99.99%
- Cache Hit Rate: > 95%

## Templates Prontos

### Load Testing Script (k6)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://api.example.com/users');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

### Performance Report
```markdown
# Performance Test Report

## Test Configuration
- **Tool:** k6
- **Duration:** 14 minutes
- **Peak Load:** 200 VUs
- **Target:** https://api.example.com

## Results Summary
- **Total Requests:** 12,000
- **Average Response Time:** 145ms
- **95th Percentile:** 280ms
- **99th Percentile:** 450ms
- **Error Rate:** 0.2%
- **Throughput:** 14.3 RPS

## Bottlenecks Identified
1. **Database:** Slow queries on user profile
2. **Memory:** High memory usage at peak load
3. **Network:** Latency spikes at 150+ VUs

## Recommendations
1. Add database indexes for profile queries
2. Implement connection pooling
3. Add CDN for static assets
4. Optimize memory usage
```

## Skills complementares
- `performance-profiling`
- `systematic-debugging`
- `database-design`
- `deployment-procedures`
- `monitoring-setup`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Performance e Escalabilidade.md`
- **Artefatos alvo:**
  - Planos de teste de carga
  - Estratégias de caching e tuning
  - Configuração de auto-scaling
  - Relatórios de performance
  - Recomendações de otimização