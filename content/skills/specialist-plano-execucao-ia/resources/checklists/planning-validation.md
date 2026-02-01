# Checklist de Validação - Plano de Execução

**Versão:** 2.0  
**Score Mínimo:** 75/100 pontos  
**Última Atualização:** 31/01/2026

---

## 📊 Estrutura do Backlog (25 pontos)

### **Épicos (10 pontos)**
- [ ] **[5 pts]** Épicos claramente definidos com objetivos
- [ ] **[3 pts]** Épicos priorizados (RICE, MoSCoW ou similar)
- [ ] **[2 pts]** Épicos mapeados para objetivos do PRD

### **Features (10 pontos)**
- [ ] **[4 pts]** Features mapeadas para épicos
- [ ] **[3 pts]** Features separadas por tipo (CONT, FE, BE, INT)
- [ ] **[3 pts]** Features com estimativas realistas

### **Dependências (5 pontos)**
- [ ] **[3 pts]** Dependências entre features identificadas
- [ ] **[2 pts]** Ordem de execução definida (Contract-First)

---

## ✅ Qualidade das Histórias (30 pontos)

### **Formato (10 pontos)**
- [ ] **[5 pts]** Formato "Como [persona], quero [ação], para [benefício]"
- [ ] **[3 pts]** Título descritivo e único (US-XXX)
- [ ] **[2 pts]** Tipo claramente identificado (US, FE, BE, INT)

### **Critérios de Aceite (10 pontos)**
- [ ] **[6 pts]** Critérios em Gherkin (Given/When/Then)
- [ ] **[4 pts]** Múltiplos cenários (sucesso + erro)

### **Estimativas (5 pontos)**
- [ ] **[3 pts]** Estimativas de esforço (Story Points ou dias)
- [ ] **[2 pts]** Estimativas consistentes com capacidade do time

### **Dependências Técnicas (5 pontos)**
- [ ] **[3 pts]** Dependências técnicas identificadas
- [ ] **[2 pts]** Bloqueadores documentados

---

## 🔗 Rastreabilidade (20 pontos)

### **Requisitos (8 pontos)**
- [ ] **[5 pts]** Histórias rastreadas para requisitos funcionais
- [ ] **[3 pts]** Cobertura de 100% dos RFs críticos

### **Design (7 pontos)**
- [ ] **[4 pts]** Histórias rastreadas para wireframes/mockups
- [ ] **[3 pts]** Componentes UI mapeados

### **Matriz de Rastreabilidade (5 pontos)**
- [ ] **[3 pts]** Matriz RF → História criada
- [ ] **[2 pts]** Matriz Design → História criada

---

## 📅 Planejamento (25 pontos)

### **Sprints (10 pontos)**
- [ ] **[4 pts]** Sprints definidos com duração
- [ ] **[3 pts]** Capacidade do time considerada
- [ ] **[3 pts]** Histórias distribuídas por sprint

### **Releases (7 pontos)**
- [ ] **[4 pts]** Releases planejados com marcos
- [ ] **[3 pts]** Roadmap visual criado

### **Riscos (5 pontos)**
- [ ] **[3 pts]** Riscos identificados e documentados
- [ ] **[2 pts]** Mitigações definidas

### **Buffer (3 pontos)**
- [ ] **[3 pts]** Buffer de 20% no timeline

---

## 🎯 Definition of Done (Bonus: +10 pontos)

### **Por Tipo de História**
- [ ] **[3 pts]** DoD para Contratos definido
- [ ] **[2 pts]** DoD para Frontend definido
- [ ] **[2 pts]** DoD para Backend definido
- [ ] **[2 pts]** DoD para Integração definido
- [ ] **[1 pt]** DoD inclui testes automatizados

---

## 📊 Cálculo de Score

**Fórmula:**
```
Score = (Estrutura + Qualidade + Rastreabilidade + Planejamento + Bonus)
Score Máximo = 110 pontos (100 + 10 bonus)
```

**Thresholds:**
- **Score >= 85:** ✅ Excelente - Aprovado automaticamente
- **Score 75-84:** ✅ Bom - Aprovado com recomendações
- **Score 70-74:** ⚠️ Aceitável - Requer aprovação manual
- **Score < 70:** ❌ Insuficiente - BLOQUEADO

---

## ⚠️ Critérios de Bloqueio Automático

Independente do score, o backlog é **BLOQUEADO** se:

1. **Histórias sem critérios de aceite** (>20% das histórias)
2. **Épicos sem features** (qualquer épico vazio)
3. **Timeline sem buffer** (0% de margem)
4. **Dependências circulares** (features dependem umas das outras em loop)
5. **Estimativas ausentes** (>30% das histórias sem estimativa)

---

## ✅ Checklist Rápida (Top 10)

Para validação rápida, verificar:

1. [ ] Épicos definidos e priorizados
2. [ ] Features separadas por tipo (CONT, FE, BE, INT)
3. [ ] Histórias no formato "Como... quero... para..."
4. [ ] Critérios de aceite em Gherkin
5. [ ] Estimativas de esforço presentes
6. [ ] Dependências técnicas mapeadas
7. [ ] Rastreabilidade para requisitos
8. [ ] Sprints definidos
9. [ ] Buffer de 20% no timeline
10. [ ] DoD definido por tipo

**Se todos os 10 itens estão OK:** Score mínimo de 75 garantido ✅

---

**Total de Pontos Possíveis:** 110  
**Score Mínimo para Aprovação:** 75  
**Itens de Bloqueio Automático:** 5
