# 📚 Relação Especialistas × Guias Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Objetivo:** Mapear cada especialista documentado no catálogo do Maestro ao(s) guia(s) prático(s) que complementam seu trabalho, indicando cobertura e lacunas.

---

## 🔎 Como interpretar
- **Guia Principal:** guia mais relevante ou obrigatório para o especialista.
- **Guias Complementares:** guias opcionais que ajudam o especialista em cenários específicos.
- **Status:** indica se já existe guia adequado para o especialista ou se há lacuna a ser preenchida.

---

## 🧭 Matriz completa

| Fase | Especialista | Guia Principal | Guias Complementares | Status |
|------|--------------|----------------|----------------------|--------|
| 1. Produto | Gestão de Produto | `Guia de Adição de Novas Funcionalidades` | `Checklist Mestre de Entrega` | ✅ Coberto |
| 2. Requisitos | Engenharia de Requisitos com IA | `Checklist Mestre de Entrega` | `Gates de Qualidade` | ✅ Coberto |
| 3. UX Design | UX Design | *(sem guia dedicado)* | `Checklist Mestre de Entrega`, `Gates de Qualidade` | ⚠️ Lacuna |
| 3. UX Design | Prototipagem Rápida com Google Stitch | `Guia de Prototipagem com IA` | `Guia de Adição de Novas Funcionalidades` | ✅ Coberto |
| 4. Modelo de Domínio | Modelagem e Arquitetura de Domínio | `Guia de Modelagem de Domínio` | `Gates de Qualidade` | ✅ Coberto |
| 5. Banco de Dados | Banco de Dados | `Guia de Migrations Zero-Downtime` | `Guia de Estratégias de Cache` | ✅ Coberto |
| 6. Arquitetura | Arquitetura de Software | `Guia de Multi-tenancy` | `Catálogo de Stacks (Cloud vs Compartilhada)`, `Gates de Qualidade` | ✅ Coberto |
| 7. Segurança | Segurança da Informação | `Gates de Qualidade` | `Checklist Mestre de Entrega` | ✅ Coberto |
| 8. Testes | Análise de Testes | `Guia de Chaos Engineering` | `Checklist Mestre de Entrega`, `Gates de Qualidade` | ✅ Coberto |
| 9. Execução | Plano de Execução com IA | `Checklist Mestre de Entrega` | `Gates de Qualidade`, `Guia de Adição de Novas Funcionalidades` | ✅ Coberto |
| 9. Execução | Contrato de API | `Guia de Design de API` | `Gates de Qualidade` | ✅ Coberto |
| 10. FE Dev | Desenvolvimento Frontend | `Guia de Componentes Frontend` | `Guia de Debugging com IA`, `Checklist Mestre de Entrega` | ✅ Coberto |
| 11. BE Dev | Desenvolvimento e Vibe Coding Estruturado | `Guia de Debugging com IA` | `Guia de Refatoração de Código Legado`, `Guia de Estratégias de Cache`, `Checklist Mestre de Entrega` | ✅ Coberto |
| 12. DevOps | DevOps e Infraestrutura | `Guia de Otimização de Custos Cloud` | `Guia de Chaos Engineering`, `Guia de SLOs e Error Budgets`, `Workflows Avançados`, `Multi-IDE Support` | ✅ Coberto |
| 13. Dados | Dados e Analytics com IA | `Guia de Analytics com IA` | `Guia de Estratégias de Cache`, `Métricas de Eficiência com IA` | ✅ Coberto |
| 14. Documentação | Documentação Técnica | `Checklist Mestre de Entrega` | `Guia de Validação` | ✅ Coberto |
| 14. Documentação | Acessibilidade | `Guia de Acessibilidade Digital` | `Gates de Qualidade`, `Checklist Mestre de Entrega` | ✅ Coberto |
| 15. Debug | Debugging e Troubleshooting | `Guia de Debugging com IA` | `Guia de Refatoração de Código Legado`, `Guia de Validação` | ✅ Coberto |
| 16. Mobile | Desenvolvimento Mobile | `Guia de Desenvolvimento Mobile` | `Guia de Adição de Novas Funcionalidades`, `Checklist Mestre de Entrega` | ✅ Coberto |
| 17. Exploração | Exploração de Codebase | `Guia de Refatoração de Código Legado` | `Guia de Debugging com IA`, `Guia de Validação` | ✅ Coberto |
| Avançado | Arquitetura Avançada | `Guia de Multi-tenancy` | `Catálogo de Stacks`, `Guia de Estratégias de Cache` | ✅ Coberto |
| Avançado | Performance e Escalabilidade | `Guia de Estratégias de Cache` | `Guia de SLOs e Error Budgets`, `Guia de Otimização de Custos Cloud` | ✅ Coberto |
| Avançado | Observabilidade | `Guia de SLOs e Error Budgets` | `Guia de Chaos Engineering`, `Métricas de Eficiência com IA` | ✅ Coberto |
| Avançado | Migração e Modernização | `Guia de Refatoração de Código Legado` | `Guia de Migrations Zero-Downtime`, `Guia de Otimização de Custos Cloud` | ✅ Coberto |
| Avançado | Mobile Design | `Guia de Arquitetura Mobile` | `Guia de Adição de Novas Funcionalidades`, `Catálogo de Stacks` | ✅ Coberto |

---

## 📌 Notas importantes
1. **UX Design:** ainda carece de guia dedicado; depende de checklists genéricas. Recomendação: criar "Guia de Design System".
2. **Todas as outras lacunas foram preenchidas:** foram criados guias dedicados para Prototipagem, Modelo de Domínio, Contrato de API, Frontend, Dados, Acessibilidade, Mobile e Arquitetura Mobile Avançada.
3. **Cobertura completa:** atualmente 24 de 25 especialistas possuem guias dedicados (96% de cobertura).
4. **Guias criados recentemente:**
   - `Guia de Prototipagem com IA` - para especialista de Prototipagem Rápida
   - `Guia de Modelagem de Domínio` - para especialista de Modelo de Domínio
   - `Guia de Design de API` - para especialista de Contrato de API
   - `Guia de Componentes Frontend` - para especialista de Desenvolvimento Frontend
   - `Guia de Analytics com IA` - para especialista de Dados e Analytics
   - `Guia de Acessibilidade Digital` - para especialista de Acessibilidade
   - `Guia de Desenvolvimento Mobile` - para especialista de Desenvolvimento Mobile
   - `Guia de Arquitetura Mobile` - para especialista avançado de Mobile Design

---

## ✅ Próximos passos sugeridos
1. **Criar Guia de Design System** para UX Design (única lacuna restante).
2. **Publicar exemplos práticos** para todos os guias criados.
3. **Criar scripts de validação** automática para verificar aplicação dos guias.
4. **Integrar guias com prompts** existentes para maior sinergia.
5. **Treinar equipe** no uso dos novos guias dedicados.
6. **Monitorar adoção** e coletar feedback para melhorias contínuas.
7. **Manter documentação atualizada** com as evoluções do ecossistema Maestro.
