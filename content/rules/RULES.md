# MCP Maestro Development Kit v3 — AI Rules

> Guia para a IA interagir com o sistema MCP Maestro.
> Conteúdo universal para todas as IDEs (Cursor, Windsurf, Antigravity/Gemini, Copilot).

---

## 🚨 PROTOCOLO OBRIGATÓRIO (START HERE)

### 1. Detectar Contexto MCP

**Antes de QUALQUER ação:**
- ✅ Existe `.maestro/estado.json`? → **Modo MCP Maestro ativo**
- ❌ Não existe? → Seguir fluxo padrão

### 2. Princípio Stateless

```
❌ ERRADO: Assumir estado prévio em memória
✅ CORRETO: Estado SEMPRE lido de .maestro/estado.json
```

**Protocolo:**
1. Ler `.maestro/estado.json` antes de qualquer tool MCP
2. Passar `estado_json` como argumento em TODOS os tools
3. Passar `diretorio` (caminho absoluto) em TODOS os tools
4. NUNCA confiar em memória de conversação

### 3. Qualidade Adaptativa

| Tipo Projeto | Gate Tier | Rigor | Exemplo |
|--------------|-----------|-------|---------|
| POC | Essencial | Funciona? | Spike técnico |
| Script | Essencial | Funciona? | Automação |
| Internal | Base | Padrão indústria | Dashboard |
| Product | Base/Avançado | Estado da arte | SaaS, Fintech |

---

## ⚡ 5 TOOLS PÚBLICAS

> **IMPORTANTE**: Use APENAS estas 5 tools. Tools legadas (v4) ainda funcionam mas emitem deprecation warnings e serão removidas.

### 1. `maestro` — Entry Point Inteligente 🎯

**Quando usar**: Iniciar projeto, ver status, criar projeto

```typescript
// Ver status do projeto (sem ação = auto-detecta)
maestro({ diretorio: "/path/to/project" })

// Criar novo projeto
maestro({
  diretorio: "/path/to/project",
  acao: "criar_projeto",
  respostas: { nome: "MeuProjeto", descricao: "Sistema de..." }
})

// Setup inicial (IDE, modo)
maestro({
  diretorio: "/path/to/project",
  acao: "setup_inicial",
  respostas: { ide: "vscode", modo: "balanced" }
})
```

**Substitui**: `iniciar_projeto`, `confirmar_projeto`, `status`, `carregar_projeto`, `setup_inicial`

---

### 2. `executar` — Ações no Projeto ⚡

**Quando usar**: Avançar fase, salvar, checkpoints

```typescript
// Avançar fase com entregável
executar({
  diretorio: "/path/to/project",
  acao: "avancar",        // padrão se omitido
  entregavel: "<conteúdo completo do entregável>"
})

// Avançar onboarding com respostas
executar({
  diretorio: "/path/to/project",
  acao: "avancar",
  respostas: { nome_produto: "MeuApp", problema: "..." }
})

// Salvar rascunho sem avançar
executar({
  diretorio: "/path/to/project",
  acao: "salvar",
  conteudo: "...",
  tipo: "rascunho"        // "rascunho" | "anexo" | "entregavel"
})

// Checkpoint
executar({
  diretorio: "/path/to/project",
  acao: "checkpoint",
  checkpoint_acao: "criar",  // "criar" | "rollback" | "listar"
  reason: "Antes de refatorar"
})
```

**Substitui**: `proximo`, `avancar`, `salvar`, `checkpoint`

---

### 3. `validar` — Validações ✅

**Quando usar**: Validar gate, qualidade, compliance

```typescript
// Validar gate da fase atual (auto-detecta tipo)
validar({ diretorio: "/path/to/project" })

// Validar entregável específico
validar({
  diretorio: "/path/to/project",
  tipo: "entregavel",
  entregavel: "<conteúdo>"
})

// Verificar compliance
validar({
  diretorio: "/path/to/project",
  tipo: "compliance",
  standard: "LGPD",
  code: "<código para verificar>"
})
```

**Substitui**: `validar_gate`, `avaliar_entregavel`, `check_compliance`

---

### 4. `analisar` — Análises de Código 🔍

**Quando usar**: Segurança, qualidade, performance, relatórios

```typescript
// Relatório completo (padrão)
analisar({ diretorio: "/path/to/project" })

// Análise específica
analisar({
  diretorio: "/path/to/project",
  tipo: "seguranca",       // "seguranca" | "qualidade" | "performance" | "dependencias" | "completo"
  code: "<código>"
})
```

**Substitui**: `analisar_seguranca`, `analisar_qualidade`, `analisar_performance`, `gerar_relatorio`

---

### 5. `contexto` — Contexto Acumulado 🧠

**Quando usar**: Obter resumo do projeto, decisões, padrões

```typescript
contexto({ diretorio: "/path/to/project" })
// → Retorna: Stack, modelo, arquitetura, ADRs, gates validados
```

**Substitui**: `get_context`

---

### Tools Exclusivas do Usuário

```typescript
// ⚠️ NUNCA chame automaticamente — apenas quando o USUÁRIO solicitar
aprovar_gate({ acao: "aprovar", estado_json: "...", diretorio: "..." })
```

### Tools de Fluxos Alternativos

```typescript
nova_feature({ descricao: "...", impacto_estimado: "medio" })
corrigir_bug({ descricao: "...", severidade: "alta" })
refatorar({ area: "...", motivo: "..." })
```

---

## 📥 REQUEST CLASSIFIER

**Classificar o request do usuário ANTES de agir:**

| Request | Trigger Keywords | Tool | Ação |
|---------|-----------------|------|------|
| **Novo projeto** | "criar projeto", "iniciar", "novo sistema" | `maestro` | `acao: "criar_projeto"` |
| **Avançar** | "próximo", "terminei", "avançar", "pronto" | `executar` | `acao: "avancar"` |
| **Status** | "status", "onde estou", "fase atual" | `maestro` | sem ação |
| **Validar** | "validar", "posso avançar?", "checklist" | `validar` | auto-detecta |
| **Salvar** | "salvar rascunho", "salvar anexo" | `executar` | `acao: "salvar"` |
| **Contexto** | "contexto", "resumo", "o que temos" | `contexto` | — |
| **Nova feature** | "nova funcionalidade", "adicionar" | `nova_feature` | — |
| **Bug fix** | "corrigir bug", "resolver erro" | `corrigir_bug` | — |
| **Refatorar** | "refatorar", "reestruturar" | `refatorar` | — |

---

## 🤖 SKILLS E ESPECIALISTAS

### Carregamento Automático

**Ao iniciar cada fase**, o MCP carrega o especialista correto automaticamente.
A IA DEVE **ler e aplicar** a skill correspondente.

**Protocolo:**
```
1. Ler estado.json → obter fase_atual + skill_name
2. Localizar skill no diretório de skills da IDE (ver tabela abaixo)
3. Ler SKILL.md para persona + instruções
4. Consultar resources/templates/ para template do entregável
5. Consultar resources/checklists/ para critérios de validação
```

### 📁 Diretórios por IDE

| IDE | Skills | Workflows | Rules File |
|-----|--------|-----------|------------|
| **Antigravity/Gemini** | `.agent/skills/` | `.agent/workflows/` | `.gemini/GEMINI.md` |
| **Cursor** | `.cursor/skills/` | `.cursor/commands/` | `.cursorrules` |
| **Windsurf** | `.windsurf/skills/` | `.windsurf/workflows/` | `.windsurfrules` |
| **Copilot** | `.agent/skills/` | `.agent/workflows/` | `.github/copilot-instructions.md` |

> 💡 Use o diretório correto da sua IDE ao referenciar skills e workflows.

### Estrutura de uma Skill

```
{skills_dir}/specialist-gestao-produto/
├── SKILL.md                    # Persona + instruções (LER PRIMEIRO)
├── README.md                   # Documentação completa
├── MCP_INTEGRATION.md          # Funções MCP disponíveis
└── resources/
    ├── templates/PRD.md        # Template do entregável
    ├── checklists/             # Critérios de validação
    ├── examples/               # Exemplos reais
    └── reference/              # Guias de referência
```

### 🔧 Resources MCP (Consulta via API)

> 💡 **Priorize skills locais** (diretório de skills da IDE). Use resources MCP como consulta complementar.

```
maestro://especialista/{nome}     # Persona do especialista
maestro://template/{nome}         # Template de documento
maestro://guia/{nome}             # Guia prático
maestro://prompt/{area}/{nome}    # Prompts avançados
maestro://system-prompt           # System prompt do Maestro
```

**Para consultar**: use `read_resource("maestro://especialista/gestao-produto")`

### Mapeamento Fase → Skill

**Fluxo Simples (7 fases)**:
1. Produto → `specialist-gestao-produto`
2. Requisitos → `specialist-engenharia-requisitos-ia`
3. UX Design → `specialist-ux-design`
4. Arquitetura → `specialist-arquitetura-software`
5. Backlog → `specialist-plano-execucao-ia`
6. Frontend → `specialist-desenvolvimento-frontend`
7. Backend → `specialist-desenvolvimento-backend`

**Fluxo Médio (13 fases)** insere:
- Modelo de Domínio → `specialist-modelagem-dominio`
- Banco de Dados → `specialist-banco-dados`
- Segurança → `specialist-seguranca-informacao`
- Testes → `specialist-analise-testes`
- Contrato API → `specialist-contrato-api`
- Integração → `specialist-devops-infra`

**Fluxo Complexo (17 fases)** adiciona:
- Arquitetura Avançada → `specialist-arquitetura-avancada`
- Performance → `specialist-performance-escalabilidade`
- Observabilidade → `specialist-observabilidade`

**Stitch (Opcional)** — Inserida após UX Design:
- Prototipagem → `specialist-prototipagem-stitch`

### Especialistas Complementares

Disponíveis sob demanda, fora do fluxo de fases:
- `specialist-dados-analytics-ia` — Dados e Analytics
- `specialist-acessibilidade` — Acessibilidade
- `specialist-debugging-troubleshooting` — Debugging
- `specialist-documentacao-tecnica` — Documentação
- `specialist-exploracao-codebase` — Análise de código existente
- `specialist-migracao-modernizacao` — Modernização de legado

### Regra de Ouro: Persona → Princípios → Template

```
❌ ERRADO: Ler especialista → Gerar conteúdo genérico
✅ CORRETO: Ler SKILL.md → Entender PRINCÍPIOS → Aplicar PERSONA → Usar TEMPLATE → Gerar
```

**Antes de gerar qualquer entregável, validar internamente:**
1. Qual é o OBJETIVO desta fase?
2. Que PRINCÍPIOS o especialista aplica?
3. Que TEMPLATE usar?
4. Como isso DIFERE de output genérico?

---

## 🏗️ FLUXO DO PROJETO

### Classificação Automática (após PRD)

```
Usuário: "próximo" (após PRD)
  ↓
MCP analisa PRD automaticamente
  ↓
MCP sugere: "Detectei 14 pontos → Nível MÉDIO (13 fases)"
  ↓
IA pergunta: "Confirmar classificação ou ajustar?"
  ↓
Usuário confirma
  ↓
MCP confirma e carrega Fase 2
```

| Nível | Fases | Quando |
|-------|-------|--------|
| Simples | 7 | POC, MVP, < 2 semanas |
| Médio | 13 | SaaS simples, 1-3 meses |
| Complexo | 17 | Multi-tenant, fintech, 3+ meses |

### Stitch (Opcional)

Quando o projeto tem UI/UX crítico:
```
Produto → Requisitos → UX Design → **Stitch** → Modelo → ...
```

### Frontend-First Protocol

**Regra obrigatória para features com Frontend + Backend:**

```
1. CONT-001 (Contrato API) ← SEMPRE primeiro
   ├── openapi.yaml
   ├── types para FE/BE
   └── Mock Server

2. FE + BE em paralelo (contra mocks)

3. INT-001 (Integração) ← DEPOIS de FE + BE prontos
```

- ❌ NUNCA iniciar FE/BE sem contrato API validado
- ❌ NUNCA conectar FE com BE real sem ambos concluídos

---

## 🛑 GATES ADAPTATIVOS

### Tiers de Rigor

| Tier | Quando | O que valida |
|------|--------|-------------|
| **Essencial** | POC, Script | Funciona? |
| **Base** | Internal, Product | Padrão indústria |
| **Avançado** | Product complexo | Estado da arte |

### Protocolo de Gates

```
executar({ acao: "avancar", entregavel: "..." })
  ↓
Validação automática (score 0-100)
  ↓
≥ 70  → Avança ✅
< 70  → BLOQUEADO 🔴 (mostra pendências)
```

**Quando bloqueado:**
1. Mostrar itens pendentes ao usuário
2. Sugerir correções baseadas no checklist
3. **AGUARDAR** aprovação explícita
4. ❌ NUNCA chamar `aprovar_gate` automaticamente

**Aprovação manual** (apenas quando o USUÁRIO solicitar):
```typescript
aprovar_gate({ acao: "aprovar", estado_json: "...", diretorio: "..." })
```

### Limite de Retries

Após **3 tentativas** de validação sem atingir score mínimo:
- Apresentar opções ao usuário (aprovar, editar, ou re-tentar)
- ❌ NUNCA ficar em loop infinito de validação

---

## 🌐 REGRAS UNIVERSAIS

### Idioma
- **Respostas**: Sempre em português do Brasil
- **Código**: Variáveis, funções e comentários em inglês
- **Documentação**: Português (PRD, requisitos) ou inglês (código)

### Estrutura de Arquivos do Projeto

```
projeto/
├── .maestro/
│   ├── estado.json           # ⭐ FONTE DA VERDADE
│   ├── resumo.json           # Cache de contexto
│   ├── entregaveis/          # Drafts salvos
│   └── rascunhos/            # Salvamentos temporários
├── {skills_dir}/             # Skills locais (varia por IDE)
│   ├── specialist-gestao-produto/
│   ├── specialist-engenharia-requisitos-ia/
│   └── ...
├── docs/
│   ├── 01-produto/PRD.md
│   ├── 02-requisitos/requisitos.md
│   ├── 03-ux/design-doc.md
│   └── ...
└── src/
```

### Dados do Usuário

```
❌ ERRADO: Inventar dados, métricas ou números
✅ CORRETO: Perguntar ao usuário e usar respostas REAIS
```

Se o usuário pedir "invente" ou "crie dados":
→ Responder: "Preciso que VOCÊ me conte. Seus dados reais geram um resultado muito melhor."
→ Oferecer exemplos para inspirar, mas NÃO usar como resposta

---

## 🎓 EXEMPLOS

### Exemplo 1: Iniciar Projeto

```markdown
User: "Quero criar um sistema de gestão de pedidos para restaurante"

AI:
🎯 Vou iniciar o projeto MCP Maestro.

[chama maestro({ acao: "criar_projeto", respostas: { nome: "RestaurantePro", descricao: "..." } })]

🎯 **Projeto Iniciado**
📁 Diretório: ./RestaurantePro
📋 Fase 1: Produto
🤖 Especialista: Gestão de Produto

Como Product Manager, preciso entender:
1. Qual problema específico estamos resolvendo?
2. Quem são os usuários principais?
3. Quais funcionalidades do MVP?
```

### Exemplo 2: Avançar Fase

```markdown
User: "Pronto, terminei o PRD"

AI: [lê estado.json]
[chama executar({ acao: "avancar", entregavel: "<PRD completo>" })]

✅ **PRD Salvo**: docs/01-produto/PRD.md

📊 **Classificação**: 14 pontos → Nível MÉDIO (13 fases)
Confirmar classificação?

User: "Sim"
[chama confirmar_classificacao(...)]

🎯 **Fase 2: Requisitos**
🤖 Especialista: Engenharia de Requisitos
```

### Exemplo 3: Gate Bloqueado

```markdown
User: "Próximo"

AI: [chama executar({ acao: "avancar", entregavel: "..." })]

🔴 **Gate Bloqueado** (Score: 60/100)

✅ Requisitos funcionais com IDs
✅ Requisitos não-funcionais

❌ Critérios de aceite em Gherkin
❌ Matriz de rastreabilidade

Deseja corrigir ou aprovar mesmo assim?
```

---

## 🔧 TROUBLESHOOTING

| Problema | Causa | Solução |
|----------|-------|---------|
| Tool retorna erro | Faltou `estado_json` | Ler `.maestro/estado.json` primeiro |
| Especialista errado | Não verificou `fase_atual` | Checar estado.json antes de carregar |
| Gate sempre falhando | Entregável vazio ou mal formatado | Salvar como arquivo + validar `docs/{fase}/` |
| Score PRD 15/100 | Newlines escapados de JSON | MCP normaliza automaticamente |
| Loop infinito | Retry sem limite | Limite de 3 retries |

---

## 📋 QUICK REFERENCE

### Comando → Tool

| Usuário diz | Tool | Args |
|-------------|------|------|
| "criar projeto" | `maestro` | `acao: "criar_projeto"` |
| "próximo" / "avançar" | `executar` | `acao: "avancar"` |
| "status" | `maestro` | — |
| "validar" | `validar` | — |
| "salvar" | `executar` | `acao: "salvar"` |
| "contexto" | `contexto` | — |
| "analisar" | `analisar` | — |

### Parâmetro Obrigatório

```typescript
// Em TODAS as tools, SEMPRE passar:
{ diretorio: "/caminho/absoluto/do/projeto" }
```

O `estado_json` é opcional (carrega automaticamente), mas recomendado para performance.
