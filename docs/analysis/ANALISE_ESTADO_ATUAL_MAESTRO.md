# Análise Profunda do Estado Atual do Maestro MCP

**Data:** 06/02/2026  
**Autor:** Especialista em MCP, Engenharia de Software e Desenvolvimento com IA  
**Versão Original Analisada:** v2.6.2 / v2.1.0  
**Atualizado em:** 06/02/2026 — Pós implementação v3.0.0 (ver seção 10)

---

## 1. Visão Geral do Objetivo

O Maestro busca ser um **orquestrador de desenvolvimento de software por IA** que utiliza princípios de engenharia e arquitetura de software para garantir resultados **robustos, de qualidade e consistentes independente do modelo de IA**. O sistema opera como um servidor MCP (Model Context Protocol) via `npx` local, integrando-se a IDEs como Windsurf, Cursor e Antigravity.

### Avaliação: Quão perto estamos do objetivo?

| Dimensão | Maturidade | Score |
|----------|-----------|-------|
| **Estrutura de fases e gates** | Alta - Fluxos bem definidos (7/13/17 fases) | 8/10 |
| **Conteúdo especialista** | Muito Alta - 374 skills, 62+ especialistas | 9/10 |
| **Orquestração real** | Baixa - IA ainda precisa saber a ordem | 3/10 |
| **Independência do modelo** | Baixa - Depende de instrução em texto livre | 3/10 |
| **Fluxo de onboarding** | Média - Existe mas é fragmentado | 5/10 |
| **Persistência de estado** | Média - Stateless funcional mas frágil | 5/10 |
| **Qualidade de código** | Média - Duplicações, entry points divergentes | 4/10 |
| **Testabilidade** | Baixa - 4 testes, sem CI rodando | 2/10 |
| **Experiência do desenvolvedor** | Baixa - Muitos prompts, fluxo confuso | 3/10 |

**Score médio ponderado: ~4.5/10** - O sistema tem uma base conceitual excelente e um acervo de conteúdo impressionante, mas a camada de orquestração (o core do objetivo) ainda está imatura.

---

## 2. Arquitetura Atual

### 2.1 Topologia do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     IDE (Windsurf/Cursor/AG)            │
│                          ↕ MCP Protocol                 │
├─────────────────────────────────────────────────────────┤
│  Entry Points (DIVERGENTES)                             │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  stdio.ts     │  │  index.ts    │                     │
│  │  (STDIO/npx)  │  │  (HTTP/SSE)  │                     │
│  │  35 tools     │  │  24 tools    │                     │
│  └──────┬───────┘  └──────┬───────┘                     │
│         │                  │                             │
│         └────────┬─────────┘                             │
│                  ↓                                       │
│  ┌─────────────────────────────────────┐                │
│  │          Tools Layer (~30 tools)     │                │
│  │  tools/*.ts + flows/*.ts            │                │
│  └─────────────┬───────────────────────┘                │
│                ↓                                         │
│  ┌─────────────────────────────────────┐                │
│  │      Core Modules (~23 domínios)    │                │
│  │  core/knowledge, core/checkpoint,   │                │
│  │  core/validation, core/risk, etc.   │                │
│  └─────────────┬───────────────────────┘                │
│                ↓                                         │
│  ┌─────────────────────────────────────┐                │
│  │   State + Utils + Types             │                │
│  │  state/, utils/, types/             │                │
│  └─────────────────────────────────────┘                │
│                                                         │
│  ┌─────────────────────────────────────┐                │
│  │   Content (374 skills, workflows)   │                │
│  │  content/skills/, content/workflows/ │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Entry Points Divergentes - Problema Estrutural #1

O sistema possui **dois entry points completamente independentes** que não compartilham código de roteamento:

| Aspecto | `stdio.ts` (npx) | `index.ts` (HTTP) |
|---------|-------------------|-------------------|
| Tools registradas | 35 | 24 |
| Knowledge tools | Sim | Nao |
| Checkpoint tools | Sim | Nao |
| Validation tools | Sim | Nao |
| Risk/AutoFix tools | Sim | Nao |
| `setup_inicial` | Nao | Sim |
| `confirmar_stitch` | Nao | Sim |
| `onboarding_orchestrator` | Nao (via server.ts) | Sim |
| `brainstorm` | Nao (via server.ts) | Sim |
| `prd_writer` | Nao (via server.ts) | Sim |
| Parâmetros de `iniciar_projeto` | nome, descricao, diretorio, ide, modo | nome, descricao, diretorio (INCOMPLETO) |

**Impacto:** Um usuário que usa o Maestro via `npx` (stdio) tem acesso a tools completamente diferentes de quem usa via HTTP. Pior: o `index.ts` (HTTP) não repassa parâmetros críticos como `auto_flow`, `confirmar_automaticamente`, `brainstorm_mode` para `iniciar_projeto`, tornando esses recursos inacessíveis.

O `tools/index.ts` (usado pelo `server.ts` que é criado em `server.ts` mas **nunca efetivamente conectado** ao fluxo HTTP do `index.ts`) registra ainda mais tools, mas o `index.ts` reimplementa todo o roteamento manualmente, ignorando o que está em `tools/index.ts`.

### 2.3 Modelo Stateless - Problema Estrutural #2

O Maestro opera em modo **stateless**: cada chamada de tool recebe `estado_json` como string, processa, e retorna o estado atualizado para a IA salvar. Isso é uma decisão arquitetural válida para MCPs, mas gera:

1. **Fragilidade**: Se a IA não salva o arquivo retornado, o estado se perde
2. **Overhead de tokens**: O `estado.json` completo (com onboarding, discovery blocks, brainstorm sections) é enviado em cada chamada, consumindo contexto valioso
3. **Inconsistência**: Alguns handlers retornam `estado_atualizado` e `files[]`, outros não (ver `handleProximoBloco` para blocos intermediários)

### 2.4 Fluxo de Onboarding - Problema Estrutural #3

O fluxo atual exige que a IA conheça e execute uma sequência específica:

```
iniciar_projeto → confirmar_projeto → onboarding_orchestrator(iniciar) 
→ onboarding_orchestrator(proximo_bloco) × N → brainstorm(iniciar) 
→ brainstorm(proximo_secao) × 5 → prd_writer(gerar) → prd_writer(validar)
→ proximo(entregavel) → ... (7-17 fases)
```

Cada transição é baseada em **texto livre** nos retornos (ex: "Use `onboarding_orchestrator(...)`"). Nenhuma tool retorna um campo estruturado `next_action` que instrua programaticamente a IA sobre o próximo passo.

---

## 3. Pontos Fortes (o que já funciona bem)

### 3.1 Base de Conteúdo Excepcional

O diretório `content/skills/` contém **374 itens** cobrindo 62 especialidades. Isso é um ativo enorme:

- **20 especialistas completos** com múltiplos arquivos cada (gestão de produto, arquitetura, segurança, etc.)
- **Skills práticas** para patterns de API, frontend, mobile, testing, deployment
- **19 workflows** automatizados (start, debug, deploy, refactor, etc.)
- **Design system** com stacks e indexes

Essa biblioteca de conhecimento é o maior diferencial do Maestro e o que o separa de outros MCPs de orquestração.

### 3.2 Sistema de Fases e Gates

A definição de fluxos em `flows/types.ts` é sólida:

- **3 níveis de complexidade**: simples (7 fases), médio (13 fases), complexo (17 fases)
- Cada fase tem: especialista, template, skill, gate_checklist, entregável esperado
- Gates com score de qualidade, proteção contra avanço prematuro, e sistema de aprovação explícita
- Fase opcional de prototipagem (Stitch)

### 3.3 Discovery Adaptativo

O `discovery-adapter.ts` implementa discovery com blocos adaptativos por modo:
- Economy: 3 blocos (rápido)
- Balanced: 5 blocos (equilibrado)
- Quality: 8 blocos (detalhado)

### 3.4 Knowledge Base Integrada

As tools de `fase1/` (knowledge, checkpoint, validation) demonstram visão avançada:
- ADR Manager para decisões arquiteturais
- Pattern Registry para padrões identificados
- Checkpoint/Rollback para segurança
- Validação de dependências e segurança OWASP

### 3.5 Sistema de Modos

Os 3 modos (economy/balanced/quality) com otimizações por modo é uma abstração inteligente que permite adaptar o processo ao contexto do projeto.

---

## 4. Problemas Críticos Identificados

### 4.1 CRÍTICO: Ausência de Orquestração Real

**O Maestro não orquestra - ele apresenta opções.**

A IA é tratada como agente que precisa saber o que fazer, quando o objetivo é que o Maestro **diga** à IA o que fazer. O retorno de cada tool é texto livre que espera interpretação, ao invés de um contrato programático.

**Exemplo concreto:** Quando `confirmar_projeto` retorna, ele termina com:

```
## 📝 Como Responder
Preencha os campos acima e use o **onboarding_orchestrator** para continuar:
onboarding_orchestrator({
    estado_json: "...",
    acao: "proximo_bloco",
    respostas_bloco: { ... }
})
```

Isso funciona com Claude/GPT-4 que interpretam bem instruções textuais, mas falha com modelos menores ou em contextos longos onde a instrução se perde.

**O que deveria existir:** Um campo estruturado no retorno que qualquer modelo interprete:

```json
{
  "next_action": {
    "tool": "onboarding_orchestrator",
    "args": { "acao": "proximo_bloco" },
    "requires_user_input": true,
    "user_prompt": "Responda as perguntas do bloco acima"
  }
}
```

### 4.2 CRÍTICO: Entry Points Divergentes

Conforme detalhado na seção 2.2, o `stdio.ts` e o `index.ts` são duas implementações independentes com conjuntos de tools diferentes e passagem de parâmetros inconsistente. Isso significa:

1. Features que funcionam num modo não funcionam no outro
2. Bugs precisam ser corrigidos em dois lugares
3. Parâmetros novos são facilmente esquecidos em um dos entry points

**A raiz do problema:** Não existe um **router centralizado**. Cada entry point reimplementa o switch/case de roteamento e a passagem de argumentos.

### 4.3 CRÍTICO: Perda de Estado Intermediário

No `onboarding-orchestrator.ts`, quando um bloco intermediário de discovery é respondido (linhas 362-393), o handler retorna apenas o texto formatado do próximo bloco, **sem incluir `estado_atualizado` nem `files[]`**. Isso significa que as respostas ficam em memória dentro do objeto JavaScript, mas não são persistidas. Se a sessão for interrompida entre blocos, todo o progresso é perdido.

O mesmo problema existe no `brainstorm.ts`: as respostas de seções intermediárias não são persistidas.

### 4.4 ALTO: Duplicação de Código

A função `criarEstadoOnboardingInicial()` existe em dois lugares com código quase idêntico:
- `tools/iniciar-projeto.ts` (linhas 48-71)
- `flows/onboarding-orchestrator.ts` (linhas 35-58)

Isso é sintomático de um problema maior: não há uma camada de domínio/serviço que centralize a lógica de negócio. Cada tool reimplementa o que precisa.

### 4.5 ALTO: server.ts é Morto

O `server.ts` cria um servidor MCP usando o SDK e registra tools via `tools/index.ts` e resources via `resources/index.ts`. Porém, no `index.ts` (HTTP), esse servidor é criado mas **nunca conectado a nenhum transport**. O `index.ts` reimplementa tudo manualmente (handleMcpRequest, callTool, getToolsList, etc.).

O `server.ts` é efetivamente código morto no contexto HTTP. Apenas o `stdio.ts` usa o SDK corretamente via `StdioServerTransport`, mas mesmo assim não usa o `server.ts` - cria seu próprio `Server` inline.

### 4.6 MÉDIO: Brainstorm Bloqueado por Discovery

O `brainstorm.ts` (linhas 222-229) verifica `discoveryStatus !== 'completed'` e bloqueia se discovery não está completo. O plano de refatoração identifica corretamente que isso impede o "Caminho B" (brainstorm antes de coleta formal).

### 4.7 MÉDIO: Validação de PRD é Superficial

A validação de PRD em `prd-writer.ts` verifica apenas se strings existem no documento (`prdConteudo.includes('Problema e Oportunidade')`). Uma seção vazia que contenha o título passaria na validação. Não há análise de profundidade, completude semântica ou verificação de coerência.

### 4.8 MÉDIO: Excesso de Tools

O Maestro expõe **24-35 tools** dependendo do entry point. Para um modelo de IA, isso é uma superfície cognitiva muito grande. A maioria dos modelos performa melhor com 5-10 tools bem definidas. A proliferação de tools (`discovery`, `onboarding_orchestrator`, `brainstorm`, `prd_writer`, `next_steps_dashboard`, `confirmar_stitch`, `confirmar_classificacao`, `setup_inicial`, etc.) cria confusão sobre qual usar e quando.

### 4.9 BAIXO: Versões Inconsistentes

O `package.json` da raiz declara versão `2.1.0`, o `src/package.json` declara `2.6.2`, os banners dos servidores mostram `v1.0.0`. Isso sugere falta de gestão de versões.

---

## 5. Análise do Design para Independência de Modelo

O objetivo de funcionar **consistentemente independente do modelo de IA** é o mais ambicioso e o que está mais longe de ser alcançado. Eis por quê:

### 5.1 O Problema Fundamental

Hoje, o Maestro depende de que a IA:
1. **Leia e interprete** instruções textuais em cada retorno
2. **Saiba a ordem** das tools (iniciar → confirmar → onboarding → brainstorm → prd)
3. **Extraia** campos específicos de texto formatado para repassar como argumentos
4. **Salve arquivos** retornados no campo `files[]`
5. **Leia resources** (especialistas, templates) antes de gerar entregáveis

Modelos como Claude 3.5 e GPT-4o fazem isso razoavelmente. Modelos menores (Llama, Mistral, Gemma) ou mesmo versões "economy" de modelos maiores frequentemente:
- Pulam instruções textuais longas
- Inventam argumentos ou chamam tools erradas
- Não seguem sequências multi-step
- Ignoram ações obrigatórias em meio a texto grande

### 5.2 O Que Tornaria Independente de Modelo

Para que o Maestro funcione com **qualquer** modelo que suporte MCP:

1. **Retornos estruturados, não textuais**: O campo `next_action` com tool, args, e user_prompt
2. **Menos tools, mais estados**: Uma tool `maestro()` que detecta o contexto e retorna o próximo passo
3. **Validação automática de ações da IA**: O Maestro deveria validar se a IA está fazendo o que deveria
4. **Estado gerenciado pelo servidor**: Ao invés de depender da IA para persistir estado, o MCP deveria salvar no filesystem diretamente
5. **System prompt injetado**: Ao invés de depender da IA ler resources, o system prompt deveria ser injetado automaticamente via MCP

---

## 6. Análise do Conteúdo vs Código

### Proporção Conteúdo:Código

```
Content:  374 skills + 19 workflows + rules + design-system = ~500 arquivos
Código:   ~50 arquivos TypeScript em src/src/
Ratio:    10:1 (conteúdo:código)
```

Isso revela que o Maestro investiu muito mais em **o que ensinar** do que em **como ensinar**. O conteúdo é excelente, mas o mecanismo de entrega (a camada MCP) ainda é rudimentar.

### Workflows: Joia Escondida

Os 19 workflows em `content/workflows/` (mcp-start, mcp-debug, mcp-gate, orchestrate, etc.) representam sequências de ações que a IA deveria seguir. Porém, esses workflows são **documentos markdown estáticos** que a IA precisa ler e interpretar. Se fossem codificados como máquinas de estado dentro do MCP, seriam muito mais confiáveis.

---

## 7. Comparação com MCPs Profissionais de Referência

### 7.1 Padrões de MCPs Maduros

| Pattern | MCPs Maduros | Maestro Atual |
|---------|-------------|---------------|
| Router centralizado | Sim | Nao (2 switches manuais) |
| Schema validation (Zod) | Sim | Parcial (Zod importado mas pouco usado) |
| Middleware chain | Sim | Nao |
| Structured responses | Sim | Nao (texto livre) |
| Error hierarchy | Sim | Nao (string genérica) |
| Logging structured | Sim | Parcial (console.error) |
| Config management | Sim | Parcial (config.ts basico) |
| Test coverage > 80% | Sim | ~5% (4 test files) |
| Versioning coherent | Sim | Nao (3 versões diferentes) |

### 7.2 Spec-Workflow MCP (Referência)

O Maestro já tem uma análise comparativa com o Spec-Workflow em `docs/analise-spec-workflow/`. O Spec-Workflow foca em especificação, enquanto o Maestro cobre o ciclo completo. O diferencial do Maestro é a **profundidade de conteúdo por fase**, mas o Spec-Workflow tem melhor orquestração.

---

## 8. Diagnóstico de Saúde do Projeto

### Dívida Técnica Acumulada

| Área | Severidade | Descrição |
|------|-----------|-----------|
| Entry points divergentes | CRÍTICA | 2 implementações independentes |
| Código morto (server.ts + mcpServer) | ALTA | Criado mas nunca usado no HTTP |
| Duplicação criarEstadoOnboarding | MÉDIA | 2 implementações quase idênticas |
| Estado intermediário não persistido | ALTA | Dados perdidos entre blocos |
| Versões inconsistentes | BAIXA | 3 versões diferentes |
| Parâmetros não repassados | CRÍTICA | Features inacessíveis via HTTP |
| Ausência de Zod validation real | MÉDIA | Zod importado, casts manuais usados |
| Testes insuficientes | ALTA | 4 testes para ~50 arquivos |
| Retornos não estruturados | ALTA | Texto livre ao invés de contratos |

### Saúde Geral: 4/10 (Funcional, mas frágil)

O sistema funciona em cenários felizes com IDEs que usam modelos fortes (Windsurf + Claude). Fora desse cenário, a experiência degrada rapidamente.

---

## 9. Resumo Executivo

### O que o Maestro **é** hoje:
- Uma excelente **biblioteca de conteúdo** para desenvolvimento de software com IA
- Um **framework de fases** bem pensado com gates de qualidade
- Um **MCP funcional** para cenários básicos em IDEs compatíveis

### O que o Maestro **não é** ainda:
- Um **orquestrador real** que guia a IA programaticamente
- Um sistema **independente de modelo** que funciona com qualquer LLM
- Um **MCP profissional** com arquitetura limpa e testável
- Uma **experiência fluida** para o desenvolvedor (muitos prompts, fluxo confuso)

### A lacuna principal:
**O Maestro tem todo o conhecimento, mas não sabe como entregá-lo de forma confiável.** A camada de orquestração MCP precisa evoluir de "toolkit passivo que a IA interpreta" para "orquestrador ativo que a IA obedece".

---

*Próximo documento: [ROADMAP_MELHORIAS_MAESTRO.md](../roadmap/ROADMAP_MELHORIAS_MAESTRO.md) - Plano de evolução com prioridades, arquitetura-alvo e implementação.*

---

## 10. Reavaliação Pós-v3.0.0 (06/02/2026)

### 10.1 O que mudou

A versão 3.0.0 implementou os Marcos 0 (Estabilização) e parte do Marco 1 (Orquestração Real) do roadmap. As mudanças foram documentadas em [CONTROLE_IMPLEMENTACAO.md](../implementation/CONTROLE_IMPLEMENTACAO.md).

**Mudanças estruturais:**
- **Router centralizado** (`router.ts`) — ponto único de roteamento para 44 tools
- **Entry points unificados** — `stdio.ts` e `index.ts` delegam ao router
- **Serviço compartilhado de onboarding** — `onboarding.service.ts` elimina duplicação
- **Persistência intermediária** — todo handler retorna `estado_atualizado` e `files[]`
- **Contrato estruturado** — tipos `NextAction`, `SpecialistPersona`, `FlowProgress` definidos
- **next_action em 8 tools** — fluxo de onboarding completo é orquestrado programaticamente
- **Brainstorm desbloqueado** — Caminho B habilitado (brainstorm sem discovery completo)
- **Versão unificada** — `3.0.0` em todo o sistema

### 10.2 Reavaliação do Scorecard

| Dimensão | Score v2.x | Score v3.0.0 | Δ | Justificativa |
|----------|-----------|-------------|---|---------------|
| **Estrutura de fases e gates** | 8/10 | 8/10 | = | Sem mudança direta |
| **Conteúdo especialista** | 9/10 | 9/10 | = | Sem mudança direta |
| **Orquestração real** | 3/10 | **5/10** | +2 | `next_action` em 8 tools de onboarding, fluxo programático setup→discovery→brainstorm→PRD |
| **Independência do modelo** | 3/10 | **4.5/10** | +1.5 | Contratos estruturados reduzem dependência de interpretação textual, mas ainda faltam flow engine e consolidação |
| **Fluxo de onboarding** | 5/10 | **6.5/10** | +1.5 | Persistência corrigida, Caminho B habilitado, next_action guia o fluxo |
| **Persistência de estado** | 5/10 | **6.5/10** | +1.5 | Estado intermediário agora persistido em todo bloco; ainda depende da IA salvar |
| **Qualidade de código** | 4/10 | **6.5/10** | +2.5 | Router elimina duplicação de roteamento, serviço compartilhado, ~500 linhas de código morto removidas |
| **Testabilidade** | 2/10 | **3/10** | +1 | Build e 222 testes passam; novo código ainda sem testes dedicados |
| **Experiência do desenvolvedor** | 3/10 | **4/10** | +1 | Paridade de tools entre transports, next_action orienta a IA |

**Score médio ponderado: ~5.9/10** (vs 4.5/10 antes) — **Melhora de +1.4 pontos**

### 10.3 Problemas Críticos — Status Atualizado

| # | Problema Original | Severidade | Status v3.0.0 |
|---|-------------------|-----------|---------------|
| 4.1 | Ausência de Orquestração Real | CRÍTICO | **Parcialmente resolvido** — `next_action` implementado em 8 tools de onboarding. Falta flow engine, consolidação de tools, e `next_action` nas ~36 tools restantes. |
| 4.2 | Entry Points Divergentes | CRÍTICO | **✅ Resolvido** — Router centralizado com 44 tools. Ambos entry points usam `routeToolCall()`. |
| 4.3 | Perda de Estado Intermediário | CRÍTICO | **✅ Resolvido** — `handleProximoBloco` e `handleIniciar` sempre retornam `estado_atualizado` e `files[]`. |
| 4.4 | Duplicação de Código | ALTO | **✅ Resolvido** — `criarEstadoOnboardingInicial` centralizado em `onboarding.service.ts`. |
| 4.5 | server.ts Morto | ALTO | **⏳ Pendente** — `server.ts` e `TOOLS_AS_RESOURCES` ainda existem. |
| 4.6 | Brainstorm Bloqueado | MÉDIO | **✅ Resolvido** — Guard removido, aviso visual quando discovery incompleto. |
| 4.7 | Validação PRD Superficial | MÉDIO | **⏳ Pendente** — Mesma validação por substring. |
| 4.8 | Excesso de Tools | MÉDIO | **⏳ Pendente** — Agora são 44 tools (pior numericamente, mas consistentes). |
| 4.9 | Versões Inconsistentes | BAIXO | **✅ Resolvido** — Unificado em `3.0.0`. |

### 10.4 Novos Problemas Identificados

| # | Problema | Severidade | Descrição |
|---|---------|-----------|-----------|
| N1 | Router sem validação Zod real | MÉDIO | O router usa schemas JSON para ListTools mas não faz `.parse()` com Zod nos args. Validação é delegada às tools individualmente. |
| N2 | `specialist_persona` em apenas 1 tool | BAIXO | O tipo existe mas só `confirmar_projeto` popula. Valor reduzido sem adoção ampla. |
| N3 | `next_action` ausente em tools não-onboarding | MÉDIO | `proximo`, `status`, `classificar`, `salvar`, `contexto` etc. não retornam `next_action`. O fluxo pós-PRD fica sem orquestração. |
| N4 | `iniciar_projeto` ainda usa inferência automática | MÉDIO | O plano previa perguntas conversacionais ao invés de inferir tipo/complexidade. Não implementado. |

### 10.5 Arquitetura Atualizada

```
┌─────────────────────────────────────────────────────────┐
│                     IDE (Windsurf/Cursor/AG)            │
│                          ↕ MCP Protocol                 │
├─────────────────────────────────────────────────────────┤
│  Entry Points (UNIFICADOS via Router)          [v3.0.0] │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  stdio.ts     │  │  index.ts    │                     │
│  │  (STDIO/npx)  │  │  (HTTP/SSE)  │                     │
│  └──────┬───────┘  └──────┬───────┘                     │
│         └────────┬─────────┘                             │
│                  ↓                                       │
│  ┌─────────────────────────────────┐           [v3.0.0] │
│  │     Router Centralizado         │                     │
│  │     router.ts (44 tools)        │                     │
│  │     routeToolCall() + registry  │                     │
│  └─────────────┬───────────────────┘                     │
│                ↓                                         │
│  ┌─────────────────────────────────────┐                │
│  │     Services Layer                  │       [v3.0.0] │
│  │  ┌──────────────────────────┐       │                │
│  │  │ onboarding.service.ts    │       │                │
│  │  │ (estado compartilhado)   │       │                │
│  │  └──────────────────────────┘       │                │
│  └─────────────┬───────────────────────┘                │
│                ↓                                         │
│  ┌─────────────────────────────────────┐                │
│  │     Tools Layer (44 tools)          │                │
│  │  tools/*.ts + flows/*.ts            │                │
│  │  Retornam: content + next_action    │       [v3.0.0] │
│  │  + specialist_persona + progress    │                │
│  └─────────────┬───────────────────────┘                │
│                ↓                                         │
│  ┌─────────────────────────────────────┐                │
│  │      Core + State + Utils + Types   │                │
│  └─────────────────────────────────────┘                │
│  ┌─────────────────────────────────────┐                │
│  │   Content (374 skills, workflows)   │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### 10.6 Resumo: Onde Estamos Agora

**O Maestro v3.0.0 tem uma base técnica sólida.** Os problemas estruturais críticos (entry points divergentes, perda de estado, duplicação, parâmetros truncados) foram resolvidos. A fundação para orquestração real está pronta com o contrato `MaestroResponse` e `next_action`.

**O que falta para atingir o objetivo de "orquestrador ativo":**
1. **Flow Engine** — codificar transições de fase como state machine (Marco 1.2)
2. **Consolidação de Tools** — reduzir de 44 para ~8 tools (Marco 1.3)
3. **Persistência Ativa** — MCP gravar no filesystem (Marco 1.4)
4. **iniciar_projeto conversacional** — perguntas em blocos ao invés de inferência (Plano Fase 1)
5. **next_action em TODAS as tools** — não apenas as 8 de onboarding
6. **Smart Defaults e Templates** — reduzir fricção do onboarding (Marco 2)

Ver plano detalhado: [PROXIMOS_PASSOS_V3.md](../implementation/PROXIMOS_PASSOS_V3.md)
