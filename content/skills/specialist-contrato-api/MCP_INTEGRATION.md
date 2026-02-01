# Integração MCP - Contrato de API

**Versão:** 2.0  
**Última Atualização:** 31/01/2026

---

## 🤖 Funções MCP Disponíveis

### **1. init_api_contract**

**Propósito:** Inicializar contrato OpenAPI a partir de requisitos e modelo de domínio

**Input:**
```typescript
{
  requisitos: string;
  modeloDominio: string;
  arquitetura: string;
  stack: {
    frontend: string;    // "React", "Vue", etc.
    backend: string;     // "NestJS", "Express", etc.
    database: string;    // "PostgreSQL", "MongoDB", etc.
  };
}
```

**Output:**
```typescript
{
  openapi: string;         // OpenAPI 3.0 YAML
  endpoints: Endpoint[];   // Lista de endpoints
  schemas: Schema[];       // Schemas reutilizáveis
  version: string;         // Versão semântica
}
```

---

### **2. validate_api_contract**

**Propósito:** Validar contrato OpenAPI e gerar score de qualidade

**Input:**
```typescript
{
  openapi: string;         // OpenAPI YAML
  strictMode?: boolean;    // Modo rigoroso
}
```

**Output:**
```typescript
{
  score: number;           // 0-100
  aprovado: boolean;       // true se >= 75
  detalhes: {
    schemaOpenAPI: { score: number; itens: ChecklistItem[]; };
    typesEDTOs: { score: number; itens: ChecklistItem[]; };
    mocks: { score: number; itens: ChecklistItem[]; };
    documentacao: { score: number; itens: ChecklistItem[]; };
    backwardCompatibility: { score: number; itens: ChecklistItem[]; };
  };
  recomendacoes: string[];
}
```

**Checklist (100 pontos):**
- Schema OpenAPI (30 pts): Válido, completo, versionado
- Types e DTOs (25 pts): Gerados sem erros
- Mocks (20 pts): Configurados e funcionais
- Documentação (15 pts): Swagger UI + exemplos
- Backward Compatibility (10 pts): Breaking changes documentados

---

### **3. process_api_contract**

**Propósito:** Gerar types, DTOs e mocks a partir do contrato

**Input:**
```typescript
{
  openapi: string;
  stack: {
    frontend: string;
    backend: string;
  };
  validacao: ValidationResult;
}
```

**Output:**
```typescript
{
  typesFrontend: string;   // TypeScript interfaces
  dtosBackend: string[];   // DTOs com validações
  mockHandlers: string;    // MSW handlers
  swaggerUI: string;       // HTML Swagger UI
  proximaFase: {
    nome: string;
    especialista: string;
    artefatosEntrada: string[];
  };
}
```

---

## 📊 Quality Gates

**Score Mínimo:** 75/100  
**Modo Rigoroso:** 85/100

**Critérios de Bloqueio:**
- OpenAPI inválido (erros de lint)
- Endpoints sem schemas
- Sem exemplos de request/response
- Types com erros TypeScript

---

## 🔄 Fluxo Completo

```typescript
// 1. Inicializar contrato
const contrato = await mcp.initApiContract({
  requisitos, modeloDominio, arquitetura, stack
});

// 2. Validar qualidade
const validacao = await mcp.validateApiContract({
  openapi: contrato.openapi
});

// 3. Se aprovado, processar
if (validacao.aprovado) {
  const resultado = await mcp.processApiContract({
    openapi: contrato.openapi,
    stack,
    validacao
  });
  
  // Salvar artefatos gerados
  await saveGeneratedFiles(resultado);
}
```

---

**Versão:** 2.0  
**Arquitetura:** Skill Descritiva + Automação MCP
