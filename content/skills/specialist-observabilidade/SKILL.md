---
name: specialist-observabilidade
description: Logs, métricas, tracing e SLOs para operação confiável.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Observabilidade · Skill do Especialista

## 🎯 Missão
Construir stack de observabilidade completa com monitoramento proativo, implementando os três pilares: Logs, Métricas e Traces para operação confiável.

## 🧭 Quando ativar
- Fase: Especialista Avançado
- Workflows recomendados: /deploy, /maestro
- Use quando precisar antes ou durante operação em produção enterprise.

## 📥 Inputs obrigatórios
- Arquitetura e módulos (`docs/06-arquitetura/arquitetura.md`)
- Requisitos NF (não funcionais)
- Metas de confiabilidade
- Ferramentas disponíveis
- CONTEXTO.md do projeto

## 📤 Outputs gerados
- Stack de observabilidade completo
- SLOs e dashboards
- Runbooks operacionais
- Estratégia de alertas
- Configuração de tracing

## ✅ Quality Gate
- Logs estruturados e centralizados
- Métricas chave configuradas
- Traces distribuídos implementados
- SLOs definidos e monitorados
- Alertas mapeadas e testadas
- Runbooks documentados

## 📊 Os Três Pilares da Observabilidade

### 1. Logs (📝)
- **Logging Estruturado:** JSON com contexto
- **Níveis:** debug, info, warn, error
- **Correlation ID:** Propagação de contexto
- **Mascaramento:** Dados sensíveis protegidos
- **Centralização:** ELK, Loki, CloudWatch

### 2. Métricas (📈)
- **RED Method:** Rate, Errors, Duration
- **USE Method:** Utilization, Saturation
- **Business Metrics:** KPIs específicos
- **Resource Metrics:** CPU, Memory, Network
- **Alertas:** Thresholds inteligentes

### 3. Traces (🔗)
- **Distributed Tracing:** OpenTelemetry, Jaeger, Zipkin
- **Context Propagation:** Request tracing
- **Service Mesh:** Istio, Linkerd
- **Performance Analysis:** Latência breakdown

## 🔧 Processo de Implementação

### 1. Estratégia de Logging
```text
Sistema: [DESCREVA]
Stack: [TECNOLOGIAS]
Ambientes: [dev, staging, prod]

Defina estratégia de logging:
1. Níveis de log por ambiente:
   - Dev: debug
   - Staging: info
   - Prod: info (debug pontual)
   
2. Formato estruturado (JSON):
   - timestamp
   - level
   - message
   - correlationId/traceId
   - userId (se autenticado)
   - metadata contextual

3. O que logar:
   - Requests HTTP (entrada/saída)
   - Erros com stack trace
   - Eventos de negócio importantes
   - Decisões de sistema

4. O que NUNCA logar:
   - PII sem mascaramento
   - Secrets/tokens
   - Bodies muito grandes
```

### 2. Implementação de Logs
```javascript
// Exemplo Node.js com Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-service' }
});

// Middleware de logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    correlationId: req.headers['x-correlation-id']
  });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      correlationId: req.headers['x-correlation-id']
    });
  });
  
  next();
};
```

### 3. Métricas Business e Técnicas
```text
Defina métricas usando RED/USE:

**RED (para serviços):**
- Rate: requisições por segundo
- Errors: taxa de erro
- Duration: latência (p50, p95, p99)

**USE (para recursos):**
- Utilization: % de uso
- Saturation: fila/espera
- Errors: erros do recurso

**Business Metrics:**
- [métrica específica do domínio]
- [métricas de usuário]
- [métricas de negócio]
```

### 4. Instrumentação Prometheus
```javascript
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware de métricas
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route, res.statusCode)
      .observe(duration);
    httpRequestTotal
      .labels(req.method, req.route, res.statusCode)
      .inc();
  });
  
  next();
};
```

### 5. Distributed Tracing
```javascript
// Exemplo com OpenTelemetry
const { NodeSDK } = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = NodeSDK.start({
  serviceName: 'api-service',
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'api-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production'
  })
});

// Tracing middleware
const tracingMiddleware = (req, res, next) => {
  const tracer = sdk.getTracer('api-server');
  const span = tracer.startSpan('http-request');
  
  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'http.target': req.url
  });
  
  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode
    });
    span.end();
  });
  
  next();
};
```

## 🚨 SLOs e SLAs

### Definição de SLOs
```text
Service Level Objectives (SLOs):
- **Availability:** 99.9% (43min downtime/mês)
- **Latency:** p95 < 200ms, p99 < 500ms
- **Error Rate:** < 0.1%
- **Throughput:** > 1000 RPS

Service Level Indicators (SLIs):
- **Availability:** Uptime percentage
- **Latency:** Response time percentiles
- **Error Rate:** Error percentage
- **Throughput:** Requests per second
```

### Error Budget
```text
Error Budget Calculation:
- Target Availability: 99.9%
- Monthly Budget: 43.2 minutes
- Current Month: [minutos utilizados]
- Budget Remaining: [minutos restantes]
- Alert Threshold: 80% do budget
```

## 📋 Dashboards Essenciais

### 1. System Overview
- **Health Status:** Status de todos os serviços
- **Request Rate:** RPS por serviço
- **Error Rate:** Taxa de erro por serviço
- **Latency:** Latência média e percentis
- **Resource Usage:** CPU, Memory, Disk

### 2. Business Metrics
- **User Activity:** Usuários ativos
- **Transaction Volume:** Volume de transações
- **Revenue Metrics:** Métricas de receita
- **Conversion Rates:** Taxas de conversão
- **Custom KPIs:** KPIs específicos do negócio

### 3. Infrastructure
- **Cluster Health:** Status do Kubernetes
- **Database Performance:** Métricas do banco
- **Network Latency:** Latência de rede
- **Storage Usage:** Uso de armazenamento
- **Security Events:** Eventos de segurança

## 🚨 Alerting Strategies

### Alert Levels
```text
**Critical (PagerDuty):**
- Service down
- Error rate > 5%
- Latency p99 > 1s
- Database connections exhausted

**Warning (Slack):**
- Error rate > 1%
- Latency p95 > 500ms
- High memory usage > 80%
- Queue depth > 100

**Info (Email):**
- Deployments
- Configuration changes
- Performance degradation
- New alerts created
```

### Alerting Rules
```yaml
# Prometheus Alertmanager
groups:
  - name: critical
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
```

## 🔄 Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Arquitetura completa
2. Requisitos não funcionais
3. CONTEXTO.md com restrições
4. Metas de confiabilidade
5. Stack tecnológico definido

### Prompt de Continuação
```
Atue como SRE Sênior especialista em Observabilidade.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

Requisitos NF:
[COLE SEÇÃO DE RNF]

Preciso [definir SLOs / configurar logging / implementar tracing / criar dashboards].
```

### Ao Concluir Esta Fase
1. **Implemente** logging estruturado
2. **Configure** métricas RED/USE
3. **Implemente** distributed tracing
4. **Defina** SLOs e SLAs
5. **Crie** dashboards essenciais
6. **Configure** alertas inteligentes
7. **Documente** runbooks

## 📊 Métricas de Qualidade

### Indicadores Obrigatórios
- **Log Coverage:** 100% de serviços
- **Metric Coverage:** 100% de componentes críticos
- **Trace Coverage:** 100% de requests
- **SLO Achievement:** ≥ 99.9%
- **MTTR:** < 30 minutos

### Metas de Excelência
- Log Coverage: 100%
- Metric Coverage: 100%
- Trace Coverage: 100%
- SLO Achievement: ≥ 99.99%
- MTTR: < 15 minutos

## 📋 Templates Prontos

### Logging Configuration
```yaml
# winston.config.js
module.exports = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.metadata()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    version: process.env.SERVICE_VERSION,
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/app.log',
      maxsize: 52428800, // 50MB
      maxFiles: 5
    })
  ]
};
```

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'api-service'
    static_configs:
      - targets: ['localhost:3000/metrics']
    metrics_path: /metrics
    scrape_interval: 15s
```

### Grafana Dashboard JSON
```json
{
  "dashboard": {
    "title": "System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~"5.."}[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

## 🔗 Skills complementares
- `performance-profiling`
- `deployment-procedures`
- `systematic-debugging`
- `monitoring-setup`
- `alerting-strategies`

## 📂 Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Observabilidade.md`
- **Artefatos alvo:**
  - Stack de observabilidade completo
  - SLOs e dashboards
  - Runbooks operacionais
  - Estratégia de alertas
  - Configuração de tracing