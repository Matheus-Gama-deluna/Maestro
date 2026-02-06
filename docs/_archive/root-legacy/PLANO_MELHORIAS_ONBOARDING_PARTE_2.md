# Plano de Melhorias do Fluxo Inicial (Onboarding) — Parte 2/2 (Implementação)

## 1. Estratégia de implementação (incremental e retrocompatível)

### Princípios
- **Não quebrar** fluxos atuais: `iniciar_projeto` → `confirmar_projeto` → `discovery` ainda deve funcionar.
- Introduzir as melhorias como:
  - Novos parâmetros opcionais
  - Novas ações opcionais
  - Adapters de compatibilidade
- Evitar “big bang refactor”.

### Fases de entrega
- **Fase 0 — Preparação/Refino**: ajustes de contratos e estado.
- **Fase 1 — Setup + Bootstrap no iniciar_projeto**: wizard curto que coleta setup e já retorna `estado.json/resumo.*` com tudo persistido.
- **Fase 2 — Bootstrap já inicia onboarding**: após criar estado, já retornar o primeiro bloco do discovery e o próximo comando curto.
- **Fase 3 — Unificar discovery (fonte de verdade)**: remover duplicidade.
- **Fase 4 — PRD contínuo**: gerar → validar → (auto_flow) avançar.
- **Fase 5 — Observabilidade + testes**: reduzir regressões.

## 2. Contratos de dados (o que persistir no estado)

### 2.1 Campos sugeridos em `estado.config`
Adicionar:
- `estado.config.auto_flow: boolean`
- `estado.config.mode: 'economy' | 'balanced' | 'quality'` (já existe)
- `estado.config.onboarding: {
  enabled: boolean; // se usa onboarding_orchestrator como caminho principal
  source: 'onboarding_v2' | 'legacy_discovery';
  project_definition_source: 'ja_definido' | 'brainstorm' | 'sandbox';
}`

Recomendação adicional (para suportar fluidez pós-setup):
- `estado.config.setup: {
  completed: boolean;
  decided_at: string;
  decided_by: 'user' | 'inferred' | 'mixed';
}`

### 2.2 Campos sugeridos em `estado`
- `estado.usar_stitch: boolean` (já existe no estado, mas hoje é tratado em tools separadas)
- `estado.ide: 'windsurf' | 'cursor' | 'antigravity'` (já existe)

### 2.3 Campos de discovery
- **Canônico:** `estado.onboarding.discoveryResponses`
- Legacy (opcional): `estado.discovery`

## 3. Mudanças propostas por arquivo/tool

## 3.1 `src/src/tools/iniciar-projeto.ts`

### Mudanças de schema
Adicionar propriedades (todas opcionais):
- `auto_flow: boolean`
- `usar_stitch: boolean`
- `project_definition_source: enum ['ja_definido','brainstorm','sandbox']`
- `brainstorm_mode: enum ['none','assistido']`
- `confirmar_automaticamente: boolean`

Observação importante de integração:
- O handler do servidor (registro/calltool) hoje passa apenas `nome/descricao/diretorio`.
- Para suportar o setup+bootstrap no `iniciar_projeto`, será necessário propagar os novos args no registro de tools.

### Mudanças de comportamento
- Se IDE/mode ainda não definidos:
  - Retornar **um único bloco de perguntas** (curto) pedindo:
    - IDE
    - modo
    - auto_flow
    - usar_stitch
    - se o usuário quer brainstorm
  - Incluir “responda em um único prompt”
- Se parâmetros suficientes e `confirmar_automaticamente=true`:
  - Executar o bootstrap completo (criar `estado.json`/`resumo.*`) e retornar diretamente os `files`.
  - Incluir no texto o primeiro bloco do discovery e o comando pronto para continuar.

Mudança-chave (para atender o objetivo do fluxo):
- `iniciar_projeto` passa a ser o **ponto primário** de criação do estado (bootstrap) quando o setup está completo.

### Uso de skills
- Já existe `injectContentForIDE`.
- Melhorar a resposta para apontar **1** skill ativa (Gestão de Produto) + opcional brainstorm.

Melhoria adicional:
- Considerar absorver a escolha de Stitch no setup (reduzindo dependência de `confirmar_stitch`).

## 3.2 `src/src/tools/iniciar-projeto.ts` (função `confirmarProjeto`)

### Mudanças
- Persistir:
  - `estado.config.auto_flow`
  - `estado.usar_stitch` (se veio do wizard)
  - Criar `estado.onboarding` inicial:
    - `criarEstadoOnboarding(projetoId, modo)` (já existe no orchestrator; pode ser importado ou duplicado de forma controlada)

Mudança de papel (fluxo novo):
- `confirmar_projeto` deixa de ser etapa obrigatória; vira **compatibilidade/atalho** para concluir o bootstrap quando o usuário preferir.
- Internamente, deve compartilhar a mesma função de bootstrap do `iniciar_projeto` (ex.: `bootstrapProjeto(...)`).

### Retorno mais fluido
- Além de `files`, retornar no texto:
  - “Próximo passo: (já abaixo) primeiro bloco do discovery”
  - Exibir diretamente o bloco 1 formatado (usando o mesmo formatter do onboarding orchestrator)
  - E o comando pronto `onboarding_orchestrator(acao:"proximo_bloco")`

> Isso reduz o “vazio” após confirmar_projeto.

## 3.3 `src/src/flows/onboarding-orchestrator.ts`

### Melhorias
- Nova ação opcional: `acao: 'autopilot'`
  - Se receber `respostas_bloco` e completar todos obrigatórios, já:
    - inicia `brainstorm` automaticamente (gera primeira seção)
    - ou, se `project_definition_source='ja_definido'`, pode pular brainstorm.

- Melhor UX:
  - `handleIniciar` poderia aceitar `acao:'iniciar'` sem ficar pedindo para “copiar questionário”; ele já imprime bloco.
  - Gerar comandos mais curtos.

## 3.4 `src/src/tools/discovery.ts`

### Objetivo
Evitar ter duas fontes de discovery.

### Mudanças possíveis
Opção A (recomendada):
- `discovery` passa a ser um adapter:
  - Se `estado.onboarding` existir, `discovery(respostas)` preenche `onboarding.discoveryResponses` e marca blocos correspondentes.
  - Se não existir, mantém comportamento legado.

Opção B:
- Deprecar `discovery` em favor de `onboarding_orchestrator`.

## 3.5 `src/src/tools/brainstorm.ts`

### Melhorias
- Permitir rodar mesmo se discovery não estiver 100% completo, mas com um “mínimo” (problema + público + MVP).
- Reduzir fricção para quem quer brainstorming cedo.

## 3.6 `src/src/tools/prd-writer.ts`

### Melhorias
- Adicionar `acao: 'gerar_validar'`:
  - Gera PRD + calcula score
  - Se score >= 70, marca `prdStatus='validated'`
  - Retorna:
    - PRD em `files`
    - Estado atualizado
    - Próximo comando recomendado: `proximo(auto_flow:true, entregavel:"..." ...)` (ou instruções para chamar `proximo` com o PRD gerado)

- Integrar validação de gate real:
  - Hoje `prd_writer` valida por presença de seções.
  - Evolução: usar `validarGateComTemplate` para obter score mais consistente.

## 3.7 `src/src/tools/proximo.ts` (já mexido)

Ajustes futuros:
- Se `auto_flow=true` e fase=1, permitir que `proximo` use `estado.onboarding` como contexto extra para preencher lacunas (sem perguntar tudo de novo).

## 3.8 Registro de tools (`src/src/tools/index.ts` + `src/src/index.ts`)

- Garantir que novos campos aparecem no `ListTools`.
- Garantir que `CallTool` repasse novos argumentos.

Melhoria adicional:
- `confirmar_stitch` pode ser mantida por compatibilidade, mas o fluxo recomendado é capturar `usar_stitch` no setup e persistir no estado.
- Avaliar retornar `next_steps_dashboard` (ou ao menos seu resumo) após o bootstrap, para o usuário sempre saber “o que fazer agora” sem ler instruções longas.


## 4. Roadmap de implementação (tarefas por fase)

## Fase 0 — Preparação
- **[T0.1]** Definir tipos em `src/src/types/index.ts` (ou arquivo de tipos adequado):
  - `ProjectDefinitionSource`
  - Expandir `EstadoProjeto.config`
- **[T0.2]** Definir defaults:
  - `auto_flow=false`
  - `project_definition_source='ja_definido'` se `descricao` detalhada; senão `'brainstorm'`

## Fase 1 — Wizard no iniciar_projeto
## Fase 1 — Setup + Bootstrap no iniciar_projeto
- **[T1.1]** Atualizar `iniciarProjetoSchema` com novos campos.
- **[T1.2]** Atualizar o registro/handler da tool para repassar `ide/modo/auto_flow/usar_stitch/...`.
- **[T1.3]** Alterar a resposta do `iniciar_projeto`:
  - Menos texto
  - 1 bloco com decisões
  - 1 exemplo de comando
- **[T1.4]** Implementar `bootstrapProjeto(...)` (função interna) para criar:
  - `.maestro/estado.json`
  - `.maestro/resumo.json`
  - `.maestro/resumo.md`
  Já persistindo todas as escolhas do setup.
- **[T1.5]** (Opcional) `confirmar_automaticamente=true` para one-shot (setup + bootstrap + discovery primeiro bloco).

## Fase 2 — Bootstrap já inicia onboarding
- **[T2.1]** No final do bootstrap (no `iniciar_projeto` e/ou `confirmar_projeto`), criar `estado.onboarding`.
- **[T2.2]** Retornar o primeiro bloco formatado já na resposta do bootstrap.
- **[T2.3]** Ajustar `SYSTEM.md` inicial para apontar o bloco e não repetir instruções.

## Fase 3 — Unificação do discovery
- **[T3.1]** Implementar adapter em `discovery.ts`:
  - se `estado.onboarding` existe: mapear respostas para blocos
  - senão: comportamento atual
- **[T3.2]** Atualizar mensagens para sempre apontar onboarding como “caminho principal”.

## Fase 4 — PRD contínuo (gerar → validar → avançar)
- **[T4.1]** `prd_writer(acao:'gerar_validar')`
- **[T4.2]** Adicionar instrução direta para `proximo(auto_flow:true)` quando score >= 70.
- **[T4.3]** (Evolução) `prd_writer` usa `validarGateComTemplate` para score.

## Fase 5 — Observabilidade e qualidade
- **[T5.1]** Log de eventos (já existe `logEvent`) para onboarding:
  - `ONBOARDING_STARTED`, `DISCOVERY_COMPLETED`, `BRAINSTORM_COMPLETED`, `PRD_VALIDATED`
- **[T5.2]** Testes unitários (mínimo):
  - `discovery-adapter` (blocos)
  - `onboarding-orchestrator` (progresso)
  - `iniciar_projeto` wizard defaults

## 5. Cenários e critérios de aceitação

- **C1**: Usuário roda `iniciar_projeto` com nome+diretorio apenas → recebe 1 prompt curto pedindo 5 decisões.
- **C2**: Usuário roda `iniciar_projeto` com tudo definido → consegue criar projeto e já ver o primeiro bloco do discovery com no máximo 1 interação adicional.
- **C3**: Discovery feito via `onboarding_orchestrator` → não aparece questionário duplicado via `discovery`.
- **C4**: PRD gerado → validação aparece imediatamente; se score >= 70 e `auto_flow=true`, o caminho recomendado é avançar sem bloqueios.

## 6. Riscos e mitigação

- **Risco:** aumento de complexidade de tools.
  - **Mitigação:** parâmetros opcionais, defaults e manter caminhos legacy.

- **Risco:** “stateless wizard” exigir múltiplas chamadas.
  - **Mitigação:** permitir `confirmar_automaticamente` e retorno de payload pronto.

- **Risco:** inconsistência de estado entre `estado.discovery` e `estado.onboarding`.
  - **Mitigação:** migrar para “onboarding como fonte de verdade” e adapter no legacy.

## 7. Próximos passos imediatos (sequência recomendada)

1. Implementar Fase 1 (setup+bootstrap no `iniciar_projeto`) e Fase 2 (bootstrap já inicia onboarding) — maior ganho de UX.
2. Unificar discovery (Fase 3).
3. PRD contínuo (Fase 4).

---

## Status
Documento entregue: plano detalhado de implementação, contratos e fases.
