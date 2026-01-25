# 🧪 Guia de Estratégia de Testes

> Referência para garantir qualidade em cada entrega.

---

## A Pirâmide de Testes (Aplicada)

Não tente testar tudo igual. Distribua o esforço:

### 1. Unitários (70% do esforço)
*   **Onde:** `src/utils/*.ts`, Regras de Negócio, Hooks complexos.
*   **Ferramenta:** Jest / Vitest.
*   **Foco:** Entradas e Saídas de funções isoladas.
*   **Obrigatório para:** Qualquer lógica com `if/else`.

### 2. Integração (20% do esforço)
*   **Onde:** API Endpoints (`/api/*`), Componentes Conectados.
*   **Ferramenta:** React Testing Library, Supertest.
*   **Foco:** "O componente renderiza com dados da API?", "O endpoint salva no banco?".

### 3. E2E (10% do esforço)
*   **Onde:** Fluxos Críticos (Login, Checkout).
*   **Ferramenta:** Playwright / Cypress.
*   **Foco:** "O usuário consegue completar a tarefa?".

---

## Checklist de Qualidade (Quality Gate)

Antes de entregar qualquer História (`/04-implementar-historia`):

- [ ] **Happy Path:** O fluxo principal funciona?
- [ ] **Edge Cases:** Testou inputs vazios, nulos ou inválidos?
- [ ] **Error Handling:** O sistema quebra ou mostra mensagem amigável?
- [ ] **Segurança:** Dados sensíveis estão protegidos?

---

## Comandos Úteis

```bash
# Rodar todos os testes
npm test

# Rodar com cobertura
npm test -- --coverage

# Rodar apenas testes alterados (Watch mode)
npm test -- --watch
```
