# Guia de Referência — Discovery

## Frameworks de Product Discovery

### Jobs to Be Done (JTBD)
- Formato: "Quando [situação], quero [motivação], para [resultado esperado]"
- Foco no PORQUÊ, não no O QUÊ
- Cada persona deve ter pelo menos 1 JTBD principal

### North Star Metric
- Deve refletir valor entregue ao usuário (não vanity metrics)
- Exemplos: WAU (SaaS), GMV (marketplace), DAU (social), Revenue/visitor (e-commerce)
- Evitar: page views, downloads, registros sem ativação

### Priorização MoSCoW
| Categoria | Significado | Regra |
|-----------|------------|-------|
| **Must Have** | Sem isso, MVP não faz sentido | Máximo 3 itens |
| **Should Have** | Importante, mas MVP sobrevive sem | 2-3 itens |
| **Could Have** | Agradável ter, baixo esforço | 1-2 itens |
| **Won't Have** | Explicitamente fora do escopo | Listar para evitar scope creep |

### RICE Scoring
| Fator | Pergunta | Escala |
|-------|----------|--------|
| **Reach** | Quantos usuários impactados? | Número absoluto/trimestre |
| **Impact** | Quanto impacta cada usuário? | 3=massivo, 2=alto, 1=médio, 0.5=baixo, 0.25=mínimo |
| **Confidence** | Quão certo estamos? | 100%=alta, 80%=média, 50%=baixa |
| **Effort** | Pessoa-semanas necessárias? | Número (menor = melhor) |
| **Score** | (R × I × C) / E | Maior = prioridade |

## Anti-patterns de Discovery

| Anti-pattern | Por que é ruim | Correção |
|-------------|----------------|----------|
| "Todos são usuários" | Não direciona decisões de design | Definir 2-3 personas específicas |
| "O app faz tudo" | MVP vira projeto de 1 ano | Limitar a 3-5 features Must Have |
| Métricas vagas ("ser popular") | Impossível medir sucesso | North Star com número e prazo |
| Sem concorrentes listados | Ignora contexto de mercado | Sempre listar 2+ alternativas |
| Requisitos sem prioridade | Tudo é "urgente" | Forçar MoSCoW ou RICE |

## Dicas para Coleta Conversacional

- **Perguntas abertas** primeiro: "Me conta sobre o problema" (não "o problema é X?")
- **Follow-up com números**: "Você disse que é lento — quanto tempo leva hoje?"
- **Desafie abstrações**: "Muitos usuários" → "Quantos exatamente?"
- **Se o usuário não sabe**: Marque como "A definir" — nunca invente
- **Limite de features**: Se listar >5, pergunte "Se tivesse que escolher 3?"
