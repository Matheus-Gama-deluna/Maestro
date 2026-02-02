# Contrato de API - {{NOME_PROJETO}}

**Versão:** {{VERSAO}}  
**Data:** {{DATA}}  
**Status:** 🔄 Em Desenvolvimento

---

## 📋 Informações Gerais

### **API**
- **Nome:** {{NOME_API}}
- **Versão:** {{VERSAO_API}}
- **Base URL:** {{BASE_URL}}
- **Autenticação:** {{TIPO_AUTH}}

### **Stack Técnica**
- **Frontend:** {{STACK_FRONTEND}}
- **Backend:** {{STACK_BACKEND}}
- **Banco de Dados:** {{BANCO_DADOS}}

### **Regra Frontend-First**
- **Contrato validado** antes de qualquer implementação FE/BE
- **Mocks obrigatórios** gerados a partir deste contrato
- **Frontend** deve consumir **somente** mocks do contrato
- **Backend** deve seguir **exatamente** o contrato (alterações → versionamento)

---

## 🔌 Endpoints

### **{{RECURSO_1}}**

#### **GET /api/{{RECURSO_1}}**
**Descrição:** {{DESCRICAO_GET}}

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Itens por página (default: 10)
- `search` (string, opcional): Busca

**Response 200:**
```json
{
  "data": [
    {
      "id": "{{ID}}",
      "{{CAMPO_1}}": "{{VALOR_1}}",
      "{{CAMPO_2}}": "{{VALOR_2}}",
      "createdAt": "2026-01-31T22:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### **POST /api/{{RECURSO_1}}**
**Descrição:** {{DESCRICAO_POST}}

**Request Body:**
```json
{
  "{{CAMPO_1}}": "{{VALOR_1}}",
  "{{CAMPO_2}}": "{{VALOR_2}}"
}
```

**Response 201:**
```json
{
  "id": "{{ID}}",
  "{{CAMPO_1}}": "{{VALOR_1}}",
  "{{CAMPO_2}}": "{{VALOR_2}}",
  "createdAt": "2026-01-31T22:00:00Z"
}
```

**Errors:**
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `409 Conflict`: Recurso já existe

---

## 📦 Schemas

### **{{SCHEMA_1}}**
```typescript
interface {{SCHEMA_1}} {
  id: string;
  {{CAMPO_1}}: string;
  {{CAMPO_2}}: number;
  createdAt: string;
  updatedAt: string;
}
```

### **Create{{SCHEMA_1}}Dto**
```typescript
interface Create{{SCHEMA_1}}Dto {
  {{CAMPO_1}}: string;  // Required
  {{CAMPO_2}}: number;  // Required
}
```

---

## 🔐 Autenticação

**Tipo:** {{TIPO_AUTH}}

**Header:**
```
Authorization: Bearer {{TOKEN}}
```

**Scopes:**
- `read:{{RECURSO}}`: Leitura
- `write:{{RECURSO}}`: Escrita
- `delete:{{RECURSO}}`: Exclusão

---

## 🎯 Versionamento

**Estratégia:** Versionamento Semântico (SemVer)

- **Major (X.0.0):** Breaking changes
- **Minor (0.X.0):** Novas features (backward compatible)
- **Patch (0.0.X):** Bug fixes

**Versão Atual:** {{VERSAO_API}}

---

## 🧪 Mocks

### **MSW Handlers**
```typescript
// mocks/handlers/{{RECURSO}}.ts
export const {{RECURSO}}Handlers = [
  rest.get('/api/{{RECURSO}}', (req, res, ctx) => {
    return res(ctx.json({
      data: [/* mock data */],
      meta: { total: 10, page: 1, limit: 10 }
    }));
  }),
  
  rest.post('/api/{{RECURSO}}', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({
      id: 'mock-id',
      ...req.body,
      createdAt: new Date().toISOString()
    }));
  }),
];
```

---

**Próxima Ação:** Gerar types e implementar endpoints
