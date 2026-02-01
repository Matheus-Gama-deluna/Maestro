# Prompt: Revisão de Conformidade LGPD/GDPR

> **Quando usar**: Projetos com dados pessoais de brasileiros ou europeus
> **Especialista**: [Segurança da Informação](../../02-especialistas/Especialista%20em%20Segurança%20da%20Informação.md)
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/04-modelo/modelo-dominio.md` - Entidades com dados pessoais
- Lista de tipos de dados coletados

Após gerar, salve o resultado em:
- `docs/09-seguranca/lgpd-compliance.md`

---

## Prompt Completo

```text
Atue como especialista em privacidade e proteção de dados (DPO).

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Tipos de Dados Coletados

Liste todos os dados pessoais:
- [ ] Nome, CPF, RG
- [ ] Email, telefone
- [ ] Endereço
- [ ] Dados de pagamento
- [ ] Geolocalização
- [ ] Cookies e tracking
- [ ] Dados de saúde
- [ ] Dados biométricos
- [ ] Outros: [especificar]

## Titulares dos Dados

- Quem são: [clientes, funcionários, fornecedores]
- Quantidade estimada: [volume de registros]
- Localização: [Brasil, UE, outros]

## Finalidades do Tratamento

Para que os dados são usados:
- [ ] Cadastro e login
- [ ] Processamento de pedidos
- [ ] Marketing direto
- [ ] Analytics e melhoria do produto
- [ ] Obrigações legais
- [ ] Outros: [especificar]

## Compartilhamento de Dados

- Terceiros: [processadores de pagamento, analytics, email marketing]
- Transferência internacional: [sim/não, para onde]

---

## Sua Missão

Realize uma análise completa de conformidade LGPD:

### 1. Inventário de Dados Pessoais

| Dado | Categoria | Base Legal | Finalidade | Retenção | Armazenamento |
|------|-----------|------------|------------|----------|---------------|
| [Nome] | Identificação | Contrato | Cadastro | [período] | [local] |

### 2. Análise de Bases Legais (Art. 7º LGPD)

Para cada tratamento, justifique a base legal:

| Tratamento | Base Legal | Justificativa |
|------------|------------|---------------|
| [ex: Cadastro] | Execução de contrato | Necessário para prestar o serviço |
| [ex: Newsletter] | Consentimento | Opt-in explícito no cadastro |
| [ex: Retenção fiscal] | Obrigação legal | Lei 9.613 (5 anos) |

### 3. Direitos dos Titulares (Art. 18º)

Como o sistema atende cada direito:

| Direito | Implementado | Como Exercer |
|---------|--------------|--------------|
| Confirmação de tratamento | [Sim/Não/Parcial] | [descrição] |
| Acesso aos dados | [Sim/Não/Parcial] | [descrição] |
| Correção | [Sim/Não/Parcial] | [descrição] |
| Anonimização/bloqueio | [Sim/Não/Parcial] | [descrição] |
| Portabilidade | [Sim/Não/Parcial] | [descrição] |
| Eliminação | [Sim/Não/Parcial] | [descrição] |
| Revogação de consentimento | [Sim/Não/Parcial] | [descrição] |

### 4. Avaliação de Risco de Privacidade

| Risco | Probabilidade | Impacto | Nível | Mitigação |
|-------|---------------|---------|-------|-----------|
| Vazamento de dados | [1-5] | [1-5] | [P*I] | [ação] |
| Uso indevido | [1-5] | [1-5] | [P*I] | [ação] |
| Retenção excessiva | [1-5] | [1-5] | [P*I] | [ação] |

### 5. Checklist de Conformidade Técnica

#### Coleta de Dados
- [ ] Política de privacidade clara e acessível
- [ ] Consentimento com opt-in (não opt-out)
- [ ] Coleta apenas de dados necessários (minimização)
- [ ] Checkbox de aceite desvinculado de outros termos

#### Armazenamento
- [ ] Dados criptografados em repouso
- [ ] Acesso restrito por necessidade
- [ ] Logs de acesso a dados sensíveis
- [ ] Backup criptografado

#### Compartilhamento
- [ ] Contratos com operadores (Art. 39)
- [ ] Cláusulas de proteção de dados
- [ ] Transferência internacional com salvaguardas

#### Retenção e Eliminação
- [ ] Política de retenção documentada
- [ ] Processo de eliminação automática
- [ ] Anonimização quando possível

### 6. Relatório de Impacto (RIPD)

Se aplicável (tratamento de alto risco):
- Necessidade e proporcionalidade
- Riscos aos titulares
- Medidas de mitigação
- Parecer do encarregado

### 7. Plano de Ação

| Ação | Prioridade | Responsável | Prazo |
|------|------------|-------------|-------|
| [ação] | [Alta/Média/Baixa] | [quem] | [quando] |

### 8. Templates de Documentos

Gere drafts de:
- Política de Privacidade
- Termo de Consentimento
- Processo de atendimento a titulares
```

---

## Exemplo de Uso

```text
Atue como especialista em privacidade e proteção de dados (DPO).

## Contexto do Projeto

App de delivery de comida. Clientes fazem pedidos, restaurantes recebem e entregadores fazem a entrega.

## Tipos de Dados Coletados

- [x] Nome, CPF
- [x] Email, telefone
- [x] Endereço
- [x] Dados de pagamento (tokenizado via Stripe)
- [x] Geolocalização (para entregas)
- [x] Cookies e tracking

## Titulares dos Dados

- Clientes (consumidores finais)
- Entregadores (parceiros)
- Restaurantes (PJ, mas com dados de representantes)
- Volume: ~10.000 clientes, ~500 entregadores

## Finalidades

- [x] Cadastro e login
- [x] Processamento de pedidos
- [x] Marketing direto (promoções)
- [x] Analytics

## Compartilhamento

- Stripe (pagamentos)
- Google Analytics
- Firebase (push notifications)
```

---

## Resposta Esperada (Resumo)

### Gaps Críticos Identificados

| # | Gap | Risco | Ação |
|---|-----|-------|------|
| 1 | Sem política de privacidade | Alto | Criar e publicar |
| 2 | Geolocalização sem consentimento específico | Alto | Adicionar opt-in |
| 3 | Sem processo para exclusão de conta | Médio | Implementar feature |
| 4 | Analytics sem anonimização | Médio | Configurar IP anonymization |

### Cronograma Sugerido

- **Semana 1**: Política de privacidade + termos
- **Semana 2**: Consentimento granular (geolocalização, marketing)
- **Semana 3**: Feature de exclusão de conta
- **Semana 4**: Revisão de terceiros e contratos

---

## Checklist Pós-Geração

- [ ] Inventário de dados pessoais completo
- [ ] Base legal identificada para cada tratamento
- [ ] Direitos dos titulares mapeados
- [ ] Gaps de conformidade identificados
- [ ] Avaliação de risco realizada
- [ ] Checklist técnico verificado
- [ ] RIPD elaborado (se alto risco)
- [ ] Plano de ação priorizado
- [ ] Salvar em `docs/09-seguranca/lgpd-compliance.md`
