# Guia de Referência — Design

## Frameworks de UX Design

### Design Thinking (5 etapas)
1. **Empatia** — Entender o usuário real, não o imaginado
2. **Definição** — Sintetizar a dor principal em 1 frase
3. **Ideação** — Gerar múltiplas soluções antes de escolher
4. **Prototipagem** — Wireframe rápido para validar
5. **Teste** — Validar com usuários reais (ou cenários)

### Jornada do Usuário
- Mapear ANTES de desenhar telas
- Etapas: Entrada → Orientação → Ação → Feedback → Retorno
- Cada etapa tem: ação, tela, emoção, oportunidade de melhoria
- Fluxo principal primeiro, fluxos alternativos depois

### Atomic Design
| Nível | Exemplo | Quando usar |
|-------|---------|-------------|
| **Atoms** | Button, Input, Badge | Componentes unitários reutilizáveis |
| **Molecules** | SearchBar (Input+Button), Card | Combinações simples de atoms |
| **Organisms** | Header, Sidebar, TaskList | Seções completas da UI |
| **Templates** | DashboardLayout, KanbanLayout | Estrutura sem dados reais |
| **Pages** | Dashboard, ProjectBoard | Templates com dados reais |

## Design System — Mínimo Viável

### Cores obrigatórias (8 tokens)
`primary`, `primary-hover`, `secondary`, `background`, `surface`, `error`, `success`, `warning`

### Tipografia obrigatória (5 níveis)
H1, H2, H3, Body, Small — com fonte, tamanho e peso definidos

### Componentes obrigatórios (8 mínimos)
Button, Input, Card, Badge, Avatar, Modal, Toast, Table

## Acessibilidade WCAG 2.1 AA — Resumo

| Critério | Regra | Ferramenta de teste |
|----------|-------|---------------------|
| Contraste | ≥ 4.5:1 texto normal, ≥ 3:1 texto grande | WebAIM Contrast Checker |
| Labels | Todo input com `<label>` associado, não só placeholder | Lighthouse |
| Keyboard | Tab navega tudo, Enter ativa, Escape fecha | Teste manual |
| Focus | Outline visível em elementos interativos | CSS `:focus-visible` |
| Alt text | Imagens informativas com alt descritivo | HTML validator |
| Headings | H1→H2→H3 sem pular níveis | axe DevTools |
| Aria | Botões com ícone precisam de `aria-label` | axe DevTools |

## Estados de UI — Os 4 Obrigatórios

| Estado | O que mostrar | Anti-pattern |
|--------|--------------|-------------|
| **Loading** | Skeleton/shimmer no layout final | Spinner genérico sem contexto |
| **Empty** | Ilustração + mensagem + CTA | Tela em branco |
| **Error** | Mensagem clara + ação de retry | "Erro desconhecido" |
| **Success** | Dados reais + interações ativas | Página sem feedback visual |

## Anti-patterns de Design

| Anti-pattern | Correção |
|-------------|----------|
| Wireframes sem estados de UI | Documentar loading/empty/error para CADA tela |
| Design system "depois" | Definir cores, tipo e componentes ANTES dos wireframes |
| Ignorar mobile | Mobile-first: começar pelo menor breakpoint |
| Copiar referência sem adaptar | Usar como inspiração, adaptar para o contexto do projeto |
| Wireframes com dados falsos bonitos | Usar dados realistas: nomes reais, textos de tamanho real |
