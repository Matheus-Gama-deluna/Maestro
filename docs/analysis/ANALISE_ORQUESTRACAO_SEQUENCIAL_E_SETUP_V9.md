# Análise Estratégica da Orquestração Sequencial do Maestro (v9)

**Data:** 2026-02-27  
**Autor:** Análise técnica orientada ao objetivo do produto  
**Escopo:** Caminho de orquestração por fases, aderência ao objetivo de codificação com contexto robusto, e proposta de evolução da fase de setup.

---

## 1) Resumo Executivo

O Maestro já implementa uma arquitetura fortemente orientada a **orquestração sequencial** e **gates de qualidade**, com bons mecanismos de:

- setup inicial obrigatório,
- onboarding com especialista (especialmente para PRD),
- progressão fase a fase com bloqueios por qualidade,
- transição explícita para fases de código com decomposição em tasks.

Isso está bem alinhado com seu objetivo central: **não chegar na codificação com contexto fraco**.

No entanto, ainda existem lacunas importantes para o objetivo que você descreveu:

1. O setup atual captura preferências técnicas (IDE, modo, stitch), mas **não apresenta ao usuário um plano explícito de fases** nem permite configurar formalmente “quais fases usar” além do modo (economy/balanced/quality).
2. Não existe um **“Contrato de Prontidão para Codificação”** formalizado como gate dedicado entre engenharia/arquitetura e desenvolvimento de código.
3. Há pontos de inconsistência de experiência entre subfluxos (ex.: thresholds diferentes por tipo de fase), que podem confundir percepção de qualidade.

**Recomendação principal:** instituir uma **Fase 0 de Setup de Orquestração** (orientação + seleção de trilha + contrato de qualidade pré-código), mantendo a espinha dorsal sequencial já existente.

---

## 2) Objetivo de Produto (interpretação do que você quer atingir)

A intenção do Maestro, conforme seu direcionamento, pode ser sintetizada em 4 princípios:

1. **Orquestração sequencial por engenharia** para reduzir improviso.
2. **Acúmulo de contexto robusto** antes de codar.
3. **Gate de qualidade real** antes e durante codificação.
4. **Experiência guiada para o usuário** (especialmente no início), com clareza de fases e expectativas.

Essa visão é correta e consistente com problemas reais de desenvolvimento com IA (geração precoce de código sem contexto, drift arquitetural, baixa rastreabilidade).

---

## 3) Diagnóstico do caminho atual do Maestro (AS-IS)

## 3.1 Entrada e Setup

O setup atual já é obrigatório e anti-inferência:

- pergunta IDE, modo e uso de Stitch;
- instrui explicitamente para não inferir respostas;
- persiste configuração para reutilização.

Isso é positivo, mas o setup está centrado em **preferências operacionais**, não em **didática do fluxo**.

**Observação crítica:** hoje não há um artefato de saída do setup contendo “mapa de fases escolhido + critérios de avanço + fases opcionais desativadas”.

---

## 3.2 Fluxo de onboarding

O fluxo atual prioriza especialista e PRD (coleta -> geração -> validação -> aprovação), com limpeza de estado para evitar loop e transição para classificação.

Esse bloco está maduro para evitar travamentos e consolidar contexto inicial de produto.

---

## 3.3 Fluxos por complexidade

As fases canônicas estão estruturadas em 3 trilhas:

- **simples**: 7 fases,
- **médio**: 13 fases,
- **complexo**: 17 fases,
- com fase opcional de **Prototipagem (Stitch)** inserida após UX Design.

Essa modelagem está correta para escalonamento de rigor, e já representa uma base sólida para sua proposta de engenharia + arquitetura antes da codificação.

---

## 3.4 Avanço, validação e gates

O avanço é centralizado em `executar(acao="avancar")`, que roteia para:

- onboarding specialist,
- prototipagem dedicada (se aplicável),
- code-phase handler (fases de código),
- proximo.ts (fases não-código e gate genérico).

Existem mecanismos fortes de governança:

- bloqueio por score baixo,
- aprovação manual em faixa intermediária,
- anti-loop,
- estado compulsório em cenários de correção.

Esse desenho é robusto para impedir “passar de fase por acidente”.

---

## 3.5 Entrada em codificação

A entrada em fases de código está melhor estruturada agora:

- fases de código canônicas (Frontend, Backend, Integração, Deploy Final),
- decomposição em tasks orientadas ao backlog,
- geração de manifest e rastreabilidade de user stories.

**Ponto de atenção arquitetural:** após validação por artefatos no code-phase handler, ainda existe delegação para `proximo.ts` textual em `delegateToProximo()`. Isso pode introduzir redundância e comportamento não totalmente homogêneo entre gate técnico e gate textual.

---

## 3.6 Fase de Prototipagem (Stitch)

A fase dedicada de prototipagem evoluiu bem:

- sub-estados claros,
- validação granular de HTML,
- thresholds específicos (auto/manual/bloqueio),
- documentação de saída (`prototipos.md`, validação, prompts).

Esse fluxo fortalece o contexto visual antes da implementação frontend.

---

## 4) Aderência aos seus objetivos

## 4.1 O que já está muito alinhado

1. **Sequencialidade com gate:** evita pular etapas críticas.
2. **Especialização por fase:** melhora profundidade de contexto.
3. **Rastreabilidade crescente:** aproxima backlog -> US -> arquivos -> status.
4. **Transição consciente para código:** reduz risco de coding sem base.

## 4.2 O que ainda falta para “ficar redondo”

1. **Setup pedagógico (falta):** usuário ainda não recebe uma explicação formal e negociada do fluxo escolhido.
2. **Seleção explícita de fases (parcial):** hoje ocorre via modo, mas sem governança explícita de fases habilitadas/desabilitadas no estado.
3. **Gate dedicado de prontidão pré-código (falta):** não existe um gate único com contrato mínimo obrigatório antes de Frontend/Backend.
4. **Consistência de experiência de score (atenção):** thresholds por fluxo diferentes são válidos tecnicamente, mas precisam ser comunicados de forma uniforme ao usuário.

---

## 5) Proposta central: Fase 0 “Setup de Orquestração Guiada”

## 5.1 Objetivo

Antes de iniciar o onboarding de conteúdo, executar uma fase explícita para:

1. mostrar as fases disponíveis,
2. explicar o propósito de cada fase,
3. permitir seleção da trilha de execução,
4. formalizar critérios mínimos para liberar codificação.

## 5.2 Saídas obrigatórias da Fase 0

Gerar e persistir um arquivo, por exemplo:

- `docs/00-setup/plano-orquestracao.md`

Com:

- trilha escolhida (simples/médio/complexo + stitch),
- fases habilitadas,
- fases opcionais desativadas (se houver),
- justificativa da configuração,
- contrato de prontidão para codificação.

## 5.3 Perguntas mínimas dessa fase

1. Você quer trilha **Essencial**, **Equilibrada** ou **Máxima Qualidade**?
2. Deseja incluir prototipagem visual (Stitch)?
3. Deseja manter todas as fases obrigatórias da trilha?
4. Quais critérios devem ser obrigatórios antes de codar?
5. Quer auto-flow em fases técnicas ou confirmação humana em cada gate?

---

## 6) Proposta: Contrato de Prontidão para Codificação (novo gate)

Adicionar um gate explícito entre “planejamento/engenharia” e “primeira fase de código”.

### Exemplo de score de prontidão (100 pontos)

- PRD aprovado: 20
- Requisitos com critérios de aceite: 20
- Arquitetura/Modelo/DB (conforme trilha): 20
- Backlog rastreável por US: 20
- Contrato API (quando aplicável): 20

### Decisão

- **>= 80:** libera codificação automaticamente
- **60-79:** aprovação manual obrigatória
- **< 60:** bloqueio

Isso reforça exatamente seu objetivo de só codar com contexto suficiente.

---

## 7) Proposta de perfis de orquestração (seleção de fases)

Além de economy/balanced/quality, expor para o usuário “perfis narrativos”:

| Perfil | Foco | Quando usar |
|---|---|---|
| Essencial | Velocidade com mínimo de qualidade | MVPs simples |
| Engenharia Forte | Mais rigor em requisitos/arquitetura | Produtos com risco técnico |
| Qualidade Máxima | Máxima rastreabilidade e governança | Projetos críticos |

Internamente isso pode mapear para os fluxos atuais, mas com uma UX mais clara.

---

## 8) Plano de implementação recomendado (incremental)

## Sprint A — Setup Guiado (UX + persistência)

- Novo subfluxo no `maestro` para orientação de fases.
- Persistir plano de orquestração no estado e em documento.

## Sprint B — Seleção formal de fases

- Estruturar `enabled_phases`/`disabled_phases` no estado.
- Ajustar flow engine para respeitar seleção.

## Sprint C — Gate de prontidão pré-código

- Criar serviço de readiness dedicado.
- Integrar antes de entrar em Frontend/Backend.

## Sprint D — Observabilidade da orquestração

- Métricas: tempo por fase, taxa de retrabalho, aprovação em 1ª tentativa, delta de score.

---

## 9) Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Setup ficar longo demais | Queda de adoção | Modo rápido com defaults explicados + modo avançado opcional |
| Excesso de rigidez | Lentidão no delivery | Aprovação manual e perfis por contexto |
| Complexidade de estado | Manutenção difícil | Fonte única de verdade e testes por transição |

---

## 10) Decisão recomendada (objetiva)

Se o objetivo é **qualidade de codificação via contexto robusto**, mantenha a arquitetura sequencial e implemente imediatamente:

1. **Fase 0 de Setup Guiado com explicação de fases**,
2. **seleção explícita da trilha/fases**,
3. **gate de prontidão pré-código**.

Isso preserva o melhor do Maestro atual e fecha justamente o gap que você identificou: orientar o usuário no começo e blindar a entrada em codificação com contexto suficiente.

---

## 11) Checklist de validação desta proposta

- [ ] O usuário entende todas as fases antes de começar.
- [ ] O plano de orquestração fica persistido no projeto.
- [ ] Não existe entrada em codificação sem passar no gate de prontidão.
- [ ] A trilha escolhida é auditável e reproduzível.
- [ ] A experiência continua simples para iniciantes.

---

**Conclusão:** sua hipótese está correta: orquestração sequencial melhora qualidade de código quando o sistema força contexto mínimo. O Maestro já tem boa base estrutural para isso; o próximo salto é transformar setup em fase estratégica, não apenas técnica.
