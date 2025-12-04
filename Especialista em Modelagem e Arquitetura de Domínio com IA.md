# Especialista em Modelagem e Arquitetura de Domínio com IA

## Perfil
Arquiteto/engenheiro de software focado em:
- Entender o domínio do problema
- Traduzir requisitos em **casos de uso, entidades e relacionamentos**
- Desenhar arquiteturas adequadas ao contexto, com apoio de IA

## Missão

- Ajudar o time a sair de "lista de requisitos" para um **modelo mental compartilhado** do sistema.
- Facilitar decisões arquiteturais com clareza de trade-offs.
- Usar IA para acelerar diagramas conceituais, mas mantendo liderança humana nas decisões.

---

## Fluxo de trabalho sugerido

1. Ler visão e requisitos priorizados.
2. Identificar atores e casos de uso principais.
3. Modelar o domínio (entidades, relacionamentos, regras de negócio).
4. Propor arquitetura inicial (ex.: camadas, microserviços, C4).
5. Revisar com o time, iterando com ajuda da IA.

---

## Como usar IA nesta área

### 1. Casos de uso a partir dos requisitos

```text
Com base nos requisitos abaixo:
[COLE REQUISITOS]

Liste:
- atores
- casos de uso principais

Para cada caso de uso, descreva:
- objetivo
- pré-condições
- fluxo principal (passos)
- fluxos alternativos/erros relevantes.
```

### 2. Modelo de domínio inicial

```text
Considerando os casos de uso e requisitos:
[COLE]

Proponha um modelo de domínio inicial com:
- entidades (nome e breve descrição)
- principais atributos (nome e tipo aproximado)
- relacionamentos (1-1, 1-N, N-N)

Aponte também:
- regras de negócio mais importantes em cada entidade
- dúvidas que ainda precisam ser esclarecidas.
```

### 3. Arquitetura em estilo C4

```text
Quero implementar esse sistema na seguinte stack:
[DESCREVA STACK: ex. React + Node/Nest + Postgres]

Com base em visão, requisitos e modelo de domínio:
[COLE]

Descreva uma arquitetura em estilo C4:
- Nível 1: diagrama de contexto (sistemas externos principais)
- Nível 2: containers (frontend, backend(s), banco, filas etc.)
- Nível 3: componentes principais (serviços, módulos, adapters)

Explique as principais decisões e trade-offs.
```

### 4. Revisar e simplificar a arquitetura

```text
Aqui está a arquitetura proposta para o sistema:
[COLE TEXTO/DIAGRAMA DESCRITO]

Atue como um arquiteto pragmático.
Avalie:
- pontos desnecessariamente complexos
- dependências fortes demais entre componentes
- riscos técnicos (disponibilidade, performance, segurança)

Sugira simplificações mantendo o escopo atual.
```

---

## Prompts úteis

### Gerar descrição textual para diagramas (PlantUML/Mermaid)

```text
Com base neste modelo de domínio:
[COLE]

Gere uma descrição de diagrama de classes em formato compatível com PlantUML ou Mermaid,
representando entidades e relacionamentos.
Não invente entidades novas, use apenas as listadas.
```

### Mapear impacto de uma nova funcionalidade no modelo/arquitetura

```text
Nova funcionalidade:
[DESCREVA]

Modelo de domínio e arquitetura atuais:
[COLE RESUMO]

Analise o impacto dessa nova funcionalidade em:
- entidades (novas ou modificadas)
- casos de uso existentes
- componentes/serviços

Sugira ajustes mínimos necessários no modelo e na arquitetura.
```

---

## Checklists rápidos

### Modelo de domínio

- [ ] Entidades principais do negócio identificadas.
- [ ] Relacionamentos entre entidades claros.
- [ ] Regras de negócio críticas estão associadas a entidades/casos de uso.
- [ ] Termos do domínio estão nomeados de forma consistente.

### Arquitetura

- [ ] Arquitetura compatível com o contexto (complexidade só onde precisa).
- [ ] Limites de responsabilidade entre componentes/serviços estão claros.
- [ ] Decisões importantes têm trade-offs discutidos.
- [ ] Há um caminho claro para testes (unitário, integração, E2E).

### Boas práticas com IA

- Use IA para gerar **descrições e alternativas**, não para "decidir sozinha".
- Sempre valide modelo e arquitetura com o time e com o contexto de negócio.
- Converta descrições textuais geradas pela IA em diagramas versionados no repositório.
