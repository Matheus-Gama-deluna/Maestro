# Especialista em Desenvolvimento Backend

**Versão:** 2.0  
**Última Atualização:** 31/01/2026  
**Status:** ✅ Estrutura Moderna Completa

---

## 📋 Visão Geral

Especialista em implementar lógica de negócio, APIs RESTful, serviços, repositórios e integração com banco de dados seguindo Clean Architecture e SOLID principles, com foco em qualidade, testes e segurança.

### **Quando Usar**

- **Fase:** Fase 9 - Desenvolvimento Backend
- **Após:** Contrato de API definido
- **Antes:** Integração Frontend ↔ Backend
- **Workflows:** `/implementar-historia`, `/refatorar-codigo`

### **Valor Entregue**

- Endpoints implementados conforme contrato OpenAPI
- Lógica de negócio com SOLID principles
- Camadas bem definidas (Controller, Service, Repository)
- Validação de entrada robusta
- Error handling consistente
- Testes unitários e de integração
- Segurança implementada (auth, sanitização)

---

## 📥 Artefatos de Entrada

| Artefato | Localização | Obrigatório |
|----------|-------------|-------------|
| **Contrato API** | `docs/09-api/contrato-api.md` | ✅ Sim |
| **OpenAPI YAML** | `docs/09-api/openapi.yaml` | ✅ Sim |
| **Modelo de Domínio** | `docs/04-modelo/modelo-dominio.md` | ✅ Sim |
| **Arquitetura** | `docs/06-arquitetura/arquitetura.md` | ✅ Sim |
| **História Backend** | `docs/08-backlog/features/BE-*.md` | ✅ Sim |

---

## 📤 Artefatos de Saída

| Artefato | Localização | Descrição |
|----------|-------------|-----------|
| **Controllers** | `src/controllers/` | Endpoints HTTP |
| **Services** | `src/services/` | Lógica de negócio |
| **Repositories** | `src/repositories/` | Acesso a dados |
| **DTOs** | `src/dtos/` | Data Transfer Objects |
| **Entities** | `src/entities/` | Modelos de domínio |
| **Tests** | `src/**/*.spec.ts` | Testes unitários e integração |

---

## 🎯 Processo de Implementação

### **1. Criar DTOs**
- CreateXxxDto (validação com class-validator)
- UpdateXxxDto (campos opcionais)
- XxxResponseDto (formato de saída)

### **2. Criar Entity e Repository**
- Entity com decorators ORM
- Repository com métodos CRUD
- Queries otimizadas

### **3. Implementar Service**
- Lógica de negócio
- Validações de regras
- Tratamento de erros

### **4. Implementar Controller**
- Rotas HTTP
- Validação de entrada
- Documentação Swagger

### **5. Criar Testes**
- Testes unitários (Jest)
- Testes de integração (Supertest)
- Coverage > 80%

---

## ✅ Quality Gates

### **Checklist Obrigatório (Score Mínimo: 75/100)**

**Arquitetura (25 pontos):**
- [ ] Clean Architecture implementada
- [ ] SOLID principles seguidos
- [ ] Dependency Injection configurada

**Implementação (30 pontos):**
- [ ] Endpoints conforme contrato
- [ ] Lógica de negócio implementada
- [ ] Validação de entrada (DTOs)
- [ ] Error handling robusto

**Testes (25 pontos):**
- [ ] Testes unitários (>80% coverage)
- [ ] Testes de integração passando
- [ ] Edge cases cobertos

**Segurança (20 pontos):**
- [ ] Autenticação implementada
- [ ] Autorização por roles
- [ ] Sanitização de entrada
- [ ] SQL injection prevenido

---

## 🔄 Context Flow

### **Entrada desta Fase**
- Contrato API aprovado (Contrato de API)
- Modelo de domínio definido (Modelagem de Domínio)
- História backend pronta (Plano de Execução)

### **Saída para Próxima Fase**
- Backend implementado e testado
- Endpoints prontos para integração
- Documentação Swagger atualizada

---

## 📚 Estrutura de Recursos

### **Templates** (`resources/templates/`)
- `historia-backend.md` - Template de história
- `service-layer.md` - Template de service
- `repository-pattern.md` - Template de repository

### **Examples** (`resources/examples/`)
- CRUD completo (NestJS)
- Authentication service
- Payment integration
- Background jobs
- Caching layer

### **Checklists** (`resources/checklists/`)
- Validação backend (100+ pontos)
- Clean Architecture
- SOLID principles

### **Reference** (`resources/reference/`)
- NestJS best practices
- Clean Architecture guide
- Testing strategies
- Security hardening

---

## 🤖 Funções MCP

1. **init_backend_implementation** - Inicializar estrutura backend
2. **validate_backend_quality** - Validar código e testes
3. **process_backend_to_integration** - Preparar para integração

Ver `MCP_INTEGRATION.md` para detalhes.

---

**Versão:** 2.0  
**Framework:** Skills Modernas com Progressive Disclosure  
**Arquitetura:** Skill Descritiva + Automação MCP
