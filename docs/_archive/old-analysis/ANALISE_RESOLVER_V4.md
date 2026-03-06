# Análise — Resolver v4: Loop Infinito Pós-Aprovação PRD

## Data: 2026-02-10
## Versão: v7.x

---

## 1. Resumo Executivo

Após o PRD ser aprovado com score 100/100, o sistema entra em **loop infinito** alternando entre:
- `handleApproved` → instrui IA a avançar
- `avancar.ts` → delega para specialist handler (porque `specialistPhase` ainda existe)
- specialist handler → vê status `approved` → chama `handleApproved` novamente
- Quando IA tenta com `entregavel` → `proximo.ts` → classifica texto como PRD → pede confirmação de nível
- IA envia `respostas.nivel` → `avancar.ts` → specialist handler (ignora respostas) → loop

O usuário tentou **8 vezes** avançar sem sucesso.

---

## 2. Cadeia de Bugs (Root Cause Analysis)

### Bug A (RAIZ): `handleApproved` não limpa `specialistPhase` do onboarding

**Arquivo:** `src/src/handlers/specialist-phase-handler.ts:571-579`

```typescript
// handleApproved seta:
estado.fase_atual = 1;
estado.aguardando_classificacao = true;
// MAS NÃO FAZ:
// delete onboarding.specialistPhase; // ← FALTA
// onboarding.phase = 'completed';    // ← seta mas não importa
```

**Consequência:** `onboarding.specialistPhase` continua existindo com status `'approved'`.

### Bug B (ROTEAMENTO): `avancar.ts` prioriza `specialistPhase` sobre `aguardando_classificacao`

**Arquivo:** `src/src/tools/consolidated/avancar.ts:77-102`

```typescript
const inOnboarding = isInOnboarding(estado);
if (inOnboarding) {
    if (onboarding?.specialistPhase) {  // ← SEMPRE true após approved
        return handleSpecialistPhase(...);  // ← NUNCA chega no proximo.ts
    }
}
```

**Problema:** `isInOnboarding` retorna `true` porque `determineCurrentPhase` vê `aguardando_classificacao=true` antes de checar `specialistPhase`. Mas `avancar.ts` verifica `specialistPhase` existir (não o status) e delega para o handler errado.

### Bug C (TRANSIÇÃO): Não existe handler para `respostas.nivel` no specialist-phase-handler

Quando `proximo.ts` eventualmente é alcançado e pede confirmação de classificação, a IA envia `respostas: {nivel: "simples"}`. Mas `avancar.ts` delega para o specialist handler que não sabe processar `respostas.nivel` — ele trata como dados de coleta do PRD.

### Bug D (ESTADO): `proximo.ts` requer `estado_json` como string mas `avancar.ts` passa string vazia

**Arquivo:** `src/src/tools/consolidated/avancar.ts:143-150`

```typescript
return proximo({
    estado_json: args.estado_json || "",  // ← passa "" quando auto-carregou do filesystem
    ...
});
```

`proximo.ts` falha silenciosamente com `estado_json: ""` porque `parsearEstado("")` retorna null.

---

## 3. Problemas Secundários Identificados

### P5: `handleApproved` não seta `classificacao_sugerida`
O `proximo.ts` espera `estado.classificacao_sugerida` para mostrar a sugestão ao usuário, mas `handleApproved` não popula esse campo.

### P6: `isInOnboarding` inclui `"aguardando_classificacao"` indiretamente
`determineCurrentPhase` retorna `"aguardando_classificacao"` que NÃO está na lista de `isInOnboarding`, mas o check de `specialistPhase` existir bypassa essa lógica.

### P7: Sem proteção anti-loop
Nenhum mecanismo detecta que o sistema está em loop (mesma resposta repetida N vezes).

### P8: `proximo.ts` re-classifica PRD toda vez
Quando `estado.fase_atual === 1` e `status === "aguardando_prd"`, `proximo.ts` reclassifica o entregável como PRD, mesmo que já tenha sido aprovado.

---

## 4. Fluxo Esperado vs Fluxo Real

### Esperado:
```
PRD Aprovado → handleApproved → limpa onboarding → seta aguardando_classificacao
→ avancar.ts → NÃO é onboarding → proximo.ts → classifica PRD → pede confirmação
→ IA envia respostas.nivel → proximo.ts → confirma → avança para fase 2
```

### Real:
```
PRD Aprovado → handleApproved → NÃO limpa specialistPhase → seta aguardando_classificacao
→ avancar.ts → isInOnboarding=true → specialistPhase existe → specialist handler
→ status=approved → handleApproved → mesma instrução → LOOP
```

---

## 5. Impacto

- **Severidade:** BLOQUEANTE — impossível avançar além da fase 1
- **Frequência:** 100% dos projetos que completam o onboarding
- **Workaround:** Nenhum (editar estado.json manualmente)
