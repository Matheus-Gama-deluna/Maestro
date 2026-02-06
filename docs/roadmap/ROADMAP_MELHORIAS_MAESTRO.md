# Roadmap de Evolução do Maestro MCP

**Data:** 06/02/2026  
**Autor:** Especialista em MCP, Engenharia de Software e Desenvolvimento com IA  
**Complemento de:** [ANALISE_ESTADO_ATUAL_MAESTRO.md](../analysis/ANALISE_ESTADO_ATUAL_MAESTRO.md)

---

## 1. Arquitetura-Alvo

### 1.1 Visão: De Toolkit Passivo para Orquestrador Ativo

```
HOJE (Toolkit Passivo):
  IA decide → IA chama tool → Maestro retorna texto → IA interpreta → IA decide próximo

ALVO (Orquestrador Ativo):
  Usuário fala → IA chama maestro → Maestro retorna contrato + next_action → IA executa
```

O objetivo é inverter o lócus de controle: o **Maestro** decide o fluxo, a IA é o executor.

### 1.2 Arquitetura-Alvo

```
┌─────────────────────────────────────────────────────────────┐
│                     IDE (Windsurf/Cursor/AG)                │
│                          ↕ MCP Protocol                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Unified Transport Layer                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  STDIO   │  │   HTTP   │  │   SSE    │          │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │   │
│  │       └──────────────┼──────────────┘                │   │
│  │                      ↓                               │   │
│  │           ┌──────────────────┐                       │   │
│  │           │   Tool Router    │  ← Um único lugar     │   │
│  │           │   (Zod validated) │                       │   │
│  │           └────────┬─────────┘                       │   │
│  └────────────────────┼─────────────────────────────────┘   │
│                       ↓                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Orchestration Engine                     │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │ State Machine │  │ Flow Registry │                │    │
│  │  │ (phases,      │  │ (workflows    │                │    │
│  │  │  transitions) │  │  codificados) │                │    │
│  │  └──────┬───────┘  └──────┬───────┘                 │    │
│  │         └────────┬────────┘                          │    │
│  │                  ↓                                    │    │
│  │  ┌──────────────────────────────────┐               │    │
│  │  │     Response Builder             │               │    │
│  │  │  - Structured next_action        │               │    │
│  │  │  - Specialist persona            │               │    │
│  │  │  - Files to persist              │               │    │
│  │  │  - State delta (not full state)  │               │    │
│  │  └──────────────────────────────────┘               │    │
│  └──────────────────────────────────────────────────────┘    │
│                       ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Domain Services                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │Discovery │ │Brainstorm│ │   PRD    │             │   │
│  │  │ Service  │ │ Service  │ │ Service  │             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │  Gate    │ │Knowledge │ │Checkpoint│             │   │
│  │  │ Service  │ │ Service  │ │ Service  │             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  └──────────────────────────────────────────────────────┘   │
│                       ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Persistence Layer                            │   │
│  │  - File-based state (filesystem direto)              │   │
│  │  - Config global (~/.maestro/)                       │   │
│  │  - Project state (.maestro/)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Content Library (374 skills, workflows)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Princípios da Nova Arquitetura

1. **Single Router** - Um único ponto de roteamento de tools para todos os transports
2. **Contrato Estruturado** - Todo retorno segue `MaestroResponse` com `next_action`, `specialist_persona`, `files`, `state_patch`
3. **State Machine** - Transições de fase são codificadas, não textuais
4. **Persistence Ativa** - O MCP grava no filesystem diretamente (não depende da IA)
5. **Menos Tools, Mais Inteligência** - Consolidar 30+ tools em 5-8 tools bem definidas
6. **Zod Everywhere** - Validação real de inputs com erros amigáveis

---

## 2. Plano de Evolução em 4 Marcos

### Marco 0: Estabilização (Fundação)
**Objetivo:** Corrigir bugs e dívida técnica antes de qualquer feature nova  
**Duração estimada:** 1-2 dias  
**Risco se ignorado:** Alto - Features novas sobre base instável propagam bugs

### Marco 1: Orquestração Real (Core)
**Objetivo:** Fazer o Maestro controlar o fluxo ao invés da IA  
**Duração estimada:** 3-5 dias  
**Impacto:** Transformacional - Resolve o problema principal

### Marco 2: Experiência do Desenvolvedor (UX)
**Objetivo:** Reduzir fricção, melhorar onboarding, smart defaults  
**Duração estimada:** 2-3 dias  
**Impacto:** Alto - Usuários conseguem usar sem documentação extensa

### Marco 3: Profissionalização (Qualidade)
**Objetivo:** Testes, CI/CD, documentação, versionamento  
**Duração estimada:** 2-3 dias  
**Impacto:** Médio-Alto - Sustentabilidade a longo prazo

---

## 3. Marco 0: Estabilização (Fundação)

### 3.1 Criar Tool Router Centralizado

**Arquivo novo:** `src/src/router.ts`

Objetivo: Um único local que roteia chamadas de tools e valida argumentos com Zod.

```typescript
// Conceito do router centralizado
import { z } from 'zod';

// Registry de tools com schema Zod real
const toolRegistry = new Map<string, ToolDefinition>();

export function registerTool(def: ToolDefinition) {
  toolRegistry.set(def.name, def);
}

export async function routeToolCall(
  name: string, 
  rawArgs: Record<string, unknown>
): Promise<MaestroResponse> {
  const tool = toolRegistry.get(name);
  if (!tool) throw new ToolNotFoundError(name);
  
  // Validação Zod real (não type cast)
  const args = tool.schema.parse(rawArgs);
  
  // Execução
  return await tool.handler(args);
}

// Exportar lista de tools para ListTools
export function getToolDefinitions() {
  return Array.from(toolRegistry.values()).map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.schema),
  }));
}
```

**Benefício:** Ambos entry points (`stdio.ts` e `index.ts`) chamam `routeToolCall()`. Fim da divergência.

### 3.2 Corrigir Parâmetros Não Repassados

**Antes:**
```typescript
// index.ts - só repassa 3 de 10+ parâmetros
case "iniciar_projeto":
    return await iniciarProjeto({
        nome: typedArgs?.nome as string,
        descricao: typedArgs?.descricao as string | undefined,
        diretorio: typedArgs?.diretorio as string,
    });
```

**Depois:** Com router centralizado, isso desaparece. O router usa o schema Zod para extrair automaticamente todos os parâmetros definidos.

### 3.3 Extrair Duplicações

- `criarEstadoOnboardingInicial()` → mover para `services/onboarding.service.ts`
- Lógica de serialização/persistência → mover para `services/state.service.ts`
- Inferência de tipo/complexidade → mover para `services/classification.service.ts`

### 3.4 Persistir Estado Intermediário

Todo handler que modifica estado deve retornar `estado_atualizado` e `files[]`:

```typescript
// Em handleProximoBloco, SEMPRE retornar estado:
return {
  content: [{ type: "text", text: resposta }],
  files: [{
    path: `${diretorio}/.maestro/estado.json`,
    content: estadoFile.content,
  }],
  estado_atualizado: estadoFile.content,
};
```

### 3.5 Remover Código Morto

- O `createMcpServer()` em `server.ts` é criado no `index.ts` mas nunca conectado a transport
- O `TOOLS_AS_RESOURCES` no `index.ts` reimpleta funcionalidade que deveria estar no router
- O `getToolDocumentation()` é uma implementação ad-hoc que deveria ser resource padronizado

**Checklist Marco 0:**
- [ ] Criar `router.ts` com registry Zod
- [ ] Migrar `stdio.ts` para usar router
- [ ] Migrar `index.ts` para usar router
- [ ] Extrair duplicações para services/
- [ ] Corrigir persistência em handlers intermediários
- [ ] Remover código morto
- [ ] Unificar versões (package.json root + src)
- [ ] Verificar todos os testes existentes passam

---

## 4. Marco 1: Orquestração Real (Core)

### 4.1 Definir Contrato de Resposta Estruturado

**Arquivo:** `src/src/types/response.ts` (já existe, expandir)

```typescript
/**
 * Contrato padrão para TODA resposta do Maestro.
 * Qualquer modelo de IA que suporte MCP consegue interpretar.
 */
export interface MaestroResponse {
  content: Array<{ type: "text"; text: string }>;
  
  /** Instrução programática do próximo passo */
  next_action?: {
    tool: string;
    description: string;
    args_template: Record<string, unknown>;
    requires_user_input: boolean;
    user_prompt?: string;
    auto_execute?: boolean;  // Se true, IA pode executar sem perguntar
  };
  
  /** Persona que a IA deve assumir */
  specialist_persona?: {
    name: string;
    tone: string;
    expertise: string[];
    instructions: string;
  };
  
  /** Arquivos para persistir (filesystem) */
  files?: Array<{
    path: string;
    content: string;
    action: 'create' | 'update' | 'append';
  }>;
  
  /** Patch de estado (não estado completo) */
  state_patch?: Record<string, unknown>;
  
  /** Estado completo atualizado (fallback stateless) */
  estado_atualizado?: string;
  
  /** Metadados de progresso */
  progress?: {
    current_phase: string;
    total_phases: number;
    completed_phases: number;
    percentage: number;
  };
  
  isError?: boolean;
}
```

### 4.2 Implementar State Machine de Fluxo

Codificar os workflows que hoje são markdown em máquinas de estado:

```typescript
// services/flow-engine.ts
interface FlowState {
  phase: string;
  step: string;
  data: Record<string, unknown>;
}

interface FlowTransition {
  from: string;
  to: string;
  condition?: (state: FlowState) => boolean;
  action?: (state: FlowState) => FlowState;
}

const ONBOARDING_FLOW: FlowTransition[] = [
  { from: 'init',               to: 'setup',             condition: s => !hasGlobalConfig() },
  { from: 'init',               to: 'discovery_block_1', condition: s => hasGlobalConfig() },
  { from: 'setup',              to: 'discovery_block_1' },
  { from: 'discovery_block_1',  to: 'discovery_block_2' },
  { from: 'discovery_block_2',  to: 'discovery_block_3' },
  { from: 'discovery_block_3',  to: 'brainstorm_offer',  condition: s => s.data.mode !== 'economy' },
  { from: 'discovery_block_3',  to: 'prd_generation',    condition: s => s.data.mode === 'economy' },
  { from: 'brainstorm_offer',   to: 'brainstorm_s1',     condition: s => s.data.wants_brainstorm },
  { from: 'brainstorm_offer',   to: 'prd_generation',    condition: s => !s.data.wants_brainstorm },
  // ... brainstorm sections ...
  { from: 'brainstorm_s5',      to: 'prd_generation' },
  { from: 'prd_generation',     to: 'prd_validation' },
  { from: 'prd_validation',     to: 'phase_1',           condition: s => s.data.prd_score >= 70 },
  { from: 'prd_validation',     to: 'prd_refinement',    condition: s => s.data.prd_score < 70 },
  { from: 'phase_1',            to: 'phase_2' },
  // ... N fases baseadas no modo ...
];
```

**Benefício:** O flow engine determina automaticamente o próximo passo. A IA não precisa saber a sequência.

### 4.3 Consolidar Tools (De 30+ para 8)

Proposta de surface area reduzida:

| Tool | Descrição | Substitui |
|------|-----------|-----------|
| `maestro` | Entry point principal - detecta contexto, retorna próximo passo | iniciar_projeto, confirmar_projeto, setup_inicial, onboarding_orchestrator, brainstorm, prd_writer, next_steps_dashboard |
| `avancar` | Submete entregável/respostas e avança | proximo, discovery (com respostas), brainstorm (proximo_secao) |
| `status` | Status do projeto | status, discovery (status), brainstorm (status) |
| `validar` | Valida gate ou entregável | validar_gate, avaliar_entregavel |
| `contexto` | Contexto do projeto + knowledge base | contexto, get_context, search_knowledge |
| `salvar` | Salva artefatos | salvar, record_adr, record_pattern |
| `checkpoint` | Cria/restaura checkpoints | create_checkpoint, rollback_total, rollback_partial, list_checkpoints |
| `analisar` | Análise de código | analisar_seguranca, analisar_qualidade, analisar_performance, validate_dependencies, validate_security, check_compliance |

**O mais importante é o `maestro`:**

```typescript
// A tool principal que a IA chama para "tudo"
async function maestro(args: { 
  diretorio: string; 
  input?: string;      // Texto livre do usuário (se houver)
  respostas?: Record<string, any>;  // Respostas de formulário
}): Promise<MaestroResponse> {
  
  // 1. Detectar estado atual do projeto
  const estado = await loadProjectState(args.diretorio);
  
  // 2. Se não existe projeto, iniciar onboarding
  if (!estado) return startNewProject(args);
  
  // 3. Obter fase atual do flow engine
  const flowState = getFlowState(estado);
  
  // 4. Se há respostas, processar e avançar
  if (args.respostas) {
    return processResponses(flowState, args.respostas);
  }
  
  // 5. Retornar próximo passo com next_action
  return getNextStep(flowState);
}
```

### 4.4 Persistência Ativa (O MCP Grava Direto)

Ao invés de retornar `files[]` e esperar que a IA salve, o MCP grava diretamente:

```typescript
// Dentro do handler, GRAVAR no filesystem:
await writeFile(
  join(diretorio, '.maestro/estado.json'), 
  JSON.stringify(novoEstado, null, 2)
);

// Retornar confirmação ao invés de instrução:
return {
  content: [{ type: "text", text: "Estado salvo automaticamente." }],
  // Ainda retorna files[] como fallback para IDEs que preferem controlar
  files: [{ path: '...', content: '...', action: 'update' }],
};
```

**Benefício:** Estado nunca se perde. A IA não precisa interpretar "AÇÃO OBRIGATÓRIA - Salvar Estado".

### 4.5 System Prompt Automático

Usar a capability `prompts` do MCP para injetar contexto automaticamente:

```typescript
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [{
    name: "maestro-system",
    description: "System instructions for Maestro orchestration",
    arguments: [{ name: "diretorio", required: true }],
  }],
}));

server.setRequestHandler(GetPromptRequestSchema, async (req) => {
  const estado = await loadProjectState(req.params.arguments?.diretorio);
  const fase = getFaseAtual(estado);
  const especialista = await lerEspecialista(fase.especialista);
  const template = await lerTemplate(fase.template);
  
  return {
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `${especialista}\n\n${template}\n\nFase atual: ${fase.nome}`
      }
    }]
  };
});
```

**Checklist Marco 1:**
- [ ] Definir e implementar `MaestroResponse` completo
- [ ] Implementar Flow Engine com state machine
- [ ] Consolidar tools (meta: 8 tools)
- [ ] Implementar tool `maestro` como entry point inteligente
- [ ] Implementar persistência ativa (gravar no filesystem)
- [ ] Adicionar `next_action` em todos os retornos
- [ ] Implementar prompts MCP para system prompt automático
- [ ] Migrar workflows markdown para flow definitions

---

## 5. Marco 2: Experiência do Desenvolvedor (UX)

### 5.1 Perguntas em Blocos Inteligentes

Implementar o que o plano de refatoração propõe, mas com melhorias:

```typescript
// Ao invés de blocos fixos, blocos adaptativos:
function gerarProximoBloco(estado: FlowState): DiscoveryBlock {
  const config = loadUserConfig();
  const bloco = getNextBlock(estado);
  
  // Smart defaults baseados no config global
  if (config?.preferencias_stack) {
    bloco.fields.forEach(f => {
      if (f.id === 'stack_preferida' && config.preferencias_stack) {
        f.default = formatStack(config.preferencias_stack);
        f.hint = 'Baseado nas suas preferências salvas';
      }
    });
  }
  
  // Reduzir perguntas baseado no que já sabemos
  if (estado.data.descricao_livre) {
    const extraido = extrairContextoDeTextoLivre(estado.data.descricao_livre);
    bloco.fields.forEach(f => {
      if (extraido[f.id]) {
        f.default = extraido[f.id];
        f.hint = 'Extraído da sua descrição';
      }
    });
  }
  
  return bloco;
}
```

### 5.2 Modo "Conversa Livre"

Permitir que o usuário descreva o projeto em texto natural:

```
Usuário: "Quero criar um app de controle financeiro para autônomos"
          ↓
Maestro: extrai problema, público, plataforma
         retorna resumo + campos restantes para confirmar
          ↓
Usuário: confirma/ajusta
          ↓
Maestro: cria projeto com discovery pré-preenchido
```

Isso elimina a necessidade de formulários formais para quem já sabe o que quer.

### 5.3 Templates de Projeto

Oferecer templates pré-configurados para projetos comuns:

```typescript
const PROJECT_TEMPLATES = {
  'saas-b2b': {
    tipo_artefato: 'product',
    nivel_complexidade: 'medio',
    discovery_defaults: {
      plataformas: ['Web'],
      seguranca_compliance: ['LGPD'],
      // ... defaults realistas
    }
  },
  'api-microservices': { ... },
  'mobile-app': { ... },
  'landing-page': { ... },
  'dashboard-admin': { ... },
  'ecommerce': { ... },
};
```

### 5.4 Resumo Executivo entre Fases

Após cada bloco/fase, retornar resumo compacto para confirmação:

```
✅ Entendi:
- Problema: Controle financeiro para autônomos sem organização
- Público: Profissionais liberais 25-45 anos
- MVP: Dashboard + Categorização automática + Relatórios
- Stack: React + Node.js (das suas preferências)

Está correto? Se sim, vamos para detalhes técnicos.
```

### 5.5 Confidence Score nas Inferências

Quando o Maestro infere algo, ser transparente:

```typescript
interface Inferencia {
  valor: string;
  confianca: number;       // 0-100
  razao: string;
  dados_usados: string[];
  precisa_confirmacao: boolean;  // confianca < 70
}
```

**Checklist Marco 2:**
- [ ] Implementar smart defaults baseados no config global
- [ ] Implementar modo conversa livre (NLP para extract)
- [ ] Criar 6 templates de projeto
- [ ] Implementar resumos executivos entre blocos
- [ ] Adicionar confidence score nas inferências
- [ ] Reduzir fluxo de onboarding para máximo 3 interações
- [ ] Implementar brainstorm antes de discovery (Caminho B)

---

## 6. Marco 3: Profissionalização (Qualidade)

### 6.1 Testes

Cobertura mínima de 80% para:
- Router (todos os tools roteiam corretamente)
- Flow Engine (transições de estado corretas)
- Response Builder (contratos estruturados válidos)
- Services (discovery, brainstorm, PRD, gates)
- Persistência (leitura/gravação de estado)

```typescript
// Exemplo de teste para o flow engine:
describe('FlowEngine', () => {
  it('deve avançar de discovery para brainstorm quando modo quality', () => {
    const state = createFlowState({ mode: 'quality', phase: 'discovery_complete' });
    const next = engine.getNextPhase(state);
    expect(next.phase).toBe('brainstorm_offer');
  });
  
  it('deve pular brainstorm em modo economy', () => {
    const state = createFlowState({ mode: 'economy', phase: 'discovery_complete' });
    const next = engine.getNextPhase(state);
    expect(next.phase).toBe('prd_generation');
  });
});
```

### 6.2 CI/CD

Já existem workflows em `.github/workflows/` para publish. Adicionar:
- `test.yml` - Roda testes em cada PR
- `typecheck.yml` - Verifica tipos TypeScript
- `lint.yml` - ESLint com regras do projeto

### 6.3 Versionamento Coerente

- Unificar versão entre `package.json` raiz e `src/package.json`
- Banners de servidor devem ler versão do package.json
- Changelog atualizado por Marco

### 6.4 Documentação de API

Gerar documentação automática das tools:
- Schema de cada tool (gerado do Zod)
- Exemplos de request/response
- Fluxo de sequência (gerado do flow engine)

### 6.5 Error Handling Estruturado

```typescript
// Hierarquia de erros ao invés de strings genéricas:
class MaestroError extends Error {
  constructor(
    message: string,
    public code: string,
    public recovery?: {
      tool: string;
      args: Record<string, unknown>;
      description: string;
    }
  ) {
    super(message);
  }
}

class ValidationError extends MaestroError { ... }
class StateError extends MaestroError { ... }
class FlowError extends MaestroError { ... }
```

Quando um erro tem `recovery`, a IA sabe exatamente como corrigi-lo.

**Checklist Marco 3:**
- [ ] Escrever testes para router (100% coverage)
- [ ] Escrever testes para flow engine (100% coverage)
- [ ] Escrever testes para services (80%+ coverage)
- [ ] Configurar CI com GitHub Actions
- [ ] Unificar versionamento
- [ ] Gerar documentação de API automática
- [ ] Implementar error handling estruturado
- [ ] Atualizar README com nova arquitetura

---

## 7. Detalhamento Técnico de Implementações-Chave

### 7.1 Router Centralizado com Zod (Marco 0)

```typescript
// src/src/router.ts
import { z, ZodSchema } from 'zod';

interface ToolDefinition<T = any> {
  name: string;
  description: string;
  schema: ZodSchema<T>;
  handler: (args: T) => Promise<MaestroResponse>;
}

class ToolRouter {
  private tools = new Map<string, ToolDefinition>();

  register<T>(def: ToolDefinition<T>) {
    this.tools.set(def.name, def);
  }

  async call(name: string, rawArgs: unknown): Promise<MaestroResponse> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Tool não encontrada: ${name}` }],
        isError: true,
      };
    }

    // Validação real com Zod
    const result = tool.schema.safeParse(rawArgs);
    if (!result.success) {
      const errors = result.error.issues
        .map(i => `- ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      return {
        content: [{ type: "text", text: `Parâmetros inválidos:\n${errors}` }],
        isError: true,
      };
    }

    return await tool.handler(result.data);
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: this.zodToJsonSchema(t.schema),
    }));
  }

  private zodToJsonSchema(schema: ZodSchema): object {
    // Conversão Zod → JSON Schema para MCP ListTools
    // Existem libs para isso (zod-to-json-schema)
  }
}

export const router = new ToolRouter();
```

**Uso nos entry points:**

```typescript
// stdio.ts - simplificado
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: router.listTools(),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  return router.call(req.params.name, req.params.arguments);
});

// index.ts - simplificado
async function callTool(name: string, args?: Record<string, unknown>) {
  return router.call(name, args || {});
}

async function getToolsList() {
  return { tools: router.listTools() };
}
```

### 7.2 next_action em Retornos (Marco 1)

Toda tool deve incluir `next_action` no retorno. Exemplo para `confirmar_projeto`:

```typescript
return {
  content: [{ type: "text", text: "Projeto criado com sucesso." }],
  files: [...],
  estado_atualizado: estadoFile.content,
  // NOVO: Instrução programática
  next_action: {
    tool: "avancar",
    description: "Responder o primeiro bloco de discovery",
    args_template: {
      diretorio: args.diretorio,
      respostas: {} // IA preenche com respostas do usuário
    },
    requires_user_input: true,
    user_prompt: blocoFormatado, // O bloco de perguntas formatado
  },
  specialist_persona: {
    name: "Product Discovery Specialist",
    tone: "Consultivo e focado em validação",
    expertise: ["product discovery", "user research", "MVP definition"],
    instructions: "Faça perguntas de follow-up quando respostas forem vagas. Sugira alternativas quando o escopo parecer muito grande.",
  },
  progress: {
    current_phase: "discovery",
    total_phases: 4,  // setup, discovery, brainstorm, prd
    completed_phases: 1,
    percentage: 25,
  },
};
```

### 7.3 Persistência Ativa (Marco 1)

```typescript
// services/state.service.ts
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

export class StateService {
  constructor(private diretorio: string) {}

  private get statePath() {
    return join(this.diretorio, '.maestro', 'estado.json');
  }

  async load(): Promise<EstadoProjeto | null> {
    try {
      const raw = await readFile(this.statePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async save(estado: EstadoProjeto): Promise<void> {
    await mkdir(join(this.diretorio, '.maestro'), { recursive: true });
    estado.atualizado_em = new Date().toISOString();
    await writeFile(this.statePath, JSON.stringify(estado, null, 2));
  }

  async patch(delta: Partial<EstadoProjeto>): Promise<EstadoProjeto> {
    const current = await this.load();
    if (!current) throw new StateError('Projeto não encontrado');
    const updated = { ...current, ...delta };
    await this.save(updated);
    return updated;
  }
}
```

---

## 8. Abordagem de Migração

### Estratégia: Strangler Fig Pattern

Não reescrever tudo de uma vez. Envolver o código existente com a nova arquitetura:

1. **Marco 0**: Criar router que **chama as tools existentes** sem modificá-las
2. **Marco 1**: Adicionar `next_action` nos retornos **das tools existentes**, criar flow engine **ao lado** delas
3. **Marco 2**: Criar nova tool `maestro` que **usa o flow engine**, tools antigas continuam funcionando
4. **Marco 3**: Depreciar tools antigas gradualmente

A cada passo, o sistema funciona. Nenhum big-bang de migração.

### Retrocompatibilidade

- Tools existentes continuam funcionando com mesmos nomes e parâmetros
- Novos campos são opcionais (next_action, specialist_persona, etc.)
- `estado_json` como parâmetro continua aceito mesmo com persistência ativa
- IDEs que já usam o Maestro não quebram

---

## 9. Métricas de Sucesso

### Indicadores Quantitativos

| Métrica | Hoje | Marco 0 | Marco 1 | Marco 2 | Marco 3 |
|---------|------|---------|---------|---------|---------|
| **Tools expostas** | 30+ | 30 (mesmas) | 8 | 8 | 8 |
| **Entry points divergentes** | 2 | 1 router | 1 | 1 | 1 |
| **Prompts até PRD** | 10-15 | 10-15 | 5-7 | 2-3 | 2-3 |
| **Test coverage** | ~5% | ~20% | ~50% | ~60% | ~80% |
| **Modelos que funcionam bem** | 2-3 | 2-3 | 5+ | 8+ | 10+ |
| **Tempo onboarding** | 30min+ | 30min | 15min | 5-10min | 5min |

### Indicadores Qualitativos

- **Marco 0**: "O sistema não tem bugs conhecidos no fluxo principal"
- **Marco 1**: "A IA sabe o que fazer sem ler instruções textuais"
- **Marco 2**: "Um desenvolvedor sem documentação consegue usar o Maestro em 5 min"
- **Marco 3**: "O Maestro tem qualidade profissional para ser usado em times"

---

## 10. Riscos do Plano

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Regressão durante migração | Alta | Alto | Testes primeiro (Marco 0), strangler fig |
| Over-engineering do flow engine | Média | Médio | Começar com subset mínimo de transições |
| Consolidação de tools quebra IDEs | Média | Alto | Aliases para nomes antigos, depreciação gradual |
| Persistência ativa conflita com IDE | Baixa | Alto | Manter `files[]` como fallback, detectar ambiente |
| Escopo cresce demais | Alta | Alto | Cada marco é independente e entrega valor |

---

## 11. Priorização Final e Sequência de Implementação

### Prioridade Absoluta (Fazer AGORA)

1. **Router centralizado** - Elimina toda a classe de bugs de divergência
2. **Persistência em handlers intermediários** - Elimina perda de dados
3. **next_action em retornos** - Primeiro passo para independência de modelo

### Prioridade Alta (Fazer na Sequência)

4. **Flow engine básico** - Codifica o fluxo de onboarding
5. **Tool `maestro` como entry point** - Simplifica surface area
6. **Persistência ativa** - Remove dependência da IA salvar

### Prioridade Média (Quando os Fundamentos Estiverem Sólidos)

7. **Smart defaults e modo conversa livre**
8. **Templates de projeto**
9. **Testes abrangentes**
10. **CI/CD e documentação**

### Prioridade Baixa (Refinamento)

11. **Confidence score**
12. **Specialist persona**
13. **Error handling estruturado**
14. **Métricas de uso**

---

## 12. Conclusão

O Maestro tem **o melhor acervo de conteúdo** que já vi em um MCP de orquestração de desenvolvimento. 374 skills, 62 especialistas, workflows detalhados - isso levou muito tempo e expertise para criar e é um ativo valioso.

O que falta é a **engenharia de software na camada de entrega**. O MCP precisa evoluir de um switch/case manual com retornos textuais para um sistema com:

1. **Router centralizado** (elimina bugs estruturais)
2. **Respostas estruturadas** (independência de modelo)
3. **Flow engine** (orquestração real)
4. **Persistência ativa** (confiabilidade)

Com esses 4 pilares, o Maestro se torna o que promete: um **orquestrador profissional de desenvolvimento com IA** que funciona com qualquer modelo, em qualquer IDE, para qualquer projeto.

A boa notícia: o caminho está claro, os fundamentos existem, e a migração pode ser feita incrementalmente sem quebrar o que já funciona.

---

*Documento complementar: [ANALISE_ESTADO_ATUAL_MAESTRO.md](../analysis/ANALISE_ESTADO_ATUAL_MAESTRO.md)*
