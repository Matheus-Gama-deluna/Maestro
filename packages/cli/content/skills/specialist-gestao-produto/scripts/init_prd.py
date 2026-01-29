#!/usr/bin/env python3
"""
Script de Inicialização de PRD - Maestro Skills
Gera estrutura inicial de PRD baseada no template padrão
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

class PRDInitializer:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.template_path = self.base_dir / "resources" / "templates" / "PRD.md"
        self.output_dir = self.base_dir / "docs" / "01-produto"
        
    def create_output_directory(self):
        """Cria diretório de saída se não existir"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def load_template(self):
        """Carrega template PRD.md"""
        try:
            with open(self.template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"❌ Template não encontrado: {self.template_path}")
            sys.exit(1)
            
    def generate_prd(self, product_name, description=None):
        """Gera PRD inicial baseado no template"""
        template = self.load_template()
        
        # Substitui placeholders básicos
        prd_content = template.replace("[Nome do Produto]", product_name)
        
        if description:
            prd_content = prd_content.replace(
                "[Descrição clara e concisa do problema]",
                description
            )
            
        # Adiciona metadados
        current_date = datetime.now().strftime("%Y-%m-%d")
        prd_content = prd_content.replace("[Data atual]", current_date)
        
        return prd_content
        
    def save_prd(self, product_name, content):
        """Salva PRD gerado"""
        output_path = self.output_dir / "PRD.md"
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ PRD salvo em: {output_path}")
            return output_path
        except Exception as e:
            print(f"❌ Erro ao salvar PRD: {e}")
            sys.exit(1)
            
    def create_context_file(self, product_name):
        """Cria arquivo CONTEXTO.md do projeto"""
        context_content = f"""# CONTEXTO.md - {product_name}

## Status do Projeto
- **Fase Atual:** Fase 1 · Produto
- **Especialista Atual:** Gestão de Produto
- **Status:** Em desenvolvimento
- **Data:** {datetime.now().strftime("%Y-%m-%d")}

## Produto
- **Nome:** {product_name}
- **PRD:** docs/01-produto/PRD.md
- **Status:** Em elaboração

## Próximos Passos
1. Completar PRD com validação
2. Avançar para Engenharia de Requisitos
3. Iniciar desenvolvimento do MVP

## Histórico de Mudanças
- {datetime.now().strftime("%Y-%m-%d")}: Início do projeto - Gestão de Produto
"""
        
        context_path = self.base_dir / "docs" / "CONTEXTO.md"
        try:
            with open(context_path, 'w', encoding='utf-8') as f:
                f.write(context_content)
            print(f"✅ CONTEXTO.md criado em: {context_path}")
            return context_path
        except Exception as e:
            print(f"❌ Erro ao criar CONTEXTO.md: {e}")
            return None
            
    def validate_prd_structure(self, prd_path):
        """Valida estrutura básica do PRD gerado"""
        try:
            with open(prd_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Verifica seções obrigatórias
            required_sections = [
                "# Sumário Executivo",
                "## 1. Problema e Oportunidade",
                "## 2. Personas e Jobs to Be Done",
                "## 3. Visão e Estratégia",
                "## 4. MVP e Funcionalidades",
                "## 5. Métricas de Sucesso",
                "## 6. Riscos e Mitigações"
            ]
            
            missing_sections = []
            for section in required_sections:
                if section not in content:
                    missing_sections.append(section)
                    
            if missing_sections:
                print(f"⚠️  Seções faltando: {', '.join(missing_sections)}")
                return False
                
            print("✅ Estrutura do PRD validada com sucesso")
            return True
            
        except Exception as e:
            print(f"❌ Erro na validação: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description="Inicializador de PRD - Maestro Skills")
    parser.add_argument("product_name", help="Nome do produto")
    parser.add_argument("--description", help="Descrição breve do problema")
    parser.add_argument("--base-dir", help="Diretório base do projeto")
    parser.add_argument("--output", help="Diretório de saída customizado")
    
    args = parser.parse_args()
    
    print(f"🚀 Inicializando PRD para: {args.product_name}")
    
    # Inicializa gerador
    initializer = PRDInitializer(args.base_dir)
    
    # Cria diretórios
    initializer.create_output_directory()
    
    # Gera PRD
    prd_content = initializer.generate_prd(args.product_name, args.description)
    
    # Salva PRD
    prd_path = initializer.save_prd(args.product_name, prd_content)
    
    # Cria contexto
    initializer.create_context_file(args.product_name)
    
    # Valida estrutura
    if initializer.validate_prd_structure(prd_path):
        print("🎉 PRD inicializado com sucesso!")
        print(f"📝 Próximos passos:")
        print(f"   1. Edite o PRD: {prd_path}")
        print(f"   2. Preencha os campos [ ]")
        print(f"   3. Execute validação: python validate_prd.py")
        print(f"   4. Avance para próxima fase quando pronto")
    else:
        print("❌ Falha na validação do PRD")
        sys.exit(1)

if __name__ == "__main__":
    main()