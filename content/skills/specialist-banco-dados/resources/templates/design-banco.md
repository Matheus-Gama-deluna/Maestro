# [Nome do Projeto] - Design de Banco de Dados

## Sumário Executivo
[ ] **Projeto:** [Nome do projeto]
[ ] **Versão:** [Versão atual]
[ ] **Data:** [Data de criação]
[ ] **Status:** [Em elaboração/Revisão/Aprovado]
[ ] **Autor:** [DBA]
[ ] **Aprovadores:** [Stakeholders]

---

## 1. Decisões de Arquitetura

### 1.1 Banco de Dados Escolhido
[ ] **Tipo:** [PostgreSQL/MySQL/MongoDB/Redis/etc]
[ ] **Versão:** [Versão específica]
[ ] **Justificativa:** [Por que este banco]
[ ] **Infraestrutura:** [Self-hosted/Cloud/Serverless]
[ ] **Região:** [Região principal]
[ ] **High Availability:** [Sim/Não]
[ ] **Backup Strategy:** [Estratégia de backup]

### 1.2 Stack Tecnológica
| Camada | Tecnologia | Versão | Propósito |
|--------|------------|--------|---------|
| ORM | [Nome ORM] | [Versão] | [Descrição] |
| Migrations | [Ferramenta] | [Versão] | [Descrição] |
| Pooling | [Pool Type] | [Config] | [Descrição] |
| Monitoring | [Ferramenta] | [Versão] | [Descrição] |

### 1.3 Performance Requirements
[ ] **Volume estimado:** [MB/GB/TB]
[ ] **QPS esperado:** [Queries por segundo]
[ ] **Concorrência:** [Número de usuários simultâneos]
[ ] **Latency target:** [ms]
[ ] **Throughput:** [MB/s]

---

## 2. Schema Físico

### 2.1 Tabelas Principais

#### [Nome da Tabela 1]
```sql
CREATE TABLE [nome_tabela_1] (
    -- Colunas
    id [tipo] PRIMARY KEY,
    [coluna_1] [tipo] [constraints],
    [coluna_2] [tipo] [constraints],
    [coluna_3] [tipo] [constraints],
    
    -- Timestamps
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete
);
```

#### [Nome da Tabela 2]
```sql
CREATE TABLE [nome_tabela_2] (
    -- Colunas
    id [tipo] PRIMARY KEY,
    [coluna_1] [tipo] [constraints],
    [coluna_2] [tipo] [constraints],
    [coluna_3] [tipo] [constraints],
    
    -- Timestamps
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete
);
```

### 2.2 Relacionamentos
- **[Tabela 1] → [Tabela 2]:** [Tipo] - [Descrição]
- **[Tabela 2] → [Tabela 3]:** [Tipo] - [Descrição]
- **[Tabela 1] ← [Tabela 3]:** [Tipo] - [Descrição]

### 2.3 Tipos de Dados
| Tipo | Descrição | Quando Usar | Exemplo |
|------|-----------|-------------|---------|
| **UUID** | Identificador único | PKs, referências | `gen_random_uuid()` |
| **VARCHAR(N)** | Texto de tamanho fixo | Nomes, emails | `VARCHAR(255)` |
| **TEXT** | Texto longo | Descrições, JSON | `TEXT` |
| **INTEGER** | Número inteiro | Contadores, IDs | `INTEGER` |
| **DECIMAL(P,S)** | Decimal preciso | Valores monetários | `DECIMAL(10,2)` |
| **BOOLEAN** | Booleano | Flags, status | `BOOLEAN` |
| **TIMESTAMP** | Data e hora | Timestamps | `TIMESTAMP` |
| **JSON/JSONB** | JSON estruturado | Dados flexíveis | `JSONB` |
| **VECTOR(N)** | Vetores numéricos | Embeddings IA | `VECTOR(1536)` |

---

## 3. Índices Estratégicos

### 3.1 Índices Primários
- **PKs:** Criados automaticamente com `PRIMARY KEY`
- **Índices Únicos:** Para unicidade de colunas
- **Índices Compostos:** Para múltiplas colunas

### 3.2 Índices de Performance
#### [Índice 1]
- **Tabela:** [Nome da tabela]
- **Colunas:** [coluna1, coluna2]
- **Tipo:** [B-tree/GIN/Hash]
- **Justificativa:** [Por que este índice]
- **Queries otimizadas:** [Exemplos de queries]

#### [Índice 2]
- **Tabela:** [Nome da tabela]
- **Coluna:** [coluna]
- **Tipo:** [B-tree/GIN/Hash]
- **Justificativa:** [Por que este índice]
- **Queries otimizadas:** [Exemplos de queries]

### 3.3 Índices Compostos
#### [Índice Composto 1]
```sql
CREATE INDEX idx_[tabela]_[colunas] ON [tabela] ([coluna1], [coluna2]);
```
- **Tabela:** [Nome da tabela]
- **Colunas:** [coluna1, coluna2]
- **Justificativa:** [Por que este índice composto]
- **Queries otimizadas:** [Exemplos de queries]

### 3.4 Índices Parciais
#### [Índice Parcial 1]
```sql
CREATE INDEX idx_[tabela]_[coluna_prefix] ON [tabela] (coluna varchar_pattern_ops);
```
- **Tabela:** [Nome da tabela]
- **Coluna:** [coluna]
- **Padrão:** [padrão de busca]
- **Justificativa:** [Por que este índice parcial]

---

## 4. Constraints de Integridade

### 4.1 Primary Keys
- **Padrão:** UUID para novas tabelas
- **Auto-increment:** Para migrações legadas
- **Natural Keys:** Para dados de negócio únicos

### 4. Foreign Keys
#### [FK 1]
```sql
ALTER TABLE [tabela_filha] 
ADD CONSTRAINT fk_[tabela_filha]_[tabela_pai] 
FOREIGN KEY ([coluna_fk]) 
REFERENCES [tabela_pai]([coluna_pk]) 
ON DELETE [ação];
```
- **Tabela:** [Nome da tabela filha]
- **Referência:** [Nome da tabela pai]
- **Coluna FK:** [Nome da coluna FK]
- **Coluna PK:** [Nome da coluna PK]
- **Ação em DELETE:** [CASCADE/SET NULL/RESTRICT]

### 4. Unique Constraints
#### [Unique 1]
```sql
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_[coluna] 
UNIQUE ([coluna]);
```
- **Tabela:** [Nome da tabela]
- **Coluna:** [Nome da coluna]
- **Justificativa:** [Por que deve ser único]

### 4. Check Constraints
#### [Check 1]
```sql
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_[validação] 
CHECK ([condição]);
```
- **Tabela:** [Nome da tabela]
- **Condição:** [Regra de validação]
- **Justificativa:** [Por que esta validação]

### 4. Not Null Constraints
- **Colunas obrigatórias:** Marcar como NOT NULL
- **Colunas opcionais:** Permitir NULL por padrão
- **Timestamps:** Sempre preenchidos

---

## 5. Estratégia de Migrações

### 5.1 Princípios
- **Zero-Downtime:** Sem parada do serviço
- **Backward Compatibility:** Suporte a versões antigas
- **Rollback:** Capacidade de reverter mudanças
- **Testing:** Validação em ambiente staging

### 5. **Processo de Migração**
1. **Backup:** Backup completo do banco atual
2. **Teste:** Executar em ambiente staging
3. **Deploy:** Aplicar em produção
4. **Monitor:** Verificar performance
5. **Rollback:** Se necessário

### 5.2 Ferramentas por Stack
#### Node.js
- **Prisma Migrate:** Migrations automatizadas
- **TypeORM:** Migrations manuais
- **Knex.js:** Queries customizadas

#### Python
- **Alembic:** Migrations automatizadas
- **Django Migrations:** Built-in
- **SQLAlchemy:** Migrations manuais

#### PHP
- **Laravel Migrations:** Built-in
- **Doctrine Migrations:** Migrations manuais

### 5.3 Scripts de Exemplo
#### Migration Node.js (Prisma)
```sql
-- Migration: 001_create_users_table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);
```

#### Migration Python (Alembic)
```python
"""create users table

Revision ID: 001
Revises: 001
Create Date: 2026-01-29 12:00:00.000000

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('pk_users', 'id')
    )
```

---

## 6. Segurança

### 6.1 Autenticação
- **Users:** Tabela de usuários com senhas hashead
- **Roles:** Tabela de papéis e permissões
- **Sessions:** Tabela de sessões expiráveis

### 6.2 Autorização
- **RBAC:** Role-Based Access Control
- **ABAC:** Attribute-Based Access Control
- **JWT:** Tokens com expiração

### 6.3 Criptografia
- **Senhas:** Hash com bcrypt/argon2
- **Tokens:** JWT com assinatura
- **Dados sensíveis:** Criptografia em repouso

### 6.4 Auditoria
- **Logs:** Tabela de logs de auditoria
- **Timestamps:** Registro de todas as mudanças
- **User ID:** Quem fez a mudança
- **Action:** Tipo de ação realizada

---

## 7. Performance Otimizada

### 7.1 Query Optimization
- **EXPLAIN ANALYZE:** Análise de plano de execução
- **Índices apropriados:** Para WHERE, JOIN, ORDER BY
- **Avoid SELECT *:** Selecionar apenas colunas necessárias
- **Prepared Statements:** Reuso de queries

### 7.2 Connection Pooling
- **Pool Size:** [Número de conexões no pool]
- **Max Overflow:** [Número máximo de conexões]
- **Timeout:** [Tempo de espera por conexão]
- **Idle Timeout:** [Tempo de ociosidade]

### 7. **Caching Strategy**
- **Application Level:** Cache de consultas frequentes
- **Database Level:** Cache de resultados
- **Redis:** Cache distribuído se disponível
- **TTL:** Time-to-live configurado

### 7. **Partitioning**
- **Range Partitioning:** Por data ou ID
- **List Partitioning:** Para listas grandes
- **Hash Partitioning:** Para distribuição uniforme
- **Sharding:** Horizontal scaling

---

## 8. Backup e Recuperação

### 8.1 Estratégia de Backup
- **Frequência:** [Diário/Semanal/Mensal]
- **Tipo:** [Full/Incremental/Diferencial]
- **Retenção:** [Dias/semanas/meses]
- **Storage:** [Local/Cloud/Nuvem]
- **Teste:** Validação periódica

### 8.2 Backup Automatizado
- **pg_dump:** PostgreSQL full dumps
- **mysqldump:** MySQL dumps
- **WAL-G:** Archive logs para PostgreSQL
- **Cloud Storage:** S3, GCS, Azure Blob

### 8.3 Processo de Recuperação
1. **Identificar problema:** Erro detectado
2. **Parar aplicação:** Evitar corrupção
3. **Restaurar backup:** Do backup mais recente
4. **Validar:** Verificar integridade
5. **Retomar serviço:** Voltar ao normal

---

## 9. Monitoramento

### 9.1 Métricas Essenciais
- **Conexões Ativas:** Número de conexões
- **Query Performance:** Tempo médio das queries
- **Locks Espera:** Tempo de espera por locks
- **Cache Hit Rate:** Taxa de acerto do cache
- **Disk Usage:** Espaço em disco usado

### 9.2 Alertas Configurados
- **CPU:** Uso elevado de CPU
- **Memory:** Uso elevado de memória
- **Disk:** Espaço em disco baixo
- **Connections:** Pool esgotado
- **Error Rate:** Taxa de erros alta

### 9.3 Dashboards
- **Performance:** Gráficos de performance
- **Disponibilidade:** Status do serviço
- **Segurança:** Logs de segurança
- **Negócio:** Métricas de negócio

---

## 10. Compatibilidade e Versionamento

### 10.1 Versões Suportadas
- **PostgreSQL:** 12+ (última estável)
- **MySQL:** 8.0+ (última estável)
- **MongoDB:** 6.0+ (última estável)
- **Redis:** 7.0+ (última estável)

### 10.2 Cloud Services
- **AWS RDS:** PostgreSQL, MySQL, Aurora
- **Azure Database:** PostgreSQL, MySQL
- **Google Cloud SQL:** PostgreSQL, MySQL
- **Neon:** PostgreSQL serverless
- **PlanetScale:** MySQL serverless

### 10.3 ORMs Suportados
- **Node.js:** Prisma, TypeORM, Sequelize
- **Python:** SQLAlchemy, Django ORM, Alembic
- **PHP:** Eloquent, Doctrine
- **Java:** Hibernate, JPA
- **C#: Entity Framework, Dapper

---

## 11. Testes de Performance

### 11.1 Testes de Carga
- **Concurrent Users:** [Número de usuários simultâneos]
- **Queries por Segundo:** [QPS alvo]
- **Volume de Dados:** [Tamanho do dataset]
- **Duração:** [Tempo do teste]

### 11.2 Testes de Stress
- **Peak Load:** Máxima capacidade do sistema
- **Spike Testing:** Picos de carga súbita
- **Endurance:** Testes de longa duração
- **Recovery:** Tempo de recuperação

### 11.3 Testes de Regressão
- **Baseline:** Performance baseline estabelecido
- **Comparação:** Antes vs depois
- **Aceitável:** Variação aceitável
- **Rejeitado:** Variação rejeitada

---

## 12. Troubleshooting Comum

### 12.1 Problemas Comuns
#### Queries Lentas
- **Sintoma:** Query demora muito
- **Causa:** Índices faltando ou ineficientes
- **Solução:** Analisar EXPLAIN, adicionar índices

#### Conexões Esgotadas
- **Sintoma:** Erro de conexão
- **Causa:** Pool esgotado, rede bloqueada
- **Solução:** Aumentar pool, verificar rede

#### Locks Excessivos
- **Sintoma:** Deadlocks frequentes
- **Causa:** Ordem incorreta de acesso
- **Solução:** Reordenar acesso, reduzir transações

### 12.2 Ferramentas de Diagnóstico
- **EXPLAIN ANALYZE:** Análise de queries
- **pg_stat_activity:** Atividade do PostgreSQL
- **SHOW PROCESSLIST:** Processos em execução
- **Performance Schema:** Estatísticas do schema

### 12.3 Logs Essenciais
- **Slow Queries:** Queries lentas identificadas
- **Error Logs:** Erros registrados
- **Connection Logs:** Conexões estabelecidas
- **Transaction Logs:** Transações executadas

---

## 13. Documentação

### 13.1 Diagrama ER
- **Ferramenta:** [Ferramenta de diagrama]
- **Formato:** [Formato do arquivo]
- **Local:** [Onde está salvo]
- **Atualização:** [Frequência de atualização]

### 13.2 Dicionário de Dados
- **Entidades:** Descrição das entidades
- **Relacionamentos:** Mapeamento entre tabelas
- **Tipos:** Definição dos tipos de dados
- **Constraints:** Regras de integridade

### 13.3 Guia de Deploy
- **Ambientes:** Dev/Staging/Prod
- **Processo:** Passo a passo
- **Rollback:** Como reverter mudanças
- **Troubleshooting:** Problemas comuns

---

## 14. Próximos Passos

### 14.1 Para Implementação
1. **Revisar decisões** com stakeholders
2. **Criar schema inicial** baseado no modelo
3. **Definir índices estratégicos**
4. **Implementar constraints**
5. **Criar scripts de migração**
6. **Configurar monitoramento**

### 14.2 Para Manutenção
1. **Monitorar performance** continuamente
2. **Otimizar índices** baseado em uso real
3. **Atualizar schema** conforme necessário
4. **Testar backups** regularmente
5. **Revisar estratégia** periodicamente

---

## 15. Apêndice

### 15.1 Glossário
- **Schema:** Estrutura do banco de dados
- **Table:** Tabela no banco de dados
- **Index:** Estrutura de busca otimizada
- **Constraint:** Regra de integridade
- **Migration:** Script de mudança
- **ORM:** Object-Relational Mapping

### 15.2 Referências
- **Documentação PostgreSQL:** [Link oficial]
- **Documentação MySQL:** [Link oficial]
- **PostgreSQL Wiki:** [Link oficial]
- **Database Design Patterns:** [Livro de referência]
- **High Performance MySQL:** [Livro de referência]

### 15.3 Padrões de Nomenclatura
- **Tabelas:** snake_case plural (ex: `users`, `orders`)
- **Colunas:** snake_case (ex: `created_at`, `updated_at`)
- **Índices:** idx_ [tabela]_[colunas]
- **Constraints:** pk_, uk_, ck_, fk_
- **Funções:** snake_case verbos (ex: `get_user_by_id`)

---

**Status:** [Em elaboração/Revisão/Aprovado]  
**Revisado por:** [Nome]  
**Data da revisão:** [Data]  
**Próxima revisão:** [Data]  
**Versão:** [Versão]  
**Próximo Deploy:** [Data]
