# Checklist de Validação de Requisitos - Maestro Skills

## 🎯 **Validação Automática de Qualidade**

### **Score Mínimo: 75 pontos para aprovação**

---

## 📋 **Seções Críticas (40 pontos)**

### **1. Estrutura do Documento (15 pontos)**
- [ ] **Sumário Executivo** completo com metadados
- [ ] **Visão Geral** do projeto claramente definida
- [ ] **Premissas e Restrições** documentadas
- [ ] **Dicionário de dados** completo
- [ ] **Histórico de mudanças** incluído
- [ ] **Referências** para documentos relacionados
- [ ] **Checklist de qualidade** preenchido
- [ ] **Formato padrão** mantido consistentemente
- [ ] **Links internos** funcionais e testados
- [ ] **IDs únicos** e consistentes (RF-XXX, RNF-XXX)
- [ ] **Nomenclatura** segue padrão estabelecido
- [ ] **Versão** e **data** atualizadas

### **2. Requisitos Funcionais (15 pontos)**
- [ ] **Todos os RFs** estão presentes e documentados
- [ ] **Formato SMART** aplicado a todos os requisitos
- [ ] **Descrições claras** e sem ambiguidade
- **Prioridades** bem definidas (Alta/Média/Baixa)
- **Fontes** identificadas (PRD, Stakeholder)
- **Complexidade** estimada corretamente
- **Esforço** estimado em horas/pontos
- **Dependências** mapeadas corretamente
- **Aceite** mensurável e verificável
- **Cobertura completa** do escopo
- **Requisitos únicos** sem duplicação
- **Status** atualizado para todos
- **Alinhamento** com objetivos do negócio

### **3. Requisitos Não Funcionais (10 pontos)**
- [ ] **Todos os RNFs** estão presentes e documentados
- **Categorias** bem definidas (Performance, Segurança, etc.)
- **Métricas** específicas e mensuráveis
- **Valores alvo** realistas e alcançáveis
- **Condições de teste** documentadas
- **Aceite** verificável objetivamente
- **Cobertura** completa de aspectos não funcionais
- **Prioridades** bem definidas
- **Alinhamento** com arquitetura

---

## 📊 **Seções Importantes (30 pontos)**

### **4. Regras de Negócio (10 pontos)**
- [ ] **Todas as RNs** estão presentes e documentadas
- **Condições** claramente definidas
- **Ações** específicas e determinísticas
- **Exceções** bem documentadas
- **Fontes** identificadas
- **Prioridades** bem definidas
- **Lógica** clara e implementável
- **Impacto** nos negócios documentado
- **Validação** específica incluída

### **5. Restrições Técnicas (10 pontos)**
- [ ] **Arquitetura** bem definida e documentada
- **Tecnologias** permitidas e restritas listadas
- **Infraestrutura** especificada com detalhes
- **Compliance** com regulamentações (LGPD, PCI DSS)
- **Integrações** externas documentadas
- **Ambientes** (Dev, HML, Prod) definidos
- **Escalabilidade** requisitos documentados
- **Backup** e **recovery** estratégias definidas
- **Monitoramento** ferramentas especificadas

### **6. Interfaces Externas (10 pontos)**
- [ ] **APIs externas** documentadas com detalhes
- **Webhooks** implementados conforme especificado
- **Integrações** com sistemas terceiros mapeadas
- **Formatos** de troca de dados definidos
- **Autenticação** e **autorização** documentadas
- **Taxas** de uso especificadas
- **Limites** de uso documentados
- **Versionamento** de APIs documentado
- **Tratamento** de erros documentado

---

## 🔍 **Validação de Qualidade**

### **Análise de Consistência**
- **Links bidirecionais:** Verificar se RF → CA → PRD funciona
- **IDs únicos:** Garantir que não há duplicação
- **Nomenclatura:** Verificar padrão RF-XXX, RNF-XXX, CA-XXX
- **Status consistente:** Status atualizado em toda matriz
- **Datas válidas:** Datas realistas e lógicas

### **Análise de Completude**
- **Cobertura total:** 100% dos requisitos mapeados
- **Dependências:** Todas as dependências documentadas
- **Stakeholders:** Todos os stakeholders mapeados
- **Métricas:** Todas as métricas mapeadas
- **Testes:** Critérios de aceite para todos os RFs

### **Análise de Qualidade**
- **SMART:** Todos os requisitos são SMART
- **Testabilidade:** Todos os requisitos são testáveis
- **Clareza:** Sem ambiguidades ou termos técnicos
- **Priorização:** Prioridades justificadas
- **Viabilidade:** Esforço realista dentro do contexto
- **Alinhamento:** Com objetivos de negócio do PRD

---

## 📊 **Métricas de Validação**

### **Pontuação por Categoria**
- **Estrutura (40 pts):** 15 + 15 + 10
- **Conteúdo (60 pts):** 15 + 15 + 10 + 10 + 10

### **Classificação de Qualidade**
- **90-100 pontos:** ✅ Excelente - Pronto para implementação
- **80-89 pontos:** ✅ Bom - Pequenos ajustes necessários
- **75-79 pontos:** ⚠️ Aceitável - Revisões recomendadas
- **60-74 pontos:** ❌ Insuficiente - Revisão obrigatória
- **< 60 pontos:** ❌ Crítico - Refazer completamente

### **Relatório de Validação**
```
Data: [timestamp]
Projeto: [nome do projeto]
Score: XX/100
Status: [Aprovado/Reprovado/Revisão Necessária]
Categoria: [Estrutura/Conteúdo]
Itens Críticos Pendentes:
- [Item 1]: [Descrição e impacto]
- [Item 2]: [Descrição e impacto]
- [Item 3]: [Descrição e impacto]
Recomendações:
1. [Prioridade Alta]: [Ação imediata]
2. [Prioridade Média]: [Ação na próxima semana]
3. [Prioridade Baixa]: [Ação quando possível]
```

---

## 🚀 **Processo de Validação**

### **1. Validação Automática**
```python
# Executado via MCP
def validate_requirements(project_path):
    score = calculate_score(project_path)
    feedback = generate_feedback(project_path)
    return score, feedback
```

### **2. Análise de Impacto**
```python
# Executado via MCP
def analyze_impact(requirement_id, change_type):
    impact = analyze_requirement_change(requirement_id, change_type)
    return impact
```

### **3. Validação com Stakeholders**
- **Reunião de validação** com stakeholders
- **Feedback coletado** e documentado
- **Aprovação formal** obtida
- **Assinaturas** coletadas

### **4. Atualização da Matriz**
- **Links atualizados** com novas dependências
- **Status modificado** conforme mudanças
- **Versão incrementada** do documento
- **Histórico** atualizado com mudanças

---

## 📋 **Checklist de Implementação**

### **Antes da Validação**
- [ ] **Requisitos coletados** com stakeholders
- [ ] **PRD analisado** e compreendido
- **Templates** preenchidos com informações
- **Matriz inicial** criada com mapeamentos básicos
- **Stakeholders** identificados e mapeados

### **Durante a Validação**
- [ ] **Estrutura** validada conforme padrão
- [ ] **Conteúdo** validado contra PRD
- **Links** verificados e funcionais
- **Score** calculado e analisado
- **Feedback** gerado e documentado
- **Aprovação** obtida dos stakeholders

### **Após a Validação**
- [ ] **Correções** implementadas conforme feedback
- [ ] **Score final** ≥ 75 pontos
- [ ] **Matriz atualizada** com mudanças
- [ ] **Versão final** gerada
- [ ] **Comunicação** enviada aos stakeholders

---

## 🎯 **Critérios de Aprovação**

### **Para Aprovação (Score ≥ 75)**
- **Estrutura:** 40+ pontos
- **Conteúdo:** 60+ pontos
- **Cobertura:** 100% de requisitos mapeados
- **Qualidade:** Requisitos SMART e testáveis
- **Consistência:** Links funcionais e dados corretos

### **Para Revisão (Score 60-74)**
- **Estrutura:** 30-39 pontos
- **Conteúdo:** 45-59 pontos
- **Cobertura:** 80-99% de requisitos mapeados
- **Qualidade:** Alguns requisitos não são SMART
- **Consistência:** Alguns links quebrados

### **Para Refazer (Score < 60)**
- **Estrutura:** < 30 pontos
- **Conteúdo:** < 45 pontos
- **Cobertura:** < 80% de requisitos mapeados
- **Qualidade:** Muitos requisitos não são SMART
- **Consistência:** Muitos links quebrados

---

## 📞 **Suporte e Ferramentas**

### **Documentação**
- **Guia completo:** `resources/reference/requirements-guide.md`
- **Templates:** `resources/templates/*.md`
- **Exemplos:** `resources/examples/requirements-examples.md`
- **Checklist:** `resources/checklists/requirements-validation.md`

### **Automação**
- **Validação automática:** Via MCP
- **Geração de relatórios:** Via MCP
- **Atualização de matriz:** Via MCP
- **Notificações:** Via MCP

### **Integração**
- **PRD:** Mapeamento bidirecional
- **Critérios:** Geração automática de links
- **Testes:** Geração automática de cenários
- **Relatórios:** Geração automática de relatórios

---

**Última atualização:** 2026-01-29  
**Versão:** 2.0 (Progressive Disclosure)  
**Framework:** Maestro Skills Modernas  
**Status:** ✅ Produção Ready  
**Score Mínimo:** 75 pontos