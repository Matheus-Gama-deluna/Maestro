# 📚 Relação Especialistas × Templates Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Objetivo:** Mapear cada especialista documentado no catálogo do Maestro ao(s) template(s) oficial(is) usados para gerar seus artefatos principais e de apoio.

---

## 🔎 Como interpretar
- **Template Principal:** estrutura obrigatória que o especialista preenche para entregar seu artefato principal.
- **Templates de Apoio:** arquivos que complementam o trabalho do especialista (contexto compartilhado, matrizes ou extensões específicas).
- **Status:** indica se já existe template padronizado para o especialista ou se há lacuna a ser preenchida.

---

## 🧭 Matriz completa

| Fase | Especialista | Template Principal | Templates de Apoio | Status |
|------|--------------|--------------------|--------------------|--------|
| 1. Produto | Gestão de Produto | `PRD.md` | `contexto.md` | ✅ Coberto |
| 2. Requisitos | Engenharia de Requisitos com IA | `requisitos.md` | `criterios-aceite.md`, `matriz-rastreabilidade.md` | ✅ Coberto |
| 3. UX Design | UX Design | `design-doc.md` | `mapa-navegacao.md`, `contexto.md` | ✅ Coberto |
| 3. UX Design | Prototipagem Rápida com Google Stitch | `prototipo-stitch.md` | `design-doc.md` | ✅ Coberto |
| 4. Modelo de Domínio | Modelagem e Arquitetura de Domínio | `modelo-dominio.md` | `requisitos.md` | ✅ Coberto |
| 5. Banco de Dados | Banco de Dados | `design-banco.md` | `modelo-dominio.md` | ✅ Coberto |
| 6. Arquitetura | Arquitetura de Software | `arquitetura.md` | `adr.md`, `contexto.md` | ✅ Coberto |
| 7. Segurança | Segurança da Informação | `checklist-seguranca.md` | `slo-sli.md` | ✅ Coberto |
| 8. Testes | Análise de Testes | `plano-testes.md` | `matriz-rastreabilidade.md`, `criterios-aceite.md` | ✅ Coberto |
| 9. Execução | Plano de Execução com IA | `backlog.md` | `historia-usuario.md`, `historia-frontend.md`, `historia-backend.md` | ✅ Coberto |
| 9. Execução | Contrato de API | `contrato-api.md` | `contexto.md` | ✅ Coberto |
| 10. FE Dev | Desenvolvimento Frontend | `historia-frontend.md` | `design-doc.md`, `backlog.md` | ✅ Coberto |
| 11. BE Dev | Desenvolvimento e Vibe Coding Estruturado | `historia-backend.md` | `backlog.md`, `requisitos.md` | ✅ Coberto |
| 12. DevOps | DevOps e Infraestrutura | `estado-template.json` | `slo-sli.md`, `contexto.md` | ✅ Coberto |
| 13. Dados | Dados e Analytics com IA | `feature.md` | `slo-sli.md`, `requisitos.md` | ✅ Coberto |
| 14. Documentação | Documentação Técnica | `guia-tecnico.md` | `contexto.md`, `backlog.md` | ✅ Coberto |
| 14. Documentação | Acessibilidade | `checklist-acessibilidade.md` | `checklist-seguranca.md`, `design-doc.md` | ✅ Coberto |
| 15. Debug | Debugging e Troubleshooting | `checklist-debugging.md` | `backlog.md`, `historia-backend.md`, `feature.md` | ✅ Coberto |
| 16. Mobile | Desenvolvimento Mobile | `historia-usuario.md` | `design-doc.md`, `historia-frontend.md` | ✅ Coberto |
| 17. Exploração | Exploração de Codebase | `contexto.md` | `feature.md` | ✅ Coberto |
| Avançado | Arquitetura Avançada | `adr.md` | `arquitetura.md`, `slo-sli.md` | ✅ Coberto |
| Avançado | Performance e Escalabilidade | `slo-sli.md` | `checklist-seguranca.md`, `plano-testes.md` | ✅ Coberto |
| Avançado | Observabilidade | `slo-sli.md` | `estado-template.json`, `contexto.md` | ✅ Coberto |
| Avançado | Migração e Modernização | `feature.md` | `backlog.md`, `historia-backend.md` | ✅ Coberto |
| Avançado | Mobile Design | `design-doc.md` | `mapa-navegacao.md`, `prototipo-stitch.md` | ✅ Coberto |

---

## 📌 Notas importantes
1. **Templates criados:** Todas as lacunas identificadas foram preenchidas com templates dedicados.
2. **Contrato de API:** Template `contrato-api.md` criado com especificação OpenAPI completa.
3. **Acessibilidade:** Template `checklist-acessibilidade.md` criado com validação WCAG 2.1 AA.
4. **Debugging:** Template `checklist-debugging.md` criado com fluxo completo de troubleshooting.
5. **Documentação Técnica:** Template `guia-tecnico.md` criado para documentação aprofundada.
6. **Integração contínua:** `contexto.md` e `estado-template.json` funcionam como "cola" entre fases, garantindo que cada especialista tenha o histórico necessário antes de iniciar sua etapa.

---

## ✅ Próximos passos sugeridos
1. **Publicar exemplos preenchidos** para os novos templates criados.
2. **Criar scripts de validação** para os templates de checklist.
3. **Integrar templates com prompts** para automação maior.
4. **Treinar equipe** sobre o uso dos novos templates.
5. **Monitorar adoção** e coletar feedback para melhorias.
