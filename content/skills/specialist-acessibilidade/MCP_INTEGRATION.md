# 🔧 MCP Integration Guide · Acessibilidade

## 🎯 Visão Geral

Este guia descreve como integrar o especialista de Acessibilidade com o servidor MCP (Model Context Protocol) para automação completa de auditorias, validações e relatórios de conformidade WCAG 2.1 AA.

### 🏗️ Arquitetura de Integração

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Skill UI      │    │   MCP Server     │    │  External Tools │
│ (User Interface)│◄──►│ (Orchestration)  │◄──►│ (Execution)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Templates & Examples    Functions Logic    Audit & Test Tools
   Progressive Disclosure   Quality Gates    WCAG Validators
```

## 📋 Funções MCP Disponíveis

### 1. `init_accessibility_audit`

**Propósito:** Iniciar auditoria completa de acessibilidade WCAG 2.1 AA.

#### Parâmetros
```typescript
interface InitAccessibilityAuditParams {
  project_path: string;           // Caminho do projeto
  project_type: "web" | "mobile" | "desktop";
  wcag_level: "AA" | "AAA";        // Nível WCAG
  target_browsers: string[];        // Navegadores alvo
  screen_readers: string[];         // Leitores de tela
  include_automated: boolean;       // Incluir testes automatizados
  include_manual: boolean;          // Incluir testes manuais
}
```

#### Retorno
```typescript
interface InitAccessibilityAuditResult {
  status: "success" | "error";
  data: {
    audit: {
      timestamp: string;
      project_type: string;
      wcag_level: string;
      target_browsers: string[];
      screen_readers: string[];
      automated_tests: TestResults;
      manual_tests: ManualTestConfig;
    };
    created: {
      directories: string[];
      test_files: string[];
      checklists: string[];
    };
    next_steps: string[];
    estimated_duration: string;
  };
}
```

#### Exemplo de Uso
```python
# No servidor MCP
async def init_accessibility_audit(params: Dict) -> Dict:
    """Implementação real da função"""
    try:
        auditor = AccessibilityAuditor(params["project_path"])
        result = await auditor.init_audit(params)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

---

### 2. `validate_wcag_compliance`

**Propósito:** Validar conformidade WCAG 2.1 AA de um projeto existente.

#### Parâmetros
```typescript
interface ValidateWCAGComplianceParams {
  project_path: string;
  wcag_level: "AA" | "AAA";
  include_automated: boolean;
  include_manual: boolean;
  target_browsers: string[];
  screen_readers: string[];
}
```

#### Retorno
```typescript
interface ValidateWCAGComplianceResult {
  status: "success" | "error";
  data: {
    validation: {
      timestamp: string;
      wcag_level: string;
      overall_score: number;
      automated: AutomatedResults;
      manual: ManualResults;
      compliance_level: string;
    };
    summary: string;
    recommendations: string[];
    next_actions: string[];
    quality_metrics: QualityMetrics;
  };
}
```

#### Exemplo de Uso
```python
# No servidor MCP
async def validate_wcag_compliance(params: Dict) -> Dict:
    """Implementação real da função"""
    try:
        validator = WCAGComplianceValidator(params["project_path"])
        result = await validator.validate_compliance(params)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

---

## 🚀 Configuração do Servidor MCP

### 1. Estrutura do Servidor

```python
# mcp_server_accessibility.py
from mcp import Server, types
from .accessibility_functions import (
    init_accessibility_audit,
    validate_wcag_compliance
)

app = Server("accessibility")

@app.call_tool()
async def handle_accessibility_tool(
    name: str,
    arguments: dict
) -> dict:
    """Handler principal para ferramentas de acessibilidade"""
    
    if name == "init_accessibility_audit":
        return await init_accessibility_audit(arguments)
    
    elif name == "validate_wcag_compliance":
        return await validate_wcag_compliance(arguments)
    
    else:
        raise ValueError(f"Unknown tool: {name}")

@app.list_tools()
async def list_accessibility_tools() -> list[types.Tool]:
    """Lista ferramentas disponíveis"""
    return [
        types.Tool(
            name="init_accessibility_audit",
            description="Start accessibility audit for a project",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_path": {"type": "string"},
                    "project_type": {"type": "string", "enum": ["web", "mobile", "desktop"]},
                    "wcag_level": {"type": "string", "enum": ["AA", "AAA"]},
                    "target_browsers": {"type": "array", "items": {"type": "string"}},
                    "screen_readers": {"type": "array", "items": {"type": "string"}},
                    "include_automated": {"type": "boolean"},
                    "include_manual": {"type": "boolean"}
                },
                "required": ["project_path", "project_type", "wcag_level"]
            }
        ),
        types.Tool(
            name="validate_wcag_compliance",
            description="Validate WCAG compliance for a project",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_path": {"type": "string"},
                    "wcag_level": {"type": "string", "enum": ["AA", "AAA"]},
                    "include_automated": {"type": "boolean"},
                    "include_manual": {"type": "boolean"},
                    "target_browsers": {"type": "array", "items": {"type": "string"}},
                    "screen_readers": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["project_path", "wcag_level"]
            }
        )
    ]

async def main():
    """Função principal do servidor"""
    import sys
    
    # Inicializar servidor
    async with app.run() as server:
        await server.run(*sys.argv[1:])

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### 2. Configuração do Cliente

```typescript
// client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class AccessibilityClient {
  private client: Client;
  
  constructor() {
    const transport = new StdioClientTransport({
      command: "python",
      args: ["mcp_server_accessibility.py"]
    });
    
    this.client = new Client(
      {
        name: "accessibility-client",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    await this.client.connect(transport);
  }
  
  async initAudit(params: InitAccessibilityAuditParams): Promise<InitAccessibilityAuditResult> {
    const result = await this.client.callTool({
      name: "init_accessibility_audit",
      arguments: params
    });
    
    return result.content as InitAccessibilityAuditResult;
  }
  
  async validateCompliance(params: ValidateWCAGComplianceParams): Promise<ValidateWCAGComplianceResult> {
    const result = await this.client.callTool({
      name: "validate_wcag_compliance",
      arguments: params
    });
    
    return result.content as ValidateWCAGComplianceResult;
  }
}
```

---

## 🔄 Fluxo de Trabalho Completo

### 1. Inicialização do Projeto

```typescript
// Exemplo de fluxo completo
async function auditProjectAccessibility() {
  const client = new AccessibilityClient();
  
  // 1. Iniciar auditoria
  const initResult = await client.initAudit({
    project_path: "./my-project",
    project_type: "web",
    wcag_level: "AA",
    target_browsers: ["chrome", "firefox", "safari"],
    screen_readers: ["nvda", "voiceover", "jaws"],
    include_automated: true,
    include_manual: true
  });
  
  console.log("✅ Auditoria iniciada:", initResult.data.created);
  
  // 2. Validar conformidade
  const validationResult = await client.validateCompliance({
    project_path: "./my-project",
    wcag_level: "AA",
    include_automated: true,
    include_manual: true,
    target_browsers: ["chrome", "firefox", "safari"],
    screen_readers: ["nvda", "voiceover", "jaws"]
  });
  
  console.log("📊 Score de conformidade:", validationResult.data.validation.overall_score);
  
  return {
    init: initResult,
    validation: validationResult
  };
}
```

### 2. Auditoria Contínua

```typescript
// Exemplo de auditoria automatizada
async function continuousAccessibilityAudit(projectPath: string) {
  const client = new AccessibilityClient();
  
  // 1. Validar conformidade atual
  const validation = await client.validateCompliance({
    project_path: projectPath,
    wcag_level: "AA",
    include_automated: true,
    include_manual: false, // Apenas automatizado para CI/CD
    target_browsers: ["chrome", "firefox", "safari"],
    screen_readers: ["nvda", "voiceover", "jaws"]
  });
  
  if (!validation.data.validation.compliance_level.includes("AA")) {
    console.log("⚠️ Conformidade WCAG AA não atingida");
    
    // 2. Gerar relatório de problemas
    const issues = validation.data.validation.automated.violations;
    
    // 3. Criar backlog de correção
    const backlog = issues.map(issue => ({
      title: issue.description,
      severity: issue.impact,
      affected_elements: issue.nodes,
      wcag_criterion: issue.id,
      suggested_fix: getSuggestedFix(issue.id)
    }));
    
    return {
      compliant: false,
      score: validation.data.validation.overall_score,
      issues: backlog,
      recommendations: validation.data.recommendations
    };
  }
  
  return {
    compliant: true,
    score: validation.data.validation.overall_score,
    message: "Conformidade WCAG AA mantida"
  };
}
```

---

## 🛡️ Segurança e Validação

### 1. Validação de Parâmetros

```python
# validation.py
from pydantic import BaseModel, validator
from typing import List, Optional
from pathlib import Path

class InitAccessibilityAuditParams(BaseModel):
    project_path: str
    project_type: str
    wcag_level: str
    target_browsers: List[str]
    screen_readers: List[str]
    include_automated: bool
    include_manual: bool
    
    @validator('project_path')
    def validate_project_path(cls, v):
        path = Path(v)
        if not path.exists():
            raise ValueError(f"Project path does not exist: {v}")
        return str(path.absolute())
    
    @validator('project_type')
    def validate_project_type(cls, v):
        valid_types = ['web', 'mobile', 'desktop']
        if v not in valid_types:
            raise ValueError(f"Invalid project_type. Must be one of: {valid_types}")
        return v
    
    @validator('wcag_level')
    def validate_wcag_level(cls, v):
        valid_levels = ['AA', 'AAA']
        if v not in valid_levels:
            raise ValueError(f"Invalid wcag_level. Must be one of: {valid_levels}")
        return v
```

### 2. Tratamento de Erros

```python
# error_handling.py
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class AccessibilityError(Exception):
    """Base exception for accessibility errors"""
    pass

class ValidationError(AccessibilityError):
    """Raised when validation fails"""
    pass

class AuditError(AccessibilityError):
    """Raised when audit fails"""
    pass

def handle_mcp_error(func):
    """Decorator for MCP error handling"""
    async def wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            return result
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            return {
                "status": "error",
                "error": "validation_error",
                "message": str(e)
            }
        except AuditError as e:
            logger.error(f"Audit error: {e}")
            return {
                "status": "error",
                "error": "audit_error",
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {
                "status": "error",
                "error": "unexpected_error",
                "message": "An unexpected error occurred"
            }
    return wrapper
```

---

## 📊 Monitoramento e Logging

### 1. Sistema de Logging

```python
# logging_config.py
import logging
import json
from datetime import datetime

class AccessibilityLogger:
    def __init__(self):
        self.logger = logging.getLogger("accessibility")
        self.logger.setLevel(logging.INFO)
        
        # File handler
        file_handler = logging.FileHandler("accessibility.log")
        file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        self.logger.addHandler(file_handler)
        
        # Structured logging for metrics
        self.metrics_logger = logging.getLogger("accessibility_metrics")
        metrics_handler = logging.FileHandler("accessibility_metrics.json")
        self.metrics_logger.addHandler(metrics_handler)
    
    def log_audit_call(self, function_name: str, params: Dict, result: Dict):
        """Log audit calls with metrics"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "function": function_name,
            "params": params,
            "result_status": result.get("status"),
            "duration_ms": result.get("duration_ms"),
            "wcag_score": result.get("data", {}).get("validation", {}).get("overall_score")
        }
        
        self.metrics_logger.info(json.dumps(log_entry))
    
    def log_compliance_metrics(self, project_path: str, metrics: Dict):
        """Log compliance metrics"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "compliance_validation",
            "project_path": project_path,
            "metrics": metrics
        }
        
        self.metrics_logger.info(json.dumps(log_entry))
```

### 2. Métricas de Performance

```python
# metrics.py
import time
from functools import wraps
from typing import Dict, Any

def track_performance(func):
    """Decorator to track function performance"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration_ms = int((time.time() - start_time) * 1000)
            
            if isinstance(result, dict):
                result["duration_ms"] = duration_ms
            
            return result
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "status": "error",
                "error": str(e),
                "duration_ms": duration_ms
            }
    return wrapper

class PerformanceMetrics:
    def __init__(self):
        self.metrics = {
            "init_audit_calls": 0,
            "validate_calls": 0,
            "total_duration_ms": 0,
            "average_score": 0,
            "success_rate": 0
        }
    
    def record_call(self, function_name: str, duration_ms: int, success: bool, score: int = 0):
        """Record metrics for a function call"""
        self.metrics["total_duration_ms"] += duration_ms
        
        if function_name == "init_accessibility_audit":
            self.metrics["init_audit_calls"] += 1
        elif function_name == "validate_wcag_compliance":
            self.metrics["validate_calls"] += 1
            if score > 0:
                self.metrics["average_score"] = (
                    (self.metrics["average_score"] * (self.metrics["validate_calls"] - 1) + score) /
                    self.metrics["validate_calls"]
                )
        
        total_calls = (
            self.metrics["init_audit_calls"] + 
            self.metrics["validate_calls"]
        )
        
        if success:
            self.metrics["success_rate"] = (
                (self.metrics["success_rate"] * (total_calls - 1) + 100) / total_calls
            )
        else:
            self.metrics["success_rate"] = (
                (self.metrics["success_rate"] * (total_calls - 1)) / total_calls
            )
```

---

## 🚀 Deploy e Produção

### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP server
COPY mcp_server_accessibility.py .
COPY accessibility_functions/ ./accessibility_functions/

# Install accessibility tools
RUN pip install axe-core selenium beautifulsoup4 requests

# Expose port (if needed)
EXPOSE 8000

# Run server
CMD ["python", "mcp_server_accessibility.py"]
```

### 2. Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: accessibility-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: accessibility-mcp-server
  template:
    metadata:
      labels:
        app: accessibility-mcp-server
    spec:
      containers:
      - name: server
        image: accessibility-mcp-server:latest
        ports:
        - containerPort: 8000
        env:
        - name: LOG_LEVEL
          value: "INFO"
        - name: METRICS_ENABLED
          value: "true"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### 3. Monitoring Setup

```yaml
# monitoring.yaml
apiVersion: v1
kind: Service
metadata:
  name: accessibility-mcp-service
spec:
  selector:
    app: accessibility-mcp-server
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP

---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: accessibility-mcp-monitor
spec:
  selector:
    matchLabels:
      app: accessibility-mcp-server
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

---

## 📚 Recursos Adicionais

### Documentação de Referência
- **MCP Protocol:** https://modelcontextprotocol.io
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **axe-core Documentation:** https://www.deque.com/axe/
- **Python Async:** https://docs.python.org/3/library/asyncio.html

### Exemplos Completos
- **Basic Setup:** Exemplo mínimo de configuração
- **Advanced Integration:** Integração com CI/CD
- **Custom Functions:** Como adicionar funções personalizadas
- **Error Handling:** Tratamento robusto de erros

### Comunidade e Suporte
- **Discord:** #mcp-accessibility
- **GitHub Issues:** Para bugs e feature requests
- **Documentation:** https://docs.maestro.dev/mcp-accessibility
- **Examples:** https://github.com/maestro/mcp-accessibility-examples

---

**Status:** ✅ **Production Ready**  
**Versão:** v1.0.0  
**Última atualização:** 30/01/2026  

---

*Este guia está em constante evolução. Contribuições são bem-vindas!*