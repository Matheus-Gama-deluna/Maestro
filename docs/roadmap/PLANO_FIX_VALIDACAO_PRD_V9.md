# Plano de Correção — Validação do PRD (v9.0)

**Data:** 2026-02-11
**Status:** Em implementação

---

## Problema

O PRD do SubsTrack recebe score persistente de **67/100** e nunca avança, mesmo contendo todas as seções necessárias (Problema, Usuários/Personas, Funcionalidades/MVP, Métricas de Sucesso, Stakeholders, Análise Competitiva, Timeline, Plano de Aprendizado).

### Causa Raiz: 3 Camadas de Validação com Regex/Keywords Desalinhados

O sistema tem **4 caminhos de validação** que usam regex/keywords diferentes e desalinhados com a forma como PRDs reais são escritos:

| Caminho | Arquivo | Peso | Problema |
|---------|---------|------|----------|
| 1. Estrutura | `gates/estrutura.ts` | 30% | Regex `#{1,2}` não aceita `###`, não aceita variações como "USUÁRIOS/PERSONAS" |
| 2. Checklist | `gates/validator.ts` | 50% | Keywords exigem 70% match literal, sem sinônimos |
| 3. Unified | `gates/unified-validator.ts` | fallback | Regex inconsistentes com os outros validadores |
| 4. Specialist | `handlers/specialist-phase-handler.ts` | specialist flow | SECTION_CHECKS com regex próprias (já parcialmente corrigidas) |

### Cálculo do Score 67

```
score = (estrutura * 0.30) + (checklist * 0.50) + (tamanho * 0.20)
score = (70 * 0.30) + (50 * 0.50) + (100 * 0.20)
score = 21 + 25 + 20 = 66 ≈ 67
```

**Estrutura (70/100):** 3/4 seções encontradas — "USUÁRIOS/PERSONAS" falha porque regex espera singular sem barra
**Checklist (50/100):** ~2/4 itens validados — keywords literais sem sinônimos, threshold 70% muito alto
**Tamanho (100/100):** OK

---

## Correções Planejadas

### Sprint 1: `estrutura.ts` — Regex Expandidas (peso 30%)

**Mudanças:**
- `#{1,2}` → `#{1,3}` para aceitar `###` headers
- Adição de `\\d*\\.?\\s*` para aceitar numeração (ex: `## 1. Problema`)
- Mais sinônimos: `oportunidade`, `público`, `solução`, `north.?star`
- Pattern `usu[áa]rios` para capturar com e sem acento, singular e plural

**Impacto esperado:** Estrutura 70 → 100 (4/4 seções encontradas)

### Sprint 2: `validator.ts` — Keywords com Sinônimos (peso 50%)

**Mudanças:**
- Tabela de sinônimos para os 4 itens do checklist da fase 1
- Cada grupo precisa que pelo menos 1 sinônimo esteja presente
- Threshold reduzido de 70% → 50% no fallback genérico

**Impacto esperado:** Checklist 50 → 100 (4/4 itens validados)

### Sprint 3: `unified-validator.ts` — Consistência

**Mudanças:**
- Expandir regex em `getSectionChecks()` para ser consistente com `estrutura.ts`
- Adicionar variações com acento e sinônimos em inglês

### Sprint 4: `specialist-phase-handler.ts` — Consistência SECTION_CHECKS

**Mudanças:**
- Alinhar SECTION_CHECKS com as mesmas variações dos outros validadores
- Garantir que headers como "USUÁRIOS/PERSONAS" e "FUNCIONALIDADES/MVP" são reconhecidos

### Sprint 5: Testes de Validação

**Mudanças:**
- Criar `src/tests/prd-validation.test.ts` com PRD real do SubsTrack
- Testar os 3 validadores com headers em formatos variados

---

## Score Esperado Após Correções

```
score = (100 * 0.30) + (100 * 0.50) + (100 * 0.20)
score = 30 + 50 + 20 = 100
```

Mesmo com margem de erro, score esperado: **85-100/100** (bem acima do mínimo de 70).

---

## Verificação

1. `tsc --noEmit` — sem erros de tipo
2. `npm run build` — build OK
3. `npm test` — todos os testes passando
4. Teste manual com PRD real do SubsTrack
