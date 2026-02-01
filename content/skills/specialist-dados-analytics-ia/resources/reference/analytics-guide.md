# 📚 Guia Técnico Completo - Dados e Analytics

## Visão Geral

Guia completo de boas práticas, padrões e implementações para engenharia de dados, analytics e business intelligence, focado em performance, escalabilidade e governança.

## 🏗️ Fundamentos de Analytics

### Princípios Core

#### 1. Data-Driven Decision Making
- **Definição**: Tomada de decisão baseada em dados e evidências
- **Benefícios**: Redução de viés, decisões mais objetivas
- **Implementação**: Dashboards, KPIs, relatórios automatizados

#### 2. Data Quality First
- **Definição**: Qualidade dos dados é prioridade sobre quantidade
- **Benefícios**: Confiança nos insights, análises mais precisas
- **Implementação**: Validação automatizada, testes de qualidade

#### 3. Self-Service Analytics
- **Definição**: Usuários podem criar suas próprias análises
- **Benefícios**: Redução de dependência de TI, agilidade
- **Implementação**: Ferramentas de BI self-service

#### 4. Real-Time Analytics
- **Definição**: Análises em tempo real para ações imediatas
- **Benefícios**: Resposta rápida a eventos, detecção de anomalias
- **Implementação**: Streaming, processamento contínuo

## 🛠️ Stack Tecnológico

### Orquestração de Pipelines

#### Apache Airflow
```yaml
# Características
- Platform: Orquestração de workflows
- Language: Python
- Interface: Web UI, CLI, REST API
- Execution: Local, distributed (Celery, Kubernetes)

# Considerações DevOps
- Scheduler: Cron, event-based
- Executors: Local, Kubernetes, ECS, GKE
- Storage: Metadata database (PostgreSQL, MySQL)
- Monitoring: Logs, metrics, webserver

# Exemplo de DAG
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'analytics-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'daily_analytics_pipeline',
    default_args=default_args,
    description='Pipeline diário de analytics',
    schedule_interval='@daily',
    catchup=False,
)
```

#### Apache Spark
```yaml
# Características
- Platform: Processamento distribuído
- Language: Scala, Python, R, SQL
- Interface: Spark Shell, Livy, Jupyter
- Execution: Cluster (YARN, Mesos, Kubernetes)

# Considerações de Performance
- Memory Management: Executor memory, driver memory
- Partitioning: Data partitioning strategies
- Caching: RDD cache, DataFrame cache
- Serialization: Kryo, Java serialization

# Exemplo de Streaming
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, window

spark = SparkSession.builder \
    .appName("streaming_analytics") \
    .getOrCreate()

# Leitura de streaming
streaming_df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "events") \
    .load()

# Processamento em janela
windowed_df = streaming_df \
    .withWatermark("timestamp", "1 minute") \
    .groupBy(
        window("timestamp", "1 minute"),
        col("event_type")
    ) \
    .agg(
        count("*").alias("event_count"),
        sum(col("value")).alias("total_value")
    )
```

#### dbt (Data Build Tool)
```yaml
# Características
- Platform: Transformação de dados SQL-first
- Language: SQL (Jinja2)
- Interface: CLI, Cloud, IDE
- Execution: Target warehouse (Snowflake, BigQuery, Redshift)

# Estrutura de Projeto
analytics/
├── models/
│   ├── staging/          # Raw data
│   ├── intermediate/     # Cleaned data
│   └── marts/           # Business logic
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── snapshot/          # Snapshot tests
├── seeds/                # Test data
├── macros/               # Reusable SQL
└── dbt_project.yml       # Configuration

# Exemplo de Modelo
-- models/marts/fct_orders.sql
{{ config(materialized='incremental', unique_key='order_id') }}

SELECT
    o.order_id,
    o.customer_id,
    o.order_date,
    o.total_amount,
    c.name as customer_name,
    c.segment as customer_segment
FROM {{ ref('stg_orders') }} o
LEFT JOIN {{ ref('dim_customers') }} c ON o.customer_id = c.customer_id

{% if is_incremental() %}
WHERE o.order_date > (SELECT MAX(order_date) FROM {{ this }})
{% endif %}
```

### Armazenamento de Dados

#### Data Warehouses

##### Google BigQuery
```sql
-- Características
- Platform: Serverless data warehouse
- Language: Standard SQL, Legacy SQL
- Interface: Web UI, CLI, API, Client Libraries
- Storage: Columnar, partitioned tables

-- Exemplo de Criação de Tabela
CREATE TABLE analytics.fact_orders (
    order_id STRING,
    customer_id STRING,
    order_date DATE,
    total_amount NUMERIC,
    status STRING,
    created_at TIMESTAMP
)
PARTITION BY RANGE(order_date)
CLUSTER BY customer_id
OPTIONS(
    description="Tabela de fatos de pedidos"
);

-- Exemplo de Query Otimizada
SELECT
    DATE_TRUNC(order_date, MONTH) as mes,
    customer_id,
    COUNT(*) as total_pedidos,
    SUM(total_amount) as receita_total
FROM analytics.fact_orders
WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL '12 months')
GROUP BY 1, 2
ORDER BY mes DESC;
```

##### Amazon Redshift
```sql
-- Características
- Platform: Data warehouse como serviço
- Language: PostgreSQL
- Interface: SQL, AWS Management Console
- Storage: Columnar, compressed storage

-- Exemplo de Design Schema
CREATE TABLE analytics.fact_sales (
    sales_id BIGINT IDENTITY(1,1),
    product_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    sales_date DATE NOT NULL,
    sales_amount DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
)
DISTSTYLE KEY(sales_date)
SORTKEY (sales_date, product_id);

-- Exemplo de Inserção Otimizada
INSERT INTO analytics.fact_sales (
    product_id, store_id, sales_date, sales_amount, quantity
)
VALUES
    (1001, 501, '2024-01-15', 150.00, 3),
    (1002, 501, '2024-01-15', 75.50, 1);
```

##### Snowflake
```sql
-- Características
- Platform: Cloud data warehouse
- Language: Standard SQL, JavaScript
- Interface: Web UI, SnowSQL, Connectors
- Storage: Columnar, automatic clustering

-- Exemplo de Stage
CREATE OR REPLACE STAGE analytics.stg_orders AS (
    SELECT
        order_id,
        customer_id,
        order_date,
        total_amount,
        status,
        created_at
    FROM raw_data.orders_raw
);

-- Exemplo de Materialized View
CREATE MATERIALIZED VIEW analytics.mv_daily_sales AS
SELECT
    DATE_TRUNC(order_date, DAY) as sales_date,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(*) as total_orders,
    SUM(total_amount) as daily_revenue
FROM analytics.fact_orders
GROUP BY DATE_TRUNC(order_date, DAY)
```

### Data Lakes

#### Amazon S3
```yaml
# Características
- Platform: Object storage
- Interface: REST API, CLI, SDKs
- Storage: Objects, buckets
- Pricing: By storage used, requests

# Estrutura de Data Lake
s3://analytics-data-lake/
├── raw/                 # Dados brutos
│   ├── events/
│   │   ├── 2024/
│   │   │   ├── 01/
│   │   │   └── 15/
│   │   └── 02/
│   ├── databases/
│   │   ├── postgresql/
│   │   └── mysql/
│   └── processed/         # Dados processados
│       ├── parquet/
│       ├── delta/
│       └── json/
```

#### Google Cloud Storage
```yaml
# Características
- Platform: Object storage
- Interface: REST API, CLI, Client Libraries
- Storage: Objects, buckets
- Pricing: By storage used, operations

# Exemplo de Organização
gs://analytics-data-lake/
├── landing/             # Dados brutos
├── bronze/              # Processado básico
├── silver/              # Limpo e validado
├── gold/                # Otimizado para queries
└── archive/             # Arquivados
```

### Visualização e BI

#### Looker
```yaml
# Características
- Platform: Business Intelligence
- Language: LookML (SQL-like)
- Interface: Web UI, API, Embed
- Integration: 50+ data sources

# Exemplo de Look
view: analytics.daily_sales {
  sql_table_name: analytics.fact_orders ;;
  dimension_group: analytics.customer_segment {
    dimension: customer.segment
    measure: orders.count
    measure: revenue_total
  }
  dimension_group: analytics.time_period {
    dimension: orders.order_date
    timeframes: [day, week, month, quarter, year]
    measure: orders.count
    measure: revenue_total
  }
}
```

#### Metabase
```yaml
# Carferências
- Platform: Open-source BI
- Language: SQL, GUI
- Interface: Web UI, API
- Integration: 25+ data sources

# Exemplo de Questão
SELECT
    DATE_TRUNC(order_date, 'month') as "Mês",
    COUNT(DISTINCT customer_id) as "Clientes Únicos",
    COUNT(*) as "Total de Pedidos",
    SUM(total_amount) as "Receita Total"
FROM analytics.fact_orders
GROUP BY 1
ORDER BY "Mês"
```

#### Tableau
```yaml
# Características
- Platform: Enterprise BI
- Language: VizQL (drag-and-drop)
- Interface: Desktop, Server, Online
- Integration: 80+ data sources

# Exemplo de Dashboard
- Fonte: analytics.fact_orders
- Visualização: Bar chart, line chart, map
- Filtros: Date range, customer segment, product category
- Alertas: Threshold-based, data-driven
```

---

## 🔄 Engenharia de Dados

### Pipeline ETL/ELT

#### Arquitetura Padrão
```
Fontes → Extração → Transformação → Carga → Analytics
```

#### Extração (Extract)
```python
# Extração de Banco de Dados
import psycopg2
import pandas as pd

def extract_from_postgres(query, connection_params):
    """Extrai dados do PostgreSQL"""
    conn = psycopg2.connect(**connection_params)
    return pd.read_sql(query, conn)

# Extração de API
import requests
import json

def extract_from_api(url, headers=None, params=None):
    """Extrai dados de API REST"""
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()
```

#### Transformação (Transform)
```python
# Limpeza de Dados
import pandas as pd

def clean_data(df):
    """Limpa e padroniza dados"""
    # Remover duplicatas
    df = df.drop_duplicates()
    
    # Padronizar datas
    df['email'] = df['email'].str.lower().str.strip()
    df['data'] = pd.to_datetime(df['data'])
    
    # Remover nulos
    df = df.dropna(subset=['critical_field'])
    
    return df

# Enriquecimento de Dados
def enrich_data(df, reference_data):
    """Enriquece dados com dados de referência"""
    return df.merge(reference_data, on='key', how='left')
```

#### Carga (Load)
```python
# Carga em Data Warehouse
from sqlalchemy import create_engine
import pandas as pd

def load_to_bigquery(df, table_name, project_id):
    """Carrega DataFrame no BigQuery"""
    client = bigquery.Client(project=project_id)
    job = client.load_table_from_dataframe(df, table_name)
    job.result()
```

### Testes de Qualidade de Dados

#### Great Expectations
```python
import great_expectations as gx

# Definição de Expectativa
expectation = gx.ExpectationSuite(
    "analytics_quality_checks"
)

# Teste de Completude
expectation.expect_table_row_count_to_be_between(
    "analytics.fact_orders",
    min_value=1000,
    max_value=1000000
)

# Teste de Unicidade
expectation.expect_column_values_to_be_unique(
    "analytics.fact_orders",
    "order_id"
)

# Teste de Formato
expectation.expect_column_values_to_match_regex(
    "analytics.fact_orders",
    "email",
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)
```

#### dbt Tests
```sql
-- models/marts/fct_orders.yml
version: 2
models:
  - name: fct_orders
    description: Tabela de fatos de pedidos
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_customers')
              field: customer_id
      - name: total_amount
        tests:
          - not_null
          - between:
              min: 0
              max: 10000
```

---

## 📊 Modelagem Dimensional

### Star Schema

#### Componentes
```
        +-------------+
        |   FATO_     |
        |   VENDAS_   |
        +-------------+
               |
    +--------+--------+
    |        |        |
+---+---+---+---+
| DIM_  | | DIM_  | | DIM_  |
| DATA | | PROD  | | USER |
+---+---+---+---+
```

#### Tabelas de Fato
```sql
-- Tabela de Fato de Vendas
CREATE TABLE fact_sales (
    sales_id BIGINT PRIMARY KEY,
    date_id INTEGER REFERENCES dim_date(id),
    product_id INTEGER REFERENCES dim_product(id),
    customer_id INTEGER REFERENCES dim_customer(id),
    store_id INTEGER REFERENCES dim_store(id),
    sales_amount DECIMAL(15,2),
    quantity INTEGER,
    discount_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);
```

#### Dimensões

##### Dimensão de Data
```sql
CREATE TABLE dim_date (
    id INTEGER PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    day INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN NOT NULL
);
```

##### Dimensão de Produto
```sql
CREATE TABLE dim_product (
    id INTEGER PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### Dimensão de Cliente
```sql
CREATE TABLE dim_customer (
    id INTEGER PRIMARY KEY,
    customer_id_original BIGINT UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50),
    segment VARCHAR(50),
    registration_date DATE,
    first_purchase_date DATE,
    last_purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Slowly Changing Dimensions (SCD)

#### SCD Type 2 (Add New Rows)
```sql
-- Dimensão de Cliente com SCD Type 2
CREATE TABLE dim_customer_scd_type2 (
    id INTEGER PRIMARY KEY,
    customer_id_original BIGINT NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    segment VARCHAR(50),
    effective_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para SCD Type 2
CREATE OR REPLACE TRIGGER trg_customer_scd_type2
AFTER UPDATE ON dim_customer
FOR EACH ROW
BEGIN
    INSERT INTO dim_customer_scd_type2 (
        customer_id_original,
        email,
        name,
        segment,
        CURRENT_DATE,
        NULL,
        FALSE
    )
    VALUES (
        NEW.customer_id_original,
        NEW.email,
        NEW.name,
        NEW.segment,
        CURRENT_DATE,
        NULL,
        FALSE
    );
END;
```

#### SCD Type 3 (Add New Columns)
```sql
-- Dimensão de Produto com SCD Type 3
ALTER TABLE dim_product ADD COLUMN price_history JSON;

-- Função para rastrear histórico
CREATE OR REPLACE FUNCTION get_price_history(product_id INTEGER)
RETURNS JSON
AS $$
DECLARE
    history JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'price', price,
            'effective_date', effective_date,
            'end_date', end_date
        )
        ORDER BY effective_date DESC
    ) INTO history
    FROM dim_product_scd_type3
    WHERE product_id = product_id
    GROUP BY product_id;
    
    RETURN COALESCE(history, '[]');
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Performance e Otimização

### Otimização de Queries

#### Índices e Particionamento
```sql
-- Índices para Performance
CREATE INDEX idx_fact_orders_date_id ON analytics.fact_orders(date_id);
CREATE INDEX idx_fact_orders_customer_id ON analytics.fact_orders(customer_id);
CREATE INDEX idx_fact_orders_product_id ON analytics.facts_orders(product_id);

-- Particionamento por Data
CREATE TABLE analytics.fact_orders (
    order_id BIGINT,
    date_id INTEGER,
    customer_id INTEGER,
    product_id INTEGER,
    sales_amount DECIMAL(15,2),
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at)
CLUSTER BY customer_id;
```

#### Materialized Views
```sql
-- Materialized View para Performance
CREATE MATERIALIZED VIEW analytics.mv_daily_sales AS
SELECT
    DATE_TRUNC(order_date, DAY) as sales_date,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(*) as total_orders,
    SUM(sales_amount) as daily_revenue
FROM analytics.fact_orders
GROUP BY DATE_TRUNC(order_date, DAY)
CLUSTER BY sales_date;

-- Atualização Automática
BEGIN;
    CREATE OR REPLACE TABLE analytics.mv_daily_sales
    CLUSTER BY sales_date;
END;
```

#### Query Optimization
```sql
-- Evitar SELECT *
SELECT ONLY colunas necessárias
SELECT
    customer_id,
    order_id,
    total_amount
FROM analytics.fact_orders
WHERE order_date >= '2024-01-01';

-- Usar filtros no WHERE
SELECT
    customer_id,
    SUM(sales_amount) as total_spent
FROM analytics.fact_orders
WHERE order_date >= '2024-01-01'
  AND customer_id IN (1, 2, 3)
GROUP BY customer_id;

-- Pré-agregar filtros
SELECT
    customer_id,
    SUM(sales_amount) as total_spent
FROM analytics.fact_orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
HAVING SUM(sales_amount) > 1000;
```

### Cache e Caching

#### Redis Cache
```python
import redis
import json
from datetime import timedelta

class AnalyticsCache:
    def __init__(self, redis_host='localhost', redis_port=6379):
        self.redis = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    
    def get_cached_result(self, key, ttl=3600):
        """Obtém resultado cacheado"""
        result = self.redis.get(key)
        if result:
            return json.loads(result)
        return None
    
    def cache_result(self, key, data, ttl=3600):
        """Armazena resultado no cache"""
        self.redis.setex(key, json.dumps(data), ex=ttl)
    
    def invalidate_cache(self, pattern):
        """Invalida cache por padrão"""
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)
```

#### Query Result Cache
```sql
-- Habilitar Query Result Cache no BigQuery
ALTER SESSION SET query_result_cache = true;

-- Exemplo de Query com Cache
SELECT /*+ RESULT_CACHE */
    customer_id,
    COUNT(*) as order_count,
    SUM(total_amount) as total_spent
FROM analytics.fact_orders
WHERE customer_id = 12345
GROUP BY customer_id;
```

---

## 🔐 Segurança e Governança

### Data Governance

### Classificação de Dados
```yaml
data_classification:
  public:
    description: "Dados públicos, sem restrições"
    examples: ["preços públicos", "catálogos de produtos"]
    controls: ["acesso irrestrito"]
  
  internal:
    description: "Dados internos da empresa"
    examples: ["vendas internas", "métricas de RH"]
    controls: ["acesso restrito", "criptografia em repouso"]
  
  confidential:
    description: "Dados confidenciais da empresa"
    examples: ["informações financeiras", "dados pessoais"]
    controls: ["acesso restrito", "criptografia", "mascaramento"]
  
  restricted:
    description: "Dados altamente sensíveis"
    examples: ["informações de saúde", "dados de pagamento"]
    controls: ["acesso muito restrito", "criptografia", "mascaramento"]
```

### LGPD Compliance
```python
# Anonimização de Dados PII
import hashlib
import pandas as pd

def anonymize_pii(df, pii_columns):
    """Anonimiza colunas com dados PII"""
    df_anonymized = df.copy()
    
    for column in pii_columns:
        if column in df_anonymized.columns:
            # Hash do email
            if df_anonymized[column].dtype == 'object':
                df_anonymized[column] = df_anonymized[column].apply(
                    lambda x: hashlib.sha256(x.encode()).hexdigest()[:16]
                )
            # Mascaramento de nome
            elif column in ['name', 'full_name']:
                df_anonymized[column] = df_anonymized[column].apply(
                    lambda x: 'USER_' + str(hash(x)[:8]
                )
    
    return df_anonymized

# Política de Retenção
def apply_retention_policy(df, retention_days=365):
    """Aplica política de retenção de dados"""
    cutoff_date = datetime.now() - timedelta(days=retention_days)
    return df[df['created_at'] >= cutoff_date]
```

### Auditoria e Logging
```python
import logging
import json
from datetime import datetime

# Configuração de Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/analytics.log'),
        logging.StreamHandler()
    ]
)

# Auditoria de Acesso
def log_data_access(user_id, table_name, action, record_id=None):
    """Registra acesso a dados"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "table_name": table_name,
        "action": action,
        "record_id": record_id,
        "ip_address": request.remote_addr
    }
    
    logging.info(json.dumps(log_entry))
```

---

## 📊 Monitoramento e Observabilidade

### Métricas de Pipeline

#### Latency e Throughput
```python
import time
from datetime import datetime
from prometheus_client import Counter, Histogram, Gauge

# Métricas do Pipeline
pipeline_latency = Histogram(
    'analytics_pipeline_latency_seconds',
    'Tempo de execução do pipeline',
    buckets=[0.1, 0.5, 1, 5, 10, 30, 60, 300]
)

pipeline_throughput = Counter(
    'analytics_pipeline_throughput_total',
    'Total de registros processados',
    ['pipeline_name', 'status']
)

# Monitoramento de Performance
def monitor_pipeline_performance(pipeline_name, start_time, end_time, record_count):
    """Monitora performance do pipeline"""
    latency = (end_time - start_time).total_seconds()
    
    pipeline_latency.observe(latency)
    pipeline_throughput.labels(
        pipeline_name=pipeline_name,
        status='success'
    ).inc(record_count)
    
    logging.info(
        f"Pipeline {pipeline_name}: "
        f"Latency={latency:.2f}s, "
        f"Records={record_count}, "
        f"Throughput={record_count/latency:.2f} rec/s"
    )
```

#### Qualidade de Dados
```python
from great_expectations import ValidationSuite
import pandas as pd

def validate_data_quality(df, validation_suite):
    """Valida qualidade dos dados usando Great Expectations"""
    try:
        validation_suite.validate(df)
        return True, "Validação de dados aprovada"
    except Exception as e:
        return False, f"Erro na validação: {str(e)}"
```

### Alertas e Notificações
```python
from prometheus_client import Gauge
import smtplib
from email.mime.text import MIMEText

# Alertas de Performance
pipeline_success_rate = Gauge(
    'analytics_pipeline_success_rate',
    'Taxa de sucesso do pipeline',
    thresholds=[0.95, 0.90, 0.85]
)

# Configuração de Alertas
def send_alert(subject, message, recipients):
    """Envia alerta por email"""
    msg = MIMEText(message)
    msg['Subject'] = f"Alerta Analytics: {subject}"
    msg['From'] = "analytics@empresa.com"
    msg['To'] = recipients
    
    with smtplib.SMTP('smtp.empresa.com') as server:
        server.starttls()
        server.login('username', 'password')
        server.send_message(msg)
```

---

## 🚀 Casos de Uso Avançados

### Machine Learning Operations (MLOps)

#### Feature Engineering
```python
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def prepare_features(df):
    """Prepara features para ML"""
    # Selecionar features numéricas
    numeric_features = df.select_dtypes(include=['number'])
    
    # Normalizar features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(numeric_features)
    
    return scaled_features, scaler

def train_churn_model(X, y):
    """Treina modelo de churn"""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    return model, X_test, y_test
```

#### Model Serving
```python
import joblib
import pickle

def save_model(model, model_path):
    """Salva modelo treinado"""
    joblib.dump(model, model_path)

def load_model(model_path):
    """Carrega modelo treinado"""
    return joblib.load(model_path)
```

### Real-Time Analytics

#### Stream Processing com Kafka
```python
from kafka import KafkaConsumer
import json

class RealTimeProcessor:
    def __init__(self, kafka_config):
        self.consumer = KafkaConsumer(**kafka_config)
        self.consumer.subscribe(['user_events'])
    
    def process_stream(self):
        """Processa stream de eventos em tempo real"""
        for message in self.consumer:
            try:
                event = json.loads(message.value.decode('utf-8'))
                self.process_event(event)
            except Exception as e:
                logging.error(f"Erro no processamento: {e}")
    
    def process_event(self, event):
        """Processa evento individual"""
        # Lógica de processamento
        pass
```

---

## 📋 Melhores Práticas

### Design de Schema
- **Nomenclatura consistente**: Use snake_case para nomes de tabelas e colunas
- **Documentação completa**: Descreva cada tabela e coluna
- **Versionamento**: Controle versões de schema
- **Testes automatizados**: Valide schema automaticamente

### Performance
- **Índices estratégicos**: Crie índices para queries frequentes
- **Particionamento adequado**: Particione tabelas grandes por data
- **Materialized views**: Use para agregações complexas
- **Query otimização**: Evite SELECT *, use colunas específicas

### Qualidade
- **Validação contínua**: Implemente testes automatizados
- **Monitoramento ativo**: Monitore métricas de qualidade
- **Alertas proativas:** Configure alertas para anomalias
- **Documentação de erros**: Registre e analise falhas

### Segurança
- **Princípio do menor privilégio**: Conceda permissões mínimas
- **Criptografia sempre**: Dados sensíveis sempre criptografados
- **Auditoria completa:** Registre todos os acessos
- **Compliance rigoroso**: Siga regulamentos aplicáveis

---

## 🎯 Implementação Roadmap

### Fase 1: Fundação (Semanas 1-2)
- [ ] **Setup do ambiente**: Data warehouse e ferramentas
- [ ] **Fontes de dados**: Conectar e validar fontes
- [ ] **Pipeline básico**: Implementar ETL simples
- [ ] **Dashboard inicial**: Criar primeiro dashboard
- [ ] **Testes de qualidade**: Implementar validações básicas

### Fase 2: Expansão (Semanas 3-4)
- [ ] **Pipelines avançados**: Implementar CDC e streaming
- [ ] **Modelagem completa:** Implementar star schema completo
- [ ] **Dashboards múltiplos:** Criar dashboards por área
- [ ] **Automação completa:** CI/CD para analytics
- [ ] **Performance tuning:** Otimizar queries e pipelines

### Fase 3: Otimização (Semanas 5-6)
- [ ] **Real-time analytics**: Implementar streaming analytics
- [ ] **ML pipelines**: Integrar ML na pipeline
- [ ] **Self-service BI**: Capacitar usuários finais
- [ ] **Advanced monitoring**: Monitoramento preditivo
- [ ] **Governança completa:** Implementar data governance
- [ ] **Inovação contínua**: Explorar novas tecnologias

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Apache Airflow Documentation](https://airflow.apache.org/docs/)
- [Apache Spark Documentation](https://spark.apache.org/docs/)
- [dbt Documentation](https://docs.getdbt.com/)
- [Google BigQuery Documentation](https://cloud.google.com/bigquery/docs/)
- [Looker Documentation](https://docs.looker.com/)

### Livros Recomendados
- "Data Warehouse Toolkit" de Ralph Kimball
- "The Data Warehouse Lifecycle Toolkit" de Ralph Kimball
- "Designing Data-Intensive Applications" by Martin Fowler
- "Building the Data Warehouse" de Inmon
- "Data Science for Business" de Provost & Fawcett

### Comunidades
- [dbt Slack Community](https://dbt.com/slack)
- [Airflow Users Group](https://lists.apache.org/)
- [Spark Users Group](https://spark.apache.org/)
- [Looker Community](https://community.looker.com/)

### Blogs e Artigos
- [The Analytics Engineering Blog](https://medium.com/analytics-engineering)
- [Netflix Tech Blog](https://netflixtechblog.com/)
- [Uber Engineering Blog](https://www.uber.com/blog/)
- [Stripe Engineering Blog](https://stripe.com/blog/engineering)

---

## 🎯 Conclusão

Este guia serve como referência completa para implementação de analytics modernos, seguindo as melhores práticas da indústria. Para suporte técnico, consulte os recursos em `resources/` ou exemplos em `examples/`.
