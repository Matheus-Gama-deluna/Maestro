# Design Doc — [NOME DO PROJETO]

> **Fase:** 2 · Design  
> **Data:** [DATA]  
> **Autor:** Especialista de Design + Usuário  
> **Status:** Draft | Em Revisão | Aprovado  
> **Base:** Discovery Doc (`docs/01-discovery/discovery.md`)

---

## 1. Visão do Sistema

### 1.1 Propósito

[PREENCHER — O que o sistema é e para quem, em 2-3 frases. Extrair do Discovery.]

### 1.2 Tom Visual

| Aspecto | Definição |
|---------|-----------|
| **Personalidade** | [Ex: Profissional e acessível, não corporativo demais] |
| **Sensação** | [Ex: Limpo, organizado, produtivo] |
| **Referências** | [Ex: Notion (simplicidade), Linear (foco), Stripe (elegância)] |

---

## 2. Personas e Cenários

<!-- Resumo das personas do Discovery com cenários de uso específicos para design -->

### Persona 1: [NOME]

**Cenário principal:** [Ex: "Maria abre o app no celular durante o café da manhã para checar tarefas do dia. Precisa ver tudo em 10 segundos sem scrollar muito."]

**Necessidades de UI:**
- [Ex: Dashboard resumido visível sem scroll em mobile]
- [Ex: Ações rápidas acessíveis com 1 toque]
- [Ex: Notificações não intrusivas de tarefas vencidas]

### Persona 2: [NOME]

**Cenário principal:** [PREENCHER]

**Necessidades de UI:**
- [PREENCHER]
- [PREENCHER]

---

## 3. Mapa de Jornada do Usuário

<!-- Jornada do fluxo PRINCIPAL — da entrada ao objetivo concluído -->

### Jornada: [NOME DO FLUXO PRINCIPAL]

| Etapa | Ação do Usuário | Tela/Componente | Emoção | Oportunidade |
|-------|-----------------|-----------------|--------|-------------|
| 1. Entrada | [Ex: Acessa URL] | Landing/Login | [Ex: Curioso] | [Ex: Onboarding rápido] |
| 2. Orientação | [Ex: Vê dashboard] | Dashboard | [Ex: Orientado] | [Ex: Tutorial contextual] |
| 3. Ação principal | [Ex: Cria tarefa] | Formulário | [Ex: Produtivo] | [Ex: Templates prontos] |
| 4. Feedback | [Ex: Vê confirmação] | Toast/Redirect | [Ex: Satisfeito] | [Ex: Sugestão de próximo passo] |
| 5. Retorno | [Ex: Volta ao dashboard] | Dashboard atualizado | [Ex: Confiante] | [Ex: Progresso visual] |

---

## 4. Arquitetura de Informação

### 4.1 Mapa de Navegação

<!-- Hierarquia de telas e como o usuário navega entre elas -->

```
[App]
├── / (Landing/Marketing)
├── /login
├── /register
├── /app (Área autenticada)
│   ├── /dashboard (Home)
│   ├── /[recurso-principal]
│   │   ├── /lista
│   │   ├── /novo
│   │   └── /[id] (detalhe)
│   ├── /perfil
│   └── /configuracoes
└── /404
```

### 4.2 Padrão de Navegação

| Dispositivo | Padrão | Componente |
|-------------|--------|-----------|
| **Desktop** | [Ex: Sidebar fixa + Header] | [Ex: Sidebar 240px + TopBar] |
| **Mobile** | [Ex: Bottom tabs + Hamburger] | [Ex: BottomNav 5 itens] |
| **Tablet** | [Ex: Sidebar colapsável] | [Ex: Sidebar mini 60px] |

---

## 5. Design System

### 5.1 Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | [Ex: #2563EB (blue-600)] | Ações principais, links |
| `--primary-hover` | [Ex: #1D4ED8 (blue-700)] | Hover em botões primários |
| `--secondary` | [Ex: #64748B (slate-500)] | Textos secundários |
| `--background` | [Ex: #FFFFFF] | Fundo principal |
| `--surface` | [Ex: #F8FAFC (slate-50)] | Cards, painéis |
| `--error` | [Ex: #EF4444 (red-500)] | Erros, ações destrutivas |
| `--success` | [Ex: #22C55E (green-500)] | Confirmações, status ok |
| `--warning` | [Ex: #F59E0B (amber-500)] | Alertas, atenção |

### 5.2 Tipografia

| Elemento | Fonte | Tamanho | Peso |
|----------|-------|---------|------|
| **H1** | [Ex: Inter] | [Ex: 32px / 2rem] | [Ex: 700 Bold] |
| **H2** | [Ex: Inter] | [Ex: 24px / 1.5rem] | [Ex: 600 Semi] |
| **H3** | [Ex: Inter] | [Ex: 20px / 1.25rem] | [Ex: 600 Semi] |
| **Body** | [Ex: Inter] | [Ex: 16px / 1rem] | [Ex: 400 Regular] |
| **Small** | [Ex: Inter] | [Ex: 14px / 0.875rem] | [Ex: 400 Regular] |
| **Code** | [Ex: JetBrains Mono] | [Ex: 14px] | [Ex: 400] |

### 5.3 Componentes Base

| Componente | Variantes | Tamanhos |
|-----------|-----------|----------|
| **Button** | Primary, Secondary, Ghost, Destructive | sm, md, lg |
| **Input** | Text, Password, Search, Select | sm, md |
| **Card** | Default, Elevated, Interactive | — |
| **Badge** | Default, Success, Warning, Error | sm, md |
| **Avatar** | Image, Initials, Icon | xs, sm, md, lg |
| **Modal** | Default, Confirm, Form | sm, md, lg |
| **Toast** | Success, Error, Warning, Info | — |
| **Table** | Default, Striped, Sortable | — |

---

## 6. Wireframes

<!-- Cada tela principal descrita em markdown estruturado. Foco em LAYOUT e CONTEÚDO, não pixels. -->

### Tela 1: [NOME DA TELA]

**URL:** [Ex: /app/dashboard]  
**Persona:** [Ex: Maria — verificação rápida]  
**Objetivo:** [Ex: Ver resumo de tarefas do dia em 10 segundos]

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [Header: Logo | Search | Notifications | Avatar] │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  [Conteúdo principal]            │
│          │                                  │
│ - Item 1 │  [Card: Resumo do dia]           │
│ - Item 2 │  [Card: Tarefas pendentes]       │
│ - Item 3 │  [Card: Atividade recente]       │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

**Componentes:**
- [Ex: Header com SearchInput + NotificationBell + AvatarMenu]
- [Ex: SummaryCard com contadores (pendentes, concluídas, atrasadas)]
- [Ex: TaskList com filtro por status e ordenação por prioridade]

**Interações:**
- [Ex: Click em tarefa → abre detalhe em drawer lateral]
- [Ex: Quick-add via input no topo da lista]

### Tela 2: [NOME DA TELA]

<!-- Repetir o mesmo formato para cada tela do MVP -->

[PREENCHER]

### Tela 3: [NOME DA TELA]

[PREENCHER]

---

## 7. Estados de UI

<!-- Para cada fluxo crítico, documentar os 4 estados obrigatórios -->

### Fluxo: [NOME DO FLUXO PRINCIPAL]

| Estado | Visual | Comportamento |
|--------|--------|--------------|
| **Loading** | [Ex: Skeleton placeholders nas cards] | [Ex: Shimmer animation, 3 skeletons] |
| **Empty** | [Ex: Ilustração + "Nenhuma tarefa ainda" + CTA] | [Ex: Botão "Criar primeira tarefa"] |
| **Error** | [Ex: Banner vermelho + "Erro ao carregar" + Retry] | [Ex: Botão "Tentar novamente" + fallback cache] |
| **Success** | [Ex: Lista populada com dados reais] | [Ex: Infinite scroll ou paginação] |

---

## 8. Acessibilidade

### 8.1 Checklist WCAG 2.1 AA

- [ ] Contraste de cores ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande
- [ ] Todos os inputs com label associado (não apenas placeholder)
- [ ] Navegação completa via teclado (Tab, Enter, Escape)
- [ ] Focus visible em todos os elementos interativos
- [ ] Imagens com alt text descritivo
- [ ] Hierarquia de headings correta (H1 → H2 → H3)
- [ ] Aria-labels em botões com apenas ícone
- [ ] Skip-to-content link no topo da página
- [ ] Formulários com mensagens de erro associadas ao campo

### 8.2 Responsividade

| Breakpoint | Largura | Adaptação |
|-----------|---------|-----------|
| **Mobile** | < 640px | Stack vertical, bottom nav, cards fullwidth |
| **Tablet** | 640-1024px | Sidebar colapsável, grid 2 colunas |
| **Desktop** | > 1024px | Sidebar fixa, grid 3+ colunas |

---

## Checklist de Completude

- [ ] Jornada do usuário principal mapeada completa
- [ ] Wireframes cobrem TODAS as telas do MVP
- [ ] Design system definido (cores, tipografia, componentes)
- [ ] Navegação e mapa de telas claro
- [ ] Estados de UI (loading, empty, error) documentados
- [ ] Acessibilidade WCAG 2.1 AA considerada
- [ ] Responsividade mobile-first planejada
