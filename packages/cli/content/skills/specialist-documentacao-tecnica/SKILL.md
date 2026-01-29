---
name: specialist-documentacao-tecnica
description: Documentação técnica, API docs e guias de usuário consistentes.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Documentação Técnica · Skill do Especialista

## Missão
Produzir documentação atualizada para desenvolvedores e usuários, transformando código, decisões arquiteturais e processos em documentação útil e mantida.

## Quando ativar
- Fase: Fala 14 · Documentação
- Workflows recomendados: /maestro, /deploy
- Use quando precisar ao finalizar funcionalidades ou preparar handoff.

## Inputs obrigatórios
- Artefatos técnicos atualizados
- Histórico de decisões (ADRs)
- Guidelines de comunicação
- Código fonte com comentários
- CONTEXTO.md do projeto

## Outputs gerados
- Documentação técnica consolidada
- API docs e user guides
- README.md completo
- ADRs documentadas
- Diagramas e exemplos

## Quality Gate
- README.md atualizado com getting started
- API docs sincronizadas com código
- ADRs para decisões importantes
- Guia de usuário publicado
- Documentação versionada no Git

## Tipos de Documentação Essenciais

### 1. README.md (Todo Projeto)
```markdown
# [Nome do Projeto]

## Descrição
[Uma linha explicando o projeto]

## Stack
- Frontend: [Tecnologia]
- Backend: [Tecnologia]
- Database: [Tecnologia]
- Infraestrutura: [Cloud/On-premise]

## Getting Started
```bash
# Instalação
npm install

# Configuração
cp .env.example .env

# Desenvolvimento
npm run dev

# Build
npm run build
```

## Estrutura de Pastas
```
src/
├── components/
├── services/
├── utils/
└── types/
```

## Scripts Disponíveis
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run lint` - Lint code

## Environment Variables
Ver `.env.example` para variáveis obrigatórias.

## Links Úteis
- [API Documentation](./docs/api.md)
- [Architecture](./docs/architecture.md)
- [Contributing Guide](./CONTRIBUTING.md)
```

### 2. API Documentation
**Formato:** OpenAPI 3.0 + exemplos interativos

```markdown
# API Documentation

## Autenticação
Todos os endpoints requerem token JWT no header `Authorization: Bearer <token>`.

## GET /api/users
Retorna lista paginada de usuários.

### Query Parameters
- `page` (number): Página (default: 1)
- `limit` (number): Items por página (default: 20)
- `search` (string): Filtro por nome

### Response 200
```json
{
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 150,
    "total_pages": 8
  }
}
```

### Exemplo
```bash
curl -H "Authorization: Bearer <token>" \
     https://api.exemplo.com/users?page=1&limit=10
```

## POST /api/users
Cria um novo usuário.

### Request Body
```json
{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "password": "senha123"
}
```

### Response 201
```json
{
  "data": {
    "id": 2,
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
```

### 3. ADRs (Architecture Decision Records)
```markdown
# ADR-001: Escolha de Stack Tecnológica

## Status
Accepted

## Contexto
Sistema de e-commerce B2B com necessidade de alta performance e escalabilidade.

## Decisão
Usar stack: Next.js + Node.js + PostgreSQL + Prisma

## Razões
- **Performance:** Next.js oferece SSR/SSG otimizados
- **Type Safety:** TypeScript em toda a stack
- **ORM:** Prisma com type-safe database client
- **Ecosystem:** Ecossistema maduro e bem suportado
- **Time-to-Market:** Familiaridade da equipe

## Consequências
✅ Performance otimizada desde início
✅ Desenvolvimento rápido com hot reload
✅ Deploy simplificado (Vercel, Netlify)
✅ SEO otimizado por padrão
❌ Curva de aprendizado para equipe iniciante

## Alternativas Consideradas
- **Nest.js:** Mais complexo, learning curve alto
- **Express.js:** Menos opininado, sem TypeScript por padrão
- **FastAPI:** Excelente mas equipe não conhece Python

## Data
2024-01-15
```

## Estratégia de Documentação (3 Tiers)

### Tier 1: Mínimo Viável (Todo Projeto)
- [ ] README.md com getting started
- [ ] `.env.example` com todas as variáveis
- [ ] OpenAPI spec (se tiver API)
- [ ] Scripts básicos (dev, build, test)

### Tier 2: Projetos Médios/Complexos
- [ ] Architecture docs (C4 diagrams)
- [ ] ADRs para decisões importantes
- [ ] Contributing guide
- [ ] Troubleshooting guide
- [ ] Changelog (CHANGELOG.md)

### Tier 3: Open Source / Produtos
- [ ] Comprehensive guides
- [ ] Tutorials interativos
- [ ] Video walkthroughs
- [ ] FAQ
- [ ] Roadmap público

## Ferramentas Recomendadas

### Auto-Geração
- **Swagger/OpenAPI:** Gera API docs automaticamente
- **JSDoc/TypeDoc:** Gera docs de código TypeScript
- **Mermaid/C4-PlantUML:** Diagramas arquiteturais
- **Storybook:** Documentação de componentes UI

### Edição
- **Markdown:** Formato universal, versionável
- **Git:** Histórico completo
- **VS Code:** Live preview com Markdown preview
- **Notion:** Colaboração em tempo real

### Publicação
- **GitHub Pages:** Hospedagem automática
- **Vercel/Netlify:** Deploy automático
- **ReadTheDocs:** Documentação profissional
- **GitBook:** Plataforma de livros técnicos

## Processo de Manutenção

### 1. Docs Próximas ao Código (Co-located)
- Coloque docs na mesma pasta do código
- Ex: `UserService.ts` + `UserService.md`
- Facilita manutenção sincronizada

### 2. Auto-Geração Sempre que Possível
- API specs via annotations
- Type docs via JSDoc
- Diagramas via código

### 3. Review em Pull Requests
- Mudou código? Atualizou doc?
- Novo endpoint? Adicionou exemplo?
- Breaking change? Destacado no changelog?

### 4. Versionamento como Código
- Versione docs junto com código
- Use semantic versioning
- Mantenha histórico completo

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** use Google Docs para documentação técnica
- **NUNCA** ignore atualizações de breaking changes
- **NUNCA** publique sem revisão técnica
- **NUNCA** documente features não implementadas

### SEMPRE Faça
- **SEMPRE** inclua exemplos práticos
- **SEMPRE** documente breaking changes
- **SEMPRE** mantenha README atualizado
- **SEMPRE** versione junto com código

### Inline Comments (Quando Usar)
- **NÃO documente o óbvio:**
```typescript
// Get user name
const name = user.name; // RUIM
```

- **Documente WHY, não WHAT:**
```typescript
// Hack: API retorna string "null" em vez de null
const value = response === "null" ? null : response; // BOM

// Evita memory leaks em listeners
useEffect(() => {
  const timer = setTimeout(pollApi, 5000);
  return () => clearTimeout(timer);
}, [dependencies]);
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Código fonte atualizado
2. ADRs existentes
3. Histórico de decisões
4. CONTEXTO.md com guidelines

### Prompt de Continuação
```
Atue como Technical Writer Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Código fonte:
[COLE CÓDIGO FONTE]

Preciso criar/atualizar documentação técnica para o projeto.
```

### Ao Concluir Esta Fase
1. **Crie/Atualize README.md** com getting started
2. **Gere/Atualize API docs** (OpenAPI)
3. **Documente ADRs** para decisões importantes
4. **Crie guias de usuário** e exemplos
5. **Versione tudo** no Git
6. **Configure CI/CD** para publicação automática

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Coverage:** 100% de APIs documentadas
- **Freshness:** Docs atualizados em cada release
- **Accuracy:** Exemplos funcionais
- **Accessibility:** Fácil de navegar
- **Search:** Conteúdo pesquisável

### Metas de Excelência
- User Satisfaction Score: ≥ 4.5/5
- Time to Answer: < 2 minutos
- Documentation Coverage: 100%
- Developer Feedback: ≥ 90% positivo

## Templates Prontos

### README.md (Completo)
```markdown
# [Nome do Projeto]

## Descrição
[Descrição detalhada do projeto em 1-2 parágrafos]

## Características
- **Performance:** [característica principal]
- **Segurança:** [característica de segurança]
- **Escalabilidade:** [como escala]
- **Acessibilidade:** WCAG 2.1 AA

## Stack Tecnológica
### Frontend
- **Framework:** [Framework]
- **Linguagem:** [Linguagem]
- **Estilização:** [CSS framework]
- **Estado:** [Gerenciamento de estado]

### Backend
- **Framework:** [Framework]
- **Linguagem:** [Linguagem]
- **Banco de Dados:** [Banco]
- **Cache:** [Sistema de cache]
- **Fila:** [Sistema de fila]

### Infraestrutura
- **Cloud:** [Provedor]
- **Deploy:** [Estratégia de deploy]
- **CDN:** [CDN utilizado]
- **Monitoramento:** [Sistema]

## Getting Started

### Pré-requisitos
- Node.js 18+
- [Outros pré-requisitos]

### Instalação
```bash
# Clone o repositório
git clone [repositório]

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie o desenvolvimento
npm run dev
```

## Estrutura do Projeto
```
src/
├── app/
│   ├── components/
│   │   ├── ui/
│   │   └── business/
│   ├── services/
│   ├── utils/
│   └── types/
├── docs/
│   ├── api/
│   ├── guides/
│   └── adr/
├── tests/
├── scripts/
└── tools/
```

## Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run test` - Executa testes
- `npm run lint` - Análise de código
- `npm run type-check` - Verificação de tipos
```

## OpenAPI (Exemplo)
```yaml
openapi: 3.0.0
info:
  title: API do Projeto
  version: 1.0.0
  description: API RESTful para [descrição]

servers:
  - url: http://localhost:3000/api/v1
    description: Desenvolvimento
  - url: https://api.projeto.com/api/v1
    description: Produção

paths:
  /users:
    get:
      summary: Lista usuários paginados
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: Lista de usuários
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                  type: array
                  items:
                    $ref: '#/components/schemas/User'
                meta:
                  type: object
                  properties:
                    page:
                      type: integer
                    total:
                      type: integer
                    total_pages:
                      type: integer
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: integer
          description: ID único do usuário
        name:
          type: string
          description: Nome completo
        email:
          type: string
          format: email
          description: Email válido
        created_at:
          type: string
          format: date-time
          description: Data de criação
```

### ADR Template
```markdown
# ADR-XXX: [Título Curto e Descritivo]

## Status
[Accepted | Rejected | Proposed]

## Contexto
[Contexto da decisão, problema ou necessidade]

## Decisão
[Decisão tomada]

## Razões
[Lista de razões para a decisão]

## Consequências
[Impacto positivo e negativo da decisão]

## Alternativas Consideradas
[Alternativas avaliadas e não escolhidas]

## Data
[Data da decisão]
```

## Skills complementares
- `documentation-templates`
- `plan-writing`
- `clean-code`
- `api-patterns`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Documentação Técnica.md`
- **Artefatos alvo:**
  - Documentação técnica consolidada
  - API docs e user guides
  - README.md completo
  - ADRs documentadas
  - Diagramas e exemplos