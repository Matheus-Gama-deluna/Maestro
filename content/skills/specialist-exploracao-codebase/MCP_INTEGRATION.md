# MCP Integration - Exploração de Codebase

## 📋 Visão Geral

Este documento descreve como o MCP deve implementar as funções de automação para o especialista de Exploração de Codebase. As skills são **puramente descritivas** e não executam código localmente.

## 🎯 Princípios Fundamentais

### Skills Descritivas
- ✅ Skills contêm apenas conhecimento e processos
- ✅ Toda automação é implementada no MCP externo
- ❌ Skills NUNCA executam código localmente

## 🔧 Funções MCP a Implementar

### 1. scan_codebase_structure

**Descrição:**  
Escaneia estrutura do codebase e identifica padrões arquiteturais.

**Quando Chamar:**  
Início da Fase 1 (Scan) do processo de exploração.

**Parâmetros:**
```typescript
interface ScanCodebaseParams {
  codebase_path: string;
  exclude_patterns?: string[];
  max_depth?: number;
  include_hidden?: boolean;
}
```

**Saída Esperada:**
```json
{
  "structure": {
    "total_files": 245,
    "total_directories": 32,
    "total_loc": 50000,
    "languages": {
      "JavaScript": 35000,
      "TypeScript": 12000,
      "CSS": 3000
    }
  },
  "frameworks": ["Express", "React", "MongoDB"],
  "architecture_pattern": "MVC",
  "entry_points": ["src/index.js", "src/server.js"]
}
```

**Threshold:** Score ≥ 75 para aprovação

---

### 2. analyze_technical_debt

**Descrição:**  
Analisa qualidade do código e calcula dívida técnica.

**Quando Chamar:**  
Durante Fase 2 (Analyze) do processo de exploração.

**Parâmetros:**
```typescript
interface AnalyzeTechnicalDebtParams {
  codebase_path: string;
  analysis_depth: 'basic' | 'full';
  thresholds?: {
    complexity?: number;
    duplication?: number;
    coverage?: number;
  };
}
```

**Saída Esperada:**
```json
{
  "score": 62,
  "code_smells": 45,
  "technical_debt_days": 15,
  "metrics": {
    "complexity_avg": 12,
    "duplication_pct": 8,
    "test_coverage_pct": 30
  },
  "recommendations": [
    {
      "priority": "critical",
      "description": "Reduzir complexidade em módulo Auth",
      "effort_days": 3
    }
  ]
}
```

---

### 3. generate_codebase_map

**Descrição:**  
Gera mapa visual e documentação do codebase.

**Quando Chamar:**  
Ao final da Fase 3 (Document) do processo de exploração.

**Parâmetros:**
```typescript
interface GenerateCodebaseMapParams {
  codebase_path: string;
  analysis_results: object;
  output_format: 'markdown' | 'mermaid' | 'json';
}
```

**Saída Esperada:**
```json
{
  "map": "# Codebase Map...",
  "architecture_doc": "# Architecture...",
  "refactoring_plan": "# Refactoring Plan...",
  "score": 85,
  "approved": true
}
```

---

## 📊 Quality Gates

**Score Mínimo:** 75 pontos

### Critérios de Validação

#### Essenciais (60 pontos)
- [ ] Estrutura completa mapeada (20 pontos)
- [ ] Dívida técnica quantificada (20 pontos)
- [ ] Plano de refatoração criado (20 pontos)

#### Importantes (30 pontos)
- [ ] Arquitetura documentada (10 pontos)
- [ ] Code smells identificados (10 pontos)
- [ ] Recomendações priorizadas (10 pontos)

#### Opcionais (10 pontos)
- [ ] Mapa visual gerado (5 pontos)
- [ ] Dependency graph criado (5 pontos)

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro MCP Team
