# MCP - Migração e Modernização

## Funções

### 1. analyze_legacy_system
**Input:** `{ sourceCode: string; documentation: string; }`  
**Output:** `{ complexity: number; risks: string[]; recommendations: string[]; }`

### 2. create_migration_plan
**Input:** `{ analysis: AnalysisResult; targetStack: string; }`  
**Output:** `{ phases: Phase[]; timeline: string; risks: Risk[]; }`

### 3. validate_migration
**Input:** `{ migratedCode: string; tests: string[]; }`  
**Output:** `{ score: number; aprovado: boolean; issues: string[]; }`

**Score Mínimo:** 75/100
