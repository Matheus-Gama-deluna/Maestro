# Gate Checklist — Backend

> **Score mínimo para aprovação:** 70/100  
> **Validação:** Por existência de artefatos no disco (code-validator)

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Endpoints implementados conforme modelo de dados** | 20 | Rotas existem e correspondem ao schema da Arquitetura |
| 2 | **DTOs com validação de input** | 15 | Zod/Joi/class-validator em cada endpoint |
| 3 | **Services com regras de negócio** | 15 | Lógica separada dos controllers, testável |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Testes unitários para services e controllers** | 10 | Pelo menos 1 teste por service principal |
| 5 | **Migrações de banco executáveis** | 10 | Schema no disco, migration funciona com `prisma migrate` ou equivalente |
| 6 | **Error handling padronizado** | 10 | Formato de erro consistente em todos os endpoints |
| 7 | **Autenticação implementada** | 10 | Login, registro, middleware de auth conforme Arquitetura |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Logging estruturado** | 5 | Logs com nível, timestamp, request ID |
| 9 | **Seeds de desenvolvimento** | 3 | Script para popular banco com dados de teste |
| 10 | **TypeScript sem erros** | 2 | `tsc --noEmit` passa sem erros |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Endpoints faltando | Revisar modelo de dados → mapear CRUD para cada entidade principal |
| Sem validação | Adicionar Zod schema para body/params/query de cada endpoint |
| Sem testes | Criar teste unitário para cada service com mocks de repository |
| Sem auth | Implementar JWT middleware conforme ADR de autenticação da Arquitetura |
