# Análise Crítica das Propostas de Orquestração — Maestro v9

**Data:** 2026-02-27  
**Base:** `ANALISE_ORQUESTRACAO_SEQUENCIAL_E_SETUP_V9.md`  
**Método:** Revisão técnica contra código real (`flows/types.ts`, `maestro-tool.ts`, `setup-inicial.ts`, `code-phase-handler.ts`, `code-validator.ts`, `deliverable-gate.service.ts`, `state/storage.ts`, `iniciar-projeto.ts`)

---

## 1) Veredicto Geral

O documento original identifica **gaps reais** no Maestro. O diagnóstico AS-IS (seções 3.x) é preciso e bem embasado. Porém, as propostas de solução (seções 5-8) têm **problemas de calibragem** — algumas são over-engineering para o valor que entregam, e outras subestimam riscos de implementação.

Concordo com **70% do diagnóstico** e **50% das soluções propostas**. Abaixo detalho por ponto.

---

## 2) Análise Ponto a Ponto

### 2.1 Setup Pedagógico (Proposta da Fase 0)

**Diagnóstico original:** *"O setup captura preferências técnicas mas não apresenta plano explícito de fases."*

**Minha avaliação: CONCORDO com o problema, DISCORDO da solução.**

O problema é real. Hoje `setup-inicial.ts` pergunta 3 coisas (IDE, modo, stitch) e `handleNoProject` segue direto para `criar_projeto`. O usuário nunca vê a lista de fases que vai percorrer.

Porém, criar uma **Fase 0 separada** com 5 perguntas é over-engineering:

- **Pergunta 1** (trilha) já é respondida pelo `modo` — economy=simples(7), balanced=medio(13), quality=complexo(17). Criar "perfis narrativos" (Essencial/Engenharia Forte/Qualidade Máxima) é renomear o que já existe.
- **Pergunta 3** (manter todas as fases obrigatórias) abre uma Caixa de Pandora: se o usuário desabilitar "Requisitos" e mantiver "Backlog", o sistema precisa lidar com dependências entre fases — complexidade enorme para valor marginal.
- **Pergunta 4** (critérios para codar) é abstrata demais para um usuário no início do projeto.
- **Pergunta 5** (auto-flow) já existe como `auto_flow` no estado.

**Contraproposta: Setup Informativo (não interativo)**

Em vez de mais perguntas, após o `criar_projeto` gerar um **documento informativo automático** com:

1. Lista de fases da trilha escolhida (lida diretamente de `FLUXO_SIMPLES/MEDIO/COMPLEXO` em `flows/types.ts`)
2. Propósito de cada fase (1 linha)
3. Entregável esperado de cada fase
4. Critério de aprovação (gate_checklist resumido)

Isso resolve o gap de "usuário não sabe o que vai percorrer" sem adicionar fricção. Persistir em `docs/00-setup/plano-orquestracao.md` como proposto — mas gerado automaticamente, não via questionário.

**Impacto no código:** Modificar apenas `iniciar-projeto.ts` (confirmarProjeto) para gerar o documento após criar o estado. ~50 linhas de código. Zero perguntas adicionais.

### 2.2 Seleção Formal de Fases (enabled_phases/disabled_phases)

**Diagnóstico original:** *"Hoje ocorre via modo, mas sem governança explícita de fases habilitadas/desabilitadas no estado."*

**Minha avaliação: DISCORDO. Risco > Benefício.**

Permitir desabilitar fases individuais cria problemas sérios:

1. **Dependências implícitas:** Backlog depende de Requisitos. Contrato API depende de Arquitetura. Não existe mapa de dependências em `flows/types.ts` — as fases são apenas um array sequencial.
2. **Validação quebrada:** Os `gate_checklist` de fases posteriores referenciam artefatos de fases anteriores (ex: "Componentes implementados conforme **design doc** e **user stories do backlog**"). Desabilitar UX Design ou Backlog invalida o checklist de Frontend.
3. **Complexidade de estado:** Adicionar `enabled_phases[]` e `disabled_phases[]` ao `EstadoProjeto` exige refatorar `getFluxoComStitch()`, `getFaseComStitch()`, `proximo.ts`, `avancar.ts`, e todos os handlers. Alto custo para um cenário raro.

**Contraproposta: Não implementar.**

Os 3 modos (economy/balanced/quality) já resolvem o escalonamento. Se um usuário quer menos fases, usa economy. Se quer mais rigor, usa quality. A granularidade de desabilitar fases individuais não compensa o risco de estados inconsistentes.

Se no futuro for necessário, implementar como **fases "skip-able" com warning** em vez de "disabled" — a fase existe no fluxo mas pode ser pulada manualmente com `executar(acao="avancar", force_skip=true)`, registrando no estado que foi pulada.

### 2.3 Gate de Prontidão Pré-Código (Readiness Gate)

**Diagnóstico original:** *"Não existe gate único com contrato mínimo obrigatório antes de Frontend/Backend."*

**Minha avaliação: CONCORDO FORTEMENTE. Esta é a proposta mais valiosa do documento.**

Hoje, a transição para código é "suave demais". Quando `proximo.ts` avança da última fase de engenharia (ex: Backlog ou Contrato API) para Frontend, não há checkpoint consolidado. Cada fase anterior teve seu gate individual, mas ninguém verifica se o **conjunto** de artefatos está coerente.

O scoring proposto (100 pontos, 5 dimensões de 20) é razoável, mas precisa de ajustes:

**Score de Prontidão Proposto (revisado):**

| Dimensão | Peso | Verificação Real |
|----------|------|-----------------|
| PRD aprovado | 25 | Existe `docs/01-produto/PRD.md` no disco com >600 chars |
| Requisitos com critérios de aceite | 20 | Existe `requisitos.md` no disco, contém "critério" ou "gherkin" |
| Arquitetura definida | 20 | Existe `arquitetura.md`, contém "stack" e "ADR" |
| Backlog rastreável | 25 | Existe `backlog.md`, contém tabela com "US-" ou "história" |
| Contrato API (quando aplicável) | 10 | Se fluxo médio/complexo: existe `openapi.yaml` |

**Diferenças da proposta original:**
- PRD e Backlog com peso maior (25 cada) — são os artefatos que mais impactam qualidade do código.
- Contrato API com peso menor (10) e condicional — nem todo projeto tem API REST.
- Verificação por **existência real de arquivos no disco** (como o `code-validator.ts` já faz), não por score textual.

**Thresholds:**
- >= 80: auto-approve (**concordo**)
- 60-79: manual approve (**concordo**)
- < 60: bloqueio (**concordo**)

**Impacto no código:** Criar `src/src/gates/readiness-gate.ts` (~150 linhas). Integrar em `avancar.ts` antes de delegar para `code-phase-handler.ts`. Quando `isCodePhaseName(proximaFase)` e a fase atual NÃO é de código (primeira entrada), executar readiness check.

### 2.4 Perfis de Orquestração (renaming dos modos)

**Diagnóstico original:** *"Expor perfis narrativos: Essencial, Engenharia Forte, Qualidade Máxima."*

**Minha avaliação: CONCORDO PARCIALMENTE.**

Renomear é barato e melhora UX. Mas o mapeamento proposto tem um problema:

| Perfil Proposto | Modo Atual | Fases |
|----------------|------------|-------|
| Essencial | economy | 7 |
| Engenharia Forte | balanced | 13 |
| Qualidade Máxima | quality | 17 |

"Engenharia Forte" sugere rigor técnico que o modo `balanced` não necessariamente entrega — balanced tem fases de Segurança e Testes, mas não tem Arquitetura Avançada, Performance nem Observabilidade.

**Contraproposta:** Manter os nomes internos (economy/balanced/quality) e adicionar **descrições expandidas** no setup. O `setup-inicial.ts` já mostra descrições curtas — expandir para incluir a lista de fases. Não criar uma camada de abstração nova que pode ficar desalinhada.

### 2.5 Observabilidade da Orquestração (Sprint D)

**Diagnóstico original:** *"Métricas: tempo por fase, taxa de retrabalho, aprovação em 1ª tentativa, delta de score."*

**Minha avaliação: CONCORDO, mas prioridade baixa.**

Métricas são úteis mas não bloqueantes. O Maestro já tem `logEvent()` para alguns eventos. Expandir para capturar:
- timestamp de entrada/saída de cada fase
- número de tentativas por gate
- score da 1ª tentativa vs score de aprovação

Isso pode ser feito incrementalmente sem sprint dedicada — basta adicionar campos ao `logEvent` existente.

**Prioridade: P3 (depois de tudo).**

### 2.6 Delegação duplicada proximo.ts (Ponto 3.5)

**Diagnóstico original:** *"Após validação por artefatos no code-phase handler, ainda existe delegação para proximo.ts textual."*

**Minha avaliação: CONCORDO FORTEMENTE. Problema real e sutil.**

O fluxo atual é:

```
code-phase-handler.ts:handleGate() 
  → validateCodePhase() [artefatos, score real]
  → SE aprovado → codeState.status = 'completed'
  → delegateToProximo() 
    → proximo.ts 
      → validateDeliverableForGate() [keywords em texto] ← REDUNDANTE
```

O `code-validator.ts` faz validação séria (arquivos no disco, tasks, manifest). Depois disso, `delegateToProximo()` converte tudo para markdown e valida por keywords — potencialmente **contradizendo** o score do code-validator.

**Proposta:** Quando `codeState.status === 'completed'` e o code-validator já aprovou, `delegateToProximo()` deveria pular a validação textual e ir direto para transição de fase. Isso é um fix cirúrgico em `code-phase-handler.ts` (~15 linhas).

---

## 3) Priorização Revisada

| # | Proposta | Valor | Custo | Risco | Recomendação |
|---|----------|-------|-------|-------|-------------|
| 1 | **Readiness Gate pré-código** | ALTO | Médio (~4h) | Baixo | **IMPLEMENTAR (P0)** |
| 2 | **Doc informativo de fases** | Médio | Baixo (~2h) | Nulo | **IMPLEMENTAR (P1)** |
| 3 | **Fix delegação duplicada** | Médio | Baixo (~1h) | Baixo | **IMPLEMENTAR (P1)** |
| 4 | **Descrições expandidas no setup** | Baixo | Baixo (~1h) | Nulo | **IMPLEMENTAR (P2)** |
| 5 | **Observabilidade** | Baixo | Médio (~3h) | Nulo | **DIFERIR (P3)** |
| 6 | **Seleção de fases individuais** | Baixo | Alto (~8h) | Alto | **NÃO IMPLEMENTAR** |
| 7 | **Fase 0 interativa** | Baixo | Alto (~6h) | Médio | **NÃO IMPLEMENTAR** |

---

## 4) Plano de Implementação Proposto (3 Sprints)

### Sprint 1: Readiness Gate (P0, ~4h)

**Novo arquivo:** `src/src/gates/readiness-gate.ts`

```
readinessCheck(estado, diretorio, fluxo) → ReadinessResult
  - Verifica existência real dos entregáveis das fases anteriores no disco
  - Calcula score ponderado (PRD 25, Requisitos 20, Arquitetura 20, Backlog 25, API 10)
  - Retorna score + breakdown + gaps
```

**Modificar:** `src/src/tools/consolidated/avancar.ts`
- Antes de entrar no `code-phase-handler`, se é primeira fase de código:
  ```
  if (isCodePhaseName(proximaFase) && !isCodePhaseName(faseAtual)) {
    const readiness = readinessCheck(estado, diretorio, fluxo);
    if (readiness.score < 60) → BLOQUEAR
    if (readiness.score < 80) → PEDIR APROVAÇÃO MANUAL
  }
  ```

**Modificar:** `src/src/types/index.ts`
- Adicionar `readiness_score?: number` e `readiness_approved?: boolean` ao `EstadoProjeto`

### Sprint 2: Documentação Automática + Fix Delegação (P1, ~3h)

**Modificar:** `src/src/tools/iniciar-projeto.ts`
- Após criar estado, gerar `docs/00-setup/plano-orquestracao.md` automaticamente
- Listar fases do fluxo escolhido com nome, especialista, entregável e checklist resumido

**Modificar:** `src/src/handlers/code-phase-handler.ts`
- Em `delegateToProximo()`, quando `codeState.status === 'completed'` e code-validator já aprovou:
  - Pular validação textual
  - Ir direto para transição de fase via `proximo.ts` com flag `skip_validation: true`

### Sprint 3: UX do Setup (P2, ~1h)

**Modificar:** `src/src/tools/setup-inicial.ts`
- Expandir descrições dos modos com lista de fases incluídas
- Adicionar contagem de fases: "economy (7 fases)", "balanced (13 fases)", "quality (17 fases)"

**Modificar:** `src/src/tools/maestro-tool.ts` (handleNoProject)
- Mesma expansão de descrições quando mostra config global

---

## 5) O Que o Documento Original Acerta

1. **Gate por gate não é suficiente** — validar cada fase isoladamente não garante coerência do conjunto. O Readiness Gate resolve isso.
2. **Setup é técnico demais** — concordo que o usuário precisa de mais contexto sobre o que vai percorrer.
3. **Delegação duplicada é real** — proximo.ts textual contradiz code-validator baseado em artefatos.
4. **Observabilidade é desejável** — saber taxa de retrabalho e aprovação em 1ª tentativa ajuda a calibrar thresholds.

## 6) O Que o Documento Original Erra

1. **Mais perguntas ≠ melhor setup** — 5 perguntas na Fase 0 adicionam fricção sem valor proporcional. Gerar documentação automática resolve o mesmo problema sem custo de UX.
2. **Seleção granular de fases é armadilha** — sem mapa de dependências entre fases, desabilitar fases individuais cria estados impossíveis.
3. **Perfis narrativos são cosmética** — renomear economy/balanced/quality não muda o comportamento do sistema. Melhor investir em descrições melhores.
4. **Sprint D (observabilidade) como Sprint é excessivo** — pode ser feito incrementalmente via `logEvent` existente.

---

## 7) Riscos da Minha Contraproposta

| Risco | Mitigação |
|-------|-----------|
| Readiness Gate muito restritivo | Threshold 60 para bloqueio é generoso. Aprovação manual na faixa 60-79. |
| Doc automático fica desatualizado se fases mudam | Gerar do `flows/types.ts` em runtime — sempre atualizado. |
| Fix delegação quebra fluxo de fases não-código | Flag `skip_validation` só ativa para fases de código com code-validator aprovado. |

---

## 8) Conclusão

O Readiness Gate é a implementação mais valiosa e deve ser priorizada. O documento informativo de fases resolve o gap de UX com custo mínimo. As propostas de seleção granular e Fase 0 interativa devem ser descartadas — adicionam complexidade desproporcional ao valor.

**Ordem recomendada:**
1. Readiness Gate pré-código (blinda a entrada em codificação)
2. Doc automático de fases + fix delegação duplicada
3. UX do setup (descrições expandidas)

Total estimado: **~8h** (vs ~18h da proposta original para as 4 sprints A-D).
