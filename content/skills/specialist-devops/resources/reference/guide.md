# Guia de Referência — Integração & Deploy

## Processo de Integração (ordem)

```
1. Remover mocks (MSW) → apontar para API real
2. Configurar CORS no backend
3. Variáveis de ambiente por ambiente
4. Testes E2E para fluxo principal
5. CI/CD pipeline (lint → test → build → deploy)
6. Health checks (/api/health)
7. Monitoramento (Sentry)
8. Deploy staging → validar → deploy produção
9. Documentar rollback
```

## CORS — Configuração Express

```typescript
// Exemplo: CORS configurado para frontend específico
app.use(cors({
  origin: process.env.FRONTEND_URL, // Não usar '*' em produção
  credentials: true, // Para cookies (JWT refresh)
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

## Variáveis de Ambiente

| Arquivo | Ambiente | Exemplo |
|---------|----------|---------|
| `.env.local` | Desenvolvimento | `API_URL=http://localhost:3001` |
| `.env.staging` | Staging | `API_URL=https://api-staging.app.com` |
| `.env.production` | Produção | `API_URL=https://api.app.com` |

**Regras:**
- NUNCA commitar `.env` com secrets reais
- Usar `.env.example` com placeholders
- Secrets em variáveis do provider (Vercel, Railway, GitHub Secrets)

## CI/CD Pipeline — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

## Health Check — Implementação

```typescript
// GET /api/health
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Verifica conexão com banco
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
    });
  }
});
```

## Testes E2E — Playwright Mínimo

```typescript
// e2e/main-flow.spec.ts
test('fluxo principal: login → dashboard → criar item', async ({ page }) => {
  await page.goto('/login');
  await page.click('button:has-text("Login com Google")');
  // ... auth flow
  await expect(page.locator('h1')).toContainText('Dashboard');
  await page.click('button:has-text("Nova Tarefa")');
  await page.fill('input[name="title"]', 'Tarefa de teste');
  await page.click('button:has-text("Criar")');
  await expect(page.locator('.task-card')).toContainText('Tarefa de teste');
});
```

## Rollback — Checklist

| Cenário | Ação |
|---------|------|
| Deploy com bug crítico | Reverter para commit anterior via Vercel/Railway dashboard |
| Migration com dados corrompidos | Executar migration down + restaurar backup |
| Performance degradada | Reverter deploy + investigar com APM |
| Secrets expostos | Rotacionar TODAS as credentials imediatamente |

## Anti-patterns

| Anti-pattern | Correção |
|-------------|----------|
| Deploy direto em prod sem staging | SEMPRE validar em staging/preview primeiro |
| CORS com `origin: '*'` | Especificar domínio exato do frontend |
| Secrets no código | Variáveis de ambiente + .env.example |
| Sem health check | /api/health verificando DB + dependências |
| Sem monitoramento | Sentry (erros) + uptime monitor (disponibilidade) |
| Rollback não testado | Testar processo de rollback em staging regularmente |
