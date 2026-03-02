# Gate Checklist — Modelo de Domínio

> **Score mínimo para aprovação:** 70/100

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Bounded contexts identificados** | 15 | Cada context com responsabilidade clara e fronteira definida |
| 2 | **Aggregates com aggregate roots** | 15 | Cada aggregate com root identificado, entidades e value objects |
| 3 | **Linguagem ubíqua documentada** | 15 | Glossário com 10+ termos (termo → definição → contexto) |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Entidades com atributos e identidade** | 10 | Cada entidade com ID, atributos tipados, papel no aggregate |
| 5 | **Value Objects identificados** | 10 | Objetos imutáveis sem identidade separados das entidades |
| 6 | **Invariantes/regras de negócio** | 10 | Regras por aggregate — o que NUNCA pode acontecer |
| 7 | **Domain events mapeados** | 10 | Mínimo 5 eventos com nome, trigger e payload |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Context map com relações** | 5 | Partnership, Customer-Supplier, ACL entre contexts |
| 9 | **Domain services identificados** | 5 | Operações que não pertencem a uma entidade |
| 10 | **Diagramas de aggregate** | 5 | Visualização das fronteiras de cada aggregate |

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Sem bounded contexts | Perguntar: "Quais áreas do negócio podem evoluir independentemente?" |
| Aggregates vagos | Perguntar: "Quais entidades DEVEM mudar juntas numa transação?" |
| Linguagem inconsistente | Criar glossário: "Como o NEGÓCIO chama isso? O código usa o MESMO nome?" |
| Sem domain events | Perguntar: "O que acontece DEPOIS de [ação]? Quem precisa saber?" |
