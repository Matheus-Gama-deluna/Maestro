# MCP Functions - Prototipagem com Google Stitch

## ⚠️ IMPORTANTE: Funções de Referência

Este diretório contém **apenas referências** para as funções MCP que devem ser implementadas **externamente** no servidor MCP. 

**Skills são puramente descritivas e NÃO executam código localmente.**

---

## 📋 Funções Disponíveis

### 1. initialize_stitch_prototype

**Arquivo de Referência:** `init_stitch_prototype.py`

**Descrição:**  
Inicializa estrutura do protótipo baseado no Design Doc.

**Implementação Externa:**  
Esta função deve ser implementada no servidor MCP externo.

**Parâmetros:**
```typescript
{
  design_doc_path: string,
  requirements_path?: string,
  design_system?: string,
  project_context?: string
}
```

**Retorno:**
```typescript
{
  components: Component[],
  flows: UserFlow[],
  design_system: string,
  priorities: string[],
  next_steps: string[]
}
```

**Ver:** `MCP_INTEGRATION.md` para detalhes completos

---

### 2. generate_stitch_prompts

**Arquivo de Referência:** `generate_stitch_prompts.py`

**Descrição:**  
Gera prompts otimizados para Google Stitch.

**Implementação Externa:**  
Esta função deve ser implementada no servidor MCP externo.

**Parâmetros:**
```typescript
{
  components: Component[],
  design_system: string,
  project_context: string,
  flows?: UserFlow[]
}
```

**Retorno:**
```typescript
{
  prompts: Prompt[],
  order: string[],
  tips: string[]
}
```

**Ver:** `MCP_INTEGRATION.md` para detalhes completos

---

### 3. validate_prototype_quality

**Arquivo de Referência:** `validate_prototype_quality.py`

**Descrição:**  
Valida qualidade do protótipo contra checklist.

**Implementação Externa:**  
Esta função deve ser implementada no servidor MCP externo.

**Parâmetros:**
```typescript
{
  prototype_path: string,
  checklist_path?: string,
  components_expected: string[],
  flows_expected: string[]
}
```

**Retorno:**
```typescript
{
  score: number,
  validated_items: string[],
  pending_items: string[],
  recommendations: string[],
  approved: boolean
}
```

**Ver:** `MCP_INTEGRATION.md` para detalhes completos

---

## 🔧 Implementação no MCP

### Localização
As funções devem ser implementadas no servidor MCP em:
```
mcp-server/
├── functions/
│   ├── stitch/
│   │   ├── init_stitch_prototype.py
│   │   ├── generate_stitch_prompts.py
│   │   └── validate_prototype_quality.py
```

### Tecnologias Sugeridas
- **Python 3.9+** para implementação
- **FastAPI** para servidor MCP
- **Pydantic** para validação de dados
- **OpenAI API** para processamento de NLP (opcional)

### Dependências
```python
# requirements.txt
fastapi==0.104.0
pydantic==2.5.0
python-multipart==0.0.6
markdown==3.5.0
```

### Exemplo de Implementação

```python
# init_stitch_prototype.py (REFERÊNCIA)
from typing import List, Optional
from pydantic import BaseModel

class Component(BaseModel):
    name: str
    type: str
    priority: str
    features: List[str]

class UserFlow(BaseModel):
    name: str
    steps: List[str]
    priority: str

class InitStitchPrototypeParams(BaseModel):
    design_doc_path: str
    requirements_path: Optional[str] = None
    design_system: Optional[str] = None
    project_context: Optional[str] = None

class InitStitchPrototypeResponse(BaseModel):
    components: List[Component]
    flows: List[UserFlow]
    design_system: str
    priorities: List[str]
    next_steps: List[str]

async def initialize_stitch_prototype(
    params: InitStitchPrototypeParams
) -> InitStitchPrototypeResponse:
    """
    Inicializa estrutura do protótipo Stitch.
    
    Esta é uma REFERÊNCIA de implementação.
    A função real deve ser implementada no servidor MCP.
    """
    # 1. Ler Design Doc
    design_doc = read_file(params.design_doc_path)
    
    # 2. Extrair componentes usando NLP/parsing
    components = extract_ui_components(design_doc)
    
    # 3. Mapear fluxos
    flows = extract_user_flows(design_doc)
    
    # 4. Identificar Design System
    design_system = params.design_system or detect_design_system(design_doc)
    
    # 5. Priorizar componentes
    priorities = prioritize_components(components, flows)
    
    # 6. Gerar próximos passos
    next_steps = generate_next_steps(components)
    
    return InitStitchPrototypeResponse(
        components=components,
        flows=flows,
        design_system=design_system,
        priorities=priorities,
        next_steps=next_steps
    )
```

---

## 📚 Documentação Completa

Para detalhes completos sobre implementação, parâmetros, validações e guardrails, consulte:

- **MCP_INTEGRATION.md** - Especificações completas das funções
- **README.md** - Visão geral do especialista
- **SKILL.md** - Processo de 4 etapas

---

## 🚫 O Que NÃO Fazer

❌ **NÃO** executar código localmente na skill  
❌ **NÃO** criar dependências de runtime na skill  
❌ **NÃO** implementar lógica de negócio na skill  
❌ **NÃO** acessar APIs externas da skill  

✅ **SEMPRE** delegar execução para MCP externo  
✅ **SEMPRE** manter skills puramente descritivas  
✅ **SEMPRE** documentar funções como referência  
✅ **SEMPRE** validar no servidor MCP  

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro MCP Team
