# 🔧 Especificação Técnica - MCP Maestro 2.0

**Data:** 01/02/2026  
**Versão:** 1.0.0  
**Objetivo:** Especificação técnica detalhada para implementação das melhorias do MCP Maestro

---

## 📋 Sumário Executivo

Este documento define as especificações técnicas para implementação das 30 melhorias do MCP Maestro 2.0, organizadas por componente.

---

## 🏗️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MCP MAESTRO 2.0                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                        MCP SERVER                                  │    │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │    │
│   │  │ Tools   │  │Resources│  │ Prompts │  │Sampling │  │ Roots   │ │    │
│   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘ │    │
│   │       │            │            │            │            │       │    │
│   │       └────────────┴────────────┴────────────┴────────────┘       │    │
│   │                              │                                     │    │
│   └──────────────────────────────┼─────────────────────────────────────┘    │
│                                  │                                          │
│   ┌──────────────────────────────▼─────────────────────────────────────┐    │
│   │                     ORCHESTRATION ENGINE                            │    │
│   │  ┌────────────┐  ┌─────────────┐  ┌────────────┐  ┌─────────────┐ │    │
│   │  │ Decision   │  │   State     │  │  Learning  │  │  Validation │ │    │
│   │  │ Engine     │  │   Manager   │  │  System    │  │  Engine     │ │    │
│   │  └─────┬──────┘  └──────┬──────┘  └──────┬─────┘  └──────┬──────┘ │    │
│   │        │                │                │               │         │    │
│   └────────┼────────────────┼────────────────┼───────────────┼─────────┘    │
│            │                │                │               │              │
│   ┌────────▼────────────────▼────────────────▼───────────────▼─────────┐    │
│   │                        PERSISTENCE LAYER                            │    │
│   │  ┌───────────────────────────────────────────────────────────────┐ │    │
│   │  │                    .maestro/                                   │ │    │
│   │  │ ┌─────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐        │ │    │
│   │  │ │estado   │ │knowledge/ │ │checkpoints│ │rascunhos/│        │ │    │
│   │  │ │.json    │ │           │ │/          │ │          │        │ │    │
│   │  │ └─────────┘ └───────────┘ └───────────┘ └──────────┘        │ │    │
│   │  └───────────────────────────────────────────────────────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Diretórios

### Projeto MCP Server

```
packages/cli/
├── src/
│   ├── server/
│   │   ├── index.ts              # Entry point MCP
│   │   ├── tools/                # MCP Tools
│   │   │   ├── iniciar-projeto.ts
│   │   │   ├── proximo.ts
│   │   │   ├── validar-gate.ts
│   │   │   └── ...
│   │   ├── resources/            # MCP Resources
│   │   │   ├── especialista.ts
│   │   │   ├── template.ts
│   │   │   └── guia.ts
│   │   └── prompts/              # MCP Prompts
│   │       └── system-prompt.ts
│   │
│   ├── orchestrator/             # 🆕 Novo módulo
│   │   ├── decision-engine.ts
│   │   ├── state-manager.ts
│   │   ├── learning-system.ts
│   │   ├── validation-engine.ts
│   │   └── checkpoint-manager.ts
│   │
│   ├── analyzers/                # 🆕 Novo módulo
│   │   ├── code-analyzer.ts
│   │   ├── security-analyzer.ts
│   │   ├── architecture-analyzer.ts
│   │   └── dependency-analyzer.ts
│   │
│   ├── validators/               # 🆕 Novo módulo
│   │   ├── fitness-functions.ts
│   │   ├── gate-validator.ts
│   │   └── security-validator.ts
│   │
│   └── utils/
│       ├── file-system.ts
│       └── git-integration.ts
│
├── content/
│   ├── rules/
│   │   └── GEMINI.md
│   ├── specialists/              # Skills/Especialistas
│   └── templates/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Estrutura `.maestro/` (Por Projeto)

```
.maestro/
├── estado.json                   # Estado atual do projeto
├── resumo.json                   # Cache de contexto
│
├── knowledge/                    # 🆕 Base de conhecimento
│   ├── adrs/
│   │   ├── ADR-001-database.md
│   │   └── ADR-002-auth.md
│   ├── patterns/
│   │   └── learned-patterns.json
│   ├── decisions/
│   │   └── decision-log.json
│   └── metrics/
│       └── quality-history.json
│
├── checkpoints/                  # 🆕 Sistema de checkpoints
│   ├── CP-001-fase-1/
│   │   ├── estado.json.backup
│   │   ├── files-snapshot.json
│   │   └── git-ref.txt
│   └── CP-002-fase-2/
│       └── ...
│
├── rascunhos/                    # 🆕 Pasta de rascunhos
│   ├── fase-1/
│   └── anotacoes/
│
└── content/                      # Conteúdo injetado
    ├── templates/
    ├── prompts/
    └── guias/
```

---

## 📊 Schemas de Dados

### estado.json

```typescript
interface EstadoMaestro {
  versao: "2.0.0";
  projeto: {
    nome: string;
    diretorio: string;
    tipo_artefato: "poc" | "script" | "internal" | "product";
    nivel_complexidade: "simples" | "medio" | "complexo";
    tier_gate: "essencial" | "base" | "avancado";
    ide: "windsurf" | "cursor" | "antigravity";
    criado_em: string;
    atualizado_em: string;
  };
  
  fase_atual: number;
  fluxo: Fase[];
  
  // 🆕 Novos campos v2.0
  checkpoints: {
    ultimo_id: string;
    total: number;
    ultimo_criado: string;
  };
  
  metricas: {
    gates_aprovados: number;
    gates_total: number;
    tempo_por_fase: Record<number, number>;
  };
  
  configuracao: {
    auto_checkpoint: boolean;
    auto_correcao: boolean;
    nivel_autonomia: "baixo" | "medio" | "alto";
  };
}

interface Fase {
  numero: number;
  nome: string;
  especialista: string;
  template: string;
  status: "pendente" | "em_progresso" | "concluido" | "bloqueado";
  entregavel?: string;
  gate_score?: number;
  iniciado_em?: string;
  concluido_em?: string;
}
```

### decision-log.json

```typescript
interface DecisionLog {
  versao: "1.0.0";
  projeto: string;
  decisoes: Decision[];
}

interface Decision {
  id: string;                    // DEC-001
  timestamp: string;             // ISO 8601
  tipo: DecisionType;
  titulo: string;
  descricao: string;
  
  contexto: {
    fase: number;
    modulo?: string;
    trigger: string;             // O que levou à decisão
  };
  
  alternativas: Alternative[];
  escolha: string;               // ID da alternativa escolhida
  
  confianca: number;             // 0-1
  risco: RiskLevel;
  reversivel: boolean;
  
  aprovacao: {
    tipo: "automatica" | "humana";
    aprovador?: string;
    timestamp: string;
  };
  
  adr_relacionado?: string;      // ADR-XXX
  follow_up?: {
    data: string;
    acao: string;
  };
}

type DecisionType = 
  | "arquitetura"
  | "tecnologia" 
  | "padrao"
  | "seguranca"
  | "performance"
  | "design";

type RiskLevel = "baixo" | "medio" | "alto" | "critico";

interface Alternative {
  id: string;
  nome: string;
  pros: string[];
  contras: string[];
  score: number;
}
```

### Checkpoint Schema

```typescript
interface Checkpoint {
  id: string;                    // CP-001
  nome: string;                  // "fase-1-produto"
  timestamp: string;
  
  estado: {
    fase: number;
    estado_json_backup: string;  // Caminho do backup
  };
  
  arquivos: {
    modificados: FileSnapshot[];
    adicionados: string[];
    removidos: string[];
  };
  
  git?: {
    branch: string;
    commit: string;
    dirty: boolean;
  };
  
  metadata: {
    motivo: string;
    automatico: boolean;
    tamanho_bytes: number;
  };
}

interface FileSnapshot {
  caminho: string;
  hash: string;
  tamanho: number;
  conteudo_backup?: string;      // Para arquivos pequenos
}
```

---

## 🔧 Componentes Principais

### 1. State Manager

```typescript
// src/orchestrator/state-manager.ts

export interface IStateManager {
  // Estado básico
  loadState(): Promise<EstadoMaestro>;
  saveState(state: EstadoMaestro): Promise<void>;
  
  // Contexto
  getContext(): Promise<ProjectContext>;
  updateContext(updates: Partial<ProjectContext>): Promise<void>;
  
  // Resumo
  getSummary(): Promise<ProjectSummary>;
  updateSummary(): Promise<void>;
}

export class StateManager implements IStateManager {
  private statePath: string;
  private cache: Map<string, any>;
  
  constructor(projectDir: string) {
    this.statePath = path.join(projectDir, '.maestro');
    this.cache = new Map();
  }
  
  async loadState(): Promise<EstadoMaestro> {
    const stateFile = path.join(this.statePath, 'estado.json');
    
    if (!await fs.pathExists(stateFile)) {
      throw new Error('Projeto não inicializado. Use iniciar_projeto primeiro.');
    }
    
    const content = await fs.readFile(stateFile, 'utf-8');
    const state = JSON.parse(content) as EstadoMaestro;
    
    // Validar versão
    if (!this.isCompatibleVersion(state.versao)) {
      throw new Error(`Versão incompatível: ${state.versao}`);
    }
    
    return state;
  }
  
  async saveState(state: EstadoMaestro): Promise<void> {
    state.projeto.atualizado_em = new Date().toISOString();
    
    const stateFile = path.join(this.statePath, 'estado.json');
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    
    // Invalidar cache
    this.cache.delete('state');
    
    // Atualizar resumo
    await this.updateSummary();
  }
  
  async getContext(): Promise<ProjectContext> {
    const state = await this.loadState();
    const adrs = await this.loadADRs();
    const decisions = await this.loadDecisions();
    
    return {
      projeto: state.projeto,
      fase_atual: state.fase_atual,
      decisoes_recentes: decisions.slice(-10),
      adrs_relevantes: this.filterRelevantADRs(adrs, state.fase_atual),
      stack: await this.detectStack(),
    };
  }
  
  private async loadADRs(): Promise<ADR[]> {
    const adrsPath = path.join(this.statePath, 'knowledge', 'adrs');
    
    if (!await fs.pathExists(adrsPath)) {
      return [];
    }
    
    const files = await fs.readdir(adrsPath);
    return Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(f => this.parseADR(path.join(adrsPath, f)))
    );
  }
}
```

### 2. Decision Engine

```typescript
// src/orchestrator/decision-engine.ts

export interface IDecisionEngine {
  evaluate(situation: Situation): Promise<ActionDecision>;
  recordDecision(decision: Decision): Promise<void>;
  getDecisionHistory(filters?: DecisionFilters): Promise<Decision[]>;
}

export class DecisionEngine implements IDecisionEngine {
  private stateManager: IStateManager;
  private riskAssessor: RiskAssessor;
  
  constructor(stateManager: IStateManager) {
    this.stateManager = stateManager;
    this.riskAssessor = new RiskAssessor();
  }
  
  async evaluate(situation: Situation): Promise<ActionDecision> {
    // 1. Avaliar risco da operação
    const risk = this.riskAssessor.assess(situation);
    
    // 2. Calcular confiança
    const confidence = this.calculateConfidence(situation);
    
    // 3. Consultar matriz de decisão
    const action = this.decisionMatrix(risk, confidence);
    
    // 4. Se precisa decidir, gerar alternativas
    if (action.requiresDecision) {
      const alternatives = await this.generateAlternatives(situation);
      action.alternatives = alternatives;
    }
    
    return action;
  }
  
  private decisionMatrix(
    risk: RiskLevel, 
    confidence: number
  ): ActionDecision {
    // Matriz conforme documentado
    const matrix: Record<RiskLevel, Record<string, ActionType>> = {
      baixo: {
        alta: 'auto_execute',
        media: 'execute_notify',
        baixa: 'suggest_approve'
      },
      medio: {
        alta: 'execute_notify',
        media: 'suggest_approve',
        baixa: 'require_approval'
      },
      alto: {
        alta: 'suggest_approve',
        media: 'require_approval',
        baixa: 'human_only'
      },
      critico: {
        alta: 'require_approval',
        media: 'human_only',
        baixa: 'human_only'
      }
    };
    
    const confidenceLevel = 
      confidence >= 0.8 ? 'alta' : 
      confidence >= 0.5 ? 'media' : 'baixa';
    
    return {
      action: matrix[risk][confidenceLevel],
      risk,
      confidence,
      requiresDecision: matrix[risk][confidenceLevel] !== 'auto_execute'
    };
  }
  
  private calculateConfidence(situation: Situation): number {
    let confidence = 0.5; // Base
    
    // Aumenta se tem contexto similar no histórico
    if (situation.hasHistoricalMatch) confidence += 0.2;
    
    // Aumenta se segue padrão conhecido
    if (situation.matchesKnownPattern) confidence += 0.15;
    
    // Diminui se é operação nova
    if (situation.isNovelOperation) confidence -= 0.2;
    
    // Diminui se contexto incompleto
    if (!situation.hasFullContext) confidence -= 0.15;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  async recordDecision(decision: Decision): Promise<void> {
    const logPath = path.join(
      this.stateManager.statePath, 
      'knowledge', 
      'decisions',
      'decision-log.json'
    );
    
    const log = await this.loadDecisionLog(logPath);
    log.decisoes.push(decision);
    
    await fs.writeFile(logPath, JSON.stringify(log, null, 2));
    
    // Se é decisão arquitetural significativa, gerar ADR
    if (this.shouldGenerateADR(decision)) {
      await this.generateADR(decision);
    }
  }
}
```

### 3. Checkpoint Manager

```typescript
// src/orchestrator/checkpoint-manager.ts

export interface ICheckpointManager {
  create(name: string, reason?: string): Promise<Checkpoint>;
  restore(checkpointId: string): Promise<RestoreResult>;
  list(): Promise<Checkpoint[]>;
  cleanup(keepLast: number): Promise<number>;
}

export class CheckpointManager implements ICheckpointManager {
  private basePath: string;
  private stateManager: IStateManager;
  private maxCheckpoints: number = 20;
  
  constructor(projectDir: string, stateManager: IStateManager) {
    this.basePath = path.join(projectDir, '.maestro', 'checkpoints');
    this.stateManager = stateManager;
  }
  
  async create(name: string, reason?: string): Promise<Checkpoint> {
    const id = await this.generateId();
    const checkpointDir = path.join(this.basePath, id);
    
    await fs.ensureDir(checkpointDir);
    
    // 1. Backup do estado
    const state = await this.stateManager.loadState();
    const stateBackupPath = path.join(checkpointDir, 'estado.json.backup');
    await fs.writeFile(stateBackupPath, JSON.stringify(state, null, 2));
    
    // 2. Snapshot dos arquivos modificados
    const filesSnapshot = await this.createFilesSnapshot(state);
    await fs.writeFile(
      path.join(checkpointDir, 'files-snapshot.json'),
      JSON.stringify(filesSnapshot, null, 2)
    );
    
    // 3. Referência git (se disponível)
    const gitRef = await this.getGitRef();
    if (gitRef) {
      await fs.writeFile(
        path.join(checkpointDir, 'git-ref.txt'),
        JSON.stringify(gitRef, null, 2)
      );
    }
    
    // 4. Metadados
    const checkpoint: Checkpoint = {
      id,
      nome: name,
      timestamp: new Date().toISOString(),
      estado: {
        fase: state.fase_atual,
        estado_json_backup: stateBackupPath
      },
      arquivos: filesSnapshot,
      git: gitRef,
      metadata: {
        motivo: reason || 'Checkpoint automático',
        automatico: !reason,
        tamanho_bytes: await this.calculateSize(checkpointDir)
      }
    };
    
    await fs.writeFile(
      path.join(checkpointDir, 'checkpoint.json'),
      JSON.stringify(checkpoint, null, 2)
    );
    
    // 5. Atualizar estado
    state.checkpoints.ultimo_id = id;
    state.checkpoints.total += 1;
    state.checkpoints.ultimo_criado = checkpoint.timestamp;
    await this.stateManager.saveState(state);
    
    // 6. Cleanup se necessário
    await this.cleanup(this.maxCheckpoints);
    
    return checkpoint;
  }
  
  async restore(checkpointId: string): Promise<RestoreResult> {
    const checkpointDir = path.join(this.basePath, checkpointId);
    
    if (!await fs.pathExists(checkpointDir)) {
      throw new Error(`Checkpoint não encontrado: ${checkpointId}`);
    }
    
    // 1. Criar checkpoint de segurança antes do rollback
    await this.create(`pre-rollback-${checkpointId}`, 'Segurança pré-rollback');
    
    // 2. Restaurar estado
    const stateBackup = await fs.readFile(
      path.join(checkpointDir, 'estado.json.backup'),
      'utf-8'
    );
    await this.stateManager.saveState(JSON.parse(stateBackup));
    
    // 3. Restaurar arquivos (se configurado)
    const filesSnapshot = JSON.parse(
      await fs.readFile(
        path.join(checkpointDir, 'files-snapshot.json'),
        'utf-8'
      )
    );
    
    const restoredFiles = await this.restoreFiles(filesSnapshot);
    
    return {
      success: true,
      checkpointId,
      filesRestored: restoredFiles.length,
      warnings: restoredFiles.filter(f => f.warning).map(f => f.warning!)
    };
  }
  
  private async createFilesSnapshot(state: EstadoMaestro): Promise<FileSnapshot[]> {
    const snapshots: FileSnapshot[] = [];
    const docsDir = path.join(path.dirname(this.basePath), '..', 'docs');
    
    // Snapshot dos entregáveis
    for (const fase of state.fluxo) {
      if (fase.entregavel) {
        const filePath = path.join(docsDir, fase.entregavel);
        if (await fs.pathExists(filePath)) {
          snapshots.push({
            caminho: filePath,
            hash: await this.hashFile(filePath),
            tamanho: (await fs.stat(filePath)).size
          });
        }
      }
    }
    
    return snapshots;
  }
}
```

### 4. Validation Engine

```typescript
// src/orchestrator/validation-engine.ts

export interface IValidationEngine {
  validateGate(fase: number, entregavel: string): Promise<GateResult>;
  runFitnessFunctions(code: string, context: any): Promise<FitnessResult[]>;
  validateSecurity(code: string): Promise<SecurityResult>;
}

export class ValidationEngine implements IValidationEngine {
  private fitnessFunctions: FitnessFunction[];
  private securityRules: SecurityRule[];
  
  constructor() {
    this.fitnessFunctions = this.loadFitnessFunctions();
    this.securityRules = this.loadSecurityRules();
  }
  
  async validateGate(fase: number, entregavel: string): Promise<GateResult> {
    const checklist = await this.getChecklist(fase);
    const results: ChecklistItemResult[] = [];
    
    for (const item of checklist) {
      const result = await this.validateChecklistItem(item, entregavel);
      results.push(result);
    }
    
    const score = this.calculateScore(results);
    const passed = score >= 70;
    
    return {
      fase,
      score,
      passed,
      items: results,
      pendentes: results.filter(r => !r.passed),
      recomendacoes: this.generateRecommendations(results)
    };
  }
  
  async runFitnessFunctions(
    code: string, 
    context: ArchitectureContext
  ): Promise<FitnessResult[]> {
    const results: FitnessResult[] = [];
    
    for (const ff of this.fitnessFunctions) {
      if (ff.appliesTo(context)) {
        const result = await ff.evaluate(code, context);
        results.push(result);
      }
    }
    
    return results;
  }
  
  private loadFitnessFunctions(): FitnessFunction[] {
    return [
      // Direção de dependência
      {
        name: 'dependency-direction',
        description: 'Domain não pode depender de Infrastructure',
        appliesTo: (ctx) => ctx.architecture === 'clean',
        evaluate: async (code, ctx) => {
          const violations = this.checkDependencyDirection(code, ctx);
          return {
            name: 'dependency-direction',
            passed: violations.length === 0,
            violations,
            score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 20)
          };
        }
      },
      
      // Sem dependências circulares
      {
        name: 'no-circular-deps',
        description: 'Não deve haver dependências circulares',
        appliesTo: () => true,
        evaluate: async (code, ctx) => {
          const cycles = await this.detectCircularDeps(ctx.projectPath);
          return {
            name: 'no-circular-deps',
            passed: cycles.length === 0,
            violations: cycles.map(c => ({ path: c, message: 'Dependência circular detectada' })),
            score: cycles.length === 0 ? 100 : 0
          };
        }
      },
      
      // Cobertura de testes
      {
        name: 'test-coverage',
        description: 'Cobertura mínima de testes',
        appliesTo: (ctx) => ctx.tier !== 'essencial',
        evaluate: async (code, ctx) => {
          const coverage = await this.getTestCoverage(ctx.projectPath);
          const threshold = ctx.tier === 'avancado' ? 80 : 60;
          return {
            name: 'test-coverage',
            passed: coverage >= threshold,
            violations: coverage < threshold ? [{
              message: `Cobertura ${coverage}% abaixo do mínimo ${threshold}%`
            }] : [],
            score: Math.min(100, (coverage / threshold) * 100)
          };
        }
      }
    ];
  }
  
  async validateSecurity(code: string): Promise<SecurityResult> {
    const issues: SecurityIssue[] = [];
    
    for (const rule of this.securityRules) {
      const matches = code.match(rule.pattern);
      if (matches) {
        issues.push({
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          line: this.findLineNumber(code, matches[0]),
          suggestion: rule.suggestion
        });
      }
    }
    
    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, 100 - issues.reduce((acc, i) => 
        acc + (i.severity === 'critical' ? 50 : i.severity === 'high' ? 20 : 5), 0
      )),
      issues,
      owaspCompliant: this.checkOWASPCompliance(issues)
    };
  }
  
  private loadSecurityRules(): SecurityRule[] {
    return [
      {
        name: 'sql-injection',
        pattern: /db\.query\(`[^`]*\$\{/g,
        severity: 'critical',
        message: 'Potencial SQL Injection - use queries parametrizadas',
        suggestion: 'Use $1, $2... com array de parâmetros'
      },
      {
        name: 'xss',
        pattern: /innerHTML\s*=|dangerouslySetInnerHTML/g,
        severity: 'high',
        message: 'Potencial XSS - sanitize input antes de renderizar',
        suggestion: 'Use DOMPurify ou escape HTML'
      },
      {
        name: 'hardcoded-secret',
        pattern: /['"](?:password|secret|api[_-]?key|token)['"]:\s*['"][^'"]+['"]/gi,
        severity: 'critical',
        message: 'Secret hardcoded detectado',
        suggestion: 'Use variáveis de ambiente'
      },
      {
        name: 'eval-usage',
        pattern: /\beval\s*\(/g,
        severity: 'critical',
        message: 'Uso perigoso de eval()',
        suggestion: 'Evite eval(), use alternativas seguras'
      },
      {
        name: 'sensitive-log',
        pattern: /console\.(log|info|debug).*(?:password|secret|token|credential)/gi,
        severity: 'high',
        message: 'Dados sensíveis em logs',
        suggestion: 'Remova dados sensíveis dos logs'
      }
    ];
  }
}
```

---

## 🔌 Integração MCP

### Novos Tools

```typescript
// Ferramenta: criar_checkpoint
{
  name: "criar_checkpoint",
  description: "Cria checkpoint do estado atual do projeto",
  inputSchema: {
    type: "object",
    properties: {
      nome: { type: "string", description: "Nome descritivo do checkpoint" },
      motivo: { type: "string", description: "Motivo do checkpoint" },
      estado_json: { type: "string", description: "Conteúdo de estado.json" },
      diretorio: { type: "string", description: "Diretório do projeto" }
    },
    required: ["estado_json", "diretorio"]
  }
}

// Ferramenta: rollback
{
  name: "rollback",
  description: "Restaura para um checkpoint anterior",
  inputSchema: {
    type: "object",
    properties: {
      checkpoint_id: { type: "string", description: "ID do checkpoint" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["checkpoint_id", "estado_json", "diretorio"]
  }
}

// Ferramenta: validar_seguranca
{
  name: "validar_seguranca",
  description: "Valida código contra regras de segurança OWASP",
  inputSchema: {
    type: "object",
    properties: {
      codigo: { type: "string", description: "Código a validar" },
      tipo: { type: "string", enum: ["full", "quick"] },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["codigo", "estado_json", "diretorio"]
  }
}

// Ferramenta: gerar_adr
{
  name: "gerar_adr",
  description: "Gera ADR para decisão arquitetural",
  inputSchema: {
    type: "object",
    properties: {
      titulo: { type: "string" },
      contexto: { type: "string" },
      decisao: { type: "string" },
      alternativas: { type: "array", items: { type: "object" } },
      consequencias: { type: "array", items: { type: "string" } },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["titulo", "decisao", "estado_json", "diretorio"]
  }
}
```

### Novos Resources

```typescript
// Resource: decisao/{id}
{
  uri: "maestro://decisao/{id}",
  description: "Acessa decisão específica do log",
  mimeType: "application/json"
}

// Resource: checkpoint/{id}
{
  uri: "maestro://checkpoint/{id}",
  description: "Informações do checkpoint",
  mimeType: "application/json"
}

// Resource: metricas
{
  uri: "maestro://metricas",
  description: "Métricas de qualidade do projeto",
  mimeType: "application/json"
}
```

---

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/
│   ├── state-manager.test.ts
│   ├── decision-engine.test.ts
│   ├── checkpoint-manager.test.ts
│   └── validation-engine.test.ts
│
├── integration/
│   ├── full-flow.test.ts
│   ├── rollback.test.ts
│   └── security-validation.test.ts
│
└── e2e/
    ├── new-project.test.ts
    ├── context-persistence.test.ts
    └── refactoring-flow.test.ts
```

### Exemplo de Teste

```typescript
// tests/unit/decision-engine.test.ts

describe('DecisionEngine', () => {
  let engine: DecisionEngine;
  let mockStateManager: jest.Mocked<IStateManager>;
  
  beforeEach(() => {
    mockStateManager = createMockStateManager();
    engine = new DecisionEngine(mockStateManager);
  });
  
  describe('evaluate', () => {
    it('should auto-execute low-risk high-confidence operations', async () => {
      const situation: Situation = {
        operation: 'format-code',
        hasHistoricalMatch: true,
        matchesKnownPattern: true,
        isNovelOperation: false,
        hasFullContext: true
      };
      
      const result = await engine.evaluate(situation);
      
      expect(result.action).toBe('auto_execute');
      expect(result.risk).toBe('baixo');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
    
    it('should require human approval for critical operations', async () => {
      const situation: Situation = {
        operation: 'change-database',
        hasHistoricalMatch: false,
        matchesKnownPattern: false,
        isNovelOperation: true,
        hasFullContext: false
      };
      
      const result = await engine.evaluate(situation);
      
      expect(result.action).toBe('human_only');
      expect(result.risk).toBe('critico');
    });
  });
});
```

---

## 📈 Métricas de Implementação

### Cobertura de Código

| Módulo | Meta | Atual |
|--------|------|-------|
| state-manager | 90% | 📋 A implementar |
| decision-engine | 85% | 📋 A implementar |
| checkpoint-manager | 90% | 📋 A implementar |
| validation-engine | 85% | 📋 A implementar |

### Performance

| Operação | Meta | SLA |
|----------|------|-----|
| loadState | < 50ms | P95 |
| saveState | < 100ms | P95 |
| createCheckpoint | < 500ms | P95 |
| validateGate | < 200ms | P95 |
| runFitnessFunctions | < 1s | P95 |

---

## 📚 Documentação Relacionada

- [Roadmap de Implementação](./00_ROADMAP_IMPLEMENTACAO_MCP_MAESTRO.md)
- [Arquitetura de Soluções](./00_ARQUITETURA_SOLUCOES_MAESTRO.md)
- [Casos de Uso](./00_CASOS_USO_MCP_MAESTRO.md)
- [Plano de Evolução](./01_PLANO_EVOLUCAO_MCP_MAESTRO.md)

---

**Versão:** 1.0.0  
**Última Atualização:** 01/02/2026  
**Próxima Revisão:** Após implementação da Fase 1
