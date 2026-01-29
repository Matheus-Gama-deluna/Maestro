#!/usr/bin/env python3
"""
Script de Processamento de Requisitos - Maestro Skills
Processa requisitos para próxima fase e gera contexto para UX Design
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
import json

class RequirementsProcessor:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.requirements_path = self.base_dir / "docs" / "02-requisitos" / "requisitos.md"
        self.context_path = self.base_dir / "docs" / "CONTEXTO.md"
        self.output_dir = self.base_dir / "docs" / "03-ux-design"
        
    def load_requirements(self):
        """Carrega conteúdo do documento de requisitos"""
        try:
            with open(self.requirements_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ Requisitos não encontrados: {self.requirements_path}")
            sys.exit(1)
            
    def load_context(self):
        """Carrega contexto atual do projeto"""
        try:
            with open(self.context_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ CONTEXTO.md não encontrado: {self.context_path}")
            sys.exit(1)
            
    def extract_requirements_summary(self, requirements_content):
        """Extrai resumo estruturado dos requisitos"""
        summary = {
            "project_name": "",
            "functional_requirements": [],
            "non_functional_requirements": [],
            "business_rules": [],
            "technical_constraints": [],
            "external_interfaces": [],
            "stakeholders": []
        }
        
        lines = requirements_content.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            # Nome do projeto
            if line.startswith('# ') and not summary["project_name"]:
                summary["project_name"] = line.replace('# ', '').strip()
                
            # Requisitos funcionais
            elif '## 2. Requisitos Funcionais' in line:
                current_section = "functional"
            elif current_section == "functional" and line.startswith('#### RF-'):
                rf = {"id": "", "title": "", "description": "", "priority": ""}
                rf["id"] = line.split(':')[0].strip()
                rf["title"] = line.split(':')[1].strip().replace('[', '').replace(']', '')
                summary["functional_requirements"].append(rf)
            elif current_section == "functional" and line.startswith('- **Descrição:**'):
                if summary["functional_requirements"]:
                    summary["functional_requirements"][-1]["description"] = line.split(':**')[1].strip() if ':**' in line else line
            elif current_section == "functional" and line.startswith('- **Prioridade:**'):
                if summary["functional_requirements"]:
                    summary["functional_requirements"][-1]["priority"] = line.split(':**')[1].strip() if ':**' in line else line
                    
            # Requisitos não funcionais
            elif '## 3. Requisitos Não Funcionais' in line:
                current_section = "non_functional"
            elif current_section == "non_functional" and line.startswith('#### RNF-'):
                rnf = {"id": "", "title": "", "category": "", "metric": "", "target": ""}
                rnf["id"] = line.split(':')[0].strip()
                rnf["title"] = line.split(':')[1].strip().replace('[', '').replace(']', '')
                summary["non_functional_requirements"].append(rnf)
            elif current_section == "non_functional" and line.startswith('- **Categoria:**'):
                if summary["non_functional_requirements"]:
                    summary["non_functional_requirements"][-1]["category"] = line.split(':**')[1].strip() if ':**' in line else line
            elif current_section == "non_functional" and line.startswith('- **Métrica:**'):
                if summary["non_functional_requirements"]:
                    summary["non_functional_requirements"][-1]["metric"] = line.split(':**')[1].strip() if ':**' in line else line
            elif current_section == "non_functional" and line.startswith('- **Valor Alvo:**'):
                if summary["non_functional_requirements"]:
                    summary["non_functional_requirements"][-1]["target"] = line.split(':**')[1].strip() if ':**' in line else line
                    
            # Regras de negócio
            elif '## 4. Regras de Negócio' in line:
                current_section = "business_rules"
            elif current_section == "business_rules" and line.startswith('#### RN-'):
                rn = {"id": "", "title": "", "condition": "", "action": ""}
                rn["id"] = line.split(':')[0].strip()
                rn["title"] = line.split(':')[1].strip().replace('[', '').replace(']', '')
                summary["business_rules"].append(rn)
            elif current_section == "business_rules" and line.startswith('- **Condição:**'):
                if summary["business_rules"]:
                    summary["business_rules"][-1]["condition"] = line.split(':**')[1].strip() if ':**' in line else line
            elif current_section == "business_rules" and line.startswith('- **Ação:**'):
                if summary["business_rules"]:
                    summary["business_rules"][-1]["action"] = line.split(':**')[1].strip() if ':**' in line else line
                    
            # Restrições técnicas
            elif '## 5. Restrições Técnicas' in line:
                current_section = "technical_constraints"
            elif current_section == "technical_constraints" and line.startswith('- **Arquitetura:**'):
                summary["technical_constraints"].append({"type": "architecture", "value": line.split(':**')[1].strip() if ':**' in line else line})
            elif current_section == "technical_constraints" and line.startswith('- **Linguagens:**'):
                summary["technical_constraints"].append({"type": "languages", "value": line.split(':**')[1].strip() if ':**' in line else line})
            elif current_section == "technical_constraints" and line.startswith('- **Banco de Dados:**'):
                summary["technical_constraints"].append({"type": "database", "value": line.split(':**')[1].strip() if ':**' in line else line})
                    
            # Interfaces externas
            elif '## 6. Interfaces Externas' in line:
                current_section = "external_interfaces"
            elif current_section == "external_interfaces" and line.startswith('- **Sistema'):
                interface = {"system": "", "description": ""}
                parts = line.split(':', 1)
                if len(parts) > 1:
                    interface["system"] = parts[0].strip()
                    interface["description"] = parts[1].strip()
                    summary["external_interfaces"].append(interface)
                    
        return summary
        
    def generate_ux_context(self, requirements_summary, context_content):
        """Gera contexto para UX Design"""
        ux_context = f"""# CONTEXTO.md - {requirements_summary['project_name']}

## Status do Projeto
- **Fase Atual:** Fase 3 · UX Design
- **Especialista Atual:** UX Design
- **Status:** Em desenvolvimento
- **Data:** {datetime.now().strftime("%Y-%m-%d")}
- **Fase Anterior:** Engenharia de Requisitos ✅ Concluída

## Projeto
- **Nome:** {requirements_summary['project_name']}
- **Requisitos:** docs/02-requisitos/requisitos.md ✅ Validado
- **Status:** Pronto para design

## Resumo Executivo
**Requisitos Funcionais:** {len(requirements_summary['functional_requirements'])} mapeados
**Requisitos Não Funcionais:** {len(requirements_summary['non_functional_requirements'])} definidos
**Regras de Negócio:** {len(requirements_summary['business_rules'])} implementadas
**Restrições Técnicas:** {len(requirements_summary['technical_constraints'])} especificadas
**Interfaces Externas:** {len(requirements_summary['external_interfaces'])} integradas

## Requisitos Funcionais Principais
"""
        
        for i, rf in enumerate(requirements_summary['functional_requirements'][:5], 1):
            ux_context += f"""
### RF-{i}: {rf['title']}
- **Descrição:** {rf['description']}
- **Prioridade:** {rf['priority']}
- **ID:** {rf['id']}
"""
        
        ux_context += f"""
## Requisitos Não Funcionais Críticos
"""
        
        for i, rnf in enumerate(requirements_summary['non_functional_requirements'][:3], 1):
            ux_context += f"""
### RNF-{i}: {rnf['title']}
- **Categoria:** {rnf['category']}
- **Métrica:** {rnf['metric']}
- **Valor Alvo:** {rnf['target']}
- **ID:** {rnf['id']}
"""
        
        ux_context += f"""
## Regras de Negócio Importantes
"""
        
        for i, rn in enumerate(requirements_summary['business_rules'][:2], 1):
            ux_context += f"""
### RN-{i}: {rn['title']}
- **Condição:** {rn['condition']}
- **Ação:** {rn['action']}
- **ID:** {rn['id']}
"""
        
        ux_context += f"""
## Restrições Técnicas
"""
        
        for constraint in requirements_summary['technical_constraints']:
            ux_context += f"""
- **{constraint['type'].title()}:** {constraint['value']}
"""
        
        ux_context += f"""
## Interfaces Externas
"""
        
        for interface in requirements_summary['external_interfaces']:
            ux_context += f"""
- **{interface['system']}:** {interface['description']}
"""
        
        ux_context += f"""
## Próximos Passos
1. Criar wireframes baseados nos requisitos funcionais
2. Definir jornada do usuário considerando regras de negócio
3. Aplicar restrições técnicas no design
4. Considerar interfaces externas na experiência
5. Avançar para Modelagem de Domínio

## Histórico de Mudanças
- {datetime.now().strftime("%Y-%m-%d")}: Transição Engenharia de Requisitos → UX Design
- Requisitos validados e aprovados
- Contexto atualizado para próxima fase
"""
        
        return ux_context
        
    def create_ux_directory(self):
        """Cria diretório de UX Design"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def save_ux_context(self, context_content):
        """Salva contexto atualizado"""
        try:
            with open(self.context_path, 'w', encoding='utf-8') as f:
                f.write(context_content)
            print(f"✅ CONTEXTO.md atualizado para UX Design")
            return self.context_path
        except Exception as e:
            print(f"❌ Erro ao salvar contexto: {e}")
            return None
            
    def generate_ux_prompt(self, requirements_summary):
        """Gera prompt para especialista de UX Design"""
        prompt = f"""Atue como Especialista em UX Design.

## Contexto do Projeto
Você recebeu requisitos validados do especialista de Engenharia de Requisitos e precisa transformá-los em design de interface e experiência do usuário.

## Projeto: {requirements_summary['project_name']}

### Requisitos Funcionais Principais
"""
        
        for i, rf in enumerate(requirements_summary['functional_requirements'][:5], 1):
            prompt += f"""
**RF-{i}: {rf['title']}**
- Descrição: {rf['description']}
- Prioridade: {rf['priority']}
"""
        
        prompt += f"""
### Requisitos Não Funcionais Críticos
"""
        
        for i, rnf in enumerate(requirements_summary['non_functional_requirements'][:3], 1):
            prompt += f"""
**RNF-{i}: {rnf['title']}**
- Categoria: {rnf['category']}
- Métrica: {rnf['metric']}
- Valor Alvo: {rnf['target']}
"""
        
        prompt += f"""
### Regras de Negócio Importantes
"""
        
        for i, rn in enumerate(requirements_summary['business_rules'][:2], 1):
            prompt += f"""
**RN-{i}: {rn['title']}**
- Condição: {rn['condition']}
- Ação: {rn['action']}
"""
        
        prompt += f"""
### Restrições Técnicas
"""
        
        for constraint in requirements_summary['technical_constraints']:
            prompt += f"""
- {constraint['type'].title()}: {constraint['value']}
"""
        
        prompt += f"""
### Interfaces Externas
"""
        
        for interface in requirements_summary['external_interfaces']:
            prompt += f"""
- {interface['system']}: {interface['description']}
"""
        
        prompt += f"""
## Sua Missão
Transformar estes requisitos em design de interface e experiência do usuário seguindo o template em resources/templates/design-doc.md.

## Requisitos Obrigatórios
1. **Analisar os requisitos completos** em docs/02-requisitos/requisitos.md
2. **Criar wireframes** baseados nos requisitos funcionais
3. **Definir jornada do usuário** considerando regras de negócio
4. **Aplicar restrições técnicas** no design
5. **Considerar interfaces externas** na experiência
6. **Validar qualidade** usando resources/checklists/design-validation.md

## Processo
1. Leia os requisitos completos
2. Use o template de design
3. Crie wireframes e protótipos
4. Defina jornada do usuário
5. Execute validação automática
6. Apresente resultados para aprovação

## Quality Gates
- Wireframes devem cobrir todos os requisitos funcionais principais
- Jornada do usuário deve considerar todas as regras de negócio
- Design deve respeitar todas as restrições técnicas
- Interfaces externas devem ser integradas na experiência
- Score de validação ≥ 75 pontos

Comece analisando os requisitos e criando o design completo.
"""
        
        return prompt
        
    def save_ux_prompt(self, prompt_content):
        """Salva prompt para próximo especialista"""
        prompt_path = self.output_dir / "next-specialist-prompt.md"
        
        try:
            with open(prompt_path, 'w', encoding='utf-8') as f:
                f.write(prompt_content)
            print(f"✅ Prompt para UX Design salvo em: {prompt_path}")
            return prompt_path
        except Exception as e:
            print(f"❌ Erro ao salvar prompt: {e}")
            return None
            
    def generate_transition_summary(self, requirements_summary):
        """Gera resumo da transição de fase"""
        summary = {
            "transition_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "from_phase": "Engenharia de Requisitos",
            "to_phase": "UX Design",
            "project": requirements_summary["project_name"],
            "requirements_status": "Validado e Aprovado",
            "functional_requirements_count": len(requirements_summary["functional_requirements"]),
            "non_functional_requirements_count": len(requirements_summary["non_functional_requirements"]),
            "business_rules_count": len(requirements_summary["business_rules"]),
            "technical_constraints_count": len(requirements_summary["technical_constraints"]),
            "external_interfaces_count": len(requirements_summary["external_interfaces"]),
            "next_steps": [
                "Criar wireframes baseados nos requisitos",
                "Definir jornada do usuário",
                "Aplicar restrições técnicas no design",
                "Considerar interfaces externas",
                "Avançar para Modelagem de Domínio"
            ]
        }
        
        return summary
        
    def save_transition_summary(self, summary):
        """Salva resumo da transição"""
        summary_path = self.output_dir / "transition-summary.json"
        
        try:
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            print(f"✅ Resumo da transição salvo em: {summary_path}")
            return summary_path
        except Exception as e:
            print(f"❌ Erro ao salvar resumo: {e}")
            return None
            
    def run_processing(self):
        """Executa processamento completo"""
        print("🔄 Processando requisitos para próxima fase...")
        
        # Carrega conteúdos
        requirements_content = self.load_requirements()
        context_content = self.load_context()
        
        # Extrai resumo dos requisitos
        requirements_summary = self.extract_requirements_summary(requirements_content)
        
        print(f"📋 Projeto: {requirements_summary['project_name']}")
        print(f"📋 Requisitos Funcionais: {len(requirements_summary['functional_requirements'])}")
        print(f"📋 Requisitos Não Funcionais: {len(requirements_summary['non_functional_requirements'])}")
        print(f"📋 Regras de Negócio: {len(requirements_summary['business_rules'])}")
        print(f"📋 Restrições Técnicas: {len(requirements_summary['technical_constraints'])}")
        print(f"📋 Interfaces Externas: {len(requirements_summary['external_interfaces'])}")
        
        # Cria diretórios
        self.create_ux_directory()
        
        # Gera contexto para UX Design
        ux_context = self.generate_ux_context(requirements_summary, context_content)
        self.save_ux_context(ux_context)
        
        # Gera prompt para próximo especialista
        prompt_content = self.generate_ux_prompt(requirements_summary)
        self.save_ux_prompt(prompt_content)
        
        # Gera resumo da transição
        transition_summary = self.generate_transition_summary(requirements_summary)
        self.save_transition_summary(transition_summary)
        
        print("\n🎉 REQUISITOS PROCESSADOS COM SUCESSO!")
        print("✅ Pronto para avançar para UX Design")
        print("\n📝 Arquivos gerados:")
        print(f"   - CONTEXTO.md atualizado")
        print(f"   - docs/03-ux-design/next-specialist-prompt.md")
        print(f"   - docs/03-ux-design/transition-summary.json")
        
        return True

def main():
    parser = argparse.ArgumentParser(description="Processador de Requisitos - Maestro Skills")
    parser.add_argument("--base-dir", help="Diretório base do projeto")
    parser.add_argument("--requirements-path", help="Caminho customizado dos requisitos")
    
    args = parser.parse_args()
    
    processor = RequirementsProcessor(args.base_dir)
    
    if args.requirements_path:
        processor.requirements_path = Path(args.requirements_path)
    
    # Executa processamento
    if processor.run_processing():
        print("\n🚀 PRONTO PARA PRÓXIMA FASE!")
        sys.exit(0)
    else:
        print("\n❌ Falha no processamento dos requisitos")
        sys.exit(1)

if __name__ == "__main__":
    main()