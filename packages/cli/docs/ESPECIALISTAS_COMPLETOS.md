# 📋 Catálogo Completo de Especialistas Maestro

**Versão:** 1.1  
**Data:** 2026-01-28  
**Total:** 25 Especialistas (com skills dedicadas)  
**Status:** Documentação Completa + Skills Criadas

---

## 🎯 **Visão Geral**

Este catálogo lista todos os **especialistas de IA** disponíveis no sistema Maestro, organizados por fase de desenvolvimento e nível de complexidade. Cada especialista é uma persona especializada com perfil, missão, inputs/outputs definidos e checklist de validação. **Agora cada especialista possui sua própria skill (skill.specialist-*) para Progressive Disclosure e uso direto via IDE.**

---

## 📊 **Resumo Estatístico**

| Categoria | Quantidade | Fases |
|-----------|------------|-------|
| **Especialistas Base** | 20 | Fases 1-17 |
| **Especialistas Avançados** | 5 | Projetos Complexos |
| **Total de Especialistas** | **25** | **Cobertura completa** |

---

## 🔄 **Fluxo de Especialistas (Por Fase)**

```
Fase 1: Produto
└── Gestão de Produto

Fase 2: Requisitos  
└── Engenharia de Requisitos

Fase 3: UX Design
├── UX Design
└── [Opcional] Prototipagem com Stitch

Fase 4: Modelo de Domínio
└── Modelagem e Arquitetura de Domínio

Fase 5: Banco de Dados
└── Banco de Dados

Fase 6: Arquitetura
├── Arquitetura de Software
└── [Avançado] Arquitetura Avançada

Fase 7: Segurança
├── Segurança da Informação
└── [Avançado] Performance e Escalabilidade

Fase 8: Testes
└── Análise de Testes

Fase 9: Plano de Execução
├── Plano de Execução
└── Contrato de API

Fase 10: Desenvolvimento Frontend
└── Desenvolvimento Frontend

Fase 11: Desenvolvimento Backend
└── Desenvolvimento e Vibe Coding Estruturado

Fase 12: DevOps
├── DevOps e Infraestrutura
└── [Avançado] Observabilidade

Fase 13: Dados
└── Dados e Analytics com IA

Fase 14: Documentação
├── Documentação Técnica
└── Acessibilidade

Fase 15: Debugging
└── Debugging e Troubleshooting

Fase 16: Modernização
└── Migração e Modernização

Fase 17: Exploração
└── Exploração de Codebase
```

---

## 👥 **Especialistas Base (20)**

### **🎯 Fase 1: Produto**

#### **1. Gestão de Produto**
- **Skill:** `skill.specialist-gestao-produto` — `content/skills/specialist-gestao-produto/`
- **Arquivo:** `Especialista em Gestão de Produto.md`
- **Perfil:** Gerente de Produto Sênior (15+ anos)
- **Experiência:** 10+ produtos lançados, 3 produtos escalados
- **Missão:** Criar PRD executável em 60-90 minutos
- **Habilidades:** Discovery, Priorização (RICE), Métricas (North Star, OKRs), GTM
- **Inputs:** Ideia/Notas, Contexto de negócio
- **Outputs:** PRD (`docs/01-produto/PRD.md`)
- **Gate:** Problema definido, 2+ personas, MVP priorizado, North Star definida

---

### **📋 Fase 2: Requisitos**

#### **2. Engenharia de Requisitos com IA**
- **Skill:** `skill.specialist-engenharia-requisitos-ia` — `content/skills/specialist-engenharia-requisitos-ia/`
- **Arquivo:** `Especialista em Engenharia de Requisitos com IA.md`
- **Perfil:** Engenheiro de Requisitos Sênior
- **Missão:** Transformar visão em requisitos claros e testáveis
- **Habilidades:** RFs, RNFs, Critérios de Aceite, Matriz de Rastreabilidade
- **Inputs:** PRD, Contexto do negócio
- **Outputs:** Requisitos (`docs/02-requisitos/requisitos.md`)
- **Gate:** IDs únicos, Critérios testáveis, RNFs, Matriz RF × Telas

---

### **🎨 Fase 3: UX Design**

#### **3. UX Design**
- **Skill:** `skill.specialist-ux-design` — `content/skills/specialist-ux-design/`
- **Arquivo:** `Especialista em UX Design.md`
- **Perfil:** Designer UX/UI Sênior (12+ anos)
- **Experiência:** Produtos com milhões de usuários
- **Missão:** Criar Design Document completo em 2-3 semanas
- **Habilidades:** Pesquisa, Arquitetura de informação, Design Systems, WCAG
- **Inputs:** PRD, Requisitos
- **Outputs:** Design Doc (`docs/03-ux/design-doc.md`), Wireframes, Fluxos
- **Gate:** Jornadas mapeadas, Wireframes, Acessibilidade, Design Commitment

#### **4. Prototipagem Rápida com Google Stitch** ⭐ *NOVO*
- **Skill:** `skill.specialist-prototipagem-stitch` — `content/skills/specialist-prototipagem-stitch/`
- **Arquivo:** `Especialista em Prototipagem Rápida com Google Stitch.md`
- **Perfil:** Prototipador especialista em IA
- **Missão:** Criar UI funcional rapidamente com IA
- **Habilidades:** Google Stitch, Prototipagem rápida, Iteração
- **Inputs:** Design Doc, Requisitos
- **Outputs:** Protótipo funcional, Componentes
- **Gate:** Protótipo testável, Feedback coletado

---

### **🏗️ Fase 4: Modelo de Domínio**

#### **5. Modelagem e Arquitetura de Domínio com IA**
- **Skill:** `skill.specialist-modelagem-dominio` — `content/skills/specialist-modelagem-dominio/`
- **Arquivo:** `Especialista em Modelagem e Arquitetura de Domínio com IA.md`
- **Perfil:** Arquiteto de Domínio Sênior
- **Missão:** Modelar entidades e regras de negócio
- **Habilidades:** DDD, Entidades, Relacionamentos, Bounded Contexts
- **Inputs:** Requisitos, Design Doc
- **Outputs:** Modelo de Domínio (`docs/04-modelo/modelo-dominio.md`)
- **Gate:** Entidades definidas, Relacionamentos, Regras de negócio

---

### **🗄️ Fase 5: Banco de Dados**

#### **6. Banco de Dados** ⭐ *NOVO*
- **Skill:** `skill.specialist-banco-dados` — `content/skills/specialist-banco-dados/`
- **Arquivo:** `Especialista em Banco de Dados.md`
- **Perfil:** DBA Sênior
- **Missão:** Definir schema, índices e migrações
- **Habilidades:** Schema design, Indexação, Performance, Migrations
- **Inputs:** Modelo de Domínio, Requisitos
- **Outputs:** Design de Banco (`docs/05-banco/design-banco.md`)
- **Gate:** Schema normalizado, Índices definidos, Performance considerada

---

### **⚙️ Fase 6: Arquitetura**

#### **7. Arquitetura de Software**
- **Skill:** `skill.specialist-arquitetura-software` — `content/skills/specialist-arquitetura-software/`
- **Arquivo:** `Especialista em Arquitetura de Software.md`
- **Perfil:** Arquiteto de Software Sênior (15+ anos)
- **Experiência:** Sistemas escaláveis, grandes portas
- **Missão:** Criar Technical Specification completo
- **Stack Padrão:** React + Next.js + TypeScript + Tailwind + Node.js + Prisma + PostgreSQL
- **Habilidades:** C4, Stack selection, Padrões, Security-first
- **Inputs:** PRD, Requisitos, Modelo, Design, Banco
- **Outputs:** Arquitetura (`docs/06-arquitetura/arquitetura.md`), ADRs
- **Gate:** Diagrama C4, Stack justificada, ADRs, Autenticação definida

---

### **🔒 Fase 7: Segurança**

#### **8. Segurança da Informação**
- **Skill:** `skill.specialist-seguranca-informacao` — `content/skills/specialist-seguranca-informacao/`
- **Arquivo:** `Especialista em Segurança da Informação.md`
- **Perfil:** Especialista em Segurança (10+ anos)
- **Certificações:** CISSP, CEH, OSCP
- **Missão:** Garantir segurança em todo o ciclo de vida
- **Habilidades:** OWASP Top 10, Criptografia, LGPD, Response a Incidentes
- **Inputs:** Arquitetura, Requisitos
- **Outputs:** Checklist de Segurança (`docs/06-seguranca/checklist-seguranca.md`)
- **Gate:** OWASP revisado, Autenticação definida, Dados sensíveis mapeados

---

### **🧪 Fase 8: Testes**

#### **9. Análise de Testes**
- **Skill:** `skill.specialist-analise-testes` — `content/skills/specialist-analise-testes/`
- **Arquivo:** `Especialista em Análise de Testes.md`
- **Perfil:** QA Engineer Sênior
- **Missão:** Definir estratégia de testes completa
- **Habilidades:** Test Planning, Casos de teste, Cobertura, Automação
- **Inputs:** Requisitos, Arquitetura
- **Outputs:** Plano de Testes (`docs/07-testes/plano-testes.md`)
- **Gate:** Casos de teste, Cobertura definida, Ferramentas selecionadas

---

### **📋 Fase 9: Plano de Execução**

#### **10. Plano de Execução com IA**
- **Skill:** `skill.specialist-plano-execucao-ia` — `content/skills/specialist-plano-execucao-ia/`
- **Arquivo:** `Especialista em Plano de Execução com IA.md`
- **Perfil:** Project Manager Técnico
- **Missão:** Criar backlog separado FE/BE
- **Habilidades:** Backlog, Épicos, Histórias, DoD, Roadmap
- **Inputs:** Todos os artefatos anteriores
- **Outputs:** Backlog (`docs/08-backlog/backlog.md`), Timeline
- **Gate:** Épicos definidos, Histórias priorizadas, DoD estabelecido

#### **11. Contrato de API** ⭐ *NOVO*
- **Skill:** `skill.specialist-contrato-api` — `content/skills/specialist-contrato-api/`
- **Arquivo:** `Especialista em Contrato de API.md`
- **Perfil:** API Architect
- **Missão:** Definir contrato de API (OpenAPI, mocks, types)
- **Habilidades:** OpenAPI, Mock Server, Type Generation
- **Inputs:** Requisitos, Arquitetura
- **Outputs:** Contrato API (`docs/09-api/contrato-api.md`), Types, Mocks
- **Gate:** OpenAPI definido, Types gerados, Mock server funcionando

---

### **💻 Fase 10: Desenvolvimento Frontend**

#### **12. Desenvolvimento Frontend** ⭐ *NOVO*
- **Skill:** `skill.specialist-desenvolvimento-frontend` — `content/skills/specialist-desenvolvimento-frontend/`
- **Arquivo:** `Especialista em Desenvolvimento Frontend.md`
- **Perfil:** Frontend Engineer Sênior
- **Missão:** Implementar componentes, hooks, pages
- **Habilidades:** React, TypeScript, Componentes, Hooks, Testing
- **Inputs:** Contrato API, Design Doc
- **Outputs:** Componentes, Pages, Hooks, Testes
- **Gate:** Componentes funcionais, Testes unitários, Integração com mock

---

### **⚙️ Fase 11: Desenvolvimento Backend**

#### **13. Desenvolvimento e Vibe Coding Estruturado**
- **Skill:** `skill.specialist-desenvolvimento-backend` — `content/skills/specialist-desenvolvimento-backend/`
- **Arquivo:** `Especialista em Desenvolvimento e Vibe Coding Estruturado.md`
- **Perfil:** Backend Engineer Sênior
- **Missão:** Implementar services, controllers, testes
- **Habilidades:** Node.js, Services, Controllers, Testing, Patterns
- **Inputs:** Contrato API, Arquitetura
- **Outputs:** Services, Controllers, Entities, Testes
- **Gate:** Services implementados, Testes unitários, Integração com frontend

---

### **🚀 Fase 12: DevOps**

#### **14. DevOps e Infraestrutura**
- **Skill:** `skill.specialist-devops-infra` — `content/skills/specialist-devops-infra/`
- **Arquivo:** `Especialista em DevOps e Infraestrutura.md`
- **Perfil:** DevOps Engineer Sênior
- **Missão:** CI/CD, Docker, IaC, Deploy
- **Habilidades:** CI/CD, Docker, Kubernetes, IaC, Monitoring
- **Inputs:** Arquitetura, Requisitos
- **Outputs:** Pipeline, Dockerfiles, IaC, Deploy config
- **Gate:** Pipeline funcionando, Docker images, Deploy automatizado

---

### **📊 Fase 13: Dados**

#### **15. Dados e Analytics com IA**
- **Skill:** `skill.specialist-dados-analytics-ia` — `content/skills/specialist-dados-analytics-ia/`
- **Arquivo:** `Especialista em Dados e Analytics com IA.md`
- **Perfil:** Data Engineer/Analytics
- **Missão:** ETL, dashboards, métricas
- **Habilidades:** ETL, Analytics, Dashboards, Metrics
- **Inputs:** Requisitos de negócio, Dados disponíveis
- **Outputs:** ETL pipelines, Dashboards, Métricas
- **Gate:** ETL funcionando, Dashboards visíveis, Métricas coletadas

---

### **📚 Fase 14: Documentação**

#### **16. Documentação Técnica**
- **Skill:** `skill.specialist-documentacao-tecnica` — `content/skills/specialist-documentacao-tecnica/`
- **Arquivo:** `Especialista em Documentação Técnica.md`
- **Perfil:** Technical Writer
- **Missão:** Documentação completa do sistema
- **Habilidades:** Technical Writing, API Docs, User Guides
- **Inputs:** Todos os artefatos técnicos
- **Outputs:** Documentação técnica, API docs, User guides
- **Gate:** Documentação completa, API docs atualizadas, Guia de usuário

#### **17. Acessibilidade**
- **Skill:** `skill.specialist-acessibilidade` — `content/skills/specialist-acessibilidade/`
- **Arquivo:** `Especialista em Acessibilidade.md`
- **Perfil:** Accessibility Specialist
- **Missão:** Garantir WCAG e inclusão
- **Habilidades:** WCAG, ARIA, Screen readers, Testing
- **Inputs:** Design Doc, Implementação
- **Outputs:** Relatório de acessibilidade, Ajustes
- **Gate:** WCAG AA compliance, Testes com screen readers

---

### **🐛 Fase 15: Debugging**

#### **18. Debugging e Troubleshooting**
- **Skill:** `skill.specialist-debugging-troubleshooting` — `content/skills/specialist-debugging-troubleshooting/`
- **Arquivo:** `Especialista em Debugging e Troubleshooting.md`
- **Perfil:** Senior Debug Specialist
- **Missão:** Análise e correção de bugs
- **Habilidades:** Debugging, Root cause analysis, Troubleshooting
- **Inputs:** Bug report, Logs, Código
- **Outputs:** Bug fixado, Root cause documentado
- **Gate:** Bug resolvido, Testes de regressão, Documentação

---

### **📱 Fase 16: Mobile**

#### **19. Desenvolvimento Mobile**
- **Skill:** `skill.specialist-desenvolvimento-mobile` — `content/skills/specialist-desenvolvimento-mobile/`
- **Arquivo:** `Especialista em Desenvolvimento Mobile.md`
- **Perfil:** Mobile Developer Sênior
- **Missão:** Desenvolvimento iOS/Android
- **Habilidades:** React Native, Flutter, iOS, Android
- **Inputs:** Requisitos mobile, Design mobile
- **Outputs:** App mobile, Testes, Deploy
- **Gate:** App funcionando, Testes passando, Store ready

---

### **🔍 Fase 17: Exploração**

#### **20. Exploração de Codebase**
- **Skill:** `skill.specialist-exploracao-codebase` — `content/skills/specialist-exploracao-codebase/`
- **Arquivo:** `Especialista em Exploração de Codebase.md`
- **Perfil:** Code Analyst
- **Missão:** Análise e compreensão de codebase existente
- **Habilidades:** Code analysis, Documentation, Refactoring
- **Inputs:** Codebase existente
- **Outputs:** Análise, Documentação, Recomendações
- **Gate:** Codebase mapeada, Documentação atualizada

---

## 🚀 **Especialistas Avançados (5)**

*Para projetos complexos que requerem estado da arte*

### **🏛️ Arquitetura Avançada**
- **Skill:** `skill.specialist-arquitetura-avancada` — `content/skills/specialist-arquitetura-avancada/`
- **Arquivo:** `Especialista em Arquitetura Avançada.md`
- **Perfil:** Solution Architect (Enterprise level)
- **Missão:** DDD, CQRS, Event Sourcing, Microserviços
- **Habilidades:** DDD, CQRS, Event Sourcing, Microserviços, Distributed Systems
- **Quando usar:** Sistemas complexos/distribuídos
- **Inputs:** Arquitetura base, Requisitos complexos
- **Outputs:** Arquitetura avançada, Patterns enterprise
- **Gate:** DDD implementado, Event Sourcing definido, Microserviços planejados

---

### **⚡ Performance e Escalabilidade**
- **Skill:** `skill.specialist-performance-escalabilidade` — `content/skills/specialist-performance-escalabilidade/`
- **Arquivo:** `Especialista em Performance e Escalabilidade.md`
- **Perfil:** Performance Engineer (12+ anos)
- **Experiência:** Sistemas com milhões de req/s
- **Missão:** Load testing, caching, otimização
- **Habilidades:** k6, Artillery, Redis, Query optimization, Auto-scaling
- **Quando usar:** Alta escala, Performance crítica
- **Inputs:** Requisitos NF, Arquitetura
- **Outputs:** Análise de performance, Load tests, Otimizações
- **Gate:** SLOs definidos, Load tests executados, Performance otimizada

---

### **📊 Observabilidade**
- **Skill:** `skill.specialist-observabilidade` — `content/skills/specialist-observabilidade/`
- **Arquivo:** `Especialista em Observabilidade.md`
- **Perfil:** Observability Engineer
- **Missão:** Logs, métricas, tracing, SLOs
- **Habilidades:** Prometheus, Grafana, ELK, OpenTelemetry, SLOs
- **Quando usar:** Produção enterprise, Monitoramento crítico
- **Inputs:** Sistema em produção, Requisitos de monitoring
- **Outputs:** Stack de observabilidade, SLOs, Dashboards
- **Gate:** Logs centralizados, Métricas visíveis, SLOs definidos

---

### **🔄 Migração e Modernização** ⭐ *NOVO*
- **Skill:** `skill.specialist-migracao-modernizacao` — `content/skills/specialist-migracao-modernizacao/`
- **Arquivo:** `Especialista em Migração e Modernização.md`
- **Perfil:** Modernization Specialist
- **Missão:** Strangler Fig, migração de dados, rollback
- **Habilidades:** Strangler Fig, Migration patterns, Legacy modernization
- **Quando usar:** Modernização de legados
- **Inputs:** Sistema legado, Target architecture
- **Outputs:** Plano de migração, Strangler Fig implementado
- **Gate:** Migração planejada, Rollback definido, Risks mitigados

---

### **📱 Mobile Design** (Avançado)
- **Skill:** `skill.specialist-mobile-design-avancado` — `content/skills/specialist-mobile-design-avancado/`
- **Arquivo:** `Especialista em Desenvolvimento Mobile.md`
- **Perfil:** Mobile Architect (Enterprise level)
- **Missão:** Arquitetura mobile escalável
- **Habilidades:** Mobile patterns, Performance, Security, Enterprise mobile
- **Quando usar:** Apps enterprise, Alta escala mobile
- **Inputs:** Requisitos mobile complexos
- **Outputs:** Arquitetura mobile enterprise
- **Gate:** Patterns implementados, Performance otimizada, Security garantida

---

## 🎯 **Como Usar os Especialistas**

### **1. Seleção por Fase**
```bash
# Ver fase atual
/maestro status

# Carregar especialista da fase
"Atue como [Nome do Especialista]"
```

### **2. Contexto Obrigatório**
Sempre forneça:
- Artefatos das fases anteriores
- CONTEXTO.md do projeto
- Requisitos específicos da fase

### **3. Fluxo de Entrega**
1. **Input:** Artefatos anteriores + contexto
2. **Processamento:** Especialista aplica seu conhecimento
3. **Output:** Novo artefato no caminho padrão
4. **Validação:** Checklist de gate (score >= 70)
5. **Avanço:** `proximo()` para próxima fase

### **4. Gatilhos de Avanço Automático**
O especialista reconhece:
- "próximo", "avançar", "continuar"
- "terminei", "pronto", "finalizado"
- "pode salvar", "está bom assim"

E chama `proximo()` automaticamente.

---

## 📋 **Checklist de Implementação**

### **Para cada especialista:**
- [ ] **Perfil claro** - Experiência, habilidades, missão
- [ ] **Inputs definidos** - O que precisa receber
- [ ] **Outputs específicos** - O que produz e onde salva
- [ ] **Gate checklist** - Critérios de qualidade
- [ ] **Context flow** - Especialista anterior/próximo
- [ ] **Prompts prontos** - Exemplos de uso
- [ ] **Instrução MCP** - Gatilhos para `proximo()`

### **Para o projeto:**
- [ ] **25 especialistas** implementados
- [ ] **Cobertura completa** das 17 fases
- [ ] **Especialistas avançados** para complexidade
- [ ] **Integração MCP** funcionando
- [ ] **Quality gates** validando
- [ ] **Documentação completa** e acessível

---

## 🔄 **Atualizações Recentes (v1.3)**

### **⭐ Novos Especialistas (5)**
1. **Banco de Dados** - Schema design especializado
2. **Contrato de API** - OpenAPI e frontend-first
3. **Desenvolvimento Frontend** - Componentes e hooks
4. **Migração e Modernização** - Legacy systems
5. **Prototipagem com Stitch** - UI rápida com IA

### **🔧 Melhorias**
- **Design Commitment** obrigatório no UX
- **Purple Ban** proibição de roxo
- **Safe Harbor** evitar clichês de design
- **Frontend-First** workflow implementado
- **Quality Gates** mais rigorosos

---

## 📈 **Métricas de Uso**

| Especialista | Frequência de Uso | Complexidade | Impacto |
|--------------|-------------------|--------------|---------|
| Gestão de Produto | 100% (início) | Média | Alto |
| Arquitetura de Software | 100% | Alta | Alto |
| Desenvolvimento Backend | 100% | Alta | Alto |
| Desenvolvimento Frontend | 80% | Média | Alto |
| Segurança | 100% | Alta | Crítico |
| Performance | 30% (projetos complexos) | Alta | Alto |
| Observabilidade | 20% (enterprise) | Alta | Médio |

---

## 🎯 **Próximos Passos**

### **Curto Prazo**
1. **Templates padronizados** para cada especialista
2. **Prompts otimizados** por tipo de projeto
3. **Integração com skills** técnicas complementares

### **Médio Prazo**
1. **Especialistas customizáveis** por indústria
2. **Multi-especialista** para fases complexas
3. **Learning system** baseado em projetos anteriores

### **Longo Prazo**
1. **AI training** fine-tuned para cada especialista
2. **Auto-seleção** baseada em complexidade do projeto
3. **Evolução contínua** baseada em feedback

---

## 📞 **Suporte e Contribuição**

### **Reportar Issues**
- Especialista faltando informações
- Gate checklist incompleto
- Context flow quebrado
- Problemas com integração MCP

### **Contribuir**
- Novos especialistas por indústria
- Melhorias nos existentes
- Templates e exemplos
- Cases de sucesso

### **Documentação**
- [Guia Base do Sistema](../GUIA_BASE_SISTEMA.md)
- [Implementação CLI](../IMPLEMENTACAO.md)
- [Skill Adapter](../SKILL_ADAPTER.md)
- [Relação Especialistas × Skills](ESPECIALISTAS_SKILLS.md)

---

## 🔄 **Integração com Skills**

Cada especialista agora possui sua própria skill dedicada:

- **ID:** `skill.specialist-<slug>` (ex: `skill.specialist-gestao-produto`)
- **Caminho:** `content/skills/specialist-<slug>/`
- **Uso:** Carregada automaticamente em workflows ou via referência direta na IDE
- **Progressive Disclosure:** Conteúdo carregado apenas quando necessário

Para ver a matriz completa de especialistas e suas skills técnicas complementares, consulte [ESPECIALISTAS_SKILLS.md](ESPECIALISTAS_SKILLS.md).

---

**Versão:** 1.1  
**Data:** 2026-01-28  
**Próxima Atualização:** 2026-02-28  
**Mantenedor:** Maestro CLI Team
