# Prompt: Otimização de Queries e Banco de Dados

> **Quando usar**: Ao identificar queries lentas ou planejar schema de banco
> **Especialista**: DBA / [Performance e Escalabilidade](../../02-especialistas/Especialista%20em%20Performance%20e%20Escalabilidade.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- Schema atual do banco ou modelo de domínio
- Queries problemáticas (se houver)
- Volume de dados esperado

Após gerar, salve o resultado em:
- `docs/07-performance/otimizacao-database.md`

---

## Prompt Completo

```text
Atue como DBA sênior especializado em otimização de banco de dados.

## Contexto do Projeto

[COLE BREVE DESCRIÇÃO DO SISTEMA]

## Banco de Dados

Tipo: [PostgreSQL/MySQL/MongoDB/etc]
Versão: [Versão]
Cloud: [RDS/Cloud SQL/Atlas/Self-hosted]
Tamanho atual: [XGB de dados]
Tamanho esperado: [X em 1 ano]

## Schema Atual

```sql
[COLE O SCHEMA DDL OU DESCREVA AS TABELAS]
```

## Queries Problemáticas (se houver)

```sql
-- Query 1: [Descrição]
[QUERY SQL]
-- Tempo atual: Xms
-- Frequência: Y vezes/dia
```

## Volume de Dados

- Tabela X: ~N registros, crescimento K/mês
- Tabela Y: ~N registros, crescimento K/mês

---

## Sua Missão

Analise e otimize o banco de dados:

### 1. Análise de Schema

#### 1.1 Tipos de Dados
- Tipos apropriados para cada coluna?
- Tamanhos excessivos (VARCHAR(255) desnecessário)?
- Nullable vs NOT NULL corretos?

#### 1.2 Normalização
- Está na forma normal adequada (3NF)?
- Há desnormalização intencional justificada?
- Redundância de dados?

#### 1.3 Relacionamentos
- Foreign keys definidas?
- Cascade appropriado?
- Índices em FKs?

### 2. Análise de Índices

#### 2.1 Índices Existentes
- Estão sendo utilizados?
- Há índices duplicados?
- Ordem das colunas correta?

#### 2.2 Índices Sugeridos
Para cada índice sugerido:
- Colunas e ordem
- Tipo (B-tree, Hash, GIN, GiST)
- Justificativa (queries beneficiadas)
- Impacto em writes

#### 2.3 Índices para Remover
- Índices não utilizados
- Índices duplicados

### 3. Otimização de Queries

Para cada query problemática:

#### 3.1 EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) [QUERY];
```

#### 3.2 Problemas Identificados
- Sequential scans em tabelas grandes?
- Nested loops com muitas iterações?
- Sort em memória vs disco?
- Hash joins custosos?

#### 3.3 Query Otimizada
```sql
-- Query original
[QUERY ORIGINAL]

-- Query otimizada
[QUERY OTIMIZADA]

-- Ganho: de Xms para Yms (Z% melhoria)
```

### 4. Design de Schema (se aplicável)

Para novas tabelas ou refatoração:

#### 4.1 DDL Otimizado
```sql
CREATE TABLE tabela (
  -- colunas com tipos otimizados
);

-- Índices
CREATE INDEX ...;

-- Constraints
ALTER TABLE ...;
```

#### 4.2 Particionamento
- Candidatos a particionamento
- Estratégia (range, list, hash)
- Manutenção de partições

### 5. Connection Pooling

- Pool size recomendado
- Timeout configurations
- Tool recomendada (PgBouncer, ProxySQL)

### 6. Vacuum e Manutenção (PostgreSQL)

- Vacuum strategy
- autovacuum settings
- Bloat monitoring
- REINDEX frequency

### 7. Migrations

Se sugerir alterações de schema:
```sql
-- Migration up
ALTER TABLE ...;

-- Migration down (rollback)
ALTER TABLE ...;
```

### 8. Métricas e Monitoramento

- Métricas essenciais
- Queries lentas (slow query log)
- Alertas recomendados
```

---

## Exemplo de Uso

```text
Atue como DBA sênior especializado em otimização de banco de dados.

## Contexto do Projeto

Sistema de agendamento para salões de beleza.
Consultas frequentes de disponibilidade.

## Banco de Dados

Tipo: PostgreSQL
Versão: 15
Cloud: AWS RDS (db.t3.medium)
Tamanho atual: 2GB
Tamanho esperado: 50GB em 1 ano

## Schema Atual

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY,
  nome VARCHAR(255),
  telefone VARCHAR(255),
  email VARCHAR(255),
  criado_em TIMESTAMP
);

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  profissional_id UUID REFERENCES profissionais(id),
  servico_id UUID REFERENCES servicos(id),
  data_hora TIMESTAMP,
  status VARCHAR(50),
  criado_em TIMESTAMP
);
```

## Queries Problemáticas

```sql
-- Query 1: Buscar disponibilidade de um profissional
SELECT * FROM agendamentos 
WHERE profissional_id = $1 
AND data_hora BETWEEN $2 AND $3
AND status != 'CANCELADO';
-- Tempo atual: 800ms
-- Frequência: 1000 vezes/dia
```

## Volume de Dados

- clientes: ~10.000 registros, +500/mês
- agendamentos: ~100.000 registros, +5.000/mês
```

---

## Resposta Esperada

### Schema Otimizado

```sql
-- Problema: VARCHAR(255) excessivo e sem índices
-- Correção: tipos adequados e índices

ALTER TABLE clientes ALTER COLUMN telefone TYPE VARCHAR(20);
ALTER TABLE clientes ALTER COLUMN email TYPE VARCHAR(100);
ALTER TABLE agendamentos ALTER COLUMN status TYPE VARCHAR(20);

-- Índices para a query de disponibilidade
CREATE INDEX idx_agendamentos_disponibilidade 
ON agendamentos (profissional_id, data_hora) 
WHERE status != 'CANCELADO';
```

### Query Otimizada

```sql
-- EXPLAIN original: Seq Scan (800ms)
-- EXPLAIN otimizado: Index Scan (15ms)

-- Query otimizada (mesma, mas usando índice parcial)
SELECT id, cliente_id, servico_id, data_hora, status
FROM agendamentos 
WHERE profissional_id = $1 
  AND data_hora >= $2 
  AND data_hora < $3
  AND status != 'CANCELADO';

-- Ganho: de 800ms para 15ms (98% melhoria)
```

### Índices Recomendados

| Tabela | Índice | Tipo | Justificativa |
|--------|--------|------|---------------|
| agendamentos | (profissional_id, data_hora) | B-tree parcial | Query de disponibilidade |
| agendamentos | (cliente_id, data_hora) | B-tree | Histórico do cliente |
| agendamentos | (data_hora) | B-tree | Relatórios por período |

---

## Checklist Pós-Geração

- [ ] Tipos de dados otimizados
- [ ] Índices sugeridos com justificativa
- [ ] EXPLAIN ANALYZE das queries
- [ ] Queries otimizadas com ganho estimado
- [ ] Connection pooling configurado
- [ ] Particionamento avaliado (se dados grandes)
- [ ] Vacuum/maintenance configurado
- [ ] Métricas de monitoramento
- [ ] Migrations para alterações
- [ ] Salvar em `docs/07-performance/otimizacao-database.md`
