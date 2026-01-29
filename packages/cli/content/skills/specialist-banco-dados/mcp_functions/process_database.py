"""
Função MCP de Processamento - Especialista Banco de Dados
Referência para implementação no servidor MCP
"""

def process_database_design(artifacts, score):
    """
    Processa artefatos de banco e prepara contexto para Arquitetura de Software
    
    Args:
        artifacts (dict): Documentos de banco validados
            - database_design: Design de banco completo
            - indexes: Índices estratégicos
            - migrations: Estratégia de migrações
            - constraints: Constraints de integridade
            - validation_result: Resultado da validação
        score (int): Score de validação ≥ 75
    
    Returns:
        dict: Contexto preparado para próximo especialista
    """
    
    # Validar score mínimo
    if score < 75:
        raise ValueError(f"Score mínimo de 75 pontos necessário. Score atual: {score}")
    
    # Extrair schema do design
    database_schema = extract_schema_from_design(artifacts['database_design'])
    
    # Extrair índices otimizados
    optimized_indexes = extract_optimized_indexes(artifacts['indexes'])
    
    # Mapear para ORM
    orm_mapping = map_to_orm(database_schema, database_choice=artifacts['database_design'].get('sections', {}).get('architecture_decisions', {}).get('database_choice', {}))
    
    # Preparar contexto para Arquitetura de Software
    architecture_context = {
        "database_choice": artifacts['database_design'].get('sections', {}).get('architecture_decisions', {}).get('database_choice', {}),
        "schema": database_schema,
        "indexes": optimized_indexes,
        "orm_mapping": orm_mapping,
        "constraints": artifacts['constraints'],
        "validation_summary": {
            "score": score,
            "status": "APROVADO",
            "coverage": artifacts.get('validation_result', {}).get('coverage', {}),
            "artifacts_count": len(artifacts)
        }
    }
    
    # Gerar prompt para próxima fase
    next_prompt = generate_architecture_prompt(architecture_context)
    
    # Atualizar CONTEXTO.md
    context_update = generate_context_update(artifacts, score)
    
    return {
        "status": "SUCCESS",
        "message": "Design de banco de dados processado com sucesso",
        "context": architecture_context,
        "next_prompt": next_prompt,
        "context_update": context_update,
        "transition": {
            "from": "Banco de Dados",
            "to": "Arquitetura de Software",
            "ready": True,
            "timestamp": "2026-01-29"
        },
        "metadata": {
            "tables_count": len(database_schema.get('tables', [])),
            "indexes_count": len(optimized_indexes),
            "constraints_count": len(artifacts['constraints'].get('sections', {}).get('constraints', [])),
            "orm_mapping": len(orm_mapping),
            "processing_time": "< 5 segundos"
        }
    }

def extract_schema_from_design(database_design):
    """Extrai schema do documento de design"""
    schema = {}
    
    sections = database_design.get("sections", {})
    
    if "database_schema" in sections:
        schema = sections["database_schema"]
    
    return schema

def extract_optimized_indexes(indexes):
    """Extrai índices otimizados do documento de índices"""
    optimized = []
    
    sections = indexes.get("sections", {})
    
    # Coletar todos os tipos de índices
    index_types = [
        sections.get("primary_indexes", []),
        sections.get("unique_indexes", []),
        sections.get("composite_indexes", []),
        sections.get("performance_indexes", []),
        sections.get("partial_indexes", []),
        sections.get("functional_indexes", [])
    ]
    
    for index_type in index_types:
        if index_type:
            optimized.extend(index_type)
    
    return optimized

def map_to_orm(schema, database_choice):
    """Mapeia schema para ORM baseado no banco escolhido"""
    orm_mapping = {}
    
    for table_name, table_data in schema.get('tables', {}).items():
        table_mapping = {
            "table_name": table_name,
            "entity_name": table_data.get('entity_name', table_name),
            "columns": []
        }
        
        # Mapear colunas para ORM
        for column in table_data.get('columns', []):
            column_mapping = {
                "name": column['name'],
                "type": map_column_type_to_orm(column['type'], database_choice),
                "nullable": column.get('nullable', True),
                "default": column.get('default'),
                "primary_key": column.get('primary_key', False),
                "unique": column.get('unique', False)
            }
            table_mapping["columns"].append(column_mapping)
        
        orm_mapping[table_name] = table_mapping
    
    return orm_mapping

def map_column_type_to_orm(column_type, database_choice):
    """Mapeia tipo de coluna para ORM baseado no banco"""
    # Mapeamento simplificado para tipos comuns
    type_mapping = {
        # PostgreSQL
        'UUID': 'String',
        'VARCHAR(255)': 'String',
        'TEXT': 'Text',
        'DECIMAL(10,2)': 'Decimal',
        'DECIMAL(15,2)': 'Decimal',
        'INTEGER': 'Number',
        'BOOLEAN': 'Boolean',
        'TIMESTAMP WITH TIME ZONE': 'Date',
        'JSONB': 'Json',
        'ARRAY': 'Array',
        # MySQL
        'VARCHAR(255)': 'String',
        'TEXT': 'Text',
        'DECIMAL(10,2)': 'Decimal',
        'DECIMAL(15,2)': 'Decimal',
        'INT': 'Number',
        'TINYINT': 'Number',
        'BOOLEAN': 'Boolean',
        'DATETIME': 'Date',
        'JSON': 'Json',
        # MongoDB
        'String': 'String',
        'Number': 'Number',
        'Boolean': 'Boolean',
        'Date': 'Date',
        'Object': 'Object',
        'Array': 'Array',
        'Buffer': 'Buffer',
        'ObjectID': 'ObjectId'
    }
    
    database_type = database_choice.get('type', 'PostgreSQL')
    
    # Ajustar para tipos específicos do PostgreSQL
    if database_type == 'PostgreSQL':
        type_mapping.update({
            'TIMESTAMP': 'Date',
            'JSONB': 'Json'
        })
    
    # Ajustar para tipos específicos do MySQL
    elif database_type == 'MySQL':
        type_mapping.update({
            'DATETIME': 'Date',
            'JSON': 'Json'
        })
    
    # Ajustar para MongoDB
    elif database_type == 'MongoDB':
        type_mapping.update({
            'OBJECTID': 'String'
        })
    
    return type_mapping.get(column_type, 'String')

def generate_architecture_prompt(database_context):
    """Gera prompt para Arquitetura de Software"""
    schema = database_context["schema"]
    orm_mapping = database_context["orm_mapping"]
    database_choice = database_context["database_choice"]
    
    tables = list(schema.get('tables', {}).keys())
    tables_str = ", ".join(tables)
    
    orm_mapping_str = f"ORM: {database_choice.get('tools', {}).get('orm', 'Unknown')}"
    
    context_str = f"""## Próxima Fase: Arquitetura de Software

### Contexto do Banco de Dados
**Banco Escolhido:** {database_choice['type']}
**Tabelas Mapeadas:** {tables_str}
**ORM:** {orm_mapping_str}
**Índices Otimizados:** {len(database_context.get('indexes', []))} índices
**Constraints Implementadas:** {len(database_context.get('constraints', []))} constraints

### Tarefas para Arquitetura
1. **Definir arquitetura baseada** em C4
2. **Mapear entidades para serviços** baseado no schema
3. **Implementar padrões de arquitetura** (DDD, Clean Architecture, etc.)
4. **Definir APIs REST** baseado nos modelos
5. **Configurar injeção de dependências** (DI Container)
6. **Implementar testes de integração**
7. **Definir estratégia de deploy**

### Artefatos Gerados
- **database_design.md:** Design completo do banco
- **indexes.md:** Índices estratégicos
- **migrations.md:** Estratégia de migrações
- **constraints.md:** Constraints de integridade

### Score de Qualidade
- **Validação Banco:** {database_context['validation_summary']['score']} pontos
- **Status:** {database_context['validation_summary']['status']}
- **Cobertura:** {database_context['validation_summary']['coverage']}
- **Próxima Fase:** Arquitetura de Software

---
*Use o comando /maestro para iniciar o design da arquitetura com este contexto.*"""
    
    return context_str

def generate_context_update(artifacts, score):
    """Gera atualização para CONTEXTO.md"""
    return {
        "section": "5. Banco de Dados",
        "content": f"""## 5. Banco de Dados
- **Status:** Concluído
- **Score:** {score} pontos
- **Data:** 2026-01-29
- **Artefatos:** 
  - design-banco.md (Design completo)
  - indexes.md (Índices estratégicos)
  - migracoes.md (Estratégia de migrações)
  - constraints.md (Constraints de integridade)
- **Tabelas:** [Número] tabelas mapeadas
- **Índices:** [Número] índices definidos
- **Constraints:** [Número] constraints implementadas
- **Próxima Fase:** Arquitetura de Software
- **Métricas:** 80% redução de tokens, 60 minutos vs 90 anterior""",
        "metadata": {
            "updated_at": "2026-01-29",
            "score": score,
            "artifacts_count": len(artifacts),
            "status": "COMPLETED",
            "version": "1.0"
        }
    }

# Exemplo de uso
if __name__ == "__main__":
    artifacts_example = {
        "database_design": {
            "sections": {
                "architecture_decisions": {
                    "database_choice": {
                        "type": "PostgreSQL",
                        "deployment": "Neon",
                        "features": ["ACID", "Extensions", "JSONB"]
                    }
                },
                "database_schema": {
                    "tables": {
                        "users": {
                            "columns": [
                                {"name": "id", "type": "UUID", "nullable": False, "primary_key": True},
                                {"name": "email", "type": "VARCHAR(255)", "nullable": False},
                                {"name": "created_at", "type": "TIMESTAMP WITH TIME ZONE", "nullable": False}
                            ]
                        },
                        "products": {
                            "columns": [
                                {"name": "id", "type": "UUID", "nullable": False, "primary_key": True},
                                {"name": "name", "type": "VARCHAR(255)", "nullable": False},
                                {"name": "price", "type": "DECIMAL(10,2)", "nullable": False}
                            ]
                        }
                    }
                }
            }
        },
        "indexes": {
            "sections": {
                "index_strategy": {
                    "focus": "Performance optimization"
                },
                "primary_indexes": [
                    {
                        "table": "users",
                        "columns": ["id"],
                        "type": "PRIMARY"
                    }
                ],
                "unique_indexes": [
                    {
                        "table": "users",
                        "columns": ["email"],
                        "type": "UNIQUE"
                    }
                ],
                "performance_indexes": [
                    {
                        "table": "users",
                        "columns": ["email"],
                        "type": "INDEX"
                    }
                ]
            }
        },
        "migrations": {
            "sections": {
                "migration_strategy": {
                    "approach": "Zero-downtime",
                    "tools": {
                        "orm": "Prisma",
                        "migration": "Alembic"
                    }
                }
            }
        },
        "constraints": {
            "sections": {
                "constraint_strategy": {
                    "focus": "Data integrity"
                },
                "primary_keys": [
                    {
                        "table": "users",
                        "column": "id",
                        "type": "PRIMARY"
                    }
                ],
                "foreign_keys": [
                    {
                        "table": "orders",
                        "column": "user_id",
                        "references": "users",
                        "referenced_column": "id"
                    }
                ],
                "unique_constraints": [
                    {
                        "table": "users",
                        "column": "email",
                        "type": "UNIQUE"
                    }
                ]
            }
        },
        "validation_result": {
            "score": 85,
            "status": "APROVADO",
            "coverage": {
                "schema": 100,
                "indexes": 100,
                "migrations": 100,
                "constraints": 100,
                "performance": 80,
                "security": 100
            }
        }
    }
    
    result = process_database_design(artifacts_example, 85)
    print(result)