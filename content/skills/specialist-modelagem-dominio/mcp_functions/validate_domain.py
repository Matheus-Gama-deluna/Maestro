"""
Função MCP de Validação - Especialista Modelagem de Domínio
Referência para implementação no servidor MCP
"""

def validate_domain_modeling(artifacts):
    """
    Valida qualidade dos documentos de Modelagem de Domínio
    
    Args:
        artifacts (dict): Dicionário com documentos gerados
            - domain_model: Modelo de domínio completo
            - entities_relationships: Diagrama de entidades
            - use_cases: Casos de uso mapeados
            - c4_architecture: Arquitetura inicial C4
            - validation_result: Resultado da validação
    
    Returns:
        dict: Resultado da validação com score
    """
    
    # Validar inputs
    required_artifacts = ['domain_model', 'entities_relationships', 'use_cases', 'c4_architecture']
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
    
    # 1. Validar Entidades (25 pontos)
    entities_score = validate_entities(artifacts['domain_model'])
    validation_result["coverage"]["entities"] = entities_score["percentage"]
    validation_result["details"]["entities"] = entities_score["details"]
    validation_result["score"] += entities_score["score"]
    
    # 2. Validar Relacionamentos (20 pontos)
    relationships_score = validate_relationships(artifacts['entities_relationships'])
    validation_result["coverage"]["relationships"] = relationships_score["percentage"]
    validation_result["details"]["relationships"] = relationships_score["details"]
    validation_result["score"] += relationships_score["score"]
    
    # 3. Validar Regras de Negócio (20 pontos)
    business_rules_score = validate_business_rules(artifacts['domain_model'])
    validation_result["coverage"]["business_rules"] = business_rules_score["percentage"]
    validation_result["details"]["business_rules"] = business_rules_score["details"]
    validation_result["score"] += business_rules_score["score"]
    
    # 4. Validar Casos de Uso (15 pontos)
    use_cases_score = validate_use_cases(artifacts['use_cases'])
    validation_result["coverage"]["use_cases"] = use_cases_score["percentage"]
    validation_result["details"]["use_cases"] = use_cases_score["details"]
    validation_result["score"] += use_cases_score["score"]
    
    # 5. Validar Arquitetura C4 (10 pontos)
    c4_score = validate_c4_architecture(artifacts['c4_architecture'])
    validation_result["coverage"]["c4_architecture"] = c4_score["percentage"]
    validation_result["details"]["c4_architecture"] = c4_score["details"]
    validation_result["score"] += c4_score["score"]
    
    # 6. Validar Linguagem Ubíqua (10 pontos)
    ubiquitous_language_score = validate_ubiquitous_language(artifacts['domain_model'])
    validation_result["coverage"]["ubiquitous_language"] = ubiquitous_language_score["percentage"]
    validation_result["details"]["ubiquitous_language"] = ubiquitous_language_score["details"]
    validation_result["score"] += ubiquitous_language_score["score"]
    
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
    validation_result["recommendations"] = generate_recommendations(validation_result)
    
    return validation_result

def validate_entities(domain_model):
    """Valida entidades do modelo de domínio"""
    score = 0
    details = {
        "entities_identified": 0,
        "entities_with_attributes": 0,
        "entities_with_behavior": 0,
        "aggregates_defined": 0,
        "value_objects_identified": 0
    }
    
    sections = domain_model.get("sections", {})
    
    # Verificar entidades identificadas
    if "entities_and_aggregates" in sections:
        entities_section = sections["entities_and_aggregates"]
        if "main_entities" in entities_section:
            entities = entities_section["main_entities"]
            details["entities_identified"] = len(entities)
            if len(entities) >= 3:
                score += 5
            
            # Verificar entidades com atributos
            entities_with_attrs = sum(1 for e in entities if e.get("attributes"))
            details["entities_with_attributes"] = entities_with_attrs
            if entities_with_attrs >= len(entities) * 0.8:
                score += 5
            
            # Verificar entidades com comportamento
            entities_with_behavior = sum(1 for e in entities if e.get("behaviors"))
            details["entities_with_behavior"] = entities_with_behavior
            if entities_with_behavior >= len(entities) * 0.6:
                score += 5
        
        # Verificar agregados definidos
        if "aggregates" in entities_section:
            aggregates = entities_section["aggregates"]
            details["aggregates_defined"] = len(aggregates)
            if len(aggregates) >= 2:
                score += 5
        
        # Verificar value objects
        if "value_objects" in entities_section:
            value_objects = entities_section["value_objects"]
            details["value_objects_identified"] = len(value_objects)
            if len(value_objects) >= 3:
                score += 5
    
    return {
        "score": score,
        "percentage": (score / 25) * 100,
        "details": details
    }

def validate_relationships(entities_relationships):
    """Valida relacionamentos entre entidades"""
    score = 0
    details = {
        "relationships_defined": 0,
        "cardinality_specified": 0,
        "integrity_constraints": 0,
        "orm_mapping": 0,
        "relationship_matrix": 0
    }
    
    sections = entities_relationships.get("sections", {})
    
    # Verificar relacionamentos definidos
    if "class_diagram" in sections:
        diagram = sections["class_diagram"]
        # Contar relacionamentos no diagrama PlantUML
        relationship_count = diagram.count("--")
        details["relationships_defined"] = relationship_count
        if relationship_count >= 3:
            score += 5
    
    # Verificar cardinalidade especificada
    if "entity_details" in sections:
        entity_details = sections["entity_details"]
        # Verificar se há informações de relacionamentos
        has_relationships = any("relationships" in details for details in entity_details.values())
        details["cardinality_specified"] = 1 if has_relationships else 0
        if has_relationships:
            score += 5
    
    # Verificar restrições de integridade
    if "orm_mapping" in sections:
        orm_mapping = sections["orm_mapping"]
        has_constraints = any("constraints" in mapping for mapping in orm_mapping.values())
        details["integrity_constraints"] = 1 if has_constraints else 0
        if has_constraints:
            score += 5
    
    # Verificar mapeamento ORM
    if "orm_mapping" in sections:
        orm_mapping = sections["orm_mapping"]
        details["orm_mapping"] = len(orm_mapping)
        if len(orm_mapping) >= 3:
            score += 5
    
    return {
        "score": score,
        "percentage": (score / 20) * 100,
        "details": details
    }

def validate_business_rules(domain_model):
    """Valida regras de negócio"""
    score = 0
    details = {
        "rules_identified": 0,
        "rules_by_entity": 0,
        "invariants_defined": 0,
        "domain_validations": 0,
        "rule_documentation": 0
    }
    
    sections = domain_model.get("sections", {})
    
    # Verificar regras identificadas
    if "business_rules" in sections:
        rules_section = sections["business_rules"]
        
        if "entity_rules" in rules_section:
            rules = rules_section["entity_rules"]
            details["rules_identified"] = len(rules)
            if len(rules) >= 4:
                score += 5
            
            # Verificar regras por entidade
            rules_by_entity = len(set(rule.get("entity", "") for rule in rules))
            details["rules_by_entity"] = rules_by_entity
            if rules_by_entity >= 2:
                score += 5
        
        # Verificar invariantes
        if "invariants" in rules_section:
            invariants = rules_section["invariants"]
            details["invariants_defined"] = len(invariants) if isinstance(invariants, list) else 1
            if details["invariants_defined"] >= 2:
                score += 5
        
        # Verificar validações de domínio
        if "domain_validations" in rules_section:
            validations = rules_section["domain_validations"]
            details["domain_validations"] = len(validations) if isinstance(validations, list) else 1
            if details["domain_validations"] >= 2:
                score += 5
    
    return {
        "score": score,
        "percentage": (score / 20) * 100,
        "details": details
    }

def validate_use_cases(use_cases):
    """Valida casos de uso"""
    score = 0
    details = {
        "use_cases_identified": 0,
        "actors_mapped": 0,
        "requirements_traceability": 0,
        "acceptance_criteria": 0,
        "priority_classification": 0
    }
    
    sections = use_cases.get("sections", {})
    
    # Verificar casos de uso identificados
    if "use_case_list" in sections:
        use_case_list = sections["use_case_list"]
        total_use_cases = use_case_list.get("total", 0)
        details["use_cases_identified"] = total_use_cases
        if total_use_cases >= 4:
            score += 3
    
    # Verificar atores mapeados
    if "actor_mapping" in sections:
        actor_mapping = sections["actor_mapping"]
        actors = actor_mapping.get("actors", [])
        details["actors_mapped"] = len(actors)
        if len(actors) >= 2:
            score += 3
    
    # Verificar rastreabilidade de requisitos
    if "requirement_traceability" in sections:
        traceability = sections["requirement_traceability"]
        details["requirements_traceability"] = len(traceability)
        if len(traceability) >= 3:
            score += 3
    
    # Verificar critérios de aceite
    if "acceptance_criteria" in sections:
        acceptance_criteria = sections["acceptance_criteria"]
        details["acceptance_criteria"] = len(acceptance_criteria)
        if len(acceptance_criteria) >= 3:
            score += 3
    
    # Verificar classificação de prioridade
    if "use_case_list" in sections:
        by_priority = use_case_list.get("by_priority", {})
        has_priorities = any(len(cases) > 0 for cases in by_priority.values())
        details["priority_classification"] = 1 if has_priorities else 0
        if has_priorities:
            score += 3
    
    return {
        "score": score,
        "percentage": (score / 15) * 100,
        "details": details
    }

def validate_c4_architecture(c4_architecture):
    """Valida arquitetura C4"""
    score = 0
    details = {
        "level1_context": 0,
        "level2_containers": 0,
        "level3_components": 0,
        "technical_decisions": 0,
        "architecture_consistency": 0
    }
    
    sections = c4_architecture.get("sections", {})
    
    # Verificar nível 1 - Contexto
    if "level1_context" in sections:
        level1 = sections["level1_context"]
        if "system" in level1 and "actors" in level1:
            details["level1_context"] = 1
            score += 2
    
    # Verificar nível 2 - Containers
    if "level2_containers" in sections:
        level2 = sections["level2_containers"]
        containers = level2.get("containers", [])
        details["level2_containers"] = len(containers)
        if len(containers) >= 3:
            score += 2
    
    # Verificar nível 3 - Componentes
    if "level3_components" in sections:
        level3 = sections["level3_components"]
        components = level3.get("components", [])
        details["level3_components"] = len(components)
        if len(components) >= 3:
            score += 2
    
    # Verificar decisões técnicas
    if "technical_decisions" in sections:
        tech_decisions = sections["technical_decisions"]
        details["technical_decisions"] = len(tech_decisions)
        if len(tech_decisions) >= 4:
            score += 2
    
    # Verificar consistência da arquitetura
    has_all_levels = all(key in sections for key in ["level1_context", "level2_containers", "level3_components"])
    details["architecture_consistency"] = 1 if has_all_levels else 0
    if has_all_levels:
        score += 2
    
    return {
        "score": score,
        "percentage": (score / 10) * 100,
        "details": details
    }

def validate_ubiquitous_language(domain_model):
    """Valida linguagem ubíqua"""
    score = 0
    details = {
        "domain_terms": 0,
        "consistent_naming": 0,
        "business_concepts": 0,
        "technical_jargon": 0,
        "glossary_defined": 0
    }
    
    sections = domain_model.get("sections", {})
    
    # Verificar termos do domínio
    if "domain_overview" in sections:
        domain_overview = sections["domain_overview"]
        if "ubiquitous_language" in domain_overview:
            details["domain_terms"] = 1
            score += 2
    
    # Verificar nomenclatura consistente
    if "entities_and_aggregates" in sections:
        entities_section = sections["entities_and_aggregates"]
        if "main_entities" in entities_section:
            entities = entities_section["main_entities"]
            # Verificar se nomes são consistentes (camelCase, etc.)
            consistent_names = all(is_valid_entity_name(e.get("name", "")) for e in entities)
            details["consistent_naming"] = 1 if consistent_names else 0
            if consistent_names:
                score += 2
    
    # Verificar conceitos de negócio
    if "domain_overview" in sections:
        domain_overview = sections["domain_overview"]
        if "main_actors" in domain_overview:
            details["business_concepts"] = 1
            score += 2
    
    # Verificar ausência de jargões técnicos
    # (Simplificado - na prática seria mais complexo)
    has_business_terms = True  # Assumir que tem termos de negócio
    details["technical_jargon"] = 1 if has_business_terms else 0
    if has_business_terms:
        score += 2
    
    # Verificar glossário definido
    # (Simplificado - verificaria se há seção de glossário)
    has_glossary = "glossary" in domain_model or "terms" in domain_model
    details["glossary_defined"] = 1 if has_glossary else 0
    if has_glossary:
        score += 2
    
    return {
        "score": score,
        "percentage": (score / 10) * 100,
        "details": details
    }

def is_valid_entity_name(name):
    """Verifica se nome de entidade segue convenção"""
    if not name:
        return False
    
    # Verificar se começa com maiúscula e não tem underscores
    return name[0].isupper() and "_" not in name

def generate_recommendations(validation_result):
    """Gera recomendações baseadas nos resultados da validação"""
    recommendations = []
    
    # Recomendações para entidades
    if validation_result["coverage"]["entities"] < 80:
        recommendations.append({
            "category": "Entidades",
            "priority": "Alta",
            "description": "Identificar mais entidades do domínio",
            "action": "Analisar requisitos e design para encontrar entidades faltantes"
        })
    
    # Recomendações para relacionamentos
    if validation_result["coverage"]["relationships"] < 80:
        recommendations.append({
            "category": "Relacionamentos",
            "priority": "Alta",
            "description": "Definir relacionamentos entre entidades",
            "action": "Mapear cardinalidade e restrições de integridade"
        })
    
    # Recomendações para regras de negócio
    if validation_result["coverage"]["business_rules"] < 80:
        recommendations.append({
            "category": "Regras de Negócio",
            "priority": "Média",
            "description": "Documentar regras de negócio por entidade",
            "action": "Extrair regras dos requisitos e validar com stakeholders"
        })
    
    # Recomendações para casos de uso
    if validation_result["coverage"]["use_cases"] < 80:
        recommendations.append({
            "category": "Casos de Uso",
            "priority": "Média",
            "description": "Completar mapeamento de casos de uso",
            "action": "Definir fluxos principais e alternativos"
        })
    
    # Recomendações para arquitetura
    if validation_result["coverage"]["c4_architecture"] < 80:
        recommendations.append({
            "category": "Arquitetura",
            "priority": "Baixa",
            "description": "Refinar arquitetura C4",
            "action": "Adicionar mais detalhes aos níveis 2 e 3"
        })
    
    # Recomendações para linguagem ubíqua
    if validation_result["coverage"]["ubiquitous_language"] < 80:
        recommendations.append({
            "category": "Linguagem Ubíqua",
            "priority": "Baixa",
            "description": "Melhorar consistência de termos",
            "action": "Criar glossário e revisar nomenclatura"
        })
    
    return recommendations

# Exemplo de uso
if __name__ == "__main__":
    artifacts_example = {
        "domain_model": {
            "sections": {
                "entities_and_aggregates": {
                    "main_entities": [
                        {"name": "User", "attributes": ["id", "name"]},
                        {"name": "Product", "attributes": ["id", "price"]}
                    ],
                    "aggregates": [
                        {"name": "UserAggregate", "root": "User"}
                    ],
                    "value_objects": [
                        {"name": "Money"}
                    ]
                },
                "business_rules": {
                    "entity_rules": [
                        {"entity": "User", "rule": "Email único"}
                    ]
                },
                "domain_overview": {
                    "ubiquitous_language": "Termos consistentes",
                    "main_actors": ["User", "Admin"]
                }
            }
        },
        "entities_relationships": {
            "sections": {
                "class_diagram": "@startuml\nclass User\nclass Product\nUser \"1\" -- \"*\" Product\n@enduml",
                "orm_mapping": {
                    "User": {"table": "users"},
                    "Product": {"table": "products"}
                }
            }
        },
        "use_cases": {
            "sections": {
                "use_case_list": {
                    "total": 4,
                    "by_priority": {
                        "Alta": [{"id": "UC-001", "name": "Login"}],
                        "Média": [{"id": "UC-002", "name": "Cadastro"}]
                    }
                },
                "actor_mapping": {
                    "actors": ["User", "Admin"]
                },
                "requirement_traceability": {
                    "UC-001": {"name": "Login"},
                    "UC-002": {"name": "Cadastro"}
                },
                "acceptance_criteria": {
                    "UC-001": {"given": "User logged in", "when": "Login", "then": "Success"}
                }
            }
        },
        "c4_architecture": {
            "sections": {
                "level1_context": {
                    "system": "E-commerce",
                    "actors": ["User", "Admin"]
                },
                "level2_containers": {
                    "containers": [
                        {"name": "Frontend"},
                        {"name": "Backend"},
                        {"name": "Database"}
                    ]
                },
                "level3_components": {
                    "components": [
                        {"name": "UserService"},
                        {"name": "ProductService"}
                    ]
                },
                "technical_decisions": {
                    "architecture": "Microservices",
                    "database": "PostgreSQL"
                }
            }
        }
    }
    
    result = validate_domain_modeling(artifacts_example)
    print(result)
