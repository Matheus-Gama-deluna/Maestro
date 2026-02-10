# 📋 Controle de Mudanças — Correções Maestro MCP v6.1

> **Data**: 10/02/2026
> **Base**: Análise do documento `Resolver v3.md` + rastreio do código-fonte
> **Escopo**: 3 bugs críticos, 4 problemas moderados, 3 oportunidades

---

## Registro de Modificações

| # | Tipo | Arquivo | Status | Consequência |
|---|------|---------|--------|-------------|
| 1 | 🔴 Bug | `specialist-phase-handler.ts` | ✅ | Fix regex + normalização PRD |
| 2 | 🔴 Bug | `specialist-phase-handler.ts` | ✅ | Fix alias `prazo_mvp` |
| 3 | 🔴 Bug | `specialist-phase-handler.ts` | ✅ | Limite de retries |
| 4 | 🟡 Problema | `specialist-phase-handler.ts` | ✅ | Reduzir repetição template |
| 5 | 🟡 Problema | `GEMINI.md` + resources | 📝 | Unificar naming de tools (documentação) |
| 6 | 🟡 Problema | `specialist-phase-handler.ts` | ✅ | Instrução read_resources |
| 7 | 🟡 Problema | `specialist-phase-handler.ts` | ✅ | Leitura de arquivo híbrida |
| 8 | 🔵 Oportunidade | `gates/unified-validator.ts` | ✅ | Consolidar validação |
| 9 | 🔵 Oportunidade | `services/` | 📝 | Skills como fonte de verdade (recomendação) |
| 10 | 🔵 Oportunidade | `utils/response-formatter.ts` | ✅ | Output padronizado |

---

## Detalhes por Modificação

### #1 — Bug Crítico: Regex SECTION_CHECKS + normalizePrdContent
**Arquivo**: `src/handlers/specialist-phase-handler.ts`
- Removido prefixo `/##?\s*/` dos regex que impedia match com headings já limpos
- Adicionado prefixo opcional para numeração (`/^\d*\.?\d*\s*/`)
- Criada função `normalizePrdContent()` para normalizar `\\n` escapados de JSON

### #2 — Bug Crítico: Alias `prazo_mvp` ausente
**Arquivo**: `src/handlers/specialist-phase-handler.ts`
- Adicionados `prazo_mvp` e `prazo_mvp_desejado` como aliases do campo `timeline`

### #3 — Bug Crítico: Loop infinito de validação
**Arquivo**: `src/handlers/specialist-phase-handler.ts` + `src/types/onboarding.ts`
- Criada constante `MAX_PRD_VALIDATION_RETRIES = 3`
- Campo `validationAttempts` adicionado ao `SpecialistPhaseState`
- Após 3 tentativas, apresenta opções ao usuário: aprovar manualmente, editar, ou re-tentar

### #4 — Problema: Repetição de template
**Arquivo**: `src/handlers/specialist-phase-handler.ts`
- Fase `collecting`: injeta apenas skeleton do template
- Fase `generating`: usa `extractTemplateSkeleton()` ao invés do template completo (~80% redução)
- Template completo referenciado via URI do recurso MCP

### #5 — Problema: Naming confuso de tools
**Status**: 📝 Recomendação documentada
- Router.ts já possui mapeamento `legacyRedirects` corretamente
- GEMINI.md deve referenciar apenas 5 tools públicas: `maestro`, `executar`, `validar`, `analisar`, `contexto`
- Deprecation warnings já injetados em chamadas a tools legadas

### #6 — Problema: Resources subutilizados
**Arquivo**: `src/handlers/specialist-phase-handler.ts`
- Adicionado bloco "🔧 Recurso do Especialista" no output de geração
- Instrução explícita para usar `read_resource()` ou ler SKILL.md local

### #7 — Problema: Validação via arquivo
**Arquivo**: `src/handlers/specialist-phase-handler.ts`
- Fallback: se `entregavel` vazio, lê de `docs/01-produto/PRD.md` ou `.maestro/entregaveis/prd-draft.md`
- Elimina problemas de escape JSON em strings grandes

### #8 — Oportunidade: Consolidar validação
**Arquivo**: `src/gates/unified-validator.ts` (NOVO)
- Unifica 4 pipelines paralelos (template-validator, intelligent-validator, quality-scorer, section-checks)
- Entry point único `validateDeliverable()` com fallback automático
- Score combinado: 70% estrutura + 30% qualidade
- Reutiliza regex corrigido do Bug #1

### #9 — Oportunidade: Skills como fonte de verdade
**Status**: 📝 Recomendação
- Skills locais (`.agent/skills/`) devem ser a fonte primária
- MCP resources servem como API de consulta, não como fonte canônica
- SkillLoaderService já prioriza skills locais quando disponíveis

### #10 — Oportunidade: Output padronizado
**Arquivo**: `src/utils/response-formatter.ts`
- Instruções envolvidas por `<!-- AI_INSTRUCTIONS_START -->` e `<!-- AI_INSTRUCTIONS_END -->`
- Permite que UIs filtrem conteúdo de AI vs conteúdo visível ao usuário
