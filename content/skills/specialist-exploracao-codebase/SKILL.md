---
name: specialist-exploracao-codebase
description: "Exploração sistemática de codebase para mapear estrutura, dívida técnica e oportunidades de refatoração."
allowed-tools: Read, Write, Edit, Glob, Grep
version: "1.0.0"
framework: progressive-disclosure
type: "specialist"
category: "complementar"
complexity: "media"
estimated_time: "90 minutos"
score_minimo: 75
tags: ["codebase", "exploration", "technical-debt", "refactoring", "documentation", "analysis"]
dependencies: ["Codebase existente", "Debugging e Troubleshooting", "Documentação Técnica"]
slug: exploracao-codebase
---

# Especialista: Exploração de Codebase

## 🎯 Visão Geral

Este especialista auxilia na análise sistemática de codebases existentes, identificando estrutura, padrões, dívida técnica e oportunidades de melhoria. Gera documentação completa e planos de refatoração baseados em análise profunda do código.

**Quando Usar:**
- Ao iniciar trabalho em codebase legado ou desconhecido
- Antes de grandes refatorações ou migrações
- Para documentar arquitetura de sistemas existentes
- Quando precisa identificar dívida técnica
- Para onboarding de novos desenvolvedores

**Não Usar Quando:**
- Codebase ainda não existe (use especialistas de desenvolvimento)
- Projeto é muito pequeno (< 1000 linhas)
- Apenas debugging pontual (use Debugging e Troubleshooting)

## 📋 Processo de 3 Fases

### Fase 1: Scan (25 min)
**Objetivo:** Análise automática da estrutura do código

**Ações:**
- Escanear estrutura de diretórios
- Identificar linguagens e frameworks
- Mapear dependências principais
- Contar métricas básicas (LOC, arquivos, módulos)
- Detectar padrões arquiteturais

**Entregável:** Mapa estrutural do codebase

**Função MCP:** `scan_codebase_structure`

### Fase 2: Analyze (40 min)
**Objetivo:** Identificação de padrões, debt e oportunidades

**Ações:**
- Analisar qualidade do código
- Identificar code smells
- Calcular dívida técnica
- Mapear dependências complexas
- Identificar componentes críticos
- Avaliar cobertura de testes

**Entregável:** Relatório de análise técnica

**Template:** Ver `resources/templates/technical-debt-report.md`

**Função MCP:** `analyze_technical_debt`

### Fase 3: Document (25 min)
**Objetivo:** Geração de mapa e recomendações

**Ações:**
- Gerar mapa visual do codebase
- Documentar arquitetura descoberta
- Criar plano de refatoração priorizado
- Documentar decisões arquiteturais inferidas
- Gerar guia de navegação

**Entregável:** Codebase map + plano de refatoração

**Templates:** Ver `resources/templates/codebase-map.md` e `refactoring-plan.md`

**Função MCP:** `generate_codebase_map`

## 🔧 Funções MCP Disponíveis

### scan_codebase_structure
Escaneia estrutura do codebase e identifica padrões.

**Quando usar:** Início da Fase 1 (Scan)

**Saída:** Estrutura de diretórios, linguagens, frameworks, métricas

### analyze_technical_debt
Analisa qualidade e identifica dívida técnica.

**Quando usar:** Durante Fase 2 (Analyze)

**Saída:** Score de qualidade, code smells, recomendações

### generate_codebase_map
Gera mapa visual e documentação do codebase.

**Quando usar:** Ao final da Fase 3 (Document)

**Saída:** Mapa visual, arquitetura, plano de refatoração

**Detalhes:** Ver `MCP_INTEGRATION.md` para parâmetros completos

## 📚 Progressive Disclosure

### Para Aprender Mais
- **Exemplos Práticos:** `resources/examples/exploration-examples.md`
  - 5 cenários completos (Monolito, Microserviços, Frontend SPA, Mobile, Legacy)

- **Checklist de Validação:** `resources/checklists/exploration-validation.md`
  - Sistema de pontuação (100 pontos)
  - Score mínimo: 75 pontos

- **Guia Completo:** `resources/reference/exploration-guide.md`
  - Técnicas de análise de código
  - Ferramentas de análise estática
  - Padrões arquiteturais comuns
  - Identificação de code smells
  - Cálculo de dívida técnica

### Templates Disponíveis
- `resources/templates/codebase-map.md` - Mapa do codebase
- `resources/templates/technical-debt-report.md` - Relatório de dívida técnica
- `resources/templates/refactoring-plan.md` - Plano de refatoração

## 💡 Exemplo Rápido

**Cenário:** Monolito Node.js legado

**Input:**
```
Codebase: 50k LOC, Node.js + Express
Estrutura: src/ com 200+ arquivos
Testes: 30% cobertura
Idade: 3 anos
```

**Processo:**
1. **Scan (25 min):** Identificar 15 módulos principais, Express + MongoDB
2. **Analyze (40 min):** Detectar 45 code smells, debt score 62/100
3. **Document (25 min):** Gerar mapa, plano de refatoração em 3 fases

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

## 📊 Métricas de Sucesso

- **Tempo Total:** ~90 minutos (vs 4-8 horas manual)
- **Cobertura:** 100% do codebase mapeado
- **Precisão:** >90% na identificação de padrões
- **Utilidade:** >85% das recomendações implementadas

## ✅ Próximos Passos

Após conclusão da exploração:
1. Compartilhar codebase map com equipe
2. Priorizar itens de dívida técnica
3. Criar histórias de refatoração
4. Atualizar documentação arquitetural
5. Planejar sprints de melhoria técnica

## 🔗 Integração com Outros Especialistas

**Recebe de:**
- Debugging e Troubleshooting → Bug reports, logs
- Documentação Técnica → Docs existentes

**Entrega para:**
- Migração e Modernização → Análise para migração
- Refatoração → Plano de refatoração
- Documentação Técnica → Arquitetura documentada
- Plano de Execução → Histórias de melhoria técnica

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team