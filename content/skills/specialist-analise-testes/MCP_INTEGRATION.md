# MCP Integration Guide - Análise de Testes

## Visão Geral

Este documento descreve como integrar o especialista de Análise de Testes com o servidor MCP externo para automação completa da estratégia de testes.

---

## Arquitetura de Integração

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Skill UI      │    │   MCP Server     │    │  Test Runner    │
│ (Progressive    │◄──►│  (Orquestração)  │◄──►│ (Execução)      │
│  Disclosure)    │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Templates &     │    │  Quality Gates   │    │  CI/CD Pipeline │
│ Examples        │    │  (Validação)     │    │ (Automação)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## Funções MCP Disponíveis

### 1. Inicialização da Estratégia

#### `init_testing_strategy(project_path: str) -> Dict`

**Propósito:** Inicializar estrutura completa de testes para novo projeto

**Parâmetros:**
- `project_path` (string): Caminho absoluto do projeto

**Retorno:**
```json
{
  "status": "success|error",
  "tech_stack": {
    "frontend": "react|vue|angular",
    "backend": "nodejs|python|java",
    "database": "postgresql|mysql|mongodb"
  },
  "structure_created": true,
  "configs_generated": true,
  "next_steps": [
    "Revisar configurações geradas",
    "Executar testes iniciais",
    "Configurar ambiente de testes"
  ]
}
```

**Exemplo de Uso:**
```python
result = await mcp_call("init_testing_strategy", {
  "project_path": "/Users/dev/my-project"
})
```

---

### 2. Validação de Qualidade

#### `validate_testing_quality(project_path: str) -> Dict`

**Propósito:** Analisar qualidade completa da estratégia de testes

**Parâmetros:**
- `project_path` (string): Caminho do projeto

**Retorno:**
```json
{
  "overall_score": 85,
  "status": "good",
  "analyses": {
    "structure": {
      "score": 90,
      "test_files_count": 45,
      "directories_found": 4,
      "configs_found": 3,
      "docs_found": 2
    },
    "coverage": {
      "score": 80,
      "coverage_data": {
        "total": {
          "lines": {"pct": 82},
          "functions": {"pct": 85},
          "branches": {"pct": 78}
        }
      }
    },
    "quality": {
      "score": 85,
      "pass_rate": 96,
      "flaky_rate": 0.5,
      "avg_duration": 150
    },
    "automation": {
      "score": 90,
      "pipeline_configured": true,
      "automation_rate": 92
    },
    "security": {
      "score": 75,
      "critical_vulns": 0,
      "security_tests": 8
    }
  },
  "recommendations": [
    "Aumentar cobertura de branches para 80%",
    "Implementar mais testes de segurança"
  ],
  "gaps": [
    "Testes de performance não implementados"
  ],
  "next_steps": [
    "Adicionar testes de carga",
    "Configurar monitoramento contínuo"
  ]
}
```

---

### 3. Geração de Relatórios

#### `generate_quality_report(project_path: str, format: str) -> str`

**Propósito:** Gerar relatório detalhado de qualidade

**Parâmetros:**
- `project_path` (string): Caminho do projeto
- `format` (string): "markdown" | "html" | "json"

**Retorno:** String com relatório formatado

**Exemplo de Uso:**
```python
report = await mcp_call("generate_quality_report", {
  "project_path": "/Users/dev/my-project",
  "format": "markdown"
})

# Salvar relatório
with open("quality-report.md", "w") as f:
  f.write(report)
```

---

### 4. Atualização de Matriz de Rastreabilidade

#### `update_traceability_matrix(project_path: str, requirements: List[Dict]) -> Dict`

**Propósito:** Atualizar matriz de rastreabilidade com novos requisitos

**Parâmetros:**
- `project_path` (string): Caminho do projeto
- `requirements` (array): Lista de requisitos

**Exemplo de Requisitos:**
```json
[
  {
    "id": "RF001",
    "type": "functional",
    "priority": "high",
    "description": "Usuário deve conseguir fazer login",
    "acceptance_criteria": [
      "Login com email e senha válidos",
      "Redirecionamento para dashboard",
      "Tratamento de erro para credenciais inválidas"
    ]
  }
]
```

**Retorno:**
```json
{
  "status": "success",
  "requirements_mapped": 1,
  "test_cases_found": 3,
  "coverage_metrics": {
    "total_requirements": 1,
    "covered_requirements": 1,
    "coverage_percentage": 100
  },
  "matrix_updated": true
}
```

---

### 5. Configuração de Pipeline

#### `setup_ci_pipeline(project_path: str, platform: str) -> Dict`

**Propósito:** Configurar pipeline CI/CD para testes automatizados

**Parâmetros:**
- `project_path` (string): Caminho do projeto
- `platform` (string): "github" | "gitlab" | "azure"

**Retorno:**
```json
{
  "status": "success",
  "platform": "github",
  "pipeline_configured": true,
  "files_created": [
    ".github/workflows/testing.yml"
  ],
  "next_steps": [
    "Commitar arquivos de configuração",
    "Testar pipeline com um PR",
    "Configurar notificações"
  ]
}
```

---

## Fluxo de Trabalho Integrado

### 1. Inicialização de Projeto

```python
# Passo 1: Detectar stack e inicializar estrutura
init_result = await mcp_call("init_testing_strategy", {
  "project_path": project_path
})

# Passo 2: Configurar pipeline CI/CD
pipeline_result = await mcp_call("setup_ci_pipeline", {
  "project_path": project_path,
  "platform": "github"
})

# Passo 3: Gerar plano de testes inicial
await generate_initial_test_plan(project_path)
```

### 2. Desenvolvimento Contínuo

```python
# Passo 1: Validar qualidade atual
validation = await mcp_call("validate_testing_quality", {
  "project_path": project_path
})

# Passo 2: Gerar relatório semanal
report = await mcp_call("generate_quality_report", {
  "project_path": project_path,
  "format": "markdown"
})

# Passo 3: Atualizar matriz com novos requisitos
await mcp_call("update_traceability_matrix", {
  "project_path": project_path,
  "requirements": new_requirements
})
```

### 3. Preparação para Release

```python
# Passo 1: Validação completa
validation = await mcp_call("validate_testing_quality", {
  "project_path": project_path
})

# Passo 2: Verificar se atende critérios de release
if validation["overall_score"] >= 85:
    # Gerar relatório final
    final_report = await mcp_call("generate_quality_report", {
      "project_path": project_path,
      "format": "html"
    })
    
    # Aprovar release
    await approve_release(project_path, validation)
else:
    # Gerar plano de melhorias
    await generate_improvement_plan(project_path, validation)
```

---

## Configuração do Servidor MCP

### 1. Instalação

```bash
# Instalar servidor MCP de testes
npm install -g @maestro/mcp-testing-server

# Ou via Python
pip install maestro-mcp-testing
```

### 2. Configuração

```yaml
# mcp-config.yml
testing:
  server:
    host: localhost
    port: 3001
    timeout: 30000
  
  quality_gates:
    min_score: 75
    min_coverage: 80
    max_flaky_rate: 1.0
  
  integrations:
    github:
      token: ${GITHUB_TOKEN}
    slack:
      webhook: ${SLACK_WEBHOOK}
    codecov:
      token: ${CODECOV_TOKEN}
```

### 3. Inicialização

```bash
# Iniciar servidor MCP
mcp-testing-server --config mcp-config.yml

# Verificar status
curl http://localhost:3001/health
```

---

## Exemplos Práticos

### Exemplo 1: Projeto React + Node.js

```python
async def setup_react_project(project_path: str):
    """Configura estratégia completa para projeto React"""
    
    # 1. Inicializar estrutura
    init_result = await mcp_call("init_testing_strategy", {
      "project_path": project_path
    })
    
    print(f"Stack detectada: {init_result['tech_stack']}")
    
    # 2. Configurar Jest para unitários
    await configure_jest(project_path, {
      "coverage": {
        "threshold": {
          "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80
          }
        }
      }
    })
    
    # 3. Configurar Playwright para E2E
    await configure_playwright(project_path, {
      "projects": [
        {"name": "chromium"},
        {"name": "firefox"},
        {"name": "webkit"}
      ]
    })
    
    # 4. Setup pipeline GitHub Actions
    await mcp_call("setup_ci_pipeline", {
      "project_path": project_path,
      "platform": "github"
    })
    
    # 5. Gerar plano inicial
    await generate_test_plan(project_path, {
      "strategy": "70/20/10",
      "focus": ["user-authentication", "checkout-flow"]
    })
```

### Exemplo 2: Validação de Qualidade

```python
async def validate_project_quality(project_path: str):
    """Valida e melhora qualidade de testes existentes"""
    
    # 1. Analisar qualidade atual
    validation = await mcp_call("validate_testing_quality", {
      "project_path": project_path
    })
    
    print(f"Score atual: {validation['overall_score']}")
    
    # 2. Identificar gaps críticos
    critical_gaps = [
      gap for gap in validation['gaps'] 
      if 'critical' in gap.lower()
    ]
    
    if critical_gaps:
        print(f"Gaps críticos encontrados: {critical_gaps}")
        
        # 3. Gerar plano de ação
        improvement_plan = await generate_improvement_plan(
            project_path, 
            critical_gaps
        )
        
        # 4. Implementar melhorias automáticas
        for improvement in improvement_plan['automated']:
            await apply_improvement(project_path, improvement)
    
    # 5. Gerar relatório completo
    report = await mcp_call("generate_quality_report", {
      "project_path": project_path,
      "format": "html"
    })
    
    return {
        "validation": validation,
        "report": report,
        "improvements_applied": len(improvement_plan.get('automated', []))
    }
```

---

## Monitoramento e Alertas

### Configuração de Alertas

```python
# Configurar alertas automáticos
await configure_alerts(project_path, {
    "rules": [
        {
            "name": "Baixa Cobertura",
            "condition": "coverage < 80",
            "severity": "high",
            "channels": ["slack", "email"]
        },
        {
            "name": "Testes Flaky",
            "condition": "flaky_rate > 2",
            "severity": "medium",
            "channels": ["slack"]
        }
    ]
})
```

### Dashboard de Qualidade

```python
# Gerar dashboard em tempo real
dashboard_data = await generate_quality_dashboard(project_path, {
    "timeframe": "7d",
    "metrics": [
        "coverage",
        "pass_rate",
        "performance",
        "security"
    ]
})
```

---

## Troubleshooting

### Problemas Comuns

#### 1. Servidor MCP não responde
```bash
# Verificar status
curl http://localhost:3001/health

# Reiniciar servidor
mcp-testing-server --restart
```

#### 2. Timeout na validação
```python
# Aumentar timeout
validation = await mcp_call("validate_testing_quality", {
  "project_path": project_path,
  "timeout": 60000  # 60 segundos
})
```

#### 3. Falha em detectar stack
```python
# Fornecer stack manualmente
await mcp_call("init_testing_strategy", {
  "project_path": project_path,
  "tech_stack": {
    "frontend": "react",
    "backend": "nodejs",
    "database": "postgresql"
  }
})
```

### Logs e Debugging

```python
# Habilitar modo debug
await mcp_call("set_debug_mode", {
  "enabled": True,
  "level": "verbose"
})

# Verificar logs
logs = await mcp_call("get_logs", {
  "limit": 100,
  "level": "error"
})
```

---

## Melhores Práticas

### 1. Performance
- Usar cache para análises repetidas
- Paralelizar validações quando possível
- Limitar escopo das análises

### 2. Segurança
- Validar paths de entrada
- Sanitizar dados sensíveis
- Usar tokens de API seguros

### 3. Manutenibilidade
- Versionar configurações MCP
- Documentar customizações
- Testar integrações regularmente

---

## Suporte e Documentação

### Recursos Adicionais
- [MCP Server Documentation](https://docs.maestro.ai/mcp)
- [Testing Best Practices](https://maestro.ai/testing-guide)
- [API Reference](https://api.maestro.ai/testing)

### Comunidade
- Slack: #mcp-testing
- GitHub Issues: maestro/mcp-testing
- Forum: discuss.maestro.ai

---

**Nota:** Esta integração segue o padrão de skill puramente descritiva com automação externa via MCP, garantindo zero dependência de scripts locais e máxima flexibilidade.
