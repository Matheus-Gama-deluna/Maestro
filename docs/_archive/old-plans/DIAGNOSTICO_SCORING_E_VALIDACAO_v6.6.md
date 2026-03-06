# Diagnóstico: Sistema de Scoring e Validação — Bugs Críticos v6.6

## Contexto do Problema

Durante teste real do Maestro MCP, a IA ficou presa em loop tentando avançar a fase de Arquitetura (fase 6). O entregável foi submetido 3 vezes, progressivamente mais detalhado (~15K chars), mas o score permaneceu fixo em **58/100** sem nunca mudar, mesmo com conteúdo significativamente melhorado.

---

## Causa Raiz #1 (CRÍTICO): `aguardando_aprovacao` bloqueia re-validação

**Arquivo:** `src/src/tools/proximo.ts` linhas 416-460

**O que acontece:**
1. Primeira submissão → `proximo()` valida → score 58 → seta `estado.aguardando_aprovacao = true` → salva estado
2. Segunda submissão → `proximo()` lê estado com `aguardando_aprovacao = true` → **retorna mensagem de bloqueio IMEDIATAMENTE** → **NUNCA re-valida o novo conteúdo**
3. Terceira submissão → mesma coisa — o conteúdo novo é completamente ignorado

**Código problemático:**
```typescript
// proximo.ts L416-460
if (estado.aguardando_aprovacao) {
    // Retorna imediatamente SEM re-validar!
    return {
        content: [{ type: "text", text: "⛔ Projeto Aguardando Aprovação..." }],
    };
}
```

**Impacto:** A IA NUNCA consegue melhorar o score via re-submissão. Apenas a aprovação manual do usuário ou edição direta do `estado.json` resolve.

**Fix:** Quando um novo `entregavel` é fornecido (argumento ou disco), resetar `aguardando_aprovacao` e re-validar.

---

## Causa Raiz #2 (CRÍTICO): Mapeamento binário de checklist

**Arquivo:** `src/src/tools/proximo.ts` linhas 659-663

**O que acontece:**
O `ValidationPipeline.validateDeliverable()` retorna `results` como array de **1 elemento** (o resultado do `DeliverableValidator`). Mas `calcularQualityScore()` mapeia esse array como se fossem itens individuais de checklist:

```typescript
// proximo.ts L659-663
const scoreContextual = calcularQualityScore(
    { score: validationResult.overallScore, ... },
    { 
        itens_validados: validationResult.results.filter(r => r.passed).map(r => r.layer),  // 0 ou 1 elemento!
        itens_pendentes: validationResult.results.filter(r => !r.passed).map(r => r.layer), // 0 ou 1 elemento!
        ...
    },
    faseAtual.nome
);
```

**Cálculo real para Arquitetura (categoria 'design'):**
- Pesos: `{ estrutura: 0.30, checklist: 0.30, qualidade: 0.40 }`
- Quando `DeliverableValidator.passed = false`:
  - `itens_validados = []` → `checklistScore = 0/1 × 100 = 0%`
  - `tamanhoScore = 100` (hardcoded true)
  - `score = round(overallScore × 0.30 + 0 × 0.30 + 100 × 0.40)`
  - **Se overallScore = 60: score = round(18 + 0 + 40) = 58** ← EXATAMENTE 58!

**Impacto:** O score fica fixo em ~58 para qualquer entregável de Arquitetura que não passe no `DeliverableValidator` (score < 70), independentemente da qualidade real do conteúdo.

**Fix:** Usar os issues individuais do `DeliverableValidator` ao invés do resultado binário por layer.

---

## Causa Raiz #3: Feedback sem itens específicos ❌/✅

**Arquivo:** `src/src/tools/proximo.ts` linhas 667-676

**O que acontece:**
O sistema diz "Foque nos itens ❌ pendentes listados acima" mas os itens nunca são listados porque:
- `gateResultado.itens_pendentes` contém apenas `["[Entregável (Arquitetura)] Gate checklist incompleto — 2/6 itens não evidenciados"]`
- Os itens específicos que faltam ficam dentro dos `issues` do `DeliverableValidator` mas são perdidos na conversão

**Fix:** Extrair e listar cada item individual do gate_checklist que passou/falhou.

---

## Causa Raiz #4: Entregável do disco ignorado quando passado como argumento

**Arquivo:** `src/src/tools/proximo.ts` linhas 231-264

**O que acontece:**
```typescript
if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_CONTEUDO_REAL) {
    // Só tenta ler do disco se o argumento está vazio/curto
}
```

Quando a IA passa o conteúdo como argumento `entregavel` (>100 chars), o sistema NUNCA lê do disco. Problemas:
1. Gasta tokens (a IA envia 15K chars na chamada de tool)
2. Se a IA editou o arquivo e depois chamou `executar`, o conteúdo do argumento pode ser diferente do disco
3. O sistema deveria PREFERIR o disco quando o arquivo existe

**Fix:** Sempre tentar ler do disco primeiro. Usar argumento como fallback.

---

## Causa Raiz #5: Dois sistemas de validação divergentes

**Arquivos:**
- `proximo.ts` usa `ValidationPipeline.validateDeliverable()` → `DeliverableValidator`
- `validar-gate.ts` usa `IntelligentGateEngine.validateDeliverable()` → Sistema inteligente com 5 componentes

**O que acontece:**
- O `IntelligentGateEngine` tem scoring adaptativo, análise semântica profunda, 5 níveis de maturidade
- O `DeliverableValidator` tem keyword matching simples com penalidades fixas
- Ambos dão scores diferentes para o mesmo conteúdo
- A IA fica confusa quando `validar_gate` diz que está OK mas `proximo/executar` diz que não

**Fix:** Unificar usando `IntelligentGateEngine` no `proximo.ts` também.

---

## Causa Raiz #6: DeliverableValidator usa keyword matching frágil

**Arquivo:** `src/src/core/validation/layers/DeliverableValidator.ts` linhas 40-95, 175-189

**Problemas:**
1. `SECOES_POR_FASE['Arquitetura']` tem apenas 5 keywords: `['stack', 'componente', 'diagrama', 'decisão', 'adr']`
2. Keywords como "decisão" podem não fazer match com "Decisões Arquiteturais" dependendo da normalização
3. Gate checklist match usa `palavrasChave.some(palavra => contentLower.includes(palavra))` — basta 1 palavra > 3 chars fazer match, que é muito leniente para alguns itens e muito restritivo para outros
4. `calculateScore()` usa penalidades cumulativas fixas que não refletem a qualidade real do conteúdo

---

## Plano de Implementação

### Sprint Imediato — Bugs Críticos (3 fixes)

| # | Fix | Arquivo | Impacto |
|---|-----|---------|---------|
| 1 | Re-validar quando novo entregável é fornecido | `proximo.ts` L416-460 | Score não fica mais fixo |
| 2 | Mapear issues individuais ao invés de resultado binário | `proximo.ts` L659-663 | Score reflete qualidade real |
| 3 | Listar itens ❌/✅ específicos no feedback | `proximo.ts` L667-676 | IA sabe o que corrigir |

### Sprint Seguinte — Melhorias de Robustez (3 melhorias)

| # | Melhoria | Arquivo | Impacto |
|---|----------|---------|---------|
| 4 | Preferir leitura do disco | `proximo.ts` L231-264 | Menos tokens, mais consistência |
| 5 | Usar IntelligentGateEngine no proximo.ts | `proximo.ts` L618-663 | Scoring unificado e justo |
| 6 | Mostrar delta de score em re-submissões | `proximo.ts` L739-808 | Feedback incremental claro |

### Verificação

```bash
npx tsc --noEmit          # Build sem erros
npm test                  # Testes passando
```

---

## Status de Implementação

### ✅ IMPLEMENTADO (Build: 0 erros | Testes: 505 passing, 4 skipped, 0 failed)

| # | Fix | Status | Arquivo |
|---|-----|--------|---------|
| 1 | Re-validar quando novo entregável é fornecido | ✅ | `proximo.ts` L426-476 |
| 2 | Mapear issues individuais (scoring granular) | ✅ | `proximo.ts` L674-750 |
| 3 | Listar itens ❌/✅ específicos no feedback | ✅ | `proximo.ts` L732-748 |
| 4 | Preferir leitura do disco sobre argumento | ✅ | `proximo.ts` L247-272 |
| 5 | Usar IntelligentGateEngine no proximo.ts | ⏳ Pendente | — |
| 6 | Mostrar delta de score em re-submissões | ✅ | `proximo.ts` L764-768 |

---

## Reprodução do Bug (ANTES dos fixes)

Para reproduzir o score fixo em 58:
1. Criar projeto complexo com Maestro
2. Chegar à fase 6 (Arquitetura)
3. Submeter entregável com `executar({acao: "avancar", entregavel: "..."})`
4. Score será 58/100 (bloqueado)
5. Melhorar entregável e re-submeter → Score continua 58/100 (bug #1: não re-valida)
6. Mesmo se forçar re-validação → Score continua ~58 (bug #2: fórmula binária)

## Após os fixes

1. Re-submissão agora re-valida o conteúdo (FIX #1)
2. Score reflete qualidade real com itens granulares (FIX #2)
3. Cada item do gate_checklist é listado como ✅ ou ❌ (FIX #3)
4. Entregável é lido do disco quando disponível (FIX #4)
5. Delta de score é mostrado entre re-submissões (MELHORIA #6)
