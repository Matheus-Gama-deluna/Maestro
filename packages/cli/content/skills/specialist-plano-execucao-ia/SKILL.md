---
name: specialist-plano-execucao-ia
description: Planejamento de backlog, épicos, histórias e roadmap operado com IA.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Plano de Execução com IA · Skill do Especialista

## Missão
Quebrar visão em backlog FE/BE, definir épicos, histórias e DoD, otimizando para 1-2 devs + IA com qualidade e velocidade.

## Quando ativar
- Fase: Fase 9 · Execução
- Workflows recomendados: /maestro, /nova-feature
- Use quando precisar antes de iniciar desenvolvimento paralelo de squads.

## Inputs obrigatórios
- PRD (`docs/01-produto/PRD.md`)
- Requisitos (`docs/02-requisitos/requisitos.md`)
- Arquitetura (`docs/06-arquitetura/arquitetura.md`)
- Design Doc (`docs/03-ux/design-doc.md`)
- CONTEXTO.md do projeto
- Capacidades do time e restrições de sprint

## Outputs gerados
- `docs/08-backlog/backlog.md` — backlog completo
- Features detalhadas por tipo
- Contratos de API (OpenAPI)
- Histórias Frontend e Backend
- Timeline e roadmap
- Definition of Done por tipo

## Quality Gate
- Épicos identificados e priorizados
- Features separadas por tipo (Contrato, FE, BE, Integração)
- Dependências mapeadas
- Ordem de execução definida (Contrato → FE/BE → Integração)
- DoD (Definition of Done) definido por tipo
- Timeline realista com buffer

## Processo Obrigatório de Planejamento

### 1. Análise dos Documentos
Antes de começar, você DEVE:
- Ler PRD, Design Doc e Arquitetura
- Identificar épicos e dependências
- Validar consistência entre documentos

### 2. Perguntas Iniciais (se necessário)
```text
Se contexto incompleto, pergunte:
1. Quantos desenvolvedores disponíveis? (assume 1-2 + IA)
2. Qual a duração dos sprints? (assume 1-2 semanas)
3. Há datas fixas/deadlines? (lançamento, evento, etc.)
```

### 3. Planejamento Sequencial Obrigatório
Siga ESTA ordem:
1. Setup do projeto
2. Contrato de API (OpenAPI ou equivalente)
3. Mocks
4. Frontend (contra mocks)
5. Backend (contra contrato)
6. Integração

### 4. Validação Antes de Avançar
**NUNCA avance automaticamente!**
1. **Resuma o backlog** (épicos, quantidade de histórias)
2. **Mostre ordem de execução** proposta
3. **Pergunte**: "Este plano está viável? Posso salvar e avançar?"

## Estrutura do Plano de Execução

### 1. Visão Geral
- Objetivos do MVP
- Stack técnica confirmada
- Premissas e restrições
- Time e capacidades

### 2. Setup Inicial (Semana 0)
- [ ] Repositório + CI/CD
- [ ] Linting/Formatting configurado
- [ ] Estrutura de pastas padronizada
- [ ] Ambiente de desenvolvimento
- [ ] Documentação inicial

### 3. Fase 1: Fundação (Semanas 1-2)
#### Contrato de API
- [ ] Definir OpenAPI/Swagger completo
- [ ] Gerar tipos/clients (TypeScript, etc.)
- [ ] Configurar mocks (MSW, WireMock)
- [ ] Testes de contrato no CI

### 4. Fase 2: Frontend vs Mocks (Semanas 3-5)
#### Componentes e Pages
- [ ] Componentes reutilizáveis
- [ ] Pages principais
- [ ] Integração com mocks
- [ ] Testes unitários e E2E

### 5. Fase 3: Backend (Semanas 4-6)
#### Services e APIs
- [ ] Implementação dos endpoints
- [ ] Lógica de negócio
- [ ] Integração com banco
- [ ] Testes unitários e integração

### 6. Fase 4: Entrega (Semanas 7-8)
#### Integração Final
- [ ] Conectar Frontend ↔ Backend
- [ ] Testes E2E completos
- [ ] Deploy em staging
- [ ] Feedback e ajustes

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** avance sem validação do usuário
- **NUNCA** ignore dependências entre fases
- **NUNCA** pule o contrato de API
- **NUNCA** subestime tempo de integração

### SEMPRE Faça
- **SEMPRE** contrato primeiro (contract-first)
- **SEMPRE** mocks para frontend
- **SEMPRE** DoD rígido (testes + lint + CI)
- **SEMPRE** buffer de 20% no timeline

### Definition of Done (Obrigatório)

#### Para Contratos
- [ ] OpenAPI completo e validado
- [ ] Types gerados para frontend
- [ ] Mocks funcionais
- [ ] Testes de contrato passando

#### Para Frontend
- [ ] Componentes testáveis
- [ ] Integração com mocks
- [ ] Responsivo e acessível
- [ ] Performance aceitável

#### Para Backend
- [ ] Endpoints implementados
- [ ] Testes unitários (>80% coverage)
- [ ] Documentação da API
- [ ] Segurança implementada

#### Para Integração
- [ ] Frontend ↔ Backend conectado
- [ ] Testes E2E passando
- [ ] Deploy em staging
- [ ] Monitoramento configurado

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. PRD completo com visão
2. Requisitos funcionais e não-funcionais
3. Arquitetura com stack definida
4. Design Doc com wireframes
5. CONTEXTO.md com restrições

### Prompt de Continuação
```
Atue como Tech Lead especializado em planejamento.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

PRD:
[COLE docs/01-produto/PRD.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

Design Doc:
[COLE docs/03-ux/design-doc.md]

Preciso decompor em épicos, histórias e definir sprints para o MVP.
```

### Ao Concluir Esta Fase
1. **Salve o backlog** em `docs/08-backlog/backlog.md`
2. **Crie as features** em `docs/08-backlog/features/`
3. **Defina os contratos** em `docs/08-backlog/contratos/`
4. **Atualize o CONTEXTO.md** com resumo do planejamento
5. **Valide o Gate** usando checklist
6. **Obtenha aprovação** explícita do usuário

## Métricas e KPIs

### Indicadores de Planejamento
- **Velocity Estimada:** points por sprint
- **Burndown Chart:** acompanhamento diário
- **Cycle Time:** tempo médio por história
- **Throughput:** histórias por semana

### Metas de Qualidade
- Planning Accuracy: ≥ 80%
- Sprint Completion: ≥ 90%
- Defect Rate: < 5%
- On-Time Delivery: ≥ 85%

## Templates Prontos

### Estrutura de Épico
```markdown
## Épico: [Nome]

### Objetivo
[Descrição clara do valor]

### Features Incluídas
- [ ] Feature 1
- [ ] Feature 2

### Dependências
- [ ] Contrato API
- [ ] Design aprovado

### Timeline Estimada
- Sprint 1: Feature 1
- Sprint 2: Feature 2

### DoD
- [ ] Todas as features implementadas
- [ ] Testes passando
- [ ] Documentação atualizada
```

### Estrutura de História
```markdown
## US-XXX: [Título]

### Como [persona], eu quero [ação] para [benefício]

### Critérios de Aceite
- [ ] Critério 1
- [ ] Critério 2

### Dependências
- [ ] Contrato API
- [ ] Componente X

### Estimativa
- Complexidade: [Média/Alta]
- Tempo: [X dias]

### DoD
- [ ] Código implementado
- [ ] Testes criados
- [ ] Code review aprovado
- [ ] Deploy em staging
```

## Skills complementares
- `plan-writing`
- `documentation-templates`
- `brainstorming`
- `agile-methodologies`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Plano de Execução com IA.md`
- **Artefatos alvo:**
  - `docs/08-backlog/backlog.md`
  - Features detalhadas por tipo
  - Contratos de API (OpenAPI)
  - Timeline e roadmap
  - Definition of Done por tipo