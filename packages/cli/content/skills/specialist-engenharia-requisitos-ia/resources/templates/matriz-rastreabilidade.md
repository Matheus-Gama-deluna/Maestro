# [Nome do Projeto] - Matriz de Rastreabilidade de Requisitos

## Sumário Executivo
[ ] **Projeto:** [Nome do projeto]
- **Versão:** [Versão atual]
- **Data:** [Data de criação]
- **Status:** [Em elaboração/Revisão/Aprovado]
- **Autor:** [Engenheiro de Requisitos]
- **Aprovadores:** [Nomes dos aprovadores]

---

## 1. Visão Geral da Rastreabilidade

### 1.1 Objetivos
- **Mapeamento completo** entre requisitos e artefatos do projeto
- **Visibilidade clara** do impacto de mudanças
- **Garantia de qualidade** através da rastreabilidade
- **Facilitação de auditoria** e validação

### 1.2 Escopo
- **Requisitos Funcionais (RF):** Mapeados para features e critérios
- **Requisitos Não Funcionais (RNF):** Mapeados para componentes
- **Critérios de Aceite (CA):** Mapeados para requisitos
- **Métricas de Sucesso:** Mapeadas para requisitos
- **Stakeholders:** Mapeados para requisitos

---

## 2. Matriz de Rastreabilidade

### 2.1 Requisitos Funcionais ↔ PRD

| ID Requisito | Título Requisito | ID PRD | Seção PRD | Prioridade | Status | Responsável |
|--------------|------------------|--------|-----------|-----------|---------|------------|
| RF-001 | [Título RF-001] | PRD-001 | Seção 3.1 | Alta | Aprovado | [Nome] |
| RF-002 | [Título RF-002] | PRD-001 | Seção 3.2 | Alta | Aprovado | [Nome] |
| RF-003 | [Título RF-003] | PRD-002 | Seção 4.1 | Média | Em elaboração | [Nome] |
| RF-004 | [Título RF-004] | PRD-002 | Seção 4.2 | Alta | Aprovado | [Nome] |
| RF-005 | [Título RF-005] | PRD-003 | Seção 5.1 | Média | Em elaboração | [Nome] |

### 2.2 Requisitos Funcionais ↔ Critérios de Aceite

| ID Requisito | Título Requisito | ID Critério | Título Critério | Status | Testado | Responsável |
|--------------|------------------|-------------|----------------|---------|--------|------------|
| RF-001 | [Título RF-001] | CA-001 | [Título CA-001] | Aprovado | Sim | [Nome] |
| RF-001 | [Título RF-001] | CA-002 | [Título CA-002] | Aprovado | Sim | [Nome] |
| RF-002 | [Título RF-002] | CA-003 | [Título CA-003] | Aprovado | Sim | [Nome] |
| RF-002 | [Título RF-002] | CA-004 | [Título CA-004] | Aprovado | Sim | [Nome] |
| RF-003 | [Título RF-003] | CA-005 | [Título CA-005] | Em elaboração | Não | [Nome] |

### 2.3 Requisitos Não Funcionais ↔ Componentes

| ID RNF | Título RNF | Componente | Subcomponente | Prioridade | Status | Responsável |
|---------|------------|-----------|--------------|-----------|---------|------------|
| RNF-001 | [Título RNF-001] | Backend | API | Alta | Aprovado | [Nome] |
| RNF-002 | [Título RNF-002] | Frontend | UI | Alta | Aprovado | [Nome] |
| RNF-003 | [Título RNF-003] | Database | Schema | Média | Em elaboração | [Nome] |
| RNF-004 | [Título RNF-004] | Infraestrutura | Servidor | Alta | Aprovado | [Nome] |
| RNF-005 | [Título RNF-005] | Segurança | Autenticação | Alta | Aprovado | [Nome] |

### 2.4 Requisitos ↔ Stakeholders

| ID Requisito | Título Requisito | Stakeholder | Papel | Prioridade | Status | Data Validação |
|--------------|------------------|------------|------|-----------|---------|----------------|
| RF-001 | [Título RF-001] | [Nome] | [Papel] | Alta | Aprovado | [Data] |
| RF-002 | [Título RF-002] | [Nome] | [Papel] | Alta | Aprovado | [Data] |
| RF-003 | [Título RF-003] | [Nome] | [Papel] | Média | Em elaboração | [Data] |
| RF-004 | [Título RF-004] | [Nome] | [Papel] | Alta | Aprovado | [Data] |
| RF-005 | [Título RF-005] | [Nome] | [Papel] | Média | Em elaboração | [Data] |

### 2.5 Requisitos ↔ Métricas de Sucesso

| ID Requisito | Título Requisito | Métrica | Meta | Status | Responsável |
|--------------|------------------|---------|------|---------|------------|
| RF-001 | [Título RF-001] | [Nome Métrica] | [Valor meta] | Aprovado | [Nome] |
| RF-002 | [Título RF-002] | [Nome Métrica] | [Valor meta] | Aprovado | [Nome] |
| RF-003 | [Título RF-003] | [Nome Métrica] | [Valor meta] | Em elaboração | [Nome] |
| RF-004 | [Título RF-004] | [Nome Métrica] | [Valor meta] | Aprovado | [Nome] |
| RF-005 | [Título RF-005] | [Nome Métrica] | [Valor meta] | Em elaboração | [Nome] |

---

## 3. Análise de Impacto

### 3.1 Impacto de Mudanças

#### 3.1.1 Mudança Proposta
- **ID:** [ID da mudança]
- **Descrição:** [Descrição detalhada da mudança]
- **Data:** [Data da proposta]
- **Solicitante:** [Nome do solicitante]
- **Prioridade:** [Alta/Média/Baixa]

#### 3.1.2 Requisitos Impactados
| ID Requisito | Impacto | Tipo | Severidade | Ação Necessária |
|--------------|---------|------|----------|----------------|
| RF-001 | [Descrição do impacto] | [Tipo] | [Alta/Média/Baixa] | [Ação necessária] |
| RF-002 | [Descrição do impacto] | [Tipo] | [Alta/Média/Baixa] | [Ação necessária] |
| RNF-001 | [Descrição do impacto] | [Tipo] | [Alta/Média/Baixa] | [Ação necessária] |

#### 3.1.3 Critérios de Aceite Impactados
| ID Critério | Impacto | Status | Ação Necessária | Teste Requerido |
|-------------|---------|---------|----------------|----------------|
| CA-001 | [Descrição do impacto] | [Status] | [Ação necessária] | [Sim/Não] |
| CA-002 | [Descrição do impacto] | [Status] | [Ação necessária] | [Sim/Não] |
| CA-003 | [Descrição do impacto] | [Status] | [Ação necessária] | [Sim/Não] |

### 3.2 Análise de Dependências

#### 3.2.1 Grafo de Dependências
```
[RF-001] → [RF-003] → [RF-005]
    ↓         ↓         ↓
[CA-001]   [CA-003]   [CA-005]

[RNF-001] → [RF-002] → [RF-004]
    ↓         ↓         ↓
[CA-002]   [CA-004]   [CA-006]

[Stakeholder A] → [RF-001], [RF-002]
[Stakeholder B] → [RF-003], [RF-004]
```

#### 3.2.2 Caminhos Críticos
- **Caminho 1:** [RF-001] → [CA-001] → [Implementação]
- **Caminho 2:** [RF-002] → [CA-002] → [Implementação]
- **Caminho 3:** [RNF-001] → [Componente Backend] → [Implementação]

---

## 4. Métricas de Rastreabilidade

### 4.1 Cobertura de Rastreabilidade
- **Total de Requisitos:** [Número total]
- **Requisitos Mapeados:** [Número mapeados]
- **Percentual de Cobertura:** [X%]
- **Requisitos Não Mapeados:** [Lista de IDs]

### 4.2 Qualidade da Rastreabilidade
- **Links Válidos:** [Número de links válidos]
- **Links Quebrados:** [Número de links quebrados]
- **Documentação Completa:** [Sim/Não]
- **Última Atualização:** [Data da última atualização]

### 4.3 Status dos Requisitos
- **Aprovados:** [Número de requisitos aprovados]
- **Em Elaboração:** [Número de requisitos em elaboração]
- **Revisão:** [Número de requisitos em revisão]
- **Cancelados:** [Número de requisitos cancelados]

---

## 5. Gerenciamento de Mudanças

### 5.1 Processo de Mudança
1. **Solicitação:** Abertura de ticket de mudança
2. **Análise:** Avaliação de impacto e dependências
3. **Aprovação:** Aprovação por stakeholders
4. **Implementação:** Execução da mudança
5. **Atualização:** Atualização da matriz de rastreabilidade
6. **Validação:** Validação dos impactos

### 5.2 Histórico de Mudanças

| ID | Data | Tipo | Descrição | Solicitante | Impacto | Status |
|----|------|------|-----------|---------|--------|
| MUD-001 | [Data] | [Tipo] | [Descrição] | [Nome] | [Alto] | [Status] |
| MUD-002 | [Data] | [Tipo] | [Descrição] | [Nome] | [Médio] | [Status] |
| MUD-003 | [Data] | [Tipo] | [Descrição] | [Nome] | [Baixo] | [Status] |

---

## 6. Relatórios e Dashboards

### 6.1 Dashboard de Rastreabilidade
- **Status Geral:** [Visão geral do status]
- **Cobertura por Módulo:** [Percentual por módulo]
- **Tendências:** [Evolução ao longo do tempo]
- **Alertas:** [Itens que precisam de atenção]

### 6.2 Relatórios Personalizados
- **Por Stakeholder:** [Status por stakeholder]
- **Por Prioridade:** [Status por prioridade]
- **Por Status:** [Status por status]
- **Por Data:** [Evolução temporal]

---

## 7. Checklist de Validação

### 7.1 Completude
- [ ] **Todos os RFs** estão mapeados para PRD
- [ ] **Todos os RNFs** estão mapeados para componentes
- [ ] **Todos os CAs** estão mapeados para RFs
- [ ] **Todas as dependências** estão documentadas
- [ ] **Todos os stakeholders** estão mapeados

### 7.2 Consistência
- [ ] **Links bidirecionais** funcionam corretamente
- [ ] **IDs são únicos** e consistentes
- [ ] **Nomenclatura** segue padrão estabelecido
- [ ] **Status** está atualizado
- [ ] **Datas** estão corretas

### 7.7 Qualidade
- [ ] **Documentação** está completa e clara
- [ ] **Análise de impacto** está disponível
- [ ] **Histórico** está atualizado
- [ ] **Métricas** estão sendo monitoradas
- [ ] **Validação** foi realizada

---

## 8. Anexos

### 8.1 Dicionário
- **RF:** Requisito Funcional
- **RNF:** Requisito Não Funcional
- **CA:** Critério de Aceite
- **PRD:** Product Requirements Document
- **Stakeholder:** Interessado no projeto

### 8.2 Referências
- **Documento de Requisitos:** [Link]
- **Documento de PRD:** [Link]
- **Critérios de Aceite:** [Link]
- **Plano de Testes:** [Link]

---

## 9. Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|--------|----------|
| 1.0 | [Data] | [Autor] | Versão inicial |
| 1.1 | [Data] | [Autor] | [Descrição das mudanças] |
| 1.2 | [Data] | [Autor] | [Descrição das mudanças] |

---

**Status:** [ ] Rascunho [ ] Em Revisão [ ] Aprovado  
**Versão:** 1.0  
**Data:** [Data atual]  
**Próxima Atualização:** [Data da próxima atualização]  
**Aprovado por:** [Nomes dos aprovadores]