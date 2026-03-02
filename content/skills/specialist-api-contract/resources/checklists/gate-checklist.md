# Gate Checklist — Contrato de API

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **OpenAPI 3.0+ válido** | 15 | Parseable por ferramentas (Swagger Editor, Prism) |
| 2 | **CRUD para cada entidade principal** | 20 | GET (list+detail), POST, PATCH, DELETE por resource |
| 3 | **Schemas de request e response tipados** | 15 | Tipos reais (UUID, string, integer) — não `any` |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Autenticação definida** | 10 | Security schemes (Bearer JWT) aplicados nos endpoints |
| 5 | **Paginação em listas** | 10 | Parâmetros page/limit ou cursor em endpoints GET list |
| 6 | **Error responses padronizadas** | 10 | 400, 401, 403, 404, 409, 500 com schema de erro |
| 7 | **Exemplos por endpoint** | 10 | Pelo menos 1 example de request e response |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Versionamento definido** | 4 | Estratégia declarada (URI, header ou sem) |
| 9 | **Servers por ambiente** | 3 | dev, staging, production URLs |
| 10 | **Tags organizadas** | 3 | Endpoints agrupados por resource/domínio |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| OpenAPI inválido | Validar em editor.swagger.io ou `npx @redocly/cli lint` |
| Endpoints faltando | Derivar do modelo de dados: cada entidade → CRUD padrão |
| Schemas vagos | Definir tipo exato para cada campo (string format: uuid, date-time, email) |
| Sem auth | Adicionar securitySchemes + security em cada endpoint protegido |
| Sem paginação | Adicionar query params: page (integer), limit (integer, default 20) |
