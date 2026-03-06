# Plano de Refatoração v3 — Fluxo do Especialista

> **Data:** 2026-02-10  
> **Base:** Análise da conversa `docs/resolver v2.md` — 10 novos problemas (NP1-NP10)  
> **Pré-requisito:** Sprints 1-5 do Plano v2 já implementadas  
> **Objetivo:** Corrigir bugs bloqueantes, aperfeiçoar o papel do especialista como gestor de produto, garantir injeção de resources desde o início, e eliminar stall points  
> **Status:** 📋 Planejado

---

## 1. Resumo dos Problemas a Resolver

| # | Problema | Severidade | Categoria |
|---|---------|-----------|-----------|
| NP7 | Loop infinito no estado `generating` — handleGenerating não transiciona para validating quando entregável é enviado | **Bloqueante** | Bug |
| NP6 | Template/checklist só injetados na fase generating, não na collecting | **Crítico** | Timing |
| NP8 | MCP Resources/Prompts não consumidos pela IA — injeção deve ser inline | **Alto** | Arquitetura |
| NP1 | Especialista aceita que IA crie dados em vez de extrair do usuário | **Alto** | UX |
| NP4 | IA para entre etapas esperando comando do usuário (stall points) | **Alto** | Flow |
| NP5 | IA pede dados extras não rastreados pelo handler (gap campos vs template) | **Alto** | Design |
| NP9 | Perguntas técnicas demais para usuário não-técnico | **Médio** | UX |
| NP2 | Mapeamento de campos inconsistente (riscos_principais vs riscos) | **Médio** | Robustez |
| NP3 | Perguntas duplicadas após mapeamento falho | **Médio** | Consequência NP2 |
| NP10 | Validação de score baseada em regex é superficial | **Médio** | Qualidade |

---

## 2. Sprints de Implementação

### Sprint 1: Fix Bug Bloqueante — Transição generating → validating

**Resolve:** NP7  
**Esforço:** ~30 minutos  
**Risco:** Baixo  

**Arquivo:** `src/src/handlers/specialist-phase-handler.ts`

**Problema:** O switch `case 'generating'` sempre chama `handleGenerating()`, que nunca verifica `args.entregavel`. Quando a IA envia o PRD, o handler mostra o template novamente em loop infinito.

**Mudança:**

1. **No switch principal** (`handleSpecialistPhase`, linha ~50-55):
   - Quando status é `generating` E `args.entregavel` existe → transicionar diretamente para `handleValidating`
   
   ```typescript
   case 'generating':
       if (args.entregavel) {
           sp.status = 'validating';
           return handleValidating(args, onboarding, sp);
       }
       return handleGenerating(args, onboarding, sp);
   ```

2. **Também no `handleCollecting`** (linha ~104-108):
   - Quando todos os campos estão coletados E `args.entregavel` existe → ir direto para validating (skip generating)
   
   ```typescript
   if (missing.length === 0) {
       if (args.entregavel) {
           sp.status = 'validating';
           return handleValidating(args, onboarding, sp);
       }
       sp.status = 'generating';
       await persistState(estado, onboarding, diretorio);
       return handleGenerating(args, onboarding, sp);
   }
   ```

**Critério de aceite:**
- [ ] Com status=generating + entregavel presente → handleValidating é chamado
- [ ] Score é calculado e retornado
- [ ] Se score >= 70 → handleApproved é chamado automaticamente
- [ ] Se score < 70 → gaps mostrados com instruções de melhoria
- [ ] Sem entregável → handleGenerating funciona como antes

---

### Sprint 2: Injeção de Resources Desde a Ativação do Especialista

**Resolve:** NP6, NP8  
**Esforço:** ~2-3 horas  
**Risco:** Médio  

**Arquivos:**
- `src/src/handlers/specialist-phase-handler.ts` (collecting + buildCollectionPrompt)
- `src/src/tools/iniciar-projeto.ts` (confirmarProjeto)
- `src/src/services/skill-loader.service.ts` (novo método)

**Problema:** O template PRD e checklist só são carregados em `handleGenerating`. Na fase `collecting`, a IA não tem acesso a eles. Resultado: IA não sabe o que perguntar e gera PRD sem template.

**Mudanças:**

1. **Novo método em `skill-loader.service.ts`** — `loadCollectingPackage(skillName)`:
   - Carrega SKILL.md (seção "Processo Otimizado" + "Quality Gate")
   - Carrega esqueleto do template (headings + primeiros campos de cada seção)
   - Carrega checklist resumido (categorias + pesos, sem detalhes)
   - Budget: ~1500 tokens (não o pacote completo de ~4000)
   - Objetivo: dar à IA contexto suficiente para fazer perguntas inteligentes

2. **`buildCollectionPrompt` e `handleCollecting`** — Injetar collecting package:
   - Adicionar seção `## 📋 Contexto do Especialista` no output
   - Incluir esqueleto do template: "O PRD final deve ter estas seções: [lista]"
   - Incluir guia de perguntas: "Para cada seção, pergunte ao usuário sobre: [dicas]"
   - Manter no campo `instrucoes` do formatResponse

3. **`confirmarProjeto` em `iniciar-projeto.ts`** — Injetar resumo na ativação:
   - Carregar `loadCollectingPackage` e incluir no output de ativação
   - A IA terá o contexto desde o primeiro momento
   - Seção: "O template final do PRD tem X seções. Use as perguntas abaixo para coletar os dados."

4. **Fallback inline vs. MCP Resources:**
   - Manter MCP Resources disponíveis (para clients que os consumam)
   - **Sempre** incluir conteúdo inline no output das tools (não depender de ReadResource)
   - Princípio: "Se está no output da tool, a IA VAI ver. Se está em um Resource, TALVEZ veja."

**Critério de aceite:**
- [ ] Na ativação do especialista, output contém esqueleto do template PRD
- [ ] Em `handleCollecting`, output contém guia de perguntas por seção
- [ ] IA consegue gerar PRD seguindo o template na primeira tentativa
- [ ] Budget de tokens do collecting package <= 1500 tokens
- [ ] MCP Resources continuam disponíveis como complemento

---

### Sprint 3: Especialista como Gestor de Produto para Não-Técnicos

**Resolve:** NP1, NP5, NP9  
**Esforço:** ~3-4 horas  
**Risco:** Médio  

**Arquivos:**
- `src/src/handlers/specialist-phase-handler.ts` (getRequiredFields, prompts)
- `src/src/tools/iniciar-projeto.ts` (perguntas de ativação)
- `content/skills/specialist-gestao-produto/SKILL.md` (guia de perguntas)

**Problema:** As perguntas usam termos técnicos (North Star Metric, JTBD, RICE), campos obrigatórios não cobrem o template, e a IA aceita criar dados em vez de extrair do usuário.

**Mudanças:**

#### 3.1 Perguntas em linguagem simples

Reformular `getRequiredFields` com perguntas adaptadas:

```typescript
// ANTES:
{ id: 'north_star_metric', label: 'North Star Metric', hint: 'Como medir sucesso?' }

// DEPOIS:
{ 
  id: 'north_star_metric', 
  label: 'Métrica de sucesso', 
  hint: 'Qual o número mais importante para saber se o produto está dando certo?',
  example: 'Ex: "Quantos pedidos completados por semana" ou "% de tarefas concluídas no prazo"',
  technical_name: 'North Star Metric'
}
```

Tabela completa de reformulações:

| Campo ID | Label Técnico | Label Simples | Exemplo |
|----------|--------------|---------------|---------|
| `problema` | Problema central | Qual problema seu produto resolve? | "Equipes perdem controle de tarefas por usar planilhas" |
| `publico_alvo` | Público-alvo | Quem vai usar seu produto? | "Pequenas empresas de 5-30 pessoas" |
| `funcionalidades_mvp` | Funcionalidades MVP | Quais as 3-5 coisas mais importantes que o produto precisa fazer? | "Criar checklists, atribuir tarefas, ver status" |
| `north_star_metric` | North Star Metric | Qual número mostra que o produto está funcionando? | "% de checklists concluídos no prazo" |
| `riscos` | Riscos principais | O que pode dar errado? | "Usuários não adotarem, custo alto de servidor" |
| `timeline` | Timeline | Em quanto tempo quer lançar a primeira versão? | "8 semanas para MVP + 2 semanas piloto" |
| `personas` | Personas detalhadas | Descreva 2-3 tipos de pessoas que vão usar (nome fictício, cargo, rotina) | "Maria, coordenadora, monitora equipes pelo celular" |
| `go_to_market` | Go-to-market | Como pretende conseguir os primeiros usuários? | "Piloto com 2 clientes atuais, depois indicação" |

#### 3.2 Perguntas em blocos temáticos

Em vez de 6-8 perguntas de uma vez, organizar em 2-3 blocos:

- **Bloco 1 — O Problema** (obrigatório, todos os modos):
  - `problema` + `publico_alvo`
  - "Conte sobre o problema que quer resolver e quem sofre com ele"

- **Bloco 2 — A Solução** (obrigatório, todos os modos):
  - `funcionalidades_mvp` + `north_star_metric`
  - "O que o produto precisa fazer e como medir se está funcionando?"

- **Bloco 3 — Planejamento** (balanced/quality):
  - `riscos` + `timeline` + `personas` (quality) + `go_to_market` (quality)
  - "Riscos, prazos e como chegar aos primeiros usuários"

Cada bloco enviado em uma interação, reduzindo prompts do usuário para 2-3 no total.

#### 3.3 Alinhar campos com seções do template PRD

Expandir `getRequiredFields` para cobrir seções do template que a IA precisa preencher, agrupados por bloco temático:

| Seção do Template PRD | Campo Obrigatório Existente | Novo Campo Sugerido |
|---|---|---|
| Sumário Executivo | problema, publico_alvo | (coberto) |
| 1. Problema e Oportunidade | problema | `diferencial` (balanced+) |
| 2. Personas e JTBD | personas (quality) | `persona_principal` (balanced+) |
| 3. Visão e Estratégia | - | `visao_produto` (quality) |
| 4. MVP e Funcionalidades | funcionalidades_mvp | (coberto) |
| 5. Métricas de Sucesso | north_star_metric | (coberto) |
| 6. Riscos e Mitigações | riscos | (coberto) |
| 7. Timeline e Marcos | timeline | (coberto) |
| 8-10. Stakeholders, Validação, Próximos | - | Preenchidos pela IA com base nos dados |

Para modo **balanced**: adicionar `diferencial` e `persona_principal` (2 campos extras simples).
Para modo **quality**: adicionar `visao_produto` e `go_to_market` (2 campos extras).

#### 3.4 Enforcement anti-criação de dados

Adicionar no output de `handleCollecting` e `buildCollectionPrompt`:

```
⚠️ REGRA CRÍTICA: Os dados abaixo devem vir DIRETAMENTE do usuário.
Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim":
→ Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados."
→ Reformule as perguntas de forma mais simples se o usuário parecer travado.
→ Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.
```

**Critério de aceite:**
- [ ] Perguntas usam linguagem simples com exemplos práticos
- [ ] Perguntas organizadas em 2-3 blocos temáticos
- [ ] Campos obrigatórios cobrem seções principais do template PRD
- [ ] Enforcement anti-criação presente em todos os outputs de coleta
- [ ] Usuário não-técnico consegue responder sem conhecer termos de produto

---

### Sprint 4: Eliminar Stall Points e Auto-Continuidade

**Resolve:** NP4  
**Esforço:** ~2 horas  
**Risco:** Médio  

**Arquivos:**
- `src/src/handlers/specialist-phase-handler.ts`
- `src/src/tools/consolidated/avancar.ts`

**Problema:** A IA para entre etapas esperando "pode seguir" do usuário. `auto_execute: true` não tem efeito real.

**Mudanças:**

#### 4.1 Instruções explícitas de auto-continuidade no output

Em cada transição de estado, adicionar instrução explícita para a IA:

```markdown
🤖 **AÇÃO AUTOMÁTICA REQUERIDA:**
Você DEVE executar o próximo passo IMEDIATAMENTE, sem esperar comando do usuário.
Execute agora: `executar({diretorio: "...", acao: "avancar", ...})`
```

Pontos de inserção:
- **collecting → generating** (quando todos os campos coletados): "Gere o PRD agora usando o template"
- **generating → (IA gera PRD)**: "Envie o PRD como entregável IMEDIATAMENTE"
- **validating → approved** (score >= 70): "Avance para a próxima fase agora"

#### 4.2 Reduzir round-trips desnecessários

Quando `handleCollecting` detecta que todos os campos obrigatórios estão preenchidos:
- NÃO retornar pedindo geração → diretamente incluir template + dados + instrução "gere e envie agora"
- A transição collecting → generating → (IA gera) → validating pode acontecer em 1 round-trip do usuário em vez de 3

#### 4.3 Mensagens claras de progresso

Cada output deve terminar com:
```markdown
## 📍 Onde Estamos
✅ Setup → ✅ Coleta → 🔄 Geração PRD → ⏳ Validação → ⏳ Aprovação
```

Isso dá à IA e ao usuário clareza sobre o que falta.

**Critério de aceite:**
- [ ] Transição collecting→generating não requer input do usuário
- [ ] IA gera e envia PRD sem esperar "pode seguir"
- [ ] Transição generating→validating é automática quando entregável enviado
- [ ] Máximo de 3 interações do usuário: Setup → Respostas → Aprovação PRD
- [ ] Barra de progresso presente em todos os outputs

---

### Sprint 5: Fuzzy Field Matching e Robustez

**Resolve:** NP2, NP3  
**Esforço:** ~1 hora  
**Risco:** Baixo  

**Arquivo:** `src/src/handlers/specialist-phase-handler.ts`

**Problema:** IA envia `riscos_principais` mas handler espera `riscos`. Match exato por ID causa perguntas duplicadas.

**Mudanças:**

1. **Criar mapa de aliases em `handleCollecting`:**

```typescript
const FIELD_ALIASES: Record<string, string[]> = {
    'problema': ['problema_central', 'problem', 'pain_point', 'dor'],
    'publico_alvo': ['publico', 'target', 'audience', 'usuarios', 'usuarios_alvo'],
    'funcionalidades_mvp': ['features', 'funcionalidades', 'mvp', 'features_mvp'],
    'north_star_metric': ['metrica', 'metric', 'kpi', 'north_star', 'metrica_sucesso'],
    'riscos': ['riscos_principais', 'risks', 'riscos_mercado', 'riscos_tecnicos'],
    'timeline': ['cronograma', 'prazo', 'timeline_desejado', 'quando'],
    'personas': ['persona', 'persona_principal', 'personas_detalhadas'],
    'go_to_market': ['gtm', 'lancamento', 'estrategia_lancamento', 'go_to_market_strategy'],
};
```

2. **Função `normalizeFieldKey`:**

```typescript
function normalizeFieldKey(key: string): string {
    const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
        if (normalized === canonical || aliases.includes(normalized)) {
            return canonical;
        }
    }
    return normalized;
}
```

3. **Aplicar no loop de acumulação** (linha 89-93):

```typescript
for (const [key, value] of Object.entries(respostas)) {
    if (value !== undefined && value !== null && value !== '') {
        const normalizedKey = normalizeFieldKey(key);
        sp.collectedData[normalizedKey] = value;
    }
}
```

**Critério de aceite:**
- [ ] `riscos_principais` é mapeado para `riscos` automaticamente
- [ ] `metrica` é mapeado para `north_star_metric`
- [ ] Campos desconhecidos são armazenados com chave original (sem perder dados)
- [ ] Nenhuma pergunta duplicada quando campo já fornecido com alias

---

### Sprint 6: Validação Estruturada do PRD

**Resolve:** NP10  
**Esforço:** ~2 horas  
**Risco:** Baixo  

**Arquivo:** `src/src/handlers/specialist-phase-handler.ts`

**Problema:** `calculatePrdScore` usa regex trivial. Qualquer menção a "problema" dá 15 pontos.

**Mudanças:**

1. **Validação por seções do template:**

Em vez de regex soltos, verificar se o PRD contém **seções estruturadas** com conteúdo mínimo:

```typescript
interface SectionCheck {
    heading: RegExp;           // Regex para encontrar heading da seção
    minContentLength: number;  // Mínimo de caracteres de conteúdo após o heading
    weight: number;            // Peso na pontuação
    label: string;
}

const SECTION_CHECKS: SectionCheck[] = [
    { heading: /##?\s*(sumário|summary|executiv)/i, minContentLength: 100, weight: 10, label: 'Sumário Executivo' },
    { heading: /##?\s*(problema|problem|oportunidade)/i, minContentLength: 150, weight: 15, label: 'Problema e Oportunidade' },
    { heading: /##?\s*(persona|jobs?\s*to\s*be)/i, minContentLength: 100, weight: 15, label: 'Personas e JTBD' },
    { heading: /##?\s*(mvp|funcionalidade|feature)/i, minContentLength: 100, weight: 15, label: 'MVP e Funcionalidades' },
    { heading: /##?\s*(m[eé]trica|kpi|north\s*star|sucesso)/i, minContentLength: 50, weight: 10, label: 'Métricas de Sucesso' },
    { heading: /##?\s*(risco|mitiga)/i, minContentLength: 80, weight: 10, label: 'Riscos' },
    { heading: /##?\s*(timeline|cronograma|marco)/i, minContentLength: 50, weight: 5, label: 'Timeline' },
    { heading: /##?\s*(vis[aã]o|estrat[eé]gia|go.to.market)/i, minContentLength: 50, weight: 5, label: 'Visão e Estratégia' },
];
```

2. **Nova função `calculatePrdScoreV2`:**

```typescript
function calculatePrdScoreV2(prd: string): { score: number; details: SectionResult[] } {
    const results: SectionResult[] = [];
    const sections = splitBySections(prd);
    
    for (const check of SECTION_CHECKS) {
        const section = sections.find(s => check.heading.test(s.heading));
        const found = !!section;
        const hasContent = section ? section.content.length >= check.minContentLength : false;
        const score = found && hasContent ? check.weight : found ? Math.floor(check.weight * 0.5) : 0;
        results.push({ label: check.label, found, hasContent, score, maxScore: check.weight });
    }
    
    // Bonus por completude geral
    const wordCount = prd.split(/\s+/).length;
    let bonus = 0;
    if (wordCount > 500) bonus += 10;
    if (wordCount > 1000) bonus += 5;
    
    const total = Math.min(results.reduce((acc, r) => acc + r.score, 0) + bonus, 100);
    return { score: total, details: results };
}
```

3. **`identifyPrdGaps` melhorado:**

Usar os `details` do score para mostrar gaps precisos:

```
## Gaps Identificados
- ❌ Personas e JTBD: Seção não encontrada (0/15 pontos)
- ⚠️ Métricas de Sucesso: Seção encontrada mas conteúdo insuficiente (5/10 pontos)
- ✅ Problema e Oportunidade: Completo (15/15 pontos)
```

**Critério de aceite:**
- [ ] Score calculado por seções estruturadas com conteúdo mínimo
- [ ] PRD com seções vazias ou ausentes recebe score baixo
- [ ] PRD completo recebe score >= 70
- [ ] Gaps identificados com precisão (seção + motivo + pontos perdidos)
- [ ] Retrocompatível com PRDs existentes

---

### Sprint 7: Testes End-to-End

**Verifica:** NP1-NP10  
**Esforço:** ~2-3 horas  

**Testes:**

| # | Cenário | Verifica | Critério |
|---|---------|----------|----------|
| T1 | Ativação do especialista | NP6, NP8 | Output contém esqueleto do template PRD |
| T2 | Perguntas em linguagem simples | NP9 | Nenhum termo técnico sem explicação |
| T3 | Usuário diz "crie dados para X" | NP1 | IA reformula perguntas, não inventa dados |
| T4 | Campo "riscos_principais" enviado | NP2, NP3 | Mapeado para "riscos", sem pergunta duplicada |
| T5 | Todos campos coletados → geração | NP4, NP5 | IA gera PRD automaticamente sem stall |
| T6 | PRD enviado com status=generating | NP7 | Transição para validating, score calculado |
| T7 | PRD com score >= 70 | NP7, NP10 | Aprovado automaticamente, avança fase |
| T8 | PRD com score < 70 | NP10 | Gaps mostrados com seções específicas |
| T9 | Fluxo completo setup → aprovação | Todos | Completa em <= 5 interações do usuário |
| T10 | Backward compatibility | — | Projetos com discoveryBlocks funcionam |

---

## 3. Ordem de Execução e Dependências

```
Sprint 1 (Bug fix generating→validating)     ← PRIORIDADE MÁXIMA, ~30 min
  ↓
Sprint 5 (Fuzzy field matching)               ← Independente, ~1h
  ↓
Sprint 2 (Injeção resources desde ativação)   ← Depende de Sprint 1
  ↓
Sprint 3 (Especialista para não-técnicos)     ← Pode paralelo com Sprint 2
  ↓
Sprint 4 (Eliminar stall points)              ← Depende de Sprint 1 e 2
  ↓
Sprint 6 (Validação estruturada)              ← Depende de Sprint 1
  ↓
Sprint 7 (Testes E2E)                         ← Depende de todas
```

**Paralelismo possível:**
- Sprint 1 + Sprint 5 (independentes entre si)
- Sprint 2 + Sprint 3 (arquivos diferentes)
- Sprint 4 + Sprint 6 (arquivos diferentes)

**Tempo total estimado:** ~12-15 horas de implementação

---

## 4. Resumo de Impacto por Arquivo

| Arquivo | Sprints | Mudanças |
|---------|---------|----------|
| `src/src/handlers/specialist-phase-handler.ts` | 1, 2, 3, 4, 5, 6 | Bug fix transição; injeção na collecting; perguntas simples; blocos temáticos; aliases; validação estruturada |
| `src/src/tools/iniciar-projeto.ts` | 2, 3 | Injetar esqueleto template na ativação; perguntas simples |
| `src/src/services/skill-loader.service.ts` | 2 | Novo método `loadCollectingPackage` |
| `src/src/services/onboarding.service.ts` | 3 | Campos iniciais alinhados com template |
| `content/skills/specialist-gestao-produto/SKILL.md` | 3 | Seção de perguntas adaptadas para não-técnicos |
| `src/src/handlers/shared-prompt-handler.ts` | 3, 4 | Regras de auto-continuidade no prompt |

---

## 5. Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| IA ainda inventa dados apesar das instruções (NP1) | Alta | Alto | Enforcement em 3 camadas: instrução no output + prompt anti-inferência + exemplos que NÃO são respostas |
| Collecting package muito grande (>1500 tokens) | Média | Médio | Usar esqueleto (headings) do template, não conteúdo completo; medir tokens antes de injetar |
| Fuzzy matching mapeia campo errado | Baixa | Médio | Aliases explícitos (whitelist), não fuzzy genérico; log de mapeamentos para debug |
| IA não segue instrução de auto-continuidade | Alta | Alto | Texto imperativo + formatação visual (🤖 AÇÃO AUTOMÁTICA) + next_action com auto_execute |
| Validação estruturada reprova PRDs válidos | Média | Médio | Threshold conservador (content >= 50 chars); bonus por wordcount total; debug logs |
| Backward compat com projetos legacy | Baixa | Alto | Detectar specialistPhase vs discoveryBlocks; manter handlers legacy |

---

## 6. Métricas de Sucesso

| Métrica | Antes (v2) | Meta (v3) |
|---------|-----------|-----------|
| Fluxo completo sem erro | 0% (morreu em generating) | 100% |
| PRD gerado com template na 1ª tentativa | 0% (só na 2ª) | 100% |
| Transições sem stall | 40% (3 stalls) | 100% |
| Perguntas duplicadas | 1 (riscos) | 0 |
| Interações usuário até PRD aprovado | ∞ (nunca aprovou) | ≤ 5 |
| Score de validação calculado | 0% (nunca chegou) | 100% |
| IA inventa dados | 1x (sistema de checklist) | 0 |
| Template disponível na coleta | Não | Sim |
| Campos fuzzy matched | 0% | 100% |

---

## 7. Mapa de Cobertura: Problema → Sprint → Teste

| Problema | Sprint | Teste |
|----------|--------|-------|
| NP1 (IA cria dados) | 3 | T3 |
| NP2 (campo inconsistente) | 5 | T4 |
| NP3 (pergunta duplicada) | 5 | T4 |
| NP4 (stall points) | 4 | T5, T9 |
| NP5 (campos vs template gap) | 3 | T5 |
| NP6 (template não injetado na coleta) | 2 | T1, T5 |
| NP7 (loop generating) | 1 | T6, T7 |
| NP8 (resources não consumidos) | 2 | T1 |
| NP9 (perguntas técnicas) | 3 | T2 |
| NP10 (validação superficial) | 6 | T7, T8 |

---

**Versão:** 3.0  
**Autor:** Cascade + Usuário  
**Última atualização:** 2026-02-10  
**Base:** Análise de `docs/analysis/ANALISE_RESOLVER_V2.md` — 10 problemas, 7 sprints
