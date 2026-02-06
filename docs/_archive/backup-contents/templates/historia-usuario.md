# História de Usuário: US[NNN]

---

## Descrição

**Como** [persona/tipo de usuário],  
**Quero** [ação ou funcionalidade desejada],  
**Para** [benefício ou valor obtido].

---

## Metadados

| Campo | Valor |
|---|---|
| **ID** | US[NNN] |
| **Épico** | E[NNN] - [Nome] |
| **Prioridade** | P0 (Must) / P1 (Should) / P2 (Could) |
| **Pontos** | [Estimativa] |
| **Sprint** | [Número] |
| **Requisitos** | RF[NNN], RF[NNN] |
| **Responsável** | [Nome] |
| **Status** | To Do / In Progress / Review / Done |

---

## Critérios de Aceite

### Cenário 1: [Happy Path]
```gherkin
Dado que [contexto/pré-condição]
  E [outra condição se necessário]
Quando [ação do usuário]
Então [resultado esperado]
  E [outro resultado se necessário]
```

### Cenário 2: [Caso de Erro]
```gherkin
Dado que [contexto]
  E [condição que causa erro]
Quando [ação do usuário]
Então [comportamento de erro esperado]
  E [mensagem exibida]
```

### Cenário 3: [Edge Case]
```gherkin
Dado que [condição de borda]
Quando [ação]
Então [comportamento esperado]
```

---

## Regras de Negócio

- **RN1**: [Regra que se aplica a esta história]
- **RN2**: [Outra regra]

---

## Design / Wireframes

- Link para Figma: [URL]
- Telas afetadas: [Lista]

---

## Notas Técnicas

### Impacto no Modelo
- [ ] Nova entidade: [Nome]
- [ ] Alteração em: [Nome]
- [ ] Novo campo: [tabela.campo]

### Endpoints Afetados
| Método | Rota | Descrição |
|---|---|---|
| POST | /api/[recurso] | Criar [recurso] |
| GET | /api/[recurso]/:id | Buscar [recurso] |

### Dependências
- US[NNN] deve estar pronta antes
- Integração com [sistema externo] necessária

### Riscos Técnicos
- [Risco identificado e como mitigar]

---

## Subtarefas

- [ ] Criar migration para novo campo
- [ ] Implementar service
- [ ] Implementar controller/endpoint
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Atualizar documentação da API
- [ ] Code review
- [ ] Deploy em staging
- [ ] Teste de aceite com PO

---

## Definição de Pronto (DoD)

- [ ] Todos os critérios de aceite validados
- [ ] Testes unitários (cobertura > 80%)
- [ ] Testes de integração para fluxos principais
- [ ] Code review aprovado
- [ ] Build verde no CI
- [ ] Deploy em staging bem-sucedido
- [ ] Documentação atualizada
- [ ] Aceite do PO

---

## Histórico

| Data | Autor | Mudança |
|---|---|---|
| YYYY-MM-DD | [Nome] | Criação |
| YYYY-MM-DD | [Nome] | [Alteração] |
