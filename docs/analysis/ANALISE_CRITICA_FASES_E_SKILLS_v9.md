# Análise Crítica: Fases de Engenharia e Skills do Maestro v9

> **Data:** 2026-03-01  
> **Escopo:** Análise completa das fases planejadas, skills dos especialistas, sobreposições e proposta de otimização  
> **Versão atual do Maestro:** 5.7.0 (código) / v9.0 (design)

---

## 1. Resumo Executivo

O Maestro implementa um sistema de fases de engenharia de software com 3 níveis de complexidade:
- **Simples:** 7 fases
- **Médio:** 13 fases
- **Complexo:** 17 fases

Cada fase possui um **especialista** com **skill** dedicada, **template**, **gate checklist** e **entregável esperado**. O sistema força a IA a seguir um processo waterfall-sequencial onde cada fase gera um documento markdown que é validado por um gate de qualidade (score ≥ 70) antes de avançar.

### Diagnóstico Principal

**O sistema está significativamente over-engineered nas fases de documentação**, criando um overhead de 8-12 documentos markdown ANTES de qualquer linha de código ser escrita. Isso representa:

1. **Fadiga do usuário:** 8+ ciclos de "coleta → geração → validação → aprovação" antes do código
2. **Contexto estagnado:** Documentos gerados nas fases iniciais ficam desatualizados conforme o entendimento evolui
3. **Sobreposição massiva:** Múltiplas fases produzem conteúdo redundante (domínio ↔ banco, requisitos ↔ backlog, arquitetura ↔ arquitetura avançada)
4. **Desconexão com realidade de IA:** Uma IA gerando documentos para si mesma validar é um loop de auto-referência com valor questionável
5. **25 skills de especialista** quando o fluxo máximo usa 17 fases — 8 skills órfãs sem fase vinculada

---

## 2. Mapeamento Atual: Fases × Especialistas × Skills

### 2.1 Fluxo Simples (7 fases)

| # | Fase | Especialista | Skill | Tipo | Entregável |
|---|------|-------------|-------|------|------------|
| 1 | Produto | Gestão de Produto | specialist-gestao-produto | input_required | PRD.md |
| 2 | Requisitos | Eng. de Requisitos | specialist-engenharia-requisitos-ia | derived | requisitos.md |
| 3 | UX Design | UX Design | specialist-ux-design | derived | design-doc.md |
| 4 | Arquitetura | Arq. de Software | specialist-arquitetura-software | derived | arquitetura.md |
| 5 | Backlog | Plano de Execução | specialist-plano-execucao-ia | derived | backlog.md |
| 6 | Frontend | Dev Frontend | specialist-desenvolvimento-frontend | technical | frontend-code |
| 7 | Backend | Desenvolvimento | specialist-desenvolvimento-backend | technical | backend-code |

### 2.2 Fluxo Médio (13 fases)

| # | Fase | Especialista | Skill | Tipo | Entregável |
|---|------|-------------|-------|------|------------|
| 1 | Produto | Gestão de Produto | specialist-gestao-produto | input_required | PRD.md |
| 2 | Requisitos | Eng. de Requisitos | specialist-engenharia-requisitos-ia | derived | requisitos.md |
| 3 | UX Design | UX Design | specialist-ux-design | derived | design-doc.md |
| 4 | **Modelo de Domínio** | Modelagem de Domínio | specialist-modelagem-dominio | derived | modelo-dominio.md |
| 5 | **Banco de Dados** | Banco de Dados | specialist-banco-dados | technical | design-banco.md |
| 6 | Arquitetura | Arq. de Software | specialist-arquitetura-software | derived | arquitetura.md |
| 7 | **Segurança** | Segurança | specialist-seguranca-informacao | technical | checklist-seguranca.md |
| 8 | **Testes** | Análise de Testes | specialist-analise-testes | technical | plano-testes.md |
| 9 | Backlog | Plano de Execução | specialist-plano-execucao-ia | derived | backlog.md |
| 10 | **Contrato API** | Contrato de API | specialist-contrato-api | derived | openapi.yaml |
| 11 | Frontend | Dev Frontend | specialist-desenvolvimento-frontend | technical | frontend-code |
| 12 | Backend | Desenvolvimento | specialist-desenvolvimento-backend | technical | backend-code |
| 13 | **Integração** | DevOps e Infra | specialist-devops-infra | technical | deploy.md |

### 2.3 Fluxo Complexo (17 fases) — Adiciona ao Médio:

| # | Fase Adicional | Especialista |
|---|------|-------------|
| 7 | Arquitetura Avançada | specialist-arquitetura-avancada |
| 9 | Performance | specialist-performance-escalabilidade |
| 10 | Observabilidade | specialist-observabilidade |
| 17 | Deploy Final | specialist-devops-infra |

### 2.4 Skills Órfãs (sem fase vinculada no fluxo)

| Skill | Descrição | Problema |
|-------|-----------|----------|
| specialist-acessibilidade | Acessibilidade web | Poderia ser seção em UX Design |
| specialist-dados-analytics-ia | Analytics/IA | Sem fase correspondente |
| specialist-debugging-troubleshooting | Debugging | Ferramenta, não fase |
| specialist-desenvolvimento-mobile | Mobile dev | Sem fase mobile |
| specialist-documentacao-tecnica | Docs técnicos | Transversal |
| specialist-exploracao-codebase | Exploração de código | Ferramenta utilitária |
| specialist-migracao-modernizacao | Migração de sistemas | Cenário específico |
| specialist-mobile-design-avancado | Design mobile avançado | Sem fase mobile |

---

## 3. Análise de Sobreposições

### 3.1 Sobreposição CRÍTICA: Modelo de Domínio ↔ Banco de Dados ↔ Arquitetura

**Problema:** Três fases separadas geram conteúdo fortemente acoplado:

| Conteúdo | Modelo Domínio | Banco de Dados | Arquitetura |
|----------|:-:|:-:|:-:|
| Entidades e atributos | ✅ Principal | ✅ Tabelas | ✅ Componentes |
| Relacionamentos | ✅ 1:N, N:N | ✅ FKs, JOINs | ✅ Dependências |
| Regras de negócio | ✅ Invariantes | ✅ Constraints | ✅ Services |
| Stack tecnológica | ❌ | ✅ ORM, DB | ✅ Principal |
| Diagramas C4 | ✅ C4 inicial | ❌ | ✅ C4 completo |

**Resultado:** A IA gera entidades na fase 4, refaz como tabelas na fase 5, e reorganiza como componentes na fase 6. O mesmo domínio é descrito 3 vezes em formatos diferentes, com alto risco de inconsistência.

### 3.2 Sobreposição ALTA: Requisitos ↔ Backlog

| Conteúdo | Requisitos | Backlog |
|----------|:-:|:-:|
| Funcionalidades listadas | ✅ RF-001, RF-002 | ✅ US-001, US-002 |
| Critérios de aceite | ✅ Gherkin | ✅ DoD |
| Priorização | ✅ MoSCoW | ✅ RICE/Sprints |
| Rastreabilidade | ✅ Matriz | ✅ Épicos → Stories |

**Resultado:** O backlog é essencialmente uma reorganização dos requisitos em formato de user stories. A IA refaz o mesmo trabalho com naming diferente.

### 3.3 Sobreposição MODERADA: Segurança / Testes / Performance / Observabilidade

Estas 4 fases (no fluxo complexo) geram documentos que são **checklists e planos**, não artefatos de código. São tipicamente seções de um documento de arquitetura ou NFRs, não fases inteiras. Um checklist de segurança OWASP não precisa de uma fase de 45-60 minutos com gate de validação — é uma seção de 2 páginas.

### 3.4 Sobreposição: Arquitetura ↔ Arquitetura Avançada

A fase de "Arquitetura Avançada" (complexo) cobre DDD, CQRS, Event Sourcing — exatamente o que o Modelo de Domínio já deveria cobrir em projetos complexos. A separação entre "Arquitetura" e "Arquitetura Avançada" é artificial.

---

## 4. Análise das Skills

### 4.1 Problemas Estruturais

**A. Skills excessivamente genéricas e repetitivas**

Todas as 25 skills seguem exatamente a mesma estrutura:
```
Missão → Quando ativar → Inputs → Outputs → Quality Gate → Processo → Recursos → Context Flow
```

O conteúdo de cada skill é ~80% boilerplate ("NUNCA avance sem validação ≥ 75", "SEMPRE confirme com usuário", etc.) e ~20% específico. As seções de "Frameworks Utilizados" listam conceitos que a LLM já conhece (DDD, SMART, Gherkin, etc.).

**B. Skills desalinhadas com fases reais**

- `specialist-contrato-api` diz "Fase 9 · Execução" mas no fluxo médio é fase 10
- `specialist-plano-execucao-ia` diz "Fase 9 · Execução" mas no fluxo médio é fase 9
- `specialist-analise-testes` diz "Fase 9 · Análise de Testes" mas no fluxo médio é fase 8
- `specialist-performance-escalabilidade` diz "Especialista Avançado" sem fase numérica
- `specialist-observabilidade` diz "Especialista Avançado" sem fase numérica

**C. Recursos fantasma**

Skills referenciam `resources/templates/`, `resources/examples/`, `resources/checklists/` — mas verificação prévia (memória do sistema) indicou que **62 diretórios de skills foram criados mas 0 arquivos** existem dentro deles no projeto de teste. As skills são cascas vazias apontando para recursos inexistentes.

**D. 25 skills para 17 fases máximas**

8 skills são órfãs (listadas em 2.4). Isso cria:
- Ruído no progressive disclosure da IDE
- Confusão sobre qual skill ativar
- Manutenção de skills que nunca serão usadas no fluxo normal

### 4.2 O que FUNCIONA bem nas Skills

- **Progressive disclosure:** A ideia de carregar conhecimento sob demanda é sólida
- **Menções de arquivo (#path):** Economiza tokens ao apontar em vez de injetar conteúdo
- **Gate checklists:** Critérios objetivos de validação por fase são úteis
- **Persona do especialista:** Dar "personalidade" à IA melhora a qualidade das perguntas

---

## 5. Análise do Código: Como as Fases Funcionam

### 5.1 Fluxo de Execução (simplificado)

```
maestro-tool.ts → avancar.ts → {
    Se onboarding.specialistPhase existe:
        → specialist-phase-handler.ts (APENAS para fase 1/PRD)
    Se isCodePhase(faseNome):
        → code-phase-handler.ts (Frontend, Backend, Integração, Deploy)
    Senão:
        → proximo.ts (TODAS as outras fases de documento)
}
```

### 5.2 Problemas no Código

**A. specialist-phase-handler.ts é EXCLUSIVO para PRD (Fase 1)**

O handler "specialist" com todo o ciclo collecting → generating → validating → approved **só funciona para Gestão de Produto**. As demais 12+ fases de documento passam direto pelo `proximo.ts` com uma validação simplificada de gate. Isso significa que:

- A coleta conversacional de dados (que é o melhor recurso do sistema) **só acontece na fase 1**
- Nas fases 2-13, a IA simplesmente gera o documento, salva, e submete para validação textual
- O investimento em specialist-phase-handler não escala para outras fases

**B. proximo.ts é um monolito de 1328 linhas**

Uma única função (`proximo()`) faz:
- Validação de parâmetros
- Leitura do disco
- Classificação de PRD
- Verificação de classificação pendente
- Verificação de skill carregada
- Validação de gate
- Cálculo de score contextual
- Geração de tasks para fases de código
- Classificação progressiva
- Verificação de expansão de fluxo
- Geração de gate orientation
- Gestão de file watchers
- Persistência de estado

**C. code-phase-handler.ts é bem projetado mas desconectado**

O handler de código com state machine (SETUP → WORKING → GATE) é sólido, mas:
- Lê backlog/OpenAPI do disco com fallback paths hardcoded
- Parsing de user stories depende de formato markdown específico (| US-XXX | ... |)
- Validação de código é por existência de diretórios, não qualidade real

---

## 6. Proposta de Otimização: Fases Enxutas

### 6.1 Princípios

1. **Menos documentos, mais contexto:** A IA não precisa de 13 documentos separados — precisa de CONTEXTO acumulado coerente
2. **Merge fases sobrepostas:** Domínio + Banco + Arquitetura → fase única de "Design Técnico"
3. **Fases transversais viram seções:** Segurança, Testes, Performance, Observabilidade → seções em Arquitetura
4. **Coleta conversacional em TODAS as fases:** Não apenas na fase 1
5. **Código mais cedo:** Reduzir o "document waterfall" antes de codificar

### 6.2 Fluxo Simples Proposto (5 fases) — antes: 7

| # | Fase | Especialista | Entregável | O que muda |
|---|------|-------------|------------|------------|
| 1 | **Discovery** | Product + Requirements | discovery.md | Merge PRD + Requisitos em um único documento. A IA faz coleta conversacional, gera PRD com requisitos integrados |
| 2 | **Design** | UX + Information Arch | design-doc.md | UX Design mantido. Pode incluir Stitch como sub-etapa |
| 3 | **Arquitetura** | Software Architect | arquitetura.md | Stack, C4, modelo de dados, segurança básica — tudo num documento |
| 4 | **Frontend** | Dev Frontend | frontend-code | Backlog implícito das user stories extraídas do discovery |
| 5 | **Backend** | Dev Backend | backend-code | Endpoints derivados da arquitetura |

**Redução:** 7 → 5 fases (-29%), eliminando Requisitos como fase separada e Backlog como fase separada.

### 6.3 Fluxo Médio Proposto (8 fases) — antes: 13

| # | Fase | Especialista | Entregável | O que muda |
|---|------|-------------|------------|------------|
| 1 | **Discovery** | Product Manager | PRD.md | Coleta conversacional profunda, PRD robusto |
| 2 | **Requisitos** | Eng. Requisitos | requisitos.md | Detalhamento técnico + critérios de aceite |
| 3 | **Design** | UX Design | design-doc.md | Wireframes, jornadas, design system |
| 4 | **Design Técnico** | Architect | technical-design.md | **MERGE**: Modelo de domínio + Banco + Arquitetura + Segurança. Um único documento técnico que cobre stack, entidades, schema, autenticação, ADRs |
| 5 | **Planejamento** | Tech Lead | backlog.md | **MERGE**: Backlog + Contrato API + Plano de testes. User stories com endpoints e critérios de teste integrados |
| 6 | **Frontend** | Dev Frontend | frontend-code | Code-phase-handler com tasks do backlog |
| 7 | **Backend** | Dev Backend | backend-code | Code-phase-handler com tasks do backlog |
| 8 | **Integração & Deploy** | DevOps | deploy.md | **MERGE**: Integração + Deploy (são a mesma preocupação) |

**Redução:** 13 → 8 fases (-38%), eliminando 5 fases redundantes.

### 6.4 Fluxo Complexo Proposto (11 fases) — antes: 17

| # | Fase | Especialista | Entregável | O que muda |
|---|------|-------------|------------|------------|
| 1 | **Discovery** | Product Manager | PRD.md | Igual ao médio |
| 2 | **Requisitos** | Eng. Requisitos | requisitos.md | Igual ao médio |
| 3 | **Design** | UX Design | design-doc.md | Igual ao médio |
| 4 | **Modelo de Domínio** | Domain Expert | modelo-dominio.md | DDD, bounded contexts, linguagem ubíqua. Separado porque projetos complexos exigem |
| 5 | **Design Técnico** | Architect | technical-design.md | Schema + Arquitetura + Segurança + Performance + Observabilidade integrados |
| 6 | **Contrato API** | API Designer | openapi.yaml | Separado porque em sistemas complexos o contrato é crítico para paralelismo |
| 7 | **Planejamento** | Tech Lead | backlog.md | Backlog com sprints + plano de testes |
| 8 | **Frontend** | Dev Frontend | frontend-code | Code-phase-handler |
| 9 | **Backend** | Dev Backend | backend-code | Code-phase-handler |
| 10 | **Integração** | DevOps | integration.md | E2E tests, CORS, mocks removidos |
| 11 | **Deploy & Operação** | DevOps/SRE | release.md | Deploy + monitoramento + runbooks |

**Redução:** 17 → 11 fases (-35%), eliminando 6 fases redundantes.

---

## 7. Proposta de Otimização: Skills Repensadas

### 7.1 Skills Eliminadas (merge ou remoção)

| Skill Atual | Destino | Justificativa |
|------------|---------|---------------|
| specialist-modelagem-dominio | Merge em Design Técnico (médio) ou mantida (complexo) | Redundante com Arquitetura no fluxo médio |
| specialist-banco-dados | Merge em Design Técnico | Schema é derivado do modelo de domínio |
| specialist-seguranca-informacao | Seção em Design Técnico | Checklist, não fase inteira |
| specialist-analise-testes | Seção em Planejamento | Plano de testes integrado ao backlog |
| specialist-performance-escalabilidade | Seção em Design Técnico | NFRs, não fase inteira |
| specialist-observabilidade | Seção em Deploy & Operação | Configurado no deploy, não fase inteira |
| specialist-arquitetura-avancada | Merge em Arquitetura (com flag complexo) | A mesma skill com depth condicional |
| specialist-acessibilidade | Seção em UX Design | Sempre deveria ser parte do design |
| specialist-dados-analytics-ia | Removida | Sem fase correspondente |
| specialist-debugging-troubleshooting | Mantida como utilitária | Não é fase, é ferramenta on-demand |
| specialist-desenvolvimento-mobile | Removida ou mantida como utilitária | Sem fase mobile no fluxo |
| specialist-documentacao-tecnica | Removida | Transversal, não fase |
| specialist-exploracao-codebase | Mantida como utilitária | Ferramenta útil on-demand |
| specialist-migracao-modernizacao | Removida | Cenário específico |
| specialist-mobile-design-avancado | Removida | Sem fase mobile |

### 7.2 Skills Propostas (mapeamento 1:1 com fases)

#### Fluxo Simples (5 skills)

| Skill | Fase | Foco |
|-------|------|------|
| **specialist-discovery** | Discovery | PRD + requisitos básicos integrados |
| **specialist-design** | Design | UX + wireframes + jornadas |
| **specialist-architect** | Arquitetura | Stack + C4 + modelo + segurança básica |
| **specialist-frontend** | Frontend | Componentes, hooks, pages, testes |
| **specialist-backend** | Backend | API, services, migrations, testes |

#### Fluxo Médio (8 skills)

| Skill | Fase | Foco |
|-------|------|------|
| **specialist-product** | Discovery | PRD focado em produto |
| **specialist-requirements** | Requisitos | RF, RNF, critérios de aceite |
| **specialist-design** | Design | UX + wireframes |
| **specialist-technical-design** | Design Técnico | Domínio + banco + arq + segurança |
| **specialist-planning** | Planejamento | Backlog + API contract + testes |
| **specialist-frontend** | Frontend | Code-phase |
| **specialist-backend** | Backend | Code-phase |
| **specialist-devops** | Integração & Deploy | CI/CD + monitoramento |

#### Fluxo Complexo (11 skills)

Adiciona ao médio:
| Skill | Fase | Foco |
|-------|------|------|
| **specialist-domain** | Modelo de Domínio | DDD, bounded contexts |
| **specialist-api-contract** | Contrato API | OpenAPI completo |
| **specialist-operations** | Deploy & Operação | Observabilidade + runbooks |

#### Skills Utilitárias (on-demand, sem fase)

| Skill | Uso |
|-------|-----|
| **specialist-debugging** | Invocada quando há bugs |
| **specialist-codebase-explorer** | Invocada para explorar código existente |
| **specialist-prototipagem-stitch** | Sub-etapa opcional da fase Design |

### 7.3 Conteúdo das Skills: Mais Enxuto, Mais Útil

**Antes (174-343 linhas por skill):**
- 80% boilerplate repetido em todas
- Referências a recursos inexistentes
- Frameworks que a LLM já conhece
- Métricas de performance aspiracionais

**Proposta (80-120 linhas por skill):**
```markdown
---
name: specialist-technical-design
description: Design técnico completo: modelo de domínio, schema de banco, arquitetura, segurança.
version: 3.0
---

# Design Técnico

## Escopo
Documento ÚNICO cobrindo: entidades, schema, stack, C4, ADRs, segurança.

## Entregável
`docs/04-technical-design/technical-design.md`

## Coleta (perguntar ao usuário)
1. Stack preferida ou restrições?
2. Nível de experiência do time?
3. Dados sensíveis ou compliance?
4. Integrações externas?
5. Volume esperado de dados/usuários?

## Seções Obrigatórias do Entregável
1. **Modelo de Domínio** — Entidades, relacionamentos, regras de negócio
2. **Schema de Banco** — Tabelas, tipos, índices, migrations
3. **Arquitetura** — C4 (nível 1-2), stack justificada, ADRs
4. **Segurança** — Autenticação, OWASP Top 10, dados sensíveis
5. **NFRs** — Performance, escalabilidade, disponibilidade

## Gate Checklist
- [ ] Entidades do domínio identificadas com atributos
- [ ] Schema de banco com PKs, FKs e índices
- [ ] Stack tecnológica justificada com ADRs
- [ ] Diagrama C4 nível 1-2
- [ ] Autenticação e autorização definidas
- [ ] NFRs mensuráveis

## Recursos
- resources/templates/technical-design.md
- resources/checklists/technical-design-validation.md
```

**Redução:** ~60% menos texto por skill, sem boilerplate, sem frameworks óbvios, foco no que a IA precisa para executar.

---

## 8. Impacto no Código

### 8.1 Mudanças Necessárias em `flows/types.ts`

- **FLUXO_SIMPLES:** 7 → 5 fases
- **FLUXO_MEDIO:** 13 → 8 fases
- **FLUXO_COMPLEXO:** 17 → 11 fases
- **PHASE_TYPE_MAP:** Atualizar com nomes de fases consolidadas
- **CODE_PHASE_NAMES:** Manter ['Frontend', 'Backend', 'Integração', 'Deploy & Operação']

### 8.2 Mudanças em `specialist-phase-handler.ts`

**Proposta:** Generalizar o handler para TODAS as fases, não apenas Fase 1:
- `handleCollecting` → funciona para qualquer fase com `getRequiredFields(fase, mode)`
- `handleGenerating` → template dinâmico por fase
- `handleValidating` → gate checklist dinâmico por fase
- Eliminar hardcoded "Gestão de Produto" / "PRD"

### 8.3 Mudanças em `proximo.ts`

**Proposta:** Extrair responsabilidades para módulos:
- `gate-validator.ts` → validação de gate (já existe parcialmente)
- `phase-transition.ts` → lógica de avanço de fase
- `classification.ts` → classificação progressiva
- `proximo.ts` → orquestrador fino (~200 linhas)

### 8.4 Mudanças em `specialist-formatters.ts`

- `getSpecialistQuestions()` → parametrizar por fase usando dados da skill
- Remover perguntas hardcoded — ler da skill ou do estado

---

## 9. Roadmap de Implementação

### Sprint 1: Simplificação de Fases (Prioridade ALTA)

| Task | Descrição | Esforço |
|------|-----------|---------|
| 1.1 | Redesenhar `flows/types.ts` com 3 fluxos enxutos | 4h |
| 1.2 | Atualizar `PHASE_TYPE_MAP` e `CODE_PHASE_NAMES` | 1h |
| 1.3 | Atualizar gate checklists para fases consolidadas | 2h |
| 1.4 | Atualizar `getSkillParaFase()` em `prompt-mapper.ts` | 1h |
| 1.5 | Atualizar testes unitários em `flows/types` | 2h |
| 1.6 | Testar migração de estado para projetos existentes | 2h |

**Total: ~12h**

### Sprint 2: Skills Enxutas (Prioridade ALTA)

| Task | Descrição | Esforço |
|------|-----------|---------|
| 2.1 | Criar 8 skills novas (médio) com formato enxuto | 6h |
| 2.2 | Criar templates de entregáveis para fases consolidadas | 4h |
| 2.3 | Criar checklists de validação para fases consolidadas | 2h |
| 2.4 | Remover ou arquivar 15 skills obsoletas | 1h |
| 2.5 | Atualizar `skill-loader.service.ts` para novo mapeamento | 2h |

**Total: ~15h**

### Sprint 3: Generalizar Specialist Handler (Prioridade MÉDIA)

| Task | Descrição | Esforço |
|------|-----------|---------|
| 3.1 | Extrair `getRequiredFields()` para aceitar fase genérica | 3h |
| 3.2 | Parametrizar `handleCollecting` por fase (não só PRD) | 4h |
| 3.3 | Parametrizar `handleGenerating` com template dinâmico | 3h |
| 3.4 | Parametrizar `handleValidating` com gate dinâmico | 2h |
| 3.5 | Atualizar `avancar.ts` para usar specialist-handler em TODAS as fases | 2h |
| 3.6 | Testes de integração do novo fluxo | 3h |

**Total: ~17h**

### Sprint 4: Refatorar proximo.ts (Prioridade MÉDIA)

| Task | Descrição | Esforço |
|------|-----------|---------|
| 4.1 | Extrair `phase-transition.ts` (~200 linhas) | 3h |
| 4.2 | Extrair `classification-handler.ts` (~150 linhas) | 3h |
| 4.3 | Simplificar `proximo.ts` para orquestrador (~300 linhas) | 4h |
| 4.4 | Atualizar imports e testes | 2h |

**Total: ~12h**

### Sprint 5: Migração e Validação (Prioridade BAIXA)

| Task | Descrição | Esforço |
|------|-----------|---------|
| 5.1 | Migration guide v9 → v10 | 2h |
| 5.2 | Teste manual completo do fluxo simples | 3h |
| 5.3 | Teste manual completo do fluxo médio | 3h |
| 5.4 | Teste manual completo do fluxo complexo | 3h |
| 5.5 | Documentar novo formato de skills | 2h |

**Total: ~13h**

### Resumo do Roadmap

| Sprint | Foco | Esforço | Impacto |
|--------|------|---------|---------|
| Sprint 1 | Fases enxutas | 12h | 🔴 Crítico |
| Sprint 2 | Skills enxutas | 15h | 🔴 Crítico |
| Sprint 3 | Specialist handler genérico | 17h | 🟡 Alto |
| Sprint 4 | Refatorar proximo.ts | 12h | 🟡 Alto |
| Sprint 5 | Migração e testes | 13h | 🟢 Médio |
| **TOTAL** | | **~69h** | |

---

## 10. Métricas de Sucesso

### Antes (v9)

| Métrica | Simples | Médio | Complexo |
|---------|---------|-------|----------|
| Fases de documento | 5 | 10 | 13 |
| Fases de código | 2 | 3 | 4 |
| Skills ativas | 7 | 13 | 17 |
| Skills órfãs | 18 | 12 | 8 |
| Documentos antes do código | 5 | 10 | 13 |
| Tempo estimado até 1ª linha de código | ~5h | ~10h | ~13h |

### Depois (v10 proposto)

| Métrica | Simples | Médio | Complexo |
|---------|---------|-------|----------|
| Fases de documento | 3 | 5 | 7 |
| Fases de código | 2 | 3 | 4 |
| Skills ativas | 5 | 8 | 11 |
| Skills órfãs | 3 | 3 | 3 |
| Documentos antes do código | 3 | 5 | 7 |
| Tempo estimado até 1ª linha de código | ~3h | ~5h | ~7h |

### Ganhos Esperados

- **-38% fases** no fluxo médio (13 → 8)
- **-35% fases** no fluxo complexo (17 → 11)
- **-50% tempo** até primeira linha de código
- **-60% conteúdo** por skill (menos boilerplate)
- **-15 skills** removidas/mergeadas
- **Zero skills órfãs** sem fase vinculada
- **Consistência:** Cada fase = 1 skill = 1 entregável

---

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Perda de profundidade ao mergear fases | Médio | Templates de fases consolidadas com TODAS as seções obrigatórias |
| Projetos existentes quebram com nova numeração | Alto | Migration script automático + backward compatibility layer |
| Contexto insuficiente para fases de código | Médio | Design Técnico como documento "fonte da verdade" completo |
| Specialist handler genérico é complexo | Alto | Implementar incrementalmente, começando por fase 2 (Requisitos) |
| Skills enxutas perdem informação útil | Baixo | Mover conteúdo detalhado para resources/, não eliminar |

---

## 12. Conclusão

O sistema Maestro construiu uma base arquitetural sólida (state machine, gates, skills, classificação progressiva), mas o **design das fases está over-engineered para o contexto de IA assistida**. O principal problema não é a qualidade do código, mas a **quantidade de fases de documento** que a IA gera para si mesma validar antes de produzir código real.

A proposta mantém toda a infraestrutura de gates, validação, skills e state machines — mas reorganiza o **conteúdo** de forma que:

1. Fases sobrepostas viram uma fase consolidada
2. Checklists transversais (segurança, testes, performance) viram seções, não fases
3. Skills são 1:1 com fases, sem órfãs
4. O tempo até código produtivo cai pela metade

A reordenação proposta respeita o princípio de que **contexto acumulado é valioso**, mas reconhece que **13 documentos markdown não é contexto — é burocracia**.
