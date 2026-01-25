---
description: Guia de implementação "Frontend-First" para Histórias de Usuário
---

# 🔨 Workflow de Implementação - /implementar-historia

> Este workflow deve ser invocado durante a **Fase de Implementação** (seja em um projeto novo ou feature). Ele garante que uma História de Usuário (User Story) seja entregue com qualidade e testabilidade.

## 0. Contexto

*   **Entrada:** ID da História (ex: `US-01`, `FEAT-A`)
*   **Pré-requisito:** Contrato de Interface definido (se houver API envolvida).
*   **Estratégia:** Se a história for muito complexa, considere usar **`/05-nova-feature`** ou consulte `guides/guide-orquestracao.md` para dividir o trabalho entre "Persona Backend" e "Persona Frontend".

## 1. 📜 Etapa 1: Definição de Contratos

Antes de escrever código de produto, defina as interfaces.

1.  **Schema OpenAPI (se Backend envolvido):**
    *   Crie/atualize `docs/api/openapi.yaml` com o endpoint.
2.  **Types TypeScript (Compartilhado):**
    *   Gere interfacesTS que representam a entrada e saída do endpoint.
    *   Salve em `src/types/` (ex: `src/types/pedido.ts`).

## 2. 🎭 Etapa 2: Mocking

Crie a infraestrutura para que o Frontend possa trabalhar independente do Backend.

1.  **Mock Data:**
    *   Crie um objeto JSON estático representando uma resposta de sucesso e casos de erro.

## 3. 🎨 Etapa 3: Frontend (Componentes)

Comece a UI usando os Mocks.

1.  **Componentes Visuais:**
    *   Implemente os componentes de UI (botões, formulários, listas).
2.  **Hooks/Services:**
    *   Crie a camada de serviço que consome o mock (e futuramente a API).
3.  **Teste de Componente:**
    *   Verifique se a tela renderiza corretamente com os dados do Mock.

## 4. ⚙️ Etapa 4: Backend

Implemente a lógica real.

1.  **DTOs:** Validação de entrada.
2.  **Controller/Service:** Lógica de negócio.
3.  **Repository:** Persistência.
4.  **Testes Unitários:** Garanta que a regra de negócio funcione isolada.

## 5. 🔗 Etapa 5: Integração e Limpeza

A hora da verdade.

1.  **Troca de Chave:** Aponte o serviço do Frontend para a API real (remova/desabilite o Mock).
2.  **Teste Integrado:** Siga o `guides/guide-testes.md` para validar casos de borda e happy path.
3.  **Teste E2E Manual:** Navegue pelo fluxo completo.
4.  **Validação de Segurança:** Consulte `rules/security-rules.md` e verifique seu código.

> ✅ **Conclusão:** Quando o fluxo funcionar ponta-a-ponta:
1.  Faça o `commit`.
2.  Execute `guides/internal/automated-map.md` para atualizar a estrutura.
3.  Registre o evento com `guides/internal/automated-events.md`.
