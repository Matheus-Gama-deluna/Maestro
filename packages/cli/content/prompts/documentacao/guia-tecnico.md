# Prompt: Guia Técnico

> **Quando usar:** Criar documentação técnica aprofundada  
> **Especialista:** Documentação Técnica  
> **Nível:** Médio  
> **Pré-requisitos:** Todos os artefatos técnicos do projeto completos

---

## Fluxo de Contexto
**Inputs:** Todos os artefatos técnicos (arquitetura, código, APIs, banco)  
**Outputs:** Guia técnico completo, documentação de API, runbooks  
**Especialista anterior:** Dados e Analytics com IA  
**Especialista seguinte:** Acessibilidade

---

## Prompt Completo

Atue como um **Technical Writer** especializado em criar documentação técnica clara, completa e acionável para equipes de desenvolvimento.

## Contexto do Projeto
[COLE CONTEÚDO DE docs/CONTEXTO.md]

[COLE CONTEÚDO DE docs/06-arquitetura/arquitetura.md]

[COLE CONTEÚDO DE docs/09-api/contrato-api.md]

[COLE CONTEÚDO DE docs/05-banco/design-banco.md]

## Sua Missão
Criar um **guia técnico completo** que sirva como referência principal para desenvolvedores, arquitetos, DevOps e equipes de suporte, documentando todos os aspectos técnicos do sistema.

### Estrutura Obrigatória do Guia

#### 1. Visão Geral e Arquitetura
- **Propósito do sistema:** [Objetivo principal]
- **Stack tecnológico:** [Tecnologias utilizadas]
- **Arquitetura de alto nível:** [Diagramas e explicação]
- **Princípios de design:** [Diretrizes arquiteturais]
- **Decisões técnicas (ADRs):** [Justificativas importantes]

#### 2. Ambiente de Desenvolvimento
- **Setup local:** [Passos para configurar ambiente]
- **Pré-requisitos:** [Ferramentas e dependências]
- **Configuração:** [Variáveis de ambiente, arquivos]
- **Build e run:** [Comandos e processos]
- **Debugging:** [Ferramentas e técnicas]

#### 3. Estrutura do Código
- **Organização de pastas:** [Estrutura e convenções]
- **Padrões de codificação:** [Style guide, convenções]
- **Componentes principais:** [Descrição e responsabilidades]
- **Módulos e pacotes:** [Dependências e interfaces]
- **Naming conventions:** [Regras de nomenclatura]

#### 4. APIs e Integrações
- **API documentation:** [Endpoints, métodos, exemplos]
- **Autenticação:** [Como autenticar]
- **Rate limiting:** [Limites e throttling]
- **Error handling:** [Códigos e respostas]
- **Third-party integrations:** [Sistemas externos]

#### 5. Database e Dados
- **Schema design:** [Tabelas, relacionamentos]
- **Migrations:** [Como gerenciar mudanças]
- **Performance:** [Índices, otimizações]
- **Backup e recovery:** [Procedimentos]
- **Data access patterns:** [Padrões de acesso]

#### 6. Deploy e Infraestrutura
- **Ambientes:** [Dev, staging, produção]
- **CI/CD pipeline:** [Build, test, deploy]
- **Containerização:** [Docker, Kubernetes]
- **Monitoring:** [Logs, métricas, alertas]
- **Security:** [Hardening, best practices]

#### 7. Testes e Qualidade
- **Estratégia de testes:** [Unit, integration, E2E]
- **Framework de testes:** [Ferramentas e convenções]
- **Coverage requirements:** [Métricas e metas]
- **Test data management:** [Dados de teste]
- **Performance testing:** [Load, stress]

#### 8. Operações e Manutenção
- **Runbooks:** [Procedimentos operacionais]
- **Troubleshooting:** [Problemas comuns e soluções]
- **Monitoring:** [O que monitorar e como]
- **Incident response:** [Processos e responsabilidades]
- **Capacity planning:** [Escalabilidade e recursos]

#### 9. Segurança
- **Security model:** [Autenticação, autorização]
- **Vulnerability management:** [Scanning e patching]
- **Data protection:** [Criptografia, PII]
- **Compliance:** [Regulamentações aplicáveis]
- **Security best practices:** [Diretrizes]

#### 10. Referências e Recursos
- **Links úteis:** [Documentação externa]
- **Ferramentas:** [Software e utilitários]
- **Contatos:** [Equipes e responsáveis]
- **Glossário:** [Termos técnicos]
- **FAQ:** [Perguntas frequentes]

### Seções Detalhadas

#### 1. Arquitetura do Sistema
```markdown
## Arquitetura

### Visão Geral
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Cache         │◄─────────────┘
                        │   (Redis)       │
                        └─────────────────┘
```

### Stack Tecnológico
| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| Frontend | Next.js | 14.x | Framework React |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 3.x | Styling |
| Backend | Node.js | 20.x | Runtime |
| | Express | 4.x | Web framework |
| | Prisma | 5.x | ORM |
| Database | PostgreSQL | 15.x | Primary DB |
| | Redis | 7.x | Cache/Session |
| Infrastructure | Docker | 24.x | Containers |
| | AWS | - | Cloud provider |

### Decisões Arquiteturais

#### ADR-001: Escolha do Stack
**Status:** Aceito  
**Data:** 2024-01-15  
**Contexto:** Precisávamos escolher stack moderno e escalável  
**Decisão:** Next.js + Node.js + PostgreSQL  
**Consequências:** Performance boa, ecossistema maduro

#### ADR-002: Arquitetura de Microserviços
**Status:** Em discussão  
**Data:** 2024-01-20  
**Contexto:** Sistema crescendo em complexidade  
**Decisão:** Monólito com módulos bem definidos  
**Consequências:** Simplicidade inicial, fácil evolução
```

#### 2. Setup de Desenvolvimento
```markdown
## Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 20.x ou superior
- Docker e Docker Compose
- PostgreSQL 15.x
- Redis 7.x
- Git

### Setup Local
```bash
# 1. Clone o repositório
git clone https://github.com/empresa/projeto.git
cd projeto

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 4. Inicie serviços com Docker
docker-compose up -d postgres redis

# 5. Rode migrations
npm run db:migrate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

### Estrutura de Pastas
```
src/
├── app/              # App Router (Next.js)
├── components/       # Componentes React
├── lib/             # Utilitários
├── hooks/           # Hooks personalizados
├── types/           # Tipos TypeScript
├── styles/          # Estilos globais
└── middleware/      # Middleware Next.js

api/
├── controllers/     # Controllers Express
├── services/        # Lógica de negócio
├── repositories/    # Acesso a dados
├── middleware/      # Middleware Express
├── utils/          # Utilitários backend
└── types/          # Tipos backend
```

### Configuração
```bash
# .env.example
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
API_BASE_URL="http://localhost:3000/api"
```
```

#### 3. API Documentation
```markdown
## API Documentation

### Autenticação
A API usa JWT tokens para autenticação:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use o token retornado
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

### Endpoints Principais

#### Users
```http
GET    /api/users           # Listar usuários
POST   /api/users           # Criar usuário
GET    /api/users/:id       # Obter usuário
PUT    /api/users/:id       # Atualizar usuário
DELETE /api/users/:id       # Deletar usuário
```

#### Posts
```http
GET    /api/posts           # Listar posts
POST   /api/posts           # Criar post
GET    /api/posts/:id       # Obter post
PUT    /api/posts/:id       # Atualizar post
DELETE /api/posts/:id       # Deletar post
```

### Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```
```

#### 4. Database Schema
```markdown
## Database

### Schema Principal
```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices de Performance
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published) WHERE published = TRUE;
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
```

### Migrations
```bash
# Criar nova migration
npm run db:migration:create add_new_table

# Rode migrations
npm run db:migrate

# Revert migration
npm run db:migrate:rollback
```
```

#### 5. Deploy e CI/CD
```markdown
## Deploy

### Pipeline CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t myapp .
      - run: docker push ${{ secrets.REGISTRY }}/myapp:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: kubectl set image deployment/myapp myapp=${{ secrets.REGISTRY }}/myapp:${{ github.sha }}
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=info
```
```

#### 6. Monitoring e Troubleshooting
```markdown
## Monitoring

### Logs
```bash
# Ver logs da aplicação
docker logs -f myapp

# Logs com filtro
docker logs myapp | grep ERROR

# Logs do último hora
docker logs --since=1h myapp
```

### Métricas
- **Response Time:** Tempo médio de resposta
- **Error Rate:** Taxa de erros 5xx
- **Throughput:** Requisições por segundo
- **Memory Usage:** Uso de memória
- **CPU Usage:** Uso de CPU

### Health Checks
```bash
# Health check da aplicação
curl http://localhost:3000/health

# Health check do database
curl http://localhost:3000/health/db

# Health check do Redis
curl http://localhost:3000/health/redis
```

### Troubleshooting Comum

#### Database Connection Failed
**Sintomas:** 500 errors, connection timeout  
**Causas:** Wrong credentials, network issues  
**Solução:** 
1. Verifique DATABASE_URL no .env
2. Teste conexão: `psql $DATABASE_URL`
3. Verifique se PostgreSQL está rodando

#### Memory Leaks
**Sintomas:** OOM errors, slow performance  
**Causas:** Unreleased connections, large objects  
**Solução:**
1. Monitore uso de memória: `docker stats`
2. Profile com Node.js inspector
3. Verifique event listeners e timers

#### High Response Time
**Sintomas:** Slow API responses  
**Causas:** Database queries, external APIs  
**Solução:**
1. Analise queries lentas: `EXPLAIN ANALYZE`
2. Adicione índices apropriados
3. Implemente cache
```

### Exemplos Práticos

#### 1. Código de Exemplo
```typescript
// Exemplo de controller
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json({ data: users });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({ data: user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

#### 2. Configuração de Teste
```typescript
// Exemplo de teste
import { UserService } from '../services/UserService';
import { MockUserRepository } from '../mocks/UserRepository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService(mockRepository);
  });

  it('should create a user', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const user = await userService.createUser(userData);
    
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(mockRepository.save).toHaveBeenCalledWith(userData);
  });
});
```

#### 3. Script de Deploy
```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Build Docker image
docker build -t myapp:$1 .

# Tag for production
docker tag myapp:$1 registry.example.com/myapp:$1

# Push to registry
docker push registry.example.com/myapp:$1

# Update Kubernetes deployment
kubectl set image deployment/myapp myapp=registry.example.com/myapp:$1

# Wait for rollout
kubectl rollout status deployment/myapp

echo "Deployment completed successfully!"
```

## Resposta Esperada

### Estrutura da Resposta
1. **Guia técnico completo** seguindo estrutura acima
2. **Exemplos práticos** de código e configuração
3. **Diagrams e visualizações** para arquitetura
4. **Runbooks operacionais** para problemas comuns
5. **Referências cruzadas** com outros documentos
6. **Checklists** para validação

### Formato
- **Markdown** com estrutura clara e navegável
- **Code blocks** para exemplos funcionais
- **Mermaid diagrams** para visualizações
- **Tabelas** para referências rápidas
- **Checklists** para processos

## Checklist Pós-Geração

### Validação do Conteúdo
- [ ] **Arquitetura** bem documentada e justificada
- [ ] **Setup instructions** claras e funcionais
- [ ] **API documentation** completa e precisa
- [ ] **Database schema** atualizado e documentado
- [ ] **Deploy procedures** testadas e validadas

### Qualidade Técnica
- [ ] **Exemplos de código** funcionais e atualizados
- [ ] **Comandos e scripts** testados
- [ ] **Configurações** corretas e seguras
- [ ] **Best practices** seguidas
- [ ] **Referências** úteis e atualizadas

### Usabilidade
- [ ] **Navegação clara** com índice e links
- [ ] **Busca fácil** de informações
- [ ] **Linguagem acessível** para diferentes níveis
- [ ] **Exemplos práticos** para cenários reais
- [ ] **Atualizações regulares** planejadas

### Implementação
- [ ] **Salvar** em `docs/14-documentacao/guia-tecnico.md`
- [ ] **Criar** versão online se necessário
- [ ] **Configurar** atualizações automáticas
- [ ] **Treinar** equipe sobre uso do guia
- [ ] **Estabelecer** processo de manutenção

---

## Notas Adicionais

### Best Practices
- **Living document:** Mantenha sempre atualizado
- **User feedback:** Colete feedback dos usuários
- **Version control:** Versione a documentação
- **Multiple formats:** Ofereça diferentes formatos (web, PDF)
- **Search optimization:** Facilite busca de conteúdo

### Armadilhas Comuns
- **Documentation drift:** Documentação desatualizada
- **Too technical:** Linguagem muito complexa
- **Incomplete examples:** Exemplos que não funcionam
- **Poor organization:** Difícil de encontrar informações
- **Lack of maintenance:** Sem dono definido

### Ferramentas Recomendadas
- **Documentation:** GitBook, Confluence, Docusaurus
- **Diagrams:** Mermaid, PlantUML, Draw.io
- **API Docs:** Swagger/OpenAPI, Postman
- **Version Control:** Git com branches para docs
- **Collaboration:** GitHub Pages, Netlify
