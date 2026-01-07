# Prompt: Definição de SLOs e SLIs

> **Prioridade**: 🔴 CRÍTICA  
> **Aplicável a**: Projetos Nível 2 (Médio) e Nível 3 (Complexo)

---

## Contexto

SLOs (Service Level Objectives) são metas internas de confiabilidade que guiam decisões de engenharia. Sem SLOs definidos:
- Não há critério objetivo para "bom o suficiente"
- Não há base para priorizar estabilidade vs features
- Não há como medir degradação gradual

---

## Prompt Base: Derivar SLOs de Requisitos

```text
Atue como engenheiro de confiabilidade (SRE).

Aqui estão os requisitos não-funcionais do sistema:
[COLE OS RNFs]

Contexto:
- Tipo de sistema: [ex: e-commerce, fintech, SaaS B2B]
- Usuários esperados: [ex: 10k DAU, 100 req/s pico]
- Criticidade: [baixa/média/alta/crítica]
- SLA contratual (se houver): [ex: 99.9% uptime]

Derive SLOs práticos incluindo:

1. **SLO de Disponibilidade**
   - SLI (métrica exata a medir)
   - Target (ex: 99.9%)
   - Error Budget resultante
   - Exclusões (manutenções, dependências)

2. **SLO de Latência**
   - SLIs para p50, p95, p99
   - Targets por endpoint crítico
   - Janela de medição

3. **SLO de Taxa de Erros**
   - SLI (como calcular)
   - Target máximo aceitável
   - O que conta como erro

4. **Alertas Recomendados**
   - Condições de disparo
   - Severidadades (warning/critical)
   - Janelas de avaliação

5. **Dashboard Essencial**
   - Métricas a exibir
   - Queries de exemplo (PromQL/Datadog)

Use o template em `06-templates/slo-sli.md` como base.
```

---

## Prompt: SLOs para Sistema Existente

```text
Tenho um sistema em produção com as seguintes características:
- Stack: [DESCREVA]
- Métricas disponíveis: [ex: Prometheus, Datadog, CloudWatch]
- Dados históricos: [ex: 6 meses de logs]
- Incidentes recentes: [LISTE SE HOUVER]

Analise os dados históricos e sugira:
1. SLOs realistas baseados no comportamento atual
2. Gaps entre performance atual e SLOs ideais
3. Priorização de melhorias para atingir SLOs target
4. Error budget atual (quanto já estamos consumindo)
```

---

## Prompt: Definir Error Budget Policy

```text
Temos os seguintes SLOs definidos:
[COLE SEUS SLOs]

Crie uma Error Budget Policy que defina:

1. **Ações por nível de consumo**
   - 0-50%: operação normal
   - 50-75%: ações preventivas
   - 75-90%: ações corretivas
   - >90%: emergência

2. **Regras para deploys**
   - Quando pausar deploys
   - Critérios para liberar novamente
   - Exceções (hotfixes críticos)

3. **Responsabilidades**
   - Quem monitora
   - Quem decide pausar
   - Quem aprova exceções

4. **Post-mortem obrigatório**
   - Gatilhos para post-mortem
   - Template de análise
   - Prazo para completar
```

---

## Prompt: Revisar SLOs Existentes

```text
Aqui estão os SLOs atuais do sistema:
[COLE SEUS SLOs]

Dados dos últimos 3 meses:
- Disponibilidade real: [ex: 99.85%]
- Latência p95 real: [ex: 450ms]
- Taxa de erros média: [ex: 0.15%]
- Incidentes: [LISTE]

Avalie:
1. Os SLOs estão calibrados corretamente?
   - Muito fáceis (gastamos pouco error budget)?
   - Muito difíceis (violamos frequentemente)?
2. Há SLOs faltando?
3. Os SLIs estão medindo a coisa certa?
4. Sugira ajustes com justificativa.
```

---

## Prompt: SLOs para Microserviços

```text
Tenho uma arquitetura de microserviços com:
- API Gateway
- Serviços: [auth, orders, payments, notifications]
- Dependências externas: [Stripe, SendGrid, etc]

Defina:
1. SLOs por serviço individual
2. SLO composto para a jornada do usuário
3. Como calcular SLO quando há dependências em cadeia
4. Como tratar dependências externas no error budget
5. Estratégia de alertas em cascata
```

---

## Exemplos de SLIs por Tipo de Sistema

### API REST

```promql
# Disponibilidade
sum(rate(http_requests_total{status!~"5.."}[30d])) 
/ sum(rate(http_requests_total[30d])) * 100

# Latência p99
histogram_quantile(0.99, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Taxa de erros
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ sum(rate(http_requests_total[5m])) * 100
```

### Aplicação Web (Core Web Vitals)

| Métrica | SLI | SLO Target |
|---------|-----|------------|
| LCP | Largest Contentful Paint | p75 < 2.5s |
| FID | First Input Delay | p75 < 100ms |
| CLS | Cumulative Layout Shift | p75 < 0.1 |

### Mensageria/Filas

| Métrica | SLI | SLO Target |
|---------|-----|------------|
| Throughput | Mensagens processadas/s | > 1000/s |
| Latência | Tempo do envio ao processamento | p99 < 5s |
| Delivery Rate | Mensagens entregues/enviadas | > 99.99% |

### Banco de Dados

| Métrica | SLI | SLO Target |
|---------|-----|------------|
| Query Latency | Tempo de resposta de queries | p99 < 100ms |
| Connection Success | Conexões bem-sucedidas | > 99.9% |
| Replication Lag | Atraso de réplica | < 1s |

---

## Checklist de Implementação

- [ ] SLOs definidos para disponibilidade, latência, erros
- [ ] SLIs com definição precisa de cálculo
- [ ] Error budgets calculados
- [ ] Alertas configurados por nível de severidade
- [ ] Dashboard com SLIs em tempo real
- [ ] Error Budget Policy documentada
- [ ] Processo de revisão periódica agendado
- [ ] Post-mortem template preparado

---

## Referências

- [Google SRE Book - SLOs](https://sre.google/sre-book/service-level-objectives/)
- [The Art of SLOs (Google)](https://sre.google/workbook/implementing-slos/)
- [Practical Guide to SLOs](https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli)
