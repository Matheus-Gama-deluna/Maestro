# [Nome do Projeto] - Índices de Banco de Dados

## Sumário Executivo
[ ] **Projeto:** [Nome do projeto]
[ ] **Versão:** [Versão atual]
[ ] **Data:** [Data de criação]
[ ] **Status:** [Em elaboração/Revisão/Aprovado]
[ ] **Autor:** [DBA]
[ ] **Aprovadores:** [Stakeholders]

---

## 1. Visão Geral dos Índices

### 1.1 Estratégia de Indexação
- **Objetivo:** Otimizar performance de queries
- **Trade-off:** Espaço em disco vs performance
- **Impacto:** [Descrição do impacto esperado]
- **Monitoramento:** [Como monitorar efetividade]

### 1.2 Categorias de Índices
- **Índices Primários:** PKs (criados automaticamente)
- **Índices Únicos:** Para unicidade
- **Índices Compostos:** Múltiplas colunas
- **Índices Parciais:** Para prefix searches
- **Índices Funcionais:** Para expressões

### 1.3 Métricas de Performance
- **Queries otimizadas:** [Número de queries]
- **Tempo médio:** [ms]
- **Cache hit rate:** [%]
- **Disk usage:** [MB/GB]

---

## 2. Índices por Tabela

### 2.1 [Nome da Tabela 1]

#### Índices Primários
```sql
-- PK (criado automaticamente)
ALTER TABLE [tabela] ADD CONSTRAINT pk_[tabela] PRIMARY KEY (id);
```

#### Índices Únicos
```sql
-- Email único
CREATE UNIQUE INDEX idx_[tabela]_email ON [tabela] (email);

-- Username único
CREATE UNIQUE INDEX idx_[tabela]_username ON [tabela] (username);
```

#### Índices Simples
```sql
-- Índice para busca por status
CREATE INDEX idx_[tabela]_status ON [tabela] (status);

-- Índice para busca por created_at
CREATE INDEX idx_[tabela]_created_at ON [tabela] (created_at);
```

#### Índices Compostos
```sql
-- Índice composto para queries comuns
CREATE INDEX idx_[tabela]_status_created_at ON [tabela] (status, created_at);

-- Índice composto para ordenação
CREATE INDEX idx_[tabela]_category_name ON [tabela] (category, name);
```

#### Índices Parciais
```sql
-- Índice parcial para usuários ativos
CREATE INDEX idx_[tabela]_active_users ON [tabela] (email) WHERE deleted_at IS NULL;

-- Índice parcial para produtos em estoque
CREATE INDEX idx_[tabela]_in_stock ON [tabela] (id) WHERE stock > 0;
```

#### Índices Funcionais
```sql
-- Índice para busca case-insensitive
CREATE INDEX idx_[tabela]_email_lower ON [tabela] (LOWER(email));

-- Índice para substring search
CREATE INDEX idx_[tabela]_name_prefix ON [tabela] (name varchar_pattern_ops);
```

### 2.2 [Nome da Tabela 2]

#### Índices Primários
```sql
-- PK (criado automaticamente)
ALTER TABLE [tabela] ADD CONSTRAINT pk_[tabela] PRIMARY KEY (id);
```

#### Índices Simples
```sql
-- Índice para FK
CREATE INDEX idx_[tabela]_user_id ON [tabela] (user_id);

-- Índice para status
CREATE INDEX idx_[tabela]_status ON [tabela] (status);
```

#### Índices Compostos
```sql
-- Índice composto para queries comuns
CREATE INDEX idx_[tabela]_user_status ON [tabela] (user_id, status);

-- Índice composto para ordenação
CREATE INDEX idx_[tabela]_created_status ON [tabela] (created_at, status);
```

---

## 3. Índices Especializados

### 3.1 Índices GIN (PostgreSQL)
```sql
-- Índice para JSONB
CREATE INDEX idx_[tabela]_metadata_gin ON [tabela] USING GIN (metadata);

-- Índice para arrays
CREATE INDEX idx_[tabela]_tags_gin ON [tabela] USING GIN (tags);

-- Índice para full-text search
CREATE INDEX idx_[tabela]_search_gin ON [tabela] USING GIN (to_tsvector('portuguese', content));
```

### 3.2 Índices GiST (PostgreSQL)
```sql
-- Índice para geolocalização
CREATE INDEX idx_[tabela]_location_gist ON [tabela] USING GIST (location);

-- Índice para range types
CREATE INDEX idx_[tabela]_date_range_gist ON [tabela] USING GIST (date_range);
```

### 3.3 Índices BRIN (PostgreSQL)
```sql
-- Índice para tabelas muito grandes
CREATE INDEX idx_[tabela]_created_at_brin ON [tabela] USING BRIN (created_at);

-- Índice para logs
CREATE INDEX idx_[tabela]_timestamp_brin ON [tabela] USING BRIN (timestamp);
```

### 3.4 Índices Hash
```sql
-- Índice hash para igualdade exata
CREATE INDEX idx_[tabela]_hash_status ON [tabela] USING HASH (status);

-- Índice hash para UUIDs
CREATE INDEX idx_[tabela]_hash_id ON [tabela] USING HASH (id);
```

---

## 4. Índices por Tipo de Query

### 4.1 Queries de Busca
```sql
-- Query: SELECT * FROM users WHERE email = ?;
-- Índice: idx_users_email (único)

-- Query: SELECT * FROM products WHERE category = ? AND status = 'active';
-- Índice: idx_products_category_status (composto)

-- Query: SELECT * FROM orders WHERE user_id = ? AND created_at > ?;
-- Índice: idx_orders_user_created_at (composto)
```

### 4.2 Queries de Ordenação
```sql
-- Query: SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;
-- Índice: idx_posts_created_at (simples)

-- Query: SELECT * FROM products WHERE category = ? ORDER BY price ASC;
-- Índice: idx_products_category_price (composto)
```

### 4.3 Queries de Join
```sql
-- Query: SELECT u.*, o.* FROM users u JOIN orders o ON u.id = o.user_id;
-- Índice: idx_orders_user_id (FK)

-- Query: SELECT p.*, c.* FROM products p JOIN categories c ON p.category_id = c.id;
-- Índice: idx_products_category_id (FK)
```

### 4.4 Queries de Agregação
```sql
-- Query: SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;
-- Índice: idx_orders_user_id (simples)

-- Query: SELECT category, COUNT(*) FROM products GROUP BY category;
-- Índice: idx_products_category (simples)
```

---

## 5. Índices para Full-Text Search

### 5.1 Configuração de Full-Text Search
```sql
-- Configurar dicionário português
CREATE TEXT SEARCH DICTIONARY portuguese_dict (
    TEMPLATE = simple,
    STOPWORDS = portuguese
);

CREATE TEXT SEARCH CONFIGURATION portuguese (
    COPY = english,
    DICTIONARY = portuguese_dict
);
```

### 5.2 Índices GIN para Full-Text Search
```sql
-- Índice para busca em conteúdo
CREATE INDEX idx_[tabela]_content_fts ON [tabela] USING GIN (
    to_tsvector('portuguese', title || ' ' || content)
);

-- Índice para busca em título
CREATE INDEX idx_[tabela]_title_fts ON [tabela] USING GIN (
    to_tsvector('portuguese', title)
);
```

### 5.3 Queries de Full-Text Search
```sql
-- Busca simples
SELECT * FROM [tabela] 
WHERE to_tsvector('portuguese', title || ' ' || content) @@ to_tsquery('portuguese', 'palavra');

-- Busca com ranking
SELECT *, ts_rank(to_tsvector('portuguese', title || ' ' || content), to_tsquery('portuguese', 'palavra')) as rank
FROM [tabela] 
WHERE to_tsvector('portuguese', title || ' ' || content) @@ to_tsquery('portuguese', 'palavra')
ORDER BY rank DESC;
```

---

## 6. Índices para IA/ML

### 6.1 Índices Vector (pgvector)
```sql
-- Criar extensão vector
CREATE EXTENSION IF NOT EXISTS vector;

-- Índice para embeddings
CREATE INDEX idx_[tabela]_embedding ON [tabela] USING ivfflat (embedding vector_cosine_ops);

-- Índice para similaridade
CREATE INDEX idx_[tabela]_embedding_cosine ON [tabela] USING ivfflat (embedding vector_cosine_ops);
```

### 6.2 Queries de Similaridade
```sql
-- Busca por similaridade
SELECT *, embedding <-> '[0.1, 0.2, 0.3]'::vector as distance
FROM [tabela]
ORDER BY embedding <-> '[0.1, 0.2, 0.3]'::vector
LIMIT 10;

-- Busca com threshold
SELECT *, embedding <-> '[0.1, 0.2, 0.3]'::vector as distance
FROM [tabela]
WHERE embedding <-> '[0.1, 0.2, 0.3]'::vector < 0.5
ORDER BY embedding <-> '[0.1, 0.2, 0.3]'::vector;
```

---

## 7. Índices para Time-Series

### 7.1 Índices BRIN para Time-Series
```sql
-- Índice BRIN para timestamp
CREATE INDEX idx_[tabela]_timestamp_brin ON [tabela] USING BRIN (timestamp);

-- Índice BRIN para data
CREATE INDEX idx_[tabela]_date_brin ON [tabela] USING BRIN (date);
```

### 7.2 Índices Particionados
```sql
-- Criar tabela particionada
CREATE TABLE [tabela] (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (timestamp);

-- Criar partições
CREATE TABLE [tabela]_2026_01 PARTITION OF [tabela]
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE [tabela]_2026_02 PARTITION OF [tabela]
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Índices por partição
CREATE INDEX idx_[tabela]_2026_01_timestamp ON [tabela]_2026_01 (timestamp);
CREATE INDEX idx_[tabela]_2026_02_timestamp ON [tabela]_2026_02 (timestamp);
```

---

## 8. Índices para Geolocalização

### 8.1 Índices GiST para Geolocalização
```sql
-- Criar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Índice para pontos
CREATE INDEX idx_[tabela]_location_gist ON [tabela] USING GIST (location);

-- Índice para polígonos
CREATE INDEX idx_[tabela]_area_gist ON [tabela] USING GIST (area);
```

### 8.2 Queries Geoespaciais
```sql
-- Busca por proximidade
SELECT *, ST_Distance(location, ST_Point(-46.6333, -23.5505)) as distance
FROM [tabela]
WHERE ST_DWithin(location, ST_Point(-46.6333, -23.5505), 1000)
ORDER BY distance;

-- Busca dentro de polígono
SELECT * FROM [tabela]
WHERE ST_Within(location, ST_GeomFromText('POLYGON(...)', 4326));
```

---

## 9. Índices para Performance

### 9.1 Covering Indexes
```sql
-- Covering index para query específica
CREATE INDEX idx_[tabela]_covering ON [tabela] (user_id, status, created_at) INCLUDE (id, title);

-- Query que usa covering index
SELECT id, title FROM [tabela] WHERE user_id = ? AND status = 'active';
```

### 9.2 Índices com Expressões
```sql
-- Índice para calculado
CREATE INDEX idx_[tabela]_price_with_tax ON [tabela] ((price * 1.1));

-- Índice para substring
CREATE INDEX idx_[tabela]_name_first_char ON [tabela] (LEFT(name, 1));
```

### 9.3 Índices Concorrentes
```sql
-- Criar índice sem bloquear escrita
CREATE INDEX CONCURRENTLY idx_[tabela]_status ON [tabela] (status);

-- Criar índice único concorrente
CREATE UNIQUE INDEX CONCURRENTLY idx_[tabela]_email ON [tabela] (email);
```

---

## 10. Monitoramento de Índices

### 10.1 Queries para Monitoramento
```sql
-- Índices mais usados
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Tamanho dos índices
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 10.2 Análise de Performance
```sql
-- Analisar plano de execução
EXPLAIN ANALYZE SELECT * FROM [tabela] WHERE [coluna] = ?;

-- Verificar se índice está sendo usado
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM [tabela] WHERE [coluna] = ?;
```

### 10.3 Métricas de Uso
- **idx_scan:** Número de scans do índice
- **idx_tup_read:** Tuplas lidas pelo índice
- **idx_tup_fetch:** Tuplas retornadas pelo índice
- **pg_relation_size:** Tamanho do índice em bytes

---

## 11. Manutenção de Índices

### 11.1 Rebuild de Índices
```sql
-- Rebuild de índice (PostgreSQL)
REINDEX INDEX idx_[tabela]_status;

-- Rebuild de todos os índices da tabela
REINDEX TABLE [tabela];

-- Rebuild concorrente
REINDEX INDEX CONCURRENTLY idx_[tabela]_status;
```

### 11.2 Análise de Estatísticas
```sql
-- Atualizar estatísticas da tabela
ANALYZE [tabela];

-- Atualizar estatísticas específicas
ANALYZE [tabela] ([coluna]);

-- Verificar estatísticas
SELECT * FROM pg_stats WHERE tablename = '[tabela]';
```

### 11.3 Limpeza de Índices
```sql
-- Limpar índices não utilizados
DROP INDEX IF EXISTS idx_[tabela]_unused;

-- Verificar antes de remover
SELECT * FROM pg_stat_user_indexes WHERE indexname = 'idx_[tabela]_unused';
```

---

## 12. Best Practices

### 12.1 Quando Criar Índices
- **WHERE clauses:** Colunas usadas em WHERE
- **JOIN conditions:** Colunas usadas em JOINs
- **ORDER BY:** Colunas usadas em ordenação
- **GROUP BY:** Colunas usadas em agrupamento
- **UNIQUE constraints:** Para unicidade

### 12.2 Quando Evitar Índices
- **Tabelas pequenas:** < 1000 linhas
- **Colunas com baixa seletividade:** < 5% de valores únicos
- **Queries raras:** Executadas < 1x/dia
- **Write-heavy:** Muitas escritas, poucas leituras

### 12.3 Otimização de Índices
- **Compostos:** Colunas mais seletivas primeiro
- **Covering:** Incluir colunas do SELECT
- **Parciais:** Para queries específicas
- **Funcionais:** Para transformações comuns

---

## 13. Troubleshooting

### 13.1 Problemas Comuns
#### Índices não sendo usados
- **Sintoma:** EXPLAIN mostra Seq Scan
- **Causa:** Estatísticas desatualizadas, tipo de dados diferente
- **Solução:** ANALYZE, verificar tipo de dados

#### Índices muito grandes
- **Sintoma:** Espaço em disco alto
- **Causa:** Índices compostos desnecessários
- **Solução:** Remover índices não utilizados

#### Performance ruim com índices
- **Sintoma:** Queries lentas mesmo com índices
- **Causa:** Índices inadequados, estatísticas ruins
- **Solução:** Revisar queries, ANALYZE

### 13.2 Ferramentas de Diagnóstico
- **pg_stat_user_indexes:** Estatísticas de uso
- **pg_stat_activity:** Queries em execução
- **EXPLAIN ANALYZE:** Plano de execução
- **pg_relation_size:** Tamanho de objetos

---

## 14. Documentação

### 14.1 Dicionário de Índices
| Índice | Tabela | Colunas | Tipo | Propósito | Queries |
|--------|--------|---------|------|-----------|---------|
| idx_users_email | users | email | UNIQUE | Unicidade de email | WHERE email = ? |
| idx_orders_user_status | orders | user_id, status | COMPOSITE | Queries comuns | WHERE user_id = ? AND status = ? |

### 14.2 Mapa de Queries → Índices
| Query | Índice Usado | Performance |
|-------|--------------|-------------|
| SELECT * FROM users WHERE email = ? | idx_users_email | < 1ms |
| SELECT * FROM orders WHERE user_id = ? AND status = 'active' | idx_orders_user_status | < 5ms |
| SELECT * FROM posts ORDER BY created_at DESC | idx_posts_created_at | < 10ms |

### 14.3 Histórico de Mudanças
| Data | Índice | Ação | Justificativa |
|------|--------|-------|-------------|
| 2026-01-29 | idx_users_email | Criado | Performance de login |
| 2026-01-29 | idx_orders_user_status | Criado | Dashboard de pedidos |
| 2026-01-29 | idx_products_category | Removido | Não utilizado |

---

## 15. Apêndice

### 15.1 Tipos de Índices
- **B-tree:** Padrão, para igualdade e range
- **Hash:** Para igualdade exata
- **GIN:** Para arrays, JSONB, full-text
- **GiST:** Para geolocalização, range
- **BRIN:** Para time-series, tabelas grandes
- **SP-GiST:** Para particionamento espacial

### 15.2 Operadores de Índice
- **= :** Igualdade
- **<, >, <=, >= :** Range
- **LIKE, ILIKE :** Pattern matching
- **@@ :** Full-text search
- **<-> :** Vector similarity
- **&& :** Overlap (arrays)
- **@> :** Contains (JSONB, arrays)

### 15.3 Referências
- **PostgreSQL Indexes:** [Documentação oficial]
- **MySQL Indexes:** [Documentação oficial]
- **Database Indexing:** [Livro de referência]
- **High Performance MySQL:** [Livro de referência]

---

**Status:** [Em elaboração/Revisão/Aprovado]  
**Revisado por:** [Nome]  
**Data da revisão:** [Data]  
**Próxima revisão:** [Data]  
**Versão:** [Versão]
