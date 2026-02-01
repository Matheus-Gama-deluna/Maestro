# Post-Mortem Template

**Incident ID:** INC-XXX  
**Severidade:** [P0 - Crítico | P1 - Alto | P2 - Médio | P3 - Baixo]  
**Data do Incidente:** YYYY-MM-DD HH:MM  
**Duração:** X horas Y minutos  
**Status:** [Draft | Under Review | Published]

---

## 📋 Executive Summary

[Resumo de 2-3 parágrafos para stakeholders não-técnicos]

**O que aconteceu:**
- Serviço de export de dados ficou indisponível por 2 horas
- 500 usuários afetados, 150 tentativas de export falharam

**Impacto:**
- 12 tickets de suporte criados
- -5% NPS temporário
- $0 em revenue loss (feature gratuita)

**Causa Raiz:**
- Configuração de timezone ausente causou queries inválidas

**Resolução:**
- Fix deployado em 2 horas
- Medidas preventivas implementadas

---

## 🕐 Timeline

### Detecção
- **12:00** - Primeiro erro reportado por usuário via support
- **12:05** - Equipe de suporte escalou para engenharia
- **12:10** - Engenheiro começou investigação

### Investigação
- **12:15** - Bug reproduzido localmente (100%)
- **12:30** - Componente isolado: `ExportService.generateCSV()`
- **12:45** - Causa raiz identificada: timezone configuration

### Resolução
- **13:00** - Fix implementado e testado localmente
- **13:15** - Code review aprovado
- **13:30** - Deploy em staging
- **13:45** - Testes em staging passaram
- **14:00** - Deploy em produção
- **14:15** - Monitoramento confirmou resolução

### Comunicação
- **14:20** - Status page atualizado
- **14:30** - Usuários afetados notificados
- **15:00** - Post-mortem iniciado

---

## 🔍 Root Cause Analysis (5 Whys)

### Pergunta Inicial
**Por que o export de dados falhou?**

### Análise
1. **Por quê?** → `data.map` falha porque `data` é `undefined`
2. **Por quê?** → Query ao banco retorna `null` em vez de array vazio
3. **Por quê?** → Filtro de data está incorreto, não encontra registros
4. **Por quê?** → Timezone não está sendo considerado na query
5. **Por quê?** → Biblioteca de datas não foi configurada com timezone

### Root Cause
**Configuração de timezone ausente na biblioteca de datas**

### Contributing Factors
- Testes de edge cases não cobriam query com resultado vazio
- Linter não detecta `.map()` sem validação de null
- Monitoring não alertou sobre spike de erros 500

---

## 📊 Impact Analysis

### Usuários Afetados
| Métrica | Valor |
|---------|-------|
| Total de usuários | 500 |
| Tentativas de export | 150 |
| Período | 5 dias |
| Taxa de falha | 100% |

### Business Impact
| Categoria | Impacto |
|-----------|---------|
| Revenue Loss | $0 |
| Support Tickets | 12 |
| NPS | -5% (temporário) |
| Churn | 0% |

### Technical Impact
| Métrica | Valor |
|---------|-------|
| Erros 500 | 150 |
| Downtime | 0% (feature específica) |
| Database Load | Normal |
| API Latency | Normal |

---

## 🛠️ Resolution

### Fix Implementado
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
it('should handle empty query results', async () => {
  jest.spyOn(db, 'query').mockResolvedValue(null);
  const result = await service.generateCSV(filter);
  expect(result).toEqual([]);
});
```

### Validação
- ✅ Fix testado localmente
- ✅ Code review aprovado
- ✅ Testes em staging passaram
- ✅ Deploy em produção bem-sucedido
- ✅ Monitoring confirmou resolução

---

## 🚀 Action Items

### Curto Prazo (1 semana)
- [ ] **[ENG-123]** Adicionar validação de `null` em todos os `.map()` - @dev1
- [ ] **[ENG-124]** Configurar timezone globalmente - @dev2
- [ ] **[ENG-125]** Adicionar testes de edge cases - @qa1
- [ ] **[ENG-126]** Atualizar documentação de setup - @tech-writer

### Médio Prazo (1 mês)
- [ ] **[ENG-127]** Implementar linter rule para `.map()` sem validação - @dev3
- [ ] **[ENG-128]** Criar checklist de timezone para novos serviços - @architect
- [ ] **[ENG-129]** Adicionar monitoring de erros 500 com alertas - @devops

### Longo Prazo (3 meses)
- [ ] **[ENG-130]** Revisar todos os serviços para edge cases similares - @team
- [ ] **[ENG-131]** Implementar testes de chaos engineering - @sre
- [ ] **[ENG-132]** Criar runbook para incidentes de export - @oncall

---

## 📚 Lessons Learned

### O que funcionou bem ✅
1. **Reprodução rápida:** Bug reproduzido em 15 minutos
2. **Isolamento eficiente:** Binary search levou ao componente em 30 min
3. **5 Whys efetivo:** Causa raiz identificada corretamente
4. **Comunicação clara:** Stakeholders informados em tempo real
5. **Deploy rápido:** Fix em produção em 2 horas

### O que pode melhorar ⚠️
1. **Testes de edge cases:** Deveriam ter detectado isso antes
2. **Configuração inicial:** Timezone deveria ser no setup
3. **Monitoring proativo:** Alertas deveriam ter disparado antes
4. **Documentação:** Setup guide não mencionava timezone
5. **Code review:** Checklist deveria incluir validação de null

### Surpresas 🤔
1. **Volume de usuários afetados:** Esperávamos menos
2. **Tempo de detecção:** 5 dias até primeiro report
3. **Simplicidade do fix:** 1 linha de código resolveu

---

## 🔄 Prevention Measures

### Immediate Actions (Já Implementadas)
- ✅ Fix deployado em produção
- ✅ Regression test criado
- ✅ Monitoring configurado
- ✅ Documentação atualizada

### Short-term Prevention
- Linter rule para detectar `.map()` sem validação
- Checklist de timezone para novos serviços
- Testes de edge cases obrigatórios

### Long-term Prevention
- Chaos engineering para testar edge cases
- Runbooks para incidentes comuns
- Training sobre debugging sistemático

---

## 📞 Stakeholders

### Equipe de Resolução
- **Incident Commander:** @oncall-lead
- **Engineering Lead:** @eng-manager
- **Developer:** @dev1
- **QA:** @qa1
- **DevOps:** @devops1

### Comunicação
- **Support Team:** Notificado às 12:05
- **Product Manager:** Notificado às 12:30
- **CTO:** Notificado às 13:00
- **Usuários:** Notificados às 14:30

---

## ✅ Sign-off

### Aprovações
- [ ] **Engineering Lead:** @eng-manager
- [ ] **Product Manager:** @pm
- [ ] **CTO:** @cto
- [ ] **Support Lead:** @support-manager

### Publicação
- [ ] Post-mortem revisado pela equipe
- [ ] Action items atribuídos
- [ ] Documentação atualizada
- [ ] Lessons learned compartilhadas
- [ ] Post-mortem publicado no wiki

---

**Autor:** [Nome]  
**Data de Criação:** YYYY-MM-DD  
**Última Atualização:** YYYY-MM-DD  
**Status:** [Draft | Under Review | Published]
