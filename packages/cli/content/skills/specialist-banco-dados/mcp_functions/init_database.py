"""
Função MCP de Inicialização - Especialista Banco de Dados
Referência para implementação no servidor MCP
"""

def init_database_design(context):
    """
    Inicializa estrutura base para Banco de Dados
    
    Args:
        context (dict): Dicionário com informações do projeto
            - project_name: Nome do projeto
            - domain_model: Modelo de domínio completo
            - entities: Lista de entidades mapeadas
            - relationships: Lista de relacionamentos
            - requirements: Requisitos não funcionais
            - architecture: Arquitetura C4 inicial
            - tech_stack: Stack tecnológica definida
    
    Returns:
        dict: Estrutura inicial dos documentos de banco
    """
    
    # Validar inputs obrigatórios
    required_fields = ['project_name', 'domain_model', 'entities']
    for field in required_fields:
        if field not in context:
            raise ValueError(f"Campo obrigatório faltando: {field}")
    
    # Analisar requisitos de performance
    performance_requirements = analyze_performance_requirements(context.get('requirements', {}))
    
    # Escolher banco de dados baseado em requisitos
    database_choice = choose_database(context, performance_requirements)
    
    # Criar schema baseado no modelo de domínio
    database_schema = create_database_schema(context['entities'], database_choice)
    
    # Definir índices estratégicos
    indexes = define_strategic_indexes(context['entities'], context['relationships'])
    
    # Criar estrutura de migrações
    migration_strategy = create_migration_strategy(database_choice)
    
    # Criar estrutura de constraints
    constraints = create_constraints(context['entities'], context['relationships'])
    
    # Criar estrutura completa do design de banco
    database_design = {
        "title": f"{context['project_name']} - Design de Banco de Dados",
        "sections": {
            "executive_summary": {
                "project": context['project_name'],
                "version": "1.0",
                "date": "2026-01-29",
                "status": "Em elaboração",
                "author": "Database Architect",
                "approvers": ["Stakeholders"]
            },
            "architecture_decisions": {
                "database_choice": database_choice,
                "tech_stack": context.get('tech_stack', {}),
                "infrastructure": "Cloud/Serverless",
                "high_availability": True,
                "backup_strategy": "Automated"
            },
            "database_schema": database_schema,
            "indexes": indexes,
            "constraints": constraints,
            "migration_strategy": migration_strategy,
            "security": {
                "authentication": "JWT + bcrypt",
                "authorization": "RBAC",
                "encryption": "AES-256",
                "audit_trail": "Enabled"
            },
            "performance": {
                "estimated_volume": performance_requirements.get('volume', 'MB'),
                "qps_target": performance_requirements.get('qps', 100),
                "latency_target": performance_requirements.get('latency', '100ms'),
                "concurrency": performance_requirements.get('concurrency', 100)
            }
        }
    }
    
    # Criar estrutura de índices
    indexes_doc = {
        "title": f"{context['project_name']} - Índices de Banco de Dados",
        "sections": {
            "index_strategy": {
                "focus": "Performance optimization",
                "trade_off": "Storage vs Performance",
                "monitoring": "Usage tracking"
            },
            "primary_indexes": generate_primary_indexes(database_schema),
            "unique_indexes": generate_unique_indexes(database_schema),
            "composite_indexes": generate_composite_indexes(indexes),
            "partial_indexes": generate_partial_indexes(database_schema),
            "functional_indexes": generate_functional_indexes(database_schema),
            "performance_indexes": generate_performance_indexes(indexes)
        }
    }
    
    # Criar estrutura de migrações
    migrations_doc = {
        "title": f"{context['project_name']} - Estratégia de Migrações",
        "sections": {
            "migration_strategy": migration_strategy,
            "zero_downtime": {
                "principle": "No service interruption",
                "approach": "Backward compatible",
                "testing": "Staging validation"
            },
            "migration_scripts": generate_migration_scripts(database_schema),
            "rollback_plan": generate_rollback_plan(database_schema),
            "testing_strategy": generate_testing_strategy()
        }
    }
    
    # Criar estrutura de constraints
    constraints_doc = {
        "title": f"{context['project_name']} - Constraints de Integridade",
        "sections": {
            "constraint_strategy": {
                "focus": "Data integrity",
                "enforcement": "Database level",
                "monitoring": "Violation tracking"
            },
            "primary_keys": generate_primary_keys(database_schema),
            "foreign_keys": generate_foreign_keys(context['relationships']),
            "unique_constraints": generate_unique_constraints(database_schema),
            "check_constraints": generate_check_constraints(database_schema),
            "not_null_constraints": generate_not_null_constraints(database_schema),
            "default_values": generate_default_values(database_schema)
        }
    }
    
    # Retornar estrutura completa
    return {
        "status": "SUCCESS",
        "message": "Estrutura de banco de dados criada com sucesso",
        "database_choice": database_choice,
        "artifacts": {
            "database_design": database_design,
            "indexes": indexes_doc,
            "migrations": migrations_doc,
            "constraints": constraints_doc
        },
        "next_steps": [
            "Refinar schema baseado em requisitos específicos",
            "Definir índices adicionais para queries críticas",
            "Implementar estratégia de backup",
            "Configurar monitoramento",
            "Validar em ambiente de staging"
        ],
        "metadata": {
            "created_at": "2026-01-29",
            "tables_count": len(database_schema.get('tables', [])),
            "indexes_count": len(indexes.get('indexes', [])),
            "constraints_count": len(constraints.get('constraints', [])),
            "estimated_time": "60 minutos",
            "complexity": calculate_complexity(database_schema, indexes, constraints)
        }
    }

def analyze_performance_requirements(requirements):
    """Analisa requisitos de performance"""
    return {
        "volume": extract_volume_requirement(requirements),
        "qps": extract_qps_requirement(requirements),
        "latency": extract_latency_requirement(requirements),
        "concurrency": extract_concurrency_requirement(requirements),
        "growth_rate": extract_growth_rate(requirements)
    }

def extract_volume_requirement(requirements):
    """Extrai requisito de volume"""
    # Procurar por palavras-chave de volume
    text = str(requirements).lower()
    if 'tb' in text:
        return 'TB'
    elif 'gb' in text:
        return 'GB'
    elif 'mb' in text:
        return 'MB'
    else:
        return 'GB'  # Padrão

def extract_qps_requirement(requirements):
    """Extrai requisito de QPS"""
    text = str(requirements).lower()
    if 'qps' in text:
        # Extrair número após QPS
        import re
        match = re.search(r'qps\s*(\d+)', text)
        if match:
            return int(match.group(1))
    return 100  # Padrão

def extract_latency_requirement(requirements):
    """Extrai requisito de latência"""
    text = str(requirements).lower()
    if 'ms' in text:
        # Extrair número antes de ms
        import re
        match = re.search(r'(\d+)\s*ms', text)
        if match:
            return f"{match.group(1)}ms"
    return "100ms"  # Padrão

def extract_concurrency_requirement(requirements):
    """Extrai requisito de concorrência"""
    text = str(requirements).lower()
    if 'concurrent' in text:
        # Extrair número de usuários simultâneos
        import re
        match = re.search(r'(\d+)\s*(?:users|concurrent)', text)
        if match:
            return int(match.group(1))
    return 100  # Padrão

def extract_growth_rate(requirements):
    """Extrai taxa de crescimento"""
    text = str(requirements).lower()
    if 'growth' in text:
        # Extrair percentual de crescimento
        import re
        match = re.search(r'(\d+)%\s*growth', text)
        if match:
            return f"{match.group(1)}%"
    return "20%"  # Padrão

def choose_database(context, performance_requirements):
    """Escolhe o banco de dados baseado nos requisitos"""
    # Lógica de decisão simplificada
    volume = performance_requirements['volume']
    qps = performance_requirements['qps']
    latency = performance_requirements['latency']
    
    # Se volume é muito grande, considerar NoSQL
    if volume == 'TB' and qps > 10000:
        return {
            "type": "MongoDB",
            "reason": "High volume and high QPS",
            "deployment": "MongoDB Atlas",
            "features": ["Document store", "Horizontal scaling", "Flexible schema"]
        }
    
    # Se latência é crítica, PostgreSQL
    elif latency == "50ms" or latency == "10ms":
        return {
            "type": "PostgreSQL",
            "reason": "Low latency requirements",
            "deployment": "Neon (serverless)",
            "features": ["ACID", "Extensions", "JSONB", "pgvector"]
        }
    
    # Se é um projeto pequeno, SQLite pode ser suficiente
    elif volume == 'MB' and qps < 100:
        return {
            "type": "SQLite",
            "reason": "Small scale, simple requirements",
            "deployment": "Local",
            "features": ["Embedded", "Zero-config", "ACID"]
        }
    
    # Padrão: PostgreSQL
    else:
        return {
            "type": "PostgreSQL",
            "reason": "Default choice with excellent features",
            "deployment": "Self-hosted or Cloud",
            "features": ["ACID", "Extensions", "JSONB", "Full-text search"]
        }

def create_database_schema(entities, database_choice):
    """Cria schema de banco baseado nas entidades"""
    tables = {}
    
    for entity in entities:
        table_name = entity['name'].lower() + 's'
        
        # Definir colunas base
        columns = [
            {
                "name": "id",
                "type": get_column_type('id', database_choice),
                "nullable": False,
                "primary_key": True,
                "default": get_default_value('id', database_choice)
            },
            {
                "name": "created_at",
                "type": "TIMESTAMP WITH TIME ZONE",
                "nullable": False,
                "default": "CURRENT_TIMESTAMP"
            },
            {
                "name": "updated_at",
                "type": "TIMESTAMP WITH TIME ZONE",
                "nullable": False,
                "default": "CURRENT_TIMESTAMP"
            }
        ]
        
        # Adicionar atributos da entidade
        if 'attributes' in entity:
            for attr in entity['attributes']:
                if isinstance(attr, str):
                    columns.append({
                        "name": attr.lower(),
                        "type": get_column_type(attr, database_choice),
                        "nullable": True
                    })
                elif isinstance(attr, dict):
                    columns.append({
                        "name": attr.get('name', '').lower(),
                        "type": get_column_type(attr.get('type', 'VARCHAR'), database_choice),
                        "nullable": attr.get('nullable', True),
                        "default": attr.get('default')
                    })
        
        tables[table_name] = {
            "columns": columns,
            "primary_key": "id",
            "entity_name": entity['name']
        }
    
    return {"tables": tables}

def get_column_type(column_name, database_choice):
    """Retorna tipo de coluna baseado no banco escolhido"""
    # Mapeamento simplificado de tipos
    type_mapping = {
        'id': 'UUID',
        'uuid': 'UUID',
        'email': 'VARCHAR(255)',
        'name': 'VARCHAR(255)',
        'title': 'VARCHAR(255)',
        'description': 'TEXT',
        'price': 'DECIMAL(10,2)',
        'amount': 'DECIMAL(15,2)',
        'quantity': 'INTEGER',
        'status': 'VARCHAR(20)',
        'type': 'VARCHAR(50)',
        'date': 'DATE',
        'datetime': 'TIMESTAMP',
        'timestamp': 'TIMESTAMP',
        'boolean': 'BOOLEAN',
        'json': 'JSONB',
        'metadata': 'JSONB',
        'created_at': 'TIMESTAMP',
        'updated_at': 'TIMESTAMP'
    }
    
    return type_mapping.get(column_name.lower(), 'VARCHAR(255)')

def get_default_value(column_name, database_choice):
    """Retorna valor padrão baseado na coluna e banco"""
    if column_name == 'id':
        if database_choice['type'] == 'PostgreSQL':
            return 'gen_random_uuid()'
        elif database_choice['type'] == 'MySQL':
            return 'UUID()'
        else:
            return None
    elif column_name in ['created_at', 'updated_at']:
        return 'CURRENT_TIMESTAMP'
    elif column_name == 'status':
        return "'active'"
    else:
        return None

def define_strategic_indexes(entities, relationships):
    """Define índices estratégicos baseado em entidades e relacionamentos"""
    indexes = []
    
    # Índices para FKs
    for entity in entities:
        table_name = entity['name'].lower() + 's'
        
        # Índice para email se existir
        if has_attribute(entity, 'email'):
            indexes.append({
                "table": table_name,
                "columns": ["email"],
                "type": "UNIQUE",
                "reason": "Email uniqueness"
            })
        
        # Índice para status se existir
        if has_attribute(entity, 'status'):
            indexes.append({
                "table": table_name,
                "columns": ["status"],
                "type": "INDEX",
                "reason": "Status filtering"
            })
        
        # Índice para created_at
        indexes.append({
            "table": table_name,
            "columns": ["created_at"],
            "type": "INDEX",
            "reason": "Time-based queries"
        })
    
    # Índices para relacionamentos
    for rel in relationships:
        from_table = rel['from'].lower() + 's'
        to_table = rel['to'].lower() + 's'
        from_column = rel['from'].lower() + '_id'
        
        indexes.append({
            "table": from_table,
            "columns": [from_column],
            "type": "INDEX",
            "reason": f"Foreign key to {to_table}"
        })
    
    return indexes

def has_attribute(entity, attribute_name):
    """Verifica se entidade tem um atributo"""
    if 'attributes' not in entity:
        return False
    
    if isinstance(entity['attributes'], list):
        return attribute_name in entity['attributes']
    elif isinstance(entity['attributes'], list):
        return any(attr.get('name', '').lower() == attribute_name.lower() 
                   for attr in entity['attributes'] 
                   if isinstance(attr, dict))
    
    return False

def create_migration_strategy(database_choice):
    """Cria estratégia de migração baseada no banco escolhido"""
    return {
        "database": database_choice['type'],
        "approach": "Zero-downtime",
        "tools": get_migration_tools(database_choice),
        "backup_strategy": "Automated backups",
        "testing": "Staging validation",
        "rollback": "Always available"
    }

def get_migration_tools(database_choice):
    """Retorna ferramentas de migração baseadas no banco"""
    if database_choice['type'] == 'PostgreSQL':
        return {
            "orm": "Prisma/TypeORM",
            "migration": "Alembic",
            "backup": "pg_dump",
            "restore": "psql"
        }
    elif database_choice['type'] == 'MySQL':
        return {
            "orm": "Sequelize/TypeORM",
            "migration": "Laravel Migrations",
            "backup": "mysqldump",
            "restore": "mysql"
        }
    elif database_choice['type'] == 'MongoDB':
        return {
            "orm": "Mongoose",
            "migration": "MongoDB Atlas",
            "backup": "mongodump",
            "restore": "mongorestore"
        }
    else:
        return {
            "orm": "Native",
            "migration": "Custom",
            "backup": "Custom",
            "restore": "Custom"
        }

def create_constraints(entities, relationships):
    """Cria constraints baseado em entidades e relacionamentos"""
    constraints = []
    
    # Primary keys
    for entity in entities:
        table_name = entity['name'].lower() + 's'
        constraints.append({
            "type": "PRIMARY_KEY",
            "table": table_name,
            "column": "id",
            "name": f"pk_{table_name}"
        })
    
    # Foreign keys
    for rel in relationships:
        from_table = rel['from'].lower() + 's'
        to_table = rel['to'].lower() + 's'
        from_column = rel['from'].lower() + '_id'
        to_column = rel['to'].lower() + '_id'
        
        constraints.append({
            "type": "FOREIGN_KEY",
            "table": from_table,
            "column": from_column,
            "references": to_table,
            "referenced_column": to_column,
            "name": f"fk_{from_table}_{to_table}"
        })
    
    # Unique constraints
    for entity in entities:
        table_name = entity['name'].lower() + 's'
        
        if has_attribute(entity, 'email'):
            constraints.append({
                "type": "UNIQUE",
                "table": table_name,
                "column": "email",
                "name": f"uk_{table_name}_email"
            })
    
    return constraints

def generate_primary_indexes(schema):
    """Gera índices primários"""
    indexes = []
    
    for table_name, table_data in schema.get('tables', {}).items():
        indexes.append({
            "table": table_name,
            "columns": [table_data['primary_key']],
            "type": "PRIMARY",
            "sql": f"ALTER TABLE {table_name} ADD CONSTRAINT pk_{table_name} PRIMARY KEY ({table_data['primary_key']});"
        })
    
    return indexes

def generate_unique_indexes(schema):
    """Gera índices únicos"""
    indexes = []
    
    for table_name, table_data in schema.get('tables', {}).items():
        for column in table_data.get('columns', []):
            if column.get('unique') or 'email' in column['name'].lower():
                indexes.append({
                    "table": table_name,
                    "columns": [column['name']],
                    "type": "UNIQUE",
                    "sql": f"ALTER TABLE {table_name} ADD CONSTRAINT uk_{table_name}_{column['name']} UNIQUE ({column['name']});"
                })
    
    return indexes

def generate_composite_indexes(indexes):
    """Gera índices compostos"""
    composite_indexes = []
    
    for index in indexes:
        if len(index['columns']) > 1:
            composite_indexes.append({
                "table": index['table'],
                "columns": index['columns'],
                "type": "COMPOSITE",
                "sql": f"CREATE INDEX idx_{index['table']}_{'_'.join(index['columns'])} ON {index['table']} ({', '.join(index['columns'])});"
            })
    
    return composite_indexes

def generate_partial_indexes(schema):
    """Gera índices parciais"""
    partial_indexes = []
    
    for table_name, table_data in schema.get('tables', {}).items():
        # Índice parcial para registros ativos
        partial_indexes.append({
            "table": table_name,
            "columns": ["email"],
            "type": "PARTIAL",
            "condition": "WHERE deleted_at IS NULL",
            "sql": f"CREATE INDEX idx_{table_name}_active_email ON {table_name} (email) WHERE deleted_at IS NULL;"
        })
    
    return partial_indexes

def generate_functional_indexes(schema):
    """Gera índices funcionais"""
    functional_indexes = []
    
    for table_name, table_data in schema.get('tables', {}).items():
        # Índice para busca case-insensitive
        for column in table_data.get('columns', []):
            if 'email' in column['name'].lower():
                functional_indexes.append({
                    "table": table_name,
                    "columns": [f"LOWER({column['name']})"],
                    "type": "FUNCTIONAL",
                    "sql": f"CREATE INDEX idx_{table_name}_email_lower ON {table_name} (LOWER({column['name']}));"
                })
    
    return functional_indexes

def generate_performance_indexes(indexes):
    """Gera índices de performance"""
    performance_indexes = []
    
    for index in indexes:
        if index['type'] == 'INDEX':
            performance_indexes.append({
                "table": index['table'],
                "columns": index['columns'],
                "type": "PERFORMANCE",
                "sql": f"CREATE INDEX idx_{index['table']}_{'_'.join(index['columns'])} ON {index['table']} ({', '.join(index['columns'])});"
            })
    
    return performance_indexes

def generate_migration_scripts(schema):
    """Gera scripts de migração"""
    scripts = []
    
    for table_name, table_data in schema.get('tables', {}).items():
        script = f"""-- Migration: create_{table_name}
BEGIN;

CREATE TABLE {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    {', '.join([f"  {col['name']} {col['type']}{'NULL' if col['nullable'] else 'NOT NULL'}" + 
                                   f" DEFAULT {col['default']}" if col.get('default') else '' 
                                   for col in table_data['columns'][3:]])},
    created_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH DEFAULT CURRENT_TIMESTAMP
);

-- Índices
{chr(10).join([f"CREATE INDEX idx_{table_name}_{col['name']} ON {table_name} ({col['name']});" 
                                   for col in table_data['columns'][1:] if col['name'] != 'id'])}

COMMIT;
"""
        scripts.append(script)
    
    return scripts

def generate_rollback_plan(schema):
    """Gera plano de rollback"""
    rollbacks = []
    
    for table_name in schema.get('tables', {}):
        rollback = f"""-- Rollback: drop_{table_name}
BEGIN;

DROP TABLE IF EXISTS {table_name};

COMMIT;
"""
        rollbacks.append(rollback)
    
    return rollbacks

def generate_testing_strategy():
    """Gera estratégia de testes"""
    return {
        "unit_tests": "Testes unitários de schema",
        "integration_tests": "Testes de integração",
        "performance_tests": "Testes de performance",
        "load_tests": "Testes de carga",
        "migration_tests": "Testes de migração",
        "rollback_tests": "Testes de rollback"
    }

def calculate_complexity(schema, indexes, constraints):
    """Calcula complexidade do schema"""
    table_count = len(schema.get('tables', []))
    index_count = len(indexes.get('indexes', []))
    constraint_count = len(constraints.get('constraints', []))
    
    total = table_count * 2 + index_count + constraint_count
    
    if total < 10:
        return "Baixa"
    elif total < 20:
        return "Média"
    elif total < 50:
        return "Alta"
    else:
        return "Muito Alta"

# Exemplo de uso
if __name__ == "__main__":
    context_example = {
        "project_name": "E-commerce Platform",
        "domain_model": {
            "entities": ["User", "Product", "Order"],
            "relationships": [
                {"from": "User", "to": "Order"},
                {"from": "Order", "to": "Product"}
            ]
        },
        "entities": [
            {
                "name": "User",
                "attributes": ["id", "email", "name", "created_at", "updated_at"]
            },
            {
                "name": "Product",
                "attributes": ["id", "name", "price", "stock", "created_at", "updated_at"]
            },
            {
                "name": "Order",
                "attributes": ["id", "user_id", "total_amount", "status", "created_at", "updated_at"]
            }
        ],
        "requirements": "High volume e baixa latência",
        "tech_stack": {
            "backend": "Node.js",
            "orm": "Prisma"
        }
    }
    
    result = init_database_design(context_example)
    print(result)