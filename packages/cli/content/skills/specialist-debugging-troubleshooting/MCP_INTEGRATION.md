# MCP Integration Guide - Especialista Debugging e Troubleshooting

## 🎯 Visão Geral

Este documento descreve como o MCP deve integrar com a skill de Debugging e Troubleshooting, fornecendo funções descritivas que substituem a execução direta de scripts.

## 🔧 Funções MCP Implementadas

### 1. Função de Inicialização

#### **Nome da Função**
`initialize_bug_report`

#### **Descrição**
Cria bug report estruturado com template padrão e placeholders definidos.

#### **Parâmetros**
```json
{
  "bug_id": "string (obrigatório)",
  "severity": "string (obrigatório: critica|alta|media|baixa)",
  "description": "string (obrigatório)",
  "base_dir": "string (opcional)"
}
```

#### **Retorno**
```json
{
  "success": boolean,
  "bug_report_path": "string",
  "bug_id": "string",
  "message": "string"
}
```

#### **Implementação MCP**
```python
async def initialize_bug_report(params):
    """Inicializa bug report via MCP"""
    bug_id = params.get("bug_id")
    severity = params.get("severity")
    description = params.get("description")
    base_dir = params.get("base_dir", None)
    
    # Executa lógica do init_debugging.py
    initializer = BugReportInitializer(base_dir)
    initializer.create_output_directory()
    
    report_content = initializer.generate_bug_report(bug_id, severity, description)
    report_path = initializer.save_bug_report(bug_id, report_content)
    
    return {
        "success": True,
        "bug_report_path": str(report_path),
        "bug_id": bug_id,
        "message": f"Bug report {bug_id} criado"
    }
```

---

### 2. Função de Validação

#### **Nome da Função**
`validate_debugging_quality`

#### **Descrição**
Aplica validação automática do processo de debugging usando checklist de qualidade (score mínimo 75/100).

#### **Parâmetros**
```json
{
  "bug_report_path": "string (opcional)",
  "base_dir": "string (opcional)",
  "min_score": "number (opcional, default: 75)"
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
  "phase_scores": {
    "reproduce": number,
    "isolate": number,
    "understand": number,
    "fix": number
  },
  "report_path": "string"
}
```

#### **Implementação MCP**
```python
async def validate_debugging_quality(params):
    """Valida qualidade do debugging via MCP"""
    bug_report_path = params.get("bug_report_path")
    base_dir = params.get("base_dir", None)
    min_score = params.get("min_score", 75)
    
    # Executa lógica do validate_fix.py
    validator = DebuggingValidator(base_dir)
    
    if bug_report_path:
        validator.bug_report_path = Path(bug_report_path)
    
    validator.min_score = min_score
    percentage = validator.run_validation()
    
    return {
        "success": percentage >= min_score,
        "score": validator.total_score,
        "max_score": validator.max_score,
        "percentage": percentage,
        "status": validator.get_status(percentage),
        "feedback": validator.feedback,
        "phase_scores": validator.phase_scores,
        "report_path": str(validator.report_path)
    }
```

---

### 3. Função de Processamento

#### **Nome da Função**
`process_postmortem`

#### **Descrição**
Prepara post-mortem estruturado e documentação de lessons learned.

#### **Parâmetros**
```json
{
  "bug_report_path": "string (opcional)",
  "base_dir": "string (opcional)",
  "incident_id": "string (obrigatório)"
}
```

#### **Retorno**
```json
{
  "success": boolean,
  "postmortem_created": boolean,
  "lessons_learned": boolean,
  "files_created": ["string"],
  "next_steps": ["string"]
}
```

#### **Implementação MCP**
```python
async def process_postmortem(params):
    """Processa post-mortem via MCP"""
    bug_report_path = params.get("bug_report_path")
    base_dir = params.get("base_dir", None)
    incident_id = params.get("incident_id")
    
    # Executa lógica do process_postmortem.py
    processor = PostMortemProcessor(base_dir)
    
    if bug_report_path:
        processor.bug_report_path = Path(bug_report_path)
    
    success = processor.run_processing(incident_id)
    
    return {
        "success": success,
        "postmortem_created": True,
        "lessons_learned": True,
        "files_created": [
            f"docs/bugs/{incident_id}-postmortem.md",
            f"docs/bugs/{incident_id}-lessons.md"
        ],
        "next_steps": [
            "Review post-mortem com equipe",
            "Implementar action items",
            "Atualizar runbooks"
        ]
    }
```

---

## 🔄 Fluxo de Integração

### 1. Detecção de Necessidade
O especialista detecta quando precisa de automação:

```markdown
### 1. Inicialização Estruturada
Use função de inicialização para criar bug report com template padrão.
```

### 2. Chamada MCP
O MCP interpreta a necessidade e chama a função apropriada:

```python
# MCP detecta "inicialização estruturada"
if "inicialização estruturada" in skill_context:
    result = await mcp_call("initialize_bug_report", {
        "bug_id": extracted_bug_id,
        "severity": extracted_severity,
        "description": extracted_description
    })
```

### 3. Retorno para Skill
O MCP retorna o resultado para a skill continuar o processo:

```python
if result["success"]:
    skill_context["bug_report_path"] = result["bug_report_path"]
    skill_context["status"] = "initialized"
    # Continua com próximo passo da skill
```

---

## 📋 Mapeamento de Comandos

### Comandos da Skill → Funções MCP

| Comando da Skill | Função MCP | Gatilho |
|------------------|------------|---------|
| "Use função de inicialização" | `initialize_bug_report` | "inicialização estruturada" |
| "Aplique validação automática" | `validate_debugging_quality` | "validação automática" |
| "Use função de processamento" | `process_postmortem` | "processamento de post-mortem" |

---

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
    if action == "process_postmortem":
        # Requer validação prévia
        if user_context.get("validation_score", 0) < 75:
            raise PermissionError("Debugging não validado para post-mortem")
    return True
```

---

## 📊 Métricas e Monitoramento

### 1. Métricas de Execução
```python
mcp_metrics = {
    "initialize_bug_report": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_duration": 0.0
    },
    "validate_debugging_quality": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_score": 0.0
    },
    "process_postmortem": {
        "calls": 0,
        "success_rate": 0.0,
        "avg_duration": 0.0
    }
}
```

---

## 🚀 Exemplo de Uso Completo

### Fluxo Real com MCP
```python
# 1. Usuário reporta bug
user_input = "Bug: Login falha com erro 401"

# 2. Skill detecta necessidade
skill_response = """
Vou criar um bug report estruturado.
[Use função de inicialização para criar bug report]
"""

# 3. MCP executa função
mcp_result = await mcp_call("initialize_bug_report", {
    "bug_id": "BUG-001",
    "severity": "alta",
    "description": "Login falha com erro 401"
})

# 4. Skill continua com debugging
if mcp_result["success"]:
    skill_response += f"""
Bug report criado: {mcp_result['bug_report_path']}

Vamos seguir a metodologia de 4 fases:
1. REPRODUCE: Documentar steps
2. ISOLATE: Identificar componente
3. UNDERSTAND: Aplicar 5 Whys
4. FIX: Corrigir causa raiz
"""

# 5. Após fix, skill solicita validação
validation_result = await mcp_call("validate_debugging_quality", {
    "bug_report_path": mcp_result["bug_report_path"]
})

# 6. Skill apresenta resultado
if validation_result["success"]:
    skill_response += f"""
✅ Debugging validado com {validation_result['score']}/100 pontos!

[Use função de processamento para criar post-mortem]
"""
```

---

**Versão:** 1.0  
**Framework:** Maestro Skills + MCP Integration  
**Atualização:** 2026-01-30  
**Status:** ✅ Ready for MCP Implementation
