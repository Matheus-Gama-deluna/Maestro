# Gates de Qualidade por Fase

> **Propósito**: Validar que cada fase está completa antes de avançar.
> Use estes checklists como "gates" entre fases.

---

## Como Usar

1. Ao finalizar uma fase, revise o gate correspondente
2. Marque cada item como ✅ ou ❌
3. **Não avance** se houver itens críticos pendentes
4. Documente exceções se forçar avanço

---

## Gate 1: Produto → Requisitos

**Especialista**: Gestão de Produto  
**Artefato**: `docs/01-produto/PRD.md`

### Checklist Obrigatório
- [ ] Problema claramente definido (não genérico)
- [ ] Pelo menos 2 personas com dores documentadas
- [ ] MVP definido com must-have vs nice-to-have
- [ ] Métricas de sucesso (North Star Metric)
- [ ] Riscos principais identificados

### Critérios de Qualidade
- [ ] PRD tem menos de 3 páginas
- [ ] Qualquer pessoa do time entende o problema
- [ ] Não há TBDs ou "a definir"

---

## Gate 2: Requisitos → UX

**Especialista**: Engenharia de Requisitos  
**Artefato**: `docs/02-requisitos/requisitos.md`

### Checklist Obrigatório
- [ ] Todos os RFs têm ID único (RF-001, RF-002...)
- [ ] Todos os RFs são testáveis (têm critério de aceite)
- [ ] RNFs definidos (performance, segurança, disponibilidade)
- [ ] Critérios de aceite em Gherkin para features críticas
- [ ] **Matriz RF × Telas preenchida**

### Critérios de Qualidade
- [ ] Cada RF mapeia para pelo menos um objetivo do PRD
- [ ] Não há requisitos duplicados
- [ ] RNFs são mensuráveis (ex: "99.9% uptime", não "alta disponibilidade")

---

## Gate 3: UX → Modelagem

**Especialista**: UX Design  
**Artefato**: `docs/03-ux/design-doc.md`

### Checklist Obrigatório
- [ ] Jornadas de usuário mapeadas (happy path)
- [ ] Wireframes/fluxos dos fluxos principais
- [ ] Arquitetura de informação definida
- [ ] Considerações de acessibilidade básicas
- [ ] **Mapa de navegação em Mermaid**

### Critérios de Qualidade
- [ ] Fluxos cobrem pelo menos 80% dos RFs
- [ ] Navegação é clara e consistente
- [ ] Estados de erro e loading considerados

---

## Gate 4: Modelagem → Arquitetura

**Especialista**: Modelagem de Domínio  
**Artefato**: `docs/04-modelo/modelo-dominio.md`

### Checklist Obrigatório
- [ ] Entidades principais identificadas
- [ ] Relacionamentos definidos (1-1, 1-N, N-N)
- [ ] Atributos com tipos aproximados
- [ ] Regras de negócio documentadas por entidade

### Critérios de Qualidade
- [ ] Modelo suporta todos os RFs
- [ ] Não há entidades "Deus" (com muitos atributos)
- [ ] Nomenclatura consistente (singular, PascalCase)

---

## Gate 5: Arquitetura → Segurança

**Especialista**: Arquitetura de Software  
**Artefato**: `docs/05-arquitetura/arquitetura.md`

### Checklist Obrigatório
- [ ] Diagrama C4 (mínimo níveis 1-2)
- [ ] Stack tecnológica com justificativas
- [ ] ADRs para decisões críticas (mínimo 2)
- [ ] Estratégia de autenticação definida
- [ ] Modelo de dados detalhado

### Critérios de Qualidade
- [ ] Arquitetura suporta RNFs (escala, performance)
- [ ] Custos estimados para infra
- [ ] Pontos de evolução futura identificados

---

## Gate 6: Segurança → Testes

**Especialista**: Segurança da Informação  
**Artefato**: `docs/06-seguranca/checklist.md`

### Checklist Obrigatório
- [ ] OWASP Top 10 revisado e mitigações definidas
- [ ] Dados sensíveis identificados e classificados
- [ ] Estratégia de autenticação/autorização detalhada
- [ ] Criptografia (em trânsito e em repouso)
- [ ] Rate limiting e proteção contra abuse

### Critérios de Qualidade
- [ ] Conformidade com LGPD/GDPR se aplicável
- [ ] Secrets nunca em código (apenas env vars)
- [ ] Logs não expõem dados sensíveis

---

## Gate 7: Testes → Backlog

**Especialista**: Análise de Testes  
**Artefato**: `docs/07-testes/plano-testes.md`

### Checklist Obrigatório
- [ ] Estratégia de testes definida (pirâmide)
- [ ] Ferramentas escolhidas por tipo de teste
- [ ] Meta de cobertura definida (ex: >80%)
- [ ] Casos críticos identificados com prioridade

### Critérios de Qualidade
- [ ] Todos os RFs têm pelo menos um caso de teste
- [ ] Casos de borda considerados
- [ ] Ambiente de testes definido

---

## Gate 8: Backlog → Implementação

**Especialista**: Plano de Execução  
**Artefato**: `docs/08-backlog/backlog.md`

### Checklist Obrigatório
- [ ] Épicos definidos e priorizados
- [ ] Histórias escritas (Como X, quero Y, para Z)
- [ ] Critérios de aceite por história
- [ ] Definition of Done clara
- [ ] Estimativas (pelo menos T-shirt sizing)
- [ ] **Diagrama de dependências visual**
- [ ] **Telas afetadas mapeadas por feature**

### Critérios de Qualidade
- [ ] Histórias são pequenas (cabem em 1-2 dias)
- [ ] Dependências entre histórias mapeadas
- [ ] MVP priorizável claramente

---

## Resumo Visual

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Produto   │────►│ Requisitos  │────►│     UX      │
│   (Gate 1)  │     │   (Gate 2)  │     │   (Gate 3)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
       ┌───────────────────────────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Modelagem  │────►│ Arquitetura │────►│  Segurança  │
│   (Gate 4)  │     │   (Gate 5)  │     │   (Gate 6)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
       ┌───────────────────────────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Testes    │────►│   Backlog   │────►│ Implementar │
│   (Gate 7)  │     │   (Gate 8)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Quando Forçar Avanço

Em alguns casos, pode ser necessário avançar mesmo com itens pendentes:

> [!CAUTION]
> Documente SEMPRE os itens pulados e o motivo.

### Situações Aceitáveis
- Projeto simples onde item não se aplica
- Sprint curta com prazo apertado (com débito técnico documentado)
- Prova de conceito / protótipo

### Não Aceitável Pular
- Requisitos de segurança críticos
- Autenticação/autorização
- Tratamento de dados sensíveis
