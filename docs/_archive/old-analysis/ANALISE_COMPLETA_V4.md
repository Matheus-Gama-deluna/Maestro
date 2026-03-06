# Análise Completa do Maestro MCP — v4.0.0

**Data:** 06/02/2026  
**Escopo:** Análise pós-implementação dos 5 sprints, avaliação do sistema de skills, e proposta de evolução para orquestração de alto nível independente de modelo.

---

## 1. O Que É o Maestro (Objetivo)

O Maestro é um **MCP (Model Context Protocol) server** que visa ser um **orquestrador de desenvolvimento de software guiado por IA**, utilizando princípios de engenharia de software, arquitetura de software e especialistas de domínio para produzir sistemas profissionais. Opera localmente via `npx`, integrando-se a IDEs (Windsurf, Cursor, Antigravity).

**Objetivo central:** A IA não decide o que fazer — o Maestro decide. A IA é o executor que segue instruções programáticas do orquestrador.

---

## 2. O Que Foi Feito (Histórico de Evolução)

### v2.x → v3.0.0 (Marco 0 + Marco 1 parcial)
| Mudança | Impacto |
|---------|---------|
| Router centralizado (`router.ts`) com 44 tools | Eliminou divergência entre stdio/HTTP |
| Contrato `MaestroResponse` com `NextAction`, `SpecialistPersona`, `FlowProgress` | Base para orquestração programática |
| `next_action` em 8 tools de onboarding | Fluxo setup→discovery→brainstorm→PRD orquestrado |
| Serviço compartilhado `onboarding.service.ts` | Eliminou duplicação |
| Persistência intermediária em todo handler | Estado não se perde entre blocos |
| Brainstorm desbloqueado (Caminho B) | Permite explorar antes do discovery |
| Versão unificada 3.0.0 | Consistência |

### v3.0.0 → v4.0.0 (Sprints 1-5 completos)
| Mudança | Impacto |
|---------|---------|
| `next_action` em 16+ tools (pós-PRD incluídas) | Orquestração cobre fluxo completo |
| `specialist.service.ts` — 13 personas mapeadas | Especialistas programáticos |
| `state.service.ts` — Persistência ativa | MCP pode gravar no filesystem |
| `flow-engine.ts` — State machine declarativa | 17 transições codificadas |
| `maestro-tool.ts` — Entry point inteligente | IA só precisa chamar 1 tool |
| `smart-defaults.ts` — Defaults do config global | Menos perguntas no onboarding |
| `project-templates.ts` — 6 templates pré-configurados | Projeto em 1-2 interações |
| Resumo executivo entre blocos de discovery | Validação incremental |
| Confidence score no `iniciar_projeto` | Transparência nas inferências |
| `errors/index.ts` — Hierarquia com recovery actions | Erros auto-recuperáveis |
| Registrado no router como tool #1 (45 tools total) | Entry point visível |

---

## 3. Estado Atual — Scorecard Atualizado

| Dimensão | v2.x | v3.0.0 | v4.0.0 | Meta |
|----------|------|--------|--------|------|
| **Estrutura de fases e gates** | 8/10 | 8/10 | 8/10 | 9/10 |
| **Conteúdo especialista** | 9/10 | 9/10 | 9/10 | 9.5/10 |
| **Orquestração real** | 3/10 | 5/10 | **7/10** | 9/10 |
| **Independência do modelo** | 3/10 | 4.5/10 | **6/10** | 9/10 |
| **Fluxo de onboarding** | 5/10 | 6.5/10 | **7.5/10** | 9/10 |
| **Persistência de estado** | 5/10 | 6.5/10 | **8/10** | 9/10 |
| **Qualidade de código** | 4/10 | 6.5/10 | **7.5/10** | 9/10 |
| **Testabilidade** | 2/10 | 3/10 | **3.5/10** | 8/10 |
| **Experiência do desenvolvedor** | 3/10 | 4/10 | **6.5/10** | 9/10 |
| **Score médio** | **4.5** | **5.9** | **7.1** | **9.0** |

**Melhora acumulada: +2.6 pontos** desde v2.x. A orquestração saiu de 3/10 para 7/10 — a maior evolução.

---

## 4. Análise Crítica: O Que Ainda Falta para o Objetivo

### 4.1 PROBLEMA #1: Skills São Injetadas Mas Não São Consumidas Pelo MCP

**Este é o maior gap arquitetural do sistema.**

O Maestro tem 374 skills (61 diretórios de especialistas) — um acervo excepcional. Porém:

1. **As skills são copiadas para o projeto local** via `injectContentForIDE()` (line 126 de `content-injector.ts`) — os arquivos `.md` são literalmente copiados para `.windsurf/skills/`, `.cursor/skills/`, etc.

2. **O MCP nunca lê essas skills.** Quando `proximo.ts` avança de fase, ele:
   - Gera um texto dizendo "Ative a skill: `@specialist-nome`"
   - Aponta caminhos de arquivo: "Leia SKILL.md em `.windsurf/skills/specialist-X/SKILL.md`"
   - Verifica se a skill EXISTE no filesystem (`verificarSkillCarregada`)
   - **Mas nunca injeta o conteúdo da skill na resposta**

3. **A IA precisa abrir e ler os arquivos sozinha.** Isso depende de:
   - A IA entender a instrução textual
   - A IDE suportar abrir arquivos por path
   - O modelo de IA ser capaz de processar múltiplos arquivos em contexto

**Consequência:** O imenso acervo de conteúdo especialista é **decorativo**. Com modelos menores ou em contextos longos, a IA simplesmente ignora a instrução de "ler a skill" e gera o entregável sem consultar o especialista.

**O que deveria acontecer:** O MCP deveria **incluir o conteúdo relevante da skill diretamente na resposta**, ou usar a capability `prompts` do MCP para injetar o system prompt correto automaticamente.

### 4.2 PROBLEMA #2: 45 Tools Expostas — Superfície Cognitiva Enorme

Apesar de ter a tool `maestro` como entry point, **todas as 45 tools ainda são expostas** para a IA. Modelos de IA performam significativamente pior com mais de 10-15 tools. A maioria dos modelos:
- Confunde tools similares (`status` vs `contexto`, `validar_gate` vs `avaliar_entregavel`)
- Chama tools erradas ou inexistentes
- Gasta tokens processando a lista de 45 tools em cada turno

**A tool `maestro` é uma adição, não uma consolidação.** A IA não é forçada a usá-la.

### 4.3 PROBLEMA #3: Flow Engine Existe Mas Não Está Integrado

O `flow-engine.ts` define 17 transições declarativas, mas:
- **Nenhuma tool usa o flow engine diretamente** (exceto `maestro-tool.ts`)
- As tools individuais (`proximo`, `status`, etc.) ainda calculam `next_action` com lógica imperativa local
- Não há garantia de consistência entre o que o flow engine diz e o que as tools retornam

### 4.4 PROBLEMA #4: StateService Criado Mas Não Integrado

O `state.service.ts` existe com `load()`, `save()`, `patch()`, mas:
- **Nenhuma tool usa o StateService** (exceto `maestro-tool.ts` para load)
- As tools ainda dependem de `estado_json` como parâmetro e retornam `estado_atualizado` + `files[]`
- O padrão stateless original ainda domina 100% do fluxo real

### 4.5 PROBLEMA #5: Testes Não Cobrem Código Novo

- 222 testes passam, mas são todos da versão anterior
- 0 testes para: flow-engine, state.service, specialist.service, maestro-tool, smart-defaults, project-templates, errors
- Qualquer refatoração futura não tem rede de segurança

### 4.6 PROBLEMA #6: Injeção de Skills É Pesada e Frágil

O sistema atual de injeção:
1. **Copia TODAS as 374 skills** para o projeto local (~500 arquivos)
2. **Duplica conteúdo** entre cada projeto
3. **Depende de path resolution** frágil (`getDefaultSourceDir()` tenta 5 caminhos diferentes)
4. **SkillAdapter** adapta formato mas não otimiza conteúdo (skills para Cursor/Antigravity perdem metadata)
5. **Sem versionamento** — se o content source atualiza, projetos existentes ficam desatualizados

---

## 5. Proposta de Evolução — Alcançar Orquestração de Alto Nível

### 5.1 Visão-Alvo

```
HOJE (v4.0.0):
  IA chama tool → Tool retorna texto + next_action → IA interpreta texto → IA lê skill manualmente → IA gera

ALVO (v5.0.0):
  IA chama maestro → Maestro injeta skill+template+checklist automaticamente → IA gera com contexto completo → Maestro valida e persiste
```

### 5.2 Arquitetura Proposta v5.0.0

```
┌─────────────────────────────────────────────────────────────┐
│                     IDE (Windsurf/Cursor/AG)                │
│                          ↕ MCP Protocol                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              MCP Prompts (System Prompt Auto)          │ │
│  │  - Persona do especialista da fase atual              │ │
│  │  - Template do entregável esperado                    │ │
│  │  - Checklist de validação                             │ │
│  │  → Injetado automaticamente, IA não precisa buscar    │ │
│  └───────────────────────────────────────────────────────┘ │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Consolidated Tools (8 tools)                   │ │
│  │                                                        │ │
│  │  maestro     → Entry point + detector de contexto      │ │
│  │  avancar     → Submeter entregável/respostas           │ │
│  │  status      → Status + progresso                      │ │
│  │  validar     → Validar gate/entregável                 │ │
│  │  contexto    → Contexto + knowledge base               │ │
│  │  salvar      → Salvar artefatos                        │ │
│  │  checkpoint  → Checkpoint/rollback                     │ │
│  │  analisar    → Análise de código                       │ │
│  │                                                        │ │
│  │  (tools legadas: aliases no router → redirecionar)     │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Orchestration Engine (Flow Engine)              │ │
│  │                                                        │ │
│  │  - State Machine com transições declarativas           │ │
│  │  - TODAS as tools consultam o engine para next_action  │ │
│  │  - Skill Content Loader (injeta conteúdo na resposta)  │ │
│  │  - Validation Engine (valida entregável antes de salvar│ │
│  └──────────────────────┬────────────────────────────────┘ │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Persistence Layer (Ativo)                      │ │
│  │                                                        │ │
│  │  - StateService grava/lê automaticamente               │ │
│  │  - IA NÃO precisa salvar files[]                       │ │
│  │  - estado_json como parâmetro OPCIONAL (fallback)      │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Content Library (servidor, não cópia local)    │ │
│  │                                                        │ │
│  │  - Skills servidas como MCP Resources sob demanda      │ │
│  │  - Sem cópia de 500 arquivos para cada projeto         │ │
│  │  - Rules injetadas uma vez, skills lidas pelo MCP      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Plano de Ação Detalhado (6 Sprints)

### Sprint A: Skill Content Injection Ativo (MAIOR IMPACTO)
**Problema:** Skills existem mas a IA nunca as lê automaticamente.
**Solução:** O MCP injeta o conteúdo relevante da skill diretamente na resposta.

**Implementação:**
```
1. Criar `src/src/services/skill-loader.service.ts`
   - loadSkillContent(faseName) → retorna SKILL.md + template + checklist como string
   - loadSkillTemplate(faseName) → retorna template do entregável
   - loadSkillChecklist(faseName) → retorna checklist de validação
   - Cache em memória (evita leitura repetida do filesystem)

2. Modificar `proximo.ts`:
   - Quando prepara resposta para nova fase, INCLUIR conteúdo da skill na resposta
   - Não mais "abra o arquivo X" → incluir o conteúdo diretamente
   - Exemplo: resposta inclui "## Instruções do Especialista\n{conteúdo do SKILL.md}"

3. Usar MCP Prompts capability:
   - Registrar prompt `maestro-specialist` que retorna persona + template + checklist
   - IDEs que suportam prompts recebem system prompt automático
   - Fallback: incluir no content da resposta
```

**Impacto estimado:** Orquestração 7→8.5, Independência do modelo 6→8

### Sprint B: Consolidação Real de Tools (45 → 8+legadas)
**Problema:** 45 tools confundem a IA.
**Solução:** Expor apenas 8 tools. Tools legadas redirecionam via aliases.

**Implementação:**
```
1. Modificar router.ts:
   - Separar toolRegistry em `publicTools` (8) e `legacyTools` (37)
   - `getRegisteredTools()` retorna apenas publicTools por padrão
   - `routeToolCall()` aceita ambas (backward compatible)
   - Tools legadas: description prefixado com "[LEGACY] Use 'maestro' ao invés"

2. Implementar tool `avancar`:
   - Unifica: proximo + onboarding_orchestrator(proximo_bloco) + brainstorm(proximo_secao)
   - Detecta contexto automaticamente (onboarding vs desenvolvimento)
   - Delega internamente para handler correto

3. Implementar consolidação de `validar`:
   - Unifica: validar_gate + avaliar_entregavel + check_compliance
   
4. Implementar consolidação de `checkpoint`:
   - Unifica: create_checkpoint + rollback_total + rollback_partial + list_checkpoints
   
5. Implementar consolidação de `analisar`:
   - Unifica: analisar_seguranca + analisar_qualidade + analisar_performance + validate_*
```

**Impacto estimado:** Independência do modelo 8→9, Experiência dev 6.5→8

### Sprint C: Integração Real do Flow Engine + StateService
**Problema:** Flow engine e StateService existem mas não estão integrados.
**Solução:** Todas as tools usam flow engine para next_action e StateService para persistência.

**Implementação:**
```
1. Criar middleware `withFlowEngine(handler)`:
   - Wrapa qualquer handler de tool
   - Após executar handler, consulta flow engine para next_action
   - Garante consistência de next_action entre todas as tools

2. Criar middleware `withPersistence(handler)`:
   - Wrapa qualquer handler que modifica estado
   - Após executar, chama StateService.save() automaticamente
   - Fallback: retorna files[] se save falhar

3. Compor middlewares no router:
   handler: withPersistence(withFlowEngine(withErrorHandling(originalHandler)))

4. Remover lógica de next_action duplicada das tools individuais
   - proximo.ts, status.ts, etc. não calculam mais next_action
   - O middleware injeta next_action consistente via flow engine
```

**Impacto estimado:** Orquestração 8.5→9, Persistência 8→9

### Sprint D: Otimização do Sistema de Skills
**Problema:** 500 arquivos copiados para cada projeto, frágil, sem versionamento.
**Solução:** Skills servidas como MCP Resources sob demanda.

**Implementação:**
```
1. Registrar skills como MCP Resources:
   - `maestro://skills/{skill-name}/SKILL.md`
   - `maestro://skills/{skill-name}/templates/{template}`
   - `maestro://skills/{skill-name}/checklists/{checklist}`
   - Servidos diretamente do content/ do MCP server (sem cópia)

2. Manter injeção mínima para Rules:
   - `.windsurfrules` / `.cursorrules` → continua sendo copiado (necessário para IDE)
   - Workflows → continua sendo copiado (necessário para slash commands)
   - Skills → NÃO copiar mais. Servir como resources.

3. Skill Loader Service lê do source direto:
   - Não mais de `.windsurf/skills/` do projeto
   - Diretamente de `content/skills/` do MCP server
   - Cache em memória com TTL

4. Remover `injectContentForIDE` da injeção de skills:
   - Manter apenas: rules + workflows
   - Skills removidas da cópia (economia de ~350 arquivos por projeto)
```

**Benefícios:**
- Cada projeto economiza ~500 arquivos / ~5MB
- Skills sempre atualizadas (sem versionamento manual)
- Resolução de path simplificada (1 fonte, não 5 tentativas)
- **Impacto estimado:** Qualidade de código 7.5→8.5

### Sprint E: MCP Prompts para System Prompt Automático
**Problema:** A IA precisa ler resources manualmente para saber como agir como especialista.
**Solução:** Usar capability `prompts` do MCP para injetar automaticamente.

**Implementação:**
```
1. Registrar prompts no servidor MCP:
   - `maestro-specialist`: Retorna persona + instruções do especialista da fase atual
   - `maestro-context`: Retorna contexto completo do projeto para a sessão
   - `maestro-template`: Retorna template do entregável esperado

2. Em stdio.ts e index.ts:
   - Registrar ListPromptsRequest handler
   - Registrar GetPromptRequest handler
   - Construir prompt baseado no estado atual do projeto

3. Prompt dinâmico por fase:
   Se fase = "Arquitetura":
   → system prompt = specialist-arquitetura-software/SKILL.md
   → template = specialist-arquitetura-software/resources/templates/arquitetura.md
   → checklist = specialist-arquitetura-software/resources/checklists/gate.md
```

**Impacto estimado:** Independência do modelo 9→9.5

### Sprint F: Testes + CI/CD
**Problema:** 0 testes para código v4.0.0.
**Solução:** Testes unitários para todos os novos services + CI.

**Implementação:**
```
1. Testes unitários:
   - flow-engine.test.ts: todas as 17 transições
   - state.service.test.ts: load/save/patch/saveFiles
   - specialist.service.test.ts: mapeamento fase→persona
   - skill-loader.service.test.ts: carregamento de skills
   - maestro-tool.test.ts: detecção de contexto
   - smart-defaults.test.ts: cálculo de defaults
   - project-templates.test.ts: lookup de templates
   - errors.test.ts: formatação e recovery

2. Testes de integração:
   - Fluxo completo: maestro → avancar → validar → status
   - Persistência: StateService + handler integration
   - Skill injection: resposta inclui conteúdo da skill

3. CI/CD:
   - .github/workflows/test.yml: npm test em cada PR
   - .github/workflows/typecheck.yml: tsc --noEmit
```

**Impacto estimado:** Testabilidade 3.5→8

---

## 7. Projeção de Score por Sprint

| Dimensão | v4.0.0 | Sprint A | Sprint B | Sprint C | Sprint D | Sprint E | Sprint F |
|----------|--------|----------|----------|----------|----------|----------|----------|
| Orquestração | 7 | 8.5 | 8.5 | **9** | 9 | 9 | 9 |
| Independência modelo | 6 | 8 | **9** | 9 | 9 | **9.5** | 9.5 |
| Onboarding | 7.5 | 8 | 8.5 | 9 | 9 | 9 | 9 |
| Persistência | 8 | 8 | 8 | **9** | 9 | 9 | 9 |
| Qualidade código | 7.5 | 7.5 | 8 | 8.5 | **8.5** | 8.5 | **9** |
| Testabilidade | 3.5 | 4 | 4.5 | 5 | 5.5 | 6 | **8** |
| Experiência dev | 6.5 | 7.5 | **8** | 8.5 | 8.5 | 9 | 9 |
| Conteúdo | 9 | **9.5** | 9.5 | 9.5 | 9.5 | 9.5 | 9.5 |
| Fases/gates | 8 | 8.5 | 8.5 | 9 | 9 | 9 | 9 |
| **Score médio** | **7.1** | **7.7** | **8.1** | **8.5** | **8.6** | **8.8** | **9.0** |

---

## 8. Priorização: Ordem Recomendada

### 1º Sprint A (Skill Content Injection) — FAZER PRIMEIRO
**Razão:** É o que mais impacta o objetivo central. O Maestro tem o conhecimento mas não o entrega. Resolver isso transforma a experiência imediatamente.

### 2º Sprint B (Consolidação de Tools)
**Razão:** Reduz superfície cognitiva de 45→8 tools. Impacto direto na independência de modelo.

### 3º Sprint C (Integração Flow Engine + StateService)
**Razão:** Torna o flow engine e a persistência ativa reais, não apenas código existente.

### 4º Sprint D (Otimização de Skills)
**Razão:** Elimina cópia de 500 arquivos, simplifica arquitetura.

### 5º Sprint E (MCP Prompts)
**Razão:** Cereja do bolo — system prompt automático.

### 6º Sprint F (Testes)
**Razão:** Pode rodar em paralelo com qualquer sprint.

---

## 9. Análise Específica: Sistema de Skills

### 9.1 O Que Funciona Bem
- **Acervo excepcional:** 61 especialistas com SKILL.md, templates, checklists, examples
- **SkillAdapter:** Adapta formato para Windsurf/Cursor/Antigravity (estrutura correta)
- **Mapeamento fase→skill:** `FASE_SKILL_MAP` em `prompt-mapper.ts` é completo e correto
- **Detecção de IDE:** `detectIDE()` funciona para as 3 IDEs suportadas

### 9.2 O Que Não Funciona
1. **Cópia completa é desnecessária:** 374 skills copiadas quando o projeto usa ~7 (simples) a ~17 (complexo)
2. **Skills não são lidas pelo MCP:** O MCP verifica se existem (`verificarSkillCarregada`) mas nunca lê o conteúdo
3. **Instrução textual ignorada:** "Ative a skill: @specialist-X" depende de a IA obedecer instruções em texto livre
4. **5 tentativas de path:** `getDefaultSourceDir()` tenta 5 caminhos — indica fragilidade de resolução
5. **Sem cache:** Cada chamada que referencia skills refaz I/O no filesystem
6. **SkillAdapter perde metadata:** Versões Cursor/Antigravity são simplificadas, perdendo conteúdo

### 9.3 Caminho Ideal
**Skills devem ser servidas como MCP Resources E incluídas diretamente nas respostas.**

```
Fase "Arquitetura" → MCP responde com:
{
  content: [{
    type: "text",
    text: "## Fase 4: Arquitetura\n\n{conteúdo do SKILL.md}\n\n## Template\n{conteúdo do template}\n\n## Checklist\n{checklist de gate}"
  }],
  specialist_persona: { name: "Arquiteto de Software", ... },
  next_action: { tool: "avancar", ... }
}
```

A IA recebe TUDO que precisa na resposta. Não precisa abrir arquivo, não precisa interpretar instrução textual, não precisa de capability especial da IDE.

---

## 10. Resumo Executivo

### Onde estamos
O Maestro v4.0.0 tem **base técnica sólida** (router, tipos, flow engine, state service, error handling) e um **acervo de conteúdo excepcional** (374 skills, 19 workflows). A orquestração básica funciona com `next_action` em ~16 tools.

### O gap principal
**O conhecimento existe mas não é entregue.** Skills são copiadas para o projeto local mas a IA precisa ler manualmente. Isso quebra com modelos menores e contextos longos. O MCP deveria injetar o conteúdo do especialista diretamente na resposta.

### O segundo gap
**45 tools expostas confundem a IA.** A tool `maestro` existe mas é uma adição, não substitui as 44 tools anteriores. Consolidar para 8 tools públicas com aliases para backward compatibility.

### O terceiro gap
**Flow engine e StateService existem mas não estão integrados.** São código novo que nenhuma tool usa efetivamente. Precisam ser integrados como middlewares no router.

### Para atingir o objetivo
1. **Injetar conteúdo de skills nas respostas** (Sprint A)
2. **Consolidar 45→8 tools** (Sprint B)
3. **Integrar flow engine + StateService via middlewares** (Sprint C)
4. **Servir skills como MCP Resources, não cópias locais** (Sprint D)
5. **System prompt automático via MCP Prompts** (Sprint E)
6. **Testes para todo código novo** (Sprint F)

**Score projetado: 7.1 → 9.0** em 6 sprints.
