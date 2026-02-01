# Prompt: Arquitetura Clean Architecture

> **Quando usar**: Projetos de nível Médio (1-3 meses, 5-15 entidades)
> **Especialista**: Arquitetura de Software

---

## Prompt Completo

```text
Atue como arquiteto de software sênior especializado em Clean Architecture.

## Contexto do Projeto

PRD:
[COLE O CONTEÚDO DE docs/01-produto/PRD.md]

Requisitos:
[COLE O CONTEÚDO DE docs/02-requisitos/requisitos.md]

Modelo de Domínio:
[COLE O CONTEÚDO DE docs/04-modelo/modelo-dominio.md]

Stack preferencial: [DESCREVA SUA STACK]
Prazo: [PRAZO DO MVP]
Orçamento de infra: [ORÇAMENTO MENSAL]

---

## Sua Missão

Proponha uma arquitetura em Clean Architecture considerando:

### 1. Camadas da Arquitetura

Defina cada camada com responsabilidades claras:

- **Domain Layer** (mais interna):
  - Entidades de domínio (não são ORM models)
  - Value Objects
  - Regras de negócio puras
  - Interfaces de repositórios (ports)

- **Application Layer**:
  - Use Cases / Application Services
  - DTOs de entrada e saída
  - Orquestração de fluxos
  - Sem dependência de frameworks

- **Infrastructure Layer**:
  - Implementações de repositórios (adapters)
  - Serviços externos (email, pagamento, etc)
  - Configurações de banco de dados
  - Clientes HTTP

- **Interface Layer** (mais externa):
  - Controllers / Handlers
  - Presenters / Serializers
  - Middlewares
  - Validação de input

### 2. Diagrama C4

Gere diagramas em Mermaid para:

**Nível 1 - Contexto**:
- Usuários e sistemas externos
- Relações de alto nível

**Nível 2 - Containers**:
- Frontend, Backend, Banco, Cache, etc
- Tecnologias de cada container

**Nível 3 - Componentes** (para o backend):
- Módulos principais
- Fluxo de dependências

### 3. Decisões Arquiteturais (ADRs)

Para cada decisão importante, documente:
- Contexto: Por que é necessário decidir
- Decisão: O que foi escolhido
- Alternativas: O que foi descartado e por quê
- Consequências: Prós e contras

ADRs obrigatórios:
- Escolha da stack
- Padrão de arquitetura (Clean vs outras)
- Estratégia de autenticação
- Estratégia de persistência

### 4. Trade-offs

Explique:
- Por que Clean Architecture e não algo mais simples
- Por que não microserviços (se aplicável)
- Custos de infra estimados (MVP e 6 meses)
- Pontos de escalabilidade futura

### 5. Formato de Saída

Retorne um documento Markdown estruturado seguindo o template:
- Use diagramas Mermaid
- Inclua code snippets de exemplo para cada camada
- Liste arquivos/pastas da estrutura proposta
```

---

## Exemplo de Uso

```text
Atue como arquiteto de software sênior especializado em Clean Architecture.

## Contexto do Projeto

PRD:
Sistema de gestão de tarefas para equipes remotas. Permite criar projetos, 
adicionar tarefas com prazos, e acompanhar progresso.

Requisitos:
- RF-001: Usuário pode criar projetos
- RF-002: Usuário pode adicionar tarefas a projetos
- RF-003: Tarefas têm título, descrição, prazo e status
- RNF-001: Suportar 1000 usuários simultâneos
- RNF-002: Tempo de resposta < 200ms

Modelo de Domínio:
- User (id, name, email)
- Project (id, name, ownerId)
- Task (id, title, description, dueDate, status, projectId)

Stack preferencial: Node.js + TypeScript + PostgreSQL
Prazo: 2 meses
Orçamento de infra: R$ 500/mês

[CONTINUA COM O PROMPT COMPLETO ACIMA]
```

---

## Checklist Pós-Geração

Após receber a arquitetura, valide:

- [ ] Diagrama C4 inclui níveis 1 e 2
- [ ] Camadas estão bem definidas
- [ ] Pelo menos 3 ADRs documentados
- [ ] Estrutura de pastas proposta
- [ ] Estimativa de custos presente
- [ ] Stack justificada com prós/contras
