# 📚 Guia Técnico Completo - DevOps e Infraestrutura

## Visão Geral

Guia completo de boas práticas, padrões e implementações para engenharia de DevOps e infraestrutura moderna, focado em automação, segurança e escalabilidade.

## 🏗️ Fundamentos de DevOps

### Princípios Core

#### 1. Infrastructure as Code (IaC)
- **Definição**: Gerenciar infraestrutura através de código versionável
- **Benefícios**: Reprodutibilidade, consistência, auditoria
- **Tools**: Terraform, Pulumi, Ansible

#### 2. CI/CD Pipeline
- **Continuous Integration**: Integração contínua de código
- **Continuous Deployment**: Deploy automatizado
- **Continuous Delivery**: Entrega contínua com aprovação

#### 3. Observabilidade
- **Three Pillars**: Logs, Metrics, Traces
- **Proactive Monitoring**: Alertas antes dos usuários
- **SLO/SLI**: Service Level Objectives/Indicators

#### 4. Security by Design
- **DevSecOps**: Security integrada no pipeline
- **Zero Trust**: Nunca confiar, sempre verificar
- **Compliance**: Regulamentações e padrões

## 🛠️ Stack Tecnológica

### Languages e Frameworks

#### Node.js Ecosystem
```yaml
# Características
- Runtime: Node.js 18+ LTS
- Frameworks: Next.js, NestJS, Express
- Package Manager: npm/yarn/pnpm
- Build Tools: Webpack, Vite, esbuild

# Considerações DevOps
- Container size optimization
- Memory management
- Cluster mode for production
```

#### Python Ecosystem
```yaml
# Características
- Runtime: Python 3.11+
- Frameworks: Django, FastAPI, Flask
- Package Manager: pip, poetry
- Virtual Env: venv, conda

# Considerações DevOps
- Gunicorn/uvicorn for production
- WSGI/ASGI configuration
- Dependency management
```

#### Java Ecosystem
```yaml
# Características
- Runtime: Java 17+ LTS
- Frameworks: Spring Boot, Quarkus
- Build Tools: Maven, Gradle
- Container: Jib, Buildpacks

# Considerações DevOps
- JVM tuning
- Memory allocation
- GraalVM native images
```

#### Go Ecosystem
```yaml
# Características
- Runtime: Go 1.21+
- Frameworks: Gin, Echo, Chi
- Build Tools: Go modules
- Compilation: Static binary

# Considerações DevOps
- Single binary deployment
- Cross-compilation
- Small container images
```

### Databases

#### PostgreSQL
```yaml
# Características
- Type: Relational SQL
- Version: 15+
- Extensions: pg_stat_statements, TimescaleDB
- Replication: Streaming, logical

# DevOps Considerations
- Connection pooling (PgBouncer)
- Backup strategies (pg_dump, WAL-E)
- Monitoring (pg_stat_statements)
- High availability (Patroni)
```

#### MongoDB
```yaml
# Características
- Type: Document NoSQL
- Version: 6.0+
- Replication: Replica sets
- Sharding: Auto-sharding

# DevOps Considerations
- Index optimization
- Connection pooling
- Backup strategies (mongodump)
- Monitoring (Cloud Manager)
```

#### Redis
```yaml
# Características
- Type: In-memory key-value
- Version: 7.0+
- Persistence: RDB, AOF
- Clustering: Redis Cluster

# DevOps Considerations
- Memory management
- Persistence strategies
- High availability (Sentinel)
- Monitoring (Redis Insight)
```

## ☁️ Cloud Providers

### AWS (Amazon Web Services)

#### Core Services
```yaml
Compute:
  - EC2: Virtual machines
  - ECS/EKS: Container orchestration
  - Lambda: Serverless functions
  - Fargate: Serverless containers

Storage:
  - S3: Object storage
  - EBS: Block storage
  - EFS: File storage
  - Glacier: Cold storage

Database:
  - RDS: Managed relational
  - DynamoDB: NoSQL
  - ElastiCache: In-memory
  - DocumentDB: MongoDB-compatible

Networking:
  - VPC: Virtual private cloud
  - ALB/NLB: Load balancers
  - CloudFront: CDN
  - Route53: DNS
```

#### Best Practices AWS
```yaml
Cost Optimization:
  - Use Reserved Instances
  - Implement auto-scaling
  - Monitor with Cost Explorer
  - Use S3 lifecycle policies

Security:
  - IAM least privilege
  - VPC with private subnets
  - Security groups
  - WAF for web apps

Reliability:
  - Multi-AZ deployments
  - Cross-region replication
  - Backup strategies
  - Disaster recovery planning
```

### GCP (Google Cloud Platform)

#### Core Services
```yaml
Compute:
  - Compute Engine: VMs
  - GKE: Kubernetes
  - Cloud Run: Serverless containers
  - Cloud Functions: Serverless functions

Storage:
  - Cloud Storage: Object storage
  - Persistent Disk: Block storage
  - Filestore: File storage

Database:
  - Cloud SQL: Managed relational
  - Firestore: NoSQL
  - Memorystore: In-memory
  - Spanner: Global database

Networking:
  - VPC: Virtual network
  - Cloud Load Balancing: Load balancers
  - Cloud CDN: CDN
  - Cloud DNS: DNS
```

### Azure (Microsoft Azure)

#### Core Services
```yaml
Compute:
  - Virtual Machines: VMs
  - AKS: Kubernetes
  - Container Instances: Containers
  - Functions: Serverless

Storage:
  - Blob Storage: Object storage
  - Disk Storage: Block storage
  - Files: File storage

Database:
  - SQL Database: Managed relational
  - Cosmos DB: Multi-model NoSQL
  - Redis Cache: In-memory

Networking:
  - VNet: Virtual network
  - Load Balancer: Load balancer
  - CDN: CDN
  - DNS: DNS
```

## 🐳 Containerização

### Docker Best Practices

#### Dockerfile Optimization
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
```

#### Security Best Practices
```dockerfile
# Use specific image versions
FROM node:20.2.0-alpine3.18

# Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Minimal base image
FROM alpine:3.18

# Security scanning
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
```

### Kubernetes Orchestration

#### Deployment Manifest
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-produtos
  labels:
    app: api-produtos
    version: v1.2.3
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-produtos
  template:
    metadata:
      labels:
        app: api-produtos
    spec:
      containers:
      - name: api-produtos
        image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/api-produtos:v1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service Manifest
```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-produtos-service
spec:
  selector:
    app: api-produtos
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Ingress Manifest
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-produtos-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api-produtos.example.com
    secretName: api-produtos-tls
  rules:
  - host: api-produtos.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-produtos-service
            port:
              number: 80
```

## 🔄 CI/CD Pipelines

### GitHub Actions

#### Pipeline Completo
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  AWS_REGION: 'us-east-1'
  ECR_REGISTRY: '123456789012.dkr.ecr.us-east-1.amazonaws.com'
  ECR_REPOSITORY: 'api-produtos'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run SAST
        uses: securecodewarrior/github-action-add-sarif@v1
      - name: Run SCA
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Container Scan
        uses: aquasecurity/trivy-action@master

  build:
    needs: [lint, test, security]
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Log in to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster api-produtos-dev \
            --service api-produtos-service \
            --force-new-deployment

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster api-produtos-staging \
            --service api-produtos-service \
            --force-new-deployment

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster api-produtos-prod \
            --service api-produtos-service \
            --force-new-deployment
```

### GitLab CI/CD

#### Pipeline GitLab
```yaml
stages:
  - lint
  - test
  - security
  - build
  - deploy

variables:
  NODE_VERSION: '20'
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

lint:
  stage: lint
  image: node:${NODE_VERSION}
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run lint

test:
  stage: test
  image: node:${NODE_VERSION}
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run test:unit
    - npm run test:integration
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security:
  stage: security
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm audit --audit-level moderate
    - npm run security-scan

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
    - develop

deploy-dev:
  stage: deploy
  image: alpine:latest
  script:
    - echo "Deploy to development"
  environment:
    name: development
    url: https://dev-api.example.com
  only:
    - develop

deploy-prod:
  stage: deploy
  image: alpine:latest
  script:
    - echo "Deploy to production"
  environment:
    name: production
    url: https://api.example.com
  when: manual
  only:
    - main
```

## 🏗️ Infrastructure as Code

### Terraform

#### Main Configuration
```hcl
# provider.tf
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.owner
    }
  }
}

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "infra/${var.project_name}/${var.environment}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

#### VPC Module
```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-public-${count.index + 1}"
    Type = "Public"
  }
}

resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-private-${count.index + 1}"
    Type = "Private"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  count = length(var.private_subnet_cidrs)
  vpc   = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count = length(var.private_subnet_cidrs)
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private" {
  count = length(var.private_subnet_cidrs)
  
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
  }
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
```

#### ECS Module
```hcl
# modules/ecs/main.tf
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

resource "aws_ecs_task_definition" "main" {
  family                   = "${var.project_name}-${var.environment}"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = var.cpu
  memory                  = var.memory
  execution_role_arn      = var.execution_role_arn
  task_role_arn           = var.task_role_arn
  
  container_definitions = jsonencode([
    {
      name  = var.container_name
      image = var.container_image
      
      port_mappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        }
      ]
      
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        }
      ]
      
      log_configuration = {
        log_driver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.main.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.container_name
    container_port   = var.container_port
  }
  
  depends_on = [aws_lb_listener.main]
}
```

## 📊 Observabilidade

### Prometheus + Grafana

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'api-produtos'
    static_configs:
      - targets: ['api-produtos:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

#### Alert Rules
```yaml
# alert_rules.yml
groups:
  - name: api-produtos
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value }}%"
```

### Grafana Dashboards

#### API Dashboard
```json
{
  "dashboard": {
    "title": "API Produtos Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Best Practices

### Container Security

#### Docker Security
```dockerfile
# Use non-root user
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Minimal base image
FROM alpine:3.18
RUN apk add --no-cache dumb-init

# Security scanning
RUN trivy image --severity HIGH,CRITICAL myapp:latest
```

#### Kubernetes Security
```yaml
# Pod Security Context
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    fsGroup: 1001
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

### Infrastructure Security

#### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:UpdateService"
      ],
      "Resource": "arn:aws:ecs:us-east-1:123456789012:service/api-produtos-prod/api-produtos-service"
    }
  ]
}
```

#### Network Security
```yaml
# Security Group
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks"
  description = "Security group for ECS tasks"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## 📈 Performance Optimization

### Application Performance

#### Node.js Optimization
```javascript
// Cluster mode for production
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  require('./app.js');
  console.log(`Worker ${process.pid} started`);
}
```

#### Database Optimization
```sql
-- PostgreSQL optimization
CREATE INDEX CONCURRENTLY idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY idx_products_created_at ON products(created_at);

-- Partitioning for large tables
CREATE TABLE orders (
    id SERIAL,
    created_at TIMESTAMP,
    customer_id INTEGER,
    total DECIMAL(10,2)
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Infrastructure Performance

#### Auto-scaling
```yaml
# Auto Scaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU-based scaling
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

## 🚀 Disaster Recovery

### Backup Strategies

#### Database Backup
```bash
#!/bin/bash
# PostgreSQL backup script
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="api_produtos"

# Create backup
pg_dump -h localhost -U postgres -d $DB_NAME | gzip > $BACKUP_DIR/api_produtos_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/api_produtos_$DATE.sql.gz s3://backup-bucket/postgres/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

#### Cross-region Replication
```hcl
# S3 cross-region replication
resource "aws_s3_bucket" "primary" {
  bucket = "primary-backup-bucket"
  
  versioning {
    enabled = true
  }
  
  replication_configuration {
    role = aws_iam_role.replication.arn
    
    rules {
      id     = "backup-replication"
      status = "Enabled"
      
      destination {
        bucket        = aws_s3_bucket.secondary.arn
        storage_class = "STANDARD_IA"
      }
    }
  }
}
```

### Recovery Procedures

#### RTO/RPO Planning
```yaml
# Recovery Time Objective (RTO): 4 hours
# Recovery Point Objective (RPO): 1 hour

Recovery Procedures:
  1. Database Recovery:
     - Restore from latest backup
     - Apply transaction logs
     - Validate data integrity
     
  2. Application Recovery:
     - Deploy latest version
     - Configure environment variables
     - Run health checks
     
  3. Infrastructure Recovery:
     - Provision infrastructure with Terraform
     - Configure networking
     - Setup monitoring
```

---

## 🎯 Implementação Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Setup version control
- [ ] Configure CI/CD pipeline
- [ ] Implement basic monitoring
- [ ] Setup container registry

### Phase 2: Automation (Week 3-4)
- [ ] Implement IaC with Terraform
- [ ] Configure auto-scaling
- [ ] Setup security scanning
- [ ] Implement backup strategies

### Phase 3: Optimization (Week 5-6)
- [ ] Performance tuning
- [ ] Advanced monitoring
- [ ] Disaster recovery testing
- [ ] Compliance validation

### Phase 4: Production (Week 7-8)
- [ ] Production deployment
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation complete

Este guia serve como referência completa para implementação de práticas modernas de DevOps e infraestrutura.
