"""
Função MCP de Validação - Especialista Banco de Dados
Referência para implementação no servidor MCP
"""

def validate_database_design(artifacts):
    """
    Valida qualidade dos documentos de Banco de Dados
    
    Args:
        artifacts (dict): Dicionário com documentos gerados
            - database_design: Design de banco completo
            - indexes: Índices estratégicos
            - migrations: Estratégia de migrações
            - constraints: Constraints de integridade
            - validation_result: Resultado da validação
    
    Returns:
        dict: Resultado da validação com score
    """
    
    # Validar inputs
    required_artifacts = ['database_design', 'indexes', 'migrations', 'constraints']
    for artifact in required_artifacts:
        if artifact not in artifacts:
            raise ValueError(f"Artefato obrigatório faltando: {artifact}")
    
    # Inicializar validação
    validation_result = {
        "score": 0,
        "status": "REPROVADO",
        "coverage": {},
        "issues": [],
        "recommendations": [],
        "details": {}
    }
    
    # 1. Validar Schema (25 pontos)
    schema_score = validate_schema(artifacts['database_design'])
    validation_result["coverage"]["schema"] = schema_score["percentage"]
    validation_result["details"]["schema"] = schema_score["details"]
    validation_result["score"] += schema_score["score"]
    
    # 2. Validar Índices (20 pontos)
    indexes_score = validate_indexes(artifacts['indexes'])
    validation_result["coverage"]["indexes"] = indexes_score["percentage"]
    validation_result["details"]["indexes"] = indexes_score["details"]
    validation_result["score"] += indexes_score["score"]
    
    # 3. Validar Migrações (20 pontos)
    migrations_score = validate_migrations(artifacts['migrations'])
    validation_result["coverage"]["migrations"] = migrations_score["percentage"]
    validation_result["details"]["migrations"] = migrations_score["details"]
    validation_result["score"] += migrations_score["score"]
    
    # 4. Validar Constraints (20 pontos)
    constraints_score = validate_constraints(artifacts['constraints'])
    validation_result["coverage"]["constraints"] = constraints_score["percentage"]
    validation_result["details"]["constraints"] = constraints_score["details"]
    validation_result["score"] += constraints_score["score"]
    
    # 5. Validar Performance (10 pontos)
    performance_score = validate_performance(artifacts['database_design'], artifacts['indexes'])
    validation_result["coverage"]["performance"] = performance_score["percentage"]
    validation_result["details"]["performance"] = performance_score["details"]
    validation_result["score"] += performance_score["score"]
    
    # 6. Validar Segurança (5 pontos)
    security_score = validate_security(artifacts['database_design'])
    validation_result["coverage"]["security"] = security_score["percentage"]
    validation_result["details"]["security"] = security_score["details"]
    validation_result["score"] += security_score["score"]
    
    # Calcular percentual geral
    validation_result["score"] = min(validation_result["score"], 100)
    
    # Determinar status
    if validation_result["score"] >= 75:
        validation_result["status"] = "APROVADO"
    elif validation_result["score"] >= 60:
        validation_result["status"] = "PARCIAL"
    else:
        validation_result["status"] = "REPROVADO"
    
    # Gerar recomendações
    validation_result["recommendations"] = generate_database_recommendations(validation_result)
    
    return validation_result

def validate_schema(database_design):
    """Valida schema do banco de dados"""
    score = 0
    details = {
        "tables_created": 0,
        "tables_with_pk": 0,
        "columns_typed": 0,
        "timestamps_added": 0,
        "naming_convention": 0
    }
    
    sections = database_design.get("sections", {})
    
    # Verificar seção de schema
    if "database_schema" in sections:
        schema_section = sections["database_schema"]
        
        # Verificar tabelas criadas
        if "tables" in schema_section:
            tables = schema_section["tables"]
            details["tables_created"] = len(tables)
            if len(tables) >= 3:
                score += 5
            
            # Verificar se tabelas têm PKs
            tables_with_pk = sum(1 for table in tables.values() if table.get("primary_key"))
            details["tables_with_pk"] = tables_with_pk
            if tables_with_pk == len(tables):
                score += 5
            
            # Verificar se colunas têm tipos
            total_columns = sum(len(table.get("columns", [])) for table in tables.values())
            typed_columns = sum(1 for table in tables.values() 
                              for col in table.get("columns", []) 
                              if col.get("type"))
            details["columns_typed"] = typed_columns
            if typed_columns >= total_columns * 0.8:
                score += 5
            
            # Verificar timestamps
            tables_with_timestamps = sum(1 for table in tables.values() 
                                     if any(col.get("name") in ["created_at", "updated_at"] 
                                        for col in table.get("columns", [])))
            details["timestamps_added"] = tables_with_timestamps
            if tables_with_timestamps >= len(tables) * 0.8:
                score += 5
            
            # Verificar convenção de nomenclatura
            tables_snake_case = sum(1 for table_name in tables.keys() if table_name == table_name.lower())
            details["naming_convention"] = tables_snake_case
            if tables_snake_case == len(tables):
                score += 5
    
    return {
        "score": score,
        "percentage": (score / 25) * 100,
        "details": details
    }

def validate_indexes(indexes):
    """Valida índices estratégicos"""
    score = 0
    details = {
        "primary_indexes": 0,
        "unique_indexes": 0,
        "composite_indexes": 0,
        "performance_indexes": 0,
        "index_coverage": 0
    }
    
    sections = indexes.get("sections", {})
    
    # Verificar seção de estratégia de índices
    if "index_strategy" in sections:
        strategy = sections["index_strategy"]
        if strategy.get("focus") == "Performance optimization":
            score += 5
    
    # Verificar tipos de índices
    if "primary_indexes" in sections:
        primary_indexes = sections["primary_indexes"]
        details["primary_indexes"] = len(primary_indexes)
        if len(primary_indexes) >= 3:
            score += 5
    
    if "unique_indexes" in sections:
        unique_indexes = sections["unique_indexes"]
        details["unique_indexes"] = len(unique_indexes)
        if len(unique_indexes) >= 2:
            score += 5
    
    if "composite_indexes" in sections:
        composite_indexes = sections["composite_indexes"]
        details["composite_indexes"] = len(composite_indexes)
        if len(composite_indexes) >= 2:
            score += 5
    
    if "performance_indexes" in sections:
        performance_indexes = sections["performance_indexes"]
        details["performance_indexes"] = len(performance_indexes)
        if len(performance_indexes) >= 3:
            score += 5
    
    # Calcular cobertura de índices
    total_indexes = (details["primary_indexes"] + details["unique_indexes"] + 
                     details["composite_indexes"] + details["performance_indexes"])
    if total_indexes > 0:
        details["index_coverage"] = 100
        score += 5
    
    return {
        "score": score,
        "percentage": (score / 20) * 100,
        "details": details
    }

def validate_migrations(migrations):
    """Valida estratégia de migrações"""
    score = 0
    details = {
        "zero_downtime": 0,
        "rollback_plan": 0,
        "testing_strategy": 0,
        "backup_strategy": 0,
        "tools_defined": 0
    }
    
    sections = migrations.get("sections", {})
    
    # Verificar seção de estratégia
    if "migration_strategy" in sections:
        strategy = sections["migration_strategy"]
        
        # Verificar zero-downtime
        if strategy.get("approach") == "Zero-downtime":
            details["zero_downtime"] = 1
            score += 5
        
        # Verificar plano de rollback
        if "rollback_plan" in sections:
            details["rollback_plan"] = 1
            score += 5
        
        # Verificar estratégia de teste
        if "testing" in strategy:
            details["testing_strategy"] = 1
            score += 5
        
        # Verificar estratégia de backup
        if strategy.get("backup_strategy") == "Automated":
            details["backup_strategy"] = 1
            score += 5
        
        # Verificar ferramentas definidas
        if "tools" in sections:
            details["tools_defined"] = 1
            score += 5
    
    return {
        "score": score,
        "percentage": (score / 20) * 100,
        "details": details
    }

def validate_constraints(constraints):
    """Valida constraints de integridade"""
    score = 0
    details = {
        "primary_keys": 0,
        "foreign_keys": 0,
        "unique_constraints": 0,
        "check_constraints": 0,
        "not_null": 0,
        "default_values": 0
    }
    
    sections = constraints.get("sections", {})
    
    # Verificar seção de constraints
    if "constraint_strategy" in sections:
        strategy = sections["constraint_strategy"]
        if strategy.get("focus") == "Data integrity":
            score += 5
    
    # Verificar tipos de constraints
    if "primary_keys" in sections:
        primary_keys = sections["primary_keys"]
        details["primary_keys"] = len(primary_keys)
        if len(primary_keys) >= 3:
            score += 5
    
    if "foreign_keys" in sections:
        foreign_keys = sections["foreign_keys"]
        details["foreign_keys"] = len(foreign_keys)
        if len(foreign_keys) >= 2:
            score += 5
    
    if "unique_constraints" in sections:
        unique_constraints = sections["unique_constraints"]
        details["unique_constraints"] = len(unique_constraints)
        if len(unique_constraints) >= 2:
            score += 5
    
    if "check_constraints" in sections:
        check_constraints = sections["check_constraints"]
        details["check_constraints"] = len(check_constraints)
        if len(check_constraints) >= 2:
            score += 5
    
    return {
        "score": score,
        "percentage": (score / 20) * 100,
        "details": details
    }

def validate_performance(database_design, indexes):
    """Valida performance do design"""
    score = 0
    details = {
        "performance_requirements": 0,
        "indexes_optimized": 0,
        "queries_analyzed": 0,
        "resource_usage": 0
    }
    
    # Verificar seção de performance
    if "performance" in database_design.get("sections", {}):
        performance = database_design["sections"]["performance"]
        details["performance_requirements"] = 1
        if performance.get("qps_target"):
            score += 3
        if performance.get("latency_target"):
            score += 2
    
    # Verificar se índices estão otimizados
    if indexes.get("details", {}).get("index_coverage", 0) >= 80:
        details["indexes_optimized"] = 1
        score += 5
    
    # Verificar se há métricas definidas
    if database_design.get("sections", {}).get("performance", {}).get("qps_target"):
        details["queries_analyzed"] = 1
        score += 2
    
    return {
        "score": score,
        "percentage": (score / 10) * 100,
        "details": details
    }

def validate_security(database_design):
    """Valida segurança do design"""
    score = 0
    details = {
        "authentication": 0,
        "authorization": 0,
        "encryption": 0,
        "audit_trail": 0,
        "data_protection": 0
    }
    
    # Verificar seção de segurança
    if "security" in database_design.get("sections", {}):
        security = database_design["sections"]["security"]
        
        # Verificar autenticação
        if security.get("authentication") == "JWT + bcrypt":
            details["authentication"] = 1
            score += 1
        
        # Verificar autorização
        if security.get("authorization") == "RBAC":
            details["authorization"] = 1
            score += 1
        
        # Verificar criptografia
        if security.get("encryption") == "AES-256":
            details["encryption"] = 1
            score += 1
        
        # Verificar auditoria
        if security.get("audit_trail") == "Enabled":
            details["audit_trail"] = 1
            score += 1
        # Verificar proteção de dados
        if security.get("data_protection") == "PII Protection":
            details["data_protection"] = 1
            score += 1
    
    return {
        "score": score,
        "percentage": (score / 5) * 100,
        "details": details
    }

def generate_database_recommendations(validation_result):
    """Gera recomendações baseadas nos resultados da validação"""
    recommendations = []
    
    # Recomendações para schema
    if validation_result["coverage"]["schema"] < 80:
        recommendations.append({
            "category": "Schema",
            "priority": "Alta",
            "description": "Completar schema com tabelas faltantes",
            "action": "Adicionar tabelas restantes do modelo de domínio"
        })
    
    # Recomendações para índices
    if validation_result["coverage"]["indexes"] < 80:
        recommendations.append({
            "category": "Índices",
            "priority": "Alta",
            "description": "Adicionar índices para queries principais",
            "action": "Analisar queries e adicionar índices otimizados"
        })
    
    # Recomendações para migrações
    if validation_result["coverage"]["migrations"] < 80:
        recommendations.append({
            "category": "Migrações",
            "priority": "Média",
            "description": "Completar estratégia de migrações",
            "action": "Definir plano de rollback e testes"
        })
    
    # Recomendações para constraints
    if validation_result["coverage"]["constraints"] < 80:
        recommendations.append({
            "category": "Constraints",
            "priority": "Média",
            "description": "Adicionar constraints de integridade",
            "action": "Implementar PKs, FKs e validações"
        })
    
    # Recomendações para performance
    if validation_result["coverage"]["performance"] < 80:
        recommendations.append({
            "category": "Performance",
            "priority": "Baixa",
            "description": "Otimizar performance do banco",
            "action": "Analisar queries e adicionar índices"
        })
    
    # Recomendações para segurança
    if validation_result["coverage"]["security"] < 80:
        recommendations.append({
            "category": "Segurança",
            "priority": "Alta",
            "description": "Implementar medidas de segurança",
            "action": "Adicionar autenticação e criptografia"
        })
    
    return recommendations

# Exemplo de uso
if __name__ == "__main__":
    artifacts_example = {
        "database_design": {
            "sections": {
                "database_schema": {
                    "tables": {
                        "users": {
                            "columns": [
                                {"name": "id", "type": "UUID", "nullable": False, "primary_key": True},
                                {"name": "email", "type": "VARCHAR(255)", "nullable": False},
                                {"name": "created_at", "type": "TIMESTAMP", "nullable": False}
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
                },
                "performance": {
                    "qps_target": 1000,
                    "latency_target": "50ms"
                },
                "security": {
                    "authentication": "JWT + bcrypt",
                    "authorization": "RBAC",
                    "encryption": "AES-256",
                    "audit_trail": "Enabled"
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
        }
    }
    
    result = validate_database_design(artifacts_example)
    print(result)
