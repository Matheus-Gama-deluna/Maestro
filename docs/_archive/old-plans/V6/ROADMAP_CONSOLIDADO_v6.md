# Roadmap Consolidado — Maestro MCP v6.0

> **Data:** 2026-02-08  
> **Baseado em:** Auditoria v5.1, Roadmap v5.2, EVOLUÇÃO_V6 (Parte 1, 2 e Roadmap v6)  
> **Status:** Consolidação de planos para implementação

---

## 1. Estado Atual (v5.1.0)

### Resumo da Auditoria

| Métrica | Valor |
|---------|-------|
| **Tasks planejadas** | 20 |
| **Completamente integradas** | 8/20 (40%) |
| **Parcialmente implementadas** | 7/20 |
| **Não implementadas** | 2/20 (adiadas) |
| **Arquivos criados** | 12 módulos novos |
| **Arquivos integrados** | 5/12 (42%) |
| **Módulos órfãos** | 7 |

### Problemas Críticos Identificados

1. **Módulos Órfãos (7)** — Código criado mas não integrado:
   - `shared-resource-handler.ts` — duplicação persiste
   - `skill-cache.service.ts` — cache nunca usado
   - `system-prompt.service.ts` — prompt continua estático
   - `elicitation-fallback.service.ts` — discovery sem formulários
   - `sampling-fallback.service.ts` — análise sem checklists
   - `annotations-fallback.service.ts` — sem separação IA/usuário
   - `structured-content.service.ts` — sem structured content

2. **Capability Detection** — Funciona apenas em HTTP, não em STDIO (modo principal das IDEs)

3. **ToolResult Permissivo** — `[x: string]: unknown` permanece, campos custom ignorados pelos clients

4. **Tools Não Migradas** — `status.ts`, `contexto.ts`, `salvar.ts` ainda retornam formato legado

5. **Código Morto** — `tools/index.ts` (411 linhas) ainda importado por `server.ts`

6. **Zero Testes** — Nenhum teste unitário para os 12 módulos novos

---

## 2. Plano de Transição: v5.2 (Pré-requisito para v6)

> **Duração:** ~10 dias  
> **Princípio:** "Integrar antes de inovar"

### Sprint A — Wiring (Dias 1-4)

| # | Task | Prioridade | Esforço |
|---|------|------------|---------|
| A.1 | Instalar dependências e validar build | P0 | 0.5 dia |
| A.2 | Integrar shared-resource-handler nos entry points | P0 | 1 dia |
| A.3 | Integrar skill-cache no SkillLoaderService | P1 | 0.5 dia |
| A.4 | Integrar system-prompt.service no resource system-prompt | P1 | 0.5 dia |
| A.5 | Corrigir capability detection no STDIO | P0 | 1 dia |
| A.6 | Migrar 3 tools restantes para formatResponse | P1 | 1 dia |
| A.7 | Integrar fallbacks nas tools relevantes | P2 | 1 dia |
| A.8 | Integrar structured-content nas tools de dados | P2 | 0.5 dia |

### Sprint B — Cleanup & Testes (Dias 5-7)

| # | Task | Prioridade | Esforço |
|---|------|------------|---------|
| B.1 | Limpar ToolResult type | P0 | 1 dia |
| B.2 | Remover código morto | P1 | 0.5 dia |
| B.3 | Criar testes unitários | P1 | 2 dias |
| B.4 | Validar build e runtime | P0 | 0.5 dia |

### Sprint C — Evolução (Dias 8-10)

| # | Task | Prioridade | Esforço |
|---|------|------------|---------|
| C.1 | Consolidação de tools 8→5 + executar.ts | P1 | 2-3 dias |
| C.2 | Resource Links nos retornos de tools | P2 | 1 dia |
| C.3 | OutputSchema nas tools | P2 | 1 dia |
| C.4 | Prompt handler compartilhado | P2 | 0.5 dia |

---

## 3. Visão da v6.0: Plataforma de Orquestração

### Transformação Paradigmática

```
v5.x: Toolkit Reativo
  → IA decide → chama tool → Maestro retorna texto → IA interpreta

v6.0: Agente Orquestrador Autônomo
  → Usuário fala → Maestro decide fluxo → orquestra agents → persiste estado
```

### Pilares Estratégicos

| Pilar | Descrição | Status v5.x | Alvo v6 |
|-------|-----------|-------------|---------|
| **Multi-Agent** | Squad de agentes isolados | Texto/personas | Agents reais |
| **Autonomous** | State machine codificada | Fluxo implícito | XState formal |
| **Protocol-Native** | MCP 2025-11-25 completo | 2025-03-26 | 2025-11-25 |
| **Active Persistence** | Servidor grava direto | Depende da IA | Determinístico |
| **Enterprise** | Compliance, auditoria | Básico | Full |

---

## 4. Eixos de Evolução v6 (Consolidado)

### Eixo 1 — Breaking Changes & Limpeza

| Item | Ação | Impacto |
|------|------|---------|
| Remover 37 tools legadas | `router.ts` apenas 5 tools | 🔴 Breaking |
| ToolResult strict | MCP-compliant, sem index signature | 🔴 Breaking |
| Consolidação 8→5 | `executar` unifica avancar+salvar+checkpoint | 🟡 Breaking |
| Reestruturação de diretórios | Nova estrutura limpa | 🟡 Breaking |
| Remover código morto | `tools/index.ts`, `server.ts` | 🟢 Cleanup |

**5 Tools da v6:**

| Tool | Função | Subsume |
|------|--------|---------|
| `maestro` | Entry point, detecta contexto | `status` + onboarding |
| `executar` | Ações unificadas | `avancar` + `salvar` + `checkpoint` |
| `validar` | Gates, entregáveis, compliance | (mantém) |
| `analisar` | Análise com sampling | 9 tools legadas |
| `contexto` | Knowledge base | (mantém) |

### Eixo 2 — Protocol Compliance (2025-11-25)

| Feature | Gap v5.x | Implementação v6 |
|---------|----------|------------------|
| **Tasks** | ❌ Não suportado | Async operations com polling |
| **Elicitation** | ❌ Fallback MD | Forms nativos + fallback |
| **Sampling with Tools** | ❌ Não suportado | Análise LLM dedicada |
| **Annotations** | ⚠️ Órfão | Todos os retornos |
| **structuredContent** | ⚠️ Órfão | JSON tipado + texto |
| **outputSchema** | ⚠️ Órfão | Contratos definidos |
| **resource_link** | ❌ Não suportado | Referências explícitas |
| **MCP Apps** | ❌ Não suportado | Dashboards HTML |
| **Streamable HTTP** | ⚠️ Express manual | SDK oficial |

### Eixo 3 — Arquitetura de Nova Geração

#### Multi-Agent Architecture

```
┌─────────────────────────────────────────┐
│         Agent Orchestrator              │
│  (State Machine + Event Bus)            │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    ↓          ↓          ↓
┌───────┐ ┌───────┐ ┌───────┐
│Discov.│ │ Arch. │ │CodeGen│
│ Agent │ │ Agent │ │ Agent │
└───────┘ └───────┘ └───────┘
    ↓          ↓          ↓
┌───────┐ ┌───────┐ ┌───────┐
│Brain. │ │ Test  │ │Deploy │
│ Agent │ │ Agent │ │ Agent │
└───────┘ └───────┘ └───────┘
```

**Agent Squad Previsto:**

| Agente | Responsabilidade | Tools |
|--------|-----------------|-------|
| Discovery | Coleta requisitos | maestro, validate |
| Brainstorm | Explora ideias | maestro, context |
| PRD | Gera especificação | execute, validate |
| Architecture | Define stack, ADRs | execute, analyze, context |
| Code Generator | Gera código | execute, analyze (async) |
| Security | Audita segurança | analyze (async) |
| Test | Gera/executa testes | execute, analyze |
| Deploy | Setup infra | execute (async) |
| Compliance | Valida enterprise | validate, context |

#### State Machine Formal (XState)

```typescript
const projectMachine = createMachine({
  id: 'project',
  initial: 'idle',
  states: {
    idle: { on: { START: 'onboarding' } },
    onboarding: {
      initial: 'discovery',
      states: {
        discovery: { onDone: 'brainstorm' },
        brainstorm: { onDone: 'prd', on: { SKIP: 'prd' } },
        prd: { onDone: '#phase1' },
      }
    },
    phase1: { /* arquitetura */ },
    phase2: { /* implementação */ },
    // ... fases 3-6
  }
});
```

#### Active Persistence

- **Filesystem Orchestrator** — grava diretamente no `.maestro/`
- **Checkpoint Manager** — auto-snapshot em transições
- **Event Log** — append-only audit trail
- **Rollback determinístico** — event replay

### Eixo 4 — Experiência do Desenvolvedor

| Feature | v5.x | v6.0 |
|---------|------|------|
| Onboarding | 5-10 interações | **2 interações** (smart extraction) |
| Project Templates | ❌ | **6 templates pré-configurados** |
| Zero-config | ❌ | **Projetos simples sem setup** |
| MCP Apps | ❌ | **Dashboard visual** |
| Multi-project | ❌ | **Workspace support** |

### Eixo 5 — Inteligência e Adaptação

| Capability | Implementação |
|------------|---------------|
| Client Detection v2 | 4 camadas: initialize → SDK events → env → static KB |
| Adaptive Response Builder | Respostas adaptadas por IDE automaticamente |
| Analytics/Telemetry | Opt-in, local, métricas de uso |

### Eixo 6 — Ecossistema e Distribuição

| Canal | Status |
|-------|--------|
| MCP Registry | Publicação oficial |
| Docker Image | Oficial, multi-arch |
| NPX Quick Start | `npx @maestro/mcp-server` |
| GitHub Actions | `maestro/validate-action` |

---

## 5. Roadmap de Implementação v6 (Fases)

### Fase 0: v5.2 — Stabilization (4 semanas)

**Pré-requisito obrigatório antes de iniciar v6**

- [ ] Integrar 7 módulos órfãos
- [ ] Migrar 3 tools para Structured Markdown
- [ ] Corrigir capability detection STDIO
- [ ] Limpar ToolResult
- [ ] Remover código morto
- [ ] Testes >80% coverage

### Fase A: Foundation (2 semanas)

| # | Task | Esforço |
|---|------|---------|
| A.1 | Remover `legacyTools` do router.ts | 1 dia |
| A.2 | Criar tool `executar.ts` | 2 dias |
| A.3 | `maestro` subsume `status` | 1 dia |
| A.4 | Reescrever `ToolResult` interface | 1 dia |
| A.5 | Migrar 5 tools para novo ToolResult | 3 dias |
| A.6 | Remover código morto | 1 dia |
| A.7 | Reestruturar diretórios | 1 dia |
| A.8 | Criar `MIGRATION_GUIDE_v5_to_v6.md` | 0.5 dia |

### Fase B: Protocol Compliance (2 semanas)

| # | Task | Esforço |
|---|------|---------|
| B.1 | Atualizar SDK e protocol version | 1 dia |
| B.2 | Implementar Task Manager | 3 dias |
| B.3 | Integrar Elicitation nativa | 2 dias |
| B.4 | Implementar Sampling with Tools | 2 dias |
| B.5 | Adicionar Annotations | 1 dia |
| B.6 | Migrar para Streamable HTTP | 2 dias |
| B.7 | Adicionar Icons | 0.5 dia |
| B.8 | Input validation → Tool Error | 0.5 dia |

### Fase C: Architecture (2 semanas)

| # | Task | Esforço |
|---|------|---------|
| C.1 | Implementar State Machine (XState) | 3 dias |
| C.2 | Implementar Persistência Ativa | 2 dias |
| C.3 | Client Capabilities Detection v2 | 1 dia |
| C.4 | Adaptive Response Builder | 2 dias |
| C.5 | Plugin Architecture | 2 dias |
| C.6 | Event System | 1 dia |

### Fase D: DX & Intelligence (2 semanas)

| # | Task | Esforço |
|---|------|---------|
| D.1 | Onboarding v3 (2 interações) | 3 dias |
| D.2 | Project Templates | 2 dias |
| D.3 | Zero-config | 1 dia |
| D.4 | Modo "Conversa Livre" | 2 dias |
| D.5 | MCP Apps — Dashboard | 2 dias |
| D.6 | Multi-project support | 1 dia |

### Fase E: Ecosystem (1 semana)

| # | Task | Esforço |
|---|------|---------|
| E.1 | Publicar no MCP Registry | 1 dia |
| E.2 | Docker image oficial | 0.5 dia |
| E.3 | NPX quick start | 0.5 dia |
| E.4 | Testes de conformidade MCP | 2 dias |
| E.5 | Documentação completa | 2 dias |

---

## 6. Métricas de Sucesso

### Quantitativas

| Métrica | v5.2 (baseline) | v6.0 (alvo) | Delta |
|---------|-----------------|-------------|-------|
| Tools públicas | 8 | **5** | -37% |
| Tools totais aceitas | 45 | **5** | -89% |
| Protocol version | 2025-03-26 | **2025-11-25** | +2 |
| Interações até 1º código | 5-10 | **2** | -70% |
| Cobertura de testes | ~0% | **90%+** | +90% |
| Módulos órfãos | 7 | **0** | -100% |
| Código morto | ~1500 linhas | **0** | -100% |
| Features MCP suportadas | 6/16 | **14/16** | +133% |

### Qualitativas

| Aspecto | v5.2 | v6.0 |
|---------|------|------|
| Adaptação por IDE | HTTP only | **STDIO + HTTP (4+ IDEs)** |
| Análise de código | Inline | **Sampling dedicada** |
| Discovery | Texto livre | **Elicitation nativa** |
| Persistência | Depende da IA | **Servidor grava direto** |
| Distribuição | Manual | **NPX + Registry + Docker** |
| Extensibilidade | Hardcoded | **Plugin system + Events** |
| Visualização | Texto | **MCP Apps (HTML)** |

---

## 7. Matriz de Risco e Mitigação

| # | Risco | Prob. | Impacto | Mitigação |
|---|-------|-------|---------|-----------|
| R1 | SDK não suporta Tasks em STDIO | Média | Alto | Polling manual; Tasks só via HTTP inicialmente |
| R2 | Windsurf não atualiza protocolo | Alta | Médio | **Fallbacks para todas as features** |
| R3 | Breaking changes afastam usuários | Média | Alto | Migration guide; v5.2 mantida em branch |
| R4 | State machine adiciona complexidade | Baixa | Médio | Implementação leve; XState opcional |
| R5 | MCP Apps não suportado | Alta | Baixo | Feature opt-in; funciona sem apps |
| R6 | Sampling rejeitado | Média | Médio | Fallback para checklists inline |
| R7 | Reestruturação quebra imports | Média | Alto | Commit atômico; testar imediatamente |
| R8 | Performance com 5 tools | Baixa | Médio | Profiling; cache; Tasks para ops pesadas |

---

## 8. Checklist de Validação v6.0

### Funcional
- [ ] 5 tools públicas funcionando
- [ ] Zero tools legadas aceitas
- [ ] Protocol version 2025-11-25
- [ ] Tasks funcionando para análises longas
- [ ] Elicitation form mode no discovery
- [ ] Sampling with Tools para análise
- [ ] Annotations em todos os retornos
- [ ] structuredContent em todas as tools
- [ ] outputSchema definido em todas as tools
- [ ] resource_links nos retornos
- [ ] Streamable HTTP transport funcional
- [ ] Persistência ativa (servidor grava direto)
- [ ] State machine formal para fluxos

### Qualidade
- [ ] `npm run build` sem erros nem warnings
- [ ] `npm test` 100% com cobertura ≥90%
- [ ] Zero módulos órfãos
- [ ] Zero código morto
- [ ] ToolResult strict (sem index signature)
- [ ] Testes de conformidade MCP passam

### Compatibilidade
- [ ] Funciona em Windsurf (STDIO) com fallbacks
- [ ] Funciona em Cursor (STDIO) com Elicitation
- [ ] Funciona em VS Code (STDIO) com features completas
- [ ] Funciona em Claude Code (STDIO) com fallbacks
- [ ] Funciona via Streamable HTTP

---

## 9. Decisões Consolidadas

### Arquitetura
- ✅ **State Machine:** XState para fluxos determinísticos
- ✅ **Multi-Agent:** Squad isolado com contexto próprio
- ✅ **Persistência:** Ativa (servidor grava, não depende da IA)
- ✅ **Event System:** Para extensibilidade e auditoria

### Protocolo
- ✅ **Protocol Version:** 2025-11-25
- ✅ **Transport:** Streamable HTTP (SDK oficial)
- ✅ **Features:** Tasks, Elicitation, Sampling, Annotations, MCP Apps
- ✅ **Fallbacks:** Markdown estruturado para clients sem suporte

### Interface
- ✅ **5 Tools:** maestro, executar, validar, analisar, contexto
- ✅ **Aliases:** Aceitar nomes em inglês (execute, validate, analyze, context)
- ✅ **Nomes:** Manter pt-BR como identidade
- ✅ **ToolResult:** Strict, MCP-compliant

### Qualidade
- ✅ **Testes:** 90%+ cobertura
- ✅ **Docs:** JSDoc em todos os módulos
- ✅ **Migration Guide:** v5 → v6
- ✅ **Branch v5.2:** Mantida para backward compat

---

## 10. Próximos Passos Imediatos

1. **Iniciar v5.2** — Sprint A (Wiring)
   - Instalar dependências e validar build
   - Integrar 7 módulos órfãos
   - Corrigir capability detection STDIO

2. **Após v5.2 completa:**
   - Criar branch `v6-development`
   - Iniciar Fase A (Foundation) — breaking changes

3. **Comunicação:**
   - Criar `MIGRATION_GUIDE_v5_to_v6.md`
   - Atualizar README com roadmap
   - Documentar breaking changes

---

> **Documento consolidado de:**  
> - `AUDITORIA_IMPLEMENTACAO_v5.1.md`  
> - `DIAGNOSTICO_MCP_E_PLANO_MELHORIAS.md`  
> - `ROADMAP_v5.2_EVOLUCAO.md`  
> - `EVOLUÇÃO_V6_PARTE1.MD`  
> - `EVOLUÇÃO_V6_PARTE2.MD`  
> - `EVOLUÇÃO_ROADMAP_V6.MD`
