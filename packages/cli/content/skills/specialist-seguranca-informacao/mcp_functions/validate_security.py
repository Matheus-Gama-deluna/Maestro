#!/usr/bin/env python3
"""
Referência para função MCP de validação de segurança.
Implementação real deve ser feita no servidor MCP externo.
"""

import os
import re
import json
from typing import Dict, Any, List, Tuple
from datetime import datetime

async def validate_security_quality(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Valida qualidade do checklist de segurança.
    
    Args:
        params: Dicionário com parâmetros de validação
            - checklist_path: Caminho do checklist
            - project_context: Contexto do projeto
            - compliance_requirements: Requisitos de compliance
            - security_level: Nível de segurança exigido
    
    Returns:
        Dicionário com resultado da validação
            - success: Boolean indicando sucesso
            - validation_score: Score 0-100
            - issues_found: Lista de problemas
            - recommendations: Lista de recomendações
            - compliance_status: Status por compliance
            - quality_gates: Status dos quality gates
    """
    
    # 1. Validar parâmetros obrigatórios
    if "checklist_path" not in params:
        raise ValueError("checklist_path é obrigatório")
    
    checklist_path = params["checklist_path"]
    project_context = params.get("project_context", {})
    compliance_requirements = params.get("compliance_requirements", [])
    security_level = params.get("security_level", "standard")
    
    # 2. Carregar e analisar checklist
    checklist_content = load_checklist_content(checklist_path)
    
    # 3. Validar estrutura do documento
    structure_score = validate_document_structure(checklist_content)
    
    # 4. Validar conteúdo OWASP Top 10
    owasp_score = validate_owasp_coverage(checklist_content)
    
    # 5. Validar implementação técnica
    technical_score = validate_technical_implementation(checklist_content, project_context)
    
    # 6. Validar compliance específico
    compliance_score, compliance_status = validate_compliance_coverage(
        checklist_content, compliance_requirements
    )
    
    # 7. Validar documentação e processos
    documentation_score = validate_documentation_quality(checklist_content)
    
    # 8. Validar métricas e monitoramento
    metrics_score = validate_metrics_implementation(checklist_content)
    
    # 9. Calcular score final
    final_score = calculate_final_validation_score(
        structure_score, owasp_score, technical_score, 
        compliance_score, documentation_score, metrics_score
    )
    
    # 10. Identificar problemas críticos
    issues_found = identify_critical_issues(
        checklist_content, {
            "structure": structure_score,
            "owasp": owasp_score,
            "technical": technical_score,
            "compliance": compliance_score,
            "documentation": documentation_score,
            "metrics": metrics_score
        }
    )
    
    # 11. Gerar recomendações
    recommendations = generate_security_recommendations(
        issues_found, final_score, security_level
    )
    
    # 12. Validar quality gates
    quality_gates = validate_quality_gates(final_score, compliance_status, issues_found)
    
    return {
        "success": final_score >= 85,
        "validation_score": final_score,
        "detailed_scores": {
            "structure": structure_score,
            "owasp": owasp_score,
            "technical": technical_score,
            "compliance": compliance_score,
            "documentation": documentation_score,
            "metrics": metrics_score
        },
        "issues_found": issues_found,
        "recommendations": recommendations,
        "compliance_status": compliance_status,
        "quality_gates": quality_gates,
        "validation_timestamp": datetime.now().isoformat()
    }

def load_checklist_content(checklist_path: str) -> str:
    """Carrega conteúdo do checklist de segurança."""
    try:
        with open(checklist_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Checklist não encontrado: {checklist_path}")

def validate_document_structure(content: str) -> int:
    """Valida estrutura do documento de segurança."""
    score = 0
    max_score = 20
    
    # Verificar seções obrigatórias
    required_sections = [
        "Sumário Executivo",
        "Autenticação e Autorização",
        "Proteção de Dados",
        "Infraestrutura Segura",
        "Compliance",
        "Monitoramento e Resposta"
    ]
    
    sections_found = 0
    for section in required_sections:
        if section.lower() in content.lower():
            sections_found += 1
    
    score += (sections_found / len(required_sections)) * 10
    
    # Verificar formato de checkboxes
    checkboxes = re.findall(r'\[([ x])\]', content)
    if checkboxes:
        checked_ratio = sum(1 for cb in checkboxes if cb == 'x') / len(checkboxes)
        score += checked_ratio * 5
    
    # Verificar Progressive Disclosure
    if len(content) < 5000:  # Documento conciso
        score += 3
    
    # Verificar referências a recursos
    if "resources/" in content or "templates/" in content:
        score += 2
    
    return min(max_score, int(score))

def validate_owasp_coverage(content: str) -> int:
    """Valida cobertura OWASP Top 10."""
    score = 0
    max_score = 30
    
    # OWASP Top 10 2025
    owasp_items = [
        ("Broken Access Control", ["rbac", "access control", "authorization"]),
        ("Cryptographic Failures", ["encryption", "tls", "aes", "bcrypt"]),
        ("Injection", ["sql injection", "xss", "input validation", "prepared statements"]),
        ("Insecure Design", ["threat modeling", "secure by design", "least privilege"]),
        ("Security Misconfiguration", ["hardening", "defaults", "security headers"]),
        ("Vulnerable Components", ["dependency scan", "sbom", "vulnerability scan"]),
        ("ID & Auth Failures", ["mfa", "password policy", "authentication"]),
        ("Software & Data Integrity", ["code signing", "checksum", "integrity"]),
        ("Logging & Monitoring", ["logging", "monitoring", "siem", "alerts"]),
        ("SSRF", ["server-side request forgery", "ssrf", "url validation"])
    ]
    
    items_covered = 0
    for item_name, keywords in owasp_items:
        item_found = False
        for keyword in keywords:
            if keyword.lower() in content.lower():
                item_found = True
                break
        
        if item_found:
            items_covered += 1
            score += 3
    
    return min(max_score, score)

def validate_technical_implementation(content: str, project_context: Dict[str, Any]) -> int:
    """Valida implementação técnica de segurança."""
    score = 0
    max_score = 25
    
    # Autenticação e Autorização
    auth_indicators = ["mfa", "rbac", "jwt", "oauth", "session management"]
    auth_score = sum(1 for indicator in auth_indicators if indicator.lower() in content.lower())
    score += min(8, auth_score * 2)
    
    # Criptografia
    crypto_indicators = ["tls 1.3", "aes-256", "bcrypt", "argon2", "encryption"]
    crypto_score = sum(1 for indicator in crypto_indicators if indicator.lower() in content.lower())
    score += min(6, crypto_score * 2)
    
    # Infraestrutura
    infra_indicators = ["firewall", "waf", "network segmentation", "hardening"]
    infra_score = sum(1 for indicator in infra_indicators if indicator.lower() in content.lower())
    score += min(6, infra_score * 2)
    
    # Supply Chain Security
    supply_chain_indicators = ["dependency scan", "sbom", "code signing", "private registry"]
    supply_score = sum(1 for indicator in supply_chain_indicators if indicator.lower() in content.lower())
    score += min(5, supply_score * 2)
    
    return min(max_score, score)

def validate_compliance_coverage(content: str, compliance_requirements: List[str]) -> Tuple[int, Dict[str, Any]]:
    """Valida cobertura de compliance."""
    score = 0
    max_score = 15
    compliance_status = {}
    
    for compliance in compliance_requirements:
        compliance_lower = compliance.lower()
        compliance_score = 0
        
        if compliance_lower == "lgpd":
            lgpd_indicators = ["consentimento", "direitos dos titulares", "dpo", "anonimização"]
            compliance_score = sum(1 for indicator in lgpd_indicators if indicator.lower() in content.lower())
            compliance_status["LGPD"] = {
                "score": min(5, compliance_score),
                "met": compliance_score >= 3,
                "items_found": compliance_score
            }
        
        elif compliance_lower == "pci-dss":
            pci_indicators = ["tokenization", "saq", "asv", "network security"]
            compliance_score = sum(1 for indicator in pci_indicators if indicator.lower() in content.lower())
            compliance_status["PCI-DSS"] = {
                "score": min(5, compliance_score),
                "met": compliance_score >= 3,
                "items_found": compliance_score
            }
        
        elif compliance_lower == "hipaa":
            hipaa_indicators = ["phi", "privacy rule", "security rule", "breach notification"]
            compliance_score = sum(1 for indicator in hipaa_indicators if indicator.lower() in content.lower())
            compliance_status["HIPAA"] = {
                "score": min(5, compliance_score),
                "met": compliance_score >= 3,
                "items_found": compliance_score
            }
        
        elif compliance_lower == "bacen":
            bacen_indicators = ["resolução 4658", "pix security", "financial data"]
            compliance_score = sum(1 for indicator in bacen_indicators if indicator.lower() in content.lower())
            compliance_status["BACEN"] = {
                "score": min(5, compliance_score),
                "met": compliance_score >= 3,
                "items_found": compliance_score
            }
        
        score += min(5, compliance_score)
    
    return min(max_score, score), compliance_status

def validate_documentation_quality(content: str) -> int:
    """Valida qualidade da documentação."""
    score = 0
    max_score = 15
    
    # Verificar seções de documentação
    doc_sections = ["checklist", "threat model", "runbook", "architecture"]
    doc_score = sum(1 for section in doc_sections if section.lower() in content.lower())
    score += min(8, doc_score * 2)
    
    # Verificar exemplos e evidências
    if "exemplo" in content.lower() or "evidence" in content.lower():
        score += 3
    
    # Verificar processos documentados
    process_indicators = ["processo", "procedimento", "passo a passo", "workflow"]
    process_score = sum(1 for indicator in process_indicators if indicator.lower() in content.lower())
    score += min(4, process_score)
    
    return min(max_score, score)

def validate_metrics_implementation(content: str) -> int:
    """Valida implementação de métricas e monitoramento."""
    score = 0
    max_score = 10
    
    # Verificar SLO/SLI
    if "slo" in content.lower() or "sli" in content.lower():
        score += 3
    
    # Verificar KPIs
    if "kpi" in content.lower() or "métrica" in content.lower():
        score += 2
    
    # Verificar dashboard
    if "dashboard" in content.lower() or "monitoring" in content.lower():
        score += 2
    
    # Verificar alerting
    if "alert" in content.lower() or "notification" in content.lower():
        score += 2
    
    # Verificar relatórios
    if "relatório" in content.lower() or "report" in content.lower():
        score += 1
    
    return min(max_score, score)

def calculate_final_validation_score(
    structure_score: int, owasp_score: int, technical_score: int,
    compliance_score: int, documentation_score: int, metrics_score: int
) -> int:
    """Calcula score final de validação."""
    # Pesos para cada categoria
    weights = {
        "structure": 0.20,
        "owasp": 0.30,
        "technical": 0.25,
        "compliance": 0.15,
        "documentation": 0.05,
        "metrics": 0.05
    }
    
    final_score = (
        structure_score * weights["structure"] +
        owasp_score * weights["owasp"] +
        technical_score * weights["technical"] +
        compliance_score * weights["compliance"] +
        documentation_score * weights["documentation"] +
        metrics_score * weights["metrics"]
    )
    
    return min(100, int(final_score))

def identify_critical_issues(content: str, scores: Dict[str, int]) -> List[Dict[str, Any]]:
    """Identifica problemas críticos no checklist."""
    issues = []
    
    # Problemas críticos baseados em scores baixos
    if scores["owasp"] < 20:
        issues.append({
            "severity": "critical",
            "category": "OWASP Coverage",
            "description": "Cobertura insuficiente do OWASP Top 10",
            "recommendation": "Implementar mitigações para todos os itens do OWASP Top 10"
        })
    
    if scores["technical"] < 15:
        issues.append({
            "severity": "critical",
            "category": "Technical Implementation",
            "description": "Implementação técnica de segurança inadequada",
            "recommendation": "Revisar e implementar controles técnicos essenciais"
        })
    
    if scores["compliance"] < 10:
        issues.append({
            "severity": "high",
            "category": "Compliance",
            "description": "Requisitos de compliance não atendidos",
            "recommendation": "Implementar controles específicos para compliance exigido"
        })
    
    # Verificar ausência de itens críticos no conteúdo
    critical_items = [
        ("mfa", "Autenticação Multifator não implementada"),
        ("encryption", "Criptografia não mencionada"),
        ("logging", "Logging de segurança ausente"),
        ("backup", "Estratégia de backup não definida")
    ]
    
    for item, description in critical_items:
        if item.lower() not in content.lower():
            issues.append({
                "severity": "high",
                "category": "Missing Control",
                "description": description,
                "recommendation": f"Implementar {item} como controle de segurança essencial"
            })
    
    return issues

def generate_security_recommendations(
    issues: List[Dict[str, Any]], 
    final_score: int, 
    security_level: str
) -> List[str]:
    """Gera recomendações de segurança."""
    recommendations = []
    
    # Recomendações baseadas no score
    if final_score < 50:
        recommendations.append("Realizar avaliação completa de segurança com especialistas")
        recommendations.append("Implementar security baseline mínimo antes de prosseguir")
    
    elif final_score < 70:
        recommendations.append("Focar em controles críticos de segurança")
        recommendations.append("Priorizar implementação de OWASP Top 10")
    
    elif final_score < 85:
        recommendations.append("Refinar controles de segurança existentes")
        recommendations.append("Implementar monitoramento e métricas")
    
    # Recomendações baseadas em issues
    for issue in issues:
        if issue["severity"] == "critical":
            recommendations.append(f"CRÍTICO: {issue['recommendation']}")
    
    # Recomendações baseadas no nível de segurança
    if security_level == "high":
        recommendations.extend([
            "Implementar segurança em múltiplas camadas",
            "Realizar testes de penetração regulares",
            "Implementar monitoramento avançado com SIEM"
        ])
    
    elif security_level == "standard":
        recommendations.extend([
            "Implementar controles de segurança padrão",
            "Realizar validações de segurança periódicas",
            "Manter documentação atualizada"
        ])
    
    return list(set(recommendations))  # Remover duplicatas

def validate_quality_gates(
    final_score: int, 
    compliance_status: Dict[str, Any], 
    issues: List[Dict[str, Any]]
) -> Dict[str, bool]:
    """Valida quality gates de segurança."""
    gates = {
        "minimum_score": final_score >= 85,
        "owasp_coverage": final_score >= 70,  # OWASP contribui 30%
        "compliance_met": all(
            status.get("met", False) 
            for status in compliance_status.values()
        ) if compliance_status else True,
        "no_critical_issues": not any(
            issue["severity"] == "critical" 
            for issue in issues
        ),
        "documentation_complete": final_score >= 80
    }
    
    return gates

# Exemplo de uso
if __name__ == "__main__":
    # Este é apenas um exemplo de como a função seria chamada
    example_params = {
        "checklist_path": "/tmp/security_checklist.md",
        "project_context": {
            "name": "Test Project",
            "type": "fintech"
        },
        "compliance_requirements": ["LGPD", "PCI-DSS"],
        "security_level": "high"
    }
    
    # A chamada real seria feita pelo servidor MCP
    # result = await validate_security_quality(example_params)
    # print(json.dumps(result, indent=2))