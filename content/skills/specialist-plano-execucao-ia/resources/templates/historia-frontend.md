# FE-{{ID}}: {{TITULO}}

**Épico:** {{EPICO}}  
**Feature:** {{FEATURE}}  
**Tipo:** Frontend  
**Prioridade:** {{PRIORIDADE}}  
**Estimativa:** {{ESTIMATIVA}} dias

---

## 📝 História

**Como** {{PERSONA}},  
**Eu quero** {{ACAO_UI}},  
**Para** {{BENEFICIO}}.

---

## 🎨 Componentes a Criar/Modificar

### **Componentes Novos**
- `{{COMPONENTE_1}}.tsx` - {{DESCRICAO_1}}
- `{{COMPONENTE_2}}.tsx` - {{DESCRICAO_2}}

### **Componentes Modificados**
- `{{COMPONENTE_EXISTENTE}}.tsx` - {{MODIFICACAO}}

---

## 🔌 Integração com API

### **Endpoints Utilizados**
```typescript
// GET /api/{{ENDPOINT_1}}
interface {{RESPONSE_TYPE_1}} {
  {{CAMPOS}}
}

// POST /api/{{ENDPOINT_2}}
interface {{REQUEST_TYPE}} {
  {{CAMPOS}}
}
```

### **Mocks (MSW)**
```typescript
// mocks/handlers/{{FEATURE}}.ts
export const {{FEATURE}}Handlers = [
  rest.get('/api/{{ENDPOINT}}', (req, res, ctx) => {
    return res(ctx.json({{MOCK_DATA}}));
  }),
];
```

---

## ✅ Critérios de Aceite

### **Cenário 1: {{CENARIO_UI_1}}**
```gherkin
Dado que o usuário está em {{PAGINA}}
Quando {{ACAO_UI}}
Então {{RESULTADO_VISUAL}}
```

### **Cenário 2: {{CENARIO_UI_2}}**
```gherkin
Dado que {{ESTADO_INICIAL}}
Quando {{INTERACAO}}
Então {{FEEDBACK_VISUAL}}
```

---

## 🔗 Dependências

- [ ] CONT-{{ID}}: Contrato API definido
- [ ] {{DESIGN_COMPONENT}}: Design aprovado
- [ ] {{DEPENDENCIA_TECNICA}}

---

## 📋 Tarefas Técnicas

- [ ] Criar componentes base
- [ ] Implementar lógica de estado (hooks/store)
- [ ] Integrar com mocks MSW
- [ ] Criar testes unitários (React Testing Library)
- [ ] Criar testes E2E (Playwright/Cypress)
- [ ] Validar responsividade
- [ ] Validar acessibilidade (a11y)

---

## ✅ Definition of Done

- [ ] Componentes implementados e testáveis
- [ ] Integração com mocks funcionando
- [ ] Testes unitários (>80% coverage)
- [ ] Testes E2E passando
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessível (WCAG 2.1 AA)
- [ ] Performance aceitável (Lighthouse >90)
- [ ] Code review aprovado
- [ ] Deploy em staging

---

**Status:** 🔄 Backlog  
**Assignee:** {{ASSIGNEE}}  
**Sprint:** {{SPRINT}}
