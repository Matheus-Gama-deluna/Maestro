# 01 - Objetivos e Visão Geral do Maestro (v6.0)

O **Maestro MCP** é um servidor *Model Context Protocol* projetado para fornecer um ambiente de desenvolvimento assistido por IA de ponta a ponta. Com a versão 6.0, o projeto adota o paradigma de **"Fat MCP"**, internalizando a lógica que antes dependia de chamadas a APIs externas (Zero-API approach).

## Objetivos Principais

O objetivo fundamental do Maestro é atuar como um orquestrador local e autônomo, fornecendo "trilhos" metodológicos para que as IAs (através de IDEs como Windsurf, Cursor, Cline, etc.) desenvolvam software com alta confiabilidade, passando por fases pré-definidas (Produto, UX, Arquitetura, Frontend, Backend, etc.).

A visão central baseia-se em quatro pilares principais introduzidos ou consolidados na versão 6:

1.  **Zero-API Approach (Fat MCP)**
    Ao invés de atuar apenas como uma interface fina ("Thin MCP") que repassa chamadas a uma API de orquestração externa, o Maestro v6 internalizou toda a lógica do motor de fluxo (Flow Engine), gerenciamento de estado e pipelines. Isso elimina a dependência de serviços externos, reduz latência e melhora a segurança e o controle dos dados localmente.

2.  **5 Core Tools Paradigm**
    Com o objetivo de reduzir drasticamente o *overhead* de tokens e a carga cognitiva no contexto (prompt) da IA, as 17 ferramentas da arquitetura anterior foram consolidadas em apenas 5 ferramentas centrais:
    -   `maestro`: Ponto de entrada e gerenciador de setup e status.
    -   `executar`: Motor de mutação do projeto (avança de fase, salva entregáveis, gerencia checkpoints).
    -   `validar`: Portal para validações manuais de gates, entregáveis ou compliance.
    -   `analisar`: Auditor de código para segurança, qualidade, performance e dependências.
    -   `contexto`: Fornece imediatamente à IA as decisões arquiteturais (ADRs), padrões e histórico (memória) do projeto.

3.  **Inverted TDD (Test-Driven Development Invertido)**
    Aplica o conceito de TDD aos entregáveis da IA. Antes de a IA gerar a solução (código ou documentação) de uma fase, o Maestro fornece os requisitos de sucesso esperados através de orientações extraídas do contexto (`.orientacao-gate.md`). A `ValidationPipeline` então avalia o entregável contra essas métricas. Se a pontuação (Score) for inferior a 70%, o Maestro pode forçar um *rollback* automático.

4.  **Auto-Correção Injetada e Smart Auto-Flow**
    -   **Auto-Correção:** Quando um entregável não atinge a pontuação mínima na validação, o Maestro não apenas rejeita a etapa, mas também instrui ativamente a IA sobre como corrigir os erros no próprio retorno da falha. Isso dispensa turnos de requisição adicionais e guia a correção de forma proativa.
    -   **Smart Auto-Flow (Watcher Nativo):** Etapas técnicas não exigem mais a intervenção manual constante. Um sistema orientado a eventos (`Watcher Service` com `chokidar`) monitora os arquivos em background. Assim que a IA salva o entregável, a validação ocorre de forma assíncrona. Se os critérios forem atendidos, o Maestro avança o projeto (`auto_flow`) para a próxima fase técnica automaticamente.

## A Experiência do Desenvolvedor

Para o desenvolvedor humano, o uso do Maestro consiste em iniciar o servidor via sua IDE compatível com MCP.

A jornada de desenvolvimento segue as seguintes etapas em alto nível:
1.  **Setup e Criação de Projeto:** Através da ferramenta `maestro`. A IDE coleta preferências (nível de complexidade, uso de modo economy/balanced/quality) e inicializa a estrutura do projeto.
2.  **Desenvolvimento Assistido (Fases):** O projeto transita por várias fases metodológicas (ex: Discovery, PRD, Arquitetura, Implementação Front/Back). Em cada fase, a ferramenta `executar` submete os artefatos.
3.  **Validação Contínua:** Durante a submissão ou salvamento de arquivos (monitorados via watcher), a `ValidationPipeline` confere se a qualidade do código ou documento é aceitável, bloqueando transições precoces ou aprovando automaticamente.
4.  **Memória de Longo Prazo:** Arquivos de estado (`estado.json`), logs e Registros de Decisões Arquiteturais (ADRs) garantem que a IA tenha contexto persistente do que já foi feito, por que foi feito e quais são os próximos passos.

Em essência, o Maestro não é apenas um plugin de ferramentas de IA; ele é um gerente de projeto técnico ("Maestro") que conduz a IA para construir softwares consistentes do início ao fim.
