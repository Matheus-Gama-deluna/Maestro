# MCP Functions - Análise de Testes

## Visão Geral

Funções de referência para implementação MCP externa. Estas funções fornecem a lógica para automação, validação e processamento da estratégia de testes.

---

## 1. Inicialização da Estratégia de Testes

### `init_testing_strategy(project_path: str) -> Dict`

**Descrição:** Inicializa a estratégia de testes para um novo projeto, criando estrutura base e configurações iniciais.

**Parâmetros:**
- `project_path`: Caminho do projeto a ser configurado

**Retorno:** Dict com status e informações da inicialização

```python
async def init_testing_strategy(project_path: str) -> Dict:
    """
    Inicializa estratégia completa de testes para o projeto
    
    Args:
        project_path: Caminho absoluto do projeto
        
    Returns:
        Dict com resultado da inicialização
    """
    
    # 1. Detectar stack tecnológica
    tech_stack = await detect_tech_stack(project_path)
    
    # 2. Criar estrutura de diretórios
    await create_testing_structure(project_path)
    
    # 3. Gerar configurações baseadas na stack
    await generate_test_configs(project_path, tech_stack)
    
    # 4. Criar templates iniciais
    await create_initial_templates(project_path)
    
    # 5. Configurar pipeline CI/CD
    await setup_ci_pipeline(project_path, tech_stack)
    
    return {
        "status": "success",
        "tech_stack": tech_stack,
        "structure_created": True,
        "configs_generated": True,
        "next_steps": [
            "Revisar configurações geradas",
            "Executar testes iniciais",
            "Configurar ambiente de testes",
            "Treinar equipe nos padrões"
        ]
    }

async def detect_tech_stack(project_path: str) -> Dict:
    """Detecta stack tecnológica do projeto"""
    
    stack = {
        "frontend": None,
        "backend": None,
        "database": None,
        "testing_frameworks": []
    }
    
    # Detectar frontend
    if os.path.exists(f"{project_path}/package.json"):
        with open(f"{project_path}/package.json") as f:
            package_json = json.load(f)
            deps = {**package_json.get("dependencies", {}), 
                   **package_json.get("devDependencies", {})}
            
            if "react" in deps:
                stack["frontend"] = "react"
            elif "vue" in deps:
                stack["frontend"] = "vue"
            elif "angular" in deps:
                stack["frontend"] = "angular"
            
            if "jest" in deps:
                stack["testing_frameworks"].append("jest")
            if "playwright" in deps:
                stack["testing_frameworks"].append("playwright")
    
    # Detectar backend
    if os.path.exists(f"{project_path}/requirements.txt"):
        stack["backend"] = "python"
    elif os.path.exists(f"{project_path}/pom.xml"):
        stack["backend"] = "java"
    elif os.path.exists(f"{project_path}/composer.json"):
        stack["backend"] = "php"
    
    # Detectar database
    if os.path.exists(f"{project_path}/docker-compose.yml"):
        with open(f"{project_path}/docker-compose.yml") as f:
            docker_compose = yaml.safe_load(f)
            services = docker_compose.get("services", {})
            
            if "postgres" in services or "postgresql" in services:
                stack["database"] = "postgresql"
            elif "mysql" in services:
                stack["database"] = "mysql"
            elif "mongodb" in services:
                stack["database"] = "mongodb"
    
    return stack

async def create_testing_structure(project_path: str) -> None:
    """Cria estrutura de diretórios de testes"""
    
    directories = [
        "tests/unit",
        "tests/integration",
        "tests/e2e",
        "tests/performance",
        "tests/security",
        "tests/fixtures",
        "tests/helpers",
        "tests/config",
        "docs/09-testes"
    ]
    
    for directory in directories:
        os.makedirs(f"{project_path}/{directory}", exist_ok=True)
```

---

## 2. Validação de Qualidade

### `validate_testing_quality(project_path: str) -> Dict`

**Descrição:** Valida a qualidade da estratégia de testes atual, calculando score e identificando gaps.

**Parâmetros:**
- `project_path`: Caminho do projeto para análise

**Retorno:** Dict com métricas, score e recomendações

```python
async def validate_testing_quality(project_path: str) -> Dict:
    """
    Valida qualidade completa da estratégia de testes
    
    Args:
        project_path: Caminho do projeto
        
    Returns:
        Dict com métricas detalhadas e recomendações
    """
    
    # 1. Analisar estrutura de testes
    structure_analysis = await analyze_test_structure(project_path)
    
    # 2. Calcular cobertura de código
    coverage_analysis = await analyze_code_coverage(project_path)
    
    # 3. Avaliar qualidade dos testes
    quality_analysis = await analyze_test_quality(project_path)
    
    # 4. Verificar automação
    automation_analysis = await analyze_automation(project_path)
    
    # 5. Analisar segurança
    security_analysis = await analyze_security_tests(project_path)
    
    # 6. Calcular score geral
    overall_score = calculate_overall_score([
        structure_analysis,
        coverage_analysis,
        quality_analysis,
        automation_analysis,
        security_analysis
    ])
    
    return {
        "overall_score": overall_score,
        "status": get_quality_status(overall_score),
        "analyses": {
            "structure": structure_analysis,
            "coverage": coverage_analysis,
            "quality": quality_analysis,
            "automation": automation_analysis,
            "security": security_analysis
        },
        "recommendations": generate_recommendations(overall_score),
        "gaps": identify_gaps(overall_score),
        "next_steps": generate_action_plan(overall_score)
    }

async def analyze_test_structure(project_path: str) -> Dict:
    """Analisa estrutura organizacional dos testes"""
    
    structure_score = 0
    max_score = 100
    findings = []
    
    # Verificar diretórios obrigatórios
    required_dirs = [
        "tests/unit",
        "tests/integration", 
        "tests/e2e",
        "tests/fixtures"
    ]
    
    existing_dirs = 0
    for dir_path in required_dirs:
        if os.path.exists(f"{project_path}/{dir_path}"):
            existing_dirs += 1
        else:
            findings.append(f"Diretório ausente: {dir_path}")
    
    structure_score += (existing_dirs / len(required_dirs)) * 30
    
    # Verificar arquivos de configuração
    config_files = [
        "jest.config.js",
        "playwright.config.ts",
        "pytest.ini",
        "docker-compose.test.yml"
    ]
    
    existing_configs = 0
    for config_file in config_files:
        if os.path.exists(f"{project_path}/{config_file}"):
            existing_configs += 1
    
    structure_score += (existing_configs / len(config_files)) * 20
    
    # Verificar documentação
    doc_files = [
        "docs/09-testes/plano-testes.md",
        "docs/09-testes/matriz-rastreabilidade.md"
    ]
    
    existing_docs = 0
    for doc_file in doc_files:
        if os.path.exists(f"{project_path}/{doc_file}"):
            existing_docs += 1
        else:
            findings.append(f"Documentação ausente: {doc_file}")
    
    structure_score += (existing_docs / len(doc_files)) * 20
    
    # Verificar organização dos testes
    test_files = glob.glob(f"{project_path}/tests/**/*.test.*", recursive=True)
    if len(test_files) > 0:
        structure_score += 20
        
        # Verificar nomenclatura
        well_named = sum(1 for f in test_files if ".test." in f or ".spec." in f)
        structure_score += (well_named / len(test_files)) * 10
    
    return {
        "score": min(structure_score, max_score),
        "findings": findings,
        "test_files_count": len(test_files),
        "directories_found": existing_dirs,
        "configs_found": existing_configs,
        "docs_found": existing_docs
    }

async def analyze_code_coverage(project_path: str) -> Dict:
    """Analisa cobertura de código"""
    
    coverage_score = 0
    coverage_data = {}
    
    # Tentar ler relatório de cobertura
    coverage_files = [
        "coverage/coverage-summary.json",
        "coverage/lcov.info",
        "coverage.xml"
    ]
    
    for coverage_file in coverage_files:
        if os.path.exists(f"{project_path}/{coverage_file}"):
            coverage_data = await parse_coverage_report(
                f"{project_path}/{coverage_file}"
            )
            break
    
    if coverage_data:
        # Calcular score baseado na cobertura
        overall_coverage = coverage_data.get("total", {}).get("lines", {}).get("pct", 0)
        
        if overall_coverage >= 80:
            coverage_score = 100
        elif overall_coverage >= 70:
            coverage_score = 80
        elif overall_coverage >= 60:
            coverage_score = 60
        else:
            coverage_score = 40
    
    else:
        # Executar testes com cobertura se não existir
        try:
            result = subprocess.run(
                ["npm", "run", "test:coverage"],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                coverage_score = 70  # Assume cobertura razoável
            else:
                coverage_score = 30
                
        except Exception:
            coverage_score = 20
    
    return {
        "score": coverage_score,
        "coverage_data": coverage_data,
        "recommendations": generate_coverage_recommendations(coverage_data)
    }
```

---

## 3. Geração de Relatórios

### `generate_quality_report(project_path: str, format: str = "markdown") -> str`

**Descrição:** Gera relatório detalhado da qualidade de testes no formato especificado.

**Parâmetros:**
- `project_path`: Caminho do projeto
- `format`: Formato do relatório ("markdown", "html", "json")

**Retorno:** String com o relatório gerado

```python
async def generate_quality_report(project_path: str, format: str = "markdown") -> str:
    """
    Gera relatório detalhado de qualidade de testes
    
    Args:
        project_path: Caminho do projeto
        format: Formato de saída (markdown, html, json)
        
    Returns:
        String com relatório formatado
    """
    
    # Obter dados de validação
    validation_data = await validate_testing_quality(project_path)
    
    if format == "markdown":
        return await generate_markdown_report(validation_data)
    elif format == "html":
        return await generate_html_report(validation_data)
    elif format == "json":
        return json.dumps(validation_data, indent=2)
    else:
        raise ValueError(f"Formato não suportado: {format}")

async def generate_markdown_report(data: Dict) -> str:
    """Gera relatório em formato Markdown"""
    
    score = data["overall_score"]
    status = data["status"]
    
    report = f"""
# Relatório de Qualidade de Testes

## Resumo Executivo

**Score Geral:** {score}/100 ({status})
**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Métricas por Categoria

### Estrutura de Testes
**Score:** {data['analyses']['structure']['score']}/100
- Arquivos de teste: {data['analyses']['structure']['test_files_count']}
- Diretórios encontrados: {data['analyses']['structure']['directories_found']}/4
- Configurações: {data['analyses']['structure']['configs_found']}/4
- Documentação: {data['analyses']['structure']['docs_found']}/2

### Cobertura de Código
**Score:** {data['analyses']['coverage']['score']}/100
{format_coverage_data(data['analyses']['coverage']['coverage_data'])}

### Qualidade dos Testes
**Score:** {data['analyses']['quality']['score']}/100
- Taxa de pass: {data['analyses']['quality'].get('pass_rate', 'N/A')}%
- Testes flaky: {data['analyses']['quality'].get('flaky_rate', 'N/A')}%
- Tempo médio: {data['analyses']['quality'].get('avg_duration', 'N/A')}ms

### Automação
**Score:** {data['analyses']['automation']['score']}/100
- Pipeline configurado: {'✅' if data['analyses']['automation'].get('pipeline_configured') else '❌'}
- Taxa de automação: {data['analyses']['automation'].get('automation_rate', 'N/A')}%

### Segurança
**Score:** {data['analyses']['security']['score']}/100
- Vulnerabilidades críticas: {data['analyses']['security'].get('critical_vulns', 0)}
- Testes de segurança: {data['analyses']['security'].get('security_tests', 0)}

## Recomendações

{chr(10).join(f"- {rec}" for rec in data['recommendations'])}

## Gaps Identificados

{chr(10).join(f"- {gap}" for gap in data['gaps'])}

## Plano de Ação

{chr(10).join(f"1. {step}" for step in data['next_steps'])}

---

*Relatório gerado automaticamente pelo MCP Maestro Testing Assistant*
"""
    
    return report

def format_coverage_data(coverage_data: Dict) -> str:
    """Formata dados de cobertura para exibição"""
    
    if not coverage_data:
        return "- Dados de cobertura não disponíveis"
    
    total = coverage_data.get("total", {})
    lines = total.get("lines", {})
    
    return f"""
- Linhas: {lines.get('pct', 0)}%
- Branches: {total.get('branches', {}).get('pct', 0)}%
- Funções: {total.get('functions', {}).get('pct', 0)}%
- Statements: {total.get('statements', {}).get('pct', 0)}%
"""
```

---

## 4. Processamento de Matriz de Rastreabilidade

### `update_traceability_matrix(project_path: str, requirements: List[Dict]) -> Dict`

**Descrição:** Atualiza matriz de rastreabilidade com novos requisitos e casos de teste.

**Parâmetros:**
- `project_path`: Caminho do projeto
- `requirements`: Lista de requisitos para mapear

**Retorno:** Dict com status da atualização

```python
async def update_traceability_matrix(project_path: str, requirements: List[Dict]) -> Dict:
    """
    Atualiza matriz de rastreabilidade de testes
    
    Args:
        project_path: Caminho do projeto
        requirements: Lista de requisitos para mapear
        
    Returns:
        Dict com resultado da atualização
    """
    
    matrix_path = f"{project_path}/docs/09-testes/matriz-rastreabilidade.md"
    
    # Ler matriz existente ou criar nova
    if os.path.exists(matrix_path):
        with open(matrix_path, 'r', encoding='utf-8') as f:
            matrix_content = f.read()
    else:
        matrix_content = await generate_initial_matrix()
    
    # Analisar casos de teste existentes
    test_cases = await discover_test_cases(project_path)
    
    # Mapear requisitos para testes
    updated_matrix = await map_requirements_to_tests(
        requirements, 
        test_cases, 
        matrix_content
    )
    
    # Calcular métricas de cobertura
    coverage_metrics = calculate_coverage_metrics(updated_matrix)
    
    # Salvar matriz atualizada
    with open(matrix_path, 'w', encoding='utf-8') as f:
        f.write(updated_matrix)
    
    return {
        "status": "success",
        "requirements_mapped": len(requirements),
        "test_cases_found": len(test_cases),
        "coverage_metrics": coverage_metrics,
        "matrix_updated": True
    }

async def discover_test_cases(project_path: str) -> List[Dict]:
    """Descobre todos os casos de teste no projeto"""
    
    test_cases = []
    
    # Encontrar arquivos de teste
    test_patterns = [
        "**/*.test.js",
        "**/*.test.ts", 
        "**/*.spec.js",
        "**/*.spec.ts",
        "**/*_test.py",
        "**/test_*.py"
    ]
    
    for pattern in test_patterns:
        for file_path in glob.glob(f"{project_path}/{pattern}", recursive=True):
            test_cases.extend(await parse_test_file(file_path))
    
    return test_cases

async def parse_test_file(file_path: str) -> List[Dict]:
    """Analisa arquivo de teste e extrai casos de teste"""
    
    test_cases = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extrair testes baseado na linguagem
        if file_path.endswith(('.js', '.ts')):
            test_cases.extend(await parse_javascript_tests(content, file_path))
        elif file_path.endswith('.py'):
            test_cases.extend(await parse_python_tests(content, file_path))
            
    except Exception as e:
        print(f"Erro ao analisar arquivo {file_path}: {e}")
    
    return test_cases

async def parse_javascript_tests(content: str, file_path: str) -> List[Dict]:
    """Extrai testes de arquivos JavaScript/TypeScript"""
    
    test_cases = []
    
    # Regex para encontrar testes
    patterns = [
        r'(?:it|test)\s*\(\s*[\'"]([^\'"]+)[\'"]',
        r'(?:describe|context)\s*\(\s*[\'"]([^\'"]+)[\'"]'
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, content)
        for match in matches:
            test_cases.append({
                "name": match,
                "file": file_path,
                "type": "unit" if "unit" in file_path else "integration" if "integration" in file_path else "e2e",
                "status": "pending"  # Será atualizado após execução
            })
    
    return test_cases
```

---

## 5. Configuração de Pipeline

### `setup_ci_pipeline(project_path: str, platform: str = "github") -> Dict`

**Descrição:** Configura pipeline CI/CD para testes automatizados.

**Parâmetros:**
- `project_path`: Caminho do projeto
- `platform`: Plataforma CI ("github", "gitlab", "azure")

**Retorno:** Dict com status da configuração

```python
async def setup_ci_pipeline(project_path: str, platform: str = "github") -> Dict:
    """
    Configura pipeline CI/CD para testes automatizados
    
    Args:
        project_path: Caminho do projeto
        platform: Plataforma de CI/CD
        
    Returns:
        Dict com resultado da configuração
    """
    
    if platform == "github":
        await setup_github_actions(project_path)
    elif platform == "gitlab":
        await setup_gitlab_ci(project_path)
    elif platform == "azure":
        await setup_azure_pipelines(project_path)
    else:
        raise ValueError(f"Plataforma não suportada: {platform}")
    
    return {
        "status": "success",
        "platform": platform,
        "pipeline_configured": True,
        "next_steps": [
            "Commitar arquivos de configuração",
            "Testar pipeline com um PR",
            "Configurar notificações",
            "Ajustar thresholds de qualidade"
        ]
    }

async def setup_github_actions(project_path: str) -> None:
    """Configura GitHub Actions para testes"""
    
    workflows_dir = f"{project_path}/.github/workflows"
    os.makedirs(workflows_dir, exist_ok=True)
    
    # Detectar stack para gerar workflow apropriado
    tech_stack = await detect_tech_stack(project_path)
    
    if tech_stack.get("frontend") or tech_stack.get("backend") == "node":
        workflow_content = await generate_nodejs_workflow(tech_stack)
    elif tech_stack.get("backend") == "python":
        workflow_content = await generate_python_workflow(tech_stack)
    elif tech_stack.get("backend") == "java":
        workflow_content = await generate_java_workflow(tech_stack)
    else:
        workflow_content = await generate_generic_workflow()
    
    # Salvar workflow
    workflow_path = f"{workflows_dir}/testing.yml"
    with open(workflow_path, 'w', encoding='utf-8') as f:
        f.write(workflow_content)

async def generate_nodejs_workflow(tech_stack: Dict) -> str:
    """Gera workflow para projetos Node.js"""
    
    workflow = f"""
name: Testing Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{{{ matrix.node-version }}}}
      uses: actions/setup-node@v3
      with:
        node-version: ${{{{ matrix.node-version }}}}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage --watchAll=false
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/testdb

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npx playwright test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
"""
    
    return workflow
```

---

## Uso das Funções MCP

### Exemplo de Integração

```python
# Exemplo de uso completo das funções MCP
async def main():
    project_path = "/path/to/project"
    
    # 1. Inicializar estratégia
    init_result = await init_testing_strategy(project_path)
    print(f"Estratégia inicializada: {init_result['status']}")
    
    # 2. Validar qualidade
    validation = await validate_testing_quality(project_path)
    print(f"Score de qualidade: {validation['overall_score']}")
    
    # 3. Gerar relatório
    report = await generate_quality_report(project_path, "markdown")
    with open("quality-report.md", "w") as f:
        f.write(report)
    
    # 4. Configurar pipeline
    pipeline_result = await setup_ci_pipeline(project_path, "github")
    print(f"Pipeline configurado: {pipeline_result['status']}")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Notas de Implementação

### Performance Considerations
- Usar cache para análises repetidas
- Paralelizar descoberta de testes
- Implementar lazy loading para grandes projetos

### Error Handling
- Tratar gracefully arquivos corrompidos
- Fallback para análise quando ferramentas não disponíveis
- Logging detalhado para debugging

### Extensibilidade
- Plugin system para novas linguagens
- Configuração customizável de thresholds
- Integração com ferramentas externas

---

**Importante:** Estas funções são referência para implementação MCP. A execução real deve ser feita pelo servidor MCP externo, não diretamente pela skill.
