# 🛡️ Guia de Validação de Qualidade

> Use este guia para verificar se o projeto atende aos requisitos antes de avançar de fase.

---

## checklist Universal (Baseado no Tier)

Verifique os itens definidos em `rules/validation-rules.md`.
*   **Ex (Base):** Testes unitários existem? Lint passa? Documentação existe?

---

## Checklist Específico da Transição

Consulte a tabela em `rules/quality-gates.md` para a transição `Fase Atual` → `Próxima Fase`.
*   **Ex:** Se está em "Produto", verifique se o "MVP" do PRD.md está refletido nos documentos de Requisitos.

---

## Como Calcular o Score

1.  Contabilize os itens validados vs. itens totais.
2.  Calcule a porcentagem: `(Itens OK / Total) * 100`.
3.  Determine o status:
    *   **Score 100%**: Aprovado (Verde).
    *   **Score >= 70%**: Aprovado com Ressalvas (Amarelo).
    *   **Score < 70%**: Bloqueado (Vermelho).

---

## Relatório de Validação

Ao finalizar a análise, gere um relatório neste formato:

```markdown
🔍 **Relatório de Validação: Fase {numero} - {nome}**
**Score Calculado**: {score}/100 ({Status})
**Tier**: {tier}

### ✅ Itens Aprovados
- [Item 1]

### ❌ Pendências
- [Item Pendente]: {Motivo}

**Veredito**:
{Se Bloqueado}: 🛑 **BLOQUEADO**.
{Se Aprovado}: ✅ **APROVADO**.
```
