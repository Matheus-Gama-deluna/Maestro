# MCP Integration Guide - Especialista Engenharia de Requisitos

## 🎯 Visão Geral

Este documento descreve como o MCP deve integrar com a skill de Engenharia de Requisitos, fornecendo funções descritivas que substituem a execução direta de scripts.

## 🔧 Funções MCP Implementadas

### 1. Função de Inicialização

#### Nome da Função
`initialize_requirements_structure`

#### Descrição
Cria estrutura base do documento de requisitos com template padrão e placeholders definidos.

#### Parâmetros
```json
{
  "project_name": "string (obrigatório)",
  "description": "string (opcional)",
  "base_dir": "string (opcional)"
}
```

#### Retorno
```json
{
  "success": boolean,
  "requirements_path": "string",
  "context_path": "string",
  "message": "string"
}
```

#### Implementação MCP
```python
async def initialize_requirements_structure(params):
    """Inicializa estrutura de requisitos via MCP"""
    project_name = params.get("project_name")
    description = params.get("description", "")
    base_dir = params.get("base_dir", None)
    
    # Executa lógica do init_requirements.py
    initializer = RequirementsInitializer(base_dir)
    initializer.create_output_directory()
    
    requirements_content = initializer.generate_requirements(project_name, description)
    requirements_path = initializer.save_requirements(project_name, requirements_content)
    
    context_path = initializer.create_context_file(project_name)
    
    return {
        "success": True,
        "requirements_path": str(requirements_path),
        "context_path": str(context_path),
        "message": f"Estrutura de requisitos criada para {project_name}"
    }
```

### 2. Função de Validação

#### Nome da Função
`validate_requirements_quality`

#### Descrição
Aplica validação automática de completude e consistência usando checklist de qualidade.

#### Parâmetros
```json
{
  "requirements_path": "string (opcional)",
  "base_dir": "string (opcional)",
  "min_score": "number (opcional, default: 75)"
}
```

#### Retorno
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

#### Implementação MCP
```python
async def validate_requirements_quality(params):
    """Valida qualidade dos requisitos via MCP"""
    requirements_path = params.get("requirements_path")
    base_dir = params.get("base_dir", None)
    min_score = params.get("min_score", 75)
    
    # Executa lógica do validate_requirements.py
    validator = RequirementsValidator(base_dir)
    
    if requirements_path:
        validator.requirements_path = Path(requirements_path)
    
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

#### Nome da Função
`process_requirements_to_ux_design`

#### Descrição
Prepara contexto estruturado para especialista de UX Design.

#### Parâmetros
```json
{
  "requirements_path": "string (opcional)",
  "base_dir": "string (opcional)"
}
```

#### Retorno
```json
{
  "success": boolean,
  "context_updated": boolean,
  "prompt_generated": boolean,
  "next_phase": "string",
  "files_created": ["string"]
}
```

#### Implementação MCP
```python
async def process_requirements_to_ux_design(params):
    """Processa requisitos para UX Design via MCP"""
    requirements_path = params.get("requirements_path")
    base_dir = params.get("base_dir", None)
    
    # Executa lógica do process_requirements.py
    processor = RequirementsProcessor(base_dir)
    
    if requirements_path:
        processor.requirements_path = Path(requirements_path)
    
    success = processor.run_processing()
    
    return {
        "success": success,
        "context_updated": True,
        "prompt_generated": True,
        "next_phase": "UX Design",
        "files_created": [
            "docs/CONTEXTO.md",
            "docs/03-ux-design/next-specialist-prompt.md",
            "docs/03-ux-design/transition-summary.json"
        ]
    }
```

## 🔄 Fluxo de Integração

### 1. Detecção de Necessidade
O especialista detecta quando precisa de automação:

```markdown
### 1. Análise do PRD (15 min)
Use função de análise para extrair informações estruturadas do PRD:
- Funcionalidades principais do MVP
- Personas e casos de uso
- Restrições e dependências
- Métricas de sucesso
```

### 2. Chamada MCP
O MCP interpreta a necessidade e chama a função apropriada:

```python
# MCP detecta "função de análise"
if "análise do PRD" in skill_context:
    result = await mcp_call("initialize_requirements_structure", {
        "project_name": extracted_project_name,
        "description": extracted_description
    })
```

### 3. Retorno para Skill
O MCP retorna o resultado para a skill continuar o processo:

```python
if result["success"]:
    skill_context["requirements_path"] = result["requirements_path"]
    skill_context["status"] = "initialized"
    # Continua com próximo passo da skill
```

## 📋 Mapeamento de Comandos

### Comandos da Skill → Funções MCP
| Comando da Skill | Função MCP | Gatilho |
|------------------|------------|---------|
| "Use função de análise" | `initialize_requirements_structure` | "análise do PRD" |
| "Aplique validação automática" | `validate_requirements_quality` | "validação automática" |
| "Use função de processamento" | `process_requirements_to_ux_design` | "processamento para próxima fase" |

### Contextos de Execução
#### Contexto de Inicialização
```python
{
    "action": "initialize_requirements",
    "project_name": "Nome do Projeto",
    "description": "Descrição do problema",
    "phase": "discovery"
}
```

#### Contexto de Validação
```python
{
    "action": "validate_requirements",
    "requirements_path": "docs/02-requisitos/requisitos.md",
    "min_score": 75,
    "phase": "validation"
}
```

#### Contexto de Processamento
```python
{
    "action": "process_requirements",
    "requirements_path": "docs/02-requisitos/requisitos.md",
    "next_phase": "ux_design",
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
    if action == "process_requirements":
        # Requer validação prévia
        if user_context.get("validation_score", 0) < 75:
            raise PermissionError("Requisitos não validados para processamento")
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
    "initialize_requirements_structure": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_duration": 0.0
    },
    "validate_requirements_quality": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_score": 0.0
    },
    "process_requirements_to_ux_design": {
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
async def test_initialize_requirements_structure():
    """Testa função de inicialização"""
    params = {
        "project_name": "Test Project",
        "description": "Test Description"
    }
    
    result = await initialize_requirements_structure(params)
    
    assert result["success"] == True
    assert "requirements_path" in result
    assert Path(result["requirements_path"]).exists()
```

### 2. Teste de Integração End-to-End
```python
async def test_full_requirements_workflow():
    """Teste completo do fluxo de requisitos"""
    # 1. Inicialização
    init_result = await initialize_requirements_structure({
        "project_name": "Full Test Project"
    })
    
    # 2. Validação
    validate_result = await validate_requirements_quality({
        "requirements_path": init_result["requirements_path"]
    })
    
    # 3. Processamento
    process_result = await process_requirements_to_ux_design({
        "requirements_path": init_result["requirements_path"]
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
# 1. Usuário solicita requisitos
user_input = "Preciso detalhar requisitos para um sistema de gestão de projetos"

# 2. Skill responde (Descritivo)
skill_response = """
Vou analisar o PRD e criar a estrutura inicial para você.
Use função de análise para extrair informações estruturadas do PRD.
"""

# 3. MCP intercepta e executa
mcp_result = await mcp_call("initialize_requirements_structure", {
    "project_name": "SistemaGestaoProjetos",
    "description": "Sistema para gestão de projetos com equipes remotas"
})

# 4. Skill continua com conteúdo gerado
if mcp_result["success"]:
    skill_response += f"""
Estrutura criada em: {mcp_result['requirements_path']}

Agora preciso analisar os requisitos e mapear:
1. Requisitos funcionais (RF)
2. Requisitos não funcionais (RNF)
3. Regras de negócio (RN)
4. Restrições técnicas
"""

# 5. Após preenchimento, skill solicita validação
skill_response += """
Vou aplicar validação automática de completude e consistência.
"""

# 6. MCP executa validação
validation_result = await mcp_call("validate_requirements_quality", {
    "requirements_path": mcp_result["requirements_path"]
})

# 7. Skill apresenta resultado
if validation_result["success"]:
    skill_response += f"""
✅ Requisitos validados com {validation_result['score']}/{validation_result['max_score']} pontos!

Use função de processamento para preparar contexto para UX Design.
"""
```

## 📞 Suporte MCP

### Funções Disponíveis
- `initialize_requirements_structure`: Cria estrutura base
- `validate_requirements_quality`: Valida qualidade
- `process_requirements_to_ux_design`: Processa para próxima fase

### Contato
- **Documentação:** `MCP_INTEGRATION.md`
- **Exemplos:** `resources/examples/requirements-examples.md`
- **Templates:** `resources/templates/requisitos.md`
- **Validação:** `resources/checklists/requirements-validation.md`

---

## 📊 Status da Implementação

### Componentes Implementados
- ✅ **Funções MCP:** 3 funções padrão implementadas
- ✅ **Mapeamento:** Comandos → Funções completo
- ✅ **Guardrails:** Segurança e validação implementados
- ✅ **Testes:** Unitários e integração definidos
- ✅ **Logging:** Estruturado e monitoramento
- ✅ **Documentação:** Guia completo e exemplos

### Métricas Esperadas
- **Tempo de inicialização:** < 30 segundos
- **Tempo de validação:** < 60 segundos
- **Tempo de processamento:** < 45 segundos
- **Taxa de sucesso:** > 95%
- **Score médio validação:** > 80 pontos

---

**Versão:** 1.0  
**Framework:** Maestro Skills + MCP Integration  
**Atualização:** 2026-01-29  
**Status:** ✅ Ready for MCP Implementation