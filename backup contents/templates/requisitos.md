# Requisitos: [Nome do Sistema]

**Versão:** 1.0  
**Data:** YYYY-MM-DD  
**Autor:** [Nome]  
**PRD Relacionado:** [Link para PRD]

---

## 1. Visão Geral

[Resumo de 2-3 linhas do sistema baseado no PRD]

---

## 2. Requisitos Funcionais

### RF001 - [Título do Requisito]
| Campo | Valor |
|---|---|
| **Descrição** | O sistema deve [ação específica] |
| **Prioridade** | P0/P1/P2 |
| **Persona** | [Qual persona usa] |
| **Critérios de Aceite** | Ver CA001 |
| **Dependências** | RF002, RF003 |

### RF002 - [Título do Requisito]
| Campo | Valor |
|---|---|
| **Descrição** | O sistema deve [ação específica] |
| **Prioridade** | P0/P1/P2 |
| **Persona** | |
| **Critérios de Aceite** | Ver CA002 |
| **Dependências** | |

### RF003 - [Título do Requisito]
| Campo | Valor |
|---|---|
| **Descrição** | O sistema deve [ação específica] |
| **Prioridade** | |
| **Persona** | |
| **Critérios de Aceite** | |
| **Dependências** | |

[Adicione mais RFs conforme necessário]

---

## 3. Requisitos Não-Funcionais

### RNF001 - Performance
| Campo | Valor |
|---|---|
| **Descrição** | O sistema deve responder em menos de [X]ms para [Y]% das requisições |
| **Métrica** | Latência p95 < Xms |
| **Como medir** | APM, logs, load test |

### RNF002 - Disponibilidade
| Campo | Valor |
|---|---|
| **Descrição** | O sistema deve estar disponível [X]% do tempo |
| **Métrica** | Uptime >= X% |
| **Como medir** | Monitoramento, alertas |

### RNF003 - Segurança
| Campo | Valor |
|---|---|
| **Descrição** | [Requisito de segurança] |
| **Métrica** | |
| **Como medir** | |

### RNF004 - Escalabilidade
| Campo | Valor |
|---|---|
| **Descrição** | O sistema deve suportar [X] usuários simultâneos |
| **Métrica** | |
| **Como medir** | Load test |

### RNF005 - Usabilidade
| Campo | Valor |
|---|---|
| **Descrição** | [Requisito de UX] |
| **Métrica** | |
| **Como medir** | |

---

## 4. Regras de Negócio

### RN001 - [Título]
**Descrição:** [Regra específica que o sistema deve seguir]

**Exemplo:**
- Se [condição], então [ação]
- Caso [situação], [comportamento esperado]

### RN002 - [Título]
**Descrição:** [Regra]

---

## 5. Integrações

| ID | Sistema Externo | Tipo | Descrição |
|---|---|---|---|
| INT001 | [Nome] | API REST / Webhook / File | [O que integra] |
| INT002 | | | |

---

## 6. Dúvidas em Aberto

| ID | Pergunta | Responsável | Status | Resposta |
|---|---|---|---|---|
| Q001 | [Pergunta para stakeholder] | [Nome] | Pendente | |
| Q002 | | | | |

---

## 7. Glossário

| Termo | Definição |
|---|---|
| [Termo técnico ou de negócio] | [Definição clara] |
| | |

---

## Matriz de Rastreabilidade

| Requisito | User Stories | Casos de Teste |
|---|---|---|
| RF001 | US001, US002 | TC001, TC002 |
| RF002 | US003 | TC003 |

---

## 8. Matriz Requisitos × Telas

> [!NOTE]
> Mapeie quais telas serão afetadas por cada requisito. Telas são estimativas iniciais que serão refinadas na fase de UX.

| RF ID | Descrição Resumida | Telas Estimadas | Componentes Prováveis |
|-------|-------------------|-----------------|----------------------|
| RF001 | [Descrição curta] | [Tela1, Tela2] | [Componente1] |
| RF002 | [Descrição curta] | [Tela1] | [Componente1, Componente2] |
| RF003 | [Descrição curta] | [Tela2, Tela3] | [Componente2] |

### Legenda de Telas

| ID | Nome da Tela | Tipo | Área |
|----|-------------|------|------|
| T01 | [Nome] | [Lista/Detalhe/Form] | [Pública/Auth] |
| T02 | [Nome] | | |

---

## Changelog

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0 | YYYY-MM-DD | [Nome] | Versão inicial |
