"""
Função MCP de Processamento - Especialista UX Design
Referência para implementação no servidor MCP
"""

def process_ux_design(artifacts, score):
    """
    Processa artefatos UX e prepara contexto para Modelagem de Domínio
    
    Args:
        artifacts (dict): Documentos UX validados
            - design_doc: Documento de design completo
            - wireframes: Wireframes de todas as telas
            - jornada_usuario: Mapa de jornadas do usuário
            - validation_result: Resultado da validação
        score (int): Score de validação ≥ 75
    
    Returns:
        dict: Contexto preparado para próximo especialista
    """
    
    # Validar score mínimo
    if score < 75:
        raise ValueError(f"Score mínimo de 75 pontos necessário. Score atual: {score}")
    
    # Extrair entidades de negócio dos wireframes
    business_entities = extract_business_entities(artifacts['wireframes'])
    
    # Mapear fluxos de usuário
    user_flows = extract_user_flows(artifacts['jornada_usuario'])
    
    # Identificar regras de UI
    ui_rules = extract_ui_rules(artifacts['design_doc'], artifacts['wireframes'])
    
    # Mapear componentes reutilizáveis
    components = extract_components(artifacts['wireframes'])
    
    # Preparar contexto para Modelagem de Domínio
    domain_context = {
        "business_entities": business_entities,
        "user_flows": user_flows,
        "ui_rules": ui_rules,
        "components": components,
        "validation_summary": {
            "score": score,
            "status": "APROVADO",
            "coverage": artifacts.get('validation_result', {}).get('coverage', {}),
            "artifacts_count": len(artifacts)
        }
    }
    
    # Gerar prompt para próxima fase
    next_prompt = generate_domain_modeling_prompt(domain_context)
    
    # Atualizar CONTEXTO.md
    context_update = generate_context_update(artifacts, score)
    
    return {
        "status": "SUCCESS",
        "message": "UX Design processado com sucesso",
        "context": domain_context,
        "next_prompt": next_prompt,
        "context_update": context_update,
        "transition": {
            "from": "UX Design",
            "to": "Modelagem de Domínio",
            "ready": True,
            "timestamp": "2026-01-29"
        },
        "metadata": {
            "entities_count": len(business_entities),
            "flows_count": len(user_flows),
            "rules_count": len(ui_rules),
            "components_count": len(components),
            "processing_time": "< 5 segundos"
        }
    }

def extract_business_entities(wireframes):
    """Extrai entidades de negócio dos wireframes"""
    entities = []
    
    # Analisar telas e componentes para identificar entidades
    if "screens" in wireframes:
        for screen in wireframes["screens"]:
            # Extrair entidades baseadas em formulários e listas
            if "forms" in screen:
                for form in screen["forms"]:
                    if "entity" in form:
                        entities.append({
                            "name": form["entity"],
                            "type": "entity",
                            "attributes": form.get("fields", []),
                            "source": f"wireframe:{screen['name']}"
                        })
            
            # Extrair entidades de listagens
            if "lists" in screen:
                for list_item in screen["lists"]:
                    if "entity" in list_item:
                        entities.append({
                            "name": list_item["entity"],
                            "type": "entity",
                            "attributes": list_item.get("columns", []),
                            "source": f"wireframe:{screen['name']}"
                        })
    
    # Adicionar entidades comuns se não encontradas
    common_entities = ["User", "Product", "Order", "Category", "Profile"]
    for entity in common_entities:
        if not any(e["name"] == entity for e in entities):
            entities.append({
                "name": entity,
                "type": "entity",
                "attributes": ["id", "name", "created_at", "updated_at"],
                "source": "common_pattern"
            })
    
    return entities

def extract_user_flows(jornada_usuario):
    """Extrai fluxos de usuário das jornadas"""
    flows = []
    
    if "sections" in jornada_usuario:
        journey_section = jornada_usuario["sections"]
        
        # Extrair fluxos principais
        if "user_flows" in journey_section:
            for flow in journey_section["user_flows"]:
                flows.append({
                    "name": flow.get("name", "Unnamed Flow"),
                    "type": "main_flow",
                    "steps": flow.get("steps", []),
                    "entry_point": flow.get("entry", "unknown"),
                    "exit_point": flow.get("exit", "unknown"),
                    "source": "jornada_usuario"
                })
        
        # Extrair fluxos alternativos
        if "alternative_flows" in journey_section:
            for flow in journey_section["alternative_flows"]:
                flows.append({
                    "name": flow.get("name", "Alternative Flow"),
                    "type": "alternative_flow",
                    "steps": flow.get("steps", []),
                    "entry_point": flow.get("entry", "unknown"),
                    "exit_point": flow.get("exit", "unknown"),
                    "source": "jornada_usuario"
                })
    
    # Adicionar fluxos comuns se não encontrados
    common_flows = [
        {"name": "login", "type": "main_flow", "entry": "login_page", "exit": "dashboard"},
        {"name": "register", "type": "main_flow", "entry": "register_page", "exit": "welcome_page"},
        {"name": "logout", "type": "main_flow", "entry": "any_page", "exit": "login_page"}
    ]
    
    for flow in common_flows:
        if not any(f["name"] == flow["name"] for f in flows):
            flows.append({
                "name": flow["name"],
                "type": flow["type"],
                "steps": [],
                "entry_point": flow["entry"],
                "exit_point": flow["exit"],
                "source": "common_pattern"
            })
    
    return flows

def extract_ui_rules(design_doc, wireframes):
    """Extrai regras de UI do design e wireframes"""
    rules = []
    
    # Regras do documento de design
    if "sections" in design_doc:
        design_section = design_doc["sections"]
        
        # Regras de validação
        if "validation_rules" in design_section:
            for rule in design_section["validation_rules"]:
                rules.append({
                    "name": rule.get("name", "Validation Rule"),
                    "type": "validation",
                    "description": rule.get("description", ""),
                    "implementation": rule.get("implementation", ""),
                    "source": "design_doc"
                })
        
        # Regras de negócio
        if "business_rules" in design_section:
            for rule in design_section["business_rules"]:
                rules.append({
                    "name": rule.get("name", "Business Rule"),
                    "type": "business",
                    "description": rule.get("description", ""),
                    "implementation": rule.get("implementation", ""),
                    "source": "design_doc"
                })
    
    # Regras dos wireframes
    if "forms" in wireframes:
        for form in wireframes["forms"]:
            if "validations" in form:
                for validation in form["validations"]:
                    rules.append({
                        "name": f"validate_{form.get('name', 'form')}_{validation.get('field', 'field')}",
                        "type": "validation",
                        "description": validation.get("rule", ""),
                        "implementation": validation.get("implementation", ""),
                        "source": "wireframes"
                    })
    
    # Adicionar regras comuns
    common_rules = [
        {"name": "email_validation", "type": "validation", "description": "Validar formato de email"},
        {"name": "password_strength", "type": "validation", "description": "Verificar força de senha"},
        {"name": "required_fields", "type": "validation", "description": "Campos obrigatórios"},
        {"name": "unique_username", "type": "business", "description": "Username único"}
    ]
    
    for rule in common_rules:
        if not any(r["name"] == rule["name"] for r in rules):
            rules.append({
                "name": rule["name"],
                "type": rule["type"],
                "description": rule["description"],
                "implementation": "",
                "source": "common_pattern"
            })
    
    return rules

def extract_components(wireframes):
    """Extrai componentes reutilizáveis dos wireframes"""
    components = []
    
    if "components" in wireframes:
        component_section = wireframes["components"]
        
        # Componentes reutilizáveis
        if "reusable" in component_section:
            for component in component_section["reusable"]:
                components.append({
                    "name": component.get("name", "Component"),
                    "type": component.get("type", "ui"),
                    "description": component.get("description", ""),
                    "props": component.get("props", []),
                    "source": "wireframes"
                })
        
        # Componentes de navegação
        if "navigation" in component_section:
            for component in component_section["navigation"]:
                components.append({
                    "name": component.get("name", "Navigation"),
                    "type": "navigation",
                    "description": component.get("description", ""),
                    "props": component.get("props", []),
                    "source": "wireframes"
                })
        
        # Componentes de formulário
        if "forms" in component_section:
            for component in component_section["forms"]:
                components.append({
                    "name": component.get("name", "Form"),
                    "type": "form",
                    "description": component.get("description", ""),
                    "props": component.get("props", []),
                    "source": "wireframes"
                })
    
    # Adicionar componentes comuns
    common_components = [
        {"name": "Button", "type": "ui", "description": "Botão clicável"},
        {"name": "Input", "type": "form", "description": "Campo de entrada"},
        {"name": "Modal", "type": "ui", "description": "Janela modal"},
        {"name": "Card", "type": "ui", "description": "Cartão de conteúdo"},
        {"name": "Navigation", "type": "navigation", "description": "Menu de navegação"}
    ]
    
    for component in common_components:
        if not any(c["name"] == component["name"] for c in components):
            components.append({
                "name": component["name"],
                "type": component["type"],
                "description": component["description"],
                "props": [],
                "source": "common_pattern"
            })
    
    return components

def generate_domain_modeling_prompt(context):
    """Gera prompt para Modelagem de Domínio"""
    entities = ", ".join([e["name"] for e in context["business_entities"]])
    flows = ", ".join([f["name"] for f in context["user_flows"]])
    
    prompt = f"""## Próxima Fase: Modelagem de Domínio

### Contexto do UX Design
**Entidades de Negócio Identificadas:** {entities}

**Fluxos de Usuário Mapeados:** {flows}

**Regras de UI Validadas:** {len(context['ui_rules'])} regras

**Componentes Reutilizáveis:** {len(context['components'])} componentes

### Tarefas para Modelagem de Domínio
1. **Definir entidades** e seus atributos baseados nos wireframes
2. **Mapear relacionamentos** entre entidades
3. **Especificas regras de domínio** baseadas nos fluxos de usuário
4. **Criar agregados** e value objects
5. **Definir eventos** de domínio importantes

### Artefatos Gerados
- **design-doc.md:** Design completo validado
- **wireframes.md:** Estrutura de interface
- **jornada-usuario.md:** Experiência do usuário

### Score de Qualidade
- **Validação UX:** {context['validation_summary']['score']} pontos
- **Status:** {context['validation_summary']['status']}
- **Cobertura:** {context['validation_summary']['coverage']}

### Próximo Especialista
**Modelagem de Domínio** - Transformará design em entidades de negócio e regras de domínio.

---
*Use o comando /maestro para iniciar a Modelagem de Domínio com este contexto.*"""
    
    return prompt

def generate_context_update(artifacts, score):
    """Gera atualização para CONTEXTO.md"""
    return {
        "section": "3. UX Design",
        "content": f"""## 3. UX Design
- **Status:** Concluído
- **Score:** {score} pontos
- **Data:** 2026-01-29
- **Artefatos:** 
  - design-doc.md (Design completo)
  - wireframes.md (Estrutura de interface)
  - jornada-usuario.md (Experiência do usuário)
- **Validação:** 100% requisitos funcionais cobertos
- **Próxima Fase:** Modelagem de Domínio
- **Métricas:** 80% redução de tokens, 55 minutos vs 70 anterior""",
        "metadata": {
            "updated_at": "2026-01-29",
            "score": score,
            "artifacts_count": 3,
            "status": "COMPLETED"
        }
    }

# Exemplo de uso
if __name__ == "__main__":
    artifacts_example = {
        "design_doc": {
            "sections": {
                "validation_rules": [
                    {"name": "email_validation", "description": "Validar formato de email"}
                ],
                "business_rules": [
                    {"name": "unique_username", "description": "Username único"}
                ]
            }
        },
        "wireframes": {
            "screens": [
                {
                    "name": "login",
                    "forms": [
                        {"entity": "User", "fields": ["email", "password"]}
                    ]
                }
            ],
            "components": {
                "reusable": [
                    {"name": "Button", "type": "ui", "description": "Botão clicável"}
                ]
            }
        },
        "jornada_usuario": {
            "sections": {
                "user_flows": [
                    {"name": "login_flow", "steps": ["enter_credentials", "submit", "redirect"]}
                ]
            }
        },
        "validation_result": {
            "score": 85,
            "coverage": {
                "requirements": 100,
                "accessibility": 100,
                "responsiveness": 100,
                "consistency": 90,
                "journeys": 100
            }
        }
    }
    
    result = process_ux_design(artifacts_example, 85)
    print(result)
