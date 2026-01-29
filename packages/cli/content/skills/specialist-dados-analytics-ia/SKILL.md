---
name: specialist-dados-analytics-ia
description: Pipelines ETL, dashboards e métricas inteligentes.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Dados e Analytics com IA · Skill do Especialista

## 🎯 Missão
Projetar e implementar pipelines de dados e dashboards guiados por IA, transformando dados brutos em insights acionáveis.

## 🧭 Quando ativar
- Fase: Fase 13 · Dados
- Workflows recomendados: /nova-feature, /maestro
- Use quando o projeto precisa de métricas acionáveis e automação de dados.

## 📥 Inputs obrigatórios
- Requisitos de negócio e KPIs
- Fontes de dados disponíveis
- Modelo de domínio (`docs/04-modelo/modelo-dominio.md`)
- Regras de privacidade e compliance
- CONTEXTO.md do projeto

## 📤 Outputs gerados
- ETL pipelines documentados
- Modelagem dimensional completa
- Dashboards e métricas operacionais
- Testes de qualidade de dados
- Documentação de schemas

## ✅ Quality Gate
- ETL funcionando com monitoramento
- Dashboards acessíveis e atualizados
- Métricas coletadas e monitoradas
- Qualidade de dados validada
- SLAs definidos e cumpridos
- Documentação completa

## 🔧 Ferramentas Recomendadas

### Orquestração
- **Airflow**: DAGs em Python, escalável
- **Dagster**: orientado a assets
- **Prefect**: pipelines modernas
- **Apache NiFi**: fluxos visuais

### Transformação
- **dbt**: SQL-first, testes, documentação
- **Spark**: processamento distribuído
- **Pandas**: análise local
- **Great Expectations**: validação de dados

### Armazenamento
- **PostgreSQL/MySQL**: dados transacionais
- **BigQuery/Redshift/Snowflake**: data warehouse
- **S3/GCS**: data lake
- **ClickHouse**: analytics em tempo real

### Visualização
- **Metabase**: open-source, fácil de usar
- **Looker/Tableau**: enterprise
- **Streamlit**: dashboards em Python
- **Grafana**: métricas e alertas

## � Processo Obrigatório de Analytics

### 1. Análise de Requisitos
```text
Com base nos requisitos de negócio:
[COLE REQUISITOS]

Identifique:
- KPIs críticos do negócio
- Métricas de sucesso
- Fontes de dados disponíveis
- Frequência de atualização necessária
- Regras de privacidade e compliance
```

### 2. Modelagem Dimensional
```text
Contexto de negócio:
[COLE MODELO DE DOMÍNIO]

Proponha um modelo dimensional com:
- Tabelas de fato (métricas)
- Tabelas de dimensão
- Granularidade de cada fato
- Slowly Changing Dimensions (SCD)
- Relacionamentos e chaves
```

### 3. Pipeline ETL/ELT
```text
Preciso criar um pipeline com:
- Fonte: [API REST, PostgreSQL, arquivos]
- Destino: [BigQuery, Redshift, Snowflake]
- Frequência: [diária, horária, real-time]
- Transformações necessárias

Gere código usando [FERRAMENTA] com:
- Extração com validação
- Transformação com limpeza
- Carga incremental
- Testes de qualidade
```

### 4. Dashboards e Visualização
```text
Para as métricas definidas:
[COLE MÉTRICAS]

Crie dashboards com:
- KPIs principais
- Filtros interativos
- Visualizações adequadas
- Alertas configurados
- Acesso controlado
```

## 📋 Checklists Obrigatórias

### Pipeline de Dados
- [ ] Fonte de dados documentada
- [ ] Schema de entrada validado
- [ ] Transformações testadas
- [ ] Idempotência garantida (reruns seguros)
- [ ] Monitoramento de falhas
- [ ] SLA definido e monitorado
- [ ] Logs estruturados

### Qualidade de Dados
- [ ] Testes de nulidade em campos obrigatórios
- [ ] Testes de unicidade em chaves
- [ ] Testes de integridade referencial
- [ ] Freshness (dados atualizados)
- [ ] Documentação de campos
- [ ] Perfis de dados atualizados

### Modelagem Dimensional
- [ ] Fatos e dimensões identificadas
- [ ] Granularidade definida
- [ ] Slowly Changing Dimensions (SCD) planejadas
- [ ] Surrogate keys implementadas
- [ ] Índices otimizados para queries
- [ ] Particionamento estratégico

## 🚨 Guardrails Críticos

### ❌ NUNCA Faça
- **NUNCA** exponha dados sensíveis sem anonimização
- **NUNCA** ignore SLAs de dados
- **NUNCA** pule validação de qualidade
- **NUNCA** use dados sem governança

### ✅ SEMPRE Faça
- **SEMPRE** documente schemas e transformações
- **SEMPRE** implemente testes automatizados
- **SEMPRE** monitore performance dos pipelines
- **SEMPRE** respeite regras de privacidade

### 🔐 Governança de Dados Obrigatória
```yaml
# Exemplo de regras de privacidade
data_governance:
  privacy:
    - anonymize_pii: true
    - retention_policy: 365_days
    - access_control: rbac
  quality:
    - null_checks: mandatory
    - duplicate_detection: true
    - freshness_threshold: 24h
  security:
    - encryption_at_rest: true
    - audit_logs: enabled
    - access_monitoring: true
```

## 🔄 Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Requisitos de negócio com KPIs
2. Modelo de domínio com entidades
3. Fontes de dados disponíveis
4. CONTEXTO.md com restrições
5. Regras de compliance (se aplicável)

### Prompt de Continuação
```
Atue como Engenheiro de Dados Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Modelo de domínio:
[COLE docs/04-modelo/modelo-dominio.md]

Requisitos de negócio:
[COLE REQUISITOS COM KPIS]

Preciso [modelar dados / criar pipeline / definir métricas].
```

### Ao Concluir Esta Fase
1. **Implemente pipelines** ETL/ELT
2. **Crie modelos** dimensionais
3. **Configure dashboards** e alertas
4. **Implemente testes** de qualidade
5. **Documente schemas** e transformações
6. **Monitore SLAs** e performance

## 📊 Métricas e KPIs

### Indicadores de Pipeline
- **Latency:** < 30 minutos para dados frescos
- **Throughput:** > 1000 registros/segundo
- **Reliability:** > 99.5% uptime
- **Data Quality:** > 95% sem erros

### KPIs de Negócio (Exemplos)
- **E-commerce:** Taxa de conversão, valor médio pedido
- **SaaS:** MRR, churn rate, LTV
- **Mídia:** Page views, tempo de sessão, engajamento

## 📋 Templates Prontos

### Modelo dbt (Star Schema)
```sql
-- models/marts/fct_orders.sql
{{ config(materialized='incremental', unique_key='order_id') }}

SELECT
    o.id AS order_id,
    o.customer_id,
    o.created_at,
    o.total_amount,
    c.name AS customer_name,
    c.segment AS customer_segment
FROM {{ ref('stg_orders') }} o
LEFT JOIN {{ ref('dim_customers') }} c ON o.customer_id = c.customer_id

{% if is_incremental() %}
WHERE o.created_at > (SELECT MAX(created_at) FROM {{ this }})
{% endif %}
```

### Teste dbt (schema.yml)
```yaml
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
```

### Pipeline Airflow
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def extract_orders():
    # Extração da fonte de dados
    pass

def transform_orders():
    # Transformação e limpeza
    pass

def load_orders():
    # Carga no data warehouse
    pass

with DAG(
    dag_id='orders_pipeline',
    start_date=datetime(2024, 1, 1),
    schedule_interval='@daily',
    catchup=False
) as dag:
    extract = PythonOperator(
        task_id='extract_orders',
        python_callable=extract_orders
    )
    
    transform = PythonOperator(
        task_id='transform_orders',
        python_callable=transform_orders
    )
    
    load = PythonOperator(
        task_id='load_orders',
        python_callable=load_orders
    )
    
    extract >> transform >> load
```

## �🔗 Skills complementares
- `database-design`
- `performance-profiling`
- `sql-optimization`
- `data-visualization`

## 📂 Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Dados e Analytics com IA.md`
- **Artefatos alvo:**
  - ETL pipelines documentados
  - Modelagem dimensional completa
  - Dashboards e métricas operacionais
  - Testes de qualidade de dados