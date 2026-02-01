# Exemplos Práticos de Design de Banco de Dados

## Sumário
Este documento contém exemplos práticos de design de banco de dados para diferentes tipos de sistemas, servindo como referência para implementação.

---

## Exemplo 1: Sistema de E-commerce

### Contexto
Sistema de vendas online com gestão de produtos, pedidos, usuários e pagamentos.

### Escolha do Banco
- **PostgreSQL 15+** - Por suporte a JSONB, full-text search e pgvector
- **Neon** - Serverless para escalabilidade
- **Prisma** - ORM type-safe para Node.js

### Schema Principal

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email_verified_at TIMESTAMP,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
```

#### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(50),
    stock INTEGER NOT NULL DEFAULT 0,
    weight DECIMAL(8,3),
    dimensions JSONB, -- {"length": 10, "width": 5, "height": 2}
    metadata JSONB, -- {"brand": "Nike", "color": "Red"}
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_metadata_gin ON products USING GIN(metadata);
CREATE INDEX idx_products_in_stock ON products(id) WHERE stock > 0;
```

#### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB NOT NULL, -- Snapshot do produto no momento
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE UNIQUE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
```

### Queries Otimizadas

#### Busca de Produtos com Filtros
```sql
-- Query principal de busca
SELECT 
    p.*,
    c.name as category_name,
    (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
    (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
FROM products p
LEFT JOIN categories c ON p.metadata->>'category_id' = c.id::text
WHERE 
    p.status = 'active' 
    AND p.stock > 0
    AND (
        LOWER(p.name) LIKE LOWER('%search_term%') OR
        LOWER(p.description) LIKE LOWER('%search_term%') OR
        p.metadata->>'brand' ILIKE '%search_term%'
    )
    AND (
        p.price BETWEEN :min_price AND :max_price
        OR :min_price IS NULL OR :max_price IS NULL
    )
ORDER BY 
    CASE WHEN :sort = 'price_asc' THEN p.price END ASC,
    CASE WHEN :sort = 'price_desc' THEN p.price END DESC,
    CASE WHEN :sort = 'name' THEN p.name END ASC,
    p.created_at DESC
LIMIT :limit OFFSET :offset;
```

#### Dashboard de Vendas
```sql
-- Dashboard com CTEs para performance
WITH daily_sales AS (
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders_count,
        SUM(total_amount) as total_revenue
    FROM orders
    WHERE status IN ('confirmed', 'shipped', 'delivered')
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
),
top_products AS (
    SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status IN ('confirmed', 'shipped', 'delivered')
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT 10
)
SELECT 
    (SELECT JSON_AGG(json_build_object('date', date, 'orders', orders_count, 'revenue', total_revenue)) 
     FROM daily_sales) as daily_sales,
    (SELECT JSON_AGG(json_build_object('name', name, 'sold', total_sold, 'revenue', total_revenue)) 
     FROM top_products) as top_products;
```

### Migrações Exemplo

#### Migration 001: Create Initial Tables
```sql
-- 001_create_initial_tables.sql
BEGIN;

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

COMMIT;
```

#### Migration 002: Add Categories and Product Categories
```sql
-- 002_add_categories.sql
BEGIN;

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories (junction table)
CREATE TABLE product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Índices
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_product_categories_product ON product_categories(product_id);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

COMMIT;
```

---

## Exemplo 2: Sistema de Blog

### Contexto
Sistema de blog com posts, comentários, usuários e tags.

### Escolha do Banco
- **PostgreSQL** - Suporte a full-text search e JSONB
- **Self-hosted** - Controle total
- **TypeORM** - ORM para Node.js

### Schema Principal

#### Posts Table
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    featured_image VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Full-text search index
CREATE INDEX idx_posts_search ON posts USING GIN (
    to_tsvector('portuguese', title || ' ' || content)
);

-- Índices de performance
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at) WHERE status = 'published';
CREATE INDEX idx_posts_active ON posts(slug) WHERE deleted_at IS NULL;
```

#### Tags Table
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Post Tags (junction table)
CREATE TABLE post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Índices
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
```

#### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created ON comments(created_at);
```

### Queries de Blog

#### Busca Full-Text
```sql
-- Busca de posts com ranking
SELECT 
    p.*,
    ts_rank(
        to_tsvector('portuguese', p.title || ' ' || p.content),
        plainto_tsquery('portuguese', :search_term)
    ) as rank,
    ts_headline('portuguese', p.title || ' ' || p.content, plainto_tsquery('portuguese', :search_term)) as snippet
FROM posts p
WHERE 
    p.status = 'published'
    AND to_tsvector('portuguese', p.title || ' ' || p.content) @@ plainto_tsquery('portuguese', :search_term)
ORDER BY rank DESC, p.published_at DESC
LIMIT :limit;
```

#### Posts Populares
```sql
-- Posts populares (baseado em comentários e views)
SELECT 
    p.*,
    COUNT(c.id) as comment_count,
    COUNT(DISTINCT v.session_id) as view_count
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id AND c.status = 'approved'
LEFT JOIN post_views v ON p.id = v.post_id AND v.created_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE 
    p.status = 'published'
    AND p.published_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id
ORDER BY 
    (COUNT(c.id) * 0.7 + COUNT(DISTINCT v.session_id) * 0.3) DESC
LIMIT 10;
```

---

## Exemplo 3: Sistema de IoT

### Contexto
Sistema de IoT com sensores, dispositivos e dados de tempo real.

### Escolha do Banco
- **TimescaleDB** - Extensão PostgreSQL para time-series
- **Redis** - Cache e dados em tempo real
- **MongoDB** - Dados flexíveis de dispositivos

### Schema Principal

#### Devices Table
```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    device_id VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    location JSONB,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    last_seen TIMESTAMP,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);
CREATE INDEX idx_devices_location_gin ON devices USING GIN(location);
```

#### Sensor Data (Hypertable)
```sql
-- Criar hypertable para dados de sensores
CREATE TABLE sensor_data (
    time TIMESTAMP NOT NULL,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION,
    unit VARCHAR(20),
    quality INTEGER DEFAULT 100,
    metadata JSONB DEFAULT '{}'
);

-- Criar hypertable
SELECT create_hypertable('sensor_data', 'time');

-- Índices
CREATE INDEX idx_sensor_data_device_time ON sensor_data (device_id, time DESC);
CREATE INDEX idx_sensor_data_metric ON sensor_data (metric_name);
```

#### Alerts Table
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    condition VARCHAR(100) NOT NULL,
    threshold DOUBLE PRECISION,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    triggered_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_alerts_device ON alerts(device_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_triggered ON alerts(triggered_at);
```

### Queries de IoT

#### Dados Recentes do Dispositivo
```sql
-- Últimas 24 horas de dados de um dispositivo
SELECT 
    time,
    metric_name,
    value,
    unit,
    quality
FROM sensor_data
WHERE 
    device_id = :device_id
    AND time >= NOW() - INTERVAL '24 hours'
ORDER BY time DESC;
```

#### Alertas Ativos
```sql
-- Alertas não resolvidos
SELECT 
    d.name as device_name,
    a.metric_name,
    a.condition,
    a.threshold,
    a.severity,
    a.triggered_at
FROM alerts a
JOIN devices d ON a.device_id = d.id
WHERE 
    a.status = 'active'
    AND a.triggered_at IS NOT NULL
ORDER BY a.triggered_at DESC;
```

---

## Exemplo 4: Sistema de Analytics

### Contexto
Sistema de analytics com eventos de usuário, métricas e dashboards.

### Escolha do Banco
- **ClickHouse** - Analytics e OLAP
- **PostgreSQL** - Dados de configuração
- **Redis** - Cache de métricas

### Schema Principal

#### Events Table (ClickHouse)
```sql
CREATE TABLE events (
    timestamp DateTime,
    user_id UUID,
    event_type String,
    properties JSON,
    session_id String,
    ip_address IPv4,
    user_agent String
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, user_id, event_type);
```

#### Metrics Table
```sql
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- counter, gauge, histogram
    tags JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Metric Values (time-series)
CREATE TABLE metric_values (
    timestamp TIMESTAMP NOT NULL,
    metric_id UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
    value DOUBLE PRECISION,
    tags JSONB DEFAULT '{}'
);

-- Criar hypertable para valores
SELECT create_hypertable('metric_values', 'timestamp');
```

### Queries de Analytics

#### Eventos por Período
```sql
-- Contagem de eventos por tipo e período
SELECT 
    event_type,
    toStartOfDay(timestamp) as day,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE 
    timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 
    event_type,
    toStartOfDay(timestamp)
ORDER BY day DESC, event_count DESC;
```

#### Funil de Conversão
```sql
-- Funil de conversão por etapa
WITH user_sessions AS (
    SELECT 
        user_id,
        session_id,
        min(timestamp) as session_start,
        max(timestamp) as session_end,
        array_agg(DISTINCT event_type ORDER BY timestamp) as events
    FROM events
    WHERE 
        timestamp >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY user_id, session_id
),
conversion_funnel AS (
    SELECT 
        event_type,
        COUNT(DISTINCT user_id) as users,
        COUNT(DISTINCT user_id) * 100.0 / LAG(COUNT(DISTINCT user_id)) OVER (ORDER BY event_type) as conversion_rate
    FROM user_sessions
    WHERE 
        events @> ['page_view'] -- Todos que viram a página
    GROUP BY event_type
)
SELECT 
    event_type,
    users,
    ROUND(conversion_rate, 2) as conversion_rate
FROM conversion_funnel
ORDER BY 
    CASE event_type
        WHEN 'page_view' THEN 1
        WHEN 'add_to_cart' THEN 2
        WHEN 'begin_checkout' THEN 3
        WHEN 'purchase' THEN 4
    END;
```

---

## Exemplo 5: Sistema Financeiro

### Contexto
Sistema financeiro com contas, transações e auditoria.

### Escolha do Banco
- **PostgreSQL** - ACID e extensões financeiras
- **Criptografia** - Dados sensíveis
- **Auditoria** - Logs completos

### Schema Principal

#### Accounts Table
```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- checking, savings, credit
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_status ON accounts(status);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL, -- debit, credit, transfer
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID, -- Para transferências
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transactions_reference ON transactions(reference_id);
```

#### Audit Log Table
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
```

### Queries Financeiras

#### Extrato da Conta
```sql
-- Extrato com saldo acumulado
WITH transaction_balances AS (
    SELECT 
        id,
        account_id,
        type,
        amount,
        description,
        created_at,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) 
            OVER (PARTITION BY account_id ORDER BY created_at) as running_balance
    FROM transactions
    WHERE 
        account_id = :account_id
        AND status = 'completed'
)
SELECT 
    id,
    type,
    amount,
    description,
    running_balance,
    created_at
FROM transaction_balances
ORDER BY created_at DESC;
```

#### Relatório Financeiro
```sql
-- Relatório mensal por tipo de transação
SELECT 
    DATE_TRUNC('month', created_at) as month,
    type,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as net_amount
FROM transactions
WHERE 
    status = 'completed'
    AND created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 
    DATE_TRUNC('month', created_at),
    type
ORDER BY month DESC, type;
```

---

## Padrões e Melhores Práticas

### 1. Naming Conventions
- **Tables:** snake_case plural (users, orders, products)
- **Columns:** snake_case (created_at, user_id, first_name)
- **Indexes:** idx_[table]_[columns] (idx_users_email)
- **Constraints:** pk_[table], uk_[table]_[column], fk_[table]_[reference]

### 2. Data Types
- **IDs:** UUID para novas tabelas
- **Timestamps:** TIMESTAMP WITH TIME ZONE
- **JSON:** JSONB para dados estruturados
- **Money:** DECIMAL(15,2) para valores monetários

### 3. Performance
- **Índices:** Para WHERE, JOIN, ORDER BY
- **Covering Indexes:** Incluir colunas do SELECT
- **Partial Indexes:** Para subsets de dados
- **Partitioning:** Para tabelas grandes

### 4. Segurança
- **Soft Deletes:** deleted_at em vez de DELETE
- **Row Level Security:** Para acesso granular
- **Encryption:** Para dados sensíveis
- **Audit Trail:** Registrar mudanças

### 5. Migrações
- **Zero-Downtime:** Usar CONCURRENTLY
- **Backward Compatible:** Não quebrar código existente
- **Rollback:** Sempre ter rollback
- **Testing:** Validar em staging

---

## Ferramentas Úteis

### Diagramação
- **dbdiagram.io:** Diagramas online
- **Draw.io:** Diagramas visuais
- **PlantUML:** Diagramas de texto
- **Mermaid:** Diagramas em Markdown

### Testing
- **pgTAP:** Testes unitários PostgreSQL
- **Factory Boy:** Dados de teste
- **Faker:** Dados falsos
- **TestContainers:** Banco em container

### Monitoring
- **pg_stat_statements:** Queries lentas
- **pg_stat_activity:** Conexões ativas
- **pg_stat_user_indexes:** Uso de índices
- **EXPLAIN ANALYZE:** Plano de execução

---

## Referências

### Documentação
- **PostgreSQL:** [postgresql.org/docs](https://postgresql.org/docs/)
- **MySQL:** [dev.mysql.com/doc](https://dev.mysql.com/doc/)
- **MongoDB:** [docs.mongodb.com](https://docs.mongodb.com/)

### Livros
- **Database Design:** "Database Design for Mere Mortals"
- **Performance:** "High Performance MySQL"
- **PostgreSQL:** "PostgreSQL 14 Internals"

### Blogs
- **Planet PostgreSQL:** planet.postgresql.org
- **MySQL Performance Blog:** www.percona.com/blog
- **Database Weekly:** www.dbweekly.com
