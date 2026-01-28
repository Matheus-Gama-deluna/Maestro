# Guia de Analytics com IA

## Objetivo

Este guia fornece uma abordagem completa para implementação de sistemas de analytics com IA, permitindo extrair insights valiosos dos dados e gerar valor de negócio através de análise preditiva e prescritiva.

## Contexto

O especialista em **Dados e Analytics com IA** é responsável por projetar, implementar e operar sistemas completos de analytics que vão desde a coleta de dados até a geração de insights acionáveis. Este guia cobre todo o ciclo de vida do analytics, incluindo arquitetura de dados, pipelines ETL/ELT, modelagem analítica, visualização e aplicação de técnicas de machine learning.

## Metodologia

### 1. Planejamento e Arquitetura

#### 1.1. Definição de Objetivos de Negócio
- Identificar KPIs críticos para o negócio
- Definir métricas de sucesso
- Mapear perguntas de negócio que precisam ser respondidas
- Estabelecer metas quantificáveis

#### 1.2. Arquitetura de Dados
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Fontes de     │    │   Pipeline      │    │   Data Lake /   │
│   Dados         │───▶│   ETL/ELT       │───▶│   Data Warehouse│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboards    │◀───│   Modelo        │◀───│   Data Mart     │
│   e Relatórios  │    │   Analítico     │    │   Especializado │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 1.3. Stack Tecnológico Recomendado
- **Coleta**: Apache Kafka, AWS Kinesis, Google Pub/Sub
- **Processamento**: Apache Spark, Apache Flink, dbt
- **Armazenamento**: Snowflake, BigQuery, Redshift, Databricks
- **Visualização**: Tableau, Power BI, Looker, Metabase
- **ML/IA**: TensorFlow, PyTorch, scikit-learn, MLflow

### 2. Coleta e Ingestão de Dados

#### 2.1. Identificação de Fontes de Dados
```python
# Exemplo de catálogo de fontes
data_sources = {
    "transactional": {
        "type": "database",
        "systems": ["PostgreSQL", "MySQL", "Oracle"],
        "frequency": "real-time",
        "volume": "high"
    },
    "behavioral": {
        "type": "events",
        "systems": ["Google Analytics", "Mixpanel", "Custom Events"],
        "frequency": "batch",
        "volume": "medium"
    },
    "external": {
        "type": "api",
        "systems": ["Weather API", "Social Media APIs", "Market Data"],
        "frequency": "daily",
        "volume": "low"
    }
}
```

#### 2.2. Pipeline de Ingestão
```python
# Exemplo de pipeline com Apache Airflow
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'analytics-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'analytics_pipeline',
    default_args=default_args,
    description='Pipeline de Analytics',
    schedule_interval='@hourly',
    catchup=False
)

def extract_transactional_data():
    """Extrai dados transacionais do banco de dados"""
    # Lógica de extração
    pass

def transform_data():
    """Transforma dados brutos em formato analítico"""
    # Lógica de transformação
    pass

def load_to_warehouse():
    """Carrega dados transformados no data warehouse"""
    # Lógica de carregamento
    pass

extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_transactional_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_data',
    python_callable=load_to_warehouse,
    dag=dag
)

extract_task >> transform_task >> load_task
```

### 3. Modelagem Analítica

#### 3.1. Schema em Estrela vs Snowflake
```sql
-- Exemplo de schema em estrela
-- Dimensão de Clientes
CREATE TABLE dim_customers (
    customer_id INTEGER PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_segment VARCHAR(100),
    registration_date DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimensão de Produtos
CREATE TABLE dim_products (
    product_id INTEGER PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(100),
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Fato de Vendas
CREATE TABLE fact_sales (
    sale_id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES dim_customers(customer_id),
    product_id INTEGER REFERENCES dim_products(product_id),
    sale_date DATE,
    quantity INTEGER,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2. Métricas e KPIs
```python
# Exemplo de definição de métricas
class BusinessMetrics:
    """Definição de métricas de negócio"""
    
    @staticmethod
    def revenue_growth(current_period, previous_period):
        """Crescimento de receita"""
        return ((current_period - previous_period) / previous_period) * 100
    
    @staticmethod
    def customer_retention(active_customers, total_customers):
        """Taxa de retenção de clientes"""
        return (active_customers / total_customers) * 100
    
    @staticmethod
    def average_order_value(total_revenue, total_orders):
        """Valor médio do pedido"""
        return total_revenue / total_orders
    
    @staticmethod
    def conversion_rate(conversions, total_visitors):
        """Taxa de conversão"""
        return (conversions / total_visitors) * 100
```

### 4. Visualização e Dashboards

#### 4.1. Princípios de Design de Dashboards
- **Clareza**: Informações fáceis de entender
- **Relevância**: Foco em métricas importantes
- **Tempo Real**: Dados atualizados quando necessário
- **Interatividade**: Permitir drill-down e filtros
- **Responsividade**: Funcionar em diferentes dispositivos

#### 4.2. Exemplo de Dashboard com Tableau
```python
# Exemplo de configuração de dashboard com Tableau API
import tableauserverclient as TSC

def create_analytics_dashboard():
    """Cria dashboard de analytics no Tableau"""
    
    # Conexão ao servidor
    server = TSC.Server('https://your-tableau-server.com')
    server.auth.sign_in('username', 'password')
    
    # Definição do projeto
    project_item = TSC.ProjectItem(name='Analytics Dashboard')
    
    # Configuração da fonte de dados
    datasource_item = TSC.DatasourceItem(
        project_id=project_item.id,
        name='Sales Analytics'
    )
    
    # Publicação do dashboard
    workbook_item = TSC.WorkbookItem(
        project_id=project_item.id,
        name='Executive Dashboard',
        show_tabs=True
    )
    
    # Publicação
    server.workbooks.publish(
        workbook_item,
        'path/to/workbook.twbx',
        TSC.PublishMode.Overwrite
    )
```

### 5. Analytics com Machine Learning

#### 5.1. Previsão de Séries Temporais
```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

class TimeSeriesForecaster:
    """Classe para previsão de séries temporais"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.features = []
    
    def prepare_features(self, data, target_column):
        """Prepara features para o modelo"""
        df = data.copy()
        
        # Features de tempo
        df['year'] = df.index.year
        df['month'] = df.index.month
        df['day'] = df.index.day
        df['dayofweek'] = df.index.dayofweek
        df['quarter'] = df.index.quarter
        
        # Features lag
        for lag in [1, 7, 30]:
            df[f'lag_{lag}'] = df[target_column].shift(lag)
        
        # Features de média móvel
        for window in [7, 30]:
            df[f'ma_{window}'] = df[target_column].rolling(window=window).mean()
        
        return df.dropna()
    
    def train(self, data, target_column):
        """Treina o modelo de previsão"""
        df = self.prepare_features(data, target_column)
        
        # Separação de features e target
        feature_columns = [col for col in df.columns if col != target_column]
        X = df[feature_columns]
        y = df[target_column]
        
        # Treinamento
        self.model.fit(X, y)
        self.features = feature_columns
        
        return self.model.score(X, y)
    
    def predict(self, data, periods=30):
        """Faz previsão para períodos futuros"""
        predictions = []
        last_data = data.copy()
        
        for _ in range(periods):
            # Prepara features
            df = self.prepare_features(last_data, data.columns[0])
            
            if len(df) > 0:
                # Faz previsão
                X = df[self.features].iloc[-1:]
                pred = self.model.predict(X)[0]
                predictions.append(pred)
                
                # Adiciona previsão aos dados
                next_date = last_data.index[-1] + pd.Timedelta(days=1)
                last_data.loc[next_date] = pred
        
        return predictions
```

#### 5.2. Segmentação de Clientes
```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

class CustomerSegmentation:
    """Classe para segmentação de clientes"""
    
    def __init__(self, n_clusters=5):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    
    def prepare_customer_data(self, df):
        """Prepara dados de clientes para segmentação"""
        features = [
            'total_purchases',
            'avg_order_value',
            'purchase_frequency',
            'days_since_last_purchase',
            'customer_lifetime_value'
        ]
        
        return df[features].fillna(0)
    
    def fit_predict(self, customer_data):
        """Executa segmentação"""
        # Normalização
        X_scaled = self.scaler.fit_transform(customer_data)
        
        # Clusterização
        clusters = self.kmeans.fit_predict(X_scaled)
        
        return clusters
    
    def analyze_segments(self, customer_data, clusters):
        """Analisa características dos segmentos"""
        df = customer_data.copy()
        df['cluster'] = clusters
        
        # Análise descritiva
        segment_analysis = df.groupby('cluster').agg({
            'total_purchases': ['mean', 'std'],
            'avg_order_value': ['mean', 'std'],
            'purchase_frequency': ['mean', 'std'],
            'days_since_last_purchase': ['mean', 'std'],
            'customer_lifetime_value': ['mean', 'std']
        }).round(2)
        
        return segment_analysis
```

### 6. Monitoramento e Qualidade

#### 6.1. Monitoramento de Pipeline
```python
import logging
from datetime import datetime

class PipelineMonitor:
    """Monitoramento de pipelines de dados"""
    
    def __init__(self):
        self.logger = logging.getLogger('analytics_pipeline')
        self.logger.setLevel(logging.INFO)
    
    def log_pipeline_start(self, pipeline_name):
        """Registra início do pipeline"""
        timestamp = datetime.now().isoformat()
        self.logger.info(f"Pipeline {pipeline_name} started at {timestamp}")
    
    def log_pipeline_success(self, pipeline_name, duration, records_processed):
        """Registra sucesso do pipeline"""
        timestamp = datetime.now().isoformat()
        self.logger.info(
            f"Pipeline {pipeline_name} completed successfully at {timestamp}. "
            f"Duration: {duration:.2f}s, Records: {records_processed}"
        )
    
    def log_pipeline_error(self, pipeline_name, error):
        """Registra erro no pipeline"""
        timestamp = datetime.now().isoformat()
        self.logger.error(
            f"Pipeline {pipeline_name} failed at {timestamp}. Error: {str(error)}"
        )
    
    def check_data_quality(self, df, rules):
        """Verifica qualidade dos dados"""
        quality_report = {}
        
        for column, rule in rules.items():
            if column in df.columns:
                # Verifica valores nulos
                null_count = df[column].isnull().sum()
                null_percentage = (null_count / len(df)) * 100
                
                # Verifica duplicatas
                duplicate_count = df[column].duplicated().sum()
                
                quality_report[column] = {
                    'null_count': null_count,
                    'null_percentage': null_percentage,
                    'duplicate_count': duplicate_count,
                    'passed_rules': rule.validate(df[column])
                }
        
        return quality_report
```

#### 6.2. Alertas e Notificações
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertManager:
    """Gerenciamento de alertas"""
    
    def __init__(self, smtp_config):
        self.smtp_config = smtp_config
    
    def send_data_quality_alert(self, quality_report):
        """Envia alerta de qualidade de dados"""
        issues = []
        
        for column, metrics in quality_report.items():
            if metrics['null_percentage'] > 5:
                issues.append(f"{column}: {metrics['null_percentage']:.1f}% nulos")
            
            if metrics['duplicate_count'] > 0:
                issues.append(f"{column}: {metrics['duplicate_count']} duplicatas")
        
        if issues:
            subject = "🚨 Alerta de Qualidade de Dados"
            body = f"""
            Problemas detectados na qualidade dos dados:
            
            {chr(10).join(f'• {issue}' for issue in issues)}
            
            Por favor, investigue e corrija os problemas.
            """
            
            self.send_email(subject, body)
    
    def send_performance_alert(self, metric_name, current_value, threshold):
        """Envia alerta de performance"""
        if current_value < threshold:
            subject = f"⚠️ Alerta de Performance: {metric_name}"
            body = f"""
            A métrica {metric_name} está abaixo do threshold esperado:
            
            Valor atual: {current_value:.2f}
            Threshold: {threshold:.2f}
            
            Por favor, investigue a causa da queda de performance.
            """
            
            self.send_email(subject, body)
    
    def send_email(self, subject, body):
        """Envia email de alerta"""
        msg = MIMEMultipart()
        msg['From'] = self.smtp_config['from']
        msg['To'] = self.smtp_config['to']
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(self.smtp_config['smtp_server'], self.smtp_config['port'])
        server.starttls()
        server.login(self.smtp_config['username'], self.smtp_config['password'])
        server.send_message(msg)
        server.quit()
```

## Templates e Exemplos

### Template de Projeto Analytics
```markdown
# Projeto de Analytics: [Nome do Projeto]

## 1. Visão Geral
- **Objetivo**: [Descrição do objetivo]
- **Stakeholders**: [Lista de stakeholders]
- **Timeline**: [Período do projeto]
- **Orçamento**: [Orçamento estimado]

## 2. Requisitos de Negócio
### 2.1. KPIs a Serem Monitorados
- [KPI 1]: [Descrição e target]
- [KPI 2]: [Descrição e target]
- [KPI 3]: [Descrição e target]

### 2.2. Perguntas de Negócio
- [Pergunta 1]
- [Pergunta 2]
- [Pergunta 3]

## 3. Arquitetura Técnica
### 3.1. Fontes de Dados
- [Fonte 1]: [Descrição, volume, frequência]
- [Fonte 2]: [Descrição, volume, frequência]

### 3.2. Stack Tecnológico
- **Coleta**: [Ferramentas]
- **Processamento**: [Ferramentas]
- **Armazenamento**: [Ferramentas]
- **Visualização**: [Ferramentas]

## 4. Implementação
### 4.1. Fases do Projeto
1. [Fase 1]: [Descrição e deliverables]
2. [Fase 2]: [Descrição e deliverables]
3. [Fase 3]: [Descrição e deliverables]

### 4.2. Cronograma
- [Mês 1]: [Atividades]
- [Mês 2]: [Atividades]
- [Mês 3]: [Atividades]

## 5. Entregáveis
- [Entregável 1]: [Descrição]
- [Entregável 2]: [Descrição]
- [Entregável 3]: [Descrição]
```

### Template de Relatório de Insights
```markdown
# Relatório de Insights Analytics
**Período**: [Data Início] - [Data Fim]
**Gerado em**: [Data de Geração]

## Resumo Executivo
[Principais descobertas e recomendações]

## Métricas Principais
| Métrica | Valor Período | Valor Anterior | Variação | Target |
|---------|---------------|----------------|----------|--------|
| [Métrica 1] | [Valor] | [Valor] | [%] | [Target] |
| [Métrica 2] | [Valor] | [Valor] | [%] | [Target] |
| [Métrica 3] | [Valor] | [Valor] | [%] | [Target] |

## Insights Detalhados
### [Insight 1]
- **Observação**: [Descrição]
- **Impacto**: [Impacto no negócio]
- **Recomendação**: [Ação sugerida]
- **Prioridade**: [Alta/Média/Baixa]

### [Insight 2]
- **Observação**: [Descrição]
- **Impacto**: [Impacto no negócio]
- **Recomendação**: [Ação sugerida]
- **Prioridade**: [Alta/Média/Baixa]

## Análise de Tendências
[Análise de tendências e padrões identificados]

## Próximos Passos
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]
```

## Melhores Práticas

### 1. Governança de Dados
- Estabelecer políticas claras de qualidade de dados
- Implementar catálogo de dados
- Definir responsabilidades (data owners, stewards)
- Documentar lineage de dados

### 2. Segurança e Privacidade
- Anonimizar dados sensíveis
- Implementar controle de acesso baseado em roles
- Seguir regulamentações (LGPD, GDPR)
- Realizar auditorias de segurança

### 3. Performance e Escalabilidade
- Otimizar queries e consultas
- Implementar caching estratégico
- Monitorar uso de recursos
- Planejar escalabilidade horizontal

### 4. Colaboração e Comunicação
- Envolvimento contínuo de stakeholders
- Documentação completa e acessível
- Treinamento da equipe
- Feedback constante dos usuários

## Checklist de Validação

### Planejamento
- [ ] Objetivos de negócio claramente definidos
- [ ] KPIs e métricas estabelecidos
- [ ] Stakeholders identificados e alinhados
- [ ] Arquitetura técnica desenhada
- [ ] Stack tecnológico selecionado

### Implementação
- [ ] Fontes de dados mapeadas
- [ ] Pipeline ETL/ELT implementado
- [ ] Modelo de dados validado
- [ ] Dashboards criados
- [ ] Testes realizados

### Operação
- [ ] Monitoramento implementado
- [ ] Alertas configurados
- [ ] Documentação completa
- [ ] Equipe treinada
- [ ] Processos de backup definidos

### Qualidade
- [ ] Qualidade dos dados verificada
- [ ] Performance validada
- [ ] Segurança implementada
- [ ] Testes de carga realizados
- [ ] Feedback dos usuários coletado

## Ferramentas e Recursos

### Ferramentas Open Source
- **Apache Airflow**: Orquestração de pipelines
- **Apache Spark**: Processamento de big data
- **dbt**: Transformação de dados
- **Metabase**: Visualização de dados
- **MLflow**: Gestão de ML lifecycle

### Ferramentas Comerciais
- **Tableau**: Visualização e BI
- **Power BI**: Analytics da Microsoft
- **Looker**: Plataforma de dados
- **Snowflake**: Data warehouse cloud
- **Databricks**: Plataforma unificada de analytics

### Recursos de Aprendizado
- Documentação oficial das ferramentas
- Cursos online (Coursera, Udemy, edX)
- Comunidades e fóruns
- Livros e whitepapers
- Workshops e conferências

## Conclusão

Este guia fornece uma abordagem estruturada para implementação de sistemas de analytics com IA. O sucesso depende do alinhamento entre tecnologia e negócio, da qualidade dos dados e da capacidade de gerar insights acionáveis.

Lembre-se que analytics é um processo iterativo de aprendizado e melhoria contínua. Comece simples, valide hipóteses e evolua gradualmente a complexidade conforme necessário.

---

**Próximos Passos Recomendados:**
1. Realizar proof of concept com dados reais
2. Validar hipóteses com stakeholders
3. Implementar MVP do dashboard
4. Coletar feedback e iterar
5. Expander para outras áreas do negócio
