# Roadmap de Implementação — Maestro v6.0.0

> **Data:** 2026-03-02  
> **Versão:** 6.0.0  
> **Base:** Skills especialistas implementados, fluxos enxutos em `flows/types.ts`  
> **Princípio:** Skills primeiro → Fases depois → Integração por último

---

## Visão Geral

O roadmap está dividido em **2 partes** com **10 sprints** sequenciais:

**PARTE 1 — Criação de Skills (Sprints 1-6)**
Criar todas as skills dos especialistas com personas, templates, exemplos e checklists, seguindo a ordem: fluxo simples → médio → complexo.

**PARTE 2 — Integração ao Sistema (Sprints 7-10)**
Atualizar o código do Maestro para usar os novos fluxos, corrigir gaps identificados nas análises e implementar melhorias de orquestração.

### Estimativa Total

| Parte | Sprints | Esforço | Resultado |
|-------|---------|---------|-----------|
| Parte 1 — Skills | 1-6 | ~72h | 9 skills completas com recursos |
| Parte 2 — Sistema | 7-10 | ~45h | Código integrado e testado |
| **TOTAL** | **10 sprints** | **~117h** | **v6.0.0 funcional** |

---

# PARTE 1 — CRIAÇÃO DE SKILLS POR FLUXO

## Convenções

Cada skill inclui:
- **SKILL.md** — Persona robusta + instruções (< 200 linhas)
- **resources/templates/** — Template completo do entregável
- **resources/checklists/** — Gate checklist verificável
- **resources/examples/** — Exemplo real preenchido
- **resources/reference/** — Guia de referência técnica
- **complementary-skills.md** — Skills complementares recomendadas

Todos os exemplos usam o **mesmo projeto fictício** (SaaS de gestão de tarefas) para demonstrar continuidade entre fases.

---

## Sprint 1 — Skills do Fluxo Simples: Personas e SKILL.md (5 skills)

**Objetivo:** Criar SKILL.md com persona robusta para cada especialista do fluxo simples.
**Pré-requisito:** Nenhum
**Esforço:** ~10h

### Fluxo Simples Proposto (5 fases)

| # | Fase | Skill | Persona |
|---|------|-------|---------|
| 1 | Discovery | `specialist-discovery` | Product Manager + Requirements Analyst |
| 2 | Design | `specialist-design` | UX Designer |
| 3 | Arquitetura | `specialist-architect` | Software Architect |
| 4 | Frontend | `specialist-frontend` | Frontend Developer |
| 5 | Backend | `specialist-backend` | Backend Developer |

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 1.1 | **Criar `specialist-discovery/SKILL.md`** | Persona: Product Manager híbrido que faz coleta de produto E requisitos básicos num único documento. Tom estratégico, focado em problema/solução. Merge PRD + Requisitos. Coleta conversacional: problema, personas, MVP, requisitos básicos, métricas. Entregável: `discovery.md`. Skills complementares: `brainstorming`, `plan-writing` | 2h | — |
| 1.2 | **Criar `specialist-design/SKILL.md`** | Persona: UX Designer empático, mobile-first, WCAG. Coleta: fluxos principais, personas, dispositivos, design system. Entregável: `design-doc.md`. Skills complementares: `frontend-design` | 2h | — |
| 1.3 | **Criar `specialist-architect/SKILL.md`** | Persona: Arquiteto de Soluções — trade-off aware, ADR-driven, KISS-first. Coleta: stack, time, infra, integrações, escala, segurança básica. Entregável: `arquitetura.md` cobrindo modelo de dados + stack + C4 + segurança. Skills complementares: `api-patterns`, `database-design`, `architecture`, `clean-code` | 2h | — |
| 1.4 | **Criar `specialist-frontend/SKILL.md`** | Persona: Dev Frontend — component-driven, performance-aware. Foco operacional (não de stack — já definida na Arquitetura). Coleta: prioridade de US, mock server, estrutura. Skills complementares: `react-patterns`, `nextjs-best-practices`, `tailwind-patterns`, `clean-code`, `tdd-workflow` | 2h | — |
| 1.5 | **Criar `specialist-backend/SKILL.md`** | Persona: Dev Backend — API-first, type-safe, clean architecture. Foco operacional. Coleta: banco, prioridade de US, estrutura, ambiente. Skills complementares: `api-patterns`, `nodejs-best-practices`, `clean-code`, `tdd-workflow`, `database-design` | 2h | — |

### Critérios de Aceite (Sprint 1)
- [ ] 5 SKILL.md criados, cada um < 200 linhas
- [ ] Cada persona com: nome, tom, expertise (5+), comportamentos (5+), frases características (3+), anti-patterns (3+)
- [ ] Seções obrigatórias: Persona, Missão, Entregável, Coleta Conversacional, Seções Obrigatórias, Gate Checklist, Recursos, Skills Complementares
- [ ] Skills complementares listadas existem em `content/skills/`

---

## Sprint 2 — Skills do Fluxo Simples: Recursos Completos

**Objetivo:** Criar templates, checklists, exemplos e guias para as 5 skills do fluxo simples.
**Pré-requisito:** Sprint 1
**Esforço:** ~14h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 2.1 | **Template `discovery.md`** | Template com seções: Sumário Executivo, Problema/Oportunidade, Personas + JTBD, Solução/MVP (3-5 features), Requisitos Funcionais Principais (RF-001...), Requisitos Não-Funcionais, Métricas de Sucesso, Riscos, Timeline. Placeholders `[PREENCHER]` e instruções inline | 3h | 1.1 |
| 2.2 | **Template `design-doc.md`** | Jornadas, Wireframes (markdown), Design System, Navegação, Acessibilidade | 2h | 1.2 |
| 2.3 | **Template `arquitetura.md`** | Modelo de Dados, Stack Justificada, C4 (nível 1-2), ADRs, Segurança, NFRs | 3h | 1.3 |
| 2.4 | **5 gate-checklists** | Checklist com itens pesados (crítico/importante/desejável), score mínimo, instruções de correção | 3h | 1.1-1.5 |
| 2.5 | **3 exemplos preenchidos** | `example-discovery.md`, `example-design.md`, `example-architecture.md` — mesmo projeto fictício (SaaS tarefas) | 3h | 2.1-2.3 |

### Critérios de Aceite (Sprint 2)
- [ ] 3 templates criados, 200-500 linhas cada
- [ ] 5 checklists criados, 30-80 linhas cada, com itens verificáveis
- [ ] 3 exemplos criados, 300-800 linhas cada, dados realistas
- [ ] Exemplos formam narrativa coerente (mesmo projeto)

---

## Sprint 3 — Skills Adicionais do Fluxo Médio (3 novas skills)

**Objetivo:** Criar as 3 skills que o fluxo médio adiciona ao simples.
**Pré-requisito:** Sprint 1 (para padrão de persona)
**Esforço:** ~10h

### Fluxo Médio Proposto (8 fases) — skills novas marcadas com ★

| # | Fase | Skill | Status |
|---|------|-------|--------|
| 1 | Discovery | `specialist-product` ★ | Nova — substitui `specialist-discovery` do simples com PRD mais profundo |
| 2 | Requisitos | `specialist-requirements` ★ | Nova — requisitos separados no médio |
| 3 | Design | `specialist-design` | Reutiliza do simples |
| 4 | Design Técnico | `specialist-technical-design` ★ | Nova — merge domínio+banco+arq+segurança |
| 5 | Planejamento | `specialist-planning` ★ | Nova — merge backlog+contrato API+testes |
| 6 | Frontend | `specialist-frontend` | Reutiliza do simples |
| 7 | Backend | `specialist-backend` | Reutiliza do simples |
| 8 | Integração & Deploy | `specialist-devops` ★ | Nova — merge integração+deploy |

> **Nota:** O fluxo simples usa `specialist-discovery` (PRD+Requisitos juntos). O fluxo médio separa em `specialist-product` (PRD profundo) + `specialist-requirements` (requisitos detalhados). A skill `specialist-design` e as de código são reutilizadas.

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 3.1 | **Criar `specialist-product/SKILL.md`** | Persona: Product Manager estratégico. Coleta conversacional profunda (mais detalhada que discovery). Entregável: `PRD.md`. Skills complementares: `brainstorming`, `plan-writing` | 2h | — |
| 3.2 | **Criar `specialist-requirements/SKILL.md`** | Persona: Eng. de Requisitos — analítico, SMART, Gherkin-first. Coleta: volume, integrações, compliance, performance. Entregável: `requisitos.md`. Skills complementares: `plan-writing` | 2h | — |
| 3.3 | **Criar `specialist-technical-design/SKILL.md`** | Persona: Arquiteto de Soluções. **MERGE** de 4 especialistas atuais (Domínio + Banco + Arquitetura + Segurança). Coleta: stack, time, dados sensíveis, integrações, infra, escala. Entregável: `technical-design.md` com seções: Domínio, Schema, Arquitetura, Segurança, NFRs. Skills complementares: `api-patterns`, `database-design`, `architecture`, `performance-profiling` | 2h | — |
| 3.4 | **Criar `specialist-planning/SKILL.md`** | Persona: Tech Lead — pragmático, sprint-focused. **MERGE** de Backlog + Contrato API + Plano de Testes. Entregável: `backlog.md` com user stories (FE/BE), endpoints do OpenAPI, critérios de teste. Skills complementares: `plan-writing`, `api-patterns`, `testing-patterns` | 2h | — |
| 3.5 | **Criar `specialist-devops/SKILL.md`** | Persona: SRE — infra-as-code, observability-first. **MERGE** de Integração + Deploy. Entregável: `deploy.md` com E2E, CI/CD, monitoramento, runbooks. Skills complementares: `deployment-procedures`, `performance-profiling` | 2h | — |

### Critérios de Aceite (Sprint 3)
- [ ] 5 SKILL.md criados, cada um < 200 linhas
- [ ] Persona com mesma profundidade do Sprint 1
- [ ] `specialist-technical-design` cobre TODAS as seções de Domínio, Banco, Arquitetura E Segurança
- [ ] `specialist-planning` cobre Backlog, Contract API E Plano de Testes

---

## Sprint 4 — Recursos do Fluxo Médio

**Objetivo:** Templates, checklists, exemplos e guias para as skills do fluxo médio.
**Pré-requisito:** Sprint 3
**Esforço:** ~18h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 4.1 | **Template `PRD.md`** | Versão expandida do discovery com Sumário Executivo, Problema (quantificado), Personas + JTBD (mín 2), Visão/Estratégia, MVP (3-5 features), Métricas (North Star + KPIs), Riscos, Timeline | 3h | 3.1 |
| 4.2 | **Template `requisitos.md`** | RF com IDs, RNF categorizados, Critérios de Aceite Gherkin, Regras de Negócio, Matriz de Rastreabilidade | 2h | 3.2 |
| 4.3 | **Template `technical-design.md`** | O template mais complexo — 5 seções grandes: Modelo de Domínio (entidades, relacionamentos, aggregates), Schema de Banco (tabelas, tipos, PKs/FKs, índices, migrations), Arquitetura (C4, stack, ADRs), Segurança (autenticação, OWASP), NFRs | 4h | 3.3 |
| 4.4 | **Template `backlog.md`** | Épicos, User Stories FE/BE com endpoints (tabela), Sprints planejados, DoD, Seção de API Contract (resumo OpenAPI), Seção de Testes (estratégia) | 3h | 3.4 |
| 4.5 | **Template `deploy.md`** | CI/CD pipeline, Infra (Docker/Cloud), Monitoramento, Health checks, Runbooks, Rollback | 2h | 3.5 |
| 4.6 | **8 gate-checklists** | 1 por skill do fluxo médio (reutiliza 3 do simples + 5 novos) | 2h | 3.1-3.5 |
| 4.7 | **5 exemplos preenchidos** | `example-prd.md`, `example-requirements.md`, `example-technical-design.md`, `example-backlog.md`, `example-deploy.md` — continuando o mesmo projeto SaaS | 4h | 4.1-4.5 |

### Critérios de Aceite (Sprint 4)
- [ ] 5 templates, 200-500 linhas cada
- [ ] `technical-design.md` cobre 5 seções com profundidade suficiente
- [ ] 8 checklists (3 reutilizados do simples + 5 novos)
- [ ] 5 exemplos formando narrativa contínua com os 3 do Sprint 2

---

## Sprint 5 — Skills Adicionais do Fluxo Complexo (3 novas skills)

**Objetivo:** Criar as 3 skills exclusivas do fluxo complexo.
**Pré-requisito:** Sprint 3 (padrão de persona)
**Esforço:** ~8h

### Fluxo Complexo Proposto (11 fases) — skills novas marcadas com ★

| # | Fase | Skill | Status |
|---|------|-------|--------|
| 1 | Discovery | `specialist-product` | Reutiliza do médio |
| 2 | Requisitos | `specialist-requirements` | Reutiliza do médio |
| 3 | Design | `specialist-design` | Reutiliza do simples |
| 4 | Modelo de Domínio | `specialist-domain` ★ | Nova — DDD profundo, bounded contexts |
| 5 | Design Técnico | `specialist-technical-design` | Reutiliza do médio (sem seção Domínio — já coberta na fase 4) |
| 6 | Contrato API | `specialist-api-contract` ★ | Nova — OpenAPI completo separado |
| 7 | Planejamento | `specialist-planning` | Reutiliza do médio |
| 8 | Frontend | `specialist-frontend` | Reutiliza |
| 9 | Backend | `specialist-backend` | Reutiliza |
| 10 | Integração | `specialist-devops` | Reutiliza (foco E2E) |
| 11 | Deploy & Operação | `specialist-operations` ★ | Nova — deploy produção + observabilidade + runbooks |

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 5.1 | **Criar `specialist-domain/SKILL.md`** | Persona: Domain Expert — DDD-driven, linguagem ubíqua, event storming. Coleta: bounded contexts, entidades core, regras de negócio complexas. Entregável: `modelo-dominio.md`. Skills complementares: `architecture` | 3h | — |
| 5.2 | **Criar `specialist-api-contract/SKILL.md`** | Persona: API Designer — contract-first, versionamento, breaking changes. Coleta: consumers, versionamento, autenticação. Entregável: `openapi.yaml`. Skills complementares: `api-patterns` | 2.5h | — |
| 5.3 | **Criar `specialist-operations/SKILL.md`** | Persona: SRE Senior — observability-first, SLOs, incident response. Coleta: SLOs, ferramentas de monitoramento, estratégia de deploy, rollback. Entregável: `release.md`. Skills complementares: `deployment-procedures`, `performance-profiling` | 2.5h | — |

### Critérios de Aceite (Sprint 5)
- [ ] 3 SKILL.md criados, cada um < 200 linhas
- [ ] `specialist-domain` diferencia-se claramente de `specialist-technical-design`
- [ ] `specialist-operations` diferencia-se de `specialist-devops` (deploy prod vs integração)

---

## Sprint 6 — Recursos do Fluxo Complexo + Guias de Referência

**Objetivo:** Completar recursos do fluxo complexo e criar guias de referência para todas as skills.
**Pré-requisito:** Sprint 5
**Esforço:** ~12h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 6.1 | **Template `modelo-dominio.md`** | Entities, Value Objects, Aggregates, Bounded Contexts, Domain Events, Linguagem Ubíqua | 2h | 5.1 |
| 6.2 | **Template `openapi.yaml`** | Esqueleto OpenAPI 3.0 com paths, schemas, auth, examples, error format | 2h | 5.2 |
| 6.3 | **Template `release.md`** | Deploy produção, SLOs, dashboards, alertas, runbooks, rollback, incident response | 2h | 5.3 |
| 6.4 | **3 gate-checklists** | 1 por skill nova do complexo | 1h | 5.1-5.3 |
| 6.5 | **3 exemplos** | `example-domain.md`, trecho `example-openapi.yaml`, `example-release.md` | 3h | 6.1-6.3 |
| 6.6 | **Guias de referência (todas as skills)** | `resources/reference/guide.md` para cada skill — frameworks, anti-patterns, referências. ~100-300 linhas cada. 14 guias total | 4h | 1-5 |

### Critérios de Aceite (Sprint 6)
- [ ] 3 templates, 3 checklists, 3 exemplos criados
- [ ] 14 guias de referência (1 por skill)
- [ ] Todos os exemplos formam narrativa coerente do mesmo projeto

---

## Inventário Final de Skills (Parte 1)

### Skills por Fluxo

| Skill | Simples | Médio | Complexo |
|-------|:-------:|:-----:|:--------:|
| `specialist-discovery` | ✅ Fase 1 | — | — |
| `specialist-product` | — | ✅ Fase 1 | ✅ Fase 1 |
| `specialist-requirements` | — | ✅ Fase 2 | ✅ Fase 2 |
| `specialist-design` | ✅ Fase 2 | ✅ Fase 3 | ✅ Fase 3 |
| `specialist-domain` | — | — | ✅ Fase 4 |
| `specialist-architect` | ✅ Fase 3 | — | — |
| `specialist-technical-design` | — | ✅ Fase 4 | ✅ Fase 5 |
| `specialist-api-contract` | — | — | ✅ Fase 6 |
| `specialist-planning` | — | ✅ Fase 5 | ✅ Fase 7 |
| `specialist-frontend` | ✅ Fase 4 | ✅ Fase 6 | ✅ Fase 8 |
| `specialist-backend` | ✅ Fase 5 | ✅ Fase 7 | ✅ Fase 9 |
| `specialist-devops` | — | ✅ Fase 8 | ✅ Fase 10 |
| `specialist-operations` | — | — | ✅ Fase 11 |

**Total: 13 skills únicas** (vs 25 atuais = **-48% de skills**)
- Simples: 5 skills
- Médio: 8 skills (reutiliza 3 do simples)
- Complexo: 11 skills (reutiliza 8 do médio)

---

# PARTE 2 — INTEGRAÇÃO AO SISTEMA E CORREÇÃO DE GAPS

## Sprint 7 — Atualizar Fluxos no Código

**Objetivo:** Reescrever `flows/types.ts` com os novos fluxos enxutos e atualizar mapeamentos.
**Pré-requisito:** Sprint 1 (SKILL.md existem para validar nomes)
**Esforço:** ~10h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 7.1 | **Reescrever `flows/types.ts`** | Novos `FLUXO_SIMPLES` (5 fases), `FLUXO_MEDIO` (8 fases), `FLUXO_COMPLEXO` (11 fases). Atualizar `PHASE_TYPE_MAP`, `CODE_PHASE_NAMES`, `getFluxo()`, `getFase()`. Manter `getFluxoComStitch()` com Prototipagem opcional após Design | 4h | S1 |
| 7.2 | **Atualizar `prompt-mapper.ts`** | Novo mapeamento `FASE_SKILL_MAP` com nomes de fases → novas skills. Remover mapeamentos de fases eliminadas | 1h | 7.1 |
| 7.3 | **Atualizar `ide-paths.ts`** | Suporte multi-IDE: `getSkillPath()` retorna path correto para Windsurf (`.windsurf/skills/`), Cursor (`.cursor/rules/`), Antigravity (`.agent/skills/`). Atualizar `formatSkillHydrationCommand()` | 2h | 7.1 |
| 7.4 | **Atualizar `scoring-config.ts`** | `getPhaseCategory()` com nomes de fases consolidadas. Ex: "Design Técnico" → categoria `design`, "Planejamento" → categoria `planning` | 1h | 7.1 |
| 7.5 | **Atualizar testes unitários** | Testes em `flows/types.test.ts`, `scoring-config.test.ts` para novos fluxos | 2h | 7.1-7.4 |

### Critérios de Aceite (Sprint 7)
- [ ] `npx tsc --noEmit` compila sem erros
- [ ] Testes existentes adaptados e passando
- [ ] 3 fluxos com contagem correta de fases (5, 8, 11)
- [ ] `CODE_PHASE_NAMES` atualizado para fases de código dos novos fluxos

---

## Sprint 8 — Generalizar Specialist Handler + Readiness Gate

**Objetivo:** Fazer o ciclo collecting → generating → validating funcionar para TODAS as fases (não apenas PRD). Implementar o Readiness Gate pré-código.
**Pré-requisito:** Sprint 7
**Esforço:** ~14h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 8.1 | **Refatorar `specialist-phase-handler.ts`** | Generalizar para aceitar qualquer fase. Remover hardcoded "Gestão de Produto" e "PRD". `handleCollecting` lê perguntas da skill (seção "Coleta Conversacional"). `handleGenerating` usa template da skill. `handleValidating` usa checklist da skill | 5h | S7 |
| 8.2 | **Refatorar `specialist-formatters.ts`** | `getSpecialistQuestions()` → carrega perguntas do SKILL.md em vez de if/else hardcoded. `getRequiredFields()` → parametrizar por fase (hoje só retorna campos do PRD) | 3h | 8.1 |
| 8.3 | **Atualizar `avancar.ts`** | Delegar para specialist-phase-handler em TODAS as fases de documento (não apenas fase 1). Manter code-phase-handler para fases de código | 2h | 8.1 |
| 8.4 | **Criar `gates/readiness-gate.ts`** | Readiness check consolidado antes de entrar em fases de código. Verifica existência real de entregáveis no disco. Score ponderado (PRD 25, Requisitos 20, Arquitetura 20, Backlog 25, API 10). Thresholds: ≥80 auto, 60-79 manual, <60 bloqueio. (~150 linhas) | 3h | 7.1 |
| 8.5 | **Integrar readiness gate em `avancar.ts`** | Quando `isCodePhaseName(proximaFase) && !isCodePhaseName(faseAtual)`, executar readiness check antes de delegar para code-phase-handler | 1h | 8.3, 8.4 |

### Critérios de Aceite (Sprint 8)
- [ ] Coleta conversacional funciona na fase 2 (Requisitos) — não apenas fase 1
- [ ] Readiness Gate bloqueia entrada em código quando artefatos faltam
- [ ] Build compila sem erros
- [ ] Testes existentes passando

---

## Sprint 9 — Refatorar proximo.ts + Fix Gaps

**Objetivo:** Quebrar o monolito `proximo.ts` (1328 linhas) e corrigir gaps identificados.
**Pré-requisito:** Sprint 8
**Esforço:** ~12h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 9.1 | **Extrair `phase-transition.ts`** | Mover lógica de transição de fase: atualização de estado, geração de resumo, logEvent, gerarSystemMd, gate orientation, file watcher (~250 linhas) | 3h | S8 |
| 9.2 | **Extrair `classification-handler.ts`** | Mover lógica de classificação progressiva + expansão de fluxo (~150 linhas) | 2h | S8 |
| 9.3 | **Simplificar `proximo.ts`** | Orquestrador fino: validar → classificar → transicionar. Target: ~300 linhas (de 1328) | 3h | 9.1, 9.2 |
| 9.4 | **Fix delegação duplicada** | Quando `codeState.status === 'completed'` e code-validator já aprovou, `delegateToProximo()` pula validação textual. Flag `skip_validation: true` no args de proximo | 1h | 9.3 |
| 9.5 | **Doc automático de fases** | Em `iniciar-projeto.ts`, após criar estado, gerar `docs/00-setup/plano-orquestracao.md` com lista de fases, especialistas, entregáveis e checklists resumidos. Gerado de `flows/types.ts` em runtime | 2h | 7.1 |
| 9.6 | **Descrições expandidas no setup** | Em `setup-inicial.ts`, expandir descrições dos modos com lista de fases incluídas e contagem | 1h | 7.1 |

### Critérios de Aceite (Sprint 9)
- [ ] `proximo.ts` < 400 linhas
- [ ] `phase-transition.ts` e `classification-handler.ts` extraídos e importados
- [ ] Delegação duplicada eliminada para fases de código
- [ ] `plano-orquestracao.md` gerado automaticamente ao criar projeto
- [ ] Build + testes passando

---

## Sprint 10 — Deploy de Skills, Migração e Testes

**Objetivo:** Script de deploy multi-IDE, migração de projetos existentes, testes end-to-end.
**Pré-requisito:** Sprints 1-9
**Esforço:** ~9h

### Tasks

| ID | Task | Descrição | Esforço | Deps |
|----|------|-----------|---------|------|
| 10.1 | **Script `deploy-skills.ts`** | Copia skills de `content/skills/` para diretório da IDE. Windsurf: `.windsurf/skills/`. Cursor: converte SKILL.md → `.mdc` com frontmatter Cursor. Antigravity: `.agent/skills/`. Executado em `iniciar-projeto.ts` | 3h | S1-S6 |
| 10.2 | **Migration guide v9→v10** | Documento `docs/MIGRATION_V9_TO_V10.md`: mudanças de fases, renaming de skills, atualização de estado para projetos existentes | 1h | 7.1 |
| 10.3 | **Teste manual fluxo simples** | Criar projeto teste, percorrer 5 fases com coleta conversacional, validar gates, completar Frontend/Backend | 2h | S7-S9 |
| 10.4 | **Teste manual fluxo médio** | Percorrer 8 fases, validar readiness gate, completar código | 2h | 10.3 |
| 10.5 | **Teste manual fluxo complexo** | Percorrer 11 fases, validar modelo de domínio separado, contrato API, deploy & operação | 1h | 10.4 |

### Critérios de Aceite (Sprint 10)
- [ ] Skills deployam corretamente para Windsurf e Cursor
- [ ] Fluxo simples completo end-to-end sem erros
- [ ] Fluxo médio completo com readiness gate funcionando
- [ ] Migration guide cobre todos os breaking changes

---

## Resumo Visual do Roadmap

```
PARTE 1 — SKILLS                          PARTE 2 — SISTEMA
─────────────────────────────────          ───────────────────────────────

Sprint 1 ─► Sprint 2                      Sprint 7 ─► Sprint 8 ─► Sprint 9
(Simples    (Simples                      (flows/     (Specialist  (proximo.ts
 Personas)   Recursos)                     types.ts)   Handler +    refactor +
                                                       Readiness)   Fixes)
Sprint 3 ─► Sprint 4                                       │
(Médio       (Médio                                        ▼
 Personas)    Recursos)                    Sprint 10
                                           (Deploy + Migração + Testes)
Sprint 5 ─► Sprint 6
(Complexo    (Complexo
 Personas)    Recursos +
              Guias)

Sprints 1-6: ~72h                          Sprints 7-10: ~45h
Podem ser feitos em paralelo               Sequenciais (deps entre si)
com Sprints 7-9
```

### Paralelismo Possível

| Semana | Track A (Skills) | Track B (Sistema) |
|--------|-----------------|-------------------|
| 1 | Sprint 1 (Simples Personas) | Sprint 7 (flows/types.ts) |
| 2 | Sprint 2 (Simples Recursos) | Sprint 8 (Specialist Handler) |
| 3 | Sprint 3 (Médio Personas) | Sprint 9 (proximo.ts refactor) |
| 4 | Sprint 4 (Médio Recursos) | — |
| 5 | Sprint 5+6 (Complexo) | Sprint 10 (Deploy + Testes) |

**Com paralelismo: ~5 semanas de trabalho efetivo.**
**Sem paralelismo: ~8 semanas sequenciais.**

---

## Métricas de Sucesso v10

| Métrica | v9 (atual) | v10 (proposto) | Delta |
|---------|-----------|----------------|-------|
| Fases (simples) | 7 | 5 | -29% |
| Fases (médio) | 13 | 8 | -38% |
| Fases (complexo) | 17 | 11 | -35% |
| Skills totais | 25 | 13 | -48% |
| Skills órfãs | 8 | 0 | -100% |
| Recursos por skill | 0 (fantasma) | 4-5 (reais) | ∞ |
| Linhas SKILL.md | 174-343 | < 200 | -42% |
| proximo.ts | 1328 linhas | ~300 linhas | -77% |
| Specialist handler | Só fase 1 | Todas as fases | ∞ |
| Readiness gate | Inexistente | Score ponderado | Novo |
| Tempo até código (médio) | ~10h | ~5h | -50% |
| Compatibilidade IDE | Windsurf | Windsurf + Cursor + Antigravity | +2 IDEs |
