# Plano de Comunicação MCP ↔ IA — v2 (Revisão Crítica)

**Data:** Fevereiro 2026  
**Status:** Plano Revisado — Pronto para Implementação  
**Substitui:** PLANO_COMUNICACAO_MCP_IA.md (v1)

---

## 1. Análise Crítica do Plano v1

### O que o plano v1 acertou
- Identificou corretamente que a IA não entende o formato esperado dos parâmetros
- Propôs separação de conteúdo (usuário vs IA) via annotations
- Reconheceu a necessidade de schemas explícitos

### O que o plano v1 errou ou superestimou

| Problema do v1 | Por quê está errado |
|----------------|---------------------|
| **IAInstructionService** como classe separada | Over-engineering. O `formatResponse` já existe e faz 90% disso. Criar outra camada adiciona complexidade sem ganho real. |
| **Annotations `audience: ["assistant"]`** como solução principal | O Windsurf **não suporta annotations nativas**. O fallback inline `🤖 [Para a IA]` é o que realmente funciona — e é exatamente o que já existe em `annotations-fallback.service.ts`. O problema não é falta de annotations, é que o **conteúdo das instruções é ambíguo**. |
| **Sistema de diálogo com estados** | O `flow-engine.ts` já implementa uma state machine completa com `ONBOARDING_FLOW` e `DEVELOPMENT_FLOW`. Criar outra camada de estados de diálogo seria duplicação. |
| **Protocolo de Mensagens Estratificado (PME)** | Conceito correto, mas na prática o MCP só retorna `content: [{type: "text", text: "..."}]`. Não existe canal separado. Tudo é texto. A estratificação precisa ser **dentro do Markdown**, não em camadas abstratas. |
| **Quick Reference Card** | Documentação para IA não funciona assim. A IA não "lê um manual". Ela interpreta o output da tool call anterior. A instrução precisa estar **na resposta da tool**, não num documento externo. |
| **4 sprints de implementação** | Escopo excessivo para o problema real. A maioria das correções são mudanças pontuais no formato de saída das tools. |

---

## 2. Diagnóstico Real do Problema

### 2.1 O que aconteceu na conversa de teste

```
Usuário: "inicie um projeto com o maestro"

IA → maestro({ diretorio: "/xampp/htdocs/cccrj" })

MCP retornou:
  "🎯 Maestro — Novo Projeto
   Nenhum projeto encontrado em /xampp/htdocs/cccrj. 🤖 [Para a IA]
   🤖 Instruções: Primeiro, vamos configurar suas preferências (IDE, modo, etc.)
   ▶️ Próximo Passo: Configurar preferências globais do Maestro
   setup_inicial()
   👤 Vamos configurar suas preferências (IDE, modo operacional, etc.)"

IA → maestro({ input: "setup_inicial()" })          ← ERRADO
IA → maestro({ acao: "setup_inicial" })              ← SEM PARÂMETROS
IA → maestro({ acao: "setup_inicial", input: "setup_inicial({...})" })  ← PARÂMETROS NO LUGAR ERRADO
```

### 2.2 As 5 causas raiz REAIS

**Causa 1: A IA não sabe QUAL tool chamar**
- O MCP diz `setup_inicial()` no bloco de próximo passo
- Mas `setup_inicial` é uma tool **legacy/interna** — não aparece na lista de tools públicas
- A IA só vê: `maestro`, `executar`, `validar`, `analisar`, `contexto`
- Então ela tenta chamar `maestro` com `acao: "setup_inicial"` — que é um hack

**Causa 2: O `maestro-tool.ts` aceita `acao: "setup_inicial"` mas espera `respostas`**
- Linha 76-84: extrai parâmetros de `args.respostas?.ide`, `args.respostas?.modo`
- A IA não sabe que precisa usar o campo `respostas` — nenhuma instrução diz isso
- O schema do `maestro` define `respostas` como `type: "object"` sem propriedades internas

**Causa 3: O formato do "Próximo Passo" é ambíguo**
- O bloco mostra: `setup_inicial()` como se fosse uma chamada de função
- A IA interpreta literalmente e tenta enviar como texto no campo `input`
- Deveria mostrar o **nome da tool pública** com os **parâmetros exatos**

**Causa 4: Muitos passos para algo simples**
- Para criar um projeto, o fluxo atual exige: setup_inicial → iniciar_projeto → confirmar_projeto → onboarding
- São 4+ tool calls antes de qualquer coisa útil acontecer
- A IA se perde no meio do caminho

**Causa 5: O MCP instrui a IA a fazer coisas que ela não consegue**
- `confirmar_projeto` retorna JSON de estado e pede para a IA "criar arquivos"
- A IA precisa copiar JSON gigante e usar `write_to_file` — propenso a erro
- O MCP deveria **salvar os arquivos diretamente** (já tem acesso ao filesystem)

---

## 3. Princípios do Plano Revisado

### P1: A IA só conhece as 5 tools públicas
Toda instrução de "próximo passo" DEVE referenciar uma das 5 tools públicas:
`maestro`, `executar`, `validar`, `analisar`, `contexto`.

Nunca referenciar tools internas como `setup_inicial`, `iniciar_projeto`, `confirmar_projeto`.

### P2: Parâmetros explícitos no formato da tool pública
Em vez de:
```
setup_inicial({ ide: "windsurf", modo: "balanced" })
```

Mostrar:
```
executar({
  diretorio: "/xampp/htdocs/cccrj",
  acao: "avancar",
  respostas: { ide: "windsurf", modo: "balanced", usar_stitch: false }
})
```

### P3: O MCP salva seus próprios arquivos
O MCP tem acesso ao filesystem via `fs`. Não pedir para a IA criar arquivos de estado.
O campo `files` no retorno é um anti-pattern — a IA frequentemente ignora ou erra.

### P4: Reduzir passos ao mínimo
Combinar setup_inicial + iniciar_projeto + confirmar_projeto em um único fluxo
quando possível (especialmente com `confirmar_automaticamente: true`).

### P5: Instruções são imperativas, não descritivas
Em vez de: "Vamos configurar suas preferências (IDE, modo operacional, etc.)"
Usar: "Execute: `maestro({ diretorio: '...', acao: 'setup', respostas: { ide: 'windsurf', modo: 'balanced', usar_stitch: false } })`"

---

## 4. Mudanças Técnicas Necessárias

### 4.1 Refatorar `handleNoProject` em `maestro-tool.ts`

**Problema:** Referencia `setup_inicial` (tool interna) no próximo passo.  
**Solução:** Referenciar `maestro` com parâmetros explícitos.

```typescript
// ANTES (problemático)
proximo_passo: {
  tool: "setup_inicial",
  descricao: "Configurar preferências globais do Maestro",
  args: "",
  requer_input_usuario: true,
  prompt_usuario: "Vamos configurar suas preferências (IDE, modo operacional, etc.)"
}

// DEPOIS (claro para a IA)
proximo_passo: {
  tool: "maestro",
  descricao: "Configurar preferências e iniciar projeto",
  args: `diretorio: "${diretorio}", acao: "setup_inicial", respostas: { ide: "windsurf", modo: "balanced", usar_stitch: false }`,
  requer_input_usuario: true,
  prompt_usuario: "Pergunte ao usuário: Qual IDE usa? (windsurf/cursor) Qual modo prefere? (economy/balanced/quality)"
}
```

### 4.2 Refatorar `setup-inicial.ts` — Salvar config diretamente

**Problema:** Retorna instruções para a IA salvar config.  
**Solução:** Salvar diretamente via `saveUserConfig` (já faz isso!) e retornar confirmação + próximo passo claro.

O `setupInicial` já salva via `saveUserConfig`. O problema é quando parâmetros estão faltando — o bloco de "como preencher" usa formato de função JS que a IA não sabe mapear para tool call.

```typescript
// ANTES (ambíguo)
text: `setup_inicial({
  ide: "windsurf",
  modo: "balanced",
  usar_stitch: false
})`

// DEPOIS (tool call explícita)
text: `maestro({
  diretorio: "<diretorio>",
  acao: "setup_inicial",
  respostas: {
    "ide": "windsurf",
    "modo": "balanced", 
    "usar_stitch": false
  }
})`
```

### 4.3 Refatorar `iniciar-projeto.ts` — Persistência direta

**Problema:** Retorna JSON de estado e pede para IA criar arquivos.  
**Solução:** Salvar `estado.json`, `resumo.json`, `resumo.md` diretamente no filesystem.

```typescript
// ANTES (linhas 459-523 de iniciar-projeto.ts)
// Retorna JSON no texto e espera que a IA salve

// DEPOIS
import { writeFile, mkdir } from "fs/promises";

// Salvar diretamente
const maestroDir = join(diretorio, ".maestro");
await mkdir(maestroDir, { recursive: true });
await writeFile(join(maestroDir, "estado.json"), estadoFile.content, "utf-8");
for (const f of resumoFiles) {
  await writeFile(join(maestroDir, f.path.replace(".maestro/", "")), f.content, "utf-8");
}

// Retornar apenas confirmação
text: `# ✅ Projeto Criado: ${args.nome}
Arquivos salvos em: ${maestroDir}/
- estado.json ✅
- resumo.json ✅  
- resumo.md ✅`
```

### 4.4 Padronizar formato do bloco "Próximo Passo"

Criar helper dedicado que SEMPRE gera o formato correto:

```typescript
// src/utils/next-step-formatter.ts

export function formatNextStep(config: {
  tool: string;           // DEVE ser uma das 5 tools públicas
  args: Record<string, unknown>;
  userPrompt: string;
  autoExecute?: boolean;
}): string {
  // Validar que é tool pública
  const PUBLIC_TOOLS = ["maestro", "executar", "validar", "analisar", "contexto"];
  if (!PUBLIC_TOOLS.includes(config.tool)) {
    console.error(`[WARN] Próximo passo referencia tool não-pública: ${config.tool}`);
  }

  const argsFormatted = JSON.stringify(config.args, null, 2);
  
  return `## ▶️ Próximo Passo

${config.autoExecute ? "🤖 **Execute automaticamente:**" : "👤 **Pergunte ao usuário e depois execute:**"}

${config.userPrompt ? `> ${config.userPrompt}\n` : ""}
\`\`\`json
${config.tool}(${argsFormatted})
\`\`\``;
}
```

### 4.5 Simplificar fluxo de criação de projeto

**Fluxo atual (4+ steps):**
```
maestro() → setup_inicial() → iniciar_projeto() → confirmar_projeto() → onboarding
```

**Fluxo proposto (2 steps):**
```
maestro({ acao: "criar_projeto" })
  → Pergunta nome/descrição ao usuário
  → Usa config global (ou defaults) para ide/modo
  → Cria projeto + estado + resumo automaticamente
  → Inicia discovery direto

executar({ acao: "avancar", respostas: {...} })
  → Continua o discovery
```

Implementar como nova ação no `maestro-tool.ts`:

```typescript
if (args.acao === "criar_projeto") {
  // 1. Carregar config global (ou usar defaults)
  const config = await loadUserConfig() || { ide: "windsurf", modo: "balanced", usar_stitch: false };
  
  // 2. Extrair nome/descrição do input ou respostas
  const nome = args.respostas?.nome as string;
  const descricao = args.respostas?.descricao as string;
  
  if (!nome) {
    return formatResponse({
      titulo: "🎯 Novo Projeto",
      resumo: "Informe o nome e descrição do projeto.",
      proximo_passo: {
        tool: "maestro",
        descricao: "Criar projeto com nome e descrição",
        args: `{ "diretorio": "${args.diretorio}", "acao": "criar_projeto", "respostas": { "nome": "<nome>", "descricao": "<descrição>" } }`,
        requer_input_usuario: true,
        prompt_usuario: "Qual o nome e uma breve descrição do projeto?"
      }
    });
  }
  
  // 3. Criar projeto diretamente (setup + iniciar + confirmar em 1 passo)
  return await criarProjetoCompleto({ nome, descricao, diretorio: args.diretorio, config });
}
```

### 4.6 Melhorar descriptions das tools públicas

As descriptions são o que a IA vê ao decidir qual tool chamar. Precisam ser mais prescritivas:

```typescript
// ANTES
description: "🎯 Entry point inteligente do Maestro. Detecta contexto e guia o próximo passo."

// DEPOIS  
description: "🎯 Entry point do Maestro. Sem projeto: cria novo (acao='criar_projeto', respostas={nome, descricao}). Com projeto: retorna status e próximo passo. Para setup: acao='setup_inicial', respostas={ide, modo, usar_stitch}."
```

```typescript
// ANTES
description: "⚡ Executa ações no projeto. acao='avancar' (padrão): avança fase/onboarding."

// DEPOIS
description: "⚡ Executa ações no projeto. acao='avancar': avança fase (com entregavel ou respostas). acao='salvar': salva conteúdo (requer conteudo). acao='checkpoint': gerencia checkpoints."
```

### 4.7 Schema do `maestro` com propriedades internas de `respostas`

O schema atual define `respostas` como `type: "object"` sem propriedades. A IA não sabe o que colocar dentro.

```typescript
// ANTES
respostas: {
  type: "object",
  description: "Respostas de formulário (opcional)",
}

// DEPOIS
respostas: {
  type: "object",
  description: "Parâmetros estruturados. Para setup: {ide, modo, usar_stitch}. Para criar_projeto: {nome, descricao}. Para onboarding: respostas do bloco atual.",
  properties: {
    ide: { type: "string", enum: ["windsurf", "cursor", "antigravity"] },
    modo: { type: "string", enum: ["economy", "balanced", "quality"] },
    usar_stitch: { type: "boolean" },
    nome: { type: "string" },
    descricao: { type: "string" },
  },
}
```

---

## 5. Mudanças no `formatResponse`

### 5.1 Bloco de instruções mais direto

```typescript
// ANTES: instrução genérica
instrucoes: "Primeiro, vamos configurar suas preferências (IDE, modo, etc.)"

// DEPOIS: instrução imperativa com tool call exata
instrucoes: `EXECUTE a seguinte tool call:
maestro({ diretorio: "${diretorio}", acao: "setup_inicial", respostas: { ide: "windsurf", modo: "balanced", usar_stitch: false } })

ANTES de executar, pergunte ao usuário:
1. Qual IDE você usa? (windsurf/cursor)
2. Qual modo prefere? (economy=rápido / balanced=equilibrado / quality=completo)
3. Deseja usar Stitch para prototipagem? (sim/não)`
```

### 5.2 Nunca mostrar tool calls internas no output

Adicionar validação no `formatResponse`:

```typescript
const PUBLIC_TOOLS = new Set(["maestro", "executar", "validar", "analisar", "contexto"]);

if (opts.proximo_passo && !PUBLIC_TOOLS.has(opts.proximo_passo.tool)) {
  console.error(`[WARN] proximo_passo referencia tool interna: ${opts.proximo_passo.tool}`);
  // Remapear para tool pública equivalente
  opts.proximo_passo.tool = remapToPublicTool(opts.proximo_passo.tool);
}
```

---

## 6. Checklist de Implementação

### Sprint Único (estimativa: 1-2 dias)

#### Bloco A: Persistência Direta (elimina "crie estes arquivos")
- [ ] **A.1** `iniciar-projeto.ts`: Salvar estado.json/resumo diretamente via fs
- [ ] **A.2** Remover campo `files` do retorno (ou manter apenas como backup)
- [ ] **A.3** Remover bloco "AÇÃO OBRIGATÓRIA - Criar Arquivos" do output

#### Bloco B: Próximo Passo Correto (elimina referências a tools internas)
- [ ] **B.1** Criar `next-step-formatter.ts` com validação de tool pública
- [ ] **B.2** `maestro-tool.ts` → `handleNoProject`: referenciar `maestro` ao invés de `setup_inicial`
- [ ] **B.3** `setup-inicial.ts`: formato de "como preencher" usar tool call de `maestro`
- [ ] **B.4** `flow-engine.ts`: transições referenciar tools públicas
- [ ] **B.5** `iniciar-projeto.ts`: próximo passo usar `executar` ao invés de `onboarding_orchestrator`

#### Bloco C: Fluxo Simplificado (reduz steps de 4+ para 2)
- [ ] **C.1** `maestro-tool.ts`: nova ação `criar_projeto` que combina setup+iniciar+confirmar
- [ ] **C.2** Auto-detectar config global e usar defaults quando possível
- [ ] **C.3** Atualizar description do `maestro` com ações disponíveis

#### Bloco D: Schema Explícito (IA sabe o que enviar)
- [ ] **D.1** `maestro-tool.ts`: schema de `respostas` com propriedades internas
- [ ] **D.2** `executar.ts`: melhorar description com exemplos de uso
- [ ] **D.3** Instruções no formato imperativo ("EXECUTE", "PERGUNTE")

#### Bloco E: Validação
- [ ] **E.1** Build sem erros
- [ ] **E.2** Teste manual: "inicie um projeto com o maestro" funciona em 2 steps
- [ ] **E.3** Teste manual: fluxo de onboarding completo sem loops

---

## 7. Comparação: Antes vs Depois

### Antes (fluxo problemático)
```
Usuário: "inicie um projeto"
IA → maestro({ diretorio: "/path" })
MCP: "Nenhum projeto. Execute setup_inicial()"     ← tool interna!
IA → maestro({ acao: "setup_inicial" })              ← sem parâmetros
MCP: "Informe ide, modo, usar_stitch"
IA → maestro({ input: "setup_inicial({...})" })      ← formato errado
MCP: "Informe ide, modo, usar_stitch"                ← LOOP
[... 5+ tentativas ...]
```

### Depois (fluxo corrigido)
```
Usuário: "inicie um projeto"
IA → maestro({ diretorio: "/path" })
MCP: "Nenhum projeto. Pergunte ao usuário nome/descrição.
      EXECUTE: maestro({ diretorio: '/path', acao: 'criar_projeto', 
               respostas: { nome: '<nome>', descricao: '<desc>' } })"
IA: "Qual o nome e descrição do projeto?"
Usuário: "CCCRJ - sistema de gestão do clube"
IA → maestro({ diretorio: "/path", acao: "criar_projeto", 
              respostas: { nome: "CCCRJ", descricao: "sistema de gestão do clube" } })
MCP: "✅ Projeto criado! Arquivos salvos. Discovery iniciado.
      EXECUTE: executar({ diretorio: '/path', acao: 'avancar', 
               respostas: { campo1: '...', campo2: '...' } })"
[... fluxo continua normalmente ...]
```

**Resultado:** 2 tool calls ao invés de 5+, zero loops, zero ambiguidade.

---

## 8. Prioridade de Implementação

| Prioridade | Bloco | Impacto | Esforço |
|------------|-------|---------|---------|
| 🔴 P0 | **B.2** handleNoProject | Elimina o bug principal | 15 min |
| 🔴 P0 | **B.3** setup-inicial formato | Elimina loop de parâmetros | 15 min |
| 🔴 P0 | **D.1** Schema de respostas | IA sabe o que enviar | 10 min |
| 🟡 P1 | **C.1** Ação criar_projeto | Reduz steps de 4→2 | 1 hora |
| 🟡 P1 | **A.1** Persistência direta | Elimina "crie arquivos" | 30 min |
| 🟡 P1 | **B.1** next-step-formatter | Previne regressões | 30 min |
| 🟢 P2 | **B.4** flow-engine tools públicas | Consistência | 20 min |
| 🟢 P2 | **C.3** Description melhorada | IA escolhe melhor | 10 min |
| 🟢 P2 | **D.3** Instruções imperativas | Clareza | 20 min |

**Tempo total estimado: ~3-4 horas** (vs 4 semanas do plano v1)

---

## 9. Conclusão

O plano v1 tentou resolver um problema de **formato de mensagem** com **arquitetura de software**. 
O problema real é mais simples:

1. **O MCP diz para a IA chamar tools que ela não pode chamar** → Corrigir referências
2. **O MCP não diz COMO passar os parâmetros** → Schema explícito + exemplo de tool call
3. **O MCP pede para a IA fazer coisas que o MCP deveria fazer** → Persistência direta
4. **São muitos passos para começar** → Combinar em ação única

Não precisamos de novos serviços, novas camadas de abstração, ou protocolos de comunicação.
Precisamos que **cada resposta do MCP contenha a tool call exata que a IA deve executar**.

---

**Fim do Documento**
