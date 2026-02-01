#!/usr/bin/env python3
"""
Referência MCP: Inicialização de Estrutura de Documentação

Esta função cria a estrutura base de documentação para um projeto
baseado no tipo, tier e público-alvo especificados.

NOTA: Este é um arquivo de referência. A execução real deve ser
implementada no servidor MCP externo.
"""

from typing import Dict, List, Optional
from pathlib import Path
import json
from datetime import datetime

class DocumentationInitializer:
    """Inicializador de estrutura de documentação"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.docs_path = self.project_path / "docs"
        
    def create_structure(self, config: Dict) -> Dict:
        """
        Cria estrutura de documentação baseada na configuração
        
        Args:
            config: Dicionário com configuração do projeto
                - project_type: web|api|mobile|library
                - tier: 1|2|3 (nível de documentação)
                - audience: developers|users|both
                - name: Nome do projeto
                - description: Descrição do projeto
                
        Returns:
            Dict com estrutura criada e próximos passos
        """
        
        project_type = config.get("project_type", "web")
        tier = int(config.get("tier", "1"))
        audience = config.get("audience", "developers")
        project_name = config.get("name", "My Project")
        description = config.get("description", "Project description")
        
        # Criar diretórios base
        directories = self._create_directories(tier)
        
        # Criar arquivos base
        files = self._create_base_files(
            project_name, 
            description, 
            project_type, 
            tier, 
            audience
        )
        
        # Criar templates específicos
        templates = self._create_templates(project_type, tier)
        
        # Gerar relatório
        report = {
            "status": "success",
            "project": {
                "name": project_name,
                "type": project_type,
                "tier": tier,
                "audience": audience
            },
            "created": {
                "directories": directories,
                "files": files,
                "templates": templates
            },
            "next_steps": self._get_next_steps(project_type, tier),
            "quality_score": self._calculate_initial_score(tier),
            "created_at": datetime.now().isoformat()
        }
        
        return report
    
    def _create_directories(self, tier: int) -> List[str]:
        """Cria estrutura de diretórios baseada no tier"""
        
        # Base para todos os tiers
        base_dirs = ["docs"]
        
        if tier >= 1:
            base_dirs.extend([
                "docs/api",
                "docs/guides"
            ])
        
        if tier >= 2:
            base_dirs.extend([
                "docs/adr",
                "docs/architecture",
                "docs/tutorials"
            ])
        
        if tier >= 3:
            base_dirs.extend([
                "docs/videos",
                "docs/faq",
                "docs/roadmap"
            ])
        
        # Simular criação dos diretórios
        created_dirs = []
        for dir_path in base_dirs:
            full_path = self.project_path / dir_path
            # full_path.mkdir(parents=True, exist_ok=True)  # MCP implementation
            created_dirs.append(str(full_path))
        
        return created_dirs
    
    def _create_base_files(self, name: str, description: str, 
                          project_type: str, tier: int, audience: str) -> List[Dict]:
        """Cria arquivos base de documentação"""
        
        files = []
        
        # README.md (sempre criado)
        readme_content = self._generate_readme(name, description, project_type, tier)
        files.append({
            "path": "README.md",
            "content": readme_content,
            "type": "readme"
        })
        
        # .env.example (se aplicável)
        if project_type in ["web", "api"]:
            env_content = self._generate_env_example(project_type)
            files.append({
                "path": ".env.example",
                "content": env_content,
                "type": "env"
            })
        
        # Contributing.md (tier 2+)
        if tier >= 2:
            contributing_content = self._generate_contributing()
            files.append({
                "path": "CONTRIBUTING.md",
                "content": contributing_content,
                "type": "contributing"
            })
        
        # CHANGELOG.md (tier 2+)
        if tier >= 2:
            changelog_content = self._generate_changelog()
            files.append({
                "path": "CHANGELOG.md",
                "content": changelog_content,
                "type": "changelog"
            })
        
        return files
    
    def _create_templates(self, project_type: str, tier: int) -> List[Dict]:
        """Cria templates específicos do projeto"""
        
        templates = []
        
        # API Documentation (se for API ou web)
        if project_type in ["api", "web"]:
            api_template = self._generate_api_template()
            templates.append({
                "path": "docs/api/README.md",
                "content": api_template,
                "type": "api_docs"
            })
        
        # Architecture docs (tier 2+)
        if tier >= 2:
            adr_template = self._generate_adr_template()
            templates.append({
                "path": "docs/adr/README.md",
                "content": adr_template,
                "type": "adr_template"
            })
            
            arch_template = self._generate_architecture_template()
            templates.append({
                "path": "docs/architecture/overview.md",
                "content": arch_template,
                "type": "architecture"
            })
        
        # User guides (tier 3+)
        if tier >= 3:
            user_guide = self._generate_user_guide()
            templates.append({
                "path": "docs/guides/user-guide.md",
                "content": user_guide,
                "type": "user_guide"
            })
        
        return templates
    
    def _generate_readme(self, name: str, description: str, 
                         project_type: str, tier: int) -> str:
        """Gera conteúdo do README.md"""
        
        badges = self._get_project_badges(project_type)
        getting_started = self._get_getting_started(project_type)
        structure = self._get_project_structure(project_type)
        
        return f"""# 🚀 {name}

> {description}

{badges}

## 🎯 Sobre

{description}

## ✨ Features

- **Feature Principal:** Descrição do benefício principal
- **Feature Secundária:** Outro benefício importante
- **Performance:** Otimizações implementadas
- **Segurança:** Medidas de segurança adotadas

## 🛠️ Stack Tecnológica

{self._get_stack_description(project_type)}

## 🚀 Getting Started

### Pré-requisitos
{self._get_prerequisites(project_type)}

### Instalação
{getting_started}

### Acesso
{self._get_access_info(project_type)}

## 📁 Estrutura do Projeto

{structure}

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm test             # Executar testes
npm run lint         # Análise de código
```

## 📚 Documentação

- **API Documentation:** [docs/api/README.md](docs/api/README.md)
{self._get_additional_docs_links(tier)}

## 📝 Contribuição

{self._get_contributing_info(tier)}

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Última atualização:** {datetime.now().strftime('%d/%m/%Y')}
"""
    
    def _generate_env_example(self, project_type: str) -> str:
        """Gera .env.example baseado no tipo de projeto"""
        
        base_vars = """
# Environment
NODE_ENV="development"
PORT=3000
"""
        
        if project_type == "api":
            return f"""{base_vars}
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# API Configuration
API_BASE_URL="http://localhost:3000"
API_VERSION="v1"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External Services
REDIS_URL="redis://localhost:6379"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
"""
        
        elif project_type == "web":
            return f"""{base_vars}
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_NAME="My App"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# External Services
REDIS_URL="redis://localhost:6379"
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
"""
        
        return base_vars
    
    def _generate_api_template(self) -> str:
        """Gera template de documentação de API"""
        return """# 📡 API Documentation

## 🔐 Autenticação

### Bearer Token (JWT)
```bash
curl -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
     https://api.example.com/v1/users
```

### Obtenção de Token
```bash
curl -X POST \\
     -H "Content-Type: application/json" \\
     -d '{"email":"user@example.com","password":"password"}' \\
     https://api.example.com/v1/auth/login
```

## 📊 Resumo da API

| Recurso | Método | Endpoint | Descrição |
|--------|--------|----------|-----------|
| Users | GET | `/users` | Lista usuários |
| Users | POST | `/users` | Cria usuário |
| Users | GET | `/users/:id` | Detalhes do usuário |
| Users | PUT | `/users/:id` | Atualiza usuário |
| Users | DELETE | `/users/:id` | Remove usuário |

## 📋 Endpoints

### GET /users
Lista usuários com paginação e filtros.

#### Query Parameters
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| page | number | 1 | Número da página |
| limit | number | 20 | Items por página |
| search | string | - | Busca por nome ou email |

#### Response 200
```json
{
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 100,
    "total_pages": 5
  }
}
```

## ⚠️ Error Handling

### Formato de Erro
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro",
    "details": {
      "field": "Detalhe específico"
    }
  }
}
```

### Códigos de Erro
| Código | HTTP | Descrição |
|--------|------|-----------|
| VALIDATION_ERROR | 400 | Erro de validação |
| UNAUTHORIZED | 401 | Não autorizado |
| NOT_FOUND | 404 | Recurso não encontrado |
| RATE_LIMIT_EXCEEDED | 429 | Limite excedido |

## 🧪 Exemplos

### JavaScript/Node.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Listar usuários
const users = await api.get('/users');
console.log(users.data);
```

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}
response = requests.get('https://api.example.com/v1/users', headers=headers)
users = response.json()
```
"""
    
    def _generate_adr_template(self) -> str:
        """Gera template de ADR"""
        return """# Architecture Decision Records

Esta pasta contém Architecture Decision Records (ADRs) que documentam decisões arquiteturais importantes do projeto.

## O que é um ADR?

Um ADR é um documento que captura uma decisão arquitetural importante, incluindo:
- Contexto e problema
- Decisão tomada
- Razões e justificativas
- Consequências
- Alternativas consideradas

## Template de ADR

```markdown
# ADR-XXX: [Título Curto e Descritivo]

## Status
[Accepted | Rejected | Proposed | Deprecated]

## Contexto
[Descrição do problema ou situação]

## Decisão
[Decisão tomada]

## Razões
[Justificativas para a decisão]

## Consequências
[Impactos positivos e negativos]

## Alternativas Consideradas
[Outras opções avaliadas]

## Data
[Data da decisão]
```

## ADRs Existentes

- [ADR-001: Escolha de Stack Tecnológica](001-stack-choice.md)
- [ADR-002: Estratégia de Autenticação](002-auth-strategy.md)

## Como Criar um Novo ADR

1. Copie o template acima
2. Use o próximo número sequencial
3. Preencha todas as seções
4. Adicione à lista acima
5. Faça commit e pull request
"""
    
    def _get_project_badges(self, project_type: str) -> str:
        """Retorna badges apropriados para o tipo de projeto"""
        return """[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/user/repo/actions)"""
    
    def _get_stack_description(self, project_type: str) -> str:
        """Retorna descrição da stack baseada no tipo"""
        stacks = {
            "web": """### Frontend
- **Framework:** Next.js 14
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS

### Backend
- **Framework:** Node.js + Express
- **Banco de Dados:** PostgreSQL + Prisma
- **Autenticação:** JWT""",
            
            "api": """### Backend
- **Framework:** Node.js + Express
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL + Prisma
- **API:** REST com OpenAPI 3.0""",
            
            "mobile": """### Mobile
- **Framework:** React Native
- **Linguagem:** TypeScript
- **Estado:** Redux Toolkit
- **Navegação:** React Navigation""",
            
            "library": """### Library
- **Linguagem:** TypeScript
- **Build:** Rollup
- **Testes:** Jest
- **Publicação:** npm"""
        }
        
        return stacks.get(project_type, stacks["web"])
    
    def _get_prerequisites(self, project_type: str) -> str:
        """Retorna pré-requisitos baseados no tipo"""
        base = "- **Node.js** 18+ ou superior\n- **npm** ou **yarn**"
        
        if project_type in ["web", "api"]:
            base += "\n- **PostgreSQL** (banco de dados)\n- **Redis** (cache, opcional)"
        
        return base
    
    def _get_getting_started(self, project_type: str) -> str:
        """Retorna instruções de getting started"""
        return """```bash
# Clone o repositório
git clone https://github.com/user/repo.git
cd repo

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute migrações (se aplicável)
npm run migrate

# Inicie o desenvolvimento
npm run dev
```"""
    
    def _get_access_info(self, project_type: str) -> str:
        """Retorna informações de acesso"""
        if project_type == "web":
            return """- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api
- **Documentação:** http://localhost:3000/docs"""
        
        elif project_type == "api":
            return """- **API:** http://localhost:3000
- **Documentação:** http://localhost:3000/docs
- **Playground:** http://localhost:3000/playground"""
        
        return "- **Aplicação:** http://localhost:3000"
    
    def _get_project_structure(self, project_type: str) -> str:
        """Retorna estrutura do projeto"""
        if project_type == "web":
            return """```
projeto/
├── src/
│   ├── components/          # Componentes React
│   ├── pages/              # Páginas Next.js
│   ├── services/           # Serviços de API
│   ├── utils/              # Utilitários
│   └── types/              # Tipos TypeScript
├── docs/                   # Documentação
├── tests/                  # Testes
└── public/                 # Arquivos estáticos
```"""
        
        elif project_type == "api":
            return """```
projeto/
├── src/
│   ├── controllers/        # Controllers
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── utils/              # Utilitários
├── docs/                   # API documentation
├── tests/                  # Testes
└── prisma/                 # Database schema
```"""
        
        return """```
projeto/
├── src/                    # Código fonte
├── docs/                   # Documentação
├── tests/                  # Testes
└── examples/               # Exemplos de uso
```"""
    
    def _get_additional_docs_links(self, tier: int) -> str:
        """Retorna links adicionais baseados no tier"""
        links = []
        
        if tier >= 2:
            links.extend([
                "- **Architecture:** [docs/architecture/overview.md](docs/architecture/overview.md)",
                "- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)",
                "- **Changelog:** [CHANGELOG.md](CHANGELOG.md)"
            ])
        
        if tier >= 3:
            links.extend([
                "- **User Guide:** [docs/guides/user-guide.md](docs/guides/user-guide.md)",
                "- **FAQ:** [docs/faq/](docs/faq/)",
                "- **Roadmap:** [docs/roadmap.md](docs/roadmap.md)"
            ])
        
        return "\n".join(links) if links else "- **Mais documentação** em breve"
    
    def _get_contributing_info(self, tier: int) -> str:
        """Retorna informações de contribuição baseadas no tier"""
        if tier >= 2:
            return """Veja o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir para este projeto."""
        
        return """Contribuições são bem-vindas! Por favor:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request"""
    
    def _get_next_steps(self, project_type: str, tier: int) -> List[str]:
        """Retorna próximos passos após inicialização"""
        steps = [
            "Configure as variáveis de ambiente no arquivo .env",
            "Execute as migrações do banco de dados (se aplicável)",
            "Inicie o servidor de desenvolvimento",
            "Teste os endpoints principais"
        ]
        
        if tier >= 2:
            steps.extend([
                "Documente as decisões arquiteturais em ADRs",
                "Crie guias de uso específicos",
                "Configure testes automatizados"
            ])
        
        if tier >= 3:
            steps.extend([
                "Crie tutoriais em vídeo",
                "Configure analytics de documentação",
                "Estabeleça processo de feedback"
            ])
        
        return steps
    
    def _calculate_initial_score(self, tier: int) -> Dict:
        """Calcula score inicial de qualidade baseado no tier"""
        base_scores = {
            1: {"total": 65, "completude": 20, "clareza": 15, "exemplos": 10, "atualizacao": 10, "formatacao": 5, "links": 5},
            2: {"total": 75, "completude": 22, "clareza": 18, "exemplos": 15, "atualizacao": 12, "formatacao": 8, "links": 8},
            3: {"total": 85, "completude": 25, "clareza": 20, "exemplos": 18, "atualizacao": 15, "formatacao": 10, "links": 10}
        }
        
        return base_scores.get(tier, base_scores[1])


# Função principal para MCP
def init_documentation_structure(params: Dict) -> Dict:
    """
    Função MCP para inicializar estrutura de documentação
    
    Args:
        params: {
            "project_path": "/path/to/project",
            "project_type": "web|api|mobile|library",
            "tier": "1|2|3",
            "audience": "developers|users|both",
            "name": "Project Name",
            "description": "Project description"
        }
    
    Returns:
        Dict com resultado da inicialização
    """
    
    try:
        project_path = params.get("project_path", ".")
        initializer = DocumentationInitializer(project_path)
        
        result = initializer.create_structure(params)
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to initialize documentation structure"
        }


# Exemplo de uso
if __name__ == "__main__":
    # Teste da função
    params = {
        "project_path": "./test-project",
        "project_type": "web",
        "tier": "2",
        "audience": "developers",
        "name": "Test Project",
        "description": "A test project for documentation"
    }
    
    result = init_documentation_structure(params)
    print(json.dumps(result, indent=2))