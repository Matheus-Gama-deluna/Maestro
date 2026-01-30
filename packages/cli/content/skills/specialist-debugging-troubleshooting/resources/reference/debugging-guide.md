# Debugging Guide - Referência Completa

Guia técnico completo de debugging sistemático e análise de causa raiz.

---

## 🎯 Metodologia de 4 Fases

### Visão Geral
```
REPRODUCE → ISOLATE → UNDERSTAND → FIX
   15min      20min       20min      30min
```

---

## Fase 1: REPRODUCE

### Objetivo
Confirmar o bug e obter steps exatos de reprodução.

### Checklist
- [ ] Steps documentados numerados
- [ ] Taxa de reprodução identificada
- [ ] Comportamento esperado vs atual
- [ ] Ambiente completo
- [ ] Versão/data do início

### Técnicas

#### 1. Reprodução Local
```bash
# Replicar ambiente exato
- Mesma versão do código
- Mesmas dependências
- Mesmo ambiente (OS, browser)
- Mesmos dados de teste
```

#### 2. Reprodução Intermitente
```bash
# Para bugs intermitentes
- Executar múltiplas vezes (100x)
- Variar condições (carga, timing)
- Adicionar logging extensivo
- Capturar estado quando falha
```

### Ferramentas
- **Browser DevTools:** Console, Network, Sources
- **Logging:** Winston, Pino, console.log
- **Monitoring:** Sentry, DataDog, New Relic

---

## Fase 2: ISOLATE

### Objetivo
Reduzir scope e identificar componente responsável.

### Técnicas Principais

#### 1. Binary Search Debugging
```typescript
// Comentar metade do código
function problematicFunction() {
  // Parte 1
  const data = fetchData();
  
  // Parte 2 (comentar para testar)
  // const processed = processData(data);
  // return processed;
  
  return data; // Testar se erro ainda ocorre
}
```

#### 2. Git Bisect
```bash
# Encontrar commit que introduziu o bug
git bisect start
git bisect bad HEAD          # Versão atual (com bug)
git bisect good v2.3.0       # Última versão boa

# Git checkout commit do meio
npm install && npm test
# Se falhar: git bisect bad
# Se passar: git bisect good

# Repetir até encontrar commit exato
```

#### 3. Minimal Reproduction
```typescript
// Reduzir ao mínimo necessário
// ANTES (complexo)
const result = await complexWorkflow(user, data, options);

// DEPOIS (minimal)
const result = data.map(x => x.value); // Isola o problema
```

### Ferramentas
- **Debugger:** Breakpoints, step-through
- **Git:** git bisect, git log, git blame
- **Profiler:** Chrome DevTools Performance

---

## Fase 3: UNDERSTAND (Root Cause)

### Objetivo
Entender WHY, não apenas WHERE.

### Técnica dos 5 Whys

#### Processo
1. Perguntar "Por quê?" sobre o problema
2. Usar resposta para próxima pergunta
3. Repetir 5 vezes
4. Última resposta = causa raiz

#### Exemplo Completo
```
Problema: Login falha com erro 401

1. Por quê login falha?
   → Token JWT é inválido

2. Por quê token é inválido?
   → Expiração está incorreta

3. Por quê expiração está incorreta?
   → Clock do servidor está atrasado

4. Por quê clock está atrasado?
   → NTP não está configurado

5. Por quê NTP não está configurado?
   → Provisioning script não instala NTP

ROOT CAUSE: Provisioning script incompleto
```

#### Anti-Patterns
```
❌ Parar no sintoma
"Por quê? → Código está errado"

❌ Culpar pessoas
"Por quê? → Desenvolvedor errou"

✅ Encontrar causa sistêmica
"Por quê? → Processo não detectou"
```

### Ferramentas de Análise

#### 1. Debugger
```typescript
// Breakpoints estratégicos
function processData(data) {
  debugger; // Pausa aqui
  const result = data.map(x => x.value);
  debugger; // Pausa aqui também
  return result;
}
```

#### 2. Profiler (Performance)
```bash
# Node.js
node --inspect server.js

# Chrome DevTools
1. Abrir DevTools
2. Performance tab
3. Record
4. Reproduzir bug
5. Stop
6. Analisar flame graph
```

#### 3. Memory Profiler
```bash
# Heap snapshot
1. Chrome DevTools → Memory
2. Take snapshot
3. Executar ação
4. Take snapshot novamente
5. Compare snapshots
6. Identificar objetos que cresceram
```

---

## Fase 4: FIX

### Objetivo
Corrigir causa raiz e prevenir recorrência.

### Checklist de Fix

#### 1. Implementar Fix
```typescript
// ❌ Fixar sintoma
try {
  data.map(x => x.value);
} catch (e) {
  return []; // Ignora erro
}

// ✅ Fixar causa raiz
const data = await query() || []; // Previne null
return data.map(x => x.value);
```

#### 2. Criar Regression Test
```typescript
// Teste que falha ANTES do fix
it('should handle null query results', async () => {
  jest.spyOn(db, 'query').mockResolvedValue(null);
  const result = await service.generateCSV(filter);
  expect(result).toEqual([]); // Passa APÓS fix
});
```

#### 3. Cobrir Edge Cases
```typescript
describe('generateCSV', () => {
  it('should handle null results', () => { /* ... */ });
  it('should handle empty array', () => { /* ... */ });
  it('should handle single item', () => { /* ... */ });
  it('should handle large dataset', () => { /* ... */ });
});
```

### Medidas Preventivas

#### Curto Prazo
- Adicionar validações similares
- Atualizar documentação
- Configurar monitoring

#### Longo Prazo
- Criar linter rules
- Atualizar checklists
- Training da equipe

---

## 🛠️ Ferramentas por Tipo de Bug

### Runtime Errors
```typescript
// Debugger
- Breakpoints
- Step over/into/out
- Watch expressions
- Call stack

// Exemplo
function buggyFunction() {
  debugger; // Pausa execução
  const result = data.map(x => x.value);
  return result;
}
```

### Performance Issues
```bash
# Chrome DevTools Performance
1. Record
2. Executar ação lenta
3. Stop
4. Analisar:
   - Flame graph (CPU)
   - Bottom-up (funções mais lentas)
   - Call tree (hierarquia)

# Node.js Profiler
node --prof server.js
node --prof-process isolate-*.log
```

### Memory Leaks
```bash
# Heap Profiler
1. Take snapshot inicial
2. Executar ação suspeita
3. Take snapshot final
4. Compare:
   - Objetos que cresceram
   - Retained size
   - Shallow size

# Identificar leak
- Event listeners não removidos
- Timers não cancelados
- Closures mantendo referências
```

### Network Issues
```bash
# Browser DevTools Network
- Request/Response headers
- Timing (TTFB, Download)
- Payload size
- Status codes

# HAR Files
1. Network tab → Export HAR
2. Analisar com HAR Viewer
3. Identificar requests lentos
```

---

## 📊 Métricas e KPIs

### Tempo de Resolução
| Severidade | SLA | Meta |
|------------|-----|------|
| P0 (Crítico) | 4h | 2h |
| P1 (Alto) | 1 dia | 8h |
| P2 (Médio) | 3 dias | 1 dia |
| P3 (Baixo) | 1 semana | 3 dias |

### Qualidade do Fix
- **Regression Rate:** <5%
- **Test Coverage:** >80%
- **Code Review:** 100%
- **Root Cause Found:** >90%

---

## 🚫 Anti-Patterns Comuns

### 1. Trial and Error
```
❌ "Vou mudar isso e ver se funciona"
✅ Entender problema antes de mudar
```

### 2. Fixar Sintoma
```
❌ Adicionar try/catch para ignorar erro
✅ Corrigir causa raiz do erro
```

### 3. Não Documentar
```
❌ "Resolvido!" (sem explicação)
✅ Post-mortem completo com 5 Whys
```

### 4. Pular Testes
```
❌ "Testei manualmente, está ok"
✅ Regression test automatizado
```

### 5. Não Prevenir
```
❌ Fixar e esquecer
✅ Medidas preventivas implementadas
```

---

## 📚 Referências

### Livros
- **The Pragmatic Programmer** - Hunt & Thomas
- **Debugging** - David Agans
- **Site Reliability Engineering** - Google

### Frameworks
- **5 Whys** - Toyota Production System
- **Root Cause Analysis** - Lean Manufacturing
- **Post-Mortem** - Google SRE

### Ferramentas
- **Chrome DevTools** - https://developer.chrome.com/docs/devtools/
- **Git Bisect** - https://git-scm.com/docs/git-bisect
- **Node.js Debugging** - https://nodejs.org/en/docs/guides/debugging-getting-started/

---

**Versão:** 1.0  
**Última Atualização:** 2026-01-30  
**Páginas:** 8
