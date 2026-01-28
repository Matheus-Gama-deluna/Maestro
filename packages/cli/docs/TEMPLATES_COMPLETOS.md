# 📋 Catálogo Completo de Templates Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Total:** 22 Templates  
**Status:** Documentação Completa

---

## 🎯 **Visão Geral**

Este catálogo documenta todos os **templates padronizados** disponíveis no sistema Maestro para criação de artefatos de desenvolvimento. Cada template é estruturado para garantir consistência, qualidade e completude em cada fase do projeto.

---

## 📊 **Resumo Estatístico**

| Categoria | Quantidade | Fases Cobertas |
|-----------|------------|----------------|
| **Templates Principais** | 15 | Fases 1-8 |
| **Templates de Apoio** | 7 | Contexto e Rastreabilidade |
| **Total de Templates** | **22** | **Cobertura completa** |

---

## 🔄 **Fluxo de Templates (Por Fase)**

```
Fase 1: Produto
└── PRD.md

Fase 2: Requisitos  
├── requisitos.md
└── criterios-aceite.md

Fase 3: UX Design
├── design-doc.md
└── mapa-navegacao.md

Fase 4: Modelo de Domínio
└── modelo-dominio.md

Fase 5: Banco de Dados
└── design-banco.md

Fase 6: Arquitetura
├── arquitetura.md
└── adr.md

Fase 7: Segurança
└── checklist-seguranca.md

Fase 8: Testes
└── plano-testes.md

Fase 9: Execução
├── backlog.md
├── historia-usuario.md
├── historia-frontend.md
└── historia-backend.md

Contexto (Todas as Fases)
├── contexto.md
├── matriz-rastreabilidade.md
├── feature.md
├── prototipo-stitch.md
└── slo-sli.md
```

---

## 📄 **Templates Principais (15)**

### **🎯 Fase 1: Produto**

#### **1. PRD (Product Requirements Document)**
- **Arquivo:** `PRD.md`
- **Finalidade:** Documentar visão, problema, solução e escopo do produto
- **Seções Principais:**
  - Sumário Executivo
  - Problema e Impacto
  - Solução Proposta
  - Personas (2+ detalhadas)
  - Escopo MVP (Must/Should/Nice/Won't)
  - Métricas de Sucesso (North Star + AARRR)
  - Concorrência e Diferencial
  - Riscos e Mitigações
  - Timeline Preliminar
- **Gate:** Problema definido, personas documentadas, MVP priorizado, North Star definida

---

### **📋 Fase 2: Requisitos**

#### **2. Requisitos Funcionais e Não-Funcionais**
- **Arquivo:** `requisitos.md`
- **Finalidade:** Transformar visão em requisitos claros e testáveis
- **Seções Principais:**
  - Requisitos Funcionais (RF001, RF002...)
  - Requisitos Não-Funcionais (RNF001, RNF002...)
  - Regras de Negócio
  - Integrações com sistemas externos
  - **Matriz Requisitos × Telas** (estimativa inicial)
  - Glossário de termos
- **Estrutura RF:** Tabela com Descrição, Prioridade, Persona, Critérios, Dependências
- **Estrutura RNF:** Tabela com Descrição, Métrica, Como medir

#### **3. Critérios de Aceite (Gherkin)**
- **Arquivo:** `criterios-aceite.md`
- **Finalidade:** Definir cenários de teste em formato Gherkin
- **Estrutura:**
  ```gherkin
  Dado que [contexto]
  Quando [ação]
  Então [resultado esperado]
  ```
- **Cobertura:** Happy path, casos de erro, edge cases

---

### **🎨 Fase 3: UX Design**

#### **4. Design Document**
- **Arquivo:** `design-doc.md`
- **Finalidade:** Documentar experiência do usuário e interface
- **Seções Principais:**
  - Visão Geral de UX e Princípios de Design
  - Personas e Jornadas (Mermaid)
  - Arquitetura de Informação (Mapa do Site)
  - **Mapa de Navegação** (diagrama + inventário de telas)
  - Fluxos de Usuário (Mermaid)
  - Wireframes (estrutura e estados)
  - Design System (cores, tipografia, componentes)
  - **Database Design System** (se usado)
  - Acessibilidade (WCAG AA)
  - Responsividade (breakpoints)
- **Design Commitment:** Seção obrigatória com estilo escolhido e elementos únicos

#### **5. Mapa de Navegação**
- **Arquivo:** `mapa-navegacao.md`
- **Finalidade:** Mapeamento detalhado de todas as telas e navegação
- **Conteúdo:**
  - Diagrama de navegação completo
  - Inventário de telas (ID, Nome, URL, Acesso, RFs)
  - Legenda de telas por tipo e área

---

### **🏗️ Fase 4: Modelo de Domínio**

#### **6. Modelo de Domínio**
- **Arquivo:** `modelo-dominio.md`
- **Finalidade:** Modelar entidades e regras de negócio
- **Seções:**
  - Visão geral do domínio
  - Entidades principais (atributos, relacionamentos)
  - Diagrama de entidades (Mermaid)
  - Regras de negócio por entidade
  - Invariantes e validações
  - Eventos de domínio (se DDD)

---

### **🗄️ Fase 5: Banco de Dados**

#### **7. Design de Banco**
- **Arquivo:** `design-banco.md`
- **Finalidade:** Definir schema, índices e estratégias de dados
- **Seções:**
  - Escolha do banco e justificativa
  - Schema completo (tabelas, colunas, tipos, constraints)
  - Índices (performance e consultas)
  - Relacionamentos (FKs, joins)
  - Estratégias de migração
  - Backup e recovery
  - Performance considerations

---

### **⚙️ Fase 6: Arquitetura**

#### **8. Arquitetura de Software (C4)**
- **Arquivo:** `arquitetura.md`
- **Finalidade:** Definir arquitetura técnica do sistema
- **Seções:**
  - **Diagrama C4 Nível 1:** Contexto (atores, sistemas externos)
  - **Diagrama C4 Nível 2:** Containers (web, api, db, cache)
  - **Diagrama C4 Nível 3:** Componentes (services, controllers)
  - Stack Tecnológica (backend, frontend, infra)
  - Padrões e convenções (estrutura de pastas, nomenclatura)
  - Segurança (autenticação, autorização, proteções)
  - Escalabilidade (pontos de escala, caching)
  - Observabilidade (logs, métricas, tracing, alertas)
  - Disaster Recovery (backup, RTO/RPO)

#### **9. Architecture Decision Record (ADR)**
- **Arquivo:** `adr.md`
- **Finalidade:** Documentar decisões arquiteturais importantes
- **Estrutura:**
  - Contexto (problema, requisitos, restrições)
  - Decisão (o que foi decidido e porquê)
  - Alternativas consideradas (prós/contras)
  - Consequências (positivas, negativas, riscos)
  - Métricas de sucesso
- **Formato:** ADR-001, ADR-002, etc.

---

### **🔒 Fase 7: Segurança**

#### **10. Checklist de Segurança**
- **Arquivo:** `checklist-seguranca.md`
- **Finalidade:** Validar segurança em todas as camadas
- **Seções:**
  - Autenticação (senhas, tokens, 2FA)
  - Autorização (RBAC/ABAC, princípio do menor privilégio)
  - Proteção de Dados (trânsito, repouso, sensíveis)
  - **OWASP Top 10** (checklist completo dos 10 itens)
  - Infraestrutura (firewall, secrets, containers)
  - API Security (rate limiting, CORS, validation)
  - Riscos de IA (prompt injection, data leakage)
  - Testes de segurança (SAST, DAST, dependency scanning)
  - Resposta a incidentes
- **Resumo de Status:** Tabela com percentual por categoria

---

### **🧪 Fase 8: Testes**

#### **11. Plano de Testes**
- **Arquivo:** `plano-testes.md`
- **Finalidade:** Estratégia completa de testes do sistema
- **Seções:**
  - Escopo (o que testar e o que não testar)
  - **Estratégia de Testes** (pirâmide: 70% unit, 20% integração, 10% E2E)
  - Casos de Teste (TC001, TC002...) com passos e dados
  - **Matriz de Rastreabilidade** (requisitos → testes)
  - Ambiente de testes (configuração, dados)
  - Critérios de aceite (entrada/saída)
  - Métricas de qualidade (cobertura, bugs escapados)
  - Cronograma de execução
  - Template de report de bugs

---

### **📋 Fase 9: Execução**

#### **12. Backlog de Histórias**
- **Arquivo:** `backlog.md`
- **Finalidade:** Organizar épicos e histórias para desenvolvimento
- **Seções:**
  - Épicos (ID, nome, descrição, prioridade, sprint)
  - Histórias de Usuário (US001, US002...) com:
    - Formato "Como/Quero/Para"
    - Critérios de aceite
    - Definição de Pronto (DoD)
    - Pontos e sprint
  - **Diagrama de Dependências** (Mermaid)
  - Sprint planning (objetivos, capacidade)
  - Bugs e débito técnico
  - Métricas de velocidade
  - DoD global

#### **13. História de Usuário**
- **Arquivo:** `historia-usuario.md`
- **Finalidade:** Template individual para cada história
- **Seções:**
  - Descrição (Como/Quero/Para)
  - Metadados (ID, épico, prioridade, pontos)
  - **Critérios de Aceite** (Gherkin)
  - Regras de negócio
  - Design/wireframes
  - **Impacto no Modelo** (entidades, endpoints)
  - Subtarefas (implementação, testes, deploy)
  - Definição de Pronto

#### **14. História Frontend**
- **Arquivo:** `historia-frontend.md`
- **Finalidade:** Específico para desenvolvimento frontend
- **Conteúdo:** Foco em componentes, hooks, pages, testes frontend

#### **15. História Backend**
- **Arquivo:** `historia-backend.md`
- **Finalidade:** Específico para desenvolvimento backend
- **Conteúdo:** Foco em services, controllers, entities, testes backend

---

## 📚 **Templates de Apoio (7)**

### **🔄 Contexto (Todas as Fases)**

#### **16. Contexto do Projeto**
- **Arquivo:** `contexto.md`
- **Finalidade:** Manter contexto entre sessões de IA
- **Seções:**
  - Metadados (nome, complexidade, fase atual)
  - Resumo executivo
  - Stack tecnológica
  - Modelo de domínio (resumo)
  - Decisões arquiteturais (resumo)
  - **Artefatos Existentes** (checklist por fase)
  - **Histórico de Fases** (status dos gates)
- **Uso:** Copiar para `docs/CONTEXTO.md` e atualizar após cada fase

#### **17. Matriz de Rastreabilidade**
- **Arquivo:** `matriz-rastreabilidade.md`
- **Finalidade:** Garantir cobertura completa requisitos → testes
- **Seções:**
  - **Matriz Principal:** RF → US → TC
  - Cobertura por requisito (funcionais e não-funcionais)
  - Matriz US → Código → Testes
  - Gaps identificados
  - Dependências entre requisitos
  - Histórico de mudanças
  - Checklist de rastreabilidade

---

### **🚀 Templates Especiais**

#### **18. Feature (Nova Funcionalidade)**
- **Arquivo:** `feature.md`
- **Finalidade:** Documentar novas features em projetos existentes
- **Conteúdo:** Análise de impacto, design, implementação, testes

#### **19. Protótipo Stitch**
- **Arquivo:** `prototipo-stitch.md`
- **Finalidade:** Documentar protótipos criados com Google Stitch
- **Conteúdo:** Configuração, componentes, testes, integração

#### **20. SLO/SLI**
- **Arquivo:** `slo-sli.md`
- **Finalidade:** Definir Service Level Objectives e Indicators
- **Conteúdo:** Métricas, targets, monitoramento, alertas

#### **21. Estado Template**
- **Arquivo:** `estado-template.json`
- **Finalidade:** Template JSON para estado do projeto Maestro
- **Conteúdo:** Estrutura base para `.maestro/estado.json`

#### **22. README de Templates**
- **Arquivo:** `README.md`
- **Finalidade:** Índice e instruções de uso dos templates
- **Conteúdo:** Organização por fase, como usar, links diretos

---

## 🎯 **Como Usar os Templates**

### **1. Fluxo Padrão**
```bash
# Para cada fase do projeto:
1. Copie template correspondente
2. Renomeie para seu projeto
3. Preencha as seções marcadas com [ ]
4. Use especialista IA para ajudar
5. Valide com checklist de gate
6. Avance para próxima fase
```

### **2. Integração com Especialistas**
```text
# Exemplo de prompt para IA:
"Atue como [Especialista].

Contexto do projeto:
[COLE CONTEÚDO DE docs/CONTEXTO.md]

Preciso preencher [TEMPLATE] com base nos artefatos anteriores."
```

### **3. Validação de Gates**
Cada template inclui checklist implícito:
- **Campos obrigatórios** marcados
- **Seções críticas** destacadas
- **Métricas de qualidade** definidas
- **Critérios de aceite** estabelecidos

---

## 📋 **Checklist de Implementação**

### **Para cada template:**
- [ ] **Estrutura completa** - Todas seções obrigatórias
- [ ] **Instruções claras** - O que preencher em cada campo
- [ ] **Exemplos práticos** - Como preencher seções complexas
- [ ] **Validação integrada** - Checklist de qualidade
- [ ] **Cross-reference** - Links para outros templates
- [ ] **Formato padrão** - Consistência visual e estrutural

### **Para o projeto:**
- [ ] **22 templates** implementados
- [ ] **Cobertura completa** das 17 fases
- [ ] **Integração total** com especialistas
- [ ] **Documentação acessível** e navegável
- [ ] **Exemplos reais** e casos de uso

---

## 🔧 **Características Técnicas**

### **Formato e Estrutura**
- **Markdown** para edição universal
- **Mermaid diagrams** para visualização
- **Tabelas estruturadas** para dados
- **Placeholders claros** com `[ ]`
- **Seções numeradas** para referência

### **Integrações**
- **Especialistas IA** - Cada template mapeado para especialista
- **Quality Gates** - Checklists integrados
- **Cross-reference** - Links entre templates
- **Context flow** - Entrada/saída definidos

### **Validação**
- **Campos obrigatórios** destacados
- **Métricas de qualidade** incluídas
- **Critérios de aceite** definidos
- **Resumo de status** automáticos

---

## 📈 **Métricas de Uso**

| Template | Frequência de Uso | Complexidade | Impacto |
|----------|-------------------|--------------|---------|
| PRD.md | 100% (início) | Média | Crítico |
| requisitos.md | 100% | Média | Crítico |
| arquitetura.md | 100% | Alta | Crítico |
| backlog.md | 100% | Média | Alto |
| contexto.md | 100% (todas fases) | Baixa | Alto |
| design-doc.md | 80% | Média | Alto |
| checklist-seguranca.md | 100% | Alta | Crítico |
| plano-testes.md | 90% | Média | Alto |

---

## 🎯 **Próximos Passos**

### **Curto Prazo**
1. **Exemplos preenchidos** para cada template
2. **Video tutoriais** de uso
3. **Integração IDE** com snippets

### **Médio Prazo**
1. **Templates customizáveis** por indústria
2. **Geração automática** baseada em contexto
3. **Validação automatizada** de preenchimento

### **Longo Prazo**
1. **AI-powered templates** que se adaptam ao projeto
2. **Real-time collaboration** em templates
3. **Analytics de uso** e otimização

---

## 📞 **Suporte e Contribuição**

### **Reportar Issues**
- Template faltando seções
- Instruções confusas
- Links quebrados
- Formatação inconsistente

### **Contribuir**
- Novos templates por indústria
- Melhorias nos existentes
- Exemplos e casos de uso
- Traduções e localizações

### **Documentação**
- [Guia Base do Sistema](../GUIA_BASE_SISTEMA.md)
- [Catálogo de Especialistas](../ESPECIALISTAS_COMPLETOS.md)
- [Implementação CLI](../IMPLEMENTACAO.md)

---

## 🔄 **Atualizações Recentes (v1.3)**

### **⭐ Novos Templates (3)**
1. **design-banco.md** - Design especializado de banco
2. **mapa-navegacao.md** - Mapeamento completo de telas
3. **prototipo-stitch.md** - Protótipos com Google Stitch

### **🔧 Melhorias**
- **Matriz Requisitos × Telas** em requisitos.md
- **Database Design System** integration em design-doc.md
- **Diagrama de Dependências** em backlog.md
- **Resumo de Status** em checklist-seguranca.md
- **Cross-reference** aprimorada entre templates

---

**Versão:** 1.0  
**Data:** 2026-01-28  
**Próxima Atualização:** 2026-02-28  
**Mantenedor:** Maestro CLI Team
