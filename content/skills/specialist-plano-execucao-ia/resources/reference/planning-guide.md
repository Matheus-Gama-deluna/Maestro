# Guia Completo - Plano de Execução

**Versão:** 2.0  
**Última Atualização:** 31/01/2026

Este guia fornece metodologias, técnicas e best practices para planejamento de execução com IA.

---

## 📚 Metodologias Ágeis

### **Scrum Framework**

**Artefatos:**
- Product Backlog
- Sprint Backlog
- Increment

**Eventos:**
- Sprint Planning
- Daily Scrum
- Sprint Review
- Sprint Retrospective

**Papéis:**
- Product Owner
- Scrum Master
- Development Team

### **Kanban Principles**

**Práticas Core:**
1. Visualizar o fluxo de trabalho
2. Limitar WIP (Work In Progress)
3. Gerenciar fluxo
4. Tornar políticas explícitas
5. Implementar feedback loops
6. Melhorar colaborativamente

### **SAFe for Enterprise**

**Níveis:**
- Team Level (Scrum/Kanban)
- Program Level (Agile Release Train)
- Portfolio Level (Strategic Themes)

---

## 🎯 Técnicas de Priorização

### **RICE Framework**

**Fórmula:** `Score = (Reach × Impact × Confidence) / Effort`

- **Reach:** Quantas pessoas serão impactadas?
- **Impact:** Qual o impacto no objetivo? (3=Massive, 2=High, 1=Medium, 0.5=Low)
- **Confidence:** Quão confiante você está? (100%=High, 80%=Medium, 50%=Low)
- **Effort:** Quanto esforço (person-months)?

**Exemplo:**
```
Feature: Sistema de Notificações
Reach: 1000 usuários/mês
Impact: 2 (High)
Confidence: 80%
Effort: 2 person-months

Score = (1000 × 2 × 0.8) / 2 = 800
```

### **MoSCoW Method**

- **Must have:** Crítico para MVP
- **Should have:** Importante mas não crítico
- **Could have:** Desejável se houver tempo
- **Won't have:** Fora do escopo atual

### **Value vs Effort Matrix**

```
High Value, Low Effort  → Quick Wins (Prioridade 1)
High Value, High Effort → Major Projects (Prioridade 2)
Low Value, Low Effort   → Fill-Ins (Prioridade 3)
Low Value, High Effort  → Time Sinks (Evitar)
```

---

## 📝 Estrutura de Histórias

### **User Story Format**

**Template:**
```
Como [persona],
Eu quero [ação],
Para [benefício].
```

**Exemplo:**
```
Como cliente do e-commerce,
Eu quero adicionar produtos ao carrinho,
Para comprar múltiplos itens de uma vez.
```

### **Acceptance Criteria (Gherkin)**

**Formato:**
```gherkin
Dado que [contexto inicial]
Quando [ação do usuário]
Então [resultado esperado]
```

**Exemplo:**
```gherkin
Dado que estou na página de produto
Quando clico em "Adicionar ao Carrinho"
Então o produto aparece no carrinho
E o contador do carrinho incrementa em 1
```

### **Definition of Done**

**Checklist Padrão:**
- [ ] Código implementado
- [ ] Testes unitários (>80% coverage)
- [ ] Testes de integração passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Deploy em staging
- [ ] Validação com stakeholder

---

## 📊 Estimation Techniques

### **Story Points (Fibonacci)**

**Escala:** 1, 2, 3, 5, 8, 13, 21

- **1 ponto:** Tarefa trivial (~1-2 horas)
- **2 pontos:** Tarefa simples (~half day)
- **3 pontos:** Tarefa média (~1 dia)
- **5 pontos:** Tarefa complexa (~2-3 dias)
- **8 pontos:** Tarefa muito complexa (~1 semana)
- **13+ pontos:** Épico - quebrar em histórias menores

### **T-Shirt Sizing**

- **XS:** Trivial
- **S:** Simples
- **M:** Médio
- **L:** Grande
- **XL:** Muito grande (quebrar)

### **Planning Poker**

1. Product Owner apresenta história
2. Time discute brevemente
3. Cada membro escolhe carta (Fibonacci)
4. Revelação simultânea
5. Discussão de discrepâncias
6. Re-votação até consenso

---

## 📅 Planejamento de Releases

### **Roadmap Creation**

**Estrutura:**
```
Q1 2026
├── Release 1.0 (MVP)
│   ├── Épico 1: Auth
│   └── Épico 2: Core Features
├── Release 1.1
│   └── Épico 3: Advanced Features
```

### **Sprint Planning**

**Inputs:**
- Product Backlog priorizado
- Velocity do time
- Capacity do sprint

**Outputs:**
- Sprint Goal
- Sprint Backlog
- Commitment

**Fórmula de Capacity:**
```
Capacity = (Devs × Days × Hours) × Focus Factor

Exemplo:
2 devs × 10 dias × 8 horas × 0.7 = 112 horas
```

### **Capacity Planning**

**Fatores a Considerar:**
- Férias e feriados
- Reuniões e overhead
- Dívida técnica
- Bugs e suporte
- Focus factor (0.6-0.8)

---

## ⚠️ Risk Management

### **Identificação de Riscos**

**Categorias:**
- **Técnicos:** Complexidade, dependências
- **Recursos:** Disponibilidade do time
- **Escopo:** Mudanças de requisitos
- **Externos:** Integrações, APIs de terceiros

### **Matriz de Riscos**

| Risco | Probabilidade | Impacto | Score | Mitigação |
|-------|---------------|---------|-------|-----------|
| API de pagamento instável | Alta | Alto | 9 | Implementar retry + fallback |
| Dev sai do projeto | Baixa | Alto | 6 | Documentação + pair programming |

**Score = Probabilidade (1-3) × Impacto (1-3)**

### **Mitigações Comuns**

- **Buffer de 20%** no timeline
- **Spike técnico** para incertezas
- **Proof of Concept** para integrações
- **Pair programming** para conhecimento compartilhado

---

## 🔄 Contract-First Development

### **Benefícios**

1. **Desenvolvimento Paralelo:** Frontend e Backend trabalham simultaneamente
2. **Mocks Automáticos:** Frontend desenvolve contra mocks
3. **Validação Antecipada:** Erros de contrato detectados cedo
4. **Documentação Viva:** OpenAPI como fonte da verdade

### **Fluxo**

```
1. Definir Contrato (OpenAPI)
   ↓
2. Gerar Types (TypeScript, DTOs)
   ↓
3. Criar Mocks (MSW, WireMock)
   ↓
4. Frontend desenvolve contra mocks
   ↓
5. Backend implementa contrato
   ↓
6. Testes de contrato validam
   ↓
7. Integração FE ↔ BE
```

### **Ferramentas**

- **OpenAPI Generator:** Gera clients e types
- **MSW (Mock Service Worker):** Mocks para frontend
- **Pact:** Contract testing
- **Swagger UI:** Documentação interativa

---

## 📊 Métricas e KPIs

### **Velocity**

**Definição:** Pontos completados por sprint

**Cálculo:**
```
Velocity = Σ(Story Points Completed) / Number of Sprints
```

**Uso:** Previsão de entregas futuras

### **Burndown Chart**

**Eixos:**
- X: Dias do sprint
- Y: Trabalho restante (pontos ou horas)

**Ideal:** Linha reta descendente

### **Cycle Time**

**Definição:** Tempo médio de "In Progress" até "Done"

**Meta:** Reduzir ao longo do tempo

### **Throughput**

**Definição:** Histórias completadas por semana

**Meta:** Aumentar ou estabilizar

---

**Total de Seções:** 8  
**Metodologias Cobertas:** Scrum, Kanban, SAFe  
**Técnicas:** RICE, MoSCoW, Story Points, Planning Poker  
**Ferramentas:** OpenAPI, MSW, Pact
