# 🗺️ Mapeamento de Fases e Recursos

> Guia para selecionar os Especialistas, Templates e Prompts corretos para cada fase do projeto.

---

## 📋 Tabela Mestra

| Fase | Especialista (Persona) | Template (Doc) | Prompts Recomendados |
| :--- | :--- | :--- | :--- |
| **1. Produto** | Gestão de Produto | `PRD.md` | `produto/prd-completo`<br>`produto/north-star` |
| **2. Requisitos** | Engenharia de Requisitos | `requisitos` | `requisitos/analise-requisitos`<br>`requisitos/gherkin` |
| **3. UX Design** | UX Design | `design-doc` | `ux/design-system` |
| **4. Prototipagem** | Prototipagem Stitch | `prototipo-stitch` | `ux/stitch-prompts` (se disponível) |
| **Modelo de Domínio** | Modelagem de Domínio | `modelo-dominio` | `arquitetura/modelo-dominio`<br>`arquitetura/ddd-bounded-contexts` |
| **Banco de Dados** | Banco de Dados | `design-banco` | `database/modelagem-postgres`<br>`database/otimizacao-queries` |
| **Arquitetura** | Arquitetura de Software | `arquitetura` | `arquitetura/clean-architecture`<br>`arquitetura/arquitetura-c4-completo` |
| **Segurança** | Segurança da Informação | `checklist-seguranca` | `seguranca/security-review`<br>`seguranca/auth-patterns` |
| **Testes** | Análise de Testes | `plano-testes` | `testes/plano-testes`<br>`testes/tdd-workflow` |
| **Contrato API** | Contrato de API | `contrato-api` | `apis/openapi-design`<br>`apis/rest-best-practices` |
| **Frontend** | Desenv. Frontend | `historia-usuario` | `desenvolvimento/code-review`<br>`acessibilidade/wcag-checklist` |
| **Backend** | Desenvolvimento | `historia-usuario` | `desenvolvimento/code-review` |
| **Integração** | DevOps e Infra | `arquitetura` | `devops/ci-cd-pipeline` |

---

## 🔍 Como Usar

Ao iniciar uma nova fase (via `/avancar-fase`):

1.  Identifique a **Fase** na tabela acima.
2.  Carregue o **Especialista**: `read_file('content/specialists/...')`.
3.  Carregue o **Template**: `read_file('content/templates/...')`.
4.  Sugira ao usuário carregar os **Prompts Recomendados**: `read_file('content/prompts/[CATEGORIA]/[NOME].md')`.
