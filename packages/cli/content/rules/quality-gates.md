# 🔐 Quality Gates e Estruturas

> Este arquivo é a fonte da verdade para validar a qualidade e estrutura dos entregáveis.

---

## 🏗️ 1. Validação Estrutural (Obrigatória)

**Instrução:** Para cada fase, consulte o arquivo `rules/structure-rules.md`. Ele contém a tabela exata de regexes obrigatórias.

| Fase | Arquivo Alvo | Referência |
|------|--------------|------------|
| **Todas as Fases** | `docs/XX-nome/arquivo.md` | Consulte `rules/structure-rules.md` |

---

## 🧠 2. Validação Lógica (Semântica)

**Instrução:** Leia o conteúdo e aplique a lógica de verificação da transição atual.

### Transição: Produto → Requisitos
*   **Contexto:** Comparar `PRD.md` vs `requisitos.md`.
*   **Regra Lógica:**
    *   `PARA CADA` funcionalidade no MVP do PRD:
        *   `VERIFIQUE SE` existe um requisito funcional correspondente em `requisitos.md`.
    *   `SE` cobertura < 100%:
        *   ❌ Falha: Cite as funcionalidades faltantes.

### Transição: Requisitos → UX Design
*   **Contexto:** Ler `requisitos.md` vs `design-doc.md`.
*   **Regra Lógica:**
    *   `PARA CADA` requisito funcional crítico:
        *   `VERIFIQUE SE` existe um fluxo de usuário ou tela descrita no Design Doc.

### Transição: Arquitetura → Banco de Dados
*   **Contexto:** Ler `arquitetura.md` e `modelo-dominio.md`.
*   **Regra Lógica:**
    *   `VERIFIQUE SE` todas as entidades listadas no Modelo de Domínio possuem tabelas/coleções correspondentes no Design de Banco.

### Transição: Contrato API → Implementação (Backend/Frontend)
*   **Contexto:** Ler `openapi.yaml` vs Código.
*   **Regra Lógica:**
    *   `VERIFIQUE SE` todos os endpoints definidos no contrato existem no código.

---

## 🚦 3. Tabela de Decisão (Score)

Use em conjunto com `validation-rules.md` para determinar o Tier.

| Score Calculado | Ação do Agente |
| :--- | :--- |
| **100%** | ✅ **APROVAR**: Executar o avanço de fase. |
| **70% - 99%** | ⚠️ **ALERTA**: Listar pendências, mas permitir avanço (pergunte ao usuário). |
| **< 70%** | 🛑 **BLOQUEAR**: Não avance. Liste erros e pare. |
