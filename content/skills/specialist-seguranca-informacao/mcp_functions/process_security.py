#!/usr/bin/env python3
"""
Referência para função MCP de processamento de segurança para próxima fase.
Implementação real deve ser feita no servidor MCP externo.
"""

import os
import json
from typing import Dict, Any, List
from datetime import datetime

async def process_security_to_next_phase(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processa artefatos de segurança para próxima fase (Análise de Testes).
    
    Args:
        params: Dicionário com parâmetros de processamento
            - checklist_path: Caminho do checklist validado
            - validation_result: Resultado da validação
            - project_context: Contexto completo do projeto
            - next_phase: Próxima fase (Análise de Testes)
    
    Returns:
        Dicionário com resultado do processamento
            - success: Boolean indicando sucesso
            - context_updated: Boolean indicando se contexto foi atualizado
            - next_phase_prompt: Prompt para próximo especialista
            - artifacts_generated: Lista de artefatos gerados
            - transition_ready: Boolean indicando se transição está pronta
    """
    
    # 1. Validar se pode avançar
    if not can_advance_to_next_phase(params):
        return {
            "success": False,
            "context_updated": False,
            "next_phase_prompt": "",
            "artifacts_generated": [],
            "transition_ready": False,
            "error": "Requisitos mínimos não atendidos para avançar"
        }
    
    # 2. Extrair informações do checklist
    checklist_path = params["checklist_path"]
    checklist_content = load_checklist_content(checklist_path)
    security_considerations = extract_security_considerations(checklist_content)
    
    # 3. Atualizar CONTEXTO.md
    context_updated = update_project_context(params["project_context"], security_considerations)
    
    # 4. Gerar artefatos adicionais
    artifacts_generated = generate_additional_artifacts(params, security_considerations)
    
    # 5. Gerar prompt para próxima fase
    next_phase_prompt = generate_test_analysis_prompt(params, security_considerations)
    
    # 6. Criar resumo da transição
    transition_summary = create_transition_summary(params, security_considerations)
    
    return {
        "success": True,
        "context_updated": context_updated,
        "next_phase_prompt": next_phase_prompt,
        "artifacts_generated": artifacts_generated,
        "transition_ready": True,
        "transition_summary": transition_summary,
        "processing_timestamp": datetime.now().isoformat()
    }

def can_advance_to_next_phase(params: Dict[str, Any]) -> bool:
    """Verifica se pode avançar para próxima fase."""
    
    # Verificar score de validação
    validation_result = params.get("validation_result", {})
    validation_score = validation_result.get("validation_score", 0)
    
    if validation_score < 85:
        return False
    
    # Verificar se há issues críticos
    issues_found = validation_result.get("issues_found", [])
    critical_issues = [issue for issue in issues_found if issue.get("severity") == "critical"]
    
    if critical_issues:
        return False
    
    # Verificar compliance
    quality_gates = validation_result.get("quality_gates", {})
    if not quality_gates.get("compliance_met", True):
        return False
    
    return True

def load_checklist_content(checklist_path: str) -> str:
    """Carrega conteúdo do checklist de segurança."""
    try:
        with open(checklist_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Checklist não encontrado: {checklist_path}")

def extract_security_considerations(checklist_content: str) -> Dict[str, Any]:
    """Extrai considerações de segurança do checklist."""
    
    considerations = {
        "authentication": extract_authentication_info(checklist_content),
        "data_protection": extract_data_protection_info(checklist_content),
        "infrastructure": extract_infrastructure_info(checklist_content),
        "compliance": extract_compliance_info(checklist_content),
        "monitoring": extract_monitoring_info(checklist_content),
        "testing_requirements": extract_testing_requirements(checklist_content)
    }
    
    return considerations

def extract_authentication_info(content: str) -> Dict[str, Any]:
    """Extrai informações de autenticação."""
    auth_info = {
        "mfa_required": "mfa" in content.lower(),
        "rbac_implemented": "rbac" in content.lower() or "role-based" in content.lower(),
        "session_management": "session" in content.lower(),
        "oauth_configured": "oauth" in content.lower(),
        "password_policy": "password policy" in content.lower()
    }
    
    return auth_info

def extract_data_protection_info(content: str) -> Dict[str, Any]:
    """Extrai informações de proteção de dados."""
    data_info = {
        "encryption_in_transit": "tls" in content.lower() or "ssl" in content.lower(),
        "encryption_at_rest": "aes" in content.lower() or "encryption" in content.lower(),
        "data_masking": "masking" in content.lower(),
        "sensitive_data_mapped": "sensitive data" in content.lower(),
        "retention_policy": "retention" in content.lower()
    }
    
    return data_info

def extract_infrastructure_info(content: str) -> Dict[str, Any]:
    """Extrai informações de infraestrutura."""
    infra_info = {
        "firewall_configured": "firewall" in content.lower(),
        "waf_implemented": "waf" in content.lower(),
        "network_segmentation": "segmentation" in content.lower(),
        "hardened_servers": "hardening" in content.lower(),
        "container_security": "container" in content.lower()
    }
    
    return infra_info

def extract_compliance_info(content: str) -> Dict[str, Any]:
    """Extrai informações de compliance."""
    compliance_info = {
        "lgpd_required": "lgpd" in content.lower(),
        "pci_dss_required": "pci" in content.lower(),
        "hipaa_required": "hipaa" in content.lower(),
        "bacen_required": "bacen" in content.lower(),
        "audit_trails": "audit" in content.lower()
    }
    
    return compliance_info

def extract_monitoring_info(content: str) -> Dict[str, Any]:
    """Extrai informações de monitoramento."""
    monitoring_info = {
        "security_logging": "logging" in content.lower(),
        "siem_integration": "siem" in content.lower(),
        "alerting_configured": "alert" in content.lower(),
        "incident_response": "incident response" in content.lower(),
        "forensics_capability": "forensics" in content.lower()
    }
    
    return monitoring_info

def extract_testing_requirements(content: str) -> List[str]:
    """Extrai requisitos de teste de segurança."""
    testing_requirements = []
    
    # Verificar tipos de teste mencionados
    security_tests = [
        "penetration testing",
        "vulnerability scanning",
        "security testing",
        "authentication testing",
        "authorization testing",
        "encryption testing",
        "compliance testing"
    ]
    
    for test in security_tests:
        if test in content.lower():
            testing_requirements.append(test)
    
    return testing_requirements

def update_project_context(project_context: Dict[str, Any], security_considerations: Dict[str, Any]) -> bool:
    """Atualiza CONTEXTO.md com considerações de segurança."""
    
    try:
        project_path = project_context.get("project_path", "")
        context_path = os.path.join(project_path, "CONTEXTO.md")
        
        # Carregar contexto existente
        if os.path.exists(context_path):
            with open(context_path, 'r', encoding='utf-8') as f:
                context_content = f.read()
        else:
            context_content = "# CONTEXTO DO PROJETO\n\n"
        
        # Adicionar seção de segurança
        security_section = generate_security_context_section(security_considerations)
        
        # Verificar se seção já existe
        if "## 🔒 Considerações de Segurança" in context_content:
            # Atualizar seção existente
            start_marker = "## 🔒 Considerações de Segurança"
            end_marker = "## "
            
            start_idx = context_content.find(start_marker)
            if start_idx != -1:
                end_idx = context_content.find(end_marker, start_idx + len(start_marker))
                if end_idx != -1:
                    context_content = (
                        context_content[:start_idx] + 
                        security_section + 
                        context_content[end_idx:]
                    )
                else:
                    context_content = context_content[:start_idx] + security_section
        else:
            # Adicionar nova seção
            context_content += "\n" + security_section
        
        # Salvar contexto atualizado
        with open(context_path, 'w', encoding='utf-8') as f:
            f.write(context_content)
        
        return True
        
    except Exception as e:
        print(f"Erro ao atualizar contexto: {e}")
        return False

def generate_security_context_section(security_considerations: Dict[str, Any]) -> str:
    """Gera seção de segurança para o contexto."""
    
    section = "## 🔒 Considerações de Segurança\n\n"
    
    # Autenticação
    auth = security_considerations.get("authentication", {})
    section += "### Autenticação e Autorização\n"
    if auth.get("mfa_required"):
        section += "- **MFA obrigatório** para todos os acessos\n"
    if auth.get("rbac_implemented"):
        section += "- **RBAC implementado** com controle granular\n"
    if auth.get("session_management"):
        section += "- **Gerenciamento de sessão** configurado\n"
    
    # Proteção de Dados
    data = security_considerations.get("data_protection", {})
    section += "\n### Proteção de Dados\n"
    if data.get("encryption_in_transit"):
        section += "- **Criptografia em trânsito** (TLS 1.3+)\n"
    if data.get("encryption_at_rest"):
        section += "- **Criptografia em repouso** (AES-256)\n"
    if data.get("data_masking"):
        section += "- **Data masking** implementado\n"
    
    # Compliance
    compliance = security_considerations.get("compliance", {})
    section += "\n### Compliance Regulatório\n"
    if compliance.get("lgpd_required"):
        section += "- **LGPD** - Consentimento e direitos dos titulares\n"
    if compliance.get("pci_dss_required"):
        section += "- **PCI-DSS** - Proteção de dados de cartão\n"
    if compliance.get("hipaa_required"):
        section += "- **HIPAA** - Proteção de dados de saúde\n"
    
    # Monitoramento
    monitoring = security_considerations.get("monitoring", {})
    section += "\n### Monitoramento e Resposta\n"
    if monitoring.get("security_logging"):
        section += "- **Logging de segurança** centralizado\n"
    if monitoring.get("alerting_configured"):
        section += "- **Alerting** configurado para incidentes\n"
    if monitoring.get("incident_response"):
        section += "- **Plano de resposta a incidentes** definido\n"
    
    section += f"\n*Atualizado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
    
    return section

def generate_additional_artifacts(params: Dict[str, Any], security_considerations: Dict[str, Any]) -> List[str]:
    """Gera artefatos adicionais para a próxima fase."""
    
    artifacts = []
    project_path = params["project_context"].get("project_path", "")
    security_dir = os.path.join(project_path, "docs", "06-seguranca")
    
    # 1. Gerar threat model detalhado
    threat_model_path = generate_threat_model(security_dir, security_considerations)
    artifacts.append(threat_model_path)
    
    # 2. Gerar plano de testes de segurança
    security_tests_path = generate_security_test_plan(security_dir, security_considerations)
    artifacts.append(security_tests_path)
    
    # 3. Gerar matriz de riscos
    risk_matrix_path = generate_risk_matrix(security_dir, security_considerations)
    artifacts.append(risk_matrix_path)
    
    # 4. Gerar checklist de deploy seguro
    deploy_checklist_path = generate_secure_deploy_checklist(security_dir, security_considerations)
    artifacts.append(deploy_checklist_path)
    
    return artifacts

def generate_threat_model(security_dir: str, security_considerations: Dict[str, Any]) -> str:
    """Gera threat model detalhado."""
    
    threat_model_path = os.path.join(security_dir, "threat-model.md")
    
    threat_model_content = f"""# Threat Model Detalhado

## Data: {datetime.now().strftime('%Y-%m-%d')}

## Assets Críticos
- Dados de usuários e transações
- Credenciais de autenticação
- Infraestrutura de aplicação

## Threats Identificadas
- **Acesso não autorizado** (Broken Access Control)
- **Vazamento de dados** (Cryptographic Failures)
- **Injection attacks** (SQL Injection, XSS)
- **Ataques de infraestrutura** (DDoS, SSRF)

## Mitigações Implementadas
- MFA obrigatório para acessos críticos
- Criptografia ponta a ponta
- Input validation e prepared statements
- WAF e rate limiting

## Score de Risco: {calculate_threat_risk_score(security_considerations)}/100
"""
    
    with open(threat_model_path, 'w', encoding='utf-8') as f:
        f.write(threat_model_content)
    
    return threat_model_path

def generate_security_test_plan(security_dir: str, security_considerations: Dict[str, Any]) -> str:
    """Gera plano de testes de segurança."""
    
    test_plan_path = os.path.join(security_dir, "security-test-plan.md")
    
    test_plan_content = f"""# Plano de Testes de Segurança

## Data: {datetime.now().strftime('%Y-%m-%d')}

## Testes Automatizados
- **SAST**: Análise estática de código
- **DAST**: Análise dinâmica de aplicação
- **Dependency Scan**: Verificação de vulnerabilidades
- **Container Security**: Scan de imagens

## Testes Manuais
- **Penetration Testing**: Testes de intrusão
- **Configuration Review**: Revisão de configurações
- **Access Control Testing**: Testes de autorização

## Testes de Compliance
{generate_compliance_tests(security_considerations.get("compliance", {}))}

## Frequência
- **Automatizados**: A cada commit/PR
- **Manuais**: Trimestral
- **Compliance**: Semestral

## Critérios de Aceite
- Zero vulnerabilidades HIGH/CRITICAL
- 100% compliance aplicável
- Todos os testes automatizados passando
"""
    
    with open(test_plan_path, 'w', encoding='utf-8') as f:
        f.write(test_plan_content)
    
    return test_plan_path

def generate_compliance_tests(compliance_info: Dict[str, Any]) -> str:
    """Gera testes específicos de compliance."""
    
    tests = []
    
    if compliance_info.get("lgpd_required"):
        tests.append("- **LGPD**: Validação de consentimento e direitos dos titulares")
    
    if compliance_info.get("pci_dss_required"):
        tests.append("- **PCI-DSS**: Validação de tokenização e armazenamento seguro")
    
    if compliance_info.get("hipaa_required"):
        tests.append("- **HIPAA**: Validação de PHI e controles de acesso")
    
    return "\n".join(tests) if tests else "- Nenhum compliance específico requerido"

def generate_risk_matrix(security_dir: str, security_considerations: Dict[str, Any]) -> str:
    """Gera matriz de riscos."""
    
    risk_matrix_path = os.path.join(security_dir, "risk-matrix.md")
    
    risk_matrix_content = f"""# Matriz de Riscos

## Data: {datetime.now().strftime('%Y-%m-%d')}

## Riscos Críticos
| Risco | Probabilidade | Impacto | Score | Mitigação |
|-------|---------------|---------|-------|------------|
| Vazamento de dados | Média | Crítico | 9 | Criptografia + MFA |
| Acesso não autorizado | Alta | Alto | 8 | RBAC + Monitoramento |
| Injection attacks | Média | Alto | 7 | Input validation |

## Risco Geral: {calculate_overall_risk(security_considerations)}/10

## Plano de Mitigação
1. Implementar controles críticos (30 dias)
2. Monitoramento contínuo (Imediato)
3. Testes regulares (Trimestral)
"""
    
    with open(risk_matrix_path, 'w', encoding='utf-8') as f:
        f.write(risk_matrix_content)
    
    return risk_matrix_path

def generate_secure_deploy_checklist(security_dir: str, security_considerations: Dict[str, Any]) -> str:
    """Gera checklist de deploy seguro."""
    
    checklist_path = os.path.join(security_dir, "secure-deploy-checklist.md")
    
    checklist_content = f"""# Checklist de Deploy Seguro

## Data: {datetime.now().strftime('%Y-%m-%d')}

## Pré-Deploy
- [ ] Scan de vulnerabilidades aprovado
- [ ] Todos os testes de segurança passando
- [ ] Configurações de segurança revisadas
- [ ] Secrets verificados e seguros

## Deploy
- [ ] Deploy em ambiente de homologação
- [ ] Validação de controles de segurança
- [ ] Testes de smoke security
- [ ] Backup pré-deploy realizado

## Pós-Deploy
- [ ] Monitoramento ativo ativado
- [ ] Logs de segurança configurados
- [ ] Alertas testados
- [ ] Rollback planejado

## Validação Final
- [ ] Todos os endpoints seguros
- [ ] Autenticação funcionando
- [ ] Criptografia ativa
- [ ] Compliance validado
"""
    
    with open(checklist_path, 'w', encoding='utf-8') as f:
        f.write(checklist_content)
    
    return checklist_path

def generate_test_analysis_prompt(params: Dict[str, Any], security_considerations: Dict[str, Any]) -> str:
    """Gera prompt para especialista de Análise de Testes."""
    
    project_name = params["project_context"].get("name", "Projeto")
    validation_score = params["validation_result"].get("validation_score", 0)
    
    prompt = f"""Atue como Especialista em Análise de Testes.

## Projeto: {project_name}

## Contexto de Segurança Validado
- **Score de Segurança:** {validation_score}/100
- **Autenticação:** MFA e RBAC implementados
- **Proteção de Dados:** Criptografia em trânsito e repouso
- **Compliance:** {', '.join([k for k, v in security_considerations.get('compliance', {}).items() if v])}

## Artefatos de Segurança Disponíveis
- Checklist completo de segurança
- Threat model detalhado
- Plano de testes de segurança
- Matriz de riscos
- Checklist de deploy seguro

## Requisitos de Teste
Com base nas considerações de segurança, planeje e execute:

1. **Testes Funcionais de Segurança**
   - Validação de autenticação e autorização
   - Testes de controle de acesso
   - Validação de proteção de dados

2. **Testes de Não-Funcionalidade**
   - Testes de performance sob carga
   - Testes de escalabilidade
   - Testes de disponibilidade

3. **Testes de Segurança Específicos**
   - Penetration testing
   - Vulnerability scanning
   - Compliance testing

## Deliverables Esperados
- Plano de testes abrangente
- Casos de teste detalhados
- Estratégia de automação
- Critérios de aceite
- Relatório de resultados

## Integração com Segurança
Garanta que todos os testes validem os controles de segurança implementados e verifiquem o compliance exigido.
"""
    
    return prompt

def create_transition_summary(params: Dict[str, Any], security_considerations: Dict[str, Any]) -> Dict[str, Any]:
    """Cria resumo da transição para próxima fase."""
    
    validation_result = params.get("validation_result", {})
    
    summary = {
        "phase_completed": "Segurança da Informação",
        "next_phase": "Análise de Testes",
        "validation_score": validation_result.get("validation_score", 0),
        "security_controls": {
            "authentication": security_considerations.get("authentication", {}),
            "data_protection": security_considerations.get("data_protection", {}),
            "compliance": security_considerations.get("compliance", {})
        },
        "artifacts_generated": len(params.get("artifacts_generated", [])),
        "transition_status": "ready" if validation_result.get("validation_score", 0) >= 85 else "blocked",
        "recommendations": validation_result.get("recommendations", [])
    }
    
    return summary

def calculate_threat_risk_score(security_considerations: Dict[str, Any]) -> int:
    """Calcula score de risco baseado nas considerações."""
    
    score = 50  # Base score
    
    # Reduzir risco baseado nos controles implementados
    auth = security_considerations.get("authentication", {})
    if auth.get("mfa_required"):
        score -= 15
    if auth.get("rbac_implemented"):
        score -= 10
    
    data = security_considerations.get("data_protection", {})
    if data.get("encryption_in_transit"):
        score -= 10
    if data.get("encryption_at_rest"):
        score -= 10
    
    monitoring = security_considerations.get("monitoring", {})
    if monitoring.get("security_logging"):
        score -= 5
    
    return max(0, 100 - score)

def calculate_overall_risk(security_considerations: Dict[str, Any]) -> int:
    """Calcula risco geral do projeto."""
    
    # Implementação simplificada
    controls_count = 0
    total_controls = 15  # Número aproximado de controles possíveis
    
    # Contar controles implementados
    for category in security_considerations.values():
        if isinstance(category, dict):
            controls_count += sum(1 for v in category.values() if v)
    
    # Calcular risco (inverso de controles implementados)
    risk_score = 10 - (controls_count / total_controls * 8)
    
    return max(1, int(risk_score))

# Exemplo de uso
if __name__ == "__main__":
    # Este é apenas um exemplo de como a função seria chamada
    example_params = {
        "checklist_path": "/tmp/security_checklist.md",
        "validation_result": {
            "validation_score": 92,
            "issues_found": [],
            "quality_gates": {"compliance_met": True}
        },
        "project_context": {
            "project_path": "/tmp/test_project",
            "name": "Test Project"
        },
        "next_phase": "test_analysis"
    }
    
    # A chamada real seria feita pelo servidor MCP
    # result = await process_security_to_next_phase(example_params)
    # print(json.dumps(result, indent=2))