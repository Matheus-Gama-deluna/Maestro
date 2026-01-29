#!/usr/bin/env python3
"""
Script de Inicialização de Requisitos - Maestro Skills
Gera estrutura inicial de requisitos baseada no template padrão
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

class RequirementsInitializer:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.template_path = self.base_dir / "resources" / "templates" / "requisitos.md"
        self.output_dir = self.base_dir / "docs" / "02-requisitos"
        
    def create_output_directory(self):
        """Cria diretório de saída se não existir"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_requirements(self, project_name, description=""):
        """Gera conteúdo do documento de requisitos"""
        try:
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_content = f.read()
        except FileNotFoundError:
            print(f"❌ Template não encontrado: {self.template_path}")
            sys.exit(1)
            
        # Substitui placeholders
        content = template_content.replace("[Nome do Projeto]", project_name)
        content = content.replace("[Descrição do Projeto]", description)
        content = content.replace("[Data de criação]", datetime.now().strftime("%Y-%m-%d"))
        content = content.replace("[Data atual]", datetime.now().strftime("%Y-%m-%d"))
        
        return content
        
    def save_requirements(self, project_name, content):
        """Salva o documento de requisitos"""
        requirements_path = self.output_dir / "requisitos.md"
        
        try:
            with open(requirements_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return requirements_path
        except Exception as e:
            print(f"❌ Erro ao salvar requisitos: {e}")
            sys.exit(1)
            
    def create_context_file(self, project_name):
        """Cria arquivo de contexto para o projeto"""
        context_path = self.output_dir / "CONTEXTO.md"
        
        context_content = f"""# CONTEXTO.md - {project_name}

## Status do Projeto
- **Fase Atual:** Fase 2 · Engenharia de Requisitos
- **Especialista Atual:** Engenharia de Requisitos
- **Status:** Em desenvolvimento
- **Data:** {datetime.now().strftime("%Y-%m-%d")}
- **Fase Anterior:** Gestão de Produto ✅ Concluída

## Projeto
- **Nome:** {project_name}
- **Requisitos:** docs/02-requisitos/requisitos.md ✅ Em desenvolvimento
- **Status:** Em elaboração

## Próximos Passos
1. Analisar PRD do especialista anterior
2. Mapear requisitos funcionais e não funcionais
3. Definir critérios de aceite
4. Criar matriz de rastreabilidade
5. Avançar para UX Design

## Histórico de Mudanças
- {datetime.now().strftime("%Y-%m-%d")}: Início da fase de Engenharia de Requisitos
- PRD recebido e validado do especialista de Gestão de Produto
- Estrutura inicial de requisitos criada
"""
        
        try:
            with open(context_path, 'w', encoding='utf-8') as f:
                f.write(context_content)
            return context_path
        except Exception as e:
            print(f"❌ Erro ao criar contexto: {e}")
            sys.exit(1)
            
    def validate_structure(self):
        """Valida estrutura básica do projeto"""
        required_files = [
            self.template_path,
            self.base_dir / "resources" / "templates" / "criterios-aceite.md",
            self.base_dir / "resources" / "templates" / "matriz-rastreabilidade.md",
            self.base_dir / "resources" / "examples" / "requirements-examples.md",
            self.base_dir / "resources" / "checklists" / "requirements-validation.md",
            self.base_dir / "resources" / "reference" / "requirements-guide.md"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not file_path.exists():
                missing_files.append(str(file_path))
                
        if missing_files:
            print(f"❌ Arquivos obrigatórios não encontrados:")
            for file_path in missing_files:
                print(f"   - {file_path}")
            return False
            
        return True

def main():
    parser = argparse.ArgumentParser(description="Inicializador de Requisitos - Maestro Skills")
    parser.add_argument("project_name", help="Nome do projeto")
    parser.add_argument("--description", help="Descrição do projeto", default="")
    parser.add_argument("--base-dir", help="Diretório base do projeto")
    
    args = parser.parse_args()
    
    initializer = RequirementsInitializer(args.base_dir)
    
    # Valida estrutura
    if not initializer.validate_structure():
        print("❌ Estrutura inválida. Verifique os arquivos obrigatórios.")
        sys.exit(1)
    
    # Cria diretórios
    initializer.create_output_directory()
    
    # Gera conteúdo
    content = initializer.generate_requirements(args.project_name, args.description)
    
    # Salva arquivos
    requirements_path = initializer.save_requirements(args.project_name, content)
    context_path = initializer.create_context_file(args.project_name)
    
    print(f"✅ Estrutura de requisitos criada com sucesso!")
    print(f"📄 Requisitos: {requirements_path}")
    print(f"📄 Contexto: {context_path}")
    print(f"📁 Diretório: {initializer.output_dir}")
    
    print(f"\n🚀 Próximos passos:")
    print(f"1. Analise o PRD em docs/01-produto/PRD.md")
    print(f"2. Preencha os requisitos usando o template")
    print(f"3. Execute validação: python validate_requirements.py")
    print(f"4. Avance para UX Design quando aprovado")

if __name__ == "__main__":
    main()