# Classificação de Projetos

Guia para determinar o nível de complexidade do seu projeto e ajustar o fluxo do Maestro adequadamente.

---

## Como Classificar

Responda às perguntas abaixo e some os pontos:

| Pergunta | 1 pt | 2 pts | 3 pts |
|---|---|---|---|
| **Tempo estimado** | < 2 semanas | 1-3 meses | 3+ meses |
| **Número de entidades** | < 5 | 5-15 | 15+ |
| **Usuários simultâneos** | < 100 | 100-10k | 10k+ |
| **Integrações externas** | 0-1 | 2-5 | 5+ |
| **Requisitos de segurança** | Básico | Auth + roles | Compliance (LGPD, SOC2) |
| **Equipe** | 1 dev | 2-5 devs | 5+ devs |
| **Disponibilidade** | Best effort | 99% | 99.9%+ |
| **Domínio de negócio** | Simples | Médio | Complexo (regras) |

**Pontuação:**
- **8-12 pontos**: Nível 1 - Simples
- **13-18 pontos**: Nível 2 - Médio
- **19-24 pontos**: Nível 3 - Complexo

---

## Nível 1: Simples

### Exemplos
- Landing pages
- Sites institucionais
- APIs básicas (< 5 endpoints)
- POCs e protótipos
- Ferramentas internas simples

### Características
- Monolito simples
- Um banco de dados
- Deploy básico (PaaS)
- Poucos usuários

### Fluxo Reduzido (5 fases)

```mermaid
flowchart LR
    A[Produto] --> B[Requisitos]
    B --> C[Arquitetura Simples]
    C --> D[Implementação]
    D --> E[Deploy]
```

| Fase | Especialista | Tempo Sugerido |
|---|---|---|
| 1. Produto | Gestão de Produto (simplificado) | 1-2h |
| 2. Requisitos | Engenharia de Requisitos | 2h |
| 3. Arquitetura | Arquitetura de Software | 1h |
| 4. Implementação | Desenvolvimento | 1-2 semanas |
| 5. Deploy | DevOps (básico) | 2-4h |

### O que pular
- ❌ UX detalhado (só wireframes básicos)
- ❌ Modelagem formal (DDD não necessário)
- ❌ Segurança avançada (básico é suficiente)
- ❌ Testes E2E (unitários são suficientes)
- ❌ Especialistas avançados

### Artefatos Mínimos
- [ ] PRD simplificado (1 página)
- [ ] Lista de requisitos
- [ ] Diagrama de arquitetura simples
- [ ] Código com testes unitários
- [ ] README e deploy

---

## Nível 2: Médio

### Exemplos
- SaaS simples
- E-commerce básico
- Aplicativos mobile
- Sistemas com autenticação e roles
- APIs com múltiplos módulos

### Características
- Modular monolith ou poucos serviços
- Autenticação/autorização
- Múltiplos tipos de usuário
- Integrações comuns (pagamento, email)

### Fluxo Completo (10 fases)

```mermaid
flowchart LR
    A[Produto] --> B[Requisitos] --> C[UX]
    C --> D[Modelagem] --> E[Arquitetura]
    E --> F[Segurança] --> G[Testes]
    G --> H[Plano] --> I[Implementação]
    I --> J[Deploy]
```

| Fase | Especialista | Tempo Sugerido |
|---|---|---|
| 1. Produto | Gestão de Produto | 2-4h |
| 2. Requisitos | Engenharia de Requisitos | 4h |
| 3. UX | UX Design | 4-8h |
| 4. Modelagem | Modelagem de Domínio | 2-4h |
| 5. Arquitetura | Arquitetura de Software | 4h |
| 6. Segurança | Segurança da Informação | 2h |
| 7. Testes | Análise de Testes | 2h |
| 8. Plano | Plano de Execução | 2h |
| 9. Implementação | Desenvolvimento | 1-3 meses |
| 10. Deploy | DevOps e Infraestrutura | 1 semana |

### Artefatos Completos
- [ ] PRD completo
- [ ] Requisitos funcionais e não-funcionais
- [ ] Design doc com fluxos
- [ ] Modelo de domínio
- [ ] Arquitetura C4 (níveis 1-2)
- [ ] Checklist de segurança
- [ ] Plano de testes
- [ ] Backlog priorizado
- [ ] Código com testes (unit + integration)
- [ ] CI/CD configurado

---

## Nível 3: Complexo

### Exemplos
- SaaS multi-tenant
- Marketplaces
- Fintech / Healthtech
- Sistemas event-driven
- Microserviços
- Sistemas com compliance (LGPD, SOC2, HIPAA)

### Características
- Múltiplos bounded contexts
- Alta disponibilidade obrigatória
- Escalabilidade horizontal
- Consistência eventual
- Times distribuídos

### Fluxo Expandido (14 fases)

```mermaid
flowchart LR
    A[Produto] --> B[Requisitos] --> C[UX]
    C --> D[Modelagem] --> E[Arquitetura]
    E --> F[Arq. Avançada] --> G[Segurança]
    G --> H[Testes] --> I[Plano]
    I --> J[Implementação] --> K[Performance]
    K --> L[Observabilidade] --> M[Deploy]
    M --> N[Disaster Recovery]
```

### Especialistas Adicionais

| Fase Extra | Especialista | Foco |
|---|---|---|
| 6. Arq. Avançada | Arquitetura Avançada | DDD, CQRS, Sagas |
| 11. Performance | Performance e Escalabilidade | Load test, caching |
| 12. Observabilidade | Observabilidade | Logs, métricas, traces |
| 14. DR | DevOps (estendido) | Backup, failover |

### Artefatos Estendidos
Todos do Nível 2, mais:
- [ ] Context Map (DDD)
- [ ] Agregados e eventos de domínio
- [ ] ADRs para cada decisão crítica
- [ ] Estratégia de migração de dados
- [ ] Plano de load testing
- [ ] Runbooks para incidentes
- [ ] SLOs definidos
- [ ] Disaster recovery plan

---

## Matriz de Decisão de Arquitetura

| Aspecto | Simples | Médio | Complexo |
|---|---|---|---|
| **Arquitetura** | Monolito | Modular Monolith | Microserviços/Event-Driven |
| **Banco** | SQLite/PostgreSQL | PostgreSQL + Redis | Polyglot (SQL + NoSQL) |
| **Deploy** | PaaS (Render, Railway) | Docker + CI/CD | Kubernetes |
| **Observabilidade** | Logs básicos | Logs + Métricas | Full stack (tracing) |
| **Testes** | Unitários | + Integração | + E2E + Load + Contract |
| **Padrão** | MVC | Clean/Hexagonal | DDD + CQRS |
| **Cache** | Nenhum | Redis simples | Multi-layer + CDN |

---

## Progressão de Complexidade

> [!TIP]
> Comece simples e evolua conforme necessidade.

```mermaid
graph LR
    A[MVP Simples] -->|Validou| B[Refatorar para Médio]
    B -->|Escalar| C[Evoluir para Complexo]
```

### Sinais de que precisa evoluir

**De Simples → Médio:**
- Múltiplos tipos de usuário
- Necessidade de autenticação robusta
- Integrações externas
- Mais de 5 entidades

**De Médio → Complexo:**
- Times diferentes no mesmo código
- Problemas de escalabilidade
- Requisitos de alta disponibilidade
- Domínio com muitas regras
- Necessidade de consistência eventual

---

## Checklist de Classificação

Antes de começar, responda:

1. [ ] Calculei a pontuação de complexidade
2. [ ] Identifiquei o nível do projeto
3. [ ] Selecionei o fluxo apropriado
4. [ ] Listei os especialistas necessários
5. [ ] Defini os artefatos mínimos
