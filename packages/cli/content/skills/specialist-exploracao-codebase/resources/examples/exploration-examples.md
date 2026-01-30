# Exemplos Práticos - Exploração de Codebase

## 📋 Visão Geral

5 cenários completos de exploração de codebase com input/output reais.

---

## 🎯 Cenário 1: Monolito Node.js Legado

### Contexto
**Projeto:** Sistema de e-commerce legado  
**Stack:** Node.js + Express + MongoDB  
**Tamanho:** 50k LOC  
**Idade:** 3 anos  
**Tempo:** 90 minutos

### Processo

#### Fase 1: Scan (25 min)
- 15 módulos principais identificados
- Express + MongoDB + Redis detectados
- 200 arquivos em 8 diretórios
- Entry points: server.js, worker.js

#### Fase 2: Analyze (40 min)
- 45 code smells detectados
- Debt score: 62/100
- Complexidade média: 12 (alto)
- Duplicação: 8%
- Coverage: 30%

#### Fase 3: Document (25 min)
- Mapa visual gerado
- Plano de refatoração em 3 fases
- 12 recomendações priorizadas

### Output
**Score:** 78/100 ✅  
**Aprovado:** Sim  
**Próximo Passo:** Implementar fase 1 de refatoração

---

## 🏗️ Cenário 2: Microserviços Java/Spring

### Contexto
**Projeto:** Sistema bancário  
**Stack:** Java + Spring Boot + PostgreSQL  
**Tamanho:** 120k LOC (8 serviços)  
**Tempo:** 95 minutos

### Resultado
**Score:** 85/100 ✅  
**Debt:** 25 dias-homem  
**Recomendações:** 18 itens

---

## 📱 Cenário 3: Frontend SPA React

### Contexto
**Projeto:** Dashboard analytics  
**Stack:** React + TypeScript + Redux  
**Tamanho:** 30k LOC  
**Tempo:** 75 minutos

### Resultado
**Score:** 82/100 ✅  
**Debt:** 8 dias-homem  
**Recomendações:** 10 itens

---

## 📲 Cenário 4: Mobile App React Native

### Contexto
**Projeto:** App de delivery  
**Stack:** React Native + Firebase  
**Tamanho:** 40k LOC  
**Tempo:** 85 minutos

### Resultado
**Score:** 76/100 ✅  
**Debt:** 12 dias-homem  
**Recomendações:** 14 itens

---

## 🏛️ Cenário 5: Sistema Legacy PHP

### Contexto
**Projeto:** ERP corporativo  
**Stack:** PHP 5.6 + MySQL  
**Tamanho:** 200k LOC  
**Tempo:** 120 minutos

### Resultado
**Score:** 45/100 ❌  
**Debt:** 60 dias-homem  
**Recomendações:** Migração completa necessária

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026
