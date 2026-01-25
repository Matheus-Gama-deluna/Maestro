---
description: Workflow para correção de bugs com análise de causa raiz e segurança
---

# 🐛 /corrigir-bug - Workflow de Correção

## 1. Reprodução e Análise

*   **Estratégia:** Se o bug for crítico, arquitetural ou envolver múltiplos serviços, consulte `guides/guide-orquestracao.md` para ativar o **Modo Squad**.
*   **Ação:** Crie um caso de teste que reproduza o erro (se possível).
*   **Ação:** Analise a causa raiz.

## 2. Classificação de Segurança

*   **Ação:** O bug é uma vulnerabilidade de segurança?
    *   **Sim:** Leia imediatamente `rules/security-rules.md` para entender a categoria (ex: SQL Injection, XSS).
    *   **Não:** Prossiga normalmente.

## 3. Implementação da Correção

*   **Ação:** Implemente o fix.
*   **Regra:** Não altere comportamento não relacionado (escopo fechado).

## 4. Verificação

*   **Ação:** Rode o teste de reprodução (deve passar).
*   **Ação:** Rode testes de regressão (não deve quebrar nada existente).
*   **Revisão (Self-Code-Review):**
    *   Verifique se não deixou `console.log` (Regra `SEC-LOG`).
    *   Verifique se não hardcodou credenciais (Regra `A02-SECRET`).

## 5. Finalização

*   **Ação:** Atualize o histórico em `.maestro/resumo.json` registrando o bug fix.
