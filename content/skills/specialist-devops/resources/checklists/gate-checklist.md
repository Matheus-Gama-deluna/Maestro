# Gate Checklist — Integração & Deploy

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Frontend conectado ao Backend real** | 20 | Mocks removidos, chamadas à API real funcionando |
| 2 | **Endpoints funcionando end-to-end** | 15 | Fluxo principal completo: login → criar → visualizar → editar |
| 3 | **Pipeline CI/CD verde** | 15 | lint → type check → test → build → deploy automático |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Testes E2E para fluxos críticos** | 10 | Playwright/Cypress para login + fluxo principal |
| 5 | **CORS e variáveis de ambiente** | 10 | Configurados por ambiente (dev/staging/prod) |
| 6 | **Health check respondendo** | 10 | /api/health retorna 200 com status do servidor + banco |
| 7 | **Monitoramento ativo** | 10 | Sentry ou equivalente capturando erros |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Rollback documentado** | 5 | Processo de reversão testado |
| 9 | **Secrets em variáveis de ambiente** | 3 | Zero secrets no código |
| 10 | **SSL configurado** | 2 | HTTPS em staging e produção |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Mocks ainda ativos | Desativar MSW, atualizar NEXT_PUBLIC_API_URL para backend real |
| CI/CD falhando | Verificar: lint errors, type errors, test failures, build errors |
| Sem E2E | Configurar Playwright, criar teste: login → dashboard → criar item |
| Sem health check | Criar endpoint GET /api/health que verifica DB connection |
| Sem monitoramento | Instalar @sentry/node + @sentry/nextjs, configurar DSN |
