# Análise Exploratória — Respostas às 20 Perguntas

**Data:** 25/02/2026  
**Base:** Maestro MCP v5.5.0 (package.json v5.5.3)  
**Escopo:** Codebase `src/src/` — análise de código-fonte, arquitetura, fluxos e padrões  

---

## 🎯 Visão Geral

O Maestro MCP é um projeto **ambicioso e tecnicamente diferenciado** que tenta resolver um problema real: orquestrar desenvolvimento assistido por IA de forma estruturada, com qualidade controlada. O conceito de "Fat MCP" — toda a lógica no servidor, zero APIs externas — é inovador e pragmático para o caso de uso (IDEs locais via STDIO).

**O que funciona bem:** A redução de 44→5 tools públicas, o middleware pipeline declarativo, a flow engine como state machine, o error handling com recovery paths, e a persistência direta via fs.

**O que gera fricção:** A complexidade acumulada (37 tools legadas, 2 entry points divergentes, `onboarding?: any`), arquivos gigantes sem decomposição (specialist-phase-handler: 1296 linhas, proximo.ts: 1223 linhas), e o fluxo de onboarding que mistura caminhos novos (v6.0 specialist) com legados (discoveryBlocks) no mesmo código.

---

## Arquitetura & Design

### 1. O pattern "Fat MCP" está bem implementado? Onde há vazamento de responsabilidades?

**Avaliação: 7/10 — Bem implementado no conceito, com vazamentos pontuais.**

O Fat MCP está bem executado nos aspectos fundamentais:
- **Persistência direta** (`StateService.save()`, `saveFile()`) — o servidor grava no disco sem delegar para a IA
- **Flow engine declarativa** (`flow-engine.ts`) — transições codificadas como state machine
- **Router centralizado** (`router.ts`) — ponto único de roteamento com Map para lookup

**Vazamentos de responsabilidade identificados:**

| Vazamento | Arquivo | Problema |
|-----------|---------|----------|
| **Formatação de instruções para IA** | `maestro-tool.ts:213-239` | O servidor gera prompts extensos instruindo a IA como se comportar ("NÃO infira valores", "NÃO chame maestro() sem ação"). Isso é responsabilidade do **prompt do sistema da IDE**, não do servidor MCP. |
| **Markdown para humanos + JSON para máquinas** | `response-formatter.ts` | `formatResponse()` gera Markdown bonito com emojis e tabelas (para o usuário ver) MAS embute instruções de ferramentas no mesmo bloco (`proximo_passo`). O servidor deveria separar: `structuredContent` para dados, `content[].text` para display. |
| **Anti-loop com estado global** | `avancar.ts:47-48` | `_lastCallHash` e `_identicalCallCount` são variáveis de módulo. Isso é estado de sessão, deveria estar no `StateService` ou num `Map<diretorio, LoopState>`. |
| **Duplicação de leitura de estado** | `maestro-tool.ts:71-77` e `avancar.ts:79-91` | Ambos fazem `parsearEstado` + `stateService.load()` como fallback. Esse padrão se repete em 4+ tools. Deveria ser centralizado num middleware (o `withStateLoad` existe mas nem todas as tools usam). |

**Onde o Fat MCP brilha:**
- `proximo.ts` lê entregáveis diretamente do disco (`readFile`) ao invés de recebê-los via JSON — elimina problemas de escape e economiza tokens
- `specialist-phase-handler.ts` lê PRD do disco para validação — pattern correto
- `saveFile`/`saveMultipleFiles` em `persistence.ts` — o servidor persiste sem depender da IA

---

### 2. Se redesenhasse do zero, quais seriam as 3 mudanças arquiteturais mais impactantes?

#### Mudança 1: **Separação Rígida de Concerns em Layers**

Hoje o código mistura transporte, lógica de negócio, formatação e persistência no mesmo arquivo. Proposta:

```
src/
├── transport/           # APENAS protocolo MCP (stdio, http)
│   ├── stdio.ts         # SDK Server + StdioTransport
│   └── http.ts          # SDK Server + StreamableHTTPTransport
├── domain/              # LÓGICA PURA (zero I/O, testável unitariamente)
│   ├── flow-engine.ts   # State machine de transições
│   ├── gate-scorer.ts   # Scoring de gates/PRD
│   ├── classifier.ts    # Classificação de complexidade
│   └── phase-types.ts   # Definição de fases/fluxos
├── services/            # I/O e orquestração (filesystem, estado)
│   ├── state.service.ts # Persistência de estado
│   ├── skill.service.ts # Carregamento de skills
│   └── file.service.ts  # Leitura/escrita de entregáveis
├── tools/               # ADAPTERS (traduz MCP args → domain calls → MCP response)
│   ├── maestro.ts       # Máximo ~100 linhas
│   ├── executar.ts
│   ├── validar.ts
│   ├── analisar.ts
│   └── contexto.ts
└── presentation/        # Formatação de respostas
    ├── markdown.ts      # Para humanos
    └── structured.ts    # structuredContent para máquinas
```

**Impacto:** Testabilidade 10x melhor. A `domain/` é testável sem mocks de filesystem. As tools ficam finas (<100 linhas cada).

#### Mudança 2: **Estado Tipado e Versionado**

Substituir `onboarding?: any` por tipos rigorosos com migration system:

```typescript
// v6: Estado versionado
interface EstadoV6 {
    _version: 6;
    onboarding: OnboardingState;  // NUNCA any
    // ... resto tipado
}

// Migration automática
function migrateState(raw: unknown): EstadoV6 {
    const version = (raw as any)?._version ?? 1;
    let state = raw;
    if (version < 4) state = migrateV3toV4(state);
    if (version < 5) state = migrateV4toV5(state);
    if (version < 6) state = migrateV5toV6(state);
    return state as EstadoV6;
}
```

**Impacto:** Elimina toda uma classe de bugs silenciosos. TypeScript passa a ser aliado ao invés de ser contornado com `as any`.

#### Mudança 3: **Entry Point Único com Transport Plugável**

Eliminar a divergência `stdio.ts` vs `index.ts`:

```typescript
// server.ts — ÚNICO entry point
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { registerAllHandlers } from "./handlers.js";

export function createMaestroServer() {
    const server = new Server({ name: MAESTRO_NAME, version: MAESTRO_VERSION }, {
        capabilities: { resources: {}, tools: {}, prompts: {} }
    });
    registerAllHandlers(server);
    return server;
}

// stdio.ts — 10 linhas
const server = createMaestroServer();
await server.connect(new StdioServerTransport());

// http.ts — 10 linhas (quando necessário)
const server = createMaestroServer();
await server.connect(new StreamableHTTPServerTransport({ ... }));
```

**Impacto:** Zero duplicação de protocolo. Manutenção em um só lugar. Elimina ERRO-001 da análise técnica.

---

### 3. Servidor "burro" ou "esperto"? O híbrido é problema ou vantagem?

**O híbrido é uma vantagem, MAS precisa de guardrails.**

O Maestro acerta em ser "esperto" nestes pontos:
- **Flow engine** decide o próximo passo (a IA não precisa "lembrar" o fluxo)
- **Gate scoring** é automático (a IA não precisa "julgar" se o entregável é bom)
- **Persistência direta** (a IA não precisa "criar arquivos" de estado)

O Maestro erra ao ser "esperto demais" nestes pontos:
- **Instruções comportamentais** (`maestro-tool.ts:213-239`) — instruir a IA a "NÃO infira valores" é tentar controlar o LLM via output. Isso é frágil e consome tokens. Deveria estar em system prompts/rules da IDE.
- **Formatação de markdown com emojis** para display humano — o servidor não deveria se preocupar com como o usuário vê a resposta. Deveria retornar dados estruturados e deixar a IDE formatar.
- **Lógica de "anti-loop"** — detectar que a IA está em loop é responsabilidade do client MCP, não do servidor.

**Recomendação:** Servidor esperto para **lógica de domínio** (fluxo, validação, persistência). Servidor burro para **apresentação** (apenas dados estruturados, zero instruções comportamentais para a IA).

---

## Fluxo de Experiência

### 4. O fluxo de onboarding é intuitivo? Onde um novo usuário trairia?

**Pontos de fricção identificados:**

| Ponto | Onde Trava | Por quê |
|-------|-----------|---------|
| **Setup vs Criar Projeto** | `handleNoProject()` | O usuário precisa de 2 passos (setup_inicial → criar_projeto) quando deveria ser 1. A v6.0 tentou consolidar com `acao="criar_projeto"`, mas ainda exige que config global exista primeiro. |
| **"Confirme as configurações"** | `maestro-tool.ts:213-239` | O servidor retorna um bloco ENORME de instruções pedindo confirmação. O novo usuário vê uma parede de texto e não sabe o que fazer. |
| **Classificação pós-PRD** | `avancar.ts:128-130` | Após o PRD ser aprovado pelo especialista, o sistema pede "confirme a classificação". O usuário não entende o que é "classificação" nem por que precisa confirmar algo que a IA sugeriu. |
| **3 caminhos de onboarding** | `avancar.ts:136-214` | O código tem: (1) specialistPhase (v6.0+), (2) brainstorm legacy, (3) discoveryBlocks legacy. Se o estado tiver artefatos misturados, o roteamento pode errar. |
| **Termos técnicos expostos** | `handleNoProject()` | "economy/balanced/quality", "Stitch para prototipagem" — um novo usuário não sabe o que significam sem contexto. |

**Melhoria proposta:** Onboarding em 1 passo com defaults inteligentes:

```
Usuário: "crie um projeto de e-commerce"
↓
Maestro: detecta que não há config → pede APENAS nome/descrição
↓  (usa windsurf como IDE default, balanced como modo default)
Maestro: cria projeto e inicia specialistPhase
↓
Especialista faz perguntas contextuais (já é o fluxo bom que existe)
```

Se o usuário quiser ajustar config, pode fazer depois via `maestro({acao: "configurar"})`.

---

### 5. "Fases" é a melhor abstração? Existem alternativas?

**Fases são uma boa abstração para documentos, mas inadequadas para código.**

O sistema de fases funciona bem para:
- ✅ Produto → Requisitos → UX → Arquitetura (documentos progressivos)
- ✅ Gate de validação entre fases (garantia de qualidade)
- ✅ Especialistas por fase (contexto especializado)

Mas falha para:
- ❌ **Codificação** — uma "fase Backend" não é atômica. Tem N rotas, N services, N testes
- ❌ **Iteração** — o modelo linear (fase 1 → fase 2 → ...) não suporta "voltar e ajustar"
- ❌ **Paralelismo** — Frontend e Backend podem ser desenvolvidos em paralelo

**Alternativa proposta: Hybrid Phase-Task Model**

```
Fases (macro, sequenciais):
  Fase 1: Produto (PRD) ← mantém
  Fase 2: Requisitos     ← mantém
  Fase 3: UX/Design      ← mantém
  Fase 4: Arquitetura    ← mantém

Tasks (micro, paralelas, dentro de cada fase de código):
  Fase 5: Backend
    ├── Epic: API Auth
    │   ├── Task: route handler    [done]
    │   ├── Task: auth service     [in_progress]
    │   └── Task: unit tests       [todo]
    └── Epic: API Users
        └── ...
  Fase 6: Frontend (pode começar em paralelo com Backend)
    └── ...
```

O `EstadoProjeto.tasks` já existe no tipo (`types/index.ts:100-122`) mas **nunca é usado**. Ativá-lo seria o passo natural.

---

### 6. O sistema de "especialistas" por fase é eficaz?

**Sim, é um dos melhores conceitos do Maestro. Mas a injeção é problemática.**

O conceito é excelente:
- Cada fase tem um especialista com nome, tom e expertise
- O `getSpecialistPersona()` retorna persona contextualizada
- Skills com templates, checklists e orientações específicas

**Problemas na injeção atual:**

1. **v7.0 migrou para "hydration commands"** (`formatSkillHydrationCommand`) — ao invés de injetar o conteúdo da skill diretamente, gera um comando para a IDE abrir o arquivo. Isso é bom para economizar tokens, mas **depende da IA seguir a instrução** de abrir o arquivo (nem sempre acontece).

2. **Verificação de skill bloqueante** (`proximo.ts:587-599`) — se a skill não foi "carregada", o sistema bloqueia o avanço com erro. Mas a verificação (`verificarSkillCarregada`) pode falhar por motivos de path, não porque a IA não leu a skill.

3. **Contexto duplicado** — `maestro-tool.ts:176-190` adiciona resource links E `maestro-tool.ts:128-138` adiciona hydration command. Dois mecanismos para o mesmo propósito.

**Melhoria:** Unificar a injeção de skills em um único middleware (`withSkillInjection`) que:
- Inclui um resumo compacto da skill (3-5 linhas) diretamente na resposta
- Referencia o arquivo completo como recurso MCP
- Nunca bloqueia o fluxo por falta de skill

---

## Sistema de Validação

### 7. O TDD Invertido é suficiente para garantir qualidade?

**É um conceito inovador e diferenciador, mas insuficiente sozinho.**

O TDD Invertido funciona assim:
1. Antes de codar, a IA lê um "gate orientation doc" (`.orientacao-gate.md`)
2. O doc contém: critérios de aceitação, checklist, edge cases
3. A IA gera o entregável seguindo essas orientações
4. O `ValidationPipeline` verifica se o entregável atende o checklist

**Onde é suficiente:**
- Documentos textuais (PRD, Requisitos, Arquitetura) — validação semântica funciona bem
- Garante estrutura mínima (seções obrigatórias, tamanho mínimo)

**Onde é insuficiente:**
- **Código** — verificar se "seção de testes" existe no Markdown é diferente de verificar se testes passam
- **Integração** — o TDD Invertido não verifica se componentes se integram
- **Regressão** — sem execução real de testes, não detecta quebras

**Complementos propostos:**

1. **Validação Estática (sem executar código):**
   - Parse AST do TypeScript (usando `ts.createSourceFile`) para verificar imports, exports, tipos
   - Contagem de funções/classes exportadas vs documentadas
   - Detecção de patterns anti (any, console.log em produção)

2. **Delegação Inteligente:**
   - O MCP gera um script de validação (`validate.sh`) que a IA deve executar
   - Resultados retornados via próxima chamada de tool
   - Pattern: MCP → instrução → IA executa → IA reporta → MCP valida report

---

### 8. Scores e gates (threshold de 70%) é a métrica certa?

**70% é um threshold razoável, mas o scoring é simplista demais.**

O scoring atual (em `proximo.ts:131-147`):
```
qualityScore = (estrutura * 0.30) + (checklist * 0.50) + (tamanho * 0.20)
```

**Problemas:**
- **Checklist binário** — um item está "mencionado" ou não. Não mede qualidade da menção
- **Tamanho como proxy** — 20% do score é baseado em tamanho. Um documento prolixo pontua mais que um conciso e bem escrito
- **Score universal** — 70% para um PRD e 70% para código Backend são exigências muito diferentes

**Proposta: Scoring Contextual por Tipo de Fase**

| Tipo de Fase | Peso Estrutura | Peso Checklist | Peso Qualidade | Threshold |
|-------------|---------------|---------------|---------------|-----------|
| Documento (PRD, Req) | 20% | 40% | 40% (profundidade) | 65% |
| Design (UX, Arquitetura) | 30% | 30% | 40% (consistência) | 70% |
| Código (Backend, Frontend) | 10% | 30% | 60% (testes, tipos) | 75% |

O `TierGate` (`essencial`, `base`, `avancado`) já existe e é atribuído via `determinarTierGate()`. Expandir essa lógica para diferenciar thresholds seria natural.

---

### 9. Como equilibrar validação rigorosa com criatividade da IA?

**Princípio: Validar resultados, não processos.**

O sistema atual tende a ser prescritivo demais ("AÇÃO OBRIGATÓRIA", "NÃO TENTE AVANÇAR"):
- `proximo.ts:374-391` — parede de texto instruindo exatamente como gerar o entregável
- `avancar.ts:264-280` — instruções detalhadas de classificação

**Abordagem proposta: "Guard Rails, Not Straight Jackets"**

1. **Gates flexíveis:** Ao invés de bloquear com score <70%, retornar "áreas de melhoria" e permitir que a IA decida se corrige ou avança:
   - Score ≥80%: avança automaticamente
   - Score 60-79%: avança com warnings visíveis
   - Score <60%: sugere correções, mas permite override explícito do usuário

2. **Instruções como contexto, não como ordens:** Ao invés de "AÇÃO OBRIGATÓRIA", fornecer contexto: "O especialista recomenda incluir seção de riscos. Entregáveis anteriores nesta fase tipicamente têm 5-8 seções."

3. **Feedback iterativo:** Ao invés de rejeitar, sugerir incrementos: "Score atual: 65%. Adicionando seção de métricas (+8%) e edge cases (+7%) atingiria 80%."

---

## Performance & Escalabilidade

### 10. O modo STDIO via npx tem gargalos invisíveis?

**Sim, 3 gargalos identificados:**

1. **Cold start do npx** — Cada inicialização: download do pacote → extract → `tsc` compilation check → Node startup → MCP handshake. Em redes lentas, pode levar 5-10 segundos.

2. **I/O síncrono na inicialização** — `existsSync` é usado extensivamente (`state.service.ts:36`, `proximo.ts:264`). No STDIO single-thread, chamadas síncronas bloqueiam o event loop.

3. **Skill loading repetitivo** — `SkillLoaderService` (25KB) carrega skills do disco a cada chamada de tool. Com `skill-cache.service.ts` (1.3KB) há cache básico, mas o TTL pode causar re-leituras desnecessárias.

**Se 100 usuários usassem simultaneamente:** Não aplicável para STDIO (processo por IDE). Para HTTP (`index.ts`), o problema seria o estado anti-loop global (`avancar.ts:47-48`) — sessões concorrentes compartilhariam `_lastCallHash`, causando falsos positivos. Além disso, `sessions` Map sem limite de tamanho poderia causar memory leak.

---

### 11. Lazy loading é suficiente para grandes projetos?

**Suficiente para a v6, mas precisa de evolução para v7+.**

Pontos positivos atuais:
- `import()` dinâmico em `maestro-tool.ts:83,110` e `avancar.ts:154,174` — módulos pesados só carregam quando necessários
- `skill-cache.service.ts` previne re-leitura de skills

**Limitações para projetos grandes:**
- **Estado completo em memória** — `EstadoProjeto` com `tasks[]`, `entregaveis{}`, `onboarding` inteiro é carregado por completo a cada chamada. Para projeto com 50+ tasks e 10+ entregáveis, isso pode exceder limites de JSON parse.
- **Sem paginação de contexto** — `contexto.ts` retorna TODO o contexto acumulado. Para projetos com 10+ ADRs e 7+ fases completas, isso consome tokens significativos.

**Proposta para v7:**
- Estado particionado: `estado-core.json` (metadados), `estado-tasks.json`, `estado-entregaveis.json`
- Contexto sob demanda: `contexto({fase: 3})` retorna apenas contexto relevante para a fase 3
- Resumos incrementais ao invés de contexto completo

---

### 12. Existe desperdício de tokens nas respostas?

**Sim, estimativa de 30-40% de "token bloat".**

| Fonte de Bloat | Arquivo | Exemplo | Tokens estimados |
|---------------|---------|---------|-----------------|
| **Instruções comportamentais repetidas** | `maestro-tool.ts:213-239` | "NÃO infira valores", "NÃO chame maestro() sem ação" — repetido a CADA chamada | ~200 tokens/chamada |
| **Templates de código inline** | `avancar.ts:264-280`, `proximo.ts:496-509` | Blocos ```json com exemplos de chamada de tool | ~150 tokens/chamada |
| **Markdown decorativo** | `response-formatter.ts:68-87` | Tabelas, barras de progresso, emojis para dados que a IA não precisa "ver bonito" | ~100 tokens/chamada |
| **Deprecation warnings** | `router.ts:558-563` | Cada chamada a tool legada adiciona um bloco de warning | ~50 tokens/chamada |
| **Paths completos repetidos** | `proximo.ts:326-340` | Paths do IDE repetidos 3-4 vezes na mesma resposta | ~80 tokens/chamada |

**Total estimado por ciclo (ida + volta):** ~500-600 tokens desperdiçados.

**Mitigação:** Usar `structuredContent` para dados máquina-legíveis e `content[].text` apenas para resumo humano. O `annotations-fallback.service.ts` com `forAssistantOnly` já tenta separar, mas não é usado consistentemente.

---

## Developer Experience

### 13. O sistema é "debugável"?

**Parcialmente. 6/10.**

**O que facilita debug:**
- `withErrorHandling` (`errors/index.ts`) — erros capturados com recovery paths claros
- `MaestroError` hierarchy — `ValidationError`, `StateError`, `FlowError`, `PersistenceError` com contexto
- `console.error` em `stdio.ts:102,108-109` — informações de startup

**O que dificulta debug:**
- **Fallbacks silenciosos** — 15+ ocorrências de `catch { /* ignore */ }` ou `catch { /* Fallback silencioso */ }`. Quando algo falha, simplesmente não acontece nada. Exemplos: `maestro-tool.ts:135,187,393`, `avancar.ts:146,88`.
- **Sem structured logging** — `console.log`, `console.warn`, `console.error` misturados sem levels, sem contexto (qual tool? qual diretório? qual fase?).
- **Estado opaco** — para debugar um bug de fluxo, precisa ler `estado.json`, entender `onboarding.specialistPhase.status`, verificar `aguardando_classificacao`, checar `classificacao_pos_prd_confirmada`... sem dashboard ou ferramenta visual.
- **2 entry points** — bug pode se manifestar diferente em STDIO vs HTTP.

**Proposta: `diagnosticar` tool**

Uma tool dedicada ao debug que retorna:
```json
{
    "estado_resumo": { "fase": 3, "onboarding": "completed", "flags_ativas": ["aguardando_classificacao"] },
    "ultimo_erro": { "tool": "avancar", "erro": "...", "timestamp": "..." },
    "transicoes_recentes": [{ "de": "specialist_approved", "para": "classificacao", "tool": "executar" }],
    "inconsistencias": ["versão: 5.2.0 no código, 5.5.3 no package.json"]
}
```

---

### 14. Qual é a melhor "surface area"? 5 tools são muitas ou poucas?

**5 tools é um número excelente. O problema é que cada tool faz demais.**

O `maestro` especificamente é um "God Tool":
- Sem args → retorna status
- `acao="setup_inicial"` → configura preferências
- `acao="criar_projeto"` → cria projeto (que internamente chama `iniciarProjeto`)
- `acao="avancar"` → delega para `executar` (que delega para `avancar`)
- Sem projeto → fluxo de onboarding

Isso viola o Single Responsibility Principle. O `maestro` é na verdade 4 tools disfarçadas.

**Proposta: 5 tools, responsabilidades mais claras**

| Tool | Responsabilidade ÚNICA | Atual (v5.5) |
|------|----------------------|-------------|
| `maestro` | Status + criação de projeto | Status + setup + criação + delegação de avanço |
| `executar` | Avançar fase + salvar conteúdo | OK (mas herda complexidade do `avancar.ts`) |
| `validar` | Validar gates e entregáveis | OK |
| `analisar` | Análise de código | OK |
| `contexto` | Recuperar contexto/ADRs | OK |

Remover `acao="avancar"` do `maestro` (ERRO-007 da análise técnica) e `acao="setup_inicial"` (integrar no fluxo de criação de projeto).

---

### 15. Se pudesse adicionar UMA nova tool, qual seria?

**`diagnosticar` — Tool de Debug e Troubleshooting.**

**Justificativa:** O problema #1 do Maestro hoje é que quando algo dá errado no fluxo, é extremamente difícil entender onde e por quê. Os fallbacks silenciosos escondem erros, o estado tem muitas flags interdependentes, e o fluxo tem 3 caminhos possíveis no onboarding.

**Implementação:**

```typescript
// tool: diagnosticar
interface DiagnosticarArgs {
    diretorio: string;
    nivel?: "rapido" | "completo";  // Default: rapido
}

// Retorno:
{
    "versao": { "codigo": "5.2.0", "package": "5.5.3", "inconsistente": true },
    "estado": {
        "existe": true,
        "fase": 3,
        "flags": { "aguardando_aprovacao": false, "aguardando_classificacao": true },
        "onboarding_status": "specialist_approved",
        "inconsistencias": ["aguardando_classificacao=true mas specialistPhase=approved"]
    },
    "config": { "global_existe": true, "ide": "windsurf", "modo": "balanced" },
    "health": {
        "skills_carregadas": 3,
        "entregaveis_salvos": 2,
        "ultimo_erro": null,
        "sugestao": "Confirme a classificação com: executar({acao: 'avancar', respostas: {nivel: 'medio'}})"
    }
}
```

**Impacto:** Reduz drasticamente o tempo de debug. A IA (ou o usuário) pode chamar `diagnosticar` quando algo parece travado e receber uma resposta estruturada com a causa raiz e a ação corretiva.

---

## Código & Manutenibilidade

### 16. Quais padrões mudar para facilitar contribuições open source?

**5 mudanças prioritárias:**

1. **Eliminar `as any`** — 50+ ocorrências. Cada uma é um bug potencial que o TypeScript não pode detectar. Priorizar: `(estado as any).onboarding` (aparece 10+ vezes) → importar `OnboardingState`.

2. **Decomposição de God Files:**
   - `specialist-phase-handler.ts` (1296 linhas) → 4 módulos <300 linhas
   - `proximo.ts` (1223 linhas) → separar leitura de entregável, scoring, formatação de resposta
   - `router.ts` (614 linhas) → separar definições de tools legadas em `legacy-tools.ts`

3. **Naming convention consistente:**
   - Mix de português e inglês: `aguardando_classificacao`, `flow_phase_type`, `auto_flow_enabled`
   - Proposta: escolher uma língua para code identifiers (inglês) e outra para user-facing (português)

4. **Testes como documentação:**
   - Os 17 arquivos de teste existentes são bons, mas gaps nos fluxos principais (`maestro-tool`, `avancar`, `proximo`, `specialist-phase-handler`)
   - Cada PR deveria exigir testes para os caminhos alterados

5. **Documentação de arquitetura inline:**
   - `ARCHITECTURE.md` na raiz explicando: "por que Fat MCP?", "como funciona o flow engine?", "como adicionar uma nova fase?"
   - JSDoc em funções públicas (muitas já têm, manter padrão)

---

### 17. Onde há "código por código" versus código com propósito claro?

**Áreas de código sem propósito claro ou com propósito confuso:**

| Arquivo | Código | Problema |
|---------|--------|----------|
| `maestro-tool.ts:455-464` | `formatArgsPreview` local | Função duplicada — nunca usada (import `fmtArgs` na linha 11 é o que é usado). Código morto. |
| `flow-engine.ts:127` | `condition: (s) => true` | Condição que sempre retorna true = sem condição. Ruído de leitura. |
| `router.ts:199-493` | 37 tools legadas | 294 linhas de definições de tools que "serão removidas na v6". Mantidas por backward-compat, mas poluem o arquivo principal. |
| `proximo.ts:207-258` | Leitura de entregável | 51 linhas de fallback chains para ler entregável do disco. Pattern correto, mas overengineered — 3 fallbacks aninhados com heurísticas de tamanho. |
| `state.service.ts:79-92` | `saveFile` | Manipulação manual de paths com `.lastIndexOf("/")` e `.replace()` ao invés de `path.dirname()`. |
| `index.ts:1-401` | Entry point HTTP inteiro | 401 linhas reimplementando JSON-RPC manualmente quando o SDK MCP já oferece `StreamableHTTPServerTransport`. |

---

### 18. Testes são realistas? O que deveria ser testado?

**Os 17 testes existentes são unitários e focados em módulos isolados. Faltam testes de integração nos fluxos críticos.**

**Gaps críticos (por ordem de impacto):**

| Fluxo Não Testado | Risco | Prioridade |
|-------------------|-------|-----------|
| `maestro-tool.ts` — handleNoProject → setup → criar_projeto | Fluxo mais usado por novos usuários. Bug aqui = primeira impressão ruim. | CRÍTICO |
| `avancar.ts` — specialist_approved → classificação → fase_ativa | Transição mais frágil. ERRO-008 da análise técnica. | CRÍTICO |
| `specialist-phase-handler.ts` — collecting → generating → validating → approved | Arquivo mais complexo (1296 linhas) sem nenhum teste. | ALTO |
| `proximo.ts` — leitura de disco → scoring → gate → avanço | 1223 linhas com 35+ imports. Qualquer mudança pode regredir. | ALTO |
| `router.ts` — roteamento público vs legado + deprecation warnings | Garante que tools legadas ainda funcionam durante migração. | MÉDIO |

**Tipo de teste recomendado:** Integration tests com `StateService` real (filesystem temporário) e mocks apenas para skills/content:

```typescript
// Exemplo: test de fluxo completo
describe("Fluxo: novo usuário → projeto criado", () => {
    it("cria projeto em 2 passos (setup + criar_projeto)", async () => {
        const dir = await mkdtemp(join(tmpdir(), "maestro-test-"));
        
        // Step 1: maestro sem projeto
        const r1 = await maestroTool({ diretorio: dir });
        expect(r1.content[0].text).toContain("Setup Necessário");
        
        // Step 2: setup_inicial
        const r2 = await maestroTool({ diretorio: dir, acao: "setup_inicial", respostas: { ide: "windsurf", modo: "balanced", usar_stitch: false } });
        expect(r2.content[0].text).toContain("Configuração Salva");
        
        // Step 3: criar_projeto
        const r3 = await maestroTool({ diretorio: dir, acao: "criar_projeto", respostas: { nome: "Test", descricao: "test", ide: "windsurf", modo: "balanced", usar_stitch: false } });
        expect(r3.content[0].text).toContain("Projeto Criado");
        
        // Verificar estado persistido
        const state = JSON.parse(await readFile(join(dir, ".maestro", "estado.json"), "utf-8"));
        expect(state.nome).toBe("Test");
    });
});
```

---

## Visão de Futuro

### 19. O que o Maestro deveria ser em 2027?

**Visão: "O Git do Desenvolvimento Assistido por IA"**

Assim como o Git se tornou o padrão de versionamento, o Maestro poderia se tornar o padrão de **orquestração de projetos IA-assistidos**. Para isso:

**Curto prazo (2026 H2):**
- v6 estável com 5-6 tools, zero legadas, estado tipado
- Task-Driven Development para fases de código
- CLI standalone (`maestro init`, `maestro status`, `maestro validate`)

**Médio prazo (2027 H1):**
- **Multi-agent support** — diferentes IAs para diferentes fases (Claude para arquitetura, GPT para código, Gemini para testes)
- **Marketplace de Skills** — comunidade contribui skills/templates para frameworks específicos
- **Dashboard Web** — visualização do progresso do projeto, histórico de decisões, métricas de qualidade

**Longo prazo (2027 H2+):**
- **Maestro Cloud** — SaaS que sincroniza projetos entre membros de equipe
- **CI/CD Integration** — gates do Maestro como checks em PRs (GitHub Actions)
- **Learning Loop** — o sistema aprende quais patterns funcionam melhor para cada tipo de projeto

---

### 20. Oportunidades de integração com ferramentas emergentes?

**5 integrações de alto impacto:**

1. **MCP Servers de terceiros** — Conectar o Maestro a servidores MCP de: bancos de dados (para gerar schemas), APIs (para gerar contratos), CI/CD (para validar builds). O MCP permite composição: `maestro` chama `executar`, que poderia invocar outro MCP server via MCP-to-MCP.

2. **GitHub Copilot Workspace / Codex** — Quando o Maestro está na fase de código, delegar a geração para um agente de código especializado ao invés de depender da IA genérica da IDE.

3. **Supabase/PlanetScale MCP** — Na fase de Backend, conectar diretamente ao banco para gerar migrations, validar schemas, rodar seeds — tudo via protocolo MCP.

4. **Vercel/Netlify MCP** — Na fase de Deploy, o Maestro poderia orquestrar deploy automático via MCP, validando que o projeto compila e testes passam antes de deployar.

5. **Linear/Jira MCP** — Sincronizar `EstadoProjeto.tasks` com ferramentas de gestão de projeto. Tasks criadas no Maestro aparecem no Linear; status atualizado no Linear reflete no Maestro.

---

## 🏆 Top 3 Oportunidades de Melhoria

### #1: Simplificação Radical do Onboarding

- **Problema:** 3 caminhos de onboarding (specialist, brainstorm, discovery), múltiplas confirmações obrigatórias, instruções longas que confundem
- **Proposta:** 1 caminho único (specialist), defaults inteligentes (sem pedir confirmação de config se for primeira vez), respostas compactas
- **Impacto:** Reduz de 5-7 interações para 2-3. Primeira impressão positiva.

### #2: Estado Tipado + Decomposição de God Files

- **Problema:** `onboarding?: any`, specialist-phase-handler 1296 linhas, proximo.ts 1223 linhas
- **Proposta:** Tipar `OnboardingState`, decompor em módulos <300 linhas, eliminar `as any`
- **Impacto:** Bugs detectados em compile-time. Contribuidores open source conseguem entender e modificar módulos isolados.

### #3: Entry Point Único + Remoção de Legado

- **Problema:** 2 entry points divergentes, 37 tools legadas, 4 middlewares deprecated
- **Proposta:** Unificar via SDK `Server` + transport plugável. Mover legadas para pacote separado com migration guide.
- **Impacto:** Codebase 40% menor. Manutenção em 1 lugar.

---

*Análise concluída em 25/02/2026.*  
*Baseada em leitura completa do código-fonte de ~15.000 linhas TypeScript.*
