# Prompt: Discovery Inicial de Produto

> **Quando usar**: Início de projeto, quando há apenas uma ideia ou anotações soltas
> **Especialista**: [Gestão de Produto](../../02-especialistas/Especialista%20em%20Gestão%20de%20Produto%20.md)
> **Nível**: Simples

---

## Fluxo de Contexto

Este é geralmente o **primeiro prompt** de um novo projeto.

Após gerar, salve o resultado em:
- `docs/CONTEXTO.md` - Como base inicial
- `docs/01-produto/PRD.md` - Documento de produto

---

## Prompt Completo

```text
Atue como gerente de produto sênior especializado em discovery.

## Input

Vou colar abaixo anotações soltas sobre uma ideia de produto:

---

[COLE SUAS ANOTAÇÕES, IDEIAS, TRANSCRIÇÕES DE REUNIÕES]

---

## Sua Missão

Organize as informações em um Discovery estruturado:

### 1. Problema Central
- Qual dor estamos resolvendo?
- Por que é um problema hoje?
- Qual o custo de não resolver?

### 2. Proposta de Solução
- Como pretendemos resolver?
- Qual o diferencial da nossa abordagem?
- O que NÃO vamos fazer (escopo negativo)?

### 3. Público-Alvo

#### Segmentação
- Quem são os usuários principais?
- Qual o tamanho do mercado aproximado?

#### Personas (2-3)
Para cada persona:
- Nome fictício e contexto
- Dores específicas
- Objetivos
- Comportamento atual (como resolve hoje)

### 4. Jobs-to-be-Done (JTBD)

Para cada job principal:
- "Quando [situação], eu quero [motivação], para que [resultado esperado]."

### 5. Análise de Concorrentes

| Concorrente | Tipo | Pontos Fortes | Pontos Fracos | Diferencial |
|-------------|------|---------------|---------------|-------------|
| [Nome] | Direto | ... | ... | ... |
| [Nome] | Indireto | ... | ... | ... |

### 6. Hipóteses e Riscos

#### Hipóteses a Validar
- [Hipótese 1] - Como validar
- [Hipótese 2] - Como validar

#### Riscos Identificados
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Risco 1] | Alta/Média/Baixa | Alto/Médio/Baixo | [Ação] |

### 7. Métricas de Sucesso (North Star)

- Métrica principal que indica sucesso
- KPIs secundários
- Como medir cada um

### 8. MVP Sugerido

- Funcionalidades essenciais (máximo 5)
- O que fica para depois
- Critério de sucesso do MVP

### 9. Próximos Passos

- [ ] Ação 1 - Responsável - Prazo
- [ ] Ação 2 - Responsável - Prazo
- [ ] Ação 3 - Responsável - Prazo
```

---

## Exemplo de Uso

```text
Atue como gerente de produto sênior especializado em discovery.

## Input

Vou colar abaixo anotações soltas sobre uma ideia de produto:

---

Conversa com dona de salão:
- Perde muito tempo atendendo WhatsApp pra agendar
- Às vezes esquece de confirmar com cliente
- Cliente reclama que não consegue ver horários disponíveis
- Concorrente dela tem um sistema mas é muito caro (R$200/mês)
- Ela queria algo simples, só agendamento mesmo
- Importante: integrar com WhatsApp de alguma forma
- Tem 3 funcionárias, cada uma faz serviços diferentes
- Horário: seg-sab 9h-19h
- Acha que uns 50-100 clientes por mês

Ideias iniciais:
- App web responsivo (sem app nativo por enquanto)
- Integrar com API do WhatsApp Business
- Cliente escolhe profissional, serviço e horário
- Enviar lembrete automático
- Relatório simples de agendamentos

---

[CONTINUA COM O PROMPT COMPLETO]
```

---

## Resposta Esperada

### 1. Problema Central

**Dor**: Pequenos negócios de serviços (salões, clínicas) gastam tempo excessivo gerenciando agendamentos manualmente via WhatsApp.

**Por que é problema**: 
- Interrompe trabalho principal para atender mensagens
- Erros de marcação (sobreposição de horários)
- Cliente insatisfeito com demora na resposta

**Custo**: ~2h/dia em atendimento de agendamentos = 40h/mês

### 2. Proposta de Solução

**Como resolver**: Plataforma self-service onde cliente agenda sozinho, 24h.

**Diferencial**: Integração nativa com WhatsApp (onde o cliente já está).

**Escopo negativo**: 
- Não vamos fazer controle financeiro
- Não vamos fazer estoque de produtos

### 3. Personas

**1. Maria, Dona de Salão**
- 38 anos, 3 funcionárias
- Dor: Perde clientes por não responder rápido
- Objetivo: Mais tempo para atender, menos no celular
- Hoje: WhatsApp manual + agenda de papel

**2. Carla, Cliente Frequente**
- 28 anos, profissional
- Dor: Só consegue ligar em horário comercial
- Objetivo: Agendar quando quiser, sem esperar
- Hoje: Manda WhatsApp e espera resposta

### 4. JTBD

- "Quando quero marcar um horário, quero ver a disponibilidade em tempo real, para não precisar esperar resposta."
- "Quando está chegando meu horário, quero receber lembrete, para não esquecer."

### 5. MVP Sugerido

1. Cadastro de serviços e profissionais
2. Agenda online com horários disponíveis
3. Cliente agenda sem login (só telefone)
4. Confirmação automática via WhatsApp
5. Painel simples para o salão

---

## Checklist Pós-Geração

- [ ] Problema central está claro e validável
- [ ] 2-3 personas com dores específicas
- [ ] JTBDs escritos no formato correto
- [ ] Concorrentes mapeados (diretos e indiretos)
- [ ] Hipóteses listadas com forma de validar
- [ ] MVP com máximo 5 features
- [ ] Métricas de sucesso definidas
- [ ] Próximos passos com responsáveis
- [ ] Salvar em `docs/CONTEXTO.md` e `docs/01-produto/PRD.md`
