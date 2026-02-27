# Diagnóstico: Autonomia e Contexto do Maestro v7.1

> Baseado na análise de teste real (26/02/2026) — Projeto "Gestão de Estoque Inteligente"
> Fluxo COMPLEXO (17 fases), fases 6→14 observadas

---

## 1. Resumo Executivo

O teste revelou que **a IA não consegue orquestrar o fluxo de fases de forma autônoma** porque o sistema Maestro:
1. **Não injeta o conteúdo real das skills** — apenas referencia caminhos de arquivo
2. **Não fornece contexto acumulado** — cada fase começa "do zero" sem resumo dos entregáveis anteriores
3. **Força interação desnecessária** — fases derivadas pedem "perguntas de alinhamento" que o usuário ignora com "continue"
4. **Valida gates com keyword matching frágil** — itens como "Versionamento definido" falham porque o YAML não contém a palavra literal
5. **Não comunica o path canônico** — IA cria arquivos em `docs/07-xxx/` mas o sistema salva em `docs/fase-07-xxx/`
6. **Permite passagem de conteúdo via argumento** — desperdiça tokens e bypassa validação file-first

### Impacto Observado
- **12 interações "continue"** sem valor agregado
- **Gate forçado** na fase Contrato API (score 66/100 por checklist keyword mismatch)
- **Entregáveis genéricos** — sem referência ao projeto específico
- **Frontend nunca implementado** — loops infinitos de "confirmar stack"

---

## 2. Problemas Identificados (Root Cause Analysis)

### PROBLEMA 1: Skill Content Não Injetado (CRÍTICO)

**Sintoma:** IA diz "Sou Especialista em X" mas gera conteúdo genérico enterprise.

**Root Cause:** `skill-injection.middleware.ts` apenas adiciona uma referência `#.windsurf/skills/xxx/SKILL.md` (formato de menção IDE). O conteúdo real do SKILL.md, templates e checklists **nunca é enviado ao modelo**.

**Evidência no código:**
```typescript
// skill-injection.middleware.ts:61-64
const hydrationCommand = formatSkillHydrationCommand(skillName, ide);
result.content[0].text += `\n\n## 🧠 Contexto do Especialista\n\n${hydrationCommand}`;
// ^ Apenas referência textual, não o conteúdo real
```

**O que deveria acontecer:** O `SkillLoaderService.loadForPhase()` já existe e carrega SKILL.md + template + checklist. Mas NUNCA é chamado durante transição de fase.

---

### PROBLEMA 2: Contexto Acumulado Ausente (CRÍTICO)

**Sintoma:** Cada fase produz conteúdo desconectado das fases anteriores.

**Root Cause:** `proximo.ts` gera `resumo.json` e `resumo.md` com pontos-chave de cada entregável, mas esse resumo **nunca é incluído na resposta de transição de fase**. A IA da próxima fase não sabe o que foi decidido antes.

**Evidência:** O bloco de resposta em `proximo.ts:1246-1270` contém:
- Gate checklist ✅
- Specialist persona ✅
- Skill hydration command ✅
- **Resumo de entregáveis anteriores ❌**

**Impacto:** A fase de Segurança não sabe a stack definida na Arquitetura. A fase de Performance não sabe os SLOs definidos em Observabilidade.

---

### PROBLEMA 3: Padrão "Perguntar Primeiro" Contraproducente (ALTO)

**Sintoma:** IA pergunta → usuário diz "continue" → IA gera tudo sem input real.

**Root Cause:** `gerarInstrucaoContinuidade()` diz "NÃO GERE O ENTREGÁVEL COMPLETO AINDA" para TODAS as fases não-input_required. Mas o `PHASE_TYPE_MAP` classifica Requisitos, UX, Arquitetura, etc. como `derived` — que por definição não precisam de input do usuário.

**Contradição:**
```typescript
// flow-engine.ts:334-337 → derived = requires_user_input = false
if (phaseType === 'derived' || phaseType === 'technical') return false;

// instructions.ts:266 → mas a instrução diz para NÃO gerar
> ✋ NÃO GERE O ENTREGÁVEL COMPLETO AINDA
```

---

### PROBLEMA 4: Gate Validation com Keyword Matching Frágil (ALTO)

**Sintoma:** Gate da fase Contrato API falha com score 66/100 por "Versionamento definido" e "Breaking changes documentados".

**Root Cause:** `proximo.ts:699-713` extrai palavras-chave do item do checklist e verifica se existem literalmente no conteúdo:
```typescript
const keywords = item.toLowerCase().replace(/[^a-z...]/gi, '').split(/\s+/).filter(w => w.length > 3);
const matched = keywords.filter(kw => contentLowerForCheck.includes(kw));
const matchRatio = matched.length / keywords.length;
if (matchRatio >= 0.5) { itensValidadosGranular.push(`✅ ${item}`); }
```

Para "Versionamento definido" → keywords: ["versionamento", "definido"]. Um YAML com `version: 1.0.0` não contém "versionamento".

**Problema secundário:** Os itens do gate_checklist no fluxo complexo (flows/types.ts:359-363) usam português mas o conteúdo pode estar em inglês (YAML/código).

---

### PROBLEMA 5: Path Canônico Não Comunicado (MÉDIO)

**Sintoma:** IA cria `docs/07-arquitetura-avancada/` mas sistema salva em `docs/fase-07-arquitetura-avancada/`.

**Root Cause:** `getFaseDirName()` gera o formato canônico `fase-XX-nome`, mas esse path nunca é comunicado à IA antes da geração do entregável.

**Evidência:** O `.orientacoes-gate.md` é gerado no path canônico correto por `generateGateOrientationDoc()`, mas o path desse arquivo **não aparece na resposta** — só é logado no console.

---

### PROBLEMA 6: Entregável Passado como Argumento (MÉDIO)

**Sintoma:** IA passa conteúdo completo (15K+ chars) como parâmetro `entregavel`.

**Root Cause:** Apesar de instruções "NÃO passe o conteúdo via entregavel", a tool aceita o argumento e o processa. A IA ignora a instrução porque funciona.

**Fix v6.6 parcial:** Disco tem prioridade, mas argumento ainda é aceito como fallback.

---

## 3. Plano de Implementação — Sprint v7.1

### FIX 1: Injetar Conteúdo Real das Skills (CRÍTICO)
**Arquivo:** `src/src/middleware/skill-injection.middleware.ts`

**Mudança:** Substituir referência textual por conteúdo real via `SkillLoaderService.loadForPhase()`.

**Antes:**
```typescript
const hydrationCommand = formatSkillHydrationCommand(skillName, ide);
result.content[0].text += `\n\n## 🧠 Contexto do Especialista\n\n${hydrationCommand}`;
```

**Depois:**
```typescript
const skillLoader = new SkillLoaderService(new ContentResolverService(diretorio));
const contextPkg = await skillLoader.loadForPhase(faseInfo.nome, 'balanced');
if (contextPkg) {
    result.content[0].text += formatSkillContext(contextPkg, faseInfo, ide);
}
```

**Formato do contexto injetado:**
```markdown
## 🧠 Contexto do Especialista — {fase}

### Persona
{specialist.name} — {specialist.tone}

### Instruções da Skill
{skillContent resumido}

### Template do Entregável
{templateContent}

### Checklist de Validação
{checklistContent}

### 📁 Path para salvar o entregável
`docs/{faseDirName}/{entregavel_esperado}`
```

---

### FIX 2: Injetar Resumo de Entregáveis Anteriores (CRÍTICO)
**Arquivo:** `src/src/tools/proximo.ts` (bloco de resposta ~linha 1246)

**Mudança:** Adicionar seção "Contexto do Projeto" com resumo dos entregáveis anteriores.

**Fonte de dados:** `resumo.entregaveis[]` já tem `.resumo` e `.pontos_chave` por fase.

**Formato injetado:**
```markdown
## 📋 Contexto Acumulado do Projeto

### Decisões Anteriores (resumo)
| Fase | Entregável | Pontos-Chave |
|------|-----------|-------------|
| 1. Produto | PRD.md | Sistema de estoque, Next.js + Node.js, 50 empresas |
| 2. Requisitos | requisitos.md | RF-001 a RF-025, NFR-001 a NFR-010 |
| ... | ... | ... |

> ⚠️ Use estas decisões como base. NÃO contradiga o que já foi definido.
```

---

### FIX 3: Eliminar "Perguntar Primeiro" para Fases Derivadas (ALTO)
**Arquivo:** `src/src/utils/instructions.ts` — `gerarInstrucaoContinuidade()`

**Mudança:** Para fases `derived` e `technical`, gerar instrução de **geração autônoma** em vez de "não gere ainda".

**Antes:**
```typescript
> ✋ NÃO GERE O ENTREGÁVEL COMPLETO AINDA.
> Em vez disso, apresente ao usuário uma sugestão de esqueleto
```

**Depois (para derived/technical):**
```typescript
> ✅ Gate aprovado — Fase {X} concluída.
> **AÇÃO AUTÔNOMA:** Gere o entregável completo da fase "{proximaFase}" usando:
> 1. O template e checklist injetados acima
> 2. O contexto acumulado do projeto
> 3. As decisões das fases anteriores
> Salve em: `docs/{faseDirName}/{entregavel_esperado}`
> Depois chame: `executar({acao: "avancar"})`
```

---

### FIX 4: Melhorar Validação de Gate (ALTO)
**Arquivo:** `src/src/tools/proximo.ts` — bloco de keyword matching (~linha 699)

**Mudança:** Adicionar sinônimos e traduções pt↔en para gate checklist items.

**Implementação:**
```typescript
const KEYWORD_SYNONYMS: Record<string, string[]> = {
    'versionamento': ['version', 'versioning', 'semver', 'v1', 'v2'],
    'definido': ['defined', 'definida', 'especificado', 'configurado'],
    'breaking': ['breaking', 'incompatível', 'migração'],
    'documentados': ['documented', 'documentadas', 'registrados', 'changelog'],
    'openapi': ['openapi', 'swagger', 'api-spec'],
    'bounded': ['bounded', 'contexto', 'domínio'],
    'cqrs': ['cqrs', 'command', 'query', 'segregation'],
    'microserviços': ['microservices', 'microserviço', 'serviços'],
    // ... mais sinônimos por domínio
};
```

Também: matchRatio threshold de 0.5 → 0.35 para itens com poucos keywords.

---

### FIX 5: Incluir Path Canônico + Gate Orientation na Resposta (MÉDIO)
**Arquivo:** `src/src/tools/proximo.ts` — bloco de resposta (~linha 1246)

**Mudança:** Adicionar path canônico e referência ao `.orientacoes-gate.md`.

**Formato:**
```markdown
## 📁 Arquivos da Fase
| Tipo | Path |
|------|------|
| **Entregável** | `docs/fase-14-frontend/frontend-code` |
| **Orientações** | `docs/fase-14-frontend/.orientacoes-gate.md` |
| **Gate Checklist** | Ver seção acima |

> ⚠️ SALVE o entregável EXATAMENTE no path indicado.
> O sistema lê automaticamente do disco — NÃO passe conteúdo via argumento.
```

---

### FIX 6: Deprecar Argumento `entregavel` (MÉDIO)
**Arquivo:** `src/src/tools/proximo.ts`

**Mudança:** Emitir warning quando `entregavel` é passado como argumento e conteúdo > 500 chars.

```typescript
if (args.entregavel && args.entregavel.length > 500) {
    console.warn('[proximo] DEPRECATION: entregavel passado como argumento. Salve no disco primeiro.');
    // Ainda aceita como fallback, mas adiciona aviso na resposta
}
```

---

## 4. Arquivos Modificados

| # | Arquivo | Mudança | Prioridade |
|---|---------|---------|-----------|
| 1 | `middleware/skill-injection.middleware.ts` | Injetar conteúdo real via SkillLoaderService | 🔴 CRÍTICO |
| 2 | `tools/proximo.ts` (~linha 1246) | Adicionar contexto acumulado + path canônico | 🔴 CRÍTICO |
| 3 | `utils/instructions.ts` | Instrução autônoma para derived/technical | 🟠 ALTO |
| 4 | `tools/proximo.ts` (~linha 699) | Sinônimos + threshold ajustado no gate | 🟠 ALTO |
| 5 | `utils/gate-orientation.ts` | Sem mudança (já funcional) | — |
| 6 | Novo: `utils/gate-synonyms.ts` | Mapa de sinônimos pt↔en para gate items | 🟠 ALTO |

---

## 5. Critérios de Aceitação

1. **Build compila:** `npx tsc --noEmit` → exit code 0
2. **Testes passam:** `npm test` → 0 failures
3. **Teste manual:** Iniciar novo projeto, avançar fases 1→5, verificar:
   - Conteúdo da skill aparece na resposta (não apenas referência)
   - Resumo de fases anteriores aparece na transição
   - Fase `derived` gera entregável sem perguntar
   - Gate passa com conteúdo válido (sem keyword mismatch)
   - Path canônico aparece na instrução

---

## 6. Estimativa

| Fix | Complexidade | Tempo |
|-----|-------------|-------|
| FIX 1 (Skill injection) | Média | ~45min |
| FIX 2 (Contexto acumulado) | Média | ~30min |
| FIX 3 (Instrução autônoma) | Baixa | ~15min |
| FIX 4 (Gate synonyms) | Média | ~30min |
| FIX 5 (Path canônico) | Baixa | ~15min |
| FIX 6 (Deprecar arg) | Baixa | ~10min |
| **Total** | | **~2.5h** |
