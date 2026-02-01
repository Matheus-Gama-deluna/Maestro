# 🧠 01. Conceitos Fundamentais

## A Filosofia do Orquestrador

A premissa central deste sistema é elevar o papel da IA de um "Assistente Passivo" (que apenas responde a perguntas) para um **"Orquestrador Ativo"**.

Imagine que você está em sua IDE (VSCode, Cursor, Windsurf) e tem acesso a um assistente de IA poderoso. Em vez de apenas gerar trechos de código isolados, você tem um **sistema de engenharia de software completo** rodando localmente na sua máquina.

### O "Maestro" vs. O Assistente

| Característica | Assistente de IA Comum | Orquestrador MCP ("Maestro") |
| :--- | :--- | :--- |
| **Escopo** | Responde perguntas isoladas | Gerencia o ciclo de vida do projeto |
| **Memória** | Limitada à conversa atual | Persistente (Estado do Projeto, ADRs) |
| **Ação** | Sugere código | Executa, testa e valida ações |
| **Visão** | Arquivo atual | Todo o repositório + Histórico Git |
| **Postura** | Reativa ("O que faço?") | Proativa ("Detectei um erro, posso corrigir?") |

## As 5 Camadas de Orquestração

Para atingir esse nível de sofisticação, o sistema opera em cinco camadas distintas e interconectadas:

### 1. Camada de Entendimento (Understanding Layer)
Mapeia proativamente o contexto do projeto.
- **O que faz:** Escaneia a codebase, entende a arquitetura atual, lê documentação, analisa dependências e histórico do Git.
- **Resultado:** Um "Modelo Mental" do projeto, atualizado em tempo real.

### 2. Camada de Planejamento (Planning Layer)
Decompõe objetivos complexos em planos executáveis.
- **O que faz:** Recebe uma solicitação (ex: "Criar sistema de cupons"), quebra em tarefas menores, define ordem de execução e critérios de sucesso.
- **Resultado:** Um plano de implementação estruturado (sprints, tasks).

### 3. Camada de Execução (Execution Layer)
Realiza o trabalho pesado de forma controlada.
- **O que faz:** Cria arquivos, edita código, roda comandos de terminal. Opera em passos discretos e reversíveis.
- **Resultado:** Código gerado e modificado no sistema de arquivos.

### 4. Camada de Validação (Validation Layer)
O "Guardião da Qualidade".
- **O que faz:** Verifica cada passo executado. Roda linters, testes unitários, testes de arquitetura e validações de segurança.
- **Resultado:** Aprovação para prosseguir ou bloqueio para correção.

### 5. Camada de Aprendizado (Learning Layer)
A memória evolutiva do sistema.
- **O que faz:** Registra decisões tomadas (ADRs), padrões que funcionaram e erros cometidos.
- **Resultado:** O sistema fica "mais inteligente" e adaptado ao seu projeto específico com o tempo.

## Valores Fundamentais

1.  **Consistência Arquitetural:** O sistema garante que todo novo código siga os padrões definidos (ex: Clean Architecture).
2.  **Validação Implacável:** Nada é considerado "pronto" sem passar por testes e verificações rigorosas.
3.  **Transparência:** O desenvolvedor sempre sabe o que o orquestrador está fazendo e mantém o poder de decisão final.
4.  **Segurança:** O sistema roda localmente, respeitando as fronteiras de segurança do seu ambiente.
