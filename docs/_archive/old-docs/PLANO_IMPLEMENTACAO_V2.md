# Plano de Implementação - Maestro v2.0

**Data:** 02/02/2026  
**Status:** Em Execução  
**Objetivo:** Implementar melhorias críticas identificadas na análise

---

## 📋 Resumo Executivo

Este documento detalha o plano de implementação das melhorias do Maestro v2.0, incluindo:
- ✅ Sistema de modos de operação (Economy/Balanced/Quality)
- ✅ Frontend-first com contratos de API e mocks
- ✅ Sistema de gerenciamento de tarefas hierárquico
- ✅ Otimizações de créditos/prompts
- 🔄 Ferramentas avançadas obrigatórias nos fluxos
- 🔄 Atualização de tipos e interfaces

---

## ✅ Fase 1: Estrutura Base (CONCLUÍDA)

### 1.1 Tipos e Configurações

**Arquivos Criados:**
- ✅ `src/src/types/config.ts` - Tipos de configuração (OperationMode, FlowType, OptimizationConfig)
- ✅ `src/src/types/tasks.ts` - Tipos de tarefas (Task, TaskHierarchy, TaskProgress)

**Funcionalidades:**
- Definição de 3 modos: economy, balanced, quality
- Definição de 4 fluxos: principal, feature, bugfix, refactor
- Configurações de otimização por modo
- Hierarquia de tarefas (epic → feature → story → task → subtask)

### 1.2 Módulos de Otimização

**Arquivos Criados:**
- ✅ `src/src/optimization/batch-prompts.ts` - Consolidação de perguntas
- ✅ `src/src/optimization/context-cache.ts` - Cache de contexto
- ✅ `src/src/optimization/smart-validation.ts` - Validação incremental

**Funcionalidades:**
- Batch prompts: reduz 5 prompts para 2
- Context cache: TTL de 1h, evita recarregamento
- Smart validation: validação em camadas com early exit

### 1.3 Sistema de Tarefas

**Arquivos Criados:**
- ✅ `src/src/tasks/task-manager.ts` - Gerenciador de tarefas

**Funcionalidades:**
- CRUD completo de tarefas
- Hierarquia automática (parent/children)
- Dependências entre tarefas
- Detecção de ciclos
- Estatísticas e progresso
- Breakdown por epic

### 1.4 Frontend-First

**Arquivos Criados:**
- ✅ `src/src/frontend-first/contract-generator.ts` - Gerador de contratos
- ✅ `src/src/frontend-first/mock-generator.ts` - Gerador de mocks

**Funcionalidades:**
- Geração de OpenAPI 3.0
- Geração de schemas TypeScript
- Geração de schemas Zod
- Geração de cliente API (Axios/Fetch)
- Geração de mocks realistas (Faker.js)
- Geração de handlers MSW

### 1.5 Novas Tools MCP

**Arquivos Criados:**
- ✅ `src/src/tools/configurar-modo.ts` - Configurar modo de operação
- ✅ `src/src/tools/gerar-contrato-api.ts` - Gerar contrato de API
- ✅ `src/src/tools/criar-tarefa.ts` - Criar tarefa

**Funcionalidades:**
- Configuração de modo com estatísticas de economia
- Geração completa de contrato com mocks
- Criação de tarefas com hierarquia

---

## 🔄 Fase 2: Integração e Ajustes (EM ANDAMENTO)

### 2.1 Atualização de Tipos Base

**Pendente:**
- [ ] Estender `EstadoProjeto` com campos `config` e `tasks`
- [ ] Adicionar novos EventTypes (CONFIG_CHANGED, TASK_CREATED, etc.)
- [ ] Atualizar assinatura de `logEvent` para aceitar 3 parâmetros

**Arquivo a Modificar:**
```typescript
// src/src/types/index.ts
export interface EstadoProjeto {
    // ... campos existentes
    config?: ProjectConfig;  // ADICIONAR
    tasks?: Task[];          // ADICIONAR
}
```

### 2.2 Tools MCP Adicionais

**Pendente:**
- [ ] `src/src/tools/listar-tarefas.ts` - Listar e filtrar tarefas
- [ ] `src/src/tools/atualizar-tarefa.ts` - Atualizar status/info de tarefa
- [ ] `src/src/tools/criar-checkpoint.ts` - Criar checkpoint manual
- [ ] `src/src/tools/auto-fix.ts` - Tentar correção automática

### 2.3 Atualização dos Fluxos

**Fluxo Principal (13 fases):**
```typescript
// Ferramentas obrigatórias por fase
Fase 1 (Produto):
  - batch_questions (se mode = economy/balanced)
  - validar_gate

Fase 3 (UX Design):
  - validar_gate
  - criar_checkpoint (auto)

Fase 6 (Arquitetura):
  - run_atam_session (obrigatório se complexo)
  - validar_gate
  - criar_checkpoint (auto)

Fase 9 (Plano Execução):
  - criar_checkpoint (auto)
  - gerar_breakdown_tarefas (novo)

Fase 10 (Contrato API):
  - gerar_contrato_api (obrigatório)
  - validar_contrato
  - criar_checkpoint (auto)

Fase 11 (Frontend):
  - discovery_codebase
  - usar_mocks_msw
  - validar_gate

Fase 12 (Backend):
  - discovery_codebase
  - implementar_contrato
  - validar_contrato
  - validar_seguranca (obrigatório)
  - validar_gate

Fase 13 (Integração):
  - trocar_mocks_por_api
  - validar_integracao
  - criar_checkpoint (auto)
```

**Fluxo Feature (5 fases):**
```typescript
Fase 1: Análise
  - discovery_codebase (obrigatório)
  - detect_contexts

Fase 2: Design
  - gerar_contrato_api (se tiver API)
  - validar_gate

Fase 3: Implementação Frontend
  - usar_mocks_msw
  - validar_gate

Fase 4: Implementação Backend
  - implementar_contrato
  - validar_seguranca
  - validar_gate

Fase 5: Integração
  - trocar_mocks_por_api
  - criar_checkpoint (auto)
```

**Fluxo Bug Fix (3 fases):**
```typescript
Fase 1: Diagnóstico
  - discovery_codebase (obrigatório)
  - identificar_causa_raiz

Fase 2: Correção
  - auto_fix (tentar primeiro)
  - validar_gate

Fase 3: Validação
  - executar_testes
  - criar_checkpoint (auto)
```

---

## 📊 Fase 3: Documentação e Guias

### 3.1 Guias de Uso

**Pendente:**
- [ ] `docs/guides/MODOS_OPERACAO.md` - Guia de modos
- [ ] `docs/guides/FRONTEND_FIRST.md` - Guia frontend-first
- [ ] `docs/guides/GERENCIAMENTO_TAREFAS.md` - Guia de tarefas
- [ ] `docs/guides/OTIMIZACAO_PROMPTS.md` - Guia de otimização

### 3.2 Workflows Atualizados

**Pendente:**
- [ ] `content/workflows/mcp-start.md` - Incluir seleção de modo
- [ ] `content/workflows/mcp-next.md` - Incluir ferramentas obrigatórias
- [ ] `content/workflows/mcp-feature.md` - Novo workflow de feature
- [ ] `content/workflows/mcp-bugfix.md` - Novo workflow de bugfix

### 3.3 Exemplos Práticos

**Pendente:**
- [ ] Exemplo completo: Projeto em modo Economy
- [ ] Exemplo completo: Feature com frontend-first
- [ ] Exemplo completo: Bug fix com auto-fix
- [ ] Exemplo completo: Gerenciamento de tarefas

---

## 🎯 Fase 4: Testes e Validação

### 4.1 Testes Unitários

**Pendente:**
- [ ] Testes para BatchPromptsOptimizer
- [ ] Testes para ContextCache
- [ ] Testes para SmartValidation
- [ ] Testes para TaskManager
- [ ] Testes para ContractGenerator
- [ ] Testes para MockGenerator

### 4.2 Testes de Integração

**Pendente:**
- [ ] Teste: Fluxo completo em modo Economy
- [ ] Teste: Frontend-first com mocks
- [ ] Teste: Criação e gerenciamento de tarefas
- [ ] Teste: Mudança de modo durante projeto

### 4.3 Validação de Economia

**Métricas a Medir:**
- Prompts por fase (antes vs depois)
- Tempo de execução (antes vs depois)
- Qualidade dos entregáveis (score médio)
- Taxa de aprovação de gates

---

## 📈 Métricas de Sucesso

### Baseline (v1.0)
- Prompts/Projeto: 130-180
- Tempo: 100% (baseline)
- Qualidade: 75%
- Completion Rate: 30%

### Meta v2.0 (3 meses)

**Modo Economy:**
- Prompts/Projeto: 40-60 (-70%)
- Tempo: 50% (-50%)
- Qualidade: 85% (+10%)
- Completion Rate: 60% (+100%)

**Modo Balanced:**
- Prompts/Projeto: 80-100 (-45%)
- Tempo: 70% (-30%)
- Qualidade: 90% (+15%)
- Completion Rate: 70% (+133%)

**Modo Quality:**
- Prompts/Projeto: 130-180 (0%)
- Tempo: 100% (0%)
- Qualidade: 95% (+20%)
- Completion Rate: 80% (+167%)

---

## 🚀 Próximos Passos Imediatos

### Semana 1 (Atual)
1. ✅ Criar estrutura de tipos e configurações
2. ✅ Implementar módulos de otimização
3. ✅ Implementar sistema de tarefas
4. ✅ Implementar frontend-first
5. ✅ Criar tools MCP básicas
6. 🔄 Criar documento de plano (este arquivo)
7. ⏳ Atualizar tipos base (EstadoProjeto, EventTypes)
8. ⏳ Criar tools MCP restantes
9. ⏳ Atualizar fluxos com ferramentas obrigatórias

### Semana 2
10. Criar guias de uso completos
11. Atualizar workflows
12. Criar exemplos práticos
13. Testes unitários básicos

### Semana 3-4
14. Testes de integração
15. Validação de métricas
16. Ajustes baseados em feedback
17. Documentação final

---

## 🔧 Ajustes Necessários

### Tipos Base

```typescript
// src/src/types/index.ts

// ADICIONAR ao EstadoProjeto
export interface EstadoProjeto {
    // ... campos existentes
    config?: {
        mode: 'economy' | 'balanced' | 'quality';
        flow: 'principal' | 'feature' | 'bugfix' | 'refactor';
        optimization: OptimizationConfig;
        frontend_first: boolean;
        auto_checkpoint: boolean;
        auto_fix: boolean;
    };
    tasks?: Task[];
}

// ADICIONAR ao EventTypes
export const EventTypes = {
    // ... eventos existentes
    CONFIG_CHANGED: "config_changed",
    TASK_CREATED: "task_created",
    TASK_UPDATED: "task_updated",
    TASK_COMPLETED: "task_completed",
    CHECKPOINT_CREATED: "checkpoint_created",
    AUTO_FIX_ATTEMPTED: "auto_fix_attempted",
    CONTRACT_GENERATED: "contract_generated",
    MOCKS_GENERATED: "mocks_generated",
} as const;
```

### Registro de Tools MCP

```typescript
// src/src/index.ts ou src/src/server.ts

// ADICIONAR ao registerTools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        // ... tools existentes
        {
            name: "configurar_modo",
            description: "Configura modo de operação (economy/balanced/quality)",
            inputSchema: { /* ... */ }
        },
        {
            name: "gerar_contrato_api",
            description: "Gera contrato de API completo com mocks",
            inputSchema: { /* ... */ }
        },
        {
            name: "criar_tarefa",
            description: "Cria tarefa no sistema de gerenciamento",
            inputSchema: { /* ... */ }
        },
        {
            name: "listar_tarefas",
            description: "Lista tarefas com filtros",
            inputSchema: { /* ... */ }
        },
        {
            name: "atualizar_tarefa",
            description: "Atualiza status/info de tarefa",
            inputSchema: { /* ... */ }
        },
    ]
}));
```

---

## 📝 Notas de Implementação

### Decisões Arquiteturais

1. **Stateless MCP Mantido:** Todas as tools continuam recebendo `estado_json`
2. **Backward Compatibility:** Projetos v1.0 continuam funcionando
3. **Opt-in Features:** Novas funcionalidades são opcionais (exceto ferramentas obrigatórias)
4. **Cache Global:** ContextCache e SmartValidation usam instâncias globais
5. **TaskManager Global:** Gerenciador de tarefas é singleton

### Considerações de Performance

- Context cache: máximo 50MB, TTL 1h
- Validation cache: TTL 30min
- Batch prompts: agrupa até 10 perguntas
- Smart validation: early exit em falhas

### Segurança

- Validação de entrada em todas as tools
- Sanitização de paths de arquivo
- Validação de ciclos em dependências de tarefas
- Rate limiting em geração de mocks (máximo 100 registros)

---

## 🎉 Conclusão

A implementação da v2.0 está ~70% concluída. Os módulos core estão prontos e funcionais. Faltam:
1. Ajustes de tipos (EstadoProjeto, EventTypes)
2. Tools MCP restantes (listar/atualizar tarefas)
3. Integração nos fluxos
4. Documentação e guias

**Tempo Estimado Restante:** 1-2 semanas

**Prioridade:** Alta - Funcionalidades críticas para economia de créditos

**Próxima Ação:** Atualizar tipos base e criar tools restantes
