# Exemplo de Fluxo Completo com Laravel e Livewire (Plano 6)

Este exemplo mostra como aplicar o **Playbook de Desenvolvimento com IA**
para um **Sistema Personalizado** em **Laravel + Livewire**.

Funcionalidade de exemplo: **Gestão de Tarefas (To-Do Kanban simples)**.

Stack alvo (alinhada ao Plano 6):
- Laravel 11
- Livewire 3
- Tailwind CSS
- MySQL/MariaDB
- Hospedagem compartilhada.

---

## 1. Visão & Problema

### Contexto

Sistema interno simples para um pequeno time organizar tarefas em colunas:
- A Fazer
- Em Progresso
- Concluído

Cada tarefa tem título, descrição, responsável e prazo.

### Prompt sugerido

```text
Você é um engenheiro de software sênior especialista em Laravel + Livewire.

Contexto:
- Sistema interno de gestão de tarefas em estilo Kanban simples
- Colunas: A Fazer, Em Progresso, Concluído
- Campos da tarefa: título, descrição, responsável, prazo

Me ajude a descrever a visão técnica mínima dessa funcionalidade,
incluindo:
- atores
- fluxos principais
- riscos ou dúvidas técnicas.
```

---

## 2. Engenharia de Requisitos com IA

### Requisitos funcionais (esperados)

- RF1: Criar tarefa com título, descrição, responsável, prazo, status inicial "A Fazer".
- RF2: Mover tarefa entre colunas (status).
- RF3: Editar tarefa.
- RF4: Listar tarefas por coluna.

### Requisitos não funcionais (exemplos)

- RNF1: Interface responsiva com atualização em tempo real (sem recarregar página).
- RNF2: Simplicidade de uso para equipe não técnica.

### Prompt sugerido

```text
A partir da visão abaixo:
[COLE VISÃO]

Liste requisitos funcionais e não funcionais para o sistema de tarefas,
com critérios de aceitação em bullets.
```

---

## 3. Modelagem & Arquitetura com IA

### Modelo de domínio esperado

Entidade `Task`:
- id
- title
- description
- assignee (string ou relação futura com usuário)
- due_date
- status (enum: todo, doing, done)
- created_at, updated_at

### Prompt para modelo de domínio

```text
Com base nestes requisitos do sistema de tarefas:
[COLE REQUISITOS]

Proponha o modelo de domínio em Laravel para a entidade Task,
com campos, tipos e enum de status.

Gere um esboço da migração e do model Task com casts apropriados.
```

### Prompt para arquitetura (components Livewire)

```text
Quero implementar a interface em Livewire 3.

Descreva uma arquitetura de componentes Livewire para o Kanban,
com:
- um componente principal (ex.: TaskBoard)
- componentes para cada coluna ou lista de tarefas (opcional)
- eventos necessários para criar, atualizar e mover tarefas.
```

---

## 4. Planejamento / Backlog com IA

### User story principal

```text
Como membro da equipe,
Quero organizar minhas tarefas em colunas,
Para ter clareza do que fazer e do que já foi concluído.
```

### Prompt para backlog

```text
Usando a user story e requisitos abaixo:
[COLE]

Gere uma lista de tarefas técnicas para implementar essa funcionalidade
em Laravel + Livewire 3, incluindo:
- migração e model Task
- componentes Livewire necessários
- rotas e views
- testes básicos (modelo e componentes).

Organize as tarefas em ordem de execução recomendada.
```

---

## 5. Implementação (Vibe Coding Estruturado) com IA

### 5.1. Model e migração

```text
Vamos implementar a migração e o model Task em Laravel.

Campos:
- title (string, obrigatório)
- description (text, opcional)
- assignee (string, opcional)
- due_date (date, opcional)
- status (string ou enum: todo, doing, done; default todo)

Gere o código da migração e do model Task,
com casts/atributos necessários.
```

### 5.2. Componente Livewire principal

```text
Com base no model Task:
[COLE]

Gere um componente Livewire `TaskBoard` que:
- carregue tarefas agrupadas por status
- permita criar nova tarefa (form inline ou modal)
- permita alterar o status de uma tarefa (ex.: via dropdown ou botões)

Use Tailwind CSS para a estrutura básica do layout (3 colunas).
```

### 5.3. Interações e UX

```text
Aqui está o esqueleto do componente TaskBoard:
[COLE]

Sugira melhorias de UX:
- feedback visual ao mover tarefas
- confirmações para exclusão (se houver)
- tratamento de erros (validação de formulário, falha de salvamento).

Gere o código ajustado considerando essas melhorias.
```

---

## 6. Testes com IA

### Testes de modelo

```text
Aqui está o model Task:
[COLE]

Gere testes de modelo em PHPUnit verificando:
- criação de tarefa válida
- valor default de status (todo)
- comportamento de campos opcionais.
```

### Testes de componente Livewire

```text
Aqui está o componente TaskBoard:
[COLE]

Sugira testes de componente Livewire para:
- exibir tarefas por coluna corretamente
- criar uma nova tarefa via formulário
- mover tarefa de uma coluna para outra.
```

---

## 7. Documentação & Revisão com IA

### Documentação funcional

```text
Com base nos requisitos e no código do sistema de tarefas:
[COLE]

Gere uma documentação funcional em linguagem de negócio,
explicando:
- o que o sistema faz
- como usar o quadro Kanban
- principais limitações da primeira versão.
```

### Revisão técnica

```text
Atue como revisor de código sênior em Laravel + Livewire.

Aqui estão o model Task e o componente TaskBoard:
[COLE]

Avalie legibilidade, simplicidade e possíveis problemas de performance/usabilidade.
Sugira refatorações se necessário.
```

---

## 8. Feedback & Evolução

Depois de em uso, IA pode ajudar a:

- analisar padrões de tarefas (onde ficam presas: todo/doing)
- sugerir novas colunas ou estados
- propor filtros (por responsável, prazo, tags).

Prompt exemplo:

```text
Aqui estão dados exportados do sistema de tarefas (status, datas, responsáveis):
[COLE]

Identifique padrões (ex.: tarefas que demoram mais em cada status)
 e sugira melhorias de fluxo para o time.
```