# 🚀 Proposta de Melhorias para Maestro MCP

**Data:** 02/02/2026  
**Versão:** 1.0.0  
**Baseado em:** Análise do Spec Workflow MCP  
**Objetivo:** Propostas concretas de melhorias inspiradas no Spec Workflow

---

## 📋 Sumário Executivo

Este documento detalha **15 melhorias prioritárias** para o Maestro MCP, inspiradas nas melhores práticas do Spec Workflow, mantendo a profundidade metodológica que é o diferencial do Maestro.

### Visão Geral das Melhorias

| # | Melhoria | Prioridade | Esforço | Impacto | ROI |
|---|----------|------------|---------|---------|-----|
| 1 | Dashboard Web | 🔴 Crítica | Alto | Muito Alto | ⭐⭐⭐⭐⭐ |
| 2 | VSCode Extension | 🔴 Crítica | Alto | Muito Alto | ⭐⭐⭐⭐⭐ |
| 3 | Sistema de Aprovação Humana | 🔴 Crítica | Médio | Muito Alto | ⭐⭐⭐⭐⭐ |
| 4 | Implementation Logs | 🔴 Crítica | Médio | Alto | ⭐⭐⭐⭐ |
| 5 | Task Management Hierárquico | 🟡 Alta | Médio | Alto | ⭐⭐⭐⭐ |
| 6 | Internacionalização (i18n) | 🟡 Alta | Médio | Alto | ⭐⭐⭐⭐ |
| 7 | Real-time Updates (WebSockets) | 🟡 Alta | Médio | Médio | ⭐⭐⭐ |
| 8 | Steering Documents | 🟡 Alta | Baixo | Médio | ⭐⭐⭐⭐ |
| 9 | Search & Filters | 🟢 Média | Baixo | Médio | ⭐⭐⭐ |
| 10 | Export/Import | 🟢 Média | Baixo | Médio | ⭐⭐⭐ |
| 11 | Mobile Dashboard | 🟢 Média | Alto | Baixo | ⭐⭐ |
| 12 | Multi-project Support | 🟢 Média | Médio | Médio | ⭐⭐⭐ |
| 13 | Notification System | 🟢 Média | Baixo | Baixo | ⭐⭐ |
| 14 | Keyboard Shortcuts | 🟢 Média | Baixo | Baixo | ⭐⭐ |
| 15 | Onboarding Wizard | 🟡 Alta | Médio | Alto | ⭐⭐⭐⭐ |

---

## 🔴 PRIORIDADE CRÍTICA

### 1. Dashboard Web

**Objetivo:** Criar interface visual moderna para visualização e gestão de projetos Maestro.

#### Especificação

**Stack Tecnológica:**
```typescript
Frontend:
- React 18+ com TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- shadcn/ui (components)
- Lucide React (icons)
- React Router (routing)
- Zustand (state management)
- Socket.io-client (real-time)

Backend:
- Express.js (HTTP server)
- Socket.io (WebSockets)
- Cors (CORS handling)
```

**Arquitetura:**
```
┌─────────────────────────────────────────────────────────────┐
│                    MAESTRO DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (React)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │ │
│  │  │ Home     │  │ Projeto  │  │ Fase     │  │ Config │ │ │
│  │  │ View     │  │ View     │  │ View     │  │ View   │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         Components (shadcn/ui)                    │  │ │
│  │  │  • ProjectCard  • PhaseCard  • GateStatus        │  │ │
│  │  │  • ProgressBar  • Timeline   • Specialist        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ Socket.io + REST                 │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  BACKEND (Express)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ REST API │  │WebSocket │  │  File    │            │ │
│  │  │          │  │  Server  │  │  Watcher │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FILE SYSTEM (.maestro/)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Views Principais:**

**1. Home View (Dashboard Principal)**
```tsx
interface HomeView {
  // Header
  header: {
    logo: string;
    projectName: string;
    actions: ["settings", "help", "theme"];
  };
  
  // Project Overview
  overview: {
    currentPhase: number;
    totalPhases: number;
    progress: number;
    complexity: "simples" | "medio" | "complexo";
    tier: "essencial" | "base" | "avancado";
  };
  
  // Phase Cards
  phases: PhaseCard[];
  
  // Recent Activity
  activity: ActivityItem[];
  
  // Quick Actions
  quickActions: ["proximo", "validar_gate", "salvar", "contexto"];
}
```

**2. Project View (Detalhes do Projeto)**
```tsx
interface ProjectView {
  // Tabs
  tabs: ["overview", "phases", "deliverables", "knowledge", "metrics"];
  
  // Overview Tab
  overview: {
    info: ProjectInfo;
    timeline: Timeline;
    team: TeamMember[];
  };
  
  // Phases Tab
  phases: {
    list: Phase[];
    current: Phase;
    navigation: PhaseNavigation;
  };
  
  // Deliverables Tab
  deliverables: {
    list: Deliverable[];
    viewer: MarkdownViewer;
    actions: ["edit", "download", "share"];
  };
  
  // Knowledge Tab
  knowledge: {
    adrs: ADR[];
    decisions: Decision[];
    patterns: Pattern[];
  };
  
  // Metrics Tab
  metrics: {
    quality: QualityMetrics;
    progress: ProgressMetrics;
    gates: GateMetrics;
  };
}
```

**3. Phase View (Detalhes da Fase)**
```tsx
interface PhaseView {
  // Phase Info
  info: {
    number: number;
    name: string;
    specialist: string;
    status: "pendente" | "em_progresso" | "concluido";
  };
  
  // Specialist Card
  specialist: {
    name: string;
    avatar: string;
    description: string;
    skills: string[];
  };
  
  // Template Viewer
  template: {
    content: string;
    sections: Section[];
  };
  
  // Deliverable Editor
  deliverable: {
    content: string;
    preview: boolean;
    autosave: boolean;
  };
  
  // Gate Checklist
  gate: {
    items: ChecklistItem[];
    score: number;
    status: "pending" | "passed" | "failed";
  };
  
  // Actions
  actions: ["salvar", "validar_gate", "proximo"];
}
```

**Components Principais:**

```tsx
// ProjectCard.tsx
interface ProjectCardProps {
  name: string;
  phase: number;
  totalPhases: number;
  progress: number;
  complexity: string;
  lastUpdate: string;
  onClick: () => void;
}

// PhaseCard.tsx
interface PhaseCardProps {
  number: number;
  name: string;
  specialist: string;
  status: "pendente" | "em_progresso" | "concluido" | "bloqueado";
  deliverable?: string;
  gateScore?: number;
  onClick: () => void;
}

// ProgressBar.tsx
interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  color?: "blue" | "green" | "yellow" | "red";
  size?: "sm" | "md" | "lg";
}

// Timeline.tsx
interface TimelineProps {
  events: {
    date: string;
    title: string;
    description: string;
    type: "phase" | "gate" | "decision" | "checkpoint";
  }[];
}

// MarkdownViewer.tsx
interface MarkdownViewerProps {
  content: string;
  editable?: boolean;
  onSave?: (content: string) => void;
  theme?: "light" | "dark";
}
```

**API Endpoints:**

```typescript
// REST API
GET    /api/projects              // Lista projetos
GET    /api/projects/:id          // Detalhes do projeto
GET    /api/projects/:id/phases   // Fases do projeto
GET    /api/projects/:id/phase/:n // Detalhes da fase
POST   /api/projects/:id/next     // Avançar fase
POST   /api/projects/:id/save     // Salvar entregável
GET    /api/projects/:id/gate     // Status do gate
POST   /api/projects/:id/validate // Validar gate

// WebSocket Events
connect                            // Conexão estabelecida
project:update                     // Projeto atualizado
phase:change                       // Fase mudou
gate:validated                     // Gate validado
deliverable:saved                  // Entregável salvo
error                              // Erro ocorreu
```

**Esforço Estimado:** 160-200 horas
- Setup inicial: 16h
- Components base: 40h
- Views principais: 60h
- API + WebSocket: 40h
- Integração com MCP: 24h
- Testes: 20h

---

### 2. VSCode Extension

**Objetivo:** Extensão nativa do VSCode para integração profunda com o Maestro.

#### Especificação

**Features Principais:**

**1. Sidebar Panel**
```typescript
interface MaestroSidebar {
  // Tree View de Fases
  phasesTree: {
    phases: PhaseTreeItem[];
    currentPhase: number;
    actions: ["expand", "collapse", "refresh"];
  };
  
  // Deliverables List
  deliverables: {
    items: DeliverableItem[];
    filter: "all" | "current" | "completed";
    search: string;
  };
  
  // Quick Actions
  quickActions: {
    buttons: [
      "Próximo",
      "Validar Gate",
      "Salvar",
      "Contexto"
    ];
  };
  
  // Status Bar
  statusBar: {
    phase: string;
    progress: number;
    gateScore?: number;
  };
}
```

**2. Document Viewer**
```typescript
interface DocumentViewer {
  // Markdown Preview
  preview: {
    content: string;
    theme: "light" | "dark";
    syncScroll: boolean;
  };
  
  // Editor Integration
  editor: {
    language: "markdown";
    snippets: Snippet[];
    autoComplete: boolean;
  };
  
  // Actions
  actions: {
    save: () => void;
    preview: () => void;
    export: (format: "md" | "pdf" | "html") => void;
  };
}
```

**3. Context Menu Actions**
```typescript
interface ContextMenuActions {
  // Em arquivos .md
  onMarkdownFile: [
    "Salvar como Entregável",
    "Validar Gate",
    "Ver no Dashboard",
    "Exportar"
  ];
  
  // Em pastas
  onFolder: [
    "Iniciar Projeto Maestro",
    "Abrir Dashboard",
    "Ver Status"
  ];
}
```

**4. Commands (Command Palette)**
```typescript
const commands = [
  "Maestro: Iniciar Projeto",
  "Maestro: Próxima Fase",
  "Maestro: Validar Gate",
  "Maestro: Salvar Entregável",
  "Maestro: Ver Status",
  "Maestro: Ver Contexto",
  "Maestro: Abrir Dashboard",
  "Maestro: Classificar Projeto",
  "Maestro: Criar Checkpoint",
  "Maestro: Ver ADRs",
  "Maestro: Gerar Relatório"
];
```

**5. Notifications**
```typescript
interface NotificationSystem {
  // Tipos de notificação
  types: {
    info: "Fase avançada com sucesso";
    warning: "Gate não passou (score < 70%)";
    error: "Erro ao salvar entregável";
    success: "Entregável salvo com sucesso";
  };
  
  // Configurações
  settings: {
    enabled: boolean;
    sound: boolean;
    position: "top-right" | "bottom-right";
  };
}
```

**6. Settings**
```json
{
  "maestro.language": "pt-BR",
  "maestro.autoSave": true,
  "maestro.autoSaveInterval": 30000,
  "maestro.notifications.enabled": true,
  "maestro.notifications.sound": true,
  "maestro.dashboard.autoOpen": false,
  "maestro.dashboard.port": 5000,
  "maestro.theme.followVSCode": true,
  "maestro.validation.autoValidate": true,
  "maestro.git.autoCommit": false
}
```

**Estrutura do Projeto:**
```
maestro-vscode-extension/
├── src/
│   ├── extension.ts              # Entry point
│   ├── providers/
│   │   ├── PhaseTreeProvider.ts
│   │   ├── DeliverableProvider.ts
│   │   └── SpecialistProvider.ts
│   ├── commands/
│   │   ├── iniciarProjeto.ts
│   │   ├── proximo.ts
│   │   ├── validarGate.ts
│   │   └── ...
│   ├── views/
│   │   ├── sidebar.ts
│   │   ├── documentViewer.ts
│   │   └── statusBar.ts
│   ├── services/
│   │   ├── mcpClient.ts
│   │   ├── fileWatcher.ts
│   │   └── notificationService.ts
│   └── utils/
│       ├── markdown.ts
│       └── validation.ts
├── resources/
│   ├── icons/
│   └── snippets/
├── package.json
└── tsconfig.json
```

**Esforço Estimado:** 120-160 horas
- Setup e estrutura: 16h
- Tree providers: 32h
- Commands: 40h
- Views: 32h
- Integração MCP: 24h
- Testes: 16h

---

### 3. Sistema de Aprovação Humana

**Objetivo:** Implementar workflow de aprovação com revisão humana obrigatória.

#### Especificação

**Workflow de Aprovação:**

```typescript
interface ApprovalWorkflow {
  // Estados
  status: "draft" | "pending_approval" | "approved" | "rejected" | "needs_revision";
  
  // Ações
  actions: {
    submitForApproval: (deliverable: string) => Promise<ApprovalRequest>;
    approve: (requestId: string, comment?: string) => Promise<void>;
    reject: (requestId: string, reason: string) => Promise<void>;
    requestChanges: (requestId: string, feedback: Feedback[]) => Promise<void>;
    submitRevision: (requestId: string, newContent: string) => Promise<void>;
  };
  
  // Histórico
  history: ApprovalHistory[];
}

interface ApprovalRequest {
  id: string;
  projectId: string;
  phase: number;
  deliverable: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  reviewer?: string;
  reviewedAt?: string;
  comments?: string;
  feedback?: Feedback[];
}

interface Feedback {
  line?: number;
  section?: string;
  type: "suggestion" | "required" | "question";
  message: string;
  resolved: boolean;
}

interface ApprovalHistory {
  timestamp: string;
  action: "submitted" | "approved" | "rejected" | "revision_requested" | "revision_submitted";
  user: string;
  comment?: string;
}
```

**Estrutura de Arquivos:**
```
.maestro/
├── approvals/
│   ├── pending/
│   │   └── AP-001-fase-1.json
│   ├── approved/
│   │   └── AP-002-fase-2.json
│   ├── rejected/
│   │   └── AP-003-fase-3.json
│   └── history/
│       └── approval-history.json
```

**Exemplo de Approval Request:**
```json
{
  "id": "AP-001",
  "projectId": "ecommerce-pro",
  "phase": 1,
  "phaseName": "Produto (PRD)",
  "deliverable": "PRD.md",
  "deliverableContent": "# PRD - E-commerce Pro\n\n...",
  "submittedBy": "ai-assistant",
  "submittedAt": "2026-02-02T10:00:00Z",
  "status": "pending_approval",
  "reviewer": null,
  "reviewedAt": null,
  "comments": null,
  "feedback": [],
  "history": [
    {
      "timestamp": "2026-02-02T10:00:00Z",
      "action": "submitted",
      "user": "ai-assistant",
      "comment": "PRD completo para revisão"
    }
  ]
}
```

**Fluxo no Dashboard:**

```
1. IA completa entregável
   ↓
2. Chama `submitForApproval()`
   ↓
3. Dashboard mostra notificação "Aprovação Pendente"
   ↓
4. Humano abre painel de aprovação
   ↓
5. Revisa entregável com feedback inline
   ↓
6. Opções:
   - ✅ Aprovar → Fase avança
   - ❌ Rejeitar → Volta para draft
   - 🔄 Solicitar Mudanças → IA revisa
   ↓
7. Se mudanças solicitadas:
   - IA recebe feedback estruturado
   - IA submete revisão
   - Processo repete
```

**MCP Tools:**

```typescript
// Nova tool: solicitar_aprovacao
{
  name: "solicitar_aprovacao",
  description: "Submete entregável para aprovação humana",
  inputSchema: {
    type: "object",
    properties: {
      entregavel: { type: "string" },
      fase: { type: "number" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["entregavel", "fase", "estado_json", "diretorio"]
  }
}

// Nova tool: verificar_aprovacao
{
  name: "verificar_aprovacao",
  description: "Verifica status de aprovação pendente",
  inputSchema: {
    type: "object",
    properties: {
      approval_id: { type: "string" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["approval_id", "estado_json", "diretorio"]
  }
}

// Nova tool: processar_feedback
{
  name: "processar_feedback",
  description: "Processa feedback de aprovação e gera revisão",
  inputSchema: {
    type: "object",
    properties: {
      approval_id: { type: "string" },
      feedback: { type: "array" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["approval_id", "feedback", "estado_json", "diretorio"]
  }
}
```

**Esforço Estimado:** 80-100 horas
- Backend (tools + API): 40h
- Frontend (UI de aprovação): 32h
- Integração: 16h
- Testes: 12h

---

### 4. Implementation Logs

**Objetivo:** Rastrear todas as mudanças de código durante implementação.

#### Especificação

**Sistema de Logs:**

```typescript
interface ImplementationLog {
  id: string;                    // LOG-001
  timestamp: string;             // ISO 8601
  phase: number;
  taskId?: string;               // Se houver task hierarchy
  
  // Estatísticas de código
  stats: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    filesModified: number;
    filesAdded: number;
    filesDeleted: number;
  };
  
  // Mudanças detalhadas
  changes: FileChange[];
  
  // Contexto
  context: {
    description: string;
    specialist: string;
    deliverable?: string;
  };
  
  // Metadata
  duration?: number;             // segundos
  notes?: string;
  tags?: string[];
}

interface FileChange {
  file: string;
  type: "added" | "modified" | "deleted";
  language: string;
  stats: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  };
  diff?: string;                 // Git diff format
  hash?: string;                 // File hash
}
```

**Estrutura de Arquivos:**
```
.maestro/
├── logs/
│   ├── implementation/
│   │   ├── LOG-001-fase-11-frontend.json
│   │   ├── LOG-002-fase-12-backend.json
│   │   └── ...
│   ├── summary/
│   │   └── logs-summary.json
│   └── index.json
```

**Exemplo de Log:**
```json
{
  "id": "LOG-001",
  "timestamp": "2026-02-02T14:30:00Z",
  "phase": 11,
  "phaseName": "Frontend",
  "taskId": "1.2.1",
  "stats": {
    "linesAdded": 450,
    "linesRemoved": 23,
    "linesModified": 67,
    "filesModified": 8,
    "filesAdded": 12,
    "filesDeleted": 1
  },
  "changes": [
    {
      "file": "src/components/ProductCard.tsx",
      "type": "added",
      "language": "typescript",
      "stats": {
        "linesAdded": 85,
        "linesRemoved": 0,
        "linesModified": 0
      },
      "hash": "a1b2c3d4"
    },
    {
      "file": "src/pages/Home.tsx",
      "type": "modified",
      "language": "typescript",
      "stats": {
        "linesAdded": 45,
        "linesRemoved": 12,
        "linesModified": 23
      },
      "diff": "...",
      "hash": "e5f6g7h8"
    }
  ],
  "context": {
    "description": "Implementação de componentes de produto",
    "specialist": "Frontend Developer",
    "deliverable": "frontend/components"
  },
  "duration": 3600,
  "notes": "Implementados ProductCard, ProductList e ProductDetail",
  "tags": ["components", "products", "ui"]
}
```

**Coleta Automática:**

```typescript
class ImplementationLogger {
  private gitDiff: GitDiffService;
  private fileWatcher: FileWatcherService;
  
  async captureChanges(
    phase: number,
    description: string
  ): Promise<ImplementationLog> {
    // 1. Capturar git diff
    const diff = await this.gitDiff.getDiff();
    
    // 2. Analisar mudanças
    const changes = await this.analyzeChanges(diff);
    
    // 3. Calcular estatísticas
    const stats = this.calculateStats(changes);
    
    // 4. Criar log
    const log: ImplementationLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      phase,
      stats,
      changes,
      context: {
        description,
        specialist: this.getSpecialist(phase)
      }
    };
    
    // 5. Salvar
    await this.saveLog(log);
    
    return log;
  }
  
  private async analyzeChanges(diff: string): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    
    // Parse git diff
    const files = this.parseGitDiff(diff);
    
    for (const file of files) {
      changes.push({
        file: file.path,
        type: file.type,
        language: this.detectLanguage(file.path),
        stats: {
          linesAdded: file.additions,
          linesRemoved: file.deletions,
          linesModified: file.modifications
        },
        diff: file.diff,
        hash: file.hash
      });
    }
    
    return changes;
  }
}
```

**Visualização no Dashboard:**

```tsx
// LogsView.tsx
interface LogsViewProps {
  logs: ImplementationLog[];
}

function LogsView({ logs }: LogsViewProps) {
  return (
    <div className="logs-view">
      {/* Filtros */}
      <LogFilters />
      
      {/* Timeline */}
      <LogTimeline logs={logs} />
      
      {/* Estatísticas */}
      <LogStats logs={logs} />
      
      {/* Lista de logs */}
      <LogList logs={logs} />
    </div>
  );
}

// LogCard.tsx
function LogCard({ log }: { log: ImplementationLog }) {
  return (
    <Card>
      <CardHeader>
        <h3>{log.context.description}</h3>
        <span>{formatDate(log.timestamp)}</span>
      </CardHeader>
      <CardContent>
        <div className="stats">
          <Stat label="Lines Added" value={log.stats.linesAdded} color="green" />
          <Stat label="Lines Removed" value={log.stats.linesRemoved} color="red" />
          <Stat label="Files Modified" value={log.stats.filesModified} color="blue" />
        </div>
        <FileChangesList changes={log.changes} />
      </CardContent>
    </Card>
  );
}
```

**MCP Tools:**

```typescript
// Nova tool: registrar_implementacao
{
  name: "registrar_implementacao",
  description: "Registra log de implementação com estatísticas de código",
  inputSchema: {
    type: "object",
    properties: {
      descricao: { type: "string" },
      fase: { type: "number" },
      task_id: { type: "string" },
      arquivos_modificados: { type: "array" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["descricao", "fase", "estado_json", "diretorio"]
  }
}

// Nova tool: listar_logs
{
  name: "listar_logs",
  description: "Lista logs de implementação com filtros",
  inputSchema: {
    type: "object",
    properties: {
      fase: { type: "number" },
      desde: { type: "string" },
      ate: { type: "string" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["estado_json", "diretorio"]
  }
}
```

**Esforço Estimado:** 60-80 horas
- Backend (coleta + análise): 32h
- Git integration: 16h
- Frontend (visualização): 24h
- Testes: 8h

---

## 🟡 PRIORIDADE ALTA

### 5. Task Management Hierárquico

**Objetivo:** Sistema de tasks hierárquico similar ao Spec Workflow.

#### Especificação

```typescript
interface Task {
  id: string;                    // "1.2.1"
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  
  // Hierarquia
  parent?: string;               // "1.2"
  children?: string[];           // ["1.2.1.1", "1.2.1.2"]
  level: number;                 // 0, 1, 2, 3...
  
  // Dependencies
  dependencies: string[];        // IDs de tasks que devem ser completadas antes
  blockedBy?: string[];          // Tasks que estão bloqueando esta
  
  // Estimativas
  estimate: {
    hours: number;
    complexity: "baixa" | "media" | "alta";
  };
  
  // Tracking
  startedAt?: string;
  completedAt?: string;
  assignee?: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  phase: number;
}

interface TaskTree {
  root: Task[];
  byId: Record<string, Task>;
  byPhase: Record<number, Task[]>;
  byStatus: Record<string, Task[]>;
}
```

**Exemplo de Hierarquia:**
```
1.0 Setup do Projeto
  1.1 Configurar ambiente
    1.1.1 Instalar dependências
    1.1.2 Configurar ESLint
    1.1.3 Configurar TypeScript
  1.2 Estrutura de pastas
    1.2.1 Criar src/
    1.2.2 Criar tests/
    
2.0 Implementar Autenticação
  2.1 Backend
    2.1.1 Criar modelo User
    2.1.2 Implementar JWT
    2.1.3 Criar endpoints
  2.2 Frontend
    2.2.1 Criar tela de login
    2.2.2 Integrar com API
```

**MCP Tools:**

```typescript
// Nova tool: criar_task
{
  name: "criar_task",
  description: "Cria nova task no plano de execução",
  inputSchema: {
    type: "object",
    properties: {
      titulo: { type: "string" },
      descricao: { type: "string" },
      parent_id: { type: "string" },
      estimate_hours: { type: "number" },
      dependencies: { type: "array" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["titulo", "estado_json", "diretorio"]
  }
}

// Nova tool: atualizar_task
{
  name: "atualizar_task",
  description: "Atualiza status ou detalhes de uma task",
  inputSchema: {
    type: "object",
    properties: {
      task_id: { type: "string" },
      status: { type: "string" },
      notes: { type: "string" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["task_id", "estado_json", "diretorio"]
  }
}

// Nova tool: listar_tasks
{
  name: "listar_tasks",
  description: "Lista tasks com filtros e hierarquia",
  inputSchema: {
    type: "object",
    properties: {
      fase: { type: "number" },
      status: { type: "string" },
      parent_id: { type: "string" },
      estado_json: { type: "string" },
      diretorio: { type: "string" }
    },
    required: ["estado_json", "diretorio"]
  }
}
```

**Esforço Estimado:** 60-80 horas

---

### 6. Internacionalização (i18n)

**Objetivo:** Suporte a múltiplos idiomas para adoção global.

#### Especificação

**Idiomas Prioritários:**
1. 🇺🇸 English (EN)
2. 🇧🇷 Português (PT-BR) - Atual
3. 🇪🇸 Español (ES)

**Estrutura:**
```
content/
├── i18n/
│   ├── en/
│   │   ├── specialists/
│   │   ├── templates/
│   │   ├── guides/
│   │   └── messages.json
│   ├── pt-BR/
│   │   └── ...
│   └── es/
│       └── ...
```

**Esforço Estimado:** 80-100 horas

---

## 📊 Roadmap de Implementação

Ver documento: `03_ROADMAP_IMPLEMENTACAO.md`

---

## 🎯 Métricas de Sucesso

| Métrica | Baseline | Meta 3 meses | Meta 6 meses |
|---------|----------|--------------|--------------|
| **Adoção** | 10 usuários | 100 usuários | 500 usuários |
| **NPS** | N/A | 40+ | 60+ |
| **Time to Value** | 2 horas | 30 minutos | 15 minutos |
| **Completion Rate** | 30% | 60% | 80% |
| **Satisfação com UX** | N/A | 4.0/5.0 | 4.5/5.0 |

---

**Próximos Documentos:**
- `03_ROADMAP_IMPLEMENTACAO.md` - Roadmap detalhado
- `04_ARQUITETURA_DASHBOARD.md` - Arquitetura técnica do dashboard
- `05_SISTEMA_APROVACAO.md` - Detalhes do sistema de aprovação
