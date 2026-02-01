# Prompt: Threat Modeling (Modelagem de Ameaças)

> **Quando usar**: No início do projeto, antes de implementar funcionalidades críticas
> **Especialista**: [Segurança da Informação](../../02-especialistas/Especialista%20em%20Segurança%20da%20Informação.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura do sistema
- Lista de ativos valiosos do sistema

Após gerar, salve o resultado em:
- `docs/09-seguranca/threat-model.md`

---

## Prompt Completo

```text
Atue como especialista em segurança de aplicações focado em modelagem de ameaças (Threat Modeling).

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Arquitetura do Sistema

[DESCREVA OU COLE A ARQUITETURA - inclua diagrama se disponível]

## Ativos de Valor

Liste os ativos mais importantes do sistema:
- Dados: [ex: dados de clientes, transações financeiras, credenciais]
- Funcionalidades: [ex: autenticação, processamento de pagamentos]
- Infraestrutura: [ex: banco de dados, APIs externas]

## Atores e Usuários

- Usuários legítimos: [tipos de usuários do sistema]
- Potenciais atacantes: [internos? externos? concorrentes?]
- Nível de sofisticação esperado: [script kiddies, APT?]

## Compliance e Contexto de Risco

- Indústria: [fintech, saúde, e-commerce, etc]
- Regulamentações: [LGPD, PCI-DSS, HIPAA]
- Tolerância a risco: [baixa/média/alta]

---

## Sua Missão

Realize uma modelagem de ameaças completa usando STRIDE:

### 1. Decomposição do Sistema

Identifique e documente:

#### Pontos de Entrada
| ID | Ponto de Entrada | Descrição | Nível de Confiança |
|----|------------------|-----------|---------------------|
| E1 | [ex: API REST] | [descrição] | [Público/Autenticado/Admin] |

#### Ativos e Dados
| ID | Ativo | Sensibilidade | Localização |
|----|-------|---------------|-------------|
| A1 | [ex: Dados de usuário] | [Alta/Média/Baixa] | [onde está armazenado] |

#### Superfície de Ataque
| Componente | Exposição | Criticidade |
|------------|-----------|-------------|
| [ex: API pública] | [Internet/Interna] | [Alta/Média/Baixa] |

### 2. Análise STRIDE

Para cada componente crítico, analise:

#### Spoofing (Falsificação de identidade)
- [ ] Como um atacante pode fingir ser outro usuário?
- Vetores identificados:
- Controles existentes:
- Recomendações:

#### Tampering (Adulteração)
- [ ] Como dados podem ser modificados indevidamente?
- Vetores identificados:
- Controles existentes:
- Recomendações:

#### Repudiation (Repúdio)
- [ ] Ações podem ser negadas por ausência de logs?
- Vetores identificados:
- Controles existentes:
- Recomendações:

#### Information Disclosure (Vazamento)
- [ ] Como dados sensíveis podem vazar?
- Vetores identificados:
- Controles existentes:
- Recomendações:

#### Denial of Service (Negação de serviço)
- [ ] Como o sistema pode ser derrubado?
- Vetores identificados:
- Controles existentes:
- Recomendações:

#### Elevation of Privilege (Escalação)
- [ ] Como um usuário pode obter mais permissões?
- Vetores identificados:
- Controles existentes:
- Recomendações:

### 3. Diagrama de Fluxo de Dados (DFD)

Crie um DFD mostrando:
- Processos (círculos)
- Data stores (cilindros)
- Entidades externas (retângulos)
- Fluxos de dados (setas com labels)
- Trust boundaries (linhas tracejadas)

### 4. Matriz de Riscos

| ID | Ameaça | STRIDE | Probabilidade | Impacto | Risco | Mitigação |
|----|--------|--------|---------------|---------|-------|-----------|
| T1 | [descrição] | [S/T/R/I/D/E] | [1-5] | [1-5] | [P*I] | [ação] |

### 5. Árvore de Ataque (para ameaças críticas)

Para as top 3 ameaças, detalhe:
```
[Objetivo do atacante]
├── Método 1
│   ├── Pré-condição
│   └── Passos
├── Método 2
│   ├── Pré-condição
│   └── Passos
```

### 6. Plano de Mitigação Priorizado

| Prioridade | Ameaça | Mitigação | Esforço | Owner |
|------------|--------|-----------|---------|-------|
| ⭐⭐⭐ | [T1] | [ação] | [dias] | [time] |
| ⭐⭐ | [T2] | [ação] | [dias] | [time] |
```

---

## Exemplo de Uso

```text
Atue como especialista em segurança de aplicações focado em modelagem de ameaças.

## Contexto do Projeto

Marketplace de produtos artesanais. Vendedores cadastram produtos, compradores compram via cartão ou PIX.

## Arquitetura do Sistema

- Frontend: React SPA
- Backend: Node.js + Express
- Banco: PostgreSQL
- Pagamentos: API do Stripe
- Storage: S3 para imagens

## Ativos de Valor

- Dados: credenciais de usuário, dados de cartão (tokenizados), endereços de entrega
- Funcionalidades: checkout, gestão de pedidos
- Infraestrutura: banco de dados, integração Stripe

## Atores

- Usuários legítimos: compradores, vendedores, admins
- Potenciais atacantes: externos (fraude), vendedores mal-intencionados
- Sofisticação: média (script kiddies a semi-profissionais)

## Compliance

- LGPD (dados pessoais brasileiros)
- PCI-DSS compliance via Stripe
- Tolerância a risco: baixa (envolve dinheiro)
```

---

## Resposta Esperada (Resumo)

### Top 5 Ameaças Identificadas

| ID | Ameaça | Categoria | Risco |
|----|--------|-----------|-------|
| T1 | Vendedor fraudulento cria produtos falsos | Spoofing | 20 (Alto) |
| T2 | Vazamento de dados de clientes via API | Info Disclosure | 16 (Alto) |
| T3 | Manipulação de preço no checkout | Tampering | 12 (Médio) |
| T4 | DDoS na API de checkout | DoS | 10 (Médio) |
| T5 | Admin comprometido escala privilégios | Elevation | 8 (Médio) |

### Mitigações Prioritárias

1. **Validação de vendedor** - KYC básico antes de permitir vendas
2. **Rate limiting + WAF** - Proteção contra DDoS
3. **Validação server-side de preços** - Nunca confiar no frontend

---

## Checklist Pós-Geração

- [ ] Ativos de valor identificados
- [ ] Pontos de entrada mapeados
- [ ] Superfície de ataque documentada
- [ ] Análise STRIDE completa para componentes críticos
- [ ] DFD com trust boundaries
- [ ] Matriz de riscos calculada
- [ ] Top 3-5 ameaças com árvores de ataque
- [ ] Plano de mitigação priorizado
- [ ] Salvar em `docs/09-seguranca/threat-model.md`
