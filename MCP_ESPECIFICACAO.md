# Especificação Técnica: MCP Maestro

Documento detalhado para criação do MCP Server que automatiza o uso do Maestro.

**Versão:** 2.1  
**Atualizado:** 2026-01-07  
**Status:** Especificação completa

---

## 1. Visão Geral

### O que é MCP?

**Model Context Protocol (MCP)** é um protocolo aberto que permite que LLMs acessem contexto externo (arquivos, APIs, ferramentas) de forma estruturada. É suportado nativamente pelo Claude Desktop e pode ser integrado a outras ferramentas.

### Objetivo do MCP Maestro

Criar um servidor MCP que:
1. **Guia o desenvolvedor** pelo fluxo correto de desenvolvimento
2. **Injeta contexto** dos especialistas automaticamente
3. **Persiste entregáveis** em estrutura organizada usando templates
4. **Mantém estado** do projeto entre sessões
5. **Valida gates** entre fases garantindo qualidade
6. **Classifica complexidade** e adapta fluxo automaticamente

### Novidades na v2.2

- ✅ **Coleta automática**: IA chama `proximo()` automaticamente quando dev sinaliza avanço
- ✅ **Classificação automática**: Baseada no PRD, não em questionário
- ✅ **Persistência integrada**: `proximo()` salva automaticamente
- ✅ **Fluxo simplificado**: Menos comandos, mais produtividade
- ✅ **Sistema de Gates**: Validação entre fases
- ✅ **Templates integrados**: 16 templates de artefatos
- ✅ **Especialistas avançados**: DDD, Performance, Observabilidade
- ✅ **Prompts avançados**: Arquitetura C4, DDD, escalabilidade

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (IDE/Claude)                        │
├─────────────────────────────────────────────────────────────────┤
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    MCP SERVER v2.0                        │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │  RESOURCES  │  │    TOOLS    │  │   PROMPTS   │       │  │
│  │  │             │  │             │  │             │       │  │
│  │  │ • especial- │  │ • iniciar   │  │ • discovery │       │  │
│  │  │   istas     │  │ • proximo   │  │ • c4-completo│      │  │
│  │  │ • templates │  │ • validar_  │  │ • ddd       │       │  │
│  │  │ • prompts   │  │   gate      │  │ • escalab.  │       │  │
│  │  │ • contexto  │  │ • salvar    │  │ • observ.   │       │  │
│  │  └─────────────┘  │ • classif.  │  └─────────────┘       │  │
│  │                   └─────────────┘                         │  │
│  │                         │                                 │  │
│  │  ┌──────────────────────┴────────────────────────────┐   │  │
│  │  │              GATE VALIDATOR                        │   │  │
│  │  │  • Valida checklist de saída por fase              │   │  │
│  │  │  • Bloqueia avanço se artefato incompleto          │   │  │
│  │  │  • Sugere correções automáticas                    │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  │                         │                                 │  │
│  │  ┌──────────────────────┴────────────────────────────┐   │  │
│  │  │              STATE MANAGER                         │   │  │
│  │  │  • Fase atual do projeto                           │   │  │
│  │  │  • Entregáveis gerados + validação                 │   │  │
│  │  │  • Contexto acumulado                              │   │  │
│  │  │  • Nível de complexidade                           │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  │                         │                                 │  │
│  │  ┌──────────────────────┴────────────────────────────┐   │  │
│  │  │              FILE SYSTEM                           │   │  │
│  │  │  • Maestro (especialistas, guias, templates)   │   │  │
│  │  │  • Projeto do usuário (docs/, src/)                │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura do Projeto MCP

```
mcp-maestro/
├── src/
│   ├── index.ts                 # Entry point do MCP Server
│   ├── server.ts                # Configuração do servidor
│   │
│   ├── resources/               # Handlers de Resources
│   │   ├── index.ts
│   │   ├── especialistas.ts     # Lê especialistas (15 arquivos)
│   │   ├── guias.ts             # Lê guias do guia
│   │   ├── templates.ts         # Lê templates de artefatos (13 arquivos)
│   │   ├── prompts.ts           # Lê templates de prompts avançados
│   │   └── contexto.ts          # Lê contexto do projeto
│   │
│   ├── tools/                   # Handlers de Tools
│   │   ├── index.ts
│   │   ├── iniciar-projeto.ts   # Inicia novo projeto
│   │   ├── classificar.ts       # Classifica complexidade do projeto
│   │   ├── nova-feature.ts      # Inicia fluxo de feature
│   │   ├── corrigir-bug.ts      # Inicia fluxo de debug
│   │   ├── refatorar.ts         # Inicia fluxo de refatoração
│   │   ├── proximo.ts           # Avança para próxima fase
│   │   ├── validar-gate.ts      # Valida checklist de saída
│   │   ├── status.ts            # Retorna status atual
│   │   ├── salvar.ts            # Salva entregável usando template
│   │   ├── contexto.ts          # Retorna contexto completo
│   │   │
│   │   ├── analise/             # Tools de Análise
│   │   │   ├── seguranca.ts     # Análise de vulnerabilidades
│   │   │   ├── performance.ts   # Análise de performance
│   │   │   ├── qualidade.ts     # Análise de qualidade de código
│   │   │   ├── acessibilidade.ts # Análise WCAG
│   │   │   ├── dependencias.ts  # Análise de deps (CVEs, updates)
│   │   │   ├── melhorias.ts     # Sugestões de melhorias
│   │   │   └── relatorio.ts     # Gerador de relatórios
│   │   │
│   │
│   ├── prompts/                 # Prompts dinâmicos
│   │   ├── index.ts
│   │   └── templates.ts
│   │
│   ├── flows/                   # Definição dos fluxos
│   │   ├── index.ts
│   │   ├── types.ts             # Tipos TypeScript
│   │   ├── simples.ts           # 5 fases (nível 1)
│   │   ├── medio.ts             # 10 fases (nível 2)
│   │   ├── complexo.ts          # 14 fases (nível 3)
│   │   ├── nova-feature.ts      # 6 fases
│   │   ├── corrigir-bug.ts      # 5 fases
│   │   └── refatorar.ts         # 6 fases
│   │
│   ├── gates/                   # Validadores de Gate
│   │   ├── index.ts
│   │   ├── validator.ts         # Motor de validação
│   │   └── checklists.ts        # Checklists por fase
│   │
│   ├── analyzers/               # Motores de Análise
│   │   ├── index.ts
│   │   ├── security-analyzer.ts # Detector de vulnerabilidades
│   │   ├── performance-analyzer.ts # Detector de gargalos
│   │   ├── quality-analyzer.ts  # Métricas de qualidade
│   │   ├── a11y-analyzer.ts     # Conformidade WCAG
│   │   ├── deps-analyzer.ts     # Análise de dependências
│   │   └── rules/               # Regras de análise
│   │       ├── owasp.ts         # Regras OWASP Top 10
│   │       ├── performance.ts   # Regras de performance
│   │       └── quality.ts       # Regras de qualidade
│   │
│   ├── state/                   # Gerenciamento de estado
│   │   ├── index.ts
│   │   ├── projeto.ts           # Estado do projeto
│   │   └── storage.ts           # Persistência em JSON
│   │
│   ├── complexity/              # Classificador de complexidade
│   │   ├── index.ts
│   │   └── classifier.ts        # Algoritmo de classificação
│   │
│   └── utils/                   # Utilitários
│       ├── files.ts             # Manipulação de arquivos
│       ├── markdown.ts          # Parser de markdown
│       └── code-parser.ts       # Parser de código para análise
│
├── guia/                        # Symlink para Maestro
│
├── tests/                       # Testes
│   ├── tools.test.ts
│   ├── gates.test.ts
│   └── flows.test.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3.1 Coleta Automática de Entregáveis

O MCP utiliza **instruções embutidas nos especialistas** para que a IA automaticamente chame `proximo()` quando o desenvolvedor sinaliza que quer avançar.

### Como Funciona

```
┌─────────────────────────────────────────────────────────────────┐
│   FLUXO AUTOMÁTICO                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   👤 Dev: "Próximo" / "Avançar" / "Terminei"                   │
│                    │                                            │
│                    ▼                                            │
│   🤖 IA identifica entregável da conversa                      │
│                    │                                            │
│                    ▼                                            │
│   🤖 IA chama: proximo(entregavel: "[conteúdo]")               │
│                    │                                            │
│                    ▼                                            │
│   ✅ MCP salva, valida gate, carrega próxima fase              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Instrução nos Especialistas

Cada especialista contém uma instrução especial no final:

```markdown
---

## 🔄 Instrução de Avanço Automático

Quando o usuário indicar que deseja avançar para a próxima fase usando 
expressões como "próximo", "avançar", "terminei", "pronto", "continuar":

1. Identifique o entregável principal desenvolvido nesta conversa
2. Chame a tool `proximo` passando o entregável como parâmetro:
   
   proximo(entregavel: "[conteúdo completo do artefato]")

3. Aguarde a resposta do MCP com a próxima fase

**Importante:** Não peça confirmação, apenas execute a chamada automaticamente.
```

### Gatilhos Reconhecidos

A IA reconhece os seguintes gatilhos para avançar automaticamente:

| Gatilho | Exemplos |
|---------|----------|
| **Próximo** | "próximo passo", "próxima fase", "next" |
| **Avançar** | "avançar", "seguir em frente", "continuar" |
| **Conclusão** | "terminei", "pronto", "finalizado" |
| **Implícito** | "pode salvar", "está bom assim" |

### Benefícios

| Aspecto | Antes (Manual) | Agora (Automático) |
|---------|---------------|-------------------|
| Passos | 2 (colar + chamar) | 1 (só falar) |
| Erro humano | Pode esquecer de salvar | Impossível esquecer |
| Fluidez | Interrompe conversa | Fluxo contínuo |
| UX | Técnico | Natural |

---

## 4. Especificação das Resources

### 4.1 guia://especialista/{nome}

Retorna conteúdo de um especialista (15 disponíveis).

```typescript
// Especialistas Base (12)
"guia://especialista/gestao-de-produto"
"guia://especialista/engenharia-de-requisitos"
"guia://especialista/ux-design"
"guia://especialista/modelagem-de-dominio"
"guia://especialista/arquitetura-de-software"
"guia://especialista/seguranca"
"guia://especialista/analise-de-testes"
"guia://especialista/plano-de-execucao"
"guia://especialista/desenvolvimento"
"guia://especialista/devops"
"guia://especialista/dados-e-analytics"
"guia://especialista/acessibilidade"

// Especialistas Avançados (3) - Para projetos complexos
"guia://especialista/arquitetura-avancada"      // DDD, CQRS, Microserviços
"guia://especialista/performance"               // Load test, caching
"guia://especialista/observabilidade"           // Logs, métricas, tracing
```

### 4.2 guia://template/{nome}

Retorna template de artefato (13 disponíveis).

```typescript
"guia://template/PRD"                    // Product Requirements Document
"guia://template/requisitos"             // Requisitos funcionais/não-funcionais
"guia://template/criterios-aceite"       // Cenários Gherkin
"guia://template/design-doc"             // Documento de design UX
"guia://template/modelo-dominio"         // Entidades e relacionamentos (DDD)
"guia://template/arquitetura"            // Arquitetura C4
"guia://template/adr"                    // Architecture Decision Record
"guia://template/checklist-seguranca"    // OWASP, autenticação
"guia://template/plano-testes"           // Estratégia de testes
"guia://template/backlog"                // Épicos e histórias
"guia://template/historia-usuario"       // User story individual
"guia://template/matriz-rastreabilidade" // RF → US → TC
```

### 4.3 guia://prompt/{area}/{nome}

Retorna template de prompt avançado.

```typescript
// Arquitetura
"guia://prompt/arquitetura/c4-completo"
"guia://prompt/arquitetura/ddd-bounded-contexts"
"guia://prompt/arquitetura/modelo-dominio"

// Escalabilidade
"guia://prompt/escalabilidade/analise-performance"

// Observabilidade
"guia://prompt/observabilidade/estrategia"

// Por fase
"guia://prompt/produto/discovery-inicial"
"guia://prompt/requisitos/refinamento"
"guia://prompt/testes/plano-completo"
```

### 4.4 guia://projeto/contexto

Retorna contexto atual do projeto.

```typescript
interface ContextoOutput {
  resumo: string;
  stack: string;
  modelo: string;
  arquitetura: string;
  fase_atual: string;
  nivel_complexidade: "simples" | "medio" | "complexo";
  gates_validados: number;
  gates_pendentes: string[];
}
```

### 4.5 guia://projeto/estado

Retorna estado completo do fluxo.

```typescript
interface EstadoOutput {
  projeto: ProjetoInfo;
  fluxo: FluxoInfo;
  fases: FaseInfo[];
  entregaveis: EntregavelInfo[];
  gates: GateInfo[];
}
```

### 4.6 guia://guia/{nome}

Retorna conteúdo de um guia prático.

```typescript
"guia://guia/adicao-funcionalidades"
"guia://guia/debugging"
"guia://guia/refatoracao-legado"
"guia://guia/checklist-mestre"
"guia://guia/metricas-eficiencia"
```

### 4.7 guia://system-prompt

Retorna instruções de comportamento para a IA (rules). Este resource é **automaticamente injetado** quando o MCP inicia, configurando a IA para usar o guia corretamente.

```typescript
interface SystemPromptOutput {
  versao: string;
  instrucoes: string;           // Markdown com regras completas
  comportamentos_automaticos: {
    gatilhos_avanco: string[];  // Palavras que acionam proximo()
    validar_antes_avancar: boolean;
    carregar_especialista: boolean;
    manter_contexto: boolean;
  };
  fluxo: {
    fases: FaseInfo[];
    niveis_complexidade: NivelInfo[];
  };
  tools_disponiveis: ToolInfo[];
  resources_disponiveis: ResourceInfo[];
}
```

**Conteúdo retornado:**

O resource retorna um system prompt completo que instrui a IA a:

1. **Reconhecer gatilhos de avanço** - Quando usuário diz "próximo", "terminei", etc., chamar `proximo()` automaticamente
2. **Validar gates** - Verificar checklist antes de avançar de fase
3. **Carregar especialistas** - Usar o especialista correto para cada fase
4. **Manter contexto** - Preservar informações entre fases e sessões
5. **Seguir fluxo Frontend First** - Contrato → FE/BE paralelo → Integração

**Exemplo de uso no Claude Desktop:**

```json
{
  "mcpServers": {
    "maestro": {
      "autoLoadSystemPrompt": true,
      "systemPromptResource": "maestro://system-prompt"
    }
  }
}
```

**Integração com IDEs:**

Para IDEs que suportam rules locais (Cursor, Copilot), o arquivo `RULES_TEMPLATE.md` no repositório contém o mesmo conteúdo formatado para cópia manual.

---

## 5. Especificação das Tools

### 5.1 iniciar_projeto

Inicia um novo projeto. A classificação de complexidade é feita automaticamente após a fase 1 (PRD).

```typescript
interface IniciarProjetoInput {
  nome: string;
  descricao?: string;  // Opcional - será definido no PRD
  diretorio?: string;  // Default: cwd()
}

interface IniciarProjetoOutput {
  projeto_id: string;
  fase_atual: 1;       // Sempre começa na fase 1
  fluxo_status: "a_definir";  // Será definido após PRD
  especialista: string;
  template: string;
  gate_checklist: string[];
  prompt_sugerido: string;
  entregavel_esperado: string;
}
```

**Ações:**
1. Cria estrutura `.guia/` e `docs/` no diretório
2. Inicializa `estado.json` com fase 1 e fluxo pendente
3. Carrega especialista de Gestão de Produto + template PRD
4. Retorna prompt para elaboração do PRD

> **Nota:** A classificação de complexidade acontece automaticamente quando o dev avança da fase 1 para 2, baseada na análise do PRD.

---

### 5.2 proximo (com persistência automática)

Avança para a próxima fase. **Salva automaticamente** o entregável, valida o gate e carrega a próxima fase.

```typescript
interface ProximoInput {
  entregavel: string;     // OBRIGATÓRIO: conteúdo a salvar
  forcar?: boolean;       // Ignora gate (não recomendado)
  nome_arquivo?: string;  // Opcional: sobrescreve nome padrão
}

interface ProximoOutput {
  // Persistência automática
  arquivo_salvo: string;           // Caminho onde foi salvo
  template_aplicado: boolean;      // Se usou template
  
  // Classificação (apenas na transição fase 1→2)
  classificacao?: {
    nivel: "simples" | "medio" | "complexo";
    pontuacao: number;
    criterios_detectados: string[];
  };
  
  // Gate
  gate_resultado: {
    valido: boolean;
    itens_validados: string[];
    itens_pendentes: string[];
    sugestoes: string[];
  };
  
  // Próxima fase
  fase_anterior: number;
  fase_atual: number;
  total_fases: number;  // Definido após classificação
  especialista: string;
  template: string;
  gate_checklist: string[];
  prompt_sugerido: string;
  contexto_acumulado: string;
}
```

**Fluxo de execução:**

```
proximo(entregavel)
    │
    ├─► 1. Salva entregável em docs/{fase}/
    │
    ├─► 2. Se fase == 1 (PRD):
    │       ├─► Analisa PRD automaticamente
    │       ├─► Extrai: entidades, integrações, segurança, escala
    │       ├─► Calcula pontuação de complexidade
    │       └─► Define fluxo (5, 10 ou 14 fases)
    │
    ├─► 3. Valida gate da fase atual
    │       ├─► Se inválido e forcar=false: retorna erro
    │       └─► Se válido: continua
    │
    ├─► 4. Atualiza estado.json e contexto.md
    │
    └─► 5. Carrega próxima fase (especialista + template + gate)
```

**Critérios de classificação automática (extraídos do PRD):**

| Critério | Como Extrai | Pontos |
|----------|-------------|--------|
| Entidades | Conta substantivos em Funcionalidades | 1-3 |
| Integrações | Busca menções a APIs/sistemas externos | 1-3 |
| Segurança | Palavras-chave: auth, LGPD, compliance | 1-3 |
| Escala | Números de usuários mencionados | 1-3 |
| Tempo | Cronograma mencionado | 1-3 |
| Complexidade | Regras de negócio descritas | 1-3 |

**Resultado:**
- 8-12 pontos → Simples (5 fases)
- 13-18 pontos → Médio (10 fases)
- 19-24 pontos → Complexo (14 fases)

### 5.3 validar_gate

Valida se o gate de saída da fase atual está completo.

```typescript
interface ValidarGateInput {
  fase: number;
  entregavel_path?: string;
}

interface ValidarGateOutput {
  valido: boolean;
  itens_validados: string[];
  itens_pendentes: string[];
  sugestoes: string[];
  pode_avancar: boolean;
}
```

**Validações por fase:**

| Fase | Gate Checklist |
|---|---|
| 1. Produto | Problema definido, Personas, MVP, North Star |
| 2. Requisitos | IDs únicos, Critérios testáveis, RNFs |
| 3. UX | Jornadas, Wireframes, Acessibilidade |
| 4. Modelo | Entidades, Relacionamentos, Regras |
| 5. Arquitetura | C4, Stack justificada, ADRs |
| 6. Segurança | OWASP, Auth, Dados sensíveis |
| 7. Testes | Casos de teste, Cobertura, Ferramentas |
| 8. Backlog | Épicos, Histórias, DoD |
| 9. Código | Padrões, Testes, Lint, Review |
| 10. Deploy | Pipeline, Métricas, Rollback |

### 5.3 salvar (opcional)

Salva conteúdo adicional sem avançar de fase. Usado para rascunhos ou anexos.

```typescript
interface SalvarInput {
  conteudo: string;
  tipo: "rascunho" | "anexo" | "entregavel";
  nome_arquivo?: string;
}

interface SalvarOutput {
  caminho: string;
  tipo: string;
}
```

**Uso:**
- `salvar(conteudo, tipo: "rascunho")` → Salva em `.guia/rascunhos/`
- `salvar(conteudo, tipo: "anexo")` → Salva em `docs/{fase}/anexos/`
- `salvar(conteudo, tipo: "entregavel")` → Salva como entregável (sem validar gate)

> **Nota:** Para o fluxo normal, use `proximo()` que já inclui persistência automática.

### 5.6 status

Retorna status completo do projeto.

```typescript
interface StatusOutput {
  projeto: string;
  nivel_complexidade: "simples" | "medio" | "complexo";
  tipo_fluxo: "novo_projeto" | "feature" | "bug" | "refatoracao";
  fase_atual: number;
  total_fases: number;
  fases_completas: FaseCompleta[];
  gates_status: GateStatus[];
  entregaveis: Record<string, string>;
  proxima_acao: string;
  metricas: {
    tempo_por_fase: Record<number, number>;
    gates_passados: number;
    gates_forcados: number;
  };
}
```

### 5.7 contexto

Retorna contexto completo para injeção em prompts.

```typescript
interface ContextoOutput {
  resumo: string;
  stack: string;
  modelo: string;
  arquitetura: string;
  fase_atual: string;
  nivel_complexidade: string;
  entregaveis_anteriores: {
    nome: string;
    resumo: string;
  }[];
}
```

---

## 5.8 Implementação por Blocos

### implementar_historia

Orquestra a implementação de uma história de usuário em blocos ordenados, carregando contexto automaticamente.

**Suporta padrão Frontend First:**
- Detecta tipo da história (contrato, frontend, backend, integração)
- Valida dependências antes de iniciar
- Carrega especialista correto por tipo

```typescript
interface ImplementarHistoriaInput {
  historia_id?: string;           // Se vazio, seleciona próxima do backlog
  modo?: "analisar" | "iniciar" | "proximo_bloco";
}

interface ImplementarHistoriaOutput {
  // Progresso do backlog
  progresso: {
    features_concluidas: number;
    features_pendentes: number;
    sprint_atual: number;
  };
  
  // Feature pai
  feature: {
    id: string;
    titulo: string;
    fase_atual: "contrato" | "frontend" | "backend" | "integracao";
  };
  
  // História selecionada
  historia: {
    id: string;
    titulo: string;
    tipo: "contrato" | "frontend" | "backend" | "integracao";
    descricao: string;
    criterios_aceite: string[];
  };
  
  // Dependências
  dependencias: {
    historia_id: string;
    tipo: string;
    status: "concluido" | "pendente";
    bloqueante: boolean;
  }[];
  dependencias_ok: boolean;
  
  // Contrato (se tipo != contrato)
  contrato?: {
    path: string;
    endpoints: string[];
    types_gerados: boolean;
  };
  
  // Contexto carregado
  contexto: {
    modelo_dominio: string;
    arquitetura: string;
    design_doc: string;      // Para frontend
    stack_frontend: string;
    stack_backend: string;
  };
  
  // Especialista carregado pelo tipo
  especialista: string;
  
  // Plano de blocos (varia por tipo)
  blocos: BlocoImplementacao[];
  bloco_atual: number;
  
  // Prompt gerado para IA
  prompt_sugerido: string;
}

interface BlocoImplementacao {
  ordem: number;
  tipo: TipoBloco;
  nome: string;
  descricao: string;
  arquivos_afetados: string[];
  prompt_especifico: string;
  status: "pendente" | "em_andamento" | "validando" | "concluido";
  validacao?: ValidacaoBloco;
}

type TipoBloco = 
  // Contrato
  | "schema" | "types_frontend" | "types_backend" | "mock_server"
  // Frontend
  | "component" | "hook" | "store" | "page" | "teste_componente" | "teste_e2e_frontend"
  // Backend
  | "dto" | "entity" | "repository" | "service" | "controller" | "teste_unitario" | "teste_integracao";
```

**Fluxo Frontend First:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│   FLUXO FRONTEND FIRST                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FEAT-001: Criar Pedido                                                │
│                                                                         │
│   ┌─────────────┐                                                       │
│   │ 1. CONTRATO │  CONT-001                                             │
│   │   [schema]  │  → gera types FE + types BE + mock                   │
│   └──────┬──────┘                                                       │
│          │                                                              │
│     ┌────┴────┐                                                         │
│     ▼         ▼                                                         │
│ ┌──────────────┐  ┌──────────────┐                                     │
│ │ 2. FRONTEND  │  │ 3. BACKEND   │  (podem ser paralelos)              │
│ │  US-001-FE   │  │  US-001-BE   │                                     │
│ │  [component] │  │  [dto]       │                                     │
│ │  [hook]      │  │  [entity]    │                                     │
│ │  [page]      │  │  [service]   │                                     │
│ │  [teste]     │  │  [controller]│                                     │
│ └──────┬───────┘  └──────┬───────┘                                     │
│        │                 │                                              │
│        └────────┬────────┘                                              │
│                 ▼                                                       │
│   ┌─────────────────────┐                                               │
│   │ 4. INTEGRAÇÃO       │  INT-001                                      │
│   │   [remover mocks]   │  → conecta frontend com backend real         │
│   │   [teste e2e]       │                                               │
│   └─────────────────────┘                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Blocos por tipo de história:**

| Tipo | Blocos | Especialista |
|------|--------|--------------|
| `contrato` | schema, types_frontend, types_backend, mock_server | Contrato de API |
| `frontend` | component, hook/store, page, teste | Desenvolvimento Frontend |
| `backend` | dto, entity, repository, service, controller, teste | Desenvolvimento Backend |
| `integracao` | remover_mock, teste_e2e | DevOps |

**Validação de dependências:**

```
👤 "Implementar US-001-FE"

🤖 MCP verifica:
   CONT-001 (contrato) → ✅ Concluído
   └── Dependência OK, pode iniciar US-001-FE

👤 "Implementar US-001-BE"

🤖 MCP verifica:
   CONT-001 (contrato) → ✅ Concluído
   └── Dependência OK, pode iniciar US-001-BE

👤 "Implementar INT-001"

🤖 MCP verifica:
   US-001-FE (frontend) → 🔄 Em andamento
   US-001-BE (backend) → ⬜ Pendente
   └── ⛔ BLOQUEADO: dependências não concluídas
```

---

### validar_bloco

Valida automaticamente um bloco de código antes de avançar para o próximo.

```typescript
interface ValidarBlocoInput {
  bloco_id: number;
  caminho_arquivo?: string;       // Caminho do arquivo a validar
  executar_testes?: boolean;      // Default: true
  executar_lint?: boolean;        // Default: true
  verificar_coverage?: boolean;   // Default: true
}

interface ValidarBlocoOutput {
  valido: boolean;
  pode_avancar: boolean;
  
  // Resultados de validação
  testes: {
    executados: boolean;
    passaram: boolean;
    total: number;
    falhas: number;
    detalhes?: string[];
  };
  
  lint: {
    executado: boolean;
    passou: boolean;
    erros: number;
    warnings: number;
    detalhes?: string[];
  };
  
  coverage: {
    verificado: boolean;
    percentual: number;
    minimo_requerido: number;
    passou: boolean;
  };
  
  // Próximas ações
  bloqueios: string[];
  sugestoes: string[];
  comando_correcao?: string;
}
```

**Validações executadas:**

| Validação | Comando (exemplo) | Critério de Aprovação |
|-----------|-------------------|----------------------|
| Testes | `npm test -- --coverage` | 0 falhas |
| Lint | `npm run lint` | 0 erros (warnings ok) |
| Coverage | Extraído do teste | ≥ 80% no arquivo |
| TypeCheck | `npm run typecheck` | 0 erros |

**Uso:**

```
👤 Dev: "Bloco service implementado, pode validar"

🤖 MCP: validar_bloco(bloco_id: 4)

📊 VALIDAÇÃO DO BLOCO: OrderService
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testes: ✅ 5/5 passaram
📝 Lint: ✅ 0 erros, 2 warnings
📈 Coverage: ✅ 87% (mínimo: 80%)
🔍 TypeCheck: ✅ OK

✅ PODE AVANÇAR para bloco 5 (controller)
```

**Se falhar:**

```
📊 VALIDAÇÃO DO BLOCO: OrderService
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testes: ❌ 3/5 passaram
   - calculateTotal: Expected 100, got 90
   - validateOrder: TypeError null
📝 Lint: ✅ OK
📈 Coverage: ⚠️ 65% (mínimo: 80%)

❌ NÃO PODE AVANÇAR

📋 Correções necessárias:
1. Corrigir teste calculateTotal
2. Tratar null em validateOrder
3. Adicionar testes para aumentar coverage

💡 Comando sugerido: npm test -- --watch src/services/order.service.spec.ts
```

---

## 5.10 Tools de Análise

### analisar_seguranca

Analisa o projeto em busca de vulnerabilidades e brechas de segurança.

```typescript
interface AnalisarSegurancaInput {
  escopo?: "codigo" | "arquitetura" | "dependencias" | "completo";
  arquivos?: string[];  // Se vazio, analisa todo o projeto
}

interface AnalisarSegurancaOutput {
  resumo: {
    nivel_risco: "baixo" | "medio" | "alto" | "critico";
    vulnerabilidades_criticas: number;
    vulnerabilidades_altas: number;
    vulnerabilidades_medias: number;
    vulnerabilidades_baixas: number;
  };
  vulnerabilidades: Vulnerabilidade[];
  recomendacoes: Recomendacao[];
  checklist_owasp: OWASPItem[];
  proximos_passos: string[];
}

interface Vulnerabilidade {
  id: string;
  severidade: "critica" | "alta" | "media" | "baixa";
  categoria: string;  // OWASP category
  titulo: string;
  descricao: string;
  arquivo?: string;
  linha?: number;
  codigo_afetado?: string;
  recomendacao: string;
  referencia: string;  // Link OWASP/CWE
}

interface OWASPItem {
  id: string;  // A01, A02, etc
  nome: string;
  status: "ok" | "atencao" | "vulneravel" | "nao_verificado";
  detalhes: string;
}
```

**Análises realizadas:**
- **Código**: SQL Injection, XSS, CSRF, hardcoded secrets, validação de input
- **Dependências**: Pacotes com CVEs conhecidas
- **Arquitetura**: Autenticação, autorização, CORS, rate limiting
- **Configuração**: Headers de segurança, TLS, variáveis de ambiente

**Uso:**
```
> analisar_seguranca(escopo: "completo")

📊 ANÁLISE DE SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nível de Risco: MÉDIO 🟡

🔴 Críticas: 0
🟠 Altas: 2
🟡 Médias: 5
🟢 Baixas: 3

VULNERABILIDADES ENCONTRADAS:

[ALTA] SEC-001: Possível SQL Injection
📁 src/repositories/user.repository.ts:45
💡 Use queries parametrizadas em vez de concatenação

[ALTA] SEC-002: Secret hardcoded
📁 src/config/jwt.ts:12
💡 Mova para variável de ambiente

CHECKLIST OWASP TOP 10:
✅ A01: Broken Access Control - OK
⚠️ A02: Cryptographic Failures - Atenção
❌ A03: Injection - Vulnerável
...
```

---

### analisar_performance

Analisa o projeto em busca de problemas de performance e oportunidades de otimização.

```typescript
interface AnalisarPerformanceInput {
  escopo?: "codigo" | "queries" | "frontend" | "arquitetura" | "completo";
  arquivos?: string[];
}

interface AnalisarPerformanceOutput {
  resumo: {
    nivel_otimizacao: "otimizado" | "bom" | "necessita_atencao" | "problematico";
    issues_criticos: number;
    issues_importantes: number;
    issues_sugestoes: number;
  };
  issues: PerformanceIssue[];
  metricas_estimadas: MetricasEstimadas;
  recomendacoes: RecomendacaoPerformance[];
  proximos_passos: string[];
}

interface PerformanceIssue {
  id: string;
  severidade: "critico" | "importante" | "sugestao";
  categoria: "database" | "memory" | "cpu" | "network" | "bundle" | "cache";
  titulo: string;
  descricao: string;
  arquivo?: string;
  linha?: number;
  codigo_afetado?: string;
  impacto_estimado: string;
  solucao: string;
  exemplo_correcao?: string;
}

interface MetricasEstimadas {
  latencia_p95_estimada: string;
  throughput_estimado: string;
  memory_footprint: string;
  pontos_de_gargalo: string[];
}

interface RecomendacaoPerformance {
  prioridade: number;
  categoria: string;
  descricao: string;
  ganho_estimado: string;
  esforco: "baixo" | "medio" | "alto";
}
```

**Análises realizadas:**
- **Database**: N+1 queries, falta de índices, queries não otimizadas
- **Memory**: Memory leaks, objetos grandes, falta de cleanup
- **CPU**: Loops ineficientes, cálculos redundantes
- **Network**: Payloads grandes, muitas requisições, falta de cache
- **Frontend**: Bundle size, lazy loading, renderização
- **Cache**: Oportunidades de caching, estratégias

**Uso:**
```
> analisar_performance(escopo: "completo")

📊 ANÁLISE DE PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nível: NECESSITA ATENÇÃO 🟡

🔴 Críticos: 1
🟠 Importantes: 4
🟢 Sugestões: 8

ISSUES ENCONTRADOS:

[CRÍTICO] PERF-001: N+1 Query detectada
📁 src/services/order.service.ts:67
⚡ Impacto: +500ms por request com muitos itens
💡 Use eager loading: include: { items: true }

[IMPORTANTE] PERF-002: Falta de índice
📁 Database: orders.created_at
⚡ Impacto: Full table scan em listagens
💡 CREATE INDEX idx_orders_created_at ON orders(created_at);

MÉTRICAS ESTIMADAS:
- Latência p95: ~800ms (alvo: <200ms)
- Gargalos: Database queries, falta de cache

RECOMENDAÇÕES PRIORIZADAS:
1. 🎯 Adicionar Redis cache (ganho: -300ms, esforço: médio)
2. 🎯 Corrigir N+1 queries (ganho: -400ms, esforço: baixo)
```

---

### analisar_qualidade

Analisa qualidade do código, arquitetura e boas práticas.

```typescript
interface AnalisarQualidadeInput {
  escopo?: "codigo" | "arquitetura" | "testes" | "documentacao" | "completo";
  arquivos?: string[];
}

interface AnalisarQualidadeOutput {
  resumo: {
    score_geral: number;  // 0-100
    score_codigo: number;
    score_arquitetura: number;
    score_testes: number;
    score_documentacao: number;
  };
  issues: QualidadeIssue[];
  metricas: MetricasQualidade;
  divida_tecnica: DebitTecnico[];
  recomendacoes: string[];
}

interface QualidadeIssue {
  id: string;
  categoria: "complexidade" | "duplicacao" | "naming" | "solid" | "padrao" | "teste" | "doc";
  severidade: "alta" | "media" | "baixa";
  titulo: string;
  descricao: string;
  arquivo?: string;
  linhas?: string;
  sugestao: string;
}

interface MetricasQualidade {
  linhas_de_codigo: number;
  cobertura_testes: number;
  complexidade_ciclomatica_media: number;
  duplicacao_percentual: number;
  arquivos_sem_teste: string[];
  funcoes_complexas: { nome: string; complexidade: number }[];
}

interface DebitTecnico {
  area: string;
  descricao: string;
  impacto: "alto" | "medio" | "baixo";
  esforco_estimado: string;
  prioridade: number;
}
```

**Análises realizadas:**
- **Código**: Complexidade, duplicação, naming, SOLID
- **Arquitetura**: Separação de concerns, dependências, padrões
- **Testes**: Cobertura, qualidade, edge cases
- **Documentação**: README, comentários, API docs

**Uso:**
```
> analisar_qualidade(escopo: "completo")

📊 ANÁLISE DE QUALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score Geral: 72/100 🟡

📊 Código: 78/100
🏗️ Arquitetura: 85/100  
🧪 Testes: 55/100
📚 Documentação: 60/100

MÉTRICAS:
- LOC: 12,450
- Cobertura: 55% (alvo: >80%)
- Complexidade média: 8.2 (alvo: <10)
- Duplicação: 12% (alvo: <5%)

ISSUES ENCONTRADOS:

[ALTA] QUAL-001: Função muito complexa
📁 src/services/pricing.service.ts:calculateTotal()
📊 Complexidade: 25 (alvo: <10)
💡 Extraia em funções menores

[MEDIA] QUAL-002: Código duplicado
📁 src/controllers/*.ts
📊 45 linhas duplicadas em 3 arquivos
💡 Extraia para um helper/decorator

DÉBITO TÉCNICO:
1. Aumentar cobertura de testes (esforço: 2 dias)
2. Refatorar pricing.service (esforço: 4h)
3. Documentar API (esforço: 1 dia)
```

---

### analisar_acessibilidade

Analisa problemas de acessibilidade no frontend.

```typescript
interface AnalisarAcessibilidadeInput {
  arquivos?: string[];  // Arquivos de componentes
  nivel_wcag?: "A" | "AA" | "AAA";
}

interface AnalisarAcessibilidadeOutput {
  resumo: {
    nivel_conformidade: "nao_conforme" | "parcial" | "conforme";
    violacoes_nivel_a: number;
    violacoes_nivel_aa: number;
    violacoes_nivel_aaa: number;
  };
  violacoes: ViolacaoAcessibilidade[];
  checklist_wcag: WCAGItem[];
  recomendacoes: string[];
}

interface ViolacaoAcessibilidade {
  id: string;
  nivel: "A" | "AA" | "AAA";
  criterio: string;  // Ex: "1.1.1 Non-text Content"
  titulo: string;
  arquivo: string;
  elemento?: string;
  problema: string;
  solucao: string;
  impacto_usuario: string;
}
```

---

### analisar_dependencias

Analisa dependências do projeto em busca de vulnerabilidades, atualizações e licenças.

```typescript
interface AnalisarDependenciasInput {
  tipo?: "seguranca" | "atualizacoes" | "licencas" | "completo";
}

interface AnalisarDependenciasOutput {
  resumo: {
    total_dependencias: number;
    vulnerabilidades: number;
    desatualizadas: number;
    licencas_problematicas: number;
  };
  vulnerabilidades: VulnerabilidadeDep[];
  atualizacoes_disponiveis: Atualizacao[];
  licencas: LicencaInfo[];
  dependencias_nao_utilizadas: string[];
}

interface VulnerabilidadeDep {
  pacote: string;
  versao_atual: string;
  severidade: "critica" | "alta" | "media" | "baixa";
  cve: string;
  descricao: string;
  versao_corrigida: string;
}

interface Atualizacao {
  pacote: string;
  versao_atual: string;
  versao_mais_recente: string;
  tipo: "major" | "minor" | "patch";
  breaking_changes?: boolean;
}
```

---

### sugerir_melhorias

Analisa o projeto completo e sugere melhorias priorizadas.

```typescript
interface SugerirMelhoriasInput {
  foco?: "seguranca" | "performance" | "qualidade" | "ux" | "devops" | "geral";
  limite?: number;  // Número máximo de sugestões
}

interface SugerirMelhoriasOutput {
  analise_geral: {
    pontos_fortes: string[];
    pontos_de_atencao: string[];
    riscos: string[];
  };
  melhorias: Melhoria[];
  roadmap_sugerido: RoadmapItem[];
}

interface Melhoria {
  id: string;
  categoria: "seguranca" | "performance" | "qualidade" | "ux" | "devops" | "arquitetura";
  prioridade: number;  // 1-5
  titulo: string;
  descricao: string;
  problema_atual: string;
  solucao_proposta: string;
  beneficios: string[];
  esforco: "baixo" | "medio" | "alto";
  impacto: "baixo" | "medio" | "alto";
  arquivos_afetados?: string[];
  exemplo?: string;
}

interface RoadmapItem {
  fase: string;
  prazo: string;
  melhorias: string[];  // IDs das melhorias
  objetivo: string;
}
```

**Uso:**
```
> sugerir_melhorias(foco: "geral", limite: 10)

📊 ANÁLISE COMPLETA DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PONTOS FORTES:
- Arquitetura bem estruturada (hexagonal)
- Boa separação de concerns
- CI/CD configurado

⚠️ PONTOS DE ATENÇÃO:
- Cobertura de testes abaixo do ideal (55%)
- Falta de caching
- Documentação incompleta

🔴 RISCOS:
- 2 vulnerabilidades de segurança não tratadas
- N+1 queries em fluxos críticos

TOP 10 MELHORIAS RECOMENDADAS:

┌───┬──────────┬───────────────────────────────┬──────────┬─────────┐
│ # │ Categoria│ Melhoria                      │ Impacto  │ Esforço │
├───┼──────────┼───────────────────────────────┼──────────┼─────────┤
│ 1 │ 🔒 Seg   │ Corrigir SQL Injection        │ Alto     │ Baixo   │
│ 2 │ ⚡ Perf  │ Implementar cache Redis       │ Alto     │ Médio   │
│ 3 │ 🔒 Seg   │ Remover secrets hardcoded     │ Alto     │ Baixo   │
│ 4 │ ⚡ Perf  │ Corrigir N+1 queries          │ Alto     │ Baixo   │
│ 5 │ 🧪 Qual  │ Aumentar cobertura de testes  │ Médio    │ Alto    │
│ 6 │ 📊 Obs   │ Implementar logging estrutur. │ Médio    │ Médio   │
│ 7 │ 🏗️ Arq  │ Adicionar rate limiting       │ Médio    │ Baixo   │
│ 8 │ 📚 Doc   │ Documentar API (OpenAPI)      │ Médio    │ Médio   │
│ 9 │ ⚡ Perf  │ Lazy loading no frontend      │ Baixo    │ Baixo   │
│10 │ ♿ A11y  │ Melhorar contraste de cores   │ Baixo    │ Baixo   │
└───┴──────────┴───────────────────────────────┴──────────┴─────────┘

ROADMAP SUGERIDO:

📅 Semana 1-2: Quick Wins Críticos
   - Corrigir vulnerabilidades (#1, #3)
   - Corrigir N+1 queries (#4)

📅 Semana 3-4: Performance
   - Implementar cache (#2)
   - Rate limiting (#7)

📅 Semana 5-6: Qualidade
   - Aumentar cobertura (#5)
   - Documentação (#8)
```

---

### gerar_relatorio

Gera um relatório consolidado de todas as análises.

```typescript
interface GerarRelatorioInput {
  formato?: "markdown" | "html" | "json";
  incluir?: ("seguranca" | "performance" | "qualidade" | "acessibilidade" | "dependencias")[];
  salvar_em?: string;
}

interface GerarRelatorioOutput {
  caminho: string;
  resumo_executivo: string;
  link: string;
}
```

Gera um relatório completo em `docs/analises/relatorio-YYYY-MM-DD.md` contendo:
- Resumo executivo
- Métricas consolidadas
- Issues por categoria
- Gráficos (em markdown)
- Roadmap de melhorias
- Comparação com análise anterior (se houver)

---

```

### 5.10 executar_historia

Automatiza o ciclo de desenvolvimento: analisa progresso, lê backlog, seleciona próxima história e guia implementação.

```typescript
interface ExecutarHistoriaInput {
  historia_id?: string;           // Se vazio, seleciona próxima do backlog
  modo?: "analisar" | "implementar" | "testar" | "revisar" | "completo";
  confirmar_avancos?: boolean;    // Se true, pede confirmação a cada bloco
}

interface ExecutarHistoriaOutput {
  // Análise do Progresso
  progresso: {
    historias_concluidas: number;
    historias_pendentes: number;
    sprint_atual: number;
    velocidade_media: number;
    ultima_historia_concluida?: string;
  };
  
  // História Selecionada
  historia: {
    id: string;
    titulo: string;
    descricao: string;
    criterios_aceite: CriterioAceite[];
    regras_negocio: string[];
    subtarefas: Subtarefa[];
    dependencias_ok: boolean;
    endpoints_afetados: Endpoint[];
    impacto_modelo: ImpactoModelo;
  };
  
  // Contexto Carregado
  contexto: {
    modelo_dominio: string;       // Resumo de docs/04-modelo/
    arquitetura: string;          // Resumo de docs/05-arquitetura/
    stack: string;
    padroes_codigo: string[];
  };
  
  // Plano de Execução
  plano_execucao: BlocoExecucao[];
  
  // Prompt Gerado (para IA)
  prompt_sugerido: string;
}

interface BlocoExecucao {
  ordem: number;
  tipo: "service" | "controller" | "repository" | "migration" | "dto" | "teste_unitario" | "teste_integracao";
  descricao: string;
  arquivos_afetados: string[];
  prompt_bloco: string;           // Prompt específico para este bloco
  status: "pendente" | "em_andamento" | "concluido";
}

interface CriterioAceite {
  id: string;
  cenario: string;
  gherkin: string;
  status: "pendente" | "implementado" | "testado";
}

interface Subtarefa {
  id: string;
  descricao: string;
  status: "pendente" | "concluido";
  bloco_relacionado?: number;
}
```

**Fluxo de Execução:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXECUTAR_HISTORIA: FLUXO COMPLETO                         │
└─────────────────────────────────────────────────────────────────────────────┘

     1. ANALISAR                2. PREPARAR                 3. IMPLEMENTAR
     ═══════════               ═══════════                 ═══════════════
          │                          │                           │
          ▼                          ▼                           ▼
   ┌─────────────┐           ┌─────────────┐            ┌─────────────┐
   │ Ler backlog │           │ Carregar    │            │ Gerar bloco │
   │ e progresso │           │ contexto    │            │ de código   │
   └──────┬──────┘           └──────┬──────┘            └──────┬──────┘
          │                          │                         │
          ▼                          ▼                         ▼
   ┌─────────────┐           ┌─────────────┐            ┌─────────────┐
   │ Selecionar  │           │ Modelo +    │            │ Service →   │
   │ próxima US  │           │ Arquitetura │            │ Controller →│
   └──────┬──────┘           └──────┬──────┘            │ Repository  │
          │                          │                  └──────┬──────┘
          ▼                          ▼                         │
   ┌─────────────┐           ┌─────────────┐                   │
   │ Validar     │           │ Gerar plano │                   │
   │ dependências│           │ de blocos   │                   │
   └─────────────┘           └─────────────┘                   │
                                                               │
     4. TESTAR                  5. REVISAR                     │
     ═════════                  ═════════                      │
          │                          │                         │
          ▼                          ▼                         │
   ┌─────────────┐           ┌─────────────┐                   │
   │ Gerar tests │           │ Code review │◄──────────────────┘
   │ unitários   │           │ automático  │
   └──────┬──────┘           └──────┬──────┘
          │                          │
          ▼                          ▼
   ┌─────────────┐           ┌─────────────┐
   │ Gerar tests │           │ Atualizar   │
   │ integração  │           │ status US   │
   └─────────────┘           └─────────────┘
```

**Uso:**

```
> executar_historia()

📋 ANÁLISE DO PROGRESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sprint: 2 | Histórias: 5/8 concluídas | Velocidade: 13 pts/sprint

📌 PRÓXIMA HISTÓRIA SELECIONADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
US006 - Enviar notificação de confirmação de agendamento
Épico: E001 - Agendamento Online
Pontos: 3 | Prioridade: P0

Como cliente,
Quero receber confirmação por WhatsApp após agendar,
Para ter certeza que meu horário está reservado.

✅ DEPENDÊNCIAS OK
- US002 (Cadastro de agendamento) ✓ Concluída
- Integração WhatsApp ✓ Configurada

📊 CONTEXTO CARREGADO
- Modelo: Agendamento, Cliente, Notificacao
- Arquitetura: NestJS + Bull Queue + WhatsApp API
- Stack: TypeScript, PostgreSQL, Redis

🔨 PLANO DE EXECUÇÃO (6 blocos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 📦 [DTO] CreateNotificacaoDto, NotificacaoResponseDto
2. 🏛️ [Service] NotificacaoService.enviarConfirmacao()
3. 📮 [Queue] AgendamentoCreatedJob → dispara notificação
4. 🔌 [Integration] WhatsAppService.sendMessage()
5. 🧪 [Teste Unit] NotificacaoService.spec.ts
6. 🧪 [Teste Integ] AgendamentoFlow.e2e.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deseja iniciar a implementação do bloco 1? (y/n)
```

**Execução por Bloco:**

```
> executar_historia(modo: "implementar")

🔨 BLOCO 1/6: DTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 PROMPT GERADO:

Contexto:
- Stack: NestJS + TypeScript
- Entidade Notificacao: { id, agendamentoId, tipo, status, enviadoEm }
- Padrão: class-validator para validação

Crie os DTOs:
1. CreateNotificacaoDto - para criação de notificação
2. NotificacaoResponseDto - para resposta da API

Inclua:
- Decorators de validação (@IsString, @IsUUID, etc)
- Documentação Swagger (@ApiProperty)
- Transformações se necessário

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Aguardando código do usuário/IA...]

Após receber, validar:
- [ ] DTOs criados corretamente
- [ ] Validações adequadas
- [ ] Tipos consistentes com modelo

Próximo bloco: Service
```

---

### 5.8 nova_feature (atualizado)

```typescript
interface NovaFeatureInput {
  descricao: string;
  impacto_estimado?: "baixo" | "medio" | "alto";
}

interface NovaFeatureOutput {
  contexto_projeto: string;
  modelo_atual: string;      // Lê modelo-dominio.md
  arquitetura_atual: string; // Lê arquitetura.md
  analise_impacto: {
    entidades_afetadas: string[];
    endpoints_novos: string[];
    endpoints_modificados: string[];
  };
  fase_atual: number;
  especialista: string;
}
```

---

## 6. Definição dos Fluxos

### 6.1 Fluxo: Projeto Simples (5 fases)

Para projetos com pontuação 8-12.

```typescript
const FLUXO_SIMPLES = [
  {
    fase: 1,
    nome: "Produto (Simplificado)",
    especialista: "Especialista em Gestão de Produto.md",
    template: "PRD.md",
    entregavel: "docs/01-produto/PRD.md",
    gate: ["problema_definido", "mvp_listado"]
  },
  {
    fase: 2,
    nome: "Requisitos Básicos",
    especialista: "Especialista em Engenharia de Requisitos com IA.md",
    template: "requisitos.md",
    entregavel: "docs/02-requisitos/requisitos.md",
    contexto_necessario: ["docs/01-produto/PRD.md"],
    gate: ["requisitos_funcionais", "criterios_aceite"]
  },
  {
    fase: 3,
    nome: "Arquitetura Simples",
    especialista: "Especialista em Arquitetura de Software.md",
    template: "arquitetura.md",
    entregavel: "docs/05-arquitetura/arquitetura.md",
    contexto_necessario: ["docs/02-requisitos/requisitos.md"],
    gate: ["stack_definida", "diagrama_basico"]
  },
  {
    fase: 4,
    nome: "Implementação",
    especialista: "Especialista em Desenvolvimento e Vibe Coding Estruturado.md",
    entregavel: "src/",
    contexto_necessario: ["docs/05-arquitetura/arquitetura.md"],
    gate: ["codigo_funcional", "testes_unitarios"]
  },
  {
    fase: 5,
    nome: "Deploy",
    especialista: "Especialista em DevOps e Infraestrutura.md",
    entregavel: ["Dockerfile", ".github/workflows/"],
    gate: ["pipeline_funcionando", "deploy_staging"]
  }
];
```

### 6.2 Fluxo: Projeto Médio (10 fases)

Para projetos com pontuação 13-18.

```typescript
const FLUXO_MEDIO = [
  {
    fase: 1,
    nome: "Definição do Produto",
    especialista: "Especialista em Gestão de Produto.md",
    template: "PRD.md",
    entregavel: "docs/01-produto/PRD.md",
    prompt: "prompts/produto/discovery-inicial.txt",
    gate: ["problema_claro", "personas_2plus", "mvp_priorizado", "north_star"]
  },
  {
    fase: 2,
    nome: "Engenharia de Requisitos",
    especialista: "Especialista em Engenharia de Requisitos com IA.md",
    template: "requisitos.md",
    entregavel: "docs/02-requisitos/requisitos.md",
    contexto_necessario: ["docs/01-produto/PRD.md"],
    gate: ["ids_unicos", "criterios_testaveis", "rnfs_definidos"]
  },
  {
    fase: 3,
    nome: "Design de UX",
    especialista: "Especialista em UX Design.md",
    template: "design-doc.md",
    entregavel: "docs/03-ux/design-doc.md",
    contexto_necessario: ["docs/01-produto/PRD.md", "docs/02-requisitos/requisitos.md"],
    gate: ["jornadas_mapeadas", "wireframes", "acessibilidade"]
  },
  {
    fase: 4,
    nome: "Modelagem de Domínio",
    especialista: "Especialista em Modelagem e Arquitetura de Domínio com IA.md",
    template: "modelo-dominio.md",
    entregavel: "docs/04-modelo/modelo-dominio.md",
    contexto_necessario: ["docs/02-requisitos/requisitos.md"],
    gate: ["entidades_identificadas", "relacionamentos", "regras_negocio"]
  },
  {
    fase: 5,
    nome: "Arquitetura de Software",
    especialista: "Especialista em Arquitetura de Software.md",
    template: "arquitetura.md",
    entregavel: "docs/05-arquitetura/arquitetura.md",
    prompt: "prompts/arquitetura/c4-completo.txt",
    contexto_necessario: ["docs/02-requisitos/requisitos.md", "docs/04-modelo/modelo-dominio.md"],
    gate: ["c4_nivel_1_2", "stack_justificada", "adrs"]
  },
  {
    fase: 6,
    nome: "Segurança",
    especialista: "Especialista em Segurança da Informação.md",
    template: "checklist-seguranca.md",
    entregavel: "docs/06-seguranca/checklist-seguranca.md",
    contexto_necessario: ["docs/05-arquitetura/arquitetura.md"],
    gate: ["owasp_revisado", "auth_definida", "dados_sensiveis"]
  },
  {
    fase: 7,
    nome: "Plano de Testes",
    especialista: "Especialista em Análise de Testes.md",
    template: "plano-testes.md",
    entregavel: "docs/07-testes/plano-testes.md",
    contexto_necessario: ["docs/02-requisitos/requisitos.md"],
    gate: ["casos_por_requisito", "piramide_definida", "ferramentas"]
  },
  {
    fase: 8,
    nome: "Plano de Execução",
    especialista: "Especialista em Plano de Execução com IA.md",
    template: "backlog.md",
    entregavel: "docs/08-backlog/backlog.md",
    contexto_necessario: ["docs/02-requisitos/requisitos.md", "docs/05-arquitetura/arquitetura.md"],
    gate: ["epicos_priorizados", "historias_com_ca", "dod_definido"]
  },
  {
    fase: 9,
    nome: "Implementação",
    especialista: "Especialista em Desenvolvimento e Vibe Coding Estruturado.md",
    entregavel: "src/",
    contexto_necessario: ["docs/04-modelo/modelo-dominio.md", "docs/05-arquitetura/arquitetura.md", "docs/08-backlog/backlog.md"],
    gate: ["codigo_padroes", "testes_80_percent", "lint_sem_erros", "review_aprovado"]
  },
  {
    fase: 10,
    nome: "DevOps e Deploy",
    especialista: "Especialista em DevOps e Infraestrutura.md",
    entregavel: [".github/workflows/", "Dockerfile", "infra/"],
    contexto_necessario: ["docs/05-arquitetura/arquitetura.md"],
    gate: ["dockerfile_otimizado", "pipeline_ci_cd", "metricas_logs", "rollback_testado"]
  }
];
```

### 6.3 Fluxo: Projeto Complexo (14 fases)

Para projetos com pontuação 19-24.

```typescript
const FLUXO_COMPLEXO = [
  // Fases 1-10: Mesmo que FLUXO_MEDIO
  ...FLUXO_MEDIO,
  
  // Fases adicionais para projetos complexos
  {
    fase: 11,
    nome: "Arquitetura Avançada",
    especialista: "Especialista em Arquitetura Avançada.md",
    entregavel: "docs/05-arquitetura/arquitetura-ddd.md",
    prompt: "prompts/arquitetura/ddd-bounded-contexts.txt",
    contexto_necessario: ["docs/04-modelo/modelo-dominio.md", "docs/05-arquitetura/arquitetura.md"],
    gate: ["bounded_contexts", "aggregates", "domain_events", "context_map"]
  },
  {
    fase: 12,
    nome: "Performance e Escalabilidade",
    especialista: "Especialista em Performance e Escalabilidade.md",
    entregavel: "docs/performance/analise-performance.md",
    prompt: "prompts/escalabilidade/analise-performance.txt",
    contexto_necessario: ["docs/05-arquitetura/arquitetura.md"],
    gate: ["slos_definidos", "garrafas_identificadas", "cache_strategy", "load_test_plan"]
  },
  {
    fase: 13,
    nome: "Observabilidade",
    especialista: "Especialista em Observabilidade.md",
    entregavel: "docs/observability/estrategia.md",
    prompt: "prompts/observabilidade/estrategia.txt",
    contexto_necessario: ["docs/05-arquitetura/arquitetura.md"],
    gate: ["logging_estruturado", "metricas_red", "tracing", "alertas_slos", "runbooks"]
  },
  {
    fase: 14,
    nome: "Disaster Recovery",
    especialista: "Especialista em DevOps e Infraestrutura.md",
    entregavel: "docs/infra/disaster-recovery.md",
    contexto_necessario: ["docs/05-arquitetura/arquitetura.md", "infra/"],
    gate: ["backup_strategy", "rto_rpo_definidos", "failover_testado"]
  }
];
```

### 6.4 Fluxos Secundários

```typescript
const FLUXO_NOVA_FEATURE = [
  { fase: 1, nome: "Análise de Impacto", especialista: "Guia de Adição de Novas Funcionalidades.md", contexto: ["modelo", "arquitetura"] },
  { fase: 2, nome: "Refinamento de Requisitos", especialista: "Especialista em Engenharia de Requisitos.md" },
  { fase: 3, nome: "Atualização de Modelo", especialista: "Especialista em Modelagem de Domínio.md" },
  { fase: 4, nome: "Implementação", especialista: "Especialista em Desenvolvimento.md" },
  { fase: 5, nome: "Testes", especialista: "Especialista em Análise de Testes.md" },
  { fase: 6, nome: "Deploy", especialista: "Especialista em DevOps.md" }
];

const FLUXO_CORRIGIR_BUG = [
  { fase: 1, nome: "Coleta de Contexto", especialista: "Guia de Debugging com IA.md" },
  { fase: 2, nome: "Análise de Causa", especialista: "Guia de Debugging com IA.md" },
  { fase: 3, nome: "Implementação do Fix", especialista: "Especialista em Desenvolvimento.md" },
  { fase: 4, nome: "Teste de Regressão", especialista: "Especialista em Análise de Testes.md" },
  { fase: 5, nome: "Validação de Segurança", especialista: "Especialista em Segurança.md" }
];

const FLUXO_REFATORAR = [
  { fase: 1, nome: "Análise do Legado", especialista: "Guia de Refatoração de Código Legado.md" },
  { fase: 2, nome: "Testes de Caracterização", especialista: "Especialista em Análise de Testes.md" },
  { fase: 3, nome: "Arquitetura Alvo", especialista: "Especialista em Arquitetura de Software.md" },
  { fase: 4, nome: "Refatoração Incremental", especialista: "Especialista em Desenvolvimento.md" },
  { fase: 5, nome: "Validação de Segurança", especialista: "Especialista em Segurança.md" },
  { fase: 6, nome: "Deploy", especialista: "Especialista em DevOps.md" }
];
```

---

## 7. Sistema de Gates

### 7.1 Estrutura do Gate

```typescript
interface Gate {
  fase: number;
  nome: string;
  checklist: GateItem[];
  obrigatorios: string[];  // IDs que bloqueiam avanço
  opcionais: string[];     // IDs que geram warning
}

interface GateItem {
  id: string;
  descricao: string;
  validador: (contexto: Contexto) => boolean | Promise<boolean>;
  auto_fix?: (contexto: Contexto) => string;  // Sugestão de correção
}
```

### 7.2 Exemplo de Validador

```typescript
const gateProducto: Gate = {
  fase: 1,
  nome: "Gate: Definição do Produto",
  checklist: [
    {
      id: "problema_claro",
      descricao: "Problema claramente definido",
      validador: (ctx) => ctx.prd.includes("## Problema") && ctx.prd.match(/problema/gi).length > 2
    },
    {
      id: "personas_2plus",
      descricao: "Pelo menos 2 personas documentadas",
      validador: (ctx) => (ctx.prd.match(/### Persona/g) || []).length >= 2
    },
    {
      id: "mvp_priorizado",
      descricao: "MVP com 3-5 funcionalidades priorizadas",
      validador: (ctx) => ctx.prd.includes("## 5. Escopo do MVP") && ctx.prd.includes("### 5.1 Must-Have")
    },
    {
      id: "north_star",
      descricao: "North Star Metric definida",
      validador: (ctx) => ctx.prd.includes("North Star")
    }
  ],
  obrigatorios: ["problema_claro", "mvp_priorizado"],
  opcionais: ["personas_2plus", "north_star"]
};
```

---

## 8. Estado do Projeto

### 8.1 Estrutura do estado.json

```json
{
  "projeto_id": "uuid",
  "nome": "meu-saas",
  "nivel_complexidade": "medio",
  "tipo_fluxo": "novo_projeto",
  "criado_em": "2024-12-19T10:00:00Z",
  "atualizado_em": "2024-12-19T12:30:00Z",
  "fase_atual": 5,
  "total_fases": 10,
  "fases": [
    {
      "numero": 1,
      "nome": "Definição do Produto",
      "status": "completa",
      "entregavel": "docs/01-produto/PRD.md",
      "template_usado": "PRD.md",
      "gate": {
        "validado_em": "2024-12-19T10:15:00Z",
        "itens_passou": ["problema_claro", "personas_2plus", "mvp_priorizado", "north_star"],
        "itens_pulados": [],
        "forcado": false
      },
      "completado_em": "2024-12-19T10:15:00Z"
    }
  ],
  "contexto": {
    "stack": "Node.js + NestJS + PostgreSQL",
    "descricao": "Sistema de agendamento para salões de beleza",
    "entidades_principais": ["Usuario", "Agendamento", "Servico", "Profissional"]
  },
  "metricas": {
    "tempo_total_segundos": 9000,
    "tempo_por_fase": { "1": 900, "2": 1200 },
    "gates_passados": 4,
    "gates_forcados": 0
  }
}
```

### 8.2 Estrutura do contexto.md

```markdown
# Contexto: [Nome do Projeto]

## Visão Geral
[Resumo de 2-3 linhas gerado automaticamente do PRD]

## Nível de Complexidade
**Médio** (10 fases) - Pontuação: 15/24

## Stack Tecnológica
- Backend: NestJS
- Frontend: Next.js
- Banco: PostgreSQL
- Cache: Redis
- Infra: Docker + AWS

## Modelo de Domínio
| Entidade | Campos Principais | Relacionamentos |
|---|---|---|
| Usuario | id, nome, email, role | 1:N Agendamento |
| Agendamento | id, usuarioId, servicoId, dataHora, status | N:1 Usuario, N:1 Servico |

## Arquitetura
Hexagonal Architecture com módulos por bounded context.
Ver: [docs/05-arquitetura/arquitetura.md]

## Fase Atual
- Fluxo: Novo Projeto (Médio)
- Fase: 5/10 - Arquitetura de Software
- Última atualização: 2024-12-19

## Entregáveis Completos
| Fase | Artefato | Gate |
|---|---|---|
| 1 | [PRD.md](docs/01-produto/PRD.md) | ✅ 4/4 |
| 2 | [requisitos.md](docs/02-requisitos/requisitos.md) | ✅ 3/3 |
| 3 | [design-doc.md](docs/03-ux/design-doc.md) | ✅ 3/3 |
| 4 | [modelo-dominio.md](docs/04-modelo/modelo-dominio.md) | ✅ 3/3 |
| 5 | arquitetura.md | 🔄 Em andamento |

## Próxima Ação
Completar arquitetura C4 e definir ADRs para decisões críticas.
```

---

## 9. Estrutura de Pastas do Projeto Gerado

```
meu-projeto/
├── .guia/                          # Metadados do MCP
│   ├── estado.json                 # Estado do fluxo
│   └── contexto.md                 # Resumo executivo
│
├── docs/                           # Entregáveis por fase
│   ├── 01-produto/
│   │   └── PRD.md
│   ├── 02-requisitos/
│   │   ├── requisitos.md
│   │   └── criterios-aceite.md
│   ├── 03-ux/
│   │   ├── design-doc.md
│   │   ├── wireframes/
│   │   └── fluxos/
│   ├── 04-modelo/
│   │   └── modelo-dominio.md
│   ├── 05-arquitetura/
│   │   ├── arquitetura.md
│   │   └── adr/
│   │       ├── 001-escolha-stack.md
│   │       └── 002-autenticacao.md
│   ├── 06-seguranca/
│   │   └── checklist-seguranca.md
│   ├── 07-testes/
│   │   └── plano-testes.md
│   ├── 08-backlog/
│   │   ├── backlog.md
│   │   └── historias/
│   ├── performance/                # Só em projetos complexos
│   │   └── analise-performance.md
│   └── observability/              # Só em projetos complexos
│       ├── estrategia.md
│       └── runbooks/
│
├── src/                            # Código fonte
├── tests/                          # Testes
├── infra/                          # IaC (Terraform, etc)
├── .github/
│   └── workflows/
│       └── ci.yml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 10. Implementação

### 10.1 Dependências

```json
{
  "name": "mcp-maestro",
  "version": "2.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0",
    "uuid": "^9.0.0",
    "glob": "^10.0.0",
    "gray-matter": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "tsx": "^4.0.0"
  }
}
```

### 10.2 Entry Point (index.ts)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new Server(
  { name: "maestro", version: "2.0.0" },
  { 
    capabilities: { 
      resources: { subscribe: true },
      tools: {},
      prompts: {}
    }
  }
);

// Registra handlers
registerResources(server);
registerTools(server);
registerPrompts(server);

// Inicia servidor
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("MCP Maestro v2.0 started");
```

---

## 11. Configuração do Cliente

### 11.1 Claude Desktop (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "maestro": {
      "command": "node",
      "args": ["/caminho/para/mcp-maestro/dist/index.js"],
      "env": {
        "MAESTRO_PATH": "/caminho/para/Maestro",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 11.2 Cursor (settings.json)

```json
{
  "mcp.servers": {
    "maestro": {
      "command": "node",
      "args": ["C:/caminho/para/mcp-maestro/dist/index.js"],
      "env": {
        "MAESTRO_PATH": "C:/caminho/para/Maestro"
      }
    }
  }
}
```

### 11.3 Variáveis de Ambiente

| Variável | Descrição | Default |
|---|---|---|
| `MAESTRO_PATH` | Caminho para o Maestro | `./maestro` |
| `PROJETO_PATH` | Caminho do projeto atual | `cwd()` |
| `LOG_LEVEL` | Nível de log (debug, info, warn, error) | `info` |
| `GATE_STRICT` | Se true, bloqueia avanço com gate incompleto | `true` |
| `SYNC_ENABLED` | Habilita sincronização remota | `false` |
| `SYNC_API_URL` | URL da API de sincronização | - |
| `SYNC_API_KEY` | Chave de API para autenticação | - |

---

## 12. Persistência Distribuída e Painel Web

Para permitir continuidade do trabalho em múltiplas máquinas e visualização via painel web.

### 12.1 Arquitetura Distribuída

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE CLIENTES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │  Máquina A   │   │  Máquina B   │   │  Máquina C   │   │  Painel Web  │ │
│  │  (Dev Home)  │   │  (Dev Office)│   │  (CI/CD)     │   │  (Dashboard) │ │
│  │              │   │              │   │              │   │              │ │
│  │  Claude +    │   │  Cursor +    │   │  GitHub      │   │  React +     │ │
│  │  MCP Server  │   │  MCP Server  │   │  Actions     │   │  Next.js     │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘ │
│         │                  │                  │                  │         │
│         └──────────────────┼──────────────────┼──────────────────┘         │
│                            │                  │                            │
│                            ▼                  ▼                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE SINCRONIZAÇÃO                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        SYNC API (REST/GraphQL)                        │ │
│  │                                                                       │ │
│  │  POST /api/projects/{id}/sync    - Sincronizar estado                 │ │
│  │  GET  /api/projects/{id}/state   - Obter estado atual                 │ │
│  │  POST /api/projects/{id}/events  - Registrar eventos                  │ │
│  │  GET  /api/projects              - Listar projetos                    │ │
│  │  WS   /ws/projects/{id}          - Atualizações em tempo real         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                       │
│                                    ▼                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE PERSISTÊNCIA                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   PostgreSQL    │  │     Redis       │  │   S3/MinIO      │             │
│  │                 │  │                 │  │                 │             │
│  │  • Projetos     │  │  • Cache        │  │  • Artefatos    │             │
│  │  • Estados      │  │  • Sessões      │  │  • Anexos       │             │
│  │  • Features     │  │  • Pub/Sub      │  │  • Relatórios   │             │
│  │  • Histórico    │  │  • Rate limit   │  │  • Backups      │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Modelo de Dados Persistido

```typescript
// Projeto principal
interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  repositorio_git?: string;
  nivel_complexidade: "simples" | "medio" | "complexo";
  criado_em: Date;
  atualizado_em: Date;
  criado_por: string;
  equipe: string[];
}

// Estado do fluxo de desenvolvimento
interface EstadoProjeto {
  projeto_id: string;
  tipo_fluxo: "novo_projeto" | "feature" | "bug" | "refatoracao";
  fase_atual: number;
  total_fases: number;
  fases: FaseCompleta[];
  contexto: ContextoProjeto;
  sincronizado_em: Date;
  versao: number;  // Para conflict resolution
}

// Cada fase completada
interface FaseCompleta {
  numero: number;
  nome: string;
  status: "pendente" | "em_andamento" | "completa" | "pulada";
  especialista_usado: string;
  template_usado?: string;
  entregavel_path?: string;
  entregavel_hash?: string;  // Para detectar mudanças
  gate: GateResultado;
  iniciado_em?: Date;
  completado_em?: Date;
  completado_por?: string;
  maquina_id?: string;
}

// Features implementadas
interface Feature {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string;
  status: "backlog" | "em_desenvolvimento" | "em_review" | "concluida";
  requisitos_ids: string[];     // RF001, RF002...
  historias_ids: string[];      // US001, US002...
  arquivos_afetados: string[];
  commits: CommitInfo[];
  criado_em: Date;
  concluido_em?: Date;
}

// Histórico de eventos
interface Evento {
  id: string;
  projeto_id: string;
  tipo: "fase_iniciada" | "fase_concluida" | "gate_validado" | "artefato_salvo" | 
        "analise_executada" | "feature_criada" | "bug_resolvido";
  dados: Record<string, any>;
  usuario: string;
  maquina_id: string;
  timestamp: Date;
}

// Análises executadas
interface AnaliseHistorico {
  id: string;
  projeto_id: string;
  tipo: "seguranca" | "performance" | "qualidade" | "acessibilidade" | "dependencias";
  resultado: Record<string, any>;
  score?: number;
  issues_total: number;
  executado_em: Date;
  executado_por: string;
}
```

### 12.3 Sincronização entre Máquinas

#### Estratégia de Sync

```typescript
// Sync Manager - roda no MCP Server local
class SyncManager {
  private localState: EstadoProjeto;
  private remoteVersion: number;
  private pendingChanges: Change[] = [];
  
  // Sincroniza ao iniciar
  async onStart() {
    const remote = await this.api.getState(this.projectId);
    
    if (remote.versao > this.localState.versao) {
      // Servidor tem versão mais nova - fazer pull
      await this.pullRemoteState(remote);
    } else if (this.hasPendingChanges()) {
      // Temos mudanças locais - fazer push
      await this.pushLocalChanges();
    }
  }
  
  // Sincroniza após cada ação
  async onAction(acao: string, dados: any) {
    // Salva localmente primeiro (offline-first)
    await this.saveLocal(acao, dados);
    
    // Tenta sincronizar
    if (this.isOnline()) {
      await this.syncWithServer();
    } else {
      this.pendingChanges.push({ acao, dados, timestamp: Date.now() });
    }
  }
  
  // Resolve conflitos
  async resolveConflict(local: Change, remote: Change): Promise<Change> {
    // Estratégia: Last-Write-Wins com merge de artefatos
    if (local.timestamp > remote.timestamp) {
      return local;
    }
    
    // Se são mudanças em arquivos diferentes, merge
    if (local.arquivo !== remote.arquivo) {
      return this.mergeChanges(local, remote);
    }
    
    // Conflito real - notifica usuário
    return this.notifyConflict(local, remote);
  }
}
```

#### API de Sincronização

```typescript
// Endpoints da Sync API

// Registrar/atualizar projeto
POST /api/projects
{
  nome: string;
  repositorio_git?: string;
  estado_inicial: EstadoProjeto;
}

// Sincronizar estado
POST /api/projects/{id}/sync
{
  estado_local: EstadoProjeto;
  versao_local: number;
  mudancas: Change[];
}
Response: {
  estado_merged: EstadoProjeto;
  versao_nova: number;
  conflitos?: Conflict[];
}

// Registrar evento
POST /api/projects/{id}/events
{
  tipo: string;
  dados: any;
  maquina_id: string;
}

// WebSocket para atualizações em tempo real
WS /ws/projects/{id}
// Recebe: { tipo: "estado_atualizado", dados: EstadoProjeto }
// Recebe: { tipo: "evento_novo", dados: Evento }
```

### 12.4 Painel Web (Dashboard)

#### Funcionalidades

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 Maestro Dashboard                           👤 user@email.com  🔔   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  📊 Visão Geral                                                          ││
│  │                                                                          ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐            ││
│  │  │     5     │  │     3     │  │    82%    │  │    12     │            ││
│  │  │  Projetos │  │ Em Andamento│ │ Gates OK  │  │ Features  │            ││
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  📁 Meus Projetos                                              [+ Novo] ││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │ 📦 meu-saas                                              🟢 Ativo   │││
│  │  │ Fase 7/10 - Plano de Testes                                         │││
│  │  │ ████████████████████░░░░░░░░░░ 70%                                  │││
│  │  │ Última atividade: há 2 horas (Máquina: desktop-home)                │││
│  │  │ [Ver detalhes] [Continuar] [Análises] [Histórico]                   │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │ 📦 e-commerce-api                                        🟡 Pausado │││
│  │  │ Fase 4/10 - Modelagem de Domínio                                    │││
│  │  │ ████████░░░░░░░░░░░░░░░░░░░░░░ 40%                                  │││
│  │  │ Última atividade: há 3 dias (Máquina: laptop-office)                │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  📈 Atividade Recente                                                   ││
│  │                                                                          ││
│  │  🕐 10:30  ✅ Gate "Arquitetura" validado (meu-saas)                    ││
│  │  🕐 10:15  📄 Artefato "arquitetura.md" salvo                           ││
│  │  🕐 09:45  🔒 Análise de segurança executada - 2 issues                 ││
│  │  🕐 09:00  ▶️  Sessão iniciada (desktop-home)                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Página de Detalhes do Projeto

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Voltar    📦 meu-saas                                    [⚙️] [📥 Export]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tabs: [Visão Geral] [Fases] [Features] [Análises] [Artefatos] [Histórico] │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  📊 VISÃO GERAL                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Complexidade: Médio (10 fases)    Stack: NestJS + Next.js + PostgreSQL    │
│  Repositório: github.com/user/meu-saas                                      │
│  Equipe: user@email.com, dev2@email.com                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PROGRESSO DAS FASES                                                    ││
│  │                                                                          ││
│  │  1. Produto        ████████████████████ ✅ Completo                     ││
│  │  2. Requisitos     ████████████████████ ✅ Completo                     ││
│  │  3. UX Design      ████████████████████ ✅ Completo                     ││
│  │  4. Modelagem      ████████████████████ ✅ Completo                     ││
│  │  5. Arquitetura    ████████████████████ ✅ Completo                     ││
│  │  6. Segurança      ████████████████████ ✅ Completo                     ││
│  │  7. Testes         ████████████░░░░░░░░ 🔄 Em andamento (60%)           ││
│  │  8. Plano Exec.    ░░░░░░░░░░░░░░░░░░░░ ⏳ Pendente                      ││
│  │  9. Implementação  ░░░░░░░░░░░░░░░░░░░░ ⏳ Pendente                      ││
│  │ 10. DevOps         ░░░░░░░░░░░░░░░░░░░░ ⏳ Pendente                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐│
│  │  📊 MÉTRICAS DE QUALIDADE    │  │  🔒 ÚLTIMA ANÁLISE DE SEGURANÇA     ││
│  │                              │  │                                      ││
│  │  Score Geral: 78/100         │  │  Nível de Risco: Baixo 🟢           ││
│  │  Cobertura: 72%              │  │  Vulnerabilidades: 0                ││
│  │  Gates: 6/6 OK               │  │  Executado: há 1 dia                ││
│  │                              │  │                                      ││
│  │  [Ver detalhes]              │  │  [Executar nova análise]            ││
│  └──────────────────────────────┘  └──────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  📋 FEATURES RECENTES                                                   ││
│  │                                                                          ││
│  │  │ ID      │ Título                         │ Status       │ Criado    │││
│  │  ├─────────┼────────────────────────────────┼──────────────┼───────────┤││
│  │  │ FEAT-01 │ Autenticação de usuários       │ ✅ Concluída │ 10/12     │││
│  │  │ FEAT-02 │ Dashboard principal            │ 🔄 Em dev    │ 15/12     │││
│  │  │ FEAT-03 │ Gestão de configurações        │ 📋 Backlog   │ 18/12     │││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Stack do Painel Web

```typescript
// Frontend
const dashboardStack = {
  framework: "Next.js 14 (App Router)",
  ui: "shadcn/ui + Tailwind CSS",
  estado: "Zustand + TanStack Query",
  graficos: "Recharts",
  realtime: "Socket.io client",
  auth: "NextAuth.js"
};

// Backend (API)
const apiStack = {
  runtime: "Node.js 20",
  framework: "NestJS ou Fastify",
  database: "PostgreSQL + Prisma",
  cache: "Redis",
  storage: "S3 ou MinIO",
  realtime: "Socket.io",
  auth: "JWT + API Keys"
};
```

### 12.5 Modo Offline e Sincronização

```typescript
// Configuração do MCP para modo híbrido
interface SyncConfig {
  enabled: boolean;
  mode: "online" | "offline-first" | "offline-only";
  
  // Offline-first (recomendado)
  offlineFirst: {
    // Sempre salva localmente primeiro
    localStoragePath: ".guia/";
    
    // Tenta sync em background
    syncInterval: 30000;  // 30 segundos
    
    // Mantém fila de mudanças pendentes
    pendingQueuePath: ".guia/sync-queue.json";
    
    // Resolve conflitos automaticamente quando possível
    conflictResolution: "last-write-wins" | "ask-user" | "custom";
  };
  
  // Identificação da máquina
  machineId: string;  // UUID gerado na primeira execução
}
```

### 12.6 Como Continuar em Outra Máquina

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FLUXO: CONTINUAR TRABALHO EM OUTRA MÁQUINA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    MÁQUINA A (Casa)                              MÁQUINA B (Escritório)
    ═══════════════                               ═════════════════════
         │                                              │
         │  1. Trabalha no projeto                      │
         │     - Completa Fase 5                        │
         │     - Salva artefatos                        │
         │                                              │
         │  2. MCP sincroniza automaticamente           │
         │     → POST /api/projects/xxx/sync            │
         │                                              │
         ▼                                              │
    ┌─────────┐                                         │
    │  CLOUD  │ ◄────── Estado persistido ──────────────┤
    └─────────┘                                         │
         │                                              │
         │                                              │  3. Inicia Claude/Cursor
         │                                              │     com MCP configurado
         │                                              │
         │                                              │  4. MCP detecta projeto
         │                                              │     - Lê .guia/projeto.json
         │                                              │     - GET /api/projects/xxx
         │                                              │
         └──────────────────────────────────────────────┤
                                                        │
                                                        │  5. MCP baixa estado mais recente
                                                        │     - Fase: 6/10
                                                        │     - Contexto completo
                                                        │     - Artefatos disponíveis
                                                        │
                                                        │  6. Continua de onde parou
                                                        │     "Você está na Fase 6: Segurança"
                                                        │     "Último trabalho: há 2 horas"
                                                        ▼
```

### 12.7 Comandos de Sincronização

```typescript
// Novos Tools do MCP para sincronização

// Vincular projeto local a conta cloud
interface VincularProjetoInput {
  projeto_local_path: string;
  criar_novo?: boolean;      // Se true, cria no cloud
  projeto_cloud_id?: string; // Se informado, vincula a existente
}

// Forçar sincronização
interface SincronizarInput {
  direcao?: "push" | "pull" | "bidirecional";
  forcar?: boolean;  // Sobrescreve conflitos
}

// Ver status de sincronização
interface StatusSyncOutput {
  sincronizado: boolean;
  ultima_sync: Date;
  pendentes: number;
  conflitos: Conflito[];
  maquinas_ativas: MaquinaInfo[];
}

// Resolver conflito manualmente
interface ResolverConflitoInput {
  conflito_id: string;
  resolucao: "manter_local" | "manter_remoto" | "merge";
}
```

### 12.8 Variáveis de Ambiente Adicionais

| Variável | Descrição | Default |
|---|---|---|
| `SYNC_ENABLED` | Habilita sincronização | `false` |
| `SYNC_API_URL` | URL da API (ex: https://api.maestro.dev) | - |
| `SYNC_API_KEY` | API Key para autenticação | - |
| `SYNC_MODE` | Modo: `online`, `offline-first`, `offline-only` | `offline-first` |
| `SYNC_INTERVAL` | Intervalo de sync em ms | `30000` |
| `MACHINE_ID` | ID único da máquina (auto-gerado se não informado) | UUID auto |

---

## 12. Roadmap de Desenvolvimento

| Semana | Tarefa | Entregável | Prioridade |
|---|---|---|---|
| 1 | Setup + Resources básicos | Leitura de especialistas/templates | P0 |
| 1 | Tool: classificar_projeto | Detecção de complexidade | P0 |
| 1 | Tool: iniciar_projeto | Fluxo adaptativo | P0 |
| 2 | Sistema de Gates | Validação entre fases | P0 |
| 2 | Tools: proximo, validar_gate | Navegação com validação | P0 |
| 2 | Tool: salvar | Persistência com template | P0 |
| 3 | Tools: status, contexto | Visibilidade do estado | P1 |
| 3 | Fluxos secundários | Feature, bug, refatoração | P1 |
| 3 | Resources: prompts avançados | C4, DDD, observabilidade | P1 |
| 4 | **Tools de Análise** | Segurança, performance, qualidade | P1 |
| 4 | analisar_seguranca | Detecção OWASP, CVEs | P1 |
| 4 | analisar_performance | N+1, cache, gargalos | P1 |
| 5 | analisar_qualidade | Complexidade, cobertura, SOLID | P1 |
| 5 | sugerir_melhorias | Roadmap consolidado | P1 |
| 5 | gerar_relatorio | Relatórios em markdown | P2 |
| 6 | Testes automatizados | Cobertura > 80% | P1 |
| 6 | Documentação | README, exemplos | P1 |
| 7 | Refinamento | Feedback loop, ajustes | P2 |

**Total estimado: 7 semanas**

---

## 13. Melhorias Futuras

### 13.1 Curto Prazo (v2.1)
- [ ] Integração com Git (auto-commit após salvar)
- [ ] Suporte a múltiplos projetos simultâneos
- [ ] Dashboard web para visualizar progresso
- [ ] Histórico de análises com comparação temporal

### 13.2 Médio Prazo (v2.5)
- [ ] IA para sugestão de próximos passos
- [ ] Análise automática de código para gates
- [ ] Integração com Jira/Linear para backlog
- [ ] Integração com SonarQube/CodeClimate
- [ ] Análise de custo de infraestrutura

### 13.3 Longo Prazo (v3.0)
- [ ] Editor visual de fluxos customizados
- [ ] Marketplace de templates e especialistas
- [ ] Multi-tenant para times
- [ ] Análise com IA generativa (code review automático)
- [ ] Previsão de riscos com ML

---

## 14. Próximos Passos

1. Criar repositório `mcp-maestro`
2. Configurar projeto TypeScript
3. Implementar Resources básicos (especialistas, templates)
4. Implementar classificador de complexidade
5. Implementar Tool `iniciar_projeto` com fluxo adaptativo
6. Implementar sistema de Gates
7. **Implementar Tools de Análise (segurança, performance, qualidade)**
8. Testar com Claude Desktop
9. Documentar e publicar

---

## Changelog

| Versão | Data | Mudanças |
|---|---|---|
| 2.1 | 2024-12-19 | Adicionadas Tools de Análise: `analisar_seguranca`, `analisar_performance`, `analisar_qualidade`, `analisar_acessibilidade`, `analisar_dependencias`, `sugerir_melhorias`, `gerar_relatorio` |
| 2.0 | 2024-12-19 | Sistema de gates, templates, classificador de complexidade, especialistas avançados, prompts avançados |
| 1.0 | 2024-12-18 | Versão inicial |
