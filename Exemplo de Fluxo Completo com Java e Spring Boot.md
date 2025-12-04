# Exemplo de Fluxo Completo com Java e Spring Boot

Este exemplo mostra como aplicar o **Playbook de Desenvolvimento com IA**
para implementar uma funcionalidade simples em **Java + Spring Boot**.

Funcionalidade de exemplo: **Cadastro de Clientes** em uma API REST.

---

## 1. Visão & Problema

### Contexto

Precisamos de uma API que permita cadastrar clientes (nome, email, CPF) e consultá-los.
O sistema será usado por um painel administrativo simples.

### Prompt sugerido

```text
Você é um arquiteto de software sênior especializado em Java e Spring Boot.

Contexto:
- API REST de cadastro de clientes
- Campos: nome, email, cpf
- Banco: PostgreSQL

Me ajude a descrever a visão técnica mínima dessa API, incluindo:
- objetivo
- atores
- fluxos principais (criar, listar, buscar por ID)
- riscos ou pontos de atenção.
```

---

## 2. Engenharia de Requisitos com IA

### Requisitos funcionais (esperados)

- RF1: Cadastrar cliente com `nome`, `email`, `cpf`.
- RF2: Listar todos os clientes.
- RF3: Buscar cliente por ID.

### Requisitos não funcionais (exemplos)

- RNF1: Validar formato de e-mail.
- RNF2: Validar CPF (formato e dígitos verificadores).
- RNF3: API deve ter logs mínimos para auditoria.

### Prompt sugerido

```text
Com base na visão abaixo:
[COLE VISÃO]

Detalhe os requisitos funcionais e não funcionais para essa API de clientes.
Inclua critérios de aceitação para cada requisito.
```

---

## 3. Modelagem & Arquitetura com IA

### Modelo de domínio esperado

Entidade `Cliente`:
- id (Long ou UUID)
- nome (String)
- email (String)
- cpf (String)
- criadoEm (LocalDateTime)

### Prompt para modelo de domínio

```text
A partir dos requisitos a seguir:
[COLE REQUISITOS]

Proponha o modelo de domínio para a entidade Cliente em Java:
- campos e tipos
- validações necessárias

Sugira também anotações JPA/Bean Validation típicas.
```

### Prompt para arquitetura/API

```text
Com a entidade Cliente definida,

Descreva a API REST em Spring Boot:
- endpoints (método + URI)
- payloads de requisição
- formatos de resposta
- códigos de status para sucesso/erro.
```

---

## 4. Planejamento / Backlog com IA

### User story

```text
Como um atendente do sistema administrativo,
Quero cadastrar e consultar clientes,
Para que eu possa gerenciar o relacionamento com eles.
```

### Prompt para backlog

```text
Usando a user story e os requisitos abaixo:
[COLE]

Crie uma lista de tarefas técnicas para implementar essa API em Spring Boot:
- criação da entidade JPA
- criação do repositório (Spring Data JPA)
- criação do service
- criação do controller
- testes unitários e de integração.

Ordene as tarefas na sequência recomendada.
```

---

## 5. Implementação (Vibe Coding Estruturado) com IA

### Passo 1 – Entidade + Repositório

```text
Vamos implementar a entidade Cliente e o repositório em Spring Boot.

Requisitos da entidade:
- id, nome, email, cpf, criadoEm
- validação de email
- validação simples de CPF (não vazio, formato XXX.XXX.XXX-YY ou só dígitos)

Gere o código da classe `Cliente` anotada com JPA e Bean Validation,
e a interface `ClienteRepository` com Spring Data JPA.
```

### Passo 2 – Service

```text
Com base na entidade Cliente e no ClienteRepository:
[COLE DECLARAÇÕES]

Implemente o `ClienteService` com métodos:
- criarCliente(dto)
- listarClientes()
- buscarPorId(id)

Inclua validações de negócio básicas e tratamento de erros.
```

### Passo 3 – Controller

```text
Agora gere o `ClienteController` em Spring Boot expondo:
- POST /clientes
- GET /clientes
- GET /clientes/{id}

Use DTOs para entrada/saída, ResponseEntity para respostas,
 e retorne códigos apropriados (201, 200, 404, 400).
```

---

## 6. Testes com IA

### Testes unitários (service)

```text
Aqui está a implementação de ClienteService:
[COLE]

Gere testes unitários com JUnit + Mockito cobrindo:
- criação de cliente válido
- erro ao tentar criar cliente com email inválido
- erro ao buscar cliente inexistente.
```

### Testes de integração (API)

```text
Com base no ClienteController e na configuração Spring Boot padrão:
[COLE]

Sugira testes de integração usando @SpringBootTest ou @WebMvcTest,
validando:
- POST /clientes com payload válido (201)
- POST /clientes com email inválido (400)
- GET /clientes retornando lista
- GET /clientes/{id} para cliente inexistente (404).
```

---

## 7. Documentação & Revisão com IA

### Prompt para documentação técnica

```text
Considere a API de clientes implementada em Spring Boot.

Gere uma documentação técnica em formato Markdown contendo:
- visão geral da API
- endpoints
- exemplos de requisição/resposta
- principais validações e erros.
```

### Prompt para revisão de código

```text
Atue como revisor de código sênior em Java.

Aqui estão as classes Cliente, ClienteService e ClienteController:
[COLE]

Avalie qualidade de código, manutenibilidade e possíveis bugs.
Sugira melhorias e refatorações se necessário.
```

---

## 8. Feedback & Evolução

Depois que a API estiver em produção, IA pode ajudar a:

- analisar logs de erro
- sugerir melhorias de validação
- propor campos adicionais úteis (telefone, endereço etc.).

Prompt exemplo:

```text
Aqui estão registros de erros e feedbacks de usuários sobre o cadastro de clientes:
[COLE]

Classifique em:
- bugs
- problemas de UX da API (mensagens confusas, validações frágeis)
- melhorias de produto.

Sugira ajustes de curto prazo e evoluções possíveis.
```