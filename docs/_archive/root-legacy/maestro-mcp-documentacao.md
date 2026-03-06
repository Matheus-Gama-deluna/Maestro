# 📖 Documentação Completa: MCP Maestro — Fluxo e Funcionamento

> **Data de execução:** 02/03/2026  
> **Projeto de teste:** `d:\Sistemas\teste-maestro`  
> **Objetivo:** Registrar todas as chamadas às ferramentas MCP, retornos, estados e comportamentos observados do Maestro para compreensão completa do sistema.

---

## 🗂️ Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura de Arquivos](#2-arquitetura-de-arquivos)
3. [As 5 Ferramentas MCP](#3-as-5-ferramentas-mcp)
4. [Fluxo Completo Testado](#4-fluxo-completo-testado)
5. [Retornos Detalhados por Ferramenta](#5-retornos-detalhados-por-ferramenta)
6. [Estrutura do Estado (estado.json)](#6-estrutura-do-estado-estadojson)
7. [Sistema de Gates e Validação](#7-sistema-de-gates-e-validação)
8. [Sistema de Skills / Especialistas](#8-sistema-de-skills--especialistas)
9. [Classificação de Projetos](#9-classificação-de-projetos)
10. [Padrões Observados e Comportamentos](#10-padrões-observados-e-comportamentos)
11. [Diagrama do Fluxo](#11-diagrama-do-fluxo)

---

## 1. Visão Geral do Sistema

O **MCP Maestro** é um servidor MCP (Model Context Protocol) que implementa uma metodologia estruturada de desenvolvimento de software em fases. Ele funciona como um **orquestrador de projetos inteligente** que:

- Mantém estado persistente em arquivos JSON locais
- Define fases de desenvolvimento com especialistas (personas de IA)
- Valida entregáveis com gates de qualidade pontuados (0-100)
- Adapta o fluxo conforme a complexidade detectada do projeto
- Carrega dinamicamente templates e checklists por fase

### Princípios Fundamentais

| Princípio | Implementação |
|-----------|--------------|
| **Stateless** | Estado lido SEMPRE de `.maestro/estado.json` — nunca assumir memória prévia |
| **Gate-driven** | Nenhuma fase avança sem score ≥ 70/100 (ou aprovação manual) |
| **Adaptativo** | Fluxo ajusta número de fases conforme análise do PRD |
| **Specialist-based** | Cada fase tem um especialista com persona, template e checklist únicos |

---

## 2. Arquitetura de Arquivos

### Estrutura criada pelo Maestro no projeto:

```
d:\Sistemas\teste-maestro\
├── .agent/                          # Skills locais (IDE: Antigravity)
│   └── skills/
│       ├── specialist-gestao-produto/
│       │   ├── SKILL.md             # Persona + instruções do especialista
│       │   └── resources/
│       │       ├── templates/PRD.md # Template do entregável
│       │       └── checklists/      # Critérios de gate
│       └── specialist-design/
│           └── SKILL.md
├── .gemini/                         # Configuração global da IDE
├── .maestro/                        # ⭐ FONTE DA VERDADE
│   ├── estado.json                  # Estado completo do projeto
│   ├── resumo.json                  # Cache de contexto (simplificado)
│   └── resumo.md                    # Resumo legível para humanos
└── docs/                            # Entregáveis gerados
    ├── 00-setup/
    │   └── plano-orquestracao.md
    ├── fase-01-produto/
    │   └── PRD.md                   # Entregável salvo automaticamente
    └── fase-02-design/
        └── .orientacoes-gate.md     # Orientações geradas pelo sistema
```

### Convenção de Nomenclatura de Fases

O Maestro usa o padrão `docs/fase-{NN}-{nome}/` para organizar entregáveis.

---

## 3. As 5 Ferramentas MCP

### 3.1 `maestro` — Entry Point Inteligente 🎯

**Propósito:** Detectar estado do projeto, criar projetos e configurar setup inicial.

**Assinatura:**
```typescript
maestro({
  diretorio: string,           // OBRIGATÓRIO — caminho absoluto
  acao?: "criar_projeto" | "setup_inicial",
  respostas?: {
    nome?: string,
    descricao?: string,
    ide?: "windsurf" | "cursor" | "antigravity",
    modo?: "economy" | "balanced" | "quality",
    usar_stitch?: boolean
  },
  estado_json?: string         // opcional — carrega automaticamente
})
```

**Comportamentos observados:**
- **Sem projeto:** Retorna configurações globais da IDE e solicita confirmação antes de criar
- **Com projeto criado:** Retorna status atual + próximo passo + instruções para a IA
- **Auto-detecta IDE:** Leu corretamente `antigravity` das configs globais
- **Cria arquivos imediatamente:** `estado.json`, `resumo.json`, `resumo.md`, `plano-orquestracao.md`

---

### 3.2 `executar` — Ações no Projeto ⚡

**Propósito:** Avançar fase, salvar rascunhos, gerenciar checkpoints.

**Assinatura:**
```typescript
executar({
  diretorio: string,           // OBRIGATÓRIO
  acao?: "avancar" | "salvar" | "checkpoint",  // padrão: avancar
  entregavel?: string,         // conteúdo para avançar fase
  respostas?: object,          // para responder formulários de onboarding
  conteudo?: string,           // para acao="salvar"
  tipo?: "rascunho" | "anexo" | "entregavel",
  checkpoint_acao?: "criar" | "rollback" | "listar",
  reason?: string,             // motivo do checkpoint
  estado_json?: string
})
```

**Comportamentos observados:**
1. **Análise inteligente do PRD:** Quando recebe um PRD via `entregavel`, não avança imediatamente — analisa e pontua por complexidade
2. **Fluxo de classificação em 2 etapas:**
   - 1ª call: Recebe PRD → Analisa → Retorna classificação provisória + perguntas
   - 2ª call: Recebe respostas + nível confirma → Confirma classificação → Cria fases
   - 3ª call: Recebe PRD novamente com `entregavel` → Valida gate → Avança fase
3. **Gate auto-aprovado:** Com PRD completo e bem estruturado, o gate foi aprovado automaticamente
4. **Aviso de performance:** Recomenda salvar arquivo no disco antes de enviar via argumento
5. **Próxima fase automática:** Após aprovação, já carrega o contexto da próxima fase

---

### 3.3 `validar` — Validações ✅

**Propósito:** Validar gate da fase atual, entregáveis específicos ou compliance.

**Assinatura:**
```typescript
validar({
  diretorio: string,           // OBRIGATÓRIO
  tipo?: "gate" | "entregavel" | "compliance",
  entregavel?: string,
  fase?: number,
  standard?: "LGPD" | "PCI-DSS" | "HIPAA",
  code?: string,
  estado_json?: string
})
```

**Comportamento observado (sem entregável):**
- Retorna `⚠️ Nenhum Entregável Encontrado`
- Lista o checklist de gate da fase atual
- Instrui como proceder (gerar entregável primeiro)
- **Não bloqueia** — apenas informa o estado

---

### 3.4 `analisar` — Análises de Código 🔍

**Propósito:** Análise de segurança, qualidade, performance e dependências.

**Assinatura:**
```typescript
analisar({
  diretorio: string,           // OBRIGATÓRIO
  tipo?: "seguranca" | "qualidade" | "performance" | "dependencias" | "completo",
  code?: string,
  language?: "typescript" | "javascript" | "python",
  estado_json?: string
})
```

**Comportamento observado (sem código):**
- Retorna instruções sobre como usar a ferramenta
- Exibe seção `⚠️ Erro de Comunicação` indicando que nenhuma chamada de tool foi detectada
- **Requer código ou arquivo** para análise real
- Documentação gerada indica análise OWASP, qualidade e performance

---

### 3.5 `contexto` — Contexto Acumulado 🧠

**Propósito:** Retornar resumo completo do projeto com decisões, padrões e ADRs.

**Assinatura:**
```typescript
contexto({
  diretorio: string,           // OBRIGATÓRIO
  estado_json: string          // OBRIGATÓRIO (diferente das outras)
})
```

**Retorno observado (344 linhas / 12kB):**
- Informações gerais: projeto, nível, tipo, fase atual
- Progresso: gates validados, fases completas, última atualização
- Entregáveis gerados (lista vazia inicialmente)
- Skills utilizadas
- **Conteúdo do Especialista:** Injeta o SKILL.md completo do especialista ativo, incluindo:
  - Persona detalhada (nome, tom, expertise)
  - Frases características
  - Missão e entregável esperado
  - Protocolo de coleta conversacional (12 perguntas em 3 blocos)
  - Seções obrigatórias do entregável
  - Gate checklist
- **Template do entregável:** Template completo em markdown (truncado no output)
- **Checklist de validação:** Critérios com pesos numéricos
- **Fluxo completo:** Todas as fases com status
- **Contexto JSON:** Estado simplificado do projeto
- Seção `⚠️ Erro de Comunicação` (artefato de sistema, pode ser ignorado)

---

## 4. Fluxo Completo Testado

### Linha do Tempo

```
14:51:54 — Diretório vazio
          ↓
          [CALL 1] maestro({ diretorio })
          → Detecta sem projeto
          → Retorna configs globais (IDE: antigravity, modo: balanced)
          → Instrui: confirmar configs + nome + descrição
          ↓
          [CALL 2] maestro({ acao: "criar_projeto", respostas: {...} })
          → Cria estrutura de arquivos
          → Ativa Especialista: Gestão de Produto
          → Cria: estado.json, resumo.json, resumo.md, plano-orquestracao.md
          → Status: aguardando_prd
          ↓
          [CALL 3] contexto({ estado_json }) [PARALELO]
          → Retorna 12kB de contexto com especialista + template
          
          [CALL 4] analisar({ tipo: "completo" }) [PARALELO]
          → Sem código: retorna instruções de uso
          
          [CALL 5] validar({ estado_json }) [PARALELO]
          → Sem entregável: retorna checklist de gate
          ↓
          [CALL 6] executar({ acao: "avancar", entregavel: PRD_COMPLETO })
          → NÃO avança direto — analisa PRD!
          → Detecta: 17 pontos de complexidade
          → Sugere: COMPLEXO
          → Retorna perguntas críticas (integrações, compliance, volume)
          ↓
          [CALL 7] executar({ acao: "avancar", respostas: { nivel: "complexo", ... } })
          → Confirma classificação: COMPLEXO, 11 fases, tier AVANÇADO
          → Instrui gerar entregável PRD.md
          ↓
          [CALL 8] executar({ acao: "avancar", entregavel: PRD_COMPLETO })
          → Gate aprovado automaticamente ✅
          → Salva: docs/fase-01-produto/PRD.md
          → Atualiza: estado.json, resumo.json, resumo.md
          → Avança para Fase 2: Design
          → Ativa: specialist-design
17:53:24 — Projeto em Fase 2 (Design), status: ativo
```

### Resumo Numérico

| Métrica | Valor |
|---------|-------|
| Total de chamadas MCP | 8 |
| Arquivos criados pelo Maestro | 7+ |
| Tempo total do fluxo | ~2 minutos |
| Gate da Fase 1 | ✅ Aprovado automaticamente |
| Fases configuradas (fluxo complexo) | 11 |
| Tier do gate | AVANÇADO |

---

## 5. Retornos Detalhados por Ferramenta

### Retorno 1: `maestro` (sem projeto)

```
# 🎯 Maestro — Novo Projeto

Nenhum projeto encontrado em `d:\Sistemas\teste-maestro`. 
Configuração global detectada.

| IDE | antigravity |
| Modo | balanced |
| Stitch | Sim |

⚠️ OBRIGATÓRIO: Pergunte ao usuário ANTES de prosseguir:
1. Confirme as configurações acima para ESTE projeto
2. Pergunte o nome e descrição do projeto

⚠️ NÃO prossiga sem respostas REAIS do usuário. NÃO infira valores.
```

**Análise:** O sistema é deliberadamente conservador — força interação humana antes de criar qualquer coisa.

---

### Retorno 2: `maestro` (criar_projeto)

```
# 🚀 Projeto Iniciado: Projeto Teste Maestro

| ID | 28b68acd-2a61-43a7-8162-0548d1658d5d |
| Diretório | d:\Sistemas\teste-maestro |
| IDE | antigravity |
| Tipo | product |
| Tier | BASE |
| Modo | BALANCED |
| Total Fases | 10 (provisório) |
| Status | Ativo |

⚙️ SISTEMA — AÇÃO OBRIGATÓRIA:
Leia AGORA: @[.agent/skills/specialist-gestao-produto/SKILL.md]
Assuma a persona imediatamente.
Confirme: "Sou [nome do especialista], meu foco é [entregável]."
✋ NÃO gere o entregável completo sem interagir com o usuário primeiro.
```

**Análise:** O sistema instrui a IA explicitamente. O número de fases (10 → 11) é ajustado depois da análise do PRD.

---

### Retorno 3: `executar` (PRD — 1ª vez — análise)

```
# 🔍 PRD Analisado (PRD-first)

| Nível sugerido | COMPLEXO |
| Pontuação | 17 |
| Critérios detectados |
  - Muitas entidades (131+)
  - Integrações externas detectadas
  - Requisitos de segurança/compliance
  - Multi-tenancy ou B2B
  - Cronograma moderado (3 meses)
  - Equipe grande (10+ devs)

Confirme a classificação + responda:
- (crítica) Quais integrações externas são obrigatórias?
- (crítica) Existem requisitos de compliance (LGPD/PCI/HIPAA)?
- (crítica) Volume de usuários/dados esperado?
- (importante) Qual é o domínio do produto?
- (importante) Alguma stack preferida?
- (opcional) Time e senioridade?
```

**Análise:** O Maestro faz análise semântica do PRD para pontuar complexidade. O critério "equipe grande (10+ devs)" foi inferido incorretamente — o PRD mencionava "10 devs" no contexto de custo médio de mercado, não do time real. Isso indica limitações na inferência contextual.

---

### Retorno 4: `executar` (confirmar classificação)

```
# ✅ Classificação Confirmada!

| Nível | COMPLEXO |
| Tipo | product |
| Tier | AVANCADO |
| Total Fases | 11 |

Tier Avançado (13 fases, 59 validações) — Sistemas críticos

📍 Próxima Fase: Produto
  Especialista: Product Manager
  Entregável: PRD.md
```

**Análise:** Inconsistência detectada — mensagem diz "13 fases, 59 validações" mas o estado configurou 11 fases. Tier AVANÇADO é aplicado para sistemas críticos com segurança/compliance.

---

### Retorno 5: `executar` (PRD — 2ª vez — gate aprovado)

```
> ⚠️ AVISO: O entregável foi recebido via argumento (4815 chars), não do disco.
> Para melhor performance, salve o arquivo no disco primeiro e depois chame
> executar({ acao: "avancar" })
> O sistema lê automaticamente do path canônico: docs/fase-XX-nome/entregavel

# ✅ Fase 1 Concluída!

📁 Entregável: d:\Sistemas\teste-maestro/docs/fase-01-produto/PRD.md
✅ Gate aprovado

## Classificação Inicial (PROVISÓRIA)
| Nível | SIMPLES |
| Confiança | 8% |
| Total de Fases | 5 |

# 📍 Fase 2/5: Design
  Especialista: UX Designer Lead
  Entregável: design-doc.md

Gate de Saída:
  - [ ] Jornada do usuário principal mapeada completa
  - [ ] Wireframes cobrem todas as telas do MVP
  - [ ] Design system definido
  - [ ] Navegação e arquitetura de informação clara
  - [ ] Estados de UI (loading, empty, error) documentados
  - [ ] Acessibilidade WCAG 2.1 AA considerada
  - [ ] Responsividade mobile-first planejada

Onde Salvar:
  docs/fase-02-design/design-doc.md
  docs/fase-02-design/.orientacoes-gate.md
```

**Análise:** Segunda inconsistência detectada — após confirmar COMPLEXO (11 fases), ao avançar mostrou SIMPLES (5 fases, confiança 8%). O estado parece ter sido recalculado internamente. **Gate foi aprovado** sem score visível — não houve rejeição.

---

## 6. Estrutura do Estado (estado.json)

### Estado Inicial (pós-criação)

```json
{
  "projeto_id": "28b68acd-2a61-43a7-8162-0548d1658d5d",
  "nome": "Projeto Teste Maestro",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "nivel": "medio",
  "tipo_fluxo": "novo_projeto",
  "status": "aguardando_prd",
  "fase_atual": 1,
  "total_fases": 10,
  "entregaveis": {},
  "gates_validados": [],
  "usar_stitch": false,
  "stitch_confirmado": true,
  "tipo_artefato": "product",
  "tier_gate": "base",
  "classificacao_confirmada": true,
  "ide": "antigravity",
  "aguardando_classificacao": false,
  "classificacao_pos_prd_confirmada": true,
  "aguardando_aprovacao": false,
  "em_estado_compulsorio": false,
  "tools_permitidas_no_compulsorio": ["executar", "validar", "contexto"],
  "flow_phase_type": "input_required",
  "auto_flow_enabled": false,
  "criado_em": "2026-03-02T17:51:54.968Z",
  "atualizado_em": "2026-03-02T17:51:54.973Z",
  "config": {
    "mode": "balanced",
    "flow": "principal",
    "optimization": {
      "batch_questions": false,
      "context_caching": true,
      "template_compression": false,
      "smart_validation": false,
      "one_shot_generation": false,
      "differential_updates": true
    },
    "frontend_first": true,
    "auto_checkpoint": false,
    "auto_fix": true,
    "auto_flow": false,
    "onboarding": {
      "enabled": true,
      "source": "onboarding_v2",
      "project_definition_source": "ja_definido"
    },
    "setup": {
      "completed": true,
      "decided_at": "2026-03-02T17:51:54.968Z",
      "decided_by": "user"
    }
  },
  "onboarding": {
    "projectId": "28b68acd-2a61-43a7-8162-0548d1658d5d",
    "phase": "specialist_active",
    "specialistPhase": {
      "skillName": "specialist-gestao-produto",
      "status": "active",
      "collectedData": {},
      "interactionCount": 0,
      "activatedAt": "2026-03-02T17:51:54.968Z"
    },
    "discoveryStatus": "pending",
    "discoveryBlocks": [],
    "discoveryResponses": {},
    "brainstormStatus": "pending",
    "brainstormSections": [],
    "prdStatus": "pending",
    "prdScore": 0,
    "mode": "balanced",
    "totalInteractions": 0,
    "lastInteractionAt": "2026-03-02T17:51:54.968Z"
  }
}
```

### Campos Importantes e Seus Significados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | `aguardando_prd`, `ativo`, etc. — estado macro do projeto |
| `fase_atual` | number | Fase corrente (base 1) |
| `total_fases` | number | Total de fases do fluxo escolhido |
| `tier_gate` | string | `base`, `avancado` — rigor de validação |
| `em_estado_compulsorio` | boolean | Se true, apenas tools listadas em `tools_permitidas_no_compulsorio` funcionam |
| `flow_phase_type` | string | `input_required` (espera usuário) vs `derived` (geração autônoma) |
| `auto_flow_enabled` | boolean | Se true, avança fases automaticamente sem intervenção |
| `inferencia_contextual` | object | Perguntas críticas que o sistema não consegue inferir do contexto |

### Estado Após Classificação Confirmada

```json
{
  "nivel": "complexo",
  "status": "ativo",
  "fase_atual": 1,
  "total_fases": 11,
  "tier_gate": "avancado",
  "inferencia_contextual": {
    "perguntas_prioritarias": [
      { "pergunta": "Quais integrações externas são obrigatórias?", "prioridade": "critica", "pode_inferir": false },
      { "pergunta": "Existem requisitos de segurança/compliance?", "prioridade": "critica", "pode_inferir": false },
      { "pergunta": "Volume de usuários/dados esperado?", "prioridade": "critica", "pode_inferir": false },
      { "pergunta": "Qual é o domínio do produto?", "prioridade": "importante", "pode_inferir": false },
      { "pergunta": "Alguma stack preferida?", "prioridade": "importante", "pode_inferir": false },
      { "pergunta": "Time e senioridade?", "prioridade": "opcional", "pode_inferir": false }
    ]
  }
}
```

---

## 7. Sistema de Gates e Validação

### Tiers de Rigor

| Tier | Quando | Validações | Score Mínimo |
|------|--------|-----------|-------------|
| **Essencial** | POC, Script | Funciona? | Não especificado |
| **Base** | Internal, Product | Padrão indústria | 70/100 |
| **Avançado** | Product complexo | "59 validações" | 70/100 |

### Checklist do Gate da Fase 1 (Produto)

```
Itens Críticos (peso maior):
  Item 1: Problema com impacto quantificado     — Peso 15
  Item 2: Mínimo 2 personas com JTBD            — Peso 15
  Item 3: MVP com 3-7 funcionalidades (RICE)    — Peso 15
  Item 4: North Star Metric com metas           — Peso 10

Itens Importantes:
  Item 5: Escopo negativo definido              — Peso 8
  Item 6: Riscos com mitigação                  — Peso 8
  Item 7: Modelo de negócio claro               — Peso 7
  Item 8: Alternativas analisadas               — Peso 7

Score mínimo para aprovação: 70/100
```

### Checklist do Gate da Fase 2 (Design)

```
- [ ] Jornada do usuário principal mapeada completa
- [ ] Wireframes cobrem todas as telas do MVP
- [ ] Design system definido (cores, tipografia, componentes)
- [ ] Navegação e arquitetura de informação clara
- [ ] Estados de UI (loading, empty, error) documentados
- [ ] Acessibilidade WCAG 2.1 AA considerada
- [ ] Responsividade mobile-first planejada
```

### Comportamento Quando Gate Falha

```
# 🔴 Gate Bloqueado (Score: 60/100)

✅ Requisitos funcionais com IDs
✅ Requisitos não-funcionais

❌ Critérios de aceite em Gherkin
❌ Matriz de rastreabilidade

Deseja corrigir ou aprovar mesmo assim?
```

Após 3 tentativas sem atingir score mínimo, o sistema apresenta opções (aprovar, editar, re-tentar) sem loop infinito.

---

## 8. Sistema de Skills / Especialistas

### Mapeamento Fase → Especialista → Entregável

| Fase | Nome | Especialista | Entregável |
|------|------|-------------|-----------|
| 1 | Produto | Product Manager | `PRD.md` |
| 2 | Design | UX Designer Lead | `design-doc.md` |
| 3 | Requisitos | Engenheiro de Requisitos | `requisitos.md` |
| 4 | Arquitetura | Arquiteto de Software | `arch-doc.md` |
| ... | ... | ... | ... |

### Estrutura de uma Skill (SKILL.md)

```yaml
---
name: specialist-gestao-produto
trigger: on_demand
category: general
version: 1.0.0
---

# Especialista em Produto

## Persona
Nome: Product Manager
Tom: Estratégico, orientado a dados, centrado no usuário
Expertise: Product Discovery, Lean Startup, JTBD, RICE, AARRR...

## Comportamento
- SEMPRE faz coleta conversacional profunda antes de gerar
- Exige dados quantificáveis
- Prioriza implacavelmente (> 5 features → força ranking)
- Comportamentos proibidos em lista ❌

## Missão
Transformar ideia em PRD robusto em ~60 minutos

## Coleta Conversacional (12 perguntas em 3 blocos)
Bloco 1 — O Problema (4 perguntas)
Bloco 2 — A Solução (4 perguntas)
Bloco 3 — Contexto (4 perguntas)

## Gate Checklist
8 itens com critérios de pass/fail

## Recursos
- resources/templates/PRD.md
- resources/checklists/gate-checklist.md
- resources/examples/example-prd.md
- resources/reference/guide.md
```

### Protocol de Transição de Fase

Quando o sistema avança de fase, a instrução para a IA é:

```
⚙️ SISTEMA — AÇÃO OBRIGATÓRIA (Nova Fase Iniciada)
Leia AGORA os arquivos da sua função:
1. @[.agent/skills/specialist-design/SKILL.md]
Assuma a persona descrita no arquivo principal imediatamente.
Confirme dizendo: "Sou [nome do especialista], meu foco é [entregável desta fase]."
✋ NÃO gere o entregável completo sem interagir com o usuário primeiro.
```

### Tipo de Fase: `derived` vs `input_required`

O campo `flow_phase_type` controla o comportamento:

- **`input_required`:** Especialista deve fazer perguntas e aguardar respostas do usuário
- **`derived`:** Geração autônoma — IA usa contexto das fases anteriores sem perguntas adicionais

Na Fase 2 (Design), o sistema indicou que é `derived`, instruindo a IA a gerar sem fazer perguntas de alinhamento.

---

## 9. Classificação de Projetos

### Sistema de Pontuação do PRD

O Maestro analisa o PRD e pontua baseado em critérios:

| Critério | Quando detectado |
|----------|-----------------|
| Muitas entidades | > 131 entidades mencionadas |
| Integrações externas | Menção de APIs, SDKs, OAuth |
| Requisitos de compliance | LGPD, PCI, HIPAA, SOC2 |
| Multi-tenancy ou B2B | Contexto empresarial |
| Cronograma moderado | 3+ meses |
| Equipe grande | 10+ devs (pode inferir incorretamente) |

### Níveis e Fluxos

| Nível | Fases | Tier | Quando |
|-------|-------|------|--------|
| **Simples** | 5-7 | Essencial/Base | POC, MVP < 2 semanas |
| **Médio** | 10-13 | Base | SaaS simples, 1-3 meses |
| **Complexo** | 11-17 | Base/Avançado | Multi-tenant, fintech, 3+ meses |

### Inconsistências Detectadas no Teste

> ⚠️ **Nota:** Durante o teste foram detectadas inconsistências no sistema de classificação:
> 1. Projeto iniciou com 10 fases (médio), classificou como COMPLEXO (11 fases), mas ao concluir a Fase 1 informou fluxo de 5 fases (SIMPLES, confiança 8%)
> 2. Mensagem disse "13 fases, 59 validações" mas configurou 11 fases
> 3. Critério "equipe grande (10+ devs)" foi inferido do contexto do custo de mercado, não do time real

---

## 10. Padrões Observados e Comportamentos

### ✅ O que funciona bem

| Comportamento | Observação |
|--------------|------------|
| **Instruções para IA** | Retornos contêm seções `AI_INSTRUCTIONS` com instruções explícitas e detalhadas |
| **Criação de arquivos** | Cria automaticamente toda a estrutura de pastas e arquivos necessários |
| **Conteúdo rico no `contexto`** | Injeta persona completa, template e checklist no retorno |
| **Gate auto-aprovado** | PRD bem estruturado foi aprovado sem intervenção manual |
| **Persistência de estado** | `estado.json` é atualizado a cada operação com timestamp |
| **Análise de PRD** | Detecta complexidade e faz perguntas focadas antes de classificar |
| **Transição de fase** | Gera automaticamente orientações para o gate da próxima fase |

### ⚠️ Limitações Identificadas

| Limitação | Descrição |
|-----------|-----------|
| **Inconsistência de classificação** | Número de fases oscilou entre 5, 10, 11 e 13 no mesmo fluxo |
| **`analisar` sem código** | Retorna erro sem análise quando não há código — mais útil se analisasse a estrutura do projeto |
| **Erros de inferência** | "Equipe grande" inferida de dado de mercado, não de dado real do projeto |
| **SKILL.md vazio** | O arquivo `.agent/skills/specialist-gestao-produto/SKILL.md` no projeto é um template genérico vazio — o conteúdo real vem do servidor MCP via resources |
| **Score não visível** | Gate aprovado sem exibir o score numérico (só "Gate aprovado") |
| **Aviso de performance redundante** | O aviso de "salvar no disco primeiro" aparece mesmo em testes onde é esperado envio por argumento |

### 🔄 Fluxos Alternativos

Durante o teste, o sistema expôs comportamentos de fluxo alternativo:

1. **Estado compulsório (`em_estado_compulsorio`):** Flag que restringe tools disponíveis a `["executar", "validar", "contexto"]`
2. **Classificação provisória:** Sistema usa 8% de confiança quando reclassifica no momento do gate
3. **PRD-first flow:** Aceita PRD antes de perguntas de onboarding quando enviado diretamente

---

## 11. Diagrama do Fluxo

```
┌─────────────┐
│  Diretório  │
│   vazio     │
└──────┬──────┘
       │ maestro()
       ▼
┌─────────────────────────────────────────────────────────┐
│  Detecta sem projeto                                    │
│  → Lê configs globais (IDE, modo, stitch)               │
│  → Instrui IA: "Confirme configs + peça nome/descrição" │
└──────┬──────────────────────────────────────────────────┘
       │ maestro({ acao: "criar_projeto", respostas: {...} })
       ▼
┌─────────────────────────────────────────────────────────┐
│  Cria projeto                                           │
│  • estado.json (status: aguardando_prd)                 │
│  • resumo.json                                          │
│  • resumo.md                                            │
│  • docs/00-setup/plano-orquestracao.md                  │
│  → Ativa: specialist-gestao-produto                     │
│  → Instrui IA: "Leia SKILL.md + assuma persona"         │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
  ┌────────────────────────────────────────┐
  │  Fase de Coleta Conversacional         │
  │  (specialist coleta dados do usuário)  │
  └────────────────┬───────────────────────┘
                   │ executar({ entregavel: PRD })
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Análise PRD-first                                      │
│  • Pontua complexidade                                  │
│  • Sugere nível (SIMPLES/MÉDIO/COMPLEXO)                │
│  • Faz perguntas críticas não-inferíveis                │
└──────┬──────────────────────────────────────────────────┘
       │ executar({ respostas: { nivel: "complexo", ... } })
       ▼
┌─────────────────────────────────────────────────────────┐
│  Confirma classificação                                 │
│  • Define total de fases                                │
│  • Define tier (base/avancado)                          │
│  • Instrui gerar entregável                             │
└──────┬──────────────────────────────────────────────────┘
       │ executar({ entregavel: PRD })
       ▼
┌─────────────────────────────────────────────────────────┐
│  Gate Validation                                        │
│  • Score calculado (0-100)                              │
│  • ≥ 70 → APROVADO ✅ / < 70 → BLOQUEADO 🔴            │
│  • Salva: docs/fase-01-produto/PRD.md                   │
│  • Atualiza: estado.json, resumo.json, resumo.md        │
└──────┬──────────────────────────────────────────────────┘
       │ Gate Aprovado
       ▼
┌─────────────────────────────────────────────────────────┐
│  Próxima Fase                                           │
│  • fase_atual++ (1 → 2)                                 │
│  • Ativa novo especialista                              │
│  • Cria: docs/fase-02-design/.orientacoes-gate.md       │
│  • Define flow_phase_type (derived ou input_required)   │
│  → Instrui IA: "Leia SKILL.md do novo especialista"     │
└─────────────────────────────────────────────────────────┘
       │ (repete por todas as fases)
       ▼
   [Próxima Fase...]
```

---

## Apêndice: Resources MCP

O Maestro também expõe resources consultáveis via API:

```
maestro://especialista/{nome}   # Persona do especialista
maestro://template/{nome}       # Template de documento
maestro://guia/{nome}           # Guia prático
maestro://prompt/{area}/{nome}  # Prompts avançados
maestro://system-prompt         # System prompt do Maestro
```

Esses resources podem ser consultados via `read_resource("maestro://...")` e retornam conteúdo em texto/markdown para complementar o conteúdo das skills locais.

---

*Documento gerado por Antigravity em 02/03/2026 — d:\Sistemas\teste-maestro\docs\maestro-mcp-documentacao.md*

---

## 12. Sessão 2 — Continuação do Fluxo (Fases 2 a 4)

> **Data:** 02/03/2026 — 15:01 (horário local)  
> **Ponto de partida:** Fase 2/5 (Design), status: ativo, gates=[1]

### 12.1 Linha do Tempo — Sessão 2

```
15:01 — Retomada: Fase 2/5 (Design), tier AVANÇADO, nivel SIMPLES
         ↓
         [CALL 1] maestro({ estado_json }) → Status: Fase 2/5, 20%
         → Links resources: maestro://skills/specialist-design/SKILL.md
         → Links resources: maestro://skills/specialist-design/templates/template.md

         [CALL 2] contexto({ estado_json }) → 11kB, template Design Doc + gate checklist
         [CALL 3] read_resource("maestro://skills/specialist-design/SKILL.md") → ✅ Persona real
         ↓
         Gerar + salvar docs/fase-02-design/design-doc.md
         ↓
         [CALL 4] executar({ acao: "avancar" }) — SEM entregavel
         → 📄 "Entregável lido automaticamente de: docs/fase-02-design/design-doc.md"
         → ✅ Fase 2 Concluída | ⚠️ Gate forçado
         → Classif. progressiva: SIMPLES, confiança 7%, 2 sinais
         → Avança para Fase 3/5: Arquitetura
         ↓
         [CALL 5] read_resource("maestro://skills/specialist-architect/SKILL.md") → ✅ Persona real
         ↓
         Gerar + salvar docs/fase-03-arquitetura/arquitetura.md
         ↓
         [CALL 6] executar({ acao: "avancar" }) — lê do disco automaticamente
         → ✅ Fase 3 Concluída | ✅ Gate aprovado
         → 🔄 EXPANSÃO DE FLUXO: SIMPLES → MÉDIO (+6 fases, total 8)
         → Confiança: 33%, sinais: Stack 3 componentes + 4 integrações
         → Avança para Fase 4/8: Design Técnico
         ↓
         [CALL 7] read_resource("maestro://skills/specialist-technical-design/SKILL.md") → ✅
         ↓
         Gerar + salvar docs/fase-04-design-tecnico/technical-design.md
         ↓
         [CALL 8] executar({ acao: "avancar" })
         → ✅ Fase 4 Concluída | ✅ Gate aprovado
         → Classif. refinada: MÉDIO, confiança 40%, 10 sinais
         → Avança para Fase 5/8: Planejamento (especialista: Tech Lead)
15:20 — Projeto em Fase 5/8 (Planejamento)
```

### 12.2 Novo Comportamento: Leitura Automática do Disco

A partir da Fase 2, o `executar` passou a **ler o arquivo automaticamente do disco** sem precisar do argumento `entregavel`:

```
> 📄 Entregável lido automaticamente de:
  d:\Sistemas\teste-maestro\docs\fase-02-design\design-doc.md
```

**Lógica detectada:** O sistema busca o entregável no path canônico `docs/fase-{NN}-{nome}/{entregavel}` antes de usar o argumento. Isso confirma o aviso de performance dado na Sessão 1 ("salve no disco primeiro").

### 12.3 Novo Comportamento: Gate Forçado

Na Fase 2 (Design), o gate foi descrito como "⚠️ Gate forçado" em vez de "✅ Gate aprovado":

```
✅ Fase 2 Concluída!
📁 Entregável: docs/fase-02-design/design-doc.md
⚠️ Gate forçado

Classificação Refinada:
  Nível: SIMPLES | Confiança: 7% | Sinais: 2
```

**Hipótese:** O sistema não conseguiu calcular o score do gate com confiança suficiente (7%) e forçou a aprovação para não bloquear o fluxo. Isso pode ocorrer quando os critérios do gate não são completamente atingidos, mas o conteúdo é suficiente para avançar.

### 12.4 Novo Comportamento: `read_resource` Funcional para SKILL.md Real

O `maestro` retornou links de resources no formato `maestro://`:

```
- 📎 [Skill: specialist-design](maestro://skills/specialist-design/SKILL.md)
- 📎 [Template: template.md](maestro://skills/specialist-design/templates/template.md)
```

`read_resource("maestro://skills/specialist-design/SKILL.md")` retornou o SKILL.md **completo e real** do especialista, diferente do arquivo local `.agent/skills/specialist-design/SKILL.md` que é um template genérico vazio.

**Conclusão:** As skills locais são apenas placeholders. O conteúdo real dos especialistas reside no servidor MCP e é acessível via `read_resource` ou injetado automaticamente no retorno do `contexto`.

Tentativa de `read_resource("maestro://skills/specialist-design/templates/template.md")` retornou:
```
Resource não encontrado: maestro://skills/specialist-design/templates/template.md
```
O template vem via `contexto`, não como resource direto.

### 12.5 Novo Comportamento: Expansão de Fluxo Automática

**Este foi o comportamento mais inesperado e relevante da Sessão 2.** Após processar o documento de Arquitetura (Fase 3), o sistema detectou sinais de complexidade e **expandiu o fluxo automaticamente**:

```
🔄 Expansão de Fluxo Detectada!

  De        → SIMPLES (5 fases)
  Para      → MÉDIO (8 fases)
  +6 fases adicionadas
  Confiança → 33%
  
  Sinais detectados:
  - Stack definida (3 componentes)
  - Múltiplas integrações (4)

✅ Classificação DEFINITIVA confirmada na fase de Arquitetura.
```

**O que isso significa:**
1. A classificação de projeto é **progressiva** — reavaliada a cada fase com base em sinais acumulados
2. O ponto de confirmação definitiva é a **Fase de Arquitetura** (onde a stack e integrações ficam claras)
3. Fases já concluídas **permanecem intactas** — o sistema só adiciona novas fases ao final
4. O campo `classificacao_progressiva` no `estado.json` registra histórico: nível, confiança e sinais por fase

### 12.6 Evolução do `estado.json` — Campos Novos Observados

```json
{
  "classificacao_progressiva": {
    "nivel_atual": "simples",
    "nivel_provisorio": true,
    "confianca_geral": 8,
    "sinais": [
      {
        "fase": 1,
        "fonte": "prd",
        "categoria": "dominio",
        "valor": "E-commerce",
        "confianca": 0.75,
        "timestamp": "2026-03-02T17:54:08.218Z"
      },
      {
        "fase": 1,
        "fonte": "prd",
        "categoria": "escopo",
        "valor": "Baixo (< 8 funcionalidades)",
        "confianca": 0.7
      },
      {
        "fase": 1,
        "fonte": "prd",
        "categoria": "timeline",
        "valor": "Curto (< 3 meses)",
        "confianca": 0.9
      }
    ],
    "historico_niveis": [],
    "fases_refinamento": [1]
  }
}
```

**Campos importantes:**
| Campo | Descrição |
|-------|-----------|
| `nivel_provisorio` | `true` = classificação ainda pode mudar; `false` = definitiva |
| `confianca_geral` | % de confiança na classificação atual (subiu de 8% → 33% → 40%) |
| `sinais` | Array de evidências coletadas por fase (categoria + valor + confiança) |
| `fases_refinamento` | Fases que contribuíram para refinar a classificação |

### 12.7 Mapeamento Completo das Fases (Fluxo MÉDIO — 8 fases)

| Fase | Nome | Especialista | Entregável | Gate |
|------|------|-------------|-----------|------|
| 1 ✅ | Produto/Discovery | Product Manager | `PRD.md` | Aprovado |
| 2 ✅ | Design | UX Designer Lead | `design-doc.md` | Forçado |
| 3 ✅ | Arquitetura | Arquiteto de Soluções | `arquitetura.md` | Aprovado |
| 4 ✅ | Design Técnico | Arquiteto de Soluções | `technical-design.md` | Aprovado |
| 5 🔄 | Planejamento | Tech Lead | `backlog.md` | Pendente |
| 6 ⬜ | Frontend | — | — | — |
| 7 ⬜ | Backend | — | — | — |
| 8 ⬜ | Integração & Deploy | — | — | — |

### 12.8 Checklist de Gate — Fase 5 (Planejamento)

```
- [ ] Épicos mapeiam funcionalidades do MVP
- [ ] User Stories com IDs, tipo FE/BE e story points
- [ ] Top 10 US com critérios de aceite detalhados
- [ ] Endpoints de API derivados do modelo de dados
- [ ] Sprints planejados com objetivo e US incluídas
- [ ] Estratégia de testes com ferramentas e cobertura
- [ ] Definition of Done definido
```

### 12.9 Atualização: Padrões e Limitações

**Novos padrões confirmados:**

| Padrão | Detalhe |
|--------|---------|
| **Leitura automática do disco** | `executar` busca entregável no path canônico automaticamente |
| **Classificação progressiva** | Confiança cresce por fase: 8% → 33% → 40% |
| **Expansão de fluxo** | Sistema pode adicionar fases após processar arquitetura |
| **Gate forçado** | Ocorre quando confiança é baixa mas conteúdo é suficiente |
| **SKILL.md real via MCP** | `read_resource("maestro://skills/...")` retorna persona real |
| **Fase de Arquitetura = definitiva** | Sistema confirma classificação definitivamente na Fase de Arquitetura |

**Nova limitação observada:**

| Limitação | Detalhe |
|-----------|---------|
| **Domínio inferido incorretamente** | Sistema detectou "E-commerce" como domínio do PRD de DevDocs AI (plataforma SaaS para devs) |
| **Template de resource não acessível** | `maestro://skills/{spec}/templates/template.md` retorna 404; template vem via `contexto` |


---

### 22. Teste Completo de Checkpoint — Rollback Funcionou

**[CALL 5] executar(checkpoint, listar) → Lista Checkpoints**

`
📋 Checkpoints Disponíveis
Total: 1

CP-1772475115249
Data: 02/03/2026, 15:11:55
Motivo: Antes de gerar Fase 5 (Planejamento) — 4 fases concluídas, estado estável
Fase: 5 | Arquivos: 10 | Auto: Não
`

**[CALL 6] executar(checkpoint, rollback, id: CP-1772475115249) → Rollback**

`
✅ Rollback Total Concluído
Checkpoint: CP-1772475115249
Arquivos restaurados: 10
Fase restaurada: 5
`

**Verificação pós-rollback via maestro():**
`
Fase 5/8 — Planejamento
Progresso: █████░░░░░ 50% (5/8)
← atual: Fase 5
`

**Conclusão do rollback:**
- Rollback restaura o estado.json e arquivos do checkpoint (10 arquivos)
- O projeto efetivamente voltou para a Fase 5
- gates_validados voltou para [1,2,3,4,5] sendo fase atual 5

---

### 23. Redescoberta: Re-avanço Pós-Rollback — Leitura Automática do Disco

**[CALL 7] executar(avancar, entregavel: resumo) → Re-avanço da Fase 5→6**

Após rollback, ao avançar com entregável (mesmo resumo curto), o Maestro:

`
> 📄 Entregável lido automaticamente de: docs/fase-05-planejamento/backlog.md
✅ Gate aprovado
📍 Fase 6/8: Frontend
`

**Comportamento confirmado:**
1. O Maestro prioriza a leitura do arquivo em disco sobre o entregavel passado via parâmetro
2. Ao detectar que docs/fase-05-planejamento/backlog.md existe, lê diretamente do disco
3. Se o arquivo tem conteúdo suficiente → gate aprovado automaticamente
4. O texto passado em entregavel foi ignorado em favor do arquivo no disco

**Implication crítica para Readiness Gate:**
O bloqueio do Readiness Gate (PRD e Requisitos com 0 chars) sugere que o ase-01-produto/PRD.md existe no disco mas o gate não consegue lê-lo como "PRD/Discovery" — possivelmente por problema de categorização interna.

---

### 24. Comportamento: validar() Sem Entregável — Fase 6

**[CALL 8] validar() → Checklist sem pontuação**

`
# 📋 Gate da Fase 6: Frontend

⚠️ Nenhum Entregável Encontrado

Checklist de Saída:
1. Componentes implementados conforme design doc e user stories
2. Pages com rotas configuradas para cada fluxo
3. State management conectado (hooks/stores)
4. Integração com mocks ou API real
5. Testes unitários para componentes críticos
6. Responsivo mobile-first e acessível
7. Loading, empty e error states em todas as telas

💡 Como Proceder:
Gere o entregável da fase usando os especialistas
Ou passe manualmente: validar_gate(entregavel: "...")
`

**Comportamento observado:**
- alidar() sem parâmetros = retorna o checklist da fase atual
- Diz "Nenhum entregável encontrado" mesmo com rontend-code existindo no disco
- A fase 	echnical (código) não usa auto-leitura do disco para validação
- O arquivo rontend-code não tem a extensão .md — possível causa da não-detecção

---

### 25. Bug Confirmado: analisar() Ignora Parâmetro code — Terceira Confirmação

**[CALL 9] analisar(tipo: "qualidade", code: [SearchOverlay.tsx completo]) → Bug**

`
# 📊 Análise de Qualidade

## Como usar
analisar_qualidade(codigo: "seu código aqui")
analisar_qualidade(arquivo: "src/services/user.ts")

## O que é verificado
| Métrica | Descrição |
| Complexidade | Ciclomática |
| Tamanho | Linhas de código |
| Padrões | TODO/FIXME |
| Tipos | Uso de any |
| Duplicação | Strings duplicadas |

⚠️ Erro de Comunicação
- Nenhuma chamada de tool detectada
- Use 'executar({...})' para avançar no fluxo
`

**Bug triplo confirmado:** nalisar() com tipo segurança, qualidade e código real sempre retorna instruções de uso, nunca analisa o código passado. O parâmetro code é aceito pela assinatura mas ignorado na execução.

---

### 26. Resumo Final — Padrões Consolidados das 4 Sessões

#### Tabela de Comportamentos Completa

| Tool | Parâmetro | Comportamento Esperado | Comportamento Real |
|------|-----------|----------------------|---------------------|
| maestro() | status | Retorna fase atual com progresso visual | ✅ Funciona corretamente |
| maestro() | criar_projeto | Cria estrutura + estado.json | ✅ Funciona corretamente |
| contexto() | — | Retorna SKILL + template + checklist | ✅ Funciona (retorna ~250 linhas) |
| executar() | avancar (sem entregavel) | Avança com geração autônoma | ⚠️ Após 3x: bloqueia com "Loop detectado" |
| executar() | avancar + entregavel | Valida e avança | ✅ Funciona (mas lê disco se arquivo existe) |
| executar() | avancar (fase technical) | Verifica Readiness Gate primeiro | 🔒 Bloqueado se fases anteriores não indexadas |
| executar() | salvar | Salva entregável no servidor | ⚠️ Instrucional — retorna instruções, não salva |
| executar() | checkpoint criar | Cria snapshot do projeto | ✅ Funciona corretamente |
| executar() | checkpoint listar | Lista checkpoints disponíveis | ✅ Funciona corretamente |
| executar() | checkpoint rollback | Restaura estado anterior | ✅ Funciona corretamente |
| alidar() | — (sem entregavel) | Valida gate atual | ⚠️ Retorna checklist sem pontuação |
| alidar() | entregavel | Valida com score | ✅ Funciona (score + feedback) |
| alidar() | tipo: "entregavel", fase: N | Valida fase específica | ❌ Bug: ignora parâmetro fase |
| nalisar() | tipo: qualidade/segurança + code | Analisa código passado | ❌ Bug: ignora parâmetro code |
| nalisar() | tipo: dependencias | Analisa dependências do projeto | Não testado |

#### Fluxo de Fases — Comportamento por Tipo

`
input_required:  Fase 1 (PRD)
  → Faz perguntas conversacionais ao usuário
  → Aguarda respostas antes de gerar
  → Pede confirmação de classificação (score de complexidade)

derived:  Fases 2-5 (Docs)
  → Geração autônoma baseada em contexto anterior
  → Lê entregáveis anteriores automaticamente
  → Gate validado por conteúdo do arquivo no disco

technical:  Fases 6-7 (FE, BE)
  → READINESS GATE pré-código (verifica 5 artefatos anteriores)
  → Score mínimo 70/100 para passar
  → Após gate: gera entregável (relatório de implementação, não código real)
  → Arquivo de entregável: txt/markdown, não .tsx/.ts
`


---

### 22. Teste Completo de Checkpoint — Rollback Funcionou

**[CALL 5] executar(checkpoint, listar) -> Lista um checkpoint: CP-1772475115249 (Fase 5, 10 arquivos, 02/03/2026)**

**[CALL 6] executar(checkpoint, rollback, id: CP-1772475115249) -> Rollback**
```n✅ Rollback Total Concluido
Checkpoint: CP-1772475115249
Arquivos restaurados: 10
Fase restaurada: 5
```n
**Verificação pos-rollback via maestro():** Fase 5/8 — Planejamento, Progresso: 50% (5/8)

**Conclusao:** Rollback restaura o estado.json e os 10 arquivos do checkpoint. O projeto efetivamente voltou a Fase 5 com gates_validados revertendo para pre-fase-5.


---

### 22. Teste Completo de Checkpoint — Rollback Funcionou

**[CALL 5] executar(checkpoint, listar)**

Retornou 1 checkpoint: CP-1772475115249 (Fase 5, 10 arquivos, 02/03/2026 15:11:55)

**[CALL 6] executar(checkpoint, rollback, id: CP-1772475115249)**

`
Rollback Total Concluido
Checkpoint: CP-1772475115249
Arquivos restaurados: 10
Fase restaurada: 5
`

Verificacao pos-rollback via maestro(): Fase 5/8, Progresso 50%.

**Conclusao:** Rollback restaura estado.json e arquivos do snapshot. Projeto voltou para Fase 5.

---

### 23. Re-avanco Pos-Rollback — Leitura Automatica do Disco

**[CALL 7] executar(avancar, entregavel: resumo curto)**

`
Entregavel lido automaticamente de: docs/fase-05-planejamento/backlog.md
Gate aprovado
Fase 6/8: Frontend
`

O Maestro prioriza leitura do arquivo em disco sobre o entregavel passado no parametro.

---

### 24. validar() Sem Entregavel — Fase 6

**[CALL 8] validar()**

`
Gate da Fase 6: Frontend
Nenhum Entregavel Encontrado

Checklist de Saida:
1. Componentes implementados conforme design doc e user stories
2. Pages com rotas configuradas para cada fluxo
3. State management conectado (hooks/stores)
4. Integracao com mocks ou API real
5. Testes unitarios para componentes criticos
6. Responsivo mobile-first e acessivel
7. Loading, empty e error states em todas as telas
`

O arquivo frontend-code existe no disco mas nao e detectado (extensao sem .md).

---

### 25. Bug Confirmado: analisar() Ignora code — Terceira Confirmacao

**[CALL 9] analisar(tipo: qualidade, code: SearchOverlay.tsx completo)**

Retornou instrucoes de uso genericas. Status do bug: CONFIRMADO em qualidade, seguranca, qualidade (3 testes).

---

### 26. Resumo Final — Padroes Consolidados (4 Sessoes)

| Tool | Comportamento | Status |
|------|---------------|--------|
| maestro() status | Retorna fase atual com progresso visual | Funciona |
| maestro() criar_projeto | Cria estrutura + estado.json | Funciona |
| contexto() | Retorna SKILL + template + checklist (~250 linhas) | Funciona |
| executar(avancar sem entregavel) | Apos 3x: bloqueia com Loop detectado | Comportamento |
| executar(avancar + entregavel) | Valida e avanca; le disco se arquivo existe | Funciona |
| executar(avancar fase technical) | Readiness Gate bloqueado se fases nao indexadas | Bloqueio |
| executar(salvar) | Instrucional — retorna instrucoes, nao salva | Limitacao |
| executar(checkpoint criar) | Cria snapshot do projeto | Funciona |
| executar(checkpoint listar) | Lista checkpoints com metadados | Funciona |
| executar(checkpoint rollback) | Restaura estado anterior completamente | Funciona |
| validar() sem entregavel | Retorna checklist sem pontuacao | Limitacao |
| validar() com entregavel | Retorna score + feedback | Funciona |
| validar(tipo:entregavel, fase:N) | Ignora parametro fase | Bug |
| analisar(tipo + code) | Ignora parametro code | Bug |

#### Mapa de Tipos de Fase

`
input_required — Fase 1 (PRD)
  Faz perguntas conversacionais ao usuario
  Aguarda respostas antes de gerar
  Pede confirmacao de classificacao

derived — Fases 2-5 (Docs)
  Geracao autonoma baseada em contexto anterior
  Le entregaveis anteriores automaticamente
  Gate validado por conteudo do arquivo no disco

technical — Fases 6-7 (FE, BE)
  READINESS GATE pre-codigo (verifica 5 artefatos)
  Score minimo 70/100 para passar
  Apos gate: gera relatorio de implementacao (Markdown, nao codigo)
`
