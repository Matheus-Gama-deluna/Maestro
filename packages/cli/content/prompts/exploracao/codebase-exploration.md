# Prompt: Exploração de Codebase

> **Quando usar:** Analisar e compreender codebase existente  
> **Especialista:** Exploração de Codebase  
> **Nível:** Médio  
> **Pré-requisitos:** Acesso ao código fonte, documentação disponível

---

## Fluxo de Contexto
**Inputs:** Codebase existente, documentação disponível, stakeholders  
**Outputs:** Análise completa, documentação atualizada, recomendações  
**Especialista anterior:** Qualquer especialista que precisa entender o sistema  
**Especialista seguinte:** Especialista relevante para implementação

---

## Prompt Completo

Atue como um **Code Analyst** especializado em analisar, compreender e documentar codebases complexas, identificando padrões, problemas e oportunidades de melhoria.

## Contexto do Projeto
[COLE INFORMAÇÕES SOBRE A CODEBASE]

[COLE DOCUMENTAÇÃO DISPONÍVEL]

[COLE OBJETIVOS DA ANÁLISE]

## Sua Missão
Realizar uma **exploração completa da codebase** para mapear arquitetura, identificar padrões, documentar componentes e fornecer recomendações para melhoria e manutenção.

### Metodologia de Exploração

#### 1. Reconhecimento Inicial
- **Project Overview:** [Tamanho, idade, linguagens, frameworks]
- **Team Context:** [Equipe atual, histórico de desenvolvimento]
- **Business Context:** [Propósito do sistema, stakeholders]
- **Technical Debt:** [Dívida técnica conhecida]

#### 2. Análise Estrutural
- **Directory Structure:** [Organização de arquivos e pastas]
- **Architecture Patterns:** [Padrões arquiteturais identificados]
- **Dependencies:** [Dependências externas e internas]
- **Entry Points:** [Pontos de entrada da aplicação]

#### 3. Análise de Código
- **Code Quality:** [Qualidade do código, padrões]
- **Design Patterns:** [Padrões de design utilizados]
- **Anti-patterns:** [Anti-padrões identificados]
- **Complexity Metrics:** [Métricas de complexidade]

#### 4. Análise de Dados
- **Database Schema:** [Estrutura do banco]
- **Data Flow:** [Fluxo de dados no sistema]
- **API Contracts:** [Contratos de API]
- **Integration Points:** [Pontos de integração]

#### 5. Análise Operacional
- **Deployment:** [Processo de deploy]
- **Monitoring:** [Monitoramento e logs]
- **Testing:** **Estratégia e cobertura de testes**
- **Performance:** **Características de performance**

#### 6. Recomendações
- **Immediate Actions:** [Ações imediatas necessárias]
- **Medium-term Improvements:** [Melhorias a médio prazo]
- **Long-term Strategy:** [Estratégia a longo prazo]
- **Risk Assessment:** [Avaliação de riscos]

### Template de Análise

#### 1. Visão Geral do Projeto
```markdown
## Codebase Analysis Report

### Project Information
- **Name:** [Nome do projeto]
- **Repository:** [URL do repositório]
- **Languages:** [Linguagens utilizadas]
- **Frameworks:** [Frameworks principais]
- **Age:** [Idade do projeto]
- **Size:** [Linhas de código, número de arquivos]
- **Team:** [Tamanho da equipe, principais contribuidores]

### Business Context
- **Purpose:** [Propósito do sistema]
- **Users:** [Tipos de usuários]
- **Scale:** [Escala de uso]
- **Criticality:** [Nível de criticidade]
- **Dependencies:** [Dependências de negócio]
```

#### 2. Arquitetura e Estrutura
```markdown
### Architecture Analysis

#### Directory Structure
```
project-root/
├── src/
│   ├── components/        # UI components
│   ├── services/         # Business logic
│   ├── utils/           # Helper functions
│   └── types/           # Type definitions
├── tests/               # Test files
├── docs/                # Documentation
├── config/              # Configuration files
└── scripts/             # Build/deploy scripts
```

#### Architecture Patterns
- **Pattern:** [Padrão identificado]
- **Description:** [Descrição do padrão]
- **Implementation:** [Como está implementado]
- **Assessment:** [Avaliação do padrão]

#### Component Analysis
| Component | Purpose | Dependencies | Complexity | Assessment |
|------------|---------|--------------|-------------|------------|
| [Component] | [Propósito] | [Dependências] | [Complexidade] | [Avaliação] |
```

#### 3. Análise de Código
```markdown
### Code Quality Analysis

#### Language Distribution
| Language | Files | Lines | % Total |
|----------|-------|-------|---------|
| TypeScript | 150 | 45,000 | 60% |
| JavaScript | 50 | 15,000 | 20% |
| CSS | 30 | 9,000 | 12% |
| SQL | 10 | 3,000 | 6% |
| Other | 5 | 1,500 | 2% |

#### Code Metrics
- **Cyclomatic Complexity:** [Média/Max]
- **Maintainability Index:** [Score]
- **Code Duplication:** [Percentual]
- **Test Coverage:** [Percentual]
- **Technical Debt:** [Horas estimadas]

#### Design Patterns Identified
- **Pattern:** [Nome do padrão]
- **Location:** [Onde é usado]
- **Implementation:** [Como está implementado]
- **Assessment:** [Bom/Ruim/Precisa melhorar]

#### Anti-patterns Found
- **Anti-pattern:** [Nome do anti-padrão]
- **Location:** [Arquivo/linha]
- **Impact:** [Impacto no sistema]
- **Recommendation:** [Como corrigir]
```

#### 4. Análise de Dados
```markdown
### Data Analysis

#### Database Schema
```sql
-- Tables Overview
users (id, email, name, created_at)
posts (id, user_id, title, content, created_at)
comments (id, post_id, user_id, content, created_at)

-- Relationships
users 1:N posts
posts 1:N comments
```

#### Data Flow Diagram
```
User Input → API → Business Logic → Database → Response
     ↓              ↓              ↓           ↓
  Validation   Processing   Storage   Formatting
```

#### API Contracts
```typescript
// Main API endpoints
GET    /api/users           // List users
POST   /api/users           // Create user
GET    /api/users/:id       // Get user
PUT    /api/users/:id       // Update user
DELETE /api/users/:id       // Delete user
```

#### Integration Points
- **External APIs:** [Lista de APIs externas]
- **Webhooks:** [Webhooks recebidos/enviados]
- **Message Queues:** [Filas de mensagem]
- **File Storage:** [Armazenamento de arquivos]
```

#### 5. Análise de Testes
```markdown
### Testing Analysis

#### Test Coverage
| Type | Coverage | Target | Gap |
|------|----------|--------|-----|
| Unit Tests | 65% | 80% | -15% |
| Integration | 45% | 70% | -25% |
| E2E Tests | 30% | 50% | -20% |

#### Test Structure
```
tests/
├── unit/              # Unit tests
│   ├── services/     # Service layer tests
│   ├── utils/        # Utility function tests
│   └── components/   # Component tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data
```

#### Testing Frameworks
- **Unit:** Jest, Mocha
- **Integration:** Supertest
- **E2E:** Cypress, Playwright
- **Mocking:** Sinon, Jest mocks

#### Test Quality Issues
- **Missing Tests:** [Funcionalidades sem testes]
- **Flaky Tests:** [Testes instáveis]
- **Slow Tests:** [Testes lentos]
- **Coverage Gaps:** [Áreas sem cobertura]
```

#### 6. Análise de Performance
```markdown
### Performance Analysis

#### Response Times
| Endpoint | Avg (ms) | P95 (ms) | P99 (ms) | Target |
|----------|----------|----------|----------|--------|
| GET /users | 120 | 250 | 450 | <200 |
| POST /users | 200 | 400 | 800 | <300 |
| GET /posts | 80 | 150 | 300 | <150 |

#### Database Performance
- **Slow Queries:** [Número de queries lentas]
- **Index Usage:** [Uso de índices]
- **Connection Pool:** [Pool de conexões]
- **Cache Hit Rate:** [Taxa de cache hits]

#### Resource Usage
- **CPU Usage:** [Uso médio de CPU]
- **Memory Usage:** [Uso médio de memória]
- **Disk I/O:** [Operações de I/O]
- **Network:** [Tráfego de rede]

#### Performance Bottlenecks
- **Bottleneck 1:** [Descrição e localização]
- **Bottleneck 2:** [Descrição e localização]
- **Bottleneck 3:** [Descrição e localização]
```

#### 7. Análise de Segurança
```markdown
### Security Analysis

#### Authentication & Authorization
- **Auth Method:** [Método de autenticação]
- **Token Management:** [Gerenciamento de tokens]
- **Role-based Access:** [Controle de acesso]
- **Session Management:** [Gerenciamento de sessão]

#### Data Protection
- **Encryption:** [Criptografia de dados]
- **PII Handling:** [Manuseio de dados pessoais]
- **Input Validation:** [Validação de entrada]
- **SQL Injection Protection:** [Proteção contra SQLi]

#### Security Headers
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

#### Vulnerabilities Found
- **Critical:** [Vulnerabilidades críticas]
- **High:** [Vulnerabilidades altas]
- **Medium:** [Vulnerabilidades médias]
- **Low:** [Vulnerabilidades baixas]
```

#### 8. Análise de Deploy e Ops
```markdown
### DevOps Analysis

#### Deployment Process
- **CI/CD Pipeline:** [Descrição do pipeline]
- **Environments:** [Dev, staging, production]
- **Build Process:** [Processo de build]
- **Release Strategy:** [Estratégia de release]

#### Infrastructure
- **Cloud Provider:** [AWS/Azure/GCP]
- **Containerization:** [Docker/Kubernetes]
- **Load Balancing:** [Balanceamento de carga]
- **Auto-scaling:** [Escalamento automático]

#### Monitoring & Logging
- **Application Logs:** [Logs da aplicação]
- **Error Tracking:** [Rastreamento de erros]
- **Performance Metrics:** [Métricas de performance]
- **Alerting:** [Sistema de alertas]

#### Backup & Recovery
- **Backup Strategy:** [Estratégia de backup]
- **Recovery Time:** [Tempo de recuperação]
- **Data Retention:** [Retenção de dados]
- **Disaster Recovery:** [Plano de recuperação]
```

#### 9. Recomendações
```markdown
### Recommendations

#### Immediate Actions (Next 1-2 weeks)
1. **[Action 1]:** [Descrição e justificativa]
2. **[Action 2]:** [Descrição e justificativa]
3. **[Action 3]:** [Descrição e justificativa]

#### Medium-term Improvements (1-3 months)
1. **[Improvement 1]:** [Descrição e benefícios]
2. **[Improvement 2]:** [Descrição e benefícios]
3. **[Improvement 3]:** [Descrição e benefícios]

#### Long-term Strategy (3-12 months)
1. **[Strategy 1]:** [Descrição e impacto]
2. **[Strategy 2]:** [Descrição e impacto]
3. **[Strategy 3]:** [Descrição e impacto]

#### Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [Mitigação] |
| [Risk 2] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [Mitigação] |
```

### Exemplos Práticos

#### Exemplo 1: Análise de Componente
```markdown
### Component Analysis: UserService

#### Location
- **File:** `src/services/UserService.ts`
- **Lines:** 150-300
- **Dependencies:** UserRepository, EmailService, CacheService

#### Responsibility
- User CRUD operations
- Authentication logic
- Profile management
- Password reset

#### Code Quality
- **Complexity:** Média (cyclomatic complexity: 8)
- **Test Coverage:** 80%
- **Documentation:** Bem documentada
- **Issues:** Método muito longo (50 linhas)

#### Recommendations
- Refactor large methods into smaller functions
- Add more unit tests for edge cases
- Implement caching for frequently accessed data
```

#### Exemplo 2: Análise de Performance
```markdown
### Performance Issue: Slow User List

#### Problem
- GET /api/users taking 2-3 seconds
- Affects 1000+ concurrent users
- Impact on user experience

#### Root Cause Analysis
```sql
-- Slow query identified
EXPLAIN ANALYZE
SELECT u.*, p.avatar_url 
FROM users u 
LEFT JOIN profiles p ON u.id = p.user_id 
ORDER BY u.created_at DESC 
LIMIT 20;

-- Issues:
- Full table scan on users
- Missing index on created_at
- Unnecessary JOIN for avatar_url
```

#### Solution
```sql
-- Add index
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Optimize query
SELECT u.id, u.name, u.email, p.avatar_url
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 20;
```

#### Results
- Query time: 2.5s → 50ms
- CPU usage: 80% → 20%
- User satisfaction: Improved
```

## Resposta Esperada

### Estrutura da Resposta
1. **Análise completa** seguindo template acima
2. **Diagramas e visualizações** para arquitetura
3. **Métricas e KPIs** para qualidade e performance
4. **Recomendações acionáveis** com prioridades
5. **Plano de implementação** detalhado
6. **Documentação atualizada** para equipe

### Formato
- **Markdown** com estrutura clara
- **Mermaid diagrams** para visualizações
- **Code blocks** para exemplos
- **Tables** para métricas e comparações
- **Checklists** para validação

## Checklist Pós-Geração

### Validação da Análise
- [ ] **Codebase mapeada** completamente
- [ ] **Arquitetura compreendida** e documentada
- [ ] **Problemas identificados** com precisão
- [ ] **Recomendações** são realistas e acionáveis
- [ ] **Riscos avaliados** adequadamente

### Qualidade da Documentação
- [ ] **Estrutura clara** e fácil navegação
- [ ] **Exemplos práticos** relevantes
- [ ] **Métricas atualizadas** e precisas
- [ ] **Visualizações** eficazes
- [ ] **Referências cruzadas** funcionando

### Implementação
- [ ] **Criar** documentação em `docs/`
- [ ] **Atualizar** CONTEXTO.md com findings
- [ ] **Compartilhar** com equipe
- [ ] **Planejar** implementação de recomendações
- [ ] **Estabelecer** processo de atualização

---

## Notas Adicionais

### Best Practices
- **Systematic approach:** Siga metodologia consistente
- **Tool-assisted:** Use ferramentas automatizadas quando possível
- **Collaborative review:** Envolva equipe na validação
- **Living document:** Mantenha documentação atualizada
- **Action-oriented:** Foque em recomendações acionáveis

### Armadilhas Comuns
- **Analysis paralysis:** Analise demais sem agir
- **Assumptions:** Não presuma sem verificar
- **Incomplete picture:** Não analise apenas partes do sistema
- **Ignoring business context:** Foque apenas em aspectos técnicos
- **Poor documentation:** Documente de forma confusa

### Ferramentas Recomendadas
- **Code Analysis:** SonarQube, CodeClimate, ESLint
- **Architecture:** PlantUML, Mermaid, Draw.io
- **Performance:** New Relic, DataDog, Grafana
- **Security:** OWASP ZAP, Snyk, Veracode
- **Documentation:** GitBook, Confluence, Docusaurus
