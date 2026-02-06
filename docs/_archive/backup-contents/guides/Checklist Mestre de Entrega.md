# Checklist Mestre de Entrega

Definition of Done consolidado de todos os especialistas. Use antes de considerar uma feature "pronta".

---

## ✅ Produto
- [ ] História de usuário clara (Como/Quero/Para)
- [ ] Critérios de aceitação definidos
- [ ] Escopo validado com stakeholders

## ✅ Requisitos
- [ ] Requisitos funcionais documentados
- [ ] Requisitos não-funcionais definidos
- [ ] Dúvidas esclarecidas com cliente/PM

## ✅ UX/Design
- [ ] Fluxos de usuário mapeados (happy path + erros)
- [ ] Wireframes/protótipos aprovados
- [ ] Acessibilidade considerada (WCAG AA)

## ✅ Arquitetura
- [ ] Impacto no modelo de domínio analisado
- [ ] Decisões arquiteturais documentadas (ADR)
- [ ] APIs/contratos definidos

## ✅ Código
- [ ] Código implementado seguindo padrões do projeto
- [ ] Code review realizado
- [ ] Sem warnings/erros de linter
- [ ] Commits atômicos com mensagens claras

## ✅ Testes
- [ ] Testes unitários implementados
- [ ] Testes de integração (quando aplicável)
- [ ] Cobertura mínima atingida (ex: 80%)
- [ ] Testes passando no CI

## ✅ Segurança
- [ ] Validação de entrada implementada
- [ ] Sem secrets hardcoded
- [ ] Autenticação/autorização verificadas
- [ ] Vulnerabilidades conhecidas checadas

## ✅ Documentação
- [ ] README atualizado (se necessário)
- [ ] Comentários em código complexo
- [ ] Changelog atualizado
- [ ] API documentada (OpenAPI/Swagger)

## ✅ Deploy
- [ ] Pipeline CI/CD verde
- [ ] Migrations preparadas
- [ ] Rollback planejado
- [ ] Métricas/alertas configurados

---

## Por Fase do Projeto

### MVP / v1
Foque em: Produto, Requisitos, Código, Testes básicos

### Produção
Adicione: Segurança, Deploy, Documentação completa

### Escala
Adicione: Performance, Observabilidade, Disaster Recovery
