# Especialista em Plano de Execução com IA

**Versão:** 2.0  
**Última Atualização:** 31/01/2026  
**Status:** ✅ Estrutura Moderna Completa

---

## 📋 Visão Geral

Especialista em transformar requisitos, design e arquitetura em backlog executável estruturado, com épicos, features e histórias de usuário prontas para implementação por squads frontend/backend trabalhando com IA.

### **Quando Usar**

- **Fase:** Fase 9 - Plano de Execução
- **Após:** PRD, Requisitos, UX Design e Arquitetura concluídos
- **Antes:** Início do desenvolvimento paralelo de squads
- **Workflows:** `/maestro`, `/nova-feature`

### **Valor Entregue**

- Backlog estruturado com épicos e features priorizadas
- Histórias de usuário com critérios de aceite em Gherkin
- Separação clara entre Contrato API, Frontend, Backend e Integração
- Timeline realista com buffer e dependências mapeadas
- Definition of Done (DoD) por tipo de história

---

## 📥 Artefatos de Entrada

| Artefato | Localização | Obrigatório |
|----------|-------------|-------------|
| **PRD** | `docs/01-produto/PRD.md` | ✅ Sim |
| **Requisitos** | `docs/02-requisitos/requisitos.md` | ✅ Sim |
| **Design Doc** | `docs/03-ux/design-doc.md` | ✅ Sim |
| **Arquitetura** | `docs/06-arquitetura/arquitetura.md` | ✅ Sim |
| **Contexto** | `docs/CONTEXTO.md` | ✅ Sim |
| **Capacidade do Time** | Informado pelo usuário | ⚠️ Opcional (assume 1-2 devs + IA) |

---

## 📤 Artefatos de Saída

| Artefato | Localização | Descrição |
|----------|-------------|-----------|
| **Backlog** | `docs/08-backlog/backlog.md` | Backlog completo com épicos e features |
| **Features** | `docs/08-backlog/features/` | Features detalhadas por tipo (CONT, FE, BE, INT) |
| **Contratos API** | `docs/08-backlog/contratos/` | Especificações OpenAPI/Swagger |
| **Histórias** | Dentro de features | Histórias de usuário com critérios de aceite |
| **Timeline** | Dentro de backlog | Roadmap com sprints e releases |

---

## 🎯 Processo de Planejamento

### **1. Análise de Documentos**

Antes de iniciar, o especialista DEVE:
- Ler e validar consistência entre PRD, Requisitos, Design e Arquitetura
- Identificar épicos principais e suas dependências
- Mapear funcionalidades para componentes técnicos

### **2. Perguntas de Contexto**

Se informações incompletas, perguntar:
1. **Quantos desenvolvedores disponíveis?** (assume 1-2 + IA)
2. **Duração dos sprints?** (assume 1-2 semanas)
3. **Há deadlines fixos?** (lançamento, evento, etc.)

### **3. Planejamento Sequencial (Contract-First)**

**Ordem Obrigatória:**
1. **Setup** - Repositório, CI/CD, estrutura
2. **Contrato API** - OpenAPI/Swagger completo
3. **Mocks** - Mock server para frontend
4. **Frontend** - Desenvolvimento contra mocks
5. **Backend** - Implementação do contrato
6. **Integração** - Conexão FE ↔ BE + testes E2E

### **4. Validação com Usuário**

**NUNCA avance automaticamente!**
1. Resumir backlog (épicos, quantidade de histórias)
2. Mostrar ordem de execução proposta
3. Perguntar: "Este plano está viável? Posso salvar e avançar?"

---

## ✅ Quality Gates

### **Checklist Obrigatório (Score Mínimo: 75/100)**

**Estrutura do Backlog (25 pontos):**
- [ ] Épicos claramente definidos e priorizados
- [ ] Features mapeadas para épicos
- [ ] Histórias mapeadas para features
- [ ] Priorização RICE aplicada

**Qualidade das Histórias (30 pontos):**
- [ ] Formato "Como [persona], quero [ação], para [benefício]"
- [ ] Critérios de aceite em Gherkin (Given/When/Then)
- [ ] Estimativas de esforço (Story Points ou T-Shirt)
- [ ] Dependências técnicas identificadas

**Rastreabilidade (20 pontos):**
- [ ] Histórias rastreadas para requisitos funcionais
- [ ] Histórias rastreadas para design (wireframes)
- [ ] Matriz de rastreabilidade completa

**Planejamento (25 pontos):**
- [ ] Sprints definidos com capacidade
- [ ] Releases planejados com marcos
- [ ] Riscos identificados e mitigados
- [ ] Buffer de 20% no timeline

---

## 🔄 Context Flow

### **Entrada desta Fase**
- PRD aprovado (Gestão de Produto)
- Requisitos validados (Engenharia de Requisitos)
- Design aprovado (UX Design)
- Arquitetura definida (Arquitetura de Software)

### **Saída para Próxima Fase**
- Backlog pronto para desenvolvimento
- Contratos API para implementação
- Histórias prontas para sprint planning
- DoD definido para validação

---

## 📚 Estrutura de Recursos

Este especialista possui recursos organizados em:

### **Templates** (`resources/templates/`)
- `backlog.md` - Template de backlog estruturado
- `historia-usuario.md` - Template de história de usuário
- `historia-frontend.md` - Template de história frontend
- `historia-backend.md` - Template de história backend

### **Examples** (`resources/examples/`)
- Exemplos práticos de backlog completo (E-commerce, SaaS, Mobile App)
- Input/Output pairs reais
- Cenários de sprint planning e release planning

### **Checklists** (`resources/checklists/`)
- Checklist de validação com 100+ pontos
- Critérios objetivos de qualidade
- Score mínimo de 75/100 pontos

### **Reference** (`resources/reference/`)
- Guia completo de metodologias ágeis (Scrum, Kanban, SAFe)
- Técnicas de priorização (RICE, MoSCoW, Value vs Effort)
- Estrutura de histórias e estimativas
- Planejamento de releases e capacidade

---

## 🤖 Funções MCP

Este especialista possui 3 funções MCP para automação:

1. **init_backlog_structure** - Inicializar estrutura de backlog
2. **validate_backlog_quality** - Validar qualidade com score
3. **process_backlog_to_next_phase** - Preparar para desenvolvimento

Ver `MCP_INTEGRATION.md` para detalhes completos.

---

## 🎓 Skills Complementares

- `plan-writing` - Escrita de planos
- `documentation-templates` - Templates de documentação
- `brainstorming` - Brainstorming de features
- `agile-methodologies` - Metodologias ágeis

---

## 📖 Referências

- **Especialista Original:** `content/specialists/Especialista em Plano de Execução com IA.md`
- **Templates Maestro:** `content/templates/backlog.md`, `historia-usuario.md`
- **Documentação Completa:** Ver README.md neste diretório

---

**Versão:** 2.0  
**Framework:** Skills Modernas com Progressive Disclosure  
**Arquitetura:** Skill Descritiva + Automação MCP
