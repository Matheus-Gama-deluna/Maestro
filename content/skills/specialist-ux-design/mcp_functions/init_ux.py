"""
Função MCP de Inicialização - Especialista UX Design
Referência para implementação no servidor MCP
"""

def init_ux_design(context):
    """
    Inicializa estrutura base para UX Design
    
    Args:
        context (dict): Dicionário com informações do projeto
            - project_name: Nome do projeto
            - requirements: Lista de requisitos funcionais
            - personas: Lista de personas mapeadas
            - constraints: Lista de restrições técnicas
            - artifacts: Caminhos para artefatos anteriores
    
    Returns:
        dict: Estrutura inicial dos documentos UX
    """
    
    # Validar inputs obrigatórios
    required_fields = ['project_name', 'requirements', 'personas']
    for field in required_fields:
        if field not in context:
            raise ValueError(f"Campo obrigatório faltando: {field}")
    
    # Criar estrutura base
    design_doc = {
        "title": f"{context['project_name']} - Documento de Design UX",
        "sections": {
            "executive_summary": {
                "project": context['project_name'],
                "version": "1.0",
                "date": "2026-01-29",
                "status": "Em elaboração",
                "author": "UX Designer",
                "approvers": ["Stakeholders"]
            },
            "system_overview": {
                "description": "Descrição do produto",
                "business_objectives": "Objetivos principais",
                "key_metrics": "KPIs e North Star"
            },
            "personas_scenarios": {
                "main_persona": context['personas'][0] if context['personas'] else "Principal",
                "usage_scenario": "História e contexto",
                "pains_gains": "Principais dores e ganhos"
            }
        }
    }
    
    wireframes = {
        "title": f"{context['project_name']} - Wireframes",
        "sections": {
            "page_structure": {
                "hierarchical_structure": "Mapa do site ou árvore",
                "main_flows": "Fluxos principais de navegação",
                "responsive_breakpoints": "Mobile, Tablet, Desktop"
            },
            "components": {
                "reusable": "Componentes padronizados",
                "navigation": "Menus e navegação",
                "forms": "Formulários e interações",
                "states": "Estados e feedback visual"
            }
        }
    }
    
    jornada_usuario = {
        "title": f"{context['project_name']} - Jornada do Usuário",
        "sections": {
            "journey_map": {
                "touchpoints": "Pontos de contato com o sistema",
                "objectives": "Objetivos e metas do usuário",
                "pains_gains": "Dores e ganhos por etapa",
                "main_flows": "Fluxos principais",
                "alternative_flows": "Fluxos alternativos"
            },
            "opportunities": {
                "improvements": "Oportunidades de melhoria",
                "innovations": "Inovações propostas",
                "optimizations": "Otimizações de experiência"
            }
        }
    }
    
    # Retornar estrutura completa
    return {
        "status": "SUCCESS",
        "message": "Estrutura UX criada com sucesso",
        "artifacts": {
            "design_doc": design_doc,
            "wireframes": wireframes,
            "jornada_usuario": jornada_usuario
        },
        "next_steps": [
            "Preencher detalhes do design-doc.md",
            "Criar wireframes das principais telas",
            "Mapear jornadas completas do usuário",
            "Validar com stakeholders"
        ],
        "metadata": {
            "created_at": "2026-01-29",
            "requirements_count": len(context['requirements']),
            "personas_count": len(context['personas']),
            "estimated_time": "55 minutos"
        }
    }

# Exemplo de uso
if __name__ == "__main__":
    context_example = {
        "project_name": "E-commerce Platform",
        "requirements": ["RF-001", "RF-002", "RF-003"],
        "personas": ["Customer", "Admin", "Seller"],
        "constraints": ["mobile-first", "wcag-aa"],
        "artifacts": {
            "requirements": "docs/02-requisitos/requisitos.md",
            "traceability": "docs/02-requisitos/matriz-rastreabilidade.md",
            "acceptance": "docs/02-requisitos/criterios-aceite.md"
        }
    }
    
    result = init_ux_design(context_example)
    print(result)
