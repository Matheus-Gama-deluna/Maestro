# Plano de Refatoração do Fluxo Inicial do Maestro v2

> **Data:** 2026-02-10  
> **Objetivo:** Aprimorar as fases iniciais (setup, discovery, brainstorm) para centralizar no Especialista de Gestão de Produto  
> **Status:** 📋 Planejado  
> **Versão:** 2.1 (atualizado com análise detalhada da conversa de teste)

---

## 1. Diagnóstico dos Problemas Atuais

### 1.1 Análise Cronológica da Conversa de Teste (`docs/resolver v1.md`)

A conversa de teste revelou **14 problemas** organizados em 3 categorias. Abaixo, a timeline completa:

#### Fase 1: Setup e Criação do Projeto (linhas 1-33)

| Momento | O que aconteceu | Problema |
|---------|----------------|----------|
| Usuário: "iniciar projeto com maestro" | IA criou 2 tasks e pediu nome/descrição. **Pulou setup completamente** — não perguntou IDE, modo, stitch. | **P7** |
| (interno) | `handleNoProject()` encontrou config global existente de uso anterior e foi direto para `criar_projeto` | **P8** |
| Usuário: "projeto de teste, crie uma descrição de teste" | IA usou `confirmar_automaticamente: true`. Blocos 1 e 2 do discovery foram preenchidos **pela IA** sem perguntar — inventou problema, público-alvo, funcionalidades, cronograma. | **P9** |

#### Fase 2: Discovery (linhas 38-151)

| Momento | O que aconteceu | Problema |
|---------|----------------|----------|
| Usuário: "pode preencher esses dados para teste" | IA preencheu Requisitos Técnicos com dados inventados (Next.js 15, NestJS, PostgreSQL). Maestro aceitou. | **P2** (confirmado) |
| Blocos 4-5 | IA perguntou time/infra ao usuário (funcionou). Validou campos obrigatórios. | ✅ OK |
| Usuário: "preencha essas informações como teste" | IA inventou Requisitos Críticos. Discovery finalizado com dados parcialmente falsos. | **P2** (confirmado) |

#### Fase 3: Transição Discovery→Brainstorm (linhas 157-297) — **ONDE TUDO QUEBROU**

| Momento | O que aconteceu | Problema |
|---------|----------------|----------|
| Usuário: "podemos seguir" | IA chamou `maestro` com `acao: "status"` em vez de `executar` com `acao: "avancar"`. **Não soube qual tool chamar.** | **P10** |
| Output do maestro | Retornou contexto geral com "Próximo Passo: Brainstorm" mas **não iniciou o brainstorm**. O `next_action` apontou para `executar` sem `respostas`. | **P11** |
| IA tentou `executar({acao: "avancar"})` sem respostas | **ERRO:** `"Nenhuma resposta fornecida. Use respostas_bloco"` | **P3, P12** |
| (causa raiz) | `avancar.ts` delegou para `onboardingOrchestrator` que encontrou discovery completo + brainstorm pending, mas **não existe transição automática** de "discovery completo" → "iniciar brainstorm". | **P12** |
| Após erro, IA chamou `contexto` como fallback | Output mostrou resources como **caminhos de arquivo** ("Leia SKILL.md", "Consulte templates") mas **nunca injetou conteúdo real**. | **P13** |
| IA ficou perdida | Fez "Fast Context" buscando `respostas_bloco` no projeto de teste (0 resultados). Tentou debugar no projeto errado. | **P14** |
| IA: "Como prefere seguir?" | **Fluxo morreu.** Usuário abandonou. | — |

### 1.2 Catálogo Completo de Problemas (14 itens)

#### Categoria A: Setup e Configuração

| # | Problema | Causa Raiz | Arquivo(s) | Severidade |
|---|---------|-----------|------------|------------|
| P1 | **Setup não pergunta ao usuário** — Instruções dizem "pergunte" mas IA pode ignorar | Output é texto livre, sem enforcement server-side | `setup-inicial.ts` | Alto |
| P7 | **Setup pulado quando config global existe** — IA foi direto para criar_projeto sem confirmar configs para o novo projeto | `handleNoProject()` assume que config global serve para todos os projetos | `maestro-tool.ts:197` | Alto |
| P8 | **Config por projeto não existe** — Modo, stitch, stack podem variar por projeto mas config é global | Não há conceito de config por projeto, apenas global em `~/.maestro/` | `maestro-tool.ts`, `config.ts` | Médio |
| P9 | **`confirmar_automaticamente` permite IA preencher tudo** — Blocos 1-2 do discovery preenchidos pela IA sem input do usuário | `confirmar_automaticamente: true` + IA inventando dados | `iniciar-projeto.ts:247` | Crítico |

#### Categoria B: Discovery e Brainstorm

| # | Problema | Causa Raiz | Arquivo(s) | Severidade |
|---|---------|-----------|------------|------------|
| P2 | **Discovery genérico demais** — Coleta dados técnicos (stack, infra) mas não captura essência do produto | Blocos focam em infraestrutura, não em problema/solução | `discovery-adapter.ts` | Alto |
| P3 | **Brainstorm trava com erro** — `"Nenhuma resposta fornecida. Use respostas_bloco"` | `avancar.ts` delega para orchestrator que exige `respostas_bloco` mas IA não sabe enviar | `brainstorm.ts`, `avancar.ts` | Crítico |
| P4 | **Brainstorm redundante com Especialista** — Seções hardcoded duplicam o que o Especialista faria | Brainstorm foi criado antes do sistema de skills | `brainstorm.ts` | Alto |
| P12 | **Sem transição automática discovery→brainstorm** — Quando discovery completa, não há handler para iniciar brainstorm | `onboarding-orchestrator` não tem case para `discoveryStatus=completed + brainstormStatus=pending` | `onboarding-orchestrator.ts` | Crítico |

#### Categoria C: Especialista e Resources

| # | Problema | Causa Raiz | Arquivo(s) | Severidade |
|---|---------|-----------|------------|------------|
| P5 | **Especialista nunca ativado de verdade** — Persona mencionada mas IA não assume o papel | Apenas texto descritivo, sem injeção de conteúdo da skill | `maestro-tool.ts`, `avancar.ts` | Crítico |
| P6 | **Resources não injetados** — Template PRD, checklist, guide existem mas são apenas links | `contexto.ts` e `proximo.ts` mostram caminhos, não conteúdo | `contexto.ts`, `skill-loader.service.ts` | Alto |
| P10 | **IA não sabe qual tool chamar** — Chamou `maestro(status)` em vez de `executar(avancar)` | `next_action` do maestro-tool é ambíguo, IA confunde status com avanço | `maestro-tool.ts` | Alto |
| P11 | **`next_action` sem parâmetros necessários** — Aponta para `executar` sem `respostas` | Template de args não inclui `respostas_bloco` obrigatório para brainstorm | `maestro-tool.ts`, `flow-engine.ts` | Alto |
| P13 | **Contexto mostra caminhos, não conteúdo** — "Leia SKILL.md", "Consulte templates" mas nunca injeta | `contexto.ts` formata como referências textuais, não usa `SkillLoaderService` | `contexto.ts:112-125` | Alto |
| P14 | **IA tenta debugar no projeto errado** — Após erro, buscou `respostas_bloco` no projeto de teste | Sem recovery path claro quando tool falha; IA não sabe como se recuperar | (design do fluxo) | Médio |

### 1.3 Fluxo Atual (Problemático) — Anotado com Problemas

```
maestro() sem projeto
  → handleNoProject() encontra config global → pula setup (P7, P8)
  → Pede nome/descrição → criar_projeto com confirmar_automaticamente=true
  → confirmarProjeto() cria estado + discoveryBlocks
  → IA preenche blocos 1-2 sozinha sem perguntar (P9)
  → Discovery Genérico: 5 blocos de formulário técnico (P2)
      Blocos: Projeto Básico, Escopo MVP, Requisitos Técnicos, Time/Infra, Requisitos Críticos
  → Discovery completo → IA tenta avançar
  → maestro(status) em vez de executar(avancar) (P10)
  → next_action aponta para executar sem respostas (P11)
  → avancar() sem respostas → ERRO respostas_bloco (P3, P12)
  → Sem transição discovery→brainstorm (P12)
  → contexto() como fallback → mostra links, não conteúdo (P13)
  → IA perdida, tenta debugar no projeto errado (P14)
  → FLUXO MORTO ❌
```

### 1.4 Fluxo Proposto (Novo)

```
maestro() sem projeto
  → SEMPRE mostrar config atual e pedir confirmação/ajuste para ESTE projeto (resolve P7, P8)
  → Setup com enforcement: perguntas estruturadas, IA PROIBIDA de inferir (resolve P1, P9)
  → Criar Projeto (sem confirmar_automaticamente, sem discovery blocks)
  → Ativar Especialista Gestão de Produto:
      1. Injetar persona (nome, tom, expertise) no output
      2. Injetar CONTEÚDO REAL dos resources (não links):
         - SKILL.md (instruções do processo)
         - Template PRD.md (estrutura completa)
         - Checklist prd-validation.md (critérios de score)
         - Exemplos prd-examples.md (referência de qualidade)
      3. Instruir IA: "Você É o especialista. USE o template. PERGUNTE ao usuário."
      (resolve P5, P6, P13)
  → Especialista conduz discovery conversacional:
      - Perguntas focadas em PRODUTO (problema, público, solução, MVP)
      - Não em infraestrutura técnica (isso vem depois)
      - Follow-up quando respostas vagas
      (resolve P2, P4)
  → Especialista gera PRD usando template real
  → Validação com checklist real (score >= 70)
  → Transição clara para próximo especialista
      (resolve P3, P10, P11, P12)
  → Se erro em qualquer ponto: mensagem clara de recovery (resolve P14)
```

### 1.5 Diferenças-chave

- **Eliminar** discovery genérico como etapa separada (5 blocos técnicos → conversa guiada)
- **Eliminar** brainstorm como etapa separada (absorvido pelo especialista)
- **Eliminar** `confirmar_automaticamente` no fluxo padrão (previne IA de preencher sozinha)
- **Unificar** discovery + brainstorm + PRD dentro do **Especialista de Gestão de Produto**
- **Forçar** injeção de conteúdo real dos resources (não links/caminhos)
- **Setup** com enforcement server-side de perguntas reais ao usuário
- **Config por projeto** em vez de apenas global (modo/stitch podem variar)
- **Recovery paths** claros quando tools falham (mensagem de erro com próximo passo)
- **`next_action` preciso** com todos os parâmetros necessários para a próxima tool

---

## 2. Sprints de Implementação

### Sprint 1: Setup Interativo com Enforcement

**Resolve:** P1, P7, P8, P9

**Arquivos:** `src/src/tools/setup-inicial.ts`, `src/src/tools/maestro-tool.ts`, `src/src/tools/iniciar-projeto.ts`

**Objetivo:** Garantir que o setup PERGUNTA ao usuário e não permite que a IA infira respostas. Mesmo com config global existente, confirmar configs para cada novo projeto.

**Mudanças detalhadas:**

1. **`maestro-tool.ts` — `handleNoProject()`** (resolve P7, P8):
   - **MESMO com config global existente**, mostrar configs atuais e perguntar: "Deseja usar estas configurações para este projeto ou ajustar?"
   - Não ir direto para `criar_projeto` — sempre passar pelo setup de confirmação
   - Adicionar conceito de "config por projeto" que herda da global mas pode ser ajustada

2. **`maestro-tool.ts` — `handleCriarProjeto()`** (resolve P8):
   - Remover fallback silencioso que salva config automaticamente sem perguntar (linhas 300-306)
   - Se `respostas` não contém `ide`/`modo`, RETORNAR pedindo ao usuário em vez de usar defaults

3. **`setup-inicial.ts`** (resolve P1):
   - Adicionar instrução explícita e repetida: `"⚠️ OBRIGATÓRIO: Pergunte CADA item ao usuário. NÃO infira respostas. NÃO use valores padrão sem confirmação explícita."`
   - Cada pergunta com opções claras e descrição do impacto de cada escolha
   - `next_action` com `requires_user_input: true` e `user_prompt` detalhado por pergunta

4. **`iniciar-projeto.ts`** (resolve P9):
   - Remover `confirmar_automaticamente: true` como comportamento padrão
   - Quando chamado via `criar_projeto`, NÃO preencher discovery blocks automaticamente
   - O projeto é criado com estado limpo, sem blocos de discovery pré-preenchidos

**Critério de aceite:**
- [ ] Mesmo com config global, setup pede confirmação para novo projeto
- [ ] IA não consegue pular setup sem respostas do usuário
- [ ] `confirmar_automaticamente` não preenche dados de produto sozinho
- [ ] Cada pergunta tem descrição de impacto das opções

---

### Sprint 2: Eliminar Discovery/Brainstorm, Unificar no Especialista

**Resolve:** P2, P3, P4, P12

**Arquivos:** `src/src/services/flow-engine.ts`, `src/src/flows/onboarding-orchestrator.ts`, `src/src/tools/consolidated/avancar.ts`, `src/src/tools/iniciar-projeto.ts`, `src/src/types/onboarding.ts`

**Objetivo:** Remover discovery genérico (5 blocos técnicos) e brainstorm separado (que trava). Delegar tudo ao Especialista de Gestão de Produto.

**Mudanças detalhadas:**

1. **`flow-engine.ts`** — Alterar `ONBOARDING_FLOW` (resolve P3, P12):
   ```
   Antes: setup → iniciar → confirmar → discovery → brainstorm → prd → confirmar_classificacao
   Depois: setup → criar_projeto → specialist_active → prd_draft → prd_validation → proximo_especialista
   ```
   - Remover transições: `discovery_in_progress`, `discovery_complete`, `brainstorm`, `brainstorm_complete`
   - Adicionar transições: `specialist_active`, `prd_draft`, `prd_validation`
   - **Elimina o gap de transição** que causou o erro P12 (discovery completo → brainstorm sem handler)

2. **`iniciar-projeto.ts` / `confirmarProjeto()`** (resolve P2):
   - Após criar estado, **NÃO criar discoveryBlocks** — ativar diretamente o Especialista
   - Injetar conteúdo da skill no output (delegado ao specialist-activator da Sprint 3)
   - Estado inicial: `onboarding.phase = "specialist_active"` em vez de `"discovery"`

3. **`avancar.ts`** (resolve P3, P4):
   - Quando em onboarding com `specialistPhase`, delegar para specialist-phase-handler (Sprint 4)
   - Remover lógica inline de brainstorm (que causava erro `respostas_bloco`)
   - Manter fallback para legacy: se `discoveryBlocks` existe no estado, usar orchestrator antigo

4. **`types/onboarding.ts`**:
   - Adicionar `specialistPhase?: SpecialistPhaseState` ao `OnboardingState`
   - Manter `discoveryBlocks?` e `brainstormSections?` como opcionais (backward compat)
   - Novo tipo `SpecialistPhaseState`:
     ```typescript
     interface SpecialistPhaseState {
       skillName: string
       status: 'active' | 'collecting' | 'generating' | 'validating' | 'approved'
       collectedData: Record<string, any>
       prdDraft?: string
       validationScore?: number
       interactionCount: number
     }
     ```

5. **`onboarding-orchestrator.ts`** + **`brainstorm.ts`** — Deprecar:
   - Marcar como `@deprecated` — mantidos apenas para projetos existentes
   - Novos projetos (detectados por `specialistPhase` no estado) usam novo handler

**Critério de aceite:**
- [ ] Fluxo vai direto de criar projeto → especialista ativo
- [ ] Não há mais etapas de discovery/brainstorm separadas
- [ ] Estado simplificado sem discoveryBlocks/brainstormSections
- [ ] Projetos existentes continuam funcionando (backward compat)

---

### Sprint 3: Injeção Forçada de Resources do Especialista

**Resolve:** P5, P6, P13

**Arquivos:** `src/src/services/skill-loader.service.ts`, `src/src/services/content-resolver.service.ts`, **NOVO** `src/src/services/specialist-activator.ts`, `src/src/tools/contexto.ts`

**Objetivo:** Quando um especialista é ativado, seus resources (template, checklist, guide, examples) são carregados e injetados **como conteúdo real** no output da tool — não como links/caminhos.

**Contexto do problema (da conversa de teste):**
- Linhas 230-249 do teste: `contexto.ts` retornou "Leia SKILL.md", "Consulte templates em resources/templates/" — apenas caminhos
- A IA nunca leu esses arquivos. Não sabia que existia um template PRD.md com 212 linhas de estrutura
- Resultado: PRD nunca foi gerado com qualidade porque a IA não tinha o template

**Mudanças detalhadas:**

1. **NOVO `specialist-activator.ts`** — Serviço de ativação:
   ```typescript
   interface SpecialistActivationPackage {
     persona: { name: string, tone: string, expertise: string[], instructions: string }
     skillContent: string           // SKILL.md parseado (seções relevantes)
     template: string | null        // Template COMPLETO (ex: PRD.md — 212 linhas)
     checklist: string | null       // Checklist COMPLETO (ex: prd-validation.md — 165 linhas)
     guide: string | null           // Guia resumido (product-guide.md — primeiras seções)
     examples: string | null        // Exemplos resumidos (prd-examples.md — 1-2 exemplos)
     mandatoryInstructions: string  // Regras que a IA DEVE seguir
   }
   ```
   - Usa `ContentResolverService` + `SkillLoaderService` existentes
   - Carrega TODOS os resources de `resources/templates/`, `resources/checklists/`, etc.
   - Budget por modo: economy (skill+template), balanced (+checklist+examples), quality (tudo)
   - **Diferença crucial vs. `SkillLoaderService.loadForPhase()`**: carrega resources COMPLETOS, não truncados

2. **`skill-loader.service.ts`** — Novo método `loadFullPackage(skillName, mode)`:
   - Carrega SKILL.md + TODOS os resources da pasta `resources/`
   - Retorna cada resource separado (não concatenado)
   - Respeita budget mas prioriza template e checklist (são os mais importantes)

3. **`contexto.ts`** (resolve P13 diretamente):
   - Substituir seção de "Próximos Passos com Skill" (linhas 112-125) que mostra apenas caminhos
   - Usar `specialist-activator` para injetar conteúdo real da skill no output do contexto
   - Fallback: se conteúdo muito grande, injetar resumo + template completo

4. **Output formatado** — O conteúdo injetado deve ser claro e imperativo:
   ```markdown
   ## 🧠 ESPECIALISTA ATIVO: Gestão de Produto
   
   **Persona:** Estratégico e orientado ao usuário
   **Expertise:** product discovery, lean startup, user stories, MVP definition
   
   ⚠️ INSTRUÇÕES OBRIGATÓRIAS:
   - Você DEVE se comportar como este especialista
   - Você DEVE usar o template abaixo para gerar o PRD
   - Você DEVE validar contra o checklist abaixo
   - Você NÃO DEVE inventar dados — PERGUNTE ao usuário
   
   ### 📝 Template PRD (USE ESTE FORMATO)
   [conteúdo completo do PRD.md — 212 linhas]
   
   ### ✅ Checklist de Validação (VALIDE CONTRA ISTO)
   [conteúdo completo do prd-validation.md — 165 linhas]
   
   ### 📖 Exemplos de Referência
   [resumo dos exemplos — 1-2 casos]
   ```

**Critério de aceite:**
- [ ] `activateSpecialist("specialist-gestao-produto", "balanced")` retorna pacote com template completo
- [ ] Template PRD real (212 linhas) é injetado no output — não link
- [ ] Checklist real (165 linhas) é injetado no output — não link
- [ ] `contexto.ts` usa specialist-activator em vez de caminhos textuais
- [ ] Budget de tokens respeitado por modo

---

### Sprint 4: Novo Handler de Fase do Especialista + Recovery Paths

**Resolve:** P10, P11, P14

**Arquivos:** **NOVO** `src/src/handlers/specialist-phase-handler.ts`, `src/src/tools/consolidated/avancar.ts`

**Objetivo:** Gerenciar a interação com o especialista de forma conversacional. Garantir `next_action` sempre preciso e com recovery em caso de erro.

**Contexto do problema (da conversa de teste):**
- Linha 164: IA chamou `maestro(acao: "status")` quando deveria chamar `executar(acao: "avancar")` (P10)
- Linha 195: IA chamou `executar(acao: "avancar")` sem `respostas` — erro (P11)
- Linhas 282-295: Após erro, IA tentou debugar no projeto errado e ficou perdida (P14)

**Mudanças detalhadas:**

1. **NOVO `specialist-phase-handler.ts`** — Handler com estados claros:

   **Handlers por status:**
   - `handleActive()`: Injeta persona + resources + primeiras perguntas focadas em PRODUTO
   - `handleCollecting(respostas)`: Recebe respostas, armazena, decide se precisa mais dados
   - `handleGenerating()`: Instrui IA a gerar PRD usando template real + dados coletados
   - `handleValidating(prdContent)`: Aplica checklist de validação, calcula score
   - `handleApproved()`: Score >= 70, prepara transição para próximo especialista

   **Perguntas focadas em produto (não infraestrutura):**
   - Obrigatórias: problema central, público-alvo, funcionalidades MVP, north star metric
   - Opcionais (balanced/quality): personas detalhadas, riscos, timeline, go-to-market
   - Infraestrutura técnica (stack, plataformas) → delegada para fase de Arquitetura

   **Follow-up inteligente:**
   - Se resposta < 20 palavras: pedir mais detalhes
   - Se campo crítico vago: reformular pergunta com exemplo

2. **`avancar.ts`** — Integrar specialist handler + `next_action` preciso (resolve P10, P11):
   - Quando `estado.onboarding.specialistPhase` existe → delegar para `specialist-phase-handler`
   - **CADA resposta deve incluir `next_action` com:**
     - Tool exata a chamar
     - Todos os parâmetros necessários (incluindo `respostas` quando obrigatório)
     - `user_prompt` claro descrevendo o que o usuário deve responder
   - Nunca retornar `next_action` que aponte para tool sem parâmetros obrigatórios

3. **Recovery paths** (resolve P14):
   - Quando qualquer tool retorna erro, incluir seção `## 🔧 Recovery`:
     ```
     O que deu errado: [descrição clara]
     Como corrigir: [comando exato para tentar novamente]
     Alternativa: [comando alternativo se o primeiro não funcionar]
     ```
   - IA nunca deve precisar "debugar" — o erro deve ser auto-explicativo

**Critério de aceite:**
- [ ] Especialista ativado com persona + resources injetados
- [ ] Coleta de dados conversacional focada em PRODUTO (não infra)
- [ ] PRD gerado usando template real
- [ ] Validação usa checklist real com score
- [ ] `next_action` SEMPRE inclui todos os parâmetros necessários
- [ ] Erros incluem recovery path claro
- [ ] Transição automática quando score >= 70

---

### Sprint 5: Atualizar System Prompt e Instruções para a IA

**Resolve:** Reforço de P1, P5, P9 (camada de defesa adicional via prompt)

**Arquivos:** `src/src/handlers/shared-prompt-handler.ts`

**Objetivo:** Garantir que a IA se comporte como o especialista e use os resources fornecidos. Esta sprint é uma **camada de defesa adicional** — as Sprints 1-4 resolvem os problemas no código, esta resolve no nível de instrução à IA.

**Contexto do problema (da conversa de teste):**
- A IA nunca "se tornou" o especialista — apenas mencionou o nome (P5)
- A IA inventou dados sem perguntar ao usuário (P9) — precisa de instrução explícita proibindo
- A IA não sabia qual tool chamar (P10) — precisa de fluxo claro no prompt

**Mudanças detalhadas:**

1. **Prompt `maestro-specialist`** — Regras anti-inferência:
   ```
   ## ⚠️ REGRAS OBRIGATÓRIAS (NUNCA VIOLAR)
   
   1. Você É o especialista indicado — use o tom, expertise e abordagem descritos
   2. Você DEVE usar o template fornecido para gerar artefatos (não inventar formato)
   3. Você DEVE validar contra o checklist fornecido (não pular validação)
   4. Você NUNCA deve inventar dados sobre o projeto — SEMPRE pergunte ao usuário
   5. Você NUNCA deve preencher campos com dados fictícios, mesmo se o usuário pedir "preencha para teste"
   6. Se o usuário pedir para você inventar dados, responda: "Preciso de informações reais para gerar um PRD útil"
   7. Você DEVE fazer perguntas de follow-up quando respostas forem vagas ou curtas
   8. Quando o Maestro retornar next_action, SIGA EXATAMENTE a tool e parâmetros indicados
   ```

2. **Incluir resources reais no prompt** (via specialist-activator da Sprint 3):
   - Template PRD completo
   - Checklist de validação completo
   - 1-2 exemplos de PRD para referência de qualidade

3. **Instruções de fluxo explícitas** (resolve P10):
   ```
   ## FLUXO — SIGA ESTA ORDEM
   
   1. PERGUNTE ao usuário: qual problema quer resolver? para quem?
   2. PERGUNTE: quais funcionalidades essenciais? como medir sucesso?
   3. FAÇA follow-up se respostas forem vagas (< 20 palavras)
   4. Quando tiver dados suficientes, GERE o PRD usando o template fornecido
   5. VALIDE contra o checklist — calcule o score
   6. APRESENTE score e peça aprovação do usuário
   7. SE aprovado (>= 70), chame executar({acao: "avancar", entregavel: "<PRD>"})
   
   ⚠️ Para avançar, SEMPRE use: executar({acao: "avancar"})
   ⚠️ NUNCA use: maestro({acao: "status"}) para tentar avançar
   ```

**Critério de aceite:**
- [ ] Prompt inclui regras anti-inferência explícitas
- [ ] Prompt inclui fluxo com tools exatas a chamar
- [ ] Resources reais incluídos no prompt
- [ ] IA recusa inventar dados quando pedido "preencha para teste"
- [ ] IA segue `next_action` corretamente

---

### Sprint 6: Testes e Ajustes

**Verifica:** Todos os 14 problemas (P1-P14)

**Objetivo:** Validar o fluxo completo end-to-end reproduzindo os cenários da conversa de teste.

**Teste 1: Setup com config global existente** (verifica P7, P8)
- Pré-condição: config global em `~/.maestro/config.json` já existe
- Ação: `maestro({diretorio: "..."})`
- Esperado: Mostra config atual e pergunta "Deseja usar para este projeto ou ajustar?"
- ❌ Falha se: Pula direto para criar_projeto sem confirmar

**Teste 2: Setup sem config** (verifica P1)
- Pré-condição: sem config global
- Ação: `maestro({diretorio: "..."})`
- Esperado: Pergunta IDE, modo, stitch com instruções claras
- ❌ Falha se: IA consegue avançar sem respostas reais do usuário

**Teste 3: Criar projeto sem dados inventados** (verifica P9)
- Ação: `maestro({acao: "criar_projeto", respostas: {nome: "Teste", descricao: "teste"}})`
- Esperado: Projeto criado, especialista ativado, SEM discovery blocks pré-preenchidos
- ❌ Falha se: Blocos de discovery aparecem preenchidos pela IA

**Teste 4: Especialista ativado com resources** (verifica P5, P6, P13)
- Ação: Após criar projeto
- Esperado: Output contém conteúdo REAL do template PRD.md e checklist prd-validation.md
- ❌ Falha se: Output contém apenas "Leia SKILL.md" ou "Consulte templates em..."

**Teste 5: Coleta conversacional** (verifica P2, P4)
- Ação: Responder perguntas do especialista sobre o produto
- Esperado: Perguntas focadas em problema/público/MVP, não em stack/infra
- ❌ Falha se: Perguntas sobre stack preferida, plataformas, infraestrutura

**Teste 6: Transição sem erro** (verifica P3, P10, P11, P12)
- Ação: Após coleta, avançar para geração de PRD
- Esperado: `next_action` aponta para tool correta com todos os parâmetros
- ❌ Falha se: Erro "respostas_bloco" ou IA chama tool errada

**Teste 7: Recovery de erro** (verifica P14)
- Ação: Forçar um erro (ex: chamar avancar sem parâmetros)
- Esperado: Mensagem de erro com seção "Recovery" e comando exato para corrigir
- ❌ Falha se: IA fica perdida ou tenta debugar no projeto

**Teste 8: Backward compatibility**
- Ação: Carregar projeto existente com discoveryBlocks no estado
- Esperado: Fluxo antigo funciona normalmente
- ❌ Falha se: Erro ou comportamento inesperado

**Critério de aceite global:**
- [ ] Todos os 8 testes passam
- [ ] Nenhum dos 14 problemas (P1-P14) se reproduz
- [ ] Fluxo completo setup → especialista → PRD → validação → próximo funciona

---

## 3. Resumo de Impacto por Arquivo

| Arquivo | Ação | Sprint | Resolve |
|---------|------|--------|---------|
| `src/src/tools/maestro-tool.ts` | Confirmar config por projeto, remover inferência silenciosa | 1-2 | P7, P8 |
| `src/src/tools/setup-inicial.ts` | Enforcement de perguntas obrigatórias | 1 | P1 |
| `src/src/tools/iniciar-projeto.ts` | Remover `confirmar_automaticamente`, ativar especialista direto | 1-2 | P9 |
| `src/src/services/flow-engine.ts` | Simplificar ONBOARDING_FLOW, eliminar gap de transição | 2 | P3, P12 |
| `src/src/tools/consolidated/avancar.ts` | Delegar para specialist handler, `next_action` preciso | 2-4 | P10, P11 |
| `src/src/tools/contexto.ts` | Injetar conteúdo real em vez de caminhos | 3 | P13 |
| `src/src/flows/onboarding-orchestrator.ts` | Deprecar (absorvido pelo especialista) | 2 | P3, P4, P12 |
| `src/src/tools/brainstorm.ts` | Deprecar (absorvido pelo especialista) | 2 | P4 |
| `src/src/utils/discovery-adapter.ts` | Manter apenas para backward compat | 2 | P2 |
| `src/src/services/skill-loader.service.ts` | Adicionar `loadFullPackage` | 3 | P6 |
| `src/src/services/content-resolver.service.ts` | Suportar carga de resources completos | 3 | P6 |
| **NOVO** `src/src/services/specialist-activator.ts` | Ativação forçada com resources reais | 3 | P5, P6, P13 |
| **NOVO** `src/src/handlers/specialist-phase-handler.ts` | Handler conversacional + recovery paths | 4 | P10, P11, P14 |
| `src/src/handlers/shared-prompt-handler.ts` | Regras anti-inferência, fluxo explícito | 5 | P1, P5, P9 |
| `src/src/types/onboarding.ts` | Adicionar SpecialistPhaseState | 2-4 | — |

---

## 4. Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| IA ignora instruções de "perguntar ao usuário" e inventa dados (como no teste P9) | Alta | Crítico | Enforcement em 3 camadas: server-side (`requires_user_input`), output explícito ("NÃO INFIRA"), prompt anti-inferência |
| IA chama tool errada (como no teste P10: `maestro(status)` em vez de `executar(avancar)`) | Alta | Alto | `next_action` com tool exata + parâmetros completos + instrução no prompt "SIGA next_action" |
| Resources muito grandes para injetar (PRD.md=212 linhas + checklist=165 linhas) | Média | Médio | Budget por modo: economy (skill+template), balanced (+checklist), quality (tudo). ~4K tokens no balanced |
| Backward compatibility com projetos existentes que têm discoveryBlocks | Baixa | Alto | Detectar `specialistPhase` vs `discoveryBlocks` no estado; fallback para orchestrator antigo |
| IA fica perdida após erro e tenta debugar no projeto (como no teste P14) | Média | Alto | Recovery paths em TODAS as mensagens de erro com comando exato para corrigir |
| Usuário pede "preencha para teste" e IA obedece inventando dados | Alta | Crítico | Prompt explícito: "NUNCA preencha com dados fictícios, mesmo se pedido" + handler que recusa |
| Budget de tokens excedido com resources completos em modo quality | Média | Médio | Limite hard de ~8K tokens para resources; truncar guide/examples primeiro |

---

## 5. Métricas de Sucesso

| Métrica | Antes (teste real) | Meta | Problema(s) |
|---------|-------------------|------|-------------|
| Setup pergunta ao usuário | 0% — IA inferiu tudo | 100% | P1, P7 |
| Config confirmada por projeto | 0% — usou global sem perguntar | 100% | P8 |
| Dados de produto coletados do usuário (não inventados) | ~40% — IA inventou blocos 1-2 | 100% | P9 |
| PRD gerado com template real | 0% — template nunca injetado | 100% | P5, P6 |
| Validação com checklist real | 0% — checklist nunca injetado | 100% | P6, P13 |
| Erros de "respostas_bloco" | 1 por sessão (fatal) | 0 | P3, P12 |
| IA chama tool correta | ~50% — chamou status em vez de avancar | 100% | P10, P11 |
| Recovery após erro | 0% — IA ficou perdida | 100% | P14 |
| Fluxo completo sem travamento | 0% — morreu no brainstorm | 100% | Todos |
| Tempo setup → PRD aprovado | ∞ (nunca completou) | ~20-30 min | — |

---

## 6. Mapa de Cobertura: Problema → Sprint → Teste

| Problema | Descrição curta | Sprint | Teste |
|----------|----------------|--------|-------|
| P1 | Setup não pergunta ao usuário | 1, 5 | T2 |
| P2 | Discovery genérico (infra, não produto) | 2 | T5 |
| P3 | Brainstorm trava com erro respostas_bloco | 2 | T6 |
| P4 | Brainstorm redundante com Especialista | 2 | T5 |
| P5 | Especialista nunca ativado de verdade | 3, 5 | T4 |
| P6 | Resources não injetados (apenas links) | 3 | T4 |
| P7 | Setup pulado com config global existente | 1 | T1 |
| P8 | Config por projeto não existe | 1 | T1 |
| P9 | confirmar_automaticamente permite IA inventar | 1, 5 | T3 |
| P10 | IA chama tool errada | 4, 5 | T6 |
| P11 | next_action sem parâmetros necessários | 4 | T6 |
| P12 | Sem transição discovery→brainstorm | 2 | T6 |
| P13 | Contexto mostra caminhos, não conteúdo | 3 | T4 |
| P14 | IA tenta debugar no projeto errado | 4 | T7 |

---

## 7. Ordem de Execução Recomendada

```
Sprint 1 (Setup enforcement)
  → Sprint 2 (Eliminar discovery/brainstorm)
  → Sprint 3 (Injeção resources reais)
  → Sprint 4 (Specialist handler + recovery)
  → Sprint 5 (Prompts anti-inferência)
  → Sprint 6 (Testes end-to-end)
```

**Dependências:**
- Sprint 2 depende de Sprint 1 (setup precisa funcionar antes de mudar o fluxo)
- Sprint 3 pode ser feita em paralelo com Sprint 2 (serviço independente)
- Sprint 4 depende de Sprint 2 (precisa do novo fluxo) e Sprint 3 (precisa do activator)
- Sprint 5 pode ser feita em paralelo com Sprint 4 (prompt independente)
- Sprint 6 depende de todas as anteriores

---

**Versão:** 2.1  
**Autor:** Cascade + Usuário  
**Última atualização:** 2026-02-10  
**Base:** Análise detalhada da conversa de teste (`docs/resolver v1.md`) — 14 problemas identificados
