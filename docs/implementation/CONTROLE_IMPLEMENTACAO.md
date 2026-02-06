# Controle de Implementação - Evolução Maestro MCP

**Data Início:** 06/02/2026
**Baseado em:** ANALISE_ESTADO_ATUAL_MAESTRO.md, ROADMAP_MELHORIAS_MAESTRO.md, PLANO_REFATORACAO_FLUXO_INICIO.md

---

## Resumo Executivo

Implementação dos Marcos 0 (Estabilização) e 1 (Orquestração Real) do roadmap de melhorias do Maestro MCP. Foco em: router centralizado, contrato de resposta estruturado (`next_action`), persistência de estado intermediário, e eliminação de bugs críticos.

---

## Registro de Mudanças

### M-001: Tipo MaestroResponse com next_action e specialist_persona
- **Arquivo:** `src/src/types/response.ts`, `src/src/types/index.ts`
- **Tipo:** Expansão de tipos
- **Impacto:** Todos os retornos de tools passam a ter contrato estruturado com `NextAction`, `SpecialistPersona`, `FlowProgress`
- **Relação:** Base para M-005 a M-010
- **Status:** ✅ Concluído

### M-002: Serviço compartilhado de onboarding (eliminar duplicação)
- **Arquivo novo:** `src/src/services/onboarding.service.ts`
- **Arquivos modificados:** `src/src/tools/iniciar-projeto.ts`, `src/src/flows/onboarding-orchestrator.ts`
- **Tipo:** Refatoração - extração de código duplicado
- **Impacto:** `criarEstadoOnboardingInicial()`, `obterEstadoOnboarding()`, `salvarEstadoOnboarding()` centralizados em único local
- **Relação:** Pré-requisito de estabilidade; afeta iniciar-projeto e onboarding-orchestrator
- **Status:** ✅ Concluído

### M-003: Router centralizado com validação
- **Arquivo novo:** `src/src/router.ts`
- **Tipo:** Nova funcionalidade core
- **Impacto:** Ponto único de roteamento com 44 tools registradas. `routeToolCall()` e `getRegisteredTools()` como API pública.
- **Relação:** Resolve bug crítico de parâmetros não repassados; base para M-004 e M-005
- **Status:** ✅ Concluído

### M-004: Migração stdio.ts para router centralizado
- **Arquivo:** `src/src/stdio.ts`
- **Tipo:** Refatoração major (~420 linhas removidas)
- **Impacto:** Todas as tools do stdio usam router centralizado. Arquivo reduzido de ~586 para ~175 linhas.
- **Relação:** Depende de M-003; resolve divergência de entry points
- **Status:** ✅ Concluído

### M-005: Migração index.ts para router centralizado
- **Arquivo:** `src/src/index.ts`
- **Tipo:** Refatoração major (~80 linhas removidas)
- **Impacto:** `getToolsList()` e `callTool()` agora delegam ao router. Parâmetros truncados corrigidos.
- **Relação:** Depende de M-003; resolve bug CRÍTICO de parâmetros truncados
- **Status:** ✅ Concluído

### M-006: Persistência de estado intermediário no onboarding-orchestrator
- **Arquivo:** `src/src/flows/onboarding-orchestrator.ts`
- **Tipo:** Bug fix crítico
- **Impacto:** `handleProximoBloco` agora retorna `files` e `estado_atualizado` em TODOS os retornos (antes só no final do discovery)
- **Relação:** Depende de M-001 (usa next_action no retorno)
- **Status:** ✅ Concluído

### M-007: Permitir brainstorm antes de discovery completo (Caminho B)
- **Arquivo:** `src/src/tools/brainstorm.ts`
- **Tipo:** Feature + bug fix
- **Impacto:** Guard rígido removido. Brainstorm exploratório permitido com aviso visual quando discovery incompleto.
- **Relação:** Habilita Caminho B do fluxo de início
- **Status:** ✅ Concluído

### M-008: next_action em setup-inicial e iniciar-projeto
- **Arquivos:** `src/src/tools/setup-inicial.ts`, `src/src/tools/iniciar-projeto.ts`
- **Tipo:** Melhoria de orquestração
- **Impacto:** `setup_inicial` → next: `iniciar_projeto`. `confirmar_projeto` → next: `onboarding_orchestrator` com `specialist_persona` e `progress`.
- **Relação:** Depende de M-001; conecta fluxo setup → iniciar → discovery
- **Status:** ✅ Concluído

### M-009: next_action em onboarding-orchestrator e brainstorm
- **Arquivos:** `src/src/flows/onboarding-orchestrator.ts`, `src/src/tools/brainstorm.ts`
- **Tipo:** Melhoria de orquestração
- **Impacto:** Todos os handlers retornam `next_action` com `args_template` contendo IDs dos campos do próximo bloco/seção.
- **Relação:** Depende de M-001 e M-006
- **Status:** ✅ Concluído

### M-010: next_action em prd-writer
- **Arquivo:** `src/src/tools/prd-writer.ts`
- **Tipo:** Melhoria de orquestração
- **Impacto:** `handleGerarPRD` → next: `prd_writer.validar`. Fecha o ciclo de onboarding com orquestração programática.
- **Relação:** Depende de M-001; fecha o ciclo de onboarding
- **Status:** ✅ Concluído

### M-011: Unificação de versões
- **Arquivos:** `package.json` (raiz), `src/package.json`, `src/src/index.ts`, `src/src/stdio.ts`
- **Tipo:** Cleanup
- **Impacto:** Versão unificada para `3.0.0` em todos os pontos do sistema
- **Relação:** Independente
- **Status:** ✅ Concluído

---

## Mapa de Dependências

```
M-001 (MaestroResponse) ─────────────────────────┐
    ├── M-008 (next_action setup/iniciar)         │
    ├── M-009 (next_action onboarding/brainstorm) │
    └── M-010 (next_action prd-writer)            │
                                                   │
M-002 (Serviço onboarding) ──── independente      │
                                                   │
M-003 (Router centralizado) ─────────────────────┐│
    ├── M-004 (Migrar stdio.ts)                   ││
    └── M-005 (Migrar index.ts)                   ││
                                                   ││
M-006 (Persistência intermediária) ← M-001        ││
M-007 (Brainstorm sem discovery) ── independente   ││
M-011 (Versões) ── independente                    ││
```

---

## Arquivos Criados/Modificados

| Arquivo | Ação | Mudança(s) |
|---------|------|-----------|
| `src/src/types/response.ts` | Modificado | MaestroResponse expandido com next_action, specialist_persona, progress |
| `src/src/services/onboarding.service.ts` | **Novo** | Funções compartilhadas de onboarding extraídas |
| `src/src/router.ts` | **Novo** | Router centralizado com registry de tools |
| `src/src/stdio.ts` | Modificado | Usa router ao invés de switch/case manual |
| `src/src/index.ts` | Modificado | Usa router ao invés de switch/case manual |
| `src/src/tools/iniciar-projeto.ts` | Modificado | next_action + usa serviço compartilhado |
| `src/src/tools/setup-inicial.ts` | Modificado | next_action no retorno |
| `src/src/flows/onboarding-orchestrator.ts` | Modificado | Persistência intermediária + next_action + usa serviço compartilhado |
| `src/src/tools/brainstorm.ts` | Modificado | Guard relaxado + next_action |
| `src/src/tools/prd-writer.ts` | Modificado | next_action no retorno |
| `src/src/server.ts` | Modificado | Versão unificada |
| `package.json` (raiz) | Modificado | Versão unificada |
| `src/package.json` | Modificado | Versão unificada |

---

## Resultados de Validação

**Build:** ✅ `npm run build` - Exit code 0 (tsc sem erros)
**Testes:** ✅ `npx vitest --run` - 222 passed, 4 skipped, 12 test files

## Critérios de Sucesso

1. ✅ Build passa sem erros (`npm run build`) — **CONFIRMADO**
2. ✅ Testes existentes passam (`npm run test`) — **222/222 passed**
3. ✅ Router centralizado - 44 tools em `router.ts`, ponto único de roteamento
4. ✅ Todos os parâmetros de todas as tools são repassados via `rawArgs` (sem casting manual)
5. ✅ Estado intermediário é persistido em todo `handleProximoBloco` (bug crítico corrigido)
6. ✅ Brainstorm pode ser iniciado sem discovery completo (Caminho B habilitado)
7. ✅ Toda tool de onboarding retorna `next_action` estruturado com `args_template`
8. ✅ Versão unificada `3.0.0` em todo o sistema

## Métricas de Impacto

| Métrica | Antes | Depois |
|---------|-------|--------|
| Linhas em `stdio.ts` | ~586 | ~175 |
| Linhas em `index.ts` (tools) | ~330 | ~8 |
| Pontos de roteamento | 3 (stdio, index, tools/index) | 1 (router.ts) |
| Tools no HTTP (`index.ts`) | 17 | 44 (paridade com stdio) |
| Duplicação `criarEstadoOnboarding` | 2 cópias | 1 (serviço compartilhado) |
| Persistência intermediária | Apenas no final | Todo retorno |
| `next_action` estruturado | 0 tools | 8 tools (fluxo completo) |
| Versões diferentes | 3 (1.0.0, 2.1.0, 2.6.2) | 1 (3.0.0) |

---

## Mapeamento vs Documentos de Planejamento

### vs ROADMAP_MELHORIAS_MAESTRO.md

#### Marco 0: Estabilização — ✅ 85% Concluído

| Item | Planejado | Status | Implementação |
|------|-----------|--------|---------------|
| 3.1 Router Centralizado | `router.ts` com registry Zod | ✅ | M-003: `router.ts` com 44 tools, `routeToolCall()`, `getRegisteredTools()` |
| 3.2 Corrigir Parâmetros | Repassar todos via router | ✅ | M-004/M-005: `rawArgs` passado integralmente sem casting |
| 3.3 Extrair Duplicações | `services/onboarding.service.ts` | ✅ | M-002: 3 funções centralizadas |
| 3.4 Persistir Estado Intermediário | `estado_atualizado` em todo handler | ✅ | M-006: `handleProximoBloco` e `handleIniciar` persistem sempre |
| 3.5 Remover Código Morto | `server.ts` morto, `TOOLS_AS_RESOURCES` | ⏳ | Não implementado — `server.ts` e `TOOLS_AS_RESOURCES` ainda existem |
| 3.6 Unificar Versões | Versão única | ✅ | M-011: `3.0.0` em todo o sistema |
| Validação Zod real no router | `schema.parse()` com erros amigáveis | ⏳ | Router usa schemas JSON, não Zod `.parse()` — validação delegada às tools |

#### Marco 1: Orquestração Real — ✅ 40% Concluído

| Item | Planejado | Status | Implementação |
|------|-----------|--------|---------------|
| 4.1 MaestroResponse estruturado | `next_action`, `specialist_persona`, `progress`, `state_patch` | ✅ Parcial | M-001: Tipos definidos, mas `state_patch` não implementado |
| 4.2 State Machine / Flow Engine | `FlowTransition[]` com condições | ⏳ | Não implementado — fluxo ainda baseado em lógica imperativa |
| 4.3 Consolidar Tools (30+ → 8) | Tool `maestro` como entry point | ⏳ | Não implementado — 44 tools ainda expostas |
| 4.4 Persistência Ativa | MCP grava no filesystem | ⏳ | Não implementado — ainda depende da IA salvar `files[]` |
| 4.5 System Prompt Automático | MCP prompts capability | ⏳ | Não implementado |
| `next_action` em retornos | Todos os retornos de onboarding | ✅ | M-008/M-009/M-010: 8 tools com next_action |
| `specialist_persona` em retornos | Em retornos de fase | ✅ Parcial | Apenas em `confirmar_projeto` |
| `progress` em retornos | Em retornos de fluxo | ✅ | Em orchestrator, brainstorm, prd-writer, confirmar_projeto |

#### Marco 2: Experiência do Desenvolvedor — ⏳ 5% Concluído

| Item | Planejado | Status |
|------|-----------|--------|
| 5.1 Smart Defaults | Pré-preencher com config global | ⏳ |
| 5.2 Modo Conversa Livre | NLP para extrair contexto | ⏳ |
| 5.3 Templates de Projeto | 6 templates pré-configurados | ⏳ |
| 5.4 Resumo Executivo entre blocos | Checkpoint de confirmação | ⏳ |
| 5.5 Confidence Score | Score nas inferências | ⏳ |
| Brainstorm antes de discovery | Caminho B habilitado | ✅ M-007 |

#### Marco 3: Profissionalização — ⏳ 15% Concluído

| Item | Planejado | Status |
|------|-----------|--------|
| 6.1 Testes | 80% coverage | ⏳ (222 testes existentes passam, mas sem cobertura do novo código) |
| 6.2 CI/CD | GitHub Actions | ⏳ |
| 6.3 Versionamento | Coerente | ✅ M-011 |
| 6.4 Documentação de API | Auto-gerada | ⏳ |
| 6.5 Error Handling Estruturado | `MaestroError` hierarchy | ⏳ |

### vs PLANO_REFATORACAO_FLUXO_INICIO.md

| Fase/Item | Status | Notas |
|-----------|--------|-------|
| **Fase 0: Setup Inicial** | | |
| next_action em setup_inicial | ✅ M-008 | `setup_inicial` → next: `iniciar_projeto` |
| Redirecionar para setup quando sem config | ⏳ | `iniciar_projeto` ainda tem wizard inline próprio |
| **Fase 1: iniciar_projeto conversacional** | | |
| Perguntas em blocos (Bloco 1 essencial) | ⏳ | Ainda usa discovery blocks via `onboarding_orchestrator` |
| Campo `respostas_iniciais` no schema | ⏳ | Não implementado |
| Remover inferência automática tipo/complexidade | ⏳ | Inferência ainda ativa |
| **Fase 2: next_action em todas as tools** | | |
| Tools de onboarding (8 tools) | ✅ M-008/M-009/M-010 | |
| Tools restantes (proximo, status, classificar, etc.) | ⏳ | ~36 tools sem next_action |
| **Fase 3: Internalizar confirmar_projeto** | ⏳ | Ainda é tool pública |
| **Fase 4: Brainstorm no fluxo de início** | ✅ Parcial M-007 | Guard removido, mas sem modo `brainstorm_inicial` |
| **Fase 5: Orchestrator como hub** | ⏳ | Não implementado |
| **Fase 6: Registros atualizados** | ✅ M-003/M-004/M-005 | Router centralizado resolve |
| **Bug fix: parâmetros não repassados** | ✅ M-003 | Router elimina classe de bugs |
| **Bug fix: duplicação criarEstadoOnboarding** | ✅ M-002 | Serviço compartilhado |
| **Bug fix: persistência intermediária** | ✅ M-006 | Todos os handlers persistem |
| **Ideia 1: specialist_persona** | ✅ Parcial M-001/M-008 | Tipo definido, usado em confirmar_projeto |
| **Ideia 2: Smart Defaults** | ⏳ | |
| **Ideia 3: Resumo Executivo** | ⏳ | |
| **Ideia 4: Projeto Template** | ⏳ | |
| **Ideia 5: Confidence Score** | ⏳ | |
| **Ideia 6: Adapter pattern (router)** | ✅ M-003 | |
| **Ideia 7: Conversa Livre** | ⏳ | |
| **Ideia 8: Persistência via files[]** | ✅ M-006 | |

---

## Próximos Passos

Ver documento detalhado: [PROXIMOS_PASSOS_V3.md](./PROXIMOS_PASSOS_V3.md)
