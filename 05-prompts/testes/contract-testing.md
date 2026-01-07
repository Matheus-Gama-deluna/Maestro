# Prompt: Contract Testing

> **Prioridade**: 🟠 ALTA  
> **Aplicável a**: Microserviços, APIs com múltiplos consumidores, integrações com terceiros

---

## O que é Contract Testing?

Contract testing verifica que **produtor** (API) e **consumidor** (cliente) concordam sobre o contrato de comunicação, sem precisar testar integração completa.

```
Consumer-Driven Contract Testing:
┌──────────────┐         ┌──────────────┐
│   Consumer   │ ──────► │   Producer   │
│  (Frontend)  │ Contract│   (Backend)  │
└──────────────┘         └──────────────┘
       │                        │
       ▼                        ▼
   Gera contrato          Valida contrato
   (expectations)         (implementação)
```

---

## Quando Usar?

| Cenário | Contract Testing? | Justificativa |
|---------|-------------------|---------------|
| Microserviços | ✅ Sim | Evita quebrar consumidores |
| API pública | ✅ Sim | Múltiplos consumidores |
| Frontend + Backend | ✅ Sim | Times diferentes |
| Monolito | ❌ Geralmente não | Testes de integração são suficientes |
| Integração com terceiros | ⚠️ Às vezes | Se terceiro fornece contract |

---

## Prompt Base: Implementar Contract Testing

```text
Atue como engenheiro de QA especialista em contract testing.

Tenho a seguinte arquitetura:
- Produtor: [ex. API de Usuários - Node.js + Express]
- Consumidores: [ex. Frontend React, Mobile App, Serviço B]
- Comunicação: [REST/GraphQL/gRPC/Mensageria]

Ferramenta escolhida: [Pact/Spring Cloud Contract/Specmatic]

Gere uma implementação completa de contract testing:

1. **Setup do Consumer**
   - Como definir expectations
   - Exemplo de teste de contrato
   - Geração do arquivo de contrato

2. **Setup do Producer**
   - Como carregar e validar contratos
   - Exemplo de verificação
   - Integração com CI/CD

3. **Broker/Compartilhamento**
   - Como compartilhar contratos entre times
   - Pact Broker ou alternativa
   - Versionamento de contratos

4. **Workflow de CI/CD**
   - Quando rodar testes de contrato
   - Como bloquear deploy se contrato quebrar
   - Webhooks para notificação

5. **Can-I-Deploy**
   - Verificar compatibilidade antes de deploy
   - Matriz de compatibilidade
```

---

## Prompt: Consumer Test (Pact)

```text
Tenho um serviço consumidor que chama esta API:
[COLE EXEMPLO DE REQUEST/RESPONSE ESPERADO]

Stack do consumidor: [ex. TypeScript + Jest]

Gere um teste Pact que:
1. Define a expectativa do consumidor
2. Gera o arquivo de contrato (pact file)
3. Testa a integração com mock server
4. Publica o contrato no broker
```

---

## Prompt: Provider Verification (Pact)

```text
Tenho uma API que precisa validar contratos de consumidores:
[COLE ESTRUTURA DA API]

Contratos estão em: [broker URL / pasta local]

Stack: [ex. Java + Spring Boot]

Gere:
1. Configuração de verificação de contratos
2. Provider states (setup de dados para cada teste)
3. Integração com CI para rodar em cada PR
4. Relatório de compatibilidade
```

---

## Exemplo Completo: Pact (JavaScript)

### Consumer Test

```typescript
// consumer/tests/userService.pact.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { UserService } from '../src/services/userService';

const { like, eachLike } = MatchersV3;

const provider = new PactV3({
  consumer: 'FrontendApp',
  provider: 'UserAPI',
  dir: './pacts',
});

describe('User API Contract', () => {
  it('should get user by ID', async () => {
    // Arrange: definir expectativa
    await provider
      .given('user 123 exists')
      .uponReceiving('a request for user 123')
      .withRequest({
        method: 'GET',
        path: '/api/users/123',
        headers: {
          Accept: 'application/json',
        },
      })
      .willRespondWith({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: like({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
        }),
      });

    // Act & Assert: rodar contra mock server
    await provider.executeTest(async (mockServer) => {
      const client = new UserService(mockServer.url);
      const user = await client.getUser('123');

      expect(user.id).toBe('123');
      expect(user.name).toBe('John Doe');
    });
  });

  it('should list users', async () => {
    await provider
      .given('users exist')
      .uponReceiving('a request to list users')
      .withRequest({
        method: 'GET',
        path: '/api/users',
      })
      .willRespondWith({
        status: 200,
        body: {
          data: eachLike({
            id: like('1'),
            name: like('User Name'),
            email: like('user@example.com'),
          }),
          total: like(10),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const client = new UserService(mockServer.url);
      const result = await client.listUsers();

      expect(result.data.length).toBeGreaterThan(0);
    });
  });
});
```

### Provider Verification

```typescript
// provider/tests/pactVerification.test.ts
import { Verifier } from '@pact-foundation/pact';
import { app } from '../src/app';

describe('Pact Verification', () => {
  let server: any;

  beforeAll((done) => {
    server = app.listen(3001, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('validates the expectations of FrontendApp', async () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:3001',
      provider: 'UserAPI',
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_SHA,
      
      // Provider states setup
      stateHandlers: {
        'user 123 exists': async () => {
          await seedDatabase({ users: [{ id: '123', name: 'John Doe' }] });
        },
        'users exist': async () => {
          await seedDatabase({ users: generateUsers(5) });
        },
      },
    });

    await verifier.verifyProvider();
  });
});
```

### CI/CD Integration

```yaml
# .github/workflows/contract-test.yml
name: Contract Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  consumer-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run consumer tests
        run: npm run test:pact
        
      - name: Publish pacts to broker
        run: npx pact-broker publish ./pacts \
          --consumer-app-version=${{ github.sha }} \
          --broker-base-url=${{ secrets.PACT_BROKER_URL }} \
          --broker-token=${{ secrets.PACT_BROKER_TOKEN }}

  provider-verify:
    runs-on: ubuntu-latest
    needs: consumer-test
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify provider
        run: npm run test:pact:verify
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_SHA: ${{ github.sha }}
          CI: true

  can-i-deploy:
    runs-on: ubuntu-latest
    needs: provider-verify
    steps:
      - name: Can I Deploy?
        run: npx pact-broker can-i-deploy \
          --pacticipant UserAPI \
          --version ${{ github.sha }} \
          --to-environment production \
          --broker-base-url=${{ secrets.PACT_BROKER_URL }} \
          --broker-token=${{ secrets.PACT_BROKER_TOKEN }}
```

---

## Ferramentas por Stack

| Stack | Ferramenta | Tipo |
|-------|-----------|------|
| **JavaScript/TypeScript** | Pact-JS | Consumer-driven |
| **Java/Kotlin** | Pact-JVM, Spring Cloud Contract | Ambos |
| **Python** | Pact-Python | Consumer-driven |
| **Go** | Pact-Go | Consumer-driven |
| **OpenAPI** | Specmatic, Prism | Schema-based |
| **gRPC** | buf, protovalidate | Schema-based |

---

## Pact Broker

Central para compartilhar contratos:

```bash
# Docker
docker run -d \
  -p 9292:9292 \
  -e PACT_BROKER_DATABASE_URL="sqlite:///pact_broker.sqlite3" \
  pactfoundation/pact-broker

# Ou use Pactflow (SaaS)
```

---

## Checklist

- [ ] Consumer tests gerando contratos
- [ ] Provider verificando contratos
- [ ] Broker configurado para compartilhamento
- [ ] CI/CD rodando testes de contrato
- [ ] can-i-deploy bloqueando deploys incompatíveis
- [ ] Provider states cobrindo cenários
- [ ] Versionamento semântico de contratos

---

## Referências

- [Pact Documentation](https://docs.pact.io/)
- [Contract Testing na Prática](https://martinfowler.com/articles/consumerDrivenContracts.html)
- [Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)
