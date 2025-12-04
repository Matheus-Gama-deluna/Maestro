# Exemplo de Fluxo Completo com Laravel e Filament (Plano 5)

Este exemplo mostra, de forma resumida, como aplicar o **Playbook de Desenvolvimento com IA**
para construir um **Site Premium com painel administrativo em Laravel + Filament**.

Funcionalidade de exemplo: **Gestão de Posts de Blog** (CRUD de posts com categorias).

Stack alvo (alinhada ao Plano 5):
- Laravel 10/11
- FilamentPHP v3
- MySQL/MariaDB
- Hospedagem compartilhada (cPanel/Hostinger/Locaweb etc.).

---

## 1. Visão & Problema

### Contexto

Cliente quer um site institucional com blog gerenciável via painel.
Precisa:
- criar/editar posts
- categorizar conteúdos
- agendar publicação (opcional)
- ter URL amigável (slug).

### Prompt sugerido

```text
Você é um engenheiro de software sênior especialista em Laravel e FilamentPHP.

Contexto:
- Site institucional com blog
- Painel administrativo em Filament
- Banco: MySQL
- Hospedagem: compartilhada (cPanel/Hostinger etc.)

Me ajude a descrever a visão técnica mínima para um módulo de posts de blog,
incluindo:
- objetivo
- atores (admin, editor)
- fluxos principais (criar, editar, listar, publicar)
- riscos ou dúvidas técnicas.
```

---

## 2. Engenharia de Requisitos com IA

### Requisitos funcionais (esperados)

- RF1: Criar post com título, slug, conteúdo, categoria(s), status (rascunho/publicado).
- RF2: Editar post existente.
- RF3: Listar posts com filtros por categoria/status.
- RF4: Agendar data de publicação (opcional).
- RF5: Exibir posts publicados no site público.

### Requisitos não funcionais (exemplos)

- RNF1: Painel responsivo e fácil de usar.
- RNF2: Permissões de acesso (somente usuários autenticados no Filament).
- RNF3: URLs amigáveis e estáveis.

### Prompt sugerido

```text
A partir da visão abaixo, detalhe os requisitos funcionais e não funcionais
para o módulo de posts de blog:

[COLE VISÃO]

Inclua critérios de aceitação em bullets para cada requisito.
```

---

## 3. Modelagem & Arquitetura com IA

### Modelo de domínio esperado

Entidades principais:
- `Post`  
  - id, title, slug, content, status, published_at, created_at, updated_at
- `Category`  
  - id, name, slug
- Relação `Post` N–N `Category`.

### Prompt para modelo de domínio + migrações

```text
Com base nestes requisitos do módulo de posts:
[COLE REQUISITOS]

Proponha um modelo de domínio em Laravel,
com:
- entidades/tabelas
- campos e tipos
- relacionamentos

Gere um esboço das migrações (tabelas posts, categories e tabela pivô),
sem se preocupar com detalhes de sintaxe.
```

### Prompt para arquitetura (Laravel + Filament)

```text
Considerando:
- Laravel 11
- Filament v3 para painel administrativo

Descreva a arquitetura do módulo de posts:
- quais Models serão necessários
- quais Filament Resources (PostResource, CategoryResource)
- como será o fluxo entre CRUD do painel e exibição pública dos posts (Blade views).
```

---

## 4. Planejamento / Backlog com IA

### User story principal

```text
Como um editor de conteúdo,
Quero criar, editar e publicar posts de blog pelo painel,
Para manter o site institucional sempre atualizado.
```

### Prompt para backlog técnico

```text
Usando a user story e os requisitos abaixo:
[COLE]

Gere uma lista de tarefas técnicas para implementar o módulo de posts
em Laravel + Filament, incluindo:
- migrações
- models
- Filament Resources (forms e tables)
- rotas e controllers/blade para exibição pública
- testes básicos (pelo menos de modelo e das rotas públicas).

Organize as tarefas em ordem recomendada.
```

---

## 5. Implementação (Vibe Coding Estruturado) com IA

### 5.1. Models e migrações

```text
Vamos implementar os models e migrações para Post e Category em Laravel.

Requisitos de Post:
- title (string)
- slug (string único)
- content (longText)
- status (enum: draft/published)
- published_at (nullable datetime)

Requisitos de Category:
- name (string)
- slug (string único)

Gere o código das migrações e models com relacionamentos adequados.
Não gere nada de Filament ainda.
```

### 5.2. Filament Resources

```text
Com base nos models Post e Category:
[COLE DECLARAÇÕES]

Gere o PostResource do Filament com:
- formulário de criação/edição (title, slug, content, categories, status, published_at)
- tabela com colunas básicas (title, status, published_at)
- filtros por categoria e status.

Depois gere o CategoryResource básico.
```

### 5.3. Rotas e views públicas

```text
Agora gere as rotas e controllers para exibir posts publicados no site público,
usando Blade:

- GET /blog -> lista de posts publicados (com paginação)
- GET /blog/{slug} -> post individual

Inclua consultas usando o model Post e as relações com Category.
```

---

## 6. Testes com IA

### Testes de modelo

```text
Aqui estão os models Post e Category:
[COLE]

Gere testes de modelo em PHPUnit cobrindo:
- criação de um post com categorias
- geração e unicidade de slug (se houver lógica específica)
- escopo para filtrar apenas posts publicados.
```

### Testes de rotas públicas

```text
Considere as rotas /blog e /blog/{slug}:
[COLE CONTROLLERS/ROTAS]

Sugira testes de feature em Laravel testando:
- listagem de posts publicados
- não exibição de posts em rascunho
- acesso a um post específico por slug (200)
- 404 para slug inexistente.
```

---

## 7. Documentação & Revisão com IA

### Documentação do módulo

```text
Com base nos requisitos e no código do módulo de posts (models, resources, controllers):
[COLE]

Gere uma documentação técnica resumida contendo:
- visão geral do módulo
- modelos e relacionamentos
- rotas principais (painel e público)
- pontos de extensão (ex.: tags, comentários no futuro).
```

### Revisão de segurança mínima

```text
Aqui está a descrição do módulo de posts e os arquivos relevantes:
[COLE]

Avalie sob a ótica de segurança e boas práticas:
- permissões de acesso ao painel Filament
- exposição de dados públicos
- risco de XSS no conteúdo do post

Sugira medidas de mitigação (ex.: sanitização de HTML, policies, etc.).
```

---

## 8. Feedback & Evolução

Depois de em produção, IA pode ajudar a:

- analisar quais posts têm mais tráfego (dados de analytics)
- sugerir melhorias de UX na listagem de posts
- propor novos campos ou tipos de conteúdo (ex.: destaques, autorias, tags).

Prompt exemplo:

```text
Aqui estão métricas de acesso ao blog e feedbacks dos usuários:
[COLE]

Classifique em:
- melhorias de UX
- necessidades de novos tipos de conteúdo
- ajustes técnicos

Sugira uma pequena roadmap de evolução do módulo de blog.
```