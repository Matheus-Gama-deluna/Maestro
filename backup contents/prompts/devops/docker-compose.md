# Prompt: Configuração Docker Compose

> **Quando usar**: Ao containerizar aplicação para desenvolvimento ou produção simples
> **Especialista**: [DevOps e Infraestrutura](../../02-especialistas/Especialista%20em%20DevOps%20e%20Infraestrutura.md)
> **Nível**: Simples a Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Stack e componentes

Após gerar, salve o resultado em:
- `docker-compose.yml` (raiz do projeto)
- `docker-compose.dev.yml` (override de desenvolvimento)
- `docker-compose.prod.yml` (override de produção)

---

## Prompt Completo

```text
Atue como especialista em Docker e containerização.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Stack Tecnológica

- Backend: [Framework/Linguagem]
- Frontend: [Framework]
- Banco de dados: [PostgreSQL/MySQL/MongoDB]
- Cache: [Redis/Memcached/Nenhum]
- Message broker: [RabbitMQ/Kafka/Nenhum]
- Outros serviços: [ElasticSearch, MinIO, etc]

## Ambientes Necessários

- [ ] Desenvolvimento local
- [ ] Staging
- [ ] Produção

## Requisitos Específicos

- Hot reload em desenvolvimento: [Sim/Não]
- Volumes persistentes: [quais dados]
- Variáveis de ambiente: [como gerenciar]
- Múltiplos serviços: [monolito/microsserviços]

---

## Sua Missão

Gere configuração Docker Compose completa:

### 1. Dockerfiles

#### Backend
```dockerfile
# Dockerfile para [linguagem]
# Multi-stage build para produção
# Stage 1: Build
FROM [base-image] AS builder
# ...

# Stage 2: Production
FROM [slim-image] AS production
# ...

# Stage 3: Development (opcional)
FROM builder AS development
# Hot reload setup
```

Inclua:
- [ ] Multi-stage build
- [ ] Non-root user
- [ ] Healthcheck
- [ ] Otimização de layers
- [ ] .dockerignore

#### Frontend (se aplicável)
```dockerfile
# Build estático ou SSR
```

### 2. Docker Compose Base

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  default:
    name: [project]-network
```

### 3. Override de Desenvolvimento

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules  # Evita sobrescrever node_modules
    environment:
      - NODE_ENV=development
      - DEBUG=*
    ports:
      - "9229:9229"  # Debug port
    command: npm run dev

  # Serviços extras de desenvolvimento
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
```

### 4. Override de Produção

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # Nginx como reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend
```

### 5. Arquivo .env Template

```env
# .env.example
# Copie para .env e preencha

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=myapp
DB_USER=myuser
DB_PASSWORD=changeme

# Application
APP_PORT=3000
APP_SECRET=generate-a-secure-secret
NODE_ENV=development

# Redis (se aplicável)
REDIS_URL=redis://redis:6379

# External services
SMTP_HOST=mailhog
SMTP_PORT=1025
```

### 6. Scripts de Conveniência

```makefile
# Makefile
.PHONY: dev prod build logs

dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

shell:
	docker-compose exec backend sh

db-shell:
	docker-compose exec db psql -U $${DB_USER} -d $${DB_NAME}

clean:
	docker-compose down -v --remove-orphans
```

### 7. .dockerignore

```
# .dockerignore
node_modules
npm-debug.log
.git
.env
.env.*
*.md
.vscode
.idea
coverage
dist
.next
```

### 8. Comandos Úteis

```bash
# Desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f [service]

# Rebuild específico
docker-compose build --no-cache [service]

# Shell no container
docker-compose exec [service] sh

# Limpar tudo
docker-compose down -v --remove-orphans
```
```

---

## Exemplo de Uso

```text
Atue como especialista em Docker e containerização.

## Contexto

API de e-commerce com NestJS.

## Stack

- Backend: NestJS (Node 20)
- Banco: PostgreSQL 15
- Cache: Redis 7
- Queue: Bull (Redis-based)

## Ambientes

- [x] Desenvolvimento local
- [x] Produção

## Requisitos

- Hot reload com npm run start:dev
- Prisma como ORM
- Migrations automáticas em dev
```

---

## Checklist Pós-Geração

- [ ] Dockerfile com multi-stage build
- [ ] docker-compose.yml base criado
- [ ] docker-compose.dev.yml com hot reload
- [ ] docker-compose.prod.yml com limites de recursos
- [ ] .env.example documentado
- [ ] .dockerignore configurado
- [ ] Healthchecks configurados
- [ ] Volumes para persistência
- [ ] Non-root user no container
- [ ] Makefile ou scripts de conveniência
