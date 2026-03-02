# Migration Guide — Maestro v9 → v10

> **Data:** 2026-03-01  
> **Breaking changes:** Sim — nomes de fases, skills e numeração mudaram

---

## Resumo das Mudanças

### Fluxos Enxutos

| Nível | v9 (antes) | v10 (depois) | Redução |
|-------|-----------|-------------|---------|
| Simples | 7 fases | 5 fases | -29% |
| Médio | 13 fases | 8 fases | -38% |
| Complexo | 17 fases | 11 fases | -35% |

### Fases Eliminadas (mergeadas)

| Fase v9 | Destino v10 |
|---------|------------|
| Modelo de Domínio (médio) | Mergeado em **Design Técnico** |
| Banco de Dados | Mergeado em **Design Técnico** |
| Segurança | Mergeado em **Design Técnico** |
| Testes | Mergeado em **Planejamento** |
| Performance | Mergeado em **Design Técnico** |
| Observabilidade | Mergeado em **Deploy & Operação** |
| Arquitetura Avançada | Mergeado em **Design Técnico** |
| Backlog (simples) | Mergeado em **Discovery** (Arquitetura tem user stories implícitas) |

### Fases Renomeadas

| v9 | v10 |
|----|-----|
| Produto (simples) | **Discovery** |
| UX Design | **Design** |
| Backlog + Contrato API (médio) | **Planejamento** |
| Integração + Deploy Final | **Integração & Deploy** / **Deploy & Operação** |

### Skills Renomeadas

| Skill v9 | Skill v10 |
|----------|----------|
| specialist-gestao-produto | **specialist-product** (médio) / **specialist-discovery** (simples) |
| specialist-engenharia-requisitos-ia | **specialist-requirements** |
| specialist-ux-design | **specialist-design** |
| specialist-arquitetura-software | **specialist-architect** (simples) / **specialist-technical-design** (médio) |
| specialist-plano-execucao-ia | **specialist-planning** |
| specialist-desenvolvimento-frontend | **specialist-frontend** |
| specialist-desenvolvimento-backend | **specialist-backend** |
| specialist-devops-infra | **specialist-devops** |
| specialist-modelagem-dominio | **specialist-domain** (complexo only) |
| specialist-contrato-api | **specialist-api-contract** (complexo only) |

### Skills Removidas

| Skill v9 | Motivo |
|----------|--------|
| specialist-banco-dados | Mergeado em specialist-technical-design |
| specialist-seguranca-informacao | Mergeado em specialist-technical-design |
| specialist-analise-testes | Mergeado em specialist-planning |
| specialist-arquitetura-avancada | Mergeado em specialist-technical-design |
| specialist-performance-escalabilidade | Mergeado em specialist-technical-design |
| specialist-observabilidade | Mergeado em specialist-operations |
| specialist-dados-analytics-ia | Sem fase correspondente |
| specialist-acessibilidade | Mergeado em specialist-design |
| specialist-documentacao-tecnica | Sem fase correspondente |
| specialist-migracao-modernizacao | Sem fase correspondente |
| specialist-desenvolvimento-mobile | Sem fase correspondente |
| specialist-mobile-design-avancado | Sem fase correspondente |

---

## Migração Automática

O sistema detecta automaticamente projetos v9 pelo `total_fases` (7, 13 ou 17) e migra para v10 (5, 8 ou 11).

**O que a migração automática faz:**
1. Atualiza `total_fases` para o novo valor
2. Remapeia `fase_atual` para o número da fase v10 correspondente
3. Atualiza `gates_validados` com nova numeração
4. Adiciona `readiness_approved = false`
5. Preserva todos os `entregaveis` já gerados

**O que NÃO faz:**
- Não renomeia pastas de docs existentes (ex: `docs/fase-07-seguranca/` continua existindo)
- Não remove skills antigas do projeto
- Não re-gera entregáveis

---

## Novos Recursos

### Readiness Gate
Checkpoint consolidado antes de entrar em fases de código. Verifica se PRD, Arquitetura, Backlog etc. existem no disco.

### PhaseConfig Dinâmico
Specialist handler agora funciona para TODAS as fases de documento (não apenas PRD). Carrega perguntas de coleta da SKILL.md da fase.

### Doc Automático de Fases
Ao criar projeto, gera `docs/00-setup/plano-orquestracao.md` com lista completa de fases, especialistas e gate checklists.

### Skip Validation
Fases de código que passaram pelo code-validator não são re-validadas por keywords no proximo.ts.

---

## Ação para Desenvolvedores

1. **Atualizar imports** que referenciam nomes de skills antigos
2. **Atualizar testes** que verificam total_fases ou nomes de fases
3. **Deployar novas skills** com `deploySkillsToProject()` nos projetos existentes
4. **Verificar** que `flows/types.ts` tem os novos fluxos corretos

## Ação para Usuários

Projetos existentes são migrados automaticamente. Nenhuma ação necessária.
Se problemas ocorrerem, o sistema cai em fallback para `proximo.ts` (comportamento v9).
