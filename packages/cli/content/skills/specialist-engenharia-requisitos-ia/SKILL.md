---
name: specialist-engenharia-requisitos-ia
description: Transformação de PRDs em requisitos claros, testáveis e rastreáveis com foco em critérios de aceite e matriz de rastreabilidade. Use quando precisar detalhar funcionalidades do PRD em requisitos executáveis.
allowed-tools: Read, Write, Edit, Glob, Grep
version: 2.0
framework: progressive-disclosure
---

# Engenharia de Requisitos · Skill Moderna

## Missão
Transformar visões de produto em requisitos detalhados, testáveis e rastreáveis em 45-60 minutos, garantindo clareza, completude e alinhamento com objetivos de negócio.

## Quando ativar
- **Fase:** Fase 2 · Engenharia
- **Workflows:** /maestro, /avancar-fase, /detalhar-requisitos
- **Trigger:** "preciso de requisitos", "detalhar funcionalidades", "criterios de aceite"

## Inputs obrigatórios
- PRD validado do especialista de Gestão de Produto
- Contexto de negócio e stakeholders mapeados
- Restrições técnicas e de negócio conhecidas
- Visão de produto e MVP definidos

## Outputs gerados
- `docs/02-requisitos/requisitos.md` — Requisitos funcionais e não funcionais
- `docs/02-requisitos/criterios-aceite.md` — Critérios de aceite testáveis
- `docs/02-requisitos/matriz-rastreabilidade.md` — Matriz de rastreabilidade completa
- Score de validação ≥ 75 pontos

## Quality Gate
- Requisitos SMART (Específicos, Mensuráveis, Atingíveis, Relevantes, Temporais)
- Critérios de aceite testáveis com Gherkin
- Matriz de rastreabilidade 100% completa
- Requisitos não funcionais definidos
- Score de validação automática ≥ 75 pontos

## 🚀 Processo Otimizado

### 1. Análise do PRD (10 min)
Use função de análise para extrair informações estruturadas do PRD:
- Funcionalidades principais do MVP
- Personas e casos de uso
- Restrições e dependências
- Métricas de sucesso

### 2. Mapeamento de Requisitos (15 min)
Classifique e detalhe os requisitos:
- **Requisitos Funcionais (RF):** O que o sistema deve fazer
- **Requisitos Não Funcionais (RNF):** Como o sistema deve ser
- **Regras de Negócio:** Lógica e validações
- **Restrições Técnicas:** Limitações e tecnologias

### 3. Definição de Critérios de Aceite (10 min)
Para cada requisito funcional, defina:
- **Given/When/Then** em formato Gherkin
- **Cenários de teste** cobrindo caminhos feliz e exceções
- **Dados de teste** e exemplos concretos
- **Resultados esperados** mensuráveis

### 4. Matriz de Rastreabilidade (10 min)
Crie conexões claras entre:
- **Requisitos ↔ Funcionalidades do PRD**
- **Requisitos ↔ Critérios de Aceite**
- **Requisitos ↔ Métricas de Sucesso**
- **Requisitos ↔ Stakeholders**

### 5. Validação de Qualidade (5 min)
Aplique validação automática de completude e consistência.

## 📚 Recursos Adicionais

### Templates e Guias
- **Template Requisitos:** [resources/templates/requisitos.md](resources/templates/requisitos.md)
- **Template Critérios:** [resources/templates/criterios-aceite.md](resources/templates/criterios-aceite.md)
- **Template Matriz:** [resources/templates/matriz-rastreabilidade.md](resources/templates/matriz-rastreabilidade.md)
- **Exemplos práticos:** [resources/examples/requirements-examples.md](resources/examples/requirements-examples.md)
- **Guia completo:** [resources/reference/requirements-guide.md](resources/reference/requirements-guide.md)
- **Validação:** [resources/checklists/requirements-validation.md](resources/checklists/requirements-validation.md)

### Funções MCP
- **Inicialização:** Função de criação de estrutura base
- **Validação:** Função de verificação de qualidade
- **Processamento:** Função de preparação para próxima fase

## 🎯 Framework de Requisitos

### Classificação SMART
- **S**pecíficos: Claros e sem ambiguidade
- **M**ensuráveis: Verificáveis objetivamente
- **A**tingíveis: Realistas e factíveis
- **R**elevantes: Alinhados com objetivos de negócio
- **T**emporais: Com prazo definido

### Tipos de Requisitos

#### Requisitos Funcionais (RF)
```markdown
RF-001: [Identificador] - [Título]
**Descrição:** [O que o sistema deve fazer]
**Prioridade:** [Alta/Média/Baixa]
**Fonte:** [Stakeholder/Documento]
**Aceite:** [Critério de aceite principal]
```

#### Requisitos Não Funcionais (RNF)
```markdown
RNF-001: [Identificador] - [Título]
**Descrição:** [Como o sistema deve ser]
**Categoria:** [Performance/Segurança/Usabilidade/etc]
**Métrica:** [Como medir]
**Aceite:** [Critério de aceite principal]
```

### Critérios de Aceite Gherkin
```gherkin
Feature: [Nome da Funcionalidade]

Scenario: [Nome do Cenário]
  Given [Contexto inicial]
  When [Ação do usuário]
  Then [Resultado esperado]
  And [Validação adicional]
```

## 🔄 Context Flow Automatizado

### Ao Concluir (Score ≥ 75)
1. **Requisitos validados** automaticamente
2. **CONTEXTO.md** atualizado
3. **Prompt gerado** para próximo especialista
4. **Transição** automática para UX Design

### Comando de Avanço
Use função de processamento para preparar contexto para UX Design quando requisitos estiverem validados.

### Guardrails Críticos
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **VALIDE** todos os requisitos SMART
- **DOCUMENTE** dependências e trade-offs
- **USE funções descritivas** para automação via MCP

## 📊 Estrutura dos Templates

### Template Requisitos
- **Sumário Executivo** do projeto
- **Requisitos Funcionais** detalhados
- **Requisitos Não Funcionais** completos
- **Regras de Negócio** mapeadas
- **Restrições Técnicas** definidas

### Template Critérios de Aceite
- **Feature definitions** em Gherkin
- **Scenarios** completos com dados
- **Edge cases** e exceções
- **Test data** e exemplos
- **Acceptance criteria** mensuráveis

### Template Matriz
- **Mapeamento RF ↔ PRD**
- **Mapeamento RF ↔ Critérios**
- **Priorização** e dependências
- **Status tracking** por requisito
- **Impact analysis** por mudança

## 🎯 Performance e Métricas

### Tempo Estimado
- **Análise PRD:** 10 minutos
- **Mapeamento Requisitos:** 15 minutos
- **Critérios de Aceite:** 10 minutos
- **Matriz Rastreabilidade:** 10 minutos
- **Validação:** 5 minutos
- **Total:** 50 minutos (vs 60 anterior)

### Qualidade Esperada
- **Score validação:** ≥ 75 pontos
- **Completude:** 100% requisitos SMART
- **Consistência:** 100% formato padrão
- **Rastreabilidade:** 100% mapeada
- **Performance:** 80% redução de tokens

### Frameworks Utilizados
- **SMART Requirements**
- **Gherkin/BDD**
- **Use Case Mapping**
- **Traceability Matrix**
- **MoSCoW Prioritization**

## 🔧 Integração Maestro

### Skills Complementares
- `plan-writing` (estruturação)
- `data-analysis` (métricas)
- `technical-writing` (documentação)

### Referências Essenciais
- **Especialista original:** `content/specialists/Especialista em Engenharia de Requisitos.md`
- **Artefatos gerados:**
  - `docs/02-requisitos/requisitos.md` (principal)
  - `docs/02-requisitos/criterios-aceite.md` (testes)
  - `docs/02-requisitos/matriz-rastreabilidade.md` (rastreabilidade)
  - `docs/02-requisitos/validation-report.md` (qualidade)

### Próximo Especialista
**UX Design** - Transformará requisitos em design de interface e experiência do usuário.

---

**Framework:** Maestro Skills Modernas v2.0  
**Pattern:** Progressive Disclosure  
**Performance:** 80% redução de tokens  
**Quality:** 100% validação automática