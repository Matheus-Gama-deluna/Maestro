# Playbook de Desenvolvimento com IA

## 🎯 Objetivo

Fornecer um método passo a passo para desenvolver software usando IA (ex.: GPT 5.1) em **todas as etapas** do ciclo de vida, como uma evolução do *vibe coding* tradicional, mas estruturado por **engenharia de software**.

## 👥 Público-alvo

- Devs que já usam IA para "quebrar galho" mas querem **processo**.
- Times que desejam padronizar como usar IA em:
  - definição de produto
  - requisitos
  - modelagem e arquitetura
  - implementação (vibe coding estruturado)
  - testes e qualidade.

## 🔧 Especialistas relacionados

Use este playbook em conjunto com os especialistas:

- [Especialista em Gestão de Produto](./Especialista%20em%20Gestão%20de%20Produto%20.md)
- [Especialista em Engenharia de Requisitos com IA](./Especialista%20em%20Engenharia%20de%20Requisitos%20com%20IA.md)
- [Especialista em UX Design](./Especialista%20em%20UX%20Design.md)
- [Especialista em Modelagem e Arquitetura de Domínio com IA](./Especialista%20em%20Modelagem%20e%20Arquitetura%20de%20Domínio%20com%20IA.md)
- [Especialista em Arquitetura de Software](./Especialista%20em%20Arquitetura%20de%20Software.md)
- [Especialista em Segurança da Informação](./Especialista%20em%20Segurança%20da%20Informação.md)
- [Especialista em Análise de Testes](./Especialista%20em%20Análise%20de%20Testes.md)
- [Especialista em Plano de Execução com IA](./Especialista%20em%20Plano%20de%20Execução%20com%20IA.md)
- [Especialista em Desenvolvimento e Vibe Coding Estruturado](./Especialista%20em%20Desenvolvimento%20e%20Vibe%20Coding%20Estruturado.md)

---

## 🔄 Visão geral do método (8 etapas)

1. **Visão & problema**  
   Entender o que estamos construindo, para quem e por quê.

2. **Engenharia de requisitos com IA**  
   Transformar visão em requisitos claros, completos e testáveis.

3. **Modelagem & arquitetura com IA**  
   Casos de uso, modelo de domínio, visão arquitetural inicial.

4. **Planejamento / backlog**  
   Fatiar o produto em épicos e histórias de usuário.

5. **Vibe Coding Estruturado (implementação)**  
   Implementar história a história com IA, em ciclos curtos.

6. **Testes com IA**  
   Planejar e gerar testes (unitários, integração, E2E) com apoio da IA.

7. **Documentação & revisão**  
   Usar IA para revisar código, gerar documentação e melhorar design.

8. **Feedback & evolução**  
   Analisar uso real, bugs e métricas para ajustar o produto.

---

## 1. Visão & problema

- **Especialista principal**: 
  - [Especialista em Gestão de Produto](./Especialista%20em%20Gestão%20de%20Produto%20.md)
- **Objetivo**: sair de ideia vaga para um recorte de produto com objetivo, público, dores e métricas.

### Artefatos
- Visão do produto
- Personas
- Principais dores e oportunidades

### Prompts de exemplo

```text
Atue como um PM sênior. Quero descrever um produto que tenho em mente.

Contexto bruto:
[COLE SUAS ANOTAÇÕES]

Organize em:
- visão do produto
- problema principal que resolve
- público-alvo e 2–3 personas
- principais riscos e hipóteses a validar
```

```text
Com base na visão abaixo:
[COLE VISÃO]

Sugira 3 opções de recorte de MVP, com prós e contras de cada.
```

---

## 2. Engenharia de requisitos com IA

- **Especialista principal**: 
  - [Especialista em Engenharia de Requisitos com IA](./Especialista%20em%20Engenharia%20de%20Requisitos%20com%20IA.md)
- **Objetivo**: gerar requisitos funcionais e não funcionais claros, completos e testáveis.

### Artefatos
- Lista de requisitos funcionais
- Lista de requisitos não funcionais
- Critérios de aceitação (idealmente em Gherkin)

### Prompts de exemplo

```text
Vou colar abaixo anotações soltas de reuniões com o cliente.

Notas:
[COLE TEXTO]

Atue como analista de requisitos.
Organize em:
- visão resumida
- requisitos funcionais ("O sistema deve ...")
- requisitos não funcionais
- dúvidas que precisam ser respondidas com o cliente
```

```text
Aqui estão alguns requisitos ainda vagos:
[COLE REQUISITOS]

Refine cada um para ficar:
- claro e específico
- mensurável/testável
Inclua critérios de aceitação em Gherkin.
```

---

## 3. Modelagem & arquitetura com IA

- **Especialistas principais**:
  - [Especialista em Modelagem e Arquitetura de Domínio com IA](./Especialista%20em%20Modelagem%20e%20Arquitetura%20de%20Domínio%20com%20IA.md)
  - [Especialista em Arquitetura de Software](./Especialista%20em%20Arquitetura%20de%20Software.md)
- **Objetivo**: derivar casos de uso, entidades, relacionamentos e uma arquitetura inicial adequada ao contexto.

### Artefatos
- Casos de uso
- Modelo de domínio (entidades, relacionamentos)
- Diagrama/descrição C4 (Contexto, Containers, Componentes)

### Prompts de exemplo

```text
Com base nesses requisitos:
[COLE REQUISITOS]

Liste:
- atores
- casos de uso principais
- passos de alto nível de cada caso de uso
```

```text
Usando os requisitos e casos de uso abaixo:
[COLE]

Proponha um modelo de domínio inicial:
- entidades
- principais atributos (com tipos aproximados)
- relacionamentos (1-1, 1-N, N-N)
- dúvidas abertas.
```

```text
Quero implementar esse sistema com a stack:
[DESCREVA STACK]

Proponha uma arquitetura em estilo C4 (níveis 1–3)
com justificativa das principais decisões.
```

---

## 4. Planejamento / backlog

- **Especialistas principais**:
  - [Especialista em Gestão de Produto](./Especialista%20em%20Gestão%20de%20Produto%20.md)
  - [Especialista em Plano de Execução com IA](./Especialista%20em%20Plano%20de%20Execução%20com%20IA.md)
- **Objetivo**: transformar requisitos em épicos e histórias de usuário, com prioridades.

### Artefatos
- Backlog de épicos
- Histórias de usuário
- Critérios de aceite por história

### Prompts de exemplo

```text
Com base nesses requisitos e modelo de domínio:
[COLE]

Gere um backlog inicial com:
- épicos
- histórias de usuário em formato:
  Como [persona], quero [ação] para [benefício].
- critérios de aceitação para cada história.
Ordene por prioridade para um MVP.
```

```text
Aqui está um conjunto de histórias de usuário:
[COLE HISTÓRIAS]

Verifique:
- histórias grandes demais que podem ser fatiadas
- dependências importantes
- riscos técnicos.
Sugira uma ordem de implementação.
```

---

## 5. Vibe Coding Estruturado (implementação)

- **Especialista principal**:
  - [Especialista em Desenvolvimento e Vibe Coding Estruturado](./Especialista%20em%20Desenvolvimento%20e%20Vibe%20Coding%20Estruturado.md)
- **Objetivo**: implementar funcionalidade por funcionalidade, em ciclos curtos, usando IA como pair programmer com foco em qualidade.

### Artefatos
- Código da funcionalidade
- Casos de uso / endpoints
- Testes automatizados (ao menos unitários)

### Prompts de exemplo

```text
História de usuário:
[COLE HISTÓRIA]

Stack: [DESCREVA LINGUAGEM/FRAMEWORK].

Detalhe, em alto nível:
- endpoints ou casos de uso necessários
- payloads de entrada/saída
- validações obrigatórias
- erros comuns e como tratar.
```

```text
Agora gere APENAS o serviço/classe de domínio responsável por implementar
essa regra de negócio, assumindo que já existe a entidade X com os campos:
[DESCREVA].

Inclua:
- assinatura do método
- lógica principal
- tratamento básico de erros.
Não gere controller/rota ainda.
```

---

## 6. Testes com IA

- **Especialista principal**:
  - [Especialista em Análise de Testes](./Especialista%20em%20Análise%20de%20Testes.md)
- **Objetivo**: usar IA para planejar e gerar testes (unitários, integração, E2E) sem abrir mão de senso crítico humano.

### Artefatos
- Plano de testes
- Testes automatizados
- Métricas de cobertura e qualidade

### Prompts de exemplo

```text
Aqui está a descrição da funcionalidade e seus requisitos:
[COLE]

Gere um plano de testes resumido com:
- tipos de teste sugeridos (unitário, integração, E2E)
- principais cenários de teste
- casos de borda.
```

```text
Aqui está a função/classe que implementei em [LINGUAGEM]:
[COLE CÓDIGO]

Gere testes unitários em [FRAMEWORK DE TESTE], cobrindo:
- caso de sucesso
- entradas inválidas
- casos de borda.
Explique rapidamente o raciocínio de cada teste.
```

---

## 7. Documentação & revisão

- **Especialistas principais**:
  - [Especialista em Arquitetura de Software](./Especialista%20em%20Arquitetura%20de%20Software.md)
  - [Especialista em Plano de Execução com IA](./Especialista%20em%20Plano%20de%20Execução%20com%20IA.md)
- **Objetivo**: garantir que o conhecimento não fique só no código e que decisões importantes estejam registradas.

### Artefatos
- Documentação técnica
- ADRs (Architecture Decision Records) resumidos
- Comentários de PR

### Prompts de exemplo

```text
Aqui está um módulo/classe completo que escrevi:
[COLE]

Gere uma documentação técnica resumida com:
- o que esse módulo faz
- principais responsabilidades
- dependências externas
- exemplos de uso (se fizer sentido).
```

```text
Com base nos pontos de dúvida/discussão abaixo:
[COLE NOTAS]

Gere um ADR resumido (1 página) com:
- contexto
- decisão
- alternativas consideradas
- trade-offs principais.
```

---

## 8. Feedback & evolução

- **Especialistas principais**:
  - [Especialista em Gestão de Produto](./Especialista%20em%20Gestão%20de%20Produto%20.md)
  - [Especialista em Plano de Execução com IA](./Especialista%20em%20Plano%20de%20Execução%20com%20IA.md)
- **Objetivo**: fechar o ciclo, aprendendo com uso real, métricas e bugs.

### Artefatos
- Registro de feedbacks de usuários
- Lista de melhorias
- Próximas iterações planejadas

### Prompts de exemplo

```text
Aqui estão feedbacks e bugs coletados:
[COLE TEXTO/ISSUES]

Agrupe em:
- problemas de usabilidade
- bugs
- pedidos de melhoria.
Sugira ajustes no backlog (novas histórias ou mudanças em histórias existentes).
```

```text
Com base nas métricas do produto abaixo:
[COLE MÉTRICAS]

Sugira hipóteses para explicar os números
 e 3 experimentos que poderíamos rodar na próxima sprint.
```
