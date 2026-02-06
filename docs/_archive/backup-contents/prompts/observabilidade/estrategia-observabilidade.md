# Prompt: Estratégia de Observabilidade

> **Quando usar**: Fase de arquitetura ou antes de ir para produção
> **Especialista**: [Observabilidade](../../02-especialistas/Especialista%20em%20Observabilidade.md) ou [DevOps](../../02-especialistas/Especialista%20em%20DevOps%20e%20Infraestrutura.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento atual do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura do sistema

Após gerar, salve o resultado em:
- `docs/08-observabilidade/estrategia-observabilidade.md`

---

## Prompt Completo

```text
Atue como SRE sênior especialista em observabilidade.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Arquitetura

Componentes: [DESCREVA API, WORKERS, BANCO, CACHE, etc]
Stack: [TECNOLOGIAS]
Cloud: [AWS/GCP/Azure/On-premise]
Criticidade: [ALTA/MÉDIA/BAIXA]
SLA esperado: [UPTIME % - ex: 99.9%]

---

## Sua Missão

Projete a estratégia de observabilidade baseada nos 3 pilares:

### 1. Logging

#### 1.1 Formato Estruturado
Defina estrutura JSON padrão:
- Campos obrigatórios em todo log
- Campos por tipo de evento (request, error, business)
- Contexto a incluir (traceId, userId, etc)

#### 1.2 Níveis de Log
Quando usar cada nível:
- ERROR: [Quando usar, exemplos]
- WARN: [Quando usar, exemplos]
- INFO: [Quando usar, exemplos]
- DEBUG: [Quando usar, exemplos]

#### 1.3 O que Logar
- Requests HTTP (entrada e saída)
- Erros e exceptions (com stack trace)
- Eventos de negócio importantes
- Decisões do sistema (cache hit/miss, fallbacks)
- Auditoria (quem fez o quê)

#### 1.4 O que NÃO Logar
- PII (dados pessoais) - mascarar
- Tokens, secrets, passwords
- Payloads grandes (limitar tamanho)
- Health checks (ou log em nível menor)

#### 1.5 Onde Enviar
- Agregador sugerido (CloudWatch, Datadog, ELK, etc)
- Retenção por ambiente
- Estratégia de sampling para alto volume

### 2. Métricas

#### 2.1 RED Metrics (para serviços)
- **Rate**: requests/second
- **Errors**: error rate %
- **Duration**: latency percentiles (p50, p95, p99)

#### 2.2 USE Metrics (para recursos)
- **Utilization**: % de uso (CPU, memory, disk)
- **Saturation**: queue depth, waiting threads
- **Errors**: resource errors (OOM, disk full)

#### 2.3 Métricas de Negócio
[Sugerir 5-10 métricas específicas do domínio]
- Exemplo: agendamentos_criados_total
- Exemplo: valor_transacoes_sum

#### 2.4 Instrumentação
- Como expor métricas (Prometheus, StatsD, etc)
- Labels/dimensions importantes
- Naming convention

### 3. Tracing Distribuído

#### 3.1 Setup
- SDK recomendado (OpenTelemetry)
- Propagação de contexto entre serviços
- Instrumentação automática vs manual

#### 3.2 O que Instrumentar
- HTTP calls (in e out)
- Database queries (com query sanitizada)
- Cache operations
- Message queues (publish e consume)
- Serviços externos (APIs third-party)

#### 3.3 Sampling Strategy
- Estratégia recomendada (head-based vs tail-based)
- Taxa de amostragem por ambiente
- Always sample em erros

### 4. SLOs e Error Budget

#### 4.1 SLIs (Service Level Indicators)
| SLI | Fórmula | Medição |
|-----|---------|---------|
| Disponibilidade | (requests ok / total) * 100 | Prometheus |
| Latência | p95 < threshold | Histogram |
| Throughput | requests/sec | Counter |

#### 4.2 SLOs (Service Level Objectives)
| SLI | SLO | Janela |
|-----|-----|--------|
| Disponibilidade | [X%] | 30 dias |
| Latência p95 | < [X]ms | - |
| Error rate | < [X%] | 1 hora |

#### 4.3 Error Budget
- Cálculo: 100% - SLO = Budget
- Exemplo: SLO 99.9% = 43.2 min/mês de downtime permitido
- Ações quando budget está baixo

### 5. Alertas

#### 5.1 Alertas Críticos (P1 - Acordar de madrugada)
- Sistema fora do ar
- Error rate > X%
- Latência > X por Y minutos

#### 5.2 Alertas de Warning (P2 - Horário comercial)
- Error budget consumindo rápido
- Recursos próximos do limite
- Anomalias detectadas

#### 5.3 Multi-Window Burn Rate
Configuração para evitar false positives:
- Fast burn: 5% budget em 1h → alerta
- Slow burn: 10% budget em 6h → alerta

### 6. Dashboards

#### 6.1 Dashboard Principal (Four Golden Signals)
- Latência (p50, p95, p99)
- Tráfego (requests/sec)
- Erros (error rate %)
- Saturação (CPU, memory, connections)

#### 6.2 Dashboard de Debug
- Métricas detalhadas por endpoint
- Database query times
- Cache hit rates
- External API latencies

### 7. Runbook Template

Para cada alerta, documentar:
- O que significa o alerta
- Impacto para o usuário
- Passos de diagnóstico
- Ações de mitigação
- Escalation path
```

---

## Exemplo de Uso

```text
Atue como SRE sênior especialista em observabilidade.

## Contexto do Projeto

Sistema de agendamento para salões de beleza.
API em produção, precisamos de observabilidade completa.

## Arquitetura

Componentes:
- API NestJS (2 pods no Kubernetes)
- PostgreSQL RDS
- Redis ElastiCache
- Worker de notificações (1 pod)

Stack: Node.js, TypeScript
Cloud: AWS
Criticidade: MÉDIA
SLA esperado: 99.9%
```

---

## Resposta Esperada

### Logs - Formato JSON

```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "info",
  "message": "Request processed",
  "service": "api",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user-123",
  "method": "POST",
  "path": "/api/agendamentos",
  "statusCode": 201,
  "durationMs": 45
}
```

### Métricas RED

```prometheus
# Rate
http_requests_total{service="api", method="POST", path="/api/agendamentos", status="201"}

# Errors
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Duration
histogram_quantile(0.95, http_request_duration_seconds{service="api"})
```

### SLOs

| SLI | SLO | Error Budget |
|-----|-----|--------------|
| Success rate (2xx/3xx) | 99.9% | 43 min/mês |
| Latency p95 | < 300ms | - |
| Disponibilidade | 99.9% | 43 min/mês |

---

## Checklist Pós-Geração

- [ ] Formato de log estruturado definido
- [ ] Níveis de log com exemplos
- [ ] RED metrics para serviços
- [ ] USE metrics para recursos
- [ ] Métricas de negócio específicas do domínio
- [ ] OpenTelemetry configurado
- [ ] SLIs e SLOs definidos
- [ ] Error budget calculado
- [ ] Alertas P1 e P2 separados
- [ ] Dashboard principal desenhado
- [ ] Runbook template criado
- [ ] Salvar em `docs/08-observabilidade/estrategia-observabilidade.md`
