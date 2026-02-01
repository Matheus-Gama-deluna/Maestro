"""
Função MCP de Inicialização - Especialista Modelagem de Domínio
Referência para implementação no servidor MCP
"""

def init_domain_modeling(context):
    """
    Inicializa estrutura base para Modelagem de Domínio
    
    Args:
        context (dict): Dicionário com informações do projeto
            - project_name: Nome do projeto
            - design_doc: Documento de design do UX
            - requirements: Requisitos funcionais
            - wireframes: Estrutura de wireframes
            - user_flows: Fluxos de usuário mapeados
            - ui_rules: Regras de UI identificadas
    
    Returns:
        dict: Estrutura inicial dos documentos de domínio
    """
    
    # Validar inputs obrigatórios
    required_fields = ['project_name', 'design_doc', 'requirements']
    for field in required_fields:
        if field not in context:
            raise ValueError(f"Campo obrigatório faltando: {field}")
    
    # Extrair entidades do design
    entities = extract_entities_from_design(context.get('design_doc', {}))
    
    # Extrair casos de uso dos requisitos
    use_cases = extract_use_cases_from_requirements(context.get('requirements', {}))
    
    # Criar estrutura base do modelo de domínio
    domain_model = {
        "title": f"{context['project_name']} - Modelo de Domínio",
        "sections": {
            "executive_summary": {
                "project": context['project_name'],
                "version": "1.0",
                "date": "2026-01-29",
                "status": "Em elaboração",
                "author": "Domain Architect",
                "approvers": ["Stakeholders"]
            },
            "domain_overview": {
                "context": "Contexto e propósito do sistema",
                "main_actors": "Atores principais identificados",
                "ubiquitous_language": "Termos consistentes do domínio"
            },
            "entities_and_aggregates": {
                "main_entities": entities,
                "aggregates": define_aggregates(entities),
                "value_objects": extract_value_objects(context.get('design_doc', {}))
            },
            "relationships": {
                "entity_relationships": define_relationships(entities),
                "cardinality": "1:1, 1:N, N:N mapping",
                "integrity_constraints": "Restrições de integridade"
            },
            "business_rules": {
                "entity_rules": extract_business_rules(context.get('requirements', {})),
                "invariants": "Invariantes críticos por entidade",
                "domain_validations": "Validações de domínio"
            },
            "use_cases": {
                "main_use_cases": use_cases,
                "pre_conditions": "Pré-condições por caso de uso",
                "post_conditions": "Pós-condições por caso de uso"
            }
        }
    }
    
    # Criar estrutura de entidades e relacionamentos
    entities_relationships = {
        "title": f"{context['project_name']} - Entidades e Relacionamentos",
        "sections": {
            "class_diagram": generate_plantuml_class_diagram(entities),
            "entity_details": generate_entity_details(entities),
            "relationship_matrix": generate_relationship_matrix(entities),
            "orm_mapping": generate_orm_mapping(entities)
        }
    }
    
    # Criar estrutura de casos de uso
    use_cases_doc = {
        "title": f"{context['project_name']} - Casos de Uso",
        "sections": {
            "use_case_list": generate_use_case_list(use_cases),
            "actor_mapping": generate_actor_mapping(use_cases),
            "requirement_traceability": generate_requirement_traceability(use_cases),
            "acceptance_criteria": generate_acceptance_criteria(use_cases)
        }
    }
    
    # Criar estrutura de arquitetura C4
    c4_architecture = {
        "title": f"{context['project_name']} - Arquitetura C4",
        "sections": {
            "level1_context": generate_c4_level1(context),
            "level2_containers": generate_c4_level2(context),
            "level3_components": generate_c4_level3(entities),
            "technical_decisions": generate_technical_decisions(context)
        }
    }
    
    # Retornar estrutura completa
    return {
        "status": "SUCCESS",
        "message": "Estrutura de domínio criada com sucesso",
        "artifacts": {
            "domain_model": domain_model,
            "entities_relationships": entities_relationships,
            "use_cases": use_cases_doc,
            "c4_architecture": c4_architecture
        },
        "next_steps": [
            "Refinar entidades identificadas",
            "Definir relacionamentos detalhados",
            "Documentar regras de negócio",
            "Validar casos de uso",
            "Aprovar arquitetura proposta"
        ],
        "metadata": {
            "created_at": "2026-01-29",
            "entities_count": len(entities),
            "use_cases_count": len(use_cases),
            "estimated_time": "60 minutos",
            "complexity": calculate_complexity(entities, use_cases)
        }
    }

def extract_entities_from_design(design_doc):
    """Extrai entidades do documento de design"""
    entities = []
    
    # Extrair entidades de wireframes
    if 'wireframes' in design_doc:
        for screen in design_doc['wireframes'].get('screens', []):
            if 'forms' in screen:
                for form in screen['forms']:
                    if 'entity' in form:
                        entities.append({
                            "name": form['entity'],
                            "type": "entity",
                            "source": f"wireframe:{screen.get('name', 'unknown')}",
                            "attributes": form.get('fields', [])
                        })
            
            if 'lists' in screen:
                for list_item in screen['lists']:
                    if 'entity' in list_item:
                        entities.append({
                            "name": list_item['entity'],
                            "type": "entity",
                            "source": f"wireframe:{screen.get('name', 'unknown')}",
                            "attributes": list_item.get('columns', [])
                        })
    
    # Adicionar entidades comuns se não encontradas
    common_entities = ["User", "Product", "Order", "Category", "Profile", "Session"]
    for entity in common_entities:
        if not any(e["name"] == entity for e in entities):
            entities.append({
                "name": entity,
                "type": "entity",
                "source": "common_pattern",
                "attributes": ["id", "name", "created_at", "updated_at"]
            })
    
    return entities

def extract_use_cases_from_requirements(requirements):
    """Extrai casos de uso dos requisitos"""
    use_cases = []
    
    if 'functional_requirements' in requirements:
        for req in requirements['functional_requirements']:
            use_cases.append({
                "id": req.get('id', 'UC-001'),
                "name": req.get('name', 'Caso de Uso'),
                "description": req.get('description', ''),
                "priority": req.get('priority', 'Média'),
                "actor": req.get('actor', 'User'),
                "source": "requirements"
            })
    
    # Adicionar casos de uso comuns
    common_use_cases = [
        {"id": "UC-001", "name": "Login", "actor": "User", "priority": "Alta"},
        {"id": "UC-002", "name": "Logout", "actor": "User", "priority": "Alta"},
        {"id": "UC-003", "name": "Cadastro", "actor": "User", "priority": "Média"},
        {"id": "UC-004", "name": "Consulta", "actor": "User", "priority": "Média"}
    ]
    
    for uc in common_use_cases:
        if not any(u["id"] == uc["id"] for u in use_cases):
            use_cases.append(uc)
    
    return use_cases

def define_aggregates(entities):
    """Define agregados baseado nas entidades"""
    # Lógica simples para agrupar entidades relacionadas
    aggregates = []
    
    # Agregado de User
    user_entities = [e for e in entities if e["name"] in ["User", "Profile", "Session"]]
    if user_entities:
        aggregates.append({
            "name": "UserAggregate",
            "root": "User",
            "entities": [e["name"] for e in user_entities]
        })
    
    # Agregado de Product
    product_entities = [e for e in entities if e["name"] in ["Product", "Category"]]
    if product_entities:
        aggregates.append({
            "name": "ProductAggregate",
            "root": "Product",
            "entities": [e["name"] for e in product_entities]
        })
    
    # Agregado de Order
    order_entities = [e for e in entities if e["name"] in ["Order"]]
    if order_entities:
        aggregates.append({
            "name": "OrderAggregate",
            "root": "Order",
            "entities": [e["name"] for e in order_entities]
        })
    
    return aggregates

def extract_value_objects(design_doc):
    """Extrai value objects do design"""
    value_objects = [
        {"name": "Money", "description": "Representação de valores monetários"},
        {"name": "Email", "description": "Endereço de e-mail validado"},
        {"name": "Address", "description": "Endereço completo"},
        {"name": "Phone", "description": "Número de telefone"},
        {"name": "Date", "description": "Data com validação"}
    ]
    
    return value_objects

def define_relationships(entities):
    """Define relacionamentos entre entidades"""
    relationships = []
    
    # Relacionamentos comuns
    common_relationships = [
        {"from": "User", "to": "Order", "type": "1:N", "description": "Usuário tem múltiplos pedidos"},
        {"from": "Order", "to": "Product", "type": "N:N", "description": "Pedido contém múltiplos produtos"},
        {"from": "Product", "to": "Category", "type": "N:1", "description": "Produto pertence a uma categoria"},
        {"from": "User", "to": "Profile", "type": "1:1", "description": "Usuário tem um perfil"}
    ]
    
    for rel in common_relationships:
        if any(e["name"] == rel["from"] for e in entities) and \
           any(e["name"] == rel["to"] for e in entities):
            relationships.append(rel)
    
    return relationships

def extract_business_rules(requirements):
    """Extrai regras de negócio dos requisitos"""
    rules = [
        {"entity": "User", "rule": "Email deve ser único", "type": "validation"},
        {"entity": "User", "rule": "Senha deve ter mínimo 8 caracteres", "type": "validation"},
        {"entity": "Order", "rule": "Pedido deve ter pelo menos um item", "type": "business"},
        {"entity": "Product", "rule": "Produto deve ter preço positivo", "type": "business"}
    ]
    
    return rules

def generate_plantuml_class_diagram(entities):
    """Gera diagrama PlantUML das entidades"""
    plantuml = "@startuml\n"
    
    for entity in entities:
        plantuml += f"class {entity['name']} {{\n"
        for attr in entity.get('attributes', []):
            plantuml += f"  - {attr}\n"
        plantuml += "}\n\n"
    
    # Adicionar relacionamentos básicos
    plantuml += "User \"1\" -- \"*\" Order : has\n"
    plantuml += "Order \"*\" -- \"*\" Product : contains\n"
    plantuml += "Product \"*\" -- \"1\" Category : belongs_to\n"
    
    plantuml += "@endumuml"
    
    return plantuml

def generate_entity_details(entities):
    """Gera detalhes das entidades"""
    details = {}
    
    for entity in entities:
        details[entity['name']] = {
            "attributes": entity.get('attributes', []),
            "type": entity.get('type', 'entity'),
            "source": entity.get('source', 'unknown')
        }
    
    return details

def generate_relationship_matrix(entities):
    """Gera matriz de relacionamentos"""
    matrix = {}
    
    for entity in entities:
        matrix[entity['name']] = {
            "relationships": [],
            "dependencies": []
        }
    
    return matrix

def generate_orm_mapping(entities):
    """Gera mapeamento ORM"""
    mapping = {}
    
    for entity in entities:
        mapping[entity['name']] = {
            "table": entity['name'].lower() + "s",
            "primary_key": "id",
            "columns": entity.get('attributes', [])
        }
    
    return mapping

def generate_use_case_list(use_cases):
    """Gera lista de casos de uso"""
    return {
        "total": len(use_cases),
        "by_priority": {
            "Alta": [uc for uc in use_cases if uc.get('priority') == 'Alta'],
            "Média": [uc for uc in use_cases if uc.get('priority') == 'Média'],
            "Baixa": [uc for uc in use_cases if uc.get('priority') == 'Baixa']
        },
        "by_actor": group_by_actor(use_cases)
    }

def group_by_actor(use_cases):
    """Agrupa casos de uso por ator"""
    grouped = {}
    
    for uc in use_cases:
        actor = uc.get('actor', 'Unknown')
        if actor not in grouped:
            grouped[actor] = []
        grouped[actor].append(uc)
    
    return grouped

def generate_actor_mapping(use_cases):
    """Gera mapeamento de atores"""
    actors = set()
    
    for uc in use_cases:
        actors.add(uc.get('actor', 'User'))
    
    return {
        "actors": list(actors),
        "mapping": {actor: [] for actor in actors}
    }

def generate_requirement_traceability(use_cases):
    """Gera rastreabilidade de requisitos"""
    traceability = {}
    
    for uc in use_cases:
        traceability[uc['id']] = {
            "name": uc['name'],
            "requirements": [],
            "source": uc.get('source', 'unknown')
        }
    
    return traceability

def generate_acceptance_criteria(use_cases):
    """Gera critérios de aceite"""
    criteria = {}
    
    for uc in use_cases:
        criteria[uc['id']] = {
            "given": f"Dado que {uc.get('actor', 'User')} está logado",
            "when": f"Quando {uc['name'].lower()}",
            "then": f"Então {uc['name'].lower()} deve ser executado com sucesso"
        }
    
    return criteria

def generate_c4_level1(context):
    """Gera diagrama C4 nível 1"""
    return {
        "system": context['project_name'],
        "description": "Sistema principal",
        "actors": ["User", "Admin"],
        "external_systems": []
    }

def generate_c4_level2(context):
    """Gera diagrama C4 nível 2"""
    return {
        "containers": [
            {"name": "Frontend", "type": "SPA", "technology": "React"},
            {"name": "Backend", "type": "API", "technology": "Node.js"},
            {"name": "Database", "type": "Database", "technology": "PostgreSQL"}
        ]
    }

def generate_c4_level3(entities):
    """Gera diagrama C4 nível 3"""
    components = []
    
    for entity in entities:
        components.append({
            "name": f"{entity['name']}Service",
            "type": "Service",
            "responsibility": f"Manage {entity['name']} entities"
        })
    
    return {"components": components}

def generate_technical_decisions(context):
    """Gera decisões técnicas"""
    return {
        "architecture": "Microservices",
        "database": "PostgreSQL",
        "frontend": "React",
        "backend": "Node.js",
        "communication": "REST API"
    }

def calculate_complexity(entities, use_cases):
    """Calcula complexidade do modelo"""
    entity_complexity = len(entities) * 2
    use_case_complexity = len(use_cases) * 1
    relationship_complexity = len(entities) * 1.5
    
    total = entity_complexity + use_case_complexity + relationship_complexity
    
    if total < 10:
        return "Baixa"
    elif total < 20:
        return "Média"
    else:
        return "Alta"

# Exemplo de uso
if __name__ == "__main__":
    context_example = {
        "project_name": "E-commerce Platform",
        "design_doc": {
            "wireframes": {
                "screens": [
                    {
                        "name": "login",
                        "forms": [
                            {"entity": "User", "fields": ["email", "password"]}
                        ]
                    }
                ]
            }
        },
        "requirements": {
            "functional_requirements": [
                {"id": "RF-001", "name": "Login", "description": "Usuário faz login"}
            ]
        }
    }
    
    result = init_domain_modeling(context_example)
    print(result)
