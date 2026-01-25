# 📏 Regras de Validação Estrutural

> Estas regras definem as SEÇÕES OBRIGATÓRIAS (Headers) que devem existir nos documentos para cada fase.
> A validação deve ser feita via Regex no Header Markdown (`# ...` ou `## ...`).

## 1. Produto (PRD)

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Problema** | `^#{1,2}\s*(problema|problem)` |
| **MVP/Escopo** | `^#{1,2}\s*(funcionalidade|feature|mvp|escopo)` |
| **Usuários** (Base+) | `^#{1,2}\s*(usuário|usuario|user|persona)` |
| **Métricas** (Base+) | `^#{1,2}\s*(métrica|metrica|sucesso|kpi)` |

## 2. Requisitos

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Funcionais** | `^#{1,2}\s*(requisito|requirement|rf\d|funcional)` |
| **Não-Funcionais** | `^#{1,2}\s*(não.?funcional|nfr|rnf|performance|segurança)` |

## 3. UX Design

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Jornadas** | `^#{1,2}\s*(jornada|journey|fluxo|flow)` |
| **Wireframes** | `^#{1,2}\s*(wireframe|protótipo|prototipo|tela|screen)` |

## 4. Banco de Dados

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Schema/Tabelas** | `^#{1,2}\s*(tabela|table|schema|modelo)` |

## 5. Arquitetura

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Diagrama (C4)** | `^#{1,2}\s*(c4|diagrama|arquitetura|architecture)` |
| **Stack** | `^#{1,2}\s*(stack|tecnologia|technology)` |
| **Decisões** | `^#{1,2}\s*(adr|decisão|decision)` |

## 6. Testes

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Estratégia** | `^#{1,2}\s*(estratégia|strategy|plano)` |
| **Casos de Teste** | `^#{1,2}\s*(caso|case|cenário|scenario)` |

## 7. Contratos API

| Seção Obrigatória | Regex Sugerida |
| :--- | :--- |
| **Endpoints** | `^#{1,2}\s*(endpoint|api|openapi|swagger)` |

---

## ⚙️ Instrução de Validação

Ao validar um entregável:
1.  Verifique a fase.
2.  Busque cada **Header** obrigatório usando a regex (case insensitive).
3.  Se faltar algum, o Gate falha.
