# Implementação das Próximas Melhorias (v5) + Guia do Modo Híbrido

**Data:** 06/02/2026  
**Base:** `ANALISE_COMPLETA_V4.md`  
**Objetivo:** detalhar uma implementação robusta das melhorias prioritárias (Sprints A–F), com foco em **consumo ativo de skills** e **uso do modo híbrido** (conteúdo local injetado + leitura/injeção interna pelo Maestro) sem problemas de tokens ou perda de contexto.

---

## 1. Conceitos e Fontes de Verdade (v4 → v5)

### 1.1 O problema que a v5 precisa resolver

Na v4, existe um acervo enorme em `content/skills/` e uma estratégia de injeção de conteúdo para IDE (ex.: `.windsurf/skills`, `.cursor/skills`, `.agent/skills`). Porém, o principal gargalo é:

- O Maestro **orienta** a IA a ler skills/templates/checklists.
- Mas o Maestro **não consome** (não lê, não seleciona, não injeta) o conteúdo relevante das skills nas respostas.
- Em contextos longos/modelos menores, a IA ignora ou não consegue seguir essa “leitura manual”, causando **perda de qualidade**.

A v5 deve tornar o fluxo:

- **Determinístico** (o orquestrador decide).
- **Context-aware** (injeta somente o necessário).
- **Token-safe** (orçamento de contexto e progressive disclosure).

### 1.2 “Planos” de conteúdo (onde as coisas vivem)

O Maestro atualmente lida com pelo menos 3 “planos” de conteúdo, que precisam ficar claros para o modo híbrido:

- **Plano A — Conteúdo do servidor (built-in):**
  - Fonte: `.../Maestro/content/`
  - Ex.: `content/rules/RULES.md`, `content/skills/specialist-*/SKILL.md`, `content/workflows/*.md`

- **Plano B — Conteúdo interno do projeto (injetado):**
  - Fonte: `<projeto>/.maestro/content/`
  - Criado pela tool `injetar_conteudo()` (ou CLI equivalente)
  - Ideal para:
    - Trabalhar offline
    - Fixar versão do conteúdo por projeto
    - Evitar dependência da instalação do servidor

- **Plano C — Conteúdo da IDE (skills/workflows/rules):**
  - Fonte típica:
    - Windsurf: `.windsurf/skills`, `.windsurf/workflows`, `.windsurfrules`
    - Cursor: `.cursor/skills`, `.cursor/commands`, `.cursorrules`
    - Antigravity: `.agent/skills`, `.agent/workflows`, `.gemini/GEMINI.md`
  - Hoje esse plano é usado para:
    - Permitir `@skill` na IDE
    - Disponibilizar workflows e regras para o modelo via IDE

**Ponto-chave do modo híbrido:**
- A IDE precisa do Plano C.
- O Maestro (MCP server) precisa ler de forma **autônoma** o Plano B (preferencial) ou Plano A (fallback).

---

## 2. Guia Prático: Como Usar o Modo Híbrido (hoje e na v5)

### 2.1 Objetivo do modo híbrido

O modo híbrido existe para:

- **Injetar conteúdo localmente no projeto** (Plano B e/ou C).
- Permitir que o Maestro:
  - **leia internamente** especialistas, prompts, templates e checklists
  - **injete ativamente** o necessário no contexto da IA
  - sem depender da IA abrir arquivos manualmente.

### 2.2 Passo a passo (operação)

#### Passo 1 — Injetar conteúdo interno no projeto (Plano B)

Use a tool MCP:

- `injetar_conteudo(diretorio: "<path-do-projeto>")`

Resultado esperado:
- Cria `<projeto>/.maestro/content/` com a cópia do conteúdo do servidor.

Observação:
- Se já existir, a tool retorna “conteúdo já existe”. Para sobrescrever:
  - `force: true`

#### Passo 2 — Injetar conteúdo para a IDE (Plano C)

Hoje essa etapa normalmente é feita via CLI (ex.: `npx @maestro-ai/cli`) ou rotinas internas que chamam `injectContentForIDE()`.

Resultado esperado:
- Regras (`.windsurfrules` / `.cursorrules` / `.gemini/GEMINI.md`)
- Workflows (`.windsurf/workflows`, `.cursor/commands`, `.agent/workflows`)
- Skills adaptadas (`.windsurf/skills`, `.cursor/skills`, `.agent/skills`)

**Recomendação v5 (robusta):**
- Continuar injetando *rules* e *workflows*.
- Tornar a injeção de *skills* opcional (ou “mínima por fase”) para reduzir peso e duplicação.

#### Passo 3 — Usar o Maestro como entry point

- Chame `maestro(diretorio: "<path>")`.
- Siga o `next_action`.

**Na v5**, a expectativa é:
- O `next_action` já vir acompanhado do **pacote de contexto** (skill + template + checklist) necessário para a próxima fase.

---

## 3. Como o Maestro deve “ler internamente” e injetar skills/prompts/templates (design v5)

### 3.1 Princípio: o MCP não pede “leitura manual” para a IA

Hoje existem mensagens do tipo:
- “Leia `SKILL.md` em `.windsurf/skills/...`”

Na v5, a regra deve ser:

- **Se o Maestro precisa do conteúdo, o Maestro lê e injeta.**

Apenas em fallback (sem budget de tokens / sem arquivo / erro) o Maestro pede leitura manual.

### 3.2 Resolver de Conteúdo (Content Resolver)

Criar um serviço único responsável por:

- Descobrir qual root usar (prioridade):
  1) `<projeto>/.maestro/content` (Plano B)
  2) `.../Maestro/content` (Plano A)

E expor APIs simples:

- `resolveSkillDir(skillName): string`
- `readSkillSkillMd(skillName): string`
- `listSkillResources(skillName, tipo): string[]`
- `readSkillResource(skillName, tipo, arquivo): string`
- `getContentFingerprint(): { version, hash }` (para cache e invalidação)

**Por que isso é crítico?**
- Hoje existem indícios de “duas realidades”:
  - existe tool `injetar_conteudo()` que cria `.maestro/content`
  - mas várias rotas de leitura usam o content do servidor (fallback), e não priorizam o content local

O modo híbrido só é real se o Maestro usar o Plano B como fonte preferencial.

### 3.3 Skill Loader Service (injeção ativa)

Implementar `SkillLoaderService` para montar um “pacote” por fase:

Entrada:
- `faseNome` (ex.: "Arquitetura")
- `ide` (para compatibilidade de paths e mensagens)
- `mode` (economy/balanced/quality)

Saída (estrutura):
- `skillName`
- `skillText` (selecionado e/ou resumido)
- `templateText` (ou skeleton)
- `checklistText`
- `referenceLinks` (URIs MCP resources e/ou paths IDE)
- `tokenEstimate` (estimativa aproximada)

**Integração prevista:**
- `maestroTool()`
- `proximo()`
- `validar_gate()`

### 3.4 Prompt injection (MCP Prompts) vs fallback “content text”

Existem 2 mecanismos válidos:

- **A) MCP Prompts (preferido quando suportado pela IDE):**
  - O server registra prompts como:
    - `maestro-specialist` (persona + instruções)
    - `maestro-template` (template da fase)
    - `maestro-checklist` (gate checklist)

- **B) Fallback universal (sempre funciona):**
  - O Maestro inclui o conteúdo na resposta (`content: [{ type: "text", text: ... }]`).

A v5 deve suportar ambos:
- Prompts para IDEs compatíveis.
- Fallback de texto para compatibilidade total.

---

## 4. Estratégia Anti-Tokens e Anti-Perda de Contexto (obrigatória)

### 4.1 Regra #1 — Nunca injetar “tudo”

O acervo é grande. A v5 deve operar com **progressive disclosure**:

- Injetar apenas o necessário para:
  - a fase atual
  - a ação atual
  - o entregável atual

### 4.2 Orçamento de contexto por modo

Definir budgets (ajustáveis) por `estado.config.mode`:

- **economy:** ~800–1500 tokens úteis de contexto extra por resposta
- **balanced:** ~2000–4000 tokens
- **quality:** ~4000–8000 tokens

**O orçamento precisa ser aplicado em 3 camadas:**

- **Camada 1:** Persona (curta)
- **Camada 2:** Instruções do especialista (selecionadas)
- **Camada 3:** Template + Checklist

Se o budget estourar:
- degradar template para “skeleton” (somente títulos)
- degradar skill para “seções essenciais”
- manter checklist sempre (é curto e aumenta confiabilidade)

### 4.3 Chunking por seções (em vez de texto inteiro)

O `SKILL.md` e recursos devem ser tratados como documentos com seções:

- Parsear headings Markdown (`#`, `##`, `###`) e construir um índice:
  - `[{ heading, start, end, charCount, tokenEstimate }]`

Estratégia de seleção:

- Sempre incluir:
  - “Como trabalhar” / “Processo” / “Regras”
- Incluir condicionalmente:
  - exemplos (somente se usuário pedir)
  - referências longas (somente se necessário)

### 4.4 Cache, fingerprint e “contexto incremental”

Para evitar re-injetar o mesmo conteúdo a cada chamada:

- Calcular `fingerprint` do conteúdo (hash por skill e recursos)
- Armazenar no estado (`.maestro/estado.json`):
  - `context_cache`:
    - `skillName -> { fingerprint, last_injected_at, summary }`

Política:
- Se `fingerprint` não mudou e a fase é a mesma:
  - injetar somente um resumo curto + lembrete do template/checklist

### 4.5 Sumarização progressiva por fase

Ao final de cada fase, o Maestro deve salvar (via `StateService.saveFile`):

- `.maestro/resumos/fase_<n>_resumo.md`

Conteúdo:
- decisões
- trade-offs
- riscos
- links para entregáveis

Isso reduz perda de contexto sem precisar manter todo o histórico em tokens.

---

## 5. Implementação detalhada por Sprint (v5)

## Sprint A — Skill Content Injection Ativo (maior impacto)

### Resultado esperado
- `proximo()` e/ou `maestro()` passam a retornar, junto do `next_action`, um bloco de contexto **já pronto**:
  - skill (trechos essenciais)
  - template
  - checklist

### Mudanças recomendadas

1) Criar `ContentResolverService`
- Prioriza `.maestro/content` quando existir.
- Fallback para `content/` do servidor.

2) Criar `SkillLoaderService`
- `loadForPhase(faseNome, mode)` → retorna pacote estruturado.

3) Atualizar `proximo.ts`
- Quando detectar fase e skill obrigatória:
  - em vez de apenas “verificar se SKILL.md existe”, ler e injetar o conteúdo (com budget).

4) Atualizar `validar-gate.ts`
- Injetar checklist e/ou template usados na validação.

5) Atualizar `maestro-tool.ts`
- Mostrar persona e, opcionalmente, um bloco “Contexto recomendado da fase” (curto).

### Observação importante (ajuste estrutural)
Há um desalinhamento comum em codebases desse tipo:

- Funções como `lerTemplate/lerGuia/lerPrompt` assumem pastas `content/templates`, `content/guides`, `content/prompts`.
- Mas o conteúdo real pode estar organizado **dentro das skills** (`content/skills/<skill>/resources/...`).

A v5 deve escolher UMA convenção (recomendado):

- **Templates/checklists por skill** (em `resources/`).
- E o `SkillLoaderService` é quem resolve qual arquivo usar.

## Sprint B — Consolidação real de tools (45 → 8 + legadas)

### Resultado esperado
- A IDE lista apenas ferramentas “públicas” (ex.: `maestro`, `avancar`, `status`, `validar`, `salvar`, `contexto`, `checkpoint`, `analisar`).
- As tools legadas continuam funcionando como aliases internos.

### Mudanças recomendadas
- `router.ts` separa “public tools” vs “legacy tools”.
- `ListTools` retorna somente as públicas.
- `CallTool` continua aceitando as legadas.

## Sprint C — Integração real do Flow Engine + StateService

### Resultado esperado
- As tools passam a:
  - carregar estado automaticamente de `.maestro/estado.json` quando possível
  - salvar estado automaticamente após mudanças
  - calcular `next_action` sempre via flow engine (sem duplicação)

### Mudanças recomendadas
- Middlewares no roteamento:
  - `withStateLoad()`
  - `withPersistence()`
  - `withNextActionFromFlowEngine()`
  - `withErrorHandling()`

## Sprint D — Otimização do sistema de skills (peso, versionamento, robustez)

### Resultado esperado
- Evitar copiar 374 skills para cada projeto quando não necessário.
- Habilitar 2 perfis:

- **Perfil 1 (Híbrido / pinned):**
  - usa `.maestro/content` como fonte preferencial
  - ideal para times que querem versionamento por projeto

- **Perfil 2 (Server-first):**
  - não injeta skills no projeto
  - lê direto do servidor via resources

### Mudanças recomendadas
- Manifesto de versão:
  - `.maestro/content/.version.json` (semver + hash)

## Sprint E — MCP Prompts (system prompt automático)

### Resultado esperado
- A IDE (quando suportar prompts) recebe automaticamente:
  - persona
  - template
  - checklist

### Mudanças recomendadas
- Implementar handlers MCP de `prompts`.
- Prompts dinâmicos com base no estado atual.

## Sprint F — Testes + CI

### Resultado esperado
- Cobertura para:
  - flow engine
  - state service
  - content resolver
  - skill loader
  - roteamento (public vs legacy tools)

---

## 6. Como “usar o Maestro para injetar ativamente na IA” (procedimento operacional recomendado)

### Procedimento em fase (v5)

1) A IA chama `maestro(diretorio)`.
2) O Maestro responde com:
- `specialist_persona`
- `next_action`
- `context_package` (novo) com:
  - `skill_core`
  - `template`
  - `checklist`

3) A IA gera o entregável **seguindo o template já injetado**.
4) A IA chama `validar`/`validar_gate`.
5) O Maestro valida, salva e avança.

### Fallback token-safe

Se `context_package` ficar grande:

- O Maestro injeta:
  - resumo
  - títulos do template
  - checklist
  - URIs `maestro://...` para leitura sob demanda

---

## 7. Checklist de “não quebrar por tokens” (resumo)

- **Nunca** injetar todas as skills.
- **Sempre** ter budget por modo (economy/balanced/quality).
- **Sempre** parsear e selecionar seções.
- **Sempre** cachear por fingerprint.
- **Sempre** salvar resumos por fase para preservar contexto.

---

## 8. Próximas decisões (abertas)

- O projeto vai padronizar templates/checklists como:
  - `content/templates` (global)
  - ou `content/skills/<skill>/resources/templates` (por skill)?

- Qual a estratégia de “mínima injeção” para Plano C?
  - copiar todas as skills para IDE (pesado)
  - ou copiar só as skills do fluxo escolhido (recomendado)

- Como versionar conteúdo por projeto no modo híbrido?
  - semver + hash em `.maestro/content/.version.json`

