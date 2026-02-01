# Referência MCP: validate_architecture.py
# Função de validação para especialista de arquitetura
# NOTA: Este é um arquivo de referência - a execução é feita no MCP

async def validate_architecture_quality(params):
    """
    Valida qualidade do artefato de arquitetura
    
    Args:
        params (dict): Parâmetros de validação
            - architecture_path: Caminho do arquivo de arquitetura
            - project_context: Contexto do projeto
            - validation_level: Nível de validação (basic/strict/comprehensive)
    
    Returns:
        dict: Resultado da validação com score e recomendações
    """
    
    validation_level = params.get('validation_level', 'basic')
    architecture_path = params.get('architecture_path', 'docs/06-arquitetura/arquitetura.md')
    
    # Critérios de validação baseados no nível
    if validation_level == 'basic':
        criteria = get_basic_validation_criteria()
    elif validation_level == 'strict':
        criteria = get_strict_validation_criteria()
    else:
        criteria = get_comprehensive_validation_criteria()
    
    # Executar validações
    validation_results = {
        'structure_validation': validate_structure(architecture_path, criteria),
        'content_validation': validate_content(architecture_path, criteria),
        'quality_validation': validate_quality(architecture_path, criteria),
        'consistency_validation': validate_consistency(architecture_path, criteria)
    }
    
    # Calcular score
    total_score = calculate_validation_score(validation_results)
    
    # Gerar recomendações
    recommendations = generate_recommendations(validation_results, total_score)
    
    return {
        'validation_level': validation_level,
        'total_score': total_score,
        'passed': total_score >= 75,
        'validation_results': validation_results,
        'recommendations': recommendations,
        'next_actions': get_next_actions(total_score, validation_results)
    }

def get_basic_validation_criteria():
    """Critérios de validação básica"""
    return {
        'required_sections': [
            '## Sumário Executivo',
            '## 1. Visão Arquitetural',
            '## 2. Arquitetura C4',
            '## 3. Stack Tecnológica',
            '## 4. Decisões Arquiteturais',
            '## 5. Segurança',
            '## Checklist de Qualidade'
        ],
        'minimum_checkboxes': 30,
        'minimum_adrs': 2,
        'minimum_slos': 3
    }

def get_strict_validation_criteria():
    """Critérios de validação estrita"""
    return {
        'required_sections': [
            '## Sumário Executivo',
            '## 1. Visão Arquitetural',
            '## 2. Arquitetura C4',
            '## 3. Stack Tecnológica',
            '## 4. Decisões Arquiteturais',
            '## 5. Segurança',
            '## 6. Performance e Escalabilidade',
            '## 7. Monitoramento e Observabilidade',
            '## 8. Riscos e Mitigações',
            '## 9. Roadmap de Implementação',
            '## Checklist de Qualidade'
        ],
        'minimum_checkboxes': 50,
        'minimum_adrs': 3,
        'minimum_slos': 5,
        'requires_c4_levels': [1, 2, 3],
        'requires_security_details': True,
        'requires_performance_metrics': True
    }

def get_comprehensive_validation_criteria():
    """Critérios de validação abrangente"""
    return {
        'required_sections': [
            '## Sumário Executivo',
            '## 1. Visão Arquitetural',
            '## 2. Arquitetura C4',
            '## 3. Stack Tecnológica',
            '## 4. Decisões Arquiteturais',
            '## 5. Segurança',
            '## 6. Performance e Escalabilidade',
            '## 7. Monitoramento e Observabilidade',
            '## 8. Riscos e Mitigações',
            '## 9. Roadmap de Implementação',
            '## 10. Glossário',
            '## Checklist de Qualidade'
        ],
        'minimum_checkboxes': 70,
        'minimum_adrs': 5,
        'minimum_slos': 8,
        'requires_c4_levels': [1, 2, 3],
        'requires_security_details': True,
        'requires_performance_metrics': True,
        'requires_monitoring_plan': True,
        'requires_risk_assessment': True,
        'requires_implementation_timeline': True,
        'requires_glossary': True
    }

def validate_structure(architecture_path, criteria):
    """Valida estrutura do documento"""
    results = {
        'has_all_sections': False,
        'missing_sections': [],
        'section_count': 0,
        'checkbox_count': 0,
        'adr_count': 0,
        'slo_count': 0
    }
    
    # Verificar seções obrigatórias
    required_sections = criteria.get('required_sections', [])
    missing_sections = []
    
    for section in required_sections:
        if not check_section_exists(architecture_path, section):
            missing_sections.append(section)
    
    results['has_all_sections'] = len(missing_sections) == 0
    results['missing_sections'] = missing_sections
    results['section_count'] = count_sections(architecture_path)
    results['checkbox_count'] = count_checkboxes(architecture_path)
    results['adr_count'] = count_adrs(architecture_path)
    results['slo_count'] = count_slos(architecture_path)
    
    return results

def validate_content(architecture_path, criteria):
    """Valida conteúdo do documento"""
    results = {
        'has_executive_summary': False,
        'has_c4_diagrams': False,
        'has_stack_justification': False,
        'has_security_strategy': False,
        'has_performance_considerations': False,
        'has_risk_mitigation': False,
        'word_count': 0,
        'completeness_score': 0
    }
    
    # Verificar conteúdo específico
    results['has_executive_summary'] = check_executive_summary_quality(architecture_path)
    results['has_c4_diagrams'] = check_c4_diagrams(architecture_path, criteria)
    results['has_stack_justification'] = check_stack_justification(architecture_path)
    results['has_security_strategy'] = check_security_strategy(architecture_path, criteria)
    results['has_performance_considerations'] = check_performance_considerations(architecture_path, criteria)
    results['has_risk_mitigation'] = check_risk_mitigation(architecture_path, criteria)
    results['word_count'] = count_words(architecture_path)
    results['completeness_score'] = calculate_completeness_score(architecture_path, criteria)
    
    return results

def validate_quality(architecture_path, criteria):
    """Valida qualidade do documento"""
    results = {
        'clarity_score': 0,
        'consistency_score': 0,
        'technical_accuracy_score': 0,
        'feasibility_score': 0,
        'overall_quality_score': 0
    }
    
    # Avaliar qualidade
    results['clarity_score'] = assess_clarity(architecture_path)
    results['consistency_score'] = assess_consistency(architecture_path)
    results['technical_accuracy_score'] = assess_technical_accuracy(architecture_path)
    results['feasibility_score'] = assess_feasibility(architecture_path)
    results['overall_quality_score'] = calculate_overall_quality(results)
    
    return results

def validate_consistency(architecture_path, criteria):
    """Valida consistência com outros artefatos"""
    results = {
        'consistent_with_prd': False,
        'consistent_with_requirements': False,
        'consistent_with_domain_model': False,
        'consistent_with_ux_design': False,
        'cross_reference_score': 0
    }
    
    # Verificar consistência
    results['consistent_with_prd'] = check_consistency_with_prd(architecture_path)
    results['consistent_with_requirements'] = check_consistency_with_requirements(architecture_path)
    results['consistent_with_domain_model'] = check_consistency_with_domain_model(architecture_path)
    results['consistent_with_ux_design'] = check_consistency_with_ux_design(architecture_path)
    results['cross_reference_score'] = calculate_cross_reference_score(architecture_path)
    
    return results

def calculate_validation_score(validation_results):
    """Calcula score total de validação"""
    weights = {
        'structure_validation': 0.3,
        'content_validation': 0.3,
        'quality_validation': 0.2,
        'consistency_validation': 0.2
    }
    
    scores = {
        'structure_validation': calculate_structure_score(validation_results['structure_validation']),
        'content_validation': calculate_content_score(validation_results['content_validation']),
        'quality_validation': validation_results['quality_validation']['overall_quality_score'],
        'consistency_validation': calculate_consistency_score(validation_results['consistency_validation'])
    }
    
    total_score = 0
    for category, weight in weights.items():
        total_score += scores[category] * weight
    
    return round(total_score, 2)

def generate_recommendations(validation_results, total_score):
    """Gera recomendações baseadas nos resultados"""
    recommendations = []
    
    if total_score < 60:
        recommendations.append("Revisar completamente a estrutura do documento")
        recommendations.append("Adicionar mais detalhes técnicos")
        recommendations.append("Documentar decisões arquiteturais")
    elif total_score < 75:
        recommendations.append("Completar seções obrigatórias")
        recommendations.append("Adicionar mais ADRs")
        recommendations.append("Refinar SLOs")
    elif total_score < 90:
        recommendations.append("Adicionar exemplos específicos")
        recommendations.append("Incluir métricas detalhadas")
        recommendations.append("Refinar roadmap de implementação")
    else:
        recommendations.append("Excelente qualidade! Considerar como template")
        recommendations.append("Documentar lessons learned")
        recommendations.append("Compartilhar com time")
    
    return recommendations

def get_next_actions(total_score, validation_results):
    """Próximas ações baseadas no score"""
    if total_score >= 75:
        return [
            "Arquitetura validada e pronta para implementação",
            "Avançar para próxima fase (Segurança)",
            "Compartilhar com time técnico",
            "Iniciar implementação baseada no roadmap"
        ]
    else:
        return [
            "Revisar e melhorar arquitetura",
            "Completar validações pendentes",
            "Obter feedback de stakeholders",
            "Refinar decisões arquiteturais"
        ]

# Funções auxiliares (simuladas para referência)
def check_section_exists(path, section): return True
def count_sections(path): return 10
def count_checkboxes(path): return 50
def count_adrs(path): return 3
def count_slos(path): return 5
def check_executive_summary_quality(path): return True
def check_c4_diagrams(path, criteria): return True
def check_stack_justification(path): return True
def check_security_strategy(path, criteria): return True
def check_performance_considerations(path, criteria): return True
def check_risk_mitigation(path, criteria): return True
def count_words(path): return 1500
def calculate_completeness_score(path, criteria): return 0.8
def assess_clarity(path): return 85
def assess_consistency(path): return 80
def assess_technical_accuracy(path): return 90
def assess_feasibility(path): return 85
def calculate_overall_quality(scores): return 85
def calculate_structure_score(results): return 90
def calculate_content_score(results): return 85
def calculate_consistency_score(results): return 80
def check_consistency_with_prd(path): return True
def check_consistency_with_requirements(path): return True
def check_consistency_with_domain_model(path): return True
def check_consistency_with_ux_design(path): return True
def calculate_cross_reference_score(path): return 85