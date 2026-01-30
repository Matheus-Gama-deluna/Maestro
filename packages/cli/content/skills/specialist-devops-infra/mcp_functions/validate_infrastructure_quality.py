#!/usr/bin/env python3
"""
Função MCP de Referência: validate_infrastructure_quality

Esta função serve como referência para implementação no MCP.
NÃO EXECUTÁVEL LOCALMENTE - Apenas documentação da estrutura esperada.

Propósito: Validar qualidade da infraestrutura configurada
"""

async def validate_infrastructure_quality(params: dict) -> dict:
    """
    Valida qualidade da infraestrutura
    
    Args:
        params: {
            "infrastructure_path": str,           # Caminho da infraestrutura
            "template_content": dict,             # Conteúdo do template
            "validation_level": str,              # basic|complete|strict
            "check_security": bool,               # Validar segurança
            "check_performance": bool,            # Validar performance
            "check_compliance": bool,             # Validar compliance
            "project_context": dict              # Contexto do projeto
        }
    
    Returns:
        dict: {
            "success": bool,                      # Status da validação
            "score": int,                         # Score 0-100
            "issues": list[dict],                 # Issues encontrados
            "recommendations": list[str],         # Recomendações
            "can_proceed": bool,                  # Pode prosseguir
            "validation_details": dict,           # Detalhes da validação
            "security_report": dict,              # Relatório de segurança
            "performance_metrics": dict,          # Métricas de performance
            "compliance_status": dict             # Status de compliance
        }
    """
    
    # IMPLEMENTAÇÃO ESPERADA NO MCP:
    
    template_content = params["template_content"]
    validation_level = params.get("validation_level", "complete")
    
    # 1. Validação Estrutural
    structure_validation = await validate_structure(template_content)
    
    # 2. Validação de Conteúdo
    content_validation = await validate_content(template_content)
    
    # 3. Validação de Lógica
    logic_validation = await validate_logic(template_content)
    
    # 4. Validação de Segurança (se solicitado)
    security_validation = {}
    if params.get("check_security", True):
        security_validation = await validate_security(template_content)
    
    # 5. Validação de Performance (se solicitado)
    performance_validation = {}
    if params.get("check_performance", True):
        performance_validation = await validate_performance(template_content)
    
    # 6. Validação de Compliance (se solicitado)
    compliance_validation = {}
    if params.get("check_compliance", True):
        compliance_validation = await validate_compliance(template_content)
    
    # 7. Calcular score final
    final_score = calculate_final_score(
        structure_validation,
        content_validation,
        logic_validation,
        security_validation,
        performance_validation,
        compliance_validation
    )
    
    # 8. Gerar issues
    issues = generate_issues(
        structure_validation,
        content_validation,
        logic_validation,
        security_validation
    )
    
    # 9. Gerar recomendações
    recommendations = generate_recommendations(
        template_content,
        final_score,
        issues
    )
    
    # 10. Determinar se pode prosseguir
    can_proceed = determine_proceed_status(final_score, validation_level, issues)
    
    return {
        "success": True,
        "score": final_score,
        "issues": issues,
        "recommendations": recommendations,
        "can_proceed": can_proceed,
        "validation_details": {
            "structure": structure_validation,
            "content": content_validation,
            "logic": logic_validation
        },
        "security_report": security_validation,
        "performance_metrics": performance_validation,
        "compliance_status": compliance_validation
    }


# FUNÇÕES DE VALIDAÇÃO

async def validate_structure(template_content: dict) -> dict:
    """
    Valida estrutura JSON do template
    
    Args:
        template_content: Conteúdo do template
        
    Returns:
        dict: Resultado da validação estrutural
    """
    result = {
        "valid": True,
        "score": 0,
        "errors": [],
        "warnings": []
    }
    
    # Campos obrigatórios
    required_fields = [
        "infraestrutura",
        "infraestrutura.stack",
        "infraestrutura.ambientes",
        "infraestrutura.ci_cd",
        "infraestrutura.container",
        "infraestrutura.iac",
        "compliance",
        "history"
    ]
    
    for field in required_fields:
        if not get_nested_value(template_content, field):
            result["errors"].append(f"Campo obrigatório ausente: {field}")
            result["valid"] = False
    
    # Validar tipos
    type_validations = {
        "infraestrutura.stack.language": str,
        "infraestrutura.stack.framework": str,
        "infraestrutura.stack.database": str,
        "infraestrutura.stack.cloud_provider": str,
        "infraestrutura.ambientes": dict,
        "infraestrutura.ci_cd": dict,
        "infraestrutura.container": dict,
        "infraestrutura.iac": dict,
        "compliance": dict,
        "history": list
    }
    
    for field, expected_type in type_validations.items():
        value = get_nested_value(template_content, field)
        if value is not None and not isinstance(value, expected_type):
            result["errors"].append(f"Tipo inválido em {field}: esperado {expected_type.__name__}")
            result["valid"] = False
    
    # Calcular score estrutural
    if result["valid"]:
        result["score"] = 100
    else:
        result["score"] = max(0, 100 - (len(result["errors"]) * 10))
    
    return result


async def validate_content(template_content: dict) -> dict:
    """
    Valida conteúdo dos campos
    
    Args:
        template_content: Conteúdo do template
        
    Returns:
        dict: Resultado da validação de conteúdo
    """
    result = {
        "valid": True,
        "score": 0,
        "errors": [],
        "warnings": []
    }
    
    # Valores permitidos (enums)
    enum_validations = {
        "infraestrutura.stack.language": ["NODE", "PYTHON", "JAVA", "GO", "RUST"],
        "infraestrutura.stack.framework": ["NEXT", "NEST", "DJANGO", "FASTAPI", "SPRING"],
        "infraestrutura.stack.database": ["POSTGRES", "MYSQL", "MONGO", "REDIS"],
        "infraestrutura.stack.cloud_provider": ["AWS", "GCP", "AZURE"],
        "infraestrutura.ci_cd.provider": ["GITHUB_ACTIONS", "GITLAB_CI"],
        "infraestrutura.iac.tool": ["TERRAFORM", "PULUMI"]
    }
    
    for field, allowed_values in enum_validations.items():
        value = get_nested_value(template_content, field)
        if value and value not in allowed_values:
            result["errors"].append(f"Valor inválido em {field}: {value}. Permitidos: {allowed_values}")
            result["valid"] = False
    
    # Validações de formato
    format_validations = {
        "infraestrutura.container.image_name": r"^[a-z0-9-]+$",
        "infraestrutura.container.latest_tag": r"^v\d+\.\d+\.\d+$"
    }
    
    import re
    for field, pattern in format_validations.items():
        value = get_nested_value(template_content, field)
        if value and not re.match(pattern, value):
            result["errors"].append(f"Formato inválido em {field}: {value}")
            result["valid"] = False
    
    # Validações de lógica de negócio
    business_validations = [
        {
            "condition": lambda t: t["infraestrutura"]["ambientes"].get("prod", {}).get("status") == "active",
            "error": "Ambiente prod não pode estar active sem validação completa",
            "field": "infraestrutura.ambientes.prod.status"
        },
        {
            "condition": lambda t: t["infraestrutura"]["ci_cd"].get("status") == "configured" and not t["infraestrutura"]["ci_cd"].get("pipeline_url"),
            "error": "CI/CD configurado requer pipeline_url",
            "field": "infraestrutura.ci_cd.pipeline_url"
        }
    ]
    
    for validation in business_validations:
        if validation["condition"](template_content):
            result["errors"].append(validation["error"])
            result["valid"] = False
    
    # Calcular score de conteúdo
    total_fields = len(enum_validations) + len(format_validations) + len(business_validations)
    valid_fields = total_fields - len(result["errors"])
    result["score"] = int((valid_fields / total_fields) * 100) if total_fields > 0 else 0
    
    return result


async def validate_logic(template_content: dict) -> dict:
    """
    Valida lógica de negócio da infraestrutura
    
    Args:
        template_content: Conteúdo do template
        
    Returns:
        dict: Resultado da validação lógica
    """
    result = {
        "valid": True,
        "score": 0,
        "errors": [],
        "warnings": []
    }
    
    # Regras de consistência
    consistency_rules = [
        {
            "name": "Stack Completeness",
            "check": lambda t: all([
                t["infraestrutura"]["stack"].get("language"),
                t["infraestrutura"]["stack"].get("framework"),
                t["infraestrutura"]["stack"].get("database"),
                t["infraestrutura"]["stack"].get("cloud_provider")
            ]),
            "error": "Stack tecnológica incompleta"
        },
        {
            "name": "Environment Consistency",
            "check": lambda t: len(t["infraestrutura"]["ambientes"]) >= 2,
            "error": "Pelo menos 2 ambientes devem ser configurados"
        },
        {
            "name": "CI/CD Integration",
            "check": lambda t: (
                t["infraestrutura"]["ci_cd"].get("provider") and
                t["infraestrutura"]["container"].get("registry")
            ),
            "error": "CI/CD requer container registry configurado"
        },
        {
            "name": "IaC Coverage",
            "check": lambda t: (
                t["infraestrutura"]["iac"].get("tool") and
                t["infraestrutura"]["iac"].get("state_location")
            ),
            "error": "IaC requer tool e state location configurados"
        }
    ]
    
    for rule in consistency_rules:
        if not rule["check"](template_content):
            result["errors"].append(f"{rule['name']}: {rule['error']}")
            result["valid"] = False
    
    # Regras de best practices
    best_practices = [
        {
            "name": "Security by Default",
            "check": lambda t: t["compliance"].get("security_scan", False),
            "warning": "Recomendado habilitar security scan"
        },
        {
            "name": "Monitoring Enabled",
            "check": lambda t: t["compliance"].get("monitoring_enabled", False),
            "warning": "Recomendado habilitar monitoring"
        },
        {
            "name": "Backup Configured",
            "check": lambda t: t["compliance"].get("backup_configured", False),
            "warning": "Recomendado configurar backup"
        }
    ]
    
    for practice in best_practices:
        if not practice["check"](template_content):
            result["warnings"].append(f"{practice['name']}: {practice['warning']}")
    
    # Calcular score lógico
    total_rules = len(consistency_rules) + len(best_practices)
    passed_rules = sum([
        rule["check"](template_content) for rule in consistency_rules
    ]) + sum([
        practice["check"](template_content) for practice in best_practices
    ])
    
    result["score"] = int((passed_rules / total_rules) * 100) if total_rules > 0 else 0
    
    return result


async def validate_security(template_content: dict) -> dict:
    """
    Valida aspectos de segurança
    
    Args:
        template_content: Conteúdo do template
        
    Returns:
        dict: Resultado da validação de segurança
    """
    result = {
        "valid": True,
        "score": 0,
        "issues": [],
        "recommendations": []
    }
    
    # Security checks
    security_checks = [
        {
            "name": "Container Security",
            "check": lambda t: t["compliance"].get("security_scan", False),
            "issue": "Security scan não configurado para containers",
            "recommendation": "Configure SAST/SCA no pipeline de CI/CD"
        },
        {
            "name": "Secrets Management",
            "check": lambda t: t["compliance"].get("secrets_management", False),
            "issue": "Secrets management não configurado",
            "recommendation": "Use AWS Secrets Manager, Azure Key Vault ou similar"
        },
        {
            "name": "Network Security",
            "check": lambda t: (
                t["infraestrutura"]["stack"]["cloud_provider"] and
                t["infraestrutura"]["iac"]["tool"]
            ),
            "issue": "Network security não validado",
            "recommendation": "Configure security groups, firewalls e VPC"
        },
        {
            "name": "Access Control",
            "check": lambda t: t["history"] and len(t["history"]) > 0,
            "issue": "Audit trail não configurado",
            "recommendation": "Implemente logging e auditoria de acessos"
        }
    ]
    
    for check in security_checks:
        if not check["check"](template_content):
            result["issues"].append({
                "type": check["name"],
                "description": check["issue"],
                "recommendation": check["recommendation"],
                "severity": "high"
            })
            result["valid"] = False
        else:
            result["recommendations"].append(f"✅ {check['name']} configurado")
    
    # Calcular score de segurança
    total_checks = len(security_checks)
    passed_checks = sum([check["check"](template_content) for check in security_checks])
    result["score"] = int((passed_checks / total_checks) * 100) if total_checks > 0 else 0
    
    return result


async def validate_performance(template_content: dict) -> dict:
    """
    Valida aspectos de performance
    
    Args:
        template_content: Conteúdo do template
        
    Returns:
        dict: Resultado da validação de performance
    """
    result = {
        "valid": True,
        "score": 0,
        "metrics": {},
        "recommendations": []
    }
    
    # Performance checks
    performance_checks = [
        {
            "name": "Auto-scaling",
            "check": lambda t: t["infraestrutura"]["iac"].get("tool") == "TERRAFORM",
            "recommendation": "Configure auto-scaling groups no Terraform"
        },
        {
            "name": "CDN Configuration",
            "check": lambda t: t["infraestrutura"]["stack"]["cloud_provider"] in ["AWS", "GCP", "AZURE"],
            "recommendation": "Configure CDN para melhorar performance"
        },
        {
            "name": "Database Optimization",
            "check": lambda t: t["infraestrutura"]["stack"]["database"] in ["POSTGRES", "MYSQL"],
            "recommendation": "Configure connection pooling e indexes"
        },
        {
            "name": "Caching Strategy",
            "check": lambda t: t["infraestrutura"]["stack"]["database"] == "REDIS" or 
                          t["compliance"].get("monitoring_enabled", False),
            "recommendation": "Implemente caching com Redis ou similar"
        }
    ]
    
    for check in performance_checks:
        if check["check"](template_content):
            result["recommendations"].append(f"✅ {check['name']} otimizado")
        else:
            result["recommendations"].append(f"⚠️ {check['recommendation']}")
    
    # Simular métricas de performance
    result["metrics"] = {
        "expected_response_time": "< 200ms",
        "expected_throughput": "> 1000 RPS",
        "expected_availability": "99.9%",
        "expected_recovery_time": "< 5 min"
    }
    
    # Calcular score de performance
    total_checks = len(performance_checks)
    optimized_checks = sum([check["check"](template_content) for check in performance_checks])
    result["score"] = int((optimized_checks / total_checks) * 100) if total_checks > 0 else 0
    
    return result


async def validate_compliance(template_content: dict) -> dict:
    """
    Valida requisitos de compliance
    
    Args:
        template_content: Conteúdo do template
        
    Returns:
        dict: Resultado da validação de compliance
    """
    result = {
        "valid": True,
        "score": 0,
        "compliance_items": [],
        "violations": []
    ]
    
    # Compliance frameworks
    compliance_frameworks = [
        {
            "name": "SOC 2",
            "requirements": [
                {"check": lambda t: t["compliance"].get("security_scan"), "item": "Security Monitoring"},
                {"check": lambda t: t["compliance"].get("backup_configured"), "item": "Backup and Recovery"},
                {"check": lambda t: t["compliance"].get("monitoring_enabled"), "item": "System Monitoring"}
            ]
        },
        {
            "name": "GDPR",
            "requirements": [
                {"check": lambda t: t["compliance"].get("secrets_management"), "item": "Data Protection"},
                {"check": lambda t: t["history"] and len(t["history"]) > 0, "item": "Audit Trail"}
            ]
        },
        {
            "name": "PCI DSS",
            "requirements": [
                {"check": lambda t: t["compliance"].get("security_scan"), "item": "Security Testing"},
                {"check": lambda t: t["compliance"].get("secrets_management"), "item": "Encryption"}
            ]
        }
    ]
    
    for framework in compliance_frameworks:
        framework_result = {
            "framework": framework["name"],
            "compliant": True,
            "items": []
        }
        
        for requirement in framework["requirements"]:
            compliant = requirement["check"](template_content)
            framework_result["items"].append({
                "requirement": requirement["item"],
                "compliant": compliant
            })
            
            if not compliant:
                framework_result["compliant"] = False
                result["violations"].append({
                    "framework": framework["name"],
                    "requirement": requirement["item"],
                    "severity": "medium"
                })
        
        result["compliance_items"].append(framework_result)
        
        if not framework_result["compliant"]:
            result["valid"] = False
    
    # Calcular score de compliance
    total_requirements = sum(len(f["requirements"]) for f in compliance_frameworks)
    compliant_requirements = sum(
        len([item for item in f["items"] if item["compliant"]])
        for f in result["compliance_items"]
    )
    
    result["score"] = int((compliant_requirements / total_requirements) * 100) if total_requirements > 0 else 0
    
    return result


# FUNÇÕES AUXILIARES

def get_nested_value(data: dict, path: str) -> any:
    """
    Obtém valor aninhado de dicionário usando path notation
    
    Args:
        data: Dicionário de dados
        path: Path no formato "level1.level2.level3"
        
    Returns:
        any: Valor encontrado ou None
    """
    keys = path.split('.')
    current = data
    
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    
    return current


def calculate_final_score(*validations: dict) -> int:
    """
    Calcula score final baseado em todas as validações
    
    Args:
        *validations: Resultados das validações
        
    Returns:
        int: Score final 0-100
    """
    total_score = 0
    total_weight = 0
    
    weights = {
        "structure": 20,
        "content": 25,
        "logic": 25,
        "security": 15,
        "performance": 10,
        "compliance": 5
    }
    
    validation_types = ["structure", "content", "logic", "security", "performance", "compliance"]
    
    for i, validation in enumerate(validations):
        if validation and "score" in validation:
            weight = weights.get(validation_types[i], 10)
            total_score += validation["score"] * weight
            total_weight += weight
    
    return int(total_score / total_weight) if total_weight > 0 else 0


def generate_issues(*validations: dict) -> list[dict]:
    """
    Gera lista consolidada de issues
    
    Args:
        *validations: Resultados das validações
        
    Returns:
        list[dict]: Lista de issues
    """
    all_issues = []
    
    for validation in validations:
        if validation:
            if "errors" in validation:
                for error in validation["errors"]:
                    all_issues.append({
                        "type": "error",
                        "description": error,
                        "severity": "high"
                    })
            
            if "issues" in validation:
                all_issues.extend(validation["issues"])
    
    return all_issues


def generate_recommendations(template_content: dict, score: int, issues: list[dict]) -> list[str]:
    """
    Gera recomendações baseadas no template e issues
    
    Args:
        template_content: Conteúdo do template
        score: Score final
        issues: Issues encontrados
        
    Returns:
        list[str]: Lista de recomendações
    """
    recommendations = []
    
    # Recomendações baseadas no score
    if score < 60:
        recommendations.append("⚠️ Score baixo (< 60). Reconfiguração obrigatória recomendada.")
    elif score < 80:
        recommendations.append("⚠️ Score médio (60-79). Revisar e corrigir issues críticos.")
    else:
        recommendations.append("✅ Score bom (≥ 80). Configuração aprovada.")
    
    # Recomendações baseadas em issues
    for issue in issues:
        if issue["severity"] == "high":
            recommendations.append(f"🔴 CRÍTICO: {issue['description']}")
    
    # Recomendações específicas
    if not template_content["compliance"]["security_scan"]:
        recommendations.append("🔒 Configure security scanning no pipeline")
    
    if not template_content["compliance"]["monitoring_enabled"]:
        recommendations.append("📊 Configure monitoring e alertas")
    
    if template_content["infraestrutura"]["iac"]["coverage"] < 50:
        recommendations.append("🏗️ Aumente cobertura de IaC para > 50%")
    
    return recommendations


def determine_proceed_status(score: int, validation_level: str, issues: list[dict]) -> bool:
    """
    Determina se pode prosseguir baseado no score e nível de validação
    
    Args:
        score: Score final
        validation_level: Nível de validação (basic|complete|strict)
        issues: Issues encontrados
        
    Returns:
        bool: Pode prosseguir
    """
    # Thresholds por nível
    thresholds = {
        "basic": 60,
        "complete": 80,
        "strict": 90
    }
    
    threshold = thresholds.get(validation_level, 80)
    
    # Verificar score mínimo
    if score < threshold:
        return False
    
    # Verificar issues críticos
    critical_issues = [issue for issue in issues if issue.get("severity") == "high"]
    if critical_issues and validation_level == "strict":
        return False
    
    return True


# EXEMPLO DE USO

if __name__ == "__main__":
    """
    Exemplo de como a função seria chamada no MCP:
    
    result = await validate_infrastructure_quality({
        "infrastructure_path": "infra/api-produtos/",
        "template_content": template_json,
        "validation_level": "complete",
        "check_security": True,
        "check_performance": True,
        "check_compliance": True,
        "project_context": {
            "industry": "fintech",
            "compliance_required": ["PCI-DSS", "SOC2"]
        }
    })
    
    print(f"Validation Success: {result['success']}")
    print(f"Final Score: {result['score']}")
    print(f"Can Proceed: {result['can_proceed']}")
    print(f"Issues Found: {len(result['issues'])}")
    """
    
    print("Esta é uma função de referência para implementação no MCP.")
    print("NÃO EXECUTÁVEL LOCALMENTE.")
    print("Consulte MCP_INTEGRATION.md para detalhes de implementação.")
