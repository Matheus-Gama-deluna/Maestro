# Template: História Backend

## [US-XXX-BE]: [Título da História]

### Tipo: `backend`

### Feature Pai
← [FEAT-XXX: Nome da Feature](../features/FEAT-XXX.md)

### Dependências
| ID | Tipo | Status | Obrigatório |
|----|------|--------|-------------|
| CONT-XXX | Contrato | ⬜ | ✅ Sim |

### Histórias Relacionadas
| ID | Tipo | Relação |
|----|------|---------|
| US-XXX-FE | Frontend | Correspondente |
| INT-XXX | Integração | Depende desta |

---

## Descrição
Como **[sistema/API]**, 
devo **[implementar endpoint/lógica]**,
para **[suportar funcionalidade frontend]**.

## Critérios de Aceite
- [ ] Endpoint responde conforme contrato
- [ ] Validações implementadas
- [ ] Erros tratados corretamente
- [ ] Testes unitários (> 80% coverage)
- [ ] Testes de integração

---

## Contrato a Implementar

```yaml
# Endpoint
[MÉTODO] /[path]

Request:
  - campo1: tipo (validação)
  - campo2: tipo (validação)

Response 200:
  - campo1: tipo
  - campo2: tipo

Response 400:
  - error: string
  - details: object

Response 500:
  - error: string
```

> Referência: [CONT-XXX](../contratos/CONT-XXX.yaml)

---

## Blocos de Implementação

| # | Bloco | Nome | Descrição |
|---|-------|------|-----------|
| 1 | DTO | [CreateXxxDto] | Tipos entrada/saída |
| 2 | Entity | [Xxx] | Modelo de dados |
| 3 | Repository | [XxxRepository] | Camada de dados |
| 4 | Service | [XxxService] | Regra de negócio |
| 5 | Controller | [XxxController] | Endpoint |
| 6 | Teste | [XxxService.spec] | Cobertura |

---

## Regras de Negócio
1. [Regra 1]
2. [Regra 2]
3. [Regra 3]

---

## Notas Técnicas
[Observações relevantes para implementação]
