# 📏 Regras de Classificação e Score

> Definição dos critérios de aprovação baseados na complexidade do projeto.

## Tiers de Projeto (Nível de Rigor)

Consulte `.maestro/estado.json` para saber o nível do seu projeto.

### 🥉 Tier Essencial (POC, Script)
*   **Foco**: Funciona?
*   **Critérios de Check**:
    1.  Código executa sem erro fatal?
    2.  Objetivo principal foi atingido?
    3.  Existe um README.md básico?

### 🥈 Tier Base (Produto Interno, MVP)
*   **Foco**: Qualidade Mínima
*   **Critérios de Check (acumulativo)**:
    1.  Critérios do Tier Essencial ✅
    2.  Testes unitários existem (mesmo que poucos)?
    3.  Não há erros visíveis de Lint/Typescript?
    4.  Documentação técnica existe (`docs/`)?
    5.  Validação de dados (ex: Zod) implementada?

### 🥇 Tier Avançado (SaaS, Fintech, Alta Escala)
*   **Foco**: Robustez e Segurança
*   **Critérios de Check (acumulativo)**:
    1.  Critérios do Tier Base ✅
    2.  Segurança: Tratamento de erros e dados sensíveis?
    3.  Observabilidade: Logs estruturados previstos?
    4.  Testes de Integração/E2E previstos?
    5.  Arquitetura desacoplada (SOLID/Clean Arch)?

---

## 🧮 Como Calcular o Score (Manual)

Ao realizar o checklist do Tier correspondente:

1.  Conte o número total de perguntas do checklist (ex: 5 critérios).
2.  Conte quantas foram respondidas com "SIM" (ex: 4).
3.  Aplique a fórmula:
    ```
    Score = (Itens OK / Total) * 100
    ```
    *Exemplo: (4 / 5) * 100 = 80*

## 🚦 Tabela de Decisão

| Score Calculado | Ação Recomendada | Comando |
| :--- | :--- | :--- |
| **100** | Aprovado | ✅ Pode executar `/02-avancar-fase` |
| **70 a 99** | Aprovado com Ressalvas | ⚠️ Pode avançar, mas liste as pendências |
| **0 a 69** | **BLOQUEADO** | 🛑 NÃO avance. Solicite correções. |

> **Nota**: Se houver um bloqueio (Score < 70) mas o usuário EXIGIR avançar, trate como "Aprovação Manual" e peça uma justificativa.
