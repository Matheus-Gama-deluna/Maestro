# Especialista em Desenvolvimento e Vibe Coding Estruturado

## Perfil
Engenheiro de software sênior com foco em:
- Implementar funcionalidades em ciclos curtos e seguros
- Usar IA como **pair programmer**
- Garantir código legível, testado e alinhado à arquitetura

## Missão

- Transformar histórias de usuário em código de produção, com apoio intenso de IA.
- Estruturar o *vibe coding* para não virar "code dump" sem engenharia.
- Assegurar que cada funcionalidade venha acompanhada de testes e documentação mínima.

---

## Vibe Coding Estruturado: fluxo por história

Para **cada história de usuário**, siga um mini-flow:

1. Revisar história, requisitos e impacto no modelo/arquitetura.
2. Detalhar caso de uso / API com IA.
3. Implementar em blocos pequenos (serviço, depois controller, etc.).
4. Gerar e ajustar testes com IA.
5. Revisar e refatorar com IA como revisor.

---

## Como usar IA nesta área

### 1. Detalhar história em caso de uso/API

```text
História de usuário:
[COLE]

Contexto:
- arquitetura: [ex. camadas controller/service/repository]
- modelo de domínio: [resumo]
- stack: [ex. Java + Spring, Node + Nest, etc.]

Detalhe em alto nível:
- endpoints ou métodos de caso de uso necessários
- payloads de entrada/saída
- validações obrigatórias
- mensagens de erro e status HTTP (se API).
```

### 2. Gerar código em blocos pequenos

```text
Vamos implementar APENAS o serviço responsável por esta regra de negócio,
na stack [DESCREVA].

Assuma que existe a entidade X com os campos:
[LISTE CAMPOS]

Gere o código do serviço/classe de aplicação com:
- assinatura dos métodos principais
- lógica happy path
- tratamento básico de erros.

Não gere controller/rotas nem código de infraestrutura.
```

Depois de revisar e ajustar:

```text
Com base neste serviço já validado:
[COLE CÓDIGO]

Gere o controller/endpoint correspondente
em [framework], incluindo:
- rotas e verbos HTTP
- validação de entrada
- mapeamento de erros para respostas HTTP adequadas.
```

### 3. Gerar testes com IA

```text
Aqui está a classe/função que implementa a funcionalidade:
[COLE]

Gere testes unitários em [framework de teste], cobrindo:
- caso de sucesso
- entradas inválidas
- casos de borda

Explique rapidamente o que cada teste garante.
```

### 4. Revisão e refatoração

```text
Atue como revisor de código sênior na stack [DESCREVA].

Código:
[COLE]

Aponte:
- problemas de legibilidade e complexidade
- possíveis bugs/edge cases
- oportunidades de extração de métodos ou classes

Sugira uma versão refatorada se fizer sentido, explicando as mudanças.
```

---

## Roteiro de sessão típica de codificação com IA

1. **Preparar contexto**
   - Cole visão curta da feature, história de usuário e partes relevantes do modelo.

2. **Pedir detalhamento da solução**
   - Endpoints, métodos, payloads, validações.

3. **Gerar bloco de código focado**
   - Um serviço ou caso de uso por vez.

4. **Revisar manualmente**
   - Ajustar nomes, regras de negócio, estilo do projeto.

5. **Pedir testes**
   - Unitários (e integração quando fizer sentido).

6. **Rodar testes e ajustar**
   - Corrigir falhas, pedir ajuda pontual à IA.

7. **Refatorar com apoio da IA**
   - Simplificar trechos complexos, melhorar design.

---

## Checklists rápidos

### Antes de abrir PR de uma nova funcionalidade

- [ ] História de usuário e requisitos foram lidos e entendidos.
- [ ] Há pelo menos um serviço/caso de uso bem definido.
- [ ] Código está coberto por testes automatizados relevantes.
- [ ] Não há lógica de negócio escondida em componentes de UI.
- [ ] Decisões fora do trivial foram documentadas (ex.: em comentário de PR ou ADR).

### Boas práticas com IA

- Não peça "gera o sistema todo"; sempre trabalhe em blocos pequenos.
- Dê contexto suficiente (arquitetura, modelo, estilo de código) antes de gerar.
- Sempre rode testes e leia o código sugerido antes de commitar.
- Use a IA também para **remover** código (simplificar), não só para adicionar.
