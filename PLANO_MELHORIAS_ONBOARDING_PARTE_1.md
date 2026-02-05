# Plano de Melhorias do Fluxo Inicial (Onboarding) — Parte 1/2

## 1. Contexto atual (como está hoje)

O fluxo atual (simplificado) tende a ficar assim:

1. `iniciar_projeto(nome, descricao, diretorio, [ide], [modo])`
   - Faz inferências leves (tipo/complexidade)
   - Tenta injetar conteúdo (rules/skills)
   - Pede para o usuário chamar `confirmar_projeto(...)`

2. `confirmar_projeto(...)`
   - Cria `estado.json` + `resumo.json` + `resumo.md`
   - Sugere que o usuário rode `discovery` / siga o especialista

3. Depois, para PRD, o usuário pode ir por caminhos diferentes:
   - `discovery` (questionário “monolítico”)
   - `onboarding_orchestrator` (discovery adaptativo por blocos)
   - `brainstorm` (depende de onboarding)
   - `prd_writer` (depende de onboarding)
   - `proximo` (valida e avança; agora tem `auto_flow` opcional)

Resultado prático: há **múltiplos caminhos**, com **quebras** e tendência a **perguntas repetidas** (ex.: discovery via `discovery` vs discovery via `onboarding_orchestrator`, além de bloqueios e confirmações no PRD-first).

## 2. Problemas que você quer resolver

- **Fluidez**: após inicializar o projeto, entrar direto no discovery sem exigir múltiplos comandos.
- **Menos prompts**: eliminar perguntas repetidas e “mensagens de instrução” longas.
- **Onboarding inteligente**:
  - Coletar configuração (modo, auto_flow, IDE, usar_stitch, etc.) no início.
  - Coletar definição do produto (brainstorm + gestão de produto) apenas se necessário.
- **Ordem correta**:
  - Injetar conteúdo/rules/skills **antes** do processo guiado.
  - Criar `.maestro/estado.json` **ao final do setup** (quando as configurações estiverem decididas), já persistindo tudo no estado.
- **Após PRD**:
  - Fluir direto para validação do entregável.
  - Se OK (score >= limiar), avançar para a próxima fase sem fricção.

## 3. Objetivos (definição de sucesso)

- **O1 — Redução de interações**: criar projeto + chegar no primeiro bloco de discovery em **1 chamada de tool** (ou 2 no máximo), em vez de 3-5.
- **O2 — Zero repetição de perguntas**: cada dado de discovery deve ter **uma fonte de verdade**.
- **O3 — Onboarding guiado**: usuário consegue:
  - Começar “do zero” (brainstorm)
  - Ou começar “com ideia pronta” (discovery direto)
  - Ou “gerar cenário de teste” (sandbox) de forma explícita
- **O4 — Auto avanço controlado**: se `auto_flow=true` e score >= 70, avançar sem exigir confirmações de classificação/skill.

## 4. Proposta de novo fluxo (To-Be) em 2 momentos

### Momento A — Setup + Bootstrap (Wizard curto que culmina na criação do estado)

**Responsável:** `iniciar_projeto`

**O que deve coletar/decidir:**
- `ide`: windsurf | cursor | antigravity
- `modo`: economy | balanced | quality
- `auto_flow`: boolean (default: false)
- `usar_stitch`: boolean (default: false)
- `brainstorm_mode`: "none" | "assistido" (default: assistido se usuário não tem clareza)
- `project_definition_source`:
  - "ja_definido" (usuário já sabe problema/público/MVP)
  - "brainstorm" (usuário quer explorar)
  - "sandbox" (criar cenário fictício/teste)
- `nivel_complexidade` e `tipo_artefato`:
  - Pode vir inferido
  - Pode ser confirmado
  - Pode ser deixado para recalcular após PRD (opção)

**Saída do Momento A (bootstrap concluído):**
- Retornar `files` já com `.maestro/estado.json`, `.maestro/resumo.json`, `.maestro/resumo.md`.
- Persistir no `estado.json` todas as escolhas do setup (ex.: `estado.config.mode`, `estado.config.auto_flow`, `estado.usar_stitch`, etc.).
- Retornar imediatamente, no texto, o **primeiro bloco de discovery** (ou um “próximo comando” curto) para manter a fluidez.

**Como lidar com o stateless sem perder fluidez:**
- Se faltarem campos obrigatórios do setup, `iniciar_projeto` retorna um wizard curto pedindo as decisões.
- Na próxima chamada (com as respostas), `iniciar_projeto` já retorna os `files` de estado/resumo (bootstrap).

> Observação: isso mantém o setup e a criação do estado como **uma mesma fase lógica** (setup→bootstrap), evitando uma etapa separada dedicada apenas a criar arquivos.

### Momento B — Definição do Projeto (Discovery + Brainstorm + Gestão de Produto)

**Responsável:** um orquestrador único.

Hoje já existem:
- `onboarding_orchestrator` (discovery adaptativo por blocos)
- `brainstorm` (seções estruturadas)
- `prd_writer` (gera/valida PRD)

A melhoria é **conectar isso de forma direta** ao fim do bootstrap (criação do estado).

**Fluxo sugerido:**
1. `iniciar_projeto(...)` (quando completo) cria `estado.json` e já cria o estado de onboarding (`estado.onboarding = criarEstadoOnboarding(...)`).
2. A própria resposta do `iniciar_projeto` já retorna:
   - Arquivos para salvar
   - E **o primeiro bloco de discovery** pronto para o usuário responder
   - E o comando exato para seguir (ex.: `onboarding_orchestrator(acao:"proximo_bloco", ...)`)

Assim, o usuário sai do “setup” direto para o discovery, sem ter que “lembrar a tool certa”.

> Compatibilidade: `confirmar_projeto` pode continuar existindo, mas como **atalho/alias** para o “finalizar bootstrap” (mesma lógica interna), e não como etapa obrigatória.

## 5. Unificação: uma fonte de verdade para Discovery

### Problema atual
Existem 2 mecanismos de discovery:
- `discovery` (questionário monolítico; salva em `estado.discovery`)
- `onboarding_orchestrator` (discovery por blocos; salva em `estado.onboarding.discoveryResponses`)

### Proposta
Definir **um padrão**:
- **Padrão novo (v2)**: onboarding_orchestrator como *fonte de verdade*.
- `discovery` vira:
  - “modo compatibilidade” (legacy)
  - ou atalho que **preenche blocos do onboarding** (adapter) em vez de salvar em `estado.discovery`.

**Contrato sugerido:**
- `estado.onboarding.discoveryResponses` é o principal.
- `estado.discovery` (se existir) pode ser mantido por retrocompatibilidade, mas não deve ser consultado por fluxos novos.

## 6. Integração com skills (conteúdo / injection)

Você pediu:
- Injeção de skills/rules/templates antes das perguntas.
- Só depois criar `.maestro/estado.json`.

### Proposta (pragmática e compatível)
- `iniciar_projeto` faz `injectContentForIDE` **assim que IDE estiver definida** (já faz isso hoje).
- O wizard de configuração roda com mensagens mais curtas e objetivas.
- `confirmar_projeto` faz uma verificação idempotente (já faz hoje) para garantir que conteúdo está presente.

**Melhoria extra:**
- Se injection falhar, retornar um bloco curto:
  - “Conteúdo não disponível localmente, continuando com recursos embutidos”
  - E indicar que validação por template pode ficar limitada.

## 7. Auto-flow pós PRD (PRD → validação → avanço)

Há duas rotas possíveis:

### Rota 1 (mais simples)
- PRD gerado via `prd_writer`
- Validação via `validar_gate` (template/legacy)
- Avanço via `proximo(auto_flow:true)`

### Rota 2 (mais fluida / ideal)
Evoluir `prd_writer` para ter uma ação `acao: "gerar_e_validar"`:
- Gera PRD
- Calcula score
- Se score >= 70:
  - Atualiza estado
  - **Sugere** `proximo(auto_flow:true)` (ou já retorna o payload do `proximo` pronto)

> Nota: uma tool não chama outra diretamente (no desenho atual), então a fluidez vem de retornar o “próximo comando” pronto e reduzir passos.

## 8. Decisões de produto (UX do chat) para reduzir perguntas

- **Agrupar perguntas** por bloco (já existe no onboarding)
- **Preencher defaults inteligentes**:
  - Se `modo=economy`, reduzir discoveryBlocks e usar placeholders
  - Se usuário escolher “sandbox”, gerar um cenário fictício automaticamente e permitir edição
- **Perguntas condicionais** (gating):
  - Só perguntar sobre Stitch se `frontend_first=true` ou se o produto tem UI
  - Só perguntar sobre compliance se o domínio sugerir dados sensíveis

## 9. Mudanças propostas de interface (tools)

### 9.1 `iniciar_projeto` (v2)
Adicionar argumentos opcionais:
- `auto_flow?: boolean`
- `usar_stitch?: boolean`
- `brainstorm_mode?: "none" | "assistido"`
- `project_definition_source?: "ja_definido" | "brainstorm" | "sandbox"`
- `confirmar_automaticamente?: boolean` (para permitir 1-step em alguns casos)

E mudar o comportamento:
- Se faltarem dados de configuração, retornar **um wizard curto** (1 mensagem, 1 resposta do usuário) em vez de instruções longas.
- Se os dados mínimos do setup estiverem presentes, **o próprio `iniciar_projeto` já retorna os arquivos** (`estado.json`/`resumo.*`) e já emenda o discovery.
- Se `confirmar_automaticamente=true`, o fluxo deve ser “one-shot”: setup + bootstrap + primeiro bloco do discovery numa única resposta.

### 9.2 `confirmar_projeto`
- Tornar opcional/compatibilidade (não obrigatório no fluxo novo).
- Internamente, deve reaproveitar a mesma lógica de bootstrap do `iniciar_projeto`.
- Mantém as mesmas responsabilidades de persistência no estado:
  - `estado.config.auto_flow`
  - `estado.usar_stitch`
  - `estado.onboarding` inicializado (opcional conforme modo)
- Retornar imediatamente o **primeiro bloco** do onboarding (discovery) junto com os arquivos.

### 9.3 `onboarding_orchestrator`
- Permitir `acao: "iniciar"` ser chamado “implicitamente” pelo `confirmar_projeto` via retorno de texto.
- (Opcional) nova ação `acao:"autopilot"` (ver Parte 2): tentar avançar automaticamente para brainstorm/prd se blocos mínimos forem preenchidos.

---

## Status
Este documento descreve **visão, arquitetura do fluxo e contratos**. A Parte 2 detalha **fases de implementação, tarefas por arquivo, testes e migração**.
