# Controle de Implementação — Plano v3

> **Início:** 2026-02-10
> **Base:** PLANO_REFATORACAO_V3.md (7 Sprints, 10 problemas NP1-NP10)
> **Build:** ✅ `tsc --noEmit` OK | `npm run build` OK

---

## Status Geral

| Sprint | Descrição | Status | Problemas |
|--------|-----------|--------|-----------|
| 1 | Fix bug bloqueante — generating → validating | ✅ Concluída | NP7 |
| 2 | Injeção de resources desde ativação | ✅ Concluída | NP6, NP8 |
| 3 | Especialista para não-técnicos | ✅ Concluída | NP1, NP5, NP9 |
| 4 | Eliminar stall points | ✅ Concluída | NP4 |
| 5 | Fuzzy field matching | ✅ Concluída | NP2, NP3 |
| 6 | Validação estruturada do PRD | ✅ Concluída | NP10 |
| 7 | Testes E2E | 📋 Pendente | Todos |

---

## Detalhes por Sprint

### Sprint 1: Fix Bug Bloqueante (NP7) ✅
- **Arquivo:** `src/src/handlers/specialist-phase-handler.ts`
- [x] Switch `case 'generating'`: verificar `args.entregavel` → transicionar para validating
- [x] `handleCollecting`: quando campos completos + entregavel → skip para validating

### Sprint 2: Injeção Resources (NP6, NP8) ✅
- **Arquivos:** `specialist-phase-handler.ts`, `iniciar-projeto.ts`, `skill-loader.service.ts`
- [x] Novo método `loadCollectingPackage` no SkillLoaderService (esqueleto template + checklist resumido + guia skill)
- [x] Helpers: `extractTemplateSkeleton`, `extractChecklistSummary`, `extractSkillGuide`
- [x] Função `loadCollectingContext` no specialist-phase-handler
- [x] Injetar template esqueleto em `buildCollectionPrompt` e `handleCollecting`
- [x] Injetar resumo na ativação (`confirmarProjeto` em iniciar-projeto.ts)
- [x] Fallback inline (não depende de MCP Resources)

### Sprint 3: Especialista Não-Técnicos (NP1, NP5, NP9) ✅
- **Arquivos:** `specialist-phase-handler.ts`, `iniciar-projeto.ts`
- [x] Reformular `getRequiredFields` com linguagem simples + exemplos práticos
- [x] Campos com `example` e `block` para organização temática
- [x] Organizar perguntas em 3 blocos: Problema, Solução, Planejamento
- [x] Função `getFieldsByBlock` para agrupamento
- [x] Função `formatMissingFieldsByBlock` para exibição organizada
- [x] Campos extras alinhados com template PRD: `diferencial` (balanced+), `visao_produto` (quality), `personas`, `go_to_market`
- [x] Enforcement anti-criação de dados em todos os outputs de coleta
- [x] Perguntas em linguagem simples em `confirmarProjeto`

### Sprint 4: Eliminar Stall Points (NP4) ✅
- **Arquivo:** `specialist-phase-handler.ts`
- [x] Instruções `🤖 AÇÃO AUTOMÁTICA REQUERIDA` em handleGenerating, handleValidating, handleApproved
- [x] Texto imperativo: "NÃO ESPERE o usuário. Execute a tool AGORA."
- [x] Barra de progresso `📍 Onde Estamos` em todos os outputs (collecting, generating, validating, approved)
- [x] Barra mostra: ✅ Setup → � Coleta → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

### Sprint 5: Fuzzy Field Matching (NP2, NP3) ✅
- **Arquivo:** `specialist-phase-handler.ts`
- [x] Mapa `FIELD_ALIASES` com 10 campos canônicos e ~50 aliases
- [x] Função `normalizeFieldKey` com normalização + lookup de aliases
- [x] Aplicado no loop de acumulação de respostas em `handleCollecting`
- [x] Campos desconhecidos preservados com chave normalizada

### Sprint 6: Validação Estruturada (NP10) ✅
- **Arquivo:** `specialist-phase-handler.ts`
- [x] Interface `SectionCheck` e `SectionResult` para validação tipada
- [x] `SECTION_CHECKS` com 8 seções: heading regex + conteúdo mínimo + peso
- [x] Função `splitPrdBySections` para parser de seções markdown
- [x] `calculatePrdScoreDetailed` retorna score + detalhes por seção
- [x] `calculatePrdScore` wrapper retrocompatível
- [x] `identifyPrdGaps` melhorado: mostra seções ausentes, insuficientes e completas com pontuação

### Sprint 7: Testes E2E
- [ ] T1: Ativação do especialista — output contém esqueleto do template PRD
- [ ] T2: Perguntas em linguagem simples — nenhum termo técnico sem explicação
- [ ] T3: Usuário diz "crie dados para X" — IA reformula perguntas, não inventa dados
- [ ] T4: Campo "riscos_principais" enviado — mapeado para "riscos", sem pergunta duplicada
- [ ] T5: Todos campos coletados → geração — IA gera PRD automaticamente sem stall
- [ ] T6: PRD enviado com status=generating — transição para validating, score calculado
- [ ] T7: PRD com score >= 70 — aprovado automaticamente, avança fase
- [ ] T8: PRD com score < 70 — gaps mostrados com seções específicas
- [ ] T9: Fluxo completo setup → aprovação — completa em <= 5 interações
- [ ] T10: Backward compatibility — projetos com discoveryBlocks funcionam
- **Status:** 📋 Pendente

---

## Arquivos Modificados

| Arquivo | Sprints |
|---------|---------|
| `src/src/handlers/specialist-phase-handler.ts` | 1, 2, 3, 4, 5, 6 |
| `src/src/tools/iniciar-projeto.ts` | 2, 3 |
| `src/src/services/skill-loader.service.ts` | 2 |

---

**Última atualização:** 2026-02-10
**Build:** ✅ tsc --noEmit OK | npm run build OK
