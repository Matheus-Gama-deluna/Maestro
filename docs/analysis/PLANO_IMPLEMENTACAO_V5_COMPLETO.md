# Plano de Implementação Maestro v5.0.0 — Orquestração Ativa

**Data:** 06/02/2026  
**Base:** `ANALISE_COMPLETA_V4.md` + `IMPLEMENTACAO_MELHORIAS_V5_MODO_HIBRIDO.md`  
**Objetivo:** Transformar o Maestro de um sistema que *orienta* a IA a ler skills para um sistema que *injeta ativamente* o contexto necessário em cada fase, mantendo compatibilidade com o modo de injeção local.

---

## Diagnóstico: Estado Atual vs Alvo

### Score Atual (v4.0.0): 7.1/10 → Alvo (v5.0.0): 9.0/10

| Dimensão | v4.0 | Alvo | Gap Principal |
|----------|------|------|---------------|
| Orquestração real | 7 | 9 | Skills não são consumidas, só referenciadas |
| Independência do modelo | 6 | 9.5 | 45 tools expostas, IA decide o que ler |
| Persistência | 8 | 9 | StateService existe mas não é usado pelas tools |
| Testabilidade | 3.5 | 8 | 0 testes para código v4 |
| Experiência dev | 6.5 | 9 | Superfície cognitiva enorme |

### Os 3 Problemas Raiz

1. **O MCP nunca lê as skills** — `proximo.ts` verifica se a skill EXISTE mas nunca injeta o CONTEÚDO na resposta
2. **45 tools expostas** — A IA confunde tools similares, gasta tokens processando a lista
3. **Flow Engine + StateService desconectados** — Existem como código morto, não usados pelas tools reais

---

## Arquitetura v5: Fluxo de Dados

```
ANTES (v4):
  IA chama proximo() → MCP diz "leia SKILL.md em path/X" → IA talvez leia → IA gera entregável

DEPOIS (v5):
  IA chama proximo() → MCP lê SKILL.md internamente → MCP injeta contexto na resposta → IA gera com contexto completo
```

```
┌─────────────────────────────────────────────────────┐
│ Tool Handler (proximo, maestro, validar_gate, etc.) │
│                      ↓                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ Middleware Pipeline                           │  │
│  │  withErrorHandling()                          │  │
│  │   → withStateLoad()        [auto-carrega]     │  │
│  │     → withFlowEngine()     [next_action]      │  │
│  │       → withPersistence()  [auto-salva]       │  │
│  │         → withSkillInjection() [injeta skills]│  │
│  └───────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ ContentResolverService                        │  │
│  │  Prioridade: .maestro/content → content/      │  │
│  │  Cache em memória + fingerprint               │  │
│  └───────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ SkillLoaderService                            │  │
│  │  loadForPhase(fase, mode) → ContextPackage    │  │
│  │  Budget: economy/balanced/quality             │  │
│  │  Chunking: seções essenciais por budget       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Sprint A — Injeção Ativa de Skills (MAIOR IMPACTO)

**Impacto estimado:** Orquestração 7→8.5, Independência do modelo 6→8

### A.1 — ContentResolverService

**Arquivo:** `src/src/services/content-resolver.service.ts`

**Responsabilidade:** Única fonte de verdade para resolver onde ler conteúdo (projeto local vs servidor).

```typescript
// API pública
class ContentResolverService {
  constructor(diretorio: string)
  
  // Resolve o diretório raiz de conteúdo
  getContentRoot(): string  // .maestro/content/ ou content/ do servidor
  
  // Resolve path de skill específica
  getSkillDir(skillName: string): string | null
  
  // Lê conteúdo de arquivo de skill
  readSkillFile(skillName: string, fileName: string): Promise<string | null>
  
  // Lista recursos de uma skill
  listSkillResources(skillName: string, tipo: 'templates'|'examples'|'checklists'|'reference'): Promise<string[]>
  
  // Lê recurso específico de skill  
  readSkillResource(skillName: string, tipo: string, arquivo: string): Promise<string | null>
}
```

**Regras de resolução:**
1. Se `.maestro/content/skills/{skill}` existe no projeto → usar (Plano B)
2. Senão, usar `content/skills/{skill}` do servidor (Plano A)
3. Cache em memória por `skillName` (Map com TTL de 5 min)

### A.2 — SkillLoaderService

**Arquivo:** `src/src/services/skill-loader.service.ts`

**Responsabilidade:** Montar "pacote de contexto" por fase com controle de budget de tokens.

```typescript
interface ContextPackage {
  skillName: string;
  specialist: SpecialistPersona | null;
  skillContent: string;        // Seções essenciais do SKILL.md
  templateContent: string;     // Template do entregável (ou skeleton)
  checklistContent: string;    // Checklist de gate
  referenceLinks: string[];    // URIs para recursos adicionais
  tokenEstimate: number;       // Estimativa de tokens
  mode: 'full' | 'summary' | 'skeleton';  // Modo usado
}

class SkillLoaderService {
  constructor(contentResolver: ContentResolverService)
  
  // Carrega pacote completo para uma fase
  loadForPhase(faseNome: string, mode: 'economy'|'balanced'|'quality'): Promise<ContextPackage | null>
  
  // Carrega apenas checklist de gate
  loadChecklist(faseNome: string): Promise<string | null>
  
  // Carrega apenas template
  loadTemplate(faseNome: string): Promise<string | null>
  
  // Formata pacote como markdown para injeção na resposta
  formatAsMarkdown(pkg: ContextPackage): string
}
```

**Budgets de token por modo:**

| Modo | Skill Core | Template | Checklist | Total ~tokens |
|------|-----------|----------|-----------|---------------|
| economy | ~400 (resumo) | skeleton (títulos) | completo (~200) | ~800-1500 |
| balanced | ~1500 (seções essenciais) | completo (~800) | completo (~200) | ~2000-4000 |
| quality | ~3000 (completo) | completo (~800) | completo (~200) | ~4000-8000 |

**Estratégia de chunking do SKILL.md:**
- Parsear headings (`##`, `###`)
- Sempre incluir: "Missão", "Processo", "Quality Gate", "Inputs obrigatórios", "Outputs gerados"
- Incluir condicionalmente: "Exemplos", "Referência" (apenas em quality mode)
- Estimar tokens: ~4 chars = 1 token

### A.3 — Integrar em proximo.ts

**Mudanças em `proximo.ts`:**

1. **Na transição de fase** (linhas ~690-728): Em vez de gerar texto dizendo "Ative a skill @specialist-X", incluir o conteúdo real da skill na resposta.

2. **Antes:**
```typescript
// Gera mensagem tipo "Ative a skill @specialist-X e leia SKILL.md"
const proximaSkillInfo = formatSkillMessage(proximaSkill, ide);
```

3. **Depois:**
```typescript
// Carrega e injeta conteúdo real da skill
const contentResolver = new ContentResolverService(diretorio);
const skillLoader = new SkillLoaderService(contentResolver);
const contextPackage = await skillLoader.loadForPhase(proximaFase.nome, estado.config?.mode || 'balanced');
const skillInjection = contextPackage ? skillLoader.formatAsMarkdown(contextPackage) : '';
```

4. A resposta de `proximo()` inclui o pacote de contexto diretamente no `text`, seção "Contexto do Especialista".

### A.4 — Integrar em maestro-tool.ts

**Mudanças:**
- Quando detecta fase ativa, incluir resumo curto do especialista + checklist na resposta
- Usar modo `economy` para manter resposta concisa

### A.5 — Integrar em validar-gate.ts  

**Mudanças:**
- Ao validar gate, carregar checklist real da skill (via `skillLoader.loadChecklist()`)
- Comparar entregável contra checklist real (não apenas regras hardcoded)

---

## Sprint B — Consolidação de Tools (45 → 8 + legadas)

**Impacto estimado:** Independência do modelo 8→9, Experiência dev 6.5→8

### B.1 — Separar Public vs Legacy no Router

**Mudanças em `router.ts`:**

```typescript
// ANTES: toolRegistry com 45 tools expostas
const toolRegistry: ToolDefinition[] = [...]

// DEPOIS: separar em 2 registries
const publicTools: ToolDefinition[] = [
  // 8 tools consolidadas
  { name: "maestro", ... },     // Entry point inteligente
  { name: "avancar", ... },     // Submeter entregável/avançar (unifica: proximo + onboarding)
  { name: "status", ... },      // Status + progresso
  { name: "validar", ... },     // Validar gate/entregável (unifica: validar_gate + avaliar_entregavel)
  { name: "contexto", ... },    // Contexto + knowledge base (unifica: contexto + get_context + search_knowledge)
  { name: "salvar", ... },      // Salvar artefatos
  { name: "checkpoint", ... },  // Checkpoint/rollback (unifica: create_checkpoint + rollback_* + list_checkpoints)
  { name: "analisar", ... },    // Análise (unifica: analisar_seguranca + qualidade + performance + validate_*)
];

const legacyTools: ToolDefinition[] = [
  // 37 tools com alias → redirecionam para as públicas internamente
  // Descrição prefixada com "[Interno]"
];

// getRegisteredTools() retorna apenas publicTools
// routeToolCall() aceita ambas (backward compatible)
```

### B.2 — Tool `avancar` (consolidada)

Unifica:
- `proximo` (avançar fase)
- `onboarding_orchestrator` (próximo bloco de onboarding)
- `brainstorm` (próxima seção)

Detecta contexto automaticamente: se está em onboarding → delega para orchestrator, senão → delega para proximo.

### B.3 — Tool `validar` (consolidada)

Unifica:
- `validar_gate`
- `avaliar_entregavel`
- `check_compliance`

Aceita parâmetro `tipo` opcional: 'gate' | 'entregavel' | 'compliance'. Auto-detecta se não fornecido.

### B.4 — Tool `checkpoint` (consolidada)

Unifica:
- `create_checkpoint`
- `rollback_total`
- `rollback_partial`
- `list_checkpoints`

Aceita parâmetro `acao`: 'criar' | 'rollback' | 'listar'. Parâmetro `modules` para rollback parcial.

### B.5 — Tool `analisar` (consolidada)

Unifica:
- `analisar_seguranca`
- `analisar_qualidade`
- `analisar_performance`
- `validate_dependencies`
- `validate_security`
- `gerar_relatorio`

Aceita parâmetro `tipo`: 'seguranca' | 'qualidade' | 'performance' | 'dependencias' | 'completo'.

---

## Sprint C — Integração Real do Flow Engine + StateService

**Impacto estimado:** Orquestração 8.5→9, Persistência 8→9

### C.1 — Middleware `withStateLoad`

**Arquivo:** `src/src/middleware/state-loader.middleware.ts`

```typescript
// Intercepta chamada de tool e auto-carrega estado do filesystem
function withStateLoad(handler) {
  return async (args) => {
    if (!args.estado_json && args.diretorio) {
      const stateService = createStateService(args.diretorio);
      const estado = await stateService.load();
      if (estado) {
        args.estado_json = JSON.stringify(estado);
      }
    }
    return handler(args);
  };
}
```

**Impacto:** Tools não precisam mais obrigatoriamente receber `estado_json` — o middleware carrega automaticamente.

### C.2 — Middleware `withPersistence`

**Arquivo:** `src/src/middleware/persistence.middleware.ts`

```typescript
// Após execução da tool, salva estado automaticamente no filesystem
function withPersistence(handler) {
  return async (args) => {
    const result = await handler(args);
    
    // Se result tem estado_atualizado, salvar automaticamente
    if (result.estado_atualizado && args.diretorio) {
      const stateService = createStateService(args.diretorio);
      await stateService.save(JSON.parse(result.estado_atualizado));
      
      // Se tem files[], salvar também
      if (result.files?.length) {
        await stateService.saveFiles(result.files);
      }
    }
    
    return result;
  };
}
```

**Impacto:** A IA não precisa mais salvar `files[]` manualmente — o MCP salva diretamente.

### C.3 — Middleware `withFlowEngine`

**Arquivo:** `src/src/middleware/flow-engine.middleware.ts`

```typescript
// Após execução, calcula next_action via flow engine (substitui lógica local)
function withFlowEngine(handler) {
  return async (args) => {
    const result = await handler(args);
    
    // Se tem estado, calcular next_action via flow engine
    if (result.estado_atualizado && args.diretorio) {
      const estado = JSON.parse(result.estado_atualizado);
      const nextStep = getNextStep(estado, args.diretorio);
      result.next_action = flowStepToNextAction(nextStep);
      result.progress = getFlowProgress(estado);
      
      if (nextStep.specialist) {
        result.specialist_persona = nextStep.specialist;
      }
    }
    
    return result;
  };
}
```

### C.4 — Compor Middlewares no Router

```typescript
// Em router.ts, aplicar pipeline de middlewares
function applyMiddlewares(handler, toolName) {
  return withErrorHandling(toolName,
    withStateLoad(
      withFlowEngine(
        withPersistence(
          withSkillInjection(handler)
        )
      )
    )
  );
}
```

### C.5 — Remover Lógica Duplicada das Tools

Após integrar middlewares:
- `proximo.ts`: remover cálculo manual de `next_action` (linhas 772-800)
- `status.ts`: remover cálculo de progresso duplicado
- `maestro-tool.ts`: já usa flow engine (manter)
- Todas as tools: `estado_json` torna-se **opcional** (middleware carrega)

---

## Sprint D — Otimização do Sistema de Skills

**Impacto estimado:** Qualidade de código 7.5→8.5

### D.1 — Skills como MCP Resources (Aprimorado)

**Mudanças em `stdio.ts`:**

Expandir ListResourcesRequestSchema para incluir skills estruturadas:

```typescript
// Registrar skills como resources MCP
maestro://skills/{skill-name}/SKILL.md
maestro://skills/{skill-name}/templates/{template}
maestro://skills/{skill-name}/checklists/{checklist}
maestro://skills/{skill-name}/examples/{example}
maestro://skills/{skill-name}/reference/{ref}
```

ReadResourceRequestSchema lê diretamente do `ContentResolverService` (sem cópia).

### D.2 — Injeção Local Mínima

Modificar `injectContentForIDE()`:
- **Manter injeção de:** rules + workflows (necessários para IDE)
- **Tornar opcional:** skills (controlado por flag `injectSkills: boolean`)
- **Padrão v5:** `injectSkills: false` (skills servidas via MCP resources + injeção ativa)

### D.3 — Manifesto de Versão

Criar `.maestro/content/.version.json`:
```json
{
  "version": "5.0.0",
  "hash": "sha256:...",
  "injected_at": "2026-02-06T...",
  "source": "builtin"
}
```

Permitir detectar se content local está desatualizado vs servidor.

---

## Sprint E — MCP Prompts (System Prompt Automático)

**Impacto estimado:** Independência do modelo 9→9.5

### E.1 — Registrar Prompts no Servidor

**Mudanças em `stdio.ts`:**

Adicionar capability `prompts` e handlers:

```typescript
// ListPromptsRequestSchema
prompts: [
  { name: "maestro-specialist", description: "Persona + instruções do especialista da fase atual" },
  { name: "maestro-context", description: "Contexto completo do projeto para a sessão" },
  { name: "maestro-template", description: "Template do entregável esperado" },
]

// GetPromptRequestSchema
// Constrói prompt dinâmico baseado no estado atual do projeto
```

### E.2 — Prompt Dinâmico por Fase

```typescript
// Se fase = "Arquitetura":
// → messages[0] = { role: "user", content: { type: "text", text: skillContent + templateContent + checklistContent } }
// Usa ContentResolverService + SkillLoaderService
```

### E.3 — Fallback Universal

Para IDEs que não suportam prompts MCP:
- Conteúdo incluído no `content` da resposta da tool (já implementado no Sprint A)
- MCP Prompts é uma camada adicional, não substitui

---

## Ordem de Implementação (Detalhada)

### Passo 1: ContentResolverService (Sprint A.1)
- Criar `src/src/services/content-resolver.service.ts`
- Implementar resolução de paths com prioridade projeto → servidor
- Cache em memória

### Passo 2: SkillLoaderService (Sprint A.2)
- Criar `src/src/services/skill-loader.service.ts`
- Implementar carregamento com budget
- Implementar chunking de SKILL.md por seções
- Implementar formatação como markdown

### Passo 3: Integrar em proximo.ts (Sprint A.3)
- Substituir referências textuais por injeção ativa
- Incluir ContextPackage na resposta de transição de fase

### Passo 4: Integrar em maestro-tool.ts (Sprint A.4)
- Incluir contexto resumido do especialista

### Passo 5: Integrar em validar-gate.ts (Sprint A.5)
- Usar checklist real da skill para validação

### Passo 6: Middlewares (Sprint C.1-C.4)
- Criar diretório `src/src/middleware/`
- Implementar withStateLoad, withPersistence, withFlowEngine
- Compor pipeline no router

### Passo 7: Consolidar Tools (Sprint B.1-B.5)
- Criar tools consolidadas: avancar, validar, checkpoint, analisar
- Separar publicTools vs legacyTools no router
- getRegisteredTools() retorna apenas públicas

### Passo 8: Skills como Resources (Sprint D.1-D.3)
- Expandir ListResources/ReadResource em stdio.ts
- Tornar injeção de skills opcional
- Implementar manifesto de versão

### Passo 9: MCP Prompts (Sprint E.1-E.3)
- Registrar capability prompts
- Implementar handlers dinâmicos
- Fallback universal

---

## Arquivos a Criar

| Arquivo | Sprint | Descrição |
|---------|--------|-----------|
| `src/src/services/content-resolver.service.ts` | A | Resolução de conteúdo projeto/servidor |
| `src/src/services/skill-loader.service.ts` | A | Carregamento de skills com budget |
| `src/src/middleware/index.ts` | C | Exports dos middlewares |
| `src/src/middleware/state-loader.middleware.ts` | C | Auto-carregamento de estado |
| `src/src/middleware/persistence.middleware.ts` | C | Auto-persistência |
| `src/src/middleware/flow-engine.middleware.ts` | C | next_action via flow engine |
| `src/src/middleware/skill-injection.middleware.ts` | C | Injeção de skills nos resultados |
| `src/src/tools/consolidated/avancar.ts` | B | Tool consolidada avancar |
| `src/src/tools/consolidated/validar.ts` | B | Tool consolidada validar |
| `src/src/tools/consolidated/checkpoint-tool.ts` | B | Tool consolidada checkpoint |
| `src/src/tools/consolidated/analisar.ts` | B | Tool consolidada analisar |

## Arquivos a Modificar

| Arquivo | Sprint | Mudanças |
|---------|--------|----------|
| `src/src/tools/proximo.ts` | A | Injeção ativa de skills na resposta |
| `src/src/tools/maestro-tool.ts` | A | Contexto do especialista na resposta |
| `src/src/tools/validar-gate.ts` | A | Checklist real da skill na validação |
| `src/src/router.ts` | B,C | Public/legacy tools, middleware pipeline |
| `src/src/stdio.ts` | D,E | Resources de skills, MCP Prompts |
| `src/src/utils/content-injector.ts` | D | Injeção de skills opcional |

---

## Critérios de Aceite

### Sprint A — Injeção Ativa
- [ ] Quando `proximo()` avança para nova fase, a resposta INCLUI o conteúdo do SKILL.md (seções essenciais)
- [ ] Quando `proximo()` avança, a resposta INCLUI o template do entregável esperado
- [ ] Quando `proximo()` avança, a resposta INCLUI o checklist de gate
- [ ] O budget de tokens é respeitado por modo (economy/balanced/quality)
- [ ] ContentResolver prioriza .maestro/content quando existe, fallback para servidor

### Sprint B — Consolidação
- [ ] `getRegisteredTools()` retorna 8 tools (não 45)
- [ ] `routeToolCall()` aceita tools legadas (backward compatible)
- [ ] Tool `avancar` detecta contexto e delega corretamente
- [ ] Tool `validar` unifica validação de gate e entregável

### Sprint C — Middlewares
- [ ] Tools funcionam SEM `estado_json` (middleware carrega automaticamente)
- [ ] Estado é salvo automaticamente após cada tool que modifica estado
- [ ] `next_action` é consistente via flow engine (não mais lógica local)

### Sprint D — Skills
- [ ] Skills disponíveis como MCP Resources (`maestro://skills/...`)
- [ ] Injeção de skills para IDE é opcional
- [ ] `.version.json` criado em .maestro/content

### Sprint E — Prompts
- [ ] IDEs que suportam MCP Prompts recebem persona automática
- [ ] Prompt dinâmico muda conforme a fase do projeto
- [ ] Fallback universal funciona para IDEs sem suporte a prompts

---

## Status da Implementação (06/02/2026)

| Sprint | Status | Arquivos |
|--------|--------|----------|
| **A — Injeção Ativa** | ✅ Concluído | `content-resolver.service.ts`, `skill-loader.service.ts`, `proximo.ts` (mod), `maestro-tool.ts` (mod) |
| **B — Consolidação Tools** | ✅ Concluído | `router.ts` (reescrito), `consolidated/avancar.ts`, `consolidated/validar.ts`, `consolidated/checkpoint-tool.ts`, `consolidated/analisar.ts` |
| **C — Middlewares** | ✅ Concluído | `middleware/state-loader.middleware.ts`, `middleware/persistence.middleware.ts`, `middleware/flow-engine.middleware.ts`, `middleware/skill-injection.middleware.ts`, `middleware/index.ts` |
| **D — Skills Resources** | ✅ Concluído | `stdio.ts` (mod — ListResources/ReadResource expandidos) |
| **E — MCP Prompts** | ✅ Concluído | `stdio.ts` (mod — ListPrompts/GetPrompt + `buildSpecialistPrompt`/`buildContextPrompt`) |
| **Testes** | ✅ 255 passed / 0 failed | `tests/content-resolver.test.ts`, `tests/skill-loader.test.ts`, `tests/middleware.test.ts` |
| **Build** | ✅ `tsc --noEmit` OK, `npm run build` OK | `package.json` v5.0.0 |

### Métricas Finais

| Métrica | v4.0 | v5.0 | Melhoria |
|---------|------|------|----------|
| Tools públicas expostas | 45 | 8 | -82% superfície cognitiva |
| Skills injetadas na resposta | 0 | Sim (por fase) | ∞ (era 0) |
| estado_json obrigatório | Sim | Não (middleware auto-carrega) | UX simplificada |
| Persistência automática | Não | Sim (middleware) | IA não precisa salvar files |
| MCP Prompts | Não | 2 prompts dinâmicos | System prompt automático |
| Testes para código novo | 0 | 30+ | Cobertura de services e middlewares |
| Backward compatibility | — | 100% (legadas aceitas) | Sem breaking changes |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Injeção ativa estoura contexto da IA | Média | Alto | Budget de tokens por modo + chunking |
| Tools legadas param de funcionar | Baixa | Alto | Backward compatibility no router |
| IDEs não suportam MCP Prompts | Alta | Médio | Fallback universal (conteúdo na resposta) |
| ContentResolver não encontra conteúdo | Baixa | Alto | Múltiplos fallbacks + logs claros |
| Middleware pipeline causa overhead | Baixa | Baixo | Middlewares são sync quando possível |
