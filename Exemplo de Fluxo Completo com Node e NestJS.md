# Exemplo de Fluxo Completo com Node e NestJS

Este exemplo mostra, de forma resumida, como aplicar o **Playbook de Desenvolvimento com IA**
para implementar uma funcionalidade simples usando **Node.js + NestJS**.

Funcionalidade de exemplo: **Cadastro de Leads** em uma landing page.

---

## 1. Visão & Problema

### Contexto

Uma landing page captura leads (nome, e-mail, origem). Queremos salvar esses dados em um banco
(PostgreSQL) e ter um endpoint para listar os leads.

### Prompt sugerido

```text
Você é um engenheiro de software sênior especialista em Node.js e NestJS.

Contexto do produto:
- Landing page para captura de leads com formulário (nome, email, origem)
- Backend: API NestJS + PostgreSQL

Me ajude a descrever a visão técnica mínima para essa feature, incluindo:
- objetivo principal
- atores
- principais fluxos (cadastrar lead, listar leads)
- riscos ou dúvidas técnicas.
```

---

## 2. Engenharia de Requisitos com IA

### Requisitos funcionais (esperados)

- RF1: O sistema deve permitir cadastrar um lead com `nome`, `email`, `origem`.
- RF2: O sistema deve listar leads cadastrados, com paginação simples.

### Requisitos não funcionais (exemplos)

- RNF1: E-mail deve ser validado.
- RNF2: API deve responder em < 500ms (p95) em condições normais.

### Prompt sugerido

```text
A partir da visão abaixo, detalhe os requisitos funcionais e não funcionais
para a funcionalidade de cadastro de leads.

Visão:
[COLE A VISÃO GERADA NA ETAPA 1]

Responda com:
- requisitos funcionais numerados (RF1, RF2...)
- requisitos não funcionais principais
- critérios de aceitação para cada requisito.
```

---

## 3. Modelagem & Arquitetura com IA

### Modelo de domínio esperado

Entidade `Lead`:
- id (UUID)
- nome (string)
- email (string)
- origem (string)
- criadoEm (datetime)

### Prompt para modelo de domínio

```text
Com base nestes requisitos:
[COLE REQUISITOS]

Proponha um modelo de domínio mínimo em NestJS + Prisma com:
- entidades
- campos e tipos
- relacionamentos (se houver)

Explique se há algo ambíguo ou faltando.
```

### Prompt para arquitetura/API

```text
Stack:
- NestJS
- Prisma
- PostgreSQL

Quero implementar a API de leads.

Descreva:
- endpoints necessários (rota, método, payload)
- formato de resposta
- status HTTP para casos de sucesso/erro
- validações obrigatórias.
```

---

## 4. Planejamento / Backlog com IA

### User story

```text
Como um analista de marketing,
Quero cadastrar e consultar leads de uma landing page,
Para que eu possa acompanhar o desempenho das campanhas.
```

### Prompt para backlog

```text
Usando a user story e requisitos abaixo:
[COLE]

Gere uma lista de tarefas técnicas para implementar isso em NestJS + Prisma:
- modelagem de banco
- criação de módulo/serviço/controller
- validações
- testes unitários e de integração

Organize em uma sequência lógica de implementação.
```

---

## 5. Implementação (Vibe Coding Estruturado) com IA

### Passo 1 – Service de domínio

Prompt sugerido:

```text
Vamos implementar o serviço de domínio para cadastro e listagem de leads
em NestJS usando Prisma.

Contexto:
- entidade Lead: id (UUID), nome, email, origem, criadoEm
- regras: email obrigatório e válido; nome obrigatório

Gere apenas o código do serviço (LeadService) com métodos:
- createLead(dto)
- listLeads(pagination)

Use boas práticas de NestJS e Prisma.
Não gere controller ainda.
```

### Passo 2 – Controller/Rotas

```text
Aqui está o LeadService que acabamos de implementar:
[COLE CÓDIGO]

Gere o controller NestJS correspondente (LeadController), com rotas:
- POST /leads
- GET /leads

Inclua:
- DTOs de entrada/saída com class-validator
- tratamento básico de erros (ex.: BadRequestException).
```

---

## 6. Testes com IA

### Testes unitários (service)

```text
Aqui está a implementação do LeadService em NestJS:
[COLE]

Gere testes unitários em Jest cobrindo:
- criação de lead válido
- erro quando email é inválido
- listagem de leads com paginação.

Explique em 1 linha o objetivo de cada teste.
```

### Testes de integração (API)

```text
Com base no controller de leads e requisitos da API:
[COLE]

Sugira testes de integração usando o testing module do NestJS,
validando pelo menos:
- POST /leads com payload válido (201)
- POST /leads com payload inválido (400)
- GET /leads retornando lista paginada.
```

---

## 7. Documentação & Revisão com IA

### Prompt para revisão de código

```text
Atue como revisor de código sênior em NestJS.

Aqui estão os arquivos do módulo de leads (service + controller + DTOs):
[COLE]

Avalie:
- legibilidade
- possíveis bugs
- aderência às boas práticas de NestJS

Sugira melhorias e, se necessário, proponha refatorações.
```

### Prompt para documentação técnica

```text
Com base no módulo de leads implementado:
[COLE]

Gere uma documentação técnica resumida com:
- o que o módulo faz
- endpoints expostos
- principais validações
- dependências externas.
```

---

## 8. Feedback & Evolução

Depois de em produção, IA pode ajudar a:

- Analisar logs/erros de requisições para `POST /leads`.
- Sugerir melhorias de UX no formulário (com apoio do Especialista em UX).
- Encontrar oportunidades de segmentação de leads.

Prompt exemplo:

```text
Aqui estão logs de erros da API de leads e alguns feedbacks de usuários:
[COLE]

Agrupe em:
- problemas de validação
- problemas de usabilidade
- bugs reais

Sugira melhorias de curto prazo e possíveis ajustes na arquitetura.
```