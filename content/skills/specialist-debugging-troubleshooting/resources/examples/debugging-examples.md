# Debugging Examples - Input/Output Pairs

Este documento contém exemplos práticos de debugging com inputs reais e outputs esperados.

---

## Exemplo 1: Runtime Error - Null Reference

### Input
```typescript
// Bug Report
Error: Cannot read property 'map' of undefined
File: export.service.ts:45
User Action: Clicked "Export CSV" button
```

### Processo de Debugging

#### Fase 1: REPRODUCE
```bash
# Steps to reproduce
1. Login as admin@example.com
2. Navigate to /dashboard
3. Click "Export CSV"
4. Observe error in console

# Result: 100% reproducible
```

#### Fase 2: ISOLATE
```typescript
// Binary search debugging
// Comentar metade do código para isolar

// ANTES (não funciona)
const data = await this.db.query(filter);
return data.map(row => this.formatCSV(row)); // ❌ Erro aqui

// Isolado: problema está no .map()
console.log(data); // undefined
```

#### Fase 3: UNDERSTAND (5 Whys)
```
1. Por quê data é undefined?
   → Query retorna null

2. Por quê query retorna null?
   → Filtro de data não encontra registros

3. Por quê filtro não encontra registros?
   → Timezone incorreto na query

4. Por quê timezone está incorreto?
   → Biblioteca de datas não configurada

5. Por quê não foi configurada?
   → Setup guide não mencionava

ROOT CAUSE: Configuração de timezone ausente
```

#### Fase 4: FIX
```typescript
// Fix implementado
const data = await this.db.query(filter) || [];
return data.map(row => this.formatCSV(row));

// Regression test
it('should handle null query results', async () => {
  jest.spyOn(db, 'query').mockResolvedValue(null);
  const result = await service.generateCSV(filter);
  expect(result).toEqual([]);
});
```

### Output Esperado
```markdown
✅ Bug corrigido
✅ Regression test criado
✅ Score de validação: 85/100
✅ Post-mortem documentado
```

---

## Exemplo 2: Performance Issue - Memory Leak

### Input
```typescript
// Bug Report
Issue: Application crashes after 2 hours
Memory usage: Grows from 200MB to 2GB
Environment: Node.js v20, Production
```

### Processo de Debugging

#### Fase 1: REPRODUCE
```bash
# Steps to reproduce
1. Start application
2. Run load test (1000 req/min)
3. Monitor memory usage
4. Observe crash after 2 hours

# Result: 100% reproducible under load
```

#### Fase 2: ISOLATE
```bash
# Heap profiler
node --inspect server.js

# Chrome DevTools Memory
# Take heap snapshot every 30 min
# Compare snapshots

# Result: WebSocket connections not being closed
```

#### Fase 3: UNDERSTAND (5 Whys)
```
1. Por quê memória cresce?
   → WebSocket connections acumulam

2. Por quê connections acumulam?
   → .close() não é chamado

3. Por quê .close() não é chamado?
   → Event listener de 'disconnect' não registrado

4. Por quê listener não foi registrado?
   → Código de cleanup foi removido em refactor

5. Por quê foi removido?
   → Code review não detectou

ROOT CAUSE: Event listener removido acidentalmente
```

#### Fase 4: FIX
```typescript
// Fix implementado
class WebSocketManager {
  private connections = new Map();

  connect(socket) {
    this.connections.set(socket.id, socket);
    
    // FIX: Adicionar listener de cleanup
    socket.on('disconnect', () => {
      this.connections.delete(socket.id);
      socket.close();
    });
  }
}

// Regression test
it('should cleanup connections on disconnect', async () => {
  const socket = createMockSocket();
  manager.connect(socket);
  
  socket.emit('disconnect');
  
  expect(manager.connections.size).toBe(0);
});
```

### Output Esperado
```markdown
✅ Memory leak corrigido
✅ Regression test criado
✅ Load test passou (24h sem crash)
✅ Monitoring configurado
```

---

## Exemplo 3: Logic Error - Calculation Bug

### Input
```typescript
// Bug Report
Issue: Discount calculation incorrect
Expected: 10% discount = $9.00
Actual: $9.90
File: pricing.service.ts
```

### Processo de Debugging

#### Fase 1: REPRODUCE
```typescript
// Test case
const price = 100;
const discount = 0.10;
const result = calculatePrice(price, discount);

console.log(result); // 99.00 (esperado: 90.00)
// Result: 100% reproducible
```

#### Fase 2: ISOLATE
```typescript
// Binary search
function calculatePrice(price, discount) {
  // Isolar cada operação
  const discountAmount = price * discount; // 10.00 ✅
  const finalPrice = price - discountAmount; // 90.00 ✅
  
  // Problema está no return
  return price - discount; // ❌ 99.90 (subtrai 0.10 em vez de 10.00)
}
```

#### Fase 3: UNDERSTAND (5 Whys)
```
1. Por quê resultado está errado?
   → Subtrai 0.10 em vez de 10.00

2. Por quê subtrai 0.10?
   → Usa 'discount' em vez de 'discountAmount'

3. Por quê usa variável errada?
   → Typo no código

4. Por quê typo não foi detectado?
   → TypeScript não detecta (ambos são number)

5. Por quê teste não detectou?
   → Teste não existia

ROOT CAUSE: Falta de teste unitário
```

#### Fase 4: FIX
```typescript
// Fix implementado
function calculatePrice(price: number, discount: number): number {
  const discountAmount = price * discount;
  return price - discountAmount; // FIX: usar discountAmount
}

// Regression test
describe('calculatePrice', () => {
  it('should apply 10% discount correctly', () => {
    expect(calculatePrice(100, 0.10)).toBe(90.00);
  });
  
  it('should apply 50% discount correctly', () => {
    expect(calculatePrice(100, 0.50)).toBe(50.00);
  });
  
  it('should handle 0% discount', () => {
    expect(calculatePrice(100, 0)).toBe(100.00);
  });
});
```

### Output Esperado
```markdown
✅ Cálculo corrigido
✅ 3 regression tests criados
✅ 100% test coverage
✅ Code review aprovado
```

---

## Exemplo 4: Regression Bug - Git Bisect

### Input
```bash
# Bug Report
Issue: Login stopped working
Last known good: v2.3.0 (2 weeks ago)
Current version: v2.5.0
Commits: ~50 commits between versions
```

### Processo de Debugging

#### Fase 1: REPRODUCE
```bash
# Checkout v2.3.0
git checkout v2.3.0
npm install
npm start
# Login works ✅

# Checkout v2.5.0
git checkout v2.5.0
npm install
npm start
# Login fails ❌

# Result: Regression confirmed
```

#### Fase 2: ISOLATE (Git Bisect)
```bash
# Start bisect
git bisect start
git bisect bad v2.5.0
git bisect good v2.3.0

# Git will checkout middle commit
# Test login
npm install && npm start
# Login fails ❌
git bisect bad

# Repeat until found
# Result: Commit abc123 broke login
```

#### Fase 3: UNDERSTAND
```bash
# View breaking commit
git show abc123

# Commit message: "Refactor: Update JWT library to v5"

# Changes:
- jwt.sign(payload, secret, { expiresIn: '1h' })
+ jwt.sign(payload, secret, { expiresIn: 3600 }) // ❌ Wrong format
```

#### Fase 4: FIX
```typescript
// Fix implementado
// ANTES
jwt.sign(payload, secret, { expiresIn: 3600 }); // ❌ Number não aceito

// DEPOIS
jwt.sign(payload, secret, { expiresIn: '1h' }); // ✅ String format

// Regression test
it('should generate valid JWT token', () => {
  const token = generateToken(user);
  const decoded = jwt.verify(token, secret);
  expect(decoded.exp).toBeDefined();
});
```

### Output Esperado
```markdown
✅ Regression corrigida
✅ Git bisect identificou commit exato
✅ Regression test criado
✅ Documentação de breaking changes atualizada
```

---

## Exemplo 5: Intermittent Bug - Race Condition

### Input
```typescript
// Bug Report
Issue: Sometimes user data is not saved
Frequency: ~20% of attempts
Environment: Production, high load
```

### Processo de Debugging

#### Fase 1: REPRODUCE
```typescript
// Difícil reproduzir localmente
// Adicionar logging extensivo

logger.info('Step 1: Fetching user');
const user = await getUser(id);

logger.info('Step 2: Updating user');
await updateUser(user);

logger.info('Step 3: Saving user');
await saveUser(user);

// Result: Intermitente (20% falha)
```

#### Fase 2: ISOLATE
```typescript
// Análise de logs
// Padrão identificado: falha quando 2 requests simultâneos

// Request 1: getUser(123) → update → save ✅
// Request 2: getUser(123) → update → save ❌ (overwrite)

// Result: Race condition identificada
```

#### Fase 3: UNDERSTAND (5 Whys)
```
1. Por quê dados não são salvos?
   → Request 2 sobrescreve Request 1

2. Por quê sobrescreve?
   → Ambos leem mesmo estado inicial

3. Por quê leem mesmo estado?
   → Não há lock/transaction

4. Por quê não há lock?
   → Código não considerou concorrência

5. Por quê não considerou?
   → Requisito não estava no PRD

ROOT CAUSE: Falta de controle de concorrência
```

#### Fase 4: FIX
```typescript
// Fix implementado: Optimistic Locking
interface User {
  id: number;
  version: number; // FIX: Adicionar version
  data: any;
}

async function updateUser(user: User) {
  const result = await db.query(`
    UPDATE users 
    SET data = $1, version = version + 1
    WHERE id = $2 AND version = $3
  `, [user.data, user.id, user.version]);
  
  if (result.rowCount === 0) {
    throw new ConflictError('User was modified by another request');
  }
}

// Regression test
it('should handle concurrent updates', async () => {
  const user = await getUser(123);
  
  // Simulate concurrent update
  await updateUser({ ...user, data: 'A' });
  
  // This should fail
  await expect(updateUser({ ...user, data: 'B' }))
    .rejects.toThrow(ConflictError);
});
```

### Output Esperado
```markdown
✅ Race condition corrigida
✅ Optimistic locking implementado
✅ Load test passou (0% falhas)
✅ Monitoring de conflitos configurado
```

---

## 📊 Métricas de Sucesso

### Tempo de Resolução
- **Exemplo 1 (Null Reference):** 45 minutos
- **Exemplo 2 (Memory Leak):** 3 horas
- **Exemplo 3 (Logic Error):** 30 minutos
- **Exemplo 4 (Regression):** 1 hora
- **Exemplo 5 (Race Condition):** 4 horas

### Taxa de Sucesso
- **Reprodução:** 100% (todos os casos)
- **Isolamento:** 100% (todos os casos)
- **Causa Raiz:** 100% (5 Whys efetivo)
- **Fix Validado:** 100% (regression tests)

---

**Total de Exemplos:** 5  
**Cobertura de Cenários:** Runtime, Performance, Logic, Regression, Concurrency  
**Última Atualização:** 2026-01-30
