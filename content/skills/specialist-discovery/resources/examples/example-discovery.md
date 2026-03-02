# Discovery — TaskFlow

> **Fase:** 1 · Discovery  
> **Data:** 2026-03-01  
> **Autor:** Especialista de Discovery + Usuário  
> **Status:** Aprovado

---

## 1. Sumário Executivo

**Problema:** Pequenas e médias empresas (PMEs) com equipes de 5-20 pessoas perdem em média 6h/semana por colaborador alternando entre ferramentas de gestão (email, planilhas, Trello, WhatsApp), resultando em tarefas duplicadas, prazos perdidos e falta de visibilidade do progresso.

**Solução:** TaskFlow é uma plataforma web de gestão de tarefas e projetos que centraliza toda a comunicação e acompanhamento num único lugar, com visão de kanban, timeline e dashboard de progresso em tempo real.

**Impacto esperado:** Reduzir em 50% o tempo gasto em gestão operacional (de 6h para 3h/semana), eliminar tarefas duplicadas e aumentar a entrega dentro do prazo de 60% para 85%.

---

## 2. Problema e Oportunidade

### 2.1 Descrição do Problema

Equipes de PMEs brasileiras usam em média 4.2 ferramentas para gerenciar projetos (pesquisa interna com 50 PMEs). O resultado:

- **6h/semana** por colaborador gastas em "gestão da gestão" (trocar de ferramenta, replicar info)
- **35%** das tarefas são duplicadas entre ferramentas
- **40%** dos prazos são perdidos por falta de visibilidade centralizada
- Custo estimado: **R$ 2.400/mês** por equipe de 10 pessoas (considerando hora produtiva de R$ 60)

### 2.2 Contexto Atual

| Alternativa Atual | Limitação Principal |
|-------------------|---------------------|
| Trello | Sem timeline, sem relatórios, limitado para >10 pessoas |
| Asana | Caro para PMEs brasileiras (US$/pessoa), interface complexa |
| Planilha Google | Sem automação, sem notificações, conflitos de edição |
| WhatsApp + Email | Informação se perde, sem rastreabilidade, zero métricas |

### 2.3 Oportunidade

O mercado de project management tools para PMEs no Brasil é de ~R$ 800M/ano (estimativa baseada em 6M de PMEs, 15% digitalizadas, ticket médio R$ 900/ano). Ferramentas americanas dominam mas são caras e em inglês. Há espaço para uma solução brasileira, em português, com preço agressivo (freemium + R$ 29/usuário/mês).

---

## 3. Personas

### Persona 1: Marina — Gerente de Projetos

| Campo | Descrição |
|-------|-----------|
| **Perfil** | Mulher, 32 anos, gerente de projetos em agência de marketing digital com 15 pessoas |
| **Contexto** | Gerencia 4 projetos simultâneos com equipes de 3-5 pessoas. Usa Trello + Google Sheets + WhatsApp |
| **Job to Be Done** | "Quando estou sobrecarregada com entregas de múltiplos clientes, quero ver o status de tudo num só lugar para não perder prazos e saber quem está bloqueado" |
| **Dor principal** | Perde 8h/semana consolidando status de diferentes ferramentas para reportar a diretoria |
| **Métrica de sucesso** | Reduzir tempo de report de 8h para 1h/semana com dashboard automático |

### Persona 2: Carlos — Desenvolvedor Sênior / Tech Lead

| Campo | Descrição |
|-------|-----------|
| **Perfil** | Homem, 28 anos, tech lead em startup de fintech com equipe de 8 devs |
| **Contexto** | Gerencia sprints de 2 semanas, faz code review, e precisa distribuir tarefas entre júniors e plenos |
| **Job to Be Done** | "Quando estou planejando a sprint, quero ver a capacidade do time e as dependências entre tarefas para distribuir trabalho de forma justa e evitar gargalos" |
| **Dor principal** | Perde 3h/semana em daily standups ineficientes porque ninguém sabe o status real das tarefas |
| **Métrica de sucesso** | Reduzir dailys de 30min para 10min com status visível em tempo real |

---

## 4. Solução e MVP

### 4.1 Visão do Produto

TaskFlow será a ferramenta de gestão de projetos preferida de PMEs brasileiras: simples como Trello, poderosa como Asana, acessível como Google Sheets. Em português, com preço justo e foco em produtividade real.

### 4.2 Funcionalidades do MVP

| # | Funcionalidade | Descrição | Prioridade | Justificativa |
|---|----------------|-----------|------------|---------------|
| 1 | Kanban Board | Quadro com colunas customizáveis (To Do, Doing, Done), drag-and-drop, filtros | Must Have | Core da experiência — é como 80% dos usuários interagem |
| 2 | Gestão de Projetos | Criar projetos, convidar membros, definir roles (admin/member/viewer) | Must Have | Sem isso, não há contexto organizacional |
| 3 | Tarefas com Detalhes | Criar tarefa com título, descrição, responsável, prazo, prioridade, subtarefas, comentários | Must Have | Unidade fundamental do sistema |
| 4 | Dashboard de Progresso | Visão geral: tarefas por status, prazos próximos, carga por membro | Should Have | Resolve a dor #1 de Marina (consolidação de status) |
| 5 | Notificações | Email e in-app para prazos, menções, atribuições | Could Have | Reduz dependência de WhatsApp para avisos |

### 4.3 O que NÃO está no MVP

- App mobile nativo — será web responsivo primeiro (PWA futuro)
- Timeline/Gantt — complexidade alta para MVP, kanban é suficiente
- Integrações (Slack, GitHub, Jira) — via API pública no futuro
- Relatórios exportáveis (PDF/Excel) — dashboard visual é suficiente
- Automações/workflows — regras simples no futuro

---

## 5. Requisitos Funcionais

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-001 | Cadastro e login | Email/senha + Google OAuth. Verificação de email obrigatória | Alta |
| RF-002 | CRUD de projetos | Criar, editar, arquivar projetos. Convidar membros com roles | Alta |
| RF-003 | CRUD de tarefas | Criar tarefa com título, descrição, responsável, prazo, prioridade (P1-P4), labels | Alta |
| RF-004 | Kanban board | Visualização em colunas, drag-and-drop para mover tarefas entre status | Alta |
| RF-005 | Subtarefas | Checklist dentro de uma tarefa, com progresso percentual | Alta |
| RF-006 | Comentários | Comentários em tarefas com menção @usuario | Média |
| RF-007 | Dashboard | Métricas: tarefas por status, prazos próximos (7 dias), carga por membro | Média |
| RF-008 | Filtros e busca | Filtrar tarefas por responsável, prioridade, prazo, label. Busca por texto | Média |
| RF-009 | Notificações in-app | Badge de notificação para menções, atribuições, prazos | Média |
| RF-010 | Perfil do usuário | Avatar, nome, email, preferências de notificação | Baixa |

---

## 6. Requisitos Não-Funcionais

| ID | Categoria | Requisito | Métrica |
|----|-----------|-----------|---------|
| RNF-001 | Performance | Tempo de resposta da API | p95 < 300ms |
| RNF-002 | Performance | Carregamento inicial da aplicação | < 3s em 3G |
| RNF-003 | Disponibilidade | Uptime mensal | 99.5% (< 3.6h downtime/mês) |
| RNF-004 | Escalabilidade | Usuários simultâneos no MVP | 500 |
| RNF-005 | Segurança | Autenticação | JWT com refresh token, bcrypt para senhas |
| RNF-006 | Segurança | Dados | HTTPS obrigatório, dados criptografados em repouso (LGPD) |
| RNF-007 | Usabilidade | Acessibilidade | WCAG 2.1 AA, Lighthouse Accessibility > 90 |
| RNF-008 | Usabilidade | Responsividade | Funcional em mobile (320px+), tablet e desktop |

---

## 7. Métricas de Sucesso

### 7.1 North Star Metric

| Campo | Valor |
|-------|-------|
| **Métrica** | Weekly Active Users (WAU) — usuários que completaram pelo menos 1 tarefa na semana |
| **Meta 3 meses** | 500 WAU |
| **Meta 6 meses** | 2.000 WAU |
| **Como medir** | Evento `task.completed` no analytics, agregado por semana |

### 7.2 KPIs Secundários

| KPI | Meta | Como Medir |
|-----|------|------------|
| Taxa de retenção D7 | > 40% | Cohort: usuários que voltam após 7 dias do cadastro |
| Tempo médio de sessão | > 5 min | Analytics (session duration) |
| Tarefas criadas/usuário/semana | > 5 | Evento `task.created` / WAU |
| NPS | > 40 | Survey in-app trimestral |
| Conversão free → paid | > 5% | Stripe checkout / total de contas free |

---

## 8. Riscos e Mitigações

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|---------------|---------|-----------|
| 1 | Baixa adoção — PMEs preferem WhatsApp | Alta | Alto | Onboarding guiado em 5 min, templates prontos, importação de CSV |
| 2 | Performance degradada com volume | Média | Alto | Load testing com k6 antes do launch, caching em Redis, CDN |
| 3 | Concorrência de ferramentas gratuitas (Trello) | Alta | Médio | Diferencial: português nativo, dashboard automático, preço agressivo |
| 4 | Churn alto nos primeiros 30 dias | Média | Alto | Emails de onboarding automatizados, check-in na semana 1 e 3 |
| 5 | Escopo creep no MVP | Alta | Médio | Backlog congelado após aprovação, features novas vão para v2 |

---

## 9. Timeline e Recursos

| Fase | Duração Estimada | Entregável |
|------|-----------------|------------|
| Design | 1 semana | Design Doc com wireframes e design system |
| Arquitetura | 1 semana | Documento de Arquitetura com stack, schema, ADRs |
| Frontend MVP | 3 semanas | App web funcional com mocks (kanban, dashboard, auth) |
| Backend MVP | 3 semanas | API REST completa (CRUD, auth, notificações) |
| **Total MVP** | **8 semanas** | **TaskFlow v1 em produção** |

### Recursos Necessários

| Recurso | Quantidade | Observação |
|---------|-----------|------------|
| Desenvolvedores | 1 fullstack (ou 1 FE + 1 BE) | Assistidos por IA (Windsurf/Cursor) |
| Designer | Parcial (1 semana) | Wireframes + design system, depois dev assume |
| Infra mensal | ~R$ 100/mês | Vercel (free tier) + Railway ($5) + domínio ($40/ano) |
