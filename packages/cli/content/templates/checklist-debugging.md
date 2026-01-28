# Checklist de Debugging

**Versão:** 1.0  
**Data:** [DATA]  
**Projeto:** [NOME DO PROJETO]  
**Status:** [RASCUNHO/EM ANDAMENTO/RESOLVIDO]

---

## 📋 **Contexto**

**Especialista Responsável:** Debugging e Troubleshooting  
**Fase:** 15 - Debugging  
**Artefatos Anteriores:** Bug Report, Logs, Código  
**Tipo de Issue:** [Bug/Performance/Security/Integration]

---

## 🐛 **Informações do Bug**

### **Identificação**
- **ID do Bug:** [BUG-XXX]
- **Título:** [Título claro e conciso]
- **Severidade:** [Critical/High/Medium/Low]
- **Prioridade:** [P1/P2/P3/P4]
- **Reporter:** [Nome]
- **Data Report:** [DATA]
- **Assignee:** [Nome]

### **Descrição**
**Resumo:** [Descrição curta do problema]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:** [O que deveria acontecer]

**Resultado Atual:** [O que está acontecendo]

**Ambiente:**
- **Produção/Staging/Dev:** [Ambiente]
- **URL:** [Link se aplicável]
- **Browser/Device:** [Informações]
- **User:** [ID do usuário afetado]

---

## 🔍 **Análise Inicial**

### **Categorização**
- [ ] **Frontend** - UI/UX, JavaScript, CSS
- [ ] **Backend** - API, Database, Services
- [ ] **Infrastructure** - Server, Network, Deploy
- [ ] **Data** - Database, Cache, Storage
- [ ] **Integration** - Third-party APIs, Webhooks
- [ ] **Performance** - Slow response, Memory leak
- [ ] **Security** - Authentication, Authorization

### **Impact Assessment**
- **Usuários Afetados:** [Número estimado]
- **Funcionalidades Impactadas:** [Lista]
- **Business Impact:** [Descrição]
- **Revenue Impact:** [Valor se aplicável]
- **SLA Impact:** [Sim/Não]

### **Root Cause Hypothesis**
**Hipótese Principal:** [Provável causa raiz]

**Evidências Iniciais:**
- [ ] **Logs mostram** [padrão identificado]
- [ ] **Metrics indicam** [anomalia]
- [ ] **Recent changes** [deploy/config]
- [ ] **External factors** [API third-party]

---

## 🛠️ **Investigação Técnica**

### **Análise de Logs**
- [ ] **Application logs** revisados
- [ ] **Error logs** filtrados por timestamp
- [ ] **Access logs** analisados
- [ ] **Database logs** verificados
- [ ] **System logs** (CPU, Memory, Disk)
- [ ] **Network logs** (firewall, proxy)

**Padrões Identificados:**
- **Timestamp:** [Início/Fim do problema]
- **Frequency:** [Eventos por minuto]
- **Correlation:** [IDs relacionados]
- **Error codes:** [Códigos específicos]

### **Code Analysis**
- [ ] **Recent commits** analisados
- [ ] **Code diff** revisado
- [ ] **Pull requests** recentes
- [ ] **Hotfixes** aplicados
- [ ] **Dependencies** atualizadas
- [ ] **Configuration** changes

**Arquivos Suspeitos:**
- **File:** [path/to/file.js] - [Motivo]
- **File:** [path/to/file.py] - [Motivo]
- **File:** [path/to/config] - [Motivo]

### **Database Investigation**
- [ ] **Slow queries** identificadas
- [ ] **Deadlocks** detectados
- [ ] **Connection pool** analisado
- [ ] **Data integrity** verificada
- [ ] **Indexes** performance
- [ ] **Migration issues**

**Queries Problemáticas:**
```sql
-- Query lenta identificada
SELECT * FROM table WHERE condition;
-- Execution time: [X]ms
-- Rows affected: [N]
```

### **Infrastructure Check**
- [ ] **Server resources** (CPU, Memory, Disk)
- [ ] **Network connectivity** (ping, traceroute)
- [ ] **Load balancer** health checks
- [ ] **CDN status** e cache
- [ ] **SSL certificates** validade
- [ ] **DNS resolution**

**Resource Utilization:**
- **CPU:** [X]% (normal: <70%)
- **Memory:** [X]% (normal: <80%)
- **Disk:** [X]% (normal: <85%)
- **Network:** [X] Mbps (normal: [Y])

---

## 🧪 **Reprodução Controlada**

### **Environment Setup**
- [ ] **Local environment** configurado
- [ ] **Staging environment** preparado
- [ ] **Test data** populado
- [ ] **Debug mode** ativado
- [ ] **Logging level** aumentado
- [ ] **Breakpoints** definidos

### **Reproduction Steps**
1. **Setup:** [Configuração inicial]
2. **Trigger:** [Ação que dispara o bug]
3. **Observe:** [Comportamento observado]
4. **Verify:** [Confirmação do problema]

**Reproduction Rate:**
- **Consistent:** [X]% das tentativas
- **Intermittent:** [X]% das tentativas
- **Environment-specific:** [Apenas em prod/staging]

### **Debug Tools**
- [ ] **Browser DevTools** (Frontend)
- [ ] **IDE Debugger** (Backend)
- [ ] **Database profiler** (SQL)
- [ ] **Network sniffer** (Wireshark)
- [ ] **Memory profiler** (Heap dump)
- [ ] **Performance profiler** (Flame graph)

---

## 🎯 **Root Cause Analysis**

### **5 Whys Analysis**
1. **Why:** [Primeiro why]
2. **Why:** [Segundo why]
3. **Why:** [Terceiro why]
4. **Why:** [Quarto why]
5. **Why:** [Quinto why - Root cause]

### **Fishbone Diagram**
**Categories:**
- **People:** [Training, Knowledge, Process]
- **Process:** [Workflow, Procedures, Standards]
- **Technology:** [Code, Infrastructure, Tools]
- **Environment:** [Prod, Staging, Local]

### **Timeline Analysis**
| Timestamp | Event | Impact |
|-----------|-------|--------|
| [HH:MM] | [Deploy v1.2.3] | [Início do problema] |
| [HH:MM] | [Config change] | [Agravamento] |
| [HH:MM] | [User report] | [Detecção] |

---

## 🔧 **Solução Proposta**

### **Immediate Fix (Hotfix)**
**Descrição:** [Solução rápida e segura]

**Implementação:**
- [ ] **Code change** em [arquivo]
- [ ] **Configuration** adjustment
- [ ] **Data fix** script
- [ ] **Cache clear**
- [ ] **Service restart**

**Testing:**
- [ ] **Unit tests** passam
- [ ] **Integration tests** passam
- [ ] **Manual testing** OK
- [ ] **Performance impact** avaliado

### **Permanent Fix**
**Descrição:** [Solução definitiva e robusta]

**Melhorias:**
- [ ] **Code refactoring** para prevenir recorrência
- [ ] **Additional tests** automatizados
- [ ] **Monitoring** aprimorado
- [ ] **Documentation** atualizada
- [ ] **Team training** se necessário

### **Rollback Plan**
**Trigger:** [Quando fazer rollback]

**Steps:**
1. **Backup current state**
2. **Revert to previous version**
3. **Verify functionality**
4. **Communicate to stakeholders**

---

## 🧪 **Testes de Validação**

### **Functional Testing**
- [ ] **Happy path** funciona
- [ ] **Edge cases** cobertos
- [ ] **Error handling** adequado
- [ ] **User workflows** completos
- [ ] **Cross-browser compatibility**

### **Performance Testing**
- [ ] **Load testing** (baseline vs fix)
- [ ] **Stress testing** (picos de uso)
- [ ] **Memory usage** estável
- [ ] **Response time** melhorado
- [ ] **Throughput** mantido

### **Security Testing**
- [ ] **No new vulnerabilities** introduzidas
- [ ] **Authentication** funciona
- [ ] **Authorization** mantido
- [ ] **Data protection** preservado
- [ ] **Audit log** completo

### **Regression Testing**
- [ ] **Existing features** funcionam
- [ ] **API contracts** mantidos
- [ ] **Database integrity** OK
- [ ] **Third-party integrations** estáveis
- [ ] **Mobile compatibility** verificada

---

## 📊 **Métricas de Sucesso**

### **Before Fix**
- **Error Rate:** [X]%
- **Response Time:** [Y]ms
- **User Complaints:** [N]
- **Downtime:** [X]min
- **Revenue Impact:** [$Y]

### **After Fix**
- **Error Rate:** [X]%
- **Response Time:** [Y]ms
- **User Complaints:** [N]
- **Downtime:** [X]min
- **Revenue Impact:** [$Y]

### **Improvement**
- **Error reduction:** [X]%
- **Performance gain:** [Y]%
- **User satisfaction:** [Z]%
- **Cost savings:** [$W]

---

## 📝 **Documentação**

### **Technical Documentation**
- [ ] **Root cause** documentado
- [ ] **Fix details** registrados
- [ ] **Code comments** adicionados
- [ ] **Architecture decisions** atualizadas
- [ ] **Runbook** criado/atualizado

### **Knowledge Transfer**
- [ ] **Team debrief** realizado
- [ ] **Lessons learned** documentados
- [ ] **Best practices** atualizadas
- [ ] **Training material** criado
- [ ] **Onboarding guide** atualizado

### **Communication**
- [ ] **Stakeholders** informados
- [ ] **Users** notificados (se necessário)
- [ ] **Status page** atualizada
- [ ] **Incident report** publicado
- [ ] **Post-mortem** compartilhado

---

## 🔄 **Prevenção Futura**

### **Process Improvements**
- [ ] **Code review checklist** atualizado
- [ ] **Testing requirements** reforçados
- [ ] **Deployment procedures** melhorados
- [ ] **Monitoring alerts** ajustados
- [ ] **Incident response** refinado

### **Technical Improvements**
- [ ] **Automated tests** adicionados
- [ ] **Health checks** implementados
- [ ] **Circuit breakers** adicionados
- [ ] **Rate limiting** configurado
- [ ] **Graceful degradation** implementado

### **Team Improvements**
- [ ] **Training needs** identificados
- [ ] **Documentation habits** reforçados
- [ ] **Code quality standards** atualizados
- [ ] **On-call procedures** definidos
- [ ] **Knowledge sharing** regular

---

## ✅ **Checklist Final**

### **Resolution**
- [ ] **Root cause** identificado e documentado
- [ ] **Fix implementado** e testado
- [ ] **Regression testing** completo
- [ ] **Performance validado**
- [ ] **Security verificado**

### **Deployment**
- [ ] **Code reviewed** e aprovado
- [ ] **Tests passing** em CI/CD
- [ ] **Deployment plan** seguido
- [ ] **Monitoring ativo** pós-deploy
- [ ] **Rollback ready** se necessário

### **Closure**
- [ ] **Bug marked as resolved**
- [ ] **Documentation updated**
- [ ] **Stakeholders notified**
- [ ] **Metrics collected**
- [ ] **Lessons learned** captured

---

## 📈 **Histórico do Incidente**

| Timestamp | Action | Responsible |
|-----------|--------|-------------|
| [HH:MM] | Bug report received | [Nome] |
| [HH:MM] | Investigation started | [Nome] |
| [HH:MM] | Root cause identified | [Nome] |
| [HH:MM] | Fix implemented | [Nome] |
| [HH:MM] | Testing completed | [Nome] |
| [HH:MM] | Deployed to production | [Nome] |
| [HH:MM] | Incident resolved | [Nome] |

---

## 📞 **Contatos e Recursos**

### **Team**
- **Lead Developer:** [Nome] - [email]
- **DevOps:** [Nome] - [email]
- **QA Engineer:** [Nome] - [email]
- **Product Manager:** [Nome] - [email]

### **Tools**
- **Monitoring:** [Ferramenta]
- **Logging:** [Ferramenta]
- **Debugging:** [Ferramenta]
- **Testing:** [Ferramenta]

### **Documentation**
- **Runbooks:** [Link]
- **Architecture:** [Link]
- **API Docs:** [Link]
- **Knowledge Base:** [Link]

---

**Resolvido por:** [Nome/Assinatura]  
**Data:** [DATA]  
**Tempo Total:** [X horas]  
**Custo Estimado:** [$Y]
