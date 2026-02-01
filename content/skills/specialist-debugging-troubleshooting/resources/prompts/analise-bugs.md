# Prompt: Análise de Bugs

> **Quando usar:** Investigar e resolver bugs reportados  
> **Especialista:** Debugging e Troubleshooting  
> **Nível:** Médio  
> **Pré-requisitos:** Bug report, logs, código fonte disponível

---

## Fluxo de Contexto
**Inputs:** Bug report, logs, stack traces, código relevante  
**Outputs:** Root cause identificado, solução implementada, testes de regressão  
**Especialista anterior:** Qualquer especialista que identificou o bug  
**Especialista seguinte:** Especialista da área do bug (FE/BE/DevOps)

---

## Prompt Completo

Atue como um **Senior Debug Specialist** com experiência em análise sistemática de bugs, root cause analysis e resolução eficiente de problemas.

## Contexto do Bug
[COLE CONTEÚDO DO BUG REPORT]

[COLE LOGS RELEVANTES]

[COLE STACK TRACES SE DISPONÍVEL]

[COLE CÓDIGO FONTE RELEVANTE]

## Sua Missão
Realizar uma **análise completa do bug** seguindo metodologia sistemática para identificar a root cause, implementar solução robusta e prevenir recorrência.

### Metodologia de Análise

#### 1. Triagem Inicial
- **Severity Assessment:** [Critical/High/Medium/Low]
- **Impact Analysis:** [Usuários afetados, funcionalidades impactadas]
- **Reproduction Rate:** [Consistent/Intermittent/Environment-specific]
- **Priority Assignment:** [P1/P2/P3/P4]

#### 2. Reprodução Controlada
- **Environment Setup:** [Local/Staging/Production]
- **Test Data:** [Dados necessários para reprodução]
- **Steps to Reproduce:** [Passos detalhados]
- **Expected vs Actual:** [Comportamento esperado vs real]

#### 3. Root Cause Analysis
- **5 Whys Analysis:** [Série de perguntas para chegar à causa raiz]
- **Fishbone Diagram:** [Categorias: People, Process, Technology, Environment]
- **Timeline Analysis:** [Eventos que levaram ao bug]
- **Code Review:** [Análise do código relacionado]

#### 4. Solution Design
- **Immediate Fix:** [Solução rápida e segura]
- **Permanent Fix:** [Solução robusta e definitiva]
- **Risk Assessment:** [Riscos da solução proposta]
- **Rollback Plan:** [Plano de reversão se necessário]

#### 5. Implementation and Testing
- **Code Changes:** [Modificações necessárias]
- **Test Cases:** [Testes para validar a solução]
- **Regression Tests:** [Testes para evitar regressão]
- **Performance Impact:** [Avaliação de performance]

#### 6. Documentation and Prevention
- **Root Cause Documentation:** [Registro detalhado]
- **Process Improvements:** [Melhorias para prevenir recorrência]
- **Knowledge Transfer:** [Compartilhamento com equipe]
- **Monitoring Updates:** [Alertas e métricas]

### Template de Análise

#### 1. Informações do Bug
```markdown
## Bug Analysis Report

### Identificação
- **Bug ID:** BUG-XXX
- **Título:** [Título claro e descritivo]
- **Reporter:** [Nome]
- **Date:** [Data do report]
- **Assignee:** [Responsável pela análise]
- **Severity:** [Critical/High/Medium/Low]
- **Priority:** [P1/P2/P3/P4]

### Descrição
**Resumo:** [Descrição curta do problema]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:** [O que deveria acontecer]

**Resultado Atual:** [O que está acontecendo]

**Ambiente:**
- **Produção/Staging/Dev:** [Ambiente]
- **Browser/Device:** [Informações]
- **User ID:** [ID do usuário afetado]
- **Session ID:** [ID da sessão]
```

#### 2. Análise de Impacto
```markdown
### Impact Assessment
- **Usuários Afetados:** [Número estimado]
- **Funcionalidades Impactadas:** [Lista]
- **Business Impact:** [Descrição do impacto no negócio]
- **Revenue Impact:** [Valor financeiro se aplicável]
- **SLA Impact:** [Sim/Não - afeta SLAs existentes]

### Urgência
- **Time to Fix:** [Horas/dias estimados]
- **Business Risk:** [Alto/Médio/Baixo]
- **Customer Complaints:** [Número de reclamações]
- **Media Attention:** [Sim/Não]
```

#### 3. Investigação Técnica
```markdown
### Technical Investigation

#### Análise de Logs
```bash
# Logs relevantes
[COLE LOGS AQUI]

# Padrões identificados
- Timestamp: [Início/Fim do problema]
- Frequency: [Eventos por minuto]
- Error codes: [Códigos específicos]
- Correlation IDs: [IDs relacionados]
```

#### Code Analysis
```typescript
// Código relevante analisado
[COLE CÓDIGO AQUI]

// Issues identificados
- [Issue 1]: [Descrição]
- [Issue 2]: [Descrição]
- [Issue 3]: [Descrição]
```

#### Database Investigation
```sql
-- Queries analisadas
[COLE QUERIES AQUI]

-- Performance issues
- Slow query: [Query lenta identificada]
- Lock contention: [Conflito de bloqueios]
- Data inconsistency: [Inconsistência de dados]
```

#### Infrastructure Check
```bash
# Resource utilization
- CPU: [X]% (normal: <70%)
- Memory: [X]% (normal: <80%)
- Disk: [X]% (normal: <85%)
- Network: [X] Mbps (normal: [Y])

# Service health
- API Gateway: [Status]
- Database: [Status]
- Cache: [Status]
- External APIs: [Status]
```
```

#### 4. Root Cause Analysis
```markdown
### Root Cause Analysis

#### 5 Whys
1. **Why:** [Primeiro why]
2. **Why:** [Segundo why]
3. **Why:** [Terceiro why]
4. **Why:** [Quarto why]
5. **Why:** [Quinto why - Root cause]

#### Fishbone Diagram
**People:**
- [Fator humano]

**Process:**
- [Fator de processo]

**Technology:**
- [Fator tecnológico]

**Environment:**
- [Fator ambiental]

#### Timeline Analysis
| Timestamp | Event | Impact |
|-----------|-------|--------|
| [HH:MM] | [Deploy v1.2.3] | [Início do problema] |
| [HH:MM] | [Config change] | [Agravamento] |
| [HH:MM] | [User report] | [Detecção] |

#### Contributing Factors
- **Primary Cause:** [Causa principal]
- **Secondary Causes:** [Causas secundárias]
- **Triggering Event:** [Evento que disparou]
- **Enabling Conditions:** [Condições que permitiram]
```

#### 5. Solução Proposta
```markdown
### Solution Design

#### Immediate Fix (Hotfix)
**Descrição:** [Solução rápida e segura]

**Implementação:**
- [ ] [Mudança 1]
- [ ] [Mudança 2]
- [ ] [Mudança 3]

**Risks:** [Riscos da solução imediata]
**Testing:** [Testes necessários]
**Rollback:** [Como reverter se necessário]

#### Permanent Fix
**Descrição:** [Solução definitiva e robusta]

**Melhorias:**
- [ ] [Melhoria 1]
- [ ] [Melhoria 2]
- [ ] [Melhoria 3]

**Long-term Benefits:** [Benefícios a longo prazo]
**Implementation Timeline:** [Cronograma]

#### Alternative Solutions
**Option A:** [Descrição e prós/contras]
**Option B:** [Descrição e prós/contras]
**Option C:** [Descrição e prós/contras]

**Selected Solution:** [Justificativa da escolha]
```

#### 6. Implementação
```markdown
### Implementation

#### Code Changes
```typescript
// Arquivo: src/services/UserService.ts
// Linhas: 45-67

// Antes:
[COLE CÓDIGO ANTIGO AQUI]

// Depois:
[COLE CÓDIGO NOVO AQUI]

// Justificativa:
[EXPLIQUE MUDANÇA]
```

#### Configuration Changes
```bash
# Arquivo: .env.production
# Mudanças:
- OLD_VALUE=new_value
+ NEW_VALUE=new_value
```

#### Database Changes
```sql
-- Migration: 004_fix_user_validation.sql
ALTER TABLE users ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

#### Infrastructure Changes
```yaml
# docker-compose.yml
# Mudanças:
services:
  app:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=error
```
```

#### 7. Testes e Validação
```markdown
### Testing and Validation

#### Test Cases
```typescript
describe('Bug Fix Validation', () => {
  it('should handle edge case correctly', async () => {
    // Test case 1
    const result = await userService.createUser(validData);
    expect(result).toBeDefined();
    expect(result.email).toBe(validData.email);
  });

  it('should reject invalid data', async () => {
    // Test case 2
    await expect(userService.createUser(invalidData))
      .rejects.toThrow('Invalid email format');
  });

  it('should maintain performance', async () => {
    // Test case 3
    const start = Date.now();
    await userService.createUser(validData);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // < 1 segundo
  });
});
```

#### Regression Tests
- [ ] **Existing functionality:** Todas as features existentes funcionam
- [ ] **API contracts:** Contratos de API mantidos
- [ ] **Database integrity:** Integridade dos dados preservada
- [ ] **Performance:** Performance não degradada
- [ ] **Security:** Nenhuma vulnerabilidade introduzida

#### Performance Validation
```bash
# Load test results
- Before fix: [X] req/s, [Y]ms avg response
- After fix: [A] req/s, [B]ms avg response
- Improvement: [Z]%

# Memory usage
- Before fix: [X]MB peak
- After fix: [Y]MB peak
- Reduction: [Z]%
```

#### Security Validation
- [ ] **No new vulnerabilities:** Scan de segurança limpo
- [ ] **Data protection:** Dados sensíveis protegidos
- [ ] **Access control:** Controles de acesso mantidos
- [ ] **Audit trail:** Logs de auditoria preservados
```

#### 8. Documentação e Prevenção
```markdown
### Documentation and Prevention

#### Lessons Learned
**Technical:**
- [Lesson 1]
- [Lesson 2]
- [Lesson 3]

**Process:**
- [Lesson 1]
- [Lesson 2]
- [Lesson 3]

**People:**
- [Lesson 1]
- [Lesson 2]

#### Process Improvements
- **Code Review:** [Melhoria no processo de code review]
- **Testing:** [Novos testes automatizados]
- **Monitoring:** [Novos alertas e métricas]
- **Documentation:** [Documentação atualizada]

#### Prevention Measures
- **Static Analysis:** [Regra adicionada ao linter]
- **Unit Tests:** [Testes adicionados]
- **Integration Tests:** [Testes de integração expandidos]
- **Monitoring:** [Alertas configurados]

#### Knowledge Transfer
- **Team Training:** [Treinamento realizado]
- **Documentation:** [Documentação criada/atualizada]
- **Runbooks:** [Procedimentos operacionais]
- **Best Practices:** [Práticas recomendadas]
```

### Exemplos Práticos

#### Exemplo 1: Bug de Validação
```markdown
### Case Study: Email Validation Bug

**Problem:** Sistema aceitava emails inválidos como "test@.com"

**Root Cause:** Regex de validação incompleta

**5 Whys:**
1. Why sistema aceitou emails inválidos? → Regex incompleta
2. Why regex incompleta? → Desenvolvedor não considerou edge cases
3. Why não considerou edge cases? → Falta de testes abrangentes
4. Why falta de testes? → Pressão por entrega rápida
5. Why pressão? → Deadline agressivo sem buffer

**Solution:**
- Immediate: Atualizar regex para RFC 5322 compliance
- Permanent: Adicionar testes unitários para todos os formatos de email
- Prevention: Code review checklist para validações

**Code Fix:**
```typescript
// Antes:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Depois:
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```
```

#### Exemplo 2: Performance Bug
```markdown
### Case Study: N+1 Query Problem

**Problem:** API de usuários com 1000+ requisições ao database

**Root Cause:** N+1 query problem em relacionamentos

**5 Whys:**
1. Why muitas queries? → Lazy loading sem otimização
2. Why lazy loading? -> ORM default behavior
3. Why não otimizado? -> Falta de análise de performance
4. Why falta análise? -> Sem métricas de performance
5. Why sem métricas? -> Monitoring incompleto

**Solution:**
- Immediate: Eager loading com include
- Permanent: Implementar query optimization patterns
- Prevention: Performance monitoring automatizado

**Code Fix:**
```typescript
// Antes:
const users = await User.find();
for (const user of users) {
  user.profile = await Profile.findOne({ where: { userId: user.id } });
}

// Depois:
const users = await User.find({
  include: [{ model: Profile, as: 'profile' }]
});
```
```

## Resposta Esperada

### Estrutura da Resposta
1. **Análise completa** seguindo template acima
2. **Root cause** claramente identificada
3. **Solução robusta** com justificativas
4. **Testes abrangentes** para validação
5. **Documentação** para prevenção
6. **Plano de implementação** detalhado

### Formato
- **Markdown** com estrutura clara
- **Code blocks** para exemplos
- **Checklists** para validação
- **Tables** para organização
- **Diagrams** se necessário

## Checklist Pós-Geração

### Validação da Análise
- [ ] **Bug reproduzido** consistentemente
- [ ] **Root cause** identificada corretamente
- [ ] **Solução proposta** é robusta
- [ ] **Riscos avaliados** adequadamente
- [ ] **Testes planejados** são abrangentes

### Qualidade da Solução
- [ ] **Code changes** são mínimos e seguros
- [ ] **Performance impact** avaliado
- [ ] **Security implications** consideradas
- [ ] **Rollback plan** definido
- [ ] **Documentation** atualizada

### Prevenção
- [ ] **Lessons learned** documentados
- [ ] **Process improvements** implementados
- [ ] **Team training** planejado
- [ ] **Monitoring** atualizado
- [ ] **Knowledge transfer** realizado

### Implementação
- [ ] **Criar** branch para o fix
- [ ] **Implementar** mudanças
- [ ] **Executar** testes
- [ ] **Documentar** mudanças
- [ ] **Comunicar** stakeholders

---

## Notas Adicionais

### Best Practices
- **Systematic approach:** Siga metodologia consistente
- **Data-driven:** Baseie decisões em dados, não suposições
- **Collaboration:** Envolva equipe relevante na análise
- **Documentation:** Documente tudo para referência futura
- **Prevention:** Foque em prevenir recorrência

### Armadilhas Comuns
- **Quick fixes:** Soluções rápidas que não resolvem root cause
- **Blame culture:** Focar em culpados em vez de causas
- **Incomplete analysis:** Pular etapas da investigação
- **Ignoring patterns:** Não reconhecer problemas recorrentes
- **Poor documentation:** Não registrar aprendizados

### Ferramentas Recomendadas
- **Debugging:** Chrome DevTools, Node.js debugger, gdb
- **Profiling:** Chrome Profiler, Node.js profiler, flame graphs
- **Logging:** Winston, Bunyan, ELK stack
- **Monitoring:** Grafana, DataDog, New Relic
- **Collaboration:** Jira, Slack, Confluence
