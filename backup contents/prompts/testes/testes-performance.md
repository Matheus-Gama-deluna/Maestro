# Prompt: Testes de Performance

> **Quando usar**: Antes de ir para produção, ou ao identificar gargalos
> **Especialista**: [Performance e Escalabilidade](../../02-especialistas/Especialista%20em%20Performance%20e%20Escalabilidade.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura e endpoints
- Requisitos de performance (SLAs/SLOs)

Após gerar, salve o resultado em:
- `tests/performance/` - Scripts de teste
- `docs/10-performance/baseline.md` - Resultados

---

## Prompt Completo

```text
Atue como especialista em testes de performance e load testing.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Stack Tecnológica

- Backend: [Framework/Linguagem]
- Banco de dados: [Tipo]
- Cache: [Redis/Memcached/Nenhum]
- Infra: [Cloud provider, região]

## Endpoints a Testar

| Endpoint | Método | Criticidade | SLA (p95) |
|----------|--------|-------------|-----------|
| /api/auth/login | POST | Alta | 200ms |
| /api/products | GET | Alta | 100ms |
| /api/orders | POST | Crítica | 500ms |

## Requisitos de Performance

- Usuários simultâneos esperados: [número]
- Requests por segundo (RPS): [número]
- Latência p95 aceitável: [ms]
- Latência p99 aceitável: [ms]
- Taxa de erro aceitável: [%]

## Ferramenta

- [ ] k6
- [ ] Artillery
- [ ] JMeter
- [ ] Locust
- [ ] Gatling

---

## Sua Missão

Gere testes de performance completos:

### 1. Estrutura do Projeto

```
tests/performance/
├── scripts/
│   ├── smoke.js
│   ├── load.js
│   ├── stress.js
│   └── soak.js
├── scenarios/
│   ├── auth-flow.js
│   └── checkout-flow.js
├── lib/
│   ├── helpers.js
│   └── config.js
├── data/
│   └── users.csv
└── results/
    └── .gitkeep
```

### 2. Configuração Base (k6)

```javascript
// lib/config.js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const thresholds = {
  http_req_duration: ['p(95)<200', 'p(99)<500'],
  http_req_failed: ['rate<0.01'],  // < 1% de erro
  http_reqs: ['rate>100'],          // > 100 RPS
};

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// lib/helpers.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, defaultHeaders } from './config.js';

export function login(email, password) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: defaultHeaders }
  );
  
  check(res, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });
  
  return res.json('token');
}

export function authenticatedRequest(token) {
  return {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`,
  };
}
```

### 3. Smoke Test (Verificação Básica)

```javascript
// scripts/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../lib/config.js';
import { login } from '../lib/helpers.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check ok': (r) => r.status === 200,
  });

  // Login
  const token = login('test@example.com', 'Test123!');
  
  // Endpoint protegido
  res = http.get(`${BASE_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(res, {
    'authenticated request ok': (r) => r.status === 200,
  });

  sleep(1);
}
```

### 4. Load Test (Carga Normal)

```javascript
// scripts/load.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, thresholds, defaultHeaders } from '../lib/config.js';
import { login, authenticatedRequest } from '../lib/helpers.js';

// Custom metrics
const ordersCreated = new Counter('orders_created');
const orderDuration = new Trend('order_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '5m', target: 50 },   // Stay at 50 VUs
    { duration: '2m', target: 100 },  // Ramp up more
    { duration: '5m', target: 100 },  // Stay at 100 VUs
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    orders_created: ['count>100'],
    order_duration: ['p(95)<1000'],
  },
};

export function setup() {
  // Preparar dados de teste
  const token = login('loadtest@example.com', 'Test123!');
  return { token };
}

export default function (data) {
  const headers = authenticatedRequest(data.token);
  
  group('browsing', () => {
    // Listar produtos
    let res = http.get(`${BASE_URL}/api/products`, { headers });
    check(res, {
      'products loaded': (r) => r.status === 200,
      'has products': (r) => r.json('data').length > 0,
    });
    
    sleep(Math.random() * 2); // Think time
    
    // Ver detalhes
    res = http.get(`${BASE_URL}/api/products/1`, { headers });
    check(res, { 'product detail ok': (r) => r.status === 200 });
  });

  group('checkout', () => {
    const start = Date.now();
    
    // Criar pedido
    const orderData = {
      items: [{ productId: 1, quantity: 1 }],
      addressId: 1,
    };
    
    const res = http.post(
      `${BASE_URL}/api/orders`,
      JSON.stringify(orderData),
      { headers }
    );
    
    const success = check(res, {
      'order created': (r) => r.status === 201,
    });
    
    if (success) {
      ordersCreated.add(1);
    }
    
    orderDuration.add(Date.now() - start);
  });

  sleep(1);
}
```

### 5. Stress Test (Encontrar Limite)

```javascript
// scripts/stress.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../lib/config.js';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },  // Acima do esperado
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },  // Estressar
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },   // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // Mais tolerante
    http_req_failed: ['rate<0.10'],     // Até 10% de erro
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'status is 200 or 503': (r) => [200, 503].includes(r.status),
  });
  sleep(0.5);
}
```

### 6. Soak Test (Longa Duração)

```javascript
// scripts/soak.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../lib/config.js';
import { login, authenticatedRequest } from '../lib/helpers.js';

export const options = {
  stages: [
    { duration: '5m', target: 50 },   // Ramp up
    { duration: '4h', target: 50 },   // 4 horas de carga constante
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

// Detecção de memory leak: monitorar métricas do servidor
// durante a execução deste teste
```

### 7. Cenário de Fluxo Realista

```javascript
// scenarios/checkout-flow.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { BASE_URL } from '../lib/config.js';

// Carregar dados de usuários de CSV
const users = new SharedArray('users', function () {
  return open('../data/users.csv').split('\n').slice(1).map(line => {
    const [email, password] = line.split(',');
    return { email, password };
  });
});

export const options = {
  scenarios: {
    checkout_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 20 },
        { duration: '10m', target: 20 },
        { duration: '5m', target: 0 },
      ],
    },
  },
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];
  
  group('1. Login', () => {
    const res = http.post(`${BASE_URL}/api/auth/login`, 
      JSON.stringify(user),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, { 'login ok': (r) => r.status === 200 });
    return res.json('token');
  });
  
  sleep(2); // Thinking time
  
  group('2. Browse products', () => {
    http.get(`${BASE_URL}/api/products`);
    sleep(3);
    http.get(`${BASE_URL}/api/products/featured`);
    sleep(2);
  });
  
  group('3. Add to cart', () => {
    http.post(`${BASE_URL}/api/cart/items`, 
      JSON.stringify({ productId: 1, quantity: 1 })
    );
    sleep(1);
  });
  
  group('4. Checkout', () => {
    http.get(`${BASE_URL}/api/cart`);
    sleep(2);
    http.post(`${BASE_URL}/api/orders`, JSON.stringify({ /* ... */ }));
  });
  
  sleep(5);
}
```

### 8. Análise de Resultados

```javascript
// handleSummary para relatório customizado
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    duration: data.state.testRunDurationMs,
    metrics: {
      http_reqs: data.metrics.http_reqs?.values?.count || 0,
      http_req_duration_p95: data.metrics.http_req_duration?.values['p(95)'],
      http_req_duration_p99: data.metrics.http_req_duration?.values['p(99)'],
      http_req_failed_rate: data.metrics.http_req_failed?.values?.rate,
    },
    thresholds: data.thresholds,
  };

  return {
    'results/summary.json': JSON.stringify(summary, null, 2),
    'results/report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
```

### 9. Comandos e CI

```bash
# Executar testes
k6 run scripts/smoke.js
k6 run scripts/load.js --env BASE_URL=https://staging.example.com
k6 run scripts/stress.js --out json=results/stress.json

# Com métricas para Grafana
k6 run scripts/load.js --out influxdb=http://localhost:8086/k6
```

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * *'  # Diário às 6h

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/performance/scripts/load.js
          flags: --env BASE_URL=${{ secrets.STAGING_URL }}
```
```

---

## Checklist Pós-Geração

- [ ] Smoke test criado (verificação rápida)
- [ ] Load test com cenário realista
- [ ] Stress test para encontrar limites
- [ ] Soak test para detecção de leaks (opcional)
- [ ] Thresholds definidos (latência, erro, RPS)
- [ ] Custom metrics para métricas de negócio
- [ ] Think times realistas entre requests
- [ ] Dados de teste variados (CSV/JSON)
- [ ] handleSummary para relatórios
- [ ] CI configurado para execução regular
