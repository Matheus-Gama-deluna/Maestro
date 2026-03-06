# Diagnóstico: Menções de Arquivo e Recursos — v7.2

> Data: 2026-02-26 | Autor: Cascade | Base: Análise do projeto de teste + código-fonte

---

## 1. Filosofia do Sistema

O Maestro usa **menções de arquivo nativas da IDE** (`#path` no Windsurf, `@path` no Cursor) para forçar a IA a **ler** os recursos em vez de injetá-los na resposta. Isso:
- **Economiza tokens** — conteúdo não é duplicado na resposta do MCP
- **Garante contexto atualizado** — IA lê a versão mais recente do arquivo
- **Usa capacidades nativas** — cada IDE interpreta menções de forma diferente

### Fluxo Correto
```
MCP gera resposta → inclui menções #path/to/SKILL.md → IA lê o arquivo → IA assume persona
```

### Fluxo ERRADO (v7.1 FIX 1)
```
MCP carrega SKILL.md via SkillLoaderService → injeta conteúdo na resposta → IA recebe tudo inline
```
O FIX 1 da v7.1 QUEBROU a filosofia ao injetar conteúdo diretamente. Precisa ser revertido.

---

## 2. Análise do Projeto de Teste

### 2.1 Estrutura de Diretórios
Projeto: `c:/Users/gamam/OneDrive/Documentos/1- TramposTec/teste`
- 13 fases concluídas (de 18), fase 14 (Frontend) em andamento
- 36 arquivos de entregáveis criados em `docs/`
- Skills copiadas mas com **diretórios VAZIOS** em `.windsurf/skills/`
- `.windsurfrules` presente (16KB) — rules injetadas OK

### 2.2 Entregáveis — Qualidade
| Fase | Entregável | Qualidade | Observações |
|------|-----------|-----------|-------------|
| 1 - Produto | PRD.md | ✅ Bom | Segue estrutura do template |
| 2 - Requisitos | requisitos.md | ✅ Bom | Critérios de aceite, matriz |
| 3 - UX Design | design-doc.md | ✅ Bom | Jornada, wireframes, protótipos |
| 4 - Modelo Domínio | modelo-dominio.md | ✅ Bom | Entidades, agregados, linguagem ubíqua |
| 5 - Banco de Dados | design-banco.md | ✅ Bom | Schema SQL, índices, constraints |
| 6 - Arquitetura | arquitetura.md | ✅ Bom | C4, stack, ADRs — segue template |
| 12 - Backlog | backlog.md | ✅ Bom | Épicos, features, sprints |
| 13 - Contrato API | openapi.yaml | ❌ Resumo | Markdown resumo, não YAML real |

### 2.3 Problemas Identificados na Estrutura

**P1: Diretórios duplicados**
- `docs/01-produto/` E `docs/fase-01-produto/` — mesmo conteúdo, paths diferentes
- `docs/04-prototipagem/` E `docs/fase-04-modelo-de-dominio/`
- Causa: SKILL.md referencia `docs/01-produto/` mas proximo.ts salva em `docs/fase-01-produto/`

**P2: Skills locais VAZIAS**
- `.windsurf/skills/specialist-*/` — 62 diretórios criados, todos com 0 arquivos
- `injectContentForIDE()` criou estrutura mas falhou na cópia do conteúdo
- Consequência: menções `#.windsurf/skills/*/SKILL.md` apontam para arquivos inexistentes

**P3: resumo.json incompleto**
- Apenas fase 13 presente — fases 1-12 perdidas
- `serializarResumo()` sobrescreve em vez de acumular

---

## 3. Bugs Identificados no Código

### BUG 1 (CRÍTICO): `formatSkillHydrationCommand` usa `process.cwd()` em vez de `projectDir`

**Arquivo:** `src/src/utils/ide-paths.ts` linha 170
```typescript
const resourcesAbsDir = join(process.cwd(), resourcesRelDir);
```

**Problema:** `process.cwd()` é o diretório do MCP server (npm global), NÃO o diretório do projeto. `getAllMdFiles()` nunca encontra os resources.

**Resultado:** Hydration command só menciona SKILL.md, mas **NUNCA** menciona templates, checklists ou exemplos.

**Fix:** Aceitar `projectDir` como parâmetro e usar para resolver paths.

### BUG 2 (CRÍTICO): Templates e checklists NUNCA mencionados

**Causa:** Consequência direta do BUG 1. A IA lê SKILL.md que DIZ "Use template: `resources/templates/arquitetura.md`" mas o MCP não gera menção `#path` para esse arquivo.

**Resultado no teste:** A IA seguiu a ESTRUTURA do template (seções similares) mas nunca o leu diretamente. Alguns entregáveis (ex: fase 13) são resumos em vez de documentos completos.

### BUG 3 (ALTO): Entregáveis anteriores não mencionados como referência

**Problema:** Na transição de fase, SKILL.md lista "Inputs obrigatórios" (ex: PRD, Requisitos) mas o MCP não gera menções para esses arquivos.

**Resultado:** A IA pode ou não ler os entregáveis anteriores. Depende da memória da conversa.

**Fix:** Gerar menções `#path` para os entregáveis das fases anteriores na resposta de transição.

### BUG 4 (MÉDIO): `.orientacoes-gate.md` gerado mas nunca mencionado

**Problema:** `generateGateOrientationDoc()` cria o arquivo mas nenhuma menção `#path` é gerada para ele.

**Fix:** Incluir menção na seção "Próximo Especialista" da resposta de transição.

### BUG 5 (MÉDIO): v7.1 FIX 1 injeta conteúdo inline — contra a filosofia

**Arquivo:** `src/src/middleware/skill-injection.middleware.ts`
**Problema:** Reescrito para carregar conteúdo via SkillLoaderService e injetar na resposta. Gasta tokens desnecessariamente.
**Fix:** Reverter para abordagem de menções, mas com menções expandidas (templates + checklists).

### BUG 6 (BAIXO): v7.1 FIX 2 injeta contexto acumulado inline

**Arquivo:** `src/src/tools/proximo.ts` — `formatarContextoAcumulado()`
**Problema:** Gera tabela markdown com pontos-chave inline. Deveria gerar menções para os entregáveis anteriores.
**Fix:** Substituir inline por menções de arquivo `#docs/fase-XX/entregavel`.

---

## 4. Plano de Correção

### FIX A: Corrigir `formatSkillHydrationCommand` — aceitar `projectDir`
- **Arquivo:** `src/src/utils/ide-paths.ts`
- **Mudança:** Adicionar parâmetro `projectDir` à função
- **Lógica:** `join(projectDir, resourcesRelDir)` em vez de `join(process.cwd(), resourcesRelDir)`
- **Impacto:** Todos os callers precisam passar `projectDir`

### FIX B: Expandir menções para incluir TODOS os recursos
- **Arquivo:** `src/src/utils/ide-paths.ts`
- **Mudança:** Além de SKILL.md, gerar menções explícitas para:
  - `resources/templates/*.md` — templates do entregável
  - `resources/checklists/*.md` — checklists de validação
  - `.orientacoes-gate.md` — orientações de gate da fase
- **Lógica:** Listar arquivos .md recursivamente na pasta da skill

### FIX C: Gerar menções para entregáveis anteriores
- **Arquivo:** `src/src/tools/proximo.ts`
- **Mudança:** Na transição de fase, gerar seção com menções `#path` para entregáveis já aprovados
- **Substituir:** `formatarContextoAcumulado()` (inline) → menções de arquivo
- **Lógica:** Iterar `estado.entregaveis` e gerar `#docs/fase-XX/entregavel`

### FIX D: Reverter middleware para abordagem de menções
- **Arquivo:** `src/src/middleware/skill-injection.middleware.ts`
- **Mudança:** Reverter para versão original com `formatSkillHydrationCommand()` (mas com projectDir)
- **Manter:** Estrutura de safety net (só injeta se proximo.ts não injetou)

### FIX E: Atualizar callers de `formatSkillHydrationCommand`
- **Arquivos:** `proximo.ts`, `skill-injection.middleware.ts`, `shared-prompt-handler.ts`, `specialist-phase-handler.ts`
- **Mudança:** Passar `diretorio` (projectDir) em todas as chamadas

---

## 5. Resumo de Impacto

| Antes (v7.1) | Depois (v7.2) |
|---------------|---------------|
| Conteúdo injetado inline (~5000 tokens) | Menções de arquivo (~100 tokens) |
| Só SKILL.md mencionado | SKILL.md + templates + checklists + gate |
| Entregáveis anteriores como tabela inline | Menções `#path` para entregáveis |
| `process.cwd()` para resolver resources | `projectDir` real passado |
| Middleware injeta conteúdo via SkillLoaderService | Middleware gera menções via `formatSkillHydrationCommand` |

---

## 6. Riscos

| Risco | Mitigação |
|-------|-----------|
| Skills locais vazias → menções apontam para nada | Verificar se `injectContentForIDE` copia corretamente |
| IDE não suporta menção de diretório | Listar cada arquivo individualmente |
| Muitas menções sobrecarregam a IA | Limitar a ~10 menções mais relevantes |
| Templates podem não existir para todas as skills | Fallback: só mencionar SKILL.md se não houver templates |
