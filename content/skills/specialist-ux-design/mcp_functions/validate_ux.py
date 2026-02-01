"""
Função MCP de Validação - Especialista UX Design
Referência para implementação no servidor MCP
"""

def validate_ux_design(artifacts):
    """
    Valida qualidade dos documentos de UX Design
    
    Args:
        artifacts (dict): Dicionário com documentos gerados
            - design_doc: Documento de design completo
            - wireframes: Wireframes de todas as telas
            - jornada_usuario: Mapa de jornadas do usuário
            - prototipos: Protótipos interativos (opcional)
    
    Returns:
        dict: Resultado da validação com score
    """
    
    # Validar inputs
    required_artifacts = ['design_doc', 'wireframes', 'jornada_usuario']
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
    
    # 1. Validar Cobertura de Requisitos (30 pontos)
    requirements_score = validate_requirements_coverage(artifacts['design_doc'])
    validation_result["coverage"]["requirements"] = requirements_score["percentage"]
    validation_result["details"]["requirements"] = requirements_score["details"]
    validation_result["score"] += requirements_score["score"]
    
    # 2. Validar Usabilidade WCAG 2.1 AA (25 pontos)
    accessibility_score = validate_accessibility_wcag(artifacts['wireframes'])
    validation_result["coverage"]["accessibility"] = accessibility_score["percentage"]
    validation_result["details"]["accessibility"] = accessibility_score["details"]
    validation_result["score"] += accessibility_score["score"]
    
    # 3. Validar Responsividade (20 pontos)
    responsiveness_score = validate_responsiveness(artifacts['wireframes'])
    validation_result["coverage"]["responsiveness"] = responsiveness_score["percentage"]
    validation_result["details"]["responsiveness"] = responsiveness_score["details"]
    validation_result["score"] += responsiveness_score["score"]
    
    # 4. Validar Consistência Visual (15 pontos)
    consistency_score = validate_visual_consistency(artifacts)
    validation_result["coverage"]["consistency"] = consistency_score["percentage"]
    validation_result["details"]["consistency"] = consistency_score["details"]
    validation_result["score"] += consistency_score["score"]
    
    # 5. Validar Jornadas do Usuário (10 pontos)
    journeys_score = validate_user_journeys(artifacts['jornada_usuario'])
    validation_result["coverage"]["journeys"] = journeys_score["percentage"]
    validation_result["details"]["journeys"] = journeys_score["details"]
    validation_result["score"] += journeys_score["score"]
    
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

def validate_requirements_coverage(design_doc):
    """Valida cobertura de requisitos funcionais"""
    score = 0
    details = {
        "functional_requirements": 0,
        "user_stories": 0,
        "acceptance_criteria": 0,
        "business_rules": 0
    }
    
    # Verificar se todos os requisitos funcionais estão mapeados
    if "functional_requirements" in design_doc.get("sections", {}):
        details["functional_requirements"] = 100
        score += 10
    
    # Verificar user stories
    if "user_stories" in design_doc.get("sections", {}):
        details["user_stories"] = 100
        score += 8
    
    # Verificar critérios de aceite
    if "acceptance_criteria" in design_doc.get("sections", {}):
        details["acceptance_criteria"] = 100
        score += 7
    
    # Verificar regras de negócio
    if "business_rules" in design_doc.get("sections", {}):
        details["business_rules"] = 100
        score += 5
    
    return {
        "score": score,
        "percentage": (score / 30) * 100,
        "details": details
    }

def validate_accessibility_wcag(wireframes):
    """Valida conformidade WCAG 2.1 AA"""
    score = 0
    details = {
        "color_contrast": 0,
        "keyboard_navigation": 0,
        "screen_reader": 0,
        "alt_text": 0,
        "focus_indicators": 0
    }
    
    # Verificar contraste de cores
    if "color_contrast" in wireframes.get("accessibility", {}):
        details["color_contrast"] = 100
        score += 6
    
    # Verificar navegação por teclado
    if "keyboard_navigation" in wireframes.get("accessibility", {}):
        details["keyboard_navigation"] = 100
        score += 6
    
    # Verificar suporte a screen readers
    if "screen_reader" in wireframes.get("accessibility", {}):
        details["screen_reader"] = 100
        score += 5
    
    # Verificar textos alternativos
    if "alt_text" in wireframes.get("accessibility", {}):
        details["alt_text"] = 100
        score += 4
    
    # Verificar indicadores de foco
    if "focus_indicators" in wireframes.get("accessibility", {}):
        details["focus_indicators"] = 100
        score += 4
    
    return {
        "score": score,
        "percentage": (score / 25) * 100,
        "details": details
    }

def validate_responsiveness(wireframes):
    """Valida design responsivo"""
    score = 0
    details = {
        "mobile_breakpoint": 0,
        "tablet_breakpoint": 0,
        "desktop_breakpoint": 0,
        "flexible_layouts": 0,
        "adaptive_images": 0
    }
    
    # Verificar breakpoint mobile
    if "mobile" in wireframes.get("breakpoints", {}):
        details["mobile_breakpoint"] = 100
        score += 5
    
    # Verificar breakpoint tablet
    if "tablet" in wireframes.get("breakpoints", {}):
        details["tablet_breakpoint"] = 100
        score += 4
    
    # Verificar breakpoint desktop
    if "desktop" in wireframes.get("breakpoints", {}):
        details["desktop_breakpoint"] = 100
        score += 4
    
    # Verificar layouts flexíveis
    if "flexible_grids" in wireframes.get("layout", {}):
        details["flexible_layouts"] = 100
        score += 4
    
    # Verificar imagens adaptativas
    if "adaptive_images" in wireframes.get("layout", {}):
        details["adaptive_images"] = 100
        score += 3
    
    return {
        "score": score,
        "percentage": (score / 20) * 100,
        "details": details
    }

def validate_visual_consistency(artifacts):
    """Valida consistência visual"""
    score = 0
    details = {
        "color_system": 0,
        "typography": 0,
        "icon_system": 0,
        "spacing": 0,
        "component_library": 0
    }
    
    design_doc = artifacts.get('design_doc', {})
    wireframes = artifacts.get('wireframes', {})
    
    # Verificar sistema de cores
    if "color_palette" in design_doc.get("visual_design", {}):
        details["color_system"] = 100
        score += 4
    
    # Verificar tipografia
    if "typography" in design_doc.get("visual_design", {}):
        details["typography"] = 100
        score += 3
    
    # Verificar sistema de ícones
    if "icon_system" in design_doc.get("visual_design", {}):
        details["icon_system"] = 100
        score += 3
    
    # Verificar espaçamento
    if "spacing_system" in wireframes.get("layout", {}):
        details["spacing"] = 100
        score += 3
    
    # Verificar biblioteca de componentes
    if "component_library" in wireframes.get("components", {}):
        details["component_library"] = 100
        score += 2
    
    return {
        "score": score,
        "percentage": (score / 15) * 100,
        "details": details
    }

def validate_user_journeys(jornada_usuario):
    """Valida jornadas do usuário"""
    score = 0
    details = {
        "touchpoints": 0,
        "user_flows": 0,
        "pain_points": 0,
        "opportunities": 0,
        "measurement": 0
    }
    
    # Verificar pontos de contato
    if "touchpoints" in jornada_usuario.get("sections", {}):
        details["touchpoints"] = 100
        score += 3
    
    # Verificar fluxos de usuário
    if "user_flows" in jornada_usuario.get("sections", {}):
        details["user_flows"] = 100
        score += 2
    
    # Verificar pontos de dor
    if "pain_points" in jornada_usuario.get("sections", {}):
        details["pain_points"] = 100
        score += 2
    
    # Verificar oportunidades
    if "opportunities" in jornada_usuario.get("sections", {}):
        details["opportunities"] = 100
        score += 2
    
    # Verificar métricas
    if "metrics" in jornada_usuario.get("sections", {}):
        details["measurement"] = 100
        score += 1
    
    return {
        "score": score,
        "percentage": (score / 10) * 100,
        "details": details
    }

def generate_recommendations(validation_result):
    """Gera recomendações baseadas nos resultados da validação"""
    recommendations = []
    
    # Recomendações para requisitos
    if validation_result["coverage"]["requirements"] < 100:
        recommendations.append({
            "category": "Requisitos",
            "priority": "Alta",
            "description": "Mapear todos os requisitos funcionais no design",
            "action": "Revisar design-doc.md e adicionar requisitos faltantes"
        })
    
    # Recomendações para acessibilidade
    if validation_result["coverage"]["accessibility"] < 100:
        recommendations.append({
            "category": "Acessibilidade",
            "priority": "Alta",
            "description": "Garantir conformidade WCAG 2.1 AA completa",
            "action": "Adicionar contraste, navegação por teclado e screen readers"
        })
    
    # Recomendações para responsividade
    if validation_result["coverage"]["responsiveness"] < 100:
        recommendations.append({
            "category": "Responsividade",
            "priority": "Média",
            "description": "Implementar design para todos os dispositivos",
            "action": "Criar layouts para mobile, tablet e desktop"
        })
    
    # Recomendações para consistência
    if validation_result["coverage"]["consistency"] < 100:
        recommendations.append({
            "category": "Consistência",
            "priority": "Média",
            "description": "Padronizar elementos visuais",
            "action": "Criar sistema de cores, tipografia e componentes"
        })
    
    # Recomendações para jornadas
    if validation_result["coverage"]["journeys"] < 100:
        recommendations.append({
            "category": "Jornadas",
            "priority": "Baixa",
            "description": "Detalhar jornadas completas do usuário",
            "action": "Mapear todos os pontos de contato e fluxos"
        })
    
    return recommendations

# Exemplo de uso
if __name__ == "__main__":
    artifacts_example = {
        "design_doc": {
            "sections": {
                "functional_requirements": ["RF-001", "RF-002"],
                "user_stories": ["Story 1", "Story 2"],
                "visual_design": {
                    "color_palette": ["#primary", "#secondary"],
                    "typography": "Font system"
                }
            }
        },
        "wireframes": {
            "accessibility": {
                "color_contrast": "WCAG AA",
                "keyboard_navigation": "Tab navigation"
            },
            "breakpoints": {
                "mobile": "320px",
                "tablet": "768px",
                "desktop": "1024px"
            },
            "layout": {
                "flexible_grids": "CSS Grid",
                "spacing_system": "8px grid"
            }
        },
        "jornada_usuario": {
            "sections": {
                "touchpoints": ["Login", "Dashboard"],
                "user_flows": ["Main flow", "Alternative flow"],
                "pain_points": ["Issue 1", "Issue 2"]
            }
        }
    }
    
    result = validate_ux_design(artifacts_example)
    print(result)
