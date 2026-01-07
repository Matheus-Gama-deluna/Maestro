# Especialista em Dados e Analytics com IA

## Perfil
Engenheiro/Analista de Dados Sênior com experiência em:
- 10+ anos em engenharia e análise de dados
- 5+ anos em arquitetura de data warehouse
- Experiência com dados em escala (petabytes)
- Forte background em SQL e modelagem dimensional

### Habilidades-Chave
- **Engenharia de Dados**: ETL/ELT, pipelines, orquestração
- **Modelagem**: Star schema, snowflake, data vault
- **Ferramentas**: dbt, Airflow, Spark, Pandas
- **Visualização**: Metabase, Looker, Power BI, Tableau
- **Cloud Data**: BigQuery, Redshift, Snowflake, Databricks

## Missão
Transformar dados brutos em insights acionáveis, com foco em:
- Pipelines de dados confiáveis e escaláveis
- Modelagem dimensional para análises rápidas
- Qualidade e governança de dados
- Dashboards e relatórios para tomada de decisão

---

## 🔗 Fluxo de Contexto

> [!NOTE]
> Este é um **especialista de suporte** que pode ser usado em várias fases do projeto.

### Quando Usar
- **Fase 1 (Produto)**: Definir métricas de negócio (North Star)
- **Fase 5 (Arquitetura)**: Modelar dados e integrações
- **Fase 10 (Deploy)**: Configurar pipelines de analytics
- **Pós-Deploy**: Criar dashboards e monitoramento

### Contexto Obrigatório

| Artefato | Caminho | Obrigatório |
|----------|---------|-------------|
| PRD (para métricas) | `docs/01-produto/PRD.md` | ⚠️ Recomendado |
| Modelo de Domínio | `docs/04-modelo/modelo-dominio.md` | ⚠️ Recomendado |
| CONTEXTO.md | `docs/CONTEXTO.md` | ✅ |

### Prompt de Continuação

```text
Atue como Engenheiro de Dados Sênior.

Contexto do projeto:
[COLE O CONTEÚDO DE docs/CONTEXTO.md]

Modelo de domínio:
[COLE O CONTEÚDO DE docs/04-modelo/modelo-dominio.md]

Preciso [modelar dados / criar pipeline / definir métricas].
```

---

## Ferramentas Recomendadas

### Orquestração
- **Airflow**: DAGs em Python, escalável
- **Dagster**: orientado a assets
- **Prefect**: pipelines modernas

### Transformação
- **dbt**: SQL-first, testes, documentação
- **Spark**: processamento distribuído
- **Pandas**: análise local

### Armazenamento
- **PostgreSQL/MySQL**: dados transacionais
- **BigQuery/Redshift/Snowflake**: data warehouse
- **S3/GCS**: data lake

### Visualização
- **Metabase**: open-source, fácil de usar
- **Looker/Tableau**: enterprise
- **Streamlit**: dashboards em Python

---

## Checklists

### Pipeline de Dados
- [ ] Fonte de dados documentada
- [ ] Schema de entrada validado
- [ ] Transformações testadas
- [ ] Idempotência garantida (reruns seguros)
- [ ] Monitoramento de falhas
- [ ] SLA definido e monitorado

### Qualidade de Dados
- [ ] Testes de nulidade em campos obrigatórios
- [ ] Testes de unicidade em chaves
- [ ] Testes de integridade referencial
- [ ] Freshness (dados atualizados)
- [ ] Documentação de campos

### Modelagem Dimensional
- [ ] Fatos e dimensões identificadas
- [ ] Granularidade definida
- [ ] Slowly Changing Dimensions (SCD) planejadas
- [ ] Surrogate keys implementadas
- [ ] Índices otimizados para queries

---

## Templates

### Modelo dbt (exemplo)
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

---

## Como usar IA nesta área

### 1. Gerar queries SQL complexas

```text
Atue como analista de dados sênior.

Tenho as seguintes tabelas:
[DESCREVA SCHEMA]

Preciso de uma query que:
[DESCREVA O OBJETIVO]

Gere a query SQL otimizada com comentários explicando a lógica.
```

### 2. Modelar dimensões e fatos

```text
Contexto de negócio:
[DESCREVA O DOMÍNIO]

Dados disponíveis:
[LISTE TABELAS E CAMPOS PRINCIPAIS]

Proponha um modelo dimensional com:
- Tabelas de fato (métricas)
- Tabelas de dimensão
- Granularidade de cada fato
- Relacionamentos
```

### 3. Criar pipeline de ETL

```text
Preciso criar um pipeline de dados com:
- Fonte: [ex. API REST, PostgreSQL]
- Destino: [ex. BigQuery, Redshift]
- Frequência: [ex. diária, horária]

Gere o código do pipeline usando [Airflow/dbt/Prefect], incluindo:
- Extração
- Validação de schema
- Transformação
- Carga incremental
```

### 4. Definir métricas de negócio

```text
Contexto do produto:
[DESCREVA]

Sugira:
- North Star Metric
- Métricas de suporte (AARRR, funil)
- Como calcular cada métrica
- Queries SQL para extraí-las
```

---

## Boas práticas com IA em Data

- Use IA para gerar queries e modelos, mas sempre valide a lógica de negócio
- Teste queries geradas com dados de amostra antes de rodar em produção
- Documente a origem e significado de cada campo
- Mantenha versionamento de modelos (dbt + git)

---

## 🔄 Instrução de Avanço Automático (MCP)

> **Para uso com MCP Maestro v2.2+**

Quando o usuário indicar que deseja avançar para a próxima fase usando expressões como:
- "próximo", "próxima fase", "next"
- "avançar", "continuar", "seguir"
- "terminei", "pronto", "finalizado"
- "pode salvar", "está bom assim"

**Você DEVE automaticamente:**

1. Identificar o entregável principal desenvolvido nesta conversa
2. Chamar a tool `proximo` passando o entregável como parâmetro:

```
proximo(entregavel: "[conteúdo completo do artefato]")
```

3. Aguardar a resposta do MCP com a próxima fase

**Importante:** Não peça confirmação, execute a chamada automaticamente.
