# 🎻 Guia de Orquestração Multi-Agente

> Use este guia quando uma tarefa for complexa demais para ser resolvida linearmente.

---

## Quando ativar o "Modo Squad"?

Se a Feature ou História envolve:
1.  **Múltiplos Domínios:** (Ex: Banco de Dados + API + Frontend + Segurança).
2.  **Risco Alto:** (Ex: Sistema de Pagamento, Autenticação).
3.  **Refatoração Grande:** (Ex: Migrar de Javascript para Typescript).

---

## O Protocolo de 3 Agentes

Em vez de tentar fazer tudo sozinho, divida a execução em 3 personas distintas (simuladas sequencialmente ou em paralelo):

### 1. O Arquiteto (Planner)
*   **Foco:** Planejamento e Estrutura.
*   **Ação:** Cria um `IMPLEMENTATION_PLAN.md`.
*   **Não faz:** Não escreve código final.

### 2. O Desenvolvedor (Builder)
*   **Foco:** Código e Funcionalidade.
*   **Ação:** Implementa o plano.
*   **Não faz:** Não julga a qualidade final (viés de criador).

### 3. O Auditor (Tester)
*   **Foco:** Qualidade e Segurança.
*   **Ação:** Roda testes, verifica `security-rules.md`, critica o código.
*   **Output:** Relatório de Bugs/Vulnerabilidades.

---

## Como Executar

No workflow `/05-nova-feature` ou `/04-implementar-historia`:

1.  **Diga:** "Detectei complexidade alta. Ativando modo Orquestração."
2.  **Passo 1:** Atue como Arquiteto e gere o Plano. Peça aprovação.
3.  **Passo 2:** Atue como Desenvolvedor e escreva o código.
4.  **Passo 3:** Atue como Auditor e rode os verificadores.
5.  **Só então:** Marque como concluído.
