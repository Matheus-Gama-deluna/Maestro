# Gate Checklist — Deploy & Operação

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Deploy em produção realizado** | 20 | Sistema acessível na URL de produção |
| 2 | **Monitoramento ativo** | 15 | Error tracking (Sentry) + métricas capturando dados |
| 3 | **Health checks respondendo** | 15 | Liveness + readiness probes retornando 200 |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **SLOs definidos com SLIs** | 10 | Disponibilidade e latência com números e forma de medir |
| 5 | **Runbooks documentados** | 10 | Mínimo 3 cenários: deploy falhou, banco down, latência alta |
| 6 | **Rollback testado** | 10 | Processo documentado e executado pelo menos 1 vez |
| 7 | **Logs estruturados fluindo** | 10 | JSON com request_id, timestamp, level em agregador |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Alertas com severidade** | 4 | Regras de alerta vinculadas aos SLOs |
| 9 | **Secrets rotacionados** | 3 | Processo de rotation definido |
| 10 | **Distributed tracing** | 3 | OpenTelemetry ou equivalente configurado |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Deploy não funciona | Verificar: build passa? Variáveis de ambiente configuradas? DNS correto? |
| Sem monitoramento | Instalar Sentry (erros) + uptime monitor (disponibilidade) |
| Sem health checks | Criar /api/health que verifica DB + cache + dependências |
| Sem SLOs | Definir: "99.5% uptime" + "p95 < 300ms" + como medir cada um |
| Sem runbooks | Documentar 3 cenários: o que aconteceu → diagnóstico → resolução → prevenção |
