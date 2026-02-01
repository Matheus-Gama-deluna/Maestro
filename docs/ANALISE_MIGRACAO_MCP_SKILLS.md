# 📊 Análise: Migração MCP para Sistema de Skills Modernas

**Data:** 01/02/2026  
**Versão:** 1.0  
**Objetivo:** Adaptar o MCP Server para utilizar o novo sistema de Skills v2.0

---

## 🎯 Contexto da Migração

### Status Atual da Migração de Templates → Skills

Conforme documentado em `RELATORIO_AUDITORIA_TEMPLATES.md` e `STATUS_IMPLEMENTACAO_TEMPLATES.md`:

**Progresso Geral:** 92% (23/25 especialistas)

| Fase | Status | Especialistas |
|------|--------|---------------|
| **Fase 1 - Críticos** | ✅ 100% (8/8) | Produto, Requisitos, UX, Domínio, BD, Arquitetura, Segurança, Testes |
| **Fase 2 - Principais** | ✅ 100% (9/9) | Plano Execução, API, Frontend, Backend, DevOps, Dados, Acessibilidade, Debug, Docs |
| **Fase 3 - Complementares** | ✅ 100% (5/5) | Stitch, Codebase, Mobile, Migração, Mobile Design |
| **Fase 4 - Avançados** | 🟡 33% (1/3) | ✅ Arquitetura Avançada, 🟡 Performance, 🟡 Observabilidade |

### Padrão Modern Skills v2.0 Estabelecido

Cada especialista migrado possui a seguinte estrutura:

```
specialist-{nome}/
├── SKILL.md                    # Descrição da skill (puramente descritivo)
├── README.md                   # Documentação completa (~300 linhas)
├── MCP_INTEGRATION.md          # Guia de integração MCP (~400 linhas)
├── resources/
│   ├── templates/              # Templates estruturados (4 arquivos, ~1000 linhas)
│   ├── examples/               # Exemplos práticos (~400 linhas)
│   ├── checklists/             # Validação automatizada (~300 linhas)
│   └── reference/              # Guias de referência (~600 linhas)
└── mcp_functions/              # Referência de funções MCP (~200 linhas)
```

**Total por especialista:** ~3200 linhas de conteúdo técnico

---

## 🏗️ Arquitetura Atual do MCP

### Estrutura de Diretórios

```
src/src/
├── index.ts                    # Servidor HTTP + SSE + JSON-RPC (681 linhas)
├── server.ts                   # Criação do MCP Server (786 bytes)
├── stdio.ts                    # Transport STDIO (17495 bytes)
├── resources/
│   └── index.ts                # Registro de resources MCP (198 linhas)
├── tools/
│   ├── iniciar-projeto.ts      # Tool de inicialização
│   ├── proximo.ts              # Tool de avanço de fase
│   ├── status.ts               # Tool de status
│   ├── validar-gate.ts         # Tool de validação
│   ├── aprovar-gate.ts         # Tool de aprovação
│   ├── classificar.ts          # Tool de classificação
│   ├── confirmar-classificacao.ts
│   ├── contexto.ts             # Tool de contexto
│   ├── salvar.ts               # Tool de persistência
│   └── ... (17 tools no total)
├── utils/
│   ├── files.ts                # Utilitários de arquivos (276 linhas)
│   ├── prompt-mapper.ts        # Mapeamento fase → prompts (206 linhas)
│   ├── content-injector.ts     # Injeção de conteúdo
│   ├── local-content.ts        # Conteúdo local
│   └── ... (8 utilitários)
├── analyzers/                  # Analisadores (5 arquivos)
├── flows/                      # Fluxos (3 arquivos)
├── gates/                      # Gates de qualidade (4 arquivos)
├── state/                      # Gerenciamento de estado (3 arquivos)
└── types/                      # Tipos TypeScript (3 arquivos)
```

### Sistema de Resources Atual

O MCP atualmente expõe resources via URIs:

```typescript
// Especialistas
maestro://especialista/{nome}

// Templates
maestro://template/{nome}

// Guias
maestro://guia/{nome}

// Prompts
maestro://prompt/{categoria}/{nome}

// Exemplos
maestro://exemplo/{nome}

// System Prompt
maestro://system-prompt
```

**Implementação:** `src/resources/index.ts`

```typescript
export function registerResources(server: Server) {
    // Lista resources disponíveis
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        const especialistas = await listarEspecialistas();
        const templates = await listarTemplates();
        const guias = await listarGuias();
        const exemplos = await listarExemplos();
        
        return { resources: [...] };
    });
    
    // Lê resource específico
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        
        if (uri.startsWith("maestro://especialista/")) {
            const nome = decodeURIComponent(uri.replace("maestro://especialista/", ""));
            const conteudo = await lerEspecialista(nome);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }
        // ... outros tipos
    });
}
```

### Sistema de Arquivos Atual

**Implementação:** `src/utils/files.ts`

```typescript
// Diretório raiz de conteúdo (servidor)
const SERVER_CONTENT_ROOT = join(__dirname, "..", "..", "..", "content");

// Funções de leitura
async function lerEspecialista(nome: string): Promise<string>
async function lerTemplate(nome: string): Promise<string>
async function lerPrompt(categoria: string, nome: string): Promise<string>
async function lerGuia(nome: string): Promise<string>
async function lerExemplo(nome: string): Promise<string>

// Funções de listagem
async function listarEspecialistas(): Promise<string[]>
async function listarTemplates(): Promise<string[]>
async function listarGuias(): Promise<string[]>
async function listarExemplos(): Promise<string[]>
```

**Estrutura de conteúdo esperada:**

```
content/
├── especialistas/              # Arquivos .md dos especialistas
├── templates/                  # Arquivos .md dos templates
├── guias/                      # Arquivos .md dos guias
├── prompts/                    # Diretórios por categoria
│   ├── produto/
│   ├── requisitos/
│   ├── arquitetura/
│   └── ...
└── exemplos/                   # Exemplos de fluxo completo
```

### Sistema de Prompt Mapping

**Implementação:** `src/utils/prompt-mapper.ts`

Mapeia fases para prompts relacionados:

```typescript
const FASE_PROMPTS_MAP: Record<string, PromptRef[]> = {
    "Produto": [
        { categoria: "produto", nome: "prd-completo" },
        { categoria: "produto", nome: "north-star" }
    ],
    "Requisitos": [
        { categoria: "requisitos", nome: "analise-requisitos" },
        { categoria: "requisitos", nome: "gherkin" }
    ],
    // ... outras fases
};
```

**Funções:**
- `getPromptsParaFase(faseNome: string): PromptRef[]`
- `gerarSecaoPrompts(faseNome: string): string`
- `detectarStack(nome?: string, descricao?: string): string | null`
- `getExemploParaStack(stack?: string | null): string | null`

---

## 🔄 Nova Arquitetura: Skills v2.0

### Estrutura de Skills

Cada skill agora está em `content/skills/specialist-{nome}/`:

```
specialist-arquitetura-avancada/
├── SKILL.md                    # Descrição da skill (puramente descritivo)
├── README.md                   # Documentação completa
├── MCP_INTEGRATION.md          # Guia de integração MCP
├── resources/
│   ├── templates/
│   │   ├── bounded-context.md
│   │   ├── cqrs-implementation.md
│   │   ├── event-sourcing.md
│   │   └── microservices-strategy.md
│   ├── examples/
│   │   └── architecture-examples.md
│   ├── checklists/
│   │   └── architecture-validation.md
│   └── reference/
│       └── architecture-guide.md
└── mcp_functions/
    └── README.md               # Referência de funções (não executável)
```

### Princípios das Skills v2.0

1. **Skills Descritivas:** Apenas informações e processos, sem código executável
2. **MCP Executa:** Toda lógica de automação é implementada no MCP
3. **Zero Scripts Locais:** Nenhum código executável nas skills
4. **Validação Automatizada:** Quality gates executados pelo MCP
5. **Progressive Disclosure:** Carregamento sob demanda de recursos

### Estrutura do MCP_INTEGRATION.md

Cada especialista define suas funções MCP:

```markdown
## 🔧 Funções MCP Disponíveis

### 1. `init_bounded_context`
**Quando usar:** Ao identificar um novo bounded context
**Input esperado:** { context_name, responsibility, aggregates, events }
**Output gerado:** Estrutura de diretórios e documentação
**Validações automáticas:** Nome, responsabilidade, linguagem ubíqua

### 2. `validate_ddd_model`
**Quando usar:** Após criar/atualizar modelo de domínio
**Validações executadas:**
- Strategic Design (40 pontos)
- Tactical Design (40 pontos)
- Quality Attributes (20 pontos)

## 📊 Quality Gates Automatizados

### Gate 1: DDD Model Validation
**Executado por:** `validate_ddd_model`
**Threshold:** 85 pontos
**Bloqueante:** Sim
```

---

## 🎯 Gap Analysis: O que precisa ser adaptado

### 1. Sistema de Resources

**Atual:**
```
maestro://especialista/{nome}        → Lê arquivo .md único
maestro://template/{nome}            → Lê arquivo .md único
maestro://guia/{nome}                → Lê arquivo .md único
```

**Necessário:**
```
maestro://skill/{nome}/SKILL.md                     → Descrição da skill
maestro://skill/{nome}/README.md                    → Documentação completa
maestro://skill/{nome}/MCP_INTEGRATION.md           → Guia MCP
maestro://skill/{nome}/resources/templates/{template}
maestro://skill/{nome}/resources/examples/{example}
maestro://skill/{nome}/resources/checklists/{checklist}
maestro://skill/{nome}/resources/reference/{guide}
maestro://skill/{nome}/mcp_functions/README.md
```

### 2. Sistema de Arquivos

**Atual:**
```typescript
// Estrutura flat
content/
├── especialistas/
├── templates/
├── guias/
└── prompts/
```

**Necessário:**
```typescript
// Estrutura hierárquica por skill
content/skills/
├── specialist-gestao-produto/
│   ├── SKILL.md
│   ├── README.md
│   ├── MCP_INTEGRATION.md
│   └── resources/
├── specialist-requisitos/
│   ├── SKILL.md
│   ├── README.md
│   ├── MCP_INTEGRATION.md
│   └── resources/
└── ...
```

### 3. Funções de Leitura

**Atual:**
```typescript
lerEspecialista(nome: string): Promise<string>
lerTemplate(nome: string): Promise<string>
lerGuia(nome: string): Promise<string>
```

**Necessário:**
```typescript
// Leitura de skills
lerSkill(nome: string, arquivo: 'SKILL.md' | 'README.md' | 'MCP_INTEGRATION.md'): Promise<string>

// Leitura de resources
lerSkillTemplate(skillNome: string, templateNome: string): Promise<string>
lerSkillExample(skillNome: string, exampleNome: string): Promise<string>
lerSkillChecklist(skillNome: string, checklistNome: string): Promise<string>
lerSkillReference(skillNome: string, guideNome: string): Promise<string>

// Listagem
listarSkills(): Promise<string[]>
listarSkillTemplates(skillNome: string): Promise<string[]>
listarSkillExamples(skillNome: string): Promise<string[]>
listarSkillChecklists(skillNome: string): Promise<string[]>
listarSkillReferences(skillNome: string): Promise<string[]>
```

### 4. Prompt Mapper

**Atual:** Mapeia fases para prompts em `prompts/{categoria}/{nome}.md`

**Necessário:** 
- Manter compatibilidade com prompts standalone
- Adicionar suporte para prompts dentro de skills
- Mapear fases para skills completas (não apenas prompts)

### 5. Funções MCP

**Atual:** Funções MCP estão implementadas em `src/tools/`

**Necessário:**
- Adicionar novas funções descritas em `MCP_INTEGRATION.md` de cada skill
- Implementar validações automáticas
- Implementar quality gates automatizados
- Exemplos: `init_bounded_context`, `validate_ddd_model`, `generate_cqrs_structure`

### 6. System Prompt

**Atual:** System prompt genérico em `resources/index.ts`

**Necessário:**
- Atualizar para referenciar skills ao invés de especialistas
- Adicionar instruções sobre progressive disclosure
- Incluir referências aos novos URIs de resources

---

## 📋 Plano de Implementação

### Fase 1: Adaptação do Sistema de Arquivos

**Objetivo:** Suportar leitura da nova estrutura de skills

**Tarefas:**
1. ✅ Criar função `lerSkill()` para ler arquivos principais
2. ✅ Criar funções `lerSkillTemplate()`, `lerSkillExample()`, etc.
3. ✅ Criar funções de listagem para resources de skills
4. ✅ Manter compatibilidade com estrutura antiga (fallback)
5. ✅ Atualizar `getServerContentDir()` para incluir `skills/`

**Arquivos afetados:**
- `src/utils/files.ts`

### Fase 2: Adaptação do Sistema de Resources

**Objetivo:** Expor skills via MCP resources

**Tarefas:**
1. ✅ Adicionar URIs para skills: `maestro://skill/{nome}/{arquivo}`
2. ✅ Adicionar URIs para resources: `maestro://skill/{nome}/resources/{tipo}/{arquivo}`
3. ✅ Atualizar `ListResourcesRequestSchema` handler
4. ✅ Atualizar `ReadResourceRequestSchema` handler
5. ✅ Implementar progressive disclosure (listar apenas principais, carregar sob demanda)

**Arquivos afetados:**
- `src/resources/index.ts`

### Fase 3: Atualização do Prompt Mapper

**Objetivo:** Mapear fases para skills completas

**Tarefas:**
1. ✅ Criar mapeamento fase → skill
2. ✅ Atualizar `getPromptsParaFase()` para incluir skills
3. ✅ Criar `getSkillParaFase(faseNome: string): string | null`
4. ✅ Atualizar `gerarSecaoPrompts()` para incluir referências a skills

**Arquivos afetados:**
- `src/utils/prompt-mapper.ts`

### Fase 4: Implementação de Funções MCP

**Objetivo:** Implementar funções descritas em MCP_INTEGRATION.md

**Tarefas:**
1. ✅ Criar `src/tools/skills/` para funções de skills
2. ✅ Implementar funções de Arquitetura Avançada:
   - `init_bounded_context`
   - `validate_ddd_model`
   - `generate_cqrs_structure`
   - `validate_event_sourcing`
3. ✅ Implementar validações automáticas
4. ✅ Implementar quality gates automatizados
5. ✅ Adicionar schemas JSON para validação

**Arquivos afetados:**
- `src/tools/skills/` (novo)
- `src/tools/index.ts` (registro)

### Fase 5: Atualização do System Prompt

**Objetivo:** Atualizar instruções para IA

**Tarefas:**
1. ✅ Atualizar `gerarSystemPrompt()` em `resources/index.ts`
2. ✅ Adicionar instruções sobre skills
3. ✅ Adicionar instruções sobre progressive disclosure
4. ✅ Atualizar exemplos de URIs

**Arquivos afetados:**
- `src/resources/index.ts`

### Fase 6: Migração de Tools Existentes

**Objetivo:** Adaptar tools existentes para usar skills

**Tarefas:**
1. ✅ Atualizar `iniciar-projeto.ts` para referenciar skills
2. ✅ Atualizar `proximo.ts` para carregar skill da fase atual
3. ✅ Atualizar `status.ts` para mostrar skill atual
4. ✅ Atualizar `validar-gate.ts` para usar checklists de skills
5. ✅ Atualizar `contexto.ts` para incluir skills carregadas

**Arquivos afetados:**
- `src/tools/iniciar-projeto.ts`
- `src/tools/proximo.ts`
- `src/tools/status.ts`
- `src/tools/validar-gate.ts`
- `src/tools/contexto.ts`

### Fase 7: Testes e Validação

**Objetivo:** Garantir que tudo funciona corretamente

**Tarefas:**
1. ✅ Testar leitura de skills
2. ✅ Testar listagem de resources
3. ✅ Testar progressive disclosure
4. ✅ Testar funções MCP novas
5. ✅ Testar compatibilidade com estrutura antiga
6. ✅ Testar integração com Gemini/Antigravity

**Arquivos afetados:**
- Todos os arquivos modificados

---

## 🎯 Prioridades

### Alta Prioridade (Essencial)
1. **Fase 1:** Adaptação do Sistema de Arquivos
2. **Fase 2:** Adaptação do Sistema de Resources
3. **Fase 6:** Migração de Tools Existentes

### Média Prioridade (Importante)
4. **Fase 3:** Atualização do Prompt Mapper
5. **Fase 5:** Atualização do System Prompt

### Baixa Prioridade (Incremental)
6. **Fase 4:** Implementação de Funções MCP (pode ser feito por skill)
7. **Fase 7:** Testes e Validação (contínuo)

---

## 📊 Métricas de Sucesso

### Técnicas
- ✅ 100% das skills acessíveis via MCP resources
- ✅ Progressive disclosure implementado
- ✅ Compatibilidade com estrutura antiga mantida
- ✅ Tempo de resposta < 100ms para leitura de skills
- ✅ Zero breaking changes para usuários existentes

### Funcionais
- ✅ IA consegue carregar skills automaticamente
- ✅ IA consegue acessar templates sob demanda
- ✅ IA consegue executar funções MCP de skills
- ✅ Quality gates automatizados funcionando
- ✅ Validações automáticas executando

---

## 🚀 Próximos Passos

1. **Revisar este documento** com o usuário
2. **Priorizar fases** de implementação
3. **Iniciar Fase 1:** Adaptação do Sistema de Arquivos
4. **Implementar incrementalmente** seguindo as fases
5. **Testar continuamente** durante implementação

---

**Documento criado:** 01/02/2026  
**Responsável:** Antigravity AI  
**Status:** 📋 Aguardando aprovação para iniciar implementação
