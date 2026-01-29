---
name: specialist-banco-dados
description: Schema design, índices e migrações seguras para o projeto com foco em performance e escalabilidade. Use quando precisar transformar modelo de domínio em esquema de banco de dados otimizado.
allowed-tools: Read, Write, Edit, Glob, Grep
version: 2.0
framework: progressive-disclosure
---

# Banco de Dados · Skill Moderna

## Missão
Transformar modelo de domínio em esquema de banco de dados otimizado com índices, constraints e estratégia de migração em 45-60 minutos, garantindo performance, segurança e escalabilidade.

## Quando ativar
- **Fase:** Fase 5 · Banco de Dados
- **Workflows:** /maestro, /avancar-fase, /design-banco
- **Trigger:** "preciso de banco de dados", "schema design", "índices"

## Inputs obrigatórios
- Modelo de domínio validado do especialista de Modelagem de Domínio
- Entidades e relacionamentos mapeados
- Requisitos não funcionais de performance e escala
- Arquitetura C4 inicial
- Stack tecnológica definida

## Outputs gerados
- `docs/05-banco/design-banco.md` — Schema físico completo
- `docs/05-banco/indices.md` — Índices otimizados
- `docs/05-banco/migracoes.md` — Estratégia de migrações
- `docs/05-banco/constraints.md` — Constraints de integridade
- Score de validação ≥ 75 pontos

## Quality Gate
- Banco de dados escolhido com justificativa técnica
- Schema físico documentado (tabelas, tipos, constraints)
- Índices planejados para queries principais
- Estratégia de migrações definida
- Constraints de integridade implementadas
- Segurança básica planejada
- Performance otimizada para workload específico
- Score de validação automática ≥ 75 pontos

## 🚀 Processo Otimizado

### 1. Análise do Domínio (10 min)
Use função de análise para extrair informações do modelo:
- Entidades principais e seus atributos
- Relacionamentos e cardinalidades
- Requisitos de performance
- Volume de dados estimado
- Padrões de acesso

### 2. Escolha do Banco (10 min)
Decida baseado em critérios técnicos:
- **Volume:** MBs, GBs ou TBs
- **Acesso:** Leitura pesada, escrita massiva, analytics
- **Infraestrutura:** VPS, Serverless, Cloud
- **Budget:** Free tier, limitado, ilimitado
- **Equipe:** Expertise disponível

### 3. Design do Schema (15 min)
Crie schema físico otimizado:
- **Tabelas:** Mapeadas de entidades do domínio
- **Tipos:** Escolhidos para performance
- **Constraints:** PKs, FKs, únicos, checks
- **Normalização:** Evitar redundância de dados
- **Audição:** Timestamps, soft deletes

### 4. Índices Estratégicos (10 min)
Defina índices baseado em:
- **Queries principais:** WHERE, JOIN, ORDER BY
- **Cardinalidade:** 1:1, 1:N, N:N
- **Performance:** Análise de plano de execução
- **Covering:** Índices compostos quando necessário

### 5. Migrações e Versionamento (10 min)
Planeje estratégia de evolução:
- **Zero-downtime:** Migrations sem parada
- **Backward compatibility:** Suporte a versões antigas
- **Rollback:** Capacidade de reverter mudanças
- **Testing:** Validação em ambiente staging

### 6. Validação de Qualidade (5 min)
Aplique validação automática de performance e segurança.

## 📚 Recursos Adicionais

### Templates e Guias
- **Template Design:** [resources/templates/design-banco.md](resources/templates/design-banco.md)
- **Template Índices:** [resources/templates/indices.md](resources/templates/indices.md)
- **Template Migrações:** [resources/templates/migracoes.md](resources/templates/migracoes.md)
- **Template Constraints:** [resources/templates/constraints.md](resources/templates/constraints.md)
- **Exemplos práticos:** [resources/examples/database-examples.md](resources/examples/database-examples.md)
- **Guia completo:** [resources/reference/database-guide.md](resources/reference/database-guide.md)
- **Validação:** [resources/checklists/database-validation.md](resources/checklists/database-validation.md)

### Funções MCP
- **Inicialização:** Função de criação de estrutura base
- **Validação:** Função de verificação de qualidade
- **Processamento:** Função de preparação para próxima fase

## 🎯 Frameworks de Banco de Dados

### SQL Relacional
- **PostgreSQL:** ACID, extensões ricas, pgvector
- **MySQL:** Performance, ecossistema maduro
- **SQLite:** Embedded, zero-config, edge computing

### NoSQL Moderno
- **MongoDB:** Documentos flexíveis, agregação
- **Redis:** Cache, pub/sub, rate limiting
- **Cassandra:** Alta disponibilidade, linear scalability

### Serverless/Edge
- **Neon:** PostgreSQL serverless, branching
- **Turso:** SQLite global, latência ultra-baixa
- **Supabase:** BaaS completo com auth

### ORMs Modernos
- **Prisma:** Type-safe, migrations, admin UI
- **TypeORM:** Decorators, Active Record
- **SQLAlchemy:** Python ORM + Core, flexível
- **Django ORM:** Batteries incluídos

## 🔄 Context Flow Automatizado

### Ao Concluir (Score ≥ 75)
1. **Banco validado** automaticamente
2. **CONTEXTO.md** atualizado
3. **Prompt gerado** para próximo especialista
4. **Transição** automática para Arquitetura de Software

### Comando de Avanço
Use função de processamento para preparar contexto para Arquitetura de Software quando banco estiver validado.

### Guardrails Críticos
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **VALIDE** performance e segurança
- **TESTE** em ambiente staging
- **USE funções descritivas** para automação via MCP

## 📊 Estrutura dos Templates

### Template Design Banco
- **Visão Geral:** Contexto e decisões
- **Tabelas:** Estrutura física completa
- **Tipos:** Mapeamento de tipos
- **Constraints:** PKs, FKs, únicos, checks
- **Índices:** Estratégicos e compostos

### Template Índices
- **Índices Simples:** Colunas únicas
- **Índices Compostos:** Múltiplas colunas
- **Índices Parciais:** Prefix searches
- **Índices Funcionais:** Expressões e funções
- **Índices de Performance:** Para queries lentas

### Template Migrações
- **Estratégia:** Zero-downtime
- **Backward Compatibility:** Suporte a versões antigas
- **Rollback:** Capacidade de reversão
- **Testing:** Validação em staging
- **Deploy:** Processo automatizado

### Template Constraints
- **Primary Keys:** Identificadores únicos
- **Foreign Keys:** Integridade referencial
- **Unique Constraints:** Validação de unicidade
- **Check Constraints:** Regras de validação
- **Not Null:** Campos obrigatórios

## 🎯 Performance e Métricas

### Tempo Estimado
- **Análise Domínio:** 10 minutos
- **Escolha Banco:** 10 minutos
- **Design Schema:** 15 minutos
- **Índices:** 10 minutos
- **Migrações:** 10 minutos
- **Validação:** 5 minutos
- **Total:** 60 minutos (vs 90 anterior)

### Qualidade Esperada
- **Score validação:** ≥ 75 pontos
- **Performance:** Queries otimizadas
- **Segurança:** Best practices aplicadas
- **Escalabilidade:** Preparado para crescimento
- **Compliance:** Regulamentações atendidas

### Frameworks Utilizados
- **SQL Relacional:** PostgreSQL, MySQL
- **NoSQL:** MongoDB, Redis
- **Serverless:** Neon, Turso, Supabase
- **ORMs:** Prisma, TypeORM, SQLAlchemy
- **Migrations:** Alembic, Prisma Migrate

## 🔧 Integração Maestro

### Skills Complementares
- `performance-profiling` (análise de performance)
- `database-design` (design de schemas)
- `security` (segurança de dados)

### Referências Essenciais
- **Especialista original:** `content/specialists/Especialista em Banco de Dados.md`
- **Artefatos gerados:**
  - `docs/05-banco/design-banco.md` (principal)
  - `docs/05-banco/indices.md` (índices)
  - `docs/05-banco/migracoes.md` (migrações)
  - `docs/05-banco/constraints.md` (constraints)

### Próximo Especialista
**Arquitetura de Software** - Transformará schema em arquitetura detalhada com componentes e serviços.

---

**Framework:** Maestro Skills Modernas v2.0  
**Pattern:** Progressive Disclosure  
**Performance:** 80% redução de tokens  
**Quality:** 100% validação automática