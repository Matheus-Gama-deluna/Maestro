# Próximos Passos — Maestro v3.0.0 → v4.0.0

**Data:** 06/02/2026  
**Base:** CONTROLE_IMPLEMENTACAO.md, ROADMAP_MELHORIAS_MAESTRO.md, PLANO_REFATORACAO_FLUXO_INICIO.md, ANALISE_ESTADO_ATUAL_MAESTRO.md  
**Score Atual:** 5.9/10 | **Meta:** 8.0/10

---

## Resumo do Estado Atual (v3.0.0)

### O que foi conquistado
- **Router centralizado** com 44 tools — elimina bugs de parâmetros e divergência de entry points
- **Contrato MaestroResponse** — tipos `NextAction`, `SpecialistPersona`, `FlowProgress` definidos
- **next_action em 8 tools de onboarding** — fluxo programático setup→discovery→brainstorm→PRD
- **Persistência intermediária** — todo handler retorna `estado_atualizado` e `files[]`
- **Serviço compartilhado** — `onboarding.service.ts` elimina duplicação
- **Caminho B habilitado** — brainstorm sem discovery completo
- **Versão unificada** — `3.0.0` em todo o sistema

### Lacunas remanescentes (ordenadas por impacto)
1. **Flow Engine** — fluxo ainda é lógica imperativa, não state machine
2. **44 tools expostas** — superfície cognitiva grande demais para a IA
3. **Persistência passiva** — MCP depende da IA salvar arquivos
4. **`iniciar_projeto` não é conversacional** — ainda infere tipo/complexidade automaticamente
5. **36 tools sem next_action** — fluxo pós-PRD sem orquestração
6. **Código morto** — `server.ts`, `TOOLS_AS_RESOURCES` 
7. **Sem validação Zod real** no router
8. **Testes insuficientes** para novo código

---

## Organização em Sprints

### Sprint 1: Completar Marco 0 + Início Marco 1 (Estimativa: 1 dia)
**Tema:** Fechar fundação e iniciar orquestração real

#### S1.1 — Remover código morto
- **Arquivo:** `src/src/server.ts`
- **Ação:** Remover `createMcpServer()` e todo o arquivo se não for usado
- **Arquivo:** `src/src/index.ts`
- **Ação:** Remover `TOOLS_AS_RESOURCES` array e `getToolDocumentation()` — funcionalidade já coberta pelo router
- **Impacto:** Menos confusão, menos manutenção
- **Risco:** Baixo — verificar se `server.ts` é importado em algum lugar

#### S1.2 — Validação Zod real no router
- **Arquivo:** `src/src/router.ts`
- **Ação:** Migrar schemas JSON para Zod schemas. Usar `schema.safeParse()` ao invés de repassar args crus
- **Benefício:** Erros amigáveis na validação de inputs, segurança de tipos real
- **Dependência:** Instalar `zod-to-json-schema` para converter Zod → JSON Schema no `getRegisteredTools()`
- **Estimativa:** 2-3h (migrar schemas progressivamente, começando pelas tools de onboarding)

```typescript
// Antes (atual):
handler: (args) => iniciarProjeto(args as any)

// Depois:
schema: z.object({
  nome: z.string(),
  diretorio: z.string(),
  // ...
}),
handler: (args) => iniciarProjeto(args)  // args já tipado pelo Zod
```

#### S1.3 — next_action em tools pós-PRD
- **Arquivos:** `proximo.ts`, `status.ts`, `classificar.ts`, `contexto.ts`, `salvar.ts`, `validar-gate.ts`, `aprovar-gate.ts`
- **Ação:** Adicionar `next_action` estruturado em cada retorno
- **Padrão:** Cada tool analisa o estado e retorna a próxima ação lógica
- **Exemplo para `proximo`:**

```typescript
// Após salvar entregável e avançar fase:
return {
  content: [...],
  estado_atualizado: ...,
  next_action: {
    tool: "validar_gate",
    description: "Validar checklist de saída da fase",
    args_template: { estado_json: "{{estado_json}}", diretorio },
    requires_user_input: false,
    auto_execute: true,
  },
  specialist_persona: getSpecialistForPhase(proximaFase),
  progress: {
    current_phase: proximaFase.nome,
    total_phases: totalFases,
    completed_phases: faseAtual,
    percentage: Math.round((faseAtual / totalFases) * 100),
  },
};
```

#### S1.4 — specialist_persona em todas as transições de fase
- **Arquivo:** Criar `src/src/services/specialist.service.ts`
- **Ação:** Função `getSpecialistPersona(faseName)` que retorna a persona correta
- **Fonte de dados:** `content/skills/` já tem 62 especialistas — mapear fase → especialista
- **Uso:** Todo retorno que troca de fase inclui `specialist_persona`

---

### Sprint 2: Persistência Ativa + iniciar_projeto Conversacional (Estimativa: 2 dias)
**Tema:** Remover dependência da IA para salvar estado e melhorar onboarding

#### S2.1 — Persistência Ativa (MCP grava no filesystem)
- **Arquivo novo:** `src/src/services/state.service.ts`
- **Ação:** Criar `StateService` com `load()`, `save()`, `patch()`
- **Mudança:** Todo handler que modifica estado chama `StateService.save()` diretamente
- **Fallback:** Continua retornando `files[]` e `estado_atualizado` para IDEs que preferem controlar
- **Benefício:** Estado nunca se perde, mesmo que a IA não salve os arquivos

```typescript
export class StateService {
  constructor(private diretorio: string) {}

  async load(): Promise<EstadoProjeto | null> {
    try {
      const raw = await readFile(join(this.diretorio, '.maestro/estado.json'), 'utf-8');
      return JSON.parse(raw);
    } catch { return null; }
  }

  async save(estado: EstadoProjeto): Promise<void> {
    await mkdir(join(this.diretorio, '.maestro'), { recursive: true });
    estado.atualizado_em = new Date().toISOString();
    await writeFile(
      join(this.diretorio, '.maestro/estado.json'),
      JSON.stringify(estado, null, 2)
    );
  }
}
```

- **Integração:** Modificar `onboarding-orchestrator`, `brainstorm`, `prd-writer`, `proximo` para usar `StateService`
- **Risco:** MCP pode não ter permissão de escrita em todos os diretórios. Tratar graciosamente com fallback para `files[]`

#### S2.2 — Refatorar iniciar_projeto para ser conversacional
- **Arquivo:** `src/src/tools/iniciar-projeto.ts`
- **Mudanças detalhadas:**

**Passo 1: Quando chamado sem respostas (só nome + diretório)**
```
Comportamento atual: Infere tipo/complexidade automaticamente → confirma → cria arquivos
Comportamento novo: Retorna Bloco 1 de perguntas agrupadas + oferta de brainstorm
  → NÃO cria arquivos
  → NÃO infere tipo/complexidade
  → Retorna next_action apontando para si mesmo com respostas_iniciais
```

**Passo 2: Adicionar campo `respostas_iniciais` ao schema**
```typescript
respostas_iniciais?: {
  problema?: string;
  publico_alvo?: string;
  funcionalidades_principais?: string[];
  plataformas?: string[];
  cronograma?: string;
  usar_brainstorm?: boolean;
}
```

**Passo 3: Quando chamado com respostas**
- Se bloco 1 respondido → verificar modo, retornar bloco 2 (técnico) se balanced/quality
- Se bloco 2 respondido (ou economy) → inferir tipo/complexidade BASEADO nas respostas reais → criar arquivos
- Se `usar_brainstorm=true` → retornar `next_action` para brainstorm exploratório

**Passo 4: Remover inferência automática no primeiro passo**
- `inferirTipoArtefato()` e `inferirComplexidade()` só rodam APÓS respostas coletadas
- Tipo/complexidade baseados em dados reais, não no nome do projeto

#### S2.3 — Modo brainstorm_inicial integrado
- **Arquivo:** `src/src/tools/brainstorm.ts`
- **Ação:** Adicionar ação `iniciar_exploratorio` que funciona sem discovery
- **Diferença do brainstorm normal:** Perguntas focadas em ajudar a PENSAR, não preencher formulário
- **Resultados alimentam discovery automaticamente** via `salvarEstadoOnboarding()`

---

### Sprint 3: Flow Engine + Consolidação de Tools (Estimativa: 3-5 dias)
**Tema:** O Maestro assume controle total do fluxo — a IA apenas executa

#### S3.1 — Flow Engine básico
- **Arquivo novo:** `src/src/services/flow-engine.ts`
- **Conceito:** State machine que codifica transições de fase

```typescript
interface FlowTransition {
  from: string;
  to: string;
  condition?: (state: FlowState) => boolean;
  action?: string;  // nome da tool/handler
}

const ONBOARDING_FLOW: FlowTransition[] = [
  { from: 'init', to: 'setup', condition: s => !hasGlobalConfig() },
  { from: 'init', to: 'discovery_block_1', condition: s => hasGlobalConfig() },
  { from: 'setup', to: 'discovery_block_1' },
  { from: 'discovery_block_1', to: 'discovery_block_2' },
  // ... blocos intermediários baseados no modo ...
  { from: 'discovery_complete', to: 'brainstorm_offer', condition: s => s.mode !== 'economy' },
  { from: 'discovery_complete', to: 'prd_generation', condition: s => s.mode === 'economy' },
  { from: 'brainstorm_offer', to: 'brainstorm_s1', condition: s => s.wants_brainstorm },
  { from: 'brainstorm_offer', to: 'prd_generation' },
  { from: 'brainstorm_complete', to: 'prd_generation' },
  { from: 'prd_generation', to: 'prd_validation' },
  { from: 'prd_validation', to: 'phase_1', condition: s => s.prd_score >= 70 },
  { from: 'prd_validation', to: 'prd_refinement' },
  // ... fases de desenvolvimento ...
];

export function getNextStep(state: FlowState): FlowStep {
  const current = state.currentPhase;
  const transition = ONBOARDING_FLOW.find(
    t => t.from === current && (!t.condition || t.condition(state))
  );
  if (!transition) return { phase: current, action: 'complete' };
  return { phase: transition.to, action: transition.action };
}
```

- **Integração:** `next_action` é gerado automaticamente pelo flow engine
- **Benefício:** Qualquer tool pode perguntar "qual o próximo passo?" ao flow engine

#### S3.2 — Tool `maestro` como entry point inteligente
- **Arquivo novo:** `src/src/tools/maestro.ts`
- **Conceito:** Uma única tool que detecta contexto e retorna o próximo passo

```typescript
async function maestro(args: {
  diretorio: string;
  input?: string;           // Texto livre do usuário
  respostas?: Record<string, any>;  // Respostas de formulário
}): Promise<MaestroResponse> {
  const state = await StateService.load(args.diretorio);
  
  if (!state) return startNewProject(args);
  
  const flowState = getFlowState(state);
  
  if (args.respostas) {
    return processResponses(flowState, args.respostas);
  }
  
  if (args.input) {
    return processNaturalInput(flowState, args.input);
  }
  
  return getNextStep(flowState);
}
```

- **Surface area:** A IA só precisa conhecer `maestro`, `avancar`, `status`, `validar`, `contexto`, `salvar`, `checkpoint`, `analisar` (8 tools)
- **Aliases:** Tools antigas continuam funcionando via router, mapeadas para as novas

#### S3.3 — Consolidação gradual
- **Estratégia:** Strangler Fig Pattern
  1. Criar tool `maestro` que internamente chama tools existentes
  2. Marcar tools antigas como deprecated no description
  3. Em versão futura, remover tools antigas e manter apenas aliases

---

### Sprint 4: UX e Smart Defaults (Estimativa: 2 dias)
**Tema:** Reduzir fricção do onboarding para máximo 3 interações

#### S4.1 — Smart Defaults baseados no config global
- **Arquivo:** `src/src/utils/smart-defaults.ts`
- **Ação:** Pré-preencher campos do discovery com dados do `~/.maestro/config.json`
- **Exemplo:** Se `team_size: "solo"` e `preferencias_stack.frontend: "react"`, campos técnicos vêm preenchidos

#### S4.2 — Resumo Executivo entre blocos
- **Mudança em:** `onboarding-orchestrator.ts`
- **Após cada bloco respondido:** Retornar resumo compacto para confirmação antes de avançar
```
✅ Entendi:
- Problema: [resumo em 1 linha]
- Público: [resumo em 1 linha]
- MVP: [lista de features]

Está correto? Se sim, vamos para detalhes técnicos.
```

#### S4.3 — Templates de Projeto
- **Arquivo novo:** `src/src/data/project-templates.ts`
- **6 templates:** SaaS B2B, E-commerce, API/Microserviços, App Mobile, Landing Page, Dashboard
- **Cada template:** discovery pré-preenchido, tipo/complexidade inferidos, stack sugerida
- **Uso:** `iniciar_projeto(template: "saas-b2b")` → projeto criado com 1 interação

#### S4.4 — Confidence Score nas inferências
- **Mudança em:** `iniciar-projeto.ts`
- **Quando inferir tipo/complexidade:** Incluir score de confiança e dados usados
- **Se confiança < 70%:** Perguntar ao usuário
- **Se >= 70%:** Sugerir mas permitir override

---

### Sprint 5: Profissionalização (Estimativa: 2-3 dias)
**Tema:** Qualidade profissional e sustentabilidade

#### S5.1 — Testes para novo código
- **Router:** 100% coverage — testar roteamento de todas as 44 tools
- **Flow Engine:** 100% coverage — testar todas as transições
- **Services:** 80% coverage — `onboarding.service`, `state.service`, `specialist.service`
- **next_action:** Testar que todas as 44 tools retornam next_action válido

#### S5.2 — Error Handling Estruturado
```typescript
class MaestroError extends Error {
  constructor(
    message: string,
    public code: string,
    public recovery?: NextAction  // Ação de recuperação
  ) { super(message); }
}
```

#### S5.3 — CI/CD
- `test.yml` — Roda testes em cada PR
- `typecheck.yml` — Verifica tipos TypeScript
- `lint.yml` — ESLint

#### S5.4 — System Prompt via MCP Prompts
- Usar capability `prompts` do MCP para injetar especialista + template + contexto automaticamente

---

## Mapa de Dependências entre Sprints

```
Sprint 1 (Completar fundação)
  ├── S1.1 Código morto ──── independente
  ├── S1.2 Validação Zod ─── independente
  ├── S1.3 next_action restantes ─── depende de S1.4
  └── S1.4 specialist.service ─── independente

Sprint 2 (Persistência + Conversacional)  ← depende de Sprint 1
  ├── S2.1 StateService ─── independente
  ├── S2.2 iniciar_projeto conversacional ─── depende de S2.1
  └── S2.3 brainstorm_inicial ─── depende de S2.2

Sprint 3 (Flow Engine + Consolidação)  ← depende de Sprint 2
  ├── S3.1 Flow Engine ─── independente
  ├── S3.2 Tool maestro ─── depende de S3.1 + S2.1
  └── S3.3 Consolidação ─── depende de S3.2

Sprint 4 (UX)  ← pode rodar em paralelo com Sprint 3
  ├── S4.1 Smart Defaults ─── independente
  ├── S4.2 Resumo Executivo ─── independente
  ├── S4.3 Templates ─── depende de S2.2
  └── S4.4 Confidence Score ─── depende de S2.2

Sprint 5 (Profissionalização)  ← após Sprint 3
  ├── S5.1 Testes ─── depende de todo código novo
  ├── S5.2 Error Handling ─── independente
  ├── S5.3 CI/CD ─── depende de S5.1
  └── S5.4 System Prompt ─── independente
```

---

## Projeção de Score por Sprint

| Dimensão | Atual (v3.0) | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 |
|----------|-------------|----------|----------|----------|----------|----------|
| Orquestração real | 5/10 | 6/10 | 7/10 | **9/10** | 9/10 | 9/10 |
| Independência modelo | 4.5/10 | 5/10 | 6/10 | **8/10** | 8.5/10 | 9/10 |
| Fluxo onboarding | 6.5/10 | 7/10 | **8.5/10** | 9/10 | 9.5/10 | 9.5/10 |
| Persistência | 6.5/10 | 6.5/10 | **8.5/10** | 9/10 | 9/10 | 9/10 |
| Qualidade código | 6.5/10 | 7.5/10 | 8/10 | 8.5/10 | 8.5/10 | **9/10** |
| Testabilidade | 3/10 | 3.5/10 | 4/10 | 5/10 | 5/10 | **8/10** |
| Experiência dev | 4/10 | 4.5/10 | 6/10 | 7/10 | **8.5/10** | 9/10 |
| **Score médio** | **5.9** | **6.4** | **7.1** | **8.1** | **8.4** | **8.9** |

---

## Priorização: O que fazer PRIMEIRO

### Recomendação: Sprint 1 → Sprint 2 → Sprint 3

**Justificativa:**
1. **Sprint 1** fecha a fundação (15% restante do Marco 0) e avança o Marco 1 com next_action nas tools restantes. Baixo risco, alto impacto incremental.
2. **Sprint 2** é a mudança de maior impacto no score (+1.2 pontos). Persistência ativa + iniciar_projeto conversacional resolvem as duas maiores reclamações de UX.
3. **Sprint 3** é a transformação arquitetural. Flow engine + tool `maestro` completam a visão de "orquestrador ativo".

Sprint 4 e 5 podem rodar em paralelo após Sprint 2 ser concluído.

---

## Riscos Atualizados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| Regressão ao adicionar next_action em 36 tools | Média | Médio | Adicionar testes para cada tool modificada |
| Flow engine over-engineered | Média | Alto | Começar com onboarding flow APENAS, expandir depois |
| Persistência ativa conflita com IDE | Baixa | Alto | Fallback para `files[]`, detectar permissões |
| Consolidação de 44→8 tools quebra clientes | Média | Alto | Aliases + depreciação gradual em 2 versões |
| iniciar_projeto conversacional é breaking change | Alta | Médio | Manter `confirmar_automaticamente: true` como fast path |

---

## Referências

- [CONTROLE_IMPLEMENTACAO.md](./CONTROLE_IMPLEMENTACAO.md) — Registro detalhado das mudanças v3.0.0
- [ROADMAP_MELHORIAS_MAESTRO.md](../roadmap/ROADMAP_MELHORIAS_MAESTRO.md) — Roadmap original com checklists atualizados
- [PLANO_REFATORACAO_FLUXO_INICIO.md](../roadmap/PLANO_REFATORACAO_FLUXO_INICIO.md) — Plano de refatoração do fluxo de início
- [ANALISE_ESTADO_ATUAL_MAESTRO.md](../analysis/ANALISE_ESTADO_ATUAL_MAESTRO.md) — Análise com scorecard atualizado
