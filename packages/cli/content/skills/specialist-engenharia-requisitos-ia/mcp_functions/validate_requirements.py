#!/usr/bin/env python3
"""
Script de Validação de Requisitos - Maestro Skills
Valida qualidade e completude do documento de requisitos baseado no checklist
"""

import os
import sys
import argparse
import re
from pathlib import Path
from datetime import datetime

class RequirementsValidator:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.requirements_path = self.base_dir / "docs" / "02-requisitos" / "requisitos.md"
        self.checklist_path = self.base_dir / "resources" / "checklists" / "requirements-validation.md"
        self.min_score = 75
        
    def load_requirements(self):
        """Carrega conteúdo do documento de requisitos"""
        try:
            with open(self.requirements_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ Requisitos não encontrados: {self.requirements_path}")
            sys.exit(1)
            
    def load_checklist(self):
        """Carrega checklist de validação"""
        try:
            with open(self.checklist_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ Checklist não encontrado: {self.checklist_path}")
            sys.exit(1)
            
    def count_checkboxes(self, content):
        """Conta checkboxes marcados e totais"""
        checked = len(re.findall(r'- \[x\]', content, re.IGNORECASE))
        total = len(re.findall(r'- \[[ x]\]', content))
        return checked, total
        
    def validate_structure(self, content):
        """Valida seção de estrutura do documento"""
        score = 0
        feedback = []
        
        # Sumário executivo
        if re.search(r'## Sumário Executivo', content):
            score += 2
        else:
            feedback.append("❌ Seção Sumário Executivo não encontrada")
            
        # Visão geral
        if re.search(r'## 1\. Visão Geral do Projeto', content):
            score += 2
        else:
            feedback.append("❌ Seção Visão Geral não encontrada")
            
        # Requisitos funcionais
        if re.search(r'## 2\. Requisitos Funcionais', content):
            score += 3
        else:
            feedback.append("❌ Seção Requisitos Funcionais não encontrada")
            
        # Requisitos não funcionais
        if re.search(r'## 3\. Requisitos Não Funcionais', content):
            score += 3
        else:
            feedback.append("❌ Seção Requisitos Não Funcionais não encontrada")
            
        # Regras de negócio
        if re.search(r'## 4\. Regras de Negócio', content):
            score += 2
        else:
            feedback.append("❌ Seção Regras de Negócio não encontrada")
            
        # Restrições técnicas
        if re.search(r'## 5\. Restrições Técnicas', content):
            score += 2
        else:
            feedback.append("❌ Seção Restrições Técnicas não encontrada")
            
        # Interfaces externas
        if re.search(r'## 6\. Interfaces Externas', content):
            score += 1
        else:
            feedback.append("❌ Seção Interfaces Externas não encontrada")
            
        return score, feedback
        
    def validate_functional_requirements(self, content):
        """Valida seção de requisitos funcionais"""
        score = 0
        feedback = []
        
        # Conta RFs
        rfs = re.findall(r'#### RF-\d+:', content)
        if len(rfs) >= 3:
            score += 5
        else:
            feedback.append(f"❌ Apenas {len(rfs)} RFs encontrados (mínimo 3)")
            
        # Formato dos RFs
        rf_format = re.findall(r'#### RF-\d+: \[.*?\]', content)
        if len(rf_format) >= 3:
            score += 3
        else:
            feedback.append("❌ Formato dos RFs inadequado")
            
        # Descrição dos RFs
        descriptions = re.findall(r'- \*\*Descrição:\*\* .*', content)
        if len(descriptions) >= 3:
            score += 3
        else:
            feedback.append(f"❌ Apenas {len(descriptions)} descrições encontradas")
            
        # Prioridades
        priorities = re.findall(r'- \*\*Prioridade:\*\* .*', content)
        if len(priorities) >= 3:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(priorities)} prioridades encontradas")
            
        # Fontes
        sources = re.findall(r'- \*\*Fonte:\*\* .*', content)
        if len(sources) >= 3:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(sources)} fontes encontradas")
            
        return score, feedback
        
    def validate_non_functional_requirements(self, content):
        """Valida seção de requisitos não funcionais"""
        score = 0
        feedback = []
        
        # Conta RNFs
        rnfs = re.findall(r'#### RNF-\d+:', content)
        if len(rnfs) >= 2:
            score += 3
        else:
            feedback.append(f"❌ Apenas {len(rnfs)} RNFs encontrados (mínimo 2)")
            
        # Categorias
        categories = re.findall(r'- \*\*Categoria:\*\* .*', content)
        if len(categories) >= 2:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(categories)} categorias encontradas")
            
        # Métricas
        metrics = re.findall(r'- \*\*Métrica:\*\* .*', content)
        if len(metrics) >= 2:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(metrics)} métricas encontradas")
            
        # Valores alvo
        targets = re.findall(r'- \*\*Valor Alvo:\*\* .*', content)
        if len(targets) >= 2:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(targets)} valores alvo encontrados")
            
        # Condições
        conditions = re.findall(r'- \*\*Condições:\*\* .*', content)
        if len(conditions) >= 2:
            score += 1
        else:
            feedback.append(f"❌ Apenas {len(conditions)} condições encontradas")
            
        return score, feedback
        
    def validate_business_rules(self, content):
        """Valida seção de regras de negócio"""
        score = 0
        feedback = []
        
        # Conta RNs
        rns = re.findall(r'#### RN-\d+:', content)
        if len(rns) >= 1:
            score += 3
        else:
            feedback.append(f"❌ Apenas {len(rns)} RNs encontrados (mínimo 1)")
            
        # Condições
        conditions = re.findall(r'- \*\*Condição:\*\* .*', content)
        if len(conditions) >= 1:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(conditions)} condições encontradas")
            
        # Ações
        actions = re.findall(r'- \*\*Ação:\*\* .*', content)
        if len(actions) >= 1:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(actions)} ações encontradas")
            
        # Exceções
        exceptions = re.findall(r'- \*\*Exceção:\*\* .*', content)
        if len(exceptions) >= 1:
            score += 2
        else:
            feedback.append(f"❌ Apenas {len(exceptions)} exceções encontradas")
            
        # Prioridades
        priorities = re.findall(r'- \*\*Prioridade:\*\* .*', content)
        if len(priorities) >= 1:
            score += 1
        else:
            feedback.append(f"❌ Apenas {len(priorities)} prioridades encontradas")
            
        return score, feedback
        
    def validate_technical_constraints(self, content):
        """Valida seção de restrições técnicas"""
        score = 0
        feedback = []
        
        # Arquitetura
        if re.search(r'- \*\*Arquitetura:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Arquitetura não especificada")
            
        # Tecnologias
        if re.search(r'- \*\*Linguagens:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Linguagens não especificadas")
            
        # Banco de dados
        if re.search(r'- \*\*Banco de Dados:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Banco de dados não especificado")
            
        # Integrações
        if re.search(r'- \*\*Integrações:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Integrações não especificadas")
            
        # Compliance
        if re.search(r'- \*\*Compliance:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Compliance não especificado")
            
        return score, feedback
        
    def validate_external_interfaces(self, content):
        """Valida seção de interfaces externas"""
        score = 0
        feedback = []
        
        # Integrações de sistema
        if re.search(r'- \*\*Sistema A:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Integrações de sistema não especificadas")
            
        # APIs
        if re.search(r'- \*\*APIs Externas:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ APIs externas não especificadas")
            
        # Webhooks
        if re.search(r'- \*\*Webhooks:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Webhooks não especificados")
            
        # Autenticação
        if re.search(r'- \*\*Autenticação:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Autenticação não especificada")
            
        # Taxas de uso
        if re.search(r'- \*\*Taxas de uso:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Taxas de uso não especificadas")
            
        return score, feedback
        
    def validate_quality_section(self, content):
        """Valida seção de qualidade e completude"""
        score = 0
        feedback = []
        
        # Checklist de qualidade
        checked, total = self.count_checkboxes(content)
        if checked / total > 0.8:
            score += 3
        else:
            feedback.append(f"❌ Apenas {checked}/{total} checkboxes preenchidos")
            
        # Formatação
        if re.search(r'## Checklist de Qualidade', content):
            score += 2
        else:
            feedback.append("❌ Checklist de qualidade não encontrado")
            
        # Status
        if re.search(r'\*\*Status:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Status não especificado")
            
        # Versão
        if re.search(r'\*\*Versão:\*\* .*', content):
            score += 2
        else:
            feedback.append("❌ Versão não especificada")
            
        # Data
        if re.search(r'\*\*Data:\*\* .*', content):
            score += 1
        else:
            feedback.append("❌ Data não especificada")
            
        return score, feedback
        
    def run_validation(self):
        """Executa validação completa"""
        print("🔍 Iniciando validação de requisitos...")
        
        content = self.load_requirements()
        
        # Executa validações por seção
        sections = [
            ("Estrutura do Documento", self.validate_structure, 15),
            ("Requisitos Funcionais", self.validate_functional_requirements, 15),
            ("Requisitos Não Funcionais", self.validate_non_functional_requirements, 10),
            ("Regras de Negócio", self.validate_business_rules, 10),
            ("Restrições Técnicas", self.validate_technical_constraints, 10),
            ("Interfaces Externas", self.validate_external_interfaces, 10),
            ("Qualidade e Completude", self.validate_quality_section, 10)
        ]
        
        total_score = 0
        max_score = 0
        all_feedback = []
        
        for section_name, validator, section_max in sections:
            score, feedback = validator(content)
            total_score += score
            max_score += section_max
            
            print(f"\n📋 {section_name}: {score}/{section_max}")
            if feedback:
                all_feedback.extend(feedback)
                for item in feedback:
                    print(f"   {item}")
            else:
                print("   ✅ Seção validada")
        
        # Calcula percentual
        percentage = (total_score / max_score) * 100
        
        # Determina status
        if percentage >= 90:
            status = "✅ Excelente"
            recommendation = "Pronto para implementação"
        elif percentage >= 80:
            status = "✅ Bom"
            recommendation = "Pequenos ajustes recomendados"
        elif percentage >= 75:
            status = "⚠️ Aceitável"
            recommendation = "Revisões recomendadas"
        elif percentage >= 60:
            status = "❌ Insuficiente"
            recommendation = "Revisão obrigatória"
        else:
            status = "❌ Crítico"
            recommendation = "Refazer completamente"
        
        # Gera relatório
        print(f"\n{'='*50}")
        print(f"📊 RELATÓRIO DE VALIDAÇÃO")
        print(f"{'='*50}")
        print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Requisitos: {self.requirements_path}")
        print(f"Score: {total_score}/{max_score} ({percentage:.1f}%)")
        print(f"Status: {status}")
        print(f"Recomendação: {recommendation}")
        
        if all_feedback:
            print(f"\n🔧 ITENS CRÍTICOS PENDENTES:")
            for i, item in enumerate(all_feedback, 1):
                print(f"   {i}. {item}")
        
        # Salva relatório
        self.save_validation_report(total_score, max_score, percentage, status, all_feedback)
        
        return percentage >= self.min_score
        
    def save_validation_report(self, score, max_score, percentage, status, feedback):
        """Salva relatório de validação"""
        report_path = self.base_dir / "docs" / "02-requisitos" / "validation-report.md"
        
        report_content = f"""# Relatório de Validação de Requisitos

## Resultado
- **Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Score:** {score}/{max_score} ({percentage:.1f}%)
- **Status:** {status}
- **Threshold Mínimo:** {self.min_score}%

## Itens Críticos Pendentes
"""
        
        if feedback:
            for i, item in enumerate(feedback, 1):
                report_content += f"{i}. {item}\n"
        else:
            report_content += "Nenhum item crítico pendente.\n"
        
        report_content += f"""
## Recomendações
"""
        
        if percentage >= 90:
            report_content += "- Requisitos estão prontos para avançar para a próxima fase\n"
            report_content += "- Iniciar UX Design\n"
        elif percentage >= 75:
            report_content += "- Realizar ajustes nos itens críticos\n"
            report_content += "- Revalidar após correções\n"
        else:
            report_content += "- Revisar completamente os requisitos\n"
            report_content += "- Focar nas seções com score baixo\n"
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report_content)
            print(f"\n📄 Relatório salvo em: {report_path}")
        except Exception as e:
            print(f"❌ Erro ao salvar relatório: {e}")

def main():
    parser = argparse.ArgumentParser(description="Validador de Requisitos - Maestro Skills")
    parser.add_argument("--base-dir", help="Diretório base do projeto")
    parser.add_argument("--requirements-path", help="Caminho customizado dos requisitos")
    parser.add_argument("--min-score", type=int, default=75, help="Score mínimo para aprovação")
    
    args = parser.parse_args()
    
    validator = RequirementsValidator(args.base_dir)
    
    if args.requirements_path:
        validator.requirements_path = Path(args.requirements_path)
    
    if args.min_score:
        validator.min_score = args.min_score
    
    # Executa validação
    if validator.run_validation():
        print("\n🎉 REQUISITOS VALIDADOS COM SUCESSO!")
        print("✅ Pronto para avançar para a próxima fase")
        sys.exit(0)
    else:
        print("\n❌ REQUISITOS NÃO ATINGIRAM SCORE MÍNIMO")
        print("🔧 Realize as correções sugeridas e valide novamente")
        sys.exit(1)

if __name__ == "__main__":
    main()