# Design Doc — TaskFlow

> **Fase:** 2 · Design  
> **Data:** 2026-03-01  
> **Status:** Aprovado  
> **Base:** Discovery (`docs/01-discovery/discovery.md`)

---

## 1. Visão do Sistema

### 1.1 Propósito

TaskFlow é uma plataforma web de gestão de tarefas para PMEs brasileiras com equipes de 5-20 pessoas. Centraliza projetos, tarefas e comunicação num único lugar com foco em simplicidade e produtividade.

### 1.2 Tom Visual

| Aspecto | Definição |
|---------|-----------|
| **Personalidade** | Profissional mas acessível — não corporativo, não infantil |
| **Sensação** | Limpo, organizado, produtivo — como uma mesa arrumada |
| **Referências** | Linear (foco e simplicidade), Notion (flexibilidade), Todoist (clareza) |

---

## 2. Personas e Cenários

### Persona 1: Marina — Gerente de Projetos

**Cenário principal:** Marina abre o TaskFlow no notebook às 8h para checar status dos 4 projetos. Precisa ver quais tarefas estão atrasadas e quem está bloqueado — em 30 segundos, sem clicar em cada projeto.

**Necessidades de UI:**
- Dashboard com resumo de TODOS os projetos visível sem scroll
- Indicadores visuais de atraso (vermelho) e risco (amarelo)
- Filtro rápido por "minhas tarefas" vs "do time"

### Persona 2: Carlos — Tech Lead

**Cenário principal:** Carlos abre o TaskFlow no monitor durante a daily standup. Compartilha tela mostrando o kanban do sprint atual. Precisa mover tarefas rapidamente e ver quem está com carga alta.

**Necessidades de UI:**
- Kanban com drag-and-drop fluido e responsivo
- Visualização de carga por membro (avatar + contagem)
- Quick-add de tarefa sem sair do board

---

## 3. Mapa de Jornada do Usuário

### Jornada: Criar e acompanhar tarefa (fluxo principal)

| Etapa | Ação do Usuário | Tela | Emoção | Oportunidade |
|-------|-----------------|------|--------|-------------|
| 1. Login | Acessa app, faz login com Google | Login page | Neutro | Login em 1 clique (OAuth) |
| 2. Dashboard | Vê resumo dos projetos | Dashboard | Orientado | Highlight de tarefas atrasadas |
| 3. Seleciona projeto | Clica no projeto ativo | Kanban board | Focado | Último projeto aberto por padrão |
| 4. Cria tarefa | Clica "+" ou usa quick-add | Modal/Inline form | Produtivo | Templates de tarefa por tipo |
| 5. Detalha | Adiciona descrição, responsável, prazo | Task detail drawer | Confiante | Sugestões de responsável baseado em carga |
| 6. Move tarefa | Drag-and-drop para "Doing" | Kanban board | Satisfeito | Animação suave de transição |
| 7. Verifica progresso | Volta ao dashboard | Dashboard atualizado | Confiante | Gráfico de burndown atualizado |

---

## 4. Arquitetura de Informação

### 4.1 Mapa de Navegação

```
[TaskFlow]
├── / (Landing page - marketing)
├── /login
├── /register
├── /app (Área autenticada)
│   ├── /dashboard (Home — resumo de todos os projetos)
│   ├── /projects
│   │   ├── /projects (Lista de projetos)
│   │   ├── /projects/new (Criar projeto)
│   │   └── /projects/[id] (Kanban board do projeto)
│   │       └── /projects/[id]/tasks/[taskId] (Detalhe - drawer)
│   ├── /my-tasks (Minhas tarefas - cross-project)
│   ├── /notifications
│   ├── /settings
│   │   ├── /settings/profile
│   │   └── /settings/team
│   └── /invite/[token] (Aceitar convite)
└── /404
```

### 4.2 Padrão de Navegação

| Dispositivo | Padrão | Componente |
|-------------|--------|-----------|
| **Desktop** | Sidebar fixa (240px) + Header com search | Sidebar: logo, nav items, user menu |
| **Mobile** | Bottom tabs (4 itens) + Hamburger para secundários | Dashboard, Projetos, Minhas Tarefas, Mais |
| **Tablet** | Sidebar colapsável (60px ícones) + Header | Toggle com botão hamburger |

---

## 5. Design System

### 5.1 Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | #2563EB (blue-600) | Botões primários, links, seleção ativa |
| `--primary-hover` | #1D4ED8 (blue-700) | Hover em botões primários |
| `--secondary` | #64748B (slate-500) | Textos secundários, ícones inativos |
| `--background` | #FFFFFF | Fundo principal |
| `--surface` | #F8FAFC (slate-50) | Cards, sidebar, painéis |
| `--border` | #E2E8F0 (slate-200) | Bordas de cards e inputs |
| `--error` | #EF4444 (red-500) | Erros, tarefas atrasadas, ações destrutivas |
| `--success` | #22C55E (green-500) | Tarefas concluídas, status ok |
| `--warning` | #F59E0B (amber-500) | Prazos próximos, alertas |
| `--info` | #3B82F6 (blue-500) | Informações, dicas |

### 5.2 Tipografia

| Elemento | Fonte | Tamanho | Peso |
|----------|-------|---------|------|
| **H1** | Inter | 28px / 1.75rem | 700 Bold |
| **H2** | Inter | 22px / 1.375rem | 600 Semibold |
| **H3** | Inter | 18px / 1.125rem | 600 Semibold |
| **Body** | Inter | 15px / 0.9375rem | 400 Regular |
| **Small** | Inter | 13px / 0.8125rem | 400 Regular |
| **Code** | JetBrains Mono | 13px | 400 Regular |

### 5.3 Componentes Base

| Componente | Variantes | Tamanhos |
|-----------|-----------|----------|
| **Button** | Primary, Secondary, Ghost, Destructive, Icon | sm (32px), md (36px), lg (40px) |
| **Input** | Text, Password, Search, Select, Textarea | sm, md |
| **Card** | Default, Elevated, Interactive (hover shadow) | — |
| **Badge** | Default (gray), Priority (P1-red, P2-orange, P3-blue, P4-gray) | sm, md |
| **Avatar** | Image, Initials (colorido por nome) | xs (24), sm (32), md (40), lg (48) |
| **Modal** | Default, Confirm (danger), Form | sm (400px), md (560px), lg (720px) |
| **Toast** | Success, Error, Warning, Info | auto-dismiss 5s |
| **Drawer** | Right-side, 480px width | — |
| **KanbanColumn** | Com header, contagem, add button | fluid width |
| **TaskCard** | Com título, badge de prioridade, avatar, prazo | — |

---

## 6. Wireframes

### Tela 1: Dashboard

**URL:** `/app/dashboard`  
**Persona:** Marina — verificação rápida de status  
**Objetivo:** Ver resumo de todos os projetos em 30 segundos

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Sidebar 240px]  │  [Header: "Dashboard" | Search | 🔔 Bell | Avatar] │
│                  │                                              │
│ 🏠 Dashboard     │  ┌─────────────────────────────────────────┐ │
│ 📁 Projetos      │  │ Resumo: 12 tarefas pendentes | 3 atrasadas │
│ ✅ Minhas Tarefas│  └─────────────────────────────────────────┘ │
│ ⚙️ Config        │                                              │
│                  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ ──────────       │  │ Projeto A│ │ Projeto B│ │ Projeto C│    │
│ Projetos:        │  │ 5 doing  │ │ 2 doing  │ │ 1 doing  │    │
│  • Projeto A     │  │ 1 atrasada│ │ 0 atrasada│ │ 2 atrasada│  │
│  • Projeto B     │  │ ████░ 60%│ │ ██░░░ 40%│ │ ███░░ 55%│   │
│  • Projeto C     │  └──────────┘ └──────────┘ └──────────┘    │
│                  │                                              │
│                  │  ┌─ Tarefas Atrasadas ──────────────────────┐│
│                  │  │ 🔴 Design da landing page - Projeto A     ││
│                  │  │ 🔴 API de autenticação - Projeto C        ││
│                  │  │ 🔴 Testes E2E do checkout - Projeto C     ││
│                  │  └──────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:** SummaryBar, ProjectCard (grid 3 cols), OverdueTaskList  
**Interações:** Click em ProjectCard → navega para kanban. Click em tarefa atrasada → abre drawer.

### Tela 2: Kanban Board

**URL:** `/app/projects/[id]`  
**Persona:** Carlos — gestão visual do sprint  
**Objetivo:** Ver e mover tarefas entre status com drag-and-drop

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header: "Projeto A" | Filtros | + Nova Tarefa]  │
│           │                                                   │
│           │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│           │ │ To Do(5)│ │Doing(3) │ │Review(2)│ │ Done(8) ││
│           │ │         │ │         │ │         │ │         ││
│           │ │┌───────┐│ │┌───────┐│ │┌───────┐│ │┌───────┐││
│           │ ││🔴 P1  ││ ││🟡 P2  ││ ││🔵 P3  ││ ││✅     │││
│           │ ││Design ││ ││API    ││ ││Tests  ││ ││Login  │││
│           │ ││📅 Mar5││ ││👤Carlos││ ││👤Ana  ││ ││👤João │││
│           │ │└───────┘│ │└───────┘│ │└───────┘│ │└───────┘││
│           │ │┌───────┐│ │┌───────┐│ │         │ │         ││
│           │ ││🟡 P2  ││ ││🔵 P3  ││ │         │ │         ││
│           │ ││Backend││ ││Docs   ││ │         │ │         ││
│           │ │└───────┘│ │└───────┘│ │         │ │         ││
│           │ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Componentes:** KanbanColumn (flex horizontal, scroll horizontal em mobile), TaskCard (draggable), FilterBar  
**Interações:** Drag-and-drop entre colunas. Click em TaskCard → abre TaskDetailDrawer à direita. Quick-add via input no topo de cada coluna.

### Tela 3: Task Detail (Drawer)

**URL:** `/app/projects/[id]/tasks/[taskId]` (drawer overlay)  
**Objetivo:** Ver e editar detalhes completos de uma tarefa

**Layout:**
```
┌──────────────────────────────────────────┐
│ [Drawer 480px - right side]               │
│                                          │
│ ╳ Fechar                                 │
│                                          │
│ # Design da Landing Page                 │
│ 🔴 P1 - Alta  │  📁 Projeto A           │
│                                          │
│ ──────────────────────────────           │
│ **Responsável:** 👤 Marina               │
│ **Prazo:** 📅 5 Mar 2026 (atrasado!)     │
│ **Status:** To Do → [dropdown]           │
│ **Labels:** design, frontend             │
│ ──────────────────────────────           │
│                                          │
│ ## Descrição                             │
│ Criar landing page responsiva seguindo   │
│ o design system definido...              │
│                                          │
│ ## Subtarefas (2/4)                      │
│ ✅ Definir copy principal                │
│ ✅ Escolher imagens                      │
│ ☐ Implementar mobile                     │
│ ☐ Implementar desktop                    │
│                                          │
│ ## Comentários                           │
│ 👤 Carlos: "Priorizar mobile-first"      │
│ 📅 1 Mar 2026                            │
│                                          │
│ [Input: Adicionar comentário...]         │
└──────────────────────────────────────────┘
```

---

## 7. Estados de UI

### Fluxo: Dashboard

| Estado | Visual | Comportamento |
|--------|--------|--------------|
| **Loading** | 3 skeleton cards em grid + skeleton da SummaryBar | Shimmer animation, 1-2s |
| **Empty** | Ilustração de foguete + "Crie seu primeiro projeto!" + botão CTA azul | Redireciona para /projects/new |
| **Error** | Banner vermelho no topo "Erro ao carregar projetos" + botão "Tentar novamente" | Retry com exponential backoff |
| **Success** | Grid de ProjectCards + SummaryBar + OverdueTaskList | Dados reais, atualiza a cada 30s |

### Fluxo: Kanban Board

| Estado | Visual | Comportamento |
|--------|--------|--------------|
| **Loading** | 4 colunas skeleton com 3 task cards skeleton cada | Shimmer |
| **Empty** | Colunas vazias + mensagem central "Nenhuma tarefa ainda" + botão "Criar tarefa" | Template de tarefa pré-preenchido |
| **Error** | Banner + "Erro ao carregar tarefas" + Retry | Fallback: mostrar cache local |
| **Success** | Colunas com TaskCards, drag-and-drop ativo | Optimistic updates no drag |

---

## 8. Acessibilidade

### 8.1 Checklist WCAG 2.1 AA

- [x] Contraste ≥ 4.5:1 para texto (blue-600 em white = 4.7:1 ✅)
- [x] Todos os inputs com label visível (não apenas placeholder)
- [x] Navegação completa via Tab (sidebar → header → content → drawer)
- [x] Focus ring visível (2px blue-500 com offset)
- [x] Imagens de avatar com alt="Avatar de [nome]"
- [x] Headings em ordem correta (H1 por page, H2 por seção)
- [x] Botões com ícone têm aria-label (ex: aria-label="Fechar drawer")
- [x] Skip-to-content link oculto visível com Tab
- [x] Drag-and-drop tem alternativa de teclado (Arrow keys + Enter para mover)
- [x] Toasts têm role="alert" e aria-live="polite"

### 8.2 Responsividade

| Breakpoint | Largura | Adaptação |
|-----------|---------|-----------|
| **Mobile** | < 640px | Sidebar vira bottom tabs (4 itens). Kanban: scroll horizontal. Cards: full width |
| **Tablet** | 640-1024px | Sidebar colapsável (60px). Kanban: 3 colunas visíveis. Dashboard: grid 2 cols |
| **Desktop** | > 1024px | Sidebar fixa (240px). Kanban: 4+ colunas. Dashboard: grid 3 cols |
