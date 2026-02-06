# 📖 Casos de Uso - MCP Maestro em Ação

**Data:** 01/02/2026  
**Versão:** 1.0.0  
**Objetivo:** Demonstrar o MCP Maestro resolvendo problemas reais de desenvolvimento

---

## 🎯 Visão Geral

Este documento apresenta **6 casos de uso práticos** que demonstram como o MCP Maestro resolve os problemas identificados na análise de lacunas.

---

## Caso de Uso #1: Projeto Novo do Zero

### 📋 Cenário

> **Desenvolvedor:** "Preciso criar um sistema de gestão de pedidos para restaurante"

### ❌ Sem MCP Maestro

```
Desenvolvedor: "Cria um sistema de gestão de pedidos"

IA Genérica: 
"Aqui está um sistema básico..."
[Gera código genérico de CRUD]
[Não pergunta sobre requisitos]
[Não considera arquitetura]
[Não documenta decisões]

Resultado:
- Código funcional mas sem estrutura
- Sem documentação
- Débito técnico desde o início
- Decisões não rastreáveis
```

### ✅ Com MCP Maestro

```
Desenvolvedor: "Cria um sistema de gestão de pedidos"

MCP Maestro:
🎯 Iniciando MCP Maestro...

📋 Fase 1: Produto
🤖 Especialista: Gestão de Produto

Como Product Manager, preciso entender:
1. Qual problema específico estamos resolvendo?
2. Quem são os usuários principais (garçons, cozinha, gerentes)?
3. Quais funcionalidades do MVP?
4. Qual a métrica de sucesso?

Desenvolvedor: "Garçons fazem pedidos no tablet, cozinha visualiza,
gerentes veem relatórios. MVP: pedidos + cardápio + relatório básico"

MCP Maestro:
📄 Gerando PRD...

# PRD - RestaurantePro

## Problema
Restaurantes perdem tempo e pedidos com sistema manual...

## Personas
1. Garçom (Pedro) - Faz pedidos rápido
2. Cozinheiro (Maria) - Precisa ver claramente
3. Gerente (João) - Quer relatórios

## MVP
- Cadastro de cardápio
- Fazer pedido
- Visualizar pedidos na cozinha
- Relatório de vendas

## North Star Metric
Tempo médio de atendimento < 15 minutos

✅ Gate 1 Aprovado (Score: 95/100)

📋 Fase 2: Requisitos
🤖 Especialista: Engenharia de Requisitos

Analisando PRD para extrair requisitos...

## Requisitos Funcionais
RF-001: Sistema deve permitir cadastro de itens no cardápio
RF-002: Garçom deve conseguir fazer pedido em < 30 segundos
RF-003: Cozinha deve ver pedidos em tempo real
...

## Requisitos Não-Funcionais
RNF-001: Sistema deve suportar 50 usuários simultâneos
RNF-002: Tempo de resposta < 200ms
RNF-003: Disponibilidade 99.5%

## Critérios de Aceite (Gherkin)
```gherkin
Cenário: Fazer pedido
  Dado que sou um garçom logado
  E tenho uma mesa selecionada
  Quando adiciono "Pizza Margherita" ao pedido
  E confirmo o pedido
  Então a cozinha deve ver o pedido em < 5 segundos
```

✅ Gate 2 Aprovado (Score: 88/100)

[Continua pelas 7-13 fases...]
```

### 📊 Comparativo

| Aspecto | Sem Maestro | Com Maestro |
|---------|-------------|-------------|
| Tempo para código | 2 horas | 8 horas total |
| Documentação | ❌ Nenhuma | ✅ Completa |
| Arquitetura | ❌ Ad-hoc | ✅ Planejada |
| Decisões | ❌ Não rastreáveis | ✅ ADRs |
| Débito técnico | 🔴 Alto | 🟢 Mínimo |
| Manutenibilidade | 🔴 Baixa | 🟢 Alta |

---

## Caso de Uso #2: Perda de Contexto Entre Sessões

### 📋 Cenário

> **Desenvolvedor:** Trabalhou no projeto ontem, decidiu usar PostgreSQL. Hoje continua.

### ❌ Sem MCP Maestro

```
--- Sessão 1 (Ontem) ---
Developer: "Qual banco usar para e-commerce?"
IA: "PostgreSQL é boa escolha por ACID, JSON support..."
Developer: "OK, vamos com PostgreSQL"
[FIM DA SESSÃO]

--- Sessão 2 (Hoje) ---
Developer: "Continua o projeto"
IA: "Qual projeto? Não tenho contexto anterior..."
Developer: "O e-commerce que estávamos fazendo"
IA: "OK, vou gerar um schema básico"
[Gera schema genérico, ignora decisões de ontem]
Developer: "Espera, ontem decidimos PostgreSQL"
IA: "Ah, desculpe, não tinha essa informação..."
```

### ✅ Com MCP Maestro

```
--- Sessão 1 (Ontem) ---
Developer: "Qual banco usar para e-commerce?"

MCP Maestro:
🤖 Especialista: Arquitetura de Software

Analisando requisitos do PRD...

Alternativas:
1. PostgreSQL: ACID ✅, Relacional ✅, JSONB ✅
2. MongoDB: Flexível ✅, mas sem ACID forte ❌
3. MySQL: Familiar, mas menos features

Recomendação: PostgreSQL

Developer: "Aceito PostgreSQL"

MCP Maestro:
📝 Salvando ADR-003: Escolha de Banco de Dados

# ADR-003: PostgreSQL como Banco Principal

**Status:** Aceito
**Contexto:** E-commerce precisa de ACID para transações
**Decisão:** PostgreSQL 16
**Consequências:** 
- ✅ Transações seguras
- ✅ JSONB para flexibilidade
- ⚠️ Curva de aprendizado

[FIM DA SESSÃO - estado salvo em .maestro/estado.json]

--- Sessão 2 (Hoje) ---
Developer: "Continua o projeto"

MCP Maestro:
📂 Carregando projeto: EcommercePro

📊 Status:
- Fase atual: 5 (Banco de Dados)  
- Complexidade: Médio (13 fases)
- Última decisão: PostgreSQL escolhido (ADR-003)

📋 Resumo do contexto:
- Stack: Node.js + NestJS + PostgreSQL
- Decisões: Monolito modular, PostgreSQL, JWT auth
- Próximo passo: Design do schema

🤖 Especialista: Banco de Dados

Baseado no modelo de domínio (Fase 4), vou criar o schema:

```sql
-- Usando PostgreSQL conforme ADR-003
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  status order_status NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Developer: "Perfeito, você lembrou de tudo!"
```

### 📊 Comparativo

| Aspecto | Sem Maestro | Com Maestro |
|---------|-------------|-------------|
| Contexto mantido | ❌ Perdido | ✅ 100% |
| Decisões lembradas | ❌ Esquecidas | ✅ Via ADRs |
| Retrabalho | 🔴 Alto | 🟢 Zero |
| Frustração | 🔴 Alta | 🟢 Baixa |

---

## Caso de Uso #3: Hallucination de Biblioteca

### 📋 Cenário

> **Desenvolvedor:** Pede para implementar cache no projeto

### ❌ Sem MCP Maestro

```
Developer: "Adiciona cache no projeto"

IA Genérica:
"Vou usar a biblioteca react-super-cache..."

import { useAdvancedCache } from 'react-super-cache';  // ❌ NÃO EXISTE

const MyComponent = () => {
  const { data, cache } = useAdvancedCache('/api/products');
  // ...
}

Developer: [Tenta instalar]
npm install react-super-cache
npm ERR! 404 Not Found - react-super-cache

Developer: "Essa biblioteca não existe!"
IA: "Desculpe, vou tentar outra..."
[Ciclo se repete]
```

### ✅ Com MCP Maestro

```
Developer: "Adiciona cache no projeto"

MCP Maestro:
🔍 Analisando contexto do projeto...

Contexto detectado:
- Stack: React + Next.js
- Já usa: react-query para data fetching
- Decisão ADR-007: Redis para cache server-side

🤖 Especialista: Frontend

Para cache, temos opções compatíveis com seu stack:

CLIENT-SIDE (React):
1. react-query (já instalado) - Recomendado ✅
   - Cache automático de queries
   - Stale-while-revalidate
   - Você já usa!

2. SWR - Alternativa do Vercel
   - Similar ao react-query
   - Mais leve

SERVER-SIDE (conforme ADR-007):
- Redis (já decidido)

Recomendação: Usar react-query que já está no projeto

Developer: "OK, usa react-query"

MCP Maestro:
```typescript
// Usando react-query (já instalado)
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Invalidação manual quando necessário
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['products'] });
```

✅ Validação: Todas bibliotecas existem e estão instaladas
```

### 📊 Comparativo

| Aspecto | Sem Maestro | Com Maestro |
|---------|-------------|-------------|
| Bibliotecas | ❌ Inventadas | ✅ Validadas |
| Compatibilidade | ❌ Não verificada | ✅ Verificada |
| Tempo perdido | 🔴 30+ min | 🟢 0 min |
| Frustração | 🔴 Alta | 🟢 Zero |

---

## Caso de Uso #4: Vulnerabilidade de Segurança

### 📋 Cenário

> **Desenvolvedor:** Pede para criar endpoint de login

### ❌ Sem MCP Maestro

```
Developer: "Cria endpoint de login"

IA Genérica:
```javascript
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // ❌ SQL Injection vulnerável
  const user = await db.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
  
  // ❌ Comparação de senha insegura
  if (user.password === password) {
    // ❌ Token sem expiração
    const token = jwt.sign({ userId: user.id }, 'secret');
    
    // ❌ Senha no log
    console.log(`User ${email} logged in with ${password}`);
    
    res.json({ token });
  }
});
```

Vulnerabilidades introduzidas:
1. SQL Injection
2. Senha em texto plano
3. Secret hardcoded
4. Token sem expiração
5. Senha em logs
```

### ✅ Com MCP Maestro

```
Developer: "Cria endpoint de login"

MCP Maestro:
🔒 Especialista: Segurança da Informação

Analisando requisitos de segurança...

⚠️ Login é endpoint CRÍTICO para segurança
Aplicando checklist OWASP:

```typescript
// ✅ Validação de input com Zod
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

app.post('/login', 
  // ✅ Rate limiting
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  
  async (req, res) => {
    // ✅ Validação de schema
    const { email, password } = loginSchema.parse(req.body);
    
    // ✅ Query parametrizada (sem SQL injection)
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (!user) {
      // ✅ Mensagem genérica (não revela se email existe)
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // ✅ Comparação segura de hash
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      // ✅ Log seguro (sem senha)
      logger.warn('Failed login attempt', { email, ip: req.ip });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // ✅ Token com expiração
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,  // ✅ Secret em env
      { expiresIn: '1h' }
    );
    
    // ✅ Log sem dados sensíveis
    logger.info('Successful login', { userId: user.id });
    
    // ✅ Cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    
    res.json({ success: true });
  }
);
```

🔒 Checklist de Segurança:
- [x] SQL Injection protegido
- [x] Rate limiting implementado  
- [x] Senhas hasheadas com bcrypt
- [x] Token com expiração
- [x] Secrets em variáveis de ambiente
- [x] Logs sem dados sensíveis
- [x] Cookie httpOnly

📝 ADR-012: Padrão de Autenticação
[Documenta decisões de segurança]
```

### 📊 Comparativo

| Aspecto | Sem Maestro | Com Maestro |
|---------|-------------|-------------|
| SQL Injection | ❌ Vulnerável | ✅ Protegido |
| Senha em logs | ❌ Exposta | ✅ Seguro |
| Rate limiting | ❌ Ausente | ✅ Implementado |
| Token expiration | ❌ Sem | ✅ 1 hora |
| Score OWASP | 🔴 20% | 🟢 95% |

---

## Caso de Uso #5: Arquitetura Inconsistente

### 📋 Cenário

> **Desenvolvedor:** Projeto usa Clean Architecture, pede novo módulo

### ❌ Sem MCP Maestro

```
Developer: "Cria módulo de notificações"

IA Genérica:
```typescript
// ❌ Viola Clean Architecture
// NotificationController.ts
import { db } from '../database';  // ❌ Controller acessando DB
import { sendEmail } from '../services/email';

class NotificationController {
  async sendNotification(req, res) {
    // ❌ Lógica de negócio no controller
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    
    // ❌ Infraestrutura no controller
    await sendEmail(user.email, 'Nova notificação!');
    
    // ❌ Persistência direto
    await db.query('INSERT INTO notifications...');
  }
}
```

Problemas:
- Controller acessa banco diretamente
- Lógica de negócio espalhada
- Nenhuma separação de camadas
- Impossível testar unitariamente
```

### ✅ Com MCP Maestro

```
Developer: "Cria módulo de notificações"

MCP Maestro:
🏗️ Especialista: Arquitetura de Software

📊 Analisando arquitetura do projeto...

Arquitetura detectada: Clean Architecture (ADR-002)
Camadas identificadas:
├── domain/        # Entidades e regras de negócio
├── application/   # Use cases
├── infrastructure/# Implementações externas
└── presentation/  # Controllers e APIs

🔍 Validando com Fitness Functions...
Regra: Domain NÃO pode importar Infrastructure ✅
Regra: Application pode importar apenas Domain ✅

Gerando módulo seguindo padrão do projeto:

```
src/notifications/
├── domain/
│   ├── entities/
│   │   └── Notification.ts       # Entidade pura
│   ├── repositories/
│   │   └── INotificationRepository.ts  # Interface
│   └── services/
│       └── INotificationSender.ts      # Interface
├── application/
│   ├── use-cases/
│   │   └── SendNotification.ts   # Use case
│   └── dtos/
│       └── SendNotificationDTO.ts
├── infrastructure/
│   ├── repositories/
│   │   └── PostgresNotificationRepository.ts
│   └── services/
│       └── EmailNotificationSender.ts
└── presentation/
    └── NotificationController.ts
```

```typescript
// domain/entities/Notification.ts
// ✅ Entidade pura, sem dependências externas
export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly message: string,
    public readonly type: NotificationType,
    public readonly sentAt?: Date
  ) {}
  
  markAsSent(): Notification {
    return new Notification(
      this.id, this.userId, this.message, this.type, new Date()
    );
  }
}

// application/use-cases/SendNotification.ts
// ✅ Use case depende apenas de interfaces (DIP)
export class SendNotification {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly notificationSender: INotificationSender,
  ) {}
  
  async execute(dto: SendNotificationDTO): Promise<void> {
    const notification = new Notification(/*...*/);
    await this.notificationSender.send(notification);
    await this.notificationRepo.save(notification.markAsSent());
  }
}

// presentation/NotificationController.ts
// ✅ Controller apenas orquestra
export class NotificationController {
  constructor(private readonly sendNotification: SendNotification) {}
  
  async handle(req: Request, res: Response) {
    await this.sendNotification.execute(req.body);
    res.status(201).json({ success: true });
  }
}
```

✅ Fitness Functions Check:
- Domain não importa Infrastructure: PASS ✅
- Application só importa Domain: PASS ✅
- Sem dependências circulares: PASS ✅
- Interfaces antes de implementações: PASS ✅
```

### 📊 Comparativo

| Aspecto | Sem Maestro | Com Maestro |
|---------|-------------|-------------|
| Respeita arquitetura | ❌ Viola | ✅ Segue |
| Testabilidade | ❌ Difícil | ✅ Fácil |
| Acoplamento | 🔴 Alto | 🟢 Baixo |
| Manutenibilidade | 🔴 Baixa | 🟢 Alta |
| Fitness Functions | ❌ Não tem | ✅ Validado |

---

## Caso de Uso #6: Refactoring Seguro

### 📋 Cenário

> **Desenvolvedor:** Precisa refatorar módulo de pagamentos

### ❌ Sem MCP Maestro

```
Developer: "Refatora o módulo de pagamentos"

IA Genérica:
"OK, vou refatorar..."
[Muda várias coisas de uma vez]
[Não cria checkpoint]
[Quebra testes existentes]
[Difícil reverter]

Developer: "Quebrou tudo! Como volto atrás?"
IA: "Você tem o git..."
Developer: "Mas fiz 5 commits no meio..."
```

### ✅ Com MCP Maestro

```
Developer: "Refatora o módulo de pagamentos"

MCP Maestro:
🔄 Iniciando fluxo de refatoração...

📊 Análise de Impacto:
- Arquivos afetados: 12
- Testes existentes: 47
- Cobertura atual: 78%
- Dependentes: orders, users, reports

⚠️ Risco: MÉDIO
Requer aprovação antes de prosseguir.

Developer: "Pode prosseguir"

MCP Maestro:
📸 Criando checkpoint: CP-015-pre-refactor-payments
✅ Checkpoint salvo

🧪 Executando testes antes do refactoring...
47/47 tests passing ✅

📋 Plano de Refatoração:

Fase 1: Testes de Caracterização
- Adicionar testes que capturam comportamento atual
- Garantir 90%+ cobertura no módulo

Fase 2: Extração de Interfaces
- Criar interfaces para desacoplamento
- Aplicar Dependency Injection

Fase 3: Refatoração Incremental
- Pequenas mudanças com testes a cada passo
- Commit atômicos

Fase 4: Validação
- Todos testes passando
- Fitness functions OK
- Code review

Iniciando Fase 1...

[Durante o processo]

🔴 ERRO: Teste payment.integration.spec.ts falhou

Analisando...
Causa: Mudança em PaymentService.process() quebrou contrato

Opções:
1. 🔧 Auto-corrigir (confiança: 85%)
2. ↩️ Rollback para checkpoint
3. 👤 Solicitar ajuda humana

Developer: "Tenta auto-corrigir"

MCP Maestro:
🔧 Aplicando correção...
Problema: Parâmetro 'currency' agora obrigatório
Solução: Adicionar default value 'BRL'

✅ Correção aplicada
🧪 Re-executando testes... 47/47 passing ✅

Continuar refatoração?
Developer: "Sim"

[Ao final]

✅ Refatoração completa!

📊 Resumo:
- Arquivos modificados: 12
- Testes: 47 → 62 (+15)
- Cobertura: 78% → 91%
- Tempo: 2 horas
- Checkpoints: 3 criados
- Rollbacks: 0 necessários

📝 ADR-018: Refatoração do Módulo de Pagamentos
[Documenta mudanças e decisões]
```

### 📊 Comparativo

| Aspecto | Sem Maestro | Com Maestro |
|---------|-------------|-------------|
| Checkpoints | ❌ Manual/git | ✅ Automáticos |
| Testes antes | ❌ Esquecidos | ✅ Obrigatórios |
| Rollback | 🔴 Difícil | 🟢 Um comando |
| Auto-correção | ❌ Não tem | ✅ 85% dos casos |
| Documentação | ❌ Nenhuma | ✅ ADR automático |

---

## 📊 Resumo dos Casos de Uso

| Caso | Problema | Solução Maestro | Benefício |
|------|----------|-----------------|-----------|
| #1 Projeto Novo | Código sem estrutura | Fases + Especialistas | Qualidade desde o início |
| #2 Contexto | Esquece decisões | Estado persistente + ADRs | Zero retrabalho |
| #3 Hallucination | Bibliotecas fictícias | Validação de dependências | Zero tempo perdido |
| #4 Segurança | Vulnerabilidades | Especialista + OWASP | 95% score segurança |
| #5 Arquitetura | Viola padrões | Fitness Functions | Arquitetura mantida |
| #6 Refactoring | Quebra sem volta | Checkpoints + Rollback | Refatoração segura |

---

## 🎯 Próximos Passos

Para implementar esses casos de uso, consulte:
- [Roadmap de Implementação](./00_ROADMAP_IMPLEMENTACAO_MCP_MAESTRO.md)
- [Arquitetura de Soluções](./00_ARQUITETURA_SOLUCOES_MAESTRO.md)
- [Plano de Evolução](./01_PLANO_EVOLUCAO_MCP_MAESTRO.md)

---

**Versão:** 1.0.0  
**Última Atualização:** 01/02/2026
