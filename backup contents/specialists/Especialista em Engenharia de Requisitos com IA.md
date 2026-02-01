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

## 📥 Pré-requisitos (Inputs)

| Artefato | Caminho | Obrigatório |
|---|---|---|
| PRD | `docs/01-produto/PRD.md` | ✅ |
| Notas de reuniões | - | ⚠️ Recomendado |

> [!WARNING]
> Cole o PRD no início da conversa para garantir contexto adequado.

---

## 📤 Outputs (Entregáveis)

| Artefato | Caminho | Template |
|---|---|---|
| Requisitos | `docs/02-requisitos/requisitos.md` | [Template](../06-templates/requisitos.md) |
| Critérios de Aceite | `docs/02-requisitos/criterios-aceite.md` | [Template](../06-templates/criterios-aceite.md) |

---

## ✅ Checklist de Saída (Gate)

Antes de avançar para UX/Modelagem, valide:

- [ ] Todos os requisitos funcionais têm IDs (RF001, RF002...)
- [ ] Cada RF tem critério de aceite testável
- [ ] Requisitos não-funcionais definidos (performance, segurança)
- [ ] Sem TBDs ou pendências críticas
- [ ] Dúvidas para stakeholders documentadas
- [ ] Arquivos salvos nos caminhos corretos

---

## 🔗 Fluxo de Contexto

### Especialista Anterior
← [Especialista em Gestão de Produto](./Especialista%20em%20Gestão%20de%20Produto%20.md)

### Próximo Especialista

**Escolha como prosseguir após os requisitos:**

| Opção | Quando Usar | Próximo Especialista |
|-------|-------------|---------------------|
| **🎨 Usar Stitch** | Validar UI com stakeholders antes de desenvolver | [Especialista em Prototipagem](./Especialista%20em%20Prototipagem%20Rápida%20com%20Google%20Stitch.md) |
| **⏩ Pular Stitch** | Gerar frontend direto na fase de Desenvolvimento | [Especialista em UX Design](./Especialista%20em%20UX%20Design.md) |

> [!TIP]
> **Use Stitch** se precisar validar direção visual rapidamente. **Pule** se já sabe o que quer ou se não há UI (API only).


### Contexto Obrigatório

Antes de iniciar, cole os seguintes artefatos:

| Artefato | Caminho | Obrigatório |
|----------|---------|-------------|
| PRD | `docs/01-produto/PRD.md` | ✅ |
| CONTEXTO.md | `docs/CONTEXTO.md` | ✅ |

### Prompt de Continuação

```text
Atue como Engenheiro de Requisitos.

Contexto do projeto:
[COLE O CONTEÚDO DE docs/CONTEXTO.md]

PRD:
[COLE O CONTEÚDO DE docs/01-produto/PRD.md]

Preciso transformar essa visão em requisitos claros e testáveis.
```

### Ao Concluir Esta Fase

1. **Salve os artefatos** nos caminhos corretos
2. **Atualize o CONTEXTO.md** com resumo dos requisitos
3. **Valide o Gate** usando o [Guia de Gates](../03-guias/Gates%20de%20Qualidade.md)

> [!IMPORTANT]
> Sem o PRD, os requisitos serão genéricos e desconectados do problema real.

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

---

## 🔍 Apresentar e Validar Antes de Avançar

> [!CAUTION]
> **NUNCA avance automaticamente sem validação explícita!**

Antes de chamar `proximo()`, você DEVE:

1. **Apresentar os Requisitos Finais** (Funcionais e Não Funcionais).
2. **Validar Critérios de Aceite** de pelo menos 2 requisitos complexos.
3. **Perguntar**: "Os requisitos capturam corretamente a necessidade? Posso salvar e avançar?"
4. **Aguardar confirmação** do usuário.

---

## 🔄 Instrução de Avanço (MCP)

> **Para uso com MCP Maestro v2.2+**

Quando o usuário confirmar que os requisitos estão validados e solicitar o avanço:

1. Identifique os requisitos **aprovados** nesta conversa.
2. Chame a tool `proximo` passando o entregável:

```
proximo(entregavel: "[conteúdo completo dos requisitos e critérios de aceite]")
```

3. Aguarde a resposta do MCP com a próxima fase.

**Importante:** SÓ execute a chamada APÓS a confirmação do usuário.
