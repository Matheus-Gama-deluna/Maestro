# MCP Integration Guide - Especialista Gestão de Produto

## 🎯 Visão Geral

Este documento descreve como o MCP deve integrar com a skill de Gestão de Produto, fornecendo funções descritivas que substituem a execução direta de scripts.

## 🔧 Funções MCP Implementadas

### 1. Função de Inicialização

#### **Nome da Função**
`initialize_prd_structure`

#### **Descrição**
Cria estrutura base do PRD com template padrão e placeholders definidos.

#### **Parâmetros**
```json
{
  "product_name": "string (obrigatório)",
  "description": "string (opcional)",
  "base_dir": "string (opcional)"
}
```

#### **Retorno**
```json
{
  "success": boolean,
  "prd_path": "string",
  "context_path": "string",
  "message": "string"
}
```

#### **Implementação MCP**
```python
async def initialize_prd_structure(params):
    """Inicializa estrutura do PRD via MCP"""
    product_name = params.get("product_name")
    description = params.get("description", "")
    base_dir = params.get("base_dir", None)
    
    # Executa lógica do init_prd.py
    initializer = PRDInitializer(base_dir)
    initializer.create_output_directory()
    
    prd_content = initializer.generate_prd(product_name, description)
    prd_path = initializer.save_prd(product_name, prd_content)
    
    context_path = initializer.create_context_file(product_name)
    
    return {
        "success": True,
        "prd_path": str(prd_path),
        "context_path": str(context_path),
        "message": f"Estrutura PRD criada para {product_name}"
    }
```

### 2. Função de Validação

#### **Nome da Função**
`validate_prd_quality`

#### **Descrição**
Aplica validação automática de completude e consistência usando checklist de qualidade.

#### **Parâmetros**
```json
{
  "prd_path": "string (opcional)",
  "base_dir": "string (opcional)",
  "min_score": "number (opcional, default: 70)"
}
```

#### **Retorno**
```json
{
  "success": boolean,
  "score": number,
  "max_score": number,
  "percentage": number,
  "status": "string",
  "feedback": ["string"],
  "report_path": "string"
}
```

#### **Implementação MCP**
```python
async def validate_prd_quality(params):
    """Valida qualidade do PRD via MCP"""
    prd_path = params.get("prd_path")
    base_dir = params.get("base_dir", None)
    min_score = params.get("min_score", 70)
    
    # Executa lógica do validate_prd.py
    validator = PRDValidator(base_dir)
    
    if prd_path:
        validator.prd_path = Path(prd_path)
    
    validator.min_score = min_score
    percentage = validator.run_validation()
    
    return {
        "success": percentage >= min_score,
        "score": validator.total_score,
        "max_score": validator.max_score,
        "percentage": percentage,
        "status": validator.get_status(percentage),
        "feedback": validator.feedback,
        "report_path": str(validator.report_path)
    }
```

### 3. Função de Processamento

#### **Nome da Função**
`process_prd_to_requirements`

#### **Descrição**
Prepara contexto estruturado para especialista de Engenharia de Requisitos.

#### **Parâmetros**
```json
{
  "prd_path": "string (opcional)",
  "base_dir": "string (opcional)"
}
```

#### **Retorno**
```json
{
  "success": boolean,
  "context_updated": boolean,
  "prompt_generated": boolean,
  "next_phase": "string",
  "files_created": ["string"]
}
```

#### **Implementação MCP**
```python
async def process_prd_to_requirements(params):
    """Processa PRD para próxima fase via MCP"""
    prd_path = params.get("prd_path")
    base_dir = params.get("base_dir", None)
    
    # Executa lógica do process_prd.py
    processor = PRDProcessor(base_dir)
    
    if prd_path:
        processor.prd_path = Path(prd_path)
    
    success = processor.run_processing()
    
    return {
        "success": success,
        "context_updated": True,
        "prompt_generated": True,
        "next_phase": "Engenharia de Requisitos",
        "files_created": [
            "docs/CONTEXTO.md",
            "docs/02-requisitos/next-specialist-prompt.md",
            "docs/02-requisitos/transition-summary.json"
        ]
    }
```

## 🔄 Fluxo de Integração

### 1. Detecção de Necessidade
O especialista detecta quando precisa de automação:

```markdown
### 1. Inicialização Estruturada
Use função de inicialização para criar estrutura base do PRD com template padrão e placeholders definidos.
```

### 2. Chamada MCP
O MCP interpreta a necessidade e chama a função apropriada:

```python
# MCP detecta "inicialização estruturada"
if "inicialização estruturada" in skill_context:
    result = await mcp_call("initialize_prd_structure", {
        "product_name": extracted_product_name,
        "description": extracted_description
    })
```

### 3. Retorno para Skill
O MCP retorna o resultado para a skill continuar o processo:

```python
if result["success"]:
    skill_context["prd_path"] = result["prd_path"]
    skill_context["status"] = "initialized"
    # Continua com próximo passo da skill
```

## 📋 Mapeamento de Comandos

### Comandos da Skill → Funções MCP

| Comando da Skill | Função MCP | Gatilho |
|------------------|------------|---------|
| "Use função de inicialização" | `initialize_prd_structure` | "inicialização estruturada" |
| "Aplique validação automática" | `validate_prd_quality` | "validação automática" |
| "Use função de processamento" | `process_prd_to_requirements` | "processamento para próxima fase" |

### Contextos de Execução

#### Contexto de Inicialização
```python
{
    "action": "initialize_prd",
    "product_name": "Nome do Produto",
    "description": "Descrição do problema",
    "phase": "discovery"
}
```

#### Contexto de Validação
```python
{
    "action": "validate_prd",
    "prd_path": "docs/01-produto/PRD.md",
    "min_score": 70,
    "phase": "validation"
}
```

#### Contexto de Processamento
```python
{
    "action": "process_prd",
    "prd_path": "docs/01-produto/PRD.md",
    "next_phase": "requirements",
    "phase": "transition"
}
```

## 🛡️ Guardrails e Segurança

### 1. Validação de Parâmetros
```python
def validate_mcp_params(params, required_fields):
    """Valida parâmetros obrigatórios"""
    for field in required_fields:
        if field not in params:
            raise ValueError(f"Parâmetro obrigatório: {field}")
    return True
```

### 2. Verificação de Permissões
```python
def check_mcp_permissions(action, user_context):
    """Verifica permissões do usuário"""
    if action == "process_prd":
        # Requer validação prévia
        if user_context.get("validation_score", 0) < 70:
            raise PermissionError("PRD não validado para processamento")
    return True
```

### 3. Rollback Automático
```python
async def safe_mcp_execution(func, params):
    """Execução segura com rollback"""
    try:
        result = await func(params)
        return result
    except Exception as e:
        # Rollback automático
        await rollback_changes(params)
        raise MCPExecutionError(f"Falha na execução: {e}")
```

## 📊 Métricas e Monitoramento

### 1. Métricas de Execução
```python
mcp_metrics = {
    "initialize_prd_structure": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_duration": 0.0
    },
    "validate_prd_quality": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_score": 0.0
    },
    "process_prd_to_requirements": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_duration": 0.0
    }
}
```

### 2. Logging Estruturado
```python
import structlog

logger = structlog.get_logger()

async def log_mcp_execution(action, params, result):
    """Log estruturado de execuções MCP"""
    logger.info(
        "mcp_execution",
        action=action,
        params=params,
        success=result.get("success", False),
        duration=result.get("duration", 0)
    )
```

## 🧪 Testes de Integração

### 1. Teste Unitário de Função
```python
async def test_initialize_prd_structure():
    """Testa função de inicialização"""
    params = {
        "product_name": "Test Product",
        "description": "Test Description"
    }
    
    result = await initialize_prd_structure(params)
    
    assert result["success"] == True
    assert "prd_path" in result
    assert Path(result["prd_path"]).exists()
```

### 2. Teste de Integração End-to-End
```python
async def test_full_prd_workflow():
    """Teste completo do fluxo PRD"""
    # 1. Inicialização
    init_result = await initialize_prd_structure({
        "product_name": "Full Test Product"
    })
    
    # 2. Validação
    validate_result = await validate_prd_quality({
        "prd_path": init_result["prd_path"]
    })
    
    # 3. Processamento
    process_result = await process_prd_to_requirements({
        "prd_path": init_result["prd_path"]
    })
    
    assert all([
        init_result["success"],
        validate_result["success"],
        process_result["success"]
    ])
```

## 🚀 Exemplo de Uso Completo

### Fluxo Real com MCP
```python
# 1. Usuário solicita PRD
user_input = "Preciso criar um PRD para um app de delivery"

# 2. Skill detecta necessidade
skill_response = """
Vou criar a estrutura inicial para você.
[Use função de inicialização para criar estrutura base do PRD]
"""

# 3. MCP executa função
mcp_result = await mcp_call("initialize_prd_structure", {
    "product_name": "DeliveryApp",
    "description": "App de delivery para restaurantes"
})

# 4. Skill continua com conteúdo gerado
if mcp_result["success"]:
    skill_response += f"""
Estrutura criada em: {mcp_result['prd_path']}

Agora preciso de algumas informações:
1. Qual problema principal resolve?
2. Para quem é este app?
3. Qual o diferencial competitivo?
"""

# 5. Após preenchimento, skill solicita validação
skill_response += """
[Vou aplicar validação automática de completude]
"""

# 6. MCP executa validação
validation_result = await mcp_call("validate_prd_quality", {
    "prd_path": mcp_result["prd_path"]
})

# 7. Skill apresenta resultado
if validation_result["success"]:
    skill_response += f"""
✅ PRD validado com {validation_result['score']}/{validation_result['max_score']} pontos!

[Use função de processamento para preparar contexto para Engenharia de Requisitos]
"""
```

---

## 📞 Suporte MCP

### Funções Disponíveis
- `initialize_prd_structure`: Cria estrutura base
- `validate_prd_quality`: Valida qualidade
- `process_prd_to_requirements`: Processa para próxima fase

### Contato
- **Documentação**: `MCP_INTEGRATION.md`
- **Exemplos**: `resources/examples/prd-examples.md`
- **Templates**: `resources/templates/PRD.md`

---

**Versão:** 1.0  
**Framework:** Maestro Skills + MCP Integration  
**Atualização:** 2026-01-29  
**Status:** ✅ Ready for MCP Implementation