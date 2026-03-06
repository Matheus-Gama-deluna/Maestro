# Análise Detalhada — Conversa de Teste Resolver v2

> **Data:** 2026-02-10  
> **Base:** `docs/resolver v2.md` (conversa real com Maestro pós-refatoração v6.0)  
> **Contexto:** Após implementação das Sprints 1-5 do Plano de Refatoração v2  
> **Objetivo:** Identificar problemas remanescentes e novos, entender causas-raiz no código

---

## 1. Resumo Executivo

A refatoração v6.0 (Sprints 1-5) **resolveu parcialmente** os 14 problemas originais (P1-P14). Vários pontos críticos foram corrigidos:

| Problema Original | Status v6.0 |
|---|---|
| P1 (Setup não pergunta) | ✅ Resolvido — setup agora pergunta |
| P7 (Setup pulado com config global) | ✅ Resolvido — pede confirmação |
| P8 (Config por projeto) | ✅ Resolvido — config por projeto |
| P9 (confirmar_automaticamente) | ⚠️ Parcial — IA ainda aceita inventar dados quando pedido |
| P2 (Discovery genérico/infra) | ✅ Resolvido — eliminado, especialista conduz |
| P3 (Brainstorm trava) | ✅ Resolvido — brainstorm eliminado |
| P4 (Brainstorm redundante) | ✅ Resolvido — absorvido pelo especialista |
| P12 (Sem transição discovery→brainstorm) | ✅ Resolvido — fluxo unificado |
| P5 (Especialista nunca ativado) | ⚠️ Parcial — ativado, mas sem resources na ativação |
| P6 (Resources não injetados) | ⚠️ Parcial — injetados na fase `generating`, não na `collecting` |
| P10 (IA chama tool errada) | ✅ Resolvido — next_action preciso |
| P11 (next_action sem parâmetros) | ✅ Resolvido — parâmetros completos |
| P13 (Contexto mostra caminhos) | ⚠️ Parcial — contexto.ts melhorou, mas skill não chega na collecting |
| P14 (IA tenta debugar no projeto errado) | ✅ Resolvido — recovery paths |

**Porém, 10 novos problemas (NP1-NP10) foram identificados na conversa v2.**

---

## 2. Timeline Cronológica da Conversa v2

### Fase 1: Setup e Criação (linhas 1-198) — ✅ FUNCIONAL

| Momento | O que aconteceu | Resultado |
|---|---|---|
| Usuário: "iniciar projeto com maestro" | IA executou setup_inicial com ide/modo/stitch | ✅ |
| Setup pede confirmação de config | IA perguntou se quer usar config global ou ajustar | ✅ P7 resolvido |
| Usuário: "o stitch precisa ser utilizado" | Config ajustada com stitch=true | ✅ P8 resolvido |
| Projeto criado | Especialista ativado, 6 perguntas mostradas em bloco | ✅ P2/P5 parcial |
| IA perguntou todas as 6 perguntas juntas | Perguntas em batch, focadas em produto | ✅ P2 resolvido |

### Fase 2: Coleta de Dados (linhas 200-293) — ⚠️ PROBLEMAS

| Momento | O que aconteceu | Problema |
|---|---|---|
| Usuário: "crie essas informações apenas para testar" | IA recusou corretamente: "preciso de informações reais" | ✅ Anti-inferência funcionou |
| Usuário: "crie os dados para um sistema de checklist simples" | IA **criou todos os dados** (problema, público, features, riscos, timeline, etc.) | **NP1** |
| Usuário: "pode seguir" | IA chamou executar(avancar) com respostas | ✅ Tool correta |
| MCP respondeu: 5/6 campos (83%) | Campo "riscos" não reconhecido — enviado como "riscos_principais" | **NP2** |
| IA perguntou sobre riscos novamente | Informação duplicada pedida ao usuário | **NP3** |
| Usuário: "pode seguir" (2ª vez) | IA disse "informações registradas" mas **NÃO chamou executar** | **NP4** |
| Usuário: "pode seguir" (3ª vez) | IA ficou parada, não avançou automaticamente | **NP4** |

### Fase 3: Geração do PRD (linhas 300-338) — ⚠️ PROBLEMAS GRAVES

| Momento | O que aconteceu | Problema |
|---|---|---|
| IA pediu mais dados (persona, JTBD, visão, GTM) | Campos extras NÃO estão nos `getRequiredFields` do handler | **NP5** |
| Usuário: "crie esses dados para o projeto de teste" | IA gerou PRD (131 linhas) **SEM usar o template** | **NP6** |
| PRD.md criado no projeto | Formato livre, não segue template PRD.md do especialista | **NP6** |

### Fase 4: Submissão e Loop Infinito (linhas 344-1312) — ❌ FALHA CRÍTICA

| Momento | O que aconteceu | Problema |
|---|---|---|
| Usuário: "pode avançar" | IA chamou executar(avancar) com entregavel + estado_json | ✅ Tool correta |
| MCP respondeu: "Gerando PRD draft" | `handleGenerating` executado — mostrou template + checklist | **NP7** |
| IA reescreveu PRD seguindo template (164 linhas) | Segundo PRD, agora com template correto | ⚠️ Retrabalho |
| IA submeteu PRD novamente com executar(avancar) | MCP respondeu NOVAMENTE com "Gerando PRD draft" | **NP7** |
| IA submeteu pela 3ª vez | MCP respondeu pela 3ª vez com "Gerando PRD draft" | **NP7** |
| IA desistiu | "Ainda não consegui avançar" | ❌ FLUXO MORTO |

---

## 3. Catálogo de Novos Problemas (NP1-NP10)

### NP1: Especialista aceita criar dados em vez de extrair do usuário
- **Severidade:** Alto
- **O que aconteceu:** Usuário pediu "crie os dados para um sistema de checklist simples". A IA criou todos os 6 campos obrigatórios sozinha (problema, público, features, métrica, riscos, timeline).
- **Causa raiz:** As regras anti-inferência proíbem inventar dados "para teste", mas quando o usuário dá um tema ("checklist simples"), a IA interpreta como permissão para inventar dados ficcionais coerentes. Não há enforcement server-side — o handler aceita qualquer `respostas` sem verificar fonte.
- **Arquivo:** `specialist-phase-handler.ts:88-93` — aceita respostas sem validação de origem.
- **Impacto:** O especialista perde sua função principal: extrair informações reais do usuário de forma conversacional. O PRD resulta em dados inventados pela IA.

### NP2: Mapeamento de campos inconsistente (riscos_principais vs riscos)
- **Severidade:** Médio
- **O que aconteceu:** A IA enviou o campo como `riscos_principais` (nome descritivo), mas o handler espera `riscos` (ID do campo em `getRequiredFields`).
- **Causa raiz:** `getRequiredFields` define `id: 'riscos'`, mas as instruções no output de `iniciar-projeto.ts` não mostram os IDs exatos. A IA usa um nome descritivo diferente.
- **Arquivo:** `specialist-phase-handler.ts:544` (campo `riscos`) vs output de `iniciar-projeto.ts:502-507` que mostra `respostas` com IDs corretos, mas a IA escolheu usar outro nome.
- **Impacto:** Round-trip extra pedindo campo já fornecido. Frustrante para o usuário.

### NP3: Perguntas duplicadas após mapeamento falho
- **Severidade:** Médio
- **O que aconteceu:** MCP reportou 5/6 campos (83%), pedindo "riscos" quando já tinha "riscos_principais" com os mesmos dados.
- **Causa raiz:** Consequência direta do NP2. O handler não faz fuzzy matching de campos semelhantes.
- **Arquivo:** `specialist-phase-handler.ts:100-101` — `missing` check é exato por `id`.
- **Impacto:** Usuário vê dados que já forneceu sendo pedidos novamente.

### NP4: IA para e espera comando do usuário (stall points)
- **Severidade:** Alto
- **O que aconteceu:** Após coletar dados, a IA disse "informações registradas... podemos avançar para a elaboração do PRD" mas NÃO chamou executar automaticamente. O usuário teve que dizer "pode seguir" 3 vezes.
- **Causa raiz múltipla:**
  1. O handler retorna `auto_execute: true` no `next_action`, mas **não há mecanismo no MCP que force a execução automática**. É apenas uma sugestão para a IA.
  2. A IA interpreta as respostas do MCP mas não segue `next_action` automaticamente.
  3. Na segunda e terceira tentativa, a IA decidiu analisar o diretório ou pedir mais dados em vez de chamar a tool.
- **Arquivo:** `specialist-phase-handler.ts:249-251` (`auto_execute: true` é ignorado pelo runtime MCP).
- **Impacto:** Experiência fragmentada. Usuário precisa empurrar o fluxo manualmente a cada etapa.

### NP5: IA pede dados extras não rastreados pelo handler
- **Severidade:** Alto
- **O que aconteceu:** Após MCP marcar todos os campos como coletados, a IA pediu "persona principal", "persona secundária", "JTBD", "visão/missão", "GTM", "funcionalidades futuras", "métricas adicionais" — 7 campos extras não rastreados.
- **Causa raiz:** O handler marca `generating` quando os 6 campos obrigatórios estão preenchidos. Mas o template PRD.md tem 10 seções com dezenas de sub-campos. A IA vê o gap entre os 6 dados coletados e o template completo, e decide pedir mais.
- **Arquivo:** 
  - `specialist-phase-handler.ts:538-551` — apenas 6-8 campos rastreados
  - `content/skills/specialist-gestao-produto/resources/templates/PRD.md` — 10 seções, ~50 sub-campos
- **Impacto:** O especialista fica "em dois mundos": o handler diz "pronto para gerar", mas o template exige muito mais. A IA tenta compensar pedindo dados extras ao usuário.

### NP6: PRD gerado sem template na primeira tentativa
- **Severidade:** Crítico
- **O que aconteceu:** A IA gerou o primeiro PRD (131 linhas) em formato livre, sem usar o template do especialista. Só na segunda tentativa (após MCP injetar o template) foi que a IA reformatou.
- **Causa raiz:** O template e checklist são injetados APENAS na fase `generating` (quando `handleGenerating` é chamado). Na fase `collecting`, a IA não tem acesso ao template. Quando a IA decidiu gerar o PRD por conta própria (antes do handler transicionar), não tinha o template disponível.
- **Arquivo:** `specialist-phase-handler.ts:186-199` — template carregado em `handleGenerating`, não em `handleCollecting` ou `buildCollectionPrompt`.
- **Impacto:** Retrabalho de 100%. PRD tem que ser refeito. O template deveria estar disponível desde a ativação do especialista.

### NP7: Loop infinito no estado `generating` (BUG CRÍTICO)
- **Severidade:** Crítico / Bloqueante
- **O que aconteceu:** Quando a IA enviou o PRD como `entregavel` via `executar(avancar)`, o handler entrou em `handleGenerating` novamente em vez de transicionar para `handleValidating`. Isso se repetiu 3 vezes até a IA desistir.
- **Causa raiz:** O switch em `handleSpecialistPhase` despacha `case 'generating'` para `handleGenerating()`. Mas `handleGenerating()` **NÃO verifica se `args.entregavel` existe**. Sempre retorna as instruções de geração + template, sem nunca transicionar para `validating`.
- **Código do bug:**
```typescript
// specialist-phase-handler.ts:54-55
case 'generating':
    return handleGenerating(args, onboarding, sp);
```
`handleGenerating` (linha 178) recebe `args` mas nunca inspeciona `args.entregavel`. O fix correto seria:
```typescript
case 'generating':
    if (args.entregavel) {
        sp.status = 'validating';
        return handleValidating(args, onboarding, sp);
    }
    return handleGenerating(args, onboarding, sp);
```
- **Arquivo:** `specialist-phase-handler.ts:54-55` e `handleGenerating` (linhas 178-277)
- **Impacto:** **BLOQUEANTE** — impossível avançar além da geração do PRD. Fluxo morre aqui.

### NP8: MCP Resources/Prompts não consumidos proativamente pela IA
- **Severidade:** Alto
- **O que aconteceu:** O MCP expõe resources (`maestro://skills/specialist-gestao-produto/SKILL.md`, templates, checklists) e prompts (`maestro-specialist`, `maestro-context`). Mas a IA **nunca os consumiu** durante a conversa.
- **Causa raiz:** 
  1. O protocolo MCP não força o cliente a ler resources — são opcionais.
  2. O Windsurf (client) pode não chamar `ListResources` ou `ReadResource` automaticamente.
  3. Não há mecanismo no output das tools para forçar a IA a ler resources.
  4. Os prompts MCP (`maestro-specialist`) contêm o template e checklist completos, mas não são consumidos.
- **Arquivo:** `shared-resource-handler.ts`, `shared-prompt-handler.ts`, `stdio.ts:50-57`
- **Impacto:** Todo o sistema de injeção via MCP Resources/Prompts é ineficaz se o client não os lê. A injeção deve ser feita **inline no output das tools**, não via resources separados.

### NP9: Perguntas técnicas para usuário não-técnico
- **Severidade:** Médio
- **O que aconteceu:** As perguntas do especialista usam termos técnicos: "North Star Metric", "JTBD", "go-to-market", "RICE". Um usuário não-técnico não saberia responder.
- **Causa raiz:** `getRequiredFields` usa labels e hints orientados a product managers experientes, não a usuários leigos.
- **Arquivo:** `specialist-phase-handler.ts:538-551`
- **Impacto:** O especialista deveria **traduzir** conceitos técnicos em perguntas simples. Ex: "North Star Metric" → "Qual o número mais importante para saber se seu produto está funcionando?"

### NP10: Validação de score baseada em regex é superficial
- **Severidade:** Médio
- **O que aconteceu:** O `calculatePrdScore` usa regex simples para detectar seções. Um PRD com a palavra "problema" em qualquer contexto ganha 15 pontos. Isso levaria a scores artificialmente altos.
- **Causa raiz:** `calculatePrdScore` (linhas 556-581) verifica apenas presença de palavras-chave, não qualidade ou completude real das seções.
- **Arquivo:** `specialist-phase-handler.ts:556-581`
- **Impacto:** PRDs incompletos podem ser aprovados; PRDs bons podem ser reprovados se usarem sinônimos.

---

## 4. Análise de Causa-Raiz por Categoria

### Categoria A: Especialista como Gestor de Produto (NP1, NP5, NP9)

**Problema central:** O especialista não foi desenhado para extrair informações de usuários não-técnicos. Ele assume que o usuário é um product manager que sabe responder sobre "North Star Metric" e "JTBD".

**Por que ocorre:**
1. `getRequiredFields` define campos com linguagem técnica (NP9)
2. Os campos obrigatórios (6-8) não cobrem o que o template PRD exige (~50 sub-campos) (NP5)
3. O handler aceita respostas sem verificar se vieram do usuário ou da IA (NP1)

**O que deveria acontecer:**
- Perguntas em linguagem simples, com exemplos práticos
- Campo de perguntas que cubra as seções do template PRD
- Perguntas em blocos temáticos (não todas de uma vez)
- O especialista deveria reformular perguntas quando o usuário não entende

### Categoria B: Injeção de Contexto do Especialista (NP6, NP8)

**Problema central:** O template PRD, checklist e guia do especialista só são injetados na fase `generating`. Na fase `collecting` (onde a IA mais precisa deles para fazer perguntas inteligentes), eles não estão disponíveis.

**Por que ocorre:**
1. `handleCollecting` e `buildCollectionPrompt` não carregam skills (NP6)
2. MCP Resources são expostos mas não consumidos pelo client (NP8)
3. O `iniciar-projeto.ts` menciona o template mas não o injeta no output (apenas instruções textuais)

**O que deveria acontecer:**
- Template + checklist injetados **desde a ativação** do especialista
- Na fase `collecting`, o template serve como guia para as perguntas
- Fallback inline quando MCP Resources não são consumidos

### Categoria C: Transições de Estado (NP4, NP7)

**Problema central:** As transições entre estados do especialista são quebradas em dois pontos críticos.

**Bug NP7 (BLOQUEANTE):**
`handleGenerating` nunca verifica `args.entregavel`. Quando a IA envia o PRD, o handler volta a mostrar o template em loop infinito. O switch deveria transicionar para `validating` quando `entregavel` está presente.

**Stall NP4:**
`auto_execute: true` é uma propriedade informativa — o runtime MCP não tem capacidade de forçar execução automática. A IA precisa interpretar e agir, mas frequentemente para esperando input do usuário.

### Categoria D: Mapeamento e Consistência (NP2, NP3, NP10)

**Problema central:** Inconsistências entre IDs de campos, labels e o que a IA efetivamente envia.

**NP2/NP3:** `riscos_principais` enviado mas `riscos` esperado. O handler faz match exato por ID.

**NP10:** Score calculado por regex é trivial demais para validar um PRD de 200+ linhas.

---

## 5. Relação Problemas Novos vs. Problemas Originais

| Novo | Relacionado a | Status do Original |
|---|---|---|
| NP1 | P9 (IA inventa dados) | P9 foi parcialmente resolvido — IA recusa "preencha para teste" mas aceita "crie dados para X" |
| NP2 | P11 (next_action sem parâmetros) | P11 resolvido, mas campo IDs inconsistentes |
| NP3 | P11 | Consequência de NP2 |
| NP4 | P10, P12 (flow stalls) | P10/P12 resolvidos, mas novo tipo de stall |
| NP5 | P5, P6 (especialista/resources) | Novo — gap entre campos rastreados e template |
| NP6 | P6, P13 (resources não injetados) | P6/P13 parcialmente resolvidos — timing errado |
| NP7 | P3, P12 (transição quebrada) | Novo BUG — handleGenerating não transiciona |
| NP8 | P6, P13 (resources) | Novo — MCP Resources não consumidos |
| NP9 | P2 (perguntas genéricas) | Novo — perguntas técnicas demais |
| NP10 | (novo) | Novo — validação superficial |

---

## 6. Fluxo Atual (com Problemas Anotados)

```
maestro() → setup_inicial ✅
  → Config confirmada por projeto ✅ (P7, P8 resolvidos)
  → criar_projeto com ide/modo/stitch ✅
  → confirmarProjeto() → estado com specialistPhase ✅
  → Especialista ativado com perguntas (sem template/checklist) ⚠️ NP6, NP8
  → IA faz perguntas ao usuário ✅
  → Usuário pode pedir "crie dados para X" → IA inventa tudo ⚠️ NP1
  → executar(avancar, respostas) → handleCollecting ✅
    → Campo "riscos_principais" não mapeado → pede "riscos" de novo ⚠️ NP2, NP3
  → Todos os campos coletados → status = 'generating' ✅
  → IA recebe template + dados → STALL esperando comando ⚠️ NP4
  → IA pede dados extras (persona, JTBD, GTM) ⚠️ NP5
  → IA gera PRD sem template (primeira vez) ⚠️ NP6
  → executar(avancar, entregavel) → handleGenerating NOVAMENTE
    → NÃO verifica entregavel → retorna template de novo ❌ NP7
    → LOOP INFINITO: generating → generating → generating ❌ NP7
  → FLUXO MORTO ❌
```

---

## 7. Fluxo Proposto (Corrigido)

```
maestro() → setup_inicial ✅
  → Config confirmada por projeto ✅
  → criar_projeto → confirmarProjeto()
  → Especialista ativado COM template + checklist + guia DESDE O INÍCIO
    → Template serve como guia para perguntas inteligentes
    → Perguntas em linguagem simples (não técnica)
    → Blocos temáticos: 1) Problema/Público, 2) Solução/MVP, 3) Métricas/Riscos
  → handleCollecting: 
    → Fuzzy matching de campos (riscos_principais → riscos)
    → Campos alinhados com seções do template PRD
    → Quando completo → auto-transição para generating
  → handleGenerating:
    → SE entregavel presente → transicionar para validating
    → SE não → mostrar template + dados + instruções
    → Mecanismo de auto-continuidade (sem esperar "pode seguir")
  → handleValidating:
    → Validação estruturada (não apenas regex)
    → Score calculado por seções preenchidas
    → SE >= 70 → approved → avançar automaticamente
    → SE < 70 → mostrar gaps + instruções de melhoria
  → handleApproved → próxima fase
```

---

## 8. Impacto por Arquivo

| Arquivo | Problemas | Mudança Necessária |
|---|---|---|
| `specialist-phase-handler.ts` | NP1, NP2, NP3, NP5, NP6, NP7, NP10 | Bug fix transição generating→validating; injetar resources na collecting; fuzzy field matching; campos alinhados com template; validação estruturada |
| `iniciar-projeto.ts` | NP6, NP8, NP9 | Injetar template/checklist no output de criação; perguntas em linguagem simples |
| `skill-loader.service.ts` | NP6, NP8 | Método para carregar pacote resumido para fase collecting |
| `shared-prompt-handler.ts` | NP8, NP9 | Garantir que prompts incluam perguntas adaptadas ao nível do usuário |
| `content/skills/specialist-gestao-produto/SKILL.md` | NP9 | Adicionar seção com perguntas adaptadas para não-técnicos |
| `onboarding.service.ts` | NP5 | Alinhar campos iniciais com seções do template PRD |

---

## 9. Métricas Comparativas: v1 (antes) vs v2 (pós-refatoração)

| Métrica | v1 (resolver v1) | v2 (resolver v2) | Meta |
|---|---|---|---|
| Setup pergunta ao usuário | 0% | 100% ✅ | 100% |
| Config confirmada por projeto | 0% | 100% ✅ | 100% |
| Anti-inferência (recusa dados fictícios) | 0% | ~50% ⚠️ | 100% |
| PRD gerado com template real | 0% | 50% (2ª tentativa) ⚠️ | 100% (1ª) |
| Validação com checklist real | 0% | 0% ❌ | 100% |
| IA chama tool correta | 50% | 100% ✅ | 100% |
| Erros de transição | 1 fatal | 1 fatal (diferente) ❌ | 0 |
| Flow stalls (IA para) | 1 | 3 ⚠️ | 0 |
| Fluxo completo até aprovação | 0% | 0% ❌ | 100% |
| Tempo setup → PRD aprovado | ∞ (morreu) | ∞ (morreu em estágio diferente) ❌ | ~20 min |

---

## 10. Conclusão

A refatoração v6.0 corrigiu os problemas **estruturais** do fluxo (discovery/brainstorm eliminados, next_action preciso, config por projeto). Porém, introduziu novos problemas na **execução do especialista**:

1. **Bug bloqueante** (NP7): Loop infinito no `generating` por falta de transição quando entregável é enviado
2. **Timing de injeção** (NP6/NP8): Template não disponível quando mais necessário (coleta)
3. **UX do especialista** (NP1/NP5/NP9): Perguntas técnicas demais, campos desalinhados com template
4. **Flow continuity** (NP4): IA para entre etapas esperando comando do usuário

O roadmap v3 deve priorizar o bug NP7 (1 linha de fix), depois o timing de injeção (NP6), e por fim a UX do especialista (NP1/NP5/NP9).

---

**Versão:** 1.0  
**Autor:** Cascade + Usuário  
**Data:** 2026-02-10  
**Base:** Conversa de teste `docs/resolver v2.md` — 10 novos problemas identificados
