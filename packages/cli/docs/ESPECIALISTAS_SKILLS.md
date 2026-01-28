# 📚 Relação Especialistas × Skills Maestro

**Versão:** 1.1  
**Data:** 2026-01-28  
**Objetivo:** Mapear cada especialista documentado no catálogo do Maestro à sua skill dedicada (skill.specialist-*) e às skills técnicas complementares, indicando cobertura total.

---

## 🔎 Como interpretar
- **Skill Principal:** skill dedicada do especialista (skill.specialist-*), agora a fonte primária de contexto.
- **Skills Complementares:** skills técnicas opcionais para cenários especializados.
- **Status:** cobertura total alcançada com a criação das skills de especialistas.

---

## 🧭 Matriz completa

| Fase | Especialista | Skill Principal | Skills Complementares | Status |
|------|--------------|----------------|----------------------|--------|
| 1. Produto | Gestão de Produto | `skill.specialist-gestao-produto` | `plan-writing`, `brainstorming` | ✅ Coberto |
| 2. Requisitos | Engenharia de Requisitos com IA | `skill.specialist-engenharia-requisitos-ia` | `plan-writing`, `documentation-templates` | ✅ Coberto |
| 3. UX Design | UX Design | `skill.specialist-ux-design` | `frontend-design`, `animation-guide`, `mobile-design` | ✅ Coberto |
| 3. UX Design | Prototipagem Rápida com Google Stitch | `skill.specialist-prototipagem-stitch` | `frontend-design`, `animation-guide`, `react-patterns` | ✅ Coberto |
| 4. Modelo de Domínio | Modelagem e Arquitetura de Domínio | `skill.specialist-modelagem-dominio` | `database-design`, `architecture` | ✅ Coberto |
| 5. Banco de Dados | Banco de Dados | `skill.specialist-banco-dados` | `database-design`, `performance-profiling` | ✅ Coberto |
| 6. Arquitetura | Arquitetura de Software | `skill.specialist-arquitetura-software` | `architecture`, `database-design`, `api-patterns`, `intelligent-routing` | ✅ Coberto |
| 7. Segurança | Segurança da Informação | `skill.specialist-seguranca-informacao` | `vulnerability-scanner`, `red-team-tactics`, `security` | ✅ Coberto |
| 8. Testes | Análise de Testes | `skill.specialist-analise-testes` | `testing-patterns`, `tdd-workflow`, `code-review-checklist`, `webapp-testing` | ✅ Coberto |
| 9. Execução | Plano de Execução com IA | `skill.specialist-plano-execucao-ia` | `plan-writing`, `documentation-templates`, `brainstorming` | ✅ Coberto |
| 9. Execução | Contrato de API | `skill.specialist-contrato-api` | `api-patterns`, `documentation-templates`, `testing-patterns` | ✅ Coberto |
| 10. FE Dev | Desenvolvimento Frontend | `skill.specialist-desenvolvimento-frontend` | `react-patterns`, `frontend-design`, `tailwind-patterns`, `nextjs-best-practices`, `animation-guide` | ✅ Coberto |
| 11. BE Dev | Desenvolvimento e Vibe Coding Estruturado | `skill.specialist-desenvolvimento-backend` | `clean-code`, `nodejs-best-practices`, `python-patterns`, `api-patterns`, `database-design` | ✅ Coberto |
| 12. DevOps | DevOps e Infraestrutura | `skill.specialist-devops-infra` | `deployment-procedures`, `server-management`, `powershell-windows`, `bash-linux` | ✅ Coberto |
| 13. Dados | Dados e Analytics com IA | `skill.specialist-dados-analytics-ia` | `database-design`, `performance-profiling` | ✅ Coberto |
| 14. Documentação | Documentação Técnica | `skill.specialist-documentacao-tecnica` | `documentation-templates`, `plan-writing`, `clean-code` | ✅ Coberto |
| 14. Documentação | Acessibilidade | `skill.specialist-acessibilidade` | `frontend-design`, `webapp-testing` | ✅ Coberto |
| 15. Debug | Debugging e Troubleshooting | `skill.specialist-debugging-troubleshooting` | `systematic-debugging`, `performance-profiling`, `vulnerability-scanner` | ✅ Coberto |
| 16. Mobile | Desenvolvimento Mobile | `skill.specialist-desenvolvimento-mobile` | `mobile-design`, `game-development`, `i18n-localization` | ✅ Coberto |
| 17. Exploração | Exploração de Codebase | `skill.specialist-exploracao-codebase` | `clean-code`, `systematic-debugging`, `code-review-checklist` | ✅ Coberto |
| Avançado | Arquitetura Avançada | `skill.specialist-arquitetura-avancada` | `architecture`, `database-design`, `api-patterns`, `intelligent-routing`, `app-builder` | ✅ Coberto |
| Avançado | Performance e Escalabilidade | `skill.specialist-performance-escalabilidade` | `performance-profiling`, `systematic-debugging`, `database-design`, `deployment-procedures` | ✅ Coberto |
| Avançado | Observabilidade | `skill.specialist-observabilidade` | `performance-profiling`, `deployment-procedures`, `systematic-debugging` | ✅ Coberto |
| Avançado | Migração e Modernização | `skill.specialist-migracao-modernizacao` | `clean-code`, `database-design`, `deployment-procedures`, `systematic-debugging` | ✅ Coberto |
| Avançado | Mobile Design | `skill.specialist-mobile-design-avancado` | `mobile-design`, `frontend-design`, `game-development`, `i18n-localization` | ✅ Coberto |

---

## 📌 Notas importantes
1. **Skills de especialistas criadas:** cada especialista agora possui sua própria skill (skill.specialist-*), garantindo Progressive Disclosure e contexto específico.
2. **Skills técnicas complementares:** mantidas como suporte (ex: frontend-design, api-patterns, database-design) para cenários especializados.
3. **Integrações existentes:** a maioria dos especialistas possui skills técnicas bem alinhadas, especialmente backend, frontend, arquitetura e DevOps.
4. **Skills cruzadas:** muitos especialistas usam skills de outras categorias (ex: Backend usa clean-code, api-patterns, database-design).
5. **Progressive Disclosure:** skills seguem princípio de carregar apenas quando necessário, otimizando contexto.

---

## ✅ Próximos passos sugeridos
1. **Integrar skills com workflows** para que comandos slash ativem automaticamente a skill do especialista correspondente.
2. **Mapear scripts de validação** específicos por especialista (ex: UX audit para specialist-ux-design).
3. **Integrar skills com prompts** para fluxos mais automatizados.
4. **Criar skills especializadas** para nichos específicos (ex: "mobile-performance", "api-security").
5. **Validar adaptação multi-IDE** usando o SkillAdapter para garantir compatibilidade com Cursor e Antigravity.
