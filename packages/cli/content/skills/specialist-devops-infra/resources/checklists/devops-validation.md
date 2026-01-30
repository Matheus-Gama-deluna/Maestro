# ✅ Checklist de Validação - DevOps e Infraestrutura

## Visão Geral

Checklist automatizado para validação da qualidade e completude da infraestrutura configurada pelo especialista em DevOps.

## 🎯 Critérios de Validação

### 1. Stack Tecnológica (20 pontos)

#### ✅ Linguagem (5 pontos)
- [ ] Linguagem principal definida (`NODE|PYTHON|JAVA|GO|RUST`)
- [ ] Versão da linguagem especificada
- [ ] Compatibilidade com framework validada

#### ✅ Framework (5 pontos)
- [ ] Framework definido (`NEXT|NEST|DJANGO|FASTAPI|SPRING`)
- [ ] Versão do framework especificada
- [ ] Boas práticas do framework aplicadas

#### ✅ Database (5 pontos)
- [ ] Database definida (`POSTGRES|MYSQL|MONGO|REDIS`)
- [ ] Versão do database especificada
- [ ] Configuração de conexão validada

#### ✅ Cloud Provider (5 pontos)
- [ ] Provider definido (`AWS|GCP|AZURE`)
- [ ] Região especificada
- [ ] Credenciais configuradas

### 2. Ambientes Configurados (20 pontos)

#### ✅ Ambiente Dev (7 pontos)
- [ ] URL definida
- [ ] Status configurado (`active|pending|inactive`)
- [ ] Last deploy registrado
- [ ] Recursos alocados
- [ ] Configurações específicas do ambiente

#### ✅ Ambiente Staging (7 pontos)
- [ ] URL definida
- [ ] Status configurado (`active|pending|inactive`)
- [ ] Last deploy registrado
- [ ] Mirror de produção
- [ ] Dados de teste configurados

#### ✅ Ambiente Prod (6 pontos)
- [ ] URL definida
- [ ] Status configurado (`active|pending|inactive`)
- [ ] Last deploy registrado
- [ ] Alta disponibilidade configurada
- [ ] Backup ativo

### 3. CI/CD Pipeline (20 pontos)

#### ✅ Provider (5 pontos)
- [ ] Provider definido (`GITHUB_ACTIONS|GITLAB_CI`)
- [ ] Configuração inicial realizada
- [ ] Webhooks configurados
- [ ] Permissões adequadas

#### ✅ Pipeline URL (5 pontos)
- [ ] URL do pipeline acessível
- [ ] Status do pipeline visível
- [ ] Histórico de execuções disponível
- [ ] Logs acessíveis

#### ✅ Pipeline Config (5 pontos)
- [ ] Build automatizado configurado
- [ ] Testes integrados no pipeline
- [ ] Deploy automatizado configurado
- [ ] Rollback implementado

#### ✅ Quality Gates (5 pontos)
- [ ] Análise estática configurada
- [ ] Testes automatizados obrigatórios
- [ ] Security scan integrado
- [ ] Aprovação manual configurada

### 4. Containerização (15 pontos)

#### ✅ Registry (5 pontos)
- [ ] Registry configurado
- [ ] Permissões de push/pull
- [ ] Política de retenção definida
- [ ] Security scanning habilitado

#### ✅ Image Name (5 pontos)
- [ ] Nome da imagem definido
- [ ] Padrão de nomenclatura seguido
- [ ] Tags semânticas implementadas
- [ ] Documentação atualizada

#### ✅ Latest Tag (5 pontos)
- [ ] Tag latest atualizada
- [ ] Versionamento consistente
- [ ] Imagem otimizada (size)
- [ ] Security scan passed

### 5. Infrastructure as Code (15 pontos)

#### ✅ IaC Tool (5 pontos)
- [ ] Tool definida (`TERRAFORM|PULUMI`)
- [ ] Versão especificada
- [ ] Providers configurados
- [ ] State management configurado

#### ✅ State Location (5 pontos)
- [ ] Localização do state definida
- [ ] Backup do state configurado
- [ ] Acesso seguro ao state
- [ ] Versionamento do state

#### ✅ Coverage (5 pontos)
- [ ] Cobertura de recursos ≥ 80%
- [ ] Módulos reutilizáveis
- [ ] Variáveis externalizadas
- [ ] Outputs úteis definidos

### 6. Compliance (10 pontos)

#### ✅ Security Scan (3 pontos)
- [ ] SAST configurado
- [ ] SCA configurado
- [ ] Container scan configurado
- [ ] Relatórios gerados

#### ✅ Secrets Management (2 pontos)
- [ ] Secrets externalizados
- [ ] Rotation configurada
- [ ] Access control implementado
- [ ] Audit trail ativo

#### ✅ Backup Configured (2 pontos)
- [ ] Backup automático configurado
- [ ] Retention policy definida
- [ ] Restore testado
- [ ] Cross-region backup

#### ✅ Monitoring Enabled (3 pontos)
- [ ] Métricas coletadas
- [ ] Logs centralizados
- [ ] Alertas configurados
- [ ] Dashboards criados

## 📊 Cálculo de Score

### Fórmula
```
Score Total = Σ (Pontos Obtidos / Pontos Possíveis) × 100
```

### Thresholds
- **Aprovação Automática**: ≥ 80 pontos
- **Revisão Manual**: 60-79 pontos
- **Reconfiguração Obrigatória**: < 60 pontos

### Exemplo de Cálculo
```
Stack Tecnológica: 18/20 (90%)
Ambientes: 17/20 (85%)
CI/CD: 19/20 (95%)
Containerização: 13/15 (87%)
IaC: 14/15 (93%)
Compliance: 9/10 (90%)

Score Total = (18+17+19+13+14+9) / (20+20+20+15+15+10) × 100
Score Total = 90 / 100 × 100 = 90 pontos ✅
```

## 🔍 Validação Automática

### Checks de Sintaxe
```python
def validate_json_structure(template):
    """Valida estrutura JSON do template"""
    required_fields = [
        "infraestrutura.stack",
        "infraestrutura.ambientes",
        "infraestrutura.ci_cd",
        "infraestrutura.container",
        "infraestrutura.iac",
        "compliance"
    ]
    
    for field in required_fields:
        if not get_nested_value(template, field):
            return False, f"Campo obrigatório ausente: {field}"
    
    return True, "Estrutura válida"
```

### Checks de Valor
```python
def validate_enum_values(template):
    """Valida valores permitidos"""
    enums = {
        "infraestrutura.stack.language": ["NODE", "PYTHON", "JAVA", "GO", "RUST"],
        "infraestrutura.stack.framework": ["NEXT", "NEST", "DJANGO", "FASTAPI", "SPRING"],
        "infraestrutura.stack.database": ["POSTGRES", "MYSQL", "MONGO", "REDIS"],
        "infraestrutura.stack.cloud_provider": ["AWS", "GCP", "AZURE"],
        "infraestrutura.ci_cd.provider": ["GITHUB_ACTIONS", "GITLAB_CI"],
        "infraestrutura.iac.tool": ["TERRAFORM", "PULUMI"]
    }
    
    for field, allowed_values in enums.items():
        value = get_nested_value(template, field)
        if value and value not in allowed_values:
            return False, f"Valor inválido em {field}: {value}"
    
    return True, "Valores válidos"
```

### Checks de Lógica
```python
def validate_business_rules(template):
    """Valida regras de negócio"""
    issues = []
    
    # Regra: Prod não pode ser pending se dev está active
    if (template["infraestrutura"]["ambientes"]["prod"]["status"] == "pending" and
        template["infraestrutura"]["ambientes"]["dev"]["status"] == "active"):
        issues.append("Ambiente prod não pode estar pending com dev active")
    
    # Regra: CI/CD configurado requer pipeline_url
    if (template["infraestrutura"]["ci_cd"]["status"] == "configured" and
        not template["infraestrutura"]["ci_cd"]["pipeline_url"]):
        issues.append("CI/CD configurado requer pipeline_url")
    
    # Regra: Container registry requer image_name
    if (template["infraestrutura"]["container"]["registry"] and
        not template["infraestrutura"]["container"]["image_name"]):
        issues.append("Container registry requer image_name")
    
    return len(issues) == 0, issues
```

## 🚀 Fluxo de Validação

### 1. Validação Inicial
```python
async def validate_initial_setup(template_content):
    """Validação inicial do template"""
    
    # Validação de estrutura
    structure_valid, structure_msg = validate_json_structure(template_content)
    if not structure_valid:
        return {"success": False, "error": structure_msg}
    
    # Validação de valores
    values_valid, values_msg = validate_enum_values(template_content)
    if not values_valid:
        return {"success": False, "error": values_msg}
    
    # Validação de lógica
    logic_valid, logic_issues = validate_business_rules(template_content)
    if not logic_valid:
        return {"success": False, "errors": logic_issues}
    
    return {"success": True, "message": "Validação inicial aprovada"}
```

### 2. Cálculo de Score
```python
def calculate_quality_score(template_content):
    """Calcula score de qualidade"""
    
    score_breakdown = {
        "stack_tecnologica": calculate_stack_score(template_content),
        "ambientes": calculate_environments_score(template_content),
        "ci_cd": calculate_cicd_score(template_content),
        "container": calculate_container_score(template_content),
        "iac": calculate_iac_score(template_content),
        "compliance": calculate_compliance_score(template_content)
    }
    
    total_score = sum(score_breakdown.values())
    max_score = 100
    
    return {
        "total_score": total_score,
        "max_score": max_score,
        "percentage": (total_score / max_score) * 100,
        "breakdown": score_breakdown,
        "can_proceed": total_score >= 80
    }
```

### 3. Geração de Relatório
```python
def generate_validation_report(template_content, score_result):
    """Gera relatório detalhado de validação"""
    
    report = {
        "validation_timestamp": datetime.now().isoformat(),
        "template_id": template_content.get("id", "unknown"),
        "score": score_result,
        "status": "approved" if score_result["can_proceed"] else "rejected",
        "recommendations": generate_recommendations(template_content, score_result),
        "next_steps": generate_next_steps(score_result)
    }
    
    return report
```

## 📋 Recomendações Automáticas

### Para Score < 80
```python
def generate_recommendations(template_content, score_result):
    """Gera recomendações baseadas no score"""
    
    recommendations = []
    
    if score_result["breakdown"]["stack_tecnologica"] < 15:
        recommendations.append("Complete a definição da stack tecnológica")
    
    if score_result["breakdown"]["ambientes"] < 15:
        recommendations.append("Configure todos os ambientes obrigatórios")
    
    if score_result["breakdown"]["ci_cd"] < 15:
        recommendations.append("Implemente pipeline de CI/CD completo")
    
    if score_result["breakdown"]["container"] < 10:
        recommendations.append("Configure containerização e registry")
    
    if score_result["breakdown"]["iac"] < 10:
        recommendations.append("Implemente infraestrutura como código")
    
    if score_result["breakdown"]["compliance"] < 8:
        recommendations.append("Configure requisitos de compliance")
    
    return recommendations
```

## 🔄 Validação Contínua

### Monitoramento de Drift
```python
def detect_infrastructure_drift(current_state, expected_state):
    """Detecta drift na infraestrutura"""
    
    drift_report = {
        "timestamp": datetime.now().isoformat(),
        "drift_detected": False,
        "drifts": []
    }
    
    # Comparar estados
    for key in expected_state:
        if current_state.get(key) != expected_state[key]:
            drift_report["drift_detected"] = True
            drift_report["drifts"].append({
                "resource": key,
                "expected": expected_state[key],
                "current": current_state.get(key)
            })
    
    return drift_report
```

### Validação de Compliance
```python
def validate_compliance_requirements(template_content):
    """Valida requisitos de compliance"""
    
    compliance_checks = {
        "security_scan_enabled": template_content["compliance"]["security_scan"],
        "secrets_managed": template_content["compliance"]["secrets_management"],
        "backup_configured": template_content["compliance"]["backup_configured"],
        "monitoring_enabled": template_content["compliance"]["monitoring_enabled"]
    }
    
    compliance_score = sum(compliance_checks.values()) / len(compliance_checks) * 100
    
    return {
        "compliance_score": compliance_score,
        "checks": compliance_checks,
        "compliant": compliance_score >= 80
    }
```

## 📊 Métricas de Validação

### KPIs do Processo
- **Tempo médio de validação**: < 2 minutos
- **Taxa de aprovação**: > 85%
- **Score médio**: > 80 pontos
- **Falsos positivos**: < 5%

### Métricas de Qualidade
- **Coverage de validação**: 100%
- **Precisão das recomendações**: > 90%
- **Tempo de correção**: < 10 minutos
- **Satisfação do usuário**: > 95%

---

## 🎯 Implementação no MCP

### Função de Validação
```python
async def validate_infrastructure_quality(params):
    """Função MCP para validação automatizada"""
    
    template_content = params["template_content"]
    
    # Validação inicial
    initial_validation = await validate_initial_setup(template_content)
    if not initial_validation["success"]:
        return initial_validation
    
    # Cálculo de score
    score_result = calculate_quality_score(template_content)
    
    # Geração de relatório
    report = generate_validation_report(template_content, score_result)
    
    return {
        "success": True,
        "validation_report": report,
        "can_proceed": score_result["can_proceed"],
        "next_actions": generate_next_actions(score_result)
    }
```

Este checklist garante qualidade consistente e validação automatizada para todas as configurações de infraestrutura.
