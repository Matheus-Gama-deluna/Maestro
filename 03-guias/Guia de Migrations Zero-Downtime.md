# Guia de Migrations Zero-Downtime

> **Prioridade**: 🟠 ALTA  
> **Aplicável a**: Projetos Nível 2 (Médio) e Nível 3 (Complexo)

---

## O Problema

Migrations tradicionais podem causar:
- **Downtime** durante alterações de schema
- **Erros** em deploys blue-green (versão antiga vs nova)
- **Locks** em tabelas grandes (minutos a horas)
- **Rollback impossível** após aplicar destructive changes

---

## Princípios Fundamentais

### 1. Backward Compatibility

Toda migration deve ser compatível com a versão **anterior** do código por pelo menos um ciclo de deploy.

```
Deploy N:   Código v1 + Schema v1
Deploy N+1: Código v2 + Schema v2 (compatível com v1)
Deploy N+2: Código v2 + Schema v3 (pode remover compatibilidade)
```

### 2. Expand-Contract Pattern

Nunca faça alterações destrutivas diretamente.

```mermaid
graph LR
    A[Estado Inicial] -->|1. Expand| B[Adiciona novo]
    B -->|2. Migrate| C[Transfere dados]
    C -->|3. Contract| D[Remove antigo]
```

### 3. Small, Incremental Changes

- Uma alteração por migration
- Migrations devem ser rápidas (< 1 segundo em tabelas grandes)
- Rollback sempre possível

---

## Padrões de Migration

### Adicionar Coluna (Seguro ✅)

```sql
-- Step 1: Adicionar coluna nullable ou com default
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Step 2: (Código) Deploy versão que escreve na nova coluna
-- Step 3: (Job) Preencher dados antigos se necessário
-- Step 4: (Código) Deploy versão que lê da nova coluna
-- Step 5: (Se necessário) Tornar NOT NULL
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

### Renomear Coluna (⚠️ Requer Cuidado)

**❌ NUNCA FAÇA:**
```sql
ALTER TABLE users RENAME COLUMN name TO full_name;
```

**✅ FAÇA EM 3 DEPLOYS:**

```sql
-- Deploy 1: Adicionar nova coluna
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Deploy 1: Trigger para sincronizar (opcional, ou fazer no código)
CREATE TRIGGER sync_name_columns
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION sync_name_to_full_name();
```

```python
# Deploy 2: Código escreve em ambas, lê da nova
def update_user(user_id, name):
    db.execute("""
        UPDATE users 
        SET name = %s, full_name = %s 
        WHERE id = %s
    """, name, name, user_id)
    
def get_user(user_id):
    # Lê da nova coluna
    return db.query("SELECT full_name FROM users WHERE id = %s", user_id)
```

```sql
-- Deploy 3: Remover coluna antiga
ALTER TABLE users DROP COLUMN name;
```

### Remover Coluna (⚠️ 2 Deploys)

```python
# Deploy 1: Código para de usar a coluna
# (mas schema ainda tem a coluna)
```

```sql
-- Deploy 2: Remover coluna (depois que código antigo não está mais ativo)
ALTER TABLE users DROP COLUMN legacy_field;
```

### Adicionar Índice (⚠️ Pode Bloquear)

**❌ Bloqueia tabela:**
```sql
CREATE INDEX idx_users_email ON users(email);
```

**✅ Não bloqueia (PostgreSQL):**
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**✅ Não bloqueia (MySQL 8+):**
```sql
ALTER TABLE users ADD INDEX idx_email (email), ALGORITHM=INPLACE, LOCK=NONE;
```

### Alterar Tipo de Coluna (⚠️ Complexo)

Use o Expand-Contract:

```sql
-- Step 1: Adiciona nova coluna
ALTER TABLE orders ADD COLUMN amount_cents BIGINT;

-- Step 2: Trigger ou código para sincronizar
-- Step 3: Backfill job
UPDATE orders SET amount_cents = amount * 100 WHERE amount_cents IS NULL;

-- Step 4: Código usa nova coluna
-- Step 5: Remove coluna antiga
ALTER TABLE orders DROP COLUMN amount;
```

---

## Migrations em Tabelas Grandes

Para tabelas com milhões de registros:

### Técnica 1: Batch Processing

```python
def backfill_in_batches(batch_size=1000):
    while True:
        affected = db.execute("""
            UPDATE users 
            SET new_column = compute_value(old_column)
            WHERE new_column IS NULL
            LIMIT %s
        """, batch_size)
        
        if affected == 0:
            break
            
        time.sleep(0.1)  # Evita sobrecarga
```

### Técnica 2: pt-online-schema-change (MySQL)

```bash
pt-online-schema-change --execute \
    --alter "ADD COLUMN phone VARCHAR(20)" \
    D=mydb,t=users
```

### Técnica 3: gh-ost (MySQL)

```bash
gh-ost \
    --database=mydb \
    --table=users \
    --alter="ADD COLUMN phone VARCHAR(20)" \
    --execute
```

### Técnica 4: pgroll (PostgreSQL)

```yaml
# migration.yaml
operations:
  - add_column:
      table: users
      column:
        name: phone
        type: varchar(20)
        nullable: true
```

---

## Feature Flags para Schema

Controle quais versões do código usam qual schema:

```python
# config/feature_flags.py
SCHEMA_V2_ENABLED = os.getenv('SCHEMA_V2_ENABLED', 'false') == 'true'

# models/user.py
class User:
    def get_display_name(self):
        if SCHEMA_V2_ENABLED:
            return self.full_name
        return self.name
```

---

## Rollback Strategies

### Migrations Reversíveis

```python
# Django
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='user',
            name='phone',
            field=models.CharField(max_length=20, null=True),
        ),
    ]
    
    def reverse(self):
        # Explícito: remover o campo
        pass
```

### Sempre Tenha Backup

```bash
# Antes de migrations em produção
pg_dump -Fc mydb > backup_before_migration_$(date +%Y%m%d).dump

# Verificar que backup é restaurável
pg_restore --list backup.dump
```

---

## Checklist de Migration

### Antes da Migration

- [ ] Migration testada em ambiente de staging
- [ ] Tempo de execução medido em dataset similar ao prod
- [ ] Plano de rollback documentado
- [ ] Backup recente verificado
- [ ] Horário de baixo tráfego escolhido (se necessário)

### Durante a Migration

- [ ] Monitorar locks e tempo de execução
- [ ] Monitorar CPU/memória do banco
- [ ] Logs de aplicação para erros
- [ ] Comunicação com time se demorar

### Após a Migration

- [ ] Verificar integridade dos dados
- [ ] Remover código/colunas legadas no próximo deploy
- [ ] Atualizar documentação de schema

---

## Ferramentas por Stack

| Stack | Ferramenta | Recursos |
|-------|-----------|----------|
| **PostgreSQL** | pgroll, Flyway | Online DDL, versioning |
| **MySQL** | gh-ost, pt-osc | Zero-downtime ALTERs |
| **Rails** | strong_migrations | Bloqueia migrations perigosas |
| **Django** | django-pg-zero-downtime-migrations | Checks automáticos |
| **Node.js** | TypeORM, Prisma | Migrations declarativas |
| **Java** | Flyway, Liquibase | Enterprise-ready |

---

## Anti-Patterns

| ❌ Não Faça | ✅ Faça Assim |
|-------------|---------------|
| Renomear coluna diretamente | Expand-Contract em 3 deploys |
| Alterar tipo diretamente | Nova coluna + migrar dados |
| DROP COLUMN com código usando | Remover uso no código primeiro |
| CREATE INDEX sem CONCURRENTLY | Usar CONCURRENTLY ou online DDL |
| Múltiplas alterações em uma migration | Uma alteração por migration |

---

## Referências

- [Stripe - Online Migrations at Scale](https://stripe.com/blog/online-migrations)
- [GitHub - gh-ost](https://github.com/github/gh-ost)
- [PostgreSQL - ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Strong Migrations (Rails)](https://github.com/ankane/strong_migrations)
