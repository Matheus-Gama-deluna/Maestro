# Integração MCP - Desenvolvimento Backend

**Versão:** 2.0  
**Última Atualização:** 31/01/2026

---

## 🤖 Funções MCP Disponíveis

### **1. init_backend_implementation**

**Propósito:** Inicializar estrutura backend a partir do contrato API

**Input:**
```typescript
{
  contratoAPI: string;
  modeloDominio: string;
  historiaBackend: string;
  stack: string;  // "NestJS", "Express", etc.
}
```

**Output:**
```typescript
{
  dtos: string[];
  entities: string[];
  services: string[];
  controllers: string[];
  repositories: string[];
  tests: string[];
}
```

---

### **2. validate_backend_quality**

**Propósito:** Validar qualidade do código backend

**Input:**
```typescript
{
  sourceCode: string[];
  tests: string[];
}
```

**Output:**
```typescript
{
  score: number;  // 0-100
  aprovado: boolean;
  detalhes: {
    arquitetura: { score: number; };
    implementacao: { score: number; };
    testes: { score: number; };
    seguranca: { score: number; };
  };
}
```

**Checklist (100 pontos):**
- Arquitetura (25 pts): Clean Architecture, SOLID
- Implementação (30 pts): Endpoints, lógica, validação
- Testes (25 pts): Coverage >80%, integração
- Segurança (20 pts): Auth, sanitização, SQL injection

---

### **3. process_backend_to_integration**

**Propósito:** Preparar backend para integração com frontend

**Input:**
```typescript
{
  implementacao: string[];
  validacao: ValidationResult;
}
```

**Output:**
```typescript
{
  swaggerDocs: string;
  proximaFase: {
    nome: "Integração Frontend ↔ Backend";
    artefatos: string[];
  };
}
```

---

**Score Mínimo:** 75/100  
**Arquitetura:** Skill Descritiva + Automação MCP
