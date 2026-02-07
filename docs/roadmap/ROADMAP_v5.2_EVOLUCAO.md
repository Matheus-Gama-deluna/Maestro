# Roadmap v5.2 — Evolução e Correções do Maestro MCP

> **Data:** 2026-02-07  
> **Versão alvo:** 5.2.0  
> **Referência:** `AUDITORIA_IMPLEMENTACAO_v5.1.md`  
> **Objetivo:** Completar integrações pendentes da v5.1, corrigir gaps identificados na auditoria, e evoluir o MCP para a próxima fase de maturidade

---

## 1. Contexto e Objetivo do Maestro MCP

### O que é o Maestro MCP

O Maestro é um **orquestrador de desenvolvimento de software assistido por IA** implementado como servidor MCP (Model Context Protocol). Ele guia projetos de software através de fases estruturadas, injetando contexto especializado, validando entregáveis e mantendo qualidade ao longo do ciclo de desenvolvimento.

### Onde estamos na evolução

```
v1.0 ─── 44 tools expostas, sem organização
  │
v3.0 ─── Router centralizado, separação public/legacy
  │
v4.0 ─── 8 tools públicas, middleware pipeline, skill injection
  │
v5.0 ─── Onboarding v2, flow engine, 3 prompts MCP
  │
v5.1 ─── [ATUAL] Infraestrutura de adaptação criada (12 módulos)
  │       ⚠️ 7 módulos não integrados, 3 tools não migradas
  │
v5.2 ─── [PRÓXIMO] Integração completa + testes + cleanup
  │
v6.0 ─── [FUTURO] Consolidação 8→5, remoção de legadas, ToolResult limpo
```

### Princípio desta fase

**"Integrar antes de inovar."** A v5.1 criou boa infraestrutura mas não a conectou. A v5.2 foca em completar o wiring, testar tudo, e só então avançar para features novas.

---

## 2. Organização em 3 Sprints

### Sprint A — Wiring (conectar o que existe) — ~3-4 dias
Integrar os 7 módulos órfãos, migrar as 3 tools restantes, corrigir capability detection no STDIO.

### Sprint B — Cleanup & Testes — ~3-4 dias
Limpar ToolResult, remover código morto, criar testes unitários, validar build.

### Sprint C — Evolução — ~4-5 dias
Consolidação 8→5, resource_links, outputSchema, features novas.

---

## 3. Sprint A — Wiring (Prioridade Máxima)

> **Objetivo:** Todos os módulos criados na v5.1 efetivamente integrados e funcionando  
> **Duração estimada:** 3-4 dias  
> **Pré-requisito:** `npm install` (node_modules não está instalado atualmente)

### Task A.1 — Instalar dependências e validar build
**Prioridade:** P0  
**Esforço:** 0.5 dia

1. Executar `npm install` no diretório raiz
2. Executar `npm run build` (tsc) e corrigir erros de compilação
3. Documentar quaisquer erros que apareçam

**Critério de aceitação:**
- [ ] `npm run build` compila sem erros
- [ ] Pasta `dist/` gerada com todos os .js

---

### Task A.2 — Integrar shared-resource-handler nos entry points
**Prioridade:** P0  
**Esforço:** 1 dia  
**Módulo órfão:** `handlers/shared-resource-handler.ts`

**Ações:**
1. Refatorar `stdio.ts` — substituir código inline de `ListResourcesRequestSchema` e `ReadResourceRequestSchema` pelo import de `listResources()` e `readResource()` do handler compartilhado
2. Refatorar `index.ts` — substituir `getResourcesList()` e `getResourceContent()` pelo handler compartilhado
3. **Preservar** resources de skills no `stdio.ts` (skill resources existem apenas no stdio)
   - Opção: estender o handler compartilhado para aceitar skills opcionais

**Critério de aceitação:**
- [ ] `stdio.ts` e `index.ts` importam de `shared-resource-handler.ts`
- [ ] Zero duplicação de lógica de resources
- [ ] Resources de skills continuam funcionando no stdio

---

### Task A.3 — Integrar skill-cache no SkillLoaderService
**Prioridade:** P1  
**Esforço:** 0.5 dia  
**Módulo órfão:** `services/skill-cache.service.ts`

**Ações:**
1. No `SkillLoaderService.loadForPhase()`, verificar cache antes de ler filesystem:
```typescript
import { getCached, setCache } from "./skill-cache.service.js";

async loadForPhase(skillName: string, mode: string) {
    const cacheKey = `skill:${skillName}:${mode}`;
    const cached = getCached(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // ... lógica atual de leitura ...
    
    setCache(cacheKey, JSON.stringify(result));
    return result;
}
```

**Critério de aceitação:**
- [ ] Skill carregada 2x retorna do cache na segunda
- [ ] Cache expira após TTL

---

### Task A.4 — Integrar system-prompt.service no resource system-prompt
**Prioridade:** P1  
**Esforço:** 0.5 dia  
**Módulo órfão:** `services/system-prompt.service.ts`

**Ações:**
1. No handler de `resources/read` para `maestro://system-prompt`, chamar `buildSystemPrompt()` em vez de retornar texto estático
2. Passar `projectDir` para que o prompt seja contextual

**Critério de aceitação:**
- [ ] Resource `maestro://system-prompt` retorna prompt dinâmico
- [ ] Prompt inclui informação do client (quando detectado)

---

### Task A.5 — Corrigir capability detection no STDIO
**Prioridade:** P0  
**Esforço:** 1 dia  
**Problema:** `captureClientCapabilities` é importado no `stdio.ts` mas nunca chamado

**Ações:**
1. Investigar se o SDK do MCP expõe `onInitialize` callback ou evento
2. **Opção A (preferida):** Se o SDK expõe params:
   ```typescript
   server.onInitialize = (params) => {
       captureClientCapabilities(params);
   };
   ```
3. **Opção B (fallback):** Usar detecção estática baseada em variáveis de ambiente ou `clientInfo` disponível após conexão:
   ```typescript
   // Após server.connect()
   const clientInfo = server.getClientInfo?.() || {};
   captureClientCapabilities({
       clientInfo,
       capabilities: {},
       protocolVersion: "2025-03-26",
   });
   ```
4. **Opção C (mínimo viável):** Detecção por environment variables comuns de IDEs:
   ```typescript
   function detectClientFromEnv(): string {
       if (process.env.WINDSURF_SESSION) return "windsurf";
       if (process.env.CURSOR_SESSION) return "cursor";
       if (process.env.VSCODE_PID) return "vscode";
       return "unknown";
   }
   ```

**Critério de aceitação:**
- [ ] Capabilities detectadas para conexões STDIO
- [ ] Log no startup mostra client detectado

---

### Task A.6 — Migrar tools restantes para formatResponse
**Prioridade:** P1  
**Esforço:** 1 dia  
**Tools não migradas:** `status.ts`, `contexto.ts`, `salvar.ts`

**Ações para cada tool:**
1. Importar `formatResponse`, `formatError` de `response-formatter.ts`
2. Substituir template strings manuais por `formatResponse()`
3. Embutir `next_action` e `progress` no content (eliminar campos custom)
4. Garantir múltiplos content blocks na resposta

**Critério de aceitação:**
- [ ] As 8 tools públicas usam `formatResponse()`
- [ ] Zero campos custom no retorno das 8 tools

---

### Task A.7 — Integrar fallbacks nas tools relevantes
**Prioridade:** P2  
**Esforço:** 1 dia  
**Módulos órfãos:** `elicitation-fallback`, `sampling-fallback`, `annotations-fallback`

**Ações:**
1. **Elicitation:** Integrar `buildElicitation()` no fluxo de onboarding/discovery
   - Onde o onboarding faz perguntas ao usuário, usar o serviço de fallback
   - Integrar em `onboarding-orchestrator.ts` e/ou `discovery.ts`

2. **Sampling:** Integrar `buildCodeAnalysisFallback()` no `analisar.ts`
   - Quando `analisar(tipo: "completo")` sem código fornecido, gerar checklist de self-analysis

3. **Annotations:** Integrar `annotateContent()` no `response-formatter.ts`
   - Blocos de "Instruções" marcados como `audience: ["assistant"]`
   - Blocos de "Resumo" marcados como `audience: ["user"]`
   - Aplicar automaticamente no `formatResponse()`

**Critério de aceitação:**
- [ ] Discovery usa `buildElicitation()` para perguntas
- [ ] `analisar` usa checklists quando sem sampling
- [ ] `formatResponse()` aplica annotations quando suportado

---

### Task A.8 — Integrar structured-content nas tools de dados
**Prioridade:** P2  
**Esforço:** 0.5 dia  
**Módulo órfão:** `services/structured-content.service.ts`

**Ações:**
1. Integrar `withStructuredContent()` nas tools `status` e `contexto`
2. Retornar dados estruturados junto com Markdown

**Critério de aceitação:**
- [ ] `status` retorna `structuredContent` quando client suporta
- [ ] Client antigo continua recebendo apenas `content`

---

## 4. Sprint B — Cleanup & Testes

> **Objetivo:** Código limpo, types seguros, testes validando  
> **Duração estimada:** 3-4 dias  
> **Dependência:** Sprint A completo

### Task B.1 — Limpar ToolResult type
**Prioridade:** P0  
**Esforço:** 1 dia

**Ações:**
1. Remover `[x: string]: unknown` do `ToolResult` em `types/index.ts`
2. Adicionar `structuredContent?: { type: "json"; json: Record<string, unknown> }` como campo opcional padrão MCP
3. Remover campos custom: `files`, `estado_atualizado`, `next_action`, `specialist_persona`, `progress`
4. **Antes de remover:** Verificar que NENHUMA tool ainda depende desses campos no retorno
5. Compilar e corrigir erros

```typescript
// DEPOIS
export interface ToolResult {
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
    structuredContent?: { type: "json"; json: Record<string, unknown> };
}
```

**Critério de aceitação:**
- [ ] ToolResult sem index signature
- [ ] Nenhum campo custom no type
- [ ] `npm run build` compila sem erros

---

### Task B.2 — Remover código morto
**Prioridade:** P1  
**Esforço:** 0.5 dia

**Ações:**
1. Verificar se `src/src/tools/index.ts` (411 linhas) é necessário
   - Se `server.ts` é o único consumer, avaliar se `server.ts` pode usar `router.ts` diretamente
   - Se sim, remover `tools/index.ts` ou marcar como deprecated
2. Verificar se `src/src/server.ts` ainda é um entry point usado
3. Remover imports não utilizados em todos os arquivos modificados

**Critério de aceitação:**
- [ ] Zero arquivos mortos
- [ ] Zero imports não utilizados

---

### Task B.3 — Testes unitários
**Prioridade:** P1  
**Esforço:** 2 dias

**Testes a criar:**

```
tests/
├── utils/
│   └── response-formatter.test.ts      # formatResponse, formatError, embedNextAction
├── services/
│   ├── client-capabilities.test.ts     # captureClientCapabilities, clientSupports
│   ├── skill-cache.test.ts             # getCached, setCache, invalidateCache
│   ├── elicitation-fallback.test.ts    # buildElicitation (nativo vs fallback)
│   ├── sampling-fallback.test.ts       # buildSamplingRequest (nativo vs fallback)
│   ├── annotations-fallback.test.ts    # annotateContent (nativo vs inline)
│   └── structured-content.test.ts      # withStructuredContent
├── handlers/
│   └── shared-resource-handler.test.ts # listResources, readResource
└── integration/
    └── entry-point-parity.test.ts      # stdio vs HTTP retornam mesmos resources/prompts
```

**Critério de aceitação:**
- [ ] `npm test` passa todos os testes
- [ ] Cobertura ≥80% nos módulos novos

---

### Task B.4 — Validar build e runtime
**Prioridade:** P0  
**Esforço:** 0.5 dia

**Ações:**
1. `npm run build` — zero erros
2. `node dist/stdio.js` — inicia sem crash
3. Testar manualmente no Windsurf:
   - Conectar MCP
   - Chamar `maestro`
   - Verificar Markdown bem formado
   - Verificar resources listados
   - Verificar prompts listados

---

## 5. Sprint C — Evolução (Features Novas)

> **Objetivo:** Levar o MCP ao próximo nível de maturidade  
> **Duração estimada:** 4-5 dias  
> **Dependência:** Sprints A e B completos

### Task C.1 — Consolidação de tools 8→5 + executar.ts
**Prioridade:** P1  
**Esforço:** 2-3 dias

Criar tool `executar` que unifica `avancar` + `salvar` + `checkpoint`:

```typescript
const publicTools = [
    { name: "maestro",   /* entry point + subsume status */ },
    { name: "executar",  /* avancar + salvar + checkpoint */ },
    { name: "validar",   /* gate + entregável + compliance */ },
    { name: "analisar",  /* segurança + qualidade + performance */ },
    { name: "contexto",  /* ADRs + padrões + knowledge base */ },
];
```

**Ações:**
1. Criar `src/src/tools/consolidated/executar.ts` com switch em `args.acao`
2. Mover `avancar`, `salvar`, `checkpoint`, `status` para legacyTools no router
3. `maestro` sem ação = retorna status (subsume `status`)
4. Atualizar `maestro-tool.ts` para referenciar `executar` nos `proximo_passo`
5. Atualizar mapa de deprecation warnings

---

### Task C.2 — Resource Links nos retornos de tools
**Prioridade:** P2  
**Esforço:** 1 dia

Quando uma tool referencia um especialista/template/skill, incluir `resource_link`:

```typescript
{
    type: "resource",
    resource: {
        uri: "maestro://skills/architecture/SKILL.md",
        text: conteudoSkill,
        mimeType: "text/markdown",
    }
}
```

Com fallback para texto inline quando client não suporta.

---

### Task C.3 — OutputSchema nas tools
**Prioridade:** P2  
**Esforço:** 1 dia

Definir `outputSchema` nas tools que retornam dados estruturados (`maestro`, `status`, `contexto`). Clients modernos podem processar schemas para melhor UX.

---

### Task C.4 — Prompt handler compartilhado
**Prioridade:** P2  
**Esforço:** 0.5 dia

Criar `handlers/shared-prompt-handler.ts` para unificar prompts entre `stdio.ts` e `index.ts`, similar ao que foi feito (mas não integrado) para resources.

---

## 6. Visão de Futuro — v6.0

A v6.0 é a release que pode conter **breaking changes**:

| Item | Descrição |
|------|-----------|
| **Remoção de tools legadas** | 37 tools removidas do `allToolsMap` |
| **ToolResult strict** | Sem index signature, sem campos custom |
| **5 tools públicas** | `maestro`, `executar`, `validar`, `analisar`, `contexto` |
| **MCP Tasks** | Quando Windsurf suportar — operações assíncronas |
| **MCP Roots** | Quando Windsurf suportar — eliminar `diretorio` obrigatório |
| **Elicitation nativa** | Quando Windsurf suportar — formulários de discovery |
| **MCP Apps** | Dashboard visual (VS Code only inicialmente) |

---

## 7. Métricas de Sucesso v5.2

| Métrica | v5.1 (atual) | v5.2 (alvo) |
|---------|-------------|-------------|
| Módulos integrados | 5/12 (42%) | 12/12 (100%) |
| Tools com formatResponse | 5/8 (62%) | 8/8 (100%) |
| Testes unitários | 0 | 20+ |
| Build compila | ❓ (não testado) | ✅ |
| Capability detection | HTTP only | HTTP + STDIO |
| Problemas do diagnóstico resolvidos | 4/14 (29%) | 12/14 (86%) |
| Campos custom no ToolResult | 5 | 0 |
| Código morto | tools/index.ts (411 linhas) | Removido |

---

## 8. Ordem de Execução Recomendada

```
DIA 1:  A.1 (npm install + build) → A.5 (fix STDIO capabilities)
DIA 2:  A.2 (integrar handlers) → A.3 (integrar cache)
DIA 3:  A.4 (system prompt) → A.6 (migrar 3 tools)
DIA 4:  A.7 (integrar fallbacks) → A.8 (structured content)
DIA 5:  B.1 (limpar ToolResult) → B.2 (remover código morto)
DIA 6:  B.3 (testes unitários)
DIA 7:  B.3 (testes cont.) → B.4 (validar build + runtime)
DIA 8:  C.1 (consolidação 8→5)
DIA 9:  C.1 (cont.) → C.2 (resource links)
DIA 10: C.3 (outputSchema) → C.4 (prompt handler)
```

**Total estimado: 10 dias úteis (~2 semanas)**

---

## 9. Checklist de Validação Final v5.2

### Funcional
- [ ] `npm run build` compila sem erros
- [ ] `npm test` passa 100%
- [ ] Windsurf conecta e lista tools
- [ ] `maestro(diretorio)` retorna Markdown estruturado com múltiplos blocos
- [ ] Resources listam especialistas/templates/guias (não tools)
- [ ] Prompts incluem `maestro-sessao`
- [ ] Tools legadas retornam warning de deprecation
- [ ] Cache de skills funcional (verificar com 2 chamadas seguidas)

### Qualidade
- [ ] Zero módulos órfãos
- [ ] Zero imports não utilizados
- [ ] ToolResult sem index signature
- [ ] Cobertura de testes ≥80% nos módulos novos
- [ ] Build limpo (sem warnings de TypeScript)

### Integração
- [ ] `shared-resource-handler` usado por ambos entry points
- [ ] `skill-cache` integrado no SkillLoaderService
- [ ] `system-prompt.service` gera prompt dinâmico
- [ ] `elicitation-fallback` usado no onboarding
- [ ] `sampling-fallback` usado no analisar
- [ ] `annotations-fallback` integrado no formatResponse
- [ ] `structured-content` usado em status e contexto
- [ ] Capability detection funciona em STDIO e HTTP

---

> **Início recomendado:** Task A.1 (npm install + build) para validar estado base antes de integrar.
