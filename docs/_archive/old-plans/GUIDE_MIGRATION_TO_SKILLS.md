# Guia Completo de Migração: Arquitetura Orientada a Skills

> **Objetivo**: Este documento serve como o manual definitivo para a refatoração da base de conhecimento do Maestro, migrando de uma arquitetura baseada em arquivos monolíticos (Guias/Especialistas) para uma arquitetura modular baseada em Skills.

---

## 🏗️ 1. Filosofia: "Persona + Toolbox"

A mudança fundamental é desacoplar **Quem trabalha** (Persona) de **Como o trabalho é feito** (Knowledge/Skill).

### O Modelo Antigo (Monolítico)
O arquivo `Especialista em Segurança.md` continha:
1.  **Persona**: "Sou Senior Security Engineer..."
2.  **Workflow**: "Primeiro faça X, depois Y..."
3.  **Knowledge Base**: "OWASP Top 10 é...", "Checklist de Compliance..."

**Problema**: Duplicação, dificuldade de manutenção, e sobrecarga de contexto. Se um Dev Backend precisasse de conhecimentos de segurança, ele tinha que "virar" o Especialista em Segurança inteiro.

### O Novo Modelo (Modular)
1.  **Persona (Especialista)**: Arquivo leve. Apenas define a postura, responsabilidade e quais Skills ele tem acesso.
2.  **Skill (Toolbox)**: Diretório contendo todo o conhecimento técnico, checklists e processos de um domínio.

---

## 📋 2. Blueprint de Migração (Passo a Passo)

Para cada arquivo monolítico candidato a migração, siga este processo exato de 6 etapas:

### Fase A: Preparação
1.  **Identificar o Monolito**: Localize o arquivo em `content/specialists` ou `content/guides`.
2.  **Criar Diretório da Skill**: Crie `packages/cli/content/skills/[categoria-dominio]`.

### Fase B: Atomização
3.  **Extrair Tópicos**: Leia o monolito e identifique seções independentes (ex: "Process of Code Review", "Authentication Patterns").
4.  **Criar Arquivos de Conhecimento**: Para cada tópico, crie um arquivo `.md` dentro do diretório da skill.
    *   Ex: `auth-patterns.md`, `code-review-checklist.md`.

### Fase C: Criação do Manifesto
5.  **Criar `SKILL.md`**: Este é o cérebro da Skill. Ele deve conter:
    *   **Metadata**: YAML Frontmatter (`name`, `description`).
    *   **Index**: Tabela listando os arquivos de conhecimento criados na Fase B.
    *   **Rules**: Quando ler cada arquivo.

### Fase D: Refatoração da Persona
6.  **Emagrecer o Especialista**: Reescreva o arquivo do especialista original para conter apenas:
    *   Role/Perfil.
    *   Referência à Skill (A IA deve ser instruída a buscar a skill se precisar de detalhes).

---

## 🛠️ 3. Planos de Migração Específicos

Abaixo detalhamos a migração dos três maiores candidatos identificados.

### 🔐 3.1. Caso 1: Segurança da Informação

**Origem**: `specialists/Especialista em Segurança da Informação.md` (500+ linhas)
**Destino**: `skills/security-engineering/`

#### Estrutura de Destino:
```
skills/security-engineering/
├── SKILL.md                 # Manifesto
├── owasp-top-10.md         # Lista de vulns + mitigações
├── supply-chain.md         # Scan de deps, SBOM (extraído do especialista)
├── checklists/
│   ├── dev-sec-ops.md      # SAST/DAST tools
│   └── app-security.md     # Auth, Input validation, Headers
└── response-plan.md        # Templates de incidente
```

#### Como Migrar:
1.  **Extração**: Recorte a tabela "OWASP Top 10" do especialista e cole em `owasp-top-10.md`.
2.  **Extração**: Recorte a seção "Supply Chain Security" para `supply-chain.md`.
3.  **Manifesto**: No `SKILL.md`, instrua:
    > "When conducting a security review, ALWAYS read `checklist/app-security.md`. Read `owasp-top-10.md` only if specific vulnerability analysis is needed."

---

### 🐛 3.2. Caso 2: Debugging e Troubleshooting

**Origem**: `guides/Guia de Debugging com IA.md` E `specialists/Especialista em Debugging...md` (Conteúdo duplicado)
**Destino**: `skills/systematic-debugging/`

#### Estrutura de Destino:
```
skills/systematic-debugging/
├── SKILL.md                 # Manifesto
├── 5-whys-method.md        # A técnica de root cause
├── workflows.md            # O fluxo Coleta -> Reprodução -> Fix
└── tool-guide.md           # Tabela de ferramentas (Chrome DevTools, etc)
```

#### Como Migrar:
1.  **Unificação**: Pegue o melhor dos dois arquivos de origem. Use o *processo* do Especialista e os *prompts* do Guia.
2.  **Depreciação**: Apague o `Guia de Debugging com IA.md` completamente. Mantenha o Especialista apenas como uma "casca" que aponta para a skill.

---

### 🛡️ 3.3. Caso 3: Gates de Qualidade

**Origem**: `guides/Gates de Qualidade.md` (Monolito denso com regras para TODAS as fases)
**Destino**: Distribuído em múltiplas skills.

Este caso é especial. Não criaremos uma skill "Quality Gates". Vamos injetar as regras nas skills de domínio.

#### Estrutura Destino:

**Para Fase 1 (Produto):**
*   Skill Alvo: `skills/product-management/`
*   Novo Arquivo: `skills/product-management/gate-rules.md`
*   Conteúdo: Checklist do "Gate 1: Produto → Requisitos".

**Para Fase 5 (Arquitetura):**
*   Skill Alvo: `skills/software-architecture/`
*   Novo Arquivo: `skills/software-architecture/gate-rules.md`
*   Conteúdo: Checklist do "Gate 5: Arquitetura → Segurança".

#### Como Migrar:
1.  **Fatiamento**: Quebre o arquivo `Gates de Qualidade.md` em 8 pedaços.
2.  **Distribuição**: Mova cada pedaço para a skill correspondente àquele especialista.
3.  **Atualização do Workflow**: O workflow `/02-avancar-fase.md` que hoje lê `guides/Gates de Qualidade.md` deverá ser alterado para ler `[SKILL_DA_FASE]/gate-rules.md`.

---

## ⚡ 4. Templates de Arquivos

Use estes templates para padronizar as novas skills.

### A. Template `SKILL.md` (Manifesto)

```markdown
---
name: [nome-da-skill-kebab-case]
description: [Uma frase curta resumindo o propósito]
allowed-tools: Read, Write, Edit
---

# [Nome da Skill]

> **Princípio Core**: [Uma frase filosófica ou regra de ouro]

## 🎯 Mapa de Conhecimento

| Arquivo | Contexto de Uso | Obrigatório? |
|---------|-----------------|--------------|
| `core-concepts.md` | Conceitos fundamentais | ✅ Sempre |
| `checklists/basic.md` | Validação padrão | ✅ Sempre |
| `advanced/topic-x.md` | Apenas quando lidar com X | ❌ Sob demanda |

## 🕹️ Restrições de Uso

1.  **Antes de começar**: [Pergunta obrigatória ao usuário]
2.  **Anti-patterns**: [O que NÃO fazer]
```

### B. Template de Especialista "Leve" (Pós-Migração)

```markdown
# Especialista em [Área]

## Perfil
[Descrição curta da persona - Max 3 linhas]

## Skills Disponíveis
Este especialista utiliza a seguinte skill primária:
- **[Nome da Skill]** (`skills/[nome-da-skill]`)

> A IA deve carregar automaticamente o conteúdo da skill acima para realizar as tarefas.

## Missão
[Objetivo principal]

## Entregáveis
1. [Artefato A]
2. [Artefato B]
```

---

## 🚀 5. Checklist de Execução da Migração

Para cada migração realizada:

- [ ] Arquivo monolítico original analisado.
- [ ] Conteúdo duplicado identificado e resolvido.
- [ ] Diretório da nova Skill criado.
- [ ] Conteúdo atomizado em múltiplos arquivos `.md`.
- [ ] `SKILL.md` criado com tabela de navegação.
- [ ] Adapter (`skill-adapter.ts`) rodado (`npm run build`) para verificar se gera corretamente para Antigravity/Cursor.
- [ ] Especialista original refatorado ("emagrecido").
- [ ] Guia antigo deletado (se aplicável).
- [ ] Teste manual: Iniciar uma conversa com a nova persona e verificar se ela acessa o conhecimento corretamente.
