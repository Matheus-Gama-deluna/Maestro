# Plano de Execução: Migração Maestro para Sistema de Skills

> **Objetivo**: Refatorar o sistema Maestro para substituir especialistas monolíticos por uma arquitetura modular de **Persona + Skills**, utilizando `fases-mapeamento.md` como guia mestre.

---

## 🏗️ 1. Nova Arquitetura de Fases

O arquivo `packages/cli/content/guides/fases-mapeamento.md` será a fonte da verdade. Cada fase mapeada invocará um **Especialista Leve** que, por sua vez, consome uma ou mais **Skills**.

### Mapeamento Definido (Tabela de Conversão)

| Fase | Especialista Atual (Legacy) | Nova Skill Principal | Skills Complementares |
| :--- | :--- | :--- | :--- |
| **1. Produto** | `Gestão de Produto` | `product-management` | `business-analysis` |
| **2. Requisitos** | `Eng. Requisitos` | `requirements-engineering` | - |
| **3. UX Design** | `UX Design` | `ux-visual-design` | `interaction-design`, `ux-research` |
| **4. Prototipagem** | `Stitch` | `prototyping-stitch` | - |
| **5. Modelo Domínio** | `Modelagem Domínio` | `domain-modeling` | `ddd-patterns` |
| **6. Banco de Dados** | `Banco de Dados` | `database-design` | `sql-optimization`, `migrations` |
| **7. Arquitetura** | `Arq. Software` | `software-architecture` | `cloud-patterns` |
| **8. Segurança** | `Seg. Informação` | `security-engineering` | `compliance-lgpd` |
| **9. Testes** | `Análise Testes` | `testing-qa` | `test-automation` |
| **10. API** | `Contrato API` | `api-design` | `rest-patterns`, `graphql-patterns` |
| **11. Frontend** | `Desenv. Frontend` | `frontend-engineering` | `react-system`, `tech-stack-guides` |
| **12. Backend** | `Desenvolvimento` | `backend-engineering` | `clean-code`, `tech-stack-guides` |
| **13. Integração** | `DevOps e Infra` | `devops-infra` | `docker-k8s`, `ci-cd-pipelines` |

---

## 🛠️ 2. Estrutura de Arquivos das Skills

Cada skill deve ser criada em `packages/cli/content/skills/[nome-skill]/`.

### Template da Skill (`SKILL.md`)
```markdown
---
name: [nome-skill]
description: [Descrição breve]
---

# [Nome Skill]

## 🎯 Conceitos Chave
- Tópico 1
- Tópico 2

## 🗂️ Recursos e Templates
| Recurso | Arquivo |
| :--- | :--- |
| Template Principal | `templates/[nome].md` |
| Prompt de Execução | `prompts/[nome].md` |

## ⚙️ Regras de Ouro
1. Regra 1
2. Regra 2
```

### Migração de Templates e Prompts
Os arquivos atuais em `content/templates/` e `content/prompts/` devem ser MOVIDOS para dentro da pasta da skill correspondente ou REFERENCIADOS se forem genéricos.

*   Exemplo: `templates/PRD.md` -> `skills/product-management/templates/prd.md`
*   Exemplo: `prompts/produto/discovery.md` -> `skills/product-management/prompts/discovery.md`

---

## 🔄 3. Atualização dos Workflows

Os workflows precisam ser adaptados para carregar a **Skill** em vez de apenas ler o especialista.

### 3.1. Workflow Principal: `/02-avancar-fase.md`

**Alteração Crítica:**
Substituir a lógica de carregamento simples por uma lógica de "Injeção de Skill".

**De:**
```markdown
*   Identifique o especialista em `fases-mapeamento.md`.
*   Carregue `content/specialists/[nome].md`.
```

**Para:**
```markdown
*   Identifique a próxima fase e suas skills em `fases-mapeamento.md` (coluna Skill).
*   Carregue o Manifesto da Skill: `read_file('content/skills/[nome]/SKILL.md')`.
*   Carregue o Especialista Leve: `read_file('content/specialists/[nome-leve].md')`.
*   Instrua a IA: "Você agora possui a skill [Nome]. Use seus templates e tools para executar a fase."
```

### 3.2. Workflows Operacionais

*   `/04-implementar-historia.md`: Deve carregar `skills/frontend-engineering` ou `skills/backend-engineering` dependendo da tarefa.
*   `/06-corrigir-bug.md`: Deve carregar `skills/systematic-debugging`.

---

## 📋 4. Lista de Tarefas (Actionable Items)

### Fase 1: Preparação do Terreno
1.  [ ] Criar diretório `packages/cli/content/skills/` (se não existir, validar conteúdo).
2.  [ ] Atualizar `packages/cli/content/guides/fases-mapeamento.md` para incluir uma coluna "Skill ID".
3.  [ ] Criar o "Adapter Universal" para garantir que Skills funcionem no Cursor/Windsurf/Antigravity (já analisado em `skill-adapter.ts`).

### Fase 2: Migração de Pilotos (Critical Path)
4.  [ ] **Produto**: Criar `skills/product-management`. Migrar `PRD.md` e prompts.
5.  [ ] **Frontend**: Criar `skills/frontend-engineering`. Migrar guidelines de React/Next.js.
6.  [ ] **Segurança**: Criar `skills/security-engineering`. Migrar `checklist-seguranca.md` e regras OWASP.

### Fase 3: Refatoração dos Especialistas
7.  [ ] Reescrever `Especialista em Gestão de Produto.md` para ser apenas um wrapper da skill.
8.  [ ] Reescrever `Especialista em Desenvolvimento Frontend.md` idem.
9.  [ ] Reescrever `Especialista em Segurança.md` idem.

### Fase 4: Atualização do Core
10. [ ] Editar `packages/cli/content/workflows/02-avancar-fase.md` para suportar a nova lógica de skills.
11. [ ] Validar o fluxo completo com um projeto de teste (`/maestro test-flow`).

---

## 🚨 Pontos de Atenção

*   **Retrocompatibilidade**: O sistema deve conseguir ler os especialistas antigos se a skill não existir (fallback).
*   **Context Window**: Não carregar `prompts/` inteiros automaticamente. Deixar a IA ler sob demanda.
*   **Caminhos**: Ao mover templates, atualizar referências nos arquivos existentes.
