# Plano de Refatoração: Fluxo de Início de Projeto no Maestro

## Fase 0: Setup Inicial (Pré-requisito)

### Contexto

Antes de iniciar qualquer projeto, o Maestro oferece uma ferramenta `setup_inicial` que salva configurações globais do usuário em `~/.maestro/config.json`. Isso evita perguntas repetidas sobre IDE, modo e preferências em cada novo projeto.

### Implementação Atual

**Arquivos envolvidos:**
- `src/src/tools/setup-inicial.ts` — Tool que coleta e salva configurações
- `src/src/utils/config.ts` — Funções de persistência (`loadUserConfig`, `saveUserConfig`)

**Interface de configuração:**
```typescript
interface MaestroUserConfig {
    ide: "windsurf" | "cursor" | "antigravity";
    modo: "economy" | "balanced" | "quality";
    usar_stitch: boolean;
    preferencias_stack?: {
        frontend?: "react" | "vue" | "angular" | "nextjs";
        backend?: "node" | "java" | "php" | "python";
        database?: "postgres" | "mysql" | "mongodb";
    };
    team_size?: "solo" | "pequeno" | "medio" | "grande";
    version?: string;
}
```

**Comportamento atual:**
1. Se chamado sem parâmetros obrigatórios → retorna formulário para preencher
2. Se chamado com parâmetros completos → salva em `~/.maestro/config.json`
3. `iniciar_projeto` já usa `loadUserConfig()` para carregar preferências salvas

### Fluxo Desejado com Setup

```
Usuário: "quero usar o maestro" (primeira vez)
    ↓
IA detecta: Nenhuma config em ~/.maestro/config.json
    ↓
IA chama: setup_inicial() (sem args)
    ↓
Maestro retorna: Formulário de setup inicial
  ┌─────────────────────────────────────────────────────┐
  │  ⚙️ Setup Inicial do Maestro                        │
  │                                                     │
  │  Defina uma única vez suas preferências:            │
  │                                                     │
  │  1. IDE: windsurf | cursor | antigravity            │
  │  2. Modo: economy | balanced | quality              │
  │  3. Usar Stitch: true | false                       │
  │  4. Stack preferida (opcional):                     │
  │     - Frontend: react | vue | angular | nextjs      │
  │     - Backend: node | java | php | python           │
  │     - Database: postgres | mysql | mongodb          │
  │  5. Tamanho do time: solo | pequeno | medio | grande│
  └─────────────────────────────────────────────────────┘
    ↓
Usuário responde (1 prompt)
    ↓
IA chama: setup_inicial({ ide, modo, usar_stitch, ... })
    ↓
Maestro: Salva config em ~/.maestro/config.json
         Retorna confirmação + next_action → iniciar_projeto
    ↓
Próximas vezes: Config já existe, pula direto para iniciar_projeto
```

### Integração com o Fluxo de Início

O `iniciar_projeto` já integra com o setup:
```typescript
// Em iniciar-projeto.ts (linha 185-187)
const configGlobal = await loadUserConfig();
const ideEfetiva = args.ide || configGlobal?.ide;
const modoEfetivo = args.modo || configGlobal?.modo || 'balanced';
```

**Problema atual:** Se não há config global E o usuário não passa `ide`, o `iniciar_projeto` retorna um wizard próprio pedindo as mesmas informações. Isso é redundante.

### Mudanças Propostas para Fase 0

1. **Adicionar `next_action` ao retorno de `setup_inicial`:**
   ```typescript
   return {
       content: [...],
       next_action: {
           tool: "iniciar_projeto",
           description: "Agora você pode iniciar um projeto",
           args_template: { nome: "", diretorio: "" },
           requires_user_input: true,
           user_prompt: "Qual o nome e diretório do projeto?"
       }
   };
   ```

2. **Modificar `iniciar_projeto` para sugerir setup primeiro:**
   - Se não há config global E não há `ide` nos args → sugerir `setup_inicial` ao invés de wizard inline
   - Isso centraliza a configuração em um único lugar

3. **Adicionar verificação de config no início do fluxo:**
   ```typescript
   // Em iniciar_projeto, antes de qualquer coisa:
   const configGlobal = await loadUserConfig();
   if (!configGlobal && !args.ide) {
       return {
           content: [{ type: "text", text: "Execute setup_inicial primeiro..." }],
           next_action: { tool: "setup_inicial", ... }
       };
   }
   ```

---

## Diagnóstico do Problema

### Fluxo Atual (Quebrado)
```
Usuário: "inicie um projeto com o maestro"
    ↓
IA chama: iniciar_projeto(nome, diretorio)
    ↓
Maestro retorna: mensagem com sugestões inferidas + pede confirmar_projeto()
    ↓
IA chama: confirmar_projeto(nome, tipo, nivel, ide, modo)
    ↓
Maestro retorna: estado.json + resumo.json + resumo.md + blocos de discovery vazios
    ↓
IA cria os arquivos e mostra mensagem final ao usuário
    ↓
PROBLEMA: Nenhuma pergunta foi feita ao usuário!
          Tipo/complexidade foram INFERIDOS automaticamente
          Discovery blocks ficam vazios (pending)
          Usuário precisa manualmente chamar onboarding_orchestrator
          Não há conexão entre os fluxos
```

### Problemas Identificados

1. **`iniciar_projeto` infere tipo/complexidade ao invés de perguntar** (linhas 96-130 de iniciar-projeto.ts)
   - `inferirTipoArtefato()` e `inferirComplexidade()` decidem sozinhos
   - A IA recebe sugestões e confirma sem consultar o usuário

2. **`confirmar_projeto` cria tudo imediatamente** sem discovery prévio
   - Cria estado.json com discovery blocks vazios
   - Retorna mensagem enorme com JSON para a IA salvar
   - Não faz perguntas ao usuário

3. **Fluxos desconectados** - cada tool é uma ilha:
   - `iniciar_projeto` → `confirmar_projeto` → (gap) → `onboarding_orchestrator` → (gap) → `brainstorm` → (gap) → `prd_writer`
   - A IA precisa saber a ordem e chamar manualmente cada tool
   - O retorno de cada tool não instrui a IA sobre o próximo passo de forma programática

4. **Discovery não é conversacional** - retorna formulário estático
   - Blocos são apresentados como formulários para preencher
   - Não há diálogo interativo com o usuário
   - Usuário que não sabe exatamente o que quer não tem ajuda para pensar

5. **Muitos prompts no modo conversacional** - perguntas uma a uma
   - Se cada pergunta fosse enviada separadamente, seriam 10+ prompts só para coletar contexto
   - Isso consome tokens, é lento e frustra o usuário

6. **Brainstorm é opcional e desconectado**
   - Só pode ser ativado após discovery completo
   - Não é oferecido como opção durante o início

---

## Fluxo Desejado

```
Usuário: "inicie um projeto com o maestro"
    ↓
IA chama: iniciar_projeto(nome, diretorio)
    ↓
Maestro retorna: PERGUNTAS EM BLOCO (para evitar múltiplos prompts)
  - Bloco 1: "Sobre o Projeto" (Nome, Problema, Público)
  - Pergunta final: "Gostaria da ajuda de um especialista para explorar essas ideias antes de definir o escopo? (Brainstorm Assistido)"
    ↓
Usuário responde (ex: preenche dados + "Sim, quero ajuda")
    ↓
IA chama: iniciar_projeto com respostas OU onboarding_orchestrator
    ↓
Se brainstorm solicitado → Maestro ativa brainstorm assistido IMEDIATAMENTE
    ↓
Se brainstorm NÃO solicitado → Maestro segue para coleta de dados técnicos (Bloco 2) ou confirmação
    ↓
Após coleta completa → Maestro cria arquivos automaticamente
    ↓
Maestro retorna: instrução clara do próximo passo
```

### Caminho A: Usuário sabe o que quer (direto)

```
Usuário: "inicie um projeto com o maestro"
    ↓
IA chama: iniciar_projeto(nome, diretorio)
    ↓
Maestro retorna: BLOCO 1 — Perguntas essenciais agrupadas:
  ┌─────────────────────────────────────────────────────┐
  │  📋 Para começar, preciso entender seu projeto:     │
  │                                                     │
  │  1. Qual problema esse projeto resolve?             │
  │  2. Quem é o público-alvo?                          │
  │  3. Liste 3-5 funcionalidades principais do MVP     │
  │  4. Plataformas alvo: Web / Mobile / Desktop        │
  │  5. Cronograma desejado (ex: 3 meses)               │
  │                                                     │
  │  💡 Não tem certeza sobre algum item?               │
  │  → Responda "quero ajuda de um especialista" e      │
  │    ativarei o brainstorm assistido para ajudar       │
  │    você a pensar sobre o projeto.                   │
  └─────────────────────────────────────────────────────┘
    ↓
Usuário responde tudo de uma vez (1 prompt)
    ↓
IA chama: iniciar_projeto(nome, diretorio, respostas_bloco={...})
    ↓
Maestro retorna: BLOCO 2 — Perguntas técnicas (opcional, adaptado ao modo):
  ┌─────────────────────────────────────────────────────┐
  │  ⚙️ Detalhes técnicos (responda o que souber):     │
  │                                                     │
  │  1. Stack preferida (ou "sugerir")                  │
  │  2. Tamanho do time                                 │
  │  3. Infraestrutura: Cloud / On-premise / Híbrido    │
  │  4. Requisitos de performance                       │
  │  5. Compliance: LGPD / PCI-DSS / HIPAA / Nenhum    │
  └─────────────────────────────────────────────────────┘
    ↓
Usuário responde (1 prompt)
    ↓
IA chama: iniciar_projeto(nome, diretorio, respostas_bloco={...}, bloco=2)
    ↓
Maestro: Cria estado.json + resumo COM discovery preenchido
         Retorna next_action → prd_writer ou proximo
    ↓
TOTAL: 2-3 prompts do usuário (vs 10+ no modo conversacional)
```

### Caminho B: Usuário quer ajuda para pensar (brainstorm)

```
Usuário: "inicie um projeto com o maestro"
    ↓
IA chama: iniciar_projeto(nome, diretorio)
    ↓
Maestro retorna: BLOCO 1 (mesmo acima)
    ↓
Usuário: "quero ajuda de um especialista" ou "não tenho certeza"
    ↓
IA chama: iniciar_projeto(nome, diretorio, usar_brainstorm=true)
    ↓
Maestro retorna: Ativa BRAINSTORM EXPLORATÓRIO
  ┌─────────────────────────────────────────────────────┐
  │  🧠 Especialista em Brainstorm ativado!             │
  │                                                     │
  │  Vou ajudar você a pensar sobre o projeto.          │
  │  Responda o que puder sobre cada tópico:            │
  │                                                     │
  │  PROBLEMA E OPORTUNIDADE:                           │
  │  - Que dor/necessidade você identificou?            │
  │  - Como as pessoas resolvem isso hoje?              │
  │  - O que torna sua ideia diferente?                 │
  │                                                     │
  │  PÚBLICO E MERCADO:                                 │
  │  - Quem se beneficiaria mais?                       │
  │  - Qual é o perfil dessas pessoas?                  │
  │  - Existe mercado para isso?                        │
  │                                                     │
  │  MVP E PRIORIDADES:                                 │
  │  - Se tivesse que lançar em 1 semana, o que faria?  │
  │  - Qual é a funcionalidade que "vende" o produto?   │
  │  - O que pode ficar para depois?                    │
  └─────────────────────────────────────────────────────┘
    ↓
Usuário responde livremente (1 prompt)
    ↓
IA chama: iniciar_projeto(nome, diretorio, respostas_brainstorm={...})
    ↓
Maestro: Consolida respostas do brainstorm → preenche discovery automaticamente
         Cria estado.json + resumo COM dados reais
         Retorna next_action → prd_writer
    ↓
TOTAL: 2-3 prompts (brainstorm + confirmação)
```

### Caminho C: Usuário quer brainstorm mais profundo (múltiplas seções)

```
(Após Caminho B, se o usuário quiser aprofundar)
    ↓
Maestro retorna: Seções adicionais de brainstorm em blocos:
  - Bloco: Métricas de Sucesso e North Star
  - Bloco: Riscos e Mitigações
  - Bloco: Diferenciais Competitivos
    ↓
Cada bloco = 1 prompt do usuário
    ↓
Após todos os blocos → consolida em PRD draft
```

## Princípios de Design do Novo Fluxo

1. **Perguntas em BLOCOS, não conversacional** — Agrupar perguntas relacionadas em blocos coesos enviados de uma vez. Cada bloco é um único prompt com múltiplas perguntas. Isso reduz drasticamente o número de interações.
2. **Oferta de especialista brainstorm ANTES de coletar dados** — Na primeira interação, perguntar se o usuário quer ajuda de um especialista para pensar sobre o projeto. Se sim, ativar brainstorm assistido que ajuda a definir problema/público/MVP antes do discovery formal.
3. **Máximo 2-3 interações** antes de criar arquivos — Bloco 1 (essencial) + Bloco 2 (técnico, opcional) + criação. Não mais que isso.
4. **Cada retorno instrui o próximo passo** — Campo `next_action` programático em todo retorno.
5. **Arquivos criados só com dados reais** — Nunca criar estado.json com discovery vazio.

## Requisitos Funcionais do Novo Fluxo

**Mudanças gerais:**
1. Quando chamado apenas com `nome` e `diretorio` (sem respostas), retornar **Bloco 1 de Perguntas** (Nome, Problema, Público).
2. Adicionar pergunta explícita sobre **Brainstorm Assistido** ao final do bloco.
3. Adicionar campo `respostas_iniciais` ao schema para receber respostas do usuário.
4. Remover inferência automática de tipo/complexidade no primeiro passo.
5. Só criar arquivos APÓS coletar respostas mínimas.

**Novo comportamento detalhado:**

1. **Novo comportamento quando chamado sem respostas:**
   - Retornar BLOCO 1 com todas as perguntas essenciais agrupadas.
   - Incluir oferta de brainstorm assistido no final do bloco.
   - NÃO inferir tipo/complexidade.
   - NÃO criar arquivos.

2. **Novo comportamento quando chamado com `usar_brainstorm=true`:**
   - Retornar bloco de brainstorm exploratório (perguntas abertas agrupadas).
   - Perguntas focadas em ajudar o usuário a PENSAR, não preencher formulário.
   - Incluir `next_action` apontando para consolidação.

3. **Novo comportamento quando chamado com `respostas_bloco`:**
   - Se bloco 1 respondido → verificar modo, retornar bloco 2 (técnico) se balanced/quality.
   - Se bloco 2 respondido (ou economy) → criar arquivos com discovery preenchido.
   - Inferir tipo/complexidade BASEADO nas respostas reais do usuário.

4. **Novo comportamento quando chamado com `respostas_brainstorm`:**
   - Extrair dados estruturados das respostas livres do brainstorm.
   - Preencher campos do discovery automaticamente.
   - Criar arquivos com tudo preenchido.

---

## Plano de Implementação

### Fase 1: Refatorar `iniciar_projeto` para ser conversacional

**Arquivo:** `src/src/tools/iniciar-projeto.ts`

**Mudanças:**
1. Quando chamado apenas com `nome` e `diretorio` (sem respostas), retornar **perguntas conversacionais** ao invés de inferir tipo/complexidade
2. Adicionar campo `respostas_iniciais` ao schema para receber respostas do usuário
3. Remover inferência automática de tipo/complexidade no primeiro passo
4. Adicionar opção explícita de "brainstorm assistido" na primeira interação
5. Só criar arquivos APÓS coletar respostas mínimas

**Nova interface:**
```typescript
interface IniciarProjetoArgs {
    nome: string;
    diretorio: string;
    descricao?: string;
    ide?: 'windsurf' | 'cursor' | 'antigravity';
    // NOVO: respostas do discovery inicial
    respostas_iniciais?: {
        problema?: string;
        publico_alvo?: string;
        funcionalidades_principais?: string[];
        plataformas?: string[];
        cronograma?: string;
        usar_brainstorm?: boolean;
    };
    // Mantém os existentes para retrocompatibilidade
    modo?: 'economy' | 'balanced' | 'quality';
    auto_flow?: boolean;
    usar_stitch?: boolean;
    confirmar_automaticamente?: boolean;
}
```

**Lógica do novo fluxo:**
```
SE não tem respostas_iniciais:
    → Retornar perguntas conversacionais (Bloco 1: Sobre o Projeto)
    → Incluir opção de brainstorm assistido
    → NÃO criar arquivos ainda
    → Incluir campo `next_action` no retorno

SE tem respostas_iniciais MAS faltam dados:
    → Retornar próximo bloco de perguntas
    → Incluir resumo do que já foi coletado

SE tem respostas_iniciais COMPLETAS:
    → Inferir tipo/complexidade BASEADO nas respostas reais
    → Criar estado.json com discovery já preenchido
    → Se usar_brainstorm=true → retornar instrução para iniciar brainstorm
    → Se usar_brainstorm=false → retornar instrução para prd_writer
```

### Fase 2: Adicionar campo `next_action` nos retornos de todas as tools

**Arquivos:** Todos os tools do fluxo de onboarding

**Mudança:** Adicionar ao `ToolResult` um campo estruturado `next_action`:
```typescript
interface ToolResult {
    content: [...];
    files?: [...];
    estado_atualizado?: string;
    // NOVO: instrução programática para a IA
    next_action?: {
        tool: string;           // nome da próxima tool a chamar
        description: string;    // descrição para a IA
        args_template: Record<string, any>; // template de argumentos
        requires_user_input: boolean; // se precisa perguntar ao usuário
        user_prompt?: string;   // pergunta para fazer ao usuário
    };
}
```

**Impacto:** Cada tool sabe qual é o próximo passo e instrui a IA programaticamente.

### Fase 3: Refatorar `confirmar_projeto` para ser chamado internamente

**Arquivo:** `src/src/tools/iniciar-projeto.ts`

**Mudança:** `confirmar_projeto` não deve ser uma tool exposta diretamente. Deve ser chamado internamente por `iniciar_projeto` quando todas as respostas estiverem coletadas.

Alternativa: Manter como tool mas mudar para aceitar o estado de discovery preenchido.

### Fase 4: Conectar brainstorm ao fluxo de início

**Arquivo:** `src/src/tools/brainstorm.ts`

**Mudanças:**
1. Permitir iniciar brainstorm ANTES do discovery completo (modo exploratório)
2. Adicionar modo "brainstorm_inicial" que ajuda a definir problema/público/MVP
3. Resultados do brainstorm alimentam automaticamente o discovery

### Fase 5: Refatorar `onboarding-orchestrator` como hub central

**Arquivo:** `src/src/flows/onboarding-orchestrator.ts`

**Mudanças:**
1. Adicionar ação `auto_flow` que gerencia todo o fluxo automaticamente
2. Detectar estado atual e retornar próximo passo correto
3. Ser o ponto central que a IA chama após cada interação do usuário

### Fase 6: Atualizar registros de tools nos dois entry points

**Arquivos:** `src/src/tools/index.ts` e `src/src/stdio.ts`

**Mudanças:**
1. Atualizar schema de `iniciar_projeto` com novos campos
2. Passar novos argumentos no CallToolRequestSchema handler
3. Atualizar descriptions para refletir novo comportamento

---

## Ordem de Execução

0. **Fase 0** - Integrar `setup_inicial` ao fluxo (FUNDAÇÃO - pré-requisito para tudo)
1. **Fase 1** - Refatorar `iniciar_projeto` (CRÍTICO - resolve o problema principal)
2. **Fase 2** - Adicionar `next_action` nos retornos (IMPORTANTE - conecta os fluxos)
3. **Fase 5** - Refatorar orchestrator como hub (IMPORTANTE - simplifica para a IA)
4. **Fase 4** - Conectar brainstorm ao início (MÉDIO - feature solicitada)
5. **Fase 3** - Internalizar `confirmar_projeto` (BAIXO - cleanup)
6. **Fase 6** - Atualizar registros (NECESSÁRIO - após cada fase)

---

## Arquivos Impactados

| Arquivo | Tipo de Mudança | Prioridade |
|---------|----------------|------------|
| `src/src/tools/setup-inicial.ts` | Adicionar next_action + melhorias | FUNDAÇÃO |
| `src/src/utils/config.ts` | Possíveis extensões de config | FUNDAÇÃO |
| `src/src/tools/iniciar-projeto.ts` | Refatoração major + integração setup | CRÍTICA |
| `src/src/flows/onboarding-orchestrator.ts` | Refatoração major | ALTA |
| `src/src/tools/brainstorm.ts` | Adição de modo | MÉDIA |
| `src/src/tools/discovery.ts` | Ajustes de integração | MÉDIA |
| `src/src/tools/prd-writer.ts` | Adicionar next_action | BAIXA |
| `src/src/tools/next-steps-dashboard.ts` | Adicionar next_action | BAIXA |
| `src/src/tools/index.ts` | Atualizar registros | NECESSÁRIA |
| `src/src/stdio.ts` | Atualizar registros | NECESSÁRIA |
| `src/src/types/index.ts` | Adicionar next_action ao ToolResult | NECESSÁRIA |
| `src/src/types/onboarding.ts` | Possíveis novos tipos | BAIXA |

---

## Riscos e Mitigações

1. **Retrocompatibilidade**: Manter parâmetros antigos funcionando com fallback
2. **Dois entry points**: `index.ts` e `stdio.ts` precisam ser atualizados em paralelo
3. **Estado existente**: Projetos já criados devem continuar funcionando
4. **Complexidade do fluxo**: Manter simples - máximo 3 interações antes de criar arquivos

---

## 🔍 ANÁLISE TÉCNICA DO PLANO (Revisão de Código)

### Veredicto Geral: ✅ Estamos no caminho correto

O plano identifica corretamente os problemas fundamentais e propõe soluções adequadas. A visão de que o Maestro deve ser o **orquestrador ativo** (e não um toolkit passivo) está alinhada com o objetivo de guiar o usuário independentemente do modelo de IA.

Abaixo, detalhamento do que está bom, o que precisa de ajuste, e novas ideias.

---

### ✅ O que está correto e bem fundamentado

1. **Diagnóstico preciso dos problemas** — Os 6 problemas identificados (inferência automática, criação prematura de arquivos, fluxos desconectados, discovery não conversacional, excesso de prompts, brainstorm desconectado) são exatamente o que o código confirma.

2. **Princípio de "perguntas em blocos"** — Crítico para UX em contexto de chat. O discovery-adapter.ts já implementa blocos, mas eles são apresentados um a um. A proposta de agrupar em 2 blocos macro (essencial + técnico) é a abordagem certa.

3. **Campo `next_action` em todo retorno** — Essencial para que QUALQUER modelo de IA saiba o próximo passo. Hoje os retornos usam texto livre com instruções manuais (ex: "Use `onboarding_orchestrator(...)`"), o que depende da capacidade do modelo interpretar.

4. **3 caminhos (direto / brainstorm / brainstorm profundo)** — Cobertura boa para diferentes perfis de usuário.

5. **Ordem de execução priorizada** — Fase 1 (iniciar_projeto) primeiro está correto, é o gargalo principal.

---

### ⚠️ Problemas e Inconsistências Encontrados no Código vs Plano

#### 1. Bug Crítico: `index.ts` não repassa todos os parâmetros de `iniciar_projeto`

**Arquivo:** `src/src/tools/index.ts` (linhas 216-221)

O handler no `index.ts` só repassa `nome`, `descricao` e `diretorio`:
```typescript
case "iniciar_projeto":
    return await iniciarProjeto({
        nome: typedArgs?.nome as string,
        descricao: typedArgs?.descricao as string | undefined,
        diretorio: typedArgs?.diretorio as string,
    });
```

Mas o schema (`iniciarProjetoSchema`) aceita `ide`, `modo`, `auto_flow`, `usar_stitch`, `project_definition_source`, `brainstorm_mode`, `confirmar_automaticamente`. **Nenhum desses é repassado.** Isso significa que o fluxo de one-shot (`confirmar_automaticamente: true`) **nunca funciona** via index.ts.

O `stdio.ts` também só repassa `nome`, `descricao`, `diretorio`, `ide` e `modo` — faltam `auto_flow`, `usar_stitch`, `project_definition_source`, `brainstorm_mode`, `confirmar_automaticamente`.

**Ação:** Antes de qualquer refatoração, corrigir ambos os entry points para repassar TODOS os parâmetros definidos no schema.

#### 2. Duplicação de `criarEstadoOnboarding`

A função `criarEstadoOnboardingInicial()` existe em DOIS lugares com código quase idêntico:
- `src/src/tools/iniciar-projeto.ts` (linhas 48-71)
- `src/src/flows/onboarding-orchestrator.ts` (linhas 35-58)

**Ação:** Extrair para um único local (ex: `utils/onboarding-factory.ts`) antes de refatorar.

#### 3. `confirmar_projeto` é exposto no `stdio.ts` mas NÃO no `index.ts`

O `stdio.ts` expõe `confirmar_projeto` como tool separada (linhas 214-229), mas o `index.ts` não a registra — ele chama internamente via `iniciar_projeto`. Isso cria comportamento inconsistente entre os dois entry points.

**Ação:** Definir se `confirmar_projeto` é tool pública ou interna e manter consistência.

#### 4. `brainstorm` exige `discoveryStatus === 'completed'`

No `brainstorm.ts` (linhas 222-229), há um guard que bloqueia brainstorm se discovery não está completo. Isso contradiz o plano de permitir brainstorm ANTES do discovery (Caminho B).

**Ação:** Essa restrição precisa ser removida/relaxada na Fase 4.

#### 5. `onboarding_orchestrator` não salva estado entre blocos intermediários

No `handleProximoBloco()` (linhas 245-401), o estado só é serializado e retornado quando TODOS os blocos obrigatórios estão completos (linhas 307-360). Para blocos intermediários (linhas 362-393), as respostas ficam em memória mas o `estado_atualizado` NÃO é retornado. Isso significa que **respostas intermediárias podem ser perdidas** se a sessão for interrompida.

**Ação:** Sempre retornar `estado_atualizado` e `files` em todo handleProximoBloco, mesmo para blocos intermediários.

---

### 💡 Ideias e Melhorias Adicionais

#### IDEIA 1: Sistema de "Personalidade de Especialista" no Retorno

O Maestro já tem o conceito de especialistas por fase. Para reforçar o papel de **orquestrador que assume papéis**, cada retorno deveria incluir um campo `specialist_persona`:

```typescript
interface ToolResult {
    content: [...];
    next_action?: NextAction;
    // NOVO: persona ativa que a IA deve assumir
    specialist_persona?: {
        name: string;           // "Product Discovery Specialist"
        tone: string;           // "consultivo, focado em validação"
        expertise: string[];    // ["product discovery", "user research", "MVP definition"]
        instructions: string;   // "Faça perguntas de follow-up quando respostas forem vagas"
    };
}
```

Isso garante que a IA mude de comportamento conforme a fase, independente do modelo.

#### IDEIA 2: "Smart Defaults" baseado no Config Global

O `setup_inicial` já coleta `preferencias_stack` e `team_size`. Esses dados deveriam ser usados para **pré-preencher** campos do discovery e **adaptar perguntas**.

Exemplo: Se config global tem `team_size: "solo"` e `preferencias_stack.frontend: "react"`, o Bloco 3 (Técnico) poderia vir pré-preenchido:
```
Stack preferida: React + Node.js (baseado em suas preferências)
Plataformas alvo: [x] Web (inferido do stack)
```

Isso reduz fricção e mostra que o Maestro "lembra" do usuário.

#### IDEIA 3: "Resumo Executivo" como checkpoint entre blocos

Após cada bloco respondido, o Maestro deveria retornar um **resumo compacto** do que entendeu, dando chance ao usuário de corrigir antes de avançar:

```
✅ Entendi:
- Problema: [resumo em 1 linha]
- Público: [resumo em 1 linha]
- MVP: [lista de features]

Está correto? Se sim, vamos para os detalhes técnicos.
Se não, diga o que gostaria de ajustar.
```

Isso é importante porque o Maestro vai **usar essas respostas** para inferir tipo/complexidade. Um erro aqui se propaga.

#### IDEIA 4: "Projeto Template" como 4º caminho

Além de "já definido", "brainstorm" e "sandbox", adicionar um caminho **"template"** onde o usuário escolhe de uma lista de projetos-tipo comuns:

- SaaS B2B
- E-commerce
- API/Microserviços
- App Mobile
- Landing Page + Backend
- Dashboard/Admin

Cada template viria com discovery **pré-preenchido** baseado em best practices, e o usuário só precisaria confirmar/ajustar. Isso pode reduzir o fluxo para **1 interação** para projetos comuns.

#### IDEIA 5: "Confidence Score" nas inferências

Quando o Maestro inferir tipo/complexidade após as respostas, incluir um **score de confiança**:

```typescript
interface Inferencia {
    valor: string;
    confianca: number;      // 0-100
    razao: string;
    dados_usados: string[]; // quais respostas fundamentaram
}
```

Se confiança < 70%, perguntar ao usuário. Se >= 70%, sugerir mas permitir override. Isso torna o sistema transparente e auditável.

#### IDEIA 6: Unificar entry points com adapter pattern

O problema de `index.ts` e `stdio.ts` divergirem é recorrente. Sugestão: criar um **adapter** único que faz o mapping de args para cada tool:

```typescript
// src/utils/tool-router.ts
export function routeToolCall(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    // Mapping centralizado — TODOS os parâmetros
    // Um único lugar para atualizar
}
```

Ambos entry points chamariam `routeToolCall()`. Isso elimina a classe inteira de bugs de "parâmetro não repassado".

#### IDEIA 7: Modo "Conversa Livre" como alternativa ao formulário

Para usuários menos técnicos, permitir que descrevam o projeto em **texto livre** (sem estrutura de campos):

```
"Quero criar um app para gerenciar as finanças pessoais dos meus clientes,
eles são profissionais autônomos que não têm controle de gastos..."
```

O Maestro então usa NLP para **extrair** problema, público, funcionalidades, e apresenta o resumo para confirmação. Isso é o caminho mais natural e de menor atrito.

Na prática, o `iniciar_projeto` receberia um campo `descricao_livre: string` e teria uma função `extrairContextoDeTextoLivre()` que popula os campos do discovery.

#### IDEIA 8: Persistência intermediária via `files[]`

O plano menciona "Arquivos criados só com dados reais", mas o problema é que em modo stateless o Maestro **depende da IA salvar** os arquivos. Se a IA não salvar (ou salvar errado), o estado se perde.

Sugestão: todo retorno que altere estado deve incluir `files[]` com o estado atualizado + instrução `⚡ AÇÃO OBRIGATÓRIA - Salvar Estado`. Isso já existe em `confirmarProjeto`, mas falta em `handleProximoBloco` para blocos intermediários.

---

### 📋 Sequência de Implementação Revisada

Baseado na análise de código, sugiro esta ordem atualizada:

| Prioridade | Ação | Justificativa |
|-----------|------|---------------|
| **0-A** | Corrigir bug de parâmetros não repassados em `index.ts` e `stdio.ts` | Pré-requisito: código atual está quebrado |
| **0-B** | Extrair `criarEstadoOnboarding` para utils (eliminar duplicação) | Pré-requisito: evitar divergência |
| **0-C** | Unificar entry points com adapter pattern (Ideia 6) | Pré-requisito: eliminar classe de bugs |
| **1** | Fase 1 do plano: Refatorar `iniciar_projeto` | Core: resolve o problema principal |
| **2** | Fase 2 do plano: `next_action` + `specialist_persona` em todos os retornos | Conecta os fluxos |
| **3** | Fix: `handleProximoBloco` sempre retornar `estado_atualizado` | Evita perda de dados |
| **4** | Fase 4 do plano: Remover guard de discovery no brainstorm | Habilita Caminho B |
| **5** | Fase 5 do plano: Orchestrator como hub | Simplifica para a IA |
| **6** | Implementar "Smart Defaults" e "Resumo Executivo" | UX refinada |
| **7** | Fase 3 + Fase 6 do plano: Cleanup + registros | Finalização |

---

### 🎯 Resumo da Análise

- **Visão correta** — O plano está no caminho certo. A estratégia de perguntas em blocos + next_action programático é a forma correta de fazer o Maestro funcionar como orquestrador.
- **Bugs a corrigir ANTES** — Os parâmetros não repassados nos entry points e a perda de estado intermediário são bugs críticos que devem ser resolvidos antes de qualquer refatoração.
- **Melhorias de alto impacto** — Adapter pattern para entry points, specialist_persona, e smart defaults são as 3 ideias que mais agregam valor com menor esforço.
- **Escopo controlado** — O plano mantém o escopo em 6 fases incrementais. A sugestão é adicionar a Fase 0 (fixes pré-requisitos) e incorporar as ideias 1-3 na Fase 2.
