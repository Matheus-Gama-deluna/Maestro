# [Nome do Projeto] - Estratégia de Migrações

## Sumário Executivo
[ ] **Projeto:** [Nome do projeto]
[ ] **Versão:** [Versão atual]
[ ] **Data:** [Data de criação]
[ ] **Status:** [Em elaboração/Revisão/Aprovado]
[ ] **Autor:** [DBA]
[ ] **Aprovadores:** [Stakeholders]

---

## 1. Visão Geral da Estratégia

### 1.1 Princípios
- **Zero-Downtime:** Sem parada do serviço
- **Backward Compatibility:** Suporte a versões antigas
- **Rollback:** Capacidade de reverter mudanças
- **Testing:** Validação em ambiente staging
- **Incremental:** Mudanças pequenas e frequentes

### 1.2 Processo de Migração
1. **Preparação:** Backup e staging
2. **Teste:** Validação em ambiente controlado
3. **Deploy:** Aplicação em produção
4. **Monitor:** Verificação de performance
5. **Rollback:** Se necessário

### 1.3 Ferramentas
- **ORM:** [Nome do ORM]
- **Migration Tool:** [Ferramenta de migração]
- **CI/CD:** [Pipeline de deploy]
- **Monitoring:** [Ferramenta de monitoramento]

---

## 2. Estrutura de Migrações

### 2.1 Convenções de Nomenclatura
- **Padrão:** [timestamp]_[descrição].sql
- **Exemplo:** 20260129_120000_create_users_table.sql
- **Forward:** 001_create_users_table.sql
- **Rollback:** 001_create_users_table_down.sql

### 2.2 Template de Migração
```sql
-- Migration: [número]_[descrição]
-- Author: [autor]
-- Created: [data]
-- Description: [descrição detalhada]

BEGIN;

-- Forward migration
[SQL commands]

-- Rollback migration (comentado por padrão)
-- [SQL commands para rollback]

COMMIT;
```

### 2.3 Estrutura de Diretórios
```
migrations/
├── forward/
│   ├── 001_create_users_table.sql
│   ├── 002_add_email_unique.sql
│   └── 003_create_orders_table.sql
├── rollback/
│   ├── 001_create_users_table_down.sql
│   ├── 002_add_email_unique_down.sql
│   └── 003_create_orders_table_down.sql
└── data/
    ├── seed_data.sql
    └── test_data.sql
```

---

## 3. Migrações por Tipo

### 3.1 Criação de Tabelas
#### Forward Migration
```sql
-- Migration: 001_create_users_table.sql
BEGIN;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);

COMMIT;
```

#### Rollback Migration
```sql
-- Migration: 001_create_users_table_down.sql
BEGIN;

DROP TABLE IF EXISTS users;

COMMIT;
```

### 3.2 Adição de Colunas
#### Forward Migration
```sql
-- Migration: 002_add_user_profile.sql
BEGIN;

-- Adicionar colunas (nullable para backward compatibility)
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Índice para nova coluna
CREATE INDEX idx_users_phone ON users(phone);

COMMIT;
```

#### Rollback Migration
```sql
-- Migration: 002_add_user_profile_down.sql
BEGIN;

-- Remover índices
DROP INDEX IF EXISTS idx_users_phone;

-- Remover colunas
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
ALTER TABLE users DROP COLUMN IF EXISTS phone;

COMMIT;
```

### 3.3 Modificação de Colunas
#### Forward Migration
```sql
-- Migration: 003_increase_email_length.sql
BEGIN;

-- Aumentar tamanho de email (backward compatible)
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);

COMMIT;
```

#### Rollback Migration
```sql
-- Migration: 003_increase_email_length_down.sql
BEGIN;

-- Reduzir tamanho (se seguro)
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(100);

COMMIT;
```

### 3.4 Adição de Constraints
#### Forward Migration
```sql
-- Migration: 004_add_user_constraints.sql
BEGIN;

-- Adicionar constraint (backward compatible)
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Adicionar check constraint
ALTER TABLE users ADD CONSTRAINT ck_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMIT;
```

#### Rollback Migration
```sql
-- Migration: 004_add_user_constraints_down.sql
BEGIN;

-- Remover constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_users_email;
ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_email_format;

COMMIT;
```

---

## 4. Migrações Complexas

### 4.1 Migração de Dados
#### Forward Migration
```sql
-- Migration: 005_migrate_user_names.sql
BEGIN;

-- Adicionar colunas temporárias
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);
ALTER TABLE users ADD COLUMN first_name_temp VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name_temp VARCHAR(100);

-- Migrar dados
UPDATE users SET 
    full_name = COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''),
    first_name_temp = SPLIT_PART(full_name, ' ', 1),
    last_name_temp = CASE 
        WHEN POSITION(' ' IN full_name) > 0 
        THEN SUBSTRING(full_name, POSITION(' ' IN full_name) + 1)
        ELSE ''
    END;

-- Remover colunas antigas
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
ALTER TABLE users DROP COLUMN IF EXISTS full_name;

-- Renomear colunas temporárias
ALTER TABLE users RENAME COLUMN first_name_temp TO first_name;
ALTER TABLE users RENAME COLUMN last_name_temp TO last_name;

COMMIT;
```

### 4.2 Migração Zero-Downtime
#### Forward Migration
```sql
-- Migration: 006_zero_downtime_column_add.sql
BEGIN;

-- Passo 1: Adicionar coluna nullable
ALTER TABLE users ADD COLUMN email_new VARCHAR(255);

-- Passo 2: Criar trigger para manter sincronizado
CREATE OR REPLACE FUNCTION sync_email_new()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_new = NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_email_new
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_email_new();

-- Passo 3: Migrar dados existentes
UPDATE users SET email_new = email;

-- Passo 4: Criar índice na nova coluna
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_new ON users(email_new);

COMMIT;
```

#### Rollback Migration
```sql
-- Migration: 006_zero_downtime_column_add_down.sql
BEGIN;

-- Remover trigger
DROP TRIGGER IF EXISTS trg_sync_email_new ON users;
DROP FUNCTION IF EXISTS sync_email_new();

-- Remover índice
DROP INDEX IF EXISTS idx_users_email_new;

-- Remover coluna
ALTER TABLE users DROP COLUMN IF EXISTS email_new;

COMMIT;
```

---

## 5. Migrações por Stack

### 5.1 Node.js (Prisma)
#### Migration File
```typescript
// migrations/001_create_users_table.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20260129120000 extends Migration {

  async up(): Promise<void> {
    this.addSql('CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) NOT NULL, username VARCHAR(50) NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP);');
    this.addSql('CREATE UNIQUE INDEX idx_users_email ON users(email);');
    this.addSql('CREATE UNIQUE INDEX idx_users_username ON users(username);');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS users;');
  }

}
```

#### Deploy Script
```typescript
// scripts/deploy-migration.ts
import { MigrationExecutor } from '@mikro-orm/migrations';
import { EntityManager } from '@mikro-orm/postgresql';

async function deployMigration(migrationName: string) {
  const em = EntityManager.create();
  const executor = new MigrationExecutor(em);
  
  try {
    await executor.executeMigration(migrationName);
    console.log(`Migration ${migrationName} deployed successfully`);
  } catch (error) {
    console.error(`Migration ${migrationName} failed:`, error);
    throw error;
  }
}
```

### 5.2 Python (Alembic)
#### Migration File
```python
# migrations/versions/001_create_users_table.py
"""create users table

Revision ID: 001
Revises: 000
Create Date: 2026-01-29 12:00:00.000000

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('pk_users', 'id')
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_username', 'users', ['username'], unique=True)

def downgrade():
    op.drop_table('users')
```

#### Deploy Script
```python
# scripts/deploy_migration.py
from alembic.config import Config
from alembic import command
import sys

def deploy_migration(revision: str):
    alembic_cfg = Config("alembic.ini")
    
    try:
        command.upgrade(alembic_cfg, revision)
        print(f"Migration {revision} deployed successfully")
    except Exception as error:
        print(f"Migration {revision} failed: {error}")
        sys.exit(1)
```

### 5.3 PHP (Laravel)
#### Migration File
```php
// database/migrations/2026_01_29_120000_create_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255);
            $table->string('username', 50);
            $table->string('password_hash', 255);
            $table->timestamps();
            
            $table->unique('email');
            $table->unique('username');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
```

#### Deploy Script
```php
// scripts/deploy_migration.php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

function deployMigration($migration) {
    try {
        Artisan::call('migrate', ['--path' => $migration]);
        echo "Migration {$migration} deployed successfully\n";
    } catch (Exception $error) {
        echo "Migration {$migration} failed: {$error->getMessage()}\n";
        exit(1);
    }
}
```

---

## 6. Estratégia de Deploy

### 6.1 Deploy Sequencial
1. **Backup:** Backup completo do banco
2. **Teste:** Executar em staging
3. **Deploy:** Aplicar em produção
4. **Monitor:** Verificar por 5 minutos
5. **Rollback:** Se necessário

### 6.2 Deploy Blue-Green
1. **Green:** Nova versão em ambiente green
2. **Teste:** Validação completa
3. **Switch:** Trocar tráfego para green
4. **Monitor:** Verificar estabilidade
5. **Cleanup:** Remover ambiente blue

### 6.3 Deploy Canário
1. **10%:** Deploy para 10% do tráfego
2. **Monitor:** Verificar por 10 minutos
3. **50%:** Aumentar para 50% se OK
4. **Monitor:** Verificar por 10 minutos
5. **100%:** Deploy completo se OK

---

## 7. Rollback Strategy

### 7.1 Automatic Rollback
- **Trigger:** Erro detectado em monitoramento
- **Action:** Executar script de rollback
- **Verification:** Verificar sistema estável
- **Alert:** Notificar equipe

### 7.2 Manual Rollback
- **Trigger:** Decisão da equipe
- **Preparation:** Preparar ambiente
- **Execution:** Executar rollback
- **Verification:** Testar sistema

### 7.3 Rollback Scripts
```sql
-- rollback_001_create_users_table.sql
BEGIN;

DROP TABLE IF EXISTS users;

COMMIT;
```

```bash
#!/bin/bash
# rollback.sh
echo "Starting rollback..."

# Parar aplicação
systemctl stop app

# Executar rollback
psql -d database -f rollback_001_create_users_table.sql

# Reiniciar aplicação
systemctl start app

echo "Rollback completed"
```

---

## 8. Testing Strategy

### 8.1 Unit Tests
- **Migration SQL:** Testar sintaxe
- **Rollback SQL:** Testar reversão
- **Data Integrity:** Verificar dados

### 8.2 Integration Tests
- **Full Migration:** Testar processo completo
- **Application:** Testar com app real
- **Performance:** Verificar impacto

### 8.3 Staging Tests
- **Production-like:** Ambiente similar
- **Data Volume:** Volume real de dados
- **Load Test:** Testes de carga

### 8.4 Test Automation
```yaml
# .github/workflows/migration.yml
name: Migration Test

on:
  pull_request:
    paths:
      - 'migrations/**'

jobs:
  test-migration:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup PostgreSQL
      run: |
        sudo apt-get install postgresql postgresql-contrib
        sudo systemctl start postgresql
        
    - name: Run Migration Tests
      run: |
        python scripts/test_migrations.py
        
    - name: Run Rollback Tests
      run: |
        python scripts/test_rollback.py
```

---

## 9. Monitoring

### 9.1 Migration Metrics
- **Duration:** Tempo de execução
- **Rows Affected:** Linhas modificadas
- **Errors:** Erros encontrados
- **Performance:** Impacto na performance

### 9.2 Dashboard Metrics
- **Migration Status:** Em execução/concluído/falhou
- **Database Health:** Status do banco
- **Application Health:** Status da aplicação
- **Error Rate:** Taxa de erros

### 9.3 Alert Configuration
```yaml
# alerts/migration.yml
groups:
  - name: migration_alerts
    rules:
      - alert: MigrationFailed
        expr: migration_status == 2
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Migration failed"
          
      - alert: MigrationSlow
        expr: migration_duration > 300
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Migration taking too long"
```

---

## 10. Best Practices

### 10.1 Migration Design
- **Atomic:** Tudo ou nada
- **Idempotent:** Pode ser re-executado
- **Reversible:** Sempre tem rollback
- **Tested:** Testado antes de deploy

### 10.2 SQL Best Practices
- **BEGIN/COMMIT:** Transações explícitas
- **CONCURRENTLY:** Índices sem bloqueio
- **IF EXISTS:** Evitar erros
- **Comments:** Documentar mudanças

### 10.3 Performance
- **Batch Size:** Processar em lotes
- **Indexes:** Remover/recriar se necessário
- **Vacuum:** Limpar espaço após migração
- **Analyze:** Atualizar estatísticas

---

## 11. Troubleshooting

### 11.1 Common Issues
#### Lock Timeout
- **Sintoma:** Lock timeout error
- **Causa:** Migração bloqueada por query
- **Solução:** Identificar e matar query bloqueante

#### Out of Memory
- **Sintoma:** Memory error
- **Causa:** Dataset muito grande
- **Solução:** Processar em batches

#### Constraint Violation
- **Sintoma:** Constraint violation error
- **Causa:** Dados inconsistentes
- **Solução:** Limpar dados antes da migração

### 11.2 Debug Tools
```sql
-- Verificar locks ativos
SELECT * FROM pg_locks WHERE relation = '[table_name]'::regclass;

-- Verificar queries em execução
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Verificar tamanho da tabela
SELECT pg_size_pretty(pg_relation_size('[table_name]'));
```

---

## 12. Documentation

### 12.1 Migration Log
| Date | Migration | Status | Duration | Notes |
|------|-----------|--------|----------|-------|
| 2026-01-29 | 001_create_users_table | Success | 2.3s | Initial setup |
| 2026-01-30 | 002_add_user_profile | Success | 1.8s | Added profile fields |
| 2026-01-31 | 003_migrate_emails | Failed | 5.2s | Data inconsistency |

### 12.2 Migration Checklist
- [ ] **Backup criado**
- [ ] **Testado em staging**
- [ ] **Rollback preparado**
- [ ] **Monitoramento configurado**
- [ ] **Documentação atualizada**
- [ ] **Aprovação obtida**

### 12.3 Runbook
1. **Pre-migration:**
   - [ ] Verificar backup
   - [ ] Testar em staging
   - [ ] Preparar rollback

2. **Migration:**
   - [ ] Executar migration
   - [ ] Verificar logs
   - [ ] Monitorar performance

3. **Post-migration:**
   - [ ] Verificar aplicação
   - [ ] Atualizar documentação
   - [ ] Limpar arquivos temporários

---

## 13. Security

### 13.1 Access Control
- **Migration User:** Permissões limitadas
- **Audit Log:** Registrar mudanças
- **Approval Process:** Requer aprovação

### 13.2 Data Protection
- **PII:** Identificar dados sensíveis
- **Encryption:** Criptografar se necessário
- **Compliance:** Atender regulamentações

### 13.3 Backup Security
- **Encryption:** Backup criptografado
- **Access:** Acesso controlado
- **Retention:** Política de retenção

---

## 14. Compliance

### 14.1 Regulatory Requirements
- **GDPR:** Proteção de dados pessoais
- **PCI DSS:** Pagamentos e cartões
- **HIPAA:** Dados de saúde
- **SOX:** Controles financeiros

### 14.2 Audit Trail
- **Migration Log:** Registrar todas as mudanças
- **User Action:** Quem executou
- **Timestamp:** Quando executou
- **Reason:** Por que executou

### 14.3 Data Retention
- **Backup Retention:** Por quanto tempo manter
- **Log Retention:** Política de logs
- **Archive:** Arquivamento de dados antigos

---

## 15. Future Considerations

### 15.1 Automation
- **CI/CD Integration:** Automatizar deploy
- **Testing Automation:** Testes automáticos
- **Monitoring Automation:** Alertas automáticas

### 15.2 Scalability
- **Sharding:** Particionamento horizontal
- **Replication:** Réplicas de leitura
- **Caching:** Cache de queries

### 15.3 Evolution
- **Schema Evolution:** Evolução do schema
- **Version Management:** Gerenciamento de versões
- **Backward Compatibility:** Manter compatibilidade

---

## 16. Apêndice

### 16.1 Migration Commands
```bash
# PostgreSQL
psql -d database -f migration.sql

# MySQL
mysql -u user -p database < migration.sql

# MongoDB
mongo database --eval "db.collection.insertOne({...})"

# Redis
redis-cli SET key value
```

### 16.2 Useful Queries
```sql
-- Verificar versão do schema
SELECT version FROM schema_version;

-- Listar migrations aplicadas
SELECT * FROM migration_history;

-- Verificar tamanho do banco
SELECT pg_size_pretty(pg_database_size('database'));
```

### 16.3 References
- **PostgreSQL Migrations:** [Documentação oficial]
- **MySQL Migrations:** [Documentação oficial]
- **Database Migrations:** [Livro de referência]
- **Refactoring Databases:** [Livro de referência]

---

**Status:** [Em elaboração/Revisão/Aprovado]  
**Revisado por:** [Nome]  
**Data da revisão:** [Data]  
**Próxima revisão:** [Data]  
**Versão:** [Versão]
