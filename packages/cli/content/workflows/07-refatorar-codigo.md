---
description: Workflow para refatoração segura de código existente
---

# 🧹 /refatorar-codigo - Workflow de Refatoração

## 1. Análise Prévia

*   **Estratégia:** Se a refatoração for estrutural ou de alto risco, consulte `guides/guide-orquestracao.md` para ativar o **Modo Squad**.
*   **Ação:** Identifique a área a ser refatorada (arquivo, função, módulo).
*   **Ação:** Entenda o "Motivo" (Legibilidade, Performance, Segurança, Estrutura).
*   **Ação:** **Importante**: Garanta que existem testes cobrindo essa área. Se não houver, crie um "Teste de Caracterização" (Snapshot/Unitário) antes de tocar no código.

## 2. Consulta de Regras

*   **Ação:** Se for refatoração de Segurança, leia `rules/security-rules.md`.
*   **Ação:** Se for refatoração de Estrutura, consulte `.maestro/mapa.md` para entender dependências.

## 3. Execução (Ciclo Red-Green-Refactor)

*   **Passo 1:** Rode os testes (Devem passar: 🟢).
*   **Passo 2:** Aplique uma pequena mudança de refatoração.
*   **Passo 3:** Rode os testes (Devem passar: 🟢).
*   **Passo 4:** Repita.

## 4. Atualização de Mapa

*   **Ação:** Se você alterou nomes de classes, arquivos ou assinaturas de API:
    *   Execute `guides/internal/automated-map.md`.
*   **Ação:** Registre o evento de refatoração via `guides/internal/automated-events.md`.

## 5. Registro

*   **Ação:** Registre a refatoração no `.maestro/resumo.json`.
