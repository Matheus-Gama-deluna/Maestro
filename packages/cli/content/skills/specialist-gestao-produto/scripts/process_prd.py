#!/usr/bin/env python3
"""
Script de Processamento de PRD - Maestro Skills
Processa PRD para próxima fase e gera contexto para Engenharia de Requisitos
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
import json

class PRDProcessor:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.prd_path = self.base_dir / "docs" / "01-produto" / "PRD.md"
        self.context_path = self.base_dir / "docs" / "CONTEXTO.md"
        self.output_dir = self.base_dir / "docs" / "02-requisitos"
        
    def load_prd(self):
        """Carrega conteúdo do PRD"""
        try:
            with open(self.prd_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ PRD não encontrado: {self.prd_path}")
            sys.exit(1)
            
    def load_context(self):
        """Carrega contexto atual do projeto"""
        try:
            with open(self.context_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ CONTEXTO.md não encontrado: {self.context_path}")
            sys.exit(1)
            
    def extract_prd_summary(self, prd_content):
        """Extrai resumo estruturado do PRD"""
        summary = {
            "product_name": "",
            "problem": "",
            "solution": "",
            "personas": [],
            "mvp_features": [],
            "north_star": "",
            "metrics": [],
            "risks": [],
            "timeline": ""
        }
        
        lines = prd_content.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            # Nome do produto
            if line.startswith('# ') and not summary["product_name"]:
                summary["product_name"] = line.replace('# ', '').strip()
                
            # Problema
            elif '## 1. Problema e Oportunidade' in line:
                current_section = "problem"
            elif current_section == "problem" and line.startswith('- **Problema claro'):
                summary["problem"] = line.split(':**')[1].strip() if ':**' in line else line
                
            # Solução
            elif '## Sumário Executivo' in line:
                current_section = "executive"
            elif current_section == "executive" and line.startswith('- **Solução proposta:'):
                summary["solution"] = line.split(':**')[1].strip() if ':**' in line else line
                
            # Personas
            elif '## 2. Personas e Jobs to Be Done' in line:
                current_section = "personas"
            elif current_section == "personas" and line.startswith('### 2.1 Persona Principal'):
                # Extrai informações da persona principal
                persona = {"name": "", "profile": "", "jobs": []}
                current_persona = persona
                summary["personas"].append(persona)
            elif current_section == "personas" and line.startswith('- **Nome:'):
                if current_persona:
                    current_persona["name"] = line.split(':**')[1].strip() if ':**' in line else line
                    
            # MVP
            elif '## 4. MVP e Funcionalidades' in line:
                current_section = "mvp"
            elif current_section == "mvp" and line.startswith('- **Funcionalidade'):
                feature = line.split(':**')[1].strip() if ':**' in line else line
                summary["mvp_features"].append(feature)
                
            # North Star
            elif '## 5. Métricas de Sucesso' in line:
                current_section = "metrics"
            elif current_section == "metrics" and line.startswith('- **North Star definida:'):
                summary["north_star"] = line.split(':**')[1].strip() if ':**' in line else line
            elif current_section == "metrics" and line.startswith('- **KPI'):
                metric = line.split(':**')[1].strip() if ':**' in line else line
                summary["metrics"].append(metric)
                
            # Riscos
            elif '## 6. Riscos e Mitigações' in line:
                current_section = "risks"
            elif current_section == "risks" and line.startswith('- **Risco'):
                risk = line.split(':**')[1].strip() if ':**' in line else line
                summary["risks"].append(risk)
                
            # Timeline
            elif '## 7. Timeline e Marcos' in line:
                current_section = "timeline"
            elif current_section == "timeline" and line.startswith('- **Semana'):
                if not summary["timeline"]:
                    summary["timeline"] = line
                else:
                    summary["timeline"] += f"\n{line}"
                    
        return summary
        
    def generate_requirements_context(self, prd_summary, context_content):
        """Gera contexto para Engenharia de Requisitos"""
        requirements_context = f"""# CONTEXTO.md - {prd_summary['product_name']}

## Status do Projeto
- **Fase Atual:** Fase 2 · Engenharia de Requisitos
- **Especialista Atual:** Engenharia de Requisitos
- **Status:** Em desenvolvimento
- **Data:** {datetime.now().strftime("%Y-%m-%d")}
- **Fase Anterior:** Gestão de Produto ✅ Concluída

## Produto
- **Nome:** {prd_summary['product_name']}
- **PRD:** docs/01-produto/PRD.md ✅ Validado
- **Status:** Pronto para engenharia de requisitos

## Resumo Executivo
**Problema:** {prd_summary['problem']}

**Solução:** {prd_summary['solution']}

**North Star Metric:** {prd_summary['north_star']}

## Personas Identificadas
"""
        
        for i, persona in enumerate(prd_summary['personas'], 1):
            requirements_context += f"""
### Persona {i}: {persona['name']}
{persona.get('profile', 'Perfil não detalhado')}
"""
        
        requirements_context += f"""
## MVP - Funcionalidades Priorizadas
"""
        
        for i, feature in enumerate(prd_summary['mvp_features'], 1):
            requirements_context += f"{i}. {feature}\n"
            
        requirements_context += f"""
## Métricas de Sucesso
- **North Star:** {prd_summary['north_star']}
"""
        
        for metric in prd_summary['metrics']:
            requirements_context += f"- {metric}\n"
            
        requirements_context += f"""
## Riscos Identificados
"""
        
        for risk in prd_summary['risks']:
            requirements_context += f"- {risk}\n"
            
        requirements_context += f"""
## Timeline do MVP
{prd_summary['timeline']}

## Próximos Passos
1. Detalhar requisitos funcionais e não funcionais
2. Criar matriz de rastreabilidade
3. Definir critérios de aceite
4. Especificar casos de teste
5. Avançar para UX Design

## Histórico de Mudanças
- {datetime.now().strftime("%Y-%m-%d")}: Transição Gestão de Produto → Engenharia de Requisitos
- PRD validado e aprovado
- Contexto atualizado para próxima fase
"""
        
        return requirements_context
        
    def create_requirements_directory(self):
        """Cria diretório de requisitos"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def save_requirements_context(self, context_content):
        """Salva contexto atualizado"""
        try:
            with open(self.context_path, 'w', encoding='utf-8') as f:
                f.write(context_content)
            print(f"✅ CONTEXTO.md atualizado para Engenharia de Requisitos")
            return self.context_path
        except Exception as e:
            print(f"❌ Erro ao salvar contexto: {e}")
            return None
            
    def generate_requirements_prompt(self, prd_summary):
        """Gera prompt para especialista de Engenharia de Requisitos"""
        prompt = f"""Atue como Engenheiro de Requisitos especialista.

## Contexto do Projeto
Você recebeu um PRD validado do especialista de Gestão de Produto e precisa transformá-lo em requisitos claros e testáveis.

## Produto: {prd_summary['product_name']}

### Problema a Resolver
{prd_summary['problem']}

### Solução Proposta
{prd_summary['solution']}

### Personas Principais
"""
        
        for i, persona in enumerate(prd_summary['personas'], 1):
            prompt += f"""
**Persona {i}: {persona['name']}**
{persona.get('profile', 'Perfil não detalhado')}
"""
        
        prompt += f"""
### MVP - Funcionalidades Priorizadas
"""
        
        for i, feature in enumerate(prd_summary['mvp_features'], 1):
            prompt += f"{i}. {feature}\n"
            
        prompt += f"""
### North Star Metric
{prd_summary['north_star']}

### Métricas Secundárias
"""
        
        for metric in prd_summary['metrics']:
            prompt += f"- {metric}\n"
            
        prompt += f"""
## Sua Missão
Transforme esta visão em requisitos detalhados seguindo o template em resources/templates/requisitos.md.

## Requisitos Obrigatórios
1. **Analisar o PRD completo** em docs/01-produto/PRD.md
2. **Mapear todos os requisitos** funcionais e não funcionais
3. **Criar matriz de rastreabilidade** com o PRD
4. **Definir critérios de aceite** para cada requisito
5. **Especificar casos de teste** para validação
6. **Validar qualidade** usando resources/checklists/requirements-validation.md

## Processo
1. Leia o PRD completo
2. Use o template de requisitos
3. Preencha todos os campos obrigatórios
4. Execute validação automática
5. Apresente resultados para aprovação

## Quality Gates
- Todos os requisitos devem ser SMART
- Matriz de rastreabilidade 100% completa
- Critérios de aceite testáveis
- Score de validação ≥ 75 pontos

Comece analisando o PRD e gerando os requisitos detalhados.
"""
        
        return prompt
        
    def save_requirements_prompt(self, prompt_content):
        """Salva prompt para próximo especialista"""
        prompt_path = self.output_dir / "next-specialist-prompt.md"
        
        try:
            with open(prompt_path, 'w', encoding='utf-8') as f:
                f.write(prompt_content)
            print(f"✅ Prompt para Engenharia de Requisitos salvo em: {prompt_path}")
            return prompt_path
        except Exception as e:
            print(f"❌ Erro ao salvar prompt: {e}")
            return None
            
    def generate_transition_summary(self, prd_summary):
        """Gera resumo da transição de fase"""
        summary = {
            "transition_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "from_phase": "Gestão de Produto",
            "to_phase": "Engenharia de Requisitos",
            "product": prd_summary["product_name"],
            "prd_status": "Validado e Aprovado",
            "mvp_features_count": len(prd_summary["mvp_features"]),
            "personas_count": len(prd_summary["personas"]),
            "north_star": prd_summary["north_star"],
            "next_steps": [
                "Detalhar requisitos funcionais",
                "Criar matriz de rastreabilidade",
                "Definir critérios de aceite",
                "Especificar casos de teste"
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
        """Executa processamento completo do PRD"""
        print("🔄 Processando PRD para próxima fase...")
        
        # Carrega conteúdos
        prd_content = self.load_prd()
        context_content = self.load_context()
        
        # Extrai resumo do PRD
        prd_summary = self.extract_prd_summary(prd_content)
        
        print(f"📋 Produto: {prd_summary['product_name']}")
        print(f"👥 Personas: {len(prd_summary['personas'])}")
        print(f"⚡ Funcionalidades MVP: {len(prd_summary['mvp_features'])}")
        print(f"🎯 North Star: {prd_summary['north_star']}")
        
        # Cria diretórios
        self.create_requirements_directory()
        
        # Gera contexto para requisitos
        requirements_context = self.generate_requirements_context(prd_summary, context_content)
        self.save_requirements_context(requirements_context)
        
        # Gera prompt para próximo especialista
        prompt_content = self.generate_requirements_prompt(prd_summary)
        self.save_requirements_prompt(prompt_content)
        
        # Gera resumo da transição
        transition_summary = self.generate_transition_summary(prd_summary)
        self.save_transition_summary(transition_summary)
        
        print("\n🎉 PRD PROCESSADO COM SUCESSO!")
        print("✅ Pronto para avançar para Engenharia de Requisitos")
        print("\n📝 Arquivos gerados:")
        print(f"   - CONTEXTO.md atualizado")
        print(f"   - docs/02-requisitos/next-specialist-prompt.md")
        print(f"   - docs/02-requisitos/transition-summary.json")
        
        return True

def main():
    parser = argparse.ArgumentParser(description="Processador de PRD - Maestro Skills")
    parser.add_argument("--base-dir", help="Diretório base do projeto")
    parser.add_argument("--prd-path", help="Caminho customizado do PRD")
    
    args = parser.parse_args()
    
    processor = PRDProcessor(args.base_dir)
    
    if args.prd_path:
        processor.prd_path = Path(args.prd_path)
    
    # Executa processamento
    if processor.run_processing():
        print("\n🚀 PRONTO PARA PRÓXIMA FASE!")
        sys.exit(0)
    else:
        print("\n❌ Falha no processamento do PRD")
        sys.exit(1)

if __name__ == "__main__":
    main()