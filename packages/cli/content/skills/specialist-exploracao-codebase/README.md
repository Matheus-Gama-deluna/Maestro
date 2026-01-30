# Especialista: Exploração de Codebase

## 📋 Visão Geral

Este especialista auxilia na análise sistemática de codebases existentes, identificando estrutura, padrões, dívida técnica e oportunidades de melhoria. Gera documentação completa e planos de refatoração baseados em análise profunda do código.

### Informações Básicas

- **Categoria:** Complementar
- **Complexidade:** Média
- **Tempo Estimado:** 90 minutos
- **Score Mínimo:** 75 pontos
- **Versão:** 1.0.0

### Tags
`codebase` `exploration` `technical-debt` `refactoring` `documentation` `analysis` `legacy` `architecture`

### Dependências
- Codebase existente (código fonte)
- Debugging e Troubleshooting (para contexto de bugs)
- Documentação Técnica (docs existentes, se houver)

## 🎯 Quando Usar

### ✅ Use Este Especialista Quando:
- Ao iniciar trabalho em codebase legado ou desconhecido
- Antes de grandes refatorações ou migrações
- Para documentar arquitetura de sistemas existentes
- Quando precisa identificar dívida técnica
- Para onboarding de novos desenvolvedores
- Em due diligences ou auditorias técnicas
- Antes de assumir manutenção de projeto

### ❌ Não Use Quando:
- Codebase ainda não existe (use especialistas de desenvolvimento)
- Projeto é muito pequeno (< 1000 linhas)
- Apenas debugging pontual (use Debugging e Troubleshooting)
- Código já está bem documentado e mapeado
- Apenas precisa adicionar features (use especialistas de desenvolvimento)

## 📋 Processo de 3 Fases

### Fase 1: Scan (25 min)

**Objetivo:** Análise automática da estrutura do código

**Ações:**
1. Escanear estrutura de diretórios
2. Identificar linguagens e frameworks
3. Mapear dependências principais
4. Contar métricas básicas (LOC, arquivos, módulos)
5. Detectar padrões arquiteturais
6. Identificar entry points

**Perguntas-Chave:**
- Qual é a estrutura de diretórios?
- Quais linguagens e frameworks são usados?
- Quantos arquivos e linhas de código?
- Qual é o padrão arquitetural?
- Onde estão os entry points?

**Entregável:** Mapa estrutural do codebase

**Função MCP:** `scan_codebase_structure`

---

### Fase 2: Analyze (40 min)

**Objetivo:** Identificação de padrões, debt e oportunidades

**Ações:**
1. Analisar qualidade do código
2. Identificar code smells
3. Calcular dívida técnica
4. Mapear dependências complexas
5. Identificar componentes críticos
6. Avaliar cobertura de testes
7. Verificar vulnerabilidades de segurança
8. Analisar performance bottlenecks

**Métricas Analisadas:**
- Complexidade ciclomática
- Duplicação de código
- Cobertura de testes
- Dependências desatualizadas
- Vulnerabilidades conhecidas
- LOC por arquivo/módulo

**Entregável:** Relatório de análise técnica

**Template:** Ver `resources/templates/technical-debt-report.md`

**Função MCP:** `analyze_technical_debt`

---

### Fase 3: Document (25 min)

**Objetivo:** Geração de mapa e recomendações

**Ações:**
1. Gerar mapa visual do codebase
2. Documentar arquitetura descoberta
3. Criar plano de refatoração priorizado
4. Documentar decisões arquiteturais inferidas
5. Gerar guia de navegação
6. Criar roadmap de melhorias

**Priorização:**
- **Crítico:** Ação imediata (1-2 semanas)
- **Alto:** Curto prazo (1 mês)
- **Médio:** Médio prazo (2-3 meses)
- **Baixo:** Longo prazo (monitorar)

**Entregável:** Codebase map + plano de refatoração

**Templates:** Ver `resources/templates/codebase-map.md` e `refactoring-plan.md`

**Função MCP:** `generate_codebase_map`

## 🔧 Funções MCP Disponíveis

### 1. scan_codebase_structure

**Descrição:** Escaneia estrutura do codebase e identifica padrões.

**Quando usar:** Início da Fase 1 (Scan)

**Parâmetros:**
- `codebase_path`: Caminho para o codebase
- `exclude_patterns`: Padrões a excluir (node_modules, vendor, etc.)
- `max_depth`: Profundidade máxima de scan

**Saída:**
- Estrutura de diretórios
- Linguagens identificadas
- Frameworks detectados
- Métricas básicas (LOC, arquivos)
- Padrões arquiteturais

**Detalhes:** Ver `MCP_INTEGRATION.md`

---

### 2. analyze_technical_debt

**Descrição:** Analisa qualidade e identifica dívida técnica.

**Quando usar:** Durante Fase 2 (Analyze)

**Parâmetros:**
- `codebase_path`: Caminho para o codebase
- `analysis_depth`: Nível de análise (basic/full)
- `thresholds`: Thresholds customizados

**Saída:**
- Score de qualidade (0-100)
- Code smells identificados
- Dívida técnica estimada
- Recomendações priorizadas

**Detalhes:** Ver `MCP_INTEGRATION.md`

---

### 3. generate_codebase_map

**Descrição:** Gera mapa visual e documentação do codebase.

**Quando usar:** Ao final da Fase 3 (Document)

**Parâmetros:**
- `codebase_path`: Caminho para o codebase
- `analysis_results`: Resultados da análise
- `output_format`: Formato do mapa (markdown/mermaid/json)

**Saída:**
- Mapa visual do codebase
- Documentação de arquitetura
- Plano de refatoração
- Guia de navegação

**Detalhes:** Ver `MCP_INTEGRATION.md`

## 📚 Recursos Disponíveis

### Templates
- **`resources/templates/codebase-map.md`** - Mapa estrutural do codebase
- **`resources/templates/technical-debt-report.md`** - Relatório de dívida técnica
- **`resources/templates/refactoring-plan.md`** - Plano de refatoração priorizado

### Exemplos Práticos
- **`resources/examples/exploration-examples.md`** - 5 cenários completos
  - Monolito Node.js legado
  - Microserviços Java/Spring
  - Frontend SPA React
  - Mobile App React Native
  - Sistema Legacy PHP

### Checklists
- **`resources/checklists/exploration-validation.md`** - Sistema de pontuação (100 pontos)
  - Critérios por fase
  - Score mínimo: 75 pontos

### Guias de Referência
- **`resources/reference/exploration-guide.md`** - Guia completo
  - Técnicas de análise de código
  - Ferramentas de análise estática
  - Padrões arquiteturais comuns
  - Identificação de code smells
  - Cálculo de dívida técnica
  - Ferramentas recomendadas

## 💡 Exemplo Rápido

**Cenário:** Monolito Node.js legado

**Input:**
```
Codebase: 50k LOC, Node.js + Express
Estrutura: src/ com 200+ arquivos
Testes: 30% cobertura
Idade: 3 anos
Documentação: Mínima
```

**Processo:**
1. **Scan (25 min):** 
   - Identificar 15 módulos principais
   - Detectar Express + MongoDB + Redis
   - Mapear 200 arquivos em 8 diretórios
   
2. **Analyze (40 min):** 
   - Detectar 45 code smells
   - Debt score: 62/100
   - Complexidade média: 12 (alto)
   - Duplicação: 8%
   
3. **Document (25 min):** 
   - Gerar mapa visual
   - Plano de refatoração em 3 fases
   - 12 recomendações priorizadas

**Output:** Mapa completo + plano de refatoração priorizado em ~90 minutos

**Ver exemplo completo:** `resources/examples/exploration-examples.md#monolito-nodejs`

## 🎯 Inovações

### Codebase Map Visual
Mapa interativo da estrutura do código com dependências, complexidade e hotspots de mudança.

### Technical Debt Scoring
Score automático de dívida técnica baseado em múltiplas métricas (complexidade, duplicação, cobertura).

### Refactoring Recommendations
Sugestões priorizadas de refatoração baseadas em impacto vs esforço.

### Dependency Graph
Grafo de dependências automatizado mostrando acoplamento e pontos críticos.

### Hotspot Analysis
Identificação de arquivos com alta frequência de mudanças e bugs.

## 📊 Métricas de Sucesso

- **Tempo Total:** ~90 minutos (vs 4-8 horas manual)
- **Cobertura:** 100% do codebase mapeado
- **Precisão:** >90% na identificação de padrões
- **Utilidade:** >85% das recomendações implementadas
- **Score Mínimo:** 75 pontos

## ✅ Próximos Passos

Após conclusão da exploração:

1. Compartilhar codebase map com equipe
2. Priorizar itens de dívida técnica
3. Criar histórias de refatoração
4. Atualizar documentação arquitetural
5. Planejar sprints de melhoria técnica
6. Definir métricas de acompanhamento
7. Estabelecer gates de qualidade

## 🔗 Integração com Outros Especialistas

### Recebe de:
- **Debugging e Troubleshooting** → Bug reports, logs de erros
- **Documentação Técnica** → Documentação existente (se houver)
- **Plano de Execução** → Contexto do projeto

### Entrega para:
- **Migração e Modernização** → Análise para migração
- **Refatoração** → Plano de refatoração detalhado
- **Documentação Técnica** → Arquitetura documentada
- **Plano de Execução** → Histórias de melhoria técnica
- **Análise de Testes** → Gaps de cobertura identificados
- **Segurança da Informação** → Vulnerabilidades encontradas

## 🚀 Começando

1. **Leia o SKILL.md** para visão geral rápida
2. **Revise exemplos** em `resources/examples/exploration-examples.md`
3. **Use templates** em `resources/templates/`
4. **Consulte guia** em `resources/reference/exploration-guide.md` para dúvidas
5. **Valide qualidade** com `resources/checklists/exploration-validation.md`

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte `resources/reference/exploration-guide.md` seção Troubleshooting
- Revise exemplos práticos em `resources/examples/`
- Verifique MCP_INTEGRATION.md para detalhes técnicos

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team
