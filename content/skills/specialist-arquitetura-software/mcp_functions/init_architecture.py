# Referência MCP: init_architecture.py
# Função de inicialização para especialista de arquitetura
# NOTA: Este é um arquivo de referência - a execução é feita no MCP

async def initialize_architecture_structure(params):
    """
    Inicializa estrutura base do artefato de arquitetura
    
    Args:
        params (dict): Parâmetros de inicialização
            - project_name: Nome do projeto
            - project_type: Tipo de projeto (web/mobile/api/etc)
            - team_size: Tamanho do time
            - requirements: Requisitos principais
    
    Returns:
        dict: Estrutura inicial criada
    """
    
    # Criar estrutura de diretórios
    architecture_structure = {
        'docs/06-arquitetura/': {
            'arquitetura.md': 'template_principal',
            'adr/': 'decision_records',
            'diagrams/': 'c4_diagrams',
            'slo-sli.md': 'service_levels'
        }
    }
    
    # Template inicial baseado no tipo de projeto
    if params.get('project_type') == 'web':
        template_type = 'web_application'
    elif params.get('project_type') == 'mobile':
        template_type = 'mobile_application'
    elif params.get('project_type') == 'api':
        template_type = 'api_service'
    else:
        template_type = 'generic_system'
    
    # Configurar stack padrão baseado no time e requisitos
    stack_config = {
        'frontend': select_frontend_stack(params),
        'backend': select_backend_stack(params),
        'database': select_database_stack(params),
        'infrastructure': select_infrastructure_stack(params)
    }
    
    return {
        'structure': architecture_structure,
        'template_type': template_type,
        'stack_config': stack_config,
        'next_steps': [
            'Analisar requisitos de negócio',
            'Definir diagramas C4',
            'Documentar decisões arquiteturais',
            'Estabelecer SLOs'
        ]
    }

def select_frontend_stack(params):
    """Seleciona stack frontend baseado nos parâmetros"""
    team_size = params.get('team_size', 1)
    
    if team_size <= 3:
        return {
            'framework': 'Next.js',
            'language': 'TypeScript',
            'styling': 'Tailwind CSS',
            'state_management': 'Zustand',
            'testing': 'Jest + Playwright'
        }
    else:
        return {
            'framework': 'React',
            'language': 'TypeScript',
            'styling': 'Styled Components',
            'state_management': 'Redux Toolkit',
            'testing': 'Jest + Cypress'
        }

def select_backend_stack(params):
    """Seleciona stack backend baseado nos parâmetros"""
    project_type = params.get('project_type', 'web')
    
    if project_type == 'api':
        return {
            'runtime': 'Node.js',
            'framework': 'Fastify',
            'language': 'TypeScript',
            'orm': 'Prisma',
            'testing': 'Jest + Supertest'
        }
    else:
        return {
            'runtime': 'Node.js',
            'framework': 'Express.js',
            'language': 'TypeScript',
            'orm': 'Prisma',
            'testing': 'Jest + Supertest'
        }

def select_database_stack(params):
    """Seleciona stack de banco de dados baseado nos parâmetros"""
    requirements = params.get('requirements', [])
    
    if 'analytics' in requirements:
        return {
            'primary': 'PostgreSQL',
            'cache': 'Redis',
            'analytics': 'ClickHouse',
            'backup': 'WAL + S3'
        }
    else:
        return {
            'primary': 'PostgreSQL',
            'cache': 'Redis',
            'backup': 'WAL + S3'
        }

def select_infrastructure_stack(params):
    """Seleciona stack de infraestrutura baseado nos parâmetros"""
    team_size = params.get('team_size', 1)
    
    if team_size <= 3:
        return {
            'cloud': 'AWS',
            'containers': 'Docker',
            'ci_cd': 'GitHub Actions',
            'monitoring': 'Prometheus + Grafana'
        }
    else:
        return {
            'cloud': 'AWS',
            'containers': 'Docker + Kubernetes',
            'ci_cd': 'GitHub Actions',
            'monitoring': 'Prometheus + Grafana + Jaeger'
        }