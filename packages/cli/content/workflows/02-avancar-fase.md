---
description: Workflow MESTRE para avançar fases com validação, classificação e persistência robusta
---

# 🔄 Workflow de Avanço - /avancar-fase

## 1. Leitura de Estado

*   **Ação:** Leia o arquivo `.maestro/estado.json`.
*   **Dados:** Identifique `fase_atual`, `tier`, `nome_projeto`.
*   **Ação:** Identifique o arquivo entregável da fase atual (ex: `docs/01-produto/PRD.md`).

## 2. Validação de Gate (Checklist Mestre)

*   **Referência:** `.maestro/content/rules/quality-gates.md`
*   **Passo 2.1: Estrutura**: Verifique se o entregável tem tamanho > 200 chars e possui as seções obrigatórias.
*   **Passo 2.2: Semântica**: Verifique a lógica da transição específica.
*   **Decisão**:
    *   `SE` falhar em qualquer validação crítica: **PARE**. Retorne erro ao usuário.

## 2.5 Orquestração de Review (Momentum)

*   **Condição:** Se o projeto for **Tier Avançado** ou a fase for crítica (ex: Arquitetura).
*   **Ação:** Ative o **Modo Squad** (via `guides/guide-orquestracao.md`) para simular uma banca examinadora:
    1.  **Persona Produto:** "Isso atende o usuário?"
    2.  **Persona Tech:** "Isso escala? É seguro?"
    3.  **Persona QA:** "Está testável?"
*   **Decisão:** Só aprove o gate se as 3 personas concordarem.

## 3. Gestão Inteligente (Condicional)

### Apenas se Fase Atual == 1 (Produto)
*   **Ação:** Leia o arquivo `.maestro/content/rules/complexity-rules.md`.
*   **Execução:**
    1.  Analise o `PRD.md` buscando as keywords da tabela de pontuação.
    2.  Some os pontos (Entidades + Integrações + Segurança + etc).
    3.  Defina o **Nível** (Simples/Médio/Complexo).
*   **Persistência**: Atualize `.maestro/estado.json` com o novo `nivel` e `total_fases`.

## 4. Persistência de Resumo (Memória)

*   **Ação:** Leia (ou crie) `.maestro/resumo.json`.
*   **Execução**:
    1.  Crie uma entrada na lista `entregaveis` com um resumo de 1 linha do que foi feito nesta fase.
    2.  Atualize o campo `contexto_atual` com o objetivo da próxima fase.
*   **Persistência**: Salve o arquivo atualizado.

## 5. Atualização de Estado e Transição

*   **Ação:** Atualize `.maestro/estado.json`:
    *   `fase_atual`: incremente +1.
    *   `status`: "in_progress".
    *   `updated_at`: data/hora atual.
    *   `entregaveis`: adicione o path do arquivo aprovado.

## 6. Carregamento da Próxima Fase



*   **Ação:** Identifique o próximo especialista usando `guides/fases-mapeamento.md`.
*   **Ação:** Liste os **Prompts Recomendados** encontrados na tabela para o usuário.
*   **Ação (Automática):** Se estiver concluindo a **Fase de UX (3)** e o projeto for visual:
    *   Execute `guides/internal/automated-stitch.md` para verificar e ativar a prototipagem.
*   **Ação Final:** Execute a automação `guides/internal/automated-system.md` para persistir o contexto global.
*   **Ação Final:** Registre o evento usando `guides/internal/automated-events.md`.

*   **Resposta ao Usuário:**
    *   ✅ **Confirmação**: "Fase X concluída (Score: Y%)."
    *   📊 **Classificação** (Se Fase 1): "Projeto classificado como **[NÍVEL]** ([PONTOS] pts)."
    *   🚀 **Próximo Passo**: "Iniciando Fase [N+1]: [NOME]. Especialista carregado."
    *   📚 **Prompts Sugeridos**: [Liste os prompts aqui]
    *   **Imediatamente**: Assuma a persona e peça o primeiro input da nova fase.
