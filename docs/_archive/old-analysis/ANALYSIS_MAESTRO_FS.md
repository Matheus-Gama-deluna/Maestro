# 📊 Análise: Maestro File System vs Implementação Atual

Esta análise compara a visão apresentada em `docs/Maestro file system.md` com a implementação atual encontrada em `src/`.

## 🎯 Veredito Rápido

**A implementação atual executa 30% da visão.**
Temos um sistema híbrido que suporta *conteúdo* local, mas ainda depende de *lógica* centralizada no servidor. A visão de "Zero Infraestrutura" onde a IA apenas lê arquivos e executa lógica dinâmica ainda não existe.

---

## 🔍 Comparativo Detalhado

### 1. Sistema de Arquivos (Content Overlay)
| Recurso | Visão (Docs) | Implementação Atual (`src/`) | Status |
|---------|--------------|------------------------------|--------|
| **Local First** | Prioridade total para arquivos locais | ✅ Implementado em `utils/files.ts` | 🟢 OK |
| **Fallback** | Se não existir local, usa global | ✅ Implementado (`contentRoot` logic) | 🟢 OK |
| **Injeção** | CLI injeta estrutura base | ✅ CLI existe e faz isso (`@maestro-ai/cli`) | 🟢 OK |

### 2. Lógica e Comportamento (Logic Overlay)
| Recurso | Visão (Docs) | Implementação Atual (`src/`) | Status |
|---------|--------------|------------------------------|--------|
| **Workflows** | Arquivos `.js`/`.yaml` dinâmicos (`maestro/workflows/*.js`) | ❌ Hardcoded em TypeScript (`src/tools/proximo.ts`) | 🔴 Crítico |
| **Rules** | Scripts de validação locais (`maestro/rules/*.js`) | ❌ Hardcoded em `src/gates/*.ts` | 🔴 Crítico |
| **Skills** | Progressive disclosure via `SKILL.md` | ⚠️ Parcial (Resource existe, mas loader é estático) | 🟡 Parcial |
| **Engine** | `workflow-engine.js` genérico | ❌ Inexistente (Lógica espalhada em tools) | 🔴 Crítico |

### 3. Execução
| Recurso | Visão (Docs) | Implementação Atual (`src/`) | Status |
|---------|--------------|------------------------------|--------|
| **Stateless** | Estado apenas em JSON | ✅ Implementado (`estado.json`) | 🟢 OK |
| **Serverless** | IA lê arquivos diretamente | ⚠️ Híbrido (IA chama Server que lê arquivos) | 🟡 Atenção |
| **Agente** | IA orquestra tudo | ⚠️ IA é "passiva", chamando tools rígidas do server | 🟡 Atenção |

---

## 🚩 Principais Lacunas (Gaps)

### 1. A "Trava" da Compilação
Atualmente, qualquer mudança no fluxo (ex: adicionar uma nova fase "Segurança" entre Requisitos e UX) exige **recompilar o servidor MCP**.
*   **Visão:** Usuário edita `workflows/main.js` na pasta do projeto e o comportamento muda instantaneamente.
*   **Realidade:** Lógica de fases está travada em `src/tools/proximo.ts` e `src/gates/tiers.js`.

### 2. Ausência de Engine
Não existe um "motor" que lê um arquivo de definição de workflow e executa. As tools atuais (`iniciar_projeto`, `proximo`) são "hard-coded workflows".
*   **Consequência:** Se você quiser um workflow diferente (ex: Ciência de Dados), o servidor atual não serve, pois espera "Produto -> Requisitos...".

### 3. Validações Rígidas
As regras de validação (Gates) estão no código fonte do servidor (`src/gates/tiers.ts`).
*   **Visão:** `maestro/rules/quality-gate.js` no projeto define: "Sempre exigir diagrama Mermaid no PRD".
*   **Realidade:** Servidor dita as regras, o projeto não tem autonomia para sobrescrever regras sem alterar o código do servidor.

---

## 🚀 Plano de Convergência (Como chegar lá)

Para atingir o objetivo do `README.md` e `docs`, precisamos refatorar o `src` para ser um **Interpretador** e não um **Executor Rígido**.

### Passo 1: Dynamic Workflow Loader (Prioridade Alta)
Criar `src/engine/WorkflowEngine.ts`:
- Ler `.maestro/workflows/main.json` (ou js/yaml).
- Substituir a lógica rígida de `proximo.ts` por:
  ```typescript
  // Pseudo-código
  const workflow = loadWorkflow(projectDir);
  const currentPhase = workflow.getPhase(state.fase);
  const nextPhase = currentPhase.next();
  ```
- Isso permitirá que cada projeto inicie com um `main.yaml` definindo suas fases.

### 2. Rule Engine (Prioridade Média)
Mover a lógica de `src/gates/*.ts` para arquivos de configuração injetáveis.
- O servidor MCP lerá `.maestro/rules/gates.json` para saber o que validar.
- `validar_gate` passará a verificar esse arquivo dinâmico em vez de funções hardcoded.

### 3. Generic Tooling (Prioridade Média)
Em vez de tools específicas (`implementar_historia`, `nova_feature`), ter tools genéricas configuradas pelo workflow:
- `executar_passo(passo_id)` em vez de `proximo()`.
- A definição do que o passo faz estaria no arquivo de workflow local.

---

## 💡 Conclusão

O projeto está **bem estruturado** quanto ao *consumo de conteúdo* (prompts, templates), o que já é um grande diferencial. Porém, falha na promessa de "Zero Infraestrutura" e "Flexibilidade Total" porque a **lógica de orquestração** ainda é monolítica dentro do servidor.

Para atender plenamente o objetivo, o servidor MCP Maestro deve deixar de ser o "Gerente" e passar a ser apenas o "Bibliotecário" e "Intérprete", deixando que o arquivo de workflow no projeto do usuário defina o processo.
