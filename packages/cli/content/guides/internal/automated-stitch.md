---
description: Workflow para habilitar a fase de Prototipagem com Google Stitch
---

# 🧵 /habilitar-stitch - Prototipagem com IA

> Use este workflow preferencialmente **após concluir a Fase de UX Design**. Isso permite criar protótipos funcionais baseados nos wireframes/jornadas definidos.

## 1. Verificação de Pré-requisitos

*   **Ação:** Verifique se a Fase de UX (geralmente Fase 3) está concluída ou em andamento.
    *   *Motivo:* O Stitch precisa de contexto visual (descrições do Design Doc) para gerar bons resultados.

## 2. Injeção de Fase (Modificação de Fluxo)

*   **Ação:** Leia `.maestro/estado.json`.
*   **Lógica de Inserção:**
    1.  Identifique a Fase Atual (vamos assumir que é N).
    2.  O Stitch será inserido como a **Próxima Fase (N+1)**.
    3.  Todas as fases futuras (Arquitetura, Banco, etc.) devem ser **renumeradas (+1)**.
    4.  Atualize o `total_fases` (+1).

*   **Atualização do JSON (`estado.json`):**
    ```json
    {
      "usar_stitch": true,
      "total_fases": {TOTAL_ANTERIOR + 1},
      "fases_personalizadas": [
        {
          "numero": 4,
          "nome": "Prototipagem Stitch",
          "especialista": "Prototipagem Rápida",
          "template": "prototipo-stitch",
          "entregavel": "prototipos.md"
        }
      ]
    }
    ```
    *(Nota: A IA deve manter essa lógica "mentalmente" ou registrar no campo `fases_personalizadas` se o sistema suportar, ou simplesmente saber que agora existe uma fase extra).*

## 3. Execução da Fase

*   **Ação:** Se estiver pronto para começar agora, carregue o template `templates/prototipo-stitch.md`.
*   **Instrução:**
    1.  Converta as jornadas de UX em Prompts para o Stitch.
    2.  Gere as telas.
    3.  Salve o código/assets em `docs/04-prototipagem/`.

## 4. Confirmação

*   **Mensagem:** "Fase de Prototipagem habilitada. O fluxo foi ajustado."
