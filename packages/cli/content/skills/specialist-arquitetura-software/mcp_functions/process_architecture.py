# Referência MCP: process_architecture.py
# Função de processamento para especialista de arquitetura
# NOTA: Este é um arquivo de referência - a execução é feita no MCP

async def process_architecture_to_next_phase(params):
    """
    Processa artefato de arquitetura e prepara para próxima fase
    
    Args:
        params (dict): Parâmetros de processamento
            - architecture_path: Caminho do arquivo de arquitetura
            - validation_score: Score de validação obtido
            - project_context: Contexto completo do projeto
            - next_phase: Próxima fase do workflow
    
    Returns:
        dict: Resultado do processamento com contexto para próxima fase
    """
    
    architecture_path = params.get('architecture_path', 'docs/06-arquitetura/arquitetura.md')
    validation_score = params.get('validation_score', 0)
    next_phase = params.get('next_phase', 'seguranca')
    
    # Verificar se score mínimo foi atingido
    if validation_score < 75:
        return {
            'success': False,
            'reason': 'Score de validação insuficiente',
            'required_score': 75,
            'current_score': validation_score,
            'recommendations': [
                'Revisar seções incompletas',
                'Adicionar mais detalhes técnicos',
                'Documentar decisões arquiteturais',
                'Refinar SLOs e métricas'
            ]
        }
    
    # Extrair informações chave da arquitetura
    architecture_summary = extract_architecture_summary(architecture_path)
    
    # Preparar contexto para próxima fase
    next_phase_context = prepare_next_phase_context(architecture_summary, next_phase)
    
    # Gerar artefatos de transição
    transition_artifacts = generate_transition_artifacts(architecture_summary, next_phase)
    
    # Atualizar contexto do projeto
    updated_context = update_project_context(architecture_summary, params.get('project_context', {}))
    
    return {
        'success': True,
        'validation_score': validation_score,
        'architecture_summary': architecture_summary,
        'next_phase_context': next_phase_context,
        'transition_artifacts': transition_artifacts,
        'updated_context': updated_context,
        'next_actions': get_next_phase_actions(next_phase, next_phase_context)
    }

def extract_architecture_summary(architecture_path):
    """Extrai resumo da arquitetura"""
    return {
        'system_type': extract_system_type(architecture_path),
        'architecture_pattern': extract_architecture_pattern(architecture_path),
        'technology_stack': extract_technology_stack(architecture_path),
        'key_decisions': extract_key_decisions(architecture_path),
        'security_considerations': extract_security_considerations(architecture_path),
        'performance_requirements': extract_performance_requirements(architecture_path),
        'integration_points': extract_integration_points(architecture_path),
        'deployment_strategy': extract_deployment_strategy(architecture_path)
    }

def prepare_next_phase_context(architecture_summary, next_phase):
    """Prepara contexto para próxima fase"""
    
    if next_phase == 'seguranca':
        return prepare_security_context(architecture_summary)
    elif next_phase == 'frontend':
        return prepare_frontend_context(architecture_summary)
    elif next_phase == 'backend':
        return prepare_backend_context(architecture_summary)
    else:
        return prepare_generic_context(architecture_summary)

def prepare_security_context(architecture_summary):
    """Prepara contexto para fase de segurança"""
    return {
        'phase': 'seguranca',
        'inputs_from_architecture': {
            'system_architecture': architecture_summary['architecture_pattern'],
            'technology_stack': architecture_summary['technology_stack'],
            'integration_points': architecture_summary['integration_points'],
            'deployment_strategy': architecture_summary['deployment_strategy'],
            'security_considerations': architecture_summary['security_considerations']
        },
        'security_focus_areas': [
            'OWASP Top 10 compliance',
            'Authentication and authorization strategy',
            'Data protection and encryption',
            'Network security',
            'Compliance requirements'
        ],
        'required_deliverables': [
            'Security checklist',
            'Threat model',
            'Compliance plan',
            'Security monitoring strategy'
        ]
    }

def prepare_frontend_context(architecture_summary):
    """Prepara contexto para fase de frontend"""
    return {
        'phase': 'frontend',
        'inputs_from_architecture': {
            'frontend_stack': architecture_summary['technology_stack'].get('frontend', {}),
            'system_architecture': architecture_summary['architecture_pattern'],
            'integration_points': architecture_summary['integration_points'],
            'performance_requirements': architecture_summary['performance_requirements']
        },
        'frontend_focus_areas': [
            'Component architecture',
            'State management',
            'API integration',
            'Performance optimization',
            'Accessibility compliance'
        ],
        'required_deliverables': [
            'Component library',
            'Page templates',
            'API client',
            'Test suite'
        ]
    }

def prepare_backend_context(architecture_summary):
    """Prepara contexto para fase de backend"""
    return {
        'phase': 'backend',
        'inputs_from_architecture': {
            'backend_stack': architecture_summary['technology_stack'].get('backend', {}),
            'database_design': architecture_summary['technology_stack'].get('database', {}),
            'system_architecture': architecture_summary['architecture_pattern'],
            'integration_points': architecture_summary['integration_points']
        },
        'backend_focus_areas': [
            'API design and implementation',
            'Business logic',
            'Data persistence',
            'Integration with external services',
            'Performance optimization'
        ],
        'required_deliverables': [
            'API endpoints',
            'Business services',
            'Data models',
            'Integration tests'
        ]
    }

def prepare_generic_context(architecture_summary):
    """Prepara contexto genérico para qualquer fase"""
    return {
        'phase': 'generic',
        'architecture_overview': architecture_summary,
        'key_decisions': architecture_summary['key_decisions'],
        'technology_stack': architecture_summary['technology_stack'],
        'integration_points': architecture_summary['integration_points']
    }

def generate_transition_artifacts(architecture_summary, next_phase):
    """Gera artefatos de transição para próxima fase"""
    
    artifacts = {
        'context_update': generate_context_update(architecture_summary),
        'phase_briefing': generate_phase_briefing(architecture_summary, next_phase),
        'checklist_transfer': generate_checklist_transfer(architecture_summary, next_phase)
    }
    
    if next_phase == 'seguranca':
        artifacts['security_briefing'] = generate_security_briefing(architecture_summary)
    elif next_phase == 'frontend':
        artifacts['frontend_briefing'] = generate_frontend_briefing(architecture_summary)
    elif next_phase == 'backend':
        artifacts['backend_briefing'] = generate_backend_briefing(architecture_summary)
    
    return artifacts

def generate_context_update(architecture_summary):
    """Gera atualização de contexto do projeto"""
    return {
        'architecture_decisions': architecture_summary['key_decisions'],
        'technology_stack': architecture_summary['technology_stack'],
        'system_boundaries': architecture_summary['integration_points'],
        'performance_targets': architecture_summary['performance_requirements'],
        'last_updated': datetime.now().isoformat()
    }

def generate_phase_briefing(architecture_summary, next_phase):
    """Gera briefing para próxima fase"""
    return {
        'target_phase': next_phase,
        'architecture_inputs': {
            'pattern': architecture_summary['architecture_pattern'],
            'stack': architecture_summary['technology_stack'],
            'decisions': architecture_summary['key_decisions']
        },
        'focus_areas': get_phase_focus_areas(next_phase),
        'success_criteria': get_phase_success_criteria(next_phase)
    }

def generate_checklist_transfer(architecture_summary, next_phase):
    """Gera transferência de checklist para próxima fase"""
    return {
        'architecture_compliance': {
            'c4_diagrams_complete': True,
            'adrs_documented': True,
            'slos_defined': True,
            'security_considered': True
        },
        'phase_requirements': get_phase_requirements(next_phase),
        'dependencies': get_phase_dependencies(next_phase)
    }

def get_next_phase_actions(next_phase, context):
    """Retorna ações para próxima fase"""
    
    base_actions = [
        f"Iniciar especialista de {next_phase}",
        "Transferir contexto da arquitetura",
        "Validar inputs recebidos",
        "Executar workflow da fase"
    ]
    
    if next_phase == 'seguranca':
        base_actions.extend([
            "Revisar considerações de segurança da arquitetura",
            "Identificar requisitos de compliance",
            "Iniciar threat modeling"
        ])
    elif next_phase == 'frontend':
        base_actions.extend([
            "Configurar ambiente de desenvolvimento frontend",
            "Preparar design system",
            "Configurar integração com API"
        ])
    elif next_phase == 'backend':
        base_actions.extend([
            "Configurar ambiente de desenvolvimento backend",
            "Preparar estrutura de banco de dados",
            "Configurar endpoints de API"
        ])
    
    return base_actions

# Funções auxiliares (simuladas para referência)
def extract_system_type(path): return "web_application"
def extract_architecture_pattern(path): return "monolith_modular"
def extract_technology_stack(path): 
    return {
        'frontend': {'framework': 'React', 'language': 'TypeScript'},
        'backend': {'framework': 'Express', 'language': 'TypeScript'},
        'database': {'primary': 'PostgreSQL', 'cache': 'Redis'}
    }
def extract_key_decisions(path): return ["ADR-001: Monolith Modular", "ADR-002: PostgreSQL"]
def extract_security_considerations(path): return ["OAuth2", "RBAC", "TLS"]
def extract_performance_requirements(path): return ["p95 < 200ms", "99.9% uptime"]
def extract_integration_points(path): return ["Payment Gateway", "Email Service"]
def extract_deployment_strategy(path): return "Docker + AWS"
def get_phase_focus_areas(phase): return ["Area 1", "Area 2"]
def get_phase_success_criteria(phase): return ["Criteria 1", "Criteria 2"]
def get_phase_requirements(phase): return ["Requirement 1", "Requirement 2"]
def get_phase_dependencies(phase): return ["Dependency 1", "Dependency 2"]
def generate_security_briefing(summary): return {"security": "briefing"}
def generate_frontend_briefing(summary): return {"frontend": "briefing"}
def generate_backend_briefing(summary): return {"backend": "briefing"}

from datetime import datetime