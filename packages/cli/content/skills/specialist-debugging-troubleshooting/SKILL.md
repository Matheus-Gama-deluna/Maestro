---
name: specialist-debugging-troubleshooting
description: Análise de causa raiz e correção segura de bugs.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Debugging e Troubleshooting · Skill do Especialista

## Missão
Reproduzir, analisar e corrigir bugs documentando causa raiz, garantindo correções seguras e duradouras.

## Quando ativar
- Fase: Fase 15 · Debug
- Workflows recomendados: /corrigir-bug, /refatorar-codigo
- Use quando incidentes ou bugs críticos surgem.

## Inputs obrigatórios
- Bug report completo
- Logs e métricas relevantes
- Contexto do código afetado
- Testes existentes
- CONTEXTO.md do projeto

## Outputs gerados
- Bug corrigido e validado
- Root cause documentada
- Testes de regressão
- Runbook de troubleshooting
- Métricas de impacto

## Quality Gate
- Reprodução garantida
- Testes de regressão passando
- Registro no resumo do projeto
- Documentação completa
- Performance não degradada

## Metodologia de Debugging

### 1. Reprodução Isolada
```text
Passos para reprodução:
1. Ambiente isolado (staging/local)
2. Dados de teste consistentes
3. Passos exatos do bug
4. Captura de logs detalhados
5. Identificação do ponto exato de falha
```

### 2. Análise de Causa Raiz (5 Whys)
```text
Exemplo de aplicação:
1. Por que o sistema falhou? → Timeout na API
2. Por que timeout? → Query lenta
3. Por que query lenta? → Índice faltante
4. Por que índice faltante? → Não foi previsto
5. Por que não previsto? → Falha na análise de performance
```

### 3. Correção Segura
```text
Estratégia de correção:
1. Correção mínima e específica
2. Testes automatizados para o bug
3. Testes de regressão
4. Code review focado
5. Deploy com monitoramento
```

## Processo Sistemático

### Fase 1: Coleta de Evidências
- [ ] Bug report detalhado
- [ ] Logs de produção
- [ ] Métricas de performance
- [ ] Screenshots/videos
- [ ] Contexto do usuário

### Fase 2: Reprodução Controlada
- [ ] Ambiente de reprodução
- [ ] Dados de teste consistentes
- [ ] Passos reproduzíveis
- [ ] Captura de estado
- [ ] Isolamento do problema

### Fase 3: Análise Profunda
- [ ] Code review do problema
- [ ] Análise de dependências
- [ ] Verificação de configurações
- [ ] Teste de hipóteses
- [ ] Identificação da causa raiz

### Fase 4: Correção e Validação
- [ ] Implementação da correção
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes de regressão
- [ ] Validação em staging

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** aplique patches sem entender a causa
- **NUNCA** ignore testes de regressão
- **NUNCA** modifique código sem reprodução
- **NUNCA** deploy em produção sem validação

### SEMPRE Faça
- **SEMPRE** reproduza o bug antes de corrigir
- **SEMPRE** documente a causa raiz
- **SEMPRE** adicione testes para o bug
- **SEMPRE** monitore após o deploy

### Ferramentas de Debugging
```javascript
// Logging estruturado
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Debug points
logger.debug('Processing user', { userId, action });
logger.error('Database timeout', { query, duration });
```

## Categorias de Bugs

### 1. Bugs de Lógica
- Condições incorretas
- Algoritmos com falhas
- Edge cases não tratados

### 2. Bugs de Performance
- Queries lentas
- Memory leaks
- N+1 queries

### 3. Bugs de Concorrência
- Race conditions
- Deadlocks
- Inconsistências de estado

### 4. Bugs de Integração
- APIs externas
- Formatos de dados
- Timeout de rede

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Bug report completo
2. Logs relevantes
3. Código afetado
4. CONTEXTO.md com stack

### Prompt de Continuação
```
Atue como Especialista em Debugging.

Bug report:
[COLE BUG REPORT]

Logs e métricas:
[COLE LOGS E MÉTRICAS]

Código afetado:
[COLE CÓDIGO]

Preciso reproduzir, analisar e corrigir este bug.
```

### Ao Concluir Esta Fase
1. **Reproduza** o bug isoladamente
2. **Analise** a causa raiz
3. **Corrija** com testes
4. **Documente** o runbook
5. **Monitore** pós-deploy
6. **Atualize** conhecimentos

## Templates Prontos

### Bug Report Template
```markdown
# Bug Report

## Título
[Título claro e específico]

## Severidade
[Critical/High/Medium/Low]

## Ambiente
- Versão: [versão]
- Browser: [browser e versão]
- OS: [sistema operacional]
- User: [tipo de usuário]

## Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## Resultado Esperado
[O que deveria acontecer]

## Resultado Atual
[O que acontece]

## Screenshots/Videos
[Anexar evidências]

## Logs Relevantes
```
[Colar logs aqui]
```

## Informações Adicionais
[Qualquer informação relevante]
```

### Root Cause Analysis
```markdown
# RCA: [Nome do Bug]

## Sumário
[Breve descrição do problema e impacto]

## Timeline
- **00:00** - Bug reportado
- **00:30** - Reprodução confirmada
- **01:00** - Causa raiz identificada
- **02:00** - Correção implementada
- **02:30** - Deploy em staging
- **03:00** - Validado e liberado

## Causa Raiz (5 Whys)
1. **Por que o sistema falhou?**
   [Resposta]

2. **Por que [causa anterior]?**
   [Resposta]

3. **Por que [causa anterior]?**
   [Resposta]

4. **Por que [causa anterior]?**
   [Resposta]

5. **Por que [causa anterior]?**
   [Resposta]

## Correção Aplicada
[Descrição detalhada da correção]

## Prevenção
[Ações para evitar recorrência]

## Lições Aprendidas
[Insights para o futuro]
```

## Skills complementares
- `systematic-debugging`
- `performance-profiling`
- `vulnerability-scanner`
- `log-analysis`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Debugging e Troubleshooting.md`
- **Artefatos alvo:**
  - Bug corrigido e validado
  - Root cause documentada
  - Testes de regressão
  - Runbook de troubleshooting