# Critérios de Aceite: [Nome do Sistema]

**Versão:** 1.0  
**Requisitos Relacionados:** [Link para requisitos.md]

---

## Formato

Usamos Gherkin para critérios de aceite:

```gherkin
Funcionalidade: [Nome da funcionalidade]
  Como [persona]
  Quero [ação]
  Para [benefício]

  Cenário: [Nome do cenário]
    Dado [contexto/pré-condição]
    Quando [ação do usuário]
    Então [resultado esperado]
```

---

## CA001 - [Título] (RF001)

### Cenário 1: Sucesso - [Descrição]
```gherkin
Dado que o usuário está logado
  E está na página [X]
Quando o usuário [ação]
Então o sistema deve [resultado]
  E [outro resultado se houver]
```

### Cenário 2: Erro - [Descrição]
```gherkin
Dado que o usuário está logado
  E [condição de erro]
Quando o usuário [ação]
Então o sistema deve exibir mensagem de erro "[mensagem]"
  E não deve [ação que não deve ocorrer]
```

### Cenário 3: Edge Case - [Descrição]
```gherkin
Dado [condição de borda]
Quando [ação]
Então [comportamento esperado]
```

---

## CA002 - [Título] (RF002)

### Cenário 1: [Descrição]
```gherkin
Dado [contexto]
Quando [ação]
Então [resultado]
```

---

## CA003 - [Título] (RF003)

### Cenário 1: [Descrição]
```gherkin
Dado [contexto]
Quando [ação]
Então [resultado]
```

---

## Tabela de Dados de Teste

Para cenários que precisam de múltiplas variações:

### CA001 - Validação de Campos

| Campo | Valor Válido | Valor Inválido | Mensagem de Erro |
|---|---|---|---|
| email | user@email.com | "email-invalido" | "Email inválido" |
| senha | "Senha123!" | "123" | "Senha deve ter 8+ caracteres" |
| nome | "João Silva" | "" | "Nome é obrigatório" |

---

## Checklist de Cobertura

- [ ] Cenário de sucesso (happy path)
- [ ] Validação de campos obrigatórios
- [ ] Validação de formato de campos
- [ ] Permissões/autorização
- [ ] Edge cases (limites, null, vazio)
- [ ] Concorrência (se aplicável)
- [ ] Timeout/indisponibilidade (se integração)
