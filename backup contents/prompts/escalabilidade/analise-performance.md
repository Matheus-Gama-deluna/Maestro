# Prompt: Análise de Performance e Escalabilidade

> **Quando usar**: Após implementação inicial, antes de ir para produção, ou ao identificar gargalos
> **Especialista**: [Performance e Escalabilidade](../../02-especialistas/Especialista%20em%20Performance%20e%20Escalabilidade.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento atual do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura do sistema
- Métricas atuais (se existirem)

Após gerar, salve o resultado em:
- `docs/07-performance/analise-performance.md`

---

## Prompt Completo

```text
Atue como engenheiro de performance sênior.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Arquitetura Atual

Arquitetura: [DESCREVA COMPONENTES - API, Frontend, Banco, Cache, etc]
Stack: [TECNOLOGIAS USADAS]
Banco de dados: [TIPO, TAMANHO ESTIMADO DOS DADOS]
Infraestrutura: [Cloud provider, containers, serverless, etc]

## Requisitos de Performance

Usuários esperados: [NÚMERO DE USUÁRIOS SIMULTÂNEOS]
Requests/segundo esperados: [NÚMERO]
SLA desejado: [LATÊNCIA p95, UPTIME %]

## Endpoints Críticos

[LISTE OS 3-5 ENDPOINTS MAIS IMPORTANTES]
- [Endpoint 1]: [Descrição e frequência de uso]
- [Endpoint 2]: [Descrição e frequência de uso]

---

## Sua Missão

Analise e proponha otimizações de performance e escalabilidade:

### 1. Análise de Gargalos

#### 1.1 Database
- Queries potencialmente problemáticas
- Necessidade de índices
- N+1 queries
- Connection pool sizing
- Locks e deadlocks potenciais

#### 1.2 Application
- CPU-bound vs I/O-bound operations
- Memory leaks potenciais
- Concurrency issues
- Bloqueios síncronos desnecessários
- Cold starts (se serverless)

#### 1.3 Network
- Latência entre serviços
- Payload sizes (compressão)
- Número de roundtrips
- DNS lookups

#### 1.4 Frontend (se aplicável)
- Bundle size
- Imagens e assets
- Render blocking resources

### 2. Estratégia de Caching

#### 2.1 O que cachear
- Dados que mudam raramente
- Queries frequentes e custosas
- Sessões e autenticação
- Respostas de APIs externas

#### 2.2 Onde cachear
| Camada | Tecnologia | Casos de Uso |
|--------|------------|--------------|
| Application | In-memory | Hot data |
| Distributed | Redis/Memcached | Sessões, queries |
| CDN | CloudFlare/CloudFront | Assets, páginas |
| Browser | Cache headers | Assets estáticos |

#### 2.3 Cache Policies
- TTL por tipo de dado
- Estratégia de invalidação (write-through, write-behind, cache-aside)
- Handling de cache miss thundering herd

### 3. Escalabilidade

#### 3.1 Horizontal Scaling (Scale Out)
- Quais componentes escalam horizontalmente
- Como manter estado (stateless vs stateful)
- Session affinity considerations
- Load balancing strategy

#### 3.2 Database Scaling
- Read replicas
- Sharding (se necessário)
- Connection pooling (PgBouncer, ProxySQL)
- Particionamento de tabelas

#### 3.3 Auto-scaling
| Métrica | Threshold | Ação |
|---------|-----------|------|
| CPU | > X% | Scale up |
| Memory | > Y% | Scale up |
| Queue depth | > Z | Add workers |
| Response time | > Wms | Scale out |

- Cooldown periods
- Minimum/Maximum instances

### 4. Performance Targets (SLOs)

| Endpoint/Fluxo | Latência p50 | Latência p95 | Throughput |
|----------------|--------------|--------------|------------|
| [Endpoint 1] | < Xms | < Yms | Z req/s |
| [Endpoint 2] | < Xms | < Yms | Z req/s |

### 5. Query Optimization

Para as queries mais críticas, sugira:
- Índices necessários
- Query rewrites
- Explain analyze interpretation

### 6. Plano de Load Test

- Cenários a testar (ramp-up, spike, soak)
- Ferramentas sugeridas (k6, Locust, Artillery)
- Métricas a monitorar durante teste
- Baseline vs target

### 7. Quick Wins vs Long Term

| Otimização | Esforço | Impacto | Prioridade |
|------------|---------|---------|------------|
| [Otimização 1] | Baixo | Alto | ⭐⭐⭐ |
| [Otimização 2] | Médio | Alto | ⭐⭐⭐ |
| [Otimização 3] | Alto | Médio | ⭐⭐ |
```

---

## Exemplo de Uso

```text
Atue como engenheiro de performance sênior.

## Contexto do Projeto

Marketplace de serviços locais com agendamento online.

## Arquitetura Atual

Arquitetura: 
- Frontend: Next.js na Vercel
- API: NestJS em containers no ECS
- Banco: PostgreSQL RDS (db.t3.medium)
- Cache: Nenhum atualmente

Stack: Node.js 18, TypeScript, Prisma ORM
Banco de dados: PostgreSQL 15, ~50GB de dados esperados
Infraestrutura: AWS (ECS, RDS, ALB)

## Requisitos de Performance

Usuários esperados: 1000 simultâneos no pico
Requests/segundo esperados: 200
SLA desejado: p95 < 300ms, 99.9% uptime

## Endpoints Críticos

- GET /api/profissionais?cidade=X: Listagem de prestadores (~40% do tráfego)
- POST /api/agendamentos: Criação de agendamento (~15% do tráfego)
- GET /api/agenda/:id/disponibilidade: Horários livres (~30% do tráfego)
```

---

## Resposta Esperada

### Gargalos Identificados

1. **Query de listagem** - Falta índice em `cidade` + `ativo`
2. **Disponibilidade** - Consulta completa para calcular, deveria ser pré-computada
3. **Sessões** - Stored in DB, should be Redis
4. **Sem cache** - Queries repetidas a cada request

### Cache Strategy

| Dado | Onde | TTL | Invalidação |
|------|------|-----|-------------|
| Lista de profissionais | Redis | 5min | On update |
| Disponibilidade | Redis | 1min | On agendamento |
| Sessão | Redis | 1h | On logout |
| Assets | CDN | 1 semana | Deploy hash |

### Scaling

- **API**: 2-10 pods, HPA on CPU > 70%
- **Database**: 1 primary + 2 read replicas
- **Redis**: ElastiCache cluster mode

### Quick Wins

| Otimização | Esforço | Impacto |
|------------|---------|---------|
| Adicionar Redis para sessões | 2h | Alto |
| Índice em cidade+ativo | 30min | Alto |
| Cache de listagem | 4h | Alto |
| Read replica para queries | 2h | Médio |

---

## Checklist Pós-Geração

- [ ] Gargalos identificados por camada (DB, App, Network)
- [ ] Estratégia de cache definida (o quê, onde, TTL)
- [ ] Índices sugeridos para queries críticas
- [ ] Thresholds de auto-scaling definidos
- [ ] SLOs documentados por endpoint
- [ ] Quick wins priorizados
- [ ] Plano de load test sugerido
- [ ] Salvar em `docs/07-performance/analise-performance.md`
