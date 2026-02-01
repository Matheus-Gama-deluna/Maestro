#!/usr/bin/env python3
"""
Script de Validação de PRD - Maestro Skills
Valida qualidade e completude do PRD baseado no checklist
"""

import os
import sys
import argparse
import re
from pathlib import Path
from datetime import datetime

class PRDValidator:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.prd_path = self.base_dir / "docs" / "01-produto" / "PRD.md"
        self.checklist_path = self.base_dir / "resources" / "checklists" / "prd-validation.md"
        self.min_score = 70
        
    def load_prd(self):
        """Carrega conteúdo do PRD"""
        try:
            with open(self.prd_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ PRD não encontrado: {self.prd_path}")
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
        
    def validate_problem_section(self, content):
        """Valida seção de Problema e Oportunidade"""
        score = 0
        feedback = []
        
        # Problema claro e específico
        if re.search(r'Problema.*claro.*específico', content):
            score += 3
        else:
            feedback.append("❌ Problema não está claro ou específico")
            
        # Impacto quantificável
        if re.search(r'\d+%|\d+x|\$\d+', content):
            score += 3
        else:
            feedback.append("❌ Impacto não está quantificado")
            
        # Causa raiz
        if re.search(r'causa.*raiz|root cause', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Causa raiz não identificada")
            
        # Oportunidade
        if re.search(r'oportunidade.*mercado|market.*opportunity', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Oportunidade de mercado não clara")
            
        # Timing
        if re.search(r'timing|agora.*momento|why now', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Timing não justificado")
            
        return score, feedback
        
    def validate_personas_section(self, content):
        """Valida seção de Personas e JTBD"""
        score = 0
        feedback = []
        
        # Conta personas
        personas = re.findall(r'### \d+\.\d+ Persona', content)
        if len(personas) >= 2:
            score += 5
        else:
            feedback.append(f"❌ Apenas {len(personas)} persona(s) encontradas (mínimo 2)")
            
        # JTBD mapeados
        if re.search(r'Jobs to Be Done|JTBD', content, re.IGNORECASE):
            score += 5
        else:
            feedback.append("❌ Jobs to Be Done não mapeados")
            
        # Dores e ganhos
        if re.search(r'Dores.*Ganhos|Pains.*Gains', content, re.IGNORECASE):
            score += 5
        else:
            feedback.append("❌ Dores e ganhos não especificados")
            
        return score, feedback
        
    def validate_north_star(self, content):
        """Valida North Star Metric"""
        score = 0
        feedback = []
        
        # North Star definida
        if re.search(r'North Star.*definida|North Star Metric', content, re.IGNORECASE):
            score += 4
        else:
            feedback.append("❌ North Star Metric não definida")
            
        # Mensurável
        if re.search(r'como medir|how to measure', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ North Star não é mensurável")
            
        # Reflete valor
        if re.search(r'reflete.*valor|valor.*usuário', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ North Star não reflete valor real")
            
        return score, feedback
        
    def validate_mvp_section(self, content):
        """Valida seção de MVP"""
        score = 0
        feedback = []
        
        # Funcionalidades priorizadas
        functionalities = re.findall(r'Funcionalidade \d+:', content)
        if 3 <= len(functionalities) <= 5:
            score += 5
        else:
            feedback.append(f"❌ {len(functionalities)} funcionalidades (ideal: 3-5)")
            
        # Matriz RICE
        if re.search(r'RICE.*Score|Reach.*Impact.*Confidence.*Effort', content, re.IGNORECASE):
            score += 5
        else:
            feedback.append("❌ Matriz RICE não preenchida")
            
        # Fora do escopo
        if re.search(r'Fora.*escopo|Out of scope', content, re.IGNORECASE):
            score += 5
        else:
            feedback.append("❌ Fora do escopo não definido")
            
        return score, feedback
        
    def validate_metrics_section(self, content):
        """Valida seção de Métricas"""
        score = 0
        feedback = []
        
        # KPIs secundários
        kpis = re.findall(r'KPI \d+:', content)
        if len(kpis) >= 2:
            score += 4
        else:
            feedback.append("❌ KPIs secundários insuficientes")
            
        # Métricas anti-vanity
        if re.search(r'anti.*vanity|real.*metrics', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Métricas anti-vanity não incluídas")
            
        # Metas específicas
        if re.search(r'meta.*\d+|target.*\d+', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Metas não específicas")
            
        return score, feedback
        
    def validate_risks_section(self, content):
        """Valida seção de Riscos"""
        score = 0
        feedback = []
        
        # Riscos técnicos
        if re.search(r'Risco.*técnico|technical.*risk', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Riscos técnicos não identificados")
            
        # Riscos de negócio
        if re.search(r'Risco.*negócio|business.*risk', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Riscos de negócio não identificados")
            
        # Planos de mitigação
        if re.search(r'plano.*mitigação|mitigation.*plan', content, re.IGNORECASE):
            score += 4
        else:
            feedback.append("❌ Planos de mitigação específicos")
            
        return score, feedback
        
    def validate_timeline_section(self, content):
        """Valida seção de Timeline"""
        score = 0
        feedback = []
        
        # Timeline realista
        if re.search(r'6.*8.*semanas|6.*8.*weeks', content, re.IGNORECASE):
            score += 4
        else:
            feedback.append("❌ Timeline não realista (deve ser 6-8 semanas)")
            
        # Marcos críticos
        milestones = re.findall(r'Marco \d+:', content)
        if len(milestones) >= 2:
            score += 3
        else:
            feedback.append("❌ Marcos críticos insuficientes")
            
        # Recursos mapeados
        if re.search(r'Recursos.*necessários|resources.*needed', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Recursos não mapeados")
            
        return score, feedback
        
    def validate_quality_section(self, content):
        """Valida seção de Qualidade"""
        score = 0
        feedback = []
        
        # Hipóteses
        if re.search(r'hipótese.*principal|main.*hypothesis', content, re.IGNORECASE):
            score += 3
        else:
            feedback.append("❌ Hipóteses principais não definidas")
            
        # Plano de aprendizado
        if re.search(r'plano.*aprendizado|learning.*plan', content, re.IGNORECASE):
            score += 2
        else:
            feedback.append("❌ Plano de aprendizado não claro")
            
        # Formatação
        checked, total = self.count_checkboxes(content)
        if checked / total > 0.7:
            score += 2
        else:
            feedback.append(f"❌ Apenas {checked}/{total} checkboxes preenchidos")
            
        return score, feedback
        
    def run_validation(self):
        """Executa validação completa"""
        print("🔍 Iniciando validação do PRD...")
        
        content = self.load_prd()
        
        # Executa validações por seção
        sections = [
            ("Problema e Oportunidade", self.validate_problem_section, 15),
            ("Personas e JTBD", self.validate_personas_section, 15),
            ("North Star Metric", self.validate_north_star, 10),
            ("MVP e Funcionalidades", self.validate_mvp_section, 15),
            ("Métricas de Sucesso", self.validate_metrics_section, 10),
            ("Riscos e Mitigações", self.validate_risks_section, 10),
            ("Timeline e Recursos", self.validate_timeline_section, 10),
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
            recommendation = "Pronto para desenvolvimento"
        elif percentage >= 80:
            status = "✅ Bom"
            recommendation = "Pequenos ajustes recomendados"
        elif percentage >= 70:
            status = "⚠️ Aceitável"
            recommendation = "Revisões recomendadas"
        elif percentage >= 60:
            status = "❌ Insuficiente"
            recommendation = "Revisão obrigatória"
        else:
            status = "❌ Crítico"
            recommendation = "Refazer PRD"
        
        # Gera relatório
        print(f"\n{'='*50}")
        print(f"📊 RELATÓRIO DE VALIDAÇÃO")
        print(f"{'='*50}")
        print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"PRD: {self.prd_path}")
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
        report_path = self.base_dir / "docs" / "01-produto" / "validation-report.md"
        
        report_content = f"""# Relatório de Validação de PRD

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
            report_content += "- PRD está pronto para avançar para a próxima fase\n"
            report_content += "- Iniciar Engenharia de Requisitos\n"
        elif percentage >= 70:
            report_content += "- Realizar ajustes nos itens críticos\n"
            report_content += "- Revalidar após correções\n"
        else:
            report_content += "- Revisar completamente o PRD\n"
            report_content += "- Focar nas seções com score baixo\n"
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report_content)
            print(f"\n📄 Relatório salvo em: {report_path}")
        except Exception as e:
            print(f"❌ Erro ao salvar relatório: {e}")

def main():
    parser = argparse.ArgumentParser(description="Validador de PRD - Maestro Skills")
    parser.add_argument("--base-dir", help="Diretório base do projeto")
    parser.add_argument("--prd-path", help="Caminho customizado do PRD")
    parser.add_argument("--min-score", type=int, default=70, help="Score mínimo para aprovação")
    
    args = parser.parse_args()
    
    validator = PRDValidator(args.base_dir)
    
    if args.prd_path:
        validator.prd_path = Path(args.prd_path)
    
    if args.min_score:
        validator.min_score = args.min_score
    
    # Executa validação
    if validator.run_validation():
        print("\n🎉 PRD VALIDADO COM SUCESSO!")
        print("✅ Pronto para avançar para a próxima fase")
        sys.exit(0)
    else:
        print("\n❌ PRD NÃO ATINGIU SCORE MÍNIMO")
        print("🔧 Realize as correções sugeridas e valide novamente")
        sys.exit(1)

if __name__ == "__main__":
    main()