# Especialista em Engenharia de Requisitos com IA

## Perfil
Analista de requisitos/Engenheiro de software com foco em:
- Transformar ideias soltas em requisitos claros
- Usar IA como parceira em discovery, análise e validação
- Garantir que os requisitos sejam **compreensíveis, testáveis e alinhados ao negócio**

## Missão

- Ajudar a equipe a **entender o problema certo** antes de escrever código.
- Estruturar requisitos funcionais e não funcionais com apoio da IA.
- Reduzir ambiguidades, conflitos e lacunas desde o início.

---

## Fluxo de trabalho sugerido

1. Coletar insumos brutos (anotações, gravações transcritas, e-mails).  
2. Usar IA para **organizar** esses insumos em visão + requisitos iniciais.  
3. Refinar requisitos vagos em requisitos **testáveis**.  
4. Validar consistência, conflitos e lacunas.  
5. Gerar **critérios de aceitação** e exemplos de uso.

---

## Como usar IA nesta área

### 1. Sessão de discovery com IA

Objetivo: pegar material bruto (anotações, atas, ideias) e transformar em algo estruturado.

Prompt base:

```text
Atue como um analista de requisitos sênior.
Vou colar anotações brutas de conversas com o cliente.

Notas:
[COLE TEXTO LIVRE]

Organize em:
- visão resumida do sistema/produto
- atores/personas principais
- requisitos funcionais ("O sistema deve ...")
- requisitos não funcionais relevantes
- dúvidas que precisam ser respondidas com o cliente.
```

### 2. Refinar requisitos vagos

Objetivo: transformar frases genéricas em requisitos claros e mensuráveis.

Prompt base:

```text
Aqui estão alguns requisitos ainda vagos do sistema:
[COLE REQUISITOS]

Refine cada requisito para ficar:
- claro (sem ambiguidade)
- específico
- mensurável e testável.

Para cada requisito, gere também:
- critérios de aceitação
- exemplos de cenários típicos e de erro.
```

### 3. Gerar critérios de aceitação em Gherkin

Objetivo: aproximar requisitos de testes automatizáveis.

Prompt base:

```text
Com base nos requisitos abaixo:
[COLE REQUISITOS]

Para cada requisito, gere de 1 a 3 cenários em Gherkin:

Dado [contexto]
Quando [ação]
Então [resultado esperado]

Inclua variações para:
- caso de sucesso
- entradas inválidas
- edge cases importantes.
```

### 4. Validar consistência e encontrar lacunas

Objetivo: usar a IA como revisor crítico dos requisitos.

Prompt base:

```text
Aqui está o documento atual de requisitos do sistema:
[COLE DOCUMENTO]

Atue como um engenheiro de requisitos crítico.
Identifique:
- requisitos ambíguos
- possíveis conflitos entre requisitos
- lacunas típicas (segurança, auditoria, logs, desempenho etc.)

Sugira perguntas que eu devo levar ao cliente/PO
para esclarecer os pontos abertos.
```

---

## Prompts úteis (cole e adapte)

### Organizar notas do cliente em requisitos

```text
Transforme as anotações abaixo em um documento de requisitos.

Notas:
[COLE TEXTO]

Responda com:
1) Visão geral do produto
2) Personas e objetivos
3) Requisitos funcionais
4) Requisitos não funcionais
5) Riscos e suposições
6) Perguntas em aberto.
```

### Tornar requisitos testáveis

```text
Vou colar uma lista de requisitos.

Para cada requisito, faça:
- reescreva de forma clara e específica
- defina critérios de aceitação em bullets
- sugira pelo menos 1 cenário de teste em Gherkin.

Requisitos:
[COLE]
```

### Encontrar conflitos e ambiguidade

```text
Documento de requisitos:
[COLE]

Procure por:
- termos ambíguos ("rápido", "seguro", "fácil de usar" etc.)
- requisitos que parecem se contradizer
- áreas sem requisitos (ex: segurança, logs, performance).

Liste:
- potenciais conflitos
- ambiguidades
- sugestões de melhoria do texto.
```

---

## Checklists rápidos

### Antes de fechar um conjunto de requisitos

- [ ] A visão do produto está descrita em linguagem de negócio.
- [ ] Há uma lista clara de requisitos funcionais.
- [ ] Há requisitos não funcionais mínimos (segurança, performance, UX).
- [ ] Cada requisito relevante tem critérios de aceitação.
- [ ] As principais dúvidas para o cliente/PO estão listadas.

### Boas práticas com IA

- Use a IA para **organizar e sugerir**, mas valide sempre com pessoas.
- Prefira colar **contexto completo** (visão + requisitos já existentes) do que perguntar no vazio.
- Guarde prompts que funcionaram bem como **templates reutilizáveis** no projeto.
