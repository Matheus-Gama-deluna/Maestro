# Especialista em Contrato de API

**Versão:** 2.0  
**Última Atualização:** 31/01/2026  
**Status:** ✅ Estrutura Moderna Completa

---

## 📋 Visão Geral

Especialista em definir contratos de API usando OpenAPI/Swagger, garantindo que frontend e backend compartilhem a mesma fonte de verdade através de contract-first development com mocks, types gerados e validação automatizada.

### **Quando Usar**

- **Fase:** Fase 9 - Contrato de API
- **Após:** Requisitos, Modelo de Domínio e Arquitetura definidos
- **Antes:** Desenvolvimento Frontend e Backend
- **Workflows:** `/implementar-historia`, `/refatorar-codigo`

### **Valor Entregue**

- Contrato OpenAPI 3.0 completo e validado
- Types TypeScript gerados para frontend
- DTOs gerados para backend
- Mock server configurado (MSW, json-server ou Prism)
- Documentação interativa (Swagger UI)
- Versionamento semântico definido

---

## 📥 Artefatos de Entrada

| Artefato | Localização | Obrigatório |
|----------|-------------|-------------|
| **Requisitos** | `docs/02-requisitos/requisitos.md` | ✅ Sim |
| **Modelo de Domínio** | `docs/04-modelo/modelo-dominio.md` | ✅ Sim |
| **Arquitetura** | `docs/06-arquitetura/arquitetura.md` | ✅ Sim |
| **Casos de Uso** | Dentro de requisitos | ✅ Sim |
| **Stack Técnica** | Dentro de arquitetura | ✅ Sim |

---

## 📤 Artefatos de Saída

| Artefato | Localização | Descrição |
|----------|-------------|-----------|
| **Contrato API** | `docs/09-api/contrato-api.md` | Especificação OpenAPI completa |
| **OpenAPI YAML** | `docs/09-api/openapi.yaml` | Schema validado |
| **Types Frontend** | `src/types/api.ts` | Interfaces TypeScript |
| **DTOs Backend** | `src/dtos/` | Data Transfer Objects |
| **Mock Handlers** | `mocks/handlers/` | Handlers MSW |

---

## 🎯 Processo de Criação

### **1. Definir Schema OpenAPI**

**Ordem:**
1. Info (title, version, description)
2. Servers (dev, staging, prod)
3. Paths (endpoints com verbos HTTP)
4. Components (schemas reutilizáveis)
5. Security (autenticação)
6. Examples (request/response)

### **2. Gerar Types Frontend**

**Ferramentas:**
- `openapi-typescript` - Gera types TS
- `orval` - Gera hooks React Query
- `swagger-codegen` - Gera SDKs

### **3. Gerar DTOs Backend**

**Padrão NestJS:**
- CreateXxxDto (validação com class-validator)
- UpdateXxxDto (campos opcionais)
- XxxResponseDto (formato de saída)

### **4. Configurar Mock Server**

**Opções:**
- **MSW:** Mock Service Worker (browser + Node)
- **json-server:** API REST rápida
- **Prism:** Mock server OpenAPI nativo

---

## ✅ Quality Gates

### **Checklist Obrigatório (Score Mínimo: 75/100)**

**Schema OpenAPI (30 pontos):**
- [ ] OpenAPI 3.0 válido (sem erros de lint)
- [ ] Todos os endpoints documentados
- [ ] Request/Response schemas definidos
- [ ] Códigos de erro (400, 401, 404, 500)
- [ ] Versionamento semântico

**Types e DTOs (25 pontos):**
- [ ] Types TypeScript gerados sem erros
- [ ] DTOs backend com validações
- [ ] Enums e interfaces reutilizáveis

**Mocks (20 pontos):**
- [ ] Mock server configurado
- [ ] Dados de exemplo realistas
- [ ] Response time < 100ms

**Documentação (15 pontos):**
- [ ] Swagger UI funcionando
- [ ] Exemplos de uso
- [ ] Guia de versionamento

**Backward Compatibility (10 pontos):**
- [ ] Breaking changes documentados
- [ ] Estratégia de migração definida

---

## 🔄 Context Flow

### **Entrada desta Fase**
- Requisitos validados (Engenharia de Requisitos)
- Modelo de domínio aprovado (Modelagem de Domínio)
- Arquitetura definida (Arquitetura de Software)

### **Saída para Próxima Fase**
- Contrato para desenvolvimento Frontend (contra mocks)
- Contrato para desenvolvimento Backend (implementação)
- Types compartilhados entre FE e BE

---

## 📚 Estrutura de Recursos

### **Templates** (`resources/templates/`)
- `contrato-api.md` - Template de documentação
- `api-endpoints.md` - Template de endpoints
- `api-types.md` - Template de types/DTOs

### **Examples** (`resources/examples/`)
- REST API completa (CRUD)
- GraphQL API
- WebSocket API
- gRPC API

### **Checklists** (`resources/checklists/`)
- Validação OpenAPI (100+ pontos)
- Critérios de qualidade
- Score mínimo de 75/100

### **Reference** (`resources/reference/`)
- OpenAPI 3.0 specification
- Contract-first development
- API design patterns
- Versionamento semântico

---

## 🤖 Funções MCP

1. **init_api_contract** - Inicializar contrato OpenAPI
2. **validate_api_contract** - Validar schema e gerar score
3. **process_api_contract** - Gerar types, DTOs e mocks

Ver `MCP_INTEGRATION.md` para detalhes.

---

## 🎓 Skills Complementares

- `api-patterns` - Padrões de API
- `documentation-templates` - Templates de documentação
- `testing-patterns` - Testes de contrato
- `typescript-patterns` - Padrões TypeScript

---

**Versão:** 2.0  
**Framework:** Skills Modernas com Progressive Disclosure  
**Arquitetura:** Skill Descritiva + Automação MCP
