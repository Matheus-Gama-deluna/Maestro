# Template: História Frontend

## [US-XXX-FE]: [Título da História]

### Tipo: `frontend`

### Feature Pai
← [FEAT-XXX: Nome da Feature](../features/FEAT-XXX.md)

### Dependências
| ID | Tipo | Status | Obrigatório |
|----|------|--------|-------------|
| CONT-XXX | Contrato | ⬜ | ✅ Sim |

### Histórias Relacionadas
| ID | Tipo | Relação |
|----|------|---------|
| US-XXX-BE | Backend | Correspondente |
| INT-XXX | Integração | Depende desta |

---

## Descrição
Como **[persona]**, 
quero **[ação no frontend]**,
para **[benefício/valor]**.

## Critérios de Aceite
- [ ] [Critério 1]
- [ ] [Critério 2]
- [ ] [Critério 3]
- [ ] Responsivo (mobile-first)
- [ ] Acessível (WCAG AA)

---

## Contrato a Seguir

```yaml
# Endpoint principal
[MÉTODO] /[path]

Request:
  - campo1: tipo
  - campo2: tipo

Response:
  - campo1: tipo
  - campo2: tipo
```

> Referência: [CONT-XXX](../contratos/CONT-XXX.yaml)

---

## Blocos de Implementação

| # | Bloco | Nome | Descrição |
|---|-------|------|-----------|
| 1 | Component | [NomeComponent] | [O que faz] |
| 2 | Hook/Store | [useNome] | [Estado e chamadas] |
| 3 | Page | [/path] | [Composição] |
| 4 | Teste | [NomeComponent.test] | [Cobertura] |

---

## Referências de Design
- Wireframe: [link ou caminho]
- Figma/Design: [link ou caminho]
- Componentes base: [lista]

---

## Notas Técnicas
[Observações relevantes para implementação]
