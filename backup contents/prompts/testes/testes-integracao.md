# Prompt: Testes de Integração

> **Quando usar**: Após testes unitários, para validar interação entre componentes
> **Especialista**: [Análise de Testes](../../02-especialistas/Especialista%20em%20Análise%20de%20Testes.md)
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Componentes e integrações
- Código dos serviços/repositórios a testar

Após gerar, salve os testes em:
- `tests/integration/` ou similar na estrutura do projeto

---

## Prompt Completo

```text
Atue como especialista em testes de integração.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Stack Tecnológica

- Backend: [Framework/Linguagem]
- Banco de dados: [PostgreSQL/MySQL/MongoDB]
- ORM: [Prisma/TypeORM/Sequelize/Eloquent]
- APIs externas: [Liste integrações]
- Framework de testes: [Jest/Vitest/PHPUnit/JUnit/pytest]

## Componentes a Testar

- Repositórios/DAOs: [Liste classes de acesso a dados]
- Serviços: [Liste serviços que interagem com outros]
- APIs: [Endpoints que precisam de teste de integração]
- Integrações externas: [Gateways de pagamento, APIs de terceiros]

## Código a Testar (opcional)

```[LINGUAGEM]
[COLE O CÓDIGO DO SERVIÇO/REPOSITÓRIO]
```

---

## Sua Missão

Gere testes de integração completos:

### 1. Setup do Ambiente de Testes

#### Banco de Dados de Teste
```[LINGUAGEM]
// Opção 1: Banco em memória (rápido, menos realista)
// SQLite in-memory, H2, etc

// Opção 2: Testcontainers (mais realista)
// Container Docker com PostgreSQL/MySQL real

// Opção 3: Banco dedicado de teste
// Mesmo tipo de produção, dados isolados
```

#### Configuração do Framework
```[LINGUAGEM]
// Setup e teardown global
// Exemplo: Jest config, pytest fixtures, etc
```

### 2. Testes de Repositório/DAO

```[LINGUAGEM]
describe('UserRepository Integration', () => {
  // Setup: conectar ao banco de teste
  beforeAll(async () => {
    // Inicializar conexão
    // Rodar migrations
  });

  // Teardown: limpar dados entre testes
  beforeEach(async () => {
    // Truncar tabelas ou usar transação
  });

  afterAll(async () => {
    // Fechar conexão
  });

  describe('create', () => {
    it('should persist user to database', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test' };
      
      // Act
      const user = await repository.create(userData);
      
      // Assert
      expect(user.id).toBeDefined();
      
      // Verificar no banco diretamente
      const persisted = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
      expect(persisted.email).toBe(userData.email);
    });
  });

  describe('findByEmail', () => {
    it('should return null for non-existent email', async () => {});
    it('should return user for existing email', async () => {});
  });

  describe('update', () => {
    it('should update and persist changes', async () => {});
    it('should throw for non-existent user', async () => {});
  });

  describe('delete', () => {
    it('should remove from database', async () => {});
    it('should cascade delete related records', async () => {});
  });
});
```

### 3. Testes de Serviço com Dependências

```[LINGUAGEM]
describe('OrderService Integration', () => {
  // Dependências reais (banco) + mocks (APIs externas)
  let orderService: OrderService;
  let orderRepository: OrderRepository;  // Real
  let paymentGateway: PaymentGateway;    // Mock
  let emailService: EmailService;         // Mock ou real

  beforeAll(async () => {
    // Injetar dependências reais onde possível
    orderRepository = new OrderRepository(testDatabase);
    
    // Mock apenas integrações externas
    paymentGateway = mockPaymentGateway();
    
    orderService = new OrderService(orderRepository, paymentGateway);
  });

  describe('createOrder', () => {
    it('should create order and process payment', async () => {
      // Arrange
      const orderData = { items: [...], userId: 1 };
      paymentGateway.charge.mockResolvedValue({ success: true });

      // Act
      const order = await orderService.createOrder(orderData);

      // Assert
      expect(order.status).toBe('PAID');
      expect(paymentGateway.charge).toHaveBeenCalledWith(/* ... */);
      
      // Verificar persistência
      const persisted = await orderRepository.findById(order.id);
      expect(persisted).toBeDefined();
    });

    it('should rollback on payment failure', async () => {
      paymentGateway.charge.mockResolvedValue({ success: false });

      await expect(orderService.createOrder(orderData))
        .rejects.toThrow('Payment failed');

      // Verificar que não persistiu
      const orders = await orderRepository.findByUserId(userId);
      expect(orders).toHaveLength(0);
    });
  });
});
```

### 4. Testes de API (HTTP)

```[LINGUAGEM]
describe('POST /api/users', () => {
  // Usar supertest, httpx, ou similar
  let app;

  beforeAll(async () => {
    app = await createTestApp();  // App com banco de teste
  });

  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', password: 'secure123' })
      .expect(201);

    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.password).toBeUndefined();  // Não expor senha
    
    // Verificar persistência
    const user = await db.query('SELECT * FROM users WHERE email = ?', ['test@example.com']);
    expect(user).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    // Arrange: criar usuário
    await createUser({ email: 'existing@example.com' });

    // Act & Assert
    await request(app)
      .post('/api/users')
      .send({ email: 'existing@example.com', password: 'test123' })
      .expect(409);
  });

  it('should validate request body', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'invalid-email' })
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toContainEqual(
          expect.objectContaining({ field: 'email' })
        );
      });
  });
});
```

### 5. Testcontainers (Recomendado)

```[LINGUAGEM]
// Exemplo com PostgreSQL
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('Database Integration with Testcontainers', () => {
  let container;
  let db;

  beforeAll(async () => {
    // Iniciar container PostgreSQL
    container = await new PostgreSqlContainer()
      .withDatabase('testdb')
      .withUsername('test')
      .withPassword('test')
      .start();

    // Conectar ao container
    db = await createConnection({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: 'testdb',
      username: 'test',
      password: 'test',
    });

    // Rodar migrations
    await runMigrations(db);
  });

  afterAll(async () => {
    await db.close();
    await container.stop();
  });

  it('should work with real PostgreSQL', async () => {
    // Teste com banco PostgreSQL real rodando em container
  });
});
```

### 6. Mocking de APIs Externas

```[LINGUAGEM]
// Usar nock, WireMock, ou mock-service-worker
import nock from 'nock';

describe('StripePaymentGateway Integration', () => {
  beforeEach(() => {
    // Mock da API do Stripe
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(200, {
        id: 'ch_mock123',
        status: 'succeeded',
        amount: 1000,
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should process charge successfully', async () => {
    const gateway = new StripePaymentGateway(testApiKey);
    
    const result = await gateway.charge({
      amount: 1000,
      currency: 'brl',
      source: 'tok_visa',
    });

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('ch_mock123');
  });

  it('should handle Stripe errors', async () => {
    nock.cleanAll();
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(402, {
        error: { code: 'card_declined', message: 'Card declined' }
      });

    await expect(gateway.charge(chargeData))
      .rejects.toThrow('Card declined');
  });
});
```

### 7. Padrões e Boas Práticas

#### Isolamento
- Cada teste deve ser independente
- Usar transações com rollback ou truncar tabelas
- Não compartilhar estado entre testes

#### Dados de Teste
```[LINGUAGEM]
// Factory pattern para criar dados
const userFactory = {
  build: (overrides = {}) => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    ...overrides,
  }),
  create: async (overrides = {}) => {
    return repository.create(userFactory.build(overrides));
  },
};

// Uso
const user = await userFactory.create({ role: 'admin' });
```

#### Assertions Específicas
```[LINGUAGEM]
// Verificar estado do banco
expect(await countUsers()).toBe(1);

// Verificar side effects
expect(emailService.send).toHaveBeenCalledWith(
  expect.objectContaining({ to: 'user@example.com' })
);

// Verificar timestamps
expect(user.createdAt).toBeInstanceOf(Date);
expect(user.updatedAt).toBeAfter(user.createdAt);
```
```

---

## Exemplo de Uso

```text
Atue como especialista em testes de integração.

## Contexto

API de e-commerce com NestJS.

## Stack

- Backend: NestJS + TypeScript
- Banco: PostgreSQL
- ORM: Prisma
- Framework: Jest
- Integrações: Stripe, SendGrid

## Componentes

- OrderRepository
- OrderService (usa OrderRepository + PaymentGateway)
- POST /api/orders endpoint

## Código

@Injectable()
export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private paymentGateway: PaymentGateway,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepo.create(dto);
    const payment = await this.paymentGateway.charge(order.total);
    return this.orderRepo.updateStatus(order.id, payment.success ? 'PAID' : 'FAILED');
  }
}
```

---

## Checklist Pós-Geração

- [ ] Setup de banco de teste configurado
- [ ] Testcontainers ou banco em memória funcionando
- [ ] Testes de repositório com CRUD completo
- [ ] Testes de serviço com mocks de APIs externas
- [ ] Testes de API HTTP (endpoints)
- [ ] Factories para geração de dados
- [ ] Isolamento entre testes garantido
- [ ] Cleanup após testes
- [ ] CI configurado para rodar testes de integração
