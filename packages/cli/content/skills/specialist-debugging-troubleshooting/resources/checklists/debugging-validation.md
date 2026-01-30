# Debugging Validation Checklist

Este checklist automatizado valida a qualidade do processo de debugging e do fix implementado.

---

## 📋 Checklist de Validação (Score Mínimo: 75/100)

### Fase 1: REPRODUCE (20 pontos)

- [ ] **[5 pts]** Steps de reprodução documentados de forma clara e completa
- [ ] **[5 pts]** Taxa de reprodução identificada (100%, intermitente, raro)
- [ ] **[5 pts]** Comportamento esperado vs atual documentado
- [ ] **[3 pts]** Ambiente completo documentado (OS, browser, versão)
- [ ] **[2 pts]** Data/versão que começou a ocorrer identificada

**Subtotal Fase 1:** ___/20

---

### Fase 2: ISOLATE (20 pontos)

- [ ] **[8 pts]** Componente/função específica identificada
- [ ] **[5 pts]** Minimal reproduction case criado
- [ ] **[4 pts]** Técnica de isolamento documentada (binary search, git bisect, etc)
- [ ] **[3 pts]** Logs/evidências do isolamento anexados

**Subtotal Fase 2:** ___/20

---

### Fase 3: UNDERSTAND (25 pontos)

- [ ] **[10 pts]** 5 Whys aplicados corretamente
- [ ] **[8 pts]** Causa raiz identificada (não sintoma)
- [ ] **[4 pts]** Contributing factors documentados
- [ ] **[3 pts]** Ferramentas de análise utilizadas (debugger, profiler, etc)

**Subtotal Fase 3:** ___/25

---

### Fase 4: FIX (35 pontos)

- [ ] **[10 pts]** Fix implementado na causa raiz (não sintoma)
- [ ] **[10 pts]** Regression test criado e passando
- [ ] **[5 pts]** Edge cases cobertos nos testes
- [ ] **[5 pts]** Code review aprovado
- [ ] **[3 pts]** Deploy realizado com sucesso
- [ ] **[2 pts]** Monitoring/alertas configurados

**Subtotal Fase 4:** ___/35

---

## 🎯 Cálculo de Score

### Fórmula
```
Score Total = Fase 1 + Fase 2 + Fase 3 + Fase 4
Score Máximo = 100 pontos
Score Mínimo para Aprovação = 75 pontos
```

### Interpretação
| Score | Status | Ação |
|-------|--------|------|
| 90-100 | ✅ Excelente | Aprovar automaticamente |
| 75-89 | ⚠️ Bom | Aprovar com observações |
| 60-74 | 🔴 Insuficiente | Requer correções |
| <60 | ❌ Reprovado | Refazer processo |

---

## 📊 Validação Automática

### Critérios Obrigatórios (Bloqueantes)
Estes critérios DEVEM ser atendidos, independente do score:

- [ ] **Bug reproduzível** (100% ou documentado se intermitente)
- [ ] **Causa raiz identificada** (não apenas sintoma)
- [ ] **Regression test criado** (mínimo 1 teste)
- [ ] **Fix testado** (localmente e em staging)

**Se qualquer critério obrigatório falhar, score = 0**

---

## 🔍 Validação Detalhada por Critério

### 1. Steps de Reprodução (5 pts)

**Critérios:**
- [ ] Numerados e em ordem
- [ ] Específicos (não vagos)
- [ ] Reproduzíveis por outra pessoa
- [ ] Incluem dados de teste necessários

**Exemplo Bom:**
```
1. Login como admin@example.com / senha123
2. Navegar para /dashboard
3. Clicar em "Export CSV"
4. Observar erro no console
```

**Exemplo Ruim:**
```
1. Fazer login
2. Exportar dados
3. Ver erro
```

---

### 2. Taxa de Reprodução (5 pts)

**Critérios:**
- [ ] Percentual ou frequência documentada
- [ ] Condições para reprodução identificadas
- [ ] Ambiente específico documentado

**Exemplos:**
- ✅ "100% reproduzível em Chrome 120, Windows 11"
- ✅ "Intermitente (~20%) sob alta carga (>1000 req/min)"
- ❌ "Às vezes acontece"

---

### 3. Comportamento Esperado vs Atual (5 pts)

**Critérios:**
- [ ] Comportamento esperado claro
- [ ] Comportamento atual detalhado
- [ ] Diferença explícita

**Exemplo:**
```
Esperado: Arquivo CSV baixado com 100 linhas
Atual: Erro 500, nenhum arquivo baixado
```

---

### 4. Componente Isolado (8 pts)

**Critérios:**
- [ ] Arquivo específico identificado
- [ ] Função/método específico identificado
- [ ] Linha de código (se aplicável)
- [ ] Minimal reproduction case criado

**Exemplo:**
```
Arquivo: export.service.ts
Função: generateCSV()
Linha: 45
Minimal case: data.map() sem validação de null
```

---

### 5. 5 Whys Aplicados (10 pts)

**Critérios:**
- [ ] 5 perguntas "Por quê?" documentadas
- [ ] Cada resposta leva à próxima pergunta
- [ ] Causa raiz identificada (não sintoma)
- [ ] Lógica coerente

**Exemplo Bom:**
```
1. Por quê? → data é undefined
2. Por quê? → query retorna null
3. Por quê? → filtro incorreto
4. Por quê? → timezone não configurado
5. Por quê? → setup guide não mencionava

ROOT CAUSE: Configuração ausente
```

**Exemplo Ruim:**
```
1. Por quê? → Código está errado
2. Por quê? → Desenvolvedor errou
3. Por quê? → Falta de atenção

ROOT CAUSE: Erro humano (muito vago)
```

---

### 6. Regression Test (10 pts)

**Critérios:**
- [ ] Teste criado especificamente para este bug
- [ ] Teste falha antes do fix
- [ ] Teste passa após o fix
- [ ] Edge cases cobertos

**Exemplo:**
```typescript
it('should handle null query results', async () => {
  jest.spyOn(db, 'query').mockResolvedValue(null);
  const result = await service.generateCSV(filter);
  expect(result).toEqual([]);
});
```

---

### 7. Code Review (5 pts)

**Critérios:**
- [ ] Pull request criado
- [ ] Pelo menos 1 reviewer aprovado
- [ ] Comentários resolvidos
- [ ] CI/CD passando

---

## 📈 Métricas de Qualidade

### Tempo de Resolução
| Complexidade | Tempo Esperado | Tempo Máximo |
|--------------|----------------|--------------|
| Simples | 30-60 min | 2 horas |
| Médio | 1-3 horas | 1 dia |
| Complexo | 3-8 horas | 3 dias |

### Cobertura de Testes
| Tipo | Cobertura Mínima |
|------|------------------|
| Regression Test | 100% do bug |
| Edge Cases | 80% dos cenários |
| Integration | 70% do fluxo |

---

## 🚦 Feedback Automático

### Score 90-100 (Excelente)
```
✅ Debugging executado com excelência!

Pontos fortes:
- Processo sistemático aplicado corretamente
- Causa raiz bem identificada
- Testes abrangentes criados

Próximos passos:
- Deploy para produção
- Monitorar por 24h
- Documentar lessons learned
```

### Score 75-89 (Bom)
```
⚠️ Debugging bem executado, com pontos de melhoria.

Pontos fortes:
- [listar pontos fortes]

Pontos de melhoria:
- [listar itens com score baixo]

Ações recomendadas:
- [sugestões específicas]
```

### Score 60-74 (Insuficiente)
```
🔴 Debugging precisa de correções antes de aprovar.

Itens críticos:
- [listar itens obrigatórios faltando]

Ações necessárias:
- [correções específicas]

Prazo: [definir prazo]
```

### Score <60 (Reprovado)
```
❌ Debugging não atende critérios mínimos.

Problemas identificados:
- [listar todos os problemas]

Ação requerida:
- Refazer processo completo
- Seguir metodologia de 4 fases
- Consultar guia de referência
```

---

## ✅ Checklist de Fechamento

Antes de considerar o debugging concluído:

- [ ] Score de validação ≥ 75 pontos
- [ ] Todos os critérios obrigatórios atendidos
- [ ] Bug report completo
- [ ] Post-mortem documentado (se aplicável)
- [ ] Regression tests criados
- [ ] Code review aprovado
- [ ] Deploy realizado
- [ ] Monitoring configurado
- [ ] Usuários notificados (se aplicável)
- [ ] Lessons learned documentadas

---

**Versão:** 1.0  
**Última Atualização:** 2026-01-30  
**Score Mínimo:** 75/100  
**Critérios Obrigatórios:** 4
