---
name: specialist-analise-testes
description: Planejamento de testes unitários, integração e E2E com estratégia clara.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Análise de Testes · Skill do Especialista

## Missão
Definir estratégia de testes cobrindo pirâmide completa e métricas de cobertura, garantindo qualidade e detecção precoce de bugs.

## Quando ativar
- Fase: Fase 8 · Testes
- Workflows recomendados: /maestro, /implementar-historia, /corrigir-bug
- Use quando precisar antes da implementação massiva ou refatorações críticas.

## Inputs obrigatórios
- Requisitos (`docs/02-requisitos/requisitos.md`)
- Critérios de Aceite (`docs/02-requisitos/criterios-aceite.md`)
- Arquitetura (`docs/06-arquitetura/arquitetura.md`)
- CONTEXTO.md do projeto
- Riscos conhecidos

## Outputs gerados
- `docs/07-testes/plano-testes.md` — plano completo
- Suite de casos priorizados
- Estratégia de automação
- Métricas de qualidade definidas

## Quality Gate
- Casos de teste catalogados para cada requisito crítico
- Estratégia de teste definida (pirâmide)
- Ferramentas de teste escolhidas
- Cobertura mínima definida
- Testes de edge cases planejados
- Pipeline de CI/CD configurado

## Processo Obrigatório de Análise

### 1. Análise de Requisitos
```text
Com base nos requisitos:
[COLE REQUISITOS]

Identifique para cada requisito:
- Funcionalidades críticas
- Pontos de falha potenciais
- Edge cases importantes
- Dependências entre funcionalidades
```

### 2. Estratégia da Pirâmide de Testes
```text
Defina a distribuição ideal:
- 70% Unitários (rápidos, isolados)
- 20% Integração (APIs, bancos)
- 10% E2E (fluxos completos)

Justifique os percentuais baseado em:
- Complexidade do sistema
- Risco de negócio
- Time-to-market
```

### 3. Seleção de Ferramentas
```text
Para a stack [TECNOLOGIA]:
- Unitários: [FERRAMENTA]
- Integração: [FERRAMENTA]
- E2E: [FERRAMENTA]
- Performance: [FERRAMENTA]

Considere:
- Curva de aprendizado
- Integração com CI/CD
- Suporte da comunidade
```

### 4. Planejamento de Casos
```text
Para cada requisito crítico:
- Happy path (sucesso)
- Negative path (erros esperados)
- Edge cases (limites, vazios)
- Performance (carga, estresse)
- Segurança (injeção, autorização)
```

## Estrutura do Plano de Testes

### Seções Obrigatórias
1. **Objetivo e Escopo**
   - Funcionalidades cobertas
   - Funcionalidades não cobertas (justificativas)
   - Riscos identificados

2. **Estratégia de Testes**
   - Pirâmide de testes (unitários/integração/E2E)
   - Ferramentas selecionadas
   - Ambiente de execução
   - Frequência de execução

3. **Casos de Teste Priorizados**
   - Criticidade (Alta, Média, Baixa)
   - Complexidade (Simples, Média, Complexa)
   - Frequência (Diário, Semanal, Pontual)

4. **Métricas e KPIs**
   - Cobertura de código (mínimo 80%)
   - Taxa de falhas (< 5% aceitável)
   - Performance benchmarks
   - Tempo de execução

5. **Pipeline de CI/CD**
   - Estágios de teste
   - Critérios de bloqueio
   - Notificações e alertas

6. **Riscos e Mitigações**
   - Flaky tests
   - Ambiente instável
   - Dados de teste
   - Dependências externas

## Ferramentas por Stack

### JavaScript/TypeScript
```typescript
// Unitários
{
  "framework": "Jest",
  "coverage": "c8",
  "mocking": "MSW"
}

// E2E
{
  "framework": "Playwright",
  "reporter": "Allure",
  "parallel": true
}
```

### Python
```python
# Unitários
{
  "framework": "pytest",
  "coverage": "pytest-cov",
  "mocking": "unittest.mock"
}

# E2E
{
  "framework": "Playwright Python",
  "fixtures": "conftest.py"
}
```

### Java/Spring
```java
// Unitários
{
  "framework": "JUnit 5",
  "mocking": "Mockito",
  "coverage": "JaCoCo"
}

// E2E
{
  "framework": "Selenium",
  "reports": "Allure"
}
```

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Coverage:** ≥ 80% geral, ≥ 90% para regras de negócio
- **Pass Rate:** ≥ 95% em produção
- **Performance:** < 2s (p90) para requests críticos
- **Flaky Rate:** < 1% para testes automatizados

### Metas de Excelência
- Coverage: ≥ 85%
- Pass Rate: ≥ 99%
- Performance: < 1s (p90)
- Flaky Rate: < 0.1%

## Guardrails Críticos

### Anti-Patterns de Testes
- **NUNCA** teste implementação interna
- **NUNCA** dependa de ordem de execução
- **NUNCA** use dados reais em produção
- **NUNCA** ignore flaky tests

### Práticas Obrigatórias
- **SEMPRE** teste comportamento, não implementação
- **SEMPRE** isole testes (no shared state)
- **SEMPRE** use dados de teste determinísticos
- **SEMPRE** documente casos complexos

### Pipeline de CI/CD
```yaml
stages:
  - test-unit:
      coverage: true
      threshold: 80%
  - test-integration:
      services: [db, redis]
      timeout: 5m
  - test-e2e:
      parallel: 4
      retry: 2
  - performance:
      load: 100rps
      duration: 5m
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Requisitos completos com critérios de aceite
2. Arquitetura com stack definida
3. CONTEXTO.md com restrições
4. Histórico de bugs (se existir)

### Prompt de Continuação
```
Atue como Engenheiro de QA Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Requisitos e critérios de aceite:
[COLE docs/02-requisitos/requisitos.md E criterios-aceite.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

Preciso definir a estratégia de testes e plano de cobertura.
```

### Ao Concluir Esta Fase
1. **Salve o plano** em `docs/07-testes/plano-testes.md`
2. **Configure o pipeline** de CI/CD
3. **Defina métricas** de monitoramento
4. **Valide o Gate** usando checklist
5. **Prepare ambiente** de testes

## Templates Prontos

### Plano de Testes
```markdown
# Plano de Testes - [Funcionalidade]

## Objetivo
Garantir qualidade e cobertura de [funcionalidade]

## Escopo
### Coberto
- [ ] Feature X
- [ ] Feature Y

### Não Coberto
- [ ] Feature Z (justificativa: baixo risco)

## Estratégia
- Unitários: 70% (Jest)
- Integração: 20% (Supertest)
- E2E: 10% (Playwright)

## Critérios de Aceite
- [ ] Coverage ≥ 80%
- [ ] Pass Rate ≥ 95%
- [ ] Performance < 2s
```

### Caso de Teste
```markdown
## TC-001: Login com sucesso

### Descrição
Usuário deve conseguir fazer login com credenciais válidas

### Passos
1. Acessar página de login
2. Inserir email válido
3. Inserir senha válida
4. Clicar em "Entrar"

### Resultado Esperado
- Redirecionado para dashboard
- Token JWT gerado
- Session criada

### Dados de Teste
```json
{
  "email": "test@example.com",
  "password": "ValidPassword123!"
}
```
```

## Skills complementares
- `testing-patterns`
- `tdd-workflow`
- `code-review-checklist`
- `webapp-testing`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Análise de Testes.md`
- **Artefatos alvo:**
  - `docs/07-testes/plano-testes.md`
  - Suite de casos priorizados
  - Pipeline de CI/CD configurado