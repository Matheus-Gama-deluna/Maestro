---
description: Workflow para inicializar um novo projeto Maestro com estrutura completa
---

# 🚀 Workflow de Inicialização - /iniciar-projeto

## 0. Fase Zero: Brainstorming (Opcional)

*   **Condição:** Se o usuário não tem um escopo claro ou objetivo definido.
*   **Ação:** Consulte `guides/guide-brainstorm.md` para conduzir uma sessão de ideação antes de iniciar.

## 1. Coleta de Informações

*   **Ação:** Pergunte ao usuário o nome do projeto (se não fornecido).
*   **Ação:** Pergunte qual o objetivo principal (use a saída do Brainstorm).

## 2. Setup de Diretórios

*   **Ação:** Crie a estrutura de pastas usando `run_command` (mkdir) ou `write_to_file`.
    *   `.maestro/`
    *   `.maestro/history/`
    *   `docs/01-produto/`

## 3. Inicialização de Estado (JSON)

*   **Ação:** Crie ` .maestro/estado.json` (Estado Base):
```json
{
  "nome_projeto": "{NOME}",
  "fase_atual": 1,
  "fase_nome": "Produto",
  "tier": "base",
  "nivel": "a_definir",
  "created_at": "{DATA}",
  "updated_at": "{DATA}",
  "entregaveis": {}
}
```

*   **Ação:** Crie ` .maestro/resumo.json` (Cache de Memória):
```json
{
  "resumo_executivo": "Projeto {NOME}: {OBJETIVO}",
  "entregaveis": [],
  "contexto_atual": {
    "fase": "Produto",
    "objetivo": "Definir o MVP e criar o PRD"
  }
}
```

## 4. Boot da Fase 1

*   **Ação:** Identifique o especialista da fase 1 ("Gestão de Produto").
*   **Ação:** Identifique o template da fase 1 (`templates/PRD.md`).
*   **Resposta ao Usuário:**
    *   Confirme que a "Infraestrutura Maestro" foi criada.
    *   Assuma a persona de **Gerente de Produto**.
    *   Inicie o Discovery do Produto.
