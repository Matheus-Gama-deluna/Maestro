# Prompt: Refinar Requisitos

> **Quando usar**: Após discovery inicial, para estruturar requisitos formais
> **Especialista**: [Engenharia de Requisitos](../../02-especialistas/Especialista%20em%20Engenharia%20de%20Requisitos%20com%20IA.md)
> **Nível**: Simples a Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- Notas de reuniões ou transcrições

Após gerar, salve o resultado em:
- `docs/02-requisitos/requisitos.md`

---

## Prompt Completo

```text
Atue como analista de requisitos sênior.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Notas Brutas

Vou colar abaixo anotações soltas de reuniões com o cliente:

---

[COLE TEXTO - Anotações, transcrições, emails, etc]

---

## Sua Missão

Organize as informações em requisitos formais:

### 1. Visão Geral
Resumo do sistema em 2-3 parágrafos.

### 2. Requisitos Funcionais

Para cada requisito funcional:
- **ID**: RF-XXX
- **Título**: [Nome curto]
- **Descrição**: O sistema deve [ação] para que [benefício]
- **Prioridade**: Must/Should/Could/Won't (MoSCoW)
- **Critérios de Aceitação**: Lista de condições verificáveis
- **Dependências**: Outros RFs que precisam existir

Agrupe os requisitos por módulo/feature.

### 3. Requisitos Não-Funcionais

Para cada requisito não-funcional:
- **ID**: RNF-XXX
- **Categoria**: Performance/Segurança/Usabilidade/Confiabilidade/Compatibilidade
- **Descrição**: [Descrição mensurável]
- **Métrica**: [Como medir]
- **Target**: [Valor objetivo]

### 4. Regras de Negócio

Regras que o sistema deve sempre respeitar:
- **RN-XXX**: [Regra em linguagem natural]
- Contexto: Quando se aplica
- Exceções: Se houver

### 5. Matriz de Priorização MoSCoW

| Prioridade | Requisitos | Justificativa |
|------------|------------|---------------|
| Must Have | [RFs essenciais] | Sem esses o sistema não funciona |
| Should Have | [RFs importantes] | Alto valor, mas MVP funciona sem |
| Could Have | [RFs desejáveis] | Nice to have |
| Won't Have | [Fora do escopo] | Explicitamente excluídos |

### 6. User Stories (Épicos Principais)

Para os 3-5 fluxos principais, escreva User Stories:

**US-XXX: [Título]**
- Como [persona]
- Quero [ação]
- Para que [benefício]

### 7. Critérios de Aceitação em Gherkin

Para os requisitos mais críticos, escreva cenários BDD:

```gherkin
Funcionalidade: [Nome do RF]

  Cenário: [Cenário de sucesso]
    Dado que [pré-condição]
    Quando [ação do usuário]
    Então [resultado esperado]

  Cenário: [Cenário de erro]
    Dado que [pré-condição]
    Quando [ação inválida]
    Então [mensagem de erro esperada]
```

### 8. Dúvidas Pendentes

Lista de perguntas que precisam ser respondidas pelo cliente:
- [ ] [Dúvida 1] - Impacto: [Alto/Médio/Baixo]
- [ ] [Dúvida 2] - Impacto: [Alto/Médio/Baixo]

### 9. Glossário

Termos específicos do domínio com definições claras.
```

---

## Exemplo de Uso

```text
Atue como analista de requisitos sênior.

## Contexto do Projeto

Sistema de agendamento online para salões de beleza.

## Notas Brutas

Reunião 15/01 com Maria (dona do salão):
- Cliente deve poder marcar horário pelo celular
- Precisa ver quais horários estão disponíveis
- Cada profissional tem sua agenda
- Confirmação via WhatsApp é essencial
- Cancelar precisa de pelo menos 2h de antecedência
- Quer ver quantos agendamentos teve no mês
- Não quer fazer pagamento online agora, só agendamento
- Sistema precisa ser fácil, ela não é muito de tecnologia
- Queria algo mais barato que R$200/mês
```

---

## Resposta Esperada

### 1. Visão Geral

Sistema web responsivo para agendamento de serviços em salões de beleza. 
Permite que clientes visualizem disponibilidade e agendem horários de forma 
autônoma, recebendo confirmações via WhatsApp.

### 2. Requisitos Funcionais

#### Módulo: Agendamento

**RF-001: Visualizar horários disponíveis**
- Descrição: O sistema deve exibir os horários disponíveis por profissional
- Prioridade: Must Have
- Critérios de Aceitação:
  - Mostra apenas horários futuros
  - Filtra por profissional selecionado
  - Indica duração do serviço
- Dependências: RF-003

**RF-002: Realizar agendamento**
- Descrição: O sistema deve permitir que cliente agende um horário
- Prioridade: Must Have
- Critérios de Aceitação:
  - Cliente informa nome e telefone
  - Seleciona profissional, serviço e horário
  - Recebe confirmação visual na tela
- Dependências: RF-001

**RF-003: Enviar confirmação WhatsApp**
- Descrição: O sistema deve enviar mensagem de confirmação via WhatsApp
- Prioridade: Must Have
- Critérios de Aceitação:
  - Mensagem enviada em até 1 minuto após agendar
  - Contém data, hora, serviço e profissional

### 3. Requisitos Não-Funcionais

**RNF-001: Tempo de Resposta**
- Categoria: Performance
- Descrição: Telas devem carregar rapidamente
- Métrica: Latência p95
- Target: < 2 segundos

**RNF-002: Disponibilidade**
- Categoria: Confiabilidade
- Descrição: Sistema deve estar disponível para agendamentos
- Métrica: Uptime mensal
- Target: 99.5%

### 7. Gherkin

```gherkin
Funcionalidade: Agendar horário

  Cenário: Cliente agenda horário com sucesso
    Dado que estou na página de agendamento
    E existe o profissional "Ana" com horário "14:00" disponível
    Quando seleciono o serviço "Corte Feminino"
    E escolho a profissional "Ana"
    E escolho o horário "14:00"
    E informo meu telefone "11999998888"
    Então devo ver a mensagem "Agendamento confirmado!"
    E devo receber uma mensagem no WhatsApp

  Cenário: Cliente tenta agendar horário ocupado
    Dado que o horário "14:00" já está ocupado
    Quando tento selecionar o horário "14:00"
    Então devo ver a mensagem "Horário indisponível"
```

---

## Checklist Pós-Geração

- [ ] Requisitos funcionais têm IDs únicos (RF-XXX)
- [ ] Cada RF tem prioridade MoSCoW
- [ ] Requisitos não-funcionais são mensuráveis
- [ ] Regras de negócio estão documentadas
- [ ] Pelo menos 3 cenários Gherkin para fluxos críticos
- [ ] Dúvidas pendentes listadas com impacto
- [ ] Glossário com termos do domínio
- [ ] Matriz MoSCoW organizada
- [ ] Salvar em `docs/02-requisitos/requisitos.md`
