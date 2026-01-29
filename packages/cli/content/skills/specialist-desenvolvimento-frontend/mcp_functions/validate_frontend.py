"""
Função MCP de Referência: validate_frontend_quality()

ESTE ARQUIVO É APENAS REFERÊNCIA PARA IMPLEMENTAÇÃO NO MCP
NÃO EXECUTÁVEL LOCALMENTE

Implementação real deve ser feita no servidor MCP externo.
"""

import os
import json
import re
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

async def validate_frontend_quality(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Valida qualidade dos componentes frontend
    
    Args:
        params: Dicionário com parâmetros de validação
            - project_path: str - Caminho do projeto
            - artifact_path: str - Caminho do artefato principal
            - threshold: int - Score mínimo (default: 75)
            - check_types: list - Tipos de validação
            - stack: str - Stack tecnológico
            - strict_mode: bool - Modo estrito de validação
    
    Returns:
        Dict com resultado da validação
            - success: bool - Status da operação
            - score: int - Score final (0-100)
            - validation_results: dict - Resultados detalhados
            - issues_found: list - Lista de problemas encontrados
            - recommendations: list - Recomendações de melhoria
            - passed_threshold: bool - Se passou no threshold
    """
    
    try:
        project_path = params.get("project_path")
        artifact_path = params.get("artifact_path", "")
        threshold = params.get("threshold", 75)
        stack = params.get("stack", "react")
        strict_mode = params.get("strict_mode", False)
        
        if not project_path:
            return {
                "success": False,
                "score": 0,
                "validation_results": {},
                "issues_found": ["project_path é obrigatório"],
                "recommendations": [],
                "passed_threshold": False
            }
        
        # Tipos de validação padrão
        check_types = params.get("check_types", [
            "structure", "components", "tests", "performance", 
            "accessibility", "security"
        ])
        
        validation_results = {}
        total_score = 0
        max_score = 0
        all_issues = []
        
        # 1. Validação de Estrutura (20 pontos)
        if "structure" in check_types:
            structure_score, structure_issues = await validate_project_structure(
                project_path, stack, strict_mode
            )
            validation_results["structure"] = {
                "score": structure_score,
                "max_score": 20,
                "issues": structure_issues
            }
            total_score += structure_score
            max_score += 20
            all_issues.extend(structure_issues)
        
        # 2. Validação de Componentes (25 pontos)
        if "components" in check_types:
            components_score, components_issues = await validate_components(
                project_path, stack, strict_mode
            )
            validation_results["components"] = {
                "score": components_score,
                "max_score": 25,
                "issues": components_issues
            }
            total_score += components_score
            max_score += 25
            all_issues.extend(components_issues)
        
        # 3. Validação de Testes (20 pontos)
        if "tests" in check_types:
            tests_score, tests_issues = await validate_tests(
                project_path, stack, strict_mode
            )
            validation_results["tests"] = {
                "score": tests_score,
                "max_score": 20,
                "issues": tests_issues
            }
            total_score += tests_score
            max_score += 20
            all_issues.extend(tests_issues)
        
        # 4. Validação de Performance (15 pontos)
        if "performance" in check_types:
            performance_score, performance_issues = await validate_performance(
                project_path, strict_mode
            )
            validation_results["performance"] = {
                "score": performance_score,
                "max_score": 15,
                "issues": performance_issues
            }
            total_score += performance_score
            max_score += 15
            all_issues.extend(performance_issues)
        
        # 5. Validação de Acessibilidade (10 pontos)
        if "accessibility" in check_types:
            accessibility_score, accessibility_issues = await validate_accessibility(
                project_path, strict_mode
            )
            validation_results["accessibility"] = {
                "score": accessibility_score,
                "max_score": 10,
                "issues": accessibility_issues
            }
            total_score += accessibility_score
            max_score += 10
            all_issues.extend(accessibility_issues)
        
        # 6. Validação de Segurança (10 pontos)
        if "security" in check_types:
            security_score, security_issues = await validate_security(
                project_path, strict_mode
            )
            validation_results["security"] = {
                "score": security_score,
                "max_score": 10,
                "issues": security_issues
            }
            total_score += security_score
            max_score += 10
            all_issues.extend(security_issues)
        
        # Calcular score final
        final_score = int((total_score / max_score) * 100) if max_score > 0 else 0
        passed_threshold = final_score >= threshold
        
        # Gerar recomendações
        recommendations = await generate_recommendations(validation_results, all_issues)
        
        return {
            "success": True,
            "score": final_score,
            "validation_results": validation_results,
            "issues_found": all_issues,
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

async def validate_project_structure(project_path: str, stack: str, strict_mode: bool) -> Tuple[int, List[str]]:
    """Valida estrutura do projeto"""
    
    issues = []
    score = 20
    
    # Diretórios obrigatórios
    required_dirs = [
        "src/components",
        "src/pages", 
        "src/hooks",
        "src/tests",
        "src/types",
        "src/utils",
        "src/styles",
        "src/assets",
        "docs/10-frontend",
        "public"
    ]
    
    for dir_path in required_dirs:
        full_path = os.path.join(project_path, dir_path)
        if not os.path.exists(full_path):
            issues.append(f"Diretório obrigatório ausente: {dir_path}")
            score -= 2
    
    # Arquivos de configuração obrigatórios
    config_files = {
        "react": ["package.json", "tsconfig.json", "vite.config.ts", ".eslintrc.js"],
        "vue": ["package.json", "vue.config.js", "tsconfig.json"],
        "angular": ["package.json", "angular.json", "tsconfig.json"]
    }
    
    for config_file in config_files.get(stack, ["package.json"]):
        config_path = os.path.join(project_path, config_file)
        if not os.path.exists(config_path):
            issues.append(f"Arquivo de configuração ausente: {config_file}")
            score -= 1
    
    # Verificar conteúdo dos diretórios
    components_dir = os.path.join(project_path, "src/components")
    if os.path.exists(components_dir):
        components = os.listdir(components_dir)
        if len(components) == 0:
            issues.append("Diretório de componentes vazio")
            score -= 3
    
    # Verificar arquivos de documentação
    docs_dir = os.path.join(project_path, "docs", "10-frontend")
    if os.path.exists(docs_dir):
        docs_files = os.listdir(docs_dir)
        if "historia-frontend.md" not in docs_files:
            issues.append("Arquivo história-frontend.md não encontrado")
            score -= 2
    
    return max(0, score), issues

async def validate_components(project_path: str, stack: str, strict_mode: bool) -> Tuple[int, List[str]]:
    """Valida componentes frontend"""
    
    issues = []
    score = 25
    
    components_path = os.path.join(project_path, "src/components")
    
    if not os.path.exists(components_path):
        return 0, ["Diretório de componentes não encontrado"]
    
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
        for component in components[:5]:  # Limitar a 5 componentes para performance
            comp_path = os.path.join(components_path, component)
            component_issues = await validate_single_component(comp_path, component, stack, strict_mode)
            issues.extend(component_issues)
            
            # Penalizar por cada issue de componente
            score -= min(len(component_issues), 3)
    
    # Verificar se há componentes reutilizáveis
    reusable_count = 0
    for component in components:
        comp_path = os.path.join(components_path, component)
        if await is_component_reusable(comp_path):
            reusable_count += 1
    
    if reusable_count < len(components) * 0.5:
        issues.append(f"Poucos componentes reutilizáveis: {reusable_count}/{len(components)}")
        score -= 5
    
    return max(0, score), issues

async def validate_single_component(component_path: str, component_name: str, stack: str, strict_mode: bool) -> List[str]:
    """Valida estrutura de um único componente"""
    
    issues = []
    
    # Arquivos obrigatórios por stack
    required_files = {
        "react": [f"{component_name}.tsx", f"{component_name}.test.tsx"],
        "vue": [f"{component_name}.vue", f"{component_name}.test.js"],
        "angular": [f"{component_name}.component.ts", f"{component_name}.component.spec.ts"]
    }
    
    for req_file in required_files.get(stack, []):
        file_path = os.path.join(component_path, req_file)
        if not os.path.exists(file_path):
            issues.append(f"Componente {component_name}缺少 arquivo: {req_file}")
    
    # Verificar index.tsx
    index_path = os.path.join(component_path, "index.ts")
    if not os.path.exists(index_path):
        issues.append(f"Componente {component_name}缺少 arquivo: index.ts")
    
    # Verificar Storybook story
    story_path = os.path.join(component_path, f"{component_name}.stories.tsx")
    if not os.path.exists(story_path):
        issues.append(f"Componente {component_name}缺少 Storybook story")
    
    # Analisar código do componente principal
    if stack == "react":
        component_file = os.path.join(component_path, f"{component_name}.tsx")
        if os.path.exists(component_file):
            code_issues = await analyze_react_component_code(component_file, strict_mode)
            issues.extend(code_issues)
    
    return issues

async def analyze_react_component_code(file_path: str, strict_mode: bool) -> List[str]:
    """Analisa código de componente React"""
    
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar TypeScript
        if not content.strip().startswith('// @ts-nocheck') and 'interface ' not in content and 'type ' not in content:
            issues.append("Componente sem tipagem TypeScript")
        
        # Verificar props tipadas
        if 'interface Props' not in content and 'type Props' not in content:
            issues.append("Props não tipadas")
        
        # Verificar export default
        if 'export default' not in content:
            issues.append("Componente sem export default")
        
        # Verificar se usa React.memo (performance)
        if strict_mode and 'React.memo' not in content:
            issues.append("Componente não otimizado com React.memo")
        
        # Verificar se há tratamento de erro
        if 'try {' not in content and 'catch' not in content:
            issues.append("Componente sem tratamento de erro")
        
        # Verificar acessibilidade básica
        if 'aria-' not in content and 'role=' not in content:
            issues.append("Componente sem atributos de acessibilidade")
        
    except Exception as e:
        issues.append(f"Erro ao analisar arquivo {file_path}: {str(e)}")
    
    return issues

async def is_component_reusable(component_path: str) -> bool:
    """Verifica se um componente é reutilizável"""
    
    try:
        # Procurar arquivo principal do componente
        for file in os.listdir(component_path):
            if file.endswith(('.tsx', '.jsx', '.vue')):
                file_path = os.path.join(component_path, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Verificar se tem props configuráveis
                if 'interface Props' in content or 'type Props' in content:
                    props_match = re.search(r'(interface|type) Props\s*{([^}]+)}', content)
                    if props_match:
                        props_content = props_match.group(2)
                        # Se tiver mais de 2 props, consideramos reutilizável
                        prop_count = len(re.findall(r'\w+:', props_content))
                        return prop_count > 2
        
        return False
    except:
        return False

async def validate_tests(project_path: str, stack: str, strict_mode: bool) -> Tuple[int, List[str]]:
    """Valida testes"""
    
    issues = []
    score = 20
    
    tests_path = os.path.join(project_path, "src/tests")
    
    if not os.path.exists(tests_path):
        return 0, ["Diretório de testes não encontrado"]
    
    # Verificar configuração de testes
    test_configs = ["vitest.config.ts", "jest.config.js", "package.json"]
    
    has_config = False
    for config in test_configs:
        config_path = os.path.join(project_path, config)
        if os.path.exists(config_path):
            has_config = True
            break
    
    if not has_config:
        issues.append("Configuração de testes não encontrada")
        score -= 5
    
    # Contar arquivos de teste
    test_files = []
    for root, dirs, files in os.walk(tests_path):
        for file in files:
            if file.endswith(('.test.ts', '.test.tsx', '.test.js', '.spec.ts', '.spec.tsx')):
                test_files.append(file)
    
    # Também procurar testes em outros diretórios
    for root, dirs, files in os.walk(os.path.join(project_path, "src")):
        if "tests" not in root:
            for file in files:
                if file.endswith(('.test.ts', '.test.tsx', '.test.js', '.spec.ts', '.spec.tsx')):
                    test_files.append(file)
    
    if len(test_files) < 3:
        issues.append(f"Poucos arquivos de teste encontrados: {len(test_files)}")
        score -= 5
    
    # Verificar qualidade dos testes
    test_quality_score = 15
    for test_file in test_files[:10]:  # Limitar a 10 arquivos
        test_path = None
        for root, dirs, files in os.walk(os.path.join(project_path, "src")):
            if test_file in files:
                test_path = os.path.join(root, test_file)
                break
        
        if test_path:
            quality_issues = await analyze_test_file(test_path, strict_mode)
            issues.extend(quality_issues)
            test_quality_score -= min(len(quality_issues), 2)
    
    score += max(0, test_quality_score)
    
    return max(0, score), issues

async def analyze_test_file(file_path: str, strict_mode: bool) -> List[str]:
    """Analisa qualidade de um arquivo de teste"""
    
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar se tem describe blocks
        if 'describe(' not in content:
            issues.append(f"Teste sem describe blocks: {os.path.basename(file_path)}")
        
        # Verificar se tem assertions
        if 'expect(' not in content and 'assert.' not in content:
            issues.append(f"Teste sem assertions: {os.path.basename(file_path)}")
        
        # Verificar se testa casos de erro
        if strict_mode and 'error' not in content.lower() and 'exception' not in content.lower():
            issues.append(f"Teste não cobre casos de erro: {os.path.basename(file_path)}")
        
        # Verificar se tem mocks
        if 'vi.mock' not in content and 'jest.mock' not in content and 'mock(' not in content:
            issues.append(f"Teste sem mocks: {os.path.basename(file_path)}")
        
    except Exception as e:
        issues.append(f"Erro ao analisar teste {file_path}: {str(e)}")
    
    return issues

async def validate_performance(project_path: str, strict_mode: bool) -> Tuple[int, List[str]]:
    """Valida performance"""
    
    issues = []
    score = 15
    
    # Verificar package.json para dependências de performance
    package_path = os.path.join(project_path, "package.json")
    if os.path.exists(package_path):
        try:
            with open(package_path, 'r') as f:
                package_data = json.load(f)
            
            # Verificar dependências de performance
            perf_deps = ["@next/bundle-analyzer", "webpack-bundle-analyzer", "lighthouse", "web-vitals"]
            has_perf_tools = any(
                dep in package_data.get("devDependencies", {}) or 
                dep in package_data.get("dependencies", {}) 
                for dep in perf_deps
            )
            
            if not has_perf_tools:
                issues.append("Ferramentas de performance não configuradas")
                score -= 3
            
            # Verificar se tem scripts de build/analyze
            scripts = package_data.get("scripts", {})
            if "build" not in scripts:
                issues.append("Script de build não configurado")
                score -= 2
            
            if "analyze" not in scripts and strict_mode:
                issues.append("Script de análise de bundle não configurado")
                score -= 1
        
        except Exception as e:
            issues.append(f"Erro ao ler package.json: {str(e)}")
            score -= 5
    
    # Verificar otimizações no código
    src_path = os.path.join(project_path, "src")
    if os.path.exists(src_path):
        optimization_score = 10
        
        # Procurar por lazy loading
        lazy_files = []
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if 'lazy(' in content or 'import(' in content:
                                lazy_files.append(file)
                    except:
                        continue
        
        if len(lazy_files) == 0:
            issues.append("Nenhum lazy loading encontrado")
            optimization_score -= 3
        
        # Procurar por React.memo
        memo_files = []
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if 'React.memo' in content or 'memo(' in content:
                                memo_files.append(file)
                    except:
                        continue
        
        if len(memo_files) == 0 and strict_mode:
            issues.append("Nenhuma otimização com React.memo encontrada")
            optimization_score -= 2
        
        # Procurar por useMemo/useCallback
        optimization_files = []
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if 'useMemo' in content or 'useCallback' in content:
                                optimization_files.append(file)
                    except:
                        continue
        
        if len(optimization_files) == 0:
            issues.append("Nenhuma otimização useMemo/useCallback encontrada")
            optimization_score -= 2
        
        score += max(0, optimization_score)
    
    return max(0, score), issues

async def validate_accessibility(project_path: str, strict_mode: bool) -> Tuple[int, List[str]]:
    """Valida acessibilidade"""
    
    issues = []
    score = 10
    
    # Verificar package.json para dependências de acessibilidade
    package_path = os.path.join(project_path, "package.json")
    if os.path.exists(package_path):
        try:
            with open(package_path, 'r') as f:
                package_data = json.load(f)
            
            # Verificar dependências de acessibilidade
            a11y_deps = ["@axe-core/react", "eslint-plugin-jsx-a11y", "cypress-axe", "jest-axe"]
            has_a11y_tools = any(
                dep in package_data.get("devDependencies", {}) or 
                dep in package_data.get("dependencies", {}) 
                for dep in a11y_deps
            )
            
            if not has_a11y_tools:
                issues.append("Ferramentas de acessibilidade não configuradas")
                score -= 3
        
        except Exception as e:
            issues.append(f"Erro ao ler package.json: {str(e)}")
            score -= 3
    
    # Verificar uso de ARIA no código
    src_path = os.path.join(project_path, "src")
    if os.path.exists(src_path):
        aria_files = []
        total_files = 0
        
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    total_files += 1
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if 'aria-' in content or 'role=' in content:
                                aria_files.append(file)
                    except:
                        continue
        
        if len(aria_files) == 0:
            issues.append("Nenhum atributo ARIA encontrado")
            score -= 4
        elif len(aria_files) < total_files * 0.5:
            issues.append(f"Poucos arquivos com atributos ARIA: {len(aria_files)}/{total_files}")
            score -= 2
        
        # Verificar elementos semânticos
        semantic_files = []
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            semantic_tags = ['<header', '<nav', '<main', '<section', '<article', '<aside', '<footer']
                            if any(tag in content for tag in semantic_tags):
                                semantic_files.append(file)
                    except:
                        continue
        
        if len(semantic_files) < total_files * 0.3:
            issues.append("Pouco uso de HTML semântico")
            score -= 1
    
    return max(0, score), issues

async def validate_security(project_path: str, strict_mode: bool) -> Tuple[int, List[str]]:
    """Valida segurança"""
    
    issues = []
    score = 10
    
    # Verificar package.json para dependências de segurança
    package_path = os.path.join(project_path, "package.json")
    if os.path.exists(package_path):
        try:
            with open(package_path, 'r') as f:
                package_data = json.load(f)
            
            # Verificar dependências de segurança
            security_deps = ["helmet", "dompurify", "eslint-plugin-security", "@typescript-eslint/eslint-plugin"]
            has_security_tools = any(
                dep in package_data.get("devDependencies", {}) or 
                dep in package_data.get("dependencies", {}) 
                for dep in security_deps
            )
            
            if not has_security_tools:
                issues.append("Ferramentas de segurança não configuradas")
                score -= 3
        
        except Exception as e:
            issues.append(f"Erro ao ler package.json: {str(e)}")
            score -= 3
    
    # Verificar práticas de segurança no código
    src_path = os.path.join(project_path, "src")
    if os.path.exists(src_path):
        security_issues = []
        
        for root, dirs, files in os.walk(src_path):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                            # Verificar uso perigoso de innerHTML
                            if 'innerHTML' in content and 'sanitize' not in content:
                                security_issues.append(f"Uso perigoso de innerHTML em {file}")
                            
                            # Verificar eval() usage
                            if 'eval(' in content:
                                security_issues.append(f"Uso perigoso de eval() em {file}")
                            
                            # Verificar document.write
                            if 'document.write' in content:
                                security_issues.append(f"Uso perigoso de document.write em {file}")
                            
                            # Verificar se há validação de inputs
                            if 'onChange' in content or 'onInput' in content:
                                if 'validate' not in content and 'sanitize' not in content:
                                    security_issues.append(f"Input sem validação em {file}")
                    
                    except:
                        continue
        
        issues.extend(security_issues[:5])  # Limitar a 5 issues de segurança
        score -= min(len(security_issues), 5)
    
    return max(0, score), issues

async def generate_recommendations(validation_results: Dict[str, Any], issues: List[str]) -> List[str]:
    """Gera recomendações baseado nos resultados"""
    
    recommendations = []
    
    # Recomendações baseadas nos scores
    for category, result in validation_results.items():
        score = result.get("score", 0)
        max_score = result.get("max_score", 20)
        percentage = (score / max_score) * 100 if max_score > 0 else 0
        
        if percentage < 50:
            if category == "structure":
                recommendations.append("📁 Reorganize a estrutura do projeto seguindo as melhores práticas")
            elif category == "components":
                recommendations.append("🧩 Crie componentes reutilizáveis com testes adequados")
            elif category == "tests":
                recommendations.append("🧪 Aumente a cobertura de testes para >80%")
            elif category == "performance":
                recommendations.append("⚡ Implemente otimizações de performance")
            elif category == "accessibility":
                recommendations.append("♿ Melhore a acessibilidade seguindo WCAG 2.1 AA")
            elif category == "security":
                recommendations.append("🔐 Adicione validações de segurança")
        elif percentage < 75:
            if category == "components":
                recommendations.append("🔧 Melhore a qualidade e reusabilidade dos componentes")
            elif category == "tests":
                recommendations.append("📈 Melhore a qualidade e cobertura dos testes")
            elif category == "performance":
                recommendations.append("🚀 Adicione mais otimizações de performance")
    
    # Recomendações baseadas em issues específicas
    if any("diretório" in issue.lower() for issue in issues):
        recommendations.append("📂 Verifique e crie os diretórios obrigatórios da estrutura")
    
    if any("configuração" in issue.lower() for issue in issues):
        recommendations.append("⚙️ Configure os arquivos de configuração necessários")
    
    if any("test" in issue.lower() for issue in issues):
        recommendations.append("🧪 Implemente testes unitários e de integração")
    
    if any("accessibility" in issue.lower() or "aria" in issue.lower() for issue in issues):
        recommendations.append("♿ Adicione atributos ARIA e melhore a acessibilidade")
    
    if any("performance" in issue.lower() or "lazy" in issue.lower() for issue in issues):
        recommendations.append("⚡ Implemente lazy loading e otimizações de performance")
    
    # Remover duplicatas
    recommendations = list(dict.fromkeys(recommendations))
    
    return recommendations

# Exportar função principal
__all__ = ['validate_frontend_quality']
