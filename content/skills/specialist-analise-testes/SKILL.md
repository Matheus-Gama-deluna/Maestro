---
name: specialist-analise-testes
description: Especialista em estratégia de testes com pirâmide completa e automação de qualidade.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Análise de Testes · Skill do Especialista

## Missão
Definir estratégia abrangente de testes cobrindo pirâmide completa (70/20/10), automação de qualidade e métricas de cobertura, garantindo detecção precoce de bugs e entregas com qualidade.

## Quando ativar
- **Fase:** Fase 9 · Análise de Testes
- **Workflows recomendados:** /maestro, /implementar-historia, /corrigir-bug
- **Gatilho:** Após definição da arquitetura e antes da implementação massiva
- **Use quando:** Precisar definir estratégia de testes para novas funcionalidades ou refatorações críticas

## Inputs obrigatórios
- Requisitos funcionais e não funcionais (`docs/02-requisitos/requisitos.md`)
- Critérios de aceite (`docs/02-requisitos/criterios-aceite.md`)
- Arquitetura definida (`docs/06-arquitetura/arquitetura.md`)
- CONTEXTO.md com restrições e tecnologias
- Histórico de bugs conhecidos (se existir)
- Métricas de performance (se aplicável)

## Outputs gerados
- `docs/09-testes/plano-testes.md` — estratégia completa de testes
- `docs/09-testes/matriz-rastreabilidade.md` — mapeamento requisitos x testes
- Suite de casos de teste priorizados por criticidade
- Estratégia de automação com ferramentas selecionadas
- Métricas de qualidade e KPIs definidos
- Pipeline de CI/CD configurado para testes

## Quality Gate
- **Score mínimo:** 75 pontos para avanço
- **Casos de teste:** 100% dos requisitos críticos cobertos
- **Estratégia:** Pirâmide de testes definida (70/20/10)
- **Ferramentas:** Stack de testes selecionada e justificada
- **Cobertura:** Métricas mínimas definidas (≥80% unitários)
- **Pipeline:** CI/CD configurado com gates de qualidade
- **Riscos:** Plano de mitigação para flaky tests

## Processo Obrigatório de Análise

### 1. Análise de Requisitos e Riscos
Analisar cada requisito identificando:
- Funcionalidades críticas para o negócio
- Pontos de falha potenciais e edge cases
- Dependências entre funcionalidades
- Riscos de segurança e performance

### 2. Definição da Estratégia 70/20/10
Configurar pirâmide de testes baseada em:
- **70% Unitários:** Testes rápidos e isolados
- **20% Integração:** APIs, bancos e serviços
- **10% E2E:** Fluxos completos do usuário

Justificar percentuais baseado em:
- Complexidade do sistema
- Risco de negócio
- Time-to-market

### 3. Seleção de Ferramentas por Stack
Para cada camada da stack tecnológica:
- **Unitários:** Framework + Coverage + Mocking
- **Integração:** API testing + Database testing
- **E2E:** Browser automation + Reporting
- **Performance:** Load testing + Monitoring

### 4. Planejamento de Casos de Teste
Para cada requisito crítico:
- **Happy path:** Fluxos de sucesso
- **Negative path:** Erros esperados
- **Edge cases:** Limites e valores extremos
- **Performance:** Carga e estresse
- **Segurança:** Injeção e autorização

## Estrutura do Plano de Testes

### Seções Obrigatórias
1. **Objetivo e Escopo**
   - Funcionalidades cobertas e justificativas
   - Funcionalidades não cobertas com riscos
   - Critérios de aceite do plano

2. **Estratégia de Testes**
   - Pirâmide 70/20/10 detalhada
   - Ferramentas selecionadas por camada
   - Ambiente de execução e frequência

3. **Casos de Teste Priorizados**
   - Criticidade (Alta/Média/Baixa)
   - Complexidade (Simples/Média/Complexa)
   - Frequência (Diário/Semanal/Pontual)

4. **Métricas e KPIs**
   - Cobertura de código (mínimo 80%)
   - Taxa de falhas (< 5% aceitável)
   - Performance benchmarks
   - Tempo de execução

5. **Pipeline de CI/CD**
   - Estágios de teste e paralelização
   - Critérios de bloqueio e aprovação
   - Notificações e alertas

6. **Riscos e Mitigações**
   - Flaky tests e estratégias
   - Ambiente instável
   - Dados de teste e privacidade
   - Dependências externas

## Ferramentas por Stack

### JavaScript/TypeScript
- **Unitários:** Jest + c8 (coverage) + MSW (mocking)
- **Integração:** Jest + Supertest + testcontainers
- **E2E:** Playwright + Allure + parallel execution
- **Performance:** k6 + Artillery + Lighthouse

### Python
- **Unitários:** pytest + pytest-cov + unittest.mock
- **Integração:** pytest + testcontainers + factory_boy
- **E2E:** Playwright Python + pytest-bdd
- **Performance:** locust + pytest-benchmark

### Java/Spring
- **Unitários:** JUnit 5 + Mockito + JaCoCo
- **Integração:** Spring Test + Testcontainers
- **E2E:** Selenium + Rest Assured + Allure
- **Performance:** JMeter + Gatling

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Coverage:** ≥ 80% geral, ≥ 90% regras de negócio
- **Pass Rate:** ≥ 95% em produção
- **Performance:** < 2s (p90) requests críticos
- **Flaky Rate:** < 1% testes automatizados

### Metas de Excelência
- Coverage: ≥ 85%
- Pass Rate: ≥ 99%
- Performance: < 1s (p90)
- Flaky Rate: < 0.1%

### KPIs de Monitoramento
- Tempo médio de execução da suite
- Taxa de bugs escapados
- Custo de manutenção dos testes
- Cobertura de mutação (se aplicável)

## Guardrails Críticos

### Anti-Patterns de Testes
- **NUNCA** teste implementação interna
- **NUNCA** dependa de ordem de execução
- **NUNCA** use dados reais em produção
- **NUNCA** ignore flaky tests
- **NUNCA** teste múltiplas responsabilidades

### Práticas Obrigatórias
- **SEMPRE** teste comportamento, não implementação
- **SEMPRE** isole testes (no shared state)
- **SEMPRE** use dados determinísticos
- **SEMPRE** documente casos complexos
- **SEMPRE** valide edge cases

### Pipeline de CI/CD Padrão
```yaml
stages:
  - test-unit:
      coverage: true
      threshold: 80%
      parallel: 4
  - test-integration:
      services: [db, redis]
      timeout: 5m
      parallel: 2
  - test-e2e:
      parallel: 4
      retry: 2
      timeout: 10m
  - performance:
      load: 100rps
      duration: 5m
      threshold: 2s
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
1. Requisitos completos com critérios de aceite
2. Arquitetura com stack tecnológica definida
3. CONTEXTO.md com restrições e limitações
4. Histórico de bugs e incidentes (se existir)
5. Métricas de performance (se aplicável)

### Prompt de Inicialização
```
Atue como Engenheiro de QA Sênior especialista em estratégia de testes.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Requisitos e critérios de aceite:
[COLE docs/02-requisitos/requisitos.md E criterios-aceite.md]

Arquitetura e stack:
[COLE docs/06-arquitetura/arquitetura.md]

Histórico de qualidade:
[COLE histórico de bugs/incidentes se existir]

Preciso definir estratégia completa de testes 70/20/10, selecionar ferramentas e configurar pipeline CI/CD.
```

### Ao Concluir Esta Fase
1. **Salve o plano** em `docs/09-testes/plano-testes.md`
2. **Crie matriz** em `docs/09-testes/matriz-rastreabilidade.md`
3. **Configure pipeline** de CI/CD com gates
4. **Defina métricas** de monitoramento
5. **Valide o Gate** usando checklist de qualidade
6. **Prepare ambiente** de testes automatizados

## Templates e Recursos

### Templates Disponíveis
- `plano-testes.md` — Estrutura completa do plano
- `matriz-rastreabilidade.md` — Mapeamento requisitos x testes
- `criterios-aceite.md` — Validação de qualidade

### Skills Complementares
- `testing-patterns` — Padrões e boas práticas
- `tdd-workflow` — Desenvolvimento orientado a testes
- `code-review-checklist` — Revisão de código
- `webapp-testing` — Testes específicos web

### Referências Essenciais
- **Especialista original:** `content/specialists/Especialista em Análise de Testes.md`
- **Artefatos alvo:**
  - `docs/09-testes/plano-testes.md`
  - `docs/09-testes/matriz-rastreabilidade.md`
  - Suite de casos priorizados
  - Pipeline de CI/CD configurado

---

## Progressive Disclosure

**Para acesso aos recursos completos:**
- Templates estruturados em `resources/templates/`
- Exemplos práticos em `resources/examples/`
- Checklists de validação em `resources/checklists/`
- Guias técnicos em `resources/reference/`
- Funções MCP em `mcp_functions/` (referência para implementação)

**Nota:** Esta skill é puramente descritiva. Toda automação e execução deve ser implementada via MCP externo.