# Roadmap de Implementação: Comunicação MCP ↔ IA

**Data:** Fevereiro 2026  
**Versão:** 1.0  
**Referência:** DIAGNOSTICO_COMUNICACAO_MCP_IA.md

---

## 1. Visão Geral

### Objetivo
Garantir que toda resposta do MCP contenha instruções que a IA consiga executar corretamente, sem ambiguidade, sem referências a tools internas, e sem delegar persistência de arquivos.

### Princípios
1. **Só tools públicas**: `maestro`, `executar`, `validar`, `analisar`, `contexto`
2. **Persistência direta**: MCP salva seus próprios arquivos via `fs`
3. **Instruções imperativas**: Tool call exata com parâmetros JSON
4. **Mínimo de passos**: Combinar fluxos quando possível
5. **Schema explícito**: IA sabe exatamente o que enviar

---

## 2. Fases de Implementação

### FASE 1: Infraestrutura (Helpers)
Criar os utilitários base que serão usados por todas as outras mudanças.

#### Task 1.1: Criar `persistence.ts` — Helper de persistência direta
- **Arquivo:** `src/utils/persistence.ts` (NOVO)
- **Função:** Salvar estado.json, resumo.json, resumo.md, entregáveis diretamente via fs
- **Usado por:** iniciar-projeto, onboarding, brainstorm, prd-writer, proximo

#### Task 1.2: Criar `next-step-formatter.ts` — Helper de próximo passo
- **Arquivo:** `src/utils/next-step-formatter.ts` (NOVO)
- **Função:** Gerar bloco "Próximo Passo" validando que tool é pública
- **Usado por:** response-formatter, todas as tools

#### Task 1.3: Atualizar `response-formatter.ts` — Validação de tool pública
- **Arquivo:** `src/utils/response-formatter.ts` (EDITAR)
- **Mudança:** Integrar next-step-formatter, validar proximo_passo.tool

### FASE 2: Core (Maestro + Setup + Schema)
Corrigir o entry point principal e o fluxo de criação de projeto.

#### Task 2.1: Refatorar `maestro-tool.ts` — handleNoProject
- **Arquivo:** `src/tools/maestro-tool.ts` (EDITAR)
- **Mudança:** Referenciar `maestro` com parâmetros explícitos ao invés de `setup_inicial`

#### Task 2.2: Refatorar `maestro-tool.ts` — Nova ação `criar_projeto`
- **Arquivo:** `src/tools/maestro-tool.ts` (EDITAR)
- **Mudança:** Combinar setup + iniciar + confirmar em um único fluxo

#### Task 2.3: Refatorar `setup-inicial.ts` — Formato de instrução
- **Arquivo:** `src/tools/setup-inicial.ts` (EDITAR)
- **Mudança:** Instruções usam tool call de `maestro` com JSON explícito

#### Task 2.4: Atualizar schema do `maestro` no `router.ts`
- **Arquivo:** `src/router.ts` (EDITAR)
- **Mudança:** Schema de `respostas` com propriedades internas + description melhorada

#### Task 2.5: Atualizar schema do `executar` no `router.ts`
- **Arquivo:** `src/router.ts` (EDITAR)
- **Mudança:** Description com exemplos de uso claros

### FASE 3: Persistência Direta (Eliminar "crie estes arquivos")
Fazer o MCP salvar seus próprios arquivos.

#### Task 3.1: Refatorar `iniciar-projeto.ts` — Persistência direta
- **Arquivo:** `src/tools/iniciar-projeto.ts` (EDITAR)
- **Mudança:** Salvar estado/resumo via fs, remover bloco "AÇÃO OBRIGATÓRIA"

#### Task 3.2: Refatorar `onboarding-orchestrator.ts` — Persistência direta
- **Arquivo:** `src/flows/onboarding-orchestrator.ts` (EDITAR)
- **Mudança:** Salvar estado via fs, remover campo `files`

#### Task 3.3: Refatorar `brainstorm.ts` — Persistência direta
- **Arquivo:** `src/tools/brainstorm.ts` (EDITAR)
- **Mudança:** Salvar estado via fs, remover campo `files`

#### Task 3.4: Refatorar `prd-writer.ts` — Persistência direta
- **Arquivo:** `src/tools/prd-writer.ts` (EDITAR)
- **Mudança:** Salvar estado e PRD via fs, remover bloco "AÇÃO OBRIGATÓRIA"

#### Task 3.5: Refatorar `proximo.ts` — Persistência direta
- **Arquivo:** `src/tools/proximo.ts` (EDITAR)
- **Mudança:** Salvar entregável/estado/resumo via fs, remover bloco "Salvar Arquivos"

### FASE 4: Next Actions (Corrigir todas as referências a tools internas)
Atualizar todos os `next_action` e `proximo_passo` para usar tools públicas.

#### Task 4.1: Refatorar `onboarding-orchestrator.ts` — next_action
- **Arquivo:** `src/flows/onboarding-orchestrator.ts` (EDITAR)
- **Mudança:** Todos os `next_action.tool` → `executar`

#### Task 4.2: Refatorar `brainstorm.ts` — next_action
- **Arquivo:** `src/tools/brainstorm.ts` (EDITAR)
- **Mudança:** Todos os `next_action.tool` → `executar`

#### Task 4.3: Refatorar `prd-writer.ts` — next_action
- **Arquivo:** `src/tools/prd-writer.ts` (EDITAR)
- **Mudança:** `next_action.tool` → `executar`

#### Task 4.4: Refatorar `avancar.ts` — proximo_passo
- **Arquivo:** `src/tools/consolidated/avancar.ts` (EDITAR)
- **Mudança:** `proximo_passo.tool` → `executar` + mapear respostas_bloco

#### Task 4.5: Refatorar `flow-engine.ts` — Transições
- **Arquivo:** `src/services/flow-engine.ts` (EDITAR)
- **Mudança:** Todas as transições → tools públicas

#### Task 4.6: Refatorar `proximo.ts` — Referências internas
- **Arquivo:** `src/tools/proximo.ts` (EDITAR)
- **Mudança:** Referências a `confirmar_classificacao`, `aprovar_gate` → formato de tool pública

#### Task 4.7: Refatorar `executar.ts` — Mapear respostas
- **Arquivo:** `src/tools/consolidated/executar.ts` (EDITAR)
- **Mudança:** Mapear `respostas` para `respostas_bloco` ao delegar para onboarding

### FASE 5: Build e Validação

#### Task 5.1: Build sem erros
#### Task 5.2: Teste manual — fluxo de criação de projeto
#### Task 5.3: Teste manual — fluxo de onboarding completo

---

## 3. Ordem de Execução

```
FASE 1 (Helpers)
  1.1 persistence.ts ──────┐
  1.2 next-step-formatter.ts ──┤
  1.3 response-formatter.ts ───┘
         │
         ▼
FASE 2 (Core)
  2.1 maestro handleNoProject ─┐
  2.2 maestro criar_projeto ───┤
  2.3 setup-inicial ───────────┤
  2.4 router schema maestro ───┤
  2.5 router schema executar ──┘
         │
         ▼
FASE 3 (Persistência)
  3.1 iniciar-projeto ─────┐
  3.2 onboarding ──────────┤
  3.3 brainstorm ──────────┤
  3.4 prd-writer ──────────┤
  3.5 proximo ─────────────┘
         │
         ▼
FASE 4 (Next Actions)
  4.1 onboarding next_action ──┐
  4.2 brainstorm next_action ──┤
  4.3 prd-writer next_action ──┤
  4.4 avancar proximo_passo ───┤
  4.5 flow-engine transições ──┤
  4.6 proximo referências ─────┤
  4.7 executar mapear ─────────┘
         │
         ▼
FASE 5 (Validação)
  5.1 Build
  5.2 Teste criação
  5.3 Teste onboarding
```

---

**Fim do Documento**
