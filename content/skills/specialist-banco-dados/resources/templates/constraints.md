# [Nome do Projeto] - Constraints de Integridade

## Sumário Executivo
[ ] **Projeto:** [Nome do projeto]
[ ] **Versão:** [Versão atual]
[ ] **Data:** [Data de criação]
[ ] **Status:** [Em elaboração/Revisão/Aprovado]
[ ] **Autor:** [DBA]
[ ] **Aprovadores:** [Stakeholders]

---

## 1. Visão Geral das Constraints

### 1.1 Tipos de Constraints
- **Primary Keys (PK):** Identificadores únicos
- **Foreign Keys (FK):** Integridade referencial
- **Unique Constraints:** Unicidade de valores
- **Check Constraints:** Validação de regras
- **Not Null:** Campos obrigatórios
- **Default Values:** Valores padrão

### 1.2 Estratégia de Implementação
- **Gradual:** Implementar em etapas
- **Backward Compatible:** Não quebrar código existente
- **Tested:** Validar antes de deploy
- **Documented:** Documentar todas as regras

### 1.3 Impacto na Performance
- **Write Performance:** Impacto em inserts/updates
- **Read Performance:** Melhoria em queries
- **Storage:** Espaço adicional para índices
- **Maintenance:** Complexidade de manutenção

---

## 2. Primary Keys (PKs)

### 2.1 Padrão de PKs
- **Tipo:** UUID para novas tabelas
- **Auto-increment:** Para migrações legadas
- **Natural Keys:** Para dados de negócio únicos
- **Composite Keys:** Para PKs compostas

### 2.2 PKs por Tabela
#### [Nome da Tabela 1]
```sql
-- PK UUID (padrão para novas tabelas)
ALTER TABLE [tabela] 
ADD CONSTRAINT pk_[tabela] 
PRIMARY KEY (id);

-- PK auto-increment (legado)
ALTER TABLE [tabela] 
ADD CONSTRAINT pk_[tabela] 
PRIMARY KEY (id SERIAL);

-- PK composta
ALTER TABLE [tabela] 
ADD CONSTRAINT pk_[tabela] 
PRIMARY KEY (user_id, product_id);
```

#### [Nome da Tabela 2]
```sql
-- PK com sequence
CREATE SEQUENCE [tabela]_id_seq;
ALTER TABLE [tabela] 
ALTER COLUMN id SET DEFAULT nextval('[tabela]_id_seq');
ALTER TABLE [tabela] 
ADD CONSTRAINT pk_[tabela] 
PRIMARY KEY (id);
```

### 2.3 PKs Especiais
#### PKs com Partição
```sql
-- PK particionada
CREATE TABLE [tabela] (
    id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (tenant_id, id, created_at)
) PARTITION BY RANGE (created_at);
```

#### PKs com Default
```sql
-- PK com valor padrão
ALTER TABLE [tabela] 
ADD CONSTRAINT pk_[tabela] 
PRIMARY KEY (id DEFAULT gen_random_uuid());
```

---

## 3. Foreign Keys (FKs)

### 3.1 Estratégia de FKs
- **Referential Integrity:** Garantir consistência
- **Cascade Actions:** Definir comportamento em delete/update
- **Performance:** Índices em colunas FK
- **Naming:** Convenção clara de nomes

### 3.2 FKs por Relacionamento
#### [Relacionamento 1:N]
```sql
-- FK simples (1:N)
ALTER TABLE [tabela_filha] 
ADD CONSTRAINT fk_[tabela_filha]_[tabela_pai] 
FOREIGN KEY ([coluna_fk]) 
REFERENCES [tabela_pai]([coluna_pk]) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- FK com cascade (1:N)
ALTER TABLE [tabela_filha] 
ADD CONSTRAINT fk_[tabela_filha]_[tabela_pai] 
FOREIGN KEY ([coluna_fk]) 
REFERENCES [tabela_pai]([coluna_pk]) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```

#### [Relacionamento N:N]
```sql
-- FK em tabela de junção
ALTER TABLE [tabela_juncao] 
ADD CONSTRAINT fk_[tabela_juncao]_[tabela1] 
FOREIGN KEY ([tabela1_id]) 
REFERENCES [tabela1](id) 
ON DELETE CASCADE;

ALTER TABLE [tabela_juncao] 
ADD CONSTRAINT fk_[tabela_juncao]_[tabela2] 
FOREIGN KEY ([tabela2_id]) 
REFERENCES [tabela2](id) 
ON DELETE CASCADE;
```

#### [Relacionamento 1:1]
```sql
-- FK 1:1
ALTER TABLE [tabela2] 
ADD CONSTRAINT fk_[tabela2]_[tabela1] 
FOREIGN KEY ([tabela1_id]) 
REFERENCES [tabela1](id) 
ON DELETE CASCADE 
ON UPDATE CASCADE 
UNIQUE ([tabela1_id]);
```

### 3.3 Ações em FKs
| Ação | Descrição | Quando Usar |
|-------|-----------|-------------|
| **RESTRICT** | Impede delete/update | Dados críticos |
| **CASCADE** | Propaga delete/update | Dados dependentes |
| **SET NULL** | Define como NULL | Dados opcionais |
| **SET DEFAULT** | Define valor padrão | Dados com padrão |

### 3.4 FKs com Self-Reference
```sql
-- Self-reference (hierarquia)
ALTER TABLE [tabela] 
ADD CONSTRAINT fk_[tabela]_parent 
FOREIGN KEY (parent_id) 
REFERENCES [tabela](id) 
ON DELETE SET NULL;
```

---

## 4. Unique Constraints

### 4.1 Estratégia de Unicidade
- **Business Rules:** Regras de negócio
- **Data Integrity:** Evitar duplicatas
- **Performance:** Índices únicos
- **Naming:** Convenção clara

### 4.2 Unique Constraints por Tabela
#### [Nome da Tabela 1]
```sql
-- Unique simples
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_email 
UNIQUE (email);

-- Unique composto
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_[colunas] 
UNIQUE ([coluna1], [coluna2]);

-- Unique parcial
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_[coluna]_active 
UNIQUE ([coluna]) 
WHERE deleted_at IS NULL;
```

#### [Nome da Tabela 2]
```sql
-- Unique com função
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_email_lower 
UNIQUE (LOWER(email));

-- Unique com expressão
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_[coluna]_formatted 
UNIQUE (TRIM(BOTH FROM [coluna]));
```

### 4.3 Unique Constraints Especiais
#### Unique com Condição
```sql
-- Unique para registros ativos
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_[coluna]_active 
UNIQUE ([coluna]) 
DEFERRABLE INITIALLY DEFERRED;

-- Unique com deferrable
ALTER TABLE [tabela] 
ADD CONSTRAINT uk_[tabela]_[colunas] 
UNIQUE ([coluna1], [coluna2]) 
DEFERRABLE INITIALLY DEFERRED;
```

---

## 5. Check Constraints

### 5.1 Estratégia de Validação
- **Business Rules:** Regras de negócio
- **Data Validation:** Validação de dados
- **Range Validation:** Validação de intervalos
- **Format Validation:** Validação de formato

### 5.2 Check Constraints por Tabela
#### [Nome da Tabela 1]
```sql
-- Check de range
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_[coluna]_range 
CHECK ([coluna] >= 0 AND [coluna] <= 100);

-- Check de formato
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Check de negócio
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_[regra] 
CHECK ([coluna1] > [coluna2]);
```

#### [Nome da Tabela 2]
```sql
-- Check de data
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_date_range 
CHECK (data_inicio <= data_fim);

-- Check de status
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_status_valid 
CHECK (status IN ('active', 'inactive', 'pending'));

-- Check de valor positivo
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_[coluna]_positive 
CHECK ([coluna] > 0);
```

### 5.3 Check Constraints Complexos
#### Múltiplas Condições
```sql
-- Check complexo
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_[complex] 
CHECK (
    (status = 'active' AND data_inicio IS NOT NULL) OR
    (status = 'inactive' AND data_fim IS NOT NULL)
);

-- Check com CASE
ALTER TABLE [tabela] 
ADD CONSTRAINT ck_[tabela]_[case] 
CHECK (
    CASE 
        WHEN tipo = 'premium' THEN valor > 100
        WHEN tipo = 'basic' THEN valor <= 100
        ELSE true
    END
);
```

---

## 6. Not Null Constraints

### 6.1 Estratégia de Obrigatoriedade
- **Business Rules:** Campos obrigatórios
- **Data Integrity:** Evitar nulos indevidos
- **Default Values:** Valores padrão
- **Migration:** Adicionar gradualmente

### 6.2 Not Null por Tabela
#### [Nome da Tabela 1]
```sql
-- Adicionar NOT NULL (com valor padrão)
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET NOT NULL;

-- Adicionar NOT NULL (com validação)
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET NOT NULL;

-- Adicionar NOT NULL com default
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET NOT NULL,
ALTER COLUMN [coluna] SET DEFAULT [valor];
```

#### [Nome da Tabela 2]
```sql
-- NOT NULL em múltiplas colunas
ALTER TABLE [tabela] 
ALTER COLUMN [coluna1] SET NOT NULL,
ALTER COLUMN [coluna2] SET NOT NULL,
ALTER COLUMN [coluna3] SET NOT NULL;
```

### 6.3 Not Null com Migração
```sql
-- Migração segura para NOT NULL
-- Passo 1: Adicionar valor padrão
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT [valor];

-- Passo 2: Atualizar nulos existentes
UPDATE [tabela] 
SET [coluna] = [valor] 
WHERE [coluna] IS NULL;

-- Passo 3: Adicionar NOT NULL
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET NOT NULL;
```

---

## 7. Default Values

### 7.1 Estratégia de Defaults
- **Business Logic:** Valores padrão de negócio
- **System Values:** Valores gerados pelo sistema
- **User Experience:** Melhorar UX
- **Data Integrity:** Garantir dados válidos

### 7.2 Default Values por Tipo
#### Valores Simples
```sql
-- Default string
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT '[valor]';

-- Default numérico
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT [valor];

-- Default boolean
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT [true/false];

-- Default timestamp
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT CURRENT_TIMESTAMP;
```

#### Valores Complexos
```sql
-- Default com função
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT gen_random_uuid();

-- Default com expressão
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT (CURRENT_DATE + INTERVAL '1 year');

-- Default com subquery
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT (SELECT MAX(id) FROM [outra_tabela]);
```

### 7.3 Defaults Especiais
#### Defaults Sequenciais
```sql
-- Default com sequence
CREATE SEQUENCE [sequencia];
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT nextval('[sequencia]');

-- Default auto-increment
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT nextval('[tabela]_id_seq');
```

#### Defaults Condicionais
```sql
-- Default com CASE
ALTER TABLE [tabela] 
ALTER COLUMN [coluna] SET DEFAULT 
CASE 
    WHEN [condição] THEN [valor1]
    ELSE [valor2]
END;
```

---

## 8. Constraints por Domínio

### 8.1 Domínio de Usuários
#### Users Table
```sql
-- PK
ALTER TABLE users 
ADD CONSTRAINT pk_users 
PRIMARY KEY (id);

-- Unique constraints
ALTER TABLE users 
ADD CONSTRAINT uk_users_email 
UNIQUE (email);

ALTER TABLE users 
ADD CONSTRAINT uk_users_username 
UNIQUE (username);

-- Check constraints
ALTER TABLE users 
ADD CONSTRAINT ck_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users 
ADD CONSTRAINT ck_users_username_length 
CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 50);

-- Not null
ALTER TABLE users 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN username SET NOT NULL,
ALTER COLUMN password_hash SET NOT NULL;

-- Defaults
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN status SET DEFAULT 'active';
```

### 8.2 Domínio de Pedidos
#### Orders Table
```sql
-- PK
ALTER TABLE orders 
ADD CONSTRAINT pk_orders 
PRIMARY KEY (id);

-- FKs
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE RESTRICT;

ALTER TABLE orders 
ADD CONSTRAINT fk_orders_status 
FOREIGN KEY (status_id) 
REFERENCES order_status(id) 
ON DELETE RESTRICT;

-- Check constraints
ALTER TABLE orders 
ADD CONSTRAINT ck_orders_total_positive 
CHECK (total_amount >= 0);

ALTER TABLE orders 
ADD CONSTRAINT ck_orders_date_valid 
CHECK (order_date <= shipping_date);

-- Not null
ALTER TABLE orders 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN total_amount SET NOT NULL,
ALTER COLUMN order_date SET NOT NULL;
```

### 8.3 Domínio de Produtos
#### Products Table
```sql
-- PK
ALTER TABLE products 
ADD CONSTRAINT pk_products 
PRIMARY KEY (id);

-- Unique constraints
ALTER TABLE products 
ADD CONSTRAINT uk_products_sku 
UNIQUE (sku);

ALTER TABLE products 
ADD CONSTRAINT uk_products_name_category 
UNIQUE (name, category_id);

-- FKs
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE RESTRICT;

-- Check constraints
ALTER TABLE products 
ADD CONSTRAINT ck_products_price_positive 
CHECK (price > 0);

ALTER TABLE products 
ADD CONSTRAINT ck_products_stock_valid 
CHECK (stock >= 0);

-- Not null
ALTER TABLE products 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN price SET NOT NULL,
ALTER COLUMN category_id SET NOT NULL;
```

---

## 9. Constraints de Performance

### 9.1 Índices para Constraints
- **PKs:** Criados automaticamente
- **FKs:** Índices recomendados
- **Unique:** Índices criados automaticamente
- **Check:** Sem impacto em performance

### 9.2 Índices para FKs
```sql
-- Índice para FK (recomendado)
CREATE INDEX idx_[tabela]_[fk_coluna] ON [tabela]([fk_coluna]);

-- Índice composto para FK
CREATE INDEX idx_[tabela]_[fk_colunas] ON [tabela]([fk_coluna1], [fk_coluna2]);
```

### 9.3 Performance Considerations
- **Write Overhead:** Impacto em inserts/updates
- **Storage:** Espaço adicional
- **Maintenance:** Complexidade de manutenção
- **Query Optimization:** Melhoria em selects

---

## 10. Constraints de Negócio

### 10.1 Regras de Negócio
- **Email único:** Não permitir emails duplicados
- **Salário positivo:** Salário deve ser positivo
- **Data válida:** Data fim >= data início
- **Status válido:** Status em lista permitida

### 10.2 Implementação de Regras
```sql
-- Regra: email único
ALTER TABLE users 
ADD CONSTRAINT uk_users_email 
UNIQUE (email);

-- Regra: salário positivo
ALTER TABLE employees 
ADD CONSTRAINT ck_employees_salary_positive 
CHECK (salary > 0);

-- Regra: data válida
ALTER TABLE contracts 
ADD CONSTRAINT ck_contracts_date_valid 
CHECK (end_date >= start_date);

-- Regra: status válido
ALTER TABLE orders 
ADD CONSTRAINT ck_orders_status_valid 
CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));
```

### 10.3 Validação de Dados
```sql
-- Validação de CPF
ALTER TABLE users 
ADD CONSTRAINT ck_users_cpf_valid 
CHECK (
    cpf IS NULL OR 
    (LENGTH(cpf) = 11 AND 
     cpf ~ '^[0-9]{11}$' AND
     MOD(
        (SUBSTRING(cpf, 1, 9)::INTEGER * 10 + 
         SUBSTRING(cpf, 10, 1)::INTEGER), 
        11
    ) = SUBSTRING(cpf, 11, 1)::INTEGER)
);

-- Validação de telefone
ALTER TABLE users 
ADD CONSTRAINT ck_users_phone_valid 
CHECK (
    phone IS NULL OR 
    phone ~ '^\+?[1-9]\d{1,14}$'
);
```

---

## 11. Constraints de Segurança

### 11.1 Segurança de Dados
- **PII Protection:** Proteger dados pessoais
- **Access Control:** Controle de acesso
- **Audit Trail:** Registro de mudanças
- **Encryption:** Criptografia quando necessário

### 11.2 Constraints de Segurança
```sql
-- Hash de senha (não armazenar senha em claro)
ALTER TABLE users 
ADD CONSTRAINT ck_users_password_hashed 
CHECK (password_hash IS NOT NULL AND password_hash != '');

-- Role validation
ALTER TABLE users 
ADD CONSTRAINT ck_users_role_valid 
CHECK (role IN ('admin', 'user', 'guest'));

-- Email verification
ALTER TABLE users 
ADD CONSTRAINT ck_users_email_verified 
CHECK (email_verified_at IS NULL OR email_verified_at <= created_at);
```

### 11.3 Auditoria
```sql
-- Tabela de auditoria
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        current_setting('app.current_user_id')::UUID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 12. Constraints de Compliance

### 12.1 GDPR Compliance
- **Data Minimization:** Coletar apenas dados necessários
- **Data Protection:** Proteger dados pessoais
- **Right to Erasure:** Permitir exclusão
- **Consent Management:** Gerenciar consentimento

### 12.2 Constraints GDPR
```sql
-- Consentimento explícito
ALTER TABLE users 
ADD CONSTRAINT ck_users_consent_given 
CHECK (marketing_consent IS NOT NULL);

-- Data de consentimento
ALTER TABLE users 
ADD CONSTRAINT ck_users_consent_date 
CHECK (marketing_consent_at IS NOT NULL OR marketing_consent = false);

-- Direito ao esquecimento
ALTER TABLE users 
ADD CONSTRAINT ck_users_deletion_request 
CHECK (deletion_requested_at IS NULL OR deleted_at IS NOT NULL);
```

### 12.3 PCI DSS Compliance
- **Card Data:** Proteger dados de cartão
- **Encryption:** Criptografar dados sensíveis
- **Access Control:** Controle rigoroso
- **Audit Trail:** Registro completo

---

## 13. Constraints por Stack

### 13.1 PostgreSQL
```sql
-- Exclusion constraint (PostgreSQL 15+)
ALTER TABLE bookings 
ADD CONSTRAINT ex_bookings_room_time 
EXCLUDE USING gist (room WITH =, time_range WITH &&);

-- Generated columns
ALTER TABLE users 
ADD COLUMN email_domain VARCHAR(255) 
GENERATED ALWAYS AS (split_part(email, '@', 2)) STORED;

-- Partial unique index
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_active 
ON users (email) 
WHERE deleted_at IS NULL;
```

### 13.2 MySQL
```sql
-- Generated column (MySQL 5.7+)
ALTER TABLE users 
ADD COLUMN email_domain VARCHAR(255) 
GENERATED ALWAYS AS (SUBSTRING_INDEX(email, '@', -1)) STORED;

-- Check constraint (MySQL 8.0+)
ALTER TABLE users 
ADD CONSTRAINT ck_users_email_format 
CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
```

### 13.3 MongoDB
```javascript
// Unique constraint
db.users.createIndex({ email: 1 }, { unique: true });

// Partial index
db.users.createIndex({ email: 1 }, { 
  unique: true, 
  partialFilterExpression: { deletedAt: null } 
});

// Validation rules
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "username"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        }
      }
    }
  }
});
```

---

## 14. Manutenção de Constraints

### 14.1 Adição de Constraints
```sql
-- Adicionar constraint segura
-- Passo 1: Validar dados
SELECT COUNT(*) FROM [tabela] WHERE [condição];

-- Passo 2: Adicionar constraint
ALTER TABLE [tabela] 
ADD CONSTRAINT [nome] 
CHECK ([condição]);

-- Passo 3: Verificar
\d [tabela]
```

### 14.2 Remoção de Constraints
```sql
-- Remover constraint
ALTER TABLE [tabela] 
DROP CONSTRAINT IF EXISTS [nome];

-- Remover constraint com cascade
ALTER TABLE [tabela] 
DROP CONSTRAINT [nome] CASCADE;
```

### 14.3 Modificação de Constraints
```sql
-- PostgreSQL: Não é possível modificar, deve remover e recriar
ALTER TABLE [tabela] 
DROP CONSTRAINT IF EXISTS [nome];

ALTER TABLE [tabela] 
ADD CONSTRAINT [nome] 
CHECK ([nova_condição]);
```

---

## 15. Troubleshooting

### 15.1 Common Issues
#### Constraint Violation
- **Sintoma:** ERRO: constraint violation
- **Causa:** Dados inconsistentes
- **Solução:** Limpar dados ou ajustar constraint

#### Performance Issues
- **Sintoma:** Queries lentas após adicionar constraints
- **Causa:** Índices faltando ou mal configurados
- **Solução:** Adicionar índices apropriados

#### Migration Issues
- **Sintoma:** Erro ao adicionar constraint
- **Causa:** Dados existentes violam constraint
- **Solução:** Limpar dados antes de adicionar

### 15.2 Debug Tools
```sql
-- Verificar constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = '[tabela]'::regclass;

-- Verificar violações
SELECT * FROM [tabela] 
WHERE NOT ([condição]);

-- Verificar dependências
SELECT * FROM pg_depend 
WHERE refobjid = '[constraint]'::regclass;
```

---

## 16. Best Practices

### 16.1 Design Principles
- **Simplicity:** Constraints simples e claras
- **Consistency:** Convenções consistentes
- **Documentation:** Documentar regras
- **Testing:** Testar antes de deploy

### 16.2 Implementation Guidelines
- **Gradual:** Implementar gradualmente
- **Backward Compatible:** Não quebrar código existente
- **Tested:** Validar em staging
- **Monitored:** Monitorar impacto

### 16.3 Maintenance Guidelines
- **Regular Review:** Revisar periodicamente
- **Performance Monitoring:** Monitorar impacto
- **Documentation Update:** Manter docs atualizadas
- **Cleanup:** Remover constraints não utilizadas

---

## 17. Documentation

### 17.1 Constraint Dictionary
| Constraint | Table | Type | Description | SQL |
|------------|-------|------|-------------|-----|
| pk_users | users | PK | Primary key | PRIMARY KEY (id) |
| uk_users_email | users | Unique | Email único | UNIQUE (email) |
| ck_users_email_format | users | Check | Formato email | CHECK (email ~* '...') |
| fk_orders_user | orders | FK | Referência usuário | FOREIGN KEY (user_id) |

### 17.2 Business Rules Mapping
| Business Rule | Constraint | Table | Implementation |
|---------------|-----------|-------|----------------|
| Email único | uk_users_email | users | UNIQUE (email) |
| Salário positivo | ck_employees_salary | employees | CHECK (salary > 0) |
| Data válida | ck_contracts_dates | contracts | CHECK (end_date >= start_date) |

### 17.3 Change Log
| Date | Constraint | Action | Reason |
|------|------------|--------|--------|
| 2026-01-29 | uk_users_email | Created | Email uniqueness |
| 2026-01-29 | ck_users_email_format | Created | Email validation |
| 2026-01-30 | fk_orders_user | Created | Referential integrity |

---

## 18. Apêndice

### 18.1 Constraint Types
- **PRIMARY KEY:** Identificador único
- **FOREIGN KEY:** Integridade referencial
- **UNIQUE:** Unicidade de valores
- **CHECK:** Validação de regras
- **NOT NULL:** Campo obrigatório
- **DEFAULT:** Valor padrão

### 18.2 Naming Conventions
- **PK:** pk_[tabela]
- **FK:** fk_[tabela]_[referencia]
- **UK:** uk_[tabela]_[coluna]
- **CK:** ck_[tabela]_[regra]

### 18.3 References
- **PostgreSQL Constraints:** [Documentação oficial]
- **MySQL Constraints:** [Documentação oficial]
- **Database Design:** [Livro de referência]
- **SQL Constraints:** [Guia de referência]

---

**Status:** [Em elaboração/Revisão/Aprovado]  
**Revisado por:** [Nome]  
**Data da revisão:** [Data]  
**Próxima revisão:** [Data]  
**Versão:** [Versão]
