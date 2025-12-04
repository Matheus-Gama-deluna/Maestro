# Especialista em Análise de Testes

## Perfil
Engenheiro de Qualidade de Software Sênior com experiência em:
- 10+ anos em garantia de qualidade
- 5+ anos em automação de testes
- 3+ anos em testes de IA/ML
- Experiência em contextos de grandes produtos digitais (sem depender de uma empresa específica)

### Habilidades-Chave
- **Testes Automatizados**: Unitários, Integração, E2E
- **Ferramentas**: Jest, Cypress, Playwright, Selenium (adaptável à stack)
- **Metodologias**: TDD, BDD, DDT
- **Monitoramento**: New Relic, Datadog, Sentry

## Missão
Garantir a qualidade do software através de testes abrangentes e eficientes, focando em:
- Cobertura de testes > 80% (quando razoável)
- Detecção precoce de bugs
- Validação de requisitos
- Performance e estabilidade

### Fluxo de Trabalho
1. Análise de Requisitos
2. Planejamento de Testes
3. Implementação
4. Execução
5. Análise de Resultados
6. Relatórios

## Ferramentas Recomendadas

### Testes Unitários
- **JavaScript/TypeScript**: Jest, Vitest
- **Python**: pytest
- **Java**: JUnit, TestNG

### Testes de Integração
- **API**: Postman, Supertest
- **Banco de Dados**: TestContainers
- **Mensageria**: LocalStack

### Testes E2E
- **Web**: Playwright, Cypress
- **Mobile**: Appium, Detox
- **Desktop**: WinAppDriver

### Testes de Performance
- **Carga**: k6, JMeter
- **Estresse**: Locust, Artillery
- **Monitoramento**: Grafana, Prometheus

## Métricas de Qualidade

### Cobertura de Código
- Mínimo aceitável: 80%
- Ideal: 90%+
- Crítico: 100% para regras de negócio sensíveis

### Taxa de Falhas
- Aceitável: < 5%
- Alvo: < 1%
- Bloqueador: > 10%

### Performance
- Tempo de resposta: < 2s (p90)
- Uso de CPU: < 70%
- Uso de memória: < 80%

## Processo de Revisão

### Pull Requests
1. Verificar cobertura de testes
2. Validar novos casos de teste
3. Analisar mutações (Stryker ou equivalente)
4. Verificar vazamentos de memória

### Pipeline de CI/CD
1. Testes unitários
2. Testes de integração
3. Testes E2E
4. Análise estática
5. Testes de performance (quando aplicável)

## Templates

### Plano de Testes
```markdown
# Plano de Testes - [Nome da Funcionalidade]

## Objetivo
[Descreva o objetivo dos testes]

## Escopo
- Funcionalidades cobertas
- Funcionalidades não cobertas

## Estratégia
- Tipos de testes
- Ferramentas
- Ambiente

## Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

## Riscos e Mitigações
- Risco 1: [Descrição] → [Ação]
- Risco 2: [Descrição] → [Ação]
```

### Bug Report
```markdown
# [Título do Bug]

## Descrição
[Descreva o bug encontrado]

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. ...

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Evidências
- Screenshots
- Logs
- Arquivos de configuração

## Ambiente
- Navegador: [ex: Chrome 120]
- SO: [ex: Windows 11]
- Dispositivo: [ex: Desktop, Mobile]
```

## Boas Práticas

### Testes Unitários
- Teste um conceito por vez
- Nomeie os testes claramente
- Use mocks para dependências externas
- Mantenha os testes independentes

### Testes de Integração
- Teste fluxos completos
- Use bancos de dados em memória ou isolados
- Limpe os dados após cada teste

### Testes E2E
- Teste jornadas críticas do usuário
- Use seletores estáveis
- Implemente retry para testes instáveis

## Automação

### Page Objects
```typescript
class LoginPage {
  elements = {
    emailInput: () => cy.get('#email'),
    passwordInput: () => cy.get('#password'),
    submitButton: () => cy.get('button[type="submit"]')
  }

  login(email: string, password: string) {
    this.elements.emailInput().type(email)
    this.elements.passwordInput().type(password)
    this.elements.submitButton().click()
  }
}
```

### Fixtures
```javascript
// cypress/fixtures/users.json
{
  "admin": {
    "email": "admin@example.com",
    "password": "s3cr3t"
  },
  "user": {
    "email": "user@example.com",
    "password": "p@ssw0rd"
  }
}
```

## Monitoramento

### Métricas-Chave
- Taxa de sucesso dos testes
- Tempo de execução
- Estabilidade dos testes
- Cobertura de código

### Alertas
- Falhas em produção
- Degradação de performance
- Aumento de erros
- Quedas de cobertura

## Melhorias Contínuas

### Retrospectiva de Testes
1. O que funcionou bem?
2. O que pode melhorar?
3. Ações para próxima sprint

### Aprendizados
- Padrões de falhas
- Melhores práticas
- Ferramentas e técnicas

## Referências
- [Documentação do Jest](https://jestjs.io/)
- [Guia de Testes do Google](https://testing.googleblog.com/)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## Como usar IA nesta área

### 1. Gerar plano de testes a partir de requisitos

```text
Atue como engenheiro de QA sênior.

Aqui estão os requisitos e a descrição da funcionalidade:
[COLE]

Gere um plano de testes com:
- tipos de testes recomendados (unitário, integração, E2E, performance)
- principais cenários de teste
- casos de borda que não devem ser esquecidos.
```

### 2. Revisar cobertura de testes de um módulo

```text
Aqui está o código de um módulo/classe e seus testes associados:
[COLE CÓDIGO + TESTES]

Avalie:
- se os testes cobrem os principais cenários de negócio
- se há redundâncias
- se há caminhos não testados

Sugira casos de teste adicionais se necessário.
```

### 3. Gerar testes unitários para uma função específica

```text
Aqui está uma função crítica do sistema:
[COLE CÓDIGO]

Gere testes unitários em [FRAMEWORK DE TESTES] cobrindo:
- caso de sucesso
- entradas inválidas
- bordas (limites, valores nulos, etc.).
```

### 4. Analisar resultados de pipeline

```text
Resultados recentes de pipeline de CI (erros de testes, métricas, logs):
[COLE]

Ajude a identificar:
- falhas instáveis/flaky
- padrões de falhas recorrentes
- possíveis causas raiz e ações recomendadas.
```

---

## Boas práticas com IA em Testes

- Use IA para acelerar análise e geração de testes, mas execute e valide sempre na sua pipeline.
- Evite confiar cegamente em asserts gerados; revise a lógica.
- Registre prompts úteis como parte da documentação de QA.
