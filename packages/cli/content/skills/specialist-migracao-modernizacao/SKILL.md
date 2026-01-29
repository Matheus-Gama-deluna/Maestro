---
name: specialist-migracao-modernizacao
description: Planejamento Strangler Fig, migrações de dados e rollback seguro.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Migração e Modernização · Skill do Especialista

## Missão
Guiar transformações de legados com riscos controlados, aplicando Strangler Fig pattern, migração de dados e rollback seguro para modernização progressiva.

## Quando ativar
- Fase: Especialista Avançado
- Workflows recomendados: /refatorar-codigo, /maestro
- Use quando um sistema legado precisa ser substituído em ondas.

## Inputs obrigatórios
- Documentação do sistema legado
- Mapeamento do legado
- Arquitetura alvo
- Planos de dados e cutover
- CONTEXTO.md do projeto

## Outputs gerados
- Plano de migração completo
- Mapeamento Strangler e matriz de riscos
- Análise de débito técnico
- Roadmap de modernização
- ADRs de decisão
- Estratégia de rollback

## Quality Gate
- Plano de rollback definido
- Fases e milestones claros
- Riscos mitigados
- Coexistência planejada
- Métricas de sucesso definidas

## Estratégias de Migração

### 1. Strangler Fig Pattern
```text
Sistema atual: [MONOLITO LEGADO]
Sistema alvo: [MICROSSERVIÇOS/NOVA ARQUITETURA]

Aplicação do Strangler Fig:
1. **Identificar Edge Points:**
   - APIs de entrada
   - Interfaces de usuário
   - Integrações externas

2. **Priorizar Funcionalidades:**
   - Baixo risco, alto valor
   - Independentes
   - Fácil de isolar

3. **Implementar Façade:**
   - Proxy para redirecionamento
   - Feature toggles
   - Monitoramento de performance

4. **Migração Progressiva:**
   - Extração incremental
   - Testes de paralelismo
   - Rollback por etapa
```

### 2. Branch by Abstraction
```text
Componente a substituir: [NOME]
Nova implementação: [DESCRIÇÃO]

Etapas do Branch by Abstraction:
1. **Criar Abstração:**
   - Interface/contract
   - Implementação atual
   - Configuração de toggle

2. **Migrar Consumidores:**
   - Atualizar dependências
   - Testar compatibilidade
   - Monitorar comportamento

3. **Implementar Nova Versão:**
   - Seguir mesmo contrato
   - Testes de equivalência
   - Performance comparativa

4. **Switch Gradual:**
   - Toggle por feature
   - Monitoramento em tempo real
   - Rollback automático
```

### 3. Parallel Run
```text
Executar sistemas em paralelo:
- Legado: 100% do tráfego
- Novo: 0% do tráfego

Gradualmente:
- Semana 1: 5% tráfego novo
- Semana 2: 20% tráfego novo
- Semana 3: 50% tráfego novo
- Semana 4: 100% tráfego novo

Métricas de comparação:
- Performance
- Consistência de dados
- Taxa de erros
- Satisfação do usuário
```

## Análise do Sistema Legado

### 1. Mapeamento de Dependências
```text
Sistema: [NOME]
Idade: [ANOS EM PRODUÇÃO]
Stack: [TECNOLOGIAS]
Tamanho: [LOC, MÓDULOS]
Time: [PESSOAS]
Criticidade: [ALTA/MÉDIA/BAIXA]

Análise de Risco:
- **Risco Técnico:** [1-10]
- **Risco de Negócio:** [1-10]
- **Complexidade:** [1-10]
- **Impacto da Falha:** [1-10]

Dependências Críticas:
- [Dependência 1]: [Impacto se falhar]
- [Dependência 2]: [Impacto se falhar]
- [Dependência 3]: [Impacto se falhar]
```

### 2. Avaliação de Débito Técnico
```text
Qualidade do Código:
- Testes existentes: [% cobertura]
- Padrões arquiteturais: [sim/não/parcial]
- Documentação: [completa/inexistente/parcial]
- Complexidade ciclomática: [média]

Infraestrutura:
- Dependências desatualizadas: [lista]
- Vulnerabilidades críticas: [quantidade]
- Performance: [problemas identificados]
- Deploy: [processo atual]

Conhecimento:
- Documentação técnica: [status]
- Conhecimento tácito: [risco]
- Time de manutenção: [experiência]
- Rotatividade: [taxa anual]
```

## Processo de Migração

### Fase 1: Descoberta e Análise
```text
1. **Mapeamento Completo:**
   - Arquitetura atual
   - Dependências externas
   - Fluxos de negócio
   - Dados críticos

2. **Análise de Risco:**
   - Identificar blockers
   - Avaliar complexidade
   - Estimar esforço
   - Definir timeline

3. **Validação de Negócio:**
   - Stakeholders alinhados
   - ROI justificado
   - Success criteria definidos
   - Budget aprovado
```

### Fase 2: Planejamento Estratégico
```text
1. **Definir Arquitetura Alvo:**
   - Stack tecnológico
   - Padrões arquiteturais
   - Estratégia de dados
   - Infraestrutura

2. **Criar Roadmap:**
   - Fases e milestones
   - Dependências entre fases
   - Pontos de decisão
   - Critérios de sucesso

3. **Planejar Coexistência:**
   - APIs de integração
   - Sincronização de dados
   - Monitoramento
   - Rollback procedures
```

### Fase 3: Implementação
```text
1. **Setup Inicial:**
   - Infraestrutura base
   - Pipelines de CI/CD
   - Monitoramento
   - Logging

2. **Migração Incremental:**
   - Funcionalidade por funcionalidade
   - Testes automatizados
   - Validção em staging
   - Deploy controlado

3. **Monitoramento Contínuo:**
   - Métricas de performance
   - Taxa de erros
   - Satisfação do usuário
   - Business metrics
```

### Fase 4: Cutover e Decomissionamento
```text
1. **Cutover Planejado:**
   - Janela de manutenção
   - Backup completo
   - Testes de validação
   - Plano de rollback

2. **Monitoramento Pós-Cutover:**
   - Alertas críticas
   - Equipe de prontidão
   - Documentação de incidentes
   - Lições aprendidas

3. **Decomissionamento:**
   - Backup final
   - Remoção de recursos
   - Documentação histórica
   - Comemoração do sucesso!
```

## Estratégias de Migração de Dados

### 1. Change Data Capture (CDC)
```text
Fonte: [BANCO ORIGEM]
Destino: [BANCO DESTINO]

Implementação CDC:
1. **Setup do CDC:**
   - Ferramenta: [Debezium/CDC nativo]
   - Tabelas críticas mapeadas
   - Schema evolution
   - Error handling

2. **Sincronização Inicial:**
   - Full load baseline
   - Validação de dados
   - Performance tuning
   - Monitoramento de lag

3. **Cutover de Dados:**
   - Stop-the-world mínimo
   - Validação final
   - Switch de aplicação
   - Monitoramento pós-cutover
```

### 2. Dual Write Pattern
```text
Escrita simultânea em ambos os bancos:

1. **Implementação:**
   - Transaction outbox
   - Eventual consistency
   - Reconciliation jobs
   - Conflict resolution

2. **Validação:**
   - Comparação periódica
   - Alertas de divergência
   - Manual reconciliation
   - Audit trails

3. **Cutover:**
   - Parar escrita no legado
   - Validar consistência final
   - Promover novo sistema
   - Retirar dual write
```

## Templates Prontos

### Migration Plan Template
```markdown
# Migration Plan: [System Name]

## Executive Summary
- **Current System:** [description]
- **Target System:** [description]
- **Timeline:** [duration]
- **Budget:** [amount]
- **ROI:** [expected return]

## Current State Analysis
### System Overview
- **Age:** [years]
- **Technology Stack:** [list]
- **Team Size:** [people]
- **Criticality:** [level]

### Technical Debt
- **Code Quality:** [assessment]
- **Dependencies:** [outdated count]
- **Security Issues:** [count]
- **Performance Issues:** [list]

## Migration Strategy
### Approach
- **Pattern:** [Strangler Fig/Branch by Abstraction]
- **Phases:** [number]
- **Duration:** [timeline]
- **Risk Level:** [assessment]

### Phases
#### Phase 1: [Name] - [Duration]
- **Objectives:** [list]
- **Deliverables:** [list]
- **Risks:** [list]
- **Success Criteria:** [list]

#### Phase 2: [Name] - [Duration]
- **Objectives:** [list]
- **Deliverables:** [list]
- **Risks:** [list]
- **Success Criteria:** [list]

## Data Migration
### Strategy
- **Approach:** [CDC/Dual Write/Big Bang]
- **Tools:** [list]
- **Validation:** [method]
- **Rollback:** [procedure]

### Data Mapping
| Source | Target | Transformation |
|--------|--------|----------------|
| [table] | [table] | [description] |
| [table] | [table] | [description] |

## Risk Management
### High Risks
1. **[Risk Name]**
   - **Impact:** [description]
   - **Probability:** [high/medium/low]
   - **Mitigation:** [strategy]

### Rollback Plan
- **Trigger Conditions:** [list]
- **Rollback Steps:** [list]
- **Rollback Time:** [duration]
- **Data Recovery:** [method]

## Success Metrics
### Technical Metrics
- **Performance:** [targets]
- **Availability:** [targets]
- **Error Rate:** [targets]
- **Data Quality:** [targets]

### Business Metrics
- **User Satisfaction:** [target]
- **Cost Reduction:** [target]
- **Time to Market:** [target]
- **Revenue Impact:** [target]

## Timeline
| Phase | Start | End | Duration | Status |
|-------|-------|-----|----------|--------|
| [Phase 1] | [date] | [date] | [weeks] | [status] |
| [Phase 2] | [date] | [date] | [weeks] | [status] |
| [Phase 3] | [date] | [date] | [weeks] | [status] |
```

### Risk Assessment Matrix
```markdown
# Risk Assessment Matrix

| Risk | Impact | Probability | Risk Score | Mitigation |
|-------|---------|-------------|------------|------------|
| **Data Loss** | Critical | Low | 3 | Daily backups, CDC validation |
| **Performance Degradation** | High | Medium | 6 | Load testing, monitoring |
| **Team Knowledge Gap** | Medium | High | 6 | Training, documentation |
| **Vendor Lock-in** | Medium | Low | 2 | Open source alternatives |
| **Security Breach** | Critical | Low | 3 | Security audit, penetration testing |

### Risk Scoring
- **1-3:** Low risk - Accept
- **4-6:** Medium risk - Mitigate
- **7-9:** High risk - Avoid or transfer
```

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** migre sem backup completo
- **NUNCA** ignore rollback procedures
- **NUNCA** pule testes de paralelismo
- **NUNCA** migre sem validação de dados

### SEMPRE Faça
- **SEMPRE** tenha plano de rollback
- **SEMPRE** teste em staging primeiro
- **SEMPRE** monitore em tempo real
- **SEMPRE** documente cada passo

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Documentação completa do sistema legado
2. Arquitetura alvo definida
3. Requisitos de negócio atuais
4. CONTEXTO.md com restrições
5. Análise de risco inicial

### Prompt de Continuação
```
Atue como Arquiteto especialista em migração e modernização de sistemas.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Sistema legado atual:
[DESCREVA O SISTEMA ATUAL]

Objetivo da modernização:
[DESCREVA O QUE QUER ALCANÇAR]

Preciso planejar a migração de [SISTEMA] para [NOVA ARQUITETURA] com risco controlado.
```

### Ao Concluir Esta Fase
1. **Analise** sistema legado completamente
2. **Planeje** estratégia de migração
3. **Defina** fases e milestones
4. **Implemente** coexistência segura
5. **Execute** cutover controlado
6. **Monitore** pós-migração
7. **Documente** lições aprendidas

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Migration Success Rate:** 100%
- **Data Integrity:** 100%
- **Downtime:** < 4 horas
- **Rollback Success:** 100%
- **User Satisfaction:** > 4.0/5

### Metas de Excelência
- Migration Success Rate: 100%
- Data Integrity: 100%
- Downtime: < 1 hora
- Rollback Success: 100%
- User Satisfaction: > 4.5/5

## Skills complementares
- `clean-code`
- `database-design`
- `deployment-procedures`
- `systematic-debugging`
- `architecture-patterns`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Migração e Modernização.md`
- **Artefatos alvo:**
  - Plano de migração completo
  - Mapeamento Strangler e matriz de riscos
  - Análise de débito técnico
  - Roadmap de modernização
  - ADRs de decisão
  - Estratégia de rollback