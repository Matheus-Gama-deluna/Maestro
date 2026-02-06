# Prompt: Testes End-to-End (E2E)

> **Quando usar**: Validar fluxos completos do usuário, do início ao fim
> **Especialista**: [Análise de Testes](../../02-especialistas/Especialista%20em%20Análise%20de%20Testes.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/03-ux/design-doc.md` - Fluxos de usuário
- URL do ambiente de staging/desenvolvimento

Após gerar, salve os testes em:
- `tests/e2e/` ou `e2e/` na raiz do projeto

---

## Prompt Completo

```text
Atue como especialista em testes end-to-end (E2E) e automação de browser.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Stack Frontend

- Framework: [React/Vue/Angular/Next.js]
- Componentes: [Component library usada]
- Autenticação: [Como funciona o login]

## Ferramenta de E2E

- [ ] Cypress
- [ ] Playwright
- [ ] Selenium
- [ ] TestCafe

## Fluxos Críticos a Testar

1. [Fluxo 1 - ex: Cadastro de usuário]
2. [Fluxo 2 - ex: Login e acesso ao dashboard]
3. [Fluxo 3 - ex: Checkout completo]
4. [Fluxo 4 - ex: ...]

## URLs e Ambientes

- Desenvolvimento: [http://localhost:3000]
- Staging: [https://staging.example.com]

---

## Sua Missão

Gere testes E2E completos usando a ferramenta escolhida:

### 1. Estrutura do Projeto

```
e2e/
├── fixtures/
│   ├── users.json
│   └── products.json
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── CheckoutPage.ts
├── support/
│   ├── commands.ts
│   └── helpers.ts
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── checkout/
│   │   └── purchase.spec.ts
│   └── smoke.spec.ts
├── playwright.config.ts
└── package.json
```

### 2. Configuração (Playwright)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Page Object Model

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Senha');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Esqueci minha senha' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// pages/DashboardPage.ts
export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.userMenu = page.getByRole('button', { name: /menu do usuário/i });
    this.logoutButton = page.getByRole('menuitem', { name: 'Sair' });
  }

  async expectWelcome(name: string) {
    await expect(this.welcomeMessage).toContainText(`Olá, ${name}`);
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
```

### 4. Fixtures e Helpers

```typescript
// support/helpers.ts
import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('/dashboard');
}

export async function createTestUser(page: Page) {
  // Criar usuário via API para evitar depender de UI
  const response = await page.request.post('/api/test/users', {
    data: {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      name: 'Test User',
    },
  });
  return response.json();
}

// fixtures/users.json
{
  "validUser": {
    "email": "user@example.com",
    "password": "SecurePass123!"
  },
  "adminUser": {
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }
}
```

### 5. Testes de Autenticação

```typescript
// specs/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import users from '../../fixtures/users.json';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login(users.validUser.email, users.validUser.password);

    // Verificar redirecionamento
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectWelcome('Test User');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('invalid@example.com', 'wrongpassword');

    await loginPage.expectErrorMessage('Email ou senha inválidos');
    await expect(page).toHaveURL('/login');
  });

  test('should persist session after page reload', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.validUser.email, users.validUser.password);
    await expect(page).toHaveURL('/dashboard');

    // Recarregar página
    await page.reload();

    // Deve continuar logado
    await expect(page).toHaveURL('/dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login(users.validUser.email, users.validUser.password);
    await dashboardPage.logout();

    await expect(page).toHaveURL('/login');
  });
});

// specs/auth/register.spec.ts
test.describe('Registro', () => {
  test('should register new user successfully', async ({ page }) => {
    const uniqueEmail = `user-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Novo Usuario');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Senha').fill('SecurePass123!');
    await page.getByLabel('Confirmar senha').fill('SecurePass123!');
    await page.getByRole('checkbox', { name: /termos/i }).check();
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // Verificar sucesso
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Conta criada com sucesso')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Senha').fill('weak');
    await page.getByLabel('Senha').blur();

    await expect(page.getByText(/mínimo 8 caracteres/i)).toBeVisible();
  });
});
```

### 6. Testes de Fluxo de Compra

```typescript
// specs/checkout/purchase.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../../support/helpers';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'user@example.com', 'Test123!');
  });

  test('should complete full purchase flow', async ({ page }) => {
    // 1. Navegar para produtos
    await page.getByRole('link', { name: 'Produtos' }).click();

    // 2. Adicionar produto ao carrinho
    await page.getByTestId('product-card').first().click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(page.getByText('Produto adicionado')).toBeVisible();

    // 3. Ir para carrinho
    await page.getByRole('link', { name: /carrinho/i }).click();
    await expect(page.getByTestId('cart-item')).toHaveCount(1);

    // 4. Prosseguir para checkout
    await page.getByRole('button', { name: 'Finalizar compra' }).click();

    // 5. Preencher endereço
    await page.getByLabel('CEP').fill('01310-100');
    await page.waitForResponse('**/api/address/**');  // Aguardar busca de CEP
    await page.getByLabel('Número').fill('100');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // 6. Selecionar pagamento
    await page.getByLabel('Cartão de crédito').check();
    await page.getByLabel('Número do cartão').fill('4242424242424242');
    await page.getByLabel('Validade').fill('12/28');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Pagar' }).click();

    // 7. Verificar confirmação
    await expect(page.getByText('Pedido confirmado')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('order-number')).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    // ... adicionar produto e ir para checkout

    // Usar cartão que falha
    await page.getByLabel('Número do cartão').fill('4000000000000002');
    await page.getByRole('button', { name: 'Pagar' }).click();

    await expect(page.getByRole('alert')).toContainText('Pagamento recusado');
    // Usuário deve poder tentar novamente
    await expect(page.getByRole('button', { name: 'Pagar' })).toBeEnabled();
  });
});
```

### 7. Testes de Smoke (Críticos)

```typescript
// specs/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Nome do App/);
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('API health check', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
  });
});
```

### 8. Scripts e CI

```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:smoke": "playwright test --grep @smoke",
    "test:e2e:report": "playwright show-report"
  }
}
```

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```
```

---

## Checklist Pós-Geração

- [ ] Page Objects criados para páginas principais
- [ ] Fixtures de dados configurados
- [ ] Testes de autenticação (login, registro, logout)
- [ ] Testes de fluxos críticos de negócio
- [ ] Smoke tests para verificação rápida
- [ ] Configuração multi-browser
- [ ] Screenshots e vídeos em falha
- [ ] CI configurado com artefatos
- [ ] Seletores resilientes (role, label, testid)
- [ ] Timeouts apropriados
