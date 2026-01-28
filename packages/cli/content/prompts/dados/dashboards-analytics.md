# Prompt: Dashboards e Analytics

> **Quando usar:** Criar dashboards e sistema de analytics  
> **Especialista:** Dados e Analytics com IA  
> **Nível:** Médio  
> **Pré-requisitos:** Requisitos de negócio, dados disponíveis, stack definido

---

## Fluxo de Contexto
**Inputs:** requisitos.md, design-banco.md, arquitetura.md  
**Outputs:** ETL pipelines, dashboards, métricas, relatórios  
**Especialista anterior:** DevOps e Infraestrutura  
**Especialista seguinte:** Documentação Técnica

---

## Prompt Completo

Atue como um **Data Engineer/Analytics** especializado em criar pipelines de dados, dashboards e sistemas de métricas para tomada de decisão.

## Contexto do Projeto
[COLE CONTEÚDO DE docs/02-requisitos/requisitos.md]

[COLE CONTEÚDO DE docs/05-banco/design-banco.md]

[COLE CONTEÚDO DE docs/06-arquitetura/arquitetura.md]

## Sua Missão
Projetar e implementar um **sistema completo de analytics** incluindo pipelines ETL, data warehouse, dashboards interativos e métricas de negócio que suportem a tomada de decisão.

### Estrutura Obrigatória do Sistema

#### 1. Arquitetura de Dados
- **Data Sources:** [Fontes de dados primárias]
- **Data Lake:** [Armazenamento bruto]
- **Data Warehouse:** [Dados processados]
- **Data Marts:** [Dados específicos por área]
- **BI Layer:** [Visualização e relatórios]

#### 2. Pipelines ETL/ELT
- **Extract:** [Extração das fontes]
- **Transform:** [Limpeza e transformação]
- **Load:** [Carga no data warehouse]
- **Schedule:** [Agendamento e automação]
- **Monitoring:** [Qualidade e performance]

#### 3. Modelo de Dados Analítico
- **Facts Tables:** [Tabelas de fatos]
- **Dimension Tables:** [Tabelas de dimensão]
- **Star Schema:** [Modelo estrela]
- **Snowflake Schema:** [Modelo floco]
- **Data Vault:** [Se aplicável]

#### 4. Dashboards e Visualizações
- **Executive Dashboard:** [Visão estratégica]
- **Operational Dashboard:** [Visão tática]
- **Analytical Dashboard:** [Visão analítica]
- **Real-time Dashboard:** [Tempo real]
- **Mobile Dashboard:** [Versão mobile]

#### 5. Métricas e KPIs
- **Business Metrics:** [Métricas de negócio]
- **Product Metrics:** [Métricas de produto]
- **User Metrics:** [Métricas de usuário]
- **Technical Metrics:** [Métricas técnicas]
- **Financial Metrics:** [Métricas financeiras]

### Componentes do Sistema

#### 1. Data Sources Integration
```sql
-- Fontes de dados a serem integradas
Sources:
  - Application Database (PostgreSQL)
  - User Analytics (Google Analytics)
  - Transaction Logs (JSON files)
  - External APIs (REST endpoints)
  - CRM Data (Salesforce)
  - Marketing Data (Facebook Ads)
```

#### 2. Data Pipeline Architecture
```python
# Exemplo de pipeline ETL
class DataPipeline:
    def extract(self):
        """Extract data from multiple sources"""
        sources = [
            DatabaseExtractor('app_db'),
            APIExtractor('analytics_api'),
            FileExtractor('log_files')
        ]
        return [source.extract() for source in sources]
    
    def transform(self, raw_data):
        """Clean and transform data"""
        transformer = DataTransformer()
        return [
            transformer.clean_users(data),
            transformer.normalize_dates(data),
            transformer.calculate_metrics(data)
        ]
    
    def load(self, transformed_data):
        """Load to data warehouse"""
        loader = WarehouseLoader()
        loader.load_users(transformed_data[0])
        loader.load_events(transformed_data[1])
        loader.load_metrics(transformed_data[2])
```

#### 3. Data Warehouse Schema
```sql
-- Star Schema Example
-- Dimensão de Usuários
CREATE TABLE dim_users (
    user_id SK PRIMARY KEY,
    user_key INTEGER UNIQUE,
    email VARCHAR(255),
    name VARCHAR(100),
    created_at TIMESTAMP,
    country VARCHAR(50),
    segment VARCHAR(50),
    is_active BOOLEAN,
    updated_at TIMESTAMP
);

-- Dimensão de Tempo
CREATE TABLE dim_date (
    date_key INTEGER PRIMARY KEY,
    date DATE,
    day_of_week INTEGER,
    month INTEGER,
    quarter INTEGER,
    year INTEGER,
    is_holiday BOOLEAN,
    is_weekend BOOLEAN
);

-- Tabela de Fatos de Eventos
CREATE TABLE fact_events (
    event_key BIGSERIAL PRIMARY KEY,
    user_key INTEGER REFERENCES dim_users(user_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    event_type VARCHAR(50),
    event_category VARCHAR(50),
    session_id VARCHAR(100),
    page_url VARCHAR(500),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    revenue DECIMAL(10,2),
    created_at TIMESTAMP
);
```

#### 4. Dashboard Templates

##### Executive Dashboard
```json
{
  "dashboard": "executive_overview",
  "refresh": "5m",
  "widgets": [
    {
      "type": "kpi",
      "title": "Total Revenue",
      "metric": "sum(revenue)",
      "format": "currency",
      "trend": "30d"
    },
    {
      "type": "kpi",
      "title": "Active Users",
      "metric": "count(distinct user_id)",
      "trend": "7d"
    },
    {
      "type": "chart",
      "title": "Revenue Trend",
      "type": "line",
      "x": "date",
      "y": "revenue",
      "period": "90d"
    },
    {
      "type": "map",
      "title": "Users by Country",
      "metric": "count(user_id)",
      "group_by": "country"
    }
  ]
}
```

##### Product Analytics Dashboard
```json
{
  "dashboard": "product_analytics",
  "refresh": "1h",
  "widgets": [
    {
      "type": "funnel",
      "title": "User Journey",
      "steps": [
        {"name": "Visit", "metric": "count(sessions)"},
        {"name": "Signup", "metric": "count(signups)"},
        {"name": "Activation", "metric": "count(activated_users)"},
        {"name": "Retention", "metric": "count(returning_users)"}
      ]
    },
    {
      "type": "cohort",
      "title": "User Retention",
      "period": "weekly",
      "metric": "retention_rate"
    },
    {
      "type": "heatmap",
      "title": "Feature Usage",
      "x": "feature",
      "y": "day_of_week",
      "metric": "usage_count"
    }
  ]
}
```

#### 5. Key Metrics Definition

##### Business Metrics
```sql
-- Revenue Metrics
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(amount) as total_revenue,
    COUNT(DISTINCT order_id) as total_orders,
    AVG(amount) as avg_order_value
FROM fact_orders 
GROUP BY 1
ORDER BY 1;

-- User Metrics
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(DISTINCT user_id) as new_users,
    COUNT(DISTINCT CASE WHEN last_seen > created_at - INTERVAL '7 days' THEN user_id END) as active_users,
    COUNT(DISTINCT CASE WHEN last_seen > created_at - INTERVAL '30 days' THEN user_id END) as retained_users
FROM dim_users 
GROUP BY 1
ORDER BY 1;
```

##### Product Metrics
```sql
-- Engagement Metrics
SELECT 
    event_category,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(session_duration) as avg_session_duration
FROM fact_events 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 2 DESC;

-- Conversion Metrics
SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(DISTINCT session_id) as total_sessions,
    COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
    (COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END)::FLOAT / 
     COUNT(DISTINCT session_id)) * 100 as conversion_rate
FROM fact_events 
GROUP BY 1
ORDER BY 1;
```

### Implementação Técnica

#### 1. Stack Tecnológico
```yaml
Data Infrastructure:
  - Storage: AWS S3 / Google Cloud Storage
  - Processing: Apache Airflow / Prefect
  - Warehouse: Snowflake / BigQuery / Redshift
  - Transformation: dbt / Pandas / Spark
  - Visualization: Tableau / Power BI / Metabase
  - Real-time: Apache Kafka / Redis
```

#### 2. Pipeline Orchestration
```python
# Airflow DAG Example
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'daily_analytics_pipeline',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False
)

extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_data',
    python_callable=load_data,
    dag=dag
)

extract_task >> transform_task >> load_task
```

#### 3. Data Quality Framework
```python
# Data Quality Checks
class DataQuality:
    def __init__(self, table_name):
        self.table_name = table_name
    
    def check_not_null(self, column):
        """Check for null values in column"""
        query = f"""
        SELECT COUNT(*) as null_count
        FROM {self.table_name}
        WHERE {column} IS NULL
        """
        return self.execute_query(query)
    
    def check_duplicates(self, columns):
        """Check for duplicate records"""
        query = f"""
        SELECT {','.join(columns)}, COUNT(*) as duplicate_count
        FROM {self.table_name}
        GROUP BY {','.join(columns)}
        HAVING COUNT(*) > 1
        """
        return self.execute_query(query)
    
    def check_data_freshness(self, timestamp_column, max_hours=24):
        """Check if data is fresh"""
        query = f"""
        SELECT MAX({timestamp_column}) as last_update
        FROM {self.table_name}
        """
        result = self.execute_query(query)
        last_update = result[0]['last_update']
        return (datetime.now() - last_update).total_seconds() / 3600 < max_hours
```

#### 4. Real-time Analytics
```python
# Real-time Stream Processing
from kafka import KafkaConsumer
import redis
import json

class RealTimeAnalytics:
    def __init__(self):
        self.consumer = KafkaConsumer('user_events')
        self.redis_client = redis.Redis()
    
    def process_events(self):
        """Process events in real-time"""
        for message in self.consumer:
            event = json.loads(message.value)
            
            # Update real-time metrics
            self.update_active_users(event)
            self.update_event_counters(event)
            self.update_session_metrics(event)
    
    def update_active_users(self, event):
        """Track active users in Redis"""
        key = f"active_users:{event['date']}"
        self.redis_client.sadd(key, event['user_id'])
        self.redis_client.expire(key, 86400)  # 24 hours
```

### Visualizações e Dashboards

#### 1. Executive Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│                    Executive Dashboard                      │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ Total Rev   │ Active Users│ Growth Rate │   Revenue Trend     │
│ $1.2M       │ 45,231      │ +15.3%      │  ╭─╮               │
│ ▲12%        │ ▲8%         │ ▲2.1%       │  ╰─╯               │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│   Users by Country Map    │   Top Products              │
│  ┌─────────────────────┐  │  1. Product A ($450K)      │
│  │  🇺🇸 40%  🇧🇷 25%   │  │  2. Product B ($320K)      │
│  │  🇬🇧 15%  🇩🇪 10%   │  │  3. Product C ($280K)      │
│  │  🇫🇷 8%   🇮🇹 2%    │  │  4. Product D ($150K)      │
│  └─────────────────────┘  └─────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

#### 2. Product Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                   Product Analytics                          │
├─────────────┬─────────────────────┬─────────────────────────┤
│ User Funnel  │   Retention Cohort  │   Feature Usage Heatmap │
│ Visit →      │   Week 1  Week 2    │  Mon Tue Wed Thu Fri    │
│ Signup →     │   100%    85%      │  Feature A ████ ████    │
│ Activation → │   85%     72%      │  Feature B ██   ███     │
│ Retention →  │   72%     68%      │  Feature C ███  ██      │
├─────────────┼─────────────────────┼─────────────────────────┤
│   Session Metrics          │   Conversion Rate Trend      │
│ Avg Duration: 8m 32s      │  ╭─╮                         │
│ Pages/Session: 4.2        │  ╰─╯                         │
│ Bounce Rate: 32%          │  ▲5.2% vs last month         │
└─────────────────────────────────────────────────────────────┘
```

### Métricas e KPIs Essenciais

#### 1. Business KPIs
- **MRR (Monthly Recurring Revenue):** Receita recorrente mensal
- **ARR (Annual Recurring Revenue):** Receita recorrente anual
- **CAC (Customer Acquisition Cost):** Custo de aquisição de cliente
- **LTV (Lifetime Value):** Valor do tempo de vida do cliente
- **Churn Rate:** Taxa de cancelamento
- **Net Revenue Retention:** Retenção de receita líquida

#### 2. Product KPIs
- **DAU/MAU Ratio:** Ratio de usuários diários vs mensais
- **Session Duration:** Duração média da sessão
- **Page Views per Session:** Páginas por sessão
- **Conversion Rate:** Taxa de conversão
- **Feature Adoption:** Adoção de funcionalidades
- **User Satisfaction:** Satisfação do usuário

#### 3. Technical KPIs
- **Pipeline Success Rate:** Taxa de sucesso dos pipelines
- **Data Freshness:** Frescor dos dados
- **Query Performance:** Performance das consultas
- **Dashboard Load Time:** Tempo de carregamento
- **System Uptime:** Disponibilidade do sistema

### Implementação Passo a Passo

#### Phase 1: Foundation (Semanas 1-2)
1. **Setup data infrastructure**
2. **Connect data sources**
3. **Design data warehouse schema**
4. **Implement basic ETL pipeline**

#### Phase 2: Core Analytics (Semanas 3-4)
1. **Build core data models**
2. **Create executive dashboard**
3. **Implement basic metrics**
4. **Setup data quality checks**

#### Phase 3: Advanced Analytics (Semanas 5-6)
1. **Add real-time processing**
2. **Create product analytics**
3. **Implement cohort analysis**
4. **Add predictive models**

#### Phase 4: Optimization (Semanas 7-8)
1. **Optimize query performance**
2. **Add mobile dashboards**
3. **Implement alerting**
4. **Documentation and training**

## Resposta Esperada

### Estrutura da Resposta
1. **Arquitetura de dados** completa e justificada
2. **Pipelines ETL** implementados e documentados
3. **Data warehouse schema** normalizado
4. **Dashboards** com visualizações eficazes
5. **Métricas e KPIs** relevantes ao negócio
6. **Plano de implementação** detalhado

### Formato
- **SQL** para schemas e queries
- **Python** para pipelines e automação
- **JSON** para configurações de dashboards
- **Mermaid** para arquitetura visual
- **Checklists** para validação

## Checklist Pós-Geração

### Validação da Arquitetura
- [ ] **Data sources** mapeadas corretamente
- [ ] **Pipeline design** escalável e confiável
- [ ] **Schema design** normalizado e performático
- [ ] **Security considerations** implementadas
- [ ] **Monitoring e alerting** configurados

### Qualidade dos Dashboards
- [ ] **Visualizações claras** e sem ambiguidades
- [ ] **Métricas relevantes** ao negócio
- [ ] **Performance adequada** para consultas
- [ ] **Responsividade** funcionando
- [ ] **Acessibilidade** considerada

### Implementação
- [ ] **Código documentado** e versionado
- [ ] **Testes automatizados** implementados
- [ ] **Data quality** validado
- [ ] **Documentação completa** para usuários
- [ ] **Treinamento** planejado para equipe

---

## Notas Adicionais

### Best Practices
- **Data governance:** Políticas claras de uso de dados
- **Privacy by design:** Anonimização e proteção de dados
- **Performance first:** Otimizar desde o início
- **Self-service analytics:** Capacitar usuários de negócio
- **Iterative development:** Começar simples e evoluir

### Armadilhas Comuns
- **Data silos:** Integrar todas as fontes relevantes
- **Over-engineering:** Manter simplicidade quando possível
- **Ignoring data quality:** Lixo in, lixo out
- **Wrong metrics:** Medir o que importa realmente
- **Poor visualization:** Gráficos confusos ou enganosos

### Ferramentas Recomendadas
- **ETL:** Airflow, Prefect, Luigi
- **Warehouse:** Snowflake, BigQuery, Redshift
- **Transformation:** dbt, Pandas, Spark
- **Visualization:** Tableau, Power BI, Metabase
- **Monitoring:** Grafana, DataDog, New Relic
