# 📋 Catálogo Completo de Skills Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Total:** 40+ Skills  
**Status:** Documentação Completa

---

## 🎯 **Visão Geral**

Este catálogo documenta todas as **skills técnicas** disponíveis no sistema Maestro para especializar a IA em áreas específicas de desenvolvimento. Cada skill é um pacote de conhecimento especializado que só é carregado quando relevante, seguindo o princípio de Progressive Disclosure.

---

## 📊 **Resumo Estatístico**

| Categoria | Quantidade | Tipo | Aplicabilidade |
|-----------|------------|------|----------------|
| **Backend & APIs** | 8 | Técnica | Desenvolvimento |
| **Frontend & Design** | 6 | Técnica | UI/UX |
| **Arquitetura & Database** | 5 | Técnica | Design |
| **DevOps & Deploy** | 4 | Técnica | Produção |
| **Testing & Quality** | 4 | Técnica | Qualidade |
| **Security** | 3 | Técnica | Segurança |
| **Performance** | 3 | Técnica | Otimização |
| **Mobile & Cross-Platform** | 2 | Técnica | Mobile |
| **Content & Documentation** | 2 | Técnica | Docs |
| **AI & MCP** | 2 | Técnica | IA |
| **Total de Skills** | **40+** | **Técnicas** | **Cobertura completa** |

---

## 🔄 **Fluxo de Skills (Por Categoria)**

```
Backend & APIs
├── api-patterns (REST/GraphQL/tRPC)
├── nodejs-best-practices
├── python-patterns
├── database-design
└── mcp-builder

Frontend & Design
├── frontend-design (UI/UX completo)
├── react-patterns
├── tailwind-patterns
├── nextjs-best-practices
└── animation-guide

Arquitetura & Database
├── architecture (decisões e ADRs)
├── database-design (schema e otimização)
├── intelligent-routing
└── app-builder

DevOps & Deploy
├── deployment-procedures
├── server-management
├── powershell-windows
└── bash-linux

Testing & Quality
├── testing-patterns
├── tdd-workflow
├── code-review-checklist
└── lint-and-validate

Security
├── vulnerability-scanner
├── red-team-tactics
└── (integrado com outras skills)

Performance
├── performance-profiling
├── systematic-debugging
└── (integrado com outras skills)
```

---

## 📄 **Skills por Categoria**

### **🔧 Backend & APIs (8 skills)**

#### **1. API Patterns**
- **Diretório:** `api-patterns/`
- **Finalidade:** Princípios de design de API e tomada de decisão
- **Conteúdo Principal:**
  - REST vs GraphQL vs tRPC (árvore de decisão)
  - Resource naming, HTTP methods, status codes
  - Response formats, envelope pattern
  - Versioning strategies (URI/Header/Query)
  - Authentication patterns (JWT, OAuth, Passkey)
  - Rate limiting (token bucket, sliding window)
  - OpenAPI/Swagger documentation
  - Security testing (OWASP API Top 10)
- **Scripts:** `scripts/api_validator.py`
- **Decision Checklist:** Validação antes de design de API
- **Anti-Patterns:** Evitar defaults, consistência, segurança

#### **2. Node.js Best Practices**
- **Diretório:** `nodejs-best-practices/`
- **Finalidade:** Padrões e melhores práticas Node.js
- **Conteúdo:** Event loop, streams, middleware, patterns

#### **3. Python Patterns**
- **Diretório:** `python-patterns/`
- **Finalidade:** Padrões Python e melhores práticas
- **Conteúdo:** OOP, async/await, decorators, typing

#### **4. Database Design**
- **Diretório:** `database-design/`
- **Finalidade:** Princípios de design de banco de dados
- **Conteúdo Principal:**
  - Seleção de banco (PostgreSQL vs Neon vs Turso vs SQLite)
  - Seleção de ORM (Drizzle vs Prisma vs Kysely)
  - Schema design, normalização, PKs, relacionamentos
  - Estratégia de indexação, índices compostos
  - Otimização (N+1, EXPLAIN ANALYZE)
  - Migrations seguras, serverless databases
- **Decision Checklist:** Validação antes de schema design
- **Anti-Patterns:** Evitar defaults PostgreSQL, SELECT *, N+1

#### **5. MCP Builder**
- **Diretório:** `mcp-builder/`
- **Finalidade:** Princípios de construção de servidores MCP
- **Conteúdo Principal:**
  - Visão geral do MCP (Model Context Protocol)
  - Arquitetura de servidor (tools, resources, prompts)
  - Design de tools (nomes claros, propósito única)
  - Resource patterns (static, dynamic, template)
  - URI patterns, multimodal handling
  - Error handling, validação de input
  - Configuração (Claude Desktop)
  - Testes (unit, integration, contract)
  - Princípios de segurança
- **Best Practices Checklist:** Nomes claros, schemas completos, structured output

---

### **🎨 Frontend & Design (6 skills)**

#### **6. Frontend Design**
- **Diretório:** `frontend-design/`
- **Finalidade:** Design thinking e decisão para web UI
- **Conteúdo Principal:** 
  - **Filosofia:** Cada pixel tem propósito, restrição é luxo
  - **Princípio Core:** THINK, don't memorize. ASK, don't assume
  - **Regra Obrigatória:** Sempre ler `ux-psychology.md` primeiro
  - **Análise de Constraints:** Timeline, conteúdo, brand, tech, audience
  - **Princípios UX:** Leis de Hick, Fitts, Miller, Von Restorff
  - **Layout:** Golden Ratio, 8-point grid, key sizing
  - **Cor:** 60-30-10 rule, psicologia de cores
  - **Tipografia:** Scale selection, pairing, legibilidade
  - **Efeitos Visuais:** Glassmorphism, shadows, gradients
  - **Animação:** Timing, easing, performance
  - **Anti-Patterns AI:** Evitar clichês modernos (Bento Grid, Mesh Gradients)
  - **Scripts:** `scripts/ux_audit.py`, `scripts/accessibility_checker.py`
- **Critical:** ASK antes de assumir, evitar Safe Harbor moderno

#### **7. React Patterns**
- **Diretório:** `react-patterns/`
- **Finalidade:** Padrões React e melhores práticas
- **Conteúdo:** Hooks, state management, patterns

#### **8. Tailwind Patterns**
- **Diretório:** `tailwind-patterns/`
- **Finalidade:** Padrões e melhores práticas Tailwind CSS
- **Conteúdo:** Design system, components, utilities

#### **9. Next.js Best Practices**
- **Diretório:** `nextjs-best-practices/`
- **Finalidade:** Princípios Next.js App Router
- **Conteúdo Principal:**
  - Server vs Client Components (árvore de decisão)
  - Data fetching patterns (static, ISR, dynamic)
  - Routing principles (convenções de arquivos)
  - API routes (métodos, validação)
  - Performance (imagens, bundles)
  - Metadata (static vs dynamic)
  - Caching strategy (camadas, revalidation)
  - Server Actions
  - Anti-patterns (use client everywhere)
- **Project Structure:** Organização de pastas recomendada

#### **10. Animation Guide**
- **Diretório:** `animation-guide/`
- **Finalidade:** Princípios de animação e motion design
- **Conteúdo:** Timing, easing, performance, Lottie, GSAP

---

### **🏗️ Arquitetura & Database (5 skills)**

#### **11. Architecture**
- **Diretório:** `architecture/`
- **Finalidade:** Framework de decisão arquitetural
- **Conteúdo Principal:**
  - **Filosofia:** Requirements drive architecture
  - **Context Discovery:** Perguntas para classificação de projeto
  - **Trade-off Analysis:** Templates ADR, framework de trade-offs
  - **Pattern Selection:** Árvores de decisão, anti-patterns
  - **Examples:** MVP, SaaS, Enterprise
  - **Princípio Core:** Simplicidade é sofisticação suprema
- **Validation Checklist:** Requisitos claros, trade-offs analisados, ADRs documentados
- **Related Skills:** Database design, API patterns, deployment procedures

#### **12. Intelligent Routing**
- **Diretório:** `intelligent-routing/`
- **Finalidade:** Padrões de roteamento inteligente
- **Conteúdo:** Load balancing, service mesh, API gateway

#### **13. App Builder**
- **Diretório:** `app-builder/`
- **Finalidade:** Construção de aplicações
- **Conteúdo:** Frameworks, patterns, best practices

---

### **🚀 DevOps & Deploy (4 skills)**

#### **14. Deployment Procedures**
- **Diretório:** `deployment-procedures/`
- **Finalidade:** Princípios de deployment seguro
- **Conteúdo Principal:**
  - **Filosofia:** Ensina THINKING, não scripts para copiar
  - **Platform Selection:** Árvore de decisão por tipo de deploy
  - **Pre-Deployment:** 4 categorias de verificação
  - **Deployment Workflow:** Processo de 5 fases (Prepare, Backup, Deploy, Verify, Confirm)
  - **Post-Deployment:** Verificação, janela de monitoramento
  - **Rollback Principles:** Quando e como fazer rollback
  - **Zero-Downtime:** Rolling, Blue-Green, Canary
  - **Emergency Procedures:** Service down, investigação
  - **Anti-Patterns:** Deploy Friday, pular staging, andar sem monitorar
- **Best Practices:** Deploys pequenos e frequentes, feature flags

#### **15. Server Management**
- **Diretório:** `server-management/`
- **Finalidade:** Gestão de servidores
- **Conteúdo:** Linux, monitoring, manutenção

#### **16. PowerShell Windows**
- **Diretório:** `powershell-windows/`
- **Finalidade:** Scripts e automação Windows
- **Conteúdo:** Cmdlets, módulos, automação

#### **17. Bash Linux**
- **Diretório:** `bash-linux/`
- **Finalidade:** Scripts e automação Linux
- **Conteúdo:** Shell scripting, automação, sysadmin

---

### **🧪 Testing & Quality (4 skills)**

#### **18. Testing Patterns**
- **Diretório:** `testing-patterns/`
- **Finalidade:** Princípios de testes confiáveis
- **Conteúdo Principal:**
  - **Testing Pyramid:** E2E (few), Integration (some), Unit (many)
  - **AAA Pattern:** Arrange, Act, Assert
  - **Test Type Selection:** Quando usar cada tipo
  - **Unit Test Principles:** Fast, isolated, repeatable, self-checking
  - **Integration Test Principles:** API, DB, external services
  - **Mocking Principles:** Quando mockar, tipos de mocks
  - **Test Organization:** Naming, grouping, setup/teardown
  - **Test Data:** Factories, fixtures, builders
  - **Best Practices:** One assert per test, independent tests
  - **Anti-Patterns:** Testar implementação, testes duplicados

#### **19. TDD Workflow**
- **Diretório:** `tdd-workflow/`
- **Finalidade:** Test-Driven Development
- **Conteúdo:** Red-Green-Refactor, ciclos, práticas

#### **20. Code Review Checklist**
- **Diretório:** `code-review-checklist/`
- **Finalidade:** Checklist para code review
- **Conteúdo:** Itens a verificar, padrões, segurança

#### **21. Lint and Validate**
- **Diretório:** `lint-and-validate/`
- **Finalidade:** Validação de código e qualidade
- **Conteúdo:** Linting, type checking, scripts de validação

---

### **🔒 Security (3 skills)**

#### **22. Vulnerability Scanner**
- **Diretório:** `vulnerability-scanner/`
- **Finalidade:** Scanning de vulnerabilidades
- **Conteúdo:** OWASP Top 10, scanning automatizado

#### **23. Red Team Tactics**
- **Diretório:** `red-team-tactics/`
- **Finalidade:** Táticas de equipe vermelha
- **Conteúdo:** Pentesting, exploração, relatórios

#### **24. Security (integrado)**
- **Finalidade:** Segurança integrada com outras skills
- **Conteúdo:** Princípios de segurança aplicados

---

### **⚡ Performance & Otimização (3 skills)**

#### **25. Performance Profiling**
- **Diretório:** `performance-profiling/`
- **Finalidade:** Profiling de performance
- **Conteúdo:** Ferramentas, técnicas, otimização

#### **26. Systematic Debugging**
- **Diretório:** `systematic-debugging/`
- **Finalidade:** Debugging sistemático
- **Conteúdo:** Metodologia, ferramentas, padrões

#### **27. Performance (integrado)**
- **Finalidade:** Performance integrada
- **Conteúdo:** Otimização aplicada a outras skills

---

### **📱 Mobile & Cross-Platform (2 skills)**

#### **28. Mobile Design**
- **Diretório:** `mobile-design/`
- **Finalidade:** Design mobile-first
- **Conteúdo:** iOS, Android, responsive design

#### **29. Game Development**
- **Diretório:** `game-development/`
- **Finalidade:** Desenvolvimento de jogos
- **Conteúdo:** Engines, patterns, otimização

---

### **📚 Content & Documentation (2 skills)**

#### **30. Documentation Templates**
- **Diretório:** `documentation-templates/`
- **Finalidade:** Templates de documentação
- **Conteúdo:** Padrões, exemplos, melhores práticas

#### **31. Plan Writing**
- **Diretório:** `plan-writing/`
- **Finalidade:** Escrita de planos e documentos
- **Conteúdo:** Estrutura, clareza, comunicação

---

### **🤖 AI & MCP (2 skills)**

#### **32. MCP Builder** (já detalhado acima)

#### **33. Parallel Agents**
- **Diretório:** `parallel-agents/`
- **Finalidade:** Orquestração de múltiplos agentes
- **Conteúdo:** Coordenação, comunicação, sincronização

---

### **🌐 Web & Cross-Platform (4 skills)**

#### **34. SEO Fundamentals**
- **Diretório:** `seo-fundamentals/`
- **Finalidade:** Fundamentos de SEO
- **Conteúdo:** On-page, off-page, technical SEO

#### **35. Geo Fundamentals**
- **Diretório:** `geo-fundamentals/`
- **Finalidade:** Fundamentos de geolocalização
- **Conteúdo:** APIs, geodatabases, privacy

#### **36. I18n Localization**
- **Diretório:** `i18n-localization/`
- **Finalidade:** Internacionalização e localização
- **Conteúdo:** Padrões, ferramentas, best practices

#### **37. Webapp Testing**
- **Diretório:** `webapp-testing/`
- **Finalidade:** Testes de aplicações web
- **Conteúdo:** E2E, automação, ferramentas

---

### **🔧 Outras Skills Técnicas (6 skills)**

#### **38. Clean Code**
- **Diretório:** `clean-code/`
- **Finalidade:** Padrões de código limpo
- **Conteúdo Principal:**
  - **Prioridade:** CRITICAL - Seja conciso, direto, focado em solução
  - **Princípios:** SRP, DRY, KISS, YAGNI, Boy Scout
  - **Naming Rules:** Variáveis, funções, booleanos, constantes
  - **Function Rules:** Pequenas (20 linhas), uma coisa, nível único
  - **Code Structure:** Guard clauses, flat > nested, composição
  - **AI Coding Style:** Escreva código diretamente, não tutoriais
  - **Anti-Patterns:** Comentários óbvios, factories desnecessárias
  - **Self-Check:** Verificar antes de completar tarefa
  - **Verification Scripts:** Scripts específicos por agente

#### **39. Behavioral Modes**
- **Diretório:** `behavioral-modes/`
- **Finalidade:** Modos de comportamento da IA
- **Conteúdo:** Personas, estilos, adaptação

#### **40. Brainstorming**
- **Diretório:** `brainstorming/`
- **Finalidade:** Técnicas de brainstorming
- **Conteúdo:** Métodos, facilitação, templates

#### **41. React Patterns** (já detalhado acima)

#### **42. Tailwind Patterns** (já detalhado acima)

#### **43. Vulnerability Scanner** (já detalhado acima)

---

## 🎯 **Como Usar as Skills**

### **1. Progressive Disclosure**
As skills seguem o princípio de Progressive Disclosure:
- **Inativas:** Não carregam conteúdo até serem necessárias
- **Metadata:** Cada skill tem `name` e `description` no `SKILL.md`
- **Carregamento:** Apenas carrega conteúdo quando o contexto corresponde

### **2. Estrutura de uma Skill**
```
skill-name/
├── SKILL.md          # (Required) Metadata e instruções
├── scripts/          # (Optional) Scripts Python/Bash
├── references/       # (Optional) Documentação, templates
└── assets/           # (Optional) Imagens, logos
```

### **3. Frontmatter YAML**
```yaml
---
name: skill-name
description: Breve descrição da skill
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---
```

### **4. Content Map**
Cada skill tem um mapa de conteúdo:
- **Arquivos:** Lista de arquivos disponíveis
- **Quando Ler:** Guia de quando ler cada arquivo
- **Prioridade:** Arquivos obrigatórios vs opcionais

### **5. Scripts de Validação**
Skills técnicas incluem scripts automatizados:
- **UX Audit:** `python scripts/ux_audit.py <project_path>`
- **API Validator:** `python scripts/api_validator.py <project_path>`
- **Schema Validator:** `python scripts/schema_validator.py <project_path>`
- **Security Scan:** `python scripts/security_scan.py <project_path>`

---

## 🔧 **Integração com Ecossistema**

### **Com Especialistas**
Cada skill mapeia para especialistas Maestro:
- **API Patterns** → Especialista em Contrato de API
- **Frontend Design** → Especialista em UX Design
- **Database Design** → Especialista em Banco de Dados
- **Clean Code** → Especialista em Desenvolvimento Backend

### **Com Templates**
Skills fornecem implementação para templates:
- Conteúdo das skills → preenche seções técnicas
- Exemplos práticos → ilustram como usar templates
- Scripts → validam qualidade dos artefatos

### **Com Workflows**
Skills suportam workflows do Maestro:
- **/implementar-historia** → usa skills específicas
- **/corrigir-bug** → usa debugging e security
- **/refatorar-codigo** → usa clean code

---

## 📈 **Métricas de Impacto**

| Categoria | Skills | Frequência de Uso | Impacto |
|-----------|--------|------------------|---------|
| **Backend** | 8 | 90% (dev backend) | Crítico |
| **Frontend** | 6 | 80% (dev frontend) | Crítico |
| **Arquitetura** | 5 | 70% (design) | Alto |
| **DevOps** | 4 | 60% (deploy) | Alto |
| **Testing** | 4 | 85% (qualidade) | Alto |
| **Security** | 3 | 50% (crítico) | Crítico |
| **Performance** | 3 | 40% (otimização) | Médio |
| **Mobile** | 2 | 30% (mobile) | Médio |
| **Outras** | 9 | 60% (diversos) | Médio |

---

## 🎯 **Próximos Passos**

### **Curto Prazo**
1. **Scripts automatizados** - Mais validações
2. **Integração IDE** - Snippets e atalhos
3. **Examples interativos** - Demonstrações práticas

### **Médio Prazo**
1. **Skills customizáveis** - Por indústria/projeto
2. **Community** - Contribuição de novas skills
3. **Analytics de uso** - Métricas de eficácia

### **Longo Prazo**
1. **AI-powered skills** - Adaptativas ao contexto
2. **Auto-seleção** - Baseada em análise de código
3. **Evolução contínua** - Baseada em feedback

---

## 📞 **Suporte e Contribuição**

### **Reportar Issues**
- Skill não cobre cenário específico
- Script não funciona ou gera erro
- Documentação confusa ou incompleta
- Exemplo não aplicável ou incorreto

### **Contribuir**
- Novas skills por área técnica
- Melhorias nas existentes
- Scripts de validação
- Exemplos e casos de uso

### **Documentação**
- [Guia Base do Sistema](../GUIA_BASE_SISTEMA.md)
- [Catálogo de Especialistas](../ESPECIALISTAS_COMPLETOS.md)
- [Catálogo de Templates](../TEMPLATES_COMPLETOS.md)
- [Catálogo de Prompts](../PROMPTS_COMPLETOS.md)
- [Catálogo de Guias](../GUIAS_COMPLETOS.md)
- [Catálogo de Workflows](../WORKFLOWS_COMPLETOS.md)

---

## 🔄 **Atualizações Recentes (v1.3)**

### **⭐ Novas Skills (5)**
1. **MCP Builder** - Construção de servidores MCP
2. **Next.js Best Practices** - App Router completo
3. **Deployment Procedures** - Princípios de deploy seguro
4. **Vulnerability Scanner** - Scanning automatizado
5. **Clean Code** - Padrões pragmáticos CRITICAL

### **🔧 Melhorias**
- **Frontend Design** - Anti-patterns AI, ASK antes de assumir
- **Database Design** - Análise de trade-offs
- **Architecture** - Framework de decisão robusto
- **Scripts de validação** - Para todas as skills técnicas
- **Cross-reference** - Com templates e especialistas

---

**Versão:** 1.0  
**Data:** 2026-01-28  
**Próxima Atualização:** 2026-02-28  
**Mantenedor:** Maestro CLI Team
