# Guia de Referência — Deploy & Operação

## SLOs, SLIs e Error Budgets

### Definições
| Conceito | Significado | Exemplo |
|----------|------------|---------|
| **SLI** (Service Level Indicator) | Métrica que mede o serviço | % de requests com latência < 300ms |
| **SLO** (Service Level Objective) | Meta para o SLI | 99.5% dos requests < 300ms |
| **Error Budget** | Margem de erro permitida | 0.5% = ~3.6h de downtime/mês |

### SLOs Recomendados por Tipo

| Tipo | Disponibilidade | Latência p95 | Error Rate |
|------|:-:|:-:|:-:|
| **MVP** | 99% (~7.3h down/mês) | < 500ms | < 5% |
| **Produção** | 99.5% (~3.6h/mês) | < 300ms | < 1% |
| **Enterprise** | 99.9% (~43min/mês) | < 100ms | < 0.1% |

## Observabilidade — 3 Pilares

### 1. Logs Estruturados
```json
{
  "level": "error",
  "timestamp": "2026-03-01T12:00:00Z",
  "request_id": "abc-123",
  "service": "api",
  "message": "Database connection failed",
  "error": { "code": "ECONNREFUSED", "host": "db:5432" },
  "duration_ms": 5023
}
```

**Regras:**
- JSON sempre (não texto livre)
- `request_id` para correlacionar com traces
- Nunca logar: senhas, tokens, PII sem masking
- Níveis: error (ação necessária) > warn (atenção) > info (normal) > debug (dev)

### 2. Métricas
| Métrica | Tipo | Ferramenta |
|---------|------|-----------|
| Request rate | Counter | Prometheus/Datadog |
| Latência (p50, p95, p99) | Histogram | Prometheus/Datadog |
| Error rate (5xx) | Counter | Prometheus/Sentry |
| CPU/Memory usage | Gauge | CloudWatch/Grafana |
| DB connection pool | Gauge | Prisma metrics |

### 3. Distributed Tracing
- **OpenTelemetry** como padrão
- Trace = request completo (FE → API → DB → response)
- Span = operação individual (query SQL, chamada HTTP)
- `trace_id` propagado via headers entre serviços

## Alertas — Boas Práticas

### Severidade
| Nível | Quando | Ação | Canal |
|-------|--------|------|-------|
| **P1 Critical** | Sistema down, dados corrompidos | Acordar alguém | PagerDuty/telefone |
| **P2 High** | Feature principal degradada | Resposta em 1h | Slack + email |
| **P3 Medium** | Feature secundária com erro | Resposta em 4h | Slack |
| **P4 Low** | Anomalia, investigar | Próximo horário comercial | Email |

### Regra de Ouro
- Todo alerta DEVE ter runbook associado
- Alerta sem ação = ruído → remover
- Alerta baseado em SLO, não em métricas absolutas

## Runbooks — Formato

```markdown
## Runbook: [Nome do Incidente]

### Sintomas
- [O que o alerta mostra]
- [O que o usuário reporta]

### Diagnóstico
1. Verificar [X]: `comando ou URL`
2. Verificar [Y]: `comando ou URL`
3. Se [condição] → [caminho A]
4. Se [outra condição] → [caminho B]

### Resolução
- [Passo 1]
- [Passo 2]
- [Verificar que voltou ao normal]

### Prevenção
- [O que fazer para não acontecer de novo]
```

### Runbooks Mínimos (3 obrigatórios)
1. **Deploy falhou** → rollback, verificar logs, re-deploy
2. **Banco indisponível** → verificar conexão, restart, failover
3. **Latência alta** → verificar queries lentas, cache, scaling

## Deploy Strategies

| Estratégia | Como funciona | Risco | Quando usar |
|-----------|--------------|-------|------------|
| **Rolling** | Substituição gradual de instâncias | Baixo | Default para a maioria |
| **Blue/Green** | 2 ambientes idênticos, switch DNS | Médio | Quando precisa de rollback instantâneo |
| **Canary** | % pequeno do tráfego na versão nova | Baixo | Quando tem volume para detectar erros |
| **Feature Flags** | Toggle por feature, não por deploy | Muito baixo | Quando features são independentes |

## Rollback — Checklist

| Etapa | Ação | Verificação |
|-------|------|-------------|
| 1 | Reverter para versão anterior (Vercel/Railway) | Site carrega |
| 2 | Se migration rodou: executar migration down | DB schema correto |
| 3 | Verificar health check | /api/health retorna 200 |
| 4 | Verificar erros no Sentry | Error rate volta ao normal |
| 5 | Comunicar stakeholders | Incidente registrado |

## Anti-patterns de Operação

| Anti-pattern | Correção |
|-------------|----------|
| Deploy sem staging | SEMPRE validar em preview/staging antes |
| Alerta sem runbook | Cada alerta → 1 runbook com diagnóstico e resolução |
| SLOs sem SLIs | Definir COMO medir antes de definir a meta |
| Monitoramento só de infra | Incluir métricas de NEGÓCIO (conversão, erros de UI) |
| Rollback nunca testado | Executar rollback em staging mensalmente |
| Logs em texto livre | JSON estruturado com request_id e nível |
| Secrets em código | Variáveis de ambiente + rotation periódica |
