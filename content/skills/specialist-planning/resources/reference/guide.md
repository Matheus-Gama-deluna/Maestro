# Guia de Referência — Planejamento

## User Story — Formato INVEST

| Critério | Significado | Teste |
|----------|------------|-------|
| **I**ndependent | Pode ser implementada sozinha | Não depende de outra US para funcionar |
| **N**egotiable | Escopo ajustável | Não é contrato rígido |
| **V**aluable | Entrega valor ao usuário | Tem benefício claro |
| **E**stimable | Time consegue estimar | Escopo claro o suficiente |
| **S**mall | Cabe em 1 sprint | < 13 story points |
| **T**estable | Tem critério de aceite | Given/When/Then definido |

## Formato de User Story

```
US-001: [Título curto]
Como [persona], quero [ação], para [benefício]
Tipo: FE | BE | Full
Épico: [Nome do épico]
Pontos: [1, 2, 3, 5, 8, 13]
Sprint: [Número]

Critérios de Aceite:
- [ ] Given... When... Then...
- [ ] Given... When... Then...
```

## Estimativa — T-shirt Sizing → Story Points

| T-shirt | Story Points | Significa |
|---------|:------------:|-----------|
| **XS** | 1 | Mudança trivial, < 1h |
| **S** | 2-3 | Task simples, < 4h |
| **M** | 5 | Task média, ~1 dia |
| **L** | 8 | Task complexa, ~2 dias |
| **XL** | 13 | Deve ser dividida |

## Sprint Planning — Regras

| Regra | Valor |
|-------|-------|
| Duração do sprint | 1-2 semanas |
| Capacidade por dev/sprint | 15-25 pontos |
| Cada sprint tem objetivo | 1 frase descrevendo o que entrega |
| US ordenadas por prioridade | Alta primeiro, Baixa por último |
| Dependências resolvidas | BE antes de FE quando necessário |

## Endpoints de API — Derivação do Modelo

Para cada entidade principal do modelo de dados:

| Operação | Método | URL Pattern | Body |
|----------|--------|-------------|------|
| Listar | GET | `/api/{entities}?page=1&limit=20` | — |
| Detalhar | GET | `/api/{entities}/:id` | — |
| Criar | POST | `/api/{entities}` | `{ ...fields }` |
| Atualizar | PATCH | `/api/{entities}/:id` | `{ ...partial }` |
| Deletar | DELETE | `/api/{entities}/:id` | — |

## Estratégia de Testes — Pirâmide

```
        /\          E2E (5-10%)
       /  \         Fluxos críticos: login → ação → verificação
      /----\
     /      \       Integração (20-30%)
    /--------\      API endpoints, DB queries
   /          \
  /------------\    Unitário (60-70%)
                    Services, utils, validators
```

| Camada | Ferramenta | Cobertura Mínima |
|--------|-----------|-----------------|
| Unitário | Vitest/Jest | 70% dos services |
| Integração | Supertest | Endpoints principais |
| E2E | Playwright | Login + fluxo principal |

## Definition of Done — Template

Uma User Story é "Done" quando:
- [ ] Código implementado e commitado
- [ ] Testes unitários passando
- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Code review aprovado (se aplicável)
- [ ] Funcionalidade testada manualmente
- [ ] Documentação atualizada (se API mudou)
