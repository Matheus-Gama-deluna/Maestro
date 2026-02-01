#!/usr/bin/env python3
"""
Referência para função MCP de inicialização de segurança.
Implementação real deve ser feita no servidor MCP externo.
"""

import os
import json
from typing import Dict, Any, List
from datetime import datetime

async def initialize_security_structure(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cria estrutura base de segurança com template padrão.
    
    Args:
        params: Dicionário com parâmetros de inicialização
            - project_path: Caminho do projeto
            - context: Contexto do projeto
            - requirements: Requisitos não-funcionais
            - architecture: Arquitetura do sistema
            - compliance_needs: Lista de compliance aplicável
    
    Returns:
        Dicionário com resultado da inicialização
            - success: Boolean indicando sucesso
            - structure_created: Estrutura criada
            - template_path: Caminho do template gerado
            - next_steps: Próximos passos
            - validation_score: Score inicial de validação
    """
    
    # 1. Validar parâmetros obrigatórios
    required_params = ["project_path", "context", "requirements", "architecture"]
    for param in required_params:
        if param not in params:
            raise ValueError(f"Parâmetro obrigatório ausente: {param}")
    
    project_path = params["project_path"]
    context = params["context"]
    requirements = params["requirements"]
    architecture = params["architecture"]
    compliance_needs = params.get("compliance_needs", [])
    
    # 2. Criar estrutura de diretórios
    security_dir = os.path.join(project_path, "docs", "06-seguranca")
    os.makedirs(security_dir, exist_ok=True)
    
    # Subdiretórios
    subdirs = ["threat-models", "compliance", "policies", "incident-response"]
    for subdir in subdirs:
        os.makedirs(os.path.join(security_dir, subdir), exist_ok=True)
    
    # 3. Carregar template principal
    template_path = "content/skills/specialist-seguranca-informacao/resources/templates/checklist-seguranca.md"
    template_content = load_security_template(template_path)
    
    # 4. Personalizar template com contexto do projeto
    personalized_template = personalize_security_template(
        template_content, 
        context, 
        requirements, 
        architecture, 
        compliance_needs
    )
    
    # 5. Salvar checklist base
    checklist_path = os.path.join(security_dir, "checklist-seguranca.md")
    save_security_checklist(checklist_path, personalized_template)
    
    # 6. Gerar artefatos iniciais
    artifacts = generate_initial_artifacts(security_dir, context, compliance_needs)
    
    # 7. Calcular score inicial
    initial_score = calculate_initial_security_score(params)
    
    # 8. Definir próximos passos
    next_steps = define_security_next_steps(context, compliance_needs, initial_score)
    
    return {
        "success": True,
        "structure_created": {
            "security_dir": security_dir,
            "checklist_path": checklist_path,
            "subdirectories": subdirs,
            "artifacts": artifacts
        },
        "template_path": checklist_path,
        "next_steps": next_steps,
        "validation_score": initial_score,
        "timestamp": datetime.now().isoformat()
    }

def load_security_template(template_path: str) -> str:
    """Carrega template de segurança do arquivo."""
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Template não encontrado: {template_path}")

def personalize_security_template(
    template: str, 
    context: Dict[str, Any], 
    requirements: Dict[str, Any], 
    architecture: Dict[str, Any], 
    compliance_needs: List[str]
) -> str:
    """Personaliza template com contexto específico do projeto."""
    
    # Substituir placeholders
    personalized = template.replace("[Nome do projeto]", context.get("name", "Projeto"))
    personalized = personalized.replace("[Stack tecnológico]", 
                                      ", ".join(architecture.get("stack", [])))
    personalized = personalized.replace("[Tipo de dados]", 
                                      ", ".join(requirements.get("data_types", [])))
    personalized = personalized.replace("[Compliance aplicável]", 
                                      ", ".join(compliance_needs))
    
    # Adicionar seções específicas baseadas no contexto
    if "financial" in requirements.get("data_types", []):
        personalized += add_pci_dss_section()
    
    if "health" in requirements.get("data_types", []):
        personalized += add_hipaa_section()
    
    if "personal" in requirements.get("data_types", []):
        personalized += add_lgpd_section()
    
    return personalized

def add_pci_dss_section() -> str:
    """Adiciona seção específica de PCI-DSS."""
    return """

## PCI-DSS Compliance

### Requisitos Obrigatórios
- [ ] **Network Security:** Firewall configurado e documentado
- [ ] **Data Protection:** Criptografia de dados de cartão
- [ ] **Vulnerability Management:** Scanning trimestral
- [ ] **Access Control:** Acesso restrito e monitorado
- [ ] **Monitoring:** Logging de todas as transações
- [ ] **Policy:** Política de segurança documentada

### Validação
- [ ] **SAQ Type:** [Determinar tipo baseado em volume]
- [ ] **ASV Scan:** Scan aprovado por vendor qualificado
- [ ] **Attestation:** Formulário de atestado preenchido
- [ ] **Documentation:** Evidências mantidas por 1 ano
"""

def add_hipaa_section() -> str:
    """Adiciona seção específica de HIPAA."""
    return """

## HIPAA Compliance

### Privacy Rule
- [ ] **PHI Identification:** Dados de saúde identificados
- [ ] **Minimum Necessary:** Acesso mínimo necessário
- [ ] **Patient Rights:** Direitos dos pacientes implementados
- [ ] **Notice of Privacy:** Aviso de privacidade disponível

### Security Rule
- [ ] **Administrative Safeguards:** Políticas e procedimentos
- [ ] **Physical Safeguards:** Controle de acesso físico
- [ ] **Technical Safeguards:** Controles técnicos implementados
- [ ] **Breach Notification:** Plano de notificação de vazamento
"""

def add_lgpd_section() -> str:
    """Adiciona seção específica de LGPD."""
    return """

## LGPD Compliance

### Base Legal
- [ ] **Consentimento:** Consentimento explícito obtido
- [ ] **Contractual:** Necessidade contratual documentada
- [ ] **Legal Obligation:** Obrigação legal identificada
- [ ] **Vital Interest:** Interesse vital justificado

### Direitos dos Titulares
- [ ] **Confirm:** Confirmação de tratamento
- [ ] **Access:** Acesso aos dados
- [ ] **Correction:** Correção de dados
- [ ] **Deletion:** Direito ao esquecimento
- [ ] **Portability:** Portabilidade de dados
- [ ] **Information:** Informação sobre compartilhamento
- [ ] **Revocation:** Revogação de consentimento

### DPO e Encarregado
- [ ] **DPO Designated:** Encarregado nomeado
- [ ] **Contact Info:** Informações de contato disponíveis
- [ ] **ANPD Registration:** Registro na ANPD (se aplicável)
"""

def save_security_checklist(checklist_path: str, content: str) -> None:
    """Salva checklist de segurança no arquivo."""
    with open(checklist_path, 'w', encoding='utf-8') as f:
        f.write(content)

def generate_initial_artifacts(security_dir: str, context: Dict[str, Any], compliance_needs: List[str]) -> List[str]:
    """Gera artefatos iniciais de segurança."""
    artifacts = []
    
    # Gerar política de segurança básica
    policy_path = os.path.join(security_dir, "policies", "security-policy.md")
    generate_security_policy(policy_path, context)
    artifacts.append(policy_path)
    
    # Gerar plano de incident response
    ir_path = os.path.join(security_dir, "incident-response", "plan.md")
    generate_incident_response_plan(ir_path, context)
    artifacts.append(ir_path)
    
    # Gerar matriz de compliance
    if compliance_needs:
        compliance_path = os.path.join(security_dir, "compliance", "matrix.md")
        generate_compliance_matrix(compliance_path, compliance_needs)
        artifacts.append(compliance_path)
    
    return artifacts

def generate_security_policy(policy_path: str, context: Dict[str, Any]) -> None:
    """Gera política de segurança básica."""
    policy_content = f"""# Política de Segurança - {context.get('name', 'Projeto')}

## Visão Geral
Esta política estabelece os requisitos de segurança para o projeto {context.get('name', 'Projeto')}.

## Princípios
1. **Confidencialidade:** Proteger dados sensíveis
2. **Integridade:** Garantir integridade dos dados
3. **Disponibilidade:** Manter serviços disponíveis
4. **Rastreabilidade:** Auditar todas as ações

## Responsabilidades
- **Desenvolvedores:** Implementar secure coding practices
- **Ops:** Manter infraestrutura segura
- **Security:** Monitorar e responder a incidentes
- **Management:** Prover recursos e suporte

## Data: {datetime.now().strftime('%Y-%m-%d')}
"""
    
    with open(policy_path, 'w', encoding='utf-8') as f:
        f.write(policy_content)

def generate_incident_response_plan(ir_path: str, context: Dict[str, Any]) -> None:
    """Gera plano de resposta a incidentes."""
    ir_content = f"""# Plano de Resposta a Incidentes - {context.get('name', 'Projeto')}

## Classificação de Incidentes

### Crítico
- Vazamento de dados sensíveis
- Ransomware
- Comprometimento de sistemas críticos

### Alto
- Acesso não autorizado
- Malware detectado
- DDoS attack

### Médio
- Tentativas de ataque falhadas
- Vulnerabilidades exploráveis
- Configurações inseguras

### Baixo
- Atividades suspeitas
- Políticas violadas
- Eventos de segurança não críticos

## Procedimentos

### 1. Detecção
- Monitoramento 24/7
- Alertas automáticos
- Análise de logs

### 2. Contenção
- Isolar sistemas afetados
- Bloquear IPs maliciosos
- Desabilitar contas comprometidas

### 3. Erradicação
- Remover malware
- Corrigir vulnerabilidades
- Restaurar sistemas

### 4. Recuperação
- Restaurar backups
- Validar sistemas
- Monitorar pós-incidente

### 5. Lições Aprendidas
- Análise root cause
- Documentar incidente
- Melhorar processos

## Contatos
- **Security Team:** security@company.com
- **Management:** management@company.com
- **Legal:** legal@company.com

## Data: {datetime.now().strftime('%Y-%m-%d')}
"""
    
    with open(ir_path, 'w', encoding='utf-8') as f:
        f.write(ir_content)

def generate_compliance_matrix(compliance_path: str, compliance_needs: List[str]) -> None:
    """Gera matriz de compliance."""
    matrix_content = "# Matriz de Compliance\n\n"
    matrix_content += "| Requisito | Status | Evidência | Responsável |\n"
    matrix_content += "|-----------|--------|------------|-------------|\n"
    
    for compliance in compliance_needs:
        matrix_content += f"| {compliance} | Em Progresso | TBD | TBD |\n"
    
    with open(compliance_path, 'w', encoding='utf-8') as f:
        f.write(matrix_content)

def calculate_initial_security_score(params: Dict[str, Any]) -> int:
    """Calcula score inicial de segurança."""
    score = 0
    
    # Base score
    score += 20
    
    # Compliance requirements
    compliance_needs = params.get("compliance_needs", [])
    score += min(30, len(compliance_needs) * 10)
    
    # Data sensitivity
    requirements = params.get("requirements", {})
    data_types = requirements.get("data_types", [])
    if "financial" in data_types:
        score += 15
    if "health" in data_types:
        score += 15
    if "personal" in data_types:
        score += 10
    
    # Architecture complexity
    architecture = params.get("architecture", {})
    if "microservices" in architecture.get("type", ""):
        score += 10
    
    return min(100, score)

def define_security_next_steps(
    context: Dict[str, Any], 
    compliance_needs: List[str], 
    initial_score: int
) -> List[str]:
    """Define próximos passos para implementação de segurança."""
    next_steps = [
        "Revisar OWASP Top 10 e implementar mitigações",
        "Mapear dados sensíveis e classificar criticidade",
        "Definir estratégia de autenticação e autorização",
        "Implementar criptografia em trânsito e em repouso"
    ]
    
    # Adicionar passos específicos de compliance
    if "PCI-DSS" in compliance_needs:
        next_steps.append("Iniciar processo de validação PCI-DSS")
    
    if "LGPD" in compliance_needs:
        next_steps.append("Implementar direitos dos titulares LGPD")
    
    if "HIPAA" in compliance_needs:
        next_steps.append("Implementar safeguards HIPAA")
    
    # Adicionar passos baseados no score
    if initial_score < 50:
        next_steps.insert(0, "Realizar avaliação completa de segurança")
    
    return next_steps

# Exemplo de uso
if __name__ == "__main__":
    # Este é apenas um exemplo de como a função seria chamada
    example_params = {
        "project_path": "/tmp/test_project",
        "context": {
            "name": "Test Project",
            "description": "Test application"
        },
        "requirements": {
            "data_types": ["personal", "financial"]
        },
        "architecture": {
            "type": "microservices",
            "stack": ["Node.js", "MongoDB", "Redis"]
        },
        "compliance_needs": ["LGPD", "PCI-DSS"]
    }
    
    # A chamada real seria feita pelo servidor MCP
    # result = await initialize_security_structure(example_params)
    # print(json.dumps(result, indent=2))