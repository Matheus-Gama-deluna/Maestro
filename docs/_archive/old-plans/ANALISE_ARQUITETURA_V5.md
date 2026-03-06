# Análise de Arquivos e Processos para Refatoração v5.1
## Maestro — Sistema Completo

**Data:** 2026-02-11  
**Versão do Sistema:** v8.0 (pós-sprints anti-loop)  
**Objetivo:** Documentar arquitetura atual e identificar todos os arquivos/processos que precisam de refatoração

---

## Arquitetura Geral do Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         MCP Server (stdio.ts)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Tools      │  │  Resources   │  │        Prompts         │ │
│  │  (router.ts) │  │(shared-*-h)  │  │   (maestro-specialist) │ │
│  └──────┬───────┘  └──────────────┘  └────────────────────────┘ │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Tools Layer                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  maestro    │  │   avancar   │  │   proximo   │  │ validar │ │
│  │ (entry)     │  │(consolidada)│  │(desenvolv.) │  │ (gates) │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
└─────────┼────────────────┼────────────────┼──────────────┼──────┘
          │                │                │              │
          ▼                ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Handlers Layer                               │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐ │
│  │specialist-phase  │  │        shared-prompt-handler           │ │
│  │   -handler.ts    │  │         (prompts dinâmicos)            │ │
│  │                  │  │                                        │ │
│  │  handleCollecting│  │  buildSpecialistPhasePrompt()        │ │
│  │  handleGenerating│  │  buildSessionPrompt()                  │ │
│  │  handleValidating│  │  ANTI_INFERENCE_RULES                │ │
│  │  handleApproved  │  │  FLOW_RULES                            │ │
│  └──────────────────┘  └────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Services Layer                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │flow-engine.ts│ │ specialist   │ │ content-     │ │ skill- │ │
│  │  (state      │ │ .service.ts  │ │ resolver    │ │ loader │ │
│  │   machine)   │ │              │ │ .service.ts │ │.service│ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │ state.service│ │system-prompt │                              │
│  │   (persist)  │ │  .service.ts │                              │
│  └──────────────┘ └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Flows Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  classifier. │  │    types.ts  │  │  onboarding-orchestrator│ │
│  │     ts       │  │              │  │       (legacy)          │ │
│  │              │  │ getFase()    │  │                         │ │
│  │classificarPRD│  │ getFluxo()   │  │  criarEstadoOnboarding()│ │
│  │descreverNivel│  │ getFluxoCom  │  │                         │ │
│  │              │  │   Stitch()   │  │                         │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquivos por Categoria

### 1. Handlers (Processamento Principal)

| Arquivo | Linhas | Responsabilidade | Status Refatoração |
|---------|--------|------------------|-------------------|
| `specialist-phase-handler.ts` | 1161 | Ciclo completo do especialista (collecting→generating→validating→approved) | **MODIFICAR** Sprint 1, 2, 3, 5 |
| `shared-prompt-handler.ts` | ~450 | Construção de prompts dinâmicos para IA | **MODIFICAR** Sprint 4 |
| `shared-resource-handler.ts` | ~192 | Listagem e leitura de resources MCP | Estável |

**Processos no specialist-phase-handler.ts:**

```
Entry: handleSpecialistPhase()
    ├── handleCollecting()      [Sprint 1: modificar getRequiredFields]
    │   └── buildCollectionPrompt()
    │   └── loadCollectingContext()
    │   └── formatMissingFieldsByBlock()
    ├── handleGenerating()      [Sprint 3: instruções file-only]
    │   └── extractTemplateSkeleton()
    ├── handleValidating()      [Sprint 5: calibrar scoring]
    │   ├── calculatePrdScore()
    │   ├── calculatePrdScoreDetailed()
    │   ├── identifyPrdGaps()
    │   ├── splitPrdBySections()
    │   └── normalizePrdContent()
    └── handleApproved()        [Sprint 2: classificação automática]
        └── classificarPRD()    [Sprint 2: expandir critérios]
```

### 2. Tools (Interface MCP)

| Arquivo | Linhas | Responsabilidade | Status Refatoração |
|---------|--------|------------------|-------------------|
| `maestro-tool.ts` | ~300 | Tool principal de entrada | Estável |
| `consolidated/avancar.ts` | ~407 | Tool unificada de avanço | **MODIFICAR** Sprint 3 |
| `proximo.ts` | ~816 | Tool de avanço de fase (desenvolvimento) | **MODIFICAR** Sprint 3 |
| `validar.ts` | ~200 | Tool de validação de gates | Estável |
| `contexto.ts` | ~150 | Tool de contexto do projeto | Estável |
| `checkpoint-tool.ts` | ~180 | Tool de checkpoints | Estável |
| `analisar.ts` | ~250 | Tool de análise de código | Estável |
| `brainstorm.ts` | ~400 | Tool de brainstorm (legacy) | Deprecado |

**Processos em avancar.ts:**

```
Entry: avancar()
    ├── computeCallHash()           [Sprint 4: ajustar anti-loop]
    ├── handleClassificacao()       [Sprint 2: automática]
    ├── isInOnboarding()            [Estável]
    └── route para:
        ├── handleSpecialistPhase()  [Handler já documentado]
        ├── onboardingOrchestrator() [Legacy]
        └── proximo()               [Sprint 3: file-only]
```

### 3. Services (Lógica de Negócio)

| Arquivo | Responsabilidade | Status Refatoração |
|---------|------------------|-------------------|
| `flow-engine.ts` | State machine do fluxo do projeto | Estável |
| `specialist.service.ts` | Dados dos especialistas por fase | Estável |
| `content-resolver.service.ts` | Resolução de conteúdo de skills | Estável |
| `skill-loader.service.ts` | Carregamento de pacotes de skills | Estável |
| `state.service.ts` | Persistência de estado | Estável |
| `system-prompt.service.ts` | Construção de system prompts | **MODIFICAR** Sprint 4 |

**Novo para Sprint 2:**
- `auto-classifier.service.ts` — Orquestrador de classificação automática

### 4. Flows (Fluxos de Negócio)

| Arquivo | Responsabilidade | Status Refatoração |
|---------|------------------|-------------------|
| `classifier.ts` | Classificação de PRD | **MODIFICAR** Sprint 2 |
| `types.ts` | Definições de fases e fluxos | Estável |
| `onboarding-orchestrator.ts` | Orquestração de onboarding (legacy) | Deprecado |

**Processos em classifier.ts:**

```
classificarPRD(prd: string)
    ├── Critério 1: Entidades (substantivos capitalizados)
    ├── Critério 2: Integrações externas (regex API/webhook/etc)
    ├── Critério 3: Segurança (LGPD/GDPR/JWT/etc)
    ├── Critério 4: Escala (milhares/milhões/scale)
    ├── Critério 5: Multi-tenant/B2B
    ├── Critério 6: Cronograma (meses/semanas)
    ├── Critério 7: Regras de negócio (fluxo/workflow)
    └── Critério 8: Equipe (desenvolvedores)

[Sprint 2: Adicionar critérios 9-15]
    ├── Critério 9: Stack tecnológico (React/Node/etc)
    ├── Critério 10: Domínio de negócio (e-commerce/SaaS/etc)
    ├── Critério 11: Volume de dados (usuários/transações)
    ├── Critério 12: Complexidade de UI/UX
    └── Critério 13: Compliance específico (PCI/HIPAA)
```

### 5. Utils (Utilitários)

| Arquivo | Responsabilidade | Status Refatoração |
|---------|------------------|-------------------|
| `inferencia-contextual.ts` | Inferência de contexto a partir do PRD | **MODIFICAR** Sprint 2 |
| `response-formatter.ts` | Formatação de respostas | Estável |
| `files.ts` | Manipulação de arquivos | Estável |
| `ide-paths.ts` | Resolução de paths por IDE | Estável |
| `content-injector.ts` | Injeção de conteúdo em prompts | Estável |
| `persistence.ts` | Persistência de arquivos | Estável |

### 6. State (Gerenciamento de Estado)

| Arquivo | Responsabilidade | Status Refatoração |
|---------|------------------|-------------------|
| `storage.ts` | Serialização/desserialização de estado | Estável |
| `memory.ts` | Gerenciamento de memória/resumos | Estável |
| `context.ts` | Contexto de execução atual | Estável |

### 7. Gates (Validação)

| Arquivo | Responsabilidade | Status Refatoração |
|---------|------------------|-------------------|
| `validator.ts` | Validação de gates de fase | Estável |
| `tiers.ts` | Definição de tiers por nível | Estável |
| `estrutura.ts` | Validação estrutural de entregáveis | Estável |

### 8. Types (Definições de Tipos)

| Arquivo | Responsabilidade | Status Refatoração |
|---------|------------------|-------------------|
| `index.ts` | Tipos principais do sistema | Estável |
| `onboarding.ts` | Tipos de estado de onboarding | Estável |
| `response.ts` | Tipos de resposta MCP | Estável |
| `memory.ts` | Tipos de memória/resumos | Estável |

---

## Processos de Negócio para Refatoração

### Processo 1: Coleta de Dados (Sprint 1)

**Fluxo Atual:**
```
Usuário → 6 perguntas → Sistema mostra "71% concluído" → 
2 perguntas finais (diferencial, timeline) → Geração PRD
```

**Fluxo Desejado:**
```
Usuário → 7 perguntas (incluindo diferencial) → Geração PRD
```

**Arquivos Modificados:**
- `specialist-phase-handler.ts:getRequiredFields()` — Mover `diferencial` para bloco 2 (todos modos)
- `specialist-phase-handler.ts:handleCollecting()` — Remover lógica de progresso 71%

---

### Processo 2: Classificação Pós-PRD (Sprint 2)

**Fluxo Atual:**
```
PRD Aprovado → 6 perguntas ao usuário (integrações, segurança, volume, etc) →
Usuário responde → Sistema classifica → Fase 1
```

**Fluxo Desejado:**
```
PRD Aprovado → AutoClassifierService analisa PRD →
  ├─ Confiança >85% → Classifica automaticamente → Fase 1
  └─ Confiança <85% → Mostra sugestão → Usuário confirma → Fase 1
```

**Arquivos Novos:**
- `services/auto-classifier.service.ts` — Orquestrador principal

**Arquivos Modificados:**
- `flows/classifier.ts` — Expandir critérios (stack, domínio, volume)
- `specialist-phase-handler.ts:handleApproved()` — Integrar classificação auto
- `utils/inferencia-contextual.ts` — Inferência multi-especialista

---

### Processo 3: Entregável Via Arquivo (Sprint 3)

**Fluxo Atual:**
```
IA gera PRD → IA chama executar({acao: "avancar", entregavel: "conteúdo..."}) →
Sistema recebe JSON → Sistema salva arquivo → Valida → Avança
```

**Fluxo Desejado:**
```
IA gera PRD → IA salva em docs/01-produto/PRD.md →
IA chama executar({acao: "avancar"}) [sem entregavel] →
Sistema lê do disco → Valida → Avança
```

**Arquivos Modificados:**
- `specialist-phase-handler.ts:handleGenerating()` — Instrução file-only
- `specialist-phase-handler.ts:handleValidating()` — Remover fallback JSON
- `tools/consolidated/avancar.ts` — Ignorar entregavel, ler do disco
- `tools/proximo.ts` — File-first para todos entregáveis

---

### Processo 4: Comunicação IA-MCP (Sprint 4 — Base v6.0)

**Problema Atual:**
- IA chama `maestro({acao: "status"})` em vez de `executar({acao: "avancar"})`
- IA ignora `next_action` especificado pelo sistema
- IA passa conteúdo via JSON em vez de salvar arquivo

**Solução Proposta:**
```
┌─────────────────────────────────────────────────────────┐
│              PromptValidatorService                      │
│                                                          │
│  validateIAResponse(response, expectedSchema)            │
│    ├── Verificar se tool chamada está em allowlist      │
│    ├── Verificar se parâmetros seguem schema            │
│    ├── Verificar se resposta segue instruções          │
│    └── Retornar: { valid: boolean, errors: string[] }    │
│                                                          │
│  onValidationFailure(errors)                             │
│    ├── Retornar erro educativo para IA                  │
│    ├── Sugerir correção baseada em exemplos             │
│    └── Incrementar contador de desvios                  │
└─────────────────────────────────────────────────────────┘
```

**Arquivos Novos:**
- `services/prompt-validator.service.ts` — Validação de conformidade
- `middleware/ia-compliance.middleware.ts` — Middleware de interceptação

**Arquivos Modificados:**
- `handlers/shared-prompt-handler.ts` — Instruções mais rigorosas + exemplos
- `handlers/specialist-phase-handler.ts` — Adicionar exemplos de chamadas corretas

---

### Processo 5: Validação de PRD (Sprint 5)

**Problema Atual:**
- Score oscila para mesmo conteúdo (25→58→60)
- Checklist sempre em 20/100 mesmo com PRD completo
- Regex sensível a formatação

**Solução Proposta:**
```
calculatePrdScore(prd)
    ├── normalizarConteudo(prd)                    [NOVO: remoção de whitespace]
    ├── verificarCache(prdHash)                  [NOVO: evitar recalcular]
    ├── splitPrdBySections(prd)                 [EXISTENTE]
    ├── calcularScorePorSecao()                  [EXISTENTE]
    ├── adicionarBonusTamanho()                  [EXISTENTE]
    └── verificarBypassTamanho(>3000 chars)      [NOVO: score ≥70]
```

**Arquivos Novos:**
- `utils/prd-validation.ts` — Módulo dedicado de validação (extrair de specialist-phase)

**Arquivos Modificados:**
- `specialist-phase-handler.ts` — Usar novo módulo de validação

---

## Estrutura de Dados Afetada

### SpecialistPhaseState (Onboarding)

```typescript
// Em src/types/onboarding.ts
interface SpecialistPhaseState {
  status: 'active' | 'collecting' | 'generating' | 'validating' | 'approved';
  collectedData: Record<string, unknown>;  // Agora inclui 'diferencial' em todos modos
  collectedBlocks?: string[];             // [REMOVER — não usado com coleta unificada]
  currentBlock?: string;                    // [REMOVER — não usado]
  validationAttempts: number;
  validationScore?: number;
  prdDraft?: string;                       // [Sprint 3: deprecated, sempre ler do arquivo]
  interactionCount: number;
  skillName: string;
  completedAt?: string;
}
```

### EstadoProjeto (Principal)

```typescript
// Adições para Sprint 2 (classificação automática)
interface EstadoProjeto {
  // ... campos existentes ...
  
  // Novo: cache de classificação automática
  classificacao_cache?: {
    prdHash: string;
    nivel: NivelComplexidade;
    confianca: number;           // 0-100
    criterios: string[];
    inferidoPor: string[];       // ['produto', 'arquitetura', 'volume']
  };
}
```

---

## Dependências entre Arquivos

### Diagrama de Dependências (Sprints 1-3)

```
specialist-phase-handler.ts
    ├── imports:
    │   ├── classificarPRD() ←─────┐
    │   ├── inferirContextoBalanceado()│
    │   └── SkillLoaderService        │
    │                                 │
    ├── é chamado por:               │
    │   └── avancar.ts               │
    │         └── imports proximo.ts │
    │                                │
    └── chama:                       │
        └── classificarPRD() ────────┘
              └── classifier.ts
                    [Sprint 2: expandir critérios]

auto-classifier.service.ts (NOVO)
    ├── imports:
    │   ├── classificarPRD()
    │   ├── inferirContextoBalanceado()
    │   └── SkillLoaderService
    ├── é chamado por:
    │   └── specialist-phase-handler.ts:handleApproved()
    └── chama:
        └── múltiplos especialistas virtuais
```

---

## Resumo de Mudanças por Sprint

### Sprint 1: Coleta Unificada

| Tipo | Quantidade | Arquivos |
|------|-----------|----------|
| Modificar | 1 | `specialist-phase-handler.ts` |
| Linhas afetadas | ~20 | `getRequiredFields()` — reordenar campos |

### Sprint 2: Classificação Automática

| Tipo | Quantidade | Arquivos |
|------|-----------|----------|
| Criar | 1 | `auto-classifier.service.ts` (~300 linhas) |
| Modificar | 3 | `classifier.ts`, `specialist-phase-handler.ts`, `inferencia-contextual.ts` |
| Linhas afetadas | ~150 | Novos critérios + integração |

### Sprint 3: Entregável Via Arquivo

| Tipo | Quantidade | Arquivos |
|------|-----------|----------|
| Modificar | 3 | `specialist-phase-handler.ts`, `avancar.ts`, `proximo.ts` |
| Linhas afetadas | ~80 | Remover fallback JSON, adicionar file-first |

### Sprint 4: Comunicação IA-MCP

| Tipo | Quantidade | Arquivos |
|------|-----------|----------|
| Criar | 2 | `prompt-validator.service.ts`, `ia-compliance.middleware.ts` |
| Modificar | 1 | `shared-prompt-handler.ts` |
| Linhas afetadas | ~200 | Novo serviço + instruções rigorosas |

### Sprint 5: Calibrar Validação

| Tipo | Quantidade | Arquivos |
|------|-----------|----------|
| Criar | 1 | `prd-validation.ts` (~200 linhas) |
| Modificar | 1 | `specialist-phase-handler.ts` |
| Linhas afetadas | ~100 | Extrair lógica, adicionar cache |

---

## Estimativa de Esforço Total

| Sprint | Tempo Estimado | Risco |
|--------|---------------|-------|
| 1 — Coleta Unificada | 1h | Baixo |
| 2 — Classificação Auto | 3h | Médio |
| 3 — Entregável Arquivo | 2h | Baixo |
| 4 — Comunicação IA-MCP | 2h | Médio |
| 5 — Calibrar Validação | 2h | Baixo |
| **Testes E2E** | 2h | — |
| **TOTAL** | **~12h** | — |

---

## Notas para Desenvolvimento

### Ordem de Implementação Recomendada
1. Sprint 1 (coleta unificada) — Maior impacto na UX, menor risco
2. Sprint 3 (entregável arquivo) — Elimina bugs de escape
3. Sprint 5 (calibrar validação) — Melhora confiabilidade
4. Sprint 2 (classificação auto) — Reduz atrito pós-PRD
5. Sprint 4 (comunicação IA-MCP) — Base para v6.0

### Pontos de Atenção
- **Backward compatibility:** Manter `entregavel` como deprecated, não removido
- **Testes:** Reproduzir conversa Resolver v5.md após cada sprint
- **Cache:** Implementar cache de classificação para evitar reclassificar mesmo PRD

---

**Documento criado por:** Cascade AI  
**Baseado em:** Análise completa do código-fonte Maestro v8.0  
**Última atualização:** 2026-02-11
