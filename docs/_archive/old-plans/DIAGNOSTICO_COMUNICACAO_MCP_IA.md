# Diagnóstico Completo: Comunicação MCP ↔ IA

**Data:** Fevereiro 2026  
**Versão:** 1.0  
**Escopo:** Todos os arquivos do sistema Maestro MCP v5.2

---

## 1. Mapa de Arquivos Afetados

### 1.1 Arquivos com Problemas Críticos

| Arquivo | Problema Principal | Impacto |
|---------|-------------------|---------|
| `src/tools/maestro-tool.ts` | `handleNoProject` referencia tool interna `setup_inicial` | IA não consegue executar o próximo passo |
| `src/tools/setup-inicial.ts` | Formato de instrução usa sintaxe JS, não tool call MCP | IA envia parâmetros no campo errado |
| `src/tools/iniciar-projeto.ts` | Pede para IA criar arquivos via texto + retorna JSON gigante | IA falha ao salvar estado |
| `src/flows/onboarding-orchestrator.ts` | `next_action.tool` = `onboarding_orchestrator` (interna) | IA não encontra a tool |
| `src/tools/brainstorm.ts` | `next_action.tool` = `brainstorm` e `prd_writer` (internas) | IA não encontra a tool |
| `src/tools/prd-writer.ts` | `next_action.tool` = `prd_writer` (interna) + pede salvar arquivos | IA falha ao salvar |
| `src/tools/proximo.ts` | Pede salvar 3+ arquivos via texto + referencia tools internas | IA falha ao salvar |
| `src/services/flow-engine.ts` | Transições referenciam tools internas | Orquestração quebrada |
| `src/router.ts` | Schema do `maestro` com `respostas` sem propriedades | IA não sabe o que enviar |
| `src/utils/response-formatter.ts` | Não valida se `proximo_passo.tool` é pública | Permite referências internas |
| `src/tools/consolidated/avancar.ts` | `proximo_passo.tool` = `avancar` (referência circular) | Confusão de tool names |
| `src/tools/consolidated/executar.ts` | Description genérica, sem exemplos de uso | IA não sabe como usar |

### 1.2 Grafo de Dependências (Fluxo de Dados)

```
USUÁRIO → IA → maestro-tool.ts
                    ↓
              handleNoProject()
                    ↓
              setup-inicial.ts ← PROBLEMA: tool interna, IA não acessa
                    ↓
              iniciar-projeto.ts ← PROBLEMA: pede criar arquivos
                    ↓
              confirmar-projeto (dentro de iniciar-projeto.ts)
                    ↓
              onboarding-orchestrator.ts ← PROBLEMA: next_action = tool interna
                    ↓
              brainstorm.ts ← PROBLEMA: next_action = tool interna
                    ↓
              prd-writer.ts ← PROBLEMA: next_action = tool interna + pede salvar
                    ↓
              proximo.ts ← PROBLEMA: pede salvar 3+ arquivos
                    ↓
              [ciclo de fases de desenvolvimento]
```

### 1.3 Fluxo de Comunicação Atual vs Esperado

**Atual (quebrado):**
```
maestro-tool → retorna "use setup_inicial()" → IA não encontra tool → LOOP
onboarding   → retorna "use onboarding_orchestrator()" → IA não encontra → LOOP
brainstorm   → retorna "use brainstorm()" → IA não encontra → LOOP
proximo      → retorna "salve estes 3 arquivos" → IA falha → estado corrompido
```

**Esperado (corrigido):**
```
maestro-tool → retorna "use maestro({acao:'setup', respostas:{...}})" → IA executa → OK
onboarding   → retorna "use executar({acao:'avancar', respostas:{...}})" → IA executa → OK
brainstorm   → retorna "use executar({acao:'avancar', respostas:{...}})" → IA executa → OK
proximo      → salva arquivos diretamente via fs → retorna confirmação → OK
```

---

## 2. Problemas Detalhados

### P1: Referências a Tools Internas nos Retornos

**Onde ocorre:**
- `maestro-tool.ts:177` → `nextTool = "setup_inicial"`
- `onboarding-orchestrator.ts:149-155` → `next_action.tool = "brainstorm"`
- `onboarding-orchestrator.ts:204-215` → `next_action.tool = "onboarding_orchestrator"`
- `onboarding-orchestrator.ts:327-333` → `next_action.tool = "brainstorm"`
- `onboarding-orchestrator.ts:402-413` → `next_action.tool = "onboarding_orchestrator"`
- `onboarding-orchestrator.ts:433-438` → `next_action.tool = "brainstorm"`
- `brainstorm.ts:269-275` → `next_action.tool = "prd_writer"`
- `brainstorm.ts:303-314` → `next_action.tool = "brainstorm"`
- `brainstorm.ts:406-412` → `next_action.tool = "prd_writer"`
- `brainstorm.ts:453-464` → `next_action.tool = "brainstorm"`
- `brainstorm.ts:478-484` → `next_action.tool = "prd_writer"`
- `prd-writer.ts:307-313` → `next_action.tool = "prd_writer"`
- `avancar.ts:91-93` → `proximo_passo.tool = "avancar"`
- `flow-engine.ts:71` → `tool: "setup_inicial"`
- `flow-engine.ts:81` → `tool: "iniciar_projeto"`
- `flow-engine.ts:89` → `tool: "iniciar_projeto"`
- `flow-engine.ts:97` → `tool: "confirmar_projeto"`
- `flow-engine.ts:105` → `tool: "onboarding_orchestrator"`
- `flow-engine.ts:113` → `tool: "onboarding_orchestrator"`
- `flow-engine.ts:122` → `tool: "brainstorm"`
- `flow-engine.ts:131` → `tool: "prd_writer"`
- `flow-engine.ts:139` → `tool: "prd_writer"`
- `flow-engine.ts:147` → `tool: "confirmar_classificacao"`
- `flow-engine.ts:161` → `tool: "aprovar_gate"`
- `flow-engine.ts:169` → `tool: "confirmar_classificacao"`
- `flow-engine.ts:177` → `tool: "proximo"`

**Impacto:** A IA recebe instrução para chamar uma tool que não existe na lista de tools públicas. Resultado: erro, tentativa de workaround via `maestro`, ou loop infinito.

**Solução:** Todas as referências devem usar apenas as 5 tools públicas: `maestro`, `executar`, `validar`, `analisar`, `contexto`.

### P2: Delegação de Persistência para a IA

**Onde ocorre:**
- `iniciar-projeto.ts:459-523` → Bloco "AÇÃO OBRIGATÓRIA - Criar Arquivos" com JSON inline
- `proximo.ts:753-769` → Bloco "AÇÃO OBRIGATÓRIA - Salvar Arquivos" com JSON inline
- `prd-writer.ts:279-291` → Bloco "AÇÃO OBRIGATÓRIA - Atualizar Estado" com JSON inline
- `prd-writer.ts:553-565` → Bloco "AÇÃO OBRIGATÓRIA - Atualizar Estado" com JSON inline
- `onboarding-orchestrator.ts:199-202` → `files` no retorno
- `onboarding-orchestrator.ts:322-325` → `files` no retorno
- `onboarding-orchestrator.ts:396-400` → `files` no retorno
- `onboarding-orchestrator.ts:428-431` → `files` no retorno
- `brainstorm.ts:404` → `files` no retorno
- `brainstorm.ts:451` → `files` no retorno
- `brainstorm.ts:476` → `files` no retorno
- `proximo.ts:262` → `files` no retorno
- `proximo.ts:473-476` → `files` no retorno

**Impacto:** A IA precisa copiar JSON gigante e usar `write_to_file` — frequentemente falha, trunca, ou ignora. Estado do projeto fica corrompido ou desatualizado.

**Solução:** O MCP deve salvar arquivos diretamente via `fs/promises` (já tem acesso ao filesystem). Retornar apenas confirmação de que os arquivos foram salvos.

### P3: Schema de `respostas` Vazio

**Onde ocorre:**
- `maestro-tool.ts:265-267` → `respostas: { type: "object", description: "..." }`
- `avancar.ts:127-129` → `respostas: { type: "object", description: "..." }`
- `executar.ts:141-143` → `respostas: { type: "object", description: "..." }`

**Impacto:** A IA não sabe quais propriedades colocar dentro de `respostas`. Tenta enviar como texto no campo `input`, ou envia objeto vazio.

**Solução:** Adicionar `properties` ao schema de `respostas` com os campos esperados para cada contexto.

### P4: Formato de Instrução Ambíguo

**Onde ocorre:**
- `setup-inicial.ts:18-30` → Mostra `setup_inicial({...})` como se fosse código JS
- `iniciar-projeto.ts:177-189` → Mostra `iniciar_projeto({...})` como código JS
- `proximo.ts:74-79` → Mostra `proximo(...)` como código JS
- `proximo.ts:248-253` → Mostra `confirmar_classificacao(...)` como código JS
- `proximo.ts:304-308` → Mostra `confirmar_classificacao(...)` como código JS

**Impacto:** A IA interpreta como texto a ser enviado no campo `input`, não como uma tool call MCP com parâmetros estruturados.

**Solução:** Usar formato JSON explícito que mapeia diretamente para tool call MCP.

### P5: Excesso de Passos no Fluxo Inicial

**Onde ocorre:**
- `flow-engine.ts:67-152` → ONBOARDING_FLOW define 10 transições
- `maestro-tool.ts:74-86` → Sem projeto → setup_inicial → iniciar_projeto → confirmar_projeto → onboarding

**Impacto:** 4+ tool calls antes de qualquer coisa útil. A IA se perde no meio do caminho, especialmente quando cada passo tem problemas de comunicação.

**Solução:** Nova ação `criar_projeto` no `maestro` que combina setup + iniciar + confirmar em um único passo.

### P6: Inconsistência entre `respostas` e `respostas_bloco`

**Onde ocorre:**
- `executar.ts` usa `respostas` (via `avancar`)
- `onboarding-orchestrator.ts` espera `respostas_bloco`
- `avancar.ts:56-57` passa `args.respostas` como `respostas` para onboarding
- `onboarding-orchestrator.ts:117` espera `args.respostas_bloco`

**Impacto:** Quando a IA envia `respostas` via `executar`, o onboarding não recebe porque espera `respostas_bloco`. Dados se perdem silenciosamente.

**Solução:** Normalizar para um único campo `respostas` em todo o sistema, ou fazer `avancar.ts` mapear corretamente.

### P7: Inicialização Falha em Diretórios "Sujos" (Falsos Positivos)

**Onde ocorre:**
- `maestro-tool.ts:98` → Bloco `if (!estado)` ignora explicitamente a ação `criar_projeto` ou `setup_inicial` se um `estado.json` fantasma for encontrado no diretório (ex: testes de fallback falhos).

**Impacto:** Se o usuário apagar o código, mas esquecer a pasta `.maestro/`, e chamar `maestro({acao: "criar_projeto"})`, o sistema ignora a requisição e devolve o estado antigo. Essa manobra pula a cópia dos scripts de injeção, induz a IA ao erro (ela fica tentando usar comandos e não recebe o onboarding real do 0) e supostamente bloqueia a "Gestão de Produto" das etapas iniciais.

**Solução:** Adicionar `args.acao === "criar_projeto"` ou `args.acao === "setup_inicial"` na condição de força para resetar/sobrepor caso a action esteja explícita.

---

## 3. Inventário Completo de Mudanças

### Arquivos que precisam de mudança:

| # | Arquivo | Tipo de Mudança | Prioridade |
|---|---------|----------------|------------|
| 1 | `src/tools/maestro-tool.ts` | Refatorar handleNoProject + nova ação criar_projeto + schema | P0 |
| 2 | `src/tools/setup-inicial.ts` | Formato de instrução + persistência direta | P0 |
| 3 | `src/utils/response-formatter.ts` | Validação de tool pública no proximo_passo | P0 |
| 4 | `src/services/flow-engine.ts` | Todas as transições → tools públicas | P1 |
| 5 | `src/tools/iniciar-projeto.ts` | Persistência direta via fs + remover bloco "criar arquivos" | P1 |
| 6 | `src/flows/onboarding-orchestrator.ts` | next_action → tools públicas + persistência direta | P1 |
| 7 | `src/tools/brainstorm.ts` | next_action → tools públicas + persistência direta | P1 |
| 8 | `src/tools/prd-writer.ts` | next_action → tools públicas + persistência direta | P1 |
| 9 | `src/tools/proximo.ts` | Persistência direta + remover bloco "salvar arquivos" | P1 |
| 10 | `src/tools/consolidated/avancar.ts` | proximo_passo → tool pública + mapear respostas_bloco | P1 |
| 11 | `src/tools/consolidated/executar.ts` | Description melhorada + mapear respostas para respostas_bloco | P1 |
| 12 | `src/router.ts` | Schema do maestro com propriedades de respostas + descriptions | P1 |
| 13 | `src/utils/next-step-formatter.ts` | NOVO: Helper para gerar próximo passo correto | P1 |
| 14 | `src/utils/persistence.ts` | NOVO: Helper para salvar arquivos do projeto diretamente | P1 |
| 15 | `src/tools/maestro-tool.ts` | Permitir `acao: "criar_projeto"` forçar a sobreposição caso já exista um `.maestro/estado.json` perdido de testes. | P0 |

### Arquivos que NÃO precisam de mudança:
- `src/stdio.ts` — Entry point, sem lógica de comunicação
- `src/index.ts` — Entry point HTTP, sem lógica de comunicação
- `src/middleware/*` — Middleware pipeline funciona corretamente
- `src/services/annotations-fallback.service.ts` — Funciona corretamente
- `src/types/*` — Tipos estão corretos
- `src/state/*` — Storage funciona corretamente
- `src/gates/*` — Validação funciona corretamente

---

## 4. Matriz de Comunicação entre Componentes

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   maestro    │────▶│ setup-inicial│────▶│iniciar-proj. │
│   (público)  │     │  (interno)   │     │  (interno)   │
└──────┬───────┘     └──────────────┘     └──────┬───────┘
       │                                          │
       │  ┌──────────────┐                        │
       ├─▶│  executar     │                        │
       │  │  (público)    │                        │
       │  └──────┬───────┘                        │
       │         │                                 │
       │         ▼                                 ▼
       │  ┌──────────────┐     ┌──────────────┐  ┌──────────────┐
       │  │   avancar    │────▶│  onboarding  │──▶│  brainstorm  │
       │  │  (interno)   │     │  (interno)   │  │  (interno)   │
       │  └──────────────┘     └──────────────┘  └──────┬───────┘
       │                                                 │
       │                                                 ▼
       │                                          ┌──────────────┐
       │                                          │  prd-writer  │
       │                                          │  (interno)   │
       │                                          └──────┬───────┘
       │                                                 │
       │  ┌──────────────┐                               │
       ├─▶│   validar    │◀──────────────────────────────┘
       │  │  (público)   │
       │  └──────────────┘
       │
       │  ┌──────────────┐     ┌──────────────┐
       ├─▶│  analisar    │     │   proximo    │◀── executar(acao:'avancar')
       │  │  (público)   │     │  (interno)   │
       │  └──────────────┘     └──────────────┘
       │
       │  ┌──────────────┐
       └─▶│  contexto    │
          │  (público)   │
          └──────────────┘

REGRA: Toda seta que sai de um componente INTERNO para um retorno
       ao usuário/IA DEVE referenciar apenas componentes PÚBLICOS.
```

---

**Fim do Documento**
