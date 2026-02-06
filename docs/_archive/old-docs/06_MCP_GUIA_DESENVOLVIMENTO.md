# Guia de Desenvolvimento: MCP Maestro

Guia passo a passo para implementação do MCP Server do Maestro.

**Versão:** 1.0  
**Criado:** 2026-01-07  
**Baseado em:** MCP_ESPECIFICACAO.md v2.1

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Fase 1: Setup do Projeto](#2-fase-1-setup-do-projeto)
3. [Fase 2: Implementação Core](#3-fase-2-implementação-core)
4. [Fase 3: Resources](#4-fase-3-resources)
5. [Fase 4: Tools Básicas](#5-fase-4-tools-básicas)
6. [Fase 5: Sistema de Fluxos](#6-fase-5-sistema-de-fluxos)
7. [Fase 6: Gates e Validação](#7-fase-6-gates-e-validação)
8. [Fase 7: Tools Avançadas](#8-fase-7-tools-avançadas)
9. [Fase 8: Testes](#9-fase-8-testes)
10. [Fase 9: Integração e Deploy](#10-fase-9-integração-e-deploy)
11. [Checklist de Entrega](#11-checklist-de-entrega)

---

## 1. Pré-requisitos

### Conhecimentos Necessários

- TypeScript avançado
- Node.js e NPM/PNPM
- Protocolo MCP (Model Context Protocol)
- JSON Schema para validação

### Ferramentas

| Ferramenta | Versão Mínima | Uso |
|------------|---------------|-----|
| Node.js | 18.x LTS | Runtime |
| TypeScript | 5.0+ | Linguagem |
| PNPM | 8.x | Gerenciador de pacotes |
| VSCode | Última | IDE recomendada |

### Documentação de Referência

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- `MCP_ESPECIFICACAO.md` (especificação completa do Maestro)

---

## 2. Fase 1: Setup do Projeto

**Duração estimada:** 2-4 horas

### 2.1 Criar Estrutura do Projeto

```bash
# Criar diretório do projeto
mkdir mcp-maestro
cd mcp-maestro

# Inicializar projeto
pnpm init

# Instalar dependências core
pnpm add @modelcontextprotocol/sdk zod

# Instalar dependências de desenvolvimento
pnpm add -D typescript @types/node tsx vitest
```

### 2.2 Configurar TypeScript

Criar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 2.3 Estrutura de Pastas

```
mcp-maestro/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # Configuração do servidor MCP
│   ├── types/                # Tipos TypeScript compartilhados
│   │   └── index.ts
│   ├── resources/            # Handlers de Resources
│   ├── tools/                # Handlers de Tools
│   ├── flows/                # Definição dos fluxos
│   ├── gates/                # Validadores de Gate
│   ├── state/                # Gerenciamento de estado
│   └── utils/                # Utilitários
├── guia/                     # Symlink para Maestro
├── tests/                    # Testes
├── package.json
├── tsconfig.json
└── README.md
```

### 2.4 Package.json Scripts

```json
{
  "name": "mcp-maestro",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mcp-maestro": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  }
}
```

### 2.5 Criar Symlink para o Guia

```bash
# Windows (PowerShell como Admin)
New-Item -ItemType SymbolicLink -Path "guia" -Target "D:\Sistemas\Maestro"

# Linux/Mac
ln -s /caminho/para/Maestro guia
```

### ✅ Entregáveis da Fase 1

- [ ] Projeto inicializado com dependências
- [ ] TypeScript configurado
- [ ] Estrutura de pastas criada
- [ ] Symlink para o Guia funcionando
- [ ] Scripts de desenvolvimento funcionando

---

## 3. Fase 2: Implementação Core

**Duração estimada:** 4-6 horas

### 3.1 Entry Point (`src/index.ts`)

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

const server = new Server(
  {
    name: "mcp-maestro",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Registrar handlers
registerResources(server);
registerTools(server);

// Iniciar servidor
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("MCP Maestro iniciado");
```

### 3.2 Tipos Base (`src/types/index.ts`)

```typescript
// Níveis de complexidade
export type NivelComplexidade = "simples" | "medio" | "complexo";

// Tipos de fluxo
export type TipoFluxo = "novo_projeto" | "feature" | "bug" | "refatoracao";

// Tipos de história
export type TipoHistoria = "contrato" | "frontend" | "backend" | "integracao";

// Estado do projeto
export interface EstadoProjeto {
  projeto_id: string;
  nome: string;
  diretorio: string;
  nivel: NivelComplexidade;
  tipo_fluxo: TipoFluxo;
  fase_atual: number;
  total_fases: number;
  entregaveis: Record<string, string>;
  gates_validados: number[];
  usar_stitch: boolean;  // Se true, passa pela fase Stitch; se false, pula direto para UX
  criado_em: string;
  atualizado_em: string;
}


// Fase do fluxo
export interface Fase {
  numero: number;
  nome: string;
  especialista: string;
  template: string;
  gate_checklist: string[];
  entregavel_esperado: string;
}

// Gate de validação
export interface GateResultado {
  valido: boolean;
  itens_validados: string[];
  itens_pendentes: string[];
  sugestoes: string[];
}
```

### 3.3 Utilitários de Arquivos (`src/utils/files.ts`)

```typescript
import { readFile, writeFile, readdir, stat } from "fs/promises";
import { join } from "path";

const GUIA_PATH = join(process.cwd(), "guia");

export async function lerEspecialista(nome: string): Promise<string> {
  const path = join(GUIA_PATH, "02-especialistas", `Especialista em ${nome}.md`);
  return readFile(path, "utf-8");
}

export async function lerTemplate(nome: string): Promise<string> {
  const path = join(GUIA_PATH, "06-templates", `${nome}.md`);
  return readFile(path, "utf-8");
}

export async function lerPrompt(categoria: string, nome: string): Promise<string> {
  const path = join(GUIA_PATH, "05-prompts", categoria, `${nome}.md`);
  return readFile(path, "utf-8");
}

export async function listarArquivos(dir: string): Promise<string[]> {
  const entries = await readdir(join(GUIA_PATH, dir));
  return entries.filter(e => e.endsWith(".md"));
}
```

### ✅ Entregáveis da Fase 2

- [ ] Entry point funcionando
- [ ] Tipos base definidos
- [ ] Utilitários de arquivos implementados
- [ ] Servidor MCP inicializando corretamente

---

## 4. Fase 3: Resources

**Duração estimada:** 4-6 horas

### 4.1 Handler de Resources (`src/resources/index.ts`)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { lerEspecialista, lerTemplate, lerPrompt, listarArquivos } from "../utils/files.js";

export function registerResources(server: Server) {
  // Listar resources disponíveis
  server.setRequestHandler("resources/list", async () => {
    const especialistas = await listarArquivos("02-especialistas");
    const templates = await listarArquivos("06-templates");
    
    return {
      resources: [
        // Especialistas
        ...especialistas.map(e => ({
          uri: `guia://especialista/${e.replace("Especialista em ", "").replace(".md", "")}`,
          name: e.replace(".md", ""),
          mimeType: "text/markdown",
        })),
        // Templates
        ...templates.map(t => ({
          uri: `guia://template/${t.replace(".md", "")}`,
          name: t.replace(".md", ""),
          mimeType: "text/markdown",
        })),
        // System prompt
        {
          uri: "guia://system-prompt",
          name: "System Prompt",
          mimeType: "text/markdown",
        },
      ],
    };
  });

  // Ler resource específico
  server.setRequestHandler("resources/read", async (request) => {
    const { uri } = request.params;
    
    if (uri.startsWith("guia://especialista/")) {
      const nome = uri.replace("guia://especialista/", "");
      const conteudo = await lerEspecialista(nome);
      return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }
    
    if (uri.startsWith("guia://template/")) {
      const nome = uri.replace("guia://template/", "");
      const conteudo = await lerTemplate(nome);
      return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }
    
    if (uri === "guia://system-prompt") {
      const conteudo = await gerarSystemPrompt();
      return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
    }
    
    throw new Error(`Resource não encontrado: ${uri}`);
  });
}

async function gerarSystemPrompt(): Promise<string> {
  // Gera o system prompt com instruções para a IA
  return `# Maestro - Instruções para IA
  
Você está usando o Maestro, um guia de desenvolvimento assistido por IA.

## Comportamentos Automáticos

Quando o usuário disser "próximo", "avançar", "terminei" ou "pronto":
1. Identifique o entregável desenvolvido na conversa
2. Chame a tool \`proximo\` passando o entregável
3. Aguarde a resposta com a próxima fase

## Fluxo de Desenvolvimento

1. Produto → 2. Requisitos → 3. UX → 4. Modelo → 5. Arquitetura
→ 6. Segurança → 7. Testes → 8. Backlog → 9. Contrato 
→ 10. Frontend/Backend → 11. Integração → 12. Deploy
`;
}
```

### Resources a Implementar

| URI Pattern | Descrição | Arquivo |
|-------------|-----------|---------|
| `guia://especialista/{nome}` | Especialistas | `especialistas.ts` |
| `guia://template/{nome}` | Templates de artefatos | `templates.ts` |
| `guia://prompt/{cat}/{nome}` | Prompts avançados | `prompts.ts` |
| `guia://guia/{nome}` | Guias práticos | `guias.ts` |
| `guia://projeto/contexto` | Contexto do projeto | `contexto.ts` |
| `guia://projeto/estado` | Estado do fluxo | `estado.ts` |
| `guia://system-prompt` | Instruções para IA | `system-prompt.ts` |

### ✅ Entregáveis da Fase 3

- [ ] 7 handlers de resources implementados
- [ ] Listagem de resources funcionando
- [ ] Leitura de arquivos do Guia funcionando
- [ ] System prompt completo

---

## 5. Fase 4: Tools Básicas

**Duração estimada:** 8-12 horas

### 5.1 Handler de Tools (`src/tools/index.ts`)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { iniciarProjeto } from "./iniciar-projeto.js";
import { proximo } from "./proximo.js";
import { status } from "./status.js";
import { validarGate } from "./validar-gate.js";

export function registerTools(server: Server) {
  // Definir tools disponíveis
  server.setRequestHandler("tools/list", async () => ({
    tools: [
      {
        name: "iniciar_projeto",
        description: "Inicia um novo projeto com o Maestro",
        inputSchema: {
          type: "object",
          properties: {
            nome: { type: "string", description: "Nome do projeto" },
            descricao: { type: "string", description: "Descrição opcional" },
            diretorio: { type: "string", description: "Diretório do projeto" },
          },
          required: ["nome"],
        },
      },
      {
        name: "proximo",
        description: "Salva entregável e avança para próxima fase",
        inputSchema: {
          type: "object",
          properties: {
            entregavel: { type: "string", description: "Conteúdo do entregável" },
            forcar: { type: "boolean", description: "Ignorar validação de gate" },
          },
          required: ["entregavel"],
        },
      },
      {
        name: "status",
        description: "Retorna status atual do projeto",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "validar_gate",
        description: "Valida checklist de saída da fase",
        inputSchema: {
          type: "object",
          properties: {
            fase: { type: "number", description: "Número da fase" },
          },
        },
      },
    ],
  }));

  // Executar tools
  server.setRequestHandler("tools/call", async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "iniciar_projeto":
        return await iniciarProjeto(args);
      case "proximo":
        return await proximo(args);
      case "status":
        return await status();
      case "validar_gate":
        return await validarGate(args);
      default:
        throw new Error(`Tool não encontrada: ${name}`);
    }
  });
}
```

### 5.2 Tool: iniciar_projeto (`src/tools/iniciar-projeto.ts`)

```typescript
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import { EstadoProjeto } from "../types/index.js";
import { lerEspecialista, lerTemplate } from "../utils/files.js";
import { salvarEstado } from "../state/storage.js";

export async function iniciarProjeto(args: {
  nome: string;
  descricao?: string;
  diretorio?: string;
}) {
  const diretorio = args.diretorio || process.cwd();
  const projetoId = uuid();

  // Criar estrutura de pastas
  await mkdir(join(diretorio, ".guia"), { recursive: true });
  await mkdir(join(diretorio, "docs"), { recursive: true });

  // Estado inicial
  const estado: EstadoProjeto = {
    projeto_id: projetoId,
    nome: args.nome,
    diretorio,
    nivel: "medio", // Será definido após PRD
    tipo_fluxo: "novo_projeto",
    fase_atual: 1,
    total_fases: 10, // Será ajustado após classificação
    entregaveis: {},
    gates_validados: [],
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  };

  await salvarEstado(diretorio, estado);

  // Carregar especialista e template da fase 1
  const especialista = await lerEspecialista("Gestão de Produto");
  const template = await lerTemplate("PRD");

  return {
    content: [
      {
        type: "text",
        text: `# Projeto Iniciado: ${args.nome}

## Status
- **ID:** ${projetoId}
- **Fase:** 1/? (será definido após PRD)
- **Especialista:** Gestão de Produto

## Próximo Passo
Desenvolva o PRD (Product Requirements Document) usando o template abaixo.

Quando terminar, diga "próximo" para avançar.

---

## Especialista Carregado

${especialista}

---

## Template: PRD

${template}
`,
      },
    ],
  };
}
```

### Tools Básicas a Implementar

| Tool | Arquivo | Prioridade |
|------|---------|------------|
| `iniciar_projeto` | `iniciar-projeto.ts` | 🔴 Alta |
| `proximo` | `proximo.ts` | 🔴 Alta |
| `status` | `status.ts` | 🔴 Alta |
| `validar_gate` | `validar-gate.ts` | 🔴 Alta |
| `salvar` | `salvar.ts` | 🟡 Média |
| `contexto` | `contexto.ts` | 🟡 Média |
| `classificar` | `classificar.ts` | 🟡 Média |

### ✅ Entregáveis da Fase 4

- [ ] 7 tools básicas implementadas
- [ ] Persistência de estado funcionando
- [ ] Fluxo iniciar → proximo → status funcionando
- [ ] Validação de gates funcionando

---

## 6. Fase 5: Sistema de Fluxos

**Duração estimada:** 6-8 horas

### 6.1 Definição dos Fluxos (`src/flows/types.ts`)

```typescript
import { Fase, NivelComplexidade } from "../types/index.js";

export interface Fluxo {
  nivel: NivelComplexidade;
  total_fases: number;
  fases: Fase[];
}

export const FLUXO_SIMPLES: Fluxo = {
  nivel: "simples",
  total_fases: 5,
  fases: [
    { numero: 1, nome: "Produto", especialista: "Gestão de Produto", template: "PRD", gate_checklist: ["Problema definido", "MVP claro"], entregavel_esperado: "PRD" },
    { numero: 2, nome: "Requisitos", especialista: "Engenharia de Requisitos", template: "requisitos", gate_checklist: ["RFs com IDs", "RNFs definidos"], entregavel_esperado: "Requisitos" },
    { numero: 3, nome: "Arquitetura", especialista: "Arquitetura de Software", template: "arquitetura", gate_checklist: ["Stack definida", "C4 básico"], entregavel_esperado: "Arquitetura" },
    { numero: 4, nome: "Backlog", especialista: "Plano de Execução", template: "backlog", gate_checklist: ["Histórias criadas", "DoD definido"], entregavel_esperado: "Backlog" },
    { numero: 5, nome: "Desenvolvimento", especialista: "Desenvolvimento", template: "historia-usuario", gate_checklist: ["Código implementado", "Testes passando"], entregavel_esperado: "Código" },
  ],
};

export const FLUXO_MEDIO: Fluxo = {
  nivel: "medio",
  total_fases: 11,
  fases: [
    // ... 11 fases conforme MCP_ESPECIFICACAO.md
    // Inclui fase 5: Design de Banco de Dados (nova)
  ],
};

export const FLUXO_COMPLEXO: Fluxo = {
  nivel: "complexo",
  total_fases: 15,
  fases: [
    // ... 15 fases conforme MCP_ESPECIFICACAO.md
    // Inclui fase 5: Design de Banco de Dados (nova)
  ],
};
```

### 6.2 Classificador de Complexidade (`src/complexity/classifier.ts`)

```typescript
interface ClassificacaoResultado {
  nivel: NivelComplexidade;
  pontuacao: number;
  criterios: string[];
}

export function classificarPRD(prd: string): ClassificacaoResultado {
  let pontos = 0;
  const criterios: string[] = [];

  // Critério 1: Entidades (conta substantivos capitalizados)
  const entidades = (prd.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || []).length;
  if (entidades > 10) { pontos += 3; criterios.push("Muitas entidades"); }
  else if (entidades > 5) { pontos += 2; }
  else { pontos += 1; }

  // Critério 2: Integrações
  const integracoes = /API|integra|externa|third-party|webhook/gi.test(prd);
  if (integracoes) { pontos += 3; criterios.push("Integrações externas"); }

  // Critério 3: Segurança
  const seguranca = /LGPD|GDPR|compliance|autentica|autoriza|OAuth|JWT/gi.test(prd);
  if (seguranca) { pontos += 3; criterios.push("Requisitos de segurança"); }

  // Critério 4: Escala
  const escala = /milhares|milhões|alta disponibilidade|scale|concurrent/gi.test(prd);
  if (escala) { pontos += 3; criterios.push("Requisitos de escala"); }

  // Critério 5: Multi-tenant
  const multiTenant = /multi-tenant|inquilino|organização|workspace/gi.test(prd);
  if (multiTenant) { pontos += 3; criterios.push("Multi-tenancy"); }

  // Critério 6: Cronograma
  const cronograma = prd.match(/(\d+)\s*(mês|meses|semana|semanas)/gi);
  if (cronograma) {
    const tempo = parseInt(cronograma[0]);
    if (tempo > 3) { pontos += 3; criterios.push("Cronograma longo"); }
    else if (tempo > 1) { pontos += 2; }
    else { pontos += 1; }
  }

  // Determinar nível
  let nivel: NivelComplexidade;
  if (pontos <= 12) nivel = "simples";
  else if (pontos <= 18) nivel = "medio";
  else nivel = "complexo";

  return { nivel, pontuacao: pontos, criterios };
}
```

### ✅ Entregáveis da Fase 5

- [ ] 3 fluxos definidos (simples, médio, complexo)
- [ ] Classificador de complexidade funcionando
- [ ] Transição automática entre fases
- [ ] Fluxos alternativos (feature, bug, refatoração)

---

## 7. Fase 6: Gates e Validação

**Duração estimada:** 4-6 horas

### 7.1 Motor de Validação (`src/gates/validator.ts`)

```typescript
import { GateResultado, Fase } from "../types/index.js";

export function validarGate(fase: Fase, entregavel: string): GateResultado {
  const validados: string[] = [];
  const pendentes: string[] = [];
  const sugestoes: string[] = [];

  for (const item of fase.gate_checklist) {
    if (verificarItem(item, entregavel)) {
      validados.push(item);
    } else {
      pendentes.push(item);
      sugestoes.push(gerarSugestao(item));
    }
  }

  return {
    valido: pendentes.length === 0,
    itens_validados: validados,
    itens_pendentes: pendentes,
    sugestoes,
  };
}

function verificarItem(item: string, entregavel: string): boolean {
  // Implementar lógica de verificação por item
  // Pode usar regex, NLP, ou LLM para validação semântica
  const keywords = item.toLowerCase().split(" ");
  return keywords.some(kw => entregavel.toLowerCase().includes(kw));
}

function gerarSugestao(item: string): string {
  return `Adicione ${item} ao entregável`;
}
```

### 7.2 Checklists por Fase (`src/gates/checklists.ts`)

```typescript
export const GATE_CHECKLISTS: Record<number, string[]> = {
  1: [ // Produto
    "Problema claramente definido",
    "Personas identificadas",
    "Funcionalidades MVP listadas",
    "North Star Metric definida",
    "Cronograma estimado",
  ],
  2: [ // Requisitos
    "Requisitos funcionais com IDs únicos",
    "Requisitos não-funcionais definidos",
    "Critérios de aceite em Gherkin",
    "Matriz de rastreabilidade iniciada",
  ],
  // ... continuar para todas as fases
};
```

### ✅ Entregáveis da Fase 6

- [ ] Motor de validação implementado
- [ ] Checklists para todas as fases
- [ ] Feedback detalhado de validação
- [ ] Capacidade de forçar avanço (com warning)

---

## 8. Fase 7: Tools Avançadas

**Duração estimada:** 12-16 horas

### Tools de Análise (Prioridade Baixa - v2)

| Tool | Descrição | Complexidade |
|------|-----------|--------------|
| `analisar_seguranca` | Busca vulnerabilidades OWASP | Alta |
| `analisar_performance` | Detecta N+1, gargalos | Alta |
| `analisar_qualidade` | Métricas de código | Média |
| `analisar_acessibilidade` | WCAG compliance | Média |
| `analisar_dependencias` | CVEs, updates | Baixa |
| `sugerir_melhorias` | Consolidado | Média |
| `gerar_relatorio` | Report em markdown | Baixa |

### Tools de Implementação

| Tool | Descrição | Complexidade |
|------|-----------|--------------|
| `implementar_historia` | Orquestra blocos | Alta |
| `validar_bloco` | Executa testes/lint | Média |
| `nova_feature` | Análise de impacto | Média |
| `corrigir_bug` | Fluxo de debug | Média |
| `refatorar` | Fluxo de legado | Média |

### ✅ Entregáveis da Fase 7

- [ ] Tools de análise implementadas
- [ ] Tools de implementação funcionando
- [ ] Integração com comandos do sistema (npm test, lint)

---

## 9. Fase 8: Testes

**Duração estimada:** 8-12 horas

### 9.1 Configurar Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", "dist"],
    },
  },
});
```

### 9.2 Testes Unitários

```typescript
// tests/tools/proximo.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { proximo } from "../../src/tools/proximo.js";

describe("proximo", () => {
  it("deve salvar entregável e avançar fase", async () => {
    const resultado = await proximo({
      entregavel: "# PRD\n\n## Problema\nUsuários precisam...",
    });
    
    expect(resultado.content[0].text).toContain("Fase 2");
    expect(resultado.content[0].text).toContain("arquivo_salvo");
  });

  it("deve classificar projeto após fase 1", async () => {
    // Testar classificação automática
  });

  it("deve bloquear se gate inválido", async () => {
    // Testar validação de gate
  });
});
```

### 9.3 Testes de Integração

```typescript
// tests/integration/fluxo-completo.test.ts
import { describe, it, expect } from "vitest";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

describe("Fluxo Completo", () => {
  it("deve completar projeto simples em 5 fases", async () => {
    // Simular fluxo completo
  });
});
```

### ✅ Entregáveis da Fase 8

- [ ] Cobertura de testes > 80%
- [ ] Testes unitários para todas as tools
- [ ] Testes de integração para fluxos
- [ ] CI/CD configurado

---

## 10. Fase 9: Integração e Deploy

**Duração estimada:** 4-6 horas

### 10.1 Configurar Claude Desktop

Adicionar ao `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "node",
      "args": ["D:/path/to/mcp-maestro/dist/index.js"],
      "env": {
        "GUIA_PATH": "D:/Sistemas/Maestro"
      }
    }
  }
}
```

### 10.2 Publicar no NPM (opcional)

```bash
# Build
pnpm build

# Login no NPM
npm login

# Publicar
npm publish
```

### 10.3 Documentação

- README.md completo
- CHANGELOG.md
- Exemplos de uso
- Troubleshooting

### ✅ Entregáveis da Fase 9

- [ ] Integração com Claude Desktop testada
- [ ] Pacote publicável
- [ ] Documentação completa
- [ ] Guia de troubleshooting

---

## 11. Checklist de Entrega

### MVP (Mínimo Viável)

- [ ] **Resources**: especialistas, templates, system-prompt
- [ ] **Tools**: iniciar_projeto, proximo, status, validar_gate
- [ ] **Fluxos**: simples (5 fases), médio (10 fases)
- [ ] **Gates**: Validação básica por keywords
- [ ] **Estado**: Persistência em JSON
- [ ] **Testes**: Cobertura > 60%

### v1.0 (Release Completo)

- [ ] Todos os 7 resources
- [ ] Todos as 14+ tools
- [ ] 3 fluxos + 3 alternativos
- [ ] Gates com validação semântica
- [ ] Classificação automática de complexidade
- [ ] Testes > 80%
- [ ] Documentação completa

### v2.0 (Futuro)

- [ ] Dashboard web
- [ ] Persistência distribuída
- [ ] Integração com Git
- [ ] Análises com LLM
- [ ] Métricas e relatórios

---

## Estimativa Total

| Fase | Duração | Acumulado |
|------|---------|-----------|
| 1. Setup | 2-4h | 2-4h |
| 2. Core | 4-6h | 6-10h |
| 3. Resources | 4-6h | 10-16h |
| 4. Tools Básicas | 8-12h | 18-28h |
| 5. Fluxos | 6-8h | 24-36h |
| 6. Gates | 4-6h | 28-42h |
| 7. Tools Avançadas | 12-16h | 40-58h |
| 8. Testes | 8-12h | 48-70h |
| 9. Deploy | 4-6h | 52-76h |

**Total estimado: 52-76 horas (2-3 semanas de trabalho focado)**

---

## Recursos Adicionais

- [MCP SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [Exemplos de MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Especificação MCP](https://modelcontextprotocol.io/specification)
