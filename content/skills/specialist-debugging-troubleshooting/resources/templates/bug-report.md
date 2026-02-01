# Bug Report Template

**Bug ID:** BUG-XXX  
**Severidade:** [Crítica | Alta | Média | Baixa]  
**Status:** [Aberto | Em Investigação | Corrigido | Fechado]  
**Data:** YYYY-MM-DD  
**Responsável:** [Nome]

---

## 📋 Environment

- **OS:** [Windows 11 | macOS | Linux]
- **Browser:** [Chrome 120 | Firefox | Safari]
- **App Version:** v2.3.1
- **Node Version:** v20.x
- **Database:** [PostgreSQL 15 | MongoDB 6]

---

## 🔍 Steps to Reproduce

1. Login como usuário X
2. Navegar para /dashboard
3. Clicar em "Export"
4. Selecionar formato CSV
5. Observar erro

**Taxa de Reprodução:** [100% | Intermitente (50%) | Raro (<10%)]

---

## ✅ Expected Behavior

[Descreva o que DEVERIA acontecer]

Exemplo:
- Arquivo CSV deve ser baixado com todos os dados
- Nome do arquivo: `export_2026-01-30.csv`
- Formato: UTF-8, delimitador vírgula

---

## ❌ Actual Behavior

[Descreva o que REALMENTE acontece]

Exemplo:
- Erro 500 Internal Server Error
- Nenhum arquivo é baixado
- Console mostra: "TypeError: Cannot read property 'map' of undefined"

---

## 📸 Screenshots/Logs

### Console Error
```
TypeError: Cannot read property 'map' of undefined
    at ExportService.generateCSV (export.service.ts:45)
    at ExportController.export (export.controller.ts:23)
```

### Network Request
```
POST /api/export
Status: 500
Response: {"error": "Internal Server Error"}
```

### Screenshot
[Anexar screenshot do erro]

---

## 🔬 Root Cause Analysis

**Fase 1: REPRODUCE**
- [x] Bug reproduzível 100% das vezes
- [x] Steps documentados
- [x] Ambiente identificado

**Fase 2: ISOLATE**
- [ ] Componente identificado: `ExportService.generateCSV()`
- [ ] Linha do erro: `export.service.ts:45`
- [ ] Minimal reproduction case criado

**Fase 3: UNDERSTAND (5 Whys)**

1. **Por quê?** → `data.map` falha porque `data` é `undefined`
2. **Por quê?** → Query ao banco retorna `null` em vez de array vazio
3. **Por quê?** → Filtro de data está incorreto, não encontra registros
4. **Por quê?** → Timezone não está sendo considerado na query
5. **Por quê?** → Biblioteca de datas não foi configurada com timezone

**ROOT CAUSE:** Configuração de timezone ausente na biblioteca de datas

---

## 🛠️ Fix Applied

### Código Corrigido
```typescript
// ANTES (export.service.ts:45)
const data = await this.db.query(filter);
return data.map(row => this.formatCSV(row));

// DEPOIS
const data = await this.db.query(filter) || [];
return data.map(row => this.formatCSV(row));
```

### Regression Test
```typescript
// export.service.spec.ts
it('should handle empty query results', async () => {
  jest.spyOn(db, 'query').mockResolvedValue(null);
  const result = await service.generateCSV(filter);
  expect(result).toEqual([]);
});
```

### Validação
- [x] Fix implementado
- [x] Regression test criado
- [x] Testes passando (100% coverage)
- [x] Code review aprovado
- [x] Deploy em staging
- [x] Monitoramento configurado

---

## 📊 Impact Analysis

### Usuários Afetados
- **Total:** ~500 usuários
- **Período:** 2026-01-25 a 2026-01-30 (5 dias)
- **Frequência:** 150 tentativas de export falharam

### Business Impact
- **Revenue Loss:** $0 (feature gratuita)
- **Support Tickets:** 12 tickets criados
- **User Satisfaction:** -5% NPS temporário

---

## 🚀 Prevention Measures

### Curto Prazo
- [x] Adicionar validação de `null` em todos os `.map()`
- [x] Configurar timezone globalmente
- [x] Adicionar testes de edge cases

### Longo Prazo
- [ ] Implementar linter rule para detectar `.map()` sem validação
- [ ] Criar checklist de timezone para novos serviços
- [ ] Adicionar monitoring de erros 500 com alertas

---

## 📚 Lessons Learned

### O que funcionou bem
- Reprodução rápida do bug (15 min)
- Isolamento eficiente com binary search
- 5 Whys levou à causa raiz real

### O que pode melhorar
- Testes de edge cases deveriam ter detectado isso
- Configuração de timezone deveria ser no setup inicial
- Monitoring deveria ter alertado antes dos usuários reportarem

---

## ✅ Checklist de Fechamento

- [x] Bug reproduzido e documentado
- [x] Causa raiz identificada (5 Whys)
- [x] Fix implementado e testado
- [x] Regression test criado
- [x] Code review aprovado
- [x] Deploy em produção
- [x] Monitoring configurado
- [x] Post-mortem documentado
- [x] Medidas preventivas definidas
- [x] Usuários notificados (se aplicável)

---

**Criado por:** [Nome]  
**Última atualização:** YYYY-MM-DD  
**Tempo total de resolução:** 2 horas
