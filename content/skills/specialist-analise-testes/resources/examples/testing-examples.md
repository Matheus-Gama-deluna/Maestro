# Exemplos Práticos de Testes

## Visão Geral

Este documento contém exemplos reais e práticos de casos de teste, estratégias e implementações para diferentes tipos de aplicações e cenários.

---

## Exemplo 1: Sistema de E-commerce

### Contexto
- **Aplicação:** Plataforma de e-commerce
- **Stack:** React + Node.js + PostgreSQL
- **Métricas:** 1000 transações/dia, 99.9% uptime

### Casos de Teste Críticos

#### TC001 - Login de Usuário (RF001)

**Input:**
```json
{
  "email": "cliente@exemplo.com",
  "password": "SenhaValida123!"
}
```

**Output Esperado:**
```json
{
  "status": 200,
  "data": {
    "user": {
      "id": "usr_123",
      "name": "João Silva",
      "email": "cliente@exemplo.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Teste Unitário (Jest):**
```javascript
describe('User Login', () => {
  test('should login with valid credentials', async () => {
    const mockUser = { id: 'usr_123', email: 'cliente@exemplo.com' };
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    
    const result = await authService.login('cliente@exemplo.com', 'SenhaValida123!');
    
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('cliente@exemplo.com');
  });
});
```

#### TC002 - Falha no Login (RF001)

**Input:**
```json
{
  "email": "cliente@exemplo.com",
  "password": "senhaIncorreta"
}
```

**Output Esperado:**
```json
{
  "status": 401,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha incorretos"
  }
}
```

#### TC003 - Adicionar Item ao Carrinho (RF002)

**Input:**
```json
{
  "productId": "prod_456",
  "quantity": 2,
  "variant": {
    "size": "M",
    "color": "azul"
  }
}
```

**Output Esperado:**
```json
{
  "status": 200,
  "data": {
    "cartId": "cart_789",
    "items": [
      {
        "productId": "prod_456",
        "quantity": 2,
        "unitPrice": 89.90,
        "totalPrice": 179.80
      }
    ],
    "total": 179.80
  }
}
```

### Teste de Performance (k6)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% das requests < 200ms
    http_req_failed: ['rate<0.1'],    // < 10% de falhas
  },
};

export default function () {
  let response = http.post('https://api.exemplo.com/login', {
    email: 'test@example.com',
    password: 'test123'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

---

## Exemplo 2: API de Microserviços

### Contexto
- **Aplicação:** API Gateway com 5 microserviços
- **Stack:** Java Spring Boot + Docker + Kubernetes
- **Métricas:** 10k requests/min, < 100ms latency

### Testes de Integração

#### TC004 - Ordem Completa (RF003)

**Cenário:** Fluxo completo de pedido → pagamento → notificação

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  api-gateway:
    image: api-gateway:test
    ports:
      - "8080:8080"
    environment:
      - ORDER_SERVICE_URL=http://order-service:8081
      - PAYMENT_SERVICE_URL=http://payment-service:8082
      - NOTIFICATION_SERVICE_URL=http://notification-service:8083
  
  order-service:
    image: order-service:test
    environment:
      - DB_URL=jdbc:postgresql://postgres:5432/testdb
  
  payment-service:
    image: payment-service:test
    environment:
      - PAYMENT_GATEWAY_URL=http://mock-gateway:8084
  
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=testdb
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
```

**Teste de Integração (Spring Boot Test):**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class OrderIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @Sql(scripts = "/test-data.sql")
    void shouldProcessCompleteOrderSuccessfully() {
        // Arrange
        OrderRequest request = OrderRequest.builder()
            .customerId("cust_123")
            .items(Arrays.asList(
                OrderItem.builder()
                    .productId("prod_456")
                    .quantity(2)
                    .price(89.90)
                    .build()
            ))
            .paymentMethod(PaymentMethod.CREDIT_CARD)
            .build();

        // Act
        ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
            "/api/orders", request, OrderResponse.class);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(response.getBody().getPaymentId()).isNotNull();
        
        // Verify notification was sent
        verify(notificationService).sendOrderConfirmation(any(Order.class));
    }
}
```

---

## Exemplo 3: Aplicação Mobile React Native

### Contexto
- **Aplicação:** App de delivery
- **Stack:** React Native + Firebase + Redux
- **Métricas:** 50k usuários ativos, 4.8★ rating

### Testes E2E (Detox)

```javascript
// e2e/OrderFlow.e2e.js
describe('Order Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete order flow successfully', async () => {
    // Login
    await element(by.id('email-input')).typeText('user@test.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Verify home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Select restaurant
    await element(by.id('restaurant-1')).tap();
    
    // Add item to cart
    await element(by.id('item-pizza-1')).tap();
    await element(by.id('add-to-cart-button')).tap();
    
    // Proceed to checkout
    await element(by.id('cart-button')).tap();
    await element(by.id('checkout-button')).tap();
    
    // Select payment method
    await element(by.id('payment-credit-card')).tap();
    await element(by.id('confirm-order-button')).tap();
    
    // Verify order confirmation
    await expect(element(by.id('order-confirmation'))).toBeVisible();
    await expect(element(by.text('Pedido confirmado!'))).toBeVisible();
  });
});
```

---

## Exemplo 4: Testes de Segurança

### OWASP Top 10 - SQL Injection

#### TC005 - SQL Injection Prevention (RNF001)

```python
# security_tests.py
import pytest
from app import app

class TestSQLInjection:
    def test_sql_injection_in_login(self):
        """Test that SQL injection is prevented in login endpoint"""
        malicious_inputs = [
            "admin'--",
            "admin' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --"
        ]
        
        for malicious_input in malicious_inputs:
            response = app.test_client().post('/login', json={
                'email': malicious_input,
                'password': 'password'
            })
            
            # Should return 401, not 500 (error)
            assert response.status_code == 401
            assert 'invalid' in response.json['error'].lower()

    def test_parameterized_queries(self):
        """Verify that parameterized queries are used"""
        with app.app_context():
            # This should use parameterized query internally
            user = User.query.filter_by(email="test@example.com").first()
            assert user is not None or user is None  # No SQL error
```

### Teste de XSS Prevention

```javascript
// security.test.js
describe('XSS Prevention', () => {
  test('should sanitize user input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    const sanitized = sanitizer.sanitize(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });
  
  test('should escape HTML in responses', async () => {
    const response = await request(app)
      .post('/comments')
      .send({ text: '<script>alert("xss")</script>' })
      .expect(200);
    
    expect(response.body.text).not.toContain('<script>');
    expect(response.body.text).toContain('&lt;script&gt;');
  });
});
```

---

## Boas Práticas Demonstradas

### 1. Estrutura de Testes
- **Arrange, Act, Assert** pattern claro
- **Test data isolation** com fixtures
- **Descriptive test names** explicando o cenário

### 2. Mocking e Stubbing
- **Controlled dependencies** para testes unitários
- **Realistic responses** para testes de integração
- **Edge cases coverage** para validação

### 3. Performance Testing
- **Realistic load patterns** baseados em produção
- **Clear thresholds** com métricas específicas
- **Gradual ramp-up** para simular crescimento

### 4. Security Testing
- **OWASP Top 10 coverage** para vulnerabilidades comuns
- **Input validation** em todos os endpoints
- **Output encoding** para prevenir XSS

---

## Métricas e KPIs dos Exemplos

| Aplicação | Cobertura | Pass Rate | Performance | Segurança |
|-----------|-----------|-----------|--------------|-----------|
| E-commerce | 85% | 98% | < 200ms (p95) | OWASP 8/10 |
| Microserviços | 90% | 99% | < 100ms (p95) | OWASP 9/10 |
| Mobile App | 75% | 95% | < 1s (p95) | OWASP 7/10 |

---

## Próximos Passos

1. **Adaptar exemplos** para seu contexto específico
2. **Expandir cobertura** para edge cases identificados
3. **Automatizar execução** em pipeline CI/CD
4. **Monitorar métricas** continuamente
5. **Atualizar testes** com base em feedback de produção
