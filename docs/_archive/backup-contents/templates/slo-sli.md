# Template: SLOs e SLIs do Sistema

> **Preencha este template** para definir os objetivos de confiabilidade do seu sistema.

---

## Informações do Sistema

| Campo | Valor |
|-------|-------|
| **Nome do Sistema** | [NOME] |
| **Responsável** | [TIME/PESSOA] |
| **Criticidade** | [ ] Baixa [ ] Média [ ] Alta [ ] Crítica |
| **Data de Criação** | [DATA] |
| **Última Revisão** | [DATA] |

---

## Definições

| Termo | Significado |
|-------|-------------|
| **SLA** | Service Level Agreement - Acordo contratual com clientes externos |
| **SLO** | Service Level Objective - Meta interna de confiabilidade |
| **SLI** | Service Level Indicator - Métrica que mede o SLO |
| **Error Budget** | Quantidade de erros/indisponibilidade permitida antes de violar o SLO |

---

## SLOs Definidos

### SLO-001: Disponibilidade

| Aspecto | Valor |
|---------|-------|
| **Descrição** | O sistema deve estar disponível para responder requisições |
| **SLI** | `(requests bem-sucedidos / total de requests) × 100%` |
| **SLO Target** | [99.9%] |
| **Error Budget** | [43.2 min/mês] ou [0.1% de requests podem falhar] |
| **Janela de Medição** | Rolling [30] dias |
| **Exclusões** | Manutenções programadas, dependências externas |

**Cálculo do Error Budget:**

| SLO | Error Budget (30 dias) | Error Budget (por semana) |
|-----|------------------------|---------------------------|
| 99% | 7.2 horas | 1.68 horas |
| 99.9% | 43.2 minutos | 10 minutos |
| 99.95% | 21.6 minutos | 5 minutos |
| 99.99% | 4.32 minutos | 1 minuto |

---

### SLO-002: Latência

| Aspecto | Valor |
|---------|-------|
| **Descrição** | Tempo de resposta para requisições |
| **SLI** | Percentil de latência das requisições |
| **SLO Target p50** | [< 100ms] (mediana) |
| **SLO Target p95** | [< 300ms] |
| **SLO Target p99** | [< 1000ms] |
| **Janela de Medição** | Rolling [7] dias |
| **Exclusões** | Operações de export/batch, uploads grandes |

**Endpoints Críticos (medir separadamente):**

| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| `GET /api/health` | < 10ms | < 50ms | < 100ms |
| `POST /api/auth/login` | < 200ms | < 500ms | < 1s |
| `GET /api/products` | < 100ms | < 300ms | < 500ms |
| [ADICIONAR SEUS ENDPOINTS] | | | |

---

### SLO-003: Taxa de Erros

| Aspecto | Valor |
|---------|-------|
| **Descrição** | Proporção de requisições que resultam em erro |
| **SLI** | `(erros 5xx / total de requests) × 100%` |
| **SLO Target** | [< 0.1%] |
| **Janela de Medição** | Rolling [24] horas |
| **Exclusões** | Erros 4xx (responsabilidade do cliente) |

---

### SLO-004: Throughput

| Aspecto | Valor |
|---------|-------|
| **Descrição** | Capacidade de processamento do sistema |
| **SLI** | Requests processados por segundo |
| **SLO Target** | Suportar [1000] req/s sem degradação |
| **Degradação Aceitável** | Até [20%] aumento de latência em picos |
| **Janela de Medição** | Picos de [5] minutos |

---

### SLO-005: Durabilidade de Dados (se aplicável)

| Aspecto | Valor |
|---------|-------|
| **Descrição** | Dados armazenados não devem ser perdidos |
| **SLI** | % de objetos preservados |
| **SLO Target** | [99.999999999%] (11 noves) |
| **Janela de Medição** | Anual |
| **Estratégia** | Replicação multi-região, backups diários |

---

## Ações por Consumo de Error Budget

| Budget Consumido | Status | Ações |
|------------------|--------|-------|
| 0-50% | 🟢 Normal | Operação normal, deploys liberados |
| 50-75% | 🟡 Atenção | Alerta para time, revisar deploys |
| 75-90% | 🟠 Alerta | Freeze parcial, priorizar estabilidade |
| 90-100% | 🔴 Crítico | Freeze total de features, foco em bugs |
| >100% | ⚫ Violação | Post-mortem obrigatório, plano de ação |

---

## Alertas Configurados

| SLO | Condição de Alerta | Severidade | Canal |
|-----|-------------------|------------|-------|
| Disponibilidade | < 99.5% (1h window) | Warning | Slack |
| Disponibilidade | < 99% (1h window) | Critical | PagerDuty |
| Latência p95 | > 500ms (5min window) | Warning | Slack |
| Latência p99 | > 2s (5min window) | Critical | PagerDuty |
| Error Rate | > 1% (5min window) | Critical | PagerDuty |
| Error Budget | > 50% consumido | Warning | Slack |
| Error Budget | > 80% consumido | Critical | Email + Slack |

---

## Dashboard e Observabilidade

### Métricas a Coletar

```yaml
# Prometheus/OpenTelemetry metrics
- http_requests_total{status, endpoint, method}
- http_request_duration_seconds{endpoint, method, quantile}
- http_errors_total{status, endpoint}
- error_budget_remaining_percent{service}
```

### Queries de Referência (PromQL)

```promql
# Disponibilidade (últimas 24h)
sum(rate(http_requests_total{status=~"2.."}[24h])) 
/ 
sum(rate(http_requests_total[24h])) * 100

# Latência p95
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# Taxa de erros
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m])) * 100
```

---

## Revisão e Governança

| Atividade | Frequência | Responsável |
|-----------|------------|-------------|
| Revisão de SLOs | Trimestral | Tech Lead + SRE |
| Análise de Error Budget | Semanal | Time de Produto |
| Post-mortem de violações | Após cada violação | Time responsável |
| Atualização de alertas | Mensal | SRE |

---

## Histórico de Violações

| Data | SLO Violado | Duração | Causa Raiz | Ação Corretiva |
|------|-------------|---------|------------|----------------|
| [DATA] | [SLO-XXX] | [DURAÇÃO] | [CAUSA] | [AÇÃO] |

---

## Próximos Passos

- [ ] Configurar coleta de métricas (Prometheus/Datadog/New Relic)
- [ ] Criar dashboard com SLIs em tempo real
- [ ] Configurar alertas conforme tabela acima
- [ ] Integrar com sistema de on-call (PagerDuty/Opsgenie)
- [ ] Agendar primeira revisão de SLOs
