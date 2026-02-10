# Roadmap de Implementação — Fix Resolver v4

## Data: 2026-02-10
## Referência: docs/analysis/ANALISE_RESOLVER_V4.md

---

## Sprint 1: Fix Transição approved→classificação (BUG BLOQUEANTE) ~30min

### Arquivo: `src/src/handlers/specialist-phase-handler.ts`

**Mudança 1A:** `handleApproved` deve:
1. Limpar `specialistPhase` do onboarding (ou marcar como `null`)
2. Setar `onboarding.phase = 'completed'`
3. Classificar o PRD e popular `estado.classificacao_sugerida`
4. Setar `estado.status = 'ativo'` (não mais `'aguardando_prd'`)

**Mudança 1B:** Importar `classificarPRD` e usar o PRD do disco para gerar sugestão.

---

## Sprint 2: Fix Roteamento no avancar.ts ~30min

### Arquivo: `src/src/tools/consolidated/avancar.ts`

**Mudança 2A:** Antes de delegar para specialist handler, verificar se `specialistPhase.status === 'approved'` E `estado.aguardando_classificacao === true`. Nesse caso, NÃO delegar para specialist — ir direto para o fluxo de classificação.

**Mudança 2B:** Quando `!inOnboarding` e `estado.aguardando_classificacao`, processar `respostas.nivel` inline (chamar `confirmarClassificacao` ou fazer inline) em vez de exigir entregável.

**Mudança 2C:** Passar o estado carregado do filesystem para `proximo.ts` em vez de string vazia.

---

## Sprint 3: Handler de Classificação Inline no avancar.ts ~45min

### Arquivo: `src/src/tools/consolidated/avancar.ts`

**Mudança 3A:** Novo bloco que detecta `aguardando_classificacao + respostas.nivel` e:
1. Confirma classificação
2. Limpa flags
3. Avança para fase 2 automaticamente (ou retorna instrução clara)

**Mudança 3B:** Serializar e persistir estado após confirmação.

---

## Sprint 4: Proteção Anti-Loop ~20min

### Arquivo: `src/src/handlers/specialist-phase-handler.ts`

**Mudança 4A:** Adicionar campo `lastHandlerOutput` no SpecialistPhaseState que guarda hash do último output.
Se o mesmo output seria gerado 2x seguidas, retornar erro com recovery path.

### Arquivo: `src/src/tools/consolidated/avancar.ts`

**Mudança 4B:** Counter de chamadas consecutivas sem progresso. Após 3 chamadas idênticas, retornar mensagem de erro com diagnóstico.

---

## Sprint 5: Robustez e Edge Cases ~30min

### Múltiplos arquivos

**Mudança 5A:** `isInOnboarding` deve retornar `false` quando `onboarding.phase === 'completed'` E `specialistPhase.status === 'approved'`.

**Mudança 5B:** `determineCurrentPhase` deve priorizar `aguardando_classificacao` sobre `specialistPhase` quando phase='completed'.

**Mudança 5C:** `proximo.ts` — quando recebe estado carregado do filesystem (não string), usar diretamente em vez de re-parsear.

---

## Ordem de Execução

1. Sprint 1 → Fix raiz (handleApproved)
2. Sprint 2 → Fix roteamento (avancar.ts)
3. Sprint 3 → Handler classificação inline
4. Sprint 4 → Anti-loop
5. Sprint 5 → Robustez
6. Build + verificação

## Estimativa Total: ~2.5h
