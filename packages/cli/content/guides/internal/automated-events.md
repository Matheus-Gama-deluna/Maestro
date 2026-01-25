---
description: Workflow auxiliar para registrar eventos no histórico do projeto
---

# 📜 /registrar-evento - Log de Auditoria

> O Maestro FS mantém um histórico sequencial de tudo que acontece no projeto. Use este workflow para adicionar entradas.

## 1. Estrutura do Evento

*   **Arquivo Alvo:** `.maestro/history/events.jsonl`
*   **Formato (JSON Lines):**
    ```json
    {"ts": "ISO-DATE", "type": "EVENT_TYPE", "fase": 1, "data": {...}}
    ```

## 2. Tipos de Evento Comuns

*   `fase_iniciada`: Quando `/iniciar-projeto` ou transição ocorre.
*   `gate_validado`: Resultado do `/avancar-fase`.
*   `entregavel_salvo`: Novo arquivo em `docs/`.
*   `feature_start`: Início de `/nova-feature`.

## 3. Ação

*   **Instrução:** Adicione uma nova linha ao final do arquivo `events.jsonl` com o JSON do evento.
*   **Nota:** Se o diretório `history/` não existir, crie-o.
