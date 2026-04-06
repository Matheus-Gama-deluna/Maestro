# Documentação Técnica Completa e Atualizada — Sistema Maestro MCP

> **Data de atualização:** 2026-04-06  
> **Escopo desta documentação:** análise técnica do sistema no estado atual do repositório, cobrindo objetivos, funcionamento, arquitetura, fluxo operacional e mapa de arquivos.

---

## 1) Resumo Executivo

O **Maestro MCP** é um servidor de orquestração para desenvolvimento assistido por IA, baseado em **Model Context Protocol (MCP)**, com foco em:

- reduzir a superfície de interação da IA para poucas tools públicas;
- guiar projetos por fases com validação de qualidade (gates);
- manter estado persistido e contexto acumulado por projeto;
- injetar conteúdo especializado (skills/templates/checklists) por fase;
- habilitar operação em modo **STDIO** para IDEs MCP (principal) e **HTTP/SSE** legado.

No estado atual, a arquitetura está centrada em **5 tools públicas consolidadas** (`maestro`, `executar`, `validar`, `analisar`, `contexto`) e um **pipeline obrigatório de middlewares** para garantir consistência de estado, validação de uso e orquestração de próximo passo.

---

## 2) Objetivos do Sistema

### 2.1 Objetivo principal

Fornecer um **orquestrador MCP autônomo** que conduz projetos de software em fases (produto → design → arquitetura → implementação → integração/deploy), com checkpoints de qualidade, sem depender de APIs externas proprietárias.

### 2.2 Objetivos operacionais

1. **Onboarding e setup de projeto** com baixa fricção.
2. **Condução por fases** com especialistas e entregáveis esperados.
3. **Validação progressiva** (gate, entregável e compliance).
4. **Persistência e memória de projeto** em `.maestro/`.
5. **Recuperação de contexto e prompts** via resources MCP.
6. **Compatibilidade retroativa** com tools legadas, mantendo superfície pública enxuta.

---

## 3) Arquitetura de Alto Nível

## 3.1 Componentes centrais

- **Servidor MCP (factory única):** cria handlers de resources/prompts/tools e integra capacidades do cliente.
- **Router central:** registra tools públicas, resolve tool calls e aplica pipeline de orquestração.
- **Middlewares de orquestração:** garantem ordem de execução (state load, persistência, flow engine, skill injection etc.).
- **Serviços de estado/contexto:** leitura/gravação de `.maestro/estado.json`, resumo, decisões e artefatos.
- **Sistema de conteúdo:** skills, templates, checklists e prompts especializados.
- **Engine de validação:** gates e scoring de entregáveis.

## 3.2 Entry points e transportes

### a) STDIO (principal)

- Arquivo: `src/src/stdio.ts`
- Uso esperado por IDEs MCP (Cursor, Windsurf, etc.).
- Cria servidor via `createMaestroServer(projectDir)` e conecta em `StdioServerTransport`.

### b) HTTP/SSE (legado/deprecated)

- Arquivo: `src/src/index.ts`
- Mantém endpoints `/health`, `/mcp`, `/resources`, `/tools`, com suporte a sessão SSE.
- Marcado no próprio arquivo como legado/deprecated para futura substituição.

---

## 4) Contrato MCP Implementado

A factory de servidor registra handlers para:

- `resources/list`
- `resources/read`
- `prompts/list`
- `prompts/get`
- `tools/list`
- `tools/call`

Além disso, captura capacidades/versionamento do cliente ao inicializar (`server.oninitialized`).

---

## 5) Ferramentas Públicas (Superfície Oficial)

O roteamento público consolidado está em 5 tools:

1. **`maestro`**  
   Entry point inteligente para status, criação e setup inicial.

2. **`executar`**  
   Ação mutável consolidada (`avancar`, `salvar`, `checkpoint`).

3. **`validar`**  
   Validações unificadas (`gate`, `entregavel`, `compliance`).

4. **`analisar`**  
   Análises de segurança, qualidade, performance, dependências e relatório completo.

5. **`contexto`**  
   Retorna contexto estruturado acumulado do projeto (fases, entregáveis, ADRs/decisões).

### Compatibilidade legada

- O router ainda aceita tools legadas (via `legacy-tools.ts`) para backward compatibility.
- Quando tool legada é usada, o sistema acrescenta aviso de depreciação com redirecionamento para a tool pública equivalente.

---

## 6) Pipeline de Orquestração (Comportamento Crítico)

Toda tool pública é encapsulada pela pipeline unificada.

Ordem de execução aplicada:

1. `withCompulsoryStateGuard` (bloqueio em modo compulsório pós-gate reprovado)
2. `withErrorHandling`
3. `withStateLoad`
4. `withPersistence`
5. `withADRGeneration`
6. `withFlowEngine`
7. `withSkillInjection`
8. `withPromptValidation`

### Efeito prático

- **Consistência:** estado é carregado/persistido automaticamente.
- **Governança:** evita uso incorreto de tools durante estado compulsório.
- **Evolução de fluxo:** sugere/deriva próximo passo após execução.
- **Qualidade de resposta:** adiciona validação de conformidade de chamada.

---

## 7) Fluxos, Fases e Gatekeeping

As fases são definidas em `src/src/flows/types.ts`, com:

- **nome de fase**, especialista, template, skill associada;
- **checklist de gate** por fase;
- **entregável esperado**;
- mapeamento de tipo de fase (`input_required`, `derived`, `technical`) para decisões de auto-flow.

### Fluxos declarados

- `FLUXO_SIMPLES` (5 fases)
- `FLUXO_MEDIO` (8 fases)
- (há continuidade no arquivo para fluxos mais extensos)

### Fases de código (canonizadas)

`Frontend`, `Backend`, `Integração & Deploy`, `Integração`, `Deploy & Operação`.

Essa lista orienta comportamento de autoexecução técnica e decisões de validação/avanço.

---

## 8) Persistência, Estado e Estrutura de Projeto

## 8.1 Estrutura local esperada

O Maestro trabalha com pasta `.maestro` no diretório do projeto, incluindo pelo menos:

- `.maestro/estado.json` (estado de orquestração)
- artefatos complementares (ex.: resumos, ADRs, validações, etc., dependendo do fluxo)

## 8.2 StateService

Responsável por:

- `load()` estado atual;
- `save()` com atualização de timestamp;
- `patch()` parcial;
- `saveFile()` / `saveFiles()` para artefatos auxiliares;
- checagem de existência de projeto/estado.

Com isso, o servidor reduz dependência da IA para persistência manual.

---

## 9) Watcher Event-Driven de Validação

O serviço de watcher monitora o arquivo de entregável da fase atual e dispara validação automaticamente após salvamento.

Características:

- debounce de 500ms;
- prioridade para `chokidar`, fallback para `fs.watch`;
- lifecycle management por diretório (evita watchers duplicados);
- integração com `ValidationPipeline` e callback com score/feedback.

Resultado: menor necessidade de validação manual repetitiva e feedback de qualidade mais rápido.

---

## 10) Resources e Prompts MCP

## 10.1 Resources

O sistema expõe:

- especialistas (`maestro://especialista/...`)
- templates (`maestro://template/...`)
- guias (`maestro://guia/...`)
- prompts (`maestro://prompt/...`)
- system prompt (`maestro://system-prompt`)
- recursos de skill (`maestro://skills/<skill>/...`) quando `projectDir` está disponível.

## 10.2 Prompts

Prompts implementados:

- `maestro-specialist`
- `maestro-context`
- `maestro-template`
- `maestro-sessao`

Eles incorporam regras de fluxo e anti-inferência, e podem hidratar skill/template/checklist da fase atual.

---

## 11) Mapa de Arquivos Relevantes

## 11.1 Núcleo de servidor

- `src/src/server.ts` — factory MCP e handlers.
- `src/src/stdio.ts` — entry point padrão (npx/IDE).
- `src/src/index.ts` — entry point HTTP/SSE legado.
- `src/src/constants.ts` — nome/versão/protocolo.

## 11.2 Roteamento e tools

- `src/src/router.ts` — catálogo público + roteamento + depreciação legada.
- `src/src/tools/maestro-tool.ts` — coordenação principal.
- `src/src/tools/consolidated/executar.ts` — mutações de fluxo.
- `src/src/tools/consolidated/validar.ts` — validações.
- `src/src/tools/consolidated/analisar.ts` — análises de código.
- `src/src/tools/contexto.ts` — contexto consolidado.

## 11.3 Pipeline e serviços

- `src/src/middleware/orchestration-pipeline.middleware.ts` — ordem oficial de middlewares.
- `src/src/middleware/validation.middleware.ts` — prompt validation + compulsory state guard.
- `src/src/services/state.service.ts` — persistência ativa.
- `src/src/services/watcher.service.ts` — validação event-driven.

## 11.4 Fluxo e domínio

- `src/src/flows/types.ts` — fases, checklists e classificação de fase.
- `src/src/types/*` — contratos de tipo e configuração.
- `src/src/core/*` — subsistemas de validação, knowledge, ADR, risco, automação etc.

## 11.5 Conteúdo de IA

- `content/skills/*` — skills e recursos (templates/checklists/referências).
- `content/workflows/*` — workflows operacionais.
- `content/rules/*` — regras de operação por adaptador/IDE.

---

## 12) Build, Testes e Execução

## 12.1 Pacote MCP principal

No subprojeto `src/`:

- Build: `npm run build`
- Dev (STDIO): `npm run dev`
- Dev (HTTP): `npm run dev:http`
- Testes: `npm run test`
- Typecheck: `npm run typecheck`

## 12.2 Observações de versão detectadas

Há divergências de versão entre arquivos de topo e pacote do servidor:

- README raiz menciona `v6.0.0`.
- `src/package.json` está em `6.1.0`.
- `src/src/constants.ts` mantém `MAESTRO_VERSION = "6.0.0"`.

**Recomendação:** normalizar versão única em release process para evitar inconsistência entre runtime e docs.

---

## 13) Funcionamento Fim-a-Fim (Fluxo operacional)

1. Cliente MCP (IDE) conecta via STDIO.
2. Chamada à tool `maestro` identifica estado do projeto.
3. Caso necessário, executa setup/criação de projeto.
4. Durante progresso, tool `executar` conduz avanço e persistência.
5. `validar` e watcher reforçam qualidade dos entregáveis.
6. `analisar` produz diagnósticos de segurança/qualidade/performance.
7. `contexto` retorna memória estruturada para continuidade consistente.
8. Pipeline de middleware garante governança e próxima ação orientada.

---

## 14) Pontos Fortes Arquiteturais

- Forte padronização do entry point e pipeline.
- Boa separação entre camada MCP (handlers/router) e domínio (core/services).
- Estratégia de consolidação de tools reduz complexidade cognitiva da IA.
- Abordagem de conteúdo (skills/templates/checklists) facilita especialização por fase.
- Compatibilidade legada protegida por deprecation hints.

---

## 15) Riscos Técnicos e Melhorias Recomendadas

1. **Versão inconsistente entre docs/runtime**  
   Padronizar semântica de release e fonte única de versão.

2. **Entrada HTTP legada ainda presente**  
   Definir janela de descontinuação ou migração total para transporte suportado oficialmente.

3. **Complexidade de base histórica (arquivos `_archive`)**  
   Criar índice de documentação “ativa vs legado” para reduzir ambiguidade operacional.

4. **Governança de fases/skills extensa**  
   Introduzir validação automática de mapeamento fase↔skill↔template em CI.

5. **Observabilidade funcional**  
   Expandir métricas runtime (latência por tool, taxa de falha por middleware, taxa de retrabalho por gate).

---

## 16) Glossário Rápido

- **MCP:** Model Context Protocol.
- **Gate:** checkpoint de qualidade para transição de fase.
- **Skill:** pacote de instruções e recursos especializados por domínio/fase.
- **Compulsory state:** modo de bloqueio quando gate reprova, limitando tools permitidas.
- **Flow engine:** mecanismo que recomenda a próxima ação no fluxo.

---

## 17) Conclusão

O sistema está estruturado como uma plataforma de orquestração MCP robusta, com foco em **consistência de fluxo, validação contínua e especialização por conteúdo**. A arquitetura modular e o pipeline unificado são pontos fortes claros. As principais ações de evolução imediata devem atacar **consistência de versionamento**, **higiene de documentação ativa** e **observabilidade operacional de produção**.
