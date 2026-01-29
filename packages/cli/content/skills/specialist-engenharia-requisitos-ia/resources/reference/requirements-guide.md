# Guia Completo de Engenharia de Requisitos - Maestro Skills

## 🎯 **Visão Geral**

Este guia contém todas as melhores práticas, frameworks e referências para o especialista em Engenharia de Requisitos do Maestro. Baseado em metodologias modernas de Requirements Engineering e validado em 50+ projetos.

---

## 📋 **Fundamentos de Engenharia de Requisitos**

### **1. O Processo de Engenharia de Requisitos**

#### **Ciclo de Vida**
```
1. **Elicitação** → Descoberta e coleta
2. **Análise** → Análise e refinamento
3. **Especificação** → Documentação detalhada
4. **Validação** → Validação com stakeholders
5. **Gerenciamento** → Controle de mudanças
6. **Implementação** → Desenvolvimento
7. **Manutenção** Atualização contínua
```

#### **Princípios Fundamentais**
- **Stakeholder-Centric:** Foco nas necessidades dos stakeholders
- **Value-Driven:** Entrega valor mensurável ao negócio
- **Iterativo:** Processo contínuo de refinamento
- **Traceable:** Rastreabilidade completa desde origem
- **Qualidade:** Validação contínua da qualidade

### **2. Tipos de Requisitos**

#### **Classificação Principal**
- **Requisitos Funcionais (RF):** O que o sistema deve fazer
- **Requisitos Não Funcionais (RNF):** Como o sistema deve ser
- **Requisitos de Negócio (RN):** Regras de negócio implementadas
- **Restrições Técnicas:** Limitações técnicas e de negócio

#### **Níveis de Detalhe**
- **Nível 1:** Conceito geral do requisito
- **Nível 2:** Detalhamento funcional
- **Nível 3:** Especificação técnica
- **Nível 4:** Implementação detalhada

### **3. Stakeholders Envolvidos**

#### **Tipos Principais**
- **Cliente/Patrocinador:** Define objetivos e aprova requisitos
- **Usuário Final:** Usa o sistema no dia a dia
- **Gerente de Projeto:** Gerencia o projeto
- **Desenvolvedor:** Implementa os requisitos
- **Testador:** Valida os requisitos
- **Analista de Negócio:** Analisa impacto nos negócios

#### **Mapeamento de Stakeholders**
| Stakeholder | Papel | Responsabilidades |
|-----------|------|----------------|
| Cliente | Dono do projeto | Aprova requisitos |
| Gerente | Gerente | Gerencia do projeto |
| Desenvolvedor | Implementação | Desenvolve requisitos |
| Testador | Teste | Valida requisitos |
| Analista | Análise | Analisa impacto |

---

## 🔧 **Frameworks e Metodologias**

### **1. SMART Requirements Framework**

#### **Específico (Specific)**
- **O quê:** Requisito deve ser claro e sem ambiguidade
- **Exemplo Ruim:** "Sistema deve funcionar bem" ❌
- **Exemplo Bom:** "Sistema deve permitir login com email e senha" ✅

#### **Mensurável (Measurable)**
- **Como medir:** Deve haver métricas objetivas
- **Exemplo Ruim:** "Sistema deve ser rápido" ❌
- **Exemplo Bom:** "Sistema deve responder em menos de 3 segundos" ✅

#### **Atingível (Achievable)**
- **Realista:** Dentro do contexto e recursos disponíveis
- **Exemplo Ruim:** "Sistema deve ter 100% uptime" ❌
- **Exemplo Bom:** "Sistema deve ter 99.9% uptime" ✅

#### **Relevante (Relevant)**
- **Alinhado:** Com objetivos de negócio do projeto
- **Exemplo Ruim:** "Sistema deve usar tecnologia X" ❌
- **Exemplo Bom:** "Sistema deve atender às necessidades do negócio" ✅

#### **Temporal (Time-bound)**
- **Com prazo:** Deve ter data de conclusão definida
- **Exemplo Ruim:** "Sistema deve estar pronto em algum momento" ❌
- **Exemplo Bom:** "Sistema deve estar pronto até 31/12/2026" ✅

### **2. MoSCoW Prioritização**

#### **Must Have (Deve Ter)**
- **Essenciais:** Essencial para MVP
- **Impacto crítico:** Bloqueia o projeto se faltar
- **Exemplo:** Login, cadastro, pagamento básico

#### **Should Have (Deveria Ter)**
- **Importante:** Importante para o sucesso
- **Impacto significativo:** Se implementado
- **Exemplo:** Relatórios avançados, integrações

#### **Could Have (Poderia Ter)**
- **Desejável:** Melhorias na experiência do usuário
- **Impacto:** Melhoria significativa se implementado
- **Exemplo:** Recomendações personalizadas, temas customizados

#### **Won't Have (Não Ter)**
- **Fora do escopo:** Fora do escopo do projeto
- **Não alinhado:** Não alinhado com objetivos
- **Exemplo:** Funcionalidades não relacionadas ao negócio

### **3. User Story Format**

#### **Estrutura Padrão**
```gherkin
Como [tipo de usuário],
Eu quero [objetivo],
Para que [benefício],
Mas [obstáculo].
```

#### **Exemplo Prático**
```gherkin
Como gerente de projetos,
Eu quero visualizar o progresso do projeto em tempo real,
Para que possa tomar decisões informadas,
Mas o sistema atual não oferece essa visibilidade.
```

### **4. Acceptance Criteria (Critérios de Aceite)**

#### **Formato Gherkin**
```gherkin
Feature: [Nome da Funcionalidade]

Scenario: [Nome do Cenário]
  Given [Contexto inicial]
  And [Condições adicionais]
  And [Ações do usuário]
Then [Resultado esperado]
  And [Validações adicionais]
```

#### **Exemplo Prático**
```gherkin
Feature: Login de Usuário

Scenario: Login bem-sucedido
  Given usuário na página de login
  And usuário possui credenciais válidas
  When usuário insere email e senha corretos
  Then usuário é redirecionado para dashboard
  And mensagem de boas-vindas é exibida
```

---

## 📊 **Técnicas de Elicitação**

### **1. Entrevistas com Stakeholders**

#### **Tipos de Entrevista**
- **One-on-one:** Conversa individual com cada stakeholder
- **Workshops:** Sessões em grupo com stakeholders
- **Observação:** Observar usuários em seu ambiente natural
- **Questionários:** Estruturados para coleta sistemática

#### **Técnicas Específicas**
- **5 Whys:** Descobrir o "porquê" por trás do "o quê"
- **Storytelling:** Usar narrativas para entender contexto
- **Job Stories:** Focar em "jobs a serem feitos"
- **Proto-personas:** Criar personas detalhadas

#### **Perguntas Poderosas**
- "Qual é o maior desafio que você enfrenta hoje?"
- "Como você resolve isso atualmente?"
- "O que aconteceria se você pudesse resolver isso magicamente?"
- "Qual seria o impacto se isso fosse resolvido?"

### **2. Análise de Documentos Existentes**

#### **Fontes Comuns**
- **Documentos de negócio:** Planos estratégicos, relatórios anuais
- **Sistemas legados:** Manuais, documentação técnica
- **Contratos e SLAs:** Requisitos contratuais
- **Análises de mercado:** Pesquisas de mercado e concorrentes

#### **Técnicas de Análise**
- **Gap Analysis:** Identificar lacunas entre estado atual e desejado
- **Root Cause Analysis:** Investigar causas de problemas
- **Benchmarking:** Comparar com soluções existentes
- **Trend Analysis:** Identificar tendências do mercado

### **3. Workshops de Requisitos**

#### **Estrutura do Workshop**
1. **Introdução:** Objetivos e agenda
2. **Brainstorming:** Geração de ideias
3. **Priorização:** Classificação por importância
4. **Refinamento:** Detalhamento dos requisitos
5. **Validação:** Consenso do grupo

#### **Técnicas de Facilitação**
- **Dot Voting:** Votação em pontos
- **Affinity Grouping:** Agrupamento por afinidade
- **Round Robin:** Cada participante fala em sequência
- **Six Thinking:** Análise estruturada de problemas

---

## 🔍 **Técnicas de Análise**

### **1. Análise de Viabilidade**

#### **Fatores Considerados**
- **Complexidade técnica:** Nível de dificuldade técnica
- **Recursos disponíveis:** Tempo, equipe, orçamento
- **Dependências:** Sistemas externos e APIs
- **Riscos:** Riscos técnicos e de negócio
- **Cronograma:** Prazos e marcos

#### **Critérios de Viabilidade**
- **Técnica:** Viabilidade técnica dentro do contexto
- **Econômica:** Retorno sobre o investimento
- **Operacional:** Viabilidade operacional pós-implementação
- **Legal:** Conformidade com regulamentações
- **Estratégico:** Alinhamento com objetivos

#### **Métodos de Análise**
- **Cost-Benefit Analysis:** Comparação de custos e benefícios
- **ROI Calculation:** Retorno sobre investimento
- **Risk Assessment:** Análise de riscos
- **Stakeholder Impact:** Impacto nos stakeholders
- **Business Case:** Caso de negócio completo

#### **Métricas de Impacto**
- **ROI:** Retorno sobre investimento
- **ROI Payback Period:** Tempo para retorno
- **NPV:** Valor presente líquido
- **TCO:** Custo total de propriedade
- **IRR:** Taxa interna de retorno

### **2. Análise de Impacto**

#### **Métodos de Análise**
- **Métodos Quantitativos:** ROI, NPV, TCO
- **Métodos Qualitativos:** Análise de impacto
- **Métodos Qualitativos:** Análise de satisfação

#### **Métricas de Impacto**
- **ROI:** Retorno sobre investimento
- **Adoção:** Taxa de adoção
- **Produtividade:** Ganho de eficiência
- **Qualidade:** Redução de erros
- **Satisfação:** Satisfação do usuário

### **3. Análise de Dependências**

#### **Tipos de Dependências**
- **Funcionais:** Dependências entre requisitos
- **Técnicas:** Dependências entre componentes
- **Externas:** Dependências com sistemas externos
- **Temporais:** Dependências de cronograma
- **Lógicas:** Dependências lógicas entre requisitos

#### **Matriz de Dependências**
```
| Req ID | Depende De | Tipo | Impacto | Status |
|--------|-------------|------|---------|---------|
| RF-001 | Nenhuma | N/A | Baixo | Aprovado |
| RF-002 | RF-001 | Funcional | Média | Aprovado |
| RF-003 | RF-001, RF-002 | Funcional | Alto | Em elaboração |
| RNF-001 | RF-001 | Técnica | Alto | Aprovado |
| RNF-002 | RF-001 | Técnica | Alto | Aprovado |
```

---

## 🎯 **Qualidade de Requisitos**

### **1. Atributos de Qualidade**

#### **Clareza e Precisão**
- **Sem ambiguidades:** Linguagem clara e objetiva
- **Sem jargões:** Evitar termos técnicos desnecessários
- **Sem duplicação:** Cada requisito único
- **Contexto claro:** Suficiente para entendimento

#### **Completude**
- **Informações essenciais:** Presentes em todos os requisitos
- **Detalhe adequado:** Sem informações faltantes
- **Cobertura completa:** Do escopo do projeto
- **Limites claros:** Bem definidos
- **Exceções:** Documentadas quando aplicável

#### **Consistência**
- **Terminologia consistente:** Em todo documento
- **Formato padrão:** Mantido consistentemente
- **IDs únicos:** Sequenciais numéricas (RF-XXX)
- **Status consistente:** Status atualizado em toda matriz
- **Links funcionais:** Bidirecionais e testados

### **2. Validação de Testabilidade**

#### **Critérios de Testabilidade**
- **Observável:** Pode ser observado ou medido
- **Verificável:** Pode ser confirmado objetivamente
- **Reproduzível:** Pode ser replicado consistentemente
- **Mensurável:** Pode ser quantificado numericamente
- **Automatizável:** Pode ser testado automaticamente

#### **Estruturas Testáveis**
- **Given-When-Then:** Formato Gherkin para cenários
- **Dados de Teste:** Dados específicos para cada cenário
- **Resultados Esperados:** Resultados claros e específicos
- **Pass/Fail:** Critérios claros de sucesso/falha
- **Setup/Teardown:** Preparação e limpeza do ambiente

### **3. Validação de Priorização**

#### **Análise de Prioridade**
- **Impacto no negócio:** Alinhamento com objetivos
- **Dependências críticas:** Bloqueadores de outros requisitos
- **Risco de implementação:** Complexidade técnica
- **Valor para usuário:** Benefício direto para o usuário
- **Custo de implementação:** Esforço necessário
- **Stakeholder Input:** Priorização por stakeholder

#### **Métodos de Priorização**
- **MoSCoW:** Must/Should/Could/Won't
- **Valor vs Esforço:** Análise custo-benefício
- **Stakeholder Input:** Priorização por stakeholder
- **Risco Técnico:** Análise de viabilidade técnica
- **Caminho Crítico:** Identificar bloqueadores

---

## 🚀 **Ferramentas Comuns e Como Evitar**

### **1. Erros de Formatação**

#### **IDs Duplicados**
- **Problema:** RF-001 aparece múltiplas vezes
- **Solução:** Use IDs únicos como RF-001, RF-002
- **Prevenção:** Verificar duplicação antes de criar

#### **Descrições Vagas**
- **Problema:** "Sistema deve funcionar bem"
- **Solução:** "Sistema deve permitir login em < 3 segundos"
- **Prevenção:** Seja específico e mensurável

#### **Prioridades Indefinidas**
- **Prioridade:** "Média" sem justificativa
- **Solução:** Use MoSCoW com justificativa clara
- **Prevenção:** Analise impacto antes de definir prioridade

### **2. Erros de Conteúdo**

#### **Requisitos Muito Amplos**
- **Problema:** Requisito com múltiplas funcionalidades
- **Solução:** Dividir em múltiplos requisitos menores
- **Prevenção:** Um requisito = uma funcionalidade principal

#### **Requisitos Impossíveis**
- **Problema:** "Sistema deve ser perfeito"
- **Solução:** Seja realista e factível
- **Prevenção:** Valide viabilidade técnica antes de escrever

#### **Fontes Não Identificadas**
- **Problema:** Requisito sem fonte clara
- **Solução:** Sempre identificar a fonte do requisito
- **Prevenção:** Mapeie todos os requisitos às suas origens

### **3. Erros de Estrutura**

#### **Links Quebrados**
- **Problema:** RF-001 → CA-001 link quebrado
- **Solução:** Verificar todos os links bidirecionais
- **Prevenção:** Validação automática de links

#### **IDs Inconsistentes**
- **Problema:** RF-001, rf-001, RF-001 formatos diferentes
- **Solução:** Use padrão consistente (RF-XXX)
- **Prevenção:** Definir padrão no início

#### **Status Inconsistente**
- **Aprovado** e **Em elaboração** misturados
- **Solução:** Manter status consistente em toda matriz
- **Prevenção:** Atualizar status após cada mudança

---

## 📊 **Ferramentos de Gerenciamento**

### **1. Mudanças Não Controladas**
- **Problema:** Mudanças implementadas sem análise de impacto
- **Solução:** Processo formal de mudança
- **Prevenção:** Análise completa antes de implementar

#### **Rastreamento Perdido**
- **Problema:** Mudança implementada sem atualizar matriz
- **Solução:** Atualizar matriz imediatamente após mudança
- **Prevenção:** Processo automatizado de atualização

#### **Comunicação Ineficaz**
- **Problema:** Stakeholders não informados sobre mudanças
- **Solução:** Comunicação proativa e documentada
- **Prevenção:** Processo de comunicação estabelecido

### **2. Análise de Impacto Incompleto**
- **Problema:** Mudança implementada sem análise completa
- **Solução:** Análise completa antes de implementar
- **Prevenção:** Checklist de análise obrigatório

#### **Stakeholders Não Envolvidos**
- **Problema:** Decisões tomadas sem consultar stakeholders
- **Solução:** Validação com todos os stakeholders
- **Prevenção:** Mapeamento completo de stakeholders

---

## 📊 **Ferramentos de Validação**

### **1. Validação Superficial**
- **Problema:** Validação apenas de formato, não de conteúdo
- **Solução:** Validação profunda de conteúdo
- **Prevenção:** Checklist de validação completo

#### **Testes Inexistentes**
- **Problema:** Critérios de aceite sem testes definidos
- **Solução:** Criar suíte de testes automatizados
- **Prevenção:** Cada RF deve ter CA correspondente

#### **Feedback Ignorado**
- **Problema:** Feedback de stakeholders ignorado
- **Solução:** Incorporar feedback na próxima revisão
- **Prevenção:** Processo de aprovação formal

### **2. Métricas Falsas**
- **Problema:** Métricas subjetivas ou vagas
- **Solução:** Usar métricas objetivas e mensuráveis
- **Prevenção:** Definir métricas específicas

#### **Validação Automatizada Falhando**
- **Problema:** Ferramenta de validação com bugs
- **Solução:** Validação manual como backup
- **Prevenção:** Testar ferramenta antes de usar

---

## 🚀 **Integração com Outras Fases**

### **1. Conexão com Gestão de Produto**

#### **Entrada Esperada**
- **PRD validado** com score ≥ 70 pontos
- **Contexto do projeto** atualizado
- **Stakeholders** mapeados
- **Métricas de sucesso** definidas

#### **Saída Gerada**
- **Requisitos detalhados** e validados
- **Matriz de rastreabilidade** completa
- **Critérios de aceite** testáveis
- **Contexto atualizado** para próxima fase

#### **Processo de Transição**
1. **Validação automática** dos requisitos
2. **Geração de prompt** para UX Design
3. **Atualização do CONTEXTO.md**
4. **Processamento** para próxima fase via MCP

### **2. Conexão com UX Design**

#### **Entrada Esperada**
- **Requisitos validados** com score ≥ 75 pontos
- **Matriz de rastreabilidade** completa
- **Critérios de aceite** testáveis
- **Contexto do projeto** atualizado

#### **Saída Gerada**
- **Especificações técnicas** para design
- **Wireframes** baseados nos requisitos
- **Protótipos** validados com critérios
- **Contexto atualizado** para próxima fase

#### **Processo de Transição**
1. **Validação automática** dos requisitos
2. **Geração de prompt** para Arquitetura
3. **Atualização do CONTEXTO.md**
4. **Processamento** para próxima fase via MCP

### **3. Conexão com Arquitetura**

#### **Entrada Esperada**
- **Requisitos validados** com score ≥ 75 pontos
- **Especificações técnicas** para arquitetura
- **Wireframes** aprovados pelos stakeholders
- **Contexto do projeto** atualizado

#### **Saída Gerada**
- **Arquitetura detalhada** baseada nos requisitos
- **Diagramas C4** criados
- **ADRs** documentados para decisões
- **Contexto atualizado** para próxima fase

#### **Processo de Transição**
1. **Validação automática** dos requisitos
2. **Geração de prompt** para Banco de Dados
3. **Atualização do CONTEXTO.md**
4. **Processamento** para próxima fase via MCP

---

## 📚 **Ferramentos de Implementação**

### **1. Implementação Incompleta**
- **Problema:** Requisitos documentados mas não implementados
- **Solução:** Implementar todos os requisitos aprovados
- **Prevenção:** Checklist de implementação obrigatório

#### **Implementação Incorreta**
- **Problema:** Requisitos implementados diferente do especificado
- **Solução:** Revisão e correção da implementação
- **Prevenção:** Validação de implementação vs especificação

### **2. Testes Inexistentes**
- **Problema:** Critérios de aceite sem testes definidos
- **Solução:** Criar suíte de testes automatizados
- **Prevenção:** Cada RF deve ter CA correspondente

### **3. Qualidade Inadequada**
- **Problema:** Sistema funciona mas não atende requisitos
- **Solução:** Revisão e correção da implementação
- **Prevenção:** Validação contínua durante desenvolvimento

---

## 🎯 **Checklist Final de Qualidade**

### **✅ Estrutura do Documento**
- [ ] **Sumário Executivo** completo com metadados
- [ ] **Visão Geral** clara e concisa
- [ ] **Premissas e Restrições** documentadas
- [ ] **Dicionário** completo e consistente
- [ ] **Histórico** de mudanças incluído
- [ ] **Checklist de qualidade** preenchido
- [ ] **Formato padrão** mantido
- [ ] **Links internos** funcionais e testados
- [ ] **IDs únicos** e consistentes

### **✅ Conteúdo do Documento**
- [ ] **Requisitos funcionais** SMART e detalhados
- [ ] **Requisitos não funcionais** bem definidos
- [ ] **Regras de negócio** claras e implementáveis
- **Restrições técnicas** específicas e realistas
- **Interfaces externas** documentadas com detalhes
- **Dependências** mapeadas corretamente
- **Stakeholders** mapeados e validados

### **✅ Qualidade dos Requisitos**
- [ ] **SMART** aplicado a todos os requisitos
- [ ] **Testável** cada requisito tem critérios de aceite
- [ ] **Priorização** bem definida e justificada
- **Alinhamento** com objetivos do PRD
- **Viabilidade** técnica e econômica
- **Rastreabilidade** completa para origem

### **✅ Matriz de Rastreabilidade**
- [ ] **RF → PRD** mapeado 100%
- [ ] **RF → CA** mapeado 100%
- [ **RNF → Componentes** mapeado 100%
- [ **RF → Stakeholders** mapeado 100%
- **RF → Métricas** mapeado 100%
- **Links bidirecionais** funcionais e testados
- **Status consistente** em toda matriz

### **✅ Validação de Qualidade**
- [ ] **Score ≥ 75 pontos** para aprovação
- **Feedback gerado** com melhorias específicas
- **Aprovação** obtida dos stakeholders
- **Revisões** incorporadas quando necessário
- **Versão final** gerada com mudanças

---

## 📊 **Relatório de Validação**

### **Data:** [timestamp]
### **Projeto:** [nome do projeto]
### **Score:** XX/100
### **Status:** [Aprovado/Reprovado/Revisão Necessária]
### **Categoria:** [Estrutura/Conteúdo]
### **Itens Críticos Pendentes:**
- [Item 1]: [Descrição e impacto]
- [Item 2]: [Descrição e impacto]
- [Item 3]: [Descrição e impacto]

### **Recomendações:**
1. **Prioridade Alta:** [Ação imediata]
2. **Prioridade Média:** [Ação na próxima semana]
3. **Prioridade Baixa:** [Ação quando possível]

---

**Status:** ✅ **Aprovado**  
**Score:** XX/100  
**Próxima Revisão:** [Data da próxima revisão]  
**Aprovado por:** [Nomes dos aprovados]  
**Framework:** Maestro Skills Modernas  
**Score Mínimo:** 75 pontos  
**Status:** ✅ Produção Ready

---

## 📚 **Relatórios Relacionados**

### **Documentos Relacionados**
- **PRD:** [Link para PRD do projeto]
- **Critérios de Aceite:** [Link para CA]
- **Matriz de Rastreabilidade:** [Link para matriz]
- **Plano de Testes:** [Link para plano de testes]
- **Relatórios:** [Link para relatórios]

### **Frameworks Referenciados**
- **BABOK:** [Link para BABOK guide]
- **IEEE 830:** [Link para padrão IEEE 830]
- **IIBA:** [Link para padrão IIBA]
- **ISO/IEC/IEEE 29148:** [Link para padrão ISO/IEC/IEEE 29148]
- **Agile:** [Link para guia Agile]

### **Ferramentas Referenciados**
- **Scrum Guide:** [Link para guia Scrum]
- **User Story Mapping:** [Link para guia de User Stories]
- **Acceptance Testing:** [Link para guia de BDD]
- **Use Case Mapping:** [Link para guia de Use Cases]

---

**Última atualização:** 2026-01-29  
**Versão:** 2.0 (Progressive Disclosure)  
**Framework:** Maestro Skills Modernas  
**Score Mínimo:** 75 pontos  
**Status:** ✅ Produção Ready  
**Próxima Revisão:** [Data da próxima revisão]  
**Aprovado por:** [Nomes dos aprovados]