# Estratégia de Migração: De Ferramentas/Guias para Skills

## 1. Análise Situacional Atual

Atualmente, o Maestro opera com três primitivas principais de conhecimento que possuem sobreposição significativa:

| Primitiva | Conceito | Problema Identificado |
|-----------|----------|-----------------------|
| **Guias** (`content/guides/`) | Documentação estática e monolítica (ex: `Gates de Qualidade.md`). | Difícil de manter, consome muito contexto se lido inteiro, não modular. |
| **Especialistas** (`content/specialists/`) | Personas que misturam "Quem sou" com "O que sei". | Arquivos gigantes (ex: Segurança tem 500+ linhas) que misturam *role* com *knowledge base*. |
| **Skills** (`content/skills/`) | Conhecimento modular sob demanda. | Ainda pouco utilizadas pelos Especialistas core. |

### Exemplo de Duplicação Crítica
- `Guia de Debugging com IA.md`: 130 linhas.
- `Especialista em Debugging...md`: 190 linhas (contém quase o mesmo conteúdo do guia).
- **Resultado**: A IA precisa ler dois arquivos diferentes para a mesma função, ou o mantenedor precisa sincronizar ambos.

## 2. A Proposta: "Personas usam Skills"

Em vez de incluir o *conhecimento* na *persona*, devemos separar:
- **Especialista (Persona)**: Define *Postura*, *Objetivos* e *Entregáveis*. É leve.
- **Skill (Conhecimento)**: Define *Processos*, *Checklists* e *Técnicas*. É pesado e modular.

### 2.1. Transformação de "Especialistas Utilitários" em Skills
Certos especialistas não são fases de projeto, são **capacidades transversais**.

| Atual (Especialista) | Ação Proposta | Novo Formato (Skill) |
|----------------------|---------------|-----------------------|
| `Esp. em Debugging` | **Converter** | `skills/systematic-debugging/` |
| `Esp. em Segurança` | **Converter** | `skills/security-engineering/` |
| `Esp. em DevOps` | **Converter** | `skills/devops-automation/` |

**Benefício**: Qualquer especialista (ex: Backend Dev) pode "invocar" a skill de Debugging sem precisar trocar de persona.

### 2.2. Atomização de Guias Monolíticos
O arquivo `Gates de Qualidade.md` contém regras para 8 fases.
- **Problema**: Para validar a Fase 1, a IA lê as regras das Fases 1 a 8.
- **Proposta**: Migrar para skills específicas de fase.
    - `skills/product-management/gate-rules.md`
    - `skills/architecture/gate-rules.md`

## 3. Matriz de Migração (Candidatos Imediatos)

### Alta Prioridade (Quick Wins)
1.  **Segurança**: O arquivo atual é enorme.
    -   *Novo*: `skills/security/` com `owasp.md`, `checklists.md`, `tools.md`.
2.  **Debugging**: Eliminar duplicação Guia/Especialista.
    -   *Novo*: `skills/debugging/` com `workflows.md` e `root-cause-analysis.md`.
3.  **Gates de Qualidade**: Quebrar o monolito.
    -   *Ação*: Distribuir checklists dentro das skills de domínio (Product, UX, Dev).

### Média Prioridade (Refinamento)
1.  **Arquitetura**: Separar "Decisões de Arquitetura" (Persona) de "Catálogo de Patterns" (Skill).
2.  **Testes**: Mover checklists de frameworks e estratégias para `skills/testing/`.

## 4. Prós e Contras da Abordagem

### ✅ Prós (Benefícios)
1.  **Eficiência de Contexto**: A IA carrega apenas `SKILL.md` (leve) e decide o que mais ler. Não polui a janela de contexto com informação irrelevante para o momento.
2.  **Manutenibilidade**: Alterar um checklist de segurança no `rules.md` atualiza automaticamente para todos que usam a Skill.
3.  **Composição**: Um "Tech Lead" (Persona) pode ser composto por: `Skill:Architecture` + `Skill:Security` + `Skill:TeamManagement`.
4.  **Agnosticismo**: Skills funcionam igual no Windsurf, Cursor e Antigravity (graças ao Adapter).

### ❌ Contras (Riscos)
1.  **Latência Cognitiva**: Exige mais "round-trips". A IA precisa ler o manifesto da skill, entender que precisa de um arquivo extra, e ler o arquivo extra.
2.  **Complexidade de Prompt**: O prompt do sistema precisa ser robusto para saber "navegar" na estrutura de skills (o formato `on_demand` do Antigravity resolve bem isso).

## 5. Recomendação Estratégica

**Implementar o padrão "Persona + Toolbox"**.
Não devemos ter "ferramentas" isoladas. Devemos ter Skills que encapsulam ferramentas (conceituais ou scripts) e Personas que operam essas skills.

**Roteiro Sugerido:**
1.  Criar `skills/quality-assurance` para absorver `Gates de Qualidade.md`.
2.  Converter `Especialista em Segurança` para `skills/security`.
3.  Atualizar o workflow `/02-avancar-fase` para, em vez de carregar um texto gigante de especialista, carregar uma Persona Leve + Lista de Skills Recomendadas.
