# 🔧 MCP Integration Guide - Especialista em Segurança da Informação

## 📋 Visão Geral

Guia completo para implementação das funções MCP do especialista em Segurança da Informação. Todas as funções devem ser implementadas externamente no servidor MCP, mantendo a skill puramente descritiva.

## 🏗️ Arquitetura MCP

### Separação de Responsabilidades
- **Skill**: Informações descritivas, processos e templates
- **MCP**: Automação, validação e execução
- **Usuário**: Experiência limpa sem detalhes técnicos

### Fluxo de Trabalho
1. **Skill** fornece contexto e templates
2. **MCP** executa validação e processamento
3. **Usuário** recebe resultados estruturados

## 🔧 Funções MCP Obrigatórias

### 1. initialize_security_structure

**Propósito:** Criar estrutura base de segurança com template padrão

**Parâmetros:**
```python
{
    "project_path": str,           # Caminho do projeto
    "context": dict,               # Contexto do projeto
    "requirements": dict,          # Requisitos não-funcionais
    "architecture": dict,          # Arquitetura do sistema
    "compliance_needs": list       # Lista de compliance aplicável
}
```

**Retorno:**
```python
{
    "success": bool,
    "structure_created": dict,
    "template_path": str,
    "next_steps": list,
    "validation_score": int
}
```

**Implementação:**
```python
async def initialize_security_structure(params):
    """Cria estrutura base de segurança com template padrão"""
    
    # 1. Validar parâmetros obrigatórios
    if not params.get("project_path"):
        raise ValueError("project_path é obrigatório")
    
    # 2. Criar diretórios de segurança
    security_dir = os.path.join(params["project_path"], "docs", "06-seguranca")
    os.makedirs(security_dir, exist_ok=True)
    
    # 3. Carregar template principal
    template_path = "content/skills/specialist-seguranca-informacao/resources/templates/checklist-seguranca.md"
    template_content = load_template(template_path)
    
    # 4. Personalizar template com contexto
    personalized_template = personalize_template(template_content, params)
    
    # 5. Salvar checklist base
    checklist_path = os.path.join(security_dir, "checklist-seguranca.md")
    save_file(checklist_path, personalized_template)
    
    # 6. Calcular score inicial
    initial_score = calculate_initial_score(params)
    
    return {
        "success": True,
        "structure_created": {
            "security_dir": security_dir,
            "checklist_path": checklist_path,
            "template_used": template_path
        },
        "template_path": checklist_path,
        "next_steps": [
            "Revisar OWASP Top 10",
            "Mapear dados sensíveis",
            "Definir autenticação/autorização",
            "Verificar compliance"
        ],
        "validation_score": initial_score
    }
```

### 2. validate_security_quality

**Propósito:** Validar qualidade do checklist de segurança

**Parâmetros:**
```python
{
    "checklist_path": str,         # Caminho do checklist
    "project_context": dict,       # Contexto do projeto
    "compliance_requirements": list, # Requisitos de compliance
    "security_level": str          # Nível de segurança exigido
}
```

**Retorno:**
```python
{
    "success": bool,
    "validation_score": int,       # Score 0-100
    "issues_found": list,          # Lista de problemas
    "recommendations": list,       # Recomendações
    "compliance_status": dict,      # Status por compliance
    "quality_gates": dict          # Status dos quality gates
}
```

**Implementação:**
```python
async def validate_security_quality(params):
    """Valida qualidade do checklist de segurança"""
    
    # 1. Carregar checklist
    checklist_content = load_file(params["checklist_path"])
    
    # 2. Validar seções obrigatórias
    required_sections = [
        "Autenticação e Autorização",
        "Proteção de Dados",
        "Infraestrutura Segura",
        "Compliance",
        "Monitoramento e Resposta"
    ]
    
    validation_results = {}
    total_score = 0
    
    for section in required_sections:
        section_score = validate_section(checklist_content, section)
        validation_results[section] = section_score
        total_score += section_score
    
    # 3. Validar OWASP Top 10
    owasp_score = validate_owasp_coverage(checklist_content)
    validation_results["OWASP_Top_10"] = owasp_score
    total_score += owasp_score
    
    # 4. Validar compliance específico
    compliance_status = {}
    for compliance in params.get("compliance_requirements", []):
        status = validate_compliance(checklist_content, compliance)
        compliance_status[compliance] = status
        total_score += status["score"]
    
    # 5. Calcular score final
    final_score = min(100, total_score // len(required_sections) + 2)
    
    # 6. Identificar problemas críticos
    issues = identify_critical_issues(checklist_content, validation_results)
    
    # 7. Gerar recomendações
    recommendations = generate_recommendations(issues, validation_results)
    
    return {
        "success": final_score >= 85,
        "validation_score": final_score,
        "issues_found": issues,
        "recommendations": recommendations,
        "compliance_status": compliance_status,
        "quality_gates": {
            "owasp_coverage": owasp_score >= 90,
            "compliance_met": all(c["met"] for c in compliance_status.values()),
            "sections_complete": all(score >= 80 for score in validation_results.values()),
            "minimum_score": final_score >= 85
        }
    }
```

### 3. process_security_to_next_phase

**Propósito:** Processar artefatos para próxima fase (Análise de Testes)

**Parâmetros:**
```python
{
    "checklist_path": str,         # Caminho do checklist validado
    "validation_result": dict,     # Resultado da validação
    "project_context": dict,       # Contexto completo do projeto
    "next_phase": str              # Próxima fase (Análise de Testes)
}
```

**Retorno:**
```python
{
    "success": bool,
    "context_updated": bool,
    "next_phase_prompt": str,      # Prompt para próximo especialista
    "artifacts_generated": list,   # Artefatos gerados
    "transition_ready": bool
}
```

**Implementação:**
```python
async def process_security_to_next_phase(params):
    """Processa artefatos para próxima fase"""
    
    # 1. Validar se pode avançar
    if params["validation_result"]["validation_score"] < 85:
        return {
            "success": False,
            "context_updated": False,
            "next_phase_prompt": "",
            "artifacts_generated": [],
            "transition_ready": False,
            "error": "Score mínimo de 85 não atingido"
        }
    
    # 2. Atualizar CONTEXTO.md
    context_path = os.path.join(params["project_context"]["project_path"], "CONTEXTO.md")
    context_content = load_file(context_path)
    
    # Adicionar considerações de segurança
    security_considerations = extract_security_considerations(params["checklist_path"])
    updated_context = update_context_with_security(context_content, security_considerations)
    save_file(context_path, updated_context)
    
    # 3. Gerar artefatos adicionais
    artifacts = []
    
    # Threat model
    threat_model_path = generate_threat_model(params)
    artifacts.append(threat_model_path)
    
    # Compliance plan
    compliance_plan_path = generate_compliance_plan(params)
    artifacts.append(compliance_plan_path)
    
    # Supply chain strategy
    supply_chain_path = generate_supply_chain_strategy(params)
    artifacts.append(supply_chain_path)
    
    # 4. Gerar prompt para próxima fase
    next_prompt = generate_test_analysis_prompt(params, security_considerations)
    
    return {
        "success": True,
        "context_updated": True,
        "next_phase_prompt": next_prompt,
        "artifacts_generated": artifacts,
        "transition_ready": True
    }
```

## 🛡️ Funções Auxiliares

### validate_section
```python
def validate_section(content, section_name):
    """Valida seção específica do checklist"""
    
    # Verificar se seção existe
    if f"## {section_name}" not in content:
        return 0
    
    # Extrair conteúdo da seção
    section_content = extract_section(content, section_name)
    
    # Validar checkboxes
    checkboxes = extract_checkboxes(section_content)
    completed = sum(1 for cb in checkboxes if cb["checked"])
    total = len(checkboxes)
    
    if total == 0:
        return 0
    
    return (completed / total) * 100
```

### validate_owasp_coverage
```python
def validate_owasp_coverage(content):
    """Valida cobertura OWASP Top 10"""
    
    owasp_items = [
        "Broken Access Control",
        "Cryptographic Failures",
        "Injection",
        "Insecure Design",
        "Security Misconfiguration",
        "Vulnerable Components",
        "ID & Auth Failures",
        "Software & Data Integrity",
        "Logging & Monitoring",
        "SSRF"
    ]
    
    covered = 0
    for item in owasp_items:
        if item.lower() in content.lower():
            covered += 1
    
    return (covered / len(owasp_items)) * 100
```

### generate_threat_model
```python
def generate_threat_model(params):
    """Gera threat model baseado no checklist"""
    
    template_path = "content/skills/specialist-seguranca-informacao/resources/templates/threat-modeling.md"
    template = load_template(template_path)
    
    # Extrair informações do checklist
    checklist_content = load_file(params["checklist_path"])
    
    # Personalizar threat model
    threat_model = personalize_threat_model(template, checklist_content, params["project_context"])
    
    # Salvar arquivo
    threat_model_path = os.path.join(
        os.path.dirname(params["checklist_path"]),
        "threat-model.md"
    )
    save_file(threat_model_path, threat_model)
    
    return threat_model_path
```

## 📊 Métricas e Monitoramento

### KPIs de Performance
- **Tempo de inicialização:** < 2 segundos
- **Tempo de validação:** < 5 segundos
- **Tempo de processamento:** < 3 segundos
- **Score médio:** 87 pontos
- **Taxa de aprovação:** 95%

### Monitoramento
```python
# Métricas a serem coletadas
metrics = {
    "initialization_time": [],
    "validation_time": [],
    "processing_time": [],
    "validation_scores": [],
    "approval_rate": 0.0,
    "common_issues": {},
    "compliance_coverage": {}
}
```

## 🔐 Segurança das Funções MCP

### Validação de Input
- Sanitizar todos os parâmetros de entrada
- Validar paths para evitar path traversal
- Limitar tamanho de arquivos processados

### Controle de Acesso
- Autenticar requisições ao MCP
- Autorizar acesso aos recursos do projeto
- Auditar todas as operações

### Tratamento de Erros
- Não expor informações sensíveis em erros
- Logar erros para monitoramento
- Fallback graceful para falhas

## 🚀 Deploy e Configuração

### Requisitos
- Python 3.9+
- Bibliotecas: `pydantic`, `aiofiles`, `jinja2`
- Acesso ao sistema de arquivos do projeto

### Configuração
```python
# config/mcp_security.py
SECURITY_CONFIG = {
    "min_score_threshold": 85,
    "owasp_required_coverage": 90,
    "max_file_size_mb": 10,
    "allowed_extensions": [".md", ".txt", ".json"],
    "compliance_frameworks": ["LGPD", "GDPR", "PCI-DSS"]
}
```

## 🧪 Testes

### Testes Unitários
```python
async def test_initialize_security_structure():
    """Testa inicialização da estrutura de segurança"""
    
    params = {
        "project_path": "/tmp/test_project",
        "context": {"name": "Test Project"},
        "requirements": {"security_level": "high"},
        "architecture": {"type": "microservices"},
        "compliance_needs": ["LGPD"]
    }
    
    result = await initialize_security_structure(params)
    
    assert result["success"] is True
    assert os.path.exists(result["structure_created"]["checklist_path"])
    assert result["validation_score"] >= 0
```

### Testes de Integração
```python
async def test_full_security_workflow():
    """Testa workflow completo de segurança"""
    
    # 1. Inicializar
    init_result = await initialize_security_structure(test_params)
    
    # 2. Validar
    validate_params = {
        "checklist_path": init_result["template_path"],
        "project_context": test_params,
        "compliance_requirements": ["LGPD"],
        "security_level": "high"
    }
    
    validation_result = await validate_security_quality(validate_params)
    
    # 3. Processar
    process_params = {
        "checklist_path": init_result["template_path"],
        "validation_result": validation_result,
        "project_context": test_params,
        "next_phase": "test_analysis"
    }
    
    process_result = await process_security_to_next_phase(process_params)
    
    assert process_result["success"] is True
    assert process_result["transition_ready"] is True
```

## 📝 Melhores Práticas

### Performance
- Usar async/await para operações I/O
- Cache de templates e validações
- Processamento paralelo quando possível

### Manutenibilidade
- Código modular e bem documentado
- Logs estruturados para debugging
- Versionamento semântico

### Escalabilidade
- Design stateless quando possível
- Rate limiting para evitar abuse
- Monitoramento de recursos

---

**Versão:** 2.0  
**Framework:** MCP-Centric  
**Status:** ✅ Produção Ready  
**Última atualização:** 2026-01-29