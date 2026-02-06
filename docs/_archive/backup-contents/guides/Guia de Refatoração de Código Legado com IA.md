# Guia de Refatoração de Código Legado com IA

Fluxo estruturado para modernizar código existente com apoio de IA.

---

## Quando Refatorar

- Código difícil de entender ou modificar
- Testes inexistentes ou frágeis
- Padrões desatualizados
- Performance inadequada
- Dívida técnica acumulada

---

## Fluxo de Refatoração

```
1. Análise → 2. Testes → 3. Refatoração → 4. Validação → 5. Documentação
```

---

## 1. Análise do Código

### Identificar code smells

```text
Atue como revisor de código sênior.

Aqui está um módulo/classe legado:
[COLE CÓDIGO]

Identifique:
- Code smells presentes (God Class, Long Method, etc.)
- Violações de SOLID
- Oportunidades de simplificação
- Dependências problemáticas

Priorize por impacto e facilidade de correção.
```

### Entender lógica existente

```text
Este código foi escrito há anos e preciso entendê-lo:
[COLE CÓDIGO]

Explique:
- O que este código faz
- Fluxo principal de execução
- Dependências externas
- Casos de borda tratados
```

---

## 2. Adicionar Testes (antes de refatorar)

```text
Aqui está uma função/classe que vou refatorar:
[COLE CÓDIGO]

Gere testes de caracterização que capturem o comportamento atual:
- Casos de uso principais
- Casos de borda
- Comportamento com inputs inválidos

Use [FRAMEWORK DE TESTES].
```

---

## 3. Refatoração Incremental

### Extrair método

```text
Este método está muito longo:
[COLE CÓDIGO]

Sugira extrações de métodos que:
- Melhorem legibilidade
- Sigam SRP (Single Responsibility)
- Mantenham comportamento idêntico
```

### Simplificar condicionais

```text
Estas condicionais estão complexas:
[COLE CÓDIGO]

Refatore usando:
- Early returns
- Guard clauses
- Polimorfismo (se apropriado)
```

### Modernizar sintaxe

```text
Este código usa padrões antigos de [LINGUAGEM]:
[COLE CÓDIGO]

Modernize para usar:
- Sintaxe atual da linguagem
- Padrões idiomáticos
- Recursos modernos (async/await, destructuring, etc.)
```

---

## 4. Validação

- [ ] Todos os testes passando
- [ ] Cobertura mantida ou melhorada
- [ ] Performance não degradou
- [ ] Comportamento idêntico ao original

---

## 5. Documentação

```text
Acabei de refatorar o seguinte código:

Antes:
[COLE CÓDIGO ANTIGO]

Depois:
[COLE CÓDIGO NOVO]

Gere um resumo das mudanças para o PR, explicando:
- Por que a refatoração foi feita
- Principais alterações
- Impacto no comportamento (nenhum, se correto)
```

---

## Estratégias de Refatoração

| Técnica | Quando Usar | Risco |
|---|---|---|
| **Renomear** | Nomes confusos | Baixo |
| **Extrair método** | Métodos longos | Baixo |
| **Extrair classe** | Classe com muitas responsabilidades | Médio |
| **Mover método** | Método na classe errada | Médio |
| **Substituir condicional por polimorfismo** | Switch/if complexos | Alto |
| **Introduzir padrão de design** | Código duplicado, acoplamento | Alto |

---

## Boas Práticas

1. **Sempre tenha testes antes de refatorar**
2. **Mudanças pequenas e frequentes** - commits atômicos
3. **Uma refatoração por vez** - não misture com features
4. **Valide após cada passo** - rode testes frequentemente
5. **Use IA como assistente** - revise sempre as sugestões
