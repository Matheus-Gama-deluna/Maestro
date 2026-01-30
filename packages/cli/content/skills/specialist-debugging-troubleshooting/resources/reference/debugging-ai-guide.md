# Guia de Debugging com IA

Fluxo estruturado para identificar e corrigir bugs com apoio de IA.

---

## Fluxo de Debugging

```
1. Coleta → 2. Reprodução → 3. Análise → 4. Hipótese → 5. Fix → 6. Validação
```

---

## 1. Coleta de Contexto

Antes de pedir ajuda à IA, colete:

- [ ] Mensagem de erro completa (stack trace)
- [ ] Logs relevantes (últimas N linhas)
- [ ] Passos para reproduzir
- [ ] Comportamento esperado vs. observado
- [ ] Ambiente (versão, SO, navegador)
- [ ] Últimas alterações no código

---

## 2. Prompts para IA

### Análise de Stack Trace

```text
Atue como engenheiro de software sênior.

Aqui está um stack trace de erro:
[COLE STACK TRACE]

Código relevante:
[COLE TRECHO DE CÓDIGO]

Analise:
- Qual é a causa provável do erro?
- Em qual linha/função o problema origina?
- Quais são as possíveis soluções?
```

### Debugging de Lógica

```text
Este código deveria [COMPORTAMENTO ESPERADO], mas está [COMPORTAMENTO OBSERVADO]:
[COLE CÓDIGO]

Input de teste:
[COLE INPUT]

Output esperado:
[COLE OUTPUT ESPERADO]

Output atual:
[COLE OUTPUT ATUAL]

Identifique o bug e sugira a correção.
```

### Análise de Logs

```text
Aqui estão logs de uma falha em produção:
[COLE LOGS]

Contexto do sistema:
[DESCREVA ARQUITETURA BREVEMENTE]

Identifique:
- Padrões de erro
- Possível causa raiz
- Ações de mitigação imediata
```

---

## 3. Geração de Fix

### Prompt para correção

```text
Bug identificado:
[DESCREVA O BUG]

Código com problema:
[COLE CÓDIGO]

Gere:
1. Código corrigido
2. Explicação da mudança
3. Teste que validaria a correção
```

---

## 4. Validação

### Geração de testes de regressão

```text
Acabei de corrigir o seguinte bug:
[DESCREVA]

Código corrigido:
[COLE]

Gere testes de regressão em [FRAMEWORK] que garantam:
- O bug não volta
- Casos de borda relacionados
```

---

## Checklist de Debugging

- [ ] Bug reproduzido localmente
- [ ] Causa raiz identificada
- [ ] Fix implementado e testado
- [ ] Testes de regressão adicionados
- [ ] Documentação atualizada (se necessário)
- [ ] PR aberto com descrição clara

---

## Boas Práticas

1. **Não cole dados sensíveis** em prompts (tokens, senhas, PII)
2. **Isole o problema** antes de pedir ajuda - reduza ao mínimo reproduzível
3. **Verifique a correção** da IA - ela pode sugerir fixes incorretos
4. **Documente bugs complexos** para referência futura
