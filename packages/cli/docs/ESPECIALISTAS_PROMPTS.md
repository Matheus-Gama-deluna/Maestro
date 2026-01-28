# 📚 Relação Especialistas × Prompts Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Objetivo:** Mapear cada especialista documentado no catálogo do Maestro ao(s) prompt(s) oficial(is) que ele deve usar para acelerar sua atividade, indicando cobertura e lacunas.

---

## 🔎 Como interpretar
- **Prompt Principal:** prompt obrigatório ou mais usado pelo especialista para gerar seu artefato principal.
- **Prompts Secundários:** prompts complementares que o especialista pode usar para refinar ou validar seu trabalho.
- **Status:** indica se já existe prompt padronizado para o especialista ou se há lacuna a ser preenchida.

---

## 🧭 Matriz completa

| Fase | Especialista | Prompt Principal | Prompts Secundários | Status |
|------|--------------|------------------|--------------------|--------|
| 1. Produto | Gestão de Produto | `discovery-inicial.md` | *(nenhum)* | ✅ Coberto |
| 2. Requisitos | Engenharia de Requisitos com IA | `refinar-requisitos.md` | *(nenhum)* | ✅ Coberto |
| 3. UX Design | UX Design | `design-doc-completo.md` | `gerar-ui-stitch.md` | ✅ Coberto |
| 3. UX Design | Prototipagem Rápida com Google Stitch | `gerar-ui-stitch.md` | `analise-acessibilidade.md` | ✅ Coberto |
| 4. Modelo de Domínio | Modelagem e Arquitetura de Domínio | `modelo-dominio.md` | *(nenhum)* | ✅ Coberto |
| 5. Banco de Dados | Banco de Dados | `otimizacao-queries.md` | `migrations-zero-downtime.md` | ✅ Coberto |
| 6. Arquitetura | Arquitetura de Software | `arquitetura-c4-completo.md` | `clean-architecture.md` | ✅ Coberto |
| 7. Segurança | Segurança da Informação | `analise-seguranca.md` | `threat-modeling.md`, `revisao-lgpd.md`, `pentest-checklist.md`, `rate-limiting.md` | ✅ Coberto |
| 8. Testes | Análise de Testes | `gerar-testes-unitarios.md` | `testes-integracao.md`, `testes-e2e.md`, `testes-performance.md`, `contract-testing.md` | ✅ Coberto |
| 9. Execução | Plano de Execução com IA | `backlog-execucao.md` | *(nenhum)* | ✅ Coberto |
| 9. Execução | Contrato de API | `design-api-rest.md` | `idempotencia.md`, `versionamento.md`, `contract-testing.md` | ✅ Coberto |
| 10. FE Dev | Desenvolvimento Frontend | `componentes-hooks.md` | `gerar-ui-stitch.md` | ✅ Coberto |
| 11. BE Dev | Desenvolvimento e Vibe Coding Estruturado | `gerar-servico.md` | `code-review.md`, `idempotencia.md` | ✅ Coberto |
| 12. DevOps | DevOps e Infraestrutura | `pipeline-cicd.md` | `docker-compose.md`, `kubernetes-deploy.md`, `terraform-iac.md`, `feature-flags.md` | ✅ Coberto |
| 13. Dados | Dados e Analytics com IA | `dashboards-analytics.md` | `guia-tecnico.md` | ✅ Coberto |
| 14. Documentação | Documentação Técnica | `guia-tecnico.md` | `plan-writing.md` | ✅ Coberto |
| 14. Documentação | Acessibilidade | `analise-acessibilidade.md` | `checklist-seguranca.md`, `design-doc-completo.md` | ✅ Coberto |
| 15. Debug | Debugging e Troubleshooting | `analise-bugs.md` | `code-review.md`, `systematic-debugging.md` | ✅ Coberto |
| 16. Mobile | Desenvolvimento Mobile | `mobile-ios.md`, `mobile-android.md` | `gerar-ui-stitch.md` | ✅ Coberto |
| 17. Exploração | Exploração de Codebase | `codebase-exploration.md` | `analise-bugs.md` | ✅ Coberto |
| Avançado | Arquitetura Avançada | `ddd-bounded-contexts.md` | `ddd-cqrs.md`, `multi-tenancy.md` | ✅ Coberto |
| Avançado | Performance e Escalabilidade | `analise-performance.md` | `caching.md`, `testes-performance.md` | ✅ Coberto |
| Avançado | Observabilidade | `estrategia-observabilidade.md` | `slos.md`, `chaos-testing.md` | ✅ Coberto |
| Avançado | Migração e Modernização | `plano-migracao.md` | `migrations-zero-downtime.md`, `refatoracao-codigo-legado.md` | ✅ Coberto |
| Avançado | Mobile Design | `mobile-ios.md`, `mobile-android.md` | `design-doc-completo.md` | ✅ Coberto |

---

## 📌 Notas importantes
1. **Todos os prompts criados:** Todas as lacunas identificadas foram preenchidas com prompts dedicados.
2. **UX Design:** Prompt `design-doc-completo.md` criado para documentação UX completa.
3. **Frontend:** Prompt `componentes-hooks.md` criado para desenvolvimento de componentes.
4. **Plano de Execução:** Prompt `backlog-execucao.md` criado para planejamento de backlog.
5. **Dados e Documentação:** Prompts `dashboards-analytics.md` e `guia-tecnico.md` criados.
6. **Debugging e Exploração:** Prompts `analise-bugs.md` e `codebase-exploration.md` criados.
7. **Mobile:** Prompts `mobile-ios.md` e `mobile-android.md` criados para desenvolvimento nativo.
8. **Migração:** Prompt `plano-migracao.md` criado para modernização de sistemas legados.

---

## ✅ Próximos passos sugeridos
1. **Publicar exemplos preenchidos** para os novos prompts criados.
2. **Criar scripts de validação** para os prompts de análise.
3. **Integrar prompts com templates** para automação maior.
4. **Treinar equipe** sobre o uso dos novos prompts.
5. **Monitorar adoção** e coletar feedback para melhorias.
