# Guia de Referência — Frontend

## Processo por User Story

Para cada User Story do Backlog/Discovery:

```
1. Ler Design Doc → wireframe da tela
2. Criar componentes → Atomic Design (atoms → molecules → organisms)
3. Implementar state → hooks/stores para dados
4. Montar page → rota + layout + componentes
5. Integrar API → React Query + MSW (mock) ou real
6. Testar → Testing Library para componentes críticos
7. Verificar → responsividade + acessibilidade + estados UI
```

## Padrões de Componentes React

### Estrutura de arquivo
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component (named export)
// 4. Sub-components (se pequenos)
// 5. Styles (se CSS Modules) ou nada (se Tailwind)
```

### Convenções de naming
| Tipo | Formato | Exemplo |
|------|---------|---------|
| Componente | PascalCase | `TaskCard.tsx` |
| Hook | camelCase com `use` | `useTaskList.ts` |
| Utilitário | camelCase | `formatDate.ts` |
| Constante | SCREAMING_SNAKE | `MAX_TASKS_PER_PAGE` |
| Tipo/Interface | PascalCase com sufixo | `TaskCardProps`, `TaskDTO` |

## State Management

### Quando usar o quê
| Cenário | Solução |
|---------|---------|
| Dados do servidor (CRUD, listas) | React Query / SWR |
| Estado global do client (UI, theme, auth) | Zustand / Context |
| Estado local do componente (forms, toggles) | useState / useReducer |
| Formulários complexos | React Hook Form + Zod |

## Integração com API

### MSW (Mock Service Worker) — para desenvolvimento sem backend
```typescript
// handlers.ts — definir mocks para cada endpoint
rest.get('/api/tasks', (req, res, ctx) => {
  return res(ctx.json(mockTasks))
})
```

### React Query — para dados do servidor
```typescript
// Padrão: 1 hook por recurso
const useTasks = (projectId: string) =>
  useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getTasks(projectId),
  })
```

## Testes — Mínimo por componente

| Tipo | Ferramenta | O que testar |
|------|-----------|-------------|
| Unitário | Vitest + Testing Library | Render, interações, estados |
| Snapshot | Vitest | Regressão visual (opcional) |
| E2E | Playwright (na Integração) | Fluxos completos |

### Padrão AAA
```typescript
// Arrange — montar componente com props/mocks
// Act — simular interação (click, type, etc)
// Assert — verificar resultado (texto, estado, chamada)
```

## Checklist por Componente

- [ ] Props tipadas com interface
- [ ] Loading state (skeleton ou spinner)
- [ ] Error state (mensagem + retry)
- [ ] Empty state (mensagem + CTA)
- [ ] Responsivo (mobile + desktop)
- [ ] Acessível (label, aria, keyboard)
- [ ] Teste para caminho feliz
