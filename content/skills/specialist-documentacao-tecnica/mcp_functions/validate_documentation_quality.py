#!/usr/bin/env python3
"""
Referência MCP: Validação de Qualidade de Documentação

Esta função valida a qualidade da documentação técnica usando
checklists automatizados e métricas específicas.

NOTA: Este é um arquivo de referência. A execução real deve ser
implementada no servidor MCP externo.
"""

from typing import Dict, List, Optional, Tuple
from pathlib import Path
import re
import json
from datetime import datetime
import requests
from urllib.parse import urlparse

class DocumentationValidator:
    """Validador de qualidade de documentação"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.validation_results = {}
        
    def validate_quality(self, config: Dict) -> Dict:
        """
        Valida qualidade da documentação completa
        
        Args:
            config: Dicionário com configuração de validação
                - completeness: boolean (validar completude)
                - accuracy: boolean (validar acurácia)
                - accessibility: boolean (validar acessibilidade)
                - freshness: boolean (validar atualização)
                - min_score: int (score mínimo para aprovação)
                
        Returns:
            Dict com resultado completo da validação
        """
        
        min_score = config.get("min_score", 75)
        validations = config.get("validations", {
            "completeness": True,
            "accuracy": True,
            "accessibility": True,
            "freshness": True
        })
        
        # Executar validações
        results = {}
        
        if validations.get("completeness", True):
            results["completeness"] = self._validate_completeness()
        
        if validations.get("accuracy", True):
            results["accuracy"] = self._validate_accuracy()
        
        if validations.get("accessibility", True):
            results["accessibility"] = self._validate_accessibility()
        
        if validations.get("freshness", True):
            results["freshness"] = self._validate_freshness()
        
        # Calcular score total
        total_score = self._calculate_total_score(results)
        
        # Gerar relatório
        report = {
            "status": "success",
            "validation": {
                "timestamp": datetime.now().isoformat(),
                "total_score": total_score,
                "min_score": min_score,
                "passed": total_score >= min_score,
                "results": results
            },
            "summary": self._generate_summary(results, total_score, min_score),
            "recommendations": self._generate_recommendations(results),
            "next_steps": self._get_next_steps(total_score, min_score)
        }
        
        return report
    
    def _validate_completeness(self) -> Dict:
        """Valida completude da documentação"""
        
        score = 0
        max_score = 25
        issues = []
        checks = []
        
        # Verificar README.md
        readme_path = self.project_path / "README.md"
        if readme_path.exists():
            readme_content = readme_path.read_text(encoding='utf-8')
            
            # Título e descrição
            if re.search(r'^# .+', readme_content, re.MULTILINE):
                score += 2
                checks.append("✅ README tem título")
            else:
                issues.append("❌ README sem título")
            
            # Descrição do projeto
            if re.search(r'## 🎯 Sobre', readme_content):
                score += 2
                checks.append("✅ README tem seção Sobre")
            else:
                issues.append("❌ README sem seção Sobre")
            
            # Getting Started
            if re.search(r'## 🚀 Getting Started', readme_content):
                score += 2
                checks.append("✅ README tem Getting Started")
            else:
                issues.append("❌ README sem Getting Started")
            
            # Stack tecnológica
            if re.search(r'## 🛠️ Stack', readme_content):
                score += 1
                checks.append("✅ README tem Stack Tecnológica")
            else:
                issues.append("❌ README sem Stack Tecnológica")
            
            # Estrutura do projeto
            if re.search(r'## 📁 Estrutura', readme_content):
                score += 1
                checks.append("✅ README tem Estrutura do Projeto")
            else:
                issues.append("❌ README sem Estrutura do Projeto")
            
            # Scripts
            if re.search(r'## 🔧 Scripts', readme_content):
                score += 1
                checks.append("✅ README tem Scripts")
            else:
                issues.append("❌ README sem Scripts")
            
            # Variáveis de ambiente
            env_example = self.project_path / ".env.example"
            if env_example.exists():
                score += 1
                checks.append("✅ .env.example existe")
            else:
                issues.append("❌ .env.example ausente")
        else:
            issues.append("❌ README.md não existe")
        
        # Verificar documentação de API
        docs_api_path = self.project_path / "docs" / "api"
        if docs_api_path.exists():
            api_readme = docs_api_path / "README.md"
            if api_readme.exists():
                api_content = api_readme.read_text(encoding='utf-8')
                
                # Autenticação
                if re.search(r'## 🔐 Autenticação', api_content):
                    score += 3
                    checks.append("✅ API docs tem Autenticação")
                else:
                    issues.append("❌ API docs sem Autenticação")
                
                # Endpoints
                if re.search(r'## 📋 Endpoints', api_content):
                    score += 3
                    checks.append("✅ API docs tem Endpoints")
                else:
                    issues.append("❌ API docs sem Endpoints")
                
                # Exemplos
                if re.search(r'```bash', api_content):
                    score += 2
                    checks.append("✅ API docs tem exemplos")
                else:
                    issues.append("❌ API docs sem exemplos")
                
                # Error handling
                if re.search(r'## ⚠️ Error', api_content):
                    score += 2
                    checks.append("✅ API docs tem Error Handling")
                else:
                    issues.append("❌ API docs sem Error Handling")
        else:
            issues.append("❌ Documentação de API ausente")
        
        # Verificar documentação adicional
        contributing_path = self.project_path / "CONTRIBUTING.md"
        if contributing_path.exists():
            score += 2
            checks.append("✅ CONTRIBUTING.md existe")
        else:
            issues.append("❌ CONTRIBUTING.md ausente")
        
        changelog_path = self.project_path / "CHANGELOG.md"
        if changelog_path.exists():
            score += 1
            checks.append("✅ CHANGELOG.md existe")
        else:
            issues.append("❌ CHANGELOG.md ausente")
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round((score / max_score) * 100, 1),
            "checks": checks,
            "issues": issues,
            "status": "passed" if score >= 20 else "needs_improvement"
        }
    
    def _validate_accuracy(self) -> Dict:
        """Valida acurácia dos exemplos e links"""
        
        score = 0
        max_score = 20
        issues = []
        checks = []
        
        # Verificar links no README
        readme_path = self.project_path / "README.md"
        if readme_path.exists():
            readme_content = readme_path.read_text(encoding='utf-8')
            
            # Encontrar links markdown
            markdown_links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', readme_content)
            
            valid_links = 0
            total_links = len(markdown_links)
            
            for text, url in markdown_links:
                if url.startswith('http'):
                    # Verificar link externo
                    try:
                        response = requests.head(url, timeout=5, allow_redirects=True)
                        if response.status_code < 400:
                            valid_links += 1
                            checks.append(f"✅ Link válido: {text}")
                        else:
                            issues.append(f"❌ Link quebrado: {text} ({url})")
                    except:
                        issues.append(f"❌ Link inacessível: {text} ({url})")
                else:
                    # Verificar link interno
                    if url.startswith('#'):
                        # Âncora interna
                        anchor = url[1:].lower().replace(' ', '-')
                        if re.search(rf'#+ {re.escape(text)}', readme_content, re.IGNORECASE):
                            valid_links += 1
                            checks.append(f"✅ Âncora válida: {text}")
                        else:
                            issues.append(f"❌ Âncora quebrada: {text}")
                    else:
                        # Link para arquivo
                        file_path = self.project_path / url
                        if file_path.exists():
                            valid_links += 1
                            checks.append(f"✅ Arquivo existe: {url}")
                        else:
                            issues.append(f"❌ Arquivo não encontrado: {url}")
            
            if total_links > 0:
                link_score = min(5, int((valid_links / total_links) * 5))
                score += link_score
            else:
                score += 2  # Sem links para verificar
                checks.append("ℹ️ Nenhum link para verificar")
        
        # Verificar exemplos de código
        code_examples = self._find_code_examples()
        working_examples = 0
        
        for example in code_examples:
            if self._validate_code_example(example):
                working_examples += 1
                checks.append(f"✅ Exemplo válido: {example['file']}")
            else:
                issues.append(f"❌ Exemplo inválido: {example['file']}")
        
        if code_examples:
            example_score = min(10, int((working_examples / len(code_examples)) * 10))
            score += example_score
        else:
            score += 3
            checks.append("ℹ️ Nenhum exemplo de código encontrado")
        
        # Verificar comandos shell
        shell_commands = self._find_shell_commands()
        valid_commands = 0
        
        for command in shell_commands:
            if self._validate_shell_command(command):
                valid_commands += 1
                checks.append(f"✅ Comando válido: {command['command'][:30]}...")
            else:
                issues.append(f"❌ Comando inválido: {command['command'][:30]}...")
        
        if shell_commands:
            command_score = min(5, int((valid_commands / len(shell_commands)) * 5))
            score += command_score
        else:
            score += 2
            checks.append("ℹ️ Nenhum comando shell encontrado")
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round((score / max_score) * 100, 1),
            "checks": checks,
            "issues": issues,
            "status": "passed" if score >= 15 else "needs_improvement"
        }
    
    def _validate_accessibility(self) -> Dict:
        """Valida acessibilidade da documentação"""
        
        score = 0
        max_score = 20
        issues = []
        checks = []
        
        # Verificar estrutura semântica
        readme_path = self.project_path / "README.md"
        if readme_path.exists():
            readme_content = readme_path.read_text(encoding='utf-8')
            
            # Hierarquia de cabeçalhos
            headers = re.findall(r'^(#{1,6})\s+(.+)$', readme_content, re.MULTILINE)
            
            if headers:
                # Verificar se começa com h1
                if headers[0][0] == '#':
                    score += 3
                    checks.append("✅ Começa com H1")
                else:
                    issues.append("❌ Não começa com H1")
                
                # Verificar hierarquia correta
                prev_level = 0
                hierarchy_correct = True
                
                for level, title in headers:
                    curr_level = len(level)
                    if curr_level > prev_level + 1:
                        hierarchy_correct = False
                        break
                    prev_level = curr_level
                
                if hierarchy_correct:
                    score += 3
                    checks.append("✅ Hierarquia de cabeçalhos correta")
                else:
                    issues.append("❌ Hierarquia de cabeçalhos incorreta")
            else:
                issues.append("❌ Sem cabeçalhos encontrados")
            
            # Verificar listas
            if re.search(r'^\s*[-*+]\s+', readme_content, re.MULTILINE):
                score += 2
                checks.append("✅ Usa listas markdown")
            
            # Verificar tabelas
            if re.search(r'\|.*\|', readme_content):
                score += 2
                checks.append("✅ Usa tabelas markdown")
            
            # Verificar código blocks
            code_blocks = re.findall(r'```(\w+)?\n(.*?)\n```', readme_content, re.DOTALL)
            if code_blocks:
                score += 2
                checks.append(f"✅ Tem {len(code_blocks)} blocos de código")
            
            # Verificar linguagem destacada
            highlighted_blocks = [block for block in code_blocks if block[0]]
            if highlighted_blocks:
                score += 1
                checks.append("✅ Código com sintaxe destacada")
        
        # Verificar navegação
        if re.search(r'## 📋 Sumário', readme_content):
            score += 3
            checks.append("✅ Tem sumário")
        
        # Verificar busca
        if (self.project_path / "docs").exists():
            docs_files = list((self.project_path / "docs").rglob("*.md"))
            if len(docs_files) > 5:
                score += 2
                checks.append("✅ Documentação bem estruturada")
        
        # Verificar multimídia
        images = list(self.project_path.rglob("*.png")) + list(self.project_path.rglob("*.jpg"))
        if images:
            score += 2
            checks.append("✅ Contém imagens")
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round((score / max_score) * 100, 1),
            "checks": checks,
            "issues": issues,
            "status": "passed" if score >= 15 else "needs_improvement"
        }
    
    def _validate_freshness(self) -> Dict:
        """Valida atualização da documentação"""
        
        score = 0
        max_score = 15
        issues = []
        checks = []
        
        # Verificar datas de atualização
        readme_path = self.project_path / "README.md"
        if readme_path.exists():
            readme_content = readme_path.read_text(encoding='utf-8')
            
            # Procurar por data de atualização
            date_patterns = [
                r'Última atualização:\s*(\d{2}/\d{2}/\d{4})',
                r'Last updated:\s*(\d{4}-\d{2}-\d{2})',
                r'Updated:\s*(\d{2}/\d{2}/\d{4})'
            ]
            
            date_found = False
            for pattern in date_patterns:
                match = re.search(pattern, readme_content)
                if match:
                    date_str = match.group(1)
                    try:
                        # Tentar parse da data
                        if '/' in date_str:
                            date = datetime.strptime(date_str, '%d/%m/%Y')
                        else:
                            date = datetime.strptime(date_str, '%Y-%m-%d')
                        
                        # Verificar se é recente (últimos 30 dias)
                        days_old = (datetime.now() - date).days
                        if days_old <= 30:
                            score += 5
                            checks.append(f"✅ Documentação atualizada ({days_old} dias)")
                        elif days_old <= 90:
                            score += 3
                            checks.append(f"⚠️ Documentação razoavelmente atualizada ({days_old} dias)")
                        else:
                            issues.append(f"❌ Documentação desatualizada ({days_old} dias)")
                        
                        date_found = True
                        break
                    except:
                        continue
            
            if not date_found:
                issues.append("❌ Sem data de atualização encontrada")
        
        # Verificar sincronização com package.json
        package_json = self.project_path / "package.json"
        if package_json.exists():
            try:
                package_data = json.loads(package_json.read_text(encoding='utf-8'))
                package_version = package_data.get("version", "1.0.0")
                
                # Verificar se versão está no README
                if readme_content and package_version in readme_content:
                    score += 3
                    checks.append(f"✅ Versão sincronizada ({package_version})")
                else:
                    issues.append(f"❌ Versão não sincronizada ({package_version})")
            except:
                issues.append("❌ Erro ao ler package.json")
        
        # Verificar changelog
        changelog_path = self.project_path / "CHANGELOG.md"
        if changelog_path.exists():
            changelog_content = changelog_path.read_text(encoding='utf-8')
            
            # Verificar se tem entradas recentes
            recent_entries = re.findall(r'##\s*\[?\d{1,2}\.\d{1,2}\.\d{1,3}\]?', changelog_content)
            if recent_entries:
                score += 4
                checks.append("✅ CHANGELOG mantido")
            else:
                issues.append("❌ CHANGELOG sem entradas")
        else:
            issues.append("❌ CHANGELOG ausente")
        
        # Verificar breaking changes
        if readme_content:
            if re.search(r'breaking change', readme_content, re.IGNORECASE):
                score += 3
                checks.append("✅ Breaking changes documentados")
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round((score / max_score) * 100, 1),
            "checks": checks,
            "issues": issues,
            "status": "passed" if score >= 10 else "needs_improvement"
        }
    
    def _find_code_examples(self) -> List[Dict]:
        """Encontra exemplos de código na documentação"""
        examples = []
        
        for md_file in self.project_path.rglob("*.md"):
            content = md_file.read_text(encoding='utf-8')
            code_blocks = re.findall(r'```(\w+)?\n(.*?)\n```', content, re.DOTALL)
            
            for lang, code in code_blocks:
                if lang and lang.lower() in ['javascript', 'typescript', 'python', 'bash', 'json']:
                    examples.append({
                        'file': str(md_file.relative_to(self.project_path)),
                        'language': lang,
                        'code': code
                    })
        
        return examples
    
    def _validate_code_example(self, example: Dict) -> bool:
        """Valida se um exemplo de código é sintaticamente correto"""
        
        lang = example['language'].lower()
        code = example['code']
        
        # Validações básicas por linguagem
        if lang in ['javascript', 'typescript']:
            # Verificar se tem parênteses balanceados
            if code.count('(') != code.count(')'):
                return False
            # Verificar se tem chaves balanceadas
            if code.count('{') != code.count('}'):
                return False
        
        elif lang == 'json':
            # Tentar parse JSON
            try:
                json.loads(code)
                return True
            except:
                return False
        
        elif lang == 'python':
            # Verificar indentação básica
            lines = code.strip().split('\n')
            for line in lines:
                if line.strip() and not line.startswith(' '):
                    continue  # Linha no nível 0 está ok
        
        return True  # Assume válido para outras validações
    
    def _find_shell_commands(self) -> List[Dict]:
        """Encontra comandos shell na documentação"""
        commands = []
        
        for md_file in self.project_path.rglob("*.md"):
            content = md_file.read_text(encoding='utf-8')
            bash_blocks = re.findall(r'```bash\n(.*?)\n```', content, re.DOTALL)
            
            for bash_code in bash_blocks:
                # Extrair comandos principais
                lines = bash_code.strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        commands.append({
                            'file': str(md_file.relative_to(self.project_path)),
                            'command': line
                        })
        
        return commands
    
    def _validate_shell_command(self, command: Dict) -> bool:
        """Valida se um comando shell parece válido"""
        
        cmd = command['command']
        
        # Verificar se tem comandos básicos válidos
        valid_commands = ['npm', 'yarn', 'git', 'curl', 'node', 'python', 'pip', 'docker']
        
        for valid_cmd in valid_commands:
            if cmd.startswith(valid_cmd):
                return True
        
        return False
    
    def _calculate_total_score(self, results: Dict) -> Dict:
        """Calcula score total das validações"""
        
        total_score = 0
        max_total_score = 0
        section_scores = {}
        
        for section, result in results.items():
            score = result.get("score", 0)
            max_score = result.get("max_score", 0)
            
            total_score += score
            max_total_score += max_score
            section_scores[section] = {
                "score": score,
                "max_score": max_score,
                "percentage": round((score / max_score) * 100, 1) if max_score > 0 else 0
            }
        
        return {
            "total": total_score,
            "max_total": max_total_score,
            "percentage": round((total_score / max_total_score) * 100, 1) if max_total_score > 0 else 0,
            "sections": section_scores
        }
    
    def _generate_summary(self, results: Dict, total_score: Dict, min_score: int) -> str:
        """Gera resumo da validação"""
        
        percentage = total_score["percentage"]
        passed = percentage >= min_score
        
        if passed:
            status = "✅ APROVADO"
            message = f"Documentação aprovada com score {percentage}% ({total_score['total']}/{total_score['max_total']})"
        else:
            status = "❌ REPROVADO"
            message = f"Documentação reprovada com score {percentage}% ({total_score['total']}/{total_score['max_total']}). Mínimo necessário: {min_score}%"
        
        # Contar issues
        total_issues = sum(len(result.get("issues", [])) for result in results.values())
        total_checks = sum(len(result.get("checks", [])) for result in results.values())
        
        summary = f"""# 📊 Resumo da Validação

## 🎯 Status: {status}

{message}

## 📈 Métricas
- **Score Total:** {total_score['total']}/{total_score['max_total']} ({percentage}%)
- **Mínimo Necessário:** {min_score}%
- **Checks Passados:** {total_checks}
- **Issues Encontrados:** {total_issues}

## 📋 Resultados por Seção
"""
        
        for section, scores in total_score["sections"].items():
            section_result = results[section]
            section_status = "✅" if scores["percentage"] >= 75 else "⚠️"
            summary += f"- **{section.title()}:** {section_status} {scores['score']}/{scores['max_score']} ({scores['percentage']}%)\n"
        
        return summary
    
    def _generate_recommendations(self, results: Dict) -> List[str]:
        """Gera recomendações baseadas nos resultados"""
        
        recommendations = []
        
        for section, result in results.items():
            issues = result.get("issues", [])
            
            if section == "completeness":
                if any("README" in issue for issue in issues):
                    recommendations.append("📝 Melhore o README.md adicionando seções faltantes")
                if any("API" in issue for issue in issues):
                    recommendations.append("📡 Complete a documentação da API")
                if any("CONTRIBUTING" in issue for issue in issues):
                    recommendations.append("🤝 Crie um guia de contribuição")
            
            elif section == "accuracy":
                if any("Link" in issue for issue in issues):
                    recommendations.append("🔗 Corrija os links quebrados encontrados")
                if any("Exemplo" in issue for issue in issues):
                    recommendations.append("💡 Teste e corrija os exemplos de código")
            
            elif section == "accessibility":
                if any("Hierarquia" in issue for issue in issues):
                    recommendations.append("📐 Corrija a hierarquia de cabeçalhos")
                if any("Sumário" in issue for issue in issues):
                    recommendations.append("📋 Adicione um sumário ao README")
            
            elif section == "freshness":
                if any("desatualizada" in issue for issue in issues):
                    recommendations.append("📅 Atualize a data da documentação")
                if any("sincronizada" in issue for issue in issues):
                    recommendations.append("🔄 Sincronize a versão com package.json")
        
        if not recommendations:
            recommendations.append("🎉 Excelente trabalho! Documentação em ótimo estado.")
        
        return recommendations
    
    def _get_next_steps(self, total_score: Dict, min_score: int) -> List[str]:
        """Retorna próximos passos baseados no score"""
        
        percentage = total_score["percentage"]
        
        if percentage >= min_score:
            return [
                "✅ Documentação aprovada para publicação",
                "🚀 Configure deploy automático",
                "📊 Monitore métricas de uso",
                "🔄 Estabeleça processo de atualização contínua"
            ]
        elif percentage >= min_score - 10:
            return [
                "⚠️ Corrija issues críticas identificadas",
                "🔄 Execute validação novamente",
                "📝 Foque em melhorias de alto impacto",
                "👥 Solicite revisão da equipe"
            ]
        else:
            return [
                "❌ Reestruturação completa necessária",
                "📋 Siga o checklist de qualidade",
                "🎯 Priorize completude e exemplos funcionais",
                "🔄 Execute validação após cada melhoria"
            ]


# Função principal para MCP
def validate_documentation_quality(params: Dict) -> Dict:
    """
    Função MCP para validar qualidade da documentação
    
    Args:
        params: {
            "project_path": "/path/to/project",
            "validations": {
                "completeness": true,
                "accuracy": true,
                "accessibility": true,
                "freshness": true
            },
            "min_score": 75
        }
    
    Returns:
        Dict com resultado da validação
    """
    
    try:
        project_path = params.get("project_path", ".")
        validator = DocumentationValidator(project_path)
        
        result = validator.validate_quality(params)
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to validate documentation quality"
        }


# Exemplo de uso
if __name__ == "__main__":
    # Teste da função
    params = {
        "project_path": "./test-project",
        "validations": {
            "completeness": True,
            "accuracy": True,
            "accessibility": True,
            "freshness": True
        },
        "min_score": 75
    }
    
    result = validate_documentation_quality(params)
    print(json.dumps(result, indent=2))