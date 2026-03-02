# Roadmap: Novas Skills dos Especialistas Maestro v10

> **Data:** 2026-03-01  
> **Escopo:** Redesign completo das skills de especialistas com personas robustas, recursos completos e integração com skills complementares  
> **Documento relacionado:** `ANALISE_CRITICA_FASES_E_SKILLS_v9.md`

---

## Parte 1: Como Skills Funcionam nas IDEs com IA

### 1.1 Windsurf — Skills (docs oficiais)

**Conceito central:** Skills são pacotes de conhecimento que o Cascade (IA) invoca automaticamente via **progressive disclosure** — só carrega quando relevante.

**Estrutura oficial:**
```
.windsurf/skills/<skill-name>/
├── SKILL.md              # Metadata + instruções (OBRIGATÓRIO)
├── deployment-checklist.md  # Recursos de apoio
├── rollback-procedure.md    # Recursos de apoio
└── config-template.yaml     # Templates
```

**Frontmatter obrigatório:**
```yaml
---
name: deploy-to-production      # Identificador único (lowercase, hyphens)
description: Guides deployment   # Usado para decidir QUANDO invocar
---
```

**Invocação:**
- **Automática:** Cascade lê a `description` e decide se é relevante para a tarefa
- **Manual:** Usuário digita `@skill-name` no chat

**Escopo:**
| Escopo | Localização | Disponibilidade |
|--------|------------|-----------------|
| Workspace | `.windsurf/skills/` | Projeto atual |
| Global | `~/.codeium/windsurf/skills/` | Todos os projetos |

**Best Practices (docs Windsurf):**
1. **Descriptions claras** — a description é o que faz a IA decidir invocar
2. **Incluir recursos relevantes** — templates, checklists, exemplos
3. **Nomes descritivos** — `deploy-to-staging` > `deploy1`
4. **Skills ≠ Rules** — Skills = tarefas multi-step com recursos; Rules = preferências comportamentais

### 1.2 Cursor — Rules + Agent Skills

**Conceito:** Cursor usa "Rules" com 4 tipos (Project, User, Team, AGENTS.md). Cursor também suporta **Agent Skills** como import.

**Tipos de Rules:**
| Tipo | Comportamento |
|------|--------------|
| Always Apply | Inclusa em TODA sessão |
| Apply Intelligently | IA decide se é relevante baseado na `description` |
| Apply to Specific Files | Ativa por glob pattern (ex: `*.tsx`) |
| Apply Manually | Ativada via `@rule-name` |

**Agent Skills no Cursor:** São importadas como rules "agent-decided" — a IA decide quando usar. O padrão Agent Skills (`agentskills.io`) é interoperável entre IDEs.

**Best Practices (docs Cursor):**
- Rules < 500 linhas
- Dividir regras grandes em múltiplas compostas
- Exemplos concretos e referências a arquivos
- Não copiar style guides inteiros (a IA já conhece)
- Não documentar comandos óbvios (npm, git)
- Referenciar arquivos em vez de copiar conteúdo

### 1.3 Antigravity — Skills

**Conceito:** Segue o padrão `agentskills.io` com Progressive Disclosure. Estrutura idêntica ao Windsurf.

```
.agent/skills/<skill-name>/
├── SKILL.md
├── scripts/       # Scripts opcionais
├── references/    # Documentação e templates
└── assets/        # Imagens
```

### 1.4 Padrão Universal: agentskills.io

O padrão **Agent Skills** (`agentskills.io`) é compartilhado entre Windsurf, Cursor e Antigravity:
- **SKILL.md** com frontmatter (`name`, `description`)
- **Recursos** na mesma pasta
- **Progressive Disclosure** — conteúdo carregado sob demanda
- **Description é rei** — é o que faz a IA decidir quando ativar

### 1.5 Implicações para o Maestro

| Aspecto | Atual | Proposta |
|---------|-------|----------|
| Localização | `content/skills/` (repositório) → copiado para `.windsurf/skills/` | Manter `content/skills/` como fonte → script de deploy para IDEs |
| Frontmatter | `name` + `description` + campos custom | Manter apenas `name` + `description` (padrão universal) |
| Tamanho SKILL.md | 174-343 linhas | **< 200 linhas** (best practice Cursor: < 500; queremos menor por fase) |
| Recursos | Referenciados mas inexistentes | **Obrigatórios** — template, checklist, exemplos REAIS |
| Invocação | MCP injeta via `formatSkillHydrationCommand()` | Manter MCP + permitir `@skill-name` nativo da IDE |
| Compatibilidade | Windsurf apenas | **Multi-IDE**: Windsurf, Cursor, Antigravity |

---

## Parte 2: Anatomia da Nova Skill de Especialista

### 2.1 Estrutura de Diretório por Skill

```
content/skills/specialist-<nome>/
├── SKILL.md                          # Persona + instruções (< 200 linhas)
├── resources/
│   ├── templates/
│   │   └── <entregavel>.md           # Template completo do documento
│   ├── checklists/
│   │   └── gate-checklist.md         # Checklist de validação (gate)
│   ├── examples/
│   │   └── example-<tipo>.md         # Exemplo real preenchido
│   └── reference/
│       └── guide.md                  # Guia de referência técnica
└── complementary-skills.md           # Lista de skills complementares
```

### 2.2 Formato do SKILL.md — Novo Padrão v3

```markdown
---
name: specialist-technical-design
description: Cria Design Técnico completo cobrindo modelo de domínio, schema de 
  banco, arquitetura de software e segurança. Use quando precisar de blueprint 
  técnico antes de implementar código.
---

# 🏗️ Especialista em Design Técnico

## Persona

**Nome:** Arquiteto de Soluções
**Tom:** Técnico, direto, orientado a trade-offs
**Expertise:** Arquitetura de software, DDD, bancos de dados, segurança
**Comportamento:**
- Sempre justifica decisões com ADRs
- Pergunta sobre restrições antes de propor soluções
- Prioriza simplicidade (KISS) sobre elegância
- Considera custo, time e escalabilidade
- Referencia padrões da indústria (C4, OWASP, 12-factor)

**Frases características:**
- "Qual é o volume esperado? Isso muda a arquitetura completamente."
- "Vamos documentar isso como ADR antes de avançar."
- "Monolito primeiro, microserviços quando justificado por dados."

## Missão

Gerar documento único de Design Técnico cobrindo domínio, banco, arquitetura 
e segurança em ~60 minutos, garantindo que o time tenha blueprint completo 
para implementar.

## Entregável

`docs/04-technical-design/technical-design.md`

## Coleta Conversacional

Pergunte ao usuário ANTES de gerar o documento:

1. **Stack:** Tem preferência ou restrições de tecnologia?
2. **Time:** Quantos devs? Senioridade? Tecnologias que dominam?
3. **Dados:** Volume esperado? Dados sensíveis (LGPD)?
4. **Integrações:** APIs externas? Pagamento? Email? Auth social?
5. **Infra:** Onde vai hospedar? Orçamento de infra?
6. **Escala:** Usuários simultâneos? Picos de uso?

## Seções Obrigatórias do Entregável

1. **Modelo de Domínio** — Entidades, relacionamentos, regras de negócio
2. **Schema de Banco** — Tabelas, tipos, PKs/FKs, índices, migrations
3. **Arquitetura** — C4 (nível 1-2), stack justificada, ADRs
4. **Segurança** — Autenticação, OWASP Top 10, dados sensíveis
5. **NFRs** — Performance, escalabilidade, disponibilidade

## Gate Checklist

- [ ] Entidades do domínio com atributos e relacionamentos
- [ ] Schema de banco com PKs, FKs e índices planejados
- [ ] Stack tecnológica justificada com pelo menos 2 ADRs
- [ ] Diagrama C4 nível 1 e 2
- [ ] Autenticação e autorização definidas
- [ ] NFRs mensuráveis (tempo de resposta, disponibilidade)

## Recursos

Leia antes de gerar o entregável:
- `resources/templates/technical-design.md` — Template do documento
- `resources/checklists/gate-checklist.md` — Critérios de aprovação
- `resources/examples/example-saas.md` — Exemplo de SaaS médio
- `resources/reference/guide.md` — Guia de referência

## Skills Complementares

Invoque quando necessário:
- `@api-patterns` — Padrões REST/GraphQL para definir endpoints
- `@database-design` — Schema design avançado e índices
- `@clean-code` — Princípios de código limpo para ADRs
- `@architecture` — C4 e padrões arquiteturais

## Próximo Especialista

Após aprovação: **Especialista de Planejamento** (`specialist-planning`)
```

### 2.3 Contrato de Qualidade por Recurso

| Recurso | Tamanho Mínimo | Conteúdo Obrigatório |
|---------|---------------|---------------------|
| **SKILL.md** | 100-200 linhas | Persona, missão, coleta, seções, gate, recursos |
| **Template** | 200-500 linhas | Todas as seções com placeholders e instruções |
| **Checklist** | 30-80 linhas | Itens verificáveis, scores, critérios pass/fail |
| **Example** | 300-800 linhas | Exemplo REAL preenchido (não genérico) |
| **Guide** | 100-300 linhas | Referência técnica, frameworks, anti-patterns |

---

## Parte 3: Mapeamento de Skills Complementares

### 3.1 Inventário de Skills Complementares Existentes

| Skill | Tipo | Linhas | Qualidade | Útil para |
|-------|------|--------|-----------|-----------|
| `brainstorming` | Processo | 164 | Alta | Discovery, coleta conversacional |
| `clean-code` | Padrões | 202 | Alta | Todas as fases de código |
| `api-patterns` | Técnica | 82+ | Alta | Design Técnico, Contrato API |
| `testing-patterns` | Técnica | 179 | Média | Planejamento, Backend, Integração |
| `tdd-workflow` | Processo | 150 | Média | Frontend, Backend |
| `react-patterns` | Técnica | 199 | Alta | Frontend |
| `architecture` | Técnica | ? | ? | Design Técnico |
| `database-design` | Técnica | ? | ? | Design Técnico |
| `frontend-design` | Técnica | ? | ? | Design |
| `code-review-checklist` | Processo | ? | ? | Todas as fases de código |
| `plan-writing` | Processo | ? | ? | Discovery, Planejamento |
| `deployment-procedures` | Técnica | ? | ? | Deploy & Operação |
| `nodejs-best-practices` | Técnica | ? | ? | Backend |
| `nextjs-best-practices` | Técnica | ? | ? | Frontend |
| `tailwind-patterns` | Técnica | ? | ? | Frontend |
| `performance-profiling` | Técnica | ? | ? | Design Técnico |
| `lint-and-validate` | Processo | ? | ? | Todas as fases de código |
| `webapp-testing` | Técnica | ? | ? | Integração |

### 3.2 Mapeamento: Especialista → Skills Complementares

| Especialista | Skills Complementares Recomendadas |
|-------------|-----------------------------------|
| **Discovery** | `brainstorming`, `plan-writing` |
| **Requisitos** | `brainstorming`, `plan-writing` |
| **Design (UX)** | `frontend-design`, `mobile-design` |
| **Design Técnico** | `api-patterns`, `database-design`, `architecture`, `performance-profiling` |
| **Planejamento** | `plan-writing`, `testing-patterns` |
| **Frontend** | `react-patterns`, `nextjs-best-practices`, `tailwind-patterns`, `clean-code`, `tdd-workflow` |
| **Backend** | `api-patterns`, `nodejs-best-practices`, `clean-code`, `tdd-workflow`, `database-design` |
| **Integração** | `testing-patterns`, `webapp-testing`, `deployment-procedures` |
| **Deploy & Operação** | `deployment-procedures`, `performance-profiling` |

### 3.3 Decisão: Unir ou Referenciar?

**Princípio:** Skills complementares devem ser **referenciadas** (não unidas), porque:
1. **Progressive Disclosure** — carregam sob demanda, economizando tokens
2. **Reutilização** — mesma skill complementar serve múltiplos especialistas
3. **Manutenção** — atualizar `react-patterns` uma vez atualiza para todos
4. **Invocação nativa** — `@react-patterns` funciona direto na IDE

**Implementação:**
- `SKILL.md` do especialista lista skills complementares na seção `## Skills Complementares`
- O MCP, ao montar o contexto do especialista, pode mencionar as skills complementares
- A IA decide se invoca as complementares baseado no que está fazendo

### 3.4 Skills Complementares que Precisam de Melhoria

| Skill | Problema | Ação |
|-------|----------|------|
| `api-patterns` | Excelente (82+ linhas com content map) | Manter |
| `testing-patterns` | Boa mas sem exemplos de código | Adicionar examples/ |
| `tdd-workflow` | Boa | Manter |
| `react-patterns` | Boa | Manter |
| `brainstorming` | Ótima (Socratic gate) | Manter |
| `clean-code` | Ótima | Manter |
| `database-design` | Verificar conteúdo | Atualizar se necessário |
| `architecture` | Verificar conteúdo | Atualizar se necessário |
| `deployment-procedures` | Verificar conteúdo | Atualizar se necessário |

---

## Parte 4: Plano de Criação das Novas Skills (Fluxo Médio — 8 fases)

### 4.1 Visão Geral

| # | Fase | Skill Nova | Template | Exemplo |
|---|------|-----------|----------|---------|
| 1 | Discovery | `specialist-product` | PRD.md | example-saas.md |
| 2 | Requisitos | `specialist-requirements` | requisitos.md | example-requirements.md |
| 3 | Design | `specialist-design` | design-doc.md | example-design.md |
| 4 | Design Técnico | `specialist-technical-design` | technical-design.md | example-technical.md |
| 5 | Planejamento | `specialist-planning` | backlog.md | example-backlog.md |
| 6 | Frontend | `specialist-frontend` | (code-phase) | — |
| 7 | Backend | `specialist-backend` | (code-phase) | — |
| 8 | Integração & Deploy | `specialist-devops` | deploy.md | example-deploy.md |

### 4.2 Sprint 1: Personas e SKILL.md (todas as 8)

**Objetivo:** Criar SKILL.md com persona robusta para cada especialista.

| Task | Skill | Persona | Prioridade |
|------|-------|---------|-----------|
| 1.1 | `specialist-product` | Product Manager — estratégico, focado em valor | Alta |
| 1.2 | `specialist-requirements` | Eng. de Requisitos — analítico, Gherkin-first | Alta |
| 1.3 | `specialist-design` | UX Designer — empático, mobile-first, WCAG | Alta |
| 1.4 | `specialist-technical-design` | Arquiteto — trade-off aware, ADR-driven | Alta |
| 1.5 | `specialist-planning` | Tech Lead — pragmático, sprint-focused | Alta |
| 1.6 | `specialist-frontend` | Dev Frontend — component-driven, performance | Média |
| 1.7 | `specialist-backend` | Dev Backend — API-first, type-safe | Média |
| 1.8 | `specialist-devops` | SRE — infra-as-code, observability-first | Média |

**Definição de cada persona inclui:**
- Nome do papel
- Tom de comunicação
- Áreas de expertise (5-7 tópicos)
- Comportamentos esperados (5-7 regras)
- Frases características (3-5 exemplos)
- O que NÃO fazer (anti-patterns do papel)

**Esforço:** ~16h (2h por skill)

### 4.3 Sprint 2: Templates de Entregáveis (6 fases de documento)

**Objetivo:** Criar template completo para cada entregável.

| Task | Template | Seções | Estimativa |
|------|----------|--------|------------|
| 2.1 | `PRD.md` | Problema, Personas, MVP, Métricas, Riscos, Timeline | 3h |
| 2.2 | `requisitos.md` | RF, RNF, Critérios Aceite (Gherkin), Matriz | 3h |
| 2.3 | `design-doc.md` | Jornadas, Wireframes, Design System, Navegação | 3h |
| 2.4 | `technical-design.md` | Domínio, Schema, Arquitetura, Segurança, NFRs | 4h |
| 2.5 | `backlog.md` | Épicos, User Stories FE/BE, Sprints, DoD, API Contract | 3h |
| 2.6 | `deploy.md` | CI/CD, Infra, Monitoramento, Runbooks, Rollback | 2h |

**Cada template inclui:**
- Cabeçalho com metadata (projeto, fase, data)
- Seções com instruções inline `<!-- instrução -->`
- Placeholders marcados `[PREENCHER]`
- Exemplos inline em cada seção
- Checklist de completude no final

**Esforço:** ~18h

### 4.4 Sprint 3: Exemplos Reais (6 fases de documento)

**Objetivo:** Criar exemplo preenchido para cada template.

| Task | Exemplo | Cenário Base | Estimativa |
|------|---------|-------------|------------|
| 3.1 | `example-prd.md` | SaaS de gestão de tarefas | 3h |
| 3.2 | `example-requirements.md` | Mesmo cenário | 2h |
| 3.3 | `example-design.md` | Mesmo cenário | 3h |
| 3.4 | `example-technical.md` | Mesmo cenário (Next.js + NestJS + PostgreSQL) | 4h |
| 3.5 | `example-backlog.md` | Mesmo cenário | 2h |
| 3.6 | `example-deploy.md` | Mesmo cenário (Vercel + Railway + GitHub Actions) | 2h |

**Princípio:** Todos os exemplos usam o MESMO projeto fictício para demonstrar continuidade entre fases.

**Esforço:** ~16h

### 4.5 Sprint 4: Checklists e Guias de Referência

**Objetivo:** Criar gate-checklist.md e guide.md para cada skill.

| Task | Recurso | Estimativa |
|------|---------|------------|
| 4.1 | 8 gate-checklists (1 por skill) | 8h |
| 4.2 | 6 guides de referência (fases de doc) | 6h |
| 4.3 | 2 guides operacionais (fases de código) | 2h |

**Cada checklist inclui:**
- Itens com peso (crítico / importante / desejável)
- Critério pass/fail por item
- Score mínimo para aprovação
- Instruções de correção por item

**Esforço:** ~16h

### 4.6 Sprint 5: Integração com Sistema + Testes

**Objetivo:** Conectar as novas skills ao sistema Maestro.

| Task | Descrição | Estimativa |
|------|-----------|------------|
| 5.1 | Atualizar `flows/types.ts` — fluxos enxutos | 4h |
| 5.2 | Atualizar `prompt-mapper.ts` — mapeamento fase → skill | 2h |
| 5.3 | Atualizar `ide-paths.ts` — paths para novos nomes de skill | 2h |
| 5.4 | Atualizar `specialist-formatters.ts` — perguntas dinâmicas da skill | 3h |
| 5.5 | Atualizar `skill-loader.service.ts` — carregar novos recursos | 2h |
| 5.6 | Script de deploy: `content/skills/` → `.windsurf/skills/` | 2h |
| 5.7 | Script de deploy: `content/skills/` → `.cursor/rules/` (compat) | 2h |
| 5.8 | Testes manuais — fluxo completo | 6h |

**Esforço:** ~23h

---

## Parte 5: Mudanças Necessárias no Sistema

### 5.1 Arquivo: `src/src/utils/ide-paths.ts`

**Mudança:** Atualizar mapeamento de skill paths para suportar multi-IDE.

```typescript
// Antes: paths hardcoded para Windsurf
const SKILL_DIRS: Record<IDEType, string> = {
    windsurf: '.windsurf/skills',
    cursor: '.cursor/rules',       // Cursor não tinha skills antes
    antigravity: '.agent/skills',
};

// Depois: suportar skills como rules no Cursor
function getSkillPath(skillName: string, ide: IDEType): string {
    if (ide === 'cursor') {
        // Cursor importa Agent Skills como rules
        return `.cursor/rules/${skillName}.md`;
    }
    return `${SKILL_DIRS[ide]}/${skillName}/SKILL.md`;
}
```

### 5.2 Arquivo: `src/src/utils/prompt-mapper.ts`

**Mudança:** Mapear nomes de fases consolidadas para novas skills.

```typescript
// Antes
const FASE_SKILL_MAP: Record<string, string> = {
    'Produto': 'specialist-gestao-produto',
    'Requisitos': 'specialist-engenharia-requisitos-ia',
    'Modelo de Domínio': 'specialist-modelagem-dominio',
    // ... 17 entradas
};

// Depois
const FASE_SKILL_MAP: Record<string, string> = {
    'Discovery': 'specialist-product',
    'Requisitos': 'specialist-requirements',
    'Design': 'specialist-design',
    'Design Técnico': 'specialist-technical-design',
    'Planejamento': 'specialist-planning',
    'Frontend': 'specialist-frontend',
    'Backend': 'specialist-backend',
    'Integração & Deploy': 'specialist-devops',
    // Complexo adiciona:
    'Modelo de Domínio': 'specialist-domain',
    'Contrato API': 'specialist-api-contract',
    'Deploy & Operação': 'specialist-operations',
};
```

### 5.3 Arquivo: `src/src/handlers/specialist-formatters.ts`

**Mudança:** `getSpecialistQuestions()` deve ler perguntas da skill em vez de hardcoded.

```typescript
// Antes: perguntas hardcoded por fase
if (nome === 'requisitos') { return `## Perguntas ...\n### 1. Volume...`; }

// Depois: ler da skill
export async function getSpecialistQuestions(
    fase: number, 
    faseNome: string,
    diretorio: string
): Promise<string> {
    const skillName = getSkillParaFase(faseNome);
    if (!skillName) return '';
    
    // Ler seção "## Coleta Conversacional" do SKILL.md
    const skillContent = await loadSkillContent(diretorio, skillName);
    return extractSection(skillContent, 'Coleta Conversacional') || '';
}
```

### 5.4 Arquivo: `src/src/middleware/skill-injection.middleware.ts`

**Mudança:** Ao injetar contexto do especialista, também mencionar skills complementares.

```typescript
// Novo: Ler "## Skills Complementares" da skill ativa
const complementary = extractSection(skillContent, 'Skills Complementares');
if (complementary) {
    output += `\n\n## 🔗 Skills Complementares Disponíveis\n${complementary}`;
    output += `\n> 💡 Use @skill-name para invocar uma skill complementar.`;
}
```

### 5.5 Arquivo: `src/src/handlers/specialist-phase-handler.ts`

**Mudança:** Generalizar para TODAS as fases (não apenas Fase 1/PRD).

- `handleCollecting` → aceitar campos dinâmicos da skill (seção "Coleta Conversacional")
- `handleGenerating` → usar template da skill (`resources/templates/`)
- `handleValidating` → usar checklist da skill (`resources/checklists/`)
- Remover referências hardcoded a "Gestão de Produto" e "PRD"

### 5.6 Script de Deploy de Skills

**Novo arquivo:** `scripts/deploy-skills.ts`

```typescript
/**
 * Copia skills de content/skills/ para o diretório da IDE ativa.
 * Executado pelo MCP ao iniciar projeto (iniciar-projeto.ts).
 */
async function deploySkills(
    contentDir: string,   // content/skills/
    projectDir: string,   // Diretório do projeto
    ide: IDEType          // windsurf | cursor | antigravity
): Promise<void> {
    const targetDir = getSkillsDir(ide);
    const skills = await listSkillDirs(contentDir);
    
    for (const skill of skills) {
        await copySkillToProject(
            join(contentDir, skill),
            join(projectDir, targetDir, skill)
        );
    }
}
```

### 5.7 Compatibilidade Cursor

Para Cursor, skills precisam ser convertidas em "Project Rules":

```
content/skills/specialist-product/SKILL.md
  → .cursor/rules/specialist-product.mdc

# Conversão: SKILL.md → .mdc
---
description: "Product Manager specialist for PRD creation..."
alwaysApply: false
---
[conteúdo do SKILL.md sem frontmatter original]
```

Recursos ficam no mesmo diretório e são referenciados com `@filename.md`.

---

## Parte 6: Cronograma e Esforço Total

### Resumo por Sprint

| Sprint | Foco | Esforço | Deps |
|--------|------|---------|------|
| 1 | Personas e SKILL.md (8 skills) | 16h | Nenhuma |
| 2 | Templates de entregáveis (6 templates) | 18h | Sprint 1 |
| 3 | Exemplos reais preenchidos (6 exemplos) | 16h | Sprint 2 |
| 4 | Checklists e guias (8+8 docs) | 16h | Sprint 2 |
| 5 | Integração com sistema + testes | 23h | Sprint 1-4 |
| **TOTAL** | | **~89h** | |

### Prioridade de Execução

**Fase 1 (Crítico — Sprints 1+2):** 34h
- SKILL.md com personas + templates de entregáveis
- Resultado: Skills funcionais para uso imediato

**Fase 2 (Alto — Sprints 3+4):** 32h
- Exemplos + checklists
- Resultado: Skills com recursos completos

**Fase 3 (Médio — Sprint 5):** 23h
- Integração com sistema
- Resultado: Skills funcionando automaticamente via Maestro

### Entregáveis Finais

Ao concluir todos os sprints:

```
content/skills/
├── specialist-product/
│   ├── SKILL.md (persona + instruções)
│   ├── resources/templates/PRD.md
│   ├── resources/checklists/gate-checklist.md
│   ├── resources/examples/example-saas.md
│   └── resources/reference/guide.md
├── specialist-requirements/
│   └── (mesma estrutura)
├── specialist-design/
│   └── (mesma estrutura)
├── specialist-technical-design/
│   └── (mesma estrutura)
├── specialist-planning/
│   └── (mesma estrutura)
├── specialist-frontend/
│   ├── SKILL.md (persona + instruções)
│   └── resources/reference/guide.md
├── specialist-backend/
│   ├── SKILL.md (persona + instruções)
│   └── resources/reference/guide.md
└── specialist-devops/
    ├── SKILL.md (persona + instruções)
    ├── resources/templates/deploy.md
    └── resources/reference/guide.md
```

**Total: 8 skills novas, ~50 recursos, personas robustas, multi-IDE compatible.**

---

## Parte 7: Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Templates muito longos sobrecarregam contexto | Alto | Limit < 500 linhas; skeleton loading |
| Exemplos ficam desatualizados | Médio | Usar projeto fictício atemporal |
| Skills complementares não invocadas pela IA | Médio | Menção explícita no SKILL.md do especialista |
| Cursor não suporta recursos na pasta da skill | Alto | Converter para .mdc com @mentions |
| Perguntas da persona são ignoradas pela IA | Médio | Instruções no MCP forçam coleta conversacional |
| Backward compatibility com projetos existentes | Alto | Migration script + fallback para skills antigas |

---

## Parte 8: Checklist de Validação Final

Cada skill deve passar neste checklist antes de ser considerada pronta:

- [ ] **SKILL.md** < 200 linhas com persona completa
- [ ] **Template** cobre TODAS as seções do gate checklist
- [ ] **Exemplo** é preenchido com dados realistas (não genéricos)
- [ ] **Checklist** tem itens verificáveis com critérios claros
- [ ] **Guide** é conciso e referencia frameworks reais
- [ ] **Skills complementares** listadas e testadas
- [ ] **Multi-IDE** funciona em Windsurf + Cursor
- [ ] **Progressive disclosure** carrega corretamente
- [ ] **Description** clara o suficiente para invocação automática
- [ ] **MCP integration** `formatSkillHydrationCommand()` funciona
