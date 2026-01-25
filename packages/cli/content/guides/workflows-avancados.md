# 🚀 Workflows Avançados e Seus Benefícios

> Entenda por que promovemos estes workflows para o "Primeiro Escalão" do Maestro FS.

---

## 1. `/08-deploy-projeto` (Antigo `deploy.md`)

**O Problema Anterior:**
O sistema original parava na fase de "Coding". O desenvolvedor ficava com o código pronto na máquina, mas sem um guia claro de como levar para produção com segurança.

**O Benefício:**
Este workflow introduz a disciplina de **DevOps**:
*   ✅ **Checklist Pré-Voo (Pre-flight)**: Garante que segredos não estão hardcoded, testes passaram e versão foi bumpada.
*   🔄 **Rollback Strategy**: Obriga a pensar em "como voltar atrás" se der errado.
*   📦 **Multi-Cloud**: Dá dicas para Vercel, Railway, Docker, etc.

---

## 2. `/80-orchestrate-agents` (Antigo `orchestrate.md`)

**O Problema Anterior:**
O Maestro atuava muito como um "Lobo Solitário". Para tarefas complexas (ex: "Refazer todo o módulo de Auth"), uma única passada linear não é suficiente.

**O Benefício:**
Este workflow ativa o **Modo Squad**:
*   🤖 **Multi-Agente**: Simula uma equipe onde um "Planner" quebra a tarefa, um "Dev" executa e um "Tester" valida.
*   🧠 **Pensamento Paralelo**: Permite atacar Frontend e Backend simultaneamente (conceitualmente).
*   🛡️ **Orquestração**: Garante que as peças se encaixem no final.

---

## 3. `/81-brainstorm` (Antigo `brainstorm.md`)

**O Problema Anterior:**
O comando `/01-iniciar-projeto` exige que você já saiba o que quer ("Nome", "Escopo"). E se você só tiver uma ideia vaga?

**O Benefício:**
Este workflow é a fase **Zero**:
*   💡 **Ideação Guiada**: Ajuda a transformar "Quero um Uber para Pets" em um escopo técnico viável.
*   🔍 **Exploração de Viabilidade**: Analisa concorrentes e desafios técnicos antes de escrever uma linha de código.

---

## 4. `/82-testar-lib` (Antigo `testar.md`)

**O Problema Anterior:**
Os workflows padrão dizem "Rode os testes", mas não ensinam *como* estruturar uma estratégia de testes complexa.

**O Benefício:**
Este workflow é o **Manual de Qualidade Especializado**:
*   🧪 **Estratégia Pyramid**: Ensina a balancear Unitários vs Integração vs E2E.
*   🛠️ **Tooling**: Sugere ferramentas específicas (Jest, Vitest, Playwright) para cada cenário.

---

## 📋 Resumo da Organização

Ao adotar essa numeração, cobrimos o ciclo completo:

*   **01-08**: Ciclo de Vida Padrão (Do início ao Deploy).
*   **Guides**: Ferramentas de "Super Poderes" (Orquestração, Ideação, Testes Profundos).
