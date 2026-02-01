# Backlog - {{NOME_PROJETO}}

**Data:** {{DATA}}  
**Versão:** 1.0  
**Status:** 🔄 Em Planejamento

---

## 📊 Visão Geral do MVP

### **Objetivo**
{{DESCREVER_OBJETIVO_MVP}}

### **Stack Técnica**
- **Frontend:** {{STACK_FRONTEND}}
- **Backend:** {{STACK_BACKEND}}
- **Banco de Dados:** {{BANCO_DADOS}}
- **Infraestrutura:** {{INFRA}}

### **Time e Capacidade**
- **Desenvolvedores:** {{NUM_DEVS}}
- **Duração Sprint:** {{DURACAO_SPRINT}} semanas
- **Velocity Estimada:** {{VELOCITY}} pontos/sprint

---

## 🎯 Épicos

### **Épico 1: {{NOME_EPICO_1}}**
**Objetivo:** {{OBJETIVO_EPICO_1}}  
**Prioridade:** Alta  
**Features:** {{NUM_FEATURES}} features

- [ ] FEAT-001: {{FEATURE_1}}
- [ ] FEAT-002: {{FEATURE_2}}

### **Épico 2: {{NOME_EPICO_2}}**
**Objetivo:** {{OBJETIVO_EPICO_2}}  
**Prioridade:** Média  
**Features:** {{NUM_FEATURES}} features

---

## 📋 Features por Tipo

### **Contratos de API (CONT)**
| ID | Feature | Épico | Prioridade | Estimativa |
|----|---------|-------|------------|------------|
| CONT-001 | {{FEATURE_CONTRATO_1}} | Épico 1 | Alta | 3 dias |
| CONT-002 | {{FEATURE_CONTRATO_2}} | Épico 2 | Média | 2 dias |

### **Frontend (FE)**
| ID | Feature | Épico | Dependência | Estimativa |
|----|---------|-------|-------------|------------|
| FE-001 | {{FEATURE_FRONTEND_1}} | Épico 1 | CONT-001 | 5 dias |
| FE-002 | {{FEATURE_FRONTEND_2}} | Épico 2 | CONT-002 | 3 dias |

### **Backend (BE)**
| ID | Feature | Épico | Dependência | Estimativa |
|----|---------|-------|-------------|------------|
| BE-001 | {{FEATURE_BACKEND_1}} | Épico 1 | CONT-001 | 5 dias |
| BE-002 | {{FEATURE_BACKEND_2}} | Épico 2 | CONT-002 | 4 dias |

### **Integração (INT)**
| ID | Feature | Épico | Dependências | Estimativa |
|----|---------|-------|--------------|------------|
| INT-001 | {{FEATURE_INTEGRACAO_1}} | Épico 1 | FE-001, BE-001 | 2 dias |
| INT-002 | {{FEATURE_INTEGRACAO_2}} | Épico 2 | FE-002, BE-002 | 2 dias |

---

## 📅 Timeline e Sprints

### **Sprint 0 - Setup (Semana 0)**
- [ ] Repositório + CI/CD
- [ ] Estrutura de pastas
- [ ] Linting configurado

### **Sprint 1 - Contratos (Semanas 1-2)**
- [ ] CONT-001: {{FEATURE_CONTRATO_1}}
- [ ] CONT-002: {{FEATURE_CONTRATO_2}}
- [ ] Mocks configurados

### **Sprint 2-3 - Frontend (Semanas 3-6)**
- [ ] FE-001: {{FEATURE_FRONTEND_1}}
- [ ] FE-002: {{FEATURE_FRONTEND_2}}

### **Sprint 2-3 - Backend (Semanas 4-6)**
- [ ] BE-001: {{FEATURE_BACKEND_1}}
- [ ] BE-002: {{FEATURE_BACKEND_2}}

### **Sprint 4 - Integração (Semanas 7-8)**
- [ ] INT-001: {{FEATURE_INTEGRACAO_1}}
- [ ] INT-002: {{FEATURE_INTEGRACAO_2}}
- [ ] Testes E2E

---

## 🎯 Definition of Done

### **Para Contratos**
- [ ] OpenAPI completo e validado
- [ ] Types gerados
- [ ] Mocks funcionais
- [ ] Testes de contrato passando

### **Para Frontend**
- [ ] Componentes testáveis
- [ ] Integração com mocks
- [ ] Responsivo e acessível
- [ ] Performance aceitável

### **Para Backend**
- [ ] Endpoints implementados
- [ ] Testes unitários (>80% coverage)
- [ ] Documentação da API
- [ ] Segurança implementada

### **Para Integração**
- [ ] Frontend ↔ Backend conectado
- [ ] Testes E2E passando
- [ ] Deploy em staging
- [ ] Monitoramento configurado

---

## 📊 Métricas

- **Total de Features:** {{TOTAL_FEATURES}}
- **Total de Histórias:** {{TOTAL_HISTORIAS}}
- **Estimativa Total:** {{ESTIMATIVA_TOTAL}} dias
- **Com Buffer (20%):** {{ESTIMATIVA_COM_BUFFER}} dias
- **Data Prevista:** {{DATA_PREVISTA}}

---

## ⚠️ Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| {{RISCO_1}} | {{PROB_1}} | {{IMPACTO_1}} | {{MITIGACAO_1}} |
| {{RISCO_2}} | {{PROB_2}} | {{IMPACTO_2}} | {{MITIGACAO_2}} |

---

**Próxima Ação:** Iniciar Sprint 0 - Setup do Projeto
