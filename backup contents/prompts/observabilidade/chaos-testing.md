# Prompt: Chaos Engineering

> **Prioridade**: 🟢 BAIXA  
> **Aplicável a**: Projetos Nível 3 com alta disponibilidade  
> **Pré-requisito**: SLOs definidos

---

## Prompt Base: Planejar Experimento

```text
Atue como engenheiro de confiabilidade (SRE).

Quero realizar experimentos de chaos engineering em:
- Sistema: [DESCREVA ARQUITETURA]
- Criticidade: [SLO DE DISPONIBILIDADE]
- Ambiente alvo: [staging/produção com X% do tráfego]

Objetivos:
1. Validar resiliência a [TIPO DE FALHA]
2. Testar [mecanismo: failover, circuit breaker, retry]
3. Medir tempo de detecção e recuperação

Gere:

1. **Hipótese**
   - Quando [FALHA], o sistema deve [COMPORTAMENTO]
   - Impacto esperado nos SLOs: [MÁXIMO ACEITÁVEL]

2. **Plano de Experimento**
   - Escopo e blast radius
   - Duração
   - Métricas a observar
   - Kill switch

3. **Pré-requisitos**
   - Observabilidade necessária
   - Alertas que devem disparar
   - Time de standby

4. **Execução**
   - Comandos/ferramenta para injetar falha
   - Checklist de monitoramento
   - Critérios para abortar

5. **Pós-experimento**
   - Template de relatório
   - Ações de follow-up
```

---

## Prompt: Experimento de Network Failure

```text
Preciso testar o comportamento quando há falha de rede entre serviços.

Arquitetura:
[DESCREVA: ex. Serviço A chama Serviço B via REST]

Cenário:
- Inserir latência de 5 segundos
- Depois, simular timeout completo (conexão refused)

Stack: [DESCREVA]
Ferramenta: [Toxiproxy/tc netem/Chaos Mesh]

Gere:
1. Hipótese de comportamento esperado
2. Configuração da ferramenta
3. O que observar (métricas, logs)
4. Resultados esperados (circuit breaker, fallback)
```

---

## Prompt: Experimento de Database Failure

```text
Preciso testar o comportamento quando o banco de dados falha.

Setup:
- Banco: [PostgreSQL/MySQL com réplica]
- ORM: [Prisma/TypeORM/etc]
- Failover automático: [sim/não]

Cenários a testar:
1. Primary fica lento (queries demoram 10s)
2. Primary falha completamente
3. Réplica fica dessincronizada

Gere experimentos para cada cenário com:
- Como injetar a falha
- Comportamento esperado da aplicação
- Métricas críticas
- Critérios de sucesso
```

---

## Prompt: Game Day Planning

```text
Quero organizar um Game Day (simulação de incidente) para o time.

Contexto:
- Sistema: [DESCREVA]
- Participantes: [X pessoas, roles]
- Duração: [2-4 horas]

O exercício deve:
1. Simular um incidente realista
2. Testar detecção e resposta
3. Validar runbooks
4. Treinar comunicação

Crie:
1. Cenário de incidente (o que vai "quebrar")
2. Timeline de eventos injetados
3. Pontos de observação para facilitadores
4. Template de retrospectiva
5. Métricas de sucesso do Game Day
```

---

## Exemplo: Plano de Experimento

```yaml
Experiment:
  Name: Service Dependency Timeout
  Date: 2024-01-20
  Lead: @engineer
  
Hypothesis: >
  Quando o Payment Service não responder por 30 segundos,
  o Checkout Service deve usar circuit breaker e retornar
  erro gracioso em < 5 segundos, com fallback para modo offline.

Scope:
  Environment: production
  BlastRadius: 5% of traffic (canary deployment)
  Duration: 10 minutes
  Services: checkout-service, payment-service
  
Steady State:
  Availability: 99.9%
  Latency_p99: 500ms
  Error_Rate: 0.1%

Injection:
  Tool: Toxiproxy
  Action: Add 30s latency to payment-service:8080
  Command: |
    toxiproxy-cli toxic add -t latency -a latency=30000 payment-service
    
Kill_Switch:
  Auto:
    - If error_rate > 1% for 2 minutes
    - If latency_p99 > 5000ms for 1 minute
  Manual:
    - toxiproxy-cli toxic remove payment-service
    - kubectl rollout undo deployment/checkout-canary

Monitoring:
  Dashboards:
    - url: https://grafana.internal/d/checkout-slo
    - url: https://grafana.internal/d/payment-health
  Alerts_Expected:
    - payment-service-high-latency
    - checkout-circuit-breaker-open
    
Communication:
  Before: Anunciar no #engineering 15 min antes
  During: Atualizações a cada 5 min no #incidents
  After: Resumo no #engineering

Team:
  Lead: @maria (executa experimento)
  Observer: @joao (monitora métricas)
  Oncall: @pedro (standby para reverter)
```

---

## Prompt: Analisar Resultados

```text
Conduzi um experimento de chaos engineering:

Hipótese: [DESCREVA]

Resultados observados:
- [MÉTRICAS COLETADAS]
- [LOGS RELEVANTES]
- [ALERTAS DISPARADOS]

Incidentes durante o experimento:
- [SE HOUVE]

Analise:
1. A hipótese foi confirmada ou refutada?
2. Que fraquezas foram descobertas?
3. Os mecanismos de resiliência funcionaram?
4. Que ações de melhoria são recomendadas?
5. Próximos experimentos sugeridos
```

---

## Checklist de Experimento

### Antes
- [ ] Hipótese documentada
- [ ] Escopo e blast radius definidos
- [ ] Métricas baseline coletadas
- [ ] Kill switch configurado e testado
- [ ] Time informado
- [ ] Janela de manutenção acordada

### Durante
- [ ] Dashboards abertos
- [ ] Alertas monitorados
- [ ] Comunicação ativa
- [ ] Pronto para abortar se necessário

### Depois
- [ ] Relatório escrito
- [ ] Descobertas compartilhadas
- [ ] Tickets de melhoria criados
- [ ] Data do próximo experimento

---

## Referências

Consulte: [Guia de Chaos Engineering](../03-guias/Guia%20de%20Chaos%20Engineering.md)
