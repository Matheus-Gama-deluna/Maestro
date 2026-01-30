# 📚 Relação Especialistas × Guias Maestro

**Versão:** 2.0  
**Data:** 2026-01-30  
**Objetivo:** Mapear cada especialista documentado no catálogo do Maestro ao(s) guia(s) prático(s) que complementam seu trabalho, indicando cobertura e lacunas.

---

## 🔎 Como interpretar
- **Guia Principal:** guia mais relevante ou obrigatório para o especialista.
- **Guias Complementares:** guias opcionais que ajudam o especialista em cenários específicos.
- **Status:** indica se já existe guia adequado para o especialista ou se há lacuna a ser preenchida.
- **Prioridade:** ⭐⭐⭐⭐⭐ (Crítica) a ⭐ (Baixa)

---

## 🧭 Matriz Completa - 25 Especialistas

### **FASE 1: Especialistas Críticos (8 especialistas)**

| # | Especialista | Guia Principal | Guias Complementares | Prioridade | Status |
|---|--------------|----------------|----------------------|------------|--------|
| 1 | **Gestão de Produto** | `Guia de Adição de Novas Funcionalidades` (9KB) | `Checklist Mestre de Entrega` | ⭐⭐⭐ | ✅ Coberto |
| 2 | **Engenharia de Requisitos** | `Checklist Mestre de Entrega` (2KB) | `Gates de Qualidade` (7KB) | ⭐⭐⭐ | ✅ Coberto |
| 3 | **UX Design** | *(sem guia dedicado)* | `Checklist Mestre de Entrega`, `Gates de Qualidade` | ⭐⭐⭐⭐ | ⚠️ **LACUNA** |
| 4 | **Modelagem de Domínio** | `Guia de Modelagem de Domínio` (29KB) ⭐⭐ | `Gates de Qualidade` | ⭐⭐⭐⭐⭐ | ✅ 🔗 **INTEGRADO** |
| 5 | **Banco de Dados** | `Guia de Migrations Zero-Downtime` (8KB) | `Guia de Estratégias de Cache` (8KB) | ⭐⭐⭐⭐ | ✅ Coberto |
| 6 | **Arquitetura de Software** | `Guia de Multi-tenancy` (10KB) | `Catálogo de Stacks (Cloud vs Compartilhada)`, `Gates de Qualidade` | ⭐⭐⭐⭐ | ✅ Coberto |
| 7 | **Segurança da Informação** | `Gates de Qualidade` (7KB) | `Checklist Mestre de Entrega` | ⭐⭐⭐⭐⭐ | ✅ Coberto |
| 8 | **Desenvolvimento Frontend** | `Guia de Componentes Frontend` (33KB) ⭐⭐⭐ | `Guia de Debugging com IA` (3KB), `Checklist Mestre de Entrega` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |

---

### **FASE 2: Especialistas Principais (9 especialistas)**

| # | Especialista | Guia Principal | Guias Complementares | Prioridade | Status |
|---|--------------|----------------|----------------------|------------|--------|
| 9 | **Análise de Testes** | `Guia de Chaos Engineering` (7KB) | `Checklist Mestre de Entrega`, `Gates de Qualidade` | ⭐⭐⭐⭐⭐ | ✅ Coberto |
| 10 | **Plano de Execução** | `Checklist Mestre de Entrega` (2KB) | `Gates de Qualidade`, `Guia de Adição de Novas Funcionalidades` | ⭐⭐⭐ | ✅ Coberto |
| 11 | **Contrato de API** | `Guia de Design de API` (30KB) ⭐⭐⭐ | `Gates de Qualidade` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 12 | **Desenvolvimento Backend** | `Guia de Debugging com IA` (3KB) | `Guia de Refatoração de Código Legado` (3KB), `Guia de Estratégias de Cache`, `Checklist Mestre de Entrega` | ⭐⭐⭐ | ✅ Coberto |
| 13 | **DevOps e Infraestrutura** | `Guia de Otimização de Custos Cloud` (5KB) | `Guia de Chaos Engineering`, `Guia de SLOs e Error Budgets` (8KB), `Workflows Avançados`, `Multi-IDE Support` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 14 | **Dados e Analytics** | `Guia de Analytics com IA` (21KB) ⭐⭐ | `Guia de Estratégias de Cache`, `Métricas de Eficiência com IA` (2KB) | ⭐⭐⭐⭐ | ✅ **IMPORTANTE** |
| 15 | **Documentação Técnica** | `Checklist Mestre de Entrega` (2KB) | `Guia de Validação` (1KB) | ⭐⭐⭐ | ✅ Coberto |
| 16 | **Acessibilidade** | `Guia de Acessibilidade Digital` (16KB) ⭐ | `Gates de Qualidade`, `Checklist Mestre de Entrega` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 17 | **Debugging e Troubleshooting** | `Guia de Debugging com IA` (3KB) | `Guia de Refatoração de Código Legado`, `Guia de Validação` | ⭐⭐⭐⭐ | ✅ 🔗 **INTEGRADO** |

---

### **FASE 3: Especialistas Complementares (5 especialistas)**

| # | Especialista | Guia Principal | Guias Complementares | Prioridade | Status |
|---|--------------|----------------|----------------------|------------|--------|
| 18 | **Prototipagem com Stitch** | `Guia de Prototipagem com IA` (23KB) ⭐⭐⭐ | `Guia de Adição de Novas Funcionalidades` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 19 | **Desenvolvimento Mobile** | `Guia de Desenvolvimento Mobile` (21KB) ⭐⭐ | `Guia de Adição de Novas Funcionalidades`, `Checklist Mestre de Entrega` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 20 | **Exploração de Codebase** | `Guia de Refatoração de Código Legado` (3KB) | `Guia de Debugging com IA`, `Guia de Validação` | ⭐⭐⭐⭐ | ✅ Coberto |
| 21 | **Migração e Modernização** | `Guia de Refatoração de Código Legado` (3KB) | `Guia de Migrations Zero-Downtime` (8KB), `Guia de Otimização de Custos Cloud` (5KB) | ⭐⭐⭐⭐ | ✅ Coberto |
| 22 | **Mobile Design Avançado** | `Guia de Arquitetura Mobile` (27KB) ⭐⭐⭐ | `Guia de Adição de Novas Funcionalidades`, `Catálogo de Stacks` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |

---

### **FASE 4: Especialistas Avançados (3 especialistas)**

| # | Especialista | Guia Principal | Guias Complementares | Prioridade | Status |
|---|--------------|----------------|----------------------|------------|--------|
| 23 | **Arquitetura Avançada** | `Guia de Multi-tenancy` (10KB) | `Catálogo de Stacks`, `Guia de Estratégias de Cache` (8KB) | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 24 | **Performance e Escalabilidade** | `Guia de Estratégias de Cache` (8KB) | `Guia de SLOs e Error Budgets` (8KB), `Guia de Otimização de Custos Cloud` (5KB) | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 25 | **Observabilidade** | `Guia de SLOs e Error Budgets` (8KB) | `Guia de Chaos Engineering` (7KB), `Métricas de Eficiência com IA` (2KB) | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |

---

## 📊 Estatísticas de Cobertura

### Por Prioridade
- **⭐⭐⭐⭐⭐ Crítica:** 13 especialistas (52%)
- **⭐⭐⭐⭐ Importante:** 6 especialistas (24%)
- **⭐⭐⭐ Média:** 6 especialistas (24%)

### Por Status
- **✅ Coberto:** 24 especialistas (96%)
- **⚠️ Lacuna:** 1 especialista (4%) - UX Design

### Guias Mais Utilizados
1. **Checklist Mestre de Entrega** - 9 especialistas
2. **Gates de Qualidade** - 8 especialistas
3. **Guia de Debugging com IA** - 4 especialistas
4. **Guia de Estratégias de Cache** - 4 especialistas
5. **Guia de Adição de Novas Funcionalidades** - 4 especialistas

### Guias Críticos (>20KB)
1. **Guia de Componentes Frontend** - 33KB ⭐⭐⭐
2. **Guia de Design de API** - 30KB ⭐⭐⭐
3. **Guia de Modelagem de Domínio** - 29KB ⭐⭐
4. **Guia de Arquitetura Mobile** - 27KB ⭐⭐⭐
5. **Guia de Prototipagem com IA** - 23KB ⭐⭐⭐
6. **Guia de Analytics com IA** - 21KB ⭐⭐
7. **Guia de Desenvolvimento Mobile** - 21KB ⭐⭐

**Total:** 7 guias, ~184KB de conteúdo crítico

---

## 📌 Notas Importantes

### Lacunas Identificadas
1. **UX Design:** Ainda carece de guia dedicado; depende de checklists genéricas.
   - **Recomendação:** Criar "Guia de Design System" ou "Guia de UX/UI Patterns"
   - **Prioridade:** ⭐⭐⭐⭐ ALTA

### Guias Recentemente Criados
- `Guia de Prototipagem com IA` (23KB) - Prototipagem Rápida
- `Guia de Modelagem de Domínio` (29KB) - Modelo de Domínio
- `Guia de Design de API` (30KB) - Contrato de API
- `Guia de Componentes Frontend` (33KB) - Desenvolvimento Frontend
- `Guia de Analytics com IA` (21KB) - Dados e Analytics
- `Guia de Acessibilidade Digital` (16KB) - Acessibilidade
- `Guia de Desenvolvimento Mobile` (21KB) - Desenvolvimento Mobile
- `Guia de Arquitetura Mobile` (27KB) - Mobile Design Avançado

### Integração com Resources
Todos os guias devem ser integrados nos diretórios `resources/reference/` dos especialistas correspondentes para facilitar acesso e uso.

---

## ✅ Próximos Passos Sugeridos

### Prioridade CRÍTICA
1. **Criar Guia de Design System** para UX Design (única lacuna restante)
2. **Integrar guias nos resources/** dos especialistas
3. **Validar conteúdo** dos guias críticos (>20KB)

### Prioridade ALTA
4. **Publicar exemplos práticos** para todos os guias criados
5. **Criar scripts de validação** automática para verificar aplicação dos guias
6. **Integrar guias com prompts** existentes para maior sinergia

### Prioridade MÉDIA
7. **Treinar equipe** no uso dos novos guias dedicados
8. **Monitorar adoção** e coletar feedback para melhorias contínuas
9. **Manter documentação atualizada** com as evoluções do ecossistema Maestro

---

## 🎯 Plano de Integração

### Fase 1: Integração Imediata (17 especialistas implementados)
Copiar guias relevantes para `resources/reference/` de cada especialista:
- Gestão de Produto
- Engenharia de Requisitos
- UX Design
- Modelagem de Domínio ⭐
- Banco de Dados
- Arquitetura de Software
- Segurança da Informação
- Desenvolvimento Frontend ⭐
- Análise de Testes
- Plano de Execução
- Contrato de API ⭐
- Desenvolvimento Backend
- DevOps e Infraestrutura ⭐
- Dados e Analytics ⭐
- Documentação Técnica
- Acessibilidade ⭐
- Debugging e Troubleshooting

### Fase 2: Uso como Base (8 especialistas a implementar)
Usar guias como referência para criar SKILL.md e resources:
- Prototipagem com Stitch ⭐
- Desenvolvimento Mobile ⭐
- Exploração de Codebase
- Migração e Modernização
- Mobile Design Avançado ⭐
- Arquitetura Avançada ⭐
- Performance e Escalabilidade ⭐
- Observabilidade ⭐

---

## 📊 Progresso de Integração

### ✅ Especialistas Integrados (2/25 - 8%)

#### 1. Debugging e Troubleshooting ✅ 🔗
**Status:** INTEGRADO  
**Data:** 2026-01-30  
**Arquivos Integrados:**
- `resources/prompts/analise-bugs.md` (14KB) - Metodologia completa de debugging
- `resources/reference/debugging-ai-guide.md` - Guia de debugging com IA
- SKILL.md atualizado com seções de Prompts e Guias
- README.md atualizado com nova estrutura

**Conteúdo:**
- Metodologia: 5 Whys, Fishbone Diagram, RCA
- Template de análise detalhado com 8 seções
- Exemplos práticos de bugs (validação, performance, N+1)
- Checklist pós-geração com 15+ critérios

#### 2. Modelagem de Domínio ✅ 🔗
**Status:** INTEGRADO  
**Data:** 2026-01-30  
**Arquivos Integrados:**
- `resources/reference/domain-modeling-complete-guide.md` (29KB) - Guia completo de DDD
- `resources/prompts/modelo-dominio.md` - Template de modelagem
- `resources/prompts/ddd-bounded-contexts.md` - Bounded Contexts
- `resources/prompts/ddd-cqrs.md` - CQRS e Event Sourcing
- SKILL.md atualizado com seções detalhadas

**Conteúdo:**
- Metodologia DDD completa (Entities, Value Objects, Aggregates)
- Event Storming e Domain Storytelling
- Templates de Entity, Value Object e Aggregate Root
- Exemplos práticos de E-commerce (Cliente, Pedido, Produto)
- Bounded Contexts e Linguagem Ubíqua
- Domain Events e Event Sourcing

### 🔄 Próximos Especialistas (Fase 1 - Críticos)

1. **Desenvolvimento Frontend** (33KB) - Guia de Componentes + Atomic Design
2. **Contrato de API** (30KB) - Design de API REST + 3 prompts
3. **Segurança da Informação** (5 prompts) - OWASP, Threat Modeling, LGPD
4. **Análise de Testes** (5 prompts) - Unitário, E2E, Performance
5. **DevOps e Infraestrutura** (4 guias + 5 prompts) - CI/CD, Docker, K8s
6. **Acessibilidade** (16KB) - WCAG 2.1 AA + Checklist

**Estimativa:** 6 especialistas restantes × 30 min = 3 horas

---

**Versão:** 2.0  
**Última Atualização:** 2026-01-30  
**Cobertura:** 96% (24/25 especialistas)  
**Guias Totais:** 23 guias (~270KB)  
**Integração:** 8% (2/25 especialistas) - Debugging, Modelagem de Domínio  
**Próxima Revisão:** Após integração dos 6 especialistas críticos restantes
