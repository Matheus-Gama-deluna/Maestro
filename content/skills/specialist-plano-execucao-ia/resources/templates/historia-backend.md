# BE-{{ID}}: {{TITULO}}

**Épico:** {{EPICO}}  
**Feature:** {{FEATURE}}  
**Tipo:** Backend  
**Prioridade:** {{PRIORIDADE}}  
**Estimativa:** {{ESTIMATIVA}} dias

---

## 📝 História

**Como** sistema backend,  
**Eu preciso** {{FUNCIONALIDADE}},  
**Para** {{BENEFICIO_TECNICO}}.

---

## 🔌 Endpoints a Implementar

### **{{METODO}} /api/{{ROTA}}**

**Request:**
```typescript
interface {{REQUEST_DTO}} {
  {{CAMPOS_REQUEST}}
}
```

**Response:**
```typescript
interface {{RESPONSE_DTO}} {
  {{CAMPOS_RESPONSE}}
}
```

**Status Codes:**
- `200 OK` - {{DESCRICAO_200}}
- `400 Bad Request` - {{DESCRICAO_400}}
- `401 Unauthorized` - {{DESCRICAO_401}}
- `404 Not Found` - {{DESCRICAO_404}}
- `500 Internal Server Error` - {{DESCRICAO_500}}

---

## 🏗️ Arquitetura

### **Camadas a Implementar**

**Controller:**
```typescript
// src/{{FEATURE}}/{{FEATURE}}.controller.ts
@Controller('{{ROTA}}')
export class {{FEATURE}}Controller {
  @{{METODO}}()
  async {{METODO_NOME}}(@Body() dto: {{REQUEST_DTO}}) {
    return this.service.{{METODO_SERVICE}}(dto);
  }
}
```

**Service:**
```typescript
// src/{{FEATURE}}/{{FEATURE}}.service.ts
@Injectable()
export class {{FEATURE}}Service {
  async {{METODO_SERVICE}}(dto: {{REQUEST_DTO}}): Promise<{{RESPONSE_DTO}}> {
    // Lógica de negócio
  }
}
```

**Repository:**
```typescript
// src/{{FEATURE}}/{{FEATURE}}.repository.ts
@Injectable()
export class {{FEATURE}}Repository {
  async {{METODO_REPOSITORY}}(data: {{ENTITY_DATA}}): Promise<{{ENTITY}}> {
    // Acesso ao banco
  }
}
```

**Entity:**
```typescript
// src/{{FEATURE}}/entities/{{ENTITY}}.entity.ts
@Entity()
export class {{ENTITY}} {
  @PrimaryGeneratedColumn()
  id: number;
  
  {{CAMPOS_ENTITY}}
}
```

---

## ✅ Critérios de Aceite

### **Cenário 1: {{CENARIO_SUCESSO}}**
```gherkin
Dado que {{CONTEXTO_BACKEND}}
Quando {{REQUISICAO}}
Então {{RESPOSTA_ESPERADA}}
E {{EFEITO_COLATERAL}}
```

### **Cenário 2: {{CENARIO_ERRO}}**
```gherkin
Dado que {{CONTEXTO_INVALIDO}}
Quando {{REQUISICAO_INVALIDA}}
Então {{ERRO_ESPERADO}}
```

---

## 🔗 Dependências

- [ ] CONT-{{ID}}: Contrato API definido
- [ ] {{MIGRACAO_DB}}: Migração de banco criada
- [ ] {{DEPENDENCIA_SERVICO}}

---

## 📋 Tarefas Técnicas

- [ ] Criar DTOs (Request/Response)
- [ ] Criar Entity e Repository
- [ ] Implementar Service (lógica de negócio)
- [ ] Implementar Controller
- [ ] Adicionar validação (class-validator)
- [ ] Implementar error handling
- [ ] Criar testes unitários (Jest)
- [ ] Criar testes de integração (Supertest)
- [ ] Documentar API (Swagger)

---

## ✅ Definition of Done

- [ ] Endpoints implementados conforme contrato
- [ ] Lógica de negócio implementada
- [ ] Validação de entrada (DTOs)
- [ ] Error handling robusto
- [ ] Testes unitários (>80% coverage)
- [ ] Testes de integração passando
- [ ] Documentação Swagger atualizada
- [ ] Segurança implementada (auth, sanitização)
- [ ] Logs estruturados
- [ ] Code review aprovado
- [ ] Deploy em staging

---

**Status:** 🔄 Backlog  
**Assignee:** {{ASSIGNEE}}  
**Sprint:** {{SPRINT}}
