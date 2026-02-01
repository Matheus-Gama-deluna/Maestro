# MCP Integration Guide - Especialista em Desenvolvimento Frontend

## 🎯 Visão Geral

Este documento descreve como integrar o especialista em Desenvolvimento Frontend com o servidor MCP, implementando automação de inicialização, validação e processamento de artefatos frontend.

## 🏗️ Arquitetura MCP

### Separação de Responsabilidades
- **Skill**: Informações descritivas, processos e templates
- **MCP**: Automação, validação e execução
- **Usuário**: Experiência limpa sem detalhes técnicos

### Funções MCP Obrigatórias
1. `initialize_frontend_structure()` - Cria estrutura base
2. `validate_frontend_quality()` - Valida qualidade dos artefatos
3. `process_frontend_to_next_phase()` - Processa para próxima fase

## 📋 Funções MCP Detalhadas

### 1. initialize_frontend_structure()

**Propósito:** Criar estrutura base de frontend com template padrão

**Parâmetros:**
```python
{
    "project_path": str,           # Caminho do projeto
    "stack": str,                 # React/Vue/Angular/Svelte
    "styling": str,               # Tailwind/Styled Components/Emotion
    "state_management": str,      # Redux/Zustand/Pinia/Vuex
    "testing": str,               # Jest/Vitest + Testing Library
    "build_tool": str,            # Vite/Webpack
    "design_system": str,         # Pure Tailwind/shadcn/Headless UI
    "typescript": bool,           # Usar TypeScript
    "storybook": bool,            # Configurar Storybook
    "eslint": bool,               # Configurar ESLint
    "prettier": bool              # Configurar Prettier
}
```

**Retorno:**
```python
{
    "success": bool,
    "structure_created": dict,
    "template_generated": str,
    "next_steps": list,
    "errors": list
}
```

**Implementação MCP:**
```python
async def initialize_frontend_structure(params):
    """Cria estrutura base de frontend com template padrão"""
    try:
        project_path = params["project_path"]
        stack = params.get("stack", "react")
        
        # Criar estrutura de diretórios
        structure = {
            "src": {
                "components": {},
                "pages": {},
                "hooks": {},
                "types": {},
                "utils": {},
                "tests": {
                    "unit": {},
                    "integration": {},
                    "e2e": {}
                },
                "styles": {},
                "assets": {
                    "images": {},
                    "icons": {},
                    "fonts": {}
                }
            },
            "docs": {
                "10-frontend": {}
            },
            ".storybook": {},
            "public": {}
        }
        
        # Criar diretórios
        for dir_path, subdirs in structure.items():
            full_path = os.path.join(project_path, dir_path)
            os.makedirs(full_path, exist_ok=True)
            
            for subdir in subdirs:
                subdir_path = os.path.join(full_path, subdir)
                os.makedirs(subdir_path, exist_ok=True)
        
        # Gerar template principal
        template_content = await generate_historia_frontend_template(params)
        template_path = os.path.join(project_path, "docs/10-frontend/historia-frontend.md")
        
        with open(template_path, 'w', encoding='utf-8') as f:
            f.write(template_content)
        
        return {
            "success": True,
            "structure_created": structure,
            "template_generated": template_path,
            "next_steps": [
                "1. Configure o design system",
                "2. Defina os componentes principais",
                "3. Implemente os hooks necessários",
                "4. Configure os testes"
            ],
            "errors": []
        }
        
    except Exception as e:
        return {
            "success": False,
            "structure_created": {},
            "template_generated": "",
            "next_steps": [],
            "errors": [str(e)]
        }
```

### 2. validate_frontend_quality()

**Propósito:** Validar qualidade dos componentes frontend

**Parâmetros:**
```python
{
    "project_path": str,         # Caminho do projeto
    "artifact_path": str,        # Caminho do artefato principal
    "threshold": int,             # Score mínimo (default: 75)
    "check_types": list,         # Tipos de validação
    "stack": str,                 # Stack tecnológico
    "strict_mode": bool           # Modo estrito de validação
}
```

**Retorno:**
```python
{
    "success": bool,
    "score": int,
    "validation_results": dict,
    "issues_found": list,
    "recommendations": list,
    "passed_threshold": bool
}
```

**Implementação MCP:**
```python
async def validate_frontend_quality(params):
    """Valida qualidade dos componentes frontend"""
    try:
        project_path = params["project_path"]
        artifact_path = params.get("artifact_path", "")
        threshold = params.get("threshold", 75)
        stack = params.get("stack", "react")
        
        validation_results = {}
        total_score = 0
        max_score = 0
        issues_found = []
        
        # 1. Validação de Estrutura (20 pontos)
        structure_score = await validate_project_structure(project_path, stack)
        validation_results["structure"] = structure_score
        total_score += structure_score["score"]
        max_score += 20
        issues_found.extend(structure_score["issues"])
        
        # 2. Validação de Componentes (25 pontos)
        components_score = await validate_components(project_path, stack)
        validation_results["components"] = components_score
        total_score += components_score["score"]
        max_score += 25
        issues_found.extend(components_score["issues"])
        
        # 3. Validação de Testes (20 pontos)
        tests_score = await validate_tests(project_path, stack)
        validation_results["tests"] = tests_score
        total_score += tests_score["score"]
        max_score += 20
        issues_found.extend(tests_score["issues"])
        
        # 4. Validação de Performance (15 pontos)
        performance_score = await validate_performance(project_path)
        validation_results["performance"] = performance_score
        total_score += performance_score["score"]
        max_score += 15
        issues_found.extend(performance_score["issues"])
        
        # 5. Validação de Acessibilidade (10 pontos)
        accessibility_score = await validate_accessibility(project_path)
        validation_results["accessibility"] = accessibility_score
        total_score += accessibility_score["score"]
        max_score += 10
        issues_found.extend(accessibility_score["issues"])
        
        # 6. Validação de Segurança (10 pontos)
        security_score = await validate_security(project_path)
        validation_results["security"] = security_score
        total_score += security_score["score"]
        max_score += 10
        issues_found.extend(security_score["issues"])
        
        # Calcular score final
        final_score = int((total_score / max_score) * 100) if max_score > 0 else 0
        passed_threshold = final_score >= threshold
        
        # Gerar recomendações
        recommendations = await generate_recommendations(validation_results, issues_found)
        
        return {
            "success": True,
            "score": final_score,
            "validation_results": validation_results,
            "issues_found": issues_found,
            "recommendations": recommendations,
            "passed_threshold": passed_threshold
        }
        
    except Exception as e:
        return {
            "success": False,
            "score": 0,
            "validation_results": {},
            "issues_found": [f"Erro na validação: {str(e)}"],
            "recommendations": [],
            "passed_threshold": False
        }

# Funções auxiliares de validação
async def validate_project_structure(project_path, stack):
    """Valida estrutura do projeto"""
    issues = []
    score = 20
    
    required_dirs = ["src/components", "src/pages", "src/hooks", "src/tests"]
    
    for dir_path in required_dirs:
        full_path = os.path.join(project_path, dir_path)
        if not os.path.exists(full_path):
            issues.append(f"Diretório obrigatório ausente: {dir_path}")
            score -= 5
    
    # Validar arquivos de configuração
    config_files = {
        "react": ["package.json", "tsconfig.json"],
        "vue": ["package.json", "vue.config.js"],
        "angular": ["package.json", "angular.json"]
    }
    
    for config_file in config_files.get(stack, []):
        config_path = os.path.join(project_path, config_file)
        if not os.path.exists(config_path):
            issues.append(f"Arquivo de configuração ausente: {config_file}")
            score -= 3
    
    return {"score": max(0, score), "issues": issues}

async def validate_components(project_path, stack):
    """Valida componentes frontend"""
    issues = []
    score = 25
    
    components_path = os.path.join(project_path, "src/components")
    
    if not os.path.exists(components_path):
        return {"score": 0, "issues": ["Diretório de componentes não encontrado"]}
    
    # Verificar componentes
    components = []
    for item in os.listdir(components_path):
        item_path = os.path.join(components_path, item)
        if os.path.isdir(item_path):
            components.append(item)
    
    if not components:
        issues.append("Nenhum componente encontrado")
        score -= 10
    else:
        # Validar estrutura de cada componente
        for component in components[:5]:  # Limitar a 5 componentes
            comp_path = os.path.join(components_path, component)
            required_files = {
                "react": [f"{component}.tsx", f"{component}.test.tsx"],
                "vue": [f"{component}.vue", f"{component}.test.js"],
                "angular": [f"{component}.component.ts", f"{component}.component.spec.ts"]
            }
            
            for req_file in required_files.get(stack, []):
                file_path = os.path.join(comp_path, req_file)
                if not os.path.exists(file_path):
                    issues.append(f"Componente {component}缺少 arquivo: {req_file}")
                    score -= 2
    
    return {"score": max(0, score), "issues": issues}

async def validate_tests(project_path, stack):
    """Valida testes"""
    issues = []
    score = 20
    
    tests_path = os.path.join(project_path, "src/tests")
    
    if not os.path.exists(tests_path):
        return {"score": 0, "issues": ["Diretório de testes não encontrado"]}
    
    # Verificar configuração de testes
    test_configs = ["jest.config.js", "vitest.config.ts", "package.json"]
    
    has_config = False
    for config in test_configs:
        config_path = os.path.join(project_path, config)
        if os.path.exists(config_path):
            has_config = True
            break
    
    if not has_config:
        issues.append("Configuração de testes não encontrada")
        score -= 10
    
    # Contar arquivos de teste
    test_files = []
    for root, dirs, files in os.walk(tests_path):
        for file in files:
            if file.endswith(('.test.ts', '.test.tsx', '.test.js', '.spec.ts')):
                test_files.append(file)
    
    if len(test_files) < 3:
        issues.append(f"Poucos arquivos de teste encontrados: {len(test_files)}")
        score -= 5
    
    return {"score": max(0, score), "issues": issues}

async def validate_performance(project_path):
    """Valida performance"""
    issues = []
    score = 15
    
    # Verificar bundle size
    package_path = os.path.join(project_path, "package.json")
    if os.path.exists(package_path):
        with open(package_path, 'r') as f:
            package_data = json.load(f)
            
        # Verificar dependências de performance
        perf_deps = ["webpack-bundle-analyzer", "lighthouse", "web-vitals"]
        has_perf_tools = any(dep in package_data.get("devDependencies", {}) for dep in perf_deps)
        
        if not has_perf_tools:
            issues.append("Ferramentas de performance não configuradas")
            score -= 5
    
    # Verificar otimizações
    src_path = os.path.join(project_path, "src")
    if os.path.exists(src_path):
        # Procurar por lazy loading
        lazy_files = []
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'lazy(' in content or 'import(' in content:
                            lazy_files.append(file)
        
        if len(lazy_files) == 0:
            issues.append("Nenhum lazy loading encontrado")
            score -= 3
    
    return {"score": max(0, score), "issues": issues}

async def validate_accessibility(project_path):
    """Valida acessibilidade"""
    issues = []
    score = 10
    
    # Verificar ferramentas de acessibilidade
    package_path = os.path.join(project_path, "package.json")
    if os.path.exists(package_path):
        with open(package_path, 'r') as f:
            package_data = json.load(f)
            
        a11y_deps = ["@axe-core/react", "eslint-plugin-jsx-a11y", "cypress-axe"]
        has_a11y_tools = any(dep in package_data.get("devDependencies", {}) for dep in a11y_deps)
        
        if not has_a11y_tools:
            issues.append("Ferramentas de acessibilidade não configuradas")
            score -= 5
    
    # Verificar uso de ARIA
    src_path = os.path.join(project_path, "src")
    if os.path.exists(src_path):
        aria_files = []
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'aria-' in content or 'role=' in content:
                            aria_files.append(file)
        
        if len(aria_files) == 0:
            issues.append("Nenhum atributo ARIA encontrado")
            score -= 3
    
    return {"score": max(0, score), "issues": issues}

async def validate_security(project_path):
    """Valida segurança"""
    issues = []
    score = 10
    
    # Verificar dependências de segurança
    package_path = os.path.join(project_path, "package.json")
    if os.path.exists(package_path):
        with open(package_path, 'r') as f:
            package_data = json.load(f)
            
        security_deps = ["helmet", "dompurify", "eslint-plugin-security"]
        has_security_tools = any(dep in package_data.get("dependencies", {}) or 
                                dep in package_data.get("devDependencies", {}) 
                                for dep in security_deps)
        
        if not has_security_tools:
            issues.append("Ferramentas de segurança não configuradas")
            score -= 5
    
    return {"score": max(0, score), "issues": issues}

async def generate_recommendations(validation_results, issues):
    """Gera recomendações baseado nos resultados"""
    recommendations = []
    
    if validation_results.get("structure", {}).get("score", 20) < 15:
        recommendations.append("📁 Reorganize a estrutura do projeto seguindo as melhores práticas")
    
    if validation_results.get("components", {}).get("score", 25) < 20:
        recommendations.append("🧩 Crie componentes reutilizáveis com testes adequados")
    
    if validation_results.get("tests", {}).get("score", 20) < 15:
        recommendations.append("🧪 Aumente a cobertura de testes para >80%")
    
    if validation_results.get("performance", {}).get("score", 15) < 10:
        recommendations.append("⚡ Implemente otimizações de performance")
    
    if validation_results.get("accessibility", {}).get("score", 10) < 8:
        recommendations.append("♿ Melhore a acessibilidade seguindo WCAG 2.1 AA")
    
    if validation_results.get("security", {}).get("score", 10) < 8:
        recommendations.append("🔐 Adicione validações de segurança")
    
    return recommendations
```

### 3. process_frontend_to_next_phase()

**Propósito:** Processar artefatos para próxima fase (Deploy)

**Parâmetros:**
```python
{
    "project_path": str,         # Caminho do projeto
    "current_phase": str,        # Fase atual
    "next_phase": str,           # Próxima fase
    "artifacts": list,           # Lista de artefatos gerados
    "validation_score": int,    # Score de validação
    "auto_advance": bool         # Avanço automático
}
```

**Retorno:**
```python
{
    "success": bool,
    "processed_artifacts": list,
    "context_generated": dict,
    "next_phase_ready": bool,
    "deployment_config": dict,
    "errors": list
}
```

**Implementação MCP:**
```python
async def process_frontend_to_next_phase(params):
    """Processa artefatos para próxima fase"""
    try:
        project_path = params["project_path"]
        next_phase = params.get("next_phase", "deploy")
        validation_score = params.get("validation_score", 0)
        auto_advance = params.get("auto_advance", False)
        
        # Verificar se pode avançar
        if validation_score < 75 and not auto_advance:
            return {
                "success": False,
                "processed_artifacts": [],
                "context_generated": {},
                "next_phase_ready": False,
                "deployment_config": {},
                "errors": [f"Score de validação ({validation_score}) abaixo do threshold (75)"]
            }
        
        processed_artifacts = []
        
        # 1. Gerar documentação para deploy
        deploy_docs = await generate_deploy_documentation(project_path)
        processed_artifacts.append(deploy_docs)
        
        # 2. Criar configuração de deploy
        deploy_config = await create_deployment_config(project_path, next_phase)
        processed_artifacts.append(deploy_config)
        
        # 3. Gerar contexto para próxima fase
        context = await generate_context_for_next_phase(project_path, validation_score)
        
        # 4. Preparar assets para produção
        assets = await prepare_production_assets(project_path)
        processed_artifacts.extend(assets)
        
        return {
            "success": True,
            "processed_artifacts": processed_artifacts,
            "context_generated": context,
            "next_phase_ready": True,
            "deployment_config": deploy_config,
            "errors": []
        }
        
    except Exception as e:
        return {
            "success": False,
            "processed_artifacts": [],
            "context_generated": {},
            "next_phase_ready": False,
            "deployment_config": {},
            "errors": [f"Erro no processamento: {str(e)}"]
        }

async def generate_deploy_documentation(project_path):
    """Gera documentação para deploy"""
    deploy_info = {
        "type": "deploy_documentation",
        "content": {
            "build_commands": ["npm run build", "npm run test"],
            "environment_variables": ["NODE_ENV=production", "API_URL=https://api.example.com"],
            "health_checks": ["/health", "/api/health"],
            "rollback_commands": ["git revert HEAD", "npm run deploy:rollback"]
        }
    }
    return deploy_info

async def create_deployment_config(project_path, next_phase):
    """Cria configuração de deploy"""
    config = {
        "type": "deployment_config",
        "phase": next_phase,
        "config": {
            "build_tool": "vite",
            "output_dir": "dist",
            "assets_dir": "assets",
            "environment": "production",
            "cdn_enabled": True,
            "cache_strategy": "cache_first"
        }
    }
    return config

async def generate_context_for_next_phase(project_path, validation_score):
    """Gera contexto para próxima fase"""
    context = {
        "current_phase": "frontend",
        "next_phase": "deploy",
        "validation_score": validation_score,
        "artifacts_generated": [
            "components",
            "pages",
            "hooks",
            "tests",
            "documentation"
        ],
        "quality_metrics": {
            "test_coverage": ">80%",
            "performance_score": "A",
            "accessibility_compliance": "WCAG 2.1 AA",
            "security_score": "A"
        },
        "deployment_ready": validation_score >= 75
    }
    return context

async def prepare_production_assets(project_path):
    """Prepara assets para produção"""
    assets = []
    
    # Otimizar imagens
    image_optimizer = {
        "type": "asset_optimization",
        "asset_type": "images",
        "config": {
            "format": "webp",
            "quality": 80,
            "lazy_loading": True
        }
    }
    assets.append(image_optimizer)
    
    # Minificar CSS/JS
    minifier = {
        "type": "asset_optimization",
        "asset_type": "code",
        "config": {
            "minify": True,
            "sourcemaps": False,
            "treeshaking": True
        }
    }
    assets.append(minifier)
    
    return assets
```

## 🔄 Context Flow Implementation

### Mapeamento de Dependências
```python
CONTEXT_FLOW = {
    "frontend": {
        "inputs": [
            "docs/08-contrato-api/contrato-api.md",
            "docs/03-ux/design-doc.md",
            "docs/09-plano-execucao/backlog.md"
        ],
        "outputs": [
            "src/components/",
            "src/pages/",
            "src/hooks/",
            "src/tests/",
            "docs/10-frontend/historia-frontend.md"
        ],
        "next_phase": "deploy",
        "validation_threshold": 75
    }
}
```

### Automação de Avanço
```python
async def auto_advance_to_next_phase(project_path, current_phase, validation_score):
    """Avança automaticamente para próxima fase se validação passar"""
    
    if current_phase not in CONTEXT_FLOW:
        return {"success": False, "error": "Fase não mapeada"}
    
    flow_config = CONTEXT_FLOW[current_phase]
    
    if validation_score < flow_config["validation_threshold"]:
        return {
            "success": False, 
            "error": f"Score {validation_score} abaixo do threshold {flow_config['validation_threshold']}"
        }
    
    # Processar para próxima fase
    process_params = {
        "project_path": project_path,
        "current_phase": current_phase,
        "next_phase": flow_config["next_phase"],
        "validation_score": validation_score,
        "auto_advance": True
    }
    
    result = await process_frontend_to_next_phase(process_params)
    
    if result["success"]:
        # Atualizar contexto do projeto
        await update_project_context(project_path, result["context_generated"])
    
    return result
```

## 🛡️ Guardrails e Segurança

### Validações de Segurança
```python
SECURITY_VALIDATIONS = {
    "input_validation": {
        "project_path": "validate_path_exists",
        "stack": "validate_allowed_stack",
        "threshold": "validate_range_0_100"
    },
    "file_operations": {
        "max_file_size": "10MB",
        "allowed_extensions": [".ts", ".tsx", ".js", ".jsx", ".vue", ".json"],
        "forbidden_patterns": ["eval(", "innerHTML", "document.write"]
    },
    "api_calls": {
        "rate_limit": "100_requests_per_minute",
        "timeout": "30_seconds",
        "retry_policy": "exponential_backoff"
    }
}
```

### Tratamento de Erros
```python
class FrontendMCPError(Exception):
    """Erro base para operações MCP do especialista frontend"""
    pass

class ValidationError(FrontendMCPError):
    """Erro de validação"""
    pass

class StructureError(FrontendMCPError):
    """Erro de estrutura"""
    pass

class PerformanceError(FrontendMCPError):
    """Erro de performance"""
    pass
```

## 📊 Monitoramento e Métricas

### Métricas Coletadas
```python
METRICS = {
    "performance": {
        "initialization_time": "tempo_para_criar_estrutura",
        "validation_time": "tempo_para_validar",
        "processing_time": "tempo_para_processar"
    },
    "quality": {
        "validation_score": "score_de_validacao",
        "issues_found": "problemas_encontrados",
        "recommendations_generated": "recomendacoes_geradas"
    },
    "usage": {
        "functions_called": "funcoes_chamadas",
        "artifacts_processed": "artefatos_processados",
        "success_rate": "taxa_de_sucesso"
    }
}
```

## 🧪 Testes das Funções MCP

### Testes Unitários
```python
# test_frontend_mcp.py
import pytest
from frontend_mcp import (
    initialize_frontend_structure,
    validate_frontend_quality,
    process_frontend_to_next_phase
)

@pytest.mark.asyncio
async def test_initialize_frontend_structure():
    """Testa inicialização da estrutura frontend"""
    params = {
        "project_path": "/tmp/test-project",
        "stack": "react",
        "typescript": True
    }
    
    result = await initialize_frontend_structure(params)
    
    assert result["success"] is True
    assert "structure_created" in result
    assert "template_generated" in result

@pytest.mark.asyncio
async def test_validate_frontend_quality():
    """Testa validação de qualidade frontend"""
    params = {
        "project_path": "/tmp/test-project",
        "threshold": 75
    }
    
    result = await validate_frontend_quality(params)
    
    assert "score" in result
    assert "validation_results" in result
    assert "passed_threshold" in result

@pytest.mark.asyncio
async def test_process_frontend_to_next_phase():
    """Testa processamento para próxima fase"""
    params = {
        "project_path": "/tmp/test-project",
        "validation_score": 80
    }
    
    result = await process_frontend_to_next_phase(params)
    
    assert result["success"] is True
    assert "processed_artifacts" in result
    assert "next_phase_ready" in result
```

## 📚 Exemplos de Uso

### Exemplo 1: Fluxo Completo
```python
# Exemplo de uso completo das funções MCP
async def complete_frontend_workflow(project_path):
    """Fluxo completo de trabalho frontend"""
    
    # 1. Inicializar estrutura
    init_params = {
        "project_path": project_path,
        "stack": "react",
        "typescript": True,
        "storybook": True
    }
    
    init_result = await initialize_frontend_structure(init_params)
    if not init_result["success"]:
        return {"error": "Falha na inicialização", "details": init_result["errors"]}
    
    # 2. Desenvolver componentes (simulação)
    # ... código de desenvolvimento ...
    
    # 3. Validar qualidade
    validation_params = {
        "project_path": project_path,
        "threshold": 75
    }
    
    validation_result = await validate_frontend_quality(validation_params)
    
    # 4. Processar para próxima fase se passar
    if validation_result["passed_threshold"]:
        process_params = {
            "project_path": project_path,
            "validation_score": validation_result["score"],
            "next_phase": "deploy"
        }
        
        process_result = await process_frontend_to_next_phase(process_params)
        
        return {
            "success": True,
            "initialization": init_result,
            "validation": validation_result,
            "processing": process_result
        }
    else:
        return {
            "success": False,
            "validation": validation_result,
            "recommendations": validation_result["recommendations"]
        }
```

## 🔧 Configuração do Servidor MCP

### Registro das Funções
```python
# No servidor MCP
mcp_server.register_function(
    name="initialize_frontend_structure",
    description="Cria estrutura base de frontend",
    handler=initialize_frontend_structure
)

mcp_server.register_function(
    name="validate_frontend_quality",
    description="Valida qualidade dos componentes frontend",
    handler=validate_frontend_quality
)

mcp_server.register_function(
    name="process_frontend_to_next_phase",
    description="Processa artefatos para próxima fase",
    handler=process_frontend_to_next_phase
)
```

## 📋 Checklist de Implementação

### ✅ Para Implementação Completa
- [ ] **Funções MCP**: Todas as 3 funções implementadas
- [ ] **Validações**: Todos os critérios de qualidade
- [ ] **Guardrails**: Segurança e tratamento de erros
- [ ] **Testes**: Cobertura completa das funções
- [ ] **Documentação**: Exemplos e guias de uso
- [ ] **Monitoramento**: Métricas e logging
- [ ] **Context Flow**: Integração com outras fases

### 🎯 Métricas de Sucesso
- **Performance**: < 5 segundos para inicialização
- **Qualidade**: Score ≥ 75 para aprovação
- **Confiabilidade**: 99% uptime das funções
- **Usabilidade**: Interface intuitiva para desenvolvedores

---

**Versão:** 1.0  
**Data:** 2026-01-29  
**Status:** Production Ready  
**Framework:** MCP-Centric  
**Skill:** Especialista em Desenvolvimento Frontend
