---
description: Adicionar nova feature com fluxo estruturado (Análise → Implementação → Deploy)
---

# 🆕 /nova-feature - Workflow de Nova Feature

## 1. Preparação (Análise de Impacto)

*   **Estratégia:** Verifique a complexidade. Se envolver múltiplos domínios ou alto risco, consulte `guides/guide-orquestracao.md` para ativar o **Modo Squad**.
*   **Ação:** Pergunte ao usuário a descrição da feature e o impacto estimado (baixo/médio/alto).
*   **Ação:** Crie o diretório `docs/features/{FEATURE-ID}/`.
*   **Ação:** Crie o arquivo `docs/features/{FEATURE-ID}/01-analise.md` com a análise inicial:
    *   Tabelas afetadas
    *   Novos Endpoints
    *   Componentes de UI necessários

## 2. Refinamento e Design

*   **Instrução:** Use o workflow padrão `/02-avancar-fase` para mover a feature para Design.
*   **Entregável Esperado:** Contrato de Interface (OpenAPI) e Mockups/Wireframes se necessário.

## 3. Implementação (O "Core")

> Aqui usamos o workflow especializado de granularidade fina.

*   **Ação:** Quebre a feature em Histórias de Usuário (ex: `US-01: Criar API`, `US-02: Tela de Listagem`).
*   **Para cada História:**
    *   Execute o workflow: **`/04-implementar-historia`**
    *   Siga ordenadamente: Types -> Mocks -> Frontend -> Backend -> Integração.

## 4. Testes e Validação

*   **Verificação de Segurança:** Antes de finalizar, leia `rules/security-rules.md` e revise o código.
*   **Testes:** Garanta que os testes criados na fase de implementação estão passando.

## 5. Deploy e Encerramento

*   **Ação:** Atualize o `estado.json` (ou use `/02-avancar-fase`) para marcar a feature como CONCLUÍDA.
*   **Resumo:** Atualize `.maestro/resumo.json` adicionando a feature ao histórico.
