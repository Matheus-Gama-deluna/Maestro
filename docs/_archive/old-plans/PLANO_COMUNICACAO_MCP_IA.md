# Plano de Aperfeiçoamento da Comunicação MCP ↔ IA

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Proposta Técnica

---

## 1. Diagnóstico do Problema Atual

### 1.1 Causas Raiz Identificadas

| Problema | Impacto | Frequência |
|----------|---------|------------|
| IA interpreta `input` livre ao invés de usar `respostas` estruturado | Falha na execução de comandos | Alta |
| Instruções para IA misturadas com conteúdo para usuário | Confusão de papéis | Alta |
| Schema de parâmetros não explícito nas respostas | IA "adivinha" parâmetros | Média |
| Falta de confirmação de entendimento | Loop de repetições | Média |
| `next_action` não utilizado pela IA | Orquestração falha | Alta |

### 1.2 Fluxo Problemático Atual

```
Usuário: "inicie um projeto com o maestro"
        ↓
IA → MCP: maestro({ diretorio: "/path" })
        ↓
MCP: "Nenhum projeto encontrado. 🤖 [Para a IA] Configurar preferências..."
        ↓
IA → MCP: maestro({ acao: "setup_inicial" })  ← ❌ Sem parâmetros!
        ↓
MCP: "Setup Inicial Necessário. Informe ide, modo, usar_stitch..."
        ↓
IA → MCP: maestro({ acao: "setup_inicial", input: "setup_inicial({...})" })  ← ❌ input não parseado!
        ↓
MCP: [Loop infinito]
```

---

## 2. Estratégias de Comunicação Propostas

### 2.1 Protocolo de Mensagens Estratificado (PME)

Separação clara entre camadas de comunicação:

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO (Visível ao Usuário)               │
│  - Markdown formatado                                       │
│  - Status, progresso, resultados                           │
│  - NUNCA contém instruções técnicas                        │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE ORQUESTRAÇÃO (Visível à IA)                     │
│  - Annotations MCP (`audience: ["assistant"]`)            │
│  - JSON Schema explícito                                   │
│  - Instruções de execução                                  │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE CONTROLE (Metadados)                            │
│  - `next_action` estruturado                               │
│  - `requires_confirmation: true/false`                     │
│  - `expected_response_format`                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Sistema de Anotações MCP (Annotations)

Implementar separação via annotations nativas do MCP:

```typescript
// content block para USUÁRIO
{
  type: "text",
  text: "# ✅ Setup Concluído\n\nConfiguração salva!"
}

// content block para IA (annotation)
{
  type: "text",
  text: `## Instruções de Execução

PARÂMETROS ESPERADOS:
{
  "ide": string ("windsurf" | "cursor" | "antigravity"),
  "modo": string ("economy" | "balanced" | "quality"),
  "usar_stitch": boolean
}

PRÓXIMA AÇÃO: setup_inicial()
CONFIRMAÇÃO REQUERIDA: Sim`,
  annotations: {
    audience: ["assistant"],
    priority: "high"
  }
}
```

### 2.3 Schema Explícito em Todas as Respostas

Toda resposta que requer ação da IA deve incluir:

```typescript
interface IAInstructionBlock {
  type: "text";
  text: string;  // Markdown com schema
  annotations: {
    audience: ["assistant"];
    instruction_type: "action_required" | "information" | "confirmation";
  };
}

// Exemplo de texto:
`### 📋 Ação Requerida: setup_inicial

**Parâmetros Obrigatórios:**
\`\`\`json
{
  "ide": {
    "type": "string",
    "enum": ["windsurf", "cursor", "antigravity"],
    "description": "IDE preferida do usuário"
  },
  "modo": {
    "type": "string", 
    "enum": ["economy", "balanced", "quality"],
    "description": "Modo de operação"
  },
  "usar_stitch": {
    "type": "boolean",
    "description": "Usar Stitch para complexidade"
  }
}
\`\`\`

**Como executar:**
\`\`\`
setup_inicial({
  ide: "windsurf",
  modo: "balanced", 
  usar_stitch: false
})
\`\`\`

⚠️ **IMPORTANTE:** Não envie via campo 'input'. Use os parâmetros diretamente.`
```

---

## 3. Implementação Técnica

### 3.1 Novo Sistema de Instruções (ia-instruction.service.ts)

```typescript
// src/services/ia-instruction.service.ts

export interface IAInstruction {
  action: string;
  parameters: ParameterSchema[];
  example: string;
  constraints?: string[];
  nextStep?: string;
  requiresConfirmation?: boolean;
}

export interface ParameterSchema {
  name: string;
  type: "string" | "number" | "boolean" | "object";
  required: boolean;
  enum?: string[];
  description: string;
  default?: unknown;
}

export class IAInstructionService {
  
  static createInstruction(config: IAInstruction): ResponseBlock {
    const paramsTable = config.parameters.map(p => 
      `| ${p.name} | ${p.type}${p.enum ? `(${p.enum.join(", ")})` : ""} | ${p.required ? "✅" : "❓"} | ${p.description} |`
    ).join("\n");

    const text = `### 🤖 Instrução para IA: ${config.action}

**Parâmetros:**
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
${paramsTable}

**Exemplo de execução:**
\`\`\`
${config.example}
\`\`\`
${config.constraints ? `
**Restrições:**
${config.constraints.map(c => `- ${c}`).join("\n")}
` : ""}
${config.requiresConfirmation ? `
⚠️ **REQUER CONFIRMAÇÃO:** Aguarde confirmação do usuário antes de executar.
` : ""}`;

    return {
      type: "text",
      text,
      annotations: {
        audience: ["assistant"],
        priority: config.requiresConfirmation ? "high" : "normal",
        category: "instruction"
      }
    };
  }

  static createConfirmationPrompt(action: string, params: Record<string, unknown>): ResponseBlock {
    return {
      type: "text", 
      text: `### ✅ Confirmação de Ação

A IA solicitou: **${action}**

Parâmetros:
\`\`\`json
${JSON.stringify(params, null, 2)}
\`\`\`

Confirma esta ação?`,
      annotations: {
        audience: ["user", "assistant"],
        category: "confirmation"
      }
    };
  }
}
```

### 3.2 Modificação do ResponseFormatter

```typescript
// src/utils/response-formatter.ts - Adições

export interface ToolResponseOptions {
  // ... campos existentes ...
  
  /** Instruções estruturadas para a IA */
  instrucoes_ia?: IAInstruction;
  
  /** Requer confirmação do usuário antes de executar */
  requer_confirmacao?: boolean;
  
  /** Preview dos parâmetros para confirmação */
  confirmacao_preview?: Record<string, unknown>;
}

// Modificar formatResponse para incluir bloco de instrução
export function formatResponse(opts: ToolResponseOptions): ResponseBlock[] {
  const blocks: ResponseBlock[] = [];
  
  // 1. Bloco para usuário (existente)
  // ...
  
  // 2. NOVO: Bloco de instrução para IA
  if (opts.instrucoes_ia) {
    blocks.push(
      IAInstructionService.createInstruction(opts.instrucoes_ia)
    );
  }
  
  // 3. NOVO: Bloco de confirmação (se necessário)
  if (opts.requer_confirmacao && opts.confirmacao_preview) {
    blocks.push(
      IAInstructionService.createConfirmationPrompt(
        opts.instrucoes_ia?.action || "ação",
        opts.confirmacao_preview
      )
    );
  }
  
  // ... resto do código
}
```

### 3.3 Modificação do Maestro Tool

```typescript
// src/tools/maestro-tool.ts - Handler aprimorado

async function handleNoProject(diretorio: string): Promise<ToolResult> {
  const hasConfig = existsSync(join(diretorio, ".maestro", "config.json"));

  if (!hasConfig) {
    return {
      content: formatResponse({
        titulo: "🎯 Maestro — Novo Projeto",
        resumo: "Nenhum projeto encontrado. É necessário configurar preferências primeiro.",
        
        // NOVO: Instrução explícita para a IA
        instrucoes_ia: {
          action: "setup_inicial",
          parameters: [
            { name: "ide", type: "string", required: true, enum: ["windsurf", "cursor", "antigravity"], description: "IDE preferida" },
            { name: "modo", type: "string", required: true, enum: ["economy", "balanced", "quality"], description: "Modo de operação" },
            { name: "usar_stitch", type: "boolean", required: true, description: "Usar Stitch" }
          ],
          example: `setup_inicial({
  ide: "windsurf",
  modo: "balanced",
  usar_stitch: false
})`,
          constraints: [
            "NÃO envie via campo 'input'",
            "Use os parâmetros DIRETAMENTE na tool call",
            "Aguarde o resultado antes do próximo passo"
          ],
          requiresConfirmation: true
        },
        
        requer_confirmacao: true,
        confirmacao_preview: { ide: "windsurf", modo: "balanced", usar_stitch: false }
      })
    };
  }
  
  // ...
}
```

---

## 4. Sistema de Diálogo Estruturado

### 4.1 Estados de Diálogo

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   INÍCIO     │────▶│ INSTRUÇÃO    │────▶│  EXECUÇÃO    │
│              │     │  ENVIADA     │     │  PENDENTE    │
└──────────────┘     └──────────────┘     └──────┬───────┘
       ▲                                          │
       │           ┌──────────────┐                │
       └───────────┤  CONCLUÍDO   │◀───────────────┘
                   │              │
                   └──────────────┘
```

### 4.2 Protocolo de Turnos

**Regra Fundamental:** Cada turno deve ter apenas UMA ação ativa.

```typescript
// Resposta do MCP inclui estado do diálogo
interface DialogState {
  turno: number;
  estado: "instrucao" | "aguardando_execucao" | "aguardando_confirmacao" | "concluido";
  acao_atual: string;
  proxima_acao?: string;
  historico: Array<{
    turno: number;
    acao: string;
    parametros: Record<string, unknown>;
    resultado: "sucesso" | "erro" | "pendente";
  }>;
}
```

---

## 5. Melhorias nas Tools Existentes

### 5.1 Tool `setup_inicial` - Refatoração

```typescript
// src/tools/setup-inicial.ts

export async function setupInicial(args: SetupInicialArgs): Promise<ToolResult> {
  const existente = await loadUserConfig();

  // Parâmetros incompletos
  if (!args.ide || !args.modo || args.usar_stitch === undefined) {
    return {
      content: formatResponse({
        titulo: "⚙️ Setup Inicial Necessário",
        resumo: existente 
          ? `Configuração detectada em ${getConfigPath()}. Envie novamente para atualizar.`
          : "Primeira configuração do Maestro. Informe os parâmetros obrigatórios.",
          
        instrucoes_ia: {
          action: "setup_inicial",
          parameters: [
            { name: "ide", type: "string", required: true, enum: ["windsurf", "cursor", "antigravity"], description: "IDE que você está usando" },
            { name: "modo", type: "string", required: true, enum: ["economy", "balanced", "quality"], description: "Modo de operação (balanced recomendado)" },
            { name: "usar_stitch", type: "boolean", required: true, description: "Usar Stitch para tarefas complexas" },
            { name: "preferencias_stack", type: "object", required: false, description: "Stack tecnológica preferida" }
          ],
          example: `setup_inicial({
  ide: "windsurf",
  modo: "balanced",
  usar_stitch: false,
  preferencias_stack: {
    frontend: "react",
    backend: "node",
    database: "postgres"
  }
})`,
          constraints: [
            "Todos os campos obrigatórios (ide, modo, usar_stitch) DEVEM ser preenchidos",
            "Use os valores exatos do enum",
            "NÃO use o campo 'input' - passe os parâmetros diretamente"
          ],
          requiresConfirmation: false
        },
        
        // Próximo passo explícito
        proximo_passo: {
          tool: "setup_inicial",
          descricao: "Configurar preferências globais do Maestro",
          args: "{ ide, modo, usar_stitch, preferencias_stack? }",
          requer_input_usuario: true,
          prompt_usuario: "Qual IDE você está usando? (windsurf/cursor/antigravity)"
        }
      })
    };
  }

  // Parâmetros completos - executar
  // ... resto da implementação
}
```

---

## 6. Documentação de Integração para IAs

### 6.1 Prompt de Sistema (System Prompt)

```markdown
# 🤖 Maestro MCP — Guia de Integração para IAs

## Sua Função
Você é um orquestrador de desenvolvimento. O MCP Maestro guia você através de 
fluxos estruturados de criação de software. Siga as instruções do Maestro 
precisamente.

## Regras Fundamentais

### 1. Separação de Conteúdo
- **Blocos sem annotation**: Conteúdo para mostrar ao usuário
- **Blocos com `audience: ["assistant"]`**: Instruções TÉCNICAS para você seguir
- **Blocos com `audience: ["user", "assistant"]`**: Requer interação com usuário

### 2. Execução de Comandos
```
❌ NUNCA faça:
   input: "setup_inicial({ ide: 'windsurf' })"

✅ SEMPRE faça:
   acao: "setup_inicial"
   respostas: { ide: "windsurf", modo: "balanced", usar_stitch: false }
   
   OU chame a tool diretamente:
   setup_inicial({ ide: "windsurf", modo: "balanced", usar_stitch: false })
```

### 3. Estados do Diálogo
- Quando receber `instruction_type: "action_required"`: Execute imediatamente
- Quando receber `instruction_type: "confirmation"`: Aguarde usuário
- Quando receber `instruction_type: "information"`: Apenas registre

### 4. Tratamento de Erros
- Se receber erro de parâmetros: Corrija e tente novamente
- Se receber "Nenhum projeto encontrado": Execute setup_inicial primeiro
- Se entrar em loop: Pare e solicite ajuda ao usuário

## Formato de Resposta Esperado

Toda resposta do Maestro contém:
1. **Título e resumo** (para o usuário)
2. **Instruções** (annotation audience=["assistant"])
3. **Próximo passo** (se houver)

Você DEVE:
1. Ler as instruções do bloco annotated
2. Executar a ação especificada
3. Aguardar a resposta antes do próximo passo

## Exemplos de Interação

### Exemplo 1: Setup Inicial
```
Usuário: "inicie um projeto"

IA → MCP: maestro({ diretorio: "/path" })

MCP: {
  user: "Nenhum projeto encontrado",
  assistant: "Execute setup_inicial com ide, modo, usar_stitch"
}

IA → MCP: setup_inicial({ ide: "windsurf", modo: "balanced", usar_stitch: false })

MCP: {
  user: "✅ Setup salvo!",
  assistant: "Próximo: iniciar_projeto com nome e diretorio"
}

IA → MCP: iniciar_projeto({ nome: "MeuApp", diretorio: "/path", ... })
```

### Exemplo 2: Erro de Parâmetros
```
IA → MCP: setup_inicial({})

MCP: {
  user: "Setup Inicial Necessário",
  assistant: "Parâmetros obrigatórios faltando: ide, modo, usar_stitch"
}

IA → MCP: setup_inicial({ ide: "windsurf", modo: "balanced", usar_stitch: false })
✅ Sucesso
```
```

### 6.2 Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│           MAESTRO MCP — QUICK REFERENCE            │
├─────────────────────────────────────────────────────┤
│ 📋 ESTRUTURA DE RESPOSTA                            │
│ • Bloco 1: Conteúdo para usuário (título/resumo)   │
│ • Bloco 2: Instruções para IA (annotated)          │
│ • Bloco 3: Próximo passo (se houver)               │
├─────────────────────────────────────────────────────┤
│ ⚡ AÇÕES IMEDIATAS                                  │
│ • instruction_type: "action_required" → Execute    │
│ • requiresConfirmation: false → Execute            │
│ • audience: ["assistant"] → Leia e siga            │
├─────────────────────────────────────────────────────┤
│ ⏸️ AÇÕES COM PAUSA                                  │
│ • instruction_type: "confirmation" → Aguarde user  │
│ • requer_input_usuario: true → Pergunte ao user    │
│ • audience: ["user", "assistant"] → Interaja       │
├─────────────────────────────────────────────────────┤
│ 🚨 ANTI-PATTERNS (NUNCA FAÇA)                       │
│ • Não envie comandos no campo 'input'            │
│ • Não ignore blocos annotated                      │
│ • Não execute múltiplas ações de uma vez          │
│ • Não assuma valores padrão não explícitos       │
└─────────────────────────────────────────────────────┘
```

---

## 7. Roadmap de Implementação

### Sprint 1: Fundamentos (Semana 1)
- [ ] Implementar `IAInstructionService`
- [ ] Criar annotations em todas as respostas
- [ ] Atualizar `formatResponse` para suportar instruções estruturadas
- [ ] Adicionar schema explícito em `setup_inicial`

### Sprint 2: Ferramentas Core (Semana 2)
- [ ] Refatorar `maestro-tool` com instruções claras
- [ ] Refatorar `iniciar-projeto` com confirmação
- [ ] Refatorar `avancar` e `executar` com schemas
- [ ] Implementar `requer_confirmacao` em ações críticas

### Sprint 3: Documentação (Semana 3)
- [ ] Criar system prompt de integração
- [ ] Criar quick reference card
- [ ] Documentar exemplos de interação
- [ ] Criar testes de integração MCP-IA

### Sprint 4: Validação (Semana 4)
- [ ] Testar com Windsurf
- [ ] Testar com Cursor
- [ ] Coletar feedback de fluxos reais
- [ ] Ajustar baseado em resultados

---

## 8. Métricas de Sucesso

| Métrica | Baseline | Target | Como Medir |
|---------|----------|--------|------------|
| Taxa de execução correta na 1ª tentativa | ~30% | >85% | Logs de interação |
| Loops de repetição por sessão | 4-5 | <1 | Contagem de tool calls |
| Tempo para completar setup inicial | ~5min | <1min | Timestamp nas sessões |
| Taxa de parâmetros corretos | ~40% | >95% | Análise de erros |
| Satisfação do usuário | N/A | >4/5 | Feedback pós-sessão |

---

## 9. Anexos

### A. Schema JSON das Instruções

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "IAInstruction",
  "type": "object",
  "required": ["action", "parameters", "example"],
  "properties": {
    "action": { "type": "string" },
    "parameters": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "type", "required", "description"],
        "properties": {
          "name": { "type": "string" },
          "type": { "enum": ["string", "number", "boolean", "object"] },
          "required": { "type": "boolean" },
          "enum": { "type": "array", "items": { "type": "string" } },
          "description": { "type": "string" },
          "default": {}
        }
      }
    },
    "example": { "type": "string" },
    "constraints": { "type": "array", "items": { "type": "string" } },
    "nextStep": { "type": "string" },
    "requiresConfirmation": { "type": "boolean" }
  }
}
```

### B. Fluxo de Decisão da IA

```
Receber resposta do MCP
        ↓
Há bloco com audience=["assistant"]? 
        ↓ NÃO → Mostrar ao usuário e aguardar
        ↓ SIM
Ler instruction_type
        ↓
┌─────────────────┬──────────────────┬────────────────┐
│ action_required │  confirmation    │  information   │
├─────────────────┼──────────────────┼────────────────┤
│ Executar tool   │ Aguardar usuário │ Registrar info │
│ com parâmetros  │ perguntar se     │ e continuar    │
│ do schema       │ confirma         │ normalmente    │
└─────────────────┴──────────────────┴────────────────┘
```

---

**Fim do Documento**
