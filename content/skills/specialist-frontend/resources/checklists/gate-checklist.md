# Gate Checklist — Frontend

> **Score mínimo para aprovação:** 70/100  
> **Validação:** Por existência de artefatos no disco (code-validator)

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Componentes implementados conforme design e user stories** | 20 | Componentes existem no disco, cobrem telas do MVP |
| 2 | **Pages com rotas configuradas** | 15 | Cada fluxo do MVP tem rota e page correspondente |
| 3 | **State management conectado** | 15 | Hooks/stores implementados para dados principais |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Integração com mocks ou API real** | 10 | MSW configurado ou chamadas à API funcionando |
| 5 | **Testes unitários para componentes críticos** | 10 | Pelo menos 1 teste por componente de fluxo principal |
| 6 | **Responsivo mobile-first** | 10 | Layout funciona em mobile (< 640px) |
| 7 | **Loading, empty e error states** | 10 | 3 estados implementados para fluxos com dados assíncronos |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Acessibilidade básica** | 5 | Labels em inputs, alt em imagens, focus visible |
| 9 | **Code splitting/lazy loading** | 3 | Pages carregam sob demanda |
| 10 | **TypeScript sem erros** | 2 | `tsc --noEmit` passa sem erros |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Componentes faltando | Revisar Design Doc → identificar telas não implementadas → criar componentes |
| Sem rotas | Configurar router com todas as URLs do mapa de navegação |
| Sem testes | Criar teste com Testing Library para cada componente de fluxo principal |
| Sem estados de UI | Adicionar loading (skeleton), empty (mensagem + CTA), error (retry) |
